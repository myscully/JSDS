import { useCallback, useRef, useState } from "react";

/** 제어(value) / 비제어(defaultValue) 를 모두 지원하는 상태 훅. */
export function useControllable<T>(opts: { value?: T; defaultValue: T; onChange?: (value: T) => void }): [T, (value: T) => void] {
  const { value, defaultValue, onChange } = opts;
  const [inner, setInner] = useState<T>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value as T) : inner;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const set = useCallback(
    (next: T) => {
      if (!controlled) setInner(next);
      onChangeRef.current?.(next);
    },
    [controlled],
  );
  return [current, set];
}
