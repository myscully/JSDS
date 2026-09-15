import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: false, // dist/style.css · dist/fonts 는 scripts/sync-css.mjs 가 관리
  target: "es2020",
  external: ["react", "react-dom", "react/jsx-runtime"],
  treeshake: true,
  minify: false,
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
});
