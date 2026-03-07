import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { getAIChatResponse } from '../services/aiService';
import { useAuth } from '../App';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export default function AIChatbot() {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hi. I currently support limited questions only: 1) How do I start trading safely? 2) How should I manage risk? 3) How to diversify my portfolio? 4) When should I buy or sell? 5) How do I read market trend?" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await getAIChatResponse(userMsg, token);
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting to my brain right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-96 h-[500px] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-6 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Bot className="text-white" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)]">Stockify AI</h4>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                <X size={20} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-emerald-500 text-white rounded-tr-none' 
                      : 'bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-tl-none border border-[var(--border-color)]'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[var(--bg-primary)] p-4 rounded-2xl rounded-tl-none border border-[var(--border-color)]">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-[var(--text-secondary)] rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask about stocks, trends, or your portfolio..."
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-emerald-500/50 transition-all text-[var(--text-primary)]"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white hover:bg-emerald-600 transition-all disabled:opacity-50"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all ${
          isOpen ? 'bg-zinc-800 text-white scale-90' : 'bg-emerald-500 text-white hover:scale-110'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}


