// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/profiling/electron-browser/profileAnalysisWorkerMain.js
// Original module marker: src/vs/platform/log/common/log.ts
import { createDecorator } from "./module-0023.mjs";
import { RawContextKey } from "./module-0036.mjs";


// src/vs/platform/log/common/log.ts
var ILogService = createDecorator("logService");

var ILoggerService = createDecorator("loggerService");

function LogLevelToString(logLevel) {
  switch (logLevel) {
    case 1 /* Trace */:
      return "trace";
    case 2 /* Debug */:
      return "debug";
    case 3 /* Info */:
      return "info";
    case 4 /* Warning */:
      return "warn";
    case 5 /* Error */:
      return "error";
    case 0 /* Off */:
      return "off";
  }
}

var CONTEXT_LOG_LEVEL = new RawContextKey("logLevel", LogLevelToString(3 /* Info */));
export { LogLevelToString, ILogService, ILoggerService, CONTEXT_LOG_LEVEL };
