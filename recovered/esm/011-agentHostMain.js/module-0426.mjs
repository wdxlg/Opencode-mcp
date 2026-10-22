// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/log/node/loggerService.ts
import { AbstractLoggerService } from "./module-0084.mjs";
import { SpdLogLogger } from "./module-0425.mjs";
import { generateUuid } from "./module-0042.mjs";


// src/vs/platform/log/node/loggerService.ts
var LoggerService = class extends AbstractLoggerService {
  doCreateLogger(resource, logLevel, options) {
    return new SpdLogLogger(generateUuid(), resource.fsPath, !options?.donotRotate, !!options?.donotUseFormatters, logLevel);
  }
};
export { LoggerService };
