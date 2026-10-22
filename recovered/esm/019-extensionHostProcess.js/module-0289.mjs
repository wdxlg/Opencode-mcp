// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostApiDeprecationService.ts
import { createDecorator2 } from "./module-0048.mjs";
import { MainContext } from "./module-0054.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0069.mjs";
import { ILogService } from "./module-0062.mjs";


// src/vs/workbench/api/common/extHostApiDeprecationService.ts
var IExtHostApiDeprecationService = createDecorator2("IExtHostApiDeprecationService");

var ExtHostApiDeprecationService = class {
  constructor(rpc, _extHostLogService) {
    this._extHostLogService = _extHostLogService;
    this._reportedUsages = /* @__PURE__ */ new Set();
    this._telemetryShape = rpc.getProxy(MainContext.MainThreadTelemetry);
  }
  report(apiId, extension, migrationSuggestion, options2) {
    const key = this.getUsageKey(apiId, extension, options2?.usageId);
    if (this._reportedUsages.has(key)) {
      return;
    }
    this._reportedUsages.add(key);
    if (extension.isUnderDevelopment) {
      this._extHostLogService.warn(`[Deprecation Warning] '${apiId}' is deprecated. ${migrationSuggestion}`);
    }
    this._telemetryShape.$publicLog2("extHostDeprecatedApiUsage", {
      extensionId: extension.identifier.value,
      apiId,
      usageId: options2?.usageId ?? ""
    });
  }
  getUsageKey(apiId, extension, usageId) {
    const rootKey = `${apiId}-${extension.identifier.value}`;
    return usageId ? `${rootKey}-${usageId}` : rootKey;
  }
};

ExtHostApiDeprecationService = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, ILogService)
], ExtHostApiDeprecationService);

var NullApiDeprecationService = Object.freeze(new class {
  report(_apiId, _extension, _warningMessage) {
  }
}());
export { IExtHostApiDeprecationService, ExtHostApiDeprecationService, NullApiDeprecationService };
