import { describe, it, expect } from "vitest";
import {
  formatPercent,
  formatCompactCurrency,
  formatPrice,
  changeColor,
} from "./format";
import { overallScore, scoreLabel } from "./snowflake";

describe("format helpers", () => {
  it("formatPercent adds a sign and two decimals", () => {
    expect(formatPercent(1.2)).toBe("+1.20%");
    expect(formatPercent(-3.456)).toBe("-3.46%");
    expect(formatPercent(2, false)).toBe("2.00%");
  });

  it("formatCompactCurrency abbreviates large magnitudes", () => {
    expect(formatCompactCurrency(1_500_000)).toBe("$1.5M");
    expect(formatCompactCurrency(1_230_000_000_000)).toBe("$1.23T");
    expect(formatCompactCurrency(-2_000_000)).toBe("-$2M");
  });

  it("formatPrice uses adaptive precision for small prices", () => {
    expect(formatPrice(182.4)).toBe("$182.40");
    expect(formatPrice(0.52)).toBe("$0.5200");
    expect(formatPrice(0.000023)).toBe("$0.00002300");
  });

  it("changeColor maps direction to theme classes", () => {
    expect(changeColor(5)).toBe("text-bull");
    expect(changeColor(-5)).toBe("text-bear");
    expect(changeColor(0)).toBe("text-muted-foreground");
  });
});

describe("snowflake scoring", () => {
  it("overallScore maps the 5 axes (0–5 each) to 0–100", () => {
    expect(overallScore({ value: 5, growth: 5, past: 5, health: 5, dividend: 5 })).toBe(100);
    expect(overallScore({ value: 0, growth: 0, past: 0, health: 0, dividend: 0 })).toBe(0);
    expect(overallScore({ value: 3, growth: 3, past: 3, health: 3, dividend: 3 })).toBe(60);
  });

  it("scoreLabel buckets into Strong / Fair / Weak", () => {
    expect(scoreLabel(80).tone).toBe("good");
    expect(scoreLabel(50).tone).toBe("ok");
    expect(scoreLabel(20).tone).toBe("weak");
  });
});
