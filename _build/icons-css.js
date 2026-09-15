// 폼 컨트롤·크롬 글리프를 assets/icons 의 SVG(data URI mask)로 style.src.css 에 삽입한다.
//   실행: node icons-css.js  → style.src.css 의 해당 규칙을 교체(build.js 가 시작 시 자동 호출)
//   mask 는 알파만 쓰므로 색은 background(currentColor·토큰)로 지정한다. 아이콘을 바꾸려면 아래 RULES 만 수정.
const fs = require("fs"); const path = require("path");
const ROOT = path.resolve(__dirname, ".."); const CSS = path.join(__dirname, "style.src.css");

function dataUri(name, style = "outline", opt = {}) {
  const f = path.join(ROOT, "assets", "icons", style, name + ".svg");
  if (!fs.existsSync(f)) throw new Error("아이콘 없음: " + style + "/" + name);
  const svg = fs.readFileSync(f, "utf8").replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").replace(/>\s+</g, "><").replace(/currentColor/g, "black").trim().replace(/stroke-width="[\d.]+"/, opt.strokeWidth ? `stroke-width="${opt.strokeWidth}"` : "$&");
  return "data:image/svg+xml," + encodeURIComponent(svg).replace(/%20/g, " ").replace(/%3D/g, "=").replace(/%3A/g, ":").replace(/%2F/g, "/").replace(/%2C/g, ",");
}
const mask = (name, style, opt = {}) => { const u = `url("${dataUri(name, style, opt)}") center/${opt.size || "contain"} no-repeat`; return `-webkit-mask:${u};mask:${u}`; };

/* [셀렉터(정확히 일치), 새 선언부, (없으면 이 셀렉터 규칙 뒤에 삽입)]. 아이콘: check(굵게) · minus · point(라디오 점) · circle(스위치 손잡이) · chevron-down · slash · arrows-sort · arrow-up · arrow-down */
const RULES = [
  [".checkbox input:checked::after", `content:"";width:16px;height:16px;background:var(--accent-on);${mask("check", "outline", { strokeWidth: 3.5 })}`],
  [".radio input:checked", "border-color:var(--accent);background:var(--accent)"],
  [".radio input:checked::after", `content:"";width:20px;height:20px;background:var(--accent-on);${mask("point", "filled", { size: "120%" })}`, ".radio input:checked"],
  [".switch input::after", `content:"";position:absolute;top:2px;left:2px;width:20px;height:20px;background:#fff;${mask("circle", "filled", { size: "120%" })};transition:left var(--motion-fast)`],
  [".switch input:checked::after", "left:22px"],
  [".switch.sm input::after", "width:16px;height:16px"],
  [".switch.sm input:checked::after", "left:18px"],
  [".checkbox input:indeterminate::after,.checkbox input.mixed::after", `content:"";width:16px;height:16px;background:var(--accent-on);${mask("minus", "outline", { strokeWidth: 3.5 })}`],
  [".chip.on::before", `content:"";width:14px;height:14px;flex:none;background:currentColor;${mask("check")}`],
  [".dropdown .trigger::after", `content:"";width:16px;height:16px;flex:none;background:var(--text-secondary);${mask("chevron-down")};transition:transform var(--motion-fast)`],
  [".dropdown.open .trigger::after", "transform:rotate(180deg)"],
  [".accordion summary::after", `content:"";width:16px;height:16px;flex:none;background:var(--text-secondary);${mask("chevron-down")};transition:transform var(--motion-fast)`],
  [".accordion[open] summary::after", "transform:rotate(180deg)"],
  [".breadcrumb li+li::before", `content:"";width:12px;height:12px;flex:none;background:var(--text-disabled);${mask("slash")}`],
  [".tbl th.sortable::after", `content:"";display:inline-block;width:14px;height:14px;margin-left:6px;vertical-align:-3px;opacity:.45;background:currentColor;${mask("arrows-sort")}`],
  [".tbl th.sorted::after", `opacity:1;${mask("arrow-up")}`],
  [".tbl th.sorted.desc::after", mask("arrow-down")],
];

function apply() {
  let css = fs.readFileSync(CSS, "utf8"); let n = 0;
  for (const [sel, body, after] of RULES) {
    const next = sel + "{" + body + "}";
    let i = css.indexOf("\n" + sel + "{");
    if (i < 0) {
      if (!after) throw new Error("규칙 없음: " + sel);
      const k = css.indexOf("\n" + after + "{"); if (k < 0) throw new Error("삽입 기준 규칙 없음: " + after);
      const e = css.indexOf("}", k) + 1; css = css.slice(0, e) + "\n" + next + css.slice(e); n++; continue;
    }
    const j = css.indexOf("}", i);
    if (css.slice(i + 1, j + 1) !== next) { css = css.slice(0, i + 1) + next + css.slice(j + 1); n++; }
  }
  const marker = "/* 글리프(체크·마이너스·라디오 점·스위치 손잡이·셰브론·슬래시·정렬 화살표)는 icons-css.js 가 assets/icons 의 SVG 를 data URI mask 로 삽입. 직접 수정 금지 */";
  if (!css.includes(marker)) css = css.replace("/* ---------- Live component samples ---------- */", "/* ---------- Live component samples ---------- */\n" + marker);
  fs.writeFileSync(CSS, css); return n;
}
if (require.main === module) console.log("icons-css: 규칙 " + apply() + "개 갱신");
module.exports = { apply, dataUri };
