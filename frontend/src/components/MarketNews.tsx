import React, { useState, useEffect } from 'react';
import { generateMarketNews } from '../services/aiService';
import { motion, AnimatePresence } from 'motion/react';
import { Newspaper, TrendingUp, TrendingDown, Minus, Clock, ExternalLink, X } from 'lucide-react';

interface NewsItem {
  title: string;
  summary: string;
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export default function MarketNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      const data = await generateMarketNews();
      setNews(data);
      setLoading(false);
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="h-32 bg-[var(--hover-bg)]/20 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Newspaper size={20} className="text-emerald-500" />
          Market News
        </h3>
        <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
          <Clock size={12} />
          Just updated
        </span>
      </div>

      <div className="space-y-4">
        {news.map((item, idx) => (
          <motion.div
            key={idx}
            onClick={() => setSelectedNews(item)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-primary)] transition-colors group cursor-pointer"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 border border-[var(--border-color)] rounded text-[var(--text-secondary)]">
                    {item.category}
                  </span>
                  {item.sentiment === 'positive' && <TrendingUp size={14} className="text-emerald-500" />}
                  {item.sentiment === 'negative' && <TrendingDown size={14} className="text-rose-500" />}
                  {item.sentiment === 'neutral' && <Minus size={14} className="text-amber-500" />}
                </div>
                <h4 className="font-bold leading-tight group-hover:text-emerald-500 transition-colors">
                  {item.title}
                </h4>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                  {item.summary}
                </p>
              </div>
              <div className="p-2 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                <ExternalLink size={16} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedNews && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--bg-secondary)] border border-[var(--border-color)] w-full max-w-2xl rounded-sm shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 p-2 text-[var(--text-secondary)] hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest border border-[var(--border-color)] px-2 py-1 flex items-center gap-1 text-[var(--text-secondary)]">
                    {selectedNews.category}
                  </span>
                  {selectedNews.sentiment === 'positive' && <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-emerald-500 border border-emerald-500/30 px-2 py-1"><TrendingUp size={12} /> Bullish</span>}
                  {selectedNews.sentiment === 'negative' && <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-red-500 border border-red-500/30 px-2 py-1"><TrendingDown size={12} /> Bearish</span>}
                  {selectedNews.sentiment === 'neutral' && <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-yellow-500 border border-yellow-500/30 px-2 py-1"><Minus size={12} /> Neutral</span>}
                </div>

                <h2 className="text-xl md:text-2xl font-bold mb-4 leading-tight text-[var(--text-primary)]">{selectedNews.title}</h2>

                <div className="prose prose-invert max-w-none">
                  <p className="text-[var(--text-secondary)] leading-relaxed text-sm md:text-base">
                    {selectedNews.summary}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[var(--border-color)] flex justify-between items-center">
                  <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                    <Clock size={14} />
                    Published Today
                  </span>
                  <div className="flex items-center gap-3">
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(selectedNews.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                      Read More <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
