import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Square, TrendingUp, TrendingDown, DollarSign, Activity, Trophy, X, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, YAxis } from 'recharts';

interface ChartPoint {
    time: number;
    price: number;
}

export default function TradingGame() {
    const [gameState, setGameState] = useState<'start' | 'playing' | 'end'>('start');
    const [balance, setBalance] = useState(10000);
    const [shares, setShares] = useState(0);
    const [currentPrice, setCurrentPrice] = useState(100);
    const [history, setHistory] = useState<ChartPoint[]>([{ time: 0, price: 100 }]);
    const [timeLeft, setTimeLeft] = useState(60);
    const [volatility, setVolatility] = useState(1);
    const [trades, setTrades] = useState(0);
    const [trend, setTrend] = useState<'bull' | 'bear' | 'flat'>('flat');

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const tickRef = useRef<NodeJS.Timeout | null>(null);

    // Core Game Loop
    useEffect(() => {
        if (gameState === 'playing') {
            // 1-second countdown timer
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        endGame();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // Fast-paced price ticker (every 200ms)
            tickRef.current = setInterval(() => {
                setCurrentPrice((prevPrice) => {
                    // Dynamic trend shifts
                    const trendFactor = trend === 'bull' ? 0.3 : trend === 'bear' ? -0.3 : 0;
                    const randomShift = (Math.random() - 0.5) * 2 * volatility;
                    const change = randomShift + trendFactor;

                    let nextPrice = prevPrice + change;
                    if (nextPrice < 1) nextPrice = 1; // Prevent going to 0

                    // Add to history
                    setHistory(prev => {
                        const nextTime = (prev[prev.length - 1]?.time || 0) + 0.2;
                        const newHistory = [...prev, { time: nextTime, price: nextPrice }];
                        // Keep only last 30 seconds of data (150 ticks at 200ms)
                        if (newHistory.length > 150) return newHistory.slice(newHistory.length - 150);
                        return newHistory;
                    });

                    return nextPrice;
                });
            }, 200);

            // Randomly change trend and volatility every few seconds
            const metaInterval = setInterval(() => {
                const trends: ('bull' | 'bear' | 'flat')[] = ['bull', 'bear', 'flat'];
                setTrend(trends[Math.floor(Math.random() * trends.length)]);
                setVolatility(Math.random() * 2 + 0.5); // Between 0.5 and 2.5
            }, 3000);

            return () => {
                if (timerRef.current) clearInterval(timerRef.current);
                if (tickRef.current) clearInterval(tickRef.current);
                clearInterval(metaInterval);
            };
        }
    }, [gameState, trend, volatility]);

    const startGame = () => {
        setGameState('playing');
        setBalance(10000);
        setShares(0);
        setCurrentPrice(100);
        setHistory([{ time: 0, price: 100 }]);
        setTimeLeft(60);
        setVolatility(1);
        setTrades(0);
        setTrend('flat');
    };

    const endGame = () => {
        setGameState('end');
        if (timerRef.current) clearInterval(timerRef.current);
        if (tickRef.current) clearInterval(tickRef.current);

        // Auto-liquidate shares at current price at end of game
        setBalance(prev => {
            const finalVal = prev + (shares * currentPrice);
            return finalVal;
        });
        setShares(0);
    };

    const buy = () => {
        if (gameState !== 'playing' || balance <= 0) return;
        const maxShares = Math.floor(balance / currentPrice);
        if (maxShares <= 0) return;

        setShares(prev => prev + maxShares);
        setBalance(prev => prev - (maxShares * currentPrice));
        setTrades(prev => prev + 1);
    };

    const sell = () => {
        if (gameState !== 'playing' || shares <= 0) return;

        setBalance(prev => prev + (shares * currentPrice));
        setShares(0);
        setTrades(prev => prev + 1);
    };

    const portfolioValue = balance + (shares * currentPrice);
    const profitLoss = portfolioValue - 10000;
    const isProfit = profitLoss >= 0;

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] max-w-5xl mx-auto w-full pb-10">
            <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black mb-1 text-gradient flex items-center gap-3">
                        <Trophy className="text-amber-500" size={32} />
                        60-Second Trader
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)]">Experience the rush of fast-paced day trading. Start with $10,000 and try to beat the market before time runs out!</p>
                </div>
                {gameState === 'playing' && (
                    <div className="flex items-center gap-4">
                        <div className="bg-[var(--bg-secondary)] px-4 py-2 rounded-xl border border-[var(--border-color)]">
                            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest block mb-0.5">Time Left</span>
                            <span className={`text-2xl font-black font-mono ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-[var(--text-primary)]'}`}>
                                00:{timeLeft.toString().padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                )}
            </header>

            <div className="flex-1 glass-card border-[var(--border-color)] overflow-hidden relative flex flex-col">
                <AnimatePresence mode="wait">

                    {/* ── START SCREEN ── */}
                    {gameState === 'start' && (
                        <motion.div
                            key="start"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--bg-primary)] p-6 text-center"
                        >
                            <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                                <Activity size={48} className="text-blue-500" />
                            </div>
                            <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2">Ready to Trade?</h3>
                            <p className="text-[var(--text-secondary)] max-w-md mb-8">
                                You have exactly 60 seconds and $10,000 in virtual cash. The asset price will fluctuate rapidly. Buy low, sell high. Auto-liquidate at 0:00.
                            </p>
                            <button
                                onClick={startGame}
                                className="neo-button px-12 py-4 rounded-2xl bg-blue-600 text-white font-black text-lg hover:bg-blue-500 transition-all flex items-center gap-3 shadow-xl shadow-blue-600/20"
                            >
                                <Play fill="currentColor" size={20} />
                                START CHALLENGE
                            </button>
                        </motion.div>
                    )}

                    {/* ── PLAYING SCREEN ── */}
                    {gameState === 'playing' && (
                        <motion.div
                            key="playing"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col pt-6 h-full"
                        >
                            {/* TOP STATS */}
                            <div className="px-6 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                                    <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mb-1">Total Net Worth</p>
                                    <p className="text-xl font-mono font-black text-[var(--text-primary)]">${portfolioValue.toFixed(2)}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                                    <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mb-1">Cash Balance</p>
                                    <p className="text-xl font-mono font-black text-[var(--text-primary)]">${balance.toFixed(2)}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                                    <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mb-1">Shares Held</p>
                                    <p className="text-xl font-mono font-black text-[var(--text-primary)]">{shares}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                                    <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mb-1">P&L</p>
                                    <p className={`text-xl font-mono font-black ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {isProfit ? '+' : ''}${profitLoss.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {/* CHART AREA */}
                            <div className="flex-1 relative min-h-[300px] w-full px-6">
                                <div className="absolute top-4 left-10 z-10">
                                    <span className="text-4xl font-black font-mono text-[var(--text-primary)] tracking-tight">
                                        ${currentPrice.toFixed(2)}
                                    </span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${trend === 'bull' ? 'bg-emerald-500/20 text-emerald-500' : trend === 'bear' ? 'bg-rose-500/20 text-rose-500' : 'bg-[var(--text-muted)]/20 text-[var(--text-secondary)]'}`}>
                                            {trend} Market
                                        </span>
                                        <span className="text-[10px] text-[var(--text-muted)] font-bold flex items-center gap-1">
                                            <Activity size={12} /> Volatility: {volatility.toFixed(1)}x
                                        </span>
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={history} margin={{ top: 80, right: 0, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gameChartGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                                        <Area type="stepAfter" dataKey="price" stroke="#3b82f6" strokeWidth={4} fill="url(#gameChartGrad)" isAnimationActive={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* CONTROLS */}
                            <div className="p-6 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] grid grid-cols-2 gap-4">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={buy}
                                    disabled={balance < currentPrice}
                                    className="py-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-2xl flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                                >
                                    <span>BUY ALL</span>
                                    <span className="text-xs font-medium opacity-80 uppercase tracking-widest font-sans">Use max cash</span>
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={sell}
                                    disabled={shares === 0}
                                    className="py-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-2xl flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50 shadow-lg shadow-rose-500/20"
                                >
                                    <span>SELL ALL</span>
                                    <span className="text-xs font-medium opacity-80 uppercase tracking-widest font-sans">Liquidate shares</span>
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── END SCREEN ── */}
                    {gameState === 'end' && (
                        <motion.div
                            key="end"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--bg-primary)] p-6 text-center"
                        >
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl ${isProfit ? 'bg-emerald-500/20 shadow-emerald-500/20' : 'bg-rose-500/20 shadow-rose-500/20'}`}>
                                {isProfit ? <TrendingUp size={48} className="text-emerald-500" /> : <TrendingDown size={48} className="text-rose-500" />}
                            </div>

                            <h3 className="text-3xl font-black text-[var(--text-primary)] mb-2">Time's Up!</h3>
                            <p className="text-[var(--text-secondary)] mb-8">Here is how you performed in the market.</p>

                            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-8 mb-8 w-full max-w-sm">
                                <div className="text-center mb-6 border-b border-[var(--border-color)] pb-6">
                                    <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest mb-2">Final Net Worth</p>
                                    <p className="text-5xl font-mono font-black text-[var(--text-primary)] tracking-tight">${balance.toFixed(2)}</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-[var(--text-secondary)] font-medium">Net Profit / Loss</span>
                                        <span className={`text-lg font-mono font-bold ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {isProfit ? '+' : ''}${profitLoss.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-[var(--text-secondary)] font-medium">Return on Investment</span>
                                        <span className={`text-lg font-mono font-bold ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {isProfit ? '+' : ''}{((profitLoss / 10000) * 100).toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-[var(--text-secondary)] font-medium">Total Trades Executed</span>
                                        <span className="text-lg font-mono font-bold text-[var(--text-primary)]">
                                            {trades}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={startGame}
                                    className="px-8 py-4 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold hover:opacity-90 transition-all flex items-center gap-2"
                                >
                                    <RefreshCw size={18} />
                                    Play Again
                                </button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
