import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E config.
 *
 * Run with `npm run e2e`. Browsers must be installed first
 * (`npm run e2e:install`) — in Claude Code on the web this needs the Playwright
 * CDN allowlisted; it is blocked under the default dev network policy.
 *
 * The webServer block builds and starts the app automatically (or reuses a
 * server already running on :3000).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
