import {
  Children,
  Fragment,
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
  /** 적용 영역의 '적용' — 버림 없이 닫고 트리거로 */
  apply: () => void;
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
  /** 트리거 높이 sm 32 · md 40 · lg 48 — Button · 필드와 같다(2026-11-12). TextField size 안에서는 그 크기를 따른다 */
  size?: "sm" | "md" | "lg";
  /** 적용 영역(Menu actions)이 있는 메뉴가 적용하지 않고 닫힐 때(Esc · 바깥 · Tab · 트리거) — 제품이 쥔 초안을 열기 전 값으로 되돌린다(2026-11-23) */
  onDiscard?: () => void;
}

const ITEM_SEL = ["option", "menuitem", "menuitemcheckbox", "menuitemradio"].map((r) => `[role="${r}"]:not([aria-disabled="true"])`).join(",");

/** 열림/닫힘 · 바깥 클릭 · Esc · 방향키를 관리하는 컨테이너(.dropdown) */
export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(function Dropdown(
  { open, defaultOpen = false, onOpenChange, kind = "select", align = "start", disabled, keepMounted, size = "md", onDiscard, className, style, children, onKeyDown, ...rest },
  ref,
) {
  const [isOpen, setOpenRaw] = useControllable<boolean>({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const applied = useRef(false);
  /* 적용 영역이 있는 메뉴를 적용 없이 닫으면 onDiscard — 사이트 ds.js 의 초안 되돌림과 같은 때 */
  const setOpen = (o: boolean) => {
    if (!o && isOpen && !applied.current && rootRef.current?.querySelector(".menu[data-actions]")) onDiscard?.();
    applied.current = false;
    setOpenRaw(o);
  };
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId(undefined, "menu");
  const typing = useRef<TypeaheadState>({ s: "", t: 0 });
  useOutsideClick([rootRef], () => setOpen(false), isOpen);
  const closeToTrigger = () => {
    setOpen(false);
    rootRef.current?.querySelector<HTMLElement>("[aria-haspopup]")?.focus({ preventScroll: true });
  };
  const apply = () => { applied.current = true; closeToTrigger(); };
  const { up, floating, vars } = useMenuPlacement(rootRef, "[aria-haspopup]", isOpen, closeToTrigger);
  useEscape(closeToTrigger, isOpen);
  useEffect(() => {
    if (!isOpen || !rootRef.current) return;
    const t = window.setTimeout(() => {
      const items = rootRef.current!.querySelectorAll<HTMLElement>(ITEM_SEL);
      const sel = Array.from(items).find((i) => i.getAttribute("aria-selected") === "true" && !i.closest('[aria-multiselectable="true"]')) ?? Array.from(items).find((i) => i.getAttribute("aria-selected") === "true");
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
    if (e.key === "Tab") {
      /* 적용 영역 — 항목 → 초기화 → 적용은 브라우저 기본 이동(항목은 tabindex -1), 적용에서 Tab 하면 닫는다 */
      const acts = Array.from(rootRef.current!.querySelectorAll<HTMLElement>(".menu-actions button:not([disabled])"));
      const ae = document.activeElement as HTMLElement | null;
      const ai = ae ? acts.indexOf(ae) : -1;
      if (acts.length) {
        if (!e.shiftKey && (ai < 0 ? !!ae?.closest(".menu-items") : ai < acts.length - 1)) return;
        if (e.shiftKey && ai > 0) return;
        if (e.shiftKey && ai === 0) {
          e.preventDefault();
          const its = Array.from(rootRef.current!.querySelectorAll<HTMLElement>(ITEM_SEL));
          (its.find((x) => x.getAttribute("aria-checked") === "true" || x.getAttribute("aria-selected") === "true") ?? its[0] ?? ae)?.focus();
          return;
        }
      }
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
    if ((e.key === "Enter" || e.key === " ") && i >= 0) { e.preventDefault(); items[i].click(); }   // 체크 · 라디오 항목은 열린 채 뒤집힌다
  };
  return (
    <Ctx.Provider value={{ open: isOpen, setOpen, closeToTrigger, kind, menuId, align, disabled, keepMounted, rootRef, apply }}>
      <div ref={mergeRefs(rootRef, ref)} className={cx("dropdown", size !== "md" && size, isOpen && "open", up && "up", floating && "float", className)} style={{ ...vars, ...style }} onKeyDown={keyDown} {...rest}>
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
  /** 아래 초기화 · 적용 영역 — <MenuActionArea>. 있으면 틀이 div.menu[data-actions] > ul.menu-items + 영역이 되고 목록만 스크롤한다(2026-11-23) */
  actions?: ReactNode;
}
/** ul.menu — 열려 있을 때만 렌더(keepMounted 면 hidden 으로 유지). role 은 Dropdown kind 를 따른다 */
export const Menu = forwardRef<HTMLUListElement, MenuProps>(function Menu({ label, actions, className, style, ...rest }, ref) {
  const { open, kind, menuId, align, keepMounted } = useDD();
  if (!open && !keepMounted) return null;
  const alignStyle: CSSProperties | undefined = align === "end" ? { left: "auto", right: 0 } : undefined;
  const role = kind === "select" ? "listbox" : "menu";
  if (actions) {
    return (
      <div id={menuId} className={cx("menu", className)} data-actions="" role="presentation" hidden={!open || undefined} style={{ ...alignStyle, ...style }}>
        <ul ref={ref} className="menu-items" role={role} aria-label={label} {...rest} />
        {actions}
      </div>
    );
  }
  return <ul ref={ref} id={menuId} className={cx("menu", className)} role={role} aria-label={label} hidden={!open || undefined} style={{ ...alignStyle, ...style }} {...rest} />;
});

export interface MenuActionAreaProps extends HTMLAttributes<HTMLDivElement> {
  /** '적용' — 제품이 초안을 값으로 옮긴다. 그다음 메뉴는 닫히고 포커스는 트리거로 */
  onApply?: () => void;
  /** '초기화' — 제품이 초안을 비운다(체크는 끔 · 라디오는 기본값). 적용 전까지 값은 그대로 */
  onReset?: () => void;
  applyLabel?: ReactNode;
  resetLabel?: ReactNode;
}
/** 메뉴 아래 초기화 · 적용(div.menu-actions.btn-group) — <Menu actions={…}> 에 넣는다 */
export function MenuActionArea({ onApply, onReset, applyLabel = "적용", resetLabel = "초기화", className, ...rest }: MenuActionAreaProps) {
  const { apply } = useDD();
  return (
    <div className={cx("menu-actions btn-group", className)} {...rest}>
      <Button type="button" size="sm" variant="text" color="assistive" data-menu-action="reset" onClick={() => onReset?.()}>{resetLabel}</Button>
      <Button type="button" size="sm" variant="solid" color="primary" data-menu-action="apply" onClick={() => { onApply?.(); apply(); }}>{applyLabel}</Button>
    </div>
  );
}

/** 항목 글 — 설명이 있으면 .menu-text > .menu-name + .menu-desc */
function itemBody(children: ReactNode, description?: ReactNode) {
  if (description === undefined || description === null || description === false) return children;
  return (
    <span className="menu-text">
      <span className="menu-name">{children}</span>
      <span className="menu-desc">{description}</span>
    </span>
  );
}

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
  /** 이름 아래 한 줄 설명(2026-11-23) */
  description?: ReactNode;
  onSelect?: () => void;
  /** 선택 후 닫기 (기본 true) */
  closeOnSelect?: boolean;
}
export const MenuItem = forwardRef<HTMLLIElement, MenuItemProps>(function MenuItem(
  { selected, danger, disabled, icon, hint, description, onSelect, closeOnSelect = true, href, target, rel, className, children, onClick, ...rest },
  ref,
) {
  const { kind, closeToTrigger } = useDD();
  if (process.env.NODE_ENV !== "production" && kind === "menu" && selected) console.warn("[ds-react] MenuItem selected 는 동작 메뉴에서 쓰지 않습니다 — 현재 값을 보여 주려면 Select · SelectButton (MIGRATION.md).");
  const cls = cx("menu-item", kind === "select" && selected && "on", danger && "danger", className);
  const body = (
    <>
      {icon && <Icon name={icon} size={16} />}
      {itemBody(children, description)}
      {hint !== undefined && <span className="hint">{hint}</span>}
    </>
  );
  const handle = (e: React.MouseEvent<HTMLElement>) => {
    /* 끈 항목은 제품 onClick 도 부르지 않고 부모로도 보내지 않는다 — CSS 의 pointer-events:none 이 마우스를 막던 것을 지웠다(2026-11-12) */
    if (disabled) { e.preventDefault(); e.stopPropagation(); return; }
    onClick?.(e as React.MouseEvent<HTMLLIElement>);
    if (e.defaultPrevented) return;
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

/* 체크 · 라디오 항목(사람의 결정 2026-11-23 — Montage Menu 참고). 누르면 메뉴는 열린 채이고 포커스도 그 항목에 남는다.
   적용 영역이 있으면 제품이 쥔 상태는 초안 — 적용(onApply)에 값으로 옮기고, 버리면(onDiscard) 열기 전으로 */
interface CheckItemBase extends Omit<LiHTMLAttributes<HTMLLIElement>, "onChange" | "value"> {
  /** 이벤트 · 제품이 쓰는 값(data-value) */
  value?: string;
  /** 이름 아래 한 줄 설명 */
  description?: ReactNode;
  disabled?: boolean;
}
function useCheckClick(disabled: boolean | undefined, onClick: ((e: React.MouseEvent<HTMLLIElement>) => void) | undefined, run: () => void) {
  return (e: React.MouseEvent<HTMLLIElement>) => {
    if (disabled) { e.preventDefault(); e.stopPropagation(); return; }
    onClick?.(e);
    if (e.defaultPrevented) return;
    run();
    e.currentTarget.focus();
  };
}

export interface MenuCheckboxItemProps extends CheckItemBase {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}
/** li[role=menuitemcheckbox] — 켜고 끄는 보기 설정 */
export const MenuCheckboxItem = forwardRef<HTMLLIElement, MenuCheckboxItemProps>(function MenuCheckboxItem(
  { checked, defaultChecked = false, onCheckedChange, value, description, disabled, className, children, onClick, ...rest },
  ref,
) {
  const [on, set] = useControllable<boolean>({ value: checked, defaultValue: defaultChecked, onChange: onCheckedChange });
  const click = useCheckClick(disabled, onClick, () => set(!on));
  return (
    <li ref={ref} role="menuitemcheckbox" className={cx("menu-item", className)} aria-checked={on} aria-disabled={disabled ? true : undefined} data-value={value} tabIndex={disabled ? undefined : -1} onClick={click} {...rest}>
      <span className="menu-mark check" aria-hidden="true" />
      {itemBody(children, description)}
    </li>
  );
});

interface RadioCtx { value: string | null; set: (v: string) => void }
const RadioGroupCtx = createContext<RadioCtx | null>(null);

export interface MenuGroupProps extends Omit<LiHTMLAttributes<HTMLLIElement>, "onChange"> {
  /** 그룹 제목 — ul[role=group] 의 이름 */
  label: ReactNode;
  /** 이벤트 · 제품이 쓰는 묶음 이름(data-name) */
  name?: string;
}
/** li.menu-group > span.menu-label + ul[role=group] — 성격이 다른 항목을 나눈다 */
export const MenuGroup = forwardRef<HTMLLIElement, MenuGroupProps>(function MenuGroup({ label, name, className, children, ...rest }, ref) {
  const lid = useId(undefined, "menu-group");
  return (
    <li ref={ref} className={cx("menu-group", className)} role="none" {...rest}>
      <span className="menu-label" id={lid}>{label}</span>
      <ul role="group" aria-labelledby={lid} data-name={name}>{children}</ul>
    </li>
  );
});

export interface MenuRadioGroupProps extends Omit<MenuGroupProps, "value" | "defaultValue"> {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
}
/** 하나를 고르는 묶음 — 라디오 항목은 늘 이 안에(이름이 있는 group) */
export const MenuRadioGroup = forwardRef<HTMLLIElement, MenuRadioGroupProps>(function MenuRadioGroup({ value, defaultValue = null, onValueChange, ...rest }, ref) {
  const [cur, set] = useControllable<string | null>({ value, defaultValue, onChange: onValueChange as (v: string | null) => void });
  return (
    <RadioGroupCtx.Provider value={{ value: cur, set: (v) => set(v) }}>
      <MenuGroup ref={ref} {...rest} />
    </RadioGroupCtx.Provider>
  );
});

export interface MenuRadioItemProps extends CheckItemBase {
  value: string;
}
/** li[role=menuitemradio] — MenuRadioGroup 안에서 */
export const MenuRadioItem = forwardRef<HTMLLIElement, MenuRadioItemProps>(function MenuRadioItem({ value, description, disabled, className, children, onClick, ...rest }, ref) {
  const g = useContext(RadioGroupCtx);
  if (process.env.NODE_ENV !== "production" && !g) console.warn("[ds-react] MenuRadioItem 은 MenuRadioGroup 안에서 쓰세요 — 라디오 묶음에는 이름이 있어야 합니다.");
  const click = useCheckClick(disabled, onClick, () => g?.set(value));
  return (
    <li ref={ref} role="menuitemradio" className={cx("menu-item", className)} aria-checked={g?.value === value} aria-disabled={disabled ? true : undefined} data-value={value} tabIndex={disabled ? undefined : -1} onClick={click} {...rest}>
      <span className="menu-mark round" aria-hidden="true" />
      {itemBody(children, description)}
    </li>
  );
});

export interface SelectOption<T extends string = string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}
export interface SelectProps<T extends string = string> extends Omit<DropdownProps, "kind" | "onChange" | "defaultValue"> {
  options: SelectOption<T>[];
  /** 하나만 고른다(기본). 여러 개는 multiple — SelectMultipleProps */
  multiple?: false;
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
/* Select 여러 개(사람의 결정 2026-11-23 — Montage SelectMultiple 참고). 옵션 앞 체크로 여러 개를 고르고, 고르는 동안 목록은 열린 채다.
   트리거에는 고른 이름을 쉼표로 잇고(넘치면 말줄임 · overflow="wrap" 이면 줄바꿈), 모두 고르면 allSelectedLabel. '전체' · '선택 안 함' 옵션은 두지 않는다.
   actions 면 고르는 것은 초안 — 적용해야 onChange, 적용 없이 닫으면 열기 전으로 */
export interface SelectMultipleProps<T extends string = string> extends Omit<DropdownProps, "kind" | "onChange" | "defaultValue"> {
  options: SelectOption<T>[];
  multiple: true;
  value?: T[];
  defaultValue?: T[];
  /** 값이 바뀔 때 — actions 면 적용할 때만 */
  onChange?: (values: T[]) => void;
  placeholder?: ReactNode;
  /** 켤 수 있는 옵션을 모두 고르면 트리거에 이 글(예: '전체 그룹') */
  allSelectedLabel?: ReactNode;
  /** 트리거 글이 넘칠 때 — ellipsis(기본) 한 줄 말줄임 · wrap 줄을 바꿔 트리거가 늘어남 */
  overflow?: "ellipsis" | "wrap";
  /** 아래 초기화 · 적용 영역 — 고른 값으로 결과를 다시 불러와야 할 때만 */
  actions?: boolean;
  applyLabel?: ReactNode;
  resetLabel?: ReactNode;
  label?: string;
  triggerClassName?: string;
  triggerStyle?: CSSProperties;
  /** 제출할 이름 — 값마다 숨은 input 하나 */
  name?: string;
  required?: boolean;
  status?: MenuStatus;
  statusText?: string;
  onRetry?: () => void;
}

function SelectMultipleInner<T extends string>(
  { options, value, defaultValue, onChange, placeholder, allSelectedLabel, overflow = "ellipsis", actions, applyLabel, resetLabel, label, triggerClassName, triggerStyle, disabled, name, required, status, statusText, onRetry, onOpenChange, onDiscard, multiple: _m, ...rest }: SelectMultipleProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const [cur, set] = useControllable<T[]>({ value, defaultValue: defaultValue ?? [], onChange });
  const [draft, setDraft] = useState<T[]>(cur);
  const field = useContext(FieldContext);
  const form = useContext(FormValidationContext);
  const trigger = useRef<HTMLButtonElement>(null);
  const [isOpen, track] = useState(Boolean(rest.open ?? rest.defaultOpen));
  const shown = actions ? draft : cur;
  const enabled = options.filter((o) => !o.disabled);
  const picked = options.filter((o) => shown.includes(o.value));
  const all = allSelectedLabel !== undefined && enabled.length > 0 && enabled.every((o) => shown.includes(o.value));
  const state = status ?? (options.length ? undefined : ("empty" as const));
  const toggle = (v: T) => {
    const next = shown.includes(v) ? shown.filter((x) => x !== v) : options.map((o) => o.value).filter((x) => x === v || shown.includes(x));
    if (actions) setDraft(next); else set(next);
  };
  const seen = useRef({ cur, isOpen });
  useEffect(() => {
    if (seen.current.cur === cur && seen.current.isOpen === isOpen) return;
    seen.current = { cur, isOpen };
    if (!isOpen && trigger.current) form?.touch(trigger.current);
  }, [cur, isOpen, form]);
  return (
    <Dropdown
      ref={ref}
      kind="select"
      disabled={disabled}
      data-multiple=""
      data-overflow={overflow === "wrap" ? "wrap" : undefined}
      onOpenChange={(o) => { if (o) setDraft(cur); track(o); onOpenChange?.(o); }}
      onDiscard={() => { setDraft(cur); onDiscard?.(); }}
      {...rest}
    >
      <DropdownTrigger
        ref={trigger}
        className={triggerClassName}
        style={triggerStyle}
        data-placeholder={typeof placeholder === "string" ? placeholder : undefined}
        id={field?.controlId}
        aria-labelledby={field?.labelId ? `${field.labelId} ${field.controlId}` : undefined}
        aria-describedby={field?.helpId}
        aria-invalid={field?.error || undefined}
        data-ds-field={form ? "" : undefined}
        data-ds-choice={form ? "" : undefined}
        data-ds-required={required ? "" : undefined}
        data-ds-empty={cur.length ? undefined : ""}
      >
        {picked.length ? (
          <span className="trigger-text">{all ? allSelectedLabel : picked.map((o, i) => <Fragment key={o.value}>{i > 0 && ", "}{o.label}</Fragment>)}</span>
        ) : (
          <span className="placeholder">{placeholder}</span>
        )}
      </DropdownTrigger>
      <Menu
        label={label}
        aria-multiselectable="true"
        actions={actions ? <MenuActionArea applyLabel={applyLabel} resetLabel={resetLabel} onReset={() => setDraft([])} onApply={() => set(draft)} /> : undefined}
      >
        {state ? (
          <MenuState status={state} text={statusText} onRetry={onRetry} />
        ) : (
          options.map((o) => (
            <SelectMultiOption key={o.value} selected={shown.includes(o.value)} disabled={o.disabled} value={o.value} onToggle={() => toggle(o.value)}>
              {o.label}
            </SelectMultiOption>
          ))
        )}
      </Menu>
      {name && cur.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
    </Dropdown>
  );
}

/** 여러 개 Select 의 옵션 — li[role=option][aria-selected] + 앞 체크. 누르면 열린 채 뒤집고 포커스가 남는다 */
function SelectMultiOption({ selected, disabled, value, onToggle, children }: { selected: boolean; disabled?: boolean; value: string; onToggle: () => void; children: ReactNode }) {
  const click = useCheckClick(disabled, undefined, onToggle);
  return (
    <li role="option" className="menu-item" aria-selected={selected} aria-disabled={disabled ? true : undefined} data-value={value} tabIndex={disabled ? undefined : -1} onClick={click}>
      <span className="menu-mark check" aria-hidden="true" />
      {children}
    </li>
  );
}

const SelectSingle = forwardRef(SelectInner) as <T extends string = string>(props: SelectProps<T> & { ref?: React.Ref<HTMLDivElement> }) => ReturnType<typeof SelectInner>;
const SelectMultiple = forwardRef(SelectMultipleInner) as <T extends string = string>(props: SelectMultipleProps<T> & { ref?: React.Ref<HTMLDivElement> }) => ReturnType<typeof SelectMultipleInner>;
/** Dropdown + Trigger + listbox 를 묶은 값 선택 컴포넌트. multiple 이면 여러 개(2026-11-23) */
export const Select = forwardRef<HTMLDivElement, SelectProps<string> | SelectMultipleProps<string>>(function Select(props, ref) {
  return props.multiple ? <SelectMultiple ref={ref} {...props} /> : <SelectSingle ref={ref} {...props} />;
}) as {
  <T extends string = string>(props: SelectMultipleProps<T> & { ref?: React.Ref<HTMLDivElement> }): ReactElement | null;
  <T extends string = string>(props: SelectProps<T> & { ref?: React.Ref<HTMLDivElement> }): ReactElement | null;
};
