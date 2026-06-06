import { test, expect } from "@playwright/test";

/**
 * Smoke tests for the main routes and a couple of core interactions.
 * Browsers required (`npm run e2e:install`) — see playwright.config.ts.
 */

test("dashboard loads with KPIs and navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Total Value")).toBeVisible();
  await expect(page.getByRole("link", { name: "Screener" })).toBeVisible();
});

test("screener filters and renders the asset table", async ({ page }) => {
  await page.goto("/screener");
  await expect(page.getByRole("heading", { name: "Screener" })).toBeVisible();
  // Filter to a single symbol via the search box.
  await page.getByPlaceholder("Symbol or name…").fill("NVDA");
  await expect(page.getByText("NVIDIA Corporation")).toBeVisible();
});

test("asset page shows hero, score and tabs", async ({ page }) => {
  await page.goto("/assets/NVDA");
  await expect(page.getByRole("heading", { name: "NVIDIA Corporation" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Charts" })).toBeVisible();
  await page.getByRole("tab", { name: "Charts" }).click();
  await expect(page.getByText("Price & Volume")).toBeVisible();
});

test("portfolio page renders holdings", async ({ page }) => {
  await page.goto("/portfolio");
  await expect(page.getByRole("heading", { name: /Portfolio|Core/ })).toBeVisible();
  await expect(page.getByText("Holdings")).toBeVisible();
});

test("settings page exposes appearance and data sources", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.getByText("Appearance")).toBeVisible();
  await expect(page.getByText("Live Data Sources")).toBeVisible();
});

test("command palette opens and searches", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Meta+k");
  const input = page.getByPlaceholder(/Search stocks/i);
  await expect(input).toBeVisible();
  await input.fill("bitcoin");
  await expect(page.getByText("Bitcoin")).toBeVisible();
});
