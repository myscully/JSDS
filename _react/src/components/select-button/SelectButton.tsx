import { forwardRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useControllable } from "../../utils/useControllable";
import { Icon } from "../../icons/Icon";
import type { IconName } from "../../icons/icons.data";

export interface SelectButtonOption<T extends string = string> {
  value: T;
  label: ReactNode;
  icon?: IconName;
  disabled?: boolean;
}

export interface SelectButtonProps<T extends string = string> extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: SelectButtonOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  /** 아웃라인형 (툴바용) */
  outline?: boolean;
  /** 고른 버튼을 solid(제품 색 면 + 흰 글자)로. outline 과 함께만 쓴다 */
  solid?: boolean;
  /** 그룹 이름 (aria-label) */
  label?: string;
}

function SelectButtonInner<T extends string>(
  { options, value, defaultValue, onChange, outline, solid, label, className, ...rest }: SelectButtonProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  if (process.env.NODE_ENV !== "production" && solid && !outline) console.warn("[ds-react] SelectButton solid 는 outline 과 함께만 씁니다 — outline 없이는 무시합니다.");
  const [cur, set] = useControllable<T | undefined>({ value, defaultValue: defaultValue ?? options[0]?.value, onChange: onChange as (v: T | undefined) => void });
  /* Tab 은 묶음에 한 번 — 고른 항목, 고른 것이 비활성이면 첫 활성 항목 */
  const live = options.filter((o) => !o.disabled);
  const stop = live.find((o) => o.value === cur) ?? live[0];
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const d = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[e.key];
    const at = live.findIndex((o) => o.value === (e.target as HTMLElement).dataset.value);
    if (!d || at < 0 || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    const to = live[(at + d + live.length) % live.length];
    set(to.value);
    e.currentTarget.querySelector<HTMLElement>(`[data-value="${to.value}"]`)?.focus();
  };
  return (
    <div ref={ref} className={cx("select-btn", { outline, solid: outline && solid }, className)} role="radiogroup" aria-label={label} onKeyDown={onKeyDown} {...rest}>
      {options.map((o) => {
        const on = o.value === cur;
        return (
          <button key={o.value} type="button" role="radio" className={on ? "on" : undefined} aria-checked={on} tabIndex={o === stop ? 0 : -1} data-value={o.value} disabled={o.disabled} onClick={() => set(o.value)}>
            {o.icon && <Icon name={o.icon} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** 2~5개 중 하나를 즉시 선택하는 세그먼트 컨트롤. Tab 은 한 번, 화살표로 옮기면 바로 고른다 */
export const SelectButton = forwardRef(SelectButtonInner) as <T extends string = string>(
  props: SelectButtonProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => ReturnType<typeof SelectButtonInner>;
