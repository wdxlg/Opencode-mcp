// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/languages/nullTokenize.ts
import { EncodedTokenizationResult } from "./module-0164.mjs";


// src/vs/editor/common/languages/nullTokenize.ts
var NullState = new class {
  clone() {
    return this;
  }
  equals(other) {
    return this === other;
  }
}();

function nullTokenizeEncoded(languageId, state) {
  const tokens = new Uint32Array(2);
  tokens[0] = 0;
  tokens[1] = (languageId << 0 /* LANGUAGEID_OFFSET */ | 0 /* Other */ << 8 /* TOKEN_TYPE_OFFSET */ | 0 /* None */ << 11 /* FONT_STYLE_OFFSET */ | 1 /* DefaultForeground */ << 15 /* FOREGROUND_OFFSET */ | 2 /* DefaultBackground */ << 24 /* BACKGROUND_OFFSET */) >>> 0;
  return new EncodedTokenizationResult(tokens, [], state === null ? NullState : state);
}
export { nullTokenizeEncoded, NullState };
