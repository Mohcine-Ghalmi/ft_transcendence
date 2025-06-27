(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/app/(Login)/layout.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>fixednav)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function fixednav() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const currentPath = router.pathname;
    // Determine button configuration based on current route
    const getButtonConfig = ()=>{
        switch(currentPath){
            case '/signup':
            case '/SignUp':
                return {
                    text: 'Login',
                    href: '/login'
                };
            case '/login':
            case '/Login':
                return {
                    text: 'Sign Up',
                    href: '/signup'
                };
            default:
                return {
                    text: 'Sign Up',
                    href: '/signup'
                };
        }
    };
    const buttonConfig = getButtonConfig();
    return(// <header className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
    //   <div className="flex items-center gap-3">
    //     <Image 
    //       src="/vector---0.svg" 
    //       alt="Logo" 
    //       width={32} 
    //       height={32} 
    //       className="w-8 h-8" 
    //     />
    //     <h1 className="text-white font-semibold text-lg">PingPong</h1>
    //   </div>
    //   <Link href={buttonConfig.href} passHref>
    //     <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
    //       {buttonConfig.text}
    //     </button>
    //   </Link>
    // </header>
    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: "zahya"
    }, void 0, false, {
        fileName: "[project]/src/app/(Login)/layout.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this));
}
_s(fixednav, "fN7XvhJ+p5oE6+Xlo0NJmXpxjC8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_app_%28Login%29_layout_tsx_e755f3b8._.js.map