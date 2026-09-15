import { forwardRef, type SVGAttributes } from "react";
import { ICONS, type IconName } from "./icons.data";

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, "name" | "children"> {
  /** assets/icons/{outline|filled}/{name}.svg 의 이름 */
  name: IconName;
  /** px. 기본 18 (버튼·입력). 표 16, 배지 14, 알림 20, 빈 화면 24 */
  size?: number;
  /** filled 버전이 있으면 사용 (없으면 outline) */
  filled?: boolean;
  /** 있으면 role="img" + aria-label, 없으면 aria-hidden (장식) */
  label?: string;
}

/**
 * Tabler 아이콘 인라인 SVG. 사이트 빌드의 I(name,size) 와 같은 마크업을 낸다.
 * 색은 currentColor — 부모 텍스트 색을 상속한다.
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon({ name, size = 18, filled, label, ...rest }, ref) {
  const ic = ICONS[name];
  const useFilled = Boolean(filled && ic.f);
  const shape = useFilled
    ? { fill: "currentColor" }
    : { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true as const };
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      {...shape}
      {...a11y}
      {...rest}
      dangerouslySetInnerHTML={{ __html: useFilled ? (ic.f as string) : ic.o }}
    />
  );
});
