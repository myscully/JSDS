import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { LABELS } from "../../labels";
import type { Size } from "../../types";

export interface SpinnerProps extends HTMLAttributes<HTMLElement> {
  /** 16 / 24 / 40 */
  size?: Size;
  /** aria-label. 기본 "불러오는 중" */
  label?: string;
  /** 있으면 .spinner-wrap (스피너 + 문구) */
  children?: ReactNode;
}
export const Spinner = forwardRef<HTMLElement, SpinnerProps>(function Spinner({ size = "md", label = LABELS.loading, className, children, ...rest }, ref) {
  const cls = cx("spinner", size !== "md" && size);
  if (children !== undefined) {
    return (
      <div ref={ref as React.Ref<HTMLDivElement>} className={cx("spinner-wrap", className)} role="status" {...rest}>
        <span className={cls} />
        {children}
      </div>
    );
  }
  return <span ref={ref as React.Ref<HTMLSpanElement>} className={cx(cls, className)} role="status" aria-label={label} {...rest} />;
});

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "title" | "text" | "short" | "circle" | "rect";
}
/** 콘텐츠 형태 자리표시. 컨테이너에 aria-busy */
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton({ variant = "text", className, ...rest }, ref) {
  const v = variant === "short" ? "text short" : variant;
  return <span ref={ref} className={cx("skeleton", v, className)} aria-hidden="true" {...rest} />;
});

export interface SkeletonRowProps extends HTMLAttributes<HTMLDivElement> {
  /** 앞에 원형 */
  avatar?: boolean;
  /** 줄 종류 순서. 기본 [title, text] */
  lines?: Array<"title" | "text" | "short">;
}
export const SkeletonRow = forwardRef<HTMLDivElement, SkeletonRowProps>(function SkeletonRow({ avatar, lines = ["title", "text"], className, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("skeleton-row", className)} {...rest}>
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
    <div ref={ref} className={cx("progress", tone, size, className)} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={max} {...rest}>
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
