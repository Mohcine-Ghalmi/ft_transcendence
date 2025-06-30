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

export async function getUserByEmail(email: string) {
  const sql = db.prepare(`SELECT * FROM User WHERE email = ?`)
  return (await sql.get(email)) as typeof createUserResponseSchema
}

export async function getUserById(id: number) {
  const sql = db.prepare(`SELECT * FROM User WHERE id = ?`)
  return (await sql.get(id)) as typeof createUserResponseSchema
}

// "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
//     "email" TEXT NOT NULL UNIQUE,
//     "username" TEXT NOT NULL,
//     "salt" TEXT NOT NULL,
//     "password" TEXT NOT NULL,
//     "login" TEXT,
//     "level" INTEGER,
//     "xp" INTEGER NULL,
//     "avatar" TEXT,
//     "type" INTEGER,
//     "resetOtp" TEXT NULL,
//     "resetOtpExpireAt" TEXT NULL,
//     "isOnline" BOOLEAN,
//     "twoFASecret" TEXT,
//     "isTwoFAVerified" BOOLEAN DEFAULT 0

// avatar: '1750283440546-bf95b0924aa51f31.jpg'
// confirmPassword: 'askhdASD123@gmil.com'
// email: 'askhdASD123@gmil.com'
// password: 'askhdASD123@gmil.com'
// twoFactorCode: ''
// username: 'aksjhdkjasd'

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

export async function addFriend(hisEmail: string, yourEmail: string) {
  const muteUser: any = await getUserByEmail(hisEmail)
  const me: any = await getUserByEmail(yourEmail)
  if (!muteUser || !me) return null
  const sql = db.prepare(`INSERT INTO Friends (userA, userB) VALUES(?,?)`)
  await sql.run(me.email, muteUser.email)
}

export async function addFriendById(hisId: number, yourId: number) {
  const muteUser: any = await getUserById(hisId)
  const me: any = await getUserById(yourId)
  if (!muteUser || !me) return null
  const sql = db.prepare(`INSERT INTO Friends (userA, userB) VALUES(?,?)`)
  await sql.run(me.email, muteUser.email)
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
      SELECT
        UA.id as userA_id,
        UA.email AS userA_email,
        UA.username AS userA_username,
        UA.login AS userA_login,
        UA.avatar AS userA_avatar
      FROM User UA ORDER BY RANDOM() LIMIT 5
    `)
    const data = sql.all()
    return data.map((row: any) => {
      const isMeA = row.fromEmail === email
      const friend = isMeA
        ? {
            id: row.userA_id,
            email: row.userB_email,
            username: row.userB_username,
            login: row.userB_login,
            avatar: row.userB_avatar,
          }
        : {
            id: row.userA_id,
            email: row.userA_email,
            username: row.userA_username,
            login: row.userA_login,
            avatar: row.userA_avatar,
          }
      return friend
    })
  } catch (err) {
    console.log(err)
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
