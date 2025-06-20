'use strict'
import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify'
import path, { parse } from 'path'
import fs from 'fs'
import dotenv from 'dotenv'

import userRoutes from './modules/user/user.route'
import chatRoutes from './modules/chat/chat.route'
import mailRoutes from './modules/Mail/mail.route'

import { userSchemas } from './modules/user/user.schema'

import {
  addFriendById,
  getFriend_r,
  getUserByEmail,
} from './modules/user/user.service'

import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'

const fastifyMultipart = require('@fastify/multipart')
const fastifyStatic = require('@fastify/static')
const fastifyMailer = require('fastify-mailer')

import { cleanupStaleSocketsOnStartup, setupSocketIO } from './socket'
import { initializeDatabase } from './database/connection'

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
        hideObject: true, //set to false in development
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

  await server.register(cors, {
    origin: process.env.FRONT_END_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ['set-cookie'],
  })

  await server.register(fastifyMultipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  })

  await server.register(fastifyStatic, {
    root: path.join(__dirname, 'uploads'),
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
      const authHeader = req.headers['authorization']
      if (!authHeader) {
        return rep.code(401).send({ message: 'No token provided' })
      }

      const token = authHeader.split(' ')[1]

      if (tokenBlacklist.has(token)) {
        return rep.code(401).send({ message: 'Invalid or expired token' })
      }

      req.headers['authorization'] = `Bearer ${token}`

      const user: any = await req.jwtVerify()
      const dbUser = await getUserByEmail(user.email)

      if (!dbUser) {
        return rep.code(401).send({ message: 'User Not Found', status: false })
      }

      if (user?.exp < (new Date().getTime() + 1) / 1000) {
        return rep.code(401).send({ message: 'Invalid or expired token' })
      }
    } catch (err) {
      return rep.code(401).send({ message: 'Invalid or expired token' })
    }
  }
)

server.get('/healthcheck', async function () {
  try {
    const userQuery = db.prepare('SELECT * FROM User')
    const messageQuery = db.prepare('SELECT * FROM Messages')
    const friendQuery = db.prepare('SELECT * FROM Friends')

    // addFriendById(1, 2)
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

  server.register(userRoutes, { prefix: 'api/users' })
  server.register(mailRoutes, { prefix: 'api/mail' })
  server.register(chatRoutes, { prefix: 'api/chat' })
}

async function startServer() {
  try {
    await registerPlugins()

    await registerRoutes()

    await cleanupStaleSocketsOnStartup()

    await server.listen({
      port: parseInt(process.env.BACK_END_PORT || '5005'),
      host: '0.0.0.0',
    })

    setupSocketIO(server)
  } catch (error) {
    server.log.error(error)
    process.exit(1)
  }
}

startServer().catch(console.error)

export default server
