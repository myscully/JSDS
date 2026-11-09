import { forwardRef, useContext, type FormEvent, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useId } from "../../utils/useId";
import { FormValidationContext } from "./validation";

export interface ChoiceGroupProps extends Omit<HTMLAttributes<HTMLElement>, "onChange" | "defaultValue"> {
  /** 그룹 질문. 있으면 fieldset/legend */
  legend?: ReactNode;
  /** 하나 이상 골라야 한다 — <Form validate> 와 같은 흐름 */
  required?: boolean;
  /** 도움말 */
  help?: ReactNode;
  /** 오류 문구. 주면 제품이 정한 오류를 보인다 */
  error?: ReactNode;
}

/** Checkbox · Radio 그룹의 틀. 필수 · 도움말 · 오류가 있거나 검증하는 Form 안이면 .field 로 감싼다 — 사이트 .field > fieldset[data-required] 와 같다 */
export const ChoiceGroup = forwardRef<HTMLElement, ChoiceGroupProps & { base: string }>(function ChoiceGroup(
  { base, legend, required, help, error: errorProp, className, children, id: idProp, ...rest },
  ref,
) {
  const form = useContext(FormValidationContext);
  const id = useId(idProp, "group");
  const error = errorProp || form?.errors[id] || undefined;
  const live = form !== null;
  const wrapped = legend !== undefined && (required || help !== undefined || Boolean(error) || live);
  const helpText = error ?? help;
  const helpId = wrapped ? `${id}-help` : undefined;
  const cls = cx(base, className);
  const legendEl = legend !== undefined && <legend className="t-label-1">{legend}{required && <em>*</em>}</legend>;
  const group = legend !== undefined ? (
    <fieldset
      ref={ref as React.Ref<HTMLFieldSetElement>}
      id={id}
      className={cls}
      data-ds-field={wrapped && live ? "" : undefined}
      data-ds-choice={wrapped && live ? "" : undefined}
      data-ds-group={wrapped && live ? "" : undefined}
      data-ds-required={required ? "" : undefined}
      aria-invalid={error ? true : undefined}
      aria-describedby={helpId}
      onChange={(e: FormEvent<HTMLFieldSetElement>) => { if (required) form?.touch(e.currentTarget); }}
      {...rest}
    >
      {legendEl}
      {children}
    </fieldset>
  ) : (
    <div ref={ref as React.Ref<HTMLDivElement>} id={idProp} className={cls} {...rest}>{children}</div>
  );
  if (!wrapped) return group;
  return (
    <div className={cx("field", { error: Boolean(error) })}>
      {group}
      <span className="help" id={helpId} aria-live={live ? "polite" : undefined}>{helpText}</span>
    </div>
  );
});
