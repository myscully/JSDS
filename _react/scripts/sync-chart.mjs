// src/chart/ds-chart.js 합성: _build/ds-chart.src.js(사이트 assets/ds-chart.js 의 원본)를 그대로 복사한다.
// 사이트 · 순수 JS 제품 · React 가 같은 어댑터를 쓰기 위해서다 — 여기서 고치지 말고 _build/ds-chart.src.js 를 고친다(생성물, .gitignore).
// 끝에 ESM default export 를 붙여 `import DSChart from "./ds-chart.js"` 가 되게 한다(esbuild 는 IIFE 안의 module.exports 를 CJS 로 보지 않는다).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(here, "..", "..", "_build", "ds-chart.src.js");
const out = path.resolve(here, "..", "src", "chart", "ds-chart.js");
const body = fs.readFileSync(src, "utf8");
for (const must of ["module.exports = DSChart", "presets", "mount", "theme", "auto"]) if (!body.includes(must)) throw new Error(`sync-chart: 원본에 ${must} 가 없다`);
/* vite-node(vitest) 는 ESM 래퍼의 module.exports 가 읽기 전용 Module 객체라 대입이 던진다 — 복사본에서는 그 줄을 뺀다(원본은 node require 용으로 둔다) */
const esm = body.replace(/^\s*if \(typeof module !== "undefined" && module\.exports\) module\.exports = DSChart;\n/m, "");
if (esm === body) throw new Error("sync-chart: module.exports 줄을 찾지 못했다");
fs.mkdirSync(path.dirname(out), { recursive: true });
/* esbuild · rollup 은 IIFE 안의 module.exports 를 CJS 신호로 보지 않는다 — ESM default export 를 덧붙인다(원본은 전역 DSChart 를 만든다) */
fs.writeFileSync(out, `/* @jiran/ds-react — 생성 파일. 원본: _build/ds-chart.src.js. 수정하지 마세요. */\n${esm}\nexport default (typeof window !== "undefined" ? window : globalThis).DSChart;\n`);
console.log(`ds-chart.js: ${(body.length / 1024).toFixed(1)} KB`);
