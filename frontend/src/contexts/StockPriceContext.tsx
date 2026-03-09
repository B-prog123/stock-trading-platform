import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { apiUrl } from '../lib/api';

export interface LivePrice {
    price: number;
    change: number;
}

type PriceMap = Record<string, LivePrice>;

interface StockPriceContextValue {
    prices: PriceMap;
    lastUpdated: Date | null;
}

const StockPriceContext = createContext<StockPriceContextValue>({ prices: {}, lastUpdated: null });

// All symbols the app tracks by default (Indian NIFTY 50 stocks)
export const ALL_SYMBOLS = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK',
    'SBIN', 'WIPRO', 'ADANIENT', 'ITC', 'L&T',
];

// Yahoo Finance uses .NS suffix for NSE-listed Indian stocks
const toYahooSymbol = (s: string) => {
    if (s === 'L&T') return 'LT.NS';
    return `${s}.NS`;
};

const POLL_INTERVAL_MS = 15000; // 15 seconds

export function StockPriceProvider({ children }: { children: React.ReactNode }) {
    const [prices, setPrices] = useState<PriceMap>({});
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    // Track "open" price (first fetch) per symbol so we can compute % change from day-start
    const openPrices = useRef<Record<string, number>>({});

    const fetchPrices = async () => {
        try {
            const yahooSymbols = ALL_SYMBOLS.map(toYahooSymbol);
            const params = yahooSymbols.join(',');
            const res = await fetch(apiUrl(`/api/prices?symbols=${encodeURIComponent(params)}`));
            if (!res.ok) return;
            const data: Record<string, { price: number; change: number }> = await res.json();

            // Map Yahoo symbols back to our app symbols
            const mapped: PriceMap = {};
            for (const appSym of ALL_SYMBOLS) {
                const yahooSym = toYahooSymbol(appSym);
                const entry = data[yahooSym] ?? data[appSym];
                if (!entry) continue;
                // Store open price on first fetch
                if (!openPrices.current[appSym]) {
                    openPrices.current[appSym] = entry.price;
                }
                // If Yahoo returns a real change %, use it; otherwise compute from open
                const change = entry.change !== 0
                    ? entry.change
                    : openPrices.current[appSym] > 0
                        ? parseFloat((((entry.price - openPrices.current[appSym]) / openPrices.current[appSym]) * 100).toFixed(2))
                        : 0;
                mapped[appSym] = { price: entry.price, change };
            }

            if (Object.keys(mapped).length > 0) {
                setPrices(prev => ({ ...prev, ...mapped }));
                setLastUpdated(new Date());
            }
        } catch (err) {
            console.warn('StockPriceContext: fetch error', err);
        }
    };

    useEffect(() => {
        fetchPrices();
        const id = setInterval(fetchPrices, POLL_INTERVAL_MS);
        return () => clearInterval(id);
    }, []);

    return (
        <StockPriceContext.Provider value={{ prices, lastUpdated }}>
            {children}
        </StockPriceContext.Provider>
    );
}

/** Returns live prices from the shared context */
export function usePrices() {
    return useContext(StockPriceContext);
}

/** Helper: merge live prices into a static stock list */
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
