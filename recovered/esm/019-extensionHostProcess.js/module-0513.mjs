// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/log/common/logService.ts
import { Disposable } from "./module-0011.mjs";
import { MultiplexLogger } from "./module-0062.mjs";


// src/vs/platform/log/common/logService.ts
var LogService = class extends Disposable {
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
export { LogService };
