import type { Server, Socket } from 'socket.io'

export function setupUserSocket(socket: Socket, io: Server) {
  io.on('searchingForUsers', (data) => {
    socket.emit('searchResults', data)
  })
}
