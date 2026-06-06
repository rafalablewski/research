"use client";

import { useQuery } from "@tanstack/react-query";
import { Radio, Database, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SourceResp = { source: "coingecko" | "fmp" | "mock"; assets: unknown[] };

/**
 * Live provider status panel. Hits the same route handlers the app uses and
 * reports whether each provider returned live data or fell back to mock — handy
 * for confirming an allowlist/API-key change took effect.
 */
export function DataSourceStatus() {
  const stocks = useQuery<SourceResp>({
    queryKey: ["status", "stocks"],
    queryFn: () => fetch("/api/stocks").then((r) => r.json()),
  });
  const crypto = useQuery<SourceResp>({
    queryKey: ["status", "crypto"],
    queryFn: () => fetch("/api/crypto").then((r) => r.json()),
  });

  const refetch = () => {
    stocks.refetch();
    crypto.refetch();
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Live Data Sources</CardTitle>
          <CardDescription>Provider status for market data</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={refetch} disabled={stocks.isFetching || crypto.isFetching}>
          <RefreshCw className={cn("h-4 w-4", (stocks.isFetching || crypto.isFetching) && "animate-spin")} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <ProviderRow
          name="Stocks"
          provider="Financial Modeling Prep"
          source={stocks.data?.source}
          count={stocks.data?.assets.length}
          loading={stocks.isLoading}
        />
        <ProviderRow
          name="Crypto"
          provider="CoinGecko"
          source={crypto.data?.source}
          count={crypto.data?.assets.length}
          loading={crypto.isLoading}
        />
        <p className="pt-1 text-xs text-muted-foreground">
          Showing <span className="font-medium">mock</span> means the provider was unreachable (host not
          allowlisted) or missing an API key — the app falls back gracefully. Allowlist
          <code className="mx-1 rounded bg-muted px-1">api.coingecko.com</code>/
          <code className="mx-1 rounded bg-muted px-1">financialmodelingprep.com</code> and set
          <code className="mx-1 rounded bg-muted px-1">FMP_API_KEY</code> to go live.
        </p>
      </CardContent>
    </Card>
  );
}

function ProviderRow({
  name,
  provider,
  source,
  count,
  loading,
}: {
  name: string;
  provider: string;
  source?: string;
  count?: number;
  loading: boolean;
}) {
  const live = source && source !== "mock";
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", live ? "bg-bull/10 text-bull" : "bg-muted text-muted-foreground")}>
        {live ? <Radio className="h-4 w-4" /> : <Database className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{name}</div>
        <div className="truncate text-xs text-muted-foreground">{provider}</div>
      </div>
      {loading ? (
        <Badge variant="muted">Checking…</Badge>
      ) : (
        <div className="text-right">
          <Badge variant={live ? "bull" : "muted"}>{live ? "Live" : "Mock"}</Badge>
          {count != null && <div className="mt-0.5 text-xs text-muted-foreground tabular">{count} assets</div>}
        </div>
      )}
    </div>
  );
}
