import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

/** Vitest config — pure unit tests for lib/ logic. `@/` alias mirrors tsconfig. */
export default defineConfig({
  resolve: {
    alias: { "@": resolve(__dirname, ".") },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    globals: true,
  },
});
