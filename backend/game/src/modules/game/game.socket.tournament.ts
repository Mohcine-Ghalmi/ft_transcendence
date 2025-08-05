import { Socket, Server } from 'socket.io'
import {
  Tournament,
  TournamentParticipant,
  TournamentMatch,
  GameSocketHandler,
  GameRoomData,
  getPlayerData,
  gameRooms,
  tournamentActiveSessions,
  getUserCurrentGame,
} from './game.socket.types'
import { 
  setActiveTournamentSession,
  getActiveTournamentSession, 
  removeActiveTournamentSession,
  cleanupTournamentSessions,
  emitToActiveTournamentSessions,
  emitToActiveUserSession
} from './game.socket.types'
import { v4 as uuidv4 } from 'uuid'
import CryptoJS from 'crypto-js'
import redis from '../../database/redis'
import  { getSocketIds } from '../../database/redis'
import { getUserByEmail, getFriend } from '../user/user.service'

const TOURNAMENT_PREFIX = 'tournament:';
const TOURNAMENT_INVITE_PREFIX = 'tournament_invite:';

async function handleParticipantDisconnect(tournamentId: string, tournament: Tournament, disconnectedUserEmail: string, io: Server) {
  try {
    if (tournament.status !== 'in_progress')
      return;
    
    const activeMatch = tournament.matches.find(match => 
      (match.player1?.email === disconnectedUserEmail || match.player2?.email === disconnectedUserEmail) &&
      (match.state === 'in_progress' || match.state === 'waiting')
    );
    
    if (!activeMatch) {
      return;
    }
    
    const { handleTournamentPlayerForfeit } = await import('./game.socket.tournament.events');
    const { 
      updatedTournament, 
      affectedMatch, 
      forfeitedPlayer, 
      advancingPlayer 
    } = handleTournamentPlayerForfeit(tournament, disconnectedUserEmail);
    
    await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(updatedTournament));
    const allParticipantEmails = updatedTournament.participants.map(p => p.email);
    const allSocketIds = [];
    
    for (const email of allParticipantEmails) {
      const socketIds = await getSocketIds(email, 'sockets') || [];
      allSocketIds.push(...socketIds);
    }
    
    io.to(allSocketIds).emit('TournamentPlayerForfeited', {
      tournamentId,
      forfeitedPlayer,
      advancingPlayer,
      affectedMatch,
      tournament: updatedTournament,
      reason: 'disconnect',
      message: `${forfeitedPlayer?.nickname} has disconnected. ${advancingPlayer?.nickname} advances to the next round.`
    });
    
    const totalRounds = Math.log2(updatedTournament.size);
    const finalMatch = updatedTournament.matches.find(m => m.round === totalRounds - 1);
    
    if (finalMatch && 
        (finalMatch.state === 'player1_win' || finalMatch.state === 'player2_win') && 
        finalMatch.winner) {
      updatedTournament.status = 'completed';
      updatedTournament.endedAt = Date.now();
      updatedTournament.winner = finalMatch.winner;
      
      await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(updatedTournament));
      
      io.to(allSocketIds).emit('TournamentCompleted', {
        tournamentId,
        tournament: updatedTournament,
        winnerEmail: finalMatch.winner.email,
        winner: finalMatch.winner,
        message: `Tournament completed! ${finalMatch.winner.nickname} is the champion!`
      });
    }
    
  } catch (error) {
    console.error(`Error handling participant disconnect in tournament ${tournamentId}:`, error);
  }
}

async function handleHostDisconnect(tournamentId: string, tournament: Tournament, io: Server) {
  try {
    if (tournament.status === 'lobby' || tournament.status === 'in_progress') {
      const allParticipantEmails = tournament.participants.map(p => p.email);
      const allSocketIds = [];
      
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        allSocketIds.push(...socketIds);
      }
      tournament.status = 'canceled';
      tournament.endedAt = Date.now();
      
      await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 300, JSON.stringify(tournament));
      io.to(allSocketIds).emit('TournamentCanceled', {
        tournamentId,
        tournament: {
          ...tournament,
          status: 'canceled',
          endedAt: Date.now(),
        },
        reason: 'Host disconnected',
        message: 'Tournament has been canceled because the host disconnected.'
      });
      
      io.to(allSocketIds).emit('RedirectToPlay', {
        message: 'Tournament canceled due to host disconnection.'
      });
      
      setTimeout(async () => {
        try {
          await redis.del(`${TOURNAMENT_PREFIX}${tournamentId}`);
          cleanupTournamentSessions(tournamentId);
        } catch (error) {
          console.error(`Error cleaning up canceled tournament ${tournamentId}:`, error);
        }
      }, 2000);
      
      const updatedTournaments = await getAllActiveTournaments();
      io.emit('TournamentList', updatedTournaments);
      
    }
  } catch (error) {
    console.error(`Error handling host disconnect for tournament ${tournamentId}:`, error);
  }
}

function createTournamentBracket(participants: TournamentParticipant[], size: number): TournamentMatch[] {
  const matches: TournamentMatch[] = [];
  const totalRounds = Math.log2(size);
  const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < size / 2; i++) {
    const player1 = shuffledParticipants[i * 2] || undefined;
    const player2 = shuffledParticipants[i * 2 + 1] || undefined;
    let state: TournamentMatch['state'] = 'waiting';
    let winner: TournamentParticipant | undefined = undefined;
    
    if (player1 && !player2) {
      state = 'player1_win';
      winner = player1;
    } else if (!player1 && player2) {
      state = 'player2_win';
      winner = player2;
    } else if (!player1 && !player2) {
      state = 'waiting';
    }
    
    matches.push({
      id: `match-${Date.now()}-${i}`,
      round: 0,
      matchIndex: i,
      player1,
      player2,
      state,
      winner
    });
  }
  
  for (let round = 1; round < totalRounds; round++) {
    const matchesInRound = size / Math.pow(2, round + 1);
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        id: `match-${Date.now()}-${round}-${i}`,
        round: round,
        matchIndex: i,
        player1: undefined,
        player2: undefined,
        state: 'waiting'
      });
    }
  }
  
  return matches;
}

async function getAllActiveTournaments(): Promise<Tournament[]> {
  try {
    const keys = await redis.keys(`${TOURNAMENT_PREFIX}*`);
    const tournaments: Tournament[] = [];
    for (const key of keys) {
      const t = await redis.get(key);
      if (t) {
        const parsed: Tournament = JSON.parse(t);
        if (parsed.status === 'lobby' || parsed.status === 'in_progress') {
          tournaments.push(parsed);
        }
      }
    }
    return tournaments;
  } catch (err) {
    return [];
  }
}

async function isUserInActiveTournament(userEmail: string): Promise<{ isParticipating: boolean; tournamentName?: string }> {
  try {
    const keys = await redis.keys(`${TOURNAMENT_PREFIX}*`);
    for (const key of keys) {
      const t = await redis.get(key);
      if (t) {
        const parsed: Tournament = JSON.parse(t);
        if (parsed.status === 'lobby' || parsed.status === 'in_progress') {
          const isParticipant = parsed.participants.some(participant => 
            participant.email === userEmail && participant.status === 'accepted'
          );
          if (isParticipant) {
            return { isParticipating: true, tournamentName: parsed.name };
          }
        }
      }
    }
    return { isParticipating: false };
  } catch (err) {
    return { isParticipating: false };
  }
}

export const handleTournament: GameSocketHandler = (socket: Socket, io: Server) => {
  socket.on('CreateTournament', async (data: {
    name: string;
    hostEmail: string;
    hostNickname: string;
    hostAvatar: string;
    size: number;
  }) => {
    try {
      
      if (!data.name || !data.hostEmail || !data.hostNickname || !data.size) {
        return socket.emit('TournamentError', { message: 'Missing required tournament information.' });
      }
      
      const participationCheck = await isUserInActiveTournament(data.hostEmail);
      if (participationCheck.isParticipating) {
        return socket.emit('TournamentError', { 
          message: `You are already participating in the tournament "${participationCheck.tournamentName}". Please complete or leave that tournament before creating a new one.` 
        });
      }
      
      const keys = await redis.keys(`${TOURNAMENT_PREFIX}*`);
      for (const key of keys) {
        const existingTournamentData = await redis.get(key);
        if (existingTournamentData) {
          const existingTournament: Tournament = JSON.parse(existingTournamentData);
          if (existingTournament.name.toLowerCase() === data.name.toLowerCase() && 
              (existingTournament.status === 'lobby' || existingTournament.status === 'in_progress')) {
            return socket.emit('TournamentError', { 
              message: `A tournament with the name "${data.name}" already exists. Please choose a different name.` 
            });
          }
        }
      }
      
      const tournamentId = uuidv4();
      const initialParticipant: TournamentParticipant = {
        email: data.hostEmail,
        nickname: data.hostNickname,
        avatar: data.hostAvatar || '/avatar/Default.svg',
        isHost: true,
        status: 'accepted',
      };
      
      const tournament: Tournament = {
        tournamentId,
        name: data.name,
        hostEmail: data.hostEmail,
        size: data.size,
        participants: [initialParticipant],
        matches: createTournamentBracket([initialParticipant], data.size),
        status: 'lobby',
        createdAt: Date.now(),
      };
      
      
      await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
      
      io.emit('TournamentCreated', tournament);
      const updatedTournaments = await getAllActiveTournaments();
      io.emit('TournamentList', updatedTournaments);
      
    } catch (err) {
      socket.emit('TournamentError', { message: 'Failed to create tournament.' });
    }
  });

  socket.on('ListTournaments', async () => {
    try {
      const keys = await redis.keys(`${TOURNAMENT_PREFIX}*`);
      const tournaments: Tournament[] = [];
      for (const key of keys) {
        const t = await redis.get(key);
        if (t) {
          const parsed: Tournament = JSON.parse(t);
          if (parsed.status === 'lobby' || parsed.status === 'in_progress') {
            tournaments.push(parsed);
          }
        }
      }
      socket.emit('TournamentList', tournaments);
    } catch (err) {
      socket.emit('TournamentError', { message: 'Failed to list tournaments.' });
    }
  });

  socket.on('InviteToTournament', async (encryptedData: string) => {
    try {
      const key = process.env.ENCRYPTION_KEY;
      if (!key) return socket.emit('InviteToTournamentResponse', { status: 'error', message: 'Server config error.' });
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) return socket.emit('InviteToTournamentResponse', { status: 'error', message: 'Invalid invite data.' });
      const { tournamentId, hostEmail, inviteeEmail } = JSON.parse(decrypted);
      if (!tournamentId || !hostEmail || !inviteeEmail) return socket.emit('InviteToTournamentResponse', { status: 'error', message: 'Missing info.' });
      const [hostUser, guestUser] = await Promise.all([
        getUserByEmail(hostEmail),
        getUserByEmail(inviteeEmail),
      ]);
      if (!hostUser || !guestUser) return socket.emit('InviteToTournamentResponse', { 
        status: 'error', 
        message: 'User not found.',
        guestEmail: inviteeEmail 
      });
      if (hostEmail === inviteeEmail) return socket.emit('InviteToTournamentResponse', { 
        status: 'error', 
        message: 'Cannot invite yourself.',
        guestEmail: inviteeEmail 
      });
      const friendship = await getFriend(hostEmail, inviteeEmail);
      if (!friendship) return socket.emit('InviteToTournamentResponse', { 
        status: 'error', 
        message: 'You can only invite friends.',
        guestEmail: inviteeEmail 
      });
      
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) return socket.emit('InviteToTournamentResponse', { 
        status: 'error', 
        message: 'Tournament not found.',
        guestEmail: inviteeEmail 
      });
      
      const tournament = JSON.parse(tournamentData);
      if (tournament.status !== 'lobby') {
        return socket.emit('InviteToTournamentResponse', { 
          status: 'error', 
          message: 'Tournament is no longer accepting invitations.',
          guestEmail: inviteeEmail 
        });
      }
      
      if (tournament.participants.length >= tournament.size) {
        return socket.emit('InviteToTournamentResponse', { 
          status: 'error', 
          message: 'Tournament is full.',
          guestEmail: inviteeEmail 
        });
      }
      
      const existingParticipant = tournament.participants.find((p: any) => p.email === inviteeEmail);
      if (existingParticipant) {
        return socket.emit('InviteToTournamentResponse', { 
          status: 'error', 
          message: 'Player is already in this tournament.',
          guestEmail: inviteeEmail 
        });
      }
      
      if (tournament.hostEmail !== hostEmail) {
        return socket.emit('InviteToTournamentResponse', { 
          status: 'error', 
          message: 'Only the tournament host can send invitations.',
          guestEmail: inviteeEmail 
        });
      }
      
      const existingInviteKey = `${TOURNAMENT_INVITE_PREFIX}${tournamentId}:${inviteeEmail}`;
      const existingInviteId = await redis.get(existingInviteKey);
      if (existingInviteId) {
        const existingInviteData = await redis.get(`${TOURNAMENT_INVITE_PREFIX}${existingInviteId}`);
        if (existingInviteData) {
          const existingInvite = JSON.parse(existingInviteData);
          if (existingInvite.tournamentId === tournamentId) {
            return socket.emit('InviteToTournamentResponse', { 
              status: 'error', 
              message: 'Already invited to this tournament.',
              guestEmail: inviteeEmail 
            });
          }
        } else {
          await redis.del(existingInviteKey);
        }
      }
      
      const guestSocketIds = await getSocketIds(inviteeEmail, 'sockets') || [];
      if (guestSocketIds.length === 0) return socket.emit('InviteToTournamentResponse', { 
        status: 'error', 
        message: 'User not online.',
        guestEmail: inviteeEmail 
      });
      const inviteId = uuidv4();
      const inviteData = { inviteId, tournamentId, hostEmail, inviteeEmail, createdAt: Date.now() };
      await Promise.all([
        redis.setex(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`, 30, JSON.stringify(inviteData)),
        redis.setex(`${TOURNAMENT_INVITE_PREFIX}${tournamentId}:${inviteeEmail}`, 30, inviteId)
      ]);
      const host = (hostUser as any).toJSON ? (hostUser as any).toJSON() : (hostUser as any);
      const guest = (guestUser as any).toJSON ? (guestUser as any).toJSON() : (guestUser as any);
      io.to(guestSocketIds).emit('TournamentInviteReceived', {
        type: 'tournament_invite',
        inviteId,
        tournamentId,
        hostEmail,
        message: `${host.username || host.email || 'Host'} invited you to a tournament!`,
        hostData: host,
        expiresAt: Date.now() + 30000
      });
      socket.emit('InviteToTournamentResponse', {
        type: 'invite_sent',
        status: 'success',
        message: `Invitation sent to ${guest.username || guest.email || 'Guest'}`,
        inviteId,
        guestEmail: guest.email,
        guestData: guest
      });
      setTimeout(async () => {
        const stillExists = await redis.get(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`);
        if (stillExists) {
          await Promise.all([
            redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`),
            redis.del(`${TOURNAMENT_INVITE_PREFIX}${tournamentId}:${inviteeEmail}`)
          ]);
          io.to([...(await getSocketIds(hostEmail, 'sockets') || []), ...guestSocketIds]).emit('TournamentInviteTimeout', { inviteId });
        }
      }, 30000);
    } catch (error) {
      socket.emit('InviteToTournamentResponse', { status: 'error', message: 'Failed to send tournament invite.' });
    }
  });

  socket.on('AcceptTournamentInvite', async (data: { inviteId: string; inviteeEmail: string }) => {
    try {
      const { inviteId, inviteeEmail } = data;
      
      if (!inviteId || !inviteeEmail) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Missing info.' });
      
      const participationCheck = await isUserInActiveTournament(inviteeEmail);
      if (participationCheck.isParticipating) {
        return socket.emit('TournamentInviteResponse', { 
          status: 'error', 
          message: `You are already participating in the tournament "${participationCheck.tournamentName}". Please complete or leave that tournament before joining a new one.` 
        });
      }
      
      const inviteData = await redis.get(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`);
      if (!inviteData) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Invite expired.' });
      const invite = JSON.parse(inviteData);
      if (invite.inviteeEmail !== inviteeEmail) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Invalid invite.' });
      
      await Promise.all([
        redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`),
        redis.del(`${TOURNAMENT_INVITE_PREFIX}${invite.tournamentId}:${inviteeEmail}`)
      ]);
      
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${invite.tournamentId}`);
      if (!tournamentData) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Tournament not found.' });
      
      const tournament: Tournament = JSON.parse(tournamentData);
      if (tournament.status !== 'lobby') {
        return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Tournament is no longer accepting players.' });
      }
      if (tournament.participants.length >= tournament.size) {
        return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Tournament is full.' });
      }
      const existingParticipant = tournament.participants.find(p => p.email === inviteeEmail);
      if (existingParticipant) {
        return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Already in tournament.' });
      }
      
      const user = await getUserByEmail(inviteeEmail);
      if (!user) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'User not found.' });
      let userData: any = (user as any).toJSON ? (user as any).toJSON() : user;
      const newParticipant: TournamentParticipant = {
        email: inviteeEmail,
        nickname: userData.login || userData.username || inviteeEmail,
        avatar: userData.avatar || '/avatar/Default.svg',
        isHost: false,
        status: 'accepted'
      };
      
      tournament.participants.push(newParticipant);
      tournament.matches = createTournamentBracket(tournament.participants, tournament.size);
      await redis.setex(`${TOURNAMENT_PREFIX}${invite.tournamentId}`, 3600, JSON.stringify(tournament));
      setActiveTournamentSession(invite.tournamentId, inviteeEmail, socket.id);
      const allParticipantEmails = tournament.participants.map(p => p.email);
      const allSocketIds = [];
      
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        allSocketIds.push(...socketIds);
      }
      const guestSocketIds = await getSocketIds(inviteeEmail, 'sockets') || [];
      io.to(allSocketIds).emit('TournamentInviteAccepted', { 
        inviteId, 
        inviteeEmail,
        guestEmail: inviteeEmail,
        guestData: userData,
        tournamentId: invite.tournamentId,
        newParticipant,
        tournament
      });
      
      io.to(guestSocketIds).emit('TournamentInviteCleanup', {
        inviteId,
        action: 'accepted',
        message: 'Invite accepted in another session'
      });
      socket.emit('TournamentInviteResponse', { 
        status: 'success', 
        message: 'Joined tournament successfully.',
        tournamentId: invite.tournamentId,
        tournament,
        redirectToLobby: true
      });
      
      const otherGuestSockets = guestSocketIds.filter(socketId => socketId !== socket.id);
      if (otherGuestSockets.length > 0) {
        io.to(otherGuestSockets).emit('TournamentSessionConflict', {
          type: 'another_session_joined',
          message: 'Tournament joined in another session. This session will remain inactive.',
          tournamentId: invite.tournamentId,
          action: 'stay_idle'
        });
      }
      
      if (tournament.participants.length === tournament.size) {
        io.to(allSocketIds).emit('TournamentUpdated', {
          tournamentId: invite.tournamentId,
          tournament
        });
      }
      
      const updatedTournaments = await getAllActiveTournaments();
      io.emit('TournamentList', updatedTournaments);
      
    } catch (error) {
      socket.emit('TournamentInviteResponse', { status: 'error', message: 'Failed to accept tournament invite.' });
    }
  });

  socket.on('JoinTournament', async (data: { tournamentId: string; playerEmail: string }) => {
    try {
      const { tournamentId, playerEmail } = data;
      
      if (!tournamentId || !playerEmail) {
        return socket.emit('TournamentJoinResponse', { status: 'error', message: 'Missing info.' });
      }
      
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) {
        return socket.emit('TournamentJoinResponse', { status: 'error', message: 'Tournament not found.' });
      }
      
      const tournament: Tournament = JSON.parse(tournamentData);
      const participant = tournament.participants.find(p => p.email === playerEmail);
      const isHost = tournament.hostEmail === playerEmail;
      
      if (!participant && !isHost) {
        return socket.emit('TournamentJoinResponse', { status: 'error', message: 'You are not a participant in this tournament.' });
      }
      
      if (tournament.status === 'completed') {
        const tournamentRoom = `tournament:${tournamentId}`;
        socket.join(tournamentRoom);
        
        return socket.emit('TournamentJoinResponse', { 
          status: 'success', 
          tournament,
          message: 'completed',
          currentMatch: null
        });
      }
      
      if (tournament.status === 'canceled') {
        return socket.emit('TournamentJoinResponse', { status: 'error', message: 'Tournament was canceled.' });
      }
      
      const existingActiveSession = getActiveTournamentSession(tournamentId, playerEmail);
      if (existingActiveSession && existingActiveSession !== socket.id) {
        const userSockets = await getSocketIds(playerEmail, 'sockets') || [];
        if (userSockets.includes(existingActiveSession)) {
          return socket.emit('TournamentJoinResponse', { 
            status: 'error', 
            message: 'Tournament is already active in another session.',
            sessionConflict: true,
            conflictType: 'tournament_active_elsewhere'
          });
        } else {
          removeActiveTournamentSession(tournamentId, playerEmail);
        }
      }
      
      setActiveTournamentSession(tournamentId, playerEmail, socket.id);
      const tournamentRoom = `tournament:${tournamentId}`;
      socket.join(tournamentRoom);
      socket.emit('TournamentJoinResponse', { 
        status: 'success', 
        tournament,
        currentMatch: tournament.status === 'in_progress' ? 
          tournament.matches.find(m => 
            (m.player1?.email === playerEmail || m.player2?.email === playerEmail) && 
            m.state === 'waiting'
          ) : null
      });
      
      if (participant) {
        socket.to(tournamentRoom).emit('TournamentPlayerJoined', {
          tournamentId,
          tournament,
          joinedPlayer: participant,
          message: `${participant.nickname} joined the tournament room!`
        });
      }
      
    } catch (error) {
      socket.emit('TournamentJoinResponse', { status: 'error', message: 'Failed to join tournament.' });
    }
  });
  
  socket.on('DeclineTournamentInvite', async (data: { inviteId: string; inviteeEmail: string }) => {
    try {
      const { inviteId, inviteeEmail } = data;
      if (!inviteId || !inviteeEmail) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Missing info.' });
      
      const inviteData = await redis.get(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`);
      if (!inviteData) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Invite expired.' });
      const invite = JSON.parse(inviteData);
      if (invite.inviteeEmail !== inviteeEmail) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Invalid invite.' });
      await Promise.all([
        redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`),
        redis.del(`${TOURNAMENT_INVITE_PREFIX}${invite.tournamentId}:${inviteeEmail}`)
      ]);
      
      const hostSocketIds = await getSocketIds(invite.hostEmail, 'sockets') || [];
      const guestSocketIds = await getSocketIds(inviteeEmail, 'sockets') || [];
      const guestUser = await getUserByEmail(inviteeEmail);
      const guestData = guestUser ? ((guestUser as any).toJSON ? (guestUser as any).toJSON() : guestUser) : null;
      
      io.to(hostSocketIds).emit('TournamentInviteDeclined', { 
        inviteId, 
        tournamentId: invite.tournamentId,
        inviteeEmail,
        guestEmail: inviteeEmail,
        declinedBy: inviteeEmail,
        message: 'Tournament invite was declined.' 
      });
      
      io.to(guestSocketIds).emit('TournamentInviteCleanup', {
        inviteId,
        action: 'declined',
        message: 'Invite declined in another session'
      });
      
      socket.emit('TournamentInviteResponse', { status: 'success', message: 'Tournament invite declined.' });
    } catch (error) {
      socket.emit('TournamentInviteResponse', { status: 'error', message: 'Failed to decline tournament invite.' });
    }
  });
  
  socket.on('CancelTournamentInvite', async (data: { inviteId: string; hostEmail: string }) => {
    try {
      const { inviteId, hostEmail } = data;
      if (!inviteId || !hostEmail) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Missing info.' });
      
      const inviteData = await redis.get(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`);
      if (!inviteData) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Invite not found or expired.' });
      const invite = JSON.parse(inviteData);
      if (invite.hostEmail !== hostEmail) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'You can only cancel your own invites.' });
      
      await Promise.all([
        redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`),
        redis.del(`${TOURNAMENT_INVITE_PREFIX}${invite.tournamentId}:${invite.inviteeEmail}`)
      ]);
      
      const guestSocketIds = await getSocketIds(invite.inviteeEmail, 'sockets') || [];
      io.to(guestSocketIds).emit('TournamentInviteCanceled', { 
        inviteId, 
        tournamentId: invite.tournamentId,
        canceledBy: hostEmail 
      });
      io.to(guestSocketIds).emit('TournamentInviteCleanup', {
        inviteId,
        action: 'canceled',
        message: 'Invite was canceled by host'
      });
      
      socket.emit('TournamentInviteResponse', { status: 'success', message: 'Invitation canceled.' });
    } catch (error) {
      socket.emit('TournamentInviteResponse', { status: 'error', message: 'Failed to cancel tournament invite.' });
    }
  });

  socket.on('DeclineTournamentInvite', async (data: { inviteId: string; inviteeEmail: string }) => {
    try {
      const { inviteId, inviteeEmail } = data;
      if (!inviteId || !inviteeEmail) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Missing info.' });
      const inviteData = await redis.get(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`);
      if (!inviteData) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Invite expired.' });
      const invite = JSON.parse(inviteData);
      if (invite.inviteeEmail !== inviteeEmail) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Invalid invite.' });
      await Promise.all([
        redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`),
        redis.del(`${TOURNAMENT_INVITE_PREFIX}${invite.tournamentId}:${inviteeEmail}`)
      ]);
      const hostSocketIds = await getSocketIds(invite.hostEmail, 'sockets') || [];
      io.to(hostSocketIds).emit('TournamentInviteDeclined', { inviteId, declinedBy: inviteeEmail });
      socket.emit('TournamentInviteResponse', { status: 'success', message: 'Invitation declined.' });
    } catch (error) {
      socket.emit('TournamentInviteResponse', { status: 'error', message: 'Failed to decline tournament invite.' });
    }
  });

  socket.on('CancelTournamentInvite', async (data: { inviteId: string; hostEmail: string }) => {
    try {
      const { inviteId, hostEmail } = data;
      if (!inviteId || !hostEmail) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Missing info.' });
      const inviteData = await redis.get(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`);
      if (!inviteData) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Invite not found or expired.' });
      const invite = JSON.parse(inviteData);
      if (invite.hostEmail !== hostEmail) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'You can only cancel your own invites.' });
      await Promise.all([
        redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`),
        redis.del(`${TOURNAMENT_INVITE_PREFIX}${invite.tournamentId}:${invite.inviteeEmail}`)
      ]);
      const guestSocketIds = await getSocketIds(invite.inviteeEmail, 'sockets') || [];
      io.to(guestSocketIds).emit('TournamentInviteCanceled', { inviteId, canceledBy: hostEmail });
      socket.emit('TournamentInviteResponse', { status: 'success', message: 'Invitation canceled.' });
    } catch (error) {
      socket.emit('TournamentInviteResponse', { status: 'error', message: 'Failed to cancel tournament invite.' });
    }
  });

  socket.on('StartTournament', async (data: { tournamentId: string; hostEmail: string }) => {
    try {
      const { tournamentId, hostEmail } = data;
      
      if (!tournamentId || !hostEmail) {
        return socket.emit('TournamentStartResponse', { status: 'error', message: 'Missing info.' });
      }
      
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) {
        return socket.emit('TournamentStartResponse', { status: 'error', message: 'Tournament not found.' });
      }
      
      const tournament: Tournament = JSON.parse(tournamentData);
      if (tournament.hostEmail !== hostEmail) {
        return socket.emit('TournamentStartResponse', { status: 'error', message: 'Only the host can start the tournament.' });
      }
      if (tournament.status !== 'lobby') {
        return socket.emit('TournamentStartResponse', { status: 'error', message: 'Tournament is not in lobby state.' });
      }
      if (tournament.participants.length !== tournament.size) {
        return socket.emit('TournamentStartResponse', { status: 'error', message: `Tournament needs ${tournament.size} players to start.` });
      }
      
      const matches = createTournamentBracket(tournament.participants, tournament.size);
      const bracketMatches = matches.map(match => ({
        ...match,
        state: 'waiting' as const,
        gameRoomId: undefined,
        winner: undefined
      }));
      
      tournament.status = 'in_progress';
      tournament.matches = bracketMatches;
      tournament.currentRound = 0;
      tournament.startedAt = Date.now();
      await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
      const tournamentRoom = `tournament:${tournamentId}`;
      
      const eventData = {
        tournamentId,
        tournament,
        message: 'Tournament started! View the bracket and wait for the host to start rounds.'
      };
      io.to(tournamentRoom).emit('TournamentStarted', eventData);
      const allParticipantEmails = tournament.participants.map(p => p.email);
      
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        
        for (const socketId of socketIds) {
          io.to(socketId).emit('TournamentStarted', eventData);
        }
      }
      socket.emit('TournamentStartResponse', { status: 'success', message: 'Tournament started successfully.' });
    } catch (error) {
      socket.emit('TournamentStartResponse', { status: 'error', message: 'Failed to start tournament.' });
    }
  });

  socket.on('StartCurrentRound', async (data: { tournamentId: string; hostEmail: string; round?: number; notifyCountdown?: number }) => {
    try {
      const { tournamentId, hostEmail, round, notifyCountdown = 10 } = data;
      if (!tournamentId || !hostEmail) {
        return socket.emit('StartCurrentRoundResponse', { status: 'error', message: 'Missing required data.' });
      }
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) {
        return socket.emit('StartCurrentRoundResponse', { status: 'error', message: 'Tournament not found.' });
      }
      
      const tournament: Tournament = JSON.parse(tournamentData);
      if (tournament.hostEmail !== hostEmail) {
        return socket.emit('StartCurrentRoundResponse', { status: 'error', message: 'Only the host can start rounds.' });
      }
      const currentRound = round !== undefined ? round : (tournament.currentRound ?? 0);
      const currentRoundMatches = tournament.matches.filter(match => 
        match.round === currentRound && match.state === 'waiting' && match.player1 && match.player2
      );
      
      
      if (currentRoundMatches.length === 0) {
        return socket.emit('StartCurrentRoundResponse', { status: 'error', message: 'No matches ready to start in this round.' });
      }

      for (const match of currentRoundMatches) {
        if (!match.player1 || !match.player2) continue;
        const player1ActiveSession = getActiveTournamentSession(tournamentId, match.player1.email);
        const player2ActiveSession = getActiveTournamentSession(tournamentId, match.player2.email);
        
        const player1AllSockets = await getSocketIds(match.player1.email, 'sockets') || [];
        const player2AllSockets = await getSocketIds(match.player2.email, 'sockets') || [];
        
        const tournamentRoom = `tournament:${tournamentId}`;
        
        const notificationData = {
          type: 'match_starting',
          title: 'Your Match is Starting!',
          message: `Your tournament match will begin in ${notifyCountdown} seconds!`,
          countdown: notifyCountdown,
          tournamentId: tournamentId,
          matchId: match.id,
          autoClose: false,
          timestamp: Date.now()
        };
        
        let player1Notified = false;
        if (player1ActiveSession) {
          io.to(player1ActiveSession).emit('GlobalTournamentNotification', {
            ...notificationData,
            playerEmail: match.player1.email
          });
          player1Notified = true;
        }
        
        if (!player1Notified && player1AllSockets.length > 0) {
          player1AllSockets.forEach(socketId => {
            io.to(socketId).emit('GlobalTournamentNotification', {
              ...notificationData,
              playerEmail: match.player1?.email
            });
          });
          player1Notified = true;
        }
        
        let player2Notified = false;
        if (player2ActiveSession) {
          io.to(player2ActiveSession).emit('GlobalTournamentNotification', {
            ...notificationData,
            playerEmail: match.player2.email
          });
          player2Notified = true;
        }
        
        if (!player2Notified && player2AllSockets.length > 0) {
          player2AllSockets.forEach(socketId => {
            io.to(socketId).emit('GlobalTournamentNotification', {
              ...notificationData,
              playerEmail: match.player2?.email
            });
          });
          player2Notified = true;
        }
        
        io.to(tournamentRoom).emit('TournamentMatchCountdown', {
          ...notificationData,
          match: {
            id: match.id,
            player1: match.player1,
            player2: match.player2
          }
        });
        setTimeout(async () => {
          try {
            
            const updatedTournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
            if (!updatedTournamentData) return;
            
            const updatedTournament: Tournament = JSON.parse(updatedTournamentData);
            const currentMatch = updatedTournament.matches.find(m => m.id === match.id);
            
            if (currentMatch && currentMatch.state === 'waiting') {
              const gameRoomId = uuidv4();
              
              const gameRoom: GameRoomData = {
                gameId: gameRoomId,
                hostEmail: match.player1!.email,
                guestEmail: match.player2!.email,
                status: 'in_progress',
                createdAt: Date.now(),
                startedAt: Date.now(),
                tournamentId: tournamentId,
                matchId: match.id
              };
              
              await redis.setex(`gameRoom:${gameRoomId}`, 3600, JSON.stringify(gameRoom));
              gameRooms.set(gameRoomId, gameRoom);
              
              const gameState = {
                gameId: gameRoomId,
                ballX: 440,
                ballY: 247.5,
                ballDx: 6 * (Math.random() > 0.5 ? 1 : -1),
                ballDy: 6 * (Math.random() > 0.5 ? 1 : -1),
                paddle1Y: 202.5,
                paddle2Y: 202.5,
                scores: { p1: 0, p2: 0 },
                gameStatus: 'playing',
                lastUpdate: Date.now()
              };
              
              const { activeGames } = require('./game.socket.types');
              activeGames.set(gameRoomId, gameState);
              const updatedMatch: TournamentMatch = {
                ...currentMatch,
                state: 'in_progress',
                gameRoomId: gameRoomId
              };
              updatedTournament.matches = updatedTournament.matches.map(m => 
                m.id === match.id ? updatedMatch : m
              );
              
              await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(updatedTournament));
              const [player1User, player2User] = await Promise.all([
                getUserByEmail(match.player1!.email),
                getUserByEmail(match.player2!.email)
              ]);
              
              const player1Data = getPlayerData(player1User);
              const player2Data = getPlayerData(player2User);
              const currentPlayer1ActiveSession = getActiveTournamentSession(tournamentId, match.player1!.email);
              const currentPlayer2ActiveSession = getActiveTournamentSession(tournamentId, match.player2!.email);
              
              const currentPlayer1AllSockets = await getSocketIds(match.player1!.email, 'sockets') || [];
              const currentPlayer2AllSockets = await getSocketIds(match.player2!.email, 'sockets') || [];
              const socketsToRedirectP1 = currentPlayer1ActiveSession ? [currentPlayer1ActiveSession] : currentPlayer1AllSockets;
              socketsToRedirectP1.forEach(socketId => {
                io.to(socketId).emit('MatchFound', {
                  gameId: gameRoomId,
                  hostEmail: match.player1!.email,
                  guestEmail: match.player2!.email,
                  hostData: player1Data,
                  guestData: player2Data,
                  status: 'match_found',
                  message: 'Tournament match starting now!',
                  isTournament: true,
                  tournamentId: tournamentId,
                  matchId: match.id,
                  playerPosition: 'player1'
                });
                
                io.to(socketId).emit('GameStarting', {
                  gameId: gameRoomId,
                  hostEmail: match.player1!.email,
                  guestEmail: match.player2!.email,
                  hostData: player1Data,
                  guestData: player2Data,
                  startedAt: gameRoom.startedAt,
                  isTournament: true,
                  tournamentId: tournamentId,
                  matchId: match.id,
                  playerPosition: 'player1'
                });
              });
              const socketsToRedirectP2 = currentPlayer2ActiveSession ? [currentPlayer2ActiveSession] : currentPlayer2AllSockets;
              socketsToRedirectP2.forEach(socketId => {
                io.to(socketId).emit('MatchFound', {
                  gameId: gameRoomId,
                  hostEmail: match.player1!.email,
                  guestEmail: match.player2!.email,
                  hostData: player1Data,
                  guestData: player2Data,
                  status: 'match_found',
                  message: 'Tournament match starting now!',
                  isTournament: true,
                  tournamentId: tournamentId,
                  matchId: match.id,
                  playerPosition: 'player2'
                });
                
                io.to(socketId).emit('GameStarting', {
                  gameId: gameRoomId,
                  hostEmail: match.player1!.email,
                  guestEmail: match.player2!.email,
                  hostData: player1Data,
                  guestData: player2Data,
                  startedAt: gameRoom.startedAt,
                  isTournament: true,
                  tournamentId: tournamentId,
                  matchId: match.id,
                  playerPosition: 'player2'
                });
              });
              setTimeout(() => {
                [...socketsToRedirectP1, ...socketsToRedirectP2].forEach(socketId => {
                  const isPlayer1 = socketsToRedirectP1.includes(socketId);
                  
                  io.to(socketId).emit('GameStarted', {
                    gameId: gameRoomId,
                    hostEmail: match.player1!.email,
                    guestEmail: match.player2!.email,
                    hostData: player1Data,
                    guestData: player2Data,
                    players: {
                      host: match.player1!.email,
                      guest: match.player2!.email
                    },
                    startedAt: gameRoom.startedAt,
                    isTournament: true,
                    tournamentId: tournamentId,
                    matchId: match.id,
                    playerPosition: isPlayer1 ? 'player1' : 'player2'
                  });
                });
              }, 100);
              io.to(tournamentRoom).emit('TournamentMatchStarted', {
                tournamentId: tournamentId,
                match: updatedMatch,
                tournament: updatedTournament,
                message: `Match ${match.id} has started automatically!`
              });
            }
          } catch (error) {
            console.error('Error auto-starting tournament match:', error);
          }
        }, notifyCountdown * 1000);
      }
      socket.emit('StartCurrentRoundResponse', { 
        status: 'success', 
        message: `Round ${currentRound + 1} will auto-start in ${notifyCountdown} seconds. Players will be notified via multiple channels.`,
        round: currentRound,
        matchCount: currentRoundMatches.length
      });
    } catch (error) {
      socket.emit('StartCurrentRoundResponse', { status: 'error', message: 'Failed to start round.' });
    }
  });

  socket.on('ResolveTournamentSessionConflict', async (data: { 
    action: 'force_takeover' | 'cancel';
    tournamentId: string;
    playerEmail: string;
  }) => {
    try {
      const { action, tournamentId, playerEmail } = data;
      
      if (action === 'force_takeover') {
        const existingSession = getActiveTournamentSession(tournamentId, playerEmail);
        if (existingSession) {
          io.to(existingSession).emit('TournamentSessionTakenOver', {
            tournamentId,
            message: 'Tournament session taken over by another browser/tab.'
          });
        }
        setActiveTournamentSession(tournamentId, playerEmail, socket.id);
        
        socket.emit('TournamentSessionConflictResolved', {
          status: 'success',
          action: 'takeover_completed',
          message: 'Took over the tournament session.'
        });
      } else {
        socket.emit('TournamentSessionConflictResolved', {
          status: 'cancelled',
          message: 'Tournament session conflict cancelled.'
        });
      }
    } catch (error) {
      socket.emit('TournamentSessionConflictResolved', {
        status: 'error',
        message: 'Failed to resolve session conflict.'
      });
    }
  });

  socket.on('disconnect', async () => {
    try {
      
      for (const [tournamentId, userSessions] of tournamentActiveSessions.entries()) {
        for (const [userEmail, socketId] of userSessions.entries()) {
          if (socketId === socket.id) {
            const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
            if (tournamentData) {
              const tournament: Tournament = JSON.parse(tournamentData);
              if (tournament.hostEmail === userEmail) {
                await handleHostDisconnect(tournamentId, tournament, io);
              } else {
                await handleParticipantDisconnect(tournamentId, tournament, userEmail, io);
              }
            }
            removeActiveTournamentSession(tournamentId, userEmail);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up tournament sessions on disconnect:', error);
    }
  });
  
  socket.on('JoinTournamentMatch', async (data: { tournamentId: string; matchId: string; playerEmail: string }) => {
    try {
      const { tournamentId, matchId, playerEmail } = data;
      
      if (!tournamentId || !matchId || !playerEmail) {
        return socket.emit('JoinTournamentMatchResponse', { status: 'error', message: 'Missing required data.' });
      }
      
      const activeSession = getActiveTournamentSession(tournamentId, playerEmail);
      if (!activeSession || activeSession !== socket.id) {
        return socket.emit('JoinTournamentMatchResponse', { 
          status: 'error', 
          message: 'This tournament is active in another session. Please use the active session to join matches.',
          sessionConflict: true
        });
      }
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
    if (!tournamentData) {
      return socket.emit('JoinTournamentMatchResponse', { status: 'error', message: 'Tournament not found.' });
    }
    const tournament: Tournament = JSON.parse(tournamentData);
    const match = tournament.matches.find(m => m.id === matchId);
    
    if (!match) {
      return socket.emit('JoinTournamentMatchResponse', { status: 'error', message: 'Match not found.' });
    }
      const isPlayer1 = match.player1?.email === playerEmail;
      const isPlayer2 = match.player2?.email === playerEmail;
      if (!isPlayer1 && !isPlayer2) {
        return socket.emit('JoinTournamentMatchResponse', { status: 'error', message: 'Player not in this match.' });
      }
      if (match.state === 'waiting') {
        const gameRoomId = uuidv4();
        const gameRoom: GameRoomData = {
          gameId: gameRoomId,
          hostEmail: match.player1!.email,
          guestEmail: match.player2!.email,
          status: 'in_progress',
          createdAt: Date.now(),
          startedAt: Date.now(),
          tournamentId: tournamentId,
          matchId: match.id
        };
        
        await redis.setex(`gameRoom:${gameRoomId}`, 3600, JSON.stringify(gameRoom));
        gameRooms.set(gameRoomId, gameRoom);
        const gameState = {
          gameId: gameRoomId,
          ballX: 440,
          ballY: 247.5,
          ballDx: 6 * (Math.random() > 0.5 ? 1 : -1),
          ballDy: 6 * (Math.random() > 0.5 ? 1 : -1),
          paddle1Y: 202.5,
          paddle2Y: 202.5,
          scores: { p1: 0, p2: 0 },
          gameStatus: 'playing',
          lastUpdate: Date.now()
        };
        
        const { activeGames } = require('./game.socket.types');
        activeGames.set(gameRoomId, gameState);
        const updatedMatch: TournamentMatch = {
          ...match,
          state: 'in_progress',
          gameRoomId: gameRoomId
        };
        tournament.matches = tournament.matches.map(m => 
          m.id === match.id ? updatedMatch : m
        );
        
        await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
        const [player1User, player2User] = await Promise.all([
          getUserByEmail(match.player1!.email),
          getUserByEmail(match.player2!.email)
        ]);
        
        const player1Data = getPlayerData(player1User);
        const player2Data = getPlayerData(player2User);
        const player1Sockets = await getSocketIds(match.player1!.email, 'sockets') || [];
        const player2Sockets = await getSocketIds(match.player2!.email, 'sockets') || [];
        const allSockets = [...player1Sockets, ...player2Sockets];
        allSockets.forEach(socketId => {
          const isPlayer1 = player1Sockets.includes(socketId);
          
          io.to(socketId).emit('MatchFound', {
            gameId: gameRoomId,
            hostEmail: match.player1!.email,
            guestEmail: match.player2!.email,
            hostData: player1Data,
            guestData: player2Data,
            status: 'match_found',
            message: 'Tournament match starting!',
            isTournament: true,
            tournamentId: tournamentId,
            matchId: match.id,
            playerPosition: isPlayer1 ? 'player1' : 'player2'
          });
          
          io.to(socketId).emit('GameStarting', {
            gameId: gameRoomId,
            hostEmail: match.player1!.email,
            guestEmail: match.player2!.email,
            hostData: player1Data,
            guestData: player2Data,
            startedAt: gameRoom.startedAt,
            isTournament: true,
            tournamentId: tournamentId,
            matchId: match.id,
            playerPosition: isPlayer1 ? 'player1' : 'player2'
          });
        });
        setTimeout(() => {
          allSockets.forEach(socketId => {
            const isPlayer1 = player1Sockets.includes(socketId);
            
            io.to(socketId).emit('GameStarted', {
              gameId: gameRoomId,
              hostEmail: match.player1!.email,
              guestEmail: match.player2!.email,
              hostData: player1Data,
              guestData: player2Data,
              players: {
                host: match.player1!.email,
                guest: match.player2!.email
              },
              startedAt: gameRoom.startedAt,
              isTournament: true,
              tournamentId: tournamentId,
              matchId: match.id,
              playerPosition: isPlayer1 ? 'player1' : 'player2'
            });
          });
        }, 100);
        const tournamentRoom = `tournament:${tournamentId}`;
        io.to(tournamentRoom).emit('TournamentMatchStarted', {
          tournamentId: tournamentId,
          match: updatedMatch,
          tournament: tournament,
          message: `Match ${match.id} has started!`
        });
      }
      
      socket.emit('JoinTournamentMatchResponse', { status: 'success', message: 'Joined match successfully!' });
    } catch (error) {
      socket.emit('JoinTournamentMatchResponse', { status: 'error', message: 'Failed to join match.' });
    }
  });
  socket.on('JoinTournament', async (data: { tournamentId: string; playerEmail: string }) => {
    
    try {
      const { tournamentId, playerEmail } = data;
      
      if (!tournamentId || !playerEmail) {
        return socket.emit('TournamentJoinResponse', { status: 'error', message: 'Missing info.' });
      }
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) {
        return socket.emit('TournamentJoinResponse', { status: 'error', message: 'Tournament not found.' });
      }
      
      const tournament: Tournament = JSON.parse(tournamentData);
      
      const participant = tournament.participants.find(p => p.email === playerEmail);
      const isHost = tournament.hostEmail === playerEmail;
      
      if (!participant && !isHost) {
        return socket.emit('TournamentJoinResponse', { status: 'error', message: 'You are not a participant in this tournament.' });
      }
      if (tournament.status === 'completed') {
        const tournamentRoom = `tournament:${tournamentId}`;
        socket.join(tournamentRoom);
        
        return socket.emit('TournamentJoinResponse', { 
          status: 'success', 
          tournament,
          message: 'completed',
          currentMatch: null
        });
      }
      
      if (tournament.status === 'canceled') {
        return socket.emit('TournamentJoinResponse', { status: 'error', message: 'Tournament was canceled.' });
      }
      const tournamentRoom = `tournament:${tournamentId}`;
      socket.join(tournamentRoom);
      socket.emit('TournamentJoinResponse', { 
        status: 'success', 
        tournament,
        currentMatch: tournament.status === 'in_progress' ? 
          tournament.matches.find(m => 
            (m.player1?.email === playerEmail || m.player2?.email === playerEmail) && 
            m.state === 'waiting'
          ) : null
      });

      if (participant) {
        socket.to(tournamentRoom).emit('TournamentPlayerJoined', {
          tournamentId,
          tournament,
          joinedPlayer: participant,
          message: `${participant.nickname} joined the tournament room!`
        });
      }
      

      
    } catch (error) {
      socket.emit('TournamentJoinResponse', { status: 'error', message: 'Failed to join tournament.' });
    }
  });
  socket.on('JoinTournamentAsNewParticipant', async (data: { tournamentId: string; playerEmail: string }) => {
    try {
      const { tournamentId, playerEmail } = data;
      
      if (!tournamentId || !playerEmail) {
        return socket.emit('TournamentJoinResponse', { status: 'error', message: 'Missing info.' });
      }
      const participationCheck = await isUserInActiveTournament(playerEmail);
      if (participationCheck.isParticipating) {
        return socket.emit('TournamentJoinResponse', { 
          status: 'error', 
          message: `You are already participating in the tournament "${participationCheck.tournamentName}". Please complete or leave that tournament before joining a new one.` 
        });
      }
      
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) {
        return socket.emit('TournamentJoinResponse', { status: 'error', message: 'Tournament not found.' });
      }
      
      const tournament: Tournament = JSON.parse(tournamentData);
      if (tournament.status !== 'lobby') {
        return socket.emit('TournamentJoinResponse', { status: 'error', message: 'Tournament is not accepting new participants.' });
      }
      if (tournament.participants.length >= tournament.size) {
        return socket.emit('TournamentJoinResponse', { status: 'error', message: 'Tournament is full.' });
      }
      const existingParticipant = tournament.participants.find(p => p.email === playerEmail);
      if (existingParticipant) {
        const tournamentRoom = `tournament:${tournamentId}`;
        socket.join(tournamentRoom);
        
        return socket.emit('TournamentJoinResponse', { 
          status: 'success', 
          tournament,
          tournamentId,
          message: 'Successfully rejoined tournament',
          currentMatch: null
        });
      }
      const user = await getUserByEmail(playerEmail);
      if (!user) return socket.emit('TournamentJoinResponse', { status: 'error', message: 'User not found.' });
      
      let userData: any = (user as any).toJSON ? (user as any).toJSON() : user;
      const newParticipant: TournamentParticipant = {
        email: playerEmail,
        nickname: userData.login || userData.username || playerEmail,
        avatar: userData.avatar || '/avatar/Default.svg',
        isHost: false,
        status: 'accepted'
      };
      
      tournament.participants.push(newParticipant);
      tournament.matches = createTournamentBracket(tournament.participants, tournament.size);
      await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
      const tournamentRoom = `tournament:${tournamentId}`;
      socket.join(tournamentRoom);
      const allParticipantEmails = tournament.participants.map(p => p.email);
      const allSocketIds = [];
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        allSocketIds.push(...socketIds);
      }
      io.to(allSocketIds).emit('TournamentUpdated', {
        tournamentId,
        tournament,
        newParticipant,
        message: `${newParticipant.nickname} joined the tournament!`
      });
      
      const updatedTournaments = await getAllActiveTournaments();
      io.emit('TournamentList', updatedTournaments);
      socket.emit('TournamentJoinResponse', { 
        status: 'success', 
        tournament,
        tournamentId,
        message: 'Successfully joined tournament',
        currentMatch: null
      });
      
    } catch (error) {
      socket.emit('TournamentJoinResponse', { status: 'error', message: 'Failed to join tournament.' });
    }
  });
  socket.on('GetTournamentData', async (data: { tournamentId: string; playerEmail: string }) => {
    try {
      const { tournamentId, playerEmail } = data;
      
      if (!tournamentId || !playerEmail) {
        return socket.emit('TournamentDataResponse', { status: 'error', message: 'Missing info.' });
      }
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) {
        return socket.emit('TournamentDataResponse', { status: 'error', message: 'Tournament not found.' });
      }
      
      const tournament: Tournament = JSON.parse(tournamentData);
      const isParticipant = tournament.participants.find(p => p.email === playerEmail);
      const isHost = tournament.hostEmail === playerEmail;
      
      if (!isParticipant && !isHost) {
        return socket.emit('TournamentDataResponse', { status: 'error', message: 'You are not authorized to view this tournament.' });
      }
      if (tournament.status === 'completed') {
        const tournamentRoom = `tournament:${tournamentId}`;
        socket.join(tournamentRoom);
        
        return socket.emit('TournamentDataResponse', { 
          status: 'success', 
          tournament,
          message: 'Tournament data retrieved successfully'
        });
      }
      if (tournament.status === 'lobby' || tournament.status === 'in_progress') {
        return socket.emit('TournamentDataResponse', { 
          status: 'success', 
          tournament,
          message: 'Tournament is active'
        });
      }
      return socket.emit('TournamentDataResponse', { 
        status: 'error', 
        message: 'Tournament was canceled',
        tournament: null
      });
      
    } catch (error) {
      socket.emit('TournamentDataResponse', { status: 'error', message: 'Failed to get tournament data.' });
    }
  });
  socket.on('TournamentMatchResult', async (data: { 
    tournamentId: string; 
    matchId: string; 
    winnerEmail: string; 
    loserEmail: string;
    playerEmail: string;
  }) => {
    try {
      const { tournamentId, matchId, winnerEmail, loserEmail, playerEmail } = data;
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) return socket.emit('TournamentMatchResponse', { status: 'error', message: 'Tournament not found.' });
      
      const tournament: Tournament = JSON.parse(tournamentData);
      const match = tournament.matches.find(m => m.id === matchId);
      if (!match) return socket.emit('TournamentMatchResponse', { status: 'error', message: 'Match not found.' });
      if (match.player1?.email !== playerEmail && match.player2?.email !== playerEmail) {
        return socket.emit('TournamentMatchResponse', { status: 'error', message: 'You are not in this match.' });
      }
      if (match.player1?.email === winnerEmail) {
        match.state = 'player1_win';
        match.winner = match.player1;
      } else if (match.player2?.email === winnerEmail) {
        match.state = 'player2_win';
        match.winner = match.player2;
      } else {
        return socket.emit('TournamentMatchResponse', { status: 'error', message: 'Invalid winner.' });
      }
      const loserParticipant = tournament.participants.find(p => p.email === loserEmail);
      if (loserParticipant) {
        loserParticipant.status = 'eliminated';
        const loserSocketIds = await getSocketIds(loserEmail, 'sockets') || [];
        if (loserSocketIds.length > 0) {
          io.to(loserSocketIds).emit('TournamentPlayerEliminated', {
            tournamentId,
            matchId,
            message: 'You have been eliminated from the tournament. Returning to lobby...',
            redirectTo: '/play'
          });
        }
      }
      const winnerParticipant = tournament.participants.find(p => p.email === winnerEmail);
      if (winnerParticipant) {
        winnerParticipant.status = 'accepted';
      }
      const currentRound = match.round;
      const roundMatches = tournament.matches.filter(m => m.round === currentRound);
      const allRoundComplete = roundMatches.every(m => m.state !== 'waiting' && m.state !== 'in_progress');
      
      if (allRoundComplete) {
        const updatedTournament = advanceTournamentRound(tournament);
        await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(updatedTournament));
        const allParticipantEmails = updatedTournament.participants.map(p => p.email);
        const allSocketIds = [];
        
        for (const email of allParticipantEmails) {
          const socketIds = await getSocketIds(email, 'sockets') || [];
          allSocketIds.push(...socketIds);
        }
        
        if (updatedTournament.status === 'completed') {
          const winner = updatedTournament.participants.find(p => p.status === 'winner');
          if (winner) {
            const winnerSocketIds = await getSocketIds(winner.email, 'sockets') || [];
            if (winnerSocketIds.length > 0) {
              io.to(winnerSocketIds).emit('TournamentCompleted', {
                tournamentId,
                tournament: updatedTournament,
                winner,
                message: 'Congratulations! You won the tournament!',
                redirectTo: '/play'
              });
            }
          }
          const hostSocketIds = await getSocketIds(updatedTournament.hostEmail, 'sockets') || [];
          if (hostSocketIds.length > 0) {
            io.to(hostSocketIds).emit('TournamentCompleted', {
              tournamentId,
              tournament: updatedTournament,
              winner,
              message: 'Tournament completed! You can still manage the tournament.',
              redirectTo: `/play/tournament/${tournamentId}`
            });
          }
          io.to(allSocketIds).emit('TournamentCompleted', {
            tournamentId,
            tournament: updatedTournament,
            winner
          });
        } else {
          const nextRound = currentRound + 1;
          const nextRoundMatches = updatedTournament.matches.filter(m => m.round === nextRound);
          for (const nextMatch of nextRoundMatches) {
            if (nextMatch.player1 && nextMatch.player2) {
              const player1SocketIds = await getSocketIds(nextMatch.player1.email, 'sockets') || [];
              const player2SocketIds = await getSocketIds(nextMatch.player2.email, 'sockets') || [];
              const allMatchSocketIds = [...player1SocketIds, ...player2SocketIds];
              if (allMatchSocketIds.length > 0) {
                io.to(allMatchSocketIds).emit('TournamentNextMatchReady', {
                  tournamentId,
                  matchId: nextMatch.id,
                  player1: nextMatch.player1,
                  player2: nextMatch.player2,
                  round: nextRound,
                  message: `Round ${nextRound} match ready: ${nextMatch.player1.nickname} vs ${nextMatch.player2.nickname}`
                });
              }
            }
          }
          
          io.to(allSocketIds).emit('TournamentRoundAdvanced', {
            tournamentId,
            tournament: updatedTournament,
            nextRound: currentRound + 1
          });
        }
      } else {
        await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
      }
      const allParticipantEmails = tournament.participants.map(p => p.email);
      const allSocketIds = [];
      
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        allSocketIds.push(...socketIds);
      }
      
      io.to(allSocketIds).emit('TournamentMatchCompleted', {
        tournamentId,
        matchId,
        match,
        tournament,
        winnerEmail,
        loserEmail
      });
      
      socket.emit('TournamentMatchResponse', { status: 'success', message: 'Match result recorded.' });
      
    } catch (error) {
      socket.emit('TournamentMatchResponse', { status: 'error', message: 'Failed to record match result.' });
    }
  });
  socket.on('CancelTournament', async (data: { tournamentId: string; hostEmail: string }) => {
    try {
      const { tournamentId, hostEmail } = data;
      
      if (!tournamentId || !hostEmail) {
        return socket.emit('TournamentCancelResponse', { status: 'error', message: 'Missing info.' });
      }
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) {
        return socket.emit('TournamentCancelResponse', { status: 'error', message: 'Tournament not found.' });
      }
      
      const tournament: Tournament = JSON.parse(tournamentData);
      if (tournament.hostEmail !== hostEmail) {
        return socket.emit('TournamentCancelResponse', { status: 'error', message: 'Only the host can cancel the tournament.' });
      }
      if (tournament.status !== 'lobby') {
        return socket.emit('TournamentCancelResponse', { status: 'error', message: 'Tournament cannot be cancelled at this stage.' });
      }
      const allParticipantEmails = tournament.participants.map(p => p.email);
      const allSocketIds = [];
      
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        allSocketIds.push(...socketIds);
      }
      io.to(allSocketIds).emit('TournamentCancelled', {
        tournamentId,
        tournamentName: tournament.name,
        message: `Tournament "${tournament.name}" has been cancelled by the host.`
      });
      
      await redis.del(`${TOURNAMENT_PREFIX}${tournamentId}`);
      const inviteKeys = await redis.keys(`${TOURNAMENT_INVITE_PREFIX}*`);
      for (const key of inviteKeys) {
        const inviteData = await redis.get(key);
        if (inviteData) {
          const invite = JSON.parse(inviteData);
          if (invite.tournamentId === tournamentId) {
            await redis.del(key);
          }
        }
      }
      const updatedTournaments = await getAllActiveTournaments();
      io.emit('TournamentList', updatedTournaments);
      socket.emit('TournamentCancelResponse', { 
        status: 'success', 
        message: 'Tournament cancelled successfully.'
      });
      
    } catch (error) {
      socket.emit('TournamentCancelResponse', { status: 'error', message: 'Failed to cancel tournament.' });
    }
  });

  socket.on('LeaveTournament', async (data: { tournamentId: string; playerEmail: string }) => {
    try {
      const { tournamentId, playerEmail } = data;
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) return socket.emit('TournamentLeaveResponse', { status: 'error', message: 'Tournament not found.' });
      
      const tournament: Tournament = JSON.parse(tournamentData);
      const participant = tournament.participants.find(p => p.email === playerEmail);
      if (!participant) {
        return socket.emit('TournamentLeaveResponse', { status: 'error', message: 'You are not a participant in this tournament.' });
      }
      tournament.participants = tournament.participants.filter(p => p.email !== playerEmail);
      if (playerEmail === tournament.hostEmail) {
        const allParticipantEmails = tournament.participants.map(p => p.email);
        const allSocketIds = [];
        
        for (const email of allParticipantEmails) {
          const socketIds = await getSocketIds(email, 'sockets') || [];
          allSocketIds.push(...socketIds);
        }
        await redis.del(`${TOURNAMENT_PREFIX}${tournamentId}`);
        
        io.to(allSocketIds).emit('TournamentCanceled', {
          tournamentId,
          tournament: { ...tournament, status: 'canceled', endedAt: Date.now() },
          reason: 'Host left the tournament'
        });
        
        io.to(allSocketIds).emit('RedirectToPlay', {
          message: 'Tournament canceled because host left.'
        });
        
        const remainingTournaments = await getAllActiveTournaments();
        io.emit('TournamentList', remainingTournaments);
      } else {
        if (tournament.status === 'in_progress') {
          participant.status = 'eliminated';
          for (const match of tournament.matches) {
            if ((match.player1?.email === playerEmail || match.player2?.email === playerEmail) && 
                match.state === 'waiting' || match.state === 'in_progress') {
              if (match.player1?.email === playerEmail) {
                match.state = 'player2_win';
                match.winner = match.player2;
              } else {
                match.state = 'player1_win';
                match.winner = match.player1;
              }
            }
          }
        }
        const remainingParticipantEmails = tournament.participants.map(p => p.email);
        const allSocketIds = [];
        for (const email of remainingParticipantEmails) {
          const socketIds = await getSocketIds(email, 'sockets') || [];
          allSocketIds.push(...socketIds);
        }
        
        io.to(allSocketIds).emit('TournamentParticipantLeft', {
          tournamentId,
          tournament,
          leftPlayer: participant
        });
      }
      await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
      socket.emit('RedirectToPlay', {
        message: 'You have left the tournament.'
      });
      
      socket.emit('TournamentLeaveResponse', { status: 'success', message: 'Left tournament successfully.' });
      
    } catch (error) {
      socket.emit('TournamentLeaveResponse', { status: 'error', message: 'Failed to leave tournament.' });
    }
  });
  socket.on('CancelTournament', async (data: { tournamentId: string; hostEmail: string }) => {
    try {
      const { tournamentId, hostEmail } = data;
      
      if (!tournamentId || !hostEmail) {
        return socket.emit('TournamentCancelResponse', { status: 'error', message: 'Missing info.' });
      }
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) {
        return socket.emit('TournamentCancelResponse', { status: 'error', message: 'Tournament not found.' });
      }
      
      const tournament: Tournament = JSON.parse(tournamentData);
      if (tournament.hostEmail !== hostEmail) {
        return socket.emit('TournamentCancelResponse', { status: 'error', message: 'Only the host can cancel the tournament.' });
      }
      if (tournament.status !== 'lobby') {
        return socket.emit('TournamentCancelResponse', { status: 'error', message: 'Tournament cannot be cancelled at this stage.' });
      }
      const allParticipantEmails = tournament.participants.map(p => p.email);
      const allSocketIds = [];
      
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        allSocketIds.push(...socketIds);
      }
      io.to(allSocketIds).emit('TournamentCancelled', {
        tournamentId,
        tournamentName: tournament.name,
        message: `Tournament "${tournament.name}" has been cancelled by the host.`
      });
      await redis.del(`${TOURNAMENT_PREFIX}${tournamentId}`);
      const inviteKeys = await redis.keys(`${TOURNAMENT_INVITE_PREFIX}*`);
      for (const key of inviteKeys) {
        const inviteData = await redis.get(key);
        if (inviteData) {
          const invite = JSON.parse(inviteData);
          if (invite.tournamentId === tournamentId) {
            await redis.del(key);
          }
        }
      }
      const updatedTournaments = await getAllActiveTournaments();
      io.emit('TournamentList', updatedTournaments);
      socket.emit('TournamentCancelResponse', { 
        status: 'success', 
        message: 'Tournament cancelled successfully.'
      });
      
    } catch (error) {
      socket.emit('TournamentCancelResponse', { status: 'error', message: 'Failed to cancel tournament.' });
    }
  });
  socket.on('ExplicitLeaveTournament', async (data: { tournamentId: string; playerEmail: string; reason: string }) => {
    try {
      const { tournamentId, playerEmail, reason } = data;
      
      if (!tournamentId || !playerEmail) {
        return socket.emit('ExplicitLeaveTournamentResponse', { status: 'error', message: 'Missing required data.' });
      }
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) {
        return socket.emit('ExplicitLeaveTournamentResponse', { status: 'error', message: 'Tournament not found.' });
      }
      
      const tournament: Tournament = JSON.parse(tournamentData);
      const participant = tournament.participants.find(p => p.email === playerEmail);
      if (!participant) {
        return socket.emit('ExplicitLeaveTournamentResponse', { status: 'error', message: 'You are not a participant in this tournament.' });
      }
      if (tournament.status === 'lobby') {
        const leftPlayer = tournament.participants.find(p => p.email === playerEmail);
        tournament.participants = tournament.participants.filter(p => p.email !== playerEmail);
        await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
        const allParticipantEmails = tournament.participants.map((p: any) => p.email);
        const allSocketIds = [];
        
        for (const email of allParticipantEmails) {
          const socketIds = await getSocketIds(email, 'sockets') || [];
          allSocketIds.push(...socketIds);
        }
        
        io.to(allSocketIds).emit('TournamentParticipantLeft', {
          tournamentId,
          tournament,
          leftPlayer,
          playerEmail,
          message: `${leftPlayer?.nickname || leftPlayer?.email} left the tournament.`
        });
        
        socket.emit('ExplicitLeaveTournamentResponse', { status: 'success', message: 'Left tournament successfully.' });
        
      } else if (tournament.status === 'in_progress') {
        const { handleTournamentPlayerForfeit } = await import('./game.socket.tournament.events');
        const { updatedTournament, affectedMatch, forfeitedPlayer, advancingPlayer } = 
          handleTournamentPlayerForfeit(tournament, playerEmail);
        await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(updatedTournament));
        const allParticipantEmails = updatedTournament.participants.map((p: any) => p.email);
        const allSocketIds: string[] = [];
        
        for (const email of allParticipantEmails) {
          const socketIds = await getSocketIds(email, 'sockets') || [];
          allSocketIds.push(...socketIds);
        }
        
        io.to(allSocketIds).emit('TournamentPlayerForfeited', {
          tournamentId,
          forfeitedPlayer,
          advancingPlayer,
          affectedMatch,
          tournament: updatedTournament,
          message: `${forfeitedPlayer?.nickname} has explicitly left the tournament. ${advancingPlayer?.nickname} advances to the next round.`
        });
        
        socket.emit('ExplicitLeaveTournamentResponse', { status: 'success', message: 'Left tournament successfully.' });
      } else {
        socket.emit('ExplicitLeaveTournamentResponse', { status: 'error', message: 'Cannot leave tournament in current state.' });
      }
      
    } catch (error) {
      socket.emit('ExplicitLeaveTournamentResponse', { status: 'error', message: 'Failed to leave tournament.' });
    }
  });

  socket.on('GetUserActiveTournaments', async (data: { userEmail: string; socketId?: string }) => {
    try {
      const { userEmail, socketId } = data;
      
      if (!userEmail) {
        return socket.emit('UserActiveTournaments', { tournaments: [], isInActiveGame: false });
      }
      const currentGameId = getUserCurrentGame(userEmail);
      let isInActiveGame = false;
      
      if (currentGameId) {
        const gameRoom = gameRooms.get(currentGameId);
        if (gameRoom && (gameRoom.status === 'in_progress' || gameRoom.status === 'accepted')) {
          isInActiveGame = true;
        }
      }
      
      const tournamentKeys = await redis.keys(`${TOURNAMENT_PREFIX}*`);
      const activeTournaments = [];
      
      for (const key of tournamentKeys) {
        const tournamentData = await redis.get(key);
        if (!tournamentData) continue;
        
        const tournament = JSON.parse(tournamentData);
        const tournamentId = key.replace(TOURNAMENT_PREFIX, '');
        
        const isParticipant = tournament.participants.some((p: any) => p.email === userEmail);
        if (isParticipant && (tournament.status === 'lobby' || tournament.status === 'in_progress')) {
          const isHost = tournament.hostEmail === userEmail;
          
          const activeSessionId = getActiveTournamentSession(tournamentId, userEmail);
          const shouldInclude = !activeSessionId || 
                              activeSessionId === socketId || 
                              !socketId;
          
          if (shouldInclude) {
            activeTournaments.push({
              tournamentId: tournamentId,
              tournamentName: tournament.name,
              status: tournament.status,
              isHost,
              participantCount: tournament.participants.length,
              maxParticipants: tournament.size,
              currentRound: tournament.currentRound || 0,
              totalRounds: Math.log2(tournament.size),
              activeSessionId: activeSessionId || null
            });
          }
        }
      }
      
      socket.emit('UserActiveTournaments', { 
        tournaments: activeTournaments,
        isInActiveGame,
        currentSocketId: socket.id
      });
      
    } catch (error) {
      socket.emit('UserActiveTournaments', { tournaments: [], isInActiveGame: false });
    }
  });

  socket.on('RejoinTournament', async (data: { tournamentId: string; playerEmail: string; socketId?: string }) => {
    try {
      const { tournamentId, playerEmail, socketId } = data;
      
      if (!tournamentId || !playerEmail) {
        return socket.emit('RejoinTournamentResponse', { status: 'error', message: 'Missing required data.' });
      }
      const currentGameId = getUserCurrentGame(playerEmail);
      if (currentGameId) {
        const gameRoom = gameRooms.get(currentGameId);
        if (gameRoom && (gameRoom.status === 'in_progress' || gameRoom.status === 'accepted')) {
          return socket.emit('RejoinTournamentResponse', { 
            status: 'error', 
            message: 'You cannot rejoin a tournament while in an active game.' 
          });
        }
      }
      
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) {
        return socket.emit('RejoinTournamentResponse', { status: 'error', message: 'Tournament not found.' });
      }
      
      const tournament: Tournament = JSON.parse(tournamentData);
      const isParticipant = tournament.participants.some((p: any) => p.email === playerEmail);
      if (!isParticipant) {
        return socket.emit('RejoinTournamentResponse', { status: 'error', message: 'You are not a participant in this tournament.' });
      }
      
      const existingActiveSession = getActiveTournamentSession(tournamentId, playerEmail);
      if (existingActiveSession && existingActiveSession !== socket.id) {
        const userSockets = await getSocketIds(playerEmail, 'sockets') || [];
        if (userSockets.includes(existingActiveSession)) {
          return socket.emit('RejoinTournamentResponse', { 
            status: 'error', 
            message: 'This tournament is already active in another session.',
            sessionConflict: true
          });
        }
      }
      setActiveTournamentSession(tournamentId, playerEmail, socket.id);
      socket.join(`tournament:${tournamentId}`);
      
      const allUserSockets = await getSocketIds(playerEmail, 'sockets') || [];
      const otherSockets = allUserSockets.filter(sid => sid !== socket.id);
      if (otherSockets.length > 0) {
        io.to(otherSockets).emit('TournamentSessionUpdate', {
          tournamentId,
          sessionId: socket.id,
          message: 'Tournament session taken over by another browser/tab'
        });
      }
      
      socket.emit('RejoinTournamentResponse', { 
        status: 'success', 
        message: 'Rejoined tournament successfully.',
        tournament,
        redirectUrl: `/play/tournament/${tournamentId}`
      });
      
    } catch (error) {
      socket.emit('RejoinTournamentResponse', { status: 'error', message: 'Failed to rejoin tournament.' });
    }
  });

  socket.on('AutoRejoinTournaments', async (data: { userEmail: string }) => {
    try {
      const { userEmail } = data;
      
      if (!userEmail) return;
      
      const keys = await redis.keys(`${TOURNAMENT_PREFIX}*`);
      
      for (const key of keys) {
        const tournamentData = await redis.get(key);
        if (tournamentData) {
          const tournament: Tournament = JSON.parse(tournamentData);
          const isParticipant = tournament.participants.some((p: any) => p.email === userEmail);
          
          if (isParticipant && (tournament.status === 'lobby' || tournament.status === 'in_progress')) {
            socket.join(`tournament:${tournament.tournamentId}`);
            socket.emit('AutoRejoinedTournament', {
              tournamentId: tournament.tournamentId,
              tournamentName: tournament.name,
              status: tournament.status,
              tournament: tournament
            });
          }
        }
      }
    } catch (error) {
      console.error('Error auto-rejoining tournaments:', error);
    }
  });
};

function advanceTournamentRound(tournament: Tournament): Tournament {
  const currentRound = Math.max(...tournament.matches.map(m => m.round));
  const nextRound = currentRound + 1;
  const totalRounds = Math.log2(tournament.size);
  
  if (nextRound >= totalRounds) {
    tournament.status = 'completed';
    tournament.endedAt = Date.now();
    const finalMatch = tournament.matches.find(m => m.round === currentRound && m.state !== 'waiting');
    if (finalMatch && finalMatch.winner) {
      const winnerParticipant = tournament.participants.find(p => p.email === finalMatch.winner!.email);
      if (winnerParticipant) {
        winnerParticipant.status = 'winner';
      }
    }
    
    return tournament;
  }
  const completedMatches = tournament.matches.filter(m => m.round === currentRound && m.state !== 'waiting');
  const nextRoundMatches = [];
  for (let i = 0; i < completedMatches.length; i += 2) {
    const match1 = completedMatches[i];
    const match2 = completedMatches[i + 1];
    
    if (match1 && match2) {
      const player1 = match1.winner;
      const player2 = match2.winner;
      
      nextRoundMatches.push({
        id: `match-${Date.now()}-${nextRound}-${i/2}`,
        round: nextRound,
        matchIndex: i / 2,
        player1,
        player2,
        state: 'waiting' as const
      });
    }
  }
  tournament.matches.push(...nextRoundMatches);
  
  return tournament;
}

export async function getTournamentHostEmail(tournamentId: string): Promise<string | null> {
  try {
    const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
    if (!tournamentData) {
      return null;
    }
    const tournament: Tournament = JSON.parse(tournamentData);
    return tournament.hostEmail;
  } catch (error) {
    console.error('Error getting tournament host email:', error);
    return null;
  }
}
