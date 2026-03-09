import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { PortfolioItem, PortfolioAnalysis } from '../types';
import { Briefcase, TrendingUp, TrendingDown, Brain, Sparkles, PieChart as PieChartIcon, Activity, Wallet, Calendar, HelpCircle, Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'motion/react';
import { apiUrl } from '../lib/api';
import { format, subDays } from 'date-fns';

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

  // ── Periodic Refresh & Jitter ──
  useEffect(() => {
    const interval = setInterval(() => {
      setPerformance(currentPerf => {
        const nextPerf = { ...currentPerf };
        let hasChanges = false;

        Object.keys(nextPerf).forEach(symbol => {
          const item = nextPerf[symbol];
          // Jitter current price by +/- 0.05%
          const jitter = (Math.random() - 0.5) * 0.1;
          const newPrice = item.currentPrice * (1 + jitter / 100);
          const newCurrentValue = item.quantity * newPrice;
          const newPnl = newCurrentValue - (item.quantity * item.avgPrice);
          const newPnlPct = (newPnl / (item.quantity * item.avgPrice)) * 100;

          nextPerf[symbol] = {
            ...item,
            currentPrice: parseFloat(newPrice.toFixed(2)),
            currentValue: parseFloat(newCurrentValue.toFixed(2)),
            profitLoss: parseFloat(newPnl.toFixed(2)),
            profitLossPercent: parseFloat(newPnlPct.toFixed(2))
          };
          hasChanges = true;
        });

        if (hasChanges) {
          // Re-calculate totals
          const perfValues = Object.values(nextPerf) as PerformanceItem[];
          const newInvested = perfValues.reduce((acc, curr) => acc + (curr.quantity * curr.avgPrice), 0);
          const newCurrent = perfValues.reduce((acc, curr) => acc + curr.currentValue, 0);
          const newPnl = newCurrent - newInvested;
          const newPnlPct = newInvested > 0 ? (newPnl / newInvested) * 100 : 0;

          setTotals({
            investedValue: parseFloat(newInvested.toFixed(2)),
            currentValue: parseFloat(newCurrent.toFixed(2)),
            profitLoss: parseFloat(newPnl.toFixed(2)),
            profitLossPercent: parseFloat(newPnlPct.toFixed(2))
          });
        }

        return nextPerf;
      });
    }, 3000);

    const refreshInterval = setInterval(fetchPortfolio, 15000); // Fresh data every 15s
    return () => { clearInterval(interval); clearInterval(refreshInterval); };
  }, [performance]);

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
      RELIANCE: 'Energy',
      TCS: 'Technology',
      HDFCBANK: 'Financial Services',
      INFY: 'Technology',
      ICICIBANK: 'Financial Services',
      SBIN: 'Financial Services',
      ITC: 'Consumer Defensive',
      LARSEN: 'Industrials',
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

  const generateTrendData = () => {
    const data = [];
    const isProfitable = totals.profitLoss >= 0;

    // We start 30 days ago.
    // Base value is Invested Value, but we'll create a curve that ends at Current Value
    let currentDataValue = isProfitable ? totals.investedValue : totals.investedValue + Math.abs(totals.profitLoss) * 2;

    // Target is our real current value
    const targetValue = totals.currentValue;

    // Roughly distribute the difference over 30 days
    const totalDiff = targetValue - currentDataValue;
    const dailyStep = totalDiff / 30;

    for (let i = 30; i >= 0; i--) {
      // Add some random noise to make it look like a real stock chart
      const noise = (Math.random() - 0.5) * (totals.investedValue * 0.02);

      // We force the very last day (i === 0) to equal exactly targetValue 
      if (i === 0) {
        currentDataValue = targetValue;
      } else {
        currentDataValue += dailyStep + noise;
      }

      data.push({
        date: format(subDays(new Date(), i), 'MMM dd'),
        value: Math.max(0, currentDataValue), // Ensure it doesn't drop below 0
      });
    }
    return data;
  };

  const trendData = generateTrendData();
  const isTrendPositive = totals.profitLoss >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-10 pb-10"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-gradient">My Portfolio</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md">Comprehensive overview of your assets, SIP contribution, and live profit/loss.</p>
        </div>
        <button
          onClick={analyzePortfolio}
          disabled={analyzing || portfolio.length === 0}
          className="neo-button w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold hover:opacity-90 transition-all disabled:opacity-50 shadow-xl shadow-[var(--text-primary)]/5"
        >
          {analyzing ? <Sparkles className="animate-spin" size={20} /> : <Brain size={20} />}
          {analyzing ? 'Analyzing...' : 'AI Health Check'}
        </button>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <MetricCard title="Total Assets" value={portfolio.length.toString()} subtitle="Unique holdings" icon={<Briefcase className="text-emerald-400" size={20} />} tooltip="Number of unique company stocks currently held in your portfolio." />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <MetricCard title="Diversification" value={`${diversificationScore}/100`} subtitle={diversificationScore > 70 ? 'Excellent spread' : 'Concentrated risk'} icon={<PieChartIcon className="text-cyan-400" size={20} />} progress={diversificationScore} tooltip="A score representing how well your investments are spread across different sectors. A higher score means lower risk." />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <MetricCard title="Current Value" value={`₹${totalValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}`} subtitle="Live value" icon={<Wallet className="text-emerald-400" size={20} />} tooltip="The estimated total value of all your stocks if you were to sell them right now at current market prices." />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <MetricCard title="Total P&L" value={`${totals.profitLoss >= 0 ? '+' : '-'}₹${Math.abs(totals.profitLoss).toLocaleString(undefined, { maximumFractionDigits: 1 })}`} subtitle={`${totals.profitLossPercent >= 0 ? '+' : ''}${totals.profitLossPercent.toFixed(2)}%`} icon={totals.profitLoss >= 0 ? <TrendingUp className="text-emerald-400" size={20} /> : <TrendingDown className="text-red-400" size={20} />} tooltip="Total Profit & Loss. This shows how much money you have gained or lost compared to your original invested amount." />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="col-span-2 sm:col-span-1">
          <MetricCard title="SIP Invested" value={`₹${(breakdown.sipInvested || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}`} subtitle={`Manual: ₹${(breakdown.manualInvested || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}`} icon={<Activity className="text-cyan-400" size={20} />} tooltip="Shows how much of your capital was invested automatically via SIP vs manual lump-sum orders." />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6 border-[var(--border-color)]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-3 text-[var(--text-primary)]">
              <Activity className={isTrendPositive ? "text-emerald-400" : "text-rose-400"} />
              Performance Trend
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1"><Calendar size={12} /> Last 30 Days Overview</p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-mono font-bold ${isTrendPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isTrendPositive ? '+' : '-'}₹{Math.abs(totals.profitLoss).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full mt-4">
          {portfolio.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isTrendPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isTrendPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.05} vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} minTickGap={30} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} tickFormatter={(val) => `₹${val > 1000 ? (val / 1000).toFixed(0) + 'k' : val}`} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  formatter={(value: number) => [`₹${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 'Portfolio Value']}
                  labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="value" stroke={isTrendPositive ? "#10b981" : "#ef4444"} strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] text-sm italic border-2 border-dashed border-[var(--border-color)] rounded-2xl">
              <TrendingUp size={48} className="mb-4 opacity-20" />
              <p>No trend data available. Invest to start tracking your performance.</p>
            </div>
          )}
        </div>

        {/* Educational Section Added Below the Chart */}
        <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
          <h4 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-3">
            <Info size={16} className="text-blue-500" /> How to Read This Information
          </h4>
          <div className="text-xs text-[var(--text-secondary)] space-y-4 grid md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <strong className="text-[var(--text-primary)]">Invested Value vs. Current Value</strong>
              <p className="mt-1">
                Your <span className="text-[var(--text-primary)] font-medium">Invested Value</span> is the original amount of money you spent to buy the shares.
                Your <span className="text-[var(--text-primary)] font-medium">Current Value</span> is what those shares are worth right now based on live market prices.
              </p>
            </div>
            <div>
              <strong className="text-[var(--text-primary)]">Total P&L (Profit & Loss)</strong>
              <p className="mt-1">
                P&L is the difference between your Current Value and your Invested Value. If the number is green (+), you have made a profit. If it is red (-), your stocks are currently worth less than what you paid for them.
              </p>
            </div>
            <div>
              <strong className="text-[var(--text-primary)]">Performance Trend Chart</strong>
              <p className="mt-1">
                This area chart simulates the growth or decline of your total portfolio value over the last 30 days. It helps you visualize whether your assets are generally trending upward or downward.
              </p>
            </div>
            <div>
              <strong className="text-[var(--text-primary)]">Asset Allocation & Diversification</strong>
              <p className="mt-1">
                Diversification means not putting all your eggs in one basket. Spreading your investments across different sectors (like Tech, Energy, and Banking) helps reduce the risk of a single industry causing huge losses.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

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
                <tr className="text-left text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
                  <th className="p-3">Asset</th>
                  <th className="p-3 text-right">Shares</th>
                  <th className="p-3 text-right">Avg Cost</th>
                  <th className="p-3 text-right">Current Price</th>
                  <th className="p-3 text-right">Total Value</th>
                  <th className="p-3 text-right">Return</th>
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
                    const totalCost = item.quantity * item.avgPrice;
                    const itemReturn = totalCost > 0 ? ((currentValue - totalCost) / totalCost) * 100 : 0;

                    return (
                      <tr key={item.symbol} onClick={() => handleTradeClick(item.symbol)} className="hover:bg-[var(--bg-secondary)] transition-colors group cursor-pointer">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-sm bg-[var(--bg-primary)] flex items-center justify-center font-bold text-xs text-[var(--text-primary)] border border-[var(--border-color)]">
                              {item.symbol[0]}
                            </div>
                            <div>
                              <div className="font-bold text-[var(--text-primary)] text-sm">{item.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono text-sm text-[var(--text-secondary)]">{item.quantity.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono text-sm text-[var(--text-secondary)]">${item.avgPrice.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono text-sm text-[var(--text-primary)]">${currentPrice.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono font-bold text-sm text-[var(--text-primary)]">${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="p-3 text-right">
                          <div className={`font-mono font-bold text-sm ${itemReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {itemReturn >= 0 ? '+' : ''}{itemReturn.toFixed(2)}%
                          </div>
                          <div className={`text-[10px] font-mono ${itemReturn >= 0 ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                            {itemReturn >= 0 ? '+' : ''}${(currentValue - totalCost).toFixed(2)}
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
                    <Pie data={sectorData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
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

function MetricCard({ title, value, subtitle, icon, progress, tooltip }: any) {
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
        <div className="flex items-center gap-1">
          <p className="text-[var(--text-secondary)] text-xs uppercase tracking-widest font-bold mb-1">{title}</p>
          {tooltip && (
            <div className="relative group/tooltip mb-1">
              <HelpCircle size={12} className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[10px] text-[var(--text-secondary)] rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 text-center normal-case tracking-normal">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--border-color)]" />
              </div>
            </div>
          )}
        </div>
        <h4 className="text-2xl font-bold font-display text-[var(--text-primary)] break-words">{value}</h4>
        <p className="text-[var(--text-secondary)] text-[10px] mt-1 uppercase tracking-wider">{subtitle}</p>
      </div>
    </motion.div>
  );
}







