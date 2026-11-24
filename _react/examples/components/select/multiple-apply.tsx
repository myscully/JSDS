import { Select } from "@jiran/ds-react";
import { useState } from "react";

const TEAMS = [["영업팀", "sales"], ["개발팀", "dev"], ["인프라팀", "infra"], ["보안팀", "security"], ["기획팀", "plan"], ["디자인팀", "design"]]
  .map(([label, value]) => ({ value, label }));

export default function Example() {
  /* actions — 고르는 것은 초안이고 적용할 때만 onChange. 적용하지 않고 닫으면 열기 전으로 돌아간다 */
  const [teams, setTeams] = useState<string[]>(["dev", "infra"]);
  return <Select multiple actions options={TEAMS} value={teams} onChange={setTeams} placeholder="그룹 선택" label="그룹" name="teams" defaultOpen />;
}
