import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

/**
 * Vitest config.
 * - Pure logic tests (lib/*.test.ts) run in the default `node` environment.
 * - Component tests opt into jsdom per-file via `// @vitest-environment jsdom`.
 * - Playwright E2E specs live in `e2e/*.spec.ts` and are excluded here.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": resolve(__dirname, ".") },
  },
  test: {
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
});
