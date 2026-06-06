"use client";

import Link from "next/link";
import { Check, X, ShieldCheck, Users, Activity, TrendingUp } from "lucide-react";
import type { Asset } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AssetLogo } from "@/components/shared/asset-logo";
import { ChangeBadge } from "@/components/shared/change-badge";
import { ScorePill } from "@/components/shared/score-pill";
import { useSimilarAssets } from "@/hooks/use-assets";
import { ACTIVITY } from "@/data";
import {
  formatPrice,
  formatCompactCurrency,
  formatNumber,
  formatPercent,
  formatDate,
  changeColor,
} from "@/lib/format";
import { overallScore } from "@/lib/snowflake";
import { cn } from "@/lib/utils";

/** Rewards vs Risks — Simply-Wall-St-style green/red bullet lists. */
export function RewardsRisks({ asset }: { asset: Asset }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-bull/10 text-bull">
            <Check className="h-4 w-4" />
          </span>
          <CardTitle className="text-base">Rewards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {asset.rewards.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-bull" />
              <span>{r.text}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-bear/10 text-bear">
            <X className="h-4 w-4" />
          </span>
          <CardTitle className="text-base">Risks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {asset.risks.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-bear" />
              <span>{r.text}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Valuation card. For stocks we mock a DCF by comparing price to `fairValue`.
 * For crypto we show a fair-value band derived from the same field if present.
 */
export function ValuationCard({ asset }: { asset: Asset }) {
  if (!asset.fairValue) return null;
  const discount = ((asset.fairValue - asset.price) / asset.fairValue) * 100;
  const undervalued = discount > 0;
  // Position of current price on a 0–(1.4×fairValue) scale.
  const scaleMax = asset.fairValue * 1.4;
  const pricePos = Math.min((asset.price / scaleMax) * 100, 100);
  const fairPos = (asset.fairValue / scaleMax) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" /> Valuation (DCF)
        </CardTitle>
        <CardDescription>
          {undervalued ? "Trading below" : "Trading above"} estimated fair value by{" "}
          <span className={undervalued ? "text-bull" : "text-bear"}>
            {formatPercent(Math.abs(discount), false)}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative mt-2 h-12">
          <div className="absolute inset-x-0 top-5 h-2 rounded-full bg-gradient-to-r from-bull/30 via-amber-400/30 to-bear/30" />
          {/* Fair value marker */}
          <div className="absolute top-2.5 -translate-x-1/2 text-center" style={{ left: `${fairPos}%` }}>
            <div className="mx-auto h-7 w-px bg-foreground/40" />
            <span className="text-[10px] text-muted-foreground">Fair {formatPrice(asset.fairValue)}</span>
          </div>
          {/* Current price marker */}
          <div className="absolute top-0 -translate-x-1/2 text-center" style={{ left: `${pricePos}%` }}>
            <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", undervalued ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear")}>
              {formatPrice(asset.price)}
            </span>
            <div className={cn("mx-auto mt-0.5 h-7 w-0.5", undervalued ? "bg-bull" : "bg-bear")} />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Intrinsic value is a simplified discounted-cash-flow estimate. Plug a provider DCF
          (e.g. Financial Modeling Prep) into <code className="rounded bg-muted px-1">asset.fairValue</code> for live figures.
        </p>
      </CardContent>
    </Card>
  );
}

/** Key statistics grid (adapts between stock and crypto fields). */
export function KeyStats({ asset }: { asset: Asset }) {
  const rows: [string, string][] =
    asset.assetClass === "stock"
      ? [
          ["Market Cap", formatCompactCurrency(asset.marketCap)],
          ["P/E Ratio", asset.peRatio?.toFixed(1) ?? "—"],
          ["P/B Ratio", asset.pbRatio?.toFixed(1) ?? "—"],
          ["EPS", asset.eps ? formatPrice(asset.eps) : "—"],
          ["Beta", asset.beta?.toFixed(2) ?? "—"],
          ["Dividend Yield", asset.dividendYield ? `${asset.dividendYield.toFixed(2)}%` : "—"],
          ["Shares Out.", asset.sharesOutstanding ? formatCompactCurrency(asset.sharesOutstanding).replace("$", "") : "—"],
          ["52w Change", formatPercent(asset.change1y)],
        ]
      : [
          ["Market Cap", formatCompactCurrency(asset.marketCap)],
          ["Circ. Supply", asset.circulatingSupply ? formatNumber(asset.circulatingSupply) : "—"],
          ["Max Supply", asset.maxSupply ? formatNumber(asset.maxSupply) : "∞"],
          ["TVL", asset.tvl ? formatCompactCurrency(asset.tvl) : "—"],
          ["Active Addr.", asset.activeAddresses ? formatNumber(asset.activeAddresses) : "—"],
          ["Staking Yield", asset.dividendYield ? `${asset.dividendYield.toFixed(2)}%` : "—"],
          ["Beta", asset.beta?.toFixed(2) ?? "—"],
          ["1y Change", formatPercent(asset.change1y)],
        ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-muted-foreground">{k}</dt>
              <dd className="mt-0.5 font-semibold tabular">{v}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

/** On-chain health bars for crypto: supply minted, TVL share, activity. */
export function OnChainMetrics({ asset }: { asset: Asset }) {
  if (asset.assetClass !== "crypto") return null;
  const minted = asset.maxSupply ? (asset.circulatingSupply! / asset.maxSupply) * 100 : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" /> On-chain Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {minted !== null && (
          <Metric label="Supply minted" value={`${minted.toFixed(1)}%`} pct={minted} hint={`${formatNumber(asset.circulatingSupply!)} of ${formatNumber(asset.maxSupply!)}`} />
        )}
        {asset.tvl ? (
          <Metric label="Total value locked" value={formatCompactCurrency(asset.tvl)} pct={Math.min((asset.tvl / asset.marketCap) * 100, 100)} hint={`${formatPercent((asset.tvl / asset.marketCap) * 100, false)} of market cap`} />
        ) : null}
        {asset.activeAddresses ? (
          <Metric label="Active addresses (24h)" value={formatNumber(asset.activeAddresses)} pct={Math.min((asset.activeAddresses / 1_500_000) * 100, 100)} hint="vs. network leader" />
        ) : null}
        {asset.dividendYield ? (
          <Metric label="Staking yield" value={`${asset.dividendYield.toFixed(2)}%`} pct={Math.min((asset.dividendYield / 10) * 100, 100)} hint="annualised rewards" />
        ) : null}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, pct, hint }: { label: string; value: string; pct: number; hint: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-semibold tabular">{value}</span>
      </div>
      <Progress value={pct} className="mt-1.5 h-1.5" />
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

/** Management / founding team (stocks). */
export function TeamCard({ asset }: { asset: Asset }) {
  if (!asset.team?.length) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" /> Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {asset.team.map((m) => (
          <div key={m.name} className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              {m.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{m.name}</div>
              <div className="truncate text-xs text-muted-foreground">{m.role}</div>
            </div>
            {m.tenureYears != null && (
              <span className="text-xs text-muted-foreground">{m.tenureYears}y tenure</span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/** Insider trades (stocks) / whale transactions (crypto). */
export function ActivityTable({ asset }: { asset: Asset }) {
  const events = ACTIVITY.filter((e) => e.symbol === asset.symbol);
  const title = asset.assetClass === "stock" ? "Insider Activity" : "Whale Activity";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No recent {title.toLowerCase()}.</p>
        ) : (
          <div className="space-y-2">
            {events.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div>
                  <div className="font-medium">{e.actor}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(e.date)}</div>
                </div>
                <div className="text-right">
                  <span className={cn("font-semibold tabular", e.action === "buy" ? "text-bull" : e.action === "sell" ? "text-bear" : "text-foreground")}>
                    {e.action === "sell" ? "−" : e.action === "buy" ? "+" : ""}
                    {formatCompactCurrency(e.amount)}
                  </span>
                  <div className="text-xs capitalize text-muted-foreground">{e.action}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** "Similar assets" grid using the tag-overlap recommender. */
export function SimilarAssets({ asset }: { asset: Asset }) {
  const { data: similar = [] } = useSimilarAssets(asset);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Similar Assets</CardTitle>
        <CardDescription>Comparable {asset.assetClass === "stock" ? "stocks" : "tokens"} by sector and theme</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {similar.map((a) => (
          <Link key={a.id} href={`/assets/${a.symbol}`} className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50">
            <AssetLogo asset={a} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">{a.symbol}</div>
              <div className="truncate text-xs text-muted-foreground">{a.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium tabular">{formatPrice(a.price)}</div>
              <ChangeBadge value={a.change24h} showIcon={false} />
            </div>
            <ScorePill score={overallScore(a.snowflake)} showLabel={false} />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
