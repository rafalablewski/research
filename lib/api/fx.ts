/**
 * FX rates provider (display-currency conversion).
 *
 * Rates are USD-based (1 USD → N units of currency). A small static table is the
 * always-available fallback so conversion works offline; a live provider upgrades
 * it when reachable. Like the market providers, calls run server-side via
 * `app/api/fx` and degrade gracefully.
 *
 * ── To go live ──────────────────────────────────────────────────────────────
 * `open.er-api.com` (used below) needs no key. In Claude Code on the web the
 * network policy must allowlist it; otherwise the static table is returned.
 */

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

/** USD-based fallback rates (approximate, for offline/demo use). */
export const STATIC_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 157,
};

export async function fetchRates(): Promise<{ source: "live" | "static"; rates: Record<string, number> }> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`FX ${res.status}`);
    const json = (await res.json()) as { rates?: Record<string, number> };
    if (!json.rates) throw new Error("FX: no rates");
    const rates: Record<string, number> = {};
    for (const c of SUPPORTED_CURRENCIES) rates[c] = json.rates[c] ?? STATIC_RATES[c];
    return { source: "live", rates };
  } catch {
    return { source: "static", rates: STATIC_RATES };
  }
}
