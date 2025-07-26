'use strict'
import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify'
import path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'

import userRoutes from './modules/user/user.route'
import mailRoutes from './modules/Mail/mail.route'

import { userSchemas } from './modules/user/user.schema'

import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import fastifyOauth2 from '@fastify/oauth2'

const fastifyMultipart = require('@fastify/multipart')
const fastifyStatic = require('@fastify/static')
const fastifyMailer = require('fastify-mailer')

import { cleanupStaleSocketsOnStartup, setupSocketIO } from './socket'
import { initializeDatabase } from './database/connection'
import { twoFARoutes } from './modules/user/user.2fa'
import { loginRouter } from './modules/user/user.login'

dotenv.config()

const uploadsDir = path.join(`${__dirname}`, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

export const server = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        singleLine: false,
        hideObject: true,
      },
    },
  },
})

declare module 'fastify' {
  interface FastifyRequest {
    isMultipart(): boolean
    file(): Promise<{
      field: string
      filename: string
      encoding: string
      mimetype: string
      file: NodeJS.ReadableStream
      fields: Record<string, string | string[]>
    }>
    files(): AsyncIterableIterator<{
      field: string
      filename: string
      encoding: string
      mimetype: string
      file: NodeJS.ReadableStream
      fields: Record<string, string | string[]>
    }>
    saveRequestFiles(options?: {
      tmpdir?: string
      limits?: {
        fieldNameSize?: number
        fieldSize?: number
        fields?: number
        fileSize?: number
        files?: number
        parts?: number
        headerPairs?: number
      }
    }): Promise<
      Record<
        string,
        {
          data: Buffer
          filename: string
          encoding: string
          mimetype: string
          limit: boolean
        }[]
      >
    >
  }
  export interface FastifyInstance {
    authenticate: any
    mailer: {
      sendMail: (mailOptions: any) => Promise<any>
    }
  }
}

export const db = initializeDatabase()

export const tokenBlacklist = new Set<string | undefined>()

async function registerPlugins() {
  await server.register(fastifyCookie)

  await server.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || '',
  })

  await server.register(require('@fastify/cors'), {
    origin: (origin: string | undefined, cb: any) => {
      const allowedOrigins = [
        process.env.FRONT_END_URL,
        process.env.CHAT_BACKEND_URL,
        process.env.GAME_BACKEND_URL,
        'http://nginx',
        'https://nginx',
        'http://frontend:3000',
      ].filter(Boolean) as string[]

      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true)
      } else {
        cb(new Error('Not allowed'), false)
      }
    },
    credentials: true,
  })

  await server.register(fastifyMultipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  })

  await server.register(fastifyStatic, {
    root: path.resolve(process.cwd(), '../uploads'),
    prefix: '/images/',
    decorateReply: false,
  })

  await server.register(fastifyMailer, {
    defaults: { from: process.env.GOOGLE_FROM },
    transport: {
      host: process.env.GOOGLE_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.GOOGLE_USER,
        pass: process.env.GOOGLE_PASS,
      },
    },
  })
  await server.register(fastifyOauth2, {
    name: 'ftOAuth2',
    scope: ['public'],
    credentials: {
      client: {
        id: process.env.FORTY_TWO_CLIENT_ID as string,
        secret: process.env.FORTY_TWO_CLIENT_SECRET as string,
      },
      auth: {
        authorizeHost: 'https://api.intra.42.fr',
        authorizePath: '/oauth/authorize',
        tokenHost: 'https://api.intra.42.fr',
        tokenPath: '/oauth/token',
      },
    },
    startRedirectPath: '/login/42',
    callbackUri: 'https://localhost/api/user-service/login/42/callback',
  })
  await server.register(fastifyOauth2, {
    name: 'googleOAuth2',
    scope: ['profile', 'email'],
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID as string,
        secret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
      auth: fastifyOauth2.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: '/login/google',
    callbackUri: 'https://localhost/api/user-service/login/google/callback',
  })

  await server.register(rateLimit, {
    global: true,
    max: 1000,
    timeWindow: '1 minute',
    ban: 2,
    keyGenerator: (req) => req.ip,
  })
}

server.decorate(
  'authenticate',
  async (req: FastifyRequest, rep: FastifyReply) => {
    try {
      let token = req.cookies.accessToken

      if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization
        if (authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7)
        }
      }

      if (!token) {
        return rep.code(401).send({
          error: 'Authentication required',
          message: 'No token provided',
        })
      }

      if (tokenBlacklist.has(token)) {
        rep.clearCookie('accessToken')
        return rep.code(401).send({
          error: 'Token revoked',
          message: 'This token has been invalidated',
        })
      }

      const decoded = server.jwt.verify(token)

      req.user = decoded
    } catch (err: any) {
      rep.clearCookie('accessToken')

      return rep.code(401).send({
        error: 'Invalid token',
        message: err.message,
      })
    }
  }
)

server.get('/healthcheck', async function () {
  try {
    const userQuery = db.prepare('SELECT * FROM User')
    const messageQuery = db.prepare('SELECT * FROM Messages')
    const friendQuery = db.prepare('SELECT * FROM Friends')

    const users = userQuery.all()
    const messages = messageQuery.all()
    const friends = friendQuery.all()

    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      data: {
        users: users,
        messages: messages,
        friends: friends,
      },
    }
  } catch (error) {
    server.log.error(error)
    return { status: 'ERROR', message: 'Database error' }
  }
})

async function registerRoutes() {
  for (const schema of userSchemas) {
    server.addSchema(schema)
  }

  server.register(userRoutes, { prefix: 'api/user-service/users' })
  server.register(mailRoutes, { prefix: 'api/user-service/mail' })
  server.register(twoFARoutes, { prefix: 'api/user-service/2fa' })
  server.register(loginRouter)
}

async function startServer() {
  try {
    const BACK_END_PORT = process.env.BACK_END_PORT as string
    if (!BACK_END_PORT) {
      console.error('BACK_END_PORT environment variable is not set.')
      process.exit(1)
    }
    await registerPlugins()

    await registerRoutes()

    //await cleanupStaleSocketsOnStartup()

    await server.listen({
      port: parseInt(BACK_END_PORT),
      host: '0.0.0.0',
    })

    setupSocketIO(server)
  } catch (error) {
    server.log.error(error)
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer().catch(console.error)

export default server
