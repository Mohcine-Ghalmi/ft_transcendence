(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/app/(Login)/SignUp/SingUpPage.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>Signup)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function Signup() {
    _s();
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        avatar: null,
        twoFactorCode: ''
    });
    const [currentStep, setCurrentStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [errors, setErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        avatar: '',
        twoFactorCode: ''
    });
    const [touched, setTouched] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        username: false,
        email: false,
        password: false,
        confirmPassword: false,
        avatar: false,
        twoFactorCode: false
    });
    const [avatarPreview, setAvatarPreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isDragOver, setIsDragOver] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const validateField = (name, value)=>{
        let error = '';
        switch(name){
            case 'username':
                if (!value || typeof value === 'string' && !value.trim()) {
                    error = 'Username is required';
                } else if (typeof value === 'string' && value.length < 3) {
                    error = 'Username must be at least 3 characters';
                } else if (typeof value === 'string' && !/^[a-zA-Z0-9_]+$/.test(value)) {
                    error = 'Username can only contain letters, numbers, and underscores';
                }
                break;
            case 'email':
                if (!value || typeof value === 'string' && !value.trim()) {
                    error = 'Email is required';
                } else if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    error = 'Please enter a valid email address';
                }
                break;
            case 'password':
                if (!value) {
                    error = 'Password is required';
                } else if (typeof value === 'string' && value.length < 8) {
                    error = 'Password must be at least 8 characters';
                } else if (typeof value === 'string' && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                    error = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
                }
                break;
            case 'confirmPassword':
                if (!value) {
                    error = 'Please confirm your password';
                } else if (typeof value === 'string' && value !== formData.password) {
                    error = 'Passwords do not match';
                }
                break;
            case 'avatar':
                // Make avatar required - remove this condition if avatar should be optional
                if (!value) {
                    error = 'Please upload an avatar image';
                } else if (value && value instanceof File) {
                    const maxSize = 5 * 1024 * 1024; // 5MB
                    const allowedTypes = [
                        'image/jpeg',
                        'image/png',
                        'image/gif',
                        'image/webp'
                    ];
                    if (!allowedTypes.includes(value.type)) {
                        error = 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)';
                    } else if (value.size > maxSize) {
                        error = 'File size must be less than 5MB';
                    }
                }
                break;
            case 'twoFactorCode':
                if (!value || typeof value === 'string' && !value.trim()) {
                    error = 'Two-factor code is required';
                } else if (typeof value === 'string' && !/^\d{6}$/.test(value)) {
                    error = 'Please enter a valid 6-digit code';
                }
                break;
            default:
                break;
        }
        return error;
    };
    const handleInputChange = (e)=>{
        const { name, value } = e.target;
        setFormData((prev)=>({
                ...prev,
                [name]: value
            }));
        // Mark field as touched
        setTouched((prev)=>({
                ...prev,
                [name]: true
            }));
        // Validate field
        const error = validateField(name, value);
        setErrors((prev)=>({
                ...prev,
                [name]: error
            }));
        // Special case: revalidate confirmPassword when password changes
        if (name === 'password' && touched.confirmPassword) {
            const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
            setErrors((prev)=>({
                    ...prev,
                    confirmPassword: confirmPasswordError
                }));
        }
    };
    const handleAvatarUpload = (file)=>{
        const error = validateField('avatar', file);
        setErrors((prev)=>({
                ...prev,
                avatar: error
            }));
        if (!error) {
            setFormData((prev)=>({
                    ...prev,
                    avatar: file
                }));
            // Create preview
            const reader = new FileReader();
            reader.onload = (e)=>{
                setAvatarPreview(e.target?.result);
            };
            reader.readAsDataURL(file);
        }
        // Mark avatar as touched
        setTouched((prev)=>({
                ...prev,
                avatar: true
            }));
    };
    const handleFileInputChange = (e)=>{
        const file = e.target.files?.[0];
        if (file) {
            handleAvatarUpload(file);
        }
    };
    const handleDragOver = (e)=>{
        e.preventDefault();
        setIsDragOver(true);
    };
    const handleDragLeave = (e)=>{
        e.preventDefault();
        setIsDragOver(false);
    };
    const handleDrop = (e)=>{
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleAvatarUpload(file);
        }
    };
    const handleBrowseClick = ()=>{
        fileInputRef.current?.click();
    };
    const handleSubmit = (e)=>{
        e.preventDefault();
        if (currentStep === 1) {
            // Mark step 1 fields as touched
            setTouched((prev)=>({
                    ...prev,
                    username: true,
                    email: true,
                    password: true,
                    confirmPassword: true
                }));
            // Validate step 1 fields
            const newErrors = {
                ...errors,
                username: validateField('username', formData.username),
                email: validateField('email', formData.email),
                password: validateField('password', formData.password),
                confirmPassword: validateField('confirmPassword', formData.confirmPassword)
            };
            setErrors(newErrors);
            // Check if step 1 is valid
            const isStep1Valid = !newErrors.username && !newErrors.email && !newErrors.password && !newErrors.confirmPassword;
            if (isStep1Valid) {
                setCurrentStep(2);
            }
        } else if (currentStep === 2) {
            // Mark avatar as touched
            setTouched((prev)=>({
                    ...prev,
                    avatar: true
                }));
            // Validate avatar
            const avatarError = validateField('avatar', formData.avatar);
            setErrors((prev)=>({
                    ...prev,
                    avatar: avatarError
                }));
            // Check if avatar is valid (or if you want to make it optional, remove this validation)
            if (!avatarError) {
                setCurrentStep(3);
            }
        } else if (currentStep === 3) {
            // Final step - complete registration
            console.log('Form submitted:', formData);
        // Here you would typically handle the final form submission
        }
    };
    const handleBack = ()=>{
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };
    const handleSkipFor2FA = ()=>{
        console.log('Skipping 2FA for now');
        // Complete registration without 2FA
        console.log('Form submitted:', formData);
        alert('Account created successfully!');
    };
    const handleGoogleSignIn = ()=>{
        console.log('Google sign in clicked');
    };
    const handleContinueWithIntra = ()=>{
        console.log('Continue with intra clicked');
    };
    const handle2FaVerify = (e)=>{
        e.preventDefault();
        setTouched((prev)=>({
                ...prev,
                twoFactorCode: true
            }));
        const error = validateField('twoFactorCode', formData.twoFactorCode);
        setErrors((prev)=>({
                ...prev,
                twoFactorCode: error
            }));
        if (!error) {
            // 2FA code is valid
            alert('Account created successfully!');
        // You can add further logic here (e.g., redirect, API call)
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen text-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex items-center bg-[#121417] justify-between px-6 py-4 border-b border-gray-700",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "hover:text-white",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/",
                            className: "flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    src: "/vector---0.svg",
                                    alt: "Logo",
                                    width: 32,
                                    height: 32,
                                    className: "w-7 h-7 sm:w-8 sm:h-8"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                    lineNumber: 297,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-white font-semibold text-base sm:text-lg",
                                    children: "PingPong"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                    lineNumber: 298,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                            lineNumber: 296,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                        lineNumber: 295,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        passHref: true,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors",
                            children: "Login"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                            lineNumber: 302,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                        lineNumber: 301,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                lineNumber: 293,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-center min-h-[calc(100vh-80px)] px-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-2xl md:text-3xl xl:text-5xl font-bold text-center mb-8",
                            children: currentStep === 1 ? 'Create your account' : currentStep === 2 ? 'Upload avatar' : 'Welcome!'
                        }, void 0, false, {
                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                            lineNumber: 311,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleSubmit,
                            children: [
                                currentStep === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    name: "username",
                                                    placeholder: "Username",
                                                    value: formData.username,
                                                    onChange: handleInputChange,
                                                    className: `w-full px-4 md:px-6 xl:px-10 py-3 md:py-4 xl:py-6 bg-gray-800 border rounded-lg md:rounded-xl xl:rounded-2xl focus:outline-none transition-colors placeholder-gray-400 text-base md:text-lg xl:text-2xl ${errors.username && touched.username ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-blue-500'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                    lineNumber: 320,
                                                    columnNumber: 19
                                                }, this),
                                                errors.username && touched.username && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-red-500 text-sm md:text-base xl:text-lg mt-1",
                                                    children: errors.username
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                    lineNumber: 333,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                            lineNumber: 319,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "email",
                                                    name: "email",
                                                    placeholder: "Email",
                                                    value: formData.email,
                                                    onChange: handleInputChange,
                                                    className: `w-full px-4 md:px-6 xl:px-10 py-3 md:py-4 xl:py-6 bg-gray-800 border rounded-lg md:rounded-xl xl:rounded-2xl focus:outline-none transition-colors placeholder-gray-400 text-base md:text-lg xl:text-2xl ${errors.email && touched.email ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-blue-500'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                    lineNumber: 338,
                                                    columnNumber: 19
                                                }, this),
                                                errors.email && touched.email && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-red-500 text-sm md:text-base xl:text-lg mt-1",
                                                    children: errors.email
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                    lineNumber: 351,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                            lineNumber: 337,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "password",
                                                    name: "password",
                                                    placeholder: "Password",
                                                    value: formData.password,
                                                    onChange: handleInputChange,
                                                    className: `w-full px-4 md:px-6 xl:px-10 py-3 md:py-4 xl:py-6 bg-gray-800 border rounded-lg md:rounded-xl xl:rounded-2xl focus:outline-none transition-colors placeholder-gray-400 text-base md:text-lg xl:text-2xl ${errors.password && touched.password ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-blue-500'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                    lineNumber: 356,
                                                    columnNumber: 19
                                                }, this),
                                                errors.password && touched.password && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-red-500 text-sm md:text-base xl:text-lg mt-1",
                                                    children: errors.password
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                    lineNumber: 369,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                            lineNumber: 355,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "password",
                                                    name: "confirmPassword",
                                                    placeholder: "Confirm Password",
                                                    value: formData.confirmPassword,
                                                    onChange: handleInputChange,
                                                    className: `w-full px-4 md:px-6 xl:px-10 py-3 md:py-4 xl:py-6 bg-gray-800 border rounded-lg md:rounded-xl xl:rounded-2xl focus:outline-none transition-colors placeholder-gray-400 text-base md:text-lg xl:text-2xl ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-blue-500'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                    lineNumber: 374,
                                                    columnNumber: 19
                                                }, this),
                                                errors.confirmPassword && touched.confirmPassword && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-red-500 text-sm md:text-base xl:text-lg mt-1",
                                                    children: errors.confirmPassword
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                    lineNumber: 387,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                            lineNumber: 373,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                    lineNumber: 317,
                                    columnNumber: 15
                                }, this),
                                currentStep === 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-gray-400 text-sm md:text-base xl:text-lg mb-6",
                                                children: "Upload your avatar"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                lineNumber: 395,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                            lineNumber: 394,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `border-2 border-dashed rounded-lg md:rounded-xl xl:rounded-2xl p-20 md:p-12 xl:p-16 transition-colors cursor-pointer ${isDragOver ? 'border-blue-500 bg-blue-500/10' : errors.avatar && touched.avatar ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-gray-500'}`,
                                            onDragOver: handleDragOver,
                                            onDragLeave: handleDragLeave,
                                            onDrop: handleDrop,
                                            onClick: handleBrowseClick,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center",
                                                children: [
                                                    avatarPreview ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mb-4",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                            src: avatarPreview,
                                                            alt: "Avatar preview",
                                                            className: "w-24 h-24 md:w-32 md:h-32 xl:w-40 xl:h-40 rounded-full mx-auto object-cover border-2 border-gray-600"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                            lineNumber: 414,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                        lineNumber: 413,
                                                        columnNumber: 23
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mb-4",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-16 h-16 md:w-24 md:h-24 xl:w-32 xl:h-32 bg-gray-700 rounded-full mx-auto flex items-center justify-center",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                className: "w-8 h-8 md:w-12 md:h-12 xl:w-16 xl:h-16 text-gray-400",
                                                                fill: "none",
                                                                stroke: "currentColor",
                                                                viewBox: "0 0 24 24",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                    strokeLinecap: "round",
                                                                    strokeLinejoin: "round",
                                                                    strokeWidth: 2,
                                                                    d: "M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                                    lineNumber: 424,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                                lineNumber: 423,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                            lineNumber: 422,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                        lineNumber: 421,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-white font-medium mb-2 text-base md:text-lg xl:text-2xl",
                                                        children: avatarPreview ? 'Change your avatar' : 'Drag and drop your avatar here'
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                        lineNumber: 429,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-gray-400 text-sm md:text-base xl:text-lg mb-4",
                                                        children: "Or browse to choose a file"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                        lineNumber: 432,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: handleBrowseClick,
                                                        className: "bg-gray-700 hover:bg-gray-600 text-white px-6 md:px-8 xl:px-12 py-2 md:py-3 xl:py-4 rounded-lg md:rounded-xl xl:rounded-2xl font-medium transition-colors text-base md:text-lg xl:text-2xl",
                                                        children: "Browse"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                        lineNumber: 433,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                lineNumber: 411,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                            lineNumber: 398,
                                            columnNumber: 17
                                        }, this),
                                        errors.avatar && touched.avatar && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-red-500 text-sm md:text-base xl:text-lg text-center",
                                            children: errors.avatar
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                            lineNumber: 444,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            ref: fileInputRef,
                                            type: "file",
                                            accept: "image/*",
                                            onChange: handleFileInputChange,
                                            className: "hidden"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                            lineNumber: 447,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                    lineNumber: 393,
                                    columnNumber: 15
                                }, this),
                                currentStep === 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "text-xl md:text-2xl xl:text-4xl font-semibold mb-2",
                                                    children: "Two-Factor Authentication"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                    lineNumber: 459,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-400 text-sm md:text-base xl:text-lg mb-6",
                                                    children: "Scan the QR code with your authenticator app or manually enter the code below."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                    lineNumber: 460,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                            lineNumber: 458,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-white p-4 md:p-6 xl:p-10 rounded-lg md:rounded-xl xl:rounded-2xl",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    src: "/qrcode_demo.png",
                                                    alt: "qr code demo",
                                                    width: 400,
                                                    height: 400,
                                                    className: "w-40 h-40 md:w-64 md:h-64 xl:w-96 xl:h-96"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                    lineNumber: 467,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                lineNumber: 466,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                            lineNumber: 465,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    name: "twoFactorCode",
                                                    placeholder: "Enter 2FA Code",
                                                    value: formData.twoFactorCode,
                                                    onChange: handleInputChange,
                                                    maxLength: 6,
                                                    className: `w-full h-12 md:h-16 xl:h-20 px-4 md:px-6 xl:px-10 bg-gray-700 border rounded-lg md:rounded-xl xl:rounded-2xl text-white placeholder-gray-400 text-base md:text-lg xl:text-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${errors.twoFactorCode && touched.twoFactorCode ? 'border-red-500 focus:border-red-500' : 'border-gray-700 focus:border-blue-500'}`
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                    lineNumber: 472,
                                                    columnNumber: 19
                                                }, this),
                                                errors.twoFactorCode && touched.twoFactorCode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-red-500 text-sm md:text-base xl:text-lg mt-1 text-center",
                                                    children: errors.twoFactorCode
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                    lineNumber: 486,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                            lineNumber: 471,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "submit",
                                                    onClick: handle2FaVerify,
                                                    className: "w-full py-3 md:py-4 xl:py-6 bg-blue-600 hover:bg-blue-700 rounded-lg md:rounded-xl xl:rounded-2xl font-medium transition-colors text-base md:text-lg xl:text-2xl",
                                                    children: "Verify"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                    lineNumber: 492,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    href: "/",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: handleSkipFor2FA,
                                                        className: "w-full py-3 md:py-4 xl:py-6 bg-gray-700 hover:bg-gray-600 rounded-lg md:rounded-xl xl:rounded-2xl font-medium transition-colors text-base md:text-lg xl:text-2xl",
                                                        children: "Skip for Now"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                        lineNumber: 500,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                    lineNumber: 499,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                            lineNumber: 491,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                    lineNumber: 457,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "py-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-sm md:text-base xl:text-lg text-gray-400 mb-2",
                                            children: "Account Creation Progress"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                            lineNumber: 513,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-full bg-gray-700 rounded-full h-2 md:h-3 xl:h-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-blue-500 h-2 md:h-3 xl:h-4 rounded-full transition-all duration-300",
                                                style: {
                                                    width: `${currentStep / 3 * 100}%`
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                lineNumber: 515,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                            lineNumber: 514,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-xs md:text-sm xl:text-base text-gray-500 mt-1",
                                            children: [
                                                "Step ",
                                                currentStep,
                                                " of 3"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                            lineNumber: 520,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                    lineNumber: 512,
                                    columnNumber: 13
                                }, this),
                                currentStep === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col md:flex-row gap-3 mb-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: handleGoogleSignIn,
                                            className: "flex-1 h-12 md:h-16 xl:h-20 bg-gray-700 hover:bg-gray-600 text-white rounded-lg md:rounded-xl xl:rounded-2xl flex items-center justify-center gap-3 transition-colors text-base md:text-lg xl:text-2xl",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    src: "/google-.svg",
                                                    alt: "Google",
                                                    width: 32,
                                                    height: 32,
                                                    className: "w-8 h-8 xl:w-12 xl:h-12"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                    lineNumber: 530,
                                                    columnNumber: 19
                                                }, this),
                                                "Sign in with Google"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                            lineNumber: 525,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: handleContinueWithIntra,
                                            className: "flex-1 h-12 md:h-16 xl:h-20 bg-gray-700 hover:bg-gray-600 text-white rounded-lg md:rounded-xl xl:rounded-2xl flex items-center justify-center gap-3 transition-colors text-base md:text-lg xl:text-2xl",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    src: "/group-37.svg",
                                                    alt: "Intra",
                                                    width: 32,
                                                    height: 32,
                                                    className: "w-8 h-8 xl:w-12 xl:h-12"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                                    lineNumber: 538,
                                                    columnNumber: 19
                                                }, this),
                                                "Continue with Intra"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                            lineNumber: 533,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                    lineNumber: 524,
                                    columnNumber: 15
                                }, this),
                                currentStep < 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-3",
                                    children: [
                                        currentStep > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: handleBack,
                                            className: "flex-1 py-3 md:py-4 xl:py-6 bg-gray-700 hover:bg-gray-600 rounded-lg md:rounded-xl xl:rounded-2xl font-medium transition-colors text-base md:text-lg xl:text-2xl",
                                            children: "Back"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                            lineNumber: 547,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "submit",
                                            className: "flex-1 py-3 md:py-4 xl:py-6 bg-blue-600 hover:bg-blue-700 rounded-lg md:rounded-xl xl:rounded-2xl font-medium transition-colors text-base md:text-lg xl:text-2xl",
                                            children: currentStep === 1 ? 'Next' : currentStep === 2 ? 'Next' : 'Finish'
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                            lineNumber: 555,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                    lineNumber: 545,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                            lineNumber: 315,
                            columnNumber: 11
                        }, this),
                        currentStep < 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center mt-6",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-gray-400 text-sm md:text-base xl:text-lg",
                                children: [
                                    "Already have an account?",
                                    ' ',
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-blue-400 hover:text-blue-300 transition-colors cursor-pointer",
                                            children: "Sign in"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                            lineNumber: 571,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                        lineNumber: 570,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                                lineNumber: 568,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                            lineNumber: 567,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                    lineNumber: 310,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
                lineNumber: 309,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(Login)/SignUp/SingUpPage.tsx",
        lineNumber: 291,
        columnNumber: 5
    }, this);
}
_s(Signup, "jOQWMMCNY3xD6eChwfOM86m4Dms=");
_c = Signup;
var _c;
__turbopack_context__.k.register(_c, "Signup");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_app_%28Login%29_SignUp_SingUpPage_tsx_f87cfa38._.js.map