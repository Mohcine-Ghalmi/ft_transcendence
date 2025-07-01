import QRCode from 'qrcode'
import speakeasy from 'speakeasy'
import { FastifyInstance, FastifyRequest, type FastifyReply } from 'fastify'
import { db } from '../../app'
import { getUserByEmail } from './user.service'
import { signJWT } from './user.login'

export async function setTwoFASecret(
  id: number,
  secret: string,
  status: number
) {
  try {
    const stmt = db.prepare(
      'UPDATE User SET isTwoFAVerified = ? ,twoFASecret = ? WHERE id = ?'
    )
    stmt.run(status, secret, id)
  } catch (error) {
    console.error('Error updating two-factor authentication secret:', error)
  }
}

async function handleQRCodeGenerator(req: FastifyRequest, rep: FastifyReply) {
  try {
    const { id }: any = req.user
    const secret = speakeasy.generateSecret({
      name: 'ft_transcendence',
    })
    if (!secret.otpauth_url) {
      return rep.status(500).send({ error: 'OTP Auth URL not generated' })
    }
    const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url)
    if (!qrCodeDataURL) {
      return rep.status(500).send({ error: 'Failed to generate QR code' })
    }

    return rep.send({
      secret: secret.base32,
      qrCode: qrCodeDataURL,
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    return rep.status(500).send({ error: 'Failed to generate QR code' })
  }
}

async function verifyTwoFaLogin(
  req: FastifyRequest<{ Body: { token: string; email: string } }>,
  rep: FastifyReply
) {
  try {
    const { token, email } = req.body

    if (!token || !email) {
      return rep.status(200).send({ error: 'Token and email are required' })
    }

    const user: any = await getUserByEmail(email)
    if (!user) {
      return rep.status(200).send({ error: 'User not found' })
    }

    if (!user.twoFASecret) {
      return rep
        .status(200)
        .send({ error: 'Two-factor authentication not set up' })
    }
    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token,
      window: 2,
    })
    if (!verified) {
      return rep
        .status(401)
        .send({ error: 'Invalid two-factor authentication token' })
    }

    const { password, salt, ...rest } = user

    const accessToken = signJWT(rest, rep)
    return rep.code(200).send({ ...rest, accessToken })
  } catch (err) {
    console.error('Error in verifyTwoFaLogin:', err)
    return rep.status(500).send({ error: 'Internal server error' })
  }
}

async function verifiedTwoFA(
  req: FastifyRequest<{ Body: { secret: string; token: string } }>,
  rep: FastifyReply
) {
  try {
    const { secret, token } = req.body
    const { id }: any = req.user

    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2,
    })
    if (verified) {
      await setTwoFASecret(id, secret, 1)
    }
    return rep.send({ verified })
  } catch (error) {
    console.error('Error verifying two-factor authentication:', error)
    return rep
      .status(500)
      .send({ error: 'Failed to verify two-factor authentication' })
  }
}

async function disableQRCode(req: FastifyRequest, rep: FastifyReply) {
  try {
    const { id }: any = req.user
    await setTwoFASecret(id, '', 0)
    return rep.send({ success: true })
  } catch (error) {
    console.error('Error disabling two-factor authentication:', error)
    return rep
      .status(500)
      .send({ error: 'Failed to disable two-factor authentication' })
  }
}

export async function twoFARoutes(server: FastifyInstance) {
  server.get(
    '/generateQRCode',
    { preHandler: [server.authenticate] },
    handleQRCodeGenerator
  )

  server.post('/verifyTwoFaLogin', verifyTwoFaLogin)

  server.post(
    '/verifyQRCode',
    { preHandler: server.authenticate },
    verifiedTwoFA
  )

  server.post(
    '/disableQRCode',
    { preHandler: server.authenticate },
    disableQRCode
  )
}
