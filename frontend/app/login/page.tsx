"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';
import { MdFlight } from 'react-icons/md';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const API_URL = 'https://1xplane.com';
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/login/`, {
        username,
        password
      });

      // Token Save
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);

      console.log("Login Successful");
      router.push('/');

    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setError('Username හෝ Password වැරදියි!');
      } else {
        setError('Login වීමේ ගැටලුවක්. කරුණාකර නැවත උත්සාහ කරන්න.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E17] to-[#111827] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Animated Background Elements */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-red-500/5 rounded-full blur-3xl"></div>

        {/* Flying Plane Animation */}
        <div className="absolute top-10 right-10 animate-[fly_10s_linear_infinite] opacity-20">
          <div className="text-4xl">✈️</div>
        </div>

        {/* Main Login Card */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden">

          {/* Header Section */}
          <div className="relative p-8 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-b border-gray-800/50">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://sachintha.online/wp-content/uploads/2026/01/plane-logo.png.png"
                  alt="Aviator Logo"
                  className="w-30 "
                />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Welcome Back Pilot!</h2>
              <p className="text-gray-400 text-sm text-center">Login to continue your flight adventure</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-8 mt-6 p-4 bg-gradient-to-r from-red-900/40 to-red-800/20 backdrop-blur-sm border border-red-500/30 rounded-xl animate-pulse">
              <div className="flex items-center gap-3 text-red-300">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="text-lg">⚠️</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Section */}
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">

              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <FiUser className="text-blue-400" />
                  Username
                </label>
                <div className="relative">
                  <input
                    className="w-full p-4 pl-12 bg-gradient-to-r from-gray-900 to-gray-950 text-white rounded-xl border border-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FiUser className="text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <FiLock className="text-blue-400" />
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full p-4 pl-12 bg-gradient-to-r from-gray-900 to-gray-950 text-white rounded-xl border border-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FiLock className="text-gray-500" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-1">
                <Link
                  href="/forgot-password"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              {/* Login Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`relative w-full py-4 px-6 rounded-xl font-bold text-white uppercase tracking-wider transition-all duration-300 overflow-hidden group
                    ${loading
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-wait'
                      : 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] active:scale-95'
                    }`}
                >
                  {/* Shine Effect */}
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>

                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <MdFlight className="text-lg" />
                        <span>START FLIGHT</span>
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

            {/* Register Link */}
            <div className="mt-8 pt-8 border-t border-gray-800/50 text-center">
              <p className="text-gray-400">
                New to 1XPlane?{' '}
                <Link
                  href="/register"
                  className="text-blue-400 font-bold hover:text-blue-300 transition-colors inline-flex items-center gap-1 hover:gap-2 group"
                >
                  <span>Create Account</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </p>
            </div>
          </div>

          {/* Footer Security Note */}
          <div className="px-8 py-4 bg-gradient-to-r from-gray-900/50 to-gray-950/50 border-t border-gray-800/50">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs text-gray-400">Secure Login</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs text-gray-400">18+ Only</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for plane animation */}
      <style jsx global>{`
        @keyframes fly {
          0% {
            transform: translateX(100px) translateY(-50px);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          50% {
            transform: translateX(-100px) translateY(50px);
            opacity: 0.3;
          }
          90% {
            opacity: 0.1;
          }
          100% {
            transform: translateX(-200px) translateY(100px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}