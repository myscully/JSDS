import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { Icon } from "../../icons/Icon";
import { LABELS } from "../../labels";

export type PageItem = number | "gap";

/**
 * 표시할 페이지 목록. boundaries=0 이면 앞뒤 경계·생략(…) 없이 현재 주변만(compact 용).
 * 예) paginate(1, 24, {siblings:3}) → [1,2,3,4,"gap",24]
 */
export function paginate(page: number, total: number, opts: { siblings?: number; boundaries?: number } = {}): PageItem[] {
  const { siblings = 1, boundaries = 1 } = opts;
  if (total <= 0) return [];
  const range = (a: number, b: number) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);
  if (boundaries === 0) return range(Math.max(1, page - siblings), Math.min(total, page + siblings));
  if (total <= boundaries * 2 + siblings * 2 + 1) return range(1, total);
  const left = range(1, boundaries);
  const right = range(total - boundaries + 1, total);
  const winStart = Math.max(boundaries + 1, page - siblings), winEnd = Math.min(total - boundaries, page + siblings);
  const win = range(winStart, winEnd);
  const out: PageItem[] = [...left];
  if (win.length && win[0] > left[left.length - 1] + 1) out.push("gap");
  out.push(...win);
  const lastSoFar = out[out.length - 1];
  if (typeof lastSoFar === "number" && right[0] > lastSoFar + 1) out.push("gap");
  return [...out, ...right];
}

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  page: number;
  total: number;
  onChange?: (page: number) => void;
  /** 현재 페이지 양옆 개수 */
  siblings?: number;
  /** 앞뒤 고정 개수. 0 = 경계·생략 없음 */
  boundaries?: number;
  compact?: boolean;
  outline?: boolean;
  /** nav aria-label */
  label?: string;
  prevLabel?: string;
  nextLabel?: string;
}

/** 페이지 이동. 현재 페이지 .on + aria-current */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { page, total, onChange, siblings = 1, boundaries = 1, compact, outline, label = LABELS.pagination, prevLabel = LABELS.prev, nextLabel = LABELS.next, className, ...rest },
  ref,
) {
  const items = paginate(page, total, { siblings, boundaries });
  const go = (p: number) => { if (p >= 1 && p <= total && p !== page) onChange?.(p); };
  return (
    <nav ref={ref} className={cx("pagination", { compact, outline }, className)} aria-label={label} {...rest}>
      <button type="button" aria-label={prevLabel} disabled={page <= 1} onClick={() => go(page - 1)}>
        <Icon name="chevron-left" size={16} />
      </button>
      {items.map((it, i) =>
        it === "gap" ? (
          <span key={`gap-${i}`} className="gap">…</span>
        ) : (
          <button key={it} type="button" className={it === page ? "on" : undefined} aria-current={it === page ? "page" : undefined} onClick={() => go(it)}>
            {it}
          </button>
        ),
      )}
      <button type="button" aria-label={nextLabel} disabled={page >= total} onClick={() => go(page + 1)}>
        <Icon name="chevron-right" size={16} />
      </button>
    </nav>
  );
});

export interface PaginationBarProps extends HTMLAttributes<HTMLDivElement> {
  /** 좌측 요약 (총 n건 · 범위) */
  summary?: ReactNode;
  /** 우측: Pagination (페이지 크기 선택을 함께 두려면 flex 컨테이너로 묶는다) */
  children?: ReactNode;
}
/** 테이블 하단 바: 좌측 요약 · 우측 페이지 */
export const PaginationBar = forwardRef<HTMLDivElement, PaginationBarProps>(function PaginationBar({ summary, className, children, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("pagination-bar", className)} {...rest}>
      <span>{summary}</span>
      {children}
    </div>
  );
});
