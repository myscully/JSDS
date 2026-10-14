// 사이트 프리뷰 동작 검증 (assets/ds.js): 빌드 후 `node behave.js` — 드롭다운·탭·달력·표 정렬 등 290 케이스를 실제 클릭으로 확인, 스크린샷은 .behave/
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
        accent: g("--accent-surface"), accentText: g("--accent-text"), focus: g("--focus-ring"), subtle: g("--accent-fill"),
        ramp: [600, 300, 100].map((k) => g("--accent-" + k)).join(" "),
      };
    });
  };
  const teal = await accent("product-a"), red = await accent("product-b");
  // 면은 제품 메인 컬러 그대로지만, text 변형의 라벨은 --accent-text 를 따른다 —
  // 청록은 '밝은 제품'이라 라이트에서 800 단계(#00636A)로 내려간다. 600 으로 쓰면 패널 위에서 2.58 이었다
  ok("teal product keeps its main colour", !teal.neutral && teal.bg === "rgb(0, 170, 182)" && teal.accent === "#00AAB6"
    && teal.accentText === "#00636A" && teal.text === "rgb(0, 99, 106)", JSON.stringify(teal));
  ok("red product turns the whole accent ramp neutral",
    red.neutral && red.bg === "rgb(27, 28, 30)" && red.text === "rgb(27, 28, 30)"
    && red.accent === "#1B1C1E" && red.focus === "#70737C"
    && red.ramp === "#5A5C63 #AEB0B6 #EAEBEC", JSON.stringify(red));   /* NEUTRAL_RAMP 가 slate 에서 --neutral-* 값으로 바뀌었다 */
  // 다크는 메인·hover·pressed·글자색을 라이트와 그대로 공유한다(같은 600 단계) — 다른 것은 텍스트·선택 배경·지표·반전·포커스뿐이다
  const readTokens = () => page.evaluate(() => {
    const r = getComputedStyle(document.documentElement); const g = (n) => r.getPropertyValue(n).trim();
    const res = (t) => { const d = document.createElement("div"); d.style.color = t; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; };
    const pb = document.querySelector("#ex-button-variant .btn.primary"); const c = pb ? getComputedStyle(pb) : null;
    return {
      accent: g("--accent-surface"), hover: g("--accent-surface-hover"), pressed: g("--accent-surface-pressed"), on: g("--accent-on"),
      text: g("--accent-text"), subtle: g("--accent-fill"), graphic: g("--accent-graphic"), focus: g("--focus-ring"), prod600: g("--prod-600"),
      light: document.documentElement.hasAttribute("data-accent-light"), neutral: document.documentElement.hasAttribute("data-accent-neutral"),
      bg: c ? c.backgroundColor : "", fg: c ? c.color : "",
      accentRgb: res("var(--accent-surface)"), hoverRgb: res("var(--accent-surface-hover)"), pressedRgb: res("var(--accent-surface-pressed)"), onRgb: res("var(--accent-on)"),
      textRgb: res("var(--accent-text)"), subtleRgb: res("var(--accent-fill)"), graphicRgb: res("var(--accent-graphic)"),
      focusRgb: res("var(--focus-ring)"), invRgb: res("var(--accent-text-inverse)"), bgInverse: res("var(--surface-inverse)"),
      canvas: res("var(--surface-base)"), surface: res("var(--surface-raised)"), panel: res("var(--surface-sunken)"),
      ramp: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((k) => g("--accent-" + k)).join(" "),
      neuRamp: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((k) => g("--neutral-" + k)).join(" "),
    };
  });
  const goDark = async () => { await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark")); await page.waitForTimeout(250); return readTokens(); };
  const unDark = async () => { await page.evaluate(() => document.documentElement.removeAttribute("data-theme")); await page.waitForTimeout(150); };
  const cases = [];
  for (const [name, key] of [["base", ""], ["product", "product-a"], ["clashing", "product-b"]]) {
    await unDark(); await accent(key);
    const L = await readTokens(); const D = await goDark(); await unDark();
    cases.push([name, L, D]);
  }
  for (const [n, L, D] of cases) {
    if (n === "clashing") {
      // 중립 전환만 테마별로 갈린다 — 라이트는 짙은 쪽(900), 다크는 밝은 쪽(100). 중립 600 은 다크 캔버스 위에서 2.0 이라 주인공이 될 수 없다
      ok("dark neutral switch flips to the light end of the ramp",
        D.accent === "#EAEBEC" && D.hover === "#C2C4C8" && D.pressed === "#AEB0B6" && L.accent === "#1B1C1E", JSON.stringify([L.accent, D.accent, D.hover, D.pressed]));
      // 램프가 slate 하드코딩이 아니라 다크 바탕과 같은 계열이어야 한다 — 종전에는 #94A3B8 가 주변 #989BA2 와 어긋났다
      ok("dark neutral switch uses the product neutral ramp, not slate", D.ramp === D.neuRamp, `${D.ramp} | ${D.neuRamp}`);
    } else {
      /* 기준 단계만 한 단계 다르다 — 라이트 600 · 다크 500. hover·pressed 는 기준에서 글자색 반대 방향으로 간다:
         흰 글자(기본)는 짙은 쪽, 어두운 글자(밝은 제품)는 밝은 쪽. 램프 인덱스로 보면 0=50 … 5=500, 6=600, 7=700 */
      const step = (t, i) => t.ramp.split(" ")[i];
      const bright = n === "product";
      const want = {
        light: [step(L, 6), step(L, bright ? 5 : 7), step(L, bright ? 4 : 8)],
        dark: [step(D, 5), step(D, bright ? 4 : 6), step(D, bright ? 3 : 7)],
      };
      ok(`the ${n} colour follows the base-step rule in both themes`,
        L.accent === want.light[0] && L.hover === want.light[1] && L.pressed === want.light[2]
        && D.accent === want.dark[0] && D.hover === want.dark[1] && D.pressed === want.dark[2] && D.on === L.on,
        JSON.stringify({ light: [L.accent, L.hover, L.pressed], dark: [D.accent, D.hover, D.pressed], want }));
    }
    // 밝은 제품은 글자가 어둡고 상태가 밝은 쪽으로 간다 — 짙어지는 쪽으로 보내면 4.05·2.55 로 깨진다
    ok(`the ${n} colour sets data-accent-light correctly`, L.light === (n === "product") && D.light === (n === "product"), `${L.light} · ${D.light}`);
    for (const [theme, t] of [["light", L], ["dark", D]]) {
      for (const [st, fill] of [["rest", t.accentRgb], ["hover", t.hoverRgb], ["pressed", t.pressedRgb]])
        ok(`${theme} ${n} Primary ${st} clears AA`, ratio(fill, t.onRgb) >= 4.5, `${ratio(fill, t.onRgb)} · ${fill} / ${t.onRgb}`);
    }
    // 글자로 보정할 수 없는 자리 — 지표·포커스 링은 3:1, 패널 위 텍스트는 4.5
    ok(`dark ${n} graphic clears 3:1 on every surface`,
      Math.min(ratio(D.graphicRgb, D.canvas), ratio(D.graphicRgb, D.surface), ratio(D.graphicRgb, D.panel)) >= 3,
      `${ratio(D.graphicRgb, D.canvas)} · ${ratio(D.graphicRgb, D.surface)} · ${ratio(D.graphicRgb, D.panel)}`);
    ok(`dark ${n} focus ring clears 3:1`, ratio(D.focusRgb, D.canvas) >= 3, `${ratio(D.focusRgb, D.canvas)}`);
    ok(`dark ${n} accent text clears AA on the panel`, ratio(D.textRgb, D.panel) >= 4.5, `${ratio(D.textRgb, D.panel)}`);
    /* 선택 배경은 제품 색조에 중립 리프트를 섞은 알파 면이다 — 색조만 얹으면 다크 캔버스에서 1.11 로 사라진다.
       알파를 살려 캔버스 위에 합성해서 재야 한다(원문 값으로 재면 color-mix 문자열이 그대로 들어와 뜻 없는 숫자가 나온다) */
    ok(`dark ${n} selected background stays visible on the canvas`,
      ratio(D.subtleRgb, D.canvas, D.canvas) >= 1.35, `${ratio(D.subtleRgb, D.canvas, D.canvas)} · ${D.subtleRgb}`);
    // 다크의 반전 표면은 밝다 — 그 위의 Primary 는 800 단계여야 묻히지 않는다
    ok(`dark ${n} inverse-surface Primary clears AA`, ratio(D.invRgb, D.bgInverse) >= 4.5, `${ratio(D.invRgb, D.bgInverse)} · ${D.invRgb} / ${D.bgInverse}`);
  }
  // 라이트는 기본·중립 전환이 그대로여야 한다(제품 A·C 만 글자색이 어두운 쪽으로 바뀐다)
  ok("light base and clashing keep a white accent-on",
    cases[0][1].onRgb === "rgb(255, 255, 255)" && cases[2][1].onRgb === "rgb(255, 255, 255)", `${cases[0][1].onRgb} · ${cases[2][1].onRgb}`);
  ok("light bright product takes a dark accent-on", cases[1][1].onRgb === "rgb(23, 23, 25)", cases[1][1].onRgb);
  await accent("product-a");
  // 라이트로 돌아오면 제품색이 살아 있어야 한다
  const backLight = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent-surface").trim());
  ok("light keeps the product colour", backLight === "#00AAB6", backLight);
  await accent("product-b");   // 뒤 케이스(Atomic 램프)가 중립 전환 상태를 전제한다 — 원복해 둔다

  // Atomic 의 Accent 램프도 함께 회색 — 제품 컬러에서 파생되는 것은 전부 따라온다
  await go("foundations/colors.html");
  const ramp = await page.evaluate(() => {
    const at = document.querySelectorAll('[data-token="--accent-600"]');
    return { n: at.length, bg: at.length ? getComputedStyle(at[0]).backgroundColor : "" };
  });
  ok("Atomic Accent ramp follows the neutral switch", ramp.n === 1 && ramp.bg === "rgb(90, 92, 99)", JSON.stringify(ramp));
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
      const solid = document.querySelector("#ex-button-variant .btn.danger:not(.secondary)");
      const outline = document.querySelector("#ex-button-variant .btn.danger.secondary");
      const cs = getComputedStyle(solid), co = getComputedStyle(outline);
      return { sf: cs.color, sb: cs.backgroundColor, of: co.color, obStack: backdrop(outline) };
    });
    const dc = { solid: ratio(col.sf, col.sb), outline: ratio(col.of, bedOf(col.obStack)) };
    ok(`danger button label meets AA (${theme})`, dc.solid >= 4.5 && dc.outline >= 4.5, JSON.stringify(dc));
  }
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
  await page.waitForTimeout(200);
  // 아웃라인 danger 는 .danger.secondary 가 :hover 를 덮어 아무 반응이 없었다
  const od = page.locator("#ex-button-variant .btn.danger.secondary");
  const odBase = await od.evaluate((e) => getComputedStyle(e).backgroundColor);
  await od.hover(); await page.waitForTimeout(200);
  const odHover = await od.evaluate((e) => getComputedStyle(e).backgroundColor);
  await page.mouse.move(0, 0); await page.waitForTimeout(150);
  ok("outline danger reacts to hover", odBase !== odHover, odBase + " → " + odHover);
  // .btn.text 의 pressed — 기본·다크·중립 셋 다 hover 와 달라야 한다(--accent-100 은 중립에서 hover 와 같아졌다)
  const textPress = async (label) => {
    const t = page.locator("#ex-button-variant .btn.text");
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
    for (const v of ["primary", "secondary", "text", "danger"]) {
      const b2 = document.createElement("button");
      b2.type = "button"; b2.className = "btn md " + v + " loading"; b2.textContent = "저장";
      prev.append(b2);
      out[v] = getComputedStyle(b2, "::after").borderTopColor;
      b2.remove();
    }
    return out;
  });
  // text 는 흰 스피너가 투명 바탕에 묻혔다(1.10:1). 라이트에서 primary·danger 가 둘 다 흰 것은 --accent-on·--danger-on 이 같아서 정상
  ok("loading spinner follows the variant", spin.text !== spin.primary && spin.text === spin.secondary, JSON.stringify(spin));
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
  await page.waitForTimeout(250);
  const spinDark = await page.evaluate(() => {
    const prev = document.querySelector("#ex-button-state .example-preview");
    const out = {};
    for (const v of ["primary", "danger"]) {
      const b2 = document.createElement("button");
      b2.type = "button"; b2.className = "btn md " + v + " loading"; b2.textContent = "저장";
      prev.append(b2);
      out[v] = { arc: getComputedStyle(b2, "::after").borderTopColor, fill: getComputedStyle(b2).backgroundColor };
      b2.remove();
    }
    return out;
  });
  // 스피너는 자기 버튼 바탕 위에 있다 — 글자색(--accent-on·--danger-on)이 제품 밝기에 따라 흰/어두움으로 뒤집히므로 색을 박지 않고 대비로 본다
  for (const v of ["primary", "danger"])
    ok(`dark ${v} loading spinner stands out on its own fill`, ratio(spinDark[v].arc, spinDark[v].fill) >= 3, `${ratio(spinDark[v].arc, spinDark[v].fill)} · ${JSON.stringify(spinDark[v])}`);
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
  await page.waitForTimeout(200);
  // 입력과 버튼이 같은 포커스 링을 쓰는지 — 입력만 4px 10% 헤일로였다
  const ringOf = async (url, sel) => {
    await go(url);
    await page.locator(sel).first().evaluate((e) => e.focus());
    await page.keyboard.press("Tab"); await page.keyboard.press("Shift+Tab"); await page.waitForTimeout(200);
    return page.locator(sel).first().evaluate((e) => { const c = getComputedStyle(e); return c.outlineWidth + " " + c.outlineStyle + " " + c.outlineColor; });
  };
  const ringBtn = await ringOf("components/button.html", "#ex-button-variant .btn.primary");
  const ringInput = await ringOf("components/text-field.html", "#ex-text-field-basic input");
  ok("input and button share one focus ring", ringBtn === ringInput && /2px solid/.test(ringBtn), ringBtn + " vs " + ringInput);
  // 입력은 마우스 클릭에도 링이 떠야 한다(버튼은 아니어야 한다)
  await page.locator("#ex-text-field-basic input").first().click(); await page.waitForTimeout(200);
  const clickRing = await page.evaluate(() => { const i = document.querySelector("#ex-text-field-basic input"); return { fv: i.matches(":focus-visible"), outline: getComputedStyle(i).outlineStyle }; });
  ok("input keeps its ring on mouse click", clickRing.fv && clickRing.outline === "solid", JSON.stringify(clickRing));
  await go("components/button.html");
  const lgIcon = await page.evaluate(() => {
    const b2 = document.querySelector("#ex-button-icon .btn.icon.lg");
    if (!b2) return { 없음: true };
    const r = b2.getBoundingClientRect(), svg = b2.querySelector("svg").getBoundingClientRect();
    return { 버튼: Math.round(r.width) + "x" + Math.round(r.height), 아이콘: Math.round(svg.width) };
  });
  ok("lg icon button renders at 52 with a 20px icon", lgIcon.버튼 === "52x52" && lgIcon.아이콘 === 20, JSON.stringify(lgIcon));
  // 링크는 disabled 속성을 못 가진다 — React as="a" + disabled 는 aria-disabled 로만 나왔고 CSS·JS 가 그걸 몰랐다
  await page.evaluate(() => {
    const prev = document.querySelector("#ex-button-state .example-preview");
    prev.insertAdjacentHTML("beforeend", '<a href="#dead" id="dis-link" class="btn md primary" aria-disabled="true">비활성 링크</a>');
    window.__navHit = 0;
    document.getElementById("dis-link").addEventListener("click", () => window.__navHit++);
  });
  const disLink = await page.evaluate(() => {
    const e = document.getElementById("dis-link"); const c = getComputedStyle(e);
    const res = (t) => { const d = document.createElement("div"); d.style.color = t; document.body.append(d); const v = getComputedStyle(d).color; d.remove(); return v; };
    return { opacity: c.opacity, pointerEvents: c.pointerEvents, focusable: e.tabIndex >= 0,
      bg: c.backgroundColor, fg: c.color, wantBg: res("var(--fill-disabled)"), wantFg: res("var(--text-disabled)") };
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
  // text 변형은 다크 패널 위에서 4.08 이었다 — --accent-text 가 한 단계 밝게 잡는다
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
  await page.waitForTimeout(250);
  const textDark = await page.evaluate(() => {
    const e = document.querySelector("#ex-button-variant .btn.text");
    const res = (tok) => { const d = document.createElement("div"); d.style.color = tok; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; };
    return { fg: getComputedStyle(e).color, panel: res("var(--surface-sunken)"), canvas: res("var(--surface-base)") };
  });
  ok("text button meets AA on a dark panel", ratio(textDark.fg, textDark.panel) >= 4.5 && ratio(textDark.fg, textDark.canvas) >= 4.5,
    `panel ${ratio(textDark.fg, textDark.panel)} · canvas ${ratio(textDark.fg, textDark.canvas)}`);
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
  await page.waitForTimeout(200);

  // --accent-text 는 두 테마 모두 봐야 한다 — 밝은 제품은 라이트에서 600 으로 쓰면 패널 위 2.58 이었다
  for (const key of ["", "product-a", "product-b"]) {
    await accent(key);
    for (const [theme, set] of [["light", null], ["dark", "dark"]]) {
      await page.evaluate((t) => { t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"); }, set);
      await page.waitForTimeout(250);
      const at = await page.evaluate(() => {
        const res = (t) => { const d = document.createElement("div"); d.style.color = t; document.body.append(d); const v = getComputedStyle(d).color; d.remove(); return v; };
        return { fg: res("var(--accent-text)"), cv: res("var(--surface-base)"), sf: res("var(--surface-raised)"), pn: res("var(--surface-sunken)") };
      });
      const low = Math.min(ratio(at.fg, at.cv), ratio(at.fg, at.sf), ratio(at.fg, at.pn));
      ok(`${theme} accent-text clears AA on every surface (${key || "base"})`, low >= 4.5, `${low} · ${at.fg}`);
    }
    await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
    await page.waitForTimeout(150);
  }
  await accent("");

  // 상태색 네 가족 — 기준은 라이트 600 · 다크 500, 상태는 글자색 반대 방향, 글자는 -text(700/400)
  const FAM = ["danger", "warning", "success", "info"];
  const statusTokens = () => page.evaluate((fam) => {
    const r = getComputedStyle(document.documentElement); const g = (n) => r.getPropertyValue(n).trim();
    const res = (t) => { const d = document.createElement("div"); d.style.color = t; document.body.append(d); const v = getComputedStyle(d).color; d.remove(); return v; };
    const out = { canvas: res("var(--surface-base)"), surface: res("var(--surface-raised)"), panel: res("var(--surface-sunken)") };
    for (const f of fam) out[f] = {
      base: g("--" + f + "-surface"), hover: g("--" + f + "-surface-hover"), pressed: g("--" + f + "-surface-pressed"), text: g("--" + f + "-text"), on: g("--" + f + "-on"),
      baseRgb: res("var(--" + f + "-surface)"), textRgb: res("var(--" + f + "-text)"), onRgb: res("var(--" + f + "-on)"),
      hoverRgb: res("var(--" + f + "-surface-hover)"), pressedRgb: res("var(--" + f + "-surface-pressed)"),
    };
    return out;
  }, FAM);
  for (const [theme, set] of [["light", null], ["dark", "dark"]]) {
    await page.evaluate((t) => { t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"); }, set);
    await page.waitForTimeout(250);
    const st = await statusTokens();
    for (const f of FAM) {
      const t = st[f];
      // 기준·hover·pressed 가 모두 채워져 있고 세 값이 서로 달라야 한다
      ok(`${theme} ${f} has a full base/hover/pressed set`, t.base && t.hover && t.pressed && new Set([t.base, t.hover, t.pressed]).size === 3,
        JSON.stringify([t.base, t.hover, t.pressed]));
      // -text 는 글자용이라 캔버스·서피스·패널 모두 4.5 를 넘어야 한다. 기준 단계로는 못 넘는 자리다
      const low = Math.min(ratio(t.textRgb, st.canvas), ratio(t.textRgb, st.surface), ratio(t.textRgb, st.panel));
      ok(`${theme} ${f}-text clears AA on every surface`, low >= 4.5,
        `${low} · base 로는 ${Math.min(ratio(t.baseRgb, st.canvas), ratio(t.baseRgb, st.surface), ratio(t.baseRgb, st.panel))}`);
      /* -on 은 네 가족 모두 있다 — 파생 규칙이 '흰색과 중립 950 중 대비가 높은 쪽'을 고르므로 info 도 어두운 글자로 성립한다.
         세 상태 모두 봐야 한다: warning·success·info 는 어두운 글자를 쓰므로 상태가 밝은 쪽으로 가야 하고, 짙은 쪽으로 두면 hover 부터 깨졌다 */
      {
        const sts = [["rest", t.baseRgb], ["hover", t.hoverRgb], ["pressed", t.pressedRgb]];
        const low = Math.min(...sts.map(([, c]) => ratio(t.onRgb, c)));
        ok(`${theme} ${f}-on clears AA in all three states`, low >= 4.5,
          `${sts.map(([k, c]) => k + " " + ratio(t.onRgb, c)).join(" · ")} / ${t.onRgb}`);
      }
    }
  }
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
  await page.waitForTimeout(200);

  // 비활성은 변형과 무관하게 한 가지 회색으로 수렴한다 — fill 은 회색 면, outline 은 면을 비우고 보더만 회색
  const disabledSet = () => page.evaluate(() => {
    const prev = document.querySelector("#ex-button-disabled .example-preview") || document.querySelector("#ex-button-state .example-preview");
    const res = (t) => { const d = document.createElement("div"); d.style.color = t; document.body.append(d); const v = getComputedStyle(d).color; d.remove(); return v; };
    const want = { fill: res("var(--fill-disabled)"), fg: res("var(--text-disabled)") };
    const out = { want, v: {} };
    for (const [n, cls] of [["primary", "primary"], ["tertiary", "tertiary"], ["danger", "danger"], ["secondary", "secondary"], ["danger-outline", "danger secondary"], ["text", "text"]]) {
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
      ["primary", "tertiary", "danger"].every((n) => d.v[n].bg === d.want.fill && d.v[n].fg === d.want.fg && d.v[n].opacity === "1"), JSON.stringify(d));
    ok(`${theme} disabled outline empties the fill and greys the border`,
      ["secondary", "danger-outline"].every((n) => d.v[n].bg === TRANSPARENT && d.v[n].border === d.want.fill && d.v[n].fg === d.want.fg), JSON.stringify(d.v));
    ok(`${theme} disabled text stays transparent`, d.v.text.bg === TRANSPARENT && d.v.text.fg === d.want.fg, JSON.stringify(d.v.text));
  }
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
  await page.waitForTimeout(200);

  // 중립 버튼의 rest·hover·pressed 가 실제로 서로 다른 색이어야 한다 — 라이트 tertiary 는 불투명 면 때문에 hover 가 보이지 않았다
  for (const [theme, set] of [["light", null], ["dark", "dark"]]) {
    await page.evaluate((t) => { t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"); }, set);
    await page.waitForTimeout(250);
    for (const [n, cls] of [["secondary", "secondary"], ["tertiary", "tertiary"], ["text", "text"]]) {
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
  const LVL = ["critical", "high", "medium", "low", "info"];
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
      const mk = (cls) => { const e = document.createElement("span"); e.className = cls; e.textContent = "x"; prev.append(e); const c = getComputedStyle(e); const r = { bg: c.backgroundColor, bgEff: eff(e), fg: c.color }; e.remove(); return r; };
      out.v[l] = { subtle: mk("tag " + l), solid: mk("tag " + l + " solid") };
      /* 심각도는 독립 축이 아니라 상태색 의도 매핑이다 — Critical=danger-strong · High=danger · Medium=warning · Low=info · Info=중립.
         Info 는 중립이라 fill·text 를 테마 토큰에서 받는다(채운 태그만 --muted-* 를 쓴다) */
      const M = { critical: "danger-strong", high: "danger", medium: "warning", low: "info", info: null }[l];
      out.tok[l] = M
        ? { fill: res("var(--" + M + "-graphic)"), text: res("var(--" + M + "-text)"), on: res("var(--" + M + "-on)"), bg: res("var(--" + M + "-fill)"), surface: res("var(--" + M + "-surface)") }
        : { fill: res("var(--muted-graphic)"), text: res("var(--text-tertiary)"), on: res("var(--muted-on)"), bg: res("var(--fill-strong)"), surface: res("var(--muted-surface)") };
    }
    out.panel = res("var(--surface-sunken)"); out.canvas = res("var(--surface-base)"); out.surface = res("var(--surface-raised)");
    return out;
  }, LVL);
  for (const [theme, set] of [["light", null], ["dark", "dark"]]) {
    await page.evaluate((t) => { t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"); }, set);
    await page.waitForTimeout(250);
    const t = await tagSet();
    for (const l of LVL) {
      // 기본형 태그 — 옅은 바탕 위의 글자
      ok(`${theme} ${l} tag label clears AA on its own background`, ratio(t.v[l].subtle.fg, t.v[l].subtle.bgEff) >= 4.5,
        `${ratio(t.v[l].subtle.fg, t.v[l].subtle.bgEff)} · ${t.v[l].subtle.fg} / ${t.v[l].subtle.bgEff}(합성)`);
      // 채운 태그 — 면 위의 글자. info 를 포함해야 '규칙 누락'이 재발하지 않는다(종전엔 회색 패널에 흰 글자로 1.1 이었다)
      ok(`${theme} ${l} solid tag label clears AA on its fill`, ratio(t.v[l].solid.fg, t.v[l].solid.bgEff) >= 4.5,
        `${ratio(t.v[l].solid.fg, t.v[l].solid.bgEff)} · ${t.v[l].solid.fg} / ${t.v[l].solid.bgEff}`);
      // 채운 태그의 면이 자기 면 토큰이어야 한다 — .tag.solid.info 가 없어 --fill-strong 로 떨어지던 것을 잡는다
      ok(`${theme} ${l} solid tag uses its own surface token`, t.v[l].solid.bg === t.tok[l].surface && t.v[l].solid.bg !== t.panel,
        `${t.v[l].solid.bg} · surface ${t.tok[l].surface} · panel ${t.panel}`);
      // -text 는 글자용이라 캔버스·서피스·패널 위에서도 4.5 를 넘어야 한다
      const low = Math.min(ratio(t.tok[l].text, t.canvas), ratio(t.tok[l].text, t.surface), ratio(t.tok[l].text, t.panel));
      ok(`${theme} ${l}-text clears AA on every surface`, low >= 4.5, `${low} · ${t.tok[l].text}`);
    }
    /* Critical 과 High 는 같은 빨강이라 휘도가 유일한 단서다 — 지표에서 ≥1.5.
       다크에서 둘 다 red-400 이라 1.00 이었던 적이 있고, 매핑으로 접을 때도 danger-strong 의 graphic 이
       ±1(red-300)에 머물면 1.30 으로 떨어진다. ±2(red-200)여야 1.74 가 된다 */
    ok(`${theme} critical and high are distinguishable`, t.tok.critical.fill !== t.tok.high.fill && ratio(t.tok.critical.fill, t.tok.high.fill) >= 1.5,
      `${ratio(t.tok.critical.fill, t.tok.high.fill)} · ${t.tok.critical.fill} vs ${t.tok.high.fill}`);
    /* 옅은 태그도 갈려야 한다 — 로그 표를 색으로 훑는 것이 핵심 사용 사례다.
       같은 알파로 접으면 1.04·1.09 로 '지각 가능' 바닥에도 못 미친다 */
    ok(`${theme} critical and high subtle tags differ in background`,
      t.v.critical.subtle.bgEff !== t.v.high.subtle.bgEff && ratio(t.v.critical.subtle.bgEff, t.v.high.subtle.bgEff) >= 1.15,
      `${ratio(t.v.critical.subtle.bgEff, t.v.high.subtle.bgEff)} · ${t.v.critical.subtle.bgEff} vs ${t.v.high.subtle.bgEff}`);
    ok(`${theme} critical and high differ in label too`, t.tok.critical.text !== t.tok.high.text,
      `${t.tok.critical.text} vs ${t.tok.high.text}`);
  }
  await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
  await page.waitForTimeout(200);

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
  const cardType = await page.evaluate(() => {
    const t = getComputedStyle(document.querySelector("#ex-card-basic .card .title"));
    const ct = getComputedStyle(document.querySelector("#ex-card-variant .card.compact .title"));
    return { title: t.fontSize + "/" + t.lineHeight, compact: ct.fontSize + "/" + ct.lineHeight, inline: document.querySelector("#ex-card-variant .card.compact .title").getAttribute("style") };
  });
  // 제목에 line-height 가 없으면 문맥에 따라 25.6·28·26.4 로 흔들렸다
  ok("card title uses Title/1 and compact Title/2", cardType.title === "16px/24px" && cardType.compact === "14px/20px" && !cardType.inline, JSON.stringify(cardType));
  // Radio Button 회귀 — label.radio.card 가 .card 의 column·그림자를 받으면 점이 라벨 위로 간다
  await go("components/radio-button.html");
  const radioCard = await page.evaluate(() => {
    const lbl = document.querySelector(".radio.card");
    const i = lbl.querySelector("input").getBoundingClientRect(), sp = lbl.querySelector("span").getBoundingClientRect();
    return { 세로차: Math.round(Math.abs(sp.top - i.top)), shadow: getComputedStyle(lbl).boxShadow, dir: getComputedStyle(lbl).flexDirection };
  });
  ok("radio card stays a row without card shadow", radioCard.세로차 < 6 && radioCard.shadow === "none" && radioCard.dir === "row", JSON.stringify(radioCard));
  // 카드 안 기간 선택은 패널 없는 tablist 가 아니라 role=group + aria-pressed
  await go("components/card.html");
  const cardSb = page.locator("#ex-card-header .select-btn");
  ok("card header uses a select button group", await cardSb.evaluate((e) => e.getAttribute("role") === "group" && !!e.getAttribute("aria-label") && !e.closest(".card").querySelector("[role=tablist]")));
  await cardSb.locator("button").nth(1).click(); await page.waitForTimeout(150);
  ok("card header select button toggles", await cardSb.evaluate((e) => {
    const b2 = [...e.querySelectorAll("button")];
    return b2[1].getAttribute("aria-pressed") === "true" && b2[0].getAttribute("aria-pressed") === "false";
  }));
  // .flush — 표를 카드 폭까지 채우는 관용구를 변형으로
  await go("patterns/dashboard.html");
  const fl = await page.evaluate(() => {
    const c = document.querySelector(".card.flush");
    if (!c) return { 없음: true };
    return { padding: getComputedStyle(c).padding, headPadding: getComputedStyle(c.querySelector(".card-head")).padding, inline: c.getAttribute("style") };
  });
  ok("flush card has no padding but its head does", fl.padding === "0px" && fl.headPadding === "16px 24px" && !fl.inline, JSON.stringify(fl));
  await go("components/card.html");
  // wrap 이 없으면 액션이 카드 왼쪽으로 넘치고, 시작 방향 넘침은 스크롤로 닿을 수 없다
  const footFit = async () => page.evaluate(() => {
    const f = document.querySelector("#ex-card-basic .card-foot");
    f.innerHTML = ["정책 상세 보기", "라이선스 갱신 요청", "담당자에게 문의"].map((t) => `<button type="button" class="btn sm secondary">${t}</button>`).join("");
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
  // .bordered 는 "shadow 대신 보더" 이므로 선택돼도 shadow/1 이 돌아오면 안 된다
  const bOn = await page.evaluate(() => {
    const prev = document.querySelector("#ex-card-variant .example-preview");
    const mk = (cls) => { const c = prev.querySelector(".card.bordered").cloneNode(true); c.className = cls; prev.append(c); const st = getComputedStyle(c); return { shadow: st.boxShadow, border: st.borderWidth, bg: st.backgroundColor }; };
    return { on: mk("card bordered on"), plain: mk("card on") };
  });
  ok("bordered+selected keeps the ring only", bOn.on.shadow.includes("inset") && !/1px 3px/.test(bOn.on.shadow) && bOn.on.border === "1px" && /1px 3px/.test(bOn.plain.shadow), JSON.stringify(bOn));
  // loading 예제
  const ld = await page.evaluate(() => {
    const c = document.querySelector("#ex-card-loading .card");
    const loaded = document.querySelector("#ex-card-basic .card");
    return { busy: c.getAttribute("aria-busy"), 스켈레톤: c.querySelectorAll(".skeleton").length,
      애니메이션: getComputedStyle(c.querySelector(".skeleton")).animationName,
      높이: Math.round(c.getBoundingClientRect().height), 로드된높이: Math.round(loaded.getBoundingClientRect().height) };
  });
  ok("loading card is busy and shows skeletons", ld.busy === "true" && ld.스켈레톤 === 3 && ld.애니메이션 === "shimmer" && ld.높이 < ld.로드된높이, JSON.stringify(ld));

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
  ok("white swatch gets an outline, saturated one does not", (await faint("--static-white")) && (await faint("--surface-base")) && !(await faint("--accent-surface")) && !(await faint("--static-black")));
  await page.click("#themeBtn"); await page.waitForTimeout(150);
  ok("outline follows the theme (dark: black faint, white not)", (await faint("--static-black")) && !(await faint("--static-white")));
  await page.click("#themeBtn"); await page.waitForTimeout(150);

  // 컬러바 형태 — 참고 시스템과 같게: 높이 32 · 가로 간격 0 · 직각 · 라벨은 8px 아래 가운데
  const barGeo = await page.evaluate(() => {
    const row = document.querySelector(".sem-row"), cells = [...row.querySelectorAll(".val-cell")];
    const a = cells[0].querySelector(".bar").getBoundingClientRect(), b = cells[1].querySelector(".bar").getBoundingClientRect();
    const n = cells[0].querySelector(".name"), ns = getComputedStyle(n);
    return { h: Math.round(a.height), gap: Math.round(b.left - a.right), radius: getComputedStyle(cells[0].querySelector(".bar")).borderRadius,
      labelGap: Math.round(n.getBoundingClientRect().top - a.bottom), align: ns.textAlign };
  });
  ok("semantic colour bars are 32 tall, flush, square", barGeo.h === 32 && barGeo.gap === 0 && barGeo.radius === "0px", JSON.stringify(barGeo));
  ok("semantic bar label sits 8px below, centered", barGeo.labelGap === 8 && barGeo.align === "center", JSON.stringify(barGeo));
  // hover 하면 색 레이어만 위로 8px 자란다 — 라벨은 움직이지 않아야 한다(bottom 고정이 이걸 보장한다)
  /* --accent-surface 는 의도 행렬로 옮겨갔다 — .sem-row 의 기하는 테마 절(Surface)에서 본다 */
  const barSel = '.sem-row .val-cell[data-token="--surface-base"]';
  const grow = async (sel) => page.evaluate((s2) => {
    const c = document.querySelector(s2), i = c.querySelector(".bar i"), n = c.querySelector(".name");
    return { h: Math.round(i.getBoundingClientRect().height), top: Math.round(i.getBoundingClientRect().top),
      label: Math.round(n.getBoundingClientRect().top), exp: c.getAttribute("aria-expanded") };
  }, sel);
  /* hover() 가 스크롤을 일으키면 top 비교가 무의미해진다 — 먼저 뷰 가운데로 가져온다 */
  await page.locator(barSel).evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(150);
  const g0 = await grow(barSel);
  await page.locator(barSel).hover(); await page.waitForTimeout(450);
  const g1 = await grow(barSel);
  ok("colour bar grows 8px upward on hover", g1.h - g0.h === 8 && g0.top - g1.top === 8, `${g0.h}→${g1.h} · top ${g0.top}→${g1.top}`);
  ok("the label does not move while the bar grows", g0.label === g1.label, `${g0.label} → ${g1.label}`);
  /* 의도 행렬 — 의도 6 × 역할 8. 같은 역할이 의도를 가로질러 같은 열에 서야 '역할이 1급'이라는 설계가 눈으로 확인된다.
     빈 칸이 생기면(토큰 이름 오타·미선언) 색이 없는 칩이 되므로 배경이 전부 칠해졌는지 함께 본다 */
  const mx = await page.evaluate(() => {
    const m = document.querySelector(".sem-matrix");
    if (!m) return null;
    const cells = [...m.querySelectorAll(".val-cell")];
    const cols = m.querySelectorAll(".sm-head>span").length - 1, rows = m.querySelectorAll(".sm-row").length;
    const blank = cells.filter((c) => { const b2 = getComputedStyle(c.querySelector(".bar i")).backgroundColor; return !b2 || b2 === "rgba(0, 0, 0, 0)"; });
    /* 같은 열의 칸들이 같은 x 좌표에 서야 역할 대조가 가능하다 */
    const firstRow = [...m.querySelectorAll(".sm-row")[0].querySelectorAll(".val-cell")].map((c) => Math.round(c.getBoundingClientRect().left));
    const lastRow = [...m.querySelectorAll(".sm-row")[rows - 1].querySelectorAll(".val-cell")].map((c) => Math.round(c.getBoundingClientRect().left));
    return { cols, rows, cells: cells.length, blank: blank.map((c) => c.dataset.token), checker: cells.filter((c) => c.classList.contains("checker")).length,
      aligned: JSON.stringify(firstRow) === JSON.stringify(lastRow) };
  });
  ok("intent matrix is 6 intents × 8 roles with every cell filled", mx && mx.cols === 8 && mx.rows === 6 && mx.cells === 48 && mx.blank.length === 0,
    JSON.stringify(mx));
  ok("matrix columns line up across intents", mx && mx.aligned, mx ? String(mx.aligned) : "없음");
  /* 알파인 역할(fill·line)만 체커 바탕 — 솔리드 역할에 체커가 깔리면 반투명으로 오독된다 */
  ok("only the alpha roles are checkered", mx && mx.checker === 12, mx ? String(mx.checker) : "없음");
  /* 행렬 칸도 같은 .val-cell 이라 값 팝오버가 그대로 열려야 한다 — 알파 칸은 8자리 Hex */
  const mxPop = await (async () => {
    await page.locator('.sem-matrix .val-cell[data-token="--danger-fill"]').click(); await page.waitForTimeout(250);
    const r = await page.evaluate(() => ({ open: !document.getElementById("valPop").hidden,
      title: (document.getElementById("valPopTitle") || {}).textContent || "",
      hex: (document.querySelector("#valPopRows") || {}).textContent || "" }));
    await page.keyboard.press("Escape"); await page.waitForTimeout(150);
    return r;
  })();
  ok("matrix cell opens the value popover with an 8-digit hex for alpha", mxPop.open && /Danger \/ fill/.test(mxPop.title) && /#[0-9A-F]{8}/.test(mxPop.hex),
    JSON.stringify(mxPop));

  /* 명도 사다리 — 두 모드가 **한 화면에** 보여야 비교가 된다.
     현재 테마와 무관하게 측정값 HEX 를 인라인으로 칠하므로, 라이트 페이지에서도 다크 칩이 밝아야 한다.
     중첩 data-theme 으로 만들었다면 여기서 두 열이 같은 색으로 나온다 */
  const lad = await page.evaluate(() => {
    const rows = [...document.querySelectorAll(".lad")];
    if (!rows.length) return null;
    const lum = (s2) => { const v = (s2.match(/[0-9.]+/g) || []).map(Number); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
    const first = rows[0], cols = first.querySelectorAll(".lad-col");
    const chipLum = (c) => [...c.querySelectorAll(".lad-chip i")].map((i) => lum(getComputedStyle(i).backgroundColor));
    const lightTop = chipLum(cols[0])[0], darkTop = chipLum(cols[1])[0];
    /* 사다리마다 L* 가 한 방향으로 가는지 — 역전이면 게이트가 막았어야 한다 */
    const mono = rows.every((r) => [...r.querySelectorAll(".lad-col")].every((c) => {
      const ls = [...c.querySelectorAll(".lad-chip span")].map((e) => parseFloat(e.textContent.replace(/[^0-9.]/g, "")));
      if (ls.length !== 3) return true;
      const d = [Math.sign(ls[1] - ls[0]), Math.sign(ls[2] - ls[1])];
      return !(d[0] !== 0 && d[1] !== 0 && d[0] !== d[1]);
    }));
    return { rows: rows.length, chips: document.querySelectorAll(".lad-chip").length, lightTop, darkTop, mono,
      theme: document.documentElement.dataset.theme || "(os)" };
  });
  ok("lightness ladders show both themes side by side", lad && lad.rows === 10 && lad.chips === 60, JSON.stringify(lad));
  /* 라이트 text-primary 는 거의 검정 · 다크 text-primary 는 거의 흰색. 두 열이 같으면 한 모드만 그린 것이다 */
  ok("the dark column really shows dark-theme values on a light page", lad && lad.lightTop < 60 && lad.darkTop > 200,
    lad ? `라이트 ${Math.round(lad.lightTop)} · 다크 ${Math.round(lad.darkTop)}` : "없음");
  ok("every ladder runs in one direction", lad && lad.mono, lad ? String(lad.mono) : "없음");

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
  const atomSel = '.pal .val-cell[data-token="--neutral-500"]';
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

  // 브랜드 역할 맵이 Colors 에서 떨어져 나와 제 페이지를 가진다
  await go("foundations/brand-role-map.html");
  const brm = await page.evaluate(() => ({
    h1: (document.querySelector("article h1") || {}).textContent || "",
    roles: document.querySelectorAll("table.roles tbody tr").length,
    dodont: document.querySelectorAll(".dodont>div").length,
    side: [...document.querySelectorAll(".sidebar a")].some(a => /brand-role-map/.test(a.getAttribute("href") || "")),
  }));
  /* 세 쌍이다 — 브랜드색 오용 · 심각도 라벨 병기 · 두 축 겹침. 마지막 쌍은 심각도 색을 상태색에 접은 대가를 보여 준다 */
  ok("brand role map has its own page with the table and all three pairs", /Brand role map/.test(brm.h1) && brm.roles === 5 && brm.dodont === 6 && brm.side, JSON.stringify(brm));
  await go("foundations/colors.html");
  const left = await page.evaluate(() => ({ roles: document.querySelectorAll("table.roles").length, link: !!document.querySelector('article a[href*="brand-role-map"]') }));
  ok("colors drops the role map and links to it instead", left.roles === 0 && left.link, JSON.stringify(left));

  // Atomic 팔레트 칸 수 + 반응형 블록이 실제로 적용되는지 (한동안 컴포넌트 규칙에 덮여 죽어 있었다)
  for (const [w, want] of [[1440, [2, 15, 11]], [760, [2, 7, 7]], [390, [2, 5, 5]]]) {
    await page.setViewportSize({ width: w, height: 900 });
    await go("foundations/colors.html");
    await page.locator('.doc-tabs [data-doctab="atomic"]').click();
    const got = await page.evaluate(() => ["Common", "Neutral", "Red"].map((t) => {
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
  const atom = '.pal .val-cell[data-token="--neutral-500"]';
  await page.locator(atom).evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.locator(atom).click();
  await page.waitForSelector("#valPop:not([hidden])", { timeout: 2000 });
  const av = await page.evaluate((sel) => {
    const c = document.querySelector(sel).getBoundingClientRect(), p = document.getElementById("valPop").getBoundingClientRect();
    const row = (k) => [...document.querySelectorAll("#valPopRows .val-row")].filter((r) => r.querySelector("b").textContent === k).map((r) => r.querySelector("span").textContent)[0];
    return { t: document.getElementById("valPopTitle").textContent, hex: row("Hex"), tok: row("Token"), below: Math.round(p.top - c.bottom), label: document.querySelector(sel).querySelector("i").textContent };
  }, atom);
  ok("atomic swatch opens the same pop", av.t === "Neutral / 500" && /^#[0-9A-F]{6}$/.test(av.hex) && av.tok === "var(--neutral-500)" && av.below >= 0 && av.below <= 16 && av.label === "500", JSON.stringify(av));
  await page.screenshot({ path: SHOT + "/val-pop-atomic.png" });
  await page.keyboard.press("Escape");
  ok("atomic pop closes on Esc", await page.locator("#valPop").evaluate((e) => e.hidden));

  // Colors: Semantic 스와치 클릭 → 값 팝오버 (딤 없이 바 아래, 토큰 복사)
  await go("foundations/colors.html");
  await page.locator("#intent").evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }));   /* 제품 Primary 는 의도 행렬 안에 있다 */
  const cellSel = '.val-cell[data-token="--accent-surface"]';
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
