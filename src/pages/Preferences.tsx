import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { Bell, Palette } from 'lucide-react';

export default function Preferences() {
  const { theme, toggleTheme, clearNotifications, addNotification } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState<boolean>(() => {
    const stored = localStorage.getItem('pref_email_alerts');
    return stored === null ? true : stored === 'true';
  });
  const [priceAlerts, setPriceAlerts] = useState<boolean>(() => {
    const stored = localStorage.getItem('pref_price_alerts');
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem('pref_email_alerts', String(emailAlerts));
  }, [emailAlerts]);

  useEffect(() => {
    localStorage.setItem('pref_price_alerts', String(priceAlerts));
  }, [priceAlerts]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Preferences</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Control your app experience and notifications.</p>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 md:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <Palette className="text-emerald-400" size={18} />
          <h3 className="font-bold text-[var(--text-primary)]">Appearance</h3>
        </div>

        <button
          onClick={toggleTheme}
          className="px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm font-medium text-[var(--text-primary)] hover:border-emerald-500/50 transition-all"
        >
          Theme: {theme === 'dark' ? 'Dark' : 'Light'} (Click to switch)
        </button>
      </div>

      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 md:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <Bell className="text-emerald-400" size={18} />
          <h3 className="font-bold text-[var(--text-primary)]">Notifications</h3>
        </div>

        <label className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
          <span className="text-sm text-[var(--text-primary)]">Email alerts</span>
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={(e) => setEmailAlerts(e.target.checked)}
            className="w-4 h-4 accent-emerald-500"
          />
        </label>

        <label className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
          <span className="text-sm text-[var(--text-primary)]">Price movement alerts</span>
          <input
            type="checkbox"
            checked={priceAlerts}
            onChange={(e) => setPriceAlerts(e.target.checked)}
            className="w-4 h-4 accent-emerald-500"
          />
        </label>

        <button
          onClick={() => {
            clearNotifications();
            addNotification('Notifications Cleared', 'All in-app notifications were removed.', 'info');
          }}
          className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-medium text-red-400 hover:bg-red-500/15 transition-all"
        >
          Clear In-App Notifications
        </button>
      </div>
    </div>
  );
}
