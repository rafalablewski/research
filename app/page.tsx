"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useActivePortfolio } from "@/hooks/use-portfolio";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { PerformanceCard } from "@/components/dashboard/performance-card";
import { SnowflakeCard } from "@/components/dashboard/snowflake-card";
import { AllocationCard } from "@/components/dashboard/allocation-card";
import { MoversCard } from "@/components/dashboard/movers-card";
import { NewsCard } from "@/components/dashboard/news-card";
import { HoldingsTable } from "@/components/portfolio/holdings-table";
import { IdeaCard } from "@/components/discovery/idea-card";
import { INVESTMENT_IDEAS } from "@/data";

/**
 * Portfolio Command Center.
 * Client component because it reads the active portfolio from the Zustand store
 * and derives all analytics on the fly.
 */
export default function DashboardPage() {
  const { portfolio, summary } = useActivePortfolio();

  if (!portfolio || !summary) {
    return <p className="text-muted-foreground">No portfolio selected.</p>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle={`${portfolio.name} · command center`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/portfolio">
              Manage portfolio <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <OverviewCards summary={summary} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PerformanceCard summary={summary} cash={portfolio.cash} />
        </div>
        <SnowflakeCard score={summary.snowflake} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Top Holdings</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/portfolio">View all <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="px-2">
            <HoldingsTable holdings={summary.holdings.slice(0, 5)} compact />
          </CardContent>
        </Card>
        <AllocationCard summary={summary} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MoversCard />
        <NewsCard limit={5} />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Investment Ideas</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/ideas">Explore all <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INVESTMENT_IDEAS.slice(0, 3).map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      </section>
    </div>
  );
}
