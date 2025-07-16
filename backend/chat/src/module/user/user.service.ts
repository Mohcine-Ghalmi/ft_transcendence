import { db } from '../../app'

export async function getUserByEmail(email: string) {
  const sql = db.prepare(`SELECT * FROM User WHERE email = ?`)
  return await sql.get(email)
}

export const getIsBlocked = (myEmail: string) => {
  try {
    const sql = db.prepare(
      'SELECT * FROM Block WHERE (blockedBy = ? OR blockedUser = ?)'
    )
    const data = sql.all(myEmail, myEmail)
    return data
  } catch (err) {
    console.log(err)
    return null
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

  const data = sql.all(
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
export async function getUserById(id: number) {
  const sql = db.prepare(`SELECT * FROM User WHERE id = ?`)
  return await sql.get(id)
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
