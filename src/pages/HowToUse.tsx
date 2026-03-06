import React from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  LayoutDashboard,
  LineChart,
  Newspaper,
  Briefcase,
  Bookmark,
  History,
  Wallet,
  Search,
  Bell,
  Brain,
  TrendingUp,
  TrendingDown,
  Activity,
  CandlestickChart,
  Info,
  MousePointer2,
  Clock3,
  BarChart3,
  Repeat2,
} from 'lucide-react';

const appSections = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview of balance, portfolio stats, recent activity, and notifications.',
  },
  {
    title: 'Market',
    icon: LineChart,
    description: 'Search and analyze stocks, open charts, and place manual buy/sell orders.',
  },
  {
    title: 'SIP',
    icon: Repeat2,
    description: 'Create weekly/monthly SIPs, pause/resume/cancel them, and track execution history.',
  },
  {
    title: 'Portfolio',
    icon: Briefcase,
    description: 'Live current value, per-stock P/L, total P/L, and SIP vs manual invested split.',
  },
  {
    title: 'Transactions',
    icon: History,
    description: 'Complete order log with source filter (MANUAL / SIP) and CSV export.',
  },
  {
    title: 'Market News',
    icon: Newspaper,
    description: 'Live headline feed with sentiment context for faster market awareness.',
  },
  {
    title: 'Watchlist',
    icon: Bookmark,
    description: 'Save symbols to monitor and return to quickly.',
  },
];

const iconGuide = [
  { icon: Search, label: 'Search', help: 'Find stocks by symbol or company name.' },
  { icon: Bookmark, label: 'Bookmark', help: 'Add or remove stock from watchlist.' },
  { icon: Bell, label: 'Bell', help: 'Shows SIP execution, completion, and failure notifications.' },
  { icon: Wallet, label: 'Wallet', help: 'Deposit virtual funds and manage buying power.' },
  { icon: Brain, label: 'AI', help: 'AI-generated portfolio insights.' },
  { icon: TrendingUp, label: 'Profit', help: 'Positive return/profit trend.' },
  { icon: TrendingDown, label: 'Loss', help: 'Negative return/loss trend.' },
  { icon: Activity, label: 'Performance', help: 'Portfolio value and P/L analytics section.' },
  { icon: Clock3, label: 'Schedule', help: 'SIP execution timeline and next run date.' },
];

export default function HowToUse() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-10"
    >
      <section className="glass-card p-6 md:p-8 bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-transparent border-cyan-500/20">
        <h2 className="text-3xl font-bold flex items-center gap-3 text-[var(--text-primary)]">
          <BookOpen className="text-cyan-400" size={30} />
          Guide To Stockify AI
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Updated guide including SIP investing, portfolio P/L, and transaction source tracking.
        </p>
      </section>

      <section className="glass-card p-6 md:p-8">
        <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
          <Info size={18} className="text-emerald-400" />
          Quick Start Flow
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            '1) Add funds from top bar',
            '2) Explore stocks in Market',
            '3) Create SIP in SIP tab (weekly/monthly)',
            '4) Track P/L in Portfolio (live + total)',
            '5) Verify order source in Transactions',
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 text-sm text-[var(--text-secondary)]">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card p-6 md:p-8">
        <h3 className="text-xl font-bold mb-5">Application Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appSections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Icon size={18} />
                  </div>
                  <h4 className="font-bold text-[var(--text-primary)]">{section.title}</h4>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{section.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="glass-card p-6 md:p-8">
        <h3 className="text-xl font-bold mb-5">SIP Workflow</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[var(--text-secondary)]">
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
            <p className="font-semibold text-[var(--text-primary)] mb-2">Create SIP</p>
            <ul className="space-y-2">
              <li>Choose stock symbol and investment amount.</li>
              <li>Select `WEEKLY` or `MONTHLY` frequency.</li>
              <li>Set start date and optional end date.</li>
              <li>Save plan from SIP page.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
            <p className="font-semibold text-[var(--text-primary)] mb-2">Execution & Tracking</p>
            <ul className="space-y-2">
              <li>System auto-executes due SIPs at schedule intervals.</li>
              <li>Each execution updates wallet, portfolio, and transactions.</li>
              <li>Execution status is logged in SIP details history.</li>
              <li>Notifications appear for success, failure, and completion.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="glass-card p-6 md:p-8">
        <h3 className="text-xl font-bold mb-5">Icon Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {iconGuide.map(({ icon: Icon, label, help }) => (
            <div key={label} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className="text-cyan-400" />
                <span className="font-semibold text-sm text-[var(--text-primary)]">{label}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">{help}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card p-6 md:p-8 border-emerald-500/20 bg-emerald-500/[0.02]">
        <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
          <CandlestickChart size={20} className="text-emerald-400" />
          How To Read The Graph
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-[var(--text-primary)]">
              <BarChart3 size={16} className="text-cyan-400" />
              Timeframe Buttons
            </h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-2">
              <li>`1D`: Intraday moves</li>
              <li>`1W`: Weekly momentum</li>
              <li>`1M`: Swing trend</li>
              <li>`1Y` and `ALL`: Macro direction</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-[var(--text-primary)]">
              <MousePointer2 size={16} className="text-cyan-400" />
              Practical Reading
            </h4>
            <ul className="text-sm text-[var(--text-secondary)] space-y-2">
              <li>Confirm trend direction first.</li>
              <li>Mark support and resistance zones.</li>
              <li>Use indicators as confirmation only.</li>
              <li>Zoom out before taking entries.</li>
            </ul>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
