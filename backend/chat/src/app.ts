import Fastify, { FastifyRequest, FastifyReply } from 'fastify'
import cors from '@fastify/cors'
import dotenv from 'dotenv'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import path from 'path'

const fastifyMultipart = require('@fastify/multipart')
const fastifyStatic = require('@fastify/static')

import { initializeDatabase } from './database/connection'
import chatRoutes from './module/chat/chat.route'
import { cleanupStaleSocketsOnStartup, setupSocketIO } from './socket'

dotenv.config()
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

async function startServer() {
  try {
    const CHAT_BACK_END_PORT = process.env.CHAT_BACK_END_PORT as string
    if (!CHAT_BACK_END_PORT) {
      throw new Error('CHAT_BACK_END_PORT environment variable is not set')
    }

    await cleanupStaleSocketsOnStartup()

    await server.register(fastifyCookie)

    await server.register(fastifyJwt, {
      secret: process.env.JWT_SECRET || '',
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

    await server.register(cors, {
      origin: process.env.FRONT_END_URL,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      exposedHeaders: ['set-cookie'],
    })

    await server.register(chatRoutes, { prefix: 'api/chat' })

    setupSocketIO(server)

    console.log('process.cwd() : ', process.cwd())

    await server.listen({
      port: parseInt(CHAT_BACK_END_PORT),
      host: '0.0.0.0',
    })
  } catch (error) {
    server.log.error(error)
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer().catch(console.error)

export default server
