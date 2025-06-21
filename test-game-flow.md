# Game Flow Debug Test

## Steps to test the game flow:

1. **Start the application:**
   - Backend should be running on port 5005
   - Frontend should be running on port 3000
   - Redis should be running on port 7000

2. **Test the game flow:**
   - Open two browser windows/tabs
   - Log in with two different users
   - Go to the Online 1v1 page
   - Send an invitation from one user to another
   - Accept the invitation
   - Both users should be redirected to the game page
   - The host should see a "Start Game" button
   - Click "Start Game"
   - Both users should see the PingPongGame component

## Debug information to check:

### Frontend Console:
- Check for "Game page mounted" logs
- Check for "GameInviteAccepted received" logs
- Check for "GameStarted received" logs
- Check for "GameStartResponse received" logs

### Backend Console:
- Check for "Socket connected" logs
- Check for "StartGame event received" logs
- Check for "Game room data retrieved" logs
- Check for "Emitting GameStarted to both players" logs

### Common issues:
1. **Socket not connected:** Check if the frontend can connect to the backend
2. **Game room not found:** Check if the game invitation was properly created
3. **Socket IDs not found:** Check if users are properly authenticated
4. **Event not received:** Check if the event listeners are properly set up

## Expected flow:
1. User A invites User B
2. User B accepts invitation
3. Both users navigate to `/play/game/{gameId}`
4. Game page shows waiting room
5. Host clicks "Start Game"
6. Backend emits "GameStarted" event
7. Both users receive "GameStarted" event
8. Game page transitions to PingPongGame component 