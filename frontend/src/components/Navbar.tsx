import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  User as UserIcon,
  ChevronDown,
  Settings,
  LogOut,
  Sun,
  Moon,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onOpenSidebar: () => void;
}

export default function Navbar({ onOpenSidebar }: NavbarProps) {
  const { user, logout, theme, toggleTheme, notifications, clearNotifications, setActiveTab } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const openTabFromProfile = (tab: string) => {
    setActiveTab(tab);
    setIsProfileOpen(false);
  };

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  return (
    <nav className="h-20 border-b border-[var(--border-color)] flex items-center justify-between px-4 md:px-8 bg-[var(--bg-primary)]/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(16,185,129,0.06)] sticky top-0 z-40">
      <div className="flex items-center flex-1 max-w-xl gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-emerald-400 transition-all shadow-sm"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] group-focus-within:text-emerald-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search stocks, news, or help..."
            className="w-full bg-[var(--bg-secondary)]/90 border border-[var(--border-color)] rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-emerald-500/50 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08)] transition-all text-sm text-[var(--text-primary)]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-emerald-400 transition-all shadow-sm"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          onClick={() => setActiveTab('funds')}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-sm hover:opacity-95 transition-all shadow-lg shadow-emerald-500/30"
        >
          <Plus size={16} />
          Add Funds
        </button>

        <button
          onClick={() => setActiveTab('funds')}
          className="sm:hidden p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
          aria-label="Add funds"
        >
          <Plus size={16} />
        </button>

        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-emerald-400 transition-all shadow-sm"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[var(--bg-primary)]" />}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
                    <h4 className="font-bold text-sm">Notifications</h4>
                    <button
                      onClick={clearNotifications}
                      className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={10} /> Clear All
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-2 space-y-1">
                    {(notifications || []).length === 0 ? (
                      <div className="py-10 text-center text-[var(--text-secondary)] text-xs italic">No new notifications</div>
                    ) : (
                      (notifications || []).map((n) => (
                        <div key={n.id} className="p-3 rounded-2xl hover:bg-[var(--bg-primary)] transition-colors border border-transparent hover:border-[var(--border-color)]">
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="font-bold text-xs text-[var(--text-primary)]">{n.title}</h5>
                            <span className="text-[9px] text-[var(--text-secondary)]">{new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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

        <div className="h-8 w-px bg-[var(--border-color)] mx-1 hidden sm:block" />

        <div className="relative hidden sm:block">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-[var(--bg-secondary)] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/10">
              {user?.name[0]}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold leading-none mb-1 text-[var(--text-primary)]">{user?.name}</p>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Pro Member</p>
            </div>
            <ChevronDown size={16} className={`text-[var(--text-secondary)] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-56 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl shadow-2xl p-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-[var(--border-color)] mb-2">
                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-1">Account</p>
                    <p className="text-sm font-medium truncate text-[var(--text-primary)]">{user?.email}</p>
                  </div>

                  <button onClick={() => openTabFromProfile('profile-settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-all text-sm">
                    <UserIcon size={18} />
                    Profile Settings
                  </button>
                  <button onClick={() => openTabFromProfile('preferences')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-all text-sm">
                    <Settings size={18} />
                    Preferences
                  </button>

                  <div className="h-px bg-[var(--border-color)] my-2" />

                  <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all text-sm">
                    <LogOut size={18} />
                    Sign Out
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
