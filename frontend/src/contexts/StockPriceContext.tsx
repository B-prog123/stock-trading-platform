import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { apiUrl } from '../lib/api';

export interface LivePrice {
    price: number;
    change: number; // percentage
}

type PriceMap = Record<string, LivePrice>;

interface StockPriceContextValue {
    prices: PriceMap;
    lastUpdated: Date | null;
    source: 'finnhub' | 'backend' | 'fallback';
}

const StockPriceContext = createContext<StockPriceContextValue>({
    prices: {},
    lastUpdated: null,
    source: 'fallback',
});

// All 10 Indian NSE stocks tracked by the app
export const ALL_SYMBOLS = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK',
    'SBIN', 'WIPRO', 'ADANIENT', 'ITC', 'L&T',
];

// Fallback realistic prices (used if all APIs fail)
const FALLBACK: PriceMap = {
    RELIANCE: { price: 2950.25, change: 1.25 },
    TCS: { price: 4120.64, change: -0.41 },
    HDFCBANK: { price: 1450.13, change: 2.82 },
    INFY: { price: 1680.72, change: 0.85 },
    ICICIBANK: { price: 1050.22, change: -0.12 },
    SBIN: { price: 780.42, change: 1.15 },
    WIPRO: { price: 452.10, change: -0.90 },
    ADANIENT: { price: 3100.50, change: 4.56 },
    ITC: { price: 430.15, change: 0.45 },
    'L&T': { price: 3450.80, change: 1.80 },
};

const FINNHUB_SYMBOL = (s: string) =>
    s === 'L&T' ? 'NSE:LT' : `NSE:${s}`;

const BACKEND_SYMBOL = (s: string) =>
    s === 'L&T' ? 'LT.NS' : `${s}.NS`;

const POLL_MS = 30000; // 30 seconds

// ─── Fetch via Finnhub (browser → Finnhub directly, CORS-enabled) ───────────
async function fetchViaFinnhub(apiKey: string): Promise<{ map: PriceMap; ok: boolean }> {
    const map: PriceMap = {};
    try {
        const results = await Promise.allSettled(
            ALL_SYMBOLS.map(async (sym) => {
                const res = await fetch(
                    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(FINNHUB_SYMBOL(sym))}&token=${apiKey}`,
                    { signal: AbortSignal.timeout(8000) }
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                // c = current, o = open, pc = previous close, dp = change %
                const price: number = data.c ?? 0;
                const prevClose: number = data.pc ?? 0;
                if (price <= 0) throw new Error('No price');
                const change = prevClose > 0
                    ? parseFloat(((price - prevClose) / prevClose * 100).toFixed(2))
                    : parseFloat((data.dp ?? 0).toFixed(2));
                map[sym] = { price, change };
            })
        );
        const successes = results.filter(r => r.status === 'fulfilled').length;
        return { map, ok: successes >= 5 }; // at least half succeeded
    } catch {
        return { map, ok: false };
    }
}

// ─── Fetch via backend (backend → yahoo-finance2) ────────────────────────────
async function fetchViaBackend(): Promise<{ map: PriceMap; ok: boolean }> {
    const map: PriceMap = {};
    try {
        const symbols = ALL_SYMBOLS.map(BACKEND_SYMBOL).join(',');
        const res = await fetch(apiUrl(`/api/prices?symbols=${encodeURIComponent(symbols)}`), {
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return { map, ok: false };
        const data: Record<string, { price: number; change: number }> = await res.json();
        for (const sym of ALL_SYMBOLS) {
            const entry = data[BACKEND_SYMBOL(sym)];
            if (entry && entry.price > 0) {
                map[sym] = { price: entry.price, change: entry.change };
            }
        }
        const ok = Object.keys(map).length >= 5;
        return { map, ok };
    } catch {
        return { map, ok: false };
    }
}

export function StockPriceProvider({ children }: { children: React.ReactNode }) {
    const [prices, setPrices] = useState<PriceMap>(FALLBACK);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [source, setSource] = useState<'finnhub' | 'backend' | 'fallback'>('fallback');
    const finnhubKey = import.meta.env.VITE_FINNHUB_KEY as string | undefined;

    const fetchPrices = async () => {
        // 1. Try Finnhub first (most reliable, runs in browser, no Render dependency)
        if (finnhubKey) {
            const { map, ok } = await fetchViaFinnhub(finnhubKey);
            if (ok) {
                setPrices(prev => ({ ...prev, ...map }));
                setLastUpdated(new Date());
                setSource('finnhub');
                return;
            }
        }

        // 2. Fall back to backend (yahoo-finance2 via Render)
        const { map, ok } = await fetchViaBackend();
        if (ok) {
            setPrices(prev => ({ ...prev, ...map }));
            setLastUpdated(new Date());
            setSource('backend');
            return;
        }

        // 3. Keep existing prices (FALLBACK already loaded as default state)
        setSource('fallback');
    };

    useEffect(() => {
        fetchPrices();
        const id = setInterval(fetchPrices, POLL_MS);
        return () => clearInterval(id);
    }, []);

    return (
        <StockPriceContext.Provider value={{ prices, lastUpdated, source }}>
            {children}
        </StockPriceContext.Provider>
    );
}

export function usePrices() {
    return useContext(StockPriceContext);
}

export function mergePrices<T extends { symbol: string; price: number; change: number }>(
    staticList: T[],
    prices: PriceMap
): T[] {
    return staticList.map(stock => {
        const live = prices[stock.symbol];
        if (!live) return stock;
        return { ...stock, price: live.price, change: live.change };
    });
}
