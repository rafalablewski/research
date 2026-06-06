"use client";

import { useQuery } from "@tanstack/react-query";
import type { Asset } from "@/types";
import {
  ALL_ASSETS,
  STOCKS,
  CRYPTOS,
  getAssetBySymbol,
  similarAssets,
} from "@/data";

/**
 * Data-fetching seam.
 *
 * Every hook below resolves from local mock data wrapped in a TanStack Query so
 * the component layer already behaves as if data is async (loading/error/cache).
 *
 * ── To go live ──────────────────────────────────────────────────────────────
 * Replace the `queryFn` bodies with real `fetch` calls, e.g.:
 *   queryFn: () => fetch(`/api/assets/${symbol}`).then(r => r.json())
 * and add `/app/api/...` route handlers that proxy Polygon.io / CoinGecko /
 * Financial Modeling Prep (keeping API keys server-side). The component code and
 * types stay identical.
 */

const FAKE_LATENCY = 250;
const wait = <T>(value: T) =>
  new Promise<T>((res) => setTimeout(() => res(value), FAKE_LATENCY));

export function useAllAssets() {
  return useQuery({
    queryKey: ["assets", "all"],
    queryFn: () => wait(ALL_ASSETS),
    staleTime: 60_000,
    initialData: ALL_ASSETS,
  });
}

export function useAssetsByClass(assetClass: "stock" | "crypto" | "all") {
  return useQuery({
    queryKey: ["assets", assetClass],
    queryFn: () =>
      wait(assetClass === "stock" ? STOCKS : assetClass === "crypto" ? CRYPTOS : ALL_ASSETS),
    staleTime: 60_000,
  });
}

export function useAsset(symbol: string) {
  const base = getAssetBySymbol(symbol);
  return useQuery<Asset | undefined>({
    queryKey: ["asset", symbol.toUpperCase()],
    // Crypto → CoinGecko, stocks → FMP, both via route handlers with built-in
    // mock fallback. Returns the curated mock asset if anything goes wrong.
    queryFn: async () => {
      if (base) {
        const endpoint = base.assetClass === "crypto" ? "crypto" : "stocks";
        try {
          const res = await fetch(`/api/${endpoint}/${symbol}`);
          if (res.ok) {
            const json = (await res.json()) as { asset: Asset };
            return json.asset;
          }
        } catch {
          /* fall through to mock */
        }
      }
      return wait(base);
    },
    staleTime: 60_000,
    initialData: base,
  });
}

/**
 * Live crypto markets list (CoinGecko via /api/crypto, mock fallback).
 * Use this in lists/screeners to surface live quotes; `source` reflects origin.
 */
export function useCryptoMarkets() {
  return useQuery<{ source: "coingecko" | "mock"; assets: Asset[] }>({
    queryKey: ["crypto", "markets"],
    queryFn: async () => {
      const res = await fetch("/api/crypto");
      if (!res.ok) throw new Error("crypto markets request failed");
      return res.json();
    },
    staleTime: 60_000,
  });
}

/**
 * The full live market universe (stocks + crypto) for lists/screeners.
 *
 * Renders instantly from mock `initialData`, then swaps in live quotes as the
 * provider routes resolve. `isLive` is true once any provider returned live data.
 */
export function useMarketAssets() {
  return useQuery<{ assets: Asset[]; isLive: boolean }>({
    queryKey: ["market", "all"],
    queryFn: async () => {
      const [stocksRes, cryptoRes] = await Promise.allSettled([
        fetch("/api/stocks").then((r) => r.json()),
        fetch("/api/crypto").then((r) => r.json()),
      ]);
      const stocks = stocksRes.status === "fulfilled" ? stocksRes.value : { source: "mock", assets: STOCKS };
      const crypto = cryptoRes.status === "fulfilled" ? cryptoRes.value : { source: "mock", assets: CRYPTOS };
      return {
        assets: [...stocks.assets, ...crypto.assets],
        isLive: stocks.source !== "mock" || crypto.source !== "mock",
      };
    },
    initialData: { assets: ALL_ASSETS, isLive: false },
    staleTime: 60_000,
  });
}

export function useSimilarAssets(asset?: Asset) {
  return useQuery<Asset[]>({
    queryKey: ["similar", asset?.symbol],
    queryFn: () => wait(asset ? similarAssets(asset) : []),
    enabled: !!asset,
  });
}
