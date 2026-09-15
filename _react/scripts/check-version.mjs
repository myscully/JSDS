// package.json 의 major.minor 가 사이트 VERSION(_build/data.js) 과 같은지 확인
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(fs.readFileSync(path.resolve(here, "..", "package.json"), "utf8"));
const { VERSION } = require(path.resolve(here, "..", "..", "_build", "data.js"));
const [maj, min] = pkg.version.split(".");
const mine = `v${maj}.${min}`;
if (mine !== VERSION) {
  console.error(`check-version: 패키지 ${pkg.version} (${mine}) ≠ 사이트 VERSION ${VERSION}. _build/data.js 의 VERSION 과 package.json 을 함께 올리세요.`);
  process.exit(1);
}
console.log(`version ok: ${pkg.version} ↔ ${VERSION}`);
