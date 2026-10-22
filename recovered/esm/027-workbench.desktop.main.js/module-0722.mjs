// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/dataChannel/browser/forwardingTelemetryService.ts
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IDataChannelService } from "./module-0708.mjs";


// src/vs/platform/dataChannel/browser/forwardingTelemetryService.ts
var InterceptingTelemetryService = class {
  constructor(_baseService, _intercept) {
    this._baseService = _baseService;
    this._intercept = _intercept;
  }
  get telemetryLevel() {
    return this._baseService.telemetryLevel;
  }
  get sessionId() {
    return this._baseService.sessionId;
  }
  get machineId() {
    return this._baseService.machineId;
  }
  get sqmId() {
    return this._baseService.sqmId;
  }
  get devDeviceId() {
    return this._baseService.devDeviceId;
  }
  get firstSessionDate() {
    return this._baseService.firstSessionDate;
  }
  get msftInternal() {
    return this._baseService.msftInternal;
  }
  get sendErrorTelemetry() {
    return this._baseService.sendErrorTelemetry;
  }
  publicLog(eventName, data) {
    this._intercept(eventName, data);
    this._baseService.publicLog(eventName, data);
  }
  publicLog2(eventName, data) {
    this._intercept(eventName, data);
    this._baseService.publicLog2(eventName, data);
  }
  publicLogError(errorEventName, data) {
    this._intercept(errorEventName, data);
    this._baseService.publicLogError(errorEventName, data);
  }
  publicLogError2(eventName, data) {
    this._intercept(eventName, data);
    this._baseService.publicLogError2(eventName, data);
  }
  setExperimentProperty(name, value2) {
    this._baseService.setExperimentProperty(name, value2);
  }
  setCommonProperty(name, value2) {
    this._baseService.setCommonProperty(name, value2);
  }
};

var DataChannelForwardingTelemetryService = class extends InterceptingTelemetryService {
  constructor(telemetryService, dataChannelService) {
    super(telemetryService, (eventName, data) => {
      let forward = true;
      if (data && shouldForwardToChannel in data) {
        forward = Boolean(data[shouldForwardToChannel]);
      }
      if (forward) {
        dataChannelService.getDataChannel("editTelemetry").sendData({ eventName, data: data ?? {} });
      }
    });
  }
};

DataChannelForwardingTelemetryService = __decorateClass([
  __decorateParam(0, ITelemetryService),
  __decorateParam(1, IDataChannelService)
], DataChannelForwardingTelemetryService);

var shouldForwardToChannel = /* @__PURE__ */ Symbol("shouldForwardToChannel");

function forwardToChannelIf(value2) {
  return {
    // This will not be sent via telemetry, it is just a marker
    [shouldForwardToChannel]: value2
  };
}

function isCopilotLikeExtension(extensionId) {
  if (!extensionId) {
    return false;
  }
  const extIdLowerCase = extensionId.toLowerCase();
  return extIdLowerCase === "github.copilot" || extIdLowerCase === "github.copilot-chat";
}
export { forwardToChannelIf, isCopilotLikeExtension, InterceptingTelemetryService, DataChannelForwardingTelemetryService, shouldForwardToChannel };
