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

type TournamentEventData = any; // TODO: Strongly type each event

export const handleTournament: GameSocketHandler = (socket: Socket, io: Server) => {
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
      console.log('[Tournament] AcceptTournamentInvite received:', { inviteId, inviteeEmail });
      
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
      
      console.log('[Tournament] Participant added to tournament:', newParticipant);
      console.log('[Tournament] Updated tournament participants:', tournament.participants);
      
      // Get all socket IDs for all participants (including the new one)
      const allParticipantEmails = tournament.participants.map(p => p.email);
      const allSocketIds = [];
      
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        allSocketIds.push(...socketIds);
      }
      
      console.log('[Tournament] Emitting TournamentInviteAccepted to all participants:', allParticipantEmails);
      console.log('[Tournament] Socket IDs to notify:', allSocketIds);
      
      // Emit to ALL participants (including host and new participant)
      io.to(allSocketIds).emit('TournamentInviteAccepted', { 
        inviteId, 
        inviteeEmail,
        tournamentId: invite.tournamentId,
        newParticipant,
        tournament
      });
      
      // Also emit TournamentUpdated to ensure all participants get the latest data
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
      
      // Send success response to the accepting player
      socket.emit('TournamentInviteResponse', { status: 'success', message: 'Joined tournament successfully.' });
      
    } catch (error) {
      console.error('[Tournament] Error accepting tournament invite:', error);
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
      console.log('[Tournament] StartTournament event received:', { tournamentId, hostEmail });
      
      if (!tournamentId || !hostEmail) {
        console.log('[Tournament] Missing info, emitting error response');
        return socket.emit('TournamentStartResponse', { status: 'error', message: 'Missing info.' });
      }
      
      // Get tournament data
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) {
        console.log('[Tournament] Tournament not found, emitting error response');
        return socket.emit('TournamentStartResponse', { status: 'error', message: 'Tournament not found.' });
      }
      
      const tournament: Tournament = JSON.parse(tournamentData);
      console.log('[Tournament] Tournament data retrieved:', { 
        status: tournament.status, 
        participants: tournament.participants.length,
        size: tournament.size,
        hostEmail: tournament.hostEmail 
      });
      
      // Check if user is the host
      if (tournament.hostEmail !== hostEmail) {
        console.log('[Tournament] User is not host, emitting error response');
        return socket.emit('TournamentStartResponse', { status: 'error', message: 'Only the host can start the tournament.' });
      }
      
      // Check if tournament is in lobby state
      if (tournament.status !== 'lobby') {
        console.log('[Tournament] Tournament not in lobby state, emitting error response');
        return socket.emit('TournamentStartResponse', { status: 'error', message: 'Tournament is not in lobby state.' });
      }
      
      // Check if tournament is full
      if (tournament.participants.length !== tournament.size) {
        console.log('[Tournament] Tournament not full, emitting error response');
        return socket.emit('TournamentStartResponse', { status: 'error', message: `Tournament needs ${tournament.size} players to start.` });
      }
      
      console.log('[Tournament] All checks passed, creating tournament bracket');
      
      // Create tournament bracket
      const matches = createTournamentBracket(tournament.participants, tournament.size);
      
      // Update tournament status
      tournament.status = 'in_progress';
      tournament.matches = matches;
      tournament.startedAt = Date.now();
      
      // Update tournament in Redis
      await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
      console.log('[Tournament] Tournament updated in Redis');
      
      // Notify all participants
      const allParticipantEmails = tournament.participants.map(p => p.email);
      const allSocketIds = [];
      
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        allSocketIds.push(...socketIds);
      }
      
      console.log('[Tournament] Emitting TournamentStarted to all participants:', allSocketIds);
      io.to(allSocketIds).emit('TournamentStarted', {
        tournamentId,
        tournament,
        message: 'Tournament has started!'
      });
      
      console.log('[Tournament] Emitting TournamentStartResponse to host');
      socket.emit('TournamentStartResponse', { status: 'success', message: 'Tournament started successfully.' });
      console.log('[Tournament] TournamentStartResponse emitted successfully');
      
    } catch (error) {
      console.error('[Tournament] Error starting tournament:', error);
      socket.emit('TournamentStartResponse', { status: 'error', message: 'Failed to start tournament.' });
    }
  });

  // Start next round matches (host only) - starts all matches in current round directly
  socket.on('StartNextRoundMatches', async (data: { tournamentId: string; hostEmail: string }) => {
    try {
      const { tournamentId, hostEmail } = data;
      console.log('[Tournament] Starting next round matches:', { tournamentId, hostEmail });
      
      if (!tournamentId || !hostEmail) return socket.emit('StartNextRoundMatchesResponse', { status: 'error', message: 'Missing info.' });
      
      // Get tournament data
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) return socket.emit('StartNextRoundMatchesResponse', { status: 'error', message: 'Tournament not found.' });
      
      const tournament: Tournament = JSON.parse(tournamentData);
      console.log('[Tournament] Tournament data:', { 
        status: tournament.status, 
        participants: tournament.participants.length,
        matches: tournament.matches.length 
      });
      
      // Check if user is the host
      if (tournament.hostEmail !== hostEmail) {
        return socket.emit('StartNextRoundMatchesResponse', { status: 'error', message: 'Only the host can start matches.' });
      }
      
      // Check if tournament is in progress
      if (tournament.status !== 'in_progress') {
        return socket.emit('StartNextRoundMatchesResponse', { status: 'error', message: 'Tournament is not in progress.' });
      }
      
      // Find current round matches that are waiting
      const currentRoundMatches = tournament.matches.filter(m => 
        m.state === 'waiting' && m.player1 && m.player2
      );
      
      console.log('[Tournament] Current round matches found:', currentRoundMatches.length);
      
      if (currentRoundMatches.length === 0) {
        return socket.emit('StartNextRoundMatchesResponse', { status: 'error', message: 'No matches ready to start.' });
      }
      
      // Start all matches directly without invitations
      const startedMatches = [];
      
      for (const match of currentRoundMatches) {
        console.log('[Tournament] Starting match directly:', { 
          matchId: match.id, 
          player1: match.player1?.email, 
          player2: match.player2?.email 
        });
        
        // Update match state to in_progress
        match.state = 'in_progress';
        
        // Create game room for this match
        const gameId = uuidv4();
        const gameRoom: GameRoomData = {
          gameId,
          hostEmail: match.player1!.email,
          guestEmail: match.player2!.email,
          status: 'accepted',
          createdAt: Date.now(),
          tournamentId: tournamentId,
          matchId: match.id
        };
        
        // Save game room to Redis
        await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom));
        
        // Import gameRooms from types to add the room
        const { gameRooms } = await import('./game.socket.types');
        gameRooms.set(gameId, gameRoom);
        
        // Get socket IDs for both players
        const [player1SocketIds, player2SocketIds] = await Promise.all([
          getSocketIds(match.player1!.email, 'sockets') || [],
          getSocketIds(match.player2!.email, 'sockets') || []
        ]);
        
        // Get user data for both players
        const [player1User, player2User] = await Promise.all([
          getUserByEmail(match.player1!.email),
          getUserByEmail(match.player2!.email)
        ]);
        
        if (!player1User || !player2User) {
          console.log('[Tournament] Failed to fetch player data for match:', match.id);
          continue;
        }
        
        const player1Data = getPlayerData(player1User);
        const player2Data = getPlayerData(player2User);
        
        // Send match data to both players
        const matchData = {
          gameId,
          tournamentId,
          matchId: match.id,
          hostEmail: match.player1!.email,
          guestEmail: match.player2!.email,
          hostData: player1Data,
          guestData: player2Data,
          status: 'tournament_match_found',
          message: 'Tournament match starting!'
        };
        
        const allSocketIds = [...player1SocketIds, ...player2SocketIds];
        console.log('[Tournament] Sending match data to sockets:', allSocketIds);
        console.log('[Tournament] Player 1 socket IDs:', player1SocketIds);
        console.log('[Tournament] Player 2 socket IDs:', player2SocketIds);
        console.log('[Tournament] Match data being sent:', matchData);
        
        if (allSocketIds.length > 0) {
          console.log('[Tournament] Emitting TournamentMatchGameStarted to sockets:', allSocketIds);
          io.to(allSocketIds).emit('TournamentMatchGameStarted', matchData);
          console.log('[Tournament] TournamentMatchGameStarted event emitted successfully');
        } else {
          console.log('[Tournament] No socket IDs found for players, cannot emit event');
        }
        
        startedMatches.push({
          matchId: match.id,
          gameId,
          player1: match.player1!,
          player2: match.player2!
        });
      }
      
      // Update tournament in Redis
      await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
      
      // Notify all tournament participants about match state changes
      const allParticipantEmails = tournament.participants.map(p => p.email);
      const allSocketIds = [];
      
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        allSocketIds.push(...socketIds);
      }
      
      if (allSocketIds.length > 0) {
        io.to(allSocketIds).emit('TournamentMatchesStarted', {
          tournamentId,
          matches: startedMatches,
          tournament
        });
      }
      
      socket.emit('StartNextRoundMatchesResponse', { 
        status: 'success', 
        message: `Started ${startedMatches.length} matches. Players have been sent to their games.`,
        matches: startedMatches
      });
      
    } catch (error) {
      console.error('[Tournament] Error starting next round matches:', error);
      socket.emit('StartNextRoundMatchesResponse', { status: 'error', message: 'Failed to start matches.' });
    }
  });

  // Accept tournament match invitation
  socket.on('AcceptTournamentMatchInvitation', async (data: { invitationId: string; playerEmail: string }) => {
    try {
      const { invitationId, playerEmail } = data;
      console.log('[Tournament] Accept invitation received:', { invitationId, playerEmail });
      
      // Get invitation data
      const invitationData = await redis.get(`tournament_match_invite:${invitationId}`);
      if (!invitationData) {
        return socket.emit('TournamentMatchInvitationResponse', { status: 'error', message: 'Invitation expired.' });
      }
      
      const invitation = JSON.parse(invitationData);
      console.log('[Tournament] Invitation data:', invitation);
      
      // Check if player is in this match
      if (invitation.player1Email !== playerEmail && invitation.player2Email !== playerEmail) {
        return socket.emit('TournamentMatchInvitationResponse', { status: 'error', message: 'You are not in this match.' });
      }
      
      // Mark this player as accepted
      const acceptKey = `tournament_match_accept:${invitationId}:${playerEmail}`;
      await redis.setex(acceptKey, 30, 'accepted');
      
      console.log('[Tournament] Player accepted:', playerEmail);
      
      // Check if both players have accepted
      const player1Accepted = await redis.get(`tournament_match_accept:${invitationId}:${invitation.player1Email}`);
      const player2Accepted = await redis.get(`tournament_match_accept:${invitationId}:${invitation.player2Email}`);
      
      console.log('[Tournament] Acceptance status:', { 
        player1: invitation.player1Email, 
        player1Accepted: !!player1Accepted,
        player2: invitation.player2Email, 
        player2Accepted: !!player2Accepted 
      });
      
      if (player1Accepted && player2Accepted) {
        console.log('[Tournament] Both players accepted, creating game room');
        
        // Both players accepted, create the game room
        const gameId = uuidv4();
        const gameRoom: GameRoomData = {
          gameId,
          hostEmail: invitation.player1Email,
          guestEmail: invitation.player2Email,
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
          getSocketIds(invitation.player1Email, 'sockets') || [],
          getSocketIds(invitation.player2Email, 'sockets') || []
        ]);
        
        // Get user data for both players
        const [player1User, player2User] = await Promise.all([
          getUserByEmail(invitation.player1Email),
          getUserByEmail(invitation.player2Email)
        ]);
        
        if (!player1User || !player2User) {
          return socket.emit('TournamentMatchInvitationResponse', { status: 'error', message: 'Failed to fetch player data.' });
        }
        
        const player1Data = getPlayerData(player1User);
        const player2Data = getPlayerData(player2User);
        
        // Get tournament data
        const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${invitation.tournamentId}`);
        if (!tournamentData) {
          return socket.emit('TournamentMatchInvitationResponse', { status: 'error', message: 'Tournament not found.' });
        }
        
        const tournament: Tournament = JSON.parse(tournamentData);
        
        // Find the match and update its state
        const match = tournament.matches.find(m => m.id === invitation.matchId);
        if (match) {
          match.state = 'in_progress';
          await redis.setex(`${TOURNAMENT_PREFIX}${invitation.tournamentId}`, 3600, JSON.stringify(tournament));
        }
        
        // Notify both players about the tournament match game
        const matchData = {
          gameId,
          tournamentId: invitation.tournamentId,
          matchId: invitation.matchId,
          hostEmail: invitation.player1Email,
          guestEmail: invitation.player2Email,
          hostData: player1Data,
          guestData: player2Data,
          status: 'tournament_match_found',
          message: 'Tournament match starting!'
        };
        
        const allSocketIds = [...player1SocketIds, ...player2SocketIds];
        console.log('[Tournament] Sending match data to sockets:', allSocketIds);
        
        io.to(allSocketIds).emit('TournamentMatchGameStarted', matchData);
        
        // Notify all tournament participants about match state change
        const allParticipantEmails = tournament.participants.map(p => p.email);
        const allParticipantSocketIds = [];
        
        for (const email of allParticipantEmails) {
          const socketIds = await getSocketIds(email, 'sockets') || [];
          allParticipantSocketIds.push(...socketIds);
        }
        
        io.to(allParticipantSocketIds).emit('TournamentMatchStarted', {
          tournamentId: invitation.tournamentId,
          matchId: invitation.matchId,
          match,
          tournament
        });
        
        // Clean up invitation and acceptance data
        await Promise.all([
          redis.del(`tournament_match_invite:${invitationId}`),
          redis.del(`tournament_match_accept:${invitationId}:${invitation.player1Email}`),
          redis.del(`tournament_match_accept:${invitationId}:${invitation.player2Email}`)
        ]);
        
        socket.emit('TournamentMatchInvitationResponse', { 
          status: 'success', 
          message: 'Match invitation accepted. Game room created!',
          gameId,
          matchData
        });
        
      } else {
        // Only one player accepted, notify the other player
        const otherPlayerEmail = invitation.player1Email === playerEmail ? invitation.player2Email : invitation.player1Email;
        const otherPlayerSocketIds = await getSocketIds(otherPlayerEmail, 'sockets') || [];
        
        if (otherPlayerSocketIds.length > 0) {
          io.to(otherPlayerSocketIds).emit('TournamentMatchInvitationUpdate', {
            invitationId,
            message: `${playerEmail} has accepted the match invitation. Waiting for your response...`
          });
        }
        
        socket.emit('TournamentMatchInvitationResponse', { 
          status: 'success', 
          message: 'Match invitation accepted. Waiting for opponent...'
        });
      }
      
    } catch (error) {
      console.error('Error accepting tournament match invitation:', error);
      socket.emit('TournamentMatchInvitationResponse', { status: 'error', message: 'Failed to accept invitation.' });
    }
  });

  // Decline tournament match invitation
  socket.on('DeclineTournamentMatchInvitation', async (data: { invitationId: string; playerEmail: string }) => {
    try {
      const { invitationId, playerEmail } = data;
      console.log('[Tournament] Decline invitation received:', { invitationId, playerEmail });
      
      // Get invitation data
      const invitationData = await redis.get(`tournament_match_invite:${invitationId}`);
      if (!invitationData) {
        return socket.emit('TournamentMatchInvitationResponse', { status: 'error', message: 'Invitation expired.' });
      }
      
      const invitation = JSON.parse(invitationData);
      
      // Check if player is in this match
      if (invitation.player1Email !== playerEmail && invitation.player2Email !== playerEmail) {
        return socket.emit('TournamentMatchInvitationResponse', { status: 'error', message: 'You are not in this match.' });
      }
      
      // Mark the declining player as eliminated and the other player as winner
      const decliningPlayer = invitation.player1Email === playerEmail ? invitation.player1Email : invitation.player2Email;
      const winningPlayer = invitation.player1Email === playerEmail ? invitation.player2Email : invitation.player1Email;
      
      // Get tournament data
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${invitation.tournamentId}`);
      if (!tournamentData) {
        return socket.emit('TournamentMatchInvitationResponse', { status: 'error', message: 'Tournament not found.' });
      }
      
      const tournament: Tournament = JSON.parse(tournamentData);
      
      // Find the match
      const match = tournament.matches.find(m => m.id === invitation.matchId);
      if (match) {
        match.state = invitation.player1Email === playerEmail ? 'player2_win' : 'player1_win';
        match.winner = tournament.participants.find(p => p.email === winningPlayer);
        
        // Mark declining player as eliminated
        const decliningParticipant = tournament.participants.find(p => p.email === decliningPlayer);
        if (decliningParticipant) {
          decliningParticipant.status = 'eliminated';
        }
        
        // Update tournament in Redis
        await redis.setex(`${TOURNAMENT_PREFIX}${invitation.tournamentId}`, 3600, JSON.stringify(tournament));
      }
      
      // Clean up invitation and acceptance data
      await Promise.all([
        redis.del(`tournament_match_invite:${invitationId}`),
        redis.del(`tournament_match_accept:${invitationId}:${invitation.player1Email}`),
        redis.del(`tournament_match_accept:${invitationId}:${invitation.player2Email}`)
      ]);
      
      // Notify all participants about the decline
      const allParticipantEmails = tournament.participants.map(p => p.email);
      const allSocketIds = [];
      
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        allSocketIds.push(...socketIds);
      }
      
      io.to(allSocketIds).emit('TournamentMatchDeclined', {
        tournamentId: invitation.tournamentId,
        matchId: invitation.matchId,
        decliningPlayer: { email: decliningPlayer },
        winningPlayer: { email: winningPlayer },
        message: `${decliningPlayer} declined the match invitation and was eliminated`
      });
      
      socket.emit('TournamentMatchInvitationResponse', { 
        status: 'success', 
        message: 'Match invitation declined. You have been eliminated from the tournament.'
      });
      
    } catch (error) {
      console.error('Error declining tournament match invitation:', error);
      socket.emit('TournamentMatchInvitationResponse', { status: 'error', message: 'Failed to decline invitation.' });
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
      console.log('[Tournament] Match result received:', { tournamentId, matchId, winnerEmail, loserEmail, playerEmail });
      
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
      
      // Update loser status and send them back to lobby
      const loserParticipant = tournament.participants.find(p => p.email === loserEmail);
      if (loserParticipant) {
        loserParticipant.status = 'eliminated';
        
        // Send loser back to lobby
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
      
      // Update winner status
      const winnerParticipant = tournament.participants.find(p => p.email === winnerEmail);
      if (winnerParticipant) {
        winnerParticipant.status = 'accepted';
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
          const winner = updatedTournament.participants.find(p => p.status === 'winner');
          
          // Send winner to lobby
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
          
          // Send host back to tournament management (even if they lost)
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
          
          // Notify all other participants
          io.to(allSocketIds).emit('TournamentCompleted', {
            tournamentId,
            tournament: updatedTournament,
            winner
          });
        } else {
          // Next round started - advance winners to their next matches
          const nextRound = currentRound + 1;
          const nextRoundMatches = updatedTournament.matches.filter(m => m.round === nextRound);
          
          // Find winners and send them to their next matches
          for (const nextMatch of nextRoundMatches) {
            if (nextMatch.player1 && nextMatch.player2) {
              // Both players are set, this match is ready
              const player1SocketIds = await getSocketIds(nextMatch.player1.email, 'sockets') || [];
              const player2SocketIds = await getSocketIds(nextMatch.player2.email, 'sockets') || [];
              
              // Send both players to their next match
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
      console.error('[Tournament] Error recording match result:', error);
      socket.emit('TournamentMatchResponse', { status: 'error', message: 'Failed to record match result.' });
    }
  });

  // Cancel tournament (host only)
  socket.on('CancelTournament', async (data: { tournamentId: string; hostEmail: string }) => {
    try {
      const { tournamentId, hostEmail } = data;
      if (!tournamentId || !hostEmail) return socket.emit('TournamentCancelResponse', { status: 'error', message: 'Missing info.' });
      
      // Get tournament data
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) return socket.emit('TournamentCancelResponse', { status: 'error', message: 'Tournament not found.' });
      
      const tournament: Tournament = JSON.parse(tournamentData);
      
      // Check if user is the host
      if (tournament.hostEmail !== hostEmail) {
        return socket.emit('TournamentCancelResponse', { status: 'error', message: 'Only the host can cancel the tournament.' });
      }
      
      // Check if tournament is in lobby state
      if (tournament.status !== 'lobby') {
        return socket.emit('TournamentCancelResponse', { status: 'error', message: 'Tournament is not in lobby state.' });
      }
      
      // Update tournament status to canceled
      tournament.status = 'canceled';
      tournament.endedAt = Date.now();
      
      // Update tournament in Redis
      await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
      
      // Notify all participants that tournament is canceled
      const allParticipantEmails = tournament.participants.map(p => p.email);
      const allSocketIds = [];
      
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        allSocketIds.push(...socketIds);
      }
      
      // Emit tournament canceled event to all participants
      io.to(allSocketIds).emit('TournamentCanceled', {
        tournamentId,
        tournament,
        reason: 'Host canceled the tournament'
      });
      
      // Redirect all participants to play page
      io.to(allSocketIds).emit('RedirectToPlay', {
        message: 'Tournament was canceled by the host.'
      });
      
      socket.emit('TournamentCancelResponse', { status: 'success', message: 'Tournament canceled successfully.' });
      
    } catch (error) {
      socket.emit('TournamentCancelResponse', { status: 'error', message: 'Failed to cancel tournament.' });
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

  // Test tournament socket connection
  socket.on('TestTournamentSocket', async (data: { tournamentId: string; playerEmail: string }) => {
    try {
      const { tournamentId, playerEmail } = data;
      console.log('[Tournament] Test socket event received:', { tournamentId, playerEmail });
      
      // Get socket IDs for the player
      const playerSocketIds = await getSocketIds(playerEmail, 'sockets') || [];
      console.log('[Tournament] Player socket IDs:', playerSocketIds);
      
      // Send test message back
      socket.emit('TestTournamentSocketResponse', {
        status: 'success',
        message: 'Socket connection working',
        playerSocketIds,
        playerEmail
      });
      
      // Also send to all player sockets
      if (playerSocketIds.length > 0) {
        io.to(playerSocketIds).emit('TestTournamentSocketResponse', {
          status: 'success',
          message: 'Socket connection working for player',
          playerSocketIds,
          playerEmail
        });
      }
      
    } catch (error) {
      console.error('[Tournament] Test socket error:', error);
      socket.emit('TestTournamentSocketResponse', {
        status: 'error',
        message: 'Socket test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Start tournament matches directly (for host) - starts all matches in current round
  socket.on('StartTournamentMatches', async (data: { tournamentId: string; hostEmail: string }) => {
    try {
      const { tournamentId, hostEmail } = data;
      console.log('[Tournament] Starting all matches for tournament:', tournamentId);
      
      // Get tournament data
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) return socket.emit('StartTournamentMatchesResponse', { status: 'error', message: 'Tournament not found.' });
      
      const tournament: Tournament = JSON.parse(tournamentData);
      console.log('[Tournament] Tournament data:', { 
        status: tournament.status, 
        participants: tournament.participants.length,
        matches: tournament.matches.length 
      });
      
      // Check if user is the host
      if (tournament.hostEmail !== hostEmail) {
        return socket.emit('StartTournamentMatchesResponse', { status: 'error', message: 'Only the host can start matches.' });
      }
      
      // Check if tournament is in progress
      if (tournament.status !== 'in_progress') {
        return socket.emit('StartTournamentMatchesResponse', { status: 'error', message: 'Tournament is not in progress.' });
      }
      
      // Find current round matches that are waiting
      const currentRoundMatches = tournament.matches.filter(m => 
        m.state === 'waiting' && m.player1 && m.player2
      );
      
      console.log('[Tournament] Current round matches found:', currentRoundMatches.length);
      
      if (currentRoundMatches.length === 0) {
        return socket.emit('StartTournamentMatchesResponse', { status: 'error', message: 'No matches ready to start.' });
      }
      
      // Start all matches directly without invitations
      const startedMatches = [];
      
      for (const match of currentRoundMatches) {
        console.log('[Tournament] Starting match directly:', { 
          matchId: match.id, 
          player1: match.player1?.email, 
          player2: match.player2?.email 
        });
        
        // Update match state to in_progress
        match.state = 'in_progress';
        
        // Create game room for this match
        const gameId = uuidv4();
        const gameRoom: GameRoomData = {
          gameId,
          hostEmail: match.player1!.email,
          guestEmail: match.player2!.email,
          status: 'accepted',
          createdAt: Date.now(),
          tournamentId: tournamentId,
          matchId: match.id
        };
        
        // Save game room to Redis
        await redis.setex(`game_room:${gameId}`, 3600, JSON.stringify(gameRoom));
        
        // Import gameRooms from types to add the room
        const { gameRooms } = await import('./game.socket.types');
        gameRooms.set(gameId, gameRoom);
        
        // Get socket IDs for both players
        const [player1SocketIds, player2SocketIds] = await Promise.all([
          getSocketIds(match.player1!.email, 'sockets') || [],
          getSocketIds(match.player2!.email, 'sockets') || []
        ]);
        
        // Get user data for both players
        const [player1User, player2User] = await Promise.all([
          getUserByEmail(match.player1!.email),
          getUserByEmail(match.player2!.email)
        ]);
        
        if (!player1User || !player2User) {
          console.log('[Tournament] Failed to fetch player data for match:', match.id);
          continue;
        }
        
        const player1Data = getPlayerData(player1User);
        const player2Data = getPlayerData(player2User);
        
        // Send match data to both players
        const matchData = {
          gameId,
          tournamentId,
          matchId: match.id,
          hostEmail: match.player1!.email,
          guestEmail: match.player2!.email,
          hostData: player1Data,
          guestData: player2Data,
          status: 'tournament_match_found',
          message: 'Tournament match starting!'
        };
        
        const allSocketIds = [...player1SocketIds, ...player2SocketIds];
        console.log('[Tournament] Sending match data to sockets:', allSocketIds);
        
        if (allSocketIds.length > 0) {
          console.log('[Tournament] Emitting TournamentMatchGameStarted to sockets:', allSocketIds);
          io.to(allSocketIds).emit('TournamentMatchGameStarted', matchData);
          console.log('[Tournament] TournamentMatchGameStarted event emitted successfully');
        } else {
          console.log('[Tournament] No socket IDs found for players, cannot emit event');
        }
        
        startedMatches.push({
          matchId: match.id,
          gameId,
          player1: match.player1!,
          player2: match.player2!
        });
      }
      
      // Update tournament in Redis
      await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
      
      // Notify all tournament participants about match state changes
      const allParticipantEmails = tournament.participants.map(p => p.email);
      const allSocketIds = [];
      
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        allSocketIds.push(...socketIds);
      }
      
      if (allSocketIds.length > 0) {
        io.to(allSocketIds).emit('TournamentMatchesStarted', {
          tournamentId,
          matches: startedMatches,
          tournament
        });
      }
      
      socket.emit('StartTournamentMatchesResponse', { 
        status: 'success', 
        message: `Started ${startedMatches.length} matches. Players have been sent to their games.`,
        matches: startedMatches
      });
      
    } catch (error) {
      console.error('[Tournament] Error starting tournament matches:', error);
      socket.emit('StartTournamentMatchesResponse', { status: 'error', message: 'Failed to start matches.' });
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