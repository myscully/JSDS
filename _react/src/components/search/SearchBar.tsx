import { forwardRef, useEffect, useRef, type CSSProperties, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useControllable } from "../../utils/useControllable";
import { mergeRefs } from "../../utils/hooks";
import { Icon } from "../../icons/Icon";
import { LABELS } from "../../labels";

export interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "value" | "defaultValue" | "onChange" | "onSubmit"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Enter */
  onSubmit?: (value: string) => void;
  /** 결과를 바꿀 때 — trigger: input(debounce 뒤) · enter · clear(지우기 · Esc) */
  onSearch?: (value: string, trigger: "input" | "enter" | "clear") => void;
  /** 필터형 — 입력이 멈춘 뒤 onSearch. true 면 300ms */
  debounce?: boolean | number;
  /** 결과 건수 등 — 숨긴 role=status 로 알린다 */
  status?: ReactNode;
  size?: "md" | "lg";
  /** 전체 폭 */
  block?: boolean;
  /** 단축키 표시 (kbd). 예: "/" */
  shortcut?: string;
  /** "/" 키로 포커스 */
  hotkey?: boolean;
  /** 값이 있을 때 지우기 버튼 */
  clearable?: boolean;
  /** input aria-label. 기본 "검색" */
  label?: string;
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
}

/** 목록·로그 필터용 검색 입력 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  { value, defaultValue, onChange, onSubmit, onSearch, debounce, status, size = "md", block, shortcut, hotkey, clearable, label = LABELS.search, wrapperClassName, wrapperStyle, onKeyDown, ...rest },
  ref,
) {
  const [cur, set] = useControllable<string>({ value, defaultValue: defaultValue ?? "", onChange });
  const inner = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!hotkey) return;
    const h = (e: globalThis.KeyboardEvent) => {
      const a = document.activeElement as HTMLElement | null;
      const modal = document.querySelector('[aria-modal="true"]');
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
      if ((a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)) || (modal && modal.getClientRects().length)) return;
      e.preventDefault();
      inner.current?.focus();
      inner.current?.select();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [hotkey]);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const latest = useRef(onSearch);
  latest.current = onSearch;
  useEffect(() => () => clearTimeout(timer.current), []);
  const wait = debounce === true ? 300 : debounce || 0;
  const emit = (v: string, trigger: "enter" | "clear") => {
    clearTimeout(timer.current);
    latest.current?.(v, trigger);
  };
  const change = (v: string) => {
    set(v);
    if (!wait) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => latest.current?.(v, "input"), wait);
  };
  const clear = () => {
    set("");
    inner.current?.focus();
    emit("", "clear");
  };
  const keyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.nativeEvent.isComposing) return;   // 한글 조합을 끝내는 Enter · Esc 다
    if (e.key === "Enter") {
      onSubmit?.(cur);
      emit(cur, "enter");
    }
    if (e.key === "Escape" && cur) {   // 값이 있으면 지우기만 — 대화상자는 닫지 않는다
      e.preventDefault();
      e.stopPropagation();
      clear();
    }
  };
  return (
    <div className={cx("searchbar", size === "lg" && "lg", { block }, wrapperClassName)} role="search" style={wrapperStyle}>
      <Icon name="search" />
      <input ref={mergeRefs(inner, ref)} type="search" value={cur} onChange={(e) => change(e.target.value)} onKeyDown={keyDown} aria-label={label} {...rest} />
      {status !== undefined && <span className="sr-only" role="status">{status}</span>}
      {shortcut && !cur && <kbd>{shortcut}</kbd>}
      {clearable && cur && (
        <button type="button" className="clear" aria-label={LABELS.clear} onClick={clear}>
          <Icon name="x" size={12} />
        </button>
      )}
    </div>
  );
});
