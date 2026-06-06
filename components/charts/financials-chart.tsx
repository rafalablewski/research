"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FinancialYear } from "@/types";
import { formatCompactCurrency } from "@/lib/format";

/** Grouped bars of revenue / earnings / free cash flow by fiscal year. */
export function FinancialsChart({ data, height = 260 }: { data: FinancialYear[]; height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="year" tick={tick} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(v) => formatCompactCurrency(v)} width={56} tick={tick} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }} content={<FinTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
          <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
          <Bar dataKey="earnings" name="Earnings" fill="hsl(var(--score-growth))" radius={[3, 3, 0, 0]} />
          <Bar dataKey="fcf" name="Free cash flow" fill="hsl(var(--score-dividend))" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const tick = { fill: "hsl(var(--muted-foreground))", fontSize: 11 };

function FinTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <div className="mb-1 font-medium">FY {label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 tabular">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span>{formatCompactCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}
