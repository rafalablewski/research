import type { Asset } from "@/types";
import { STOCKS } from "@/data/stocks";

/**
 * Financial Modeling Prep (FMP) integration (live stock quotes).
 *
 * Symmetric to the CoinGecko provider: live quote fields are overlaid onto the
 * curated mock stocks, preserving qualitative fields (Snowflake, rewards/risks,
 * financials, OHLC history) that the quote endpoint doesn't provide.
 *
 * ── Auth & network ──────────────────────────────────────────────────────────
 * FMP requires an API key for most endpoints. Set `FMP_API_KEY`. Calls run from
 * the server (route handlers in app/api/stocks). In Claude Code on the web the
 * network policy must allowlist `financialmodelingprep.com`; otherwise the route
 * handler falls back to mock data. Without a key we also fall back to mock.
 */

const API_BASE = "https://financialmodelingprep.com/api/v3";

interface FmpQuote {
  symbol: string;
  price: number;
  changesPercentage: number; // 24h % change
  marketCap: number;
  volume: number;
  pe: number | null;
  eps: number | null;
  sharesOutstanding: number | null;
  yearHigh?: number;
  yearLow?: number;
}

/** Fetch live quotes for the given symbols (defaults to our whole stock set). */
export async function fetchLiveStocks(symbols?: string[]): Promise<Asset[]> {
  const key = process.env.FMP_API_KEY;
  const wanted = (symbols ?? STOCKS.map((s) => s.symbol)).map((s) => s.toUpperCase());
  // No key → no live data; let the caller fall back to mock.
  if (!key) throw new Error("FMP_API_KEY not set");
  if (wanted.length === 0) return [];

  const res = await fetch(`${API_BASE}/quote/${wanted.join(",")}?apikey=${key}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`FMP ${res.status}`);

  const quotes = (await res.json()) as FmpQuote[];
  const bySymbol = new Map(quotes.map((q) => [q.symbol.toUpperCase(), q]));

  return STOCKS.filter((a) => wanted.includes(a.symbol)).map((mock) => {
    const q = bySymbol.get(mock.symbol);
    return q ? mergeQuote(mock, q) : mock;
  });
}

/** Fetch a single live stock by symbol; throws on failure. */
export async function fetchLiveStock(symbol: string): Promise<Asset | undefined> {
  const [asset] = await fetchLiveStocks([symbol]);
  return asset;
}

function mergeQuote(mock: Asset, q: FmpQuote): Asset {
  // FMP only gives a 24h change; keep curated 7d/1y unless year hi/lo lets us infer 1y.
  const change1y =
    q.yearHigh && q.yearLow && q.price
      ? round(((q.price - q.yearLow) / q.yearLow) * 100 - 50, mock.change1y) // rough proxy
      : mock.change1y;
  return {
    ...mock,
    price: q.price ?? mock.price,
    change24h: round(q.changesPercentage, mock.change24h),
    change1y,
    marketCap: q.marketCap ?? mock.marketCap,
    volume24h: q.volume ?? mock.volume24h,
    peRatio: q.pe ?? mock.peRatio,
    eps: q.eps ?? mock.eps,
    sharesOutstanding: q.sharesOutstanding ?? mock.sharesOutstanding,
    dataSource: "fmp",
  };
}

function round(v: number | null | undefined, fallback: number) {
  return typeof v === "number" ? Math.round(v * 100) / 100 : fallback;
}
