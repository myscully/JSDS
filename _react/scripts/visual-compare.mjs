// 데모(React) 와 사이트(HTML) 예제를 라이트/다크로 스크린샷하여 .visual/ 에 나란히 저장
//   사전: npm run demo:build (demo/dist) 와 사이트 빌드(cd ../_build && node build.js)
//   실행: node scripts/visual-compare.mjs [filter]
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..");
const SITE = path.resolve(ROOT, "..");
const { chromium } = require(path.resolve(SITE, "_build", "node_modules", "playwright"));
const filter = process.argv[2] || "";
const OUT = path.join(ROOT, ".visual");
fs.mkdirSync(OUT, { recursive: true });

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith(".tsx") ? [path.join(d, e.name)] : []));
const keys = walk(path.join(ROOT, "examples")).map((f) => path.relative(path.join(ROOT, "examples"), f).replace(/\.tsx$/, "").split(path.sep).join("/")).filter((k) => k.includes(filter)).sort();

// demo/dist 는 ES module 이라 file:// 로는 열 수 없다 → 임시 정적 서버
import http from "node:http";
const DIST = path.join(ROOT, "demo", "dist");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png" };
const server = http.createServer((req, res) => {
  const f = path.join(DIST, decodeURIComponent(req.url.split("?")[0] === "/" ? "/index.html" : req.url.split("?")[0]));
  if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" }); res.end(fs.readFileSync(f));
});
await new Promise((r) => server.listen(0, r));
const DEMO_URL = `http://127.0.0.1:${server.address().port}/`;

const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (e) => console.error("demo page error:", e.message));
let n = 0;
for (const theme of ["light", "dark"]) {
  await page.goto(DEMO_URL); await page.waitForSelector(".demo-ex");
  await page.evaluate((t) => { document.documentElement.setAttribute("data-theme", t); }, theme);
  await page.waitForTimeout(300);
  for (const k of keys) {
    const el = page.locator(`[id="${k}"] .example-preview`);
    if (await el.count()) { await el.first().screenshot({ path: path.join(OUT, `${k.replace(/\//g, "__")}.react.${theme}.png`) }); n++; }
  }
  for (const k of keys) {
    const [sec, pg, id] = k.split("/");
    await page.goto("file://" + path.join(SITE, sec, `${pg}.html`));
    await page.evaluate((t) => { document.documentElement.setAttribute("data-theme", t); }, theme);
    const el = page.locator(`#ex-${pg}-${id} .example-preview`);
    if (await el.count()) { await el.first().screenshot({ path: path.join(OUT, `${k.replace(/\//g, "__")}.site.${theme}.png`) }); n++; }
  }
}
await b.close();
server.close();
console.log(`visual: ${n} screenshots → ${OUT}`);
