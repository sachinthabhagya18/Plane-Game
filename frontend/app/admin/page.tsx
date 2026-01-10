"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState("");
    const [activeTab, setActiveTab] = useState("USERS");

    // Settings State
    const [settings, setSettings] = useState({
        force_crash_point: 0.0,
        house_edge: 10.0,
        max_win_limit: 5000.0,
        restrict_desktop: false // New Setting
    });

    const [users, setUsers] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [topUpAmount, setTopUpAmount] = useState<{[key: number]: string}>({});

    useEffect(() => {
        const storedToken = localStorage.getItem('access_token');
        if (!storedToken) {
            router.push('/admin-login'); // Fixed: Redirect to Admin Login
        } else {
            setToken(storedToken);
            loadData(storedToken);
        }
    }, []);

    const loadData = async (authToken: string) => {
        try {
            const config = { headers: { Authorization: `Bearer ${authToken}` } };
            // Check if user is admin, else throw error to catch block
            await axios.get('http://164.68.123.57:8000/api/admin/settings/', config)
                .then(res => setSettings(res.data))
                .catch(() => { throw new Error("Not Admin"); });
            
            const userRes = await axios.get('http://164.68.123.57:8000/api/admin/users/', config);
            setUsers(userRes.data);

            const wdRes = await axios.get('http://164.68.123.57:8000/api/admin/withdrawals/', config);
            setWithdrawals(wdRes.data);
            
            setLoading(false);
        } catch (error) {
            console.error("Access Denied", error);
            localStorage.removeItem('access_token');
            router.push('/admin-login'); // Redirect to Admin Login on failure
        }
    };

    const handleSaveSettings = async () => {
        try {
            await axios.post('http://164.68.123.57:8000/api/admin/settings/', settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotify("✅ Settings Updated!");
        } catch (error) {
            showNotify("❌ Failed to save!");
        }
    };

    // ... (Transaction logic same as before)
    const handleTransaction = async (userId: number, username: string, type: 'ADD' | 'DEDUCT') => {
        const rawAmount = topUpAmount[userId];
        if (!rawAmount) return;
        const amount = parseFloat(rawAmount);
        if (isNaN(amount) || amount <= 0) { showNotify("❌ Invalid Amount"); return; }
        const finalAmount = type === 'ADD' ? amount : -amount;

        if(!confirm(`Confirm ${type} $${amount} for ${username}?`)) return;

        try {
            await axios.post('http://164.68.123.57:8000/api/admin/add-balance/', { user_id: userId, amount: finalAmount }, { headers: { Authorization: `Bearer ${token}` } });
            showNotify(`✅ Success: ${type} $${amount}`);
            loadData(token!);
            setTopUpAmount({...topUpAmount, [userId]: ''});
        } catch (error) { showNotify("❌ Failed."); }
    };

    // ... (Withdrawal logic same as before)
    const handleWithdrawalAction = async (id: number, action: 'APPROVE' | 'REJECT') => {
        if(!confirm(`${action} this request?`)) return;
        try {
            await axios.post('http://164.68.123.57:8000/api/admin/withdrawals/', { id, action }, { headers: { Authorization: `Bearer ${token}` } });
            showNotify(`✅ Request ${action}ED`);
            loadData(token!);
        } catch (error) { showNotify("❌ Error processing request"); }
    };

    const showNotify = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(""), 3000); };
    const filteredUsers = users.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) return <div className="h-screen bg-black text-white flex items-center justify-center">Loading Admin...</div>;

    return (
        <div className="min-h-screen bg-[#0f1923] text-white p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                    <h1 className="text-3xl font-black text-red-500 italic">ADMIN DASHBOARD</h1>
                    <div className="flex gap-4">
                        <button onClick={() => router.push('/')} className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 font-bold">Game View</button>
                        <button onClick={() => { localStorage.clear(); router.push('/admin-login'); }} className="px-4 py-2 bg-red-900 border border-red-600 rounded hover:bg-red-800 font-bold">Logout</button>
                    </div>
                </div>

                {notification && <div className="fixed top-5 right-5 bg-green-600 text-white px-6 py-3 rounded shadow-lg animate-bounce z-50">{notification}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* --- SETTINGS PANEL --- */}
                    <div className="bg-[#1b2733] p-6 rounded-xl border border-gray-700 h-fit">
                        <h2 className="text-xl font-bold text-orange-400 mb-4">⚙️ Game Control</h2>
                        <div className="space-y-4">
                            {/* DEVICE BLOCK TOGGLE */}
                            <div className="bg-black/30 p-3 rounded border border-gray-600 flex justify-between items-center">
                                <div>
                                    <label className="block text-gray-300 text-xs font-bold uppercase">Block Desktop Access</label>
                                    <p className="text-[10px] text-gray-500">Only Phone/Tab Allowed</p>
                                </div>
                                <div 
                                    onClick={() => setSettings({...settings, restrict_desktop: !settings.restrict_desktop})}
                                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings.restrict_desktop ? 'bg-green-500' : 'bg-gray-600'}`}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${settings.restrict_desktop ? 'translate-x-6' : ''}`}></div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase mb-1">Force Crash (Next Round)</label>
                                <input type="number" step="0.01" value={settings.force_crash_point}
                                    onChange={(e) => setSettings({...settings, force_crash_point: parseFloat(e.target.value)})}
                                    className="w-full bg-black/40 border border-gray-600 p-2 rounded text-yellow-400 font-bold" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-gray-400 text-xs font-bold uppercase mb-1">House Edge %</label>
                                    <input type="number" value={settings.house_edge} onChange={(e) => setSettings({...settings, house_edge: parseFloat(e.target.value)})} className="w-full bg-black/40 border border-gray-600 p-2 rounded" />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-xs font-bold uppercase mb-1">Max Win ($)</label>
                                    <input type="number" value={settings.max_win_limit} onChange={(e) => setSettings({...settings, max_win_limit: parseFloat(e.target.value)})} className="w-full bg-black/40 border border-gray-600 p-2 rounded" />
                                </div>
                            </div>

                            <button onClick={handleSaveSettings} className="w-full bg-gradient-to-r from-orange-600 to-red-600 py-3 rounded font-bold hover:brightness-110">UPDATE SETTINGS</button>
                        </div>
                    </div>

                    {/* --- RIGHT PANEL (TABS) --- */}
                    <div className="lg:col-span-2 bg-[#1b2733] p-6 rounded-xl border border-gray-700 flex flex-col h-[80vh]">
                        
                        <div className="flex gap-4 mb-4 border-b border-gray-700 pb-2">
                            <button onClick={() => setActiveTab('USERS')} className={`pb-2 font-bold ${activeTab === 'USERS' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500'}`}>PLAYERS</button>
                            <button onClick={() => setActiveTab('WITHDRAWALS')} className={`pb-2 font-bold ${activeTab === 'WITHDRAWALS' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500'}`}>
                                WITHDRAWAL REQUESTS 
                                {withdrawals.filter(w => w.status === 'PENDING').length > 0 && <span className="ml-2 bg-red-600 text-white text-[10px] px-1.5 rounded-full">{withdrawals.filter(w => w.status === 'PENDING').length}</span>}
                            </button>
                        </div>

                        {activeTab === 'USERS' ? (
                            <>
                                <input type="text" placeholder="🔍 Search Username..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-black/40 border border-gray-600 rounded px-3 py-1.5 text-sm text-white mb-4 w-full" />
                                <div className="flex-1 overflow-auto custom-scrollbar">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-800 text-gray-400 text-xs uppercase sticky top-0">
                                            <tr><th className="p-3">User</th><th className="p-3">Balance</th><th className="p-3 text-center">Actions</th></tr>
                                        </thead>
                                        <tbody className="text-sm divide-y divide-gray-700">
                                            {filteredUsers.map((u) => (
                                                <tr key={u.id} className="hover:bg-white/5 bg-black/20">
                                                    <td className="p-3">
                                                        <div className="font-bold">{u.username}</div>
                                                        <div className="text-xs text-gray-400">{u.phone_number}</div>
                                                        <div className="text-[10px] text-gray-500">{u.bank_name} - {u.account_number}</div>
                                                    </td>
                                                    <td className="p-3 font-mono text-green-400 font-bold">${u.balance.toFixed(2)}</td>
                                                    <td className="p-3">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <input type="number" placeholder="Amt" className="w-20 bg-black/50 border border-gray-600 rounded px-1 text-xs" value={topUpAmount[u.id] || ''} onChange={(e) => setTopUpAmount({...topUpAmount, [u.id]: e.target.value})} />
                                                            <button onClick={() => handleTransaction(u.id, u.username, 'ADD')} className="bg-green-700 px-2 py-1 rounded text-[10px] font-bold">+</button>
                                                            <button onClick={() => handleTransaction(u.id, u.username, 'DEDUCT')} className="bg-red-900 px-2 py-1 rounded text-[10px] font-bold">-</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 overflow-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-800 text-gray-400 text-xs uppercase sticky top-0">
                                        <tr><th className="p-3">Date</th><th className="p-3">User</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3 text-right">Action</th></tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-gray-700">
                                        {withdrawals.map((w) => (
                                            <tr key={w.id} className="hover:bg-white/5">
                                                <td className="p-3 text-gray-400 text-xs">{new Date(w.request_date).toLocaleDateString()}</td>
                                                <td className="p-3">
                                                    <div className="font-bold">{w.username}</div>
                                                    <div className="text-[10px] text-gray-500 break-words w-40">{w.bank_snapshot}</div>
                                                </td>
                                                <td className="p-3 font-mono text-yellow-400 font-bold">${parseFloat(w.amount).toFixed(2)}</td>
                                                <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] ${w.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : w.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{w.status}</span></td>
                                                <td className="p-3 text-right">
                                                    {w.status === 'PENDING' && (
                                                        <div className="flex gap-2 justify-end">
                                                            <button onClick={() => handleWithdrawalAction(w.id, 'APPROVE')} className="bg-green-600 hover:bg-green-500 px-2 py-1 rounded text-[10px] font-bold">Approve</button>
                                                            <button onClick={() => handleWithdrawalAction(w.id, 'REJECT')} className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-[10px] font-bold">Reject</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}