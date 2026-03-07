import React, { useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Trash2,
  Search,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../App';
import { AnimatePresence, motion } from 'motion/react';

export default function Navbar() {
  const { user, logout, theme, toggleTheme, notifications, clearNotifications, activeTab, setActiveTab, setSelectedSymbol } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSelectedSymbol(searchQuery.toUpperCase().trim());
    setActiveTab('market');
    setSearchQuery('');
  };

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'watchlist', label: 'Watchlist' },
    { id: 'market', label: 'Market' },
    { id: 'sip', label: 'SIPs' },
    { id: 'market-news', label: 'News' },
    { id: 'transactions', label: 'Orders' },
    { id: 'funds', label: 'Funds' },
    { id: 'guide', label: 'Academy' },
    { id: 'support', label: 'Support' },
  ];

  const [indexData, setIndexData] = useState([
    { name: 'NIFTY 50', value: 22326.90, change: 38.45, pctChange: 0.17 },
    { name: 'SENSEX', value: 73665.27, change: -36.42, pctChange: -0.05 },
  ]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndexData(prev => prev.map(idx => {
        const jitter = (Math.random() - 0.5) * 10;
        const newVal = idx.value + jitter;
        const newPct = idx.pctChange + (Math.random() - 0.5) * 0.01;
        return { ...idx, value: parseFloat(newVal.toFixed(2)), pctChange: parseFloat(newPct.toFixed(2)) };
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)] shrink-0 z-40 relative sticky top-0">
      {/* Top row: Brand + Icons */}
      <div className="h-16 flex items-center justify-between px-4 lg:px-8 gap-4">

        {/* Brand */}
        <motion.div
          key={user?.id || 'guest'}
          className="flex items-center gap-2 cursor-pointer shrink-0 group"
          onClick={() => setActiveTab('dashboard')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
            <TrendingUp size={18} className="text-white" strokeWidth={3} />
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent hidden xs:block">
            STOCKIFY
          </span>
        </motion.div>

        {/* Global Search (Hidden on Mobile, use Search tab or expander later) */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md hidden md:block group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-blue-500 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search symbols (e.g. RELIANCE)..."
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] focus:border-blue-500/50 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:outline-none transition-all shadow-sm focus:shadow-blue-500/5"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Action Icons */}
        <div className="flex items-center gap-1 sm:gap-3">

          {/* Market Ticker (Desktop only) */}
          <div className="hidden xl:flex items-center gap-6 mr-4 py-2 px-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
            {indexData.map(idx => (
              <div key={idx.name} className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{idx.name}</span>
                  <span className={`text-[10px] font-bold ${idx.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {idx.change >= 0 ? '▲' : '▼'} {idx.pctChange}%
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[var(--text-primary)]">{idx.value}</span>
              </div>
            ))}
          </div>

          <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-blue-500 transition-all">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="relative">
            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-2.5 rounded-xl hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-blue-500 transition-all relative">
              <Bell size={20} />
              {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[var(--bg-secondary)]" />}
            </button>
            <AnimatePresence>
              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                  <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute right-0 top-14 w-80 bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl z-50 rounded-3xl overflow-hidden"
                  >
                    <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between">
                      <h4 className="font-bold text-sm">Alerts Center</h4>
                      <button onClick={clearNotifications} className="text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 flex gap-1.5 items-center">
                        <Trash2 size={12} /> Clear All
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto p-2 custom-scrollbar">
                      {(notifications || []).length === 0 ? (
                        <div className="py-12 text-center text-[var(--text-muted)] text-sm">No new alerts</div>
                      ) : (
                        (notifications || []).map((n) => (
                          <div key={n.id} className="p-4 rounded-2xl hover:bg-[var(--bg-primary)] transition-colors mb-1 last:mb-0">
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="font-bold text-xs text-[var(--text-primary)]">{n.title}</h5>
                              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase">{new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 p-1 pl-1 pr-3 rounded-2xl border border-[var(--border-color)] hover:border-[var(--text-secondary)] transition-all bg-[var(--bg-primary)]">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-black hidden lg:block text-[var(--text-primary)]">
                {user?.name?.split(' ')[0] || 'User'}
              </span>
            </button>
            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                  <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute right-0 top-14 w-56 bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl z-50 rounded-3xl overflow-hidden py-2"
                  >
                    <div className="px-5 py-3 border-b border-[var(--border-color)] mb-2">
                      <p className="text-xs font-bold text-[var(--text-primary)] truncate">{user?.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => { setActiveTab('profile-settings'); setIsProfileOpen(false); }}
                      className="w-full px-5 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:text-blue-500 hover:bg-[var(--bg-primary)] transition-all text-left"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={() => { setActiveTab('preferences'); setIsProfileOpen(false); }}
                      className="w-full px-5 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:text-blue-500 hover:bg-[var(--bg-primary)] transition-all text-left"
                    >
                      Preferences
                    </button>
                    <button
                      onClick={() => { setIsProfileOpen(false); }}
                      className="w-full px-5 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:text-blue-500 hover:bg-[var(--bg-primary)] transition-all text-left"
                    >
                      Activity Log
                    </button>
                    <div className="my-2 border-t border-[var(--border-color)]" />
                    <button
                      onClick={logout}
                      className="w-full px-5 py-3 text-xs font-black text-rose-500 hover:bg-rose-500/5 transition-all text-left uppercase tracking-widest border-t border-[var(--border-color)] mt-2"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Bottom row: Tabs (Scrollable) */}
      <div className="h-12 flex items-center px-4 lg:px-8 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/50 backdrop-blur-md overflow-x-auto no-scrollbar gap-2">
        {navLinks.map(link => (
          <button
            key={link.id}
            onClick={() => setActiveTab(link.id)}
            className={`px-5 h-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 relative flex items-center group ${activeTab === link.id
              ? 'text-blue-500'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
          >
            {link.label}
            {activeTab === link.id && (
              <motion.div layoutId="navActive" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
