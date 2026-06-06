"use client";

import { useQuery } from "@tanstack/react-query";
import { STATIC_RATES } from "@/lib/api/fx";
import { useUIStore } from "@/stores/ui-store";
import { formatCurrency, formatCompactCurrency, formatPrice } from "@/lib/format";

/** Live (or static-fallback) USD-based FX rates. */
export function useFxRates() {
  return useQuery<{ source: "live" | "static"; rates: Record<string, number> }>({
    queryKey: ["fx", "rates"],
    queryFn: () => fetch("/api/fx").then((r) => r.json()),
    initialData: { source: "static", rates: STATIC_RATES },
    staleTime: 3_600_000,
  });
}

/**
 * Currency-aware money formatter bound to the user's display-currency preference.
 *
 * All amounts in the app are stored in USD; these helpers convert at the current
 * FX rate and format with the right symbol/precision. Use instead of calling the
 * raw `format*` helpers directly on currency values.
 */
export function useMoney() {
  const currency = useUIStore((s) => s.currency);
  const { data } = useFxRates();
  const rate = data.rates[currency] ?? 1;

  return {
    currency,
    rate,
    convert: (usd: number) => usd * rate,
    /** Standard amount, e.g. "$1,234.00" / "€1,135.28". */
    format: (usd: number) => formatCurrency(usd * rate, currency),
    /** Abbreviated, e.g. "$1.2M" / "¥190.5M". */
    compact: (usd: number) => formatCompactCurrency(usd * rate, currency),
    /** Adaptive precision for asset prices (small crypto values). */
    price: (usd: number) => formatPrice(usd * rate, currency),
  };
}
