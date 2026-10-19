/* 참조 시스템(Montage · wanteddev/montage-web)의 토큰 정의를 코드로 옮겨 둔 것.
   출처: packages/theme 의 atomic 램프 파일 전부 · semantic/index.ts · opacity/index.ts.
   이 파일의 목적은 **대조**다 — style.src.css 가 참조 시스템과 한 글자라도 달라지면 verify 가 실패시킨다.
   "값까지 동일하게 교체"가 이번 설계의 정의이므로, 이것이 틀리면 다른 검사가 다 통과해도 틀린 것이다.
   참조 시스템을 새 버전으로 올릴 때는 여기만 고치고 빌드를 돌리면 어긋난 자리가 전부 나온다. */

const AT = {
  common: { 0: "#000000", 100: "#FFFFFF" },
  coolNeutral: { 5:"#0F0F10",7:"#141415",10:"#171719",15:"#1B1C1E",17:"#212225",20:"#292A2D",22:"#2E2F33",23:"#333438",25:"#37383C",30:"#46474C",40:"#5A5C63",50:"#70737C",60:"#878A93",70:"#989BA2",80:"#AEB0B6",90:"#C2C4C8",95:"#DBDCDF",96:"#E1E2E4",97:"#EAEBEC",98:"#F4F4F5",99:"#F7F7F8" },
  neutral: { 5:"#0F0F0F",10:"#171717",15:"#1C1C1C",20:"#2A2A2A",22:"#303030",30:"#474747",40:"#5C5C5C",50:"#737373",60:"#8A8A8A",70:"#9B9B9B",80:"#B0B0B0",90:"#C4C4C4",95:"#DCDCDC",99:"#F7F7F7" },
  blue: { 10:"#001536",20:"#002966",30:"#003E9C",40:"#0054D1",45:"#005EEB",50:"#0066FF",55:"#1A75FF",60:"#3385FF",65:"#4F95FF",70:"#69A5FF",80:"#9EC5FF",90:"#C9DEFE",95:"#EAF2FE",99:"#F7FBFF" },
  green: { 10:"#00240C",20:"#004517",30:"#006E25",40:"#009632",50:"#00BF40",60:"#1ED45A",70:"#49E57D",80:"#7DF5A5",90:"#ACFCC7",95:"#D9FFE6",99:"#F2FFF6" },
  orange: { 10:"#361E00",20:"#663A00",30:"#9C5800",39:"#D17600",40:"#D47800",50:"#FF9200",60:"#FFA938",70:"#FFC06E",80:"#FFD49C",90:"#FEE6C6",95:"#FEF4E6",99:"#FFFCF7" },
  red: { 10:"#3B0101",20:"#730303",30:"#B00C0C",40:"#E52222",50:"#FF4242",60:"#FF6363",70:"#FF8C8C",80:"#FFB5B5",90:"#FED5D5",95:"#FEECEC",99:"#FFFAFA" },
  lime: { 10:"#112900",20:"#225200",30:"#347D00",37:"#429E00",40:"#48AD00",50:"#58CF04",60:"#6BE016",70:"#88F03E",80:"#AEF779",90:"#CCFCA9",95:"#E6FFD4",99:"#F8FFF2" },
  cyan: { 10:"#00252B",20:"#004854",30:"#006F82",40:"#0098B2",50:"#00BDDE",60:"#28D0ED",70:"#57DFF7",80:"#8AEDFF",90:"#B5F4FF",95:"#DEFAFF",99:"#F7FEFF" },
  lightBlue: { 10:"#002130",20:"#004261",30:"#006796",40:"#008DCF",50:"#00AEFF",60:"#3DC2FF",70:"#70D2FF",80:"#A1E1FF",90:"#C4ECFE",95:"#E5F6FE",99:"#F7FDFF" },
  violet: { 10:"#11024D",20:"#23098F",30:"#3A16C9",40:"#4F29E5",45:"#5B37ED",50:"#6541F2",60:"#7D5EF7",70:"#9E86FC",80:"#C0B0FF",90:"#DBD3FE",95:"#F0ECFE",99:"#FBFAFF" },
  purple: { 10:"#290247",20:"#580A7D",30:"#861CB8",40:"#AD36E3",50:"#CB59FF",60:"#D478FF",70:"#DE96FF",80:"#E9BAFF",90:"#F2D6FF",95:"#F9EDFF",99:"#FEFBFF" },
  pink: { 10:"#3D0133",20:"#730560",30:"#A81690",40:"#D331B8",46:"#E846CD",50:"#F553DA",60:"#FA73E3",70:"#FF94ED",80:"#FFB8F3",90:"#FED3F7",95:"#FEECFB",99:"#FFFAFE" },
  redOrange: { 10:"#290F00",20:"#592100",30:"#913500",40:"#C94A00",48:"#F55A00",50:"#FF5E00",60:"#FF7B2E",70:"#FF9B61",80:"#FFBD96",90:"#FED9C4",95:"#FEEEE5",99:"#FFFAF7" },
};
const OP = { 5:0.05, 8:0.08, 12:0.12, 16:0.16, 22:0.22, 28:0.28, 43:0.43, 52:0.52, 61:0.61, 74:0.74, 88:0.88 };
/* Montage 의 addHexOpacity 와 같은 계산 — 8자리 HEX */
const a = (hex, o) => hex.slice(0, 7) + Math.round(o * 255).toString(16).padStart(2, "0").toUpperCase();
const kebab = (s) => s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
const ACCENTS = ["lime", "cyan", "lightBlue", "violet", "purple", "pink"];
/* brand 는 제품이 주입하는 슬롯이라 값이 아니라 참조다 — 기본값일 때 blue 와 같아지는지는 램프 대조가 본다 */
const BR = (n) => `var(--brand-${n})`;
const mix = (n, o) => `color-mix(in srgb,var(--brand-${n}) ${Math.round(o * 100)}%,transparent)`;

function semantic(theme) {
  const L = theme === "light";
  const cn = (n) => AT.coolNeutral[n];
  const base = L ? 50 : 60;
  const accFg = L ? { lime: 37, cyan: 40, lightBlue: 40, violet: 45, purple: 40, pink: 46 }
                  : { lime: 50, cyan: 50, lightBlue: 50, violet: 70, purple: 60, pink: 60 };
  const accSurf = L ? 50 : 60;
  const o = {};
  o["foreground-neutral-primary"] = L ? cn(10) : cn(99);
  o["foreground-neutral-strong"] = L ? AT.common[0] : AT.common[100];
  o["foreground-neutral-secondary"] = L ? a(cn(22), OP[88]) : a(cn(90), OP[88]);
  o["foreground-neutral-tertiary"] = L ? a(cn(25), OP[61]) : a(cn(80), OP[61]);
  o["foreground-neutral-quaternary"] = L ? a(cn(25), OP[28]) : a(cn(80), OP[28]);
  o["foreground-neutral-inverse"] = L ? cn(99) : cn(10);
  o["foreground-brand-primary"] = BR(L ? 50 : 60);
  o["foreground-brand-inverse"] = BR(L ? 60 : 50);
  o["foreground-positive-primary"] = AT.green[base];
  o["foreground-cautionary-primary"] = AT.orange[base];
  o["foreground-negative-primary"] = AT.red[base];
  o["foreground-negative-strong"] = L ? AT.red[40] : AT.red[60];
  o["foreground-disable-primary"] = L ? a(cn(25), OP[16]) : a(cn(70), OP[16]);
  o["foreground-inactive-primary"] = L ? cn(70) : cn(40);
  for (const f of ACCENTS) o[`foreground-accent-${kebab(f)}`] = AT[f][accFg[f]];
  o["background-neutral-primary"] = L ? AT.common[100] : cn(15);
  o["background-neutral-secondary"] = L ? cn(99) : cn(5);
  o["surface-neutral-primary"] = L ? AT.common[100] : cn(15);
  o["surface-neutral-secondary"] = L ? a(cn(50), OP[8]) : a(cn(50), OP[22]);
  o["surface-neutral-tertiary"] = L ? a(cn(50), OP[5]) : a(cn(50), OP[12]);
  o["surface-neutral-strong"] = L ? a(cn(50), OP[16]) : a(cn(50), OP[28]);
  o["surface-neutral-inverse"] = L ? cn(15) : AT.common[100];
  o["surface-elevated-primary"] = L ? AT.common[100] : cn(17);
  o["surface-elevated-secondary"] = L ? cn(99) : cn(7);
  o["surface-brand-primary"] = BR(L ? 50 : 60);
  o["surface-brand-strong"] = BR(L ? 45 : 55);
  o["surface-brand-heavy"] = BR(L ? 40 : 50);
  o["surface-brand-subtle"] = mix(L ? 50 : 60, OP[5]);
  o["surface-positive-primary"] = a(AT.green[base], OP[8]);
  o["surface-cautionary-primary"] = a(AT.orange[base], OP[8]);
  o["surface-negative-primary"] = a(AT.red[base], OP[8]);
  o["surface-negative-strong"] = L ? a(AT.red[50], OP[12]) : a(AT.red[60], OP[22]);
  o["surface-disable-primary"] = L ? cn(98) : cn(22);
  for (const f of ACCENTS) {
    o[`surface-accent-${kebab(f)}`] = a(AT[f][accSurf], OP[8]);
    o[`surface-accent-${kebab(f)}-opaque`] = AT[f][accSurf];
  }
  o["line-neutral-primary"] = L ? a(cn(50), OP[22]) : a(cn(50), 0.32);
  o["line-neutral-primary-opaque"] = L ? cn(96) : cn(25);
  o["line-neutral-secondary"] = L ? a(cn(50), OP[16]) : a(cn(50), OP[28]);
  o["line-neutral-secondary-opaque"] = L ? cn(97) : cn(23);
  o["line-neutral-tertiary"] = L ? a(cn(50), OP[8]) : a(cn(50), OP[22]);
  o["line-neutral-tertiary-opaque"] = L ? cn(98) : cn(22);
  o["line-brand-primary"] = mix(L ? 50 : 60, OP[28]);
  o["line-brand-strong"] = mix(L ? 50 : 60, OP[43]);
  o["line-brand-focus"] = mix(L ? 50 : 60, OP[12]);
  o["line-positive-primary"] = a(AT.green[base], OP[43]);
  o["line-cautionary-primary"] = a(AT.orange[base], OP[43]);
  o["line-negative-primary"] = a(AT.red[base], OP[43]);
  o["line-negative-strong"] = a(AT.red[base], OP[52]);
  o["line-negative-focus"] = a(AT.red[base], OP[12]);
  for (const f of ACCENTS) o[`line-accent-${kebab(f)}`] = a(AT[f][accFg[f]], OP[43]);
  o["effect-dimmer-primary"] = L ? a(cn(10), OP[52]) : a(cn(10), OP[74]);
  o["effect-transparent-primary"] = L ? a(AT.common[100], OP[8]) : a(cn(17), OP[61]);
  o["effect-transparent-secondary"] = L ? a(AT.common[100], OP[28]) : a(cn(17), OP[61]);
  o["static-white"] = AT.common[100];
  o["static-black"] = AT.common[0];
  return o;
}

/* 램프 — 이름은 kebab 으로 편다(coolNeutral → --cool-neutral-*) */
function ramps() {
  const out = {};
  for (const [fam, steps] of Object.entries(AT)) {
    if (fam === "common") continue;   /* --static-white/black 으로 들어간다 */
    for (const [n, hex] of Object.entries(steps)) out[`--${kebab(fam)}-${n}`] = hex;
  }
  return out;
}

/* style.css 와 대조한다. 반환은 어긋난 자리의 설명 목록 */
function diff(css) {
  const block = (sel) => {
    const i = css.indexOf(sel + "{");
    if (i < 0) return null;
    let d = 0, j = i + sel.length;
    for (; j < css.length; j++) { if (css[j] === "{") d++; else if (css[j] === "}") { d--; if (!d) break; } }
    const body = css.slice(i + sel.length + 1, j).replace(/\/\*[\s\S]*?\*\//g, "");
    const out = {};
    for (const m of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim();
    return out;
  };
  const bad = [];
  const light = block(":root"), dark = block(':root[data-theme="dark"]');
  if (!light || !dark) return ["토큰 블록을 찾지 못했다 — :root 또는 :root[data-theme=\"dark\"]"];
  for (const [theme, got] of [["light", light], ["dark", dark]]) {
    const want = semantic(theme);
    for (const [k, v] of Object.entries(want)) {
      const have = got["--" + k];
      if (have === undefined) { bad.push(`${theme} --${k} 선언 없음`); continue; }
      if (have !== v) bad.push(`${theme} --${k}: 참조 시스템은 ${v} 인데 ${have}`);
    }
  }
  for (const [k, v] of Object.entries(ramps())) if (light[k] !== v) bad.push(`램프 ${k}: 참조 시스템은 ${v} 인데 ${light[k]}`);
  return bad;
}

module.exports = { AT, OP, semantic, ramps, diff };
