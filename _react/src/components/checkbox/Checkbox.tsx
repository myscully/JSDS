import { forwardRef, useEffect, useRef, type ChangeEvent, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { mergeRefs } from "../../utils/hooks";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "children"> {
  /** 라벨. 없으면 aria-label 을 넣는다(테이블 행 선택 등) */
  children?: ReactNode;
  /** 라벨 아래 설명 */
  description?: ReactNode;
  /** 부분 선택. el.indeterminate + .mixed 클래스 */
  indeterminate?: boolean;
  onChange?: (checked: boolean, e: ChangeEvent<HTMLInputElement>) => void;
  /** 라벨(label.checkbox) 클래스 */
  wrapperClassName?: string;
}

/** 네이티브 체크박스 + CSS 외형. label 로 감싸 라벨 클릭도 토글된다 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { children, description, indeterminate, onChange, className, wrapperClassName, ...rest },
  ref,
) {
  const inner = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inner.current) inner.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);
  return (
    <label className={cx("checkbox", wrapperClassName)}>
      <input
        ref={mergeRefs(inner, ref)}
        type="checkbox"
        className={cx(indeterminate && "mixed", className)}
        onChange={(e) => onChange?.(e.target.checked, e)}
        {...rest}
      />
      {children !== undefined && (
        <span>
          {children}
          {description !== undefined && <small>{description}</small>}
        </span>
      )}
    </label>
  );
});

export interface CheckboxGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** 가로 배치 (24px 간격) */
  row?: boolean;
}
export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(function CheckboxGroup({ row, className, ...rest }, ref) {
  return <div ref={ref} className={cx("checkbox-group", { row }, className)} {...rest} />;
});
