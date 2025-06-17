
"use client";
import React, { useRef, useEffect, useState } from "react";

const GAME_RATIO = 16 / 9;

const GAME_WIDTH = 880;
const GAME_HEIGHT = 495; // 16:9 ratio
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const BALL_SIZE = 16;
const PADDLE_SPEED = 7;
const BALL_SPEED = 6;

const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 640;

export const PingPongGame: React.FC<PingPongGameProps> = ({ 
  player1, 
  player2, 
  onExit, 
  isTournamentMode = false 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [mobile, setMobile] = useState(isMobile());
  const [gameTime, setGameTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const gameStartTime = useRef<number | null>(null);
  const [canvasDims, setCanvasDims] = useState<{ width: number; height: number }>({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  });

  // Validate players have required properties
  const safePlayer1 = {
    id: player1?.id || crypto.randomUUID(),
    name: player1?.name || 'Player 1',
    avatar: player1?.avatar || '/mghalmi.jpg',
    nickname: player1?.nickname || player1?.name || 'Player 1'
  };

  const safePlayer2 = {
    id: player2?.id || crypto.randomUUID(),
    name: player2?.name || 'Player 2',
    avatar: player2?.avatar || '/mghalmi.jpg',
    nickname: player2?.nickname || player2?.name || 'Player 2'
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

  // Mobile paddle state
  const [paddle1Move, setPaddle1Move] = useState<'' | 'up' | 'down'>('');
  const [paddle2Move, setPaddle2Move] = useState<'' | 'up' | 'down'>('');

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
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, paused]);

  // Responsive canvas
  useEffect(() => {
    const handleResize = () => {
      setMobile(isMobile());
      // Calculate responsive dimensions while maintaining aspect ratio
      const maxW = Math.min(window.innerWidth * 0.9, 1200);
      const maxH = Math.min(window.innerHeight * 0.6, 700);
      let width = maxW;
      let height = width / GAME_RATIO;
      if (height > maxH) {
        height = maxH;
        width = height * GAME_RATIO;
      }
      setCanvasDims({ width, height });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update canvas size when dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvasDims.width;
      canvas.height = canvasDims.height;
    }
  }, [canvasDims]);

  // Keyboard controls (Desktop)
  useEffect(() => {
    if (mobile) return;
    const downHandler = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
    };
    const upHandler = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [mobile]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || paused) return;
    let animation: number;

    const scaleX = canvasDims.width / GAME_WIDTH;
    const scaleY = canvasDims.height / GAME_HEIGHT;

    const draw = () => {
      const ctx = canvasRef.current?.getContext("2d");
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
        0, 
        paddle1Y.current * scaleY, 
        PADDLE_WIDTH * scaleX, 
        PADDLE_HEIGHT * scaleY
      );
      ctx.fillRect(
        canvasDims.width - PADDLE_WIDTH * scaleX, 
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
      // Move paddles - desktop or mobile
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
        ball.current.y + BALL_SIZE >= paddle1Y.current &&
        ball.current.y <= paddle1Y.current + PADDLE_HEIGHT
      ) {
        ball.current.dx = Math.abs(ball.current.dx);
      }
      // Right paddle collision
      if (
        ball.current.x + BALL_SIZE >= GAME_WIDTH - PADDLE_WIDTH &&
        ball.current.y + BALL_SIZE >= paddle2Y.current &&
        ball.current.y <= paddle2Y.current + PADDLE_HEIGHT
      ) {
        ball.current.dx = -Math.abs(ball.current.dx);
      }
      // Scoring
      if (ball.current.x < -BALL_SIZE) {
        setScores((s) => ({ ...s, p2: s.p2 + 1 }));
        resetBall(-1);
      } else if (ball.current.x > GAME_WIDTH + BALL_SIZE) {
        setScores((s) => ({ ...s, p1: s.p1 + 1 }));
        resetBall(1);
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
      if (!paused) update();
      draw();
      animation = requestAnimationFrame(loop);
    };

    loop();
    return () => {
      cancelAnimationFrame(animation);
    };
  }, [gameStarted, paused, mobile, canvasDims, paddle1Move, paddle2Move]);

  // Win condition - Updated for tournament mode with better winner object
  useEffect(() => {
    if (scores.p1 >= 7 || scores.p2 >= 7) {
      setGameStarted(false);
      setPaused(true);
      
      const winner = scores.p1 >= 7 ? safePlayer1 : safePlayer2;
      
      if (isTournamentMode) {
        // For tournament mode, pass the complete winner object back
        onExit(winner);
      } else {
        // For regular games, navigate to result pages
        const winnerName = winner.name;
        const loserName = scores.p1 >= 7 ? safePlayer2.name : safePlayer1.name;
        
        // Check if current user won (assuming player1 is always the user in 1v1 mode)
        if (scores.p1 >= 7) {
          window.location.href = `/play/result/win?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`;
        } else {
          window.location.href = `/play/result/loss?winner=${encodeURIComponent(winnerName)}&loser=${encodeURIComponent(loserName)}`;
        }
      }
    }
  }, [scores, safePlayer1, safePlayer2, onExit, isTournamentMode]);

  // Touch button event helpers
  const handleMobilePress = (which: 'p1up' | 'p1down' | 'p2up' | 'p2down', isDown: boolean) => {
    if (which === 'p1up') setPaddle1Move(isDown ? 'up' : '');
    if (which === 'p1down') setPaddle1Move(isDown ? 'down' : '');
    if (which === 'p2up') setPaddle2Move(isDown ? 'up' : '');
    if (which === 'p2down') setPaddle2Move(isDown ? 'down' : '');
  };

  // Reset/exit helpers
  const handleStart = () => {
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
  };

  const handlePause = () => {
    setPaused(true);
  };

  const handleResume = () => {
    setPaused(false);
  };

  const handleExit = () => {
    if (isTournamentMode) {
      onExit(); // Exit without winner for tournament mode
    } else {
      onExit();
    }
  };

  // UI helpers
  const gameOver = scores.p1 >= 7 || scores.p2 >= 7;
  const isGameActive = gameStarted && !paused && !gameOver;

  return (
    <div className="flex flex-col overflow-hidden">
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

            {/* Pause Icon Overlay - Only shows pause icon */}
            {gameStarted && paused && !gameOver && (
              <div className="absolute inset-0 z-30 bg-black/60 flex items-center justify-center">
                <div className="flex items-center justify-center w-24 h-24 rounded-full bg-black/80 border-4 border-white/80">
                  <svg width={48} height={48} viewBox="0 0 24 24" fill="#fff">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                </div>
              </div>
            )}
            
            {/* Mobile Controls */}
            {mobile && isGameActive && (
              <>
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-20">
                  <button
                    className="w-12 h-12 bg-gray-800/80 rounded-lg text-white font-bold text-xl flex items-center justify-center touch-manipulation"
                    onTouchStart={() => handleMobilePress('p1up', true)}
                    onTouchEnd={() => handleMobilePress('p1up', false)}
                  >
                    ↑
                  </button>
                  <button
                    className="w-12 h-12 bg-gray-800/80 rounded-lg text-white font-bold text-xl flex items-center justify-center touch-manipulation"
                    onTouchStart={() => handleMobilePress('p1down', true)}
                    onTouchEnd={() => handleMobilePress('p1down', false)}
                  >
                    ↓
                  </button>
                </div>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-20">
                  <button
                    className="w-12 h-12 bg-gray-800/80 rounded-lg text-white font-bold text-xl flex items-center justify-center touch-manipulation"
                    onTouchStart={() => handleMobilePress('p2up', true)}
                    onTouchEnd={() => handleMobilePress('p2up', false)}
                  >
                    ↑
                  </button>
                  <button
                    className="w-12 h-12 bg-gray-800/80 rounded-lg text-white font-bold text-xl flex items-center justify-center touch-manipulation"
                    onTouchStart={() => handleMobilePress('p2down', true)}
                    onTouchEnd={() => handleMobilePress('p2down', false)}
                  >
                    ↓
                  </button>
                </div>
              </>
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
                src={safePlayer1.avatar}
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
                src={safePlayer2.avatar}
                alt={safePlayer2.name}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-400 object-cover flex-shrink-0"
              />
            </div>
          </div>

          {/* Game Controls */}
          <div className="flex justify-center gap-2 sm:gap-4">
            {isGameActive && (
              <button
                onClick={handlePause}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                Pause
              </button>
            )}
            {gameStarted && paused && !gameOver && (
              <button
                onClick={handleResume}
                className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
              >
                Resume
              </button>
            )}
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
