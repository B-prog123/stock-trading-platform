import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import axios from 'axios';
import { apiUrl } from '../lib/api';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface CustomAdvancedChartProps {
    symbol: string;
    interval: string;
    theme: 'light' | 'dark';
}

const CustomAdvancedChart: React.FC<CustomAdvancedChartProps> = ({ symbol, interval, theme }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const seriesRef = useRef<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const isDark = theme === 'dark';

    useEffect(() => {
        if (!chartContainerRef.current) return;

        console.log(`[Chart] Initializing for ${symbol} | theme: ${theme}`);

        const textColor = isDark ? '#94a3b8' : '#64748b';
        const borderColor = isDark ? '#334155' : '#e2e8f0';
        const gridColor = isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(226, 232, 240, 0.5)';
        const bgColor = isDark ? '#0f172a' : '#ffffff';

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: bgColor },
                textColor: textColor,
            },
            grid: {
                vertLines: { color: gridColor },
                horzLines: { color: gridColor },
            },
            width: chartContainerRef.current.clientWidth || 600,
            height: 400,
            timeScale: {
                borderColor: borderColor,
                timeVisible: true,
                secondsVisible: false,
                rightOffset: 5,
            },
            rightPriceScale: {
                borderColor: borderColor,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1,
                },
            },
            crosshair: {
                mode: 0,
                vertLine: { width: 1, color: '#6366f1', style: 2 },
                horzLine: { width: 1, color: '#6366f1', style: 2 },
            },
        }) as any;

        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });

        chartRef.current = chart;
        seriesRef.current = candlestickSeries;

        const resizeObserver = new ResizeObserver(entries => {
            if (entries.length === 0 || !chartRef.current) return;
            const { width } = entries[0].contentRect;
            chartRef.current.applyOptions({ width });
        });

        resizeObserver.observe(chartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
            chart.remove();
            chartRef.current = null;
            seriesRef.current = null;
        };
    }, [theme, isDark]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const targetUrl = apiUrl('/api/historical');
                console.log(`[Chart] Fetching data for ${symbol} from ${targetUrl}`);

                const response = await axios.get(targetUrl, {
                    params: { symbol, interval }
                });

                if (!seriesRef.current) {
                    console.warn('[Chart] Series not initialized yet');
                    return;
                }

                if (Array.isArray(response.data) && response.data.length > 0) {
                    // Pre-process data: Sort by time and remove duplicates
                    const cleanData = response.data
                        .map(item => ({
                            ...item,
                            time: Number(item.time)
                        }))
                        .sort((a, b) => a.time - b.time)
                        .filter((item, index, self) =>
                            index === 0 || item.time > self[index - 1].time
                        );

                    console.log(`[Chart] Successfully loaded ${cleanData.length} data points`);
                    seriesRef.current.setData(cleanData);
                    chartRef.current?.timeScale().fitContent();
                } else {
                    console.warn('[Chart] Received empty data array');
                    setError('No historical data found for this symbol/interval');
                }
            } catch (err: any) {
                console.error('[Chart] Fetch error:', err);
                setError(err.response?.data?.details || 'Check your internet connection or try again later');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [symbol, interval, retryCount]);

    return (
        <div className="relative w-full h-full min-h-[400px] flex flex-col bg-[var(--bg-primary)] rounded-xl overflow-hidden">
            {loading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <div className="p-4 bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-color)] flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                        <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-tighter">Syncing Market Data...</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6 text-center">
                    <div className="max-w-sm p-8 bg-[var(--bg-secondary)] rounded-3xl border border-red-500/20 shadow-2xl">
                        <AlertCircle className="w-12 h-12 text-red-500 mb-4 mx-auto" />
                        <h3 className="text-lg font-black text-[var(--text-primary)] mb-2 uppercase tracking-tight">Chart Sync Failed</h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                            {error}
                        </p>
                        <button
                            onClick={() => setRetryCount(prev => prev + 1)}
                            className="flex items-center gap-2 mx-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all transform active:scale-95 shadow-lg shadow-blue-600/20"
                        >
                            <RefreshCw size={16} />
                            Retry Sync
                        </button>
                    </div>
                </div>
            )}

            <div ref={chartContainerRef} className="flex-1 w-full min-h-[400px]" />
        </div>
    );
};

export default CustomAdvancedChart;
