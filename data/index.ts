import type { Asset } from "@/types";
import { STOCKS } from "./stocks";
import { CRYPTOS } from "./cryptos";

export { STOCKS } from "./stocks";
export { CRYPTOS } from "./cryptos";
export { NEWS, ALERTS, ACTIVITY } from "./news";
export { INVESTMENT_IDEAS } from "./ideas";
export { SEED_PORTFOLIOS } from "./portfolios";

/** The full searchable asset universe (stocks + crypto). */
export const ALL_ASSETS: Asset[] = [...STOCKS, ...CRYPTOS];

const BY_ID = new Map(ALL_ASSETS.map((a) => [a.id, a]));
const BY_SYMBOL = new Map(ALL_ASSETS.map((a) => [a.symbol.toUpperCase(), a]));

export function getAssetById(id: string): Asset | undefined {
  return BY_ID.get(id);
}

export function getAssetBySymbol(symbol: string): Asset | undefined {
  return BY_SYMBOL.get(symbol.toUpperCase());
}

/** Lightweight fuzzy-ish search over symbol + name. */
export function searchAssets(query: string, limit = 8): Asset[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ALL_ASSETS.filter(
    (a) =>
      a.symbol.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q)),
  ).slice(0, limit);
}

/** Find assets that share the most tags with the given one (for "Similar"). */
export function similarAssets(asset: Asset, limit = 4): Asset[] {
  return ALL_ASSETS.filter((a) => a.id !== asset.id)
    .map((a) => ({
      a,
      score:
        (a.assetClass === asset.assetClass ? 2 : 0) +
        (a.sector === asset.sector ? 2 : 0) +
        a.tags.filter((t) => asset.tags.includes(t)).length,
    }))
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((x) => x.a);
}
