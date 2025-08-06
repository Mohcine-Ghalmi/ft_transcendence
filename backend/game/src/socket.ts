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
    try {
      const me: any | null = await checkSocketConnection(socket)

      if (!me) return

      addSocketId(me.email, socket.id, 'sockets')
      ;(socket as any).userEmail = me.email
      socket.data = { userEmail: me.email }

      handleGameSocket(socket, io)

      socket.on('disconnect', async () => {
        if (me.userEmail) {
          await removeSocketId(me.email, socket.id, 'sockets')
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
