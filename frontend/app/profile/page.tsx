"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FiUser, FiDollarSign, FiPhone, FiCreditCard, FiDatabase, FiMapPin, FiHash, FiSave, FiArrowLeft, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { MdOutlineAccountBalance, MdOutlineHistory } from 'react-icons/md';

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
  const API_URL = 'https://1xplane.com';
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
        const res = await axios.get(`${API_URL}/api/user/`, config);
        setUser(res.data);
        setFormData({
            phone_number: res.data.phone_number || '',
            beneficiary_name: res.data.beneficiary_name || '',
            bank_name: res.data.bank_name || '',
            branch_name: res.data.branch_name || '',
            account_number: res.data.account_number || ''
        });

        const wdRes = await axios.get(`${API_URL}/api/withdraw/`, config);
        setHistory(wdRes.data);
        setLoading(false);
    } catch (error) { router.push('/login'); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
        const token = localStorage.getItem('access_token');
        await axios.patch(`${API_URL}/api/user/`, formData, { headers: { Authorization: `Bearer ${token}` } });
        setMessage("✅ Details Updated Successfully!");
        setTimeout(() => setMessage(""), 3000);
    } catch { setMessage("❌ Failed to update details"); } finally { setSaving(false); }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!formData.account_number || !formData.bank_name) { 
          alert("Please complete your bank details first!"); 
          return; 
      }
      if(!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
          alert("Please enter a valid amount!");
          return;
      }
      if(!confirm(`Withdraw $${withdrawAmount}?`)) return;

      try {
          const token = localStorage.getItem('access_token');
          await axios.post(`${API_URL}/api/withdraw/`, { amount: withdrawAmount }, { headers: { Authorization: `Bearer ${token}` } });
          alert("Withdrawal Requested Successfully!");
          setWithdrawAmount('');
          loadData(token!); 
      } catch (err: any) { alert(err.response?.data?.error || "Withdrawal failed"); }
  };

  const handleChange = (e: any) => setFormData({...formData, [e.target.name]: e.target.value});

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E17] to-[#111827] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-lg font-semibold text-gray-400">Loading Profile...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E17] to-[#111827] text-white p-4 flex items-center justify-center">
      <div className="relative w-full max-w-4xl">
        {/* Background Effects */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl"></div>

        {/* Main Container */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="relative p-8 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-b border-gray-800/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg">
                  <FiUser className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white">Profile Dashboard</h1>
                  <p className="text-gray-400 text-sm">Manage your account and transactions</p>
                </div>
              </div>
              <button 
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl font-semibold border border-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all active:scale-95"
              >
                <FiArrowLeft />
                Back to Game
              </button>
            </div>
          </div>

          {/* Balance Card */}
          <div className="p-8">
            <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 backdrop-blur-sm p-6 rounded-2xl border border-gray-800/50 shadow-lg mb-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex-1">
                  <div className="text-sm text-gray-400 uppercase font-bold tracking-wider mb-2">Available Balance</div>
                  <div className="text-4xl md:text-5xl font-black font-mono text-white">${user.balance.toFixed(2)}</div>
                  <div className="text-sm text-gray-500 mt-2">Username: <span className="text-blue-400 font-semibold">{user.username}</span></div>
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg">
                  <FiDollarSign className="text-3xl text-white" />
                </div>
              </div>
            </div>

            {/* Message Alert */}
            {message && (
              <div className={`mb-6 p-4 rounded-xl border backdrop-blur-sm text-center font-bold text-sm animate-pulse ${
                message.includes("✅") 
                  ? "bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 text-emerald-400 border-emerald-500/30" 
                  : "bg-gradient-to-r from-red-500/10 to-red-600/5 text-red-400 border-red-500/30"
              }`}>
                {message}
              </div>
            )}

            {/* Tabs */}
            <div className="flex mb-8 bg-gradient-to-r from-gray-900 to-gray-950 rounded-xl border border-gray-800/50 p-1">
              <button 
                onClick={() => setActiveTab('PROFILE')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-lg transition-all font-bold ${
                  activeTab === 'PROFILE' 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <FiUser className="text-lg" />
                Profile Details
              </button>
              <button 
                onClick={() => setActiveTab('WITHDRAW')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-lg transition-all font-bold ${
                  activeTab === 'WITHDRAW' 
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <MdOutlineAccountBalance className="text-lg" />
                Withdraw Funds
              </button>
            </div>

            {/* Content */}
            {activeTab === 'PROFILE' ? (
              <form onSubmit={handleUpdate} className="space-y-8">
                {/* Personal Details Section */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                      <FiUser className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Personal Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                        <FiPhone className="text-blue-400" />
                        Mobile Phone
                      </label>
                      <div className="relative">
                        <input 
                          name="phone_number" 
                          type="text" 
                          value={formData.phone_number} 
                          onChange={handleChange}
                          className="w-full p-4 pl-12 bg-gradient-to-r from-gray-900 to-gray-950 text-white rounded-xl border border-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                          placeholder="07X XXXXXXX"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <FiPhone className="text-gray-500" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                        <FiCreditCard className="text-blue-400" />
                        Beneficiary Name
                      </label>
                      <div className="relative">
                        <input 
                          name="beneficiary_name" 
                          type="text" 
                          value={formData.beneficiary_name} 
                          onChange={handleChange}
                          className="w-full p-4 pl-12 bg-gradient-to-r from-gray-900 to-gray-950 text-white rounded-xl border border-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                          placeholder="Account Holder Name"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <FiCreditCard className="text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Details Section */}
                <div className="pt-6 border-t border-gray-800/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
                      <FiDatabase className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Bank Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                        <FiDatabase className="text-emerald-400" />
                        Bank Name
                      </label>
                      <div className="relative">
                        <input 
                          name="bank_name" 
                          type="text" 
                          value={formData.bank_name} 
                          onChange={handleChange}
                          className="w-full p-4 pl-12 bg-gradient-to-r from-gray-900 to-gray-950 text-white rounded-xl border border-gray-700/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                          placeholder="e.g. Commercial Bank"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <FiDatabase className="text-gray-500" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                        <FiMapPin className="text-emerald-400" />
                        Branch Name
                      </label>
                      <div className="relative">
                        <input 
                          name="branch_name" 
                          type="text" 
                          value={formData.branch_name} 
                          onChange={handleChange}
                          className="w-full p-4 pl-12 bg-gradient-to-r from-gray-900 to-gray-950 text-white rounded-xl border border-gray-700/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                          placeholder="e.g. Colombo Main"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <FiMapPin className="text-gray-500" />
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                        <FiHash className="text-emerald-400" />
                        Account Number
                      </label>
                      <div className="relative">
                        <input 
                          name="account_number" 
                          type="text" 
                          value={formData.account_number} 
                          onChange={handleChange}
                          className="w-full p-4 pl-12 bg-gradient-to-r from-gray-900 to-gray-950 text-white rounded-xl border border-gray-700/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-mono tracking-wider"
                          placeholder="XXXXXXXXXX"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <FiHash className="text-gray-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-6">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className={`relative w-full py-5 px-6 rounded-xl font-bold text-white uppercase tracking-wider transition-all duration-300 overflow-hidden group ${
                      saving 
                        ? 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-wait' 
                        : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] active:scale-95'
                    }`}
                  >
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent"></div>
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {saving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <FiSave className="text-lg" />
                          Update Profile
                        </>
                      )}
                    </span>
                    {!saving && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                {/* Withdraw Form */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center">
                      <MdOutlineAccountBalance className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Withdraw Funds</h3>
                  </div>
                  
                  <form onSubmit={handleWithdraw}>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <label className="text-gray-300 text-sm font-medium">Withdrawal Amount ($)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xl">$</span>
                          <input 
                            type="number" 
                            value={withdrawAmount} 
                            onChange={e => setWithdrawAmount(e.target.value)}
                            step="0.01"
                            min="1"
                            max={user.balance}
                            className="w-full p-5 pl-12 bg-gradient-to-r from-gray-900 to-gray-950 text-white text-2xl font-bold rounded-xl border border-gray-700/50 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="text-sm text-gray-500">
                          Maximum: <span className="text-emerald-400 font-bold">${user.balance.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <button 
                        type="submit"
                        className="w-full py-5 px-6 rounded-xl font-bold text-white uppercase tracking-wider transition-all duration-300 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] active:scale-95 relative overflow-hidden group"
                      >
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent"></div>
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          <FiDollarSign className="text-lg" />
                          Request Withdrawal
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Transaction History */}
                <div className="pt-6 border-t border-gray-800/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                      <MdOutlineHistory className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Transaction History</h3>
                  </div>
                  
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {history.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FiClock className="text-2xl text-gray-500" />
                        </div>
                        <p className="text-gray-500 text-sm">No withdrawal history found</p>
                      </div>
                    ) : (
                      history.map((h: any) => (
                        <div 
                          key={h.id} 
                          className="bg-gradient-to-r from-gray-900/50 to-gray-950/50 backdrop-blur-sm p-4 rounded-xl border border-gray-800/50 hover:border-gray-700/50 transition-all"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-3">
                              {h.status === 'APPROVED' ? (
                                <FiCheckCircle className="text-emerald-500 text-lg" />
                              ) : h.status === 'REJECTED' ? (
                                <FiXCircle className="text-red-500 text-lg" />
                              ) : (
                                <FiClock className="text-amber-500 text-lg" />
                              )}
                              <span className="font-mono text-lg font-bold">${parseFloat(h.amount).toFixed(2)}</span>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                              h.status === 'PENDING' 
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                                : h.status === 'APPROVED' 
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                  : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                              {h.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <div className="text-gray-500">
                              {new Date(h.request_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="text-gray-400 text-xs truncate max-w-[200px]">
                              {h.bank_snapshot?.split('|')[0] || 'Bank Details'}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gradient-to-r from-gray-900/50 to-gray-950/50 border-t border-gray-800/50">
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Secure Transactions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>18+ Only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}