// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/common/codiconsUtil.ts
import { isString } from "./module-0009.mjs";


// src/vs/base/common/codiconsUtil.ts
var _codiconFontCharacters = /* @__PURE__ */ Object.create(null);

function register2(id2, fontCharacter) {
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

function getCodiconFontCharacters() {
  return _codiconFontCharacters;
}
export { register2, getCodiconFontCharacters, _codiconFontCharacters };
