import { FastifyReply, FastifyRequest } from 'fastify'
import {
  createUser,
  getUserByEmail,
  isBlockedStatus,
  listMyFriends,
  selectRandomFriends,
} from './user.service'
import {
  CreateUserInput,
  type LoginInput,
  type loginResponse,
  createUserResponseSchema,
} from './user.schema'
import { hashPassword, verifyPassword } from '../../utils/hash'
import { db, server } from '../../app'
import { sendEmailTmp } from '../Mail/mail.controller'
import {
  resetOtpType,
  resetPasswordType,
  sendEmailBodyType,
  OtpType,
} from '../Mail/mail.schema'
import { getIsBlocked } from './user.socket'
import { signJWT } from './user.login'

export async function registerUserHandler(
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
    const accessToken = server.jwt.sign(tmp, { expiresIn: '1d' })
    return rep.code(201).send({ ...tmp, accessToken })
  } catch (err: unknown) {
    console.log(err)

    return rep.code(500).send({ message: 'Internal server error' })
  }
}

export async function googleRegister(
  req: FastifyRequest<{
    Body: any
  }>,
  rep: FastifyReply
) {
  try {
    const apiKey = req.headers['x-api-key']

    if (apiKey !== process.env.NEXT_AUTH_KEY) {
      return rep.code(401).send({ status: false, message: 'Unauthorized' })
    }

    const user: any = req.body
    if (!user)
      return rep.code(400).send({ status: false, message: 'User not found' })
    console.log('user : ', user)

    const { password: localPassword, ...rest } = user

    const newUser: any = await getUserByEmail(rest.email)

    if (!newUser) {
      const create = { ...user, password: 'RS:2L~H*jfMWpP0' }
      await createUser(create)
    } else {
      if (newUser.type !== 1 && newUser.type !== 2)
        return rep.code(200).send({
          status: false,
          message: 'This user was logged in with another method',
        })
    }
    const googleUser: any = await getUserByEmail(user.email)
    if (!googleUser)
      return rep.code(200).send({ status: false, message: 'User not found' })

    const { password: googlePassword, salt, ...tmp } = googleUser

    const accessToken = server.jwt.sign(tmp, { expiresIn: '1d' })

    // connecetSocket()

    return rep.code(200).send({ ...tmp, accessToken })
  } catch (err) {
    console.log(err)

    return rep.code(500).send({ message: 'Internal server error' })
  }
}

export async function hasTwoFA(
  req: FastifyRequest<{ Body: { email: string } }>,
  rep: FastifyReply
) {
  try {
    const { email } = req.body
    const sql = db.prepare('SELECT isTwoFAVerified FROM User WHERE email = ?')
    const user: any = await sql.get(email)

    if (!user) {
      return rep.code(404).send({ message: 'User not found' })
    }

    return rep.code(200).send({ isTwoFAVerified: user.isTwoFAVerified })
  } catch (err) {
    console.error(err)
    return rep.code(500).send({ message: 'Internal Server Error' })
  }
}

export async function loginUserHandler(
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
  const correctPassword = verifyPassword(
    body.password,
    user.salt,
    user.password
  )

  if (user.isTwoFAVerified) {
    // check the two-factor authentication toke
    // if (!body.twoFAToken) {
    //   return rep.code(401).send({
    //     message: 'Two-Factor Authentication is enabled, please provide the token',
    //   })
    // }
    // // verify the two-factor authentication token
    // const verified = server.twoFA.verify({
    //   secret: user.twoFASecret,
    //   encoding: 'base32',
    //   token: body.twoFAToken,
    //   window: 2,
    // })
    // if (!verified) {
    //   return rep.code(401).send({ message: 'Invalid Two-Factor Authentication token' })
  }
  if (correctPassword) {
    const { password, salt, ...rest } = user

    const accessToken = server.jwt.sign(rest, { expiresIn: '1d' })
    return rep.code(200).send({ ...rest, accessToken })
  }

  return rep.code(401).send({ message: 'Invalid Email or password' })
}

export async function logoutUserHandled(
  req: FastifyRequest,
  rep: FastifyReply
) {
  try {
    rep.clearCookie('accessToken', { path: '/' })
    return rep.code(200).send({ message: 'Logged out successfully' })
  } catch (err) {
    return rep.code(500).send({ message: 'Failed To Logout' })
  }
}

export async function getLoggedInUser(req: FastifyRequest, rep: FastifyReply) {
  try {
    return rep.code(200).send(req.user)
  } catch (err) {
    return rep.code(500).send({ error: 'Internal Server Error' })
  }
}

export async function sendResetOtp(
  req: FastifyRequest<{ Body: resetOtpType }>,
  rep: FastifyReply
) {
  const { email } = req.body

  try {
    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const optExpireAt = String(Date.now() + 15 * 60 * 1000)
    const tmp: any = await getUserByEmail(email)

    if (!tmp) return rep.send({ status: false, message: 'User Not Found' })

    if (tmp.type !== 0 && tmp.type !== null)
      return rep.code(200).send({
        status: false,
        message: 'This Email is signed in with another method',
      })

    const sql = db.prepare(
      `UPDATE User SET resetOtp = :resetOtp, resetOtpExpireAt = :optExpireAt WHERE email = :email`
    )
    sql.run({ resetOtp: otp, optExpireAt, email })

    // i still need a way to stop the user from spaming the email i just need to check if the resetOtpExpireAt is still valid if it's valid no need to send another one

    const mailBod: sendEmailBodyType = {
      to: email,
      subject: 'Password Reset OTP',
      html: `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            background-color: #f4f4f7;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 480px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            padding: 32px;
          }
          .header {
            text-align: center;
            margin-bottom: 24px;
          }
          .otp {
            font-size: 28px;
            font-weight: 600;
            color: #3f51b5;
            text-align: center;
            margin: 24px 0;
            letter-spacing: 2px;
          }
          .info {
            font-size: 14px;
            color: #555;
            text-align: center;
            margin-top: 12px;
          }
          .footer {
            font-size: 12px;
            color: #aaa;
            text-align: center;
            margin-top: 40px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Password Reset OTP</h2>
            <p>Use the code below to reset your password.</p>
          </div>
          <div class="otp">${otp}</div>
          <div class="info">This OTP will expire in 15 minutes.</div>
          <div class="footer">If you didn't request this, you can ignore this email.</div>
        </div>
      </body>
    </html>
  `,
    }

    const res = await sendEmailTmp(mailBod)

    return rep.send(res)
  } catch (err) {
    return rep.send({
      status: false,
      message: `failed to send a reset password to ${email}`,
    })
  }
}

export async function verifyOtp(
  req: FastifyRequest<{
    Body: OtpType
  }>,
  rep: FastifyReply
) {
  const { email, otp } = req.body
  try {
    const user: any = await getUserByEmail(email)

    if (!user) return rep.send({ status: false, message: 'User Not Found' })

    if (otp !== user.resetOtp)
      return rep.send({
        status: false,
        message: 'Invalid OTP',
      })

    if (
      user.resetOtpExpireAt &&
      BigInt(user.resetOtpExpireAt) < BigInt(Date.now())
    )
      return rep.send({
        status: false,
        message: 'OTP expired',
      })
    return rep.send({
      status: true,
      message: 'OTP Verified',
    })
  } catch (err) {
    return rep.send({ status: false, message: "Couldn't Verify The OTP code" })
  }
}

export async function resetPassword(
  req: FastifyRequest<{ Body: resetPasswordType }>,
  rep: FastifyReply
) {
  const { email, otp, newPassword } = req.body

  try {
    const user: any = await getUserByEmail(email)
    if (!user)
      return rep.code(404).send({ status: false, message: 'User Not Found' })

    if (!user.resetOtp || otp !== user.resetOtp)
      return rep.code(400).send({ status: false, message: 'Invalid OTP' })

    if (
      user.resetOtpExpireAt &&
      BigInt(user.resetOtpExpireAt) < BigInt(Date.now())
    )
      return rep.code(400).send({ status: false, message: 'OTP expired' })

    const { hash, salt } = hashPassword(newPassword)
    const sql = db.prepare(
      `UPDATE User SET salt = ?, password = ?, resetOtp = ?, resetOtpExpireAt = ? WHERE email = ?`
    )
    sql.run(salt, hash, null, null, email)

    return rep.send({ status: true, message: 'Password Updated Successfully' })
  } catch (err) {
    console.log(err)
    return rep
      .code(500)
      .send({ status: false, message: 'Internal Server Error' })
  }
}

export async function changePassword(
  req: FastifyRequest<{ Body: { oldPassword: string; newPassword: string } }>,
  rep: FastifyReply
) {
  const { oldPassword, newPassword } = req.body
  const { email }: any = req.user
  try {
    const user: any = await getUserByEmail(email)
    if (!user) {
      return rep.code(404).send({ status: false, message: 'User Not Found' })
    }

    const correctPassword = verifyPassword(
      oldPassword,
      user.salt,
      user.password
    )

    if (!correctPassword) {
      return rep.code(401).send({ status: false, message: 'Invalid Password' })
    }

    const { hash, salt } = hashPassword(newPassword)
    const sql = db.prepare(
      `UPDATE User SET salt = ?, password = ? WHERE email = ?`
    )
    sql.run(salt, hash, email)

    return rep.code(200).send({ status: true, message: 'Password Changed' })
  } catch (err) {
    console.log(err)
    return rep
      .code(500)
      .send({ status: false, message: 'Internal Server Error' })
  }
}

export async function getUser(
  req: FastifyRequest<{ Body: any }>,
  rep: FastifyReply
) {
  try {
    const { login }: any = req.body
    const { email }: any = req.user

    if (!login)
      return rep.code(400).send({ status: false, message: 'User Not Found' })
    const sql = db.prepare(
      'SELECT id, login, username, email, xp, avatar, type, level FROM User WHERE login = ?'
    )
    const user: any = await sql.get(login)

    const { isBlockedByMe, isBlockedByHim } = isBlockedStatus(email, user.email)

    rep.code(200).send({ ...user, isBlockedByMe, isBlockedByHim })
  } catch (err) {
    console.log(err)
  }
}

export async function getMe(
  req: FastifyRequest<{ Body: any }>,
  rep: FastifyReply
) {
  try {
    const { email }: any = req.user

    const user: any = await getUserByEmail(email)

    const { password, salt, ...rest } = user

    const accessToken = server.jwt.sign(rest, { expiresIn: '1d' })
    return rep.code(200).send({ ...rest, accessToken })
  } catch (err) {
    console.log(err)
    rep.code(500).send({ status: false, message: 'Internal Server Error' })
  }
}

export async function getRandomFriends(
  req: FastifyRequest<{ Body: { email: string } }>,
  rep: FastifyReply
) {
  try {
    const { email } = req.body
    return rep
      .code(200)
      .send({ status: true, friends: selectRandomFriends(email) })
  } catch (err) {
    console.log(err)
    return rep
      .code(500)
      .send({ status: false, message: 'Internal Server Error' })
  }
}

export async function getAllUsersData(req: FastifyRequest, rep: FastifyReply) {
  try {
    return rep.code(200)
  } catch (err) {
    console.log(err)
    return rep
      .code(500)
      .send({ status: false, message: 'Internal Server Error' })
  }
}

export async function listMyFriendsHandler(
  req: FastifyRequest<{ Querystring: { email: string } }>,
  rep: FastifyReply
) {
  try {
    const { email } = req.query
    if (!email)
      return rep.code(400).send({ status: false, message: 'Email is required' })
    const friends = await listMyFriends(email)
    return rep.code(200).send({ status: true, friends })
  } catch (err) {
    return rep
      .code(500)
      .send({ status: false, message: 'Internal Server Error' })
  }
}

export async function updateUserData(
  req: FastifyRequest<{
    Body: {
      login: string
      email: string
      username: string
      avatar: string
      type: number
    }
  }>,
  rep: FastifyReply
) {
  try {
    const { email: currentEmail }: any = req.user
    const { login, email: newEmail, username, avatar, type } = req.body

    if (!login || !username) {
      return rep.code(400).send({
        status: false,
        message: 'Invalid data: login and username are required',
      })
    }

    if (type === 0) {
      if (avatar) {
        const sql = db.prepare(
          `UPDATE User SET login = ?, username = ?, avatar = ?, email = ? WHERE email = ?`
        )
        sql.run(login, username, avatar, newEmail, currentEmail)
      } else {
        const sql = db.prepare(
          `UPDATE User SET login = ?, username = ?, email = ? WHERE email = ?`
        )
        sql.run(login, username, newEmail, currentEmail)
      }
    } else if (type === 2) {
      if (avatar) {
        const sql = db.prepare(
          `UPDATE User SET username = ?, avatar = ? WHERE email = ?`
        )
        sql.run(username, avatar, currentEmail)
      } else {
        const sql = db.prepare(`UPDATE User SET username = ? WHERE email = ?`)
        sql.run(username, currentEmail)
      }
    } else if (type === 1) {
      if (avatar) {
        const sql = db.prepare(
          `UPDATE User SET username = ?, login = ?, avatar = ? WHERE email = ?`
        )
        sql.run(username, login, avatar, currentEmail)
      } else {
        const sql = db.prepare(
          `UPDATE User SET username = ?, login = ? WHERE email = ?`
        )
        sql.run(username, login, currentEmail)
      }
    } else {
      return rep.code(400).send({
        status: false,
        message: 'Invalid update type',
      })
    }

    const user: any = await getUserByEmail(newEmail)
    if (!user) {
      return rep.code(404).send({ status: false, message: 'User not found' })
    }

    const { password, salt, ...rest } = user
    signJWT(rest, rep)
    return rep.code(200).send({
      status: true,
      message: 'User updated',
      user: { ...rest },
    })
  } catch (err) {
    console.error(err)
    return rep
      .code(500)
      .send({ status: false, message: 'Internal server error' })
  }
}
