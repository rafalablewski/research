import { Newspaper } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NEWS } from "@/data";
import { relativeTime } from "@/lib/format";

const SENTIMENT = {
  positive: { variant: "bull" as const, label: "Bullish" },
  neutral: { variant: "muted" as const, label: "Neutral" },
  negative: { variant: "bear" as const, label: "Bearish" },
};

/** Latest market news with sentiment tags and related symbols. */
export function NewsCard({ limit = 6, symbols }: { limit?: number; symbols?: string[] }) {
  const items = (symbols
    ? NEWS.filter((n) => n.relatedSymbols.some((s) => symbols.includes(s)))
    : NEWS
  ).slice(0, limit);

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <Newspaper className="h-4 w-4 text-muted-foreground" />
        <CardTitle>Latest News</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.length === 0 && <p className="py-4 text-sm text-muted-foreground">No recent news.</p>}
        {items.map((n) => {
          const s = SENTIMENT[n.sentiment];
          return (
            <a
              key={n.id}
              href={n.url}
              className="-mx-2 block rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/50"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium leading-snug">{n.title}</p>
                <Badge variant={s.variant} className="shrink-0">{s.label}</Badge>
              </div>
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{n.summary}</p>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">{n.source}</span>
                <span>·</span>
                <span>{relativeTime(n.publishedAt)}</span>
                <div className="ml-auto flex gap-1">
                  {n.relatedSymbols.slice(0, 3).map((sym) => (
                    <span key={sym} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">{sym}</span>
                  ))}
                </div>
              </div>
            </a>
          );
        })}
      </CardContent>
    </Card>
  );
}
