// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/log/common/bufferLog.ts
import { __esm } from "./module-0000.mjs";
import { MutableDisposable, init_lifecycle } from "./module-0018.mjs";
import { AbstractMessageLogger, DEFAULT_LOG_LEVEL, init_log, log } from "./module-0075.mjs";


// src/vs/platform/log/common/bufferLog.ts
var BufferLogger;

var init_bufferLog = __esm({
  "src/vs/platform/log/common/bufferLog.ts"() {
    init_lifecycle();
    init_log();
    BufferLogger = class extends AbstractMessageLogger {
      constructor(logLevel = DEFAULT_LOG_LEVEL) {
        super();
        this.buffer = [];
        this._logger = void 0;
        this._logLevelDisposable = this._register(new MutableDisposable());
        this.setLevel(logLevel);
      }
      set logger(logger) {
        this._logger = logger;
        this.setLevel(logger.getLevel());
        this._logLevelDisposable.value = logger.onDidChangeLogLevel(this.setLevel, this);
        for (const { level, message } of this.buffer) {
          log(logger, level, message);
        }
        this.buffer = [];
      }
      log(level, message) {
        if (this._logger) {
          log(this._logger, level, message);
        } else if (this.getLevel() <= level) {
          this.buffer.push({ level, message });
        }
      }
      dispose() {
        this._logger?.dispose();
        super.dispose();
      }
      flush() {
        this._logger?.flush();
      }
    };
  }
});
export { BufferLogger, init_bufferLog };
