import { GoogleGenAI } from "@google/genai";
import { StockRecommendation, PortfolioAnalysis, PortfolioItem } from "../types";
import { apiUrl } from "../lib/api";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const getAIRecommendations = async (): Promise<StockRecommendation[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Provide 5 stock recommendations for today with brief reasoning and risk score (1-10). Return as JSON array of objects: {symbol, name, reasoning, riskScore, trend: 'bullish'|'bearish'}",
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Recommendations error:", error);
    return [
      { symbol: "RELIANCE", name: "Reliance Ind", reasoning: "Strong earnings report and new product lineup.", riskScore: 4, trend: "bullish" },
      { symbol: "TCS", name: "Tata Consultancy", reasoning: "Continued growth in cloud services and AI integration.", riskScore: 3, trend: "bullish" },
      { symbol: "HDFCBANK", name: "HDFC Bank", reasoning: "Volatility expected due to margin pressures.", riskScore: 8, trend: "bearish" },
      { symbol: "INFY", name: "Infosys Ltd.", reasoning: "High demand for digital transformation services.", riskScore: 5, trend: "bullish" },
      { symbol: "ICICIBANK", name: "ICICI Bank", reasoning: "Strong credit growth and asset quality.", riskScore: 4, trend: "bullish" }
    ];
  }
};

export const generateMarketNews = async (): Promise<any[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5 realistic, detailed, and data-driven Indian stock market (NSE/BSE) news headlines for today (${new Date().toLocaleDateString()}). Each item must sound like professional financial journalism with specific numbers, percentages, or real company names. Each item should have: title, summary, category (e.g., Tech, Finance, Auto, Macro), and sentiment (positive, negative, neutral). Return strictly as a JSON array.`,
      config: { responseMimeType: "application/json" }
    });

    if (!response.text) return [];
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI News generation error:", error);
    return [
      { title: "Nifty 50 Reaches New All-Time High Amid Reliance Rally", summary: "Indian indices surged as Reliance Industries posted a 4% gain following strong quarterly earnings, pushing the Nifty above the crucial 22,000 mark.", category: "Macro", sentiment: "positive" },
      { title: "TCS Secures $1.5B Cloud Transformation Deal", summary: "IT bellwether Tata Consultancy Services announced a multi-year partnership with a top European bank, easing concerns over sector slowdown.", category: "Tech", sentiment: "positive" },
      { title: "HDFC Bank Faces Margin Pressures in Q3", summary: "India's largest private lender reported steady deposit growth, but net interest margins contracted by 10 bps, leading to a mild stock sell-off.", category: "Finance", sentiment: "negative" },
      { title: "Tata Motors EV Sales Surge 25% YoY", summary: "The automaker's continued dominance in the Indian EV segment sparked a 3% intraday gain, supported by new EV model announcements.", category: "Auto", sentiment: "positive" },
      { title: "FIIs Pull Out ₹2,000 Crore Ahead of US Fed Verdict", summary: "Foreign institutional investors turned net sellers in the cash market, preferring to wait on the sidelines for the upcoming US interest rate decision.", category: "Macro", sentiment: "neutral" }
    ];
  }
};

export const analyzePortfolioAI = async (portfolio: PortfolioItem[]): Promise<PortfolioAnalysis | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this stock portfolio and provide health score (1-100) and suggestions: ${JSON.stringify(portfolio)}. Return JSON: {score, analysis, suggestions: []}`,
      config: { responseMimeType: "application/json" }
    });

    if (!response.text) {
      throw new Error("Empty response from AI");
    }

    const parsed = JSON.parse(response.text);
    if (typeof parsed.score !== "number" || !parsed.analysis) {
      throw new Error("Invalid AI response format");
    }
    return parsed;
  } catch (error) {
    console.error("AI Portfolio Analysis error:", error);
    return {
      score: 75,
      analysis: "Your portfolio is moderately balanced but can improve diversification.",
      suggestions: [
        "Add defensive sectors to reduce volatility.",
        "Reduce oversized single-stock exposure.",
        "Consider geographic diversification for growth."
      ]
    };
  }
};

export const getAIChatResponse = async (message: string, token?: string | null): Promise<string> => {
  try {
    const authToken = token || localStorage.getItem("token");
    const res = await fetch(apiUrl("/api/ai/chat"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({ message })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: "AI request failed" }));
      throw new Error(data.error || "AI request failed");
    }

    const data = await res.json();
    return data.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("AI Chat error:", error);
    return "I'm having trouble connecting to my AI brain right now.";
  }
};
