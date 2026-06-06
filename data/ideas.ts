import type { InvestmentIdea } from "@/types";

/** Curated "Investment Ideas" — like Simply Wall St's themed collections. */
export const INVESTMENT_IDEAS: InvestmentIdea[] = [
  {
    id: "ai-leaders",
    title: "AI Leaders",
    description: "Companies and tokens at the centre of the artificial-intelligence buildout.",
    icon: "Sparkles",
    symbols: ["NVDA", "MSFT", "GOOGL", "PLTR", "RENDER"],
    accent: "from-violet-500/20 to-blue-500/20",
  },
  {
    id: "high-dividend",
    title: "High Dividend",
    description: "Reliable income payers with above-average, well-covered yields.",
    icon: "Coins",
    symbols: ["JNJ", "JPM", "AAPL", "V"],
    accent: "from-amber-500/20 to-emerald-500/20",
  },
  {
    id: "layer-1",
    title: "Layer 1 Blockchains",
    description: "Base-layer networks competing to settle the on-chain economy.",
    icon: "Boxes",
    symbols: ["ETH", "SOL", "BNB", "AVAX"],
    accent: "from-cyan-500/20 to-indigo-500/20",
  },
  {
    id: "defi",
    title: "DeFi & Infrastructure",
    description: "Protocols powering decentralised finance, oracles and scaling.",
    icon: "Network",
    symbols: ["UNI", "LINK", "ARB", "POL"],
    accent: "from-pink-500/20 to-purple-500/20",
  },
  {
    id: "value",
    title: "Undervalued Quality",
    description: "Quality businesses trading below our estimated fair value.",
    icon: "Gem",
    symbols: ["GOOGL", "JPM", "JNJ", "POL"],
    accent: "from-emerald-500/20 to-teal-500/20",
  },
  {
    id: "high-growth",
    title: "Hyper Growth",
    description: "Fast compounders forecast to grow earnings 20%+ annually.",
    icon: "Rocket",
    symbols: ["NVDA", "PLTR", "SOL", "RENDER"],
    accent: "from-orange-500/20 to-red-500/20",
  },
];
