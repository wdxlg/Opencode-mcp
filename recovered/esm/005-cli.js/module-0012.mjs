// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/base/common/types.ts
import { __esm } from "./module-0000.mjs";
import { init_assert } from "./module-0011.mjs";


// src/vs/base/common/types.ts
function isNumber(obj) {
  return typeof obj === "number" && !isNaN(obj);
}

function isIterable(obj) {
  return !!obj && typeof obj[Symbol.iterator] === "function";
}

var init_types = __esm({
  "src/vs/base/common/types.ts"() {
    init_assert();
  }
});
export { isNumber, isIterable, init_types };
