'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, LogIn, User, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    if (mode === 'login') {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || 'লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে তথ্য যাচাই করুন।');
      }
    } else {
      const res = await register(name, email, password, phone);
      setLoading(false);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.error || 'রেজিস্ট্রেশন সম্পন্ন করা যায়নি।');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setLoading(true);
    const res = await loginWithGoogle();
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.error || 'গুগল লগইন ব্যর্থ হয়েছে।');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#ece8e0]"
        >
          {/* Header */}
          <div className="bg-[#112734] p-6 text-center relative">
            <div className="w-12 h-12 bg-[#23626F] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-[#17A2B8]/50 shadow-inner text-[#17A2B8]">
              <LogIn size={24} />
            </div>
            <h2 className="text-2xl font-black text-white font-anek">
              {mode === 'login' ? 'স্বাগতম!' : 'নতুন একাউন্ট তৈরি'}
            </h2>
            <p className="text-emerald-100/80 text-xs mt-1">
              {mode === 'login' ? 'আপনার অ্যাকাউন্টে লগইন করুন' : 'নূর ফিকহ একাডেমিতে শিক্ষার্থী হিসেবে যুক্ত হোন'}
            </p>
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-[#112734] text-[#17A2B8]/80 hover:text-white rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {/* Mode Switch Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className={`py-2 text-xs font-bold font-tiro rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-white text-[#112734] shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                লগইন
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className={`py-2 text-xs font-bold font-tiro rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-white text-[#112734] shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                নতুন একাউন্ট
              </button>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border-2 border-slate-200 hover:border-[#112734]/30 hover:bg-slate-50 text-slate-700 font-bold font-tiro rounded-xl transition-all shadow-sm disabled:opacity-50 text-xs"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.78 15.73 17.57V20.34H19.29C21.37 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4" />
                <path d="M12 23C14.97 23 17.46 22.02 19.29 20.34L15.73 17.57C14.74 18.23 13.48 18.63 12 18.63C9.14 18.63 6.71 16.7 5.84 14.09H2.18V16.92C4.01 20.53 7.69 23 12 23Z" fill="#34A853" />
                <path d="M5.84 14.09C5.62 13.43 5.5 12.73 5.5 12C5.5 11.27 5.62 10.57 5.84 9.91V7.08H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.92L5.84 14.09Z" fill="#FBBC05" />
                <path d="M12 5.38C13.62 5.38 15.06 5.93 16.21 7.02L19.38 3.85C17.46 2.05 14.97 1 12 1C7.69 1 4.01 3.47 2.18 7.08L5.84 9.91C6.71 7.3 9.14 5.38 12 5.38Z" fill="#EA4335" />
              </svg>
              <span>Google দিয়ে {mode === 'login' ? 'লগইন' : 'যুক্ত হোন'}</span>
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-[11px] font-bold text-slate-400 font-tiro">অথবা ইমেইলে</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#2c3e50] ml-1">আপনার পূর্ণ নাম</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={16} className="text-slate-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="যেমন: মুহাম্মদ আব্দুল্লাহ"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#112734] focus:ring-1 focus:ring-[#112734] rounded-xl text-xs transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#2c3e50] ml-1">মোবাইল নম্বর (ঐচ্ছিক)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone size={16} className="text-slate-400" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="017xxxxxxxx"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#112734] focus:ring-1 focus:ring-[#112734] rounded-xl text-xs transition-all outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2c3e50] ml-1">ইমেইল এড্রেস</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#112734] focus:ring-1 focus:ring-[#112734] rounded-xl text-xs transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold text-[#2c3e50]">পাসওয়ার্ড</label>
                  {mode === 'login' && (
                    <span className="text-[10px] text-slate-400">গোপন রাখুন</span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#112734] focus:ring-1 focus:ring-[#112734] rounded-xl text-xs transition-all outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#112734] hover:bg-[#23626F] text-white font-bold font-tiro rounded-xl transition-colors shadow-md disabled:opacity-70 flex items-center justify-center gap-2 text-sm mt-2 cursor-pointer"
              >
                {loading ? 'অনুগ্রহ করে অপেক্ষা করুন...' : mode === 'login' ? 'লগইন করুন' : 'নিবন্ধন সম্পন্ন করুন'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

