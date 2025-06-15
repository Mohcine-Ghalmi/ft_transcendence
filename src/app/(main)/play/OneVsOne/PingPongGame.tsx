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

type PingPongGameProps = {
  player1: {
    name: string;
    avatar: string;
    username: string;
  };
  player2: {
    name: string;
    avatar: string;
    username: string;
  };
  onExit: () => void;
};

const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 640;

export const PingPongGame: React.FC<PingPongGameProps> = ({ player1, player2, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [mobile, setMobile] = useState(isMobile());
  const [canvasDims, setCanvasDims] = useState<{ width: number; height: number }>({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  });

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

  // Responsive canvas
  useEffect(() => {
    const handleResize = () => {
      setMobile(isMobile());
      // Calculate responsive dimensions while maintaining aspect ratio
      const maxW = Math.min(window.innerWidth * 0.95, 1000);
      const maxH = Math.min(window.innerHeight * 0.55, 600);
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

  // Win condition: First to 7
  useEffect(() => {
    if (scores.p1 >= 7 || scores.p2 >= 7) {
      setPaused(true);
    }
  }, [scores]);

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
  };

  const handlePause = () => {
    setPaused(true);
  };

  const handleResume = () => {
    setPaused(false);
  };

  const handlePlayAgain = () => {
    setGameStarted(false);
    setPaused(false);
    setScores({ p1: 0, p2: 0 });
  };

  // UI helpers
  const gameOver = scores.p1 >= 7 || scores.p2 >= 7;
  const isGameActive = gameStarted && !paused && !gameOver;

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#15181e] p-4 overflow-auto">
      <div className="w-full max-w-6xl flex flex-col items-center">
        {/* Game Container */}
        <div className="w-full flex flex-col items-center bg-[#1a1d23] rounded-3xl p-6 shadow-2xl">
          
          {/* Game Canvas Container */}
          <div className="relative w-full flex justify-center mb-6">
            <div
              className="relative rounded-2xl border border-[#656872] bg-[#222429] shadow-2xl overflow-hidden"
              style={{
                width: canvasDims.width,
                height: canvasDims.height,
                minWidth: 280,
                minHeight: 160
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

              {/* Pause Overlay */}
              {gameStarted && paused && !gameOver && (
                <div className="absolute inset-0 z-30 bg-black/60 flex flex-col items-center justify-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-xl">
                    Game Paused
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handleResume}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 transition-colors text-white font-semibold rounded-xl"
                    >
                      Resume
                    </button>
                    <button
                      onClick={onExit}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 transition-colors text-white font-semibold rounded-xl"
                    >
                      Exit Game
                    </button>
                  </div>
                </div>
              )}
              
              {/* Win Overlay */}
              {gameOver && (
                <div className="absolute inset-0 z-30 bg-black/70 flex flex-col items-center justify-center">
                  <div className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-xl text-center">
                    {scores.p1 > scores.p2
                      ? `${player1.name} Wins! 🏆`
                      : `${player2.name} Wins! 🏆`}
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={handlePlayAgain}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold rounded-xl"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={onExit}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 transition-colors text-white font-semibold rounded-xl"
                    >
                      Exit Game
                    </button>
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

          {/* Players and Score */}
          <div className="flex items-center justify-between w-full max-w-4xl px-4 mb-6">
            {/* Player 1 */}
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={player1.avatar}
                alt={player1.name}
                className="w-12 h-12 rounded-full border-2 border-blue-400 object-cover"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-white truncate">{player1.name}</span>
                <span className="text-sm text-gray-300">@{player1.username}</span>
              </div>
            </div>
            
            {/* Score */}
            <div className="flex flex-col items-center px-6">
              <div className="flex text-4xl md:text-6xl font-bold text-white gap-3">
                <span>{scores.p1}</span>
                <span className="text-gray-400">-</span>
                <span>{scores.p2}</span>
              </div>
              <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Score</span>
            </div>
            
            {/* Player 2 */}
            <div className="flex items-center gap-3 min-w-0 flex-row-reverse">
              <img
                src={player2.avatar}
                alt={player2.name}
                className="w-12 h-12 rounded-full border-2 border-blue-400 object-cover"
              />
              <div className="flex flex-col min-w-0 text-right">
                <span className="font-semibold text-white truncate">{player2.name}</span>
                <span className="text-sm text-gray-300">@{player2.username}</span>
              </div>
            </div>
          </div>

          {/* Game Controls */}
          <div className="flex gap-4 mb-4">
            {isGameActive && (
              <button
                onClick={handlePause}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Pause
              </button>
            )}
            <button
              onClick={onExit}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Exit Game
            </button>
          </div>

          {/* Instructions */}
          {!mobile && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-center">
              <div className="text-sm text-gray-300">
                <span className="font-semibold text-blue-300">Player 1:</span> W/S keys
              </div>
              <div className="text-sm text-gray-300">
                <span className="font-semibold text-blue-300">Player 2:</span> ↑/↓ arrow keys
              </div>
            </div>
          )}
          {mobile && (
            <div className="text-sm text-gray-300 text-center">
              Use the on-screen controls to move your paddles
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
