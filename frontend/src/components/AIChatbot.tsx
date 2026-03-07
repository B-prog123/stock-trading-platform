import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, TrendingUp, Minimize2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAIChatResponse } from '../services/aiService';
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
];

export default function AIChatbot() {
  const { token, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `Hi ${user?.name?.split(' ')[0] || 'Trader'}! 👋 I'm your Stockify AI assistant. Ask me anything about stock trading, investing, markets, or how to use this platform. I'm here to help!`,
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userText = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText, timestamp: new Date() }]);
    setLoading(true);
    try {
      const response = await getAIChatResponse(userText, token);
      setMessages(prev => [...prev, { role: 'assistant', text: response, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute bottom-20 right-0 w-[360px] sm:w-[400px] h-[540px] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Bot className="text-white" size={18} />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">Stockify AI</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <span className="text-[10px] text-white/70 uppercase tracking-wider">Always available</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors p-1">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-bl-none border border-[var(--border-color)]'
                        }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] px-1">{formatTime(msg.timestamp)}</span>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
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

            {/* Suggested questions (only show when few messages) */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
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
            <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <div className="flex gap-2 items-end">
                <textarea
                  rows={1}
                  placeholder="Ask anything about stocks, markets, investing..."
                  className="flex-1 resize-none bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-blue-500 transition-colors text-[var(--text-primary)] min-h-[40px] max-h-[100px]"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-xl flex items-center justify-center text-white transition-colors shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-2 text-center">
                Powered by Gemini AI · Ask anything about trading
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden"
        style={{ background: isOpen ? '#1e293b' : 'linear-gradient(135deg, #2563eb, #10b981)' }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <Minimize2 size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Ping ring when chat is closed */}
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[var(--bg-primary)] animate-pulse" />
        )}
      </motion.button>
    </div>
  );
}
