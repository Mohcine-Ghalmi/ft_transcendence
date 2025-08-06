import { FastifyReply, FastifyRequest } from 'fastify'
import {
  getUserByEmail,
  isBlockedStatus,
  listMyFriends,
  selectRandomFriends,
} from './user.service'
import { hashPassword, verifyPassword } from '../../utils/hash'
import { db, server, tokenBlacklist } from '../../app'
import { sendEmailTmp } from '../Mail/mail.controller'
import {
  resetOtpType,
  resetPasswordType,
  sendEmailBodyType,
  OtpType,
} from '../Mail/mail.schema'
import { signJWT } from './user.login'
import path from 'path'
import fsPromises from 'fs/promises'
import { sendError } from './user.2fa'

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
    sendError(rep, err)
  }
}

export async function logoutUserHandled(
  req: FastifyRequest,
  rep: FastifyReply
) {
  try {
    let token = req.cookies.accessToken
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (token) {
      tokenBlacklist.add(token)
    }

    rep.clearCookie('accessToken', { path: '/' })
    return rep.code(200).send({ message: 'Logged out successfully' })
  } catch (err) {
    sendError(rep, err)
  }
}

export async function getLoggedInUser(req: FastifyRequest, rep: FastifyReply) {
  try {
    const user: any = req.user
    const logedIn: any = await getUserByEmail(user.email)
    signJWT(logedIn, rep)
    const { password, salt, ...rest } = logedIn
    return rep.code(200).send({ user: rest })
  } catch (err) {
    sendError(rep, err)
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
    sendError(rep, err)
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
    sendError(rep, err)
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
    sendError(rep, err)
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
      return rep.code(200).send({ status: false, message: 'Invalid Password' })
    }

    const { hash, salt } = hashPassword(newPassword)
    const sql = db.prepare(
      `UPDATE User SET salt = ?, password = ? WHERE email = ?`
    )
    sql.run(salt, hash, email)

    return rep.code(200).send({ status: true, message: 'Password Changed' })
  } catch (err) {
    sendError(rep, err)
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
      `SELECT User.id, User.login, User.username, User.email, User.xp, User.avatar, User.type, User.level,
        FriendRequest.status, FriendRequest.fromEmail, FriendRequest.toEmail
      FROM User
      LEFT JOIN FriendRequest
        ON ( (FriendRequest.toEmail = User.email AND FriendRequest.fromEmail = ?)
          OR (FriendRequest.fromEmail = User.email AND FriendRequest.toEmail = ?) )
      WHERE User.login = ?`
    )

    const user: any = await sql.get(email, email, login)

    const { isBlockedByMe, isBlockedByHim } = isBlockedStatus(email, user.email)

    rep.code(200).send({ ...user, isBlockedByMe, isBlockedByHim })
  } catch (err) {
    sendError(rep, err)
  }
}

export async function getMe(
  req: FastifyRequest<{ Body: any }>,
  rep: FastifyReply
) {
  try {
    const { email }: any = req.user

    const user: any = await getUserByEmail(email)

    if (!user) {
      return rep.code(404).send({ error: 'User not found' })
    }

    const { password, salt, ...rest } = user

    // Return user data in the expected format
    return rep.code(200).send({ user: rest })
  } catch (err) {
    sendError(rep, err)
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
    sendError(rep, err)
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
    sendError(rep, err)
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
    const { email: currentEmail, avatar: oldAvatar }: any = req.user
    const { login, username, avatar, type } = req.body

    if (!login || !username) {
      return rep.code(400).send({
        status: false,
        message: 'Invalid data: login and username are required',
      })
    }

    if (avatar && oldAvatar !== 'default.avif') {
      try {
        const filePath = path.join(__dirname, '../media', oldAvatar)
        await fsPromises.access(filePath)
        await fsPromises.unlink(filePath)
      } catch (err: any) {
        if (err.code !== 'ENOENT')
          server.log.error('Failed to delete avatar:', err)
        // return rep.code(404).send({status: false, message: 'Avatar not found'})
      }
    }

    if (type === 0) {
      if (avatar) {
        const sql = db.prepare(
          `UPDATE User SET login = ?, username = ?, avatar = ? WHERE email = ?`
        )
        sql.run(login, username, avatar, currentEmail)
      } else {
        if (
          (login.length < 3 || login.length > 20) &&
          (username.length < 3 || username.length > 20)
        ) {
          return rep.code(200).send({
            status: false,
            message: 'Login and username must be less than 20 characters',
          })
        }
        const sql = db.prepare(
          `UPDATE User SET login = ?, username = ? WHERE email = ?`
        )
        sql.run(login, username, currentEmail)
      }
    } else if (type === 2) {
      if (avatar) {
        const sql = db.prepare(
          `UPDATE User SET username = ?, avatar = ? WHERE email = ?`
        )
        sql.run(username, avatar, currentEmail)
      } else {
        if (username.length < 3 || username.length > 20) {
          return rep.code(200).send({
            status: false,
            message: 'Login and username must be less than 20 characters',
          })
        }
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
        if (
          (login.length < 3 || login.length > 20) &&
          (username.length < 3 || username.length > 20)
        ) {
          return rep.code(200).send({
            status: false,
            message: 'Login and username must be less than 20 characters',
          })
        }
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

    const user: any = await getUserByEmail(currentEmail)
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
    sendError(rep, err)
  }
}

export async function getUserDetails(
  req: FastifyRequest<{
    Body: { email: string }
  }>,
  rep: FastifyReply
) {
  try {
    const { email } = req.body
    const user: any = req.user
    const LeaderBoardData = db
      .prepare(
        `SELECT
            u.id,
            u.username,
            u.email,
            u.avatar,
            u.login,
            COUNT(mh.id) AS total_games,
            ROUND(
                CAST(SUM(CASE WHEN mh.winner = u.email THEN 1 ELSE 0 END) AS FLOAT)
                / COUNT(mh.id) * 100,
                2
            ) AS win_rate_percentage
        FROM User u
        LEFT JOIN match_history mh
            ON u.email = mh.player1_email OR u.email = mh.player2_email
        GROUP BY u.id, u.username, u.email
        ORDER BY win_rate_percentage DESC, total_games DESC LIMIT 100;
        `
      )
      .all()

    const randomFriends = db
      .prepare(
        `SELECT User.email , User.username ,User.avatar, User.login , FriendRequest.fromEmail, FriendRequest.toEmail, FriendRequest.status
          FROM FriendRequest
          INNER JOIN User
            ON (FriendRequest.fromEmail = User.email OR FriendRequest.toEmail = User.email)
          WHERE FriendRequest.status = 'ACCEPTED'
            AND (FriendRequest.fromEmail = ? OR FriendRequest.toEmail = ?)
            AND User.email != ?
          ORDER BY RANDOM()
          LIMIT 3`
      )
      .all(email, email, email)

    const match_history_sql = db.prepare(
      'SELECT * FROM match_history WHERE winner = ? OR loser = ? ORDER BY created_at DESC LIMIT 5'
    )

    const matchHistory = match_history_sql.all(email, email)
    const sql: any = db.prepare(`
      SELECT
        (SELECT COUNT(*) FROM match_history WHERE winner = ?) as wins,
        (SELECT COUNT(*) FROM match_history WHERE loser = ?) as losses
        `)

    const data = db
      .prepare(
        `
        SELECT
          ((strftime('%d', datetime(created_at)) - 1) / 7 + 1) AS week_of_month,
          SUM(CASE WHEN winner = ? THEN 1 ELSE 0 END) AS wins,
          SUM(CASE WHEN loser = ? THEN 1 ELSE 0 END) AS losses
        FROM match_history
        WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
        GROUP BY week_of_month
        ORDER BY week_of_month
      `
      )
      .all(email, email)

    const chartData = Array.from({ length: 4 }, (_, i) => {
      const weekData: any = data.find((d: any) => d.week_of_month === i + 1)
      return {
        label: `Week ${i + 1}`,
        wins: weekData ? weekData.wins : 0,
        losses: weekData ? weekData.losses : 0,
      }
    })

    const { wins, losses } = sql.get(email, email)

    return rep.send({
      wins,
      losses,
      chartData,
      matchHistory,
      randomFriends,
      LeaderBoardData,
    })
  } catch (err) {
    sendError(rep, err)
  }
}
