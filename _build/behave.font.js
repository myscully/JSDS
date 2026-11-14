/* 일본어 한자용 Pretendard JP(사람의 결정 2026-11-14) — Pretendard 에는 한자가 없어 일본어의 한자만 시스템 서체(맥 Apple SD Gothic Neo)로 그려졌다.
   --font-sans 의 Pretendard 바로 뒤에 "Pretendard JP"(assets/font-jp.css, 조각마다 unicode-range)를 둔다.
   잰다: 글자별로 그리는 서체(CDP CSS.getPlatformFontsForNode) · 가변 굵기 · 한자가 없는 페이지의 조각 요청 0 · 일본어 달력 크기. behave.js 가 부른다 */
const path = require("path");
module.exports = async function font({ page, ok, go }) {
  const SITE = path.resolve(__dirname, "..");
  const JA = "#ex-date-picker-locale .calendar[data-locale=\"ja-JP\"]";
  /* 덩어리(part)마다 던지면 그 덩어리의 실패로 남기고 다음으로 간다 — behave.part.js(2026-11-14). 덩어리를 넘어 쓰는 변수는 아래 let 에 둔다 */
  const part = require("./behave.part")(ok, "behave.font", () => page);

  await part("1 · 글자별 서체 — 한자는 Pretendard JP, 한글 · 가나 · 숫자는 Pretendard", async () => {
    await go("components/date-picker.html"); await page.evaluate(() => document.fonts.ready);
    /* 일본어 달력 안에 탐침 글자를 넣는다 — 달력의 서체 · 굵기를 그대로 물려받는다 */
    const probes = { kanji: "日付選択年月", kana: "キャンセルひらがな", hangul: "관리자 설정", digits: "2026", mixed: "2026年9月" };
    const have = await page.evaluate(([sel, probes]) => { const cal = document.querySelector(sel); if (!cal) return false;
      for (const [k, v] of Object.entries(probes)) { const s = document.createElement("span"); s.dataset.fontProbe = k; s.textContent = v; cal.append(s); } return true; }, [JA, probes]);
    await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(300);
    const c = await page.context().newCDPSession(page); await c.send("DOM.enable"); await c.send("CSS.enable");
    const { root } = await c.send("DOM.getDocument", { depth: -1 }); const got = {};
    if (have) for (const k of Object.keys(probes)) {
      const { nodeId } = await c.send("DOM.querySelector", { nodeId: root.nodeId, selector: `[data-font-probe="${k}"]` });
      got[k] = Object.fromEntries((await c.send("CSS.getPlatformFontsForNode", { nodeId })).fonts.map((f) => [f.familyName, f.glyphCount]));
    }
    await c.detach(); await page.evaluate(() => document.querySelectorAll("[data-font-probe]").forEach((e) => e.remove()));
    const only = (o, fam) => o && Object.keys(o).length === 1 && Object.keys(o)[0] === fam;
    ok("ja-JP calendar: kanji are drawn by Pretendard JP only; kana, Hangul and digits by Pretendard only; '2026年9月' splits 5 Pretendard + 2 Pretendard JP",
      have && only(got.kanji, "Pretendard JP Variable") && only(got.kana, "Pretendard Variable") && only(got.hangul, "Pretendard Variable") && only(got.digits, "Pretendard Variable")
        && got.mixed["Pretendard Variable"] === 5 && got.mixed["Pretendard JP Variable"] === 2, JSON.stringify(got));
  });

  await part("2 · 가변 굵기 — 한자도 굵기를 따라간다", async () => {
    /* 같은 한자를 300 · 400 · 700 으로 캔버스에 그려 잉크 양을 잰다. 가변 축이 아니면 300 과 400 이 같다(합성 굵기는 굵게만 만든다) */
    const ink = await page.evaluate(async () => {
      const out = {};
      for (const w of [300, 400, 700]) {
        await document.fonts.load(`${w} 48px "Pretendard JP"`, "日付選択");
        const cv = document.createElement("canvas"); cv.width = 260; cv.height = 70; const x = cv.getContext("2d");
        x.font = `${w} 48px "Pretendard JP"`; x.fillText("日付選択", 4, 54);
        const d = x.getImageData(0, 0, cv.width, cv.height).data; let s = 0; for (let i = 3; i < d.length; i += 4) s += d[i]; out[w] = s;
      }
      out.loaded = document.fonts.check('400 48px "Pretendard JP"', "日"); return out;
    });
    ok("Pretendard JP is variable: kanji ink grows 300 < 400 < 700 (400 → 700 by more than 25%)",
      ink.loaded && ink[300] < ink[400] && ink[400] * 1.25 < ink[700], JSON.stringify(ink));
  });

  await part("3 · 조각 요청 — 한자가 없는 페이지는 0", async () => {
    /* 앞 페이지의 메모리 캐시를 피하려고 새 컨텍스트에서 연다 */
    const ctx = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 } });
    const count = async (p) => { const q = await ctx.newPage(); const req = new Set(); q.on("request", (r) => { if (/\/assets\/fonts\/jp\//.test(r.url())) req.add(r.url().split("/").pop()); });
      await q.goto("file://" + path.join(SITE, p)); await q.evaluate(() => document.fonts.ready); await q.waitForTimeout(400); await q.close(); return req.size; };
    const button = await count("components/button.html"), dp = await count("components/date-picker.html");
    const faces = (require("fs").readFileSync(path.join(SITE, "assets", "font-jp.css"), "utf8").match(/@font-face\s*\{/g) || []).length;   // file:// 에서는 cssRules 를 못 읽는다
    await ctx.close();
    ok("font slices: a page without kanji (Button) loads none; the Date Picker page loads only a few of all slices",
      button === 0 && dp > 0 && faces > 0 && dp < faces / 4, JSON.stringify({ button, dp, faces }));
  });

  await part("4 · 일본어 달력 크기 — 서체를 바꿔도 그대로", async () => {
    await go("components/date-picker.html"); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(200);
    const m = await page.evaluate((sel) => {
      const ja = document.querySelector(sel), en = document.querySelector('#ex-date-picker-locale .calendar[data-locale="en-US"]'); if (!ja || !en) return null;
      const h = (e) => e && Math.round(e.getBoundingClientRect().height * 100) / 100;
      const title = [...ja.querySelectorAll("*")].find((x) => [...x.childNodes].some((n) => n.nodeType === 3 && /年/.test(n.textContent)));
      const btn = (t) => [...ja.querySelectorAll("button")].find((b) => b.textContent.trim() === t);
      return { ja: h(ja), en: h(en), title: h(title), today: h(btn("今日")), apply: h(btn("適用")) };
    }, JA);
    ok("ja-JP calendar keeps its size: same height as the en-US calendar, title 28, 今日 · 適用 buttons 32",
      m && m.ja === m.en && m.title === 28 && m.today === 32 && m.apply === 32, JSON.stringify(m));
  });
};
