import type { SnowflakeScore } from "@/types";
import { SNOWFLAKE_AXES } from "@/lib/snowflake";
import { cn } from "@/lib/utils";

/** Per-axis horizontal bars (0–5) complementing the radar. */
export function SnowflakeBreakdown({ score, className }: { score: SnowflakeScore; className?: string }) {
  return (
    <div className={cn("space-y-2.5", className)}>
      {SNOWFLAKE_AXES.map((axis) => {
        const v = score[axis.key];
        return (
          <div key={axis.key} className="flex items-center gap-3">
            <span className="w-14 shrink-0 text-xs font-medium text-muted-foreground">{axis.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(v / 5) * 100}%`, background: axis.color }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-xs font-semibold tabular">{v.toFixed(1)}</span>
          </div>
        );
      })}
    </div>
  );
}
