// 시안 B1 · B2 의 패턴 화면 캡처 — 실제 패턴 예제의 첫 미리보기를 1440 라이트로 찍는다. 패턴이 바뀌면 다시 돌린다.
// node _concepts/capture.mjs   (사이트 index.html 이 있는 저장소 루트를 file:// 로 연다 — 서버 필요 없음)
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(here, "../_build/package.json"));
const { chromium } = require("playwright");
const PAGES = ["dashboard", "log-viewer", "policy-settings", "incident", "alert-rules", "audit-log", "roles", "secrets", "system-status", "search"];
const out = path.join(here, "img");
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1.5, reducedMotion: "reduce" });
await ctx.addInitScript(() => { localStorage.setItem("jsds-theme", "light"); localStorage.removeItem("jsds-accent"); });
const p = await ctx.newPage();
for (const name of PAGES) {
  await p.goto(pathToFileURL(path.join(here, "..", "patterns", name + ".html")).href);
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(600);
  const el = p.locator(".example-preview").first();
  // 미리보기 안 문서 셸의 그림자 · 테두리 없이 내용만 — 패딩은 그대로
  await el.evaluate((e) => { e.style.border = "0"; e.style.borderRadius = "0"; e.style.maxHeight = "760px"; e.style.overflow = "hidden"; });
  await el.screenshot({ path: path.join(out, name + ".png") });
  console.log("img/" + name + ".png");
}
await b.close();
