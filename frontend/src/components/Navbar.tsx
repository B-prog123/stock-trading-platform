import React, { useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Trash2,
  Search
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
    { id: 'market', label: 'Market Watch' },
    { id: 'sip', label: 'SIPs' },
    { id: 'market-news', label: 'News' },
    { id: 'transactions', label: 'Orders' },
    { id: 'funds', label: 'Funds' },
    { id: 'guide', label: 'Academy' },
  ];

  const indexData = [
    { name: 'NIFTY 50', value: '22,326.90', change: 38.45, pctChange: 0.17 },
    { name: 'SENSEX', value: '73,665.27', change: -36.42, pctChange: -0.05 },
  ];

  return (
    <nav className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-4 lg:px-6 bg-[var(--bg-secondary)] shrink-0 z-40 relative">
      <div className="flex items-center gap-8 h-full">
        <div className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-500 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          STOCKIFY
        </div>
        <div className="hidden md:flex items-center gap-2 h-full">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`px-4 h-full text-sm font-medium border-b-2 transition-colors ${activeTab === link.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden lg:flex flex-1 max-w-md mx-8">
        <form onSubmit={handleSearch} className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
          <input
            type="text"
            placeholder="Search stocks, indices, eg: INFY, NIFTY"
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] focus:border-blue-500 rounded-lg py-1.5 pl-9 pr-4 text-sm focus:outline-none transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="flex items-center gap-4 h-full shrink-0">
        <div className="hidden lg:flex items-center gap-6 text-xs font-semibold mr-4">
          {indexData.map(idx => (
            <div key={idx.name} className="flex gap-2 items-center">
              <span className="text-[var(--text-secondary)]">{idx.name}</span>
              <span className={idx.change >= 0 ? 'text-green-500' : 'text-red-500'}>{idx.value}</span>
              <span className={`text-[10px] ${idx.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {idx.change >= 0 ? '+' : ''}{idx.pctChange}%
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative h-full flex items-center">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[var(--bg-secondary)]" />}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-14 w-80 bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xl z-50 rounded"
                >
                  <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    <button
                      onClick={clearNotifications}
                      className="text-[10px] uppercase text-[var(--text-secondary)] hover:text-red-500 flex flex-center gap-1"
                    >
                      <Trash2 size={10} /> Clear All
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-1">
                    {(notifications || []).length === 0 ? (
                      <div className="py-8 text-center text-[var(--text-secondary)] text-xs">No notifications</div>
                    ) : (
                      (notifications || []).map((n) => (
                        <div key={n.id} className="p-3 border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-primary)] text-left">
                          <div className="flex justify-between items-start">
                            <h5 className="font-semibold text-xs text-[var(--text-primary)]">{n.title}</h5>
                            <span className="text-[10px] text-[var(--text-secondary)]">{new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] mt-1">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="relative h-full flex items-center ml-2">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-200 dark:border-blue-800">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium hidden sm:block text-[var(--text-secondary)]">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-14 w-48 bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xl z-50 rounded py-1"
                >
                  <div className="px-4 py-2 border-b border-[var(--border-color)] mb-1">
                    <p className="text-xs text-[var(--text-secondary)]">{user?.email}</p>
                  </div>
                  <button onClick={() => { setActiveTab('profile-settings'); setIsProfileOpen(false); }} className="w-fulltext-left px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors text-left flex">
                    My Profile
                  </button>
                  <button onClick={() => { setActiveTab('preferences'); setIsProfileOpen(false); }} className="w-full px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors text-left flex">
                    Preferences
                  </button>
                  <div className="margin-y-1 border-t border-[var(--border-color)]" />
                  <button onClick={logout} className="w-full flex text-left px-4 py-2 text-sm text-red-500 hover:bg-[var(--bg-primary)] transition-colors">
                    Logout
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

      </div>
    </nav>
  );
}

