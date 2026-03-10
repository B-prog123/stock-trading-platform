import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, Bot, Minimize2, MessageSquare, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { apiUrl } from '../lib/api';
import { useAuth } from '../App';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  'How do I start trading safely?',
  'How to read candlestick charts?',
  'What is a SIP investment?',
  'How to diversify my portfolio?',
  'What is P/E ratio?',
  'When should I buy or sell?',
  'What is RSI indicator?',
  'Explain NIFTY 50 index',
];

// Smart local fallback so chatbot always works even without backend
const LOCAL_KNOWLEDGE_BASE: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['start', 'begin', 'beginner', 'new', 'first trade', 'how to trade'],
    answer: '**Getting Started with Trading:**\n\n1. **Add Funds** — Go to the Funds tab and add your trading balance.\n2. **Research Stocks** — Use the Market Watch and Screener tabs to explore stocks.\n3. **Create a Watchlist** — Add stocks you\'re interested in to track them.\n4. **Start Small** — Risk only 1-2% of your capital per trade.\n5. **Set Stop-Loss** — Always define your exit before entering a trade.\n\n🎓 Visit the Academy tab to learn chart patterns and strategies!'
  },
  {
    keywords: ['candlestick', 'candle', 'chart pattern', 'chart'],
    answer: '**Candlestick Charts:**\n\n🟢 **Green candle** = Price closed higher than it opened (bullish)\n🔴 **Red candle** = Price closed lower than it opened (bearish)\n\n**Key Patterns:**\n- **Doji** — Open ≈ Close → Indecision, possible reversal\n- **Hammer** — Small body + long lower wick → Bullish reversal signal\n- **Engulfing** — A candle fully covers the previous one → Strong momentum\n- **Morning Star** — 3-candle bullish reversal pattern\n\nUse these patterns with volume and RSI for confirmation.'
  },
  {
    keywords: ['sip', 'systematic', 'monthly invest', 'auto invest', 'rupee cost'],
    answer: '**SIP (Systematic Investment Plan):**\n\nSIP lets you invest a fixed amount in a stock at regular intervals (weekly or monthly). This strategy:\n✅ Averages out your buy price (Rupee Cost Averaging)\n✅ Reduces impact of market volatility\n✅ Builds discipline\n\n**How to create a SIP on Stockify:**\n1. Go to the **SIPs tab**\n2. Enter stock symbol (e.g., RELIANCE)\n3. Set investment amount (₹500, ₹1000, etc.)\n4. Choose frequency (Weekly/Monthly)\n5. Set start date → Click Create SIP'
  },
  {
    keywords: ['diversify', 'allocation', 'spread', 'sectors', 'portfolio'],
    answer: '**Portfolio Diversification:**\n\nNever put all your money in one stock or sector.\n\n**Good Sector Mix:**\n- 🏦 Banking (15-20%): HDFCBANK, ICICIBANK\n- 💻 IT (15-20%): TCS, INFY, HCLTECH\n- 🏭 Manufacturing/Infra (10-15%): LT, SIEMENS\n- 💊 Pharma (10%): SUNPHARMA, CIPLA\n- 🛍️ FMCG (10%): ITC, HINDUNILVR\n- ⚡ Energy (10%): RELIANCE, NTPC\n- 🚗 Auto (10%): MARUTI, TATAMOTORS\n\nReview your allocation monthly in the **Portfolio tab**.'
  },
  {
    keywords: ['pe ratio', 'p/e', 'valuation', 'price to earnings', 'pe'],
    answer: '**Price-to-Earnings (P/E) Ratio:**\n\n**Formula:** P/E = Stock Price ÷ Earnings Per Share (EPS)\n\n**How to use it:**\n- **Low P/E (< 15)**: Potentially undervalued (check for reasons)\n- **High P/E (> 50)**: Market expects high growth, or stock is expensive\n\n**Sector benchmarks:**\n- Banks: 12-20x\n- IT: 25-35x\n- FMCG: 40-60x\n- New-age tech: 100x+ (growth premium)\n\n⚠️ Always compare P/E within the same sector, not across different industries.'
  },
  {
    keywords: ['rsi', 'relative strength', 'overbought', 'oversold'],
    answer: '**RSI (Relative Strength Index):**\n\nRSI measures momentum on a 0-100 scale:\n\n- **Above 70** → Overbought (potential sell signal) 🔴\n- **Below 30** → Oversold (potential buy signal) 🟢\n- **40-60** → Neutral zone\n\n**Pro Tips:**\n- RSI divergence (price makes new high, RSI doesn\'t) = Warning sign\n- In strong trends, RSI can stay overbought/oversold for long periods\n- Always confirm with price action and volume'
  },
  {
    keywords: ['macd', 'momentum', 'moving average convergence'],
    answer: '**MACD (Moving Average Convergence Divergence):**\n\nMACD shows trend direction and momentum.\n\n- **MACD crosses above Signal line** → Bullish signal 📈\n- **MACD crosses below Signal line** → Bearish signal 📉\n- **Histogram expanding** → Momentum increasing\n- **Histogram shrinking** → Momentum weakening\n\n**Best used with:** RSI + volume confirmation for strongest signals.'
  },
  {
    keywords: ['nifty', 'sensex', 'index', 'benchmark', 'nifty 50'],
    answer: '**Indian Market Indices:**\n\n📊 **NIFTY 50** — Top 50 companies on NSE by market cap. The primary benchmark for Indian equities.\n\n📊 **SENSEX** — Top 30 companies on BSE. Oldest Indian index.\n\n**Others:**\n- **Bank Nifty** — Top banking stocks\n- **Nifty Next 50** — Companies likely to enter Nifty 50\n- **Nifty Midcap 150** — Mid-sized companies\n\nWatch these on your Dashboard for market direction.'
  },
  {
    keywords: ['buy', 'when to buy', 'entry', 'purchase', 'good time'],
    answer: '**When to Buy a Stock:**\n\n✅ **Technical signals:**\n- Price breaks resistance with high volume\n- RSI below 40 (oversold but recovering)\n- Golden Cross (50-day MA crosses above 200-day MA)\n- Strong support bounce\n\n✅ **Fundamental signals:**\n- P/E below sector average\n- Strong quarterly earnings growth\n- Increasing revenue + margin expansion\n\n⚠️ **Avoid buying:** At all-time highs without strong fundamentals, after sudden news spikes, or when market-wide fear index is extreme.'
  },
  {
    keywords: ['sell', 'when to sell', 'exit', 'take profit', 'stop loss'],
    answer: '**When to Sell a Stock:**\n\n🔴 **Sell signals:**\n- Target price reached (pre-planned)\n- Stop-loss triggered (protect capital)\n- RSI above 75-80 (extremely overbought)\n- Fundamentals deteriorate (earnings miss, guidance cut)\n- Death Cross (50-day MA crosses below 200-day MA)\n\n**Golden Rule:** Plan your exit BEFORE you enter. Set stop-loss at 5-7% below buy price for swing trades.'
  },
  {
    keywords: ['portfolio', 'holdings', 'profit', 'loss', 'p&l', 'pnl'],
    answer: '**Managing Your Portfolio:**\n\nView all your holdings in the **Portfolio tab**:\n- Current market value of each stock\n- Average buy price vs current price\n- Profit & Loss per stock\n- Overall portfolio health score (AI-powered)\n\n**Tips:**\n- Review monthly — rebalance if any stock exceeds 15% of portfolio\n- Take profits partially when a stock gains 20-30%\n- Let winners run with trailing stop-losses'
  },
  {
    keywords: ['watchlist', 'track', 'watch list', 'monitor'],
    answer: '**Using Your Watchlist:**\n\n1. Go to the **Watchlist tab**\n2. Search by stock symbol (e.g., ZOMATO, HAL, TATAMOTORS)\n3. Click ⭐ to add to watchlist\n4. Click any stock to see live chart and trade from Market Watch\n\n**Pro tip:** Create a watchlist of 10-15 stocks you\'ve researched and monitor them daily. Strike when the right opportunity appears.'
  },
  {
    keywords: ['funds', 'deposit', 'add money', 'balance', 'wallet'],
    answer: '**Adding Funds:**\n\n1. Click on the **Funds tab**\n2. Enter the amount you want to add\n3. Funds are instantly credited to your trading balance\n\nYour available balance is shown on the Dashboard as **Available Margin**. \n\nWhen you buy stocks, balance decreases. When you sell, it increases automatically.'
  },
];

const getLocalAnswer = (message: string): string => {
  const lower = message.toLowerCase();
  const match = LOCAL_KNOWLEDGE_BASE.find(item =>
    item.keywords.some(k => lower.includes(k))
  );
  if (match) return match.answer;
  return `I can help you with:\n\n• **Trading basics** (how to start, buy/sell signals)\n• **Technical analysis** (RSI, MACD, candlesticks)\n• **Fundamental analysis** (P/E ratio, EPS)\n• **Indian markets** (NIFTY, SENSEX, NSE/BSE)\n• **Platform features** (Watchlist, Portfolio, SIPs, Funds)\n\nTry asking: *"What is RSI?"*, *"How to read candlestick charts?"*, or *"When should I sell a stock?"*`;
};

export default function AIChatbot() {
  const { token, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `Hi ${user?.name?.split(' ')[0] || 'Trader'}! 👋 I'm **Stockify AI**, your personal market analyst and trading guide.\n\nAsk me anything about stocks, charts, strategies, or how to use this platform!`,
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userText = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText, timestamp: new Date() }]);
    setLoading(true);

    try {
      const authToken = token || localStorage.getItem('token');
      const res = await fetch(apiUrl('/api/ai/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ message: userText }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', text: data.text || 'I couldn\'t generate a response.', timestamp: new Date() }]);
      } else {
        // Use local knowledge base as fallback
        const localAnswer = getLocalAnswer(userText);
        setMessages(prev => [...prev, { role: 'assistant', text: localAnswer, timestamp: new Date() }]);
      }
    } catch {
      // Network error — use local knowledge base
      const localAnswer = getLocalAnswer(userText);
      setMessages(prev => [...prev, { role: 'assistant', text: localAnswer, timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  }, [loading, token]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Render markdown-like bold text
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="absolute bottom-20 right-0 flex flex-col overflow-hidden rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.35)] border border-[var(--border-color)]"
            style={{
              width: 'min(380px, calc(100vw - 32px))',
              height: 'min(560px, calc(100dvh - 140px))',
              background: 'var(--bg-secondary)',
            }}
          >
            {/* Header */}
            <div className="shrink-0 px-5 py-4 flex items-center justify-between bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
                  <Bot className="text-white" size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-sm text-white tracking-tight">Stockify AI</p>
                    <Sparkles size={12} className="text-yellow-300 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <span className="text-[10px] text-white/75 uppercase tracking-wider font-medium">Online · Powered by Gemini</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMessages([{ role: 'assistant', text: `Hi again! How can I help you with trading today?`, timestamp: new Date() }])}
                  className="p-1.5 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                  title="Clear chat"
                >
                  <RefreshCw size={14} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide min-h-0">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center mr-2 mt-1 shrink-0">
                      <Bot size={12} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[82%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none shadow-lg shadow-blue-600/20'
                          : 'bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-bl-none border border-[var(--border-color)]'
                        }`}
                    >
                      {renderText(msg.text)}
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] px-1">{formatTime(msg.timestamp)}</span>
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start items-end gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center shrink-0">
                    <Bot size={12} className="text-white" />
                  </div>
                  <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] px-4 py-3 rounded-2xl rounded-bl-none">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Suggested questions */}
            {messages.length <= 1 && (
              <div className="shrink-0 px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.slice(0, 4).map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-blue-500 hover:text-blue-500 transition-colors bg-[var(--bg-primary)] whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="shrink-0 p-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  rows={1}
                  placeholder="Ask about stocks, charts, strategies..."
                  className="flex-1 resize-none bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-[13px] focus:outline-none focus:border-blue-500 transition-colors text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                  style={{ maxHeight: '80px', overflowY: 'auto' }}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 disabled:opacity-40 rounded-xl flex items-center justify-center text-white transition-all shadow-lg shadow-blue-600/25 shrink-0"
                >
                  <Send size={15} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden"
        style={{
          background: isOpen
            ? 'var(--bg-secondary)'
            : 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)',
          boxShadow: isOpen
            ? '0 4px 24px rgba(0,0,0,0.2)'
            : '0 8px 32px rgba(37,99,235,0.4)',
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Minimize2 size={22} className="text-[var(--text-primary)]" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageSquare size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && (
          <>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
            <motion.span
              className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400"
              animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </>
        )}
      </motion.button>
    </div>
  );
}
