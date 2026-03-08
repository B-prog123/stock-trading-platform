import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail, Lock, User, ArrowRight, ArrowLeft,
  Shield, CheckCircle2, TrendingUp, Eye, EyeOff
} from 'lucide-react';
import { apiUrl } from '../lib/api';

const tickerTape = ['RELIANCE +1.25%', 'TCS -0.41%', 'HDFCBANK +2.82%', 'INFY +0.85%', 'ICICIBANK -0.12%', 'SBIN +1.15%'];

type Step = 'details' | 'otp';

export default function Auth() {
  const { login } = useAuth();

  // State
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Spotlight Position
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ── handle Step 1 submit ────────────────────────────────────────────────────
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Login: just authenticate and done (no OTP required for existing users)
      setLoading(true);
      try {
        const res = await fetch(apiUrl('/api/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data?.error || 'Invalid email or password'); return; }
        login(data.token, data.user);
      } catch { setError('Network error. Please try again.'); }
      finally { setLoading(false); }
      return;
    }

    // Registration: validate and register directly
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.error || 'Failed to send OTP'); return; }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };



  const switchToLogin = () => {
    setIsLogin(true); setName(''); setPassword(''); setError('');
  };

  const switchToRegister = () => {
    setIsLogin(false); setError(''); setInfo('');
  };



  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">

      {/* --- Advanced GPU-Accelerated Background --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[0]">

        {/* Base Gradient Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white z-[2]" />

        {/* 1. Dynamic 3D Isometric Mesh Grid */}
        <div className="auth-mesh-grid opacity-30 dark:opacity-20" />

        {/* 2. Interactive Mouse Spotlight */}
        <div
          className="auth-spotlight"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            opacity: mousePos.x === -1000 ? 0 : 1
          }}
        />

        {/* 3. Floating Ambient CSS Orbs (No layout thrashing) */}
        <div className="auth-orb w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/20 top-[-20%] left-[-10%]" style={{ animationDelay: '0s' }} />
        <div className="auth-orb w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-600/20 bottom-[-10%] right-[-10%]" style={{ animationDelay: '-12s' }} />
        <div className="auth-orb w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-600/20 top-[40%] left-[30%]" style={{ animationDelay: '-5s' }} />

      </div>

      {/* Ticker - Light theme */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-md text-emerald-600 text-[10px] font-black py-2 overflow-hidden border-b border-gray-200 uppercase tracking-widest hidden md:block">
        <motion.div className="flex gap-10 whitespace-nowrap w-max"
          animate={{ x: [0, -900] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}>
          {[...tickerTape, ...tickerTape].map((t, i) => <span key={i} className="mx-6 flex items-center gap-2">
            <TrendingUp size={10} /> {t}
          </span>)}
        </motion.div>
      </div>

      {/* Card */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="relative w-full max-w-md z-10 mt-8">
        <div className="bg-white rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-8 pb-5">
            {/* Brand */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg">
                <TrendingUp size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent tracking-tight">STOCKIFY</h1>
                <p className="text-[11px] text-[var(--text-muted)]">Smart Trading Platform</p>
              </div>
            </div>

            <motion.div key="title-details" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <h2 className="text-xl font-bold text-slate-900">
                {isLogin ? 'Sign in to your account' : 'Create your account'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isLogin ? 'Enter your credentials to continue trading' : 'Fill in your details to get started'}
              </p>
            </motion.div>
          </div>

          <div className="px-8 pb-6">
            {/* Alerts */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm flex gap-2">
                  ⚠️ {error}
                </motion.div>
              )}
              {info && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm flex gap-2 items-start">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> {info}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {/* Details Form (Only 1 Step Now) */}
              <motion.form key="details" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                onSubmit={handleDetailsSubmit} className="space-y-3">

                {/* Name (register only) */}
                {!isLogin && (
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input required value={name} onChange={e => setName(e.target.value)} placeholder="Full Name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-blue-500 transition-colors text-[var(--text-primary)]" />
                  </div>
                )}

                {/* Email */}
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-blue-500 transition-colors text-[var(--text-primary)]" />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input required type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-blue-500 transition-colors text-[var(--text-primary)]" />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 text-sm mt-2">
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Please wait...</>
                  ) : isLogin ? (
                    <><ArrowRight size={16} /> Sign In</>
                  ) : (
                    <><CheckCircle2 size={16} /> Create Account</>
                  )}
                </motion.button>

                <p className="text-center text-xs text-[var(--text-muted)] pt-1">
                  {isLogin ? "New to Stockify? " : 'Already have an account? '}
                  <button type="button" onClick={isLogin ? switchToRegister : switchToLogin}
                    className="text-blue-500 font-semibold hover:underline">
                    {isLogin ? 'Create Account' : 'Sign In'}
                  </button>
                </p>
              </motion.form>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-200">
            <p className="text-[11px] text-slate-500 text-center">
              🔒 Your data is secured with end-to-end encryption
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
