"use client";

import { Wallet, TrendingUp, PiggyBank, Coins } from "lucide-react";
import type { PortfolioSummary } from "@/types";
import { MetricCard } from "@/components/shared/metric-card";
import { formatPercent } from "@/lib/format";
import { useMoney } from "@/hooks/use-fx";

/** The four headline KPIs at the top of the dashboard. */
export function OverviewCards({ summary }: { summary: PortfolioSummary }) {
  const money = useMoney();
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <MetricCard
        label="Total Value"
        value={money.format(summary.totalValue)}
        change={summary.dayChangePercent}
        sub={`${summary.dayChange >= 0 ? "+" : ""}${money.format(summary.dayChange)} today`}
        icon={Wallet}
        accent="text-primary"
      />
      <MetricCard
        label="Total Return"
        value={formatPercent(summary.totalReturnPercent)}
        sub={`${money.compact(summary.totalReturn)} · IRR ${formatPercent(summary.irr)}`}
        icon={TrendingUp}
        accent="text-bull"
      />
      <MetricCard
        label="Unrealized P&L"
        value={money.compact(summary.unrealizedPL)}
        sub={`Realized ${money.compact(summary.realizedPL)}`}
        icon={PiggyBank}
        accent="text-score-past"
      />
      <MetricCard
        label="Dividend / Yield"
        value={formatPercent(summary.dividendYield, false)}
        sub={`${money.format(summary.annualDividendIncome)} / yr projected`}
        icon={Coins}
        accent="text-score-dividend"
      />
    </div>
  );
}
