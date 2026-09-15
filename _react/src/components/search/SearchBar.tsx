import { forwardRef, useEffect, useRef, type CSSProperties, type InputHTMLAttributes, type KeyboardEvent } from "react";
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
  { value, defaultValue, onChange, onSubmit, size = "md", block, shortcut, hotkey, clearable, label = LABELS.search, wrapperClassName, wrapperStyle, onKeyDown, ...rest },
  ref,
) {
  const [cur, set] = useControllable<string>({ value, defaultValue: defaultValue ?? "", onChange });
  const inner = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!hotkey) return;
    const h = (e: globalThis.KeyboardEvent) => {
      if (e.key === "/" && !/INPUT|TEXTAREA/.test((document.activeElement as HTMLElement)?.tagName ?? "")) {
        e.preventDefault();
        inner.current?.focus();
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [hotkey]);
  const keyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.key === "Enter") onSubmit?.(cur);
    if (e.key === "Escape" && clearable) set("");
  };
  return (
    <div className={cx("searchbar", size === "lg" && "lg", { block }, wrapperClassName)} role="search" style={wrapperStyle}>
      <Icon name="search" />
      <input ref={mergeRefs(inner, ref)} type="search" value={cur} onChange={(e) => set(e.target.value)} onKeyDown={keyDown} aria-label={label} {...rest} />
      {shortcut && !cur && <kbd>{shortcut}</kbd>}
      {clearable && cur && (
        <button type="button" className="clear" aria-label={LABELS.clear} onClick={() => { set(""); inner.current?.focus(); }}>
          <Icon name="x" size={12} />
        </button>
      )}
    </div>
  );
});
