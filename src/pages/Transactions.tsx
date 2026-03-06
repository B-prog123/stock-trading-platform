import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownLeft, Calendar, Search, Download } from 'lucide-react';
import { apiUrl } from '../lib/api';

interface Transaction {
  id: number | string;
  symbol: string;
  quantity: number;
  price: number;
  type: 'BUY' | 'SELL';
  source?: 'MANUAL' | 'SIP';
  date: string;
}

export default function Transactions() {
  const { token, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [token]);

  const fetchTransactions = async () => {
    try {
      const res = await fetch(apiUrl('/api/transactions'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }
      if (res.ok) {
        setTransactions(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const typeMatch = filter === 'ALL' || t.type === filter;
    const sourceValue = t.source || 'MANUAL';
    const sourceMatch = sourceFilter === 'ALL' || sourceValue === sourceFilter;
    const searchMatch = t.symbol.toLowerCase().includes(search.toLowerCase());
    return typeMatch && sourceMatch && searchMatch;
  });

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ['Asset', 'Type', 'Source', 'Quantity', 'Price', 'Total Value', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map((t) => [
        t.symbol,
        t.type,
        t.source || 'MANUAL',
        t.quantity,
        t.price.toFixed(2),
        (t.quantity * t.price).toFixed(2),
        new Date(t.date).toLocaleDateString(),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-[var(--text-secondary)]">History of manual and SIP buy/sell orders</p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredTransactions.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--hover-bg)] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
          <input
            type="text"
            placeholder="Search by symbol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex gap-2">
          {['ALL', 'BUY', 'SELL'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {['ALL', 'MANUAL', 'SIP'].map((f) => (
            <button
              key={f}
              onClick={() => setSourceFilter(f)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                sourceFilter === f
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                  : 'bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-bottom border-[var(--border-color)] bg-[var(--hover-bg)]/50">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Asset</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Type</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Source</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Quantity</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Price</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Total Value</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-8 bg-[var(--hover-bg)]/20"></td>
                  </tr>
                ))
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((t, idx) => {
                  const source = t.source || 'MANUAL';
                  return (
                    <motion.tr
                      key={String(t.id)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-[var(--hover-bg)]/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                            t.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {t.symbol.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold">{t.symbol}</div>
                            <div className="text-xs text-[var(--text-secondary)]">Equity Delivery</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          t.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {t.type === 'BUY' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                          {t.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${source === 'SIP' ? 'bg-cyan-500/15 text-cyan-400' : 'bg-slate-500/15 text-slate-300'}`}>
                          {source}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm">{Number(t.quantity).toFixed(4)}</td>
                      <td className="px-6 py-4 font-mono text-sm">${t.price.toFixed(2)}</td>
                      <td className="px-6 py-4 font-mono text-sm font-semibold">${(t.quantity * t.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                          <Calendar size={14} />
                          {new Date(t.date).toLocaleDateString()}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--text-secondary)]">No transactions found matching your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
