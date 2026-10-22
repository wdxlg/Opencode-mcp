// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadTelemetry.ts
import { Disposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { supportsTelemetry } from "./module-0885.mjs";
import { ITelemetryService, TELEMETRY_OLD_SETTING_ID, TELEMETRY_SETTING_ID } from "./module-0093.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IProductService } from "./module-0873.mjs";
import { isValidAssignmentContext } from "./module-1268.mjs";
import { CommandsRegistry } from "./module-0087.mjs";


// src/vs/workbench/api/browser/mainThreadTelemetry.ts
var MainThreadTelemetry = class extends Disposable {
  constructor(extHostContext, _telemetryService, _configurationService, _environmentService, _productService) {
    super();
    this._telemetryService = _telemetryService;
    this._configurationService = _configurationService;
    this._environmentService = _environmentService;
    this._productService = _productService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostTelemetry);
    if (supportsTelemetry(this._productService, this._environmentService)) {
      this._register(this._configurationService.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(TELEMETRY_SETTING_ID) || e.affectsConfiguration(TELEMETRY_OLD_SETTING_ID)) {
          this._proxy.$onDidChangeTelemetryLevel(this.telemetryLevel);
        }
      }));
    }
    this._proxy.$initializeTelemetryLevel(this.telemetryLevel, supportsTelemetry(this._productService, this._environmentService), this._productService.enabledTelemetryLevels);
  }
  get telemetryLevel() {
    if (!supportsTelemetry(this._productService, this._environmentService)) {
      return 0 /* NONE */;
    }
    return this._telemetryService.telemetryLevel;
  }
  $publicLog(eventName, data = /* @__PURE__ */ Object.create(null)) {
    data[MainThreadTelemetry._name] = true;
    this._telemetryService.publicLog(eventName, data);
  }
  $publicLog2(eventName, data) {
    this.$publicLog(eventName, data);
  }
};

MainThreadTelemetry._name = "pluginHostTelemetry";

MainThreadTelemetry = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadTelemetry),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IEnvironmentService),
  __decorateParam(4, IProductService)
], MainThreadTelemetry);

var CAPI_ASSIGNMENT_CONTEXT_PROPERTY = "capi.assignmentcontext";

var SET_CAPI_ASSIGNMENT_CONTEXT_COMMAND = "_telemetry.setCapiAssignmentContext";

function isValidCapiAssignmentContext(value2) {
  return isValidAssignmentContext(value2);
}

CommandsRegistry.registerCommand(SET_CAPI_ASSIGNMENT_CONTEXT_COMMAND, function(accessor, value2) {
  if (typeof value2 !== "string" || !isValidCapiAssignmentContext(value2)) {
    return;
  }
  accessor.get(ITelemetryService).setExperimentProperty(CAPI_ASSIGNMENT_CONTEXT_PROPERTY, value2);
});
export { isValidCapiAssignmentContext, MainThreadTelemetry, CAPI_ASSIGNMENT_CONTEXT_PROPERTY, SET_CAPI_ASSIGNMENT_CONTEXT_COMMAND };
