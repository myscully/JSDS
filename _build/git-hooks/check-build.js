// pre-commit 검사: _build/style.src.css 를 커밋하면서 assets/style.css 를 다시 만들지 않은 경우를 막는다.
//   build.js:22 와 같은 변환(폰트 URL 한 곳)을 적용해 스테이징된 내용끼리 비교한다.
const { execFileSync } = require("child_process");

const SRC = "_build/style.src.css", OUT = "assets/style.css";
const staged = s => execFileSync("git", ["show", ":" + s], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const names = execFileSync("git", ["diff", "--cached", "--name-only"], { encoding: "utf8" }).split("\n");
if (!names.includes(SRC)) process.exit(0); // 스타일 원본을 건드리지 않은 커밋은 통과

let src, out;
try { src = staged(SRC); out = staged(OUT); }
catch (e) { process.exit(0); } // 파일이 아직 없는 커밋(초기화 등)은 막지 않는다

const expected = src.replace('url("PretendardVariable.woff2")', 'url("fonts/PretendardVariable.woff2")');
if (expected === out) process.exit(0);

process.stderr.write(`
커밋을 멈췄습니다 — ${SRC} 를 고쳤는데 ${OUT} 이 그 원본에서 나온 것이 아닙니다.
빌드를 돌리지 않아 원본과 실제 사이트가 어긋난 상태입니다.

  cd _build && node build.js && cd .. && git add -A

위를 실행한 뒤 다시 커밋하세요. (정말 이대로 커밋하려면 git commit --no-verify)
`);
process.exit(1);
