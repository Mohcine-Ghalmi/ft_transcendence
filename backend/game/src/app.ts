import Fastify, { FastifyRequest, FastifyReply } from 'fastify'
import cors from '@fastify/cors'
import dotenv from 'dotenv'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'

import { initializeDatabase } from './database/connection'

import { cleanupStaleSocketsOnStartup, setupSocketIO } from './socket'
import { gameRoutes } from './modules/game/game.controller'

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
  export interface FastifyInstance {
    authenticate: any
  }
}

export const db = initializeDatabase()
export const tokenBlacklist = new Set<string | undefined>()

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

      // Check if token is blacklisted
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
    return { status: 'OK', timestamp: new Date().toISOString() }
  } catch (err) {
    return { status: 'ERROR', message: 'Database error' }
  }
})

async function startServer() {
  try {
    const GAME_BACK_END_PORT = process.env.GAME_BACK_END_PORT as string
    if (!GAME_BACK_END_PORT) {
      throw new Error('GAME_BACK_END_PORT environment variable is not set')
    }

    //await cleanupStaleSocketsOnStartup()

    await server.register(fastifyCookie)

    await server.register(fastifyJwt, {
      secret: process.env.JWT_SECRET || '',
    })

    await server.register(cors, {
      origin: (origin: string | undefined, cb: any) => {
        const allowedOrigins = [
          process.env.FRONT_END_URL,
          process.env.MAIN_BACKEND_URL,
          process.env.CHAT_BACKEND_URL,
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
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      exposedHeaders: ['set-cookie'],
    })

    setupSocketIO(server)

    server.register(gameRoutes, { prefix: 'api/game-service' })

    await server.listen({
      port: parseInt(GAME_BACK_END_PORT),
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
