"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Star, Telescope } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ScreenerTable } from "@/components/discovery/screener-table";
import { Button } from "@/components/ui/button";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { getAssetBySymbol } from "@/data";
import type { Asset } from "@/types";

export default function WatchlistPage() {
  const symbols = useWatchlistStore((s) => s.symbols);
  const assets = useMemo(
    () => symbols.map((s) => getAssetBySymbol(s)).filter(Boolean) as Asset[],
    [symbols],
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Watchlist"
        subtitle={`${assets.length} asset${assets.length !== 1 ? "s" : ""} you're tracking.`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/screener">
              <Telescope className="h-4 w-4" /> Find assets
            </Link>
          </Button>
        }
      />

      {assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400">
            <Star className="h-7 w-7" />
          </span>
          <h3 className="text-lg font-semibold">Your watchlist is empty</h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Star assets from the screener or any asset page to track them here.
          </p>
          <Button asChild className="mt-5">
            <Link href="/screener">Browse the screener</Link>
          </Button>
        </div>
      ) : (
        <ScreenerTable data={assets} />
      )}
    </div>
  );
}
