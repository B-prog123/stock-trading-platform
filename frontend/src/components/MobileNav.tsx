import React from 'react';
import { LayoutDashboard, LineChart, Briefcase, Bookmark, History, Newspaper, BookOpen, Wallet, Repeat2, Activity, Trophy } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'market', label: 'Market', icon: LineChart },
    { id: 'screener', label: 'Screen', icon: Activity },
    { id: 'funds', label: 'Funds', icon: Wallet },
    { id: 'sip', label: 'SIP', icon: Repeat2 },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'watchlist', label: 'Watch', icon: Bookmark },
    { id: 'game', label: 'Game', icon: Trophy },
    { id: 'support', label: 'Help', icon: BookOpen },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-[var(--bg-secondary)]/90 backdrop-blur-xl border-t border-[var(--border-color)] flex items-center justify-start overflow-x-auto no-scrollbar px-4 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.1)] z-50 gap-2">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center gap-1 transition-all min-w-[72px] shrink-0 ${activeTab === item.id ? 'text-emerald-400' : 'text-[var(--text-secondary)]'
            }`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeTab === item.id ? 'bg-emerald-500/10 text-emerald-500' : ''}`}>
            <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          {activeTab === item.id && <div className="absolute bottom-0 w-1 h-1 bg-emerald-400 rounded-full mb-1" />}
        </button>
      ))}
    </nav>
  );
}

