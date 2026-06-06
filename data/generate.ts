import type { PricePoint } from "@/types";

/**
 * Deterministic pseudo-random price history generator.
 *
 * Uses a seeded PRNG so every render (server + client) produces identical
 * candles — important to avoid React hydration mismatches with mock data.
 * When wiring a real API, replace calls to this with the provider's OHLC feed.
 */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Build ~`days` of daily candles ending at `endPrice`, walking backwards with a
 * gentle drift + volatility profile derived from the symbol seed.
 */
export function generateHistory(
  symbol: string,
  endPrice: number,
  days = 365,
  volatility = 0.02,
): PricePoint[] {
  const rand = mulberry32(hashSeed(symbol));
  const points: PricePoint[] = [];
  let close = endPrice;
  const now = new Date("2026-06-06T00:00:00Z");

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setUTCDate(now.getUTCDate() - i);

    const shock = (rand() - 0.5) * 2 * volatility;
    const drift = -0.0004; // slight upward bias going forward in time
    const prevClose = close / (1 + shock + drift);
    const high = Math.max(close, prevClose) * (1 + rand() * volatility * 0.6);
    const low = Math.min(close, prevClose) * (1 - rand() * volatility * 0.6);
    const open = prevClose;
    const volume = Math.round((0.6 + rand()) * baseVolume(endPrice));

    points.unshift({
      date: date.toISOString().slice(0, 10),
      open: round(open),
      high: round(high),
      low: round(low),
      close: round(close),
      volume,
    });
    close = prevClose;
  }
  return points;
}

function baseVolume(price: number) {
  if (price > 1000) return 5_000_000;
  if (price > 100) return 25_000_000;
  if (price > 1) return 80_000_000;
  return 500_000_000;
}

function round(n: number) {
  if (n >= 1) return Math.round(n * 100) / 100;
  if (n >= 0.01) return Math.round(n * 10000) / 10000;
  return Math.round(n * 1e8) / 1e8;
}
