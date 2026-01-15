"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiTrash2, FiActivity, FiUsers, FiSearch, FiUser, FiGlobe, FiMonitor, FiDollarSign, FiTrendingUp, FiTrendingDown, FiCalendar, FiClock, FiBarChart2, FiEye } from 'react-icons/fi';

export default function AnalyticsPage() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'ROUNDS' | 'PLAYER' | 'VISITORS'>('ROUNDS');
    
    // Round History State
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRound, setSelectedRound] = useState<any | null>(null);
    
    // Player Search State
    const [searchUser, setSearchUser] = useState("");
    const [playerData, setPlayerData] = useState<any | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);

    // Visitor Stats State
    const [visitorStats, setVisitorStats] = useState<any | null>(null);

    const API_URL = 'https://1xplane.com'; 

    useEffect(() => {
        const storedToken = localStorage.getItem('access_token');
        if (!storedToken) router.push('/admin-login');
        else {
            setToken(storedToken);
            loadAnalytics(storedToken);
            loadVisitorStats(storedToken);
        }
    }, []);

    const loadAnalytics = async (authToken: string) => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/analytics/`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setHistory(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to load analytics");
        }
    };

    const loadVisitorStats = async (authToken: string) => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/visitors/`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setVisitorStats(res.data);
        } catch (error) {
            console.error("Failed to load visitor stats");
        }
    };

    const handlePlayerSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setSearchLoading(true);
        setPlayerData(null);
        try {
            const res = await axios.get(`${API_URL}/api/admin/player-search/?username=${searchUser}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPlayerData(res.data);
        } catch (error) {
            alert("User not found or error occurred");
        } finally {
            setSearchLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if(!confirm("Delete this record?")) return;
        try {
            await axios.delete(`${API_URL}/api/admin/analytics/`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { id: id }
            });
            setHistory(history.filter(h => h.id !== id));
            setSelectedRound(null);
        } catch (error) { alert("Failed to delete"); }
    };

    const handleClearAll = async () => {
        if(!confirm("WARNING: This will delete ALL history permanently. Continue?")) return;
        try {
            await axios.delete(`${API_URL}/api/admin/analytics/`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { action: 'CLEAR_ALL' }
            });
            setHistory([]);
            setSelectedRound(null);
        } catch (error) { alert("Failed to clear"); }
    };

    // Calculate summary stats
    const summaryStats = {
        totalRounds: history.length,
        totalProfit: history.reduce((sum, round) => sum + parseFloat(round.round_profit), 0),
        avgCrashPoint: history.length > 0 
            ? (history.reduce((sum, round) => sum + parseFloat(round.crash_point), 0) / history.length).toFixed(2)
            : 0
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading Analytics Dashboard...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4 md:p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => router.push('/admin')} 
                                className="bg-gray-800/80 backdrop-blur-sm p-3 rounded-xl hover:bg-gray-700 transition-all duration-300 hover:-translate-x-1"
                            >
                                <FiArrowLeft className="text-lg" />
                            </button>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                                    Analytics Dashboard
                                </h1>
                                <p className="text-gray-400 text-sm">Monitor game performance and player statistics</p>
                            </div>
                        </div>
                        
                        {/* Summary Stats */}
                        <div className="flex flex-wrap gap-3">
                            <div className="bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700/50">
                                <div className="flex items-center gap-2">
                                    <FiActivity className="text-blue-400" />
                                    <span className="text-sm text-gray-400">Rounds:</span>
                                    <span className="font-bold">{summaryStats.totalRounds}</span>
                                </div>
                            </div>
                            <div className="bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700/50">
                                <div className="flex items-center gap-2">
                                    <FiBarChart2 className={summaryStats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'} />
                                    <span className="text-sm text-gray-400">Profit:</span>
                                    <span className={`font-bold ${summaryStats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        ${summaryStats.totalProfit.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Tab Switcher */}
                    <div className="flex bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 p-1 max-w-md">
                        <button 
                            onClick={() => setActiveTab('ROUNDS')}
                            className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'ROUNDS' 
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' 
                                : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="font-semibold">Game History</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('PLAYER')}
                            className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'PLAYER' 
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' 
                                : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="font-semibold">Player Search</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('VISITORS')}
                            className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'VISITORS' 
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' 
                                : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="font-semibold">Visitors</span>
                        </button>
                    </div>
                </div>

                {/* --- ROUNDS TAB --- */}
                {activeTab === 'ROUNDS' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* History List */}
                        <div className="lg:col-span-2 bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden flex flex-col h-[75vh]">
                            <div className="p-5 bg-gradient-to-r from-gray-900 to-black border-b border-gray-800 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full"></div>
                                    <span className="font-bold text-gray-300">Recent Game Rounds</span>
                                </div>
                                <button 
                                    onClick={handleClearAll} 
                                    className="text-sm px-4 py-2 bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-800/30 rounded-lg flex items-center gap-2 hover:from-red-800/40 hover:to-red-700/30 transition-all"
                                >
                                    <FiTrash2 className="text-red-400" />
                                    <span className="text-red-300">Clear All</span>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                                {history.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-600 py-20">
                                        <FiActivity className="text-5xl mb-4 opacity-30" />
                                        <p className="text-gray-500">No game history yet</p>
                                    </div>
                                ) : (
                                    history.map((round) => (
                                        <div 
                                            key={round.id} 
                                            onClick={() => setSelectedRound(round)}
                                            className={`group p-4 mb-2 rounded-xl border transition-all duration-300 cursor-pointer ${
                                                selectedRound?.id === round.id 
                                                    ? 'bg-gradient-to-r from-blue-900/40 to-cyan-900/20 border-blue-700/50' 
                                                    : 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-lg ${
                                                        round.crash_point < 2 
                                                            ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-700/30' 
                                                            : 'bg-gradient-to-br from-pink-500/20 to-red-600/20 text-pink-400 border border-pink-700/30'
                                                    }`}>
                                                        {round.crash_point}x
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">Round #{round.id}</div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                                            <FiCalendar className="text-gray-600" />
                                                            {new Date(round.created_at).toLocaleDateString()}
                                                            <FiClock className="text-gray-600 ml-2" />
                                                            {new Date(round.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className={`text-lg font-bold ${parseFloat(round.round_profit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            ${parseFloat(round.round_profit).toFixed(2)}
                                                        </div>
                                                        <div className="text-xs text-gray-500">Profit</div>
                                                    </div>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(round.id); }} 
                                                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Details Panel */}
                        <div className="bg-gradient-to-b from-gray-900/40 to-black/40 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 h-fit sticky top-6">
                            {selectedRound ? (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold bg-gradient-to-r from-gray-300 to-gray-100 bg-clip-text text-transparent">
                                            Round #{selectedRound.id}
                                        </h2>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            parseFloat(selectedRound.round_profit) >= 0 
                                                ? 'bg-green-900/30 text-green-400 border border-green-800/50' 
                                                : 'bg-red-900/30 text-red-400 border border-red-800/50'
                                        }`}>
                                            {parseFloat(selectedRound.round_profit) >= 0 ? 'PROFIT' : 'LOSS'}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                            <div className="text-gray-400 text-sm mb-1">Total Bets</div>
                                            <div className="text-xl font-bold flex items-center gap-2">
                                                <FiDollarSign className="text-gray-500" />
                                                ${parseFloat(selectedRound.total_bet_amount).toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                                            <div className="text-gray-400 text-sm mb-1">Total Payouts</div>
                                            <div className="text-xl font-bold flex items-center gap-2">
                                                <FiDollarSign className="text-gray-500" />
                                                ${parseFloat(selectedRound.total_payout_amount).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-2 h-5 bg-gradient-to-b from-cyan-500 to-blue-400 rounded-full"></div>
                                            <h3 className="text-sm font-bold text-gray-300">Profit Summary</h3>
                                        </div>
                                        <div className={`p-4 rounded-xl border ${
                                            parseFloat(selectedRound.round_profit) >= 0 
                                                ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/10 border-green-800/30' 
                                                : 'bg-gradient-to-r from-red-900/20 to-rose-900/10 border-red-800/30'
                                        }`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {parseFloat(selectedRound.round_profit) >= 0 ? (
                                                        <FiTrendingUp className="text-green-400 text-2xl" />
                                                    ) : (
                                                        <FiTrendingDown className="text-red-400 text-2xl" />
                                                    )}
                                                    <div>
                                                        <div className="text-sm text-gray-400">Round Profit</div>
                                                        <div className={`text-2xl font-bold ${
                                                            parseFloat(selectedRound.round_profit) >= 0 ? 'text-green-400' : 'text-red-400'
                                                        }`}>
                                                            ${parseFloat(selectedRound.round_profit).toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`text-right ${
                                                    parseFloat(selectedRound.round_profit) >= 0 ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                    <div className="text-3xl font-black">{selectedRound.crash_point}x</div>
                                                    <div className="text-xs text-gray-500">Crash Point</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-2 h-5 bg-gradient-to-b from-purple-500 to-pink-400 rounded-full"></div>
                                            <h3 className="text-sm font-bold text-gray-300">Player Results</h3>
                                        </div>
                                        <div className="space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                                            {(typeof selectedRound.players_data === 'string' 
                                                ? JSON.parse(selectedRound.players_data) 
                                                : selectedRound.players_data
                                            ).map((p: any, i: number) => (
                                                <div key={i} className="bg-gray-800/30 rounded-xl p-3 border border-gray-700/30 hover:border-gray-600/50 transition-all">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-sm font-bold">
                                                                {p.username.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold">{p.username}</div>
                                                                <div className="text-xs text-gray-500">Bet: ${p.bet}</div>
                                                            </div>
                                                        </div>
                                                        {p.cashed_out ? (
                                                            <div className="text-right">
                                                                <div className="text-green-400 font-bold flex items-center gap-1 justify-end">
                                                                    <FiTrendingUp className="text-sm" />
                                                                    +${p.win.toFixed(2)}
                                                                </div>
                                                                <div className="text-xs text-green-400/70">@{p.cashed_out}x</div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-red-400 font-bold flex items-center gap-1">
                                                                <FiTrendingDown className="text-sm" />
                                                                Lost
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-600 py-16">
                                    <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 flex items-center justify-center mb-4">
                                        <FiActivity className="text-4xl text-gray-700" />
                                    </div>
                                    <p className="text-gray-500 text-center">Select a round to view detailed information</p>
                                    <p className="text-gray-600 text-sm mt-2">Click on any round from the list</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- PLAYER SEARCH TAB --- */}
                {activeTab === 'PLAYER' && (
                    <div className="max-w-8xl mx-auto">
                        {/* Search Card */}
                        <div className="bg-gradient-to-br from-gray-900/40 to-black/40 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-700/30 flex items-center justify-center">
                                    <FiSearch className="text-blue-400 text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Player Lookup</h2>
                                    <p className="text-gray-400 text-sm">Search for any player by username</p>
                                </div>
                            </div>
                            
                            <form onSubmit={handlePlayerSearch} className="flex gap-3">
                                <div className="flex-1 relative">
                                    <input 
                                        type="text" 
                                        placeholder="Enter username (e.g., 'john_doe')" 
                                        value={searchUser}
                                        onChange={(e) => setSearchUser(e.target.value)}
                                        className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={searchLoading || !searchUser.trim()}
                                    className="bg-gradient-to-r from-blue-600 to-cyan-500 px-8 rounded-xl font-bold hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    {searchLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <FiSearch />
                                            Search
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Results */}
                        {playerData ? (
                            playerData.found ? (
                                <div className="space-y-6 animate-fade-in">
                                    {/* User Profile Card */}
                                    <div className="bg-gradient-to-br from-gray-900/40 to-black/40 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
                                        <div className="p-8">
                                            <div className="flex items-center gap-6 mb-8">
                                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/30 to-cyan-400/30 rounded-2xl border border-blue-700/30 flex items-center justify-center text-blue-400 text-3xl font-bold">
                                                    {playerData.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h2 className="text-3xl font-bold text-white">{playerData.username}</h2>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <div className="px-3 py-1 bg-gradient-to-r from-emerald-900/30 to-green-900/20 border border-emerald-800/30 rounded-lg">
                                                            <p className="text-emerald-400 font-mono text-lg font-bold">
                                                                ${playerData.balance}
                                                            </p>
                                                        </div>
                                                        <span className="text-gray-400">Current Balance</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-gray-800/30 p-5 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-700/30 flex items-center justify-center">
                                                            <FiActivity className="text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500 uppercase">Total Rounds</div>
                                                            <div className="text-2xl font-bold">{playerData.stats.total_rounds}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-800/30 p-5 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg border border-purple-700/30 flex items-center justify-center">
                                                            <FiDollarSign className="text-purple-400" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500 uppercase">Total Wagered</div>
                                                            <div className="text-2xl font-bold">${playerData.stats.total_wagered.toFixed(2)}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`p-5 rounded-xl border transition-all ${
                                                    playerData.stats.net_profit >= 0
                                                        ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/10 border-green-800/30 hover:border-green-700/50'
                                                        : 'bg-gradient-to-br from-red-900/20 to-rose-900/10 border-red-800/30 hover:border-red-700/50'
                                                }`}>
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
                                                            playerData.stats.net_profit >= 0
                                                                ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-700/30'
                                                                : 'bg-gradient-to-br from-red-500/20 to-rose-600/20 border-red-700/30'
                                                        }`}>
                                                            {playerData.stats.net_profit >= 0 ? (
                                                                <FiTrendingUp className="text-green-400" />
                                                            ) : (
                                                                <FiTrendingDown className="text-red-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500 uppercase">Net Profit</div>
                                                            <div className={`text-2xl font-bold ${
                                                                playerData.stats.net_profit >= 0 ? 'text-green-400' : 'text-red-400'
                                                            }`}>
                                                                ${playerData.stats.net_profit.toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-gradient-to-br from-gray-900/40 to-black/40 backdrop-blur-sm rounded-2xl border border-gray-800">
                                    <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 flex items-center justify-center mx-auto mb-4">
                                        <FiUser className="text-3xl text-gray-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-400 mb-2">User Not Found</h3>
                                    <p className="text-gray-500 max-w-md mx-auto">
                                        No player found with the username "{searchUser}". Please check the spelling and try again.
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-20 bg-gradient-to-br from-gray-900/40 to-black/40 backdrop-blur-sm rounded-2xl border border-gray-800">
                                <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 flex items-center justify-center mx-auto mb-6">
                                    <FiSearch className="text-4xl text-gray-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-400 mb-3">Search for Players</h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    Enter a username above to view detailed player statistics, wagering history, and performance metrics.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* --- VISITORS TAB --- */}
                {activeTab === 'VISITORS' && visitorStats && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-sm rounded-2xl border border-purple-800/30 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-700/30 flex items-center justify-center">
                                            <FiGlobe className="text-purple-400 text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="text-purple-300 text-sm font-bold uppercase tracking-wider">Total Visits</h3>
                                            <p className="text-3xl font-black text-white mt-1">{visitorStats.total_visits}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-purple-400/70 text-sm">All-time website visits</div>
                            </div>
                            
                            <div className="bg-gradient-to-br from-cyan-900/30 to-blue-800/20 backdrop-blur-sm rounded-2xl border border-cyan-800/30 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-700/30 flex items-center justify-center">
                                            <FiUsers className="text-cyan-400 text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="text-cyan-300 text-sm font-bold uppercase tracking-wider">Unique Visitors</h3>
                                            <p className="text-3xl font-black text-white mt-1">{visitorStats.unique_visitors}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-cyan-400/70 text-sm">Distinct users visited</div>
                            </div>
                        </div>

                        {/* Recent Visits Table */}
                        <div className="bg-gradient-to-br from-gray-900/40 to-black/40 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
                            <div className="p-5 bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-6 bg-gradient-to-b from-cyan-500 to-blue-400 rounded-full"></div>
                                    <span className="font-bold text-gray-300">Recent Visit Logs</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="text-gray-500 bg-black/20 text-xs uppercase">
                                        <tr>
                                            <th className="p-4 text-left font-semibold">Time</th>
                                            <th className="p-4 text-left font-semibold">IP Address</th>
                                            <th className="p-4 text-left font-semibold">Page</th>
                                            <th className="p-4 text-left font-semibold">Device</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800/50">
                                        {visitorStats.recent_visits.map((visit: any, i: number) => (
                                            <tr key={i} className="hover:bg-white/5 transition-all group">
                                                <td className="p-4">
                                                    <div className="text-gray-300">{new Date(visit.timestamp).toLocaleDateString()}</div>
                                                    <div className="text-gray-500 text-sm">{new Date(visit.timestamp).toLocaleTimeString()}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-mono text-blue-300 bg-blue-900/20 px-3 py-1 rounded-lg inline-block">
                                                        {visit.ip_address}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-gray-300 font-medium">{visit.path}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 flex items-center justify-center">
                                                            <FiMonitor className="text-gray-500" />
                                                        </div>
                                                        <div className="max-w-xs">
                                                            <div className="text-gray-400 text-sm truncate" title={visit.user_agent}>
                                                                {visit.user_agent.substring(0, 60)}...
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}