// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/base/common/assert.ts
import { BugIndicatingError, init_errors } from "./module-0006.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/base/common/assert.ts
function assert(condition, messageOrError = "unexpected state") {
  if (!condition) {
    const errorToThrow = typeof messageOrError === "string" ? new BugIndicatingError(`Assertion Failed: ${messageOrError}`) : messageOrError;
    throw errorToThrow;
  }
}

var init_assert = __esm({
  "src/vs/base/common/assert.ts"() {
    init_errors();
  }
});
export { assert, init_assert };
