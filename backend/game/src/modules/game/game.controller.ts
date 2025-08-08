import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { getMatchHistoryByUser, getPlayerStats } from './game.service'
import { getUserByEmail } from '../user/user.service'

interface GetMatchHistoryParams {
  email: string
}

interface GetPlayerStatsParams {
  email: string
}

interface GetTournamentParticipantParams {
  email: string
}

export async function gameRoutes(fastify: FastifyInstance) {
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
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

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
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )

  fastify.get<{ Querystring: GetTournamentParticipantParams }>(
    '/tournament-participant',
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
    async (request: FastifyRequest<{ Querystring: GetTournamentParticipantParams }>, reply: FastifyReply) => {
      try {
        const { email } = request.query

        const user = await getUserByEmail(email)
        if (!user) {
          return reply.status(404).send({ error: 'User not found' })
        }
        const typedUser = user as {
          id: number | string
          email: string
          username: string
          login?: string
          avatar?: string
        }
        return reply.send({
          success: true,
          data: {
            id: typedUser.id,
            email: typedUser.email,
            username: typedUser.username,
            login: typedUser.login,
            avatar: typedUser.avatar,
            nickname: typedUser.login || typedUser.username,
            name: typedUser.username
          }
        })
      } catch (error) {
        return reply.status(500).send({ error: 'Internal server error' })
      }
    }
  )
}