import { forwardRef, useEffect, useLayoutEffect, useRef, type HTMLAttributes, type ReactNode, type RefObject } from "react";
import { cx } from "../../utils/cx";
import { Icon } from "../../icons/Icon";
import { LABELS } from "../../labels";
import { mergeRefs } from "../../utils/hooks";
import { Select } from "../dropdown/Dropdown";

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

/** 번호 칸 상한(화살표 제외). 앞뒤 경계 1 + 양옆 2 + 생략 2 가 9칸이다 */
const MAX_SLOTS = 9;
/** 표시 개수 표준 */
export const PAGE_SIZES = [20, 50, 100];

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
  const slots = boundaries === 0 ? siblings * 2 + 1 : boundaries * 2 + siblings * 2 + 3;
  useEffect(() => { if (process.env.NODE_ENV !== "production" && slots > MAX_SLOTS) console.warn(`[ds-react] Pagination 번호 칸은 ${MAX_SLOTS}칸 이하입니다(지금 ${slots}칸) — siblings · boundaries 를 줄이세요.`); }, [slots]);
  const navEl = useRef<HTMLElement | null>(null);
  /* 끝에 닿아 꺼진 화살표에 포커스가 남으면 키보드가 갈 곳을 잃는다 */
  useLayoutEffect(() => {
    const a = document.activeElement as HTMLButtonElement | null;
    if (a?.disabled && navEl.current?.contains(a)) navEl.current.querySelector<HTMLElement>("button.on")?.focus();
  }, [page]);
  return (
    <nav ref={mergeRefs(ref, navEl)} className={cx("pagination", { compact, outline }, className)} aria-label={label} {...rest}>
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
  /** 좌측 요약 (총 n건 · 범위). total 을 주면 기본 문구 */
  summary?: ReactNode;
  /** 우측: Pagination (페이지 크기 선택을 함께 두려면 flex 컨테이너로 묶는다) */
  children?: ReactNode;
  /** 전체 건수 — 주면 요약 · 표시 개수 · 번호를 이 컴포넌트가 그린다. 개수를 바꾸면 1페이지로 */
  total?: number;
  page?: number;
  pageSize?: number;
  pageSizes?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  /** 이동한 뒤 맨 위로 스크롤하고 포커스할 표 */
  target?: RefObject<HTMLElement | null>;
}
/** 테이블 하단 바: 좌측 요약 · 우측 페이지 */
export const PaginationBar = forwardRef<HTMLDivElement, PaginationBarProps>(function PaginationBar({ summary, className, children, total, page = 1, pageSize = PAGE_SIZES[0], pageSizes = PAGE_SIZES, onPageChange, onPageSizeChange, target, ...rest }, ref) {
  if (total === undefined) {
    return (
      <div ref={ref} className={cx("pagination-bar", className)} {...rest}>
        <span>{summary}</span>
        {children}
      </div>
    );
  }
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1, to = Math.min(page * pageSize, total);
  const fmt = (n: number) => n.toLocaleString("ko-KR");
  const moved = (p: number) => {
    onPageChange?.(p);
    const el = target?.current; if (!el) return;
    if (!el.hasAttribute("tabindex")) el.tabIndex = -1;
    el.focus({ preventScroll: true }); el.scrollIntoView?.({ block: "start" });
  };
  const showSize = total > Math.min(...pageSizes);
  return (
    <div ref={ref} className={cx("pagination-bar", className)} {...rest}>
      <span>{summary ?? <>총 <b>{fmt(total)}</b>건{pages > 1 && <> · {fmt(from)}–{fmt(to)}</>}</>}</span>
      {(showSize || pages > 1) && (
        <div>
          {showSize && <Select keepMounted options={pageSizes.map((n) => ({ value: String(n), label: `${n}개씩` }))} value={String(pageSize)} onChange={(v) => { if (v) { onPageSizeChange?.(Number(v)); if (page !== 1) moved(1); } }} />}
          {pages > 1 && <Pagination compact page={page} total={pages} siblings={2} onChange={moved} />}
        </div>
      )}
    </div>
  );
});

export interface CursorPaginationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  hasPrev: boolean;
  hasNext: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  /** 현재 범위. 예) 1–100 */
  range?: ReactNode;
  compact?: boolean;
  label?: string;
  prevLabel?: string;
  nextLabel?: string;
}
/** 전체 쪽수를 모르는 목록의 이전 · 다음 */
export const CursorPagination = forwardRef<HTMLElement, CursorPaginationProps>(function CursorPagination(
  { hasPrev, hasNext, onPrev, onNext, range, compact, label = LABELS.pagination, prevLabel = LABELS.prev, nextLabel = LABELS.next, className, ...rest },
  ref,
) {
  const navEl = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const a = document.activeElement as HTMLButtonElement | null;
    if (a?.disabled && navEl.current?.contains(a)) navEl.current.querySelector<HTMLElement>("button:not(:disabled)")?.focus();
  }, [hasPrev, hasNext]);
  return (
    <nav ref={mergeRefs(ref, navEl)} className={cx("pagination", "cursor", { compact }, className)} aria-label={label} {...rest}>
      <button type="button" data-cursor="prev" disabled={!hasPrev} onClick={onPrev}><Icon name="chevron-left" size={16} />{prevLabel}</button>
      {range !== undefined && <span className="range">{range}</span>}
      <button type="button" data-cursor="next" disabled={!hasNext} onClick={onNext}>{nextLabel}<Icon name="chevron-right" size={16} /></button>
    </nav>
  );
});
