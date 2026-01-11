"use client";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiLock, FiPhone, FiCreditCard, FiMapPin, FiHash } from 'react-icons/fi';

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
  const API_URL = 'https://1xplane.com';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/register/`, formData);
      alert('Registration Successful! Please Login.');
      router.push('/login');
    } catch (err: any) {
      console.error("Registration Failed:", err);
      
      if (err.response && err.response.data) {
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
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E17] to-[#111827] flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl">
        {/* Background Decorative Elements */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-500/5 rounded-full blur-3xl"></div>
        
        {/* Main Card */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden">
          
          {/* Card Header */}
          <div className="relative p-8 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-b border-gray-800/50">
            {/* Plane Animation */}
            <div className="absolute top-4 right-8 animate-bounce">
              <div className="text-3xl">✈️</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <img
                  src="https://sachintha.online/wp-content/uploads/2026/01/plane-logo.png.png"
                  alt="Aviator Logo"
                  className="w-30"
                />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
              <p className="text-gray-400 text-sm">Join the ultimate aviator gaming experience</p>
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mx-8 mt-6 p-4 bg-gradient-to-r from-red-900/40 to-red-800/20 backdrop-blur-sm border border-red-500/30 rounded-xl">
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

          {/* Form Content */}
          <div className="p-8">
            <form onSubmit={handleRegister}>
              
              {/* Login Details Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                    <FiUser className="text-white text-lg" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Login Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Username */}
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                      <FiUser className="text-blue-400" />
                      Username
                    </label>
                    <div className="relative">
                      <input 
                        name="username" 
                        type="text" 
                        onChange={handleChange} 
                        required 
                        className="w-full p-4 pl-12 bg-gradient-to-r from-gray-900 to-gray-950 text-white rounded-xl border border-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        placeholder="Choose a username"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <FiUser className="text-gray-500" />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                      <FiLock className="text-blue-400" />
                      Password
                    </label>
                    <div className="relative">
                      <input 
                        name="password" 
                        type="password" 
                        onChange={handleChange} 
                        required 
                        className="w-full p-4 pl-12 bg-gradient-to-r from-gray-900 to-gray-950 text-white rounded-xl border border-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        placeholder="Create a strong password"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <FiLock className="text-gray-500" />
                      </div>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                      <FiPhone className="text-blue-400" />
                      Phone Number
                    </label>
                    <div className="relative">
                      <input 
                        name="phone_number" 
                        type="text" 
                        onChange={handleChange} 
                        required 
                        className="w-full p-4 pl-12 bg-gradient-to-r from-gray-900 to-gray-950 text-white rounded-xl border border-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        placeholder="07X XXXXXXX"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <FiPhone className="text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Details Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
                    <FiCreditCard className="text-white text-lg" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Bank Details</h3>
                  <span className="text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">For Withdrawals</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Beneficiary Name */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                      <FiUser className="text-emerald-400" />
                      Beneficiary Name
                    </label>
                    <div className="relative">
                      <input 
                        name="beneficiary_name" 
                        type="text" 
                        onChange={handleChange} 
                        required 
                        className="w-full p-4 pl-12 bg-gradient-to-r from-gray-900 to-gray-950 text-white rounded-xl border border-gray-700/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                        placeholder="Account Holder Name"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <FiUser className="text-gray-500" />
                      </div>
                    </div>
                  </div>

                  {/* Bank Name */}
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                      Bank Name
                    </label>
                    <div className="relative">
                      <input 
                        name="bank_name" 
                        type="text" 
                        onChange={handleChange} 
                        required 
                        className="w-full p-4 pl-12 bg-gradient-to-r from-gray-900 to-gray-950 text-white rounded-xl border border-gray-700/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                        placeholder="e.g. Commercial Bank"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      </div>
                    </div>
                  </div>

                  {/* Branch Name */}
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                      <FiMapPin className="text-emerald-400" />
                      Branch Name
                    </label>
                    <div className="relative">
                      <input 
                        name="branch_name" 
                        type="text" 
                        onChange={handleChange} 
                        required 
                        className="w-full p-4 pl-12 bg-gradient-to-r from-gray-900 to-gray-950 text-white rounded-xl border border-gray-700/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                        placeholder="e.g. Colombo Main"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <FiMapPin className="text-gray-500" />
                      </div>
                    </div>
                  </div>

                  {/* Account Number */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                      <FiHash className="text-emerald-400" />
                      Account Number
                    </label>
                    <div className="relative">
                      <input 
                        name="account_number" 
                        type="text" 
                        onChange={handleChange} 
                        required 
                        className="w-full p-4 pl-12 bg-gradient-to-r from-gray-900 to-gray-950 text-white rounded-xl border border-gray-700/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                        placeholder="XXXXXXXXXX"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <FiHash className="text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-10">
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`relative w-full py-5 px-6 rounded-xl font-bold text-white uppercase tracking-wider transition-all duration-300 overflow-hidden group
                    ${loading 
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-wait' 
                      : 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)]'
                    }`}
                >
                  {/* Shine Effect */}
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>
                  
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <span className="text-lg">✈️</span>
                        JOIN 1XPLANE NOW
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

            {/* Login Link */}
            <div className="mt-8 pt-8 border-t border-gray-800/50 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-blue-400 font-bold hover:text-blue-300 transition-colors inline-flex items-center gap-1 hover:gap-2 group"
                >
                  <span>Login Here</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </p>
            </div>
          </div>

          {/* Footer Note */}
          <div className="px-8 py-4 bg-gradient-to-r from-gray-900/50 to-gray-950/50 border-t border-gray-800/50">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <FiShield className="text-emerald-400 text-xs" />
                </div>
                <span className="text-xs text-gray-400">Secure Registration</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                  <FiHeart className="text-red-400 text-xs" />
                </div>
                <span className="text-xs text-gray-400">18+ Only</span>
              </div>
              <div className="text-xs text-gray-600">
                © {new Date().getFullYear()} 1XPlane Game
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add missing icons import
import { FiShield, FiHeart } from 'react-icons/fi';