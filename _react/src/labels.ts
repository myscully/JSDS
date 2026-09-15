/** 컴포넌트가 기본으로 쓰는 한국어 문구. 각 컴포넌트 prop 으로 개별 덮어쓰기 가능 */
export const LABELS = {
  prev: "이전",
  next: "다음",
  prevMonth: "이전 달",
  nextMonth: "다음 달",
  close: "닫기",
  remove: "삭제",
  clear: "지우기",
  search: "검색",
  loading: "불러오는 중",
  pagination: "페이지",
  breadcrumb: "현재 위치",
  mainMenu: "주 메뉴",
  selectAll: "전체 선택",
  select: "선택",
  datePlaceholder: "날짜 선택",
  dateDialog: "날짜 선택",
  today: "오늘",
  apply: "적용",
  more: "더 보기",
  undo: "실행 취소",
} as const;
export type LabelKey = keyof typeof LABELS;
