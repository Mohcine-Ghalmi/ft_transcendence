module.exports = {

"[project]/src/data/mockData.js [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "chartData": (()=>chartData),
    "friendSuggestions": (()=>friendSuggestions),
    "friends": (()=>friends),
    "matchHistory": (()=>matchHistory),
    "mockMessages": (()=>mockMessages),
    "mockUsers": (()=>mockUsers),
    "notifications": (()=>notifications),
    "onlineFriends": (()=>onlineFriends),
    "user": (()=>user)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
const user = {
    name: 'Mohcine Ghalmi',
    username: 'SLEEPS',
    avatar: '/mghalmi.jpg',
    status: 'Online',
    email: 'SLEEPS@example.com',
    level: 12,
    xp: 70,
    rank: 4
};
const matchHistory = [
    {
        date: '2023-11-15',
        opponent: 'Liam Parker',
        result: 'Win',
        score: '2-1'
    },
    {
        date: '2023-11-12',
        opponent: 'Sophia Evans',
        result: 'Loss',
        score: '1-2'
    },
    {
        date: '2023-11-09',
        opponent: 'Noah Walker',
        result: 'Win',
        score: '2-0'
    },
    {
        date: '2023-11-06',
        opponent: 'Olivia Bennett',
        result: 'Win',
        score: '2-1'
    },
    {
        date: '2023-11-03',
        opponent: 'Ethan Carter',
        result: 'Loss',
        score: '0-2'
    }
];
let friendSuggestions = [
    {
        name: 'Liam Parker',
        status: 'Online',
        avatar: '/mghalmi.jpg',
        added: false
    },
    {
        name: 'Sophia Evans',
        status: 'Offline',
        avatar: '/mghalmi.jpg',
        added: false
    },
    {
        name: 'Noah Walker',
        status: 'Online',
        avatar: '/mghalmi.jpg',
        added: false
    },
    {
        name: 'Olivia Bennett',
        status: 'Offline',
        avatar: '/mghalmi.jpg',
        added: false
    },
    {
        name: 'Ethan Carter',
        status: 'Online',
        avatar: '/mghalmi.jpg',
        added: false
    }
];
const friends = [
    {
        name: 'Noah',
        status: 'Offline',
        avatar: '/mghalmi.jpg'
    },
    {
        name: 'Isabella',
        status: 'Online',
        avatar: '/mghalmi.jpg'
    },
    {
        name: 'Ava',
        status: 'Online',
        avatar: '/mghalmi.jpg'
    }
];
const onlineFriends = [
    {
        name: 'Sophia Clark',
        username: 'SLEEPS00',
        GameStatus: 'Available',
        avatar: '/mghalmi.jpg'
    },
    {
        name: 'Ethan Bennett',
        username: 'SLEEPS00',
        GameStatus: 'In a match',
        avatar: '/mghalmi.jpg'
    },
    {
        name: 'Olivia Carter',
        username: 'SLEEPS00',
        GameStatus: 'Available',
        avatar: '/mghalmi.jpg'
    },
    {
        name: 'Liam Davis',
        username: 'SLEEPS00',
        GameStatus: 'Available',
        avatar: '/mghalmi.jpg'
    },
    {
        name: 'Ava Evans',
        username: 'SLEEPS00',
        GameStatus: 'In a match',
        avatar: '/mghalmi.jpg'
    }
];
const notifications = [
    {
        id: 1,
        type: 'friend_request',
        message: 'Liam Parker sent you a friend request',
        time: '2 minutes ago',
        unread: true
    },
    {
        id: 2,
        type: 'match_invite',
        message: 'Sophia Evans invited you to a match',
        time: '15 minutes ago',
        unread: true
    },
    {
        id: 3,
        type: 'achievement',
        message: 'You unlocked a new achievement!',
        time: '1 hour ago',
        unread: false
    },
    {
        id: 4,
        type: 'tournament',
        message: 'Tournament starting in 30 minutes',
        time: '2 hours ago',
        unread: false
    }
];
const chartData = [
    {
        label: 'Week 1',
        value: 12
    },
    {
        label: 'Week 2',
        value: 18
    },
    {
        label: 'Week 3',
        value: 15
    },
    {
        label: 'Week 4',
        value: 20
    }
];
const mockUsers = [
    {
        id: 1,
        name: "Ethan Carter",
        avatar: "/mghalmi.jpg",
        active: true
    },
    {
        id: 2,
        name: "Sophia Clark",
        avatar: "/mghalmi.jpg"
    },
    {
        id: 3,
        name: "Liam Walker",
        avatar: "/mghalmi.jpg"
    },
    {
        id: 4,
        name: "Olivia Martin",
        avatar: "/mghalmi.jpg"
    },
    {
        id: 5,
        name: "Kevin Lewis",
        avatar: "/mghalmi.jpg"
    },
    {
        id: 6,
        name: "Ava Scott",
        avatar: "/mghalmi.jpg"
    },
    {
        id: 7,
        name: "Jackson Evans",
        avatar: "/mghalmi.jpg"
    },
    {
        id: 8,
        name: "Sophia Green",
        avatar: "/mghalmi.jpg"
    },
    {
        id: 9,
        name: "Isabella King",
        avatar: "/mghalmi.jpg"
    },
    {
        id: 10,
        name: "Mia Wright",
        avatar: "/mghalmi.jpg"
    },
    {
        id: 11,
        name: "Aiden Wright",
        avatar: "/mghalmi.jpg"
    }
];
const mockMessages = [
    {
        id: 1,
        sender: "Ethan Carter",
        avatar: "/mghalmi.jpg",
        text: "Hey, can you sign up for a quick match?",
        time: "7:00 PM",
        mine: false
    },
    {
        id: 2,
        sender: "me",
        text: "Sure.",
        time: "7:01 PM",
        mine: true
    },
    {
        id: 3,
        sender: "Ethan Carter",
        avatar: "/mghalmi.jpg",
        text: "Great! I'll send you an invite.",
        time: "7:02 PM",
        mine: false
    },
    {
        id: 4,
        sender: "me",
        text: "Sounds ok.",
        time: "7:03 PM",
        mine: true
    },
    {
        id: 5,
        sender: "Ethan Carter",
        avatar: "/mghalmi.jpg",
        text: "Invite sent. Check your notifications.",
        time: "7:04 PM",
        mine: false
    },
    {
        id: 6,
        sender: "me",
        text: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-[#23272e] rounded-xl p-4 flex flex-col items-center w-64",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "font-semibold mb-2",
                    children: "Ping Pong Match"
                }, void 0, false, {
                    fileName: "[project]/src/data/mockData.js",
                    lineNumber: 114,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-2 w-full",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-1",
                            children: "Accept"
                        }, void 0, false, {
                            fileName: "[project]/src/data/mockData.js",
                            lineNumber: 116,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-1",
                            children: "Decline"
                        }, void 0, false, {
                            fileName: "[project]/src/data/mockData.js",
                            lineNumber: 117,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/data/mockData.js",
                    lineNumber: 115,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/data/mockData.js",
            lineNumber: 113,
            columnNumber: 7
        }, this),
        time: "7:05 PM",
        mine: true,
        isInvite: true
    }
];
}}),
"[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const GAME_RATIO = 16 / 9;
const GAME_WIDTH = 880;
const GAME_HEIGHT = 495; // 16:9 ratio
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const BALL_SIZE = 16;
const PADDLE_SPEED = 7;
const BALL_SPEED = 6;
const isMobile = ()=>"undefined" !== 'undefined' && window.innerWidth < 640;
const PingPongGame = ({ player1, player2, onExit })=>{
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [scores, setScores] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        p1: 0,
        p2: 0
    });
    const [running, setRunning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [paused, setPaused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [gameStarted, setGameStarted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [mobile, setMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(isMobile());
    const [canvasDims, setCanvasDims] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        width: GAME_WIDTH,
        height: GAME_HEIGHT
    });
    // Paddle positions: player1 left, player2 right
    const paddle1Y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    const paddle2Y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    const ball = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        x: GAME_WIDTH / 2 - BALL_SIZE / 2,
        y: GAME_HEIGHT / 2 - BALL_SIZE / 2,
        dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
        dy: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1)
    });
    const keys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({});
    // Mobile paddle state
    const [paddle1Move, setPaddle1Move] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [paddle2Move, setPaddle2Move] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    // Responsive canvas
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleResize = ()=>{
            setMobile(isMobile());
            // Maintain area with max 90vw, max 60vh, keep 16:9
            const maxW = Math.min(window.innerWidth * 0.97, 1100);
            const maxH = Math.min(window.innerHeight * 0.6, 640);
            let width = maxW, height = width / GAME_RATIO;
            if (height > maxH) {
                height = maxH;
                width = height * GAME_RATIO;
            }
            setCanvasDims({
                width,
                height
            });
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return ()=>window.removeEventListener("resize", handleResize);
    }, []);
    // Keyboard controls (Desktop)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (mobile) return;
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
    }, [
        mobile
    ]);
    // Game loop
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!gameStarted || paused) return;
        let animation;
        const draw = ()=>{
            const ctx = canvasRef.current?.getContext("2d");
            if (!ctx) return;
            // Clear bg with dark gradient look
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
            ctx.fillRect(0, paddle1Y.current * canvasDims.height / GAME_HEIGHT, PADDLE_WIDTH * canvasDims.width / GAME_WIDTH, PADDLE_HEIGHT * canvasDims.height / GAME_HEIGHT);
            ctx.fillRect((GAME_WIDTH - PADDLE_WIDTH) * canvasDims.width / GAME_WIDTH, paddle2Y.current * canvasDims.height / GAME_HEIGHT, PADDLE_WIDTH * canvasDims.width / GAME_WIDTH, PADDLE_HEIGHT * canvasDims.height / GAME_HEIGHT);
            ctx.shadowBlur = 0;
            // Ball
            ctx.beginPath();
            ctx.arc(ball.current.x * canvasDims.width / GAME_WIDTH + BALL_SIZE * canvasDims.width / GAME_WIDTH / 2, ball.current.y * canvasDims.height / GAME_HEIGHT + BALL_SIZE * canvasDims.height / GAME_HEIGHT / 2, BALL_SIZE * canvasDims.width / GAME_WIDTH / 2, 0, Math.PI * 2);
            ctx.fillStyle = "#f7f7fa";
            ctx.shadowColor = "#fff";
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
        };
        const update = ()=>{
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
            if (ball.current.x <= PADDLE_WIDTH && ball.current.y + BALL_SIZE >= paddle1Y.current && ball.current.y <= paddle1Y.current + PADDLE_HEIGHT) {
                ball.current.dx = Math.abs(ball.current.dx);
            }
            // Right paddle collision
            if (ball.current.x + BALL_SIZE >= GAME_WIDTH - PADDLE_WIDTH && ball.current.y + BALL_SIZE >= paddle2Y.current && ball.current.y <= paddle2Y.current + PADDLE_HEIGHT) {
                ball.current.dx = -Math.abs(ball.current.dx);
            }
            // Scoring
            if (ball.current.x < -BALL_SIZE) {
                setScores((s)=>({
                        ...s,
                        p2: s.p2 + 1
                    }));
                resetBall(-1);
            } else if (ball.current.x > GAME_WIDTH + BALL_SIZE) {
                setScores((s)=>({
                        ...s,
                        p1: s.p1 + 1
                    }));
                resetBall(1);
            }
        };
        const resetBall = (direction)=>{
            ball.current.x = GAME_WIDTH / 2 - BALL_SIZE / 2;
            ball.current.y = GAME_HEIGHT / 2 - BALL_SIZE / 2;
            // Give the ball a random Y direction each serve
            const yDirection = (Math.random() > 0.5 ? 1 : -1) * BALL_SPEED;
            ball.current.dx = BALL_SPEED * direction;
            ball.current.dy = yDirection;
        };
        const loop = ()=>{
            if (!paused) update();
            draw();
            animation = requestAnimationFrame(loop);
        };
        loop();
        return ()=>{
            cancelAnimationFrame(animation);
        };
    // eslint-disable-next-line
    }, [
        gameStarted,
        paused,
        mobile,
        canvasDims
    ]);
    // Win condition: First to 5
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (scores.p1 >= 5 || scores.p2 >= 5) {
            setPaused(true);
        }
    }, [
        scores
    ]);
    // Touch button event helpers
    const handleMobilePress = (which, isDown)=>{
        if (which === 'p1up') setPaddle1Move(isDown ? 'up' : '');
        if (which === 'p1down') setPaddle1Move(isDown ? 'down' : '');
        if (which === 'p2up') setPaddle2Move(isDown ? 'up' : '');
        if (which === 'p2down') setPaddle2Move(isDown ? 'down' : '');
    };
    // Reset/exit helpers
    const handleStart = ()=>{
        setScores({
            p1: 0,
            p2: 0
        });
        paddle1Y.current = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
        paddle2Y.current = GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2;
        ball.current.x = GAME_WIDTH / 2 - BALL_SIZE / 2;
        ball.current.y = GAME_HEIGHT / 2 - BALL_SIZE / 2;
        ball.current.dx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
        ball.current.dy = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
        setGameStarted(true);
        setPaused(false);
    };
    // UI helpers
    const gameOver = scores.p1 >= 5 || scores.p2 >= 5;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-[#15181e] z-[60] overflow-auto",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full flex flex-col items-center pt-6 pb-10 justify-center px-2 md:px-0",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center w-full",
                style: {
                    maxWidth: 1050,
                    width: "100%"
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full flex flex-col items-center rounded-3xl shadow-2xl border border-[#50545d] bg-gradient-to-b from-[#23272f] to-[#191b20] py-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full flex flex-col items-center px-2 md:px-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-full flex justify-center mb-5 mt-2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "max-w-full max-h-[60vh] rounded-2xl border border-[#656872] bg-[#222429] shadow-2xl flex items-center justify-center overflow-hidden",
                                    style: {
                                        aspectRatio: "16/9",
                                        width: canvasDims.width,
                                        height: canvasDims.height,
                                        minWidth: 220,
                                        minHeight: 120
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                                            ref: canvasRef,
                                            width: GAME_WIDTH,
                                            height: GAME_HEIGHT,
                                            className: "block w-full h-full",
                                            style: {
                                                background: "transparent"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                            lineNumber: 265,
                                            columnNumber: 19
                                        }, this),
                                        !gameStarted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleStart,
                                            className: "absolute z-20 flex items-center justify-center w-20 h-20 rounded-full bg-black/55 border-4 border-white/80 hover:bg-black/80 hover:scale-110 duration-150 transition-all",
                                            style: {
                                                left: "50%",
                                                top: "50%",
                                                transform: "translate(-50%,-50%)"
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                width: 40,
                                                height: 40,
                                                viewBox: "0 0 24 24",
                                                fill: "#fff",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                                                    points: "8,6 19,12 8,18"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                    lineNumber: 286,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                lineNumber: 285,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                            lineNumber: 276,
                                            columnNumber: 21
                                        }, this),
                                        gameOver && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute inset-0 z-30 bg-black/65 flex flex-col items-center justify-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-xl",
                                                    children: scores.p1 > scores.p2 ? `${player1.name} Wins! 🏆` : `${player2.name} Wins! 🏆`
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                    lineNumber: 293,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>{
                                                        setGameStarted(false);
                                                        setScores({
                                                            p1: 0,
                                                            p2: 0
                                                        });
                                                    },
                                                    className: "px-8 py-4 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold rounded-xl text-xl",
                                                    children: "Play Again"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                    lineNumber: 298,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                            lineNumber: 292,
                                            columnNumber: 21
                                        }, this),
                                        mobile && gameStarted && !gameOver && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "absolute left-0 top-0 h-full flex flex-col justify-center gap-3 p-1 z-20",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            className: "mobile-ctrl-btn",
                                                            style: {
                                                                width: 48,
                                                                height: 48,
                                                                background: "#2d3748cc",
                                                                borderRadius: 12,
                                                                color: 'white',
                                                                fontWeight: 900,
                                                                fontSize: 22,
                                                                marginBottom: 8
                                                            },
                                                            onTouchStart: ()=>handleMobilePress('p1up', true),
                                                            onTouchEnd: ()=>handleMobilePress('p1up', false),
                                                            children: "↑"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                            lineNumber: 311,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            className: "mobile-ctrl-btn",
                                                            style: {
                                                                width: 48,
                                                                height: 48,
                                                                background: "#2d3748cc",
                                                                borderRadius: 12,
                                                                color: 'white',
                                                                fontWeight: 900,
                                                                fontSize: 22
                                                            },
                                                            onTouchStart: ()=>handleMobilePress('p1down', true),
                                                            onTouchEnd: ()=>handleMobilePress('p1down', false),
                                                            children: "↓"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                            lineNumber: 326,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                    lineNumber: 310,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "absolute right-0 top-0 h-full flex flex-col justify-center gap-3 p-1 z-20",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            className: "mobile-ctrl-btn",
                                                            style: {
                                                                width: 48,
                                                                height: 48,
                                                                background: "#2d3748cc",
                                                                borderRadius: 12,
                                                                color: 'white',
                                                                fontWeight: 900,
                                                                fontSize: 22,
                                                                marginBottom: 8
                                                            },
                                                            onTouchStart: ()=>handleMobilePress('p2up', true),
                                                            onTouchEnd: ()=>handleMobilePress('p2up', false),
                                                            children: "↑"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                            lineNumber: 342,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            className: "mobile-ctrl-btn",
                                                            style: {
                                                                width: 48,
                                                                height: 48,
                                                                background: "#2d3748cc",
                                                                borderRadius: 12,
                                                                color: 'white',
                                                                fontWeight: 900,
                                                                fontSize: 22
                                                            },
                                                            onTouchStart: ()=>handleMobilePress('p2down', true),
                                                            onTouchEnd: ()=>handleMobilePress('p2down', false),
                                                            children: "↓"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                            lineNumber: 357,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                    lineNumber: 341,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                    lineNumber: 257,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                lineNumber: 256,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between w-full px-2 sm:px-8 my-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 min-w-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: player1.avatar,
                                                alt: player1.name,
                                                className: "w-12 h-12 rounded-full border-2 border-[#BFD6ED] object-cover"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                lineNumber: 380,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-semibold text-base text-white truncate",
                                                        children: player1.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                        lineNumber: 386,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs text-gray-300",
                                                        children: [
                                                            "@",
                                                            player1.username
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                        lineNumber: 387,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                lineNumber: 385,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                        lineNumber: 379,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col items-center px-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex text-3xl md:text-5xl font-bold mb-1 gap-2 text-white",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: scores.p1
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                        lineNumber: 393,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "-"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                        lineNumber: 394,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: scores.p2
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                        lineNumber: 395,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                lineNumber: 392,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "uppercase text-xs font-semibold tracking-wide text-gray-400",
                                                children: "Score"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                lineNumber: 397,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                        lineNumber: 391,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 min-w-0 flex-row-reverse",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: player2.avatar,
                                                alt: player2.name,
                                                className: "w-12 h-12 rounded-full border-2 border-[#BFD6ED] object-cover"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                lineNumber: 401,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col min-w-0 text-right",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-semibold text-base text-white truncate",
                                                        children: player2.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                        lineNumber: 407,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs text-gray-300",
                                                        children: [
                                                            "@",
                                                            player2.username
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                        lineNumber: 408,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                lineNumber: 406,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                        lineNumber: 400,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                lineNumber: 377,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col md:flex-row gap-2 items-center justify-center w-full mt-4 mb-2",
                                children: [
                                    gameStarted && !paused && !gameOver && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setPaused(true),
                                        className: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 min-w-[120px] rounded-lg text-lg font-semibold transition-colors shadow",
                                        children: "Pause"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                        lineNumber: 415,
                                        columnNumber: 19
                                    }, this),
                                    gameStarted && paused && !gameOver && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setPaused(false),
                                        className: "bg-green-600 hover:bg-green-700 text-white px-6 py-3 min-w-[120px] rounded-lg text-lg font-semibold transition-colors shadow",
                                        children: "Resume"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                        lineNumber: 423,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: onExit,
                                        className: "bg-[#55595f] hover:bg-[#35373a] text-white px-6 py-3 min-w-[120px] rounded-lg text-lg font-semibold transition-colors shadow",
                                        children: "Exit"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                        lineNumber: 430,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                lineNumber: 413,
                                columnNumber: 15
                            }, this),
                            !mobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-row gap-8 justify-between items-center w-full mt-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "font-mono text-sm text-blue-100 whitespace-nowrap",
                                        children: [
                                            "Player 1 (Left): ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-bold",
                                                children: "W/S — Move Up/Down"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                lineNumber: 441,
                                                columnNumber: 38
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                        lineNumber: 440,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "font-mono text-sm text-blue-100 whitespace-nowrap",
                                        children: [
                                            "Player 2 (Right): ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-bold",
                                                children: "↑/↓ — Move Up/Down"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                                lineNumber: 444,
                                                columnNumber: 39
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                        lineNumber: 443,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                lineNumber: 439,
                                columnNumber: 17
                            }, this),
                            mobile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 text-center text-xs text-blue-200",
                                children: "Use the left/right side controls to move paddles!"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                                lineNumber: 450,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                        lineNumber: 254,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                    lineNumber: 253,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
                lineNumber: 250,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
            lineNumber: 248,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx",
        lineNumber: 247,
        columnNumber: 5
    }, this);
};
const __TURBOPACK__default__export__ = PingPongGame;
}}),
"[project]/src/app/(main)/play/OneVsOne/Locale.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "PlayerCard": (()=>PlayerCard),
    "default": (()=>Local1v1)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/mockData.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$OneVsOne$2f$PingPongGame$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
// Add Player Modal Component
const AddPlayerModal = ({ isOpen, onClose, onAddPlayer })=>{
    const [username, setUsername] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [nickname, setNickname] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [errors, setErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [avatar, setAvatar] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleSubmit = ()=>{
        const newErrors = {};
        if (!username.trim()) {
            newErrors.username = 'Username is required';
        }
        if (!nickname.trim()) {
            newErrors.nickname = 'Nickname is required';
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        // Clear errors if validation passes
        setErrors({});
        onAddPlayer({
            username: username.trim(),
            nickname: nickname.trim(),
            avatar: avatar || '/mghalmi.png'
        });
        // Reset form
        setUsername('');
        setNickname('');
        setAvatar(null);
    };
    const handleUsernameChange = (e)=>{
        setUsername(e.target.value);
        if (errors.username) {
            setErrors((prev)=>({
                    ...prev,
                    username: ''
                }));
        }
    };
    const handleNicknameChange = (e)=>{
        setNickname(e.target.value);
        if (errors.nickname) {
            setErrors((prev)=>({
                    ...prev,
                    nickname: ''
                }));
        }
    };
    const handleAvatarChange = (e)=>{
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e)=>setAvatar(e.target.result);
            reader.readAsDataURL(file);
        }
    };
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0  backdrop-blur-xs flex items-center justify-center z-50",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-[#121417] rounded-lg p-8 w-full max-w-md mx-4 border border-gray-700",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-xl font-bold text-white mb-6 text-center",
                    children: "Player 2"
                }, void 0, false, {
                    fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                    lineNumber: 71,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    placeholder: "Username",
                                    value: username,
                                    onChange: handleUsernameChange,
                                    className: `w-full px-4 py-3 bg-[#4a5568] text-white rounded-lg border-none outline-none focus:bg-[#5a6578] transition-colors ${errors.username ? 'ring-2 ring-red-500' : ''}`
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                                    lineNumber: 75,
                                    columnNumber: 13
                                }, this),
                                errors.username && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-red-400 text-sm mt-1",
                                    children: errors.username
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                                    lineNumber: 85,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                            lineNumber: 74,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    placeholder: "Nickname",
                                    value: nickname,
                                    onChange: handleNicknameChange,
                                    className: `w-full px-4 py-3 bg-[#4a5568] text-white rounded-lg border-none outline-none focus:bg-[#5a6578] transition-colors ${errors.nickname ? 'ring-2 ring-red-500' : ''}`
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                                    lineNumber: 90,
                                    columnNumber: 13
                                }, this),
                                errors.nickname && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-red-400 text-sm mt-1",
                                    children: errors.nickname
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                                    lineNumber: 100,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                            lineNumber: 89,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "border-2 border-dashed border-gray-500 rounded-lg p-8 text-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-white font-semibold mb-2",
                                        children: "Upload Avatar"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                                        lineNumber: 106,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-400 text-sm mb-4",
                                        children: "Select an avatar for Player 2."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                                        lineNumber: 107,
                                        columnNumber: 15
                                    }, this),
                                    avatar && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: avatar,
                                            alt: "Avatar preview",
                                            className: "w-16 h-16 rounded-full mx-auto object-cover"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                                            lineNumber: 111,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                                        lineNumber: 110,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "bg-[#4a5568] hover:bg-[#5a6578] text-white px-4 py-2 rounded-lg cursor-pointer transition-colors inline-block",
                                        children: [
                                            "Choose Avatar",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "file",
                                                accept: "image/*",
                                                onChange: handleAvatarChange,
                                                className: "hidden"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                                                lineNumber: 121,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                                        lineNumber: 119,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                                lineNumber: 105,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                            lineNumber: 104,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end space-x-4 mt-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: onClose,
                                    className: "px-6 py-2 text-gray-400 hover:text-white transition-colors",
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                                    lineNumber: 132,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: handleSubmit,
                                    className: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors",
                                    children: "Update"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                                    lineNumber: 139,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                            lineNumber: 131,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                    lineNumber: 73,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
            lineNumber: 70,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
        lineNumber: 69,
        columnNumber: 5
    }, this);
};
const PlayerCard = ({ player, playerNumber, onAddPlayer })=>{
    if (!player) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-2xl md:text-3xl font-semibold text-white mb-8",
                    children: [
                        "Player ",
                        playerNumber
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                    lineNumber: 158,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "border-2 border-dashed border-gray-500 rounded-2xl p-10 md:p-20 mb-8",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                className: "text-white font-semibold mb-4 text-xl md:text-2xl",
                                children: [
                                    "Add Player ",
                                    playerNumber
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                                lineNumber: 161,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-400 text-lg md:text-xl mb-6",
                                children: "Add a local player to start a 1v1 game."
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                                lineNumber: 162,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: onAddPlayer,
                                className: "bg-[#4a5568] hover:bg-[#5a6578] text-white px-8 py-4 md:px-12 md:py-5 rounded-xl text-lg md:text-2xl transition-colors",
                                children: "Add Player"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                                lineNumber: 163,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                        lineNumber: 160,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                    lineNumber: 159,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
            lineNumber: 157,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "text-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-2xl md:text-3xl font-semibold text-white mb-8",
                children: [
                    "Player ",
                    playerNumber
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                lineNumber: 177,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative w-36 h-36 md:w-48 md:h-48 mx-auto mb-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: player.avatar,
                            alt: player.name,
                            className: "w-full h-full rounded-full object-cover border-4 border-[#4a5568]",
                            onError: (e)=>{
                                e.target.src = '/mghalmi.jpg';
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                            lineNumber: 180,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                        lineNumber: 179,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                        className: "text-white font-semibold text-2xl md:text-3xl",
                        children: player.name
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                        lineNumber: 189,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-400 text-lg md:text-xl",
                        children: [
                            "@",
                            player.username
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                        lineNumber: 192,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                lineNumber: 178,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
        lineNumber: 176,
        columnNumber: 5
    }, this);
};
function Local1v1() {
    const [player2, setPlayer2] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isModalOpen, setIsModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showGame, setShowGame] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleAddPlayer = (playerData)=>{
        setPlayer2(playerData);
        console.log("playe 2 => ", playerData);
        setIsModalOpen(false);
    };
    const handleStartGame = ()=>{
        if (!player2) {
            alert('Please add Player 2 before starting the game');
            return;
        }
        setShowGame(true);
    };
    const handleExitGame = ()=>{
        setShowGame(false);
        setPlayer2(null);
    };
    // If both players are present and showGame is true, show PingPongGame
    if (showGame && player2) {
        const player2Data = player2;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-center items-center min-h-screen bg-[#121417]",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$OneVsOne$2f$PingPongGame$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                player1: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["user"],
                player2: player2Data,
                onExit: handleExitGame
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                lineNumber: 228,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
            lineNumber: 227,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full text-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-center min-h-[calc(100vh-80px)] px-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-4xl md:text-6xl font-bold text-center mb-12 md:mb-20",
                            children: "Local 1v1"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                            lineNumber: 242,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 mb-12 md:mb-20",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PlayerCard, {
                                    player: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["user"],
                                    playerNumber: 1
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                                    lineNumber: 246,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PlayerCard, {
                                    player: player2,
                                    playerNumber: 2,
                                    onAddPlayer: ()=>setIsModalOpen(true)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                                    lineNumber: 249,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                            lineNumber: 244,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleStartGame,
                                disabled: !player2,
                                className: `px-10 py-4 md:px-16 md:py-6 rounded-xl text-xl md:text-3xl font-semibold transition-all duration-300 ${player2 ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`,
                                children: "Start Game"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                                lineNumber: 258,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                            lineNumber: 257,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                    lineNumber: 241,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                lineNumber: 240,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AddPlayerModal, {
                isOpen: isModalOpen,
                onClose: ()=>setIsModalOpen(false),
                onAddPlayer: handleAddPlayer
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
                lineNumber: 273,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/play/OneVsOne/Locale.tsx",
        lineNumber: 238,
        columnNumber: 5
    }, this);
}
}}),
"[project]/src/app/(main)/play/OneVsOne/Online.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>OnlineMatch)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/mockData.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$OneVsOne$2f$PingPongGame$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/play/OneVsOne/PingPongGame.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$OneVsOne$2f$Locale$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/play/OneVsOne/Locale.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
// Additional mock players to show more variety
const onlinePlayers = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onlineFriends"];
const PlayerListItem = ({ player, onInvite })=>{
    const isAvailable = player.GameStatus === 'Available';
    const isOnline = player.GameStatus === 'Available' || player.GameStatus === 'In a match';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center justify-between p-4 hover:bg-[#1a1d23] rounded-lg transition-colors",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center space-x-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: player.avatar,
                            alt: player.name,
                            className: "w-12 h-12 rounded-full object-cover",
                            onError: (e)=>{
                                e.target.src = '/default-avatar.png';
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                            lineNumber: 19,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                        lineNumber: 18,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-white font-medium text-lg",
                                children: player.name
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                lineNumber: 29,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: `text-sm ${player.GameStatus === 'Available' ? 'text-green-400' : player.GameStatus === 'In a match' ? 'text-yellow-400' : 'text-gray-400'}`,
                                children: player.GameStatus
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                lineNumber: 30,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                        lineNumber: 28,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>onInvite(player),
                disabled: !isAvailable,
                className: `px-6 py-2 rounded-lg font-medium transition-colors ${isAvailable ? 'bg-[#4a5568] hover:bg-[#5a6578] text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`,
                children: "Invite"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
};
function OnlineMatch() {
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isWaitingForResponse, setIsWaitingForResponse] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [invitedPlayer, setInvitedPlayer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [gameAccepted, setGameAccepted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [waitTime, setWaitTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(30);
    const [showGame, setShowGame] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const filteredPlayers = onlinePlayers.filter((player)=>player.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const handleInvite = (player)=>{
        console.log('Inviting player:', player);
        setInvitedPlayer(player);
        setIsWaitingForResponse(true);
        setGameAccepted(false);
        setWaitTime(30);
        // Simulate countdown and response waiting
        const interval = setInterval(()=>{
            setWaitTime((prev)=>{
                if (prev <= 1) {
                    clearInterval(interval);
                    // Simulate random response (accept/decline/timeout) - higher chance of accept for demo
                    const responses = [
                        'accept',
                        'decline',
                        'timeout'
                    ];
                    const response = responses[Math.floor(Math.random() * responses.length)];
                    setTimeout(()=>{
                        if (response === 'accept') {
                            setGameAccepted(true);
                        // Don't reset the waiting state, show the accepted game state instead
                        } else if (response === 'decline') {
                            alert(`${player.name} declined your invitation.`);
                            setIsWaitingForResponse(false);
                            setInvitedPlayer(null);
                        } else {
                            alert(`${player.name} didn't respond to your invitation.`);
                            setIsWaitingForResponse(false);
                            setInvitedPlayer(null);
                        }
                    }, 1000);
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);
    };
    const handleSearchChange = (e)=>{
        setSearchQuery(e.target.value);
    };
    const handleCancelInvite = ()=>{
        setIsWaitingForResponse(false);
        setInvitedPlayer(null);
        setGameAccepted(false);
        setWaitTime(3);
    };
    const handleStartGame = ()=>{
        console.log('Starting game with:', {
            player1: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["user"],
            player2: invitedPlayer
        });
        setShowGame(true);
    };
    const handleExitGame = ()=>{
        setShowGame(false);
        setIsWaitingForResponse(false);
        setInvitedPlayer(null);
        setGameAccepted(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full w-full text-white",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center min-h-[calc(100vh-80px)] px-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-4xl md:text-5xl font-bold mb-8",
                        children: "1v1 Online Match"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                        lineNumber: 135,
                        columnNumber: 11
                    }, this),
                    !showGame ? !isWaitingForResponse ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative mb-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                            className: "h-5 w-5 text-gray-400"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                            lineNumber: 143,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                        lineNumber: 142,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        placeholder: "Search for players",
                                        value: searchQuery,
                                        onChange: handleSearchChange,
                                        className: "w-full pl-12 pr-4 py-4 bg-[#2a2f3a] text-white rounded-lg border-none outline-none focus:bg-[#3a3f4a] transition-colors text-lg"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                        lineNumber: 145,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                lineNumber: 141,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl font-semibold text-white mb-6",
                                        children: "Online Players"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                        lineNumber: 156,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2 bo",
                                        children: filteredPlayers.length > 0 ? filteredPlayers.map((player, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PlayerListItem, {
                                                player: player,
                                                onInvite: handleInvite
                                            }, `${player.name}-${index}`, false, {
                                                fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                                lineNumber: 161,
                                                columnNumber: 25
                                            }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-center py-12",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-gray-400 text-lg",
                                                children: "No players found matching your search."
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                                lineNumber: 169,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                            lineNumber: 168,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                        lineNumber: 158,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                lineNumber: 155,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true) : // Match Queue / Game Accepted Interface
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-row items-center justify-center",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "max-w-7xl mx-auto text-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-3xl font-semibold text-white mb-12",
                                    children: "Match Queue"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                    lineNumber: 179,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-80 mb-12 md:mb-20",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$OneVsOne$2f$Locale$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlayerCard"], {
                                            player: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["user"],
                                            playerNumber: 1
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                            lineNumber: 183,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col items-center",
                                                children: gameAccepted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$OneVsOne$2f$Locale$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PlayerCard"], {
                                                    player: invitedPlayer,
                                                    playerNumber: 2
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                                    lineNumber: 190,
                                                    columnNumber: 27
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-white text-lg mb-8",
                                                            children: [
                                                                "Waiting for ",
                                                                invitedPlayer.name,
                                                                " to respond..."
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                                            lineNumber: 193,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-full mb-4",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "bg-gray-700 rounded-full",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-white rounded-full h-2 transition-all duration-1000 ease-linear",
                                                                    style: {
                                                                        width: `${(30 - waitTime) / 30 * 100}%`
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                                                    lineNumber: 200,
                                                                    columnNumber: 31
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                                                lineNumber: 199,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                                            lineNumber: 198,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-gray-400 text-sm",
                                                            children: [
                                                                "Estimated wait time: ",
                                                                waitTime,
                                                                " seconds"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                                            lineNumber: 207,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                                lineNumber: 188,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                            lineNumber: 187,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                    lineNumber: 180,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-center space-x-4",
                                    children: gameAccepted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleStartGame,
                                        className: "bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-xl text-xl font-semibold transition-colors",
                                        children: "Start Game"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                        lineNumber: 219,
                                        columnNumber: 23
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleCancelInvite,
                                        className: "bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg transition-colors",
                                        children: "Cancel"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                        lineNumber: 226,
                                        columnNumber: 23
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                                    lineNumber: 217,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                            lineNumber: 178,
                            columnNumber: 17
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                        lineNumber: 177,
                        columnNumber: 15
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "py-10",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$OneVsOne$2f$PingPongGame$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            player1: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["user"],
                            player2: invitedPlayer,
                            onExit: handleExitGame
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                            lineNumber: 239,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                        lineNumber: 238,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
                lineNumber: 134,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
            lineNumber: 133,
            columnNumber: 6
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(main)/play/OneVsOne/Online.tsx",
        lineNumber: 131,
        columnNumber: 5
    }, this);
}
}}),
"[project]/src/app/(main)/play/OneVsOne/page.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>Page1v1)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$OneVsOne$2f$Locale$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/play/OneVsOne/Locale.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$OneVsOne$2f$Online$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/play/OneVsOne/Online.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function Page1v1() {
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
        children: gameMode === 'Local' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$OneVsOne$2f$Locale$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
            fileName: "[project]/src/app/(main)/play/OneVsOne/page.tsx",
            lineNumber: 22,
            columnNumber: 9
        }, this) : gameMode === 'Online' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$OneVsOne$2f$Online$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
            fileName: "[project]/src/app/(main)/play/OneVsOne/page.tsx",
            lineNumber: 24,
            columnNumber: 9
        }, this) : null
    }, void 0, false);
}
}}),

};

//# sourceMappingURL=src_e7a84e4c._.js.map