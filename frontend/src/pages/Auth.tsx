import React, { useState } from 'react';
import { useAuth } from '../App';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight, LineChart, TrendingUp } from 'lucide-react';
import { apiUrl } from '../lib/api';

const tickerTape = ['RELIANCE +1.25%', 'TCS -0.41%', 'HDFCBANK +2.82%', 'INFY +0.85%', 'ICICIBANK -0.12%', 'SBIN +1.15%'];

export default function Auth() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { email, password, name };

    try {
      const res = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await res.json() : null;

      if (res.ok) {
        if (isLogin) {
          login(data.token, data.user);
        } else {
          setIsLogin(true);
          setInfo('Registration successful! Stockify AI gives real-time market tracking, portfolio insights, and AI-powered trade guidance. Please login to continue.');
        }
      } else {
        setError(data?.error || `Authentication failed (HTTP ${res.status})`);
      }
    } catch (err) {
      setError('Network error: unable to reach API. Check VITE_API_BASE_URL and backend CORS settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-float-slow animate-pulse-soft" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-float-reverse" />
        <div className="absolute inset-0 bg-ambient-grid opacity-30" />

        <motion.svg
          className="absolute inset-0 w-full h-full opacity-30"
          viewBox="0 0 1200 800"
          initial={{ opacity: 0.15 }}
          animate={{ opacity: 0.35 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        >
          <motion.path
            d="M0 580 C120 500, 220 640, 340 540 C460 450, 560 590, 680 500 C800 410, 920 560, 1040 470 C1100 430, 1160 420, 1200 390"
            fill="none"
            stroke="rgba(16,185,129,0.45)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0.4, pathOffset: 0 }}
            animate={{ pathLength: [0.4, 1], pathOffset: [0, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <motion.path
            d="M0 640 C140 590, 240 700, 360 610 C470 530, 580 690, 700 600 C820 510, 930 650, 1060 560 C1120 520, 1160 510, 1200 500"
            fill="none"
            stroke="rgba(59,130,246,0.3)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0.2, pathOffset: 0 }}
            animate={{ pathLength: [0.2, 0.9], pathOffset: [0, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
        </motion.svg>

        <motion.svg
          className="absolute inset-0 w-full h-full opacity-45"
          viewBox="0 0 1200 800"
        >
          <motion.path
            d="M80 700 L220 640 L360 610 L500 530 L640 470 L780 420 L920 320 L1060 250"
            fill="none"
            stroke="rgba(16,185,129,0.85)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3.8, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
          />

          <motion.circle
            r="8"
            fill="#34d399"
            filter="drop-shadow(0px 0px 10px rgba(52,211,153,0.8))"
            animate={{
              cx: [80, 220, 360, 500, 640, 780, 920, 1060],
              cy: [700, 640, 610, 530, 470, 420, 320, 250],
            }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.polygon
            points="0,-14 12,10 -12,10"
            fill="rgba(16,185,129,0.9)"
            animate={{
              x: [80, 220, 360, 500, 640, 780, 920, 1060],
              y: [700, 640, 610, 530, 470, 420, 320, 250],
              rotate: [32, 30, 28, 30, 28, 26, 22, 20],
            }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.svg>

        <motion.div
          className="absolute top-20 left-0 right-0 whitespace-nowrap"
          initial={{ x: '100%' }}
          animate={{ x: '-120%' }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        >
          <div className="inline-flex gap-4">
            {[...tickerTape, ...tickerTape].map((item, i) => (
              <span key={`top-${i}`} className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                {item}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-24 left-0 right-0 whitespace-nowrap"
          initial={{ x: '-120%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
        >
          <div className="inline-flex gap-4">
            {[...tickerTape, ...tickerTape].map((item, i) => (
              <span key={`bottom-${i}`} className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                {item}
              </span>
            ))}
          </div>
        </motion.div>

        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex gap-2 opacity-30">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-2 bg-emerald-400/60 rounded-full"
              style={{ height: `${18 + (i % 4) * 12}px` }}
              animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.4 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[40px] p-10 relative z-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <LineChart className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Stockify AI</h1>
          <p className="text-[var(--text-secondary)] flex items-center justify-center gap-2">
            <TrendingUp size={14} className="text-emerald-400" />
            The future of intelligent trading.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs text-[var(--text-secondary)] uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-emerald-500/50 transition-all text-[var(--text-primary)]"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs text-[var(--text-secondary)] uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-emerald-500/50 transition-all text-[var(--text-primary)]"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-[var(--text-secondary)] uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-emerald-500/50 transition-all text-[var(--text-primary)]"
                placeholder="********"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {info && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm text-center">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-white font-bold py-4 rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[var(--text-secondary)] hover:text-emerald-400 text-sm transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}



