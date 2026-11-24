import { forwardRef, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject, type MouseEvent, type HTMLAttributes, type ReactNode, type TableHTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import { mergeRefs } from "../../utils/hooks";
import { Tooltip } from "../tooltip/Tooltip";

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
  /** 행 hover · 눌림 면(.tbl.hover) — 행을 고르거나 행에 동작이 있는 표만(사람의 결정 2026-11-13 — 기본은 없음) */
  hover?: boolean;
  /** 칸을 한 줄로(.tbl.nowrap) — 좁으면 .tbl-wrap 이 가로로 스크롤. 짧은 값만 있는 요약 표에(2026-11-15) */
  nowrap?: boolean;
  /** .tbl-wrap 으로 감싸기 (기본 true) */
  wrap?: boolean;
  wrapClassName?: string;
  wrapStyle?: CSSProperties;
  /** 고정 헤더(.tbl-wrap.sticky) — maxHeight 와 regionLabel 을 함께 준다. DataTable 과 같다(2026-11-12) */
  stickyHeader?: boolean;
  /** 첫 열 고정(.tbl-wrap.sticky-col) — regionLabel 을 함께 준다 */
  stickyColumn?: boolean;
  /** 고정 헤더 표 영역의 높이 */
  maxHeight?: number | string;
  /** 스크롤 영역의 이름(aria-label) — 고정 헤더 · 첫 열 고정이면 영역이 Tab 칸(tabindex 0)이 되어 이름이 필요하다 */
  regionLabel?: string;
}
let regionWarned = false;
/** 단순 표. 정렬·선택이 필요하면 DataTable */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table({ compact, density, zebra, rowStyle, kv, hover, nowrap, wrap = true, wrapClassName, wrapStyle, stickyHeader, stickyColumn, maxHeight, regionLabel, className, ...rest }, ref) {
  const d = density ?? (compact ? "compact" : "default"), r = rowStyle ?? (zebra ? "zebra" : "lines");
  const table = <table ref={ref} className={cx("tbl", { compact: d === "compact", relaxed: d === "relaxed", zebra: r === "zebra", grid: r === "grid", plain: r === "plain", kv, hover, nowrap }, className)} {...rest} />;
  const scroll = stickyHeader || stickyColumn;
  if (scroll && !regionLabel && process.env.NODE_ENV !== "production" && !regionWarned) { regionWarned = true; console.warn("[ds-react] Table stickyHeader · stickyColumn 은 스크롤 영역(Tab 칸)이라 regionLabel 이 필요합니다."); }
  return wrap ? (
    <div
      className={cx("tbl-wrap", stickyHeader && "sticky", stickyColumn && "sticky-col", wrapClassName)}
      style={maxHeight !== undefined ? { ...wrapStyle, maxHeight } : wrapStyle}
      {...(scroll ? { tabIndex: 0, role: "region", "aria-label": regionLabel } : null)}
    >{table}</div>
  ) : table;
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
  /** 로그 행 — 칸을 한 줄로(줄바꿈 없음) 두고 짧은 열은 글자 폭만. 글자 크기는 다른 행과 같다 */
  log?: boolean;
  /** 합계 행 (TableFoot 안) */
  total?: boolean;
}
/* 비활성 행 안에서 Tab 이 멈추는 것 — 원래 tabindex 는 data-ds-off 에 적어 두었다가 행을 켜면 되돌린다 */
const ROW_FOCUS = 'a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])';
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow({ selected, disabled, log, total, className, onClickCapture, ...rest }, ref) {
  /* 비활성 행은 inert 대신 aria-disabled(2026-11-12) — inert 는 클릭을 표로 떨어뜨리고(제품의 표 · 카드 핸들러가 받음) 행의 글자를 보조기기에서 지웠다.
     안의 링크 · 버튼은 tabindex=-1 + aria-disabled 로 Tab 에서 빼고, 클릭은 캡처에서 삼킨다(사이트는 ds.js). 칸 내용이 바뀌어도 맞게 렌더마다 다시 잰다 */
  const self = useRef<HTMLTableRowElement>(null);
  useLayoutEffect(() => {
    const tr = self.current; if (!tr) return;
    if (disabled) tr.querySelectorAll<HTMLElement>(ROW_FOCUS).forEach((el) => { if (el.hasAttribute("data-ds-off")) return; el.setAttribute("data-ds-off", el.getAttribute("tabindex") ?? ""); el.tabIndex = -1; el.setAttribute("aria-disabled", "true"); });
    else tr.querySelectorAll<HTMLElement>("[data-ds-off]").forEach((el) => { const t = el.getAttribute("data-ds-off"); if (t) el.setAttribute("tabindex", t); else el.removeAttribute("tabindex"); el.removeAttribute("aria-disabled"); el.removeAttribute("data-ds-off"); });
  });
  const swallow = (e: MouseEvent<HTMLTableRowElement>) => { if (disabled) { e.preventDefault(); e.stopPropagation(); } else onClickCapture?.(e); };
  return <tr ref={mergeRefs(ref, self)} className={cx({ on: selected, disabled, "log-row": log, total }, className) || undefined} aria-disabled={disabled || undefined} onClickCapture={swallow} {...rest} />;
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
  /** 말줄임. 잘린 칸에만 전체 값 Tooltip 을 붙이고 Tab 칸이 된다(title 은 키보드로 볼 수 없다) */
  truncate?: boolean;
  /** 주 값 아래 보조 글 (.cell-sub — 예: 이름 아래 이메일) */
  sub?: ReactNode;
}
/* 잘린 칸만 Tooltip(2026-11-12, 사이트 ds.js fitCells 와 같음) — 칸 폭이 바뀌면 다시 잰다. 비활성 행 안에서는 Tab 칸을 만들지 않는다 */
function useCut(on: boolean, td: RefObject<HTMLTableCellElement | null>, deps: unknown) {
  const [state, setState] = useState({ cut: false, off: false });
  useLayoutEffect(() => {
    const el = td.current; if (!on || !el) { setState((s) => (s.cut ? { cut: false, off: false } : s)); return; }
    let alive = true;
    const measure = () => {
      if (!alive) return;
      const t = el.querySelector<HTMLElement>(":scope > .tooltip-wrap > .cell-text") ?? el;
      const cut = t.scrollWidth > t.clientWidth, off = !!el.closest("tr.disabled");
      setState((s) => (s.cut === cut && s.off === off ? s : { cut, off }));
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    ro?.observe(el);
    return () => { alive = false; ro?.disconnect(); };
  }, [on, deps]);
  return state;
}
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell({ num, check, actions, empty, truncate, sub, className, children, ...rest }, ref) {
  const self = useRef<HTMLTableCellElement>(null);
  const { cut, off } = useCut(!!truncate, self, children);
  return (
    <td ref={mergeRefs(ref, self)} className={cx({ num, check, actions, empty, truncate }, className) || undefined} {...rest}>
      {truncate && cut ? <Tooltip content={children} multi describe={false}><span className="cell-text" tabIndex={off ? undefined : 0}>{children}</span></Tooltip> : children}
      {sub != null && sub !== false && <span className="cell-sub">{sub}</span>}
    </td>
  );
});
