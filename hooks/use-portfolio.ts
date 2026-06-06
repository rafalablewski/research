"use client";

import { useMemo } from "react";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { computePortfolioSummary } from "@/lib/portfolio";

/** The currently-selected portfolio and its derived summary (memoised). */
export function useActivePortfolio() {
  const portfolios = usePortfolioStore((s) => s.portfolios);
  const activeId = usePortfolioStore((s) => s.activeId);

  const portfolio = useMemo(
    () => portfolios.find((p) => p.id === activeId) ?? portfolios[0],
    [portfolios, activeId],
  );

  const summary = useMemo(
    () => (portfolio ? computePortfolioSummary(portfolio) : null),
    [portfolio],
  );

  return { portfolio, summary };
}

/** Summary for an arbitrary portfolio id (used by the portfolio switcher). */
export function usePortfolioSummary(id: string) {
  const portfolios = usePortfolioStore((s) => s.portfolios);
  return useMemo(() => {
    const pf = portfolios.find((p) => p.id === id);
    return pf ? computePortfolioSummary(pf) : null;
  }, [portfolios, id]);
}
