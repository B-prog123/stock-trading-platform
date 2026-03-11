import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
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
    const chartInstanceRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [debugInfo, setDebugInfo] = useState({ points: 0, url: '' });

    const isDark = theme === 'dark';

    const initChart = useCallback(() => {
        if (!chartContainerRef.current) return;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.remove();
        }

        const container = chartContainerRef.current;
        const textColor = isDark ? '#94a3b8' : '#64748b';
        const borderColor = isDark ? '#334155' : '#e2e8f0';
        const gridColor = isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(226, 232, 240, 0.5)';
        const bgColor = isDark ? '#0f172a' : '#ffffff';

        // Cast to any to handle type incompatibilities in initialization
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
            height: container.clientHeight || 450,
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
        } as any);

        const series = (chart as any).addCandlestickSeries({
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });

        chartInstanceRef.current = chart;
        seriesRef.current = series;

        return chart;
    }, [isDark]);

    useEffect(() => {
        const chart = initChart();
        if (!chart) return;

        let isMounted = true;
        const handleResize = () => {
            if (isMounted && chartContainerRef.current) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight
                });
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        if (chartContainerRef.current) resizeObserver.observe(chartContainerRef.current);

        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const targetUrl = apiUrl('/api/historical');
                setDebugInfo(prev => ({ ...prev, url: targetUrl }));

                const response = await axios.get(targetUrl, {
                    params: { symbol, interval }
                });

                if (!isMounted || !seriesRef.current) return;

                if (Array.isArray(response.data) && response.data.length > 0) {
                    const cleanData = response.data
                        .map(item => ({ ...item, time: Number(item.time) as Time }))
                        .sort((a, b) => (a.time as number) - (b.time as number))
                        .filter((item, index, self) =>
                            index === 0 || (item.time as number) > (self[index - 1].time as number)
                        ) as CandlestickData<Time>[];

                    seriesRef.current.setData(cleanData);
                    chart.timeScale().fitContent();
                    setDebugInfo(prev => ({ ...prev, points: cleanData.length }));
                    setError(null);
                } else {
                    setError('Market data currently unavailable for this stock.');
                }
            } catch (err: any) {
                console.error('[Chart] Sync Error:', err);
                if (isMounted) {
                    setError(err.response?.data?.details || err.message || 'Sync Failed');
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
        };
    }, [symbol, interval, initChart, retryCount]);

    return (
        <div className="relative w-full h-full min-h-[400px] flex flex-col bg-[var(--bg-primary)] rounded-xl overflow-hidden shadow-2xl group">
            {loading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <div className="p-5 bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-[var(--border-color)] flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                        <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest opacity-60">Syncing Engine</span>
                    </div>
                </div>
            )}

            {error && !loading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6 text-center">
                    <div className="max-w-sm w-full p-8 bg-[var(--bg-secondary)] rounded-3xl border border-red-500/20 shadow-2xl">
                        <AlertCircle className="w-12 h-12 text-red-500/50 mb-6 mx-auto" />
                        <h3 className="text-lg font-black text-[var(--text-primary)] mb-2 uppercase tracking-tight">Sync Offline</h3>
                        <p className="text-xs text-[var(--text-secondary)] mb-8 leading-relaxed opacity-70">
                            {error}
                        </p>
                        <button
                            onClick={() => setRetryCount(prev => prev + 1)}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all transform active:scale-95 shadow-lg shadow-blue-600/30"
                        >
                            <RefreshCw size={16} />
                            Retry Reconnect
                        </button>
                    </div>
                </div>
            )}

            <div ref={chartContainerRef} className="flex-1 w-full h-full" />

            <div className="absolute bottom-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="flex items-center gap-3 px-3 py-1.5 bg-black/80 rounded-lg border border-white/10 text-[9px] font-mono text-white/40">
                    <span className="text-emerald-500 font-bold">{symbol}</span>
                    <span className="truncate max-w-[100px]">{debugInfo.url}</span>
                    <span>{debugInfo.points} pts</span>
                </div>
            </div>
        </div>
    );
};

export default CustomAdvancedChart;
