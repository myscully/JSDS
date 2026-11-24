import { Button, Card, CardHead, CardMeta, CardTitle, Icon } from "@jiran/ds-react";

/* 두 칸 키-값 — 라벨 위 · 값 아래, 긴 값은 두 칸 */
export default function Example() {
  return (
    <Card style={{ width: "min(560px, 100%)" }}>
      <CardHead>
        <CardTitle>개인 정보</CardTitle>
        <Button variant="outline" color="assistive" size="sm" iconLeft={<Icon name="edit" size={16} />} aria-label="개인 정보 편집">편집</Button>
      </CardHead>
      <CardMeta columns items={[
        { label: "이름", value: "김민준" },
        { label: "직함", value: "보안 관리자" },
        { label: "이메일", value: "minjun.kim@example.com" },
        { label: "휴대전화", value: "010-1234-5678" },
        { label: "소개", value: "엔드포인트 보안 정책과 에이전트 배포를 맡고 있습니다.", wide: true },
      ]} />
    </Card>
  );
}
