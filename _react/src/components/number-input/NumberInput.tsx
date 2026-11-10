import { forwardRef, useContext, useImperativeHandle, useRef, useState, type ChangeEvent, type FocusEvent } from "react";
import { cx } from "../../utils/cx";
import { Icon } from "../../icons/Icon";
import { TextField, type TextFieldProps } from "../text-field/TextField";
import { FormValidationContext, validationMessage } from "../text-field/validation";

const LABELS = { decrease: "줄이기", increase: "늘리기" };

export interface NumberInputProps extends Omit<TextFieldProps, "type" | "prefix" | "suffix" | "trailing" | "reveal" | "revealLabel" | "maxLength" | "showCount" | "mono" | "min" | "max" | "step" | "label"> {
  /** 값의 이름 — 라벨과 증감 버튼의 이름 */
  label: string;
  min?: number;
  max?: number;
  /** 증감 폭. 기본 1 */
  step?: number;
  /** 입력칸 안쪽 뒤의 단위 */
  unit?: string;
  labels?: Partial<typeof LABELS>;
}

/** 정확한 수 — 입력칸 안의 단위 · 증감 버튼, 위 · 아래 화살표. 범위 밖 값은 받아서 오류로 알린다 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { label, min, max, step, unit, labels, value, defaultValue, onChange, onBlur, error, messages, wrapperClassName, disabled, readOnly, ...rest },
  ref,
) {
  const form = useContext(FormValidationContext);
  const input = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => input.current as HTMLInputElement);
  const [typed, setTyped] = useState(String(defaultValue ?? ""));
  const [local, setLocal] = useState("");
  const L = { ...LABELS, ...labels };
  const current = value !== undefined ? String(value) : typed;
  const n = current === "" ? NaN : Number(current);
  const off = !!disabled || !!readOnly;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTyped(e.target.value);
    if (!form && local) setLocal(validationMessage(e.target, messages));   // 고치면 바로 지운다
    onChange?.(e);
  };
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (!form && (e.target.value || e.target.validity.badInput)) setLocal(validationMessage(e.target, messages));
    onBlur?.(e);
  };
  const stepBy = (up: boolean) => {
    const el = input.current as HTMLInputElement;
    if (up) el.stepUp(); else el.stepDown();
    el.focus({ preventScroll: true });   // 끝에 닿아 버튼이 꺼져도 포커스를 잃지 않게
    el.dispatchEvent(new Event("input", { bubbles: true }));   // React 의 onChange 로 이어진다
  };
  return (
    <TextField
      {...rest}
      ref={input}
      label={label}
      type="number"
      min={min}
      max={max}
      step={step}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      readOnly={readOnly}
      messages={messages}
      error={error || local || undefined}
      suffix={unit}
      aria-valuetext={unit && current !== "" ? `${current}${unit}` : undefined}
      wrapperClassName={cx("number-field", wrapperClassName)}
      onChange={handleChange}
      onBlur={handleBlur}
      trailing={
        <>
          <button type="button" className="num-btn down" tabIndex={-1} aria-label={`${label} ${L.decrease}`} disabled={off || (min !== undefined && n <= min)} onClick={() => stepBy(false)}><Icon name="minus" size={16} /></button>
          <button type="button" className="num-btn up" tabIndex={-1} aria-label={`${label} ${L.increase}`} disabled={off || (max !== undefined && n >= max)} onClick={() => stepBy(true)}><Icon name="plus" size={16} /></button>
        </>
      }
    />
  );
});
