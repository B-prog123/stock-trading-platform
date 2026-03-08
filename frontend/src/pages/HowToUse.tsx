import React from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  LineChart,
  Brain,
  TrendingUp,
  TrendingDown,
  Activity,
  CandlestickChart,
  Info,
  MousePointer2,
  Clock3,
  Youtube,
  PlayCircle,
} from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const candleData = [
  { time: '10:00', open: 150, close: 155, high: 158, low: 149 },
  { time: '11:00', open: 155, close: 152, high: 157, low: 150 },
  { time: '12:00', open: 152, close: 158, high: 160, low: 151 },
  { time: '13:00', open: 158, close: 162, high: 165, low: 155 },
  { time: '14:00', open: 162, close: 159, high: 164, low: 157 },
  { time: '15:00', open: 159, close: 164, high: 166, low: 158 },
];

// Transform for Recharts ComposedChart (Candlestick hack)
const chartData = candleData.map((d) => ({
  ...d,
  bodyMin: Math.min(d.open, d.close),
  bodyMax: Math.max(d.open, d.close),
  bodyLength: Math.abs(d.open - d.close),
  isBullish: d.close > d.open,
  trendLine: (d.open + d.close) / 2 - 2,
}));

export default function HowToUse() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-10"
    >
      <section className="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-indigo-500/10 via-emerald-500/5 to-[var(--bg-secondary)] border border-[var(--border-color)]">
        <div className="flex items-center gap-3 text-indigo-400 mb-2">
          <BookOpen size={24} />
          <span className="text-xs font-bold uppercase tracking-widest">Education Center</span>
        </div>
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          Stockify Academy
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
          Trading is not purely intuition; it requires reading the data. Learn the core principles of market analysis to maximize your returns using Stockify's tools.
        </p>
      </section>

      {/* Video Tutorial Section */}
      <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 md:p-8 overflow-hidden relative shadow-lg">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 text-[var(--text-primary)]">
          <Youtube className="text-rose-500" size={28} />
          Mastering Stockify
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-3xl">
          Watch our comprehensive video guide below to understand how to leverage Stockify's advanced tools, AI insights, and systematic investment planning (SIP) to maximize your portfolio growth.
        </p>
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#0A0A0A] border border-[var(--border-color)] shadow-2xl flex items-center justify-center group">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/p7HKvqRI_Bo?rel=0&showinfo=0&modestbranding=1"
            title="Stock Market Trading Course"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 z-10"
          ></iframe>
        </div>
      </section>

      {/* Chart Reading Guide */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--text-primary)]">
            <CandlestickChart className="text-emerald-400" size={20} />
            Reading Price Action
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            The candlestick chart is the trader's most vital tool. A green (bullish) candle means the price closed higher than it opened. A red (bearish) candle means the opposite.
          </p>

          <div className="h-64 border border-[var(--border-color)] bg-[var(--bg-primary)] rounded-xl p-4 relative">
            <div className="absolute top-2 left-4 text-xs font-bold text-[var(--text-secondary)]">EXAMPLE CHART</div>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.05} vertical={false} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }} itemStyle={{ fontSize: 12 }} />

                {/* Wicks */}
                <Bar dataKey="high" barSize={2} fillOpacity={0}>
                  {chartData.map((entry, index) => (
                    <Cell key={`wick-${index}`} fill={entry.isBullish ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
                {/* Bodies */}
                <Bar dataKey="bodyMax" barSize={16}>
                  {chartData.map((entry, index) => (
                    <Cell key={`body-${index}`} fill={entry.isBullish ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="trendLine" stroke="#8b5cf6" strokeWidth={2} dot={false} strokeDasharray="3 3" name="Moving Average" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">

          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-[var(--text-primary)]">
              <Brain className="text-indigo-400" size={18} />
              Platform AI Insights
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">Stockify analyzes news sentiment and market momentum to label assets:</p>
            <div className="flex gap-4">
              <div className="flex-1 border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-3 text-center">
                <span className="block text-emerald-500 font-bold mb-1">BUY</span>
                <span className="text-xs text-[var(--text-secondary)]">Strong upward momentum</span>
              </div>
              <div className="flex-1 border border-rose-500/20 bg-rose-500/5 rounded-xl p-3 text-center">
                <span className="block text-rose-500 font-bold mb-1">SELL</span>
                <span className="text-xs text-[var(--text-secondary)]">Downward trend detected</span>
              </div>
              <div className="flex-1 border border-yellow-500/20 bg-yellow-500/5 rounded-xl p-3 text-center">
                <span className="block text-yellow-500 font-bold mb-1">HOLD</span>
                <span className="text-xs text-[var(--text-secondary)]">Consolidating price action</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-[var(--text-primary)]">
              <TrendingUp className="text-cyan-400" size={18} />
              Systematic Investing (SIP)
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Don't try to time the market. A SIP (Systematic Investment Plan) allows you to automate your investments weekly or monthly. This averages out your buy price over time, minimizing risk.
            </p>
            <ul className="text-xs text-[var(--text-secondary)] space-y-2 list-disc pl-4">
              <li>Navigate to the **SIPs** tab in the top navigation.</li>
              <li>Pick a safe "Bluechip" stock idea or enter your own symbol.</li>
              <li>Set a recurring amount (e.g., $500 monthly) to passively grow your wealth.</li>
            </ul>
          </div>

        </div>

      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 flex items-start gap-4">
          <div className="p-2 bg-[var(--bg-primary)] rounded-lg text-emerald-400 shrink-0"><Activity size={20} /></div>
          <div>
            <h4 className="font-bold text-sm text-[var(--text-primary)] mb-1">Portfolio P&L</h4>
            <p className="text-xs text-[var(--text-secondary)]">Check your global P&L daily from the Portfolio tab to see your net ROI.</p>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 flex items-start gap-4">
          <div className="p-2 bg-[var(--bg-primary)] rounded-lg text-blue-400 shrink-0"><Clock3 size={20} /></div>
          <div>
            <h4 className="font-bold text-sm text-[var(--text-primary)] mb-1">Timeframes</h4>
            <p className="text-xs text-[var(--text-secondary)]">Use 1W or 1M chart timeframes for long term investing, and 1D for day trading.</p>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 flex items-start gap-4">
          <div className="p-2 bg-[var(--bg-primary)] rounded-lg text-indigo-400 shrink-0"><LineChart size={20} /></div>
          <div>
            <h4 className="font-bold text-sm text-[var(--text-primary)] mb-1">Market Indices</h4>
            <p className="text-xs text-[var(--text-secondary)]">Watch NIFTY 50 and SENSEX to gauge the overall health of the market.</p>
          </div>
        </div>
      </section>

    </motion.div>
  );
}
