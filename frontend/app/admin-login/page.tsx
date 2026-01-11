"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FiLock, FiUser, FiAlertTriangle, FiArrowLeft, FiShield } from 'react-icons/fi';
import { MdAdminPanelSettings } from 'react-icons/md';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const API_URL = 'https://1xplane.com';
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log("Attempting Super Admin Login...");

      // 1. Login Request
      const res = await axios.post(`${API_URL}/api/login/`, {
        username,
        password
      });

      const accessToken = res.data.access;
      const refreshToken = res.data.refresh;

      // 2. Check User Role
      const userRes = await axios.get(`${API_URL}/api/user/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      console.log("User Role Data:", userRes.data);

      // 3. Super Admin Check Logic
      if (userRes.data.is_superuser) {
        console.log("Super Admin Verified. Access Granted.");
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        router.push('/admin');
      } else {
        console.warn("User is NOT a Super Admin");
        setError("Access Denied! Super Admin privileges required.");
      }

    } catch (err: any) {
      console.error("Login Failed:", err);
      if (err.response && err.response.status === 401) {
        setError('Incorrect Username or Password!');
      } else {
        setError('Login Failed. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E17] to-[#111827] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Background Effects */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-red-900/5 rounded-full blur-3xl"></div>

        {/* Security Shield Animation */}
        <div className="absolute top-10 right-10 animate-pulse">
          <div className="text-4xl text-red-500/20">🛡️</div>
        </div>

        {/* Main Login Card */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden">

          {/* Header Section */}
          <div className="relative p-8 bg-gradient-to-r from-red-900/20 to-red-800/20 border-b border-gray-800/50">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg mb-4">
                <MdAdminPanelSettings className="text-3xl text-white" />
              </div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                SUPER ADMIN
              </h1>
              <p className="text-gray-400 text-sm text-center mt-2">Restricted Access Area</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-8 mt-6 p-4 bg-gradient-to-r from-red-900/40 to-red-800/20 backdrop-blur-sm border border-red-500/30 rounded-xl animate-pulse">
              <div className="flex items-center gap-3 text-red-300">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <FiAlertTriangle className="text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Section */}
          <div className="p-8">
            <form onSubmit={handleAdminLogin} className="space-y-6">

              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <FiUser className="text-red-400" />
                  Super Admin Username
                </label>
                <div className="relative">
                  <input
                    className="w-full p-4 pl-12 bg-gradient-to-r from-gray-900 to-gray-950 text-white rounded-xl border border-gray-700/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all font-mono"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FiUser className="text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <FiLock className="text-red-400" />
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full p-4 pl-12 bg-gradient-to-r from-gray-900 to-gray-950 text-white rounded-xl border border-gray-700/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all font-mono"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FiLock className="text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Access Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`relative w-full py-5 px-6 rounded-xl font-bold text-white uppercase tracking-wider transition-all duration-300 overflow-hidden group
                    ${loading
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-wait'
                      : 'bg-gradient-to-r from-red-600 via-red-500 to-red-700 hover:from-red-500 hover:via-red-400 hover:to-red-600 shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:shadow-[0_0_40px_rgba(239,68,68,0.6)] active:scale-95'
                    }`}
                >
                  {/* Shine Effect */}
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>

                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Verifying Access...</span>
                      </>
                    ) : (
                      <>
                        <FiShield className="text-lg" />
                        <span>ACCESS DASHBOARD</span>
                      </>
                    )}
                  </span>

                  {/* Hover effect */}
                  {!loading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  )}
                </button>
              </div>
            </form>

            {/* Back to Game Login */}
            <div className="mt-8 pt-8 border-t border-gray-800/50 text-center">
              <button
                onClick={() => router.push('/login')}
                className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2 group"
              >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                <span>Back to Game Login</span>
              </button>
            </div>
          </div>

          {/* Security Footer */}
          <div className="px-8 py-4 bg-gradient-to-r from-gray-900/50 to-gray-950/50 border-t border-gray-800/50">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs text-gray-400">Restricted Access</span>
              </div>
              <p className="text-xs text-gray-600">
                Authorized Personnel Only • Security Level: MAXIMUM
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}