import type { FastifyInstance } from 'fastify'
import { getFriends, getMessages } from './chat.controller'

async function chatRoutes(server: FastifyInstance) {
  server.get('/getFriends', { preHandler: server.authenticate }, getFriends)
  server.get('/:id/:offset', { preHandler: server.authenticate }, getMessages)
}

export default chatRoutes
