# CLAUDE.md — Strata project guide

Guidance for any Claude session working in this repo. Read this first.

> **📌 RULE — Changelog discipline (update this file with every commit).**
> Every commit that changes code, config, data, or behavior MUST also update the
> **[Changelog](#changelog)** section below **in the same commit**. Add a dated entry
> describing what changed and why. Keep the [Operating Notes](#operating-notes) and
> [Status](#status) sections current when they're affected. Treat this as part of
> "done" — a code change without a Changelog entry is incomplete.
> _(This is a convention enforced by Claude, not the harness. For hard enforcement,
> add a git `pre-commit` or Claude `Stop` hook — see “Enforcement” below.)_

---

## What this is

**Strata** — a Next.js 15 / React 19 / TypeScript investment research app for stocks
and crypto (Simply Wall St–inspired). Mock-data-first with a live CoinGecko provider
wired in. See [README.md](./README.md) for the full feature and architecture tour.

## Commands

```bash
npm run dev        # dev server (http://localhost:3000)
npm run build      # production build (also typechecks + lints)
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

There is **no test suite** configured yet. `npm run typecheck` is the closest gate.

## Conventions

- **Styling:** Tailwind + CSS variables only. Never hard-code colors in components or
  charts — use the theme tokens (`bg-card`, `text-bull`, `hsl(var(--primary))`, …) so
  light/dark/brand themes keep working.
- **Theming:** two orthogonal layers — mode (`class`, next-themes) and brand
  (`data-theme`, ThemeProvider). New brand theme = a `[data-theme="…"]` block in
  `app/globals.css` + an entry in `lib/themes.ts`.
- **Data layer:** components read through hooks in `hooks/` (TanStack Query). Live data
  goes through `app/api/*` route handlers that call `lib/api/<provider>.ts` and **always
  fall back to mock data** on failure. Keep provider API keys server-side.
- **Types:** the `Asset`/`Portfolio`/… shapes in `types/index.ts` are the contract;
  providers map *into* them. Add optional fields rather than breaking existing ones.
- **Portfolio math:** all analytics derive from transactions via the pure engine in
  `lib/portfolio.ts`. Put accounting changes there, not in components.
- **Commits:** branch is `claude/practical-knuth-QU6Nk`. Conventional-commit style
  messages. Update the Changelog (see rule above).

## Operating Notes

- **Network allowlist (web sessions):** this environment's network policy only permits
  **npm + GitHub**. External market APIs (CoinGecko, FMP, Yahoo, Binance, …) return
  `403 Host not in allowlist`. Consequence: live provider routes serve **mock** data and
  report `source: "mock"` here — by design (graceful fallback). To get real live data,
  choose a broader network policy or allowlist the host (e.g. `api.coingecko.com`).
  Docs: https://code.claude.com/docs/en/claude-code-on-the-web
- **SessionStart hook:** `.claude/hooks/session-start.sh` runs `npm install` on session
  start (remote only, synchronous) so lint/typecheck/build are ready immediately.
  Registered in `.claude/settings.json`. Active for all sessions once merged to default.

## Status

| Area | State |
| --- | --- |
| App (dashboard, portfolio, screener, ideas, watchlist, asset pages) | ✅ built |
| Crypto live provider (CoinGecko) | ✅ wired, mock fallback |
| Stock live provider (FMP) | ✅ wired (needs `FMP_API_KEY`), mock fallback |
| Live data in screener / dashboard movers / watchlist | ✅ via `useMarketAssets` |
| Tests | ⛔ none configured |

## Enforcement (optional)

To make the Changelog rule self-enforcing instead of convention-based, add either:
- a git `pre-commit` hook that fails if `CLAUDE.md` isn't staged alongside code changes, or
- a Claude `Stop` hook in `.claude/settings.json` that reminds/append-checks before ending a turn.
Not installed yet — ask the user before adding.

---

## Changelog

_Newest first. Update with every commit (see rule at top)._

### 2026-06-06
- **Surface live data in dashboard Market Movers and Watchlist** by sourcing them from
  `useMarketAssets` instead of static mock imports.
- **Wire FMP live stock provider** (`lib/api/fmp.ts`, `app/api/stocks[/:symbol]`),
  symmetric to CoinGecko; needs `FMP_API_KEY`, mock fallback. `useAsset` now routes
  stocks→FMP and crypto→CoinGecko. Generalized the live badge to show the provider.
- **Add `useMarketAssets`** (merges live stocks + crypto) and wire the **screener** to
  it — live quotes now flow into the screener with a "Live" indicator. `Asset.dataSource`
  extended to include `"fmp"`.
- **Add CLAUDE.md** with project guide, conventions, operating notes (network allowlist,
  SessionStart hook), status table, and the Changelog-discipline rule.
- **Wire CoinGecko live crypto provider** (`lib/api/coingecko.ts`, `app/api/crypto[/:symbol]`):
  overlays live quotes on curated assets, transparent mock fallback, "Live · CoinGecko"
  badge on asset pages, `useCryptoMarkets` hook, `Asset.dataSource` field.
- **Add SessionStart hook** (`.claude/hooks/session-start.sh` + `.claude/settings.json`)
  to `npm install` in web sessions.
- **Initial build of Strata**: Next.js 15 app — dashboard, portfolio management, asset
  research pages, screener, ideas, watchlist; theme system (light/dark/brand); Zustand
  stores; TanStack Query/Table; Recharts; 10 stocks + 10 cryptos of mock data; README.
