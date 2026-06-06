"use client";

import { useState } from "react";
import type { PortfolioSummary } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AllocationDonut } from "@/components/charts/allocation-donut";
import { formatCompactCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Allocation donut with a toggle between asset class and sector/category. */
export function AllocationCard({ summary }: { summary: PortfolioSummary }) {
  const [view, setView] = useState<"class" | "sector">("class");
  const data = view === "class" ? summary.allocationByClass : summary.allocationBySector;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Allocation</CardTitle>
        <div className="inline-flex rounded-lg bg-muted p-0.5 text-xs">
          {(["class", "sector"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-md px-2.5 py-1 font-medium capitalize transition-colors",
                view === v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v === "class" ? "Asset" : "Sector"}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="grid items-center gap-4 sm:grid-cols-2">
        <AllocationDonut
          data={data}
          centerLabel="Holdings value"
          centerValue={formatCompactCurrency(data.reduce((s, d) => s + d.value, 0))}
          size={190}
        />
        <ul className="space-y-2">
          {data.map((s) => (
            <li key={s.label} className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
              <span className="truncate">{s.label}</span>
              <span className="ml-auto font-medium tabular">{formatPercent(s.percent, false)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
