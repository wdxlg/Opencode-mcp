// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/profiling/electron-browser/profileAnalysisWorkerMain.js
// Original module marker: src/vs/base/common/assert.ts
import { BugIndicatingError } from "./module-0006.mjs";


// src/vs/base/common/assert.ts
function assert(condition, messageOrError = "unexpected state") {
  if (!condition) {
    const errorToThrow = typeof messageOrError === "string" ? new BugIndicatingError(`Assertion Failed: ${messageOrError}`) : messageOrError;
    throw errorToThrow;
  }
}
export { assert };
