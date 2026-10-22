// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostLoggerService.ts
import { AbstractLoggerService, AbstractMessageLogger } from "./module-0045.mjs";
import { revive } from "./module-0074.mjs";
import { MainContext } from "./module-0025.mjs";
import { URI } from "./module-0023.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0052.mjs";
import { IExtHostInitDataService } from "./module-0049.mjs";


// src/vs/workbench/api/common/extHostLoggerService.ts
var ExtHostLoggerService = class extends AbstractLoggerService {
  constructor(rpc, initData) {
    super(initData.logLevel, initData.logsLocation, initData.loggers.map((logger) => revive(logger)));
    this._proxy = rpc.getProxy(MainContext.MainThreadLogger);
  }
  $setLogLevel(logLevel, resource) {
    if (resource) {
      this.setLogLevel(URI.revive(resource), logLevel);
    } else {
      this.setLogLevel(logLevel);
    }
  }
  setVisibility(resource, visibility) {
    super.setVisibility(resource, visibility);
    this._proxy.$setVisibility(resource, visibility);
  }
  doCreateLogger(resource, logLevel, options2) {
    return new Logger(this._proxy, resource, logLevel, options2);
  }
};

ExtHostLoggerService = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostInitDataService)
], ExtHostLoggerService);

var Logger = class extends AbstractMessageLogger {
  constructor(proxy, file, logLevel, loggerOptions) {
    super(loggerOptions?.logLevel === "always");
    this.proxy = proxy;
    this.file = file;
    this.isLoggerCreated = false;
    this.buffer = [];
    this.setLevel(logLevel);
    this.proxy.$createLogger(file, loggerOptions).then(() => {
      this.doLog(this.buffer);
      this.isLoggerCreated = true;
    });
  }
  log(level, message) {
    const messages = [[level, message]];
    if (this.isLoggerCreated) {
      this.doLog(messages);
    } else {
      this.buffer.push(...messages);
    }
  }
  doLog(messages) {
    this.proxy.$log(this.file, messages);
  }
  flush() {
    this.proxy.$flush(this.file);
  }
};
export { ExtHostLoggerService, Logger };
