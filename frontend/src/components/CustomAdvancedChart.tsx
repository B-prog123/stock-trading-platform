import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import axios from 'axios';
import { apiUrl } from '../lib/api';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface CustomAdvancedChartProps {
    symbol: string;
    interval: string;
    theme: 'light' | 'dark';
}

const CustomAdvancedChart: React.FC<CustomAdvancedChartProps> = ({ symbol, interval, theme }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        const isDark = theme === 'dark';

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: isDark ? '#94a3b8' : '#64748b',
            },
            grid: {
                vertLines: { color: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(226, 232, 240, 0.5)' },
                horzLines: { color: isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(226, 232, 240, 0.5)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            timeScale: {
                borderColor: isDark ? '#334155' : '#e2e8f0',
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderColor: isDark ? '#334155' : '#e2e8f0',
            },
            crosshair: {
                mode: 0,
                vertLine: {
                    width: 1,
                    color: '#6366f1',
                    style: 2,
                },
                horzLine: {
                    width: 1,
                    color: '#6366f1',
                    style: 2,
                },
            },
        });

        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });

        chartRef.current = chart;
        seriesRef.current = candlestickSeries;

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [theme]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${apiUrl}/api/historical`, {
                    params: { symbol, interval }
                });

                if (seriesRef.current && response.data.length > 0) {
                    seriesRef.current.setData(response.data);
                    chartRef.current?.timeScale().fitContent();
                } else if (response.data.length === 0) {
                    setError('No historical data available for this period');
                }
            } catch (err: any) {
                console.error('Error fetching historical data:', err);
                setError('Failed to fetch real-time chart data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [symbol, interval]);

    return (
        <div className="relative w-full h-full min-h-[400px]">
            {loading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--bg-primary)] bg-opacity-50 backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                    <span className="text-[var(--text-secondary)] font-medium">Loading historical data...</span>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--bg-primary)] p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{error}</h3>
                    <p className="text-[var(--text-secondary)] max-w-xs">
                        Try a different interval or check if the symbol is correct.
                    </p>
                </div>
            )}

            <div ref={chartContainerRef} className="w-full h-full" />
        </div>
    );
};

export default CustomAdvancedChart;
