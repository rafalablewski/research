import type { SnowflakeScore } from "@/types";

export const SNOWFLAKE_AXES: {
  key: keyof SnowflakeScore;
  label: string;
  color: string;
  description: string;
}[] = [
  { key: "value", label: "Value", color: "hsl(var(--score-value))", description: "How attractively priced relative to fair value." },
  { key: "growth", label: "Growth", color: "hsl(var(--score-growth))", description: "Forecast earnings / adoption growth." },
  { key: "past", label: "Past", color: "hsl(var(--score-past))", description: "Historical performance and consistency." },
  { key: "health", label: "Health", color: "hsl(var(--score-health))", description: "Balance-sheet / protocol resilience." },
  { key: "dividend", label: "Income", color: "hsl(var(--score-dividend))", description: "Dividend or staking yield quality." },
];

/** Overall 0–100 score from the five axes (each 0–5). */
export function overallScore(s: SnowflakeScore): number {
  const sum = s.value + s.growth + s.past + s.health + s.dividend;
  return Math.round((sum / 25) * 100);
}

export function scoreLabel(score100: number): { label: string; tone: "good" | "ok" | "weak" } {
  if (score100 >= 70) return { label: "Strong", tone: "good" };
  if (score100 >= 45) return { label: "Fair", tone: "ok" };
  return { label: "Weak", tone: "weak" };
}
