module.exports = {

"[externals]/fs [external] (fs, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}}),
"[externals]/stream [external] (stream, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}}),
"[externals]/zlib [external] (zlib, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}}),
"[project]/src/app/(Login)/layout.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>fixednav)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/router.js [app-ssr] (ecmascript)");
"use client";
;
;
function fixednav() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$router$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
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
    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: "zahya"
    }, void 0, false, {
        fileName: "[project]/src/app/(Login)/layout.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this));
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__c8f3ff75._.js.map