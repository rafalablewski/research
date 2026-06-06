"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { AllocationSlice } from "@/types";
import { formatCompactCurrency, formatPercent } from "@/lib/format";

/** Donut chart for asset allocation (by class or sector) with a centre label. */
export function AllocationDonut({
  data,
  centerLabel,
  centerValue,
  size = 200,
}: {
  data: AllocationSlice[];
  centerLabel?: string;
  centerValue?: string;
  size?: number;
}) {
  return (
    <div className="relative" style={{ height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="64%"
            outerRadius="92%"
            paddingAngle={2}
            stroke="hsl(var(--background))"
            strokeWidth={2}
          >
            {data.map((s, i) => (
              <Cell key={i} fill={s.color} />
            ))}
          </Pie>
          <Tooltip content={<DonutTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && <span className="text-lg font-bold tabular">{centerValue}</span>}
          {centerLabel && <span className="text-xs text-muted-foreground">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const s = payload[0].payload as AllocationSlice;
  return (
    <div className="rounded-lg border bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <div className="flex items-center gap-2 font-medium">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
        {s.label}
      </div>
      <div className="mt-1 tabular text-muted-foreground">
        {formatCompactCurrency(s.value)} · {formatPercent(s.percent, false)}
      </div>
    </div>
  );
}
