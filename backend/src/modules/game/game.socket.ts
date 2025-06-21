// modules/game/game.socket.ts
import { Socket, Server } from 'socket.io'
import { getSocketIds } from '../../socket'
import { getFriend, getUserByEmail } from '../user/user.service'
import { createMatchHistory } from './game.service'
import CryptoJS from 'crypto-js'
import crypto from 'crypto'
import redis from '../../utils/redis'

interface InviteToGameData {
  myEmail: string
  hisEmail: string
}

interface GameInviteData {
  gameId: string
  hostEmail: string
  guestEmail: string
  createdAt: number
}

interface GameRoomData {
  gameId: string
  hostEmail: string
  guestEmail: string
  status: 'waiting' | 'accepted' | 'in_progress' | 'completed' | 'canceled'
  createdAt: number
  startedAt?: number
  endedAt?: number
}

interface GameState {
  gameId: string
  ballX: number
  ballY: number
  ballDx: number
  ballDy: number
  paddle1Y: number
  paddle2Y: number
  scores: {
    p1: number
    p2: number
  }
  gameStatus: 'waiting' | 'playing' | 'paused' | 'finished'
  winner?: string
  lastUpdate: number
}

interface User {
  username: string
  email: string
  avatar: string
  level: number
  login: string
  xp: number
  id: number
}

// Store active game states
const activeGames = new Map<string, GameState>()

export function handleGameSocket(socket: Socket, io: Server) {
  
  // Handle sending game invitations
  socket.on('InviteToGame', async (encryptedData: string) => {
    try {
      const key = process.env.ENCRYPTION_KEY
      if (!key) {
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: 'Server configuration error.',
        })
      }

      // Decrypt the invitation data
      const bytes = CryptoJS.AES.decrypt(encryptedData, key)
      const decrypted = bytes.toString(CryptoJS.enc.Utf8)
      
      if (!decrypted) {
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: 'Invalid invitation data.',
        })
      }

      const { hisEmail: invitedUserEmail, myEmail } = JSON.parse(decrypted) as InviteToGameData
      
      if (!myEmail || !invitedUserEmail) {
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: 'Missing required information.',
        })
      }

      // Validate users exist and are friends
      const [hostUser, guestUser] = await Promise.all([
        getUserByEmail(myEmail),
        getUserByEmail(invitedUserEmail),
      ])

      const host = hostUser as unknown as User
      const guest = guestUser as unknown as User

      if (!host || !guest) {
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: 'One or both users not found.',
        })
      }

      if (host.email === guest.email) {
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: 'Cannot invite yourself.',
        })
      }

      // Check if users are friends
      const friendship = await getFriend(myEmail, guest.email)
      if (!friendship) {
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: 'You can only invite friends to play.',
        })
      }

      // Check if guest already has a pending invite
      const existingInvite = await redis.get(`game_invite:${invitedUserEmail}`)
      if (existingInvite) {
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: `${guest.username} already has a pending invitation.`,
        })
      }

      // Check if guest is online
      const guestSocketIds = await getSocketIds(invitedUserEmail, 'sockets') || []
      if (guestSocketIds.length === 0) {
        return socket.emit('InviteToGameResponse', {
          status: 'error',
          message: `${guest.username} is not online.`,
        })
      }

      // Generate unique game ID
      const gameId = crypto.randomUUID()
      
      // Store invitation in Redis with 30-second expiration
      const inviteData: GameInviteData = {
        gameId,
        hostEmail: host.email,
        guestEmail: guest.email,
        createdAt: Date.now()
      }
      
      await Promise.all([
        redis.setex(`game_invite:${gameId}`, 30, JSON.stringify(inviteData)),
        redis.setex(`game_invite:${guest.email}`, 30, gameId)
      ])

      // Send invitation to guest
      io.to(guestSocketIds).emit('GameInviteReceived', {
        type: 'game_invite',
        gameId,
        hostEmail: host.email,
        message: `${host.username} invited you to play!`,
        hostData: {
          username: host.username,
          email: host.email,
          avatar: host.avatar,
          level: host.level,
          login: host.login,
          xp: host.xp,
        },
        expiresAt: Date.now() + 30000
      })

      // Confirm to host
      socket.emit('InviteToGameResponse', {
        type: 'invite_sent',
        status: 'success',
        message: `Invitation sent to ${guest.username}`,
        gameId,
        guestEmail: guest.email,
        guestData: {
          username: guest.username,
          email: guest.email,
          avatar: guest.avatar,
          level: guest.level,
          xp: guest.xp,
          login: guest.login,
        }
      })

      // Auto-expire invitation after 30 seconds
      setTimeout(async () => {
        try {
          const stillExists = await redis.get(`game_invite:${gameId}`)
          if (stillExists) {
            await Promise.all([
              redis.del(`game_invite:${gameId}`),
              redis.del(`game_invite:${guest.email}`)
            ])
            
            const hostSocketIds = await getSocketIds(host.email, 'sockets') || []
            const currentGuestSocketIds = await getSocketIds(guest.email, 'sockets') || []
            
            io.to(hostSocketIds).emit('GameInviteTimeout', { gameId })
            io.to(currentGuestSocketIds).emit('GameInviteTimeout', { gameId })
          }
        } catch (error) {
          console.error('Error in invitation timeout:', error)
        }
      }, 30000)

    } catch (error) {
      console.error('Error in InviteToGame:', error)
      socket.emit('InviteToGameResponse', {
        status: 'error',
        message: 'Failed to send invitation. Please try again.',
      })
    }
  })

  // Handle accepting game invitations
  socket.on('AcceptGameInvite', async (data: { gameId: string; guestEmail: string }) => {
    try {
      const { gameId, guestEmail } = data
      
      if (!gameId || !guestEmail) {
        return socket.emit('GameInviteResponse', {
          status: 'error',
          message: 'Missing required information.',
        })
      }

      // Get invitation data
      const inviteData = await redis.get(`game_invite:${gameId}`)
      if (!inviteData) {
        return socket.emit('GameInviteResponse', {
          status: 'error',
          message: 'Invitation has expired.',
        })
      }

      const invite: GameInviteData = JSON.parse(inviteData)
      
      if (invite.guestEmail !== guestEmail) {
        return socket.emit('GameInviteResponse', {
          status: 'error',
          message: 'Invalid invitation.',
        })
      }

      // Clean up invitation
      await Promise.all([
        redis.del(`game_invite:${gameId}`),
        redis.del(`game_invite:${guestEmail}`)
      ])

      // Get user data
      const [hostUser, guestUser] = await Promise.all([
        getUserByEmail(invite.hostEmail),
        getUserByEmail(invite.guestEmail)
      ])

      const host = hostUser as unknown as User
      const guest = guestUser as unknown as User

      if (!host || !guest) {
        return socket.emit('GameInviteResponse', {
          status: 'error',
          message: 'User data not found.',
        })
      }

      // Create game room
      const gameRoomData: GameRoomData = {
        gameId,
        hostEmail: host.email,
        guestEmail: guest.email,
        status: 'accepted',
        createdAt: Date.now()
      }
      
      await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoomData))

      // Notify both players
      const hostSocketIds = await getSocketIds(host.email, 'sockets') || []
      const guestSocketIds = await getSocketIds(guest.email, 'sockets') || []

      console.log('Game accepted - Host socket IDs:', hostSocketIds, 'Guest socket IDs:', guestSocketIds)

      const acceptedData = {
        gameId,
        status: 'ready_to_start',
        acceptedBy: guest.email
      }

      console.log('Emitting GameInviteAccepted to host:', {
        ...acceptedData,
        guestData: {
          username: guest.username,
          email: guest.email,
          avatar: guest.avatar,
          level: guest.level,
          xp: guest.xp,
          login: guest.login,
        }
      })

      io.to(hostSocketIds).emit('GameInviteAccepted', {
        ...acceptedData,
        guestData: {
          username: guest.username,
          email: guest.email,
          avatar: guest.avatar,
          level: guest.level,
          xp: guest.xp,
          login: guest.login,
        }
      })

      console.log('Emitting GameInviteAccepted to guest:', {
        ...acceptedData,
        hostData: {
          username: host.username,
          email: host.email,
          avatar: host.avatar,
          level: host.level,
          xp: host.xp,
          login: host.login,
        }
      })

      io.to(guestSocketIds).emit('GameInviteAccepted', {
        ...acceptedData,
        hostData: {
          username: host.username,
          email: host.email,
          avatar: host.avatar,
          level: host.level,
          xp: host.xp,
          login: host.login,
        }
      })

    } catch (error) {
      console.error('Error in AcceptGameInvite:', error)
      socket.emit('GameInviteResponse', {
        status: 'error',
        message: 'Failed to accept invitation.',
      })
    }
  })

  // Handle declining game invitations
  socket.on('DeclineGameInvite', async (data: { gameId: string; guestEmail: string }) => {
    try {
      const { gameId, guestEmail } = data
      
      if (!gameId || !guestEmail) {
        return socket.emit('GameInviteResponse', {
          status: 'error',
          message: 'Missing required information.',
        })
      }

      const inviteData = await redis.get(`game_invite:${gameId}`)
      if (!inviteData) {
        return socket.emit('GameInviteResponse', {
          status: 'error',
          message: 'Invitation has expired.',
        })
      }

      const invite: GameInviteData = JSON.parse(inviteData)
      
      if (invite.guestEmail !== guestEmail) {
        return socket.emit('GameInviteResponse', {
          status: 'error',
          message: 'Invalid invitation.',
        })
      }

      // Clean up invitation
      await Promise.all([
        redis.del(`game_invite:${gameId}`),
        redis.del(`game_invite:${guestEmail}`)
      ])

      const guestUser = await getUserByEmail(invite.guestEmail)
      const guest = guestUser as unknown as User

      if (guest) {
        // Notify host of decline
        const hostSocketIds = await getSocketIds(invite.hostEmail, 'sockets') || []
        io.to(hostSocketIds).emit('GameInviteDeclined', {
          gameId,
          declinedBy: guest.email,
          guestName: guest.username
        })
      }

      // Confirm to guest
      socket.emit('GameInviteResponse', {
        status: 'success',
        message: 'Invitation declined.',
      })

    } catch (error) {
      console.error('Error in DeclineGameInvite:', error)
      socket.emit('GameInviteResponse', {
        status: 'error',
        message: 'Failed to decline invitation.',
      })
    }
  })

  // Handle starting the game
  socket.on('StartGame', async (data: { gameId: string }) => {
    try {
      const { gameId } = data
      
      console.log('StartGame event received:', { gameId, socketId: socket.id })
      
      if (!gameId) {
        console.log('StartGame error: Missing game ID')
        return socket.emit('GameStartResponse', {
          status: 'error',
          message: 'Missing game ID.',
        })
      }

      const gameRoomData = await redis.get(`game_room:${gameId}`)
      console.log('Game room data retrieved:', gameRoomData ? 'exists' : 'not found')
      
      if (!gameRoomData) {
        console.log('StartGame error: Game room not found')
        return socket.emit('GameStartResponse', {
          status: 'error',
          message: 'Game room not found.',
        })
      }

      const gameRoom: GameRoomData = JSON.parse(gameRoomData)
      console.log('Game room status:', gameRoom.status)
      
      if (gameRoom.status !== 'accepted') {
        console.log('StartGame error: Game not ready to start, status:', gameRoom.status)
        return socket.emit('GameStartResponse', {
          status: 'error',
          message: 'Game is not ready to start.',
        })
      }

      // Update game status
      gameRoom.status = 'in_progress'
      gameRoom.startedAt = Date.now()
      await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom))
      console.log('Game room updated to in_progress')

      // Initialize game state
      const gameState: GameState = {
        gameId,
        ballX: 440, // Center of 880 width
        ballY: 247.5, // Center of 495 height
        ballDx: 6 * (Math.random() > 0.5 ? 1 : -1),
        ballDy: 6 * (Math.random() > 0.5 ? 1 : -1),
        paddle1Y: 202.5, // Center of paddle (495 - 90) / 2
        paddle2Y: 202.5,
        scores: { p1: 0, p2: 0 },
        gameStatus: 'playing',
        lastUpdate: Date.now()
      }
      
      activeGames.set(gameId, gameState)
      console.log('Game state initialized and stored')

      // Notify both players
      const hostSocketIds = await getSocketIds(gameRoom.hostEmail, 'sockets') || []
      const guestSocketIds = await getSocketIds(gameRoom.guestEmail, 'sockets') || []

      console.log('Game starting - Host socket IDs:', hostSocketIds, 'Guest socket IDs:', guestSocketIds)

      const gameStartData = {
        gameId,
        status: 'game_started',
        players: {
          host: gameRoom.hostEmail,
          guest: gameRoom.guestEmail
        },
        startedAt: gameRoom.startedAt,
        gameState
      }

      console.log('Emitting GameStarted to both players:', gameStartData)

      io.to([...hostSocketIds, ...guestSocketIds]).emit('GameStarted', gameStartData)

      socket.emit('GameStartResponse', {
        status: 'success',
        message: 'Game started successfully.',
      })

      console.log('GameStartResponse sent to host')

    } catch (error) {
      console.error('Error in StartGame:', error)
      socket.emit('GameStartResponse', {
        status: 'error',
        message: 'Failed to start game.',
      })
    }
  })

  // Handle game state updates
  socket.on('GameStateUpdate', async (data: { gameId: string; gameState: GameState }) => {
    try {
      const { gameId, gameState } = data
      
      if (!gameId || !gameState) {
        return
      }

      // Update the game state
      activeGames.set(gameId, {
        ...gameState,
        lastUpdate: Date.now()
      })

      // Get game room to find players
      const gameRoomData = await redis.get(`game_room:${gameId}`)
      if (!gameRoomData) return

      const gameRoom: GameRoomData = JSON.parse(gameRoomData)
      
      // Broadcast to both players
      const hostSocketIds = await getSocketIds(gameRoom.hostEmail, 'sockets') || []
      const guestSocketIds = await getSocketIds(gameRoom.guestEmail, 'sockets') || []

      io.to([...hostSocketIds, ...guestSocketIds]).emit('GameStateUpdate', {
        gameId,
        gameState: activeGames.get(gameId)
      })

    } catch (error) {
      console.error('Error in GameStateUpdate:', error)
    }
  })

  // Handle game end
  socket.on('GameEnd', async (data: { 
    gameId: string; 
    winner: string; 
    loser: string; 
    finalScore: { p1: number; p2: number };
    reason?: 'normal_end' | 'player_left' | 'timeout'
  }) => {
    try {
      const { gameId, winner, loser, finalScore, reason = 'normal_end' } = data
      
      if (!gameId || !winner || !loser) {
        return
      }

      // Get game room
      const gameRoomData = await redis.get(`game_room:${gameId}`)
      if (!gameRoomData) return

      const gameRoom: GameRoomData = JSON.parse(gameRoomData)
      
      // Update game status
      gameRoom.status = 'completed'
      gameRoom.endedAt = Date.now()
      await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom))

      // Calculate game duration
      const gameDuration = gameRoom.startedAt && gameRoom.endedAt 
        ? Math.floor((gameRoom.endedAt - gameRoom.startedAt) / 1000)
        : 0

      // Save match history
      await createMatchHistory({
        gameId,
        player1Email: gameRoom.hostEmail,
        player2Email: gameRoom.guestEmail,
        player1Score: finalScore.p1,
        player2Score: finalScore.p2,
        winner,
        loser,
        gameDuration,
        startedAt: gameRoom.startedAt || Date.now(),
        endedAt: gameRoom.endedAt || Date.now(),
        gameMode: '1v1',
        status: reason === 'player_left' ? 'forfeit' : 'completed'
      })

      // Remove from active games
      activeGames.delete(gameId)

      // Notify both players
      const hostSocketIds = await getSocketIds(gameRoom.hostEmail, 'sockets') || []
      const guestSocketIds = await getSocketIds(gameRoom.guestEmail, 'sockets') || []

      io.to([...hostSocketIds, ...guestSocketIds]).emit('GameEnded', {
        gameId,
        winner,
        loser,
        finalScore,
        gameDuration,
        reason
      })

    } catch (error) {
      console.error('Error in GameEnd:', error)
    }
  })

  // Handle player leaving game
  socket.on('LeaveGame', async (data: { gameId: string; playerEmail: string }) => {
    try {
      const { gameId, playerEmail } = data
      
      if (!gameId || !playerEmail) {
        return socket.emit('GameResponse', {
          status: 'error',
          message: 'Missing required information.',
        })
      }

      const gameRoomData = await redis.get(`game_room:${gameId}`)
      if (!gameRoomData) {
        return socket.emit('GameResponse', {
          status: 'error',
          message: 'Game room not found.',
        })
      }

      const gameRoom: GameRoomData = JSON.parse(gameRoomData)
      
      // Determine winner and loser
      const otherPlayerEmail = gameRoom.hostEmail === playerEmail ? gameRoom.guestEmail : gameRoom.hostEmail
      const winner = otherPlayerEmail
      const loser = playerEmail

      // Get current game state for final score
      const currentGameState = activeGames.get(gameId)
      const finalScore = currentGameState?.scores || { p1: 0, p2: 0 }

      // Emit game end event
      socket.emit('GameEnd', {
        gameId,
        winner,
        loser,
        finalScore,
        reason: 'player_left'
      })

      // Notify other player
      const otherPlayerSocketIds = await getSocketIds(otherPlayerEmail, 'sockets') || []
      
      io.to(otherPlayerSocketIds).emit('PlayerLeft', {
        gameId,
        playerWhoLeft: playerEmail,
        reason: 'player_left'
      })

      socket.emit('GameResponse', {
        status: 'success',
        message: 'Left game successfully.',
      })

    } catch (error) {
      console.error('Error in LeaveGame:', error)
      socket.emit('GameResponse', {
        status: 'error',
        message: 'Failed to leave game.',
      })
    }
  })

  // Handle canceling invitations
  socket.on('CancelGameInvite', async (data: { gameId: string; hostEmail: string }) => {
    try {
      const { gameId, hostEmail } = data
      
      if (!gameId || !hostEmail) {
        return socket.emit('GameInviteResponse', {
          status: 'error',
          message: 'Missing required information.',
        })
      }

      const inviteData = await redis.get(`game_invite:${gameId}`)
      if (!inviteData) {
        return socket.emit('GameInviteResponse', {
          status: 'error',
          message: 'Invitation not found or expired.',
        })
      }

      const invite: GameInviteData = JSON.parse(inviteData)
      
      if (invite.hostEmail !== hostEmail) {
        return socket.emit('GameInviteResponse', {
          status: 'error',
          message: 'You can only cancel your own invitations.',
        })
      }

      // Clean up invitation
      await Promise.all([
        redis.del(`game_invite:${gameId}`),
        redis.del(`game_invite:${invite.guestEmail}`)
      ])

      // Notify guest
      const guestSocketIds = await getSocketIds(invite.guestEmail, 'sockets') || []
      io.to(guestSocketIds).emit('GameInviteCanceled', {
        gameId,
        canceledBy: hostEmail
      })

      // Confirm to host
      socket.emit('GameInviteResponse', {
        status: 'success',
        message: 'Invitation canceled.',
      })

    } catch (error) {
      console.error('Error in CancelGameInvite:', error)
      socket.emit('GameInviteResponse', {
        status: 'error',
        message: 'Failed to cancel invitation.',
      })
    }
  })

  // Handle game cleanup on disconnect
  socket.on('disconnect', async () => {
    try {
      // Clean up any active games for this socket
      // This would require storing socket-to-user mappings
      console.log('Player disconnected, cleaning up game state...')
      
      // For now, we'll rely on the client to properly handle disconnection
      // In a production environment, you'd want to track socket-to-user mappings
      // and handle disconnections more gracefully
    } catch (error) {
      console.error('Error in disconnect cleanup:', error)
    }
  })
}