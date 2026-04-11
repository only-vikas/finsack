import type { Strategy } from "@/types/os";

export const strategies: Strategy[] = [
  // ── Investing ─────────────────────────────────────────────────────────────
  {
    id: "value-investing",
    category: "investing",
    title: "Value Investing Fundamentals",
    difficulty: "Beginner",
    xpReward: 100,
    ytSearchTag: "value investing fundamentals Warren Buffett",
    aiPrompt:
      "Explain value investing fundamentals as taught by Warren Buffett and Benjamin Graham. Cover intrinsic value calculation, margin of safety, P/E ratios, and long-term holding strategy. Include entry rules, key metrics to evaluate, and common mistakes beginners make.",
    description:
      "Learn the timeless principles of value investing from the masters.",
  },
  {
    id: "dividend-growth",
    category: "investing",
    title: "Dividend Growth Investing",
    difficulty: "Intermediate",
    xpReward: 150,
    ytSearchTag: "dividend growth investing strategy",
    aiPrompt:
      "Explain the dividend growth investing strategy in detail. Cover how to select stocks with consistent dividend growth, the importance of dividend yield vs growth rate, DRIP plans, and how to build a portfolio that generates passive income. Include entry criteria and risk management.",
    description:
      "Build a portfolio of consistently growing dividend-paying stocks.",
  },
  {
    id: "index-fund",
    category: "investing",
    title: "Index Fund Strategy",
    difficulty: "Beginner",
    xpReward: 80,
    ytSearchTag: "index fund investing strategy passive",
    aiPrompt:
      "Explain why index fund investing is considered the most reliable strategy for most investors. Cover dollar-cost averaging, expense ratios, Nifty 50 vs S&P 500 index tracking, SIP strategies, and how to build a core-satellite portfolio using index funds.",
    description:
      "The passive approach that outperforms most active fund managers.",
  },

  // ── Swing Trading ─────────────────────────────────────────────────────────
  {
    id: "44-sma",
    category: "swing-trading",
    title: "44 SMA Strategy",
    difficulty: "Intermediate",
    xpReward: 150,
    ytSearchTag: "44 SMA strategy Siddharth Bhanushali",
    aiPrompt:
      "Explain the 44 Simple Moving Average swing trading strategy, highlighting entry rules (price closing above 44 SMA with volume), exit rules (closing below 44 SMA), stop-loss placement, position sizing, and ideal market conditions. List pros and cons.",
    description:
      "A popular moving average pullback strategy for swing trades.",
  },
  {
    id: "rsi-divergence",
    category: "swing-trading",
    title: "RSI Divergence Trading",
    difficulty: "Advanced",
    xpReward: 200,
    ytSearchTag: "RSI divergence trading strategy swing",
    aiPrompt:
      "Explain RSI divergence trading for swing trading. Cover bullish and bearish divergence patterns, how to confirm with price action and volume, entry timing, stop-loss rules, and target setting. Include real-world examples and common false signals to avoid.",
    description:
      "Spot momentum shifts using RSI divergence patterns.",
  },
  {
    id: "breakout-trading",
    category: "swing-trading",
    title: "Breakout Trading",
    difficulty: "Intermediate",
    xpReward: 175,
    ytSearchTag: "breakout trading strategy stocks",
    aiPrompt:
      "Explain breakout trading strategy in swing trading context. Cover how to identify consolidation zones, volume confirmation, types of breakouts (range, triangle, flag), entry rules, stop-loss placement below breakout level, and profit targets using measured moves.",
    description:
      "Capture explosive moves when price breaks key levels.",
  },

  // ── Options Trading ───────────────────────────────────────────────────────
  {
    id: "covered-call",
    category: "options-trading",
    title: "Covered Call Strategy",
    difficulty: "Intermediate",
    xpReward: 175,
    ytSearchTag: "covered call options strategy explained",
    aiPrompt:
      "Explain the covered call options strategy in detail. Cover when to use it (mild bullish or neutral outlook), how to select strike prices and expiration dates, maximum profit calculation, risk profile, assignment scenarios, and portfolio income generation using covered calls.",
    description:
      "Generate income from stocks you already own using calls.",
  },
  {
    id: "iron-condor",
    category: "options-trading",
    title: "Iron Condor",
    difficulty: "Advanced",
    xpReward: 250,
    ytSearchTag: "iron condor options strategy explained",
    aiPrompt:
      "Explain the iron condor options strategy comprehensively. Cover the four-leg construction (sell OTM call + buy further OTM call + sell OTM put + buy further OTM put), max profit/loss calculations, ideal IV conditions, adjustment techniques, and when to close early.",
    description:
      "A neutral options strategy profiting from low volatility.",
  },
  {
    id: "bull-call-spread",
    category: "options-trading",
    title: "Bull Call Spread",
    difficulty: "Beginner",
    xpReward: 120,
    ytSearchTag: "bull call spread options strategy beginner",
    aiPrompt:
      "Explain the bull call spread (debit call spread) options strategy. Cover construction (buy lower strike call + sell higher strike call), max profit/loss, break-even calculation, strike selection, expiration timing, and when this strategy is preferred over buying naked calls.",
    description:
      "A risk-defined bullish bet using two call options.",
  },
];

export const categoryInfo: Record<
  string,
  { name: string; icon: string; color: string }
> = {
  investing: {
    name: "Investing",
    icon: "📈",
    color: "#22d3ee",
  },
  "swing-trading": {
    name: "Swing Trading",
    icon: "📊",
    color: "#a78bfa",
  },
  "options-trading": {
    name: "Options Trading",
    icon: "🎯",
    color: "#f472b6",
  },
};
