import Redis from 'ioredis'
import server from '../app'

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '7000'),
})

redis.on('connecting', () => {
  server.log.info('Redis connected')
})

redis.on('error', (err) => {
  server.log.fatal('Error In Redis')
})

export default redis
