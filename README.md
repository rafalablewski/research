# Strata — Investment Research Platform

> _See every layer of your investments._

Strata is a modern, production-grade investment research web app for **stocks and
cryptocurrency**, inspired by Simply Wall St, TradingView, Linear and Arc. It pairs
an opinionated fintech design system with Simply-Wall-St-style **Snowflake scores**,
portfolio analytics, a powerful screener and beautiful, theme-aware charts.

The app ships with **realistic mock data** (10 stocks + 10 cryptos) and clearly marked
seams where real market-data APIs plug in.

![tech](https://img.shields.io/badge/Next.js-15-black) ![tech](https://img.shields.io/badge/React-19-149eca) ![tech](https://img.shields.io/badge/TypeScript-5-3178c6) ![tech](https://img.shields.io/badge/Tailwind-3-38bdf8)

---

## ✨ Features

| Area | Highlights |
| --- | --- |
| **Dashboard / Command Center** | Total value, IRR, unrealized & realized P&L, dividend yield · portfolio **Snowflake** radar · performance chart · allocation donut · top holdings · market movers · news · investment ideas |
| **Portfolio Management** | Multiple portfolios · buy/sell transactions with average-cost accounting · realized/unrealized gains · **CSV import simulation** · dividend & staking income forecast · transaction ledger |
| **Asset Research** | Unified hero (price, market cap, volume, score) · Snowflake (Value / Growth / Past / Health / Income) · rewards & risks · DCF valuation gauge · financials chart (stocks) · on-chain metrics (crypto) · management/team · insider/whale activity · similar assets · advanced price+volume chart with range selector and candlesticks |
| **Discovery & Screener** | TanStack Table with sortable columns · filter by class, sector, score, yield, gainers · curated **Investment Ideas** (AI, High Dividend, Layer 1s, DeFi…) · **watchlist** |
| **Design & UX** | Light / Dark / System + extensible **brand themes** · collapsible sidebar · ⌘K command palette · skeletons, error & empty states · micro-interactions · fully responsive · theme-aware charts |

---

## 🧱 Tech Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**-style components on **Radix UI** primitives
- **Recharts** for all data visualisation (radar, area, candlestick, donut, bars, sparklines)
- **Zustand** (+ `persist`) for client state — portfolios, watchlist, UI
- **TanStack Query** for the data-fetching layer · **TanStack Table** for the screener
- **next-themes** for mode switching · **cmdk** for the command palette · **lucide-react** icons

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
# → http://localhost:3000

# Other scripts
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

Requires **Node 18.18+** (developed on Node 22).

---

## 📁 Project Structure

```
strata/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout: fonts, providers, app shell (sidebar + navbar)
│   ├── providers.tsx           # QueryClient + Theme + Tooltip providers
│   ├── globals.css             # Theme tokens (light/dark/brand) + utilities
│   ├── page.tsx                # Dashboard / command center
│   ├── portfolio/page.tsx      # Portfolio management
│   ├── screener/page.tsx       # Filterable screener
│   ├── ideas/page.tsx          # Curated investment ideas
│   ├── watchlist/page.tsx      # Watchlist
│   ├── assets/[symbol]/page.tsx# Asset research page (tabs)
│   └── loading / error / not-found
│
├── components/
│   ├── ui/                     # Reusable primitives (button, card, tabs, dialog, select, command…)
│   ├── layout/                 # Sidebar, navbar, theme provider/switcher, search palette, selectors
│   ├── shared/                 # MetricCard, ScorePill, ChangeBadge, AssetLogo, SnowflakeBreakdown…
│   ├── charts/                 # SnowflakeRadar, PriceChart, AllocationDonut, FinancialsChart, Sparkline
│   ├── dashboard/              # Overview/Performance/Snowflake/Allocation/Movers/News cards
│   ├── portfolio/              # HoldingsTable, transactions, add-transaction & import dialogs
│   ├── asset/                  # AssetHeader + research sections (valuation, on-chain, team, activity…)
│   └── discovery/              # ScreenerTable, IdeaCard
│
├── data/                       # Mock data (stocks, cryptos, news, ideas, portfolios) + helpers
├── hooks/                      # use-assets (TanStack Query), use-portfolio (derived analytics)
├── stores/                     # Zustand stores (portfolio, watchlist, ui)
├── lib/                        # utils, format, portfolio engine, snowflake, theme registry
└── types/                      # Shared domain types
```

---

## 🎨 Theming — Light / Dark / Brand

Theming is **two orthogonal layers** so any brand colour works in any mode:

1. **Mode** (`light` / `dark` / `system`) — owned by `next-themes` via the `class` attribute.
2. **Brand** (`default` / `ocean` / `violet` / …) — owned by `ThemeProvider` via the
   `data-theme` attribute on `<html>`, persisted to `localStorage`.

Every colour is a CSS variable (raw HSL channels) in `app/globals.css`, consumed by Tailwind.

### Add a new brand theme in 2 steps

```css
/* app/globals.css */
[data-theme="sunset"] {
  --primary: 14 90% 53%;
  --ring: 14 90% 53%;
}
.dark[data-theme="sunset"] {
  --background: 14 40% 7%;
  --card: 14 35% 11%;
  --primary: 14 90% 60%;
}
```

```ts
// lib/themes.ts
export const BRAND_THEMES = [
  // …existing
  { id: "sunset", label: "Sunset", swatch: "hsl(14 90% 53%)" },
];
```

It now appears in the theme switcher automatically. Charts pick up the new colours
because they reference the same CSS variables.

---

## 🔌 Plugging in Real Market Data

The app is **mock-first** but structured so going live touches only the data layer.

### 1. The fetch seam — `hooks/use-assets.ts`

Every component already consumes data through TanStack Query hooks that currently
resolve from local mocks with simulated latency. Swap the `queryFn` bodies for real
calls:

```ts
export function useAsset(symbol: string) {
  return useQuery({
    queryKey: ["asset", symbol],
    queryFn: () => fetch(`/api/assets/${symbol}`).then((r) => r.json()),
  });
}
```

### 2. Add server route handlers (keep API keys server-side)

Create `app/api/assets/[symbol]/route.ts` that proxies a provider and maps the
response into the `Asset` shape in `types/index.ts`.

### 3. Suggested providers

| Data | Provider | Maps to |
| --- | --- | --- |
| Stock quotes & OHLC | **Polygon.io**, Alpha Vantage | `price`, `change*`, `history` |
| Fundamentals, ratios, **DCF** | **Financial Modeling Prep** | `peRatio`, `eps`, `financials`, `fairValue` |
| Insider trades, news | **Finnhub** | `ActivityEvent`, `NewsItem` |
| Crypto market data & supply | **CoinGecko** / CoinMarketCap | `marketCap`, `circulatingSupply`, `maxSupply` |
| Crypto TVL | **DefiLlama** | `tvl` |
| On-chain (active addresses, whales) | **Glassnode** / Dune | `activeAddresses`, whale `ActivityEvent` |

### 4. The Snowflake score

`SnowflakeScore` (0–5 per axis) is currently authored in the mock data. In production,
compute it server-side from fundamentals/on-chain metrics — the UI (`SnowflakeRadar`,
`SnowflakeBreakdown`, `ScorePill`, `overallScore`) stays unchanged.

> **Note on accuracy:** all numbers in `data/` are illustrative mock figures for a demo,
> not investment advice.

---

## 🧮 How Portfolio Analytics Work

`lib/portfolio.ts` is a pure engine that folds a portfolio's **transaction list** into
holdings using average-cost accounting, then derives market value, unrealized/realized
P&L, weights, a value-weighted Snowflake, allocation breakdowns, dividend income and an
IRR estimate. This mirrors a real brokerage sync feeding raw fills into the same engine —
swap average-cost for FIFO/LIFO or live prices in one place.

---

## 🗺️ Extending

- **New page?** add a folder under `app/` and a nav item in `components/layout/sidebar.tsx`.
- **New chart?** drop it in `components/charts/` and reference CSS-variable colours so it stays theme-aware.
- **New metric card / widget?** compose the primitives in `components/shared/` and `components/ui/`.
- **New asset field?** extend `types/index.ts`, populate it in `data/`, surface it in `components/asset/`.

---

## 📄 License

MIT — provided for demonstration and educational purposes. Not financial advice.
