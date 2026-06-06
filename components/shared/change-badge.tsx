import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/format";

/** Directional percentage chip (green up / red down) with an arrow. */
export function ChangeBadge({
  value,
  className,
  showIcon = true,
  size = "sm",
}: {
  value: number;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md";
}) {
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md font-semibold tabular",
        up ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear",
        size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm",
        className,
      )}
    >
      {showIcon && <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />}
      {formatPercent(value, false)}
    </span>
  );
}
