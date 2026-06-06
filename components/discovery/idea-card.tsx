import Link from "next/link";
import * as Icons from "lucide-react";
import { ArrowRight } from "lucide-react";
import type { InvestmentIdea } from "@/types";
import { Card } from "@/components/ui/card";
import { AssetLogo } from "@/components/shared/asset-logo";
import { getAssetBySymbol } from "@/data";
import { cn } from "@/lib/utils";

/** A curated "Investment Idea" tile (AI Leaders, High Dividend, Layer 1s, …). */
export function IdeaCard({ idea }: { idea: InvestmentIdea }) {
  const Icon = (Icons[idea.icon as keyof typeof Icons] ?? Icons.Sparkles) as Icons.LucideIcon;
  const assets = idea.symbols.map((s) => getAssetBySymbol(s)).filter(Boolean);

  return (
    <Link href={`/screener?idea=${idea.id}`}>
      <Card className={cn("group relative h-full overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:shadow-md")}>
        <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60", idea.accent)} />
        <div className="relative">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/80 text-primary shadow-sm ring-1 ring-border">
              <Icon className="h-5 w-5" />
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
          <h3 className="mt-3 font-semibold">{idea.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{idea.description}</p>
          <div className="mt-4 flex items-center -space-x-2">
            {assets.slice(0, 5).map(
              (a) => a && <AssetLogo key={a.id} asset={a} size="sm" className="ring-2 ring-card" />,
            )}
            <span className="pl-4 text-xs text-muted-foreground">{idea.symbols.length} assets</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
