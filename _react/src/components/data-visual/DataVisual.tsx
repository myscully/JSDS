import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { Icon } from "../../icons/Icon";
import type { Tone } from "../../types";

/* 심각도 등급 → 상태색 의도. 문자열 조립(`var(--sev-${t})`)을 쓰지 않는다 —
   토큰 이름이 코드에 드러나야 개명이 타입·검색에 걸린다.
   도넛 조각·범례 칩·바는 글자가 올라가지 않으므로 전부 graphic 역할이다 */
const TONE_VAR: Record<string, string> = {
  critical: "--foreground-negative-strong", high: "--foreground-cautionary-primary", medium: "--foreground-accent-lime",
  low: "--foreground-accent-light-blue", info: "--foreground-inactive-primary", pending: "--foreground-accent-cyan", ok: "--foreground-positive-primary", accent: "--foreground-brand-primary",
};
const toneVar = (t?: Tone | string) => (t ? (TONE_VAR[t] ? `var(${TONE_VAR[t]})` : t) : "var(--foreground-brand-primary)");

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
  /** outline(1px 보더, 기본) · flat(보더 색 없음 — 주변에 배경색 background/neutral/secondary 이 있을 때만. Card 와 같은 규칙) */
  variant?: "outline" | "flat";
}
/** 대시보드 수치 카드 */
export const Kpi = forwardRef<HTMLDivElement, KpiProps>(function Kpi({ label, value, unit, delta, deltaDir, tone, variant, className, children, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("kpi", tone, { flat: variant === "flat" }, className)} {...rest}>
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
  /** outline(1px 보더, 기본) · flat(보더 색 없음 — 주변에 배경색 background/neutral/secondary 이 있을 때만) */
  variant?: "outline" | "flat";
}
export const ChartCard = forwardRef<HTMLDivElement, ChartCardProps>(function ChartCard({ title, extra, variant, className, children, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("chart-card", { flat: variant === "flat" }, className)} {...rest}>
      <h3 className="chart-title">
        {title}
        {extra !== undefined && <span className="t-caption-1" style={{ color: "var(--foreground-neutral-tertiary)" }}>{extra}</span>}
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
/** conic-gradient 도넛 + 경계마다 2px 구분선. aria-label 은 세그먼트 비율로 자동 생성 */
export const Donut = forwardRef<HTMLDivElement, DonutProps>(function Donut({ segments, label, className, style, ...rest }, ref) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  /* 조각은 이어 붙이고, 경계는 CSS .donut i(폭 2px 면 색 구분선)를 경계 각도(--a, 위 = 0° 시계 방향)로 돌려 낸다 — 탐색형 도넛과 같은 폭이 일정한 틈.
     이웃 조각의 밝기 대비가 낮아(라이트 1.23~1.53) 틈이 없으면 색상으로만 갈린다. 종전 conic 각도 띠는 바깥으로 넓어지는 쐐기였다(2026-11-05) */
  let acc = 0;
  const stops: string[] = [], cuts: string[] = [];
  for (const s of segments) {
    const from = (acc / total) * 100; acc += s.value; const to = (acc / total) * 100;
    stops.push(`${s.color ?? toneVar(s.tone)} ${from.toFixed(2)}% ${to.toFixed(2)}%`);
    cuts.push(`${+(from * 3.6).toFixed(1)}deg`);
  }
  const aria = segments.map((s) => `${s.label} ${Math.round((s.value / total) * 100)}%`).join(", ");
  return (
    <div ref={ref} className={cx("donut", className)} role="img" aria-label={aria} data-label={label} style={{ background: `conic-gradient(${stops.join(",")})`, ...style }} {...rest}>
      {segments.length > 1 && cuts.map((a) => <i key={a} style={{ "--a": a } as CSSProperties} />)}
    </div>
  );
});
/** 도넛 + 범례 한 줄 — 도넛은 왼쪽, 범례는 오른쪽 끝(space-between). 카드가 넓으면 둘 사이가 벌어진다 */
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
          {/* 톤은 클래스로 넘긴다 — 사이트 HTML 과 같은 마크업이어야 하고(site-consistency),
              인라인 style 로 토큰을 참조하면 소비자 0 검사가 그 참조를 세지 못한다.
              color 를 직접 준 경우에만 인라인으로 떨어진다 */}
          <i className={it.color ? undefined : it.tone} style={it.color ? { background: it.color } : undefined} />
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
