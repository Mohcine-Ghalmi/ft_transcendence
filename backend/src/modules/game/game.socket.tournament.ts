import { Socket, Server } from 'socket.io';
import redis from '../../utils/redis';
import { Tournament, TournamentParticipant, TournamentMatch, GameSocketHandler, GameRoomData, getPlayerData } from './game.socket.types';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import { getSocketIds } from '../../socket';
import { getUserByEmail, getFriend } from '../user/user.service';

// Key prefix for tournaments in Redis
const TOURNAMENT_PREFIX = 'tournament:';
const TOURNAMENT_INVITE_PREFIX = 'tournament_invite:';

// Helper function to clean up expired tournament invites
async function cleanupExpiredTournamentInvites() {
  try {
    const inviteKeys = await redis.keys(`${TOURNAMENT_INVITE_PREFIX}*`);
    const now = Date.now();
    
    for (const key of inviteKeys) {
      const inviteData = await redis.get(key);
      if (inviteData) {
        try {
          const invite = JSON.parse(inviteData);
          // If invite is older than 30 seconds, delete it
          if (now - invite.createdAt > 30000) {
            await redis.del(key);
            // Also clean up the email reference
            await redis.del(`${TOURNAMENT_INVITE_PREFIX}${invite.inviteeEmail}`);
          }
        } catch (err) {
          // If parsing fails, delete the invalid key
          await redis.del(key);
        }
      }
    }
  } catch (err) {
    console.error('Error cleaning up expired tournament invites:', err);
  }
}

type TournamentEventData = any; // TODO: Strongly type each event

export const handleTournament: GameSocketHandler = (socket: Socket, io: Server) => {
  // Clean up expired invites when tournament handler is initialized
  cleanupExpiredTournamentInvites();

  // Create a new tournament
  socket.on('CreateTournament', async (data: {
    name: string;
    hostEmail: string;
    hostNickname: string;
    hostAvatar: string;
    size: number;
  }) => {
    try {
      console.log('[Tournament] Creating tournament:', data);
      const tournamentId = uuidv4();
      const tournament: Tournament = {
        tournamentId,
        name: data.name,
        hostEmail: data.hostEmail,
        size: data.size,
        participants: [{
          email: data.hostEmail,
          nickname: data.hostNickname,
          avatar: data.hostAvatar,
          isHost: true,
          status: 'accepted',
        }],
        matches: [],
        status: 'lobby',
        createdAt: Date.now(),
      };
      console.log('[Tournament] Created tournament with ID:', tournamentId);
      await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
      io.emit('TournamentCreated', tournament);
    } catch (err) {
      console.error('[Tournament] Error creating tournament:', err);
      socket.emit('TournamentError', { message: 'Failed to create tournament.' });
    }
  });

  // List all tournaments (lobby or in_progress)
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

  // Invite to tournament (encrypted)
  socket.on('InviteToTournament', async (encryptedData: string) => {
    try {
      console.log('[Tournament Invite] Received encrypted invite data');
      const key = process.env.ENCRYPTION_KEY;
      if (!key) return socket.emit('InviteToTournamentResponse', { status: 'error', message: 'Server config error.' });
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      console.log('[Tournament Invite] Decrypted data:', decrypted);
      if (!decrypted) return socket.emit('InviteToTournamentResponse', { status: 'error', message: 'Invalid invite data.' });
      const { tournamentId, hostEmail, inviteeEmail } = JSON.parse(decrypted);
      console.log('[Tournament Invite] Parsed invite data:', { tournamentId, hostEmail, inviteeEmail });
      if (!tournamentId || !hostEmail || !inviteeEmail) return socket.emit('InviteToTournamentResponse', { status: 'error', message: 'Missing info.' });
      // Validate users
      const [hostUser, guestUser] = await Promise.all([
        getUserByEmail(hostEmail),
        getUserByEmail(inviteeEmail),
      ]);
      if (!hostUser || !guestUser) return socket.emit('InviteToTournamentResponse', { status: 'error', message: 'User not found.' });
      if (hostEmail === inviteeEmail) return socket.emit('InviteToTournamentResponse', { status: 'error', message: 'Cannot invite yourself.' });
      // Check friendship
      const friendship = await getFriend(hostEmail, inviteeEmail);
      if (!friendship) return socket.emit('InviteToTournamentResponse', { status: 'error', message: 'You can only invite friends.' });
      
      // Clean up any expired invites before checking for existing ones
      await cleanupExpiredTournamentInvites();
      
      // Check for existing invite and clean up if expired
      const existingInviteId = await redis.get(`${TOURNAMENT_INVITE_PREFIX}${inviteeEmail}`);
      console.log(`[Tournament Invite] Checking existing invite for ${inviteeEmail}:`, existingInviteId);
      if (existingInviteId) {
        const existingInviteData = await redis.get(`${TOURNAMENT_INVITE_PREFIX}${existingInviteId}`);
        console.log(`[Tournament Invite] Existing invite data:`, existingInviteData);
        if (existingInviteData) {
          const existingInvite = JSON.parse(existingInviteData);
          console.log(`[Tournament Invite] Parsed existing invite:`, existingInvite);
          // Check if the existing invite is from the same tournament
          if (existingInvite.tournamentId === tournamentId) {
            console.log(`[Tournament Invite] Already invited to same tournament`);
            return socket.emit('InviteToTournamentResponse', { status: 'error', message: 'Already invited to this tournament.' });
          }
          // Check if existing invite is expired (older than 30 seconds)
          if (Date.now() - existingInvite.createdAt > 30000) {
            console.log(`[Tournament Invite] Cleaning up expired invite`);
            // Clean up expired invite
            await Promise.all([
              redis.del(`${TOURNAMENT_INVITE_PREFIX}${existingInviteId}`),
              redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteeEmail}`)
            ]);
          } else {
            console.log(`[Tournament Invite] User has valid pending invite`);
            return socket.emit('InviteToTournamentResponse', { status: 'error', message: 'Already has a pending invite.' });
          }
        } else {
          console.log(`[Tournament Invite] Cleaning up stale invite reference`);
          // Clean up stale invite reference
          await redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteeEmail}`);
        }
      }
      console.log(`[Tournament Invite] No existing invite found, proceeding with new invite`);
      
      // Check if guest is online
      const guestSocketIds = await getSocketIds(inviteeEmail, 'sockets') || [];
      if (guestSocketIds.length === 0) return socket.emit('InviteToTournamentResponse', { status: 'error', message: 'User not online.' });
      // Store invite in Redis
      const inviteId = uuidv4();
      const inviteData = { inviteId, tournamentId, hostEmail, inviteeEmail, createdAt: Date.now() };
      await Promise.all([
        redis.setex(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`, 30, JSON.stringify(inviteData)),
        redis.setex(`${TOURNAMENT_INVITE_PREFIX}${inviteeEmail}`, 30, inviteId)
      ]);
      // Ensure hostUser and guestUser are plain objects
      const host = (hostUser as any).toJSON ? (hostUser as any).toJSON() : (hostUser as any);
      const guest = (guestUser as any).toJSON ? (guestUser as any).toJSON() : (guestUser as any);
      // Notify guest
      io.to(guestSocketIds).emit('TournamentInviteReceived', {
        type: 'tournament_invite',
        inviteId,
        tournamentId,
        hostEmail,
        message: `${host.username || host.email || 'Host'} invited you to a tournament!`,
        hostData: host,
        expiresAt: Date.now() + 30000
      });
      // Confirm to host
      socket.emit('InviteToTournamentResponse', {
        type: 'invite_sent',
        status: 'success',
        message: `Invitation sent to ${guest.username || guest.email || 'Guest'}`,
        inviteId,
        guestEmail: guest.email,
        guestData: guest
      });
      // Auto-expire
      setTimeout(async () => {
        const stillExists = await redis.get(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`);
        if (stillExists) {
          await Promise.all([
            redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`),
            redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteeEmail}`)
          ]);
          io.to([...(await getSocketIds(hostEmail, 'sockets') || []), ...guestSocketIds]).emit('TournamentInviteTimeout', { inviteId });
        }
      }, 30000);
    } catch (error) {
      console.error('[Tournament Invite] Error:', error);
      socket.emit('InviteToTournamentResponse', { status: 'error', message: 'Failed to send tournament invite.' });
    }
  });

  // Accept tournament invite
  socket.on('AcceptTournamentInvite', async (data: { inviteId: string; inviteeEmail: string }) => {
    try {
      const { inviteId, inviteeEmail } = data;
      if (!inviteId || !inviteeEmail) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Missing info.' });
      const inviteData = await redis.get(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`);
      if (!inviteData) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Invite expired.' });
      const invite = JSON.parse(inviteData);
      if (invite.inviteeEmail !== inviteeEmail) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Invalid invite.' });
      
      // Clean up invite
      await Promise.all([
        redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`),
        redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteeEmail}`)
      ]);
      
      // Get tournament data
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${invite.tournamentId}`);
      if (!tournamentData) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Tournament not found.' });
      
      const tournament: Tournament = JSON.parse(tournamentData);
      
      // Check if tournament is still in lobby state
      if (tournament.status !== 'lobby') {
        return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Tournament is no longer accepting players.' });
      }
      
      // Check if tournament is full
      if (tournament.participants.length >= tournament.size) {
        return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Tournament is full.' });
      }
      
      // Check if player is already in tournament
      const existingParticipant = tournament.participants.find(p => p.email === inviteeEmail);
      if (existingParticipant) {
        return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Already in tournament.' });
      }
      
      // Get user data
      const user = await getUserByEmail(inviteeEmail);
      if (!user) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'User not found.' });
      let userData: any = user;
      if (typeof user.parse === 'function') {
        userData = user.parse(user);
      }
      // Add player to tournament
      const newParticipant: TournamentParticipant = {
        email: inviteeEmail,
        nickname: userData.login || userData.username || inviteeEmail,
        avatar: userData.avatar || '/avatar/Default.svg',
        isHost: false,
        status: 'accepted'
      };
      
      tournament.participants.push(newParticipant);
      
      // Update tournament in Redis
      await redis.setex(`${TOURNAMENT_PREFIX}${invite.tournamentId}`, 3600, JSON.stringify(tournament));
      
      // Notify all tournament participants
      const allParticipantEmails = tournament.participants.map(p => p.email);
      const allSocketIds = [];
      
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        allSocketIds.push(...socketIds);
      }
      
      // Notify host of acceptance
      const hostSocketIds = await getSocketIds(invite.hostEmail, 'sockets') || [];
      io.to(hostSocketIds).emit('TournamentInviteAccepted', { 
        inviteId, 
        inviteeEmail,
        tournamentId: invite.tournamentId,
        newParticipant,
        tournament
      });
      
      // Notify the accepted player
      const guestSocketIds = await getSocketIds(inviteeEmail, 'sockets') || [];
      io.to(guestSocketIds).emit('TournamentInviteAccepted', { 
        inviteId, 
        inviteeEmail,
        tournamentId: invite.tournamentId,
        tournament
      });
      
      // Notify all participants about tournament update
      io.to(allSocketIds).emit('TournamentUpdated', {
        tournamentId: invite.tournamentId,
        tournament
      });
      
      // Check if tournament is ready to start
      if (tournament.participants.length === tournament.size) {
        // Tournament is full, notify all participants
        io.to(allSocketIds).emit('TournamentReady', {
          tournamentId: invite.tournamentId,
          tournament
        });
      }
      
    } catch (error) {
      socket.emit('TournamentInviteResponse', { status: 'error', message: 'Failed to accept tournament invite.' });
    }
  });

  // Decline tournament invite
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
        redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteeEmail}`)
      ]);
      // Notify host
      const hostSocketIds = await getSocketIds(invite.hostEmail, 'sockets') || [];
      io.to(hostSocketIds).emit('TournamentInviteDeclined', { inviteId, declinedBy: inviteeEmail });
      socket.emit('TournamentInviteResponse', { status: 'success', message: 'Invitation declined.' });
    } catch (error) {
      socket.emit('TournamentInviteResponse', { status: 'error', message: 'Failed to decline tournament invite.' });
    }
  });

  // Cancel tournament invite
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
        redis.del(`${TOURNAMENT_INVITE_PREFIX}${invite.inviteeEmail}`)
      ]);
      // Notify guest
      const guestSocketIds = await getSocketIds(invite.inviteeEmail, 'sockets') || [];
      io.to(guestSocketIds).emit('TournamentInviteCanceled', { inviteId, canceledBy: hostEmail });
      socket.emit('TournamentInviteResponse', { status: 'success', message: 'Invitation canceled.' });
    } catch (error) {
      socket.emit('TournamentInviteResponse', { status: 'error', message: 'Failed to cancel tournament invite.' });
    }
  });

  // Start tournament (when all players have joined)
  socket.on('StartTournament', async (data: { tournamentId: string; hostEmail: string }) => {
    try {
      const { tournamentId, hostEmail } = data;
      if (!tournamentId || !hostEmail) return socket.emit('TournamentStartResponse', { status: 'error', message: 'Missing info.' });
      
      // Get tournament data
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) return socket.emit('TournamentStartResponse', { status: 'error', message: 'Tournament not found.' });
      
      const tournament: Tournament = JSON.parse(tournamentData);
      
      // Check if user is the host
      if (tournament.hostEmail !== hostEmail) {
        return socket.emit('TournamentStartResponse', { status: 'error', message: 'Only the host can start the tournament.' });
      }
      
      // Check if tournament is in lobby state
      if (tournament.status !== 'lobby') {
        return socket.emit('TournamentStartResponse', { status: 'error', message: 'Tournament is not in lobby state.' });
      }
      
      // Check if tournament is full
      if (tournament.participants.length !== tournament.size) {
        return socket.emit('TournamentStartResponse', { status: 'error', message: `Tournament needs ${tournament.size} players to start.` });
      }
      
      // Create tournament bracket
      const matches = createTournamentBracket(tournament.participants, tournament.size);
      
      // Update tournament status
      tournament.status = 'in_progress';
      tournament.matches = matches;
      tournament.startedAt = Date.now();
      
      // Update tournament in Redis
      await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
      
      // Notify all participants
      const allParticipantEmails = tournament.participants.map(p => p.email);
      const allSocketIds = [];
      
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        allSocketIds.push(...socketIds);
      }
      
      io.to(allSocketIds).emit('TournamentStarted', {
        tournamentId,
        tournament,
        firstMatch: matches.find(m => m.round === 0 && m.state === 'waiting')
      });
      
      socket.emit('TournamentStartResponse', { status: 'success', message: 'Tournament started successfully.' });
      
    } catch (error) {
      socket.emit('TournamentStartResponse', { status: 'error', message: 'Failed to start tournament.' });
    }
  });

  // Join tournament (for participants to join the tournament lobby)
  socket.on('JoinTournament', async (data: { tournamentId: string; playerEmail: string }) => {
    try {
      const { tournamentId, playerEmail } = data;
      if (!tournamentId || !playerEmail) return socket.emit('TournamentJoinResponse', { status: 'error', message: 'Missing info.' });
      
      // Get tournament data
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) return socket.emit('TournamentJoinResponse', { status: 'error', message: 'Tournament not found.' });
      
      const tournament: Tournament = JSON.parse(tournamentData);
      
      // Check if player is a participant
      const participant = tournament.participants.find(p => p.email === playerEmail);
      if (!participant) {
        return socket.emit('TournamentJoinResponse', { status: 'error', message: 'You are not a participant in this tournament.' });
      }
      
      // Check if tournament is in a valid state
      if (tournament.status === 'completed' || tournament.status === 'canceled') {
        return socket.emit('TournamentJoinResponse', { status: 'error', message: 'Tournament is no longer active.' });
      }
      
      // Send tournament data to the player
      socket.emit('TournamentJoinResponse', { 
        status: 'success', 
        tournament,
        currentMatch: tournament.status === 'in_progress' ? 
          tournament.matches.find(m => 
            (m.player1?.email === playerEmail || m.player2?.email === playerEmail) && 
            m.state === 'waiting'
          ) : null
      });
      
    } catch (error) {
      socket.emit('TournamentJoinResponse', { status: 'error', message: 'Failed to join tournament.' });
    }
  });

  // Start a tournament match
  socket.on('StartTournamentMatch', async (data: { tournamentId: string; matchId: string; playerEmail: string }) => {
    try {
      const { tournamentId, matchId, playerEmail } = data;
      
      // Get tournament data
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) return socket.emit('TournamentMatchResponse', { status: 'error', message: 'Tournament not found.' });
      
      const tournament: Tournament = JSON.parse(tournamentData);
      
      // Find the match
      const match = tournament.matches.find(m => m.id === matchId);
      if (!match) return socket.emit('TournamentMatchResponse', { status: 'error', message: 'Match not found.' });
      
      // Check if player is in this match
      if (match.player1?.email !== playerEmail && match.player2?.email !== playerEmail) {
        return socket.emit('TournamentMatchResponse', { status: 'error', message: 'You are not in this match.' });
      }
      
      // Update match state
      match.state = 'in_progress';
      
      // Update tournament in Redis
      await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
      
      // Notify both players
      const allParticipantEmails = tournament.participants.map(p => p.email);
      const allSocketIds = [];
      
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        allSocketIds.push(...socketIds);
      }
      
      io.to(allSocketIds).emit('TournamentMatchStarted', {
        tournamentId,
        matchId,
        match,
        tournament
      });
      
      socket.emit('TournamentMatchResponse', { status: 'success', message: 'Match started.' });
      
    } catch (error) {
      socket.emit('TournamentMatchResponse', { status: 'error', message: 'Failed to start match.' });
    }
  });

  // Start a tournament match as OneVsOne game
  socket.on('StartTournamentMatchGame', async (data: { tournamentId: string; matchId: string; playerEmail: string }) => {
    try {
      const { tournamentId, matchId, playerEmail } = data;
      
      // Get tournament data
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) return socket.emit('TournamentMatchGameResponse', { status: 'error', message: 'Tournament not found.' });
      
      const tournament: Tournament = JSON.parse(tournamentData);
      
      // Find the match
      const match = tournament.matches.find(m => m.id === matchId);
      if (!match) return socket.emit('TournamentMatchGameResponse', { status: 'error', message: 'Match not found.' });
      
      // Check if player is in this match
      if (match.player1?.email !== playerEmail && match.player2?.email !== playerEmail) {
        return socket.emit('TournamentMatchGameResponse', { status: 'error', message: 'You are not in this match.' });
      }
      
      // Check if match is ready to start
      if (!match.player1 || !match.player2) {
        return socket.emit('TournamentMatchGameResponse', { status: 'error', message: 'Match is not ready to start.' });
      }
      
      // Create a OneVsOne game room for this tournament match
      const gameId = uuidv4();
      const gameRoom: GameRoomData = {
        gameId,
        hostEmail: match.player1.email,
        guestEmail: match.player2.email,
        status: 'accepted',
        createdAt: Date.now()
      };
      
      // Save game room to Redis
      await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom));
      
      // Import gameRooms from types to add the room
      const { gameRooms } = await import('./game.socket.types');
      gameRooms.set(gameId, gameRoom);
      
      // Get socket IDs for both players
      const [player1SocketIds, player2SocketIds] = await Promise.all([
        getSocketIds(match.player1.email, 'sockets') || [],
        getSocketIds(match.player2.email, 'sockets') || []
      ]);
      
      // Get user data for both players
      const [player1User, player2User] = await Promise.all([
        getUserByEmail(match.player1.email),
        getUserByEmail(match.player2.email)
      ]);
      
      if (!player1User || !player2User) {
        return socket.emit('TournamentMatchGameResponse', { status: 'error', message: 'Failed to fetch player data.' });
      }
      
      const player1Data = getPlayerData(player1User);
      const player2Data = getPlayerData(player2User);
      
      // Update match state to in_progress
      match.state = 'in_progress';
      await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
      
      // Notify both players about the tournament match game
      const matchData = {
        gameId,
        tournamentId,
        matchId,
        hostEmail: match.player1.email,
        guestEmail: match.player2.email,
        hostData: player1Data,
        guestData: player2Data,
        status: 'tournament_match_found',
        message: 'Tournament match starting!'
      };
      
      io.to([...player1SocketIds, ...player2SocketIds]).emit('TournamentMatchGameStarted', matchData);
      
      // Notify all tournament participants about match state change
      const allParticipantEmails = tournament.participants.map(p => p.email);
      const allSocketIds = [];
      
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        allSocketIds.push(...socketIds);
      }
      
      io.to(allSocketIds).emit('TournamentMatchStarted', {
        tournamentId,
        matchId,
        match,
        tournament
      });
      
      socket.emit('TournamentMatchGameResponse', { 
        status: 'success', 
        message: 'Tournament match game started.',
        gameId,
        matchData
      });
      
    } catch (error) {
      console.error('Error starting tournament match game:', error);
      socket.emit('TournamentMatchGameResponse', { status: 'error', message: 'Failed to start tournament match game.' });
    }
  });

  // Report tournament match result
  socket.on('TournamentMatchResult', async (data: { 
    tournamentId: string; 
    matchId: string; 
    winnerEmail: string; 
    loserEmail: string;
    playerEmail: string;
  }) => {
    try {
      const { tournamentId, matchId, winnerEmail, loserEmail, playerEmail } = data;
      
      // Get tournament data
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) return socket.emit('TournamentMatchResponse', { status: 'error', message: 'Tournament not found.' });
      
      const tournament: Tournament = JSON.parse(tournamentData);
      
      // Find the match
      const match = tournament.matches.find(m => m.id === matchId);
      if (!match) return socket.emit('TournamentMatchResponse', { status: 'error', message: 'Match not found.' });
      
      // Check if player is in this match
      if (match.player1?.email !== playerEmail && match.player2?.email !== playerEmail) {
        return socket.emit('TournamentMatchResponse', { status: 'error', message: 'You are not in this match.' });
      }
      
      // Update match result
      if (match.player1?.email === winnerEmail) {
        match.state = 'player1_win';
        match.winner = match.player1;
      } else if (match.player2?.email === winnerEmail) {
        match.state = 'player2_win';
        match.winner = match.player2;
      } else {
        return socket.emit('TournamentMatchResponse', { status: 'error', message: 'Invalid winner.' });
      }
      
      // Update loser status
      const loserParticipant = tournament.participants.find(p => p.email === loserEmail);
      if (loserParticipant) {
        loserParticipant.status = 'eliminated';
      }
      
      // Check if all matches in current round are complete
      const currentRound = match.round;
      const roundMatches = tournament.matches.filter(m => m.round === currentRound);
      const allRoundComplete = roundMatches.every(m => m.state !== 'waiting' && m.state !== 'in_progress');
      
      if (allRoundComplete) {
        // Advance to next round
        const updatedTournament = advanceTournamentRound(tournament);
        
        // Update tournament in Redis
        await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(updatedTournament));
        
        // Notify all participants
        const allParticipantEmails = updatedTournament.participants.map(p => p.email);
        const allSocketIds = [];
        
        for (const email of allParticipantEmails) {
          const socketIds = await getSocketIds(email, 'sockets') || [];
          allSocketIds.push(...socketIds);
        }
        
        if (updatedTournament.status === 'completed') {
          // Tournament is complete
          io.to(allSocketIds).emit('TournamentCompleted', {
            tournamentId,
            tournament: updatedTournament,
            winner: updatedTournament.participants.find(p => p.status === 'winner')
          });
        } else {
          // Next round started
          io.to(allSocketIds).emit('TournamentRoundAdvanced', {
            tournamentId,
            tournament: updatedTournament,
            nextRound: currentRound + 1
          });
        }
      } else {
        // Just update the current match
        await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
      }
      
      // Notify all participants about match result
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

  // Leave tournament
  socket.on('LeaveTournament', async (data: { tournamentId: string; playerEmail: string }) => {
    try {
      const { tournamentId, playerEmail } = data;
      
      // Get tournament data
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) return socket.emit('TournamentLeaveResponse', { status: 'error', message: 'Tournament not found.' });
      
      const tournament: Tournament = JSON.parse(tournamentData);
      
      // Check if player is a participant
      const participant = tournament.participants.find(p => p.email === playerEmail);
      if (!participant) {
        return socket.emit('TournamentLeaveResponse', { status: 'error', message: 'You are not a participant in this tournament.' });
      }
      
      // Remove participant from tournament
      tournament.participants = tournament.participants.filter(p => p.email !== playerEmail);
      
      // If host leaves, cancel tournament and redirect all players
      if (playerEmail === tournament.hostEmail) {
        tournament.status = 'canceled';
        tournament.endedAt = Date.now();
        
        // Notify all participants that tournament is canceled
        const allParticipantEmails = tournament.participants.map(p => p.email);
        const allSocketIds = [];
        
        for (const email of allParticipantEmails) {
          const socketIds = await getSocketIds(email, 'sockets') || [];
          allSocketIds.push(...socketIds);
        }
        
        io.to(allSocketIds).emit('TournamentCanceled', {
          tournamentId,
          tournament,
          reason: 'Host left the tournament'
        });
        
        // Redirect all participants to play page
        io.to(allSocketIds).emit('RedirectToPlay', {
          message: 'Tournament canceled because host left.'
        });
      } else {
        // Regular participant left
        // If tournament is in progress, mark them as eliminated
        if (tournament.status === 'in_progress') {
          participant.status = 'eliminated';
          
          // Find any active matches with this player and mark them as completed
          for (const match of tournament.matches) {
            if ((match.player1?.email === playerEmail || match.player2?.email === playerEmail) && 
                match.state === 'waiting' || match.state === 'in_progress') {
              // Mark the other player as winner
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
        
        // Notify remaining participants
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
      
      // Update tournament in Redis
      await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
      
      // Redirect the leaving player to play page
      socket.emit('RedirectToPlay', {
        message: 'You have left the tournament.'
      });
      
      socket.emit('TournamentLeaveResponse', { status: 'success', message: 'Left tournament successfully.' });
      
    } catch (error) {
      socket.emit('TournamentLeaveResponse', { status: 'error', message: 'Failed to leave tournament.' });
    }
  });
};

// Helper function to create tournament bracket
function createTournamentBracket(participants: TournamentParticipant[], size: number): TournamentMatch[] {
  const matches: TournamentMatch[] = [];
  const totalRounds = Math.log2(size);
  
  // Shuffle participants for random seeding
  const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
  
  // Create first round matches
  for (let i = 0; i < size / 2; i++) {
    const player1 = shuffledParticipants[i * 2] || undefined;
    const player2 = shuffledParticipants[i * 2 + 1] || undefined;
    let state: TournamentMatch['state'] = 'waiting';
    let winner: TournamentParticipant | undefined = undefined;
    
    // Handle byes (when there's no opponent)
    if (player1 && !player2) {
      state = 'player1_win';
      winner = player1;
    } else if (!player1 && player2) {
      state = 'player2_win';
      winner = player2;
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
  
  // Create placeholder matches for future rounds
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

// Helper function to advance tournament to next round
function advanceTournamentRound(tournament: Tournament): Tournament {
  const currentRound = Math.max(...tournament.matches.map(m => m.round));
  const nextRound = currentRound + 1;
  const totalRounds = Math.log2(tournament.size);
  
  if (nextRound >= totalRounds) {
    // Tournament is complete
    tournament.status = 'completed';
    tournament.endedAt = Date.now();
    
    // Find the winner (last remaining player)
    const finalMatch = tournament.matches.find(m => m.round === currentRound && m.state !== 'waiting');
    if (finalMatch && finalMatch.winner) {
      // Update winner status
      const winnerParticipant = tournament.participants.find(p => p.email === finalMatch.winner!.email);
      if (winnerParticipant) {
        winnerParticipant.status = 'winner';
      }
    }
    
    return tournament;
  }
  
  // Get completed matches from current round
  const completedMatches = tournament.matches.filter(m => m.round === currentRound && m.state !== 'waiting');
  
  // Create next round matches
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
  
  // Add new matches to tournament
  tournament.matches.push(...nextRoundMatches);
  
  return tournament;
} 