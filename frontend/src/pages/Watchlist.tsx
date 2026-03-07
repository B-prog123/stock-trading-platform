import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { Bookmark, TrendingUp, TrendingDown, Trash2, Plus, Search, Bell, BellOff, X } from 'lucide-react';
import { motion } from 'motion/react';
import { apiUrl } from '../lib/api';

export default function Watchlist() {
  const { token, setActiveTab, setSelectedSymbol, logout } = useAuth();
  const [watchlist, setWatchlist] = useState<{ symbol: string, price?: number, change?: number }[]>([]);
  const [alerts, setAlerts] = useState<{ id: number, symbol: string, targetPrice: number, type: 'ABOVE' | 'BELOW' }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSymbol, setNewSymbol] = useState('');
  const [message, setMessage] = useState('');
  const [showAlertDialog, setShowAlertDialog] = useState<string | null>(null);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertType, setAlertType] = useState<'ABOVE' | 'BELOW'>('ABOVE');

  const handleTradeClick = (symbol: string) => {
    setSelectedSymbol(symbol);
    setActiveTab('market');
  };

  useEffect(() => {
    fetchWatchlist();
    fetchAlerts();
  }, [token]);

  // Simulate real-time price updates and check alerts
  useEffect(() => {
    if (watchlist.length === 0) return;

    const interval = setInterval(() => {
      setWatchlist(prev => {
        const updated = prev.map(item => ({
          ...item,
          price: (item.price || 150) + (Math.random() * 2 - 1),
          change: (item.change || 0) + (Math.random() * 0.2 - 0.1)
        }));

        // Check alerts
        updated.forEach(item => {
          const itemAlerts = alerts.filter(a => a.symbol === item.symbol);
          itemAlerts.forEach(alert => {
            const triggered = alert.type === 'ABOVE' 
              ? item.price! >= alert.targetPrice 
              : item.price! <= alert.targetPrice;
            
            if (triggered) {
              // In a real app, we'd send a notification. Here we'll just log and maybe show a toast.
              console.log(`ALERT TRIGGERED: ${item.symbol} is now ${alert.type === 'ABOVE' ? 'above' : 'below'} ${alert.targetPrice}`);
            }
          });
        });

        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [watchlist.length, alerts]);

  const fetchWatchlist = async () => {
    try {
      const res = await fetch(apiUrl('/api/watchlist'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const enrichedData = data.map((item: any) => ({
          ...item,
          price: Math.random() * 500 + 50,
          change: Math.random() * 10 - 5
        }));
        setWatchlist(enrichedData);
      }
    } catch (err) {
      console.error("Watchlist fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await fetch(apiUrl('/api/alerts'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setAlerts(await res.json());
    } catch (err) {
      console.error("Alerts fetch error", err);
    }
  };

  const addToWatchlist = async () => {
    if (!newSymbol) return;
    setMessage('');
    try {
      const res = await fetch(apiUrl('/api/watchlist'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ symbol: newSymbol.toUpperCase() })
      });
      
      if (res.ok) {
        setNewSymbol('');
        setMessage(`Successfully added ${newSymbol.toUpperCase()} to watchlist`);
        fetchWatchlist();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to add stock');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  const removeFromWatchlist = async (symbol: string) => {
    try {
      const res = await fetch(apiUrl(`/api/watchlist/${symbol}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchWatchlist();
    } catch (err) {
      console.error("Remove from watchlist error", err);
    }
  };

  const createAlert = async () => {
    if (!showAlertDialog || !alertPrice) return;
    try {
      const res = await fetch(apiUrl('/api/alerts'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          symbol: showAlertDialog,
          targetPrice: parseFloat(alertPrice),
          type: alertType
        })
      });
      if (res.ok) {
        fetchAlerts();
        setShowAlertDialog(null);
        setAlertPrice('');
      }
    } catch (err) {
      console.error("Create alert error", err);
    }
  };

  const deleteAlert = async (id: number) => {
    try {
      const res = await fetch(apiUrl(`/api/alerts/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchAlerts();
    } catch (err) {
      console.error("Delete alert error", err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto space-y-8 relative"
    >
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">My Watchlist</h2>
          <p className="text-[var(--text-secondary)]">Keep track of stocks you're interested in.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400">Live Prices</span>
        </div>
      </header>

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
            <input
              type="text"
              placeholder="Enter stock symbol (e.g. AAPL)..."
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-emerald-500/50 transition-all text-[var(--text-primary)]"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addToWatchlist()}
            />
          </div>
          <button
            onClick={addToWatchlist}
            className="px-8 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Add
          </button>
        </div>
        {message && (
          <p className={`text-xs font-medium px-4 ${message.includes('Successfully') ? 'text-emerald-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-[var(--bg-secondary)] animate-pulse rounded-3xl" />)
        ) : watchlist.length === 0 ? (
          <div className="col-span-full py-20 text-center text-[var(--text-secondary)] bg-[var(--bg-secondary)] rounded-3xl border border-dashed border-[var(--border-color)]">
            <Bookmark size={48} className="mx-auto mb-4 opacity-10" />
            Your watchlist is empty.
          </div>
        ) : (
          watchlist.map((item) => {
            const itemAlerts = alerts.filter(a => a.symbol === item.symbol);
            return (
              <div 
                key={item.symbol} 
                onClick={() => handleTradeClick(item.symbol)}
                className="bg-[var(--bg-secondary)] p-6 rounded-3xl border border-[var(--border-color)] flex flex-col gap-4 group hover:border-emerald-500/30 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.02] blur-3xl -mr-16 -mt-16" />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--bg-primary)] rounded-2xl flex items-center justify-center font-bold text-xl border border-[var(--border-color)] text-[var(--text-primary)]">
                      {item.symbol[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text-primary)]">{item.symbol}</h3>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`font-mono font-bold ${item.change! >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {item.change! >= 0 ? '+' : ''}{item.change?.toFixed(2)}%
                        </span>
                        <span className="text-[var(--text-secondary)]">Vol: 2.4M</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono font-bold tracking-tighter text-[var(--text-primary)]">${item.price?.toFixed(2)}</div>
                    <div className="text-[9px] text-[var(--text-secondary)] uppercase tracking-widest font-bold">Real-time</div>
                  </div>
                </div>

                <div className="flex items-center justify-between relative z-10 border-t border-[var(--border-color)] pt-4">
                  <div className="flex flex-wrap gap-2">
                    {itemAlerts.map(alert => (
                      <div key={alert.id} className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-[10px] font-bold border border-purple-500/20">
                        <Bell size={10} />
                        {alert.type === 'ABOVE' ? '>' : '<'} ${alert.targetPrice}
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteAlert(alert.id); }}
                          className="hover:text-[var(--text-primary)]"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowAlertDialog(item.symbol); }}
                      className="flex items-center gap-1.5 px-2 py-1 bg-[var(--bg-primary)] text-[var(--text-secondary)] rounded-lg text-[10px] font-bold border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <Plus size={10} />
                      Alert
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(item.symbol);
                    }}
                    className="p-2 rounded-xl bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 border border-red-500/20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAlertDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-secondary)] w-full max-w-md rounded-3xl border border-[var(--border-color)] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-3 text-[var(--text-primary)]">
                <Bell className="text-purple-400" />
                Set Price Alert
              </h3>
              <button onClick={() => setShowAlertDialog(null)} className="p-2 hover:bg-[var(--bg-primary)] rounded-full transition-colors text-[var(--text-primary)]">
                <X size={24} />
              </button>
            </div>
            
            <p className="text-[var(--text-secondary)] mb-8">Notify me when <span className="text-[var(--text-primary)] font-bold">{showAlertDialog}</span> goes:</p>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <button 
                  onClick={() => setAlertType('ABOVE')}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all border ${alertType === 'ABOVE' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-[var(--bg-primary)] border-transparent text-[var(--text-secondary)]'}`}
                >
                  Above
                </button>
                <button 
                  onClick={() => setAlertType('BELOW')}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all border ${alertType === 'BELOW' ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-[var(--bg-primary)] border-transparent text-[var(--text-secondary)]'}`}
                >
                  Below
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold">Target Price ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl py-4 px-6 text-2xl font-mono font-bold focus:outline-none focus:border-purple-500/50 transition-all text-[var(--text-primary)]"
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(e.target.value)}
                />
              </div>

              <button
                onClick={createAlert}
                className="w-full py-5 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-[var(--text-primary)]/5"
              >
                Create Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}






