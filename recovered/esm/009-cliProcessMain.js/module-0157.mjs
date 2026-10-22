// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/log/common/logService.ts
import { Disposable } from "./module-0011.mjs";
import { MultiplexLogger } from "./module-0049.mjs";


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
  trace(message, ...args) {
    this.logger.trace(message, ...args);
  }
  debug(message, ...args) {
    this.logger.debug(message, ...args);
  }
  info(message, ...args) {
    this.logger.info(message, ...args);
  }
  warn(message, ...args) {
    this.logger.warn(message, ...args);
  }
  error(message, ...args) {
    this.logger.error(message, ...args);
  }
  flush() {
    this.logger.flush();
  }
};
export { LogService };
