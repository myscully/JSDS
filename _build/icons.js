/* =========================================================
   icons.js — 사이트에서 쓰는 아이콘 (assets/icons/{outline|filled}/*.svg, Tabler Icons · MIT)
   - ICON_NAMES: 관리자 콘솔에서 자주 쓰는 아이콘을 추린 목록 (Foundations › Icons 갤러리 · React <Icon> 이 이 목록으로 구성)
   - 원본 세트는 assets/icons 에 5,130개가 그대로 있다. 여기에 이름을 더하면 갤러리와 React 양쪽에 함께 나타난다
   - node: require("./icons.js") → { ICONS, I, generate }   /  브라우저: generate() 가 만든 icons.gen.js 가 전역 ICONS · I 정의
   - I(name, size=18, {style:"outline"|"filled", label}) → 인라인 <svg> 문자열 (currentColor)
   ========================================================= */
const fs = require("fs"); const path = require("path");
const DIR = path.resolve(__dirname, "..", "assets", "icons");
const ICON_NAMES = [
  // 액션
  "search", "plus", "minus", "x", "check", "download", "upload", "trash", "pencil", "edit", "copy", "refresh", "reload", "filter", "filter-off", "dots",
  "dots-vertical", "external-link", "link", "unlink", "share", "printer", "eye", "eye-off", "star", "heart", "bookmark", "pin", "pinned", "flag",
  "archive", "restore", "send", "history",
  // 탐색 · 화살표
  "chevron-left", "chevron-right", "chevron-up", "chevron-down", "chevrons-left", "chevrons-right", "arrow-left", "arrow-right", "arrow-up",
  "arrow-down", "arrow-narrow-left", "arrow-narrow-right", "arrow-up-right", "arrow-down-right", "arrow-back-up", "arrow-forward-up", "arrows-sort",
  "sort-ascending", "sort-descending", "arrows-maximize", "arrows-minimize", "maximize", "minimize", "switch-horizontal",
  // 상태 · 피드백
  "info-circle", "info-square", "alert-triangle", "alert-circle", "alert-octagon", "circle-check", "circle-x", "circle-minus", "circle-plus",
  "help-circle", "exclamation-circle", "ban", "forbid", "progress", "hourglass", "loader-2", "rotate", "repeat",
  // 사용자 · 권한
  "user", "user-plus", "user-minus", "user-check", "user-x", "user-circle", "user-cog", "user-shield", "user-edit", "user-off", "users", "users-group",
  "id", "id-badge",
  // 보안
  "shield", "shield-check", "shield-lock", "shield-off", "shield-x", "shield-half", "lock", "lock-open", "key", "fingerprint", "scan", "face-id",
  "password", "bug", "bug-off", "certificate",
  // 파일 · 문서
  "file", "file-text", "file-plus", "file-minus", "file-check", "file-x", "file-search", "file-export", "file-import", "file-code", "file-description",
  "file-zip", "files", "folder", "folder-open", "folder-plus", "folder-off", "clipboard", "clipboard-list", "clipboard-check", "report", "paperclip",
  // 데이터 · 목록
  "database", "database-export", "database-import", "database-off", "table", "table-plus", "table-export", "columns", "list", "list-check",
  "list-details", "list-numbers", "checkbox", "stack", "box", "package",
  // 서버 · 네트워크
  "server", "server-2", "server-off", "server-cog", "cloud", "cloud-upload", "cloud-download", "cloud-off", "network", "wifi", "wifi-off", "world",
  "globe", "router", "antenna", "plug", "plug-connected", "plug-off", "sitemap", "route",
  // 장치
  "device-desktop", "device-laptop", "device-mobile", "device-tablet", "device-tv", "devices", "cpu", "disc", "usb", "bluetooth", "battery",
  "battery-charging", "power", "mouse",
  // 차트 · 분석
  "chart-bar", "chart-line", "chart-pie", "chart-area", "chart-donut", "chart-dots", "chart-histogram", "chart-infographic", "presentation",
  "presentation-analytics", "trending-up", "trending-down", "gauge", "activity",
  // 시간 · 일정
  "calendar", "calendar-event", "calendar-time", "calendar-stats", "calendar-off", "clock", "clock-hour-4", "alarm", "timeline", "stopwatch",
  "hourglass-high", "history-toggle",
  // 알림 · 커뮤니케이션
  "bell", "bell-off", "bell-ringing", "mail", "mail-opened", "mail-forward", "message", "message-2", "message-circle", "messages", "phone",
  "phone-call", "headset", "speakerphone", "rss", "broadcast",
  // 레이아웃 · 설정
  "layout", "layout-grid", "layout-list", "layout-sidebar", "layout-sidebar-right", "layout-columns", "layout-rows", "layout-dashboard", "layout-board",
  "menu-2", "adjustments", "adjustments-horizontal", "settings", "settings-2", "tool", "tools", "dashboard", "inbox",
  // 텍스트 · 코드
  "typography", "text-size", "bold", "italic", "align-left", "align-center", "align-right", "code", "code-dots", "braces", "brackets", "terminal",
  "terminal-2", "json",
  // 지도 · 장소
  "map", "map-pin", "map-2", "location", "gps", "current-location", "building", "home", "compass", "road",
  // 미디어
  "player-play", "player-pause", "player-stop", "player-skip-back", "player-skip-forward", "volume", "volume-off", "microphone", "microphone-off",
  "camera", "video", "photo", "movie", "screen-share",
  // 개발
  "git-branch", "git-commit", "git-merge", "git-pull-request", "git-fork", "api", "webhook", "bolt", "variable", "function",
  // 도형 · 표시
  "circle", "square", "triangle", "hexagon", "point", "asterisk", "at", "tag", "tags", "bookmarks", "palette", "color-swatch", "contrast", "droplet",
  // 사이트 크롬 · 기타
  "sun-high", "moon", "device-floppy", "logout", "login", "door-exit", "zoom-in", "zoom-out", "lifebuoy", "qrcode", "barcode", "news",
];
function parse(file) {
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const meta = {}; const cm = raw.match(/<!--([\s\S]*?)-->/);
  if (cm) { const c = cm[1].match(/category:\s*(.+)/); const t = cm[1].match(/tags:\s*\[([^\]]*)\]/); if (c) meta.category = c[1].trim(); if (t) meta.tags = t[1].split(",").map(s => s.trim()).filter(Boolean); }
  const inner = raw.replace(/<!--[\s\S]*?-->/g, "").replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>[\s\S]*$/, "").replace(/\s*\n\s*/g, "").replace(/\s{2,}/g, " ").replace(/" \/>/g, '"/>').trim();
  return { paths: inner, ...meta };
}
const ICONS = {};
for (const n of ICON_NAMES) {
  const o = parse(path.join(DIR, "outline", n + ".svg")); const f = parse(path.join(DIR, "filled", n + ".svg"));
  if (!o) throw new Error(`icons.js: assets/icons/outline/${n}.svg 없음`);
  ICONS[n] = { o: o.paths, f: f ? f.paths : null, category: o.category || "", tags: o.tags || [] };
}
const I_SRC = `function I(name, size = 18, o = {}) {
  const ic = ICONS[name]; if (!ic) return "";
  const filled = o.style === "filled" && ic.f;
  const a = filled ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const lab = o.label ? ' role="img" aria-label="' + o.label + '"' : ' aria-hidden="true"';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="' + size + '" height="' + size + '" ' + a + lab + (o.cls ? ' class="' + o.cls + '"' : "") + ">" + (filled ? ic.f : ic.o) + "</svg>";
}`;
const I = new Function("ICONS", I_SRC + "; return I;")(ICONS);
/* 브라우저용 icons.gen.js 생성 (standalone 셸이 data 파일보다 먼저 로드) */
function generate() {
  const out = `/* 생성 파일 — 원본은 icons.js + assets/icons. 수정하지 마세요. */\nconst ICONS = ${JSON.stringify(ICONS)};\n${I_SRC}\nif (typeof module !== "undefined" && module.exports) module.exports = { ICONS, I };\n`;
  fs.writeFileSync(path.join(__dirname, "icons.gen.js"), out);
  return Object.keys(ICONS).length;
}
module.exports = { ICONS, ICON_NAMES, I, generate };
if (require.main === module) console.log("icons:", generate());
