"use client";

import { useState, useEffect, useRef } from 'react';
import useWebSocket from 'react-use-websocket';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Icons
import {
    FiLogOut,
    FiUser,
    FiDollarSign,
    FiSettings,
    FiChevronUp,
    FiChevronDown,
    FiUsers,
    FiTrendingUp,
    FiShield,
    FiHeart,
    FiAlertCircle,
    FiBarChart2,
    FiClock
} from 'react-icons/fi';
import {
    MdFlight,
    MdHistory,
    MdLeaderboard,
    MdVolumeUp,
    MdVolumeOff
} from 'react-icons/md';
import { TbPlaneDeparture } from 'react-icons/tb';

// Types definition
interface Bet {
    username: string;
    amount: number;
    cashedOut: boolean;
    cashOutAt?: number;
    profit?: number;
}

export default function Aviator() {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    // User Data
    const [username, setUsername] = useState<string>("Loading...");
    const [balance, setBalance] = useState(0.00);
    const [token, setToken] = useState<string | null>(null);

    // Game Data
    const [multiplier, setMultiplier] = useState(1.00);
    const [status, setStatus] = useState("CONNECTING");
    const [history, setHistory] = useState<number[]>([]);

    // Betting State
    const [betAmount, setBetAmount] = useState(10.00);
    const [myBet, setMyBet] = useState<{ amount: number; cashedOut: boolean } | null>(null);
    const [allBets, setAllBets] = useState<Bet[]>([]);

    // Settings State
    const [isSoundOn, setIsSoundOn] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [autoCashOut, setAutoCashOut] = useState<number | null>(null);

    // Device Restriction State
    const [isBlocked, setIsBlocked] = useState(false);

    // Mobile UI State
    const [showMobileBets, setShowMobileBets] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Canvas Ref for Animation
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const quickBets = [10, 20, 50, 100, 200, 500];
    const WS_URL = 'ws://164.68.123.57:8000/ws/game/';

    const { sendMessage, lastJsonMessage } = useWebSocket(WS_URL, {
        onOpen: () => console.log('Connected to Game Server'),
        shouldReconnect: () => true,
    });

    // --- INITIAL SETUP ---
    useEffect(() => {
        setIsClient(true);
        checkDeviceRestriction();

        const storedToken = localStorage.getItem('access_token');
        if (!storedToken) {
            router.push('/login');
        } else {
            setToken(storedToken);
            fetchUserData(storedToken);
        }
    }, []);

    const checkDeviceRestriction = async () => {
        try {
            const res = await axios.get('http://164.68.123.57:8000/api/public/settings/');
            if (res.data.restrict_desktop) {
                if (window.innerWidth > 1024) {
                    setIsBlocked(true);
                }
            }
        } catch (error) {
            console.log("Settings check failed.");
        }
    };

    const fetchUserData = async (authToken: string) => {
        try {
            const res = await axios.get('http://164.68.123.57:8000/api/user/', {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setUsername(res.data.username);
            setBalance(Number(res.data.balance));
        } catch (error: any) {
            if (error.response?.status === 401) {
                localStorage.removeItem('access_token');
                router.push('/login');
            }
        }
    };

    // --- NAVIGATION HANDLERS ---
    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        router.push('/login');
    };

    const handleProfileNav = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push('/profile');
    };

    // --- CANVAS ANIMATION LOGIC ---
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize Canvas
        const resizeCanvas = () => {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Drawing Function
        const draw = () => {
            if (!ctx) return;
            const w = canvas.width;
            const h = canvas.height;

            // Clear with deep black
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, w, h);

            // Draw Professional Grid (Like a Chart)
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 1;

            // Draw axis lines
            ctx.beginPath();
            // X-axis
            ctx.moveTo(0, h - 1);
            ctx.lineTo(w, h - 1);
            // Y-axis
            ctx.moveTo(1, 0);
            ctx.lineTo(1, h);
            ctx.stroke();

            // Draw grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.beginPath();
            // Vertical lines
            for (let x = 0; x < w; x += 100) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
            }
            // Horizontal lines
            for (let y = h; y > 0; y -= 80) {
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
            }
            ctx.stroke();

            if (status === "WAITING") {
                // Loading Animation
                ctx.font = "bold 16px 'Inter', sans-serif";
                ctx.fillStyle = "#6B7280";
                ctx.textAlign = "center";
                // ctx.fillText("WAITING FOR NEXT ROUND", w / 2, h / 2 + 50);

                // Loading bar
                // const time = Date.now() / 1000;
                // const barWidth = 150;
                // const progress = (Math.sin(time * 3) + 1) / 2;

                // ctx.fillStyle = "#333";
                // ctx.fillRect(w / 2 - barWidth / 2, h / 2 + 65, barWidth, 4);

                // ctx.fillStyle = "#DC2626";
                // ctx.fillRect(w / 2 - barWidth / 2, h / 2 + 65, barWidth * progress, 4);

                return;
            }

            // --- CHART LOGIC ---
            // Realistic exponential curve
            const maxTime = 10; // "Time" to reach right side
            // Map multiplier to progress (0 to 1) along curve path
            // Logarithmic scale fits multiplier better visually
            const progress = Math.min((Math.log(multiplier) / Math.log(100)) * 1.5, 1.0);
            // Fallback linear for short flights if needed, but log looks more "chart-like"

            // Adjust X and Y to look like a graph
            const startX = 0;
            const startY = h;

            // X moves linearly with time/progress
            // Y moves exponentially to represent multiplier
            const endX = w * progress;
            // Map multiplier 1.00 -> h, High multiplier -> 0
            // We use a curve function: y = h - (h * (1 - 1/x)) kinda logic or simple bezier

            // Bezier Control Point for that "swoosh" look
            const cpX = endX * 0.5;
            const cpY = h;

            // Simple Quadratic looks good:
            // P0=(0,h), P1=(endX, h), P2=(endX, endY) -> Not quite right
            // Let's use computed points based on chart

            const pointX = w * Math.min((multiplier - 1) / 5, 0.9); // scales x
            // Ensure Y goes up. 
            // Let's stick to the previous smooth bezier but refined
            const graphX = w * 0.05 + (w * 0.9 * Math.min((multiplier - 1) / 8, 1));
            const graphY = h - (50 + (h * 0.8 * Math.min((multiplier - 1) / 4, 1))); // Caps at top

            // Let's try a different approach for "Real Graph" feel
            // We draw the line from 0,0 (bottom left) to current point

            if (status === "FLYING" || status === "CRASHED") {
                // 1. Draw The Area Under Curve
                ctx.beginPath();
                ctx.moveTo(0, h);

                // Curve to current point
                // Using bezier to simulate the "knee" of the curve
                ctx.quadraticCurveTo(graphX * 0.6, h, graphX, graphY);

                // Close path for fill
                ctx.lineTo(graphX, h);
                ctx.lineTo(0, h);
                ctx.closePath();

                // Gradient Fill (Red Fade)
                const fillGradient = ctx.createLinearGradient(0, 0, 0, h);
                if (status === "CRASHED") {
                    fillGradient.addColorStop(0, 'rgba(100, 100, 100, 0.1)'); // Greyed out
                    fillGradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
                } else {
                    fillGradient.addColorStop(0, 'rgba(220, 38, 38, 0.6)'); // Bright Red
                    fillGradient.addColorStop(1, 'rgba(220, 38, 38, 0)');   // Transparent
                }
                ctx.fillStyle = fillGradient;
                ctx.fill();

                // 2. Draw The Line Border
                ctx.beginPath();
                ctx.moveTo(0, h);
                ctx.quadraticCurveTo(graphX * 0.6, h, graphX, graphY);

                ctx.strokeStyle = status === "CRASHED" ? '#555' : '#DC2626'; // Red Line
                ctx.lineWidth = 5;
                ctx.lineCap = 'round';
                ctx.stroke();

                // 3. Draw The Plane (Better Shape)
                if (status === "FLYING") {
                    ctx.save();
                    ctx.translate(graphX, graphY);

                    // Rotate slightly up
                    const slope = (h - graphY) / (graphX + 1); // Simple slope proxy
                    const angle = -Math.atan(slope * 0.05) - 0.1; // Slight tilt up

                    ctx.rotate(angle);

                    const scale = 0.6; // Slightly smaller, crisper
                    ctx.scale(scale, scale);

                    // --- DRAW PLANE (Red Vector Style) ---
                    ctx.shadowColor = "rgba(220, 38, 38, 0.8)";
                    ctx.shadowBlur = 20;

                    ctx.fillStyle = "#DC2626"; // Main Red

                    // Fuselage
                    ctx.beginPath();
                    ctx.moveTo(40, 0); // Nose
                    ctx.bezierCurveTo(20, -15, -20, -15, -40, -5); // Top
                    ctx.lineTo(-40, 10); // Back
                    ctx.bezierCurveTo(-20, 15, 20, 15, 40, 0); // Bottom
                    ctx.fill();

                    // Wings (Side/Top Hybrid View)
                    ctx.fillStyle = "#991B1B"; // Darker Red for depth
                    ctx.beginPath();
                    ctx.moveTo(-10, -5);
                    ctx.lineTo(-30, -40); // Top Wing Tip
                    ctx.lineTo(-10, -5);
                    ctx.fill();

                    ctx.beginPath();
                    ctx.moveTo(-10, 5);
                    ctx.lineTo(-35, 25); // Bottom Wing Tip
                    ctx.lineTo(-15, 5);
                    ctx.fill();

                    // Tail
                    ctx.beginPath();
                    ctx.moveTo(-35, -5);
                    ctx.lineTo(-50, -25);
                    ctx.lineTo(-45, 0);
                    ctx.fill();

                    // Propeller Blur (White circle)
                    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                    ctx.beginPath();
                    ctx.ellipse(42, 0, 5, 25, 0, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.restore();
                } else if (status === "CRASHED") {
                    // "Flew Away" text nicely placed near end point
                    ctx.font = "bold 20px 'Inter', sans-serif";
                    ctx.fillStyle = "#DC2626";
                    ctx.textAlign = "right";
                    ctx.fillText("FLEW AWAY", graphX - 20, graphY);

                    // Explosion icon at tip
                    ctx.font = "40px Arial";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText("💥", graphX, graphY);
                }
            }
        };

        const animationId = requestAnimationFrame(draw);
        // Continuous Redraw
        const interval = setInterval(() => {
            requestAnimationFrame(draw);
        }, 1000 / 60);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationId);
            clearInterval(interval);
        };
    }, [status, multiplier]);

    // --- GAME LOGIC ENGINE ---
    useEffect(() => {
        if (lastJsonMessage) {
            const data = lastJsonMessage as any;

            if (data.type === 'all_bets_update') setAllBets(data.bets);

            if (data.status) {
                setStatus(data.status);
                if (data.status === 'FLYING') {
                    setMultiplier(data.multiplier);
                    if (window.innerWidth < 1024) setShowMobileBets(false);
                }
                else if (data.status === 'WAITING') setMultiplier(1.00);
                else if (data.status === 'CRASHED') {
                    setMultiplier(data.multiplier);
                    if (myBet && !myBet.cashedOut) { /* User Lost */ } else { setMyBet(null); }
                    setHistory(prev => {
                        if (prev[0] === data.multiplier) return prev;
                        return [data.multiplier, ...prev].slice(0, 15);
                    });
                }
            }

            if (data.action === "new_bet" && data.bet) {
                setAllBets(prev => {
                    if (prev.find(b => b.username === data.bet.username)) return prev;
                    return [...prev, data.bet];
                });
            }

            if (data.action === "player_cashed_out") {
                setAllBets(prev => prev.map(bet => {
                    if (bet.username === data.username) {
                        return { ...bet, cashedOut: true, cashOutAt: data.multiplier, profit: data.profit };
                    }
                    return bet;
                }));
                if (data.username === username) fetchUserData(token!);
            }

            if (data.action === "clear_bets") {
                setAllBets([]);
                setMyBet(null);
            }
        }
    }, [lastJsonMessage, token, status, username]);

    useEffect(() => {
        if (username === "Loading..." || allBets.length === 0) return;
        const myServerBet = allBets.find(b => b.username === username);
        if (myServerBet) {
            if (!myBet) setMyBet({ amount: myServerBet.amount, cashedOut: myServerBet.cashedOut });
            else if (myServerBet.cashedOut && !myBet.cashedOut) setMyBet(prev => ({ ...prev!, cashedOut: true }));
        }
    }, [allBets, username]);

    const handleAction = () => {
        if (status === "WAITING" && !myBet) {
            if (balance >= betAmount) {
                setBalance(prev => prev - betAmount);
                setMyBet({ amount: betAmount, cashedOut: false });
                sendMessage(JSON.stringify({ action: "place_bet", amount: betAmount, token: token }));
                if (isSoundOn && !isMuted) {
                    // Sound effect placeholder
                }
            } else {
                alert("Insufficient Balance!");
            }
            return;
        }
        if (status === "FLYING" && myBet && !myBet.cashedOut) {
            setMyBet({ ...myBet, cashedOut: true });
            setBalance(prev => prev + (myBet.amount * multiplier));
            sendMessage(JSON.stringify({ action: "cash_out", token: token }));
            if (isSoundOn && !isMuted) {
                // Sound effect placeholder
            }
            return;
        }
    };

    const getButtonState = () => {
        if (status === "WAITING") {
            if (myBet) return {
                text: "BET PLACED",
                subtext: "Waiting for takeoff...",
                color: "bg-gradient-to-r from-emerald-600/20 to-emerald-800/20 border-2 border-emerald-500/30 text-emerald-300",
                disabled: true,
            };
            return {
                text: "PLACE BET",
                subtext: `$${betAmount.toFixed(2)}`,
                color: "bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 shadow-[0_0_50px_rgba(59,130,246,0.5)] active:scale-95",
                disabled: false,
            };
        }
        if (status === "FLYING") {
            if (myBet && !myBet.cashedOut) {
                return {
                    text: "CASH OUT",
                    subtext: `$${(betAmount * multiplier).toFixed(2)}`,
                    color: "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:via-orange-400 hover:to-red-400 shadow-[0_0_60px_rgba(245,158,11,0.6)] active:scale-95 animate-pulse",
                    disabled: false,
                };
            }
            if (myBet && myBet.cashedOut) return {
                text: "CASHED OUT!",
                subtext: `Win: $${(betAmount * multiplier).toFixed(2)}`,
                color: "bg-gradient-to-r from-emerald-600 to-emerald-800 border-2 border-emerald-500/50 text-white",
                disabled: true,
            };
            return {
                text: "FLIGHT IN PROGRESS",
                subtext: null,
                color: "bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 text-gray-400",
                disabled: true,
            };
        }
        return {
            text: "PLANE CRASHED",
            subtext: "Next round starting...",
            color: "bg-gradient-to-r from-red-900/30 to-orange-900/20 border border-red-800/30 text-red-400",
            disabled: true,
        };
    };

    const btn = getButtonState();

    // Helper to render bet list items
    const renderBetList = () => (
        [...allBets].sort((a, b) => {
            if (a.cashedOut && !b.cashedOut) return -1;
            if (!a.cashedOut && b.cashedOut) return 1;
            return 0;
        }).map((bet, i) => {
            const isCrashed = status === "CRASHED";
            const isLost = isCrashed && !bet.cashedOut;
            const isMe = bet.username === username;
            return (
                <div key={i} className={`flex justify-between items-center py-2 px-4 mb-2 rounded-xl transition-all duration-200 
                    ${isMe
                        ? (isLost
                            ? 'bg-gradient-to-r from-red-500/10 to-red-600/5 border border-red-500/20'
                            : 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20')
                        : 'bg-white/5 hover:bg-white/10 border border-white/5'
                    }
                `}>
                    <div className="flex gap-3 items-center">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg
                            ${bet.cashedOut
                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white'
                                : 'bg-gradient-to-br from-blue-500 to-blue-700 text-white'
                            }
                        `}>
                            {bet.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-semibold text-sm ${isMe ? 'text-emerald-300' : 'text-gray-200'} ${isLost ? 'line-through opacity-70' : ''}`}>
                                {bet.username}
                            </span>
                            {bet.cashedOut && (
                                <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 mt-0.5 w-fit">
                                    <FiTrendingUp /> {bet.cashOutAt?.toFixed(2)}x
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-white font-bold text-base font-mono tracking-tight">${bet.amount.toFixed(2)}</span>
                        {bet.profit && bet.profit > 0 && (
                            <span className="text-emerald-400 text-[10px] font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                                +${bet.profit.toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            );
        })
    );

    if (isBlocked) {
        return (
            <div className="h-screen bg-gradient-to-br from-[#0A0E17] to-[#111827] flex flex-col items-center justify-center text-center p-8 text-white">
                <div className="w-24 h-24 bg-gradient-to-br from-red-500/10 to-red-600/20 rounded-full flex items-center justify-center mb-6 animate-pulse border border-red-500/30">
                    <span className="text-5xl">📱</span>
                </div>
                <h1 className="text-4xl font-black text-white mb-4 tracking-tighter bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">MOBILE ONLY</h1>
                <p className="text-gray-400 max-w-md leading-relaxed text-lg mb-8">
                    Please access this game from your mobile phone or tablet for the best experience.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-600 transition-all"
                    >
                        Refresh Page
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl font-semibold border border-gray-700 hover:bg-gray-800 transition-all"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    if (!isClient) return (
        <div className="bg-gradient-to-br from-[#0A0E17] to-[#111827] h-screen flex items-center justify-center text-white">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-lg font-semibold text-gray-400">Loading 1XPlane...</div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gradient-to-br from-[#0A0E17] to-[#111827] text-white font-sans overflow-hidden select-none">

            {/* --- LEFT SIDEBAR (Desktop) --- */}
            <div className="hidden lg:flex flex-col w-80 bg-gradient-to-b from-[#111827]/90 to-[#0F172A]/90 border-r border-gray-800/30 z-30 shadow-2xl backdrop-blur-sm">
                <div className="p-3 border-b border-gray-800/50">
                    {/* Game Logo */}
                    <div className="flex items-center justify-center mb-2">
                        <div className="flex items-center">
                            <img
                                src="https://sachintha.online/wp-content/uploads/2026/01/plane-logo.png.png"
                                alt="Aviator Logo"
                                className="w-25  mr-3"
                            />
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="mt-3 p-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                                    <span className="font-bold text-white">{username.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-white">{username}</span>
                                    <span className="text-xs text-gray-400">Balance: <span className="text-emerald-400">${balance.toFixed(2)}</span></span>
                                </div>
                            </div>
                            <button
                                onClick={handleProfileNav}
                                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-blue-400 transition-colors"
                            >
                                <FiUser />
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                            <div className="text-xs text-gray-400 mb-1">Total Bets</div>
                            <div className="text-lg font-bold text-white">{allBets.length}</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                            <div className="text-xs text-gray-400 mb-1">Online</div>
                            <div className="text-lg font-bold text-emerald-400">{allBets.length + 42}</div>
                        </div>
                    </div>
                </div>

                {/* Bets List */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FiUsers className="text-blue-400" />
                            Live Bets
                        </h3>
                        <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-full">
                            {allBets.length} Active
                        </span>
                    </div>
                    <div className="space-y-2">
                        {renderBetList()}
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex flex-col relative h-full overflow-hidden">

                {/* 1. HEADER */}
                <div className="absolute top-0 left-0 right-0 h-20 flex justify-between items-center px-6 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
                    {/* Left Section */}
                    <div className="pointer-events-auto flex items-center gap-4">
                        <button
                            onClick={() => setShowMobileBets(true)}
                            className="lg:hidden w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-500/30 flex items-center justify-center text-xl hover:from-blue-500/30 hover:to-blue-600/30 active:scale-95 transition-all shadow-lg"
                        >
                            <FiUsers />
                        </button>
                        <div className="lg:hidden flex items-center">
                            <div className="w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
                                <MdFlight className="text-xl text-white" />
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-lg font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                                    1XPlane
                                </h1>
                                <span className="text-[10px] text-gray-400">Mobile Mode</span>
                            </div>
                        </div>
                    </div>

                    {/* Center - History */}
                    <div className="hidden md:flex gap-2 pointer-events-auto mask-linear-fade max-w-xl overflow-hidden">
                        {history.slice(0, 10).map((h, i) => (
                            <div
                                key={i}
                                className={`px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-md border transition-all hover:scale-105
                                    ${h < 2.0
                                        ? 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-300 border-blue-500/30'
                                        : h < 5.0
                                            ? 'bg-gradient-to-r from-purple-500/10 to-purple-600/10 text-purple-300 border-purple-500/30'
                                            : 'bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 text-emerald-300 border-emerald-500/30'
                                    }
                                `}
                            >
                                {h.toFixed(2)}x
                            </div>
                        ))}
                    </div>

                    {/* Right Section */}
                    <div className="pointer-events-auto flex items-center gap-4">
                        {/* Balance */}
                        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/30 px-4 py-3 rounded-xl flex flex-col items-end shadow-lg">
                            <span className="text-xs text-blue-300 uppercase font-bold tracking-wider flex items-center gap-1">
                                <FiDollarSign /> Balance
                            </span>
                            <span className="text-xl font-black font-mono text-white">${balance.toFixed(2)}</span>
                        </div>

                        {/* Settings & Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleLogout}
                                className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 flex items-center justify-center hover:from-red-500/20 hover:to-red-600/20 text-red-400 transition-all active:scale-95 shadow-lg"
                            >
                                <FiLogOut className="text-lg" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. GAME CANVAS (Animation Layer) */}
                <div ref={containerRef} className="flex-1 relative bg-gradient-to-b from-[#0A0E17] to-[#111827] flex flex-col items-center justify-center overflow-hidden w-full h-full">
                    {/* The Canvas itself */}
                    <canvas ref={canvasRef} className="absolute inset-0 z-0" />

                    {/* Central Multiplier Display */}
                    <div className="z-10 text-center relative pointer-events-none">
                        {status === "WAITING" ? (
                            <div className="flex flex-col items-center">
                                <div className="text-3xl md:text-5xl font-black text-gray-600 mb-6 tracking-tighter animate-pulse">
                                    PREPARING FOR TAKEOFF
                                </div>
                                <div className="w-64 h-2 bg-gray-800/50 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 animate-[width_5s_linear] w-full"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className={`text-8xl md:text-[180px] font-black leading-none tracking-tighter tabular-nums drop-shadow-2xl transition-all duration-150
                                    ${status === "CRASHED"
                                        ? "text-gradient-crashed animate-crash"
                                        : "text-gradient-flying"
                                    }`}
                                >
                                    {multiplier.toFixed(2)}<span className="text-4xl md:text-6xl">x</span>
                                </div>
                            </div>
                        )}

                        {status === "CRASHED" && (
                            <div className="absolute -bottom-20 left-0 right-0 text-center">
                                <div className="text-red-400 text-2xl font-black uppercase tracking-[0.2em] animate-pulse drop-shadow-[0_0_20px_rgba(239,68,68,0.7)]">
                                    PLANE CRASHED!
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                <div className="bg-gradient-to-t from-[#0F172A]/90 to-[#111827]/90 border-t border-gray-800/50 p-4 shadow-[0_-20px_50px_rgba(0,0,0,0.7)] z-40 relative">
                    <div className="max-w-4xl mx-auto flex flex-col gap-4">

                        <div className="flex flex-col lg:flex-row gap-4 items-center">
                            {/* Input Area - Compact */}
                            <div className="flex-1 bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm p-3 rounded-xl border border-gray-800/50 shadow-inner w-full">
                                <div className="mb-3">
                                    <div className="text-xs text-gray-400 mb-2 font-medium">BET AMOUNT</div>

                                    {/* Preset Buttons - Compact Grid */}
                                    <div className="grid grid-cols-6 gap-2 mb-3">
                                        {quickBets.map(amt => (
                                            <button
                                                key={amt}
                                                onClick={() => setBetAmount(amt)}
                                                disabled={status !== "WAITING" && !myBet}
                                                className={`py-2 rounded-lg text-xs font-bold transition-all active:scale-95
                                    ${betAmount === amt
                                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                                                        : 'bg-gradient-to-br from-gray-800 to-gray-900 text-gray-400 hover:from-gray-700 hover:to-gray-800 hover:text-gray-300 border border-gray-700/50'
                                                    }
                                `}
                                            >
                                                ${amt}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Manual Input Stepper - Compact */}
                                    <div className="flex items-center bg-gradient-to-r from-gray-900 to-gray-950 rounded-xl border border-gray-700/50 p-1 h-12">
                                        <button
                                            onClick={() => setBetAmount(Math.max(1, betAmount - 1))}
                                            className="w-10 h-full rounded-lg bg-gradient-to-b from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-gray-400 hover:text-white transition-all text-xl font-bold active:scale-95 border-r border-gray-700/50"
                                        >
                                            <FiChevronDown className="inline-block" />
                                        </button>
                                        <div className="flex-1 flex flex-col items-center justify-center">
                                            <div className="text-xs text-gray-500 mb-1">AMOUNT</div>
                                            <input
                                                type="number"
                                                value={betAmount}
                                                onChange={(e) => setBetAmount(parseFloat(e.target.value))}
                                                className="w-full bg-transparent text-center text-white font-bold text-xl outline-none font-mono"
                                            />
                                        </div>
                                        <button
                                            onClick={() => setBetAmount(betAmount + 1)}
                                            className="w-10 h-full rounded-lg bg-gradient-to-b from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-gray-400 hover:text-white transition-all text-xl font-bold active:scale-95 border-l border-gray-700/50"
                                        >
                                            <FiChevronUp className="inline-block" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* COMPACT ACTION BUTTON */}
                            <div className="w-full lg:w-72 relative group">
                                <div className={`absolute inset-0 rounded-xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500
                    ${btn.text === "PLACE BET"
                                        ? 'bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500'
                                        : btn.text.includes("CASH OUT")
                                            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500'
                                            : btn.text.includes("CASHED OUT")
                                                ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                                                : 'bg-gradient-to-r from-red-500 to-red-700'
                                    }
                `}></div>

                                <button
                                    onClick={handleAction}
                                    disabled={btn.disabled}
                                    className={`relative w-full h-20 rounded-xl flex flex-col items-center justify-center transition-all duration-150 overflow-hidden group
                        ${btn.color}
                        ${!btn.disabled ? 'hover:scale-[1.02] active:scale-95' : ''}
                    `}
                                >
                                    {/* Shine Effect */}
                                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>

                                    {/* Icon and Text */}
                                    <div className="flex items-center justify-center gap-2 z-10">
                                        <span className="text-xl lg:text-2xl font-black tracking-wide text-white drop-shadow-lg">
                                            {btn.text}
                                        </span>
                                    </div>

                                    {btn.subtext && (
                                        <span className="text-sm font-bold text-white/90 mt-2 z-10 bg-black/40 px-4 py-1 rounded-full">
                                            {btn.subtext}
                                        </span>
                                    )}

                                    {/* Hover effect */}
                                    {!btn.disabled && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                    )}

                                    {/* Glow border */}
                                    <div className="absolute inset-0 rounded-xl border-2 border-white/20 pointer-events-none"></div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. FOOTER (At the Bottom) */}
                <footer className="bg-gradient-to-t from-[#0A0E17] to-transparent py-6 border-t border-gray-900/50 mt-auto z-30">
                    <div className="max-w-7xl mx-auto px-6">
                        {/* Bottom Bar */}
                        <div className="pt-6 border-t border-gray-900/50">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <FiShield className="text-emerald-500" />
                                        <span>Provably Fair Gaming</span>
                                    </div>
                                    <div className="hidden md:flex items-center gap-2">
                                        <FiHeart className="text-red-400" />
                                        <span>Play Responsibly</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                                    <span className="text-gray-500">© {new Date().getFullYear()} 1XPlane Game</span>
                                    <span className="text-gray-700">•</span>
                                    <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Terms</a>
                                    <span className="text-gray-700">•</span>
                                    <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Privacy</a>
                                    <span className="text-gray-700">•</span>
                                    <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Support</a>
                                </div>

                                <div className="text-xs text-gray-600">
                                    License #GAM-2024-7890 • v2.0.1
                                </div>
                            </div>

                        
                        </div>
                    </div>
                </footer>

                {/* Mobile Footer (Simplified) */}
                <div className="lg:hidden bg-gradient-to-t from-[#0A0E17] to-transparent py-4 border-t border-gray-900/50">
                    <div className="px-4">
                        <div className="flex flex-wrap justify-center items-center gap-3 mb-3">
                            <span className="text-xs text-gray-500 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                                <FiShield className="inline mr-1 text-emerald-500" /> Fair Play
                            </span>
                            <span className="text-xs text-gray-500 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                                <FiHeart className="inline mr-1 text-red-400" /> 18+ Only
                            </span>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-gray-600">
                                © {new Date().getFullYear()} 1XPlane Game • Play responsibly
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}