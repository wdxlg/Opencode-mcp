// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/debugTelemetry.ts
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/debug/common/debugTelemetry.ts
var DebugTelemetry = class {
  constructor(model, telemetryService) {
    this.model = model;
    this.telemetryService = telemetryService;
  }
  logDebugSessionStart(dbgr, launchJsonExists) {
    const extension = dbgr.getMainExtensionDescriptor();
    this.telemetryService.publicLog("debugSessionStart", {
      type: dbgr.type,
      breakpointCount: this.model.getBreakpoints().length,
      exceptionBreakpoints: this.model.getExceptionBreakpoints(),
      watchExpressionsCount: this.model.getWatchExpressions().length,
      extensionName: extension.identifier.value,
      isBuiltin: extension.isBuiltin,
      launchJsonExists
    });
  }
  logDebugSessionStop(session, adapterExitEvent) {
    const breakpoints = this.model.getBreakpoints();
    this.telemetryService.publicLog("debugSessionStop", {
      type: session && session.configuration.type,
      success: adapterExitEvent.emittedStopped || breakpoints.length === 0,
      sessionLengthInSeconds: adapterExitEvent.sessionLengthInSeconds,
      breakpointCount: breakpoints.length,
      watchExpressionsCount: this.model.getWatchExpressions().length
    });
  }
};

DebugTelemetry = __decorateClass([
  __decorateParam(1, ITelemetryService)
], DebugTelemetry);
export { DebugTelemetry };
