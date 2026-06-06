"use client";

import { Bell, TrendingUp, Newspaper, Gauge, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ALERTS } from "@/data";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const ICONS = { price: TrendingUp, news: Newspaper, score: Gauge, earnings: CalendarClock };
const TONE = {
  info: "text-primary bg-primary/10",
  warning: "text-amber-500 bg-amber-500/10",
  success: "text-bull bg-bull/10",
};

/** Alerts bell with a dropdown feed of price/news/score/earnings alerts. */
export function Notifications() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {ALERTS.length > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-bear ring-2 ring-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Alerts</span>
          <span className="text-xs text-muted-foreground">{ALERTS.length} new</span>
        </DropdownMenuLabel>
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {ALERTS.map((a) => {
            const Icon = ICONS[a.type];
            return (
              <div key={a.id} className="flex gap-3 rounded-lg px-2 py-2.5 hover:bg-accent">
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", TONE[a.severity])}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-medium leading-tight">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.body}</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {relativeTime(a.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
