import { Server } from 'socket.io'
import { FastifyInstance } from 'fastify'
import redis from './utils/redis'
import { getUserByEmail } from './modules/user/user.service'
import { createUserResponseSchema } from './modules/user/user.schema'
import CryptoJS from 'crypto-js'
import { getIsBlocked, setupUserSocket } from './modules/user/user.socket'
import { setupFriendsSocket } from './modules/friends/friends.socket'

let io: Server

export async function addSocketId(
  userEmail: string,
  socketId: string,
  sockets: string
) {
  const redisKey = `${sockets}:${userEmail}`
  await redis.sadd(redisKey, socketId)
  await redis.expire(redisKey, 86400)
}

export async function getSocketIds(
  userEmail: string,
  sockets: string
): Promise<string[]> {
  const redisKey = `${sockets}:${userEmail}`
  const socketIds = await redis.smembers(redisKey)
  return socketIds
}

export async function removeSocketId(
  userEmail: string,
  socketId: string,
  sockets: string
) {
  const redisKey = `${sockets}:${userEmail}`
  await redis.srem(redisKey, socketId)
  const remaining = await redis.scard(redisKey)
  if (remaining === 0) await redis.del(redisKey)
}

export async function cleanupStaleSocketsOnStartup() {
  try {
    const redisSocketsKeys = await redis.keys('sockets:*')
    const redisGameKeys = await redis.keys('game_room:*')

    for (const key of redisSocketsKeys) {
      await redis.del(key)
    }

    for (const key of redisGameKeys) {
      await redis.del(key)
    }

    console.log(
      `Cleaned up ${redisSocketsKeys.length} socket keys and ${redisGameKeys.length} game rooms on startup`
    )
  } catch (error) {
    console.error('Error cleaning up stale sockets and game rooms:', error)
  }
}

import { createAdapter } from '@socket.io/redis-adapter'

export async function setupSocketIO(server: FastifyInstance) {
  // the main server running on :5005
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
        const me: typeof createUserResponseSchema = await getUserByEmail(email)
        if (!me) {
          console.log('User not found for email:', email)
          return socket.emit('error-in-connection', {
            status: 'error',
            message: 'User not found',
          })
        }

        console.log('User authenticated:', {
          email,
          username: (me as any).username,
        })
        addSocketId(email, socket.id, 'sockets')

        // Store user email on socket for later use
        ;(socket as any).userEmail = email
        socket.data = { userEmail: email }

        const redisKeys = await redis.keys('sockets:*')

        const onlineUsers = redisKeys.map((key) => key.split(':')[1])
        console.log('Online users:', onlineUsers)
        io.emit('getOnlineUsers', onlineUsers)
        socket.emit('BlockedList', getIsBlocked(userEmail))
      }

      setupUserSocket(socket, io)
      setupFriendsSocket(socket, io)
      // handleGameSocket(socket, io)

      socket.on('disconnect', async () => {
        console.log('Socket disconnected:', { socketId: socket.id, userEmail })
        if (userEmail) {
          const email = Array.isArray(userEmail) ? userEmail[0] : userEmail
          removeSocketId(email, socket.id, 'sockets')
          const redisKeys = await redis.keys('sockets:*')
          const onlineUsers = redisKeys.map((key) => key.split(':')[1])

          io.emit('getOnlineUsers', onlineUsers)
        }
      })
    } catch (error) {
      console.log('Socket connection error:', error)

      return socket.emit('error-in-connection', {
        status: 'error',
        message: 'An error occurred during connection',
      })
    }
  })
}

export { io }
