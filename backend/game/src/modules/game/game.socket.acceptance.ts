import { Socket, Server } from 'socket.io'
import { getUserByEmail } from '../user/user.service'
import {
  GameInviteData,
  GameRoomData,
  User,
  getPlayerData,
  gameRooms,
  GameSocketHandler,
  getUserCurrentGame,
  activeGames
} from './game.socket.types'
import redis, { getSocketIds } from '../../database/redis'

async function isUserInActiveGame(userEmail: string): Promise<{
  isInGame: boolean;
  gameId?: string;
  gameStatus?: string;
}> {
  try {
    const currentGameId = getUserCurrentGame(userEmail);
    if (currentGameId) {
      const gameRoom = gameRooms.get(currentGameId);
      if (gameRoom && (gameRoom.status === 'accepted' || gameRoom.status === 'in_progress')) {
        return {
          isInGame: true,
          gameId: currentGameId,
          gameStatus: gameRoom.status
        };
      }
    }

    const redisGameRooms = await redis.keys('game_room:*');
    for (const roomKey of redisGameRooms) {
      const gameRoomData = await redis.get(roomKey);
      if (gameRoomData) {
        try {
          const gameRoom: GameRoomData = JSON.parse(gameRoomData);
          if ((gameRoom.hostEmail === userEmail || gameRoom.guestEmail === userEmail) && 
              (gameRoom.status === 'accepted' || gameRoom.status === 'in_progress')) {
            return {
              isInGame: true,
              gameId: gameRoom.gameId,
              gameStatus: gameRoom.status
            };
          }
        } catch (parseError) {
          await redis.del(roomKey);
        }
      }
    }

    return { isInGame: false };
  } catch (error) {
    return { isInGame: false };
  }
}

async function cleanupAllUserInvitations(userEmail: string, acceptedGameId?: string): Promise<{
  cleanedInvitations: Array<{
    gameId: string;
    type: 'sent' | 'received';
    otherPlayerEmail: string;
  }>;
  affectedPlayers: Set<string>;
}> {
  try {
    const allInviteKeys = await redis.keys('game_invite:*');
    const cleanedInvitations: Array<{
      gameId: string;
      type: 'sent' | 'received';
      otherPlayerEmail: string;
    }> = [];
    const affectedPlayers = new Set<string>();
    
    for (const key of allInviteKeys) {
      if (acceptedGameId && key === `game_invite:${acceptedGameId}`) {
        continue;
      }
      
      const inviteData = await redis.get(key);
      if (inviteData) {
        try {
          const invite: GameInviteData = JSON.parse(inviteData);
          if (invite.hostEmail === userEmail || invite.guestEmail === userEmail) {
            const invitationType = invite.hostEmail === userEmail ? 'sent' : 'received';
            const otherPlayerEmail = invite.hostEmail === userEmail ? invite.guestEmail : invite.hostEmail;
            if (acceptedGameId && invite.gameId === acceptedGameId) {
              continue;
            }
            await Promise.all([
              redis.del(key),
              redis.del(`game_invite:${invite.hostEmail}:${invite.guestEmail}`),
              redis.del(`game_invite:${invite.guestEmail}:${invite.hostEmail}`)
            ]);
            cleanedInvitations.push({
              gameId: invite.gameId,
              type: invitationType,
              otherPlayerEmail
            });
            affectedPlayers.add(otherPlayerEmail);
          }
        } catch (parseError) {
          await redis.del(key);
        }
      }
    }
    
    return { cleanedInvitations, affectedPlayers };
  } catch (error) {
    return { cleanedInvitations: [], affectedPlayers: new Set() };
  }
}

async function notifyAffectedPlayers(
  io: Server,
  cleanedInvitations: Array<{
    gameId: string;
    type: 'sent' | 'received';
    otherPlayerEmail: string;
  }>,
  acceptingPlayerEmail: string,
  acceptingPlayerName: string
) {
  const playerInvitations = new Map<string, Array<{
    gameId: string;
    type: 'sent' | 'received';
  }>>();
  
  for (const invitation of cleanedInvitations) {
    if (!playerInvitations.has(invitation.otherPlayerEmail)) {
      playerInvitations.set(invitation.otherPlayerEmail, []);
    }
    playerInvitations.get(invitation.otherPlayerEmail)!.push({
      gameId: invitation.gameId,
      type: invitation.type === 'sent' ? 'received' : 'sent'
    });
  }
  
  for (const [playerEmail, invitations] of playerInvitations.entries()) {
    const playerSocketIds = await getSocketIds(playerEmail, 'sockets') || [];
    if (playerSocketIds.length > 0) {
      io.to(playerSocketIds).emit('GameInvitationsCleanup', {
        reason: 'player_accepted_other_invitation',
        acceptingPlayer: acceptingPlayerName,
        acceptingPlayerEmail,
        cleanedInvitations: invitations,
        message: `${acceptingPlayerName} accepted a game invitation. All other pending invitations have been cleared.`,
        timestamp: Date.now()
      });
      
      for (const invitation of invitations) {
        if (invitation.type === 'received') {
          io.to(playerSocketIds).emit('GameInviteDeclined', {
            gameId: invitation.gameId,
            declinedBy: acceptingPlayerEmail,
            reason: 'auto_declined_player_busy',
            message: `${acceptingPlayerName} is now in a game and cannot accept your invitation`
          });
        } else {
          io.to(playerSocketIds).emit('GameInviteCanceled', {
            gameId: invitation.gameId,
            canceledBy: acceptingPlayerEmail,
            reason: 'auto_canceled_player_busy',
            message: `${acceptingPlayerName} accepted another invitation`
          });
        }
        
        io.to(playerSocketIds).emit('GameInviteCleanup', {
          gameId: invitation.gameId,
          action: 'auto_cleanup',
          reason: 'player_accepted_other_invitation',
          message: `Invitation cleared because ${acceptingPlayerName} accepted another game`
        });
      }
    }
  }
}

export const handleGameAcceptance: GameSocketHandler = (
  socket: Socket,
  io: Server
) => {
  socket.on(
    'AcceptGameInvite',
    async (data: { gameId: string; guestEmail: string }) => {
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

        const hostGameStatus = await isUserInActiveGame(invite.hostEmail);
        if (hostGameStatus.isInGame) {
          await Promise.all([
            redis.del(`game_invite:${gameId}`),
            redis.del(`game_invite:${invite.hostEmail}:${guestEmail}`), 
            redis.del(`game_invite:${guestEmail}:${invite.hostEmail}`),
          ]);

          return socket.emit('GameInviteResponse', {
            status: 'error',
            message: 'The sender is already in an active game and cannot start a new one.',
            reason: 'host_in_game',
            hostGameStatus: hostGameStatus.gameStatus
          });
        }

        const guestGameStatus = await isUserInActiveGame(guestEmail);
        if (guestGameStatus.isInGame) {
          await Promise.all([
            redis.del(`game_invite:${gameId}`),
            redis.del(`game_invite:${invite.hostEmail}:${guestEmail}`), 
            redis.del(`game_invite:${guestEmail}:${invite.hostEmail}`),
          ]);

          const hostSocketIds = (await getSocketIds(invite.hostEmail, 'sockets')) || [];
          if (hostSocketIds.length > 0) {
            io.to(hostSocketIds).emit('GameInviteDeclined', {
              gameId,
              declinedBy: guestEmail,
              reason: 'guest_in_game',
              message: 'Guest is already in an active game'
            });
          }

          return socket.emit('GameInviteResponse', {
            status: 'error',
            message: 'You are already in an active game. Please finish your current game first.',
            reason: 'guest_in_game',
            currentGameId: guestGameStatus.gameId
          });
        }

        const [hostUser, guestUser] = await Promise.all([
          getUserByEmail(invite.hostEmail),
          getUserByEmail(invite.guestEmail),
        ])

        const host = hostUser as unknown as User
        const guest = guestUser as unknown as User

        if (!host || !guest) {
          return socket.emit('GameInviteResponse', {
            status: 'error',
            message: 'User data not found.',
          })
        }

        const [hostCleanup, guestCleanup] = await Promise.all([
          cleanupAllUserInvitations(invite.hostEmail, gameId),
          cleanupAllUserInvitations(invite.guestEmail, gameId)
        ]);

        await Promise.all([
          redis.del(`game_invite:${gameId}`),
          redis.del(`game_invite:${invite.hostEmail}:${guestEmail}`), 
          redis.del(`game_invite:${guestEmail}:${invite.hostEmail}`),
        ])

        const gameRoomData: GameRoomData = {
          gameId,
          hostEmail: host.email,
          guestEmail: guest.email,
          status: 'accepted',
          createdAt: Date.now(),
        }

        await redis.setex(
          `game_room:${gameId}`,
          3600,
          JSON.stringify(gameRoomData)
        )
        gameRooms.set(gameId, gameRoomData)

        const hostSocketIds = (await getSocketIds(host.email, 'sockets')) || []
        const guestSocketIds = (await getSocketIds(guest.email, 'sockets')) || []

        const acceptedData = {
          gameId,
          status: 'ready_to_start',
          acceptedBy: guest.email,
        }

        socket.emit('GameInviteAccepted', {
          ...acceptedData,
          hostEmail: host.email,
          guestEmail: guest.email,
          hostData: getPlayerData(host),
        })

        if (hostSocketIds.length > 0) {
          io.to(hostSocketIds).emit('GameInviteAccepted', {
            ...acceptedData,
            hostEmail: host.email,
            guestEmail: guest.email,
            guestData: getPlayerData(guest),
            isHostNotification: true,
          })
        }

        if (hostCleanup.cleanedInvitations.length > 0) {
          await notifyAffectedPlayers(
            io,
            hostCleanup.cleanedInvitations,
            host.email,
            host.username || host.login || 'Host'
          );
        }

        if (guestCleanup.cleanedInvitations.length > 0) {
          await notifyAffectedPlayers(
            io,
            guestCleanup.cleanedInvitations,
            guest.email,
            guest.username || guest.login || 'Guest'
          );
        }

        const otherGuestSockets = guestSocketIds.filter(socketId => socketId !== socket.id)
        if (otherGuestSockets.length > 0) {
          io.to(otherGuestSockets).emit('GameInviteCleanup', {
            gameId,
            action: 'accepted',
            message: 'Invite accepted in another session'
          })
        }

        const totalCleanedInvitations = hostCleanup.cleanedInvitations.length + guestCleanup.cleanedInvitations.length;
      } catch (error) {
        socket.emit('GameInviteResponse', {
          status: 'error',
          message: 'Failed to accept invitation.',
        })
      }
    }
  )

  socket.on(
    'DeclineGameInvite',
    async (data: { gameId: string; guestEmail: string }) => {
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

        await Promise.all([
          redis.del(`game_invite:${gameId}`),
          redis.del(`game_invite:${invite.hostEmail}:${guestEmail}`),
          redis.del(`game_invite:${guestEmail}:${invite.hostEmail}`),
        ])

        const guestUser = await getUserByEmail(invite.guestEmail)
        const guest = guestUser as unknown as User
        if (guest) {
          const hostSocketIds = (await getSocketIds(invite.hostEmail, 'sockets')) || []
          const guestSocketIds = (await getSocketIds(guest.email, 'sockets')) || []

          io.to(hostSocketIds).emit('GameInviteDeclined', {
            gameId,
            declinedBy: guest.email,
            guestName: guest.username,
            guestLogin: guest.login,
            reason: 'declined_by_user'
          })

          io.to(guestSocketIds).emit('GameInviteCleanup', {
            gameId,
            action: 'declined',
            message: 'Invite declined in another session'
          })
        }

        socket.emit('GameInviteResponse', {
          status: 'success',
          message: 'Invitation declined.',
        })
      } catch (error) {
        console.error('Error declining game invite:', error);
        socket.emit('GameInviteResponse', {
          status: 'error',
          message: 'Failed to decline invitation.',
        })
      }
    }
  )
}