// modules/game/game.socket.ts
import { Socket, Server } from 'socket.io'
import { handleGameInvitation } from './game.socket.invitation'
import { handleGameAcceptance } from './game.socket.acceptance'
import { handleGameplay } from './game.socket.gameplay'
import { handleGameManagement } from './game.socket.management'
import { handleGameDisconnect } from './game.socket.disconnect'
import { handleMatchmaking } from './game.socket.matchmaking'
import { handleTournament } from './game.socket.tournament'
import { registerTournamentLobbyHandlers } from './game.socket.tournament.lobby'
import { registerTournamentMatchHandlers } from './game.socket.tournament.match'

export function handleGameSocket(socket: Socket, io: Server) {
  // Register all game socket handlers
  handleGameInvitation(socket, io)
  handleGameAcceptance(socket, io)
  handleGameplay(socket, io)
  handleGameManagement(socket, io)
  handleGameDisconnect(socket, io)
  handleMatchmaking(socket, io)
  handleTournament(socket, io)
  registerTournamentLobbyHandlers(socket, io)
  registerTournamentMatchHandlers(socket, io)
}