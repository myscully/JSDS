import { forwardRef, type CSSProperties, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useControllable } from "../../utils/useControllable";
import { useId } from "../../utils/useId";

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step"> {
  label?: ReactNode;
  value?: number;
  defaultValue?: number;
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
}

/** 범위 안의 값을 드래그로 선택. 채워진 트랙은 --p 로 계산 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { label, value, defaultValue, onChange, min = 0, max = 100, step = 1, valueText, ticks, id: idProp, disabled, wrapperClassName, wrapperStyle, style, ...rest },
  ref,
) {
  const id = useId(idProp);
  const [cur, set] = useControllable<number>({ value, defaultValue: defaultValue ?? min, onChange });
  const pct = max > min ? ((cur - min) / (max - min)) * 100 : 0;
  const text = valueText ? valueText(cur) : String(cur);
  return (
    <div className={cx("slider", wrapperClassName)} style={wrapperStyle}>
      <div className="row">
        <label htmlFor={id}>{label}</label>
        <span className="val">{disabled && !valueText ? "—" : text}</span>
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
