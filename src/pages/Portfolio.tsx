import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { PortfolioItem, PortfolioAnalysis } from '../types';
import { Briefcase, TrendingUp, TrendingDown, Brain, Sparkles, PieChart as PieChartIcon, Activity, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'motion/react';
import { apiUrl } from '../lib/api';

import { analyzePortfolioAI } from '../services/aiService';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

interface PerformanceItem {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

interface PerformanceTotals {
  investedValue: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

interface InvestmentBreakdown {
  manualInvested: number;
  sipInvested: number;
}

export default function Portfolio() {
  const { token, setActiveTab, setSelectedSymbol, addNotification, logout } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [performance, setPerformance] = useState<Record<string, PerformanceItem>>({});
  const [totals, setTotals] = useState<PerformanceTotals>({ investedValue: 0, currentValue: 0, profitLoss: 0, profitLossPercent: 0 });
  const [breakdown, setBreakdown] = useState<InvestmentBreakdown>({ manualInvested: 0, sipInvested: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleTradeClick = (symbol: string) => {
    setSelectedSymbol(symbol);
    setActiveTab('market');
  };

  useEffect(() => {
    fetchPortfolio();
  }, [token]);

  const fetchPortfolio = async () => {
    try {
      const [portfolioRes, performanceRes, breakdownRes] = await Promise.all([
        fetch(apiUrl('/api/portfolio'), { headers: { Authorization: `Bearer ${token}` } }),
        fetch(apiUrl('/api/portfolio/performance'), { headers: { Authorization: `Bearer ${token}` } }),
        fetch(apiUrl('/api/portfolio/breakdown'), { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (
        portfolioRes.status === 401 || portfolioRes.status === 403 ||
        performanceRes.status === 401 || performanceRes.status === 403 ||
        breakdownRes.status === 401 || breakdownRes.status === 403
      ) {
        logout();
        return;
      }

      if (portfolioRes.ok) {
        setPortfolio(await portfolioRes.json());
      } else {
        addNotification('Error', 'Failed to fetch portfolio', 'error');
      }

      if (performanceRes.ok) {
        const perfData = await performanceRes.json();
        const perfMap: Record<string, PerformanceItem> = {};
        (perfData.items || []).forEach((item: PerformanceItem) => {
          perfMap[item.symbol] = item;
        });
        setPerformance(perfMap);
        setTotals(perfData.totals || { investedValue: 0, currentValue: 0, profitLoss: 0, profitLossPercent: 0 });
      }

      if (breakdownRes.ok) {
        setBreakdown(await breakdownRes.json());
      }
    } catch (err) {
      console.error('Portfolio fetch error', err);
      addNotification('Error', 'Network error fetching portfolio', 'error');
    } finally {
      setLoading(false);
    }
  };

  const analyzePortfolio = async () => {
    setAnalyzing(true);
    try {
      const result = await analyzePortfolioAI(portfolio);
      if (result) {
        setAnalysis(result);
        addNotification('Analysis Complete', 'AI has finished analyzing your portfolio.', 'success');
      } else {
        addNotification('Analysis Failed', 'AI was unable to analyze your portfolio at this time.', 'error');
      }
    } catch (err) {
      console.error('AI Analysis error', err);
      addNotification('Error', 'An unexpected error occurred during analysis.', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const chartData = portfolio.map((item) => ({
    name: item.symbol,
    value: performance[item.symbol]?.currentValue ?? item.quantity * item.avgPrice,
  }));

  const totalValue = totals.currentValue;

  const getSector = (symbol: string) => {
    const sectors: Record<string, string> = {
      AAPL: 'Technology',
      TSLA: 'Consumer Cyclical',
      NVDA: 'Technology',
      MSFT: 'Technology',
      GOOGL: 'Communication Services',
      AMZN: 'Consumer Cyclical',
      META: 'Communication Services',
      NFLX: 'Communication Services',
    };
    return sectors[symbol] || 'Other';
  };

  const sectorData = portfolio.reduce((acc: Array<{ name: string; value: number }>, item) => {
    const sector = getSector(item.symbol);
    const value = performance[item.symbol]?.currentValue ?? item.quantity * item.avgPrice;
    const existing = acc.find((s) => s.name === sector);
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ name: sector, value });
    }
    return acc;
  }, []);

  const diversificationScore = Math.min(100, (portfolio.length * 15) + (sectorData.length * 10));

  const getDiversificationLevel = (score: number) => {
    if (score >= 80) return { label: 'Optimal', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (score >= 60) return { label: 'Good', color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
    if (score >= 40) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    return { label: 'Concentrated', color: 'text-red-400', bg: 'bg-red-500/10' };
  };

  const divLevel = getDiversificationLevel(diversificationScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-10 pb-10"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-bold mb-3 text-gradient">My Portfolio</h2>
          <p className="text-[var(--text-secondary)] max-w-md">Comprehensive overview of your assets, SIP contribution, and live profit/loss.</p>
        </div>
        <button
          onClick={analyzePortfolio}
          disabled={analyzing || portfolio.length === 0}
          className="neo-button flex items-center gap-3 px-8 py-4 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold hover:opacity-90 transition-all disabled:opacity-50 shadow-xl shadow-[var(--text-primary)]/5"
        >
          {analyzing ? <Sparkles className="animate-spin" size={20} /> : <Brain size={20} />}
          {analyzing ? 'Analyzing...' : 'AI Health Check'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <MetricCard title="Total Assets" value={portfolio.length.toString()} subtitle="Unique holdings" icon={<Briefcase className="text-emerald-400" size={20} />} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <MetricCard title="Diversification" value={`${diversificationScore}/100`} subtitle={diversificationScore > 70 ? 'Excellent spread' : 'Concentrated risk'} icon={<PieChartIcon className="text-cyan-400" size={20} />} progress={diversificationScore} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <MetricCard title="Current Value" value={`$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} subtitle="Live portfolio value" icon={<Wallet className="text-emerald-400" size={20} />} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <MetricCard title="Total P&L" value={`${totals.profitLoss >= 0 ? '+' : '-'}$${Math.abs(totals.profitLoss).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} subtitle={`${totals.profitLossPercent >= 0 ? '+' : ''}${totals.profitLossPercent.toFixed(2)}%`} icon={totals.profitLoss >= 0 ? <TrendingUp className="text-emerald-400" size={20} /> : <TrendingDown className="text-red-400" size={20} />} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <MetricCard title="SIP Invested" value={`$${(breakdown.sipInvested || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} subtitle={`Manual: $${(breakdown.manualInvested || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} icon={<Activity className="text-cyan-400" size={20} />} />
        </motion.div>
      </div>

      {analysis && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 border-emerald-500/20 bg-emerald-500/[0.02]">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 relative shrink-0">
              <div className="text-3xl font-bold text-emerald-400">{analysis.score}</div>
              <div className="absolute -bottom-3 px-2 py-0.5 bg-emerald-500 text-black text-[8px] uppercase font-black rounded-full">Score</div>
            </div>
            <div className="flex-1">
              <h4 className="text-2xl font-bold mb-3 flex items-center gap-3 text-[var(--text-primary)]">
                <Sparkles size={24} className="text-emerald-400" />
                AI Strategic Insights
              </h4>
              <p className="text-[var(--text-secondary)] mb-6 leading-relaxed text-lg">{analysis.analysis}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-4 text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border-color)] hover:border-[var(--text-secondary)]/20 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-2 glass-card overflow-hidden">
          <div className="px-8 py-6 border-b border-[var(--border-color)] flex justify-between items-center">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Holdings</h3>
            <span className="text-xs text-[var(--text-secondary)] font-mono uppercase tracking-widest">{portfolio.length} Assets</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="text-[var(--text-secondary)] text-[10px] uppercase tracking-[0.2em] font-bold">
                <tr>
                  <th className="px-8 py-4">Asset</th>
                  <th className="px-8 py-4">Quantity</th>
                  <th className="px-8 py-4">Avg. Price</th>
                  <th className="px-8 py-4">Current Price</th>
                  <th className="px-8 py-4">Current Value</th>
                  <th className="px-8 py-4">P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-8 py-8"><div className="h-4 bg-[var(--bg-secondary)] rounded w-full" /></td>
                    </tr>
                  ))
                ) : portfolio.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-24 text-center text-[var(--text-secondary)]">
                      <Briefcase size={64} className="mx-auto mb-6 opacity-5" />
                      <p className="text-lg font-medium">No assets found</p>
                      <p className="text-sm opacity-50">Start trading to build your portfolio!</p>
                    </td>
                  </tr>
                ) : (
                  portfolio.map((item) => {
                    const perf = performance[item.symbol];
                    const currentPrice = perf?.currentPrice ?? item.avgPrice;
                    const currentValue = perf?.currentValue ?? item.quantity * item.avgPrice;
                    const pnl = perf?.profitLoss ?? 0;
                    const pnlPct = perf?.profitLossPercent ?? 0;

                    return (
                      <tr key={item.symbol} onClick={() => handleTradeClick(item.symbol)} className="hover:bg-[var(--bg-secondary)] transition-colors group cursor-pointer">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center font-bold text-sm border border-[var(--border-color)] group-hover:border-emerald-500/30 transition-colors text-[var(--text-primary)]">
                              {item.symbol[0]}
                            </div>
                            <div>
                              <div className="font-bold text-lg text-[var(--text-primary)]">{item.symbol}</div>
                              <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">{getSector(item.symbol)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-mono text-[var(--text-secondary)]">{item.quantity.toFixed(4)}</td>
                        <td className="px-8 py-6 font-mono text-[var(--text-secondary)]">${item.avgPrice.toFixed(2)}</td>
                        <td className="px-8 py-6 font-mono text-[var(--text-secondary)]">${currentPrice.toFixed(2)}</td>
                        <td className="px-8 py-6 font-mono font-bold text-[var(--text-primary)]">${currentValue.toFixed(2)}</td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col items-end">
                            <span className={`font-mono font-bold flex items-center gap-1 ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {pnl >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                              {pnl >= 0 ? '+' : '-'}$${Math.abs(pnl).toFixed(2)}
                            </span>
                            <span className={`text-[10px] ${pnl >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                              {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="space-y-8">
          <div className="glass-card p-8 flex flex-col items-center">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 self-start text-[var(--text-primary)]">
              <PieChartIcon className="text-cyan-400" />
              Asset Allocation
            </h3>
            <div className="h-[280px] w-full min-w-0">
              {portfolio.length > 0 && isMounted ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={100}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value" stroke="none">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '16px', backdropFilter: 'blur(10px)' }} itemStyle={{ color: 'var(--text-primary)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[var(--text-secondary)] text-sm italic">No data to display</div>
              )}
            </div>

            <div className="w-full mt-8 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold">Risk Profile</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${divLevel.bg} ${divLevel.color}`}>{divLevel.label}</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Asset Count</span>
                  <span className="text-[var(--text-primary)] font-mono">{portfolio.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Sector Spread</span>
                  <span className="text-[var(--text-primary)] font-mono">{sectorData.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Concentration</span>
                  <span className="text-[var(--text-primary)] font-mono">
                    {portfolio.length > 0 && totalValue > 0 ? (Math.max(...chartData.map((d) => d.value)) / totalValue * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full mt-6 space-y-4">
              {chartData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between group cursor-pointer" onClick={() => handleTradeClick(item.name)}>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: COLORS[i % COLORS.length], color: COLORS[i % COLORS.length] }} />
                    <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-[var(--text-secondary)]">{totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : '0.0'}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-[var(--text-primary)]">
              <Activity className="text-cyan-400" />
              Sector Exposure
            </h3>
            <div className="space-y-5">
              {sectorData.map((sector) => (
                <div key={sector.name} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-secondary)]">{sector.name}</span>
                    <span className="font-mono font-bold text-[var(--text-primary)]">{totalValue > 0 ? ((sector.value / totalValue) * 100).toFixed(1) : '0.0'}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${totalValue > 0 ? (sector.value / totalValue) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function MetricCard({ title, value, subtitle, icon, progress }: any) {
  return (
    <motion.div whileHover={{ y: -5 }} className="glass-card p-6 relative overflow-hidden group h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] group-hover:bg-[var(--bg-primary)] transition-colors border border-[var(--border-color)]">
          {icon}
        </div>
        {progress !== undefined && (
          <div className="w-12 h-12 relative">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[var(--border-color)]" />
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={125} strokeDashoffset={125 - (125 * progress) / 100} className="text-emerald-500 transition-all duration-1000" />
            </svg>
          </div>
        )}
      </div>
      <div>
        <p className="text-[var(--text-secondary)] text-xs uppercase tracking-widest font-bold mb-1">{title}</p>
        <h4 className="text-2xl font-bold font-display text-[var(--text-primary)] break-words">{value}</h4>
        <p className="text-[var(--text-secondary)] text-[10px] mt-1 uppercase tracking-wider">{subtitle}</p>
      </div>
    </motion.div>
  );
}







