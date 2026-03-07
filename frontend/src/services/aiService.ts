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
      contents: "Generate 5 realistic and diverse stock market news headlines for today. Each item should have: title, summary, category (e.g., Tech, Energy, Macro), and sentiment (positive, negative, neutral). Return as JSON array.",
      config: { responseMimeType: "application/json" }
    });

    if (!response.text) return [];
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI News generation error:", error);
    return [
      { title: "Market shows resilience amid inflation data", summary: "Stocks remained steady as investors processed the latest consumer price index report.", category: "Macro", sentiment: "neutral" },
      { title: "Tech giants lead rally in afternoon trading", summary: "Major technology companies saw gains as bond yields retreated.", category: "Tech", sentiment: "positive" },
      { title: "Energy sector faces headwinds", summary: "Oil prices dropped following reports of increased production.", category: "Energy", sentiment: "negative" },
      { title: "Retail sales beat expectations", summary: "Consumer spending remained strong in the latest quarter, boosting retail stocks.", category: "Retail", sentiment: "positive" },
      { title: "Federal Reserve hints at rate cuts", summary: "The central bank indicated potential interest rate reductions later this year.", category: "Macro", sentiment: "positive" }
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
