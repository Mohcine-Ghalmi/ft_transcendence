import type { FastifyInstance } from 'fastify'
import { getFriends, getMessages, hostImages } from './chat.controller'

async function chatRoutes(server: FastifyInstance) {
  server.get('/getFriends', { preHandler: server.authenticate }, getFriends)
  server.get('/:id/:offset', { preHandler: server.authenticate }, getMessages)
  server.post('/postImage', hostImages) // this should not be public sleeps why tf you want the user to give his fking profile picture in the sign up just add this after { preHandler: server.authenticate },
}

export default chatRoutes
