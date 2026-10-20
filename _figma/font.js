/* Figma 폰트 안전 로더 — use_figma / 플러그인 스크립트에 그대로 붙여 쓴다.
 *
 * 왜 있나: 이 파일의 텍스트는 Pretendard 로 쓰여 있는데, Pretendard 가 깔리지 않은
 * 환경에서는 `node.characters = …` 가 아니라 **그 전에** 터진다 —
 *   Error: The font "Pretendard Bold" could not be loaded. The font family "Pretendard" does not exist.
 * 한 번 터지면 스크립트가 중간에 멈춰 파일이 반쯤 고쳐진 상태로 남는다. 그 사고를 막는다.
 *
 * 규칙 세 가지
 *   1. 텍스트를 만들거나 characters·fontName 을 건드리기 전에 반드시 await 로 폰트를 올린다.
 *   2. family 는 공백·하이픈 없이 정확히, style 은 그 패밀리가 실제로 가진 이름으로 쓴다.
 *      — 같은 '반볼드'가 Pretendard 는 "SemiBold", Inter 는 "Semi Bold" 다. 짐작하면 틀린다.
 *   3. 없으면 대체한다. 다만 **한글이 들어간 글에 Inter 를 쓰지 않는다** — Inter 에는 한글 글리프가
 *      없어 글자가 깨진다. 그래서 기본 대체 사슬은 Pretendard → Noto Sans KR → Inter 다.
 *
 * 쓰는 법
 *   const F = makeFont();                      // 스크립트 맨 위에서 한 번
 *   await F.preload(["Regular", "Medium", "Bold"]);
 *   const t = await F.createText("정책 저장", "Bold", { fontSize: 16 });
 *   await F.setText(existingNode, "바뀐 글", "Regular");
 *   return { fontReport: F.report() };         // 무엇으로 대체됐는지 호출자에게 알린다
 */

function makeFont(options) {
  const opt = options || {};
  /* 대체 사슬 — 앞에서부터 찾는다. 한글 때문에 Inter 는 맨 뒤다. */
  const CHAIN = opt.chain || ["Pretendard", "Noto Sans KR", "Inter"];

  /* 굵기 하나를 여러 이름으로 부른다. 패밀리마다 철자가 달라 후보를 순서대로 본다. */
  const STYLES = {
    Thin: ["Thin", "ExtraLight", "Extra Light", "Light", "Regular"],
    Light: ["Light", "ExtraLight", "Extra Light", "Regular"],
    Regular: ["Regular", "Normal", "Book", "Medium"],
    Medium: ["Medium", "Regular", "SemiBold", "Semi Bold"],
    SemiBold: ["SemiBold", "Semi Bold", "DemiBold", "Demi Bold", "Bold", "Medium"],
    Bold: ["Bold", "SemiBold", "Semi Bold", "Black", "Medium"],
    Black: ["Black", "ExtraBold", "Extra Bold", "Bold"],
  };

  let available = null;          // Map<family, Set<style>>
  const loaded = new Set();      // "family|style"
  const substitutions = [];      // 무엇을 무엇으로 바꿨는지
  const resolved = new Map();    // "family|style" → fontName

  async function index() {
    if (available) return available;
    available = new Map();
    for (const f of await figma.listAvailableFontsAsync()) {
      const fam = f.fontName.family;
      if (!available.has(fam)) available.set(fam, new Set());
      available.get(fam).add(f.fontName.style);
    }
    return available;
  }

  /* 요청한 family/style 에 가장 가까우면서 **실제로 있는** 폰트를 고르고 올린다. */
  async function resolve(style, family) {
    const wantFam = family || CHAIN[0];
    const wantStyle = style || "Regular";
    const key = wantFam + "|" + wantStyle;
    if (resolved.has(key)) return resolved.get(key);

    const idx = await index();
    const fams = [wantFam].concat(CHAIN.filter((f) => f !== wantFam));
    const styles = STYLES[wantStyle] || [wantStyle, "Regular"];

    for (const fam of fams) {
      const have = idx.get(fam);
      if (!have) continue;
      for (const st of styles) {
        if (!have.has(st)) continue;
        const fontName = { family: fam, style: st };
        const lk = fam + "|" + st;
        if (!loaded.has(lk)) {
          /* 목록에 있어도 로드는 따로 실패할 수 있다(권한·네트워크) — 그때도 멈추지 않는다 */
          try {
            await figma.loadFontAsync(fontName);
            loaded.add(lk);
          } catch (e) {
            continue;
          }
        }
        if (fam !== wantFam || st !== wantStyle) {
          substitutions.push(wantFam + " " + wantStyle + " → " + fam + " " + st);
        }
        resolved.set(key, fontName);
        return fontName;
      }
    }
    throw new Error("쓸 수 있는 폰트가 없다: " + wantFam + " " + wantStyle + " (사슬: " + CHAIN.join(" → ") + ")");
  }

  /* 쓸 굵기를 미리 전부 올려 둔다 — 중간에 한 번도 멈추지 않게 */
  async function preload(styles, family) {
    const list = styles && styles.length ? styles : ["Regular", "Medium", "Bold"];
    const out = {};
    for (const s of list) out[s] = await resolve(s, family);
    return out;
  }

  async function createText(chars, style, props) {
    const fontName = await resolve(style, props && props.family);
    const t = figma.createText();
    t.fontName = fontName;
    t.characters = chars == null ? "" : String(chars);
    if (props) for (const [k, v] of Object.entries(props)) { if (k !== "family") t[k] = v; }
    return t;
  }

  /* 이미 있는 노드를 고칠 때 쓴다. 지금 폰트가 없는 폰트여도(= Pretendard 미설치)
     올려 둔 폰트를 **먼저 지정하면** characters 를 쓸 수 있다. 섞인 서식(figma.mixed)은
     노드 전체가 한 서식으로 눌리므로 보고에 남긴다. */
  async function setText(node, chars, style, family) {
    if (!node || node.type !== "TEXT") throw new Error("TEXT 노드가 아니다: " + (node && node.type));
    const fontName = await resolve(style, family);
    const was = node.fontName;
    if (was === figma.mixed) substitutions.push("서식 섞인 노드를 한 서식으로 평탄화: " + node.id);
    node.fontName = fontName;
    if (chars != null) node.characters = String(chars);
    return fontName;
  }

  function report() {
    const uniq = [...new Set(substitutions)];
    return {
      chain: CHAIN,
      loaded: [...loaded],
      substituted: uniq,
      ok: uniq.length === 0,
    };
  }

  return { resolve, preload, createText, setText, report };
}

if (typeof module !== "undefined" && module.exports) module.exports = { makeFont };
