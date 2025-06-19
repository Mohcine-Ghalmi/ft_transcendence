import type { FastifyInstance } from 'fastify'
import { sendEmail } from './mail.controller'
import { sendEmailBody } from './mail.schema'
import { $ref } from '../user/user.schema'

async function mailRoutes(server: FastifyInstance) {
  server.post(
    '/verification',
    { schema: { body: $ref('sendEmailBody') } },
    sendEmail
  )
}

export default mailRoutes
