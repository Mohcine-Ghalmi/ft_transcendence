"use client";
import { useAuthStore } from "@/(zustand)/useAuthStore";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const GAME_RATIO = 16 / 9;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const PADDLE_SPEED = 8;
const BALL_SIZE = 15;
const BALL_SPEED = 6;

const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 640;

interface PingPongGameProps {
  player1: any;
  player2: any;
  onExit: (winner?: any) => void;
  isTournamentMode?: boolean;
  // Remote game props
  gameId?: string;
  socket?: any;
  isHost?: boolean;
  opponent?: any;
}

export const PingPongGame: React.FC<PingPongGameProps> = ({ 
  player1, 
  player2, 
  onExit, 
  isTournamentMode = false,
  gameId,
  socket,
  isHost = false,
  opponent
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameReady, setGameReady] = useState(false);
  const [mobile, setMobile] = useState(isMobile());
  const [gameTime, setGameTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const gameStartTime = useRef<number | null>(null);
  const [canvasDims, setCanvasDims] = useState<{ width: number; height: number }>({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  });
  const {user} = useAuthStore();

  // Remote game state
  const [isRemoteGame, setIsRemoteGame] = useState(false);
  const [remoteGameState, setRemoteGameState] = useState<any>(null);
  const [isPlayer1, setIsPlayer1] = useState(true);
  const [isGameHost, setIsGameHost] = useState(false);
  const updateTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const animationRef = useRef<number | null>(null);
  const router = useRouter();

  // Mobile paddle state
  const [paddle1Move, setPaddle1Move] = useState<'' | 'up' | 'down'>('');
  const [paddle2Move, setPaddle2Move] = useState<'' | 'up' | 'down'>('');

  // Determine if this is a remote game
  useEffect(() => {
    setIsRemoteGame(!!gameId && !!socket);
    if (gameId && socket) {
      setIsPlayer1(isHost);
      setIsGameHost(isHost);
    }
  }, [gameId, socket, isHost]);

  // Listen for game start event from server
  useEffect(() => {
    if (!isRemoteGame || !socket) return;

    const handleGameStarted = (data: any) => {
      if (data.gameId === gameId) {
        setGameStarted(true);
        setPaused(false);
        gameStartTime.current = Date.now();
        
        // Initialize game state from server if available
        if (data.gameState) {
          ball.current.x = data.gameState.ballX;
          ball.current.y = data.gameState.ballY;
          ball.current.dx = data.gameState.ballDx;
          ball.current.dy = data.gameState.ballDy;
          paddle1Y.current = data.gameState.paddle1Y;
          paddle2Y.current = data.gameState.paddle2Y;
          currentScores.current = data.gameState.scores;
          setScores(data.gameState.scores);
        } else {
          // Initialize with default values
          ball.current.x = GAME_WIDTH / 2 - BALL_SIZE / 2;
          ball.current.y = GAME_HEIGHT / 2 - BALL_SIZE / 2;
          ball.current.dx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
          ball.current.dy = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
          paddle1Y.current = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
          paddle2Y.current = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
          currentScores.current = { p1: 0, p2: 0 };
          setScores({ p1: 0, p2: 0 });
        }
        
        // Add 1-second delay before game is ready to play
        setTimeout(() => {
          setGameReady(true);
        }, 0);
      }
    };

    socket.on('GameStarted', handleGameStarted);

    return () => {
      socket.off('GameStarted', handleGameStarted);
    };
  }, [isRemoteGame, socket, gameId, isPlayer1, isGameHost]);

  // Auto-start for remote games after 2 seconds to prevent performance issues
  useEffect(() => {
    if (isRemoteGame && socket && gameId && !gameStarted) {
      const autoStartTimer = setTimeout(() => {
        if (!gameStarted && socket && gameId) {
          socket.emit('StartGame', { gameId });
        }
      }, 1000); // 2 second delay

      return () => clearTimeout(autoStartTimer);
    }
  }, [isRemoteGame, socket, gameId, gameStarted]);

  // Validate players have required properties
  const safePlayer1 = {
    id: user?.id || crypto.randomUUID(),
    name: user?.username,
    avatar: user?.avatar || '/avatar/Default.svg',
    nickname: user?.login || 'Player 1'
  };

  const safePlayer2 = isRemoteGame ? {
    id: opponent?.id || crypto.randomUUID(),
    name: opponent?.username || opponent?.name,
    avatar: opponent?.avatar || '/avatar/Default.svg',
    nickname: opponent?.login || opponent?.nickname || 'Player 2'
  } : {
    id: player2?.id || crypto.randomUUID(),
    name: player2?.username || player2?.name,
    avatar: player2?.avatar || '/avatar/Default.svg',
    nickname: player2?.login || player2?.nickname || 'Player 2'
  };

  // Paddle positions: player1 left, player2 right
  const paddle1Y = useRef<number>(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const paddle2Y = useRef<number>(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const ball = useRef({
    x: GAME_WIDTH / 2 - BALL_SIZE / 2,
    y: GAME_HEIGHT / 2 - BALL_SIZE / 2,
    dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    dy: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
  });
  const keys = useRef<{ [key: string]: boolean }>({});
  const currentScores = useRef({ p1: 0, p2: 0 });

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameStarted && !paused && gameStartTime.current) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameStartTime.current!) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        setGameTime({ hours, minutes, seconds });
      }, 1000); // Update every second
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, paused]);

  // Mobile detection
  useEffect(() => {
    setMobile(isMobile());
  }, []);

  // Canvas resize handler
  useEffect(() => {
    const handleResize = () => {
      const container = canvasRef.current?.parentElement;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Calculate canvas dimensions maintaining aspect ratio
      let width = containerWidth;
      let height = containerWidth / GAME_RATIO;
      
      if (height > containerHeight) {
        height = containerHeight;
        width = containerHeight * GAME_RATIO;
      }
      
      setCanvasDims({ width, height });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update canvas size when dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvasDims.width;
      canvas.height = canvasDims.height;
    }
  }, [canvasDims]);

  // Keyboard event handlers
  useEffect(() => {
    const downHandler = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
    };

    const upHandler = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, []);

  // Canvas setup and game loop
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvasDims.width;
    canvas.height = canvasDims.height;

    // Calculate scale factors
    const scaleX = canvasDims.width / GAME_WIDTH;
    const scaleY = canvasDims.height / GAME_HEIGHT;

    const draw = () => {
      if (!canvasRef.current) return;
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvasDims.width, canvasDims.height);
      
      // Dark gradient background
      const grad = ctx.createLinearGradient(0, 0, canvasDims.width, canvasDims.height);
      grad.addColorStop(0, "#23272f");
      grad.addColorStop(1, "#15181e");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasDims.width, canvasDims.height);

      // Mid lines (cross style)
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 2;
      // Vertical
      ctx.beginPath();
      ctx.moveTo(canvasDims.width / 2, 0);
      ctx.lineTo(canvasDims.width / 2, canvasDims.height);
      ctx.stroke();
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(0, canvasDims.height / 2);
      ctx.lineTo(canvasDims.width, canvasDims.height / 2);
      ctx.stroke();

      // Paddles
      ctx.fillStyle = "#fafbff";
      ctx.shadowColor = "#20242a";
      ctx.shadowBlur = 7;
      ctx.fillRect(
        10, 
        paddle1Y.current * scaleY, 
        PADDLE_WIDTH * scaleX, 
        PADDLE_HEIGHT * scaleY
      );
      ctx.fillRect(
        canvasDims.width - PADDLE_WIDTH * scaleX - 10, 
        paddle2Y.current * scaleY, 
        PADDLE_WIDTH * scaleX, 
        PADDLE_HEIGHT * scaleY
      );
      ctx.shadowBlur = 0;

      // Ball
      ctx.beginPath();
      ctx.arc(
        ball.current.x * scaleX + (BALL_SIZE * scaleX) / 2,
        ball.current.y * scaleY + (BALL_SIZE * scaleY) / 2,
        (BALL_SIZE * scaleX) / 2,
        0, Math.PI * 2
      );
      ctx.fillStyle = "#f7f7fa";
      ctx.shadowColor = "#fff";
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const update = () => {
      // Move paddles - only for local player in remote game
      if (isRemoteGame) {
        // Only control your own paddle
        if (isPlayer1) {
          // Player 1 (Host) controls left paddle (paddle1)
          if (!mobile) {
            if (keys.current["w"] && paddle1Y.current > 0) {
              paddle1Y.current -= PADDLE_SPEED;
            }
            if (keys.current["s"] && paddle1Y.current < GAME_HEIGHT - PADDLE_HEIGHT) {
              paddle1Y.current += PADDLE_SPEED;
            }
          } else {
            // Mobile controls for Player 1
            if (paddle1Move === "up" && paddle1Y.current > 0) {
              paddle1Y.current -= PADDLE_SPEED;
            }
            if (paddle1Move === "down" && paddle1Y.current < GAME_HEIGHT - PADDLE_HEIGHT) {
              paddle1Y.current += PADDLE_SPEED;
            }
          }
        } else {
          // Player 2 (Guest) controls right paddle (paddle2)
          if (!mobile) {
            if (keys.current["arrowup"] && paddle2Y.current > 0) paddle2Y.current -= PADDLE_SPEED;
            if (keys.current["arrowdown"] && paddle2Y.current < GAME_HEIGHT - PADDLE_HEIGHT) paddle2Y.current += PADDLE_SPEED;
          } else {
            // Mobile controls for Player 2
            if (paddle2Move === "up" && paddle2Y.current > 0) paddle2Y.current -= PADDLE_SPEED;
            if (paddle2Move === "down" && paddle2Y.current < GAME_HEIGHT - PADDLE_HEIGHT) paddle2Y.current += PADDLE_SPEED;
          }
        }
        
        // Only host controls ball movement
        if (isGameHost) {
          // Ball movement
          ball.current.x += ball.current.dx;
          ball.current.y += ball.current.dy;

          // Wall collision
          if (ball.current.y <= 0 || ball.current.y + BALL_SIZE >= GAME_HEIGHT) {
            ball.current.dy *= -1;
          }
          
          // Left paddle collision
          if (
            ball.current.x <= PADDLE_WIDTH &&
            ball.current.x + ball.current.dx >= 0 &&
            ball.current.y + BALL_SIZE >= paddle1Y.current &&
            ball.current.y <= paddle1Y.current + PADDLE_HEIGHT
          ) {
            ball.current.x = PADDLE_WIDTH; // Prevent ball from going through paddle
            ball.current.dx = Math.abs(ball.current.dx);
            // Increase speed after each paddle hit (minimal increase for better performance)
            ball.current.dx *= 1.01;
            ball.current.dy *= 1.01;
          }
          
          // Right paddle collision
          if (
            ball.current.x + BALL_SIZE >= GAME_WIDTH - PADDLE_WIDTH &&
            ball.current.x + BALL_SIZE + ball.current.dx <= GAME_WIDTH &&
            ball.current.y + BALL_SIZE >= paddle2Y.current &&
            ball.current.y <= paddle2Y.current + PADDLE_HEIGHT
          ) {
            ball.current.x = GAME_WIDTH - PADDLE_WIDTH - BALL_SIZE; // Prevent ball from going through paddle
            ball.current.dx = -Math.abs(ball.current.dx);
            // Increase speed after each paddle hit (minimal increase for better performance)
            ball.current.dx *= 1.01;
            ball.current.dy *= 1.01;
          }
          
          // Scoring
          if (ball.current.x < -BALL_SIZE) {
            currentScores.current = { p1: currentScores.current.p1, p2: currentScores.current.p2 + 1 };
            setScores(currentScores.current);
            resetBall(-1);
            // Send immediate game state update when goal is scored
            if (isRemoteGame && isGameHost && socket && gameId) {
              const gameState = {
                gameId,
                ballX: ball.current.x,
                ballY: ball.current.y,
                ballDx: ball.current.dx,
                ballDy: ball.current.dy,
                paddle1Y: paddle1Y.current,
                paddle2Y: paddle2Y.current,
                scores: currentScores.current,
                gameStatus: 'playing',
                lastUpdate: Date.now()
              };
              socket.emit('GameStateUpdate', { gameId, gameState });
            }
          } else if (ball.current.x > GAME_WIDTH + BALL_SIZE) {
            currentScores.current = { p1: currentScores.current.p1 + 1, p2: currentScores.current.p2 };
            setScores(currentScores.current);
            resetBall(1);
            // Send immediate game state update when goal is scored
            if (isRemoteGame && isGameHost && socket && gameId) {
              const gameState = {
                gameId,
                ballX: ball.current.x,
                ballY: ball.current.y,
                ballDx: ball.current.dx,
                ballDy: ball.current.dy,
                paddle1Y: paddle1Y.current,
                paddle2Y: paddle2Y.current,
                scores: currentScores.current,
                gameStatus: 'playing',
                lastUpdate: Date.now()
              };
              socket.emit('GameStateUpdate', { gameId, gameState });
            }
          }
        }
      } else {
        // Local game - both players can control
        if (!mobile) {
          if (keys.current["w"] && paddle1Y.current > 0) paddle1Y.current -= PADDLE_SPEED;
          if (keys.current["s"] && paddle1Y.current < GAME_HEIGHT - PADDLE_HEIGHT) paddle1Y.current += PADDLE_SPEED;
          if ((keys.current["arrowup"] || keys.current["↑"]) && paddle2Y.current > 0) paddle2Y.current -= PADDLE_SPEED;
          if ((keys.current["arrowdown"] || keys.current["↓"]) && paddle2Y.current < GAME_HEIGHT - PADDLE_HEIGHT) paddle2Y.current += PADDLE_SPEED;
        } else {
          // Touch/mobile, button-based control
          if (paddle1Move === "up" && paddle1Y.current > 0) paddle1Y.current -= PADDLE_SPEED;
          if (paddle1Move === "down" && paddle1Y.current < GAME_HEIGHT - PADDLE_HEIGHT) paddle1Y.current += PADDLE_SPEED;
          if (paddle2Move === "up" && paddle2Y.current > 0) paddle2Y.current -= PADDLE_SPEED;
          if (paddle2Move === "down" && paddle2Y.current < GAME_HEIGHT - PADDLE_HEIGHT) paddle2Y.current += PADDLE_SPEED;
        }

        // Ball movement for local game
        ball.current.x += ball.current.dx;
        ball.current.y += ball.current.dy;

        // Wall collision
        if (ball.current.y <= 0 || ball.current.y + BALL_SIZE >= GAME_HEIGHT) {
          ball.current.dy *= -1;
        }
        // Left paddle collision
        if (
          ball.current.x <= PADDLE_WIDTH &&
          ball.current.y + BALL_SIZE >= paddle1Y.current &&
          ball.current.y <= paddle1Y.current + PADDLE_HEIGHT
        ) {
          ball.current.dx = Math.abs(ball.current.dx);
          // Increase speed after each paddle hit (minimal increase for better performance)
          ball.current.dx *= 1.01;
          ball.current.dy *= 1.01;
        }
        // Right paddle collision
        if (
          ball.current.x + BALL_SIZE >= GAME_WIDTH - PADDLE_WIDTH &&
          ball.current.y + BALL_SIZE >= paddle2Y.current &&
          ball.current.y <= paddle2Y.current + PADDLE_HEIGHT
        ) {
          ball.current.dx = -Math.abs(ball.current.dx);
          // Increase speed after each paddle hit (minimal increase for better performance)
          ball.current.dx *= 1.01;
          ball.current.dy *= 1.01;
        }
        
        // Scoring
        if (ball.current.x < -BALL_SIZE) {
          currentScores.current = { p1: currentScores.current.p1, p2: currentScores.current.p2 + 1 };
          setScores(currentScores.current);
          resetBall(-1);
        } else if (ball.current.x > GAME_WIDTH + BALL_SIZE) {
          currentScores.current = { p1: currentScores.current.p1 + 1, p2: currentScores.current.p2 };
          setScores(currentScores.current);
          resetBall(1);
        }
      }

      // Send game state update for remote game - only host sends updates
      if (isRemoteGame && isGameHost && socket && gameId) {
        const currentTime = Date.now();
        // Increase update frequency to 60fps (16ms) for smoother remote gameplay
        if (currentTime - lastUpdateTime.current >= 16) {
          const gameState = {
            gameId,
            ballX: ball.current.x,
            ballY: ball.current.y,
            ballDx: ball.current.dx,
            ballDy: ball.current.dy,
            paddle1Y: paddle1Y.current,
            paddle2Y: paddle2Y.current,
            scores: currentScores.current,
            gameStatus: 'playing',
            lastUpdate: currentTime
          };
          
          socket.emit('GameStateUpdate', { gameId, gameState });
          lastUpdateTime.current = currentTime;
        }
      }
      
      // Send paddle position updates from guest player to host
      if (isRemoteGame && !isGameHost && socket && gameId) {
        const currentTime = Date.now();
        // Send paddle updates more frequently for responsive controls
        if (currentTime - lastUpdateTime.current >= 16) { // 60fps for paddle updates
          const paddleUpdate = {
            gameId,
            paddleY: isPlayer1 ? paddle1Y.current : paddle2Y.current,
            playerType: isPlayer1 ? 'p1' : 'p2'
          };
          
          socket.emit('PaddleUpdate', paddleUpdate);
          lastUpdateTime.current = currentTime;
        }
      }
    };

    const resetBall = (direction: number) => {
      ball.current.x = GAME_WIDTH / 2 - BALL_SIZE / 2;
      ball.current.y = GAME_HEIGHT / 2 - BALL_SIZE / 2;
      // Give the ball a random Y direction each serve
      const yDirection = (Math.random() > 0.5 ? 1 : -1) * BALL_SPEED;
      ball.current.dx = BALL_SPEED * direction;
      ball.current.dy = yDirection;
    };

    const loop = () => {
      if (!paused && gameReady) update(); // Only update when game is ready
      draw();
      // Use throttled animation frame for better performance
      animationRef.current = requestAnimationFrame(loop);
    };

    if (gameStarted) {
      // Cancel any existing animation frame before starting a new one
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      loop();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [gameStarted, paused, gameReady]); // Add gameReady to dependencies

  // Win condition - Updated for tournament mode with better winner object
  useEffect(() => {
    if (scores.p1 >= 7 || scores.p2 >= 7) {
      setGameStarted(false);
      setPaused(true);
      
      const winner = scores.p1 >= 7 ? safePlayer1 : safePlayer2;
      
      if (isRemoteGame && socket && gameId) {
        // Only the host should emit GameEnd event to prevent duplicates
        if (isGameHost) {
          // Send game end event to server
          const finalScore = { p1: scores.p1, p2: scores.p2 };
          const winnerEmail = scores.p1 >= 7 ? user?.email : opponent?.email;
          const loserEmail = scores.p1 >= 7 ? opponent?.email : user?.email;
          
          socket.emit('GameEnd', {
            gameId,
            winner: winnerEmail,
            loser: loserEmail,
            finalScore,
            reason: 'normal_end'
          });
        }
        
        // Don't navigate immediately - wait for server confirmation
        return;
      }
      
      if (isTournamentMode) {
        // For tournament mode, pass the complete winner object back
        onExit(winner);
      } else {
        const winnerName = winner.name;
        const loserName = scores.p1 >= 7 ? safePlayer2.name : safePlayer1.name;
        
        // Check if current user won (assuming player1 is always the user in 1v1 mode)
        if (scores.p1 >= 7) {
          router.push(`/play/result/win?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
        } else {
          router.push(`/play/result/loss?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
        }
      }
    }
  }, [scores.p1, scores.p2, safePlayer1, safePlayer2, onExit, isTournamentMode, isRemoteGame, socket, gameId, user?.email, opponent?.email, isGameHost]);

  // UI helpers
  const gameOver = scores.p1 >= 7 || scores.p2 >= 7;
  const isGameActive = gameStarted && !paused && !gameOver;

  // Game end handler - defined before socket handlers
  const handleGameEnd = useCallback((winner: any) => {
    if (isRemoteGame && socket && gameId) {
      // Leave the game
      socket.emit('LeaveGame', { gameId, playerEmail: user?.email });
    }
    
    if (isTournamentMode) {
      onExit(winner);
    } else if (isRemoteGame) {
      // For remote games, let the GameEnded event handle navigation
    } else {
      onExit();
    }
  }, [isRemoteGame, socket, gameId, user?.email, isTournamentMode, onExit]);

  // Socket event handlers - moved after player declarations
  const handleGameStateUpdate = useCallback((data: any) => {
    if (data.gameId === gameId && data.gameState) {
      setRemoteGameState(data.gameState);
      
      // Always update ball position and scores from server (host controls ball)
      ball.current.x = data.gameState.ballX;
      ball.current.y = data.gameState.ballY;
      ball.current.dx = data.gameState.ballDx;
      ball.current.dy = data.gameState.ballDy;
      
      // Update scores immediately for both host and guest
      if (data.gameState.scores) {
        currentScores.current = data.gameState.scores;
        setScores(data.gameState.scores);
      }
      
      // Only update opponent's paddle position, not your own
      if (isPlayer1) {
        // Player 1 controls left paddle, so only update right paddle (opponent)
        paddle2Y.current = data.gameState.paddle2Y;
      } else {
        // Player 2 controls right paddle, so only update left paddle (opponent)
        paddle1Y.current = data.gameState.paddle1Y;
      }
      
      if (data.gameState.gameStatus === 'finished' && data.gameState.winner) {
        handleGameEnd(data.gameState.winner);
      }
    }
  }, [gameId, isPlayer1, handleGameEnd]);

  const handlePaddleUpdate = useCallback((data: any) => {
    if (data.gameId === gameId && isGameHost) {
      // Host receives paddle updates from guest player
      if (data.playerType === 'p1') {
        paddle1Y.current = data.paddleY;
      } else if (data.playerType === 'p2') {
        paddle2Y.current = data.paddleY;
      }
    }
  }, [gameId, isGameHost]);

  const handleGameEnded = useCallback((data: any) => {
    if (data.gameId === gameId) {
      console.log('Game ended:', data);
      
      // Set game state to ended
      setGameStarted(false);
      setPaused(true);
      
      // Determine winner and loser based on server data
      const isWinner = data.winner === user?.email;
      const winnerName = isWinner ? safePlayer1.name : safePlayer2.name;
      const loserName = isWinner ? safePlayer2.name : safePlayer1.name;
      
      // Navigate to appropriate result page
      if (isWinner) {
        router.push(`/play/result/win?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
      } else {
        router.push(`/play/result/loss?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
      }
    }
  }, [gameId, user?.email, safePlayer1.name, safePlayer2.name, router]);

  const handlePlayerLeft = useCallback((data: any) => {
    if (data.gameId === gameId) {
      console.log('Opponent left:', data);
      
      // Set game state to ended
      setGameStarted(false);
      setPaused(true);
      
      // Current player wins when opponent leaves
      const isWinner = true; // Current player is always the winner when opponent leaves
      const winnerName = safePlayer1.name;
      const loserName = safePlayer2.name;
      
      // Navigate to winner page
      router.push(`/play/result/win?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
    }
  }, [gameId, safePlayer1.name, safePlayer2.name, router]);

  // Socket event listeners for remote game
  useEffect(() => {
    if (!isRemoteGame || !socket) return;

    socket.on('GameStateUpdate', handleGameStateUpdate);
    socket.on('PaddleUpdate', handlePaddleUpdate);
    socket.on('GameEnded', handleGameEnded);
    socket.on('PlayerLeft', handlePlayerLeft);

    return () => {
      socket.off('GameStateUpdate', handleGameStateUpdate);
      socket.off('PaddleUpdate', handlePaddleUpdate);
      socket.off('GameEnded', handleGameEnded);
      socket.off('PlayerLeft', handlePlayerLeft);
      // Clean up update timeout
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
        updateTimeout.current = null;
      }
    };
  }, [isRemoteGame, socket, handleGameStateUpdate, handlePaddleUpdate, handleGameEnded, handlePlayerLeft]);

  // Touch button event helpers
  const handleMobilePress = (which: 'p1up' | 'p1down' | 'p2up' | 'p2down', isDown: boolean) => {
    if (which === 'p1up') setPaddle1Move(isDown ? 'up' : '');
    if (which === 'p1down') setPaddle1Move(isDown ? 'down' : '');
    if (which === 'p2up') setPaddle2Move(isDown ? 'up' : '');
    if (which === 'p2down') setPaddle2Move(isDown ? 'down' : '');
  };

  // Reset/exit helpers
  const handleStart = () => {
    if (isRemoteGame && socket && gameId) {
      // For remote games, emit start game event to server
      socket.emit('StartGame', { gameId });
    } else {
      // For local games, start immediately but add 1-second delay before ready
      currentScores.current = { p1: 0, p2: 0 };
      setScores({ p1: 0, p2: 0 });
      paddle1Y.current = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
      paddle2Y.current = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
      ball.current.x = GAME_WIDTH / 2 - BALL_SIZE / 2;
      ball.current.y = GAME_HEIGHT / 2 - BALL_SIZE / 2;
      ball.current.dx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
      ball.current.dy = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
      setGameStarted(true);
      setPaused(false);
      gameStartTime.current = Date.now();
      
      // Add 1-second delay before game is ready to play
      setTimeout(() => {
        setGameReady(true);
      }, 0);
    }
  };

  const handleExit = () => {
    if (isRemoteGame && socket && gameId) {
      socket.emit('LeaveGame', { gameId, playerEmail: user?.email });
    }
    onExit();
  };

  return (
    <div className="flex flex-col">
      {/* Game Container - Full Screen */}
      <div className="flex-1 flex flex-col">
        
        {/* Game Canvas Container */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div
            className="relative rounded-2xl border border-[#656872] bg-[#222429] shadow-2xl overflow-hidden"
            style={{
              width: canvasDims.width,
              height: canvasDims.height,
            }}
          >
            <canvas
              ref={canvasRef}
              className="block w-full h-full"
              style={{
                width: '100%',
                height: '100%'
              }}
            />
            
            {/* Start Button Overlay */}
            {!gameStarted && (
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <button
                  onClick={handleStart}
                  className="flex items-center justify-center w-20 h-20 rounded-full bg-black/60 border-4 border-white/80 hover:bg-black/80 hover:scale-110 transition-all duration-150"
                >
                  <svg width={40} height={40} viewBox="0 0 24 24" fill="#fff">
                    <polygon points="8,6 19,12 8,18" />
                  </svg>
                </button>
              </div>
            )}

            {/* Mobile Controls */}
            {mobile && isGameActive && (
              <>
                {/* Player 1 controls (left side) - only show if player 1 or local game */}
                {(!isRemoteGame || isPlayer1) && (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-20">
                    <button
                      className="w-12 h-12 bg-blue-700/80 hover:bg-blue-800/90 rounded-lg text-white font-bold text-xl flex items-center justify-center touch-manipulation border-2 border-blue-400 shadow-lg"
                      onTouchStart={() => handleMobilePress('p1up', true)}
                      onTouchEnd={() => handleMobilePress('p1up', false)}
                    >
                      ↑
                    </button>
                    <button
                      className="w-12 h-12 bg-blue-700/80 hover:bg-blue-800/90 rounded-lg text-white font-bold text-xl flex items-center justify-center touch-manipulation border-2 border-blue-400 shadow-lg"
                      onTouchStart={() => handleMobilePress('p1down', true)}
                      onTouchEnd={() => handleMobilePress('p1down', false)}
                    >
                      ↓
                    </button>
                  </div>
                )}
                {/* Player 2 controls (right side) - only show if player 2 or local game */}
                {(!isRemoteGame || !isPlayer1) && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-20">
                    <button
                      className="w-12 h-12 bg-red-700/80 hover:bg-red-800/90 rounded-lg text-white font-bold text-xl flex items-center justify-center touch-manipulation border-2 border-red-400 shadow-lg"
                      onTouchStart={() => handleMobilePress('p2up', true)}
                      onTouchEnd={() => handleMobilePress('p2up', false)}
                    >
                      ↑
                    </button>
                    <button
                      className="w-12 h-12 bg-red-700/80 hover:bg-red-800/90 rounded-lg text-white font-bold text-xl flex items-center justify-center touch-manipulation border-2 border-red-400 shadow-lg"
                      onTouchStart={() => handleMobilePress('p2down', true)}
                      onTouchEnd={() => handleMobilePress('p2down', false)}
                    >
                      ↓
                    </button>
                  </div>
                )}
              </>
            )}
            {/* Desktop Controls Overlay */}
            {!mobile && isGameActive && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex gap-8 bg-black/60 rounded-xl px-6 py-3 border border-gray-700 shadow-lg">
                {/* Player 1 Controls */}
                {(!isRemoteGame || isPlayer1) && (
                  <div className="flex flex-col items-center">
                    <div className="flex gap-2 items-center mb-1">
                      <span className="w-6 h-6 flex items-center justify-center bg-gray-700 text-white rounded font-bold border-2 border-gray-400">W</span>
                      <span className="text-white font-semibold">/</span>
                      <span className="w-6 h-6 flex items-center justify-center bg-gray-700 text-white rounded font-bold border-2 border-gray-400">S</span>
                    </div>
                    <span className="text-xs text-blue-200 font-semibold">Player 1</span>
                  </div>
                )}
                {/* Player 2 Controls */}
                {(!isRemoteGame || !isPlayer1) && (
                  <div className="flex flex-col items-center">
                    <div className="flex gap-2 items-center mb-1">
                      <span className="w-6 h-6 flex items-center justify-center bg-gray-700 text-white rounded font-bold border-2 border-gray-400">↑</span>
                      <span className="text-white font-semibold">/</span>
                      <span className="w-6 h-6 flex items-center justify-center bg-gray-700 text-white rounded font-bold border-2 border-gray-400">↓</span>
                    </div>
                    <span className="text-xs text-red-200 font-semibold">Player 2</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Game Info Bar */}
        <div className="p-4">
          {/* Timer */}
          <div className="flex justify-center mb-4">
            <div className="flex gap-2 sm:gap-4 text-center">
              <div className="bg-[#2a2f3a] rounded-lg px-2 sm:px-4 py-2 min-w-[60px] sm:min-w-[80px]">
                <div className="text-lg sm:text-2xl font-bold text-white">{String(gameTime.hours).padStart(2, '0')}</div>
                <div className="text-xs text-gray-400">Hours</div>
              </div>
              <div className="bg-[#2a2f3a] rounded-lg px-2 sm:px-4 py-2 min-w-[60px] sm:min-w-[80px]">
                <div className="text-lg sm:text-2xl font-bold text-white">{String(gameTime.minutes).padStart(2, '0')}</div>
                <div className="text-xs text-gray-400">Minutes</div>
              </div>
              <div className="bg-[#2a2f3a] rounded-lg px-2 sm:px-4 py-2 min-w-[60px] sm:min-w-[80px]">
                <div className="text-lg sm:text-2xl font-bold text-white">{String(gameTime.seconds).padStart(2, '0')}</div>
                <div className="text-xs text-gray-400">Seconds</div>
              </div>
            </div>
          </div>

          {/* Players and Score - Responsive Grid Layout */}
          <div className="grid grid-cols-3 items-center gap-2 sm:gap-4 mb-4">
            {/* Player 1 - Left Column */}
            <div className="flex items-center gap-2 sm:gap-3 justify-start">
              <img
                src={`/images/${safePlayer1.avatar}`}
                alt={safePlayer1.name}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-400 object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-white font-semibold text-sm sm:text-xl md:text-2xl truncate">
                  {safePlayer1.name}
                </h4>
                <p className="text-gray-400 text-xs sm:text-sm md:text-lg truncate">@{safePlayer1.nickname}</p>
              </div>
            </div>
            
            {/* Score - Center Column */}
            <div className="text-center flex-shrink-0">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white whitespace-nowrap">
                {scores.p1} - {scores.p2}
              </div>
            </div>
            
            {/* Player 2 - Right Column */}
            <div className="flex items-center gap-2 sm:gap-3 justify-end">
              <div className="min-w-0 flex-1 text-right">
                <h4 className="text-white font-semibold text-sm sm:text-xl md:text-2xl truncate">
                  {safePlayer2.name}
                </h4>
                <p className="text-gray-400 text-xs sm:text-sm md:text-lg truncate">@{safePlayer2.nickname}</p>
              </div>
              <img
                src={`/images/${safePlayer2.avatar}`}
                alt={safePlayer2.name}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-400 object-cover flex-shrink-0"
              />
            </div>
          </div>

          {/* Game Controls */}
          <div className="flex justify-center gap-2 sm:gap-4">
            <button
              onClick={handleExit}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};