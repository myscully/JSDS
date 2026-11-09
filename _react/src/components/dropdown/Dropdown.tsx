import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type AnchorHTMLAttributes,
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
import { useMenuPlacement } from "../../utils/useMenuPlacement";
import { typeahead, type TypeaheadState } from "../../utils/typeahead";
import { Icon } from "../../icons/Icon";
import type { IconName } from "../../icons/icons.data";
import { Button } from "../button/Button";
import { FieldContext } from "../text-field/TextField";
import { FormValidationContext } from "../text-field/validation";

type Kind = "select" | "menu";
interface DDCtx {
  open: boolean;
  setOpen: (o: boolean) => void;
  /** 닫고 트리거로 포커스를 돌린다 */
  closeToTrigger: () => void;
  kind: Kind;
  menuId: string;
  align: "start" | "end";
  disabled?: boolean;
  keepMounted?: boolean;
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
  /** 닫혀 있어도 ul.menu 를 hidden 으로 유지(정적 마크업과 동일 구조) */
  keepMounted?: boolean;
}

const ITEM_SEL = '[role="option"]:not([aria-disabled="true"]),[role="menuitem"]:not([aria-disabled="true"])';

/** 열림/닫힘 · 바깥 클릭 · Esc · 방향키를 관리하는 컨테이너(.dropdown) */
export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(function Dropdown(
  { open, defaultOpen = false, onOpenChange, kind = "select", align = "start", disabled, keepMounted, className, style, children, onKeyDown, ...rest },
  ref,
) {
  const [isOpen, setOpen] = useControllable<boolean>({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId(undefined, "menu");
  const typing = useRef<TypeaheadState>({ s: "", t: 0 });
  useOutsideClick([rootRef], () => setOpen(false), isOpen);
  const closeToTrigger = () => {
    setOpen(false);
    rootRef.current?.querySelector<HTMLElement>("[aria-haspopup]")?.focus({ preventScroll: true });
  };
  const { up, floating, vars } = useMenuPlacement(rootRef, "[aria-haspopup]", isOpen, closeToTrigger);
  useEscape(closeToTrigger, isOpen);
  useEffect(() => {
    if (!isOpen || !rootRef.current) return;
    const t = window.setTimeout(() => {
      const items = rootRef.current!.querySelectorAll<HTMLElement>(ITEM_SEL);
      const sel = Array.from(items).find((i) => i.getAttribute("aria-selected") === "true");
      (sel ?? items[0] ?? rootRef.current!.querySelector<HTMLElement>(".menu-state button"))?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [isOpen]);
  const keyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (!isOpen) {
      if (["ArrowDown", "ArrowUp"].includes(e.key) && !disabled) { e.preventDefault(); setOpen(true); }
      return;
    }
    if (e.key === "Tab") {   // 트리거에서 다음 칸으로 — 목록 안에서 Tab 하면 어디로 갈지 브라우저도 모른다
      rootRef.current!.querySelector<HTMLElement>("[aria-haspopup]")?.focus();
      setOpen(false);
      return;
    }
    const items = Array.from(rootRef.current!.querySelectorAll<HTMLElement>(ITEM_SEL));
    if (!items.length) return;
    if (e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const hit = typeahead(typing.current, e.key, items, document.activeElement);
      if (hit) { e.preventDefault(); hit.focus(); }
      return;
    }
    const i = items.indexOf(document.activeElement as HTMLElement);
    let n: number | null = null;
    if (e.key === "ArrowDown") n = (i + 1) % items.length;
    if (e.key === "ArrowUp") n = (i - 1 + items.length) % items.length;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = items.length - 1;
    if (n !== null) { e.preventDefault(); items[n].focus(); }
    if ((e.key === "Enter" || e.key === " ") && i >= 0) { e.preventDefault(); items[i].click(); }
  };
  return (
    <Ctx.Provider value={{ open: isOpen, setOpen, closeToTrigger, kind, menuId, align, disabled, keepMounted, rootRef }}>
      <div ref={mergeRefs(rootRef, ref)} className={cx("dropdown", isOpen && "open", up && "up", floating && "float", className)} style={{ ...vars, ...style }} onKeyDown={keyDown} {...rest}>
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
/** ul.menu — 열려 있을 때만 렌더(keepMounted 면 hidden 으로 유지). role 은 Dropdown kind 를 따른다 */
export const Menu = forwardRef<HTMLUListElement, MenuProps>(function Menu({ label, className, style, ...rest }, ref) {
  const { open, kind, menuId, align, keepMounted } = useDD();
  if (!open && !keepMounted) return null;
  const alignStyle: CSSProperties | undefined = align === "end" ? { left: "auto", right: 0 } : undefined;
  return <ul ref={ref} id={menuId} className={cx("menu", className)} role={kind === "select" ? "listbox" : "menu"} aria-label={label} hidden={!open || undefined} style={{ ...alignStyle, ...style }} {...rest} />;
});

export interface MenuItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, "onSelect"> {
  /** 선택됨 (.on + aria-selected) — Select 전용. 동작 메뉴에서는 그리지 않는다 */
  selected?: boolean;
  /** 이동 항목 — li[role=none] 안의 진짜 링크 */
  href?: string;
  target?: string;
  rel?: string;
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
  { selected, danger, disabled, icon, hint, onSelect, closeOnSelect = true, href, target, rel, className, children, onClick, ...rest },
  ref,
) {
  const { kind, closeToTrigger } = useDD();
  if (process.env.NODE_ENV !== "production" && kind === "menu" && selected) console.warn("[ds-react] MenuItem selected 는 동작 메뉴에서 쓰지 않습니다 — 현재 값을 보여 주려면 Select · SelectButton (MIGRATION.md).");
  const cls = cx("menu-item", kind === "select" && selected && "on", danger && "danger", className);
  const body = (
    <>
      {icon && <Icon name={icon} size={16} />}
      {children}
      {hint !== undefined && <span className="hint">{hint}</span>}
    </>
  );
  const handle = (e: React.MouseEvent<HTMLElement>) => {
    onClick?.(e as React.MouseEvent<HTMLLIElement>);
    if (disabled || e.defaultPrevented) return;
    onSelect?.();
    if (closeOnSelect) closeToTrigger();
  };
  if (href !== undefined) {
    return (
      <li ref={ref} role="none">
        <a className={cls} role="menuitem" href={disabled ? undefined : href} target={target} rel={rel} aria-disabled={disabled ? true : undefined} tabIndex={-1} onClick={handle} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
          {body}
        </a>
      </li>
    );
  }
  return (
    <li
      ref={ref}
      role={kind === "select" ? "option" : "menuitem"}
      className={cls}
      aria-selected={kind === "select" && selected ? true : undefined}
      aria-disabled={disabled ? true : undefined}
      tabIndex={disabled ? undefined : -1}
      onClick={handle}
      {...rest}
    >
      {body}
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
  /** 제출할 이름 — 숨은 input */
  name?: string;
  /** <Form validate> 안에서 필수 검사 */
  required?: boolean;
  /** 목록 상태 — 있으면 항목 대신 한 줄. 옵션이 없으면 empty */
  status?: MenuStatus;
  statusText?: string;
  onRetry?: () => void;
}

export type MenuStatus = "loading" | "error" | "empty";
const MENU_STATUS_TEXT: Record<MenuStatus, string> = { loading: "불러오는 중입니다.", error: "목록을 불러오지 못했습니다.", empty: "선택할 수 있는 항목이 없습니다." };
/** 메뉴 안 상태 한 줄 — Select · Combobox */
export function MenuState({ status, text, onRetry }: { status: MenuStatus; text?: string; onRetry?: () => void }) {
  return (
    <li className="menu-state" role="presentation">
      {status === "loading" && <span className="spinner sm" aria-hidden="true" />}
      {text ?? MENU_STATUS_TEXT[status]}
      {status === "error" && onRetry && <Button type="button" size="sm" variant="text" color="primary" onClick={onRetry}>다시 시도</Button>}
    </li>
  );
}

function SelectInner<T extends string>(
  { options, value, defaultValue = null, onChange, placeholder, label, triggerClassName, triggerStyle, disabled, name, required, status, statusText, onRetry, onOpenChange, ...rest }: SelectProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const [cur, set] = useControllable<T | null>({ value, defaultValue, onChange: onChange as (v: T | null) => void });
  const field = useContext(FieldContext);
  const form = useContext(FormValidationContext);
  const trigger = useRef<HTMLButtonElement>(null);
  const [isOpen, track] = useState(Boolean(rest.open ?? rest.defaultOpen));
  const hasValue = cur !== null && cur !== "";   // 값 "" 는 '선택 안 함' — placeholder 로 돌아간다
  const current = hasValue ? options.find((o) => o.value === cur) : undefined;
  const state = status ?? (options.length ? undefined : ("empty" as const));
  /* 검증 — 닫힐 때 · 값이 바뀌었을 때. 고르면 바로 지운다 */
  const seen = useRef({ cur, isOpen });
  useEffect(() => {
    if (seen.current.cur === cur && seen.current.isOpen === isOpen) return;
    seen.current = { cur, isOpen };
    if (!isOpen && trigger.current) form?.touch(trigger.current);
  }, [cur, isOpen, form]);
  return (
    <Dropdown ref={ref} kind="select" disabled={disabled} onOpenChange={(o) => { track(o); onOpenChange?.(o); }} {...rest}>
      <DropdownTrigger
        ref={trigger}
        placeholder={placeholder}
        className={triggerClassName}
        style={triggerStyle}
        id={field?.controlId}
        aria-labelledby={field?.labelId ? `${field.labelId} ${field.controlId}` : undefined}
        aria-describedby={field?.helpId}
        aria-invalid={field?.error || undefined}
        data-ds-field={form ? "" : undefined}
        data-ds-choice={form ? "" : undefined}
        data-ds-required={required ? "" : undefined}
        data-ds-empty={hasValue ? undefined : ""}
      >
        {current ? current.label : undefined}
      </DropdownTrigger>
      <Menu label={label}>
        {state ? (
          <MenuState status={state} text={statusText} onRetry={onRetry} />
        ) : (
          options.map((o) => (
            <MenuItem key={o.value} selected={hasValue && o.value === cur} disabled={o.disabled} data-value={o.value} onSelect={() => set(o.value)}>
              {o.label}
            </MenuItem>
          ))
        )}
      </Menu>
      {name && <input type="hidden" name={name} value={cur ?? ""} />}
    </Dropdown>
  );
}
/** Dropdown + Trigger + listbox 를 묶은 값 선택 컴포넌트 */
export const Select = forwardRef(SelectInner) as <T extends string = string>(props: SelectProps<T> & { ref?: React.Ref<HTMLDivElement> }) => ReturnType<typeof SelectInner>;
