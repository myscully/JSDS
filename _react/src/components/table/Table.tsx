import { forwardRef, useCallback, type CSSProperties, type HTMLAttributes, type TableHTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import { mergeRefs } from "../../utils/hooks";

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** 행 44 */
  compact?: boolean;
  zebra?: boolean;
  /** 키-값 표 (th 가 키) */
  kv?: boolean;
  /** .tbl-wrap 으로 감싸기 (기본 true) */
  wrap?: boolean;
  wrapClassName?: string;
  wrapStyle?: CSSProperties;
}
/** 단순 표. 정렬·선택이 필요하면 DataTable */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table({ compact, zebra, kv, wrap = true, wrapClassName, wrapStyle, className, ...rest }, ref) {
  const table = <table ref={ref} className={cx("tbl", { compact, zebra, kv }, className)} {...rest} />;
  return wrap ? <div className={cx("tbl-wrap", wrapClassName)} style={wrapStyle}>{table}</div> : table;
});

export const TableHead = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableHead(props, ref) {
  return <thead ref={ref} {...props} />;
});
export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableBody(props, ref) {
  return <tbody ref={ref} {...props} />;
});

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  disabled?: boolean;
  /** 모노스페이스 로그 행 */
  log?: boolean;
}
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow({ selected, disabled, log, className, ...rest }, ref) {
  /* 비활성 행은 inert — CSS 의 pointer-events 는 마우스만 막고 키보드 Tab 은 행 안 링크로 들어갔다.
     React 18 과 19 가 inert prop 을 다르게 다뤄 DOM 에 직접 둔다 */
  const inertRef = useCallback((el: HTMLTableRowElement | null) => { if (el) el.toggleAttribute("inert", !!disabled); }, [disabled]);
  return <tr ref={mergeRefs(ref, inertRef)} className={cx({ on: selected, disabled, "log-row": log }, className) || undefined} {...rest} />;
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
export const TableHeader = forwardRef<HTMLTableCellElement, TableHeaderProps>(function TableHeader({ num, sortable, sorted, check, actions, className, ...rest }, ref) {
  return (
    <th
      ref={ref}
      className={cx({ num, sortable, sorted: Boolean(sorted), desc: sorted === "desc", check, actions }, className) || undefined}
      aria-sort={sorted ? (sorted === "asc" ? "ascending" : "descending") : undefined}
      {...rest}
    />
  );
});

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  num?: boolean;
  check?: boolean;
  actions?: boolean;
  /** 빈 상태 셀 (colSpan 과 함께) */
  empty?: boolean;
}
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell({ num, check, actions, empty, className, ...rest }, ref) {
  return <td ref={ref} className={cx({ num, check, actions, empty }, className) || undefined} {...rest} />;
});
