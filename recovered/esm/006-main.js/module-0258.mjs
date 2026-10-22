// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/jsonErrorMessages.ts
import { init_nls, localize } from "./module-0005.mjs";
import { __esm } from "./module-0000.mjs";
import { init_json } from "./module-0120.mjs";


// src/vs/base/common/jsonErrorMessages.ts
function getParseErrorMessage(errorCode) {
  switch (errorCode) {
    case 1 /* InvalidSymbol */:
      return localize(123, null);
    case 2 /* InvalidNumberFormat */:
      return localize(122, null);
    case 3 /* PropertyNameExpected */:
      return localize(124, null);
    case 4 /* ValueExpected */:
      return localize(125, null);
    case 5 /* ColonExpected */:
      return localize(119, null);
    case 6 /* CommaExpected */:
      return localize(120, null);
    case 7 /* CloseBraceExpected */:
      return localize(117, null);
    case 8 /* CloseBracketExpected */:
      return localize(118, null);
    case 9 /* EndOfFileExpected */:
      return localize(121, null);
    default:
      return "";
  }
}

var init_jsonErrorMessages = __esm({
  "src/vs/base/common/jsonErrorMessages.ts"() {
    init_nls();
    init_json();
  }
});
export { getParseErrorMessage, init_jsonErrorMessages };
