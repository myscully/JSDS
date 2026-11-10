import { forwardRef, useEffect, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { Icon } from "../../icons/Icon";

export interface StepsProps extends Omit<HTMLAttributes<HTMLOListElement>, "children"> {
  /** 단계 라벨. 3~6개 */
  items: ReactNode[];
  /** 현재 단계 인덱스(0부터). 그 앞은 완료 */
  current: number;
  vertical?: boolean;
  /** 주면 완료한 단계가 버튼이 되어 돌아갈 수 있다. 앞 단계로는 건너뛰지 않는다 */
  onStepClick?: (index: number) => void;
}
/** 온보딩·마법사 진행 단계 */
export const Steps = forwardRef<HTMLOListElement, StepsProps>(function Steps({ items, current, vertical, onStepClick, className, ...rest }, ref) {
  useEffect(() => { if (items.length < 3 || items.length > 6) console.warn(`[ds-react] Steps 는 3~6단계입니다(지금 ${items.length}단계).`); }, [items.length]);
  return (
    <ol ref={ref} className={cx("steps", { vertical }, className)} {...rest}>
      {items.map((label, i) => {
        const done = i < current, on = i === current;
        const body = (
          <>
            <i>{done ? <Icon name="check" size={12} /> : i + 1}</i>
            {label}
            {done && <span className="sr-only"> (완료)</span>}
          </>
        );
        return (
          <li key={i} className={cx({ done, on })} aria-current={on ? "step" : undefined}>
            {done && onStepClick ? <button type="button" className="step-btn" onClick={() => onStepClick(i)}>{body}</button> : body}
          </li>
        );
      })}
    </ol>
  );
});
