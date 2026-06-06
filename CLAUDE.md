# CLAUDE.md — Strata project guide

Guidance for any Claude session working in this repo. Read this first.

> **📌 RULE — Changelog discipline (update this file with every commit).**
> Every commit that changes code, config, data, or behavior MUST also update the
> **[Changelog](#changelog)** section below **in the same commit**. Add a dated entry
> describing what changed and why. Keep the [Operating Notes](#operating-notes) and
> [Status](#status) sections current when they're affected. Treat this as part of
> "done" — a code change without a Changelog entry is incomplete.
> _(Hard-enforced: a Claude `PreToolUse` hook blocks `git commit` when code is
> staged without `CLAUDE.md`. See [Enforcement](#enforcement).)_

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
npm test           # vitest run (unit + component tests)
npm run test:watch # vitest watch mode
npm run e2e        # playwright E2E (needs browsers: npm run e2e:install)
```

- **Unit/component tests (Vitest):** pure logic (`lib/portfolio|format|snowflake`) in the
  node env; presentational components (`components/shared/*.test.tsx`) opt into jsdom via
  `// @vitest-environment jsdom`. 17 tests.
- **E2E (Playwright):** `e2e/*.spec.ts` smoke-tests the main routes + ⌘K palette. Needs
  browser binaries — blocked under the dev allowlist (Playwright CDN), so run where the
  CDN is reachable.

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
- **Changelog-enforcement hook:** `.claude/hooks/require-changelog.sh` is a `PreToolUse`
  (Bash) hook that blocks any `git commit` where files are staged but `CLAUDE.md` is not —
  making the changelog rule self-enforcing within Claude sessions. It no-ops on
  non-commit commands and on empty staging. (Commits made outside Claude aren't covered;
  add a git-native `pre-commit` hook if you want that too.)

## Status

| Area | State |
| --- | --- |
| App (dashboard, portfolio, screener, ideas, watchlist, asset pages) | ✅ built |
| Crypto live provider (CoinGecko) | ✅ wired, mock fallback |
| Stock live provider (FMP) | ✅ wired (needs `FMP_API_KEY`), mock fallback |
| Live data in screener / dashboard movers / watchlist | ✅ via `useMarketAssets` |
| Tests | ✅ Vitest — 17 unit+component tests; Playwright E2E smoke specs (need browsers) |

## Enforcement

The Changelog rule is **self-enforcing** via a Claude `PreToolUse` hook
(`.claude/hooks/require-changelog.sh`, registered in `.claude/settings.json`): it blocks
`git commit` when changes are staged but `CLAUDE.md` is not. Validated to (a) ignore
non-commit Bash commands, (b) block commits missing `CLAUDE.md` (exit 2), (c) allow when
`CLAUDE.md` is staged or nothing is staged.

**Also installed:** a **git-native** `pre-commit` hook (`.githooks/pre-commit`) that covers
commits made outside Claude too. Activate it with `git config core.hooksPath .githooks`
(the SessionStart hook does this automatically in web sessions). Bypass intentionally with
`git commit --no-verify`.

---

## Changelog

_Newest first. Update with every commit (see rule at top)._

### 2026-06-06
- **Security: bump Next.js 15.1.3 → 15.5.19** (+ `eslint-config-next` to match) to patch
  CVE-2025-66478. Typecheck, lint, 17 tests and build all pass; `npm ci` clean. (`next lint`
  now prints a deprecation notice — works fine; migrate to the ESLint CLI before Next 16.)
- **Add GitHub Actions CI** (`.github/workflows/ci.yml`): on push/PR runs `npm ci` then
  typecheck → lint → test → build on Node 22 (npm cache, concurrency-cancel). E2E omitted
  (needs Playwright browsers). NOTE: `npm ci` warns `next@15.1.3` has CVE-2025-66478 —
  bump to a patched 15.x when convenient.
- **Wire FX display-currency conversion** (`lib/api/fx.ts`, `app/api/fx`, `hooks/use-fx.ts`):
  `useMoney()` converts USD→selected currency (live rates via open.er-api.com, static
  fallback) and is wired into the dashboard overview cards, holdings table and asset
  header. Settings currency selector now actually converts. Charts remain USD.
- **Add standalone HTML preview** (`preview/strata-preview.html`): a build-free,
  single-file mock of the dashboard (CDN Tailwind + Chart.js, inline mock data) with
  working light/dark + brand-theme toggles, for quickly showing the UI without `npm`.
- **Add component tests + Playwright E2E**: 5 jsdom component tests (ScorePill, ChangeBadge,
  MetricCard, SnowflakeBreakdown) via Testing Library (Vitest now has `@vitejs/plugin-react`
  + jsdom setup, 17 tests total); Playwright config + `e2e/smoke.spec.ts` covering the main
  routes and the ⌘K palette (`npm run e2e` / `e2e:install`).
- **Add Settings page** (`/settings`): appearance (mode + brand swatches), display-currency
  preference (`ui-store.currency`, FX conversion documented as a seam), and a live
  **Data Source Status** panel that probes `/api/stocks` + `/api/crypto` and reports
  live/mock per provider. Linked from the sidebar and user menu.
- **Live OHLC history for charts**: `fetchCryptoHistory` (CoinGecko market_chart,
  synthesized candles) and `fetchStockHistory` (FMP historical-price-full, true OHLC).
  Single-asset routes now return live `history` for the price/candlestick/comparison
  charts, degrading to curated mock history on failure.
- **Add git-native `pre-commit` hook** (`.githooks/pre-commit`) enforcing the changelog
  rule for all commits (not just Claude's). SessionStart hook now runs
  `git config core.hooksPath .githooks` to auto-activate it in web sessions.
- **Add multi-asset performance comparison chart** (`components/charts/comparison-chart.tsx`)
  on the asset Charts tab: rebases each series to 0% over a selectable range and lets the
  user toggle peer assets (sourced from `useSimilarAssets`) to compare relative returns.
- **Add changelog-enforcement hook** (`.claude/hooks/require-changelog.sh`, `PreToolUse`
  in `.claude/settings.json`): blocks `git commit` when code is staged without `CLAUDE.md`,
  making the changelog rule self-enforcing. Tested for ignore/block/allow paths.
- **Add Vitest + 12 unit tests** for the pure engine/helpers (`lib/portfolio.ts`
  average-cost accounting & value series, `lib/format.ts`, `lib/snowflake.ts`). Added
  `npm test` / `npm run test:watch` scripts and `vitest.config.ts` (`@/` alias).
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
