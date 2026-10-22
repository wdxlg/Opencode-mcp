// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/numbers.ts
import { __esm } from "./module-0000.mjs";
import { init_assert } from "./module-0015.mjs";


// src/vs/base/common/numbers.ts
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

var init_numbers = __esm({
  "src/vs/base/common/numbers.ts"() {
    init_assert();
  }
});
export { clamp, init_numbers };
