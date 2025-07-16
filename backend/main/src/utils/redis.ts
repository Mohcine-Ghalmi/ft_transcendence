import Redis from 'ioredis'
import server from '../app'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '7001'),
  enableReadyCheck: false,
  maxRetriesPerRequest: 3,
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

export default redis
