/* 사이트(ds.src.js)와 패키지가 같은 UI 문구를 쓰는지 — 한쪽만 고치면 같은 화면이 사이트와 제품에서 다르게 말한다.
   사이트 쪽 문구 객체는 소스 글에서 떠서 읽는다(ds.js 는 모듈이 아니다). 키 이름이 다른 것은 MAP 으로 잇는다 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { LABELS } from "../src/labels";
import { COPY_LABELS } from "../src/components/copy-field/CopyField";
import { TIME_LABELS } from "../src/components/time-picker/TimePicker";
import { VALIDATION_MESSAGES } from "../src/components/text-field/validation";
import { TREE_LABELS } from "../src/components/tree/Tree";
import { NOTIFY_LABELS } from "../src/components/notification-center/NotificationCenter";
import { FLASH_SAY } from "../src/utils/motion";

const SRC = fs.readFileSync(path.resolve(__dirname, "../../_build/ds.src.js"), "utf8");
const FU = fs.readFileSync(path.resolve(__dirname, "../src/components/file-upload/FileUpload.tsx"), "utf8");

/* `NAME = { … }` 의 객체 글을 괄호 짝으로 떠서 값으로 만든다 — 문자열 값만 있는 객체라 그대로 평가해도 된다 */
function grab(text: string, name: string): Record<string, unknown> {
  const at = text.search(new RegExp(`\\b${name} = \\{`));
  if (at < 0) throw new Error(`${name} 를 찾지 못함`);
  let i = text.indexOf("{", at), depth = 0, inStr: string | null = null;
  const start = i;
  for (; i < text.length; i++) {
    const c = text[i];
    if (inStr) { if (c === "\\") i++; else if (c === inStr) inStr = null; continue; }
    if (c === '"' || c === "'" || c === "`") inStr = c;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) break;
  }
  return new Function(`return (${text.slice(start, i + 1)});`)();
}

/* site 키 → React 값. 사이트에만 있는 키(목록에 없는 것)는 실패로 본다 */
function same(site: Record<string, unknown>, react: Record<string, string>, map: Record<string, string> = {}, skip: string[] = []) {
  const diff: string[] = [];
  for (const [k, v] of Object.entries(site)) {
    if (skip.includes(k)) continue;
    const rk = map[k] ?? k;
    if (!(rk in react)) diff.push(`${k}: React 에 ${rk} 없음`);
    else if (react[rk] !== v) diff.push(`${k}: 사이트 "${v}" ≠ React "${react[rk]}"`);
  }
  return diff;
}

describe("사이트 · React 문구가 같다", () => {
  it("Date Picker 버튼 · 제목 문구", () => {
    /* recent 는 프리셋 이름 틀 — React 는 프리셋을 제품이 이름까지 넘긴다 */
    expect(same(grab(SRC, "LABELS"), LABELS, { dialog: "dateDialog" }, ["recent"])).toEqual([]);
  });
  it("Date Picker 오류 문구", () => {
    const map = { incomplete: "dateIncompleteError", invalid: "dateInvalidError", min: "dateMinError", max: "dateMaxError", order: "dateOrderError",
      subject: "dateSubject", startSubject: "dateStartSubject", endSubject: "dateEndSubject", long: "dateLongError", invalidTime: "dateTimeInvalidError",
      orderTime: "dateTimeOrderError", timeSubject: "dateTimeSubject", startTimeSubject: "dateStartTimeSubject", endTimeSubject: "dateEndTimeSubject" };
    expect(same(grab(SRC, "MSG"), LABELS, map)).toEqual([]);
  });
  it("입력 검증 문구", () => expect(same(grab(SRC, "V_MSG"), VALIDATION_MESSAGES)).toEqual([]));
  it("Time Picker 문구", () => expect(same(grab(SRC, "TP_LABELS"), TIME_LABELS)).toEqual([]));
  it("Copy Field 문구", () => expect(same(grab(SRC, "COPY_LABEL"), COPY_LABELS)).toEqual([]));
  it("File Upload 문구", () => expect(same(grab(SRC, "UP_LABEL"), grab(FU, "DEFAULT_LABELS") as Record<string, string>)).toEqual([]));
  it("Tree 문구", () => expect(same(grab(SRC, "TREE_LABEL"), TREE_LABELS)).toEqual([]));
  it("오버레이 입력 보호 문구", () => expect(same(grab(SRC, "DISCARD_LABEL"), LABELS, { title: "discardTitle", body: "discardBody", keep: "discardKeep", drop: "discardDrop" })).toEqual([]));
  it("폼 초안 문구", () => expect(same(grab(SRC, "DRAFT_LABEL"), LABELS, { restored: "draftRestored", discard: "draftDiscard" })).toEqual([]));
  it("Notification Center 문구", () => expect(same(grab(SRC, "NF_LABEL"), NOTIFY_LABELS)).toEqual([]));
  it("새 항목 알림 문구", () => expect(SRC.match(/FLASH_SAY = "([^"]+)"/)?.[1]).toBe(FLASH_SAY));   // 2026-11-27
  it("사이드 내비 접기 문구", () => expect(same(grab(SRC, "NAV_LABEL"), LABELS, { collapse: "navCollapse", expand: "navExpand" })).toEqual([]));   // 2026-11-18
});
