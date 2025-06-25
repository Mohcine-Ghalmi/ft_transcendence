import { Server } from 'socket.io'
import { FastifyInstance } from 'fastify'
import { setupChatNamespace } from './modules/chat/chat.socket'
import redis from './utils/redis'
import { handleGameSocket } from './modules/game/game.socket'
import { getUserByEmail } from './modules/user/user.service'
import { createUserResponseSchema } from './modules/user/user.schema'
import CryptoJS from 'crypto-js'
import { getIsBlocked, setupUserSocket } from './modules/user/user.socket'
import { setupFriendsSocket } from './modules/friends/friends.socket'
import { matchmakingQueue, removeFromQueueByEmail } from './modules/game/game.socket.types'

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
  // console.log('Getting socket IDs for:', { userEmail, redisKey, socketIds })
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
    const redisChatKeys = await redis.keys('chat:*')
    const redisGameKeys = await redis.keys('game_room:*')
    
    // Clean up all socket data on startup
    for (const key of redisSocketsKeys) {
      await redis.del(key)
    }
    for (const key of redisChatKeys) {
      await redis.del(key)
    }
    
    // Clean up ALL game rooms on startup to ensure clean state
    for (const key of redisGameKeys) {
      await redis.del(key)
    }
    
    console.log(`Cleaned up ${redisSocketsKeys.length} socket keys, ${redisChatKeys.length} chat keys, and ${redisGameKeys.length} game rooms on startup`)
  } catch (error) {
    console.error('Error cleaning up stale sockets and game rooms:', error)
  }
}

// Periodic cleanup function
async function periodicCleanup() {
  try {
    console.log('Running periodic cleanup...')
    
    // Clean up stale game rooms
    const redisGameKeys = await redis.keys('game_room:*')
    let cleanedGameRooms = 0
    
    for (const key of redisGameKeys) {
      try {
        const gameRoomData = await redis.get(key)
        if (gameRoomData) {
          const gameRoom = JSON.parse(gameRoomData)
          const gameAge = Date.now() - gameRoom.createdAt
          
          // Remove game rooms older than 10 minutes or with completed/canceled status
          if (gameAge > 600000 || gameRoom.status === 'completed' || gameRoom.status === 'canceled') {
            await redis.del(key)
            cleanedGameRooms++
          }
        }
      } catch (parseError) {
        // If we can't parse the game room data, it's corrupted, so delete it
        await redis.del(key)
        cleanedGameRooms++
      }
    }
    
    // Clean up stale matchmaking queue entries (older than 5 minutes)
    const now = Date.now()
    const stalePlayers = matchmakingQueue.filter(player => now - player.joinedAt > 300000) // 5 minutes
    
    for (const player of stalePlayers) {
      removeFromQueueByEmail(player.email)
      console.log(`Removed stale player ${player.email} from matchmaking queue`)
    }
    
    if (cleanedGameRooms > 0 || stalePlayers.length > 0) {
      console.log(`Periodic cleanup: Removed ${cleanedGameRooms} stale game rooms and ${stalePlayers.length} stale queue entries`)
    }
    
  } catch (error) {
    console.error('Error during periodic cleanup:', error)
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

  // Start periodic cleanup every 2 minutes
  setInterval(periodicCleanup, 120000) // 2 minutes

  io.on('connection', async (socket) => {
    const key = process.env.ENCRYPTION_KEY || ''
    try {
      const cryptedMail = socket.handshake.query.cryptedMail

      const userEmail = CryptoJS.AES.decrypt(
        cryptedMail as string,
        key
      ).toString(CryptoJS.enc.Utf8)

      // console.log('Socket connected:', { socketId: socket.id, userEmail })

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
        
        const redisKeys = await redis.keys('sockets:*')

        const onlineUsers = redisKeys.map((key) => key.split(':')[1])
        console.log('Online users:', onlineUsers)
        io.emit('getOnlineUsers', onlineUsers)
        socket.emit('BlockedList', getIsBlocked(userEmail))
      }

      setupUserSocket(socket, io)
      setupFriendsSocket(socket, io)
      handleGameSocket(socket, io)

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

