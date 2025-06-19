import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  addFriend,
  addFriendById,
  getFriend,
  getUserByEmail,
  getUserById,
} from '../user/user.service'
import { db } from '../../app'

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

export function formatMessages(rawMessages: any) {
  return rawMessages.map((row: any) => ({
    id: row.message_id,
    senderId: row.message_senderId,
    receiverId: row.message_receiverId,
    message: row.message_text,
    seen: row.message_seen,
    image: row.message_image,
    date: row.message_date,
    sender: {
      id: row.sender_id,
      email: row.sender_email,
      first_name: row.sender_first_name,
      last_name: row.sender_last_name,
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
      first_name: row.receiver_first_name,
      last_name: row.receiver_last_name,
      login: row.receiver_login,
      level: row.receiver_level,
      avatar: row.receiver_avatar,
      type: row.receiver_type,
      resetOtp: row.receiver_resetOtp,
      resetOtpExpireAt: row.receiver_resetOtpExpireAt,
    },
  }))
}

export async function getConversations(id: number) {
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
        ) as row_num
      FROM Messages m
      WHERE m.senderId = ? OR m.receiverId = ?
    )

    SELECT
      lm.id AS message_id,
      lm.senderId AS message_senderId,
      lm.receiverId AS message_receiverId,
      lm.message AS message_text,
      lm.seen AS message_seen,
      lm.image AS message_image,
      lm.date AS message_date,

      sender.id AS sender_id,
      sender.email AS sender_email,
      sender.first_name AS sender_first_name,
      sender.last_name AS sender_last_name,
      sender.login AS sender_login,
      sender.level AS sender_level,
      sender.avatar AS sender_avatar,
      sender.type AS sender_type,
      sender.resetOtp AS sender_resetOtp,
      sender.resetOtpExpireAt AS sender_resetOtpExpireAt,

      receiver.id AS receiver_id,
      receiver.email AS receiver_email,
      receiver.first_name AS receiver_first_name,
      receiver.last_name AS receiver_last_name,
      receiver.login AS receiver_login,
      receiver.level AS receiver_level,
      receiver.avatar AS receiver_avatar,
      receiver.type AS receiver_type,
      receiver.resetOtp AS receiver_resetOtp,
      receiver.resetOtpExpireAt AS receiver_resetOtpExpireAt

    FROM LatestMessages lm
    JOIN User sender ON lm.senderId = sender.id
    JOIN User receiver ON lm.receiverId = receiver.id
    WHERE lm.row_num = 1
    ORDER BY lm.date DESC;
    `)
    const rawMessages = await sql.all(id, id, id)

    const messages = formatMessages(rawMessages)

    return messages
  } catch (err) {
    console.log(err)
    return null
  }
}

export async function getFriends(req: FastifyRequest, rep: FastifyReply) {
  try {
    const me: any = req.user
    const conversations = await getConversations(me.id)

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
    const friend = await getFriend(reciever.email, me.email)
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

        sender.id AS sender_id,
        sender.email AS sender_email,
        sender.first_name AS sender_first_name,
        sender.last_name AS sender_last_name,
        sender.login AS sender_login,
        sender.level AS sender_level,
        sender.avatar AS sender_avatar,
        sender.type AS sender_type,
        sender.resetOtp AS sender_resetOtp,
        sender.resetOtpExpireAt AS sender_resetOtpExpireAt,

        receiver.id AS receiver_id,
        receiver.email AS receiver_email,
        receiver.first_name AS receiver_first_name,
        receiver.last_name AS receiver_last_name,
        receiver.login AS receiver_login,
        receiver.level AS receiver_level,
        receiver.avatar AS receiver_avatar,
        receiver.type AS receiver_type,
        receiver.resetOtp AS receiver_resetOtp,
        receiver.resetOtpExpireAt AS receiver_resetOtpExpireAt

      FROM Messages m
      JOIN User sender ON m.senderId = sender.id
      JOIN User receiver ON m.receiverId = receiver.id
      WHERE (m.senderId = ? AND m.receiverId = ?) OR (m.senderId = ? AND m.receiverId = ?)
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

    const conversation = formatMessages(rawMessages)

    return rep.code(200).send({ friend, conversation })
  } catch (err) {
    console.log('getFriends error : ', err)
    return rep.code(500).send({ error: 'Internal server error', status: false })
  }
}

const generateUniqueFilename = (originalFilename: string) => {
  const timestamp = Date.now()
  const randomString = crypto.randomBytes(8).toString('hex')
  const extension = path.extname(originalFilename)
  return `${timestamp}-${randomString}${extension}`
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
