// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/common/remoteConsoleUtil.ts
import { parse9 } from "./module-1054.mjs";


// src/vs/workbench/services/extensions/common/remoteConsoleUtil.ts
function logRemoteEntry(logService, entry, label3 = null) {
  const args2 = parse9(entry).args;
  let firstArg = args2.shift();
  if (typeof firstArg !== "string") {
    return;
  }
  if (!entry.severity) {
    entry.severity = "info";
  }
  if (label3) {
    if (!/^\[/.test(label3)) {
      label3 = `[${label3}]`;
    }
    if (!/ $/.test(label3)) {
      label3 = `${label3} `;
    }
    firstArg = label3 + firstArg;
  }
  switch (entry.severity) {
    case "log":
    case "info":
      logService.info(firstArg, ...args2);
      break;
    case "warn":
      logService.warn(firstArg, ...args2);
      break;
    case "error":
      logService.error(firstArg, ...args2);
      break;
  }
}

function logRemoteEntryIfError(logService, entry, label3) {
  const args2 = parse9(entry).args;
  const firstArg = args2.shift();
  if (typeof firstArg !== "string" || entry.severity !== "error") {
    return;
  }
  if (!/^\[/.test(label3)) {
    label3 = `[${label3}]`;
  }
  if (!/ $/.test(label3)) {
    label3 = `${label3} `;
  }
  logService.error(label3 + firstArg, ...args2);
}
export { logRemoteEntry, logRemoteEntryIfError };
