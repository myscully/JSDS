/* Number Input 동작 검사(2026-11-10). behave.js 가 부른다 */
module.exports = async function number({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const color = (name, prop = "color") => page.evaluate(([n, p]) => { const d = document.createElement("div"); d.style[p] = `var(${n})`; document.body.append(d); const c = getComputedStyle(d)[p]; d.remove(); return c; }, [name, prop]);
  const field = (id, n = 0) => page.locator(`#ex-number-input-${id} .number-field`).nth(n);
  const parts = (f) => ({ i: f.locator("input"), down: f.locator(".num-btn.down"), up: f.locator(".num-btn.up"), help: f.locator("> .help") });
  const blur = async () => { await page.keyboard.press("Tab"); await wait(30); };

  await go("components/number-input.html");
  const d = field("default"), { i, down, up, help } = parts(d);
  await d.scrollIntoViewIfNeeded();
  const orig = await help.textContent();
  ok("number input: the native spinner is off", (await i.evaluate((e) => getComputedStyle(e).appearance)) === "textfield");
  ok("number input: digits line up", (await i.evaluate((e) => getComputedStyle(e).fontVariantNumeric)) === "tabular-nums");
  await page.mouse.move(4, 500); await wait(30);
  const rest = (await i.screenshot()).toString("base64");
  await i.hover(); await wait(80);
  ok("number input: hovering shows no native spinner", rest === (await i.screenshot()).toString("base64"));
  await page.mouse.move(4, 500);
  ok("number input: the value is named by its label", (await page.getByLabel("세션 만료", { exact: true }).first().evaluate((e) => e.type)) === "number");
  ok("number input: the unit is read with the value", (await i.getAttribute("aria-valuetext")) === "30분");
  ok("number input: the buttons carry the value's name", (await down.getAttribute("aria-label")) === "세션 만료 줄이기" && (await up.getAttribute("aria-label")) === "세션 만료 늘리기");
  ok("number input: the icon is 16", await up.locator("svg").evaluate((s) => s.getBoundingClientRect().width === 16));
  ok("number input: the buttons are 28 and sit at the right edge", await d.locator(".affix").evaluate((a) => { const u = a.querySelector(".up").getBoundingClientRect(), n = a.querySelector(".down").getBoundingClientRect(), r = a.getBoundingClientRect(); return u.width === 28 && u.height === 28 && Math.abs(r.right - u.right - 7) < 1 && Math.abs(u.left - n.right - 2) < 0.5; }));
  ok("number input: the frame is 40 high like a text field", (await d.locator(".affix").evaluate((a) => a.getBoundingClientRect().height)) === 40);
  await d.evaluate((f) => { f.style.width = "60px"; f.style.minWidth = "0"; });
  ok("number input: the buttons keep their width in a narrow field", (await up.evaluate((b) => b.getBoundingClientRect().width)) === 28);
  await d.evaluate((f) => { f.style.width = "280px"; f.style.minWidth = ""; });
  await i.focus(); await page.keyboard.press("Tab"); await wait(30);
  ok("number input: Tab skips the buttons", !(await d.evaluate((f) => f.contains(document.activeElement))));

  await i.evaluate((e) => { window._ev = []; e.addEventListener("input", () => window._ev.push("input")); e.addEventListener("change", () => window._ev.push("change")); });
  await up.click(); await wait(20);
  ok("number input: the plus button adds a step", (await i.inputValue()) === "31");
  ok("number input: a button press fires input and change", (await page.evaluate(() => window._ev.join())) === "input,change");
  ok("number input: a button press leaves the focus on the input", await i.evaluate((e) => document.activeElement === e));
  ok("number input: the spoken value follows", (await i.getAttribute("aria-valuetext")) === "31분");
  await down.click(); await wait(20);
  ok("number input: the minus button takes a step off", (await i.inputValue()) === "30");
  await page.keyboard.press("ArrowUp"); await page.keyboard.press("ArrowUp"); await wait(20);
  ok("number input: ArrowUp adds a step", (await i.inputValue()) === "32");
  await page.keyboard.press("ArrowDown"); await wait(20);
  ok("number input: ArrowDown takes a step off", (await i.inputValue()) === "31" && (await i.getAttribute("aria-valuetext")) === "31분");

  /* 범위 끝 */
  await i.fill("1439"); await wait(20);
  await up.click(); await wait(20);
  ok("number input: reaching the top turns the plus button off", (await i.inputValue()) === "1440" && (await up.isDisabled()) && !(await down.isDisabled()));
  ok("number input: the focus survives the button turning off", await i.evaluate((e) => document.activeElement === e));
  await page.keyboard.press("ArrowUp"); await wait(20);
  ok("number input: the arrow stops at the top", (await i.inputValue()) === "1440");
  await i.fill("5"); await wait(20);
  ok("number input: at the bottom only the minus button is off", (await down.isDisabled()) && !(await up.isDisabled()));
  ok("number input: an off button uses the disable colour", (await down.evaluate((b) => getComputedStyle(b).color)) === (await color("--foreground-disable-primary")));
  await up.hover(); await wait(30);
  ok("number input: an active button shows its hover surface", (await up.evaluate((b) => getComputedStyle(b).backgroundColor)) === (await color("--surface-neutral-secondary", "backgroundColor")));
  await page.mouse.down(); await wait(30);
  ok("number input: a pressed button shows its pressed surface", (await up.evaluate((b) => getComputedStyle(b).backgroundColor)) === (await color("--surface-neutral-strong", "backgroundColor")));
  await page.mouse.move(4, 500); await page.mouse.up(); await wait(20);
  await down.hover(); await wait(30);
  ok("number input: an off button shows no hover", (await down.evaluate((b) => getComputedStyle(b).backgroundColor)) === "rgba(0, 0, 0, 0)");
  await page.mouse.move(4, 500);

  /* 빈 값 */
  await i.fill(""); await wait(20);
  ok("number input: an empty field keeps both buttons on and drops the spoken value", !(await up.isDisabled()) && !(await down.isDisabled()) && (await i.getAttribute("aria-valuetext")) === null);
  await up.click(); await wait(20);
  ok("number input: stepping from empty starts inside the range", (await i.inputValue()) === "5");
  await i.fill(""); await blur();
  ok("number input: leaving it empty outside a form is quiet", !(await d.evaluate((f) => f.classList.contains("error"))));
  await i.evaluate((e) => { e.required = true; }); await i.focus(); await blur();
  ok("number input: an empty required value outside a form is left to the form", !(await d.evaluate((f) => f.classList.contains("error"))));
  await i.evaluate((e) => { e.required = false; });

  /* 범위 밖 — 받고 알린다 */
  await i.fill("9999"); await wait(20);
  ok("number input: an out-of-range value is kept as typed", (await i.inputValue()) === "9999");
  ok("number input: no error while still typing", !(await d.evaluate((f) => f.classList.contains("error"))));
  await blur();
  ok("number input: leaving shows the range error", (await help.textContent()) === "값이 너무 큽니다. 1440 이하 입력하세요." && (await d.evaluate((f) => f.classList.contains("error"))) && (await i.getAttribute("aria-invalid")) === "true");
  ok("number input: the value is not corrected on leaving", (await i.inputValue()) === "9999");
  ok("number input: past the top only the minus button works", (await up.isDisabled()) && !(await down.isDisabled()));
  await down.click(); await wait(20);
  ok("number input: stepping down from past the top lands on the top and clears", (await i.inputValue()) === "1440" && !(await d.evaluate((f) => f.classList.contains("error"))) && (await help.textContent()) === orig);
  await i.fill("1"); await blur();
  ok("number input: below the range says so", (await help.textContent()) === "값이 너무 작습니다. 5 이상 입력하세요.");
  await i.fill("6"); await wait(20);
  ok("number input: fixing the value clears the error at once", !(await d.evaluate((f) => f.classList.contains("error"))) && (await help.textContent()) === orig);
  await i.fill(""); await i.focus(); await page.keyboard.type("e"); await blur();
  ok("number input: non-numeric text says so", (await help.textContent()) === "숫자가 아닙니다. 숫자를 입력하세요.", await help.textContent());

  /* 간격 */
  await go("components/number-input.html");
  const s = parts(field("step", 0)), dec = parts(field("step", 1));
  await s.up.click(); await wait(20);
  ok("number input: step moves by its size", (await s.i.inputValue()) === "15" && (await s.i.getAttribute("aria-valuetext")) === "15초");
  await s.i.fill("7"); await wait(20);
  await s.up.click(); await wait(20);
  ok("number input: an off-step value snaps to the next step", (await s.i.inputValue()) === "10");
  await s.i.fill("7"); await blur();
  ok("number input: an off-step value left alone is an error", (await s.help.textContent()) === "입력할 수 없는 값입니다. 5 단위로 입력하세요.");
  for (let n = 0; n < 3; n++) await dec.up.click();
  await wait(20);
  ok("number input: a decimal step adds without float noise", (await dec.i.inputValue()) === "81.5", await dec.i.inputValue());

  /* 정적 오류 · 비활성 */
  const e = field("error"), ep = parts(e);
  ok("number input: a set error is marked and past the top", (await ep.i.getAttribute("aria-invalid")) === "true" && (await ep.up.isDisabled()) && !(await ep.down.isDisabled()) && (await ep.i.inputValue()) === "500");
  const off = parts(field("disabled"));
  ok("number input: disabled turns off the input and both buttons", (await off.i.isDisabled()) && (await off.down.isDisabled()) && (await off.up.isDisabled()));

  /* 폼 */
  const form = page.locator("#ex-number-input-form form"), ff = form.locator(".number-field"), fp = parts(ff), save = form.locator("button[type=submit]");
  await form.scrollIntoViewIfNeeded();
  await page.evaluate(() => { window._s = 0; document.addEventListener("submit", (x) => { x.preventDefault(); window._s++; }); });
  await fp.i.focus(); await blur();
  ok("number input form: passing an untouched field is quiet", !(await ff.evaluate((f) => f.classList.contains("error"))));
  await save.click(); await wait(30);
  ok("number input form: an empty required value blocks and focuses", (await fp.help.textContent()) === "필수 항목입니다. 값을 입력하세요." && (await page.evaluate(() => window._s)) === 0 && (await fp.i.evaluate((x) => document.activeElement === x)));
  await fp.i.fill("501"); await save.click(); await wait(30);
  ok("number input form: an out-of-range value blocks with the range message", (await fp.help.textContent()) === "값이 너무 큽니다. 500 이하 입력하세요." && (await page.evaluate(() => window._s)) === 0 && (await fp.i.inputValue()) === "501");
  await fp.down.click(); await wait(30);
  ok("number input form: stepping back into range clears the error", !(await ff.evaluate((f) => f.classList.contains("error"))));
  await save.click(); await wait(30);
  ok("number input form: a value in range submits", (await page.evaluate(() => window._s)) === 1);

  /* 옮겨 온 자리 */
  await go("patterns/input-form.html");
  const pat = page.locator(".number-field").first();
  ok("number input: the input form pattern uses the component", (await page.locator('input[type=number]').count()) === (await page.locator('.number-field input[type=number]').count()) && (await pat.locator(".num-btn").count()) === 2);
};
