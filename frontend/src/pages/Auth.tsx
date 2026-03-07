import React, { useState, useRef } from 'react';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Phone, ArrowRight, ArrowLeft, Shield, CheckCircle2, TrendingUp } from 'lucide-react';
import { apiUrl } from '../lib/api';

const tickerTape = ['RELIANCE +1.25%', 'TCS -0.41%', 'HDFCBANK +2.82%', 'INFY +0.85%', 'ICICIBANK -0.12%', 'SBIN +1.15%'];

type AuthStep = 'form' | 'phone' | 'otp';

export default function Auth() {
  const { login } = useAuth();

  // Mode
  const [isLogin, setIsLogin] = useState(true);

  // Step
  const [step, setStep] = useState<AuthStep>('form');

  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [devOtp, setDevOtp] = useState(''); // shown in dev mode
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<any>(null);

  // ─── Step 1: Email + Password + Name ───────────────────────────────────────
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      // Login flow: authenticate then require OTP
      try {
        const res = await fetch(apiUrl('/api/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data?.error || 'Login failed'); setLoading(false); return; }
        // Store pending credentials, ask for phone OTP
        setPendingToken(data.token);
        setPendingUser(data.user);
        // Send OTP
        await sendOtp(data.user.phone || '');
      } catch { setError('Network error. Please try again.'); }
    } else {
      // Registration: move to phone step
      setStep('phone');
    }
    setLoading(false);
  };

  // ─── Step 2: Phone entry ────────────────────────────────────────────────────
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) { setError('Enter a valid 10-digit Indian mobile number'); return; }
    setError('');
    setLoading(true);
    await sendOtp(phone);
    setLoading(false);
  };

  const sendOtp = async (ph: string) => {
    try {
      const res = await fetch(apiUrl('/api/auth/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: ph || phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setDevOtp(data.otp || ''); // backend returns otp in dev mode
        setStep('otp');
      } else {
        setError(data?.error || 'Failed to send OTP');
      }
    } catch { setError('Network error sending OTP'); }
  };

  // ─── Step 3: OTP verification ───────────────────────────────────────────────
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Enter the complete 6-digit OTP'); return; }
    setError('');
    setLoading(true);

    try {
      const res = await fetch(apiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.error || 'Invalid OTP'); setLoading(false); return; }

      if (isLogin) {
        // OTP verified for login
        if (pendingToken && pendingUser) login(pendingToken, pendingUser);
      } else {
        // Complete registration now that OTP verified
        const regRes = await fetch(apiUrl('/api/auth/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, phone }),
        });
        const regData = await regRes.json();
        if (regRes.ok) {
          setInfo('Account created! Please login.');
          resetToLogin();
        } else {
          setError(regData?.error || 'Registration failed');
        }
      }
    } catch { setError('Network error verifying OTP'); }
    setLoading(false);
  };

  const resetToLogin = () => {
    setStep('form'); setIsLogin(true); setOtp(['', '', '', '', '', '']);
    setPhone(''); setDevOtp(''); setPendingToken(null); setPendingUser(null);
  };

  // OTP box handlers
  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };
  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  };

  const stepLabel = step === 'form' ? (isLogin ? 'Sign In' : 'Create Account')
    : step === 'phone' ? 'Verify Mobile'
      : 'Enter OTP';

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background animations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
        <motion.svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 1200 800"
          initial={{ opacity: 0.15 }} animate={{ opacity: 0.35 }} transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}>
          <motion.path d="M0 580 C120 500, 220 640, 340 540 C460 450, 560 590, 680 500 C800 410, 920 560, 1040 470 C1100 430, 1160 420, 1200 390"
            fill="none" stroke="rgba(16,185,129,0.45)" strokeWidth="3" strokeLinecap="round"
            initial={{ pathLength: 0.4, pathOffset: 0 }} animate={{ pathLength: [0.4, 1], pathOffset: [0, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} />
        </motion.svg>
      </div>

      {/* Ticker */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-emerald-950/60 backdrop-blur text-emerald-400 text-xs py-1 overflow-hidden border-b border-emerald-900/40">
        <motion.div className="flex gap-10 whitespace-nowrap w-max"
          animate={{ x: [0, -800] }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}>
          {[...tickerTape, ...tickerTape].map((t, i) => <span key={i} className="mx-6">📈 {t}</span>)}
        </motion.div>
      </div>

      {/* Card */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="relative w-full max-w-md z-10 mt-7">
        <div className="bg-[var(--bg-secondary)] rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.35)] border border-[var(--border-color)] overflow-hidden">

          {/* Card header */}
          <div className="px-8 pt-8 pb-5 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg">
                <TrendingUp size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">STOCKIFY</h1>
                <p className="text-xs text-[var(--text-muted)]">Smart Trading Platform</p>
              </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-1">
              {(['form', 'phone', 'otp'] as AuthStep[]).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === s ? 'bg-blue-600 text-white' : (['phone', 'otp'].indexOf(s) <= ['form', 'phone', 'otp'].indexOf(step)) ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-color)]'}`}>
                    {['phone', 'otp'].indexOf(s) < ['form', 'phone', 'otp'].indexOf(step) ? '✓' : i + 1}
                  </div>
                  {i < 2 && <div className={`h-0.5 w-8 rounded ${['phone', 'otp'].indexOf(s) < ['form', 'phone', 'otp'].indexOf(step) ? 'bg-emerald-600' : 'bg-[var(--border-color)]'}`} />}
                </div>
              ))}
              <span className="ml-2 text-sm font-semibold text-[var(--text-primary)]">{stepLabel}</span>
            </div>
          </div>

          <div className="px-8 py-6">
            {/* Alerts */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex gap-2 items-start">
                <span>⚠️</span> {error}
              </motion.div>
            )}
            {info && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-4 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex gap-2 items-start">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> {info}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {/* ── STEP 1: Login / Register form ── */}
              {step === 'form' && (
                <motion.form key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleFormSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input required value={name} onChange={e => setName(e.target.value)} placeholder="Full Name"
                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                    </div>
                  )}
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address"
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 text-sm">
                    {loading ? 'Please wait...' : isLogin ? 'Continue to OTP Verify' : 'Continue to Phone Verify'}
                    {!loading && <ArrowRight size={16} />}
                  </motion.button>
                  <p className="text-center text-xs text-[var(--text-muted)] pt-1">
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); setInfo(''); setStep('form'); }}
                      className="text-blue-500 font-semibold hover:underline">
                      {isLogin ? 'Create Account' : 'Sign In'}
                    </button>
                  </p>
                </motion.form>
              )}

              {/* ── STEP 2: Phone number ── */}
              {step === 'phone' && (
                <motion.form key="phone" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  onSubmit={handlePhoneSubmit} className="space-y-5">
                  <div className="text-center mb-2">
                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Phone size={26} className="text-blue-500" />
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">We'll send a 6-digit OTP to verify your mobile number.</p>
                  </div>
                  <div className="flex items-center border border-[var(--border-color)] rounded-xl bg-[var(--bg-primary)] overflow-hidden focus-within:border-blue-500 transition-colors">
                    <span className="px-4 py-3 text-sm font-semibold text-[var(--text-secondary)] border-r border-[var(--border-color)] bg-[var(--bg-secondary)]">🇮🇳 +91</span>
                    <input required value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number" maxLength={10}
                      className="flex-1 px-4 py-3 bg-transparent text-sm focus:outline-none text-[var(--text-primary)]" />
                  </div>
                  <motion.button type="submit" disabled={loading || phone.length !== 10} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 text-sm">
                    {loading ? 'Sending OTP...' : 'Send OTP'} {!loading && <ArrowRight size={16} />}
                  </motion.button>
                  <button type="button" onClick={() => { setStep('form'); setError(''); }}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    <ArrowLeft size={14} /> Back
                  </button>
                </motion.form>
              )}

              {/* ── STEP 3: OTP ── */}
              {step === 'otp' && (
                <motion.form key="otp" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleOtpSubmit} className="space-y-5">
                  <div className="text-center mb-2">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Shield size={26} className="text-emerald-500" />
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">Enter the 6-digit OTP sent to <strong>+91 {phone}</strong></p>
                    {devOtp && (
                      <div className="mt-2 inline-block bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1 text-xs text-amber-400">
                        🔧 Dev mode OTP: <strong>{devOtp}</strong>
                      </div>
                    )}
                  </div>

                  {/* OTP boxes */}
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, idx) => (
                      <input key={idx} type="text" inputMode="numeric" maxLength={1} value={digit}
                        ref={el => { otpRefs.current[idx] = el; }}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(idx, e)}
                        className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-[var(--text-primary)]" />
                    ))}
                  </div>

                  <motion.button type="submit" disabled={loading || otp.join('').length < 6}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 text-sm">
                    {loading ? 'Verifying...' : <>Verify & {isLogin ? 'Login' : 'Create Account'} <CheckCircle2 size={16} /></>}
                  </motion.button>

                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <button type="button" onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setError(''); }}
                      className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors">
                      <ArrowLeft size={12} /> Change Number
                    </button>
                    <button type="button" onClick={() => sendOtp(phone)}
                      className="text-blue-500 hover:underline">Resend OTP</button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-[var(--bg-primary)] border-t border-[var(--border-color)] text-center">
            <p className="text-[11px] text-[var(--text-muted)]">
              🔒 Secured with end-to-end encryption. By continuing you agree to our Terms & Privacy Policy.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
