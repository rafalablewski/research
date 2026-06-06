"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Transaction } from "@/types";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { getAssetBySymbol } from "@/data";

const SAMPLE = `symbol,type,quantity,price,date
AAPL,buy,25,170.50,2025-01-10
BTC,buy,0.25,52000,2025-02-14
MSFT,buy,10,410,2025-03-01
ETH,sell,2,3300,2025-04-05`;

/**
 * CSV import simulation. Parses `symbol,type,quantity,price,date` rows and adds
 * them to the active portfolio. A real build would accept a file upload and
 * map brokerage/exchange export formats here.
 */
export function ImportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { activeId, importTransactions } = usePortfolioStore();
  const [raw, setRaw] = useState(SAMPLE);
  const [done, setDone] = useState(0);

  function parse(): Omit<Transaction, "id">[] {
    const lines = raw.trim().split("\n").slice(1); // skip header
    const txs: Omit<Transaction, "id">[] = [];
    for (const line of lines) {
      const [symbol, type, quantity, price, date] = line.split(",").map((s) => s.trim());
      const asset = getAssetBySymbol(symbol);
      if (!asset || (type !== "buy" && type !== "sell")) continue;
      const q = Number(quantity);
      const p = Number(price);
      if (!q || !p) continue;
      txs.push({ assetId: asset.id, type, quantity: q, price: p, date: date || new Date().toISOString().slice(0, 10) });
    }
    return txs;
  }

  function submit() {
    const txs = parse();
    importTransactions(activeId, txs);
    setDone(txs.length);
    setTimeout(() => {
      setDone(0);
      onOpenChange(false);
    }, 1200);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" /> Import transactions
          </DialogTitle>
          <DialogDescription>
            Paste CSV rows as <code className="rounded bg-muted px-1">symbol,type,quantity,price,date</code>.
            A pre-filled sample is provided.
          </DialogDescription>
        </DialogHeader>

        {done > 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-bull" />
            <p className="font-medium">Imported {done} transactions</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="csv" className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> CSV data
            </Label>
            <textarea
              id="csv"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={7}
              spellCheck={false}
              className="w-full rounded-lg border bg-muted/30 p-3 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">{parse().length} valid rows detected.</p>
          </div>
        )}

        {done === 0 && (
          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={submit} disabled={parse().length === 0}>Import {parse().length || ""}</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
