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

// ─── Symbols ────────────────────────────────────────────────────────────────
const US_STOCKS = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN'];

export const ALL_SYMBOLS = [
    // NSE Stocks
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'WIPRO', 'ADANIENT', 'ITC', 'L&T',
    'BAJFINANCE', 'BHARTIARTL', 'ASIANPAINT', 'HCLTECH', 'MARUTI', 'KOTAKBANK', 'AXISBANK', 'TATAMOTORS',
    'HINDUNILVR', 'SUNPHARMA', 'ULTRACEMCO', 'NTPC', 'POWERGRID', 'ONGC', 'NESTLEIND', 'TITAN', 'TECHM',
    'GRASIM', 'TATASTEEL', 'JSWSTEEL', 'HINDALCO', 'INDUSINDBK', 'DIVISLAB', 'CIPLA', 'DRREDDY', 'APOLLOHOSP',
    'ADANIPORTS', 'ADANIGREEN', 'ADANIPOWER', 'TATAPOWER',
    'BAJAJFINSV', 'PIDILITIND', 'SIEMENS', 'HAL', 'BEL', 'IRFC', 'RECLTD', 'PFC', 'ZOMATO', 'NYKAA',
    'PAYTM', 'POLICYBZR', 'TRENT', 'DMART', 'BANDHANBNK', 'FEDERALBNK', 'IDFCFIRSTB', 'MUTHOOTFIN', 'CHOLAFIN',
    'LUPIN', 'BIOCON', 'AUROPHARMA', 'MAXHEALTH', 'BAJAJ-AUTO', 'HEROMOTOCO', 'MAHINDRA', 'EICHERMOT', 'MOTHERSON',
    'LTTS', 'PERSISTENT', 'COFORGE', 'MPHASIS', 'DLF', 'GODREJPROP', 'SOBHA', 'IRCTC', 'BRITANNIA', 'DABUR',
    'GODREJCP', 'MARICO', 'DEEPAKNTR', 'AARTIIND', 'PVRINOX', 'INDIGRID', 'INDUSTOWER',
    // US Stocks
    ...US_STOCKS
];

const BACKEND_SYMBOL = (s: string) => {
    if (US_STOCKS.includes(s)) return s;
    if (s === 'L&T') return 'LT.NS';
    if (s === 'BAJAJ-AUTO') return 'BAJAJ-AUTO.NS';
    return `${s}.NS`;
};

const POLL_MS = 30000; // 30 seconds



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
    const [prices, setPrices] = useState<PriceMap>({});
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [source, setSource] = useState<'backend' | 'fallback'>('fallback');

    const fetchPrices = async () => {
        // Fetch from our backend which uses yahoo-finance2
        const { map, ok } = await fetchViaBackend();
        if (ok) {
            setPrices(prev => ({ ...prev, ...map }));
            setLastUpdated(new Date());
            setSource('backend');
        } else {
            console.error("StockPriceContext: backend failed to return valid price map.");
        }
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
