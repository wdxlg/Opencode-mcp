// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.workerMain.js
// Original module marker: src/vs/base/common/assert.ts
import { BugIndicatingError, onUnexpectedError } from "./module-0007.mjs";


// src/vs/base/common/assert.ts
function assertFn(condition) {
  if (!condition()) {
    debugger;
    condition();
    onUnexpectedError(new BugIndicatingError("Assertion Failed"));
  }
}
export { assertFn };
