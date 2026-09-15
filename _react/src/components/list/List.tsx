import { forwardRef, type HTMLAttributes, type KeyboardEvent, type LiHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  /** 행 hover 배경 (클릭 가능한 목록) */
  hover?: boolean;
  /** 행 40 */
  dense?: boolean;
  /** 보더 없음 */
  plain?: boolean;
}
export const List = forwardRef<HTMLUListElement, ListProps>(function List({ hover, dense, plain, className, ...rest }, ref) {
  return <ul ref={ref} className={cx("list", { hover, dense, plain }, className)} {...rest} />;
});

export interface ListItemProps extends LiHTMLAttributes<HTMLLIElement> {
  /** 앞 요소 (아바타·아이콘) */
  leading?: ReactNode;
  /** 제목 (span.primary) — primary/meta 가 있으면 div 로 묶인다 */
  primary?: ReactNode;
  /** 부제 (span.meta) */
  meta?: ReactNode;
  /** 우측 영역 (span.end) */
  end?: ReactNode;
  /** end 를 보조 텍스트 스타일로 (.end.meta) */
  endMeta?: boolean;
  selected?: boolean;
}
export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(function ListItem(
  { leading, primary, meta, end, endMeta, selected, className, children, role, onClick, onKeyDown, tabIndex, ...rest },
  ref,
) {
  const interactive = Boolean(onClick);
  const keyDown = (e: KeyboardEvent<HTMLLIElement>) => {
    onKeyDown?.(e);
    if (interactive && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); e.currentTarget.click(); }
  };
  return (
    <li
      ref={ref}
      className={cx(selected && "on", className) || undefined}
      role={role}
      aria-selected={role === "option" && selected ? true : undefined}
      tabIndex={tabIndex ?? (interactive ? 0 : undefined)}
      onClick={onClick}
      onKeyDown={keyDown}
      {...rest}
    >
      {leading}
      {(primary !== undefined || meta !== undefined) && (
        <div>
          {primary !== undefined && <span className="primary">{primary}</span>}
          {meta !== undefined && <span className="meta">{meta}</span>}
        </div>
      )}
      {children}
      {end !== undefined && <span className={cx("end", endMeta && "meta")}>{end}</span>}
    </li>
  );
});
