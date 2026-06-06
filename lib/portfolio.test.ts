import { describe, it, expect } from "vitest";
import { computePortfolioSummary, buildValueSeries } from "./portfolio";
import { getAssetById } from "@/data";
import type { Portfolio } from "@/types";

const AAPL = getAssetById("stock-aapl")!;

function pf(transactions: Portfolio["transactions"], cash = 0): Portfolio {
  return { id: "t", name: "Test", baseCurrency: "USD", cash, transactions };
}

describe("computePortfolioSummary — average-cost accounting", () => {
  it("computes quantity, average cost and invested across multiple buys", () => {
    const s = computePortfolioSummary(
      pf([
        { id: "1", assetId: "stock-aapl", type: "buy", quantity: 10, price: 100, date: "2025-01-01" },
        { id: "2", assetId: "stock-aapl", type: "buy", quantity: 10, price: 200, date: "2025-02-01" },
      ]),
    );
    const h = s.holdings[0];
    expect(h.quantity).toBe(20);
    expect(h.avgCost).toBeCloseTo(150);
    expect(h.invested).toBeCloseTo(3000);
    // Market value uses the live (mock) price.
    expect(h.marketValue).toBeCloseTo(20 * AAPL.price);
    expect(h.unrealizedPL).toBeCloseTo(20 * AAPL.price - 3000);
  });

  it("books realized P&L against the running average cost on a sell", () => {
    const s = computePortfolioSummary(
      pf([
        { id: "1", assetId: "stock-aapl", type: "buy", quantity: 10, price: 100, date: "2025-01-01" },
        { id: "2", assetId: "stock-aapl", type: "buy", quantity: 10, price: 200, date: "2025-02-01" },
        { id: "3", assetId: "stock-aapl", type: "sell", quantity: 5, price: 250, date: "2025-03-01" },
      ]),
    );
    const h = s.holdings[0];
    // avg cost 150 → realized = (250 - 150) * 5 = 500
    expect(s.realizedPL).toBeCloseTo(500);
    expect(h.quantity).toBe(15);
    expect(h.invested).toBeCloseTo(2250); // 15 * 150
  });

  it("excludes fully-closed positions from holdings", () => {
    const s = computePortfolioSummary(
      pf([
        { id: "1", assetId: "stock-aapl", type: "buy", quantity: 5, price: 100, date: "2025-01-01" },
        { id: "2", assetId: "stock-aapl", type: "sell", quantity: 5, price: 120, date: "2025-02-01" },
      ]),
    );
    expect(s.holdings).toHaveLength(0);
    expect(s.realizedPL).toBeCloseTo(100); // (120-100)*5
  });

  it("weights sum to ~100% and includes cash in total value", () => {
    const s = computePortfolioSummary(
      pf(
        [
          { id: "1", assetId: "stock-aapl", type: "buy", quantity: 10, price: 100, date: "2025-01-01" },
          { id: "2", assetId: "crypto-btc", type: "buy", quantity: 1, price: 40000, date: "2025-01-01" },
        ],
        5000,
      ),
    );
    const totalWeight = s.holdings.reduce((sum, h) => sum + h.weight, 0);
    expect(totalWeight).toBeCloseTo(100, 1);
    const holdingsValue = s.holdings.reduce((sum, h) => sum + h.marketValue, 0);
    expect(s.totalValue).toBeCloseTo(holdingsValue + 5000);
  });

  it("derives a value-weighted portfolio snowflake within 0–5", () => {
    const s = computePortfolioSummary(
      pf([{ id: "1", assetId: "stock-aapl", type: "buy", quantity: 1, price: 100, date: "2025-01-01" }]),
    );
    // Single holding → portfolio snowflake equals that asset's snowflake.
    expect(s.snowflake).toEqual(AAPL.snowflake);
    Object.values(s.snowflake).forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(5);
    });
  });
});

describe("buildValueSeries", () => {
  it("returns a dated series whose last point reflects current holdings + cash", () => {
    const s = computePortfolioSummary(
      pf([{ id: "1", assetId: "stock-aapl", type: "buy", quantity: 10, price: 100, date: "2025-01-01" }], 1000),
    );
    const series = buildValueSeries(s.holdings, 1000, 30);
    expect(series.length).toBeGreaterThan(0);
    expect(series[0]).toHaveProperty("date");
    expect(series[0]).toHaveProperty("value");
    // Last close ≈ current price, so last value ≈ 10*price + cash.
    const last = series[series.length - 1].value;
    expect(last).toBeCloseTo(10 * AAPL.price + 1000, -1);
  });
});
