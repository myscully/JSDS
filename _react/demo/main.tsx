/* 데모: examples/ 전체를 페이지별로 렌더. 사이트 예제와 나란히 비교(visual-compare.mjs)하는 데도 쓴다 */
import { StrictMode, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import "../dist/style.css";
import { Button, SelectButton, ToastProvider, applyAccent, setTheme, getTheme, type Theme } from "@jiran/ds-react";

const modules = import.meta.glob("../examples/**/*.tsx", { eager: true }) as Record<string, { default: ComponentType }>;
const sources = import.meta.glob("../examples/**/*.tsx", { eager: true, query: "?raw", import: "default" }) as Record<string, string>;
// 사이트 예제의 layout 힌트 (components.data.js 의 layout 값과 동기) — 프리뷰 배치용
const LAYOUT: Record<string, string> = {
  "components/button/group": "stack", "components/text-field/size": "top", "components/search/filters": "left", "components/switch/settings": "left",
  "components/date-picker/field": "top", "components/date-picker/calendar": "tall top", "components/dropdown/select": "tall top", "components/dropdown/menu": "tall",
  "components/navigation/basic": "left", "components/navigation/collapsed": "left", "components/notification/notice": "stack", "components/notification/banner": "stack",
  "components/loading/skeleton": "white", "patterns/search/toolbar": "stack", "patterns/system-status/overview": "stack", "patterns/dashboard/full": "stack",
  "patterns/log-viewer/viewer": "stack", "patterns/policy-settings/sections": "stack", "patterns/severity/scale": "left",
};
const PRODUCTS = [["#0B4171", "예시 · 네이비"], ["#FF7F00", "Brand"], ["#2563EB", "제품 A"], ["#0F766E", "제품 B"], ["#7C3AED", "제품 C"]];

const keys = Object.keys(modules).map((f) => f.replace(/^\.\.\/examples\//, "").replace(/\.tsx$/, "")).sort();
const byPage = new Map<string, string[]>();
for (const k of keys) { const page = k.split("/").slice(0, 2).join("/"); byPage.set(page, [...(byPage.get(page) ?? []), k]); }

function App() {
  const theme = getTheme();
  return (
    <>
      <div className="demo-bar">
        <h1>@jiran/ds-react demo · {keys.length} examples</h1>
        <SelectButton label="Accent" defaultValue={PRODUCTS[0][0]} options={PRODUCTS.map(([hex, name]) => ({ value: hex, label: name }))} onChange={(hex) => applyAccent(hex)} />
        <Button size="sm" variant="secondary" onClick={() => { const next: Theme = theme === "dark" ? "light" : "dark"; setTheme(next); location.reload(); }}>테마 전환</Button>
      </div>
      <div className="demo-page">
        {[...byPage.entries()].map(([page, list]) => (
          <section key={page}>
            <h2 className="demo-sec" id={page}>{page}</h2>
            {list.map((k) => {
              const file = `../examples/${k}.tsx`; const Ex = modules[file].default;
              return (
                <div className="demo-ex" key={k} id={k}>
                  <div className="demo-title">{k} · {sources[file].split("\n").length} lines</div>
                  <div className={`example-preview ${LAYOUT[k] ?? ""}`}><Ex /></div>
                </div>
              );
            })}
          </section>
        ))}
      </div>
    </>
  );
}

applyAccent(PRODUCTS[0][0]);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
