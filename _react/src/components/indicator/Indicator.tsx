import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { Icon } from "../../icons/Icon";
import type { StatusTone } from "../../types";

export interface IndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  /** ok · warn · danger · info · accent. 없으면 중립 */
  tone?: StatusTone;
  /** 실시간 위험 깜빡임 */
  pulse?: boolean;
}
/** 상태 점 + 라벨. 라벨(children)은 필수 — 색만으로 의미를 전달하지 않는다 */
export const Indicator = forwardRef<HTMLSpanElement, IndicatorProps>(function Indicator({ tone, pulse, className, ...rest }, ref) {
  return <span ref={ref} className={cx("indicator", tone, { pulse }, className)} {...rest} />;
});

export interface CountProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** 건수. 0 이면 렌더하지 않는다(가이드라인). 생략 + dot 이면 점만 */
  value?: number;
  /** 이 값을 넘으면 "99+" 형식 */
  max?: number;
  tone?: "accent" | "neutral";
  /** 숫자 없이 점만 (새 알림 표시) */
  dot?: boolean;
  /** dot 이 아닐 때 스크린리더 문구. 기본 "{n}건" */
  label?: string;
}
export const Count = forwardRef<HTMLSpanElement, CountProps>(function Count({ value, max = 99, tone, dot, label, className, ...rest }, ref) {
  if (!dot && (value === undefined || value === 0)) return null;
  const text = dot ? "" : value! > max ? `${max}+` : String(value);
  return (
    <span ref={ref} className={cx("count", tone, { dot }, className)} aria-hidden={dot || undefined} aria-label={!dot ? label ?? `${value}건` : undefined} {...rest}>
      {text}
    </span>
  );
});

export interface WithCountProps extends HTMLAttributes<HTMLSpanElement> {
  /** 우상단에 얹을 Count */
  count: ReactNode;
}
/** 아이콘 버튼 우상단에 Count 배치 */
export const WithCount = forwardRef<HTMLSpanElement, WithCountProps>(function WithCount({ count, className, children, ...rest }, ref) {
  return (
    <span ref={ref} className={cx("with-count", className)} {...rest}>
      {children}
      {count}
    </span>
  );
});

export interface StepsProps extends Omit<HTMLAttributes<HTMLOListElement>, "children"> {
  /** 단계 라벨 */
  items: ReactNode[];
  /** 현재 단계 인덱스(0부터). 그 앞은 완료 */
  current: number;
  vertical?: boolean;
}
/** 온보딩·마법사 진행 단계 */
export const Steps = forwardRef<HTMLOListElement, StepsProps>(function Steps({ items, current, vertical, className, ...rest }, ref) {
  return (
    <ol ref={ref} className={cx("steps", { vertical }, className)} {...rest}>
      {items.map((label, i) => {
        const done = i < current, on = i === current;
        return (
          <li key={i} className={cx({ done, on })} aria-current={on ? "step" : undefined}>
            <i>{done ? <Icon name="check" size={12} /> : i + 1}</i>
            {label}
          </li>
        );
      })}
    </ol>
  );
});
