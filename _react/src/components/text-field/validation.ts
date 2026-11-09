/* 입력 검증 — Interaction › Input errors(사람의 결정 2026-11-09). 문구 · 순서 · 언제 알리는지는 사이트 ds.js 의 form[data-validate] 와 같아야 한다 */
import { createContext, useRef, useState, type FocusEvent, type FormEvent } from "react";

export const VALIDATION_MESSAGES = {
  required: "필수 항목입니다. 값을 입력하세요.",
  choose: "필수 항목입니다. 항목을 선택하세요.",
  number: "숫자가 아닙니다. 숫자를 입력하세요.",
  email: "이메일 형식이 아닙니다. 예: admin@example.com",
  url: "URL 형식이 아닙니다. 예: https://example.com",
  pattern: "형식이 맞지 않습니다. 도움말을 확인하세요.",
  min: "값이 너무 작습니다. {min} 이상 입력하세요.",
  max: "값이 너무 큽니다. {max} 이하 입력하세요.",
  minlength: "글자 수가 모자랍니다. {minlength}자 이상 입력하세요.",
  step: "입력할 수 없는 값입니다. {step} 단위로 입력하세요.",
  length: "글자 수가 {over}자 넘었습니다. {limit}자 이하로 줄이세요.",
};
export type ValidationMessages = Partial<Record<keyof typeof VALIDATION_MESSAGES, string>>;

export interface FormValidationResult {
  valid: boolean;
  errors: { label: string; message: string }[];
}

/** 검증하는 Form 안이면 필드별 오류(id → 문구). Date Picker 는 스스로 재므로 null 로 막는다 */
export const FormValidationContext = createContext<{ errors: Record<string, string>; touch: (el: HTMLElement) => void } | null>(null);

type TextControl = HTMLInputElement | HTMLTextAreaElement;
/** 고르는 컨트롤(Select 트리거 · Combobox 입력) — 값이 DOM 값이 아니라 data-ds-empty 로 온다 */
const isChoice = (el: Element) => el.hasAttribute("data-ds-choice");
const fill = (t: string, data: Record<string, unknown>) => t.replace(/\{(\w+)\}/g, (_, k) => String(data[k]));

export const lengthMessage = (over: number, limit: number, messages?: ValidationMessages) =>
  fill({ ...VALIDATION_MESSAGES, ...messages }.length, { over, limit });

function ownMessages(el: Element): ValidationMessages {
  const raw = el.getAttribute("data-messages");
  return raw ? (JSON.parse(raw) as ValidationMessages) : {};
}

/** 표준 제약과 글자 수 한도 — 맞으면 "" */
export function validationMessage(el: TextControl, messages?: ValidationMessages): string {
  if (isChoice(el)) return el.hasAttribute("data-ds-required") && el.hasAttribute("data-ds-empty") ? { ...VALIDATION_MESSAGES, ...messages }.choose : "";
  const v = el.validity;
  const limit = Number(el.getAttribute("data-maxlength")) || 0;
  const over = limit ? el.value.length - limit : 0;
  const key: keyof typeof VALIDATION_MESSAGES | "" = v.valueMissing ? "required" : v.badInput ? "number" : v.typeMismatch ? (el.type === "email" ? "email" : "url") : v.patternMismatch ? "pattern" : v.rangeUnderflow ? "min" : v.rangeOverflow ? "max" : v.tooShort ? "minlength" : v.stepMismatch ? "step" : over > 0 ? "length" : "";
  if (!key) return "";
  const input = el as HTMLInputElement;
  return fill({ ...VALIDATION_MESSAGES, ...messages, ...ownMessages(el) }[key], { min: input.min, max: input.max, minlength: el.minLength, step: input.step, over, limit });
}

const labelOf = (field: Element) => (field.querySelector("label")?.textContent ?? "").replace(/\*\s*$/, "").trim();
const isField = (t: EventTarget): t is TextControl => t instanceof Element && t.matches("[data-ds-field]") && ((t as TextControl).willValidate || isChoice(t));

interface Options {
  enabled: boolean;
  messages?: ValidationMessages;
  onValidate?: (result: FormValidationResult) => void;
}

/** Form 의 위임 핸들러 · 필드별 오류 · 요약(오류 3개 이상) */
export function useFormValidation({ enabled, messages, onValidate }: Options) {
  const form = useRef<HTMLFormElement | null>(null);
  const dirty = useRef(new WeakSet<Element>());
  const tried = useRef(false);
  const latest = useRef<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<{ count: number; labels: string } | null>(null);

  /* 틀린 필드를 화면 순서로 — 시스템이 재는 필드는 새 결과로, Date Picker 처럼 스스로 재는 필드는 .error 로 본다 */
  const collect = (next: Record<string, string>) =>
    Array.from(form.current?.querySelectorAll(".field") ?? []).flatMap((field) => {
      const own = field.querySelector<TextControl>("[data-ds-field]");
      const message = own ? next[own.id] : field.classList.contains("error") ? field.querySelector(":scope > .help")?.textContent ?? "" : undefined;
      return message === undefined ? [] : [{ field, label: labelOf(field), message }];
    });
  const commit = (next: Record<string, string>) => {
    latest.current = next;
    setErrors(next);
    if (!tried.current) return;
    const bad = collect(next);
    setSummary(bad.length >= 3 ? { count: bad.length, labels: bad.map((b) => b.label).filter(Boolean).join(", ") } : null);
  };
  const measured = (el: TextControl, base: Record<string, string>) => {
    const { [el.id]: _old, ...next } = base;
    const message = validationMessage(el, messages);
    return message ? { ...next, [el.id]: message } : next;
  };

  const handleBlur = (e: FocusEvent<HTMLFormElement>) => {
    const t = e.target;
    if (enabled && isField(t) && !isChoice(t) && (dirty.current.has(t) || t.value || latest.current[t.id])) commit(measured(t, latest.current));
  };
  const handleInput = (e: FormEvent<HTMLFormElement>) => {
    const t = e.target;
    if (!enabled || !isField(t) || isChoice(t)) return;
    dirty.current.add(t);
    const limit = Number(t.getAttribute("data-maxlength")) || 0;
    if (latest.current[t.id] || (limit > 0 && t.value.length > limit)) commit(measured(t, latest.current));
  };
  /** 전부 재서 통과하면 true. 막으면 첫 오류로 포커스 */
  const validateAll = () => {
    tried.current = true;
    const next = Array.from(form.current?.querySelectorAll<TextControl>("[data-ds-field]") ?? []).filter(isField).reduce((acc, el) => measured(el, acc), {} as Record<string, string>);
    commit(next);
    const bad = collect(next);
    onValidate?.({ valid: !bad.length, errors: bad.map(({ label, message }) => ({ label, message })) });
    const first = bad[0]?.field.querySelector<HTMLElement>("input:not([type=hidden]),textarea,button");
    if (first) {
      first.focus({ preventScroll: true });
      first.scrollIntoView?.({ block: "center" });
    }
    return !bad.length;
  };
  /** Select · Combobox — 고르거나 떠난 뒤 이 필드만 다시 잰다 */
  const touch = (el: HTMLElement) => {
    if (enabled) commit(measured(el as TextControl, latest.current));
  };
  return { form, errors, summary, handleBlur, handleInput, validateAll, touch };
}
