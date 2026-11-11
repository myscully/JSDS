import { Fragment, forwardRef, useEffect, useId, useLayoutEffect, useMemo, useRef, type CSSProperties, type HTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useControllable } from "../../utils/useControllable";
import { mergeRefs } from "../../utils/hooks";
import { Button } from "../button/Button";
import { Checkbox } from "../checkbox/Checkbox";
import { Skeleton } from "../loading/Loading";
import { Icon } from "../../icons/Icon";
import { Table, TableBody, TableCell, TableFoot, TableHead, TableHeader, TableRow, type TableDensity, type TableRowStyle } from "../table/Table";
import { LABELS } from "../../labels";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  sortable?: boolean;
  /** 숫자 열 */
  num?: boolean;
  width?: number | string;
  className?: string;
  render?: (row: T, index: number) => ReactNode;
  /** 정렬 기준 값 (기본 row[key]) */
  sortValue?: (row: T) => string | number;
  /** 말줄임. 값이 문자열이면 title 로 전체 값을 둔다 */
  truncate?: boolean;
  /** 주 값 아래 보조 글(.cell-sub) — 예: 이름 아래 이메일. 두 줄이라 density="relaxed" 를 권한다 */
  sub?: (row: T, index: number) => ReactNode;
}
export interface SortState { key: string; dir: "asc" | "desc" }

export interface DataTableProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  /** 서버 정렬 — 표시만 바꾸고 rows 를 다시 정렬하지 않는다 */
  manualSort?: boolean;
  /** 체크박스 열 */
  selectable?: boolean;
  /** 행 이름 — 체크박스의 접근 이름(… 선택). 기본은 첫 열의 값 */
  rowLabel?: (row: T) => string;
  selected?: ReadonlySet<string>;
  defaultSelected?: ReadonlySet<string>;
  onSelectedChange?: (selected: Set<string>) => void;
  /** 선택이 있을 때 표 위에 표시 (ActionBar). count 는 전체 결과를 골랐으면 totalCount */
  actionBar?: (selected: Set<string>, info: { allMatching: boolean; count: number }) => ReactNode;
  /** 필터 · 검색 · 기간처럼 이 값이 바뀌면 선택을 지운다 */
  selectionScope?: unknown;
  /** 조건에 맞는 전체 건수. 주면 이 페이지를 다 골랐을 때 전체 결과 선택을 안내한다 */
  totalCount?: number;
  allMatching?: boolean;
  defaultAllMatching?: boolean;
  onAllMatchingChange?: (all: boolean) => void;
  selectNoticeText?: Partial<typeof NOTICE>;
  /** 행 속성 */
  rowProps?: (row: T, index: number) => { selected?: boolean; disabled?: boolean; log?: boolean; className?: string; onClick?: () => void };
  /** 행 액션 셀 (td.actions) */
  actions?: (row: T) => ReactNode;
  /** 행 펼침 — 주면 맨 앞에 셰브론 칸이 생기고 그 행 아래 tr.row-detail 에 그린다. 접힌 행도 그려 두므로(사이트 마크업과 같다) 불러와야 하는 내용은 expanded 일 때만 돌려준다 */
  renderExpanded?: (row: T, info: { expanded: boolean }) => ReactNode;
  /** 펼칠 내용이 없는 행은 false — 셰브론 없이 빈 칸 */
  expandable?: (row: T) => boolean;
  /** 펼친 행의 rowKey. 지금 rows 에 없는 키는 지운다(페이지를 옮기면 접힘) */
  expanded?: ReadonlySet<string>;
  defaultExpanded?: ReadonlySet<string>;
  /** key 는 바꾼 행, 한꺼번에 접었으면 null */
  onExpandedChange?: (expanded: Set<string>, info: { key: string | null; expanded: boolean }) => void;
  /** 필터 · 검색 · 기간처럼 이 값이 바뀌면 모두 접는다. 정렬은 펼침을 남긴다 */
  expandScope?: unknown;
  /** 셰브론 버튼의 접근 이름. 기본 '{행 이름} 상세' */
  expandLabel?: (row: T) => string;
  /** rows 가 비었을 때 */
  empty?: ReactNode;
  /** 불러오는 중이면 Skeleton 행, 실패면 오류 행으로 rows 를 대신한다 */
  status?: "loading" | "error";
  /** 실제 작업으로. 예) 이벤트 불러오는 중 */
  statusLabel?: string;
  loadingRows?: number;
  /** 원인과 다음 행동 */
  errorText?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  /** 고정 헤더. maxHeight 와 이름(aria-label 또는 caption)을 함께 준다 */
  stickyHeader?: boolean;
  maxHeight?: number | string;
  /** 표 이름. 화면에는 보이지 않는다 */
  caption?: string;
  /** 첫 열 고정 — 가로 스크롤 때 맨 앞 펼침 · 체크박스 칸과 첫 열을 왼쪽에 둔다. 스크롤 영역이라 이름(aria-label 또는 caption)을 함께 준다 */
  stickyColumn?: boolean;
  /** 합계 · 평균 행(tfoot tr.total) — 열 key 별 값. 첫 열에 '이 페이지 합계' · '전체 합계' 처럼 범위를 적는다 */
  summaryRow?: Partial<Record<string, ReactNode>>;
  /** 행 40 (= density="compact") */
  compact?: boolean;
  /** 행 높이 — compact 40 · default 48 · relaxed 56 */
  density?: TableDensity;
  /** 줄무늬 (= rowStyle="zebra") */
  zebra?: boolean;
  /** lines · zebra · grid · plain */
  rowStyle?: TableRowStyle;
  wrapStyle?: CSSProperties;
}

const NOTICE = {
  page: (n: number) => `이 페이지의 ${n.toLocaleString("ko-KR")}건을 모두 선택했습니다.`,
  all: (n: number) => `전체 ${n.toLocaleString("ko-KR")}건을 선택했습니다.`,
  selectAll: (n: number) => `전체 ${n.toLocaleString("ko-KR")}건 선택`,
  clear: "선택 해제",
};
const INNER_CONTROL = "a,button,input,select,textarea,label,[role=button],[role=menu],[role=menuitem],.dropdown";
const FOCUS_IN_ROW = "a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex='0']";

function defaultSortValue<T>(row: T, key: string): string | number {
  const v = (row as Record<string, unknown>)[key];
  return typeof v === "number" ? v : String(v ?? "");
}

function DataTableInner<T>(
  { columns, rows, rowKey, sort, defaultSort = null, onSortChange, manualSort, selectable, selected, defaultSelected, onSelectedChange, rowLabel, actionBar, selectionScope, totalCount, allMatching, defaultAllMatching, onAllMatchingChange, selectNoticeText, rowProps, actions, renderExpanded, expandable, expanded, defaultExpanded, onExpandedChange, expandScope, expandLabel, empty, status, statusLabel = LABELS.loading, loadingRows = 5, errorText = LABELS.tableError, onRetry, retryLabel = LABELS.retry, stickyHeader, stickyColumn, summaryRow, maxHeight, caption, compact, density, zebra, rowStyle, className, wrapStyle, ...rest }: DataTableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const [curSort, setSort] = useControllable<SortState | null>({ value: sort, defaultValue: defaultSort, onChange: onSortChange });
  const [sel, setSel] = useControllable<ReadonlySet<string>>({ value: selected, defaultValue: defaultSelected ?? new Set(), onChange: onSelectedChange as (s: ReadonlySet<string>) => void });
  const sortedRows = useMemo(() => {
    if (!curSort || manualSort) return rows;
    const col = columns.find((c) => c.key === curSort.key);
    const val = (r: T) => (col?.sortValue ? col.sortValue(r) : defaultSortValue(r, curSort.key));
    const dir = curSort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => { const x = val(a), y = val(b); return (x < y ? -1 : x > y ? 1 : 0) * dir; });
  }, [rows, curSort, columns, manualSort]);
  const toggleSort = (key: string) => {
    if (!curSort || curSort.key !== key) setSort({ key, dir: "asc" });
    else setSort({ key, dir: curSort.dir === "asc" ? "desc" : "asc" });
  };
  const [isAll, setAll] = useControllable<boolean>({ value: allMatching, defaultValue: defaultAllMatching ?? false, onChange: onAllMatchingChange });
  /* 머리글 체크박스는 이 페이지만 — 처리할 수 없는 행은 빼고, 다른 페이지에서 고른 것은 남긴다 */
  const allKeys = rows.filter((r, i) => !rowProps?.(r, i)?.disabled).map(rowKey);
  const allChecked = allKeys.length > 0 && allKeys.every((k) => sel.has(k));
  const someChecked = allKeys.some((k) => sel.has(k)) && !allChecked;
  const toggleAll = (on: boolean) => { const n = new Set(sel); allKeys.forEach((k) => { if (on) n.add(k); else n.delete(k); }); setSel(n); if (!on && isAll) setAll(false); };
  const toggleOne = (k: string, on: boolean) => { const n = new Set(sel); if (on) n.add(k); else n.delete(k); setSel(n); if (!on && isAll) setAll(false); };
  const clearAll = () => { setSel(new Set()); setAll(false); };
  /* 필터가 바뀌면 고른 것의 뜻이 달라진다. 첫 렌더는 건너뛴다 */
  const scopeSeen = useRef(selectionScope);
  useEffect(() => { if (scopeSeen.current !== selectionScope) { scopeSeen.current = selectionScope; clearAll(); } });   // eslint-disable-line react-hooks/exhaustive-deps

  /* 행 펼침 — 여러 행을 함께. 정렬은 키로 따라가고, 지금 rows 에 없는 키 · 범위가 바뀌면 접는다 */
  const expOn = !!renderExpanded;
  const [exp, setExpRaw] = useControllable<ReadonlySet<string>>({ value: expanded, defaultValue: defaultExpanded ?? new Set() });
  const setExp = (n: Set<string>, info: { key: string | null; expanded: boolean }) => { setExpRaw(n); onExpandedChange?.(new Set(n), info); };
  const rowKeys = rows.map(rowKey);
  const expGone = expOn && Array.from(exp).some((k) => !rowKeys.includes(k));
  useEffect(() => { if (expGone) setExp(new Set(Array.from(exp).filter((k) => rowKeys.includes(k))), { key: null, expanded: false }); });   // eslint-disable-line react-hooks/exhaustive-deps
  const expScopeSeen = useRef(expandScope);
  useEffect(() => { if (expScopeSeen.current !== expandScope) { expScopeSeen.current = expandScope; if (exp.size) setExp(new Set(), { key: null, expanded: false }); } });   // eslint-disable-line react-hooks/exhaustive-deps
  const toggleExp = (k: string) => { const n = new Set(exp); const on = !n.has(k); if (on) n.add(k); else n.delete(k); setExp(n, { key: k, expanded: on }); };
  const baseId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const origIndex = useMemo(() => new Map(rowKeys.map((k, i) => [k, i])), [rowKeys.join("\u0000")]);   // eslint-disable-line react-hooks/exhaustive-deps
  const nameOf = (row: T, k: string) => (rowLabel ? rowLabel(row) : String((row as Record<string, unknown>)[columns[0]?.key] ?? k));

  /* 행을 지운 뒤 포커스 — 포커스가 있던 행이 사라져 body 로 떨어지면 같은 자리의 행으로 옮긴다 */
  const wrapEl = useRef<HTMLDivElement | null>(null);
  const lastRow = useRef<{ key: string; index: number } | null>(null);
  const orderKeys = sortedRows.map(rowKey);
  useLayoutEffect(() => {
    const last = lastRow.current; if (!last) return;
    const now = orderKeys.indexOf(last.key);
    if (now >= 0) { last.index = now; return; }
    lastRow.current = null;
    if (document.activeElement && document.activeElement !== document.body) return;
    const trs = mainRows();
    const target = (trs[Math.min(last.index, trs.length - 1)] as HTMLElement | undefined)?.querySelector<HTMLElement>(FOCUS_IN_ROW);
    if (target) target.focus();
    else if (wrapEl.current) { if (wrapEl.current.tabIndex < 0) wrapEl.current.tabIndex = -1; wrapEl.current.focus(); }
  });
  /* 펼친 상세 행은 행 순서에 세지 않는다 — 상세 안의 포커스는 그 위 행의 것 */
  const mainRows = () => Array.from(wrapEl.current?.querySelector("table")?.tBodies[0]?.rows ?? []).filter((tr) => !tr.classList.contains("row-detail"));
  const noteRow = (e: { target: EventTarget }) => {
    let tr = (e.target as Element).closest?.("tr") as HTMLTableRowElement | null;
    if (tr?.classList.contains("row-detail")) tr = tr.previousElementSibling as HTMLTableRowElement | null;
    const i = tr ? mainRows().indexOf(tr) : -1;
    if (i >= 0 && i < orderKeys.length) lastRow.current = { key: orderKeys[i], index: i };
  };
  const rowClick = (fn: (() => void) | undefined) => fn && ((e: MouseEvent) => {
    /* 안쪽 버튼 · 링크 · 체크박스는 자기 일만 한다. 글자를 끌어 고른 것도 클릭이 아니다 */
    if ((e.target as Element).closest(INNER_CONTROL) || window.getSelection()?.toString()) return;
    fn();
  });
  const text = { ...NOTICE, ...selectNoticeText };
  const noticeBody = totalCount === undefined ? null
    : isAll ? <><span>{text.all(totalCount)}</span><Button variant="text" size="sm" onClick={clearAll}>{text.clear}</Button></>
    : allChecked && totalCount > allKeys.length ? <><span>{text.page(allKeys.length)}</span><Button variant="text" size="sm" onClick={() => setAll(true)}>{text.selectAll(totalCount)}</Button></>
    : null;
  const colCount = columns.length + (expOn ? 1 : 0) + (selectable ? 1 : 0) + (actions ? 1 : 0);
  return (
    <div
      ref={mergeRefs(ref, wrapEl)}
      className={cx("tbl-wrap", stickyHeader && "sticky", stickyColumn && "sticky-col", className)}
      style={maxHeight !== undefined ? { ...wrapStyle, maxHeight } : wrapStyle}
      {...(stickyHeader || stickyColumn ? { tabIndex: 0, role: "region", "aria-label": caption } : null)}
      {...rest}
    >
      {actionBar && sel.size > 0 && actionBar(new Set(sel), { allMatching: !!isAll, count: isAll && totalCount !== undefined ? totalCount : sel.size })}
      {selectable && totalCount !== undefined && <div className="select-notice" aria-live="polite">{noticeBody}</div>}
      {status === "loading" && <span className="sr-only" role="status">{statusLabel}</span>}
      <Table compact={compact} density={density} zebra={zebra} rowStyle={rowStyle} wrap={false} aria-busy={status === "loading" || undefined}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <TableHead>
          <TableRow>
            {expOn && <TableHeader className="expand"><span className="sr-only">{LABELS.detail}</span></TableHeader>}
            {selectable && (
              <TableHeader check>
                <Checkbox checked={allChecked} indeterminate={someChecked} onChange={toggleAll} aria-label={LABELS.selectAll} />
              </TableHeader>
            )}
            {columns.map((c) => (
              <TableHeader
                key={c.key}
                num={c.num}
                sortable={c.sortable}
                sorted={curSort?.key === c.key ? curSort.dir : undefined}
                className={c.className}
                style={c.width !== undefined ? { width: c.width } : undefined}
                data-key={c.sortable ? c.key : undefined}
                onClick={c.sortable ? () => toggleSort(c.key) : undefined}
              >
                {c.header}
              </TableHeader>
            ))}
            {actions && <TableHeader actions />}
          </TableRow>
        </TableHead>
        <TableBody onFocusCapture={noteRow}>
          {status === "loading" ? (
            Array.from({ length: loadingRows }, (_, i) => (
              <TableRow key={i}>
                {Array.from({ length: colCount }, (_, j) => <TableCell key={j}><Skeleton /></TableCell>)}
              </TableRow>
            ))
          ) : status === "error" ? (
            <TableRow>
              <TableCell empty colSpan={colCount}>
                <div className="empty" role="alert">{errorText}{onRetry && <>{" "}<Button variant="outline" color="assistive" size="sm" onClick={onRetry}>{retryLabel}</Button></>}</div>
              </TableCell>
            </TableRow>
          ) : sortedRows.length === 0 ? (
            <TableRow>
              <TableCell empty colSpan={colCount}>{empty ?? "데이터가 없습니다."}</TableCell>
            </TableRow>
          ) : (
            sortedRows.map((row, i) => {
              const k = rowKey(row);
              const rp = rowProps?.(row, i) ?? {};
              const isSel = selectable ? sel.has(k) : rp.selected;
              const canExp = expOn && (expandable ? expandable(row) : true);
              const open = canExp && exp.has(k);
              const detailId = `${baseId}-row-${origIndex.get(k) ?? i}`;
              const main = (
                <TableRow key={k} selected={isSel} disabled={rp.disabled} log={rp.log} className={rp.className} onClick={rowClick(rp.onClick)}>
                  {expOn && (
                    <TableCell className="expand">
                      {canExp && (
                        <button type="button" className="expand-btn" aria-expanded={open} aria-controls={detailId} aria-label={expandLabel ? expandLabel(row) : `${nameOf(row, k)} ${LABELS.detail}`} onClick={() => toggleExp(k)}>
                          <Icon name="chevron-right" size={16} />
                        </button>
                      )}
                    </TableCell>
                  )}
                  {selectable && (
                    <TableCell check>
                      <Checkbox checked={sel.has(k)} onChange={(on) => toggleOne(k, on)} aria-label={`${nameOf(row, k)} ${LABELS.select}`} />
                    </TableCell>
                  )}
                  {columns.map((c) => {
                    const raw = (row as Record<string, unknown>)[c.key];
                    return (
                      <TableCell key={c.key} num={c.num} truncate={c.truncate} title={c.truncate && typeof raw === "string" ? raw : undefined} className={c.className} sub={c.sub?.(row, i)}>
                        {c.render ? c.render(row, i) : (raw as ReactNode)}
                      </TableCell>
                    );
                  })}
                  {actions && <TableCell actions>{actions(row)}</TableCell>}
                </TableRow>
              );
              if (!canExp) return main;
              return (
                <Fragment key={k}>
                  {main}
                  <TableRow className="row-detail" id={detailId} hidden={!open}>
                    <TableCell colSpan={colCount}><div className="row-detail-body">{renderExpanded!(row, { expanded: open })}</div></TableCell>
                  </TableRow>
                </Fragment>
              );
            })
          )}
        </TableBody>
        {summaryRow && status === undefined && (
          <TableFoot>
            <TableRow total>
              {expOn && <TableCell className="expand" />}
              {selectable && <TableCell check />}
              {columns.map((c) => <TableCell key={c.key} num={c.num} className={c.className}>{summaryRow[c.key]}</TableCell>)}
              {actions && <TableCell actions />}
            </TableRow>
          </TableFoot>
        )}
      </Table>
    </div>
  );
}
/** 정렬·선택·행 액션을 갖춘 데이터 표 */
export const DataTable = forwardRef(DataTableInner) as <T>(props: DataTableProps<T> & { ref?: React.Ref<HTMLDivElement> }) => ReturnType<typeof DataTableInner>;

export interface ActionBarProps extends HTMLAttributes<HTMLDivElement> {
  /** 선택 건수 → "<b>n개 선택</b>" */
  count: number;
  /** 선택 문구 커스텀 */
  label?: (count: number) => ReactNode;
}
/** 선택 건수 + 일괄 액션 (DataTable actionBar 에 사용) */
export const ActionBar = forwardRef<HTMLDivElement, ActionBarProps>(function ActionBar({ count, label, className, children, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("action-bar", className)} {...rest}>
      <b>{label ? label(count) : `${count}개 선택`}</b>
      <span className="spacer" />
      {children}
    </div>
  );
});
