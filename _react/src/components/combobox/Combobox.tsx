import { useContext, useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type FocusEvent, type KeyboardEvent, type MouseEvent } from "react";
import { cx } from "../../utils/cx";
import { useControllable } from "../../utils/useControllable";
import { useEscape } from "../../utils/hooks";
import { useMenuPlacement } from "../../utils/useMenuPlacement";
import { useId } from "../../utils/useId";
import { Chip } from "../chip/Chip";
import { MenuState, type MenuStatus, type SelectOption } from "../dropdown/Dropdown";
import { FieldContext } from "../text-field/TextField";
import { FormValidationContext } from "../text-field/validation";

interface ComboboxBase<T extends string> {
  options: SelectOption<T>[];
  placeholder?: string;
  /** 목록의 aria-label. Field 밖에서는 입력의 접근 이름도 된다 */
  label?: string;
  /** 제출할 이름 — 숨은 input(여러 개면 값마다 하나) */
  name?: string;
  /** <Form validate> 안에서 필수 검사 */
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  style?: CSSProperties;
  defaultOpen?: boolean;
  /** 목록 상태 — 있으면 항목 대신 한 줄. 옵션이 없으면 empty */
  status?: MenuStatus;
  statusText?: string;
  onRetry?: () => void;
  /** false 면 목록을 좁히지 않는다(서버 검색) — onQueryChange 로 받아 options 를 바꾼다 */
  filter?: boolean;
  /** 입력이 멈추고 300ms 뒤 */
  onQueryChange?: (query: string) => void;
}
export type ComboboxProps<T extends string = string> = ComboboxBase<T> &
  ({ multiple?: false; value?: T | null; defaultValue?: T | null; onChange?: (value: T | null) => void } | { multiple: true; value?: T[]; defaultValue?: T[]; onChange?: (value: T[]) => void });

const NO_MATCH = "일치하는 항목이 없습니다.";
const textOf = (o: SelectOption<string>) => (typeof o.label === "string" ? o.label : o.value);

/** 입력해서 찾아 고르기 · 여러 개 고르기. 포커스는 입력에 두고 aria-activedescendant 로 옮긴다. 목록에 있는 값만 고른다 */
export function Combobox<T extends string = string>(props: ComboboxProps<T>) {
  const { options, placeholder, label, name, required, disabled, id, className, style, defaultOpen = false, status, statusText, onRetry, filter = true, onQueryChange, multiple } = props;
  const field = useContext(FieldContext);
  const form = useContext(FormValidationContext);
  const autoId = useId(undefined, "cb");
  const inputId = id ?? field?.controlId ?? autoId;
  const listId = `${inputId}-list`;
  const toArray = (v: T[] | T | null | undefined) => (v === undefined ? undefined : v === null ? [] : Array.isArray(v) ? v : [v]);
  const [selected, setSelected] = useControllable<T[]>({
    value: toArray(props.value),
    defaultValue: toArray(props.defaultValue) ?? [],
    onChange: (v) => (multiple ? (props.onChange as (x: T[]) => void)?.(v) : (props.onChange as (x: T | null) => void)?.(v[0] ?? null)),
  });
  const [open, setOpen] = useState(defaultOpen);
  const [typed, setTyped] = useState(false);
  const [text, setText] = useState("");
  const [active, setActive] = useState<T | null>(null);
  const [live, setLive] = useState("");
  const [leaves, setLeaves] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const touched = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const known = useRef(new Map<string, string>());
  options.forEach((o) => known.current.set(o.value, textOf(o)));

  const labelOf = (v: T | undefined) => (v === undefined ? "" : known.current.get(v) ?? v);
  const shown = typed ? text : multiple ? "" : labelOf(selected[0]);
  const matches = (q: string) => options.filter((o) => !q || textOf(o).toLowerCase().includes(q));
  const query = filter && typed ? text.trim().toLowerCase() : "";
  const visible = matches(query);
  const usable = (list: SelectOption<T>[]) => list.filter((o) => !o.disabled);
  const state = status ?? (options.length ? undefined : ("empty" as const));
  const noMatch = !state && !!query && !visible.length;

  const openMenu = () => {
    if (disabled || open) return;
    touched.current = true;
    setActive(selected.find((v) => visible.some((o) => o.value === v)) ?? null);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    setActive(null);
  };
  useEscape(close, open);
  const { up, floating, vars } = useMenuPlacement(root, ".control", open, close);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (active !== null) document.getElementById(`${listId}-${active}`)?.scrollIntoView?.({ block: "nearest" });
  }, [active, listId]);
  /* 검증 — 값이 바뀌었거나 떠날 때. 열어 보지 않은 필드는 조용하다 */
  const seen = useRef({ selected, leaves });
  useEffect(() => {
    if (seen.current.selected === selected && seen.current.leaves === leaves) return;
    seen.current = { selected, leaves };
    if (touched.current && input.current) form?.touch(input.current);
  }, [selected, leaves, form]);

  /* 칩 · 제출 값은 옵션 순서로 — 사이트와 같게 */
  const ordered = (list: T[]) => {
    const at = (v: T) => options.findIndex((o) => o.value === v);
    return [...list].sort((a, b) => at(a) - at(b));
  };
  const pick = (o: SelectOption<T>) => {
    const text2 = textOf(o);
    if (multiple) {
      const on = !selected.includes(o.value);
      setSelected(ordered(on ? [...selected, o.value] : selected.filter((v) => v !== o.value)));
      setActive(o.value);
      setLive(`${text2} ${on ? "선택됨" : "선택 해제됨"}`);
    } else {
      setSelected([o.value]);
      close();
      setLive(`${text2} 선택됨`);
    }
    setTyped(false);
    setText("");
    input.current?.focus();
  };
  const remove = (v: T) => {
    touched.current = true;
    setSelected(selected.filter((x) => x !== v));
    setLive(`${labelOf(v)} 선택 해제됨`);
    input.current?.focus();
  };

  const onInput = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setText(v);
    setTyped(true);
    touched.current = true;
    setOpen(true);
    if (filter) {
      const q = v.trim().toLowerCase();
      const hits = matches(q);
      setActive(q ? usable(hits)[0]?.value ?? null : null);   // 비활성은 후보가 되지 않지만 결과 수에는 든다
      if (q) setLive(hits.length ? `결과 ${hits.length}개` : NO_MATCH);
    }
    if (onQueryChange) {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => onQueryChange(v), 300);
    }
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;   // 한글 조합을 끝내는 Enter · 방향키
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) { openMenu(); return; }
      const list = usable(visible);
      if (!list.length) return;
      const i = list.findIndex((o) => o.value === active);
      setActive(list[e.key === "ArrowDown" ? (i + 1) % list.length : i <= 0 ? list.length - 1 : i - 1].value);
    } else if (e.key === "Enter" && open) {
      e.preventDefault();   // 목록이 열려 있으면 폼을 제출하지 않는다
      const o = options.find((x) => x.value === active);
      if (o) pick(o);
    } else if (e.key === "Backspace" && multiple && !shown && selected.length) {
      e.preventDefault();
      remove(selected[selected.length - 1]);
    }
  };
  /* 포커스가 떠날 때 — 글자를 비웠으면 선택 해제, 고르지 않은 글자는 고른 값으로 되돌린다 */
  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (root.current?.contains(e.relatedTarget as Node | null)) return;
    close();
    if (!multiple && typed && !text.trim() && selected.length) setSelected([]);
    setTyped(false);
    setText("");
    setLeaves((n) => n + 1);
  };
  const onControlClick = (e: MouseEvent<HTMLDivElement>) => {
    const t = e.target as Element;
    if (disabled || t.closest(".chip")) return;
    input.current?.focus();
    if (t === input.current) openMenu();
    else if (open) close();
    else openMenu();
  };

  return (
    <div ref={root} className={cx("combobox", open && "open", up && "up", floating && "float", disabled && "disabled", className)} style={{ ...vars, ...style }} data-multiple={multiple ? "" : undefined} onBlur={onBlur}>
      <div className="control" onClick={onControlClick} onMouseDown={(e) => { if (e.target !== input.current) e.preventDefault(); }}>
        {multiple && selected.map((v) => (
          <Chip key={v} size="sm" removeLabel="제거" onRemove={() => { if (!disabled) remove(v); }}>{labelOf(v)}</Chip>
        ))}
        <input
          ref={input}
          type="text"
          id={inputId}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && active !== null ? `${listId}-${active}` : undefined}
          aria-label={field?.labelId ? undefined : label}
          aria-labelledby={field?.labelId}
          aria-describedby={field?.helpId}
          aria-invalid={field?.error || undefined}
          autoComplete="off"
          placeholder={placeholder}
          disabled={disabled}
          value={shown}
          onChange={onInput}
          onKeyDown={onKeyDown}
          data-ds-field={form ? "" : undefined}
          data-ds-choice={form ? "" : undefined}
          data-ds-required={required ? "" : undefined}
          data-ds-empty={selected.length ? undefined : ""}
        />
      </div>
      <ul className="menu" role="listbox" id={listId} tabIndex={-1} aria-label={label} aria-multiselectable={multiple || undefined} onMouseDown={(e) => e.preventDefault()}>
        {state ? (
          <MenuState status={state} text={statusText} onRetry={onRetry} />
        ) : (
          options.map((o) => {
            const on = selected.includes(o.value);
            return (
              <li
                key={o.value}
                id={`${listId}-${o.value}`}
                className={cx("menu-item", on && "on", active === o.value && "active")}
                role="option"
                data-value={o.value}
                aria-selected={on}
                aria-disabled={o.disabled ? true : undefined}
                hidden={!visible.includes(o) || undefined}
                onClick={() => { if (!o.disabled) pick(o); }}
              >
                {o.label}
              </li>
            );
          })
        )}
        {noMatch && <MenuState status="empty" text={`${NO_MATCH} 다른 검색어를 입력하세요.`} />}
      </ul>
      <span className="sr-only" role="status">{live}</span>
      {name && (multiple ? selected.map((v) => <input key={v} type="hidden" name={name} value={v} />) : <input type="hidden" name={name} value={selected[0] ?? ""} />)}
    </div>
  );
}
