import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { getMatchHistoryByUser, getPlayerStats } from './game.service'
import { getUserByEmail } from '../user/user.service'

interface GetMatchHistoryParams {
  email: string
}

interface GetPlayerStatsParams {
  email: string
}

export async function gameRoutes(fastify: FastifyInstance) {
  // Get match history for a user
  fastify.get<{ Querystring: GetMatchHistoryParams }>(
    '/match-history',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' }
          },
          required: ['email']
        }
      }
    },
    async (request: FastifyRequest<{ Querystring: GetMatchHistoryParams }>, reply: FastifyReply) => {
      try {
        const { email } = request.query
        
        // Verify user exists
        const user = await getUserByEmail(email)
        if (!user) {
          return reply.status(404).send({ error: 'User not found' })
        }
        
        const matchHistory = await getMatchHistoryByUser(email, 50)
        
        return reply.send({
          success: true,
          data: matchHistory
        })
      } catch (error) {
        console.error('Error fetching match history:', error)
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  // Get player statistics
  fastify.get<{ Querystring: GetPlayerStatsParams }>(
    '/player-stats',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' }
          },
          required: ['email']
        }
      }
    },
    async (request: FastifyRequest<{ Querystring: GetPlayerStatsParams }>, reply: FastifyReply) => {
      try {
        const { email } = request.query
        
        // Verify user exists
        const user = await getUserByEmail(email)
        if (!user) {
          return reply.status(404).send({ error: 'User not found' })
        }
        
        const stats = await getPlayerStats(email)
        
        return reply.send({
          success: true,
          data: stats
        })
      } catch (error) {
        console.error('Error fetching player stats:', error)
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )
} 