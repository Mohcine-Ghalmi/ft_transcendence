"use client";
import React, { useRef, useEffect, useState } from "react";

const GAME_WIDTH = 700;
const GAME_HEIGHT = 400;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 14;
const PADDLE_SPEED = 7;
const BALL_SPEED = 6;

const PingPongGame: React.FC<PingPongGameProps> = ({ player1, player2, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Paddle positions: player1 left, player2 right
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [running, setRunning] = useState(true);

  const paddle1Y = useRef<number>(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const paddle2Y = useRef<number>(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const ball = useRef({
    x: GAME_WIDTH / 2 - BALL_SIZE / 2,
    y: GAME_HEIGHT / 2 - BALL_SIZE / 2,
    dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    dy: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
  });

  const keys = useRef<{[key: string]: boolean}>({});

  // Control mapping: WASD, Arrows
  useEffect(() => {
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
  }, []);

  // Main game loop
  useEffect(() => {
    if (!running) return;
    let animation: number;

    const draw = () => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      // Background
      ctx.fillStyle = "#222833";
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      // Mid line
      ctx.setLineDash([8, 16]);
      ctx.strokeStyle = "#BFD6ED";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(GAME_WIDTH/2, 0);
      ctx.lineTo(GAME_WIDTH/2, GAME_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);
      // Paddles
      ctx.fillStyle = "#BFD6ED";
      ctx.fillRect(0, paddle1Y.current, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillRect(GAME_WIDTH - PADDLE_WIDTH, paddle2Y.current, PADDLE_WIDTH, PADDLE_HEIGHT);
      // Ball
      ctx.fillStyle = "#F7B32B";
      ctx.fillRect(ball.current.x, ball.current.y, BALL_SIZE, BALL_SIZE);
      // Names
      ctx.font = "20px Arial";
      ctx.fillStyle = "#fff";
      ctx.fillText(player1.name, 24, 32);
      ctx.fillText(player2.name, GAME_WIDTH-ctx.measureText(player2.name).width-24, 32);
      // Scores
      ctx.font = "36px Arial";
      ctx.fillText(String(scores.p1), GAME_WIDTH/2-48, 48);
      ctx.fillText(String(scores.p2), GAME_WIDTH/2+24, 48);
    };

    const update = () => {
      // Move paddles
      if (keys.current["w"] && paddle1Y.current > 0) paddle1Y.current -= PADDLE_SPEED;
      if (keys.current["s"] && paddle1Y.current < GAME_HEIGHT-PADDLE_HEIGHT) paddle1Y.current += PADDLE_SPEED;
      if ((keys.current["arrowup"] || keys.current["↑"]) && paddle2Y.current > 0) paddle2Y.current -= PADDLE_SPEED;
      if ((keys.current["arrowdown"] || keys.current["↓"]) && paddle2Y.current < GAME_HEIGHT-PADDLE_HEIGHT) paddle2Y.current += PADDLE_SPEED;
      // Ball movement
      ball.current.x += ball.current.dx;
      ball.current.y += ball.current.dy;
      // Wall collision
      if (ball.current.y <= 0 || ball.current.y+BALL_SIZE >= GAME_HEIGHT) {
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
      update();
      draw();
      animation = requestAnimationFrame(loop);
    };

    loop();
    return () => {
      cancelAnimationFrame(animation);
    };
  }, [player1, player2, running, scores]);

  // Win condition: First to 5
  useEffect(() => {
    if (scores.p1 >= 5 || scores.p2 >= 5) {
      setRunning(false);
    }
  }, [scores]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex w-full justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <img src={player1.avatar} alt={player1.name} className="w-10 h-10 rounded-full border-2 border-[#BFD6ED]" />
          <span className="font-bold">{player1.name}</span>
        </div>
        <span className="text-lg font-semibold text-white">Ping Pong: First to 5</span>
        <div className="flex items-center gap-3">
          <span className="font-bold">{player2.name}</span>
          <img src={player2.avatar} alt={player2.name} className="w-10 h-10 rounded-full border-2 border-[#BFD6ED]" />
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="border-2 border-blue-300 rounded bg-[#222833] shadow-2xl max-w-full"
        style={{ width: "100%", maxWidth: GAME_WIDTH }}
      />
      <div className="flex justify-between w-full mt-4 px-4">
        <div className="space-y-1">
          <div className="font-mono text-sm text-blue-100">Player 1 (Left): <span className="font-bold">W/S — Move Up/Down</span></div>
        </div>
        <div className="space-y-1">
          <div className="font-mono text-sm text-blue-100">Player 2 (Right): <span className="font-bold">↑/↓ — Move Up/Down</span></div>
        </div>
      </div>
      <button
        className="mt-8 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
        onClick={onExit}
      >
        Exit Game
      </button>
      {!running && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center z-20">
          <h2 className="text-3xl font-bold mb-4 text-white">
            {scores.p1 > scores.p2 ? `${player1.name} Wins! 🏆` : `${player2.name} Wins! 🏆`}
          </h2>
          <button
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            onClick={onExit}
          >
            Back to Lobby
          </button>
        </div>
      )}
    </div>
  );
};

export default PingPongGame;
