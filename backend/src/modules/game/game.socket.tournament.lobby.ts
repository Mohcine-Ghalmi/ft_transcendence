import { Socket, Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import redis from '../../utils/redis';
import { Tournament, TournamentParticipant } from './game.socket.types';
import { getSocketIds } from '../../socket';
import { getUserByEmail, getFriend } from '../user/user.service';
import CryptoJS from 'crypto-js';

const TOURNAMENT_PREFIX = 'tournament:';
const TOURNAMENT_INVITE_PREFIX = 'tournament_invite:';

export function registerTournamentLobbyHandlers(socket: Socket, io: Server) {
  // List tournaments
  socket.on('ListTournaments', async () => {
    try {
      const keys = await redis.keys(`${TOURNAMENT_PREFIX}*`);
      const tournaments = [];
      for (const key of keys) {
        const data = await redis.get(key);
        if (data) {
          const tournament = JSON.parse(data);
          if (tournament.status === 'lobby') {
            tournaments.push(tournament);
          }
        }
      }
      socket.emit('TournamentList', tournaments);
    } catch (err) {
      console.error('[Tournament] Error listing tournaments:', err);
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

  // Decline tournament invite
  socket.on('DeclineTournamentInvite', async (data: { inviteId: string; inviteeEmail: string }) => {
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
      
      // Notify host that invite was declined
      const hostSocketIds = await getSocketIds(invite.hostEmail, 'sockets') || [];
      io.to(hostSocketIds).emit('TournamentInviteDeclined', {
        inviteId,
        tournamentId: invite.tournamentId,
        inviteeEmail,
        message: 'Tournament invite was declined.'
      });
      
      socket.emit('TournamentInviteResponse', { status: 'success', message: 'Tournament invite declined.' });
      
    } catch (error) {
      console.error('[Tournament Invite] Error declining invite:', error);
      socket.emit('TournamentInviteResponse', { status: 'error', message: 'Failed to decline invite.' });
    }
  });

  // Cancel tournament invite (host only)
  socket.on('CancelTournamentInvite', async (data: { inviteId: string; hostEmail: string }) => {
    try {
      const { inviteId, hostEmail } = data;
      if (!inviteId || !hostEmail) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Missing info.' });
      
      const inviteData = await redis.get(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`);
      if (!inviteData) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Invite not found or expired.' });
      
      const invite = JSON.parse(inviteData);
      if (invite.hostEmail !== hostEmail) return socket.emit('TournamentInviteResponse', { status: 'error', message: 'Only the host can cancel the invite.' });
      
      // Clean up invite
      await Promise.all([
        redis.del(`${TOURNAMENT_INVITE_PREFIX}${inviteId}`),
        redis.del(`${TOURNAMENT_INVITE_PREFIX}${invite.inviteeEmail}`)
      ]);
      
      // Notify invitee that invite was canceled
      const inviteeSocketIds = await getSocketIds(invite.inviteeEmail, 'sockets') || [];
      io.to(inviteeSocketIds).emit('TournamentInviteCanceled', {
        inviteId,
        tournamentId: invite.tournamentId,
        message: 'Tournament invite was canceled by the host.'
      });
      
      socket.emit('TournamentInviteResponse', { status: 'success', message: 'Tournament invite canceled.' });
      
    } catch (error) {
      console.error('[Tournament Invite] Error canceling invite:', error);
      socket.emit('TournamentInviteResponse', { status: 'error', message: 'Failed to cancel invite.' });
    }
  });

  // Leave tournament
  socket.on('LeaveTournament', async (data: { tournamentId: string; playerEmail: string }) => {
    try {
      const { tournamentId, playerEmail } = data;
      if (!tournamentId || !playerEmail) return socket.emit('TournamentLeaveResponse', { status: 'error', message: 'Missing info.' });
      
      // Get tournament data
      const tournamentData = await redis.get(`${TOURNAMENT_PREFIX}${tournamentId}`);
      if (!tournamentData) return socket.emit('TournamentLeaveResponse', { status: 'error', message: 'Tournament not found.' });
      
      const tournament: Tournament = JSON.parse(tournamentData);
      
      // Check if user is a participant
      const participantIndex = tournament.participants.findIndex(p => p.email === playerEmail);
      if (participantIndex === -1) return socket.emit('TournamentLeaveResponse', { status: 'error', message: 'You are not a participant in this tournament.' });
      
      // Check if user is the host
      if (tournament.hostEmail === playerEmail) {
        return socket.emit('TournamentLeaveResponse', { status: 'error', message: 'Host cannot leave. Cancel the tournament instead.' });
      }
      
      // Remove participant from tournament
      const leftPlayer = tournament.participants[participantIndex];
      tournament.participants.splice(participantIndex, 1);
      
      // Update tournament in Redis
      await redis.setex(`${TOURNAMENT_PREFIX}${tournamentId}`, 3600, JSON.stringify(tournament));
      
      // Notify all remaining participants
      const allParticipantEmails = tournament.participants.map(p => p.email);
      const allSocketIds = [];
      
      for (const email of allParticipantEmails) {
        const socketIds = await getSocketIds(email, 'sockets') || [];
        allSocketIds.push(...socketIds);
      }
      
      io.to(allSocketIds).emit('TournamentParticipantLeft', {
        tournamentId,
        tournament,
        leftPlayer,
        message: `${leftPlayer.nickname || leftPlayer.email} left the tournament.`
      });
      
      socket.emit('TournamentLeaveResponse', { status: 'success', message: 'Left tournament successfully.' });
      
    } catch (error) {
      console.error('[Tournament] Error leaving tournament:', error);
      socket.emit('TournamentLeaveResponse', { status: 'error', message: 'Failed to leave tournament.' });
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
      console.error('[Tournament] Error canceling tournament:', error);
      socket.emit('TournamentCancelResponse', { status: 'error', message: 'Failed to cancel tournament.' });
    }
  });
} 