import { Socket, Server } from 'socket.io';
import redis from '../../utils/redis';
import { Tournament, TournamentParticipant, TournamentMatch, GameSocketHandler, GameRoomData, getPlayerData, gameRooms } from './game.socket.types';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import { getSocketIds } from '../../socket';
import { getUserByEmail, getFriend } from '../user/user.service';

// Key prefix for tournaments in Redis
const TOURNAMENT_PREFIX = 'tournament:';
const TOURNAMENT_INVITE_PREFIX = 'tournament_invite:';

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
    } else if (!player1 && !player2) {
      // Both players are undefined, this is an empty match
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
      const tournamentId = uuidv4();
      
      // Create initial participant
      const initialParticipant: TournamentParticipant = {
        email: data.hostEmail,
        nickname: data.hostNickname,
        avatar: data.hostAvatar,
        isHost: true,
        status: 'accepted',
      };
      
      // Create tournament with initial bracket
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
    } catch (err) {
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
      const key = process.env.ENCRYPTION_KEY;
      if (!key) return socket.emit('InviteToTournamentResponse', { status: 'error', message: 'Server config error.' });
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) return socket.emit('InviteToTournamentResponse', { status: 'error', message: 'Invalid invite data.' });
      const { tournamentId, hostEmail, inviteeEmail } = JSON.parse(decrypted);
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
      if (existingInviteId) {
        const existingInviteData = await redis.get(`${TOURNAMENT_INVITE_PREFIX}${existingInviteId}`);
        if (existingInviteData) {
          const existingInvite = JSON.parse(existingInviteData);
          // Check if the existing invite is from the same tournament
          if (existingInvite.tournamentId === tournamentId) {
            return socket.emit('InviteToTournamentResponse', { status: 'error', message: 'Already invited to this tournament.' });
          }
          // Check if existing invite is expired (older than 30 seconds)
          if (Date.now() - existingInvite.createdAt > 30000) {
            // Clean up expired invite
            await Promise.all([
              redis.del(`${TOURNAMENT_INVITE_PREFIX}${existingInviteId}`),
              redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteeEmail}`)
            ]);
          } else {
            return socket.emit('InviteToTournamentResponse', { status: 'error', message: 'Already has a pending invite.' });
          }
        } else {
          // Clean up stale invite reference
          await redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteeEmail}`);
        }
      }
      
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
      
      // Regenerate tournament bracket with new participant
      tournament.matches = createTournamentBracket(tournament.participants, tournament.size);
      
      // Update tournament in Redis
      await redis.setex(`${TOURNAMENT_PREFIX}${invite.tournamentId}`, 3600, JSON.stringify(tournament));
      
      // Get all socket IDs for all participants (including the new one)
      const allParticipantEmails = tournament.participants.map(p => p.email);
      const allSocketIds = [];
      
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        allSocketIds.push(...socketIds);
      }
      
      // Emit to ALL participants (including host and new participant)
      io.to(allSocketIds).emit('TournamentInviteAccepted', { 
        inviteId, 
        inviteeEmail,
        tournamentId: invite.tournamentId,
        newParticipant,
        tournament
      });
      
      // Check if tournament is ready to start
      if (tournament.participants.length === tournament.size) {
        // Tournament is full, notify all participants
        io.to(allSocketIds).emit('TournamentUpdated', {
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
  // START TOURNAMENT EVENT HANDLER
  socket.on('StartTournament', async (data: { tournamentId: string; hostEmail: string }) => {
    try {
      const { tournamentId, hostEmail } = data;
      
      if (!tournamentId || !hostEmail) {
        console.error('Missing required data:', { tournamentId, hostEmail });
        return socket.emit('TournamentStartResponse', { status: 'error', message: 'Missing info.' });
      }
      
      // Get tournament data
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) {
        console.error('Tournament not found in Redis:', tournamentId);
        return socket.emit('TournamentStartResponse', { status: 'error', message: 'Tournament not found.' });
      }
      
      const tournament: Tournament = JSON.parse(tournamentData);
      
      // Check if user is the host
      if (tournament.hostEmail !== hostEmail) {
        console.error('Host email mismatch:', {
          tournamentHost: tournament.hostEmail,
          requestingHost: hostEmail
        });
        return socket.emit('TournamentStartResponse', { status: 'error', message: 'Only the host can start the tournament.' });
      }
      
      // Check if tournament is in lobby state
      if (tournament.status !== 'lobby') {
        console.error('Tournament not in lobby state:', tournament.status);
        return socket.emit('TournamentStartResponse', { status: 'error', message: 'Tournament is not in lobby state.' });
      }
      
      // Check if tournament is full
      if (tournament.participants.length !== tournament.size) {
        console.error('Tournament not full:', {
          current: tournament.participants.length,
          required: tournament.size
        });
        return socket.emit('TournamentStartResponse', { status: 'error', message: `Tournament needs ${tournament.size} players to start.` });
      }
      

      
      // Create tournament bracket with matches in WAITING state (don't start games yet)
      const matches = createTournamentBracket(tournament.participants, tournament.size);
      
      // Set all matches to waiting state initially
      const bracketMatches = matches.map(match => ({
        ...match,
        state: 'waiting' as const,
        gameRoomId: undefined,
        winner: undefined
      }));
      
      // Update tournament status to in_progress but keep matches in waiting state
      tournament.status = 'in_progress';
      tournament.matches = bracketMatches;
      tournament.currentRound = 0;
      tournament.startedAt = Date.now();
      
      // Update tournament in Redis
      await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
      
      // Send tournament started event to all participants using socket rooms
      const tournamentRoom = `tournament:${tournamentId}`;
      
      const eventData = {
        tournamentId,
        tournament,
        message: 'Tournament started! View the bracket and wait for the host to start rounds.'
      };
      
      // Primary method: Socket room broadcast
      io.to(tournamentRoom).emit('TournamentStarted', eventData);
      
      // Fallback method: Direct socket ID broadcast
      const allParticipantEmails = tournament.participants.map(p => p.email);
      
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        
        for (const socketId of socketIds) {
          io.to(socketId).emit('TournamentStarted', eventData);
        }
      }
      

      socket.emit('TournamentStartResponse', { status: 'success', message: 'Tournament started successfully.' });
      

      
    } catch (error) {
      console.error('Error in StartTournament:', error);
      socket.emit('TournamentStartResponse', { status: 'error', message: 'Failed to start tournament.' });
    }
  });

  // NOTE: Removed StartNextRoundMatches handler - use StartCurrentRound instead
  // The StartCurrentRound handler properly creates game rooms and sends GameFound events

  // START CURRENT ROUND - Host starts matches in current round
  socket.on('StartCurrentRound', async (data: { tournamentId: string; hostEmail: string; round: number }) => {
    console.log('[TOURNAMENT] StartCurrentRound received:', data);
    
    try {
      const { tournamentId, hostEmail, round } = data;
      
      if (!tournamentId || !hostEmail || round === undefined) {
        console.error('Missing required data for StartCurrentRound:', { tournamentId, hostEmail, round });
        return socket.emit('StartCurrentRoundResponse', { status: 'error', message: 'Missing required data.' });
      }
      
      // Get tournament data
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) {
        console.error('Tournament not found:', tournamentId);
        return socket.emit('StartCurrentRoundResponse', { status: 'error', message: 'Tournament not found.' });
      }
      
      const tournament: Tournament = JSON.parse(tournamentData);
      console.log('[TOURNAMENT] Tournament found:', { tournamentId, status: tournament.status, participants: tournament.participants.length });
      
      // Check if user is the host
      if (tournament.hostEmail !== hostEmail) {
        console.error('Only host can start rounds:', {
          tournamentHost: tournament.hostEmail,
          requestingHost: hostEmail
        });
        return socket.emit('StartCurrentRoundResponse', { status: 'error', message: 'Only the host can start rounds.' });
      }
      
      // Get current round matches that are waiting
      const currentRoundMatches = tournament.matches.filter(match => 
        match.round === round && match.state === 'waiting' && match.player1 && match.player2
      );
      
      console.log('[TOURNAMENT] Current round matches found:', { round, matches: currentRoundMatches.length });
      
      if (currentRoundMatches.length === 0) {
        console.error('No matches ready to start in round:', round);
        return socket.emit('StartCurrentRoundResponse', { status: 'error', message: 'No matches ready to start in this round.' });
      }
      

      // Create game rooms for each match and redirect players
      const updatedMatches: TournamentMatch[] = [];
      
      console.log('[TOURNAMENT] Starting to create game rooms for matches:', currentRoundMatches.map(m => ({ id: m.id, player1: m.player1?.email, player2: m.player2?.email })));
      
      for (const match of currentRoundMatches) {
        if (!match.player1 || !match.player2) {
          console.error('Match missing players:', match.id);
          continue;
        }
        
        console.log(`[TOURNAMENT] Creating game room for match ${match.id}: ${match.player1.email} vs ${match.player2.email}`);
        
        // Create game room ID
        const gameRoomId = uuidv4();
        
        // Create game room data using matchmaking logic
        const gameRoom: GameRoomData = {
          gameId: gameRoomId,
          hostEmail: match.player1.email,
          guestEmail: match.player2.email,
          status: 'in_progress', // Start immediately like matchmaking
          createdAt: Date.now(),
          startedAt: Date.now(), // Set start time immediately
          tournamentId: tournamentId,
          matchId: match.id
        };
        
        // Save game room to both Redis and in-memory Map for authorization
        await redis.setex(`gameRoom:${gameRoomId}`, 3600, JSON.stringify(gameRoom));
        gameRooms.set(gameRoomId, gameRoom);
        console.log(`[TOURNAMENT] Game room created and stored: ${gameRoomId}`);
        
        // Initialize game state immediately (like matchmaking)
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
        
        // Import activeGames from game socket types
        const { activeGames } = require('./game.socket.types');
        activeGames.set(gameRoomId, gameState);
        console.log(`[TOURNAMENT] Game state initialized: ${gameRoomId}`);
        
        // Update match state
        const updatedMatch: TournamentMatch = {
          ...match,
          state: 'in_progress',
          gameRoomId: gameRoomId
        };
        
        updatedMatches.push(updatedMatch);
        // Get socket IDs for both players
        const player1Sockets = await getSocketIds(match.player1.email, 'sockets') || [];
        const player2Sockets = await getSocketIds(match.player2.email, 'sockets') || [];
        
        console.log(`[TOURNAMENT] Socket IDs found - Player1 (${match.player1.email}):`, player1Sockets);
        console.log(`[TOURNAMENT] Socket IDs found - Player2 (${match.player2.email}):`, player2Sockets);
        
        // Get player data first        
        const [player1User, player2User] = await Promise.all([
          getUserByEmail(match.player1!.email),
          getUserByEmail(match.player2!.email)
        ]);
        
        const player1Data = getPlayerData(player1User);
        const player2Data = getPlayerData(player2User);

        // Send MatchFound event to both players (same as matchmaking)
        const allSockets = [...player1Sockets, ...player2Sockets];
        console.log(`[TOURNAMENT] Emitting MatchFound to ${allSockets.length} sockets:`, allSockets);
        
        allSockets.forEach(socketId => {
          const isPlayer1 = player1Sockets.includes(socketId);
          
          io.to(socketId).emit('MatchFound', {
            gameId: gameRoomId,
            hostEmail: match.player1!.email,
            guestEmail: match.player2!.email,
            hostData: player1Data,
            guestData: player2Data,
            status: 'match_found',
            message: 'Tournament match found! Game will start immediately.',
            isTournament: true,
            tournamentId: tournamentId,
            matchId: match.id
          });
        });
        
        // Send GameStarting event immediately to redirect players to game        
        if (match.player1 && match.player2) {
          console.log(`[TOURNAMENT] Auto-starting match ${match.id} in tournament ${tournamentId} - Player1: ${match.player1.email}, Player2: ${match.player2.email}`);
          
          // Emit GameStarting to redirect players to game page (like matchmaking)
          allSockets.forEach(socketId => {
            io.to(socketId).emit('GameStarting', {
              gameId: gameRoomId,
              hostEmail: match.player1!.email,
              guestEmail: match.player2!.email,
              hostData: player1Data,
              guestData: player2Data,
              startedAt: gameRoom.startedAt,
              isTournament: true,
              tournamentId: tournamentId,
              matchId: match.id
            });
          });

          console.log(`[TOURNAMENT] Emitting GameStarting for match ${match.id} to sockets:`, allSockets);

          // Also emit GameStarted immediately for tournament matches to ensure the game fully starts
          setTimeout(() => {
            allSockets.forEach(socketId => {
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
                matchId: match.id
              });
            });
            console.log(`[TOURNAMENT] Emitting GameStarted for match ${match.id} to sockets:`, allSockets);
          }, 100); // Small delay to ensure GameStarting is processed first
        }
      }
      
      // Update tournament with new match states
      tournament.matches = tournament.matches.map(match => {
        const updatedMatch = updatedMatches.find(um => um.id === match.id);
        return updatedMatch || match;
      });
      
      console.log(`[TOURNAMENT] Tournament updated with ${updatedMatches.length} new matches in progress`);
      
      // Save updated tournament
      await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
      
      // Notify all tournament participants about round start
      const tournamentRoom = `tournament:${tournamentId}`;
      console.log(`[TOURNAMENT] Emitting TournamentRoundStarted to room: ${tournamentRoom}`);
      io.to(tournamentRoom).emit('TournamentRoundStarted', {
        tournamentId: tournamentId,
        round: round,
        matches: updatedMatches,
        tournament: tournament,
        message: `Round ${round + 1} has started! Players are being redirected to their matches.`
      });
      
      // Send success response to host
      socket.emit('StartCurrentRoundResponse', { 
        status: 'success', 
        message: `Round ${round + 1} started successfully. ${updatedMatches.length} matches in progress.` 
      });
      
      console.log(`[TOURNAMENT] StartCurrentRound completed successfully for round ${round + 1} with ${updatedMatches.length} matches`);
    } catch (error) {
      console.error('Error in StartCurrentRound:', error);
      socket.emit('StartCurrentRoundResponse', { status: 'error', message: 'Failed to start round.' });
    }
  });

  // Join tournament (for participants to join the tournament lobby)
  socket.on('JoinTournament', async (data: { tournamentId: string; playerEmail: string }) => {

    
    try {
      const { tournamentId, playerEmail } = data;
      
      if (!tournamentId || !playerEmail) {
        console.error('Missing join data:', { tournamentId, playerEmail });
        return socket.emit('TournamentJoinResponse', { status: 'error', message: 'Missing info.' });
      }
      

      
      // Get tournament data
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) {
        console.error('Tournament not found for join:', tournamentId);
        return socket.emit('TournamentJoinResponse', { status: 'error', message: 'Tournament not found.' });
      }
      
      const tournament: Tournament = JSON.parse(tournamentData);

      
      // Check if player is a participant
      const participant = tournament.participants.find(p => p.email === playerEmail);
      if (!participant) {
        console.error('Player not in participant list:', {
          playerEmail,
          participants: tournament.participants.map(p => p.email)
        });
        return socket.emit('TournamentJoinResponse', { status: 'error', message: 'You are not a participant in this tournament.' });
      }
      

      
      // Check if tournament is in a valid state
      if (tournament.status === 'completed' || tournament.status === 'canceled') {
        console.error('Tournament in invalid state:', tournament.status);
        return socket.emit('TournamentJoinResponse', { status: 'error', message: 'Tournament is no longer active.' });
      }


      
      // Join the socket to the tournament room for real-time updates
      const tournamentRoom = `tournament:${tournamentId}`;
      socket.join(tournamentRoom);



      
      // Send tournament data to the joining player
      socket.emit('TournamentJoinResponse', { 
        status: 'success', 
        tournament,
        currentMatch: tournament.status === 'in_progress' ? 
          tournament.matches.find(m => 
            (m.player1?.email === playerEmail || m.player2?.email === playerEmail) && 
            m.state === 'waiting'
          ) : null
      });


      
      // Notify all OTHER participants in the tournament room that this player joined
      socket.to(tournamentRoom).emit('TournamentPlayerJoined', {
        tournamentId,
        tournament,
        joinedPlayer: participant,
        message: `${participant.nickname} joined the tournament room!`
      });
      

      
    } catch (error) {
      console.error('Error in JoinTournament:', error);
      socket.emit('TournamentJoinResponse', { status: 'error', message: 'Failed to join tournament.' });
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
};

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

// Helper function to get tournament host email
export async function getTournamentHostEmail(tournamentId: string): Promise<string | null> {
  try {
    const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
    if (tournamentData) {
      const tournament = JSON.parse(tournamentData);
      return tournament.hostEmail || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting tournament host email:', error);
    return null;
  }
}

// Tournament heartbeat to keep players connected
