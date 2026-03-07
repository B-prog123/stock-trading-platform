import React from 'react';
import { LayoutDashboard, LineChart, Briefcase, Bookmark, Wallet, History, Newspaper, BookOpen, Repeat2, X } from 'lucide-react';
import { useAuth } from '../App';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isMobile = false, onClose }: SidebarProps) {
  const { user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'guide', label: 'Guide', icon: BookOpen },
    { id: 'market', label: 'Market', icon: LineChart },
    { id: 'market-news', label: 'Market News', icon: Newspaper },
    { id: 'funds', label: 'Add Funds', icon: Wallet },
    { id: 'sip', label: 'SIP', icon: Repeat2 },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
    { id: 'transactions', label: 'Transactions', icon: History },
  ];

  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col h-full"
    >
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Stockify</h1>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]"
          aria-label="Close sidebar"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item, idx) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 + 0.1 }}
            onClick={() => {
              setActiveTab(item.id);
              if (onClose) onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </motion.button>
        ))}
      </nav>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-4 mt-auto">
        <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/10">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[10px] uppercase tracking-widest mb-1">
            <Wallet size={12} className="text-emerald-400" />
            <span>Available Balance</span>
          </div>
          <div className="text-xl font-mono font-bold text-[var(--text-primary)]">
            ${user?.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
      </motion.div>
    </motion.aside>
  );
}

