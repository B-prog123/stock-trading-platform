import React, { useState, useEffect, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, Clock, BarChart3, Info, Plus, Minus, Bookmark, Sparkles } from 'lucide-react';
import { useAuth } from '../App';
import { motion } from 'motion/react';
import { apiUrl } from '../lib/api';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

import TradingViewWidget from '../components/TradingViewWidget';

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

const popularStocks: StockQuote[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 182.63, change: 1.25 },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 202.64, change: -2.41 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 726.13, change: 4.82 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 409.72, change: 0.85 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 147.22, change: -0.12 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 174.42, change: 1.15 },
];

const stockMeta: Record<string, StockMeta> = {
  AAPL: { marketCap: '2.84T', avgVolume: '52.4M' },
  TSLA: { marketCap: '0.64T', avgVolume: '91.2M' },
  NVDA: { marketCap: '1.79T', avgVolume: '48.8M' },
  MSFT: { marketCap: '3.02T', avgVolume: '24.1M' },
  GOOGL: { marketCap: '1.84T', avgVolume: '29.5M' },
  AMZN: { marketCap: '1.81T', avgVolume: '41.7M' },
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
  const [selectedStock, setSelectedStock] = useState<StockQuote>(popularStocks[0]);
  const [quantity, setQuantity] = useState(1);
  const [trading, setTrading] = useState(false);
  const [message, setMessage] = useState('');
  const [chartInterval, setChartInterval] = useState('1');
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [graphMode, setGraphMode] = useState<'simple' | 'advanced'>('simple');

  const normalizedSearch = search.trim().toLowerCase();

  const filteredStocks = useMemo(() => {
    if (!normalizedSearch) return popularStocks;
    return popularStocks.filter((stock) => {
      return stock.symbol.toLowerCase().includes(normalizedSearch) || stock.name.toLowerCase().includes(normalizedSearch);
    });
  }, [normalizedSearch]);

  const simpleChartData = useMemo(() => {
    return buildSimpleChartData(selectedStock.price, chartInterval);
  }, [selectedStock.symbol, selectedStock.price, chartInterval]);

  const startPrice = simpleChartData[0]?.price ?? selectedStock.price;
  const endPrice = simpleChartData[simpleChartData.length - 1]?.price ?? selectedStock.price;
  const netMove = ((endPrice - startPrice) / startPrice) * 100;

  useEffect(() => {
    if (!selectedSymbol) return;

    const stock = popularStocks.find((s) => s.symbol === selectedSymbol);
    if (stock) {
      setSelectedStock(stock);
    } else {
      setSelectedStock({
        symbol: selectedSymbol,
        name: `${selectedSymbol} Asset`,
        price: Math.random() * 500 + 50,
        change: parseFloat((Math.random() * 10 - 5).toFixed(2)),
      });
    }

    setSelectedSymbol(null);
  }, [selectedSymbol, setSelectedSymbol]);

  useEffect(() => {
    if (!normalizedSearch) return;
    const exactMatch = popularStocks.find((stock) => stock.symbol.toLowerCase() === normalizedSearch);
    if (exactMatch) {
      setSelectedStock(exactMatch);
    }
  }, [normalizedSearch]);

  useEffect(() => {
    const checkWatchlist = async () => {
      if (!token) return;
      try {
        const res = await fetch(apiUrl('/api/watchlist'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const watchlist = await res.json();
          setIsWatchlisted(watchlist.some((item: any) => item.symbol === selectedStock.symbol));
        }
      } catch (err) {
        console.error('Check watchlist error', err);
      }
    };
    checkWatchlist();
  }, [selectedStock.symbol, token]);

  const toggleWatchlist = async () => {
    try {
      if (isWatchlisted) {
        await fetch(apiUrl(`/api/watchlist/${selectedStock.symbol}`), {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await fetch(apiUrl('/api/watchlist'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ symbol: selectedStock.symbol })
        });
      }
      setIsWatchlisted(!isWatchlisted);
    } catch (err) {
      console.error('Toggle watchlist error', err);
    }
  };

  const handleTrade = async (type: 'BUY' | 'SELL') => {
    setTrading(true);
    setMessage('');
    try {
      const res = await fetch(apiUrl('/api/trade'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          symbol: selectedStock.symbol,
          quantity,
          price: selectedStock.price,
          type
        })
      });

      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        data = await res.json();
      } else {
        data = { error: await res.text() };
      }

      if (res.ok) {
        const successMsg = `Successfully ${type === 'BUY' ? 'bought' : 'sold'} ${quantity} shares of ${selectedStock.symbol}`;
        setMessage(successMsg);
        addNotification(`${type} Order Executed`, successMsg, 'success');
        refreshUser();
      } else {
        const errorMsg = data.error || 'Trade failed';
        setMessage(errorMsg);
        addNotification('Trade Failed', errorMsg, 'error');
      }
    } catch (err) {
      console.error('Trade error:', err);
      setMessage('Network error');
      addNotification('Error', 'Network error occurred during trade', 'error');
    } finally {
      setTrading(false);
    }
  };

  const handleSearchPick = (stock: StockQuote) => {
    setSelectedStock(stock);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col lg:flex-row gap-8 h-full pb-10"
    >
      <div className="flex-1 space-y-8 min-w-0">
        <div className="glass-card p-4 md:p-5 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by symbol or company name (AAPL, Tesla, NVIDIA...)"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl py-4 pl-14 pr-6 focus:outline-none focus:border-emerald-500/50 transition-all text-[var(--text-primary)]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filteredStocks.length > 0) {
                  handleSearchPick(filteredStocks[0]);
                }
              }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
            <span>{filteredStocks.length} match{filteredStocks.length === 1 ? '' : 'es'} in market watch</span>
            <span className="flex items-center gap-1"><Sparkles size={12} className="text-emerald-400" /> Smart filter active</span>
          </div>
        </div>

        <div className="glass-card p-8 bg-gradient-to-br from-[var(--text-primary)]/[0.02] to-transparent">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-[1.5rem] flex items-center justify-center font-bold text-2xl border border-[var(--border-color)] shadow-2xl text-[var(--text-primary)]">
                {selectedStock.symbol[0]}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-3xl font-bold font-display text-[var(--text-primary)]">{selectedStock.symbol}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest border border-[var(--border-color)]">NASDAQ</span>
                  <button
                    onClick={toggleWatchlist}
                    className={`p-2 rounded-xl transition-all ${isWatchlisted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'}`}
                  >
                    <Bookmark size={18} fill={isWatchlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <p className="text-[var(--text-secondary)] font-medium">{selectedStock.name}</p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <div className="text-4xl font-mono font-bold tracking-tighter mb-1 text-[var(--text-primary)]">${selectedStock.price.toFixed(2)}</div>
              <div className={`flex items-center md:justify-end gap-2 text-sm font-bold ${selectedStock.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                <div className={`p-1 rounded-full ${selectedStock.change > 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                  {selectedStock.change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                </div>
                {selectedStock.change > 0 ? '+' : ''}{selectedStock.change}%
                <span className="text-[var(--text-secondary)] font-normal ml-1 opacity-60">Today</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div className="flex gap-2 bg-[var(--bg-primary)] p-1 rounded-xl border border-[var(--border-color)]">
              {[
                { label: '1D', value: '1' },
                { label: '1W', value: 'W' },
                { label: '1M', value: 'M' },
                { label: '1Y', value: '12M' },
                { label: 'ALL', value: '60M' }
              ].map((t) => (
                <button
                  key={t.label}
                  onClick={() => setChartInterval(t.value)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${chartInterval === t.value ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-[var(--bg-primary)] p-1 rounded-xl border border-[var(--border-color)]">
              <button
                onClick={() => setGraphMode('simple')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${graphMode === 'simple' ? 'bg-emerald-500 text-black' : 'text-[var(--text-secondary)]'}`}
              >
                Simple Graph
              </button>
              <button
                onClick={() => setGraphMode('advanced')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${graphMode === 'advanced' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'}`}
              >
                Advanced Graph
              </button>
            </div>
          </div>

          <div className="h-[520px] w-full bg-[var(--bg-primary)]/40 rounded-3xl overflow-hidden border border-[var(--border-color)] shadow-inner p-4 md:p-6">
            {graphMode === 'simple' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <GraphSummary label="Start" value={`$${startPrice.toFixed(2)}`} tone="neutral" />
                  <GraphSummary label="Current" value={`$${endPrice.toFixed(2)}`} tone="neutral" />
                  <GraphSummary label="Change" value={`${netMove >= 0 ? '+' : ''}${netMove.toFixed(2)}%`} tone={netMove >= 0 ? 'up' : 'down'} />
                </div>

                <div className="h-[330px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simpleChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
                      <XAxis dataKey="label" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={56} domain={['auto', 'auto']} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                      <Tooltip
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                        labelFormatter={(label) => `Time: ${label}`}
                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }}
                      />
                      <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 text-xs text-[var(--text-secondary)] space-y-1">
                  <p><span className="text-[var(--text-primary)] font-semibold">How to read:</span> Left axis is price, bottom axis is time.</p>
                  <p><span className="text-emerald-400 font-semibold">Upward line</span> means price increased in selected timeframe.</p>
                  <p>Switch timeframe buttons to compare short-term vs long-term direction.</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Advanced TradingView Feed
                </div>
                <div className="h-[460px] rounded-2xl overflow-hidden border border-[var(--border-color)]">
                  <TradingViewWidget key={`${selectedStock.symbol}-${chartInterval}`} symbol={selectedStock.symbol} interval={chartInterval} />
                </div>
              </>
            )}
          </div>

          <div className="mt-6 p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-4">Stock Comparison Table</h4>
            <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]">
              <table className="min-w-full text-sm">
                <thead className="bg-[var(--bg-primary)]">
                  <tr className="text-left text-[10px] uppercase tracking-widest text-[var(--text-secondary)]">
                    <th className="px-4 py-3">Symbol</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Change</th>
                    <th className="px-4 py-3">Market Cap</th>
                    <th className="px-4 py-3">Avg Vol</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {popularStocks.map((stock) => {
                    const meta = stockMeta[stock.symbol] || { marketCap: '-', avgVolume: '-' };
                    const isActive = selectedStock.symbol === stock.symbol;

                    return (
                      <tr key={stock.symbol} className="border-t border-[var(--border-color)]">
                        <td className="px-4 py-3 font-bold text-[var(--text-primary)]">{stock.symbol}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{stock.name}</td>
                        <td className="px-4 py-3 font-mono text-[var(--text-primary)]">${stock.price.toFixed(2)}</td>
                        <td className={`px-4 py-3 font-semibold ${stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {stock.change >= 0 ? '+' : ''}
                          {stock.change.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{meta.marketCap}</td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{meta.avgVolume}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleSearchPick(stock)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isActive
                                ? 'bg-emerald-500 text-black'
                                : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)]'
                            }`}
                          >
                            {isActive ? 'Selected' : 'View'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <h4 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Info size={16} className="text-emerald-400" />
              Graph Tips For Beginners
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Trend First</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">If line goes up over time, trend is bullish. If line goes down, trend is bearish.</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Check Timeframe</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">Use 1D/1W for quick moves and 1M/1Y for bigger trend direction.</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Use Advanced Only When Needed</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">Start with Simple Graph. Move to Advanced Graph for indicators and drawings.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
            <MarketStat label="Day Range" value="$180.15 - $184.20" />
            <MarketStat label="Market Cap" value="2.84 Trillion" />
            <MarketStat label="Avg Volume" value="52.41 Million" />
            <MarketStat label="P/E Ratio" value="28.42" />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[460px] space-y-8 shrink-0">
        <div className="glass-card p-8 border-emerald-500/20 bg-emerald-500/[0.02]">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <BarChart3 className="text-emerald-400" size={20} />
            Execution Panel
          </h3>

          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.2em] font-bold">Order Quantity</label>
                <span className="text-[10px] text-emerald-500/50 font-mono">Max: 420</span>
              </div>
              <div className="grid grid-cols-[48px_minmax(0,1fr)_48px] items-center gap-3 bg-[var(--bg-primary)] rounded-2xl p-3 border border-[var(--border-color)] focus-within:border-emerald-500/30 transition-colors">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 shrink-0 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] inline-flex items-center justify-center overflow-hidden hover:bg-[var(--bg-primary)] transition-colors active:scale-90"
                >
                  <Minus size={18} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full min-w-0 bg-transparent text-center font-mono font-bold text-xl md:text-2xl focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-[var(--text-primary)]"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 shrink-0 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] inline-flex items-center justify-center overflow-hidden hover:bg-[var(--bg-primary)] transition-colors active:scale-90"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="bg-[var(--bg-primary)] rounded-2xl p-5 space-y-4 border border-[var(--border-color)]">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Order Type</span>
                <span className="font-bold text-[var(--text-primary)]">Market Order</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Est. Price</span>
                <span className="font-mono text-[var(--text-primary)]">${selectedStock.price.toFixed(2)}</span>
              </div>
              <div className="h-px bg-[var(--border-color)]" />
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)] text-sm">Total Value</span>
                <span className="font-mono text-2xl text-emerald-400 font-bold tracking-tighter">${(selectedStock.price * quantity).toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                disabled={trading}
                onClick={() => handleTrade('BUY')}
                className="neo-button py-5 rounded-2xl bg-emerald-500 text-black font-black text-sm uppercase tracking-widest hover:bg-emerald-400 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
              >
                Execute Buy
              </button>
              <button
                disabled={trading}
                onClick={() => handleTrade('SELL')}
                className="neo-button py-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] font-black text-sm uppercase tracking-widest hover:bg-[var(--bg-primary)] disabled:opacity-50"
              >
                Execute Sell
              </button>
            </div>

            {message && (
              <div className={`p-5 rounded-2xl text-xs font-medium text-center animate-in fade-in slide-in-from-top-2 duration-300 ${message.includes('Successfully') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {message}
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Market Watch</h3>
            <Clock size={16} className="text-[var(--text-secondary)]" />
          </div>

          <div className="space-y-3">
            {filteredStocks.length === 0 && (
              <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm text-[var(--text-secondary)]">
                No stocks found for "{search}".
              </div>
            )}

            {filteredStocks.map((stock) => (
              <motion.button
                key={stock.symbol}
                onClick={() => handleSearchPick(stock)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                  selectedStock.symbol === stock.symbol
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'bg-[var(--bg-secondary)] border border-transparent hover:bg-[var(--bg-primary)] hover:border-[var(--border-color)]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                    selectedStock.symbol === stock.symbol ? 'bg-emerald-500 text-black' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] group-hover:bg-[var(--bg-secondary)]'
                  }`}>
                    {stock.symbol[0]}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm group-hover:text-[var(--text-primary)] transition-colors text-[var(--text-primary)]">{stock.symbol}</div>
                    <div className="text-[9px] text-[var(--text-secondary)] uppercase tracking-widest">{stock.name.split(' ')[0]}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-[var(--text-primary)]">${stock.price.toFixed(2)}</div>
                  <div className={`text-[10px] font-bold ${stock.change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stock.change > 0 ? '+' : ''}{stock.change}%
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function GraphSummary({ label, value, tone }: { label: string; value: string; tone: 'up' | 'down' | 'neutral' }) {
  const toneClass = tone === 'up' ? 'text-emerald-400' : tone === 'down' ? 'text-red-400' : 'text-[var(--text-primary)]';

  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3">
      <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] mb-1">{label}</p>
      <p className={`font-mono font-bold text-sm ${toneClass}`}>{value}</p>
    </div>
  );
}

function MarketStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-[0.2em] font-bold">{label}</p>
      <p className="font-mono font-bold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}









