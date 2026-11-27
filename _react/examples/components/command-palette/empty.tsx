import { CommandPaletteSurface, type CommandGroup } from "@jiran/ds-react";

const GROUPS: CommandGroup[] = [
  { label: "이동", items: [
    { icon: "layout-dashboard", label: "대시보드", keywords: "홈 요약 dashboard", value: "nav-dashboard" },
    { icon: "list-details", label: "탐지 로그", keywords: "이벤트 log", value: "nav-logs" },
    { icon: "shield", label: "정책", keywords: "policy 규칙", value: "nav-policies" },
    { icon: "device-desktop", label: "에이전트", keywords: "agent 단말 PC", value: "nav-agents" },
  ] },
  { label: "작업", items: [
    { icon: "plus", label: "정책 만들기", keywords: "새 정책 추가 create", value: "policy-new" },
    { icon: "file-export", label: "보고서 내보내기", keywords: "CSV 다운로드 report export", value: "report-export" },
    { icon: "search", label: "검색창으로 이동", keywords: "search 찾기", value: "focus-search", shortcut: ["/"] },
    { icon: "help-circle", label: "단축키 보기", keywords: "help 도움말 keyboard", value: "show-shortcuts", shortcut: ["?"] },
  ] },
];

/** 표면만 정적으로 — 처음 검색어 '백업' 은 맞는 명령이 없다 */
export default function Example() {
  return <CommandPaletteSurface groups={GROUPS} defaultQuery="백업" />;
}
