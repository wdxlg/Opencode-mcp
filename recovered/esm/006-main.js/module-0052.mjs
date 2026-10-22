// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/decorators.ts
import { __esm } from "./module-0000.mjs";
import { init_cancelPreviousCalls } from "./module-0051.mjs";


// src/vs/base/common/decorators.ts
function memoize(_target, key, descriptor) {
  let fnKey = null;
  let fn = null;
  if (typeof descriptor.value === "function") {
    fnKey = "value";
    fn = descriptor.value;
    if (fn.length !== 0) {
      console.warn("Memoize should only be used in functions with zero parameters");
    }
  } else if (typeof descriptor.get === "function") {
    fnKey = "get";
    fn = descriptor.get;
  }
  if (!fn) {
    throw new Error("not supported");
  }
  const memoizeKey = `$memoize$${key}`;
  descriptor[fnKey] = function(...args2) {
    if (!this.hasOwnProperty(memoizeKey)) {
      Object.defineProperty(this, memoizeKey, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: fn.apply(this, args2)
      });
    }
    return this[memoizeKey];
  };
}

var init_decorators = __esm({
  "src/vs/base/common/decorators.ts"() {
    init_cancelPreviousCalls();
  }
});
export { memoize, init_decorators };
