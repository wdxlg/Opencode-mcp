// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/base/common/observableInternal/index.ts
import { _setDebugGetObservableGraph } from "./module-0063.mjs";
import { debugGetObservableGraph } from "./module-0078.mjs";
import { addLogger, setLogObservableFn } from "./module-0060.mjs";
import { ConsoleObservableLogger, logObservableToConsole } from "./module-0073.mjs";
import { env } from "./module-0014.mjs";
import { DevToolsLogger } from "./module-0077.mjs";


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
