// ../_build/icons.js 의 ICONS(사이트가 쓰는 Tabler 아이콘 36개)를 타입 있는 TS 데이터로 생성
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const { ICONS, ICON_NAMES } = require(path.resolve(here, "..", "..", "_build", "icons.js"));

const entries = ICON_NAMES.map((n) => {
  const ic = ICONS[n];
  return `  ${JSON.stringify(n)}: { o: ${JSON.stringify(ic.o)}, f: ${ic.f ? JSON.stringify(ic.f) : "null"}, category: ${JSON.stringify(ic.category || "")} }`;
});
const out = `/* 생성 파일 — 원본은 _build/icons.js + assets/icons. 수정하지 마세요. (npm run gen) */
export const ICONS = {
${entries.join(",\n")}
} as const;
export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];
`;
const dest = path.resolve(here, "..", "src", "icons", "icons.data.ts");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);
console.log(`icons.data.ts: ${ICON_NAMES.length} icons`);
