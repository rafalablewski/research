import { cn } from "@/lib/utils";
import { scoreLabel } from "@/lib/snowflake";

/**
 * Compact 0–100 score pill (Simply-Wall-St style overall grade).
 * Colour ramps from bear → amber → bull as the score improves.
 */
export function ScorePill({
  score,
  showLabel = true,
  className,
}: {
  score: number;
  showLabel?: boolean;
  className?: string;
}) {
  const { label, tone } = scoreLabel(score);
  const tones = {
    good: "bg-bull/12 text-bull ring-bull/20",
    ok: "bg-amber-500/12 text-amber-500 ring-amber-500/20",
    weak: "bg-bear/12 text-bear ring-bear/20",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 tabular",
        tones[tone],
        className,
      )}
    >
      <span className="text-sm leading-none">{score}</span>
      {showLabel && <span className="opacity-80">{label}</span>}
    </span>
  );
}
