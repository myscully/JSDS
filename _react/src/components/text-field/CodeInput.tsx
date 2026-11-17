import { useContext, useEffect, useRef, useState, type ChangeEvent, type ClipboardEvent, type FocusEvent, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useId } from "../../utils/useId";
import { FormValidationContext, type ValidationMessages } from "./validation";

/* Text Field Code — 인증 코드 칸(사람의 요청 · 결정 2026-11-17). 사이트 ds.js 의 .code-inputs 와 같은 마크업 · 동작이다.
   자리마다 칸 하나(48 × 56). 치면 다음 칸, 빈 칸에서 Backspace 는 앞 칸을 지우고 그리로, ← → Home End 로 옮긴다.
   붙여넣기 · 문자 자동 채우기(첫 칸 autocomplete=one-time-code)는 그 칸부터 나눠 채운다. 숫자가 아닌 글자는 받지 않는다. 다 채워도 저절로 제출하지 않는다 */
export interface CodeInputChangeInfo {
  /** 모든 칸이 찼는지 */
  complete: boolean;
}
export interface CodeInputProps {
  label: ReactNode;
  /** 자리 수. 기본 6 */
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, info: CodeInputChangeInfo) => void;
  /** 폼 값 이름 — 칸을 이은 값을 hidden 입력에 담는다 */
  name?: string;
  /** 비우면 오류(폼 검증). 라벨 뒤 * 는 requiredMark */
  required?: boolean;
  /** false 면 required 여도 라벨 뒤 * 를 그리지 않는다 — TextField 와 같다. 기본 true */
  requiredMark?: boolean;
  help?: ReactNode;
  /** true 또는 오류 메시지 */
  error?: boolean | ReactNode;
  /** 이 필드의 검증 문구 — required · code */
  messages?: ValidationMessages;
  disabled?: boolean;
  autoFocus?: boolean;
  /** 첫 칸의 id(라벨이 가리킴) 접두 — 칸은 `${id}-1` */
  id?: string;
  className?: string;
}

const digitsOf = (s: string) => s.replace(/\D/g, "");

export function CodeInput({ label, length = 6, value, defaultValue, onChange, name, required, requiredMark = true, help, error: errorProp, messages, disabled, autoFocus, id: idProp, className }: CodeInputProps) {
  const form = useContext(FormValidationContext);
  const id = useId(idProp, "code");
  const [inner, setInner] = useState(() => digitsOf(defaultValue ?? "").slice(0, length));
  const code = value !== undefined ? digitsOf(value).slice(0, length) : inner;
  const chars = Array.from({ length }, (_, i) => code[i] ?? "");
  const group = useRef<HTMLDivElement>(null);
  const cells = useRef<(HTMLInputElement | null)[]>([]);
  const dirty = useRef(false);
  const gapAt = chars.findIndex((c) => !c), rove = gapAt < 0 ? length - 1 : gapAt;   // Tab 칸은 하나 — 첫 빈 칸(다 차면 마지막). 안에서는 화살표
  const now = useRef(chars);   // 방금 채운 값 — 다음 칸으로 옮기는 포커스가 다시 그리기 전에 온다
  now.current = chars;
  const error = errorProp || (form ? form.errors[id] : undefined) || undefined;
  const helpText = typeof error === "string" || (error && typeof error !== "boolean") ? error : help;
  const showHelp = form !== null || (helpText !== undefined && helpText !== false);
  const helpId = showHelp ? `${id}-help` : undefined;

  /* 오류가 떠 있으면 고치는 대로 다시 잰다 — 칸의 DOM 값이 새 값으로 그려진 뒤에 */
  const errorShown = Boolean(form?.errors[id]);
  useEffect(() => {
    if (dirty.current && errorShown && group.current) form?.touch(group.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const commit = (next: string[]) => {
    const v = next.join("");
    dirty.current = true;
    now.current = next;
    if (v === code) return;
    if (value === undefined) setInner(v);
    onChange?.(v, { complete: v.length === length });
  };
  const focusAt = (i: number) => {
    const c = cells.current[Math.max(0, Math.min(length - 1, i))];
    if (c) { c.focus(); c.select(); }
  };
  /* i 칸부터 한 자리씩 — 마지막으로 채운 다음 칸(없으면 마지막 칸)으로 */
  const fill = (i: number, d: string) => {
    const next = chars.slice();
    let k = 0;
    for (; k < d.length && i + k < length; k++) next[i + k] = d.charAt(k);
    commit(next);
    focusAt(i + k);
  };

  const handleChange = (i: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const ne = e.nativeEvent as InputEvent;
    if (ne.isComposing) return;
    const typed = ne.inputType === "insertText" && ne.data != null;
    const d = digitsOf(typed ? ne.data ?? "" : e.target.value);
    if (d) return fill(i, d);
    if (!e.target.value) { const next = chars.slice(); next[i] = ""; commit(next); }   // 지움. 숫자가 아닌 글자는 받지 않는다 — 제어형이라 그대로 전 값으로 그려진다
  };
  const handleKeyDown = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.altKey || e.ctrlKey || e.metaKey) return;
    const go = (j: number) => { e.preventDefault(); if (j >= 0 && j < length) focusAt(j); };
    if (e.key === "Backspace" && !chars[i] && i > 0) {
      e.preventDefault();
      const next = chars.slice(); next[i - 1] = ""; commit(next);
      cells.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft") go(i - 1);
    else if (e.key === "ArrowRight") go(i + 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(length - 1);
  };
  const handlePaste = (i: number) => (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const d = digitsOf(e.clipboardData.getData("text"));
    if (d) fill(i, d);
  };
  const handleFocus = (i: number) => (e: FocusEvent<HTMLInputElement>) => {
    const cur = now.current, gap = cur.findIndex((c) => !c);
    if (!cur[i] && gap >= 0 && gap < i) { cells.current[gap]?.focus(); return; }   // 앞에 빈 칸이 있으면 첫 빈 칸으로
    e.target.select();
  };
  const handleCompositionEnd = (i: number) => (e: { currentTarget: HTMLInputElement }) => {
    const d = digitsOf(e.currentTarget.value);
    if (d) fill(i, d);
  };
  /* 묶음을 떠날 때 — 다른 필드처럼 건드렸거나 값이 있거나 이미 오류일 때만 잰다 */
  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (e.relatedTarget instanceof Node && group.current?.contains(e.relatedTarget)) return;
    if (form && group.current && (dirty.current || code || form.errors[id])) form.touch(group.current);
  };

  return (
    <div className={cx("field code-field", { error: Boolean(error) }, className)}>
      <label id={`${id}-l`} htmlFor={`${id}-1`}>
        {label}
        {required && requiredMark && <em>*</em>}
      </label>
      <div
        ref={group}
        id={id}
        className="code-inputs"
        role="group"
        aria-labelledby={`${id}-l`}
        aria-describedby={helpId}
        data-name={name}
        data-required={required ? "" : undefined}
        data-messages={messages ? JSON.stringify(messages) : undefined}
        data-ds-field={form && !disabled ? "" : undefined}
        data-ds-code=""
        onBlur={handleBlur}
      >
        {name !== undefined && <input type="hidden" name={name} value={code} />}
        {chars.map((c, i) => (
          <input
            key={i}
            ref={(el) => { cells.current[i] = el; }}
            id={i === 0 ? `${id}-1` : undefined}
            className="code-cell"
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`${length}자리 중 ${i + 1}번째`}
            tabIndex={i === rove ? undefined : -1}
            aria-invalid={error ? true : undefined}
            value={c}
            disabled={disabled}
            autoFocus={autoFocus && i === 0}
            onChange={handleChange(i)}
            onKeyDown={handleKeyDown(i)}
            onPaste={handlePaste(i)}
            onFocus={handleFocus(i)}
            onCompositionEnd={handleCompositionEnd(i)}
          />
        ))}
      </div>
      {showHelp && (
        <span className="help" id={helpId} aria-live="polite">
          {helpText === false ? undefined : helpText}
        </span>
      )}
    </div>
  );
}
