import { createContext, forwardRef, useContext, useState, type ChangeEvent, type CSSProperties, type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type Ref, type TextareaHTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import { useId } from "../../utils/useId";
import { Icon } from "../../icons/Icon";
import { FormValidationContext, lengthMessage, type ValidationMessages } from "./validation";
import type { Size } from "../../types";

export interface FieldOwnProps {
  label?: ReactNode;
  /** 라벨 뒤 * 표시 (input 의 required 와 별개로 시각 표시) */
  required?: boolean;
  /** 아래 도움말. error 가 문자열이면 그 문구가 대신 표시 */
  help?: ReactNode;
  /** true 또는 오류 메시지. 보더 danger + aria-invalid */
  error?: boolean | ReactNode;
  /** 입력 높이 32 / 40 / 48 — Button 과 같다 */
  size?: Size;
  /** 라벨 오른쪽 글자 수 표시 (showCount) */
  counter?: ReactNode;
}

export interface FieldProps extends FieldOwnProps, Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** 컨트롤의 id — label[for] 연결 */
  htmlFor?: string;
  /** help 요소 id — 컨트롤의 aria-describedby 에 넣는다 */
  helpId?: string;
  /** 도움말이 비어 있어도 그린다(aria-live) — 오류 문구는 영역이 먼저 있어야 읽힌다 */
  live?: boolean;
  /** 글자 수 한도를 넘음 — 카운터를 오류 색으로 */
  counterOver?: boolean;
  children?: ReactNode;
  /** 도움말 뒤에 둘 것 — 필드에 붙는 팝오버(Date Picker 의 달력) */
  after?: ReactNode;
}

/** 필드 안 컨트롤(Select · Combobox)이 라벨 · 도움말 · 오류를 잇는 자리 */
export const FieldContext = createContext<{ controlId: string; labelId?: string; helpId?: string; error: boolean } | null>(null);

/** 라벨 · 컨트롤 · 도움말을 묶는 필드 셸. TextField/TextArea 가 사용하고, Dropdown 등 다른 컨트롤도 감쌀 수 있다 */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { label, required, help, error: errorProp, size = "md", counter, htmlFor, helpId: helpIdProp, live: liveProp, counterOver, className, children, after, ...rest },
  ref,
) {
  const form = useContext(FormValidationContext);
  const autoId = useId(undefined, "field");
  const controlId = htmlFor ?? autoId;
  const error = errorProp || form?.errors[controlId] || undefined;
  const live = liveProp ?? form !== null;
  const helpText = typeof error === "string" || (error && typeof error !== "boolean") ? error : help;
  const helpId = helpIdProp ?? (live || helpText ? `${controlId}-help` : undefined);
  const labelId = label !== undefined ? `${controlId}-label` : undefined;
  const labelEl = label !== undefined && (
    <label id={labelId} htmlFor={htmlFor}>
      {label}
      {required && <em>*</em>}
    </label>
  );
  return (
    <div ref={ref} className={cx("field", size !== "md" && size, { error: Boolean(error) }, className)} {...rest}>
      {counter !== undefined ? (
        <div className="row">
          {labelEl}
          <span className={cx("counter", counterOver && "over")}>{counter}</span>
        </div>
      ) : (
        labelEl
      )}
      <FieldContext.Provider value={{ controlId, labelId, helpId, error: Boolean(error) }}>{children}</FieldContext.Provider>
      {live || (helpText !== undefined && helpText !== false) ? (
        <span className="help" id={helpId} aria-live={live ? "polite" : undefined}>
          {helpText === false ? undefined : helpText}
        </span>
      ) : null}
      {after}
    </div>
  );
});

/** 글자 수 · 한도 · 폼 검증 — TextField 와 TextArea 가 같이 쓴다. maxLength 는 네이티브로 넘기지 않는다: 붙여넣은 값이 조용히 잘리지 않게 넘겨도 입력되고 오류로 알린다 */
function useTextControl<E extends HTMLInputElement | HTMLTextAreaElement>(p: { id: string; value?: unknown; defaultValue?: unknown; maxLength?: number; showCount?: boolean; onChange?: (e: ChangeEvent<E>) => void; help?: ReactNode; error?: boolean | ReactNode; messages?: ValidationMessages }) {
  const form = useContext(FormValidationContext);
  const [typed, setTyped] = useState<number | null>(null);
  const len = p.value !== undefined ? String(p.value).length : typed ?? String(p.defaultValue ?? "").length;
  const limit = p.maxLength ?? 0;
  const over = limit > 0 && len > limit;
  /* 불러온 값이 이미 넘었어도 입력 전에는 알리지 않는다 — 폼 안에서는 Form 이 잰다 */
  const lengthError = !form && over && typed !== null ? lengthMessage(len - limit, limit, p.messages) : undefined;
  const error = p.error || (form ? form.errors[p.id] : undefined) || lengthError || undefined;
  const live = form !== null || limit > 0;
  return {
    error,
    live,
    over,
    helpId: p.help || error || live ? `${p.id}-help` : undefined,
    counter: p.showCount ? `${len}${limit ? ` / ${limit}` : ""}` : undefined,
    control: {
      value: p.value as never,
      defaultValue: p.defaultValue as never,
      "data-maxlength": limit || undefined,
      "data-ds-field": form ? "" : undefined,
      "data-messages": p.messages ? JSON.stringify(p.messages) : undefined,
      onChange: (e: ChangeEvent<E>) => {
        setTyped(e.target.value.length);
        p.onChange?.(e);
      },
    },
  };
}

type InputBase = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix">;
export interface TextFieldProps extends FieldOwnProps, InputBase {
  /** 접두어 (예: https://) — .affix 컨테이너로 감싼다 */
  prefix?: ReactNode;
  /** 접미어 (예: 일, %) */
  suffix?: ReactNode;
  /** maxLength 와 함께 "n / max" 카운터 표시 */
  showCount?: boolean;
  /** 글자 수 한도. 넘겨도 입력되고 오류로 알린다(네이티브 maxlength 가 아니다) */
  maxLength?: number;
  /** 입력 글자를 고정폭으로 — IP · URL · 해시 */
  mono?: boolean;
  /** 비밀번호 표시 토글 — type 을 password 로 두고 버튼으로 바꾼다 */
  reveal?: boolean;
  revealLabel?: string;
  /** 이 필드의 검증 문구(Form messages 위에 얹는다) */
  messages?: ValidationMessages;
  /** 래퍼(.field) 스타일 */
  wrapperStyle?: CSSProperties;
  wrapperClassName?: string;
  /** .affix 안 입력 뒤에 그대로 둘 컨트롤(span 으로 감싸지 않는다) — Date Picker 의 달력 버튼 */
  trailing?: ReactNode;
  /** 래퍼(.field)에 줄 나머지 속성 · ref — 이벤트 · data-* */
  wrapperProps?: Omit<HTMLAttributes<HTMLDivElement>, "className" | "style" | "children"> & { ref?: Ref<HTMLDivElement> };
  /** 래퍼 안 도움말 뒤에 둘 것(팝오버) */
  after?: ReactNode;
}

/** 한 줄 텍스트 입력 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, required, help, error, size, prefix, suffix, showCount, wrapperStyle, wrapperClassName, trailing, wrapperProps, after, id: idProp, className, maxLength, value, defaultValue, onChange, mono, reveal, revealLabel = "비밀번호 표시", messages, ...rest },
  ref,
) {
  const id = useId(idProp);
  const [shown, setShown] = useState(false);
  const c = useTextControl<HTMLInputElement>({ id, value, defaultValue, maxLength, showCount, onChange, help, error, messages });
  const revealButton = reveal ? (
    <button type="button" className="reveal" aria-label={revealLabel} aria-pressed={shown} disabled={rest.disabled} onClick={() => setShown(!shown)}>
      <span className="i-show"><Icon name="eye" size={18} /></span>
      <span className="i-hide"><Icon name="eye-off" size={18} /></span>
    </button>
  ) : null;
  const input = (
    <input
      ref={ref}
      id={id}
      type="text"
      className={className}
      aria-invalid={c.error ? true : undefined}
      aria-describedby={c.helpId}
      required={required || undefined}
      {...rest}
      {...c.control}
      {...(reveal ? { type: shown ? "text" : "password" } : null)}
    />
  );
  return (
    <Field {...wrapperProps} label={label} required={required} help={help} error={c.error} size={size} counter={c.counter} counterOver={c.over} live={c.live} htmlFor={id} helpId={c.helpId} style={wrapperStyle} className={cx(mono && "mono", wrapperClassName)} after={after}>
      {prefix !== undefined || suffix !== undefined || trailing !== undefined || reveal ? (
        <div className="affix">
          {prefix !== undefined && <span>{prefix}</span>}
          {input}
          {suffix !== undefined && <span>{suffix}</span>}
          {trailing}
          {revealButton}
        </div>
      ) : (
        input
      )}
    </Field>
  );
});

export interface TextAreaProps extends FieldOwnProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  wrapperStyle?: CSSProperties;
  wrapperClassName?: string;
  /** maxLength 와 함께 "n / max" 카운터 표시 */
  showCount?: boolean;
  /** 이 필드의 검증 문구(Form messages 위에 얹는다) */
  messages?: ValidationMessages;
}
/** 여러 줄 입력 (최소 96px, 세로 리사이즈) */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, required, help, error, size, wrapperStyle, wrapperClassName, id: idProp, maxLength, showCount, value, defaultValue, onChange, messages, ...rest },
  ref,
) {
  const id = useId(idProp);
  const c = useTextControl<HTMLTextAreaElement>({ id, value, defaultValue, maxLength, showCount, onChange, help, error, messages });
  return (
    <Field label={label} required={required} help={help} error={c.error} size={size} counter={c.counter} counterOver={c.over} live={c.live} htmlFor={id} helpId={c.helpId} style={wrapperStyle} className={wrapperClassName}>
      <textarea ref={ref} id={id} aria-invalid={c.error ? true : undefined} aria-describedby={c.helpId} required={required || undefined} {...rest} {...c.control} />
    </Field>
  );
});
