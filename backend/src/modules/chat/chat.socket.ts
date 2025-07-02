import { Namespace, Socket } from 'socket.io'
import { addSocketId, removeSocketId, io, getSocketIds } from '../../socket'
import { getFriend, getUserByEmail, getUserById } from '../user/user.service'
import { addMessage, getConversations } from './chat.controller'
import { db } from '../../app'
import CryptoJs from 'crypto-js'
import { changeFriendStatus } from '../friends/friends.socket'

interface SentMessageData {
  recieverId: number
  senderEmail: string
  senderId: number
  message: string
  image: string
}

export function setupChatNamespace(chatNamespace: Namespace) {
  chatNamespace.on('connection', (socket: Socket) => {
    const cryptedMail = socket.handshake.query.cryptedMail
    if (!cryptedMail) {
      console.error('No cryptedMail provided in handshake query')
      return
    }
    const key = process.env.ENCRYPTION_KEY as string
    const userEmail = CryptoJs.AES.decrypt(cryptedMail as string, key).toString(
      CryptoJs.enc.Utf8
    )
    if (!userEmail) {
      console.error('Failed to decrypt user email from cryptedMail')
      return
    }

    addSocketId(userEmail, socket.id, 'chat')

    //seen message

    socket.on('seenMessage', async ({ myId, id }) => {
      try {
        const sql = db.prepare(
          `UPDATE Messages SET seen = TRUE  WHERE (senderId = ? AND receiverId = ?)`
        )
        sql.run(id, myId)

        // Get the users involved
        const [me, otherUser]: any = await Promise.all([
          getUserById(myId),
          getUserById(id),
        ])

        if (!me || !otherUser) {
          return socket.emit('errorWhenSeeingAmessage', 'User not found')
        }

        // Emit to both users that the messages have been seen
        // Send to the user who just saw the message
        const mySockets = await getSocketIds(me.email, 'chat')
        if (mySockets?.length) {
          chatNamespace.to(mySockets).emit('messagesSeenUpdate', {
            conversationWith: id,
            seen: true,
          })
        }

        // Send to the other user that their messages have been seen
        const otherUserSockets = await getSocketIds(otherUser.email, 'chat')
        if (otherUserSockets?.length) {
          chatNamespace.to(otherUserSockets).emit('messagesSeenUpdate', {
            conversationWith: myId,
            seen: true,
          })
        }

        return
      } catch (err) {
        console.log(err)
        return socket.emit(
          'errorWhenSeeingAmessage',
          'Failed to mark messages as seen'
        )
      }
    })

    //searching for a user in chat
    socket.on('searchForUser', ({ searchedUser, email }) => {
      try {
        const sql = db.prepare(`
            SELECT
              f.id AS f_id,
              f.fromEmail,
              f.toEmail,
              f.status,

              u.id AS id,
              u.email AS email,
              u.username AS username,
              u.login AS login,
              u.level AS level,
              u.avatar AS avatar,
              u.type AS type,
              u.resetOtp AS resetOtp,
              u.resetOtpExpireAt AS resetOtpExpireAt

            FROM FriendRequest f
            JOIN User me ON me.email = ?
            JOIN User u ON (
              (f.fromEmail = me.email AND f.toEmail = u.email)
              OR
              (f.toEmail = me.email AND f.fromEmail = u.email)
            )
            WHERE (u.email LIKE ? OR u.username LIKE ? OR u.login LIKE ?) AND status = 'ACCEPTED';
          `)

        const rawUsers = sql.all(
          email,
          `${searchedUser}%`,
          `%${searchedUser}%`,
          `${searchedUser}%`
        )

        const users = rawUsers.map((row: any) => ({
          id: row.f_id,
          fromEmail: row.fromEmail,
          toEmail: row.toEmail,
          user: {
            id: row.id,
            email: row.email,
            username: row.username,
            login: row.login,
            level: row.level,
            avatar: row.avatar,
            type: row.type,
            resetOtp: row.resetOtp,
            resetOtpExpireAt: row.resetOtpExpireAt,
          },
        }))
        socket.emit('searchingInFriends', users)
      } catch (err) {
        console.log(err)

        return socket.emit('searchError', 'Error while Searching')
      }
    })

    socket.on('sendMessage', async (data) => {
      try {
        const bytes = CryptoJs.AES.decrypt(
          data,
          process.env.ENCRYPTION_KEY || ''
        )
        const dencrypt = JSON.parse(bytes.toString(CryptoJs.enc.Utf8))
        const {
          recieverId,
          senderEmail,
          senderId: myId,
          message,
          image,
        } = dencrypt as SentMessageData

        const [me, receiver]: any = await Promise.all([
          getUserByEmail(senderEmail),
          getUserById(recieverId),
        ])

        if (!me) {
          socket.emit('failedToSendMessage', 'Sender Not Found')
          return
        }

        if (!receiver) {
          socket.emit('failedToSendMessage', 'User Not Found')
          return
        }

        const friend = await getFriend(senderEmail, receiver.email)
        if (!friend) {
          socket.emit(
            'failedToSendMessage',
            'You are not friends with this user'
          )
          return
        }
        if (friend.isBlockedByMe || friend.isBlockedByHim) return //socket.emit('failedToSendMessage', 'This User Is Blocked')

        if (me.email === receiver.email) {
          socket.emit('failedToSendMessage', 'You cannot message yourself')
          return
        }

        const newMessage: any = await addMessage(
          myId,
          receiver.id,
          message,
          image
        )
        const conversationsPromise = getConversations(me.id, me.email)
        const receiverConversationsPromise = getConversations(
          receiver.id,
          receiver.email
        )

        const mySockets = await getSocketIds(me.email, 'chat')
        const recieverSockets = await getSocketIds(receiver.email, 'chat')
        const receiverGlobalSockets = await getSocketIds(
          receiver.email,
          'sockets'
        )

        const messagePayload = {
          ...newMessage,
          receiver,
          sender: me,
        }

        // const cryptedMessage = CryptoJs.AES.encrypt(
        //   JSON.stringify(messagePayload),
        //   key
        // ).toString()

        if (mySockets?.length) {
          chatNamespace.to(mySockets).emit('newMessage', messagePayload)

          const myConversations = await conversationsPromise
          chatNamespace.to(mySockets).emit('changeConvOrder', myConversations)
          chatNamespace.to(mySockets).emit('messageSent')
        }

        if (recieverSockets?.length) {
          chatNamespace.to(recieverSockets).emit('newMessage', messagePayload)

          const receiverConversations = await receiverConversationsPromise
          chatNamespace
            .to(recieverSockets)
            .emit('changeConvOrder', receiverConversations)
        }

        if (receiverGlobalSockets?.length) {
          io.to(receiverGlobalSockets).emit('newMessageNotification', {
            type: 'message',
            me,
            newMessage,
          })
        }
      } catch (error) {
        console.error('Error in sendMessage:', error)
        return socket.emit('failedToSendMessage', 'Internal server error')
      }
    })

    socket.on('disconnect', () => {
      const cryptedMail = socket.handshake.query.cryptedMail
      if (!cryptedMail) {
        console.error('No cryptedMail provided in handshake query')
        return
      }
      const key = process.env.ENCRYPTION_KEY as string
      const userEmail = CryptoJs.AES.decrypt(
        cryptedMail as string,
        key
      ).toString(CryptoJs.enc.Utf8)
      if (!userEmail) {
        console.error('Failed to decrypt user email from cryptedMail')
        return
      }

      removeSocketId(userEmail, socket.id, 'chat')
    })
  })
}
