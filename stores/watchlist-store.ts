"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WatchlistState {
  /** Stored as asset symbols for stable, human-readable persistence. */
  symbols: string[];
  toggle: (symbol: string) => void;
  add: (symbol: string) => void;
  remove: (symbol: string) => void;
  has: (symbol: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      symbols: ["AAPL", "NVDA", "BTC", "ETH", "SOL"],
      toggle: (symbol) =>
        set((s) => ({
          symbols: s.symbols.includes(symbol)
            ? s.symbols.filter((x) => x !== symbol)
            : [...s.symbols, symbol],
        })),
      add: (symbol) =>
        set((s) => (s.symbols.includes(symbol) ? s : { symbols: [...s.symbols, symbol] })),
      remove: (symbol) => set((s) => ({ symbols: s.symbols.filter((x) => x !== symbol) })),
      has: (symbol) => get().symbols.includes(symbol),
    }),
    { name: "strata-watchlist", version: 1 },
  ),
);
