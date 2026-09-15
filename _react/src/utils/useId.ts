import { useId as reactUseId } from "react";

/** React.useId 를 속성값에 쓸 수 있는 문자로 정리. explicit 가 있으면 그대로 사용. */
export function useId(explicit?: string, prefix = "ds"): string {
  const raw = reactUseId();
  if (explicit) return explicit;
  return `${prefix}-${raw.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}
