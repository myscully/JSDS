/* 게이트를 한 번에 돌리고 한 줄로 보고한다.
 *
 *   node _build/gates.mjs            전부 돌리고 요약
 *   node _build/gates.mjs --quick    사이트만(build+verify+contrast) — React 테스트는 건너뜀
 *
 * 왜 있나: 매번 같은 네 숫자를 손으로 긁어 옮겼다. 긁다가 틀리면 "통과했다"가 거짓이 된다.
 * 여기서 뽑으면 출력이 곧 근거다. 하나라도 어긋나면 exit 1.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..");
const quick = process.argv.includes("--quick");

/* CI(환경변수 CI=true)에서는 vitest 가 파이프로도 색 코드를 찍는다 — 숫자를 뽑기 전에 걷어낸다 */
const plain = (t) => t.replace(/\x1b\[[0-9;]*m/g, "");
const run = (cmd, args, cwd) => {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return { code: r.status, out: plain((r.stdout || "") + (r.error ? String(r.error) : "")), err: plain(r.stderr || "") };
};
const pick = (text, re) => { const m = text.match(re); return m ? m.slice(1) : null; };

const fail = [], line = [];

/* 1) build — verify 와 contrast 를 안에서 돌린다 */
const build = run("node", ["_build/build.js"], ROOT);
const all = build.out + build.err;
if (build.code !== 0) fail.push("build 가 실패했습니다\n" + all.trim().split("\n").slice(-12).join("\n"));
const pages = pick(all, /pages:?\s*(\d+)/);
const contrast = pick(all, /쌍 (\d+)건 측정 · 실패 (\d+) · 경고 (\d+)/);
const verify = pick(all, /verify: 실패 (\d+) · 경고 (\d+)/);
if (pages) line.push(`pages ${pages[0]}`);
if (verify) {
  line.push(`verify ${verify[0]}/${verify[1]}`);
  if (+verify[0] > 0) fail.push(`verify 실패 ${verify[0]}건\n` + all.split("\n").filter((l) => l.includes("✗")).slice(0, 12).join("\n"));
} else fail.push("verify 결과를 읽지 못했습니다");
if (contrast) {
  line.push(`contrast ${contrast[0]}쌍 실패 ${contrast[1]} · advisory ${contrast[2]}`);
  if (+contrast[1] > 0) fail.push(`contrast 실패 ${contrast[1]}건`);
} else fail.push("contrast 결과를 읽지 못했습니다");

/* 2) behave — 브라우저 단정 */
const behave = run("node", ["_build/behave.js"], ROOT);
const bAll = behave.out + behave.err;
const bScore = pick(bAll, /(\d+)\/(\d+) passed/);
if (bScore) {
  line.push(`behave ${bScore[0]}/${bScore[1]}`);
  if (bScore[0] !== bScore[1]) fail.push("behave 실패:\n" + bAll.split("\n").filter((l) => l.startsWith("FAIL")).join("\n"));
} else fail.push("behave 결과를 읽지 못했습니다");

/* 3) React 테스트 */
if (!quick) {
  const vt = run("npm", ["test"], path.join(ROOT, "_react"));
  const vAll = vt.out + vt.err;
  const t = pick(vAll, /Tests\s+(\d+) passed(?: \| (\d+) skipped)?/);
  if (t) {
    line.push(`react ${t[0]}${t[1] ? "+" + t[1] : ""}`);
    if (vt.code !== 0) fail.push("react 테스트 실패:\n" + vAll.split("\n").filter((l) => /FAIL|✗|AssertionError/.test(l)).slice(0, 12).join("\n"));
  } else fail.push("react 테스트 결과를 읽지 못했습니다\n" + vAll.trim().split("\n").slice(-8).join("\n"));
}

console.log(line.join(" · "));
if (fail.length) {
  console.log("");
  for (const f of fail) console.log("✗ " + f);
  process.exit(1);
}
