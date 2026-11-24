import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "../components/button/Button";
import { Notice } from "../components/notification/Notification";
import { LABELS } from "../labels";

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
const SKIP_TYPE = ["password", "file", "hidden", "submit", "button", "reset", "image"];
const SAVE_DELAY = 500;

export interface DraftLabels { restored: string; discard: string }
export interface FormDraftOptions {
  /** 남기지 않을 칸의 name 또는 id — 비밀번호 · 파일 · 일회용 코드 · 복사 필드 · 인증 코드 칸 · 검색창 · data-draft-skip 안은 늘 빠진다 */
  exclude?: string[];
  labels?: Partial<DraftLabels>;
  /** false 면 아무 일도 하지 않는다 */
  enabled?: boolean;
}

/** 초안에 남길 칸 — 사이트 ds.js draftFields 와 같은 규칙 */
function fieldsOf(f: HTMLFormElement, exclude: string[]): Control[] {
  return Array.from(f.querySelectorAll<Control>("input, textarea, select")).filter((el) => {
    const key = el.name || el.id;
    if (!key || exclude.includes(el.name) || exclude.includes(el.id)) return false;
    if (SKIP_TYPE.includes((el.type || "").toLowerCase())) return false;
    if ((el as HTMLInputElement).readOnly) return false;
    if (el.getAttribute("autocomplete") === "one-time-code" || el.getAttribute("role") === "combobox") return false;
    return !el.closest(".copy-field, .code-inputs, .searchbar, [data-draft-skip]");
  });
}
const keyOf = (f: HTMLFormElement, el: Control) =>
  el.type === "radio" ? "radio:" + el.name : el.name || el.id;
const radioIdx = (f: HTMLFormElement, el: Control) =>
  Array.from(f.querySelectorAll<HTMLInputElement>("input[type=radio]")).filter((r) => r.name === el.name).indexOf(el as HTMLInputElement);
function read(f: HTMLFormElement, fields: Control[]) {
  const data: Record<string, string | boolean | number> = {};
  for (const el of fields) {
    if (el.type === "radio") { if ((el as HTMLInputElement).checked && el.name) data["radio:" + el.name] = radioIdx(f, el); continue; }
    data[el.name || el.id] = el.type === "checkbox" ? (el as HTMLInputElement).checked : el.value;
  }
  return data;
}
/** React 가 관리하는 칸에도 값이 들어가게 — 네이티브 setter + input 이벤트, 체크박스 · 라디오는 click. 바뀌었으면 true */
function put(el: Control, v: string | boolean): boolean {
  if (el.type === "checkbox" || el.type === "radio") {
    const box = el as HTMLInputElement;
    if (box.checked === !!v) return false;
    box.click();
    return true;
  }
  const s = String(v);
  if (el.value === s) return false;
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, s);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

/**
 * 폼 초안 저장(사이트 form[data-draft="키"] 와 같음, 2026-11-23 — 옵션).
 * 입력하면 0.5초 뒤 localStorage `jsds-draft:키` 에 남기고, 다시 열면 처음 값과 다른 칸만 되살린 뒤 폼 맨 위에 알린다('버리기' 는 처음 값으로 되돌림).
 * 제출이 통과하면(그 뒤 폼에 aria-invalid 가 없으면) 지운다. 네이티브 입력(글자 · 숫자 · 체크박스 · 라디오 · select · textarea)만 — Select · Combobox 의 고른 값은 제품이 저장한다.
 *
 * ```tsx
 * const draft = useFormDraft("policy-new");
 * <Form ref={draft.ref}>{draft.notice} …</Form>
 * ```
 */
export function useFormDraft(key: string, { exclude = [], labels, enabled = true }: FormDraftOptions = {}) {
  const [form, setForm] = useState<HTMLFormElement | null>(null);
  const [restored, setRestored] = useState(false);
  const quiet = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const initial = useRef<Record<string, string | boolean | number>>({});
  const storeKey = "jsds-draft:" + key;
  const ex = exclude.join("\u0000");
  const L: DraftLabels = { restored: LABELS.draftRestored, discard: LABELS.draftDiscard, ...labels };

  const clear = useCallback(() => {
    clearTimeout(timer.current);
    try { localStorage.removeItem(storeKey); } catch { /* 저장이 막힌 브라우저 */ }
    setRestored(false);
  }, [storeKey]);

  useEffect(() => {
    if (!form || !enabled) return;
    const exList = ex ? ex.split("\u0000") : [];
    const fields = () => fieldsOf(form, exList);
    initial.current = read(form, fields());   // '버리기' 의 기준 — React 는 value 속성을 따라 바꿔 defaultValue 를 믿을 수 없다
    let saved: { v?: number; f?: Record<string, string | boolean | number> } | null = null;
    try { saved = JSON.parse(localStorage.getItem(storeKey) || "null"); } catch { saved = null; }
    if (saved?.f) {
      const d = saved.f;
      let n = 0;
      quiet.current = true;
      for (const el of fields()) {
        const k = keyOf(form, el);
        if (!(k in d)) continue;
        if (el.type === "radio") { if (d[k] === radioIdx(form, el) && put(el, true)) n++; continue; }
        if (put(el, d[k] as string | boolean)) n++;
      }
      quiet.current = false;
      if (n) setRestored(true);
      else { try { localStorage.removeItem(storeKey); } catch { /* */ } }
    }
    const queue = () => {
      if (quiet.current) return;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        try { localStorage.setItem(storeKey, JSON.stringify({ v: 1, f: read(form, fields()) })); } catch { /* */ }
      }, SAVE_DELAY);
    };
    const submit = () => {
      // 검증 결과(aria-invalid)는 React 가 다시 그린 뒤에 보인다. 막힌 제출은 기다리던 저장을 그대로 둔다(방금 친 값까지 남게)
      setTimeout(() => { if (!form.querySelector('[aria-invalid="true"]')) clear(); }, 0);
    };
    form.addEventListener("input", queue, true);
    form.addEventListener("change", queue, true);
    form.addEventListener("submit", submit, true);
    return () => {
      clearTimeout(timer.current);
      form.removeEventListener("input", queue, true);
      form.removeEventListener("change", queue, true);
      form.removeEventListener("submit", submit, true);
    };
  }, [form, enabled, storeKey, ex, clear]);

  const discard = () => {
    if (!form) return;
    const exList = ex ? ex.split("\u0000") : [];
    const list = fieldsOf(form, exList);
    const d = initial.current;
    quiet.current = true;
    for (const el of list) {
      const k = keyOf(form, el);
      if (el.type === "radio") { put(el, d[k] === radioIdx(form, el)); continue; }
      if (k in d) put(el, d[k] as string | boolean);
    }
    quiet.current = false;
    clear();
    list.find((el) => el.offsetParent !== null)?.focus();
  };

  const notice: ReactNode = restored ? (
    <Notice tone="info" className="draft-notice" actions={<Button size="sm" variant="outline" color="assistive" data-draft-discard="" onClick={discard}>{L.discard}</Button>}>
      <span>{L.restored}</span>
    </Notice>
  ) : null;

  return { ref: setForm, notice, restored, clear, discard };
}
