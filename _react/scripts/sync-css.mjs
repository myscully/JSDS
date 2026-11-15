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
/* 화면 폭 단계 · 아이콘 크기(2026-11-11) — 사이트와 같은 원본 블록을 뽑는다. 단계는 html 을 바꾸므로 고르는 사람만 쓰는 dist/scale.css 로, 아이콘 크기는 base 로 */
const block = (name) => { const m = new RegExp("/\\* ds:" + name + ":start[\\s\\S]*?\\*/([\\s\\S]*?)/\\* ds:" + name + ":end \\*/").exec(src); if (!m) throw new Error("style.src.css: ds:" + name + " 블록 없음"); return m[1].trim(); };
const scale = block("scale"), icons = block("icons");

/* 줄인 모션 — 사이트와 같은 원본 규칙을 떠 온다(손으로 옮겨 적으면 어긋난다 — 11-11 에 Spinner 예외가 빠져 있었다). html 의 스크롤 동작은 제품 것이라 뺀다 */
const rm = /@media \(prefers-reduced-motion:reduce\)\{html\{scroll-behavior:auto\}(.*?\}\})/.exec(src);
if (!rm) throw new Error("style.src.css: 줄인 모션 규칙을 찾을 수 없음");
const reducedMotion = "@media (prefers-reduced-motion:reduce){" + rm[1];
const base = `/* ---------- Base (패키지용 최소 규칙) ---------- */
*{box-sizing:border-box}
${reducedMotion}
:focus-visible{outline:1px solid var(--foreground-brand-primary);outline-offset:2px}
[hidden]{display:none!important}
/* 앱 루트(또는 body)에 .ds-root 를 붙이면 서체·색·배경 토큰이 적용됩니다. 기본 글자 = Body 2/Reading 15/24(2026-11-12 — 옛 15/1.65) */
.ds-root{font-family:var(--font-sans);font-size:var(--font-size-15);line-height:1.5rem;letter-spacing:0.0096em;color:var(--foreground-neutral-primary);background:var(--background-neutral-primary);-webkit-font-smoothing:antialiased;font-variant-numeric:tabular-nums}
.ds-root pre,.ds-root pre code{font-family:var(--font-mono)}.ds-root code,.ds-root kbd{font-family:var(--font-sans)}
/* 링크 기본색만 지운다 — :where 로 우선순위를 0,0,1 에 둔다. .ds-root a(0,1,1)는 .btn:where(.solid.primary) 같은 단일 클래스 색을 이겨, 링크형 주 버튼 글자가 면과 같은 색이 됐다(대비 1.05) */
:where(.ds-root) a{color:inherit}
/* 아이콘 크기를 rem 으로(화면 폭 단계 · 브라우저 글꼴 설정을 따름) — 명시도 0 */
${icons}`;

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
/* 앱 루트 기본 글자 = 텍스트 스타일 Body 2/Reading(2026-11-12) — 스타일 값이 바뀌면 base 도 같이 바뀌어야 한다 */
{ const t = /\.t-body-2-reading\{font-size:([^;]+);line-height:([^;]+);font-weight:\d+;letter-spacing:([^;}]+)\}/.exec(src);
  if (!t || !base.includes(`.ds-root{font-family:var(--font-sans);font-size:${t[1]};line-height:${t[2]};letter-spacing:${t[3]};`)) throw new Error("sync-css: .ds-root 기본 글자가 Body 2/Reading(.t-body-2-reading)과 다르다"); }
if (out.includes(".ds-root a{")) throw new Error("sync-css: .ds-root a{ 는 컴포넌트의 링크 색을 이긴다 — :where(.ds-root) a 로 쓴다");
for (const must of [":root{", ".btn{", ".tbl{", "@font-face", ".popup-backdrop{"]) {
  if (!out.includes(must)) throw new Error(`sync-css: 필수 규칙 없음: ${must}`);
}

/* base 는 손으로 쓴 규칙이라 토큰 개명을 따라가지 못한다 — 여기서 한 번 더 본다.
   verify.js 도 dist 를 검사하지만, 그쪽은 사이트를 빌드해야 돌고 이쪽은 패키지만 빌드해도 돈다 */
{
  const decl = new Set([...out.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
  const dead = [...new Set([...out.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]))]
    /* 컴포넌트 지역 변수 — lib.js 의 LOCAL_VARS(verify 와 같은 목록) */
    .filter((t) => !decl.has(t) && !t.startsWith("--prod-") && !LIB.LOCAL_VARS.includes(t));
  if (dead.length) throw new Error(`sync-css: 선언이 없는 토큰을 참조함: ${dead.join(" ")}`);
}

const dist = path.resolve(here, "..", "dist");
fs.mkdirSync(path.join(dist, "fonts"), { recursive: true });
fs.writeFileSync(path.join(dist, "style.css"), out);
/* 선택: 화면 폭 단계. html 글꼴 크기를 바꾸므로 제품이 고를 때만 불러온다 — import "@jiran/ds-react/scale.css" */
if (!/@media \(max-width:1279px\)\{html\{font-size:93\.75%\}\}/.test(scale)) throw new Error("sync-css: scale 블록에 화면 폭 단계가 없다");
fs.writeFileSync(path.join(dist, "scale.css"), `/* @jiran/ds-react — 화면 폭 단계(선택). 생성 파일. 원본: _build/style.src.css 의 ds:scale 블록. 수정하지 마세요.
   rem 의 기준인 html 글꼴 크기를 폭 구간마다 바꿉니다: ~1279 93.75% · 1280~1919 100% · 1920~ 106.25% · 2560~ 112.5% */
${scale}
`);
fs.copyFileSync(path.join(BUILD, "PretendardVariable.woff2"), path.join(dist, "fonts", "PretendardVariable.woff2"));
/* 선택: 일본어 한자용 Pretendard JP(2026-11-14) — import "@jiran/ds-react/font-jp.css". 사이트와 같은 원본(font-jp.src.css)이고 url 은 dist 기준 fonts/jp/ 로 같다.
   style.css 의 --font-sans 가 이미 "Pretendard JP" 를 Pretendard 뒤에 두므로, 불러오지 않으면 그 이름은 건너뛴다 */
{
  const jp = fs.readFileSync(path.join(BUILD, "font-jp.src.css"), "utf8");
  const files = [...jp.matchAll(/url\("fonts\/jp\/([^"]+)"\)/g)].map((m) => m[1]);
  if (!files.length || !/--font-sans:"Pretendard","Pretendard JP"/.test(tokens)) throw new Error("sync-css: font-jp.src.css 의 조각이 없거나 --font-sans 에 Pretendard JP 가 없다");
  fs.rmSync(path.join(dist, "fonts", "jp"), { recursive: true, force: true });
  fs.cpSync(path.join(BUILD, "fonts-jp"), path.join(dist, "fonts", "jp"), { recursive: true });
  const missing = files.filter((f) => !fs.existsSync(path.join(dist, "fonts", "jp", f)));
  if (missing.length) throw new Error(`sync-css: font-jp 조각 파일 없음 ${missing.join(" ")}`);
  fs.writeFileSync(path.join(dist, "font-jp.css"), jp.replace("/* Pretendard JP", "/* @jiran/ds-react — 생성 파일, 수정하지 마세요. Pretendard JP"));
}
console.log(`style.css: ${(out.length / 1024).toFixed(1)} KB`);
