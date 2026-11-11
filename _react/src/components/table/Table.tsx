import { forwardRef, useCallback, type CSSProperties, type HTMLAttributes, type ReactNode, type TableHTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import { mergeRefs } from "../../utils/hooks";

export type TableDensity = "compact" | "default" | "relaxed";
export type TableRowStyle = "lines" | "zebra" | "grid" | "plain";
export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** 행 40 (= density="compact") */
  compact?: boolean;
  /** 행 높이 — compact 40 · default 48 · relaxed 56. 주면 compact 보다 우선 */
  density?: TableDensity;
  /** 줄무늬 (= rowStyle="zebra") */
  zebra?: boolean;
  /** 행 스타일 — lines(기본 가로선) · zebra · grid(열 사이 세로선) · plain(행 선 없음, 작은 요약). 주면 zebra 보다 우선 */
  rowStyle?: TableRowStyle;
  /** 키-값 표 (th 가 키) */
  kv?: boolean;
  /** .tbl-wrap 으로 감싸기 (기본 true) */
  wrap?: boolean;
  wrapClassName?: string;
  wrapStyle?: CSSProperties;
}
/** 단순 표. 정렬·선택이 필요하면 DataTable */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table({ compact, density, zebra, rowStyle, kv, wrap = true, wrapClassName, wrapStyle, className, ...rest }, ref) {
  const d = density ?? (compact ? "compact" : "default"), r = rowStyle ?? (zebra ? "zebra" : "lines");
  const table = <table ref={ref} className={cx("tbl", { compact: d === "compact", relaxed: d === "relaxed", zebra: r === "zebra", grid: r === "grid", plain: r === "plain", kv }, className)} {...rest} />;
  return wrap ? <div className={cx("tbl-wrap", wrapClassName)} style={wrapStyle}>{table}</div> : table;
});

export const TableHead = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableHead(props, ref) {
  return <thead ref={ref} {...props} />;
});
export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableBody(props, ref) {
  return <tbody ref={ref} {...props} />;
});
/** 합계 · 평균 행을 담는 tfoot — 안의 행은 TableRow total */
export const TableFoot = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableFoot(props, ref) {
  return <tfoot ref={ref} {...props} />;
});

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  disabled?: boolean;
  /** 모노스페이스 로그 행 */
  log?: boolean;
  /** 합계 행 (TableFoot 안) */
  total?: boolean;
}
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow({ selected, disabled, log, total, className, ...rest }, ref) {
  /* 비활성 행은 inert — CSS 의 pointer-events 는 마우스만 막고 키보드 Tab 은 행 안 링크로 들어갔다.
     React 18 과 19 가 inert prop 을 다르게 다뤄 DOM 에 직접 둔다 */
  const inertRef = useCallback((el: HTMLTableRowElement | null) => { if (el) el.toggleAttribute("inert", !!disabled); }, [disabled]);
  return <tr ref={mergeRefs(ref, inertRef)} className={cx({ on: selected, disabled, "log-row": log, total }, className) || undefined} {...rest} />;
});

export interface TableHeaderProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** 숫자 열 (우측 정렬) */
  num?: boolean;
  sortable?: boolean;
  /** 정렬 중 */
  sorted?: "asc" | "desc";
  /** 체크박스 열 */
  check?: boolean;
  /** 행 액션 열 */
  actions?: boolean;
}
export const TableHeader = forwardRef<HTMLTableCellElement, TableHeaderProps>(function TableHeader({ num, sortable, sorted, check, actions, className, children, ...rest }, ref) {
  return (
    <th
      ref={ref}
      className={cx({ num, sortable, sorted: Boolean(sorted), desc: sorted === "desc", check, actions }, className) || undefined}
      aria-sort={sorted ? (sorted === "asc" ? "ascending" : "descending") : undefined}
      {...rest}
    >
      {/* 정렬은 키보드로 닿아야 한다. 클릭은 버블링으로 th 의 onClick 이 받는다 */}
      {sortable ? <button type="button" className="sort">{children}</button> : children}
    </th>
  );
});

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  num?: boolean;
  check?: boolean;
  actions?: boolean;
  /** 빈 상태 셀 (colSpan 과 함께) */
  empty?: boolean;
  /** 말줄임. 전체 값은 title 로 */
  truncate?: boolean;
  /** 주 값 아래 보조 글 (.cell-sub — 예: 이름 아래 이메일) */
  sub?: ReactNode;
}
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell({ num, check, actions, empty, truncate, sub, className, children, ...rest }, ref) {
  return (
    <td ref={ref} className={cx({ num, check, actions, empty, truncate }, className) || undefined} {...rest}>
      {children}
      {sub != null && sub !== false && <span className="cell-sub">{sub}</span>}
    </td>
  );
});
