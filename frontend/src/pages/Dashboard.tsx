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

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Welcome back, {user?.name?.split(' ')[0] || 'Trader'}! 👋
        </h1>
        <p className="text-[var(--text-secondary)] text-sm md:text-base">Here's your portfolio overview for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Balance" value={`$${(user?.balance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} icon={<Activity size={18} />} />
        <Card title="Portfolio Value" value={`$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} icon={<TrendingUp size={18} />} />
        <Card title="Holdings" value={String(portfolio.length)} icon={<Brain size={18} />} />
      </div>

      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
        <h3 className="text-lg font-semibold mb-3">Weekly Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b98122" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
        <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
        {loading ? (
          <p className="text-sm text-[var(--text-secondary)]">Loading recommendations...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.map((rec) => (
              <button
                key={rec.symbol}
                onClick={() => {
                  setSelectedSymbol(rec.symbol);
                  setActiveTab('market');
                }}
                className="text-left rounded-xl border border-[var(--border-color)] p-4 hover:border-emerald-500/40"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{rec.symbol} - {rec.name}</p>
                  {rec.trend === 'bullish' ? <TrendingUp size={16} className="text-emerald-400" /> : <TrendingDown size={16} className="text-red-400" />}
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-1">{rec.reasoning}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Card({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
      <div className="flex items-center justify-between mb-2 text-[var(--text-secondary)] text-xs uppercase tracking-widest">
        <span>{title}</span>
        {icon}
      </div>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
