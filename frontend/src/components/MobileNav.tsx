import React from 'react';
import { LayoutDashboard, LineChart, Briefcase, Bookmark, History, Newspaper, BookOpen, Wallet, Repeat2, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'market', label: 'Market', icon: LineChart },
    { id: 'screener', label: 'Screen', icon: Activity },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'watchlist', label: 'Watch', icon: Bookmark },
    { id: 'sip', label: 'SIP', icon: Repeat2 },
    { id: 'transactions', label: 'Orders', icon: History },
    { id: 'funds', label: 'Funds', icon: Wallet },
    { id: 'support', label: 'Help', icon: BookOpen },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-[var(--bg-secondary)]/95 backdrop-blur-2xl border-t border-[var(--border-color)] flex items-center justify-start overflow-x-auto no-scrollbar px-4 pb-safe shadow-[0_-8px_32px_rgba(0,0,0,0.12)] z-50 gap-2">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`relative flex flex-col items-center gap-1 transition-all min-w-[76px] shrink-0 py-2 rounded-2xl active:scale-90 ${activeTab === item.id ? 'text-emerald-500' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeTab === item.id ? 'bg-emerald-500/15' : ''}`}>
            <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.15em]">{item.label}</span>

          {activeTab === item.id && (
            <motion.div
              layoutId="mobileNavActive"
              className="absolute -bottom-1 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"
            />
          )}
        </button>
      ))}
    </nav>
  );
}

