/* =========================================================
   gen.js — DocuONE 컨셉 화면을 JS Design System 으로 다시 지은 시안 한 장
   node _demo/docuone/gen.js  →  index.html
   원본: 02 제품별/다큐원/리뉴얼/2.0v/DocuONE Concept/index.html (Bootstrap + CoreUI 아이콘 — 읽기만 함)
   컨셉의 3칸 구조(사이드바 · 본문 · Info 패널)와 영문 글은 그대로 두고(사람의 결정), 칸 안을 시스템 컴포넌트로 바꾼다.
   컴포넌트 모양 · 동작은 ../../assets/style.css · ds.js, 아이콘은 시스템 아이콘(_build/icons.js 의 I()).
   제품 색 = 기본 파랑(data-accent 없음 — 컨셉의 #3f86f7 에 가장 가까운 팔레트 색). app.js 는 싣지 않는다.
   ========================================================= */
const fs = require("fs");
const path = require("path");
const { I } = require("../../_build/icons.js");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const tip = (label, btn, side = "bottom") => `<span class="tooltip-wrap">${btn}<span class="tooltip ${side}" role="tooltip">${label}</span></span>`;
const kbdMod = (k, sm) => `<span class="kbd-combo"><kbd class="kbd${sm ? " sm" : ""}" data-kbd-mod>Ctrl</kbd><kbd class="kbd${sm ? " sm" : ""}">${k}</kbd></span>`;
const iconBtn = (label, icon, extra = "", size = "md") => `<button type="button" class="btn ${size} assistive icon-only" aria-label="${label}"${extra}>${I(icon, size === "sm" ? 16 : 20)}</button>`;

/* 폴더 — 컨셉 카드의 값 그대로. paper 는 고른 카드의 종이에 적힌 글 */
const FOLDERS = [
  { id: "ux", kind: "notes", name: "UX research", notes: 233, size: "116.9 MB", created: "02/14/2024", modified: "05/28/2024" },
  { id: "raw", kind: "data", name: "Raw data", notes: 39, size: "180.2 MB", created: "12/03/2024", modified: "06/12/2024", paper: "The team can add rich text texts and work together" },
  { id: "processed", kind: "data", name: "Processed data", notes: 21, size: "23.4 MB", created: "01/09/2024", modified: "04/02/2024" },
  { id: "reports", kind: "reports", name: "Reports", notes: 17, size: "490 MB", created: "11/21/2023", modified: "06/03/2024" },
  { id: "dataviz", kind: "reports", name: "Data visualization", notes: 96, size: "1.3 GB", created: "03/18/2024", modified: "06/10/2024" },
  { id: "ideas", kind: "notes", name: "Ideas and Insights", notes: 103, size: "126.3 MB", created: "08/30/2023", modified: "05/17/2024" },
];
const SELECTED = "raw";

/* ---------- 사이드바 ---------- */
function sidenav() {
  const link = (icon, label, { on = false, count = "", href = "#" } = {}) => tip(label, `<a href="${href}"${on ? ' class="has-on"' : ""} aria-label="${label}">${I(icon, 20)}<span>${label}</span>${count ? `<span class="count">${count}</span>` : ""}</a>`, "right");
  const sub = (label, on) => `<a href="#" class="sub${on ? " on" : ""}"${on ? ' aria-current="page"' : ""}>${label}</a>`;
  return `  <nav class="sidenav docu-nav" id="docu-nav" aria-label="Main menu">
    <div class="docu-brand"><a href="#" class="docu-logo" aria-label="DocuONE home"><span aria-hidden="true">DocuONE</span></a>${tip("Collapse menu", `<button type="button" class="btn md assistive icon-only" data-sidenav-toggle aria-controls="docu-nav" aria-expanded="true" aria-label="Collapse menu">${I("layout-sidebar", 20)}</button>`, "right")}</div>
    ${link("home", "Home")}
    ${link("folder", "Projects", { on: true })}
    ${sub("Segment")}
    ${sub("CodeAI")}
    ${sub("DocuONE", true)}
    ${link("file-text", "Notes")}
    ${link("chart-bar", "Reports")}
    ${link("mail", "Emails")}
    ${link("bolt", "Automation")}
    <div class="docu-nav-end">
      ${link("settings", "Settings")}
      ${link("bell", "Notifications", { count: "10" })}
      <div class="docu-user"><span class="avatar" data-name="Sophia Lane" aria-hidden="true">SL</span><span class="docu-user-name">Sophia Lane</span>${tip("Log out", iconBtn("Log out", "logout", "", "sm"), "top")}</div>
    </div>
  </nav>`;
}

/* ---------- 본문 ---------- */
function folderArt(f) {
  return `<span class="docu-folder" aria-hidden="true"><span class="back"><span class="tab"></span></span><span class="paper">${f.paper ? `<span class="paper-text">${esc(f.paper)}</span>` : ""}</span><span class="front"></span></span>`;
}
function card(f) {
  const on = f.id === SELECTED;
  return `        <button type="button" class="card clickable docu-card${on ? " on" : ""}" aria-pressed="${on}" data-folder="${f.id}" data-kind="${f.kind}">${folderArt(f)}<span class="docu-card-text"><h3 class="title">${esc(f.name)}</h3><span class="desc">${f.notes} notes</span><span class="docu-size">${f.size}</span></span></button>`;
}
function main() {
  const more = `<div class="dropdown"><button type="button" class="btn md assistive icon-only" aria-label="More project actions" aria-haspopup="menu" aria-expanded="false">${I("dots", 20)}</button><ul class="menu" role="menu"><li class="menu-item" role="menuitem">${I("pencil", 16)}Rename</li><li class="menu-item" role="menuitem">${I("copy", 16)}Duplicate</li><li class="menu-item" role="menuitem">${I("archive", 16)}Archive</li><li class="menu-sep" role="separator"></li><li class="menu-item danger" role="menuitem">${I("trash", 16)}Delete</li></ul></div>`;
  const filter = `<div class="dropdown docu-filter"><button type="button" class="btn md outline assistive" aria-haspopup="menu" aria-expanded="false">${I("filter", 20)}<span class="docu-filter-label">Filter</span></button><ul class="menu" role="menu"><li role="none" class="menu-group"><span class="menu-label" id="docu-filter-g">Show</span><ul role="group" aria-labelledby="docu-filter-g" data-name="kind"><li class="menu-item" role="menuitemradio" aria-checked="true" data-value="all"><span class="menu-mark round" aria-hidden="true"></span>All folders</li><li class="menu-item" role="menuitemradio" aria-checked="false" data-value="notes"><span class="menu-mark round" aria-hidden="true"></span>Notes</li><li class="menu-item" role="menuitemradio" aria-checked="false" data-value="data"><span class="menu-mark round" aria-hidden="true"></span>Data</li><li class="menu-item" role="menuitemradio" aria-checked="false" data-value="reports"><span class="menu-mark round" aria-hidden="true"></span>Reports</li></ul></li></ul></div>`;
  return `  <main id="main" class="docu-main" tabindex="-1">
    <div class="docu-top">
      <div class="docu-top-start">
        ${tip("Back", iconBtn("Back", "arrow-left"))}
        <span class="divider vertical" role="separator" aria-orientation="vertical"></span>
        <nav aria-label="Location"><ol class="breadcrumb"><li><a href="#" class="icon" aria-label="Home">${I("home")}</a></li><li><a href="#">Projects</a></li><li aria-current="page"><span>DocuONE</span></li></ol></nav>
      </div>
      <div class="btn-group">
        <button type="button" class="btn md text assistive">${I("settings", 20)}Manage</button>
        <button type="button" class="btn md text assistive">${I("share", 20)}Share</button>
        <button type="button" class="btn md text assistive" data-popup-open="#docu-cmdk" aria-keyshortcuts="Control+K Meta+K">${I("search", 20)}Jump to<span class="kbd-combo menu-kbd" aria-hidden="true"><kbd class="kbd sm" data-kbd-mod>Ctrl</kbd><kbd class="kbd sm">K</kbd></span></button>
        ${more}
        <span class="divider vertical" role="separator" aria-orientation="vertical"></span>
        ${tip("Dark mode", `<button type="button" class="btn md assistive icon-only" data-theme-toggle aria-pressed="false" aria-label="Dark mode"><span class="i-light">${I("sun-high", 20)}</span><span class="i-dark">${I("moon", 20)}</span></button>`)}
      </div>
    </div>
    <div class="page-head"><div><h1 class="title">DocuONE</h1></div><div class="actions"><button type="button" class="btn md solid primary">${I("plus", 20)}New draft</button></div></div>
    <div class="toolbar docu-toolbar">
      <div class="searchbar" role="search" data-hotkey data-debounce="200">${I("search", 18)}<input type="search" placeholder="Search folders" aria-label="Search folders"><button type="button" class="clear" aria-label="Clear search" hidden>${I("x", 12)}</button><kbd class="kbd">/</kbd></div>
      ${filter}
    </div>
    <div class="docu-grid" role="group" aria-label="Folders">
${FOLDERS.map(card).join("\n")}
    </div>
    <div class="empty docu-empty" hidden><span class="ico">${I("search")}</span><b class="docu-empty-title">No folders match</b><span>Try a shorter word, or show all folders.</span><button type="button" class="btn md outline assistive" data-docu-reset>Clear filters</button></div>
  </main>`;
}

/* ---------- Info 패널 ---------- */
function info() {
  const f = FOLDERS.find((x) => x.id === SELECTED);
  const stat = (id, label, value, pct, valuetext) => `      <div class="card sm docu-stat">
        <div class="card-head"><span class="docu-stat-label" id="docu-${id}">${label}</span><div class="dropdown"><button type="button" class="btn sm assistive icon-only" aria-label="${label} options" aria-haspopup="menu" aria-expanded="false">${I("dots-vertical", 16)}</button><ul class="menu" role="menu"><li class="menu-item" role="menuitem">Open ${label.toLowerCase()}</li><li class="menu-item" role="menuitem">Clean up</li><li class="menu-item" role="menuitem">Export list</li></ul></div></div>
        <span class="docu-stat-value">${value}</span>
        <div class="progress-list"><div class="progress" role="meter" aria-labelledby="docu-${id}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-valuetext="${valuetext}"><i style="width:${pct}%"></i></div></div>
      </div>`;
  const tag = (cls, label) => `<span class="tag outline dot ${cls}">${label}</span>`;
  return `  <aside class="docu-info" id="docu-info" aria-labelledby="docu-info-t">
    <div class="docu-info-head"><h2 id="docu-info-t" class="docu-info-title">Info</h2>${tip("Collapse info", `<button type="button" class="btn md assistive icon-only docu-info-toggle" aria-controls="docu-info-body" aria-expanded="true" aria-label="Collapse info">${I("chevrons-right", 20)}</button>`, "left")}</div>
    <div class="docu-info-body" id="docu-info-body">
${stat("docs", "Documents", "48.5 GB", 68, "48.5 GB, 68% of storage")}
${stat("images", "Images", "182.4 MB", 26, "182.4 MB, 26% of storage")}
      <section class="docu-sec" aria-labelledby="docu-props-t"><h3 class="docu-sec-title" id="docu-props-t">Properties</h3>
        <table class="tbl kv docu-props"><tbody><tr><th scope="row">Folder</th><td data-prop="name">${esc(f.name)}</td></tr><tr><th scope="row">Size</th><td data-prop="size">${f.size}</td></tr><tr><th scope="row">Created</th><td data-prop="created">${f.created}</td></tr><tr><th scope="row">Last modification</th><td data-prop="modified">${f.modified}</td></tr></tbody></table>
      </section>
      <section class="docu-sec" aria-labelledby="docu-tags-t"><h3 class="docu-sec-title" id="docu-tags-t">Tags</h3>
        <div class="docu-tags">${tag("accent", "Sales")}${tag("", "Marketing")}${tag("pending", "Analytics")}</div>
      </section>
      <ul class="list hover docu-links">
        <li tabindex="0">${I("pin", 20)}<div><span class="primary">Pinned items</span></div><span class="end">${I("chevron-right", 16)}</span></li>
        <li tabindex="0">${I("history", 20)}<div><span class="primary">Activity</span></div><span class="end">${I("chevron-right", 16)}</span></li>
      </ul>
    </div>
  </aside>`;
}

/* ---------- 대화상자 — 명령 팔레트(⌘K · Ctrl+K) · 단축키 도움말(?) ---------- */
function dialogs() {
  const groups = [
    ["Folders", FOLDERS.map((f) => ["folder", f.name, `${f.kind} folder`, `folder:${f.id}`])],
    ["Actions", [["plus", "New draft", "create add note", "new-draft"], ["share", "Share project", "invite link", "share"], ["layout-sidebar-right", "Toggle info panel", "details properties", "toggle-info"], ["search", "Search folders", "find", "focus-search", "/"], ["help-circle", "Show shortcuts", "help keyboard", "show-shortcuts", "?"]]],
  ];
  let n = 0, first = "";
  const body = groups.map(([label, items], gi) => `<div class="cmdk-group" role="group" aria-labelledby="docu-cmdk-g${gi}"><div class="cmdk-label" id="docu-cmdk-g${gi}">${label}</div>${items.map(([icon, name, kw, value, key]) => {
    const oid = `docu-cmdk-o${++n}`, on = !first; if (on) first = oid;
    return `<div class="cmdk-item" id="${oid}" role="option" aria-selected="${on}" data-value="${value}" data-keywords="${esc(kw)}">${I(icon)}<span class="cmdk-name">${esc(name)}</span>${key ? `<span class="kbd-combo menu-kbd" aria-hidden="true"><kbd class="kbd sm">${key}</kbd></span>` : ""}</div>`;
  }).join("")}</div>`).join("");
  return `<div class="docu-dialogs" hidden>
  <div class="popup cmdk" id="docu-cmdk" role="dialog" aria-modal="true" aria-labelledby="docu-cmdk-t" data-hotkey data-confirm-discard="false">
    <h3 class="sr-only" id="docu-cmdk-t">Command palette</h3>
    <div class="cmdk-search">${I("search")}<input type="text" role="combobox" aria-expanded="true" aria-controls="docu-cmdk-list" aria-autocomplete="list" aria-activedescendant="${first}" placeholder="Search folders and commands" aria-label="Search commands" autocomplete="off" spellcheck="false"></div>
    <div class="cmdk-list" id="docu-cmdk-list" role="listbox" aria-label="Commands" tabindex="-1">${body}</div>
    <p class="cmdk-empty" hidden>No matching commands. Try another word.</p>
    <div class="cmdk-foot" aria-hidden="true"><span><kbd class="kbd sm">↑</kbd><kbd class="kbd sm">↓</kbd>Move</span><span><kbd class="kbd sm">Enter</kbd>Run</span><span><kbd class="kbd sm">Esc</kbd>Close</span></div>
    <span class="sr-only" role="status"></span>
  </div>
  <div class="popup" id="docu-help" role="dialog" aria-modal="true" aria-labelledby="docu-help-t" data-hotkey-help>
    <h3 class="popup-title" id="docu-help-t">Keyboard shortcuts</h3><button type="button" class="btn sm text assistive icon-only popup-close" aria-label="Close" data-popup-close>${I("x")}</button>
    <table class="tbl kv"><tbody>
      <tr><th scope="row">Open command palette</th><td>${kbdMod("K")}</td></tr>
      <tr><th scope="row">Search folders</th><td><span class="kbd-combo"><kbd class="kbd">/</kbd></span></td></tr>
      <tr><th scope="row">Show shortcuts</th><td><span class="kbd-combo"><kbd class="kbd">?</kbd></span></td></tr>
      <tr><th scope="row">Close</th><td><span class="kbd-combo"><kbd class="kbd">Esc</kbd></span></td></tr>
    </tbody></table>
  </div>
</div>`;
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DocuONE · JS Design System</title>
<script>try{var t=localStorage.getItem("docu-theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>
<link rel="stylesheet" href="../../assets/style.css">
<link rel="stylesheet" href="demo.css">
<script src="../../assets/ds.js" defer></script>
<script src="demo.js" defer></script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<div class="docu-app">
${sidenav()}
${main()}
${info()}
</div>
${dialogs()}
<script type="application/json" id="docu-folders">${JSON.stringify(FOLDERS.map(({ id, kind, name, size, created, modified }) => ({ id, kind, name, size, created, modified })))}</script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, "index.html"), html);
console.log("wrote index.html");
