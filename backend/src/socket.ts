import { Server } from 'socket.io'
import { FastifyInstance } from 'fastify'
import { setupChatNamespace } from './modules/chat/chat.socket'
import redis from './utils/redis'
import { handleGameSocket } from './modules/game/game.socket'
import { getUserByEmail } from './modules/user/user.service'
import { createUserResponseSchema } from './modules/user/user.schema'
import CryptoJS from 'crypto-js'

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
  return await redis.smembers(redisKey)
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
    const redisChatKeys = await redis.keys('chat:*')
    for (const key of redisSocketsKeys) {
      await redis.del(key)
    }
    for (const key of redisChatKeys) {
      await redis.del(key)
    }
    console.log('Cleaned up stale sockets on startup')
  } catch (error) {
    console.error('Error cleaning up stale sockets:', error)
  }
}

export async function setupSocketIO(server: FastifyInstance) {
  io = new Server(server.server, {
    cors: {
      origin: [process.env.FRONT_END_URL as string],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })
  const chatNamespace = io.of('/chat')
  setupChatNamespace(chatNamespace)

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
        if (!me)
          return socket.emit('error-in-connection', {
            status: 'error',
            message: 'User not found',
          })

        addSocketId(email, socket.id, 'sockets')
        const redisKeys = await redis.keys('sockets:*')
        const onlineUsers = redisKeys.map((key) => key.split(':')[1])

        io.emit('getOnlineUsers', onlineUsers)
      }

      handleGameSocket(socket, io)

      socket.on('disconnect', async () => {
        if (userEmail) {
          const email = Array.isArray(userEmail) ? userEmail[0] : userEmail
          removeSocketId(email, socket.id, 'sockets')
          const redisKeys = await redis.keys('sockets:*')
          const onlineUsers = redisKeys.map((key) => key.split(':')[1])

          io.emit('getOnlineUsers', onlineUsers)
        }
      })
    } catch (error) {
      console.log(error)

      return socket.emit('error-in-connection', {
        status: 'error',
        message: 'An error occurred during connection',
      })
    }
  })
}

export { io }
