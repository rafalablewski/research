"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { AssetLogo } from "@/components/shared/asset-logo";
import { ChangeBadge } from "@/components/shared/change-badge";
import { formatPrice } from "@/lib/format";
import { STOCKS, CRYPTOS } from "@/data";
import { useUIStore } from "@/stores/ui-store";

/**
 * Unified ⌘K search across stocks and crypto. Opens from the navbar search box
 * or the keyboard shortcut, and routes to the asset page on select.
 */
export function SearchCommand() {
  const router = useRouter();
  const open = useUIStore((s) => s.commandOpen);
  const setOpen = useUIStore((s) => s.setCommandOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (e.key === "/" && isTyping(e)) return;
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const go = (symbol: string) => {
    setOpen(false);
    router.push(`/assets/${symbol}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search stocks & crypto by name or symbol…" />
      <CommandList>
        <CommandEmpty>No assets found.</CommandEmpty>
        <CommandGroup heading="Stocks">
          {STOCKS.map((a) => (
            <CommandItem key={a.id} value={`${a.symbol} ${a.name}`} onSelect={() => go(a.symbol)}>
              <ResultRow symbol={a.symbol} name={a.name} price={a.price} change={a.change24h} color={a.logoColor} />
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Crypto">
          {CRYPTOS.map((a) => (
            <CommandItem key={a.id} value={`${a.symbol} ${a.name}`} onSelect={() => go(a.symbol)}>
              <ResultRow symbol={a.symbol} name={a.name} price={a.price} change={a.change24h} color={a.logoColor} />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

function ResultRow({
  symbol,
  name,
  price,
  change,
  color,
}: {
  symbol: string;
  name: string;
  price: number;
  change: number;
  color: string;
}) {
  return (
    <div className="flex w-full items-center gap-3">
      <AssetLogo asset={{ symbol, name, logoColor: color }} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{symbol}</span>
          <TrendingUp className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="truncate text-xs text-muted-foreground">{name}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium tabular">{formatPrice(price)}</div>
        <ChangeBadge value={change} showIcon={false} />
      </div>
    </div>
  );
}

/** A trigger that looks like a search field for the navbar. */
export function SearchTrigger({ className }: { className?: string }) {
  const setOpen = useUIStore((s) => s.setCommandOpen);
  const [mac, setMac] = useState(true);
  useEffect(() => setMac(navigator.platform.toLowerCase().includes("mac")), []);

  return (
    <button
      onClick={() => setOpen(true)}
      className={`group flex h-9 items-center gap-2 rounded-lg border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted ${className ?? ""}`}
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">Search assets…</span>
      <kbd className="ml-auto hidden rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium sm:inline">
        {mac ? "⌘" : "Ctrl"} K
      </kbd>
    </button>
  );
}

function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement;
  return t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
}
