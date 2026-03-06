export interface User {
  id: number;
  email: string;
  name: string;
  balance: number;
}

export interface PortfolioItem {
  userId: number;
  symbol: string;
  quantity: number;
  avgPrice: number;
}

export interface Transaction {
  id: number;
  userId: number;
  symbol: string;
  quantity: number;
  price: number;
  type: 'BUY' | 'SELL';
  date: string;
}

export interface StockRecommendation {
  symbol: string;
  name: string;
  reasoning: string;
  riskScore: number;
  trend: 'bullish' | 'bearish';
}

export interface PortfolioAnalysis {
  score: number;
  analysis: string;
  suggestions: string[];
}
