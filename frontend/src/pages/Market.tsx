import React, { useState, useEffect, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, Clock, BarChart3, Info, Plus, Minus, Bookmark, Sparkles, ChevronLeft } from 'lucide-react';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { apiUrl } from '../lib/api';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

import TradingViewWidget from '../components/TradingViewWidget';
import { sharedStockData } from './Screener';

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

interface StockMeta {
  marketCap: string;
  avgVolume: string;
}

interface SimpleChartPoint {
  label: string;
  price: number;
}

const popularStocks: StockQuote[] = sharedStockData.map(s => ({
  symbol: s.symbol,
  name: s.name,
  price: s.price,
  change: s.change
}));

const stockMeta: Record<string, StockMeta> = {
  RELIANCE: { marketCap: '19.84T', avgVolume: '5.4M' },
  TCS: { marketCap: '14.64T', avgVolume: '2.2M' },
  HDFCBANK: { marketCap: '11.79T', avgVolume: '18.8M' },
  INFY: { marketCap: '6.02T', avgVolume: '8.1M' },
  ICICIBANK: { marketCap: '7.84T', avgVolume: '15.5M' },
  SBIN: { marketCap: '6.81T', avgVolume: '21.7M' },
  WIPRO: { marketCap: '2.44T', avgVolume: '4.2M' },
  ADANIENT: { marketCap: '3.5T', avgVolume: '12.1M' },
  ITC: { marketCap: '5.3T', avgVolume: '14.3M' },
  'L&T': { marketCap: '4.8T', avgVolume: '3.5M' },
};

const intervalSeeds: Record<string, { labels: string[]; movement: number[] }> = {
  '1': {
    labels: ['9:30', '10:30', '11:30', '12:30', '1:30', '2:30', '3:30'],
    movement: [-0.9, -0.2, 0.4, 0.1, 0.8, 0.5, 1.0],
  },
  W: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    movement: [-1.2, -0.6, 0.2, 0.7, 1.1],
  },
  M: {
    labels: ['W1', 'W2', 'W3', 'W4'],
    movement: [-2.2, -1.4, -0.4, 1.0],
  },
  '12M': {
    labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
    movement: [-6.2, -3.4, -1.0, 1.5, 3.6, 5.2],
  },
  '60M': {
    labels: ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'],
    movement: [-12.5, -7.1, -2.8, 4.0, 11.6],
  },
};

function buildSimpleChartData(basePrice: number, interval: string): SimpleChartPoint[] {
  const seed = intervalSeeds[interval] || intervalSeeds['1'];
  const startPrice = basePrice * 0.96;

  return seed.labels.map((label, idx) => {
    const p = startPrice * (1 + seed.movement[idx] / 100);
    return { label, price: parseFloat(p.toFixed(2)) };
  });
}

export default function Market() {
  const { token, refreshUser, selectedSymbol, setSelectedSymbol, addNotification, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [stocks, setStocks] = useState<StockQuote[]>(popularStocks);
  const [selectedStock, setSelectedStock] = useState<StockQuote>(popularStocks[0]);
  const [quantity, setQuantity] = useState(1);
  const [trading, setTrading] = useState(false);
  const [message, setMessage] = useState('');
  const [chartInterval, setChartInterval] = useState('1');
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [graphMode, setGraphMode] = useState<'simple' | 'advanced'>('simple');
  const [showListOnMobile, setShowListOnMobile] = useState(true);

  // ── Real-time Price Fluctuations ──
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(currentStocks =>
        currentStocks.map(stock => {
          const changePercent = (Math.random() - 0.5) * 0.4; // +/- 0.2%
          const newPrice = stock.price * (1 + changePercent / 100);
          const newChange = stock.change + changePercent;
          return { ...stock, price: parseFloat(newPrice.toFixed(2)), change: parseFloat(newChange.toFixed(2)) };
        })
      );
    }, 5000); // 5s for smoother performance in dev
    return () => clearInterval(interval);
  }, []);

  // Sync selected stock with fluctuating list
  useEffect(() => {
    const updated = stocks.find(s => s.symbol === selectedStock.symbol);
    if (updated) setSelectedStock(updated);
  }, [stocks]);

  // Handle external selection (from Watchlist/Dashboard)
  useEffect(() => {
    if (selectedSymbol) {
      const stock = stocks.find(s => s.symbol === selectedSymbol);
      if (stock) {
        setSelectedStock(stock);
        setShowListOnMobile(false);
      }
      setSelectedSymbol(null);
    }
  }, [selectedSymbol]);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredStocks = useMemo(() => {
    if (!normalizedSearch) return stocks;
    return stocks.filter((stock) => {
      return stock.symbol.toLowerCase().includes(normalizedSearch) || stock.name.toLowerCase().includes(normalizedSearch);
    });
  }, [stocks, normalizedSearch]);

  const simpleChartData = useMemo(() => {
    return buildSimpleChartData(selectedStock.price, chartInterval);
  }, [selectedStock.symbol, selectedStock.price, chartInterval]);

  const handleTrade = async (type: 'BUY' | 'SELL') => {
    if (!token) return;
    setTrading(true);
    setMessage('');
    try {
      const res = await fetch(apiUrl('/api/trade'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ symbol: selectedStock.symbol, quantity, type }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`${type === 'BUY' ? 'Bought' : 'Sold'} ${quantity} shares of ${selectedStock.symbol}`);
        addNotification(`${type === 'BUY' ? 'Purchased' : 'Sold'} ${quantity} units of ${selectedStock.symbol} at ₹${selectedStock.price}`, type === 'BUY' ? 'SUCCESS' : 'INFO');
        refreshUser();
      } else {
        setMessage(data.error || 'Trade failed');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setTrading(false);
    }
  };

  const toggleWatchlist = async () => {
    if (!token) return;
    try {
      const method = isWatchlisted ? 'DELETE' : 'POST';
      const res = await fetch(apiUrl('/api/watchlist'), {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ symbol: selectedStock.symbol }),
      });
      if (res.ok) {
        setIsWatchlisted(!isWatchlisted);
        addNotification(`${selectedStock.symbol} ${isWatchlisted ? 'removed from' : 'added to'} watchlist`, 'INFO');
      }
    } catch (err) { console.error('Watchlist toggle error', err); }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-120px)] pb-10">

      {/* ── Left Sidebar / Mobile List ── */}
      <div className={`w-full lg:w-80 flex flex-col gap-4 ${!showListOnMobile ? 'hidden lg:flex' : 'flex'}`}>
        <div className="relative group">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--text-secondary)] transition-colors" />
          <input
            type="text"
            placeholder="Search instruments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm focus:outline-none focus:border-[var(--text-secondary)] transition-all"
          />
        </div>

        <div className="flex-1 overflow-hidden flex flex-col rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
            <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-tight">Market Watch</h3>
            <span className="text-[10px] text-[var(--text-muted)]">{filteredStocks.length} assets</span>
          </div>
          <div className="overflow-y-auto max-h-[500px] lg:max-h-none flex-1 custom-scrollbar">
            {filteredStocks.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => { setSelectedStock(stock); setShowListOnMobile(false); }}
                className={`w-full px-4 py-4 flex items-center justify-between border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-primary)] transition-all ${selectedStock.symbol === stock.symbol ? 'bg-[var(--bg-primary)] border-l-2 border-l-blue-500' : ''}`}
              >
                <div className="text-left">
                  <p className="font-bold text-sm text-[var(--text-primary)]">{stock.symbol}</p>
                  <p className="text-[10px] text-[var(--text-muted)] truncate max-w-[100px]">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-[var(--text-primary)]">₹{stock.price.toLocaleString('en-IN')}</p>
                  <p className={`text-[10px] font-bold flex items-center justify-end gap-1 ${stock.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {stock.change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main View: Chart & Details ── */}
      <AnimatePresence mode="wait">
        <div className={`flex-1 flex flex-col gap-6 ${showListOnMobile ? 'hidden lg:flex' : 'flex'}`}>

          {/* Back Button (Mobile Only) */}
          <button
            onClick={() => setShowListOnMobile(true)}
            className="lg:hidden flex items-center gap-2 text-blue-500 text-sm font-bold mb-2 p-2 rounded-lg bg-blue-500/5 hover:bg-blue-500/10 transition-colors w-fit"
          >
            <ChevronLeft size={16} /> Back to Market Watch
          </button>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            key={selectedStock.symbol}
            className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden shadow-xl"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-sm">
                  <BarChart3 className="text-blue-500" size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{selectedStock.symbol}</h1>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20 uppercase tracking-wider">Equity</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] font-medium truncate max-w-[150px] sm:max-w-none">{selectedStock.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mb-0.5">Live Price</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-mono font-black text-[var(--text-primary)] tracking-tight">₹{selectedStock.price.toLocaleString('en-IN')}</p>
                    <span className={`flex items-center gap-1 font-bold text-sm px-2 py-0.5 rounded-lg ${selectedStock.change >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {selectedStock.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {selectedStock.change > 0 ? '+' : ''}{selectedStock.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <button onClick={toggleWatchlist} className={`p-3 rounded-xl border transition-all ${isWatchlisted ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-inner' : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-amber-500'}`}>
                  <Bookmark size={20} fill={isWatchlisted ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                <div className="flex items-center p-1.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-x-auto">
                  {['1', 'W', 'M', '12M', '60M'].map(itv => (
                    <button key={itv} onClick={() => setChartInterval(itv)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${chartInterval === itv ? 'bg-blue-600 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                      {itv === '1' ? '1D' : itv === '12M' ? '1Y' : itv === '60M' ? '5Y' : itv}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center p-1.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                    <button onClick={() => setGraphMode('simple')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${graphMode === 'simple' ? 'bg-emerald-600 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                      Simple
                    </button>
                    <button onClick={() => setGraphMode('advanced')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${graphMode === 'advanced' ? 'bg-violet-600 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                      Advanced
                    </button>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 p-1.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                    <Sparkles size={14} className="ml-2 text-emerald-500" />
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mr-2">AI Insights</span>
                    <div className="h-4 w-[1px] bg-[var(--border-color)] mr-2" />
                    <span className="text-xs font-bold text-emerald-500 pr-2">Bullish</span>
                  </div>
                </div>
              </div>

              {/* Chart Area */}
              <div className="h-[300px] sm:h-[450px] w-full bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] p-4 relative overflow-hidden shadow-inner">
                {graphMode === 'advanced' ? (
                  <TradingViewWidget symbol={selectedStock.symbol} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simpleChartData}>
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={selectedStock.change >= 0 ? '#10b981' : '#f43f5e'} stopOpacity={0.1} />
                          <stop offset="95%" stopColor={selectedStock.change >= 0 ? '#10b981' : '#f43f5e'} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.5} />
                      <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis domain={['auto', 'auto']} stroke="var(--text-muted)" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '12px', fontWeight: 'bold' }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                      />
                      <Line type="monotone" dataKey="price" stroke={selectedStock.change >= 0 ? '#10b981' : '#f43f5e'} strokeWidth={3} dot={false} animationDuration={1000} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Trading & Stats Panel */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <div className="p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <Info size={16} className="text-blue-500" />
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Asset Fundamental</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[var(--text-muted)]">Market Cap</span>
                      <span className="text-xs font-bold text-[var(--text-primary)]">{stockMeta[selectedStock.symbol]?.marketCap || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[var(--text-muted)]">Avg Volume</span>
                      <span className="text-xs font-bold text-[var(--text-primary)]">{stockMeta[selectedStock.symbol]?.avgVolume || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[var(--text-muted)]">Sector</span>
                      <span className="text-xs font-bold text-blue-500">Equity Market</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-blue-600/5 to-transparent border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-8">
                  <div className="text-center sm:text-left">
                    <h4 className="text-lg font-bold text-[var(--text-primary)] mb-1">Trade Execution</h4>
                    <p className="text-xs text-[var(--text-muted)]">Instant settlement at real-time market rates.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                    <div className="flex flex-col gap-1 w-full sm:w-auto">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider text-center sm:text-left">Shares</span>
                      <div className="flex items-center gap-3 bg-[var(--bg-primary)] p-1 rounded-xl border border-[var(--border-color)]">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]"><Minus size={16} /></button>
                        <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-12 text-center bg-transparent text-sm font-bold focus:outline-none text-[var(--text-primary)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        <button onClick={() => setQuantity(quantity + 1)} className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]"><Plus size={16} /></button>
                      </div>
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={trading} onClick={() => handleTrade('BUY')}
                        className="flex-1 sm:flex-none px-10 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 min-w-[120px]">
                        BUY
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={trading} onClick={() => handleTrade('SELL')}
                        className="flex-1 sm:flex-none px-10 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50 min-w-[120px]">
                        SELL
                      </motion.button>
                    </div>
                  </div>
                </div>

              </div>

              {message && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-6 p-4 rounded-xl border flex items-center justify-center gap-3 ${message.toLowerCase().includes('failed') || message.toLowerCase().includes('error') ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
                  <div className={`w-2 h-2 rounded-full ${message.toLowerCase().includes('failed') || message.toLowerCase().includes('error') ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <span className="text-sm font-bold">{message}</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </div>
  );
}
