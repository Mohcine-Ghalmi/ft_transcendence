import { Socket, Server } from 'socket.io'
import { getSocketIds } from '../../socket'
import { getFriend, getUserByEmail } from '../user/user.service'
import CryptoJS from 'crypto-js'
import crypto from 'crypto'

interface InviteToGameData {
  myEmail: string
  hisEmail: string
}
export function handleGameSocket(socket: Socket, io: Server) {
  socket.on('InviteToGame', async (data) => {
    try {
      const key = process.env.ENCRYPTION_KEY
      if (!key)
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: 'Encryption key is not defined.',
        })

      const bytes = CryptoJS.AES.decrypt(data, key)
      const decrypted = bytes.toString(CryptoJS.enc.Utf8)
      if (!decrypted)
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: 'Decryption returned empty string.',
        })

      const result = JSON.parse(decrypted)
      const { hisEmail: invitedUserEmail, myEmail } = result as InviteToGameData
      if (!myEmail || !invitedUserEmail) {
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: 'Missing required fields in decrypted data.',
        })
      }

      const [me, otherUser]: any = await Promise.all([
        getUserByEmail(myEmail),
        getUserByEmail(invitedUserEmail),
      ])

      if (!me || !otherUser) {
        socket.emit('InviteToGameResponse', {
          status: 'error',
          message: 'One or both users not found.',
        })
        return
      }

      if (me.email === otherUser.email) {
        socket.emit('InviteToGameResponse', {
          status: 'error',
          message: 'You cannot invite yourself to a game.',
        })
        return
      }
      const friend = await getFriend(myEmail, otherUser.email)
      if (!friend) {
        socket.emit('InviteToGameResponse', {
          status: 'error',
          message: 'You can only invite friends to a game.',
        })
        return
      }

      // Emit the invite to the invited user
      const invitedUserSocketIds =
        (await getSocketIds(invitedUserEmail, 'sockets')) || []

      if (invitedUserSocketIds.length === 0) {
        socket.emit('InviteToGameResponse', {
          status: 'error',
          message: `User ${invitedUserEmail} is not online.`,
        })
        return
      }

      const gameId = crypto.randomUUID()
      io.to(invitedUserSocketIds).emit('InviteToGameResponse', {
        type: 'game',
        from: myEmail,
        message: `You have been invited to a game by ${me.username} .`,
        hostEmail: me.email,
        userData: {
          username: me.username,
          email: me.email,
          avatar: me.avatar,
          level: me.level,
          login: me.login,
          xp: me.xp,
        },
        gameId,
      })

      socket.emit('InviteToGameResponse', {
        type: 'game',
        status: 'success',
        message: `Invite sent to ${invitedUserEmail}.`,
        hostEmail: me.email,
        userData: {
          username: otherUser.username,
          email: otherUser.email,
          avatar: otherUser.avatar,
          level: otherUser.level,
          xp: otherUser.xp,
          login: otherUser.login,
        },
        gameId,
      })
    } catch (err) {
      return socket.emit('InviteToGameResponse', {
        status: 'error',
        message: 'Failed to decrypt invite data. Please try again.',
      })
    }
  })
}
