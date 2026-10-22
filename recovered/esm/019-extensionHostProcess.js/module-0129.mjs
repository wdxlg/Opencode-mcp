// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/common/observableInternal/index.ts
import { _setDebugGetObservableGraph } from "./module-0110.mjs";
import { debugGetObservableGraph } from "./module-0128.mjs";
import { addLogger, setLogObservableFn } from "./module-0107.mjs";
import { ConsoleObservableLogger, logObservableToConsole } from "./module-0123.mjs";
import { env } from "./module-0015.mjs";
import { DevToolsLogger } from "./module-0127.mjs";


// src/vs/base/common/observableInternal/index.ts
_setDebugGetObservableGraph(debugGetObservableGraph);

setLogObservableFn(logObservableToConsole);

var enableLogging = false;

if (enableLogging) {
  addLogger(new ConsoleObservableLogger());
}

if (env && env["VSCODE_DEV_DEBUG_OBSERVABLES"]) {
  addLogger(DevToolsLogger.getInstance());
}
export { enableLogging };
