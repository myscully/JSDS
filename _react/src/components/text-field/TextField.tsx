import { forwardRef, type CSSProperties, type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import { useId } from "../../utils/useId";
import type { Size } from "../../types";

export interface FieldOwnProps {
  label?: ReactNode;
  /** 라벨 뒤 * 표시 (input 의 required 와 별개로 시각 표시) */
  required?: boolean;
  /** 아래 도움말. error 가 문자열이면 그 문구가 대신 표시 */
  help?: ReactNode;
  /** true 또는 오류 메시지. 보더 danger + aria-invalid */
  error?: boolean | ReactNode;
  /** 입력 높이 36 / 44 / 52 */
  size?: Size;
  /** 라벨 오른쪽 글자 수 표시 (showCount) */
  counter?: ReactNode;
}

export interface FieldProps extends FieldOwnProps, Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** 컨트롤의 id — label[for] 연결 */
  htmlFor?: string;
  /** help 요소 id — 컨트롤의 aria-describedby 에 넣는다 */
  helpId?: string;
  children?: ReactNode;
}

/** 라벨 · 컨트롤 · 도움말을 묶는 필드 셸. TextField/TextArea 가 사용하고, Dropdown 등 다른 컨트롤도 감쌀 수 있다 */
export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(
  { label, required, help, error, size = "md", counter, htmlFor, helpId, className, children, ...rest },
  ref,
) {
  const helpText = typeof error === "string" || (error && typeof error !== "boolean") ? error : help;
  const labelEl = label !== undefined && (
    <label htmlFor={htmlFor}>
      {label}
      {required && <em>*</em>}
    </label>
  );
  return (
    <div ref={ref} className={cx("field", size !== "md" && size, { error: Boolean(error) }, className)} {...rest}>
      {counter !== undefined ? (
        <div className="row">
          {labelEl}
          <span className="counter">{counter}</span>
        </div>
      ) : (
        labelEl
      )}
      {children}
      {helpText !== undefined && helpText !== false && (
        <span className="help" id={helpId}>
          {helpText}
        </span>
      )}
    </div>
  );
});

type InputBase = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix">;
export interface TextFieldProps extends FieldOwnProps, InputBase {
  /** 접두어 (예: https://) — .affix 컨테이너로 감싼다 */
  prefix?: ReactNode;
  /** 접미어 (예: 일, %) */
  suffix?: ReactNode;
  /** maxLength 와 함께 "n / max" 카운터 표시 */
  showCount?: boolean;
  /** 래퍼(.field) 스타일 */
  wrapperStyle?: CSSProperties;
  wrapperClassName?: string;
}

/** 한 줄 텍스트 입력 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, required, help, error, size, prefix, suffix, showCount, wrapperStyle, wrapperClassName, id: idProp, className, maxLength, value, defaultValue, ...rest },
  ref,
) {
  const id = useId(idProp);
  const helpId = help || error ? `${id}-help` : undefined;
  const len = String(value ?? defaultValue ?? "").length;
  const counter = showCount ? `${len}${maxLength ? ` / ${maxLength}` : ""}` : undefined;
  const input = (
    <input
      ref={ref}
      id={id}
      type="text"
      className={className}
      maxLength={maxLength}
      value={value}
      defaultValue={defaultValue}
      aria-invalid={error ? true : undefined}
      aria-describedby={helpId}
      required={required || undefined}
      {...rest}
    />
  );
  return (
    <Field label={label} required={required} help={help} error={error} size={size} counter={counter} htmlFor={id} helpId={helpId} style={wrapperStyle} className={wrapperClassName}>
      {prefix !== undefined || suffix !== undefined ? (
        <div className="affix">
          {prefix !== undefined && <span>{prefix}</span>}
          {input}
          {suffix !== undefined && <span>{suffix}</span>}
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
}
/** 여러 줄 입력 (최소 96px, 세로 리사이즈) */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, required, help, error, size, wrapperStyle, wrapperClassName, id: idProp, ...rest },
  ref,
) {
  const id = useId(idProp);
  const helpId = help || error ? `${id}-help` : undefined;
  return (
    <Field label={label} required={required} help={help} error={error} size={size} htmlFor={id} helpId={helpId} style={wrapperStyle} className={wrapperClassName}>
      <textarea ref={ref} id={id} aria-invalid={error ? true : undefined} aria-describedby={helpId} {...rest} />
    </Field>
  );
});
