/* 패턴 재정비(2026-11-15 사람의 결정: 컴포넌트처럼 맞춘 페이지 · 새 패턴 여덟) — behave.js 가 부른다.
   패턴 22개의 절 순서와, 패턴이 약속하는 동작이 실제로 되는지를 잰다(기존 컴포넌트 동작의 조합 — 새 ds.js 동작은 Side Panel 의 처음 보임 되돌리기 하나). */
const P = (() => { global.I = global.I || require("./icons.js").I; return require("./patterns.data.js"); })();
module.exports = async function patterns({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const ex = (key, id) => `#ex-${key}-${id} .example-preview`;
  const events = () => page.evaluate(() => { const out = window.__pt || []; window.__pt = []; return out; });
  const listen = (names) => page.evaluate((names) => { window.__pt = []; for (const n of names) document.addEventListener(n, (e) => window.__pt.push([n, e.detail && typeof e.detail === "object" ? { ...e.detail } : e.detail])); }, names);
  const part = require("./behave.part")(ok, "behave.patterns", () => page);
  let bad;

  await part("1 · 패턴 페이지 구성 — 정의 · 고르기 표 · Composition · 예제 · Rules · Usage", async () => {
    bad = [];
    for (const key of Object.keys(P)) {
      await go(`patterns/${key}.html`);
      const r = await page.evaluate(() => {
        const lead = document.querySelector(".page .lead"), next = lead && lead.nextElementSibling;
        const ids = [...document.querySelectorAll(".page h2[id]")].map((h) => h.id), at = (id) => ids.indexOf(id), exs = ids.filter((i) => i.startsWith("ex-"));
        const exAt = exs.length ? ids.indexOf(exs[0]) : -1, exEnd = exs.length ? ids.indexOf(exs[exs.length - 1]) : -1;
        return { dl: !!(next && next.matches("dl.kv")), order: at("composition") >= 0 && (exs.length === 0 || (at("composition") < exAt && exEnd < at("rules"))) && at("rules") > at("composition") && at("rules") < at("usage"), notes: !!document.querySelector(".notes"), ids };
      });
      if (!r.dl || !r.order || r.notes) bad.push(`${key}: ${JSON.stringify(r)}`);
    }
    ok("every pattern page reads definition → choose (dl.kv) → Composition → examples → Rules → Usage, and no .notes panel is left", bad.length === 0, bad.join(" | "));
  });

  await part("2 · 약관 동의 — 보기가 전문 대화상자를 열고, Esc 로 닫으면 보기로 포커스 · 대화상자는 제자리", async () => {
    await go("patterns/terms-agreement.html");
    const view = page.locator(`${ex("terms-agreement", "basic")} button.view`).first();
    await view.click(); await wait(250);
    const open = await page.evaluate(() => { const bd = document.querySelector(".popup-backdrop[data-ds-popup]"), pop = bd && bd.querySelector(".popup"); return { id: pop && pop.id, inside: !!(pop && pop.contains(document.activeElement)) }; });
    await page.keyboard.press("Escape"); await wait(250);
    const after = await page.evaluate(() => ({ closed: !document.querySelector(".popup-backdrop[data-ds-popup]"), focus: document.activeElement && document.activeElement.getAttribute("aria-label"), home: !!document.querySelector("#ex-terms-agreement-full .example-preview #terms-tos") }));
    ok("terms '보기' opens the full-text dialog with focus inside; Esc closes it, focus returns to '보기' and the dialog goes back to its example",
      open.id === "terms-tos" && open.inside && after.closed && after.focus === "서비스 이용약관 보기" && after.home, JSON.stringify({ open, after }));
  });

  await part("3 · 온보딩 — 다음 · 나중에 설치로 단계가 바뀌고, 마지막 단계의 대시보드로 이동이 ds:step-finish", async () => {
    await go("patterns/onboarding.html");
    await listen(["ds:step", "ds:step-finish"]);
    const sel = ex("onboarding", "step");
    const shown = () => page.evaluate((sel) => { const ps = [...document.querySelectorAll(`${sel} .step-panel`)]; return ps.findIndex((p) => !p.hidden); }, sel);
    const s0 = await shown();
    await page.locator(`${sel} .step-actions [data-step="next"]`).click(); await wait(150);
    const s1 = await shown();
    await page.locator(`${sel} .step-panel:not([hidden]) [data-step="next"]`).click(); await wait(150);
    const s2 = await shown();
    const btns = await page.evaluate((sel) => { const a = document.querySelector(`${sel} .step-actions`); return { next: a.querySelector('[data-step="next"]').hidden, finish: a.querySelector('[data-step="finish"]').hidden }; }, sel);
    await page.locator(`${sel} .step-actions [data-step="finish"]`).click(); await wait(150);
    const ev = (await events()).map((e) => e[0]);
    ok("onboarding: 다음 moves 2 → 3, '나중에 설치' moves 3 → 4, the last step shows '대시보드로 이동' instead of 다음 and it fires ds:step-finish",
      s0 === 1 && s1 === 2 && s2 === 3 && btns.next && !btns.finish && ev.includes("ds:step-finish"), JSON.stringify({ s0, s1, s2, btns, ev }));
  });

  await part("4 · 검색 — 결과 줄의 조건 Chip 을 지우면 사라지고 ds:chip-remove · 빈 결과는 표 대신 Empty State", async () => {
    await go("patterns/search.html");
    await listen(["ds:chip-remove"]);
    const sel = ex("search", "toolbar");
    const n0 = await page.locator(`${sel} .toolbar.sub .chip`).count();
    await page.locator(`${sel} .toolbar.sub .chip .x`).first().click(); await wait(150);
    const n1 = await page.locator(`${sel} .toolbar.sub .chip`).count(), ev = (await events()).map((e) => e[0]);
    const empty = await page.evaluate((s) => { const p = document.querySelector(s); return { empty: !!p.querySelector(".empty"), table: !!p.querySelector("table"), reset: [...p.querySelectorAll(".empty .btn")].map((b) => b.textContent.trim()) }; }, ex("search", "empty"));
    ok("search: removing a condition chip drops it and fires ds:chip-remove; the empty result shows an Empty State with 필터 초기화 instead of a table",
      n0 === 2 && n1 === 1 && ev.includes("ds:chip-remove") && empty.empty && !empty.table && empty.reset.join() === "필터 초기화", JSON.stringify({ n0, n1, ev, empty }));
  });

  await part("5 · 로그 뷰어 — 행 펼침 · 한 줄 행 · 고정 헤더 영역 · 새 로그 안내", async () => {
    await go("patterns/log-viewer.html");
    const sel = ex("log-viewer", "viewer");
    const btn = page.locator(`${sel} .log-row .expand-btn`).nth(1);
    const before = await btn.getAttribute("aria-expanded");
    await btn.click(); await wait(100);
    const r = await page.evaluate((s) => {
      const p = document.querySelector(s), rows = [...p.querySelectorAll("tr.log-row")], b = rows[1].querySelector(".expand-btn"), d = document.getElementById(b.getAttribute("aria-controls"));
      const hs = rows.map((x) => Math.round(x.getBoundingClientRect().height)), wrap = p.querySelector(".tbl-wrap.sticky");
      return { exp: b.getAttribute("aria-expanded"), shown: d && !d.hidden && !!d.querySelector(".detail-meta") && !!d.querySelector(".code-view pre"), heights: [...new Set(hs)], region: wrap && wrap.tabIndex === 0 && !!wrap.getAttribute("aria-label"), notice: !!p.querySelector(".notice.info .actions .btn"), density: !!p.querySelector("[data-density-for]") };
    }, sel);
    ok("log viewer: the second row expands below itself with key-value detail and the raw log; every log row is one line (same height ≤ 41); sticky header region is focusable and named; the new-log notice has an action",
      before === "false" && r.exp === "true" && r.shown && r.heights.length === 1 && r.heights[0] <= 41 && r.region && r.notice && !r.density, JSON.stringify({ before, r }));
  });

  await part("6 · 정책 설정 — Number Input ↑ · Time Picker 열림 · 적용 대상 Side Panel(모달) 열고 닫기 · 처음 보이던 자리로", async () => {
    await go("patterns/policy-settings.html");
    const sel = ex("policy-settings", "sections");
    await page.locator("#ps-keep").focus(); await page.keyboard.press("ArrowUp"); await wait(50);
    const keep = await page.locator("#ps-keep").inputValue();
    await page.locator(`${sel} .timepicker .tp-btn`).click(); await wait(150);
    const tp = await page.evaluate((s) => { const h = document.querySelector(`${s} .timepicker`); return h.classList.contains("open") && !!h.querySelector(".time-panel .time-col"); }, sel);
    await page.keyboard.press("Escape"); await page.keyboard.press("Escape"); await wait(100);
    const opener = page.locator(`${sel} [data-panel-open="#pol-targets"]`);
    await opener.click(); await wait(200);
    const open = await page.evaluate(() => { const p = document.getElementById("pol-targets"); return { fixed: p.classList.contains("fixed"), dim: !!document.querySelector(".side-panel-dim"), inside: p.contains(document.activeElement) }; });
    await page.keyboard.press("Escape"); await wait(200);
    const closed = await page.evaluate(() => { const p = document.getElementById("pol-targets"); return { fixed: p.classList.contains("fixed"), hidden: p.hidden, home: !!p.closest("#ex-policy-settings-targets"), dim: !!document.querySelector(".side-panel-dim"), focus: document.activeElement && document.activeElement.textContent.trim() }; });
    ok("policy settings: ↑ in the retention Number Input gives 91; the Time Picker opens its columns; '적용 대상 바꾸기' opens the modal Side Panel, Esc closes it, focus returns and the panel shows again in its own example",
      keep === "91" && tp && open.fixed && open.dim && open.inside && !closed.fixed && !closed.hidden && closed.home && !closed.dim && closed.focus === "적용 대상 바꾸기", JSON.stringify({ keep, tp, open, closed }));
  });

  await part("7 · 위험 작업 확인 — 이름 입력: 버튼은 늘 켜져 있고, 비우거나 틀리면 막고 알림, 맞으면 통과", async () => {
    await go("patterns/danger-confirm.html");
    const sel = ex("danger-confirm", "type-name"), submit = page.locator(`${sel} button[form="dc3-form"]`), inp = page.locator("#dc3-name");
    const state = () => page.evaluate(() => { const i = document.getElementById("dc3-name"), h = i.closest(".field").querySelector(".help"); return { inv: i.getAttribute("aria-invalid"), help: h.textContent.trim() }; });
    const disabled = await submit.isDisabled();
    await submit.click(); await wait(100); const empty = await state();
    await inp.fill("SIEM"); await submit.click(); await wait(100); const wrong = await state();
    await inp.fill("SIEM 연동"); await wait(50); await submit.click(); await wait(100); const right = await state();
    ok("type-name confirm: the delete button is never disabled; empty → '연동 이름을 입력하세요.', a different name → the pattern message, the exact name clears the error",
      !disabled && empty.inv === "true" && empty.help === "연동 이름을 입력하세요." && wrong.inv === "true" && /연동 이름이 다릅니다/.test(wrong.help) && right.inv !== "true" && !/다릅니다|입력하세요\./.test(right.help), JSON.stringify({ disabled, empty, wrong, right }));
  });

  await part("8 · 로그인 — 2단계 인증 코드 칸 여섯(Text Field Code) · 치기 · 지우기 · 붙여넣기 · 검사 · 로그인 줄 글자 14", async () => {
    await go("patterns/sign-in.html");
    const G = "#ex-sign-in-two-step .code-inputs";
    const attrs = await page.evaluate((G) => { const g = document.querySelector(G), cs = [...g.querySelectorAll(".code-cell")], r = cs.map((c) => c.getBoundingClientRect()), st = getComputedStyle(cs[0]);
      return { n: cs.length, role: g.getAttribute("role"), name: document.getElementById(g.getAttribute("aria-labelledby")).textContent.trim(), first: [cs[0].getAttribute("inputmode"), cs[0].getAttribute("autocomplete"), document.querySelector('label[for="' + cs[0].id + '"]') ? 1 : 0].join(), rest: cs.slice(1).every((c) => c.getAttribute("autocomplete") === "off" && c.getAttribute("inputmode") === "numeric"), labels: cs.map((c) => c.getAttribute("aria-label")).join("|"), w: r.map((x) => Math.round(x.width * 10) / 10), h: Math.round(r[0].height * 10) / 10, gap: Math.round((r[1].left - r[0].right) * 10) / 10, font: [st.fontSize, st.lineHeight, st.fontWeight, st.textAlign].join(), others: document.querySelectorAll("#ex-sign-in-two-step input:not([type=checkbox]):not([type=hidden]):not(.code-cell)").length }; }, G);
    ok("sign-in: the one-time code is six boxes 48 × 56 (gap 8, digits Title 2 28/38 600 centred) in a named group; the first has numeric · one-time-code and the label, the rest numeric · off; each box is named 'n자리 중 m번째'; no other text field",
      attrs.n === 6 && attrs.role === "group" && attrs.name === "인증 코드" && attrs.first === "numeric,one-time-code,1" && attrs.rest && attrs.labels === [1, 2, 3, 4, 5, 6].map((i) => "6자리 중 " + i + "번째").join("|") && attrs.w.every((x) => x === 48) && attrs.h === 56 && attrs.gap === 8 && attrs.font === "28px,38px,600,center" && attrs.others === 0, JSON.stringify(attrs));
    const cell = (i) => page.locator(`${G} .code-cell`).nth(i), val = () => page.evaluate((G) => [...document.querySelectorAll(G + " .code-cell")].map((c) => c.value).join(""), G), at = () => page.evaluate((G) => [...document.querySelectorAll(G + " .code-cell")].indexOf(document.activeElement), G);
    await page.evaluate((G) => { window.__code = []; document.querySelector(G).addEventListener("ds:code", (e) => window.__code.push(e.detail)); }, G);
    await cell(3).click(); const redirect = await at();
    await page.keyboard.type("4a8"); const typed = [await val(), await at()];
    await page.keyboard.press("Backspace"); const back = [await val(), await at()];
    await cell(0).click();
    await page.evaluate((G) => { const c = document.querySelector(G + " .code-cell"), dt = new DataTransfer(); dt.setData("text/plain", "48 21-93"); c.dispatchEvent(new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true })); }, G);
    const pasted = [await val(), await at(), await page.evaluate((G) => document.querySelector(G + " input[type=hidden]").value, G), await page.evaluate(() => JSON.stringify(window.__code.slice(-1)[0]))];
    await page.keyboard.press("Home"); const home = await at(); await page.keyboard.press("End"); const end = await at(); await page.keyboard.press("ArrowLeft"); const left = await at();
    ok("sign-in code boxes: a click on a later box goes to the first empty one; typing moves on and refuses letters; Backspace on an empty box clears the previous one; a paste fills every box from that box, focuses the last, mirrors the hidden value and fires ds:code {value, complete}; Home · End · ← move",
      redirect === 0 && typed.join() === "48,2" && back.join() === "4,1" && home === 0 && end === 5 && left === 4 && pasted[0] === "482193" && pasted[1] === 5 && pasted[2] === "482193" && pasted[3] === JSON.stringify({ value: "482193", complete: true }), JSON.stringify({ redirect, typed, back, home, end, left, pasted }));
    const btn = page.locator(`${ex("sign-in", "two-step")} button[type="submit"]`), help = () => page.evaluate((G) => { const g = document.querySelector(G); return [[...g.querySelectorAll(".code-cell")].filter((c) => c.getAttribute("aria-invalid") === "true").length, g.closest(".field").querySelector(".help").textContent.trim()]; }, G);
    await page.evaluate((G) => document.querySelectorAll(G + " .code-cell").forEach((c) => { c.value = ""; c.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "deleteContentBackward" })); }), G);
    await btn.click(); await wait(100); const empty = [...await help(), await at()];
    await page.keyboard.type("4821"); await btn.click(); await wait(100); const partial = [...await help(), await at()];
    await page.keyboard.type("93"); await wait(50); const fixed = await help();
    await page.keyboard.press("Backspace"); await page.keyboard.press("Backspace"); await page.keyboard.press("Tab"); await wait(50);
    const out = [...await help(), await page.evaluate(() => document.activeElement.closest(".checkbox") ? "checkbox" : document.activeElement.className)];
    await page.keyboard.press("Shift+Tab"); const backIn = await at();
    const row = await page.evaluate(() => [...document.querySelectorAll("#ex-sign-in-sign-in .auth-row .checkbox, #ex-sign-in-sign-in .auth-row .link")].map((e) => parseFloat(getComputedStyle(e).fontSize)));
    const auto = await page.evaluate(() => [document.getElementById("si-id").getAttribute("autocomplete"), document.getElementById("si-pw").getAttribute("autocomplete")]);
    ok("sign-in code validation: empty → '인증 코드를 입력하세요.' on all six boxes and focus on the first; 4 digits → '숫자 6자리를 모두 입력하세요.' and focus on the first empty box; typing the rest clears it back to the help; only one box is a Tab stop — after deleting two digits Tab leaves the group (to the checkbox) and announces the code message, Shift+Tab comes back to the first empty box; username/current-password autocomplete; the remember/find row is 14px",
      empty.join() === "6,인증 코드를 입력하세요.,0" && partial.join() === "6,숫자 6자리를 모두 입력하세요.,4" && fixed.join() === "0,코드는 30초마다 바뀝니다." && out.join() === "6,숫자 6자리를 모두 입력하세요.,checkbox" && backIn === 4 && auto.join() === "username,current-password" && row.length === 2 && row.every((x) => x === 14), JSON.stringify({ empty, partial, fixed, out, backIn, auto, row }));
  });

  await part("9 · 오류 화면 — 화면마다 다음 행동 하나", async () => {
    await go("patterns/error-pages.html");
    const r = await page.evaluate(() => [...document.querySelectorAll("#ex-error-pages-pages .empty, #ex-error-pages-inline .empty")].map((e) => e.querySelectorAll(".btn, a.link").length));
    ok("error pages: each of the six states offers exactly one next action", r.length === 6 && r.every((n) => n === 1), JSON.stringify(r));
  });

  await part("10 · API 키 — 만든 비밀값은 가려 있고 보기로 펼침 · 재발급은 alertdialog 에 취소가 앞", async () => {
    await go("patterns/secrets.html");
    const t0 = await page.locator("#sec-secret").getAttribute("type");
    await page.locator(`${ex("secrets", "created")} .reveal`).click(); await wait(50);
    const t1 = await page.locator("#sec-secret").getAttribute("type"), pressed = await page.locator(`${ex("secrets", "created")} .reveal`).getAttribute("aria-pressed");
    const re = await page.evaluate(() => { const p = document.getElementById("sec-reissue"); return [p.getAttribute("role"), ...[...p.querySelectorAll(".popup-actions .btn")].map((b) => b.textContent.trim())]; });
    ok("secrets: the new secret starts masked and 보기 reveals it (aria-pressed); reissue is an alertdialog with 취소 before 재발급",
      t0 === "password" && t1 === "text" && pressed === "true" && re.join() === "alertdialog,취소,재발급", JSON.stringify({ t0, t1, pressed, re }));
  });

  await part("11 · 권한 · 역할 — 일부 선택인 묶음을 누르면 모두 켜짐 · 기본 역할 구분", async () => {
    await go("patterns/roles.html");
    const it = page.locator("#ex-roles-edit .tree-item").filter({ has: page.locator(":scope > .tree-row > .tree-label", { hasText: /^사용자$/ }) }).first();
    const before = await it.getAttribute("aria-checked");
    await it.locator(":scope > .tree-row").click(); await wait(80);
    const after = await it.getAttribute("aria-checked"), kids = await it.locator(".tree-item").evaluateAll((xs) => xs.map((x) => x.getAttribute("aria-checked")));
    const tags = await page.evaluate(() => [...document.querySelectorAll("#ex-roles-list tbody tr")].map((r) => r.querySelector(".tag").textContent.trim()));
    ok("roles: the mixed '사용자' group turns fully on when pressed (its children too); the list marks 기본 · 사용자 정의",
      before === "mixed" && after === "true" && kids.length === 2 && kids.every((k) => k === "true") && tags.join() === "기본,기본,사용자 정의", JSON.stringify({ before, after, kids, tags }));
  });

  await part("12 · 상세 화면 — 탭을 옮기면 패널이 바뀜 · 위험 동작은 메뉴 맨 아래 구분선 뒤", async () => {
    await go("patterns/detail.html");
    const sel = ex("detail", "asset");
    await page.locator(`${sel} [role=tab]`, { hasText: "활동" }).click(); await wait(100);
    const r = await page.evaluate((s) => { const p = document.querySelector(s); const vis = (id) => !document.getElementById(id).hidden; const items = [...p.querySelectorAll(".dropdown .menu > li")]; return { a: vis("ad-panel-a"), b: vis("ad-panel-b"), last: items[items.length - 1].className, sep: items[items.length - 2].className }; }, sel);
    ok("detail: choosing 활동 shows its panel and hides 개요; the destructive action sits last in the ⋯ menu after a separator",
      !r.a && r.b && /danger/.test(r.last) && /menu-sep/.test(r.sep), JSON.stringify(r));
  });

  await part("13 · 가져오기 — 오류 줄만 표로 · 줄마다 오류 Tag 와 고치는 법 · 가져오기 버튼은 켜져 있음", async () => {
    await go("patterns/import-export.html");
    const r = await page.evaluate(() => { const p = document.querySelector("#ex-import-export-import .example-preview"); const rows = [...p.querySelectorAll("tbody tr")]; const main = p.querySelector(".btn.solid.primary"); return { n: rows.length, tags: rows.every((tr) => tr.querySelector(".tag") && tr.lastElementChild.textContent.replace(tr.querySelector(".tag").textContent, "").trim().length > 0), main: main && !main.disabled && main.textContent.trim(), warn: !!p.querySelector(".notice.warning") }; });
    ok("import: only the 3 failing lines are listed, each with an error Tag and how to fix it; the summary is a warning Notice and '1,281줄 가져오기' stays enabled",
      r.n === 3 && r.tags && r.main === "1,281줄 가져오기" && r.warn, JSON.stringify(r));
  });

  /* ---- 2026-11-15 남은 것 정리(사람의 결정) — Popup 위험 확인 · 좁은 화면 · 검색 툴바 두 줄 · 새 패턴 넷 ---- */
  const fieldState = (sel) => page.evaluate((sel) => { const i = document.querySelector(sel), f = i.closest(".field"); return { err: f.classList.contains("error"), msg: (f.querySelector(".help") || {}).textContent || "", inv: i.getAttribute("aria-invalid") }; }, sel);
  const overflow = (W, url) => (async () => { await page.setViewportSize({ width: W, height: 900 }); await go(url); await wait(300); return page.evaluate(() => [...document.querySelectorAll(".example-preview")].map((e) => [(e.closest("[id^=ex-]") || {}).id, e.scrollWidth - e.clientWidth]).filter((x) => x[1] > 1)); })();

  await part("14 · Popup 위험 확인 — 삭제 버튼은 켜져 있고, 빈 칸 · 다른 문구는 막고 '삭제' 는 통과", async () => {
    await go("components/popup.html");
    const btn = page.locator('#ex-popup-danger .btn[form="dg-form"]');
    const on = await btn.evaluate((b) => !b.disabled && b.getAttribute("aria-disabled") !== "true");
    await btn.click(); await wait(80); const empty = await fieldState("#confirm");
    await page.fill("#confirm", "삭"); await btn.click(); await wait(80); const wrong = await fieldState("#confirm");
    await page.fill("#confirm", "삭제"); await page.locator("#confirm").blur(); await wait(80); const right = await fieldState("#confirm");
    ok("popup danger: the delete button stays enabled; empty input blocks with '확인 문구를 입력하세요.', a different phrase blocks with the pattern message, '삭제' clears the error",
      on && empty.err && empty.msg === "확인 문구를 입력하세요." && wrong.err && /문구가 다릅니다/.test(wrong.msg) && !right.err && right.inv !== "true", JSON.stringify({ on, empty, wrong, right }));
  });

  await part("15 · 좁은 화면 — 모든 컴포넌트 · 패턴 미리보기가 390 · 768 안에 든다", async () => {
    /* 2026-11-15 은 고친 페이지 일곱만 쟀다. 2026-11-16 남은 넘침(Button 줄 · 상태 표 · Flat 카드 · Checkbox 가로 묶음 · Pagination Bar · Slider 숫자 입력 · Textarea · Tooltip 위치 · 두 달 달력)을
       고친 뒤 전부로 넓혔다. 패턴의 768 은 behave.system 의 다섯 폭 넘침 검사가 이미 잰다.
       Top Navigation 만 뺀다 — 바 전체가 내용 폭만큼 늘고 바깥이 가로로 스크롤하는 것이 2026-11-13 사람의 결정이다(behave.nav 가 그 모양을 잰다). */
    const S = require("./data.js").SITE, keys = (sec) => S[sec].groups.flatMap((g) => g[1].map((x) => x[0]));
    const comps = keys("components").filter((k) => k !== "top-navigation").map((k) => `components/${k}.html`), pats = keys("patterns").map((k) => `patterns/${k}.html`);
    const r = {};
    for (const u of [...comps, ...pats]) { const o = await overflow(390, u); if (o.length) r["390 " + u] = o; }
    for (const u of comps) { const o = await overflow(768, u); if (o.length) r["768 " + u] = o; }
    await page.setViewportSize({ width: 1440, height: 900 });
    ok(`narrow: at 390 no preview overflows on ${comps.length} component pages (Top Navigation scrolls by decision) and ${pats.length} pattern pages; at 768 none on the component pages`,
      comps.length >= 45 && pats.length >= 22 && Object.keys(r).length === 0, JSON.stringify(r));
  });

  await part("16 · 검색 툴바 — 한 줄, 검색칸이 남는 폭을 맞춤(2026-11-16)", async () => {
    /* 검색 · 심각도 Combobox · 기간이 한 줄, 옆 컨트롤은 제 폭이고 검색칸 = 툴바 폭 − 나머지 − 간격. 좁아지면 검색칸이 200 까지 줄고 그래도 넘치면 줄을 바꾼다(넘침 0).
       로그 뷰어 · 감사 로그의 검색 + 기간도 같은 규칙 */
    const tb = () => page.evaluate(() => [["search", "#ex-search-toolbar"], ["log", "#ex-log-viewer-viewer"], ["audit", "#ex-audit-log-list"]].map(([k, id]) => {
      const t = document.querySelector(`${id} .example-preview .toolbar:not(.sub)`); if (!t) return { k, missing: true };
      const kids = [...t.children].filter((e) => e.getClientRects().length && getComputedStyle(e).position !== "absolute"), R = (e) => e.getBoundingClientRect(), sb = t.querySelector(":scope > .searchbar");
      const gap = parseFloat(getComputedStyle(t).columnGap), rest = kids.filter((e) => e !== sb).reduce((a, e) => a + R(e).width, 0) + gap * (kids.length - 1);
      return { k, rows: new Set(kids.map((e) => Math.round(R(e).top))).size, sb: Math.round(R(sb).width), left: Math.round(t.clientWidth - rest), min: Math.round(parseFloat(getComputedStyle(sb).minWidth)), over: t.scrollWidth > t.clientWidth + 1, hs: [...new Set(kids.filter((e) => R(e).top === R(sb).top).map((e) => Math.round(R(e.querySelector(".control, .affix, .trigger") || e).height)))] };
    }));
    const out = {};
    for (const [w, page_] of [[1920, "patterns/search.html"], [1440, null], [1024, null], [768, null]]) {
      await page.setViewportSize({ width: w, height: 900 });
      const rows = [];
      for (const p of ["patterns/search.html", "patterns/log-viewer.html", "patterns/audit-log.html"]) { await go(p); rows.push(...(await tb()).filter((x) => p.includes(x.k === "search" ? "search" : x.k === "log" ? "log-viewer" : "audit-log"))); }
      out[w] = rows;
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    const wide = [1920, 1440, 1024].flatMap((w) => out[w]);
    ok("search toolbar: search, severity Combobox and date range on one line at 1024–1920 with the search box taking exactly the space left (log viewer and audit log too); at 768 the box stays ≥ 200 and the row wraps without overflow",
      wide.every((x) => !x.missing && x.rows === 1 && Math.abs(x.sb - x.left) <= 1 && x.sb >= x.min && x.hs.length === 1 && !x.over) && out[768].every((x) => !x.missing && x.sb >= x.min && !x.over) && out[768].some((x) => x.rows > 1), JSON.stringify(out));
  });

  await part("17 · 일괄 작업 진행 — 진행 막대 이름 · 값, 실패 수가 표 행 수와 다시 실행 버튼에 같음", async () => {
    await go("patterns/bulk-progress.html");
    const r = await page.evaluate(() => { const pb = document.querySelector("#ex-bulk-progress-running [role=progressbar]"); const res = document.querySelector("#ex-bulk-progress-result .example-preview"); return { now: pb && pb.getAttribute("aria-valuenow"), name: pb && pb.getAttribute("aria-label"), fill: pb && pb.querySelector("i").style.width, rows: res.querySelectorAll("tbody tr").length, main: res.querySelector(".btn.solid.primary").textContent.trim(), cancel: !!document.querySelector("#ex-bulk-progress-running .card .desc") }; });
    ok("bulk progress: the progressbar is named with value 66 and fill 66%, the cancel note explains what stops; the result lists 3 failures and the retry button says 3대",
      r.now === "66" && !!r.name && r.fill === "66%" && r.cancel && r.rows === 3 && r.main === "실패한 3대 다시 배포", JSON.stringify(r));
  });

  await part("18 · 보고서 예약 — 형식 라디오가 나란히 · 이름을 비우면 저장이 막힘 · 좁으면 두 칸 줄을 쌓음", async () => {
    await go("patterns/report-schedule.html");
    const radios = await page.evaluate(() => [...document.querySelectorAll("#ex-report-schedule-create fieldset.radio-group .radio")].map((l) => { const r = l.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right)]; }));
    await page.fill("#rp-name", ""); await page.locator('#ex-report-schedule-create [type=submit]').click(); await wait(80);
    const name = await fieldState("#rp-name"), focus = await page.evaluate(() => document.activeElement && document.activeElement.id);
    await page.setViewportSize({ width: 390, height: 900 }); await wait(150);
    const stack = await page.evaluate(() => [...document.querySelectorAll("#ex-report-schedule-create .form-row")].map((row) => [...row.children].map((c) => Math.round(c.getBoundingClientRect().left))));
    const acts = await page.evaluate(() => { const f = document.querySelector("#ex-report-schedule-create form").getBoundingClientRect(); return [...document.querySelectorAll("#ex-report-schedule-create .form-actions .btn")].every((b) => { const r = b.getBoundingClientRect(); return r.left >= f.left - 0.5 && r.right <= f.right + 0.5; }); });
    await page.setViewportSize({ width: 1440, height: 900 });
    const gap = radios.length === 2 ? radios[1][0] - radios[0][2] : -1;
    ok("report schedule: PDF and CSV sit on one line 24 apart (not pushed to the far edge); an empty name blocks 저장 and takes focus; at 390 each form row stacks and the three bottom buttons stay inside the form",
      radios.length === 2 && radios[0][1] === radios[1][1] && gap === 24 && name.err && focus === "rp-name" && stack.length === 2 && stack.every((xs) => xs.length === 2 && xs[0] === xs[1]) && acts, JSON.stringify({ radios, gap, name, focus, stack, acts }));
  });

  await part("19 · 감사 로그 — 행 펼침으로 변경 전 → 후 · 고치거나 지우는 동작 없음 · 되돌리기 이름은 버전마다", async () => {
    await go("patterns/audit-log.html");
    const b = page.locator('#ex-audit-log-list .expand-btn[aria-controls="au1-d"]');
    await b.click(); await wait(80);
    const r = await page.evaluate(() => { const p = document.querySelector("#ex-audit-log-list .example-preview"); const names = [...p.querySelectorAll("tbody button, tbody a")].map((x) => x.getAttribute("aria-label") || x.textContent.trim()); const rv = [...document.querySelectorAll("#ex-audit-log-history .actions .btn")].map((x) => x.getAttribute("aria-label")); return { open: !document.getElementById("au1-d").hidden, exp: p.querySelector('[aria-controls="au1-d"]').getAttribute("aria-expanded"), arrow: /→/.test(document.getElementById("au0-d").textContent), edit: names.filter((n) => /수정|삭제|편집/.test(n)), rv, uniq: new Set(rv).size === rv.length }; });
    ok("audit log: expanding a row opens its detail (aria-expanded), changes read before → after, rows offer no edit/delete, each revert button names its version",
      r.open && r.exp === "true" && r.arrow && r.edit.length === 0 && r.rv.length === 2 && r.uniq, JSON.stringify(r));
  });

  await part("20 · 알림 규칙 — 횟수 ↑ 가 단위까지 읽히고, 웹훅 주소가 틀리면 제품 문구로 막음", async () => {
    await go("patterns/alert-rules.html");
    await page.locator("#ar-count").focus(); await page.keyboard.press("ArrowUp"); await wait(50);
    const n = await page.evaluate(() => { const i = document.getElementById("ar-count"); return [i.value, i.getAttribute("aria-valuetext")]; });
    await page.fill("#ar-hook", "hooks.example.com"); await page.locator('#ex-alert-rules-builder [type=submit]').click(); await wait(80);
    const hook = await fieldState("#ar-hook"), focus = await page.evaluate(() => document.activeElement && document.activeElement.id);
    ok("alert rules: ↑ makes the count 6 read as '6건 이상'; a URL without https:// blocks 저장 with the custom message and takes focus",
      n[0] === "6" && n[1] === "6건 이상" && hook.err && hook.msg === "https:// 로 시작하는 주소를 입력하세요." && focus === "ar-hook", JSON.stringify({ n, hook, focus }));
  });

  await part("21 · 두 달 달력 — 767px 이하에서는 한 달, 창 크기를 따라감", async () => {
    const m = () => page.evaluate(() => { const c = document.querySelector("#ex-date-picker-range-calendar .calendar"); return { two: c.classList.contains("two"), grids: c.querySelectorAll(".cal-grid").length, start: !!c.querySelector(".day.start") }; });
    await page.setViewportSize({ width: 390, height: 900 }); await go("components/date-picker.html"); await wait(200); const narrow = await m();
    await page.setViewportSize({ width: 1440, height: 900 }); await wait(250); const wide = await m();
    await page.setViewportSize({ width: 390, height: 900 }); await wait(250); const back = await m();
    await page.setViewportSize({ width: 1440, height: 900 }); await go("components/date-picker.html"); await wait(200); const fresh = await m();
    ok("range calendar: one month at 390 (no .two), two after widening to 1440, one again after narrowing, two when opened wide; the selected start stays drawn",
      !narrow.two && narrow.grids === 1 && narrow.start && wide.two && wide.grids === 2 && !back.two && back.grids === 1 && fresh.two && fresh.grids === 2 && fresh.start, JSON.stringify({ narrow, wide, back, fresh }));
  });

  await part("22 · 팝업 안 Date Picker · Time Picker — 달력 · 열 목록이 팝업 본문에 잘리지 않고 위로 뜸, 바깥 스크롤을 따라가고 필드가 사라지면 닫힘(사람의 요청 2026-11-17)", async () => {
    /* 패널이 잘리지 않았는지 = 네 모서리 안쪽 점이 모두 그 패널을 맞힘(팝업 본문이 자르면 바깥 점이 다른 요소를 맞힌다) */
    const probe = (host, panel) => page.evaluate(([h, p]) => {
      const host = document.querySelector(h), el = host.querySelector(p), r = el.getBoundingClientRect(), a = host.querySelector(":scope > .affix").getBoundingClientRect();
      const pts = [[r.left + 12, r.top + 12], [r.right - 12, r.top + 12], [r.left + 12, r.bottom - 12], [r.right - 12, r.bottom - 12]];
      return { open: host.classList.contains("open"), float: host.classList.contains("float"), pos: getComputedStyle(el).position, hits: pts.map(([x, y]) => el.contains(document.elementFromPoint(x, y))).every(Boolean), gap: Math.round(host.classList.contains("up") ? a.top - r.bottom : r.top - a.bottom) };
    }, [host, panel]);
    const dpSel = "#ex-import-export-export .datepicker", tpSel = "#ex-import-export-export .timepicker";
    await go("patterns/import-export.html");
    await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: "center", behavior: "instant" }), dpSel); await wait(120);
    await page.locator(`${dpSel} .cal-btn`).click(); await wait(150);
    const dp = await probe(dpSel, ":scope > .calendar");
    const y0 = await page.evaluate((s) => { const h = document.querySelector(s); return [h.querySelector(":scope > .affix").getBoundingClientRect().top, h.querySelector(":scope > .calendar").getBoundingClientRect().top]; }, dpSel);
    await page.mouse.wheel(0, 60); await wait(200);
    const y1 = await page.evaluate((s) => { const h = document.querySelector(s); return [h.querySelector(":scope > .affix").getBoundingClientRect().top, h.querySelector(":scope > .calendar").getBoundingClientRect().top, h.classList.contains("open")]; }, dpSel);
    const follow = Math.abs((y1[0] - y1[1]) - (y0[0] - y0[1])) < 1 && Math.abs(y1[0] - y0[0]) > 20 && y1[2];
    await page.evaluate(() => window.scrollBy({ top: 3000, behavior: "instant" })); await wait(200);
    const gone = await page.evaluate((s) => { const h = document.querySelector(s); return { open: h.classList.contains("open"), float: h.classList.contains("float"), focus: document.activeElement === h.querySelector(":scope > .affix input") }; }, dpSel);
    ok("in the export popup the Date Picker calendar floats (.float, fixed) above the popup body — all four corners are visible, 4px from the field; an outer scroll moves it with the field; scrolling the field away closes it and focus returns to the field",
      dp.open && dp.float && dp.pos === "fixed" && dp.hits && dp.gap === 4 && follow && !gone.open && !gone.float && gone.focus, JSON.stringify({ dp, y0, y1, gone }));

    await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: "center", behavior: "instant" }), tpSel); await wait(120);
    await page.locator(`${tpSel} .tp-btn`).click(); await wait(150);
    const tp = await probe(tpSel, ":scope > .time-panel");
    await page.evaluate((s) => { document.querySelector(s).querySelector(".time-col").scrollTop += 96; }, tpSel); await wait(150);
    const tpCol = await page.evaluate((s) => document.querySelector(s).classList.contains("open"), tpSel);
    await page.keyboard.press("Escape"); await wait(80);
    const tpOff = await page.evaluate((s) => { const h = document.querySelector(s); return !h.classList.contains("open") && !h.classList.contains("float"); }, tpSel);
    ok("in the same popup the Time Picker listboxes float the same way (all corners visible), scrolling a column keeps them open, closing drops .float",
      tp.open && tp.float && tp.pos === "fixed" && tp.hits && tp.gap === 4 && tpCol && tpOff, JSON.stringify({ tp, tpCol, tpOff }));

    /* 시각 있는 Date Picker 를 팝업 본문에 넣어 — 띄운 달력 안의 시각 칸은 다시 띄우지 않는다(화면 기준 조상에서 멈춤) */
    await page.evaluate((s) => {
      const src = document.querySelector(s), c = src.cloneNode(true); c.setAttribute("data-time", ""); c.removeAttribute("data-max-days");
      const i = c.querySelector(":scope > .affix input"); i.id = "exp-range-t"; i.value = "2026. 11. 08 00:00 ~ 2026. 11. 14 23:59"; i.placeholder = "YYYY. MM. DD HH:mm ~ YYYY. MM. DD HH:mm";
      c.querySelector("label").setAttribute("for", "exp-range-t"); src.after(c); window.DS.init(c.parentNode); c.scrollIntoView({ block: "center", behavior: "instant" });
    }, dpSel); await wait(150);
    const tSel = "#ex-import-export-export .datepicker[data-time]";
    await page.locator(`${tSel} .cal-btn`).click(); await wait(150);
    await page.locator(`${tSel} .cal-time .tp-btn`).first().click(); await wait(150);
    const inner = await page.evaluate((s) => { const h = document.querySelector(s), t = h.querySelector(".cal-time .timepicker"), p = t.querySelector(".time-panel"); return { cal: h.classList.contains("float"), open: t.classList.contains("open"), float: t.classList.contains("float"), pos: getComputedStyle(p).position }; }, tSel);
    ok("a time Date Picker in the popup body: the calendar floats, its own time field opens its listboxes inside the floated calendar (absolute, no second .float)",
      inner.cal && inner.open && !inner.float && inner.pos === "absolute", JSON.stringify(inner));

    await go("patterns/secrets.html");
    await page.evaluate(() => document.querySelector("#ex-secrets-create .datepicker").scrollIntoView({ block: "center", behavior: "instant" })); await wait(120);
    await page.locator("#ex-secrets-create .datepicker .cal-btn").click(); await wait(150);
    const sec = await probe("#ex-secrets-create .datepicker", ":scope > .calendar");
    await go("components/date-picker.html");
    await page.locator("#ex-date-picker-default .datepicker .cal-btn").first().click(); await wait(150);
    const plain = await page.evaluate(() => { const h = document.querySelector("#ex-date-picker-default .datepicker"); return { open: h.classList.contains("open"), float: h.classList.contains("float"), pos: getComputedStyle(h.querySelector(":scope > .calendar")).position }; });
    ok("the key creation popup floats its expiry calendar too (all corners visible); a Date Picker outside any scroll area keeps the absolute calendar (no .float)",
      sec.open && sec.float && sec.hits && plain.open && !plain.float && plain.pos === "absolute", JSON.stringify({ sec, plain }));
  });
};
