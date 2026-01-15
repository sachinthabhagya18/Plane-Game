"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { FiLock, FiCheckCircle } from 'react-icons/fi';

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const uid = searchParams.get('uid');
  const token = searchParams.get('token');
  const API_URL = 'https://1xplane.com';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/api/password-reset-confirm/`, {
        uidb64: uid,
        token: token,
        new_password: newPassword
      });
      setMessage('✅ Password reset successful!');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setError('❌ Invalid or expired link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!uid || !token) {
      return <div className="h-screen flex items-center justify-center text-white">Invalid Reset Link</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E17] to-[#111827] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl p-8">
        
        <h2 className="text-2xl font-bold text-white text-center mb-6">Set New Password</h2>

        {message && <div className="bg-green-500/20 text-green-400 p-3 rounded-lg mb-4 text-center">{message}</div>}
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-center">{error}</div>}

        {!message && (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-gray-300 text-xs font-bold uppercase mb-1 block">New Password</label>
                <div className="relative">
                    <input 
                        type="password" 
                        required 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-3 pl-10 bg-black/50 text-white rounded-xl border border-gray-600 focus:border-green-500 outline-none"
                        placeholder="Min 8 characters"
                    />
                    <FiLock className="absolute left-3 top-3.5 text-gray-500" />
                </div>
            </div>

            <div>
                <label className="text-gray-300 text-xs font-bold uppercase mb-1 block">Confirm Password</label>
                <div className="relative">
                    <input 
                        type="password" 
                        required 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-3 pl-10 bg-black/50 text-white rounded-xl border border-gray-600 focus:border-green-500 outline-none"
                        placeholder="Retype password"
                    />
                    <FiLock className="absolute left-3 top-3.5 text-gray-500" />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full p-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg active:scale-95"
            >
                {loading ? 'Resetting...' : 'CHANGE PASSWORD'}
            </button>
            </form>
        )}
      </div>
    </div>
  );
}