// 사이트 프리뷰 동작 검증 (assets/ds.js): 빌드 후 `node behave.js` — 드롭다운·탭·달력·표 정렬 등 45 케이스를 실제 클릭으로 확인, 스크린샷은 .behave/
const path = require("path");
const SITE = "/Users/jeonghee/Documents/02 제품별/디자인시스템";
const { chromium } = require(path.join(SITE, "_build/node_modules/playwright"));
const SHOT = path.join(__dirname, ".behave");
require("fs").mkdirSync(SHOT, { recursive: true });
const results = [];
const ok = (name, cond, extra = "") => results.push([cond ? "PASS" : "FAIL", name, extra]);

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const go = async (p) => { await page.goto("file://" + path.join(SITE, p)); await page.waitForTimeout(150); };
  const ex = (pg, id) => `#ex-${pg}-${id} .example-preview`;

  // Dropdown
  await go("components/dropdown.html");
  const dd = page.locator(`${ex("dropdown", "select")} .dropdown`).first();
  await dd.locator(".trigger").click();
  ok("dropdown open on click", await dd.evaluate((e) => e.classList.contains("open") && e.querySelector(".trigger").getAttribute("aria-expanded") === "true"));
  ok("dropdown shows its own menu when opened", await dd.evaluate((e) => { const m = e.querySelector(".menu"); return !!m && getComputedStyle(m).display !== "none"; }));
  await page.mouse.click(5, 5);
  ok("dropdown closes on outside click", await dd.evaluate((e) => !e.classList.contains("open")));
  const dd2 = page.locator(`${ex("dropdown", "select")} .dropdown`).nth(1);
  ok("static open dropdown stays open after outside click", await dd2.evaluate((e) => e.classList.contains("open")));
  await dd2.locator(".menu-item").nth(2).click();
  ok("select item updates trigger + closes", await dd2.evaluate((e) => !e.classList.contains("open") && e.querySelector(".trigger").textContent.trim() === "개발팀" && e.querySelector(".menu-item.on").textContent === "개발팀"));
  await dd2.locator(".trigger").click();
  await page.keyboard.press("ArrowDown"); await page.keyboard.press("Enter");
  ok("keyboard nav selects next item", await dd2.evaluate((e) => e.querySelector(".menu-item.on").textContent === "인프라팀"));
  await dd2.locator(".trigger").click(); await page.keyboard.press("Escape");
  ok("Esc closes dropdown", await dd2.evaluate((e) => !e.classList.contains("open")));
  const menuDd = page.locator(`#ex-dropdown-menu .example-preview .dropdown`).first();
  await menuDd.locator("[aria-haspopup]").click();
  ok("static open menu closes on trigger click", await menuDd.evaluate((e) => !e.classList.contains("open")));
  await menuDd.locator("[aria-haspopup]").click();
  ok("menu dropdown re-opens", await menuDd.evaluate((e) => e.classList.contains("open") && e.querySelector("[aria-haspopup]").getAttribute("aria-expanded") === "true"));
  await page.screenshot({ path: SHOT + "/dropdown.png", clip: await menuDd.boundingBox().then((bb) => ({ x: bb.x - 10, y: bb.y - 10, width: bb.width + 200, height: bb.height + 260 })) });

  // Tabs
  await go("components/tab.html");
  const tabs = page.locator(".example-preview .tabs").first();
  await tabs.locator(".tab").nth(1).click();
  ok("tab switches", await tabs.evaluate((e) => { const on = e.querySelectorAll(".tab.on"); return on.length === 1 && on[0] === e.querySelectorAll(".tab")[1] && on[0].getAttribute("aria-selected") === "true"; }));
  await page.keyboard.press("ArrowRight");
  ok("tab arrow key", await tabs.evaluate((e) => e.querySelectorAll(".tab")[2].classList.contains("on")));

  // Select button, chip, tile
  await go("components/select-button.html");
  const sb = page.locator(".example-preview .select-btn").first();
  await sb.locator("button").nth(1).click();
  ok("select-btn switches", await sb.evaluate((e) => e.querySelectorAll("button.on").length === 1 && e.querySelectorAll("button")[1].getAttribute("aria-pressed") === "true"));
  await go("components/chip.html");
  const chip = page.locator(".example-preview button.chip[aria-pressed]").first();
  const before = await chip.getAttribute("aria-pressed");
  await chip.click();
  ok("chip toggles", (await chip.getAttribute("aria-pressed")) !== before);
  const xchips = page.locator(".example-preview .chip .x");
  const nx = await xchips.count();
  if (nx) { await xchips.first().click(); await page.waitForTimeout(250); ok("input chip removed", (await xchips.count()) === nx - 1); }
  await go("components/item-tile.html");
  const tile = page.locator(".example-preview .tile[aria-pressed]").first();
  const tb = await tile.getAttribute("aria-pressed"); await tile.click();
  ok("tile toggles", (await tile.getAttribute("aria-pressed")) !== tb);

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

  // Date picker
  await go("components/date-picker.html");
  const dp = page.locator(`${ex("date-picker", "field")} .datepicker`).first();
  await dp.locator(".field-btn").click();
  ok("datepicker opens + generates calendar", await dp.evaluate((e) => e.classList.contains("open") && e.querySelectorAll(".calendar .day").length >= 28));
  ok("open calendar is not clipped by the example section", await dp.evaluate((e) => { const cal = e.querySelector(".calendar"); cal.scrollIntoView({ block: "center", behavior: "instant" }); const c = cal.getBoundingClientRect(), p = e.closest(".example").getBoundingClientRect(); return c.bottom > p.bottom && getComputedStyle(e.closest(".example")).overflow === "visible" && document.elementFromPoint(c.left + 20, c.bottom - 20)?.closest(".calendar") === cal; }));
  await dp.locator(".calendar").evaluate((c) => c.scrollIntoView({ block: "center", behavior: "instant" })); // 달력이 섹션 밖으로 나가므로 상단 고정 헤더에 가리지 않게 가운데로
  await dp.locator(".calendar .day:not(.muted)").nth(9).click();
  await dp.locator(".calendar [data-cal=apply]").click();
  ok("datepicker apply sets field", await dp.evaluate((e) => /\d{4}-\d{2}-10/.test(e.querySelector(".field-btn").textContent) && !e.classList.contains("open") && !e.querySelector(".placeholder")));
  const rdp = page.locator(`${ex("date-picker", "field")} .datepicker`).nth(1);
  await rdp.locator(".field-btn").click();
  ok("range field builds range calendar", await rdp.evaluate((e) => e.querySelectorAll(".day.on").length === 2 && e.querySelectorAll(".day.in-range").length === 5));
  await page.screenshot({ path: SHOT + "/datepicker.png", clip: await rdp.boundingBox().then((bb) => ({ x: bb.x - 10, y: bb.y - 10, width: bb.width + 40, height: bb.height + 340 })) });
  const cal = page.locator(`${ex("date-picker", "calendar")} .calendar`).first();
  await page.keyboard.press("Escape"); // 앞서 연 필드 달력(absolute) 닫기
  await cal.evaluate((c) => c.scrollIntoView({ block: "center", behavior: "instant" })); // 상단 고정 헤더에 가리지 않게
  await cal.locator(".cal-head button").last().click();
  ok("static calendar next month", await cal.evaluate((e) => e.querySelector(".cal-head span").textContent.includes("10월")));
  await cal.locator(".day:not(.muted)").nth(4).click();
  ok("static calendar day select", await cal.evaluate((e) => e.querySelectorAll(".day.on").length === 1 && e.querySelector(".day.on").textContent === "5"));

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
  ok("terms next enabled initially (required checked)", await terms.locator(".btn.primary").isEnabled());
  await terms.locator(".item input").first().click();
  ok("terms next disabled when required unchecked", await terms.locator(".btn.primary").isDisabled());
  await terms.locator(".all input").click();
  ok("terms all → all checked + enabled", await terms.evaluate((e) => [...e.querySelectorAll(".item input")].every((i) => i.checked) && !e.querySelector(".btn.primary").disabled));

  // Data table
  await go("components/data-table.html");
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
  await go("patterns/onboarding.html");
  const ob = page.locator("#ex-onboarding-step .example-preview .onboard");
  await ob.locator('[data-step="next"]').click();
  ok("onboarding next moves step", await ob.evaluate((e) => { const li = e.querySelectorAll(".steps li"); return li[2].classList.contains("on") && li[2].getAttribute("aria-current") === "step" && li[1].classList.contains("done") && !li[1].classList.contains("on"); }));
  await ob.locator('[data-step="prev"]').click(); await ob.locator('[data-step="prev"]').click();
  ok("onboarding prev disabled at first step", await ob.evaluate((e) => e.querySelectorAll(".steps li")[0].classList.contains("on") && e.querySelector('[data-step="prev"]').disabled && e.querySelectorAll(".steps li")[1].querySelector("i").textContent.trim() === "2"));
  await ob.locator(".tile").nth(1).click();
  ok("onboarding tiles single select", await ob.evaluate((e) => e.querySelectorAll(".tile.on").length === 1 && e.querySelectorAll(".tile")[1].getAttribute("aria-pressed") === "true"));
  await go("components/date-picker.html");
  const rc = page.locator("#ex-date-picker-range .example-preview .calendar");
  await rc.locator('[data-preset="7"]').click();
  ok("calendar preset marks 7-day range", await rc.evaluate((e) => { const on = e.querySelectorAll(".day.on").length, inr = e.querySelectorAll(".day.in-range").length; return (on === 2 && inr === 5) || (on === 1 && inr <= 5) /* 월 경계 */; }));
  await go("components/text-field.html");
  const cf = page.locator("#ex-text-field-affix .example-preview .field").filter({ has: page.locator(".counter") }).first();
  await cf.locator("input").fill("새 정책");
  ok("text field counter updates", (await cf.locator(".counter").textContent()) === "4 / 80");
  await go("components/card.html");
  const cg = page.locator("#ex-card-clickable .example-preview .card-grid");
  await cg.locator(".card.clickable").first().click();
  ok("clickable card single select", await cg.evaluate((e) => e.querySelectorAll(".card.on").length === 1 && e.querySelectorAll(".card")[0].classList.contains("on")));

  // Nav
  await go("components/navigation.html");
  const nav = page.locator(".example-preview .sidenav").first();
  await nav.locator("a").nth(2).click();
  ok("sidenav active moves", await nav.evaluate((e) => e.querySelectorAll("a.on").length === 1 && e.querySelectorAll("a")[2].classList.contains("on")));
  ok("no scroll jump (hash unchanged)", !(await page.evaluate(() => location.hash)));

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
  await page.evaluate((s) => window.DS.popup.open(s), popupSel);
  ok("DS.popup.open mounts backdrop", await page.evaluate(() => !!document.querySelector("body > .popup-backdrop[data-ds-popup] .popup")));
  await page.screenshot({ path: SHOT + "/popup.png" });
  await page.keyboard.press("Escape");
  ok("popup Esc restores", await page.evaluate(() => !document.querySelector("body > .popup-backdrop[data-ds-popup]") && !!document.querySelector(".example-preview #test-popup")));

  // app.js doc chrome still works: code tab switch + copy button present
  await go("components/button.html");
  const bar = page.locator(".example-bar").first();
  await bar.locator("button[data-tab=react], .doc-tabs button, [data-tab]").nth(1).click().catch(() => {});
  ok("doc chrome intact (no page errors so far)", errors.length === 0, errors.join(" | "));

  // sweep: every component/pattern page loads w/o errors
  const fs = require("fs");
  for (const sec of ["components", "patterns"]) for (const f of fs.readdirSync(path.join(SITE, sec))) { await go(`${sec}/${f}`); }
  await go("index.html");
  ok("all pages load without JS errors", errors.length === 0, errors.slice(0, 3).join(" | "));

  await b.close();
  let fail = 0;
  for (const [s, n, x] of results) { if (s === "FAIL") fail++; console.log(`${s}  ${n}${x ? "  (" + x + ")" : ""}`); }
  console.log(`\n${results.length - fail}/${results.length} passed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
