import { Server } from 'socket.io'
import { FastifyInstance } from 'fastify'
import redis, { addSocketId, removeSocketId } from './database/redis'
import { createAdapter } from '@socket.io/redis-adapter'
import { getIsBlocked, getUserByEmail } from './modules/user/user.service'
import { handleGameSocket } from './modules/game/game.socket'
import CryptoJS from 'crypto-js'

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
  // the game server running on :5007
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

  io.on('connection', async (socket) => {
    const key = process.env.ENCRYPTION_KEY || ''
    try {
      const cryptedMail = socket.handshake.query.cryptedMail

      const userEmail = CryptoJS.AES.decrypt(
        cryptedMail as string,
        key
      ).toString(CryptoJS.enc.Utf8)

      if (userEmail) {
        const email = Array.isArray(userEmail) ? userEmail[0] : userEmail
        const me: any = await getUserByEmail(email)
        if (!me) {
          return socket.emit('error-in-connection', {
            status: 'error',
            message: 'User not found',
          })
        }

        addSocketId(email, socket.id, 'sockets')

        // Store user email on socket for later use
        ;(socket as any).userEmail = email
        socket.data = { userEmail: email }
      }

      handleGameSocket(socket, io)

      socket.on('disconnect', async () => {
        if (userEmail) {
          const email = Array.isArray(userEmail) ? userEmail[0] : userEmail
          removeSocketId(email, socket.id, 'sockets')
        }
      })
    } catch (error) {
      return socket.emit('error-in-connection', {
        status: 'error',
        message: 'An error occurred during connection',
      })
    }
  })
}

export { io }
