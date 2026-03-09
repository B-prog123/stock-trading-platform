import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  PiggyBank,
  Briefcase,
  Search,
  MessageSquare,
  ShieldCheck,
  Zap,
  TestTube2,
  Bookmark
} from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import TradingViewWidget from '../components/TradingViewWidget';

const candleData = [
  { time: '10:00', open: 150, close: 155, high: 158, low: 149 },
  { time: '11:00', open: 155, close: 152, high: 157, low: 150 },
  { time: '12:00', open: 152, close: 158, high: 160, low: 151 },
  { time: '13:00', open: 158, close: 162, high: 165, low: 155 },
  { time: '14:00', open: 162, close: 159, high: 164, low: 157 },
  { time: '15:00', open: 159, close: 164, high: 166, low: 158 },
];

const chartData = candleData.map((d) => ({
  ...d,
  bodyMin: Math.min(d.open, d.close),
  bodyMax: Math.max(d.open, d.close),
  wickRange: [d.low, d.high],
  bodyRange: [Math.min(d.open, d.close), Math.max(d.open, d.close)],
  bodyLength: Math.abs(d.open - d.close),
  isBullish: d.close > d.open,
  trendLine: (d.open + d.close) / 2 - 2,
}));

export default function HowToUse() {
  const [activeTab, setActiveTab] = useState<'basics' | 'features' | 'advanced'>('basics');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-10 max-w-7xl mx-auto"
    >
      <section className="rounded-3xl p-8 md:p-10 bg-gradient-to-br from-indigo-500/10 via-emerald-500/5 to-[var(--bg-secondary)] border border-[var(--border-color)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex items-center gap-3 text-indigo-400 mb-4 relative z-10">
          <BookOpen size={28} />
          <span className="text-sm font-bold uppercase tracking-widest">Education Center</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] mb-4 relative z-10 tracking-tight">
          Stockify <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500">Academy</span>
        </h2>
        <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-2xl relative z-10">
          Welcome to the ultimate playground for future market wizards. Forget boring textbooks; we're going to learn trading through fun experiments, real-world examples, and cutting-edge AI.
        </p>
      </section>

      {/* Video Tutorial Section - Made smaller and centered */}
      <section className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 md:p-8 relative shadow-lg flex flex-col items-center text-center">
        <h3 className="text-2xl font-bold mb-3 flex items-center gap-3 text-[var(--text-primary)]">
          <Youtube className="text-rose-500" size={28} />
          Mastering Stockify
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-8 max-w-2xl">
          Start here! Watch our quick video guide to see how the platform works. We keep it short and snappy so you can get back to making money.
        </p>

        {/* Shorter, narrower video frame for better visibility */}
        <div className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden bg-[#0A0A0A] border-4 border-[var(--bg-primary)] shadow-[0_20px_50px_rgba(0,0,0,0.3)] group hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] transition-shadow duration-500">
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

      {/* Tabs for Navigation */}
      <div className="flex p-1.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] w-max mx-auto shadow-sm">
        <button
          onClick={() => setActiveTab('basics')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'basics' ? 'bg-blue-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
        >
          🧪 Fun Trading Basics
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'features' ? 'bg-emerald-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
        >
          🚀 Stockify Features
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'advanced' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
        >
          📈 Advanced Graph
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'basics' && (
          <motion.div key="basics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

            {/* The Pizza Slice Experiment */}
            <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 md:p-8 overflow-hidden relative">
              <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/5 rounded-bl-full" />
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl"><TestTube2 size={24} /></div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">The Pizza Slice Experiment (What is a Stock?)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-6">
                <div className="space-y-4">
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Imagine your friend opens the best pizza shop in town. It becomes super popular, but they need money to build a second shop. Instead of taking a loan, they slice the "ownership" of the shop into 100 equal pieces.
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    <strong>These pieces are "Stocks."</strong> If you buy 10 slices, you own 10% of the company! As the pizza shop makes more profit, the value of your slices goes up. But if people stop liking the pizza, the value goes down.
                  </p>
                  <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded-xl">
                    <h4 className="font-bold text-sm text-[var(--text-primary)] mb-2">Rule of Thumb:</h4>
                    <ul className="text-xs text-[var(--text-muted)] space-y-2 list-disc pl-4">
                      <li>You buy stocks when you believe a company will grow.</li>
                      <li>You sell stocks when you think the growth is over (or you just want your profits!).</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-[var(--bg-primary)] p-6 rounded-2xl border border-[var(--border-color)] flex flex-col items-center justify-center min-h-[250px] shadow-inner">
                  <div className="text-6xl mb-4">🍕</div>
                  <div className="flex gap-2 mb-2">
                    <span className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-500 flex flex-col items-center justify-center font-bold text-xs">₹10</span>
                    <span className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-500 flex flex-col items-center justify-center font-bold text-xs">₹10</span>
                    <span className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-500 flex flex-col items-center justify-center font-bold text-xs">₹10</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-4">Buying shares is like buying slices of a profitable business.</p>
                </div>
              </div>
            </div>

            {/* Reading the Charts */}
            <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><CandlestickChart size={24} /></div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">Candlesticks: The Heartbeat of the Market</h3>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
                    Look at the chart below. Those red and green bars aren't just random decorations—they are fighting matches between <strong>Bulls (Buyers)</strong> and <strong>Bears (Sellers)</strong>!
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3 bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--border-color)]">
                      <TrendingUp className="text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-emerald-500">Green Candles (Bulls Win)</p>
                        <p className="text-xs text-[var(--text-muted)]">Price closed higher than it opened. Buyers were aggressive and pushed the price up.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--border-color)]">
                      <TrendingDown className="text-rose-500 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-rose-500">Red Candles (Bears Win)</p>
                        <p className="text-xs text-[var(--text-muted)]">Price closed lower than it opened. Sellers panicked and drove the price down.</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-indigo-400 bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20">
                    💡 Pro Tip: The thin lines sticking out of the candles are called "Wicks". They show the highest and lowest points the price reached during that hour!
                  </p>
                </div>

                <div className="h-72 border border-[var(--border-color)] bg-[var(--bg-primary)] rounded-2xl p-4 relative shadow-inner">
                  <div className="absolute top-4 left-4 text-xs font-bold text-[var(--text-secondary)] tracking-wider">LIVE BATTLE (BULLS VS BEARS)</div>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 30, right: 10, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.05} vertical={false} />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                      <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderRadius: '8px' }} itemStyle={{ fontSize: 12 }} />

                      {/* Wicks */}
                      <Bar dataKey="wickRange" barSize={2}>
                        {chartData.map((entry, index) => (
                          <Cell key={`wick-${index}`} fill={entry.isBullish ? '#10b981' : '#f43f5e'} />
                        ))}
                      </Bar>
                      {/* Bodies */}
                      <Bar dataKey="bodyRange" barSize={16}>
                        {chartData.map((entry, index) => (
                          <Cell key={`body-${index}`} fill={entry.isBullish ? '#10b981' : '#f43f5e'} />
                        ))}
                      </Bar>
                      <Line type="monotone" dataKey="trendLine" stroke="#8b5cf6" strokeWidth={3} dot={{ stroke: '#8b5cf6', fill: 'var(--bg-primary)', r: 4 }} name="Moving Average" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </motion.div>
        )}
        {activeTab === 'features' && (
          <motion.div key="features" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

            <div className="text-center max-w-2xl mx-auto mb-8">
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Unleash the Platform</h3>
              <p className="text-sm text-[var(--text-secondary)]">Stockify isn't just a trading app; it's your personal hedge fund manager. Here is how to use every tool at your disposal.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Feature Cards */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-3xl hover:border-blue-500/30 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Activity size={24} />
                </div>
                <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2">Market Watch</h4>
                <p className="text-sm text-[var(--text-secondary)] mb-4">The command center. View real-time prices, toggle between Simple and Advanced (TradingView) charts, and execute your BUY/SELL orders instantly.</p>
                <div className="text-xs font-bold text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-lg inline-block">Use it to: Execute trades</div>
              </div>

              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-3xl hover:border-purple-500/30 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Bookmark size={24} />
                </div>
                <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2">Watchlist</h4>
                <p className="text-sm text-[var(--text-secondary)] mb-4">Don't want to buy yet? Click the Bookmark icon on any stock to add it here. Keep your eyes on the tigers before you jump in.</p>
                <div className="text-xs font-bold text-purple-500 bg-purple-500/10 px-3 py-1.5 rounded-lg inline-block">Use it to: Stalk opportunities</div>
              </div>

              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-3xl hover:border-emerald-500/30 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Briefcase size={24} />
                </div>
                <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2">Portfolio</h4>
                <p className="text-sm text-[var(--text-secondary)] mb-4">Your treasure chest. View all the stocks you currently own, your average buying price, and track your overall Profit & Loss (P&L) in real-time.</p>
                <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg inline-block">Use it to: Track your wealth</div>
              </div>

              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-3xl hover:border-amber-500/30 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <PiggyBank size={24} />
                </div>
                <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2">SIPs (Auto-Pilot)</h4>
                <p className="text-sm text-[var(--text-secondary)] mb-4">Systematic Investment Planning. Tell Stockify to automatically buy ₹100 of Reliance every month. It averages out the price and minimizes risk.</p>
                <div className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg inline-block">Use it to: Sleep peacefully</div>
              </div>

              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-3xl hover:border-rose-500/30 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Brain size={24} />
                </div>
                <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2">AI Chatbot</h4>
                <p className="text-sm text-[var(--text-secondary)] mb-4">Located at the bottom right of your screen. Ask it anything from "What is RSI?" to "Explain a Golden Cross." Powered by Gemini 2.0.</p>
                <div className="text-xs font-bold text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded-lg inline-block">Use it to: Learn constantly</div>
              </div>

              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-3xl hover:border-cyan-500/30 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={24} />
                </div>
                <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2">Funds & Orders</h4>
                <p className="text-sm text-[var(--text-secondary)] mb-4">Manage your wallet balance in the Funds tab, and review your entire receipt history in the Orders/Transactions tab for tax and tracking.</p>
                <div className="text-xs font-bold text-cyan-500 bg-cyan-500/10 px-3 py-1.5 rounded-lg inline-block">Use it to: Audit your history</div>
              </div>

            </div>
          </motion.div>
        )}
        {activeTab === 'advanced' && (
          <motion.div key="advanced" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

            <div className="text-center max-w-2xl mx-auto mb-8">
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Mastering the Advanced Graph</h3>
              <p className="text-sm text-[var(--text-secondary)]">The TradingView Widget is the ultimate tool for technical analysis. Explore its features interactively below.</p>
            </div>

            {/* Live Interactive Graph */}
            <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 md:p-8 h-[600px] mb-8">
              <TradingViewWidget symbol="RELIANCE" interval="5" />
            </div>

            {/* Explanation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-6 rounded-3xl hover:border-indigo-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4 text-indigo-500">
                  <Clock3 size={24} />
                  <h4 className="text-lg font-bold">1. Basic Use: Timeframes</h4>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">At the top left, find the timeframe selector (e.g., 1m, 5m, 1D). This changes how much time each candlestick represents.</p>
                <ul className="text-xs text-[var(--text-muted)] space-y-2 list-disc pl-4">
                  <li><strong>Short-term (1m-15m):</strong> For day trading and quick moves.</li>
                  <li><strong>Medium-term (1H-4H):</strong> For swing trading over a few days.</li>
                  <li><strong>Long-term (1D-1W):</strong> For investing and observing macro trends.</li>
                </ul>
                <p className="text-xs mt-3 bg-indigo-500/10 text-indigo-400 p-2 rounded-lg"><strong>Try it:</strong> Change the chart above from 5m to 1D to see Reliance's long-term trend!</p>
              </div>

              <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-6 rounded-3xl hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4 text-emerald-500">
                  <LineChart size={24} />
                  <h4 className="text-lg font-bold">2. Features: Indicators</h4>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">Click the "Indicators" button (looks like a line with a squiggly over it) at the top to add math-based analysis tools.</p>
                <ul className="text-xs text-[var(--text-muted)] space-y-2 list-disc pl-4">
                  <li><strong>RSI (Relative Strength Index):</strong> Shows if a stock is overbought (above 70) or oversold (below 30).</li>
                  <li><strong>MACD:</strong> Shows momentum and trend changes.</li>
                  <li><strong>Moving Averages (MA):</strong> Smoothes out price action to identify direction.</li>
                </ul>
                <p className="text-xs mt-3 bg-emerald-500/10 text-emerald-400 p-2 rounded-lg"><strong>Try it:</strong> Search and add "RSI" to the chart. Is the stock currently overbought?</p>
              </div>

              <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] p-6 rounded-3xl hover:border-rose-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4 text-rose-500">
                  <MousePointer2 size={24} />
                  <h4 className="text-lg font-bold">3. Advanced: Drawing Tools</h4>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">The left sidebar is your canvas. Use it to chart your own path and identify psychological market levels.</p>
                <ul className="text-xs text-[var(--text-muted)] space-y-2 list-disc pl-4">
                  <li><strong>Trendlines:</strong> Connect the lows of an uptrend to see where buyers step in (Support).</li>
                  <li><strong>Fibonacci Retracement:</strong> Find hidden levels where price might bounce after a big move.</li>
                  <li><strong>Compare:</strong> Click '+' at the top to overlay another stock (e.g. NIFTY) to see correlation.</li>
                </ul>
                <p className="text-xs mt-3 bg-rose-500/10 text-rose-400 p-2 rounded-lg"><strong>Try it:</strong> Draw a trendline connecting the lowest points on the chart.</p>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
