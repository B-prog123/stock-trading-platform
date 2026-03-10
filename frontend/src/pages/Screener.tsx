import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Filter, TrendingUp, TrendingDown, Activity, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../App';
import { usePrices, mergePrices } from '../contexts/StockPriceContext';

export const sharedStockData = [
    // ─── Nifty 50 Core ─────────────────────────────────────────────────────────
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2950.25, change: 1.25, volume: '5.4M', sector: 'Energy', pe: '28.4' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4120.64, change: -0.41, volume: '2.2M', sector: 'IT', pe: '32.1' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 1450.13, change: 2.82, volume: '18.8M', sector: 'Banking', pe: '18.5' },
    { symbol: 'INFY', name: 'Infosys Limited', price: 1680.72, change: 0.85, volume: '8.1M', sector: 'IT', pe: '24.2' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', price: 1050.22, change: -0.12, volume: '15.5M', sector: 'Banking', pe: '16.8' },
    { symbol: 'SBIN', name: 'State Bank of India', price: 780.42, change: 1.15, volume: '21.7M', sector: 'Banking', pe: '9.4' },
    { symbol: 'WIPRO', name: 'Wipro Limited', price: 452.10, change: -0.90, volume: '4.2M', sector: 'IT', pe: '21.0' },
    { symbol: 'ADANIENT', name: 'Adani Enterprises', price: 3100.50, change: 4.56, volume: '12.1M', sector: 'Conglomerate', pe: '85.2' },
    { symbol: 'ITC', name: 'ITC Limited', price: 430.15, change: 0.45, volume: '14.3M', sector: 'FMCG', pe: '26.1' },
    { symbol: 'LT', name: 'Larsen & Toubro', price: 3450.80, change: 1.80, volume: '3.5M', sector: 'Infrastructure', pe: '35.6' },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance', price: 7200.55, change: 2.14, volume: '3.1M', sector: 'Finance', pe: '34.8' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: 1580.30, change: 1.62, volume: '7.8M', sector: 'Telecom', pe: '72.5' },
    { symbol: 'ASIANPAINT', name: 'Asian Paints', price: 2800.65, change: -1.10, volume: '1.8M', sector: 'FMCG', pe: '55.2' },
    { symbol: 'HCLTECH', name: 'HCL Technologies', price: 1750.30, change: 0.72, volume: '5.6M', sector: 'IT', pe: '27.3' },
    { symbol: 'MARUTI', name: 'Maruti Suzuki India', price: 12200.0, change: 1.35, volume: '1.0M', sector: 'Auto', pe: '28.9' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1890.40, change: -0.65, volume: '6.4M', sector: 'Banking', pe: '22.1' },
    { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', price: 1155.80, change: 1.90, volume: '12.2M', sector: 'Banking', pe: '14.6' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', price: 990.45, change: 3.25, volume: '14.6M', sector: 'Auto', pe: '12.4' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', price: 2540.75, change: -0.30, volume: '3.4M', sector: 'FMCG', pe: '52.8' },
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', price: 1820.60, change: 2.05, volume: '5.2M', sector: 'Pharma', pe: '38.6' },
    { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', price: 10500.0, change: 1.42, volume: '0.8M', sector: 'Cement', pe: '45.2' },
    { symbol: 'NTPC', name: 'NTPC Limited', price: 378.90, change: 0.88, volume: '18.5M', sector: 'Energy', pe: '16.2' },
    { symbol: 'POWERGRID', name: 'Power Grid Corp.', price: 325.50, change: 0.54, volume: '13.1M', sector: 'Energy', pe: '17.8' },
    { symbol: 'ONGC', name: 'Oil & Nat Gas Corp.', price: 290.75, change: -0.35, volume: '24.6M', sector: 'Energy', pe: '8.4' },
    { symbol: 'NESTLEIND', name: 'Nestle India', price: 24500.0, change: 0.28, volume: '0.4M', sector: 'FMCG', pe: '75.4' },
    { symbol: 'TITAN', name: 'Titan Company', price: 3620.80, change: 1.75, volume: '2.1M', sector: 'Consumer', pe: '88.2' },
    { symbol: 'TECHM', name: 'Tech Mahindra', price: 1650.25, change: -0.95, volume: '4.8M', sector: 'IT', pe: '29.4' },
    { symbol: 'GRASIM', name: 'Grasim Industries', price: 2380.60, change: 1.06, volume: '1.5M', sector: 'Conglomerate', pe: '22.5' },
    { symbol: 'TATASTEEL', name: 'Tata Steel', price: 165.40, change: 2.45, volume: '52.3M', sector: 'Metal', pe: '12.8' },
    { symbol: 'JSWSTEEL', name: 'JSW Steel', price: 858.70, change: 1.88, volume: '6.2M', sector: 'Metal', pe: '14.6' },
    { symbol: 'HINDALCO', name: 'Hindalco Industries', price: 660.45, change: 2.10, volume: '11.4M', sector: 'Metal', pe: '13.2' },
    { symbol: 'INDUSINDBK', name: 'IndusInd Bank', price: 1380.90, change: -1.45, volume: '8.9M', sector: 'Banking', pe: '12.1' },
    { symbol: 'DIVISLAB', name: 'Divi\'s Laboratories', price: 5200.40, change: 0.98, volume: '0.6M', sector: 'Pharma', pe: '68.4' },
    { symbol: 'CIPLA', name: 'Cipla Ltd.', price: 1580.30, change: 1.22, volume: '3.5M', sector: 'Pharma', pe: '30.5' },
    { symbol: 'DRREDDY', name: 'Dr Reddy\'s Laboratories', price: 6850.75, change: 0.65, volume: '0.9M', sector: 'Pharma', pe: '24.8' },
    { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals', price: 6920.50, change: 2.35, volume: '0.8M', sector: 'Healthcare', pe: '95.4' },
    { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ', price: 1270.85, change: 1.68, volume: '5.6M', sector: 'Infrastructure', pe: '28.8' },
    { symbol: 'ADANIGREEN', name: 'Adani Green Energy', price: 2050.35, change: 5.22, volume: '9.2M', sector: 'Energy', pe: '180.5' },
    { symbol: 'ADANIPOWER', name: 'Adani Power', price: 625.40, change: 3.85, volume: '16.4M', sector: 'Energy', pe: '14.6' },
    { symbol: 'TATAPOWER', name: 'Tata Power Co.', price: 425.60, change: 2.94, volume: '18.8M', sector: 'Energy', pe: '38.6' },
    // ─── Nifty Next 50 ─────────────────────────────────────────────────────────
    { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv', price: 1960.45, change: 1.48, volume: '2.4M', sector: 'Finance', pe: '28.6' },
    { symbol: 'PIDILITIND', name: 'Pidilite Industries', price: 3050.75, change: 0.75, volume: '0.9M', sector: 'Chemicals', pe: '80.2' },
    { symbol: 'SIEMENS', name: 'Siemens India', price: 7100.30, change: 1.15, volume: '0.5M', sector: 'Engineering', pe: '92.4' },
    { symbol: 'HAL', name: 'Hindustan Aeronautics', price: 4850.60, change: 3.42, volume: '1.2M', sector: 'Defence', pe: '38.5' },
    { symbol: 'BEL', name: 'Bharat Electronics', price: 285.80, change: 2.85, volume: '22.4M', sector: 'Defence', pe: '48.2' },
    { symbol: 'IRFC', name: 'Indian Railway Finance Corp', price: 215.40, change: 4.12, volume: '35.2M', sector: 'Finance', pe: '36.4' },
    { symbol: 'RECLTD', name: 'REC Limited', price: 545.25, change: 3.65, volume: '14.8M', sector: 'Finance', pe: '12.8' },
    { symbol: 'PFC', name: 'Power Finance Corp.', price: 490.80, change: 2.95, volume: '16.2M', sector: 'Finance', pe: '10.2' },
    { symbol: 'ZOMATO', name: 'Zomato Ltd.', price: 240.55, change: 5.45, volume: '42.8M', sector: 'Tech/Food', pe: '485.2' },
    { symbol: 'NYKAA', name: 'FSN E-Commerce (Nykaa)', price: 198.30, change: 2.84, volume: '8.6M', sector: 'E-Commerce', pe: '285.4' },
    { symbol: 'PAYTM', name: 'One97 Communications', price: 580.45, change: 6.24, volume: '18.5M', sector: 'Fintech', pe: 'N/A' },
    { symbol: 'POLICYBZR', name: 'PB Fintech (PolicyBazaar)', price: 1580.90, change: 4.18, volume: '3.2M', sector: 'Fintech', pe: 'N/A' },
    { symbol: 'TRENT', name: 'Trent (Westside)', price: 6400.50, change: 2.65, volume: '1.4M', sector: 'Retail', pe: '225.8' },
    { symbol: 'DMART', name: 'Avenue Supermarts (D-Mart)', price: 4550.80, change: 1.15, volume: '0.6M', sector: 'Retail', pe: '112.4' },
    // ─── Banking & NBFC ────────────────────────────────────────────────────────
    { symbol: 'BANDHANBNK', name: 'Bandhan Bank', price: 225.40, change: -2.15, volume: '18.4M', sector: 'Banking', pe: '10.8' },
    { symbol: 'FEDERALBNK', name: 'Federal Bank', price: 195.60, change: 1.42, volume: '14.8M', sector: 'Banking', pe: '11.2' },
    { symbol: 'IDFCFIRSTB', name: 'IDFC First Bank', price: 82.50, change: 2.18, volume: '38.5M', sector: 'Banking', pe: '18.4' },
    { symbol: 'MUTHOOTFIN', name: 'Muthoot Finance', price: 2150.80, change: 1.85, volume: '1.5M', sector: 'Finance', pe: '18.6' },
    { symbol: 'CHOLAFIN', name: 'Cholamandalam Finance', price: 1540.25, change: 2.45, volume: '2.8M', sector: 'Finance', pe: '32.6' },
    // ─── Pharma & Healthcare ───────────────────────────────────────────────────
    { symbol: 'LUPIN', name: 'Lupin Ltd.', price: 2180.60, change: 1.48, volume: '2.6M', sector: 'Pharma', pe: '32.4' },
    { symbol: 'BIOCON', name: 'Biocon Ltd.', price: 325.40, change: -0.85, volume: '6.4M', sector: 'Pharma', pe: '45.8' },
    { symbol: 'AUROPHARMA', name: 'Aurobindo Pharma', price: 1380.50, change: 0.95, volume: '3.2M', sector: 'Pharma', pe: '22.4' },
    { symbol: 'MAXHEALTH', name: 'Max Healthcare', price: 920.35, change: 3.15, volume: '4.8M', sector: 'Healthcare', pe: '82.5' },
    // ─── Auto & EV ─────────────────────────────────────────────────────────────
    { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd.', price: 9520.80, change: 1.65, volume: '0.8M', sector: 'Auto', pe: '32.8' },
    { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp', price: 5450.20, change: 1.22, volume: '0.9M', sector: 'Auto', pe: '25.4' },
    { symbol: 'MAHINDRA', name: 'Mahindra & Mahindra', price: 3250.45, change: 2.86, volume: '4.2M', sector: 'Auto', pe: '28.9' },
    { symbol: 'EICHERMOT', name: 'Eicher Motors (Royal Enfield)', price: 5800.65, change: 1.54, volume: '0.7M', sector: 'Auto', pe: '35.2' },
    { symbol: 'MOTHERSON', name: 'Samvardhana Motherson', price: 145.80, change: 2.15, volume: '24.6M', sector: 'Auto Ancillary', pe: '28.6' },
    // ─── IT & Tech ─────────────────────────────────────────────────────────────
    { symbol: 'LTTS', name: 'L&T Technology Services', price: 5650.30, change: 1.05, volume: '0.5M', sector: 'IT', pe: '42.6' },
    { symbol: 'PERSISTENT', name: 'Persistent Systems', price: 6250.80, change: 2.15, volume: '0.6M', sector: 'IT', pe: '56.4' },
    { symbol: 'COFORGE', name: 'Coforge Ltd.', price: 8250.60, change: 2.85, volume: '0.4M', sector: 'IT', pe: '54.2' },
    { symbol: 'MPHASIS', name: 'Mphasis Ltd.', price: 2980.40, change: 0.85, volume: '0.8M', sector: 'IT', pe: '36.8' },
    // ─── Real Estate & Infra ───────────────────────────────────────────────────
    { symbol: 'DLF', name: 'DLF Ltd.', price: 920.50, change: 2.45, volume: '6.5M', sector: 'Real Estate', pe: '65.4' },
    { symbol: 'GODREJPROP', name: 'Godrej Properties', price: 2980.60, change: 3.15, volume: '2.1M', sector: 'Real Estate', pe: '112.5' },
    { symbol: 'SOBHA', name: 'Sobha Ltd.', price: 1950.80, change: 4.25, volume: '1.5M', sector: 'Real Estate', pe: '48.6' },
    { symbol: 'IRCTC', name: 'IRCTC Ltd.', price: 925.40, change: 1.85, volume: '3.8M', sector: 'Tourism', pe: '58.4' },
    // ─── FMCG & Consumer ───────────────────────────────────────────────────────
    { symbol: 'BRITANNIA', name: 'Britannia Industries', price: 5850.25, change: -0.45, volume: '0.6M', sector: 'FMCG', pe: '55.2' },
    { symbol: 'DABUR', name: 'Dabur India', price: 620.80, change: 0.65, volume: '4.5M', sector: 'FMCG', pe: '52.4' },
    { symbol: 'GODREJCP', name: 'Godrej Consumer Products', price: 1280.60, change: 0.95, volume: '2.2M', sector: 'FMCG', pe: '58.6' },
    { symbol: 'MARICO', name: 'Marico Ltd.', price: 680.45, change: 0.42, volume: '3.8M', sector: 'FMCG', pe: '48.2' },
    // ─── Chemicals & Specialty ─────────────────────────────────────────────────
    { symbol: 'DEEPAKNTR', name: 'Deepak Nitrite', price: 2820.40, change: 3.45, volume: '1.2M', sector: 'Chemicals', pe: '42.6' },
    { symbol: 'AARTIIND', name: 'Aarti Industries', price: 680.50, change: 2.15, volume: '2.8M', sector: 'Chemicals', pe: '38.4' },
    // ─── Media & Telecom ───────────────────────────────────────────────────────
    { symbol: 'PVRINOX', name: 'PVR INOX Ltd.', price: 1850.60, change: -1.25, volume: '1.8M', sector: 'Media', pe: '68.4' },
    { symbol: 'INDIGRID', name: 'IndiGrid InvIT', price: 165.80, change: 0.85, volume: '2.4M', sector: 'Infra Trust', pe: 'N/A' },
    { symbol: 'INDUSTOWER', name: 'Indus Towers', price: 420.45, change: 1.95, volume: '8.2M', sector: 'Telecom', pe: '22.6' },
    // ─── US Global Stocks ──────────────────────────────────────────────────────
    { symbol: 'AAPL', name: 'Apple Inc.', price: 182.63, change: 0.45, volume: '52.4M', sector: 'Technology', pe: '28.2' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', price: 202.64, change: -1.24, volume: '85.2M', sector: 'Auto', pe: '45.8' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 726.13, change: 2.85, volume: '42.1M', sector: 'IT', pe: '95.4' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 409.72, change: 0.12, volume: '22.8M', sector: 'IT', pe: '36.5' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 147.22, change: -0.85, volume: '28.4M', sector: 'IT', pe: '25.4' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 174.42, change: 1.25, volume: '31.2M', sector: 'Retail', pe: '62.1' },
];

export default function Screener() {
    const { setSelectedSymbol, setActiveTab } = useAuth();
    const [filter, setFilter] = useState<'all' | 'gainers' | 'losers' | 'volume'>('all');
    const [sectorFilter, setSectorFilter] = useState<string>('All');
    const [search, setSearch] = useState('');
    const { prices } = usePrices();

    const liveData = mergePrices(sharedStockData, prices);
    const [data, setData] = useState(liveData);

    useEffect(() => {
        let sorted = [...liveData];
        if (sectorFilter !== 'All') {
            sorted = sorted.filter(s => s.sector === sectorFilter);
        }
        if (search.trim()) {
            const q = search.trim().toLowerCase();
            sorted = sorted.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
        }
        if (filter === 'gainers') {
            sorted = sorted.filter(s => s.change > 0).sort((a, b) => b.change - a.change);
        } else if (filter === 'losers') {
            sorted = sorted.filter(s => s.change < 0).sort((a, b) => a.change - b.change);
        } else if (filter === 'volume') {
            sorted = sorted.sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume));
        }
        setData(sorted);
    }, [filter, sectorFilter, search, prices]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 pb-10"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-[var(--text-primary)]">
                        <Filter className="text-blue-500" size={24} />
                        Advanced Screener
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                        {data.length} stocks · Filter by performance, volume, and sector
                    </p>
                </div>
                <div className="flex items-center p-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] overflow-x-auto shadow-sm w-max shrink-0">
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>All</button>
                    <button onClick={() => setFilter('gainers')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${filter === 'gainers' ? 'bg-emerald-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}><TrendingUp size={14} /> Gainers</button>
                    <button onClick={() => setFilter('losers')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${filter === 'losers' ? 'bg-rose-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}><TrendingDown size={14} /> Losers</button>
                    <button onClick={() => setFilter('volume')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${filter === 'volume' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}><Activity size={14} /> Volume</button>
                </div>
            </div>

            {/* Search + Sector Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative group sm:w-56 shrink-0">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                    <input
                        type="text"
                        placeholder="Search symbol or name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    {['All', 'Banking', 'IT', 'Finance', 'Pharma', 'Auto', 'FMCG', 'Energy', 'Metal', 'Real Estate', 'Defence', 'Telecom', 'Fintech', 'Chemicals', 'Conglomerate'].map(s => (
                        <button key={s} onClick={() => setSectorFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 border ${sectorFilter === s
                                ? 'bg-blue-600 text-white border-transparent'
                                : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-blue-500/50 bg-[var(--bg-secondary)]'
                                }`}
                        >{s}</button>
                    ))}
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
