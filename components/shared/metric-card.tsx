import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ChangeBadge } from "./change-badge";

/**
 * Headline KPI card used across the dashboard.
 * Optional `change` renders a directional badge; optional `accent` tints the icon.
 */
export function MetricCard({
  label,
  value,
  sub,
  change,
  icon: Icon,
  accent = "text-primary",
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  change?: number;
  icon?: LucideIcon;
  accent?: string;
  className?: string;
}) {
  return (
    <Card className={cn("group p-5 hover:shadow-md", className)}>
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 transition-colors group-hover:bg-muted",
              accent,
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight tabular">{value}</span>
        {change !== undefined && <ChangeBadge value={change} />}
      </div>
      {sub && <div className="mt-1 text-xs text-muted-foreground tabular">{sub}</div>}
    </Card>
  );
}
