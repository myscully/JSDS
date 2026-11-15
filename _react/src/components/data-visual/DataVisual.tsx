import { forwardRef, useId, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { Icon } from "../../icons/Icon";
import type { Tone } from "../../types";

/* 심각도 등급 → 상태색 의도. 문자열 조립(`var(--sev-${t})`)을 쓰지 않는다 —
   토큰 이름이 코드에 드러나야 개명이 타입·검색에 걸린다.
   도넛 조각·범례 칩·바는 글자가 올라가지 않으므로 전부 graphic 역할이다 */
const TONE_VAR: Record<string, string> = {
  critical: "--foreground-negative-strong", high: "--foreground-cautionary-primary", medium: "--foreground-accent-light-blue",
  low: "--foreground-accent-lime", info: "--foreground-inactive-primary", pending: "--foreground-accent-cyan", ok: "--foreground-positive-primary",
  brand: "--foreground-brand-primary", accent: "--foreground-brand-primary",
};
/* 한 톤(사람의 결정 2026-11-15) — tone 없는 계열 · 조각은 고정 파랑 명도 단계. 계열 수에 따라 쓰는 단계가 다르다(ds-chart MONO_STEPS 와 같다).
   5개를 넘으면 계열 색 --chart-series-1~6 */
const MONO = ["--chart-mono-1", "--chart-mono-2", "--chart-mono-3", "--chart-mono-4"];
const MONO_STEPS: Record<number, number[]> = { 1: [0], 2: [0, 3], 3: [0, 1, 3], 4: [0, 1, 2, 3] };
export type ChartColorMode = "mono" | "categorical";
/** tone 없는 n 개에 줄 색(var(...)) — mode 를 적지 않으면 4개 이하 mono · 넘으면 categorical */
export function freeColors(n: number, mode?: ChartColorMode): string[] {
  const cat = mode === "categorical" || n > MONO.length;
  if (process.env.NODE_ENV !== "production" && mode === "mono" && n > MONO.length) console.warn(`[ds-react] 한 톤은 tone 없는 계열 ${MONO.length}개까지입니다(${n}개) — 계열 색으로 그립니다(Data Visual › 색).`);
  return Array.from({ length: n }, (_, j) => cat ? `var(--chart-series-${Math.min(j, 5) + 1})` : `var(${MONO[MONO_STEPS[n]![j]!]})`);
}
const toneVar = (t?: Tone | string) => (t && TONE_VAR[t] ? `var(${TONE_VAR[t]})` : t);

/** 증감의 의미 — bad(위협 증가 등) · good(차단률 상승 등) · 없음(중립). 색은 의미로, 방향은 화살표로 */
export type DeltaTone = "bad" | "good";
export interface DeltaProps { children: ReactNode; dir?: "up" | "down"; tone?: DeltaTone }
/** 증감 배지 — Tag sm 크기의 틴트 배지. 화살표 옆에 숨긴 '증가' · '감소' */
export function Delta({ children, dir, tone }: DeltaProps) {
  return (
    <span className={cx("delta", tone)}>
      {dir && <Icon name={dir === "up" ? "arrow-up" : "arrow-down"} size={12} />}
      {dir && <span className="sr-only">{dir === "up" ? "증가" : "감소"}</span>}
      {children}
    </span>
  );
}
let warnedDir = false;
const legacyTone = (dir?: "up" | "down", tone?: DeltaTone | "neutral"): DeltaTone | undefined => {
  if (tone) return tone === "neutral" ? undefined : tone;
  if (!dir) return undefined;
  if (process.env.NODE_ENV !== "production" && !warnedDir) { warnedDir = true; console.warn('[ds-react] deltaDir 은 이제 방향만 나릅니다 — 색은 deltaTone("bad" | "good" | "neutral")로 정하세요. 옛 뜻대로 up = bad · down = good 으로 그립니다(MIGRATION.md).'); }
  return dir === "up" ? "bad" : "good";
};

export interface KpiProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  /** 값 옆 작은 단위 (%, / 1,284) */
  unit?: ReactNode;
  /** 증감 배지 글자(12% · 0.3%p) */
  delta?: ReactNode;
  /** 화살표 방향 — 방향만 나르고 색은 deltaTone */
  deltaDir?: "up" | "down";
  /** 증감의 의미 — bad · good · neutral(기본). 적지 않고 deltaDir 만 주면 옛 뜻(up = bad · down = good)으로 그리고 한 번 경고 */
  deltaTone?: DeltaTone | "neutral";
  /** 배지 밖 비교 기준 · 보조 문구(전주 대비 · 37대 오프라인) */
  note?: ReactNode;
  /** 값 색 */
  tone?: "critical" | "high";
  /** outline(1px 보더, 기본) · flat(보더 색 없음 — 주변에 배경색 background/neutral/secondary 이 있을 때만. Card 와 같은 규칙) */
  variant?: "outline" | "flat";
  /** 작은 KPI(값 24) — 좁은 자리 · 썸네일 */
  compact?: boolean;
}
/** 대시보드 수치 카드 — 라벨 · 값 · .kpi-foot(증감 배지 + 비교 기준). 스파크라인은 children 으로(Sparkline · SparkCanvas) */
export const Kpi = forwardRef<HTMLDivElement, KpiProps>(function Kpi({ label, value, unit, delta, deltaDir, deltaTone, note, tone, variant, compact, className, children, ...rest }, ref) {
  const dt = delta !== undefined ? legacyTone(deltaDir, deltaTone) : undefined;
  return (
    <div ref={ref} className={cx("kpi", tone, { flat: variant === "flat", compact }, className)} {...rest}>
      <span className="label">{label}</span>
      <span className="value">
        {value}
        {unit !== undefined && <small>{unit}</small>}
      </span>
      {(delta !== undefined || note !== undefined) && (
        <div className="kpi-foot">
          {delta !== undefined && <Delta dir={deltaDir} tone={dt}>{delta}</Delta>}
          {note !== undefined && <span className="delta-note">{note}</span>}
        </div>
      )}
      {children}
    </div>
  );
});
export const KpiGrid = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function KpiGrid({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("kpi-grid", className)} {...rest} />;
});

/** 차트 카드의 큰 값 — 값 · 단위 · 증감 · 비교 기준 */
export interface ChartFigure { value: ReactNode; unit?: ReactNode; delta?: ReactNode; deltaDir?: "up" | "down"; deltaTone?: DeltaTone | "neutral"; note?: ReactNode }
export interface ChartCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  /** 제목 옆 보조 글자(기간 등) */
  sub?: ReactNode;
  /** @deprecated sub 를 쓰세요 */
  extra?: ReactNode;
  /** 머리 오른쪽 동작 — Select sm(기간) · 텍스트 assistive 버튼('전체 보기') */
  action?: ReactNode;
  /** 머리 아래 큰 값. 같은 줄의 카드는 모두 갖거나 모두 갖지 않게 */
  figure?: ChartFigure;
  /** 본문 높이 단계 — sm 160 · md 240(기본) · lg 320 */
  size?: "sm" | "md" | "lg";
  /** 본문 자리를 상태로 바꿈 — 머리는 남고 높이는 그대로 */
  state?: "loading" | "empty" | "error";
  /** 빈 · 오류 상태의 제목 · 설명 */
  stateTitle?: ReactNode;
  stateText?: ReactNode;
  /** 오류 상태의 '다시 시도' */
  onRetry?: () => void;
  /** outline(1px 보더, 기본) · flat(보더 색 없음 — 주변에 배경색 background/neutral/secondary 이 있을 때만) */
  variant?: "outline" | "flat";
}
let warnedExtra = false;
/** 차트를 담는 카드 — .chart-head(제목 · 보조 · 동작, 높이 32) · .chart-figure? · 본문. 어느 차트를 넣어도 같은 틀이라 한 줄에 두면 줄이 맞는다 */
export const ChartCard = forwardRef<HTMLDivElement, ChartCardProps>(function ChartCard({ title, sub, extra, action, figure, size, state, stateTitle, stateText, onRetry, variant, className, children, ...rest }, ref) {
  if (process.env.NODE_ENV !== "production" && extra !== undefined && !warnedExtra) { warnedExtra = true; console.warn("[ds-react] ChartCard extra 는 sub 로 바뀌었습니다(MIGRATION.md)."); }
  const s = sub ?? extra;
  return (
    <div ref={ref} className={cx("chart-card", size !== "md" && size, { flat: variant === "flat" }, className)} aria-busy={state === "loading" ? true : undefined} {...rest}>
      <div className="chart-head">
        <h3 className="chart-title">{title}</h3>
        {s !== undefined && <span className="chart-sub">{s}</span>}
        {action !== undefined && <div className="chart-action">{action}</div>}
      </div>
      {figure && (
        <div className="chart-figure">
          <span className="value">{figure.value}{figure.unit !== undefined && <small>{figure.unit}</small>}</span>
          {figure.delta !== undefined && <Delta dir={figure.deltaDir} tone={legacyTone(figure.deltaDir, figure.deltaTone)}>{figure.delta}</Delta>}
          {figure.note !== undefined && <span className="delta-note">{figure.note}</span>}
        </div>
      )}
      {state ? (
        <div className="chart-state">
          {state === "loading" ? <span className="skeleton rect" aria-label="차트를 불러오는 중" role="status" />
            : state === "empty" ? <div className="empty"><span className="ico"><Icon name="chart-bar" size={24} /></span><b>{stateTitle ?? "표시할 데이터 없음"}</b>{stateText !== undefined && <span>{stateText}</span>}</div>
            : <div className="empty error"><span className="ico"><Icon name="alert-triangle" size={24} /></span><b>{stateTitle ?? "데이터를 불러오지 못했습니다"}</b><span>{stateText ?? "잠시 후 다시 시도하세요."}</span><button type="button" className="btn sm outline assistive" data-retry onClick={onRetry}><Icon name="refresh" size={16} />다시 시도</button></div>}
        </div>
      ) : children}
    </div>
  );
});

export interface ProgressListItem { label: ReactNode; value: number; max: number; /** 값 뒤 단위(대 · 건) */ unit?: string }
export interface ProgressListProps extends HTMLAttributes<HTMLDivElement> { items: ProgressListItem[] }
/** 진행 막대 목록 — 항목마다 목표 대비 값. 측정값이라 role=meter */
export const ProgressList = forwardRef<HTMLDivElement, ProgressListProps>(function ProgressList({ items, className, ...rest }, ref) {
  const base = useId();
  const fmt = (n: number) => n.toLocaleString("en-US");
  return (
    <div ref={ref} className={cx("progress-list", className)} {...rest}>
      {items.map((it, i) => {
        const id = `${base}-${i}`, pct = Math.round((it.value / it.max) * 1000) / 10, u = it.unit ?? "";
        return (
          <div key={i} className="progress-row">
            <div className="row"><span id={id}>{it.label}</span><span><b>{fmt(it.value)}</b><span className="target">/ {fmt(it.max)}{u}</span></span></div>
            <div className="progress" role="meter" aria-labelledby={id} aria-valuemin={0} aria-valuemax={it.max} aria-valuenow={it.value} aria-valuetext={`${fmt(it.value)}${u} / ${fmt(it.max)}${u}, ${Math.round(pct)}%`}><i style={{ width: `${pct}%` }} /></div>
          </div>
        );
      })}
    </div>
  );
});

export interface BarChartRow { label: ReactNode; value: number; /** 막대가 심각도를 나타낼 때만 — 없으면 한 톤의 가장 진한 단계 */ tone?: Tone; valueText?: ReactNode }
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
  /** tone 없는 조각의 색 — mono(4개 이하 기본, 명도 단계) · categorical(5개 이상이면 자동). tone · color 를 준 조각은 그대로 */
  color?: ChartColorMode;
}
/** conic-gradient 도넛 + 경계마다 2px 구분선. aria-label 은 세그먼트 비율로 자동 생성 */
export const Donut = forwardRef<HTMLDivElement, DonutProps>(function Donut({ segments, label, color, className, style, ...rest }, ref) {
  const free = freeColors(segments.filter((s) => !s.tone && !s.color).length, color);
  let k = 0;
  const fill = segments.map((s) => s.color ?? (s.tone ? toneVar(s.tone) : free[k++]));
  const mode = free.length ? (color ?? (free.length > 4 ? "categorical" : "mono")) : undefined;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  /* 조각은 이어 붙이고, 경계는 CSS .donut i(폭 2px 면 색 구분선)를 경계 각도(--a, 위 = 0° 시계 방향)로 돌려 낸다 — 탐색형 도넛과 같은 폭이 일정한 틈.
     이웃 조각의 밝기 대비가 낮아(라이트 1.23~1.53) 틈이 없으면 색상으로만 갈린다. 종전 conic 각도 띠는 바깥으로 넓어지는 쐐기였다(2026-11-05) */
  let acc = 0;
  const stops: string[] = [], cuts: string[] = [];
  segments.forEach((s, i) => {
    const from = (acc / total) * 100; acc += s.value; const to = (acc / total) * 100;
    stops.push(`${fill[i]} ${from.toFixed(2)}% ${to.toFixed(2)}%`);
    cuts.push(`${+(from * 3.6).toFixed(1)}deg`);
  });
  const aria = segments.map((s) => `${s.label} ${Math.round((s.value / total) * 100)}%`).join(", ");
  return (
    <div ref={ref} className={cx("donut", mode, className)} role="img" aria-label={aria} data-label={label} style={{ background: `conic-gradient(${stops.join(",")})`, ...style }} {...rest}>
      {segments.length > 1 && cuts.map((a) => <i key={a} style={{ "--a": a } as CSSProperties} />)}
    </div>
  );
});
/** 도넛 + 범례 한 줄 — 도넛은 왼쪽, 범례는 오른쪽 끝(space-between). 카드가 넓으면 둘 사이가 벌어진다 */
export const DonutRow = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function DonutRow({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("donut-row", className)} {...rest} />;
});

export interface ChartLegendItem { label: ReactNode; value?: ReactNode; /** 견본 — 심각도 · 상태 톤, 한 톤 단계 mono-1~4, 계열 색 series-1~6 */ tone?: Tone | "brand" | `mono-${1 | 2 | 3 | 4}` | `series-${1 | 2 | 3 | 4 | 5 | 6}`; color?: string }
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
/** 카드 안 소형 막대 추이 (장식, aria-hidden) — 막대는 한 톤의 옅은 단계, 강조는 진한 단계(2026-11-15, 제품 색이던 것) */
export const Sparkline = forwardRef<HTMLDivElement, SparklineProps>(function Sparkline({ values, max, hiIndex, className, ...rest }, ref) {
  const top = max ?? Math.max(1, ...values);
  const hi = hiIndex ?? values.indexOf(Math.max(...values));
  return (
    <div ref={ref} className={cx("sparkline", className)} aria-hidden="true" {...rest}>
      {values.map((v, i) => <i key={i} className={i === hi ? "hi" : undefined} style={{ height: `${Math.round((v / top) * 100)}%` }} />)}
    </div>
  );
});
