import { FastifyReply, FastifyRequest } from 'fastify'
import { server } from '../../app'
import { sendEmailBodyType } from './mail.schema'

// subject: 'Subject: Welcome to ft_transcendence – Let’s Play!',
//       text: "Welcome to ft_transcendence! We're thrilled to have you on board. Get ready to dive into exciting matches, challenge other   players, and climb the ranks.\nFeel free to explore, customize your profile, and start playing right away. If you have any questions or need help, we're here for you.\nSee you in the game!\nBest regards,\nThe ft_transcendence Team",

export async function sendEmail(
  req: FastifyRequest<{ Body: sendEmailBodyType }>,
  rep: FastifyReply
) {
  try {
    const { mailer } = server
    const { to, html, subject } = req.body

    const info = await mailer.sendMail({
      to: to,
      subject: subject,
      html: html,
    })

    return rep.send({
      status: true,
      message: 'Email successfully sent',
      info: {
        from: info.from,
        to: info.to,
      },
    })
  } catch (error) {
    return rep.code(500).send({
      status: false,
      message: 'Something went wrong',
    })
  }
}

export async function sendEmailTmp(body: sendEmailBodyType) {
  try {
    const { mailer } = server
    const { to, html, subject } = body

    const info = await mailer.sendMail({
      to: to,
      subject: subject,
      html: html,
    })

    return {
      status: true,
      message: 'Email successfully sent',
      info: {
        from: info.from,
        to: info.to,
      },
    }
  } catch (error) {
    return {
      status: false,
      message: 'Something went wrong',
    }
  }
}
