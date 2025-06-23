// modules/game/game.socket.ts
import { Socket, Server } from 'socket.io'
import { handleGameInvitation } from './game.socket.invitation'
import { handleGameAcceptance } from './game.socket.acceptance'
import { handleGameplay } from './game.socket.gameplay'
import { handleGameManagement } from './game.socket.management'
import { handleGameDisconnect } from './game.socket.disconnect'

export function handleGameSocket(socket: Socket, io: Server) {
  // Register all game socket handlers
  handleGameInvitation(socket, io)
  handleGameAcceptance(socket, io)
  handleGameplay(socket, io)
  handleGameManagement(socket, io)
  handleGameDisconnect(socket, io)
}