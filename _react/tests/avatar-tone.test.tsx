/* Avatar 색(2026-11-16) — 이름으로 정하는 tone 1~6 이 사이트 ds.js · 빌드 lib.js(render.js 가 씀) · React 에서 같은지.
   한쪽만 식을 바꾸면 같은 사람이 사이트와 제품에서 다른 색이 된다 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { render } from "@testing-library/react";
import { avatarTone, Avatar } from "../src";

const read = (p: string) => fs.readFileSync(path.resolve(__dirname, p), "utf8");
function fn(text: string, re: RegExp): (n: string) => number {
  const m = text.match(re);
  if (!m) throw new Error(`식을 찾지 못함 ${re}`);
  return new Function(`${m[0]}; return avatarTone;`)();
}
const site = fn(read("../../_build/ds.src.js"), /function avatarTone\(name\) \{[^\n]*\}/);
const build = fn(read("../../_build/lib.js"), /const avatarTone = \(name\) => \{[^\n]*\};/);
const NAMES = ["김민준", "이서연", "박지호", "최유나", "정하준", "강서윤", "정희", "JH", "Alex Kim", "  이서연 ", "😀가", "", "𠀀길동"];

describe("avatarTone", () => {
  it("사이트 · 빌드 · React 가 같은 tone", () => {
    for (const n of NAMES) {
      const r = avatarTone(n);
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThanOrEqual(6);
      expect([n, site(n)]).toEqual([n, r]);
      expect([n, build(n)]).toEqual([n, r]);
    }
  });
  it("Avatar 는 name → aria-label → 이니셜 순으로 정하고 tone 이 이긴다", () => {
    const { container } = render(<>
      <Avatar initials="이" name="이서연" />
      <Avatar initials="김" aria-label="김민준" role="img" />
      <Avatar initials="JH" />
      <Avatar initials="JH" tone={6} />
    </>);
    const t = [...container.querySelectorAll(".avatar")].map((e) => Number(e.getAttribute("data-tone")));
    expect(t).toEqual([avatarTone("이서연"), avatarTone("김민준"), avatarTone("JH"), 6]);
    expect(container.querySelector(".avatar")!.getAttribute("data-name")).toBe("이서연");
  });
});
