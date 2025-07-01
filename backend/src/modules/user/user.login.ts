//${process.env.FRONT_END_URL}/dashboardapi/auth/callback/42-school
import type { FastifyReply, FastifyRequest } from 'fastify'
import server from '../../app'
import type { CreateUserInput, LoginInput } from './user.schema'
import { createUser, getUserByEmail } from './user.service'
import { verifyPassword } from '../../utils/hash'
import { sign } from 'crypto'
import {
  downloadAndSaveImage,
  generateUniqueFilename,
} from '../chat/chat.controller'

// {
//   id: '116279595096157558841',
//   email: 'cbamiixsimo@gmail.com',
//   verified_email: true,
//   name: 'med sarda',
//   given_name: 'med',
//   family_name: 'sarda',
//   picture: 'https://lh3.googleusercontent.com/a/ACg8ocJURU_hS6TmyQWN0Bhdy0ZjPb_0OZK1BJ-pipO1JHwABItAWeY3=s96-c'
// }

export const signJWT = (user: any, rep: FastifyReply) => {
  const accessToken = server.jwt.sign(user, { expiresIn: '1d' })
  rep.setCookie('accessToken', accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
    domain: 'localhost',
    maxAge: 60 * 60 * 24,
  })
  return accessToken
}

async function googleRegister(req: FastifyRequest, rep: FastifyReply) {
  try {
    const result = await (
      server as any
    ).googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req)

    if (!result || !result.token) {
      return rep.code(400).send({ error: 'Failed to get access token' })
    }

    const { token } = result

    const userInfoRes = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    )

    if (!userInfoRes.ok) {
      throw new Error(`Failed to fetch user info: ${userInfoRes.status}`)
    }

    const user = await userInfoRes.json()
    const { given_name, family_name, picture, email, name } = user
    let existingUser = await getUserByEmail(email)
    if (!existingUser) {
      const fileName = generateUniqueFilename(picture)
      await downloadAndSaveImage(picture, fileName)

      existingUser = await createUser({
        email: email,
        username: name || `${given_name} ${family_name}`,
        avatar: fileName || 'default.avif',
        type: 1,
        password: '',
        login: '',
        resetOtp: '',
        resetOtpExpireAt: '',
        level: 0,
        xp: 0,
      })
    }
    const { password, salt, ...userWithoutPassword } = existingUser as any
    const accessToken = signJWT(userWithoutPassword, rep)
    return rep.redirect(`${process.env.FRONT_END_URL}/dashboard`)
  } catch (err: any) {
    console.log('Google OAuth error:', err)
    return rep.redirect(
      `${process.env.FRONT_END_URL}?error=${encodeURIComponent(err.message)}`
    )
    // return rep.code(500).send({
    //   error: 'Authentication failed',
    //   message: err?.message || 'An error occurred during Google login',
    // })
  }
}

export async function fortyTwoRegister(req: FastifyRequest, rep: FastifyReply) {
  try {
    const result = await (
      server as any
    ).ftOAuth2.getAccessTokenFromAuthorizationCodeFlow(req)
    const { token } = result

    // Fetch user info from 42 API
    const userInfoRes = await fetch('https://api.intra.42.fr/v2/me', {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    })

    const user = await userInfoRes.json()
    const { email, login, first_name, last_name, usual_full_name, image } = user
    let existingUser = await getUserByEmail(email)
    if (!existingUser) {
      const fileName = generateUniqueFilename(image?.link)
      await downloadAndSaveImage(image?.link, fileName)
      existingUser = await createUser({
        email: email,
        username: usual_full_name || `${first_name} ${last_name}`,
        avatar: fileName || 'default.avif',
        type: 2,
        password: '',
        login: login || '',
        resetOtp: '',
        resetOtpExpireAt: '',
        level: 0,
        xp: 0,
      })
    }
    const { password, salt, ...userWithoutPassword } = existingUser as any
    const accessToken = signJWT(userWithoutPassword, rep)
    return rep.redirect(`${process.env.FRONT_END_URL}/dashboard`)
  } catch (err: any) {
    console.log('42 OAuth error:', err)
    return rep.code(500).send({
      error: 'Authentication failed',
      message: err?.message || 'An error occurred during 42 login',
    })
  }
}

export async function registerHandler(
  req: FastifyRequest<{
    Body: CreateUserInput
  }>,
  rep: FastifyReply
) {
  try {
    const body = req.body

    const newUser = await getUserByEmail(body.email)
    if (newUser)
      return rep
        .code(404)
        .send({ status: false, message: 'User Already exists' })

    if (!body.avatar) body.avatar = 'default.avif'
    const user = await createUser(body)
    const { password, salt, ...tmp } = user as any
    const accessToken = signJWT(tmp, rep)
    return rep.code(201).send({ ...tmp, accessToken })
  } catch (err: unknown) {
    console.log(err)

    return rep.code(500).send({ message: 'Internal server error' })
  }
}

export async function loginHandler(
  req: FastifyRequest<{ Body: LoginInput }>,
  rep: FastifyReply
) {
  const body = req.body

  const user: any = await getUserByEmail(body.email)
  if (!user) {
    return rep.code(401).send({ message: 'Invalid Email or password' })
  }

  if (user.type !== 0 && user.type !== null)
    return rep
      .code(401)
      .send({ message: 'This Email is signed in with another method' })

  if (user.isTwoFAVerified) {
    return rep.code(200).send({
      status: false,
      message: 'Please verify your 2FA code first',
      desc: '2FA verification required',
    })
  }
  const correctPassword = verifyPassword(
    body.password,
    user.salt,
    user.password
  )

  if (correctPassword) {
    const { password, salt, ...rest } = user

    const accessToken = signJWT(rest, rep)
    return rep.code(200).send({ ...rest, accessToken, status: true })
  }

  return rep.code(401).send({ message: 'Invalid Email or password' })
}

export async function loginRouter() {
  server.get('/login/google/callback', googleRegister)
  server.get('/login/42/callback', fortyTwoRegister)
  server.post('/v2/api/users/register', registerHandler)
  server.post('/v2/api/users/login', loginHandler)
}
