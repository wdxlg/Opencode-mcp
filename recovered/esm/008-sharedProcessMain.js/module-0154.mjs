// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/telemetry/node/customEndpointTelemetryService.ts
import { Client } from "./module-0136.mjs";
import { FileAccess } from "./module-0025.mjs";
import { TelemetryAppenderClient } from "./module-0151.mjs";
import { TelemetryLogAppender } from "./module-0152.mjs";
import { TelemetryService } from "./module-0153.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0049.mjs";
import { ITelemetryService } from "./module-0085.mjs";
import { ILoggerService } from "./module-0044.mjs";
import { IEnvironmentService } from "./module-0047.mjs";
import { IProductService } from "./module-0045.mjs";


// src/vs/platform/telemetry/node/customEndpointTelemetryService.ts
var CustomEndpointTelemetryService = class {
  constructor(configurationService, telemetryService, loggerService, environmentService, productService) {
    this.configurationService = configurationService;
    this.telemetryService = telemetryService;
    this.loggerService = loggerService;
    this.environmentService = environmentService;
    this.productService = productService;
    this.customTelemetryServices = /* @__PURE__ */ new Map();
  }
  getCustomTelemetryService(endpoint) {
    if (!this.customTelemetryServices.has(endpoint.id)) {
      const telemetryInfo = /* @__PURE__ */ Object.create(null);
      telemetryInfo["common.vscodemachineid"] = this.telemetryService.machineId;
      telemetryInfo["common.vscodesessionid"] = this.telemetryService.sessionId;
      const args = [endpoint.id, JSON.stringify(telemetryInfo), endpoint.aiKey];
      const client = new Client(
        FileAccess.asFileUri("bootstrap-fork").fsPath,
        {
          serverName: "Debug Telemetry",
          timeout: 1e3 * 60 * 5,
          args,
          env: {
            ELECTRON_RUN_AS_NODE: 1,
            VSCODE_PIPE_LOGGING: "true",
            VSCODE_ESM_ENTRYPOINT: "vs/workbench/contrib/debug/node/telemetryApp"
          }
        }
      );
      const channel = client.getChannel("telemetryAppender");
      const appenders = [
        new TelemetryAppenderClient(channel),
        new TelemetryLogAppender(`[${endpoint.id}] `, false, this.loggerService, this.environmentService, this.productService)
      ];
      this.customTelemetryServices.set(endpoint.id, new TelemetryService({
        appenders,
        sendErrorTelemetry: endpoint.sendErrorTelemetry
      }, this.configurationService, this.productService));
    }
    return this.customTelemetryServices.get(endpoint.id);
  }
  publicLog(telemetryEndpoint, eventName, data) {
    const customTelemetryService = this.getCustomTelemetryService(telemetryEndpoint);
    customTelemetryService.publicLog(eventName, data);
  }
  publicLogError(telemetryEndpoint, errorEventName, data) {
    const customTelemetryService = this.getCustomTelemetryService(telemetryEndpoint);
    customTelemetryService.publicLogError(errorEventName, data);
  }
};

CustomEndpointTelemetryService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, ILoggerService),
  __decorateParam(3, IEnvironmentService),
  __decorateParam(4, IProductService)
], CustomEndpointTelemetryService);
export { CustomEndpointTelemetryService };
