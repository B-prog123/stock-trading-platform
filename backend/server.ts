import express from "express";
import cors from "cors";
import axios from "axios";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose, { Schema, Types } from "mongoose";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "../.env"), override: false });

const app = express();
const PORT = Number(process.env.PORT || 4000);
const MONGODB_URI = process.env.MONGODB_URI || "";
const FRONTEND_URL = process.env.FRONTEND_URL || "*";
const JWT_SECRET = process.env.JWT_SECRET || "stockify-secret-key";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const gemini = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

if (!MONGODB_URI || MONGODB_URI.includes("<username>") || MONGODB_URI.includes("<password>")) {
  console.error("Error: MONGODB_URI is missing or contains placeholder values (<username>, <password>).");
  console.error("Please update your .env file with a valid MongoDB connection string.");
  process.exit(1);
}

const normalizeOrigin = (value: string) => value.trim().replace(/\/$/, "");
const allowedOrigins = FRONTEND_URL === "*"
  ? "*"
  : FRONTEND_URL.split(",").map(normalizeOrigin).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins === "*") return callback(null, true);
    const normalized = normalizeOrigin(origin);
    if (Array.isArray(allowedOrigins) && allowedOrigins.includes(normalized)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json());

const fallbackPrices: Record<string, number> = { AAPL: 182.63, TSLA: 202.64, NVDA: 726.13, MSFT: 409.72, GOOGL: 147.22, AMZN: 174.42 };
const toISODate = (date: Date): string => date.toISOString().split("T")[0];
const parseISODate = (value: string): Date | null => {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
};
const getNextSipDate = (fromDate: Date, frequency: "WEEKLY" | "MONTHLY") => {
  const next = new Date(fromDate);
  if (frequency === "WEEKLY") next.setDate(next.getDate() + 7);
  else next.setMonth(next.getMonth() + 1);
  next.setHours(0, 0, 0, 0);
  return next;
};

const getCurrentStockPrice = async (symbol: string): Promise<number> => {
  const safeSymbol = symbol.trim().toUpperCase();
  try {
    const response = await axios.get("https://query1.finance.yahoo.com/v7/finance/quote", { params: { symbols: safeSymbol }, timeout: 5000 });
    const price = response?.data?.quoteResponse?.result?.[0]?.regularMarketPrice;
    if (typeof price === "number" && price > 0) return price;
  } catch (error) {
    console.error(`Price fallback for ${safeSymbol}:`, error);
  }
  return fallbackPrices[safeSymbol] || 100;
};

const UserSchema = new Schema({ email: { type: String, unique: true, required: true }, password: { type: String, required: true }, name: { type: String, required: true }, balance: { type: Number, default: 10000 } }, { timestamps: true });
const PortfolioSchema = new Schema({ userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, symbol: { type: String, required: true }, quantity: { type: Number, required: true }, avgPrice: { type: Number, required: true } }, { timestamps: true });
PortfolioSchema.index({ userId: 1, symbol: 1 }, { unique: true });
const WatchlistSchema = new Schema({ userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, symbol: { type: String, required: true } }, { timestamps: true });
WatchlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });
const AlertSchema = new Schema({ userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, symbol: { type: String, required: true }, targetPrice: { type: Number, required: true }, type: { type: String, enum: ["ABOVE", "BELOW"], required: true }, active: { type: Boolean, default: true } }, { timestamps: true });
const TransactionSchema = new Schema({ userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, symbol: { type: String, required: true }, quantity: { type: Number, required: true }, price: { type: Number, required: true }, type: { type: String, enum: ["BUY", "SELL"], required: true }, source: { type: String, enum: ["MANUAL", "SIP"], default: "MANUAL" }, sipOrderId: { type: Schema.Types.ObjectId, ref: "SipOrder" }, date: { type: Date, default: Date.now } }, { timestamps: true });
const SipOrderSchema = new Schema({ userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, stockSymbol: { type: String, required: true }, investmentAmount: { type: Number, required: true }, frequency: { type: String, enum: ["WEEKLY", "MONTHLY"], required: true }, startDate: { type: String, required: true }, endDate: { type: String, default: null }, totalInvested: { type: Number, default: 0 }, totalShares: { type: Number, default: 0 }, status: { type: String, enum: ["ACTIVE", "PAUSED", "CANCELLED", "COMPLETED"], default: "ACTIVE" }, nextRunDate: { type: String, default: null }, lastExecutedAt: { type: String, default: null } }, { timestamps: true });
const SipExecutionSchema = new Schema({ sipId: { type: Schema.Types.ObjectId, ref: "SipOrder", required: true }, userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, stockSymbol: { type: String, required: true }, scheduledDate: { type: String, required: true }, executedAt: { type: Date, default: Date.now }, price: Number, amount: Number, shares: Number, status: { type: String, enum: ["SUCCESS", "FAILED"], required: true }, error: { type: String, default: null } }, { timestamps: true });
const SipNotificationSchema = new Schema({ userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, sipId: { type: Schema.Types.ObjectId, ref: "SipOrder" }, type: { type: String, enum: ["EXECUTED", "COMPLETED", "FAILED"], required: true }, message: { type: String, required: true }, read: { type: Boolean, default: false }, createdAt: { type: Date, default: Date.now } });

const User = mongoose.model("User", UserSchema);
const Portfolio = mongoose.model("Portfolio", PortfolioSchema);
const Watchlist = mongoose.model("Watchlist", WatchlistSchema);
const Alert = mongoose.model("Alert", AlertSchema);
const Transaction = mongoose.model("Transaction", TransactionSchema);
const SipOrder = mongoose.model("SipOrder", SipOrderSchema);
const SipExecution = mongoose.model("SipExecution", SipExecutionSchema);
const SipNotification = mongoose.model("SipNotification", SipNotificationSchema);

const toObjectId = (id: string) => new Types.ObjectId(id);

const STOCKIFY_SYSTEM_PROMPT = "You are Stockify AI, an expert stock market assistant. Help users with: stock trading strategies, technical analysis (RSI, MACD, candlesticks, moving averages), fundamental analysis (P/E ratio, EPS), portfolio management, diversification, risk management, SIP investments, Indian markets (NSE, BSE, NIFTY 50, SENSEX), and Stockify platform features (Watchlist, Portfolio, Market Watch, SIPs, Funds, Orders). Give clear, educational, actionable answers.";

const stockTradingFAQ: { keywords: string[]; answer: string }[] = [
  { keywords: ["start trading", "begin", "beginner", "new to", "first trade"], answer: "To start trading: 1) Add funds via Funds tab. 2) Research in Market Watch. 3) Add to Watchlist. 4) Start small (1-2% per trade). 5) Always set stop-loss. Visit Academy tab to learn charts." },
  { keywords: ["risk", "stop loss", "drawdown", "manage risk", "loss"], answer: "Risk management: Risk max 1-2% per trade. Set stop-loss before entering. Diversify sectors. Never trade emotionally. Track P&L in Portfolio tab." },
  { keywords: ["diversify", "allocation", "concentration", "spread"], answer: "Invest across Tech, Finance, Energy, FMCG. Max 10-15% in one stock. Use SIPs for systematic multi-stock investing. Review monthly in Portfolio tab." },
  { keywords: ["sip", "systematic investment", "monthly invest", "auto invest", "rupee cost"], answer: "SIP invests fixed amounts periodically, reducing risk via rupee cost averaging. Go to SIPs tab, enter stock symbol, amount, frequency, start date to create one." },
  { keywords: ["candlestick", "candle", "chart pattern"], answer: "Candlesticks: Green = price up, Red = price down. Key patterns: Doji (indecision), Hammer (reversal), Engulfing (trend change). See Academy tab for tutorials." },
  { keywords: ["buy", "when to buy", "entry point", "purchase"], answer: "Buy signals: 1) Price breaks resistance with volume. 2) RSI below 30 (oversold). 3) Golden Cross (50MA above 200MA). Check Market Watch for live prices." },
  { keywords: ["sell", "when to sell", "exit", "take profit"], answer: "Sell when: 1) Price target achieved. 2) Stop-loss triggered. 3) Fundamentals worsen. 4) RSI above 70 (overbought). Always plan exit before entry." },
  { keywords: ["nifty", "sensex", "index", "market index", "benchmark"], answer: "NIFTY 50 = top 50 NSE companies. SENSEX = top 30 BSE companies. Market health benchmarks. Track live on Dashboard." },
  { keywords: ["pe ratio", "p/e", "valuation", "price to earnings"], answer: "P/E = Price / EPS. Lower P/E may mean undervalued. Sector avg: FMCG ~50, Banks ~15-20, IT ~25-30. Compare within same sector only." },
  { keywords: ["moving average", "sma", "ema", "50 day", "200 day", "golden cross", "death cross"], answer: "Golden Cross (50MA above 200MA) = bullish. Death Cross (50MA below 200MA) = bearish. EMA responds faster than SMA." },
  { keywords: ["rsi", "relative strength", "overbought", "oversold"], answer: "RSI: Above 70 = overbought (consider selling). Below 30 = oversold (consider buying). 40-60 = neutral. Confirm with price action." },
  { keywords: ["macd", "momentum", "signal line"], answer: "MACD: Bullish when crosses above signal line. Bearish when crosses below. Use alongside RSI for confirmation." },
  { keywords: ["watchlist", "track stock", "watch list"], answer: "In Watchlist tab, search by symbol (RELIANCE, TCS), add to track real-time prices. Click any stock to open Market Watch for charts and trading." },
  { keywords: ["balance", "wallet", "funds", "deposit", "add money"], answer: "Add funds via Funds tab. Balance shows on Dashboard as Available Margin. Buying decreases balance, selling increases it automatically." },
  { keywords: ["order", "transaction", "history", "orders"], answer: "All buy/sell orders are logged in Orders tab with symbol, quantity, price, and type (BUY/SELL or SIP source)." },
  { keywords: ["portfolio", "holdings", "profit", "loss", "pnl"], answer: "Portfolio tab shows holdings, average price, current value, and P&L. Dashboard shows total portfolio value and balance combined." },
];

const getSmartFallback = (message: string): string => {
  const msg = message.toLowerCase();
  const match = stockTradingFAQ.find(item => item.keywords.some(k => msg.includes(k)));
  if (match) return match.answer;
  return "I can help with stock trading, chart analysis, portfolio management, SIP investments, and Stockify platform features. Try asking: 'How to read candlestick charts?', 'What is RSI?', 'How do I create a SIP?', or 'When should I buy a stock?'";
};

const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
const createSipNotification = async (userId: string, sipId: string, type: "EXECUTED" | "COMPLETED" | "FAILED", message: string) => {
  await SipNotification.create({ userId: toObjectId(userId), sipId: toObjectId(sipId), type, message });
};

const executeDueSip = async (sip: any) => {
  const scheduledDate = parseISODate(sip.nextRunDate);
  if (!scheduledDate) return;

  const endDate = sip.endDate ? parseISODate(sip.endDate) : null;
  if (endDate && scheduledDate > endDate) {
    sip.status = "COMPLETED";
    sip.nextRunDate = null;
    await sip.save();
    await createSipNotification(String(sip.userId), String(sip._id), "COMPLETED", `SIP for ${sip.stockSymbol} is completed.`);
    return;
  }

  const stockPrice = await getCurrentStockPrice(sip.stockSymbol);
  if (!stockPrice || stockPrice <= 0) {
    sip.nextRunDate = toISODate(getNextSipDate(scheduledDate, sip.frequency));
    await sip.save();
    await SipExecution.create({ sipId: sip._id, userId: sip.userId, stockSymbol: sip.stockSymbol, scheduledDate: sip.nextRunDate, status: "FAILED", error: "Unable to fetch stock price" });
    await createSipNotification(String(sip.userId), String(sip._id), "FAILED", `SIP for ${sip.stockSymbol} failed: stock price unavailable.`);
    return;
  }

  const user: any = await User.findById(sip.userId);
  if (!user || user.balance < sip.investmentAmount) {
    sip.nextRunDate = toISODate(getNextSipDate(scheduledDate, sip.frequency));
    await sip.save();
    await SipExecution.create({ sipId: sip._id, userId: sip.userId, stockSymbol: sip.stockSymbol, scheduledDate: sip.nextRunDate, price: stockPrice, amount: sip.investmentAmount, status: "FAILED", error: "Insufficient wallet balance" });
    await createSipNotification(String(sip.userId), String(sip._id), "FAILED", `SIP for ${sip.stockSymbol} failed due to insufficient balance.`);
    return;
  }

  const shares = parseFloat((sip.investmentAmount / stockPrice).toFixed(6));
  const nextRun = getNextSipDate(scheduledDate, sip.frequency);
  const shouldComplete = endDate && nextRun > endDate;

  user.balance -= sip.investmentAmount;
  await user.save();

  const holding: any = await Portfolio.findOne({ userId: sip.userId, symbol: sip.stockSymbol });
  if (holding) {
    const newQty = holding.quantity + shares;
    holding.avgPrice = ((holding.avgPrice * holding.quantity) + (stockPrice * shares)) / newQty;
    holding.quantity = newQty;
    await holding.save();
  } else {
    await Portfolio.create({ userId: sip.userId, symbol: sip.stockSymbol, quantity: shares, avgPrice: stockPrice });
  }

  await Transaction.create({ userId: sip.userId, symbol: sip.stockSymbol, quantity: shares, price: stockPrice, type: "BUY", source: "SIP", sipOrderId: sip._id });
  await SipExecution.create({ sipId: sip._id, userId: sip.userId, stockSymbol: sip.stockSymbol, scheduledDate: sip.nextRunDate, price: stockPrice, amount: sip.investmentAmount, shares, status: "SUCCESS" });

  sip.totalInvested += sip.investmentAmount;
  sip.totalShares += shares;
  sip.lastExecutedAt = toISODate(scheduledDate);
  sip.nextRunDate = shouldComplete ? null : toISODate(nextRun);
  sip.status = shouldComplete ? "COMPLETED" : "ACTIVE";
  await sip.save();

  await createSipNotification(String(sip.userId), String(sip._id), "EXECUTED", `SIP executed for ${sip.stockSymbol}: ₹${sip.investmentAmount.toFixed(2)} invested.`);
  if (shouldComplete) await createSipNotification(String(sip.userId), String(sip._id), "COMPLETED", `SIP for ${sip.stockSymbol} has reached its end date and is now completed.`);
};

const processDueSips = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueSips = await SipOrder.find({ status: "ACTIVE", nextRunDate: { $ne: null, $lte: toISODate(today) } }).sort({ nextRunDate: 1 });
  for (const sip of dueSips) await executeDueSip(sip);
};

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, name });
    res.status(201).json({ id: String(user._id) });
  } catch {
    res.status(400).json({ error: "Email already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user: any = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: String(user._id), email: user.email }, JWT_SECRET);
  res.json({ token, user: { id: String(user._id), email: user.email, name: user.name, balance: user.balance, phone: user.phone || "" } });
});





app.get("/api/user/profile", authenticateToken, async (req: any, res) => {
  const user: any = await User.findById(req.user.id).select("_id email name balance");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ id: String(user._id), email: user.email, name: user.name, balance: user.balance });
});

app.put("/api/user/profile", authenticateToken, async (req: any, res) => {
  if (typeof req.body.name !== "string" || !req.body.name.trim()) return res.status(400).json({ error: "Invalid name" });
  const user: any = await User.findByIdAndUpdate(req.user.id, { name: req.body.name.trim() }, { new: true }).select("_id email name balance");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ id: String(user._id), email: user.email, name: user.name, balance: user.balance });
});

app.post("/api/user/wallet/deposit", authenticateToken, async (req: any, res) => {
  if (typeof req.body.amount !== "number" || req.body.amount <= 0) return res.status(400).json({ error: "Invalid deposit amount" });
  const user: any = await User.findByIdAndUpdate(req.user.id, { $inc: { balance: req.body.amount } }, { new: true }).select("balance");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ balance: user.balance });
});

app.get("/api/portfolio", authenticateToken, async (req: any, res) => {
  const rows = await Portfolio.find({ userId: req.user.id }).lean();
  res.json(rows.map((r: any) => ({ userId: String(r.userId), symbol: r.symbol, quantity: r.quantity, avgPrice: r.avgPrice })));
});

app.get("/api/portfolio/performance", authenticateToken, async (req: any, res) => {
  const rows: any[] = await Portfolio.find({ userId: req.user.id }).lean();
  const items = await Promise.all(rows.map(async (item) => {
    const currentPrice = await getCurrentStockPrice(item.symbol);
    const investedValue = item.quantity * item.avgPrice;
    const currentValue = item.quantity * currentPrice;
    const profitLoss = currentValue - investedValue;
    return { symbol: item.symbol, quantity: item.quantity, avgPrice: item.avgPrice, currentPrice, investedValue, currentValue, profitLoss, profitLossPercent: investedValue > 0 ? (profitLoss / investedValue) * 100 : 0 };
  }));
  const totals = items.reduce((acc, i) => ({ investedValue: acc.investedValue + i.investedValue, currentValue: acc.currentValue + i.currentValue, profitLoss: acc.profitLoss + i.profitLoss }), { investedValue: 0, currentValue: 0, profitLoss: 0 });
  res.json({ items, totals: { ...totals, profitLossPercent: totals.investedValue > 0 ? (totals.profitLoss / totals.investedValue) * 100 : 0 } });
});

app.get("/api/portfolio/breakdown", authenticateToken, async (req: any, res) => {
  const manualRows = await Transaction.find({ userId: req.user.id, type: "BUY", $or: [{ source: "MANUAL" }, { source: { $exists: false } }] }).lean();
  const sipRows = await SipExecution.find({ userId: req.user.id, status: "SUCCESS" }).lean();
  const manualInvested = manualRows.reduce((acc, t: any) => acc + (t.quantity * t.price), 0);
  const sipInvested = sipRows.reduce((acc, t: any) => acc + (t.amount || 0), 0);
  res.json({ manualInvested, sipInvested });
});
app.post("/api/trade", authenticateToken, async (req: any, res) => {
  const { symbol, quantity, price, type } = req.body;
  if (!symbol || typeof quantity !== "number" || quantity <= 0 || typeof price !== "number" || !["BUY", "SELL"].includes(type)) {
    return res.status(400).json({ error: "Invalid trade parameters" });
  }

  const user: any = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (type === "BUY") {
    const totalCost = quantity * price;
    if (user.balance < totalCost) return res.status(400).json({ error: "Insufficient balance" });
    user.balance -= totalCost;
    await user.save();

    const existing: any = await Portfolio.findOne({ userId: req.user.id, symbol });
    if (existing) {
      const newQty = existing.quantity + quantity;
      existing.avgPrice = (existing.avgPrice * existing.quantity + price * quantity) / newQty;
      existing.quantity = newQty;
      await existing.save();
    } else {
      await Portfolio.create({ userId: req.user.id, symbol, quantity, avgPrice: price });
    }

    await Transaction.create({ userId: req.user.id, symbol, quantity, price, type: "BUY", source: "MANUAL" });
  } else {
    const existing: any = await Portfolio.findOne({ userId: req.user.id, symbol });
    if (!existing || existing.quantity < quantity) return res.status(400).json({ error: "Insufficient stock quantity" });

    user.balance += quantity * price;
    await user.save();

    const newQty = existing.quantity - quantity;
    if (newQty === 0) await Portfolio.deleteOne({ _id: existing._id });
    else {
      existing.quantity = newQty;
      await existing.save();
    }

    await Transaction.create({ userId: req.user.id, symbol, quantity, price, type: "SELL", source: "MANUAL" });
  }

  res.json({ success: true });
});

app.get("/api/transactions", authenticateToken, async (req: any, res) => {
  const rows = await Transaction.find({ userId: req.user.id }).sort({ date: -1 }).lean();
  res.json(rows.map((r: any) => ({ id: String(r._id), symbol: r.symbol, quantity: r.quantity, price: r.price, type: r.type, source: r.source || "MANUAL", date: r.date })));
});

app.get("/api/sip/notifications", authenticateToken, async (req: any, res) => {
  const afterId = req.query.afterId as string | undefined;
  const filter: any = { userId: req.user.id };
  if (afterId && Types.ObjectId.isValid(afterId)) filter._id = { $gt: new Types.ObjectId(afterId) };
  const rows = await SipNotification.find(filter).sort({ _id: 1 }).limit(30).lean();
  res.json(rows.map((r: any) => ({ id: String(r._id), type: r.type, message: r.message, read: r.read, createdAt: r.createdAt, sipId: r.sipId ? String(r.sipId) : null })));
});

app.patch("/api/sip/notifications/read", authenticateToken, async (req: any, res) => {
  await SipNotification.updateMany({ userId: req.user.id, read: false }, { $set: { read: true } });
  res.json({ success: true });
});

app.get("/api/sip", authenticateToken, async (req: any, res) => {
  const rows = await SipOrder.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
  res.json(rows.map((r: any) => ({ ...r, id: String(r._id), _id: undefined })));
});

app.get("/api/sip/dashboard", authenticateToken, async (req: any, res) => {
  const sips: any[] = await SipOrder.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
  let currentValue = 0;
  for (const sip of sips) {
    if (!sip.totalShares || sip.totalShares <= 0) continue;
    const price = await getCurrentStockPrice(sip.stockSymbol);
    currentValue += sip.totalShares * price;
  }
  const totalInvested = sips.reduce((acc, s: any) => acc + (s.totalInvested || 0), 0);
  const totalShares = sips.reduce((acc, s: any) => acc + (s.totalShares || 0), 0);
  res.json({ sips: sips.map((s: any) => ({ ...s, id: String(s._id), _id: undefined })), summary: { activeSips: sips.filter((s) => s.status === "ACTIVE").length, totalInvested, totalShares, profitLoss: currentValue - totalInvested } });
});

app.get("/api/sip/:id", authenticateToken, async (req: any, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid SIP id" });
  const sip: any = await SipOrder.findOne({ _id: req.params.id, userId: req.user.id }).lean();
  if (!sip) return res.status(404).json({ error: "SIP not found" });
  const history = await SipExecution.find({ sipId: req.params.id, userId: req.user.id }).sort({ executedAt: -1 }).lean();
  res.json({ sip: { ...sip, id: String(sip._id), _id: undefined }, history: history.map((h: any) => ({ ...h, id: String(h._id), _id: undefined })) });
});

app.post("/api/sip", authenticateToken, async (req: any, res) => {
  const { stockSymbol, investmentAmount, frequency, startDate, endDate } = req.body;
  const symbol = String(stockSymbol || "").trim().toUpperCase();
  if (!symbol || !/^[A-Z.]{1,10}$/.test(symbol)) return res.status(400).json({ error: "Invalid stock symbol" });
  if (typeof investmentAmount !== "number" || investmentAmount <= 0) return res.status(400).json({ error: "Investment amount must be greater than 0" });
  if (!["WEEKLY", "MONTHLY"].includes(frequency)) return res.status(400).json({ error: "Invalid SIP frequency" });

  const parsedStart = parseISODate(startDate);
  if (!parsedStart) return res.status(400).json({ error: "Invalid start date" });
  const parsedEnd = endDate ? parseISODate(endDate) : null;
  if (endDate && !parsedEnd) return res.status(400).json({ error: "Invalid end date" });
  if (parsedEnd && parsedEnd < parsedStart) return res.status(400).json({ error: "End date must be on or after start date" });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  let nextRunDate = new Date(parsedStart);
  while (nextRunDate < today) nextRunDate = getNextSipDate(nextRunDate, frequency);

  const created: any = await SipOrder.create({ userId: req.user.id, stockSymbol: symbol, investmentAmount, frequency, startDate: toISODate(parsedStart), endDate: parsedEnd ? toISODate(parsedEnd) : null, nextRunDate: toISODate(nextRunDate) });
  res.status(201).json({ ...created.toObject(), id: String(created._id), _id: undefined });
});

app.put("/api/sip/:id", authenticateToken, async (req: any, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid SIP id" });
  const sip: any = await SipOrder.findOne({ _id: req.params.id, userId: req.user.id });
  if (!sip) return res.status(404).json({ error: "SIP not found" });

  const symbol = req.body.stockSymbol ? String(req.body.stockSymbol).trim().toUpperCase() : sip.stockSymbol;
  const newAmount = typeof req.body.investmentAmount === "number" ? req.body.investmentAmount : sip.investmentAmount;
  const newFreq = req.body.frequency || sip.frequency;
  const newStatus = req.body.status || sip.status;
  if (!symbol || !/^[A-Z.]{1,10}$/.test(symbol)) return res.status(400).json({ error: "Invalid stock symbol" });
  if (typeof newAmount !== "number" || newAmount <= 0) return res.status(400).json({ error: "Invalid amount" });
  if (!["WEEKLY", "MONTHLY"].includes(newFreq)) return res.status(400).json({ error: "Invalid frequency" });
  if (!["ACTIVE", "PAUSED", "CANCELLED", "COMPLETED"].includes(newStatus)) return res.status(400).json({ error: "Invalid status" });

  const parsedStart = parseISODate(req.body.startDate || sip.startDate);
  if (!parsedStart) return res.status(400).json({ error: "Invalid start date" });
  const endRaw = (req.body.endDate ?? sip.endDate) || null;
  const parsedEnd = endRaw ? parseISODate(endRaw) : null;
  if (endRaw && !parsedEnd) return res.status(400).json({ error: "Invalid end date" });
  if (parsedEnd && parsedEnd < parsedStart) return res.status(400).json({ error: "End date must be after start date" });

  let nextRunDate = sip.nextRunDate ? (parseISODate(sip.nextRunDate) || parsedStart) : parsedStart;
  if (req.body.startDate || req.body.frequency) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    nextRunDate = new Date(parsedStart);
    while (nextRunDate < today) nextRunDate = getNextSipDate(nextRunDate, newFreq);
  }

  sip.stockSymbol = symbol;
  sip.investmentAmount = newAmount;
  sip.frequency = newFreq;
  sip.startDate = toISODate(parsedStart);
  sip.endDate = parsedEnd ? toISODate(parsedEnd) : null;
  sip.status = newStatus;
  sip.nextRunDate = toISODate(nextRunDate);
  await sip.save();
  res.json({ ...sip.toObject(), id: String(sip._id), _id: undefined });
});

app.patch("/api/sip/:id/status", authenticateToken, async (req: any, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid SIP id" });
  if (!["ACTIVE", "PAUSED", "CANCELLED"].includes(req.body.status)) return res.status(400).json({ error: "Invalid status" });
  const sip: any = await SipOrder.findOne({ _id: req.params.id, userId: req.user.id });
  if (!sip) return res.status(404).json({ error: "SIP not found" });
  sip.status = req.body.status;
  await sip.save();
  res.json({ ...sip.toObject(), id: String(sip._id), _id: undefined });
});

app.delete("/api/sip/:id", authenticateToken, async (req: any, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid SIP id" });
  const sip: any = await SipOrder.findOne({ _id: req.params.id, userId: req.user.id });
  if (!sip) return res.status(404).json({ error: "SIP not found" });
  sip.status = "CANCELLED";
  await sip.save();
  await createSipNotification(req.user.id, req.params.id, "COMPLETED", "SIP has been cancelled.");
  res.json({ success: true });
});

app.get("/api/watchlist", authenticateToken, async (req: any, res) => {
  const rows = await Watchlist.find({ userId: req.user.id }).lean();
  res.json(rows.map((r: any) => ({ symbol: r.symbol })));
});

app.post("/api/watchlist", authenticateToken, async (req: any, res) => {
  try {
    await Watchlist.create({ userId: req.user.id, symbol: req.body.symbol });
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: "Already in watchlist" });
  }
});

app.delete("/api/watchlist/:symbol", authenticateToken, async (req: any, res) => {
  await Watchlist.deleteOne({ userId: req.user.id, symbol: req.params.symbol });
  res.json({ success: true });
});

app.get("/api/alerts", authenticateToken, async (req: any, res) => {
  const rows = await Alert.find({ userId: req.user.id, active: true }).lean();
  res.json(rows.map((r: any) => ({ ...r, id: String(r._id), _id: undefined })));
});

app.post("/api/alerts", authenticateToken, async (req: any, res) => {
  await Alert.create({ userId: req.user.id, symbol: req.body.symbol, targetPrice: req.body.targetPrice, type: req.body.type });
  res.json({ success: true });
});

app.delete("/api/alerts/:id", authenticateToken, async (req: any, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid alert id" });
  await Alert.deleteOne({ userId: req.user.id, _id: req.params.id });
  res.json({ success: true });
});

app.post("/api/ai/chat", authenticateToken, async (req: any, res) => {
  const { message } = req.body;
  if (typeof message !== "string" || !message.trim()) return res.status(400).json({ error: "Message is required" });

  if (gemini) {
    try {
      const fullPrompt = `${STOCKIFY_SYSTEM_PROMPT} \n\nUser question: ${message} `;
      const response = await gemini.models.generateContent({ model: "gemini-2.0-flash", contents: fullPrompt });
      const text = response.text?.trim();
      if (text) return res.json({ text });
    } catch (error) {
      console.error("Gemini error:", error);
    }
  }
  // Smart knowledge-base fallback (replaces the old limited-question reply)
  return res.json({ text: getSmartFallback(message) });
});

async function startServer() {
  await mongoose.connect(MONGODB_URI);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
  await processDueSips();
  setInterval(() => processDueSips(), 60 * 1000);
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});




