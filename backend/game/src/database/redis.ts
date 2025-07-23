import Redis from 'ioredis'
import server from '../app'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '7001'),
  enableReadyCheck: false,
  maxRetriesPerRequest: 10,
  lazyConnect: true,
  connectTimeout: 10000,
  commandTimeout: 5000,
})

redis.on('connect', () => {
  server.log.info('Redis connecting...')
})

redis.on('ready', () => {
  server.log.info('Redis connected successfully')
})

redis.on('error', (err) => {
  server.log.error('Redis connection error:', err.message)
})

redis.on('close', () => {
  server.log.info('Redis connection closed')
})

redis.on('reconnecting', () => {
  server.log.info('Redis reconnecting...')
})

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

export default redis
