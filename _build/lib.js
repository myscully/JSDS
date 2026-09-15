/* =========================================================
   lib.js — 브라우저(standalone 미리보기)와 node(build.js) 공용 함수
   - esc / dedent : 문자열 유틸
   - cssFor      : 공유 스타일시트의 'Live component samples' 블록에서 컴포넌트 CSS 추출
   - tokenBlock  : :root 토큰 중 접두어에 해당하는 변수만 추출
   - parseVars   : :root / dark 블록을 {name:value} 객체로
   - htmlToJsx   : HTML 샘플 → React(TSX) 코드
   - hl          : 정적 구문 강조 (html / css / tsx)
   ========================================================= */
(function (root) {
  const esc = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  /* 템플릿 리터럴로 쓴 샘플의 공통 들여쓰기 제거 */
  function dedent(s) {
    const lines = String(s).replace(/^\n+/, "").replace(/\s+$/, "").split("\n");
    const ind = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^\s*/)[0].length));
    return lines.map(l => l.slice(ind)).join("\n");
  }

  /* ---------- CSS ---------- */
  const SAMPLES_START = "/* ---------- Live component samples ---------- */";
  const SAMPLES_END = "/* ---------- /Live component samples ---------- */";
  function samplesBlock(css) {
    const a = css.indexOf(SAMPLES_START), b = css.indexOf(SAMPLES_END);
    return a < 0 || b < 0 ? "" : css.slice(a + SAMPLES_START.length, b);
  }
  const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  function selectorMatches(sel, prefixes) {
    return prefixes.some(p => {
      const tail = p.endsWith("-") ? "" : "(?![\\w-])";
      return new RegExp("(^|[\\s>+~(,])" + reEsc(p) + tail).test(sel);
    });
  }
  /* prefixes: [".btn", ".tag"] → 해당 셀렉터로 시작하는 규칙만. 블록 안에는 평면 규칙만 둔다(@media 금지) */
  function cssFor(prefixes, css, version) {
    let block = samplesBlock(css).replace(/\/\*[\s\S]*?\*\//g, "");
    // @keyframes 는 따로 모아 두고, 선택된 규칙이 animation 으로 참조할 때만 덧붙인다
    const keyframes = {};
    block = block.replace(/@keyframes\s+([\w-]+)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, (m, name) => { keyframes[name] = m.trim(); return ""; });
    const re = /([^{}]+)\{([^{}]*)\}/g; const out = []; let m;
    while ((m = re.exec(block))) {
      const sels = m[1].split(",").map(s => s.trim()).filter(Boolean);
      if (sels.some(s => selectorMatches(s, prefixes))) out.push(sels.join(",") + "{" + m[2].trim() + "}");
    }
    for (const [name, kf] of Object.entries(keyframes)) if (out.some(r => /animation/.test(r) && new RegExp("\\b" + name + "\\b").test(r))) out.push(kf);
    const head = `/* JS Design System ${version || ""} · ${prefixes.join(", ")} · 토큰(var(--*))은 assets/style.css :root 참고 */`;
    return head + "\n" + out.join("\n");
  }
  function rootBlock(css, selector) {
    const i = css.indexOf(selector + "{"); if (i < 0) return "";
    const j = css.indexOf("}", i); return css.slice(i + selector.length + 1, j);
  }
  function parseVars(block) {
    const out = {};
    block.replace(/\/\*[\s\S]*?\*\//g, "").split(";").map(s => s.trim()).filter(s => s.startsWith("--")).forEach(d => { const k = d.indexOf(":"); out[d.slice(0, k).trim()] = d.slice(k + 1).trim(); });
    return out;
  }
  /* prefixes: "gray" | ["bg-","text-"] → ":root{ --gray-0:...; }" 텍스트 */
  function tokenBlock(prefixes, css) {
    const ps = [].concat(prefixes);
    const hit = k => ps.some(p => p instanceof RegExp ? p.test(k) : (k === "--" + p || k.startsWith("--" + p.replace(/-$/, "") + "-")));
    const vars = parseVars(rootBlock(css, ":root"));
    const lines = Object.entries(vars).filter(([k]) => hit(k)).map(([k, v]) => `  ${k}: ${v};`);
    return ":root {\n" + lines.join("\n") + "\n}";
  }

  /* ---------- HTML → JSX ---------- */
  const ATTR_MAP = { class: "className", for: "htmlFor", tabindex: "tabIndex", readonly: "readOnly", maxlength: "maxLength", minlength: "minLength", colspan: "colSpan", rowspan: "rowSpan", autocomplete: "autoComplete", autofocus: "autoFocus", novalidate: "noValidate", enctype: "encType", srcset: "srcSet", crossorigin: "crossOrigin", datetime: "dateTime", checked: "defaultChecked", value: "defaultValue", viewbox: "viewBox" };
  const VOID = /^(input|br|hr|img|path|circle|rect|line|polyline|polygon|use|ellipse|meta|link|source|col|area|base|embed|track|wbr)$/i;
  function styleToObj(s) {
    const parts = s.split(";").map(x => x.trim()).filter(Boolean).map(x => {
      const i = x.indexOf(":"); let k = x.slice(0, i).trim(); const v = x.slice(i + 1).trim();
      k = k.startsWith("--") ? JSON.stringify(k) : k.replace(/-([a-z])/g, (m, c) => c.toUpperCase());
      return `${k}: ${JSON.stringify(v)}`;
    });
    return "{{ " + parts.join(", ") + " }}";
  }
  function convertTag(m, tag, attrs, slash) {
    const a = attrs.replace(/\s([a-zA-Z_:][\w:.-]*)(?:=("[^"]*"|'[^']*'|[^\s"'>]+))?/g, (mm, name, val) => {
      let n = name.toLowerCase() === name ? name : name; // 대소문자 유지
      if (n === "style" && val) return ` style=${styleToObj(val.replace(/^["']|["']$/g, ""))}`;
      if (n === "selected") return ""; // <option selected> → defaultValue 로 대체(샘플에서는 사용 안 함)
      if (ATTR_MAP[n.toLowerCase()]) n = ATTR_MAP[n.toLowerCase()];
      else if (n.includes(":")) n = n.replace(/:([a-z])/g, (x, c) => c.toUpperCase());
      else if (!/^(aria-|data-)/.test(n) && n.includes("-")) n = n.replace(/-([a-z])/g, (x, c) => c.toUpperCase());
      if (val === undefined) return ` ${n}`;
      if (val[0] !== '"' && val[0] !== "'") val = `"${val}"`;
      return ` ${n}=${val}`;
    });
    const close = (slash || VOID.test(tag)) ? " /" : "";
    return `<${tag}${a}${close}>`;
  }
  function topLevelCount(html) {
    let depth = 0, count = 0; const re = /<(\/?)([a-zA-Z][\w-]*)[^>]*?(\/?)>/g; let m;
    while ((m = re.exec(html))) {
      if (m[1]) { depth--; continue; }
      if (depth === 0) count++;
      if (!m[3] && !VOID.test(m[2])) depth++;
    }
    return count;
  }
  /* html 샘플을 `export function Example()` TSX 로. 규칙: class→className, for→htmlFor, checked→defaultChecked,
     value→defaultValue, style 문자열→객체, void 태그 self-close, 주석→{/* *\/}, 하이픈 속성→camelCase(aria-/data- 제외) */
  function htmlToJsx(html, name) {
    const src = dedent(html);
    let out = src.replace(/<!--([\s\S]*?)-->/g, (m, c) => `{/*${c}*/}`);
    out = out.replace(/<([a-zA-Z][\w-]*)([^<>]*?)(\/?)>/g, convertTag);
    const single = topLevelCount(src) === 1;
    const body = (single ? out : "<>\n" + out + "\n</>").split("\n").map(l => "    " + l).join("\n");
    return `export function ${name || "Example"}() {\n  return (\n${body}\n  );\n}`;
  }

  /* ---------- 구문 강조 (출력은 이미 esc 처리됨) ---------- */
  const span = (cls, s) => `<span class="tk-${cls}">${esc(s)}</span>`;
  function hlTagInner(tag) {
    // tag: "<div class="a" hidden>" 또는 "</div>" 또는 "<br/>"
    const m = tag.match(/^(<\/?)([a-zA-Z][\w-]*)([\s\S]*?)(\/?>)$/); if (!m) return esc(tag);
    const attrs = m[3].replace(/([a-zA-Z_:][\w:.-]*)(=)("[^"]*"|'[^']*')|([a-zA-Z_:][\w:.-]*)/g, (mm, n, eq, v, bare) =>
      bare ? span("attr", bare) : span("attr", n) + span("punc", eq) + span("str", v));
    return span("punc", m[1]) + span("tag", m[2]) + attrs + span("punc", m[4]);
  }
  function hlHtml(code) {
    let out = "", last = 0; const re = /<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*>/g; let m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      out += m[0].startsWith("<!--") ? span("cmt", m[0]) : hlTagInner(m[0]);
      last = m.index + m[0].length;
    }
    return out + esc(code.slice(last));
  }
  function hlCss(code) {
    let out = "", last = 0; const re = /\/\*[\s\S]*?\*\/|([^{}\/]+)\{|\}|([-\w]+)(\s*:\s*)([^;{}]+)(;?)/g; let m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      if (m[0].startsWith("/*")) out += span("cmt", m[0]);
      else if (m[1] !== undefined) out += span("tag", m[1]) + span("punc", "{");
      else if (m[0] === "}") out += span("punc", "}");
      else out += span("attr", m[2]) + span("punc", m[3]) + span("str", m[4]) + span("punc", m[5]);
      last = m.index + m[0].length;
    }
    return out + esc(code.slice(last));
  }
  const KW = /^(import|export|from|default|function|return|const|let|var|if|else|true|false|null|undefined|new|type|interface|extends|as|useState|useEffect|useRef|useMemo|useCallback)$/;
  function hlTsx(code) {
    let out = "", last = 0;
    const re = /\/\/[^\n]*|\/\*[\s\S]*?\*\/|"[^"\n]*"|'[^'\n]*'|<\/?[A-Za-z][\w.-]*|\/?>|=>|\b[A-Za-z_$][\w$-]*\b/g; let m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index)); const t = m[0]; const nx = code.slice(m.index + t.length, m.index + t.length + 2);
      if (t.startsWith("//") || t.startsWith("/*")) out += span("cmt", t);
      else if (t[0] === '"' || t[0] === "'") out += span("str", t);
      else if (t[0] === "<") out += span("punc", t.slice(0, t[1] === "/" ? 2 : 1)) + span("tag", t.slice(t[1] === "/" ? 2 : 1));
      else if (t === ">" || t === "/>") out += span("punc", t);
      else if (t === "=>" || KW.test(t)) out += span("kw", t);
      else if (nx[0] === "=" && nx[1] !== "=" && nx[1] !== ">") out += span("attr", t);
      else out += esc(t);
      last = m.index + t.length;
    }
    return out + esc(code.slice(last));
  }
  function hl(code, lang) {
    try { return lang === "html" ? hlHtml(code) : lang === "css" ? hlCss(code) : lang === "tsx" ? hlTsx(code) : esc(code); }
    catch (e) { return esc(code); }
  }

  /* ---------- 사이트 구조 ---------- */
  function allPages(SITE, sec) {
    const d = SITE[sec]; const out = [];
    for (const [k, t] of Object.entries(d.pages || {})) out.push({ key: k, title: t });
    for (const [g, list] of (d.groups || [])) for (const [k, t] of list) out.push({ key: k, title: t, group: g });
    return out;
  }

  const api = { esc, dedent, cssFor, tokenBlock, parseVars, rootBlock, htmlToJsx, hl, allPages, SAMPLES_START, SAMPLES_END };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.LIB = api;
})(typeof window !== "undefined" ? window : globalThis);
