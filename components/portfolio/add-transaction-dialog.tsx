"use client";

import { useEffect, useState } from "react";
import type { Asset } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AssetLogo } from "@/components/shared/asset-logo";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { ALL_ASSETS, getAssetBySymbol } from "@/data";
import { cn } from "@/lib/utils";

/**
 * Add a buy/sell transaction to the active portfolio. Can be opened with a
 * preselected asset (from an asset page) or with an asset picker (portfolio page).
 */
export function AddTransactionDialog({
  open,
  onOpenChange,
  asset,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  asset?: Asset;
}) {
  const { portfolios, activeId, addTransaction } = usePortfolioStore();
  const [symbol, setSymbol] = useState(asset?.symbol ?? "");
  const [type, setType] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const selected = getAssetBySymbol(symbol);
  const active = portfolios.find((p) => p.id === activeId);

  useEffect(() => {
    if (open) {
      setSymbol(asset?.symbol ?? "");
      setType("buy");
      setQuantity("");
      setPrice(asset ? String(asset.price) : "");
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [open, asset]);

  // Default the price to the live mock price when an asset is picked.
  useEffect(() => {
    if (selected && !price) setPrice(String(selected.price));
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  const valid = selected && Number(quantity) > 0 && Number(price) > 0;

  function submit() {
    if (!valid || !selected) return;
    addTransaction(activeId, {
      assetId: selected.id,
      type,
      quantity: Number(quantity),
      price: Number(price),
      date,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add transaction</DialogTitle>
          <DialogDescription>Record a buy or sell in {active?.name ?? "your portfolio"}.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Buy / Sell toggle */}
          <div className="grid grid-cols-2 gap-2">
            {(["buy", "sell"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "rounded-lg border py-2 text-sm font-medium capitalize transition-colors",
                  type === t
                    ? t === "buy"
                      ? "border-bull bg-bull/10 text-bull"
                      : "border-bear bg-bear/10 text-bear"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Asset</Label>
            {asset ? (
              <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                <AssetLogo asset={asset} size="sm" />
                <span className="text-sm font-medium">{asset.symbol}</span>
                <span className="truncate text-sm text-muted-foreground">{asset.name}</span>
              </div>
            ) : (
              <Select value={symbol} onValueChange={setSymbol}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {ALL_ASSETS.map((a) => (
                    <SelectItem key={a.id} value={a.symbol}>
                      {a.symbol} · {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input id="qty" type="number" min="0" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input id="price" type="number" min="0" step="any" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          {valid && (
            <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Total {type === "buy" ? "cost" : "proceeds"}: </span>
              <span className="font-semibold tabular">
                ${(Number(quantity) * Number(price)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!valid}>Add transaction</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
