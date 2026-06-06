"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, Star } from "lucide-react";
import type { Asset } from "@/types";
import { AssetLogo } from "@/components/shared/asset-logo";
import { ChangeBadge } from "@/components/shared/change-badge";
import { ScorePill } from "@/components/shared/score-pill";
import { Sparkline } from "@/components/charts/sparkline";
import { Button } from "@/components/ui/button";
import { formatPrice, formatCompactCurrency } from "@/lib/format";
import { overallScore } from "@/lib/snowflake";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { cn } from "@/lib/utils";

/** Sortable, virtual-free screener table built on TanStack Table. */
export function ScreenerTable({ data }: { data: Asset[] }) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([{ id: "marketCap", desc: true }]);
  const symbols = useWatchlistStore((s) => s.symbols);
  const toggle = useWatchlistStore((s) => s.toggle);

  const columns = useMemo<ColumnDef<Asset>[]>(
    () => [
      {
        id: "watch",
        header: "",
        cell: ({ row }) => {
          const watched = symbols.includes(row.original.symbol);
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggle(row.original.symbol);
              }}
              className="text-muted-foreground transition-colors hover:text-amber-400"
              aria-label="Toggle watchlist"
            >
              <Star className={cn("h-4 w-4", watched && "fill-amber-400 text-amber-400")} />
            </button>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Asset",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <AssetLogo asset={row.original} size="sm" />
            <div className="min-w-0">
              <div className="font-semibold leading-tight">{row.original.symbol}</div>
              <div className="truncate text-xs text-muted-foreground">{row.original.name}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ getValue }) => <span className="tabular">{formatPrice(getValue<number>())}</span>,
      },
      {
        accessorKey: "change24h",
        header: "24h",
        cell: ({ getValue }) => <ChangeBadge value={getValue<number>()} showIcon={false} />,
      },
      {
        accessorKey: "change7d",
        header: "7d",
        cell: ({ getValue }) => <ChangeBadge value={getValue<number>()} showIcon={false} />,
      },
      {
        accessorKey: "marketCap",
        header: "Market Cap",
        cell: ({ getValue }) => <span className="tabular">{formatCompactCurrency(getValue<number>())}</span>,
      },
      {
        accessorKey: "volume24h",
        header: "Volume",
        cell: ({ getValue }) => <span className="tabular text-muted-foreground">{formatCompactCurrency(getValue<number>())}</span>,
      },
      {
        id: "trend",
        header: "30d Trend",
        enableSorting: false,
        cell: ({ row }) => <Sparkline data={row.original.history} positive={row.original.change7d >= 0} />,
      },
      {
        id: "score",
        accessorFn: (a) => overallScore(a.snowflake),
        header: "Score",
        cell: ({ getValue }) => <ScorePill score={getValue<number>()} showLabel={false} />,
      },
    ],
    [symbols, toggle],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto scrollbar-thin rounded-xl border">
      <table className="w-full min-w-[820px] text-sm">
        <thead className="bg-muted/40">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b">
              {hg.headers.map((header) => {
                const sortable = header.column.getCanSort();
                return (
                  <th key={header.id} className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {sortable ? (
                      <button
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown className="h-3 w-3 opacity-50" />
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => router.push(`/assets/${row.original.symbol}`)}
              className="cursor-pointer border-b last:border-0 transition-colors hover:bg-accent/50"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2.5">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-sm text-muted-foreground">
                No assets match your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
