// 사이트 프리뷰 동작 검증 (assets/ds.js): 빌드 후 `node behave.js` — 드롭다운·탭·달력·표 정렬 등을 실제 클릭으로 확인(케이스 수는 gates 출력이 말한다), 스크린샷은 .behave/
const path = require("path");
const SITE = path.resolve(__dirname, "..");
const { chromium } = require(path.join(SITE, "_build/node_modules/playwright"));
const SHOT = path.join(__dirname, ".behave");
require("fs").mkdirSync(SHOT, { recursive: true });
const results = [];
const ok = (name, cond, extra = "") => results.push([cond ? "PASS" : "FAIL", name, extra]);
/* 대비는 Node 에서 계산한다 — 템플릿 리터럴 안의 \\d 는 d 로 죽어 정규식이 깨진다 */
const lum = (v) => { const [r, g, b2] = v.map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b2; };
/* 알파를 떨어뜨리지 않는다 — 종전 구현은 rgba 를 rgb 로 읽어 반투명 면 위 글자를 검은 바탕에 대고 쟀다.
   color-mix 는 Chromium 이 color(srgb r g b / a) 로 직렬화하므로 그 형식도 읽는다 */
const parse = (s2) => {
  let m = s2.match(/^rgba?\(([^)]+)\)/);
  if (m) { const v = m[1].split(/[,\s/]+/).filter(Boolean).map(Number); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }; }
  m = s2.match(/^color\(srgb\s+([^)]+)\)/);
  if (m) { const v = m[1].split(/[\s/]+/).filter(Boolean).map(parseFloat); return { r: v[0] * 255, g: v[1] * 255, b: v[2] * 255, a: v.length > 3 ? v[3] : 1 }; }
  m = s2.match(/^#([0-9a-fA-F]{6})$/);
  if (m) return { r: parseInt(m[1].slice(0, 2), 16), g: parseInt(m[1].slice(2, 4), 16), b: parseInt(m[1].slice(4, 6), 16), a: 1 };
  const v = (s2.match(/[0-9.]+/g) || [0, 0, 0]).map(Number);
  return { r: v[0], g: v[1], b: v[2], a: 1 };
};
const toRgb = (s2) => { const c = parse(s2); return [c.r, c.g, c.b]; };
/* a 를 b 위에 얹는다 */
const over = (a, b) => a.a >= 0.999 ? a : ({ r: a.r * a.a + b.r * (1 - a.a), g: a.g * a.a + b.g * (1 - a.a), b: a.b * a.a + b.b * (1 - a.a), a: 1 });
const lumOf = (c) => lum([c.r, c.g, c.b]);
/* bed 를 주면 반투명 bg 를 그 위에 합성해서 잰다 */
const ratio = (fg, bg, bed) => {
  const f = parse(fg); let b = parse(bg);
  if (b.a < 0.999) b = over(b, bed ? parse(bed) : { r: 255, g: 255, b: 255, a: 1 });
  const [x, y] = [lumOf(f) + 0.05, lumOf(b) + 0.05];
  return +(Math.max(x, y) / Math.min(x, y)).toFixed(2);
};
/* 조상 바탕을 쌓아 합성한 실제 색 — 아웃라인처럼 면이 투명한 요소를 재려면 필요하다 */
const bedOf = (stack) => { let out = { r: 255, g: 255, b: 255, a: 1 }; for (let i = stack.length - 1; i >= 0; i--) out = over(parse(stack[i]), out); return `rgb(${Math.round(out.r)}, ${Math.round(out.g)}, ${Math.round(out.b)})`; };

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const go = async (p) => { await page.goto("file://" + path.join(SITE, p)); await page.waitForTimeout(150); };
  const ex = (pg, id) => `#ex-${pg}-${id} .example-preview`;

  // Select (값 선택) — 열기 · 바깥 클릭 · 선택 · 키보드
  await go("components/select.html");
  const dd = page.locator(`${ex("select", "open")} .dropdown`).first();
  await dd.locator(".trigger").click();
  ok("dropdown open on click", await dd.evaluate((e) => e.classList.contains("open") && e.querySelector(".trigger").getAttribute("aria-expanded") === "true"));
  ok("dropdown shows its own menu when opened", await dd.evaluate((e) => { const m = e.querySelector(".menu"); return !!m && getComputedStyle(m).display !== "none"; }));
  await page.mouse.click(5, 5);
  ok("dropdown closes on outside click", await dd.evaluate((e) => !e.classList.contains("open")));
  const dd2 = page.locator(`${ex("select", "open")} .dropdown`).nth(1);
  ok("static open dropdown stays open after outside click", await dd2.evaluate((e) => e.classList.contains("open")));
  await dd2.locator(".menu-item").nth(2).click();
  ok("select item updates trigger + closes", await dd2.evaluate((e) => !e.classList.contains("open") && e.querySelector(".trigger").textContent.trim() === "개발팀" && e.querySelector(".menu-item.on").textContent === "개발팀"));
  await dd2.locator(".trigger").click();
  await page.keyboard.press("ArrowDown"); await page.keyboard.press("Enter");
  ok("keyboard nav selects next item", await dd2.evaluate((e) => e.querySelector(".menu-item.on").textContent === "인프라팀"));
  await dd2.locator(".trigger").click(); await page.keyboard.press("Escape");
  ok("Esc closes dropdown", await dd2.evaluate((e) => !e.classList.contains("open")));
  // Select 정비(사람의 결정 2026-11-09) — 키보드 · Esc · 값 · 검증 · 목록 상태
  {
    await go("components/select.html");
    const D = `${ex("select", "default")} .dropdown`, tr = page.locator(`${D} .trigger`), press = (key) => page.evaluate((k) => document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true })), key), act = () => page.evaluate(() => document.activeElement.textContent.trim());
    await tr.focus(); await page.keyboard.press("ArrowDown");
    ok("select: ArrowDown on a closed trigger opens it", await page.locator(D).evaluate((e) => e.classList.contains("open")) && (await act()) === "전체");
    await press("ㅂ"); ok("select: typeahead matches initial consonants", (await act()) === "보안팀", await act());
    await press("ㅇ"); ok("select: typeahead joins letters typed quickly", (await act()) === "보안팀", await act());
    await page.waitForTimeout(550);
    await press("ㄱ"); ok("select: a letter searches forward from the current item", (await act()) === "기획팀", await act());
    await press("ㄱ"); ok("select: repeating one letter cycles", (await act()) === "고객지원팀", await act());
    await page.waitForTimeout(550);
    await press("q"); ok("select: typeahead is case-insensitive", (await act()) === "QA팀", await act());
    ok("select: typeahead does not pick", await page.locator(D).evaluate((e) => e.classList.contains("open") && !e.querySelector(".menu-item.on")));
    await page.keyboard.press("Tab");
    ok("select: Tab closes the menu and leaves the control", await page.locator(D).evaluate((e) => !e.classList.contains("open") && !e.contains(document.activeElement)));
    // Popup 안 Esc 는 Select 만
    await page.evaluate(() => { const p = document.createElement("div"); p.className = "popup"; p.id = "sel-pop"; p.setAttribute("role", "dialog"); p.setAttribute("aria-modal", "true"); p.innerHTML = '<div class="dropdown"><button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false">값</button><ul class="menu" role="listbox" aria-label="값"><li class="menu-item" role="option">가</li></ul></div>'; document.body.appendChild(p); window.DS.popup.open("#sel-pop"); });
    await page.locator(".popup-backdrop .trigger").click(); await page.waitForTimeout(60);
    await page.keyboard.press("Escape"); await page.waitForTimeout(60);
    ok("select: Esc inside a popup closes only the select", await page.evaluate(() => !document.querySelector(".popup-backdrop .dropdown.open") && !!document.querySelector(".popup-backdrop[data-ds-popup]")));
    await page.keyboard.press("Escape"); await page.waitForTimeout(250);
    ok("select: the next Esc closes the popup", await page.evaluate(() => !document.querySelector(".popup-backdrop[data-ds-popup]")));
    // 선택 안 함
    await go("components/select.html");
    const C = page.locator(`${ex("select", "clear")} .dropdown`).nth(1);
    await page.evaluate(() => { window.__sel = []; document.addEventListener("ds:select", (e) => window.__sel.push(e.detail.value)); });
    await C.locator(".trigger").click(); await C.locator(".menu-item").nth(1).click();
    ok("select: picking replaces the placeholder", await C.evaluate((e) => e.querySelector(".trigger").textContent.trim() === "김보안" && !e.querySelector(".placeholder")));
    await C.locator(".trigger").click(); await C.locator(".menu-item").nth(0).click();
    ok("select: value '' returns to the placeholder", await C.evaluate((e) => e.querySelector(".trigger .placeholder")?.textContent === "승인자 선택" && !e.querySelector(".menu-item.on")));
    ok("select: ds:select carries data-value, '' included", JSON.stringify(await page.evaluate(() => window.__sel)) === '["kim",""]', JSON.stringify(await page.evaluate(() => window.__sel)));
    // 폼 안에서
    const F = ex("select", "form"), f1 = page.locator(`${F} .field`).first(), f2 = page.locator(`${F} .field`).nth(1), t1 = page.locator("#sel-f1");
    ok("select: untouched required field is quiet", !(await f1.evaluate((e) => e.classList.contains("error"))));
    const w = await f1.evaluate((e) => [e.getBoundingClientRect().width, e.querySelector(".trigger").getBoundingClientRect().width, e.querySelector(".menu").offsetWidth || 0]);
    ok("select: fills the field width", Math.abs(w[0] - w[1]) < 0.5, JSON.stringify(w));
    await page.locator("#sel-f2").click(); await page.waitForTimeout(40); await page.keyboard.press("Escape"); await page.waitForTimeout(40);
    ok("select: optional field stays quiet when closed empty", !(await f2.evaluate((e) => e.classList.contains("error"))));
    await page.locator(`${F} button[type=submit]`).click(); await page.waitForTimeout(80);
    ok("select: submit is blocked with the choose message", await f1.evaluate((e) => e.classList.contains("error") && e.querySelector(".help").textContent === "필수 항목입니다. 항목을 선택하세요." && e.querySelector(".trigger").getAttribute("aria-invalid") === "true"));
    ok("select: submit moves focus to the first error", await page.evaluate(() => document.activeElement.id === "sel-f1"));
    await t1.click(); await page.waitForTimeout(40);
    ok("select: open errored field keeps the red ring", (await t1.evaluate((e) => getComputedStyle(e).boxShadow)).includes("4px"));
    await page.locator(`${F} .field >> nth=0 >> .menu-item >> nth=2`).click(); await page.waitForTimeout(40);
    ok("select: picking clears the error and fills the hidden value", await f1.evaluate((e) => !e.classList.contains("error") && e.querySelector("input[type=hidden]").value === "sec"));
    await page.reload(); await page.waitForTimeout(150);
    await t1.click(); await page.waitForTimeout(40); await page.keyboard.press("Escape"); await page.waitForTimeout(40);
    ok("select: closing empty after opening reports the error", await f1.evaluate((e) => e.classList.contains("error")));
    // 목록 상태
    const St = page.locator(`${ex("select", "states")} .dropdown`);
    ok("select: three menu states are visible", await St.evaluateAll((els) => els.length === 3 && els.every((e) => e.querySelector(".menu-state") && !e.querySelector(".menu-item") && getComputedStyle(e.querySelector(".menu")).display !== "none") && !!els[0].querySelector(".spinner")));
    await page.evaluate(() => { window.__retry = 0; document.addEventListener("ds:retry", () => window.__retry++); });
    await St.nth(1).locator("[data-retry]").click();
    ok("select: retry fires ds:retry", (await page.evaluate(() => window.__retry)) === 1);
    await go("components/select.html");
  }
  // Combobox(새 컴포넌트) — 포커스는 입력에, 필터 · 키보드 · 떠날 때 · 여러 개 · 검증
  {
    await go("components/combobox.html");
    await page.evaluate(() => { window.__cb = []; document.addEventListener("ds:select", (e) => window.__cb.push(e.detail.value)); window.__q = []; document.addEventListener("ds:query", (e) => window.__q.push(e.detail.query)); window.__r = 0; document.addEventListener("ds:retry", () => window.__r++); });
    const I = page.locator("#cb-d"), H = page.locator(`${ex("combobox", "default")} .combobox`), vis = (h) => h.evaluate((e) => [...e.querySelectorAll(".menu-item")].filter((i) => i.offsetParent).map((i) => i.textContent)), st = (h) => h.evaluate((e) => e.querySelector("[role=status]").textContent);
    await I.click(); await page.waitForTimeout(30);
    ok("combobox: click opens the list and keeps focus in the input", await H.evaluate((e) => e.classList.contains("open") && document.activeElement === e.querySelector("input[role=combobox]") && e.querySelector("input").getAttribute("aria-expanded") === "true"));
    ok("combobox: a focused input has no second border or ring", await I.evaluate((e) => { const c = getComputedStyle(e), p = getComputedStyle(e.parentElement); return c.borderTopWidth === "0px" && c.boxShadow === "none" && p.boxShadow.includes("4px"); }));
    ok("combobox: menu is as wide as the field", await H.evaluate((e) => Math.abs(e.querySelector(".menu").offsetWidth - e.querySelector(".control").offsetWidth) <= 1));
    await page.keyboard.type("인"); await page.waitForTimeout(30);
    ok("combobox: typing filters the list", JSON.stringify(await vis(H)) === '["인프라팀","디자인팀","인사팀"]', JSON.stringify(await vis(H)));
    ok("combobox: first match becomes the active descendant", await H.evaluate((e) => { const a = e.querySelector(".menu-item.active"); return a.textContent === "인프라팀" && e.querySelector("input").getAttribute("aria-activedescendant") === a.id; }));
    ok("combobox: result count is announced", (await st(H)) === "결과 3개", await st(H));
    await page.keyboard.press("ArrowUp"); ok("combobox: ArrowUp wraps to the last match", await H.evaluate((e) => e.querySelector(".menu-item.active").textContent === "인사팀"));
    await page.keyboard.press("ArrowDown"); await page.keyboard.press("Enter"); await page.waitForTimeout(30);
    ok("combobox: Enter picks the active option and closes", (await I.inputValue()) === "인프라팀" && await H.evaluate((e) => !e.classList.contains("open") && e.querySelector(".menu-item.on").textContent === "인프라팀" && e.querySelector("input").getAttribute("aria-expanded") === "false"));
    ok("combobox: ds:select carries the value", JSON.stringify(await page.evaluate(() => window.__cb)) === '["인프라팀"]', JSON.stringify(await page.evaluate(() => window.__cb)));
    await I.click(); await page.waitForTimeout(30);
    ok("combobox: reopening shows every option, not just the old filter", (await vis(H)).length === 11);
    await page.keyboard.press("Escape"); await page.waitForTimeout(30);
    ok("combobox: Esc closes and keeps the value and focus", (await I.inputValue()) === "인프라팀" && await H.evaluate((e) => !e.classList.contains("open") && document.activeElement === e.querySelector("input")));
    await H.evaluate((e) => [...e.querySelectorAll(".menu-item")].pop().setAttribute("aria-disabled", "true"));
    await I.fill("법"); await page.waitForTimeout(30);
    ok("combobox: a disabled match is shown but never the candidate", await H.evaluate((e) => !e.querySelector(".menu-item.active") && !e.querySelector(".menu-state[data-auto]") && e.querySelector("[role=status]").textContent === "결과 1개"));
    await H.evaluate((e) => [...e.querySelectorAll(".menu-item")].pop().removeAttribute("aria-disabled"));
    await I.fill("없는"); await page.waitForTimeout(30);
    ok("combobox: no result shows the guidance line", await H.evaluate((e) => e.querySelector(".menu-state[data-auto]")?.textContent === "일치하는 항목이 없습니다. 다른 검색어를 입력하세요."));
    await page.keyboard.press("Tab"); await page.waitForTimeout(30);
    ok("combobox: leaving discards unpicked text", (await I.inputValue()) === "인프라팀" && await H.evaluate((e) => !e.classList.contains("open")));
    await I.click(); await page.waitForTimeout(30); await page.keyboard.press("Tab"); await page.waitForTimeout(30);
    ok("combobox: Tab skips the scrolling list and leaves the control", await H.evaluate((e) => !e.classList.contains("open") && !e.contains(document.activeElement)));
    await I.fill(""); await page.keyboard.press("Tab"); await page.waitForTimeout(30);
    ok("combobox: leaving with empty text clears the pick", await H.evaluate((e) => !e.querySelector(".menu-item.on")) && (await page.evaluate(() => window.__cb.at(-1))) === "");
    const M = page.locator(`${ex("combobox", "multiple")} .combobox`), MI = page.locator("#cb-m"), chips = () => M.evaluate((e) => [...e.querySelectorAll(".chip")].map((c) => c.textContent.trim()));
    await MI.click(); await page.waitForTimeout(30);
    await M.locator(".menu-item").nth(1).click(); await page.waitForTimeout(30);
    ok("combobox multi: picked item becomes a tag in option order", JSON.stringify(await chips()) === '["영업팀","개발팀","보안팀"]', JSON.stringify(await chips()));
    ok("combobox multi: list stays open and focus stays in the input", await M.evaluate((e) => e.classList.contains("open") && document.activeElement === e.querySelector("input[role=combobox]")));
    ok("combobox multi: ds:select carries an array", JSON.stringify(await page.evaluate(() => window.__cb.at(-1))) === '["영업팀","개발팀","보안팀"]');
    await page.keyboard.type("재"); await page.waitForTimeout(30); await page.keyboard.press("Enter"); await page.waitForTimeout(30);
    ok("combobox multi: Enter adds and clears the query", (await chips()).includes("재무팀") && (await MI.inputValue()) === "");
    ok("combobox multi: selection is announced", (await st(M)) === "재무팀 선택됨", await st(M));
    await page.keyboard.press("Backspace"); await page.waitForTimeout(30);
    ok("combobox multi: Backspace on an empty input removes the last tag", !(await chips()).includes("재무팀"));
    await M.locator(".chip .x").first().click(); await page.waitForTimeout(30);
    ok("combobox multi: x removes that tag and keeps focus", !(await chips()).includes("영업팀") && await M.evaluate((e) => document.activeElement === e.querySelector("input[role=combobox]")));
    await MI.click(); await page.waitForTimeout(30);
    const mb = await M.locator(".menu-item").nth(2).boundingBox(); await page.mouse.move(mb.x + 20, mb.y + 10); await page.mouse.down(); await page.waitForTimeout(30);
    ok("combobox: pressing an option does not take focus from the input", await M.evaluate((e) => document.activeElement === e.querySelector("input[role=combobox]")));
    await page.mouse.up(); await page.keyboard.press("Escape"); await page.waitForTimeout(30);
    const hs = await H.evaluate((e) => { const f = e.closest(".field"), c = e.querySelector(".control"), o = []; for (const s of ["sm", "", "lg"]) { if (s) f.classList.add(s); o.push(c.offsetHeight); if (s) f.classList.remove(s); } return o; });
    ok("combobox: field heights match Text Field 32 · 40 · 48", JSON.stringify(hs) === "[32,40,48]", JSON.stringify(hs));
    const dis = page.locator(`${ex("combobox", "disabled")} .combobox`);
    await dis.locator(".control").click({ force: true }); await page.waitForTimeout(30);
    ok("combobox: disabled does not open and uses the disable surface", await dis.evaluate((e) => { const v = getComputedStyle(document.documentElement).getPropertyValue("--surface-disable-primary"), p = document.createElement("i"); p.style.background = v; document.body.appendChild(p); const want = getComputedStyle(p).backgroundColor; p.remove(); return !e.classList.contains("open") && getComputedStyle(e.querySelector(".control")).backgroundColor === want; }));
    const SS = page.locator(`${ex("combobox", "states")} .combobox`);
    await SS.nth(1).locator("[data-retry]").click();
    ok("combobox: retry fires ds:retry", (await page.evaluate(() => window.__r)) === 1);
    await page.locator("#cb-s3").fill("영"); await page.waitForTimeout(360);
    ok("combobox: data-filter=none only reports the query", JSON.stringify(await page.evaluate(() => window.__q)) === '["영"]' && await SS.nth(2).evaluate((e) => !e.querySelector(".menu-state[data-auto]") && !!e.querySelector(".menu-state")));
    // 폼 검증
    const F = ex("combobox", "form"), f1 = page.locator(`${F} .field`).first(), f2 = page.locator(`${F} .field`).nth(1);
    await page.locator("#cb-f1").focus(); await page.keyboard.press("Tab"); await page.waitForTimeout(30);
    ok("combobox: tabbing through without opening is quiet", !(await f1.evaluate((e) => e.classList.contains("error"))));
    await page.locator(`${F} button[type=submit]`).click(); await page.waitForTimeout(60);
    ok("combobox: submit is blocked on both fields", await page.locator(`${F} .field.error`).count() === 2 && (await f1.locator(".help").textContent()) === "필수 항목입니다. 항목을 선택하세요.");
    ok("combobox: submit moves focus to the first input", await page.evaluate(() => document.activeElement.id === "cb-f1"));
    ok("combobox: error field keeps the red ring", (await f1.locator(".control").evaluate((e) => getComputedStyle(e).boxShadow)).includes("4px"));
    ok("combobox: the input inside an error field draws no ring of its own", (await page.locator("#cb-f1").evaluate((e) => document.activeElement === e && getComputedStyle(e).boxShadow)) === "none");
    await page.locator("#cb-f1").click(); await f1.locator(".menu-item").nth(3).click(); await page.waitForTimeout(40);
    ok("combobox: picking clears the error and fills the hidden value", await f1.evaluate((e) => !e.classList.contains("error") && e.querySelector("input[type=hidden]").value === "보안팀"));
    await page.locator("#cb-f2").click(); await f2.locator(".menu-item").nth(0).click(); await f2.locator(".menu-item").nth(1).click(); await page.waitForTimeout(40);
    ok("combobox multi: one hidden input per value, error cleared", await f2.evaluate((e) => !e.classList.contains("error") && [...e.querySelectorAll("input[type=hidden]")].map((x) => x.value).join() === "영업팀,개발팀"));
    await page.evaluate(() => { const p = document.createElement("div"); p.className = "popup"; p.id = "cb-pop"; p.setAttribute("role", "dialog"); p.setAttribute("aria-modal", "true"); p.innerHTML = '<div class="combobox"><div class="control"><input role="combobox" aria-label="값" aria-expanded="false" id="cb-p"></div><ul class="menu" role="listbox" aria-label="값"><li class="menu-item" role="option">가</li></ul></div>'; document.body.appendChild(p); window.DS.popup.open("#cb-pop"); window.DS.init(p); });
    await page.locator("#cb-p").click(); await page.waitForTimeout(40); await page.keyboard.press("Escape"); await page.waitForTimeout(60);
    ok("combobox: Esc inside a popup closes only the list", await page.evaluate(() => !document.querySelector(".popup-backdrop .combobox.open") && !!document.querySelector(".popup-backdrop[data-ds-popup]")));
    await page.keyboard.press("Escape"); await page.waitForTimeout(250);
    await go("components/select.html");
  }
  // Select: 긴 목록(Default)은 메뉴 안에서 스크롤 (뒤 페이지는 따라 움직이지 않는다)
  const longMenu = page.locator(`${ex("select", "default")} .menu`);
  await page.locator(`${ex("select", "default")} .trigger`).click();
  await page.waitForTimeout(120);
  const sc = await longMenu.evaluate((m) => ({
    maxH: Math.round(parseFloat(getComputedStyle(m).maxHeight)),
    overflow: getComputedStyle(m).overflowY,
    overscroll: getComputedStyle(m).overscrollBehaviorY,
    h: Math.round(m.getBoundingClientRect().height),
    scrollable: m.scrollHeight > m.clientHeight,
    items: m.querySelectorAll(".menu-item").length,
  }));
  ok("long select list scrolls inside the menu", sc.items >= 10 && sc.scrollable && sc.h <= 320 && sc.overflow === "auto" && sc.overscroll === "contain", JSON.stringify(sc));
  const last = await longMenu.evaluate((m) => { m.scrollTop = m.scrollHeight; const li = m.lastElementChild.getBoundingClientRect(), r = m.getBoundingClientRect(); return li.bottom <= r.bottom + 1 && li.top >= r.top - 1; });
  ok("scrolling the menu reaches the last option", last);
  await page.keyboard.press("Escape");

  // Select: 아래 공간이 모자라면 위로 뒤집어 연다 (.up)
  /* 트리거를 뷰포트의 정한 자리로 옮겨 잰다 — 예제 위쪽 내용(원칙 표 등)이 늘어도 조건이 바뀌지 않게 */
  const flip = async (h) => {
    await page.setViewportSize({ width: 1440, height: h });
    await page.waitForTimeout(120);
    const d = page.locator(`${ex("select", "default")} .dropdown`);
    await d.evaluate((e, top) => window.scrollTo({ top: e.getBoundingClientRect().top + window.scrollY - top, behavior: "instant" }), h > 800 ? 120 : h - 120);
    await page.waitForTimeout(60);
    await d.evaluate((e) => { if (e.classList.contains("open")) e.querySelector(".trigger").click(); });
    await d.evaluate((e) => e.querySelector(".trigger").click());
    await page.waitForTimeout(120);
    return d.evaluate((e) => {
      const m = e.querySelector(".menu").getBoundingClientRect(), tr = e.querySelector(".trigger").getBoundingClientRect();
      return { up: e.classList.contains("up"), room: Math.round(window.innerHeight - tr.bottom), above: m.bottom <= tr.top, inside: m.top >= -1 && m.bottom <= window.innerHeight + 1 };
    });
  };
  const down = await flip(1000), upd = await flip(560);
  ok("menu opens down when there is room", !down.up && !down.above && down.inside, JSON.stringify(down));
  ok("menu flips up when there is not", upd.up && upd.above && upd.inside, JSON.stringify(upd));
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1440, height: 900 });

  // Dropdown (액션 메뉴)
  await go("components/dropdown.html");
  /* 문서 목록 규칙(li 아래 여백 6px)이 미리보기 메뉴 항목 사이까지 먹어, 미리보기가 배포 CSS(복사본·React)보다 항목마다 6px 벌어졌다 */
  const menuLi = await page.evaluate(() => getComputedStyle(document.querySelector("#ex-dropdown-menu .menu-item")).marginBottom);
  ok("docs list spacing stays out of preview menus", menuLi === "0px", menuLi);
  /* 메뉴 항목 호버는 --surface-neutral-tertiary(사람의 결정 2026-10-27 — secondary 에서) */
  await page.locator("#ex-dropdown-menu .menu-item:not(.on):not(.danger)").first().hover(); await page.waitForTimeout(150);
  const menuHover = await page.evaluate(() => { const li = document.querySelector("#ex-dropdown-menu .menu-item:not(.on):not(.danger)"), d = document.createElement("div"); d.style.background = "var(--surface-neutral-tertiary)"; document.body.append(d);
    const want = getComputedStyle(d).backgroundColor; d.remove(); return { bg: getComputedStyle(li).backgroundColor, want }; });
  ok("menu item hover uses the tertiary tint", menuHover.bg === menuHover.want, JSON.stringify(menuHover));
  /* 비활성 Slider 는 라벨 · 값도 흐리게 — :disabled 가 input 에만 걸려 막대만 흐렸다(사람의 결정 2026-10-27) */
  await go("components/slider.html");
  const sliderOff = await page.evaluate(() => { const s = document.querySelector("#ex-slider-disabled .slider"), d = document.createElement("div"); d.style.color = "var(--foreground-disable-primary)"; document.body.append(d); const want = getComputedStyle(d).color; d.remove();
    return { label: getComputedStyle(s.querySelector("label")).color, val: getComputedStyle(s.querySelector(".val")).color, want }; });
  ok("a disabled slider dims its label and value", sliderOff.label === sliderOff.want && sliderOff.val === sliderOff.want, JSON.stringify(sliderOff));
  // Dropdown 정비(사람의 결정 2026-11-10) — 포커스 · 이동 항목 · 스크롤 영역 안에서 띄우기
  {
    await go("components/dropdown.html");
    const D = page.locator("#ex-dropdown-default .example-preview .dropdown"), T = D.locator("button");
    await T.focus(); await page.keyboard.press("ArrowDown"); await page.waitForTimeout(30);
    ok("dropdown: opening by keyboard focuses the first item", (await page.evaluate(() => document.activeElement.textContent.trim())) === "편집");
    ok("dropdown: outside a scroll area the menu is not floated", !(await D.evaluate((e) => e.classList.contains("float"))));
    await page.keyboard.press("Enter"); await page.waitForTimeout(30);
    ok("dropdown: running an item closes and returns focus to the trigger", await D.evaluate((e) => !e.classList.contains("open") && document.activeElement === e.querySelector("button")));
    const L = page.locator("#ex-dropdown-links .example-preview .dropdown");
    await L.locator("button").first().click(); await page.waitForTimeout(40);
    const lk = await L.evaluate((e) => { const a = e.querySelector("a.menu-item"), li = e.querySelector("li.menu-item"), ca = getComputedStyle(a), cl = getComputedStyle(li); return { color: ca.color === cl.color, line: ca.textDecorationLine, h: [a.getBoundingClientRect().height, li.getBoundingClientRect().height], fs: ca.fontSize === cl.fontSize, active: document.activeElement === a, parent: a.parentElement.getAttribute("role"), href: a.hasAttribute("href") }; });
    ok("dropdown: a link item looks like any other item", lk.color && lk.line === "none" && lk.fs && Math.abs(lk.h[0] - lk.h[1]) < 0.5, JSON.stringify(lk));
    ok("dropdown: a link item is a real link in a role=none list item and takes focus", lk.active && lk.parent === "none" && lk.href, JSON.stringify(lk));
    await page.keyboard.press("ArrowDown"); await page.keyboard.press("ArrowDown"); await page.waitForTimeout(20);
    ok("dropdown: arrow keys cross link and plain items", (await page.evaluate(() => document.activeElement.textContent.trim())) === "복제");
    await page.keyboard.press("Escape"); await page.waitForTimeout(30);
    // 표 안 — 잘리지 않고, 스크롤하면 닫힌다
    await go("components/data-table.html");
    const W = page.locator("#ex-data-table-row-actions .tbl-wrap"), R = page.locator("#ex-data-table-row-actions .dropdown").first(), RT = R.locator("button");
    await RT.scrollIntoViewIfNeeded(); await page.evaluate(() => window.scrollBy({ top: -200, behavior: "instant" })); await page.waitForTimeout(60);
    await RT.click(); await page.waitForTimeout(60);
    const fl = await R.evaluate((e) => { const m = e.querySelector(".menu"), r = m.getBoundingClientRect(), t = e.querySelector("button").getBoundingClientRect(), w = e.closest(".tbl-wrap").getBoundingClientRect(), last = [...m.querySelectorAll(".menu-item")].pop().getBoundingClientRect(), hit = document.elementFromPoint(last.left + 20, last.top + last.height / 2); return { float: e.classList.contains("float"), pos: getComputedStyle(m).position, gap: Math.round(r.top - t.bottom), right: Math.abs(r.right - t.right) < 1, past: r.bottom > w.bottom, hit: m.contains(hit), width: r.width, focus: m.contains(document.activeElement) }; });
    ok("dropdown: inside a scroll area the menu floats on the viewport", fl.float && fl.pos === "fixed" && fl.gap === 4, JSON.stringify(fl));
    ok("dropdown: the floated menu passes the area edge and is not clipped", fl.past && fl.hit, JSON.stringify(fl));
    ok("dropdown: a floated menu keeps its end alignment, width and focus", fl.right && fl.width < 400 && fl.focus, JSON.stringify(fl));
    await R.locator(".menu-item").nth(1).click(); await page.waitForTimeout(40);
    ok("dropdown: items in a floated menu run and clear .float", await R.evaluate((e) => !e.classList.contains("open") && !e.classList.contains("float") && document.activeElement === e.querySelector("button")));
    await RT.click(); await page.waitForTimeout(60);
    await R.evaluate((e) => { const m = e.querySelector(".menu"); for (let i = 0; i < 20; i++) m.insertAdjacentHTML("beforeend", '<li class="menu-item" role="menuitem" data-x>추가</li>'); m.scrollTop = 60; }); await page.waitForTimeout(80);
    ok("dropdown: scrolling inside a floated menu keeps it open", await R.evaluate((e) => e.classList.contains("open")));
    await R.evaluate((e) => e.querySelectorAll("[data-x]").forEach((x) => x.remove()));
    const y0 = await page.evaluate(() => window.scrollY); await page.evaluate(() => window.scrollBy({ top: 900, behavior: "instant" })); await page.waitForTimeout(80);
    ok("dropdown: page scroll closes a floated menu and returns focus without jumping", await R.evaluate((e) => !e.classList.contains("open") && document.activeElement === e.querySelector("button")) && (await page.evaluate(() => window.scrollY)) === y0 + 900, String(y0));
    await RT.evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" })); await page.waitForTimeout(120);
    await RT.click(); await page.waitForTimeout(120);
    const wasOpen = await R.evaluate((e) => e.classList.contains("open"));
    await page.evaluate(() => window.dispatchEvent(new Event("resize"))); await page.waitForTimeout(60);   // 실제로 창을 바꾸면 스크롤 이벤트도 나서 resize 를 따로 잴 수 없다
    ok("dropdown: resizing closes a floated menu", wasOpen && await R.evaluate((e) => !e.classList.contains("open")), String(wasOpen));
    await RT.evaluate((e) => { const t = e.getBoundingClientRect(); window.scrollBy({ top: t.top - (window.innerHeight - 90), behavior: "instant" }); }); await page.waitForTimeout(60);
    await RT.click(); await page.waitForTimeout(60);
    const fu = await R.evaluate((e) => { const r = e.querySelector(".menu").getBoundingClientRect(), t = e.querySelector("button").getBoundingClientRect(); return { up: e.classList.contains("up"), float: e.classList.contains("float"), gap: Math.round(t.top - r.bottom), inside: r.top >= 0 && r.bottom <= window.innerHeight }; });
    ok("dropdown: a floated menu flips up near the viewport bottom", fu.up && fu.float && fu.gap === 4 && fu.inside, JSON.stringify(fu));
    await page.keyboard.press("Escape"); await page.waitForTimeout(30);
    await page.evaluate(() => { const b = document.createElement("div"); b.id = "edge-box"; b.style = "position:fixed;right:4px;top:200px;width:60px;overflow:auto"; b.innerHTML = '<div class="dropdown"><button type="button" class="btn sm assistive" aria-haspopup="menu" aria-expanded="false">열기</button><ul class="menu" role="menu"><li class="menu-item" role="menuitem">아주 긴 동작 이름을 가진 항목입니다</li></ul></div>'; document.body.appendChild(b); });
    await page.locator("#edge-box button").click(); await page.waitForTimeout(60);
    const eg = await page.evaluate(() => { const r = document.querySelector("#edge-box .menu").getBoundingClientRect(); return [r.right, window.innerWidth - 8]; });
    ok("dropdown: a floated menu stays 8px inside the viewport", eg[0] <= eg[1] + 0.5, JSON.stringify(eg));
    await page.keyboard.press("Escape"); await page.waitForTimeout(30);
    // Select · Combobox 도 같은 규칙
    await go("components/select.html");
    const S1 = page.locator("#ex-select-default .example-preview .dropdown");
    await S1.evaluate((e) => { const b = document.createElement("div"); b.style = "overflow:auto;height:60px"; e.replaceWith(b); b.appendChild(e); });
    await S1.locator(".trigger").click(); await page.waitForTimeout(60);
    const sf = await S1.evaluate((e) => { const m = e.querySelector(".menu").getBoundingClientRect(), t = e.querySelector(".trigger").getBoundingClientRect(); return { f: e.classList.contains("float"), w: Math.abs(m.width - t.width) < 1, x: Math.abs(m.left - t.left) < 1 }; });
    ok("select: floats inside a scroll area at the trigger's width", sf.f && sf.w && sf.x, JSON.stringify(sf));
    await page.keyboard.press("Escape"); await page.waitForTimeout(30);
    await go("components/combobox.html");
    const C1 = page.locator("#ex-combobox-default .combobox");
    await C1.evaluate((e) => { const b = document.createElement("div"); b.style = "overflow:auto;height:60px"; e.replaceWith(b); b.appendChild(e); });
    await page.locator("#cb-d").click(); await page.waitForTimeout(60);
    ok("combobox: floats inside a scroll area", await C1.evaluate((e) => e.classList.contains("float") && Math.abs(e.querySelector(".menu").offsetWidth - e.querySelector(".control").offsetWidth) <= 1));
    await page.evaluate(() => window.scrollBy({ top: 20, behavior: "instant" })); await page.waitForTimeout(80);
    ok("combobox: scrolling closes a floated list and keeps focus in the input", await C1.evaluate((e) => !e.classList.contains("open") && !e.classList.contains("float") && document.activeElement === e.querySelector("input[role=combobox]")));
    await go("components/dropdown.html");
  }
  await go("components/dropdown.html");   // 뒤의 Dropdown 단정으로 돌아간다
  const menuDd = page.locator(`#ex-dropdown-menu .example-preview .dropdown`).first();
  await menuDd.locator("[aria-haspopup]").click();
  ok("static open menu closes on trigger click", await menuDd.evaluate((e) => !e.classList.contains("open")));
  await menuDd.locator("[aria-haspopup]").click();
  ok("menu dropdown re-opens", await menuDd.evaluate((e) => e.classList.contains("open") && e.querySelector("[aria-haspopup]").getAttribute("aria-expanded") === "true"));
  /* 메뉴 아이콘이 상태를 따르는지 — .menu-item svg 가 tertiary 로 고정해 선택·위험 아이콘이 회색이었다. 실제 예제(Item States)를 잰다 */
  const menuIcon = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll("#ex-dropdown-states .menu-item")].map((li) => {
    const k = li.classList.contains("danger") ? "danger" : li.getAttribute("aria-disabled") === "true" ? "off" : "plain";
    return [k, [getComputedStyle(li).color, getComputedStyle(li.querySelector("svg")).color]];
  })));
  ok("menu icon follows the label colour when dangerous or disabled",
    ["danger", "off", "plain"].every((k) => menuIcon[k]) && ["danger", "off"].every((k) => menuIcon[k][0] === menuIcon[k][1]) && menuIcon.plain[0] !== menuIcon.plain[1], JSON.stringify(menuIcon));
  await page.screenshot({ path: SHOT + "/dropdown.png", clip: await menuDd.boundingBox().then((bb) => ({ x: bb.x - 10, y: bb.y - 10, width: bb.width + 200, height: bb.height + 260 })) });

  // Tabs
  await go("components/tab.html");
  const tabs = page.locator(".example-preview .tabs").first();
  await tabs.locator(".tab").nth(1).click();
  ok("tab switches", await tabs.evaluate((e) => { const on = e.querySelectorAll(".tab.on"); return on.length === 1 && on[0] === e.querySelectorAll(".tab")[1] && on[0].getAttribute("aria-selected") === "true"; }));
  await page.keyboard.press("ArrowRight");
  ok("tab arrow key", await tabs.evaluate((e) => e.querySelectorAll(".tab")[2].classList.contains("on")));

  /* 제품 슬롯 — 기준 시스템의 brand 자리에 제품 컬러가 들어간다. 단계는 다섯(40·45·50·55·60)이고 50 이 제품 HEX 다.
     세 경우를 본다: 기본(주입 없음 = Blue 램프) · 밝은 제품(제품 C) · 상태색과 겹치는 제품(제품 A·B).
     색상환 거리는 램프에서 실측한 여섯 각도(negative 0 · cautionary 34 · lime 95 · positive 140 · accent cyan 189 · light-blue 199)로 잰다 —
     종전 표 [0,38,160,199] 는 최대 20도 어긋나 있었고, 그래서 청록 제품(184도)이 Medium 과 5도 차이인데도 통과했다 */
  await go("components/button.html");
  const accent = async (key) => {
    await page.click("#accentBtn"); await page.waitForTimeout(80);
    await page.locator(`#accentPop [data-accent="${key}"]`).click(); await page.waitForTimeout(150);
    return page.evaluate(() => {
      /* 마지막 호출은 Colors 페이지에서 일어나 버튼이 없다 — 그때는 플래그만 본다 */
      const btn = document.querySelector("#ex-button-variant .btn.solid.primary"), txt = document.querySelector("#ex-button-variant .btn.outline.primary");
      const r = getComputedStyle(document.documentElement);
      const g = (n) => r.getPropertyValue(n).trim();
      return {
        neutral: document.documentElement.hasAttribute("data-accent-neutral"),
        light: document.documentElement.hasAttribute("data-accent-light"),
        bg: btn ? getComputedStyle(btn).backgroundColor : "", text: txt ? getComputedStyle(txt).color : "",
        surface: g("--surface-brand-primary"), fg: g("--foreground-brand-primary"),
        ramp: [40, 45, 50, 55, 60].map((k) => g("--brand-" + k)),
        /* 중립 전환이 '정말 중립 램프로' 갈렸는지 보려면 그 램프 값 전부가 필요하다.
           단계 번호를 박아 두면 램프를 조정할 때마다 단정이 깨진다 — 단계 선택은 설계 선택이다 */
        coolRamp: [5, 7, 10, 15, 17, 20, 22, 23, 25, 30, 40, 50, 60, 70, 80, 90, 95, 96, 97, 98, 99].map((k) => g("--cool-neutral-" + k)),
      };
    });
  };
  const teal = await accent("product-a"), red = await accent("product-b"), bright = await accent("product-c");
  /* 메뉴의 "기본" 견본은 제품 색 · 테마와 상관없이 기본 brand(#0066FF) — 토큰을 썼더니 적용된 제품 색 · 다크 값을 따라갔다(사람의 결정 2026-10-28) */
  const baseSwatch = await page.evaluate(() => {
    const root = document.documentElement, was = root.getAttribute("data-theme"), sw = () => getComputedStyle(document.querySelector('#accentPop [data-accent=""] i')).backgroundColor;
    const withAccent = sw(); root.setAttribute("data-theme", "dark"); const dark = sw();
    if (was === null) root.removeAttribute("data-theme"); else root.setAttribute("data-theme", was);
    return { withAccent, dark };
  });
  ok("the default swatch in the product color menu stays #0066FF", baseSwatch.withAccent === "rgb(0, 102, 255)" && baseSwatch.dark === "rgb(0, 102, 255)", JSON.stringify(baseSwatch));
  /* 청록 제품은 Medium(accent cyan)과 5도 차이라 이제 중립으로 내려간다 — 실측 각도로 고친 결과다.
     어느 중립 단계를 집는지는 설계 선택이라 박아 두지 않는다. 대신 **다섯 단계가 전부 중립 램프의 값이고
     번호가 커질수록 밝다**를 본다 — 중립 전환이 뜻하는 바가 그것이고, 단계를 조정해도 살아남는다 */
  const neutralRamp = (t) => t.ramp.every((v) => t.coolRamp.includes(v));
  const lighterUp = (t) => { const L = (h) => { const n = parseInt(h.slice(1), 16); return ((n >> 16 & 255) + (n >> 8 & 255) + (n & 255)); };
    return t.ramp.every((v, i) => i === 0 || L(v) > L(t.ramp[i - 1])); };
  ok("a teal product now trips the status-clash guard",
    teal.neutral && neutralRamp(teal) && lighterUp(teal), JSON.stringify(teal.ramp));
  ok("a red product turns the whole brand ramp neutral",
    red.neutral && neutralRamp(red) && lighterUp(red) && red.ramp.includes(red.surface) && red.bg === red.text, JSON.stringify(red.ramp));
  /* 제품 C(#00AD7B)만 상태색과 겹치지 않는다. 밝은 제품이라 면 위 글자가 어두워지고 상태가 밝은 쪽으로 간다 */
  /* 밝은 제품 적응(data-accent-light)을 걷어냈다 — 이제 제품 색은 흰 글자를 받칠 수 있어야 한다는 **제약**이고,
     빌드가 data.js 의 제품 전부를 검사한다. 여기서는 겹치지 않는 제품이 자기 색을 그대로 쓰는지만 본다 */
  ok("a non-clashing product keeps its own colour and never flips the label",
    !bright.neutral && !bright.light && bright.surface === "#008760", JSON.stringify(bright));

  const readTokens = () => page.evaluate(() => {
    const r = getComputedStyle(document.documentElement); const g = (n) => r.getPropertyValue(n).trim();
    const res = (t) => { const d = document.createElement("div"); d.style.color = t; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; };
    return {
      surface: g("--surface-brand-primary"), strong: g("--surface-brand-strong"), heavy: g("--surface-brand-heavy"),
      light: document.documentElement.hasAttribute("data-accent-light"), neutral: document.documentElement.hasAttribute("data-accent-neutral"),
      ramp: [40, 45, 50, 55, 60].map((k) => g("--brand-" + k)),
      surfaceRgb: res("var(--surface-brand-primary)"), strongRgb: res("var(--surface-brand-strong)"), heavyRgb: res("var(--surface-brand-heavy)"),
      labelRgb: res("var(--brand-label)"), fgRgb: res("var(--foreground-brand-primary)"),
      subtleRgb: res("var(--surface-brand-subtle)"), invRgb: res("var(--foreground-brand-inverse)"),
      bgInverse: res("var(--surface-neutral-inverse)"),
      canvas: res("var(--background-neutral-primary)"), card: res("var(--surface-elevated-primary)"), subtle: res("var(--background-neutral-secondary)"),
    };
  });
  const goDark = async () => { await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark")); await page.waitForTimeout(250); return readTokens(); };
  const unDark = async () => { await page.evaluate(() => document.documentElement.removeAttribute("data-theme")); await page.waitForTimeout(150); };
  const cases = [];
  for (const [name, key] of [["base", ""], ["other", "product-c"], ["clashing", "product-b"]]) {
    await unDark(); await accent(key);
    const L = await readTokens(); const D = await goDark(); await unDark();
    cases.push([name, L, D]);
  }
  for (const [n, L, D] of cases) {
    const [s40, s45, s50, s55, s60] = L.ramp, [d40, d45, d50, d55, d60] = D.ramp;
    /* 라이트는 50 이 면이고 상태가 짙어지는 쪽(45·40)으로 간다. 다크도 50 이 면이고 밝아지는 쪽(55·60)으로 간다.
       밝은 제품만 라이트의 상태 방향이 뒤집힌다 — 어두운 글자인데 면이 더 어두워지면 글자 쪽으로 다가가 3.57 로 깨진다 */
    /* 라이트의 상태 방향이 제품 종류마다 다르다.
       기본은 50 에서 짙어지고(45·40), 밝은 제품은 어두운 글자라 밝아지며(55·60),
       중립 제품은 거의 검정에서 시작해 밝아진다(40 → 45 → 50) */
    const wantL = L.neutral ? [s40, s45, s50] : [s50, s45, s40];
    const wantD = [d50, d55, d60];
    ok(`the ${n} product follows the base-step rule in both themes`,
      L.surface === wantL[0] && L.strong === wantL[1] && L.heavy === wantL[2]
      && D.surface === wantD[0] && D.strong === wantD[1] && D.heavy === wantD[2],
      JSON.stringify({ light: [L.surface, L.strong, L.heavy], dark: [D.surface, D.strong, D.heavy], wantL, wantD }));
    ok(`the ${n} product never sets data-accent-light`, !L.light && !D.light, `${L.light} · ${D.light}`);
    /* 면 위 글자. 다크 rest 도 제품 HEX(brand-50)라 제품 색 제약이 받쳐 AA 다.
       상태는 밝아지는 쪽(55·60)이라 hover·pressed 는 4.5 아래로 내려가고, 게이트가 advisory 로 보고한다.
       중립 전환은 면이 밝은 회색이라 라벨을 뒤집고, 그쪽은 AA 를 요구한다.
       라이트는 제품 색 제약(흰 글자 4.5)이 받치므로 전부 AA 다 */
    for (const [theme, t] of [["light", L], ["dark", D]]) {
      if (theme === "dark" && !t.neutral) {
        ok(`dark ${n} brand label is white and its rest clears AA`,
          t.labelRgb === "rgb(255, 255, 255)" && ratio(t.surfaceRgb, t.labelRgb) >= 4.5,
          `rest ${ratio(t.surfaceRgb, t.labelRgb)} — 다크 면 brand-50 = 제품 HEX, hover·pressed 는 advisory`);
        continue;
      }
      for (const [st, fill] of [["rest", t.surfaceRgb], ["hover", t.strongRgb], ["pressed", t.heavyRgb]])
        ok(`${theme} ${n} Primary ${st} clears AA`, ratio(fill, t.labelRgb) >= 4.5, `${ratio(fill, t.labelRgb)} · ${fill} / ${t.labelRgb}`);
    }
    // 글자로 보정할 수 없는 자리 — 지표·포커스 링은 3:1, 패널 위 텍스트는 4.5
    ok(`dark ${n} brand graphic clears 3:1 on every surface`,
      Math.min(ratio(D.fgRgb, D.canvas), ratio(D.fgRgb, D.card), ratio(D.fgRgb, D.subtle)) >= 3,
      `${ratio(D.fgRgb, D.canvas)} · ${ratio(D.fgRgb, D.card)} · ${ratio(D.fgRgb, D.subtle)}`);
    ok(`dark ${n} brand text clears AA on the subtle background`, ratio(D.fgRgb, D.subtle) >= 4.5, `${ratio(D.fgRgb, D.subtle)}`);
    /* 옅은 제품 면(선택 행)은 알파라 캔버스 위에 합성해서 재야 한다 — 원문 값으로 재면 color-mix 문자열이 그대로 들어온다.
       기준 시스템의 5% 는 아주 옅어서 분리 바닥을 1.02 로 두었다(contrast.pairs.js) */
    ok(`dark ${n} selected background stays visible on the canvas`,
      ratio(D.subtleRgb, D.canvas, D.canvas) >= 1.02, `${ratio(D.subtleRgb, D.canvas, D.canvas)} · ${D.subtleRgb}`);
    // 다크의 반전 표면은 밝다 — 그 위의 제품색은 램프의 어두운 쪽이어야 묻히지 않는다
    ok(`dark ${n} inverse-surface brand clears AA`, ratio(D.invRgb, D.bgInverse) >= 4.5, `${ratio(D.invRgb, D.bgInverse)} · ${D.invRgb} / ${D.bgInverse}`);
  }
  ok("light base and clashing keep a white brand label",
    cases[0][1].labelRgb === "rgb(255, 255, 255)" && cases[2][1].labelRgb === "rgb(255, 255, 255)", `${cases[0][1].labelRgb} · ${cases[2][1].labelRgb}`);
  /* 라이트에서는 어떤 제품이든 흰 글자다 — 적응이 사라졌으므로 제품마다 다를 이유가 없다 */
  ok("every product keeps a white brand label in light", cases.every(([, L2]) => L2.labelRgb === "rgb(255, 255, 255)"),
    cases.map(([n2, L2]) => `${n2} ${L2.labelRgb}`).join(" · "));
  await accent("product-c");
  const backLight = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--surface-brand-primary").trim());
  ok("light keeps the product colour", backLight === "#008760", backLight);
  await accent("product-b");   // 뒤 케이스(Atomic 램프)가 중립 전환 상태를 전제한다 — 원복해 둔다

  // Atomic 의 Brand 램프도 함께 회색 — 제품 슬롯에서 파생되는 것은 전부 따라온다
  await go("foundations/colors.html");
  /* 스와치가 토큰을 따라오는지가 요점이다 — 색을 박아 두면 중립 단계를 조정할 때마다 깨진다.
     루트가 해석한 --brand-50 과 Atomic 스와치가 같은 색이어야 한다 */
  const ramp = await page.evaluate(() => {
    const at = document.querySelectorAll('[data-token="--brand-50"]');
    const d = document.createElement("div"); document.body.append(d);
    d.style.color = "var(--brand-50)"; const want = getComputedStyle(d).color; d.remove();
    return { n: at.length, bg: at.length ? getComputedStyle(at[0]).backgroundColor : "", want };
  });
  ok("Atomic Brand ramp follows the neutral switch", ramp.n === 1 && ramp.bg === ramp.want, JSON.stringify(ramp));
  const base = await accent("");
  ok("back to token accent clears the flag", !base.neutral, JSON.stringify(base));

  // Button: loading 은 마우스·키보드 클릭을 모두 막는다 (pointer-events:none 만으로는 Enter 가 통과했다)
  /* 정의(2026-10-28): disabled 와 달리 포커스는 남고 click · mousedown · pointerdown · keydown 넷을 막는다. Tab 은 통과해야 빠져나간다 */
  await go("components/button.html");
  await page.evaluate(() => { window.__hit = {}; document.querySelectorAll("#ex-button-loading .btn, #ex-button-state .btn").forEach((b) => ["click", "mousedown", "pointerdown", "keydown"].forEach((t) => b.addEventListener(t, () => { window.__hit[t] = (window.__hit[t] || 0) + 1; }))); });
  const loadBtn = page.locator("#ex-button-loading .btn.loading").first();
  ok("loading button carries aria-busy", (await loadBtn.getAttribute("aria-busy")) === "true");
  await loadBtn.evaluate((e) => e.focus());
  ok("loading button keeps focus (not disabled)", await loadBtn.evaluate((e) => document.activeElement === e && !e.disabled));
  await page.keyboard.press("Enter"); await page.keyboard.press("Space"); await page.keyboard.press("a");
  await loadBtn.evaluate((e) => { e.click(); e.dispatchEvent(new MouseEvent("mousedown", { bubbles: true })); e.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })); });
  await page.waitForTimeout(80);
  const loadHit = await page.evaluate(() => window.__hit);
  ok("loading blocks click · mousedown · pointerdown · keydown", Object.keys(loadHit).length === 0, JSON.stringify(loadHit));
  /* 실제 마우스 클릭 — pointer-events:none 이던 때는 클릭이 버튼을 지나 뒤의 요소(행 · 카드)에서 실행됐다 */
  await page.evaluate(() => { window.__parent = 0; document.querySelector("#ex-button-loading .example-preview").addEventListener("click", () => window.__parent++); });
  await loadBtn.click(); await page.waitForTimeout(60);
  ok("a real click on a loading button reaches neither it nor its parent", (await page.evaluate(() => window.__parent)) === 0 && !(await page.evaluate(() => window.__hit.click)), JSON.stringify(await page.evaluate(() => [window.__parent, window.__hit])));
  /* 이동 키 · 단축키는 문서까지 올라가야 한다 — 끊으면 화살표 이동 · 전역 단축키가 loading 동안 멈춘다 */
  await page.evaluate(() => { window.__doc = []; document.addEventListener("keydown", (e) => window.__doc.push(e.key + (e.ctrlKey ? "+ctrl" : ""))); });
  await loadBtn.evaluate((e) => e.focus());
  await page.keyboard.press("ArrowDown"); await page.keyboard.press("a"); await page.keyboard.press("Control+k");
  const docKeys = (await page.evaluate(() => window.__doc)).filter((k) => !/^(Control|Meta|Alt|Shift)/.test(k));   // 수정 키 자체의 keydown 은 ctrlKey 가 켜져 통과한다 — 단축키의 일부라 맞다
  ok("loading lets navigation keys and shortcuts through, stops the rest", docKeys.join() === "ArrowDown,k+ctrl", JSON.stringify(docKeys));
  await page.keyboard.press("Tab"); await page.waitForTimeout(60);
  ok("Tab still leaves a loading button", await loadBtn.evaluate((e) => document.activeElement !== e));
  await page.locator("#ex-button-state .btn").first().evaluate((e) => e.click());
  await page.waitForTimeout(60);
  ok("a normal button still fires", (await page.evaluate(() => window.__hit.click)) === 1);
  // danger 는 color:#fff 가 하드코딩이라 다크에서 바탕이 밝아지며 2.77:1 까지 떨어졌다.
  for (const theme of ["light", "dark"]) {
    await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
    await page.waitForTimeout(250);
    const col = await page.evaluate(() => {
      /* 아웃라인은 면이 투명하다 — 뒤에 있는 첫 불투명 조상을 찾아야 한다. 투명값을 그대로 재면 검은색과 비교된다 */
      /* 반투명 조상을 만나면 멈추지 않고 쌓는다 — 멈추면 알파가 무시돼 아웃라인 라벨이 엉뚱한 바탕과 비교된다 */
      const backdrop = (el) => {
        const stack = [];
        for (let e = el; e; e = e.parentElement) {
          const b = getComputedStyle(e).backgroundColor;
          if (!b) continue;
          const a = b.indexOf("/") >= 0 ? parseFloat(b.slice(b.indexOf("/") + 1)) : (b.startsWith("rgba") ? parseFloat(b.split(",")[3]) : 1);
          if (!(a > 0)) continue;
          stack.push(b);
          if (a >= 0.999) break;
        }
        return stack;
      };
      const solid = document.querySelector("#ex-button-variant .btn.solid.negative");
      const outline = document.querySelector("#ex-button-variant .btn.outline.negative");
      const cs = getComputedStyle(solid), co = getComputedStyle(outline);
      /* 솔리드 danger 도 이제 틴트다 — 뒤의 불투명 면까지 쌓아야 실제 색이 나온다 */
      return { sf: cs.color, sbStack: backdrop(solid), of: co.color, obStack: backdrop(outline) };
    });
    const dc = { solid: ratio(col.sf, bedOf(col.sbStack)), outline: ratio(col.of, bedOf(col.obStack)) };
    /* 파괴적 버튼의 라벨은 기준 시스템과 같은 상태색이다(태그는 중립 라벨을 쓴다 — 밀도가 다르다).
       그 값이 라이트에서 AA 아래라는 사실은 숨기지 않고 여기서도 숫자로 남기고, 게이트가 advisory 로 보고한다.
       대신 '라벨이 바탕에서 보이기는 하는가'(3:1)는 양쪽 테마에서 요구한다 — 그 아래로 가면 버튼이 비활성으로 읽힌다 */
    ok(`negative button label stays visible on its tint (${theme})`, dc.solid >= 3 && dc.outline >= 3, JSON.stringify(dc));
  }
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
  await page.waitForTimeout(200);

  /* 눌림 — 종전 단정은 이 상태를 **하나도 재지 않았다**. 그래서 .btn.danger(지금 solid negative) 의 테두리를 지웠을 때
     눌림이 hover 와 같은 색이 된 것도, .btn.text 의 눌림이 제품색에서 중립색으로 튀던 것도 통과했다.
     알파 틴트라 반드시 뒤 배경까지 쌓아 합성해야 한다 — 원문 값으로 재면 알파만 다른 같은 색이라 1.000 이 나온다.
     방향까지 보는 이유: 중립 컨트롤은 hover 가 불투명 페이지 배경이라 다크에서 어두워졌다가
     눌림에서 다시 밝아지는 뒤집힘이 있었다 */
  const EFF = (sel) => {
    const parse = (c) => { const sr = c.indexOf("color(srgb") === 0; const k = sr ? 255 : 1;
      const v = (c.match(/[0-9.]+/g) || [0, 0, 0, 0]).map(Number);
      return { r: v[0] * k, g: v[1] * k, b: v[2] * k, a: v.length > 3 ? v[3] : (c === "transparent" ? 0 : 1) }; };
    const el = document.querySelector(sel); const stack = [];
    for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor);
      if (c.a > 0) stack.push(c); if (c.a >= 0.999) break; }
    if (!stack.length || stack[stack.length - 1].a < 0.999) stack.push({ r: 255, g: 255, b: 255, a: 1 });
    let out = stack.pop();
    while (stack.length) { const t = stack.pop(); out = { r: t.r * t.a + out.r * (1 - t.a), g: t.g * t.a + out.g * (1 - t.a), b: t.b * t.a + out.b * (1 - t.a), a: 1 }; }
    return `rgb(${Math.round(out.r)}, ${Math.round(out.g)}, ${Math.round(out.b)})`;
  };
  for (const [sel, name] of [["#ex-button-variant .btn.solid.negative", "solid negative"], ["#ex-button-text .btn.text:not(.assistive)", "text"], ["#ex-button-text .btn.text.assistive", "text assistive"], ["#ex-button-variant .btn.outline.primary", "outline primary"], ["#ex-button-icon-only .btn.assistive.icon-only:not(.outline)", "plain icon-only assistive"]]) {
    for (const [theme, set] of [["light", null], ["dark", "dark"]]) {
      await page.evaluate((t) => { t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"); }, set);
      /* 테마를 바꾸기 전에 hover 를 반드시 푼다 — 마우스가 남아 있으면 rest 를 hover 로 읽는다 */
      await page.mouse.move(2, 2); await page.waitForTimeout(280);
      const el = page.locator(sel).first();
      await el.evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }));
      await page.mouse.move(2, 2); await page.waitForTimeout(240);
      const read = () => page.evaluate(EFF, sel);
      const rest = await read();
      await el.hover(); await page.waitForTimeout(280); const hov = await read();
      await page.mouse.down(); await page.waitForTimeout(280); const act = await read(); await page.mouse.up();
      await page.mouse.move(2, 2); await page.waitForTimeout(240);
      const L = (c) => { const v = c.match(/[0-9.]+/g).map(Number); const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
        return 0.2126 * f(v[0]) + 0.7152 * f(v[1]) + 0.0722 * f(v[2]); };
      const d1 = Math.sign(L(hov) - L(rest)), d2 = Math.sign(L(act) - L(hov));
      ok(`${theme} ${name} button has three distinct states`, new Set([rest, hov, act]).size === 3, `${rest} → ${hov} → ${act}`);
      ok(`${theme} ${name} button states run in one direction`, d1 !== 0 && d1 === d2, `${d1} · ${d2} — ${rest} → ${hov} → ${act}`);
    }
  }
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
  await page.mouse.move(2, 2); await page.waitForTimeout(220);
  // 아웃라인 negative(옛 .danger.secondary)는 :hover 를 덮어 아무 반응이 없었다
  const od = page.locator("#ex-button-variant .btn.outline.negative");
  const odBase = await od.evaluate((e) => getComputedStyle(e).backgroundColor);
  await od.hover(); await page.waitForTimeout(200);
  const odHover = await od.evaluate((e) => getComputedStyle(e).backgroundColor);
  await page.mouse.move(0, 0); await page.waitForTimeout(150);
  ok("outline negative reacts to hover", odBase !== odHover, odBase + " → " + odHover);
  // .btn.text 의 pressed — 기본·다크·중립 셋 다 hover 와 달라야 한다(--surface-brand-subtle 은 중립에서 hover 와 같아졌다)
  const textPress = async (label) => {
    const t = page.locator("#ex-button-text .btn.text:not(.assistive)").last();
    await t.hover(); await page.waitForTimeout(180);
    const h = await t.evaluate((e) => getComputedStyle(e).backgroundColor);
    await page.mouse.down(); await page.waitForTimeout(180);
    const a = await t.evaluate((e) => getComputedStyle(e).backgroundColor);
    await page.mouse.up(); await page.mouse.move(0, 0); await page.waitForTimeout(120);
    ok(`text button pressed differs from hover (${label})`, h !== a, h + " → " + a);
  };
  await textPress("light");
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark")); await page.waitForTimeout(250);
  await textPress("dark");
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme")); await page.waitForTimeout(200);
  // 스피너 상단색이 변형별로 달라야 한다(text 는 흰 스피너가 투명 바탕에 묻혔다)
  const spin = await page.evaluate(() => {
    const prev = document.querySelector("#ex-button-state .example-preview");
    const out = {};
    for (const [v, cls] of [["primary", "solid primary"], ["assistive", "outline assistive"], ["text", "text"], ["negative", "solid negative"]]) {
      const b2 = document.createElement("button");
      b2.type = "button"; b2.className = "btn md " + cls + " loading"; b2.textContent = "저장";
      prev.append(b2);
      out[v] = getComputedStyle(b2, "::after").borderTopColor;
      b2.remove();
    }
    out.canvas = getComputedStyle(document.body).backgroundColor;
    return out;
  });
  /* text 변형은 바탕이 투명이라, 흰 스피너를 그대로 쓰면 캔버스에 묻힌다(종전 1.10:1).
     'assistive 와 같은 색인가'로 재던 것을 **묻히지 않는가**로 바꾼다 — 그게 원래 지키려던 것이고,
     제품색 토큰의 단계가 바뀌어도 살아남는다 */
  ok("loading spinner follows the variant", spin.text !== spin.primary && ratio(spin.text, spin.canvas) >= 3,
    `${ratio(spin.text, spin.canvas)} · ${JSON.stringify(spin)}`);
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
  await page.waitForTimeout(250);
  const spinDark = await page.evaluate(() => {
    const prev = document.querySelector("#ex-button-state .example-preview");
    const out = {};
    for (const v of ["primary", "negative"]) {
      const b2 = document.createElement("button");
      b2.type = "button"; b2.className = "btn md solid " + v + " loading"; b2.textContent = "저장";
      prev.append(b2);
      out[v] = { arc: getComputedStyle(b2, "::after").borderTopColor, fill: getComputedStyle(b2).backgroundColor,
        bed: getComputedStyle(document.documentElement).getPropertyValue("--background-neutral-primary").trim() };
      b2.remove();
    }
    return out;
  });
  // 스피너는 자기 버튼 바탕 위에 있다 — 글자색(--brand-label·--foreground-neutral-primary)이 제품 밝기에 따라 흰/어두움으로 뒤집히므로 색을 박지 않고 대비로 본다
  /* negative 는 틴트 바탕이라 뒤의 불투명 면까지 쌓아야 실제 색이 나온다 — 알파 바탕을 그대로 재면 자기 자신과 비교된다 */
  for (const v of ["primary", "negative"])
    ok(`dark ${v} loading spinner stands out on its own fill`, ratio(spinDark[v].arc, spinDark[v].fill, spinDark[v].bed) >= 3,
      `${ratio(spinDark[v].arc, spinDark[v].fill, spinDark[v].bed)} · ${JSON.stringify(spinDark[v])}`);
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
  await page.waitForTimeout(200);
  // 입력과 버튼이 같은 포커스 링을 쓰는지 — 입력만 4px 10% 헤일로였다
  const ringOf = async (url, sel) => {
    await go(url);
    await page.locator(sel).first().evaluate((e) => e.focus());
    await page.keyboard.press("Tab"); await page.keyboard.press("Shift+Tab"); await page.waitForTimeout(200);
    return page.locator(sel).first().evaluate((e) => { const c = getComputedStyle(e); return c.outlineWidth + " " + c.outlineStyle + " " + c.outlineColor; });
  };
  const ringBtn = await ringOf("components/button.html", "#ex-button-variant .btn.solid.primary");
  const ringInput = await ringOf("components/text-field.html", "#ex-text-field-basic input");
  /* 값 입력 필드는 외곽선 대신 2px brand 가장자리 + 4px 후광을 쓴다(사람의 결정 2026-10-26) — 버튼은 외곽선 그대로, 필드는 외곽선을 끈다 */
  ok("button keeps the 1px focus outline while value fields turn it off", /^1px solid/.test(ringBtn) && /none/.test(ringInput), ringBtn + " vs " + ringInput);   // 외곽선 2px → 1px(사람의 결정 2026-10-26)
  // 입력은 마우스 클릭에도 링이 떠야 한다(버튼은 아니어야 한다)
  await page.locator("#ex-text-field-basic input").first().click(); await page.waitForTimeout(200);
  const clickRing = await page.evaluate(() => { const i = document.querySelector("#ex-text-field-basic input"); return { fv: i.matches(":focus-visible"), shadow: getComputedStyle(i).boxShadow }; });
  ok("input keeps its ring on mouse click", clickRing.fv && /0px 0px 0px 4px/.test(clickRing.shadow), JSON.stringify(clickRing));   // 링은 :focus 의 box-shadow 라 클릭에도 뜬다
  await go("components/button.html");
  const lgIcon = await page.evaluate(() => {
    const b2 = document.querySelector("#ex-button-icon-only .btn.icon-only.lg");
    if (!b2) return { 없음: true };
    const r = b2.getBoundingClientRect(), svg = b2.querySelector("svg").getBoundingClientRect();
    return { 버튼: Math.round(r.width) + "x" + Math.round(r.height), 아이콘: Math.round(svg.width) };
  });
  ok("lg icon button renders at 48 with a 20px icon", lgIcon.버튼 === "48x48" && lgIcon.아이콘 === 20, JSON.stringify(lgIcon));
  /* State 예제의 고정 상태(data-state, 사이트 전용 — build.js 가 :hover · :active 에서 생성)가 실제 hover · pressed 와 같은 색인가 */
  const forced = [];
  for (const v of ["solid.primary", "outline.primary", "solid.assistive", "outline.assistive"]) {
    const base = page.locator(`#ex-button-state .btn.${v}:not([data-state]):not([disabled])`);
    await base.scrollIntoViewIfNeeded(); await base.hover(); await page.waitForTimeout(260);
    const realHover = await base.evaluate((e) => [getComputedStyle(e).backgroundColor, getComputedStyle(e).borderTopColor].join());
    await page.mouse.down(); await page.waitForTimeout(260);
    const realPress = await base.evaluate((e) => [getComputedStyle(e).backgroundColor, getComputedStyle(e).borderTopColor].join());
    await page.mouse.up(); await page.mouse.move(1, 1); await page.waitForTimeout(260);
    const fake = await page.evaluate((v) => ["hover", "pressed"].map((st) => { const e = document.querySelector(`#ex-button-state .btn.${v}[data-state="${st}"]`); return [getComputedStyle(e).backgroundColor, getComputedStyle(e).borderTopColor].join(); }), v);
    forced.push({ v, ok: fake[0] === realHover && fake[1] === realPress, realHover, realPress, fake });
  }
  ok("State example's fixed Hover · Pressed match the real states", forced.every((f) => f.ok), JSON.stringify(forced.filter((f) => !f.ok)));
  /* 버튼 · Text Field · Date Picker 필드는 같은 32 · 40 · 48 이다(사람의 결정 2026-10-28) — 나란히 놓으면 맞아야 한다 */
  const heights = await page.evaluate(() => {
    const prev = document.querySelector("#ex-button-size .example-preview"), out = {};
    for (const z of ["sm", "md", "lg"]) {
      const box = document.createElement("div");
      box.innerHTML = `<button type="button" class="btn ${z} solid primary">a</button><div class="field ${z}"><input></div><div class="field ${z}"><div class="affix"><input></div></div><div class="datepicker field ${z}"><div class="affix"><input value="2026. 10. 28"><button type="button" class="cal-btn" aria-label="달력 열기"></button></div></div>`;   /* 2026-11-09 버튼형 필드를 없앰 — 입력형 상자 */
      prev.append(box);
      out[z] = [box.querySelector(".btn"), box.querySelector(".field > input"), box.querySelector(".field:not(.datepicker) .affix"), box.querySelector(".datepicker .affix")].map((e) => Math.round(e.getBoundingClientRect().height));
      box.remove();
    }
    return out;
  });
  ok("button and field heights match at 32 · 40 · 48", ["sm", "md", "lg"].every((z, i) => heights[z].every((h) => h === [32, 40, 48][i])), JSON.stringify(heights));
  const plainRest = await page.evaluate(() => { const c = getComputedStyle(document.querySelector("#ex-button-icon-only .btn.assistive.icon-only:not(.outline)")); return c.backgroundColor + " / " + c.borderTopColor; });
  ok("plain icon-only button has no fill or border at rest", plainRest === "rgba(0, 0, 0, 0) / rgba(0, 0, 0, 0)", plainRest);
  // 링크는 disabled 속성을 못 가진다 — React as="a" + disabled 는 aria-disabled 로만 나왔고 CSS·JS 가 그걸 몰랐다
  await page.evaluate(() => {
    const prev = document.querySelector("#ex-button-state .example-preview");
    prev.insertAdjacentHTML("beforeend", '<a href="#dead" id="dis-link" class="btn md solid primary" aria-disabled="true">비활성 링크</a>');
    window.__navHit = 0;
    document.getElementById("dis-link").addEventListener("click", () => window.__navHit++);
  });
  const disLink = await page.evaluate(() => {
    const e = document.getElementById("dis-link"); const c = getComputedStyle(e);
    const res = (t) => { const d = document.createElement("div"); d.style.color = t; document.body.append(d); const v = getComputedStyle(d).color; d.remove(); return v; };
    return { opacity: c.opacity, pointerEvents: c.pointerEvents, focusable: e.tabIndex >= 0,
      bg: c.backgroundColor, fg: c.color, wantBg: res("var(--surface-disable-primary)"), wantFg: res("var(--foreground-disable-primary)") };
  });
  // 비활성은 더 이상 opacity 를 쓰지 않는다 — 전용 토큰이라 opacity 는 1 이고 면·라벨이 회색으로 바뀐다
  ok("disabled link button looks disabled", disLink.opacity === "1" && disLink.bg === disLink.wantBg && disLink.fg === disLink.wantFg && disLink.pointerEvents === "none" && disLink.focusable, JSON.stringify(disLink));
  await page.locator("#dis-link").evaluate((e) => e.click());
  await page.waitForTimeout(120);
  ok("disabled link button ignores a mouse click", (await page.evaluate(() => location.hash)) !== "#dead");
  // pointer-events:none 는 마우스만 막는다 — 이 케이스가 ds.js 캡처 가드를 밟는 유일한 경로
  await page.locator("#dis-link").evaluate((e) => e.focus());
  await page.keyboard.press("Enter"); await page.waitForTimeout(150);
  ok("disabled link button ignores Enter", (await page.evaluate(() => location.hash)) !== "#dead", await page.evaluate(() => location.hash || "(없음)"));
  // text 변형은 다크 패널 위에서 4.08 이었다 — --foreground-brand-primary 가 한 단계 밝게 잡는다
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
  await page.waitForTimeout(250);
  const textDark = await page.evaluate(() => {
    const e = document.querySelector("#ex-button-text .btn.text");
    const res = (tok) => { const d = document.createElement("div"); d.style.color = tok; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; };
    return { fg: getComputedStyle(e).color, subtle: res("var(--background-neutral-secondary)"), canvas: res("var(--background-neutral-primary)") };
  });
  ok("text button meets AA on the dark subtle background", ratio(textDark.fg, textDark.subtle) >= 4.5 && ratio(textDark.fg, textDark.canvas) >= 4.5,
    `subtle ${ratio(textDark.fg, textDark.subtle)} · canvas ${ratio(textDark.fg, textDark.canvas)}`);
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
  await page.waitForTimeout(200);

  // --foreground-brand-primary 는 두 테마 모두 봐야 한다 — 밝은 제품은 라이트에서 600 으로 쓰면 패널 위 2.58 이었다
  for (const key of ["", "product-a", "product-b"]) {
    await accent(key);
    for (const [theme, set] of [["light", null], ["dark", "dark"]]) {
      await page.evaluate((t) => { t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"); }, set);
      await page.waitForTimeout(250);
      const at = await page.evaluate(() => {
        const res = (t) => { const d = document.createElement("div"); d.style.color = t; document.body.append(d); const v = getComputedStyle(d).color; d.remove(); return v; };
        return { fg: res("var(--foreground-brand-primary)"), cv: res("var(--background-neutral-primary)"), sf: res("var(--surface-elevated-primary)"), pn: res("var(--background-neutral-secondary)") };
      });
      const low = Math.min(ratio(at.fg, at.cv), ratio(at.fg, at.sf), ratio(at.fg, at.pn));
      ok(`${theme} accent-text clears AA on every surface (${key || "base"})`, low >= 4.5, `${low} · ${at.fg}`);
    }
    await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
    await page.waitForTimeout(150);
  }
  await accent("");

  /* 상태색 세 가족 — 기준 시스템에는 솔리드 상태 면도 그 위 글자(-on)도 없다.
     면은 8%·12% 틴트뿐이고, 색은 전경(foreground)과 보더(line)가 나른다.
     그래서 여기서 보는 것은 세 가지다: 틴트가 바탕에서 보이는가 · 전경이 솔리드인가 ·
     **그 틴트 위에 올라앉는 실제 라벨이 읽히는가**. 세 번째가 틴트 재디자인의 핵심 보증이다 */
  const FAM = ["positive", "cautionary", "negative"];
  const statusTokens = () => page.evaluate((fam) => {
    const r = getComputedStyle(document.documentElement); const g = (n) => r.getPropertyValue(n).trim();
    const res = (t) => { const d = document.createElement("div"); d.style.color = t; document.body.append(d); const v = getComputedStyle(d).color; d.remove(); return v; };
    const out = {
      canvas: res("var(--background-neutral-primary)"), surface: res("var(--surface-elevated-primary)"), subtle: res("var(--background-neutral-secondary)"),
      label: res("var(--foreground-neutral-primary)"),
    };
    for (const f of fam) out[f] = {
      surface: g("--surface-" + f + "-primary"), fg: g("--foreground-" + f + "-primary"), line: g("--line-" + f + "-primary"),
      surfaceRgb: res("var(--surface-" + f + "-primary)"), fgRgb: res("var(--foreground-" + f + "-primary)"),
      lineRgb: res("var(--line-" + f + "-primary)"),
    };
    return out;
  }, FAM);
  for (const [theme, set] of [["light", null], ["dark", "dark"]]) {
    await page.evaluate((t) => { t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"); }, set);
    await page.waitForTimeout(250);
    const st = await statusTokens();
    for (const f of FAM) {
      const t = st[f];
      /* 면·전경·보더 셋이 다 있어야 한다. 면과 보더는 알파, 전경은 솔리드 — 기준 시스템이 그렇게 선언한다 */
      ok(`${theme} ${f} has a tint, a foreground and a line`, !!(t.surface && t.fg && t.line), JSON.stringify([t.surface, t.fg, t.line]));
      ok(`${theme} ${f} foreground is opaque`, !/rgba|\/\s*0?\.\d/.test(t.fgRgb), t.fgRgb);
      /* 틴트가 세 바탕 모두에서 보여야 한다 — 안 보이면 태그가 아예 없는 것과 같다 */
      const seen = Math.min(ratio(t.surfaceRgb, st.canvas, st.canvas), ratio(t.surfaceRgb, st.surface, st.surface), ratio(t.surfaceRgb, st.subtle, st.subtle));
      ok(`${theme} ${f} tint stays visible on every surface`, seen >= 1.05, String(seen));
      /* 틴트 위의 **라벨**이 읽히는가 — 라벨은 중립 글자색이다(기준 시스템의 Chip 패턴).
         상태색 전경을 라벨로 쓰면 라이트에서 2.1~3.4 로 떨어진다. 그 차이를 숫자로 같이 남긴다 */
      const onTint = Math.min(ratio(st.label, t.surfaceRgb, st.canvas), ratio(st.label, t.surfaceRgb, st.subtle));
      const ifColoured = Math.min(ratio(t.fgRgb, t.surfaceRgb, st.canvas), ratio(t.fgRgb, t.surfaceRgb, st.subtle));
      ok(`${theme} ${f} tag label clears AA on its own tint`, onTint >= 4.5,
        `중립 라벨 ${onTint} · 상태색 라벨이었다면 ${ifColoured}`);
    }
  }
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
  await page.waitForTimeout(200);

  // 비활성은 변형과 무관하게 한 가지 회색으로 수렴한다 — fill 은 회색 면, outline 은 면을 비우고 보더만 회색
  const disabledSet = () => page.evaluate(() => {
    const prev = document.querySelector("#ex-button-disabled .example-preview") || document.querySelector("#ex-button-state .example-preview");
    const res = (t) => { const d = document.createElement("div"); d.style.color = t; document.body.append(d); const v = getComputedStyle(d).color; d.remove(); return v; };
    const want = { fill: res("var(--surface-disable-primary)"), fg: res("var(--foreground-disable-primary)") };
    const out = { want, v: {} };
    for (const [n, cls] of [["solid-primary", "solid primary"], ["solid-assistive", "solid assistive"], ["solid-negative", "solid negative"], ["outline-primary", "outline primary"], ["outline-assistive", "outline assistive"], ["outline-negative", "outline negative"], ["text", "text"], ["plain", "assistive icon-only"]]) {
      const b = document.createElement("button"); b.type = "button"; b.className = "btn md " + cls; b.disabled = true; b.textContent = "x";
      prev.append(b); const c = getComputedStyle(b);
      out.v[n] = { bg: c.backgroundColor, fg: c.color, border: c.borderTopColor, opacity: c.opacity };
      b.remove();
    }
    return out;
  });
  for (const [theme, set] of [["light", null], ["dark", "dark"]]) {
    await page.evaluate((t) => { t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"); }, set);
    await page.waitForTimeout(250);
    const d = await disabledSet();
    const TRANSPARENT = "rgba(0, 0, 0, 0)";
    ok(`${theme} disabled fill uses the disabled tokens`,
      ["solid-primary", "solid-assistive", "solid-negative"].every((n) => d.v[n].bg === d.want.fill && d.v[n].fg === d.want.fg && d.v[n].opacity === "1"), JSON.stringify(d));
    ok(`${theme} disabled outline empties the fill and greys the border`,
      ["outline-primary", "outline-assistive", "outline-negative"].every((n) => d.v[n].bg === TRANSPARENT && d.v[n].border === d.want.fill && d.v[n].fg === d.want.fg), JSON.stringify(d.v));
    ok(`${theme} disabled text and plain icon-only stay transparent`, ["text", "plain"].every((n) => d.v[n].bg === TRANSPARENT && d.v[n].fg === d.want.fg), JSON.stringify([d.v.text, d.v.plain]));
  }
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
  await page.waitForTimeout(200);

  // 중립 버튼의 rest·hover·pressed 가 실제로 서로 다른 색이어야 한다 — 라이트 solid assistive(옛 tertiary)는 불투명 면 때문에 hover 가 보이지 않았다
  for (const [theme, set] of [["light", null], ["dark", "dark"]]) {
    await page.evaluate((t) => { t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"); }, set);
    await page.waitForTimeout(250);
    for (const [n, cls] of [["outline assistive", "outline assistive"], ["solid assistive", "solid assistive"], ["outline primary", "outline primary"], ["text", "text"], ["text assistive", "text assistive"], ["plain icon-only", "assistive icon-only"]]) {
      await page.evaluate((c) => {
        const prev = document.querySelector("#ex-button-variant .example-preview");
        const b = document.createElement("button"); b.type = "button"; b.id = "hv-probe"; b.className = "btn md " + c; b.textContent = "probe";
        prev.append(b);
      }, cls);
      const rest = await page.evaluate(() => getComputedStyle(document.getElementById("hv-probe")).backgroundColor);
      await page.locator("#hv-probe").hover(); await page.waitForTimeout(160);
      const hover = await page.evaluate(() => getComputedStyle(document.getElementById("hv-probe")).backgroundColor);
      await page.mouse.down(); await page.waitForTimeout(160);
      const active = await page.evaluate(() => getComputedStyle(document.getElementById("hv-probe")).backgroundColor);
      await page.mouse.up();
      await page.evaluate(() => document.getElementById("hv-probe").remove());
      ok(`${theme} ${n} shows three distinct state fills`, new Set([rest, hover, active]).size === 3, `${rest} → ${hover} → ${active}`);
    }
  }
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
  await page.waitForTimeout(200);

  // 심각도 — 면/글자/면 위 글자가 나뉘어 있어야 한다. 종전에는 .tag.solid{color:#fff} 한 줄이 다섯 색을 덮어 10 조합 중 8이 미달이었고,
  // 기본형 태그는 글자를 면 토큰으로 써서 라이트에서 다섯 중 넷이 미달이었다. 이 축에는 테스트가 아예 없었다
  await go("components/tag.html");
  /* 심각도 다섯 등급(2026-11-06) + 상태 톤 pending — pending 은 등급이 아니라 '서로 다른 색' 단정에서는 뺀다 */
  const LVL = ["critical", "high", "medium", "low", "info"], TAGS = [...LVL, "pending"];
  const tagSet = () => page.evaluate((lvl) => {
    const prev = document.querySelector("#ex-tag-severity .example-preview");
    const res = (t) => { const d = document.createElement("div"); d.style.color = t; document.body.append(d); const v = getComputedStyle(d).color; d.remove(); return v; };
    const out = { v: {}, tok: {} };
    for (const l of lvl) {
      /* 다크의 -bg 는 rgba 리터럴이다 — 그대로 재면 알파가 무시되고 자기 자신과 비교돼 1.00 이 나온다.
         뒤의 불투명 바탕까지 쌓아 합성한 실제 색을 따로 구한다 */
      /* color-mix 토큰은 Chromium 이 color(srgb r g b / a) 로 직렬화하고 그 값은 0~1 이다 —
         숫자만 긁어 쓰면 거의 검정으로 읽혀 합성 바탕이 엉뚱해진다(다크 fill 이 전부 color-mix 다) */
      const parse = (c) => { const srgb = c.indexOf("color(srgb") === 0; const k = srgb ? 255 : 1;
        const v = c.match(/[0-9.]+/g).map(Number);
        return { r: v[0] * k, g: v[1] * k, b: v[2] * k, a: v.length > 3 ? v[3] : 1 }; };
      const eff = (el) => {
        const stack = [];
        for (let e = el; e; e = e.parentElement) {
          const c = parse(getComputedStyle(e).backgroundColor);
          if (c.a > 0) stack.push(c);
          if (c.a === 1) break;
        }
        if (!stack.length || stack[stack.length - 1].a !== 1) stack.push({ r: 255, g: 255, b: 255, a: 1 });
        let out = stack.pop();
        while (stack.length) { const t = stack.pop(); out = { r: t.r * t.a + out.r * (1 - t.a), g: t.g * t.a + out.g * (1 - t.a), b: t.b * t.a + out.b * (1 - t.a), a: 1 }; }
        return "rgb(" + Math.round(out.r) + ", " + Math.round(out.g) + ", " + Math.round(out.b) + ")";
      };
      const mk = (cls) => { const e = document.createElement("span"); e.className = cls; e.textContent = "x"; prev.append(e); const c = getComputedStyle(e);
        const r = { bg: c.backgroundColor, bgEff: eff(e), fg: c.color, dot: getComputedStyle(e, "::before").backgroundColor }; e.remove(); return r; };
      out.v[l] = { subtle: mk("tag " + l), solid: mk("tag " + l + " solid") };
      /* 심각도는 독립 축이 아니라 상태·강조 의도 매핑이다 —
         Critical=negative · High=cautionary · Critical 점=negative-strong · Medium=accent lime(점 foreground/accent/lime, 2026-11-09) · Low=accent light blue · Info=중립, 상태 Pending=accent cyan.
         라벨은 다섯 등급 모두 중립 글자색이고(기준 시스템의 Chip 패턴), 색은 점과 틴트가 나른다.
         dot = ::before 의 실제 배경색이다 — 토큰이 아니라 렌더된 색을 본다 */
      const DOT = { critical: "--foreground-negative-strong", high: "--foreground-cautionary-primary",
        medium: "--foreground-accent-lime", low: "--foreground-accent-light-blue", info: "--foreground-inactive-primary", pending: "--foreground-accent-cyan" }[l];
      const TINT = { critical: "--surface-negative-primary", high: "--surface-cautionary-primary",
        medium: "--surface-accent-lime", low: "--surface-accent-light-blue", info: "--surface-neutral-strong", pending: "--surface-accent-cyan" }[l];
      const SOLID = { critical: "--surface-negative-strong", high: "--surface-cautionary-primary",
        medium: "--surface-accent-lime", low: "--surface-accent-light-blue", info: "--surface-neutral-strong", pending: "--surface-accent-cyan" }[l];
      out.tok[l] = { dot: res("var(" + DOT + ")"), tint: res("var(" + TINT + ")"), surface: res("var(" + SOLID + ")"),
        label: res("var(--foreground-neutral-primary)") };
    }
    out.subtle = res("var(--background-neutral-secondary)"); out.canvas = res("var(--background-neutral-primary)"); out.surface = res("var(--surface-elevated-primary)");
    return out;
  }, TAGS);
  for (const [theme, set] of [["light", null], ["dark", "dark"]]) {
    await page.evaluate((t) => { t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"); }, set);
    await page.waitForTimeout(250);
    const t = await tagSet();
    for (const l of TAGS) {
      // 기본형 태그 — 옅은 바탕 위의 글자
      ok(`${theme} ${l} tag label clears AA on its own background`, ratio(t.v[l].subtle.fg, t.v[l].subtle.bgEff) >= 4.5,
        `${ratio(t.v[l].subtle.fg, t.v[l].subtle.bgEff)} · ${t.v[l].subtle.fg} / ${t.v[l].subtle.bgEff}(합성)`);
      // 채운 태그 — 면 위의 글자. info 를 포함해야 '규칙 누락'이 재발하지 않는다(종전엔 회색 패널에 흰 글자로 1.1 이었다)
      ok(`${theme} ${l} solid tag label clears AA on its fill`, ratio(t.v[l].solid.fg, t.v[l].solid.bgEff) >= 4.5,
        `${ratio(t.v[l].solid.fg, t.v[l].solid.bgEff)} · ${t.v[l].solid.fg} / ${t.v[l].solid.bgEff}`);
      // 채운 태그의 면이 자기 면 토큰이어야 한다 — 규칙이 빠지면 조용히 중립 면으로 떨어진다
      ok(`${theme} ${l} solid tag uses its own surface token`, t.v[l].solid.bg === t.tok[l].surface && t.v[l].solid.bg !== t.subtle,
        `${t.v[l].solid.bg} · surface ${t.tok[l].surface} · subtle ${t.subtle}`);
      /* 라벨은 네 등급 모두 중립 글자색이다 — 색은 점이 나른다. 점이 등급 색이어야 색 단서가 남는다 */
      ok(`${theme} ${l} tag carries its rank colour in the dot, not the label`,
        t.v[l].subtle.dot === t.tok[l].dot && t.v[l].subtle.fg === t.tok[l].label,
        `dot ${t.v[l].subtle.dot} / ${t.tok[l].dot} · label ${t.v[l].subtle.fg}`);
    }
    /* 다섯 등급은 색조로만 갈린다(빨강·주황·라임·라이트 블루·중립) — 휘도 분리는 요구하지 않는다.
       그래서 "서로 다른 색인가" 와 "색 말고 다른 단서가 있는가" 를 묻는다.
       라벨 병기는 verify 가 검사하고, 여기서는 점·틴트가 등급마다 다른지를 본다 */
    {
      const dots = LVL.map((l) => t.tok[l].dot);
      ok(`${theme} five severity ranks are five distinct colours`, new Set(dots).size === 5, dots.join(" · "));
      const tints = LVL.map((l) => t.v[l].subtle.bgEff);
      ok(`${theme} each rank has its own tint`, new Set(tints).size === 5, tints.join(" · "));
      /* 상태 pending 은 어느 심각도 점과도 같은 색이면 안 된다 — 옛 Medium(청록)을 물려받았다 */
      ok(`${theme} pending status tone differs from every severity dot`, !dots.includes(t.tok.pending.dot), t.tok.pending.dot);
    }
  }
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
  await page.waitForTimeout(200);
  /* 상태와 심각도는 클래스를 나눠 쓰지 않는다(2026-11-06) — '검토 대기'는 pending(청록), 심각도 Medium 은 라임.
     로그 레벨은 심각도라 INFO 는 info(중립) · LOW 는 low · WARN 은 medium 이다 */
  const pend = await page.evaluate(() => { const t = [...document.querySelectorAll("#ex-tag-status .tag")].find((e) => e.textContent.trim() === "검토 대기");
    return t ? { cls: t.className, dot: getComputedStyle(t, "::before").backgroundColor, cyan: (() => { const d = document.createElement("i"); d.style.color = "var(--foreground-accent-cyan)"; document.body.append(d); const v = getComputedStyle(d).color; d.remove(); return v; })() } : null; });
  ok("status 'pending review' tag uses the pending tone, not a severity rank", !!pend && /\bpending\b/.test(pend.cls) && !/\bmedium\b/.test(pend.cls) && pend.dot === pend.cyan, JSON.stringify(pend));
  await go("patterns/log-viewer.html");
  const logLv = await page.evaluate(() => [...document.querySelectorAll("#ex-log-viewer-viewer .log-row .tag")].map((t) => [t.textContent.trim(), [...t.classList].filter((c) => !["tag", "sm"].includes(c)).join(" ")]));
  const LV_WANT = { CRIT: "critical", HIGH: "high", WARN: "medium", LOW: "low", INFO: "info" };
  ok("log levels map onto the five severity ranks (INFO = info, LOW = low)", logLv.length >= 5 && logLv.every(([lv, c]) => LV_WANT[lv] === c) && new Set(logLv.map(([, c]) => c)).size === 5, JSON.stringify(logLv));
  await go("components/tag.html");

  // Accordion: disabled 는 마우스·키보드 양쪽을 막고 보조기기에도 알려야 한다 + name 그룹 단일 개방 + flat 마지막 줄
  await go("components/accordion.html");
  const accDis = page.locator("#ex-accordion-state .accordion.disabled");
  ok("disabled accordion carries aria-disabled", (await accDis.locator("summary").getAttribute("aria-disabled")) === "true");
  // pointer-events:none 이라 Playwright 의 click() 은 actionability 에서 멈춘다 — 요소에게 직접 클릭을 보낸다
  await accDis.locator("summary").evaluate((e) => e.click());
  await page.waitForTimeout(120);
  ok("disabled accordion ignores a mouse click", (await accDis.evaluate((e) => e.open)) === false);
  await accDis.locator("summary").evaluate((e) => e.focus());
  await page.keyboard.press("Enter"); await page.keyboard.press("Space");
  await page.waitForTimeout(120);
  ok("disabled accordion ignores Enter and Space", (await accDis.evaluate((e) => e.open)) === false);
  await page.locator("#ex-accordion-single .accordion").nth(1).locator("summary").evaluate((e) => e.click());
  await page.waitForTimeout(350);
  const accGrp = await page.evaluate(() => [...document.querySelectorAll("#ex-accordion-single .accordion")].map((d) => d.open));
  ok("name group keeps only one panel open", JSON.stringify(accGrp) === "[false,true,false]", JSON.stringify(accGrp));
  const accFlat = await page.evaluate(() => {
    const it = [...document.querySelectorAll("#ex-accordion-variant .accordion.flat")];
    return { last: getComputedStyle(it[it.length - 1]).borderBottomWidth, first: getComputedStyle(it[0]).borderBottomWidth };
  });
  ok("last flat row drops its bottom border", accFlat.last === "0px" && accFlat.first === "1px", JSON.stringify(accFlat));
  // 보간 중간값을 재면 경쟁 조건이 되므로 전환 선언 자체를 본다
  const accMotion = await page.evaluate(() => {
    const d = document.querySelector("#ex-accordion-default .accordion");
    return { prop: getComputedStyle(d, "::details-content").transitionProperty, size: getComputedStyle(d).interpolateSize };
  });
  ok("accordion body height is transitioned", /height/.test(accMotion.prop) && accMotion.size === "allow-keywords", JSON.stringify(accMotion));
  /* 정의(2026-10-29): 크기 sm 40 · md 52 · lg 60, Hover 는 헤더 면 --surface-neutral-secondary, Disabled 는 hover 없음 */
  const accH = await page.evaluate(() => [...document.querySelectorAll("#ex-accordion-size summary")].map((x) => Math.round(x.getBoundingClientRect().height)));
  ok("accordion header heights are 40 · 52 · 60", accH.join() === "40,52,60", JSON.stringify(accH));
  const accHov = page.locator("#ex-accordion-state .accordion:not(.disabled) summary").first();
  await accHov.scrollIntoViewIfNeeded(); await page.mouse.move(1, 1); await page.waitForTimeout(200);
  const accRest = await accHov.evaluate((e) => getComputedStyle(e).backgroundColor);
  await accHov.hover(); await page.waitForTimeout(260);
  const accOver = await accHov.evaluate((e) => ({ bg: getComputedStyle(e).backgroundColor, want: (() => { const d = document.createElement("div"); d.style.background = "var(--surface-neutral-secondary)"; document.body.append(d); const v = getComputedStyle(d).backgroundColor; d.remove(); return v; })() }));
  const accFixed = await page.evaluate(() => getComputedStyle(document.querySelector('#ex-accordion-state summary[data-state="hover"]')).backgroundColor);
  await page.mouse.move(1, 1); await page.waitForTimeout(200);
  ok("accordion header shows the hover fill, and the fixed Hover example matches it", accRest !== accOver.bg && accOver.bg === accOver.want && accFixed === accOver.bg, JSON.stringify({ accRest, accOver, accFixed }));
  ok("disabled accordion has no hover (pointer-events none)", (await accDis.evaluate((e) => getComputedStyle(e).pointerEvents)) === "none");
  /* 헤더 안 조작 요소는 약관 동의만 예외 — 체크박스를 누르면 체크만 바뀌고 아코디언은 펼쳐지지 않아야 한다 */
  await go("patterns/terms-agreement.html");
  const termsAcc = page.locator("#ex-terms-agreement-inline .accordion").first();
  const termsBefore = await termsAcc.evaluate((d) => ({ open: d.open, checked: d.querySelector("summary input").checked }));
  await termsAcc.locator("summary input").click(); await page.waitForTimeout(250);
  const termsAfter = await termsAcc.evaluate((d) => ({ open: d.open, checked: d.querySelector("summary input").checked }));
  ok("terms checkbox in an accordion header toggles the check only", termsAfter.open === termsBefore.open && termsAfter.checked !== termsBefore.checked, JSON.stringify({ termsBefore, termsAfter }));
  await go("components/accordion.html");
  const accHead = await page.evaluate(() => [...document.querySelectorAll("#ex-accordion-header summary")].map((s) => {
    const r = s.getBoundingClientRect(), cs = getComputedStyle(s), af = getComputedStyle(s, "::after"), svg = s.querySelector(":scope>svg"), sm = s.querySelector(":scope>small");
    const t = [...s.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim()), rg = document.createRange(); rg.selectNodeContents(t);
    const last = (sm || rg).getBoundingClientRect().right - r.left;   // 셰브론 앞 마지막 내용
    return { textX: Math.round(rg.getBoundingClientRect().left - r.left), want: Math.round(parseFloat(cs.paddingLeft) + (svg ? svg.getBoundingClientRect().width + parseFloat(cs.columnGap) : 0)), gap: cs.columnGap,
      chevR: Math.round(last + parseFloat(cs.columnGap) + parseFloat(af.marginLeft) + parseFloat(af.width)), edge: Math.round(r.width - parseFloat(cs.paddingRight)) };
  }));
  ok("accordion header: gap 8, title right after the leading icon (left-aligned), chevron at the right", accHead.length === 2 && accHead.every((h) => h.gap === "8px" && Math.abs(h.textX - h.want) <= 1 && Math.abs(h.chevR - h.edge) <= 1), JSON.stringify(accHead));

  // Select button, chip, tile
  await go("components/select-button.html");
  const sb = page.locator(".example-preview .select-btn").first();
  await sb.locator("button").nth(1).click();
  ok("select-btn switches", await sb.evaluate((e) => e.querySelectorAll("button.on").length === 1 && e.querySelectorAll("button")[1].getAttribute("aria-checked") === "true"));
  /* Select Button 정비(사람의 결정 2026-11-10) — radiogroup, Tab 한 번, 화살표로 옮기면 바로 고름 */
  {
    const B = page.locator(ex("select-button", "basic") + " .select-btn"), btns = B.locator("button");
    const st = () => B.evaluate((e) => { const k = [...e.querySelectorAll("button")]; return { on: k.findIndex((b) => b.classList.contains("on")), checked: k.findIndex((b) => b.getAttribute("aria-checked") === "true"), stops: k.filter((b) => b.tabIndex === 0).length, stop: k.findIndex((b) => b.tabIndex === 0), focus: k.indexOf(document.activeElement) }; });
    ok("select button keeps one tab stop on the selected item", await page.evaluate(() => [...document.querySelectorAll(".select-btn")].every((g) => { const k = [...g.children]; return g.getAttribute("role") === "radiogroup" && k.every((b) => b.getAttribute("role") === "radio" && !b.hasAttribute("aria-pressed")) && k.filter((b) => b.tabIndex === 0).length === 1; })));
    await btns.nth(1).focus(); await page.keyboard.press("ArrowRight"); let s = await st();
    ok("select button arrow moves focus and selects", s.on === 2 && s.checked === 2 && s.focus === 2 && s.stop === 2 && s.stops === 1, JSON.stringify(s));
    await B.evaluate((e) => { window.__sb = 0; e.addEventListener("ds:select", () => window.__sb++); });
    await page.keyboard.press("ArrowRight"); s = await st();
    ok("select button arrow wraps and reports the change", s.on === 0 && s.focus === 0 && (await page.evaluate(() => window.__sb)) === 1, JSON.stringify(s));
    await page.keyboard.press("Tab");
    ok("select button leaves the group with one Tab", await B.evaluate((e) => !e.contains(document.activeElement)));
    const D = page.locator(ex("select-button", "disabled") + " .select-btn button");
    await D.nth(1).click(); await page.keyboard.press("ArrowRight");
    ok("select button skips a disabled option", await D.evaluateAll((k) => k[0].classList.contains("on") && document.activeElement === k[0]));
  }
  await go("components/chip.html");
  const chip = page.locator(".example-preview button.chip[aria-pressed]").first();
  const before = await chip.getAttribute("aria-pressed");
  await chip.click();
  ok("chip toggles", (await chip.getAttribute("aria-pressed")) !== before);
  const xchips = page.locator(".example-preview .chip .x");
  const nx = await xchips.count();
  if (nx) { await xchips.first().click(); await page.waitForTimeout(250); ok("input chip removed", (await xchips.count()) === nx - 1); }
  /* 비활성 입력값 칩 — x 의 원 면을 없애고 비활성 글자색, 눌러도 지워지지 않는다(사람의 결정 2026-10-27) */
  const chipOff = await page.evaluate(() => { const c = document.querySelector("#ex-chip-size .example-preview .chip[aria-disabled=true]"), x = c && c.querySelector(".x"), d = document.createElement("div"); d.style.color = "var(--foreground-disable-primary)"; document.body.append(d); const want = getComputedStyle(d).color; d.remove();
    if (!x) return { missing: true }; const cs = getComputedStyle(x); return { bg: cs.backgroundColor, color: cs.color, want }; });
  await page.evaluate(() => document.querySelector("#ex-chip-size .example-preview .chip[aria-disabled=true] .x").click()); await page.waitForTimeout(250);   // dismiss 는 170ms 뒤에 지운다
  chipOff.kept = await page.evaluate(() => !!document.querySelector("#ex-chip-size .example-preview .chip[aria-disabled=true]"));
  ok("a disabled input chip dims its remove button and keeps the chip", chipOff.bg === "rgba(0, 0, 0, 0)" && chipOff.color === chipOff.want && chipOff.kept, JSON.stringify(chipOff));
  /* Chip 정비(사람의 결정 2026-11-10) — 지운 뒤 포커스 · 필터 초기화 · 줄바꿈 · 긴 값 */
  {
    await go("components/chip.html");
    const P = ex("chip", "input"), xs = page.locator(P + " .chip .x"), fx = () => page.evaluate(() => { const a = document.activeElement; return (a.getAttribute("aria-label") || a.textContent || a.tagName).trim(); });
    ok("input chip remove is a named real button", await xs.evaluateAll((k) => k.length === 3 && k.every((x) => x.tagName === "BUTTON" && x.tabIndex === 0) && new Set(k.map((x) => x.getAttribute("aria-label"))).size === 3));
    await xs.first().focus(); await page.keyboard.press("Enter"); await page.waitForTimeout(250);
    ok("removing a chip moves focus to the next chip", (await fx()) === "10.0.0.13 삭제" && (await xs.count()) === 2, await fx());
    await xs.nth(1).focus(); await xs.nth(1).click(); await page.waitForTimeout(250);
    const lastTo = await fx(); await page.keyboard.press("Enter"); await page.waitForTimeout(250);
    ok("removing a middle chip goes to the next spot, the add button once chips are gone", lastTo === "추가" && (await xs.count()) === 1, lastTo);
    const L = ex("chip", "long"), lb = page.locator(L + " .lbl").first(), lx = page.locator(L + " .x").first();
    const m = () => lb.evaluate((e) => ({ w: e.clientWidth, sw: e.scrollWidth }));
    const closed = await m(); await lx.focus(); const open = await m();
    ok("a long chip value truncates at 240 and opens on keyboard focus", closed.w === 240 && closed.sw > 240 && open.w >= closed.sw && open.sw === open.w, JSON.stringify({ closed, open }));
    await lx.blur();
    await page.locator(L + " .x").nth(1).click(); await page.waitForTimeout(250);
    ok("removing the last chip moves focus to the one before it", (await fx()).endsWith("corp.example.com 삭제"), await fx());
    await page.locator(L + " .x").first().click(); await page.waitForTimeout(250);
    ok("removing the only chip leaves focus on the group, not the page", await page.evaluate((sel) => document.activeElement === document.querySelector(sel + " .chip-group"), L));
    const F = page.locator(ex("chip", "filter") + " .chip-group"), R = F.locator("[data-chip-reset]");
    const fs0 = await F.evaluate((e) => { const c = e.querySelector(".chip").getBoundingClientRect(), r = e.querySelector("[data-chip-reset]").getBoundingClientRect(); return { c: c.height, r: r.height, hidden: e.querySelector("[data-chip-reset]").hidden }; });
    ok("filter reset shows while a chip is on and matches the chip height", !fs0.hidden && fs0.c === fs0.r, JSON.stringify(fs0));
    await F.evaluate((e) => { window.__cr = 0; e.addEventListener("ds:chip-reset", () => window.__cr++); });
    await R.click();
    const fs1 = await F.evaluate((e) => ({ on: e.querySelectorAll(".chip.on").length, pressed: e.querySelectorAll('[aria-pressed="true"]').length, hidden: e.querySelector("[data-chip-reset]").hidden, first: document.activeElement === e.querySelector(".chip") }));
    ok("filter reset clears every chip, hides itself and focuses the first chip", fs1.on === 0 && fs1.pressed === 0 && fs1.hidden && fs1.first && (await page.evaluate(() => window.__cr)) === 1, JSON.stringify(fs1));
    await F.locator(".chip").nth(1).click();
    ok("filter reset returns when a chip is turned on", !(await R.evaluate((e) => e.hidden)));
    const wrap = await F.evaluate((e) => { e.style.width = "200px"; const o = { h: e.getBoundingClientRect().height, sw: e.scrollWidth, cw: e.clientWidth }; e.style.width = ""; return o; });
    ok("chips wrap to the next line instead of overflowing", wrap.h > 32 && wrap.sw <= wrap.cw, JSON.stringify(wrap));
  }
  /* Switch 정비(사람의 결정 2026-11-10) — 응답 후 반영 */
  {
    await go("components/switch.html");
    const A = ex("switch", "async"), okI = page.locator(A + " .switch input").nth(0), failI = page.locator(A + " .switch input").nth(1), busyI = page.locator(A + " .switch input").nth(2);
    const st = (l) => l.evaluate((e) => ({ c: e.checked, b: e.getAttribute("aria-busy"), d: e.getAttribute("aria-disabled"), dis: e.disabled, focus: document.activeElement === e, anim: getComputedStyle(e, "::before").animationName }));
    await okI.focus(); await page.keyboard.press("Space"); await page.waitForTimeout(50); let s = await st(okI);
    ok("async switch stays put and shows busy while waiting", s.c === true && s.b === "true" && s.d === "true" && !s.dis && s.focus && s.anim === "spin", JSON.stringify(s));
    await page.keyboard.press("Space"); await page.waitForTimeout(1000); s = await st(okI);
    ok("async switch applies once on success and ignores presses while busy", s.c === false && s.b === null && s.d === null && s.focus, JSON.stringify(s));
    await failI.click(); await page.waitForTimeout(1000); s = await st(failI);
    const t = page.locator(".toast-stack.fixed .toast.danger");
    const tt = await t.evaluate((e) => ({ text: e.textContent, d: e.dataset.duration, close: !!e.querySelector("button.close") && !e.querySelector("button.action") }));
    ok("async switch failure keeps the state and raises a toast that stays", s.c === false && s.b === null && /정책 서버/.test(tt.text) && tt.d === "0" && tt.close, JSON.stringify({ s, tt }));
    await t.locator("button.close").click(); await page.waitForTimeout(250);
    ok("the failure toast closes by its button", (await t.count()) === 0);
    await page.evaluate(() => { window.__sw = (e) => e.detail.cancel(); document.addEventListener("ds:switch", window.__sw); });
    await okI.click(); await page.waitForTimeout(1000); s = await st(okI);
    ok("async switch cancel leaves it unchanged without a toast", s.c === false && s.b === null && (await t.count()) === 0, JSON.stringify(s));
    await page.evaluate(() => { document.removeEventListener("ds:switch", window.__sw); window.__sw = (e) => e.detail.resolve(); document.addEventListener("ds:switch", window.__sw); });
    await okI.click(); await page.waitForTimeout(60); s = await st(okI);
    ok("async switch resolved in the handler still applies", s.c === true && s.b === null, JSON.stringify(s));
    await page.evaluate(() => document.removeEventListener("ds:switch", window.__sw));
    await page.evaluate(() => { window.__swn = 0; window.__sw = () => window.__swn++; document.addEventListener("ds:switch", window.__sw); });
    await busyI.evaluate((e) => e.click()); await page.waitForTimeout(40); s = await st(busyI);
    const pressedBusy = await page.evaluate(() => window.__swn);
    ok("a busy switch cannot be pressed", s.c === true && s.b === "true" && pressedBusy === 0, JSON.stringify({ s, pressedBusy }));
    await okI.click(); await okI.evaluate((e) => e.click()); await page.waitForTimeout(1000);
    const once = await page.evaluate(() => window.__swn); await page.evaluate(() => document.removeEventListener("ds:switch", window.__sw));
    ok("a second press while busy starts nothing", once === 1, String(once));
    const geo = await page.evaluate(() => { const out = []; for (const cls of ["", "sm"]) for (const on of [false, true]) { const l = document.createElement("label"); l.className = "switch " + cls; l.innerHTML = '<input type="checkbox" role="switch" aria-busy="true"' + (on ? " checked" : "") + ">"; document.querySelector(".example-preview").append(l); const i = l.firstChild, a = getComputedStyle(i, "::after"), b = getComputedStyle(i, "::before"); const c = (s2) => parseFloat(s2.left) + parseFloat(s2.width) / 2; const m = (s2) => parseFloat(s2.top) + parseFloat(s2.height) / 2; out.push({ dx: c(a) - c(b), dy: m(a) - m(b) }); l.remove(); } return out; });
    ok("the busy spinner sits at the knob center on both sizes", geo.every((g) => Math.abs(g.dx) < 0.5 && Math.abs(g.dy) < 0.5), JSON.stringify(geo));
    const P = page.locator(ex("switch", "state") + " .switch input").first(), b4 = await P.isChecked(); await P.click();
    ok("a plain switch still applies at once", (await P.isChecked()) !== b4);
  }
  /* 필수 그룹(P2, 2026-11-10) — Checkbox · Radio 가 입력 폼 검증의 같은 흐름에 낀다 */
  for (const [pg, msgHelp] of [["checkbox", "하나 이상 선택합니다."], ["radio-button", ""]]) {
    await go(`components/${pg}.html`);
    const P = ex(pg, "form"), F = page.locator(P + " .field"), G = page.locator(P + " fieldset"), I = page.locator(P + " fieldset input"), S = page.locator(P + ' button[type="submit"]');
    const st = () => F.evaluate((f) => { const g = f.querySelector("fieldset"), h = f.querySelector(":scope > .help"); return { err: f.classList.contains("error"), help: h.textContent, inv: g.getAttribute("aria-invalid"), linked: (g.getAttribute("aria-describedby") || "").split(/\s+/).includes(h.id), focus: f.querySelector("input") === document.activeElement }; });
    const look = await I.first().evaluate((e) => { const c = getComputedStyle(e), r = e.getBoundingClientRect(), l = getComputedStyle(e.closest("label")); return { w: r.width, h: r.height, pad: c.paddingLeft, bw: c.borderTopWidth, weight: l.fontWeight }; });
    ok(`${pg}: an option inside a field keeps its own look, not the input's`, look.w === 16 && look.h === 16 && look.pad === "0px" && look.bw === "0px" && look.weight === "400", JSON.stringify(look));
    await I.first().focus(); await page.keyboard.press("Tab"); await page.keyboard.press("Tab"); await page.waitForTimeout(30);
    let s = await st(); ok(`${pg}: passing through a required group stays quiet`, !s.err && s.help === msgHelp, JSON.stringify(s));
    await S.evaluate((b) => { window.__v = null; b.form.addEventListener("ds:validate", (e) => { window.__v = e.detail; }); });
    await S.click(); await page.waitForTimeout(40); s = await st();
    const v = await page.evaluate(() => window.__v), optInvalid = await I.evaluateAll((k) => k.filter((x) => x.hasAttribute("aria-invalid") || x.hasAttribute("aria-describedby")).length);
    ok(`${pg}: submit flags the empty group, links the message and focuses the first option`, optInvalid === 0 && s.err && s.help === "필수 항목입니다. 항목을 선택하세요." && s.inv === "true" && s.linked && s.focus && v.valid === false && v.errors[0].label === (pg === "checkbox" ? "알림 채널" : "격리 해제 권한"), JSON.stringify({ s, v, optInvalid }));
    const ring = await I.evaluateAll((k) => { const d = document.createElement("div"); d.style.color = "var(--foreground-negative-primary)"; document.body.append(d); const want = getComputedStyle(d).color; d.remove(); return { want, shadow: getComputedStyle(k[1]).boxShadow }; });
    ok(`${pg}: an empty option in an error group gets the error line`, ring.shadow.includes(ring.want), JSON.stringify(ring));
    await I.nth(1).check(); await page.waitForTimeout(30); s = await st();
    ok(`${pg}: choosing clears the error at once and restores help`, !s.err && s.help === msgHelp && s.inv === null, JSON.stringify(s));
    if (pg === "checkbox") { await I.nth(1).uncheck(); await page.waitForTimeout(30); s = await st(); ok("checkbox: unchecking the last option in a required group flags it", s.err && s.inv === "true", JSON.stringify(s)); }
  }
  /* Slider 단위 — 값과 함께 읽힌다 */
  {
    await go("components/slider.html");
    const R = page.locator(ex("slider", "ticks") + " input[type=range]");
    const a0 = await R.getAttribute("aria-valuetext");
    await R.focus(); await page.keyboard.press("ArrowRight");
    ok("slider reads its unit with the value", a0 === "90일" && (await R.getAttribute("aria-valuetext")) === "120일" && (await page.locator(ex("slider", "ticks") + " .val").textContent()) === "120일", String(a0));
    ok("slider without a unit has no value text", (await page.locator(ex("slider", "basic") + " input[type=range]").getAttribute("aria-valuetext")) === null);
  }
  await go("components/item-tile.html");
  const tile = page.locator(".example-preview .tile[aria-pressed]").first();
  const tb = await tile.getAttribute("aria-pressed"); await tile.click();
  ok("tile toggles", (await tile.getAttribute("aria-pressed")) !== tb);
  /* 비활성 타일 — 아이콘 면은 타일 면과 같게, 아이콘 · 설명은 비활성 글자색(사람의 결정 2026-10-27) */
  const tileOff = await page.evaluate(() => { const t = document.querySelector("#ex-item-tile-grid .example-preview .tile[disabled]"), ico = t.querySelector(".ico"), desc = t.querySelector(":scope > span:not(.ico):not(.tag)"), d = document.createElement("div"); d.style.color = "var(--foreground-disable-primary)"; document.body.append(d); const want = getComputedStyle(d).color; d.remove();
    return { face: getComputedStyle(t).backgroundColor, icoBg: getComputedStyle(ico).backgroundColor, ico: getComputedStyle(ico).color, desc: getComputedStyle(desc).color, want }; });
  ok("a disabled tile dims its icon and description", tileOff.icoBg === tileOff.face && tileOff.ico === tileOff.want && tileOff.desc === tileOff.want, JSON.stringify(tileOff));
  /* 비활성 타일의 우상단 Tag 도 비활성 면 · 글자색(사람의 결정 2026-10-27) */
  const tagOff = await page.evaluate(() => { const t = document.querySelector("#ex-item-tile-badge .example-preview .tile[disabled]"), g = t.querySelector(".tag"), d = document.createElement("div"); d.style.color = "var(--foreground-disable-primary)"; document.body.append(d); const want = getComputedStyle(d).color; d.remove();
    return { face: getComputedStyle(t).backgroundColor, bg: getComputedStyle(g).backgroundColor, color: getComputedStyle(g).color, dot: getComputedStyle(g, "::before").backgroundColor, want }; });
  ok("a disabled tile dims its tag", tagOff.bg === tagOff.face && tagOff.color === tagOff.want && tagOff.dot === tagOff.want, JSON.stringify(tagOff));

  // Pagination
  await go("components/pagination.html");
  const pg = page.locator(".example-preview .pagination").first();
  const nums = pg.locator("button:not([aria-label])");
  await nums.nth(2).click();
  ok("pagination page click", await nums.nth(2).evaluate((e) => e.classList.contains("on") && e.getAttribute("aria-current") === "page"));
  await pg.locator("button[aria-label]").last().click();
  ok("pagination next", await nums.nth(3).evaluate((e) => e.classList.contains("on")));
  await nums.first().click();
  ok("prev disabled on first", await pg.locator("button[aria-label]").first().isDisabled());

  // Slider
  await go("components/slider.html");
  const sl = page.locator(".example-preview .slider input[type=range]").first();
  await sl.fill("80");
  ok("slider --p + value", await sl.evaluate((e) => e.style.getPropertyValue("--p") === "80%" && e.closest(".slider").querySelector(".val").textContent.startsWith("80")));

  // Search clear
  await go("components/search.html");
  const clr = page.locator(".example-preview .searchbar .clear").first();
  await clr.click();
  ok("search clear empties + hides", await clr.evaluate((e) => e.closest(".searchbar").querySelector("input").value === "" && e.hidden));
  /* Search 정비(사람의 결정 2026-11-09) — 입력 지연 · Esc · 단축키 · 건수 알림 */
  await go("components/search.html");
  await page.evaluate(() => { window.__sv = []; document.addEventListener("ds:search", (e) => window.__sv.push({ ...e.detail, ex: (e.target.closest("[id^=ex-]") || {}).id })); });
  const svDrain = () => page.evaluate(() => window.__sv.splice(0));
  /* 기본 ×는 값이 있고 포커스가 있을 때만 그려지고 getComputedStyle 로는 읽히지 않는다 — 글자를 투명하게 둔 채 값이 있을 때와 없을 때 그림이 같은지 본다 */
  const xBar = page.locator("#ex-search-extras .searchbar").nth(1), xShot = async (v) => { await xBar.locator("input").evaluate((i, v) => { i.style.color = "transparent"; i.value = v; i.focus(); i.closest(".searchbar").querySelector(".clear").style.visibility = "hidden"; }, v); await page.waitForTimeout(250); const r = await xBar.locator("input").boundingBox(); return page.screenshot({ animations: "disabled", clip: { x: r.x + r.width - 32, y: r.y, width: 32, height: r.height } }); };   // 포커스 링 전환이 끝난 뒤, ×가 그려지는 입력칸 오른쪽 끝만 — 아이콘 SVG 는 다시 그릴 때 안티앨리어싱이 ±3 흔들린다
  await xShot("");   // 포커스가 자리잡기 전의 첫 캡처는 픽셀이 달라 간헐 실패했다(부하에서 2/20) — 한 번 찍어 버린다
  const xWith = await xShot("랜섬웨어"), xEmpty = await xShot("");
  await xBar.locator("input").evaluate((i) => { i.style.color = ""; i.value = "랜섬웨어"; i.closest(".searchbar").querySelector(".clear").style.visibility = ""; });
  ok("search hides the native clear next to .clear", xWith.equals(xEmpty));
  const fIn = page.locator("#ex-search-filters .searchbar input");
  await fIn.focus(); await page.keyboard.type("ab", { delay: 30 }); await page.waitForTimeout(120);
  const fEarly = await svDrain(); await page.waitForTimeout(350); const fLate = await svDrain();
  ok("search filter waits for typing to stop, then fires once", fEarly.length === 0 && fLate.length === 1 && fLate[0].value === "ab" && fLate[0].trigger === "input", JSON.stringify({ fEarly, fLate }));
  await page.keyboard.press("Enter"); const fEnter = await svDrain();
  await page.keyboard.type("c"); await page.keyboard.press("Enter"); const fEnter2 = await svDrain(); await page.waitForTimeout(350); const fNoTrail = await svDrain();
  ok("search Enter fires at once and cancels the pending one", fEnter.length === 1 && fEnter[0].trigger === "enter" && fEnter2.length === 1 && fEnter2[0].value === "abc" && fNoTrail.length === 0, JSON.stringify({ fEnter, fEnter2, fNoTrail }));
  await page.keyboard.press("Escape"); const fEsc = await svDrain();
  const fEscSt = await page.evaluate(() => { const i = document.querySelector("#ex-search-filters .searchbar input"); return { value: i.value, focus: document.activeElement === i }; });
  await page.keyboard.press("Escape"); const fEsc2 = await svDrain(); await page.waitForTimeout(350); const fEscTrail = await svDrain();
  ok("search Esc clears at once, keeps focus, then does nothing", fEsc.length === 1 && fEsc[0].trigger === "clear" && fEscSt.value === "" && fEscSt.focus && fEsc2.length === 0 && fEscTrail.length === 0 && (await page.evaluate(() => document.activeElement.type === "search")), JSON.stringify({ fEsc, fEscSt, fEsc2, fEscTrail }));
  await page.evaluate(() => { const c = document.querySelectorAll("#ex-search-extras .searchbar")[1], i = c.querySelector("input"); c.setAttribute("data-debounce", ""); i.value = "x"; c.querySelector(".clear").hidden = false; });
  await page.locator("#ex-search-extras .searchbar .clear").last().click(); const fClr = await svDrain(); await page.waitForTimeout(350); const fClrTrail = await svDrain();
  ok("search clear button fires once with no trailing event", fClr.length === 1 && fClr[0].trigger === "clear" && fClrTrail.length === 0, JSON.stringify({ fClr, fClrTrail }));
  const hkIn = page.locator("#ex-search-extras .searchbar[data-hotkey] input"), active = () => page.evaluate(() => { const a = document.activeElement; return a.closest("[data-hotkey]") ? "hotkey" : a.tagName + "#" + a.id; });
  await page.evaluate(() => document.activeElement.blur()); await page.keyboard.press("/"); await page.waitForTimeout(80);
  const hk1 = await active(), hkSitePop = await page.evaluate(() => { const q = document.querySelector("#q"); return !!q && q.getClientRects().length > 0; });
  ok("search / focuses the hotkey input and not the site search", hk1 === "hotkey" && !hkSitePop && (await hkIn.inputValue()) === "", JSON.stringify({ hk1, hkSitePop }));
  await hkIn.fill("랜섬"); const kbdOn = await page.locator("#ex-search-extras .searchbar kbd").isVisible(); await hkIn.fill(""); const kbdOff = await page.locator("#ex-search-extras .searchbar kbd").isVisible();
  ok("search kbd hides while there is a value", !kbdOn && kbdOff, JSON.stringify({ kbdOn, kbdOff }));
  await fIn.focus(); await page.keyboard.type("/"); const hkTyping = await active(), hkValue = await fIn.inputValue(); await page.keyboard.press("Escape"); await svDrain();
  await page.evaluate(() => document.activeElement.blur()); await page.keyboard.press("Control+/"); const hkCtrl = await active(); await page.keyboard.press("Escape");
  ok("search / is ignored while typing and with a modifier", hkTyping !== "hotkey" && hkValue === "/" && hkCtrl !== "hotkey", JSON.stringify({ hkTyping, hkValue, hkCtrl }));
  await page.evaluate(() => { const m = document.createElement("div"); m.id = "fakeModal"; m.setAttribute("aria-modal", "true"); m.textContent = "x"; document.body.append(m); document.activeElement.blur(); }); await page.keyboard.press("/"); const hkModal = await active(); await page.evaluate(() => document.querySelector("#fakeModal").remove());
  ok("search / is ignored while a modal is open", hkModal !== "hotkey", hkModal);
  const stEl = await page.evaluate(() => { const s = document.querySelector("#ex-search-filters .searchbar .sr-only"), r = s.getBoundingClientRect(); return { role: s.getAttribute("role"), w: r.width, text: s.textContent }; });
  ok("search result count is a hidden status", stEl.role === "status" && stEl.w <= 1 && stEl.text === "128건", JSON.stringify(stEl));
  await page.evaluate(() => { const p = document.createElement("div"); p.className = "popup"; p.setAttribute("role", "dialog"); p.innerHTML = '<div class="searchbar" role="search"><input type="search" value="랜섬" aria-label="검색"></div>'; const h = document.createElement("div"); h.append(p); document.body.append(h); DS.popup.open(p); p.querySelector("input").focus(); });
  await page.keyboard.press("Escape"); const pop1 = await page.evaluate(() => ({ open: !!document.querySelector(".popup-backdrop[data-ds-popup]"), value: document.querySelector(".popup-backdrop .searchbar input").value }));
  await page.keyboard.press("Escape"); const pop2 = await page.evaluate(() => !!document.querySelector(".popup-backdrop[data-ds-popup]")); await svDrain();
  ok("search Esc with a value leaves the dialog open, the next one closes it", pop1.open && pop1.value === "" && !pop2, JSON.stringify({ pop1, pop2 }));

  // Date picker — behave.dp.js(오늘을 고정한 별도 컨텍스트, 맨 끝에서 부른다)

  // Checkbox master, terms
  await go("components/checkbox.html");
  const master = page.locator("#ex-checkbox-group .example-preview .checkbox-group > .checkbox:first-child input").first();
  ok("indeterminate applied", await master.evaluate((e) => e.indeterminate));
  const grp = await master.evaluate((e) => { const l = e.closest(".checkbox"); return !!(l.nextElementSibling && l.nextElementSibling.classList.contains("checkbox-group")); });
  if (grp) {
    await master.click();
    ok("master checks all", await master.evaluate((e) => { const kids = e.closest(".checkbox").nextElementSibling.querySelectorAll("input"); return e.checked && [...kids].every((k) => k.checked); }));
    await master.evaluate((e) => { const k = e.closest(".checkbox").nextElementSibling.querySelector("input"); k.click(); });
    ok("child uncheck → master mixed", await master.evaluate((e) => e.indeterminate));
  } else ok("master group structure", false, "no adjacent .checkbox-group");
  await go("patterns/terms-agreement.html");
  const terms = page.locator(".example-preview .terms").first();
  /* '다음' 은 늘 켜 둔다(Interaction › Disabled, 사람의 결정 2026-11-09) — 비활성 대신 누르면 막고 안내한다 */
  const termsNext = terms.locator(".btn.primary"), termsReq = terms.locator(".item input");
  const termsState = () => terms.evaluate((e) => ({ msg: e.querySelector(":scope > .msg").textContent, shown: e.querySelector(":scope > .msg").getBoundingClientRect().height > 0, invalid: e.querySelectorAll('.item input[aria-invalid="true"]').length }));
  ok("terms next enabled initially (required checked)", await termsNext.isEnabled());
  await termsReq.nth(0).click(); await termsReq.nth(1).click();
  const termsQuiet = await termsState();
  ok("terms next stays enabled and quiet until pressed", await termsNext.isEnabled() && !termsQuiet.shown && termsQuiet.invalid === 0, JSON.stringify(termsQuiet));
  await termsNext.evaluate((b) => { window.__termsHit = 0; b.addEventListener("click", () => window.__termsHit++); });
  await termsNext.click();
  const termsBlocked = await termsState();
  ok("terms press with missing required names the count", /2개/.test(termsBlocked.msg) && termsBlocked.shown && termsBlocked.invalid === 2, JSON.stringify(termsBlocked));
  ok("terms press moves focus to the first missing item", await termsReq.nth(0).evaluate((i) => i === document.activeElement));
  ok("terms press does not reach the button's own listener", await page.evaluate(() => window.__termsHit === 0));
  await termsReq.nth(0).click();
  const termsPartial = await termsState();
  ok("terms fixing one lowers the count at once", /1개/.test(termsPartial.msg) && termsPartial.invalid === 1, JSON.stringify(termsPartial));
  await termsReq.nth(1).click();
  const termsFixed = await termsState();
  ok("terms fixing all clears the message", termsFixed.msg === "" && !termsFixed.shown && termsFixed.invalid === 0, JSON.stringify(termsFixed));
  await termsNext.click();
  ok("terms press with required checked reaches the listener", await page.evaluate(() => window.__termsHit === 1));
  await terms.locator(".all input").click();
  ok("terms all → all checked + enabled", await terms.evaluate((e) => [...e.querySelectorAll(".item input")].every((i) => i.checked) && !e.querySelector(".btn.primary").disabled));

  // Data table
  await go("components/data-table.html");
  /* 숫자 열 — 고정폭 숫자라야 자릿수가 세로로 맞는다(React 는 .ds-root 가 전체에 건다). 사이트 표만 비례폭이었다 */
  const numFig = await page.evaluate(() => getComputedStyle(document.querySelector("#ex-data-table-basic td.num")).fontVariantNumeric);
  ok("table number cells use tabular figures", /tabular-nums/.test(numFig), numFig);
  /* 비활성 행 — 태그 · 링크 · 상태 점은 자기 색을 쥐고 있어 td 의 color 만으로는 활성처럼 남았다. 실제 예제(Default)의 tr.disabled 를 잰다 */
  const offRow = await page.evaluate(() => {
    const tr = document.querySelector("#ex-data-table-basic tr.disabled");
    if (!tr) return null;
    const res = (v) => { const d = document.createElement("div"); d.style.color = v; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; };
    const tag = getComputedStyle(tr.querySelector(".tag")), link = getComputedStyle(tr.querySelector(".link")), dot = getComputedStyle(tr.querySelector(".indicator"), "::before");
    const a = tr.querySelector(".link"); a.focus();
    return { focusable: document.activeElement === a, tagBg: tag.backgroundColor, tagFg: tag.color, tagDot: getComputedStyle(tr.querySelector(".tag"), "::before").backgroundColor, link: link.color, linkEvents: link.pointerEvents, dot: dot.backgroundColor,
      wantBg: res("var(--surface-disable-primary)"), wantFg: res("var(--foreground-disable-primary)") };
  });
  ok("a disabled table row greys its tag, link and status dot with the disable tokens",
    !!offRow && offRow.tagBg === offRow.wantBg && [offRow.tagFg, offRow.tagDot, offRow.link, offRow.dot].every((c) => c === offRow.wantFg) && offRow.linkEvents === "none" && offRow.focusable === false, JSON.stringify(offRow));
  /* 좁은 폭에서 표는 자기 폭을 지키고 .tbl-wrap 이 가로 스크롤한다 — 문서용 .page table 규칙이 .tbl 을
     블록으로 바꿔 266px 에서 잘리고 열이 한 글자씩 접혔다 */
  await page.setViewportSize({ width: 390, height: 900 }); await page.waitForTimeout(250);
  const narrow = await page.evaluate(() => { const w = document.querySelector("#ex-data-table-basic .tbl-wrap"), t = w.querySelector("table");
    return { display: getComputedStyle(t).display, table: Math.round(t.getBoundingClientRect().width), wrap: w.clientWidth, scroll: w.scrollWidth }; });
  await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(250);
  ok("data table keeps its width at 390 and the wrapper scrolls", narrow.display === "table" && narrow.table > narrow.wrap && narrow.scroll > narrow.wrap, JSON.stringify(narrow));
  const tbl = page.locator(".example-preview .tbl-wrap").filter({ has: page.locator("th.check") }).first();
  const rowsBefore = await tbl.locator("tbody tr.on").count();
  await tbl.locator("th.check input").click();
  ok("table header select all", await tbl.evaluate((e) => { const c = e.querySelectorAll("tbody td.check input"); const all = [...c].every((i) => i.checked); const b = e.querySelector(".action-bar b"); return all && e.querySelectorAll("tbody tr.on").length === c.length && b && b.textContent === c.length + "개 선택"; }), `before ${rowsBefore}`);
  await tbl.locator("th.check input").click();
  ok("table header deselect → bar hidden", await tbl.evaluate((e) => e.querySelector(".action-bar").hidden && e.querySelectorAll("tbody tr.on").length === 0));
  const sortable = page.locator(".example-preview th.sortable").first();
  const firstCell = async () => sortable.evaluate((th) => { const t = th.closest("table"); const i = [...t.querySelectorAll("thead th")].indexOf(th); return t.querySelector("tbody tr").children[i].textContent.trim(); });
  const c0 = await firstCell(); await sortable.click(); const c1 = await firstCell(); await sortable.click(); const c2 = await firstCell();
  ok("sort toggles order", c1 !== c2, `${c0} → ${c1} → ${c2}`);
  ok("aria-sort set", ["ascending", "descending"].includes(await sortable.getAttribute("aria-sort")));

  // List listbox
  await go("components/list.html");
  const lb = page.locator(".example-preview .list[role=listbox]").first();
  if (await lb.count()) { await lb.locator("li[role=option]").nth(1).click(); ok("listbox select", await lb.evaluate((e) => e.querySelectorAll("li.on").length === 1 && e.querySelectorAll("li")[1].getAttribute("aria-selected") === "true")); }

  // 신규: 탭 패널 · 브레드크럼 · 온보딩 · 프리셋 · 카운터 · 카드
  await go("components/tab.html");
  const tp = page.locator("#ex-tab-underline .example-preview");
  await tp.locator(".tab").nth(1).click();
  ok("tab panel text updates", await tp.evaluate((e) => /이벤트 탭의 내용/.test(e.querySelector(".tab-panel").textContent)));
  await go("components/breadcrumb.html");
  const bc = page.locator("#ex-breadcrumb-collapsed .example-preview .breadcrumb");
  const liBefore = await bc.locator("li").count(); await bc.locator(".more").click();
  ok("breadcrumb more expands", (await bc.locator("li").count()) === liBefore + 1 && (await bc.locator(".more").count()) === 0 && (await bc.locator("li a").nth(1).textContent()) === "정책");
  // 펼치면 버튼이 DOM 에서 사라진다 — 포커스를 옮기지 않으면 body 로 떨어진다
  ok("breadcrumb moves focus to the first revealed link", await page.evaluate(() => {
    const a = document.activeElement;
    return !!a && a.tagName === "A" && a.textContent.trim() === "정책";
  }));
  await go("components/breadcrumb.html");
  const bcA11y = await page.evaluate(() => {
    const home = document.querySelector("#ex-breadcrumb-collapsed .breadcrumb a.icon");
    const more = document.querySelector("#ex-breadcrumb-collapsed .more");
    const hit = (e) => { const c = getComputedStyle(e, "::after"); return c.width + "×" + c.height; };
    return { homeLabel: home && home.getAttribute("aria-label"), homeHit: home && hit(home), moreHit: more && hit(more) };
  });
  // 아이콘만 있는 링크는 이름이 없으면 스크린리더가 "링크" 로만 읽는다
  ok("breadcrumb icon link is named", bcA11y.homeLabel === "홈", JSON.stringify(bcA11y));
  ok("breadcrumb icon targets are 24x24", bcA11y.homeHit === "24px×24px" && bcA11y.moreHit === "24px×24px", JSON.stringify(bcA11y));
  const bcCut = await page.evaluate(() => {
    const ol = document.querySelector("#ex-breadcrumb-default .breadcrumb");
    const a = ol.querySelector("li>a:not(.icon)"), sp = ol.querySelector("[aria-current]>span");
    const short = Math.round(a.getBoundingClientRect().width);
    a.textContent = "외부 저장장치 차단 정책 본사 영업부 전체 적용 규칙 2026 그리고 더 길게";
    sp.textContent = "현재 페이지 이름도 아주 길어질 수 있습니다 예를 들면 이렇게요 정말로";
    const w = (e) => Math.round(e.getBoundingClientRect().width);
    return { short, longLink: w(a), longCurrent: w(sp), clipped: a.scrollWidth > a.clientWidth, row: Math.round(ol.getBoundingClientRect().height) };
  });
  ok("breadcrumb truncates long labels at 220", bcCut.longLink === 220 && bcCut.longCurrent === 220 && bcCut.clipped && bcCut.short < 220 && bcCut.row === 24, JSON.stringify(bcCut));
  await go("components/breadcrumb.html");
  const bcDef = await page.evaluate(() => [...document.querySelectorAll(".example-preview .breadcrumb")].map((ol) => {
    const first = ol.querySelector("li:first-child > a.icon"), hit = first && first.querySelector("svg");
    return { ex: (ol.closest("[id^=ex-breadcrumb-]") || {}).id, home: !!first && first.getAttribute("aria-label") === "홈" && !!hit && Math.round(hit.getBoundingClientRect().width) === 18, h: ol.getBoundingClientRect().height,
      current: ol.querySelectorAll("li[aria-current=page]").length === 1 && ol.lastElementChild.matches("li[aria-current=page]") && !ol.lastElementChild.querySelector("a") };
  }));
  ok("every breadcrumb starts with a named 18px home icon and ends with one non-link current item", bcDef.length >= 6 && bcDef.every((b) => b.home && b.current), JSON.stringify(bcDef));
  ok("breadcrumb row is exactly 24", bcDef.every((b) => b.h === 24), JSON.stringify(bcDef.map((b) => b.h)));
  const bcLink = page.locator("#ex-breadcrumb-state .breadcrumb li > a:not(.icon):not([data-state])").first();
  const bcRest = await bcLink.evaluate((e) => getComputedStyle(e).color);
  await bcLink.hover(); await page.waitForTimeout(150);
  const bcHov = await bcLink.evaluate((e) => { const c = getComputedStyle(e); return { color: c.color, line: c.textDecorationLine }; });
  const bcFix = await page.evaluate(() => { const c = getComputedStyle(document.querySelector('#ex-breadcrumb-state a[data-state="hover"]')); return { color: c.color, line: c.textDecorationLine }; });
  ok("breadcrumb hover turns primary with underline, and the fixed Hover example matches it", bcRest !== bcHov.color && bcHov.line === "underline" && bcFix.color === bcHov.color && bcFix.line === bcHov.line, JSON.stringify({ bcRest, bcHov, bcFix }));
  const bcText = await page.evaluate(() => { const li = document.querySelectorAll("#ex-breadcrumb-text-parent .breadcrumb li")[1], c = getComputedStyle(li.firstElementChild);
    return { tag: li.firstElementChild.tagName, link: !!li.querySelector("a"), color: c.color, tert: getComputedStyle(document.querySelector("#ex-breadcrumb-text-parent .breadcrumb li:nth-child(3) a")).color }; });
  ok("breadcrumb parent without a page is plain text in the link colour (not disabled)", bcText.tag === "SPAN" && !bcText.link && bcText.color === bcText.tert, JSON.stringify(bcText));
  await go("patterns/onboarding.html");
  const ob = page.locator("#ex-onboarding-step .example-preview .onboard");
  await ob.locator('[data-step="next"]').click();
  ok("onboarding next moves step", await ob.evaluate((e) => { const li = e.querySelectorAll(".steps li"); return li[2].classList.contains("on") && li[2].getAttribute("aria-current") === "step" && li[1].classList.contains("done") && !li[1].classList.contains("on"); }));
  await ob.locator('[data-step="prev"]').click(); await ob.locator('[data-step="prev"]').click();
  ok("onboarding prev disabled at first step", await ob.evaluate((e) => e.querySelectorAll(".steps li")[0].classList.contains("on") && e.querySelector('[data-step="prev"]').disabled && e.querySelectorAll(".steps li")[1].querySelector("i").textContent.trim() === "2"));
  await ob.locator(".radio.card").nth(1).click();
  ok("onboarding card radios choose one", await ob.evaluate((e) => e.querySelectorAll(".radio.card input:checked").length === 1 && e.querySelectorAll(".radio.card input")[1].checked));
  /* 완료 문단 — 한국어 기본 줄바꿈은 음절 사이에서 끊겨 1440 에서 "…있습니 / 다." 로 한 글자 줄이 남았다. .keep-all 로 어절째 넘긴다 */
  const obLast = await page.evaluate(() => { const p = document.querySelector("#ex-onboarding-done .desc"), r = document.createRange(); r.selectNodeContents(p);
    const rows = {}; for (const x of r.getClientRects()) { const k = Math.round(x.top); rows[k] = (rows[k] || 0) + x.width; }
    const ws = Object.keys(rows).sort((a, b) => a - b).map((k) => Math.round(rows[k])); return { lines: ws.length, last: ws[ws.length - 1] }; });
  ok("onboarding done text keeps its last word whole", obLast.last > 30, JSON.stringify(obLast));
  /* 390 — .onboard 가 가운데 정렬이라 넘친 Steps 의 양끝이 잘렸다. safe center 는 넘칠 때만 왼쪽부터 놓는다 */
  await page.setViewportSize({ width: 390, height: 900 }); await page.waitForTimeout(250);
  const obFit = await page.evaluate(() => { const pv = document.querySelector("#ex-onboarding-done .example-preview"), s = pv.querySelector(".steps").getBoundingClientRect();
    return { left: Math.round(s.left - pv.getBoundingClientRect().left), scrolls: pv.scrollWidth > pv.clientWidth }; });
  await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(250);
  ok("onboarding steps start inside the preview at 390", obFit.left >= 0 && obFit.scrolls, JSON.stringify(obFit));
  await go("components/text-field.html");
  const cf = page.locator("#ex-text-field-affix .example-preview .field").filter({ has: page.locator(".counter") }).first();
  await cf.locator("input").fill("새 정책");
  ok("text field counter updates", (await cf.locator(".counter").textContent()) === "4 / 80");
  /* Text Field 정비(사람의 결정 2026-11-09) — placeholder · 입력 검증 · 글자 수 한도 · 비밀번호 표시 */
  const phColor = () => page.evaluate(() => { const p = document.createElement("i"); p.style.color = "var(--foreground-neutral-tertiary)"; document.body.append(p); const want = getComputedStyle(p).color; p.remove();
    const inp = document.querySelector(".example-preview .field input[placeholder], .example-preview .searchbar input[placeholder]"), sel = document.querySelector(".example-preview .dropdown .trigger .placeholder");
    return { want, got: inp ? getComputedStyle(inp, "::placeholder").color : getComputedStyle(sel).color }; });
  const phs = [await phColor()]; for (const p of ["components/search.html", "components/select.html"]) { await go(p); phs.push(await phColor()); }
  ok("placeholder is tertiary in text field, search, select", phs.every((x) => x.got === x.want), JSON.stringify(phs));
  await go("patterns/input-form.html");
  await page.evaluate(() => { window.__alive = true; window.__reached = 0; window.__ev = []; const f = document.querySelector("#ex-input-form-validate form"); f.addEventListener("submit", () => window.__reached++); f.addEventListener("ds:validate", (e) => window.__ev.push(e.detail)); });
  const vf = page.locator("#ex-input-form-validate form"), vin = (id) => vf.locator("#" + id), vst = (id) => vf.evaluate((f, id) => { const i = f.querySelector("#" + id), fd = i.closest(".field"), h = fd.querySelector(":scope > .help"); return { err: fd.classList.contains("error"), help: h.textContent, live: h.getAttribute("aria-live"), described: (i.getAttribute("aria-describedby") || "").split(" ").includes(h.id), invalid: i.getAttribute("aria-invalid"), value: i.value }; }, id);
  await vin("v1").focus(); await page.keyboard.press("Tab");
  const vEmpty = await vst("v1");
  ok("validate: tabbing past an untouched empty field says nothing", !vEmpty.err && vEmpty.help === "2~40자", JSON.stringify(vEmpty));
  await vin("v2").fill("10.0.0"); await page.keyboard.press("Tab");
  const vBad = await vst("v2");
  ok("validate: leaving a wrong field shows its message and keeps the value", vBad.err && vBad.help === "올바른 IPv4 형식이 아닙니다. 예: 10.0.0.12" && vBad.value === "10.0.0" && vBad.invalid === "true", JSON.stringify(vBad));
  ok("validate: message region is aria-live and described by the input", vBad.live === "polite" && vBad.described, JSON.stringify(vBad));
  await vin("v2").fill("10.0.0.12");
  const vFix = await vst("v2");
  ok("validate: fixing clears the error at once and restores the help", !vFix.err && vFix.help === "IPv4 형식" && vFix.invalid === null, JSON.stringify(vFix));
  const vSubmit = () => vf.locator('button[type="submit"]').click();
  await vSubmit();
  const vBlocked = await page.evaluate(() => { const f = document.querySelector("#ex-input-form-validate form"), s = f.querySelector(":scope > [data-form-summary]"); return { reached: window.__reached, focus: document.activeElement.id, title: s && s.querySelector("b").textContent, labels: s && s.querySelector(":scope > div > span").textContent, icon: !!(s && s.querySelector(":scope > .ico > svg")), first: f.firstElementChild === s, role: s && s.getAttribute("role"), errs: f.querySelectorAll(".field.error").length, ev: window.__ev[window.__ev.length - 1] }; });
  ok("validate: submit is blocked before product handlers, focus on first error", vBlocked.reached === 0 && vBlocked.focus === "v1" && vBlocked.errs === 3, JSON.stringify(vBlocked));
  ok("validate: three or more errors get a summary on top", vBlocked.first && vBlocked.icon && vBlocked.role === "alert" && vBlocked.title === "입력값 3개를 확인하세요" && vBlocked.labels === "정책 이름, 보관 기간, 알림 이메일", JSON.stringify(vBlocked));
  ok("validate: ds:validate reports the errors", vBlocked.ev && vBlocked.ev.valid === false && vBlocked.ev.errors.length === 3 && vBlocked.ev.errors[0].message === "필수 항목입니다. 값을 입력하세요.", JSON.stringify(vBlocked.ev));
  await vin("v1").fill("외부 USB 차단");
  ok("validate: summary goes away under three errors", (await vf.locator(":scope > [data-form-summary]").count()) === 0);
  await vin("v3").fill("500"); await page.keyboard.press("Tab");
  const vMax = await vst("v3");
  ok("validate: range message carries the limit", vMax.help === "값이 너무 큽니다. 365 이하 입력하세요.", JSON.stringify(vMax));
  await vin("v3").fill("90"); await vin("v4").fill("admin@example.com");
  await vin("v1").fill("가".repeat(41));
  const vOver = await vst("v1");
  await vSubmit();
  const vOverBlocked = await page.evaluate(() => window.__reached);
  ok("validate: over the limit still types, says so, and blocks submit", vOver.value.length === 41 && vOver.err && vOver.help === "글자 수가 1자 넘었습니다. 40자 이하로 줄이세요." && vOverBlocked === 0, JSON.stringify({ vOver, vOverBlocked }));
  await vin("v1").fill("외부 USB 차단"); await vSubmit();
  const vPass = await page.evaluate(() => ({ reached: window.__reached, alive: window.__alive === true, valid: window.__ev[window.__ev.length - 1].valid, err: document.querySelectorAll("#ex-input-form-validate .field.error").length }));
  ok("validate: a clean form reaches the handler and the preview does not reload", vPass.reached === 1 && vPass.alive && vPass.valid && vPass.err === 0, JSON.stringify(vPass));
  const vGap = await vf.evaluate((f) => { const fd = f.querySelector("#v4").closest(".field"); return fd.getBoundingClientRect().bottom - f.querySelector("#v4").getBoundingClientRect().bottom; });
  ok("empty help takes no room", Math.abs(vGap) < 0.5, String(vGap));
  /* 도움말 칸을 적지 않은 폼도 ds.js 가 라이브 영역을 만들어 둔다 — 예제 마크업에는 이미 적혀 있어 따로 잰다 */
  const vBare = await page.evaluate(() => { const box = document.createElement("div"); box.innerHTML = '<form data-validate class="form"><div class="field"><label for="bare">이름</label><input id="bare" required></div></form>'; document.querySelector("#ex-input-form-validate .example-preview").append(box); DS.init(box); const i = box.querySelector("input"), h = box.querySelector(".help"), r = { live: h && h.getAttribute("aria-live"), described: !!h && i.getAttribute("aria-describedby") === h.id, off: box.querySelector("form").noValidate }; box.remove(); return r; });
  ok("validate: a field without help markup still gets a live region", vBare.live === "polite" && vBare.described && vBare.off, JSON.stringify(vBare));
  await go("components/text-field.html");
  const cf2 = page.locator("#ex-text-field-affix .example-preview .field").filter({ has: page.locator(".counter") }).first();
  await cf2.locator("input").fill("가".repeat(81));
  const over = await cf2.evaluate((f) => ({ len: f.querySelector("input").value.length, counter: f.querySelector(".counter").textContent, cOver: f.querySelector(".counter").classList.contains("over"), err: f.classList.contains("error"), help: f.querySelector(".help").textContent, c: getComputedStyle(f.querySelector(".counter")).color, h: getComputedStyle(f.querySelector(".help")).color }));
  await cf2.locator("input").fill("가".repeat(80));
  const under = await cf2.evaluate((f) => ({ cOver: f.querySelector(".counter").classList.contains("over"), err: f.classList.contains("error"), help: f.querySelector(".help").textContent }));
  ok("soft limit outside a form: types past it, errors, counter turns red", over.len === 81 && over.counter === "81 / 80" && over.cOver && over.err && over.help === "글자 수가 1자 넘었습니다. 80자 이하로 줄이세요." && over.c === over.h, JSON.stringify(over));
  ok("soft limit outside a form: back under clears it", !under.cOver && !under.err && under.help === "", JSON.stringify(under));
  const rv = page.locator("#ex-text-field-password .example-preview"), rvState = () => rv.evaluate((p) => { const i = p.querySelector("input"), b = p.querySelector(".reveal"); return { type: i.type, pressed: b.getAttribute("aria-pressed"), value: i.value, show: getComputedStyle(b.querySelector(".i-show")).display, hide: getComputedStyle(b.querySelector(".i-hide")).display, focus: document.activeElement === b, name: b.getAttribute("aria-label"), w: b.getBoundingClientRect().width }; });
  const rv0 = await rvState(); await rv.locator(".reveal").click(); const rv1 = await rvState(); await rv.locator(".reveal").click(); const rv2 = await rvState();
  ok("password reveal: type, aria-pressed, icon swap, value and focus stay", rv0.type === "password" && rv0.pressed === "false" && rv0.hide === "none" && rv0.show !== "none" && rv0.name === "비밀번호 표시" && rv1.type === "text" && rv1.pressed === "true" && rv1.show === "none" && rv1.hide !== "none" && rv1.focus && rv1.value === rv0.value && rv2.type === "password" && rv2.pressed === "false", JSON.stringify([rv0, rv1, rv2]));
  const monoF = await page.evaluate(() => { const a = document.querySelector("#ip1"), b = document.querySelector("#af-d"); return { a: getComputedStyle(a).fontFamily, b: getComputedStyle(b).fontFamily, field: a.closest(".field").classList.contains("mono") }; });
  ok(".mono uses the mono stack", monoF.field && monoF.a !== monoF.b, JSON.stringify(monoF));
  /* 비활성 입력칸의 면은 비활성 토큰, 읽기 전용은 읽기 전용 면 — :read-only 가 disabled 에도 맞아 비활성 면을 덮었다(2026-10-27) */
  const tfState = await page.evaluate(() => { const box = document.querySelector("#ex-text-field-state .example-preview"), dis = box.querySelector("input:disabled"), ro = box.querySelector("input[readonly]:not(:disabled)"), tok = (v) => { const d = document.createElement("div"); d.style.background = `var(${v})`; document.body.append(d); const c = getComputedStyle(d).backgroundColor; d.remove(); return c; };
    return { dis: getComputedStyle(dis).backgroundColor, ro: getComputedStyle(ro).backgroundColor, wantDis: tok("--surface-disable-primary"), wantRo: tok("--background-neutral-secondary") }; });
  ok("disabled text field uses the disable surface, read-only keeps its own", tfState.dis === tfState.wantDis && tfState.ro === tfState.wantRo, JSON.stringify(tfState));
  /* 값 입력 필드의 포커스 — 테두리 1px 불투명 brand + 바깥 4px 후광, 전역 외곽선은 끈다(사람의 결정 2026-10-26 — 안쪽 1px 를 더한 2px 가장자리에서 1px 로).
     선택 컨트롤은 전역 :focus-visible 외곽선 그대로다 */
  const fieldRing = async (pg, sel, boxSel) => { await go(pg); await page.locator(sel).first().evaluate((e) => e.focus());
    await page.keyboard.press("Tab"); await page.keyboard.press("Shift+Tab"); await page.waitForTimeout(250);   // 키보드 포커스(:focus-visible) · box-shadow 전환이 끝난 뒤
    return page.evaluate(([sel, boxSel]) => { const f = document.querySelector(sel), box = boxSel ? f.closest(boxSel) : f, cs = getComputedStyle(box);
      const d = document.createElement("div"); d.style.color = "var(--foreground-brand-primary)"; document.body.append(d); const brand = getComputedStyle(d).color; d.remove();
      return { shadow: cs.boxShadow, outline: getComputedStyle(f).outlineStyle, border: cs.borderTopColor, edge: cs.borderTopColor === brand, visible: f.matches(":focus-visible") }; }, [sel, boxSel]); };
  const rings = { field: await fieldRing("components/text-field.html", "#ex-text-field-basic .field input"),
    search: await fieldRing("components/search.html", "#ex-search-basic .searchbar input", ".searchbar"),
    select: await fieldRing("components/select.html", "#ex-select-default .dropdown .trigger"),
    date: await fieldRing("components/date-picker.html", "#ex-date-picker-default .affix input", ".affix") };
  ok("value fields show a 1px brand border and 4px halo on focus", Object.values(rings).every((r) => !/inset/.test(r.shadow) && /0px 0px 0px 4px/.test(r.shadow) && r.outline === "none" && r.edge), JSON.stringify(rings));
  /* 팝업이 열린 동안은 어떻게 열었든 같은 링(사람의 결정 2026-11-09) — 달력 아이콘 · Select 를 마우스로 열면 :focus-visible 이 없어 링이 없거나 테두리만 남았다 */
  const openRing = async (pg, host, opener, boxSel) => { await go(pg); const h = page.locator(host).first(); await h.scrollIntoViewIfNeeded(); await h.locator(opener).click(); await page.waitForTimeout(250);
    const r = await h.evaluate((e, b) => { const cs = getComputedStyle(e.querySelector(b)); return { open: e.classList.contains("open"), shadow: cs.boxShadow, border: cs.borderTopColor }; }, boxSel);
    await page.keyboard.press("Escape"); await page.waitForTimeout(250);
    const closed = await h.evaluate((e, b) => ({ open: e.classList.contains("open"), shadow: getComputedStyle(e.querySelector(b)).boxShadow }), boxSel);
    return { ...r, closed }; };
  const opened = { date: await openRing("components/date-picker.html", "#ex-date-picker-default .datepicker", ".cal-btn", ".affix"), select: await openRing("components/select.html", "#ex-select-default .dropdown", ".trigger", ".trigger") };
  ok("an open date picker or select shows the same ring as a focused input, whoever opened it",
    ["date", "select"].every((k) => opened[k].open && opened[k].shadow === rings[k].shadow && opened[k].border === rings[k].border && !opened[k].closed.open) && opened.date.closed.shadow === "none",
    JSON.stringify({ opened, want: { date: rings.date, select: rings.select } }));
  /* 검색창 링은 입력칸에 포커스가 있을 때만 — :focus-within 이라 지우기 버튼에 포커스가 가면 검색창 링과 버튼 외곽선이 겹쳤다(사람의 결정 2026-10-26) */
  await go("components/search.html"); await page.locator("#ex-search-extras .searchbar .clear").first().evaluate((e) => e.focus());
  await page.keyboard.press("Tab"); await page.keyboard.press("Shift+Tab"); await page.waitForTimeout(250);
  const clearFocus = await page.evaluate(() => { const c = document.querySelector("#ex-search-extras .searchbar .clear"); return { focused: document.activeElement === c, bar: getComputedStyle(c.closest(".searchbar")).boxShadow, outline: getComputedStyle(c).outlineStyle }; });
  ok("the search clear button shows only its own outline", clearFocus.focused && !/4px/.test(clearFocus.bar) && clearFocus.outline === "solid", JSON.stringify(clearFocus));
  /* 오류 필드의 포커스 — brand 링이 빨간 오류 테두리를 덮었다. 빨강 가장자리 + --line-negative-focus 후광(사람의 결정 2026-10-26) */
  const errRing = await fieldRing("components/text-field.html", "#ex-text-field-basic .field.error input");
  const errWant = await page.evaluate(() => { const c = (v) => { const d = document.createElement("div"); d.style.color = `var(${v})`; document.body.append(d); const x = getComputedStyle(d).color; d.remove(); return x; };
    return { edge: c("--foreground-negative-primary"), halo: c("--line-negative-focus") }; });
  ok("an error field keeps a red border and halo on focus", errRing.border === errWant.edge && errRing.shadow.includes(errWant.halo) && !/inset/.test(errRing.shadow) && errRing.outline === "none", JSON.stringify({ errRing, errWant }));
  /* 오류 테두리 — 16% 틴트라 필드 면 대비 1.23 으로 테두리만으로는 오류가 보이지 않았다. 불투명 빨강(사람의 결정 2026-10-26) */
  const errBorder = await page.evaluate((want) => { if (document.activeElement) document.activeElement.blur();
    return { border: getComputedStyle(document.querySelector("#ex-text-field-basic .field.error input")).borderTopColor, want }; }, errWant.edge);
  ok("an error field border is opaque red without focus", errBorder.border === errBorder.want, JSON.stringify(errBorder));
  const chkRing = await fieldRing("components/checkbox.html", "#ex-checkbox-default input");
  ok("selection controls keep the global focus outline", chkRing.outline !== "none" && !/0px 0px 0px 4px/.test(chkRing.shadow), JSON.stringify(chkRing));
  /* Checkbox · Radio 테두리 1.5px — border 1.5px 는 Chromium 이 1px 로 내려 엔진마다 굵기가 달랐다. 안쪽 그림자로 그린다(사람의 결정 2026-10-26) */
  const edge15 = []; for (const [pg, sel] of [["components/checkbox.html", "#ex-checkbox-default input"], ["components/radio-button.html", ".example-preview .radio input"]]) { await go(pg);
    edge15.push(await page.evaluate((sel) => [...document.querySelectorAll(sel)].slice(0, 3).map((i) => { const c = getComputedStyle(i); return c.borderTopWidth + " | " + c.boxShadow; }), sel)); }
  ok("checkbox and radio draw a 1.5px edge in every engine", edge15.flat().every((x) => /^0px \| .*0px 0px 0px 1\.5px inset/.test(x)), JSON.stringify(edge15));
  /* 선택된 상태는 1.5px 띠도 brand — Radio 만 border-color 로 남아 brand 면 위에 회색 띠(22%)가 보였다 */
  const onEdge = []; for (const [pg, sel] of [["components/checkbox.html", ".example-preview .checkbox input:checked"], ["components/radio-button.html", ".example-preview .radio input:checked:not(:disabled)"]]) { await go(pg);
    onEdge.push(await page.evaluate((sel) => { const i = document.querySelector(sel), c = getComputedStyle(i); return { bg: c.backgroundColor, shadow: c.boxShadow }; }, sel)); }
  ok("checked checkbox and radio keep the edge in the brand fill colour", onEdge.every((x) => x.shadow.startsWith(x.bg)), JSON.stringify(onEdge));
  await go("components/card.html");
  /* 문서 제목 자간(h3 -0.01em)이 미리보기의 카드 제목까지 먹어 배포 CSS 와 0.16px 달랐다 — 문서 제목에만 남는다 */
  const h3Ls = await page.evaluate(() => { const ls = (e) => e && getComputedStyle(e).letterSpacing;
    return { preview: ls(document.querySelector(".example-preview h3")), doc: ls([...document.querySelectorAll("article h3")].find((h) => !h.closest(".example-preview"))) }; });
  ok("docs heading letter-spacing stays out of previews", h3Ls.preview === "normal" && !!h3Ls.doc && h3Ls.doc !== "normal", JSON.stringify(h3Ls));
  const cg = page.locator("#ex-card-selection .example-preview .card-grid");
  /* Card 정의(2026-11-02) — 선택 카드: 고정 Hover 가 실제 hover 와 같은 그림자, Disabled 는 disable 토큰 · hover 없음 · 선택 안 됨 */
  await cg.locator(".card.clickable").first().hover(); await page.waitForTimeout(250);
  const cardHov = await cg.evaluate((e) => { const c = [...e.querySelectorAll(".card.clickable")]; return { real: getComputedStyle(c[0]).boxShadow, fixed: getComputedStyle(c[1]).boxShadow, state: c[1].dataset.state }; });
  ok("selection card fixed Hover matches real hover", cardHov.state === "hover" && cardHov.real !== "none" && cardHov.real === cardHov.fixed, JSON.stringify(cardHov));
  await page.mouse.move(1, 1);
  await cg.locator(".card.clickable").nth(3).hover({ force: true }); await page.waitForTimeout(250);
  const cardDis = await cg.evaluate((e) => {
    const c = e.querySelectorAll(".card.clickable")[3], cs = getComputedStyle(c), probe = document.createElement("i"); document.body.append(probe);
    const tok = (v, p) => { probe.style[p] = "var(" + v + ")"; return getComputedStyle(probe)[p]; };
    const r = { disabled: c.disabled, desc: c.querySelector(".desc").textContent, bg: cs.backgroundColor, wantBg: tok("--surface-disable-primary", "backgroundColor"), title: getComputedStyle(c.querySelector(".title")).color, descFg: getComputedStyle(c.querySelector(".desc")).color, wantDesc: tok("--foreground-neutral-tertiary", "color"), svg: getComputedStyle(c.querySelector("svg")).color, wantFg: tok("--foreground-disable-primary", "color"), shadow: cs.boxShadow, opacity: cs.opacity, cursor: cs.cursor };
    probe.remove(); return r; });
  ok("disabled selection card uses disable tokens without hover or opacity, reason stays readable", cardDis.disabled && !!cardDis.desc && cardDis.bg === cardDis.wantBg && cardDis.title === cardDis.wantFg && cardDis.svg === cardDis.wantFg && cardDis.descFg === cardDis.wantDesc && cardDis.shadow === "none" && cardDis.opacity === "1" && cardDis.cursor === "not-allowed", JSON.stringify(cardDis));
  await page.mouse.move(1, 1);
  await cg.locator(".card.clickable").nth(3).click({ force: true }); await page.waitForTimeout(150);
  ok("disabled selection card is not selected", await cg.evaluate((e) => { const c = [...e.querySelectorAll(".card.clickable")]; return !c[3].classList.contains("on") && c[3].getAttribute("aria-pressed") === "false" && c[2].classList.contains("on"); }));
  ok("selection and link cards hold no nested buttons or links", await page.evaluate(() => [...document.querySelectorAll(".example-preview .card.clickable")].every((c) => !c.querySelector("a,button,input,select,textarea"))));
  await cg.locator(".card.clickable").first().click();
  ok("clickable card single select", await cg.evaluate((e) => e.querySelectorAll(".card.on").length === 1 && e.querySelectorAll(".card")[0].classList.contains("on")));
  // .on 만으로는 선택이 보조기기에 전해지지 않는다 — aria-pressed 를 함께 갱신해야 한다
  ok("clickable card updates aria-pressed", await cg.evaluate((e) => {
    const c = [...e.querySelectorAll(".card.clickable")];
    return c[0].getAttribute("aria-pressed") === "true" && c[1].getAttribute("aria-pressed") === "false" && c.every((x) => x.tagName === "BUTTON");
  }));
  // 링크였을 때는 Space 로 선택되지 않았다
  await cg.locator(".card.clickable").nth(1).focus();
  await page.keyboard.press("Space"); await page.waitForTimeout(150);
  ok("clickable card selects with Space", await cg.evaluate((e) => {
    const c = [...e.querySelectorAll(".card.clickable")];
    return c[1].classList.contains("on") && c[1].getAttribute("aria-pressed") === "true" && !c[0].classList.contains("on");
  }));
  // 선택 표시(inset)와 포커스 링(outline)은 둘 다 보여야 한다 — 같은 outline 을 쓰면 서로 덮는다
  ok("card selection ring and focus ring coexist", await cg.evaluate((e) => {
    const on = e.querySelector(".card.on"); const c = getComputedStyle(on);
    return on.matches(":focus-visible") && c.boxShadow.includes("inset") && c.outlineStyle !== "none";
  }));
  /* 제목 = 타이포 단계(md Title/1 16/24 600 · sm Label/1 14/20 600), .compact 는 sm 과 같은 값(호환 별칭) — 제목에 line-height 가 없으면 문맥에 따라 25.6·28·26.4 로 흔들렸다 */
  const cardType = await page.evaluate(() => {
    const f = (e) => { const c = getComputedStyle(e); return c.fontSize + "/" + c.lineHeight + "/" + c.fontWeight; };
    const box = (e) => { const c = getComputedStyle(e); return c.padding + "|" + c.rowGap; };
    const host = document.querySelector("#ex-card-size .example-preview"), md = host.querySelector(".card.md"), sm = host.querySelector(".card.sm");
    const tmp = document.createElement("div"); tmp.innerHTML = '<span class="t-title-1">a</span><span class="t-label-1">a</span><div class="card compact"><h3 class="title">a</h3></div>'; host.append(tmp);
    const r = { md: f(md.querySelector(".title")), t1: f(tmp.children[0]), sm: f(sm.querySelector(".title")), l1: f(tmp.children[1]), compact: f(tmp.querySelector(".title")), mdBox: box(md), smBox: box(sm), compactBox: box(tmp.querySelector(".card")),
      inline: [md, sm].some((c) => c.querySelector(".title").hasAttribute("style")) };
    tmp.remove(); return r; });
  ok("card titles match Title/1 · Label/1 and compact equals sm", cardType.md === "16px/24px/600" && cardType.md === cardType.t1 && cardType.sm === "14px/20px/600" && cardType.sm === cardType.l1 && cardType.compact === cardType.sm && cardType.mdBox === "24px|12px" && cardType.smBox === "16px|8px" && cardType.compactBox === cardType.smBox && !cardType.inline, JSON.stringify(cardType));
  /* 상태 카드의 키-값 행 — 값 열이 한 줄로 맞고 키(secondary)와 값(primary)의 색이 다르다 */
  const meta = await page.evaluate(() => [...document.querySelectorAll("#ex-card-status .card-meta")].map((dl) => ({ ddX: [...new Set([...dl.querySelectorAll("dd")].map((d) => Math.round(d.getBoundingClientRect().left)))].length, dt: getComputedStyle(dl.querySelector("dt")).color, dd: getComputedStyle(dl.querySelector("dd")).color, ind: !!dl.closest(".card").querySelector(".card-head .indicator") })));
  ok("status card meta aligns values in one column under an indicator head", meta.length === 2 && meta.every((m) => m.ddX === 1 && m.dt !== m.dd && m.ind), JSON.stringify(meta));
  /* 빈 · 오류 — 카드 안 .empty 는 점선 · 면 없이, 오류에는 다시 시도 */
  const empt = await page.evaluate(() => [...document.querySelectorAll("#ex-card-empty .card .empty")].map((e) => ({ border: getComputedStyle(e).borderTopStyle, bg: getComputedStyle(e).backgroundColor, head: !!e.closest(".card").querySelector(".card-head .title"), error: e.classList.contains("error"), retry: [...e.querySelectorAll("button")].some((b) => b.textContent.includes("다시 시도")), icoBg: getComputedStyle(e.querySelector(".ico")).backgroundColor, svg: (() => { const r = e.querySelector(".ico svg").getBoundingClientRect(); return r.width + "x" + r.height; })() })));
  ok("card head 'view all' buttons are text assistive", await page.evaluate(() => { const bs = [...document.querySelectorAll(".example-preview .card .card-head .btn.text")]; return bs.length === 3 && bs.every((b) => b.classList.contains("assistive")); }));
  ok("empty and error cards keep the head, drop the empty frame and icon tile (icon 36), error offers retry", empt.length === 2 && empt.every((e) => e.border === "none" && e.bg === "rgba(0, 0, 0, 0)" && e.head && e.icoBg === "rgba(0, 0, 0, 0)" && e.svg === "36x36") && empt.some((e) => e.error && e.retry), JSON.stringify(empt));
  // Radio Button 회귀 — label.radio.card 가 .card 의 column·그림자를 받으면 점이 라벨 위로 간다
  await go("components/radio-button.html");
  const radioCard = await page.evaluate(() => {
    const lbl = document.querySelector(".radio.card");
    const i = lbl.querySelector("input").getBoundingClientRect(), sp = lbl.querySelector("span").getBoundingClientRect();
    return { 세로차: Math.round(Math.abs(sp.top - i.top)), shadow: getComputedStyle(lbl).boxShadow, dir: getComputedStyle(lbl).flexDirection };
  });
  ok("radio card stays a row without card shadow", radioCard.세로차 < 6 && radioCard.shadow === "none" && radioCard.dir === "row", JSON.stringify(radioCard));
  // 카드 안 기간 선택은 패널 없는 tablist 가 아니라 Select Button(radiogroup)
  await go("components/card.html");
  const cardSb = page.locator("#ex-card-header .select-btn");
  ok("card header uses a select button group", await cardSb.evaluate((e) => e.getAttribute("role") === "radiogroup" && !!e.getAttribute("aria-label") && !e.closest(".card").querySelector("[role=tablist]")));
  await cardSb.locator("button").nth(1).click(); await page.waitForTimeout(150);
  ok("card header select button toggles", await cardSb.evaluate((e) => {
    const b2 = [...e.querySelectorAll("button")];
    return b2[1].getAttribute("aria-checked") === "true" && b2[0].getAttribute("aria-checked") === "false";
  }));
  // .flush — 표를 카드 폭까지 채우는 관용구를 변형으로
  await go("patterns/dashboard.html");
  const fl = await page.evaluate(() => {
    const c = document.querySelector(".card.flush");
    if (!c) return { 없음: true };
    return { padding: getComputedStyle(c).padding, headPadding: getComputedStyle(c.querySelector(".card-head")).padding, inline: c.getAttribute("style"), viewAll: !!c.querySelector(".card-head .btn.text.assistive") };
  });
  ok("flush card has no padding but its head does, view-all is text assistive", fl.padding === "0px" && fl.headPadding === "16px 24px" && !fl.inline && fl.viewAll, JSON.stringify(fl));
  await go("components/card.html");
  // wrap 이 없으면 액션이 카드 왼쪽으로 넘치고, 시작 방향 넘침은 스크롤로 닿을 수 없다
  const footFit = async () => page.evaluate(() => {
    const f = document.querySelector("#ex-card-default .card-foot");
    f.innerHTML = ["정책 상세 보기", "라이선스 갱신 요청", "담당자에게 문의"].map((t) => `<button type="button" class="btn sm outline assistive">${t}</button>`).join("");
    const card = f.closest(".card"), cr = card.getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(card).paddingLeft);
    const left = Math.min(...[...f.children].map((c) => c.getBoundingClientRect().left - cr.left));
    return { 바깥으로: Math.round(pad - left), 줄수: new Set([...f.children].map((c) => Math.round(c.getBoundingClientRect().top))).size, wrap: getComputedStyle(f).flexWrap };
  });
  const foot1440 = await footFit();
  ok("card foot wraps instead of spilling left", foot1440.바깥으로 <= 0 && foot1440.wrap === "wrap" && foot1440.줄수 === 2, JSON.stringify(foot1440));
  await page.setViewportSize({ width: 390, height: 900 }); await page.waitForTimeout(350);
  const foot390 = await footFit();
  ok("card foot stays inside at 390", foot390.바깥으로 <= 0, JSON.stringify(foot390));
  await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(250);
  // 카드는 보더로 구획한다 — 선택돼도 shadow/1 이 붙으면 안 된다(호환용 .bordered 도 같다)
  const bOn = await page.evaluate(() => {
    const prev = document.querySelector("#ex-card-size .example-preview");
    const mk = (cls) => { const c = prev.querySelector(".card").cloneNode(true); c.className = cls; prev.append(c); const st = getComputedStyle(c); return { shadow: st.boxShadow, border: st.borderWidth, bg: st.backgroundColor }; };
    return { on: mk("card bordered on"), plain: mk("card on") };
  });
  ok("selected card keeps the ring only", [bOn.on, bOn.plain].every((x) => x.shadow.includes("inset") && !/1px 3px/.test(x.shadow) && x.border === "1px"), JSON.stringify(bOn));
  // loading 예제
  const ld = await page.evaluate(() => {
    const c = document.querySelector("#ex-card-loading .card");
    const loaded = document.querySelector("#ex-card-default .card");
    return { busy: c.getAttribute("aria-busy"), 스켈레톤: c.querySelectorAll(".skeleton").length,
      애니메이션: getComputedStyle(c.querySelector(".skeleton")).animationName,
      높이: Math.round(c.getBoundingClientRect().height), 로드된높이: Math.round(loaded.getBoundingClientRect().height) };
  });
  ok("loading card is busy and shows skeletons", ld.busy === "true" && ld.스켈레톤 === 3 && ld.애니메이션 === "shimmer" && ld.높이 < ld.로드된높이, JSON.stringify(ld));
  /* variant flat(사람의 결정 2026-11-03) — 보더 색만 지우고(두께 1px 는 남아 outline 과 크기 같음) 그림자는 두지 않는다.
     면 색 차이(1.07 · 1.20)로만 갈리므로 background/neutral/secondary 위에서만 쓴다 — 흰 바탕 위에서는 카드가 사라진다 */
  const flatCheck = (sel) => page.evaluate((sel) => {
    const probe = document.createElement("i"); document.body.append(probe); probe.style.backgroundColor = "var(--background-neutral-secondary)";
    const canvasWant = getComputedStyle(probe).backgroundColor; probe.remove();
    const canvasOf = (el) => { for (let p = el.parentElement; p; p = p.parentElement) { const b = getComputedStyle(p).backgroundColor; if (b !== "rgba(0, 0, 0, 0)") return b; } return "none"; };
    return [...document.querySelectorAll(sel)].map((c) => {
      const cs = getComputedStyle(c), twin = c.cloneNode(true); twin.classList.remove("flat"); c.after(twin);
      const a = c.getBoundingClientRect(), b = twin.getBoundingClientRect(), tc = getComputedStyle(twin).borderTopColor; twin.remove();
      return { cls: c.className, color: cs.borderTopColor, width: cs.borderTopWidth, shadow: cs.boxShadow, outline: tc, same: Math.abs(a.width - b.width) < 0.5 && Math.abs(a.height - b.height) < 0.5, canvas: canvasOf(c) === canvasWant };
    });
  }, sel);
  const flatCards = await flatCheck(".example-preview .card.flat");
  ok("flat cards drop only the border colour and keep the outline size, no shadow", flatCards.length === 2 && flatCards.every((x) => x.color === "rgba(0, 0, 0, 0)" && x.width === "1px" && x.shadow === "none" && x.outline !== x.color && x.same), JSON.stringify(flatCards));
  ok("flat cards sit only on background/neutral/secondary", flatCards.every((x) => x.canvas), JSON.stringify(flatCards.map((x) => x.canvas)));
  const flatOn = await page.evaluate(() => { const c = document.querySelector("#ex-card-flat .card.flat").cloneNode(true); c.classList.add("on"); document.querySelector("#ex-card-flat .example-preview > div").append(c);
    const cs = getComputedStyle(c), r = { shadow: cs.boxShadow, border: cs.borderTopColor }; c.remove(); return r; });
  ok("flat card still shows the 2px selection ring", /0px 0px 0px 2px inset/.test(flatOn.shadow) && flatOn.border === "rgba(0, 0, 0, 0)", JSON.stringify(flatOn));
  await go("components/data-visual.html");
  const flatDv = await flatCheck(".example-preview :is(.kpi, .chart-card).flat");
  ok("flat KPI and Chart Card drop only the border colour and keep the outline size", flatDv.length === 3 && flatDv.some((x) => x.cls.startsWith("chart-card")) && flatDv.every((x) => x.color === "rgba(0, 0, 0, 0)" && x.width === "1px" && x.shadow === "none" && x.outline !== x.color && x.same), JSON.stringify(flatDv));
  ok("flat KPI and Chart Card sit only on background/neutral/secondary", flatDv.every((x) => x.canvas), JSON.stringify(flatDv.map((x) => x.canvas)));
  /* 회색 바탕 래퍼가 내용 폭으로 줄면(미리보기는 가운데 정렬 flex) KPI 가 세로로 쌓이고 막대가 2px 로 눌렸다 — 래퍼는 폭을 채운다 */
  const flatDvFit = await page.evaluate(() => ({ kpiRows: new Set([...document.querySelectorAll("#ex-data-visual-flat .kpi")].map((k) => Math.round(k.getBoundingClientRect().top))).size, bars: [...document.querySelectorAll("#ex-data-visual-flat .chart .bar")].map((b) => Math.round(b.getBoundingClientRect().width)) }));
  ok("flat dashboard example keeps KPIs in one row and bars readable", flatDvFit.kpiRows === 1 && flatDvFit.bars.length === 2 && flatDvFit.bars.every((w) => w >= 200), JSON.stringify(flatDvFit));
  /* 탐색형 차트(Chart.js, 사람의 결정 2026-11-03) — 예제 canvas 가 실제로 그려지고, 계열 · 격자 색이 토큰 계산값과 같으며, 테마를 바꾸면 다시 칠한다.
     색은 ds-chart 가 읽은 토큰(DSChart.resolve)과 Chart.js 데이터셋의 실제 색을 대조한다 — 기억이 아니라 같은 페이지의 계산값이다 */
  await page.waitForFunction(() => window.Chart && window.DSChart && [...document.querySelectorAll("canvas[data-chart]")].every((c) => c.__dsChart && c.__dsChart.chart.ctx), null, { timeout: 5000 }).catch(() => {});
  const chartProbe = () => page.evaluate(() => {
    const tok = (name) => DSChart.resolve(document.body, name);
    return [...document.querySelectorAll("canvas[data-chart]")].map((c) => {
      const h = c.__dsChart, ch = h && h.chart, kind = c.dataset.chart, ds = ch ? ch.data.datasets : [], r = c.getBoundingClientRect();
      if (!ch) return { kind, mounted: false };
      const seriesTok = (i) => tok(DSChart.TOKENS.series[Math.min(i, DSChart.SERIES_MAX - 1)]);
      return { kind, mounted: true, label: c.getAttribute("aria-label"), h: Math.round(r.height), w: Math.round(r.width), n: ds.length, legend: ch.options.plugins.legend.display,
        yAxes: Object.keys(ch.options.scales || {}).filter((k) => k.startsWith("y")).length,
        colors: kind === "donut" ? ds[0].backgroundColor : ds.map((d) => d.type === "line" || kind === "timeseries" ? d.borderColor : d.backgroundColor),
        want: kind === "donut" ? ds[0]._dsTones.map((t, i) => t ? tok(DSChart.TONES[t]) : seriesTok(i)) : ds.map((d, i) => d.tone ? tok(DSChart.TONES[d.tone]) : seriesTok(i)),
        grid: kind === "donut" ? null : ch.options.scales.y.grid.color, gridTok: tok(DSChart.TOKENS.grid), axis: ch.options.plugins.legend.labels.color, axisTok: tok(DSChart.TOKENS.axis),
        line: ds[0].borderWidth, pr: ds[0].pointHoverRadius, radius: ds[0].borderRadius,
        /* 막대는 각지고 stroke 가 없다(2026-11-05) — 누적 틈의 투명 테두리도 지웠다(2026-11-06) */
        bars: ds.filter((d) => d.type === "bar" || (kind === "bar" && !d.type)).map((d) => [d.borderRadius, typeof d.borderWidth === "object" ? JSON.stringify(d.borderWidth) : d.borderWidth, d.borderColor]),
        point: [ch.options.plugins.legend.labels.pointStyle, ch.options.plugins.tooltip.pointStyle] };
    });
  });
  const ch1 = await chartProbe();
  ok("chart examples render with Chart.js at 240 high and carry an accessible name", ch1.length === 6 && ch1.every((c) => c.mounted && c.h === 240 && c.w > 200 && c.label), JSON.stringify(ch1.map((c) => [c.kind, c.mounted, c.h, c.w])));
  ok("chart series · grid · axis colours equal the token values ds-chart resolved", ch1.every((c) => c.mounted && JSON.stringify(c.colors) === JSON.stringify(c.want) && (c.grid === null || c.grid === c.gridTok) && c.axis === c.axisTok), JSON.stringify(ch1.map((c) => [c.kind, c.colors, c.want, c.grid, c.gridTok])));
  /* 범주 축은 라벨을 건너뛰지 않는다 — paint 가 기본 옵션으로 프리셋 옵션을 덮어 5개 중 3개만 보였다(Figma 대조에서 발견, 2026-11-04) */
  const barTicks = await page.evaluate(() => [...document.querySelectorAll('canvas[data-chart="bar"]')].map((c) => { const ch = c.__dsChart.chart, ax = ch.options.indexAxis === "y" ? "y" : "x"; return { labels: ch.data.labels.length, ticks: ch.scales[ax].ticks.length, autoSkip: ch.options.scales[ax].ticks.autoSkip }; }));
  ok("bar charts show every category label", barTicks.length === 2 && barTicks.every((b) => b.ticks === b.labels && b.autoSkip === false), JSON.stringify(barTicks));
  ok("chart legend only with 2+ series, mixed keeps one y axis, line 2 · hover point 8 · bar radius 0", ch1.every((c) => c.legend === (c.kind === "donut" ? true : c.n > 1)) && ch1.filter((c) => c.kind !== "donut").every((c) => c.yAxes === 1) && ch1.filter((c) => c.kind === "timeseries").every((c) => c.line === 2 && c.pr === 4) && ch1.filter((c) => c.kind === "bar").every((c) => c.radius === 0), JSON.stringify(ch1.map((c) => [c.kind, c.n, c.legend, c.yAxes, c.line, c.pr, c.radius])));
  ok("chart bars are square with no stroke or border at all (bar · mixed)", ch1.filter((c) => c.bars.length).length === 3 && ch1.every((c) => c.bars.every(([r, w, col]) => r === 0 && w === 0 && col === "transparent")), JSON.stringify(ch1.map((c) => [c.kind, c.bars])));
  ok("chart legends and tooltips use circle markers", ch1.every((c) => c.point[0] === "circle" && c.point[1] === "circle"), JSON.stringify(ch1.map((c) => [c.kind, c.point])));
  /* 비교 기간은 계열 1의 옅은 톤, 막대 위 선은 진한 톤(사람의 결정 2026-11-05) — tone 이 빠지면 계열 2(주황)로 칠해진다 */
  const tones = await page.evaluate(() => { const tok = (n) => DSChart.resolve(document.body, n); const weeks = document.querySelectorAll('canvas[data-chart="bar"]')[0].__dsChart.chart.data.datasets, mixed = document.querySelector('canvas[data-chart="mixed"]').__dsChart.chart.data.datasets;
    return { now: weeks[0].backgroundColor, prev: weeks[1].backgroundColor, line: mixed.find((d) => d.type === "line").borderColor, bar: mixed.find((d) => d.type === "bar").backgroundColor, s1: tok("--chart-series-1"), subtle: tok("--chart-series-1-subtle"), strong: tok("--chart-series-1-strong") }; });
  ok("week comparison uses series 1 and its subtle tone, the mixed line its strong tone", tones.now === tones.s1 && tones.prev === tones.subtle && tones.bar === tones.s1 && tones.line === tones.strong && tones.subtle !== tones.s1 && tones.strong !== tones.s1, JSON.stringify(tones));
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark")); await page.waitForTimeout(300);
  const ch2 = await chartProbe();
  ok("charts repaint on theme change with the dark token values", ch2.every((c) => JSON.stringify(c.colors) === JSON.stringify(c.want) && (c.grid === null || c.grid === c.gridTok)) && ch2.every((c, i) => JSON.stringify(c.colors) !== JSON.stringify(ch1[i].colors)), JSON.stringify(ch2.map((c, i) => [c.kind, ch1[i].colors[0], c.colors[0]])));
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme")); await page.waitForTimeout(300);
  /* 누적 세그먼트는 틈 없이 붙는다(사람의 요청 2026-11-06) — 누적 가로 막대의 첫 세그먼트 끝(x) 좌우 8px 를 막대 가운데 높이에서 읽어 비어 있는(알파 < 40) 픽셀을 센다.
     경과: 2px 면 색 stroke(틈 ≈4px) → 2px 투명 틈(2026-11-05) → 틈 없음 */
  const gap = await page.evaluate(() => {
    const c = document.querySelectorAll('canvas[data-chart="bar"]')[1], ch = c.__dsChart.chart, b0 = ch.getDatasetMeta(0).data[0], dpr = c.width / c.getBoundingClientRect().width;
    const img = c.getContext("2d").getImageData(Math.round((b0.x - 4) * dpr), Math.round(b0.y * dpr), Math.round(8 * dpr), 1).data; let hit = 0;
    for (let i = 3; i < img.length; i += 4) if (img[i] < 40) hit++;
    return { css: +(hit / dpr).toFixed(1), dpr, horizontal: ch.options.indexAxis === "y", stacked: ch.options.scales.x.stacked };
  });
  ok("stacked bar segments touch with no gap", gap.horizontal && gap.stacked && gap.css === 0, JSON.stringify(gap));
  /* 옆 범례는 자리가 좁고 세로로 길면 아래로(사람의 요청 2026-11-06) — 탐색형 도넛(legend right)의 캔버스 자리를 260 으로 줄이면 범례가 차트 아래, 되돌리면 다시 오른쪽.
     정적 .donut-row 는 한 줄에 안 들어가는 폭(200)에서 범례가 도넛 아래로 줄을 바꾸고 넘치지 않는다 */
  const legendAt = () => page.evaluate(() => { const ch = document.querySelector('canvas[data-chart="donut"]').__dsChart.chart, l = ch.legend, a = ch.chartArea;
    return { pos: ch.options.plugins.legend.position, below: l.top >= a.bottom - 1, right: l.left >= a.right - 1, w: Math.round(ch.width), r: Math.round(ch.getDatasetMeta(0).data[0].outerRadius) }; });
  const holder = 'canvas[data-chart="donut"]';
  const lgWide = await legendAt();
  await page.evaluate((sel) => { document.querySelector(sel).parentElement.style.width = "260px"; }, holder); await page.waitForTimeout(400);
  const lgNarrow = await legendAt();
  await page.evaluate((sel) => { document.querySelector(sel).parentElement.style.width = ""; }, holder); await page.waitForTimeout(400);
  const lgBack = await legendAt();
  ok("donut side legend drops below the chart in a narrow, tall slot and returns when wide", lgWide.pos === "right" && lgWide.right && lgNarrow.pos === "bottom" && lgNarrow.below && lgBack.pos === "right" && lgBack.right, JSON.stringify({ lgWide, lgNarrow, lgBack }));
  /* '좁은 자리' 예제(폭 300 카드) — 같은 spec(legend right)이 처음부터 아래 범례로 그려지고, 같은 캔버스에서 옆 범례일 때보다 도넛이 크다 */
  const lgEx = await page.evaluate(() => { const ch = document.querySelector('#ex-data-visual-donut-narrow canvas[data-chart="donut"]').__dsChart.chart, l = ch.legend, a = ch.chartArea;
    const r = { spec: ch.$ds.legend, pos: ch.options.plugins.legend.position, below: l.top >= a.bottom - 1, w: Math.round(ch.width), h: Math.round(ch.height), r: Math.round(ch.getDatasetMeta(0).data[0].outerRadius) };
    ch.options.plugins.legend.position = "right"; ch.update("none"); r.rIfRight = Math.round(ch.getDatasetMeta(0).data[0].outerRadius);   // 같은 캔버스에서 옆 범례였다면
    ch.options.plugins.legend.position = r.pos; ch.update("none"); return r; });
  ok("narrow donut example draws its right legend below the chart", lgEx.spec === "right" && lgEx.pos === "bottom" && lgEx.below && lgEx.w < lgEx.h * 1.5 && lgEx.r > lgEx.rIfRight, JSON.stringify(lgEx));
  const rowWrap = await page.evaluate(() => { const row = document.querySelector("#ex-data-visual-donut .donut-row"), at = () => { const d = row.querySelector(".donut").getBoundingClientRect(), l = row.querySelector(".chart-legend").getBoundingClientRect(), r = row.getBoundingClientRect();
      return { below: l.top >= d.bottom - 1, gap: Math.round(l.top - d.bottom), over: Math.round(Math.max(d.right, l.right) - r.right) }; };
    const side = at(); row.style.width = "200px"; const tight = at(); row.style.width = ""; return { side, tight }; });
  ok("static donut row wraps its legend under the donut when it cannot fit beside it", !rowWrap.side.below && rowWrap.tight.below && rowWrap.tight.gap === 16 && rowWrap.tight.over <= 0, JSON.stringify(rowWrap));
  await go("patterns/dashboard.html");
  await page.waitForFunction(() => [...document.querySelectorAll("canvas[data-chart]")].every((c) => c.__dsChart && c.__dsChart.chart.ctx), null, { timeout: 5000 }).catch(() => {});
  const dash = await page.evaluate(() => ({ trend: !!(document.querySelector('.row-3 canvas[data-chart="timeseries"]') || {}).__dsChart, donut: document.querySelector(".row-3 .donut").getAttribute("aria-label"), script: !!document.querySelector('script[src$="assets/ds-chart.js"]') }));
  ok("dashboard pattern draws a timeseries trend and names donut shares", dash.trend && /%/.test(dash.donut) && dash.script, JSON.stringify(dash));
  await go("components/data-visual.html");
  /* 정적 요약(2026-11-05) — 막대 · 트랙 · 스파크라인은 각지고, 범례 아이콘은 원형이며, 도넛 경계는 폭이 일정한 2px 구분선(i)이다.
     구분선의 회전은 조각 경계 각도(위 = 0°, 시계 방향)와 같아야 한다 — 예제 값 190 · 285 · 196 · 120 · 263(5단계, 2026-11-06)에서 센다 */
  const statics = await page.evaluate(() => {
    const rad = (sel) => [...new Set([...document.querySelectorAll(sel)].map((e) => getComputedStyle(e).borderTopLeftRadius))];
    const d = document.querySelector("#ex-data-visual-donut .donut"), ring = (d.getBoundingClientRect().width - parseFloat(getComputedStyle(d, "::after").width)) / 2;
    const cuts = [...d.querySelectorAll("i")].map((i) => { const m = getComputedStyle(i).transform.match(/matrix\(([^,]+), ([^,]+)/); const deg = m ? (Math.atan2(+m[2], +m[1]) * 180 / Math.PI + 360) % 360 : 0; return { w: getComputedStyle(i).width, h: getComputedStyle(i).height, deg: +deg.toFixed(1) }; });
    const vals = [190, 285, 196, 120, 263], total = vals.reduce((a, b) => a + b, 0); let acc = 0; const want = vals.map((v) => { const a = +(acc / total * 360).toFixed(1); acc += v; return a; });
    return { bars: rad(".example-preview .chart .bar, .example-preview .chart .bar i, .example-preview .sparkline i"), legend: rad(".example-preview .chart-legend i"), ring, cuts, want, kpis: document.querySelectorAll("#ex-data-visual-kpi .kpi").length };
  });
  ok("static bars, tracks and sparklines are square", statics.bars.length === 1 && statics.bars[0] === "0px", JSON.stringify(statics.bars));
  ok("static legend markers are circles", statics.legend.length === 1 && statics.legend[0] === "50%", JSON.stringify(statics.legend));
  ok("static donut boundaries are 2px straight separators spanning the ring at each slice edge", statics.cuts.length === 5 && statics.cuts.every((c, i) => c.w === "2px" && parseFloat(c.h) === statics.ring && Math.abs(c.deg - statics.want[i]) <= 0.2), JSON.stringify(statics));
  ok("KPI example shows three cards", statics.kpis === 3, String(statics.kpis));
  /* KPI 단위 = Title 1 Medium · 증감 = Label 2 SemiBold(2026-11-06) — 종전엔 값 · 카드의 행간 · 자간을 물려받아 어느 텍스트 스타일과도 맞지 않았다 */
  const kpiType = await page.evaluate(() => {
    const f = (e) => { const c = getComputedStyle(e); return [c.fontSize, c.lineHeight, c.fontWeight, c.letterSpacing].join("/"); };
    const host = document.querySelector("#ex-data-visual-kpi .example-preview");
    const tmp = document.createElement("div"); tmp.innerHTML = '<span class="t-title-1-medium">a</span><span class="t-label-2-semibold">a</span>'; host.append(tmp);
    const r = { unit: [...new Set([...host.querySelectorAll(".kpi .value small")].map(f))], delta: [...new Set([...host.querySelectorAll(".kpi .delta")].map(f))], t1m: f(tmp.children[0]), l2s: f(tmp.children[1]) };
    tmp.remove(); return r; });
  ok("KPI unit matches Title 1 Medium and delta matches Label 2 SemiBold", kpiType.unit.length === 1 && kpiType.unit[0] === kpiType.t1m && kpiType.t1m.startsWith("16px/24px/500/") && kpiType.delta.length === 1 && kpiType.delta[0] === kpiType.l2s && kpiType.l2s.startsWith("12px/16px/600/"), JSON.stringify(kpiType));

  /* 심각도 5단계(사람의 결정 2026-11-06) — 정적 지표(막대 · 범례 · 밴드 · 행 막대) · 정적 도넛 조각 · 탐색형 차트 톤이 전부 같은 토큰을 집는지.
     차트 색 단정은 DSChart.TONES 와 대조하므로 TONES 자체가 틀리면 함께 틀린다 — 여기서는 기대 토큰을 직접 적어 둘 다 잰다 */
  const SEV_TOK = { critical: "--foreground-negative-strong", high: "--foreground-cautionary-primary", medium: "--foreground-accent-lime", low: "--foreground-accent-light-blue", info: "--foreground-inactive-primary" };
  for (const theme of ["light", "dark"]) {
    await page.evaluate((t) => { t === "dark" ? document.documentElement.setAttribute("data-theme", "dark") : document.documentElement.removeAttribute("data-theme"); }, theme);
    await page.waitForTimeout(200);
    const sev = await page.evaluate((SEV) => {
      const res = (n) => { const d = document.createElement("i"); d.style.color = "var(" + n + ")"; document.body.append(d); const v = getComputedStyle(d).color; d.remove(); return v; };
      const host = document.createElement("div"); host.innerHTML = Object.keys(SEV).map((l) => `<div class="chart"><div class="bar ${l}"><i></i></div></div><div class="chart-legend"><i class="${l}"></i></div><div class="sev-band"><i class="${l}"></i></div><span class="sev-cell"><i class="${l}"></i></span>`).join("");
      document.body.append(host);
      const out = {};
      for (const l of Object.keys(SEV)) {
        const want = res(SEV[l]);
        const got = [".chart .bar." + l + " i", ".chart-legend i." + l, ".sev-band i." + l, ".sev-cell i." + l].map((q) => getComputedStyle(host.querySelector(q)).backgroundColor);
        out[l] = { want, got, chart: DSChart.resolve(document.body, DSChart.TONES[l]) };
      }
      host.remove();
      /* 정적 도넛의 conic 조각 — 다섯 조각이 이 순서로 */
      const bg = getComputedStyle(document.querySelector("#ex-data-visual-donut .donut")).backgroundImage;
      out.donut = Object.keys(SEV).every((l, i, a) => { const at = bg.indexOf(out[l].want); return at >= 0 && (i === 0 || at > bg.indexOf(out[a[i - 1]].want)); });
      return out;
    }, SEV_TOK);
    const bad = Object.keys(SEV_TOK).filter((l) => !(sev[l].got.every((c) => c === sev[l].want) && sev[l].chart === sev[l].want));
    ok(`${theme} five severity ranks paint the same token in bars · legend · band · row bar · chart`, bad.length === 0 && sev.donut, JSON.stringify(bad.length ? bad.map((l) => [l, sev[l]]) : sev.donut));
  }
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));

  // Nav
  await go("components/navigation.html");
  const nav = page.locator(".example-preview .sidenav").first();
  await nav.locator("a").nth(2).click();
  ok("sidenav active moves", await nav.evaluate((e) => e.querySelectorAll("a.on").length === 1 && e.querySelectorAll("a")[2].classList.contains("on")));
  /* 하위 항목을 골라도 brand 글자 — .sub 가 .on 과 특정도가 같고 뒤에 있어 회색이 이겼다 */
  await nav.locator("a.sub").first().click();
  const subOn = await nav.evaluate((e) => {
    const a = e.querySelector("a.sub"), d = document.createElement("div"); d.style.color = "var(--foreground-brand-primary)"; document.body.append(d);
    const want = getComputedStyle(d).color; d.remove();
    return { on: a.classList.contains("on"), color: getComputedStyle(a).color, want };
  });
  ok("selected sub item uses the brand colour", subOn.on && subOn.color === subOn.want, JSON.stringify(subOn));
  /* 하위 항목을 고르면 바로 위 부모가 .has-on, 다른 항목을 고르면 풀린다 — ds.js 가 .on 만 옮겨 부모 표시가 남으면 접힌 레일에서 두 항목이 선택돼 보인다 */
  const parentMark = await nav.evaluate((e) => { let p = e.querySelector("a.sub.on").previousElementSibling; while (p && p.matches("a.sub")) p = p.previousElementSibling;
    return { parent: p && p.textContent.trim(), has: [...e.querySelectorAll("a.has-on")].map((a) => a.textContent.trim()) }; });
  await nav.locator("a").first().click();
  const parentCleared = await nav.evaluate((e) => e.querySelectorAll("a.has-on").length);
  ok("picking a sub item marks its parent, picking another item clears it", parentMark.has.length === 1 && parentMark.has[0] === parentMark.parent && parentCleared === 0, JSON.stringify({ ...parentMark, parentCleared }));
  /* 접힌 레일의 하위 항목 — 아이콘이 없어 글자만 64px 레일 안에 그려졌다. 항목째 숨는다(예제에 sub 가 없어 넣어서 잰다) */
  const railSub = await page.evaluate(() => {
    const nav = document.querySelector("#ex-navigation-collapsed .sidenav.collapsed"), a = document.createElement("a");
    a.href = "#"; a.className = "sub"; a.textContent = "USB 제어"; nav.append(a);
    const r = { sub: getComputedStyle(a).display, item: getComputedStyle(nav.querySelector("a:not(.sub)")).display }; a.remove(); return r;
  });
  ok("collapsed rail hides sub items", railSub.sub === "none" && railSub.item !== "none", JSON.stringify(railSub));
  /* 접힌 레일 — .foot 은 64 폭에서 한 글자씩 세로로 쪼개졌고(React 는 접히면 그리지 않는다), 현재 메뉴가 하위 항목이면 레일 어디에도 선택 표시가 없었다.
     부모(.has-on)가 접힌 레일에서만 .on 과 같은 면·아이콘이 된다(예제에 없는 상황이라 넣어서 잰다) */
  const railMore = await page.evaluate(() => {
    const rail = document.querySelector("#ex-navigation-collapsed .sidenav.collapsed"), open = document.querySelector("#ex-navigation-basic .sidenav:not(.collapsed)");
    const foot = document.createElement("div"); foot.className = "foot"; foot.textContent = "v2.4.1 · 라이선스 정상"; rail.append(foot);
    const look = (a) => ({ bg: getComputedStyle(a).backgroundColor, icon: getComputedStyle(a.querySelector("svg")).color });
    const pick = (nav) => { const items = [...nav.querySelectorAll("a:not(.on):not(.sub)")], p = items[0]; p.classList.add("has-on");
      const r = { parent: look(p), on: look(nav.querySelector("a.on:not(.sub)") || p), plain: look(items[1]) }; p.classList.remove("has-on"); return r; };
    const r = { foot: getComputedStyle(foot).display, rail: pick(rail), open: pick(open) }; foot.remove(); return r;
  });
  ok("collapsed rail hides the footer", railMore.foot === "none", railMore.foot);
  ok("parent of the current sub item looks selected only in the collapsed rail",
    JSON.stringify(railMore.rail.parent) === JSON.stringify(railMore.rail.on) && JSON.stringify(railMore.rail.parent) !== JSON.stringify(railMore.rail.plain)
    && JSON.stringify(railMore.open.parent) === JSON.stringify(railMore.open.plain), JSON.stringify(railMore));
  ok("no scroll jump (hash unchanged)", !(await page.evaluate(() => location.hash)));

  // Data Visual — sparkline 을 품은 KPI: 값 옆이면 밑변이 숫자 기준선, 좁으면 값 아래로 내려가 넘치지 않는다
  await go("components/data-visual.html");
  const spark = await page.evaluate(() => {
    const m = (k) => { const v = k.querySelector(".value"), sp = k.querySelector(".sparkline");
      const pr = document.createElement("span"); pr.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline"; v.append(pr); const base = pr.getBoundingClientRect().bottom; pr.remove();
      const s = sp.getBoundingClientRect(), vr = v.getBoundingClientRect(), kr = k.getBoundingClientRect();
      return { beside: s.top < vr.bottom && s.bottom > vr.top, drift: +(s.bottom - base).toFixed(1), inside: s.right <= kr.right - 1 + 0.5, overflow: k.scrollWidth > k.clientWidth }; };
    const ex = document.querySelector("#ex-data-visual-spark .kpi");
    /* 좁은 칸(최소 폭 180)에 긴 값 — 2열 grid 였을 때 보더 밖으로 넘쳤다 */
    const narrow = ex.cloneNode(true); narrow.style.cssText = "width:180px;min-width:0"; narrow.querySelector(".value").innerHTML = "1,247<small>/ 1,284</small>";   /* KPI 예제의 실제 마크업(단위는 small) */
    ex.parentElement.append(narrow);
    const r = { example: m(ex), narrow: m(narrow) }; narrow.remove(); return r;
  });
  ok("sparkline KPI sits beside the value on its baseline", spark.example.beside && Math.abs(spark.example.drift) <= 1 && spark.example.inside, JSON.stringify(spark.example));
  ok("sparkline KPI wraps under a long value instead of overflowing", !spark.narrow.beside && spark.narrow.inside && !spark.narrow.overflow, JSON.stringify(spark.narrow));

  /* 강조 막대 — 일반 막대와 같은 brand-primary 라 .hi 가 보이지 않았다 */
  const sparkTone = await page.evaluate(() => { const bars = [...document.querySelectorAll("#ex-data-visual-spark .sparkline i")];
    const hi = bars.find((b) => b.classList.contains("hi")), lo = bars.find((b) => !b.classList.contains("hi"));
    return { hi: getComputedStyle(hi).backgroundColor, lo: getComputedStyle(lo).backgroundColor }; });
  ok("sparkline highlight bar differs from the others", sparkTone.hi !== sparkTone.lo, JSON.stringify(sparkTone));
  /* 도넛 조각 사이 틈 — 이웃 조각의 밝기 대비가 낮아 틈이 없으면 색상으로만 갈린다. 조각은 이어 붙이고(그라데이션 색 5종 — 심각도 5단계) 틈은 면 색 구분선(i)이 낸다(React Donut 과 같은 골격, 2026-11-05) */
  const donutGap = await page.evaluate(() => { const el = document.querySelector("#ex-data-visual-donut .donut"), bg = getComputedStyle(el).backgroundImage;
    const d = document.createElement("div"); d.style.color = "var(--surface-elevated-primary)"; document.body.append(d); const gap = getComputedStyle(d).color; d.remove();
    return { gapInGradient: bg.includes(gap), colors: new Set(bg.match(/(rgba?|color)\([^)]*\)/g) || []).size, seps: [...el.querySelectorAll("i")].map((i) => getComputedStyle(i).backgroundColor === gap) }; });   // 브라우저는 색마다 시작·끝을 두 번 적는다 — 종류를 센다
  ok("donut keeps a surface-coloured gap between segments (separators, not gradient bands)", !donutGap.gapInGradient && donutGap.colors === 5 && donutGap.seps.length === 5 && donutGap.seps.every(Boolean), JSON.stringify(donutGap));

  // Steps — 완료 단계는 체크 아이콘만 있어 보조기기에 상태가 전해지지 않았다
  await go("components/steps.html");
  const stepSr = await page.evaluate(() => { const li = document.querySelector("#ex-steps-default li.done"), sr = li && li.querySelector(".sr-only");
    if (!sr) return null; const r = sr.getBoundingClientRect();
    return { text: sr.textContent, w: r.width, h: r.height, onHasSr: !!document.querySelector("#ex-steps-default li.on .sr-only") }; });
  ok("done steps carry a screen-reader-only label", !!stepSr && /완료/.test(stepSr.text) && stepSr.w <= 1 && stepSr.h <= 1 && !stepSr.onHasSr, JSON.stringify(stepSr));
  /* 390 — 미리보기(.panel)가 가운데 정렬이라 넘친 예제는 왼쪽이 잘려 스크롤로도 못 봤다("기본 정보" → "정보"). safe center 는 넘칠 때만 왼쪽부터 놓는다 */
  const stepFit = () => page.evaluate(() => { const pv = document.querySelector("#ex-steps-default .example-preview"), s = pv.querySelector(".steps").getBoundingClientRect(), p = pv.getBoundingClientRect();
    return { left: Math.round(s.left - p.left), right: Math.round(p.right - s.right), scrolls: pv.scrollWidth > pv.clientWidth }; });
  const step1440 = await stepFit();
  await page.setViewportSize({ width: 390, height: 900 }); await page.waitForTimeout(250);
  const step390 = await stepFit();
  await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(250);
  ok("an overflowing preview starts at its left edge at 390", step390.left >= 0 && step390.scrolls, JSON.stringify(step390));
  ok("a preview that fits stays centred", Math.abs(step1440.left - step1440.right) <= 1 && !step1440.scrolls, JSON.stringify(step1440));

  // KPI 값 — 색이 없어 부모 색을 물려받았다. 패턴 개요 썸네일(.ov-card .thumb 은 tertiary 글자)에서 99.2% 만 회색이었다
  await go("patterns/overview.html");
  const kpiInk = await page.evaluate(() => { const v = document.querySelector(".ov-card .thumb .kpi:not(.critical):not(.high) .value");
    const d = document.createElement("div"); d.style.color = "var(--foreground-neutral-primary)"; document.body.append(d); const want = getComputedStyle(d).color; d.remove();
    return v ? { color: getComputedStyle(v).color, want } : null; });
  ok("KPI value keeps the primary text colour inside a thumbnail", !!kpiInk && kpiInk.color === kpiInk.want, JSON.stringify(kpiInk));

  // Notice / toast
  await go("components/notification.html");
  const nc = page.locator(".example-preview .notice .close").first();
  const nCount = await page.locator(".example-preview .notice").count();
  await nc.click(); await page.waitForTimeout(250);
  ok("notice close removes", (await page.locator(".example-preview .notice").count()) === nCount - 1);
  const ta = page.locator(".example-preview .toast .action").first();
  if (await ta.count()) { const tc = await page.locator(".example-preview .toast").count(); await ta.click(); await page.waitForTimeout(250); ok("toast action dismisses", (await page.locator(".example-preview .toast").count()) === tc - 1); }
  await page.evaluate(() => window.DS.toast("저장되었습니다", { action: { label: "실행 취소" }, duration: 0 }));
  ok("DS.toast API", await page.evaluate(() => !!document.querySelector("body > .toast-stack.fixed .toast")));
  await page.screenshot({ path: SHOT + "/toast.png", clip: { x: 1440 - 480, y: 900 - 160, width: 480, height: 160 } });

  // Popup API
  await go("components/popup.html");
  const popupSel = await page.evaluate(() => { const p = document.querySelector(".example-preview .popup"); p.id = "test-popup"; return "#test-popup"; });
  /* 연 요소를 기억해야 닫을 때 돌려준다 — 페이지의 첫 예제 코드 탭 버튼처럼 팝업 밖의 버튼에서 연다 */
  await page.evaluate(() => { const o = document.createElement("button"); o.id = "popup-opener"; o.textContent = "열기"; document.querySelector("main, body").prepend(o); o.focus(); });
  await page.evaluate((s) => window.DS.popup.open(s), popupSel);
  ok("DS.popup.open mounts backdrop", await page.evaluate(() => !!document.querySelector("body > .popup-backdrop[data-ds-popup] .popup")));
  await page.screenshot({ path: SHOT + "/popup.png" });
  /* 포커스 가둠 — 종전에는 마지막 버튼에서 Tab 을 누르면 뒤 페이지(.brand)로 나갔다 */
  const trap = [];
  for (let i = 0; i < 8; i++) { await page.keyboard.press("Tab"); trap.push(await page.evaluate(() => !!document.activeElement.closest(".popup-backdrop[data-ds-popup] .popup"))); }
  await page.keyboard.press("Shift+Tab"); trap.push(await page.evaluate(() => !!document.activeElement.closest(".popup-backdrop[data-ds-popup] .popup")));
  ok("popup keeps Tab and Shift+Tab inside", trap.every(Boolean), JSON.stringify(trap));
  await page.keyboard.press("Escape");
  ok("popup Esc restores", await page.evaluate(() => !document.querySelector("body > .popup-backdrop[data-ds-popup]") && !!document.querySelector(".example-preview #test-popup")));
  ok("popup close returns focus to the opener", await page.evaluate(() => document.activeElement && document.activeElement.id === "popup-opener"));
  await page.evaluate(() => document.getElementById("popup-opener").remove());

  await require("./behave.feedback.js")({ page, ok, go });
  await require("./behave.data.js")({ page, ok, go });
  await require("./behave.nav.js")({ page, ok, go });
  await require("./behave.promote.js")({ page, ok, go });
    await require("./behave.upload.js")({ page, ok, go });
    await require("./behave.code.js")({ page, ok, go });
    await require("./behave.number.js")({ page, ok, go });

  // Components: Anatomy 없음 · Examples 제목 없음 · 1. Default 로 시작
  await go("components/button.html");
  /* Props 표 — 열 폭 20 · 25 · 15 · 40% 고정, 이름은 positive 태그 · 값은 텍스트 · 기본값은 중립 태그(사람의 결정 2026-10-29) */
  const pt = await page.evaluate(() => {
    const t = document.querySelector("table.props"), W = t.getBoundingClientRect().width;
    const rows = [...t.tBodies[0].rows];
    return { pct: [...t.tHead.rows[0].cells].map((c) => Math.round(c.getBoundingClientRect().width / W * 100)),
      names: rows.every((r) => r.cells[0].querySelectorAll(".tag.ok").length > 0 && !r.cells[0].querySelector(":not(.tag):not(.prop-tags)")),
      /* 태그끼리 붙지 않는다 — 같은 줄이면 가로로, 다음 줄이면 세로로 6 이상 */
      gap: Math.min(...rows.flatMap((r) => { const t = [...r.cells[0].querySelectorAll(".tag")].map((x) => x.getBoundingClientRect());
        return t.slice(1).map((b, i) => { const a = t[i]; return Math.abs(a.top - b.top) < 1 ? b.left - a.right : b.top - a.bottom; }); }), 99),
      types: rows.every((r) => !r.cells[1].querySelector("code") && r.cells[1].textContent.trim()),
      defaults: rows.every((r) => { const d = r.cells[2]; return d.textContent.trim() === "—" ? !d.querySelector(".tag") : !!d.querySelector(".tag:not(.ok)"); }),
      overflow: rows.flatMap((r) => [...r.cells].filter((c) => c.scrollWidth > c.clientWidth + 1).map((c) => c.cellIndex)) };
  });
  ok("props table: fixed widths, positive name tags, text values, neutral default tags, no overflow",
    pt.pct.join() === "20,25,15,40" && pt.gap >= 5.5 && pt.names && pt.types && pt.defaults && !pt.overflow.length, JSON.stringify(pt));
  const cs = await page.evaluate(() => ({
    first: document.querySelector('#content h2[id^="ex-"]').textContent,
    tag: document.querySelector('#content h2[id^="ex-"]').tagName,
    anatomy: !!document.querySelector('#anatomy, .legend, .marker'),
    examplesH2: !!document.querySelector('#examples'),
    toc: [...document.querySelectorAll("#toc a")].map((a) => a.textContent).join(" / "),
    panes: [...document.querySelector(".example").querySelectorAll("[data-pane]")].map((x) => x.dataset.pane).join(","),
  }));
  ok("component page opens with 1. Default, no Anatomy/Examples heading", cs.first === "1. Default" && cs.tag === "H2" && !cs.anatomy && !cs.examplesH2 && cs.panes === "html,react", JSON.stringify(cs));

  // Patterns: Examples 제목 없음 · 예제가 하나뿐이면 번호 제목도 없음
  await go("patterns/input-form.html");
  const pm = await page.evaluate(() => ({
    examplesH2: !!document.querySelector("#examples"),
    heads: [...document.querySelectorAll('#content h2[id^="ex-"]')].map((h) => h.textContent).join(" / "),
    toc: [...document.querySelectorAll("#toc a")].map((a) => a.textContent).join(" / "),
  }));
  ok("pattern page matches the component layout", !pm.examplesH2 && pm.heads === "1. 기본 폼 / 2. 오류 상태 / 3. 제출 검증", JSON.stringify(pm));
  await go("patterns/dashboard.html");
  const one = await page.evaluate(() => ({
    heads: document.querySelectorAll('#content h2[id^="ex-"]').length,
    examples: document.querySelectorAll(".example").length,
    toc: [...document.querySelectorAll("#toc a")].map((a) => a.textContent).join(" / "),
  }));
  ok("single-example pattern drops the numbered heading", one.heads === 0 && one.examples === 1 && one.toc === "Composition / Usage", JSON.stringify(one));

  // Icons: 추린 세트 · 한글 검색 · Filled 필터
  await go("foundations/icons.html");
  const gal = await page.evaluate(() => ({
    tiles: document.querySelectorAll("#iconGrid .icon-tile").length,
    count: document.getElementById("iconCount").textContent,
    noF: document.querySelectorAll("#iconGrid .icon-tile.no-f").length,
  }));
  ok("gallery holds the curated set", gal.tiles >= 290 && gal.tiles <= 330 && gal.count === gal.tiles + "개" && gal.noF > 0, JSON.stringify(gal));
  const find = async (q) => { await page.fill("#iconSearch", q); await page.waitForTimeout(80); return page.evaluate(() => [...document.querySelectorAll("#iconGrid .icon-tile")].filter((t) => !t.hidden).length); };
  const ko = { 서버: await find("서버"), 잠금: await find("잠금"), 그래프: await find("그래프") };
  const en = { export: await find("export"), chart: await find("chart") };
  ok("search works in Korean and English", Object.values(ko).every((n) => n > 0) && Object.values(en).every((n) => n > 0), JSON.stringify({ ko, en }));
  await page.fill("#iconSearch", "");
  await page.locator("#iconStyle [data-style=filled]").click(); await page.waitForTimeout(80);
  const shown = await page.evaluate(() => [...document.querySelectorAll("#iconGrid .icon-tile")].filter((t) => !t.hidden).length);
  ok("filled tab drops outline-only icons", shown > 0 && shown === gal.tiles - gal.noF, JSON.stringify({ shown, expect: gal.tiles - gal.noF }));
  await page.locator("#iconStyle [data-style=outline]").click();

  // Icons: 타일 클릭 → 값 팝오버 (딤 없이 타일 아래, SVG 복사·다운로드)
  await go("foundations/icons.html");
  const read = () => page.evaluate(() => {
    const pop = document.getElementById("valPop"), tile = document.querySelector(".icon-tile.on");
    const tr = tile && tile.getBoundingClientRect(), pr = pop.getBoundingClientRect();
    return {
      title: document.getElementById("valPopTitle").textContent,
      rows: [...pop.querySelectorAll(".val-row")].map((r) => r.querySelector("b").textContent).join(","),
      style: [...pop.querySelectorAll(".val-row")].filter((r) => r.querySelector("b").textContent === "Style")[0].querySelector("span").textContent,
      dl: document.getElementById("valPopDl").getAttribute("href").split("/assets/")[1],
      svg: document.getElementById("valPopCopy").dataset.copyText.slice(0, 4),
      theme: getComputedStyle(document.querySelector(".val-pop-theme")).display,
      below: tr ? Math.round(pr.top - tr.bottom) : null,
      backdrop: !!document.querySelector(".popup-backdrop"),
    };
  });
  await page.locator('.icon-tile[data-name="search"]').evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.locator('.icon-tile[data-name="search"]').click();
  await page.waitForSelector("#valPop:not([hidden])", { timeout: 2000 });
  const iv = await read();
  ok("icon pop: no dimmer, below the tile, 3 rows", iv.title === "search" && iv.rows === "Style,Category,Keyword" && iv.style === "Outline" && iv.dl === "icons/outline/search.svg" && iv.svg === "<svg" && iv.theme === "none" && iv.below >= 0 && iv.below <= 16 && !iv.backdrop, JSON.stringify(iv));
  await page.screenshot({ path: SHOT + "/icon-pop.png" });
  await page.keyboard.press("Escape");
  ok("icon pop closes + clears the tile", await page.evaluate(() => document.getElementById("valPop").hidden && !document.querySelector(".icon-tile.on")));
  await page.locator("#iconStyle [data-style=filled]").click();
  await page.locator('.icon-tile[data-name="search"]').click();
  const fv = await read();
  ok("filled tab switches style + download path", fv.style === "Filled" && fv.dl === "icons/filled/search.svg", JSON.stringify(fv));
  await page.keyboard.press("Escape");

  // Grid: Spacing 눈금 — 4의 배수가 아닌 값은 .off(노랑), 토큰 없는 막대는 복사 대상 아님
  await go("foundations/grid.html");
  const sp = await page.evaluate(() => {
    const d = [...document.querySelectorAll(".space-bars>div")], px = (x) => x.querySelector("b").textContent;
    return {
      labels: d.map(px).join(","),
      off: d.filter((x) => x.classList.contains("off")).map(px).join(","),
      base: d.filter((x) => x.classList.contains("base")).map(px).join(","),
      copyable: d.filter((x) => x.dataset.copyText).map(px).join(","),
      labelled: d.filter((x) => x.querySelector("small")).map(px).join(","),
      widths: d.map((x) => Math.round(x.querySelector("i").getBoundingClientRect().width)).join(","),
      fits: document.querySelector(".space-bars").scrollWidth <= document.querySelector(".space-bars").clientWidth,
    };
  });
  ok("spacing scale: 16 bars, off = 비4배수, base = 4", sp.labels === "1,2,4,8,10,12,14,16,20,24,32,40,48,56,64,80" && sp.off === "1,2,10,14" && sp.base === "4" && sp.widths === sp.labels && sp.fits, JSON.stringify(sp));
  ok("spacing bars are a figure, not copy targets", sp.copyable === "" && sp.labelled === "4,8,12,16,20,24,32,40,48,64,80", JSON.stringify({ c: sp.copyable, l: sp.labelled }));

  // Elevation: Normal/Spread 타일 → 값 팝오버 (None 제외)
  await go("foundations/elevation.html");
  const shTile = '.val-cell[data-token="--shadow-md"]';
  await page.locator(shTile).evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.locator(shTile).click();
  await page.waitForSelector("#valPop:not([hidden])", { timeout: 2000 });
  const sv = await page.evaluate((sel) => {
    const t = document.querySelector(sel).getBoundingClientRect(), p = document.getElementById("valPop").getBoundingClientRect();
    const rows = [...document.querySelectorAll("#valPopRows .val-row")].map((r) => [r.querySelector("b").textContent, r.querySelector("span").textContent]);
    return { title: valPopTitle.textContent, rows: rows, below: Math.round(p.top - t.bottom) };
  }, shTile);
  ok("shadow tile opens the value pop", sv.title === "Normal / Medium" && sv.rows.length === 2 && sv.rows[0][0] === "Value" && sv.rows[0][1].includes("rgba(") && sv.rows[0][1].split("\n").length === 2 && sv.rows[1][1] === "var(--shadow-md)" && sv.below >= 0 && sv.below <= 16, JSON.stringify(sv));
  await page.screenshot({ path: SHOT + "/val-pop-shadow.png" });
  await page.keyboard.press("Escape");
  ok("shadow pop closes on Esc", await page.locator("#valPop").evaluate((e) => e.hidden));
  await page.locator(".elev-levels > div").first().click();
  ok("None tile is inert", await page.evaluate(() => document.getElementById("valPop").hidden && !document.querySelector('.elev-levels [data-token="--shadow-none"]')));
  await page.locator('.doc-tabs [data-doctab="spread"]').click();
  await page.locator('.val-cell[data-token="--shadow-spread-md"]').click();
  ok("spread tab tile labels its group", await page.evaluate(() => document.getElementById("valPopTitle").textContent === "Spread / Medium"));
  await page.keyboard.press("Escape");

  // Colors: 바탕과 구분되지 않는 스와치에 라인
  await go("foundations/colors.html");
  const faint = (tok) => page.evaluate((t) => document.querySelector('.val-cell[data-token="' + t + '"] .bar').classList.contains("faint"), tok);
  ok("white swatch gets an outline, saturated one does not", (await faint("--static-white")) && (await faint("--background-neutral-primary")) && !(await faint("--surface-brand-primary")) && !(await faint("--static-black")));
  await page.click("#themeBtn"); await page.waitForTimeout(150);
  ok("outline follows the theme (dark: black faint, white not)", (await faint("--static-black")) && !(await faint("--static-white")));
  await page.click("#themeBtn"); await page.waitForTimeout(150);

  // 컬러바 형태 — 기준 시스템과 같게: 높이 32 · 가로 간격 0 · 직각 · 라벨은 8px 아래 가운데
  const barGeo = await page.evaluate(() => {
    const row = document.querySelector(".sem-row"), cells = [...row.querySelectorAll(".val-cell")];
    const a = cells[0].querySelector(".bar").getBoundingClientRect(), b = cells[1].querySelector(".bar").getBoundingClientRect();
    const n = cells[0].querySelector(".name"), ns = getComputedStyle(n);
    return { h: Math.round(a.height), gap: Math.round(b.left - a.right), radius: getComputedStyle(cells[0].querySelector(".bar")).borderRadius,
      labelGap: Math.round(n.getBoundingClientRect().top - a.bottom), align: ns.textAlign };
  });
  ok("semantic colour bars are 32 tall, flush, square", barGeo.h === 32 && barGeo.gap === 0 && barGeo.radius === "0px", JSON.stringify(barGeo));
  ok("semantic bar label sits 8px below, centered", barGeo.labelGap === 8 && barGeo.align === "center", JSON.stringify(barGeo));
  /* hover 하면 **바 상자 자체가** 위로 8px 자란다 — 라벨은 움직이지 않아야 한다.
     자라는 주체가 i(색)가 아니라 .bar 여야 하는 이유: 체커 배경과 위아래 hairline, .faint 외곽선이
     전부 .bar 에 붙어 있다. 색만 키우면 자란 8px 에 체커가 없고 윗 라인이 색을 가로지른다 —
     그게 실제로 났던 결함이고, 종전 단정은 i 만 재서 전부 통과했다 */
  const barSel = '.sem-row .val-cell[data-token="--background-neutral-primary"]';
  const grow = async (sel) => page.evaluate((s2) => {
    const c = document.querySelector(s2), bar = c.querySelector(".bar"), i = bar.querySelector("i"), n = c.querySelector(".name");
    const rb = bar.getBoundingClientRect(), ri = i.getBoundingClientRect();
    return { h: Math.round(ri.height), top: Math.round(ri.top),
      barH: Math.round(rb.height), barTop: Math.round(rb.top),
      fills: Math.round(ri.top) === Math.round(rb.top) && Math.round(ri.height) === Math.round(rb.height),
      label: Math.round(n.getBoundingClientRect().top), exp: c.getAttribute("aria-expanded") };
  }, sel);
  /* hover() 가 스크롤을 일으키면 top 비교가 무의미해진다 — 먼저 뷰 가운데로 가져온다 */
  await page.locator(barSel).evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(150);
  const g0 = await grow(barSel);
  await page.locator(barSel).hover(); await page.waitForTimeout(450);
  const g1 = await grow(barSel);
  ok("colour bar grows 8px upward on hover", g1.h - g0.h === 8 && g0.top - g1.top === 8, `${g0.h}→${g1.h} · top ${g0.top}→${g1.top}`);
  /* 체커·라인이 붙어 있는 상자가 같이 자라야 한다 — 이것이 깨졌던 자리다 */
  ok("the bar box itself grows, carrying the checker and hairlines",
    g1.barH - g0.barH === 8 && g0.barTop - g1.barTop === 8, `${g0.barH}@${g0.barTop} → ${g1.barH}@${g1.barTop}`);
  ok("the colour layer fills the bar exactly", g0.fills && g1.fills, `기본 ${g0.fills} · hover ${g1.fills}`);
  ok("the label does not move while the bar grows", g0.label === g1.label, `${g0.label} → ${g1.label}`);
  /* Semantic 탭 — 기준 시스템의 Colors › Semantic 과 같은 구성이어야 한다.
     절 26개(Foreground 8 · Background 1 · Surface 8 · Line 6 · Effect 2 · Static 1) + 우리가 더한 회사 마크 1.
     빈 칸이 생기면(토큰 이름 오타·미선언) 색이 없는 칩이 되므로 배경이 전부 칠해졌는지 함께 본다 */
  const semPage = await page.evaluate(() => {
    const pane = document.querySelector('[data-docpane="semantic"]');
    const cells = [...pane.querySelectorAll(".val-cell")];
    const blank = cells.filter((c) => { const b2 = getComputedStyle(c.querySelector(".bar i")).backgroundColor; return !b2 || b2 === "rgba(0, 0, 0, 0)"; });
    /* #roles(브랜드 역할 맵)는 토큰 절이 아니라 쓰는 법이다 — 스와치 줄이 없으므로 세지 않는다 */
    const h2s = [...pane.querySelectorAll("h2")].filter((h) => h.id !== "roles");
    return { sections: h2s.length, cells: cells.length,
      blank: blank.map((c) => c.dataset.token),
      /* 절마다 설명 문단이 하나씩 — 이미지의 형식이다 */
      paras: h2s.filter((h) => (h.nextElementSibling || {}).tagName === "P").length,
      checker: pane.querySelectorAll(".sem-row.checker").length,
      titles: [...pane.querySelectorAll("h2")].slice(0, 3).map((h) => h.textContent) };
  });
  /* 27 → 28: 트리 밖 Chart 절(탐색형 차트 토큰, 2026-11-03) */
  ok("semantic tab is 28 sections, each a heading + one paragraph + a swatch row",
    semPage.sections === 28 && semPage.paras === 28, JSON.stringify(semPage).slice(0, 220));
  ok("no swatch is blank", semPage.blank.length === 0, semPage.blank.join(" ") || "없음");
  /* 알파가 든 절만 체커 바탕 — 솔리드 절에 체커가 깔리면 반투명으로 오독된다 */
  ok("only the alpha sections are checkered", semPage.checker === 14, String(semPage.checker));
  /* 한 절의 바들은 같은 높이에 서야 한다. Surface - Accent 는 칸이 12개라 이름이 두 줄이 되는데,
     버튼의 UA 세로 가운데 정렬 때문에 한 줄짜리 칸의 바가 9px 내려앉아 있었다 */
  const barAlign = await page.evaluate(() => {
    const out = {};
    for (const id of ["sf-accent", "ln-neutral", "fg-neutral"]) {
      let e = document.getElementById(id);
      while (e && !e.classList.contains("sem-row")) e = e.nextElementSibling;
      const tops = [...e.querySelectorAll(".bar")].map((b) => Math.round(b.getBoundingClientRect().top));
      out[id] = Math.max(...tops) - Math.min(...tops);
    }
    return out;
  });
  ok("every bar in a section sits at the same height, even when labels wrap",
    Object.values(barAlign).every((v) => v === 0), JSON.stringify(barAlign));
  ok("the first sections follow the reference order", semPage.titles.join(" / ") === "Foreground - Neutral / Foreground - Brand / Foreground - Positive", semPage.titles.join(" / "));
  /* 알파 토큰의 값 팝오버는 8자리 Hex 여야 한다 */
  const alphaPop = await (async () => {
    await page.locator('.sem-row .val-cell[data-token="--surface-negative-primary"]').click(); await page.waitForTimeout(250);
    const r = await page.evaluate(() => ({ open: !document.getElementById("valPop").hidden,
      title: (document.getElementById("valPopTitle") || {}).textContent || "",
      hex: (document.querySelector("#valPopRows") || {}).textContent || "" }));
    await page.keyboard.press("Escape"); await page.waitForTimeout(150);
    return r;
  })();
  ok("an alpha swatch opens the value popover with an 8-digit hex", alphaPop.open && /Surface - Negative \/ Primary/.test(alphaPop.title) && /#[0-9A-F]{8}/.test(alphaPop.hex),
    JSON.stringify(alphaPop));

  // 팝오버가 열린 스와치는 커진 채로 남는다 + aria-expanded 로 열림을 알린다(종전에는 aria-haspopup 만 있었다)
  await page.locator(barSel).click(); await page.waitForTimeout(400);
  await page.mouse.move(5, 5); await page.waitForTimeout(400);
  const g2 = await grow(barSel);
  ok("an open swatch stays grown and reports aria-expanded", g2.exp === "true" && g2.h - g0.h === 8, JSON.stringify(g2));
  await page.keyboard.press("Escape"); await page.waitForTimeout(400);
  const g3 = await grow(barSel);
  ok("Esc clears aria-expanded and the growth", g3.exp === "false" && g3.h === g0.h, JSON.stringify(g3));
  // Atomic 스와치도 같은 형태·같은 성장. 그리드 트랙을 32 로 고정해야 바닥이 움직이지 않는다
  await page.click('.doc-tabs [data-doctab="atomic"]'); await page.waitForTimeout(250);
  const atomSel = '.pal .val-cell[data-token="--cool-neutral-50"]';
  const aGeo = async () => page.evaluate((s2) => {
    const c = document.querySelector(s2), r = c.getBoundingClientRect(), lab = c.querySelector("i").getBoundingClientRect();
    const sib = [...document.querySelectorAll(".pal .scale .val-cell")];
    const a = sib[0].getBoundingClientRect(), b = sib[1].getBoundingClientRect();
    return { h: Math.round(r.height), bottom: Math.round(r.bottom), labelTop: Math.round(lab.top),
      gap: Math.round(b.left - a.right), radius: getComputedStyle(c).borderRadius, labelGap: Math.round(lab.top - r.bottom) };
  }, atomSel);
  const a0 = await aGeo();
  ok("atomic swatches match the bar shape", a0.h === 32 && a0.gap === 0 && a0.radius === "0px" && a0.labelGap === 8, JSON.stringify(a0));
  await page.locator(atomSel).hover(); await page.waitForTimeout(450);
  const a1 = await aGeo();
  ok("atomic swatch grows upward with its floor pinned", a1.h - a0.h === 8 && a1.bottom === a0.bottom && a1.labelTop === a0.labelTop,
    `${a0.h}→${a1.h} · bottom ${a0.bottom}→${a1.bottom} · label ${a0.labelTop}→${a1.labelTop}`);
  await page.mouse.move(5, 5); await page.waitForTimeout(300);

  // 브랜드 역할 맵은 제 페이지를 버리고 Colors 의 Brand Mark 아래로 들어왔다
  await go("foundations/colors.html");
  const brm = await page.evaluate(() => {
    const pane = document.querySelector('[data-docpane="semantic"]');
    const h = pane.querySelector("h2#roles"), mark = document.getElementById("company");
    return {
      inPane: !!h,
      /* Brand Mark 뒤에 와야 한다 — 절 사이에 끼면 토큰 목록이 끊긴다 */
      afterMark: !!(h && mark && (mark.compareDocumentPosition(h) & Node.DOCUMENT_POSITION_FOLLOWING)),
      rows: pane.querySelectorAll("table.roles tbody tr").length,
      /* 한 쌍만 옮겼다 — 브랜드색 오용. 나머지 두 쌍은 싣지 않기로 했다 */
      dodont: pane.querySelectorAll(".dodont>div").length,
      side: [...document.querySelectorAll(".sidebar a")].some(a => /brand-role-map/.test(a.getAttribute("href") || "")),
    };
  });
  ok("the role map sits under Brand Mark in the semantic tab, and its own page is gone",
    brm.inPane && brm.afterMark && brm.rows === 5 && brm.dodont === 2 && !brm.side, JSON.stringify(brm));

  // Atomic 팔레트 칸 수 + 반응형 블록이 실제로 적용되는지 (한동안 컴포넌트 규칙에 덮여 죽어 있었다)
  /* Common 2 · Brand 5(제품 슬롯) · Cool Neutral 21(기준 시스템 램프) */
  for (const [w, want] of [[1440, [2, 5, 21]], [760, [2, 5, 7]], [390, [2, 5, 5]]]) {
    await page.setViewportSize({ width: w, height: 900 });
    await go("foundations/colors.html");
    await page.locator('.doc-tabs [data-doctab="atomic"]').click();
    const got = await page.evaluate(() => ["Common", "Brand", "Cool Neutral"].map((t) => {
      const h = [...document.querySelectorAll(".pal h3")].find((x) => x.textContent.startsWith(t));
      return getComputedStyle(h.nextElementSibling).gridTemplateColumns.split(" ").length;
    }));
    ok(`atomic palette columns at ${w}`, JSON.stringify(got) === JSON.stringify(want), JSON.stringify(got));
  }
  await go("resources/design-token.html");
  ok("responsive block applies at 390 (kv 1열)", await page.evaluate(() => document.querySelector("div.kv") && getComputedStyle(document.querySelector("div.kv")).gridTemplateColumns.split(" ").length === 1));
  await page.setViewportSize({ width: 1440, height: 900 });

  // Colors: Atomic 팔레트도 같은 팝오버
  await go("foundations/colors.html");
  await page.locator('.doc-tabs [data-doctab="atomic"]').click();
  const atom = '.pal .val-cell[data-token="--cool-neutral-50"]';
  await page.locator(atom).evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.locator(atom).click();
  await page.waitForSelector("#valPop:not([hidden])", { timeout: 2000 });
  const av = await page.evaluate((sel) => {
    const c = document.querySelector(sel).getBoundingClientRect(), p = document.getElementById("valPop").getBoundingClientRect();
    const row = (k) => [...document.querySelectorAll("#valPopRows .val-row")].filter((r) => r.querySelector("b").textContent === k).map((r) => r.querySelector("span").textContent)[0];
    return { t: document.getElementById("valPopTitle").textContent, hex: row("Hex"), tok: row("Token"), below: Math.round(p.top - c.bottom), label: document.querySelector(sel).querySelector("i").textContent };
  }, atom);
  ok("atomic swatch opens the same pop", av.t === "Cool Neutral / 50" && /^#[0-9A-F]{6}$/.test(av.hex) && av.tok === "var(--cool-neutral-50)" && av.below >= 0 && av.below <= 16 && av.label === "50", JSON.stringify(av));
  await page.screenshot({ path: SHOT + "/val-pop-atomic.png" });
  await page.keyboard.press("Escape");
  ok("atomic pop closes on Esc", await page.locator("#valPop").evaluate((e) => e.hidden));

  // Colors: Semantic 스와치 클릭 → 값 팝오버 (딤 없이 바 아래, 토큰 복사)
  await go("foundations/colors.html");
  await page.locator("#sf-brand").evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }));   /* 제품 면은 Surface - Brand 절에 있다 */
  const cellSel = '.val-cell[data-token="--surface-brand-primary"]';
  await page.locator(cellSel).click();
  await page.waitForSelector("#valPop:not([hidden])", { timeout: 2000 });
  const cv = await page.evaluate(() => {
    const rows = [...document.querySelectorAll("#valPopRows .val-row")];
    const cell = (k) => rows.filter((r) => r.querySelector("b").textContent === k)[0];
    return {
      title: document.getElementById("valPopTitle").textContent,
      hex: cell("Hex").querySelector("span").textContent,
      rgba: cell("RGBA").querySelector("span").textContent,
      tok: cell("Token").querySelector("span").textContent,
      dot: !!cell("Token").querySelector("i"),
      dim: !!document.querySelector(".popup-backdrop,.drawer-dim:not([hidden])"),
      mono: getComputedStyle(cell("Hex").querySelector("span")).fontFamily.toLowerCase().includes("mono"),
    };
  });
  ok("value pop hides the icon-only slots", await page.evaluate(() => getComputedStyle(document.getElementById("valPopDl")).display === "none" && getComputedStyle(document.getElementById("valPopIcon")).display === "none" && getComputedStyle(document.querySelector(".val-pop-theme")).display !== "none"));
  ok("color pop shows values, no dimmer, Pretendard", /^#[0-9A-F]{6,8}$/.test(cv.hex) && /^\d+\/\d+\/\d+\/[\d.]+$/.test(cv.rgba) && /^var\(--[\w-]+\)$/.test(cv.tok) && cv.title.includes("/") && cv.dot && !cv.dim && !cv.mono, JSON.stringify(cv));
  const pos = await page.evaluate((sel) => {
    const bar = document.querySelector(sel).querySelector(".bar").getBoundingClientRect(), p = document.getElementById("valPop").getBoundingClientRect();
    return { below: Math.round(p.top - bar.bottom), offCenter: Math.round(Math.abs((p.left + p.width / 2) - (bar.left + bar.width / 2))) };
  }, cellSel);
  ok("color pop sits just below the swatch, centered", pos.below >= 0 && pos.below <= 16 && pos.offCenter <= 2, JSON.stringify(pos));
  await page.screenshot({ path: SHOT + "/val-pop.png" });
  await page.locator("#valPopCopy").click();
  ok("copy button keeps its icon + marks copied", await page.locator("#valPopCopy").evaluate((e) => e.classList.contains("copied") && !!e.querySelector("svg")));
  await page.locator(cellSel).click();
  ok("same swatch toggles closed", await page.locator("#valPop").evaluate((e) => e.hidden));
  await page.locator(cellSel).click(); await page.mouse.click(5, 300);
  ok("outside click closes color pop", await page.locator("#valPop").evaluate((e) => e.hidden));
  await page.locator(cellSel).click(); await page.keyboard.press("Escape");
  ok("Esc closes color pop + restores focus", await page.evaluate((sel) => document.getElementById("valPop").hidden && document.activeElement === document.querySelector(sel), cellSel));

  // app.js doc chrome still works: code tab switch + copy button present
  await go("components/button.html");
  const bar = page.locator(".example-bar").first();
  await bar.locator("button[data-tab=react], .doc-tabs button, [data-tab]").nth(1).click().catch(() => {});
  ok("doc chrome intact (no page errors so far)", errors.length === 0, errors.join(" | "));

  // sweep: every component/pattern page loads w/o errors
  /* + 컴포넌트는 기본 글자(body)에 기대지 않는다 — React 앱의 .ds-root(15px/1.65)에서도 사이트(16px/1.6)와 같은 배치여야 한다.
     줄 높이를 상속받아 1440 에서 미리보기 83개가 달랐다. 뺀 넷은 놓인 곳의 글자 크기를 따르게 만든 셋(Pagination 의 생략 기호 · Dropdown · 심각도 셀)을
     단독으로 둔 예제다 — 사람의 결정(2026-10-26): 따르게 두고 Props · 설명에 적는다 */
  const fs = require("fs");
  const ADAPTIVE = ["ex-pagination-basic", "ex-select-default", "ex-select-open", "ex-severity-scale"];
  const sig = () => Object.fromEntries([...document.querySelectorAll(".example-preview")].map((pv) => { const P = pv.getBoundingClientRect();
    const els = [...pv.querySelectorAll("*")].filter((e) => e.getClientRects().length && !e.closest(".spinner, .skeleton, .indicator.pulse"));   // 숨은 것 · 움직이는 것은 뺀다
    return [(pv.closest(".example") || {}).id, els.map((e) => { const r = e.getBoundingClientRect(); return [r.left - P.left, r.top - P.top, r.width, r.height].map((x) => Math.round(x * 2) / 2).join(","); }).join("|")]; }));
  const leaned = [];
  for (const sec of ["components", "patterns"]) for (const f of fs.readdirSync(path.join(SITE, sec))) { await go(`${sec}/${f}`);
    if (!f.endsWith(".html") || /^(index|overview)\.html$/.test(f)) continue;
    const a = await page.evaluate(sig), st = await page.addStyleTag({ content: "body{font-size:15px !important;line-height:1.65 !important}" });
    const c = await page.evaluate(sig); await st.evaluate((s) => s.remove());
    for (const k of Object.keys(a)) if (a[k] !== c[k] && !ADAPTIVE.includes(k)) leaned.push(k.replace(/^ex-/, "")); }
  await go("index.html");
  ok("all pages load without JS errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  ok("components keep their layout under the React base font (15px/1.65)", leaned.length === 0, `${leaned.length}: ${leaned.slice(0, 12).join(" ")}`);

  // 반응형: 데스크톱~모바일 전 폭에서 가로 넘침 없음
  for (const w of [1440, 1280, 1024, 768, 390]) {
    await page.setViewportSize({ width: w, height: 900 });
    const wide = [];
    for (const sec of ["", "home", "foundations", "components", "patterns", "resources"]) for (const f of fs.readdirSync(path.join(SITE, sec))) {
      if (!f.endsWith(".html") || f.includes("standalone")) continue;
      await go(path.join(sec, f));
      const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (over > 1) wide.push(path.join(sec, f) + " +" + over);
    }
    ok("no horizontal overflow at " + w + " on any page", wide.length === 0, wide.slice(0, 5).join(" | "));
  }
  // ☰ 드로어: 1200 미만에서만 나오고 상단·좌측 메뉴를 담는다
  await page.setViewportSize({ width: 1100, height: 900 });
  await go("components/button.html");
  const hamVisible = await page.evaluate(() => { const b = document.getElementById("menuBtn"); return !!b && b.getBoundingClientRect().width > 0; });
  await page.click("#menuBtn");
  const step1 = await page.evaluate(() => { const p = document.getElementById("menuPop"); return { open: !p.hidden, secs: p.querySelectorAll("[data-drawer-sec]").length, back: !!p.querySelector("[data-drawer-back]"), dim: !document.getElementById("menuDim").hidden }; });
  ok("drawer step 1 lists sections", hamVisible && step1.open && step1.secs === 5 && !step1.back && step1.dim, JSON.stringify(step1));
  const url0 = page.url();
  await page.click('[data-drawer-sec="Foundations"]');
  await page.waitForSelector("[data-drawer-back]", { timeout: 3000 });   /* 화면 전환은 다음 틱에 그려진다 */
  const step2 = await page.evaluate(() => { const p = document.getElementById("menuPop"); return { links: p.querySelectorAll(".drawer-body a").length, back: !!p.querySelector("[data-drawer-back]"), title: (p.querySelector("h2") || {}).textContent }; });
  ok("drawer step 2 shows section pages without navigating", step2.links >= 5 && step2.back && step2.title === "Foundations" && page.url() === url0, JSON.stringify(step2));
  await page.click("[data-drawer-back]");
  await page.waitForSelector("[data-drawer-sec]", { timeout: 3000 });
  ok("drawer back returns to step 1", await page.evaluate(() => document.getElementById("menuPop").querySelectorAll("[data-drawer-sec]").length === 5));
  await page.keyboard.press("Escape");
  ok("drawer closes on Escape", await page.evaluate(() => document.getElementById("menuPop").hidden && document.getElementById("menuDim").hidden));
  await page.setViewportSize({ width: 1440, height: 900 });
  await go("components/button.html");
  ok("hamburger hidden at 1440", await page.evaluate(() => document.getElementById("menuBtn").getBoundingClientRect().width === 0));

  /* Date Picker · Calendar — 날짜를 고정해야 해서 따로 돈다. 옛 "월 경계" 허용(프리셋이 달을 넘으면 한쪽만 맞아도 통과)은 지웠다 */
  await require("./behave.dp.js")({ b, ok, SITE, path });
  await require("./behave.dptime.js")({ b, ok, SITE, path });
  await require("./behave.polish.js")({ b, ok, SITE, path });
  await require("./behave.later.js")({ b, ok, SITE, path });
  await require("./behave.expand.js")({ b, ok, SITE, path });
  /* 모션 · 한 시스템 · 패턴 정렬 — taste-skill 규칙을 콘솔에 맞게 옮긴 것(2026-11-05) */
  await require("./behave.system.js")({ b, ok, SITE, path });

  await b.close();
  let fail = 0;
  for (const [s, n, x] of results) { if (s === "FAIL") fail++; console.log(`${s}  ${n}${x ? "  (" + x + ")" : ""}`); }
  console.log(`\n${results.length - fail}/${results.length} passed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
