"use client";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '', 
    password: '', 
    phone_number: '',
    beneficiary_name: '',
    bank_name: '',
    branch_name: '',
    account_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Error state එකක් එකතු කළා

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // පරණ Errors මකන්න
    setLoading(true);

    try {
      await axios.post('http://164.68.123.57:8000/api/register/', formData);
      alert('Registration Successful! Please Login.');
      router.push('/login');
    } catch (err: any) {
      console.error("Registration Failed:", err);
      
      // Backend එකෙන් එන නියම Error එක පෙන්වන්න
      if (err.response && err.response.data) {
        // උදා: { username: ["User already exists"] }
        const errorMsg = Object.values(err.response.data).flat().join(', ');
        setError(errorMsg || "Registration Failed. Please try again.");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Network Error or Server is Down.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
      setFormData({...formData, [e.target.name]: e.target.value});
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-[#1b2733] p-6 rounded-xl w-full max-w-2xl border border-gray-700 shadow-2xl">
        
        <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-red-600 italic tracking-wider">JOIN NOW</h2>
            <p className="text-gray-400 text-sm mt-1">Create your Aviator account</p>
        </div>

        {/* Error Message Display */}
        {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-6 text-sm text-center font-bold">
                ⚠️ {error}
            </div>
        )}

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* --- LOGIN DETAILS --- */}
          <div className="md:col-span-2 space-y-4">
              <div>
                <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Username</label>
                <input name="username" type="text" onChange={handleChange} required 
                    className="w-full p-3 bg-black text-white rounded border border-gray-600 focus:border-red-500 outline-none" placeholder="Choose a username" />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Password</label>
                <input name="password" type="password" onChange={handleChange} required 
                    className="w-full p-3 bg-black text-white rounded border border-gray-600 focus:border-red-500 outline-none" placeholder="Create a password" />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Phone Number</label>
                <input name="phone_number" type="text" onChange={handleChange} required 
                    className="w-full p-3 bg-black text-white rounded border border-gray-600 focus:border-red-500 outline-none" placeholder="07X XXXXXXX" />
              </div>
          </div>

          {/* --- BANK DETAILS --- */}
          <div className="md:col-span-2 border-t border-gray-700 pt-4 mt-2">
              <h3 className="text-blue-400 font-bold mb-3 text-sm uppercase">Bank Details (For Withdrawals)</h3>
          </div>

          <div className="md:col-span-2">
            <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Beneficiary Name</label>
            <input name="beneficiary_name" type="text" onChange={handleChange} required 
                className="w-full p-3 bg-black text-white rounded border border-gray-600 focus:border-red-500 outline-none" placeholder="Account Holder Name" />
          </div>

          <div>
            <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Bank Name</label>
            <input name="bank_name" type="text" onChange={handleChange} required 
                className="w-full p-3 bg-black text-white rounded border border-gray-600 focus:border-red-500 outline-none" placeholder="e.g. Commercial Bank" />
          </div>

          <div>
            <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Branch Name</label>
            <input name="branch_name" type="text" onChange={handleChange} required 
                className="w-full p-3 bg-black text-white rounded border border-gray-600 focus:border-red-500 outline-none" placeholder="e.g. Colombo Main" />
          </div>

          <div className="md:col-span-2">
            <label className="text-gray-400 text-xs font-bold uppercase mb-1 block">Account Number</label>
            <input name="account_number" type="text" onChange={handleChange} required 
                className="w-full p-3 bg-black text-white rounded border border-gray-600 focus:border-red-500 outline-none" placeholder="XXXXXXXXXX" />
          </div>

          <div className="md:col-span-2 mt-4">
              <button type="submit" disabled={loading}
                className={`w-full p-4 rounded font-bold text-white uppercase tracking-wider transition-all
                ${loading ? 'bg-gray-600 cursor-wait' : 'bg-red-600 hover:bg-red-500 shadow-lg'}`}>
                {loading ? 'Creating Account...' : 'REGISTER'}
              </button>
          </div>
        </form>

        <p className="text-gray-400 text-center text-sm mt-6">
            Already have an account? <Link href="/login" className="text-green-500 font-bold hover:underline">Login Here</Link>
        </p>
      </div>
    </div>
  );
}