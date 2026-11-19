import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// 1) 스타일은 앱 진입점에서 한 번
import "@jiran/ds-react/style.css";
// 2) 화면 폭에 따라 루트 글자 크기를 바꾸는 단계(선택). html 에 걸리므로 제품이 정합니다
import "@jiran/ds-react/scale.css";
import { ToastProvider, applyProductColor } from "@jiran/ds-react";
import App from "./App";

// 3) 제품 색 — blue · red · cyan · navy · orange · neutral · ai 중 하나
applyProductColor("blue");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* 4) Toast 를 쓰려면 앱 루트에 한 번 */}
    <ToastProvider>
      {/* 5) .ds-root 가 Pretendard · 본문 색 · 배경을 줍니다(빼면 브라우저 기본 서체) */}
      <div className="ds-root" style={{ minHeight: "100vh" }}>
        <App />
      </div>
    </ToastProvider>
  </StrictMode>,
);
