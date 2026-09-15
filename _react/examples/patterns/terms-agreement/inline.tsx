import { Accordion, Checkbox, Terms } from "@jiran/ds-react";

export default function Example() {
  return (
    <Terms>
      <Accordion
        style={{ maxWidth: 560 }}
        bodyStyle={{ maxHeight: 120, overflow: "auto" }}
        title={
          <Checkbox defaultChecked>
            서비스 이용약관 <span className="req">필수</span>
          </Checkbox>
        }
      >
        제1조(목적) 이 약관은 지란지교시큐리티가 제공하는 서비스의 이용 조건과 절차를 규정합니다. 제2조(정의) … 제3조(약관의 효력) …
      </Accordion>
    </Terms>
  );
}
