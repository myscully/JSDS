import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type LiHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";
import { useControllable } from "../../utils/useControllable";
import { useId } from "../../utils/useId";
import { useEscape, useOutsideClick, mergeRefs } from "../../utils/hooks";
import { Icon } from "../../icons/Icon";
import type { IconName } from "../../icons/icons.data";

type Kind = "select" | "menu";
interface DDCtx {
  open: boolean;
  setOpen: (o: boolean) => void;
  kind: Kind;
  menuId: string;
  align: "start" | "end";
  disabled?: boolean;
  rootRef: React.RefObject<HTMLDivElement | null>;
}
const Ctx = createContext<DDCtx | null>(null);
const useDD = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("[ds-react] DropdownTrigger/Menu 는 <Dropdown> 안에서 사용하세요.");
  return c;
};

export interface DropdownProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** select: role=listbox 값 선택 · menu: role=menu 액션 목록 */
  kind?: Kind;
  /** 메뉴 정렬. end 는 트리거 우측 기준 */
  align?: "start" | "end";
  disabled?: boolean;
}

const ITEM_SEL = '[role="option"]:not([aria-disabled="true"]),[role="menuitem"]:not([aria-disabled="true"])';

/** 열림/닫힘 · 바깥 클릭 · Esc · 방향키를 관리하는 컨테이너(.dropdown) */
export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(function Dropdown(
  { open, defaultOpen = false, onOpenChange, kind = "select", align = "start", disabled, className, children, onKeyDown, ...rest },
  ref,
) {
  const [isOpen, setOpen] = useControllable<boolean>({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId(undefined, "menu");
  useOutsideClick([rootRef], () => setOpen(false), isOpen);
  useEscape(() => {
    setOpen(false);
    rootRef.current?.querySelector<HTMLElement>("[aria-haspopup]")?.focus();
  }, isOpen);
  useEffect(() => {
    if (!isOpen || !rootRef.current) return;
    const t = window.setTimeout(() => {
      const items = rootRef.current!.querySelectorAll<HTMLElement>(ITEM_SEL);
      const sel = Array.from(items).find((i) => i.getAttribute("aria-selected") === "true");
      (sel ?? items[0])?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [isOpen]);
  const keyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (!isOpen) {
      if (["ArrowDown", "ArrowUp"].includes(e.key) && !disabled) { e.preventDefault(); setOpen(true); }
      return;
    }
    const items = Array.from(rootRef.current!.querySelectorAll<HTMLElement>(ITEM_SEL));
    if (!items.length) return;
    const i = items.indexOf(document.activeElement as HTMLElement);
    let n: number | null = null;
    if (e.key === "ArrowDown") n = (i + 1) % items.length;
    if (e.key === "ArrowUp") n = (i - 1 + items.length) % items.length;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = items.length - 1;
    if (n !== null) { e.preventDefault(); items[n].focus(); }
    if ((e.key === "Enter" || e.key === " ") && i >= 0) { e.preventDefault(); items[i].click(); }
    if (e.key === "Tab") setOpen(false);
  };
  return (
    <Ctx.Provider value={{ open: isOpen, setOpen, kind, menuId, align, disabled, rootRef }}>
      <div ref={mergeRefs(rootRef, ref)} className={cx("dropdown", isOpen && "open", className)} onKeyDown={keyDown} {...rest}>
        {children}
      </div>
    </Ctx.Provider>
  );
});

export interface DropdownTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 값이 없을 때 표시 */
  placeholder?: ReactNode;
  /** 자식 요소(예: <Button>)를 트리거로 사용 — aria/onClick 을 주입 */
  asChild?: boolean;
}
/** 기본 트리거(button.trigger). 현재 값을 children 으로 표시 */
export const DropdownTrigger = forwardRef<HTMLButtonElement, DropdownTriggerProps>(function DropdownTrigger(
  { placeholder, asChild, className, children, onClick, disabled: disabledProp, ...rest },
  ref,
) {
  const { open, setOpen, kind, menuId, disabled } = useDD();
  const isDisabled = disabledProp ?? disabled;
  const a11y = { "aria-haspopup": kind === "select" ? ("listbox" as const) : ("menu" as const), "aria-expanded": open, "aria-controls": open ? menuId : undefined };
  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented && !isDisabled) setOpen(!open);
  };
  if (asChild && isValidElement(children)) {
    const child = Children.only(children) as ReactElement<Record<string, unknown>>;
    return cloneElement(child, { ...a11y, ref, disabled: isDisabled, onClick: toggle, ...rest } as Record<string, unknown>);
  }
  return (
    <button ref={ref} type="button" className={cx("trigger", className)} disabled={isDisabled} onClick={toggle} {...a11y} {...rest}>
      {children ?? (placeholder !== undefined && <span className="placeholder">{placeholder}</span>)}
    </button>
  );
});

export interface MenuProps extends HTMLAttributes<HTMLUListElement> {
  /** aria-label */
  label?: string;
}
/** ul.menu — 열려 있을 때만 렌더. role 은 Dropdown kind 를 따른다 */
export const Menu = forwardRef<HTMLUListElement, MenuProps>(function Menu({ label, className, style, ...rest }, ref) {
  const { open, kind, menuId, align } = useDD();
  if (!open) return null;
  const alignStyle: CSSProperties | undefined = align === "end" ? { left: "auto", right: 0 } : undefined;
  return <ul ref={ref} id={menuId} className={cx("menu", className)} role={kind === "select" ? "listbox" : "menu"} aria-label={label} style={{ ...alignStyle, ...style }} {...rest} />;
});

export interface MenuItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, "onSelect"> {
  /** 선택됨 (.on + aria-selected) — select 용 */
  selected?: boolean;
  /** 위험 액션 (마지막에, 구분선 아래) */
  danger?: boolean;
  disabled?: boolean;
  icon?: IconName;
  /** 우측 단축키 힌트 */
  hint?: ReactNode;
  onSelect?: () => void;
  /** 선택 후 닫기 (기본 true) */
  closeOnSelect?: boolean;
}
export const MenuItem = forwardRef<HTMLLIElement, MenuItemProps>(function MenuItem(
  { selected, danger, disabled, icon, hint, onSelect, closeOnSelect = true, className, children, onClick, ...rest },
  ref,
) {
  const { kind, setOpen } = useDD();
  return (
    <li
      ref={ref}
      role={kind === "select" ? "option" : "menuitem"}
      className={cx("menu-item", selected && "on", danger && "danger", className)}
      aria-selected={kind === "select" && selected ? true : undefined}
      aria-disabled={disabled ? true : undefined}
      tabIndex={disabled ? undefined : -1}
      onClick={(e) => {
        onClick?.(e);
        if (disabled || e.defaultPrevented) return;
        onSelect?.();
        if (closeOnSelect) setOpen(false);
      }}
      {...rest}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
      {hint !== undefined && <span className="hint">{hint}</span>}
    </li>
  );
});

export const MenuSep = forwardRef<HTMLLIElement, LiHTMLAttributes<HTMLLIElement>>(function MenuSep({ className, ...rest }, ref) {
  return <li ref={ref} className={cx("menu-sep", className)} role="separator" {...rest} />;
});
export const MenuLabel = forwardRef<HTMLLIElement, LiHTMLAttributes<HTMLLIElement>>(function MenuLabel({ className, ...rest }, ref) {
  return <li ref={ref} className={cx("menu-label", className)} {...rest} />;
});

export interface SelectOption<T extends string = string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}
export interface SelectProps<T extends string = string> extends Omit<DropdownProps, "kind" | "onChange" | "defaultValue"> {
  options: SelectOption<T>[];
  value?: T | null;
  defaultValue?: T | null;
  onChange?: (value: T) => void;
  placeholder?: ReactNode;
  /** 목록 aria-label */
  label?: string;
  triggerClassName?: string;
  triggerStyle?: CSSProperties;
}
function SelectInner<T extends string>(
  { options, value, defaultValue = null, onChange, placeholder, label, triggerClassName, triggerStyle, disabled, ...rest }: SelectProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const [cur, set] = useControllable<T | null>({ value, defaultValue, onChange: onChange as (v: T | null) => void });
  const current = options.find((o) => o.value === cur);
  return (
    <Dropdown ref={ref} kind="select" disabled={disabled} {...rest}>
      <DropdownTrigger placeholder={placeholder} className={triggerClassName} style={triggerStyle}>
        {current ? current.label : undefined}
      </DropdownTrigger>
      <Menu label={label}>
        {options.map((o) => (
          <MenuItem key={o.value} selected={o.value === cur} disabled={o.disabled} onSelect={() => set(o.value)}>
            {o.label}
          </MenuItem>
        ))}
      </Menu>
    </Dropdown>
  );
}
/** Dropdown + Trigger + listbox 를 묶은 값 선택 컴포넌트 */
export const Select = forwardRef(SelectInner) as <T extends string = string>(props: SelectProps<T> & { ref?: React.Ref<HTMLDivElement> }) => ReturnType<typeof SelectInner>;
