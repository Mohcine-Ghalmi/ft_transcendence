import { Server, Socket } from 'socket.io'
import { db } from '../../app'
import CryptoJS from 'crypto-js'
import { getFriend } from './user.service'
import { changeFriendStatus } from '../friends/friends.socket'
import { getSocketIds } from '../../socket'

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

const blockUser = (blockedBy: string, blockedUser: string) => {
  try {
    const sql = db.prepare(
      'INSERT INTO Block(blockedBy, blockedUser) VALUES(?,?)'
    )
    sql.run(blockedBy, blockedUser)
    return true
  } catch (err) {
    return false
  }
}

const unblock = (blockedBy: string, blockedUser: string) => {
  try {
    const sql = db.prepare(
      'DELETE FROM Block WHERE blockedBy = ? AND blockedUser = ?'
    )
    sql.run(blockedBy, blockedUser)
    return true
  } catch (err) {
    console.log(err)
    return false
  }
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

export function setupUserSocket(socket: Socket, io: Server) {
  const key = process.env.ENCRYPTION_KEY as string
  const myEmail = CryptoJS.AES.decrypt(
    socket.handshake.query.cryptedMail as string,
    key
  ).toString(CryptoJS.enc.Utf8)
  socket.on('searchingForUsers', (query: string) => {
    try {
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

  // block user
  socket.on('block:user', async ({ hisEmail }) => {
    console.log(myEmail, hisEmail)

    try {
      const friend = await getFriend(myEmail, hisEmail)
      if (!friend)
        return socket.emit('blockResponse', {
          status: 'error',
          message: 'You are not friends with this user',
        })

      if (blockUser(myEmail, hisEmail)) {
        const hisSockets = await getSocketIds(hisEmail, 'sockets')
        const mySockets = await getSocketIds(myEmail, 'sockets')
        io.to(mySockets).emit('blockResponse', {
          status: 'success',
          message: 'User Blocked',
          isBlockedByMe: true,
          hisEmail,
        })
        io.to(hisSockets).emit('blockResponse', {
          status: 'success',
          isBlockedByHim: true,
          hisEmail,
        })
      } else {
        socket.emit('blockResponse', {
          status: 'error',
          message: `Can't block user for now please try again`,
        })
      }
    } catch (err) {
      return socket.emit('blockResponse', {
        status: 'error',
        message: `Can't block user for now please try again`,
      })
    }
  })
  // unblock
  socket.on('unblock:user', async ({ hisEmail }) => {
    console.log(myEmail, hisEmail)

    try {
      const friend = await getFriend(myEmail, hisEmail)
      if (!friend)
        return socket.emit('blockResponse', {
          status: 'error',
          message: 'You are not friends with this user',
        })

      if (unblock(myEmail, hisEmail)) {
        const hisSockets = await getSocketIds(hisEmail, 'sockets')
        const mySockets = await getSocketIds(myEmail, 'sockets')
        io.to(mySockets).emit('blockResponse', {
          status: 'success',
          message: 'User unblocked',
          isBlockedByMe: false,
          hisEmail,
        })
        io.to(hisSockets).emit('blockResponse', {
          status: 'success',
          isBlockedByHim: false,
          hisEmail,
        })
      } else {
        socket.emit('blockResponse', {
          status: 'error',
          message: `Can't unblock user for now please try again`,
        })
      }
    } catch (err) {
      return socket.emit('blockResponse', {
        status: 'error',
        message: `Can't unblock user for now please try again`,
      })
    }
  })
}

