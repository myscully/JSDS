import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useControllable } from "../../utils/useControllable";
import { Icon } from "../../icons/Icon";
import { ICONS, type IconName } from "../../icons/icons.data";

export interface TileProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  /** 아이콘 이름 또는 임의 노드 (36px 박스 안) */
  icon?: IconName | ReactNode;
  title: ReactNode;
  desc?: ReactNode;
  /** 우상단 태그 */
  tag?: ReactNode;
  /** 선택 상태. 지정하면 aria-pressed 토글 버튼이 된다 */
  selected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  horizontal?: boolean;
}

/** 아이콘 · 제목 · 설명으로 항목을 고르는 타일 (button) */
export const Tile = forwardRef<HTMLButtonElement, TileProps>(function Tile(
  { icon, title, desc, tag, selected, defaultSelected, onSelectedChange, horizontal, className, onClick, ...rest },
  ref,
) {
  const toggleable = selected !== undefined || defaultSelected !== undefined || onSelectedChange !== undefined;
  const [on, setOn] = useControllable<boolean>({ value: selected, defaultValue: defaultSelected ?? false, onChange: onSelectedChange });
  const ico = typeof icon === "string" && icon in ICONS ? <Icon name={icon as IconName} /> : icon;
  const text = (
    <>
      <b>{title}</b>
      {desc !== undefined && <span>{desc}</span>}
    </>
  );
  return (
    <button
      ref={ref}
      type="button"
      className={cx("tile", { horizontal, on: toggleable && on }, className)}
      aria-pressed={toggleable ? on : undefined}
      onClick={(e) => {
        onClick?.(e);
        if (toggleable && !e.defaultPrevented) setOn(!on);
      }}
      {...rest}
    >
      {tag}
      {ico !== undefined && <span className="ico">{ico}</span>}
      {horizontal ? <div>{text}</div> : text}
    </button>
  );
});

export const TileGrid = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function TileGrid({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("tile-grid", className)} {...rest} />;
});
