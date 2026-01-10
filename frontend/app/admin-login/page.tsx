"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log("Attempting Super Admin Login...");

      // 1. Login Request
      // const res = await axios.post('http://127.0.0.1:8000/api/login/', {
      //   username,
      //   password
      // });

      const res = await axios.post('http://164.68.123.57:8000/api/login/', {
        username,
        password
      });



      const accessToken = res.data.access;
      const refreshToken = res.data.refresh;

      // 2. Check User Role
      // const userRes = await axios.get('http://127.0.0.1:8000/api/user/', {
      //   headers: { Authorization: `Bearer ${accessToken}` }
      // });

      const userRes = await axios.get('http://164.68.123.57:8000/api/user/', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      console.log("User Role Data:", userRes.data);

      // 3. Super Admin Check Logic
      // is_superuser = True නම් පමණක් Dashboard එකට යවයි
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
      // 401 Error Handling
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
    <div className="flex min-h-screen bg-[#0f1923] items-center justify-center p-4">
      <div className="bg-[#1b2733] p-8 rounded-xl shadow-2xl w-full max-w-md border-2 border-red-900/50">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-red-600 italic tracking-wider">SUPER ADMIN</h1>
          <p className="text-gray-400 text-sm tracking-widest uppercase mt-2">Restricted Access Area</p>
        </div>

        {error && (
          <div className="bg-red-900/80 border border-red-500 text-white p-3 rounded mb-6 text-sm text-center font-bold animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="flex flex-col gap-5">
          <div>
            <label className="text-gray-400 text-xs font-bold uppercase mb-2 block tracking-wider">Super Admin Username</label>
            <input
              className="w-full p-3 bg-black/50 text-white rounded border border-gray-600 focus:border-red-500 focus:outline-none transition-colors font-mono"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs font-bold uppercase mb-2 block tracking-wider">Password</label>
            <input
              className="w-full p-3 bg-black/50 text-white rounded border border-gray-600 focus:border-red-500 focus:outline-none transition-colors font-mono"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-4 mt-4 rounded font-bold text-white uppercase tracking-widest transition-all shadow-lg
            ${loading ? 'bg-gray-700 cursor-wait' : 'bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 border border-red-500'}`}
          >
            {loading ? 'Verifying Access...' : 'ACCESS DASHBOARD'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-700 pt-4">
          <button
            onClick={() => router.push('/login')}
            className="text-gray-500 text-xs hover:text-white transition-colors"
          >
            ← Back to Game Login
          </button>
        </div>
      </div>
    </div>
  );
}