// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/log/common/logService.ts
import { __esm } from "./module-0000.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { MultiplexLogger, init_log } from "./module-0075.mjs";


// src/vs/platform/log/common/logService.ts
var LogService;

var init_logService = __esm({
  "src/vs/platform/log/common/logService.ts"() {
    init_lifecycle();
    init_log();
    LogService = class extends Disposable {
      constructor(primaryLogger, otherLoggers = []) {
        super();
        this.logger = new MultiplexLogger([primaryLogger, ...otherLoggers]);
        this._register(primaryLogger.onDidChangeLogLevel((level) => this.setLevel(level)));
      }
      get onDidChangeLogLevel() {
        return this.logger.onDidChangeLogLevel;
      }
      setLevel(level) {
        this.logger.setLevel(level);
      }
      getLevel() {
        return this.logger.getLevel();
      }
      trace(message, ...args2) {
        this.logger.trace(message, ...args2);
      }
      debug(message, ...args2) {
        this.logger.debug(message, ...args2);
      }
      info(message, ...args2) {
        this.logger.info(message, ...args2);
      }
      warn(message, ...args2) {
        this.logger.warn(message, ...args2);
      }
      error(message, ...args2) {
        this.logger.error(message, ...args2);
      }
      flush() {
        this.logger.flush();
      }
    };
  }
});
export { LogService, init_logService };
