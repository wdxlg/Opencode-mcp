// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/log/node/loggerService.ts
import { AbstractLoggerService } from "./module-0049.mjs";
import { SpdLogLogger } from "./module-0158.mjs";
import { generateUuid } from "./module-0067.mjs";


// src/vs/platform/log/node/loggerService.ts
var LoggerService = class extends AbstractLoggerService {
  doCreateLogger(resource, logLevel, options) {
    return new SpdLogLogger(generateUuid(), resource.fsPath, !options?.donotRotate, !!options?.donotUseFormatters, logLevel);
  }
};
export { LoggerService };
