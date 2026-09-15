import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { Icon } from "../../icons/Icon";
import type { Tone } from "../../types";

const toneVar = (t?: Tone | string) => (t ? (["critical", "high", "medium", "low", "info"].includes(t) ? `var(--sev-${t})` : t === "ok" ? "var(--success)" : t === "accent" ? "var(--accent)" : t) : "var(--accent)");

export interface KpiProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  /** 값 옆 작은 단위 (%, / 1,284) */
  unit?: ReactNode;
  /** 증감·보조 문구 */
  delta?: ReactNode;
  /** up = 위험 증가(빨강) · down = 감소(초록) */
  deltaDir?: "up" | "down";
  /** 값 색 */
  tone?: "critical" | "high";
}
/** 대시보드 수치 카드 */
export const Kpi = forwardRef<HTMLDivElement, KpiProps>(function Kpi({ label, value, unit, delta, deltaDir, tone, className, children, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("kpi", tone, className)} {...rest}>
      <span className="label">{label}</span>
      <span className="value">
        {value}
        {unit !== undefined && <small>{unit}</small>}
      </span>
      {delta !== undefined && (
        <span className={cx("delta", deltaDir)}>
          {deltaDir && <Icon name={deltaDir === "up" ? "arrow-up" : "arrow-down"} size={12} />}
          {deltaDir ? <> {delta}</> : delta}
        </span>
      )}
      {children}
    </div>
  );
});
export const KpiGrid = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function KpiGrid({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("kpi-grid", className)} {...rest} />;
});

export interface ChartCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  /** 제목 우측 보조 (기간 등) */
  extra?: ReactNode;
}
export const ChartCard = forwardRef<HTMLDivElement, ChartCardProps>(function ChartCard({ title, extra, className, children, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("chart-card", className)} {...rest}>
      <h3 className="chart-title">
        {title}
        {extra !== undefined && <span className="t-caption-1" style={{ color: "var(--text-tertiary)" }}>{extra}</span>}
      </h3>
      {children}
    </div>
  );
});

export interface BarChartRow { label: ReactNode; value: number; tone?: Tone; valueText?: ReactNode }
export interface BarChartProps extends HTMLAttributes<HTMLDivElement> {
  rows: BarChartRow[];
  /** 100% 기준값. 기본 최댓값 */
  max?: number;
}
/** 가로 막대 비교 */
export const BarChart = forwardRef<HTMLDivElement, BarChartProps>(function BarChart({ rows, max, className, ...rest }, ref) {
  const top = max ?? Math.max(1, ...rows.map((r) => r.value));
  return (
    <div ref={ref} className={cx("chart", className)} {...rest}>
      {rows.map((r, i) => (
        <div key={i} className="row">
          <span className="lbl">{r.label}</span>
          <div className={cx("bar", r.tone)}>
            <i style={{ width: `${Math.round((r.value / top) * 100)}%` }} />
          </div>
          <span className="num">{r.valueText ?? r.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
});

export interface DonutSegment { label: string; value: number; tone?: Tone; color?: string }
export interface DonutProps extends HTMLAttributes<HTMLDivElement> {
  segments: DonutSegment[];
  /** 중앙 값 */
  label?: string;
}
/** conic-gradient 도넛. aria-label 은 세그먼트 비율로 자동 생성 */
export const Donut = forwardRef<HTMLDivElement, DonutProps>(function Donut({ segments, label, className, style, ...rest }, ref) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let acc = 0;
  const stops = segments.map((s) => {
    const from = (acc / total) * 100; acc += s.value; const to = (acc / total) * 100;
    return `${s.color ?? toneVar(s.tone)} ${from.toFixed(1)}% ${to.toFixed(1)}%`;
  });
  const aria = segments.map((s) => `${s.label} ${Math.round((s.value / total) * 100)}%`).join(", ");
  return <div ref={ref} className={cx("donut", className)} role="img" aria-label={aria} data-label={label} style={{ background: `conic-gradient(${stops.join(",")})`, ...style }} {...rest} />;
});
export const DonutRow = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DonutRow({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("donut-row", className)} {...rest} />;
});

export interface ChartLegendItem { label: ReactNode; value?: ReactNode; tone?: Tone; color?: string }
export interface ChartLegendProps extends HTMLAttributes<HTMLDivElement> {
  items: ChartLegendItem[];
  /** 세로 배치 */
  column?: boolean;
}
export const ChartLegend = forwardRef<HTMLDivElement, ChartLegendProps>(function ChartLegend({ items, column, className, style, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("chart-legend", className)} style={column ? { flexDirection: "column", ...style } : style} {...rest}>
      {items.map((it, i) => (
        <span key={i}>
          <i style={{ background: it.color ?? toneVar(it.tone) }} />
          {it.label}
          {it.value !== undefined && <> <b>{it.value}</b></>}
        </span>
      ))}
    </div>
  );
});

export interface SparklineProps extends HTMLAttributes<HTMLDivElement> {
  /** 0~100 또는 임의 값(max 로 정규화) */
  values: number[];
  max?: number;
  /** 강조 막대 인덱스 (기본 최댓값) */
  hiIndex?: number;
}
/** 카드 안 소형 막대 추이 (장식, aria-hidden) */
export const Sparkline = forwardRef<HTMLDivElement, SparklineProps>(function Sparkline({ values, max, hiIndex, className, ...rest }, ref) {
  const top = max ?? Math.max(1, ...values);
  const hi = hiIndex ?? values.indexOf(Math.max(...values));
  return (
    <div ref={ref} className={cx("sparkline", className)} aria-hidden="true" {...rest}>
      {values.map((v, i) => <i key={i} className={i === hi ? "hi" : undefined} style={{ height: `${Math.round((v / top) * 100)}%` }} />)}
    </div>
  );
});
