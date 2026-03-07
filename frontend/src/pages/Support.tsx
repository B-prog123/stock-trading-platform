import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
    MessageCircle, Mail, Phone, BookOpen, ChevronDown, ChevronUp,
    HelpCircle, Zap, Shield, BarChart3, Send, CheckCircle,
    Bot, FileText, AlertCircle
} from 'lucide-react';
import { useAuth } from '../App';

const faqs = [
    {
        q: 'How do I add money to my trading account?',
        a: 'Go to the Funds tab from the navigation bar and click "Deposit". Enter the amount you want to add and confirm. Your balance updates instantly on the Dashboard.',
    },
    {
        q: 'Why is my balance not updating after a trade?',
        a: 'Your balance refreshes automatically every 8 seconds. You can also navigate away and back to the Dashboard to force a refresh. If the issue persists, please contact support.',
    },
    {
        q: 'How do I set up a SIP (Systematic Investment Plan)?',
        a: 'Go to the SIPs tab, click "Create SIP", select a stock symbol, enter the investment amount, choose frequency (Weekly/Monthly), and set a start date. Your SIP runs automatically.',
    },
    {
        q: 'What is the difference between Available Cash and Total Portfolio?',
        a: 'Available Cash is the money you have not yet invested. Total Portfolio = Available Cash + the current value of all stocks you hold. Both update in real time.',
    },
    {
        q: 'How do I cancel a SIP?',
        a: 'Go to the SIPs tab, find your active SIP, and click the "Cancel" or "Pause" button. Cancelled SIPs stop immediately and no further deductions are made.',
    },
    {
        q: 'Can I buy fractional shares?',
        a: 'Yes! When you invest via a SIP, fractional shares are automatically calculated based on the stock price at execution time. For manual trades, enter whole number quantities.',
    },
    {
        q: 'How does the AI chatbot work?',
        a: "The chatbot is powered by Google's Gemini AI and has expertise in stock trading, technical analysis, SIPs, and platform features. Click the chat bubble icon in the bottom right corner to ask any question.",
    },
    {
        q: 'How do I read the portfolio trend chart on the Dashboard?',
        a: 'The chart shows a 7-day simulated trend based on your current portfolio value. The line goes from indigo (Monday) to emerald (Sunday), helping you visualize weekly growth direction.',
    },
];

const topics = [
    { icon: <Zap size={18} />, label: 'Account & Balance', color: 'text-blue-500 bg-blue-500/10' },
    { icon: <BarChart3 size={18} />, label: 'Trading & Orders', color: 'text-emerald-500 bg-emerald-500/10' },
    { icon: <Shield size={18} />, label: 'Security', color: 'text-violet-500 bg-violet-500/10' },
    { icon: <Bot size={18} />, label: 'AI & Chatbot', color: 'text-orange-500 bg-orange-500/10' },
    { icon: <FileText size={18} />, label: 'SIP & Automation', color: 'text-cyan-500 bg-cyan-500/10' },
    { icon: <AlertCircle size={18} />, label: 'Report an Issue', color: 'text-rose-500 bg-rose-500/10' },
];

export default function Support() {
    const { setActiveTab } = useAuth();
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
        setName(''); setEmail(''); setMessage('');
        setTimeout(() => setSent(false), 5000);
    };

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto">

            {/* Hero */}
            <div className="relative overflow-hidden rounded-3xl text-white shadow-2xl px-8 py-10"
                style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #1e3a5f 50%, #0f766e 100%)' }}>
                <div className="absolute w-64 h-64 rounded-full -top-20 -right-20 opacity-20"
                    style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
                <div className="relative z-10 text-center">
                    <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <HelpCircle size={28} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold mb-2">How can we help?</h1>
                    <p className="text-blue-100/75 text-sm max-w-md mx-auto">
                        Find answers to common questions, contact our team, or ask the Stockify AI chatbot — available 24/7.
                    </p>
                    <button onClick={() => setActiveTab('dashboard')}
                        className="mt-5 inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 transition-all rounded-xl px-5 py-2 text-sm font-medium">
                        <Bot size={16} /> Ask AI Chatbot Instead
                    </button>
                </div>
            </div>

            {/* Support Topics */}
            <div>
                <h2 className="text-base font-bold text-[var(--text-primary)] mb-3">Browse by Topic</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {topics.map((t, i) => (
                        <motion.button key={t.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-3 p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--text-secondary)] transition-all text-left">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.color}`}>{t.icon}</div>
                            <span className="text-sm font-semibold text-[var(--text-primary)]">{t.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* FAQ */}
            <div>
                <h2 className="text-base font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-500" /> Frequently Asked Questions
                </h2>
                <div className="space-y-2">
                    {faqs.map((faq, i) => (
                        <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                            className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden">
                            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[var(--bg-primary)] transition-colors">
                                <span className="text-sm font-semibold text-[var(--text-primary)] pr-4">{faq.q}</span>
                                {openFaq === i
                                    ? <ChevronUp size={16} className="text-[var(--text-muted)] shrink-0" />
                                    : <ChevronDown size={16} className="text-[var(--text-muted)] shrink-0" />}
                            </button>
                            {openFaq === i && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                    className="px-5 pb-4 text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-color)] pt-3">
                                    {faq.a}
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Contact Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Contact Info */}
                <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 space-y-5">
                    <h2 className="text-base font-bold text-[var(--text-primary)]">Contact Us</h2>
                    <p className="text-sm text-[var(--text-secondary)]">Our support team is available Monday–Friday, 9AM–6PM IST.</p>

                    {[
                        { icon: <Mail size={18} />, label: 'Email', value: 'support@stockify.in', color: 'text-blue-500 bg-blue-500/10' },
                        { icon: <Phone size={18} />, label: 'Phone', value: '+91 1800-202-5858 (Toll Free)', color: 'text-emerald-500 bg-emerald-500/10' },
                        { icon: <MessageCircle size={18} />, label: 'Live Chat', value: 'Use the AI chat bubble (bottom right)', color: 'text-violet-500 bg-violet-500/10' },
                    ].map(c => (
                        <div key={c.label} className="flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.color} shrink-0`}>{c.icon}</div>
                            <div>
                                <p className="text-xs text-[var(--text-muted)] font-medium mb-0.5">{c.label}</p>
                                <p className="text-sm font-semibold text-[var(--text-primary)]">{c.value}</p>
                            </div>
                        </div>
                    ))}

                    {/* Quick links */}
                    <div className="pt-3 border-t border-[var(--border-color)]">
                        <p className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">Quick Links</p>
                        <div className="space-y-1">
                            {[
                                { label: '📘 Academy — Learn Trading', tab: 'guide' },
                                { label: '💬 Ask AI Chatbot', tab: 'dashboard' },
                                { label: '📊 View My Portfolio', tab: 'portfolio' },
                            ].map(l => (
                                <button key={l.tab} onClick={() => setActiveTab(l.tab)}
                                    className="block text-sm text-blue-500 hover:underline text-left">
                                    {l.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6">
                    <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">Send a Message</h2>
                    {sent ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center text-center py-8 gap-3">
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                <CheckCircle size={28} className="text-emerald-500" />
                            </div>
                            <h3 className="text-base font-bold text-[var(--text-primary)]">Message Sent!</h3>
                            <p className="text-sm text-[var(--text-secondary)]">Our team will get back to you within 24 hours.</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">Your Name</label>
                                <input required value={name} onChange={e => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">Email Address</label>
                                <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">Message</label>
                                <textarea required rows={4} value={message} onChange={e => setMessage(e.target.value)}
                                    placeholder="Describe your issue or question in detail..."
                                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors resize-none" />
                            </div>
                            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold rounded-xl text-sm shadow-lg">
                                <Send size={15} /> Send Message
                            </motion.button>
                        </form>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
