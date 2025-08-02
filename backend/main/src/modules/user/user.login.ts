//${process.env.FRONT_END_URL}/dashboardapi/auth/callback/42-school
import type { FastifyReply, FastifyRequest } from 'fastify'
import server from '../../app'
import type { CreateUserInput, LoginInput } from './user.schema'
import { createUser, getUserByEmail } from './user.service'
import { verifyPassword } from '../../utils/hash'
import crypto from 'crypto'
import path from 'path'
import axios from 'axios'
import fs from 'fs'

export const generateUniqueFilename = (originalFilename: string) => {
  const timestamp = Date.now()
  const randomString = crypto.randomBytes(8).toString('hex')
  const extension = path.extname(originalFilename) || '.png'
  return `${timestamp}-${randomString}${extension}`
}
export async function downloadAndSaveImage(imageUrl: string, filename: string) {
  const response = await axios.get(imageUrl, { responseType: 'stream' })
  const filepath = path.join(__dirname, '../../../../uploads', filename)

  const writer = fs.createWriteStream(filepath)
  response.data.pipe(writer)

  return new Promise((resolve: any, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

// {
//   id: '116279595096157558841',
//   email: 'cbamiixsimo@gmail.com',
//   verified_email: true,
//   name: 'med sarda',
//   given_name: 'med',
//   family_name: 'sarda',
//   picture: 'https://lh3.googleusercontent.com/a/ACg8ocJURU_hS6TmyQWN0Bhdy0ZjPb_0OZK1BJ-pipO1JHwABItAWeY3=s96-c'
// }

export const signJWT = (
  user: any,
  rep: FastifyReply,
  setCookie: boolean = true
) => {
  const payload = {
    // id: user.id,
    // email: user.email,
    // username: user.username,
    ...user,
    iat: Math.floor(Date.now() / 1000),
  }

  const accessToken = server.jwt.sign(payload, { expiresIn: '1hr' })

  if (setCookie) {
    rep.setCookie('accessToken', accessToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 1000,
    })
  }

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

    return rep.redirect(
      `${process.env.FRONT_END_URL}/dashboard?token=${accessToken}`
    )
  } catch (err: any) {
    console.log('Google OAuth error:', err.message)
    return rep.redirect(
      `${process.env.FRONT_END_URL}?error=${encodeURIComponent(err.message)}`
    )
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

    return rep.redirect(
      `${process.env.FRONT_END_URL}/dashboard?token=${accessToken}`
    )
  } catch (err: any) {
    console.log('42 OAuth error:', err.message)
    return rep.redirect(
      `${process.env.FRONT_END_URL}?error=${encodeURIComponent(err.message)}`
    )
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
    console.log('Registering user:', body)

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
  } catch (err: any) {
    console.log(err)

    return rep
      .code(500)
      .send({ message: err.message || 'Internal server error' })
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
  server.post('/api/user-service/v2/api/users/register', registerHandler)
  server.post('/api/user-service/v2/api/users/login', loginHandler)
}
