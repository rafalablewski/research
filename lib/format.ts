/** Number / currency / date formatting helpers shared across the app. */

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

/** $1.23T / $45.6B / $789M style. */
export function formatCompactCurrency(value: number, currency = "USD") {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${compact.format(Math.abs(value))}`.replace("$", currencySymbol(currency));
}

export function formatCompact(value: number) {
  return compact.format(value);
}

export function formatCurrency(value: number, currency = "USD", maxFrac = 2) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: maxFrac,
    maximumFractionDigits: maxFrac,
  }).format(value);
}

/** Prices need adaptive precision: $182.40 but $0.000023 for micro-cap tokens. */
export function formatPrice(value: number, currency = "USD") {
  const frac = value >= 1 ? 2 : value >= 0.01 ? 4 : 8;
  return formatCurrency(value, currency, frac);
}

export function formatPercent(value: number, withSign = true) {
  const sign = withSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatNumber(value: number, maxFrac = 0) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxFrac,
  }).format(value);
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = {}) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...opts,
  });
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

function currencySymbol(currency: string) {
  return (
    {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
    }[currency] ?? "$"
  );
}

/** Tailwind text colour class for a directional value. */
export function changeColor(value: number) {
  if (value > 0) return "text-bull";
  if (value < 0) return "text-bear";
  return "text-muted-foreground";
}
