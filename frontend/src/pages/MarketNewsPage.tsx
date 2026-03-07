import React from 'react';
import { motion } from 'motion/react';
import { Newspaper, Sparkles } from 'lucide-react';
import MarketNews from '../components/MarketNews';

export default function MarketNewsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-10"
    >
      <div className="glass-card p-6 md:p-8 bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-transparent border-cyan-500/20">
        <div className="flex items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 text-[var(--text-primary)]">
              <Newspaper className="text-cyan-400" size={28} />
              Market News Hub
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Track the latest market-moving stories, sentiment, and sector headlines in one place.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-2 rounded-xl">
            <Sparkles size={14} />
            Live Insights
          </div>
        </div>
      </div>

      <div className="glass-card p-6 md:p-8">
        <MarketNews />
      </div>
    </motion.div>
  );
}
