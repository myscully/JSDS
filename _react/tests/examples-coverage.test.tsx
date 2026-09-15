/* 사이트의 모든 예제(components 97 · patterns 21)에 대응하는 React 예제 파일이 있는지, 고아 파일이 없는지 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
(globalThis as unknown as { I: unknown }).I = require("../../_build/icons.js").I;
const COMPONENTS = require("../../_build/components.data.js") as Record<string, { examples: { id: string }[] }>;
const PATTERNS = require("../../_build/patterns.data.js") as Record<string, { examples: { id: string }[] }>;
const files = Object.keys(import.meta.glob("../examples/**/*.tsx")).map((f) => f.replace(/^\.\.\/examples\//, "").replace(/\.tsx$/, ""));

const expected: string[] = [];
for (const [k, c] of Object.entries(COMPONENTS)) for (const e of c.examples) expected.push(`components/${k}/${e.id}`);
for (const [k, c] of Object.entries(PATTERNS)) for (const e of c.examples) expected.push(`patterns/${k}/${e.id}`);

describe("예제 커버리지", () => {
  it("고아 예제 파일이 없다", () => {
    const orphans = files.filter((f) => !expected.includes(f));
    expect(orphans).toEqual([]);
  });
  it("모든 사이트 예제에 React 예제가 있다", () => {
    const missing = expected.filter((k) => !files.includes(k));
    expect(missing, `누락 ${missing.length}/${expected.length}`).toEqual([]);
    expect(expected.length).toBe(118); // components 97 + patterns 21
  });
});
