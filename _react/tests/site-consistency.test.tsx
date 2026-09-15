/* 사이트 예제(components.data.js / patterns.data.js 의 html) 와 _react/examples 의 React 렌더 결과가
   같은 구조(태그 · 클래스 · 상태 속성)인지 검사한다. 예제 파일 첫 줄에 `// ds:skeleton off` 가 있으면 건너뜀. */
import { createRequire } from "node:module";
import { render } from "@testing-library/react";
import type { ComponentType } from "react";
import { skeleton, skeletonOfHtml } from "./skeleton";

const require = createRequire(import.meta.url);
(globalThis as unknown as { I: unknown }).I = require("../../_build/icons.js").I;
const LIB = require("../../_build/lib.js") as { dedent: (s: string) => string };
const COMPONENTS = require("../../_build/components.data.js") as Record<string, { examples: { id: string; html: string }[] }>;
const PATTERNS = require("../../_build/patterns.data.js") as Record<string, { examples: { id: string; html: string }[] }>;

const modules = import.meta.glob("../examples/**/*.tsx", { eager: true }) as Record<string, { default: ComponentType }>;
const sources = import.meta.glob("../examples/**/*.tsx", { eager: true, query: "?raw", import: "default" }) as Record<string, string>;

const keyOf = (file: string) => file.replace(/^\.\.\/examples\//, "").replace(/\.tsx$/, "");
const siteHtml = (key: string): string | undefined => {
  const [sec, page, id] = key.split("/");
  const data = sec === "components" ? COMPONENTS : PATTERNS;
  const ex = data[page]?.examples.find((e) => e.id === id);
  return ex ? LIB.dedent(ex.html) : undefined;
};

describe("site ↔ react 구조 일치", () => {
  const files = Object.keys(modules).sort();
  it("예제 파일이 하나 이상 있다", () => expect(files.length).toBeGreaterThan(0));
  for (const file of files) {
    const key = keyOf(file);
    const src = sources[file] ?? "";
    const off = /^\s*\/\/\s*ds:skeleton off/m.test(src.split("\n").slice(0, 2).join("\n"));
    const html = siteHtml(key);
    (off ? it.skip : it)(key, () => {
      expect(html, `${key}: 사이트 예제가 없습니다`).toBeDefined();
      const Example = modules[file].default;
      const { container } = render(<Example />);
      const react = skeleton(container).join("\n");
      const site = skeletonOfHtml(html!).join("\n");
      expect(react).toBe(site);
    });
  }
});
