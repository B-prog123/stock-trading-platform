import React, { useState, useRef } from 'react';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail, Lock, User, Phone, ArrowRight, ArrowLeft,
  Shield, CheckCircle2, TrendingUp, Eye, EyeOff
} from 'lucide-react';
import { apiUrl } from '../lib/api';

const tickerTape = ['RELIANCE +1.25%', 'TCS -0.41%', 'HDFCBANK +2.82%', 'INFY +0.85%', 'ICICIBANK -0.12%', 'SBIN +1.15%'];

type Step = 'details' | 'otp';

export default function Auth() {
  const { login } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<Step>('details');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // OTP
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [devOtp, setDevOtp] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

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

    // Registration: validate phone then send OTP
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.error || 'Failed to send OTP'); return; }
      setDevOtp(data.otp || '');
      setStep('otp');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  // ── handle OTP submit ───────────────────────────────────────────────────────
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the complete 6-digit OTP'); return; }
    setError('');
    setLoading(true);

    try {
      // Verify OTP
      const verRes = await fetch(apiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: code }),
      });
      const verData = await verRes.json();
      if (!verRes.ok) { setError(verData?.error || 'Invalid OTP'); return; }

      // Register the user
      const regRes = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone }),
      });
      const regData = await regRes.json();
      if (!regRes.ok) { setError(regData?.error || 'Registration failed'); return; }

      setInfo('Account created successfully! Please sign in.');
      switchToLogin();
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const switchToLogin = () => {
    setIsLogin(true); setStep('details'); setOtp(['', '', '', '', '', '']);
    setDevOtp(''); setName(''); setPhone(''); setPassword(''); setError('');
  };

  const switchToRegister = () => {
    setIsLogin(false); setStep('details'); setOtp(['', '', '', '', '', '']);
    setDevOtp(''); setError(''); setInfo('');
  };

  const resendOtp = async () => {
    setError('');
    try {
      const res = await fetch(apiUrl('/api/auth/send-otp'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.otp) setDevOtp(data.otp);
    } catch { setError('Failed to resend OTP.'); }
  };

  // OTP box helpers
  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[idx] = val.slice(-1); setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };
  const handleOtpKey = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  return (
    <div className="min-h-screen bg-white text-[var(--text-primary)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background: Premium Multi-Layered Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Light Overlay - Let texture through on white bg */}
        <div className="absolute inset-0 bg-white/80 z-[1]" />

        {/* Layer 1: Ambient Mesh Grid - Intensified opacity */}
        <motion.div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.4) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
          animate={{
            x: [0, -20, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />

        {/* Layer 2: Growth Moving Bars - Light theme */}
        <div className="absolute bottom-0 left-0 right-0 h-[400px] flex items-end justify-around px-1 opacity-[0.12] pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 mx-[1px] bg-gradient-to-t from-emerald-200 via-blue-100/40 to-transparent rounded-t-full"
              initial={{ height: 0 }}
              animate={{
                height: [
                  (20 + Math.random() * 50) + "%",
                  (65 + Math.random() * 35) + "%",
                  (30 + Math.random() * 30) + "%"
                ],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.08,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        {/* Layer 3: Dynamic Price Action Line - Light theme */}
        <motion.svg className="absolute inset-x-0 bottom-[20%] w-full h-[300px] opacity-[0.15]" viewBox="0 0 1200 300" preserveAspectRatio="none">
          <motion.path
            d="M0 250 L100 220 L200 240 L300 180 L400 210 L500 150 L600 170 L700 120 L800 140 L900 80 L1000 100 L1100 50 L1200 70"
            fill="none"
            stroke="url(#lineGradLight)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{
              d: [
                "M0 250 L100 220 L200 240 L300 180 L400 210 L500 150 L600 170 L700 120 L800 140 L900 80 L1000 100 L1100 50 L1200 70",
                "M0 240 L100 230 L200 220 L300 190 L400 200 L500 160 L600 155 L700 130 L800 125 L900 90 L1000 85 L1100 60 L1200 55",
                "M0 250 L100 220 L200 240 L300 180 L400 210 L500 150 L600 170 L700 120 L800 140 L900 80 L1000 100 L1100 50 L1200 70"
              ]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="lineGradLight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </motion.svg>

        {/* Layer 4: Floating Particles - Lowered and blue-tinted */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            initial={{
              x: Math.random() * 1200,
              y: Math.random() * 800,
              opacity: Math.random() * 0.4
            }}
            animate={{
              y: [null, Math.random() * 800 - 400],
              x: [null, Math.random() * 1200 - 600],
              opacity: [0.1, 0.4, 0.1]
            }}
            transition={{
              duration: 15 + Math.random() * 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Ticker - Light theme */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-md text-emerald-600 text-[10px] font-black py-2 overflow-hidden border-b border-gray-200 uppercase tracking-widest">
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
        <div className="bg-[var(--bg-secondary)] rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.4)] border border-[var(--border-color)] overflow-hidden">

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

            {/* Step title */}
            <AnimatePresence mode="wait">
              {step === 'details' ? (
                <motion.div key="title-details" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    {isLogin ? 'Sign in to your account' : 'Create your account'}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {isLogin ? 'Enter your credentials to continue trading' : 'Fill in your details to get started'}
                  </p>
                </motion.div>
              ) : (
                <motion.div key="title-otp" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      <Shield size={16} className="text-emerald-500" />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Verify OTP</h2>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    We sent a 6-digit code to <strong className="text-[var(--text-primary)]">+91 {phone}</strong>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
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
              {/* ── STEP 1: Details Form ── */}
              {step === 'details' && (
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

                  {/* Mobile (register only) */}
                  {!isLogin && (
                    <div className="flex items-center border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] overflow-hidden focus-within:border-blue-500 transition-colors">
                      <span className="px-3.5 py-3 text-sm font-semibold text-[var(--text-secondary)] border-r border-[var(--border-color)] bg-[var(--bg-secondary)] whitespace-nowrap">🇮🇳 +91</span>
                      <input
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit mobile number"
                        inputMode="numeric"
                        maxLength={10}
                        className="flex-1 px-4 py-3 bg-transparent text-sm focus:outline-none text-[var(--text-primary)]"
                      />
                    </div>
                  )}

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
                      <><Phone size={16} /> Send OTP to Mobile</>
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
              )}

              {/* ── STEP 2: OTP Verification ── */}
              {step === 'otp' && (
                <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleOtpSubmit} className="space-y-5">

                  {/* Dev OTP hint */}
                  {devOtp && (
                    <div className="flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-2.5 text-xs">
                      <span>🔧 Dev OTP:</span>
                      <strong className="text-amber-400 text-base tracking-widest">{devOtp}</strong>
                    </div>
                  )}

                  {/* 6 OTP digit boxes */}
                  <div className="flex justify-center gap-2.5">
                    {otp.map((digit, idx) => (
                      <input key={idx} type="text" inputMode="numeric" maxLength={1} value={digit}
                        ref={el => { otpRefs.current[idx] = el; }}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKey(idx, e)}
                        className="w-11 h-13 text-center text-xl font-bold rounded-xl border-2 bg-[var(--bg-primary)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-[var(--text-primary)] border-[var(--border-color)]"
                        style={{ height: '52px' }}
                      />
                    ))}
                  </div>

                  <motion.button type="submit" disabled={loading || otp.join('').length < 6}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 text-sm">
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
                    ) : (
                      <><CheckCircle2 size={16} /> Verify & Create Account</>
                    )}
                  </motion.button>

                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <button type="button" onClick={() => { setStep('details'); setOtp(['', '', '', '', '', '']); setError(''); }}
                      className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors">
                      <ArrowLeft size={12} /> Edit Details
                    </button>
                    <button type="button" onClick={resendOtp} className="text-blue-500 hover:underline">
                      Resend OTP
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-[var(--bg-primary)] border-t border-[var(--border-color)]">
            <p className="text-[11px] text-[var(--text-muted)] text-center">
              🔒 Your data is secured with end-to-end encryption
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
