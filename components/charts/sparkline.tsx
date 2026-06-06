"use client";

import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import type { PricePoint } from "@/types";

/** Tiny inline trend chart for tables/cards. Colour follows direction. */
export function Sparkline({
  data,
  width = 96,
  height = 36,
  positive,
}: {
  data: PricePoint[];
  width?: number;
  height?: number;
  positive?: boolean;
}) {
  const points = data.slice(-40).map((p) => ({ v: p.close }));
  const up = positive ?? (points.length > 1 && points[points.length - 1].v >= points[0].v);
  const color = up ? "hsl(var(--bull))" : "hsl(var(--bear))";
  const id = `spark-${Math.round(points[0]?.v ?? 0)}-${up ? "u" : "d"}`;

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${id})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
