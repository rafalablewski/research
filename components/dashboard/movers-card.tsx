"use client";

import Link from "next/link";
import { useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetLogo } from "@/components/shared/asset-logo";
import { ChangeBadge } from "@/components/shared/change-badge";
import { formatPrice } from "@/lib/format";
import { ALL_ASSETS } from "@/data";

/** Top gainers and losers across the universe (by 24h change). */
export function MoversCard() {
  const { gainers, losers } = useMemo(() => {
    const sorted = [...ALL_ASSETS].sort((a, b) => b.change24h - a.change24h);
    return { gainers: sorted.slice(0, 4), losers: sorted.slice(-4).reverse() };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Movers</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        <MoverColumn title="Top Gainers" icon={<TrendingUp className="h-3.5 w-3.5 text-bull" />} assets={gainers} />
        <MoverColumn title="Top Losers" icon={<TrendingDown className="h-3.5 w-3.5 text-bear" />} assets={losers} />
      </CardContent>
    </Card>
  );
}

function MoverColumn({
  title,
  icon,
  assets,
}: {
  title: string;
  icon: React.ReactNode;
  assets: typeof ALL_ASSETS;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon} {title}
      </div>
      <div className="space-y-1">
        {assets.map((a) => (
          <Link
            key={a.id}
            href={`/assets/${a.symbol}`}
            className="-mx-2 flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent/50"
          >
            <AssetLogo asset={a} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold leading-tight">{a.symbol}</div>
              <div className="truncate text-xs text-muted-foreground">{formatPrice(a.price)}</div>
            </div>
            <ChangeBadge value={a.change24h} />
          </Link>
        ))}
      </div>
    </div>
  );
}
