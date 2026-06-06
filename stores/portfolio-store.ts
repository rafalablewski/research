"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Portfolio, Transaction } from "@/types";
import { SEED_PORTFOLIOS } from "@/data";

interface PortfolioState {
  portfolios: Portfolio[];
  activeId: string;
  setActive: (id: string) => void;
  addPortfolio: (name: string, baseCurrency?: string) => void;
  removePortfolio: (id: string) => void;
  addTransaction: (portfolioId: string, tx: Omit<Transaction, "id">) => void;
  removeTransaction: (portfolioId: string, txId: string) => void;
  /** Bulk import (used by the CSV upload simulation). */
  importTransactions: (portfolioId: string, txs: Omit<Transaction, "id">[]) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      portfolios: SEED_PORTFOLIOS,
      activeId: SEED_PORTFOLIOS[0].id,
      setActive: (id) => set({ activeId: id }),
      addPortfolio: (name, baseCurrency = "USD") => {
        const pf: Portfolio = { id: `pf-${uid()}`, name, baseCurrency, cash: 0, transactions: [] };
        set((s) => ({ portfolios: [...s.portfolios, pf], activeId: pf.id }));
      },
      removePortfolio: (id) =>
        set((s) => {
          const portfolios = s.portfolios.filter((p) => p.id !== id);
          return {
            portfolios,
            activeId: s.activeId === id ? portfolios[0]?.id ?? "" : s.activeId,
          };
        }),
      addTransaction: (portfolioId, tx) =>
        set((s) => ({
          portfolios: s.portfolios.map((p) =>
            p.id === portfolioId
              ? { ...p, transactions: [...p.transactions, { ...tx, id: uid() }] }
              : p,
          ),
        })),
      removeTransaction: (portfolioId, txId) =>
        set((s) => ({
          portfolios: s.portfolios.map((p) =>
            p.id === portfolioId
              ? { ...p, transactions: p.transactions.filter((t) => t.id !== txId) }
              : p,
          ),
        })),
      importTransactions: (portfolioId, txs) =>
        set((s) => ({
          portfolios: s.portfolios.map((p) =>
            p.id === portfolioId
              ? { ...p, transactions: [...p.transactions, ...txs.map((t) => ({ ...t, id: uid() }))] }
              : p,
          ),
        })),
      // Convenience getter used by hooks.
      get activePortfolio() {
        const s = get();
        return s.portfolios.find((p) => p.id === s.activeId);
      },
    }),
    { name: "strata-portfolios", version: 1 },
  ),
);
