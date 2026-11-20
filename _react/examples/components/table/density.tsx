import { useState } from "react";
import { SelectButton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, type TableDensity } from "@jiran/ds-react";

const ROWS = [
  ["영업팀", "312", "8", "2026. 09. 06"],
  ["개발팀", "184", "11", "2026. 09. 06"],
  ["인프라팀", "48", "14", "2026. 09. 02"],
];
const DENSITY = [
  { value: "compact", label: "좁게" },
  { value: "default", label: "기본" },
  { value: "relaxed", label: "넓게" },
] as const;

/* 고른 밀도를 기억하는 것은 제품 몫 */
export default function Example() {
  const [density, setDensity] = useState<TableDensity>("default");
  return (
    <div className="stack">
      <div className="toolbar">
        <span className="spacer" />
        <SelectButton outline size="sm" label="행 밀도" options={[...DENSITY]} value={density} onChange={setDensity} />
      </div>
      <Table density={density}>
        <TableHead>
          <TableRow><TableHeader>그룹</TableHeader><TableHeader num>에이전트</TableHeader><TableHeader num>정책</TableHeader><TableHeader>최근 배포</TableHeader></TableRow>
        </TableHead>
        <TableBody>
          {ROWS.map(([g, a, p, d]) => (
            <TableRow key={g}><TableCell>{g}</TableCell><TableCell num>{a}</TableCell><TableCell num>{p}</TableCell><TableCell>{d}</TableCell></TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
