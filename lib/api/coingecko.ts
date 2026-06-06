import type { Asset } from "@/types";
import { CRYPTOS } from "@/data/cryptos";

/**
 * CoinGecko provider integration (live crypto market data).
 *
 * CoinGecko's free "Public API" needs no key for the endpoints used here. Market
 * data (price, market cap, volume, supply, price changes) is fetched live and
 * *overlaid* onto our curated mock assets — so qualitative fields that CoinGecko
 * does not provide (Snowflake scores, rewards/risks, tags, OHLC history for the
 * multi-range chart) are preserved while the quote numbers go live.
 *
 * ── Network note ────────────────────────────────────────────────────────────
 * Calls go out from the server (route handlers in app/api/crypto). In Claude
 * Code on the web the environment's network policy must allowlist
 * `api.coingecko.com`; otherwise the route handler falls back to mock data.
 * A paid key can be supplied via COINGECKO_API_KEY (sent as x-cg-pro-api-key).
 */

/** Our symbol → CoinGecko coin id. */
export const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  LINK: "chainlink",
  AVAX: "avalanche-2",
  UNI: "uniswap",
  POL: "polygon-ecosystem-token",
  ARB: "arbitrum",
  RENDER: "render-token",
};

const ID_TO_SYMBOL: Record<string, string> = Object.fromEntries(
  Object.entries(COINGECKO_IDS).map(([sym, id]) => [id, sym]),
);

const API_BASE = process.env.COINGECKO_API_KEY
  ? "https://pro-api.coingecko.com/api/v3"
  : "https://api.coingecko.com/api/v3";

interface CoinGeckoMarket {
  id: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  circulating_supply: number | null;
  max_supply: number | null;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_1y_in_currency?: number;
}

/**
 * Fetch live markets for the given symbols (defaults to our whole crypto set)
 * and return curated mock assets overlaid with live quote data.
 *
 * Throws on network/HTTP failure so the caller can decide to fall back to mock.
 */
export async function fetchLiveCryptos(symbols?: string[]): Promise<Asset[]> {
  const wanted = (symbols ?? Object.keys(COINGECKO_IDS))
    .map((s) => s.toUpperCase())
    .filter((s) => COINGECKO_IDS[s]);
  if (wanted.length === 0) return [];

  const ids = wanted.map((s) => COINGECKO_IDS[s]).join(",");
  const url =
    `${API_BASE}/coins/markets?vs_currency=usd&ids=${ids}` +
    `&price_change_percentage=24h,7d,1y&precision=full`;

  const res = await fetch(url, {
    headers: process.env.COINGECKO_API_KEY
      ? { "x-cg-pro-api-key": process.env.COINGECKO_API_KEY }
      : {},
    // Cache at the edge for 60s — quote data does not need sub-minute freshness here.
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);

  const markets = (await res.json()) as CoinGeckoMarket[];
  const bySymbol = new Map(markets.map((m) => [ID_TO_SYMBOL[m.id], m]));

  return CRYPTOS.filter((a) => wanted.includes(a.symbol)).map((mock) => {
    const m = bySymbol.get(mock.symbol);
    if (!m) return mock;
    return mergeMarket(mock, m);
  });
}

/** Fetch a single live crypto by symbol; throws on failure. */
export async function fetchLiveCrypto(symbol: string): Promise<Asset | undefined> {
  const [asset] = await fetchLiveCryptos([symbol]);
  return asset;
}

/** Overlay CoinGecko quote fields onto a curated mock asset. */
function mergeMarket(mock: Asset, m: CoinGeckoMarket): Asset {
  return {
    ...mock,
    price: m.current_price ?? mock.price,
    marketCap: m.market_cap ?? mock.marketCap,
    volume24h: m.total_volume ?? mock.volume24h,
    circulatingSupply: m.circulating_supply ?? mock.circulatingSupply,
    maxSupply: m.max_supply ?? mock.maxSupply,
    change24h: round(m.price_change_percentage_24h_in_currency, mock.change24h),
    change7d: round(m.price_change_percentage_7d_in_currency, mock.change7d),
    change1y: round(m.price_change_percentage_1y_in_currency, mock.change1y),
    dataSource: "coingecko",
  };
}

function round(v: number | undefined, fallback: number) {
  return typeof v === "number" ? Math.round(v * 100) / 100 : fallback;
}
