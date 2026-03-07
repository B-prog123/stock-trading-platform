import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { StockRecommendation, PortfolioItem } from '../types';
import { TrendingUp, TrendingDown, Brain, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiUrl } from '../lib/api';
import { getAIRecommendations } from '../services/aiService';

const chartData = [
  { name: 'Mon', value: 10000 },
  { name: 'Tue', value: 10200 },
  { name: 'Wed', value: 10100 },
  { name: 'Thu', value: 10500 },
  { name: 'Fri', value: 10800 },
  { name: 'Sat', value: 10700 },
  { name: 'Sun', value: 11200 },
];

export default function Dashboard() {
  const { token, user, logout, setActiveTab, setSelectedSymbol } = useAuth();
  const [recommendations, setRecommendations] = useState<StockRecommendation[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recs, portRes] = await Promise.all([
          getAIRecommendations(),
          fetch(apiUrl('/api/portfolio'), { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (portRes.status === 401 || portRes.status === 403) {
          logout();
          return;
        }

        setRecommendations(recs);
        if (portRes.ok) setPortfolio(await portRes.json());
      } catch (error) {
        console.error('Dashboard fetch error', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const totalValue = portfolio.reduce((acc, item) => acc + item.quantity * item.avgPrice, 0);

  // Re-creating the metrics object that was errantly removed/expected
  const metrics = {
    totalValue: (user?.balance || 0) + totalValue,
    todayReturn: 240.50, // Static mock for the dashboard visual
    todayReturnPercentage: 0.0125 // Static mock 1.25%
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-900 to-emerald-900 text-white p-6 md:p-8 shadow-lg">
        <div className="absolute inset-0 bg-[url('/hero_bg.png')] bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative z-10 flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back, {user?.name?.split(' ')[0] || 'Trader'}
          </h1>
          <p className="text-blue-100/80 text-sm max-w-lg">
            Track your portfolio performance, explore AI insights, and uncover new market opportunities with precision.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Equity & Holdings Columns */}
        <div className="lg:col-span-2 space-y-6">

          {/* Equity & Margin Panel */}
          <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden">
            <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] flex items-center justify-between">
              <h3 className="font-semibold text-[var(--text-primary)]">Equity & Margin</h3>
            </div>
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              <PanelMetric title="Available Margin" value={`$${(user?.balance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
              <PanelMetric title="Used Margin" value="$0.00" />
              <PanelMetric title="Opening Balance" value={`$${(user?.balance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
              <PanelMetric title="Holdings Value" value={`$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
            </div>
          </div>

          {/* Holdings & P&L Panel */}
          <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden relative">
            <div className="absolute inset-0 bg-pattern-dots opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
            <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] flex items-center justify-between relative z-10">
              <h3 className="font-semibold text-[var(--text-primary)]">Holdings & P&L</h3>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
              <div>
                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest font-bold mb-1">Total Portfolio Value</p>
                <h2 className="text-3xl lg:text-4xl font-mono font-bold tracking-tighter text-[var(--text-primary)] md:truncate">
                  ${metrics.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </h2>
              </div>
              <div className="flex flex-col sm:items-end justify-center">
                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest font-bold mb-1">Today's P&L</p>
                <div className={`flex items-center gap-2 font-mono font-bold text-lg md:text-xl ${metrics.todayReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {metrics.todayReturn >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  <span>
                    {metrics.todayReturn >= 0 ? '+' : '-'}${Math.abs(metrics.todayReturn).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <p className={`text-sm font-mono mt-1 ${metrics.todayReturnPercentage >= 0 ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
                  ({metrics.todayReturnPercentage >= 0 ? '+' : ''}{(metrics.todayReturnPercentage * 100).toFixed(2)}%)
                </p>
              </div>
            </div>
          </div>

          {/* Chart Panel */}
          <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-[var(--text-primary)]">Portfolio Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.05} vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} width={48} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '4px' }} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={0.1} fill="#3b82f6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          {/* Indices Panel */}
          <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-[var(--text-primary)]">Market Indices</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <div>
                  <p className="font-semibold text-sm">NIFTY 50</p>
                  <p className="text-xs text-[var(--text-secondary)]">NSE</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-sm text-green-500">22,326.90</p>
                  <p className="text-xs text-green-500">+38.45 (+0.17%)</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 rounded bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <div>
                  <p className="font-semibold text-sm">SENSEX</p>
                  <p className="text-xs text-[var(--text-secondary)]">BSE</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-sm text-red-500">73,665.27</p>
                  <p className="text-xs text-red-500">-36.42 (-0.05%)</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations Panel */}
          <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={16} className="text-purple-500" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Top Suggestions</h3>
            </div>
            {loading ? (
              <p className="text-sm text-[var(--text-secondary)]">Analyzing data...</p>
            ) : (
              <div className="space-y-2">
                {recommendations.map((rec, i) => (
                  <motion.button
                    key={rec.symbol}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.01, x: 2 }}
                    onClick={() => {
                      setSelectedSymbol(rec.symbol);
                      setActiveTab('market');
                    }}
                    className="w-full text-left rounded border border-[var(--border-color)] p-3 hover:bg-[var(--bg-primary)] hover:border-[var(--text-secondary)] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{rec.symbol}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${rec.trend === 'bullish' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                        {rec.trend.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">{rec.reasoning}</p>
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

function PanelMetric({ title, value, valueColor = 'text-[var(--text-primary)]' }: { title: string; value: string; valueColor?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-[var(--text-secondary)] mb-1">{title}</span>
      <span className={`font-mono font-medium text-base ${valueColor}`}>{value}</span>
    </div>
  );
}
