/* 복사 · 알림 영역 — ds.js 의 copyText · dsLive 와 같은 동작 */
export function ensureLive() {
  let l = document.querySelector<HTMLElement>("body > .ds-live");
  if (!l) {
    l = document.createElement("div");
    l.className = "sr-only ds-live";
    l.setAttribute("role", "status");
    document.body.appendChild(l);
  }
  return l;
}

/** 같은 문구도 다시 읽히게 비웠다가 넣는다 */
export function announce(msg: string) {
  const l = ensureLive();
  l.textContent = "";
  setTimeout(() => { l.textContent = msg; }, 50);
}

function legacy(text: string, near: HTMLElement) {
  const active = document.activeElement as HTMLElement | null, ta = document.createElement("textarea");
  let ok = false;
  ta.value = text;
  ta.readOnly = true;
  ta.tabIndex = -1;
  ta.className = "sr-only";
  ta.setAttribute("aria-hidden", "true");
  near.appendChild(ta);   // body 에 두면 바깥을 감지하는 팝오버가 닫힌다
  ta.focus({ preventScroll: true });
  ta.select();
  try { ok = document.execCommand("copy"); } catch { ok = false; }
  ta.remove();
  active?.focus?.();
  return ok;
}

export async function copyText(text: string, near: HTMLElement): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return legacy(text, near);
    }
  }
  return legacy(text, near);
}
