import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [   // 긴 키가 먼저 — "@jiran/ds-react" 가 접두어로 "/chart" 까지 먹지 않게
      { find: "@jiran/ds-react/chart", replacement: fileURLToPath(new URL("./src/chart/index.tsx", import.meta.url)) },
      { find: "@jiran/ds-react", replacement: fileURLToPath(new URL("./src/index.ts", import.meta.url)) },
    ],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["tests/setup.ts"],
    include: ["src/**/*.test.tsx", "src/**/*.test.ts", "tests/**/*.test.tsx", "tests/**/*.test.ts"],
    css: false,
  },
});
