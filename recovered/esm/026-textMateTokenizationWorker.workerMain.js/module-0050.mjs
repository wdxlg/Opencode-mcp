// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.workerMain.js
// Original module marker: src/vs/base/common/observableInternal/index.ts
import { _setDebugGetObservableGraph } from "./module-0037.mjs";
import { debugGetObservableGraph } from "./module-0049.mjs";
import { addLogger, setLogObservableFn } from "./module-0034.mjs";
import { ConsoleObservableLogger, logObservableToConsole } from "./module-0044.mjs";
import { env } from "./module-0003.mjs";
import { DevToolsLogger } from "./module-0048.mjs";


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
