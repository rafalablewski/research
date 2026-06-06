/**
 * Core domain types for Strata.
 *
 * These shapes are intentionally close to what a real provider (Polygon.io,
 * Financial Modeling Prep, CoinGecko, …) would return, so swapping mock data for
 * a live API is a matter of mapping the response into these types — see
 * `lib/api/README` notes and `hooks/` for the integration seams.
 */

export type AssetClass = "stock" | "crypto";

/** The five Simply-Wall-St-style dimensions. Scored 0–5 (half-points allowed). */
export interface SnowflakeScore {
  value: number; // valuation attractiveness
  growth: number; // forecast growth
  past: number; // past performance
  health: number; // financial / protocol health
  dividend: number; // income / yield (staking yield for crypto)
}

export interface PricePoint {
  /** ISO date string, e.g. "2026-05-01". */
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Reward {
  text: string;
}
export interface Risk {
  text: string;
}

/** A single management / founding team member. */
export interface TeamMember {
  name: string;
  role: string;
  tenureYears?: number;
}

/** Year-by-year fundamentals used in the financials & growth sections. */
export interface FinancialYear {
  year: number;
  revenue: number;
  earnings: number;
  fcf: number; // free cash flow
}

export interface Asset {
  id: string;
  symbol: string; // "AAPL" / "BTC"
  name: string; // "Apple Inc." / "Bitcoin"
  assetClass: AssetClass;
  logoColor: string; // tailwind-friendly hex for the monogram chip
  exchange?: string; // "NASDAQ" (stock) | "Crypto" (crypto)
  sector?: string; // GICS sector (stock) | category (crypto, e.g. "Layer 1")

  price: number;
  change24h: number; // percent
  change7d: number; // percent
  change1y: number; // percent
  marketCap: number;
  volume24h: number;

  // Valuation / fundamentals (stock-centric; optional for crypto).
  peRatio?: number;
  pbRatio?: number;
  dividendYield?: number; // percent (staking yield for crypto)
  eps?: number;
  beta?: number;
  fairValue?: number; // DCF-derived intrinsic value
  sharesOutstanding?: number;

  // Crypto-centric on-chain metrics (optional for stocks).
  circulatingSupply?: number;
  maxSupply?: number | null;
  tvl?: number; // total value locked
  activeAddresses?: number;

  snowflake: SnowflakeScore;
  description: string;
  rewards: Reward[];
  risks: Risk[];
  team?: TeamMember[];
  financials?: FinancialYear[];
  history: PricePoint[]; // ~1y of daily candles
  tags: string[]; // for "Investment Ideas" curation

  /** Origin of the quote fields: provider id when overlaid with live data. */
  dataSource?: "coingecko" | "fmp" | "mock";
}

/** A buy or sell event in a portfolio. */
export interface Transaction {
  id: string;
  assetId: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  date: string; // ISO
  fees?: number;
}

/** A computed holding (derived from transactions). */
export interface Holding {
  asset: Asset;
  quantity: number;
  avgCost: number;
  invested: number; // total cost basis of current position
  marketValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  realizedPL: number;
  weight: number; // % of portfolio market value
  dayChange: number; // value change over the last 24h
}

export interface Portfolio {
  id: string;
  name: string;
  baseCurrency: string;
  cash: number;
  transactions: Transaction[];
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalReturn: number; // absolute
  totalReturnPercent: number;
  irr: number; // annualised, percent
  unrealizedPL: number;
  realizedPL: number;
  dayChange: number;
  dayChangePercent: number;
  dividendYield: number; // weighted, percent
  annualDividendIncome: number;
  holdings: Holding[];
  /** Portfolio-level snowflake = market-value-weighted average of holdings. */
  snowflake: SnowflakeScore;
  allocationByClass: AllocationSlice[];
  allocationBySector: AllocationSlice[];
}

export interface AllocationSlice {
  label: string;
  value: number; // market value
  percent: number;
  color: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string; // ISO
  url: string;
  sentiment: "positive" | "neutral" | "negative";
  relatedSymbols: string[];
  summary: string;
}

export interface Alert {
  id: string;
  type: "price" | "news" | "score" | "earnings";
  severity: "info" | "warning" | "success";
  title: string;
  body: string;
  createdAt: string;
  symbol?: string;
}

/** An "insider" trade (stock) or "whale" transaction (crypto). */
export interface ActivityEvent {
  id: string;
  symbol: string;
  actor: string; // person / wallet
  action: "buy" | "sell" | "transfer";
  amount: number; // USD value
  date: string;
}

export interface InvestmentIdea {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  symbols: string[];
  accent: string; // tailwind class for the gradient/accent
}
