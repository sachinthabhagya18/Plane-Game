"use client";

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Login Request
      // const res = await axios.post('http://127.0.0.1:8000/api/login/', {
      //   username,
      //   password
      // });
      const res = await axios.post('http://164.68.123.57:8000/api/login/', {
        username,
        password
      });

      // 2. Token Save
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);

      // 3. Redirect to Game (Admin ද කියා බලන්නේ නැත, කෙලින්ම Game එකට)
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
    <div className="flex min-h-screen bg-black items-center justify-center p-4">
      <div className="bg-[#1b2733] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        
        <h1 className="text-3xl font-bold text-red-600 text-center mb-2 italic">AVIATOR</h1>
        <h2 className="text-xl text-white text-center mb-8 font-bold">Welcome Back</h2>

        {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm text-center animate-pulse">
                {error}
            </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-gray-400 text-sm font-bold mb-1 block">Username</label>
            <input 
              className="w-full p-3 bg-black text-white rounded border border-gray-600 focus:border-red-500 focus:outline-none transition-colors"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-gray-400 text-sm font-bold mb-1 block">Password</label>
            <input 
              className="w-full p-3 bg-black text-white rounded border border-gray-600 focus:border-red-500 focus:outline-none transition-colors"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full p-4 mt-2 rounded font-bold text-white uppercase tracking-wider transition-all
            ${loading ? 'bg-gray-600 cursor-wait' : 'bg-green-600 hover:bg-green-500 shadow-lg'}`}
          >
            {loading ? 'Logging In...' : 'LOG IN TO PLAY'}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6 text-sm">
          Don't have an account?{' '}
          <Link href="/register" className="text-red-500 font-bold hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}