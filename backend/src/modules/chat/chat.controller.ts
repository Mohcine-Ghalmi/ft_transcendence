import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  addFriend,
  addFriendById,
  getFriend,
  getUserByEmail,
  getUserById,
  isBlockedStatus,
} from '../user/user.service'
import { db } from '../../app'
import axios from 'axios'

const fs = require('fs')
const path = require('path')
const { pipeline } = require('stream/promises')
const crypto = require('crypto')

export async function addMessage(
  myId: number,
  receiverId: number,
  message: string,
  image: string
) {
  const sql = db.prepare(
    `INSERT INTO Messages (senderId, receiverId, message, image, date) VALUES (?,?,?,?,?)`
  )
  const now = new Date().toString()
  const result = await sql.run(myId, receiverId, message, image, now)
  const getSql = db.prepare(`SELECT * FROM Messages WHERE id = ?`)
  return await getSql.get(result.lastInsertRowid)
}

export function formatMessages(rawMessages: any, myEmail: string) {
  return rawMessages.map((row: any) => {
    const hisEmail =
      row.sender_email === myEmail ? row.receiver_email : row.sender_email

    const { isBlockedByMe, isBlockedByHim } = isBlockedStatus(myEmail, hisEmail)

    return {
      id: row.message_id,
      senderId: row.message_senderId,
      receiverId: row.message_receiverId,
      message: row.message_text,
      seen: row.message_seen,
      image: row.message_image,
      date: row.message_date,
      status: row.friend_status,

      isBlockedByMe,
      isBlockedByHim,

      sender: {
        id: row.sender_id,
        email: row.sender_email,
        username: row.sender_username,
        login: row.sender_login,
        level: row.sender_level,
        avatar: row.sender_avatar,
        type: row.sender_type,
        resetOtp: row.sender_resetOtp,
        resetOtpExpireAt: row.sender_resetOtpExpireAt,
      },
      receiver: {
        id: row.receiver_id,
        email: row.receiver_email,
        username: row.receiver_username,
        login: row.receiver_login,
        level: row.receiver_level,
        avatar: row.receiver_avatar,
        type: row.receiver_type,
        resetOtp: row.receiver_resetOtp,
        resetOtpExpireAt: row.receiver_resetOtpExpireAt,
      },
    }
  })
}

export async function getConversations(id: number, myEmail: string) {
  try {
    const sql = db.prepare(`
      WITH LatestMessages AS (
        SELECT
          m.*,
          ROW_NUMBER() OVER (
            PARTITION BY
              CASE
                WHEN m.senderId = ? THEN m.receiverId
                ELSE m.senderId
              END
            ORDER BY m.date DESC
          ) AS row_num
        FROM Messages m
        WHERE m.senderId = ? OR m.receiverId = ?
      ),
      AcceptedFriends AS (
        SELECT
          u.id AS friendId,
          fr.status,
          fr.fromEmail,
          fr.toEmail
        FROM FriendRequest fr
        JOIN User u ON u.email = CASE
          WHEN fr.fromEmail = (SELECT email FROM User WHERE id = ?) THEN fr.toEmail
          ELSE fr.fromEmail
        END
        WHERE (fr.status = 'ACCEPTED')
          AND (
            fr.fromEmail = (SELECT email FROM User WHERE id = ?)
            OR fr.toEmail = (SELECT email FROM User WHERE id = ?)
          )
      )

      SELECT
        lm.id AS message_id,
        lm.senderId AS message_senderId,
        lm.receiverId AS message_receiverId,
        lm.message AS message_text,
        lm.seen AS message_seen,
        lm.image AS message_image,
        lm.date AS message_date,

        af.status AS friend_status,

        sender.id AS sender_id,
        sender.email AS sender_email,
        sender.username AS sender_username,
        sender.login AS sender_login,
        sender.level AS sender_level,
        sender.avatar AS sender_avatar,
        sender.type AS sender_type,
        sender.resetOtp AS sender_resetOtp,
        sender.resetOtpExpireAt AS sender_resetOtpExpireAt,

        receiver.id AS receiver_id,
        receiver.email AS receiver_email,
        receiver.username AS receiver_username,
        receiver.login AS receiver_login,
        receiver.level AS receiver_level,
        receiver.avatar AS receiver_avatar,
        receiver.type AS receiver_type,
        receiver.resetOtp AS receiver_resetOtp,
        receiver.resetOtpExpireAt AS receiver_resetOtpExpireAt

      FROM LatestMessages lm
      JOIN User sender ON lm.senderId = sender.id
      JOIN User receiver ON lm.receiverId = receiver.id
      JOIN AcceptedFriends af ON
        (sender.id = af.friendId OR receiver.id = af.friendId)
      WHERE lm.row_num = 1
      ORDER BY lm.date DESC;
    `)

    const rawMessages = sql.all(id, id, id, id, id, id)

    const messages = formatMessages(rawMessages, myEmail)

    return messages
  } catch (err) {
    console.log(err)
    return null
  }
}

export async function getFriends(req: FastifyRequest, rep: FastifyReply) {
  try {
    const me: any = req.user
    const conversations = await getConversations(me.id, me.email)

    // const data = await addMessage(1, 2, "Hey !")
    // console.log('here :', data);
    // await addFriendById(1, 2)
    return rep.code(200).send(conversations)
  } catch (err) {
    console.log('getFriends error : ', err)
    return rep.code(500).send({ error: 'Internal server error', status: false })
  }
}

export async function getMessages(req: FastifyRequest, rep: FastifyReply) {
  try {
    const { id, offset }: any = req.params
    const me: any = req.user

    const reciever: any = await getUserById(id)

    if (!reciever)
      return rep.code(200).send({ error: 'User Not Found', status: false })
    const sql_friend = db.prepare(`
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
      OR (FriendRequest.fromEmail = ? AND FriendRequest.toEmail = ?) AND status = 'ACCEPTED' LIMIT 1;
    `)
    const data = sql_friend.all(
      reciever.email,
      me.email,
      me.email,
      reciever.email
    )
    const { isBlockedByMe, isBlockedByHim } = isBlockedStatus(
      me.email,
      reciever.email
    )

    const friend = data.map((row: any) => ({
      id: row.id,
      userA: {
        status: row.status,
        email: row.userA_email,
        username: row.userA_username,
        login: row.userA_login,
        avatar: row.userA_avatar,
        isBlockedByMe,
        isBlockedByHim,
      },
      userB: {
        status: row.status,
        email: row.userB_email,
        username: row.userB_username,
        login: row.userB_login,
        avatar: row.userB_avatar,
        isBlockedByMe,
        isBlockedByHim,
      },
    }))
    // const friend = await getFriend(reciever.email, me.email)
    if (!friend)
      return rep.code(200).send({ error: 'User Not Found', status: false })

    const sql = db.prepare(`
        SELECT
        m.id AS message_id,
        m.senderId AS message_senderId,
        m.receiverId AS message_receiverId,
        m.message AS message_text,
        m.seen AS message_seen,
        m.image AS message_image,
        m.date AS message_date,

        fr.status AS friend_status,

        sender.id AS sender_id,
        sender.email AS sender_email,
        sender.username AS sender_username,
        sender.login AS sender_login,
        sender.level AS sender_level,
        sender.avatar AS sender_avatar,
        sender.type AS sender_type,
        sender.resetOtp AS sender_resetOtp,
        sender.resetOtpExpireAt AS sender_resetOtpExpireAt,

        receiver.id AS receiver_id,
        receiver.email AS receiver_email,
        receiver.username AS receiver_username,
        receiver.login AS receiver_login,
        receiver.level AS receiver_level,
        receiver.avatar AS receiver_avatar,
        receiver.type AS receiver_type,
        receiver.resetOtp AS receiver_resetOtp,
        receiver.resetOtpExpireAt AS receiver_resetOtpExpireAt

      FROM Messages m
      JOIN User sender ON m.senderId = sender.id
      JOIN User receiver ON m.receiverId = receiver.id

      JOIN FriendRequest fr ON (
        (
          fr.fromEmail = sender.email AND fr.toEmail = receiver.email
        ) OR (
          fr.fromEmail = receiver.email AND fr.toEmail = sender.email
        )
      )
      WHERE fr.status IN ('ACCEPTED')
        AND (
          (m.senderId = ? AND m.receiverId = ?) OR
          (m.senderId = ? AND m.receiverId = ?)
        )
      ORDER BY m.date DESC
      LIMIT 20 OFFSET ?;
    `)
    const rawMessages = await sql.all(
      me.id,
      reciever.id,
      reciever.id,
      me.id,
      offset
    )

    const conversation = formatMessages(rawMessages, me.email)
    console.log(conversation)

    return rep.code(200).send({ friend, conversation })
  } catch (err) {
    console.log('getFriends error : ', err)
    return rep.code(500).send({ error: 'Internal server error', status: false })
  }
}

export const generateUniqueFilename = (originalFilename: string) => {
  const timestamp = Date.now()
  const randomString = crypto.randomBytes(8).toString('hex')
  const extension = path.extname(originalFilename) || '.png'
  return `${timestamp}-${randomString}${extension}`
}

export async function downloadAndSaveImage(imageUrl: string, filename: string) {
  const response = await axios.get(imageUrl, { responseType: 'stream' })
  const filepath = path.join(__dirname, '../../uploads', filename)
  const writer = fs.createWriteStream(filepath)
  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

export async function hostImages(request: FastifyRequest, reply: FastifyReply) {
  try {
    if (!request.isMultipart()) {
      return reply
        .status(400)
        .send({ status: false, message: 'Request is not multipart' })
    }

    const data = await request.file()

    if (!data) {
      return reply
        .status(400)
        .send({ status: false, message: 'No file provided' })
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ]
    if (!allowedMimeTypes.includes(data.mimetype)) {
      return reply.status(400).send({
        status: false,
        message: 'Only JPEG, PNG, GIF and WebP images are allowed',
      })
    }

    const filename = generateUniqueFilename(data.filename)
    const filepath = path.join(__dirname, '../../uploads', filename)

    await pipeline(data.file, fs.createWriteStream(filepath))

    return {
      success: true,
      filename,
    }
  } catch (err) {
    request.log.error(err)
    return reply
      .status(500)
      .send({ status: false, message: 'Failed to upload image' })
  }
}
