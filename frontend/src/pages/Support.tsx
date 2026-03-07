import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    MessageCircle, Mail, Phone, BookOpen, ChevronDown, ChevronUp,
    HelpCircle, Zap, Shield, BarChart3, Send, CheckCircle,
    Bot, FileText, AlertCircle, X
} from 'lucide-react';
import { useAuth } from '../App';

interface Faq { q: string; a: string; topics: string[] }

const allFaqs: Faq[] = [
    {
        q: 'How do I add money to my trading account?',
        a: 'Go to the Funds tab from the navigation bar and click "Deposit". Enter the amount you want to add and confirm. Your balance updates instantly on the Dashboard.',
        topics: ['Account & Balance'],
    },
    {
        q: 'Why is my balance not updating after a trade?',
        a: 'Your balance refreshes automatically every 8 seconds. Navigate away and back to the Dashboard to force an immediate refresh. If the issue persists, contact support.',
        topics: ['Account & Balance', 'Trading & Orders'],
    },
    {
        q: 'How do I set up a SIP (Systematic Investment Plan)?',
        a: 'Go to the SIPs tab, click "Create SIP", select a stock symbol, enter the investment amount, choose frequency (Weekly/Monthly), and set a start date. Your SIP runs automatically.',
        topics: ['SIP & Automation'],
    },
    {
        q: 'What is the difference between Available Cash and Total Portfolio?',
        a: 'Available Cash is money you have not yet invested. Total Portfolio = Available Cash + the current value of all stocks you hold. Both update in real time.',
        topics: ['Account & Balance'],
    },
    {
        q: 'How do I cancel or pause a SIP?',
        a: 'Go to the SIPs tab, find your active SIP, and click the "Cancel" or "Pause" button. Cancelled SIPs stop immediately with no further deductions.',
        topics: ['SIP & Automation'],
    },
    {
        q: 'How do I buy or sell a stock?',
        a: 'Open the Market tab, search for a stock symbol (e.g., RELIANCE), view its price chart, and click "Buy" or "Sell". Enter the quantity and confirm the trade.',
        topics: ['Trading & Orders'],
    },
    {
        q: 'Is my account and data secure?',
        a: 'Yes. We use bank-grade JWT authentication, bcrypt password hashing, and all API traffic is encrypted over HTTPS. Never share your OTP or password with anyone.',
        topics: ['Security'],
    },
    {
        q: 'How does the AI chatbot work?',
        a: "The chatbot is powered by Google Gemini AI. Click the green chat bubble (bottom right) to ask any question about trading, stocks, technical analysis, or platform features. It's available 24/7.",
        topics: ['AI & Chatbot'],
    },
    {
        q: 'How do I read the portfolio trend chart?',
        a: 'The chart shows a 7-day trend based on your portfolio value. The line transitions from indigo to emerald as the week progresses. Hover any point to see the exact portfolio value.',
        topics: ['Account & Balance'],
    },
    {
        q: 'Something is broken — how do I report an issue?',
        a: 'Use the "Send a Message" form below, or email us at support@stockify.in with a description of the issue and any screenshots. Our team responds within 24 hours.',
        topics: ['Report an Issue'],
    },
];

const topicConfig = [
    { label: 'Account & Balance', icon: <Zap size={18} />, color: 'text-blue-500 bg-blue-500/10', active: 'border-blue-500 bg-blue-500/10 text-blue-500' },
    { label: 'Trading & Orders', icon: <BarChart3 size={18} />, color: 'text-emerald-500 bg-emerald-500/10', active: 'border-emerald-500 bg-emerald-500/10 text-emerald-500' },
    { label: 'Security', icon: <Shield size={18} />, color: 'text-violet-500 bg-violet-500/10', active: 'border-violet-500 bg-violet-500/10 text-violet-500' },
    { label: 'AI & Chatbot', icon: <Bot size={18} />, color: 'text-orange-500 bg-orange-500/10', active: 'border-orange-500 bg-orange-500/10 text-orange-500' },
    { label: 'SIP & Automation', icon: <FileText size={18} />, color: 'text-cyan-500 bg-cyan-500/10', active: 'border-cyan-500 bg-cyan-500/10 text-cyan-500' },
    { label: 'Report an Issue', icon: <AlertCircle size={18} />, color: 'text-rose-500 bg-rose-500/10', active: 'border-rose-500 bg-rose-500/10 text-rose-500' },
];

export default function Support() {
    const { setActiveTab } = useAuth();
    const [activeTopic, setActiveTopic] = useState<string | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formTopic, setFormTopic] = useState('');
    const [formMessage, setFormMessage] = useState('');
    const [sent, setSent] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const visibleFaqs = activeTopic ? allFaqs.filter(f => f.topics.includes(activeTopic)) : allFaqs;

    const handleTopicClick = (label: string) => {
        setActiveTopic(prev => prev === label ? null : label);
        setOpenFaq(null); // reset open accordion
        // Scroll to FAQ section
        document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1200));
        setSent(true);
        setFormLoading(false);
        setFormName(''); setFormEmail(''); setFormTopic(''); setFormMessage('');
        setTimeout(() => setSent(false), 6000);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto">

            {/* Hero */}
            <div className="relative overflow-hidden rounded-3xl text-white shadow-2xl px-8 py-10"
                style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #1e3a5f 50%, #0f766e 100%)' }}>
                <div className="absolute w-64 h-64 rounded-full -top-20 -right-20 opacity-20"
                    style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
                <div className="relative z-10 text-center">
                    <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                        <HelpCircle size={28} />
                    </div>
                    <h1 className="text-3xl font-extrabold mb-2">How can we help?</h1>
                    <p className="text-blue-100/75 text-sm max-w-md mx-auto">
                        Browse topics, read FAQs, or reach out to our team. Stockify AI is also available 24/7.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 mt-5">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 transition-all rounded-xl px-5 py-2 text-sm font-medium">
                            <Bot size={16} /> Ask AI Chatbot
                        </button>
                        <a href="mailto:support@stockify.in"
                            className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 transition-all rounded-xl px-5 py-2 text-sm font-medium">
                            <Mail size={16} /> Email Support
                        </a>
                        <a href="tel:+911800202585"
                            className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 transition-all rounded-xl px-5 py-2 text-sm font-medium">
                            <Phone size={16} /> Call Us
                        </a>
                    </div>
                </div>
            </div>

            {/* Topics */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-bold text-[var(--text-primary)]">Browse by Topic</h2>
                    {activeTopic && (
                        <button onClick={() => { setActiveTopic(null); setOpenFaq(null); }}
                            className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                            <X size={12} /> Clear filter
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {topicConfig.map((t, i) => {
                        const isActive = activeTopic === t.label;
                        return (
                            <motion.button key={t.label}
                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                                whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                                onClick={() => handleTopicClick(t.label)}
                                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${isActive ? `${t.active} border-2` : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--text-secondary)]'}`}>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.color}`}>{t.icon}</div>
                                <div>
                                    <span className="text-sm font-semibold text-[var(--text-primary)] block">{t.label}</span>
                                    {isActive && <span className="text-[10px] text-[var(--text-muted)]">{visibleFaqs.length} article{visibleFaqs.length !== 1 ? 's' : ''}</span>}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* FAQ */}
            <div id="faq-section">
                <h2 className="text-base font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-500" />
                    {activeTopic ? `${activeTopic} — Help Articles` : 'Frequently Asked Questions'}
                    <span className="text-xs font-normal text-[var(--text-muted)] ml-1">({visibleFaqs.length})</span>
                </h2>
                <AnimatePresence mode="wait">
                    <motion.div key={activeTopic || 'all'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="space-y-2">
                        {visibleFaqs.length === 0 ? (
                            <div className="text-center py-10 text-[var(--text-muted)] text-sm">No articles found for this topic yet.</div>
                        ) : visibleFaqs.map((faq, i) => (
                            <div key={i} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden">
                                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[var(--bg-primary)] transition-colors">
                                    <span className="text-sm font-semibold text-[var(--text-primary)] pr-4">{faq.q}</span>
                                    {openFaq === i ? <ChevronUp size={16} className="text-[var(--text-muted)] shrink-0" />
                                        : <ChevronDown size={16} className="text-[var(--text-muted)] shrink-0" />}
                                </button>
                                <AnimatePresence>
                                    {openFaq === i && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                                            className="px-5 pb-4 text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-color)] pt-3">
                                            {faq.a}
                                            <div className="flex gap-1 mt-3">
                                                {faq.topics.map(tp => (
                                                    <span key={tp} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">{tp}</span>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Info */}
                <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 space-y-5">
                    <h2 className="text-base font-bold text-[var(--text-primary)]">Contact Us</h2>
                    <p className="text-sm text-[var(--text-secondary)]">Support available Mon–Fri, 9AM–6PM IST.</p>

                    <a href="mailto:support@stockify.in" className="flex items-start gap-3 group">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-blue-500 bg-blue-500/10 shrink-0 group-hover:bg-blue-500/20 transition-colors">
                            <Mail size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text-muted)] font-medium mb-0.5">Email</p>
                            <p className="text-sm font-semibold text-blue-500 group-hover:underline">support@stockify.in</p>
                        </div>
                    </a>

                    <a href="tel:+911800202585" className="flex items-start gap-3 group">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-emerald-500 bg-emerald-500/10 shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                            <Phone size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text-muted)] font-medium mb-0.5">Phone (Toll Free)</p>
                            <p className="text-sm font-semibold text-emerald-500 group-hover:underline">+91 1800-202-5858</p>
                        </div>
                    </a>

                    <button onClick={() => setActiveTab('dashboard')} className="flex items-start gap-3 group w-full text-left">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-violet-500 bg-violet-500/10 shrink-0 group-hover:bg-violet-500/20 transition-colors">
                            <MessageCircle size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text-muted)] font-medium mb-0.5">AI Live Chat</p>
                            <p className="text-sm font-semibold text-violet-500 group-hover:underline">Open Stockify AI Chatbot →</p>
                        </div>
                    </button>

                    <div className="pt-3 border-t border-[var(--border-color)]">
                        <p className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">Quick Links</p>
                        <div className="space-y-1.5">
                            {[
                                { label: '📘 Academy — Learn Trading', tab: 'guide' },
                                { label: '📊 View My Portfolio', tab: 'portfolio' },
                                { label: '💰 Deposit Funds', tab: 'funds' },
                                { label: '🔄 Set up a SIP', tab: 'sip' },
                            ].map(l => (
                                <button key={l.tab} onClick={() => setActiveTab(l.tab)}
                                    className="block text-sm text-blue-500 hover:underline text-left w-full">{l.label}</button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6">
                    <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">Send a Message</h2>
                    <AnimatePresence mode="wait">
                        {sent ? (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col items-center text-center py-8 gap-3">
                                <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                    <CheckCircle size={28} className="text-emerald-500" />
                                </div>
                                <h3 className="text-base font-bold text-[var(--text-primary)]">Message Sent! ✅</h3>
                                <p className="text-sm text-[var(--text-secondary)]">Our team will respond within 24 hours at your email address.</p>
                                <button onClick={() => setSent(false)} className="mt-2 text-sm text-blue-500 hover:underline">Send another message</button>
                            </motion.div>
                        ) : (
                            <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onSubmit={handleSubmit} className="space-y-3">
                                <div>
                                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">Your Name *</label>
                                    <input required value={formName} onChange={e => setFormName(e.target.value)} placeholder="John Doe"
                                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">Email Address *</label>
                                    <input required type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="you@example.com"
                                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-blue-500 transition-colors" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">Topic</label>
                                    <select value={formTopic} onChange={e => setFormTopic(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-blue-500 transition-colors text-[var(--text-primary)]">
                                        <option value="">Select a topic...</option>
                                        {topicConfig.map(t => <option key={t.label} value={t.label}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">Message *</label>
                                    <textarea required rows={4} value={formMessage} onChange={e => setFormMessage(e.target.value)}
                                        placeholder="Describe your issue or question in detail..."
                                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none" />
                                </div>
                                <motion.button type="submit" disabled={formLoading}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold rounded-xl text-sm shadow-lg disabled:opacity-60">
                                    {formLoading ? (
                                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                                    ) : (
                                        <><Send size={15} /> Send Message</>
                                    )}
                                </motion.button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
