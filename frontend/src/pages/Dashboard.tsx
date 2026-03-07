import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../App';
import { StockRecommendation, PortfolioItem } from '../types';
import {
  TrendingUp, Brain, Wallet, BarChart3, ArrowUpRight, ArrowDownRight,
  Zap, ShieldCheck, BookOpen, MessageCircle, Star, Play,
  PieChart, Activity, Award, Globe
} from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiUrl } from '../lib/api';
import { getAIRecommendations } from '../services/aiService';

export default function Dashboard() {
  const { token, user, logout, setActiveTab, setSelectedSymbol, refreshUser } = useAuth();
  const [recommendations, setRecommendations] = useState<StockRecommendation[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchPortfolio = useCallback(async (silent = false) => {
    if (!token) return;
    try {
      const res = await fetch(apiUrl('/api/portfolio'), { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401 || res.status === 403) { logout(); return; }
      if (res.ok) { setPortfolio(await res.json()); setLastUpdated(new Date()); }
    } catch (err) { console.error('Portfolio fetch error', err); }
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recs] = await Promise.all([getAIRecommendations(), fetchPortfolio(true)]);
        setRecommendations(recs);
      } catch (error) { console.error('Dashboard fetch error', error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    const interval = setInterval(() => { refreshUser(); fetchPortfolio(true); }, 8000);
    return () => clearInterval(interval);
  }, [fetchPortfolio]);

  const totalHoldingsValue = portfolio.reduce((acc, item) => acc + item.quantity * item.avgPrice, 0);
  const availableBalance = user?.balance ?? 0;
  const totalPortfolioValue = availableBalance + totalHoldingsValue;

  const chartData = [
    { name: 'Mon', value: totalPortfolioValue * 0.93 },
    { name: 'Tue', value: totalPortfolioValue * 0.95 },
    { name: 'Wed', value: totalPortfolioValue * 0.94 },
    { name: 'Thu', value: totalPortfolioValue * 0.97 },
    { name: 'Fri', value: totalPortfolioValue * 0.99 },
    { name: 'Sat', value: totalPortfolioValue * 0.98 },
    { name: 'Sun', value: totalPortfolioValue },
  ];

  const quickActions = [
    { label: 'Buy / Sell', desc: 'Trade stocks now', icon: <TrendingUp size={20} />, color: 'from-blue-600 to-indigo-600', tab: 'market' },
    { label: 'My Portfolio', desc: 'View holdings', icon: <PieChart size={20} />, color: 'from-emerald-600 to-teal-600', tab: 'portfolio' },
    { label: 'Start SIP', desc: 'Auto-invest', icon: <Activity size={20} />, color: 'from-violet-600 to-purple-600', tab: 'sip' },
    { label: 'Add Funds', desc: 'Deposit money', icon: <Wallet size={20} />, color: 'from-orange-500 to-pink-500', tab: 'funds' },
    { label: 'Academy', desc: 'Learn trading', icon: <BookOpen size={20} />, color: 'from-cyan-600 to-blue-600', tab: 'guide' },
    { label: 'Support', desc: 'Get help', icon: <MessageCircle size={20} />, color: 'from-rose-500 to-red-600', tab: 'support' },
  ];

  const marketMovers = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: '₹2,834', change: '+1.2%', up: true },
    { symbol: 'TCS', name: 'Tata Consultancy', price: '₹3,920', change: '+0.8%', up: true },
    { symbol: 'INFY', name: 'Infosys Ltd', price: '₹1,756', change: '-0.4%', up: false },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', price: '₹1,618', change: '+0.6%', up: true },
    { symbol: 'WIPRO', name: 'Wipro Ltd', price: '₹452', change: '-0.9%', up: false },
  ];

  const features = [
    { icon: <Zap size={22} />, title: 'Real-time Prices', desc: 'Live market data updated every few seconds across all instruments.' },
    { icon: <ShieldCheck size={22} />, title: 'Secure & Reliable', desc: 'Bank-grade JWT authentication and encrypted data storage.' },
    { icon: <Brain size={22} />, title: 'AI-Powered', desc: 'Gemini AI gives you smart stock picks and answers any trading question.' },
    { icon: <Activity size={22} />, title: 'Smart SIPs', desc: 'Automate your investments weekly or monthly. Rupee cost averaging built-in.' },
    { icon: <Globe size={22} />, title: 'Indian Markets', desc: 'Full coverage of NSE/BSE including NIFTY 50, SENSEX, and BANK NIFTY.' },
    { icon: <Award size={22} />, title: 'Portfolio Analytics', desc: 'Track P&L, holdings value, and investment history in one place.' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

      {/* ── Hero: Welcome + Phone Mockup ── */}
      <div className="relative overflow-hidden rounded-3xl text-white shadow-2xl min-h-[260px]"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f766e 100%)' }}>
        {/* Animated orbs */}
        <div className="absolute w-72 h-72 rounded-full opacity-20 -top-16 -left-16"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
        <div className="absolute w-56 h-56 rounded-full opacity-20 -bottom-10 right-40"
          style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)' }} />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-0 h-full">
          {/* Left: Text */}
          <div className="p-7 md:p-10 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs font-medium mb-4 w-fit border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Markets are live
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
              Welcome back,<br />
              <span className="bg-gradient-to-r from-blue-300 to-emerald-300 bg-clip-text text-transparent">
                {user?.name?.split(' ')[0] || 'Trader'} 👋
              </span>
            </h1>
            <p className="text-blue-100/75 text-sm leading-relaxed mb-5 max-w-xs">
              Your personal trading dashboard. Track markets, manage your portfolio and invest smarter — all in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab('market')}
                className="px-5 py-2.5 bg-white text-slate-900 font-semibold text-sm rounded-xl flex items-center gap-2 shadow-lg">
                <Play size={14} fill="currentColor" /> Start Trading
              </motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab('portfolio')}
                className="px-5 py-2.5 bg-white/15 hover:bg-white/25 font-semibold text-sm rounded-xl border border-white/25 transition-all">
                View Portfolio
              </motion.button>
            </div>
          </div>

          {/* Right: Phone Mockup */}
          <div className="hidden md:flex items-end justify-center relative overflow-hidden">
            <motion.img
              src="/phone-mockup.png"
              alt="Stockify mobile app"
              className="h-[260px] object-contain drop-shadow-2xl"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.2 }}
              style={{ filter: 'drop-shadow(0 24px 48px rgba(99,102,241,0.35))' }}
            />
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickActions.map((a, i) => (
            <motion.button
              key={a.tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab(a.tab)}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--text-secondary)] transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center text-white shadow-lg`}>
                {a.icon}
              </div>
              <p className="text-xs font-semibold text-[var(--text-primary)] text-center leading-tight">{a.label}</p>
              <p className="text-[10px] text-[var(--text-muted)] text-center hidden sm:block">{a.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Equity & Margin */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-blue-500" />
                <h3 className="font-semibold text-[var(--text-primary)]">Equity & Margin</h3>
              </div>
              <span className="text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full px-2 py-0.5 font-medium">Live</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[var(--border-color)]">
              {[
                { label: 'Available Cash', value: `₹${availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <ArrowUpRight size={14} />, color: 'text-emerald-500' },
                { label: 'Invested', value: `₹${totalHoldingsValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <BarChart3 size={14} />, color: 'text-blue-500' },
                { label: 'Total Portfolio', value: `₹${totalPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: <TrendingUp size={14} />, color: 'text-violet-500' },
                { label: 'Holdings', value: `${portfolio.length} stock${portfolio.length !== 1 ? 's' : ''}`, icon: <BarChart3 size={14} />, color: 'text-orange-500' },
              ].map((m, i) => (
                <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }} className="p-4 hover:bg-[var(--bg-primary)] transition-colors">
                  <div className={`flex items-center gap-1.5 mb-2 ${m.color}`}>{m.icon}
                    <span className="text-xs text-[var(--text-secondary)] font-medium">{m.label}</span>
                  </div>
                  <p className={`font-mono font-bold text-base ${m.color}`}>{m.value}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Portfolio Trend Chart */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden">
            <div className="px-6 pt-5 pb-3 flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2 text-[var(--text-primary)]">
                  <TrendingUp size={15} className="text-blue-500" /> Portfolio Trend
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">7-day performance based on your portfolio</p>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold">+7.0% week</span>
              </div>
            </div>
            <div className="h-52 px-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="portfolioGradBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                      <stop offset="60%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="currentColor" opacity={0.04} vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontWeight: 500 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} width={62}
                    tickFormatter={v => `₹${(v / 1000).toFixed(1)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '12px', fontSize: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                    formatter={(v: number) => [`₹${v.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 'Portfolio Value']}
                    cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="url(#strokeGrad)" strokeWidth={2.5}
                    fill="url(#portfolioGradBlue)" dot={false}
                    activeDot={{ r: 5, fill: '#6366f1', stroke: 'var(--bg-secondary)', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="px-6 py-4 border-t border-[var(--border-color)]">
              <div className="grid grid-cols-3 gap-4 mb-3">
                {[
                  { label: 'Starting', value: `₹${(totalPortfolioValue * 0.93).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-[var(--text-primary)]' },
                  { label: 'Current', value: `₹${totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-emerald-500' },
                  { label: 'Growth', value: '+7.0%', color: 'text-emerald-500' },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-xs text-[var(--text-muted)] mb-0.5">{s.label}</p>
                    <p className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {portfolio.length === 0
                  ? '🚀 Your portfolio is empty. Buy stocks from Market Watch to start tracking your growth here.'
                  : totalPortfolioValue > 10000
                    ? `📈 Great progress! Your portfolio grew beyond your starting balance. You hold ${portfolio.length} stock${portfolio.length > 1 ? 's' : ''}. Keep investing for compounding returns.`
                    : `💡 You hold ${portfolio.length} stock${portfolio.length > 1 ? 's' : ''}. Add more or start a SIP to build steady long-term wealth.`}
              </p>
            </div>
          </div>

          {/* Top Market Movers */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-[var(--text-primary)]">
                <Activity size={15} className="text-orange-500" /> Top Market Movers
              </h3>
              <button onClick={() => setActiveTab('market')} className="text-xs text-blue-500 hover:underline">View all →</button>
            </div>
            <div className="divide-y divide-[var(--border-color)]">
              {marketMovers.map((s, i) => (
                <motion.button key={s.symbol} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                  whileHover={{ backgroundColor: 'var(--bg-primary)' }}
                  onClick={() => { setSelectedSymbol(s.symbol); setActiveTab('market'); }}
                  className="w-full flex items-center justify-between px-5 py-3 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white ${s.up ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                      {s.symbol.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{s.symbol}</p>
                      <p className="text-xs text-[var(--text-muted)]">{s.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-[var(--text-primary)]">{s.price}</p>
                    <p className={`text-xs font-semibold ${s.up ? 'text-emerald-500' : 'text-rose-500'}`}>{s.change}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right side ── */}
        <div className="space-y-6">
          {/* Market Indices */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-[var(--text-primary)]">
              <BarChart3 size={14} className="text-blue-500" /> Market Indices
            </h3>
            <div className="space-y-3">
              {[
                { name: 'NIFTY 50', exchange: 'NSE', value: '22,326.90', change: '+38.45', pct: '+0.17%', up: true },
                { name: 'SENSEX', exchange: 'BSE', value: '73,665.27', change: '-36.42', pct: '-0.05%', up: false },
                { name: 'BANK NIFTY', exchange: 'NSE', value: '48,234.55', change: '+120.30', pct: '+0.25%', up: true },
              ].map(idx => (
                <div key={idx.name} className="flex justify-between items-center p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                  <div>
                    <p className="font-semibold text-sm text-[var(--text-primary)]">{idx.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{idx.exchange}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono font-bold text-sm ${idx.up ? 'text-emerald-500' : 'text-red-500'}`}>{idx.value}</p>
                    <p className={`text-xs ${idx.up ? 'text-emerald-500' : 'text-red-500'}`}>{idx.change} ({idx.pct})</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Picks */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={15} className="text-purple-500" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">AI Top Picks</h3>
            </div>
            {loading ? (
              <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-[var(--bg-primary)] animate-pulse rounded-xl" />)}</div>
            ) : (
              <div className="space-y-2">
                {recommendations.slice(0, 5).map((rec, i) => (
                  <motion.button key={rec.symbol} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.01, x: 2 }}
                    onClick={() => { setSelectedSymbol(rec.symbol); setActiveTab('market'); }}
                    className="w-full text-left rounded-xl border border-[var(--border-color)] p-3 hover:bg-[var(--bg-primary)] hover:border-[var(--text-secondary)] transition-all">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-[var(--text-primary)]">{rec.symbol}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${rec.trend === 'bullish' ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' : 'text-rose-500 border-rose-500/30 bg-rose-500/10'}`}>
                        {rec.trend === 'bullish' ? '▲ BUY' : '▼ SELL'}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed line-clamp-2">{rec.reasoning}</p>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* App Rating Card */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-gradient-to-br from-violet-600/10 to-blue-600/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="#f59e0b" className="text-amber-400" />)}
            </div>
            <h3 className="font-bold text-sm text-[var(--text-primary)] mb-1">Loving Stockify?</h3>
            <p className="text-xs text-[var(--text-secondary)] mb-3">Share your feedback and help us improve your trading experience.</p>
            <button onClick={() => setActiveTab('support')}
              className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors">
              Give Feedback
            </button>
          </div>
        </div>
      </div>

      {/* ── Platform Features ── */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">Why Stockify?</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-5">Everything you need to invest smarter — built for Indian markets.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-blue-500/30 transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3 group-hover:bg-blue-500/20 transition-colors">
                {f.icon}
              </div>
              <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-1">{f.title}</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
