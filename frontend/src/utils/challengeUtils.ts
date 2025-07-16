import { useRouter } from 'next/navigation';
import CryptoJS from 'crypto-js';

export interface ChallengePlayer {
  email: string;
  name?: string;
  username?: string;
  login?: string;
  avatar?: string;
}

export const challengePlayer = async (
  player: ChallengePlayer,
  socket: any,
  user: any,
  router: any,
) => {
  if (!socket || !user?.email || !player?.email) {
    return false;
  }

  try {
    const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('Encryption key not found');
    }

    let gameId: string | null = null;
    let cleanup: (() => void) | null = null;

    const handleInviteResponse = (data: any) => {
      if (data.status === 'success' && data.type === 'invite_sent') {
        gameId = data.gameId;
      } else if (data.status === 'error') {
        cleanup?.();
      }
    };

    const handleGameInviteAccepted = (data: any) => {
      if (data.status === 'ready_to_start' && data.gameId === gameId) {
        // Store game state for OneVsOne page
        const gameState = {
          gameId: data.gameId,
          gameState: 'waiting_to_start',
          gameAccepted: true,
          isHost: true,
          invitedPlayer: {
            ...data.guestData,
            name: data.guestData.username || data.guestData.login,
            login: data.guestData.login,
            avatar: data.guestData.avatar || '/avatar/Default.svg',
            GameStatus: 'Available'
          }
        };
        
        sessionStorage.setItem('externalGameState', JSON.stringify(gameState));
        
        cleanup?.();
        router.push('/play/OneVsOne?mode=Online');
      }
    };
    const handleGameInviteDeclined = (data: any) => {
      if (data.gameId === gameId) {
        cleanup?.();
      }
    };
    const handleGameInviteTimeout = (data: any) => {
      if (data.gameId === gameId) {
        cleanup?.();
      }
    };
    socket.on('InviteToGameResponse', handleInviteResponse);
    socket.on('GameInviteAccepted', handleGameInviteAccepted);
    socket.on('GameInviteDeclined', handleGameInviteDeclined);
    socket.on('GameInviteTimeout', handleGameInviteTimeout);
    cleanup = () => {
      socket.off('InviteToGameResponse', handleInviteResponse);
      socket.off('GameInviteAccepted', handleGameInviteAccepted);
      socket.off('GameInviteDeclined', handleGameInviteDeclined);
      socket.off('GameInviteTimeout', handleGameInviteTimeout);
    };

    const inviteData = {
      myEmail: user.email,
      hisEmail: player.email
    };
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(inviteData), encryptionKey).toString();
    socket.emit('InviteToGame', encrypted);
    
    return true;
  } catch (error) {
    console.error('Failed to send challenge:', error);
    return false;
  }
};
