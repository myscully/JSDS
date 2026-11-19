// 생성 사이트 검증: node verify.js  (build.js 끝에서도 호출)
// 실패 항목이 있으면 exit 1
const fs = require("fs"); const path = require("path");
const OUT = path.resolve(__dirname, "..");
const LIB = require("./lib.js");
const ICONS_MOD = require("./icons.js"); global.I = ICONS_MOD.I;
const DATA = require("./data.js"); const COMPONENTS = require("./components.data.js"); const PATTERNS = require("./patterns.data.js");

const fails = [], warns = [];
const read = f => fs.readFileSync(path.join(OUT, f), "utf8");
const count = (s, re) => (s.match(re) || []).length;
const article = html => { const a = html.indexOf('<article id="content">'), b = html.indexOf("</article>"); return a < 0 ? html : html.slice(a, b); };

let phTotal = 0; const phPages = [];
for (const sec of ["components", "patterns"]) {
  const keys = LIB.allPages(DATA.SITE, sec).map(p => p.key).filter(k => k !== "overview");
  for (const k of keys) {
    const f = `${sec}/${k}.html`; if (!fs.existsSync(path.join(OUT, f))) { fails.push(`${f}: 파일 없음`); continue; }
    const html = read(f); const body = article(html);
    if (count(body, /<pre\b/g) < 2) fails.push(`${f}: <pre> 2개 미만`);
    const ph = count(body, /class="ph"/g); if (ph) { fails.push(`${f}: 플레이스홀더 .ph ${ph}개`); }
    if (/href="#\//.test(body)) fails.push(`${f}: 변환되지 않은 href="#/" 링크`);
    if (/onclick=/.test(body)) fails.push(`${f}: onclick 속성`);
    if (/<script/i.test(body)) fails.push(`${f}: article 안 <script>`);
    /* 탐색형 차트(Chart.js) — canvas 는 그래픽이라 접근 이름이 있어야 하고, data-spec 은 ds-chart 가 JSON.parse 한다. 계열 색은 6 고정(--chart-series-1~6) */
    for (const m of body.matchAll(/<canvas\b([^>]*)>/g)) {
      const a = m[1]; if (!/data-chart="/.test(a)) continue;
      if (!/role="img"/.test(a) || !/aria-label="[^"]+"/.test(a)) fails.push(`${f}: canvas[data-chart] 에 role="img" · aria-label 이 없다 — 차트가 색과 모양만으로 남는다`);
      /* 원본은 data-spec='{…}' 이지만 Playwright 가 innerHTML 로 내보내며 "…&quot;…" 로 다시 쓴다 — 두 형식을 모두 읽는다 */
      const rawSpec = /data-spec=(?:"([^"]*)"|'([^']*)')/.exec(a) || []; const specTxt = (rawSpec[1] ?? rawSpec[2] ?? "").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
      let spec = null; try { spec = JSON.parse(specTxt); } catch { fails.push(`${f}: canvas[data-chart] 의 data-spec 이 JSON 이 아니다`); }
      const kind = (/data-chart="([^"]+)"/.exec(a) || [])[1];
      if (spec && kind !== "donut") { const n = (spec.series || []).length + (spec.bars || []).length + (spec.lines || []).length; if (n > 6) fails.push(`${f}: ${kind} 차트 계열 ${n}개 — 계열 색은 6개 고정, 7번째부터는 '기타'로 묶는다`); }
    }
    if (/<canvas[^>]*data-chart=/.test(body) !== /<script src="[^"]*assets\/ds-chart\.js" defer>/.test(html)) fails.push(`${f}: 차트 canvas 와 ds-chart.js 스크립트가 함께 있어야 한다(한쪽만 있음)`);
    /* Date Picker 의 기준 시간대(data-timezone)는 dayjs + utc · timezone 플러그인이 있어야 계산된다 — Date Picker 가 있는 페이지에만 셋이 함께 실린다 */
    const dayjsTags = ["dayjs.min.js", "dayjs.utc.js", "dayjs.timezone.js"].filter((n) => html.includes(`assets/vendor/${n}" defer>`)).length;
    if (LIB.hasDatePicker(body) ? dayjsTags !== 3 : dayjsTags !== 0) fails.push(`${f}: Date Picker 와 dayjs 스크립트 3개(dayjs · utc · timezone)가 함께 있어야 한다 — 마크업 ${LIB.hasDatePicker(body) ? "있음" : "없음"}, 스크립트 ${dayjsTags}개`);
    for (const m of body.matchAll(/data-copy="([^"]+)"/g)) if (!new RegExp(`id="${m[1]}"`).test(body)) fails.push(`${f}: data-copy 대상 #${m[1]} 없음`);
    for (const ex of body.split('<section class="example"').slice(1)) { if (!/data-pane="html"/.test(ex) || !/data-pane="react"/.test(ex)) fails.push(`${f}: example 에 html/react pane 누락`); if (!/@jiran\/ds-react/.test(ex)) (sec === "components" ? fails : warns).push(`${f}: React 탭이 패키지 코드가 아님(htmlToJsx 폴백)`); }
    if (!/<title>[^<]+<\/title>/.test(html)) fails.push(`${f}: title 없음`);
    const gl = (body.match(/>[✕⋯‹›↕↑↓▲▼]<\//g) || []).map(s => s[1]); if (gl.length) fails.push(`${f}: 아이콘 대신 글리프 사용 ${[...new Set(gl)].join(" ")}`);
  }
}
// 사이트 전체
/* 점(.) 폴더는 사이트가 아니다 — .claude/worktrees 의 다른 작업 트리 복사본까지 훑어 그쪽 옛 마크업을 잡았다(2026-11-05) */
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.name.startsWith("_") || e.name.startsWith(".") || e.name === "node_modules" ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
for (const f of walk(OUT).filter(f => f.endsWith(".html"))) { const n = count(fs.readFileSync(f, "utf8"), /class="ph"/g); if (n) { phTotal += n; phPages.push(path.relative(OUT, f)); } }
if (phPages.length) warns.push(`플레이스홀더 남은 페이지: ${phPages.join(", ")}`);
for (const n of ICONS_MOD.ICON_NAMES) if (!fs.existsSync(path.join(OUT, "assets/icons/outline", n + ".svg"))) fails.push(`assets/icons/outline/${n}.svg 없음`);
if (!fs.existsSync(path.join(__dirname, "icons.gen.js"))) fails.push("icons.gen.js 없음");
/* 다크 토큰은 @media (prefers-color-scheme:dark) 와 :root[data-theme="dark"] 에 **같은 내용이 두 번** 들어간다.
   한쪽만 고치면 OS 다크와 수동 다크가 갈리는데, 그걸 검사하는 것이 지금까지 없었다 —
   contrast.js 는 data-theme 속성만 세팅해 재므로 @media 쪽은 측정조차 되지 않는다.
   파일 주석이 경고만 하고 있던 것을 검사로 올린다. */
{
  const src = fs.readFileSync(path.join(__dirname, "style.src.css"), "utf8");
  const body = (sel) => {
    const i = src.indexOf(sel + "{");
    if (i < 0) return null;
    let d = 1, j = i + sel.length + 1;
    const start = j;
    while (j < src.length && d > 0) {
      if (src[j] === "/" && src[j + 1] === "*") { const e = src.indexOf("*/", j + 2); j = e < 0 ? src.length : e + 2; continue; }
      if (src[j] === "{") d++; else if (src[j] === "}") d--;
      j++;
    }
    return src.slice(start, j - 1);
  };
  for (const [media, direct] of [
    ['@media (prefers-color-scheme:dark){:root:not([data-theme="light"])', ':root[data-theme="dark"]'],
    ['@media (prefers-color-scheme:dark){:root:not([data-theme="light"])[data-accent="neutral"]', ':root[data-theme="dark"][data-accent="neutral"]'],
  ]) {
    const a2 = body(media), b2 = body(direct);
    if (a2 === null || b2 === null) fails.push(`style.src.css: 다크 블록 쌍을 찾지 못했다 — ${direct}`);
    else if (a2 !== b2) fails.push(`style.src.css: 다크 블록 쌍이 다르다 — ${direct} 와 @media 판이 갈렸다(OS 다크와 수동 다크가 다른 색이 된다)`);
  }
}

/* 모션 — transition 은 --motion-* 토큰만, 반복 애니메이션은 상태 표시 셋(LOOPS)만, 줄인 모션은 가상 요소까지 멈춤.
   taste-skill 2.5.0(MIT) references/motion.md 의 "모든 수치는 한 곳" 규칙을 옮겼다(2026-11-05). 이 검사 전에는
   토큰 뒤에 이징을 하나 더 붙인 선언(var(--motion-slow) ease — 이징 둘이라 선언 전체가 무효)이 두 곳 조용히 죽어 있었고,
   reduced-motion 규칙이 ::before/::after 를 빼 로딩 스피너 · Indicator 맥박이 계속 돌았다 */
{
  const src = fs.readFileSync(path.join(__dirname, "style.src.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  const lineOf = (i) => src.slice(0, i).split("\n").length;
  const LOOPS = ["spin .8s linear infinite", "shimmer 1.4s infinite", "pulse 1.6s infinite"];
  const DELAY = "ds-delay 0s var(--ds-delay,1s) both";
  /* 메인 히어로(B4)의 움직임 — 사람의 결정 2026-11-18. 첫 화면에 한 번 들어오는 연출과 도형의 느린 떠 있기는 상태 표시가 아니라 사이트의 얼굴이라 토큰 밖을 허용한다.
     index 에서만 data-hm 이 붙어 돌고, 줄인 모션이면 data-hm 이 없어 처음부터 마지막 모습이다(behave.home 이 잰다) */
  const HOME_MOTION = ["hm-rise .9s cubic-bezier(.16,1,.3,1) calc(var(--hm-i,0) * 80ms) both", "hm-in 1.3s cubic-bezier(.16,1,.3,1) calc(.25s + var(--hm-d,0s)) both", "hm-float 8s ease-in-out calc(1.8s + var(--hm-d,0s)) infinite alternate"];   // Loading 지연 표시(2026-11-11) — 반복이 아니라 한 번 보이게 할 뿐이고 상태 표시 루프와 함께만 쓴다
  for (const m of src.matchAll(/(?<![-\w])(transition|animation):([^;}]*)/g)) {
    const [, prop, val] = m; const v = val.trim(), at = `style.src.css:${lineOf(m.index)}`;
    if (v === "none!important") continue;
    if (prop === "animation") { if (HOME_MOTION.includes(v)) continue; if (!v.replace(/!important$/, "").split(/,(?![^(]*\))/).every((p) => LOOPS.includes(p) || p === DELAY) && !/^[\w-]+ var\(--motion-(fast|base|slow)\)$/.test(v)) fails.push(`${at}: animation "${v}" — 반복은 LOOPS 셋만, 그 밖은 --motion-* 토큰`); continue; }
    for (const part of v.split(/,(?![^(]*\))/).map((x) => x.trim())) {
      if (!/^[\w-]+ var\(--motion-(fast|base|slow)\)$/.test(part)) fails.push(`${at}: transition "${part}" — 속성 하나 + var(--motion-*) 하나만(숫자 · 이징을 덧붙이면 무효가 되거나 토큰을 벗어난다)`);
    }
  }
  const rm = /@media \(prefers-reduced-motion:reduce\)\{[^@]*?\*,\*::before,\*::after,\*::details-content\{transition:none!important;animation:none!important\}/.test(src);
  if (!rm) fails.push("style.src.css: prefers-reduced-motion 규칙이 *, ::before, ::after, ::details-content 를 모두 멈추지 않는다");
}

/* 크기 단위(2026-11-11 글자 크기 체계, 사람의 결정 — 토큰 + rem + 화면 폭 단계).
   화면 폭 단계에서 루트 크기가 바뀌면 rem 으로 적은 글자 · 간격 · 높이가 같은 비율로 따라간다. px 로 남은 크기는 따라가지 않아 그 자리만 어긋난다.
   - 크기 속성의 px(2 초과)는 금지. 테두리 · 외곽선 · 그림자 · 밑줄 · stroke · filter 와 2px 이하는 선이 흐려지지 않게 px 그대로 둔다
   - 컴포넌트 블록의 font-size 는 var(--font-size-N) · inherit 만. 인라인 코드의 .9em 은 둘레 글자를 따라가야 해서 예외.
     단계 밖이던 13px 셋은 단계로 묶었다(사람의 결정 2026-11-11 — 달력 · Breadcrumb 14, Code 12) */
{
  const raw = fs.readFileSync(path.join(__dirname, "style.src.css"), "utf8");
  const src = raw.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).replace(/url\((?:"[^"]*"|'[^']*'|[^)]*)\)/g, (m) => m.replace(/[^\n]/g, " "));
  const lineOf = (i) => src.slice(0, i).split("\n").length;
  const a = raw.indexOf(LIB.SAMPLES_START), b = raw.indexOf(LIB.SAMPLES_END);   // 표식은 주석이라 지우기 전 글에서 찾는다(지워도 자리는 같다)
  if (a < 0 || b < 0) fails.push("style.src.css: 컴포넌트 블록 표식을 찾지 못했다 — 글자 크기 토큰 검사를 못 함");
  const SKIP = (p) => (/^border/.test(p) && !/radius|spacing/.test(p)) || /^(outline|box-shadow|text-shadow|text-decoration|text-underline-offset|stroke|filter|backdrop-filter|-webkit-text-stroke|column-rule)/.test(p) || /^--(shadow|checker|radius-full|float)/.test(p);
  const tokens = new Set([...src.matchAll(/--font-size-(\d+):/g)].map((m) => m[1]));
  const FONT_STRAY = { ".9em": ".code-inline — 둘레 글자를 따라감" };
  let bad = 0;
  for (const blk of src.matchAll(/\{([^{}]*)\}/g)) {
    const inSamples = blk.index > a && blk.index < b;
    for (const d of blk[1].split(";")) {
      const i = d.indexOf(":"); if (i < 0) continue;
      const prop = d.slice(0, i).trim().toLowerCase(), val = d.slice(i + 1).trim().replace(/\s*!important$/, ""), at = `style.src.css:${lineOf(blk.index + 1 + blk[1].indexOf(d))}`;
      if (!SKIP(prop)) for (const m of val.matchAll(/(\d*\.?\d+)px\b/g)) if (+m[1] > 2 && !/^max\(\s*\d*\.?\d+rem\s*,\s*\d*\.?\d+px\s*\)$/.test(val)) { if (bad++ < 20) fails.push(`${at}: ${prop}:${val} — 크기는 rem(px 는 테두리 · 그림자 · 2px 이하만)`); break; }
      if (inSamples && prop === "font-size") {
        const tm = /^var\(--font-size-(\d+)\)$/.exec(val);
        if (tm ? !tokens.has(tm[1]) : !(val === "inherit" || FONT_STRAY[val])) fails.push(`${at}: font-size:${val} — 컴포넌트 글자 크기는 var(--font-size-N) 토큰만`);
      }
    }
  }
}

/* 텍스트 스타일 19단계(2026-11-12) — 없어진 클래스 이름이 예제 · React 에 남으면 스타일 없이 둘레 글자를 물려받는다.
   같은 이름이 다른 크기가 된 것(.t-title-1 16 → 32 등)은 글자로 잡을 수 없어 behave.type 이 크기를 잰다 */
{
  const OLD = /(?<![\w-])t-(?:body-[12]|label-1|title-1-medium|label-2-semibold|heading-[34])(?![\w-])/g;
  const files = ["components.data.js", "patterns.data.js", "render.js", "foundations.js"].map((f) => path.join(__dirname, f));
  const walk = (d) => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.name.startsWith(".") || e.name === "node_modules" ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : /\.(tsx?|jsx?)$/.test(e.name) ? [path.join(d, e.name)] : []) : [];
  for (const d of ["../_react/src", "../_react/examples"]) files.push(...walk(path.join(__dirname, d)));
  for (const f of files) for (const m of fs.readFileSync(f, "utf8").matchAll(OLD)) fails.push(`${path.relative(path.join(__dirname, ".."), f)}: .${m[0]} — 없어진 텍스트 스타일(19단계 전환표는 _react/MIGRATION.md)`);
}

/* 문구 — 예제 미리보기의 버튼 · 링크 글자와 자리 표시 글. 규칙과 예외는 foundations/writing(Writing 페이지)과 같다.
   taste-skill 2.5.0(MIT) references/copy.md 를 한국어 콘솔에 맞게 옮겼다(2026-11-05) */
{
  const BANNED_LABELS = ["자세히", "자세히 보기", "여기", "이곳", "클릭", "바로가기", "더 보기", "더보기", "Learn more", "Read more", "Click here", "More"];
  const PLACEHOLDER = /lorem|ipsum|\bTODO\b|\[\s*\]|샘플/i;
  const HAEYO = /[가-힣]*(?:해요|했어요|있어요|없어요|돼요|됐어요|예요|이에요|네요)(?=[\s.!?,]|$)/;
  const text = (h) => h.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  for (const sec of ["components", "patterns"]) for (const k of LIB.allPages(DATA.SITE, sec).map((p) => p.key).filter((k) => k !== "overview")) {
    const f = `${sec}/${k}.html`; if (!fs.existsSync(path.join(OUT, f))) continue;
    if ((read(f).match(/class="searchbar[^>]*\sdata-hotkey/g) || []).length > 1) fails.push(`${f}: data-hotkey 는 화면에 하나(Search › 단축키)`);
    for (const pv of read(f).split('class="example-preview').slice(1).map((s) => s.slice(0, s.indexOf('class="example-code') >>> 0))) {
      for (const m of pv.matchAll(/<(button|a)\b([^>]*)>([\s\S]*?)<\/\1>/g)) {
        const t = text(m[3]); if (BANNED_LABELS.includes(t)) fails.push(`${f}: 모호한 ${m[1]} 라벨 "${t}" — 열리는 것 · 일어날 동작으로(Writing › Vague labels)`);
        const al = (/aria-label="([^"]*)"/.exec(m[2]) || [])[1];
        if (al && BANNED_LABELS.includes(al) && !(al === "더 보기" && /icon-only/.test(m[2]))) fails.push(`${f}: 모호한 접근 이름 "${al}" — "더 보기" 는 ⋯ 아이콘 버튼(액션 메뉴)만 허용`);
      }
      const ph = PLACEHOLDER.exec(text(pv)); if (ph) fails.push(`${f}: 예제에 자리 표시 글 "${ph[0]}"(Writing › Placeholders)`);
      /* 종결 · 마침표(Writing › Sentence endings, 2026-11-09). 안내 목록 li 는 완전한 문장이라 뺀다 — notes 패턴 8줄 */
      const ending = HAEYO.exec(text(pv)); if (ending) fails.push(`${f}: 해요체 "${ending[0]}" — 합니다체로(Writing › Sentence endings)`);
      for (const m of pv.matchAll(/<(button|a|label|th)\b[^>]*>([\s\S]*?)<\/\1>/g)) { const t = text(m[2].replace(/<svg[\s\S]*?<\/svg>/g, "")); if (/[가-힣]\.$/.test(t)) fails.push(`${f}: ${m[1]} 글자에 마침표 "${t}"(Writing › Sentence endings)`); }
      /* 비활성(Interaction › Disabled) — 패턴의 주 버튼은 제출 버튼이다. 비활성 요소에는 Tooltip 을 달지 않는다 */
      if (sec === "patterns") for (const m of pv.matchAll(/<button\b[^>]*class="[^"]*solid primary[^"]*"[^>]*>/g)) if (/\sdisabled\b/.test(m[0])) fails.push(`${f}: 주 버튼이 비활성이다 — 켜 두고 검증으로 안내한다(Interaction › Disabled)`);
      if (/class="tooltip-wrap[^"]*"[^>]*>\s*<[a-z]+\b[^>]*\sdisabled\b/.test(pv)) fails.push(`${f}: 비활성 요소에 Tooltip(Interaction › Disabled)`);
      /* Popup · Side Panel — 닫기(X) 필수(사람의 결정 2026-11-10), 위험 확인은 alertdialog, 주 버튼은 제목의 동작(Popup 원칙) */
      for (const m of pv.matchAll(/<div class="popup(?: [^"]*)?"[^>]*role="(dialog|alertdialog)"[^>]*>([\s\S]*?)<div class="popup-actions">([\s\S]*?)<\/div>/g)) {
        const open = m[0].slice(0, m[0].indexOf(">") + 1), danger = /class="popup danger/.test(open), head = m[2], acts = m[3];
        if (!/class="[^"]*\bpopup-close\b[^"]*"[^>]*aria-label="/.test(head)) fails.push(`${f}: Popup 에 이름 있는 닫기(X)가 없다(Popup › 닫기)`);
        if (danger !== (m[1] === "alertdialog")) fails.push(`${f}: 위험 확인은 role=alertdialog, 그 밖은 role=dialog(Popup › 위험 확인)`);
        if (danger && !/aria-describedby="/.test(open)) fails.push(`${f}: alertdialog 에 aria-describedby 가 없다(Popup › 위험 확인)`);
        const title = text((/class="popup-title"[^>]*>([\s\S]*?)<\/h3>/.exec(head) || [])[1] || ""), main = /<button\b[^>]*class="[^"]*solid[^"]*"[^>]*>([\s\S]*?)<\/button>/.exec(acts);
        if (main && !title.includes(text(main[1]).replace(/^다시 /, ""))) fails.push(`${f}: Popup 주 버튼 "${text(main[1])}" 이 제목 "${title}" 의 동작이 아니다(Popup › 주 버튼)`);
        if (danger && acts.indexOf("data-popup-close") > acts.indexOf("negative")) fails.push(`${f}: 위험 확인은 취소가 위험 실행 버튼보다 앞(Popup › 첫 포커스)`);
      }
      /* Negative(빨강) 버튼은 위험 확인 팝업의 확정 버튼에만(사람의 결정 2026-11-16) — 화면의 삭제는 Assistive. Button 페이지는 색 자체를 보이는 곳이라 뺀다 */
      if (k !== "button") {
        const outside = pv.replace(/<div class="popup danger[^"]*"[^>]*role="alertdialog"[^>]*>[\s\S]*?<div class="popup-actions">[\s\S]*?<\/div>/g, "");
        for (const m of outside.matchAll(/<(?:button|a)\b[^>]*class="(?=[^"]*\bbtn\b)[^"]*\bnegative\b[^"]*"[^>]*>([\s\S]*?)<\/(?:button|a)>/g)) fails.push(`${f}: 위험 확인 팝업 밖의 Negative 버튼 "${text(m[1].replace(/<svg[\s\S]*?<\/svg>/g, "")) || "아이콘"}" — 화면의 삭제는 Assistive(Button › 삭제와 Negative)`);
      }
      for (const m of pv.matchAll(/<section class="side-panel[^"]*"[^>]*>([\s\S]*?)<\/section>/g)) {
        if (!/role="dialog"/.test(m[0].slice(0, m[0].indexOf(">"))) || !/aria-labelledby="/.test(m[0].slice(0, m[0].indexOf(">")))) fails.push(`${f}: Side Panel 은 role=dialog + aria-labelledby`);
        if (!/class="[^"]*\bside-panel-close\b[^"]*"[^>]*aria-label="/.test(m[1])) fails.push(`${f}: Side Panel 에 이름 있는 닫기(X)가 없다(Side Panel › 닫기)`);
      }
      /* Tooltip 원칙 — 트리거는 포커스를 받는 요소 · 안에 링크/버튼 없음 · 이름을 되풀이하지 않음 */
      for (const m of pv.matchAll(/<span class="tooltip-wrap[^"]*"[^>]*>\s*<([a-z]+)\b([^>]*)>/g)) if (!/^(button|a|input|select|textarea)$/.test(m[1]) && !/tabindex="0"/.test(m[2])) fails.push(`${f}: 포커스를 받지 못하는 요소에 Tooltip <${m[1]}>(Tooltip › 트리거)`);
      for (const m of pv.matchAll(/<span class="tooltip(?: [^"]*)?"[^>]*>([\s\S]*?)<\/span>/g)) if (/<(a|button)\b/.test(m[1])) fails.push(`${f}: Tooltip 안에 링크 · 버튼(Tooltip › 안에 넣지 않는 것)`);
      for (const m of pv.matchAll(/aria-label="([^"]*)"[^>]*aria-describedby="([^"]*)"/g)) { const d = new RegExp(`id="${m[2]}"[^>]*>([^<]*)<`).exec(pv); if (d && text(d[1]) === m[1]) fails.push(`${f}: Tooltip 이 이름 "${m[1]}" 을 되풀이한다(Tooltip › 되풀이)`); }
      /* Loading · Notification 원칙 */
      for (const m of pv.matchAll(/<span class="spinner[^"]*"[^>]*aria-label="([^"]*)"/g)) if (["불러오는 중", "로딩", "로딩 중", "진행 중"].includes(m[1])) fails.push(`${f}: Spinner 이름 "${m[1]}" — 실제 작업으로(Loading › Spinner 이름)`);
      for (const m of pv.matchAll(/<div class="toast danger"[^>]*>([\s\S]*?)<\/div>/g)) if (!/class="close"/.test(m[1])) fails.push(`${f}: 오류 Toast 에 닫기 버튼이 없다(Notification › 오류 Toast)`);
      if ((pv.match(/class="banner[ "]/g) || []).length > 1) fails.push(`${f}: Banner 는 한 번에 하나(Notification › Banner)`);
      /* Banner 안 버튼은 끄지 않는다(사람의 결정 2026-11-12) — 제품 색 면 위 비활성 글자 대비 1.32 */
      for (const m of pv.matchAll(/<div class="banner[^"]*"[^>]*>([\s\S]*?)<\/div>/g)) if (/<(?:button|a)\b[^>]*class="btn\b[^"]*"[^>]*(?:\sdisabled\b|aria-disabled="true")/.test(m[1])) fails.push(`${f}: Banner 안의 끈 버튼 — 할 수 없는 동작이면 버튼을 빼고 문구로(Notification › Banner)`);
      /* 표 · 목록 원칙(2026-11-10) — 머리글 필수 · 정렬은 버튼 · 머리글 안에 다른 조작 없음 · 행 버튼 이름은 행마다 다름 */
      const sameNames = (body, where) => { const names = [...body.matchAll(/<(?:button|a)\b[^>]*aria-label="([^"]*)"/g)].map((x) => x[1]), dup = names.filter((n, i) => names.indexOf(n) !== i); if (dup.length) fails.push(`${f}: 행마다 같은 버튼 이름 "${dup[0]}"(${where} › 행 버튼 이름)`); };
      /* 비활성 행(2026-11-12) — inert 금지(클릭이 표로 떨어지고 행 글자가 보조기기에서 사라짐), aria-disabled · 안의 링크 · 버튼은 tabindex=-1 + aria-disabled */
      for (const m of pv.matchAll(/<tr\b([^>]*\bclass="[^"]*\bdisabled\b[^"]*"[^>]*)>([\s\S]*?)<\/tr>/g)) {
        if (/\binert\b/.test(m[1]) || !/aria-disabled="true"/.test(m[1])) fails.push(`${f}: 비활성 표 행은 inert 대신 aria-disabled="true"(Data Table › 비활성 행)`);
        for (const c of m[2].matchAll(/<(a\b[^>]*\bhref|button\b(?![^>]*\sdisabled\b))[^>]*>/g)) if (!/tabindex="-1"/.test(c[0]) || !/aria-disabled="true"/.test(c[0])) fails.push(`${f}: 비활성 행 안 링크 · 버튼에 tabindex="-1" + aria-disabled 가 없다(Data Table › 비활성 행)`);
      }
      for (const m of pv.matchAll(/<table\b[^>]*class="tbl[^"]*"[^>]*>([\s\S]*?)<\/table>/g)) {
        if (!/<th\b/.test(m[1])) fails.push(`${f}: 머리글 없는 표(Table › 머리글)`);
        for (const h of (/<thead>([\s\S]*?)<\/thead>/.exec(m[1]) || ["", ""])[1].matchAll(/<th\b([^>]*)>([\s\S]*?)<\/th>/g)) {
          const sortable = /\bsortable\b/.test(h[1]);
          if (sortable && !/^<button type="button" class="sort">/.test(h[2])) fails.push(`${f}: 정렬 머리글은 button.sort(Data Table › 머리글)`);
          if (/<a\b/.test(h[2]) || (!sortable && /<button\b/.test(h[2]))) fails.push(`${f}: 머리글 안에 정렬 말고 다른 조작(Data Table › 머리글)`);
        }
        sameNames((/<tbody>([\s\S]*?)<\/tbody>/.exec(m[1]) || ["", ""])[1], "Data Table");
        /* 행 펼침(2026-11-11) — 버튼은 맨 앞 칸 · aria-expanded · 행마다 다른 이름 · 바로 뒤 tr.row-detail 을 가리킴, 상세 칸은 전체 열을 덮고 펼침 상태와 hidden 이 맞는다 */
        if (/class="expand-btn"/.test(m[1])) {
          const cols = ((/<thead>[\s\S]*?<tr>([\s\S]*?)<\/tr>/.exec(m[1]) || ["", ""])[1].match(/<th\b/g) || []).length;
          if (!/<thead>[\s\S]*?<tr><th class="expand"><span class="sr-only">[^<]+<\/span><\/th>/.test(m[1])) fails.push(`${f}: 펼침 표의 맨 앞 머리글은 th.expand + 숨긴 이름(Data Table › 행 펼침)`);
          for (const r of m[1].matchAll(/<tr\b[^>]*>\s*<td class="expand">([\s\S]*?)<\/td>[\s\S]*?<\/tr>\s*(<tr\b[^>]*>)?/g)) {
            const btn = /<button type="button" class="expand-btn" aria-expanded="(true|false)" aria-controls="([^"]+)" aria-label="[^"]+">/.exec(r[1]);
            if (!btn) { if (/<button/.test(r[1])) fails.push(`${f}: 펼침 버튼 — button.expand-btn[aria-expanded][aria-controls][aria-label](Data Table › 행 펼침)`); continue; }
            const det = r[2] || "", detTd = new RegExp(`<tr class="row-detail" id="${btn[2]}"( hidden(?:="")?)?><td colspan="(\\d+)">`).exec(m[1].slice(r.index + r[0].length - det.length));
            if (!detTd) { fails.push(`${f}: 펼침 버튼의 aria-controls 가 바로 뒤 tr.row-detail 이 아니다 — ${btn[2]}(Data Table › 행 펼침)`); continue; }
            if ((btn[1] === "true") === !!detTd[1]) fails.push(`${f}: 펼침 상태와 상세 행 hidden 이 어긋남 — ${btn[2]}`);
            if (Number(detTd[2]) !== cols) fails.push(`${f}: 상세 칸 colspan ${detTd[2]} ≠ 열 ${cols}(Data Table › 행 펼침)`);
          }
        }
      }
      for (const m of pv.matchAll(/<div class="tbl-wrap sticky"([^>]*)>/g)) if (!/tabindex="0"/.test(m[1]) || !/aria-label="/.test(m[1])) fails.push(`${f}: 고정 헤더 영역은 tabindex=0 + 이름(Data Table › 고정 헤더)`);
      /* 첫 열 고정 · 행 스타일(2026-11-11) — 고정 열 영역도 스크롤 영역이라 tabindex=0 + 이름. .plain 은 .zebra · .grid 와 함께 쓰지 않는다 */
      for (const m of pv.matchAll(/<div class="tbl-wrap[^"]*\bsticky-col\b[^"]*"([^>]*)>/g)) if (!/tabindex="0"/.test(m[1]) || !/aria-label="/.test(m[1])) fails.push(`${f}: 첫 열 고정 영역은 tabindex=0 + 이름(Data Table › 첫 열 고정)`);
      for (const m of pv.matchAll(/<table class="(tbl\b[^"]*)"/g)) { const c = m[1].split(/\s+/);
        if (c.includes("plain") && (c.includes("zebra") || c.includes("grid"))) fails.push(`${f}: 표 .plain 은 .zebra · .grid 와 함께 쓰지 않는다(Table › 행 스타일) — "${m[1]}"`);
        if (c.includes("compact") && c.includes("relaxed")) fails.push(`${f}: 표 밀도는 하나 — .compact · .relaxed 를 함께 쓰지 않는다`); }
      for (const m of pv.matchAll(/<ul class="list[^"]*"([^>]*)>([\s\S]*?)<\/ul>/g)) {
        sameNames(m[2], "List");
        if (!/role="option"/.test(m[2])) continue;
        if (!/role="listbox"/.test(m[1])) fails.push(`${f}: role=option 은 listbox 안에서만(List › listbox)`);
        for (const li of m[2].matchAll(/<li\b([^>]*)>([\s\S]*?)<\/li>/g)) { if (!/tabindex="0"/.test(li[1])) fails.push(`${f}: 고르는 목록의 항목은 tabindex=0(List › listbox)`); if (/<(a|button)\b/.test(li[2])) fails.push(`${f}: listbox 항목 안에 버튼 · 링크(List › listbox)`); }
      }
      if (/class="pagination(?:\s[\w-]+)*\s+outline[\s"]/.test(pv)) fails.push(`${f}: Pagination 은 기본이 outline — .outline 을 붙이지 않는다(면 없는 모양은 .ghost, 2026-11-16)`);
      for (const m of pv.matchAll(/<nav class="pagination(?! cursor)[^"]*"[^>]*>([\s\S]*?)<\/nav>/g)) { const slots = [...m[1].matchAll(/<button\b(?![^>]*aria-label)/g)].length + [...m[1].matchAll(/class="gap"/g)].length; if (slots > 9) fails.push(`${f}: Pagination 번호 칸 ${slots}개 — 9칸 이하(Pagination › 번호 칸)`); }
      if (/\bdata-single\b/.test(pv)) fails.push(`${f}: Tile 은 다중 선택 — 하나만 고르면 Card Radio(Item Tile › 선택의 뜻)`);
      /* Date Picker 기간 상한 · Breadcrumb 잘림 · 차트 표로 보기(2026-11-10) */
      for (const m of pv.matchAll(/<div class="datepicker field[^"]*"([^>]*\bdata-max-days="([^"]*)"[^>]*)>/g)) {
        const at = m[1], n = Number(m[2]), input = /<input\b[^>]*>/.exec(pv.slice(m.index)), preset = /data-default-preset="(\d+)"/.exec(at);
        if (!(Number.isInteger(n) && n > 0)) fails.push(`${f}: data-max-days 는 1 이상의 정수입니다(Date Picker › Max Days)`);
        if (!/\bdata-range\b/.test(at) || /data-unit="/.test(at)) fails.push(`${f}: data-max-days 는 일 단위 기간에만 씁니다(Date Picker › Max Days)`);
        if (preset && +preset[1] > n) fails.push(`${f}: data-default-preset 이 data-max-days 보다 깁니다(Date Picker › Max Days)`);
        if (!input || !/aria-describedby=/.test(input[0])) fails.push(`${f}: 기간 상한은 도움말에 적습니다(Date Picker › Max Days)`);
      }
      for (const m of pv.matchAll(/<ol class="breadcrumb[^"]*">[\s\S]*?<\/ol>/g)) if (/\btitle="/.test(m[0])) fails.push(`${f}: Breadcrumb 에 title 금지 — 키보드로 볼 수 없습니다. 잘린 항목의 Tooltip 은 ds.js 가 답니다(Breadcrumb › Long label)`);
      for (const m of pv.matchAll(/<td\b[^>]*\bclass="[^"]*\btruncate\b[^"]*"[^>]*>/g)) if (/\stitle=/.test(m[0])) fails.push(`${f}: 말줄임 칸(td.truncate)에 title 금지 — 키보드로 볼 수 없습니다. 잘린 칸의 Tooltip 은 ds.js 가 답니다(Data Table › 고정 헤더)`);
      for (const m of pv.matchAll(/<span\b[^>]*\bclass="lbl"[^>]*>/g)) if (/\stitle=/.test(m[0])) fails.push(`${f}: 칩 값(.lbl)에 title 금지 — 키보드로 볼 수 없습니다. 잘린 값의 Tooltip 은 ds.js 가 답니다(Chip › 긴 값)`);
      for (const m of pv.matchAll(/<span\b[^>]*\bclass="avatar\b[^"]*"[^>]*>/g)) if (/\stitle=/.test(m[0])) fails.push(`${f}: Avatar 에 title 금지 — 이름은 role="img" + aria-label, 누르는 아바타는 버튼의 이름으로(Avatar)`);
      /* 표로 보기는 옵션(2026-11-13) — 탐색형 차트는 늘 .chart-view 안 .chart-canvas 에 있고, 버튼은 있으면 .chart-view 의 첫 자식 .chart-tools 안(canvas 앞)이다 */
      /* KPI 안 탐색형 스파크(2026-11-15)는 .kpi > .chart-canvas.spark > canvas[data-chart="spark"] — 표로 보기 틀 없이 카드 맨 아래 */
      const sparks = (pv.match(/<div class="chart-canvas spark"><canvas\b[^>]*\bdata-chart="spark"/g) || []).length;
      for (const m of pv.matchAll(/<canvas\b[^>]*\bdata-chart="spark"/g)) if (!/<div class="chart-canvas spark">$/.test(pv.slice(Math.max(0, m.index - 40), m.index))) fails.push(`${f}: 스파크(data-chart="spark")는 .kpi > .chart-canvas.spark 안에 씁니다(Data Visual › Sparkline)`);
      for (const m of pv.matchAll(/<div class="chart-canvas spark">/g)) { const kpis = [...pv.slice(0, m.index).matchAll(/<div class="kpi[ "]/g)], open = kpis.length ? kpis[kpis.length - 1].index : -1; if (open < 0 || pv.slice(open, m.index).split("<div").length - 1 !== pv.slice(open, m.index).split("</div>").length) fails.push(`${f}: .chart-canvas.spark 는 .kpi 의 바로 아래 자식입니다(Data Visual › Sparkline)`); }
      { const charts = (pv.match(/<canvas\b[^>]*\bdata-chart=/g) || []).length - sparks, wrapped = (pv.match(/<div class="chart-canvas"><canvas\b[^>]*\bdata-chart=/g) || []).length, views = (pv.match(/<div class="chart-view"[^>]*>/g) || []).length, btns = (pv.match(/\bdata-chart-table\b/g) || []).length, placed = (pv.match(/<div class="chart-view"[^>]*><div class="chart-tools"><button\b[^>]*\bdata-chart-table\b/g) || []).length;
        if (charts !== wrapped || charts !== views) fails.push(`${f}: 탐색형 차트는 .chart-view > .chart-canvas > canvas 로 씁니다(차트 ${charts} · 틀 ${views} · 캔버스 칸 ${wrapped}, Data Visual)`);
        if (btns !== placed || btns > charts) fails.push(`${f}: 표로 보기 버튼은 .chart-view 의 첫 자식 .chart-tools 안에만, 차트 수 이하(버튼 ${btns} · 제자리 ${placed} · 차트 ${charts})`); }
      /* 차트 색 모드 · 강조 · 게이지(2026-11-15) — data-spec 을 읽어 ds-chart 가 경고만 하고 넘어가는 조합을 빌드에서 막는다 */
      for (const m of pv.matchAll(/<canvas\b[^>]*\bdata-chart="([a-z]+)"[^>]*\bdata-spec=(?:"([^"]*)"|'([^']*)')/g)) {   // 위(L29)와 같이 두 따옴표 형식 — 처음엔 '…' 만 읽어 생성 페이지에서 아무것도 보지 않았다(음성 시험에서 발견)
        const kind = m[1], bad = (msg) => fails.push(`${f}: ${msg}(Data Visual › ${kind})`); let spec;
        try { spec = JSON.parse((m[2] ?? m[3]).replace(/&quot;/g, '"').replace(/&amp;/g, "&")); } catch (e) { bad("data-spec 이 JSON 이 아닙니다"); continue; }
        if (spec.color != null && !["mono", "categorical"].includes(spec.color)) bad(`color 는 "mono" 또는 "categorical" 입니다(받은 값 ${spec.color})`);
        const list = kind === "mixed" ? (spec.bars || []).concat(spec.lines || []) : spec.series || [], free = list.filter((s) => !s.tone).length;
        if (spec.color === "mono" && free > 4) bad(`한 톤은 tone 없는 계열 4개까지입니다(${free}개) — color 를 지우면 계열 색으로 그립니다`);
        if (spec.highlight != null && (kind !== "bar" || list.length !== 1 || !Number.isInteger(spec.highlight) || spec.highlight < 0 || spec.highlight >= (spec.labels || []).length)) bad("highlight 는 계열이 하나인 bar 의 막대 번호(0부터, 라벨 수 미만)입니다");
        if (spec.gradient && (kind !== "bar" || spec.stacked)) bad("gradient 는 누적이 아닌 bar 에만 씁니다");
        if (kind === "gauge" && !(+spec.value >= 0 && +spec.value <= (spec.max == null ? 100 : +spec.max))) bad("gauge 의 value 는 0 이상 max 이하입니다");
      }
      /* 진행 막대 목록은 측정값 — role=meter 와 값 속성 · 이름(2026-11-15) */
      for (const m of pv.matchAll(/<div class="progress-list">/g)) {
        const body = pv.slice(m.index, m.index + 6000);
        let depth = 0, n = 0; for (const t of body.matchAll(/<(\/?)div\b/g)) { depth += t[1] ? -1 : 1; if (!depth) { n = t.index; break; } }
        for (const bar of body.slice(0, n).matchAll(/<div class="progress(?: [^"]*)?"([^>]*)>/g)) {
          const at = bar[1];
          if (!/role="meter"/.test(at) || !/aria-valuenow="/.test(at) || !/aria-valuemin="/.test(at) || !/aria-valuemax="/.test(at) || !/aria-valuetext="[^"]+"/.test(at) || !/aria-(labelledby|label)="[^"]+"/.test(at)) fails.push(`${f}: 진행 막대 목록의 막대는 role="meter" + aria-valuenow · min · max · valuetext + 이름(Data Visual › Progress List)`);
        }
      }
      /* 증감 배지 — 색은 의미 클래스(bad · good · 없음), 방향 클래스(.up · .down)는 없앴다. 화살표가 있으면 숨긴 '증가' · '감소' 가 함께 */
      for (const m of pv.matchAll(/<span class="delta((?: [^"]*)?)">(<svg\b[\s\S]*?<\/svg>)?(<span class="sr-only">[^<]*<\/span>)?[^<]*<\/span>/g)) {
        if (/\b(up|down)\b/.test(m[1])) fails.push(`${f}: .delta 의 .up · .down 은 없앴습니다 — 색은 .bad · .good, 방향은 화살표와 숨긴 글자(Data Visual › 증감)`);
        if (m[2] && !/>(증가|감소)</.test(m[3] || "")) fails.push(`${f}: 증감 화살표에는 숨긴 '증가' · '감소' 를 함께 둡니다(Data Visual › 증감)`);
      }
      for (const m of pv.matchAll(/<span class="delta((?: [^"]*)?)"/g)) if (!/^(?: (?:bad|good))?$/.test(m[1])) fails.push(`${f}: .delta 의 클래스는 bad · good · 없음(중립)입니다(받은 값${m[1]}, Data Visual › 증감)`);
      /* 차트 카드 — 머리(.chart-head > h3.chart-title)가 맨 앞, 높이 단계는 sm · lg 하나만 */
      for (const m of pv.matchAll(/<div class="chart-card((?: [^"]*)?)"[^>]*>\s*([\s\S]{0,60})/g)) {
        const mods = m[1].trim().split(/\s+/).filter(Boolean);
        if (mods.some((c) => !["sm", "lg", "flat"].includes(c)) || (mods.includes("sm") && mods.includes("lg"))) fails.push(`${f}: .chart-card 의 클래스는 sm · lg(하나) · flat 만입니다(받은 값 ${m[1].trim()}, Data Visual › 카드)`);
        if (!/^<div class="chart-head"><h3 class="chart-title">/.test(m[2])) fails.push(`${f}: .chart-card 는 .chart-head > h3.chart-title 로 시작합니다(Data Visual › 카드)`);
      }
      /* Date Picker 시각 옵션(2026-11-10) */
      for (const m of pv.matchAll(/<div class="datepicker field[^"]*"([^>]*\bdata-time\b[^>]*)>/g)) {
        const at = m[1], sec = /data-time="seconds"/.test(at), input = /<input\b[^>]*>/.exec(pv.slice(m.index));
        if (/data-time="[^"]/.test(at) && !sec) fails.push(`${f}: data-time 값은 없거나 seconds 입니다(Date Picker › Time)`);
        if (/data-unit="/.test(at)) fails.push(`${f}: data-time 은 일 단위 Date Picker 에만 씁니다(Date Picker › Time)`);
        if (!input || !new RegExp(`placeholder="YYYY\\. MM\\. DD HH:mm${sec ? ":ss" : ""}(?: ~ [^"]*)?"`).test(input[0])) fails.push(`${f}: 시각까지 받는 Date Picker 의 placeholder 는 형식 그대로(Date Picker › Time)`);
      }
      /* Tree 원칙(2026-11-14) — role · 이름 · 단계 · 펼침과 하위 · 상위의 aria-labelledby · 체크 상태 계산 · 고른 항목 하나 · Tab 칸 하나 · 트리 안 다른 조작 금지 */
      for (const m of pv.matchAll(/<ul class="tree((?: [^"]*)?)"([^>]*)>/g)) {
        const at = m[2], chk = /\bcheckable\b/.test(m[1]);
        let depth = 0, end = m.index; const re = /<(\/?)ul\b[^>]*>/g; re.lastIndex = m.index;
        for (let t; (t = re.exec(pv));) { depth += t[1] ? -1 : 1; if (!depth) { end = t.index; break; } }
        const body = pv.slice(m.index + m[0].length, end), bad = (msg) => fails.push(`${f}: ${msg}(Tree)`);
        if (!/role="tree"/.test(at) || !/aria-label="[^"]+"/.test(at)) bad("트리는 role=\"tree\" 와 aria-label");
        if (chk !== /aria-multiselectable="true"/.test(at)) bad("체크박스형(.checkable)에만 aria-multiselectable=\"true\"");
        if (/<(a|button|input|select|textarea)\b/.test(body)) bad("트리 안에 링크 · 버튼 · 입력을 두지 않습니다 — 동작은 트리 밖에");
        const stack = [], tops = []; let tabs = 0, sels = 0;
        for (const t of body.matchAll(/<(\/?)(li|ul|span)\b([^>]*)>/g)) {
          const [, close, tag, a] = t, top = stack[stack.length - 1];
          if (tag === "li" && !close) {
            const lv = stack.length + 1, it = { a, lv, group: false, label: null, kids: [] };
            if (!/class="tree-item"/.test(a) || !/role="treeitem"/.test(a)) bad("항목은 li.tree-item[role=treeitem]");
            if ((/aria-level="(\d+)"/.exec(a) || [])[1] !== String(lv)) bad(`aria-level 은 단계와 같게 — ${lv}단계`);
            if (lv > 8) bad("8단계까지");
            if (/tabindex="0"/.test(a)) tabs++;
            if (/aria-selected="true"/.test(a)) sels++;
            stack.push(it);
          } else if (tag === "ul" && !close && top) {
            top.group = true;
            if (!/class="tree-group"/.test(a) || !/role="group"/.test(a)) bad("하위 목록은 ul.tree-group[role=group]");
            if (/\bhidden\b/.test(a) !== !/aria-expanded="true"/.test(top.a)) bad("접힌 항목의 하위만 hidden");
          } else if (tag === "span" && !close && top && /class="tree-label"/.test(a)) {
            if (top.label === null) top.label = (/\bid="([^"]+)"/.exec(a) || [])[1] || "";
          } else if (tag === "li" && close && top) {
            stack.pop();
            const lazy = /\bdata-lazy\b/.test(top.a), par = top.group || lazy, exp = /aria-expanded="(true|false)"/.test(top.a);
            if (par !== exp) bad(par ? "하위가 있거나 불러올 항목은 aria-expanded" : "하위가 없는 항목에는 aria-expanded 를 두지 않습니다");
            if (lazy && top.group) bad("data-lazy 는 아직 하위가 없는 항목에만");
            if (par && (!top.label || !new RegExp(`aria-labelledby="${top.label}"`).test(top.a))) bad("하위가 있는 항목은 aria-labelledby = .tree-label 의 id — 그렇지 않으면 이름에 하위 글자까지 들어갑니다");
            const st = (/aria-checked="(true|false|mixed)"/.exec(top.a) || [])[1];
            if (chk && !st) bad("체크박스형 항목마다 aria-checked");
            if (!chk && st) bad("aria-checked 는 체크박스형에만");
            if (chk && top.kids.length) { const want = top.kids.every((x) => x === "true") ? "true" : top.kids.every((x) => x === "false") ? "false" : "mixed"; if (st !== want) bad(`상위의 aria-checked 는 하위에서 — ${want} 여야 합니다`); }
            (stack.length ? stack[stack.length - 1].kids : tops).push(st);
          }
        }
        if (tabs !== 1) bad(`Tab 칸은 트리에 하나(tabindex="0" ${tabs}개)`);
        if (chk && sels) bad("체크박스형에는 aria-selected 를 두지 않습니다");
        if (sels > 1) bad("탐색형에서 고른 항목은 하나");
      }
      /* Notification Center 원칙(2026-11-14) — 벨 · 대화상자 · 탭 · 항목 · 안 읽은 수가 한 숫자를 말함 */
      for (const m of pv.matchAll(/<div class="notify"[^>]*>/g)) {
        let depth = 0, end = pv.length; const re = /<(\/?)section\b[^>]*>/g; re.lastIndex = m.index;
        for (let t; (t = re.exec(pv));) { depth += t[1] ? -1 : 1; if (!depth) { end = t.index; break; } }
        const b = pv.slice(m.index, end), bad = (msg) => fails.push(`${f}: ${msg}(Notification Center)`);
        const trig = /<button\b[^>]*aria-haspopup="dialog"[^>]*>/.exec(b), panel = /<section class="notify-panel"([^>]*)>/.exec(b);
        if (!trig) { bad("벨 버튼에 aria-haspopup=\"dialog\""); continue; }
        if (!panel) { bad("패널 section.notify-panel"); continue; }
        const at = (s, k) => (new RegExp(`\\b${k}="([^"]*)"`).exec(s) || [])[1];
        const pid = at(panel[1], "id");
        if (!pid || at(trig[0], "aria-controls") !== pid) bad("벨의 aria-controls = 패널 id");
        const exp = at(trig[0], "aria-expanded"), hidden = /\shidden\b/.test(panel[1]);
        if (exp !== (hidden ? "false" : "true")) bad("벨의 aria-expanded = 패널이 열렸는지");
        if (at(panel[1], "role") !== "dialog") bad("패널 role=\"dialog\"");
        const lb = at(panel[1], "aria-labelledby");
        if (!lb || !new RegExp(`\\bid="${lb}"`).test(b)) bad("패널 aria-labelledby 가 제목을 가리킴");
        if (!/role="tablist"[^>]*aria-label="[^"]+"/.test(b) || !/data-filter="all"/.test(b) || !/data-filter="unread"/.test(b)) bad("탭 전체 · 안 읽음(이름 있는 tablist, data-filter all · unread)");
        const items = [...b.matchAll(/<li class="notify-item( unread)?"[^>]*>([\s\S]*?)<\/li>/g)];
        for (const it of items) {
          const links = it[2].match(/class="notify-link"/g) || [];
          if (links.length !== 1) bad("항목마다 .notify-link 하나");
          if (!/^<(a class="notify-link" href="[^"]+"|button type="button" class="notify-link")>/.test(it[2])) bad("항목의 .notify-link 는 a[href] 이거나 button");
          if (/<(a|button|input|select|textarea)\b/.test(it[2].replace(/^<(a|button)\b[^>]*>/, ""))) bad("항목 안에 다른 조작을 두지 않음(항목 동작 없음)");
          const sr = (/<span class="sr-only">([^<]*)<\/span>/.exec(it[2]) || [])[1];
          if (sr !== (it[1] ? ", 안 읽음" : "")) bad("숨긴 ', 안 읽음' 은 안 읽은 항목에만");
          for (const t of it[2].matchAll(/<span class="tag sm ([a-z]+)">/g)) if (!["critical", "high", "medium", "low", "info"].includes(t[1])) bad(`심각도 Tag 톤 ${t[1]}`);
        }
        const n = items.filter((it) => it[1]).length, name = n ? `알림 ${n}건` : "알림";
        if (at(trig[0], "aria-label") !== name) bad(`벨 이름 = '${name}'`);
        const tip = (/<span class="tooltip[^"]*" role="tooltip">([^<]*)<\/span>/.exec(b) || [])[1];
        if (tip !== name) bad(`벨 Tooltip = '${name}'`);
        /* 벨 배지는 점이 기본, 숫자는 .notify[data-count="number"](2026-11-18) */
        const num = /data-count="number"/.test(m[0]), badge = /<span class="count( dot)?" aria-hidden="true">([^<]*)<\/span>/.exec(b);
        if (!n ? badge : num ? !badge || badge[1] || badge[2] !== (n > 99 ? "99+" : String(n)) : !badge || !badge[1] || badge[2]) bad(!n ? "안 읽은 알림이 없으면 벨 Count 없음" : num ? `벨 Count = ${n > 99 ? "99+" : n}` : "벨 배지는 글자 없는 .count.dot");
        const ra = /<button\b[^>]*class="[^"]*notify-read-all[^"]*"[^>]*>/.exec(b);
        if (!ra) bad("'모두 읽음' 버튼 .notify-read-all");
        else if (/aria-disabled="true"/.test(ra[0]) !== !n) bad("'모두 읽음' 은 안 읽은 알림이 없을 때만 aria-disabled");
      }
      /* Time Picker 원칙(2026-11-13) — 라벨 · placeholder 형식 · 버튼 이름 · data-step 정수 · min ≤ max · 범위는 도움말에 */
      for (const m of pv.matchAll(/<div class="field[^"]*\btimepicker\b[^"]*"[^>]*>/g)) {
        const at = m[0], b = pv.slice(m.index, m.index + 3000), name = ((/<label\b[^>]*>([^<*]+)/.exec(b) || [])[1] || "").trim();
        if (!name) continue;   // 썸네일
        const sec = /data-seconds/.test(at), input = /<input\b[^>]*>/.exec(b), get = (k) => ((new RegExp(`data-${k}="([^"]*)"`).exec(at) || [])[1]);
        if (!input || !input[0].includes(`placeholder="${sec ? "HH:mm:ss" : "HH:mm"}"`) || !/inputmode="numeric"/.test(input[0])) fails.push(`${f}: Time Picker 입력의 placeholder 는 형식 그대로 · inputmode=numeric(Time Picker › 형식)`);
        if (!b.includes(`class="tp-btn" aria-label="${name} 선택"`)) fails.push(`${f}: Time Picker 버튼 이름에 값의 이름 — "${name} 선택"`);
        const st = get("step"); if (st !== undefined && !(/^\d+$/.test(st) && +st >= 1 && +st <= 59)) fails.push(`${f}: Time Picker data-step 은 1~59 정수 — ${st}`);
        const lo = get("min"), hi = get("max"), okT = (t) => /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(t);
        for (const t of [lo, hi]) if (t !== undefined && !okT(t)) fails.push(`${f}: Time Picker data-min · data-max 는 HH:mm — ${t}`);
        if (lo && hi && lo > hi) fails.push(`${f}: Time Picker data-min 이 data-max 보다 늦습니다 — ${lo} > ${hi}`);
        if ((lo || hi) && !/<span class="help"[^>]*>[^<]+<\/span>/.test(b.slice(0, b.indexOf("</div></div>") + 200))) fails.push(`${f}: Time Picker 범위를 도움말에(Time Picker › 범위)`);
      }
      /* Number Input 원칙(2026-11-10) */
      {
        const divBlock = (i) => { let d = 0; const re = /<(\/?)div\b[^>]*>/g; re.lastIndex = i; for (let m; (m = re.exec(pv)); ) { d += m[1] ? -1 : 1; if (!d) return pv.slice(i, m.index + m[0].length); } return pv.slice(i); };
        for (const m of pv.matchAll(/<input\b[^>]*type="number"[^>]*>/g)) { const before = pv.slice(0, m.index), at = before.lastIndexOf('<div class="field'); if (at < 0 || !/number-field/.test(pv.slice(at, pv.indexOf(">", at)))) fails.push(`${f}: 숫자 입력은 Number Input(.number-field) ${m[0].slice(0, 60)}(Number Input › 표준 입력)`); }
        for (const m of pv.matchAll(/<div class="field[^"]*number-field[^"]*"[^>]*>/g)) {
          const b = divBlock(m.index), name = ((/<label\b[^>]*>([^<*]+)/.exec(b) || [])[1] || "").trim();
          if (!name) continue;   // 썸네일
          if (/step="any"/.test(b)) fails.push(`${f}: Number Input 에 step=any — 증감 버튼이 움직이지 못합니다`);
          if (/min="/.test(b) && !/<span class="help"[^>]*>[^<]+<\/span>/.test(b)) fails.push(`${f}: Number Input 범위를 도움말에(Number Input › 범위 안내)`);
          for (const [cls, word] of [["down", "줄이기"], ["up", "늘리기"]]) if (!b.includes(`class="num-btn ${cls}" tabindex="-1" aria-label="${name} ${word}"`)) fails.push(`${f}: Number Input ${word} 버튼 — tabindex=-1 · 이름에 값의 이름(Number Input › 키보드)`);
          /* Slider + 숫자 입력(2026-11-11) — 라벨은 숫자 입력칸(제출하는 값)에, 트랙은 aria-labelledby 로 같은 라벨. 입력칸 범위 = 트랙 범위 */
          if (/slider-field/.test(m[0])) {
            const lab = /<label\b[^>]*\bid="([^"]+)"[^>]*\bfor="([^"]+)"/.exec(b), rg = /<input\b[^>]*type="range"[^>]*>/.exec(b), num = /<input\b[^>]*type="number"[^>]*>/.exec(b);
            const at = (t, k) => ((new RegExp(`\\b${k}="([^"]*)"`).exec(t || "") || [])[1]);
            if (!lab || !rg || !num || at(num[0], "id") !== lab[2] || at(rg[0], "aria-labelledby") !== lab[1]) fails.push(`${f}: Slider + 숫자 입력 — label[id][for=숫자 입력칸] · 트랙 aria-labelledby=라벨(Slider › 숫자 입력을 함께 둘 때)`);
            else if (["min", "max", "step"].some((k) => at(rg[0], k) !== at(num[0], k))) fails.push(`${f}: Slider + 숫자 입력 — 트랙과 입력칸의 min · max · step 이 다르다`);
            if (/class="val"/.test(b)) fails.push(`${f}: Slider + 숫자 입력에 .val — 현재 값은 입력칸이 보인다`);
            if (/<input\b[^>]*type="range"[^>]*\bname="/.test(b)) fails.push(`${f}: Slider + 숫자 입력 — 제출하는 값은 숫자 입력칸(트랙에 name 금지)`);
          }
        }
      }
      /* Loading 지연(2026-11-11) — Spinner · Skeleton 에만. 버튼 loading · Switch 처리 중은 누른 반응이라 바로 보인다 */
      for (const m of pv.matchAll(/<[a-z]+\b[^>]*\bdata-delay\b[^>]*>/g)) {
        const cls = (/\bclass="([^"]*)"/.exec(m[0]) || [])[1] || "";
        if (!/(^|\s)(spinner|spinner-wrap|skeleton|skeleton-row)(\s|$)/.test(cls)) fails.push(`${f}: data-delay 는 Spinner · Skeleton 에만(Loading › 1초 미만) ${m[0].slice(0, 70)}`);
      }
      /* Code · Copy Field 원칙(2026-11-10) */
      {
        const divBlock = (i) => { let d = 0; const re = /<(\/?)div\b[^>]*>/g; re.lastIndex = i; for (let m; (m = re.exec(pv)); ) { d += m[1] ? -1 : 1; if (!d) return pv.slice(i, m.index + m[0].length); } return pv.slice(i); };
        for (const m of pv.matchAll(/<div class="code-view[ "][^>]*>/g)) {
          const b = divBlock(m.index), title = (/<span class="title">([^<]+)</.exec(b) || [])[1];
          if (!b.includes('class="head"') && /<button/.test(b)) fails.push(`${f}: Code 복사 버튼은 .head 안`);
          if (!/<div class="head">/.test(b)) continue;   // 썸네일처럼 머리글 없는 틀
          if (!title) { fails.push(`${f}: Code 블록에 제목 없음`); continue; }
          if (!new RegExp(`<pre tabindex="0" aria-label="${title}"`).test(b)) fails.push(`${f}: Code 의 pre 에 tabindex · 제목과 같은 이름이 없음(Code › 키보드)`);
          if (/<pre[\s\S]*<span/.test(b.slice(0, b.lastIndexOf("</pre>")))) fails.push(`${f}: Code 안에 구문 강조(Code › 강조)`);
          if (!b.includes(`aria-label="${title} 복사"`)) fails.push(`${f}: Code 복사 버튼 이름에 제목이 없음`);
        }
        for (const m of pv.matchAll(/<div class="field[^"]*copy-field[^"]*"[^>]*>/g)) {
          const b = divBlock(m.index), name = (/<label\b[^>]*>([^<]+)</.exec(b) || [])[1];
          if (!name) continue;   // 썸네일
          if (!/<input\b[^>]*\sreadonly/.test(b)) fails.push(`${f}: Copy Field 값은 readonly`);
          if (!b.includes(`aria-label="${name} 복사"`)) fails.push(`${f}: Copy Field 복사 버튼 이름에 값의 이름이 없음(Copy Field › 버튼 이름)`);
          if (/type="password"/.test(b) && !b.includes(`class="reveal" aria-label="${name} 보기"`)) fails.push(`${f}: 가린 Copy Field 에 보기 버튼 없음(Copy Field › 민감한 값)`);
        }
        for (const m of pv.matchAll(/<span class="copy-field inline"[^>]*>([\s\S]*?)<\/button>/g)) if (!/aria-label="[^"]+ 복사"/.test(m[1])) fails.push(`${f}: 인라인 복사 버튼에 이름 없음`);
      }
      /* File Upload 원칙(2026-11-10) */
      {
        const fieldBlock = (i) => { let d = 0; const re = /<(\/?)div\b[^>]*>/g; re.lastIndex = i; for (let m; (m = re.exec(pv)); ) { d += m[1] ? -1 : 1; if (!d) return pv.slice(i, m.index + m[0].length); } return pv.slice(i); };
        for (const m of pv.matchAll(/<div class="field[^"]*"[^>]*>\s*<label\b[^>]*>(?:(?!<\/label>)[\s\S])*<\/label>\s*<div class="upload[ "]/g)) {
          const b = fieldBlock(m.index);
          if (!/<span class="help"[^>]*>[^<]+<\/span>/.test(b)) fails.push(`${f}: File Upload 는 형식과 용량을 도움말에(File Upload › 안내)`);
          if (!/<button\b[^>]*upload-pick[^>]*aria-labelledby="/.test(b)) fails.push(`${f}: 필드의 File Upload 버튼에 aria-labelledby 없음`);
        }
        for (const m of pv.matchAll(/<div class="upload[ "][^>]*>/g)) {
          const b = fieldBlock(m.index);
          if (!/<input type="file" hidden/.test(b)) fails.push(`${f}: File Upload 의 input 은 hidden(버튼이 포커스를 받는다)`);
          if (!/<button\b[^>]*upload-pick/.test(b)) fails.push(`${f}: File Upload 에 .upload-pick 버튼 없음(키보드)`);
          if (!/class="sr-only upload-status" role="status"/.test(b)) fails.push(`${f}: File Upload 에 .upload-status 없음`);
        }
        for (const m of pv.matchAll(/<li class="upload-item[^"]*"[^>]*>([\s\S]*?)<\/li>/g)) {
          const n = /<span class="name">([^<]*)</.exec(m[1]); if (!n) { fails.push(`${f}: .upload-item 에 .name 없음`); continue; }
          for (const b of m[1].matchAll(/<button\b[^>]*>/g)) if (!b[0].includes(`aria-label="${n[1]} `)) fails.push(`${f}: 파일 줄 버튼 이름에 파일 이름이 없음 ${n[1]}`);
          if (!/class="[^"]*remove/.test(m[1])) fails.push(`${f}: 파일 줄에 지우기 없음 ${n[1]}`);
          if (/data-rejected/.test(m[0]) && /class="[^"]*retry/.test(m[1])) fails.push(`${f}: 거절된 파일에 다시 시도(File Upload › 전송 실패)`);
        }
      }
      /* Form · Empty State · Page Header · Avatar · Link 원칙(2026-11-10) */
      const blockAt = (i) => { let d = 0; const re = /<(\/?)div\b[^>]*>/g; re.lastIndex = i; for (let m; (m = re.exec(pv)); ) { d += m[1] ? -1 : 1; if (!d) return pv.slice(i, m.index + m[0].length); } return pv.slice(i); };
      const each = (re, fn) => { for (const m of pv.matchAll(re)) fn(blockAt(m.index), m); };
      for (const m of pv.matchAll(/<([a-z]+)\b([^>]*\bclass="link(?:\s[^"]*)?"[^>]*)>([\s\S]*?)<\/\1>/g)) {
        if (m[1] !== "a") fails.push(`${f}: .link 는 a 에만(Link › Button 과의 경계)`);
        else if (!/\shref="/.test(m[2])) fails.push(`${f}: 링크에 href 없음 — 실행이면 Button(Link › Button 과의 경계)`);
        if (/target="_blank"/.test(m[2]) && (!/rel="[^"]*noopener/.test(m[2]) || !/<svg/.test(m[3]) || !/class="sr-only"/.test(m[3]))) fails.push(`${f}: 새 창 링크는 rel · 아이콘 · 숨긴 문구(Link › 새 창)`);
      }
      for (const m of pv.matchAll(/<span class="avatar(?: sm)?"[^>]*>([^<]*)<\/span>/g)) if ([...m[1].trim()].length < 1 || [...m[1].trim()].length > 2) fails.push(`${f}: Avatar 이니셜은 1~2자 "${m[1]}"`);
      /* Avatar 색(2026-11-16) — 예제의 아바타마다 data-tone 1~6, 값은 이름(data-name → aria-label → 글자)에서 정한 것과 같다.
         식은 ds.src.js · render.js · React avatarTone 과 같다(React 테스트가 셋을 대조) */
      const avTone = (n) => { let h = 0; for (const ch of String(n || "").trim()) h = (Math.imul(h, 31) + ch.codePointAt(0)) >>> 0; return h % 6 + 1; };
      for (const m of pv.matchAll(/<span class="avatar(?: sm)?"([^>]*)>([^<]*)<\/span>/g)) {
        const tone = (/\sdata-tone="([^"]*)"/.exec(m[1]) || [])[1], name = (/data-name="([^"]*)"/.exec(m[1]) || /aria-label="([^"]*)"/.exec(m[1]) || [])[1] || m[2];
        if (!/^[1-6]$/.test(tone || "")) fails.push(`${f}: Avatar 에 data-tone 1~6 이 없다 "${m[2]}"(Avatar › 색)`);
        else if (+tone !== avTone(name)) fails.push(`${f}: Avatar data-tone ${tone} ≠ 이름 "${name}" 의 tone ${avTone(name)}(Avatar › 색)`);
      }
      /* Avatar Group(2026-11-13) — role=group + 이름, 아바타 5개까지 · 아바타마다 role=img + 이름, '외 N명' 은 맨 뒤(버튼이면 이름에 그 글자) */
      const groups = [...pv.matchAll(/<span class="avatar-group"([^>]*)>((?:\s|<span class="avatar(?:-group-more| sm)?"[^>]*>[^<]*<\/span>|<button\b[^>]*>[^<]*<\/button>)*)<\/span>/g)];
      if (groups.length !== (pv.match(/<span class="avatar-group"/g) || []).length) fails.push(`${f}: .avatar-group 의 자식은 .avatar 와 맨 뒤 '외 N명' 뿐이다`);
      for (const m of groups) {
        const [, attrs, inner] = m, avs = [...inner.matchAll(/<span class="avatar(?: sm)?"([^>]*)>/g)], more = inner.match(/<(span|button)\b[^>]*class="[^"]*\bavatar-group-more\b[^"]*"[^>]*>([^<]*)<\/\1>/);
        if (!/\brole="group"/.test(attrs) || !/\baria-label="[^"]+"/.test(attrs)) fails.push(`${f}: .avatar-group 은 role="group" 과 aria-label(무엇의 사람들인지)`);
        if (avs.length > 5) fails.push(`${f}: Avatar Group 은 아바타 5개까지 — 나머지는 '외 N명'(${avs.length}개)`);
        if (avs.some((a) => !/role="img"/.test(a[1]) || !/aria-label="[^"]+"/.test(a[1]))) fails.push(`${f}: Avatar Group 의 아바타마다 role="img" + aria-label 이름`);
        if (more) { if (!/^외 \d+명$/.test(more[2].trim())) fails.push(`${f}: '외 N명' 형식이 아니다 "${more[2]}"`); if (inner.trim().slice(-more[0].length) !== more[0]) fails.push(`${f}: '외 N명' 은 Avatar Group 의 맨 뒤`); if (more[1] === "button" && !new RegExp(`aria-label="[^"]*${more[2].trim()}[^"]*"`).test(more[0])) fails.push(`${f}: '외 N명' 버튼 이름에 보이는 글자가 들어가야 한다`); }
      }
      if ((pv.match(/class="page-head"/g) || []).length > 1) fails.push(`${f}: Page Header 는 화면에 하나`);
      each(/<div class="page-head"[^>]*>/g, (b) => {
        if (!/<h[1-3] class="title">/.test(b)) { if (!/<span class="title"/.test(b)) fails.push(`${f}: Page Header 제목은 h1(as 로 h2 · h3)`); }
        const nav = b.indexOf("<nav"); if (nav > -1 && nav > b.indexOf("<div", 5)) fails.push(`${f}: Breadcrumb 는 Page Header 첫 칸(Page Header › Breadcrumb)`);
        const a = b.indexOf('<div class="actions">'); if (a > -1) { const n = (b.slice(a).match(/class="btn /g) || []).length, p = (b.slice(a).match(/class="btn [^"]*solid primary/g) || []).length; if (n > 3) fails.push(`${f}: Page Header 동작은 3개까지(${n}개)`); if (p > 1) fails.push(`${f}: Page Header 주 버튼은 하나`); }
      });
      each(/<div class="empty(?: compact)?"[^>]*>/g, (b) => {
        if (!/<span class="ico"/.test(b)) return;
        if (!/<b\b/.test(b)) fails.push(`${f}: Empty State 제목 없음`);
        if ((b.match(/class="btn /g) || []).length > 2) fails.push(`${f}: Empty State 동작은 2개까지`);
        if ((b.match(/class="btn [^"]*solid primary/g) || []).length > 1) fails.push(`${f}: Empty State 주 버튼은 하나`);
      });
      each(/<div class="form-row"[^>]*>/g, (b) => { const n = (b.match(/class="(?:[\w-]+ )*field[ "]/g) || []).length; if (n !== 2) fails.push(`${f}: .form-row 는 필드 2개(${n}개)`); });
      for (const m of pv.matchAll(/<form\b[^>]*>([\s\S]*?)<\/form>/g)) {
        /* 폼 위 오류 요약은 없앴다(사람의 결정 2026-11-16) — 오류는 필드 아래에, 필드에 붙일 수 없으면 Toast */
        if (/data-form-summary|\bform-summary\b/.test(m[1])) fails.push(`${f}: 폼 위 오류 요약은 쓰지 않는다(Form › 서버 오류)`);
        const fa = m[1].lastIndexOf('<div class="form-actions"');
        if (fa > -1 && m[1].slice(fa + blockAt(m.index + m[0].indexOf(">") + 1 + fa).length).trim()) fails.push(`${f}: .form-actions 는 폼 맨 아래(Form › 동작)`);
      }
      /* 탐색 · 표시 원칙(2026-11-10) */
      for (const m of pv.matchAll(/<div class="tabs[^"]*"([^>]*)>([\s\S]*?)<\/div>/g)) {
        if (/role="tablist"/.test(m[1]) && !/aria-label="/.test(m[1])) fails.push(`${f}: tablist 이름 없음(Tab › 키보드)`);
        if (/<a\b/.test(m[2])) fails.push(`${f}: Tab 은 페이지 이동에 쓰지 않음(Tab › 언제)`);
        for (const t of m[2].matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)) { const w = t[1].replace(/<span class="count">[\s\S]*?<\/span>/, "").replace(/<[^>]+>/g, " ").trim().split(/\s+/); if (w.length > 2) fails.push(`${f}: 탭 라벨은 1~2단어 "${w.join(" ")}"(Tab › 라벨)`); }
      }
      for (const m of pv.matchAll(/<nav class="sidenav collapsed"[^>]*>([\s\S]*?)<\/nav>/g)) { if (/<a\b[^>]*\stitle=/.test(m[1])) fails.push(`${f}: 접힌 내비의 이름을 title 로(Navigation › 접힘)`); if ([...m[1].matchAll(/<a\b/g)].length !== [...m[1].matchAll(/<span class="tooltip-wrap"><a\b[^>]*aria-label="/g)].length) fails.push(`${f}: 접힌 내비 항목은 Tooltip + aria-label(Navigation › 접힘)`); }
      if (/class="topbar"[\s\S]*?<nav\b/.test(pv) && /class="sidenav/.test(pv) && /<header class="topbar"[\s\S]*?<nav aria-label/.test(pv)) fails.push(`${f}: 상단 메뉴와 Navigation 을 함께(Top Navigation › 1차 메뉴)`);
      for (const m of pv.matchAll(/<div class="right">([\s\S]*?)<\/header>/g)) {
        for (const b of m[1].matchAll(/<button\b[^>]*class="btn[^"]*icon-only[^"]*"[^>]*>/g)) { if (!/aria-label="/.test(b[0])) fails.push(`${f}: 상단 아이콘 버튼 이름 없음(Top Navigation › 아이콘 버튼)`); if (!m[1].slice(0, b.index).endsWith('<span class="tooltip-wrap">')) fails.push(`${f}: 상단 아이콘 버튼에 Tooltip 없음(Top Navigation › 아이콘 버튼)`); }
        const av = m[1].search(/class="(?:avatar|topbar-user)/), bell = m[1].indexOf('name="bell"') >= 0 ? m[1].indexOf('name="bell"') : m[1].search(/aria-label="알림/);
        if (av >= 0 && bell > av) fails.push(`${f}: 사용자는 오른쪽 맨 끝(Top Navigation › 오른쪽 순서)`);
        /* 2026-11-18 — 아이콘 버튼 40(sm 금지) · 알림 → 설정 → 라이트/다크 → 사용자 · 테마 버튼은 aria-pressed + 두 아이콘 */
        if (/<button\b[^>]*class="btn sm\b[^"]*icon-only/.test(m[1])) fails.push(`${f}: 상단 아이콘 버튼은 md 40(Top Navigation › 아이콘 버튼)`);
        const set = m[1].search(/aria-label="설정"/), th = m[1].search(/data-theme-toggle/);
        if (th >= 0 && (set < 0 || th < set || (bell >= 0 && th < bell) || (av >= 0 && th > av))) fails.push(`${f}: 라이트/다크는 설정 바로 뒤 · 사용자 앞(Top Navigation › 오른쪽 순서)`);
      }
      for (const m of pv.matchAll(/<button\b[^>]*data-theme-toggle[^>]*>([\s\S]*?)<\/button>/g)) if (!/aria-pressed="(true|false)"/.test(m[0]) || !/class="i-light"/.test(m[1]) || !/class="i-dark"/.test(m[1]) || /i-to-(dark|light)/.test(m[1])) fails.push(`${f}: 라이트/다크 버튼은 aria-pressed + .i-light · .i-dark(지금 테마의 아이콘 — 옛 .i-to-* 금지, Top Navigation › 라이트와 다크)`);
      for (const m of pv.matchAll(/<button\b[^>]*data-sidenav-toggle[^>]*>/g)) {
        const id = (/aria-controls="([^"]+)"/.exec(m[0]) || [])[1];
        if (!id || !new RegExp(`<nav class="sidenav[^"]*" id="${id}"`).test(pv)) fails.push(`${f}: 접기 버튼의 aria-controls 가 사이드 내비 id 가 아님(Top Navigation › 왼쪽 영역)`);
        if (!/<div class="topbar-start">(?:(?!<\/div>)[\s\S])*$/.test(pv.slice(0, m.index))) fails.push(`${f}: 접기 버튼은 .topbar-start 안(Top Navigation › 왼쪽 영역)`);
        if (!/aria-expanded="(true|false)"/.test(m[0])) fails.push(`${f}: 접기 버튼의 aria-expanded 없음(Top Navigation › 왼쪽 영역)`);
      }
      for (const m of pv.matchAll(/<span class="tag (critical|medium|low|info)\b[^"]*"[^>]*>([^<]*)</g)) if (!/^(Critical|High|Medium|Low|Info|CRIT|HIGH|WARN|LOW|INFO|심각|높음|중간|낮음|정보)$/.test(m[2].trim())) fails.push(`${f}: 심각도 색은 심각도 어휘에만 "${m[2]}"(Tag › 톤)`);
      for (const m of pv.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)) { const n = [...m[1].matchAll(/class="tag[ "](?![^"]*tag-more)/g)].length; if (n > 3) fails.push(`${f}: 표 칸의 Tag ${n}개 — 앞 2개 + +N(Tag › 여러 개)`); }
      for (const m of pv.matchAll(/class="tag[^"]*tag-more[^"]*"/g)) { const before = pv.slice(Math.max(0, m.index - 40), m.index); if (!/<button type="button" $/.test(before)) fails.push(`${f}: +N 은 버튼(Tag › 여러 개)`); }
      for (const m of pv.matchAll(/<span class="count(?! neutral)(?: [^"]*)?"[^>]*>([^<]+)<\/span>/g)) { const t = m[1].trim(); if (/^\d+$/.test(t) && (+t === 0 || +t > 99) && !/class="tab\b/.test(pv.slice(Math.max(0, m.index - 120), m.index))) fails.push(`${f}: Count "${t}" — 0 은 숨기고 99 초과는 99+(Indicator › Count)`); }
      for (const m of pv.matchAll(/<ol class="steps[^"]*"([^>]*)>([\s\S]*?)<\/ol>/g)) { const n = [...m[2].matchAll(/<li\b/g)].length; if (n < 3 || n > 6) fails.push(`${f}: Steps ${n}단계 — 3~6(Steps › 단계 수)`); if (!/aria-label="/.test(m[1])) fails.push(`${f}: Steps 이름 없음(Steps)`); 
        /* Steps 마법사(2026-11-13) — .stepper 바로 안의 .steps. 순서대로면 .done 만 버튼, data-nonlinear 면 현재가 아닌 모든 단계가 버튼. 단계마다 .label.
           패널 수 = 단계 수 · 보이는 패널 하나 = .on 의 자리 · 세로는 패널이 li 안 · 이전/다음/완료 버튼 */
        const sp = /<div class="stepper"([^>]*)>\s*$/.exec(pv.slice(Math.max(0, m.index - 200), m.index)), free = !!sp && /data-nonlinear/.test(sp[1]);
        const lis = m[2].split(/(?=<li\b)/).filter((x) => /^<li\b/.test(x)), onAt = lis.findIndex((x) => /^<li class="on"/.test(x));
        if (lis.some((x) => !/<span class="label">/.test(x))) fails.push(`${f}: Steps 단계 라벨은 span.label(Steps)`);
        if (/class="steps[^"]*\bstacked\b/.test(m[0])) fails.push(`${f}: Steps .stacked 는 ds.js · React 가 재서 붙인다 — 예제에 적지 않는다`);
        if (!free && lis.some((x) => !/^<li class="done"/.test(x) && /^<li[^>]*>\s*<button/.test(x))) fails.push(`${f}: 완료한 단계로만 돌아감 — 순서대로인 Steps 는 .done 만 .step-btn(Steps › 이동)`);
        if (free && lis.some((x, i) => (i === onAt) === /^<li[^>]*>\s*<button class="step-btn"|^<li[^>]*>\s*<button type="button" class="step-btn"/.test(x))) fails.push(`${f}: data-nonlinear Steps 는 현재가 아닌 모든 단계가 .step-btn, 현재는 버튼이 아니다(Steps › 이동)`);
        if (sp) {
          const vertical = /class="steps[^"]*\bvertical\b/.test(m[0]), rest = pv.slice(m.index + m[0].length), stop = rest.search(/<div class="stepper"|<ol class="steps/);
          const region = vertical ? m[2] : rest.slice(0, stop < 0 ? undefined : stop), panels = [...region.matchAll(/<div class="step-panel"([^>]*)>/g)].map((x) => x[1]);
          if (panels.length !== lis.length) fails.push(`${f}: Steps 마법사의 .step-panel ${panels.length}개 ≠ 단계 ${lis.length}개${vertical ? " — 세로는 각 li 안에 패널" : ""}`);
          else if (panels.filter((x) => !/\bhidden\b/.test(x)).length !== 1 || /\bhidden\b/.test(panels[onAt] || "hidden")) fails.push(`${f}: Steps 마법사는 현재(.on) 단계의 패널 하나만 보인다(hidden)`);
          if (!/data-step="next"/.test(region)) fails.push(`${f}: Steps 마법사에 data-step="next" 버튼이 없다`);  // 완료는 선택 — 마지막 단계가 완료 화면이면(온보딩) finish 가 없다
        }
      }
      if (/<(?:ul class="(?:menu|list)|table)[^>]*>(?:(?!<\/(?:ul|table)>)[\s\S])*?<hr class="divider/.test(pv)) fails.push(`${f}: 구분선이 이미 있는 컴포넌트 안에 Divider(Divider › 중복 금지)`);
      /* 라벨(Text Field 원칙) — placeholder 는 이름이 아니다. 글자 입력마다 label · aria-label 로 접근 이름이 있어야 한다 */
      for (const m of pv.matchAll(/<(?:input|textarea)\b[^>]*>/g)) {
        if (/\stype="(?:hidden|checkbox|radio)"/.test(m[0]) || /\stype="file" hidden/.test(m[0]) || /\saria-label(?:ledby)?="/.test(m[0])) continue;
        const id = (/\sid="([^"]+)"/.exec(m[0]) || [])[1], wrapped = pv.lastIndexOf("<label", m.index) > pv.lastIndexOf("</label>", m.index);
        if (!wrapped && !(id && pv.includes(`for="${id}"`))) fails.push(`${f}: 접근 이름 없는 입력 ${m[0].slice(0, 80)}(Text Field › 라벨)`);
      }
      /* 폼의 Select 는 라벨을 트리거 이름에 잇는다 — 안 그러면 '전체' 처럼 값만 읽힌다(Select › 폼 안에서) */
      for (const m of pv.matchAll(/<div class="field[^"]*"[^>]*>\s*<label[^>]*>[\s\S]*?<\/label>\s*<div class="dropdown[^"]*"[^>]*>\s*(<button\b[^>]*>)/g)) if (!/aria-labelledby="/.test(m[1])) fails.push(`${f}: 폼의 Select 트리거에 aria-labelledby 가 없다 ${m[1].slice(0, 80)}(Select › 폼 안에서)`);
      /* 동작 메뉴(Dropdown 원칙) — 3~15개 · 선택 표시 없음 · 위험 항목은 맨 아래 구분선 뒤 */
      for (const m of pv.matchAll(/<ul class="menu"[^>]*role="menu"[^>]*>([\s\S]*?)<\/ul>/g)) {
        const items = [...m[1].matchAll(/<(?:li|a) class="menu-item([^"]*)"[^>]*role="menuitem"/g)].map((x) => x[1]);
        if (items.length < 3 || items.length > 15) fails.push(`${f}: 동작 메뉴 항목 ${items.length}개 — 3~15개(Dropdown › 언제 쓰는가)`);
        if (items.some((c) => /\bon\b/.test(c))) fails.push(`${f}: 동작 메뉴에 선택 표시 .on(Dropdown › 선택 표시)`);
        const d = items.findIndex((c) => /\bdanger\b/.test(c));
        if (d >= 0 && (d !== items.length - 1 || !/<li class="menu-sep"[^>]*><\/li>\s*<li class="menu-item danger"/.test(m[1]))) fails.push(`${f}: 위험 항목은 맨 아래 구분선 뒤(Dropdown › 위험 항목)`);
      }
      /* Select Button — 항상 하나, radiogroup(2026-11-10). 토글 묶음(aria-pressed)으로 돌아가면 막는다 */
      for (const m of pv.matchAll(/<div class="select-btn[^"]*"([^>]*)>([\s\S]*?)<\/div>/g)) {
        if (/^<div class="[^"]*\bsolid\b/.test(m[0]) && !/^<div class="[^"]*\boutline\b/.test(m[0])) fails.push(`${f}: Select Button .solid 는 .outline 과 함께만(2026-11-11)`);
        const btns = [...m[2].matchAll(/<button\b([^>]*)>/g)].map((x) => x[1]);
        if (!/role="radiogroup"/.test(m[1])) fails.push(`${f}: Select Button 은 role=radiogroup(Select Button › 키보드)`);
        if (!/aria-label(?:ledby)?="/.test(m[1])) fails.push(`${f}: Select Button 에 묶음 이름이 없다`);
        if (btns.length < 2 || btns.length > 5) fails.push(`${f}: Select Button 항목 ${btns.length}개 — 2~5개(Select Button › 언제 쓰는가)`);
        if (btns.some((b) => !/role="radio"/.test(b) || !/aria-checked="(true|false)"/.test(b))) fails.push(`${f}: Select Button 항목은 role=radio + aria-checked`);
        if (btns.filter((b) => /aria-checked="true"/.test(b) && /class="[^"]*\bon\b/.test(b)).length !== 1) fails.push(`${f}: Select Button 은 언제나 하나가 선택되어 있다(.on + aria-checked=true)`);
      }
      /* Chip — 지우기는 진짜 버튼 · 값이 든 이름, 필터 칩 2개 이상이면 필터 초기화 */
      { const names = new Set();
        for (const m of pv.matchAll(/<span class="chip[^"]*"[^>]*>([\s\S]*?<\/(?:button|i)>)\s*<\/span>/g)) {
          if (!/class="lbl"/.test(m[1]) || !/<button type="button" class="x"/.test(m[1])) { fails.push(`${f}: Input Chip 은 .lbl + button.x(Chip › 긴 값)`); continue; }
          const n = (/aria-label="([^"]+)"/.exec(m[1]) || [])[1];
          if (!n || names.has(n)) fails.push(`${f}: Input Chip 지우기 버튼의 이름이 없거나 겹친다 "${n}" — 값을 넣는다`); names.add(n);
        } }
      /* 색은 고른 모양만 바꾼다 — 고를 수 없는 칩(입력값 span · 동작 칩)에 .on · .neutral 은 뜻이 없다(사람의 결정 2026-11-13, Input Chip 은 형태만 받고 중립 고정) */
      for (const m of pv.matchAll(/<(span|button)\b([^>]*\bclass="chip\b[^"]*"[^>]*)>/g)) {
        const cls = (/class="([^"]*)"/.exec(m[2]) || [])[1].split(/\s+/), pressed = /aria-pressed=/.test(m[2]);
        if (!pressed && cls.includes("on")) fails.push(`${f}: 고를 수 없는 칩(${m[1]}, aria-pressed 없음)에 .on — Input Chip 은 선택 상태가 없다(Chip › 형태와 색)`);
        if (!pressed && cls.includes("neutral")) fails.push(`${f}: 고를 수 없는 칩(${m[1]})에 .neutral — 색은 고른 모양만 바꾼다(Chip › 형태와 색)`);
      }
      for (const m of pv.matchAll(/<div class="chip-group"[^>]*>([\s\S]*?)<\/div>/g)) if ((m[1].match(/aria-pressed=/g) || []).length >= 2 && !/data-chip-reset/.test(m[1])) fails.push(`${f}: 필터 칩이 2개 이상인데 필터 초기화가 없다(Chip › 필터 초기화)`);
      /* 표의 행 — 체크박스 · Switch 는 행마다 다른 이름(Checkbox · Switch 원칙) */
      for (const m of pv.matchAll(/<tbody>([\s\S]*?)<\/tbody>/g)) {
        const seen = new Set();
        for (const x of m[1].matchAll(/<input\b[^>]*(?:type="checkbox"|role="switch")[^>]*>/g)) {
          const n = (/aria-label="([^"]+)"/.exec(x[0]) || [])[1]; if (!n) continue;
          if (seen.has(n)) fails.push(`${f}: 표의 행마다 같은 접근 이름 "${n}" — 행 이름을 넣는다`); seen.add(n);
        }
      }
      /* Radio — 2~5개(Radio Button › 언제 쓰는가) */
      for (const m of pv.matchAll(/<(fieldset|div) class="radio-group[^"]*"[^>]*>([\s\S]*?)<\/\1>/g)) { const n = (m[2].match(/<label class="radio/g) || []).length; if (n < 2 || n > 5) fails.push(`${f}: Radio 그룹 ${n}개 — 2~5개, 6개 이상은 Select`); }
      /* 단축키 표시는 동작과 같이 — kbd 만 있으면 눌러도 아무 일이 없다 */
      for (const m of pv.matchAll(/<div class="searchbar\b[^>]*>[\s\S]*?<\/div>/g)) if (/<kbd\b/.test(m[0]) && !/data-hotkey/.test(m[0])) fails.push(`${f}: 검색창에 kbd 가 있는데 data-hotkey 가 없다(Search › 단축키)`);
      /* 필수 표시가 있는 폼은 뜻을 적는다 */
      if (/<form\b/.test(pv) && /<em>\*<\/em>/.test(pv) && !/class="form-legend"/.test(pv)) fails.push(`${f}: 필수 표시(*)가 있는 폼에 .form-legend 가 없다(Text Field › 필수)`);
    }
  }
}

/* 컴포넌트 페이지 구성(사람의 결정 2026-11-12 · 11-13) — 정의 · 고르기 표 · Default · Variant · Size · State · Rules · Spec · Props · Usage.
   Placement 절은 없앴고(2026-11-09 의 절) 자리 규칙은 고르기 표(choose)의 Placement 행 하나다. 예제는 네 묶음 중 하나에 들고, 제목은 영문이다.
   고르기 표는 '언제 쓰는가'(필수) → '비슷한 것'(있으면) → 'Placement'(필수) 순서로 3행 이하, 나머지 규칙은 principles(Rules 절)이고
   8행을 넘으면 소제목으로 묶는다(11-13). 옛 이름(언제 · 용도 · 고르기 · 경계를 뜻하는 이름)이 principles 로 돌아오면 막는다 */
const EX_GROUPS = ["default", "variant", "size", "state"];
const CHOOSE_KEYS = ["언제 쓰는가", "비슷한 것", "Placement"];
const CHOOSE_OLD = ["언제", "용도", "고르기", "링크와 버튼", "Button 과의 경계", "옮기는 기준"];
for (const [k, c] of Object.entries(COMPONENTS)) {
  const f = `components/${k}.html`; if (!fs.existsSync(path.join(OUT, f))) continue; const b = read(f);
  if ((c.spec || []).some(([n]) => n === "Placement")) fails.push(`${k}: spec 에 Placement 행이 있다 — 고르기 표(choose)의 Placement 행으로`);
  const ch = (c.choose || []).map(([n]) => n);
  if (ch.filter((n) => n === "언제 쓰는가").length !== 1) fails.push(`${k}: 고르기 표(choose)에 '언제 쓰는가' 행이 하나 있어야 한다`);
  if (ch.filter((n) => n === "Placement").length !== 1) fails.push(`${k}: 고르기 표(choose)에 Placement 행이 하나 있어야 한다`);
  if (ch.length > 3) fails.push(`${k}: 고르기 표가 ${ch.length}행 — 3행 이하(언제 쓰는가 · 비슷한 것 · Placement)`);
  const bad = ch.filter((n) => !CHOOSE_KEYS.includes(n)); if (bad.length) fails.push(`${k}: 고르기 표에 ${bad.join(", ")} — 언제 쓰는가 · 비슷한 것 · Placement 만`);
  if (ch.join() !== CHOOSE_KEYS.filter((x) => ch.includes(x)).join()) fails.push(`${k}: 고르기 표 순서가 ${ch.join(" → ")} — 언제 쓰는가 → 비슷한 것 → Placement`);
  const rules = !c.principles ? [] : Array.isArray(c.principles) ? c.principles : Object.values(c.principles).flat();
  if (c.principles && !Array.isArray(c.principles) && Object.values(c.principles).some((g) => !Array.isArray(g) || !g.length)) fails.push(`${k}: Rules 소제목에 빈 묶음이 있다`);
  const stray = rules.map(([n]) => n).filter((n) => CHOOSE_KEYS.includes(n) || CHOOSE_OLD.includes(n));
  if (stray.length) fails.push(`${k}: principles 에 ${stray.join(", ")} — 고르기 표(choose)로`);
  if (Array.isArray(c.principles) && c.principles.length > 8) fails.push(`${k}: Rules 가 ${c.principles.length}행 — 8행을 넘으면 { 소제목: 행[] } 으로 묶는다`);
  if (/<div class="kv"/.test(b)) fails.push(`${f}: div.kv — dt · dd 는 dl 안에만(dl.kv)`);
  if (/<h2 id="placement">/.test(b)) fails.push(`${f}: Placement 절이 있다(2026-11-12 에 없앰)`);
  for (const id of ["default", "spec", "props", "usage"]) if (!b.includes(`<h2 id="${id}">`)) fails.push(`${f}: ${id} 절이 없다`);
  for (const ex of c.examples || []) {
    if (!EX_GROUPS.includes(ex.group)) fails.push(`${k}/${ex.id}: 예제 group 이 ${JSON.stringify(ex.group)} — default · variant · size · state 중 하나`);
    if (/[가-힣]/.test(ex.title)) fails.push(`${k}/${ex.id}: 예제 제목 '${ex.title}' 이 한글이다 — 영문으로(사람의 결정 2026-11-12)`);
  }
  /* 절 순서 — 묶음은 Default → Variant → Size → State, 그 뒤 Rules → Spec → Props → Usage. 고르기 표는 정의 바로 뒤 */
  if (c.choose && !/<p class="lead">[\s\S]*?<\/p><dl class="kv">/.test(b)) fails.push(`${f}: 고르기 표가 정의(lead) 바로 뒤에 없다`);
  if (rules.length && !b.includes(`<h2 id="rules">`)) fails.push(`${f}: rules 절이 없다`);
  const order = [...b.matchAll(/<h2 id="(default|variant|size|state|rules|spec|props|usage)">/g)].map((m) => m[1]);
  const want = ["default", "variant", "size", "state", "rules", "spec", "props", "usage"].filter((x) => order.includes(x));
  if (order.join() !== want.join()) fails.push(`${f}: 절 순서가 ${order.join(" → ")} — ${want.join(" → ")} 이어야 한다`);
}
/* 패턴 페이지 구성(사람의 결정 2026-11-15) — 컴포넌트처럼 정의 · 고르기 표 · Composition · 예제 · Rules · Usage.
   고르기 표는 '언제 쓰는가'(필수) → '비슷한 패턴'(있으면) 2행 이하 — 패턴은 화면 단위라 Placement 행이 없다. Rules 는 모든 패턴에 있고 8행을 넘으면 소제목으로 묶는다.
   예제에는 인라인 style 을 쓰지 않는다(복사한 화면에 수치가 남는다) — 미리보기 틀 폭은 layout 이 정한다 */
const P_CHOOSE = ["언제 쓰는가", "비슷한 패턴"];
/* [대표 표식, 엄격] — 엄격이면 예제에 있는데 uses 에 없어도 실패. 엄격하지 않은 것(글자 입력 · 버튼 · 표)은 uses 에 있는데 예제에 없을 때만 본다 */
const USES_MARK = {
  "button": [/class="btn[ "]/, false], "text-field": [/<(input|textarea)\b(?![^>]*type="(checkbox|radio|hidden|file|range|number)")/, false],
  "data-table": [/class="tbl[ "]/, false], "table": [/class="tbl[ "]/, false], "link": [/class="link[ "]|class="btn[^"]*"[^>]*href|<a href/, false],
  "search": [/class="searchbar/, true], "select-button": [/class="select-btn/, true], "slider": [/class="slider[ "]/, true],
  "date-picker": [/class="datepicker/, true], "time-picker": [/class="field[^"]*\btimepicker\b/, true], "number-input": [/class="field[^"]*\bnumber-field\b/, true],
  "checkbox": [/class="checkbox[ "]/, true], "radio-button": [/class="radio[ "]|class="radio-group/, true], "switch": [/class="switch[ "]/, true],
  "chip": [/class="chip[ "]/, true], "tag": [/class="tag[ "]/, true], "combobox": [/class="combobox/, true],
  "select": [/class="dropdown[^"]*"[^>]*>\s*<button[^>]*aria-haspopup="listbox"/, true], "dropdown": [/aria-haspopup="menu"/, true],
  "tab": [/role="tablist"/, true], "breadcrumb": [/class="breadcrumb/, true], "pagination": [/class="pagination[ "]/, true],
  "accordion": [/class="accordion[ "]/, true], "card": [/class="card[ "]/, true], "popup": [/class="popup[ "]/, true], "side-panel": [/class="side-panel[ "]/, true],
  "notification": [/class="(notice|toast|banner)[ "]/, true], "loading": [/class="(spinner|skeleton)[ "]|role="progressbar"/, true], "indicator": [/class="indicator[ "]|class="count[ "]/, true],
  "steps": [/class="steps[ "]/, true], "data-visual": [/class="(kpi|chart-card|donut|sev-band|progress-list|chart-legend)[ "]/, true],
  "empty-state": [/class="empty[ "]/, true], "form": [/class="form[ "]|class="form-(legend|actions|section)/, true], "page-header": [/class="page-head[ "]/, true],
  "avatar": [/class="avatar(-group)?[ "]/, true], "file-upload": [/class="upload[ "]/, true], "code": [/class="code-view/, true],
  "copy-field": [/copy-field/, true], "tree": [/class="tree[ "]/, true], "notification-center": [/class="notify[ "]/, true],
};
for (const [k, c] of Object.entries(PATTERNS)) {
  const f = `patterns/${k}.html`; if (!fs.existsSync(path.join(OUT, f))) continue; const b = read(f);
  const ch = (c.choose || []).map(([n]) => n);
  if (ch.filter((n) => n === "언제 쓰는가").length !== 1) fails.push(`patterns/${k}: 고르기 표(choose)에 '언제 쓰는가' 행이 하나 있어야 한다`);
  const bad = ch.filter((n) => !P_CHOOSE.includes(n)); if (bad.length) fails.push(`patterns/${k}: 고르기 표에 ${bad.join(", ")} — 언제 쓰는가 · 비슷한 패턴 만`);
  if (ch.join() !== P_CHOOSE.filter((x) => ch.includes(x)).join()) fails.push(`patterns/${k}: 고르기 표 순서가 ${ch.join(" → ")} — 언제 쓰는가 → 비슷한 패턴`);
  const rules = !c.principles ? [] : Array.isArray(c.principles) ? c.principles : Object.values(c.principles).flat();
  if (!rules.length) fails.push(`patterns/${k}: Rules(principles)가 없다 — 모든 패턴에 둔다`);
  if (Array.isArray(c.principles) && c.principles.length > 8) fails.push(`patterns/${k}: Rules 가 ${c.principles.length}행 — 8행을 넘으면 { 소제목: 행[] } 으로 묶는다`);
  const stray = rules.map(([n]) => n).filter((n) => P_CHOOSE.includes(n) || CHOOSE_KEYS.includes(n) || CHOOSE_OLD.includes(n));
  if (stray.length) fails.push(`patterns/${k}: principles 에 ${stray.join(", ")} — 고르기 표(choose)로`);
  if (c.choose && !/<p class="lead">[\s\S]*?<\/p><dl class="kv">/.test(b)) fails.push(`${f}: 고르기 표가 정의(lead) 바로 뒤에 없다`);
  const order = [...b.matchAll(/<h2 id="(composition|ex-[\w-]+|rules|usage)">/g)].map((m) => (m[1].startsWith("ex-") ? "examples" : m[1])).filter((x, i, a) => a[i - 1] !== x);
  const want = ["composition", ...((c.examples || []).length > 1 ? ["examples"] : []), "rules", "usage"];
  if (order.join() !== want.join()) fails.push(`${f}: 절 순서가 ${order.join(" → ")} — ${want.join(" → ")} 이어야 한다`);
  for (const ex of c.examples || []) {
    /* 값이 곧 데이터인 기하(도넛 각도 · 막대 비율 · 밴드 조각 · 슬라이더 위치)는 빼고 잰다 */
    if (/\sstyle="/.test(ex.html.replace(/\sstyle="(?:--a:[\d.]+deg|--p:[\d.]+%|width:[\d.]+%|flex:[\d.]+)"/g, ""))) fails.push(`patterns/${k}/${ex.id}: 예제에 인라인 style — 클래스 · 텍스트 스타일로(복사한 화면에 수치가 남는다)`);
    /* 메뉴 없는 Select 트리거 — 누르면 아무것도 열리지 않는다 */
    for (const m of ex.html.matchAll(/<div class="dropdown[^"]*"[^>]*>\s*<button[^>]*class="trigger"[^>]*aria-haspopup="listbox"[\s\S]*?<\/button>(\s*<ul class="menu)?/g)) if (!m[1]) fails.push(`patterns/${k}/${ex.id}: 목록 없는 Select 트리거 — 메뉴(ul.menu)를 함께 둔다`);
  }
  /* uses 대조 — 예제가 쓰는 컴포넌트와 Composition 목록이 같아야 한다. 컴포넌트마다 대표 클래스 하나로 잰다 */
  const all = (c.examples || []).map((e) => e.html).join("\n");
  const noCombo = all.replace(/<div class="combobox[\s\S]*?<\/ul>/g, "");   // Combobox 의 선택 칩은 Chip 컴포넌트를 쓰는 것이 아니다
  for (const [u, [re, strict]] of Object.entries(USES_MARK)) {
    const has = re.test(u === "chip" ? noCombo : all), listed = (c.uses || []).includes(u);
    if (has && !listed && strict) fails.push(`patterns/${k}: 예제가 ${u} 를 쓰는데 uses 에 없다`);
    if (!has && listed) fails.push(`patterns/${k}: uses 에 ${u} 가 있는데 예제가 쓰지 않는다`);
  }
  if (/class="tbl[ "]/.test(all) && !(c.uses || []).some((u) => u === "table" || u === "data-table")) fails.push(`patterns/${k}: 예제에 표가 있는데 uses 에 Table · Data Table 이 없다`);
  for (const u of c.uses || []) if (!USES_MARK[u] && !COMPONENTS[u]) fails.push(`patterns/${k}: uses 의 ${u} 는 없는 컴포넌트다`);
}

/* Templates(2026-11-18) — 콘솔 화면 일곱. 문서 페이지 templates/<key>.html(정의 · 고르기 표 · 미리보기 · Composition · Rules)과
   실제 화면 templates/screen/<key>.html(templates.build.js 생성). 미리보기 iframe 이 가리키는 화면이 있어야 하고, 새 창 링크는 Link 규칙(rel · 숨긴 '(새 창)')을 따른다.
   uses 는 화면 HTML 이 실제로 쓰는 컴포넌트와 같아야 한다 — 패턴의 USES_MARK 에 앱 틀 컴포넌트 넷을 더해 잰다 */
{
  const TEMPLATES = require("./templates.data.js");
  const T_CHOOSE = ["언제 쓰는가", "비슷한 템플릿"];
  const want = Object.keys((DATA.SITE.templates || {}).pages || {}).filter((k) => k !== "overview");
  if (Object.keys(TEMPLATES).join() !== want.join()) fails.push(`templates: templates.data.js 의 키(${Object.keys(TEMPLATES).join()})가 SITE.templates 페이지(${want.join()})와 같은 순서가 아니다`);
  const MARK = { ...USES_MARK, "top-navigation": [/class="topbar[ "]/, true], "navigation": [/class="sidenav[ "]/, true], "tooltip": [/class="tooltip-wrap[ "]/, true], "divider": [/class="divider[ "]/, true] };
  for (const [k, c] of Object.entries(TEMPLATES)) {
    const f = `templates/${k}.html`, sf = `templates/screen/${k}.html`;
    if (!fs.existsSync(path.join(OUT, f))) { fails.push(`${f}: 문서 페이지가 없다`); continue; }
    const b = read(f);
    const ch = (c.choose || []).map(([n]) => n);
    if (ch.join() !== T_CHOOSE.filter((x) => ch.includes(x)).join() || !ch.includes("언제 쓰는가") || ch.some((n) => !T_CHOOSE.includes(n))) fails.push(`templates/${k}: 고르기 표는 언제 쓰는가 → 비슷한 템플릿 만 — 지금 ${ch.join(" → ")}`);
    if (!(c.principles || []).length) fails.push(`templates/${k}: Rules(principles)가 없다`);
    if ((c.principles || []).length > 8) fails.push(`templates/${k}: Rules 가 ${c.principles.length}행 — 8행 이하로`);
    if (!c.line) fails.push(`templates/${k}: 개요 목록의 한 줄 설명(line)이 없다`);
    for (const u of c.uses || []) if (!COMPONENTS[u]) fails.push(`templates/${k}: uses 의 ${u} 는 없는 컴포넌트다`);
    for (const u of c.patterns || []) if (!PATTERNS[u]) fails.push(`templates/${k}: patterns 의 ${u} 는 없는 패턴이다`);
    const order = [...b.matchAll(/<h2 id="(preview|composition|rules)">/g)].map((m) => m[1]);
    if (order.join() !== "preview,composition,rules") fails.push(`${f}: 절 순서가 ${order.join(" → ")} — preview → composition → rules`);
    if (!/<p class="lead">[\s\S]*?<\/p><dl class="kv">/.test(b)) fails.push(`${f}: 고르기 표가 정의(lead) 바로 뒤에 없다`);
    const fr = b.match(/<div class="tpl-frame">\s*<iframe ([^>]*)>/);
    if (!fr) { fails.push(`${f}: 미리보기 틀(.tpl-frame > iframe)이 없다`); continue; }
    const src = (fr[1].match(/(?:^|\s)src="([^"]+)"/) || [])[1];
    if (src !== `screen/${k}.html`) fails.push(`${f}: 미리보기 iframe 의 src 가 '${src}' — screen/${k}.html`);
    if (!/(?:^|\s)title="[^"]+"/.test(fr[1])) fails.push(`${f}: 미리보기 iframe 에 title(접근 이름)이 없다`);
    if (!/(?:^|\s)width="1440"/.test(fr[1]) || !/(?:^|\s)height="900"/.test(fr[1])) fails.push(`${f}: 미리보기 iframe 은 width 1440 · height 900 속성으로 — 축소 기준`);
    const nw = b.match(/<a href="screen\/[^"]+"[^>]*target="_blank"[^>]*>[\s\S]*?<\/a>/);
    if (!nw) fails.push(`${f}: '새 창에서 열기' 링크가 없다`);
    else { if (!/rel="noopener noreferrer"/.test(nw[0])) fails.push(`${f}: 새 창 링크에 rel="noopener noreferrer" 가 없다`); if (!/<span class="sr-only"> \(새 창\)<\/span>/.test(nw[0])) fails.push(`${f}: 새 창 링크에 숨긴 '(새 창)' 이 없다`); if (!nw[0].includes(`screen/${k}.html`)) fails.push(`${f}: 새 창 링크가 이 화면이 아니다`); }
    if (!fs.existsSync(path.join(OUT, sf))) { fails.push(`${sf}: 화면이 없다`); continue; }
    const s = read(sf);
    if (/tpl-review|tpl-hub/.test(s)) fails.push(`${sf}: 검토 도구(.tpl-review)가 남아 있다 — 사이트 화면에는 두지 않는다`);
    if (!/<title>[^<]+<\/title>/.test(s)) fails.push(`${sf}: <title> 이 없다`);
    /* 코드 보기(2026-11-19) — 보이는 HTML 은 화면 파일 그대로, CSS 는 assets/templates.css 그대로. 복사 버튼은 HTML 칸부터 */
    const tun = (t) => t.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
    const code = (sfx) => (b.match(new RegExp(`<code id="tpl-${k}-${sfx}">([\\s\\S]*?)</code>`)) || [])[1];
    const ch1 = code("html"), cc1 = code("css");
    if (!/<section class="example tpl-code" id="tpl-[^"]+">\s*<div class="tpl-frame">/.test(b)) fails.push(`${f}: 코드 보기 틀(section.example.tpl-code > .tpl-frame)이 없다`);
    if (ch1 == null || tun(ch1) !== s.trim()) fails.push(`${f}: 코드 보기의 HTML 이 ${sf} 와 다르다`);
    if (cc1 == null || tun(cc1) !== fs.readFileSync(path.join(OUT, "assets", "templates.css"), "utf8").trim()) fails.push(`${f}: 코드 보기의 CSS 가 assets/templates.css 와 다르다`);
    if (!b.includes(`data-copy="tpl-${k}-html"`)) fails.push(`${f}: 코드 보기의 복사 버튼이 HTML 칸(tpl-${k}-html)을 가리키지 않는다`);
    for (const m of s.matchAll(/href="([a-z-]+\.html)"/g)) if (!fs.existsSync(path.join(OUT, "templates", "screen", m[1]))) fails.push(`${sf}: 링크 대상 ${m[1]} 이 없다`);
    if (/\sstyle="/.test(s.replace(/\sstyle="(?:--a:[\d.]+deg|--p:[\d.]+%|width:[\d.]+%|flex:[\d.]+)"/g, ""))) fails.push(`${sf}: 화면에 인라인 style — 클래스로`);
    /* 알림 센터 패널 안의 탭 · 심각도 Tag 는 Notification Center 의 일부다 — 화면이 Tab · Tag 를 쓰는 것이 아니다 */
    const own = s.replace(/<section class="notify-panel[\s\S]*?<\/section>/g, "").replace(/class="notify-text"><span class="tag /g, 'class="notify-text"><span class="nc-tag ');
    const noCombo = own.replace(/<div class="combobox[\s\S]*?<\/ul>/g, "");
    for (const [u, [re, strict]] of Object.entries(MARK)) {
      const has = re.test(u === "chip" ? noCombo : own), listed = (c.uses || []).includes(u);
      if (has && !listed && strict) fails.push(`templates/${k}: 화면이 ${u} 를 쓰는데 uses 에 없다`);
      if (!has && listed) fails.push(`templates/${k}: uses 에 ${u} 가 있는데 화면이 쓰지 않는다`);
    }
  }
}

/* 주석 열림·닫힘이 짝인지 — 선언을 지울 때 여러 줄 주석의 한쪽만 남기기 쉽고,
   열림 없는 닫힘 표시는 파서가 '다음 세미콜론까지'를 통째로 버려서 바로 뒤의 선언 하나가 조용히 사라진다.
   3차에서 다크 --shadow-xs 가 이렇게 유실됐고, 다크 블록 두 벌에 같은 고아가 있었던 탓에
   MD5 쌍 검사까지 통과했다 — 바이트 일치는 유효성이 아니다 */
for (const f of ["assets/style.css"]) {
  const t = read(f);
  let depth = 0, i = 0;
  while (i < t.length - 1) {
    if (t[i] === "/" && t[i + 1] === "*") { depth++; i += 2; continue; }
    if (t[i] === "*" && t[i + 1] === "/") { depth--; if (depth < 0) { fails.push(`${f}: 열림 없는 주석 닫힘 (문자 ${i}) — 바로 뒤 선언이 파서에게 버려진다`); break; } i += 2; continue; }
    i++;
  }
  if (depth > 0) fails.push(`${f}: 닫히지 않은 주석 ${depth}개`);
}

const css = read("assets/style.css"); if (/data:font\/woff2/.test(css)) fails.push("style.css 에 base64 폰트 포함"); if (!/fonts\/PretendardVariable\.woff2/.test(css)) fails.push("style.css 폰트 경로 오류");
/* 일본어 한자용 Pretendard JP(2026-11-14) — 서체 순서 · 조각 파일 · unicode-range · 한글 범위 없음 · 모든 페이지 링크 · 문서의 조각 수.
   unicode-range 가 없으면 한국어 페이지도 조각 전부를 받고, 한글 범위가 끼면 한글을 JP 가 가로챈다 */
{
  const fam = (css.match(/--font-sans:([^;]+);/) || [])[1] || "";
  if (!/^"Pretendard","Pretendard JP",/.test(fam)) fails.push(`--font-sans: Pretendard 바로 뒤가 "Pretendard JP" 가 아니다 — ${fam.slice(0, 60)}`);
  const JP = "assets/font-jp.css";
  if (!fs.existsSync(path.join(OUT, JP))) fails.push(`${JP} 없음`);
  else {
    const jp = read(JP).replace(/\/\*[\s\S]*?\*\//g, ""); const faces = jp.match(/@font-face\s*\{[^}]*\}/g) || [];
    if (!faces.length) fails.push(`${JP}: @font-face 없음`);
    faces.forEach((b, i) => {
      if (!/font-family:"Pretendard JP"/.test(b)) fails.push(`${JP} #${i}: font-family 가 "Pretendard JP" 가 아니다`);
      const src = (b.match(/url\("([^"]+)"\)/) || [])[1]; if (!src || !fs.existsSync(path.join(OUT, "assets", src))) fails.push(`${JP} #${i}: 조각 파일 없음 ${src}`);
      const ur = (b.match(/unicode-range:([^;}]+)/) || [])[1]; if (!ur) { fails.push(`${JP} #${i}: unicode-range 없음 — 한자가 없는 페이지도 내려받는다`); return; }
      for (const r of ur.split(",")) { const [a, z] = r.trim().replace(/^u\+/i, "").split("-").map((x) => parseInt(x, 16)); if (a <= 0xD7A3 && (z || a) >= 0xAC00) { fails.push(`${JP} #${i}: 한글 범위(U+AC00–D7A3)를 포함 ${r.trim()}`); break; } }
    });
    if (!fs.existsSync(path.join(OUT, "assets/fonts/jp/OFL.txt"))) fails.push("assets/fonts/jp/OFL.txt 없음 — OFL 은 서체와 함께 배포해야 한다");
    const typo = fs.existsSync(path.join(OUT, "foundations/typography.html")) ? read("foundations/typography.html") : "";
    if (!typo.includes(`조각 ${faces.length}개`)) fails.push(`Typography: 문서의 조각 수가 ${JP} 의 ${faces.length} 와 다르다`);
    const pagesOf = Object.keys(DATA.SITE).flatMap((s) => LIB.allPages(DATA.SITE, s).map((p) => (s === "home" && p.key === "overview" ? "index.html" : `${s}/${p.key}.html`)));
    const noLink = pagesOf.filter((f) => fs.existsSync(path.join(OUT, f)) && !/<link rel="stylesheet" href="(?:\.\.\/)?assets\/font-jp\.css">/.test(read(f)));
    if (noLink.length) fails.push(`font-jp.css 링크 없는 페이지 ${noLink.length}: ${noLink.slice(0, 3).join(" ")}`);
  }
}
if (!fs.existsSync(path.join(OUT, "assets/ds.js"))) fails.push("assets/ds.js 없음");
for (const f of ["components/button.html", "index.html"]) if (fs.existsSync(path.join(OUT, f)) && !/assets\/ds\.js/.test(read(f))) fails.push(`${f}: ds.js 스크립트 태그 없음`);
const app = read("assets/app.js"); const idx = JSON.parse((app.match(/const SEARCH_INDEX=(\[.*?\]);\n/s) || [])[1] || "[]");
const routes = Object.keys(DATA.SITE).flatMap(s => LIB.allPages(DATA.SITE, s)).length; if (idx.length !== routes) fails.push(`SEARCH_INDEX ${idx.length} ≠ 라우트 ${routes}`);
if (!fs.existsSync(path.join(OUT, "resources/react.html"))) fails.push("resources/react.html 없음");
// Home › 시작하기: 페이지 존재 · 복사 대상 id · 링크 변환 · 첫 화면 CTA
if (!fs.existsSync(path.join(OUT, "home/getting-started.html"))) fails.push("home/getting-started.html 없음");
else { const gs = article(read("home/getting-started.html")); for (const m of gs.matchAll(/data-copy="([^"]+)"/g)) if (!new RegExp(`id="${m[1]}"`).test(gs)) fails.push(`home/getting-started.html: data-copy 대상 #${m[1]} 없음`); if (/href="#\//.test(gs)) fails.push('home/getting-started.html: 변환되지 않은 href="#/"'); if (!/data-doctab="designer"/.test(gs) || !/class="guide-steps"/.test(gs)) fails.push("home/getting-started.html: 대상별 탭·단계 목록 없음"); if (!/id="platforms"/.test(gs) || !/1024–1279/.test(gs)) fails.push("home/getting-started.html: 지원 환경 표 없음"); }
if (!/href="home\/getting-started\.html"/.test(read("index.html"))) fails.push("index.html: Getting started 링크 없음");
// Foundations: 기본 구성(Overview + Base material 5) + Writing · Interaction, 옛 페이지 없음
const fnd = fs.readdirSync(path.join(OUT, "foundations")).filter(f => f.endsWith(".html")).sort().join(",");
/* writing · interaction 은 우리가 더한 페이지(2026-11-05 taste-skill copy 규칙을 옮김 · 2026-11-09 공통 동작 규칙) */
if (fnd !== "colors.html,elevation.html,grid.html,icons.html,index.html,interaction.html,overview.html,typography.html,writing.html") fails.push("foundations/ 페이지 구성이 다름: " + fnd);
for (const f of ["colors", "elevation", "grid", "icons", "interaction", "typography", "writing"]) { const b = article(read(`foundations/${f}.html`)); if (!/<h2 /.test(b)) fails.push(`foundations/${f}.html: 섹션(h2) 없음`); if (/href="#\//.test(b)) fails.push(`foundations/${f}.html: 변환되지 않은 href="#/"`); }
if (!/data-doctab="atomic"/.test(read("foundations/colors.html"))) fails.push("foundations/colors.html: Semantic/Atomic 탭 없음");
if (!fs.existsSync(path.join(OUT, "resources/design-token.html"))) fails.push("resources/design-token.html 없음");
if (fs.existsSync(path.join(OUT, "home/overview.html"))) fails.push("home/overview.html 이 생성됨(첫 화면은 루트 index.html 만)");
const jsonPath = path.join(__dirname, "components.json");
if (!fs.existsSync(jsonPath)) fails.push("components.json 없음"); else {
  const j = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  if (j.components.length !== Object.keys(COMPONENTS).length || j.components.length !== 46) fails.push(`components.json 컴포넌트 ${j.components.length}개(46 기대)`);
  if (j.patterns.length !== Object.keys(PATTERNS).length || j.patterns.length !== 22) fails.push(`components.json 패턴 ${j.patterns.length}개(22 기대)`);
  for (const c of [...j.components, ...j.patterns]) { if (!c.examples || !c.examples.length) fails.push(`components.json ${c.key}: 예제 없음`); if (!c.css || c.css.split("\n").length < 2) fails.push(`components.json ${c.key}: CSS 비어 있음`); }
}
/* 색만으로 의미를 전달하지 않는다 — 심각도 다섯 색은 회색조로 분리할 수 없으므로(상태색 램프를 공유하는 한
   만들 수도 없습니다) 1.4.1 준수는 전적으로 라벨 병기에 의존합니다. 그 라벨을 검사하는 것이 지금까지 없었습니다.
   도넛·밴드는 그래픽이라 접근 이름이 있어야 합니다. 표의 좌측 막대(.sev-cell)는 2026-11-11 에 없앴습니다(사람의 결정 — Tag 글자가 색을 나름). */
for (const f of walk(OUT).filter(f => f.endsWith(".html"))) {
  const rel = path.relative(OUT, f), html = article(read(rel));
  for (const [sel, re] of [[".donut", /<div class="donut"[^>]*>/g], [".sev-band", /<div class="sev-band"[^>]*>/g]])
    for (const m of html.match(re) || []) if (!/aria-label=|aria-hidden="true"/.test(m)) fails.push(`${rel}: ${sel} 에 접근 이름도 aria-hidden 도 없다 — 색만으로 심각도를 전달한다`);
  /* 정적 도넛의 조각 경계는 2px 구분선(i)이다 — 빠지면 조각이 틈 없이 붙어 보인다(2026-11-05, conic 각도 띠를 구분선으로 바꿈) */
  for (const m of html.matchAll(/<div class="donut"[^>]*>([\s\S]*?)<\/div>/g)) if ((m[1].match(/<i style="--a:[\d.]+deg"><\/i>/g) || []).length < 2) fails.push(`${rel}: .donut 에 경계 구분선 <i style="--a:…deg"> 가 없다 — 조각 사이 2px 틈이 사라진다`);
  /* 없앤 것이 돌아오지 않게(2026-11-11) — .sev-cell(행 좌측 색 막대), Tag 의 .plain(점이 기본에서 빠져 뜻이 없어짐 — 점은 .dot) */
  if (/class="[^"]*\bsev-cell\b/.test(html)) fails.push(`${rel}: .sev-cell 은 없앴다 — 심각도 칸은 Tag 하나로`);
  for (const m of html.matchAll(/class="([^"]*\btag\b[^"]*)"/g)) if (/\bplain\b/.test(m[1])) fails.push(`${rel}: Tag 의 .plain 은 없앴다(기본이 점 없음) — 점이 필요하면 .dot`);
  /* 고정폭 글자는 Code 에만(사람의 결정 2026-11-13) — Text Field · Copy Field 의 .mono 를 없앴다 */
  for (const m of html.matchAll(/class="([^"]*\bfield\b[^"]*)"/g)) if (/\bmono\b/.test(m[1])) fails.push(`${rel}: .field.mono 는 없앴다 — 고정폭 글자는 Code 에만 쓴다`);
  /* Notice · Banner 아이콘은 filled(사람의 결정 2026-11-13) — 선 아이콘은 stroke 로 그린다 */
  for (const m of html.matchAll(/<div class="(notice|banner)\b[^"]*"[^>]*>\s*(?:<span class="ico">)?(<svg[^>]*>)/g)) if (!/fill="currentColor"/.test(m[2])) fails.push(`${rel}: .${m[1]} 아이콘이 선 아이콘이다 — filled 로(I(name, size, {style:"filled"}))`);
}
/* 고정폭 글자 = Code 에만(2026-11-13) — --font-mono 를 쓰는 규칙은 pre · code 선택자뿐이다 */
{
  const css = fs.readFileSync(path.join(__dirname, "style.src.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of css.matchAll(/([^{}]+)\{[^}]*font-family:var\(--font-mono\)[^}]*\}/g)) { const sel = m[1].trim(); if (sel.startsWith("--") || sel.startsWith(":root")) continue; if (!sel.split(",").every((x) => /\b(pre|code)\b|code-inline|code-view/.test(x))) fails.push(`style.src.css: Code 밖에서 고정폭 글자 — ${sel.slice(0, 80)}`); }
}

/* 상호작용 면은 **틴트 쌍**을 써야 한다 — --surface-neutral-secondary → --surface-neutral-strong.
   --background-neutral-secondary 는 불투명한 '페이지 배경' 토큰이고, 다크에서는 가장 어두운 면이다.
   그걸 hover 에 쓰면 라이트에서는 어두워지는데 다크에서는 더 어두워졌다가 눌림에서 다시 밝아져
   **방향이 뒤집힌다**. 표 행·메뉴 항목 등 여덟 곳이 그랬다.
   사이트 크롬(코드 패널 버튼 등)은 제품 컴포넌트가 아니므로 샘플 블록만 본다 */
{
  const a = css.indexOf("/* ---------- Live component samples ---------- */");
  const b = css.indexOf("/* ---------- /Live component samples ---------- */");
  const body = css.slice(a, b).replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of body.matchAll(/([^{}\n]*:hover[^{}\n]*)\{([^{}]*)\}/g))
    if (/background:\s*var\(--background-neutral-secondary\)/.test(m[2]))
      fails.push(`${m[1].trim()} 이 hover 에 --background-neutral-secondary 를 쓴다 — 상호작용 면은 틴트 쌍(--surface-neutral-secondary → -strong)이어야 다크에서 방향이 뒤집히지 않는다`);
}

/* 제품 색 팔레트(data.js PRODUCTS — 2026-11-14 사람의 결정 · 2026-11-17 이름 기본 · 제품1 · 제품2 · 제품3 · 브랜드 · 중립 · AI, 제품3 navy #10367D 추가).
   ① 제약 — Brand 면 위 글자(--brand-label)는 늘 흰색이므로 제품 색이 그 흰 글자를 받쳐야 한다(4.5). 기준은 제품 HEX 자체(brand-50)이고
      다크 rest 도 같은 단계라 이 검사 하나가 두 테마의 rest 를 받친다. AI 는 그라데이션 끝마다 잰다(주 버튼 · Banner 의 흰 글자가 그 위에 선다).
      못 넘는 색은 exception 에 이유가 있어야 한다(주황 — 사람의 결정). 이유 없는 미달은 빌드를 막는다.
   ② 상태색과 겹치면 중립으로 바꾸던 규칙(STATUS_HUES · clashesWithStatus · data-accent-neutral)은 걷어냈다 — 되살아나면 막는다.
   ③ CSS 가 data.js 를 따르는지 — 빨강 · 주황의 중립 입력 링 선택자 = neutralFocus 키, AI 그라데이션 끝 = gradient, 중립 블록 = kind neutral 의 키 */
{
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const L = (hex) => { const c = [0, 1, 2].map((i) => lin(parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16))); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const onWhite = (hex) => 1.05 / (L(hex) + 0.05);
  const src = fs.readFileSync(path.join(__dirname, "style.src.css"), "utf8");
  const ramp = (n) => { const m = new RegExp("--" + n + ":(#[0-9A-Fa-f]{6})").exec(src); return m ? m[1] : null; };
  const PR = DATA.PRODUCTS;
  const KEYS = ["blue", "red", "cyan", "navy", "orange", "neutral", "ai"];
  if (PR.map((p) => p.key).join() !== KEYS.join()) fails.push(`data.js PRODUCTS 의 키가 팔레트와 다르다 — ${PR.map((p) => p.key).join(" · ")} (사람의 결정 2026-11-14 · 11-17: ${KEYS.join(" · ")}). 바꾸려면 사람에게 묻고 이 목록 · React PRODUCT_COLORS 를 함께 고친다`);
  const KINDS = ["base", "ramp", "neutral", "ai"];
  for (const p of PR) {
    if (!KINDS.includes(p.kind)) { fails.push(`제품 색 ${p.key}: kind "${p.kind}" 는 ${KINDS.join(" · ")} 중 하나여야 한다`); continue; }
    if (!/^#[0-9A-F]{6}$/.test(p.hex || "")) fails.push(`제품 색 ${p.key}: hex 는 대문자 #RRGGBB 여야 한다 — "${p.hex}"`);
    if (!p.name) fails.push(`제품 색 ${p.key}: name(메뉴 · Colors 표의 이름)이 없다`);
    if (p.group !== undefined) fails.push(`제품 색 ${p.key}: group(갈래)은 2026-11-17 에 뺐다 — 메뉴 · Colors 표는 이름만 보인다`);
    if (PR.filter((q) => q.name === p.name).length > 1) fails.push(`제품 색 이름 '${p.name}' 이 둘 이상이다`);
    if (p.exception !== undefined && !(typeof p.exception === "string" && p.exception.trim().length >= 10)) fails.push(`제품 색 ${p.key}: exception 은 이유 문장이어야 한다 — 비운 예외는 선언이 아니다`);
    if (p.kind === "neutral") continue;   // 중립은 CSS 블록이 고른 단계라 아래 contrast 맥락이 잰다
    const stops = [["hex", p.hex]];
    if (p.kind === "ai") {
      if (!p.gradient) fails.push(`제품 색 ${p.key}: AI 는 gradient(rest · strong · heavy 두 끝)가 있어야 한다`);
      else for (const st of ["rest", "strong", "heavy"]) for (const n of p.gradient[st] || []) { const h = ramp(n); if (!h) fails.push(`제품 색 ${p.key}: gradient ${st} 의 램프 --${n} 을 style.src.css 에서 찾지 못했다`); else stops.push([`${st} ${n}`, h]); }
    } else if (p.gradient) fails.push(`제품 색 ${p.key}: gradient 는 AI 에만 — 넓은 면 그라데이션은 사람의 결정으로 AI 만 쓴다`);
    for (const [where, h] of stops) {
      const r = onWhite(h);
      if (r < 4.5 && !p.exception) fails.push(`제품 색 ${p.name}(${where} ${h}) 위에서 흰 글자가 ${r.toFixed(2)} — Brand 면의 글자는 늘 흰색이라 4.5 를 넘어야 한다(넘지 못하는 색은 사람의 결정으로 exception 에 이유를 적는다)`);
      if (r >= 4.5 && p.exception && where === "hex") fails.push(`제품 색 ${p.name}: 흰 글자가 ${r.toFixed(2)} 로 통과하는데 exception 이 남아 있다 — 낡은 예외를 지운다`);
    }
  }
  /* ② 자동 중립의 흔적 */
  for (const f of ["app.src.js", "style.src.css", "contrast.js", path.join("..", "_react", "src", "theme.ts")]) {
    const t = fs.readFileSync(path.join(__dirname, f), "utf8");
    for (const w of ["STATUS_HUES", "clashesWithStatus", "data-accent-neutral", "accentNeutral"])
      if (t.includes(w)) fails.push(`${f}: '${w}' — 상태색과 겹치는 제품을 중립으로 바꾸던 규칙은 2026-11-14 에 걷어냈다(제품 색은 늘 그대로, 중립은 팔레트에서 고른다)`);
  }
  /* ③ CSS ↔ data.js */
  const css0 = src.replace(/\/\*[\s\S]*?\*\//g, "");
  const nf = /:root:is\(([^)]*)\)\{--line-field-focus:/.exec(css0);
  const nfKeys = nf ? [...nf[1].matchAll(/\[data-accent="([a-z-]+)"\]/g)].map((m) => m[1]).sort().join() : null;
  const wantNf = PR.filter((p) => p.neutralFocus).map((p) => p.key).sort().join();
  if (nfKeys !== wantNf) fails.push(`style.src.css: 중립 입력 링 블록 :root:is(…){--line-field-focus:…} 의 제품(${nfKeys}) ≠ data.js neutralFocus(${wantNf})`);
  const ai = PR.find((p) => p.kind === "ai");
  const aiBlock = /:root\[data-accent="ai"\]\{([^}]*)\}/.exec(css0);
  if (ai && ai.gradient) {
    if (!aiBlock) fails.push('style.src.css: :root[data-accent="ai"] 그라데이션 블록이 없다');
    else for (const [st, tok] of [["rest", "--surface-brand-gradient"], ["strong", "--surface-brand-gradient-strong"], ["heavy", "--surface-brand-gradient-heavy"]]) {
      const want = `${tok}:linear-gradient(90deg,var(--${ai.gradient[st][0]}),var(--${ai.gradient[st][1]}))`;
      if (!aiBlock[1].includes(want)) fails.push(`style.src.css: AI 블록의 ${tok} 가 data.js gradient.${st} 와 다르다 — '${want}' 를 기대`);
    }
  }
  for (const p of PR.filter((x) => x.kind === "neutral"))
    if (!css0.includes(`:root[data-accent="${p.key}"]{--brand-40:`)) fails.push(`style.src.css: 중립 제품 '${p.key}' 의 :root[data-accent="${p.key}"] 블록이 없다`);
}

/* 값 대조 — 시멘틱 75×2 와 램프가 기준 토큰의 정의와 한 글자까지 같은지.
   "값까지 동일하게 교체"가 이번 설계의 정의이므로 이것이 1차 방어선이다:
   여기가 틀리면 대비·행동 검사가 다 통과해도 틀린 것이다. 정의는 base-tokens.js 에 코드로 있다 */
for (const d of require("./base-tokens.js").diff(css)) fails.push(`기준 토큰과 다름 — ${d}`);

/* CSS 안의 var() 가 전부 선언된 토큰을 가리키는지.
   센티넬 가드는 '쌍 선언에 등장하는 토큰'만 보고, data-token 가드는 HTML 속성만 본다 —
   그 사이에 구멍이 있었다: 어느 쪽에도 안 적힌 이름을 CSS 가 참조하면 상속색으로 떨어지고 빌드는 녹색이었다.
   이번에 둘이 걸렸다 — .lead 의 --text-pri(선언된 적 없는 오타)와 icons-css.js 가 삽입한 묵은 이름들.
   컴포넌트 지역 변수(인라인 style 이나 규칙 안에서 정의하는 것)는 토큰이 아니므로 예외 목록에 적는다 */
{
  const cut = css.indexOf("*{box-sizing");
  const declared = new Set([...css.slice(0, cut).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
  const LOCAL = LIB.LOCAL_VARS;   /* 런타임 · 지역 CSS 변수 — 목록과 이유는 lib.js 한 곳(sync-css 도 같은 목록) */
  const used = new Set([...css.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]));
  const missing = [...used].filter((t) => !declared.has(t) && !t.startsWith("--prod-") && !LOCAL.includes(t)).sort();
  for (const t of missing) fails.push(`style.css: var(${t}) 를 쓰는데 선언이 없다 — 그 자리는 상속색으로 떨어진다`);
  /* 생성 HTML 의 인라인 style 도 같은 구멍이다 — foundations.js 의 히어로·Do/Don't 가 토큰을 맨 문자열로 넘긴다.
     CSS 만 보는 검사로는 안 잡히고, data-token 검사는 속성만 본다 */
  for (const f of walk(OUT).filter((x) => x.endsWith(".html"))) {
    const rel = path.relative(OUT, f);
    const bad = [...new Set([...read(rel).matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]))]
      .filter((t) => !declared.has(t) && !t.startsWith("--prod-") && !LOCAL.includes(t)).sort();
    for (const t of bad) fails.push(`${rel}: 인라인 style 이 var(${t}) 를 쓰는데 선언이 없다`);
  }
  /* 문서의 코드 예시(<pre>)가 **선언**하는 토큰도 본다. var() 가드는 쓰는 쪽만 보므로
     '--accent-50:#EFF2FA' 처럼 죽은 이름을 선언만 하는 예시는 통과했다 —
     Getting started 의 제품 컬러 CSS 가 개명 뒤로도 옛 열 단계를 그대로 싣고 있었다.
     복사해 붙이라고 둔 코드라, 틀리면 그대로 제품에 들어간다 */
  const unesc = (t) => t.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
  for (const f of walk(OUT).filter((x) => x.endsWith(".html"))) {
    const rel = path.relative(OUT, f);
    const seen = new Set();
    for (const m of read(rel).matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/g)) {
      const code = unesc(m[1]);
      for (const d of [...code.matchAll(/(--[a-z0-9-]+)\s*:/g), ...code.matchAll(/var\((--[a-z0-9-]+)/g)]) {
        const t = d[1];
        if (declared.has(t) || t.startsWith("--prod-") || LOCAL.includes(t) || seen.has(t)) continue;
        seen.add(t);
        fails.push(`${rel}: 코드 예시가 ${t} 를 쓰는데 선언에 없다 — 붙여 넣으면 아무 일도 하지 않는다`);
      }
    }
  }
  /* 컴포넌트의 figma 필드(components.json 으로 나간다)도 같은 구멍이다 — Indicator 가 개명 전 이름
     --graphic-muted 를 들고 있었고, 점 색도 CSS 와 다른 토큰이었다. 이 필드로 Figma 를 맞추면 없는 토큰이 간다 */
  for (const [k, c] of Object.entries(COMPONENTS)) {
    if (!c || typeof c !== "object" || !c.figma) continue;
    const bad = [...new Set([...JSON.stringify(c.figma).matchAll(/"(--[a-z0-9-]+)"/g)].map((m) => m[1]))].filter((t) => !declared.has(t)).sort();
    for (const t of bad) fails.push(`components.data.js ${k}.figma: ${t} 가 선언에 없다 — 이 필드로 Figma 를 맞추면 없는 토큰이 간다`);
  }
  /* 복사용 CSS 가 예제가 쓰는 클래스를 다 담는지 — Steps 완료 숨김 문구가 .sr-only 없이 붙어 나가 화면에 보이던 결함(ec1c8e6)과
     같은 구멍이 15쪽에 있었다(Card 예제의 .btn · .tag …). 시스템에 규칙이 있는 클래스만 본다 — 사이트 전용 클래스는 붙여 넣을 대상이 아니다.
     이름이 어딘가에 나오는지만 보면 덮어쓰기만 실린 것을 놓친다 — Tab 예제의 .count 는 .tabs .tab .count 만 실리고
     .count{display:inline-grid…} 가 빠져 배지 모양이 달랐다. 그래서 자기 규칙(셀렉터가 .x 하나 — 의사 클래스만 붙은 것)이 시스템에 있으면
     그것도 실려야 한다. ".x 로 시작"으로 셌더니 .btn 을 빌리며 함께 실린 .empty .btn 이 .empty 의 자기 규칙으로 셈됐다 */
  {
    const src = fs.readFileSync(path.join(__dirname, "style.src.css"), "utf8");
    /* 쉼표는 괄호 밖에서만 가른다 — .btn:where(.outline.primary,.text) 를 그냥 가르면 '.text' 가 자기 규칙으로 셈됐다(2026-10-28) */
    const selectorsIn = (css) => [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{[^{}]*\}/g)].flatMap((m) => LIB.splitSelectors(m[1]));
    const classesIn = (css) => new Set(selectorsIn(css).flatMap((s) => [...s.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((x) => x[1])));
    const rootsIn = (css) => new Set(selectorsIn(css).map((s) => (/^\.([a-zA-Z][\w-]*)(?::{1,2}[\w-]+(?:\([^)]*\))?)*$/.exec(s) || [])[1]).filter(Boolean));
    const samples = src.slice(src.indexOf(LIB.SAMPLES_START) + LIB.SAMPLES_START.length, src.indexOf(LIB.SAMPLES_END));
    const ruled = classesIn(samples), rooted = rootsIn(samples);
    for (const [sec, list] of [["components", COMPONENTS], ["patterns", PATTERNS]]) for (const [k, c] of Object.entries(list)) {
      if (!c || typeof c !== "object" || !c.examples || typeof c.css === "string") continue;
      for (const ex of c.examples) {
        const copyCss = LIB.cssFor(LIB.exampleCssPrefixes(c, COMPONENTS, ex.html), src, ""), copy = classesIn(copyCss), copyRoots = rootsIn(copyCss);   // 예제 코드 패널의 복사본(그 예제 몫)
        const used = new Set([...(ex.html || "").matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter(Boolean));
        const miss = [...used].filter((cl) => ruled.has(cl) && !copy.has(cl));
        const bare = [...used].filter((cl) => rooted.has(cl) && copy.has(cl) && !copyRoots.has(cl));
        if (miss.length) fails.push(`${sec}/${k}.html #ex-${k}-${ex.id}: 복사용 CSS 에 ${miss.map((x) => "." + x).join(" ")} 규칙이 없다 — 붙여 넣은 쪽에서 그 부분이 스타일 없이 그려진다(css · borrows · uses 에 더한다)`);
        if (bare.length) fails.push(`${sec}/${k}.html #ex-${k}-${ex.id}: 복사용 CSS 에 ${bare.map((x) => "." + x).join(" ")} 의 덮어쓰기만 있고 자기 규칙(.x{…})이 없다 — 붙여 넣으면 기본 모양 없이 덮어쓰기만 먹는다(borrows 에 더한다)`);
      }
    }
  }
  /* 패키지가 싣는 CSS 도 같은 검사를 받아야 한다. sync-css.mjs 가 손으로 쓴 base 규칙이
     개명 뒤에도 옛 이름을 참조하고 있었고(.ds-root 의 글자·배경, 포커스 링), 사이트만 보는
     가드로는 영영 안 잡힌다. dist 는 산출물이라 없을 수 있다 — 그때는 경고로 넘긴다 */
  {
    const distCss = path.resolve(__dirname, "..", "_react", "dist", "style.css");
    if (!fs.existsSync(distCss)) warns.push("_react/dist/style.css 없음 — 패키지 CSS 검사를 건너뛴다(npm run build)");
    else {
      const d = fs.readFileSync(distCss, "utf8");
      const dDecl = new Set([...d.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
      const dBad = [...new Set([...d.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]))]
        .filter((t) => !dDecl.has(t) && !t.startsWith("--prod-") && !LOCAL.includes(t)).sort();
      for (const t of dBad) fails.push(`_react/dist/style.css: var(${t}) 를 쓰는데 선언이 없다 — 패키지를 쓰는 앱에서 상속색으로 떨어진다`);
    }
  }
}

/* 생성물이 가리키는 토큰이 전부 선언돼 있는지 — data-token 은 HTML 속성이라
   CSS 를 보는 가드 셋(주석 짝 · 선언 존재 · 센티넬)이 전부 놓칩니다.
   3차에서 --graphic-muted → --muted-graphic 개명이 foundations.js 의 sem() 맨 문자열에
   닿지 않아 빈 칩이 하나 남았고, 빌드는 녹색이었습니다 */
{
  const blocks = [":root", ':root[data-theme="dark"]', ':root[data-accent="neutral"]'];
  const declared = new Set();
  for (const sel of blocks) for (const k of Object.keys(LIB.parseVars(LIB.rootBlock(css, sel)))) declared.add(k);
  const pointed = new Set();
  for (const f of walk(OUT).filter(x => x.endsWith(".html"))) {
    const rel = path.relative(OUT, f);
    for (const t of new Set([...read(rel).matchAll(/data-token="(--[a-z0-9-]+)"/g)].map(m => m[1]))) {
      pointed.add(t);
      if (!declared.has(t)) fails.push(`${rel}: data-token="${t}" 이 선언되지 않은 토큰 — 스와치가 빈 칩으로 나옵니다`);
    }
  }
  /* 반대 방향 — 의미 토큰 전수가 Colors 페이지에 스와치로 나와야 한다.
     4차에서 절을 채워 가며 0 으로 만든다. 그때 fails 로 승격한다 */
  const isPrim = (k) => /^--(cool-neutral|neutral|brand|blue|green|orange|red|lime|cyan|light-blue|violet|purple|pink|red-orange|prod)-\d+d?$/.test(k);   // d — 다크 면 단계 --brand-50d(2026-11-17)
  const isScalar = (k) => /^--(space|radius|shadow|motion|font|header|sidebar|toc|shell|card|row|code)-/.test(k) || /^--static-/.test(k) || k === "--brand-label" || k === "--company-mark" || k === "--company-mark-subtle";
  const orphan = [...declared].filter((t) => !isPrim(t) && !isScalar(t) && !pointed.has(t)).sort();
  if (orphan.length) warns.push(`Colors 페이지에 스와치가 없는 의미 토큰 ${orphan.length}개 — ${orphan.slice(0, 6).join(" ")}${orphan.length > 6 ? " …" : ""}`);
}

/* 본문 문구(사람의 요청 2026-11-15) — 정의 · 고르기 표 · Rules · 예제 설명 · 패턴 원칙과 Foundations · Home 의 소개 문단은 서술형으로 쓴다.
   토큰 · 코드 · 날짜 · 결정 이력 · 빌드 언급을 두지 않고, 괄호는 한 문장에 하나까지. 정확한 이름은 Spec · Props 표가 나른다.
   고르기 표의 Placement 행은 Figma 대조가 읽는 자리라 괄호 수만 보지 않는다(나머지 금지는 같다) */
{
  const BAD = [[/--[a-z][a-z0-9-]+/, "토큰 이름"], [/<code\b/, "코드"], [/\b20\d\d-\d\d/, "날짜"], [/사람의 결정|사람이 정/, "결정 이력"],
    [/\bverify\b|\bbehave\b|ds\.js|빌드가 검사/, "빌드 언급"]];
  const plain = (s) => String(s || "").replace(/<a\b[^>]*>|<\/a>|<\/?(b|strong|em|i)>/g, "").replace(/\$\{[^}]*\}/g, "X");
  const check = (where, s, parens = true) => {
    const p = plain(s); if (!p) return;
    for (const [re, label] of BAD) { const m = p.match(re); if (m) fails.push(`${where}: 본문에 ${label} '${m[0]}' — 말로 풀고 정확한 이름은 Spec · Props 에 둡니다`); }
    if (parens) for (const sen of p.split(/(?<=[.다])\s+/)) if ((sen.match(/\(/g) || []).length > 1) fails.push(`${where}: 한 문장에 괄호 둘 이상 — '${sen.slice(0, 60)}'`);
  };
  const rows = (pr) => (Array.isArray(pr) ? pr : Object.values(pr || {}).flat()).filter(Array.isArray);
  for (const [k, c] of Object.entries(COMPONENTS)) {
    check(`components/${k} 정의`, c.desc);
    for (const r of c.choose || []) check(`components/${k} 고르기 표 '${r[0]}'`, r[1], r[0] !== "Placement");
    for (const r of rows(c.principles)) check(`components/${k} Rules '${r[0]}'`, r[1]);
    for (const e of c.examples || []) check(`components/${k} 예제 ${e.id}`, e.desc);
  }
  for (const [k, c] of Object.entries(PATTERNS)) {
    check(`patterns/${k} 정의`, c.desc);
    for (const r of c.choose || []) check(`patterns/${k} 고르기 표 '${r[0]}'`, r[1]);
    for (const r of rows(c.principles)) check(`patterns/${k} Rules '${r[0]}'`, r[1]);
    for (const e of c.examples || []) check(`patterns/${k} 예제 ${e.id}`, e.desc);
  }
  for (const [k, c] of Object.entries(require("./templates.data.js"))) {
    check(`templates/${k} 정의`, c.desc); check(`templates/${k} 개요 한 줄`, c.line);
    for (const r of c.choose || []) check(`templates/${k} 고르기 표 '${r[0]}'`, r[1]);
    for (const r of rows(c.principles)) check(`templates/${k} Rules '${r[0]}'`, r[1]);
  }
  for (const sec of ["foundations", "home", "templates"]) for (const n of fs.readdirSync(path.join(OUT, sec)).filter((x) => x.endsWith(".html"))) {
    const html = fs.readFileSync(path.join(OUT, sec, n), "utf8");
    for (const m of html.matchAll(/<p class="lead">([\s\S]*?)<\/p>/g)) check(`${sec}/${n} 소개 문단`, m[1]);
  }
}

/* ds.js 이벤트 표 — ds.src.js 가 내는 "ds:*" 이벤트가 모두 React Package › 이벤트 표에 있고, 표에 없는 이벤트가 없다(2026-11-15).
   손으로 쓰던 목록이 Tree · 알림 센터 · Time Picker 를 빠뜨리고 없어진 .onboard 를 남겨 두었다 */
{
  const src = fs.readFileSync(path.join(__dirname, "ds.src.js"), "utf8");
  const fired = new Set([...src.matchAll(/"(ds:[a-z-]+)"/g)].map((m) => m[1]));
  const page = fs.readFileSync(path.join(OUT, "resources", "react.html"), "utf8");
  const tbl = (page.split('id="dsjs-events"')[1] || "").split("</table>")[0];
  const listed = new Set([...tbl.matchAll(/<td><code>(ds:[a-z-]+)<\/code><\/td>/g)].map((m) => m[1]));
  if (!listed.size) fails.push("resources/react.html: ds.js 이벤트 표(#dsjs-events)를 찾지 못했습니다");
  for (const e of fired) if (!listed.has(e)) fails.push(`resources/react.html: ds.js 가 내는 ${e} 가 이벤트 표에 없습니다`);
  for (const e of listed) if (!fired.has(e)) fails.push(`resources/react.html: 이벤트 표의 ${e} 는 ds.js 가 내지 않습니다`);
  if (/\.onboard\b/.test(page)) fails.push("resources/react.html: 없어진 .onboard 동작이 남아 있습니다");
}

console.log(`verify: 실패 ${fails.length} · 경고 ${warns.length} · 남은 .ph ${phTotal}개(${phPages.join(", ") || "없음"})`);
fails.forEach(f => console.log("  ✗ " + f)); warns.forEach(w => console.log("  ! " + w));
if (fails.length) process.exit(1);
