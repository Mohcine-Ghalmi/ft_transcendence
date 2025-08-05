"use client";
import { useAuthStore } from "@/(zustand)/useAuthStore";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { axiosGameInstance } from "@/(zustand)/useGameStore";

const GAME_RATIO = 16 / 9;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const PADDLE_SPEED = 8;
const BALL_SIZE = 15;
const BALL_SPEED = 6;

const isMobile = () => typeof window !== 'undefined' && (window.innerWidth < 768 || 'ontouchstart' in window);

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

  const [isRemoteGame, setIsRemoteGame] = useState(false);
  const [remoteGameState, setRemoteGameState] = useState<any>(null);
  const [isPlayer1, setIsPlayer1] = useState(true);
  const [isGameHost, setIsGameHost] = useState(false);
  const updateTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const animationRef = useRef<number | null>(null);
  const router = useRouter();

  const [tournamentPlayer1Data, setTournamentPlayer1Data] = useState<any>(null);
  const [tournamentPlayer2Data, setTournamentPlayer2Data] = useState<any>(null);

  const [paddle1Move, setPaddle1Move] = useState<'' | 'up' | 'down'>('');
  const [paddle2Move, setPaddle2Move] = useState<'' | 'up' | 'down'>('');

  const fetchTournamentParticipant = async (email: string) => {
    try {
      const response = await axiosGameInstance.get(`/tournament-participant?email=${encodeURIComponent(email)}`);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    setIsRemoteGame(!!gameId && !!socket);
    if (gameId && socket) {
      setIsPlayer1(isHost);
      setIsGameHost(isHost);
    }
  }, [gameId, socket, isHost]);

  useEffect(() => {
    if (isTournamentMode && isRemoteGame) {
      const fetchParticipantData = async () => {
        try {
          if (user?.email) {
            const userData = await fetchTournamentParticipant(user.email);
            if (userData) {
              if (isHost) {
                setTournamentPlayer1Data(userData);
              } else {
                setTournamentPlayer2Data(userData);
              }
            }
          }

          if (opponent?.email) {
            const opponentData = await fetchTournamentParticipant(opponent.email);
            if (opponentData) {
              if (isHost) {
                setTournamentPlayer2Data(opponentData);
              } else {
                setTournamentPlayer1Data(opponentData);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching tournament participant data:', error);
        }
      };

      fetchParticipantData();
    }
  }, [isTournamentMode, isRemoteGame, user?.email, opponent?.email, isHost]);

  useEffect(() => {
    if (!isRemoteGame || !socket) return;

    const handleGameStarted = (data: any) => {
      if (data.gameId === gameId) {
        setGameStarted(true);
        setPaused(false);
        gameStartTime.current = Date.now();
        
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
          ball.current.x = GAME_WIDTH / 2 - BALL_SIZE / 2;
          ball.current.y = GAME_HEIGHT / 2 - BALL_SIZE / 2;
          ball.current.dx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
          ball.current.dy = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
          paddle1Y.current = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
          paddle2Y.current = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
          currentScores.current = { p1: 0, p2: 0 };
          setScores({ p1: 0, p2: 0 });
        }
        
        if (isTournamentMode) {
          setGameReady(true);
        } else {
          setTimeout(() => {
            setGameReady(true);
          }, 500);
        }
      }
    };

    socket.on('GameStarted', handleGameStarted);

    return () => {
      socket.off('GameStarted', handleGameStarted);
    };
  }, [isRemoteGame, socket, gameId, isPlayer1, isGameHost, isTournamentMode]);

  useEffect(() => {
    if (isTournamentMode && !gameStarted) {
      setGameStarted(true);
      setPaused(false);
      gameStartTime.current = Date.now();
      
      ball.current.x = GAME_WIDTH / 2 - BALL_SIZE / 2;
      ball.current.y = GAME_HEIGHT / 2 - BALL_SIZE / 2;
      ball.current.dx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
      ball.current.dy = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
      paddle1Y.current = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
      paddle2Y.current = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
      currentScores.current = { p1: 0, p2: 0 };
      setScores({ p1: 0, p2: 0 });
      setGameReady(true);
    }
  }, [isTournamentMode, gameStarted]);

  useEffect(() => {
    if (isRemoteGame && socket && gameId && !gameStarted && !isTournamentMode) {
      const autoStartTimer = setTimeout(() => {
        if (!gameStarted && socket && gameId) {
          socket.emit('StartGame', { gameId });
        }
      }, 1000);

      return () => clearTimeout(autoStartTimer);
    }
  }, [isRemoteGame, socket, gameId, gameStarted, isTournamentMode]);

  const safePlayer1 = {
    id: isTournamentMode && tournamentPlayer1Data ? tournamentPlayer1Data.id : 
        (isRemoteGame && isHost ? user?.id : (isRemoteGame ? opponent?.id : user?.id)) || crypto.randomUUID(),
    name: isTournamentMode && tournamentPlayer1Data ? tournamentPlayer1Data.name : 
          (isRemoteGame && isHost ? user?.username : (isRemoteGame ? opponent?.username || opponent?.name : user?.username)),
    avatar: isTournamentMode && tournamentPlayer1Data ? tournamentPlayer1Data.avatar : 
            (isRemoteGame && isHost ? user?.avatar : (isRemoteGame ? opponent?.avatar : user?.avatar)),
    nickname: isTournamentMode && tournamentPlayer1Data ? tournamentPlayer1Data.nickname : 
              (isRemoteGame && isHost ? user?.login : (isRemoteGame ? opponent?.login || opponent?.nickname : user?.login)) || 'Player 1',
    email: isTournamentMode && tournamentPlayer1Data ? tournamentPlayer1Data.email : 
           (isRemoteGame && isHost ? user?.email : (isRemoteGame ? opponent?.email : user?.email))
  };

  const safePlayer2 = {
    id: isTournamentMode && tournamentPlayer2Data ? tournamentPlayer2Data.id : 
        (isRemoteGame && !isHost ? user?.id : (isRemoteGame ? opponent?.id : player2?.id)) || crypto.randomUUID(),
    name: isTournamentMode && tournamentPlayer2Data ? tournamentPlayer2Data.name : 
          (isRemoteGame && !isHost ? user?.username : (isRemoteGame ? opponent?.username || opponent?.name : player2?.username || player2?.name)),
    avatar: isTournamentMode && tournamentPlayer2Data ? tournamentPlayer2Data.avatar : 
            (isRemoteGame && !isHost ? user?.avatar : (isRemoteGame ? opponent?.avatar : player2?.avatar)),
    nickname: isTournamentMode && tournamentPlayer2Data ? tournamentPlayer2Data.nickname : 
              (isRemoteGame && !isHost ? user?.login : (isRemoteGame ? opponent?.login || opponent?.nickname : player2?.login || player2?.nickname)) || 'Player 2',
    email: isTournamentMode && tournamentPlayer2Data ? tournamentPlayer2Data.email : 
           (isRemoteGame && !isHost ? user?.email : (isRemoteGame ? opponent?.email : player2?.email))
  };

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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameStarted && !paused && gameStartTime.current) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - gameStartTime.current!) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        setGameTime({ hours, minutes, seconds });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, paused]);

  const gameOver = scores.p1 >= 7 || scores.p2 >= 7;
  const isGameActive = gameStarted && !paused && !gameOver;
  useEffect(() => {
    const updateMobileState = () => {
      setMobile(isMobile());
    };
    
    updateMobileState();
    window.addEventListener('resize', updateMobileState);
    window.addEventListener('orientationchange', updateMobileState);
    
    return () => {
      window.removeEventListener('resize', updateMobileState);
      window.removeEventListener('orientationchange', updateMobileState);
    };
  }, []);

  useEffect(() => {
    if (!mobile || !isGameActive) return;
    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'CANVAS' || target.tagName === 'BUTTON')) {
        e.preventDefault();
      }
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'CANVAS' || target.tagName === 'BUTTON')) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [mobile, isGameActive]);

  useEffect(() => {
    const handleResize = () => {
      const container = canvasRef.current?.parentElement;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      setMobile(isMobile());
      let width = Math.min(containerWidth - 32, containerWidth * 0.95);
      let height = width / GAME_RATIO;
      if (height > containerHeight - 100) {
        height = containerHeight - 100;
        width = height * GAME_RATIO;
      }
      const minWidth = isMobile() ? 320 : 600;
      const maxWidth = isMobile() ? Math.min(containerWidth - 16, 500) : 1200;
      
      width = Math.max(minWidth, Math.min(maxWidth, width));
      height = width / GAME_RATIO;
      
      setCanvasDims({ width, height });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvasDims.width;
      canvas.height = canvasDims.height;
    }
  }, [canvasDims]);
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

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasDims.width;
    canvas.height = canvasDims.height;

    const scaleX = canvasDims.width / GAME_WIDTH;
    const scaleY = canvasDims.height / GAME_HEIGHT;

    const draw = () => {
      if (!canvasRef.current) return;
      
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasDims.width, canvasDims.height);
      const grad = ctx.createLinearGradient(0, 0, canvasDims.width, canvasDims.height);
      grad.addColorStop(0, "#23272f");
      grad.addColorStop(1, "#15181e");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasDims.width, canvasDims.height);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvasDims.width / 2, 0);
      ctx.lineTo(canvasDims.width / 2, canvasDims.height);
      ctx.stroke();
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
      if (isRemoteGame) {
        if (isHost) {
          if (!mobile) {
            if (keys.current["w"] && paddle1Y.current > 0) {
              paddle1Y.current -= PADDLE_SPEED;
            }
            if (keys.current["s"] && paddle1Y.current < GAME_HEIGHT - PADDLE_HEIGHT) {
              paddle1Y.current += PADDLE_SPEED;
            }
          } else {
            if (paddle1Move === "up" && paddle1Y.current > 0) {
              paddle1Y.current -= PADDLE_SPEED;
            }
            if (paddle1Move === "down" && paddle1Y.current < GAME_HEIGHT - PADDLE_HEIGHT) {
              paddle1Y.current += PADDLE_SPEED;
            }
          }
        } else {
          if (!mobile) {
            if (keys.current["arrowup"] && paddle2Y.current > 0) paddle2Y.current -= PADDLE_SPEED;
            if (keys.current["arrowdown"] && paddle2Y.current < GAME_HEIGHT - PADDLE_HEIGHT) paddle2Y.current += PADDLE_SPEED;
          } else {
            if (paddle2Move === "up" && paddle2Y.current > 0) {
              paddle2Y.current -= PADDLE_SPEED;
            }
            if (paddle2Move === "down" && paddle2Y.current < GAME_HEIGHT - PADDLE_HEIGHT) {
              paddle2Y.current += PADDLE_SPEED;
            }
          }
        }
        
        if (isGameHost) {
          ball.current.x += ball.current.dx;
          ball.current.y += ball.current.dy;
          if (ball.current.y <= 0 || ball.current.y + BALL_SIZE >= GAME_HEIGHT) {
            ball.current.dy *= -1;
          }
          if (
            ball.current.x <= PADDLE_WIDTH &&
            ball.current.x + ball.current.dx >= 0 &&
            ball.current.y + BALL_SIZE >= paddle1Y.current &&
            ball.current.y <= paddle1Y.current + PADDLE_HEIGHT
          ) {
            ball.current.x = PADDLE_WIDTH; 
            ball.current.dx = Math.abs(ball.current.dx);
            ball.current.dx *= 1.01;
            ball.current.dy *= 1.01;
          }
          if (
            ball.current.x + BALL_SIZE >= GAME_WIDTH - PADDLE_WIDTH &&
            ball.current.x + BALL_SIZE + ball.current.dx <= GAME_WIDTH &&
            ball.current.y + BALL_SIZE >= paddle2Y.current &&
            ball.current.y <= paddle2Y.current + PADDLE_HEIGHT
          ) {
            ball.current.x = GAME_WIDTH - PADDLE_WIDTH - BALL_SIZE;
            ball.current.dx = -Math.abs(ball.current.dx);
            ball.current.dx *= 1.01;
            ball.current.dy *= 1.01;
          }
          
          if (ball.current.x < -BALL_SIZE) {
            currentScores.current = { p1: currentScores.current.p1, p2: currentScores.current.p2 + 1 };
            setScores(currentScores.current);
            resetBall(-1);
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
        if (!mobile) {
          if (keys.current["w"] && paddle1Y.current > 0) paddle1Y.current -= PADDLE_SPEED;
          if (keys.current["s"] && paddle1Y.current < GAME_HEIGHT - PADDLE_HEIGHT) paddle1Y.current += PADDLE_SPEED;
          if ((keys.current["arrowup"] || keys.current["↑"]) && paddle2Y.current > 0) paddle2Y.current -= PADDLE_SPEED;
          if ((keys.current["arrowdown"] || keys.current["↓"]) && paddle2Y.current < GAME_HEIGHT - PADDLE_HEIGHT) paddle2Y.current += PADDLE_SPEED;
        } else {
          if (paddle1Move === "up" && paddle1Y.current > 0) {
            paddle1Y.current -= PADDLE_SPEED;
          }
          if (paddle1Move === "down" && paddle1Y.current < GAME_HEIGHT - PADDLE_HEIGHT) {
            paddle1Y.current += PADDLE_SPEED;
          }
          if (paddle2Move === "up" && paddle2Y.current > 0) {
            paddle2Y.current -= PADDLE_SPEED;
          }
          if (paddle2Move === "down" && paddle2Y.current < GAME_HEIGHT - PADDLE_HEIGHT) {
            paddle2Y.current += PADDLE_SPEED;
          }
        }

        ball.current.x += ball.current.dx;
        ball.current.y += ball.current.dy;

        if (ball.current.y <= 0 || ball.current.y + BALL_SIZE >= GAME_HEIGHT) {
          ball.current.dy *= -1;
        }
        if (
          ball.current.x <= PADDLE_WIDTH &&
          ball.current.y + BALL_SIZE >= paddle1Y.current &&
          ball.current.y <= paddle1Y.current + PADDLE_HEIGHT
        ) {
          ball.current.dx = Math.abs(ball.current.dx);
          ball.current.dx *= 1.01;
          ball.current.dy *= 1.01;
        }
        if (
          ball.current.x + BALL_SIZE >= GAME_WIDTH - PADDLE_WIDTH &&
          ball.current.y + BALL_SIZE >= paddle2Y.current &&
          ball.current.y <= paddle2Y.current + PADDLE_HEIGHT
        ) {
          ball.current.dx = -Math.abs(ball.current.dx);
          ball.current.dx *= 1.01;
          ball.current.dy *= 1.01;
        }
        
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

      if (isRemoteGame && isGameHost && socket && gameId) {
        const currentTime = Date.now();
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
      
      if (isRemoteGame && !isGameHost && socket && gameId) {
        const currentTime = Date.now();
        if (currentTime - lastUpdateTime.current >= 16) {
          const paddleUpdate = {
            gameId,
            paddleY: isHost ? paddle1Y.current : paddle2Y.current,
            playerType: isHost ? 'p1' : 'p2'
          };
          
          socket.emit('PaddleUpdate', paddleUpdate);
          lastUpdateTime.current = currentTime;
        }
      }
    };

    const resetBall = (direction: number) => {
      ball.current.x = GAME_WIDTH / 2 - BALL_SIZE / 2;
      ball.current.y = GAME_HEIGHT / 2 - BALL_SIZE / 2;
      const yDirection = (Math.random() > 0.5 ? 1 : -1) * BALL_SPEED;
      ball.current.dx = BALL_SPEED * direction;
      ball.current.dy = yDirection;
    };

    const loop = () => {
      if (!paused && gameReady) update(); 
      draw();
      animationRef.current = requestAnimationFrame(loop);
    };

    if (gameStarted) {
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
  }, [gameStarted, paused, gameReady, paddle1Move, paddle2Move, mobile]);   

  useEffect(() => {
    if (scores.p1 >= 7 || scores.p2 >= 7) {
      setGameStarted(false);
      setPaused(true);
      
      const winner = scores.p1 >= 7 ? safePlayer1 : safePlayer2;
      
      if (isRemoteGame && socket && gameId) {
        if (isGameHost) {
          const finalScore = { p1: scores.p1, p2: scores.p2 };
          const winnerEmail = scores.p1 >= 7 ? safePlayer1.email || user?.email : safePlayer2.email || opponent?.email;
          const loserEmail = scores.p1 >= 7 ? safePlayer2.email || opponent?.email : safePlayer1.email || user?.email;
          
          socket.emit('GameEnd', {
            gameId,
            winner: winnerEmail,
            loser: loserEmail,
            finalScore,
            reason: 'normal_end'
          });
        }
        
        return;
      }
      
      if (isTournamentMode) {
        onExit(winner);
      } else {
        const winnerName = winner.name;
        const loserName = scores.p1 >= 7 ? safePlayer2.name : safePlayer1.name;
        
        const currentUserWon = (isHost && scores.p1 >= 7) || (!isHost && scores.p2 >= 7);
        
        if (currentUserWon) {
          router.push(`/play/result/win?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
        } else {
          router.push(`/play/result/loss?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
        }
      }
    }
  }, [scores.p1, scores.p2, safePlayer1, safePlayer2, onExit, isTournamentMode, isRemoteGame, socket, gameId, isGameHost, isHost, opponent?.email, user?.email]);

  const handleGameEnd = useCallback((winner: any) => {
    if (isRemoteGame && socket && gameId) {
      socket.emit('LeaveGame', { gameId, playerEmail: user?.email });
    }
    
    if (isTournamentMode) {
      onExit(winner);
    } else if (isRemoteGame) {
    } else {
      onExit();
    }
  }, [isRemoteGame, socket, gameId, user?.email, isTournamentMode, onExit]);

  const handleGameStateUpdate = useCallback((data: any) => {
    if (data.gameId === gameId && data.gameState) {
      setRemoteGameState(data.gameState);
      
      ball.current.x = data.gameState.ballX;
      ball.current.y = data.gameState.ballY;
      ball.current.dx = data.gameState.ballDx;
      ball.current.dy = data.gameState.ballDy;
      
      if (data.gameState.scores) {
        currentScores.current = data.gameState.scores;
        setScores(data.gameState.scores);
      }
      
      if (isHost) {
        paddle2Y.current = data.gameState.paddle2Y;
      } else {
        paddle1Y.current = data.gameState.paddle1Y;
      }
      
      if (data.gameState.gameStatus === 'finished' && data.gameState.winner) {
        handleGameEnd(data.gameState.winner);
      }
    }
  }, [gameId, isHost, handleGameEnd]);

  const handlePaddleUpdate = useCallback((data: any) => {
    if (data.gameId === gameId && isGameHost) {
      if (data.playerType === 'p1') {
        paddle1Y.current = data.paddleY;
      } else if (data.playerType === 'p2') {
        paddle2Y.current = data.paddleY;
      }
    }
  }, [gameId, isGameHost]);

  const handleGameEnded = useCallback((data: any) => {
    if (data.gameId === gameId) {
      setGameStarted(false);
      setPaused(true);
      
      const isWinner = data.winner === user?.email;
      const winnerName = isWinner ? 
        (user?.username || user?.login || 'You') : 
        (isHost ? safePlayer2.name : safePlayer1.name);
      const loserName = isWinner ? 
        (isHost ? safePlayer2.name : safePlayer1.name) : 
        (user?.username || user?.login || 'You');
      
      if (isWinner) {
        router.push(`/play/result/win?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
      } else {
        router.push(`/play/result/loss?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
      }
    }
  }, [gameId, user?.email, safePlayer1.name, safePlayer2.name, router, isHost]);

  const handlePlayerLeft = useCallback((data: any) => {
    if (data.gameId === gameId) {
      setGameStarted(false);
      setPaused(true);
      
      const winnerName = user?.username || user?.login || 'You';
      const loserName = data.playerWhoLeft || 'Opponent';
      
      router.push(`/play/result/win?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`);
    }
  }, [gameId, user?.username, user?.login, router]);

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
      if (updateTimeout.current) {
        clearTimeout(updateTimeout.current);
        updateTimeout.current = null;
      }
    };
  }, [isRemoteGame, socket, handleGameStateUpdate, handlePaddleUpdate, handleGameEnded, handlePlayerLeft]);

  const handleMobilePress = useCallback((which: 'p1up' | 'p1down' | 'p2up' | 'p2down', isDown: boolean) => {
    if (which === 'p1up') setPaddle1Move(isDown ? 'up' : '');
    if (which === 'p1down') setPaddle1Move(isDown ? 'down' : '');
    if (which === 'p2up') setPaddle2Move(isDown ? 'up' : '');
    if (which === 'p2down') setPaddle2Move(isDown ? 'down' : '');
  }, [mobile, isGameActive, paddle1Move, paddle2Move]);

  const handleStart = () => {
    if (isRemoteGame && socket && gameId) {
      socket.emit('StartGame', { gameId });
    } else {
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
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div
            className="relative rounded-2xl border border-[#656872] bg-[#222429] shadow-2xl overflow-hidden"
            style={{
              width: canvasDims.width,
              height: canvasDims.height,
              maxWidth: '100%',
              maxHeight: '100%',
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
            
            {!gameStarted && !isTournamentMode && (
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
            
            {!gameStarted && isTournamentMode && (
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
                  <p className="text-white text-lg font-semibold">Tournament Match Starting...</p>
                </div>
              </div>
            )}

            {mobile && isGameActive && (
              <>
                {(!isRemoteGame || isHost) && (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-20">
                    <button
                      className="w-12 h-12 bg-blue-700/80 active:bg-blue-900 rounded-lg text-white font-bold text-xl flex items-center justify-center touch-manipulation border-2 border-blue-400 shadow-lg select-none"
                      onTouchStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMobilePress('p1up', true);
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMobilePress('p1up', false);
                      }}
                      onTouchCancel={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMobilePress('p1up', false);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleMobilePress('p1up', true);
                      }}
                      onMouseUp={(e) => {
                        e.preventDefault();
                        handleMobilePress('p1up', false);
                      }}
                      onMouseLeave={(e) => {
                        e.preventDefault();
                        handleMobilePress('p1up', false);
                      }}
                    >
                      ↑
                    </button>
                    <button
                      className="w-12 h-12 bg-blue-700/80 active:bg-blue-900 rounded-lg text-white font-bold text-xl flex items-center justify-center touch-manipulation border-2 border-blue-400 shadow-lg select-none"
                      onTouchStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMobilePress('p1down', true);
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMobilePress('p1down', false);
                      }}
                      onTouchCancel={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMobilePress('p1down', false);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleMobilePress('p1down', true);
                      }}
                      onMouseUp={(e) => {
                        e.preventDefault();
                        handleMobilePress('p1down', false);
                      }}
                      onMouseLeave={(e) => {
                        e.preventDefault();
                        handleMobilePress('p1down', false);
                      }}
                    >
                      ↓
                    </button>
                  </div>
                )}
                
                {(!isRemoteGame || !isHost) && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-20">
                    <button
                      className="w-12 h-12 bg-red-700/80 active:bg-red-900 rounded-lg text-white font-bold text-xl flex items-center justify-center touch-manipulation border-2 border-red-400 shadow-lg select-none"
                      onTouchStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMobilePress('p2up', true);
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMobilePress('p2up', false);
                      }}
                      onTouchCancel={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMobilePress('p2up', false);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleMobilePress('p2up', true);
                      }}
                      onMouseUp={(e) => {
                        e.preventDefault();
                        handleMobilePress('p2up', false);
                      }}
                      onMouseLeave={(e) => {
                        e.preventDefault();
                        handleMobilePress('p2up', false);
                      }}
                    >
                      ↑
                    </button>
                    <button
                      className="w-12 h-12 bg-red-700/80 active:bg-red-900 rounded-lg text-white font-bold text-xl flex items-center justify-center touch-manipulation border-2 border-red-400 shadow-lg select-none"
                      onTouchStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMobilePress('p2down', true);
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMobilePress('p2down', false);
                      }}
                      onTouchCancel={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMobilePress('p2down', false);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleMobilePress('p2down', true);
                      }}
                      onMouseUp={(e) => {
                        e.preventDefault();
                        handleMobilePress('p2down', false);
                      }}
                      onMouseLeave={(e) => {
                        e.preventDefault();
                        handleMobilePress('p2down', false);
                      }}
                    >
                      ↓
                    </button>
                  </div>
                )}
              </>
            )}
            {!mobile && isGameActive && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-30 flex gap-4 bg-black/60 rounded-lg px-3 py-2 border border-gray-700 shadow-lg">
                {(!isRemoteGame || isHost) && (
                  <div className="flex flex-col items-center">
                    <div className="flex gap-1 items-center mb-1">
                      <span className="w-5 h-5 flex items-center justify-center bg-gray-700 text-white rounded text-xs font-bold border border-gray-400">W</span>
                      <span className="text-white text-xs">/</span>
                      <span className="w-5 h-5 flex items-center justify-center bg-gray-700 text-white rounded text-xs font-bold border border-gray-400">S</span>
                    </div>
                    <span className="text-xs text-blue-200 font-semibold">Left</span>
                  </div>
                )}
                {(!isRemoteGame || !isHost) && (
                  <div className="flex flex-col items-center">
                    <div className="flex gap-1 items-center mb-1">
                      <span className="w-5 h-5 flex items-center justify-center bg-gray-700 text-white rounded text-xs font-bold border border-gray-400">↑</span>
                      <span className="text-white text-xs">/</span>
                      <span className="w-5 h-5 flex items-center justify-center bg-gray-700 text-white rounded text-xs font-bold border border-gray-400">↓</span>
                    </div>
                    <span className="text-xs text-red-200 font-semibold">Right</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
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

          <div className="grid grid-cols-3 items-center gap-2 sm:gap-4 mb-4">
            {/* Player 1 - Left Column */}
            <div className="flex items-center gap-2 sm:gap-3 justify-start">
              <img
                src={isRemoteGame ? 
                  `${safePlayer1.avatar?.startsWith('/') ? safePlayer1.avatar : `/images/${safePlayer1.avatar}`}` :
                  `/images/${safePlayer1.avatar}`}
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
                src={isRemoteGame ? 
                  `${safePlayer2.avatar?.startsWith('/') ? safePlayer2.avatar : `/images/${safePlayer2.avatar}`}` :
                  `${safePlayer2.avatar?.startsWith('data:') ? safePlayer2.avatar : 
                    (safePlayer2.avatar === 'Default.avif' || safePlayer2.avatar === 'Default.svg') ? `/avatar/${safePlayer2.avatar}` : 
                    safePlayer2.avatar?.startsWith('/') ? safePlayer2.avatar : `/avatar/Default.avif`}`}
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