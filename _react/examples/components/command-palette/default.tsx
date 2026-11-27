// ds:skeleton off — 사이트 예제는 정적으로 그린 팔레트를 버튼으로 열고, 여기서는 상태로 열고 닫는다
import { useState } from "react";
import { Button, CommandPalette, Icon, Kbd, ToastProvider, useToast, type CommandGroup } from "@jiran/ds-react";

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

function Demo() {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  return (
    <>
      <Button variant="outline" color="assistive" aria-keyshortcuts="Control+K Meta+K" onClick={() => setOpen(true)}>
        <Icon name="search" />명령 찾기<Kbd keys={["Mod", "K"]} size="sm" menu />
      </Button>
      {/* hotkey 는 화면에 하나만 켠다 — Mod K 로 열고 다시 누르면 닫는다 */}
      <CommandPalette
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        groups={GROUPS}
        onCommand={(value, item) => toast.show({ message: `명령을 골랐습니다: ${item.label}` })}
      />
    </>
  );
}

export default function Example() {
  return (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  );
}
