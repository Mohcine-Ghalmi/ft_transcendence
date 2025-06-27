(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/app/(main)/play/tournament/TournamentBracket.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "DesktopBracket": (()=>DesktopBracket),
    "MobileBracket": (()=>MobileBracket),
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/mockData.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function MobileBracket({ rounds, currentRound, getMatch, getMatchStateStyle, participants, getPlayerStyle, getPlayerBgStyle, onPlayMatch, tournamentSize }) {
    const getPlayerDisplayName = (player)=>{
        if (!player) return "TBD";
        if (player.nickname) return `${player.name} "${player.nickname}"`;
        return player.name;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center mt-4 p-2 bg-gray-800/80 rounded-lg border border-gray-700 w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-white text-xl mb-3 text-center",
                children: "Tournament Bracket"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-white text-sm mb-2",
                children: [
                    "Current Round: ",
                    currentRound + 1
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col w-full space-y-4",
                children: Array.from({
                    length: rounds
                }).map((_, roundIndex)=>{
                    const matchesInRound = tournamentSize / Math.pow(2, roundIndex + 1);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-indigo-300 text-sm font-medium mb-2 pl-1",
                                children: roundIndex === rounds - 1 ? "Final" : roundIndex === rounds - 2 ? "Semi Finals" : `Round ${roundIndex + 1}`
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                lineNumber: 35,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                        if (prevMatch1 && prevMatch1.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN) {
                                            player1 = prevMatch1.player1;
                                        } else if (prevMatch1 && prevMatch1.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN) {
                                            player1 = prevMatch1.player2;
                                        }
                                        if (prevMatch2 && prevMatch2.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN) {
                                            player2 = prevMatch2.player1;
                                        } else if (prevMatch2 && prevMatch2.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN) {
                                            player2 = prevMatch2.player2;
                                        }
                                    }
                                    const player1Style = match ? getPlayerStyle(match, true) : "text-gray-300";
                                    const player2Style = match ? getPlayerStyle(match, false) : "text-gray-300";
                                    const player1BgStyle = match ? getPlayerBgStyle(match, true) : "";
                                    const player2BgStyle = match ? getPlayerBgStyle(match, false) : "";
                                    const player1BorderColor = player1BgStyle.includes("bg-") ? player1BgStyle.replace("bg-", "border-") : "border-green-400/50";
                                    const player2BorderColor = player2BgStyle.includes("bg-") ? player2BgStyle.replace("bg-", "border-") : "border-green-400/50";
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `flex flex-col ${matchStateClass} rounded overflow-hidden ${isCurrentRound ? 'hover:brightness-110 transition-all cursor-pointer' : ''}`,
                                        onClick: ()=>isCurrentRound && match.player1 && match.player2 && onPlayMatch && onPlayMatch(match),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-black text-gray-300 text-xs font-medium px-2 py-1 border-b border-gray-700",
                                                children: [
                                                    "Match ",
                                                    matchIndex + 1
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                                lineNumber: 99,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `py-2 px-3 border-b ${player1BorderColor} ${player1BgStyle}`,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `text-sm font-medium truncate ${player1Style}`,
                                                            children: getPlayerDisplayName(player1)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                                            lineNumber: 108,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                                        lineNumber: 105,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-px bg-gray-600 w-full"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                                        lineNumber: 112,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `py-2 px-3 ${player2BorderColor} ${player2BgStyle}`,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `text-sm font-medium truncate ${player2Style}`,
                                                            children: getPlayerDisplayName(player2)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                                            lineNumber: 116,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                                        lineNumber: 113,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                                lineNumber: 104,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, `match-${roundIndex}-${matchIndex}`, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                        lineNumber: 93,
                                        columnNumber: 21
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                lineNumber: 41,
                                columnNumber: 15
                            }, this)
                        ]
                    }, `round-${roundIndex}`, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                        lineNumber: 34,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center justify-center mt-4 text-xs space-x-2 space-y-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center mt-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-3 h-3 rounded-full bg-gray-400 mr-1"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                lineNumber: 133,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-gray-300",
                                children: "Waiting"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                lineNumber: 134,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                        lineNumber: 132,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-3 h-3 rounded-full bg-yellow-400 mr-1"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                lineNumber: 137,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-yellow-300",
                                children: "In Progress"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                lineNumber: 138,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                        lineNumber: 136,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-3 h-3 rounded-full bg-green-400 mr-1"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                lineNumber: 141,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-green-300",
                                children: "Winner"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                lineNumber: 142,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                        lineNumber: 140,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-3 h-3 rounded-full bg-red-400 mr-1"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                lineNumber: 145,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-red-300",
                                children: "Eliminated"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                lineNumber: 146,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                        lineNumber: 144,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                lineNumber: 131,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-gray-400 text-xs mt-2",
                children: "Click on a match to simulate the game"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                lineNumber: 150,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
_c = MobileBracket;
function DesktopBracket({ currentRound, bracketHeight, rounds, roundWidth, tournamentSize, participants, getMatch, getMatchStateStyle, getPlayerStyle, getPlayerBgStyle, onPlayMatch, matchHeight }) {
    const getPlayerDisplayName = (player)=>{
        if (!player) return "TBD";
        if (player.nickname) return `${player.name} "${player.nickname}"`;
        return player.name;
    };
    // Increase match height for better visibility
    const adjustedMatchHeight = matchHeight * 1.5;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center mt-4 p-4 overflow-x-auto w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-white text-xl md:text-2xl mb-3 text-center",
                children: "Tournament Bracket"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                lineNumber: 180,
                columnNumber: 11
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                    if (prevMatch1 && prevMatch1.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN) {
                                        player1 = prevMatch1.player1;
                                    } else if (prevMatch1 && prevMatch1.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN) {
                                        player1 = prevMatch1.player2;
                                    }
                                    if (prevMatch2 && prevMatch2.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN) {
                                        player2 = prevMatch2.player1;
                                    } else if (prevMatch2 && prevMatch2.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN) {
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
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `${matchStateClass} mb-6 rounded-lg shadow-lg overflow-hidden ${isCurrentRound ? 'hover:brightness-110 cursor-pointer transform hover:scale-105 transition-transform' : ''}`,
                                    onClick: ()=>isCurrentRound && match.player1 && match.player2 && onPlayMatch && onPlayMatch(match),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-black text-gray-300 text-xs font-medium px-2 py-1 border-b border-gray-700",
                                            children: [
                                                "Match ",
                                                matchIndex + 1
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                            lineNumber: 255,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `p-2 ${player1BgStyle} border-b border-gray-600`,
                                            style: {
                                                minHeight: `${adjustedMatchHeight / 2}px`
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `text-sm md:text-base truncate ${player1Style} font-medium`,
                                                children: getPlayerDisplayName(player1)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                                lineNumber: 263,
                                                columnNumber: 27
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                            lineNumber: 259,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `p-2 ${player2BgStyle}`,
                                            style: {
                                                minHeight: `${adjustedMatchHeight / 2}px`
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `text-sm md:text-base truncate ${player2Style} font-medium`,
                                                children: getPlayerDisplayName(player2)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                                lineNumber: 271,
                                                columnNumber: 27
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                            lineNumber: 267,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, matchIndex, true, {
                                    fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                    lineNumber: 249,
                                    columnNumber: 23
                                }, this);
                            })
                        }, `left-${roundIndex}`, false, {
                            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                            lineNumber: 188,
                            columnNumber: 17
                        }, this);
                    }),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-0 bottom-0 flex flex-col justify-center",
                        style: {
                            left: `${rounds * roundWidth}px`,
                            width: `${roundWidth}px`
                        },
                        children: (()=>{
                            const finalMatch = getMatch(rounds - 1, 0);
                            const isFinalCurrentRound = currentRound === rounds - 1;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `shadow-lg ${finalMatch ? getMatchStateStyle(finalMatch.state) : "border-yellow-400"} rounded-lg mx-1 overflow-hidden flex flex-col ${isFinalCurrentRound ? 'hover:brightness-110 cursor-pointer transform hover:scale-105 transition-transform' : ''}`,
                                onClick: ()=>isFinalCurrentRound && finalMatch && finalMatch.player1 && finalMatch.player2 && onPlayMatch && onPlayMatch(finalMatch),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-yellow-400 text-sm md:text-lg text-center font-bold bg-black p-2 border-b border-yellow-500/50",
                                        children: "FINAL"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                        lineNumber: 299,
                                        columnNumber: 21
                                    }, this),
                                    (()=>{
                                        const player1 = finalMatch?.player1;
                                        const player2 = finalMatch?.player2;
                                        const player1Style = finalMatch ? getPlayerStyle(finalMatch, true) : "text-gray-300";
                                        const player2Style = finalMatch ? getPlayerStyle(finalMatch, false) : "text-gray-300";
                                        const player1BgStyle = finalMatch ? getPlayerBgStyle(finalMatch, true) : "";
                                        const player2BgStyle = finalMatch ? getPlayerBgStyle(finalMatch, false) : "";
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `p-3 ${player1BgStyle} border-b border-gray-600`,
                                                    style: {
                                                        minHeight: `${adjustedMatchHeight / 2}px`
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `text-sm md:text-base text-center font-medium ${player1Style}`,
                                                        children: getPlayerDisplayName(player1)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                                        lineNumber: 317,
                                                        columnNumber: 29
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                                    lineNumber: 316,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `p-3 ${player2BgStyle}`,
                                                    style: {
                                                        minHeight: `${adjustedMatchHeight / 2}px`
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `text-sm md:text-base text-center font-medium ${player2Style}`,
                                                        children: getPlayerDisplayName(player2)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                                        lineNumber: 322,
                                                        columnNumber: 29
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                                    lineNumber: 321,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true);
                                    })(),
                                    finalMatch && (finalMatch.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN || finalMatch.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-green-300 text-xs md:text-base border-t border-green-500/50 font-bold text-center p-2 bg-green-900/30",
                                        children: [
                                            "Champion: ",
                                            finalMatch.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN ? getPlayerDisplayName(finalMatch.player1) : getPlayerDisplayName(finalMatch.player2)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                        lineNumber: 333,
                                        columnNumber: 23
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                lineNumber: 293,
                                columnNumber: 19
                            }, this);
                        })()
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                        lineNumber: 283,
                        columnNumber: 13
                    }, this),
                    Array.from({
                        length: rounds
                    }).map((_, roundIndex)=>{
                        const matchesInRound = tournamentSize / Math.pow(2, roundIndex + 1);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                    if (prevMatch1 && prevMatch1.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN) {
                                        player1 = prevMatch1.player1;
                                    } else if (prevMatch1 && prevMatch1.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN) {
                                        player1 = prevMatch1.player2;
                                    }
                                    if (prevMatch2 && prevMatch2.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN) {
                                        player2 = prevMatch2.player1;
                                    } else if (prevMatch2 && prevMatch2.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN) {
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
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `${matchStateClass} mb-6 rounded-lg shadow-lg overflow-hidden ${isCurrentRound ? 'hover:brightness-110 cursor-pointer transform hover:scale-105 transition-transform' : ''}`,
                                    onClick: ()=>isCurrentRound && match.player1 && match.player2 && onPlayMatch && onPlayMatch(match),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-black text-gray-300 text-xs font-medium px-2 py-1 border-b border-gray-700",
                                            children: [
                                                "Match ",
                                                actualMatchIndex + 1
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                            lineNumber: 420,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `p-2 ${player1BgStyle} border-b border-gray-600`,
                                            style: {
                                                minHeight: `${adjustedMatchHeight / 2}px`
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `text-sm md:text-base truncate ${player1Style} font-medium`,
                                                children: getPlayerDisplayName(player1)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                                lineNumber: 428,
                                                columnNumber: 27
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                            lineNumber: 424,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `p-2 ${player2BgStyle}`,
                                            style: {
                                                minHeight: `${adjustedMatchHeight / 2}px`
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `text-sm md:text-base truncate ${player2Style} font-medium`,
                                                children: getPlayerDisplayName(player2)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                                lineNumber: 436,
                                                columnNumber: 27
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                            lineNumber: 432,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, matchIndex, true, {
                                    fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                    lineNumber: 414,
                                    columnNumber: 23
                                }, this);
                            })
                        }, `right-${roundIndex}`, false, {
                            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                            lineNumber: 349,
                            columnNumber: 17
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                lineNumber: 182,
                columnNumber: 11
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center justify-center mt-6 text-xs md:text-sm space-x-4 space-y-2 md:space-y-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-4 h-4 rounded-full bg-gray-400 mr-2"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                lineNumber: 451,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-gray-300",
                                children: "Waiting"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                lineNumber: 452,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                        lineNumber: 450,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-4 h-4 rounded-full bg-yellow-400 mr-2"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                lineNumber: 455,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-yellow-300",
                                children: "In Progress"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                lineNumber: 456,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                        lineNumber: 454,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-4 h-4 rounded-full bg-green-400 mr-2"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                lineNumber: 459,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-green-300",
                                children: "Winner"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                lineNumber: 460,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                        lineNumber: 458,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-4 h-4 rounded-full bg-red-400 mr-2"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                lineNumber: 463,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-red-300",
                                children: "Eliminated"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                                lineNumber: 464,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                        lineNumber: 462,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                lineNumber: 449,
                columnNumber: 11
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-gray-400 text-sm mt-3",
                children: "Click on a match to simulate the game"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
                lineNumber: 468,
                columnNumber: 11
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
        lineNumber: 179,
        columnNumber: 9
    }, this);
}
_c1 = DesktopBracket;
const TournamentBracket = ({ participants, tournamentSize, matches, currentRound, onMatchUpdate, onPlayMatch// <-- this prop is passed from LocalTournament
 })=>{
    _s();
    const [windowWidth, setWindowWidth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(("TURBOPACK compile-time truthy", 1) ? window.innerWidth : ("TURBOPACK unreachable", undefined));
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(("TURBOPACK compile-time truthy", 1) ? window.innerWidth < 768 : ("TURBOPACK unreachable", undefined));
    const [isTablet, setIsTablet] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(("TURBOPACK compile-time truthy", 1) ? window.innerWidth >= 768 && window.innerWidth < 1024 : ("TURBOPACK unreachable", undefined));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TournamentBracket.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) {
                "TURBOPACK unreachable";
            }
            const handleResize = {
                "TournamentBracket.useEffect.handleResize": ()=>{
                    setWindowWidth(window.innerWidth);
                    setIsMobile(window.innerWidth < 768);
                    setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
                }
            }["TournamentBracket.useEffect.handleResize"];
            window.addEventListener('resize', handleResize);
            return ({
                "TournamentBracket.useEffect": ()=>window.removeEventListener('resize', handleResize)
            })["TournamentBracket.useEffect"];
        }
    }["TournamentBracket.useEffect"], []);
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
            case __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].IN_PROGRESS:
                return "border-yellow-400 bg-yellow-900/30";
            case __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN:
                return "border-green-400 bg-green-900/30";
            case __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN:
                return "border-green-400 bg-green-900/30";
            default:
                return "border-indigo-400/50 bg-gray-700/50";
        }
    };
    const getPlayerStyle = (match, isPlayer1)=>{
        if (!match || !match.state) return "text-gray-300";
        const won = match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN && isPlayer1 || match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN && !isPlayer1;
        const lost = match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN && !isPlayer1 || match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN && isPlayer1;
        if (won) return "text-green-400 font-bold";
        if (lost) return "text-red-400 line-through";
        if (match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].IN_PROGRESS) return "text-yellow-300 italic";
        return "text-gray-300";
    };
    const getPlayerBgStyle = (match, isPlayer1)=>{
        if (!match || !match.state) return "";
        const won = match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN && isPlayer1 || match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN && !isPlayer1;
        const lost = match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN && !isPlayer1 || match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN && isPlayer1;
        if (won) return "bg-green-900/30";
        if (lost) return "bg-red-900/30 border-red-400";
        if (match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].IN_PROGRESS) return "bg-yellow-900/30 animate-pulse";
        return "bg-gray-700/30";
    };
    const getMatch = (roundIndex, matchIndex)=>{
        return matches.find((m)=>m.round === roundIndex && m.matchIndex === matchIndex);
    };
    // Remove simulateMatch and related logic.
    // Instead, use onPlayMatch(match) for current round matches.
    if (isMobile) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MobileBracket, {
            rounds: rounds,
            currentRound: currentRound,
            getMatch: getMatch,
            getMatchStateStyle: getMatchStateStyle,
            participants: participants,
            getPlayerStyle: getPlayerStyle,
            getPlayerBgStyle: getPlayerBgStyle,
            onPlayMatch: onPlayMatch,
            tournamentSize: validTournamentSize
        }, void 0, false, {
            fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
            lineNumber: 572,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DesktopBracket, {
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
        onPlayMatch: onPlayMatch,
        matchHeight: matchHeight
    }, void 0, false, {
        fileName: "[project]/src/app/(main)/play/tournament/TournamentBracket.tsx",
        lineNumber: 587,
        columnNumber: 5
    }, this);
};
_s(TournamentBracket, "WIKuddZ/vjEDRfnXJW9d/N8F2vk=");
_c2 = TournamentBracket;
const __TURBOPACK__default__export__ = TournamentBracket;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "MobileBracket");
__turbopack_context__.k.register(_c1, "DesktopBracket");
__turbopack_context__.k.register(_c2, "TournamentBracket");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/play/game/PingPongGame.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "PingPongGame": (()=>PingPongGame)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
const GAME_RATIO = 16 / 9;
const GAME_WIDTH = 880;
const GAME_HEIGHT = 495; // 16:9 ratio
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 90;
const BALL_SIZE = 16;
const PADDLE_SPEED = 7;
const BALL_SPEED = 6;
const isMobile = ()=>"object" !== 'undefined' && window.innerWidth < 640;
const PingPongGame = ({ player1, player2, onExit, isTournamentMode = false })=>{
    _s();
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [scores, setScores] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        p1: 0,
        p2: 0
    });
    const [running, setRunning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [paused, setPaused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [gameStarted, setGameStarted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [mobile, setMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(isMobile());
    const [gameTime, setGameTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const gameStartTime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [canvasDims, setCanvasDims] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        width: GAME_WIDTH,
        height: GAME_HEIGHT
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
    const paddle1Y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    const paddle2Y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    const ball = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        x: GAME_WIDTH / 2 - BALL_SIZE / 2,
        y: GAME_HEIGHT / 2 - BALL_SIZE / 2,
        dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
        dy: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1)
    });
    const keys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({});
    // Mobile paddle state
    const [paddle1Move, setPaddle1Move] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [paddle2Move, setPaddle2Move] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // Game timer
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PingPongGame.useEffect": ()=>{
            let interval;
            if (gameStarted && !paused && gameStartTime.current) {
                interval = setInterval({
                    "PingPongGame.useEffect": ()=>{
                        const elapsed = Math.floor((Date.now() - gameStartTime.current) / 1000);
                        const hours = Math.floor(elapsed / 3600);
                        const minutes = Math.floor(elapsed % 3600 / 60);
                        const seconds = elapsed % 60;
                        setGameTime({
                            hours,
                            minutes,
                            seconds
                        });
                    }
                }["PingPongGame.useEffect"], 1000);
            }
            return ({
                "PingPongGame.useEffect": ()=>{
                    if (interval) clearInterval(interval);
                }
            })["PingPongGame.useEffect"];
        }
    }["PingPongGame.useEffect"], [
        gameStarted,
        paused
    ]);
    // Responsive canvas
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PingPongGame.useEffect": ()=>{
            const handleResize = {
                "PingPongGame.useEffect.handleResize": ()=>{
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
                    setCanvasDims({
                        width,
                        height
                    });
                }
            }["PingPongGame.useEffect.handleResize"];
            handleResize();
            window.addEventListener("resize", handleResize);
            return ({
                "PingPongGame.useEffect": ()=>window.removeEventListener("resize", handleResize)
            })["PingPongGame.useEffect"];
        }
    }["PingPongGame.useEffect"], []);
    // Update canvas size when dimensions change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PingPongGame.useEffect": ()=>{
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = canvasDims.width;
                canvas.height = canvasDims.height;
            }
        }
    }["PingPongGame.useEffect"], [
        canvasDims
    ]);
    // Keyboard controls (Desktop)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PingPongGame.useEffect": ()=>{
            if (mobile) return;
            const downHandler = {
                "PingPongGame.useEffect.downHandler": (e)=>{
                    keys.current[e.key.toLowerCase()] = true;
                }
            }["PingPongGame.useEffect.downHandler"];
            const upHandler = {
                "PingPongGame.useEffect.upHandler": (e)=>{
                    keys.current[e.key.toLowerCase()] = false;
                }
            }["PingPongGame.useEffect.upHandler"];
            window.addEventListener("keydown", downHandler);
            window.addEventListener("keyup", upHandler);
            return ({
                "PingPongGame.useEffect": ()=>{
                    window.removeEventListener("keydown", downHandler);
                    window.removeEventListener("keyup", upHandler);
                }
            })["PingPongGame.useEffect"];
        }
    }["PingPongGame.useEffect"], [
        mobile
    ]);
    // Game loop
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PingPongGame.useEffect": ()=>{
            if (!gameStarted || paused) return;
            let animation;
            const scaleX = canvasDims.width / GAME_WIDTH;
            const scaleY = canvasDims.height / GAME_HEIGHT;
            const draw = {
                "PingPongGame.useEffect.draw": ()=>{
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
                    ctx.fillRect(0, paddle1Y.current * scaleY, PADDLE_WIDTH * scaleX, PADDLE_HEIGHT * scaleY);
                    ctx.fillRect(canvasDims.width - PADDLE_WIDTH * scaleX, paddle2Y.current * scaleY, PADDLE_WIDTH * scaleX, PADDLE_HEIGHT * scaleY);
                    ctx.shadowBlur = 0;
                    // Ball
                    ctx.beginPath();
                    ctx.arc(ball.current.x * scaleX + BALL_SIZE * scaleX / 2, ball.current.y * scaleY + BALL_SIZE * scaleY / 2, BALL_SIZE * scaleX / 2, 0, Math.PI * 2);
                    ctx.fillStyle = "#f7f7fa";
                    ctx.shadowColor = "#fff";
                    ctx.shadowBlur = 6;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }["PingPongGame.useEffect.draw"];
            const update = {
                "PingPongGame.useEffect.update": ()=>{
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
                        setScores({
                            "PingPongGame.useEffect.update": (s)=>({
                                    ...s,
                                    p2: s.p2 + 1
                                })
                        }["PingPongGame.useEffect.update"]);
                        resetBall(-1);
                    } else if (ball.current.x > GAME_WIDTH + BALL_SIZE) {
                        setScores({
                            "PingPongGame.useEffect.update": (s)=>({
                                    ...s,
                                    p1: s.p1 + 1
                                })
                        }["PingPongGame.useEffect.update"]);
                        resetBall(1);
                    }
                }
            }["PingPongGame.useEffect.update"];
            const resetBall = {
                "PingPongGame.useEffect.resetBall": (direction)=>{
                    ball.current.x = GAME_WIDTH / 2 - BALL_SIZE / 2;
                    ball.current.y = GAME_HEIGHT / 2 - BALL_SIZE / 2;
                    // Give the ball a random Y direction each serve
                    const yDirection = (Math.random() > 0.5 ? 1 : -1) * BALL_SPEED;
                    ball.current.dx = BALL_SPEED * direction;
                    ball.current.dy = yDirection;
                }
            }["PingPongGame.useEffect.resetBall"];
            const loop = {
                "PingPongGame.useEffect.loop": ()=>{
                    if (!paused) update();
                    draw();
                    animation = requestAnimationFrame(loop);
                }
            }["PingPongGame.useEffect.loop"];
            loop();
            return ({
                "PingPongGame.useEffect": ()=>{
                    cancelAnimationFrame(animation);
                }
            })["PingPongGame.useEffect"];
        }
    }["PingPongGame.useEffect"], [
        gameStarted,
        paused,
        mobile,
        canvasDims,
        paddle1Move,
        paddle2Move
    ]);
    // Win condition - Updated for tournament mode with better winner object
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PingPongGame.useEffect": ()=>{
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
        }
    }["PingPongGame.useEffect"], [
        scores,
        safePlayer1,
        safePlayer2,
        onExit,
        isTournamentMode
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
        gameStartTime.current = Date.now();
    };
    const handlePause = ()=>{
        setPaused(true);
    };
    const handleResume = ()=>{
        setPaused(false);
    };
    const handleExit = ()=>{
        if (isTournamentMode) {
            onExit(); // Exit without winner for tournament mode
        } else {
            onExit();
        }
    };
    // UI helpers
    const gameOver = scores.p1 >= 7 || scores.p2 >= 7;
    const isGameActive = gameStarted && !paused && !gameOver;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col overflow-hidden",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex-1 flex flex-col",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 flex items-center justify-center p-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative rounded-2xl border border-[#656872] bg-[#222429] shadow-2xl overflow-hidden",
                        style: {
                            width: canvasDims.width,
                            height: canvasDims.height
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                                ref: canvasRef,
                                className: "block w-full h-full",
                                style: {
                                    width: '100%',
                                    height: '100%'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                lineNumber: 352,
                                columnNumber: 13
                            }, this),
                            !gameStarted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0 z-20 flex items-center justify-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleStart,
                                    className: "flex items-center justify-center w-20 h-20 rounded-full bg-black/60 border-4 border-white/80 hover:bg-black/80 hover:scale-110 transition-all duration-150",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: 40,
                                        height: 40,
                                        viewBox: "0 0 24 24",
                                        fill: "#fff",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                                            points: "8,6 19,12 8,18"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                            lineNumber: 369,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                        lineNumber: 368,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                    lineNumber: 364,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                lineNumber: 363,
                                columnNumber: 15
                            }, this),
                            gameStarted && paused && !gameOver && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0 z-30 bg-black/60 flex items-center justify-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-center w-24 h-24 rounded-full bg-black/80 border-4 border-white/80",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: 48,
                                        height: 48,
                                        viewBox: "0 0 24 24",
                                        fill: "#fff",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                x: "6",
                                                y: "4",
                                                width: "4",
                                                height: "16"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                                lineNumber: 380,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                                                x: "14",
                                                y: "4",
                                                width: "4",
                                                height: "16"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                                lineNumber: 381,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                        lineNumber: 379,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                    lineNumber: 378,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                lineNumber: 377,
                                columnNumber: 15
                            }, this),
                            mobile && isGameActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute left-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-20",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "w-12 h-12 bg-gray-800/80 rounded-lg text-white font-bold text-xl flex items-center justify-center touch-manipulation",
                                                onTouchStart: ()=>handleMobilePress('p1up', true),
                                                onTouchEnd: ()=>handleMobilePress('p1up', false),
                                                children: "↑"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                                lineNumber: 391,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "w-12 h-12 bg-gray-800/80 rounded-lg text-white font-bold text-xl flex items-center justify-center touch-manipulation",
                                                onTouchStart: ()=>handleMobilePress('p1down', true),
                                                onTouchEnd: ()=>handleMobilePress('p1down', false),
                                                children: "↓"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                                lineNumber: 398,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                        lineNumber: 390,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-20",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "w-12 h-12 bg-gray-800/80 rounded-lg text-white font-bold text-xl flex items-center justify-center touch-manipulation",
                                                onTouchStart: ()=>handleMobilePress('p2up', true),
                                                onTouchEnd: ()=>handleMobilePress('p2up', false),
                                                children: "↑"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                                lineNumber: 407,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "w-12 h-12 bg-gray-800/80 rounded-lg text-white font-bold text-xl flex items-center justify-center touch-manipulation",
                                                onTouchStart: ()=>handleMobilePress('p2down', true),
                                                onTouchEnd: ()=>handleMobilePress('p2down', false),
                                                children: "↓"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                                lineNumber: 414,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                        lineNumber: 406,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                        lineNumber: 345,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                    lineNumber: 344,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-center mb-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2 sm:gap-4 text-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-[#2a2f3a] rounded-lg px-2 sm:px-4 py-2 min-w-[60px] sm:min-w-[80px]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-lg sm:text-2xl font-bold text-white",
                                                children: String(gameTime.hours).padStart(2, '0')
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                                lineNumber: 433,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-gray-400",
                                                children: "Hours"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                                lineNumber: 434,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                        lineNumber: 432,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-[#2a2f3a] rounded-lg px-2 sm:px-4 py-2 min-w-[60px] sm:min-w-[80px]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-lg sm:text-2xl font-bold text-white",
                                                children: String(gameTime.minutes).padStart(2, '0')
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                                lineNumber: 437,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-gray-400",
                                                children: "Minutes"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                                lineNumber: 438,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                        lineNumber: 436,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-[#2a2f3a] rounded-lg px-2 sm:px-4 py-2 min-w-[60px] sm:min-w-[80px]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-lg sm:text-2xl font-bold text-white",
                                                children: String(gameTime.seconds).padStart(2, '0')
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                                lineNumber: 441,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-gray-400",
                                                children: "Seconds"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                                lineNumber: 442,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                        lineNumber: 440,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                lineNumber: 431,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                            lineNumber: 430,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-3 items-center gap-2 sm:gap-4 mb-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 sm:gap-3 justify-start",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: safePlayer1.avatar,
                                            alt: safePlayer1.name,
                                            className: "w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-400 object-cover flex-shrink-0"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                            lineNumber: 451,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "min-w-0 flex-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                    className: "text-white font-semibold text-sm sm:text-xl md:text-2xl truncate",
                                                    children: safePlayer1.name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                                    lineNumber: 457,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-400 text-xs sm:text-sm md:text-lg truncate",
                                                    children: [
                                                        "@",
                                                        safePlayer1.nickname
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                                    lineNumber: 460,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                            lineNumber: 456,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                    lineNumber: 450,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center flex-shrink-0",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-2xl sm:text-3xl md:text-4xl font-bold text-white whitespace-nowrap",
                                        children: [
                                            scores.p1,
                                            " - ",
                                            scores.p2
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                        lineNumber: 466,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                    lineNumber: 465,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 sm:gap-3 justify-end",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "min-w-0 flex-1 text-right",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                    className: "text-white font-semibold text-sm sm:text-xl md:text-2xl truncate",
                                                    children: safePlayer2.name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                                    lineNumber: 474,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-400 text-xs sm:text-sm md:text-lg truncate",
                                                    children: [
                                                        "@",
                                                        safePlayer2.nickname
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                                    lineNumber: 477,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                            lineNumber: 473,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: safePlayer2.avatar,
                                            alt: safePlayer2.name,
                                            className: "w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-blue-400 object-cover flex-shrink-0"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                            lineNumber: 479,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                    lineNumber: 472,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                            lineNumber: 448,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-center gap-2 sm:gap-4",
                            children: [
                                isGameActive && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handlePause,
                                    className: "bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base",
                                    children: "Pause"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                    lineNumber: 490,
                                    columnNumber: 15
                                }, this),
                                gameStarted && paused && !gameOver && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleResume,
                                    className: "bg-green-600 hover:bg-green-700 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base",
                                    children: "Resume"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                    lineNumber: 498,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleExit,
                                    className: "bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base",
                                    children: "Exit"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                                    lineNumber: 505,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                            lineNumber: 488,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
                    lineNumber: 428,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
            lineNumber: 341,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(main)/play/game/PingPongGame.tsx",
        lineNumber: 339,
        columnNumber: 5
    }, this);
};
_s(PingPongGame, "LLYs8uJMUo1vss87nvy/FaszMas=");
_c = PingPongGame;
var _c;
__turbopack_context__.k.register(_c, "PingPongGame");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/play/tournament/LocalTournament.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/mockData.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$tournament$2f$TournamentBracket$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/play/tournament/TournamentBracket.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$game$2f$PingPongGame$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/play/game/PingPongGame.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
// Tournament Bracket Component for Local Tournament
const ParticipantItem = ({ player, removeParticipant, changeParticipantName, changeParticipantNickname })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center bg-[#1a1d23] rounded-lg p-3 hover:bg-[#2a2f3a] transition-all border border-gray-700/50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-10 h-10 rounded-full bg-[#2a2f3a] flex-shrink-0 overflow-hidden mr-3 border border-gray-600",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    src: player.avatar,
                    alt: player.name,
                    width: 40,
                    height: 40,
                    className: "w-full h-full object-cover"
                }, void 0, false, {
                    fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                    lineNumber: 21,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-grow space-y-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        value: player.name,
                        onChange: (e)=>changeParticipantName(player.id, e.target.value),
                        className: "bg-[#2a2f3a] text-white rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 text-sm placeholder-gray-400",
                        minLength: 1,
                        required: true,
                        placeholder: "Enter player name"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                        lineNumber: 30,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        value: player.nickname || '',
                        onChange: (e)=>changeParticipantNickname(player.id, e.target.value),
                        className: "bg-[#2a2f3a] text-gray-300 rounded-lg px-3 py-1 w-full outline-none focus:ring-2 focus:ring-blue-400 border border-gray-600 text-xs placeholder-gray-500",
                        placeholder: "Enter nickname (optional)"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                lineNumber: 29,
                columnNumber: 7
            }, this),
            !player.is_user && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>removeParticipant(player.id),
                className: "ml-2 text-red-400 hover:text-red-300 transition-colors p-1 rounded-lg hover:bg-red-400/10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    xmlns: "http://www.w3.org/2000/svg",
                    className: "h-5 w-5",
                    viewBox: "0 0 20 20",
                    fill: "currentColor",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        fillRule: "evenodd",
                        d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
                        clipRule: "evenodd"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                        lineNumber: 53,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                    lineNumber: 52,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                lineNumber: 48,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
};
_c = ParticipantItem;
const RoundControls = ({ currentRound, totalRounds, onAdvanceRound, canAdvance })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center justify-center mb-6 bg-[#1a1d23] rounded-lg p-4 border border-gray-700/50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center space-x-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-white text-lg",
                        children: "Round:"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-blue-400 font-bold text-xl",
                        children: [
                            currentRound + 1,
                            "/",
                            totalRounds
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onAdvanceRound,
                disabled: !canAdvance,
                className: `ml-6 px-6 py-2 rounded-lg text-white font-medium transition-colors ${canAdvance ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 cursor-not-allowed opacity-50'}`,
                children: currentRound + 1 === totalRounds ? "End Tournament" : "Next Round"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
        lineNumber: 68,
        columnNumber: 5
    }, this);
};
_c1 = RoundControls;
const LocalTournamentMode = ()=>{
    _s();
    const [participants, setParticipants] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        {
            id: crypto.randomUUID(),
            name: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["user"].name,
            nickname: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["user"].nickname || '',
            avatar: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["user"].avatar,
            ready: true,
            is_user: true
        }
    ]);
    const [tournamentName, setTournamentName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("Local Pong Championship");
    const [tournamentSize, setTournamentSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(4);
    const [tournamentStarted, setTournamentStarted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentRound, setCurrentRound] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [matches, setMatches] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [tournamentComplete, setTournamentComplete] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [champion, setChampion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [playingMatch, setPlayingMatch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showMatchResult, setShowMatchResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [matchWinner, setMatchWinner] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const totalRounds = Math.log2(tournamentSize);
    // Helper function to get display name (nickname if available, otherwise name)
    const getDisplayName = (player)=>{
        return player?.nickname?.trim() || player?.name || 'Unknown Player';
    };
    // Initialize tournament matches
    const initializeTournament = ()=>{
        const initialMatches = [];
        // Create first round matches
        for(let i = 0; i < tournamentSize / 2; i++){
            const player1 = participants[i * 2] || null;
            const player2 = participants[i * 2 + 1] || null;
            initialMatches.push({
                id: crypto.randomUUID(),
                round: 0,
                matchIndex: i,
                player1: player1,
                player2: player2,
                state: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].WAITING
            });
        }
        // Create placeholder matches for future rounds
        for(let round = 1; round < totalRounds; round++){
            const matchesInRound = tournamentSize / Math.pow(2, round + 1);
            for(let i = 0; i < matchesInRound; i++){
                initialMatches.push({
                    id: crypto.randomUUID(),
                    round: round,
                    matchIndex: i,
                    player1: null,
                    player2: null,
                    state: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].WAITING
                });
            }
        }
        setMatches(initialMatches);
        setTournamentStarted(true);
    };
    // Update match state and propagate winners to next round
    const handleMatchUpdate = (roundIndex, matchIndex, newState)=>{
        setMatches((prevMatches)=>{
            const updatedMatches = [
                ...prevMatches
            ];
            const matchToUpdateIndex = updatedMatches.findIndex((m)=>m.round === roundIndex && m.matchIndex === matchIndex);
            if (matchToUpdateIndex === -1) return prevMatches;
            const matchToUpdate = {
                ...updatedMatches[matchToUpdateIndex]
            };
            matchToUpdate.state = newState;
            updatedMatches[matchToUpdateIndex] = matchToUpdate;
            // If we have a winner, update next round's match
            if (newState === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN || newState === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN) {
                const winner = newState === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN ? matchToUpdate.player1 : matchToUpdate.player2;
                // Check if this is the final match
                if (roundIndex === totalRounds - 1) {
                    setChampion(winner);
                    setTournamentComplete(true);
                } else if (roundIndex < totalRounds - 1) {
                    const nextRound = roundIndex + 1;
                    const nextMatchIndex = Math.floor(matchIndex / 2);
                    const isFirstMatchOfPair = matchIndex % 2 === 0;
                    const nextMatchIndex2 = updatedMatches.findIndex((m)=>m.round === nextRound && m.matchIndex === nextMatchIndex);
                    if (nextMatchIndex2 !== -1) {
                        const nextMatch = {
                            ...updatedMatches[nextMatchIndex2]
                        };
                        // Update player1 or player2 based on which match this was
                        if (isFirstMatchOfPair) {
                            nextMatch.player1 = winner;
                        } else {
                            nextMatch.player2 = winner;
                        }
                        updatedMatches[nextMatchIndex2] = nextMatch;
                    }
                }
            }
            return updatedMatches;
        });
    };
    // Check if all matches in current round are completed
    const canAdvanceRound = ()=>{
        const currentRoundMatches = matches.filter((m)=>m.round === currentRound);
        return currentRoundMatches.length > 0 && currentRoundMatches.every((m)=>m.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN || m.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN);
    };
    // Get players who are still in the tournament (not eliminated)
    const getActivePlayers = ()=>{
        const eliminatedPlayerIds = new Set();
        // Find all eliminated players
        matches.forEach((match)=>{
            if (match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN && match.player2) {
                eliminatedPlayerIds.add(match.player2.id);
            } else if (match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN && match.player1) {
                eliminatedPlayerIds.add(match.player1.id);
            }
        });
        // Return active players
        return participants.filter((p)=>!eliminatedPlayerIds.has(p.id));
    };
    // Advance to next round
    const advanceRound = ()=>{
        if (currentRound < totalRounds - 1) {
            setCurrentRound((prevRound)=>prevRound + 1);
        } else {
            // Tournament is completed
            const finalMatch = matches.find((m)=>m.round === totalRounds - 1 && m.matchIndex === 0);
            if (finalMatch) {
                const winner = finalMatch.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN ? finalMatch.player1 : finalMatch.player2;
                setChampion(winner);
            }
            setTournamentComplete(true);
        }
    };
    const addParticipant = ()=>{
        if (participants.length < tournamentSize) {
            setParticipants([
                ...participants,
                {
                    id: crypto.randomUUID(),
                    name: `Player ${participants.length + 1}`,
                    nickname: '',
                    avatar: `/mghalmi.jpg`,
                    ready: true,
                    is_user: false
                }
            ]);
        }
    };
    const removeParticipant = (id)=>{
        if (participants.length > 1) {
            setParticipants(participants.filter((player)=>player.id !== id));
        }
    };
    const changeParticipantName = (id, newName)=>{
        setParticipants(participants.map((player)=>player.id === id ? {
                ...player,
                name: newName
            } : player));
    };
    const changeParticipantNickname = (id, newNickname)=>{
        setParticipants(participants.map((player)=>player.id === id ? {
                ...player,
                nickname: newNickname
            } : player));
    };
    const startTournament = ()=>{
        initializeTournament();
    };
    const resetTournament = ()=>{
        setTournamentStarted(false);
        setCurrentRound(0);
        setMatches([]);
        setTournamentComplete(false);
        setChampion(null);
        setPlayingMatch(null);
        setShowMatchResult(false);
        setMatchWinner(null);
    };
    // Start a match in PingPongGame
    const handlePlayMatch = (match)=>{
        setPlayingMatch(match);
    };
    // Handle winner from PingPongGame - Fixed with proper null checks
    const handleGameEnd = (winner)=>{
        // if (!playingMatch || !playingMatch.player1 || !playingMatch.player2) {
        //   console.error('Invalid match or missing players');
        //   return;
        // }
        console.log('Game ended. Winner:', winner, 'Playing match:', playingMatch);
        // Enhanced validation with better error handling
        if (!playingMatch) {
            console.error('No playing match found');
            return;
        }
        // If no winner is provided (game was exited), just go back to tournament
        if (!winner) {
            setPlayingMatch(null);
            return;
        }
        // Ensure winner has required properties
        if (!winner.id) {
            console.error('Winner missing id property');
            return;
        }
        // Set match winner and show result
        setMatchWinner(winner);
        setShowMatchResult(true);
        // Update match state - Fixed null checks
        const matchState = winner.id === playingMatch.player1?.id ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN;
        handleMatchUpdate(playingMatch.round, playingMatch.matchIndex, matchState);
    };
    // Continue tournament after showing match result
    const handleContinueTournament = ()=>{
        setShowMatchResult(false);
        setMatchWinner(null);
        setPlayingMatch(null);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full w-full text-white",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center min-h-[calc(100vh-80px)] px-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl",
                children: [
                    (!playingMatch || showMatchResult) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-center text-4xl md:text-5xl font-bold mb-8",
                        children: tournamentStarted ? tournamentName : "Local Tournament"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                        lineNumber: 355,
                        columnNumber: 13
                    }, this),
                    !tournamentStarted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl font-semibold mb-6",
                                        children: "Tournament Setup"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                        lineNumber: 364,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-gray-300 mb-2 text-lg",
                                                children: "Tournament Name"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                lineNumber: 367,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: tournamentName,
                                                onChange: (e)=>setTournamentName(e.target.value),
                                                className: "bg-[#2a2f3a] text-white rounded-lg px-4 py-3 w-full outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 text-lg",
                                                placeholder: "Enter tournament name",
                                                required: true
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                lineNumber: 368,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                        lineNumber: 366,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-gray-300 mb-3 text-lg",
                                                children: "Tournament Size"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                lineNumber: 379,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-3 gap-3",
                                                children: [
                                                    4,
                                                    8,
                                                    16
                                                ].map((size)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: `py-3 px-4 rounded-lg font-medium transition-colors ${tournamentSize === size ? 'bg-blue-600 text-white' : 'bg-[#2a2f3a] text-gray-300 hover:bg-[#3a3f4a] border border-gray-600'}`,
                                                        onClick: ()=>setTournamentSize(size),
                                                        children: [
                                                            size,
                                                            " Players"
                                                        ]
                                                    }, size, true, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                        lineNumber: 382,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                lineNumber: 380,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                        lineNumber: 378,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                lineNumber: 363,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between items-center mb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-2xl font-semibold text-white",
                                                children: [
                                                    "Participants (",
                                                    participants.length,
                                                    "/",
                                                    tournamentSize,
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                lineNumber: 399,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: addParticipant,
                                                disabled: participants.length >= tournamentSize,
                                                className: `px-6 py-2 rounded-lg font-medium transition-colors ${participants.length < tournamentSize ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-600 cursor-not-allowed text-gray-400'}`,
                                                children: "Add Player"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                lineNumber: 400,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                        lineNumber: 398,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-3",
                                        children: participants.map((player)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ParticipantItem, {
                                                player: player,
                                                removeParticipant: removeParticipant,
                                                changeParticipantName: changeParticipantName,
                                                changeParticipantNickname: changeParticipantNickname
                                            }, player.id, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                lineNumber: 415,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                        lineNumber: 413,
                                        columnNumber: 17
                                    }, this),
                                    participants.length < tournamentSize && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-yellow-400 text-sm mt-3",
                                        children: [
                                            "You need to add ",
                                            tournamentSize - participants.length,
                                            " more players"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                        lineNumber: 426,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                lineNumber: 397,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: startTournament,
                                    disabled: participants.length < tournamentSize || !tournamentName,
                                    className: `w-full max-w-md text-white font-semibold rounded-lg py-4 text-xl transition-all ${participants.length >= tournamentSize && tournamentName && !participants.some((participant)=>!participant.name || participant.name.trim() === '') && new Set(participants.map((p)=>p.name?.trim())).size === participants.filter((p)=>p.name?.trim()).length ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'}`,
                                    children: "Start Tournament"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                    lineNumber: 434,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                lineNumber: 433,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                        lineNumber: 361,
                        columnNumber: 13
                    }, this),
                    tournamentStarted && !tournamentComplete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6",
                        children: [
                            showMatchResult && matchWinner && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "fixed inset-0 bg-black/80 flex items-center justify-center z-50",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-[#1a1d23] rounded-lg p-8 border border-gray-700/50 max-w-md w-full mx-4 text-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mb-6",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-24 h-24 rounded-full bg-[#2a2f3a] overflow-hidden border-4 border-green-500 mx-auto mb-4",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        src: matchWinner.avatar || '/mghalmi.jpg',
                                                        alt: matchWinner.name || 'Winner',
                                                        width: 96,
                                                        height: 96,
                                                        className: "w-full h-full object-cover"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                        lineNumber: 460,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                    lineNumber: 459,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "text-3xl font-bold text-white mb-2",
                                                    children: "Match Winner!"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                    lineNumber: 468,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-green-400 text-2xl font-bold mb-2",
                                                    children: getDisplayName(matchWinner)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                    lineNumber: 469,
                                                    columnNumber: 23
                                                }, this),
                                                matchWinner.nickname && matchWinner.nickname !== matchWinner.name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-green-300 text-lg",
                                                    children: [
                                                        "(",
                                                        matchWinner.name,
                                                        ")"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                    lineNumber: 473,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                            lineNumber: 458,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-300 mb-6",
                                            children: [
                                                getDisplayName(matchWinner),
                                                " advances to the next round!"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                            lineNumber: 478,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleContinueTournament,
                                            className: "bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors",
                                            children: "Continue Tournament"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                            lineNumber: 481,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                    lineNumber: 457,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                lineNumber: 456,
                                columnNumber: 17
                            }, this),
                            playingMatch && !showMatchResult ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$game$2f$PingPongGame$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PingPongGame"], {
                                player1: playingMatch.player1,
                                player2: playingMatch.player2,
                                onExit: handleGameEnd,
                                isTournamentMode: true
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                lineNumber: 493,
                                columnNumber: 17
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RoundControls, {
                                        currentRound: currentRound,
                                        totalRounds: totalRounds,
                                        onAdvanceRound: advanceRound,
                                        canAdvance: canAdvanceRound()
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                        lineNumber: 501,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$tournament$2f$TournamentBracket$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        participants: participants,
                                        tournamentSize: tournamentSize,
                                        matches: matches,
                                        currentRound: currentRound,
                                        onMatchUpdate: handleMatchUpdate,
                                        onPlayMatch: handlePlayMatch
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                        lineNumber: 507,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-xl font-semibold text-white mb-4",
                                                children: "Active Players"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                lineNumber: 517,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3",
                                                children: getActivePlayers().map((player)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-col items-center bg-[#2a2f3a] rounded-lg p-3 border border-gray-600",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-12 h-12 rounded-full bg-[#3a3f4a] overflow-hidden border-2 border-green-500",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                    src: player.avatar,
                                                                    alt: player.name,
                                                                    width: 48,
                                                                    height: 48,
                                                                    className: "w-full h-full object-cover"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                                    lineNumber: 522,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                                lineNumber: 521,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-green-400 text-sm mt-2 truncate max-w-full font-medium",
                                                                children: getDisplayName(player)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                                lineNumber: 530,
                                                                columnNumber: 27
                                                            }, this),
                                                            player.nickname && player.nickname !== player.name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-gray-400 text-xs truncate max-w-full",
                                                                children: [
                                                                    "(",
                                                                    player.name,
                                                                    ")"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                                lineNumber: 534,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, player.id, true, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                        lineNumber: 520,
                                                        columnNumber: 25
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                lineNumber: 518,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                        lineNumber: 516,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                        lineNumber: 453,
                        columnNumber: 13
                    }, this),
                    tournamentComplete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-[#1a1d23] rounded-lg p-8 border border-gray-700/50",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-gradient-to-b from-yellow-400 to-yellow-600 p-2 rounded-full mb-6",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-32 h-32 rounded-full bg-[#2a2f3a] overflow-hidden border-4 border-yellow-500",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    src: champion?.avatar || '/mghalmi.jpg',
                                                    alt: champion?.name || 'Champion',
                                                    width: 128,
                                                    height: 128,
                                                    className: "w-full h-full object-cover"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                    lineNumber: 554,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                                lineNumber: 553,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                            lineNumber: 552,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-3xl font-bold text-white mb-2",
                                            children: "🏆 Tournament Champion"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                            lineNumber: 564,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-yellow-400 text-4xl font-bold mb-2",
                                            children: champion ? getDisplayName(champion) : 'Unknown'
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                            lineNumber: 565,
                                            columnNumber: 19
                                        }, this),
                                        champion?.nickname && champion.nickname !== champion.name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-yellow-300 text-xl mb-6",
                                            children: [
                                                "(",
                                                champion.name,
                                                ")"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                            lineNumber: 569,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                    lineNumber: 551,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                lineNumber: 550,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$tournament$2f$TournamentBracket$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                participants: participants,
                                tournamentSize: tournamentSize,
                                matches: matches,
                                currentRound: currentRound,
                                onMatchUpdate: ()=>{}
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                lineNumber: 576,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-center space-x-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: resetTournament,
                                    className: "px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg transition-colors",
                                    children: "New Tournament"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                    lineNumber: 585,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                                lineNumber: 584,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                        lineNumber: 549,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
                lineNumber: 353,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
            lineNumber: 352,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(main)/play/tournament/LocalTournament.tsx",
        lineNumber: 351,
        columnNumber: 5
    }, this);
};
_s(LocalTournamentMode, "ugu0aE+XjsCmww5+5r7U/VTnJKM=");
_c2 = LocalTournamentMode;
const __TURBOPACK__default__export__ = LocalTournamentMode;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "ParticipantItem");
__turbopack_context__.k.register(_c1, "RoundControls");
__turbopack_context__.k.register(_c2, "LocalTournamentMode");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/play/tournament/OnlineTournament.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>OnlineTournament)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/mockData.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$tournament$2f$TournamentBracket$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/play/tournament/TournamentBracket.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
const OnlinePlayMode = ({ onInvitePlayer, pendingInvites, sentInvites })=>{
    _s();
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [friends, setFriends] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onlineFriends"]);
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
            color: 'bg-green-600 hover:bg-green-700'
        };
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-white text-xl font-semibold mb-4",
                children: "Invite Players"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                            className: "h-5 w-5 text-gray-400"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                            lineNumber: 50,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        placeholder: "Search for players...",
                        value: searchQuery,
                        onChange: (e)=>setSearchQuery(e.target.value),
                        className: "w-full pl-12 pr-4 py-3 bg-[#2a2f3a] text-white rounded-lg border border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3 max-h-96 overflow-y-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                        className: "text-white text-lg font-medium mb-3",
                        children: "Online Players"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    filteredPlayers.length > 0 ? filteredPlayers.map((player)=>{
                        const buttonState = getPlayerButtonState(player);
                        const isAvailable = player.GameStatus === 'Available';
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between p-3 hover:bg-[#2a2f3a] rounded-lg transition-colors border border-gray-700/50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center space-x-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-10 h-10 rounded-full overflow-hidden border-2 border-gray-600",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        src: player.avatar,
                                                        alt: player.name,
                                                        width: 40,
                                                        height: 40,
                                                        className: "w-full h-full object-cover"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                        lineNumber: 74,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                    lineNumber: 73,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1a1d23] ${player.GameStatus === 'Available' ? 'bg-green-500' : player.GameStatus === 'In a match' ? 'bg-yellow-500' : 'bg-red-500'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                    lineNumber: 83,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                            lineNumber: 72,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-white font-medium",
                                                    children: player.name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                    lineNumber: 89,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: `text-sm ${player.GameStatus === 'Available' ? 'text-green-400' : player.GameStatus === 'In a match' ? 'text-yellow-400' : 'text-gray-400'}`,
                                                    children: player.GameStatus
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                    lineNumber: 90,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                            lineNumber: 88,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                    lineNumber: 71,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>onInvitePlayer(player),
                                    disabled: buttonState.disabled || !isAvailable,
                                    className: `px-4 py-2 rounded-lg font-medium transition-colors ${!isAvailable ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : buttonState.disabled ? `${buttonState.color} text-white cursor-not-allowed` : `${buttonState.color} text-white`}`,
                                    children: !isAvailable ? 'Unavailable' : buttonState.text
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                    lineNumber: 99,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, player.name, true, {
                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                            lineNumber: 70,
                            columnNumber: 15
                        }, this);
                    }) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center py-8",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-400",
                            children: "No players found matching your search."
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                            lineNumber: 117,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                        lineNumber: 116,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
};
_s(OnlinePlayMode, "mW12D1+8WpZm3NUaYk1yDGx+NiE=");
_c = OnlinePlayMode;
const ParticipantItem = ({ player, removeParticipant, isHost })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center bg-[#1a1d23] rounded-lg p-3 hover:bg-[#2a2f3a] transition-all border border-gray-700/50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-10 h-10 rounded-full bg-[#2a2f3a] flex-shrink-0 overflow-hidden mr-3 border border-gray-600",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    src: player.avatar,
                    alt: player.login,
                    width: 40,
                    height: 40,
                    className: "w-full h-full object-cover"
                }, void 0, false, {
                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                    lineNumber: 133,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                lineNumber: 132,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-grow",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-white font-medium",
                        children: player.login
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                        lineNumber: 142,
                        columnNumber: 9
                    }, this),
                    player.nickname && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-gray-400 text-sm",
                        children: player.nickname
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                        lineNumber: 144,
                        columnNumber: 11
                    }, this),
                    player.isHost && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-blue-400 text-xs",
                        children: "Host"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                        lineNumber: 147,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                lineNumber: 141,
                columnNumber: 7
            }, this),
            !player.isHost && isHost && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>removeParticipant(player.nickname),
                className: "ml-2 text-red-400 hover:text-red-300 transition-colors p-1 rounded-lg hover:bg-red-400/10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    xmlns: "http://www.w3.org/2000/svg",
                    className: "h-5 w-5",
                    viewBox: "0 0 20 20",
                    fill: "currentColor",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        fillRule: "evenodd",
                        d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
                        clipRule: "evenodd"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                        lineNumber: 156,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                    lineNumber: 155,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                lineNumber: 151,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
        lineNumber: 131,
        columnNumber: 5
    }, this);
};
_c1 = ParticipantItem;
const RoundControls = ({ currentRound, totalRounds, onAdvanceRound, canAdvance })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center justify-center mb-6 bg-[#1a1d23] rounded-lg p-4 border border-gray-700/50",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center space-x-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-white text-lg",
                        children: "Round:"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                        lineNumber: 173,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-blue-400 font-bold text-xl",
                        children: [
                            currentRound + 1,
                            "/",
                            totalRounds
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                        lineNumber: 174,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                lineNumber: 172,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onAdvanceRound,
                disabled: !canAdvance,
                className: `ml-6 px-6 py-2 rounded-lg text-white font-medium transition-colors ${canAdvance ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 cursor-not-allowed opacity-50'}`,
                children: currentRound + 1 === totalRounds ? "End Tournament" : "Next Round"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                lineNumber: 177,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
        lineNumber: 171,
        columnNumber: 5
    }, this);
};
_c2 = RoundControls;
function OnlineTournament() {
    _s1();
    const [tournamentState, setTournamentState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('setup'); // setup, lobby, in_progress
    const [tournamentName, setTournamentName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Online Pong Championship');
    const [tournamentSize, setTournamentSize] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(4);
    const [currentRound, setCurrentRound] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [participants, setParticipants] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        {
            id: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["user"].nickname,
            login: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["user"].name,
            avatar: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["user"].avatar,
            nickname: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["user"].nickname,
            isHost: true
        }
    ]);
    const [matches, setMatches] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [sentInvites, setSentInvites] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Map());
    const [pendingInvites, setPendingInvites] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Map());
    const [tournamentComplete, setTournamentComplete] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [champion, setChampion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const totalRounds = Math.log2(tournamentSize);
    // Helper function to get display name
    const getDisplayName = (player)=>{
        return player?.nickname?.trim() || player?.login || 'Unknown Player';
    };
    // Handle match updates
    const handleMatchUpdate = (roundIndex, matchIndex, newState)=>{
        setMatches((prevMatches)=>{
            const updatedMatches = [
                ...prevMatches
            ];
            const matchToUpdateIndex = updatedMatches.findIndex((m)=>m.round === roundIndex && m.matchIndex === matchIndex);
            if (matchToUpdateIndex === -1) return prevMatches;
            const matchToUpdate = {
                ...updatedMatches[matchToUpdateIndex]
            };
            matchToUpdate.state = newState;
            updatedMatches[matchToUpdateIndex] = matchToUpdate;
            // If we have a winner, update next round's match
            if (newState === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN || newState === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN) {
                const winner = newState === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN ? matchToUpdate.player1 : matchToUpdate.player2;
                // Check if this is the final match
                if (roundIndex === totalRounds - 1) {
                    setChampion(winner);
                    setTournamentComplete(true);
                } else if (roundIndex < totalRounds - 1) {
                    const nextRound = roundIndex + 1;
                    const nextMatchIndex = Math.floor(matchIndex / 2);
                    const isFirstMatchOfPair = matchIndex % 2 === 0;
                    const nextMatchIndex2 = updatedMatches.findIndex((m)=>m.round === nextRound && m.matchIndex === nextMatchIndex);
                    if (nextMatchIndex2 !== -1) {
                        const nextMatch = {
                            ...updatedMatches[nextMatchIndex2]
                        };
                        // Update player1 or player2 based on which match this was
                        if (isFirstMatchOfPair) {
                            nextMatch.player1 = winner;
                        } else {
                            nextMatch.player2 = winner;
                        }
                        updatedMatches[nextMatchIndex2] = nextMatch;
                    }
                }
            }
            return updatedMatches;
        });
    };
    // Check if all matches in current round are completed
    const canAdvanceRound = ()=>{
        const currentRoundMatches = matches.filter((m)=>m.round === currentRound);
        return currentRoundMatches.length > 0 && currentRoundMatches.every((m)=>m.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN || m.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN);
    };
    // Advance to next round
    const advanceRound = ()=>{
        if (currentRound < totalRounds - 1) {
            setCurrentRound((prevRound)=>prevRound + 1);
        } else {
            // Tournament is completed
            const finalMatch = matches.find((m)=>m.round === totalRounds - 1 && m.matchIndex === 0);
            if (finalMatch) {
                const winner = finalMatch.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN ? finalMatch.player1 : finalMatch.player2;
                setChampion(winner);
            }
            setTournamentComplete(true);
        }
    };
    // Start tournament logic
    const startTournament = ()=>{
        if (participants.length < tournamentSize) {
            alert(`You need ${tournamentSize} players to start the tournament!`);
            return;
        }
        // Initialize tournament bracket
        const initialMatches = [];
        // Create first round matches
        for(let i = 0; i < tournamentSize / 2; i++){
            const player1 = participants[i * 2] || null;
            const player2 = participants[i * 2 + 1] || null;
            initialMatches.push({
                id: crypto.randomUUID(),
                round: 0,
                matchIndex: i,
                player1: player1,
                player2: player2,
                state: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].WAITING
            });
        }
        // Create placeholder matches for future rounds
        for(let round = 1; round < totalRounds; round++){
            const matchesInRound = tournamentSize / Math.pow(2, round + 1);
            for(let i = 0; i < matchesInRound; i++){
                initialMatches.push({
                    id: crypto.randomUUID(),
                    round: round,
                    matchIndex: i,
                    player1: null,
                    player2: null,
                    state: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].WAITING
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
                id: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["user"].nickname,
                login: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["user"].name,
                avatar: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["user"].avatar,
                nickname: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["user"].nickname,
                isHost: true
            }
        ]);
        setMatches([]);
        setCurrentRound(0);
        setTournamentState('setup');
        setSentInvites(new Map());
        setPendingInvites(new Map());
        setTournamentComplete(false);
        setChampion(null);
    };
    // Remove participant (host only)
    const removeParticipant = (playerNickname)=>{
        if (playerNickname === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["user"].nickname) return; // Can't remove host
        setParticipants((prev)=>prev.filter((p)=>p.nickname !== playerNickname));
    };
    // Reset tournament
    const resetTournament = ()=>{
        leaveTournament();
    };
    // Get players who are still in the tournament (not eliminated)
    const getActivePlayers = ()=>{
        const eliminatedPlayerIds = new Set();
        // Find all eliminated players
        matches.forEach((match)=>{
            if (match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER1_WIN && match.player2) {
                eliminatedPlayerIds.add(match.player2.id);
            } else if (match.state === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$mockData$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MATCH_STATES"].PLAYER2_WIN && match.player1) {
                eliminatedPlayerIds.add(match.player1.id);
            }
        });
        // Return active players
        return participants.filter((p)=>!eliminatedPlayerIds.has(p.id));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full w-full text-white",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center min-h-[calc(100vh-80px)] px-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-center text-4xl md:text-5xl font-bold mb-8",
                        children: tournamentState === 'setup' ? "Online Tournament" : tournamentName
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                        lineNumber: 437,
                        columnNumber: 11
                    }, this),
                    tournamentState === 'setup' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl font-semibold mb-6",
                                        children: "Tournament Setup"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                        lineNumber: 446,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-gray-300 mb-2 text-lg",
                                                children: "Tournament Name"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                lineNumber: 449,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                value: tournamentName,
                                                onChange: (e)=>setTournamentName(e.target.value),
                                                className: "bg-[#2a2f3a] text-white rounded-lg px-4 py-3 w-full outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 text-lg",
                                                placeholder: "Enter tournament name",
                                                required: true
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                lineNumber: 450,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                        lineNumber: 448,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-gray-300 mb-3 text-lg",
                                                children: "Tournament Size"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                lineNumber: 461,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-3 gap-3",
                                                children: [
                                                    4,
                                                    8,
                                                    16
                                                ].map((size)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: `py-3 px-4 rounded-lg font-medium transition-colors ${tournamentSize === size ? 'bg-blue-600 text-white' : 'bg-[#2a2f3a] text-gray-300 hover:bg-[#3a3f4a] border border-gray-600'}`,
                                                        onClick: ()=>setTournamentSize(size),
                                                        children: [
                                                            size,
                                                            " Players"
                                                        ]
                                                    }, size, true, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                        lineNumber: 464,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                lineNumber: 462,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                        lineNumber: 460,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                lineNumber: 445,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setTournamentState('lobby'),
                                    disabled: !tournamentName || tournamentName.trim().length === 0,
                                    className: `w-full max-w-md text-white font-semibold rounded-lg py-4 text-xl transition-all ${tournamentName && tournamentName.trim().length !== 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'}`,
                                    children: "Create Tournament"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                    lineNumber: 480,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                lineNumber: 479,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                        lineNumber: 443,
                        columnNumber: 13
                    }, this),
                    tournamentState === 'lobby' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 lg:grid-cols-2 gap-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between items-center mb-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-2xl font-semibold text-white",
                                                children: "Tournament Lobby"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                lineNumber: 501,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center space-x-4",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "px-3 py-1 bg-yellow-600/70 rounded-full text-white text-sm font-medium",
                                                    children: "Waiting for Players"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                    lineNumber: 503,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                lineNumber: 502,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                        lineNumber: 500,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-between items-center mb-4",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                    className: "text-white text-lg font-medium",
                                                    children: [
                                                        "Participants (",
                                                        participants.length,
                                                        "/",
                                                        tournamentSize,
                                                        ")"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                    lineNumber: 511,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                lineNumber: 510,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-1 md:grid-cols-2 gap-3 mb-6",
                                                children: [
                                                    participants.map((player)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ParticipantItem, {
                                                            player: player,
                                                            removeParticipant: removeParticipant,
                                                            isHost: true
                                                        }, player.id, false, {
                                                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                            lineNumber: 516,
                                                            columnNumber: 23
                                                        }, this)),
                                                    Array.from({
                                                        length: tournamentSize - participants.length
                                                    }).map((_, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center justify-center bg-[#1a1d23] rounded-lg p-3 border border-gray-700/50 border-dashed min-h-[58px]",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-gray-400",
                                                                children: "Waiting for player..."
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                                lineNumber: 527,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, `empty-${index}`, false, {
                                                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                            lineNumber: 526,
                                                            columnNumber: 23
                                                        }, this))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                lineNumber: 514,
                                                columnNumber: 19
                                            }, this),
                                            participants.length < tournamentSize && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-yellow-400 text-sm mb-4",
                                                children: [
                                                    "You need to invite ",
                                                    tournamentSize - participants.length,
                                                    " more players"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                lineNumber: 533,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                        lineNumber: 509,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: leaveTournament,
                                                className: "flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors",
                                                children: "Cancel Tournament"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                lineNumber: 540,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: startTournament,
                                                disabled: participants.length < tournamentSize,
                                                className: `flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${participants.length >= tournamentSize ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-600 cursor-not-allowed text-gray-400'}`,
                                                children: "Start Tournament"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                lineNumber: 546,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                        lineNumber: 539,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                lineNumber: 499,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(OnlinePlayMode, {
                                onInvitePlayer: handleInvitePlayer,
                                pendingInvites: pendingInvites,
                                sentInvites: sentInvites
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                lineNumber: 561,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                        lineNumber: 497,
                        columnNumber: 13
                    }, this),
                    tournamentState === 'in_progress' && !tournamentComplete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(RoundControls, {
                                currentRound: currentRound,
                                totalRounds: totalRounds,
                                onAdvanceRound: advanceRound,
                                canAdvance: canAdvanceRound()
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                lineNumber: 572,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$tournament$2f$TournamentBracket$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                participants: participants,
                                tournamentSize: tournamentSize,
                                matches: matches,
                                currentRound: currentRound,
                                onMatchUpdate: handleMatchUpdate
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                lineNumber: 579,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-[#1a1d23] rounded-lg p-6 border border-gray-700/50",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-xl font-semibold text-white mb-4",
                                        children: "Active Players"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                        lineNumber: 588,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3",
                                        children: getActivePlayers().map((player)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col items-center bg-[#2a2f3a] rounded-lg p-3 border border-gray-600",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-12 h-12 rounded-full bg-[#3a3f4a] overflow-hidden border-2 border-green-500",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            src: player.avatar,
                                                            alt: player.login,
                                                            width: 48,
                                                            height: 48,
                                                            className: "w-full h-full object-cover"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                            lineNumber: 593,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                        lineNumber: 592,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-green-400 text-sm mt-2 truncate max-w-full font-medium",
                                                        children: getDisplayName(player)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                        lineNumber: 601,
                                                        columnNumber: 23
                                                    }, this),
                                                    player.nickname && player.nickname !== player.login && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-gray-400 text-xs truncate max-w-full",
                                                        children: [
                                                            "(",
                                                            player.login,
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                        lineNumber: 605,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, player.id, true, {
                                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                lineNumber: 591,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                        lineNumber: 589,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                lineNumber: 587,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                        lineNumber: 571,
                        columnNumber: 13
                    }, this),
                    tournamentComplete && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center space-y-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-[#1a1d23] rounded-lg p-8 border border-gray-700/50",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-gradient-to-b from-yellow-400 to-yellow-600 p-2 rounded-full mb-6",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-32 h-32 rounded-full bg-[#2a2f3a] overflow-hidden border-4 border-yellow-500",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    src: champion?.avatar || '/mghalmi.jpg',
                                                    alt: champion?.login || 'Champion',
                                                    width: 128,
                                                    height: 128,
                                                    className: "w-full h-full object-cover"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                    lineNumber: 623,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                                lineNumber: 622,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                            lineNumber: 621,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-3xl font-bold text-white mb-2",
                                            children: "🏆 Tournament Champion"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                            lineNumber: 633,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-yellow-400 text-4xl font-bold mb-2",
                                            children: champion ? getDisplayName(champion) : 'Unknown'
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                            lineNumber: 634,
                                            columnNumber: 19
                                        }, this),
                                        champion?.nickname && champion.nickname !== champion.login && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-yellow-300 text-xl mb-6",
                                            children: [
                                                "(",
                                                champion.login,
                                                ")"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                            lineNumber: 638,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                    lineNumber: 620,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                lineNumber: 619,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$tournament$2f$TournamentBracket$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                participants: participants,
                                tournamentSize: tournamentSize,
                                matches: matches,
                                currentRound: currentRound,
                                onMatchUpdate: ()=>{}
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                lineNumber: 645,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-center space-x-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: resetTournament,
                                    className: "px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg transition-colors",
                                    children: "New Tournament"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                    lineNumber: 654,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                                lineNumber: 653,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                        lineNumber: 618,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
                lineNumber: 436,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
            lineNumber: 435,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/(main)/play/tournament/OnlineTournament.tsx",
        lineNumber: 434,
        columnNumber: 5
    }, this);
}
_s1(OnlineTournament, "KXwPjs6rSY6bsf/wjEJwji6esGs=");
_c3 = OnlineTournament;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "OnlinePlayMode");
__turbopack_context__.k.register(_c1, "ParticipantItem");
__turbopack_context__.k.register(_c2, "RoundControls");
__turbopack_context__.k.register(_c3, "OnlineTournament");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/(main)/play/tournament/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>TournamentPage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$tournament$2f$LocalTournament$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/play/tournament/LocalTournament.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$tournament$2f$OnlineTournament$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/play/tournament/OnlineTournament.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function TournamentPage() {
    _s();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const [gameMode, setGameMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TournamentPage.useEffect": ()=>{
            const modeParam = searchParams.get('mode');
            if (modeParam === 'Local' || modeParam === 'Online') {
                setGameMode(modeParam);
            } else {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notFound"])();
            }
        }
    }["TournamentPage.useEffect"], [
        searchParams
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: gameMode === 'Local' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$tournament$2f$LocalTournament$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
            fileName: "[project]/src/app/(main)/play/tournament/page.tsx",
            lineNumber: 25,
            columnNumber: 11
        }, this) : gameMode === 'Online' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$play$2f$tournament$2f$OnlineTournament$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
            fileName: "[project]/src/app/(main)/play/tournament/page.tsx",
            lineNumber: 27,
            columnNumber: 11
        }, this) : null
    }, void 0, false);
}
_s(TournamentPage, "5cip3yabFqzf+WqnV0Wvmao0LBk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c = TournamentPage;
var _c;
__turbopack_context__.k.register(_c, "TournamentPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_app_%28main%29_play_51fffe7a._.js.map