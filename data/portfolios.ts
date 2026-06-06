import type { Portfolio } from "@/types";

/**
 * Seed portfolios with realistic transaction histories.
 *
 * Holdings, P&L, weights and the portfolio snowflake are all *derived* from
 * these transactions at runtime (see `lib/portfolio.ts`), mirroring how a real
 * brokerage sync would feed raw fills into the same engine.
 */
export const SEED_PORTFOLIOS: Portfolio[] = [
  {
    id: "pf-main",
    name: "Core Portfolio",
    baseCurrency: "USD",
    cash: 12_400,
    transactions: [
      { id: "t1", assetId: "stock-aapl", type: "buy", quantity: 80, price: 165.2, date: "2024-09-12" },
      { id: "t2", assetId: "stock-nvda", type: "buy", quantity: 140, price: 48.5, date: "2024-06-03" },
      { id: "t3", assetId: "stock-nvda", type: "sell", quantity: 40, price: 118.0, date: "2025-11-20" },
      { id: "t4", assetId: "stock-msft", type: "buy", quantity: 35, price: 402.0, date: "2025-01-15" },
      { id: "t5", assetId: "stock-googl", type: "buy", quantity: 90, price: 142.3, date: "2025-03-04" },
      { id: "t6", assetId: "crypto-btc", type: "buy", quantity: 0.85, price: 43200, date: "2024-10-01" },
      { id: "t7", assetId: "crypto-eth", type: "buy", quantity: 9.5, price: 2480, date: "2024-12-18" },
      { id: "t8", assetId: "crypto-sol", type: "buy", quantity: 120, price: 96.0, date: "2025-02-22" },
      { id: "t9", assetId: "stock-jpm", type: "buy", quantity: 45, price: 188.0, date: "2025-04-10" },
      { id: "t10", assetId: "crypto-link", type: "buy", quantity: 600, price: 13.1, date: "2025-05-08" },
    ],
  },
  {
    id: "pf-crypto",
    name: "Crypto Satellite",
    baseCurrency: "USD",
    cash: 3_100,
    transactions: [
      { id: "c1", assetId: "crypto-btc", type: "buy", quantity: 0.4, price: 61000, date: "2025-03-15" },
      { id: "c2", assetId: "crypto-eth", type: "buy", quantity: 6, price: 3100, date: "2025-04-02" },
      { id: "c3", assetId: "crypto-sol", type: "buy", quantity: 80, price: 132, date: "2025-05-19" },
      { id: "c4", assetId: "crypto-rndr", type: "buy", quantity: 400, price: 5.1, date: "2025-05-28" },
      { id: "c5", assetId: "crypto-arb", type: "buy", quantity: 3000, price: 0.92, date: "2025-06-01" },
    ],
  },
];
