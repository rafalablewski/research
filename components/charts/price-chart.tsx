"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PricePoint } from "@/types";
import { cn } from "@/lib/utils";
import { formatPrice, formatDate, formatCompact } from "@/lib/format";
import { Button } from "@/components/ui/button";

type Range = "1W" | "1M" | "3M" | "6M" | "1Y";
type Mode = "area" | "candles";

const RANGE_DAYS: Record<Range, number> = { "1W": 7, "1M": 30, "3M": 90, "6M": 180, "1Y": 365 };

/**
 * Advanced asset price chart with range selector, area/candlestick toggle and a
 * volume sub-panel. Candlesticks are drawn with a custom Recharts shape so the
 * whole thing stays dependency-light and theme-aware.
 */
export function PriceChart({
  history,
  className,
  defaultRange = "3M",
}: {
  history: PricePoint[];
  className?: string;
  defaultRange?: Range;
}) {
  const [range, setRange] = useState<Range>(defaultRange);
  const [mode, setMode] = useState<Mode>("area");

  const data = useMemo(() => history.slice(-RANGE_DAYS[range]), [history, range]);
  const up = data.length > 1 && data[data.length - 1].close >= data[0].close;
  const stroke = up ? "hsl(var(--bull))" : "hsl(var(--bear))";

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-lg bg-muted p-0.5">
          {(Object.keys(RANGE_DAYS) as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                range === r ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="inline-flex gap-1">
          <Button variant={mode === "area" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("area")}>
            Area
          </Button>
          <Button variant={mode === "candles" ? "secondary" : "ghost"} size="sm" onClick={() => setMode("candles")}>
            Candles
          </Button>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {mode === "area" ? (
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="price-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(d) => formatDate(d, { year: undefined })} minTickGap={36} tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis domain={["auto", "auto"]} orientation="right" tickFormatter={(v) => formatPrice(v)} width={72} tick={tickStyle} axisLine={false} tickLine={false} />
              <Tooltip content={<PriceTooltip />} />
              <Area type="monotone" dataKey="close" stroke={stroke} strokeWidth={2} fill="url(#price-fill)" isAnimationActive />
            </AreaChart>
          ) : (
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(d) => formatDate(d, { year: undefined })} minTickGap={36} tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis domain={["auto", "auto"]} orientation="right" tickFormatter={(v) => formatPrice(v)} width={72} tick={tickStyle} axisLine={false} tickLine={false} />
              <Tooltip content={<PriceTooltip />} />
              <Bar dataKey="high" shape={<Candle />} isAnimationActive={false} />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Volume sub-panel */}
      <div className="h-[64px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
            <YAxis hide domain={[0, "dataMax"]} />
            <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={<VolumeTooltip />} />
            <Bar dataKey="volume" radius={[2, 2, 0, 0]} isAnimationActive={false}>
              {data.map((d, i) => {
                const green = i === 0 || d.close >= data[i - 1].close;
                return <Cell key={i} fill={green ? "hsl(var(--bull))" : "hsl(var(--bear))"} fillOpacity={0.35} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const tickStyle = { fill: "hsl(var(--muted-foreground))", fontSize: 11 };

/** Custom candlestick shape: wick (high→low) + body (open→close). */
function Candle(props: any) {
  const { x, width, y, height, payload, background } = props;
  if (!payload || !background) return null;
  const { open, close, high, low } = payload as PricePoint;
  const up = close >= open;
  const color = up ? "hsl(var(--bull))" : "hsl(var(--bear))";

  // Map price → pixel using the band the bar was given (background spans the axis).
  const range = high - low || 1;
  const pxPer = height / range;
  const bodyTop = y + (high - Math.max(open, close)) * pxPer;
  const bodyH = Math.max(Math.abs(close - open) * pxPer, 1);
  const cx = x + width / 2;

  return (
    <g stroke={color} fill={color}>
      <line x1={cx} x2={cx} y1={y} y2={y + height} strokeWidth={1} />
      <rect x={x + width * 0.2} y={bodyTop} width={width * 0.6} height={bodyH} rx={1} />
    </g>
  );
}

function PriceTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as PricePoint;
  return (
    <div className="rounded-lg border bg-popover/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <div className="font-medium">{formatDate(p.date)}</div>
      <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 tabular">
        <span className="text-muted-foreground">Open</span><span className="text-right">{formatPrice(p.open)}</span>
        <span className="text-muted-foreground">High</span><span className="text-right">{formatPrice(p.high)}</span>
        <span className="text-muted-foreground">Low</span><span className="text-right">{formatPrice(p.low)}</span>
        <span className="text-muted-foreground">Close</span><span className="text-right font-semibold">{formatPrice(p.close)}</span>
      </div>
    </div>
  );
}

function VolumeTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as PricePoint;
  return (
    <div className="rounded-lg border bg-popover/95 px-3 py-1.5 text-xs shadow-lg backdrop-blur tabular">
      Vol {formatCompact(p.volume)}
    </div>
  );
}
