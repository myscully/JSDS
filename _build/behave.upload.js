/* File Upload 동작 검사(2026-11-10). behave.js 가 부른다 */
module.exports = async function upload({ page, ok, go }) {
  const wait = (ms) => page.waitForTimeout(ms);
  const file = (name, size = 2048, mimeType = "application/octet-stream") => ({ name, mimeType, buffer: Buffer.alloc(size, 65) });
  const box = (id) => page.locator(`#ex-file-upload-${id} .upload`).first();
  const input = (l) => l.locator("input[type=file]");
  const names = (l) => l.locator(".upload-item .name").allTextContents();
  const color = (name) => page.evaluate((n) => { const d = document.createElement("div"); d.style.color = `var(${n})`; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; }, name);
  /* 덩어리(part)마다 던지면 그 덩어리의 실패로 남기고 다음으로 간다 — behave.part.js(2026-11-14). 덩어리를 넘어 쓰는 변수는 아래 let 에 둔다 */
  const part = require("./behave.part")(ok, "behave.upload", () => page);
  let listen, log, clear, drop, onChooser, chooser, focused, emptied, d, m, c, s, off, clicks,
      fu, help, save, fresh, fHelp, fField, fSave;
  await part("1 · 이 요소에서 난 이벤트를 모은다", async () => {
    /* 이 요소에서 난 이벤트를 모은다 */
    listen = (l) => l.evaluate((h) => { h._log = []; ["ds:upload", "ds:upload-remove", "ds:upload-retry"].forEach((n) => h.addEventListener(n, (e) => h._log.push([n, e.detail]))); });
    log = (l) => l.evaluate((h) => h._log.map(([n, d]) => [n, d.files ? d.files.map((f) => f.file.name) : d.file && d.file.name]));
    clear = (l) => l.evaluate((h) => { h._log.length = 0; });
    drop = (l, kind, files) => l.locator(".upload-zone").evaluate((z, a) => { const dt = new DataTransfer(); a.files.forEach((f) => dt.items.add(new File([new Uint8Array(f.size).fill(65)], f.name))); const e = new DragEvent(a.kind, { bubbles: true, cancelable: true, dataTransfer: dt }); z.dispatchEvent(e); return e.defaultPrevented; }, { kind, files });
    let opened = 0; onChooser = () => { opened++; };
    page.on("filechooser", onChooser);
    chooser = async (fn) => { const n = opened; await fn(); for (let i = 0; i < 20 && opened === n; i++) await wait(50); return opened > n; };
    focused = () => page.evaluate(() => { const a = document.activeElement; return a.getAttribute("aria-label") || a.textContent.trim(); });
    emptied = async (l) => { for (const b of await l.locator(".upload-item .remove").all()) { await l.locator(".upload-item .remove").first().click(); } };
  });
  await part("2 · components/file-upload.html", async () => {

    await go("components/file-upload.html");
  });
  await part("3 · 여는 길", async () => {

    /* ── 여는 길 ── */
    d = box("default");
    await d.scrollIntoViewIfNeeded();
    const pick = d.locator(".upload-pick");
    ok("file upload: the pick button is named by the field label", (await page.evaluate((id) => document.getElementById(id).getAttribute("aria-labelledby"), await pick.getAttribute("id"))).split(" ").length === 2 && (await pick.evaluate((b) => b.getAttribute("aria-labelledby").split(" ").map((i) => document.getElementById(i).textContent).join(" "))) === "인증서 파일 선택");
    ok("file upload: the file input is out of the tab order", await input(d).evaluate((i) => i.hidden && getComputedStyle(i).display === "none"));
    ok("file upload: clicking the zone opens the file dialog", await chooser(() => d.locator(".upload-msg").click()));
    ok("file upload: clicking the button opens the file dialog", await chooser(() => pick.click()));
    await pick.focus();
    ok("file upload: Enter on the button opens the file dialog", await chooser(() => page.keyboard.press("Enter")));
  });
  await part("4 · 흐름", async () => {

    /* ── 흐름 ── */
    await listen(d);
    await input(d).setInputFiles(file("a.pem"));
    await wait(30);
    ok("file upload: a chosen file becomes a row and fires ds:upload", (await names(d)).join() === "a.pem" && JSON.stringify(await log(d)) === '[["ds:upload",["a.pem"]]]', JSON.stringify(await log(d)));
    ok("file upload: the row shows the file size", (await d.locator(".upload-item .size").textContent()) === "2 KB");
    ok("file upload: adding is announced", (await d.locator(".upload-status").textContent()) === "파일 1개를 추가했습니다.");
    await page.waitForSelector("#ex-file-upload-default .upload-item.uploading", { timeout: 1500 });
    ok("file upload: uploading shows a progress bar", (await d.locator(".upload-item .progress[role=progressbar]").getAttribute("aria-label")) === "a.pem 전송");
    await d.locator(".upload-item .remove").focus();
    await page.waitForSelector("#ex-file-upload-default .upload-item.done", { timeout: 2500 });
    ok("file upload: finishing keeps the focus on the row", (await focused()) === "a.pem 지우기");
    ok("file upload: a finished row has no progress bar and says done", (await d.locator(".upload-item .progress").count()) === 0 && (await d.locator(".upload-item .sr-only").textContent()).includes("완료"));
    ok("file upload: the done icon is the positive colour", (await d.locator(".upload-item .ico").evaluate((e) => getComputedStyle(e).color)) === (await color("--foreground-positive-primary")));

    await clear(d);
    await input(d).setInputFiles(file("b.crt", 1024));
    await wait(30);
    ok("file upload: a single upload replaces the old file", (await names(d)).join() === "b.crt" && JSON.stringify(await log(d)) === '[["ds:upload-remove","a.pem"],["ds:upload",["b.crt"]]]', JSON.stringify(await log(d)));
    await d.locator(".upload-item .remove").click();
    await wait(30);
    ok("file upload: removing the last file moves the focus to the button and drops the list", (await focused()) === "파일 선택" && (await d.locator(".upload-list").count()) === 0);
    ok("file upload: removing is announced", (await d.locator(".upload-status").textContent()) === "b.crt 파일을 지웠습니다.");
    await clear(d);
    await input(d).setInputFiles(file("b.crt", 1024));
    await wait(30);
    ok("file upload: the same file can be chosen again", (await names(d)).join() === "b.crt" && (await log(d)).length === 1 && (await input(d).inputValue()) === "");
    await d.locator(".upload-item .remove").click();
  });
  await part("5 · 거절", async () => {

    /* ── 거절 ── */
    await clear(d);
    await input(d).setInputFiles(file("note.txt"));
    await wait(30);
    const rej = d.locator(".upload-item");
    ok("file upload: a wrong type stays as an error row and is not sent", (await rej.getAttribute("class")).includes("error") && (await log(d)).length === 0);
    ok("file upload: the wrong-type message names the types", (await rej.locator(".msg").textContent()) === "올릴 수 없는 형식입니다. .pem, .crt 파일을 고르세요.");
    ok("file upload: a rejected row has remove but no retry", (await rej.locator(".retry").count()) === 0 && (await rej.locator(".remove").count()) === 1);
    ok("file upload: rejection is announced", (await d.locator(".upload-status").textContent()) === "1개는 올릴 수 없습니다. 파일 목록에서 이유를 확인하세요.");
    ok("file upload: the error text uses negative-strong", (await rej.locator(".msg").evaluate((e) => getComputedStyle(e).color)) === (await color("--foreground-negative-strong")));
    await clear(d);
    await rej.locator(".remove").click(); await wait(20);
    ok("file upload: removing a rejected row fires no remove event", (await log(d)).length === 0);
    await input(d).setInputFiles(file("big.pem", 6 * 1024 * 1024));
    await wait(30);
    ok("file upload: over the size limit is rejected", (await d.locator(".upload-item .msg").textContent()) === "파일이 너무 큽니다. 5MB 이하 파일을 고르세요.");
    await d.locator(".upload-item .remove").click(); await wait(20);
    await input(d).setInputFiles(file("empty.pem", 0));
    await wait(30);
    ok("file upload: an empty file is rejected", (await d.locator(".upload-item .msg").textContent()) === "빈 파일입니다. 내용이 있는 파일을 고르세요.");
    await d.locator(".upload-item .remove").click(); await wait(20);
  });
  await part("6 · 여러 개", async () => {

    /* ── 여러 개 ── */
    m = box("multiple");
    await m.scrollIntoViewIfNeeded();
    await listen(m);
    await input(m).setInputFiles([file("bad.exe"), file("one.csv"), file("two.txt")]);
    await wait(30);
    ok("file upload: passing files are taken and rejected ones go last", (await names(m)).join() === "one.csv,two.txt,bad.exe" && JSON.stringify(await log(m)) === '[["ds:upload",["one.csv","two.txt"]]]', (await names(m)).join());
    ok("file upload: mixed results are announced together", (await m.locator(".upload-status").textContent()) === "파일 2개를 추가했습니다. 1개는 올릴 수 없습니다. 파일 목록에서 이유를 확인하세요.");
    await page.waitForSelector("#ex-file-upload-multiple .upload-item:nth-child(1) .retry", { timeout: 2500 });
    const first = m.locator(".upload-item").first();
    ok("file upload: a failed send has retry and remove named by the file", (await first.locator(".retry").getAttribute("aria-label")) === "one.csv 다시 시도" && (await first.locator(".remove").getAttribute("aria-label")) === "one.csv 지우기");
    ok("file upload: a failed send uses the default message", (await first.locator(".msg").textContent()) === "전송하지 못했습니다. 다시 시도하세요.");
    await clear(m);
    await first.locator(".retry").click(); await wait(30);
    ok("file upload: retry fires the event and moves the focus to remove", JSON.stringify(await log(m)) === '[["ds:upload-retry","one.csv"]]' && (await focused()) === "one.csv 지우기");
    ok("file upload: retry clears the error from the row", (await first.locator(".msg").count()) === 0 && (await first.locator(".retry").count()) === 0);
    await page.waitForSelector("#ex-file-upload-multiple .upload-item:nth-child(1).done", { timeout: 2500 });
    await page.waitForSelector("#ex-file-upload-multiple .upload-item:nth-child(2) .retry", { timeout: 2500 });
    await clear(m);
    await input(m).setInputFiles(file("one.csv"));
    await wait(30);
    ok("file upload: a duplicate is rejected", (await m.locator(".upload-item").last().locator(".msg").textContent()) === "이미 추가한 파일입니다. 다른 파일을 고르세요." && (await log(m)).length === 0);
    await input(m).setInputFiles([file("c.csv", 11), file("d.csv", 12), file("e.csv", 13), file("f.csv", 14)]);
    await wait(30);
    ok("file upload: over the file count is rejected", (await m.locator(".upload-item[data-rejected] .msg").last().textContent()) === "파일이 너무 많습니다. 5개까지 올릴 수 있습니다." && (await m.locator(".upload-item:not([data-rejected])").count()) === 5, (await names(m)).join());
  });
  await part("7 · 지운 뒤 포커스 — 다음 줄, 끝이면 앞 줄", async () => {
    /* 지운 뒤 포커스 — 다음 줄, 끝이면 앞 줄 */
    const before = await names(m);
    await m.locator(".upload-item").nth(1).locator(".remove").focus();
    await page.keyboard.press("Enter"); await wait(30);
    ok("file upload: removing moves the focus to the next row", (await focused()) === `${before[2]} 지우기`, await focused());
    const n2 = await names(m);
    await m.locator(".upload-item").last().locator(".remove").focus();
    await page.keyboard.press("Enter"); await wait(30);
    ok("file upload: removing the last row moves the focus to the previous one", (await focused()) === `${n2[n2.length - 2]} 지우기`, await focused());
    await emptied(m);
  });
  await part("8 · 끌어다 놓기", async () => {

    /* ── 끌어다 놓기 ── */
    const types = await m.locator(".upload-zone").evaluate((z) => { const dt = new DataTransfer(); dt.items.add(new File(["a"], "x.csv")); const e = new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: dt }); z.dispatchEvent(e); const h = z.parentNode, s = getComputedStyle(z); return { p: e.defaultPrevented, on: h.classList.contains("dragging"), bg: s.backgroundColor, border: s.borderTopColor }; });
    ok("file upload: dragging a file marks the zone", types.p && types.on && types.bg === (await m.page().evaluate(() => { const d = document.createElement("div"); d.style.backgroundColor = "var(--surface-brand-subtle)"; document.body.append(d); const c = getComputedStyle(d).backgroundColor; d.remove(); return c; })), JSON.stringify(types));
    const left = await m.locator(".upload-zone").evaluate((z) => { const dt = new DataTransfer(); dt.items.add(new File(["a"], "x.csv")); z.dispatchEvent(new DragEvent("dragleave", { bubbles: true, dataTransfer: dt, relatedTarget: document.body })); return z.parentNode.classList.contains("dragging"); });
    ok("file upload: leaving the zone clears the mark", left === false);
    const text = await m.locator(".upload-zone").evaluate((z) => { const e = new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() }); z.dispatchEvent(e); return e.defaultPrevented || z.parentNode.classList.contains("dragging"); });
    ok("file upload: dragging something that is not a file does nothing", text === false);
    await clear(m);
    await drop(m, "dragenter", [{ name: "drop.csv", size: 10 }]);
    await drop(m, "drop", [{ name: "drop.csv", size: 10 }]);
    await wait(30);
    ok("file upload: dropping adds the file", (await names(m)).join() === "drop.csv" && (await log(m))[0][1].join() === "drop.csv" && !(await m.evaluate((h) => h.classList.contains("dragging"))));
    await page.waitForSelector("#ex-file-upload-multiple .upload-item .retry", { timeout: 2500 });
    await emptied(m);
  });
  await part("9 · 모양", async () => {

    /* ── 모양 ── */
    c = box("compact");
    ok("file upload: compact has only the button", (await c.locator(".ico").count()) === 0 && (await c.locator(".upload-msg").count()) === 0 && (await c.locator(".upload-zone").evaluate((z) => getComputedStyle(z).borderTopStyle)) === "none");
    await drop(c, "drop", [{ name: "s.sig", size: 10 }]);
    await wait(30);
    ok("file upload: compact still takes a drop", (await names(c)).join() === "s.sig");
    await c.locator(".upload-item .remove").click();

    s = box("states");
    await s.scrollIntoViewIfNeeded();
    ok("file upload: the states example shows all five rows", (await s.locator(".upload-item").count()) === 5 && (await s.locator(".upload-item.uploading .progress i").evaluate((i) => i.style.width)) === "60%");
    ok("file upload: only the failed send has retry", (await s.locator(".retry").count()) === 1 && (await s.locator(".upload-item[data-rejected] .retry").count()) === 0);
    await s.evaluate((h) => { h.style.width = "320px"; h.querySelector(".upload-item .name").textContent = "a".repeat(200) + ".log"; });
    const wrap = await s.locator(".upload-item").first().evaluate((li) => ({ over: li.scrollWidth - li.clientWidth, sizeW: li.querySelector(".size").getBoundingClientRect().width, nameLines: li.querySelector(".name").getBoundingClientRect().height }));
    ok("file upload: a long file name wraps instead of overflowing", wrap.over <= 0 && wrap.nameLines > 30 && wrap.sizeW > 20, JSON.stringify(wrap));
  });
  await part("10 · 비활성", async () => {

    /* ── 비활성 ── */
    off = box("disabled");
    await off.scrollIntoViewIfNeeded();
    ok("file upload: disabled does not open the dialog", !(await chooser(() => off.locator(".upload-msg").click())));
  });
  await part("11 · 클래스만 있어도 열지 않는다 · 영역을 누르면 input.click 은 한 번만", async () => {
    /* 클래스만 있어도 열지 않는다 · 영역을 누르면 input.click 은 한 번만 */
    clicks = async (l) => { await input(l).evaluate((i) => { i._n = 0; i.addEventListener("click", (e) => { e.preventDefault(); i._n++; }); const c = i.click; i.click = function () { i._calls = (i._calls || 0) + 1; c.call(i); }; i.disabled = false; }); await l.locator(".upload-msg").click(); await wait(20); return input(l).evaluate((i) => i._calls || 0); };
    ok("file upload: the disabled class alone keeps the dialog shut", (await clicks(off)) === 0);
    await input(off).evaluate((i) => { i.disabled = true; });
    const dragOff = await off.locator(".upload-zone").evaluate((z) => { const dt = new DataTransfer(); dt.items.add(new File(["a"], "x.pem")); const e = new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: dt }); z.dispatchEvent(e); return e.defaultPrevented || z.parentNode.classList.contains("dragging"); });
    ok("file upload: dragging over a disabled zone does nothing", dragOff === false);
    ok("file upload: disabled disables the button and uses the disable tokens", (await off.locator(".upload-pick").isDisabled()) && (await off.locator(".upload-zone").evaluate((z) => getComputedStyle(z).color)) === (await color("--foreground-disable-primary")));
    await drop(off, "drop", [{ name: "x.pem", size: 10 }]);
    await wait(30);
    ok("file upload: disabled ignores a drop", (await off.locator(".upload-item").count()) === 0);
  });
  await part("12 · 폼", async () => {

    /* ── 폼 ── */
    const form = page.locator("#ex-file-upload-form form");
    fu = form.locator(".upload"); const field = form.locator(".field"); help = field.locator("> .help");
    save = form.locator("button[type=submit]");
    await form.scrollIntoViewIfNeeded();
    const orig = await help.textContent();
    await page.evaluate(() => { window._submits = 0; document.addEventListener("submit", (e) => { e.preventDefault(); window._submits++; }); });
    await save.click(); await wait(30);
    ok("file upload form: submitting empty blocks and says so", (await help.textContent()) === "고른 파일이 없습니다. 파일을 선택하세요." && (await field.evaluate((f) => f.classList.contains("error"))) && (await page.evaluate(() => window._submits)) === 0);
    ok("file upload form: the first error focuses the pick button", (await page.evaluate(() => document.activeElement.classList.contains("upload-pick"))));
    ok("file upload form: the button is marked invalid", (await fu.locator(".upload-pick").getAttribute("aria-invalid")) === "true");
    await wait(200);   // border-color 전환이 끝난 뒤
    ok("file upload form: the zone border turns negative", (await fu.locator(".upload-zone").evaluate((z) => getComputedStyle(z).borderTopColor)) === (await color("--foreground-negative-primary")));
    await input(fu).setInputFiles(file("ok.pem"));
    await wait(30);
    ok("file upload form: choosing a file clears the error at once", (await help.textContent()) === orig && !(await field.evaluate((f) => f.classList.contains("error"))));
    await page.waitForSelector("#ex-file-upload-form .upload-item.uploading", { timeout: 1500 });
    ok("file upload form: a running upload does not turn the field red", !(await field.evaluate((f) => f.classList.contains("error"))));
    await save.click(); await wait(30);
    ok("file upload form: submitting while sending is blocked", (await help.textContent()) === "파일을 전송하고 있습니다. 끝난 뒤 다시 저장하세요." && (await page.evaluate(() => window._submits)) === 0);
    await page.waitForSelector("#ex-file-upload-form .upload-item.done", { timeout: 2500 });
    await wait(30);
    ok("file upload form: the block lifts when the upload finishes", !(await field.evaluate((f) => f.classList.contains("error"))));
    await save.click(); await wait(30);
    ok("file upload form: a finished upload submits", (await page.evaluate(() => window._submits)) === 1);
  });
  await part("13 · 실패 · 거절이 남으면 막는다", async () => {
    /* 실패 · 거절이 남으면 막는다 */
    await fu.evaluate((h) => window.DS.upload.fail(h, h.querySelector(".upload-item").dataset.id, "서버가 거부했습니다. 다시 시도하세요."));
    await wait(30);
    ok("file upload form: fail() takes a product message", (await fu.locator(".upload-item .msg").textContent()) === "서버가 거부했습니다. 다시 시도하세요.");
    await save.click(); await wait(30);
    ok("file upload form: a failed file blocks the submit", (await help.textContent()) === "올리지 못한 파일이 있습니다. 지우거나 다시 시도하세요." && (await page.evaluate(() => window._submits)) === 1);
    await fu.locator(".upload-item .remove").click(); await wait(30);
    ok("file upload form: removing the last required file warns at once", (await help.textContent()) === "고른 파일이 없습니다. 파일을 선택하세요.");
    await input(fu).setInputFiles(file("bad.txt"));
    await wait(30);
    await save.click(); await wait(30);
    ok("file upload form: a rejected file blocks the submit too", (await help.textContent()) === "올리지 못한 파일이 있습니다. 지우거나 다시 시도하세요." && (await page.evaluate(() => window._submits)) === 1);
    await fu.locator(".upload-item .remove").click(); await wait(30);
  });
  await part("14 · components/file-upload.html", async () => {

    /* 제출 전에 마지막 필수 파일을 지우면 바로 알린다 */
    await go("components/file-upload.html");
    fresh = page.locator("#ex-file-upload-form .upload"); fHelp = page.locator("#ex-file-upload-form .field > .help"); fField = page.locator("#ex-file-upload-form .field"); fSave = page.locator("#ex-file-upload-form button[type=submit]");
    await page.evaluate(() => document.addEventListener("submit", (e) => e.preventDefault()));
    await fresh.evaluate((h) => h.removeAttribute("data-demo"));
    await input(fresh).setInputFiles(file("ok.pem")); await wait(20);
    await fresh.locator(".upload-item .remove").click(); await wait(20);
    ok("file upload form: removing the last file warns even before a submit", (await fHelp.textContent()) === "고른 파일이 없습니다. 파일을 선택하세요.");
  });
  await part("15 · 진행률 API · 다른 파일이 전송 중일 때의 오류 표시", async () => {
    /* 진행률 API · 다른 파일이 전송 중일 때의 오류 표시 */
    await input(fresh).evaluate((i) => { i.multiple = true; });
    await fSave.click(); await wait(20);
    await input(fresh).setInputFiles([file("a.pem", 10), file("b.pem", 11)]); await wait(20);
    const ids = await fresh.locator(".upload-item").evaluateAll((l) => l.map((li) => li.dataset.id));
    const api = (fn, id, v) => fresh.evaluate((h, a) => window.DS.upload[a.fn](h, a.id, a.v), { fn, id, v });
    await api("progress", ids[0], 42); await wait(20);
    const barNow = fresh.locator(".upload-item").first().locator(".progress");
    ok("file upload: progress() moves the bar", (await barNow.getAttribute("aria-valuenow")) === "42" && (await barNow.locator("i").evaluate((i) => i.style.width)) === "42%");
    await api("done", ids[1]); await wait(20);
    ok("file upload form: another file still sending does not turn the field red", !(await fField.evaluate((f) => f.classList.contains("error"))));
    await fSave.click(); await wait(20);
    const busyText = "파일을 전송하고 있습니다. 끝난 뒤 다시 저장하세요.";
    await api("done", ids[1]); await wait(20);
    ok("file upload form: the blocked-submit notice stays until sending ends", (await fHelp.textContent()) === busyText);
    await api("done", ids[0]); await wait(20);
    ok("file upload form: the notice goes when sending ends", !(await fField.evaluate((f) => f.classList.contains("error"))));
  });
  await part("16 · components/file-upload.html", async () => {

    /* 문구 바꾸기 · 건드리지 않은 필드 */
    await go("components/file-upload.html");
    const f2 = page.locator("#ex-file-upload-form .field");
    await page.locator("#ex-file-upload-form .upload-pick").focus();
    await page.keyboard.press("Tab"); await wait(30);
    ok("file upload form: tabbing past an untouched field stays quiet", !(await f2.evaluate((f) => f.classList.contains("error"))));
    ok("file upload: clicking the zone calls the input once", (await clicks(box("multiple"))) === 1);
    const b2 = box("default");
    await b2.evaluate((h) => h.setAttribute("data-messages", JSON.stringify({ fileSize: "Too large. Up to {max}." })));
    await input(b2).setInputFiles(file("big.pem", 6 * 1024 * 1024));
    await wait(30);
    ok("file upload: data-messages replaces the text", (await b2.locator(".upload-item .msg").textContent()) === "Too large. Up to 5MB.");
    page.off("filechooser", onChooser);
  });
};
