import { forwardRef, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useControllable } from "../../utils/useControllable";
import { Icon } from "../../icons/Icon";
import { Tooltip } from "../tooltip/Tooltip";
import type { IconName } from "../../icons/icons.data";
import { LABELS } from "../../labels";
import { Button } from "../button/Button";
import { mergeRefs } from "../../utils/hooks";

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "color"> {
  /** 필터 칩 선택 상태 (제어) */
  selected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  /** 있으면 Input Chip(span + 제거 x) 으로 렌더 */
  onRemove?: () => void;
  removeLabel?: string;
  /** 라벨 앞 아이콘 */
  icon?: IconName;
  size?: "md" | "sm";
  /** 형태 — outline(기본, 회색 선) · solid(회색 면). 고른 칩은 두 형태 모두 같은 진한 면(2026-11-13) */
  variant?: "outline" | "solid";
  /** 고른 칩의 색 — brand(기본, 제품 색 면) · neutral(반전 면). 고를 수 없는 칩(onRemove · action)은 중립 고정이라 무시 */
  color?: "brand" | "neutral";
  /** 토글이 아닌 동작 칩(예: "+ 추가"). aria-pressed 없이 onClick 만 */
  action?: boolean;
}

/* 입력값 칩의 값(.lbl 240 말줄임) — 잘린 값에만 Tooltip(2026-11-12, 사이트 ds.js fitChips 와 같음). title 은 키보드로 볼 수 없어 쓰지 않는다.
   키보드는 지우기 버튼에 포커스가 오면 값을 펼쳐 읽는다(CSS). Tooltip 은 값과 같은 글이라 describe={false}(aria-hidden) */
function ChipLabel({ children }: { children: ReactNode }) {
  const el = useRef<HTMLSpanElement>(null), [cut, setCut] = useState(false);
  useLayoutEffect(() => {
    let alive = true;
    const measure = () => { const t = el.current; if (alive && t) setCut(t.scrollWidth > t.clientWidth); };
    measure();
    document.fonts?.ready.then(measure);
    return () => { alive = false; };
  }, [children]);
  const lbl = <span ref={el} className="lbl">{children}</span>;
  return cut ? <Tooltip content={children} multi describe={false}>{lbl}</Tooltip> : lbl;
}

let warned = false;
function warnFixed() {
  if (warned) return; warned = true;
  console.warn("[ds-react] Chip 의 color=\"neutral\" · selected 는 고를 수 있는 칩에만 씁니다 — onRemove · action 칩은 선택 상태가 없고 색은 중립이라 무시합니다(2026-11-13).");
}

/** 필터 조건(토글) 또는 입력값(제거 가능) 캡슐. 상태 표시는 Tag */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { selected, defaultSelected = false, onSelectedChange, onRemove, removeLabel = LABELS.remove, icon, size = "md", variant = "outline", color = "brand", action, className, children, onClick, disabled, ...rest },
  ref,
) {
  const [on, setOn] = useControllable<boolean>({ value: selected, defaultValue: defaultSelected, onChange: onSelectedChange });
  const pickable = !action && !onRemove;
  if (process.env.NODE_ENV !== "production" && !pickable && (color === "neutral" || selected)) warnFixed();
  /* 색 · 선택은 고를 수 있는 칩에만 — 입력값 칩 · 동작 칩은 형태만 받는다(사람의 결정 2026-11-13) */
  const cls = cx("chip", size === "sm" && "sm", variant === "solid" && "solid", pickable && color === "neutral" && "neutral", pickable && on && "on", className);
  if (action) {
    return (
      <button ref={ref} type="button" className={cls} disabled={disabled} onClick={onClick} {...rest}>
        {icon && <Icon name={icon} />}
        {children}
      </button>
    );
  }
  if (onRemove) {
    /* 지운 뒤 포커스 — 다음 칸, 없으면 앞 칸, 칸이 없으면 묶음 자신. Combobox 는 입력으로 돌아가므로 스스로 한다. 제품이 지우지 않았으면(확인 취소) 그대로 둔다 */
    const remove = (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (disabled) return;
      const self = e.currentTarget, chip = self.closest<HTMLElement>(".chip")!, box = chip.parentElement!;
      const spots = box.closest(".combobox") ? [] : Array.from(box.querySelectorAll<HTMLElement>(":scope > button:not([disabled]), :scope > .chip > .x:not([disabled])"));
      const at = spots.indexOf(self), to = spots[at + 1] ?? spots[at - 1];
      onRemove();
      if (at < 0) return;
      requestAnimationFrame(() => {
        if (chip.isConnected) return;
        if (to?.isConnected) to.focus({ preventScroll: true });
        else if (box.isConnected) { box.tabIndex = -1; box.focus({ preventScroll: true }); }
      });
    };
    const name = typeof children === "string" ? `${children} ${removeLabel}` : removeLabel;
    /* span 은 disabled 속성을 못 가진다 — aria-disabled 로 비활성을 알리고 CSS 가 칩과 x 를 흐린다(.btn 과 같게) */
    return (
      <span className={cls} aria-disabled={disabled || undefined} {...(rest as HTMLAttributes<HTMLSpanElement>)} onClickCapture={disabled ? (e) => { e.preventDefault(); e.stopPropagation(); } : (rest as HTMLAttributes<HTMLSpanElement>).onClickCapture}>
        {icon && <Icon name={icon} size={14} />}
        <ChipLabel>{children}</ChipLabel>
        <button type="button" className="x" aria-label={name} disabled={disabled} onClick={remove}>
          <Icon name="x" size={10} />
        </button>
      </span>
    );
  }
  return (
    <button
      ref={ref}
      type="button"
      className={cls}
      aria-pressed={on}
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) setOn(!on);
      }}
      {...rest}
    >
      {icon && <Icon name={icon} size={14} />}
      {children}
    </button>
  );
});

export interface ChipGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** true 면 끝에 '필터 초기화' — 켜진 칩이 있을 때만 준다 */
  clearable?: boolean;
  onClear?: () => void;
  clearLabel?: ReactNode;
}
export const ChipGroup = forwardRef<HTMLDivElement, ChipGroupProps>(function ChipGroup({ clearable, onClear, clearLabel = LABELS.clearFilters, className, children, ...rest }, ref) {
  const inner = useRef<HTMLDivElement>(null);
  return (
    <div ref={mergeRefs(inner, ref)} className={cx("chip-group", className)} {...rest}>
      {children}
      {clearable && (
        <Button
          variant="text"
          color="assistive"
          size="sm"
          onClick={() => {
            onClear?.();
            inner.current?.querySelector<HTMLElement>(":scope > button.chip:not([disabled])")?.focus();
          }}
        >
          {clearLabel}
        </Button>
      )}
    </div>
  );
});
