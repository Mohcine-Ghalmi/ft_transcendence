import { db } from '../../app'
import { hashPassword } from '../../utils/hash'
import type { CreateUserInput } from './user.schema'
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from 'unique-names-generator'
import { createUserResponseSchema } from './user.schema'
import { getIsBlocked } from './user.socket'
import type { FastifyReply, FastifyRequest } from 'fastify'

export async function getUserByEmail(email: string) {
  const sql = db.prepare(`SELECT * FROM User WHERE email = ?`)
  return (await sql.get(email)) as typeof createUserResponseSchema
}

export async function getUserByEmailROUTE(
  req: FastifyRequest<{ Body: { email: string } }>,
  rep: FastifyReply
) {
  try {
    const { email } = req.body as { email: string }
    const sql = db.prepare(`SELECT * FROM User WHERE email = ?`)
    const data = (await sql.get(email)) as typeof createUserResponseSchema
    return rep.status(200).send(data)
  } catch (err: any) {
    console.log(err.message)

    rep.status(500).send({ error: 'Internal Server Error' })
    return null
  }
}

export async function getIsBlockedROUTE(
  req: FastifyRequest<{ Body: { myEmail: string } }>,
  rep: FastifyReply
) {
  try {
    const { myEmail } = req.body

    const sql = db.prepare(
      'SELECT * FROM Block WHERE (blockedBy = ? OR blockedUser = ?)'
    )
    const data = sql.all(myEmail, myEmail)
    console.log('getIsBlockedROUTE : ', data)

    return rep.code(200).send(data)
  } catch (err: any) {
    console.log(err.message)
    return rep.status(500).send({
      status: 'error',
      message: 'Internal server error',
    })
  }
}

export async function getUserByIdROUTE(
  req: FastifyRequest<{ Body: { id: number } }>,
  rep: FastifyReply
) {
  try {
    const { id } = req.body as { id: number }
    const sql = db.prepare(`SELECT * FROM User WHERE id = ?`)
    const data = (await sql.get(id)) as typeof createUserResponseSchema
    return rep.code(200).send(data)
  } catch (err) {
    rep.status(500).send({ error: 'Internal Server Error' })
    return null
  }
}

export async function createUser(input: CreateUserInput) {
  const characterName: string = uniqueNamesGenerator({
    dictionaries: [colors, adjectives, animals],
    style: 'lowerCase',
  })
  const { password, login, resetOtp, resetOtpExpireAt, ...rest } = input
  const { hash, salt } = hashPassword(password)

  const sql = db.prepare(`
    INSERT INTO User (
      email, username, login,
      password, salt, avatar,
      type, resetOtp, resetOtpExpireAt
    ) VALUES (
      :email, :username, :login,
      :password, :salt, :avatar,
      :type, :resetOtp, :resetOtpExpireAt
    )
  `)
  sql.run({
    email: rest.email,
    username: rest.username,
    login: login || characterName,
    password: hash,
    salt: salt,
    avatar: rest.avatar || null,
    type: rest.type || 0,
    resetOtp: resetOtp || null,
    resetOtpExpireAt: resetOtpExpireAt || null,
  })
  return await getUserByEmail(rest.email)
}

export const isBlockedStatus = (myEmail: string, hisEmail: string) => {
  const fromBlockedList = getIsBlocked(myEmail)
  const toBlockedList = getIsBlocked(hisEmail)

  const isBlockedByMe = fromBlockedList
    ? fromBlockedList.some((entry: any) => entry.blockedUser === hisEmail)
    : false

  const isBlockedByHim = toBlockedList
    ? toBlockedList.some((entry: any) => entry.blockedUser === myEmail)
    : false
  return { isBlockedByMe, isBlockedByHim }
}

export async function getFriendROUTE(
  req: FastifyRequest<{
    Body: { fromEmail: string; toEmail: string; status: string }
  }>,
  rep: FastifyReply
) {
  try {
    const { fromEmail, toEmail, status } = req.body
    console.log('getFriendROUTE : ', { fromEmail, toEmail, status })

    const from: any = await getUserByEmail(fromEmail)
    const to: any = await getUserByEmail(toEmail)
    if (!from || !to || !status) return null

    const sql = db.prepare(`
    SELECT
      FriendRequest.*,
      UA.email AS userA_email,
      UA.username AS userA_username,
      UA.login AS userA_login,
      UA.avatar AS userA_avatar,
      UB.email AS userB_email,
      UB.username AS userB_username,
      UB.login AS userB_login,
      UB.avatar AS userB_avatar
    FROM FriendRequest
    JOIN User AS UA ON UA.email = FriendRequest.fromEmail
    JOIN User AS UB ON UB.email = FriendRequest.toEmail
    WHERE (
      (FriendRequest.fromEmail = ? AND FriendRequest.toEmail = ?)
      OR (FriendRequest.fromEmail = ? AND FriendRequest.toEmail = ?)
    )
    AND status = ?
    LIMIT 1;
  `)

    const data = await sql.all(
      to.email,
      from.email,
      from.email,
      to.email,
      status.toUpperCase()
    )

    if (!data.length) return null

    const [row]: any = data

    const { isBlockedByMe, isBlockedByHim } = isBlockedStatus(
      to.email,
      from.email
    )

    return rep.code(200).send({
      id: row.id,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      userA: {
        email: row.userA_email,
        username: row.userA_username,
        login: row.userA_login,
        avatar: row.userA_avatar,
      },
      userB: {
        email: row.userB_email,
        username: row.userB_username,
        login: row.userB_login,
        avatar: row.userB_avatar,
      },
      isBlockedByMe,
      isBlockedByHim,
    })
  } catch (err: any) {
    console.log(err.message)
    return rep.status(500).send({ error: 'Internal Server Error' })
  }
}
export async function getFriend(
  fromEmail: string,
  toEmail: string,
  status: string = 'ACCEPTED'
) {
  const from: any = await getUserByEmail(fromEmail)
  const to: any = await getUserByEmail(toEmail)
  if (!from || !to || !status) return null

  const sql = db.prepare(`
    SELECT
      FriendRequest.*,
      UA.email AS userA_email,
      UA.username AS userA_username,
      UA.login AS userA_login,
      UA.avatar AS userA_avatar,
      UB.email AS userB_email,
      UB.username AS userB_username,
      UB.login AS userB_login,
      UB.avatar AS userB_avatar
    FROM FriendRequest
    JOIN User AS UA ON UA.email = FriendRequest.fromEmail
    JOIN User AS UB ON UB.email = FriendRequest.toEmail
    WHERE (
      (FriendRequest.fromEmail = ? AND FriendRequest.toEmail = ?)
      OR (FriendRequest.fromEmail = ? AND FriendRequest.toEmail = ?)
    )
    AND status = ?
    LIMIT 1;
  `)

  const data = await sql.all(
    to.email,
    from.email,
    from.email,
    to.email,
    status.toUpperCase()
  )

  if (!data.length) return null

  const [row]: any = data

  const { isBlockedByMe, isBlockedByHim } = isBlockedStatus(
    to.email,
    from.email
  )

  return {
    id: row.id,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    userA: {
      email: row.userA_email,
      username: row.userA_username,
      login: row.userA_login,
      avatar: row.userA_avatar,
    },
    userB: {
      email: row.userB_email,
      username: row.userB_username,
      login: row.userB_login,
      avatar: row.userB_avatar,
    },
    isBlockedByMe,
    isBlockedByHim,
  }
}

export function selectRandomFriends(email: string) {
  try {
    const sql = db.prepare(`
      SELECT u.*
      FROM User u
      WHERE u.email != ?
        AND NOT EXISTS (
          SELECT 1
          FROM FriendRequest fr
          WHERE (
            (fr.fromEmail = u.email AND fr.toEmail = ?)
            OR
            (fr.toEmail = u.email AND fr.fromEmail = ?)
          )
        )
      ORDER BY RANDOM()
      LIMIT 5
    `)
    const data = sql.all(email, email, email)
    console.log('data : ', data)

    return data.map((row: any) => ({
      id: row.id,
      email: row.email,
      username: row.username,
      login: row.login,
      avatar: row.avatar,
      level: row.level,
      xp: row.xp,
      fromEmail: null,
      toEmail: null,
      status: null,
    }))
  } catch (err) {
    console.log(err)
    return []
  }
}

export async function listMyFriends(email: string) {
  const sql = db.prepare(`
    SELECT
      fr.*,
      UA.email AS userA_email,
      UA.username AS userA_username,
      UA.login AS userA_login,
      UA.avatar AS userA_avatar,
      UB.email AS userB_email,
      UB.username AS userB_username,
      UB.login AS userB_login,
      UB.avatar AS userB_avatar
    FROM FriendRequest fr
    JOIN User AS UA ON UA.email = fr.fromEmail
    JOIN User AS UB ON UB.email = fr.toEmail
    WHERE (fr.fromEmail = ? OR fr.toEmail = ?) AND fr.status = 'ACCEPTED'
  `)
  const data = await sql.all(email, email)
  // Return the other user in each friendship
  return data.map((row: any) => {
    const isMeA = row.fromEmail === email
    const friend = isMeA
      ? {
          email: row.userB_email,
          username: row.userB_username,
          login: row.userB_login,
          avatar: row.userB_avatar,
        }
      : {
          email: row.userA_email,
          username: row.userA_username,
          login: row.userA_login,
          avatar: row.userA_avatar,
        }
    return friend
  })
}
