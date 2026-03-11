import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import axios from 'axios';
import { apiUrl } from '../lib/api';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface CustomAdvancedChartProps {
    symbol: string;
    interval: string;
    theme: 'light' | 'dark';
}

const CustomAdvancedChart: React.FC<CustomAdvancedChartProps> = ({ symbol, interval, theme }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        let isMounted = true;
        const container = chartContainerRef.current;
        console.log(`[Chart] Syncing... ${symbol} (${interval}) | Theme: ${theme}`);

        const isDark = theme === 'dark';
        const textColor = isDark ? '#94a3b8' : '#64748b';
        const borderColor = isDark ? '#334155' : '#e2e8f0';
        const gridColor = isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(226, 232, 240, 0.5)';
        const bgColor = isDark ? '#0f172a' : '#ffffff';

        const chart = createChart(container, {
            layout: {
                background: { type: ColorType.Solid, color: bgColor },
                textColor: textColor,
            },
            grid: {
                vertLines: { color: gridColor },
                horzLines: { color: gridColor },
            },
            width: container.clientWidth || 800,
            height: 400,
            timeScale: {
                borderColor: borderColor,
                timeVisible: true,
                secondsVisible: false,
                rightOffset: 5,
            },
            rightPriceScale: {
                borderColor: borderColor,
                scaleMargins: { top: 0.1, bottom: 0.1 },
            },
            crosshair: {
                mode: 0,
                vertLine: { width: 1, color: '#6366f1', style: 2 },
                horzLine: { width: 1, color: '#6366f1', style: 2 },
            },
        }) as any;

        const series = chart.addCandlestickSeries({
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });

        const handleResize = () => {
            if (isMounted) {
                chart.applyOptions({ width: container.clientWidth });
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);

        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const targetUrl = apiUrl('/api/historical');
                const response = await axios.get(targetUrl, {
                    params: { symbol, interval }
                });

                if (!isMounted) return;

                if (Array.isArray(response.data) && response.data.length > 0) {
                    const cleanData = response.data
                        .map(item => ({ ...item, time: Number(item.time) }))
                        .sort((a, b) => a.time - b.time)
                        .filter((item, index, self) =>
                            index === 0 || item.time > self[index - 1].time
                        );

                    console.log(`[Chart] Loaded ${cleanData.length} points for ${symbol}`);
                    series.setData(cleanData);
                    chart.timeScale().fitContent();
                    setError(null);
                } else {
                    setError('Market is closed or data unavailable for this timeframe.');
                }
            } catch (err: any) {
                console.error('[Chart] Sync Error:', err);
                if (isMounted) {
                    setError(err.response?.data?.details || 'Failed to sync with market server. Check your connection.');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();

        return () => {
            isMounted = false;
            resizeObserver.disconnect();
            chart.remove();
            console.log(`[Chart] Cleaned up ${symbol}`);
        };
    }, [symbol, interval, theme, retryCount]);

    return (
        <div className="relative w-full h-full min-h-[400px] flex flex-col bg-[var(--bg-primary)] rounded-xl overflow-hidden shadow-2xl">
            {loading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <div className="p-5 bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-color)] flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                        <span className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest">Live Syncing...</span>
                    </div>
                </div>
            )}

            {error && !loading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6 text-center">
                    <div className="max-w-sm p-8 bg-[var(--bg-secondary)] rounded-3xl border border-red-500/20 shadow-2xl">
                        <AlertCircle className="w-12 h-12 text-red-500 mb-4 mx-auto opacity-50" />
                        <h3 className="text-lg font-black text-[var(--text-primary)] mb-2 uppercase tracking-tight">Market Offline</h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                            {error}
                        </p>
                        <button
                            onClick={() => setRetryCount(prev => prev + 1)}
                            className="flex items-center gap-2 mx-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all transform active:scale-95 shadow-lg shadow-indigo-600/30"
                        >
                            <RefreshCw size={16} />
                            Reconnect
                        </button>
                    </div>
                </div>
            )}

            <div ref={chartContainerRef} className="flex-1 w-full h-full" />
        </div>
    );
};

export default CustomAdvancedChart;
