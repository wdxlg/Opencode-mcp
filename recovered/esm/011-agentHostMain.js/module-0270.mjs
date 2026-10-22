// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/telemetry/common/telemetryLogAppender.ts
import { Disposable } from "./module-0010.mjs";
import { TelemetryLogGroup, isLoggingOnly, telemetryLogId, validateTelemetryData } from "./module-0247.mjs";
import { localize } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILoggerService } from "./module-0084.mjs";
import { IEnvironmentService } from "./module-0129.mjs";
import { IProductService } from "./module-0173.mjs";


// src/vs/platform/telemetry/common/telemetryLogAppender.ts
var TelemetryLogAppender = class extends Disposable {
  constructor(prefix, remote, loggerService, environmentService, productService) {
    super();
    this.prefix = prefix;
    const id2 = remote ? "remoteTelemetry" : telemetryLogId;
    const logger = loggerService.getLogger(id2);
    if (logger) {
      this.logger = this._register(logger);
    } else {
      const justLoggingAndNotSending = isLoggingOnly(productService, environmentService);
      const logSuffix = justLoggingAndNotSending ? " (Not Sent)" : "";
      this.logger = this._register(loggerService.createLogger(
        id2,
        {
          name: localize(3243, null, logSuffix),
          group: TelemetryLogGroup,
          hidden: true
        }
      ));
    }
  }
  flush() {
    return Promise.resolve();
  }
  log(eventName, data) {
    this.logger.trace(`${this.prefix}telemetry/${eventName}`, validateTelemetryData(data));
  }
};

TelemetryLogAppender = __decorateClass([
  __decorateParam(2, ILoggerService),
  __decorateParam(3, IEnvironmentService),
  __decorateParam(4, IProductService)
], TelemetryLogAppender);
export { TelemetryLogAppender };
