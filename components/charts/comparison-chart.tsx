"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Asset } from "@/types";
import { AssetLogo } from "@/components/shared/asset-logo";
import { formatDate, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const RANGE_DAYS = { "1M": 30, "3M": 90, "6M": 180, "1Y": 365 } as const;
type Range = keyof typeof RANGE_DAYS;

// Distinct, theme-aware line colours (cycled if more series are added).
const SERIES_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--score-growth))",
  "hsl(var(--score-past))",
  "hsl(var(--score-dividend))",
  "hsl(var(--score-value))",
  "hsl(var(--bear))",
];

/**
 * Normalised performance comparison: every selected asset is rebased to 0% at
 * the start of the range, so relative out/under-performance is directly readable.
 * `base` is always shown; `candidates` can be toggled on/off.
 */
export function ComparisonChart({ base, candidates }: { base: Asset; candidates: Asset[] }) {
  const [range, setRange] = useState<Range>("3M");
  const [selected, setSelected] = useState<string[]>([base.symbol, ...candidates.slice(0, 2).map((c) => c.symbol)]);

  const assets = useMemo(() => [base, ...candidates], [base, candidates]);
  const active = assets.filter((a) => selected.includes(a.symbol));

  const data = useMemo(() => {
    const days = RANGE_DAYS[range];
    const len = Math.min(days, ...active.map((a) => a.history.length));
    const refDates = active[0]?.history.slice(-len).map((p) => p.date) ?? [];
    const firsts: Record<string, number> = {};
    for (const a of active) {
      const series = a.history.slice(-len);
      firsts[a.symbol] = series[0]?.close ?? 1;
    }
    return refDates.map((date, i) => {
      const row: Record<string, number | string> = { date };
      for (const a of active) {
        const series = a.history.slice(-len);
        const c = series[i]?.close ?? firsts[a.symbol];
        row[a.symbol] = ((c / firsts[a.symbol]) - 1) * 100;
      }
      return row;
    });
  }, [active, range]);

  const colorFor = (symbol: string) => SERIES_COLORS[assets.findIndex((a) => a.symbol === symbol) % SERIES_COLORS.length];

  function toggle(symbol: string) {
    if (symbol === base.symbol) return; // base always shown
    setSelected((s) => (s.includes(symbol) ? s.filter((x) => x !== symbol) : [...s, symbol]));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {assets.map((a) => {
            const on = selected.includes(a.symbol);
            return (
              <button
                key={a.symbol}
                onClick={() => toggle(a.symbol)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  on ? "bg-accent" : "text-muted-foreground hover:bg-accent/50",
                  a.symbol === base.symbol && "cursor-default",
                )}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: on ? colorFor(a.symbol) : "hsl(var(--muted-foreground))" }} />
                {a.symbol}
              </button>
            );
          })}
        </div>
        <div className="inline-flex rounded-lg bg-muted p-0.5 text-xs">
          {(Object.keys(RANGE_DAYS) as Range[]).map((r) => (
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
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="date" tickFormatter={(d) => formatDate(d, { year: undefined })} minTickGap={40} tick={tick} axisLine={false} tickLine={false} />
            <YAxis orientation="right" width={56} tickFormatter={(v) => `${v > 0 ? "+" : ""}${v.toFixed(0)}%`} tick={tick} axisLine={false} tickLine={false} />
            <Tooltip content={<CompareTooltip colorFor={colorFor} />} />
            {active.map((a) => (
              <Line
                key={a.symbol}
                type="monotone"
                dataKey={a.symbol}
                stroke={colorFor(a.symbol)}
                strokeWidth={a.symbol === base.symbol ? 2.5 : 1.5}
                dot={false}
                isAnimationActive
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const tick = { fill: "hsl(var(--muted-foreground))", fontSize: 11 };

function CompareTooltip({ active, payload, label, colorFor }: any) {
  if (!active || !payload?.length) return null;
  const rows = [...payload].sort((a, b) => b.value - a.value);
  return (
    <div className="rounded-lg border bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <div className="mb-1 font-medium">{formatDate(label)}</div>
      <div className="space-y-0.5">
        {rows.map((r: any) => (
          <div key={r.dataKey} className="flex items-center justify-between gap-4 tabular">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: colorFor(r.dataKey) }} />
              {r.dataKey}
            </span>
            <span className={r.value >= 0 ? "text-bull" : "text-bear"}>{formatPercent(r.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
