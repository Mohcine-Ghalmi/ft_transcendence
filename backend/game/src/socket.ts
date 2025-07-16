import { Server } from 'socket.io'
import { FastifyInstance } from 'fastify'
import redis, { addSocketId, removeSocketId } from './database/redis'
import { createAdapter } from '@socket.io/redis-adapter'
import { getIsBlocked, getUserByEmail } from './modules/user/user.service'
import { handleGameSocket } from './modules/game/game.socket'

let io: Server

export async function cleanupStaleSocketsOnStartup() {
  try {
    const redisChatKeys = await redis.keys('game_room:*')

    for (const key of redisChatKeys) {
      await redis.del(key)
    }

    console.log(`Cleaned up ${redisChatKeys.length} game room keys on startup`)
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
}

export { io }
