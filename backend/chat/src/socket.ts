import { Server } from 'socket.io'
import { FastifyInstance } from 'fastify'
import redis from './database/redis'
import { setupChatNamespace } from './module/chat/chat.socket'
import { createAdapter } from '@socket.io/redis-adapter'

let io: Server

export async function cleanupStaleSocketsOnStartup() {
  try {
    const redisChatKeys = await redis.keys('chat:*')

    for (const key of redisChatKeys) {
      await redis.del(key)
    }
  } catch (error) {
    console.error('Error cleaning up stale sockets and game rooms:', error)
  }
}

export async function setupSocketIO(server: FastifyInstance) {
  const subClient = redis.duplicate()

  io = new Server(server.server, {
    cors: {
      origin: [process.env.FRONT_END_URL as string],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })
  subClient.on('connect', () => console.log('Redis subClient connected'))

  io.adapter(createAdapter(redis, subClient))
  io.adapter(createAdapter(redis, subClient))
  const chatNamespace = io.of('/chat')
  setupChatNamespace(chatNamespace)
}

export { io }
