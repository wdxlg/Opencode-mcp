// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/telemetry/electron-browser/telemetryService.ts
import { Disposable } from "./module-0012.mjs";
import { NullTelemetryService, getPiiPathsFromEnvironment, isInternalTelemetry, supportsTelemetry } from "./module-0885.mjs";
import { TelemetryAppenderClient } from "./module-3852.mjs";
import { resolveWorkbenchCommonProperties } from "./module-3853.mjs";
import { process2 } from "./module-3724.mjs";
import { experimentsEnabled } from "./module-1221.mjs";
import { TelemetryService } from "./module-3854.mjs";
import { IRequestService, NO_FETCH_TELEMETRY } from "./module-0946.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3727.mjs";
import { IProductService } from "./module-0873.mjs";
import { ISharedProcessService } from "./module-3729.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/services/telemetry/electron-browser/telemetryService.ts
var TelemetryService2 = class extends Disposable {
  get sessionId() {
    return this.impl.sessionId;
  }
  get machineId() {
    return this.impl.machineId;
  }
  get sqmId() {
    return this.impl.sqmId;
  }
  get devDeviceId() {
    return this.impl.devDeviceId;
  }
  get firstSessionDate() {
    return this.impl.firstSessionDate;
  }
  get msftInternal() {
    return this.impl.msftInternal;
  }
  constructor(environmentService, productService, sharedProcessService, storageService, configurationService, requestService) {
    super();
    if (supportsTelemetry(productService, environmentService)) {
      const isInternal = isInternalTelemetry(productService, configurationService);
      const channel = sharedProcessService.getChannel("telemetryAppender");
      const config = {
        appenders: [new TelemetryAppenderClient(channel)],
        commonProperties: resolveWorkbenchCommonProperties(
          storageService,
          productService,
          environmentService,
          environmentService.os.release,
          environmentService.os.hostname,
          environmentService.machineId,
          environmentService.sqmId,
          environmentService.devDeviceId,
          isInternal,
          process2
        ),
        piiPaths: getPiiPathsFromEnvironment(environmentService),
        sendErrorTelemetry: true,
        waitForExperimentProperties: experimentsEnabled(configurationService, productService, environmentService)
      };
      this.impl = this._register(new TelemetryService(config, configurationService, productService));
    } else {
      this.impl = NullTelemetryService;
    }
    this.sendErrorTelemetry = this.impl.sendErrorTelemetry;
    this._register(requestService.onDidCompleteRequest((e) => {
      if (e.callSite === NO_FETCH_TELEMETRY || productService.quality === "stable") {
        return;
      }
      this.publicLog2("fetchCall", {
        callSite: e.callSite,
        latency: e.latency,
        statusCode: e.statusCode
      });
    }));
  }
  setExperimentProperty(name, value2) {
    return this.impl.setExperimentProperty(name, value2);
  }
  setCommonProperty(name, value2) {
    this.impl.setCommonProperty(name, value2);
  }
  get telemetryLevel() {
    return this.impl.telemetryLevel;
  }
  publicLog(eventName, data) {
    this.impl.publicLog(eventName, data);
  }
  publicLog2(eventName, data) {
    this.publicLog(eventName, data);
  }
  publicLogError(errorEventName, data) {
    this.impl.publicLogError(errorEventName, data);
  }
  publicLogError2(eventName, data) {
    this.publicLogError(eventName, data);
  }
};

TelemetryService2 = __decorateClass([
  __decorateParam(0, INativeWorkbenchEnvironmentService),
  __decorateParam(1, IProductService),
  __decorateParam(2, ISharedProcessService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IRequestService)
], TelemetryService2);

registerSingleton(ITelemetryService, TelemetryService2, 1 /* Delayed */);
export { TelemetryService2 };
