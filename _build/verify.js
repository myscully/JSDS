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
    ['@media (prefers-color-scheme:dark){:root:not([data-theme="light"])[data-accent-neutral]', ':root[data-theme="dark"][data-accent-neutral]'],
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
  const DELAY = "ds-delay 0s var(--ds-delay,1s) both";   // Loading 지연 표시(2026-11-11) — 반복이 아니라 한 번 보이게 할 뿐이고 상태 표시 루프와 함께만 쓴다
  for (const m of src.matchAll(/(?<![-\w])(transition|animation):([^;}]*)/g)) {
    const [, prop, val] = m; const v = val.trim(), at = `style.src.css:${lineOf(m.index)}`;
    if (v === "none!important") continue;
    if (prop === "animation") { if (!v.replace(/!important$/, "").split(/,(?![^(]*\))/).every((p) => LOOPS.includes(p) || p === DELAY) && !/^[\w-]+ var\(--motion-(fast|base|slow)\)$/.test(v)) fails.push(`${at}: animation "${v}" — 반복은 LOOPS 셋만, 그 밖은 --motion-* 토큰`); continue; }
    for (const part of v.split(/,(?![^(]*\))/).map((x) => x.trim())) {
      if (!/^[\w-]+ var\(--motion-(fast|base|slow)\)$/.test(part)) fails.push(`${at}: transition "${part}" — 속성 하나 + var(--motion-*) 하나만(숫자 · 이징을 덧붙이면 무효가 되거나 토큰을 벗어난다)`);
    }
  }
  const rm = /@media \(prefers-reduced-motion:reduce\)\{[^@]*?\*,\*::before,\*::after,\*::details-content\{transition:none!important;animation:none!important\}/.test(src);
  if (!rm) fails.push("style.src.css: prefers-reduced-motion 규칙이 *, ::before, ::after, ::details-content 를 모두 멈추지 않는다");
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
      /* 표 · 목록 원칙(2026-11-10) — 머리글 필수 · 정렬은 버튼 · 머리글 안에 다른 조작 없음 · 행 버튼 이름은 행마다 다름 */
      const sameNames = (body, where) => { const names = [...body.matchAll(/<(?:button|a)\b[^>]*aria-label="([^"]*)"/g)].map((x) => x[1]), dup = names.filter((n, i) => names.indexOf(n) !== i); if (dup.length) fails.push(`${f}: 행마다 같은 버튼 이름 "${dup[0]}"(${where} › 행 버튼 이름)`); };
      for (const m of pv.matchAll(/<table\b[^>]*class="tbl[^"]*"[^>]*>([\s\S]*?)<\/table>/g)) {
        if (!/<th\b/.test(m[1])) fails.push(`${f}: 머리글 없는 표(Table › 머리글)`);
        for (const h of (/<thead>([\s\S]*?)<\/thead>/.exec(m[1]) || ["", ""])[1].matchAll(/<th\b([^>]*)>([\s\S]*?)<\/th>/g)) {
          const sortable = /\bsortable\b/.test(h[1]);
          if (sortable && !/^<button type="button" class="sort">/.test(h[2])) fails.push(`${f}: 정렬 머리글은 button.sort(Data Table › 머리글)`);
          if (/<a\b/.test(h[2]) || (!sortable && /<button\b/.test(h[2]))) fails.push(`${f}: 머리글 안에 정렬 말고 다른 조작(Data Table › 머리글)`);
        }
        sameNames((/<tbody>([\s\S]*?)<\/tbody>/.exec(m[1]) || ["", ""])[1], "Data Table");
      }
      for (const m of pv.matchAll(/<div class="tbl-wrap sticky"([^>]*)>/g)) if (!/tabindex="0"/.test(m[1]) || !/aria-label="/.test(m[1])) fails.push(`${f}: 고정 헤더 영역은 tabindex=0 + 이름(Data Table › 고정 헤더)`);
      for (const m of pv.matchAll(/<ul class="list[^"]*"([^>]*)>([\s\S]*?)<\/ul>/g)) {
        sameNames(m[2], "List");
        if (!/role="option"/.test(m[2])) continue;
        if (!/role="listbox"/.test(m[1])) fails.push(`${f}: role=option 은 listbox 안에서만(List › listbox)`);
        for (const li of m[2].matchAll(/<li\b([^>]*)>([\s\S]*?)<\/li>/g)) { if (!/tabindex="0"/.test(li[1])) fails.push(`${f}: 고르는 목록의 항목은 tabindex=0(List › listbox)`); if (/<(a|button)\b/.test(li[2])) fails.push(`${f}: listbox 항목 안에 버튼 · 링크(List › listbox)`); }
      }
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
      { const charts = (pv.match(/<canvas\b[^>]*\bdata-chart=/g) || []).length, views = (pv.match(/<div class="chart-view"[^>]*><div class="chart-tools"><button\b[^>]*\bdata-chart-table\b/g) || []).length; if (charts !== views) fails.push(`${f}: 탐색형 차트는 .chart-view 와 표로 보기 버튼을 함께 씁니다(차트 ${charts} · 버튼 ${views}, Data Visual)`); }
      /* Date Picker 시각 옵션(2026-11-10) */
      for (const m of pv.matchAll(/<div class="datepicker field[^"]*"([^>]*\bdata-time\b[^>]*)>/g)) {
        const at = m[1], sec = /data-time="seconds"/.test(at), input = /<input\b[^>]*>/.exec(pv.slice(m.index));
        if (/data-time="[^"]/.test(at) && !sec) fails.push(`${f}: data-time 값은 없거나 seconds 입니다(Date Picker › Time)`);
        if (/data-unit="/.test(at)) fails.push(`${f}: data-time 은 일 단위 Date Picker 에만 씁니다(Date Picker › Time)`);
        if (!input || !new RegExp(`placeholder="YYYY\\. MM\\. DD HH:mm${sec ? ":ss" : ""}(?: ~ [^"]*)?"`).test(input[0])) fails.push(`${f}: 시각까지 받는 Date Picker 의 placeholder 는 형식 그대로(Date Picker › Time)`);
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
        for (const m of pv.matchAll(/<div class="field[^"]*"[^>]*>\s*<label\b[^>]*>[\s\S]*?<\/label>\s*<div class="upload[ "]/g)) {
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
      each(/<div class="form-row"[^>]*>/g, (b) => { const n = (b.match(/class="field[ "]/g) || []).length; if (n !== 2) fails.push(`${f}: .form-row 는 필드 2개(${n}개)`); });
      for (const m of pv.matchAll(/<form\b[^>]*>([\s\S]*?)<\/form>/g)) {
        const s = m[1].indexOf("data-form-summary");
        if (s > -1) {
          if (!/^\s*<div class="notice danger form-summary" role="alert" data-form-summary/.test(m[1])) fails.push(`${f}: 오류 요약은 폼 맨 위 · role=alert(Form › 오류 요약)`);
          const c = /입력값 (\d+)개/.exec(m[1]); if (c && +c[1] < 3) fails.push(`${f}: 오류 요약은 3개 이상일 때(Form › 오류 요약)`);
        }
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
      }
      for (const m of pv.matchAll(/<span class="tag (critical|medium|low|info)\b[^"]*"[^>]*>([^<]*)</g)) if (!/^(Critical|High|Medium|Low|Info|CRIT|HIGH|WARN|LOW|INFO|심각|높음|중간|낮음|정보)$/.test(m[2].trim())) fails.push(`${f}: 심각도 색은 심각도 어휘에만 "${m[2]}"(Tag › 톤)`);
      for (const m of pv.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)) { const n = [...m[1].matchAll(/class="tag[ "](?![^"]*tag-more)/g)].length; if (n > 3) fails.push(`${f}: 표 칸의 Tag ${n}개 — 앞 2개 + +N(Tag › 여러 개)`); }
      for (const m of pv.matchAll(/class="tag[^"]*tag-more[^"]*"/g)) { const before = pv.slice(Math.max(0, m.index - 40), m.index); if (!/<button type="button" $/.test(before)) fails.push(`${f}: +N 은 버튼(Tag › 여러 개)`); }
      for (const m of pv.matchAll(/<span class="count(?! neutral)(?: [^"]*)?"[^>]*>([^<]+)<\/span>/g)) { const t = m[1].trim(); if (/^\d+$/.test(t) && (+t === 0 || +t > 99) && !/class="tab\b/.test(pv.slice(Math.max(0, m.index - 120), m.index))) fails.push(`${f}: Count "${t}" — 0 은 숨기고 99 초과는 99+(Indicator › Count)`); }
      for (const m of pv.matchAll(/<ol class="steps[^"]*"([^>]*)>([\s\S]*?)<\/ol>/g)) { const n = [...m[2].matchAll(/<li\b/g)].length; if (n < 3 || n > 6) fails.push(`${f}: Steps ${n}단계 — 3~6(Steps › 단계 수)`); if (!/aria-label="/.test(m[1])) fails.push(`${f}: Steps 이름 없음(Steps)`); if (/<li(?![^>]*class="done")[^>]*>\s*<button/.test(m[2])) fails.push(`${f}: 완료한 단계로만 돌아감(Steps › 돌아가기)`); }
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

/* 컴포넌트 페이지 구성(사람의 결정 2026-11-09) — 모든 컴포넌트에 Placement · Spec 절이 있다. spec 은 예전에 components.json 에만 있어 값이 낡아도 드러나지 않았다 */
for (const [k, c] of Object.entries(COMPONENTS)) {
  const f = `components/${k}.html`; if (!fs.existsSync(path.join(OUT, f))) continue; const b = read(f);
  if (!(c.spec || []).some(([n]) => n === "Placement")) fails.push(`${k}: spec 에 Placement 가 없다`);
  for (const id of ["placement", "spec", "props", "usage"]) if (!b.includes(`<h2 id="${id}">`)) fails.push(`${f}: ${id} 절이 없다`);
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
if (!fs.existsSync(path.join(OUT, "assets/ds.js"))) fails.push("assets/ds.js 없음");
for (const f of ["components/button.html", "index.html"]) if (fs.existsSync(path.join(OUT, f)) && !/assets\/ds\.js/.test(read(f))) fails.push(`${f}: ds.js 스크립트 태그 없음`);
const app = read("assets/app.js"); const idx = JSON.parse((app.match(/const SEARCH_INDEX=(\[.*?\]);\n/s) || [])[1] || "[]");
const routes = Object.keys(DATA.SITE).flatMap(s => LIB.allPages(DATA.SITE, s)).length; if (idx.length !== routes) fails.push(`SEARCH_INDEX ${idx.length} ≠ 라우트 ${routes}`);
if (!fs.existsSync(path.join(OUT, "resources/react.html"))) fails.push("resources/react.html 없음");
// Home › 시작하기: 페이지 존재 · 복사 대상 id · 링크 변환 · 첫 화면 CTA
if (!fs.existsSync(path.join(OUT, "home/getting-started.html"))) fails.push("home/getting-started.html 없음");
else { const gs = article(read("home/getting-started.html")); for (const m of gs.matchAll(/data-copy="([^"]+)"/g)) if (!new RegExp(`id="${m[1]}"`).test(gs)) fails.push(`home/getting-started.html: data-copy 대상 #${m[1]} 없음`); if (/href="#\//.test(gs)) fails.push('home/getting-started.html: 변환되지 않은 href="#/"'); if (!/data-doctab="designer"/.test(gs) || !/class="guide-steps"/.test(gs)) fails.push("home/getting-started.html: 대상별 탭·단계 목록 없음"); if (!/id="platforms"/.test(gs) || !/1024–1279/.test(gs)) fails.push("home/getting-started.html: 지원 환경 표 없음"); }
if (!/href="home\/getting-started\.html"/.test(read("index.html"))) fails.push("index.html: Getting started 링크 없음");
// Foundations: 참조 구성(Overview + Base material 5) + Writing · Interaction, 옛 페이지 없음
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
  if (j.components.length !== Object.keys(COMPONENTS).length || j.components.length !== 43) fails.push(`components.json 컴포넌트 ${j.components.length}개(43 기대)`);
  if (j.patterns.length !== Object.keys(PATTERNS).length || j.patterns.length !== 10) fails.push(`components.json 패턴 ${j.patterns.length}개(10 기대)`);
  for (const c of [...j.components, ...j.patterns]) { if (!c.examples || !c.examples.length) fails.push(`components.json ${c.key}: 예제 없음`); if (!c.css || c.css.split("\n").length < 2) fails.push(`components.json ${c.key}: CSS 비어 있음`); }
}
/* 색만으로 의미를 전달하지 않는다 — 심각도 다섯 색은 회색조로 분리할 수 없으므로(상태색 램프를 공유하는 한
   만들 수도 없습니다) 1.4.1 준수는 전적으로 라벨 병기에 의존합니다. 그 라벨을 검사하는 것이 지금까지 없었습니다.
   도넛·밴드는 그래픽이라 접근 이름이 있어야 하고, 표의 좌측 막대(.sev-cell)는 같은 칸 안에 글자가 있어야 합니다. */
for (const f of walk(OUT).filter(f => f.endsWith(".html"))) {
  const rel = path.relative(OUT, f), html = article(read(rel));
  for (const [sel, re] of [[".donut", /<div class="donut"[^>]*>/g], [".sev-band", /<div class="sev-band"[^>]*>/g]])
    for (const m of html.match(re) || []) if (!/aria-label=|aria-hidden="true"/.test(m)) fails.push(`${rel}: ${sel} 에 접근 이름도 aria-hidden 도 없다 — 색만으로 심각도를 전달한다`);
  /* 정적 도넛의 조각 경계는 2px 구분선(i)이다 — 빠지면 조각이 틈 없이 붙어 보인다(2026-11-05, conic 각도 띠를 구분선으로 바꿈) */
  for (const m of html.matchAll(/<div class="donut"[^>]*>([\s\S]*?)<\/div>/g)) if ((m[1].match(/<i style="--a:[\d.]+deg"><\/i>/g) || []).length < 2) fails.push(`${rel}: .donut 에 경계 구분선 <i style="--a:…deg"> 가 없다 — 조각 사이 2px 틈이 사라진다`);
  /* .sev-cell 은 여는 태그부터 닫는 </td>/</div> 까지에 글자가 있어야 한다 */
  for (const m of html.matchAll(/<(td|div)([^>]*class="[^"]*sev-cell[^"]*"[^>]*)>([\s\S]*?)<\/\1>/g))
    if (!/[가-힣A-Za-z0-9]/.test(m[3].replace(/<[^>]*>/g, ""))) fails.push(`${rel}: .sev-cell 에 라벨 글자가 없다 — 3px 막대 색만 남는다`);
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

/* 제품 색 제약 — 면 위 글자(--brand-label)는 늘 흰색이므로, 제품 색이 그 흰 글자를 받쳐야 한다.
   종전에는 밝은 제품에 맞춰 글자를 뒤집는 적응(data-accent-light)이 있었는데 걷어냈다:
   면을 어둡게 내리는 길은 다크에서 버튼이 캔버스에 묻혀 막혀 있고, 적응을 두면 참조에 없는 분기가 남는다.
   적응을 걷어낸 자리를 이 가드가 메운다 — 규격 미달 제품이 들어오면 빌드가 막는다.
   기준은 제품 HEX 자체(brand-50)다. 다크 rest 도 같은 단계라 이 검사 하나가 두 테마의 rest 를 받친다.
   라이트 hover·pressed 는 더 어두워 자동으로 통과하고, 다크 hover·pressed 는 밝아지는 쪽이라 advisory 다 */
{
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const L = (hex) => { const c = [0, 1, 2].map((i) => lin(parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16))); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const onWhite = (hex) => 1.05 / (L(hex) + 0.05);
  const hsl = (hex) => { const n = parseInt(hex.slice(1), 16), r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, sat = 0; const l = (mx + mn) / 2;
    if (mx !== mn) { const d = mx - mn; sat = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = (mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) / 6; }
    return [h * 360, sat * 100]; };
  /* 상태색 색상환 표는 app.src.js 가 하나의 출처다 — 여기 베껴 두면 드리프트한다.
     실제로 종전 표가 램프와 20도 어긋난 적이 있다. 못 읽으면 조용히 넘기지 않고 실패시킨다 */
  const hueSrc = fs.readFileSync(path.join(__dirname, "app.src.js"), "utf8");
  const hueM = hueSrc.match(/const STATUS_HUES = \[([^\]]+)\]/);
  if (!hueM) fails.push("app.src.js 에서 STATUS_HUES 를 읽지 못했다 — 제품 색 제약을 검사할 수 없다");
  const HUES = hueM ? hueM[1].split(",").map((x) => parseFloat(x)) : [];
  const clashes = (hex) => { const [h, sat] = hsl(hex); if (sat < 20) return false;
    return HUES.some((t) => { const d = Math.abs(h - t) % 360; return Math.min(d, 360 - d) < 15; }); };
  for (const p2 of require("./data.js").PRODUCTS) {
    /* 상태색과 겹치는 제품은 중립 램프로 갈아끼워지므로 자기 색을 면에 쓰지 않는다 — 제약 대상이 아니다 */
    if (clashes(p2.hex)) continue;
    const r = onWhite(p2.hex);
    if (r < 4.5) fails.push(`제품 색 ${p2.name}(${p2.hex}) 위에서 흰 글자가 ${r.toFixed(2)} — Brand 면의 글자는 늘 흰색이라 4.5 를 넘어야 한다`);
  }
}

/* 값 대조 — 시멘틱 75×2 와 램프가 기준 시스템의 정의와 한 글자까지 같은지.
   "값까지 동일하게 교체"가 이번 설계의 정의이므로 이것이 1차 방어선이다:
   여기가 틀리면 대비·행동 검사가 다 통과해도 틀린 것이다. 정의는 base-tokens.js 에 코드로 있다 */
for (const d of require("./base-tokens.js").diff(css)) fails.push(`기준 시스템과 다름 — ${d}`);

/* CSS 안의 var() 가 전부 선언된 토큰을 가리키는지.
   센티넬 가드는 '쌍 선언에 등장하는 토큰'만 보고, data-token 가드는 HTML 속성만 본다 —
   그 사이에 구멍이 있었다: 어느 쪽에도 안 적힌 이름을 CSS 가 참조하면 상속색으로 떨어지고 빌드는 녹색이었다.
   이번에 둘이 걸렸다 — .lead 의 --text-pri(선언된 적 없는 오타)와 icons-css.js 가 삽입한 묵은 이름들.
   컴포넌트 지역 변수(인라인 style 이나 규칙 안에서 정의하는 것)는 토큰이 아니므로 예외 목록에 적는다 */
{
  const cut = css.indexOf("*{box-sizing");
  const declared = new Set([...css.slice(0, cut).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
  /* --float-*: 스크롤 영역 안 메뉴의 자리 · 폭 — ds.js · React 가 열 때 재서 넣는다(2026-11-10) */
  /* --dp-top · --dp-left: Date Picker 달력 자리 — ds.js · React 가 열 때 재서 host 에 넣고, CSS 는 늘 기본값(필드 아래 4px · 왼쪽 0)을 함께 쓴다(2026-10-27) */
  /* --a: 정적 도넛 경계 구분선의 각도 — 마크업 인라인 style 이 넣고 CSS .donut i 가 기본값(0deg)과 함께 쓴다(2026-11-05) */
  const LOCAL = ["--checker-bg", "--cols", "--cols-sm", "--cols-xs", "--p", "--dp-top", "--dp-left", "--a", "--float-x", "--float-y", "--float-w", "--float-arrow", "--ds-delay"];
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
  const blocks = [":root", ':root[data-theme="dark"]', ":root[data-accent-neutral]"];
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
  const isPrim = (k) => /^--(cool-neutral|neutral|brand|blue|green|orange|red|lime|cyan|light-blue|violet|purple|pink|red-orange|prod)-\d+$/.test(k);
  const isScalar = (k) => /^--(space|radius|shadow|motion|font|header|sidebar|toc|shell|card|row|code)-/.test(k) || /^--static-/.test(k) || k === "--brand-label" || k === "--company-mark" || k === "--company-mark-subtle";
  const orphan = [...declared].filter((t) => !isPrim(t) && !isScalar(t) && !pointed.has(t)).sort();
  if (orphan.length) warns.push(`Colors 페이지에 스와치가 없는 의미 토큰 ${orphan.length}개 — ${orphan.slice(0, 6).join(" ")}${orphan.length > 6 ? " …" : ""}`);
}

console.log(`verify: 실패 ${fails.length} · 경고 ${warns.length} · 남은 .ph ${phTotal}개(${phPages.join(", ") || "없음"})`);
fails.forEach(f => console.log("  ✗ " + f)); warns.forEach(w => console.log("  ! " + w));
if (fails.length) process.exit(1);
