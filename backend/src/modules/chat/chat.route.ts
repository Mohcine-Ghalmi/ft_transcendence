import type { FastifyInstance } from 'fastify'
import { getFriends, getMessages, hostImages } from './chat.controller'

async function chatRoutes(server: FastifyInstance) {
  server.get('/getFriends', { preHandler: server.authenticate }, getFriends)
  server.get('/:id/:offset', { preHandler: server.authenticate }, getMessages)
  server.post('/postImage', { preHandler: server.authenticate }, hostImages)
}

export default chatRoutes
