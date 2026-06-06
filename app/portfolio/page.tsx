"use client";

import { useState } from "react";
import { Plus, Upload, Coins } from "lucide-react";
import { useActivePortfolio } from "@/hooks/use-portfolio";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { PerformanceCard } from "@/components/dashboard/performance-card";
import { SnowflakeCard } from "@/components/dashboard/snowflake-card";
import { AllocationCard } from "@/components/dashboard/allocation-card";
import { HoldingsTable } from "@/components/portfolio/holdings-table";
import { TransactionsList } from "@/components/portfolio/transactions-list";
import { AddTransactionDialog } from "@/components/portfolio/add-transaction-dialog";
import { ImportDialog } from "@/components/portfolio/import-dialog";
import { AssetLogo } from "@/components/shared/asset-logo";
import { formatCurrency } from "@/lib/format";

export default function PortfolioPage() {
  const { portfolio, summary } = useActivePortfolio();
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  if (!portfolio || !summary) return <p className="text-muted-foreground">No portfolio selected.</p>;

  // Dividend / staking income forecast per holding.
  const incomeRows = summary.holdings
    .filter((h) => (h.asset.dividendYield ?? 0) > 0)
    .map((h) => ({
      asset: h.asset,
      annual: h.marketValue * ((h.asset.dividendYield ?? 0) / 100),
    }))
    .sort((a, b) => b.annual - a.annual);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={portfolio.name}
        subtitle="Holdings, transactions, performance and income."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4" /> Import CSV
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" /> Add transaction
            </Button>
          </>
        }
      />

      <OverviewCards summary={summary} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PerformanceCard summary={summary} cash={portfolio.cash} />
        </div>
        <SnowflakeCard score={summary.snowflake} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent className="px-2">
          <HoldingsTable holdings={summary.holdings} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <AllocationCard summary={summary} />

        {/* Dividend / staking forecast */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-score-dividend" /> Income Forecast
            </CardTitle>
            <span className="text-sm font-semibold tabular">{formatCurrency(summary.annualDividendIncome)}/yr</span>
          </CardHeader>
          <CardContent className="space-y-2">
            {incomeRows.length === 0 && <p className="py-4 text-sm text-muted-foreground">No income-paying holdings.</p>}
            {incomeRows.map(({ asset, annual }) => (
              <div key={asset.id} className="flex items-center gap-3 text-sm">
                <AssetLogo asset={asset} size="sm" />
                <span className="font-medium">{asset.symbol}</span>
                <span className="text-xs text-muted-foreground">{asset.dividendYield?.toFixed(2)}%</span>
                <span className="ml-auto font-semibold tabular">{formatCurrency(annual)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <TransactionsList portfolio={portfolio} />
      </div>

      <AddTransactionDialog open={addOpen} onOpenChange={setAddOpen} />
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
