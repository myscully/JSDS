/* @jiran/ds-react — 지란지교시큐리티 Design System React 컴포넌트
   CSS: import "@jiran/ds-react/style.css"  ·  테마: <html data-theme="dark">  ·  제품 컬러: applyAccent("#2563EB") */

export * from "./types";
export { cx } from "./utils/cx";
export { useControllable } from "./utils/useControllable";
export { useId } from "./utils/useId";
export { Portal, type PortalProps } from "./utils/Portal";
export { useOutsideClick, useEscape, useFocusTrap, mergeRefs } from "./utils/hooks";
export { accentScale, applyAccent, setTheme, getTheme, type AccentScale, type Theme } from "./theme";
export { LABELS, type LabelKey } from "./labels";

export { Icon, type IconProps } from "./icons/Icon";
export { ICONS, ICON_NAMES, type IconName } from "./icons/icons.data";

// A. primitives
export { Button, ButtonGroup, type ButtonProps, type ButtonGroupProps, type ButtonVariant } from "./components/button/Button";
export { Tag, type TagProps, type TagVariant } from "./components/tag/Tag";
export { Indicator, Count, WithCount, Steps, type IndicatorProps, type CountProps, type WithCountProps, type StepsProps } from "./components/indicator/Indicator";
export { Divider, type DividerProps } from "./components/divider/Divider";
export { Avatar, type AvatarProps } from "./components/avatar/Avatar";

// B. form controls
export { Field, TextField, TextArea, type FieldProps, type FieldOwnProps, type TextFieldProps, type TextAreaProps } from "./components/text-field/TextField";
export { Checkbox, CheckboxGroup, type CheckboxProps, type CheckboxGroupProps } from "./components/checkbox/Checkbox";
export { Radio, RadioGroup, type RadioProps, type RadioGroupProps } from "./components/radio-button/Radio";
export { Switch, type SwitchProps } from "./components/switch/Switch";
export { Slider, type SliderProps } from "./components/slider/Slider";
export { Chip, ChipGroup, type ChipProps, type ChipGroupProps } from "./components/chip/Chip";
export { SelectButton, type SelectButtonProps, type SelectButtonOption } from "./components/select-button/SelectButton";
export { SearchBar, type SearchBarProps } from "./components/search/SearchBar";

// C. navigation
export { Tabs, TabList, Tab, TabPanel, type TabsProps, type TabListProps, type TabProps, type TabPanelProps } from "./components/tab/Tabs";
export { Breadcrumb, BreadcrumbItem, BreadcrumbMore, type BreadcrumbProps, type BreadcrumbItemProps, type BreadcrumbMoreProps } from "./components/breadcrumb/Breadcrumb";
export { Pagination, PaginationBar, paginate, type PaginationProps, type PaginationBarProps, type PageItem } from "./components/pagination/Pagination";
export { SideNav, SideNavGroup, SideNavItem, type SideNavProps, type SideNavGroupProps, type SideNavItemProps } from "./components/navigation/SideNav";
export { TopBar, TopBarLogo, TopBarNav, TopBarNavItem, TopBarRight, type TopBarProps, type TopBarLogoProps, type TopBarNavProps, type TopBarNavItemProps, type TopBarRightProps } from "./components/top-navigation/TopBar";

// D. overlays & behavior
export { Dropdown, DropdownTrigger, Menu, MenuItem, MenuSep, MenuLabel, Select, type DropdownProps, type DropdownTriggerProps, type MenuProps, type MenuItemProps, type SelectProps, type SelectOption } from "./components/dropdown/Dropdown";
export { Tooltip, type TooltipProps } from "./components/tooltip/Tooltip";
export { Popup, PopupSurface, PopupTitle, PopupBody, PopupActions, PopupForm, type PopupProps, type PopupSurfaceProps } from "./components/popup/Popup";
export { Notice, Toast, ToastStack, Banner, ToastProvider, useToast, type NoticeProps, type ToastProps, type ToastStackProps, type BannerProps, type ToastProviderProps, type ToastOptions } from "./components/notification/Notification";
export { Calendar, DatePicker, formatDate, type CalendarProps, type DatePickerProps, type DateRange } from "./components/date-picker/DatePicker";

// E. containers & data
export { Accordion, AccordionGroup, type AccordionProps, type AccordionGroupProps } from "./components/accordion/Accordion";
export { Card, CardHead, CardTitle, CardDesc, CardFoot, CardGrid, type CardProps, type CardTitleProps } from "./components/card/Card";
export { List, ListItem, type ListProps, type ListItemProps } from "./components/list/List";
export { Tile, TileGrid, type TileProps } from "./components/item-tile/Tile";
export { Table, TableHead, TableBody, TableRow, TableHeader, TableCell, type TableProps, type TableRowProps, type TableHeaderProps, type TableCellProps } from "./components/table/Table";
export { DataTable, ActionBar, type DataTableProps, type DataTableColumn, type SortState, type ActionBarProps } from "./components/data-table/DataTable";
export { Spinner, Skeleton, SkeletonRow, Progress, type SpinnerProps, type SkeletonProps, type SkeletonRowProps, type ProgressProps } from "./components/loading/Loading";

// F. data visual
export { Kpi, KpiGrid, ChartCard, BarChart, Donut, DonutRow, ChartLegend, Sparkline, type KpiProps, type ChartCardProps, type BarChartProps, type BarChartRow, type DonutProps, type DonutSegment, type ChartLegendProps, type ChartLegendItem, type SparklineProps } from "./components/data-visual/DataVisual";

// patterns (thin wrappers)
export { SettingsSection, Setting, type SettingsSectionProps, type SettingProps } from "./patterns/Settings";
export { Stack, Row2, Row3, Toolbar, Spacer, PageHead, Form, FormSection, FormRow, FormActions, Empty, Notes, StatusList, StatusItem, SevBand, SevCell, Onboard, Terms, TermsAll, TermsItem, type PageHeadProps, type EmptyProps, type NotesProps, type StatusItemProps, type SevBandProps, type SevCellProps, type TermsItemProps } from "./patterns/Patterns";
