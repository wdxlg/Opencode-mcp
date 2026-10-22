// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/codiconsUtil.ts
import { init_types, isString } from "./module-0016.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/base/common/codiconsUtil.ts
function register(id2, fontCharacter) {
  if (isString(fontCharacter)) {
    const val = _codiconFontCharacters[fontCharacter];
    if (val === void 0) {
      throw new Error(`${id2} references an unknown codicon: ${fontCharacter}`);
    }
    fontCharacter = val;
  }
  _codiconFontCharacters[id2] = fontCharacter;
  return { id: id2 };
}

var _codiconFontCharacters;

var init_codiconsUtil = __esm({
  "src/vs/base/common/codiconsUtil.ts"() {
    init_types();
    _codiconFontCharacters = /* @__PURE__ */ Object.create(null);
  }
});
export { register, _codiconFontCharacters, init_codiconsUtil };
