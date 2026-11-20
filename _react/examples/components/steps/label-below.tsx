import { Stepper } from "@jiran/ds-react";

const note = (t: string) => <p className="t-body-2-reading">{t}</p>;

export default function Example() {
  return (
    <Stepper labels={{ finish: "설정 마치기" }}
      layout="label-below"
      defaultCurrent={1}
      steps={[
        { label: "조직 정보", content: note("조직 이름과 관리자 연락처를 정합니다.") },
        { label: "보호 수준", content: note("기본 보호 수준을 고릅니다.") },
        { label: "에이전트 배포", content: note("설치 파일을 받아 단말에 설치합니다.") },
        { label: "알림 설정", content: note("위협을 알릴 채널을 고릅니다.") },
        { label: "검토", content: note("설정을 확인한 뒤 설정 마치기를 누릅니다.") },
      ]}
    />
  );
}
