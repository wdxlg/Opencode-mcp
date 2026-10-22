// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/base.ts
import { onUnexpectedError } from "./module-0004.mjs";


// src/vs/base/common/observableInternal/base.ts
function handleBugIndicatingErrorRecovery(message) {
  const err = new Error("BugIndicatingErrorRecovery: " + message);
  onUnexpectedError(err);
  console.error("recovered from an error that indicates a bug", err);
}
export { handleBugIndicatingErrorRecovery };
