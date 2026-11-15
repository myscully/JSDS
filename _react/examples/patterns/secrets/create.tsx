import { Button, DatePicker, Form, FormLegend, PopupActions, PopupSurface, PopupTitle, Radio, RadioGroup, TextField } from "@jiran/ds-react";

/* 만료가 없는 키는 만들 수 없게 기본값을 둔다 — 최대 1년. 범위는 읽기 전용을 미리 골라 둔다 */
export default function Example() {
  return (
    <PopupSurface onClose={() => {}}>
      <PopupTitle>API 키 만들기</PopupTitle>
      <Form id="sec-create-form" className="popup-body" validate onSubmit={(e) => e.preventDefault()}>
        <FormLegend />
        <TextField id="sec-name" label="키 이름" required placeholder="연동할 서비스 이름" help="목록에서 알아볼 이름입니다." />
        <DatePicker label="만료일" defaultValue={new Date(2027, 1, 15)} help="최대 1년까지 정할 수 있습니다." />
        <RadioGroup legend="범위" name="sec-scope" defaultValue="read">
          <Radio value="read">읽기 전용</Radio>
          <Radio value="write">읽기와 쓰기</Radio>
        </RadioGroup>
      </Form>
      <PopupActions>
        <Button variant="outline" color="assistive">취소</Button>
        <Button type="submit" form="sec-create-form">만들기</Button>
      </PopupActions>
    </PopupSurface>
  );
}
