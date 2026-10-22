// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/log/node/spdlogLog.ts
import { AbstractMessageLogger } from "./module-0062.mjs";
import { ByteSize } from "./module-0073.mjs";


// src/vs/platform/log/node/spdlogLog.ts
async function createSpdLogLogger(name, logfilePath, filesize, filecount, donotUseFormatters) {
  try {
    const _spdlog = await import("@vscode/spdlog");
    _spdlog.setFlushOn(0 /* Trace */);
    const logger = await _spdlog.createAsyncRotatingLogger(name, logfilePath, filesize, filecount);
    if (donotUseFormatters) {
      logger.clearFormatters();
    } else {
      logger.setPattern("%Y-%m-%d %H:%M:%S.%e [%l] %v");
    }
    return logger;
  } catch (e) {
    console.error(e);
  }
  return null;
}

function log3(logger, level, message) {
  switch (level) {
    case 1 /* Trace */:
      logger.trace(message);
      break;
    case 2 /* Debug */:
      logger.debug(message);
      break;
    case 3 /* Info */:
      logger.info(message);
      break;
    case 4 /* Warning */:
      logger.warn(message);
      break;
    case 5 /* Error */:
      logger.error(message);
      break;
    case 0 /* Off */:
      break;
    default:
      throw new Error(`Invalid log level ${level}`);
  }
}

function setLogLevel(logger, level) {
  switch (level) {
    case 1 /* Trace */:
      logger.setLevel(0 /* Trace */);
      break;
    case 2 /* Debug */:
      logger.setLevel(1 /* Debug */);
      break;
    case 3 /* Info */:
      logger.setLevel(2 /* Info */);
      break;
    case 4 /* Warning */:
      logger.setLevel(3 /* Warning */);
      break;
    case 5 /* Error */:
      logger.setLevel(4 /* Error */);
      break;
    case 0 /* Off */:
      logger.setLevel(6 /* Off */);
      break;
    default:
      throw new Error(`Invalid log level ${level}`);
  }
}

var SpdLogLogger = class extends AbstractMessageLogger {
  constructor(name, filepath, rotating, donotUseFormatters, level) {
    super();
    this.buffer = [];
    this.setLevel(level);
    this._loggerCreationPromise = this._createSpdLogLogger(name, filepath, rotating, donotUseFormatters);
    this._register(this.onDidChangeLogLevel((level2) => {
      if (this._logger) {
        setLogLevel(this._logger, level2);
      }
    }));
  }
  async _createSpdLogLogger(name, filepath, rotating, donotUseFormatters) {
    const filecount = rotating ? 6 : 1;
    const filesize = 30 / filecount * ByteSize.MB;
    const logger = await createSpdLogLogger(name, filepath, filesize, filecount, donotUseFormatters);
    if (logger) {
      this._logger = logger;
      setLogLevel(this._logger, this.getLevel());
      for (const { level, message } of this.buffer) {
        log3(this._logger, level, message);
      }
      this.buffer = [];
    }
  }
  log(level, message) {
    if (this._logger) {
      log3(this._logger, level, message);
    } else if (this.getLevel() <= level) {
      this.buffer.push({ level, message });
    }
  }
  flush() {
    if (this._logger) {
      this.flushLogger();
    } else {
      this._loggerCreationPromise.then(() => this.flushLogger());
    }
  }
  dispose() {
    if (this._logger) {
      this.disposeLogger();
    } else {
      this._loggerCreationPromise.then(() => this.disposeLogger());
    }
    super.dispose();
  }
  flushLogger() {
    if (this._logger) {
      this._logger.flush();
    }
  }
  disposeLogger() {
    if (this._logger) {
      this._logger.drop();
      this._logger = void 0;
    }
  }
};
export { createSpdLogLogger, log3, setLogLevel, SpdLogLogger };
