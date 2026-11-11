// dist/style.css 합성: _build/style.src.css 에서 토큰 블록 + 최소 base + 'Live component samples' 블록만 뽑는다.
// 사이트 크롬(header/sidebar/page, min-width:1280px, 본문 h1/h2/p 규칙, 코드 패널)은 제외.
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
@media (prefers-reduced-motion:reduce){*,*::before,*::after,*::details-content{transition:none!important;animation:none!important}.spinner,.btn.loading::after,.switch input[aria-busy="true"]::before{animation:spin .8s linear infinite!important}.spinner[data-delay]{animation:spin .8s linear infinite,ds-delay 0s var(--ds-delay,1s) both!important}.skeleton[data-delay],.spinner-wrap[data-delay],.skeleton-row[data-delay]{animation:ds-delay 0s var(--ds-delay,1s) both!important}}
:focus-visible{outline:1px solid var(--foreground-brand-primary);outline-offset:2px}
[hidden]{display:none!important}
/* 앱 루트(또는 body)에 .ds-root 를 붙이면 서체·색·배경 토큰이 적용됩니다 */
.ds-root{font-family:var(--font-sans);font-size:0.9375rem;line-height:1.65;color:var(--foreground-neutral-primary);background:var(--background-neutral-primary);-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums}
.ds-root pre,.ds-root pre code{font-family:var(--font-mono)}.ds-root code,.ds-root kbd{font-family:var(--font-sans)}
/* 링크 기본색만 지운다 — :where 로 우선순위를 0,0,1 에 둔다. .ds-root a(0,1,1)는 .btn:where(.solid.primary) 같은 단일 클래스 색을 이겨, 링크형 주 버튼 글자가 면과 같은 색이 됐다(대비 1.05) */
:where(.ds-root) a{color:inherit}`;

const out = `/* @jiran/ds-react — 생성 파일. 원본: _build/style.src.css (토큰 + Live component samples). 수정하지 마세요. */
${tokens}

${base}

${samples}
`;

// 크롬 유출 방지 검사 (부분 문자열 비교이므로 샘플 규칙과 겹치지 않는 것만 넣는다 — 예: ".nav a{" 는 샘플의 ".sidenav a{" 에 걸린다)
for (const bad of [".header{", ".sidebar{", ".shell{", ".toc{", ".drawer{", ".drawer-dim{", ".example{", ".code-tabs{", ".topnav{", ".header-right{", ".hbtn{", ".hmenu{", ".pop{", ".sidebar-foot{"]) {
  if (out.includes(bad)) throw new Error(`sync-css: 사이트 크롬 규칙이 포함됨: ${bad}`);
}
/* 줄인 모션에서도 Spinner · 버튼 loading · Switch 처리 중은 돌고 Loading 지연은 기다린다(2026-11-10 · 11-11) — 패키지 base 는 사이트와 따로 쓴 규칙이라 빠지기 쉽다 */
if (!base.includes('.spinner,.btn.loading::after,.switch input[aria-busy="true"]::before{animation:spin') || !base.includes(".spinner[data-delay]{animation:spin")) throw new Error("sync-css: 줄인 모션 base 에 Spinner 예외 · Loading 지연이 없다");
if (out.includes(".ds-root a{")) throw new Error("sync-css: .ds-root a{ 는 컴포넌트의 링크 색을 이긴다 — :where(.ds-root) a 로 쓴다");
for (const must of [":root{", ".btn{", ".tbl{", "@font-face", ".popup-backdrop{"]) {
  if (!out.includes(must)) throw new Error(`sync-css: 필수 규칙 없음: ${must}`);
}

/* base 는 손으로 쓴 규칙이라 토큰 개명을 따라가지 못한다 — 여기서 한 번 더 본다.
   verify.js 도 dist 를 검사하지만, 그쪽은 사이트를 빌드해야 돌고 이쪽은 패키지만 빌드해도 돈다 */
{
  const decl = new Set([...out.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
  const dead = [...new Set([...out.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]))]
    /* 컴포넌트 지역 변수 — verify.js 의 LOCAL 과 같다. --dp-top · --dp-left 는 Date Picker 가 열 때 재서 넣고 CSS 가 기본값을 함께 쓴다. --a 는 도넛 경계 구분선 각도(Donut 이 넣음). --float-* 는 스크롤 영역 안 메뉴의 자리 · 폭(열 때 재서 넣음) */
    .filter((t) => !decl.has(t) && !t.startsWith("--prod-") && t !== "--p" && t !== "--checker-bg" && !t.startsWith("--cols") && t !== "--dp-top" && t !== "--dp-left" && t !== "--a" && !t.startsWith("--float-") && t !== "--ds-delay");
  if (dead.length) throw new Error(`sync-css: 선언이 없는 토큰을 참조함: ${dead.join(" ")}`);
}

const dist = path.resolve(here, "..", "dist");
fs.mkdirSync(path.join(dist, "fonts"), { recursive: true });
fs.writeFileSync(path.join(dist, "style.css"), out);
fs.copyFileSync(path.join(BUILD, "PretendardVariable.woff2"), path.join(dist, "fonts", "PretendardVariable.woff2"));
console.log(`style.css: ${(out.length / 1024).toFixed(1)} KB`);
