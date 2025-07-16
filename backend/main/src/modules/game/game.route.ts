import { FastifyInstance } from 'fastify'
import { gameRoutes } from './game.controller'

export async function gameRoute(fastify: FastifyInstance) {
  fastify.register(gameRoutes, { prefix: '/api/game' })
}

export default gameRoute 