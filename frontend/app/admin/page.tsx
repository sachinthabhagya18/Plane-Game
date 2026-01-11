"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
    FiUsers, FiDollarSign, FiTrendingUp, FiSettings,
    FiLogOut, FiSearch, FiCheck, FiX, FiPlus, FiMinus,
    FiHome, FiShield, FiLock, FiUnlock
} from 'react-icons/fi';
import { MdAdminPanelSettings, MdAttachMoney, MdHistory } from 'react-icons/md';

export default function AdminDashboard() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState("");
    const [activeTab, setActiveTab] = useState("USERS");
    const API_URL = 'https://1xplane.com';
    // Settings State
    const [settings, setSettings] = useState({
        force_crash_point: 0.0,
        house_edge: 10.0,
        max_win_limit: 5000.0,
        restrict_desktop: false
    });

    const [users, setUsers] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [topUpAmount, setTopUpAmount] = useState<{ [key: number]: string }>({});

    // New Profit State
    const [profitStats, setProfitStats] = useState({
        total_bets: 0.0,
        total_profit: 0.0,
        recent_rounds: []
    });

    useEffect(() => {
        const storedToken = localStorage.getItem('access_token');
        if (!storedToken) {
            router.push('/admin-login');
        } else {
            setToken(storedToken);
            loadData(storedToken);
            const interval = setInterval(() => loadProfit(storedToken), 5000);
            return () => clearInterval(interval);
        }
    }, []);

    const loadData = async (authToken: string) => {
        try {
            const config = { headers: { Authorization: `Bearer ${authToken}` } };
            await axios.get(`${API_URL}/api/admin/settings/`, config)
                .then(res => setSettings(res.data))
                .catch(() => { throw new Error("Not Admin"); });

            const userRes = await axios.get(`${API_URL}/api/admin/users/`, config);
            setUsers(userRes.data);

            const wdRes = await axios.get(`${API_URL}/api/admin/withdrawals/`, config);
            setWithdrawals(wdRes.data);

            await loadProfit(authToken);

            setLoading(false);
        } catch (error) {
            console.error("Access Denied", error);
            localStorage.removeItem('access_token');
            router.push('/admin-login');
        }
    };

    const loadProfit = async (authToken: string) => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/profit/`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setProfitStats(res.data);
        } catch (error) { console.error("Profit fetch failed"); }
    };

    const handleSaveSettings = async () => {
        try {
            await axios.post(`${API_URL}/api/admin/settings/`, settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotify("✅ Settings Updated Successfully!");
        } catch (error) {
            showNotify("❌ Failed to save settings!");
        }
    };

    const handleTransaction = async (userId: number, username: string, type: 'ADD' | 'DEDUCT') => {
        const rawAmount = topUpAmount[userId];
        if (!rawAmount) return;
        const amount = parseFloat(rawAmount);
        if (isNaN(amount) || amount <= 0) { showNotify("❌ Invalid Amount"); return; }
        const finalAmount = type === 'ADD' ? amount : -amount;

        if (!confirm(`Confirm ${type} $${amount} for ${username}?`)) return;

        try {
            await axios.post(`${API_URL}/api/admin/add-balance/`, { user_id: userId, amount: finalAmount }, { headers: { Authorization: `Bearer ${token}` } });
            showNotify(`✅ Success: ${type} $${amount}`);
            loadData(token!);
            setTopUpAmount({ ...topUpAmount, [userId]: '' });
        } catch (error) { showNotify("❌ Failed to process transaction"); }
    };

    const handleWithdrawalAction = async (id: number, action: 'APPROVE' | 'REJECT') => {
        if (!confirm(`${action} this withdrawal request?`)) return;
        try {
            await axios.post(`${API_URL}/api/admin/withdrawals/`, { id, action }, { headers: { Authorization: `Bearer ${token}` } });
            showNotify(`✅ Request ${action}D`);
            loadData(token!);
        } catch (error) { showNotify("❌ Error processing request"); }
    };

    const showNotify = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(""), 3000); };
    const filteredUsers = users.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0E17] to-[#111827] text-white flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-lg font-semibold text-gray-400">Loading Admin Dashboard...</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0E17] to-[#111827] text-white p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-6 border-b border-gray-800/50">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg">
                            <MdAdminPanelSettings className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                                Admin Dashboard
                            </h1>
                            <p className="text-gray-400 text-sm">Control Panel • Super Admin Access</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl font-semibold border border-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all active:scale-95"
                        >
                            <FiHome />
                            Game View
                        </button>
                        <button
                            onClick={() => { localStorage.clear(); router.push('/admin-login'); }}
                            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-semibold border border-red-500/30 hover:from-red-500 hover:to-red-600 transition-all active:scale-95"
                        >
                            <FiLogOut />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Notification */}
                {notification && (
                    <div className={`fixed top-5 right-5 px-6 py-3 rounded-xl shadow-2xl z-50 animate-bounce-in ${notification.includes('✅') ? 'bg-gradient-to-r from-emerald-600 to-emerald-700' : 'bg-gradient-to-r from-red-600 to-red-700'}`}>
                        <div className="flex items-center gap-3 text-white font-bold">
                            {notification.includes('✅') ? <FiCheck className="text-lg" /> : <FiX className="text-lg" />}
                            <span>{notification}</span>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-800/30 shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                                <FiDollarSign className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-blue-300 text-xs font-bold uppercase tracking-wider">Total Bets</h3>
                                <p className="text-2xl font-black text-white">${profitStats.total_bets.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className={`bg-gradient-to-br ${profitStats.total_profit >= 0 ? 'from-emerald-900/50 to-emerald-800/50 border-emerald-800/30' : 'from-red-900/50 to-red-800/50 border-red-800/30'} backdrop-blur-sm p-6 rounded-2xl border shadow-lg`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${profitStats.total_profit >= 0 ? 'from-emerald-600 to-emerald-800' : 'from-red-600 to-red-800'} flex items-center justify-center`}>
                                <FiTrendingUp className="text-white" />
                            </div>
                            <div>
                                <h3 className={`${profitStats.total_profit >= 0 ? 'text-emerald-300' : 'text-red-300'} text-xs font-bold uppercase tracking-wider`}>Net Profit</h3>
                                <p className="text-2xl font-black text-white">${profitStats.total_profit.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 backdrop-blur-sm p-6 rounded-2xl border border-purple-800/30 shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                                <FiUsers className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-purple-300 text-xs font-bold uppercase tracking-wider">Active Users</h3>
                                <p className="text-2xl font-black text-white">{users.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-900/50 to-amber-800/50 backdrop-blur-sm p-6 rounded-2xl border border-amber-800/30 shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
                                <MdAttachMoney className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-amber-300 text-xs font-bold uppercase tracking-wider">Pending Withdrawals</h3>
                                <p className="text-2xl font-black text-white">{withdrawals.filter(w => w.status === 'PENDING').length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Rounds */}
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-800/30 shadow-lg mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-800 flex items-center justify-center">
                            <MdHistory className="text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Recent Rounds Performance</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {profitStats.recent_rounds.length === 0 ? (
                            <div className="col-span-full text-center text-gray-500 py-4">No rounds recorded yet</div>
                        ) : (
                            profitStats.recent_rounds.map((r: any) => (
                                <div key={r.id} className={`p-4 rounded-xl border backdrop-blur-sm text-center ${r.house_profit >= 0 ? 'bg-gradient-to-r from-emerald-900/20 to-emerald-800/10 border-emerald-700/20' : 'bg-gradient-to-r from-red-900/20 to-red-800/10 border-red-700/20'}`}>
                                    <div className="text-xs text-gray-400 mb-1">Crash Point</div>
                                    <div className="text-lg font-bold text-white mb-2">{r.crash_point}x</div>
                                    <div className={`text-sm font-bold ${r.house_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        ${parseFloat(r.house_profit).toFixed(0)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Settings Panel */}
                    <div className="bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-800/30 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center">
                                <FiSettings className="text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Game Control Settings</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Desktop Restriction Toggle */}
                            <div className="bg-gradient-to-r from-gray-900 to-gray-950 p-4 rounded-xl border border-gray-800/50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <label className="block text-white font-medium mb-1">Restrict Desktop Access</label>
                                        <p className="text-xs text-gray-400">Allow only mobile/tablet devices</p>
                                    </div>
                                    <button
                                        onClick={() => setSettings({ ...settings, restrict_desktop: !settings.restrict_desktop })}
                                        className={`relative w-14 h-7 rounded-full transition-colors ${settings.restrict_desktop ? 'bg-emerald-600' : 'bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transform transition-transform ${settings.restrict_desktop ? 'translate-x-8' : 'translate-x-1'}`} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {settings.restrict_desktop ? <FiLock className="w-3 h-3 text-white absolute left-2" /> : <FiUnlock className="w-3 h-3 text-white absolute right-2" />}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Force Crash Point */}
                            <div className="space-y-2">
                                <label className="block text-gray-300 font-medium">Force Crash Point</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={settings.force_crash_point}
                                        onChange={(e) => setSettings({ ...settings, force_crash_point: parseFloat(e.target.value) })}
                                        className="w-full p-3 pl-10 bg-gradient-to-r from-gray-900 to-gray-950 text-yellow-400 font-bold rounded-xl border border-gray-700/50 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none"
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500">x</div>
                                </div>
                            </div>

                            {/* House Edge & Max Win */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-gray-300 font-medium">House Edge (%)</label>
                                    <input
                                        type="number"
                                        value={settings.house_edge}
                                        onChange={(e) => setSettings({ ...settings, house_edge: parseFloat(e.target.value) })}
                                        className="w-full p-3 bg-gradient-to-r from-gray-900 to-gray-950 text-white rounded-xl border border-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-gray-300 font-medium">Max Win ($)</label>
                                    <input
                                        type="number"
                                        value={settings.max_win_limit}
                                        onChange={(e) => setSettings({ ...settings, max_win_limit: parseFloat(e.target.value) })}
                                        className="w-full p-3 bg-gradient-to-r from-gray-900 to-gray-950 text-white rounded-xl border border-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleSaveSettings}
                                className="w-full py-4 px-6 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl font-bold text-white uppercase tracking-wider hover:from-orange-500 hover:to-red-500 active:scale-95 transition-all shadow-lg shadow-orange-900/20"
                            >
                                Update Settings
                            </button>
                        </div>
                    </div>

                    {/* Users & Withdrawals Panel */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-sm rounded-2xl border border-gray-800/30 shadow-lg flex flex-col h-[80vh]">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-800/50">
                            <button
                                onClick={() => setActiveTab('USERS')}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 font-bold transition-all ${activeTab === 'USERS' ? 'text-blue-400 border-b-2 border-blue-400 bg-gradient-to-b from-blue-900/10 to-transparent' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <FiUsers />
                                Players ({users.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('WITHDRAWALS')}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 font-bold transition-all ${activeTab === 'WITHDRAWALS' ? 'text-amber-400 border-b-2 border-amber-400 bg-gradient-to-b from-amber-900/10 to-transparent' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <MdAttachMoney />
                                Withdrawals
                                {withdrawals.filter(w => w.status === 'PENDING').length > 0 && (
                                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                        {withdrawals.filter(w => w.status === 'PENDING').length}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="flex-1 p-6 overflow-auto">
                            {activeTab === 'USERS' ? (
                                <>
                                    {/* Search */}
                                    <div className="relative mb-6">
                                        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search players..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-gradient-to-r from-gray-900 to-gray-950 text-white rounded-xl border border-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        />
                                    </div>

                                    {/* Users Table */}
                                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {filteredUsers.map((u) => (
                                            <div key={u.id} className="bg-gradient-to-r from-gray-900/50 to-gray-950/50 p-4 rounded-xl border border-gray-800/50 hover:border-gray-700/50 transition-all">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                                                                <span className="font-bold text-white">{u.username.charAt(0).toUpperCase()}</span>
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-white text-lg">{u.username}</h3>
                                                                <div className="text-xs text-gray-400">📞 {u.phone_number || "N/A"}</div>
                                                            </div>
                                                        </div>
                                                        {u.bank_name && (
                                                            <div className="bg-gradient-to-r from-gray-900 to-gray-950 p-3 rounded-lg border border-gray-700/50">
                                                                <div className="text-white font-bold text-sm mb-1">{u.beneficiary_name}</div>
                                                                <div className="text-blue-300 text-xs">{u.bank_name} • {u.branch_name}</div>
                                                                <div className="text-amber-400 font-mono text-xs font-bold mt-1">{u.account_number}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-black font-mono text-emerald-400 mb-3">${u.balance.toFixed(2)}</div>
                                                        <div className="flex flex-col gap-2">
                                                            <input
                                                                type="number"
                                                                placeholder="Amount"
                                                                className="w-32 px-3 py-2 bg-gradient-to-r from-gray-900 to-gray-950 text-white rounded-lg border border-gray-700/50 text-sm"
                                                                value={topUpAmount[u.id] || ''}
                                                                onChange={(e) => setTopUpAmount({ ...topUpAmount, [u.id]: e.target.value })}
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleTransaction(u.id, u.username, 'ADD')}
                                                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 px-3 py-2 rounded-lg text-xs font-bold hover:from-emerald-500 hover:to-emerald-600"
                                                                >
                                                                    <FiPlus className="text-xs" /> Add
                                                                </button>
                                                                <button
                                                                    onClick={() => handleTransaction(u.id, u.username, 'DEDUCT')}
                                                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 px-3 py-2 rounded-lg text-xs font-bold hover:from-red-500 hover:to-red-600"
                                                                >
                                                                    <FiMinus className="text-xs" /> Deduct
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                /* Withdrawals Table */
                                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {withdrawals.map((w) => (
                                        <div key={w.id} className="bg-gradient-to-r from-gray-900/50 to-gray-950/50 p-4 rounded-xl border border-gray-800/50 hover:border-gray-700/50 transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${w.status === 'PENDING' ? 'bg-amber-500/20' : w.status === 'APPROVED' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                                                <MdAttachMoney className={`${w.status === 'PENDING' ? 'text-amber-400' : w.status === 'APPROVED' ? 'text-emerald-400' : 'text-red-400'}`} />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white">{w.username}</div>
                                                                <div className="text-xs text-gray-500">{new Date(w.request_date).toLocaleDateString()}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-2xl font-black font-mono text-amber-400">${parseFloat(w.amount).toFixed(2)}</div>
                                                    </div>
                                                    <div className="bg-gradient-to-r from-gray-900 to-gray-950 p-3 rounded-lg border border-gray-700/50">
                                                        <div className="text-gray-400 text-xs mb-1">Bank Details:</div>
                                                        <div className="text-white text-sm">{w.bank_snapshot}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${w.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' : w.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {w.status}
                                                </span>
                                                {w.status === 'PENDING' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleWithdrawalAction(w.id, 'APPROVE')}
                                                            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 rounded-lg text-sm font-bold hover:from-emerald-500 hover:to-emerald-600"
                                                        >
                                                            <FiCheck /> Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleWithdrawalAction(w.id, 'REJECT')}
                                                            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 rounded-lg text-sm font-bold hover:from-red-500 hover:to-red-600"
                                                        >
                                                            <FiX /> Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom CSS */}
            <style jsx global>{`
                @keyframes bounce-in {
                    0% { transform: translateY(-100px); opacity: 0; }
                    50% { transform: translateY(20px); opacity: 1; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                
                .animate-bounce-in {
                    animation: bounce-in 0.6s ease-out;
                }
                
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(59, 130, 246, 0.5) transparent;
                }
                
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(59, 130, 246, 0.5);
                    border-radius: 20px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(59, 130, 246, 0.7);
                }
            `}</style>
        </div>
    );
}