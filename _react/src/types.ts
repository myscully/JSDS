import type { ElementType } from "react";

export type Size = "sm" | "md" | "lg";
/** Tag · Chart 등에서 쓰는 의미 색. severity 5단계 + ok/pending/accent */
/* 심각도 다섯 등급(critical · high · medium · low · info, 사람의 결정 2026-11-06) + 세 보조 톤.
   여기의 "info" 는 심각도 Info(중립 회색)다 — 상태 Informative 는 FeedbackTone·StatusTone 의 "info"(청록)이고 축이 다르다.
   pending 은 상태 톤('검토 대기', 청록)으로, 심각도 Medium 과 클래스를 나눠 쓰지 않게 갈랐다 */
export type Tone = "critical" | "high" | "medium" | "low" | "info" | "ok" | "pending" | "accent";
/** Notice · Toast · Banner 의 피드백 톤 */
export type FeedbackTone = "info" | "success" | "warning" | "danger";
/** 상태 점(Indicator) 톤 */
export type StatusTone = "ok" | "warn" | "danger" | "info" | "accent";

/** `as` prop 으로 루트 요소를 바꿀 수 있는 컴포넌트용 */
export type AsProp<E extends ElementType = ElementType> = { as?: E };
