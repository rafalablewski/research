"use client";

import { Star, Plus, Radio } from "lucide-react";
import type { Asset } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssetLogo } from "@/components/shared/asset-logo";
import { ChangeBadge } from "@/components/shared/change-badge";
import { ScorePill } from "@/components/shared/score-pill";
import { formatPrice, formatCompactCurrency } from "@/lib/format";
import { overallScore } from "@/lib/snowflake";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { cn } from "@/lib/utils";

/** Hero header for an asset page: identity, price, key stats, actions. */
export function AssetHeader({ asset, onAddTransaction }: { asset: Asset; onAddTransaction?: () => void }) {
  const symbols = useWatchlistStore((s) => s.symbols);
  const toggle = useWatchlistStore((s) => s.toggle);
  const watched = symbols.includes(asset.symbol);

  const stats: { label: string; value: string }[] = [
    { label: "Market Cap", value: formatCompactCurrency(asset.marketCap) },
    { label: "24h Volume", value: formatCompactCurrency(asset.volume24h) },
    asset.assetClass === "stock"
      ? { label: "P/E Ratio", value: asset.peRatio ? asset.peRatio.toFixed(1) : "—" }
      : { label: "Circ. Supply", value: asset.circulatingSupply ? formatCompactCurrency(asset.circulatingSupply).replace("$", "") : "—" },
    {
      label: asset.assetClass === "stock" ? "Dividend Yield" : "Staking Yield",
      value: asset.dividendYield ? `${asset.dividendYield.toFixed(2)}%` : "—",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <AssetLogo asset={asset} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{asset.name}</h1>
              <Badge variant="secondary">{asset.symbol}</Badge>
              <Badge variant="outline" className="hidden sm:inline-flex">
                {asset.assetClass === "stock" ? asset.exchange : asset.sector}
              </Badge>
              {asset.dataSource && asset.dataSource !== "mock" && (
                <Badge variant="bull" className="gap-1">
                  <Radio className="h-3 w-3" /> Live · {asset.dataSource === "coingecko" ? "CoinGecko" : "FMP"}
                </Badge>
              )}
            </div>
            <div className="mt-1.5 flex items-baseline gap-3">
              <span className="text-3xl font-bold tabular">{formatPrice(asset.price)}</span>
              <ChangeBadge value={asset.change24h} size="md" />
              <span className="text-sm text-muted-foreground">today</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="mr-1 hidden flex-col items-end md:flex">
            <span className="text-xs text-muted-foreground">Strata Score</span>
            <ScorePill score={overallScore(asset.snowflake)} />
          </div>
          <Button
            variant={watched ? "secondary" : "outline"}
            size="sm"
            onClick={() => toggle(asset.symbol)}
            className="gap-1.5"
          >
            <Star className={cn("h-4 w-4", watched && "fill-amber-400 text-amber-400")} />
            {watched ? "Watching" : "Watch"}
          </Button>
          <Button size="sm" className="gap-1.5" onClick={onAddTransaction}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card p-3.5">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="mt-0.5 font-semibold tabular">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
