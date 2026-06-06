import type {
  Portfolio,
  PortfolioSummary,
  Holding,
  Asset,
  SnowflakeScore,
  AllocationSlice,
} from "@/types";
import { getAssetById } from "@/data";

const CLASS_COLORS: Record<string, string> = {
  Stocks: "hsl(221 83% 53%)",
  Crypto: "hsl(38 92% 50%)",
};

const SECTOR_PALETTE = [
  "hsl(221 83% 53%)",
  "hsl(142 71% 45%)",
  "hsl(262 83% 58%)",
  "hsl(38 92% 50%)",
  "hsl(199 89% 48%)",
  "hsl(0 72% 51%)",
  "hsl(326 78% 56%)",
  "hsl(168 76% 42%)",
];

/**
 * Pure portfolio engine: folds a transaction list into holdings using average-cost
 * accounting, then computes value-weighted aggregates including the Snowflake.
 *
 * Realised P&L is booked on sells against the running average cost. This is the
 * single place to swap in FIFO/LIFO or live prices from a brokerage feed.
 */
export function computePortfolioSummary(portfolio: Portfolio): PortfolioSummary {
  type Acc = {
    asset: Asset;
    quantity: number;
    costBasis: number; // cost of currently-held shares
    realizedPL: number;
  };
  const acc = new Map<string, Acc>();

  const txs = [...portfolio.transactions].sort(
    (a, b) => +new Date(a.date) - +new Date(b.date),
  );

  for (const tx of txs) {
    const asset = getAssetById(tx.assetId);
    if (!asset) continue;
    const cur =
      acc.get(tx.assetId) ?? { asset, quantity: 0, costBasis: 0, realizedPL: 0 };

    if (tx.type === "buy") {
      cur.quantity += tx.quantity;
      cur.costBasis += tx.quantity * tx.price + (tx.fees ?? 0);
    } else {
      const avg = cur.quantity > 0 ? cur.costBasis / cur.quantity : 0;
      cur.realizedPL += (tx.price - avg) * tx.quantity - (tx.fees ?? 0);
      cur.quantity -= tx.quantity;
      cur.costBasis -= avg * tx.quantity;
    }
    acc.set(tx.assetId, cur);
  }

  const holdings: Holding[] = [];
  let totalMarketValue = 0;

  for (const cur of acc.values()) {
    if (cur.quantity <= 1e-9) {
      // Position fully closed — keep realised P&L visible via a zero-qty holding.
      continue;
    }
    const marketValue = cur.quantity * cur.asset.price;
    const avgCost = cur.costBasis / cur.quantity;
    const unrealizedPL = marketValue - cur.costBasis;
    const dayChange = marketValue * (cur.asset.change24h / 100);
    totalMarketValue += marketValue;

    holdings.push({
      asset: cur.asset,
      quantity: cur.quantity,
      avgCost,
      invested: cur.costBasis,
      marketValue,
      unrealizedPL,
      unrealizedPLPercent: cur.costBasis ? (unrealizedPL / cur.costBasis) * 100 : 0,
      realizedPL: cur.realizedPL,
      weight: 0, // set below once total is known
      dayChange,
    });
  }

  const portfolioValue = totalMarketValue + portfolio.cash;
  holdings.forEach((h) => (h.weight = totalMarketValue ? (h.marketValue / totalMarketValue) * 100 : 0));
  holdings.sort((a, b) => b.marketValue - a.marketValue);

  const totalInvested = holdings.reduce((s, h) => s + h.invested, 0);
  const unrealizedPL = holdings.reduce((s, h) => s + h.unrealizedPL, 0);
  const realizedPL = [...acc.values()].reduce((s, c) => s + c.realizedPL, 0);
  const dayChangeAbs = holdings.reduce((s, h) => s + h.dayChange, 0);
  const totalReturn = unrealizedPL + realizedPL;

  // Weighted dividend yield + projected annual income.
  const annualDividendIncome = holdings.reduce(
    (s, h) => s + h.marketValue * ((h.asset.dividendYield ?? 0) / 100),
    0,
  );
  const dividendYield = totalMarketValue ? (annualDividendIncome / totalMarketValue) * 100 : 0;

  return {
    totalValue: portfolioValue,
    totalInvested,
    totalReturn,
    totalReturnPercent: totalInvested ? (totalReturn / totalInvested) * 100 : 0,
    irr: estimateIRR(txs, portfolioValue),
    unrealizedPL,
    realizedPL,
    dayChange: dayChangeAbs,
    dayChangePercent: portfolioValue ? (dayChangeAbs / portfolioValue) * 100 : 0,
    dividendYield,
    annualDividendIncome,
    holdings,
    snowflake: weightedSnowflake(holdings),
    allocationByClass: allocationByClass(holdings),
    allocationBySector: allocationBySector(holdings),
  };
}

/**
 * Build a portfolio value time series by summing `quantity × close` across all
 * holdings for the trailing `days`. Histories are aligned from the most recent
 * point backwards (all mock series share the same calendar). Cash is added flat.
 */
export function buildValueSeries(
  holdings: Holding[],
  cash: number,
  days = 180,
): { date: string; value: number }[] {
  if (!holdings.length) return [];
  const len = Math.min(days, ...holdings.map((h) => h.asset.history.length));
  const ref = holdings[0].asset.history.slice(-len);
  return ref.map((point, i) => {
    let value = cash;
    for (const h of holdings) {
      const series = h.asset.history.slice(-len);
      value += h.quantity * (series[i]?.close ?? h.asset.price);
    }
    return { date: point.date, value: Math.round(value) };
  });
}

/** Market-value-weighted average of holding snowflakes (the portfolio "shape"). */
function weightedSnowflake(holdings: Holding[]): SnowflakeScore {
  const keys: (keyof SnowflakeScore)[] = ["value", "growth", "past", "health", "dividend"];
  const total = holdings.reduce((s, h) => s + h.marketValue, 0) || 1;
  const out = { value: 0, growth: 0, past: 0, health: 0, dividend: 0 } as SnowflakeScore;
  for (const h of holdings) {
    const w = h.marketValue / total;
    for (const k of keys) out[k] += h.asset.snowflake[k] * w;
  }
  for (const k of keys) out[k] = Math.round(out[k] * 10) / 10;
  return out;
}

function allocationByClass(holdings: Holding[]): AllocationSlice[] {
  const totals = { Stocks: 0, Crypto: 0 };
  for (const h of holdings) {
    if (h.asset.assetClass === "stock") totals.Stocks += h.marketValue;
    else totals.Crypto += h.marketValue;
  }
  const sum = totals.Stocks + totals.Crypto || 1;
  return (Object.entries(totals) as [keyof typeof totals, number][])
    .filter(([, v]) => v > 0)
    .map(([label, value]) => ({
      label,
      value,
      percent: (value / sum) * 100,
      color: CLASS_COLORS[label],
    }));
}

function allocationBySector(holdings: Holding[]): AllocationSlice[] {
  const totals = new Map<string, number>();
  for (const h of holdings) {
    const key = h.asset.sector ?? "Other";
    totals.set(key, (totals.get(key) ?? 0) + h.marketValue);
  }
  const sum = [...totals.values()].reduce((a, b) => a + b, 0) || 1;
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({
      label,
      value,
      percent: (value / sum) * 100,
      color: SECTOR_PALETTE[i % SECTOR_PALETTE.length],
    }));
}

/**
 * Rough money-weighted return (IRR) approximation.
 *
 * A production app would solve the NPV polynomial (e.g. via bisection) over the
 * dated cash flows. For mock data we approximate from the holding period and
 * total return so the dashboard shows a believable annualised figure.
 */
function estimateIRR(
  txs: { date: string; quantity: number; price: number; type: "buy" | "sell" }[],
  currentValue: number,
): number {
  if (!txs.length) return 0;
  const first = +new Date(txs[0].date);
  const years = Math.max((Date.now() - first) / (365.25 * 24 * 3600 * 1000), 0.25);
  const invested = txs
    .filter((t) => t.type === "buy")
    .reduce((s, t) => s + t.quantity * t.price, 0);
  const proceeds = txs
    .filter((t) => t.type === "sell")
    .reduce((s, t) => s + t.quantity * t.price, 0);
  const netInvested = Math.max(invested - proceeds, 1);
  const totalMultiple = currentValue / netInvested;
  if (totalMultiple <= 0) return -100;
  return (Math.pow(totalMultiple, 1 / years) - 1) * 100;
}
