// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/log/node/loggerService.ts
import { __esm } from "./module-0000.mjs";
import { generateUuid, init_uuid } from "./module-0055.mjs";
import { AbstractLoggerService, init_log } from "./module-0075.mjs";
import { SpdLogLogger, init_spdlogLog } from "./module-0211.mjs";


// src/vs/platform/log/node/loggerService.ts
var LoggerService;

var init_loggerService = __esm({
  "src/vs/platform/log/node/loggerService.ts"() {
    init_uuid();
    init_log();
    init_spdlogLog();
    LoggerService = class extends AbstractLoggerService {
      doCreateLogger(resource, logLevel, options) {
        return new SpdLogLogger(generateUuid(), resource.fsPath, !options?.donotRotate, !!options?.donotUseFormatters, logLevel);
      }
    };
  }
});
export { LoggerService, init_loggerService };
