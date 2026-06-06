"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { SnowflakeScore } from "@/types";
import { SNOWFLAKE_AXES } from "@/lib/snowflake";

/**
 * The Simply-Wall-St-style "Snowflake": a 5-axis radar of the dimension scores.
 * Each axis is 0–5. Renders crisply in light and dark via CSS-variable colours.
 */
export function SnowflakeRadar({
  score,
  size = 220,
  showLabels = true,
  className,
}: {
  score: SnowflakeScore;
  size?: number;
  showLabels?: boolean;
  className?: string;
}) {
  const data = SNOWFLAKE_AXES.map((axis) => ({
    axis: axis.label,
    value: score[axis.key],
    full: 5,
  }));

  return (
    <div className={className} style={{ height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="hsl(var(--border))" />
          {showLabels && (
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 600 }}
            />
          )}
          <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="hsl(var(--primary))"
            fillOpacity={0.35}
            isAnimationActive
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
