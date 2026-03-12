import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, Time, CandlestickSeries } from 'lightweight-charts';
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
        if (!chartContainerRef.current) return null;

        if (chartInstanceRef.current) {
            chartInstanceRef.current.remove();
            chartInstanceRef.current = null;
        }

        const container = chartContainerRef.current;

        // Ensure dimensions are positive
        const width = container.clientWidth > 0 ? container.clientWidth : 800;
        const height = container.clientHeight > 0 ? container.clientHeight : 450;

        const textColor = isDark ? '#94a3b8' : '#64748b';
        const borderColor = isDark ? '#334155' : '#e2e8f0';
        const gridColor = isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(226, 232, 240, 0.5)';
        const bgColor = isDark ? '#0f172a' : '#ffffff';

        try {
            console.log('[Chart] Starting createChart');
            const chart = createChart(container, {
                layout: {
                    background: { type: ColorType.Solid, color: bgColor },
                    textColor: textColor,
                },
                grid: {
                    vertLines: { color: gridColor },
                    horzLines: { color: gridColor },
                },
                width,
                height,
                timeScale: {
                    borderColor: borderColor,
                    timeVisible: true,
                    secondsVisible: false,
                },
            });

            console.log('[Chart] addSeries with CandlestickSeries');
            const series = chart.addSeries(CandlestickSeries, {
                upColor: '#22c55e',
                downColor: '#ef4444',
                borderVisible: false,
                wickUpColor: '#22c55e',
                wickDownColor: '#ef4444',
            });
            console.log('[Chart] Series created:', series);

            chartInstanceRef.current = chart;
            seriesRef.current = series;
            return chart;
        } catch (e: any) {
            console.error('[Chart] Init Error:', e);
            setError(`Initialize Error: ${e.message}`);
            return null;
        }
    }, [isDark]);

    useEffect(() => {
        // Wait for container to be rendered with height > 0
        let retries = 0;
        let chart: IChartApi | null = null;
        let isMounted = true;

        const attemptInit = () => {
            if (!isMounted) return;
            try {
                if (chartContainerRef.current?.clientHeight && chartContainerRef.current.clientHeight > 0) {
                    chart = initChart();
                    if (chart) startSync(chart);
                    else setLoading(false);
                } else if (retries < 10) {
                    retries++;
                    setTimeout(attemptInit, 100);
                } else {
                    // Force init with fallback if still 0
                    chart = initChart();
                    if (chart) startSync(chart);
                    else setLoading(false);
                }
            } catch (err: any) {
                console.error('[Chart] Init Attempt Error:', err);
                if (isMounted) {
                    setError(`Init Failed: ${err.message}`);
                    setLoading(false);
                }
            }
        };

        const startSync = async (c: IChartApi) => {
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
                        .map(item => ({
                            time: (typeof item.time === 'number' && item.time > 1000000000000) 
                                ? Math.floor(item.time / 1000) as Time 
                                : Number(item.time) as Time,
                            open: Number(item.open),
                            high: Number(item.high),
                            low: Number(item.low),
                            close: Number(item.close)
                        }))
                        .sort((a, b) => (a.time as number) - (b.time as number))
                        .filter((item, index, self) =>
                            index === 0 || (item.time as number) > (self[index - 1].time as number)
                        ) as CandlestickData<Time>[];

                    if (cleanData.length > 0) {
                        seriesRef.current.setData(cleanData);
                        c.timeScale().fitContent();
                        setDebugInfo(prev => ({ ...prev, points: cleanData.length }));
                    } else {
                        setError('No valid data points found after processing.');
                    }
                } else {
                    setError('Market currently unreachable or no data for this period.');
                }
            } catch (err: any) {
                console.error('[Chart] Sync Failed:', err);
                if (isMounted) {
                    setError(err.response?.data?.details || err.message || 'Sync Link Broken');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };


        attemptInit();

        const handleResize = () => {
            if (isMounted && chart && chartContainerRef.current) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight
                });
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        if (chartContainerRef.current) resizeObserver.observe(chartContainerRef.current);

        return () => {
            isMounted = false;
            resizeObserver.disconnect();
            if (chart) {
                try {
                   chart.remove();
                } catch(e) {}
            }
        };
    }, [symbol, interval, initChart, retryCount]);

    return (
        <div className="relative w-full h-full min-h-[300px] flex flex-col bg-[#0f172a] rounded-xl overflow-hidden group shadow-2xl">
            {loading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <div className="p-5 bg-slate-900 rounded-2xl border border-white/5 flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-60">Initializing v5 Engine</span>
                    </div>
                </div>
            )}

            {error && !loading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6 text-center">
                    <div className="max-w-sm w-full p-8 bg-slate-900 rounded-3xl border border-red-500/20 shadow-2xl">
                        <AlertCircle className="w-12 h-12 text-red-500/50 mb-6 mx-auto" />
                        <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">Sync Offline</h3>
                        <p className="text-xs text-slate-400 mb-8 leading-relaxed">
                            {error}
                        </p>
                        <button
                            onClick={() => setRetryCount(prev => prev + 1)}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all transform active:scale-95 shadow-lg shadow-blue-600/30"
                        >
                            <RefreshCw size={16} />
                            Force Reconnect
                        </button>
                    </div>
                </div>
            )}

            <div
                ref={chartContainerRef}
                className="w-full"
                style={{ height: '450px', minHeight: '450px' }}
            />

            <div className="absolute bottom-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="flex items-center gap-3 px-3 py-1.5 bg-black/80 rounded-lg border border-white/10 text-[9px] font-mono text-white/40">
                    <span className="text-emerald-500 font-bold">{symbol}</span>
                    <span className="truncate max-w-[150px]">{debugInfo.url}</span>
                    <span>{debugInfo.points} pts</span>
                </div>
            </div>
        </div>
    );
};

export default CustomAdvancedChart;
