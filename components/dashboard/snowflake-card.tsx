"use client";

import type { SnowflakeScore } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SnowflakeRadar } from "@/components/charts/snowflake-radar";
import { SnowflakeBreakdown } from "@/components/shared/snowflake-breakdown";
import { ScorePill } from "@/components/shared/score-pill";
import { overallScore } from "@/lib/snowflake";

/** Portfolio-level Snowflake: radar + per-axis breakdown + overall grade. */
export function SnowflakeCard({ score, title = "Portfolio Snowflake", description }: {
  score: SnowflakeScore;
  title?: string;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description ?? "Weighted across your holdings"}</CardDescription>
        </div>
        <ScorePill score={overallScore(score)} />
      </CardHeader>
      <CardContent>
        <SnowflakeRadar score={score} size={200} />
        <SnowflakeBreakdown score={score} className="mt-4" />
      </CardContent>
    </Card>
  );
}
