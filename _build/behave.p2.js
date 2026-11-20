/* 디자인 검토 P2 · P3(2026-11-20) — behave.js 가 부른다. 보고서 항목 번호를 단정 이름 앞에 적는다.
   사람의 결정으로 고치지 않은 것(#2 컴포넌트별 keep-all · #4 목차 1600 · #26 맥박 · 레이아웃 전환 넷)은 재지 않는다. */
module.exports = async function p2({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const ex = (pg, id) => `#ex-${pg}-${id} .example-preview`;
  const part = require("./behave.part")(ok, "behave.p2", () => page);
  const css = (sel, prop, pseudo) => page.evaluate(([s, p, ps]) => { const e = document.querySelector(s); return e ? getComputedStyle(e, ps || null).getPropertyValue(p) : null; }, [sel, prop, pseudo]);

  await part("1 · 셸 — main 랜드마크 · N 배지 · 개요 카드 이름 · 헤더 글자 200%", async () => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await go("components/overview.html");
    const sh = await page.evaluate(() => {
      const main = document.querySelectorAll("main"), skip = document.querySelector(".skip-link");
      const tgt = skip && document.querySelector(skip.getAttribute("href"));
      const n = document.querySelector(".nav .n");
      const name = (a) => { const c = a.cloneNode(true); c.querySelectorAll('[aria-hidden="true"]').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, " ").trim(); };
      const card = document.querySelector("a.ov-card");
      return { mains: main.length, inMain: !!(tgt && tgt.closest("main")), nSr: n && n.querySelector(".sr-only") && n.querySelector(".sr-only").textContent, nVis: n && n.querySelector('[aria-hidden="true"]') && n.querySelector('[aria-hidden="true"]').textContent,
        thumb: card && card.querySelector(".thumb").getAttribute("aria-hidden"), inert: card && card.querySelector(".thumb").inert, cardName: card && name(card) };
    });
    ok("p2 A11: the doc shell has one <main> and the skip link lands inside it", sh.mains === 1 && sh.inMain, JSON.stringify(sh));
    ok("p2 A10: the N badge shows N but reads ', 새 항목', and an overview card's thumbnail is hidden (aria-hidden + inert) so the link name is just the card's own text",
      sh.nVis === "N" && sh.nSr === ", 새 항목" && sh.thumb === "true" && sh.inert === true && sh.cardName.length < 40, JSON.stringify(sh));
    const hdr = async () => page.evaluate(() => { const h = document.querySelector(".header"), t = h.querySelector(".topnav"), m = h.querySelector(".hmenu-nav");
      return { tight: h.classList.contains("nav-tight"), top: getComputedStyle(t).display, menu: getComputedStyle(m).display, over: t.scrollWidth > t.clientWidth + 1 }; });
    const base = await hdr();
    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; window.dispatchEvent(new Event("resize")); }); await wait(120);
    const big = await hdr();
    await page.evaluate(() => { document.documentElement.style.fontSize = ""; window.dispatchEvent(new Event("resize")); }); await wait(120);
    const back = await hdr();
    ok("p2 A12: at 1440 the top menu fits; with text at 200% it no longer fits, so the header hides it behind ☰ (no menu lost behind a hidden scrollbar), and back at 100% the menu returns",
      !base.tight && base.top !== "none" && big.tight && big.top === "none" && big.menu !== "none" && !back.tight && back.top !== "none", JSON.stringify({ base, big, back }));
  });

  await part("2 · Writing do/dont 글자 200% · 홈 · 달력 lang", async () => {
    await go("foundations/writing.html");
    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; }); await wait(120);
    const clip = await page.evaluate(() => [...document.querySelectorAll(".dodont *")].filter((e) => getComputedStyle(e).overflow === "hidden" && e.scrollWidth > e.clientWidth + 1).length);
    await page.evaluate(() => { document.documentElement.style.fontSize = ""; });
    ok("p2 A12: Writing do/don't shots don't clip their banners or buttons with text at 200%", clip === 0, String(clip));
    await go("index.html");
    const home = await page.evaluate(() => ({ bans: document.querySelector(".hm-bans") && document.querySelector(".hm-bans").getAttribute("lang"), btn: [...document.querySelectorAll(".hm-btn")].map((b) => b.getAttribute("lang")) }));
    ok("p2 A15: the home's English hero buttons and banners carry lang=en", home.bans === "en" && home.btn.length > 0 && home.btn.every((l) => l === "en"), JSON.stringify(home));
    await go("components/date-picker.html");
    const st = await page.evaluate(() => [...document.querySelectorAll("#ex-date-picker-locale .calendar")].map((c) => c.getAttribute("lang")));
    const ko = await page.evaluate(() => [...document.querySelectorAll(".example-preview .calendar")].filter((c) => !c.closest("#ex-date-picker-locale")).map((c) => c.getAttribute("lang")).filter(Boolean));
    ok("p2 A15: Date Picker en-US · ja-JP calendars carry their lang; Korean calendars carry none (the page is ko)", st.includes("en-US") && st.includes("ja-JP") && ko.length === 0, JSON.stringify({ st, ko }));
  });

  await part("3 · 접근 이름 · 제목 단계", async () => {
    await go("components/loading.html");
    const pb = await page.evaluate(() => [...document.querySelectorAll('.example-preview [role="progressbar"]')].map((e) => ({ n: e.getAttribute("aria-label") || e.getAttribute("aria-labelledby"), min: e.getAttribute("aria-valuemin"), max: e.getAttribute("aria-valuemax") })));
    ok("p2 A9: every progressbar on Loading has a name and a value range", pb.length >= 3 && pb.every((p) => p.n && p.min === "0" && p.max === "100"), JSON.stringify(pb));
    await go("components/list.html");
    const lb = await page.evaluate(() => [...document.querySelectorAll('.example-preview [role="listbox"]')].map((e) => e.getAttribute("aria-label") || e.getAttribute("aria-labelledby")));
    ok("p2 A9: the selectable list (listbox) has a name", lb.length > 0 && lb.every(Boolean), JSON.stringify(lb));
    const h1s = {};
    for (const p of ["patterns/dashboard.html", "patterns/detail.html", "patterns/incident.html", "patterns/policy-settings.html", "components/page-header.html", "components/breadcrumb.html"]) {
      await go(p); h1s[p] = await page.evaluate(() => document.querySelectorAll("h1").length);
    }
    ok("p2 A14: doc pages with Page Header examples keep one h1 (the examples use h2)", Object.values(h1s).every((n) => n === 1), JSON.stringify(h1s));
    const tpl = {};
    for (const s of ["dashboard", "list", "login", "org", "policy", "tabs-list", "wizard"]) {
      await go(`templates/screen/${s}.html`);
      tpl[s] = await page.evaluate(() => {
        const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter((h) => h.offsetParent !== null || getComputedStyle(h).position === "fixed").map((h) => +h.tagName[1]);
        let skip = 0; hs.forEach((l, i) => { if (i && l > hs[i - 1] + 1) skip++; });
        return { h1: hs.filter((l) => l === 1).length, first: hs[0], skip };
      });
    }
    ok("p2 A14: each template screen has one visible h1 first and never skips a heading level", Object.values(tpl).every((t) => t.h1 === 1 && t.first === 1 && t.skip === 0), JSON.stringify(tpl));
    await go("templates/dashboard.html");
    const fr = await page.evaluate(() => [...document.querySelectorAll("iframe")].map((f) => f.getAttribute("tabindex")));
    ok("p2 A5: the scaled template preview iframe is out of the Tab order", fr.length === 1 && fr[0] === "-1", JSON.stringify(fr));
  });

  await part("4 · 포커스 링 · 대비 쌍 · 색", async () => {
    await go("components/list.html");
    const off = await page.evaluate(() => {
      const t = (sel) => { const e = document.querySelector(sel); if (!e) return null; e.tabIndex = e.tabIndex < 0 ? 0 : e.tabIndex; e.focus(); return getComputedStyle(e).outlineOffset; };
      return { li: t(".example-preview .list li[role=option]"), wrap: (() => { const w = document.createElement("div"); w.className = "tbl-wrap"; w.tabIndex = 0; document.querySelector(".example-preview").append(w); w.focus(); const o = getComputedStyle(w).outlineOffset; w.remove(); return o; })() };
    });
    ok("p2 A4: focus rings inside clipping ancestors draw inward (-2px) — list rows and table scrollers", off.wrap === "-2px" && (off.li === null || off.li === "-2px"), JSON.stringify(off));
    const sel = await page.evaluate(() => { const li = document.querySelector('.example-preview .list li.on .meta'); return li ? getComputedStyle(li).color : null; });
    const sec = await page.evaluate(() => { const p = document.createElement("i"); p.style.color = "var(--foreground-neutral-secondary)"; document.body.append(p); const c = getComputedStyle(p).color; p.remove(); return c; });
    ok("p2 A6: helper text on a selected (brand subtle) row is secondary, not tertiary", sel === null || sel === sec, JSON.stringify({ sel, sec }));
    await go("patterns/system-status.html");
    const dn = await page.evaluate(() => { const b = document.querySelector(".example-preview .notice.danger .btn.text"); if (!b) return null; const p = document.createElement("i"); p.style.color = "var(--foreground-neutral-primary)"; document.body.append(p); const c = getComputedStyle(p).color; p.remove(); return { b: getComputedStyle(b).color, want: c }; });
    ok("p2 A7: a text button on a danger notice uses the neutral text color (brand was 4.36 there in dark)", dn && dn.b === dn.want, JSON.stringify(dn));
    await go("foundations/grid.html");
    const sb = await page.evaluate(() => { const b = document.querySelector(".space-bars>div.base b"); if (!b) return null; const p = document.createElement("i"); p.style.color = "var(--brand-label)"; document.body.append(p); const c = getComputedStyle(p).color; p.remove(); return { b: getComputedStyle(b).color, want: c }; });
    ok("p2 A13: the base spacing bar's number is brand-label on the product color", sb && sb.b === sb.want, JSON.stringify(sb));
  });

  await part("5 · 시각 값 — 반경 · 굵기 · 칸 폭 · 행 높이 · 달력 hover · 아이콘 선 · z-index", async () => {
    await go("components/data-table.html");
    const v = await page.evaluate(() => {
      const host = document.querySelector(".example-preview");
      const mk = (h) => { const d = document.createElement("div"); d.innerHTML = h; host.append(d); return d; };
      const pg = mk('<nav class="pagination compact"><button type="button">1</button></nav>'), pr = getComputedStyle(pg.querySelector("button")).borderTopLeftRadius;
      const em = mk('<div class="empty"><b>제목</b></div>'), ew = getComputedStyle(em.querySelector("b")).fontWeight;
      const ic = mk([10, 12, 14, 16, 18, 20, 24, 48].map((w) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" stroke-width="2"></svg>`).join("") + '<button type="button" class="btn lg icon-only outline assistive" aria-label="x"><svg width="28" height="28" viewBox="0 0 24 24" stroke-width="2"></svg></button>');
      const sw = [...ic.querySelectorAll(":scope > svg")].map((s) => Math.round(parseFloat(getComputedStyle(s).strokeWidth) * (+s.getAttribute("width")) / 24 * 100) / 100), raw = [...ic.querySelectorAll(":scope > svg")].map((s) => getComputedStyle(s).strokeWidth), lgBtn = getComputedStyle(ic.querySelector(".btn svg")).strokeWidth;
      const rows = {};
      for (const d of ["compact", "", "relaxed"]) {
        const t = mk(`<div class="tbl-wrap"><table class="tbl ${d}"><tbody><tr><td class="expand"><button type="button" class="expand-btn" aria-label="상세">›</button></td><td>값</td></tr><tr><td></td><td>값</td></tr></tbody></table></div>`);
        const [a, b] = t.querySelectorAll("tr"); rows[d || "default"] = [Math.round(a.getBoundingClientRect().height * 10) / 10, Math.round(b.getBoundingClientRect().height * 10) / 10];
      }
      [pg, em, ic].forEach((x) => x.remove());
      return { pr, ew, sw, raw, lgBtn, rows };
    });
    ok("p2 #14: a compact (32) pagination button uses radius sm (4)", v.pr === "4px", v.pr);
    ok("p2 #20: the empty-state title is SemiBold (600) like its Spec", v.ew === "600", v.ew);
    ok("p2 #16: drawn icon strokes stay within a visible 1.1 ~ 1.75px band from 10 to 24 (raw would be 0.83 ~ 2), 48 at 2.5, while a component's own stroke (Button lg 1.6) still wins",
      v.sw.slice(0, 7).every((w) => w >= 1.1 && w <= 1.76) && v.sw[7] === 2.5 && v.raw.filter((w, i) => i !== 4).every((w) => w !== "2px") && v.raw[4] === "2px" && v.lgBtn === "1.6px", JSON.stringify({ sw: v.sw, raw: v.raw, lg: v.lgBtn }));
    ok("p2 #21: a row with the expand button is the same height as a plain row at each density", Object.values(v.rows).every(([a, b]) => Math.abs(a - b) < 0.6), JSON.stringify(v.rows));
    const z = await page.evaluate(() => { const d = document.createElement("div"); d.className = "popup-backdrop"; d.style.visibility = "hidden"; document.body.append(d); const r = { z: getComputedStyle(d).zIndex, t: getComputedStyle(document.documentElement).getPropertyValue("--z-popup").trim() }; d.remove(); return r; });
    ok("p2 #23: stacking uses the z tokens (popup backdrop = --z-popup)", z.z === z.t && z.t === "100", JSON.stringify(z));
    await go("patterns/policy-settings.html");
    const cw = await page.evaluate(() => [...new Set([...document.querySelectorAll("#ex-policy-settings-sections .setting .ctrl")].map((c) => Math.round(c.getBoundingClientRect().width)))]);
    ok("p2 #18: policy-setting controls share one column width so their edges line up", cw.length === 1, JSON.stringify(cw));
    await go("components/date-picker.html");
    const day = page.locator(`${ex("date-picker", "calendar")} .calendar .day:not(.on):not(.today):not(.muted):not([disabled])`).first();
    await day.scrollIntoViewIfNeeded(); await day.hover(); await wait(260);
    const hv = await page.evaluate(() => { const d = document.querySelector(".calendar .day:hover"); const p = document.createElement("i"); p.style.background = "var(--surface-neutral-tertiary)"; document.body.append(p); const want = getComputedStyle(p).backgroundColor; p.remove(); return { got: d && getComputedStyle(d, "::before").backgroundColor, want }; });
    await page.mouse.move(0, 0);
    ok("p2 #24: a day's hover in the calendar uses the same token as the time cells (surface-neutral-tertiary)", hv.got === hv.want, JSON.stringify(hv));
  });

  await part("6 · 모션 — Switch · Skeleton · 오버레이 들어옴 · 나감", async () => {
    await go("components/switch.html");
    const sw = await page.evaluate(() => { const l = document.createElement("label"); l.className = "switch"; l.innerHTML = '<input type="checkbox" role="switch" checked>'; document.querySelector(".example-preview").append(l); const a = getComputedStyle(l.firstChild, "::after"); const r = { tp: a.transitionProperty, tf: a.transform, left: a.left }; l.remove(); return r; });
    ok("p2 #6: the switch knob moves by transform, not left (no layout every frame)", sw.tp === "transform" && sw.tf !== "none" && sw.left === "2px", JSON.stringify(sw));
    await go("components/loading.html");
    const sk = await page.evaluate(() => { const s = document.createElement("span"); s.className = "skeleton"; document.querySelector(".example-preview").append(s); const a = getComputedStyle(s, "::after"); const r = { self: getComputedStyle(s).animationName, after: a.animationName, pos: getComputedStyle(s).position }; s.remove(); return r; });
    ok("p2 #26: the skeleton's sheen is a transform animation on ::after, not a background-position repaint", sk.after === "shimmer" && sk.self === "none" && sk.pos === "relative", JSON.stringify(sk));
    const open = async () => page.evaluate(() => { const p = document.createElement("div"); p.className = "popup"; p.id = "p2-pop"; p.innerHTML = '<div class="popup-head"><h2 class="popup-title">확인</h2></div><div class="popup-actions"><button type="button" class="btn md outline assistive" data-popup-close>취소</button></div>'; document.querySelector(".example-preview").append(p); window.DS.popup.open(p); });
    await open(); await wait(40);
    const anim = await page.evaluate(() => ({ bd: getComputedStyle(document.querySelector(".popup-backdrop")).animationName, pop: getComputedStyle(document.querySelector(".popup-backdrop > .popup")).animationName }));
    await page.evaluate(() => window.DS.popup.close()); await wait(20);
    const g1 = await page.evaluate(() => ({ ghost: document.querySelectorAll(".ds-ghost").length, hidden: document.querySelector(".ds-ghost") ? document.querySelector(".ds-ghost").getAttribute("aria-hidden") : null, real: document.querySelectorAll(".popup-backdrop:not(.ds-ghost *)").length }));
    await wait(400);
    const g2 = await page.evaluate(() => document.querySelectorAll(".ds-ghost").length);
    await page.evaluate(() => document.getElementById("p2-pop") && document.getElementById("p2-pop").remove());
    ok("p2 #25: a popup fades/rises in (ds-fade · ds-rise) and on close the real node goes at once while an aria-hidden copy fades out and is removed",
      anim.bd === "ds-fade" && anim.pop === "ds-rise" && g1.ghost === 1 && g1.hidden === "true" && g1.real === 0 && g2 === 0, JSON.stringify({ anim, g1, g2 }));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(); await wait(30); await page.evaluate(() => window.DS.popup.close()); await wait(20);
    const rm = await page.evaluate(() => document.querySelectorAll(".ds-ghost").length);
    await page.evaluate(() => document.getElementById("p2-pop") && document.getElementById("p2-pop").remove());
    await page.emulateMedia({ reducedMotion: "no-preference" });
    ok("p2 #25: with reduced motion no fading copy is made", rm === 0, String(rm));
  });

  await part("7 · Steps 완료 처리 중(data-async)", async () => {
    await go("components/steps.html");
    const sp = `${ex("steps", "default")} .stepper`;
    await page.evaluate((s) => { window.__fin = 0; document.addEventListener("ds:step-finish", () => window.__fin++); const el = document.querySelector(s); el.querySelectorAll("input").forEach((i) => { if (!i.value) i.value = "영업팀"; }); window.DS.stepper.go(el, 3); }, sp);
    await wait(60);
    const fin = page.locator(`${sp} [data-step="finish"]`);
    const lbl = (await fin.textContent()).trim();
    await fin.click(); await wait(30);
    const busy = await page.evaluate((s) => { const b = document.querySelector(s + ' [data-step="finish"]'); return { loading: b.classList.contains("loading"), aria: b.getAttribute("aria-busy") }; }, sp);
    await fin.click({ force: true }); await wait(30);
    const n1 = await page.evaluate(() => window.__fin);
    await wait(1000);
    const done = await page.evaluate((s) => { const b = document.querySelector(s + ' [data-step="finish"]'); return { loading: b.classList.contains("loading"), aria: b.getAttribute("aria-busy") }; }, sp);
    ok("p2 #10 · #8: the default wizard's finish says what it does (정책 만들기), goes loading + aria-busy, a second press fires nothing, and it settles after the reply",
      lbl === "정책 만들기" && busy.loading && busy.aria === "true" && n1 === 1 && !done.loading && done.aria === null, JSON.stringify({ lbl, busy, n1, done }));
    await page.evaluate(() => document.addEventListener("ds:step-finish", (e) => e.detail.reject && e.detail.reject("서버에 저장하지 못했습니다."), { capture: true, once: true }));
    await fin.click(); await wait(80);
    const rej = await page.evaluate((s) => ({ toast: [...document.querySelectorAll(".toast-stack.fixed .toast.danger")].map((t) => t.textContent.trim()), loading: document.querySelector(s + ' [data-step="finish"]').classList.contains("loading") }), sp);
    ok("p2 #10: reject(message) frees the button and shows that message as an error Toast", !rej.loading && rej.toast.some((t) => t.includes("서버에 저장하지 못했습니다.")), JSON.stringify(rej));
    const plain = await page.evaluate(() => { const el = document.querySelector("#ex-steps-label-below .stepper"); return el && !el.hasAttribute("data-async"); });
    ok("p2 #10: data-async is an option — other wizards finish at once as before", plain === true, String(plain));
  });

  await part("8 · 문구 — 위험 확인 공백 · 2단계 계정 · 날짜 형식", async () => {
    await go("patterns/danger-confirm.html");
    const r = await page.evaluate(() => { const i = document.getElementById("dc3-name"); i.value = "  SIEM 연동 "; const ok1 = i.checkValidity(); i.value = "SIEM"; const ok2 = i.checkValidity(); const lab = document.querySelector('label[for="dc3-name"] b'); return { ok1, ok2, b: lab && lab.textContent }; });
    ok("p2 #27: the name to type is shown in bold and spaces around it are not compared", r.ok1 && !r.ok2 && r.b === "SIEM 연동", JSON.stringify(r));
    await go("patterns/sign-in.html");
    const a = await page.evaluate(() => { const p = document.querySelector("#ex-sign-in-two-step .auth-account"); return p ? { who: p.querySelector("b").textContent, link: p.querySelector("a") && p.querySelector("a").textContent } : null; });
    ok("p2 #9: two-step sign-in shows which account and a way back to another one", a && /@/.test(a.who) && /다른 계정/.test(a.link), JSON.stringify(a));
    await go("foundations/writing.html");
    const w = await page.evaluate(() => { const t = document.querySelector("main").textContent; return { iso: (t.match(/\b20\d\d-\d\d-\d\d\b/g) || []).length, fmt: /2026\. 09\. 07 14:30/.test(t) && /09\. 07 14:30/.test(t) }; });
    ok("p2 #30: Writing states the date format YYYY. MM. DD (2026. 09. 07 14:30 · short 09. 07 14:30) and shows no ISO dates", w.fmt && w.iso === 0, JSON.stringify(w));
  });

  await part("9 · 데이터 패턴 상태 예제 · 로그 뷰어 연결 끊김 · 좁은 표", async () => {
    const res = {};
    for (const k of ["audit-log", "roles", "secrets", "report-schedule", "alert-rules", "bulk-progress", "incident"]) {
      await go(`patterns/${k}.html`);
      res[k] = await page.evaluate((k) => {
        const box = document.querySelector(`#ex-${k}-state .example-preview`); if (!box) return null;
        const cards = box.querySelectorAll(".card"); const [l, e, x] = cards;
        window.__retry = 0; document.addEventListener("ds:retry", () => window.__retry++, { once: true });
        const btn = x && x.querySelector("[data-retry]"); btn && btn.click();
        return { cards: cards.length, busy: !!(l && l.querySelector('table[aria-busy="true"]') && l.querySelector('[role="status"]')), sk: l ? l.querySelectorAll("tbody tr").length : 0,
          empty: !!(e && e.querySelector("td.empty .empty:not([role])")), alert: !!(x && x.querySelector('.empty[role="alert"]')), retry: window.__retry };
      }, k);
    }
    ok("p2 #11: the seven data patterns each show loading (Skeleton rows + status), an empty result and a load error whose retry fires ds:retry",
      Object.values(res).every((r) => r && r.cards === 3 && r.busy && r.sk === 3 && r.empty && r.alert && r.retry === 1), JSON.stringify(res));
    await go("patterns/log-viewer.html");
    const lv = await page.evaluate(() => { const b = document.querySelector("#ex-log-viewer-disconnected .banner"); return b ? { warn: b.classList.contains("warning"), role: b.getAttribute("role"), btn: b.querySelector(".btn") && b.querySelector(".btn").textContent } : null; });
    ok("p2 #11: the log viewer shows a lost live connection as a warning banner with 다시 연결", lv && lv.warn && lv.role === "alert" && lv.btn === "다시 연결", JSON.stringify(lv));
    await page.setViewportSize({ width: 390, height: 844 });
    const nw = {};
    for (const [p, id] of [["components/data-table", "data-table-basic"], ["components/data-table", "data-table-sub-text"], ["patterns/import-export", "import-export-import"], ["patterns/severity", "severity-table"], ["patterns/secrets", "secrets-keys"], ["patterns/audit-log", "audit-log-history"]]) {
      await go(p + ".html");
      nw[id] = await page.evaluate((id) => [...document.querySelectorAll(`#ex-${id} .example-preview .tbl`)].every((t) => t.classList.contains("nowrap") && [...t.querySelectorAll("td")].every((c) => getComputedStyle(c).whiteSpace === "nowrap")), id);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    ok("p2 #13: tables whose cells broke mid-syllable at 390 keep cells on one line and scroll instead", Object.values(nw).every(Boolean), JSON.stringify(nw));
    await go("templates/screen/org.html");
    const org = await page.evaluate(() => { const s = document.querySelector(".tpl-split"); if (!s) return null; const kids = [...s.children].map((c) => Math.round(c.getBoundingClientRect().height)); return { align: getComputedStyle(s).alignItems, kids }; });
    ok("p2 #19: the org chart's tree card stretches to its neighbour's height", org && org.align === "stretch" && Math.max(...org.kids) - Math.min(...org.kids) <= 1, JSON.stringify(org));
  });
};
