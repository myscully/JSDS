import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  base: "./",
  plugins: [react()],
  resolve: { alias: [{ find: "@jiran/ds-react/chart", replacement: fileURLToPath(new URL("../src/chart/index.tsx", import.meta.url)) }, { find: "@jiran/ds-react", replacement: fileURLToPath(new URL("../src/index.ts", import.meta.url)) }] },
  server: { port: 5180, fs: { allow: [fileURLToPath(new URL("..", import.meta.url))] } },
  build: { outDir: "dist", emptyOutDir: true },
});
