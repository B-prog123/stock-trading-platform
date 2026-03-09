import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../App';
import { StockRecommendation, PortfolioItem } from '../types';
import {
  TrendingUp, Brain, Wallet, BarChart3, ArrowUpRight, ArrowDownRight,
  Zap, ShieldCheck, BookOpen, MessageCircle, Star, Play,
  PieChart, Activity, Award, Globe, Trophy
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
    { label: 'Trading Game', desc: 'Test your skills', icon: <Trophy size={20} />, color: 'from-amber-500 to-yellow-600', tab: 'game' },
    { label: 'Support', desc: 'Get help', icon: <MessageCircle size={20} />, color: 'from-rose-500 to-red-600', tab: 'support' },
  ];

  const [marketMovers, setMarketMovers] = useState([
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2834.00, change: 1.2, up: true },
    { symbol: 'TCS', name: 'Tata Consultancy', price: 3920.00, change: 0.8, up: true },
    { symbol: 'INFY', name: 'Infosys Ltd', price: 1756.00, change: -0.4, up: false },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1618.00, change: 0.6, up: true },
    { symbol: 'WIPRO', name: 'Wipro Ltd', price: 452.00, change: -0.9, up: false },
  ]);

  const features = [
    { icon: <Zap size={22} />, title: 'Real-time Prices', desc: 'Live market data updated every few seconds across all instruments.' },
    { icon: <ShieldCheck size={22} />, title: 'Secure & Reliable', desc: 'Bank-grade JWT authentication and encrypted data storage.' },
    { icon: <Brain size={22} />, title: 'AI-Powered', desc: 'Gemini AI gives you smart stock picks and answers any trading question.' },
    { icon: <Activity size={22} />, title: 'Smart SIPs', desc: 'Automate your investments weekly or monthly. Rupee cost averaging built-in.' },
    { icon: <Globe size={22} />, title: 'Indian Markets', desc: 'Full coverage of NSE/BSE including NIFTY 50, SENSEX, and BANK NIFTY.' },
    { icon: <Award size={22} />, title: 'Portfolio Analytics', desc: 'Track P&L, holdings value, and investment history in one place.' },
  ];

  // ── Price Fluctuations ──
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketMovers(current =>
        current.map(m => {
          const move = (Math.random() - 0.5) * 0.3;
          const newPrice = m.price * (1 + move / 100);
          const newChange = m.change + move;
          return {
            ...m,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat(newChange.toFixed(2)),
            up: newChange >= 0
          };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-10">

      {/* ── Hero: Welcome + Phone Mockup ── */}
      <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] text-white shadow-2xl min-h-[220px] sm:min-h-[320px]"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f766e 100%)' }}>
        {/* Animated orbs */}
        <div className="absolute w-72 h-72 rounded-full opacity-25 -top-16 -left-16"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
        <div className="absolute w-56 h-56 rounded-full opacity-20 -bottom-10 right-40"
          style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)' }} />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
          {/* Left: Text */}
          <div className="p-8 sm:p-12 flex flex-col justify-center text-center md:text-left items-center md:items-start">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-xs font-bold mb-6 w-fit border border-white/20 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              Markets are live
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.1] mb-4">
              Welcome back,<br />
              <span className="bg-gradient-to-r from-blue-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                {user?.name?.split(' ')[0] || 'Trader'} 👋
              </span>
            </h1>
            <p className="text-blue-100/70 text-sm sm:text-base leading-relaxed mb-8 max-w-sm">
              Manage your wealth, track real-time markers, and invest with AI-powered confidence.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('market')}
                className="px-7 py-3 bg-white text-slate-900 font-black text-sm rounded-2xl flex items-center gap-2 shadow-xl hover:shadow-white/10 transition-all">
                <Play size={16} fill="currentColor" /> Start Trading
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('portfolio')}
                className="px-7 py-3 bg-white/10 hover:bg-white/20 font-bold text-sm rounded-2xl border border-white/20 backdrop-blur-md transition-all">
                My Holdings
              </motion.button>
            </div>
          </div>

          {/* Right: Phone Mockup */}
          <div className="hidden md:flex items-end justify-center relative overflow-hidden pr-12">
            <motion.img
              src="/phone-mockup.png"
              alt="Stockify mobile app"
              className="h-[320px] lg:h-[380px] object-contain drop-shadow-2xl"
              initial={{ y: 60, opacity: 0 }}
              animate={{
                y: [0, -20, 0],
                opacity: 1
              }}
              transition={{
                y: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                opacity: { duration: 0.5 }
              }}
              style={{ filter: 'drop-shadow(0 32px 64px rgba(99,102,241,0.45))' }}
            />
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="responsive-container mt-2 mb-2">
        <h2 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 ml-1">Quick Terminals</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
          {quickActions.map((a, i) => (
            <motion.button
              key={a.tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(a.tab)}
              className="flex flex-col items-center gap-2 p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--text-secondary)] shadow-sm hover:shadow-xl transition-all group"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center text-white shadow-lg transform group-hover:rotate-6 transition-transform`}>
                {React.cloneElement(a.icon as React.ReactElement, { size: 18 })}
              </div>
              <div className="text-center">
                <p className="text-[11px] sm:text-sm font-black text-[var(--text-primary)] leading-tight">{a.label}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1 hidden lg:block font-medium">{a.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Main Grid: Performance & Market ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* Wallet Summary */}
          <div className="rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden shadow-lg">
            <div className="px-8 py-6 border-b border-[var(--border-color)] flex items-center justify-between bg-gradient-to-r from-[var(--bg-primary)]/50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Wallet size={20} className="text-blue-500" />
                </div>
                <h3 className="font-black text-lg text-[var(--text-primary)]">Wallet Summary</h3>
              </div>
              <span className="text-[10px] font-black bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg px-3 py-1 uppercase tracking-widest">Active</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-[var(--border-color)]">
              {[
                { label: 'Available Cash', value: `₹${availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: <ArrowUpRight size={16} />, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
                { label: 'Invested', value: `₹${totalHoldingsValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: <BarChart3 size={16} />, color: 'text-blue-500', bg: 'bg-blue-500/5' },
                { label: 'Total Value', value: `₹${totalPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: <TrendingUp size={16} />, color: 'text-violet-500', bg: 'bg-violet-500/5' },
                { label: 'Assets', value: `${portfolio.length} positions`, icon: <Activity size={16} />, color: 'text-orange-500', bg: 'bg-orange-500/5' },
              ].map((m, i) => (
                <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }} className="p-5 sm:p-8 hover:bg-[var(--bg-primary)] transition-colors group">
                  <div className={`flex items-center gap-2 mb-3 font-black text-[10px] uppercase tracking-widest ${m.color}`}>
                    <div className={`p-1.5 rounded-lg ${m.bg} group-hover:scale-110 transition-transform`}>{m.icon}</div>
                    {m.label}
                  </div>
                  <p className={`font-mono font-black text-xl lg:text-2xl ${m.color} tracking-tighter`}>{m.value}</p>
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

          {/* Top Movers */}
          <div className="rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden shadow-lg">
            <div className="px-8 py-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp size={20} className="text-emerald-500" />
                </div>
                <h3 className="font-black text-lg text-[var(--text-primary)]">Market Heartbeat</h3>
              </div>
              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest hidden sm:block">Top Movers Today</p>
            </div>
            <div className="divide-y divide-[var(--border-color)] bg-gradient-to-b from-transparent to-[var(--bg-primary)]/30">
              {marketMovers.map((stock, i) => (
                <motion.button
                  key={stock.symbol}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ backgroundColor: 'var(--bg-primary)', x: 6 }}
                  onClick={() => { setSelectedSymbol(stock.symbol); setActiveTab('market'); }}
                  className="w-full px-8 py-5 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all ${stock.up ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black' : 'bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-black'}`}>
                      {stock.symbol[0]}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-sm text-[var(--text-primary)] group-hover:text-blue-500 transition-colors uppercase tracking-tight">{stock.symbol}</p>
                      <p className="text-[10px] text-[var(--text-muted)] font-bold">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-black text-[var(--text-primary)] mb-0.5 tracking-tight">₹{stock.price.toLocaleString('en-IN')}</p>
                    <div className={`flex items-center justify-end gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg ${stock.up ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {stock.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                      {stock.up ? '+' : ''}{stock.change.toFixed(2)}%
                    </div>
                  </div>
                </motion.button>
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
