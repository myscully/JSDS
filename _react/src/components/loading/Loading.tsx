import { forwardRef, useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { LABELS } from "../../labels";
import type { Size } from "../../types";

/** 지연 표시의 기본값(사람의 결정 2026-11-11) — 1초 안에 끝나면 보이지 않고, 한 번 보이면 0.5초 유지 */
export const LOADING_DELAY = 1000;
export const LOADING_MIN = 500;

/** delay prop → data-delay + --ds-delay. true 면 CSS 기본 1s */
function delayAttrs(delay: boolean | number | undefined, style: CSSProperties | undefined) {
  if (delay === undefined || delay === false) return { style };
  return { "data-delay": "", style: typeof delay === "number" ? ({ "--ds-delay": `${delay}ms`, ...style } as CSSProperties) : style };
}

/** 보일지를 정한다 — loading 이 delay 안에 끝나면 끝내 false, 한 번 true 가 되면 minDuration 을 채운 뒤 false.
 *  사이트 DS.loading.start · stop 과 같은 규칙. 이 값으로 그리는 Spinner · Skeleton 에는 delay 를 주지 않는다(한 번 더 기다린다) */
export function useLoadingDelay(loading: boolean, { delay = LOADING_DELAY, minDuration = LOADING_MIN }: { delay?: number; minDuration?: number } = {}): boolean {
  const [show, setShow] = useState(false);
  const shownAt = useRef(0);
  useEffect(() => {
    if (loading) {
      if (show) return;   // 이미 보이면 그대로 — 숨기려던 타이머는 앞 effect 의 정리에서 지워졌다
      const t = setTimeout(() => { shownAt.current = Date.now(); setShow(true); }, delay);
      return () => clearTimeout(t);
    }
    if (!show) return;
    const t = setTimeout(() => setShow(false), Math.max(0, minDuration - (Date.now() - shownAt.current)));
    return () => clearTimeout(t);
  }, [loading, show, delay, minDuration]);
  return show;
}

export interface SpinnerProps extends HTMLAttributes<HTMLElement> {
  /** 16 / 24 / 40 */
  size?: Size;
  /** aria-label. 기본 "불러오는 중" */
  label?: string;
  /** 있으면 .spinner-wrap (스피너 + 문구) */
  children?: ReactNode;
  /** 기다렸다 보인다 — true 는 1초, 숫자는 ms. 그 안에 지우면 깜빡이지 않는다. 버튼 loading 에는 쓰지 않는다 */
  delay?: boolean | number;
}
export const Spinner = forwardRef<HTMLElement, SpinnerProps>(function Spinner({ size = "md", label = LABELS.loading, className, children, delay, style, ...rest }, ref) {
  const cls = cx("spinner", size !== "md" && size);
  const d = delayAttrs(delay, style);
  if (children !== undefined) {
    return (
      <div ref={ref as React.Ref<HTMLDivElement>} className={cx("spinner-wrap", className)} role="status" {...d} {...rest}>
        <span className={cls} />
        {children}
      </div>
    );
  }
  return <span ref={ref as React.Ref<HTMLSpanElement>} className={cx(cls, className)} role="status" aria-label={label} {...d} {...rest} />;
});

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "title" | "text" | "short" | "circle" | "rect";
  /** 기다렸다 보인다 — true 는 1초, 숫자는 ms */
  delay?: boolean | number;
}
/** 콘텐츠 형태 자리표시. 컨테이너에 aria-busy */
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton({ variant = "text", className, delay, style, ...rest }, ref) {
  const v = variant === "short" ? "text short" : variant;
  return <span ref={ref} className={cx("skeleton", v, className)} aria-hidden="true" {...delayAttrs(delay, style)} {...rest} />;
});

export interface SkeletonRowProps extends HTMLAttributes<HTMLDivElement> {
  /** 앞에 원형 */
  avatar?: boolean;
  /** 줄 종류 순서. 기본 [title, text] */
  lines?: Array<"title" | "text" | "short">;
  /** 기다렸다 보인다 — true 는 1초, 숫자는 ms */
  delay?: boolean | number;
}
export const SkeletonRow = forwardRef<HTMLDivElement, SkeletonRowProps>(function SkeletonRow({ avatar, lines = ["title", "text"], className, delay, style, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("skeleton-row", className)} {...delayAttrs(delay, style)} {...rest}>
      {avatar && <Skeleton variant="circle" />}
      <div className="lines">
        {lines.map((l, i) => <Skeleton key={i} variant={l} />)}
      </div>
    </div>
  );
});

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  value: number;
  max?: number;
  tone?: "success" | "danger";
  size?: "sm";
  /** 있으면 .progress-row 로 감싸 라벨 행 표시 */
  label?: ReactNode;
  /** 우측 값 표기. 기본 "n%" */
  valueText?: ReactNode;
}
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress({ value, max = 100, tone, size, label, valueText, className, ...rest }, ref) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const bar = (
    <div ref={ref} className={cx("progress", tone, size, className)} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={max} aria-label={typeof label === "string" && !rest["aria-label"] && !rest["aria-labelledby"] ? label : undefined} {...rest}>
      <i style={{ width: `${pct}%` }} />
    </div>
  );
  if (label === undefined) return bar;
  return (
    <div className="progress-row">
      <div className="row">
        <span>{label}</span>
        <span>{valueText ?? `${Math.round(pct)}%`}</span>
      </div>
      {bar}
    </div>
  );
});
