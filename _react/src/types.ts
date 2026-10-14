import type { ElementType } from "react";

export type Size = "sm" | "md" | "lg";
/** Tag · Chart 등에서 쓰는 의미 색. severity 5단계 + ok/accent */
/* 심각도 네 등급 + 두 보조 톤. severity Info 랭크는 제거했다 —
   상태 Informative 는 FeedbackTone·StatusTone 의 "info" 이고, 두 축을 타입으로 가른다 */
export type Tone = "critical" | "high" | "medium" | "low" | "ok" | "accent";
/** Notice · Toast · Banner 의 피드백 톤 */
export type FeedbackTone = "info" | "success" | "warning" | "danger";
/** 상태 점(Indicator) 톤 */
export type StatusTone = "ok" | "warn" | "danger" | "info" | "accent";

/** `as` prop 으로 루트 요소를 바꿀 수 있는 컴포넌트용 */
export type AsProp<E extends ElementType = ElementType> = { as?: E };
