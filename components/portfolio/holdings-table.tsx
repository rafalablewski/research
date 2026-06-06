"use client";

import Link from "next/link";
import type { Holding } from "@/types";
import { AssetLogo } from "@/components/shared/asset-logo";
import { ChangeBadge } from "@/components/shared/change-badge";
import { Sparkline } from "@/components/charts/sparkline";
import { formatPercent, formatNumber, changeColor } from "@/lib/format";
import { useMoney } from "@/hooks/use-fx";
import { cn } from "@/lib/utils";

/**
 * Responsive holdings table. On dashboards pass `compact` to hide secondary
 * columns; the full version (portfolio page) shows quantity, cost basis, weight.
 */
export function HoldingsTable({ holdings, compact = false }: { holdings: Holding[]; compact?: boolean }) {
  const money = useMoney();
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2 text-left font-medium">Asset</th>
            {!compact && <th className="px-3 py-2 text-right font-medium">Qty</th>}
            <th className="px-3 py-2 text-right font-medium">Price</th>
            <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">7d</th>
            <th className="px-3 py-2 text-right font-medium">Value</th>
            <th className="px-3 py-2 text-right font-medium">P&L</th>
            {!compact && <th className="px-3 py-2 text-right font-medium">Weight</th>}
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => (
            <tr key={h.asset.id} className="group border-b last:border-0 transition-colors hover:bg-accent/50">
              <td className="px-3 py-2.5">
                <Link href={`/assets/${h.asset.symbol}`} className="flex items-center gap-3">
                  <AssetLogo asset={h.asset} size="sm" />
                  <div className="min-w-0">
                    <div className="font-semibold leading-tight group-hover:text-primary">{h.asset.symbol}</div>
                    <div className="truncate text-xs text-muted-foreground">{h.asset.name}</div>
                  </div>
                </Link>
              </td>
              {!compact && (
                <td className="px-3 py-2.5 text-right tabular text-muted-foreground">
                  {formatNumber(h.quantity, h.quantity < 10 ? 4 : 2)}
                </td>
              )}
              <td className="px-3 py-2.5 text-right tabular">{money.price(h.asset.price)}</td>
              <td className="hidden px-3 py-2.5 text-right sm:table-cell">
                <div className="flex items-center justify-end gap-2">
                  <Sparkline data={h.asset.history} positive={h.asset.change7d >= 0} width={64} height={28} />
                  <ChangeBadge value={h.asset.change7d} showIcon={false} />
                </div>
              </td>
              <td className="px-3 py-2.5 text-right font-medium tabular">{money.compact(h.marketValue)}</td>
              <td className="px-3 py-2.5 text-right">
                <div className={cn("font-medium tabular", changeColor(h.unrealizedPL))}>
                  {money.compact(h.unrealizedPL)}
                </div>
                <div className={cn("text-xs tabular", changeColor(h.unrealizedPLPercent))}>
                  {formatPercent(h.unrealizedPLPercent)}
                </div>
              </td>
              {!compact && (
                <td className="px-3 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-muted md:block">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(h.weight, 100)}%` }} />
                    </div>
                    <span className="tabular text-muted-foreground">{formatPercent(h.weight, false)}</span>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
