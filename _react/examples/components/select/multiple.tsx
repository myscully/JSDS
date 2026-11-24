import { Select } from "@jiran/ds-react";
import { useState } from "react";

const TEAMS = [["영업팀", "sales"], ["개발팀", "dev"], ["인프라팀", "infra"], ["보안팀", "security"], ["기획팀", "plan"], ["디자인팀", "design"]]
  .map(([label, value]) => ({ value, label }));

export default function Example() {
  const [teams, setTeams] = useState<string[]>(["sales", "security"]);
  return <Select multiple options={TEAMS} value={teams} onChange={setTeams} placeholder="그룹 선택" label="그룹" name="teams" defaultOpen />;
}
