import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";

export interface SettingsSectionProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 섹션 제목 (.section-head) */
  title?: ReactNode;
}
/** 설정 카드: 제목 + Setting 행들 */
export const SettingsSection = forwardRef<HTMLDivElement, SettingsSectionProps>(function SettingsSection({ title, className, children, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("settings-section", className)} {...rest}>
      {title !== undefined && <div className="section-head">{title}</div>}
      {children}
    </div>
  );
});

export interface SettingProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  /** 오른쪽 컨트롤 (Switch · Dropdown · Slider …) */
  children?: ReactNode;
}
/** '라벨+설명 | 컨트롤' 한 행 */
export const Setting = forwardRef<HTMLDivElement, SettingProps>(function Setting({ title, description, className, children, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("setting", className)} {...rest}>
      <div className="info">
        <b>{title}</b>
        {description !== undefined && <span>{description}</span>}
      </div>
      <div className="ctrl">{children}</div>
    </div>
  );
});
