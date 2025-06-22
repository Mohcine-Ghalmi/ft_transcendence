import type { Server, Socket } from 'socket.io'
import CryptoJS from 'crypto-js'
import { getUserByEmail } from '../user/user.service'
import { db } from '../../app'
import { getSocketIds } from '../../socket'

// changeFriendStatus
export const changeFriendStatus = (
  myEmail: string,
  inviter: string,
  status: string
) => {
  try {
    const sql = db.prepare(
      'UPDATE FriendRequest SET status = ? WHERE (fromEmail = ? AND toEmail = ?) OR (fromEmail = ? AND toEmail = ?)'
    )
    sql.run(status.toUpperCase(), inviter, myEmail, myEmail, inviter)
    return true
  } catch (err) {
    console.log('changeFriendStatus : ', err)
    return false
  }
}

const addFriendRequest = (myEmail: string, toEmail: string) => {
  try {
    const sql = db.prepare(
      'INSERT INTO FriendRequest (fromEmail, toEmail) VALUES(?,?)'
    )
    sql.run(myEmail, toEmail)
    return true
  } catch (err) {
    console.log('addFriendRequest : ', err)
    return false
  }
}

export function setupFriendsSocket(socket: Socket, io: Server) {
  const key = process.env.ENCRYPTION_KEY as string
  //
  socket.on('addFriend', async (toEmail) => {
    try {
      const myEmail = CryptoJS.AES.decrypt(
        socket.handshake.query.cryptedMail as string,
        key
      ).toString(CryptoJS.enc.Utf8)
      const invitedUser: any = await getUserByEmail(toEmail)
      if (!invitedUser)
        return socket.emit('friendResponse', {
          status: 'error',
          message: 'User Not Found',
        })

      const userSockets = await getSocketIds(invitedUser.email, 'sockets')
      addFriendRequest(myEmail, toEmail)
        ? socket.emit('friendResponse', {
            status: 'success',
            message: 'Friend Request sent',
          })
        : socket.emit('friendResponse', {
            status: 'error',
            message: 'Failed to send Friend Request',
          })

      if (userSockets?.length)
        io.to(userSockets).emit('friendResponse', {
          status: 'success',
          message: `You Recieved A friend request from ${myEmail}`,
          hisEmail: myEmail,
          desc: 'PENDING',
        })
    } catch (err) {
      console.log('addFriend : ', err)
      socket.emit('friendResponse', {
        status: 'success',
        message: 'Friend Request sent',
      })
    }
  })
  //
  socket.on('acceptFriend', async (inviter: string) => {
    try {
      const myEmail = CryptoJS.AES.decrypt(
        socket.handshake.query.cryptedMail as string,
        key
      ).toString(CryptoJS.enc.Utf8)

      const user = getUserByEmail(inviter)
      if (!user)
        return socket.emit('friendResponse', {
          status: 'error',
          message: 'User Not Found',
        })
      if (changeFriendStatus(myEmail, inviter, 'ACCEPTED')) {
        socket.emit('friendResponse', {
          status: 'success',
          message: 'Friend Request Accepted',
        })
        const userSockets = await getSocketIds(inviter, 'sockets')
        if (userSockets)
          io.to(userSockets).emit('friendResponse', {
            status: 'success',
            message: `${myEmail} Accept Your Friend Request`,
            desc: 'ACCEPTED',
            hisEmail: myEmail,
          })
      } else {
        socket.emit('friendResponse', {
          status: 'error',
          message: 'Failed to accept Friend Request',
        })
      }
    } catch (err) {
      console.log('acceptFriend : ', err)
      socket.emit('friendResponse', {
        status: 'error',
        message: 'Failed to accept Friend Request',
      })
    }
  })
  //
  socket.on('rejectFriend', async (inviter) => {
    try {
      const myEmail = CryptoJS.AES.decrypt(
        socket.handshake.query.cryptedMail as string,
        key
      ).toString(CryptoJS.enc.Utf8)

      const user = getUserByEmail(inviter)
      if (!user)
        return socket.emit('friendResponse', {
          status: 'error',
          message: 'User Not Found',
        })
      if (changeFriendStatus(myEmail, inviter, 'REJECTED')) {
        socket.emit('friendResponse', {
          status: 'success',
          message: 'Friend Request declined',
        })
        const userSockets = await getSocketIds(inviter, 'sockets')
        if (userSockets)
          io.to(userSockets).emit('friendResponse', {
            status: 'error',
            message: `${myEmail} rejected Your Friend Request`,
            hisEmail: inviter,
            desc: '',
          })
      } else {
        socket.emit('friendResponse', {
          status: 'error',
          message: 'Failed to decline Friend Request',
        })
      }
    } catch (err) {
      console.log('rejectFriend : ', err)
      socket.emit('friendResponse', {
        status: 'error',
        message: 'Failed to decline Friend Request',
      })
    }
  })
}
