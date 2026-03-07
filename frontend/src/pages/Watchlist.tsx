import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { Search, Trash2, Plus, Bell, X } from 'lucide-react';
import { apiUrl } from '../lib/api';

export default function Watchlist() {
  const { token, setActiveTab, setSelectedSymbol, logout } = useAuth();
  const [watchlist, setWatchlist] = useState<{ symbol: string, price?: number, change?: number }[]>([]);
  const [alerts, setAlerts] = useState<{ id: number, symbol: string, targetPrice: number, type: 'ABOVE' | 'BELOW' }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSymbol, setNewSymbol] = useState('');
  const [message, setMessage] = useState('');

  const handleTradeClick = (symbol: string, action?: 'buy' | 'sell') => {
    setSelectedSymbol(symbol);
    // You can pass the action to market/order page through context or state if needed.
    setActiveTab('market');
  };

  useEffect(() => {
    fetchWatchlist();
    fetchAlerts();
  }, [token]);

  // Simulate real-time price updates
  useEffect(() => {
    if (watchlist.length === 0) return;
    const interval = setInterval(() => {
      setWatchlist(prev => prev.map(item => ({
        ...item,
        price: (item.price || 150) + (Math.random() * 2 - 1),
        change: (item.change || 0) + (Math.random() * 0.2 - 0.1)
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, [watchlist.length]);

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
    } catch (err) { }
  };

  const addToWatchlist = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSymbol.trim()) return;
    setMessage('');
    try {
      const res = await fetch(apiUrl('/api/watchlist'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ symbol: newSymbol.toUpperCase().trim() })
      });
      if (res.ok) {
        setNewSymbol('');
        fetchWatchlist();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to add');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('Network error');
      setTimeout(() => setMessage(''), 3000);
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

  return (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)] border-r border-[var(--border-color)]">
      {/* Watchlist Items */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-[var(--bg-primary)] animate-pulse rounded" />)}
          </div>
        ) : watchlist.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--text-muted)]">
            Search to add instruments
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border-color)]">
            {watchlist.map((item) => (
              <li
                key={item.symbol}
                className="group flex flex-col hover:bg-[var(--bg-primary)] cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-center p-3" onClick={() => handleTradeClick(item.symbol)}>
                  <span className="text-sm font-semibold truncate" title={item.symbol}>{item.symbol}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs ${item.change && item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {item.change && item.change >= 0 ? '+' : ''}{item.change?.toFixed(2)}%
                    </span>
                    <span className={`text-sm font-mono w-16 text-right ${item.change && item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {item.price?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions (visible on hover) */}
                <div className="hidden group-hover:flex items-center justify-end px-3 pb-2 gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleTradeClick(item.symbol, 'buy'); }}
                    className="bg-blue-500 text-white px-3 py-1 text-xs rounded hover:bg-blue-600 font-semibold"
                  >
                    B
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleTradeClick(item.symbol, 'sell'); }}
                    className="bg-red-500 text-white px-3 py-1 text-xs rounded hover:bg-red-600 font-semibold"
                  >
                    S
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFromWatchlist(item.symbol); }}
                    className="text-[var(--text-muted)] hover:text-red-500 p-1 flex items-center justify-center cursor-pointer ml-1"
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* List count footer */}
      <div className="p-2 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-muted)] mt-auto shrink-0 bg-[var(--bg-secondary)]">
        {watchlist.length} / 50 items
      </div>
    </div>
  );
}






