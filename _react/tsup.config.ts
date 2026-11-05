import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts", chart: "src/chart/index.tsx" },   // chart 는 별도 진입점 — index 는 chart.js 를 참조하지 않는다
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: false, // dist/style.css · dist/fonts 는 scripts/sync-css.mjs 가 관리
  target: "es2020",
  external: ["react", "react-dom", "react/jsx-runtime", "chart.js"],   // chart.js 는 optional peer
  treeshake: true,
  minify: false,
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
});
