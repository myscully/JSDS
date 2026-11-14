/* Notification Center(2026-11-14 사람의 결정: 벨 아래 팝오버 · 누른 항목 + 모두 읽음 · 새 알림 화면 갱신은 시스템 · 탭 전체/안 읽음 · 누르면 관련 화면 · 이전 알림 보기 · 심각도 Tag · 항목 동작 없음) — behave.js 가 부른다.
   열고 닫기 · 포커스 · 읽음과 안 읽은 수 · 탭 거르기 · 모두 읽음 · 이전 알림 불러오기와 실패 · 새 알림 · 99+ · 좁은 화면 자리 · 모양 */
module.exports = async function notify({ page, ok, go }) {
  /* 한 부분이 던져도(예: 패널이 잘려 클릭이 닿지 않음) 그 부분의 실패로 남기고 다음으로 — 던진 채 두면 behave 전체가 멈춰 뒤의 검사가 돌지 않는다. 기다림도 5초로 줄인다 */
  const step = async (title, fn) => { try { await fn(); } catch (e) { ok(`notification center: ${title} — threw before its assertion`, false, String(e && e.message || e).split("\n")[0]); await page.keyboard.press("Escape").catch(() => {}); } };
  page.setDefaultTimeout(5000);
  try {
  const wait = (ms) => page.waitForTimeout(ms);
  const theme = (t) => page.evaluate((t) => t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"), t);
  const tok = (v, p = "backgroundColor") => page.evaluate(([v, p]) => { const d = document.createElement("div"); d.style[p] = `var(${v})`; document.body.append(d); const c = getComputedStyle(d)[p]; d.remove(); return c; }, [v, p]);
  const ex = (id) => `#ex-notification-center-${id} .example-preview`;
  const bell = (id) => page.locator(`${ex(id)} .notify [aria-haspopup=dialog]`);
  const top = (id) => page.evaluate((sel) => { document.querySelector(sel).scrollIntoView({ block: "start", behavior: "instant" }); window.scrollBy({ top: -80, behavior: "instant" }); }, ex(id));   // 예제를 화면 위로 — 미리보기 안에서는 패널이 화면 기준으로 떠서, 아래쪽이면 화면 밖에 열리고 스크롤에 닫힌다
  const events = (id = "nc1") => page.evaluate((id) => { const out = (window.__nf || []).filter((e) => e[2] === id).map((e) => e.slice(0, 2)); window.__nf = []; return out; }, id);   // 예제마다 — 열린 채 시작한 다른 예제가 바깥 클릭으로 닫힌 것은 세지 않는다
  const live = () => page.evaluate(() => { const l = document.querySelector("body > .ds-live"); return l ? l.textContent : null; });
  const state = (id) => page.evaluate((sel) => {
    const h = document.querySelector(`${sel} .notify`), t = h.querySelector("[aria-haspopup=dialog]"), p = h.querySelector(".notify-panel"), c = h.querySelector(".with-count > .count"), tc = h.querySelector(".tab[data-filter=unread] .count");
    return { open: !p.hidden, exp: t.getAttribute("aria-expanded"), ctl: t.getAttribute("aria-controls") === p.id, name: t.getAttribute("aria-label"), tip: t.parentNode.querySelector(".tooltip").textContent,
      count: c && !c.hidden ? c.textContent : null, tab: tc && !tc.hidden ? tc.textContent : null, readAll: h.querySelector(".notify-read-all").getAttribute("aria-disabled"),
      unread: [...h.querySelectorAll(".notify-item.unread")].map((li) => li.dataset.id), sr: [...h.querySelectorAll(".notify-item")].map((li) => li.querySelector(".notify-link > .sr-only").textContent) };
  }, ex(id));
  await go("components/notification-center.html");
  await page.evaluate(() => { window.__nf = []; for (const n of ["ds:notify-read", "ds:notify-more", "ds:notify-open"]) document.addEventListener(n, (e) => window.__nf.push([n, { ...e.detail, resolve: undefined, reject: undefined }, e.target.querySelector(".notify-panel")?.id])); });

  /* 처음 상태 — 열린 예제는 aria-expanded · aria-controls, 안 읽은 수가 배지 · 접근 이름 · Tooltip · 탭 배지에 같이, 안 읽은 항목만 숨긴 ', 안 읽음'. 빈 예제는 배지 없음 · 모두 읽음 꺼짐 */
  await step("initial state", async () => {
    const s0 = await state("default"), e0 = await state("empty");
    ok("notification center: the open example wires the bell to the dialog and shows the unread count on the badge, name, Tooltip and tab; only unread items say so; the empty one has no badge and read-all is off",
      s0.open && s0.exp === "true" && s0.ctl && s0.count === "4" && s0.name === "알림 4건" && s0.tip === "알림 4건" && s0.tab === "4" && s0.readAll === null && s0.unread.join() === "n1,n2,n3,n5" &&
      s0.sr.join("|") === ", 안 읽음|, 안 읽음|, 안 읽음||, 안 읽음" && e0.count === null && e0.tab === null && e0.readAll === "true" && e0.name === "알림", JSON.stringify({ s0, e0 }));
  });

  /* 모양 — 폭 380 · 벨 아래 8 · 오른쪽 맞춤, 항목 padding 12/20 · 글자 14/20(안 읽음 600 · 읽음 400) · 점 8(안 읽음 제품 색 · 읽음 투명) · 보조와 시각 12/16 secondary · hover tertiary, 라이트 · 다크 */
  for (const th of ["light", "dark"]) {   // 테마마다 한 부분 — 던져도 단정 수가 그대로
    await step(`look ${th}`, async () => {
      await theme(th === "dark" ? "dark" : null); await wait(50);
      const want = { brand: await tok("--surface-brand-primary"), sec: await tok("--foreground-neutral-secondary", "color"), hov: await tok("--surface-neutral-tertiary") };
      const look = await page.evaluate((sel) => {
        const h = document.querySelector(`${sel} .notify`), p = h.querySelector(".notify-panel"), t = h.querySelector("[aria-haspopup=dialog]").getBoundingClientRect(), r = p.getBoundingClientRect();
        const it = (id) => h.querySelector(`.notify-item[data-id="${id}"]`), cs = (el) => getComputedStyle(el), ln = cs(it("n1").querySelector(".notify-link")), tx = cs(it("n1").querySelector(".notify-text"));
        return { w: Math.round(r.width), gap: Math.round(r.top - t.bottom), right: Math.round(r.right - t.right), pad: `${parseFloat(ln.paddingTop)}/${parseFloat(ln.paddingLeft)}`, text: `${parseFloat(tx.fontSize)}/${parseFloat(tx.lineHeight)}`,
          wUnread: tx.fontWeight, wRead: cs(it("n4").querySelector(".notify-text")).fontWeight, dot: it("n1").querySelector(".notify-dot").getBoundingClientRect().width, dotOn: cs(it("n1").querySelector(".notify-dot")).backgroundColor, dotOff: cs(it("n4").querySelector(".notify-dot")).backgroundColor,
          sub: [cs(it("n1").querySelector(".notify-sub")), cs(it("n1").querySelector(".notify-time"))].map((c) => `${parseFloat(c.fontSize)}/${parseFloat(c.lineHeight)} ${c.color}`) };
      }, ex("default"));
      await page.locator(`${ex("default")} .notify-item[data-id="n4"] .notify-link`).hover(); await wait(200);
      const hov = await page.evaluate((sel) => getComputedStyle(document.querySelector(`${sel} .notify-item[data-id="n4"] .notify-link`)).backgroundColor, ex("default"));
      await page.mouse.move(0, 0);
      ok(`notification center ${th}: panel 380 wide, 8 below the bell, right-aligned; items padded 12/20 with 14/20 text, unread 600 with a brand dot, read 400 with an empty dot; meta 12/16 secondary; hover tertiary`,
        look.w === 380 && look.gap === 8 && look.right === 0 && look.pad === "12/20" && look.text === "14/20" && look.wUnread === "600" && look.wRead === "400" && look.dot === 8 && look.dotOn === want.brand && look.dotOff === "rgba(0, 0, 0, 0)" &&
        look.sub.every((x) => x === `12/16 ${want.sec}`) && hov === want.hov, JSON.stringify({ look, hov, want }));
    });
  }
  await theme(null);

  await top("default"); await wait(100);
  /* 열고 닫기 — 벨이 토글, 열면 패널로 포커스, Esc 는 닫고 벨로, 바깥을 누르면 닫음(포커스는 그대로), Tab 으로 떠나면 닫음 */
  await step("open and close", async () => {
    await events();
    await bell("default").click(); await wait(50); const c1 = await state("default");
    await bell("default").click(); await wait(50); const f1 = await page.evaluate(() => document.activeElement.className);
    const vis = await page.evaluate((sel) => {   // 미리보기(넘침을 자름) 안 — 화면 기준으로 떠서 네 모서리가 다 보인다. 이것이 깨지면 뒤의 항목 클릭이 닿지 않는다
      const h = document.querySelector(`${sel} .notify`), p = h.querySelector(".notify-panel"), r = p.getBoundingClientRect();
      return { float: h.classList.contains("float"), pos: getComputedStyle(p).position, seen: [[r.left + 4, r.top + 4], [r.right - 4, r.top + 4], [r.left + 4, r.bottom - 4], [r.right - 4, r.bottom - 4]].every(([x, y]) => p.contains(document.elementFromPoint(x, y))) };
    }, ex("default"));
    await page.keyboard.press("Escape"); await wait(50); const c2 = await state("default"), f2 = await page.evaluate(() => document.activeElement.getAttribute("aria-haspopup"));
    await bell("default").click(); await wait(50);
    await page.mouse.click(5, 300); await wait(50); const c3 = await state("default");
    await bell("default").click(); await wait(50);
    await page.locator(`${ex("default")} .notify-more .btn`).focus(); await page.keyboard.press("Tab"); await wait(50); const c4 = await state("default");
    const ev1 = (await events()).filter((e) => e[0] === "ds:notify-open").map((e) => e[1].open);
    ok("notification center: the bell toggles, opening focuses the panel (floated and fully visible in the clipped preview), Esc closes back to the bell, an outside click and tabbing away both close; ds:notify-open reports each",
      !c1.open && c1.exp === "false" && f1.includes("notify-panel") && vis.float && vis.pos === "fixed" && vis.seen && !c2.open && f2 === "dialog" && !c3.open && !c4.open && ev1.join() === "false,true,false,true,false,true,false", JSON.stringify({ c1, f1, vis, c2, f2, c3, c4, ev1 }));
  });

  /* 읽음 — 갈 화면이 없는 항목(버튼)은 읽음만 되고 열린 채, 링크 항목은 읽음이 되고 닫힘. 둘 다 ds:notify-read {ids, all:false} 하나, 이미 읽은 것은 이벤트 없음 */
  await step("read", async () => {
    await top("default"); await wait(100); await bell("default").click(); await wait(50);
    await page.locator(`${ex("default")} .notify-item[data-id="n5"] .notify-link`).click(); await wait(50);
    const r1 = await state("default"), rf = await page.evaluate(() => document.activeElement.closest(".notify-item")?.dataset.id);
    await page.locator(`${ex("default")} .notify-item[data-id="n4"] .notify-link`).click(); await wait(80);   // 이미 읽은 링크 — 이벤트 없이 닫힘
    const r15 = await state("default");
    await top("default"); await wait(100); await bell("default").click(); await wait(50);
    await page.locator(`${ex("default")} .notify-item[data-id="n1"] .notify-link`).click(); await wait(80);
    const r2 = await state("default"), ev2 = (await events()).filter((e) => e[0] === "ds:notify-read").map((e) => e[1]);
    ok("notification center: a no-link item only marks itself read and stays open with focus kept; a link item marks read and closes; one ds:notify-read each, none for an item already read",
      r1.open && r1.count === "3" && r1.name === "알림 3건" && !r1.unread.includes("n5") && r1.sr[4] === "" && r1.sr[0] === ", 안 읽음" && rf === "n5" && !r15.open && r15.count === "3" && !r2.open && r2.count === "2" && r2.unread.join() === "n2,n3" &&
      JSON.stringify(ev2) === JSON.stringify([{ ids: ["n5"], all: false }, { ids: ["n1"], all: false }]), JSON.stringify({ r1, rf, r2, ev2 }));
  });

  /* 탭 — 안 읽음은 읽은 항목과 빈 묶음을 숨김, 모두 읽음은 한꺼번에(ds:notify-read all:true) · 배지와 이름을 비우고 버튼을 끄며 빈 문구 · 알림. 꺼진 버튼은 다시 내지 않음 */
  await step("tabs", async () => {
    await top("default"); await wait(100); await bell("default").click(); await wait(50);
    await page.locator(`${ex("default")} .tab[data-filter=unread]`).click(); await wait(50);
    const tf = await page.evaluate((sel) => { const h = document.querySelector(`${sel} .notify`); return { shown: [...h.querySelectorAll(".notify-item:not([hidden])")].map((li) => li.dataset.id), groups: [...h.querySelectorAll(".notify-group")].map((g) => g.hidden), empty: h.querySelector(".notify-empty").hidden }; }, ex("default"));
    await page.locator(`${ex("default")} .notify-read-all`).click(); await wait(120);
    const ra = await state("default"), raLive = await live(), raEmpty = await page.evaluate((sel) => { const e = document.querySelector(`${sel} .notify-empty`); return e.hidden ? null : e.textContent; }, ex("default"));
    await page.locator(`${ex("default")} .notify-read-all`).click({ force: true }); await wait(50);   // 꺼진 버튼(aria-disabled)도 누를 수는 있다 — 이벤트가 다시 나지 않아야 한다
    const ev3 = (await events()).filter((e) => e[0] === "ds:notify-read").map((e) => e[1]);
    await page.locator(`${ex("default")} .tab[data-filter=all]`).click(); await wait(50);
    const back = await page.evaluate((sel) => document.querySelectorAll(`${sel} .notify-item:not([hidden])`).length, ex("default"));
    ok("notification center: the unread tab hides read items and empty groups; read-all marks everything at once, clears the badge, name and tab count, turns itself off, shows the empty note and announces; the all tab brings items back",
      tf.shown.join() === "n2,n3" && tf.groups.join() === "false,true" && tf.empty && ra.count === null && ra.tab === null && ra.name === "알림" && ra.tip === "알림" && ra.readAll === "true" && ra.unread.length === 0 && ra.sr.every((x) => x === "") &&
      raEmpty === "안 읽은 알림이 없습니다." && raLive === "모든 알림을 읽음으로 표시했습니다." && JSON.stringify(ev3) === JSON.stringify([{ ids: ["n2", "n3"], all: true }]) && back === 5, JSON.stringify({ tf, ra, raLive, raEmpty, ev3, back }));
  });

  /* 이전 알림 — 누르면 스피너 · aria-busy, 응답이 오면 끝의 '이전' 묶음에 붙이고 끝이면 버튼을 없애며 새 첫 항목으로 포커스 · 알림 */
  await step("older alerts", async () => {
    const more = page.locator(`${ex("default")} .notify-more .btn`);
    await more.click(); await wait(50);
    const busy = await more.evaluate((b) => ({ loading: b.classList.contains("loading"), busy: b.getAttribute("aria-busy") }));
    await wait(1000);
    const m1 = await page.evaluate((sel) => { const h = document.querySelector(`${sel} .notify`); const gs = [...h.querySelectorAll(".notify-group")]; return { groups: gs.map((g) => g.querySelector(".notify-day").textContent), last: [...gs.at(-1).querySelectorAll(".notify-item")].map((li) => li.dataset.id), btn: !!h.querySelector(".notify-more"), focus: document.activeElement.closest(".notify-item")?.dataset.id, tag: gs.at(-1).querySelector(".tag")?.className }; }, ex("default"));
    const mLive = await live(), ev4 = (await events()).filter((e) => e[0] === "ds:notify-more").length;
    ok("notification center: older alerts — spinner and aria-busy while loading, then appended under a new trailing group, the button removed when done, focus on the first new item, announced",
      busy.loading && busy.busy === "true" && ev4 === 1 && m1.groups.join() === "오늘,어제,이전" && m1.last.join() === "old-1,old-2" && !m1.btn && m1.focus === "old-1" && m1.tag === "tag sm low" && mLive === "알림 2건을 더 불러왔습니다.", JSON.stringify({ busy, m1, mLive, ev4 }));
  });

  /* 실패 — 버튼 위 문구(role=status) · '다시 시도', 다시 누르면 문구를 지우고 성공 */
  await step("failed load", async () => {
    await top("load-failed"); await wait(100);
    const fb = page.locator(`${ex("load-failed")} .notify-more .btn`);
    if ((await bell("load-failed").getAttribute("aria-expanded")) !== "true") { await bell("load-failed").click(); await wait(50); }
    await fb.click(); await wait(1000);
    const fl = await page.evaluate((sel) => { const b = document.querySelector(`${sel} .notify-more`); const m = b.querySelector(".msg"); return { msg: m.textContent, role: m.getAttribute("role"), btn: b.querySelector(".btn").textContent, loading: b.querySelector(".btn").classList.contains("loading") }; }, ex("load-failed"));
    await fb.click(); await wait(1000);
    const fl2 = await page.evaluate((sel) => ({ more: !!document.querySelector(`${sel} .notify-more`), n: document.querySelectorAll(`${sel} .notify-item`).length }), ex("load-failed"));
    ok("notification center: a failed load says so above the button (role=status) and turns it into retry; retrying loads and removes it",
      fl.msg === "알림을 불러오지 못했습니다." && fl.role === "status" && fl.btn === "다시 시도" && !fl.loading && !fl2.more && fl2.n === 4, JSON.stringify({ fl, fl2 }));
  });

  /* 새 알림 — DS.notify.add 는 맨 위 '오늘' 묶음(없으면 새로)에 넣고 수를 늘리며 알림. 여럿이면 한 번에 'n건', 100건을 넘으면 99+ */
  await step("new alerts", async () => {
    const n0 = await state("live");
    await page.locator(`${ex("live")} [data-demo-notify]`).click(); await wait(120);
    const n1 = await state("live"), nLive = await live();
    const nOrder = await page.evaluate((sel) => { const h = document.querySelector(`${sel} .notify`); return [...h.querySelectorAll(".notify-group")].map((g) => `${g.querySelector(".notify-day").textContent}:${[...g.querySelectorAll(".notify-item")].map((li) => li.dataset.id).join("+")}`); }, ex("live"));
    await page.evaluate((sel) => window.DS.notify.add(document.querySelector(`${sel} .notify`), [{ id: "a", title: "가" }, { id: "b", title: "나" }]), ex("live")); await wait(120);
    const n2 = await state("live"), nLive2 = await live();
    const n2Order = await page.evaluate((sel) => [...document.querySelector(`${sel} .notify-group`).querySelectorAll(".notify-item")].map((li) => li.dataset.id), ex("live"));
    await page.evaluate((sel) => window.DS.notify.add(document.querySelector(`${sel} .notify`), Array.from({ length: 100 }, (_, i) => ({ id: "x" + i, title: "대량 " + i }))), ex("live")); await wait(80);
    const n3 = await state("live");
    ok("notification center: a new alert goes on top under a new today group, raises the badge and is announced; several at once keep their order and are announced once; past 99 the badge reads 99+",
      n0.count === "1" && !n0.open && n1.count === "2" && n1.name === "알림 2건" && n1.sr[0] === ", 안 읽음" && nLive === "새 알림: 관리자 계정 로그인이 5회 실패했습니다" && nOrder.join() === "오늘:live-1,어제:n4+n5" &&
      n2.count === "4" && nLive2 === "새 알림 2건" && n2Order.join() === "a,b,live-1" && n3.count === "99+" && n3.tab === "99+", JSON.stringify({ n0, n1, nLive, nOrder, n2, nLive2, n2Order, n3: n3.count }));
  });

  /* 긴 목록 — 미리보기(넘침을 자름) 안에서는 화면 기준(fixed)으로 떠서 잘리지 않고, 목록은 본문 안에서 스크롤하며 본문 스크롤로는 닫히지 않는다 */
  await step("long list", async () => {
    await top("live"); await wait(100);
    if ((await bell("live").getAttribute("aria-expanded")) !== "true") { await bell("live").click(); await wait(80); }
    const lg = await page.evaluate((sel) => {
      const h = document.querySelector(`${sel} .notify`), p = h.querySelector(".notify-panel"), b = h.querySelector(".notify-body"), r = p.getBoundingClientRect();
      const pts = [[r.left + 4, r.top + 4], [r.right - 4, r.top + 4], [r.left + 4, r.bottom - 4], [r.right - 4, r.bottom - 4]];
      const seen = pts.every(([x, y]) => p.contains(document.elementFromPoint(x, y)));
      return { float: h.classList.contains("float"), pos: getComputedStyle(p).position, h: Math.round(r.height), over: b.scrollHeight > b.clientHeight + 100, oy: getComputedStyle(b).overflowY, seen };
    }, ex("live"));
    await page.evaluate((sel) => { const b = document.querySelector(`${sel} .notify-body`); b.scrollTop = 400; b.dispatchEvent(new Event("scroll")); }, ex("live")); await wait(80);
    const lg2 = await page.evaluate((sel) => ({ open: !document.querySelector(`${sel} .notify-panel`).hidden, top: document.querySelector(`${sel} .notify-body`).scrollTop }), ex("live"));
    await page.keyboard.press("Escape"); await wait(50);
    ok("notification center: a long list scrolls inside the body; in the clipped preview the panel floats (fixed) and stays fully visible; scrolling the body does not close it",
      lg.float && lg.pos === "fixed" && lg.h <= 560 && lg.over && lg.oy === "auto" && lg.seen && lg2.open && lg2.top > 0, JSON.stringify({ lg, lg2 }));
  });

  /* 좁은 화면 — 오른쪽 맞춤이 화면 왼쪽을 넘으면 밀어서 8 안쪽, 오른쪽도 화면 안 */
  await step("narrow screen", async () => {
    await page.setViewportSize({ width: 390, height: 844 }); await wait(200);
    await page.reload(); await wait(300);   // 처음부터 열린 패널은 띄우지 않고 넘침을 자르는 미리보기 안에 맞춘다(좁히고 밂)
    const fitIn = () => page.evaluate((sel) => { const pv = document.querySelector(sel).getBoundingClientRect(), p = document.querySelector(`${sel} .notify-panel`), r = p.getBoundingClientRect(); return { open: !p.hidden, float: p.closest(".notify").classList.contains("float"), l: Math.round(r.left - pv.left), r: Math.round(pv.right - r.right), w: Math.round(r.width) }; }, ex("default"));
    const init390 = await fitIn();
    await page.setViewportSize({ width: 1440, height: 900 }); await wait(200);
    const init1440 = await fitIn();   // 창을 넓히면 다시 맞춘다 — 좁힘 · 밂을 풀어 380
    await page.setViewportSize({ width: 390, height: 844 }); await wait(200);
    await bell("empty").scrollIntoViewIfNeeded(); if ((await bell("empty").getAttribute("aria-expanded")) === "true") { await bell("empty").click(); await wait(50); } await bell("empty").click(); await wait(80);
    const nar = await page.evaluate((sel) => { const r = document.querySelector(`${sel} .notify-panel`).getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width), vw: innerWidth }; }, ex("empty"));
    await page.keyboard.press("Escape"); await wait(50);
    const probe = await page.evaluate(async (sel) => {   // 넘침을 자르지 않는 자리(body 바로 아래, 화면 왼쪽 가까이) — 화면 기준 띄움이 아니라 밀기 경로
      const src = document.querySelector(`${sel} .notify`), h = src.cloneNode(true);
      h.querySelector(".notify-panel").id = "nc-probe"; h.querySelector(".notify-title").id = "nc-probe-t"; h.querySelector(".notify-panel").setAttribute("aria-labelledby", "nc-probe-t");
      h.classList.remove("open"); h.querySelector(".notify-panel").hidden = true;
      h.style.cssText = "position:fixed;left:16px;top:80px;z-index:50"; h.querySelector("[aria-haspopup=dialog]").setAttribute("aria-controls", "nc-probe"); document.body.appendChild(h); window.DS.notify.sync(h);
      h.querySelector("[aria-haspopup=dialog]").click(); await new Promise((r) => setTimeout(r, 80));
      const p = h.querySelector(".notify-panel"), r = p.getBoundingClientRect();
      const out = { float: h.classList.contains("float"), dx: parseFloat(p.style.getPropertyValue("--nf-dx")) || 0, l: Math.round(r.left), r: Math.round(r.right), vw: innerWidth, open: !p.hidden };
      h.remove(); return out;
    }, ex("empty"));
    await page.setViewportSize({ width: 1440, height: 900 }); await wait(200);
    ok("notification center at 390: the panel stays on screen — at least 8 from the left edge and inside the right edge, narrowed to the screen; one open from the start stays unfloated inside the clipped preview and widens back to 380 when the window grows",
      nar.l >= 8 && nar.r <= nar.vw && nar.w <= nar.vw - 16 && init390.open && !init390.float && init390.l >= 8 && init390.r >= 0 && init1440.open && init1440.w === 380 && probe.open && !probe.float && probe.dx > 0 && probe.l >= 8 && probe.r <= probe.vw, JSON.stringify({ nar, init390, init1440, probe }));
  });
  } finally { page.setDefaultTimeout(30000); }
};
