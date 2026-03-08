import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { User } from './types';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import Dashboard from './pages/Dashboard';
import Market from './pages/Market';
import Portfolio from './pages/Portfolio';
import Transactions from './pages/Transactions';
import ProfileSettings from './pages/ProfileSettings';
import Preferences from './pages/Preferences';
import MarketNewsPage from './pages/MarketNewsPage';
import HowToUse from './pages/HowToUse';
import Screener from './pages/Screener';
import Funds from './pages/Funds';
import SIP from './pages/SIP';
import Watchlist from './pages/Watchlist';
import Onboarding from './pages/Onboarding';
import AIChatbot from './components/AIChatbot';
import Tutorial from './components/Tutorial';
import Support from './pages/Support';
import Auth from './pages/Auth';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { apiUrl } from './lib/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  date: Date;
  read: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  deposit: (amount: number) => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  notifications: Notification[];
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  clearNotifications: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedSymbol: string | null;
  setSelectedSymbol: (symbol: string | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => useContext(AuthContext)!;

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme');
    return (stored as 'light' | 'dark') || 'dark';
  });
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAppBrief, setShowAppBrief] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
    setIsAuthReady(true);
  }, []);

  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  const completeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setShowAppBrief(true);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    if (!localStorage.getItem('hasSeenOnboarding')) {
      setShowOnboarding(true);
    }
    // Show tutorial after every new login (clears on logout)
    setShowTutorial(true);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setShowAppBrief(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch(apiUrl('/api/user/profile'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  };

  const deposit = async (amount: number) => {
    if (!token) return;
    try {
      const res = await fetch(apiUrl('/api/user/wallet/deposit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }
      if (res.ok) {
        await refreshUser();
        addNotification('Deposit Successful', `₹${amount.toLocaleString()} has been added to your balance.`, 'success');
      } else {
        const data = await res.json().catch(() => ({ error: 'Deposit failed' }));
        addNotification('Deposit Failed', data.error || 'Failed to process deposit', 'error');
      }
    } catch (err) {
      console.error('Deposit failed', err);
      addNotification('Error', 'Network error during deposit', 'error');
    }
  };
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const addNotification = (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substring(7),
      title,
      message,
      type,
      date: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
    setToastNotifications(prev => [newNotif, ...prev].slice(0, 4));

    window.setTimeout(() => {
      setToastNotifications(prev => prev.filter((n) => n.id !== newNotif.id));
    }, 4500);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setToastNotifications([]);
  };

  const providerValue: AuthContextType = useMemo(() => ({
    user,
    token,
    login,
    logout,
    refreshUser,
    deposit,
    theme,
    toggleTheme,
    notifications,
    addNotification,
    clearNotifications,
    activeTab,
    setActiveTab,
    selectedSymbol,
    setSelectedSymbol,
  }), [user, token, theme, notifications, toastNotifications, activeTab, selectedSymbol, isAuthReady, showOnboarding, showTutorial, showAppBrief]);

  if (!isAuthReady) return null;

  if (!token) {
    return (
      <AuthContext.Provider value={providerValue}>
        <Auth />
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={providerValue}>
      <div className="flex flex-col fixed inset-0 bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans overflow-hidden w-full h-[100dvh]">
        <div className="fixed top-24 right-4 md:right-8 z-[120] pointer-events-none">
          <div className="space-y-3">
            <AnimatePresence>
              {toastNotifications.map((n) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: 20, y: -6 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: 20, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className={`min-w-[260px] max-w-[340px] rounded border px-4 py-3 shadow-xl backdrop-blur-md pointer-events-auto ${n.type === 'success'
                    ? 'border-green-500/40 bg-green-500/10'
                    : n.type === 'error'
                      ? 'border-red-500/40 bg-red-500/10'
                      : n.type === 'warning'
                        ? 'border-amber-500/40 bg-amber-500/10'
                        : 'border-blue-500/40 bg-blue-500/10'
                    }`}
                >
                  <p className="text-xs font-bold text-[var(--text-primary)]">{n.title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-secondary)]">{n.message}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <Navbar />

        <div className="flex flex-1 overflow-hidden min-h-0 w-full z-10 relative">
          <main className="flex-1 max-w-full overflow-x-hidden overflow-y-auto bg-[var(--bg-primary)] p-4 md:p-8 pb-28 lg:pb-8 relative scrollbar-hide">
            {showAppBrief && (
              <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 md:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-sm md:text-base font-semibold text-emerald-300">About Stockify AI</h2>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Stockify AI helps you track real-time market data, manage your portfolio, and make informed trades with built-in AI insights.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAppBrief(false)}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label="Dismiss app description"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            )}

            <AnimatePresence>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'guide' && <HowToUse />}
                {activeTab === 'market' && <Market />}
                {activeTab === 'screener' && <Screener />}
                {activeTab === 'market-news' && <MarketNewsPage />}
                {activeTab === 'funds' && <Funds />}
                {activeTab === 'sip' && <SIP />}
                {activeTab === 'watchlist' && <Watchlist />}
                {activeTab === 'portfolio' && <Portfolio />}
                {activeTab === 'transactions' && <Transactions />}
                {activeTab === 'profile-settings' && <ProfileSettings />}
                {activeTab === 'preferences' && <Preferences />}
                {activeTab === 'support' && <Support />}
              </motion.div>
            </AnimatePresence>

            {showOnboarding && <Onboarding onComplete={completeOnboarding} />}
            <AIChatbot />

            {/* Tutorial Overlay - shows after every login */}
            <AnimatePresence>
              {showTutorial && <Tutorial onComplete={completeTutorial} />}
            </AnimatePresence>
          </main>

          <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    </AuthContext.Provider>
  );
}














