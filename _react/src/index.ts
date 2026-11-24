/* @jiran/ds-react — 지란지교시큐리티 Design System React 컴포넌트
   CSS: import "@jiran/ds-react/style.css"(+ 선택: "@jiran/ds-react/scale.css" 화면 폭 단계)  ·  테마: <html data-theme="dark">  ·  제품 컬러: applyProductColor("red") (팔레트 밖 색은 applyAccent("#1D4ED8")) */

export * from "./types";
export { cx } from "./utils/cx";
export { useControllable } from "./utils/useControllable";
export { useId } from "./utils/useId";
export { Portal, type PortalProps } from "./utils/Portal";
export { useOutsideClick, useEscape, useFocusTrap, mergeRefs } from "./utils/hooks";
export { accentScale, applyAccent, applyProductColor, PRODUCT_COLORS, isLightAccent, setTheme, getTheme, checkRootFontSize, ROOT_FONT_MIN, type AccentScale, type ProductColor, type ProductColorKey, type Theme } from "./theme";
export { LABELS, type LabelKey } from "./labels";

export { Icon, type IconProps } from "./icons/Icon";
export { ICONS, ICON_NAMES, type IconName } from "./icons/icons.data";

// A. primitives
export { Button, ButtonGroup, type ButtonProps, type ButtonGroupProps, type ButtonVariant, type ButtonColor } from "./components/button/Button";
export { Tag, type TagProps, type TagVariant } from "./components/tag/Tag";
export { TagGroup, type TagGroupProps } from "./components/tag/Tag";
export { Indicator, Count, WithCount, type IndicatorProps, type CountProps, type WithCountProps } from "./components/indicator/Indicator";
export { Steps, Stepper, StepButton, type StepsProps, type StepsLayout, type StepperProps, type StepperStep, type StepButtonProps, type StepTrigger } from "./components/steps/Steps";
export { Divider, type DividerProps } from "./components/divider/Divider";
export { Avatar, AvatarGroup, type AvatarProps, type AvatarGroupProps } from "./components/avatar/Avatar";

// B. form controls
export { Field, TextField, TextArea, type FieldProps, type FieldOwnProps, type TextFieldProps, type TextAreaProps } from "./components/text-field/TextField";
export { CodeInput, type CodeInputProps, type CodeInputChangeInfo } from "./components/text-field/CodeInput";
export { VALIDATION_MESSAGES, type ValidationMessages, type FormValidationResult } from "./components/text-field/validation";
export { Checkbox, CheckboxGroup, type CheckboxProps, type CheckboxGroupProps } from "./components/checkbox/Checkbox";
export { Radio, RadioGroup, type RadioProps, type RadioGroupProps } from "./components/radio-button/Radio";
export { Switch, type SwitchProps } from "./components/switch/Switch";
export { Slider, type SliderProps } from "./components/slider/Slider";
export { Chip, ChipGroup, type ChipProps, type ChipGroupProps } from "./components/chip/Chip";
export { SelectButton, type SelectButtonProps, type SelectButtonOption } from "./components/select-button/SelectButton";
export { SearchBar, type SearchBarProps } from "./components/search/SearchBar";

// C. navigation
export { Tabs, TabList, Tab, TabPanel, type TabsProps, type TabListProps, type TabProps, type TabPanelProps } from "./components/tab/Tabs";
export { Breadcrumb, BreadcrumbHome, BreadcrumbItem, BreadcrumbMore, type BreadcrumbProps, type BreadcrumbHomeProps, type BreadcrumbItemProps, type BreadcrumbMoreProps } from "./components/breadcrumb/Breadcrumb";
export { Pagination, PaginationBar, CursorPagination, PAGE_SIZES, paginate, type CursorPaginationProps, type PaginationProps, type PaginationBarProps, type PageItem } from "./components/pagination/Pagination";
export { SideNav, SideNavGroup, SideNavItem, type SideNavProps, type SideNavGroupProps, type SideNavItemProps } from "./components/navigation/SideNav";
export { SkipLink, type SkipLinkProps } from "./components/navigation/SideNav";
export { useSideNavCollapse, SIDENAV_NARROW_QUERY, type UseSideNavCollapseOptions } from "./components/navigation/useSideNavCollapse";
export { Link, type LinkProps } from "./components/link/Link";
export { NumberInput, type NumberInputProps } from "./components/number-input/NumberInput";
export { CodeBlock, InlineCode, type CodeBlockProps } from "./components/code/Code";
export { CopyField, type CopyFieldProps } from "./components/copy-field/CopyField";
export { FileUpload, type FileUploadProps, type UploadItem, type UploadAdded, type UploadStatus } from "./components/file-upload/FileUpload";
export { TopBar, TopBarLogo, TopBarNav, TopBarNavItem, TopBarRight, TopBarStart, TopBarNavToggle, TopBarThemeToggle, type TopBarProps, type TopBarLogoProps, type TopBarNavProps, type TopBarNavItemProps, type TopBarRightProps, type TopBarStartProps, type TopBarNavToggleProps, type TopBarThemeToggleProps } from "./components/top-navigation/TopBar";

// D. overlays & behavior
export { Combobox, type ComboboxProps } from "./components/combobox/Combobox";
export { SidePanel, SidePanelSurface, type SidePanelProps, type SidePanelSurfaceProps } from "./components/side-panel/SidePanel";
export { Dropdown, DropdownTrigger, Menu, MenuItem, MenuSep, MenuLabel, MenuState, MenuActionArea, MenuCheckboxItem, MenuGroup, MenuRadioGroup, MenuRadioItem, Select, type DropdownProps, type DropdownTriggerProps, type MenuProps, type MenuItemProps, type MenuActionAreaProps, type MenuCheckboxItemProps, type MenuGroupProps, type MenuRadioGroupProps, type MenuRadioItemProps, type SelectProps, type SelectMultipleProps, type SelectOption } from "./components/dropdown/Dropdown";
export { Tooltip, type TooltipProps } from "./components/tooltip/Tooltip";
export { Popup, PopupSurface, PopupTitle, PopupBody, PopupActions, PopupForm, type PopupProps, type PopupSurfaceProps } from "./components/popup/Popup";
export { Notice, Toast, ToastStack, Banner, ToastProvider, useToast, type NoticeProps, type ToastProps, type ToastStackProps, type BannerProps, type ToastProviderProps, type ToastOptions } from "./components/notification/Notification";
export { Calendar, DatePicker, DateRangePicker, formatDate, formatMonth, parseDate, parseMonth, parseYear, type CalendarProps, type CalendarView, type DateChangeInfo, type DatePickerFooterItem, type DatePickerLabels, type DatePickerMessages, type DatePickerMode, type DatePickerProps, type DateRange, type DateRangePickerProps, type DateRangeValue, type DateUnit, type DateSideValidity, type DateValidity, type DateValue } from "./components/date-picker/DatePicker";
export { TimePicker, checkTime, TIME_MESSAGES, TIME_LABELS, type TimePickerProps, type TimeChangeInfo, type TimeValidity, type TimePickerMessages, type TimePickerLabels } from "./components/time-picker/TimePicker";
export { Tree, TREE_LABELS, type TreeProps, type TreeNode, type TreeLabels } from "./components/tree/Tree";
export { NotificationCenter, NOTIFY_LABELS, type NotificationCenterProps, type NotificationItem, type NotificationSeverity, type NotifyLabels } from "./components/notification-center/NotificationCenter";

// E. containers & data
export { Accordion, AccordionGroup, type AccordionProps, type AccordionGroupProps, type AccordionVariant } from "./components/accordion/Accordion";
export { Card, CardHead, CardTitle, CardDesc, CardMeta, CardFoot, CardGrid, type CardProps, type CardTitleProps, type CardMetaProps, type CardMetaItem } from "./components/card/Card";
export { List, ListItem, type ListProps, type ListItemProps } from "./components/list/List";
export { Tile, TileGrid, type TileProps } from "./components/item-tile/Tile";
export { Table, TableHead, TableBody, TableFoot, TableRow, TableHeader, TableCell, type TableProps, type TableDensity, type TableRowStyle, type TableRowProps, type TableHeaderProps, type TableCellProps } from "./components/table/Table";
export { DataTable, ActionBar, type DataTableProps, type DataTableColumn, type SortState, type ActionBarProps } from "./components/data-table/DataTable";
export { useFormDraft, type FormDraftOptions, type DraftLabels } from "./utils/draft";
export { Spinner, Skeleton, SkeletonRow, Progress, useLoadingDelay, LOADING_DELAY, LOADING_MIN, type SpinnerProps, type SkeletonProps, type SkeletonRowProps, type ProgressProps } from "./components/loading/Loading";

// F. data visual
export { Kpi, KpiGrid, ChartCard, BarChart, Donut, DonutRow, ChartLegend, Sparkline, ProgressList, Delta, type KpiProps, type ChartCardProps, type ChartFigure, type ProgressListProps, type ProgressListItem, type DeltaProps, type DeltaTone, type ChartColorMode, type BarChartProps, type BarChartRow, type DonutProps, type DonutSegment, type ChartLegendProps, type ChartLegendItem, type SparklineProps } from "./components/data-visual/DataVisual";

// patterns (thin wrappers)
export { SettingsSection, Setting, type SettingsSectionProps, type SettingProps } from "./patterns/Settings";
export { Stack, Row2, Row3, Toolbar, Spacer, PageHead, Form, FormLegend, type FormProps, ErrorSummary, type ErrorSummaryProps, FormSection, FormRow, FormActions, Empty, Notes, StatusList, StatusItem, SevBand, SevCell, Onboard, Terms, TermsAll, TermsItem, TermsMessage, type PageHeadProps, type EmptyProps, type NotesProps, type StatusItemProps, type SevBandProps, type SevCellProps, type TermsItemProps } from "./patterns/Patterns";
