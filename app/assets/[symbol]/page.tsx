"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsset } from "@/hooks/use-assets";
import { AssetHeader } from "@/components/asset/asset-header";
import {
  RewardsRisks,
  ValuationCard,
  KeyStats,
  OnChainMetrics,
  TeamCard,
  ActivityTable,
  SimilarAssets,
} from "@/components/asset/sections";
import { SnowflakeCard } from "@/components/dashboard/snowflake-card";
import { PriceChart } from "@/components/charts/price-chart";
import { FinancialsChart } from "@/components/charts/financials-chart";
import { NewsCard } from "@/components/dashboard/news-card";
import { AddTransactionDialog } from "@/components/portfolio/add-transaction-dialog";

/** Detailed research page for a single asset (stock or crypto). */
export default function AssetPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = use(params);
  const { data: asset, isLoading } = useAsset(symbol);
  const [txOpen, setTxOpen] = useState(false);

  if (isLoading) return <AssetSkeleton />;
  if (!asset) notFound();

  return (
    <div className="space-y-6 animate-fade-in">
      <AssetHeader asset={asset} onAddTransaction={() => setTxOpen(true)} />

      <Tabs defaultValue="overview">
        <div className="overflow-x-auto scrollbar-thin">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financials">{asset.assetClass === "stock" ? "Financials" : "On-chain"}</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="activity">{asset.assetClass === "stock" ? "Insiders" : "Whales"}</TabsTrigger>
            <TabsTrigger value="similar">Similar</TabsTrigger>
          </TabsList>
        </div>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About {asset.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{asset.description}</p>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <RewardsRisks asset={asset} />
              <ValuationCard asset={asset} />
              <KeyStats asset={asset} />
            </div>
            <SnowflakeCard
              score={asset.snowflake}
              title="Snowflake Score"
              description={`How ${asset.symbol} scores across five dimensions`}
            />
          </div>
        </TabsContent>

        {/* ── Financials / On-chain ── */}
        <TabsContent value="financials" className="space-y-6">
          {asset.assetClass === "stock" && asset.financials ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Revenue, Earnings & Cash Flow</CardTitle>
                  <CardDescription>Reported fiscal-year fundamentals</CardDescription>
                </CardHeader>
                <CardContent>
                  <FinancialsChart data={asset.financials} />
                </CardContent>
              </Card>
              <KeyStats asset={asset} />
            </>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <OnChainMetrics asset={asset} />
              <KeyStats asset={asset} />
            </div>
          )}
        </TabsContent>

        {/* ── Charts ── */}
        <TabsContent value="charts">
          <Card>
            <CardHeader>
              <CardTitle>Price & Volume</CardTitle>
              <CardDescription>Interactive — switch range and chart type</CardDescription>
            </CardHeader>
            <CardContent>
              <PriceChart history={asset.history} defaultRange="6M" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── News ── */}
        <TabsContent value="news">
          <NewsCard symbols={[asset.symbol]} limit={10} />
        </TabsContent>

        {/* ── Activity ── */}
        <TabsContent value="activity" className="grid gap-6 lg:grid-cols-2">
          <ActivityTable asset={asset} />
          {asset.assetClass === "stock" ? <TeamCard asset={asset} /> : <OnChainMetrics asset={asset} />}
        </TabsContent>

        {/* ── Similar ── */}
        <TabsContent value="similar">
          <SimilarAssets asset={asset} />
        </TabsContent>
      </Tabs>

      <AddTransactionDialog open={txOpen} onOpenChange={setTxOpen} asset={asset} />
    </div>
  );
}

function AssetSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-10 w-96 rounded-lg" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}
