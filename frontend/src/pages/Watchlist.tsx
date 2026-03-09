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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 max-w-5xl mx-auto pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Eye size={24} className="text-blue-500" />
            </div>
            <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Watchlist</h1>
          </div>
          <p className="text-sm text-[var(--text-muted)] font-medium">Keep eyes on your favorite instruments and act fast on moves.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-5 py-2 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mr-3">Tracking</span>
            <span className="text-sm font-black text-blue-500 font-mono">{watchlist.length} / 50</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Tracker List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden shadow-xl">
            <div className="px-8 py-6 border-b border-[var(--border-color)] flex items-center justify-between bg-gradient-to-r from-[var(--bg-primary)]/40 to-transparent">
              <h3 className="font-black text-lg text-[var(--text-primary)]">Tracked Assets</h3>
              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Live Updates Every 2s</p>
            </div>

            {loading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 bg-[var(--bg-primary)] animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : watchlist.length === 0 ? (
              <div className="py-24 text-center">
                <div className="w-20 h-20 rounded-[2.5rem] bg-[var(--bg-primary)] flex items-center justify-center mx-auto mb-6 text-[var(--text-muted)] opacity-20 border-2 border-dashed border-current">
                  <Eye size={32} />
                </div>
                <p className="text-lg font-black text-[var(--text-primary)]">Your list is empty</p>
                <p className="text-xs text-[var(--text-muted)] mt-2 font-medium">Add symbols on the right to start tracking.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-color)] bg-gradient-to-b from-transparent to-[var(--bg-primary)]/20">
                {watchlist.map((item, i) => (
                  <motion.div
                    key={item.symbol}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group px-8 py-5 flex items-center justify-between hover:bg-[var(--bg-primary)]/50 transition-all cursor-pointer relative"
                    onClick={() => handleTradeClick(item.symbol)}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center font-black text-sm text-[var(--text-primary)] group-hover:border-blue-500/30 transition-colors">
                        {item.symbol[0]}
                      </div>
                      <div className="text-left">
                        <p className="font-black text-sm text-[var(--text-primary)] group-hover:text-blue-500 transition-colors tracking-tight uppercase">{item.symbol}</p>
                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Equity Market</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-12">
                      <div className="text-right hidden sm:block">
                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Live Price</p>
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={item.price}
                            initial={{ opacity: 0.5 }}
                            animate={{ opacity: 1 }}
                            className="font-mono text-base font-black text-[var(--text-primary)]"
                          >
                            ₹{item.price?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </motion.p>
                        </AnimatePresence>
                      </div>

                      <div className="text-right min-w-[100px]">
                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">24h Change</p>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-black text-[10px] transition-colors ${(item.change ?? 0) >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {(item.change ?? 0) >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {(item.change ?? 0) >= 0 ? '+' : ''}{item.change?.toFixed(2)}%
                        </div>
                      </div>

                      {/* Quick Action Hovers */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-[4.5rem] bg-[var(--bg-secondary)] pl-4 py-2 rounded-l-xl shadow-[-10px_0_15px_var(--bg-secondary)]">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleTradeClick(item.symbol); }}
                          className="px-3 py-1.5 text-[10px] font-black bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-colors uppercase"
                        >
                          B / S
                        </button>
                      </div>

                      <button
                        onClick={e => { e.stopPropagation(); removeFromWatchlist(item.symbol); }}
                        className="p-3 rounded-xl text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/5 transition-all opacity-0 group-hover:opacity-100"
                        title="Remove from watchlist"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search & Sidebar */}
        <div className="space-y-8">

          <div className="glass-card p-8 bg-blue-600/5 border-blue-500/20">
            <h3 className="text-lg font-black text-[var(--text-primary)] mb-6 flex items-center gap-3">
              <Plus size={20} className="text-blue-500" />
              Add to Radar
            </h3>

            <form onSubmit={addToWatchlist} className="space-y-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Symbol (e.g. INFY)..."
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] focus:border-blue-500 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:outline-none transition-all uppercase"
                  value={newSymbol}
                  onChange={e => setNewSymbol(e.target.value)}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={adding || !newSymbol.trim()}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-black rounded-2xl transition-all shadow-xl shadow-blue-600/20 uppercase tracking-[0.2em]"
              >
                {adding ? 'Securing Data...' : 'Add to Watchlist'}
              </motion.button>
            </form>

            <AnimatePresence>
              {message && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`mt-4 p-4 rounded-xl text-[10px] font-black uppercase text-center border ${message.toLowerCase().includes('success') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 pt-8 border-t border-[var(--border-color)]">
              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 ml-1">Popular Picks</p>
              <div className="flex flex-wrap gap-2">
                {popularSymbols.map(sym => (
                  <button
                    key={sym}
                    onClick={() => { setNewSymbol(sym); }}
                    className="px-3 py-1.5 text-[10px] font-black bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl hover:border-blue-500 hover:text-blue-500 transition-all uppercase tracking-tighter"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp size={20} className="text-emerald-500" />
              <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">Strategy Tip</h4>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
              A well-curated watchlist helps you spot breakouts early. Focus on 5-10 quality instruments rather than too many.
            </p>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
