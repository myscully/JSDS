/* Code · Copy Field 동작 검사(2026-11-10). behave.js 가 부른다 */
module.exports = async function code({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const token = (name) => page.evaluate((n) => { const d = document.createElement("div"); d.style.color = `var(${n})`; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; }, name);
  const stubOk = () => page.evaluate(() => { window._copied = []; Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: (t) => { window._copied.push(t); return Promise.resolve(); } } }); });
  const stubFail = (legacy) => page.evaluate((v) => { window._legacy = []; Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new Error("denied")) } }); document.execCommand = (c) => { window._legacy.push([c, document.activeElement.value, document.activeElement.parentNode.className]); return v; }; }, legacy);
  const copied = () => page.evaluate(() => window._copied.slice());
  const live = () => page.evaluate(() => { const l = document.querySelector("body > .ds-live"); return l ? l.textContent : null; });
  const listen = (l, n) => l.evaluate((h, name) => { h._ev = h._ev || []; h.addEventListener(name, (e) => h._ev.push(e.detail)); }, n);
  const events = (l) => l.evaluate((h) => h._ev);

  /* ── Code 블록 ── */
  await go("components/code.html");
  await stubOk();
  const block = page.locator("#ex-code-block .code-view");
  ok("code: the live region exists before anything is copied", (await live()) === "");
  const pre = block.locator("pre");
  ok("code: the block is monospaced and named by its title", (await pre.getAttribute("aria-label")) === "에이전트 설치" && (await pre.evaluate((p) => getComputedStyle(p).fontFamily)).includes("monospace"));
  ok("code: the block keeps the site's dark code look out", (await pre.evaluate((p) => getComputedStyle(p).backgroundColor)) === "rgba(0, 0, 0, 0)" && (await pre.evaluate((p) => getComputedStyle(p).color)) === (await token("--foreground-neutral-primary")));
  ok("code: the block has no syntax colouring", (await pre.locator("span").count()) === 0);
  const btn = block.locator(".copy");
  await listen(block, "ds:copy");
  await btn.scrollIntoViewIfNeeded();
  const w0 = (await btn.boundingBox()).width;
  const icon0 = await btn.locator(".ico").innerHTML();
  await btn.click(); await wait(120);
  const text = await pre.textContent();
  ok("code: copy takes the whole text with its line breaks", (await copied())[0] === text && text.split("\n").length === 3, JSON.stringify(await copied()));
  ok("code: copy shows the result on the button", (await btn.locator(".t").textContent()) === "복사됨" && (await btn.evaluate((b) => b.classList.contains("copy-done"))));
  ok("code: the result does not change the button width", Math.abs((await btn.boundingBox()).width - w0) < 0.5);
  ok("code: the done icon is the positive colour", (await btn.locator(".ico").evaluate((e) => getComputedStyle(e).color)) === (await token("--foreground-positive-primary")));
  ok("code: the result is announced", (await live()) === "복사했습니다.");
  ok("code: the focus stays on the button", await btn.evaluate((b) => document.activeElement === b));
  ok("code: copy fires ds:copy without the value", JSON.stringify(await events(block)) === '[{"ok":true}]', JSON.stringify(await events(block)));
  await wait(2100);
  ok("code: the button goes back after two seconds", (await btn.locator(".t").textContent()) === "복사" && (await btn.locator(".ico").innerHTML()) === icon0 && !(await btn.evaluate((b) => b.classList.contains("copy-done"))));
  /* 다시 눌러도 타이머가 처음부터 */
  await btn.click(); await wait(1500); await btn.click(); await wait(1000);
  ok("code: copying again restarts the two seconds", (await btn.locator(".t").textContent()) === "복사됨");
  await wait(1200);

  /* 넘침 */
  const wrap = page.locator("#ex-code-block .code-view");
  const over = await wrap.evaluate((v) => { const p = v.querySelector("pre"), c = p.querySelector("code"); c.textContent = "x".repeat(600); return { sw: p.scrollWidth, cw: p.clientWidth, vw: v.getBoundingClientRect().width, pw: v.parentElement.getBoundingClientRect().width }; });
  ok("code: a long line scrolls inside and does not widen the frame", over.sw > over.cw && over.vw <= over.pw, JSON.stringify(over));
  /* 카드처럼 감싼 칸 안 — 긴 줄이 그리드 열을 넓히지 않는다 */
  const gridW = await wrap.evaluate((v) => { const g = document.createElement("div"); g.style.cssText = "display:grid;grid-template-columns:1fr 1fr;width:600px"; const a = document.createElement("div"), b = document.createElement("div"); g.append(a, b); v.parentElement.append(g); a.append(v); const w = a.getBoundingClientRect().width; v.parentElement.parentElement.parentElement.append(v); g.remove(); return w; });
  ok("code: a long line does not widen a grid column around the block", gridW === 300, String(gridW));
  const wrapped = page.locator("#ex-code-wrap .code-view pre");
  const wr = await wrapped.evaluate((p) => ({ sw: p.scrollWidth, cw: p.clientWidth, h: p.getBoundingClientRect().height }));
  ok("code: .wrap breaks long lines", wr.sw <= wr.cw && wr.h > 60, JSON.stringify(wr));
  const tall = page.locator("#ex-code-height .code-view pre");
  ok("code: max height scrolls inside", await tall.evaluate((p) => p.getBoundingClientRect().height === 200 && p.scrollHeight > 200));
  await tall.focus(); await wait(900);
  const t0 = await tall.evaluate((p) => p.scrollTop);
  await page.keyboard.press("ArrowDown"); await page.keyboard.press("ArrowDown"); await wait(400);
  ok("code: the arrow keys scroll a focused block", (await tall.evaluate((p) => p.scrollTop)) > t0);
  await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Tab"); await wait(50);
  const outline = await tall.evaluate((p) => { const s = getComputedStyle(p); return [s.outlineStyle, s.outlineOffset, s.outlineWidth]; });
  ok("code: the focus outline sits inside the frame", outline[0] === "solid" && outline[1] === "-1px" && outline[2] === "1px", JSON.stringify(outline));
  const inl = page.locator("#ex-code-inline .code-inline").first();
  const ins = await inl.evaluate((c) => { const s = getComputedStyle(c), p = getComputedStyle(c.parentElement); return { font: s.fontFamily, bg: s.backgroundColor, size: parseFloat(s.fontSize) / parseFloat(p.fontSize) }; });
  ok("code: inline code is monospaced on the neutral chip", ins.font.includes("monospace") && Math.abs(ins.size - 0.9) < 0.01, JSON.stringify(ins));
  ok("code: inline code uses the strong neutral surface", ins.bg === (await page.evaluate(() => { const d = document.createElement("div"); d.style.backgroundColor = "var(--surface-neutral-strong)"; document.body.append(d); const c = getComputedStyle(d).backgroundColor; d.remove(); return c; })));

  /* ── Copy Field ── */
  await go("components/copy-field.html");
  await stubOk();
  const plain = page.locator("#ex-copy-field-default .copy-field");
  const inp = plain.locator("input");
  ok("copy field: the value is read-only and named by the label", (await inp.getAttribute("readonly")) !== null && (await page.getByLabel("SHA-256", { exact: true }).first().evaluate((i) => i.tagName)) === "INPUT");
  ok("copy field: the value is monospaced", (await inp.evaluate((i) => getComputedStyle(i).fontFamily)).includes("monospace"));
  ok("copy field: the frame uses the read-only surface and the input height", await plain.locator(".affix").evaluate((a) => { const d = document.createElement("div"); d.style.backgroundColor = "var(--background-neutral-secondary)"; document.body.append(d); const c = getComputedStyle(d).backgroundColor; d.remove(); return getComputedStyle(a).backgroundColor === c && a.getBoundingClientRect().height === 40; }));
  const cb = plain.locator(".copy");
  await cb.click(); await wait(120);
  ok("copy field: copy takes the value", (await copied())[0] === (await inp.inputValue()));
  ok("copy field: the copy label is not dimmed like a field suffix", await cb.evaluate((b) => { const t = getComputedStyle(b.querySelector(".t")), s = getComputedStyle(b); return t.color === s.color && t.fontSize === s.fontSize; }));
  ok("copy field: a copied button gets no focus ring from the mouse", await cb.evaluate((b) => getComputedStyle(b).outlineStyle === "none"));
  ok("copy field: a plain field has no reveal button", (await plain.locator(".reveal").count()) === 0);

  const sec = page.locator("#ex-copy-field-secret .copy-field");
  const si = sec.locator("input"), eye = sec.locator(".reveal"), full = "jsk_demo_4f7a91c2e8b3d605";
  await listen(sec, "ds:copy"); await listen(sec, "ds:reveal");
  ok("copy field: a secret is hidden by default", (await si.getAttribute("type")) === "password" && (await eye.getAttribute("aria-pressed")) === "false");
  ok("copy field: the buttons carry the value's name", (await eye.getAttribute("aria-label")) === "API 키 보기" && (await sec.locator(".copy").getAttribute("aria-label")) === "API 키 복사");
  await sec.locator(".copy").click(); await wait(120);
  ok("copy field: copying a hidden secret takes the full value", (await copied()).at(-1) === full);
  ok("copy field: copying does not reveal it", (await si.getAttribute("type")) === "password");
  ok("copy field: the event never carries the value", !JSON.stringify(await events(sec)).includes("jsk_"), JSON.stringify(await events(sec)));
  await eye.focus(); await page.keyboard.press("Enter"); await wait(30);
  ok("copy field: reveal shows the value and keeps the focus", (await si.getAttribute("type")) === "text" && (await eye.getAttribute("aria-pressed")) === "true" && (await eye.evaluate((b) => document.activeElement === b)));
  await page.keyboard.press("Enter"); await wait(30);
  ok("copy field: reveal hides it again", (await si.getAttribute("type")) === "password");
  ok("copy field: reveal fires ds:reveal both ways", JSON.stringify((await events(sec)).slice(-2)) === '[{"shown":true},{"shown":false}]', JSON.stringify(await events(sec)));
  ok("copy field: the button order is reveal then copy", await sec.locator(".affix").evaluate((a) => a.querySelector(".reveal").compareDocumentPosition(a.querySelector(".copy")) === Node.DOCUMENT_POSITION_FOLLOWING));
  ok("copy field: the copy button meets the right padding like reveal did", await sec.locator(".affix").evaluate((a) => { const r = a.getBoundingClientRect(), c = a.querySelector(".copy").getBoundingClientRect(); return Math.abs(r.right - c.right - 7) < 1; }));

  const inline = page.locator("#ex-copy-field-inline .copy-field.inline").first();
  const ib = inline.locator(".copy");
  ok("copy field: inline has an icon-only 24 button with a name", (await ib.getAttribute("aria-label")) === "에이전트 IP 복사" && (await ib.evaluate((b) => b.getBoundingClientRect().width === 24 && b.getBoundingClientRect().height === 24)));
  ok("copy field: inline text is 14 monospaced", await inline.locator(".value").evaluate((v) => { const s = getComputedStyle(v); return s.fontSize === "14px" && s.fontFamily.includes("monospace"); }));
  await ib.click(); await wait(120);
  ok("copy field: inline copies the value", (await copied()).at(-1) === "203.0.113.24");
  ok("copy field: inline swaps the icon to a check", (await ib.evaluate((b) => b.classList.contains("copy-done"))) && (await ib.locator("svg path").count()) === 1);
  const narrow = await inline.evaluate((c) => { c.style.width = "120px"; const v = c.querySelector(".value"); v.textContent = "a".repeat(80); const r = { over: c.scrollWidth - c.clientWidth, h: v.getBoundingClientRect().height }; return r; });
  ok("copy field: a long inline value wraps", narrow.over <= 0 && narrow.h > 30, JSON.stringify(narrow));

  /* ── 실패 · 폴백 ── */
  await go("components/copy-field.html");
  await stubFail(true);
  const f = page.locator("#ex-copy-field-default .copy-field"), fb = f.locator(".copy");
  await fb.focus(); await page.keyboard.press("Enter"); await wait(120);
  const lg = await page.evaluate(() => window._legacy);
  ok("copy field: a denied clipboard falls back to a temporary field", lg.length === 1 && lg[0][0] === "copy" && lg[0][1] === (await f.locator("input").inputValue()) && lg[0][2] === "affix", JSON.stringify(lg));
  ok("copy field: the fallback counts as copied and leaves no field behind", (await fb.locator(".t").textContent()) === "복사됨" && (await page.locator("textarea").count()) === 0);
  ok("copy field: the fallback returns the focus to the button", await fb.evaluate((b) => document.activeElement === b));
  await wait(2100);
  await stubFail(false);
  await listen(f, "ds:copy");
  await fb.click(); await wait(120);
  ok("copy field: a failed copy says so on the button", (await fb.locator(".t").textContent()) === "복사 실패" && (await fb.evaluate((b) => b.classList.contains("copy-failed"))));
  ok("copy field: a failed copy uses the negative icon colour", (await fb.locator(".ico").evaluate((e) => getComputedStyle(e).color)) === (await token("--foreground-negative-strong")));
  ok("copy field: a failed copy is announced with what to do", (await live()) === "복사하지 못했습니다. 값을 직접 선택해 복사하세요.");
  ok("copy field: a failed copy reports ok false", JSON.stringify(await events(f)) === '[{"ok":false}]');
  await wait(2100);
  ok("copy field: the failure clears after two seconds", (await fb.locator(".t").textContent()) === "복사" && (await fb.locator("svg path").count()) > 1);

  /* 문구 바꾸기 */
  await go("components/copy-field.html");
  await stubOk();
  const c2 = page.locator("#ex-copy-field-default .copy-field");
  await c2.evaluate((h) => h.setAttribute("data-labels", JSON.stringify({ copied: "Copied", copiedStatus: "Copied to clipboard." })));
  await c2.locator(".copy").click(); await wait(120);
  ok("copy field: data-labels replaces the words", (await c2.locator(".copy .t").textContent()) === "Copied" && (await live()) === "Copied to clipboard.");
};
