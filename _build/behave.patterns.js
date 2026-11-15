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

  await part("8 · 로그인 — 2단계 인증 한 칸의 속성 · 숫자 6자리 검사 · 로그인 줄 글자 14", async () => {
    await go("patterns/sign-in.html");
    const attrs = await page.evaluate(() => { const i = document.getElementById("si-otp"); return [i.getAttribute("inputmode"), i.getAttribute("autocomplete"), i.getAttribute("pattern"), i.required, document.querySelectorAll("#ex-sign-in-two-step input:not([type=checkbox])").length]; });
    const btn = page.locator(`${ex("sign-in", "two-step")} button[type="submit"]`), help = () => page.evaluate(() => { const i = document.getElementById("si-otp"); return [i.getAttribute("aria-invalid"), i.closest(".field").querySelector(".help").textContent.trim()]; });
    await page.locator("#si-otp").fill("12a"); await btn.click(); await wait(100); const badCode = await help();
    await page.locator("#si-otp").fill("123456"); await btn.click(); await wait(100); const goodCode = await help();
    const row = await page.evaluate(() => [...document.querySelectorAll("#ex-sign-in-sign-in .auth-row .checkbox, #ex-sign-in-sign-in .auth-row .link")].map((e) => parseFloat(getComputedStyle(e).fontSize)));
    const auto = await page.evaluate(() => [document.getElementById("si-id").getAttribute("autocomplete"), document.getElementById("si-pw").getAttribute("autocomplete")]);
    ok("sign-in: the one-time code is a single numeric field (inputmode numeric · one-time-code · [0-9]{6}); '12a' is blocked with '숫자 6자리를 입력하세요.', 123456 passes; username/current-password autocomplete; the remember/find row is 14px",
      attrs.join() === "numeric,one-time-code,[0-9]{6},true,1" && badCode[0] === "true" && badCode[1] === "숫자 6자리를 입력하세요." && goodCode[0] !== "true" && auto.join() === "username,current-password" && row.length === 2 && row.every((x) => x === 14), JSON.stringify({ attrs, badCode, goodCode, auto, row }));
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

  await part("16 · 검색 툴바 — 첫 줄 검색 · 기간, 둘째 줄 심각도", async () => {
    await go("patterns/search.html");
    const r = await page.evaluate(() => { const bars = [...document.querySelectorAll("#ex-search-toolbar .example-preview .toolbar:not(.sub)")]; const top = (sel, b) => { const e = b && b.querySelector(sel); return e ? Math.round(e.getBoundingClientRect().top) : null; }; return { n: bars.length, s: top(".searchbar", bars[0]), d: top(".datepicker", bars[0]), c: top(".combobox", bars[1]), c0: !!(bars[0] && bars[0].querySelector(".combobox")) }; });
    ok("search toolbar: two rows — search and date range share the first line, the severity Combobox sits alone on the second",
      r.n === 2 && r.s !== null && r.s === r.d && r.c > r.s && !r.c0, JSON.stringify(r));
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
};
