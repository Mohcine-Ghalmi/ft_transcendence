import { Server, Socket } from 'socket.io'
import { db } from '../../app'
import CryptoJS from 'crypto-js'

const searchForUsersInDb = (query: string, myEmail: string) => {
  const sql = db.prepare(`
    SELECT
      User.avatar,
      User.email,
      User.username,
      User.login,
      User.id,
      FriendRequest.id AS FriendsId,
      FriendRequest.status,
      FriendRequest.fromEmail,
      FriendRequest.toEmail
    FROM User
    LEFT JOIN FriendRequest
      ON (FriendRequest.fromEmail = ? AND FriendRequest.toEmail = User.email)
      OR (FriendRequest.fromEmail = User.email AND FriendRequest.toEmail = ?)
    WHERE
      (User.email LIKE ? OR User.username LIKE ? OR User.login LIKE ?)
      AND User.email != ?
  `)

  const users = sql.all(
    myEmail,
    myEmail,
    `%${query}%`,
    `%${query}%`,
    `%${query}%`,
    myEmail
  )

  return users
}

export function setupUserSocket(socket: Socket, io: Server) {
  socket.on('searchingForUsers', (query: string) => {
    try {
      const key = process.env.ENCRYPTION_KEY as string
      const myEmail = CryptoJS.AES.decrypt(
        socket.handshake.query.cryptedMail as string,
        key
      ).toString(CryptoJS.enc.Utf8)

      if (!query) {
        socket.emit('error-in-search', {
          status: 'error',
          message: 'query not found',
        })
      }

      socket.emit('searchResults', searchForUsersInDb(query, myEmail))
    } catch (err) {
      console.log(err)
      socket.emit('error-in-search', {
        status: 'error',
        message: 'query not found',
      })
    }
  })
}
