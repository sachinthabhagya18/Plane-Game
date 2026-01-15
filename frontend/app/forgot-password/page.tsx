"use client";

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FiMail, FiArrowLeft } from 'react-icons/fi';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ඔබේ Backend URL එක (Localhost හෝ Domain)
  const API_URL = 'https://1xplane.com'; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await axios.post(`${API_URL}/api/password-reset/`, { email });
      setMessage('✅ Reset link sent! Check your email (or server console).');
    } catch (err) {
      setError('❌ Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E17] to-[#111827] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl p-8">
        
        <h2 className="text-2xl font-bold text-white text-center mb-2">Reset Password</h2>
        <p className="text-gray-400 text-center text-sm mb-6">Enter your email to receive a reset link</p>

        {message && <div className="bg-green-500/20 text-green-400 p-3 rounded-lg mb-4 text-sm text-center">{message}</div>}
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-300 text-xs font-bold uppercase mb-1 block">Email Address</label>
            <div className="relative">
                <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 pl-10 bg-black/50 text-white rounded-xl border border-gray-600 focus:border-blue-500 outline-none"
                    placeholder="name@example.com"
                />
                <FiMail className="absolute left-3 top-3.5 text-gray-500" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full p-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg active:scale-95"
          >
            {loading ? 'Sending Link...' : 'SEND RESET LINK'}
          </button>
        </form>

        <div className="mt-6 text-center">
            <Link href="/login" className="text-gray-500 hover:text-white text-sm flex items-center justify-center gap-2 transition-colors">
                <FiArrowLeft /> Back to Login
            </Link>
        </div>
      </div>
    </div>
  );
}