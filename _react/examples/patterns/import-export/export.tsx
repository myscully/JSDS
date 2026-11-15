import { Button, Checkbox, DateRangePicker, PopupActions, PopupForm, PopupSurface, PopupTitle, Radio, RadioGroup, TimePicker } from "@jiran/ds-react";

const day = (n: number) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - n); return d; };
const PRESETS = [7, 30].map((n) => ({ label: `최근 ${n}일`, range: (): [Date, Date] => [day(n - 1), day(0)] }));

/* 내보내기 — 형식과 기간을 고른다. 개인정보 열은 기본으로 빼고, 긴 기간은 예약 시각에 보낸다 */
export default function Example() {
  const close = () => {};
  return (
    <PopupSurface onClose={close}>
      <PopupTitle>로그 내보내기</PopupTitle>
      <PopupForm>
        <RadioGroup legend="형식" name="exp-fmt" defaultValue="csv">
          <Radio value="csv">CSV</Radio>
          <Radio value="json">JSON</Radio>
        </RadioGroup>
        <DateRangePicker id="exp-range" label="기간" max={day(0)} presets={PRESETS} defaultValue={{ start: new Date(2026, 10, 8), end: new Date(2026, 10, 14) }} />
        <Checkbox description="개인정보가 들어갑니다. 내보낸 기록은 감사 로그에 남습니다">사용자 이름과 이메일 포함</Checkbox>
        <TimePicker id="exp-time" label="예약 시각" defaultValue="02:00" help="30일이 넘는 기간은 이 시각에 보냅니다." />
      </PopupForm>
      <PopupActions>
        <Button variant="outline" color="assistive" onClick={close}>취소</Button>
        <Button>내보내기</Button>
      </PopupActions>
    </PopupSurface>
  );
}
