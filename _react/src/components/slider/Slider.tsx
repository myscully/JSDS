import { forwardRef, useEffect, useState, type CSSProperties, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useControllable } from "../../utils/useControllable";
import { useId } from "../../utils/useId";
import { NumberInput } from "../number-input/NumberInput";
import type { ValidationMessages } from "../text-field/validation";

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step" | "size"> {
  label?: ReactNode;
  value?: number;
  defaultValue?: number;
  /** withInput 이면 입력칸에 친 수(범위 밖도 — 오류로 알림)마다. 빈 칸 · 숫자가 아닌 글자에는 부르지 않는다 */
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** 현재 값 표기. 기본 숫자 그대로 */
  valueText?: (value: number) => ReactNode;
  /** 눈금 라벨 */
  ticks?: ReactNode[];
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
  /** 트랙 오른쪽에 숫자 입력칸(Number Input) — 두 칸이 값 하나. 제출하는 값(name)은 입력칸. label 은 글자여야 한다(버튼 이름에 쓴다) */
  withInput?: boolean;
  /** withInput 의 단위 — 입력칸 안 뒤 · 트랙의 aria-valuetext */
  unit?: string;
  /** withInput 의 도움말(범위) · 오류 · 문구 */
  help?: ReactNode;
  error?: boolean | ReactNode;
  messages?: ValidationMessages;
}

/** 범위 안의 값을 드래그로 선택. 채워진 트랙은 --p 로 계산. ref 는 트랙(range)이다 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { label, value, defaultValue, onChange, min = 0, max = 100, step = 1, valueText, ticks, id: idProp, disabled, wrapperClassName, wrapperStyle, style, withInput, unit, help, error, messages, ...rest },
  ref,
) {
  const id = useId(idProp);
  const [cur, set] = useControllable<number>({ value, defaultValue: defaultValue ?? min, onChange });
  /* 입력칸의 글자는 고치지 않는다 — 범위 밖 · 친 중인 글자를 그대로 두고, 트랙만 가까운 끝에 둔다(사람의 결정 2026-11-11) */
  const [text, setText] = useState(String(cur));
  useEffect(() => { if (text === "" || Number(text) !== cur) setText(String(cur)); }, [cur]);   // 제품이 값을 바꿨을 때만 따라간다
  const pos = Math.min(max, Math.max(min, cur));
  const pct = max > min ? ((pos - min) / (max - min)) * 100 : 0;

  if (withInput) {
    const range = (
      <div className="slider">
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={pos}
          disabled={disabled}
          aria-labelledby={`${id}-label`}
          aria-valuetext={unit ? `${pos}${unit}` : undefined}
          onChange={(e) => set(Number(e.target.value))}   // 입력칸 글자는 아래 effect 가 따라간다
          style={{ "--p": `${pct}%`, ...style } as CSSProperties}
        />
      </div>
    );
    return (
      <NumberInput
        {...rest}
        id={id}
        label={String(label ?? "")}
        min={min}
        max={max}
        step={step}
        unit={unit}
        help={help}
        error={error}
        messages={messages}
        disabled={disabled}
        value={text}
        onChange={(e) => { setText(e.target.value); if (e.target.value !== "" && !e.target.validity.badInput) set(Number(e.target.value)); }}
        wrapperClassName={cx("slider-field", wrapperClassName)}
        wrapperStyle={wrapperStyle}
        wrapControl={(control) => <div className="slider-control">{range}{control}</div>}
      />
    );
  }

  const shown = valueText ? valueText(cur) : String(cur);
  return (
    <div className={cx("slider", wrapperClassName)} style={wrapperStyle}>
      <div className="row">
        <label htmlFor={id}>{label}</label>
        <span className="val">{disabled && !valueText ? "—" : shown}</span>
      </div>
      <input
        ref={ref}
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={cur}
        disabled={disabled}
        aria-valuetext={valueText && typeof shown === "string" ? shown : undefined}
        onChange={(e) => set(Number(e.target.value))}
        style={{ "--p": `${pct}%`, ...style } as CSSProperties}
        {...rest}
      />
      {ticks && (
        <div className="ticks">
          {ticks.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
});
