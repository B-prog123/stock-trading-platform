import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { Search, Trash2, Plus, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { apiUrl } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';

export default function Watchlist() {
  const { token, setActiveTab, setSelectedSymbol, logout } = useAuth();
  const [watchlist, setWatchlist] = useState<{ symbol: string; price?: number; change?: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSymbol, setNewSymbol] = useState('');
  const [message, setMessage] = useState('');
  const [adding, setAdding] = useState(false);

  const handleTradeClick = (symbol: string) => {
    setSelectedSymbol(symbol);
    setActiveTab('market');
  };

  useEffect(() => {
    fetchWatchlist();
  }, [token]);

  // Simulate real-time price updates
  useEffect(() => {
    if (watchlist.length === 0) return;
    const interval = setInterval(() => {
      setWatchlist(prev =>
        prev.map(item => ({
          ...item,
          price: Math.max(1, (item.price || 150) + (Math.random() * 2 - 1)),
          change: (item.change || 0) + (Math.random() * 0.2 - 0.1),
        }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [watchlist.length]);

  const fetchWatchlist = async () => {
    try {
      const res = await fetch(apiUrl('/api/watchlist'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) { logout(); return; }
      if (res.ok) {
        const data = await res.json();
        setWatchlist(
          data.map((item: any) => ({
            ...item,
            price: Math.random() * 500 + 50,
            change: Math.random() * 10 - 5,
          }))
        );
      }
    } catch (err) {
      console.error('Watchlist fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSymbol.trim()) return;
    setAdding(true);
    setMessage('');
    try {
      const res = await fetch(apiUrl('/api/watchlist'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ symbol: newSymbol.toUpperCase().trim() }),
      });
      if (res.ok) {
        setNewSymbol('');
        fetchWatchlist();
        setMessage('Added successfully!');
        setTimeout(() => setMessage(''), 2000);
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to add symbol');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch {
      setMessage('Network error. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setAdding(false);
    }
  };

  const removeFromWatchlist = async (symbol: string) => {
    try {
      const res = await fetch(apiUrl(`/api/watchlist/${symbol}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchWatchlist();
    } catch (err) {
      console.error('Remove from watchlist error', err);
    }
  };

  const popularSymbols = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'SBIN', 'ICICIBANK', 'WIPRO', 'NIFTY50'];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Eye size={22} className="text-blue-500" />
            My Watchlist
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Track stocks you're interested in</p>
        </div>
        <span className="text-sm text-[var(--text-muted)] font-mono">{watchlist.length} / 50</span>
      </div>

      {/* Add Stock Form */}
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Add Instrument</h3>
        <form onSubmit={addToWatchlist} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
            <input
              type="text"
              placeholder="Enter stock symbol e.g. RELIANCE, TCS, INFY"
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              value={newSymbol}
              onChange={e => setNewSymbol(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={adding || !newSymbol.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus size={16} />
            {adding ? 'Adding...' : 'Add'}
          </button>
        </form>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-2 text-xs font-medium ${message.includes('success') ? 'text-green-500' : 'text-red-500'}`}
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Quick add popular symbols */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-xs text-[var(--text-muted)] font-medium py-1">Popular:</span>
          {popularSymbols.map(sym => (
            <button
              key={sym}
              onClick={() => { setNewSymbol(sym); }}
              className="px-2.5 py-1 text-xs bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md hover:border-blue-500 hover:text-blue-500 transition-colors font-mono"
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* Watchlist Table */}
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Tracked Instruments</h3>
          <span className="text-xs text-[var(--text-muted)]">Click a stock to open in Market Watch</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-[var(--bg-primary)] animate-pulse rounded-lg" />
            ))}
          </div>
        ) : watchlist.length === 0 ? (
          <div className="py-16 text-center">
            <Eye size={36} className="mx-auto text-[var(--text-muted)] mb-3 opacity-40" />
            <p className="text-sm text-[var(--text-muted)]">No instruments added yet</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Search and add stocks above to track them here</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              <span className="col-span-4">Symbol</span>
              <span className="col-span-3 text-right">Price</span>
              <span className="col-span-3 text-right">Change</span>
              <span className="col-span-2 text-right">Actions</span>
            </div>
            {watchlist.map((item, i) => (
              <motion.div
                key={item.symbol}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="grid grid-cols-12 px-4 py-3 hover:bg-[var(--bg-primary)] cursor-pointer transition-colors items-center group"
                onClick={() => handleTradeClick(item.symbol)}
              >
                {/* Symbol */}
                <div className="col-span-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold shrink-0">
                    {item.symbol[0]}
                  </div>
                  <span className="font-semibold text-sm text-[var(--text-primary)]">{item.symbol}</span>
                </div>

                {/* Price */}
                <div className="col-span-3 text-right">
                  <span className="font-mono text-sm font-semibold text-[var(--text-primary)]">
                    ₹{item.price?.toFixed(2)}
                  </span>
                </div>

                {/* Change */}
                <div className="col-span-3 text-right">
                  <div className={`flex items-center justify-end gap-1 text-sm font-semibold ${(item.change ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(item.change ?? 0) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {(item.change ?? 0) >= 0 ? '+' : ''}{item.change?.toFixed(2)}%
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); handleTradeClick(item.symbol); }}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                  >
                    Buy
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleTradeClick(item.symbol); }}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
                  >
                    Sell
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); removeFromWatchlist(item.symbol); }}
                    className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
