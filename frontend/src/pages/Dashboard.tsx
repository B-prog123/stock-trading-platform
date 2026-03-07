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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col gap-1 mb-6 border-b border-[var(--border-color)] pb-4">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">
          Hi, {user?.name?.split(' ')[0] || 'Trader'}
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">Dashboard overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card title="Available Margin" value={`$${(user?.balance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} icon={null} />
        <Card title="Account Value" value={`$${((user?.balance || 0) + totalValue).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} icon={null} />
        <Card title="Holdings Value" value={`$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} icon={null} />
        <Card title="P&L" value="+$240.50" valueColor="text-green-500" icon={null} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
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

        <div className="rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 text-[var(--text-primary)]">
            <div>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold mb-1">Total Account Value</p>
              <h2 className="text-3xl md:text-5xl font-mono font-bold tracking-tighter">
                ${metrics.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className={`flex items-center gap-2 font-mono font-bold text-lg md:text-xl ${metrics.todayReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              <div className={`p-1 border ${metrics.todayReturn >= 0 ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-rose-500/30 bg-rose-500/10'}`}>
                {metrics.todayReturn >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </div>
              <span>
                {metrics.todayReturn >= 0 ? '+' : '-'}${Math.abs(metrics.todayReturn).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                <span className="text-base opacity-70"> ({metrics.todayReturnPercentage >= 0 ? '+' : ''}{(metrics.todayReturnPercentage * 100).toFixed(2)}%)</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6 mb-4">
            <Brain size={16} className="text-blue-500" />
            <h3 className="text-sm font-semibold text-[var(--text-secondary)]">AI Recommendations</h3>
          </div>
          {loading ? (
            <p className="text-sm text-[var(--text-secondary)]">Loading insights...</p>
          ) : (
            <div className="space-y-2">
              {recommendations.map((rec) => (
                <button
                  key={rec.symbol}
                  onClick={() => {
                    setSelectedSymbol(rec.symbol);
                    setActiveTab('market');
                  }}
                  className="w-full text-left rounded border border-[var(--border-color)] p-3 hover:bg-[var(--bg-primary)] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{rec.symbol}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${rec.trend === 'bullish' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                      {rec.trend.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">{rec.reasoning}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Card({ title, value, icon, valueColor = 'text-[var(--text-primary)]' }: { title: string; value: string; icon: React.ReactNode; valueColor?: string }) {
  return (
    <div className="flex flex-col border-r last:border-0 border-[var(--border-color)] px-4">
      <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs mb-1 font-medium">
        {title}
        {icon}
      </div>
      <p className={`text-xl font-medium tracking-tight ${valueColor}`}>{value}</p>
    </div>
  );
}
