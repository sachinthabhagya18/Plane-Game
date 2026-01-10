"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("PROFILE");
  
  const [user, setUser] = useState({ username: '', balance: 0.0 });
  const [formData, setFormData] = useState({ 
      phone_number: '', 
      beneficiary_name: '',
      bank_name: '', 
      branch_name: '', 
      account_number: '' 
  });
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) router.push('/login');
    else loadData(token);
  }, []);

  const loadData = async (token: string) => {
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('http://164.68.123.57:8000/api/user/', config);
        setUser(res.data);
        setFormData({
            phone_number: res.data.phone_number || '',
            beneficiary_name: res.data.beneficiary_name || '',
            bank_name: res.data.bank_name || '',
            branch_name: res.data.branch_name || '',
            account_number: res.data.account_number || ''
        });

        const wdRes = await axios.get('http://164.68.123.57:8000/api/withdraw/', config);
        setHistory(wdRes.data);
        setLoading(false);
    } catch (error) { router.push('/login'); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
        const token = localStorage.getItem('access_token');
        await axios.patch('http://164.68.123.57:8000/api/user/', formData, { headers: { Authorization: `Bearer ${token}` } });
        setMessage("✅ Details Updated Successfully!");
        setTimeout(() => setMessage(""), 3000);
    } catch { setMessage("❌ Failed."); } finally { setSaving(false); }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!formData.account_number || !formData.bank_name) { alert("Please complete your bank details first!"); return; }
      if(!confirm(`Withdraw $${withdrawAmount}?`)) return;

      try {
          const token = localStorage.getItem('access_token');
          await axios.post('http://164.68.123.57:8000/api/withdraw/', { amount: withdrawAmount }, { headers: { Authorization: `Bearer ${token}` } });
          alert("Withdrawal Requested!");
          setWithdrawAmount('');
          loadData(token!); 
      } catch (err: any) { alert(err.response?.data?.error || "Failed"); }
  };

  const handleChange = (e: any) => setFormData({...formData, [e.target.name]: e.target.value});

  if (loading) return <div className="h-screen bg-[#0B0E14] text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white p-4 font-sans flex items-center justify-center">
      <div className="max-w-2xl w-full bg-[#151921] rounded-2xl border border-gray-800 shadow-2xl overflow-hidden relative">
        
        {/* Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>

        <div className="bg-[#11141A] p-6 flex justify-between items-center border-b border-gray-800">
            <div>
                <h1 className="text-2xl font-black uppercase tracking-wider text-white">MY PROFILE</h1>
                <p className="text-gray-500 text-xs">Manage your account & funds</p>
            </div>
            <button onClick={() => router.push('/')} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition text-gray-300">Back to Game</button>
        </div>

        <div className="flex border-b border-gray-800">
            <button onClick={() => setActiveTab('PROFILE')} className={`flex-1 py-4 font-bold tracking-wide transition-colors ${activeTab === 'PROFILE' ? 'bg-[#151921] text-emerald-400 border-b-2 border-emerald-400' : 'bg-[#0F1218] text-gray-500 hover:text-gray-300'}`}>PROFILE</button>
            <button onClick={() => setActiveTab('WITHDRAW')} className={`flex-1 py-4 font-bold tracking-wide transition-colors ${activeTab === 'WITHDRAW' ? 'bg-[#151921] text-amber-400 border-b-2 border-amber-400' : 'bg-[#0F1218] text-gray-500 hover:text-gray-300'}`}>WITHDRAW</button>
        </div>

        <div className="p-8">
            <div className="bg-black/30 p-5 rounded-xl mb-8 flex justify-between items-center border border-gray-800 shadow-inner">
                <div>
                    <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest block mb-1">Available Balance</span>
                    <span className="text-3xl font-black font-mono text-white">${user.balance.toFixed(2)}</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-2xl border border-emerald-500/20">💰</div>
            </div>

            {message && <div className="p-3 mb-6 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-center rounded-lg font-bold text-sm">{message}</div>}

            {activeTab === 'PROFILE' ? (
                <form onSubmit={handleUpdate} className="space-y-5">
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold tracking-wide mb-1.5 block">Mobile Phone</label>
                        <input name="phone_number" type="text" value={formData.phone_number} onChange={handleChange} className="w-full bg-[#0B0E14] p-3 border border-gray-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none transition-colors" placeholder="07X XXXXXXX" />
                    </div>
                    
                    <div className="pt-4 border-t border-gray-800">
                        <h3 className="text-blue-400 font-bold mb-4 text-sm uppercase tracking-wide">Bank Withdrawal Details</h3>
                    </div>
                    
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold tracking-wide mb-1.5 block">Beneficiary Name</label>
                        <input name="beneficiary_name" type="text" value={formData.beneficiary_name} onChange={handleChange} className="w-full bg-[#0B0E14] p-3 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors" placeholder="Account Holder Name" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold tracking-wide mb-1.5 block">Bank Name</label>
                            <input name="bank_name" type="text" value={formData.bank_name} onChange={handleChange} className="w-full bg-[#0B0E14] p-3 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold tracking-wide mb-1.5 block">Branch</label>
                            <input name="branch_name" type="text" value={formData.branch_name} onChange={handleChange} className="w-full bg-[#0B0E14] p-3 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold tracking-wide mb-1.5 block">Account Number</label>
                        <input name="account_number" type="text" value={formData.account_number} onChange={handleChange} className="w-full bg-[#0B0E14] p-3 border border-gray-700 rounded-lg text-white font-mono tracking-wider focus:border-blue-500 focus:outline-none transition-colors" />
                    </div>
                    <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 py-3.5 rounded-lg font-bold hover:from-emerald-500 hover:to-emerald-600 mt-6 shadow-lg shadow-emerald-900/20 active:scale-[0.98] transition-all">
                        {saving ? 'SAVING...' : 'SAVE DETAILS'}
                    </button>
                </form>
            ) : (
                <div className="space-y-6">
                    <form onSubmit={handleWithdraw}>
                        <label className="text-xs text-gray-400 uppercase font-bold block mb-2 tracking-wide">Withdraw Amount ($)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                            <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="w-full bg-[#0B0E14] p-4 pl-8 border border-gray-700 rounded-xl text-white text-2xl font-bold mb-4 focus:border-amber-500 focus:outline-none transition-colors" placeholder="0.00" />
                        </div>
                        <button type="submit" className="w-full bg-gradient-to-r from-amber-600 to-orange-600 py-3.5 rounded-lg font-bold hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-orange-900/20 active:scale-[0.98] transition-all">REQUEST WITHDRAWAL</button>
                    </form>

                    <div className="pt-4">
                        <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">TRANSACTION HISTORY</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                            {history.length === 0 ? (
                                <div className="text-center text-gray-600 text-sm py-4 italic">No withdrawal history found.</div>
                            ) : (
                                history.map((h:any) => (
                                    <div key={h.id} className="flex flex-col bg-[#11141A] p-3 rounded-lg border border-gray-800 mb-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-gray-500 text-[10px] font-mono">{new Date(h.request_date).toLocaleDateString()}</span>
                                            <span className="font-bold text-white font-mono">${parseFloat(h.amount).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] text-gray-500 truncate max-w-[150px]">{h.bank_snapshot?.split('|')[0] || 'Bank'}</span>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${h.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : h.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>{h.status}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}