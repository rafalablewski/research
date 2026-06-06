"use client";

import { Trash2 } from "lucide-react";
import type { Portfolio } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssetLogo } from "@/components/shared/asset-logo";
import { getAssetById } from "@/data";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { usePortfolioStore } from "@/stores/portfolio-store";

/** Chronological transaction ledger with delete. */
export function TransactionsList({ portfolio }: { portfolio: Portfolio }) {
  const removeTransaction = usePortfolioStore((s) => s.removeTransaction);
  const txs = [...portfolio.transactions].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        {txs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <div className="divide-y">
            {txs.map((t) => {
              const asset = getAssetById(t.assetId);
              if (!asset) return null;
              return (
                <div key={t.id} className="group flex items-center gap-3 px-2 py-2.5">
                  <AssetLogo asset={asset} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{asset.symbol}</span>
                      <Badge variant={t.type === "buy" ? "bull" : "bear"} className="capitalize">{t.type}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{formatDate(t.date)}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="tabular">
                      {formatNumber(t.quantity, t.quantity < 10 ? 4 : 2)} @ {formatCurrency(t.price)}
                    </div>
                    <div className="text-xs text-muted-foreground tabular">{formatCurrency(t.quantity * t.price)}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => removeTransaction(portfolio.id, t.id)}
                    aria-label="Delete transaction"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-bear" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
