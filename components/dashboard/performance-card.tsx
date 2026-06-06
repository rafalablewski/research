"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PortfolioSummary } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangeBadge } from "@/components/shared/change-badge";
import { buildValueSeries } from "@/lib/portfolio";
import { formatCompactCurrency, formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const RANGES = { "1M": 30, "3M": 90, "6M": 180, "1Y": 365 } as const;
type Range = keyof typeof RANGES;

/** Portfolio value over time with a range selector. */
export function PerformanceCard({ summary, cash }: { summary: PortfolioSummary; cash: number }) {
  const [range, setRange] = useState<Range>("3M");
  const series = useMemo(
    () => buildValueSeries(summary.holdings, cash, RANGES[range]),
    [summary.holdings, cash, range],
  );

  const first = series[0]?.value ?? 0;
  const last = series[series.length - 1]?.value ?? 0;
  const pct = first ? ((last - first) / first) * 100 : 0;
  const up = pct >= 0;
  const color = up ? "hsl(var(--bull))" : "hsl(var(--bear))";

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Performance</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <span className="text-base font-semibold text-foreground tabular">{formatCurrency(last)}</span>
            <ChangeBadge value={pct} />
            <span>over {range}</span>
          </CardDescription>
        </div>
        <div className="inline-flex rounded-lg bg-muted p-0.5 text-xs">
          {(Object.keys(RANGES) as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md px-2.5 py-1 font-medium transition-colors",
                range === r ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="pf-value" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(d) => formatDate(d, { year: undefined })} minTickGap={40} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={["auto", "auto"]} orientation="right" width={64} tickFormatter={(v) => formatCompactCurrency(v)} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ValueTooltip />} />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill="url(#pf-value)" isAnimationActive />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ValueTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as { date: string; value: number };
  return (
    <div className="rounded-lg border bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <div className="font-medium">{formatDate(p.date)}</div>
      <div className="mt-0.5 text-sm font-semibold tabular">{formatCurrency(p.value)}</div>
    </div>
  );
}
