import { createContext, forwardRef, useContext, type ChangeEvent, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useControllable } from "../../utils/useControllable";
import { useId } from "../../utils/useId";

interface RadioCtx {
  name: string;
  value: string | undefined;
  set: (v: string) => void;
  card?: boolean;
  disabled?: boolean;
}
const Ctx = createContext<RadioCtx | null>(null);

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLElement>, "onChange" | "defaultValue"> {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** 그룹 질문. 있으면 fieldset/legend 로 렌더 */
  legend?: ReactNode;
  /** 가로 배치 */
  row?: boolean;
  /** 자식 Radio 를 카드형으로 */
  card?: boolean;
  disabled?: boolean;
}

/** 라디오 그룹. 같은 name 을 자동 부여하고 선택 상태를 관리한다 */
export const RadioGroup = forwardRef<HTMLElement, RadioGroupProps>(function RadioGroup(
  { name: nameProp, value, defaultValue, onChange, legend, row, card, disabled, className, children, ...rest },
  ref,
) {
  const name = useId(nameProp, "radio");
  const [cur, set] = useControllable<string | undefined>({ value, defaultValue, onChange: onChange as (v: string | undefined) => void });
  const ctx: RadioCtx = { name, value: cur, set: (v) => set(v), card, disabled };
  const cls = cx("radio-group", { row }, className);
  return (
    <Ctx.Provider value={ctx}>
      {legend !== undefined ? (
        <fieldset ref={ref as React.Ref<HTMLFieldSetElement>} className={cls} style={{ border: 0, padding: 0, margin: 0 }} {...rest}>
          <legend className="t-label-1" style={{ marginBottom: 8 }}>{legend}</legend>
          {children}
        </fieldset>
      ) : (
        <div ref={ref as React.Ref<HTMLDivElement>} className={cls} {...rest}>{children}</div>
      )}
    </Ctx.Provider>
  );
});

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value" | "children"> {
  value?: string;
  children?: ReactNode;
  description?: ReactNode;
  /** 카드형 (보더 + 선택 시 accent) */
  card?: boolean;
  onChange?: (value: string, e: ChangeEvent<HTMLInputElement>) => void;
  wrapperClassName?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { value, children, description, card, onChange, checked, defaultChecked, name, disabled, className, wrapperClassName, ...rest },
  ref,
) {
  const g = useContext(Ctx);
  const isCard = card ?? g?.card;
  const controlled = g && value !== undefined ? { checked: g.value === value } : { checked, defaultChecked };
  return (
    <label className={cx("radio", isCard && "card", wrapperClassName)}>
      <input
        ref={ref}
        type="radio"
        name={name ?? g?.name}
        value={value}
        disabled={disabled ?? g?.disabled}
        className={className}
        onChange={(e) => {
          if (value !== undefined) g?.set(value);
          onChange?.(value ?? e.target.value, e);
        }}
        {...controlled}
        {...rest}
      />
      {children !== undefined && (
        <span>
          {children}
          {description !== undefined && <small>{description}</small>}
        </span>
      )}
    </label>
  );
});
