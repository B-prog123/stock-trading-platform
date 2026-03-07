import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    TrendingUp, BarChart3, Eye, Wallet, RefreshCw,
    BookOpen, Bot, ChevronRight, ChevronLeft, X, Sparkles,
    ShieldCheck, PieChart, Bell, Award
} from 'lucide-react';

interface TutorialStep {
    icon: React.ReactNode;
    title: string;
    description: string;
    highlight: string;
    color: string;
    image?: string;
}

const steps: TutorialStep[] = [
    {
        icon: <TrendingUp size={36} />,
        title: 'Welcome to Stockify! 🎉',
        description: 'Your all-in-one intelligent trading platform. Track markets, manage your portfolio, set up SIPs, and get AI-powered insights — all in one place.',
        highlight: 'Start your investment journey today',
        color: 'from-blue-600 to-emerald-500',
    },
    {
        icon: <BarChart3 size={36} />,
        title: 'Market Watch',
        description: 'Browse live stock prices, view interactive charts, and place Buy or Sell orders in seconds. Search for any Indian stock by symbol like RELIANCE, TCS, or INFY.',
        highlight: 'Navigate to Market tab to explore',
        color: 'from-violet-600 to-blue-500',
    },
    {
        icon: <Eye size={36} />,
        title: 'Watchlist',
        description: 'Keep an eye on stocks you\'re interested in. Add any stock to your watchlist and track real-time price movements. Click any stock to trade it instantly.',
        highlight: 'Navigate to Watchlist tab',
        color: 'from-emerald-600 to-cyan-500',
    },
    {
        icon: <PieChart size={36} />,
        title: 'Your Portfolio',
        description: 'Monitor all your holdings, average buying prices, current values, and your total P&L (Profit & Loss). Your portfolio updates automatically after every trade.',
        highlight: 'Navigate to Portfolio tab',
        color: 'from-orange-500 to-pink-500',
    },
    {
        icon: <RefreshCw size={36} />,
        title: 'SIP — Auto Investing',
        description: 'Set up Systematic Investment Plans to invest a fixed amount automatically (weekly or monthly). This reduces market timing risk through rupee cost averaging.',
        highlight: 'Navigate to SIPs tab',
        color: 'from-cyan-600 to-blue-500',
    },
    {
        icon: <Wallet size={36} />,
        title: 'Funds & Balance',
        description: 'Deposit funds to your trading balance, track your available margin, and review transaction history. Your balance updates instantly after each trade.',
        highlight: 'Navigate to Funds tab',
        color: 'from-yellow-500 to-orange-500',
    },
    {
        icon: <Bot size={36} />,
        title: 'AI Chatbot Assistant',
        description: 'Got questions? Ask Stockify AI anything about trading, investing, candlestick charts, RSI, MACD, portfolio tips, or how to use any feature. Available 24/7.',
        highlight: 'Click the chat bubble button (bottom right)',
        color: 'from-emerald-500 to-teal-600',
    },
    {
        icon: <BookOpen size={36} />,
        title: 'Academy — Learn Trading',
        description: 'New to investing? Explore the Academy tab for visual explanations of candlestick charts, trading strategies, and step-by-step platform tutorials.',
        highlight: 'Navigate to Academy tab',
        color: 'from-purple-600 to-indigo-600',
    },
    {
        icon: <Bell size={36} />,
        title: 'Notifications & Alerts',
        description: 'Get notified when your trades execute, SIPs run, or portfolio hits milestones. The bell icon in the top bar shows all your recent alerts.',
        highlight: 'Click the Bell 🔔 icon in Navbar',
        color: 'from-rose-500 to-pink-600',
    },
    {
        icon: <Award size={36} />,
        title: "You're all set! 🚀",
        description: "You're ready to start trading on Stockify. Your account begins with a ₹10,000 balance to practice with. Explore, invest smart, and grow your wealth!",
        highlight: 'Click "Start Trading" to begin',
        color: 'from-blue-600 to-emerald-500',
    },
];

interface TutorialProps {
    onComplete: () => void;
}

export default function Tutorial({ onComplete }: TutorialProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(1);

    const goNext = () => {
        if (currentStep === steps.length - 1) {
            onComplete();
            return;
        }
        setDirection(1);
        setCurrentStep(s => s + 1);
    };

    const goPrev = () => {
        setDirection(-1);
        setCurrentStep(s => s - 1);
    };

    const step = steps[currentStep];
    const isLast = currentStep === steps.length - 1;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative w-full max-w-lg bg-[var(--bg-secondary)] rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] overflow-hidden"
            >
                {/* Skip button */}
                <button
                    onClick={onComplete}
                    className="absolute top-4 right-4 z-10 flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20"
                >
                    <X size={12} /> Skip Tour
                </button>

                {/* Gradient Hero */}
                <div className={`bg-gradient-to-br ${step.color} p-10 flex flex-col items-center text-center text-white relative overflow-hidden`}>
                    {/* Background decoration */}
                    <div className="absolute inset-0 opacity-10">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full bg-white"
                                style={{
                                    width: `${40 + i * 30}px`,
                                    height: `${40 + i * 30}px`,
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                }}
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
                            />
                        ))}
                    </div>

                    {/* Step counter */}
                    <div className="flex gap-1.5 mb-6 z-10">
                        {steps.map((_, i) => (
                            <motion.button
                                key={i}
                                onClick={() => { setDirection(i > currentStep ? 1 : -1); setCurrentStep(i); }}
                                animate={{ width: i === currentStep ? 24 : 6 }}
                                className={`h-1.5 rounded-full transition-colors ${i === currentStep ? 'bg-white' : 'bg-white/40'}`}
                            />
                        ))}
                    </div>

                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={currentStep}
                            custom={direction}
                            initial={{ opacity: 0, x: direction * 60 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: direction * -60 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center z-10"
                        >
                            {/* Icon with glow */}
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 shadow-[0_12px_40px_rgba(0,0,0,0.2)]"
                            >
                                {step.icon}
                            </motion.div>

                            <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
                            <p className="text-white/85 text-sm leading-relaxed max-w-xs">{step.description}</p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Bottom section */}
                <div className="p-6">
                    {/* Highlight tip */}
                    <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2.5 mb-6">
                        <Sparkles size={14} className="text-blue-400 shrink-0" />
                        <p className="text-xs text-blue-400 font-medium">{step.highlight}</p>
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex items-center gap-3">
                        {currentStep > 0 && (
                            <button
                                onClick={goPrev}
                                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-all text-sm font-medium"
                            >
                                <ChevronLeft size={16} /> Back
                            </button>
                        )}
                        <motion.button
                            onClick={goNext}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm bg-gradient-to-r ${step.color} shadow-lg transition-all`}
                        >
                            {isLast ? (
                                <>
                                    <ShieldCheck size={18} /> Start Trading
                                </>
                            ) : (
                                <>
                                    Next <ChevronRight size={16} />
                                </>
                            )}
                        </motion.button>
                    </div>

                    {/* Step indicator text */}
                    <p className="text-center text-xs text-[var(--text-muted)] mt-4">
                        Step {currentStep + 1} of {steps.length}
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
