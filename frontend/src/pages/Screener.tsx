import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Filter, TrendingUp, TrendingDown, Activity, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../App';

export const sharedStockData = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2950.25, change: 1.25, volume: '5.4M', sector: 'Energy', pe: '28.4' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4120.64, change: -0.41, volume: '2.2M', sector: 'IT', pe: '32.1' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 1450.13, change: 2.82, volume: '18.8M', sector: 'Finance', pe: '18.5' },
    { symbol: 'INFY', name: 'Infosys Limited', price: 1680.72, change: 0.85, volume: '8.1M', sector: 'IT', pe: '24.2' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', price: 1050.22, change: -0.12, volume: '15.5M', sector: 'Finance', pe: '16.8' },
    { symbol: 'SBIN', name: 'State Bank of India', price: 780.42, change: 1.15, volume: '21.7M', sector: 'Finance', pe: '9.4' },
    { symbol: 'WIPRO', name: 'Wipro Limited', price: 452.10, change: -0.90, volume: '4.2M', sector: 'IT', pe: '21.0' },
    { symbol: 'ADANIENT', name: 'Adani Enterprises', price: 3100.50, change: 4.56, volume: '12.1M', sector: 'Conglomerate', pe: '85.2' },
    { symbol: 'ITC', name: 'ITC Limited', price: 430.15, change: 0.45, volume: '14.3M', sector: 'FMCG', pe: '26.1' },
    { symbol: 'L&T', name: 'Larsen & Toubro', price: 3450.80, change: 1.80, volume: '3.5M', sector: 'Infrastructure', pe: '35.6' }
];

export default function Screener() {
    const { setSelectedSymbol, setActiveTab } = useAuth();
    const [filter, setFilter] = useState<'all' | 'gainers' | 'losers' | 'volume'>('all');
    const [data, setData] = useState(sharedStockData);

    useEffect(() => {
        let sorted = [...sharedStockData];
        if (filter === 'gainers') {
            sorted = sorted.filter(s => s.change > 0).sort((a, b) => b.change - a.change);
        } else if (filter === 'losers') {
            sorted = sorted.filter(s => s.change < 0).sort((a, b) => a.change - b.change);
        } else if (filter === 'volume') {
            // Very basic mock volume sort
            sorted = sorted.sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume));
        }
        setData(sorted);
    }, [filter]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 pb-10"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3 text-[var(--text-primary)]">
                        <Filter className="text-blue-500" size={28} />
                        Advanced Screener
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Filter stocks by performance, volume, and sector metrics.</p>
                </div>

                <div className="flex items-center p-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] overflow-x-auto shadow-sm w-max">
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>All Assets</button>
                    <button onClick={() => setFilter('gainers')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${filter === 'gainers' ? 'bg-emerald-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}><TrendingUp size={14} /> Top Gainers</button>
                    <button onClick={() => setFilter('losers')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${filter === 'losers' ? 'bg-rose-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}><TrendingDown size={14} /> Top Losers</button>
                    <button onClick={() => setFilter('volume')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${filter === 'volume' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}><Activity size={14} /> Vol Shockers</button>
                </div>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] sm:rounded-2xl overflow-hidden shadow-sm">
                {/* Desktop View Table */}
                <div className="overflow-x-auto hidden sm:block">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--bg-primary)] border-b border-[var(--border-color)] text-[var(--text-muted)] font-black text-[10px] uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-5">Symbol</th>
                                <th className="px-6 py-5">Price</th>
                                <th className="px-6 py-5">Change %</th>
                                <th className="px-6 py-5 hidden md:table-cell">Volume</th>
                                <th className="px-6 py-5 hidden lg:table-cell">P/E Ratio</th>
                                <th className="px-6 py-5 hidden lg:table-cell">Sector</th>
                                <th className="px-6 py-5 text-center">Trade</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
                            {data.map((stock, i) => (
                                <motion.tr
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    key={stock.symbol}
                                    className="hover:bg-[var(--bg-primary)] transition-colors group cursor-pointer"
                                    onClick={() => {
                                        setSelectedSymbol(stock.symbol);
                                        setActiveTab('market');
                                    }}
                                >
                                    <td className="px-6 py-5">
                                        <div className="font-black text-sm flex items-center gap-2 tracking-tight">
                                            {stock.symbol}
                                            {stock.change > 3 && <Zap size={14} className="text-amber-500 fill-amber-500" />}
                                        </div>
                                        <div className="text-[10px] text-[var(--text-muted)] font-bold truncate max-w-[120px] uppercase tracking-tighter">{stock.name}</div>
                                    </td>
                                    <td className="px-6 py-5 font-mono font-black text-sm">₹{stock.price.toFixed(2)}</td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black ${stock.change >= 0 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                            {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 font-mono text-xs hidden md:table-cell text-[var(--text-secondary)] font-bold">{stock.volume}</td>
                                    <td className="px-6 py-5 font-mono text-xs hidden lg:table-cell text-[var(--text-secondary)] font-bold">{stock.pe}</td>
                                    <td className="px-6 py-5 hidden lg:table-cell">
                                        <span className="px-3 py-1 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                            {stock.sector}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-blue-500 group-hover:translate-x-1 transition-all mx-auto" />
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View Card List */}
                <div className="sm:hidden divide-y divide-[var(--border-color)]">
                    {data.map((stock, i) => (
                        <motion.div
                            key={stock.symbol}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => {
                                setSelectedSymbol(stock.symbol);
                                setActiveTab('market');
                            }}
                            className="p-5 active:bg-[var(--bg-primary)] transition-colors flex items-center justify-between group"
                        >
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-base text-[var(--text-primary)] tracking-tight">{stock.symbol}</span>
                                    {stock.change > 3 && <Zap size={14} className="text-amber-500 fill-amber-500" />}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1.5 py-0.5 bg-[var(--bg-primary)] rounded border border-[var(--border-color)]">{stock.sector}</span>
                                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter truncate max-w-[120px]">{stock.name}</span>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="font-mono font-black text-sm text-[var(--text-primary)] mb-1">₹{stock.price.toFixed(2)}</div>
                                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black ${stock.change >= 0 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                    {stock.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                    {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
