module.exports = {

"[project]/src/app/(main)/play/tournament/LocalTournament.jsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trophy.js [app-ssr] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-ssr] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-ssr] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/crown.js [app-ssr] (ecmascript) <export default as Crown>");
;
;
;
// Your existing PingPongGame component code (simplified for demo)
const PingPongGame = ({ player1, player2, onGameEnd, onExit })=>{
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [scores, setScores] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        p1: 0,
        p2: 0
    });
    const [gameStarted, setGameStarted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [paused, setPaused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [gameTime, setGameTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        minutes: 0,
        seconds: 0
    });
    // Simplified game constants
    const GAME_WIDTH = 800;
    const GAME_HEIGHT = 400;
    const PADDLE_WIDTH = 12;
    const PADDLE_HEIGHT = 80;
    const BALL_SIZE = 12;
    const PADDLE_SPEED = 6;
    const BALL_SPEED = 5;
    const paddle1Y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    const paddle2Y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    const ball = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT / 2,
        dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
        dy: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1)
    });
    const keys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({});
    // Game timer
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let interval;
        if (gameStarted && !paused) {
            interval = setInterval(()=>{
                setGameTime((prev)=>{
                    const newSeconds = prev.seconds + 1;
                    if (newSeconds >= 60) {
                        return {
                            minutes: prev.minutes + 1,
                            seconds: 0
                        };
                    }
                    return {
                        ...prev,
                        seconds: newSeconds
                    };
                });
            }, 1000);
        }
        return ()=>clearInterval(interval);
    }, [
        gameStarted,
        paused
    ]);
    // Keyboard controls
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const downHandler = (e)=>{
            keys.current[e.key.toLowerCase()] = true;
        };
        const upHandler = (e)=>{
            keys.current[e.key.toLowerCase()] = false;
        };
        window.addEventListener("keydown", downHandler);
        window.addEventListener("keyup", upHandler);
        return ()=>{
            window.removeEventListener("keydown", downHandler);
            window.removeEventListener("keyup", upHandler);
        };
    }, []);
    // Game loop
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!gameStarted || paused) return;
        let animation;
        const draw = ()=>{
            const ctx = canvasRef.current?.getContext("2d");
            if (!ctx) return;
            // Clear canvas
            ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            // Background
            ctx.fillStyle = "#1a1a2e";
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            // Center line
            ctx.strokeStyle = "rgba(255,255,255,0.3)";
            ctx.setLineDash([
                5,
                5
            ]);
            ctx.beginPath();
            ctx.moveTo(GAME_WIDTH / 2, 0);
            ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
            ctx.stroke();
            ctx.setLineDash([]);
            // Paddles
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(20, paddle1Y.current, PADDLE_WIDTH, PADDLE_HEIGHT);
            ctx.fillRect(GAME_WIDTH - 32, paddle2Y.current, PADDLE_WIDTH, PADDLE_HEIGHT);
            // Ball
            ctx.beginPath();
            ctx.arc(ball.current.x, ball.current.y, BALL_SIZE / 2, 0, Math.PI * 2);
            ctx.fill();
        };
        const update = ()=>{
            // Paddle movement
            if (keys.current["w"] && paddle1Y.current > 0) paddle1Y.current -= PADDLE_SPEED;
            if (keys.current["s"] && paddle1Y.current < GAME_HEIGHT - PADDLE_HEIGHT) paddle1Y.current += PADDLE_SPEED;
            if (keys.current["arrowup"] && paddle2Y.current > 0) paddle2Y.current -= PADDLE_SPEED;
            if (keys.current["arrowdown"] && paddle2Y.current < GAME_HEIGHT - PADDLE_HEIGHT) paddle2Y.current += PADDLE_SPEED;
            // Ball movement
            ball.current.x += ball.current.dx;
            ball.current.y += ball.current.dy;
            // Wall collision
            if (ball.current.y <= BALL_SIZE / 2 || ball.current.y >= GAME_HEIGHT - BALL_SIZE / 2) {
                ball.current.dy *= -1;
            }
            // Paddle collision
            if (ball.current.x <= 32 + BALL_SIZE / 2 && ball.current.y >= paddle1Y.current && ball.current.y <= paddle1Y.current + PADDLE_HEIGHT) {
                ball.current.dx = Math.abs(ball.current.dx);
            }
            if (ball.current.x >= GAME_WIDTH - 32 - BALL_SIZE / 2 && ball.current.y >= paddle2Y.current && ball.current.y <= paddle2Y.current + PADDLE_HEIGHT) {
                ball.current.dx = -Math.abs(ball.current.dx);
            }
            // Scoring
            if (ball.current.x < 0) {
                setScores((s)=>({
                        ...s,
                        p2: s.p2 + 1
                    }));
                resetBall();
            } else if (ball.current.x > GAME_WIDTH) {
                setScores((s)=>({
                        ...s,
                        p1: s.p1 + 1
                    }));
                resetBall();
            }
        };
        const resetBall = ()=>{
            ball.current.x = GAME_WIDTH / 2;
            ball.current.y = GAME_HEIGHT / 2;
            ball.current.dx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
            ball.current.dy = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
        };
        const loop = ()=>{
            update();
            draw();
            animation = requestAnimationFrame(loop);
        };
        loop();
        return ()=>cancelAnimationFrame(animation);
    }, [
        gameStarted,
        paused
    ]);
    // Win condition check
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (scores.p1 >= 7 || scores.p2 >= 7) {
            const winner = scores.p1 >= 7 ? player1 : player2;
            const loser = scores.p1 >= 7 ? player2 : player1;
            onGameEnd(winner, loser, scores, gameTime);
        }
    }, [
        scores,
        player1,
        player2,
        onGameEnd,
        gameTime
    ]);
    const handleStart = ()=>{
        setScores({
            p1: 0,
            p2: 0
        });
        setGameTime({
            minutes: 0,
            seconds: 0
        });
        paddle1Y.current = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
        paddle2Y.current = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
        ball.current.x = GAME_WIDTH / 2;
        ball.current.y = GAME_HEIGHT / 2;
        ball.current.dx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
        ball.current.dy = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
        setGameStarted(true);
        setPaused(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-gray-900 min-h-screen flex flex-col",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex-1 flex items-center justify-center p-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gray-800 rounded-lg p-6 shadow-2xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-4 flex justify-between items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: player1.avatar,
                                                alt: player1.name,
                                                className: "w-12 h-12 rounded-full mb-2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                lineNumber: 186,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-white font-bold",
                                                children: player1.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                lineNumber: 187,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-2xl font-bold text-blue-400",
                                                children: scores.p1
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                lineNumber: 188,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                        lineNumber: 185,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-white text-xl",
                                        children: "VS"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                        lineNumber: 190,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: player2.avatar,
                                                alt: player2.name,
                                                className: "w-12 h-12 rounded-full mb-2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                lineNumber: 192,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-white font-bold",
                                                children: player2.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                lineNumber: 193,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-2xl font-bold text-red-400",
                                                children: scores.p2
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                lineNumber: 194,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                        lineNumber: 191,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                lineNumber: 184,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-white",
                                children: [
                                    String(gameTime.minutes).padStart(2, '0'),
                                    ":",
                                    String(gameTime.seconds).padStart(2, '0')
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                lineNumber: 197,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                        lineNumber: 183,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                                ref: canvasRef,
                                width: GAME_WIDTH,
                                height: GAME_HEIGHT,
                                className: "border border-gray-700 rounded"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                lineNumber: 204,
                                columnNumber: 13
                            }, this),
                            !gameStarted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleStart,
                                    className: "bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-xl flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                            size: 24
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                            lineNumber: 217,
                                            columnNumber: 19
                                        }, this),
                                        "Start Game"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                    lineNumber: 213,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                lineNumber: 212,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                        lineNumber: 203,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 text-center text-gray-400 text-sm",
                        children: "Player 1: W/S keys | Player 2: Arrow keys"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                        lineNumber: 225,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-4 flex justify-center gap-4",
                        children: [
                            gameStarted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setPaused(!paused),
                                className: "bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded",
                                children: paused ? 'Resume' : 'Pause'
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                lineNumber: 232,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onExit,
                                className: "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded",
                                children: "Exit to Tournament"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                lineNumber: 239,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                        lineNumber: 230,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                lineNumber: 181,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
            lineNumber: 180,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
        lineNumber: 179,
        columnNumber: 5
    }, this);
};
// Tournament System Component
const TournamentSystem = ()=>{
    const [currentView, setCurrentView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('setup'); // 'setup', 'bracket', 'game', 'final'
    const [tournament, setTournament] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentMatch, setCurrentMatch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [gameHistory, setGameHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    // Sample players (you can replace with your actual player data)
    const samplePlayers = [
        {
            id: 1,
            name: "Alex Johnson",
            nickname: "alexj",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 2,
            name: "Maria Garcia",
            nickname: "mariag",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b05b?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 3,
            name: "James Wilson",
            nickname: "jwilson",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 4,
            name: "Sarah Davis",
            nickname: "sarahd",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 5,
            name: "Mike Brown",
            nickname: "mikeb",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 6,
            name: "Lisa Zhang",
            nickname: "lisaz",
            avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 7,
            name: "David Lee",
            nickname: "davidl",
            avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: 8,
            name: "Emma Taylor",
            nickname: "emmat",
            avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face"
        }
    ];
    const [selectedPlayers, setSelectedPlayers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const createTournament = (players)=>{
        if (players.length < 2) return null;
        // Ensure we have a power of 2 number of players for clean brackets
        const numPlayers = players.length;
        const rounds = Math.ceil(Math.log2(numPlayers));
        return {
            players: [
                ...players
            ],
            rounds: rounds,
            currentRound: 1,
            matches: generateMatches(players),
            winners: [],
            champion: null
        };
    };
    const generateMatches = (players)=>{
        const matches = [];
        for(let i = 0; i < players.length; i += 2){
            if (i + 1 < players.length) {
                matches.push({
                    id: `match-${i / 2}`,
                    player1: players[i],
                    player2: players[i + 1],
                    winner: null,
                    completed: false,
                    round: 1
                });
            }
        }
        return matches;
    };
    const startTournament = ()=>{
        if (selectedPlayers.length < 2) {
            alert('Please select at least 2 players');
            return;
        }
        const newTournament = createTournament(selectedPlayers);
        setTournament(newTournament);
        setCurrentView('bracket');
    };
    const startMatch = (match)=>{
        setCurrentMatch(match);
        setCurrentView('game');
    };
    const handleGameEnd = (winner, loser, scores, gameTime)=>{
        const matchResult = {
            ...currentMatch,
            winner: winner,
            loser: loser,
            scores: scores,
            gameTime: gameTime,
            completed: true,
            timestamp: new Date()
        };
        // Add to game history
        setGameHistory((prev)=>[
                ...prev,
                matchResult
            ]);
        // Update tournament
        setTournament((prev)=>{
            const updatedMatches = prev.matches.map((match)=>match.id === currentMatch.id ? matchResult : match);
            const currentRoundMatches = updatedMatches.filter((m)=>m.round === prev.currentRound);
            const completedCurrentRound = currentRoundMatches.every((m)=>m.completed);
            if (completedCurrentRound) {
                const winners = currentRoundMatches.map((m)=>m.winner);
                if (winners.length === 1) {
                    // Tournament is complete
                    return {
                        ...prev,
                        matches: updatedMatches,
                        champion: winners[0],
                        winners: [
                            ...prev.winners,
                            ...winners
                        ]
                    };
                } else {
                    // Create next round
                    const nextRoundMatches = [];
                    for(let i = 0; i < winners.length; i += 2){
                        if (i + 1 < winners.length) {
                            nextRoundMatches.push({
                                id: `match-r${prev.currentRound + 1}-${i / 2}`,
                                player1: winners[i],
                                player2: winners[i + 1],
                                winner: null,
                                completed: false,
                                round: prev.currentRound + 1
                            });
                        }
                    }
                    return {
                        ...prev,
                        matches: [
                            ...updatedMatches,
                            ...nextRoundMatches
                        ],
                        currentRound: prev.currentRound + 1,
                        winners: [
                            ...prev.winners,
                            ...winners
                        ]
                    };
                }
            }
            return {
                ...prev,
                matches: updatedMatches
            };
        });
        setCurrentView('bracket');
    };
    const resetTournament = ()=>{
        setTournament(null);
        setCurrentMatch(null);
        setGameHistory([]);
        setSelectedPlayers([]);
        setCurrentView('setup');
    };
    if (currentView === 'game' && currentMatch) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PingPongGame, {
            player1: currentMatch.player1,
            player2: currentMatch.player2,
            onGameEnd: handleGameEnd,
            onExit: ()=>setCurrentView('bracket')
        }, void 0, false, {
            fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
            lineNumber: 401,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-gray-900 min-h-screen text-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "bg-gray-800 p-4 shadow-lg",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-6xl mx-auto flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
                                    className: "text-yellow-500",
                                    size: 32
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                    lineNumber: 416,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-2xl font-bold",
                                    children: "Ping Pong Tournament"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                    lineNumber: 417,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                            lineNumber: 415,
                            columnNumber: 11
                        }, this),
                        tournament && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: resetTournament,
                            className: "bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors",
                            children: "Reset Tournament"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                            lineNumber: 420,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                    lineNumber: 414,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                lineNumber: 413,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-6xl mx-auto p-6",
                children: [
                    currentView === 'setup' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-3xl font-bold mb-2",
                                        children: "Setup Tournament"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                        lineNumber: 434,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-400",
                                        children: "Select players to participate in the tournament"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                        lineNumber: 435,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                lineNumber: 433,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
                                children: samplePlayers.map((player)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedPlayers.some((p)=>p.id === player.id) ? 'border-blue-500 bg-blue-500/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`,
                                        onClick: ()=>{
                                            if (selectedPlayers.some((p)=>p.id === player.id)) {
                                                setSelectedPlayers((prev)=>prev.filter((p)=>p.id !== player.id));
                                            } else {
                                                setSelectedPlayers((prev)=>[
                                                        ...prev,
                                                        player
                                                    ]);
                                            }
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: player.avatar,
                                                alt: player.name,
                                                className: "w-16 h-16 rounded-full mx-auto mb-3"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                lineNumber: 455,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "font-bold text-center",
                                                children: player.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                lineNumber: 456,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-gray-400 text-center text-sm",
                                                children: [
                                                    "@",
                                                    player.nickname
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                lineNumber: 457,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, player.id, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                        lineNumber: 440,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                lineNumber: 438,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mb-4 text-gray-400",
                                        children: [
                                            "Selected: ",
                                            selectedPlayers.length,
                                            " players"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                        lineNumber: 463,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: startTournament,
                                        disabled: selectedPlayers.length < 2,
                                        className: "bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-8 py-3 rounded-lg font-bold text-lg transition-colors flex items-center gap-2 mx-auto",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                size: 20
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                lineNumber: 471,
                                                columnNumber: 17
                                            }, this),
                                            "Start Tournament"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                        lineNumber: 466,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                lineNumber: 462,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                        lineNumber: 432,
                        columnNumber: 11
                    }, this),
                    currentView === 'bracket' && tournament && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-3xl font-bold mb-2",
                                        children: "Tournament Bracket"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                        lineNumber: 481,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-400",
                                        children: [
                                            "Round ",
                                            tournament.currentRound
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                        lineNumber: 482,
                                        columnNumber: 15
                                    }, this),
                                    tournament.champion && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-4 p-6 bg-yellow-500/20 border border-yellow-500 rounded-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__["Crown"], {
                                                className: "text-yellow-500 mx-auto mb-2",
                                                size: 48
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                lineNumber: 485,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-2xl font-bold text-yellow-500",
                                                children: "Tournament Champion!"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                lineNumber: 486,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-center gap-3 mt-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: tournament.champion.avatar,
                                                        alt: tournament.champion.name,
                                                        className: "w-16 h-16 rounded-full"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                        lineNumber: 488,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-xl font-bold",
                                                                children: tournament.champion.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                                lineNumber: 490,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-gray-400",
                                                                children: [
                                                                    "@",
                                                                    tournament.champion.nickname
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                                lineNumber: 491,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                        lineNumber: 489,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                lineNumber: 487,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                        lineNumber: 484,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                lineNumber: 480,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4",
                                children: [
                                    ...Array(tournament.rounds)
                                ].map((_, roundIndex)=>{
                                    const roundNum = roundIndex + 1;
                                    const roundMatches = tournament.matches.filter((m)=>m.round === roundNum);
                                    if (roundMatches.length === 0) return null;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-gray-800 p-4 rounded-lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-xl font-bold mb-4 text-center",
                                                children: roundNum === tournament.rounds ? 'Final' : `Round ${roundNum}`
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                lineNumber: 507,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
                                                children: roundMatches.map((match)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "bg-gray-700 p-4 rounded-lg",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center justify-between mb-3",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                                src: match.player1.avatar,
                                                                                alt: match.player1.name,
                                                                                className: "w-8 h-8 rounded-full"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                                                lineNumber: 515,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: match.winner?.id === match.player1.id ? 'font-bold text-green-400' : '',
                                                                                children: match.player1.name
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                                                lineNumber: 516,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                                        lineNumber: 514,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    match.completed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-sm font-mono",
                                                                        children: [
                                                                            match.scores?.p1,
                                                                            " - ",
                                                                            match.scores?.p2
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                                        lineNumber: 519,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                                lineNumber: 513,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: `text-center text-gray-400 mb-3 ${match.winner ? 'text-green-400' : ''}`,
                                                                children: match.completed ? '✓' : 'VS'
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                                lineNumber: 524,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center justify-between mb-3",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-center gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                            src: match.player2.avatar,
                                                                            alt: match.player2.name,
                                                                            className: "w-8 h-8 rounded-full"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                                            lineNumber: 529,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: match.winner?.id === match.player2.id ? 'font-bold text-green-400' : '',
                                                                            children: match.player2.name
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                                            lineNumber: 530,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                                    lineNumber: 528,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                                lineNumber: 527,
                                                                columnNumber: 27
                                                            }, this),
                                                            !match.completed && roundNum === tournament.currentRound && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                onClick: ()=>startMatch(match),
                                                                className: "w-full bg-blue-600 hover:bg-blue-700 py-2 rounded transition-colors flex items-center justify-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                                                        size: 16
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                                        lineNumber: 538,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    "Play Match"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                                lineNumber: 534,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, match.id, true, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                        lineNumber: 512,
                                                        columnNumber: 25
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                lineNumber: 510,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, roundNum, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                        lineNumber: 506,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                lineNumber: 498,
                                columnNumber: 13
                            }, this),
                            gameHistory.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-gray-800 p-4 rounded-lg",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-bold mb-4",
                                        children: "Match History"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                        lineNumber: 552,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2",
                                        children: gameHistory.map((game, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-gray-700 p-3 rounded flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                src: game.winner.avatar,
                                                                alt: game.winner.name,
                                                                className: "w-8 h-8 rounded-full"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                                lineNumber: 557,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "font-bold text-green-400",
                                                                children: game.winner.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                                lineNumber: 558,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-gray-400",
                                                                children: "defeated"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                                lineNumber: 559,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                src: game.loser.avatar,
                                                                alt: game.loser.name,
                                                                className: "w-8 h-8 rounded-full"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                                lineNumber: 560,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: game.loser.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                                lineNumber: 561,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                        lineNumber: 556,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm text-gray-400",
                                                        children: [
                                                            game.scores.p1,
                                                            " - ",
                                                            game.scores.p2,
                                                            " | ",
                                                            game.gameTime.minutes,
                                                            ":",
                                                            String(game.gameTime.seconds).padStart(2, '0')
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                        lineNumber: 563,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, index, true, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                                lineNumber: 555,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                        lineNumber: 553,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                                lineNumber: 551,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                        lineNumber: 479,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
                lineNumber: 430,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.jsx",
        lineNumber: 411,
        columnNumber: 5
    }, this);
};
const __TURBOPACK__default__export__ = TournamentSystem;
}}),
"[project]/src/app/(main)/play/tournament/TournamentBracket.jsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "DesktopBracket": (()=>DesktopBracket),
    "MobileBracket": (()=>MobileBracket),
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/mockData.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function MobileBracket({ rounds, currentRound, getMatch, getMatchStateStyle, participants, getPlayerStyle, getPlayerBgStyle, simulateMatch, tournamentSize }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center mt-4 p-2 bg-gray-800/80 rounded-lg border border-gray-700 w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-white text-xl mb-3 text-center",
                children: "Tournament Bracket"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-white text-sm mb-2",
                children: [
                    "Current Round: ",
                    currentRound + 1
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col w-full space-y-4",
                children: Array.from({
                    length: rounds
                }).map((_, roundIndex)=>{
                    const matchesInRound = tournamentSize / Math.pow(2, roundIndex + 1);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-indigo-300 text-sm font-medium mb-2 pl-1",
                                children: roundIndex === rounds - 1 ? "Final" : roundIndex === rounds - 2 ? "Semi Finals" : `Round ${roundIndex + 1}`
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                lineNumber: 30,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col space-y-3",
                                children: Array.from({
                                    length: matchesInRound
                                }).map((_, matchIndex)=>{
                                    const match = getMatch(roundIndex, matchIndex);
                                    const matchStateClass = match ? getMatchStateStyle(match.state) : "border-green-400/50 bg-gray-700/50";
                                    const isCurrentRound = roundIndex === currentRound;
                                    // Get players for this match
                                    let player1, player2;
                                    if (roundIndex === 0) {
                                        // First round pulls directly from participants
                                        const player1Index = matchIndex * 2;
                                        const player2Index = player1Index + 1;
                                        player1 = player1Index < participants.length ? participants[player1Index] : null;
                                        player2 = player2Index < participants.length ? participants[player2Index] : null;
                                    } else {
                                        // Look for winners from previous round
                                        const prevRound = roundIndex - 1;
                                        const prevMatchIndex1 = matchIndex * 2;
                                        const prevMatchIndex2 = prevMatchIndex1 + 1;
                                        const prevMatch1 = getMatch(prevRound, prevMatchIndex1);
                                        const prevMatch2 = getMatch(prevRound, prevMatchIndex2);
                                        if (prevMatch1 && prevMatch1.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN) {
                                            player1 = prevMatch1.player1;
                                        } else if (prevMatch1 && prevMatch1.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN) {
                                            player1 = prevMatch1.player2;
                                        }
                                        if (prevMatch2 && prevMatch2.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN) {
                                            player2 = prevMatch2.player1;
                                        } else if (prevMatch2 && prevMatch2.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN) {
                                            player2 = prevMatch2.player2;
                                        }
                                    }
                                    const player1Style = match ? getPlayerStyle(match, true) : "text-gray-300";
                                    const player2Style = match ? getPlayerStyle(match, false) : "text-gray-300";
                                    const player1BgStyle = match ? getPlayerBgStyle(match, true) : "";
                                    const player2BgStyle = match ? getPlayerBgStyle(match, false) : "";
                                    const player1BorderColor = player1BgStyle.includes("bg-") ? player1BgStyle.replace("bg-", "border-") : "border-green-400/50";
                                    const player2BorderColor = player2BgStyle.includes("bg-") ? player2BgStyle.replace("bg-", "border-") : "border-green-400/50";
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `flex flex-col ${matchStateClass} rounded overflow-hidden ${isCurrentRound ? 'hover:brightness-110 transition-all cursor-pointer' : ''}`,
                                        onClick: ()=>isCurrentRound && simulateMatch(roundIndex, matchIndex),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-black text-gray-300 text-xs font-medium px-2 py-1 border-b border-gray-700",
                                                children: [
                                                    "Match ",
                                                    matchIndex + 1
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                                lineNumber: 94,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `py-2 px-3 border-b ${player1BorderColor} ${player1BgStyle}`,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `text-sm font-medium truncate ${player1Style}`,
                                                            children: player1 ? player1.login : "TBD"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                                            lineNumber: 103,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                                        lineNumber: 100,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-px bg-gray-600 w-full"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                                        lineNumber: 107,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `py-2 px-3 ${player2BorderColor} ${player2BgStyle}`,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `text-sm font-medium truncate ${player2Style}`,
                                                            children: player2 ? player2.login : "TBD"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                                            lineNumber: 111,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                                        lineNumber: 108,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                                lineNumber: 99,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, `match-${roundIndex}-${matchIndex}`, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                        lineNumber: 88,
                                        columnNumber: 21
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                lineNumber: 36,
                                columnNumber: 15
                            }, this)
                        ]
                    }, `round-${roundIndex}`, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                        lineNumber: 29,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center justify-center mt-4 text-xs space-x-2 space-y-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center mt-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-3 h-3 rounded-full bg-gray-400 mr-1"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                lineNumber: 128,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-gray-300",
                                children: "Waiting"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                lineNumber: 129,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                        lineNumber: 127,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-3 h-3 rounded-full bg-yellow-400 mr-1"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                lineNumber: 132,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-yellow-300",
                                children: "In Progress"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                lineNumber: 133,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                        lineNumber: 131,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-3 h-3 rounded-full bg-green-400 mr-1"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                lineNumber: 136,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-green-300",
                                children: "Winner"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                lineNumber: 137,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                        lineNumber: 135,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-3 h-3 rounded-full bg-red-400 mr-1"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                lineNumber: 140,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-red-300",
                                children: "Eliminated"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                lineNumber: 141,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                        lineNumber: 139,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                lineNumber: 126,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-gray-400 text-xs mt-2",
                children: "Click on a match to simulate the game"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                lineNumber: 145,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
function DesktopBracket({ currentRound, bracketHeight, rounds, roundWidth, tournamentSize, participants, getMatch, getMatchStateStyle, getPlayerStyle, getPlayerBgStyle, simulateMatch, matchHeight }) {
    // Increase match height for better visibility
    const adjustedMatchHeight = matchHeight * 1.5;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center mt-4 p-4 bg-gray-800/80 rounded-lg border border-gray-700 overflow-x-auto w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-white text-xl md:text-2xl mb-3 text-center",
                children: "Tournament Bracket"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                lineNumber: 170,
                columnNumber: 11
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-white text-sm mb-2",
                children: [
                    "Current Round: ",
                    currentRound + 1
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                lineNumber: 171,
                columnNumber: 11
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative min-w-full",
                style: {
                    height: `${bracketHeight * 1.5}px`,
                    minWidth: `${(rounds * 2 + 1) * roundWidth}px`
                },
                children: [
                    Array.from({
                        length: rounds
                    }).map((_, roundIndex)=>{
                        const matchesInRound = tournamentSize / Math.pow(2, roundIndex + 1);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute top-0 bottom-0 flex flex-col justify-around",
                            style: {
                                left: `${roundIndex * roundWidth}px`,
                                width: `${roundWidth - 20}px`
                            },
                            children: Array.from({
                                length: matchesInRound / 2
                            }).map((_, matchIndex)=>{
                                const actualMatchIndex = matchIndex;
                                const match = getMatch(roundIndex, actualMatchIndex);
                                const matchStateClass = match ? getMatchStateStyle(match.state) : "border-indigo-400/50 bg-gray-700/50";
                                const isCurrentRound = roundIndex === currentRound;
                                // Get players for this match
                                let player1, player2;
                                if (roundIndex === 0) {
                                    // First round pulls directly from participants
                                    const player1Index = matchIndex * 2;
                                    const player2Index = player1Index + 1;
                                    player1 = player1Index < participants.length ? participants[player1Index] : null;
                                    player2 = player2Index < participants.length ? participants[player2Index] : null;
                                } else {
                                    // Look for winners from previous round
                                    const prevRound = roundIndex - 1;
                                    const prevMatchIndex1 = matchIndex * 2;
                                    const prevMatchIndex2 = prevMatchIndex1 + 1;
                                    const prevMatch1 = getMatch(prevRound, prevMatchIndex1);
                                    const prevMatch2 = getMatch(prevRound, prevMatchIndex2);
                                    if (prevMatch1 && prevMatch1.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN) {
                                        player1 = prevMatch1.player1;
                                    } else if (prevMatch1 && prevMatch1.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN) {
                                        player1 = prevMatch1.player2;
                                    }
                                    if (prevMatch2 && prevMatch2.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN) {
                                        player2 = prevMatch2.player1;
                                    } else if (prevMatch2 && prevMatch2.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN) {
                                        player2 = prevMatch2.player2;
                                    }
                                }
                                player1 = match && match.player1 ? match.player1 : player1;
                                player2 = match && match.player2 ? match.player2 : player2;
                                const player1Style = match ? getPlayerStyle(match, true) : "text-gray-300";
                                const player2Style = match ? getPlayerStyle(match, false) : "text-gray-300";
                                const player1BgStyle = match ? getPlayerBgStyle(match, true) : "";
                                const player2BgStyle = match ? getPlayerBgStyle(match, false) : "";
                                const player1BorderColor = player1BgStyle.includes("bg-") ? player1BgStyle.replace("bg-", "border-") : "border-indigo-400/50";
                                const player2BorderColor = player2BgStyle.includes("bg-") ? player2BgStyle.replace("bg-", "border-") : "border-indigo-400/50";
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `${matchStateClass} mb-6 rounded-lg shadow-lg overflow-hidden ${isCurrentRound ? 'hover:brightness-110 cursor-pointer transform hover:scale-105 transition-transform' : ''}`,
                                    onClick: ()=>isCurrentRound && simulateMatch(roundIndex, actualMatchIndex),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-black text-gray-300 text-xs font-medium px-2 py-1 border-b border-gray-700",
                                            children: [
                                                "Match ",
                                                matchIndex + 1
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                            lineNumber: 246,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `p-2 ${player1BgStyle} border-b border-gray-600`,
                                            style: {
                                                minHeight: `${adjustedMatchHeight / 2}px`
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `text-sm md:text-base truncate ${player1Style} font-medium`,
                                                children: player1 ? player1.login : "TBD"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                                lineNumber: 254,
                                                columnNumber: 27
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                            lineNumber: 250,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `p-2 ${player2BgStyle}`,
                                            style: {
                                                minHeight: `${adjustedMatchHeight / 2}px`
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `text-sm md:text-base truncate ${player2Style} font-medium`,
                                                children: player2 ? player2.login : "TBD"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                                lineNumber: 262,
                                                columnNumber: 27
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                            lineNumber: 258,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, matchIndex, true, {
                                    fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                    lineNumber: 240,
                                    columnNumber: 23
                                }, this);
                            })
                        }, `left-${roundIndex}`, false, {
                            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                            lineNumber: 179,
                            columnNumber: 17
                        }, this);
                    }),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-0 bottom-0 flex flex-col justify-center",
                        style: {
                            left: `${rounds * roundWidth}px`,
                            width: `${roundWidth}px`
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `shadow-lg ${getMatch(rounds - 1, 0) ? getMatchStateStyle(getMatch(rounds - 1, 0).state) : "border-yellow-400"} rounded-lg mx-1 overflow-hidden flex flex-col ${currentRound === rounds - 1 ? 'hover:brightness-110 cursor-pointer transform hover:scale-105 transition-transform' : ''}`,
                            onClick: ()=>currentRound === rounds - 1 && simulateMatch(rounds - 1, 0),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-yellow-400 text-sm md:text-lg text-center font-bold bg-black p-2 border-b border-yellow-500/50",
                                    children: "FINAL"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                    lineNumber: 285,
                                    columnNumber: 17
                                }, this),
                                (()=>{
                                    const finalMatch = getMatch(rounds - 1, 0);
                                    const player1 = finalMatch?.player1;
                                    const player2 = finalMatch?.player2;
                                    const player1Style = finalMatch ? getPlayerStyle(finalMatch, true) : "text-gray-300";
                                    const player2Style = finalMatch ? getPlayerStyle(finalMatch, false) : "text-gray-300";
                                    const player1BgStyle = finalMatch ? getPlayerBgStyle(finalMatch, true) : "";
                                    const player2BgStyle = finalMatch ? getPlayerBgStyle(finalMatch, false) : "";
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `p-3 ${player1BgStyle} border-b border-gray-600`,
                                                style: {
                                                    minHeight: `${adjustedMatchHeight / 2}px`
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `text-sm md:text-base text-center font-medium ${player1Style}`,
                                                    children: player1 ? player1.login : "TBD"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                                    lineNumber: 304,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                                lineNumber: 303,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `p-3 ${player2BgStyle}`,
                                                style: {
                                                    minHeight: `${adjustedMatchHeight / 2}px`
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `text-sm md:text-base text-center font-medium ${player2Style}`,
                                                    children: player2 ? player2.login : "TBD"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                                    lineNumber: 309,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                                lineNumber: 308,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true);
                                })(),
                                getMatch(rounds - 1, 0) && (getMatch(rounds - 1, 0).state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN || getMatch(rounds - 1, 0).state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-green-300 text-xs md:text-base border-t border-green-500/50 font-bold text-center p-2 bg-green-900/30",
                                    children: [
                                        "Champion: ",
                                        getMatch(rounds - 1, 0).state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN ? getMatch(rounds - 1, 0).player1?.login : getMatch(rounds - 1, 0).player2?.login
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                    lineNumber: 320,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                            lineNumber: 279,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                        lineNumber: 274,
                        columnNumber: 13
                    }, this),
                    Array.from({
                        length: rounds
                    }).map((_, roundIndex)=>{
                        const matchesInRound = tournamentSize / Math.pow(2, roundIndex + 1);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute top-0 bottom-0 flex flex-col justify-around",
                            style: {
                                left: `${rounds * 2 * roundWidth - roundIndex * roundWidth}px`,
                                width: `${roundWidth - 20}px`
                            },
                            children: Array.from({
                                length: matchesInRound / 2
                            }).map((_, matchIndex)=>{
                                // For the right side, we need to shift the matchIndex to the second half of matches in this round
                                const actualMatchIndex = matchIndex + matchesInRound / 2;
                                const match = getMatch(roundIndex, actualMatchIndex);
                                const matchStateClass = match ? getMatchStateStyle(match.state) : "border-indigo-400/50 bg-gray-700/50";
                                const isCurrentRound = roundIndex === currentRound;
                                // Get players for this match
                                let player1, player2;
                                if (roundIndex === 0) {
                                    // First round pulls directly from participants
                                    const halfPoint = participants.length / 2;
                                    const player1Index = halfPoint + matchIndex * 2;
                                    const player2Index = player1Index + 1;
                                    player1 = player1Index < participants.length ? participants[player1Index] : null;
                                    player2 = player2Index < participants.length ? participants[player2Index] : null;
                                } else {
                                    // Look for winners from previous round (right side)
                                    const prevRound = roundIndex - 1;
                                    const prevMatchesPerHalf = matchesInRound;
                                    const prevMatchIndex1 = prevMatchesPerHalf / 2 + matchIndex * 2;
                                    const prevMatchIndex2 = prevMatchIndex1 + 1;
                                    const prevMatch1 = getMatch(prevRound, prevMatchIndex1);
                                    const prevMatch2 = getMatch(prevRound, prevMatchIndex2);
                                    if (prevMatch1 && prevMatch1.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN) {
                                        player1 = prevMatch1.player1;
                                    } else if (prevMatch1 && prevMatch1.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN) {
                                        player1 = prevMatch1.player2;
                                    }
                                    if (prevMatch2 && prevMatch2.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN) {
                                        player2 = prevMatch2.player1;
                                    } else if (prevMatch2 && prevMatch2.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN) {
                                        player2 = prevMatch2.player2;
                                    }
                                }
                                // Use match players if available
                                player1 = match && match.player1 ? match.player1 : player1;
                                player2 = match && match.player2 ? match.player2 : player2;
                                const player1Style = match ? getPlayerStyle(match, true) : "text-gray-300";
                                const player2Style = match ? getPlayerStyle(match, false) : "text-gray-300";
                                const player1BgStyle = match ? getPlayerBgStyle(match, true) : "";
                                const player2BgStyle = match ? getPlayerBgStyle(match, false) : "";
                                const player1BorderColor = player1BgStyle.includes("bg-") ? player1BgStyle.replace("bg-", "border-") : "border-indigo-400/50";
                                const player2BorderColor = player2BgStyle.includes("bg-") ? player2BgStyle.replace("bg-", "border-") : "border-indigo-400/50";
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `${matchStateClass} mb-6 rounded-lg shadow-lg overflow-hidden ${isCurrentRound ? 'hover:brightness-110 cursor-pointer transform hover:scale-105 transition-transform' : ''}`,
                                    onClick: ()=>isCurrentRound && simulateMatch(roundIndex, actualMatchIndex),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-black text-gray-300 text-xs font-medium px-2 py-1 border-b border-gray-700",
                                            children: [
                                                "Match ",
                                                actualMatchIndex + 1
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                            lineNumber: 405,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `p-2 ${player1BgStyle} border-b border-gray-600`,
                                            style: {
                                                minHeight: `${adjustedMatchHeight / 2}px`
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `text-sm md:text-base truncate ${player1Style} font-medium`,
                                                children: player1 ? player1.login : "TBD"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                                lineNumber: 413,
                                                columnNumber: 27
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                            lineNumber: 409,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `p-2 ${player2BgStyle}`,
                                            style: {
                                                minHeight: `${adjustedMatchHeight / 2}px`
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `text-sm md:text-base truncate ${player2Style} font-medium`,
                                                children: player2 ? player2.login : "TBD"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                                lineNumber: 421,
                                                columnNumber: 27
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                            lineNumber: 417,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, matchIndex, true, {
                                    fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                    lineNumber: 399,
                                    columnNumber: 23
                                }, this);
                            })
                        }, `right-${roundIndex}`, false, {
                            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                            lineNumber: 334,
                            columnNumber: 17
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                lineNumber: 173,
                columnNumber: 11
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center justify-center mt-6 text-xs md:text-sm space-x-4 space-y-2 md:space-y-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-4 h-4 rounded-full bg-gray-400 mr-2"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                lineNumber: 436,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-gray-300",
                                children: "Waiting"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                lineNumber: 437,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                        lineNumber: 435,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-4 h-4 rounded-full bg-yellow-400 mr-2"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                lineNumber: 440,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-yellow-300",
                                children: "In Progress"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                lineNumber: 441,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                        lineNumber: 439,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-4 h-4 rounded-full bg-green-400 mr-2"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                lineNumber: 444,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-green-300",
                                children: "Winner"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                lineNumber: 445,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                        lineNumber: 443,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-4 h-4 rounded-full bg-red-400 mr-2"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                lineNumber: 448,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-red-300",
                                children: "Eliminated"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                                lineNumber: 449,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                        lineNumber: 447,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                lineNumber: 434,
                columnNumber: 11
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-gray-400 text-sm mt-3",
                children: "Click on a match to simulate the game"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
                lineNumber: 453,
                columnNumber: 11
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
        lineNumber: 169,
        columnNumber: 9
    }, this);
}
// Ping Pong game simulation function
const playPingPongGame = (player1, player2)=>{
    if (!player1 || !player2) {
        return {
            winner: null,
            loser: null,
            score: {
                player1: 0,
                player2: 0
            }
        };
    }
    const maxPoints = 7;
    let player1Score = 0;
    let player2Score = 0;
    while(player1Score < maxPoints && player2Score < maxPoints || Math.abs(player1Score - player2Score) < 2){
        const rallyWinner = Math.random() > 0.5 ? 1 : 2;
        if (rallyWinner === 1) {
            player1Score++;
        } else {
            player2Score++;
        }
    }
    const winner = player1Score > player2Score ? player1 : player2;
    const loser = player1Score > player2Score ? player2 : player1;
    return {
        winner,
        loser,
        score: {
            player1: player1Score,
            player2: player2Score
        }
    };
};
const TournamentBracket = ({ participants, tournamentSize, matches, currentRound, onMatchUpdate })=>{
    const [windowWidth, setWindowWidth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : 1024);
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : false);
    const [isTablet, setIsTablet] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        "TURBOPACK unreachable";
        const handleResize = undefined;
    }, []);
    const validTournamentSize = (()=>{
        let size = 2;
        while(size < participants.length){
            size *= 2;
        }
        return size;
    })();
    const rounds = Math.log2(tournamentSize);
    const getSpacing = ()=>{
        if (windowWidth < 640) return {
            roundWidth: 80,
            matchHeight: 30,
            bracketHeight: rounds * 80
        };
        if (windowWidth < 768) return {
            roundWidth: 90,
            matchHeight: 32,
            bracketHeight: rounds * 90
        };
        if (windowWidth < 1024) return {
            roundWidth: 100,
            matchHeight: 35,
            bracketHeight: rounds * 100
        };
        return {
            roundWidth: 120,
            matchHeight: 40,
            bracketHeight: rounds * 120
        };
    };
    const { roundWidth, matchHeight, bracketHeight } = getSpacing();
    const getMatchStateStyle = (matchState)=>{
        switch(matchState){
            case __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].IN_PROGRESS:
                return "border-yellow-400 bg-yellow-900/30";
            case __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN:
                return "border-green-400 bg-green-900/30";
            case __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN:
                return "border-green-400 bg-green-900/30";
            default:
                return "border-indigo-400/50 bg-gray-700/50";
        }
    };
    const getPlayerStyle = (match, isPlayer1)=>{
        if (!match || !match.state) return "text-gray-300";
        const won = match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN && isPlayer1 || match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN && !isPlayer1;
        const lost = match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN && !isPlayer1 || match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN && isPlayer1;
        if (won) return "text-green-400 font-bold";
        if (lost) return "text-red-400 line-through";
        if (match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].IN_PROGRESS) return "text-yellow-300 italic";
        return "text-gray-300";
    };
    const getPlayerBgStyle = (match, isPlayer1)=>{
        if (!match || !match.state) return "";
        const won = match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN && isPlayer1 || match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN && !isPlayer1;
        const lost = match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN && !isPlayer1 || match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN && isPlayer1;
        if (won) return "bg-green-900/30";
        if (lost) return "bg-red-900/30 border-red-400";
        if (match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].IN_PROGRESS) return "bg-yellow-900/30 animate-pulse";
        return "bg-gray-700/30";
    };
    const getMatch = (roundIndex, matchIndex)=>{
        return matches.find((m)=>m.round === roundIndex && m.matchIndex === matchIndex);
    };
    // simulation to the match - we will wait for match result instead of setTimeout
    const simulateMatch = (roundIndex, matchIndex)=>{
        const match = getMatch(roundIndex, matchIndex);
        if (!match) return;
        console.log("P1: ", match.player1?.login, " VS P2:", match.player2?.login);
        if (match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN || match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN) return;
        if (!match.player1 || !match.player2) return;
        if (match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].WAITING) {
            onMatchUpdate(roundIndex, matchIndex, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].IN_PROGRESS);
            setTimeout(()=>{
                const gameResult = playPingPongGame(match.player1, match.player2);
                if (gameResult.winner === match.player1) onMatchUpdate(roundIndex, matchIndex, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN);
                else onMatchUpdate(roundIndex, matchIndex, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN);
                console.log(`Match result: ${gameResult.score.player1}-${gameResult.score.player2}`);
                console.log("winner => ", gameResult.winner.login);
            }, 3000);
        }
    };
    if (isMobile) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MobileBracket, {
            rounds: rounds,
            currentRound: currentRound,
            getMatch: getMatch,
            getMatchStateStyle: getMatchStateStyle,
            participants: participants,
            getPlayerStyle: getPlayerStyle,
            getPlayerBgStyle: getPlayerBgStyle,
            simulateMatch: simulateMatch,
            tournamentSize: validTournamentSize
        }, void 0, false, {
            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
            lineNumber: 616,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DesktopBracket, {
        currentRound: currentRound,
        bracketHeight: bracketHeight,
        rounds: rounds,
        roundWidth: roundWidth,
        tournamentSize: validTournamentSize,
        participants: participants,
        getMatch: getMatch,
        getMatchStateStyle: getMatchStateStyle,
        getPlayerStyle: getPlayerStyle,
        getPlayerBgStyle: getPlayerBgStyle,
        simulateMatch: simulateMatch,
        matchHeight: matchHeight
    }, void 0, false, {
        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.jsx",
        lineNumber: 631,
        columnNumber: 5
    }, this);
};
const __TURBOPACK__default__export__ = TournamentBracket;
}}),
"[project]/src/app/(main)/play/tournament/OnlineTournament.jsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>OnlineTournament)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/mockData.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$tournament$2f$TournamentBracket$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/play/tournament/TournamentBracket.jsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
const OnlinePlayMode = ({ onInvitePlayer, pendingInvites, sentInvites })=>{
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [friends, setFriends] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onlineFriends"]);
    // Filter online players based on search query
    const filteredPlayers = friends.filter((player)=>player.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    // Get button state for a player
    const getPlayerButtonState = (player)=>{
        if (pendingInvites.has(player.name)) {
            return {
                text: 'Pending...',
                disabled: true,
                color: 'bg-yellow-600'
            };
        }
        if (sentInvites.has(player.name)) {
            return {
                text: 'Invited',
                disabled: true,
                color: 'bg-blue-600'
            };
        }
        return {
            text: 'Invite',
            disabled: false,
            color: 'bg-green-600 hover:bg-green-500'
        };
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                className: "text-white text-sm font-medium mb-2",
                children: "Find Players"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                lineNumber: 31,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative mb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        placeholder: "Search by username...",
                        value: searchQuery,
                        onChange: (e)=>setSearchQuery(e.target.value),
                        className: "w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-1 focus:ring-indigo-500 border border-gray-600"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                        lineNumber: 33,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        xmlns: "http://www.w3.org/2000/svg",
                        className: "h-5 w-5 text-gray-400 absolute left-3 top-2.5",
                        viewBox: "0 0 20 20",
                        fill: "currentColor",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            fillRule: "evenodd",
                            d: "M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z",
                            clipRule: "evenodd"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                            lineNumber: 41,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                        lineNumber: 40,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-2 max-h-48 overflow-y-auto",
                children: filteredPlayers.length > 0 ? filteredPlayers.map((player)=>{
                    const buttonState = getPlayerButtonState(player);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between bg-gray-800 rounded-lg p-2 border border-gray-700",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-8 h-8 rounded-full overflow-hidden mr-2 border border-gray-500",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                            src: player.avatar,
                                            alt: player.name,
                                            width: 32,
                                            height: 32,
                                            className: "w-full h-full object-cover"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                            lineNumber: 52,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                        lineNumber: 51,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-white text-sm",
                                                children: player.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                                lineNumber: 61,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center text-xs",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `w-1.5 h-1.5 rounded-full mr-1 ${player.GameStatus === 'Available' ? 'bg-green-500' : player.GameStatus === 'In a match' ? 'bg-yellow-500' : 'bg-red-500'}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                                        lineNumber: 63,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: player.GameStatus === 'Available' ? 'text-green-400' : player.GameStatus === 'In a match' ? 'text-yellow-400' : 'text-red-400',
                                                        children: player.GameStatus
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                                        lineNumber: 67,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                                lineNumber: 62,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                        lineNumber: 60,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                lineNumber: 50,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>onInvitePlayer(player),
                                disabled: buttonState.disabled || player.GameStatus !== 'Available',
                                className: `px-3 py-1 rounded text-xs font-medium transition-colors ${player.GameStatus !== 'Available' ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : `${buttonState.color} text-white`}`,
                                children: player.GameStatus !== 'Available' ? 'Unavailable' : buttonState.text
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                lineNumber: 76,
                                columnNumber: 17
                            }, this)
                        ]
                    }, player.name, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                        lineNumber: 49,
                        columnNumber: 15
                    }, this);
                }) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center py-4 text-gray-400",
                    children: "No players found matching your search"
                }, void 0, false, {
                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                    lineNumber: 91,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                lineNumber: 44,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
};
function OnlineTournament() {
    const [tournamentState, setTournamentState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('setup'); // setup, lobby, in_progress
    const [tournamentName, setTournamentName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('Online Pong Championship');
    const [tournamentSize, setTournamentSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(4);
    const [tournamentCode, setTournamentCode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [currentRound, setCurrentRound] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [participants, setParticipants] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([
        {
            id: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["user"].nickname,
            login: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["user"].name,
            avatar: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["user"].avatar,
            nickname: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["user"].nickname,
            isHost: true
        }
    ]);
    const [matches, setMatches] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [sentInvites, setSentInvites] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Map());
    const [pendingInvites, setPendingInvites] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Map());
    const [tournamentComplete, setTournamentComplete] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [champion, setChampion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Generate tournament code when creating tournament
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (tournamentState === 'lobby' && !tournamentCode) {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            setTournamentCode(code);
        }
    }, [
        tournamentState,
        tournamentCode
    ]);
    // Handle match updates (simulation of play)
    const handleMatchUpdate = (roundIndex, matchIndex, newState)=>{
        setMatches((prevMatches)=>{
            const newMatches = [
                ...prevMatches
            ];
            const matchToUpdate = newMatches.find((m)=>m.round === roundIndex && m.matchIndex === matchIndex);
            if (matchToUpdate) {
                matchToUpdate.state = newState;
                // If the match is over, update the next round's match
                if (newState === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN || newState === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN) {
                    const nextRound = roundIndex + 1;
                    const nextMatchIndex = Math.floor(matchIndex / 2);
                    const isFirstMatch = matchIndex % 2 === 0;
                    const nextMatch = newMatches.find((m)=>m.round === nextRound && m.matchIndex === nextMatchIndex);
                    if (nextMatch) {
                        const winner = newState === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN ? matchToUpdate.player1 : matchToUpdate.player2;
                        if (isFirstMatch) {
                            nextMatch.player1 = winner;
                        } else {
                            nextMatch.player2 = winner;
                        }
                    }
                    // Check if this is the final match
                    if (roundIndex === Math.log2(tournamentSize) - 1) {
                        const winner = newState === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN ? matchToUpdate.player1 : matchToUpdate.player2;
                        setChampion(winner);
                        setTournamentComplete(true);
                    }
                    // Check if all matches in the current round are complete
                    const roundMatches = newMatches.filter((m)=>m.round === roundIndex);
                    const allMatchesComplete = roundMatches.every((m)=>m.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN || m.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN);
                    // Move to next round if all matches are complete
                    if (allMatchesComplete && nextRound < Math.log2(tournamentSize)) {
                        setCurrentRound(nextRound);
                    }
                }
            }
            return newMatches;
        });
    };
    // Start tournament logic
    const startTournament = ()=>{
        if (participants.length < 4) {
            alert('You need at least 4 players to start the tournament!');
            return;
        }
        // Initialize tournament bracket
        const initialMatches = [];
        const rounds = Math.log2(tournamentSize);
        // First round
        for(let i = 0; i < tournamentSize / 2; i++){
            const player1 = participants[i * 2] || null;
            const player2 = participants[i * 2 + 1] || null;
            initialMatches.push({
                round: 0,
                matchIndex: i,
                player1,
                player2,
                state: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].WAITING
            });
        }
        // Subsequent rounds
        for(let round = 1; round < rounds; round++){
            const matchesInRound = tournamentSize / Math.pow(2, round + 1);
            for(let match = 0; match < matchesInRound; match++){
                initialMatches.push({
                    round,
                    matchIndex: match,
                    player1: null,
                    player2: null,
                    state: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MATCH_STATES"].WAITING
                });
            }
        }
        setMatches(initialMatches);
        setTournamentState('in_progress');
    };
    // Invite a specific player to tournament
    const handleInvitePlayer = (player)=>{
        if (participants.length >= tournamentSize) {
            alert('Tournament is full!');
            return;
        }
        // Add to sent invites
        setSentInvites((prev)=>new Map(prev).set(player.name, {
                player,
                timestamp: Date.now()
            }));
        // Simulate invitation response after 2 seconds
        setTimeout(()=>{
            const accepted = Math.random() > 0.3; // 70% chance of acceptance
            if (accepted) {
                // Remove from sent invites and add player to participants
                setSentInvites((prev)=>{
                    const newMap = new Map(prev);
                    newMap.delete(player.name);
                    return newMap;
                });
                // Add player to participants
                setParticipants((prev)=>{
                    if (prev.some((p)=>p.nickname === player.nickname)) return prev;
                    return [
                        ...prev,
                        {
                            id: player.nickname,
                            login: player.name,
                            avatar: player.avatar,
                            nickname: player.nickname,
                            isHost: false
                        }
                    ];
                });
            } else {
                // Remove from sent invites
                setSentInvites((prev)=>{
                    const newMap = new Map(prev);
                    newMap.delete(player.name);
                    return newMap;
                });
                alert(`${player.name} declined the tournament invitation.`);
            }
        }, 2000);
    };
    // Leave tournament
    const leaveTournament = ()=>{
        setParticipants([
            {
                id: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["user"].nickname,
                login: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["user"].name,
                avatar: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["user"].avatar,
                nickname: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["user"].nickname,
                isHost: true
            }
        ]);
        setMatches([]);
        setCurrentRound(0);
        setTournamentState('setup');
        setTournamentCode('');
        setSentInvites(new Map());
        setPendingInvites(new Map());
        setTournamentComplete(false);
        setChampion(null);
    };
    // Remove participant (host only)
    const removeParticipant = (playerNickname)=>{
        if (playerNickname === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["user"].nickname) return; // Can't remove host
        setParticipants((prev)=>prev.filter((p)=>p.nickname !== playerNickname));
    };
    // Reset tournament
    const resetTournament = ()=>{
        leaveTournament();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-gray-800/70 rounded-xl p-4 backdrop-blur-sm border border-gray-700 max-w-7xl mx-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-2xl font-bold text-white mb-6 text-center",
                children: "Online Tournament Mode"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                lineNumber: 298,
                columnNumber: 7
            }, this),
            tournamentState === 'setup' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gray-800/80 rounded-lg p-5 border border-gray-700 shadow-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-white text-lg font-semibold mb-3",
                        children: "Create Tournament"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                        lineNumber: 305,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-white text-sm mb-1",
                                children: "Tournament Name"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                lineNumber: 307,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                value: tournamentName,
                                onChange: (e)=>setTournamentName(e.target.value),
                                className: "w-full bg-gray-700 text-white rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-600",
                                placeholder: "Enter tournament name"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                lineNumber: 308,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                        lineNumber: 306,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "block text-white text-sm mb-2",
                                children: "Tournament Size"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                lineNumber: 317,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-3 gap-2",
                                children: [
                                    4,
                                    8,
                                    16
                                ].map((size)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: `py-2 px-3 rounded-lg ${tournamentSize === size ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`,
                                        onClick: ()=>setTournamentSize(size),
                                        children: [
                                            size,
                                            " Players"
                                        ]
                                    }, size, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                        lineNumber: 320,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                lineNumber: 318,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                        lineNumber: 316,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setTournamentState('lobby'),
                        disabled: !tournamentName || tournamentName.trim().length == 0,
                        className: `w-full text-white font-medium rounded-lg py-2.5 transition-all ${tournamentName && tournamentName.trim().length != 0 ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110' : 'bg-gray-600 cursor-not-allowed'}`,
                        children: "Create Tournament"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                        lineNumber: 332,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                lineNumber: 304,
                columnNumber: 9
            }, this),
            tournamentState === 'lobby' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gray-800/80 rounded-lg border border-gray-700 shadow-lg overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-indigo-900/50 p-4 border-b border-indigo-500/30",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-white text-lg font-semibold",
                                        children: tournamentName
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                        lineNumber: 351,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "px-3 py-1 bg-green-600/70 rounded-full text-white text-xs font-medium",
                                        children: "Waiting for Players"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                        lineNumber: 352,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                lineNumber: 350,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-gray-300 text-sm",
                                        children: [
                                            "Players: ",
                                            participants.length,
                                            "/",
                                            tournamentSize
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                        lineNumber: 357,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-gray-300 text-sm",
                                        children: [
                                            "Code: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-mono font-bold",
                                                children: tournamentCode
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                                lineNumber: 361,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                        lineNumber: 360,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                lineNumber: 356,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                        lineNumber: 349,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                className: "text-white font-medium mb-3",
                                children: "Participants"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                lineNumber: 366,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 max-h-48 overflow-y-auto",
                                children: [
                                    participants.map((player, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between bg-gray-700 rounded-lg p-2 border border-gray-600",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-8 h-8 rounded-full overflow-hidden mr-2 border border-indigo-400/60",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                src: player.avatar || "/mghalmi.jpg",
                                                                alt: player.login,
                                                                width: 32,
                                                                height: 32,
                                                                className: "w-full h-full object-cover"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                                                lineNumber: 372,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                                            lineNumber: 371,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "truncate max-w-[100px]",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-white text-sm truncate",
                                                                    children: player.login
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                                                    lineNumber: 381,
                                                                    columnNumber: 23
                                                                }, this),
                                                                player.isHost && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-indigo-400 text-xs",
                                                                    children: "Host"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                                                    lineNumber: 383,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                                            lineNumber: 380,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                                    lineNumber: 370,
                                                    columnNumber: 19
                                                }, this),
                                                !player.isHost && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>removeParticipant(player.nickname),
                                                    className: "text-red-400 hover:text-red-300 p-1",
                                                    title: "Remove participant",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        xmlns: "http://www.w3.org/2000/svg",
                                                        className: "h-4 w-4",
                                                        viewBox: "0 0 24 24",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        strokeWidth: "2",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            strokeLinecap: "round",
                                                            strokeLinejoin: "round",
                                                            d: "M6 18L18 6M6 6l12 12"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                                            lineNumber: 394,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                                        lineNumber: 393,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                                    lineNumber: 388,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, index, true, {
                                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                            lineNumber: 369,
                                            columnNumber: 17
                                        }, this)),
                                    Array.from({
                                        length: tournamentSize - participants.length
                                    }).map((_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-center bg-gray-700/50 rounded-lg p-2 border border-gray-600 border-dashed",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-gray-400 text-sm",
                                                children: "Waiting..."
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                                lineNumber: 403,
                                                columnNumber: 19
                                            }, this)
                                        }, `empty-${index}`, false, {
                                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                            lineNumber: 402,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                lineNumber: 367,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(OnlinePlayMode, {
                                onInvitePlayer: handleInvitePlayer,
                                pendingInvites: pendingInvites,
                                sentInvites: sentInvites
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                lineNumber: 409,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between gap-3 mt-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: leaveTournament,
                                        className: "flex-grow py-2 bg-red-600/70 hover:bg-red-500 rounded-lg text-white font-medium transition-colors",
                                        children: "Leave Tournament"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                        lineNumber: 416,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: startTournament,
                                        disabled: participants.length < 4,
                                        className: `flex-grow py-2 rounded-lg font-medium transition-all ${participants.length >= 4 ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:brightness-110 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`,
                                        children: "Start Tournament"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                        lineNumber: 422,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                lineNumber: 415,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                        lineNumber: 365,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                lineNumber: 348,
                columnNumber: 9
            }, this),
            tournamentState === 'in_progress' && !tournamentComplete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gray-800/80 rounded-lg border border-gray-700 shadow-lg overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-indigo-900/50 p-4 border-b border-indigo-500/30",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-white text-lg font-semibold",
                                        children: tournamentName
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                        lineNumber: 443,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "px-3 py-1 bg-yellow-600/70 rounded-full text-white text-xs font-medium",
                                        children: "Tournament in Progress"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                        lineNumber: 444,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                lineNumber: 442,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 flex justify-between items-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-gray-300 text-sm",
                                    children: [
                                        "Round ",
                                        currentRound + 1,
                                        "/",
                                        Math.log2(tournamentSize)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                    lineNumber: 449,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                lineNumber: 448,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                        lineNumber: 441,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$tournament$2f$TournamentBracket$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            participants: participants,
                            tournamentSize: participants.length,
                            matches: matches,
                            currentRound: currentRound,
                            onMatchUpdate: handleMatchUpdate
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                            lineNumber: 453,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                        lineNumber: 452,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                lineNumber: 440,
                columnNumber: 9
            }, this),
            tournamentComplete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-gray-800/80 rounded-lg border border-gray-700 shadow-lg overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-green-900/50 p-4 border-b border-green-500/30",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between items-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-white text-lg font-semibold",
                                    children: tournamentName
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                    lineNumber: 469,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "px-3 py-1 bg-green-600/70 rounded-full text-white text-xs font-medium",
                                    children: "Tournament Complete"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                    lineNumber: 470,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                            lineNumber: 468,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                        lineNumber: 467,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col items-center mb-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-gradient-to-b from-yellow-400 to-yellow-600 p-1 rounded-full mb-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-24 h-24 rounded-full bg-gray-600 overflow-hidden border-4 border-yellow-500",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                src: champion?.avatar || '/mghalmi.jpg',
                                                alt: champion?.login || 'Champion',
                                                width: 96,
                                                height: 96,
                                                className: "w-full h-full object-cover"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                                lineNumber: 479,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                            lineNumber: 478,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                        lineNumber: 477,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-2xl text-white mb-1",
                                        children: "Tournament Champion"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                        lineNumber: 489,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-yellow-400 text-3xl font-bold mb-6",
                                        children: champion?.login || 'Unknown'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                        lineNumber: 490,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                lineNumber: 476,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$tournament$2f$TournamentBracket$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                participants: participants,
                                tournamentSize: participants.length,
                                matches: matches,
                                currentRound: currentRound,
                                onMatchUpdate: ()=>{}
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                lineNumber: 493,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-8 flex space-x-4 justify-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: resetTournament,
                                    className: "px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg",
                                    children: "New Tournament"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                    lineNumber: 502,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                                lineNumber: 501,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                        lineNumber: 475,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
                lineNumber: 466,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.jsx",
        lineNumber: 297,
        columnNumber: 5
    }, this);
}
}}),
"[project]/src/app/(main)/play/tournament/page.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>TournamentPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$tournament$2f$LocalTournament$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/play/tournament/LocalTournament.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$tournament$2f$OnlineTournament$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/play/tournament/OnlineTournament.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function TournamentPage() {
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const [gameMode, setGameMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const modeParam = searchParams.get('mode');
        if (modeParam === 'Local' || modeParam === 'Online') {
            setGameMode(modeParam);
        } else {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["notFound"])();
        }
    }, [
        searchParams
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: gameMode === 'Local' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$tournament$2f$LocalTournament$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
            fileName: "[project]/src/app/(main)/play/tournament/page.tsx",
            lineNumber: 25,
            columnNumber: 11
        }, this) : gameMode === 'Online' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$tournament$2f$OnlineTournament$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
            fileName: "[project]/src/app/(main)/play/tournament/page.tsx",
            lineNumber: 27,
            columnNumber: 11
        }, this) : null
    }, void 0, false);
}
}}),

};

//# sourceMappingURL=src_app_%28main%29_play_tournament_c3af7b22._.js.map