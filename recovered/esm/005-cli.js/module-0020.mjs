// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/base/common/cache.ts
import { __esm } from "./module-0000.mjs";
import { init_cancellation } from "./module-0018.mjs";


// src/vs/base/common/cache.ts
function identity(t) {
  return t;
}

var LRUCachedFunction;

var init_cache = __esm({
  "src/vs/base/common/cache.ts"() {
    init_cancellation();
    LRUCachedFunction = class {
      constructor(arg1, arg2) {
        this.lastCache = void 0;
        this.lastArgKey = void 0;
        if (typeof arg1 === "function") {
          this._fn = arg1;
          this._computeKey = identity;
        } else {
          this._fn = arg2;
          this._computeKey = arg1.getCacheKey;
        }
      }
      get(arg) {
        const key = this._computeKey(arg);
        if (this.lastArgKey !== key) {
          this.lastArgKey = key;
          this.lastCache = this._fn(arg);
        }
        return this.lastCache;
      }
    };
  }
});
export { identity, LRUCachedFunction, init_cache };
