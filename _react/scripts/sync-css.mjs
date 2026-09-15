// dist/style.css 합성: _build/style.src.css 에서 토큰 블록 + 최소 base + 'Live component samples' 블록만 뽑는다.
// 사이트 크롬(header/sidebar/page, min-width:1200px, 본문 h1/h2/p 규칙, 코드 패널)은 제외.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.resolve(here, "..", "..", "_build");
const LIB = require(path.join(BUILD, "lib.js"));
const src = fs.readFileSync(path.join(BUILD, "style.src.css"), "utf8");

const tokensEnd = src.indexOf("*{box-sizing");
if (tokensEnd < 0) throw new Error("style.src.css: '*{box-sizing' 기준점을 찾을 수 없음");
const tokens = src.slice(0, tokensEnd).replace('url("PretendardVariable.woff2")', 'url("fonts/PretendardVariable.woff2")').trim();

const a = src.indexOf(LIB.SAMPLES_START), b = src.indexOf(LIB.SAMPLES_END);
if (a < 0 || b < 0) throw new Error("style.src.css: Live component samples 마커 없음");
const samples = src.slice(a, b + LIB.SAMPLES_END.length);

const base = `/* ---------- Base (패키지용 최소 규칙) ---------- */
*{box-sizing:border-box}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
:focus-visible{outline:2px solid var(--border-focus);outline-offset:2px}
[hidden]{display:none!important}
/* 앱 루트(또는 body)에 .ds-root 를 붙이면 서체·색·배경 토큰이 적용됩니다 */
.ds-root{font-family:var(--font-sans);font-size:15px;line-height:1.65;color:var(--text-primary);background:var(--bg-canvas);-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums}
.ds-root pre,.ds-root pre code{font-family:var(--font-mono)}.ds-root code,.ds-root kbd{font-family:var(--font-sans)}
.ds-root a{color:inherit}`;

const out = `/* @jiran/ds-react — 생성 파일. 원본: _build/style.src.css (토큰 + Live component samples). 수정하지 마세요. */
${tokens}

${base}

${samples}
`;

// 크롬 유출 방지 검사
for (const bad of [".header{", ".sidebar{", ".shell{", "min-width:1200px", ".example{", ".code-tabs{"]) {
  if (out.includes(bad)) throw new Error(`sync-css: 사이트 크롬 규칙이 포함됨: ${bad}`);
}
for (const must of [":root{", ".btn{", ".tbl{", "@font-face", ".popup-backdrop{"]) {
  if (!out.includes(must)) throw new Error(`sync-css: 필수 규칙 없음: ${must}`);
}

const dist = path.resolve(here, "..", "dist");
fs.mkdirSync(path.join(dist, "fonts"), { recursive: true });
fs.writeFileSync(path.join(dist, "style.css"), out);
fs.copyFileSync(path.join(BUILD, "PretendardVariable.woff2"), path.join(dist, "fonts", "PretendardVariable.woff2"));
console.log(`style.css: ${(out.length / 1024).toFixed(1)} KB`);
