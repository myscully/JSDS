/* 사이트의 모든 예제(components 272 · patterns 41)에 대응하는 React 예제 파일이 있는지, 고아 파일이 없는지 */
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
    expect(expected.length).toBe(331); // components 275 + patterns 56 (2026-11-20 데이터 패턴 일곱의 상태 예제 7 · 로그 뷰어 연결 끊김 1. 2026-11-18 Text Field With Icon · Notification Center Count 2. 2026-11-17 Text Field Code 1. 2026-11-15 새 패턴 넷 7 — 일괄 작업 2 · 보고서 예약 2 · 감사 로그 2 · 알림 규칙 1. 그 전 41: 2026-11-15 패턴 재정비 — 19 + 새 패턴 여덟의 20(오류 2 · 위험 확인 4 · 가져오기 2 · 로그인 3 · 상세 2 · 역할 2 · 비밀값 4 · 사고 1) + 기존 패턴에 더한 3(약관 전문 · 검색 빈 결과 · 정책 적용 대상) − 온보딩 완료 1)
  });
});
