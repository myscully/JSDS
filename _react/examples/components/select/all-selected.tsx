import { Select } from "@jiran/ds-react";

const TEAMS = [["영업팀", "sales"], ["개발팀", "dev"], ["인프라팀", "infra"], ["보안팀", "security"], ["기획팀", "plan"], ["디자인팀", "design"]]
  .map(([label, value]) => ({ value, label }));

export default function Example() {
  return <Select multiple options={TEAMS} defaultValue={TEAMS.map((t) => t.value)} allSelectedLabel="전체 그룹" placeholder="그룹 선택" label="그룹" name="teams" keepMounted />;
}
