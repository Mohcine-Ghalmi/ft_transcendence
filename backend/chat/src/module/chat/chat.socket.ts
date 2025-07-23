// chat back end running on port 5006
import { Namespace, Socket } from 'socket.io'
import { addSocketId, removeSocketId, getSocketIds } from '../../database/redis'
import { addMessage, getConversations } from './chat.controller'
import { db } from '../../app'
import CryptoJs from 'crypto-js'
import { io } from '../../socket'
import { getFriend, getUserById, getUserByEmail } from '../user/user.service'

interface SentMessageData {
  recieverId: number
  senderEmail: string
  senderId: number
  message: string
  image: string
}

async function checkSocketConnection(socket: any) {
  if (!socket || !socket.handshake || !socket.handshake.query) {
    return null
  }
  const key = process.env.ENCRYPTION_KEY || ''
  console.log('ENCRYPTION_KEY:', key)

  if (!key) {
    socket.emit('error-in-connection', {
      status: 'error',
      message: 'ENCRYPTION_KEY is not set in environment variables',
    })
    socket.disconnect(true)
    return null
  }
  try {
    const cryptedMail = socket.handshake.query.cryptedMail
    console.log('cryptedMail:', cryptedMail)

    const userEmail = CryptoJs.AES.decrypt(cryptedMail as string, key).toString(
      CryptoJs.enc.Utf8
    )
    console.log('userEmail:', userEmail)

    if (!userEmail) {
      socket.emit('error-in-connection', {
        status: 'error',
        message: 'Invalid email format',
      })
      socket.disconnect(true)
      return null
    }
    const me = await getUserByEmail(userEmail)

    if (!me) {
      socket.emit('error-in-connection', {
        status: 'error',
        message: 'User not found',
      })
      socket.disconnect(true)
      return null
    }
    return me
  } catch (err) {
    console.log('Error decrypting email:', err)

    socket.emit('error-in-connection', {
      status: 'error',
      message: 'Invalid email format',
    })
    socket.disconnect(true)
    return null
  }
}

export function setupChatNamespace(chatNamespace: Namespace) {
  chatNamespace.on('connection', async (socket: Socket) => {
    const key = process.env.ENCRYPTION_KEY || ''
    const me: any = await checkSocketConnection(socket)

    if (!me) return

    addSocketId(me.email, socket.id, 'chat')

    //seen message

    socket.on(
      'seenMessage',
      async ({ myId, id }: { myId: number; id: number }) => {
        try {
          if (!myId || !id)
            return socket.emit(
              'errorWhenSeeingAmessage',
              'Invalid IDs provided'
            )
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
        } catch (err: any) {
          console.log(err.message || err)
          return socket.emit(
            'errorWhenSeeingAmessage',
            err.message || 'Failed to mark messages as seen'
          )
        }
      }
    )

    //searching for a user in chat
    socket.on('searchForUser', async ({ searchedUser, email }) => {
      try {
        if (
          !searchedUser ||
          !email ||
          typeof searchedUser !== 'string' ||
          typeof email !== 'string'
        )
          return socket.emit('searchError', 'Invalid search parameters')
        if (email !== me.email)
          return socket.emit('searchError', 'You are not authorized to search')
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
      } catch (err: any) {
        return socket.emit(
          'searchError',
          err.message || 'Error while Searching'
        )
      }
    })

    socket.on('sendMessage', async (data) => {
      let dencrypt: SentMessageData = {} as SentMessageData
      try {
        if (!key)
          return socket.emit('failedToSendMessage', 'ENCRYPTION_KEY is not set')
        const bytes = CryptoJs.AES.decrypt(data, key)
        dencrypt = JSON.parse(bytes.toString(CryptoJs.enc.Utf8))
      } catch (err) {
        return socket.emit('failedToSendMessage', 'Invalid message data format')
      }
      try {
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

        if (!me || !receiver) {
          socket.emit('failedToSendMessage', 'Sender Not Found')
          return
        }

        const friend: any = await getFriend(senderEmail, receiver.email)
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

        const [conversationsPromise, receiverConversationsPromise] =
          await Promise.all([
            getConversations(me.id, me.email),
            getConversations(receiver.id, receiver.email),
          ])

        const mySockets = await getSocketIds(me.email, 'chat')
        const recieverSockets = await getSocketIds(receiver.email, 'chat')
        const receiverGlobalSockets = await getSocketIds(
          receiver.email,
          'sockets'
        )

        const messagePayload = {
          ...newMessage,
          receiver: {
            id: receiver.id,
            email: receiver.email,
            username: receiver.username,
            login: receiver.login,
            avatar: receiver.avatar,
          },
          sender: {
            id: me.id,
            email: me.email,
            username: me.username,
            login: me.login,
            avatar: me.avatar,
          },
        }

        if (mySockets?.length) {
          chatNamespace.to(mySockets).emit('newMessage', messagePayload)

          const myConversations = conversationsPromise
          chatNamespace.to(mySockets).emit('changeConvOrder', myConversations)
          chatNamespace.to(mySockets).emit('messageSent')
        }

        if (recieverSockets?.length) {
          chatNamespace.to(recieverSockets).emit('newMessage', messagePayload)

          const receiverConversations = receiverConversationsPromise
          chatNamespace
            .to(recieverSockets)
            .emit('changeConvOrder', receiverConversations)
        }

        if (receiverGlobalSockets?.length) {
          io.to(receiverGlobalSockets).emit('newNotification', {
            type: 'message',
            sender: {
              email: me.email,
              username: me.username,
              id: me.id,
              avatar: me.avatar,
              login: me.login,
            },
            message: newMessage.message || 'sent you a new message',
          })
        }
      } catch (error) {
        console.error('Error in sendMessage:', error)
        return socket.emit('failedToSendMessage', 'Internal server error')
      }
    })

    socket.on('disconnect', () => {
      if (!me || !me.email) {
        console.error('Failed to decrypt user email from cryptedMail')
        return
      }
      removeSocketId(me.email, socket.id, 'chat')
    })
  })
}
