/* 일본어 한자용 Pretendard JP(2026-11-14) — 선택 파일 dist/font-jp.css 와 조각이 패키지에 같이 나가는지. sync-css.mjs 가 만든다(npm test 가 gen 을 먼저 돈다) */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const dist = (p: string) => path.join(ROOT, "dist", p);

describe("font-jp.css", () => {
  it("조각마다 Pretendard JP · unicode-range · 파일이 있고, style.css 의 서체 순서가 Pretendard 바로 뒤에 Pretendard JP 를 둔다", () => {
    const css = fs.readFileSync(dist("font-jp.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const faces = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
    const src = fs.readFileSync(path.join(ROOT, "..", "_build", "font-jp.src.css"), "utf8").match(/@font-face\s*\{/g) ?? [];
    expect(faces.length).toBeGreaterThan(0);
    expect(faces.length).toBe(src.length);
    for (const f of faces) {
      expect(f).toContain('font-family:"Pretendard JP"');
      expect(f).toMatch(/unicode-range:/);
      const url = /url\("(fonts\/jp\/[^"]+)"\)/.exec(f)?.[1];
      expect(url && fs.existsSync(dist(url))).toBe(true);
    }
    expect(fs.existsSync(dist("fonts/jp/OFL.txt"))).toBe(true);
    expect(fs.readFileSync(dist("style.css"), "utf8")).toMatch(/--font-sans:"Pretendard","Pretendard JP",/);
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")) as { exports: Record<string, unknown> };
    expect(pkg.exports["./font-jp.css"]).toBe("./dist/font-jp.css");
  });
});
