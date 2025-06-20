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
      password, level, salt, avatar,
      type, resetOtp, resetOtpExpireAt
    ) VALUES (
      :email, :username, :login,
      :password, :level, :salt, :avatar,
      :type, :resetOtp, :resetOtpExpireAt
    )
  `)
  sql.run({
    email: rest.email,
    username: rest.username,
    login: login || characterName,
    password: hash,
    level: rest.level || null,
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

export async function getFriend_r(
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
        WHERE (FriendRequest.fromEmail = ? AND FriendRequest.toEmail = ?)
        OR (FriendRequest.fromEmail = ? AND FriendRequest.toEmail = ?) AND status = ? LIMIT 1;
      `)
  const data = await sql.all(
    to.email,
    from.email,
    from.email,
    to.email,
    status.toUpperCase()
  )
  const user = data.map((row: any) => ({
    id: row.id,
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
  }))
  return user
}

export async function getFriend(hisEmail: string, yourEmail: string) {
  const muteUser: any = await getUserByEmail(hisEmail)
  const me: any = await getUserByEmail(yourEmail)
  if (!muteUser || !me) return null
  const sql = db.prepare(`
        SELECT
          Friends.*,
          UA.email AS userA_email,
          UA.username AS userA_username,
          UA.login AS userA_login,
          UA.avatar AS userA_avatar,
          UB.email AS userB_email,
          UB.username AS userB_username,
          UB.login AS userB_login,
          UB.avatar AS userB_avatar
        FROM Friends
        JOIN User AS UA ON UA.email = Friends.userA
        JOIN User AS UB ON UB.email = Friends.userB
        WHERE (Friends.userA = ? AND Friends.userB = ?)
        OR (Friends.userA = ? AND Friends.userB = ?) LIMIT 1;
      `)
  const data = await sql.all(me.email, muteUser.email, muteUser.email, me.email)
  const user = data.map((row: any) => ({
    id: row.id,
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
  }))
  return user
}
