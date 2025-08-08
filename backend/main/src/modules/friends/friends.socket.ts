import type { Server, Socket } from 'socket.io'
import CryptoJS from 'crypto-js'
import { getUserByEmail } from '../user/user.service'
import server, { db } from '../../app'
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
  } catch (err: any) {
    server.log.error('changeFriendStatus : ', err.message)
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
  } catch (err: any) {
    server.log.error('addFriendRequest : ', err.message)
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

      const [invitedUser, me]: any = await Promise.all([
        getUserByEmail(toEmail),
        getUserByEmail(myEmail),
      ])

      if (!invitedUser || !me)
        return socket.emit('friendResponse', {
          status: 'error',
          message: 'User Not Found',
        })

      const [userSockets, mySockets] = await Promise.all([
        getSocketIds(invitedUser.email, 'sockets'),
        getSocketIds(me.email, 'sockets'),
      ])

      const isAdded = addFriendRequest(myEmail, toEmail)

      if (isAdded) {
        io.to(mySockets).emit('friendResponse', {
          status: 'success',
          desc: 'PENDING',
          message: 'Friend Request sent',
          hisEmail: toEmail,
          fromEmail: myEmail,
        })

        if (userSockets?.length) {
          io.to(userSockets).emit('newNotification', {
            type: 'friend_request',
            message: `You received a friend request from ${me.login}`,
            senderEmail: myEmail,
            desc: 'PENDING',
          })

          io.to(userSockets).emit('friendResponse', {
            status: 'success',
            desc: 'PENDING',
            message: `Friend request from ${me.login}`,
            hisEmail: myEmail,
            fromEmail: myEmail,
          })
        }
      } else {
        socket.emit('friendResponse', {
          status: 'error',
          message: 'Failed to send Friend Request',
        })
      }
    } catch (err: any) {
      server.log.error('addFriend : ', err.message)
      socket.emit('friendResponse', {
        status: 'success',
        message: err.message || 'Friend Request sent',
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

      const user = await getUserByEmail(inviter)
      if (!user)
        return socket.emit('friendResponse', {
          status: 'error',
          message: 'User Not Found',
        })
      if (changeFriendStatus(myEmail, inviter, 'ACCEPTED')) {
        const [me, inviterUser] = await Promise.all([
          getUserByEmail(myEmail),
          getUserByEmail(inviter),
        ])

        const [mySockets, inviterSockets] = await Promise.all([
          getSocketIds(myEmail, 'sockets'),
          getSocketIds(inviter, 'sockets'),
        ])

        io.to(mySockets).emit('friendResponse', {
          status: 'success',
          message: 'Friend Request Accepted',
          desc: 'ACCEPTED',
          hisEmail: inviter,
          fromEmail: inviter,
        })

        if (inviterSockets?.length) {
          io.to(inviterSockets).emit('friendResponse', {
            status: 'success',
            message: `${myEmail} accepted your Friend Request`,
            desc: 'ACCEPTED',
            hisEmail: myEmail,
            fromEmail: myEmail,
          })

          io.to(inviterSockets).emit('newNotification', {
            type: 'friend_accepted',
            message: `${myEmail} accepted your Friend Request`,
            senderEmail: myEmail,
            desc: 'ACCEPTED',
          })
        }
      } else {
        socket.emit('friendResponse', {
          status: 'error',
          message: 'Failed to accept Friend Request',
        })
      }
    } catch (err: any) {
      server.log.error('acceptFriend : ', err.message)
      socket.emit('friendResponse', {
        status: 'error',
        message: err.message || 'Failed to accept Friend Request',
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

      const user = await getUserByEmail(inviter)
      if (!user)
        return socket.emit('friendResponse', {
          status: 'error',
          message: 'User Not Found',
        })
      if (changeFriendStatus(myEmail, inviter, 'REJECTED')) {
        const [mySockets, inviterSockets] = await Promise.all([
          getSocketIds(myEmail, 'sockets'),
          getSocketIds(inviter, 'sockets'),
        ])

        io.to(mySockets).emit('friendResponse', {
          status: 'success',
          message: 'Friend Request declined',
          desc: 'REJECTED',
          hisEmail: inviter,
          fromEmail: inviter,
        })

        if (inviterSockets?.length) {
          io.to(inviterSockets).emit('friendResponse', {
            status: 'success',
            message: `${myEmail} declined your Friend Request`,
            desc: 'REJECTED',
            hisEmail: myEmail,
            fromEmail: myEmail,
          })

          io.to(inviterSockets).emit('newNotification', {
            type: 'friend_rejected',
            message: `${myEmail} declined your Friend Request`,
            senderEmail: myEmail,
            desc: 'REJECTED',
          })
        }
      } else {
        socket.emit('friendResponse', {
          status: 'error',
          message: 'Failed to decline Friend Request',
        })
      }
    } catch (err: any) {
      server.log.error('rejectFriend : ', err.message)
      socket.emit('friendResponse', {
        status: 'error',
        message: err.message || 'Failed to decline Friend Request',
      })
    }
  })
}
