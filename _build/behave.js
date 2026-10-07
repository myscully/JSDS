// 사이트 프리뷰 동작 검증 (assets/ds.js): 빌드 후 `node behave.js` — 드롭다운·탭·달력·표 정렬 등 116 케이스를 실제 클릭으로 확인, 스크린샷은 .behave/
const path = require("path");
const SITE = path.resolve(__dirname, "..");
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
  /* 트리거를 뷰포트 아래쪽으로 "스크롤"할 수는 없으므로(예제가 페이지 위쪽에 있다) 뷰포트 높이로 여유를 만든다 */
  const flip = async (h) => {
    await page.setViewportSize({ width: 1440, height: h });
    await page.waitForTimeout(120);
    const d = page.locator(`${ex("select", "default")} .dropdown`);
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

  // 제품 메인 컬러가 상태색과 겹치면 램프 자체가 무채색으로 바뀐다 — 버튼·텍스트·포커스 링·Atomic 램프가 함께 내려간다
  await go("components/button.html");
  const accent = async (key) => {
    await page.click("#accentBtn"); await page.waitForTimeout(80);
    await page.locator(`#accentPop [data-accent="${key}"]`).click(); await page.waitForTimeout(150);
    return page.evaluate(() => {
      /* 마지막 호출은 Colors 페이지에서 일어나 버튼이 없다 — 그때는 플래그만 본다 */
      const btn = document.querySelector("#ex-button-variant .btn.primary"), txt = document.querySelector("#ex-button-variant .btn.text");
      const r = getComputedStyle(document.documentElement);
      const g = (n) => r.getPropertyValue(n).trim();
      return {
        neutral: document.documentElement.hasAttribute("data-accent-neutral"),
        bg: btn ? getComputedStyle(btn).backgroundColor : "", text: txt ? getComputedStyle(txt).color : "",
        accent: g("--accent"), focus: g("--border-focus"), subtle: g("--accent-subtle"),
        ramp: [600, 300, 100].map((k) => g("--accent-" + k)).join(" "),
      };
    });
  };
  const teal = await accent("product-a"), red = await accent("product-b");
  ok("teal product keeps its main colour", !teal.neutral && teal.bg === "rgb(0, 170, 182)" && teal.text === "rgb(0, 170, 182)" && teal.accent === "#00AAB6", JSON.stringify(teal));
  ok("red product turns the whole accent ramp neutral",
    red.neutral && red.bg === "rgb(15, 23, 42)" && red.text === "rgb(15, 23, 42)"
    && red.accent === "#0F172A" && red.focus === "#64748B" && red.subtle === "#F1F5F9"
    && red.ramp === "#475569 #CBD5E1 #F1F5F9", JSON.stringify(red));
  await page.click("#themeBtn"); await page.waitForTimeout(200);
  const dark = await page.evaluate(() => {
    const c = getComputedStyle(document.querySelector("#ex-button-variant .btn.primary"));
    return { bg: c.backgroundColor, fg: c.color, accent: getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() };
  });
  ok("dark neutral Primary flips to light grey", dark.bg === "rgb(148, 163, 184)" && dark.fg === "rgb(23, 23, 25)" && dark.accent === "#94A3B8", JSON.stringify(dark));
  await page.click("#themeBtn"); await page.waitForTimeout(150);

  // Atomic 의 Accent 램프도 함께 회색 — 제품 컬러에서 파생되는 것은 전부 따라온다
  await go("foundations/colors.html");
  const ramp = await page.evaluate(() => {
    const at = document.querySelectorAll('[data-token="--accent-600"]');
    return { n: at.length, bg: at.length ? getComputedStyle(at[0]).backgroundColor : "" };
  });
  ok("Atomic Accent ramp follows the neutral switch", ramp.n === 1 && ramp.bg === "rgb(71, 85, 105)", JSON.stringify(ramp));
  const base = await accent("");
  ok("back to token accent clears the flag", !base.neutral, JSON.stringify(base));

  // Button: loading 은 마우스·키보드 클릭을 모두 막는다 (pointer-events:none 만으로는 Enter 가 통과했다)
  await go("components/button.html");
  await page.evaluate(() => { window.__hit = 0; document.querySelectorAll("#ex-button-state .btn").forEach((b) => b.addEventListener("click", () => window.__hit++)); });
  const loadBtn = page.locator("#ex-button-state .btn.loading").first();
  ok("loading button carries aria-busy", (await loadBtn.getAttribute("aria-busy")) === "true");
  await loadBtn.evaluate((e) => e.focus());
  await page.keyboard.press("Enter"); await page.keyboard.press("Space");
  await loadBtn.evaluate((e) => e.click());
  await page.waitForTimeout(80);
  ok("loading blocks click from mouse and keyboard", (await page.evaluate(() => window.__hit)) === 0);
  await page.locator("#ex-button-state .btn").first().evaluate((e) => e.click());
  await page.waitForTimeout(60);
  ok("a normal button still fires", (await page.evaluate(() => window.__hit)) === 1);

  // Accordion: disabled 는 마우스·키보드 양쪽을 막고 보조기기에도 알려야 한다 + name 그룹 단일 개방 + flat 마지막 줄
  await go("components/accordion.html");
  const accDis = page.locator("#ex-accordion-flat .accordion.disabled");
  ok("disabled accordion carries aria-disabled", (await accDis.locator("summary").getAttribute("aria-disabled")) === "true");
  // pointer-events:none 이라 Playwright 의 click() 은 actionability 에서 멈춘다 — 요소에게 직접 클릭을 보낸다
  await accDis.locator("summary").evaluate((e) => e.click());
  await page.waitForTimeout(120);
  ok("disabled accordion ignores a mouse click", (await accDis.evaluate((e) => e.open)) === false);
  await accDis.locator("summary").evaluate((e) => e.focus());
  await page.keyboard.press("Enter"); await page.keyboard.press("Space");
  await page.waitForTimeout(120);
  ok("disabled accordion ignores Enter and Space", (await accDis.evaluate((e) => e.open)) === false);
  await page.locator("#ex-accordion-group .accordion").nth(1).locator("summary").evaluate((e) => e.click());
  await page.waitForTimeout(350);
  const accGrp = await page.evaluate(() => [...document.querySelectorAll("#ex-accordion-group .accordion")].map((d) => d.open));
  ok("name group keeps only one panel open", JSON.stringify(accGrp) === "[false,true,false]", JSON.stringify(accGrp));
  const accFlat = await page.evaluate(() => {
    const it = [...document.querySelectorAll("#ex-accordion-flat .accordion.flat")];
    return { last: getComputedStyle(it[it.length - 1]).borderBottomWidth, first: getComputedStyle(it[0]).borderBottomWidth };
  });
  ok("last flat row drops its bottom border", accFlat.last === "0px" && accFlat.first === "1px", JSON.stringify(accFlat));
  // 보간 중간값을 재면 경쟁 조건이 되므로 전환 선언 자체를 본다
  const accMotion = await page.evaluate(() => {
    const d = document.querySelector("#ex-accordion-basic .accordion");
    return { prop: getComputedStyle(d, "::details-content").transitionProperty, size: getComputedStyle(d).interpolateSize };
  });
  ok("accordion body height is transitioned", /height/.test(accMotion.prop) && accMotion.size === "allow-keywords", JSON.stringify(accMotion));

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
    const ol = document.querySelector("#ex-breadcrumb-basic .breadcrumb");
    const a = ol.querySelector("li>a"), sp = ol.querySelector("[aria-current]>span");
    const short = Math.round(a.getBoundingClientRect().width);
    a.textContent = "외부 저장장치 차단 정책 본사 영업부 전체 적용 규칙 2026 그리고 더 길게";
    sp.textContent = "현재 페이지 이름도 아주 길어질 수 있습니다 예를 들면 이렇게요 정말로";
    const w = (e) => Math.round(e.getBoundingClientRect().width);
    return { short, longLink: w(a), longCurrent: w(sp), clipped: a.scrollWidth > a.clientWidth, row: Math.round(ol.getBoundingClientRect().height) };
  });
  ok("breadcrumb truncates long labels at 220", bcCut.longLink === 220 && bcCut.longCurrent === 220 && bcCut.clipped && bcCut.short < 220 && bcCut.row === 22, JSON.stringify(bcCut));
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

  // Components: Anatomy 없음 · Examples 제목 없음 · 1. Default 로 시작
  await go("components/button.html");
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
  ok("pattern page matches the component layout", !pm.examplesH2 && pm.heads === "1. 기본 폼 / 2. 오류 상태", JSON.stringify(pm));
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
  ok("white swatch gets an outline, saturated one does not", (await faint("--static-white")) && (await faint("--bg-canvas")) && !(await faint("--accent")) && !(await faint("--static-black")));
  await page.click("#themeBtn"); await page.waitForTimeout(150);
  ok("outline follows the theme (dark: black faint, white not)", (await faint("--static-black")) && !(await faint("--static-white")));
  await page.click("#themeBtn"); await page.waitForTimeout(150);

  // Atomic 팔레트 칸 수 + 반응형 블록이 실제로 적용되는지 (한동안 컴포넌트 규칙에 덮여 죽어 있었다)
  for (const [w, want] of [[1440, [2, 14, 11]], [760, [2, 7, 7]], [390, [2, 5, 5]]]) {
    await page.setViewportSize({ width: w, height: 900 });
    await go("foundations/colors.html");
    await page.locator('.doc-tabs [data-doctab="atomic"]').click();
    const got = await page.evaluate(() => ["Common", "Gray", "Red"].map((t) => {
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
  const atom = '.pal .val-cell[data-token="--gray-500"]';
  await page.locator(atom).evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.locator(atom).click();
  await page.waitForSelector("#valPop:not([hidden])", { timeout: 2000 });
  const av = await page.evaluate((sel) => {
    const c = document.querySelector(sel).getBoundingClientRect(), p = document.getElementById("valPop").getBoundingClientRect();
    const row = (k) => [...document.querySelectorAll("#valPopRows .val-row")].filter((r) => r.querySelector("b").textContent === k).map((r) => r.querySelector("span").textContent)[0];
    return { t: document.getElementById("valPopTitle").textContent, hex: row("Hex"), tok: row("Token"), below: Math.round(p.top - c.bottom), label: document.querySelector(sel).querySelector("i").textContent };
  }, atom);
  ok("atomic swatch opens the same pop", av.t === "Gray / 500" && /^#[0-9A-F]{6}$/.test(av.hex) && av.tok === "var(--gray-500)" && av.below >= 0 && av.below <= 16 && av.label === "500", JSON.stringify(av));
  await page.screenshot({ path: SHOT + "/val-pop-atomic.png" });
  await page.keyboard.press("Escape");
  ok("atomic pop closes on Esc", await page.locator("#valPop").evaluate((e) => e.hidden));

  // Colors: Semantic 스와치 클릭 → 값 팝오버 (딤 없이 바 아래, 토큰 복사)
  await go("foundations/colors.html");
  await page.locator("#primary").evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }));
  const cellSel = '.val-cell[data-token="--accent"]';
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
  const fs = require("fs");
  for (const sec of ["components", "patterns"]) for (const f of fs.readdirSync(path.join(SITE, sec))) { await go(`${sec}/${f}`); }
  await go("index.html");
  ok("all pages load without JS errors", errors.length === 0, errors.slice(0, 3).join(" | "));

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

  await b.close();
  let fail = 0;
  for (const [s, n, x] of results) { if (s === "FAIL") fail++; console.log(`${s}  ${n}${x ? "  (" + x + ")" : ""}`); }
  console.log(`\n${results.length - fail}/${results.length} passed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
