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

async function checkSocketConnection(socket: any) {
  if (!socket || !socket.handshake || !socket.handshake.query) {
    return null
  }
  const key = process.env.ENCRYPTION_KEY || ''
  if (!key) {
    socket.emit('error-in-connection', {
      status: 'error',
      message: 'ENCRYPTION_KEY is not set in environment variables',
    })
    socket.disconnect(true)
    return null
  }
  let userEmail: string = ''
  try {
    const cryptedMail = socket.handshake.query.cryptedMail

    userEmail = CryptoJS.AES.decrypt(cryptedMail as string, key).toString(
      CryptoJS.enc.Utf8
    )
    if (!userEmail) {
      socket.emit('error-in-connection', {
        status: 'error',
        message: 'Invalid email format',
      })
      socket.disconnect(true)
      return null
    }
    const me = await getUserByEmail(userEmail)

    if (!me) {
      socket.emit('error-in-connection', {
        status: 'error',
        message: 'User not found',
      })
      socket.disconnect(true)
      return null
    }
    return me
  } catch (err) {
    socket.emit('error-in-connection', {
      status: 'error',
      message: 'Invalid email format',
    })
    socket.disconnect(true)
    return null
  }
}

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
    try {
      const me: any | null = await checkSocketConnection(socket)

      if (!me) return
      console.log('User connected:', me)

      addSocketId(me.email, socket.id, 'sockets')

      const redisKeys = await redis.keys('sockets:*')

      const onlineUsers = redisKeys.map((key) => key.split(':')[1])
      io.emit('getOnlineUsers', onlineUsers)
      socket.emit('BlockedList', getIsBlocked(me.email))

      setupUserSocket(socket, io)
      setupFriendsSocket(socket, io)

      socket.on('disconnect', async () => {
        if (me.email) {
          removeSocketId(me.email, socket.id, 'sockets')
          const redisKeys = await redis.keys('sockets:*')
          const onlineUsers = redisKeys.map((key) => key.split(':')[1])

          io.emit('getOnlineUsers', onlineUsers)
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
