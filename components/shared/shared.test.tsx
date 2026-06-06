// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScorePill } from "./score-pill";
import { ChangeBadge } from "./change-badge";
import { MetricCard } from "./metric-card";
import { SnowflakeBreakdown } from "./snowflake-breakdown";

describe("ScorePill", () => {
  it("renders the score and a label tone", () => {
    render(<ScorePill score={82} />);
    expect(screen.getByText("82")).toBeInTheDocument();
    expect(screen.getByText("Strong")).toBeInTheDocument();
  });

  it("hides the label when showLabel is false", () => {
    render(<ScorePill score={30} showLabel={false} />);
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.queryByText("Weak")).not.toBeInTheDocument();
  });
});

describe("ChangeBadge", () => {
  it("formats positive and negative values with the right colour class", () => {
    const { rerender, container } = render(<ChangeBadge value={2.5} />);
    expect(screen.getByText("2.50%")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("text-bull");

    rerender(<ChangeBadge value={-1.2} />);
    expect(screen.getByText("-1.20%")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("text-bear");
  });
});

describe("MetricCard", () => {
  it("renders label, value and an optional change badge", () => {
    render(<MetricCard label="Total Value" value="$1,234" change={3.1} />);
    expect(screen.getByText("Total Value")).toBeInTheDocument();
    expect(screen.getByText("$1,234")).toBeInTheDocument();
    expect(screen.getByText("3.10%")).toBeInTheDocument();
  });
});

describe("SnowflakeBreakdown", () => {
  it("renders all five axes", () => {
    render(<SnowflakeBreakdown score={{ value: 3, growth: 4, past: 2, health: 5, dividend: 1 }} />);
    ["Value", "Growth", "Past", "Health", "Income"].forEach((axis) => {
      expect(screen.getByText(axis)).toBeInTheDocument();
    });
    // The health axis value (5.0) should be shown.
    expect(screen.getByText("5.0")).toBeInTheDocument();
  });
});
