"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ScreenerTable } from "@/components/discovery/screener-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_ASSETS, INVESTMENT_IDEAS } from "@/data";
import { overallScore } from "@/lib/snowflake";
import { cn } from "@/lib/utils";

type ClassFilter = "all" | "stock" | "crypto";

function ScreenerInner() {
  const params = useSearchParams();
  const ideaId = params.get("idea");
  const idea = INVESTMENT_IDEAS.find((i) => i.id === ideaId);

  const [klass, setKlass] = useState<ClassFilter>("all");
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("all");
  const [minScore, setMinScore] = useState(0);
  const [minYield, setMinYield] = useState(0);
  const [positiveOnly, setPositiveOnly] = useState(false);

  const sectors = useMemo(
    () => Array.from(new Set(ALL_ASSETS.map((a) => a.sector).filter(Boolean))) as string[],
    [],
  );

  const filtered = useMemo(() => {
    const ideaSymbols = idea ? new Set(idea.symbols) : null;
    return ALL_ASSETS.filter((a) => {
      if (ideaSymbols && !ideaSymbols.has(a.symbol)) return false;
      if (klass !== "all" && a.assetClass !== klass) return false;
      if (sector !== "all" && a.sector !== sector) return false;
      if (minScore && overallScore(a.snowflake) < minScore) return false;
      if (minYield && (a.dividendYield ?? 0) < minYield) return false;
      if (positiveOnly && a.change24h < 0) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!a.symbol.toLowerCase().includes(q) && !a.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [idea, klass, sector, minScore, minYield, positiveOnly, query]);

  const reset = () => {
    setKlass("all");
    setQuery("");
    setSector("all");
    setMinScore(0);
    setMinYield(0);
    setPositiveOnly(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Screener"
        subtitle="Filter and rank the entire stock + crypto universe."
        actions={
          <Button variant="ghost" size="sm" onClick={reset}>
            <X className="h-4 w-4" /> Reset
          </Button>
        }
      />

      {idea && (
        <div className="flex items-center gap-2 rounded-lg border bg-primary/5 px-4 py-2.5 text-sm">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span>
            Showing the <span className="font-semibold">{idea.title}</span> idea — {idea.description}
          </span>
        </div>
      )}

      <Card>
        <CardContent className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Asset class segmented control */}
          <div className="space-y-1.5">
            <Label>Asset class</Label>
            <div className="inline-flex w-full rounded-lg bg-muted p-0.5 text-sm">
              {(["all", "stock", "crypto"] as ClassFilter[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setKlass(c)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1 font-medium capitalize transition-colors",
                    klass === c ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {c === "all" ? "All" : c === "stock" ? "Stocks" : "Crypto"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="q">Search</Label>
            <Input id="q" placeholder="Symbol or name…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Sector / Category</Label>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all">All sectors</SelectItem>
                {sectors.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="flex justify-between">
              <span>Min Strata score</span>
              <span className="font-semibold tabular">{minScore}</span>
            </Label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="flex justify-between">
              <span>Min yield</span>
              <span className="font-semibold tabular">{minYield.toFixed(1)}%</span>
            </Label>
            <input
              type="range"
              min={0}
              max={8}
              step={0.5}
              value={minYield}
              onChange={(e) => setMinYield(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
          </div>

          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={positiveOnly}
                onChange={(e) => setPositiveOnly(e.target.checked)}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              Gainers only (24h)
            </label>
          </div>

          <div className="flex items-end">
            <Badge variant="secondary" className="px-3 py-1.5">
              {filtered.length} result{filtered.length !== 1 && "s"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <ScreenerTable data={filtered} />
    </div>
  );
}

export default function ScreenerPage() {
  return (
    <Suspense fallback={null}>
      <ScreenerInner />
    </Suspense>
  );
}
