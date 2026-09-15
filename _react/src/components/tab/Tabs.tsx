import { createContext, forwardRef, useContext, type ButtonHTMLAttributes, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useControllable } from "../../utils/useControllable";
import { useId } from "../../utils/useId";

interface TabsCtx {
  value: string | undefined;
  set: (v: string) => void;
  baseId: string;
}
const Ctx = createContext<TabsCtx | null>(null);
const useTabs = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("[ds-react] Tab/TabList/TabPanel 은 <Tabs> 안에서 사용하세요.");
  return c;
};

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  children?: ReactNode;
}
/** 탭 상태 컨텍스트. 요소를 렌더하지 않는다 — TabList 와 TabPanel 을 자유롭게 배치 */
export function Tabs({ value, defaultValue, onChange, children }: TabsProps) {
  const [cur, set] = useControllable<string | undefined>({ value, defaultValue, onChange: onChange as (v: string | undefined) => void });
  const baseId = useId(undefined, "tabs");
  return <Ctx.Provider value={{ value: cur, set: (v) => set(v), baseId }}>{children}</Ctx.Provider>;
}

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  /** 캡슐형(보조 전환) */
  pill?: boolean;
  /** 13.5px */
  sm?: boolean;
  /** 활성 색 accent */
  accent?: boolean;
  /** aria-label */
  label?: string;
}
/** role=tablist. ←→ Home End 로 이동(선택 즉시 전환) */
export const TabList = forwardRef<HTMLDivElement, TabListProps>(function TabList({ pill, sm, accent, label, className, onKeyDown, ...rest }, ref) {
  const { set } = useTabs();
  const keyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(e.key)) return;
    const tabs = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'));
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (!tabs.length) return;
    let n = i;
    if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
    if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = tabs.length - 1;
    e.preventDefault();
    tabs[n].focus();
    const v = tabs[n].dataset.value;
    if (v !== undefined) set(v);
  };
  return <div ref={ref} className={cx("tabs", { pill, sm, accent }, className)} role="tablist" aria-label={label} onKeyDown={keyDown} {...rest} />;
});

export interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: string;
  /** 건수 배지 */
  count?: number | string;
}
export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab({ value, count, className, children, onClick, disabled, ...rest }, ref) {
  const { value: cur, set, baseId } = useTabs();
  const on = cur === value;
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={on}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={on ? 0 : -1}
      data-value={value}
      className={cx("tab", on && "on", className)}
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) set(value);
      }}
      {...rest}
    >
      {children}
      {count !== undefined && <span className="count">{count}</span>}
    </button>
  );
});

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  /** 비활성일 때도 DOM 유지(hidden) */
  keepMounted?: boolean;
}
export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(function TabPanel({ value, keepMounted, className, ...rest }, ref) {
  const { value: cur, baseId } = useTabs();
  const on = cur === value;
  if (!on && !keepMounted) return null;
  return <div ref={ref} role="tabpanel" id={`${baseId}-panel-${value}`} aria-labelledby={`${baseId}-tab-${value}`} hidden={!on} className={cx("tab-panel", className)} {...rest} />;
});
