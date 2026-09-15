import { forwardRef, useMemo, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useControllable } from "../../utils/useControllable";
import { Checkbox } from "../checkbox/Checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table/Table";
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
}
export interface SortState { key: string; dir: "asc" | "desc" }

export interface DataTableProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  /** 체크박스 열 */
  selectable?: boolean;
  selected?: ReadonlySet<string>;
  defaultSelected?: ReadonlySet<string>;
  onSelectedChange?: (selected: Set<string>) => void;
  /** 선택이 있을 때 표 위에 표시 (ActionBar) */
  actionBar?: (selected: Set<string>) => ReactNode;
  /** 행 속성 */
  rowProps?: (row: T, index: number) => { selected?: boolean; disabled?: boolean; log?: boolean; className?: string; onClick?: () => void };
  /** 행 액션 셀 (td.actions) */
  actions?: (row: T) => ReactNode;
  /** rows 가 비었을 때 */
  empty?: ReactNode;
  compact?: boolean;
  zebra?: boolean;
  wrapStyle?: CSSProperties;
}

function defaultSortValue<T>(row: T, key: string): string | number {
  const v = (row as Record<string, unknown>)[key];
  return typeof v === "number" ? v : String(v ?? "");
}

function DataTableInner<T>(
  { columns, rows, rowKey, sort, defaultSort = null, onSortChange, selectable, selected, defaultSelected, onSelectedChange, actionBar, rowProps, actions, empty, compact, zebra, className, wrapStyle, ...rest }: DataTableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const [curSort, setSort] = useControllable<SortState | null>({ value: sort, defaultValue: defaultSort, onChange: onSortChange });
  const [sel, setSel] = useControllable<ReadonlySet<string>>({ value: selected, defaultValue: defaultSelected ?? new Set(), onChange: onSelectedChange as (s: ReadonlySet<string>) => void });
  const sortedRows = useMemo(() => {
    if (!curSort) return rows;
    const col = columns.find((c) => c.key === curSort.key);
    const val = (r: T) => (col?.sortValue ? col.sortValue(r) : defaultSortValue(r, curSort.key));
    const dir = curSort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => { const x = val(a), y = val(b); return (x < y ? -1 : x > y ? 1 : 0) * dir; });
  }, [rows, curSort, columns]);
  const toggleSort = (key: string) => {
    if (!curSort || curSort.key !== key) setSort({ key, dir: "asc" });
    else setSort({ key, dir: curSort.dir === "asc" ? "desc" : "asc" });
  };
  const allKeys = rows.map(rowKey);
  const allChecked = allKeys.length > 0 && allKeys.every((k) => sel.has(k));
  const someChecked = allKeys.some((k) => sel.has(k)) && !allChecked;
  const toggleAll = (on: boolean) => setSel(new Set(on ? allKeys : []));
  const toggleOne = (k: string, on: boolean) => { const n = new Set(sel); if (on) n.add(k); else n.delete(k); setSel(n); };
  const colCount = columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0);
  return (
    <div ref={ref} className={cx("tbl-wrap", className)} style={wrapStyle} {...rest}>
      {actionBar && sel.size > 0 && actionBar(new Set(sel))}
      <Table compact={compact} zebra={zebra} wrap={false}>
        <TableHead>
          <TableRow>
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
                onClick={c.sortable ? () => toggleSort(c.key) : undefined}
              >
                {c.header}
              </TableHeader>
            ))}
            {actions && <TableHeader actions />}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRows.length === 0 ? (
            <TableRow>
              <TableCell empty colSpan={colCount}>{empty ?? "데이터가 없습니다."}</TableCell>
            </TableRow>
          ) : (
            sortedRows.map((row, i) => {
              const k = rowKey(row);
              const rp = rowProps?.(row, i) ?? {};
              const isSel = selectable ? sel.has(k) : rp.selected;
              return (
                <TableRow key={k} selected={isSel} disabled={rp.disabled} log={rp.log} className={rp.className} onClick={rp.onClick}>
                  {selectable && (
                    <TableCell check>
                      <Checkbox checked={sel.has(k)} onChange={(on) => toggleOne(k, on)} aria-label={LABELS.select} />
                    </TableCell>
                  )}
                  {columns.map((c) => (
                    <TableCell key={c.key} num={c.num} className={c.className}>
                      {c.render ? c.render(row, i) : ((row as Record<string, unknown>)[c.key] as ReactNode)}
                    </TableCell>
                  ))}
                  {actions && <TableCell actions>{actions(row)}</TableCell>}
                </TableRow>
              );
            })
          )}
        </TableBody>
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
