import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../App';
import { StockRecommendation, PortfolioItem } from '../types';
import { TrendingUp, TrendingDown, Brain, Wallet, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiUrl } from '../lib/api';
import { getAIRecommendations } from '../services/aiService';

export default function Dashboard() {
  const { token, user, logout, setActiveTab, setSelectedSymbol, refreshUser } = useAuth();
  const [recommendations, setRecommendations] = useState<StockRecommendation[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchPortfolio = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch(apiUrl('/api/portfolio'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) { logout(); return; }
      if (res.ok) {
        setPortfolio(await res.json());
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Portfolio fetch error', err);
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recs] = await Promise.all([
          getAIRecommendations(),
          fetchPortfolio(true),
        ]);
        setRecommendations(recs);
      } catch (error) {
        console.error('Dashboard fetch error', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Auto-refresh balance + portfolio every 8 seconds after trades
  useEffect(() => {
    const interval = setInterval(async () => {
      await Promise.all([refreshUser(), fetchPortfolio(true)]);
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchPortfolio]);

  const totalHoldingsValue = portfolio.reduce((acc, item) => acc + item.quantity * item.avgPrice, 0);
  const availableBalance = user?.balance ?? 0;
  const totalPortfolioValue = availableBalance + totalHoldingsValue;
  const usedMargin = totalHoldingsValue;

  // Chart data using actual balance as base
  const chartData = [
    { name: 'Mon', value: totalPortfolioValue * 0.93 },
    { name: 'Tue', value: totalPortfolioValue * 0.95 },
    { name: 'Wed', value: totalPortfolioValue * 0.94 },
    { name: 'Thu', value: totalPortfolioValue * 0.97 },
    { name: 'Fri', value: totalPortfolioValue * 0.99 },
    { name: 'Sat', value: totalPortfolioValue * 0.98 },
    { name: 'Sun', value: totalPortfolioValue },
  ];

  const todayPnL = totalPortfolioValue * 0.0125;

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshUser(), fetchPortfolio(false)]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl text-white shadow-xl" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f766e 100%)' }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(16,185,129,0.3) 0%, transparent 50%)' }} />
        <div className="relative z-10 p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back, {user?.name?.split(' ')[0] || 'Trader'} 👋
          </h1>
          <p className="text-blue-100/80 text-sm mt-1">
            Your portfolio is live and refreshes automatically every 8 seconds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Equity & Portfolio */}
        <div className="lg:col-span-2 space-y-6">

          {/* Equity & Margin Panel */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-blue-500" />
                <h3 className="font-semibold text-[var(--text-primary)]">Equity & Margin</h3>
              </div>
              <span className="text-xs text-[var(--text-muted)]">Live</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[var(--border-color)]">
              {[
                {
                  label: 'Available Cash',
                  value: `₹${availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  icon: <ArrowUpRight size={14} className="text-emerald-500" />,
                  color: 'text-emerald-500',
                },
                {
                  label: 'Invested (Holdings)',
                  value: `₹${usedMargin.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  icon: <BarChart3 size={14} className="text-blue-500" />,
                  color: 'text-blue-500',
                },
                {
                  label: 'Total Portfolio',
                  value: `₹${totalPortfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  icon: <TrendingUp size={14} className="text-violet-500" />,
                  color: 'text-violet-500',
                },
                {
                  label: 'Holdings Count',
                  value: `${portfolio.length} stock${portfolio.length !== 1 ? 's' : ''}`,
                  icon: <BarChart3 size={14} className="text-orange-500" />,
                  color: 'text-orange-500',
                },
              ].map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="p-4 hover:bg-[var(--bg-primary)] transition-colors"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    {m.icon}
                    <span className="text-xs text-[var(--text-secondary)] font-medium">{m.label}</span>
                  </div>
                  <p className={`font-mono font-bold text-base ${m.color}`}>{m.value}</p>
                </motion.div>
              ))}
            </div>
          </div>



          {/* Portfolio Trend Chart */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden">
            {/* Chart header */}
            <div className="px-6 pt-5 pb-3 flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2 text-[var(--text-primary)]">
                  <TrendingUp size={15} className="text-blue-500" /> Portfolio Trend
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">7-day simulated growth based on your portfolio value</p>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold">+7.0% week</span>
              </div>
            </div>

            {/* Chart */}
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
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                    width={62}
                    tickFormatter={v => `₹${(v / 1000).toFixed(1)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                    }}
                    formatter={(v: number) => [`₹${v.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 'Portfolio Value']}
                    cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="url(#strokeGrad)"
                    strokeWidth={2.5}
                    fill="url(#portfolioGradBlue)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#6366f1', stroke: 'var(--bg-secondary)', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Description below chart */}
            <div className="px-6 py-4 border-t border-[var(--border-color)] mt-1">
              <div className="grid grid-cols-3 gap-4 mb-3">
                {[
                  { label: 'Starting Value', value: `₹${(totalPortfolioValue * 0.93).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-[var(--text-primary)]' },
                  { label: 'Current Value', value: `₹${totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-emerald-500' },
                  { label: 'Weekly Growth', value: '+7.0%', color: 'text-emerald-500' },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-xs text-[var(--text-muted)] mb-0.5">{s.label}</p>
                    <p className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {portfolio.length === 0
                  ? 'Your portfolio is empty. Buy stocks from Market Watch to start tracking your growth here.'
                  : totalPortfolioValue > 10000
                    ? `Great progress! Your portfolio has grown beyond your starting balance. You currently hold ${portfolio.length} stock${portfolio.length > 1 ? 's' : ''}. Keep investing consistently for compounding growth.`
                    : `You hold ${portfolio.length} stock${portfolio.length > 1 ? 's' : ''}. Your portfolio reflects your current balance and holdings. Add more stocks or use SIPs to grow your wealth steadily.`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
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

          {/* AI Recommendations */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={15} className="text-purple-500" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">AI Top Picks</h3>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-[var(--bg-primary)] animate-pulse rounded-xl" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {recommendations.slice(0, 5).map((rec, i) => (
                  <motion.button
                    key={rec.symbol}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.01, x: 2 }}
                    onClick={() => { setSelectedSymbol(rec.symbol); setActiveTab('market'); }}
                    className="w-full text-left rounded-xl border border-[var(--border-color)] p-3 hover:bg-[var(--bg-primary)] hover:border-[var(--text-secondary)] transition-all"
                  >
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
        </div>
      </div>
    </motion.div>
  );
}
