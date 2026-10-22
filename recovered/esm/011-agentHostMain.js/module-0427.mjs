// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/log/common/logIpc.ts
import { Event } from "./module-0016.mjs";
import { isLogLevel } from "./module-0084.mjs";
import { URI } from "./module-0023.mjs";


// src/vs/platform/log/common/logIpc.ts
var LoggerChannel = class {
  constructor(loggerService, getUriTransformer) {
    this.loggerService = loggerService;
    this.getUriTransformer = getUriTransformer;
  }
  listen(context, event) {
    const uriTransformer = this.getUriTransformer(context);
    switch (event) {
      case "onDidChangeLoggers":
        return Event.map(this.loggerService.onDidChangeLoggers, (e) => ({
          added: [...e.added].map((logger) => this.transformLogger(logger, uriTransformer)),
          removed: [...e.removed].map((logger) => this.transformLogger(logger, uriTransformer))
        }));
      case "onDidChangeVisibility":
        return Event.map(this.loggerService.onDidChangeVisibility, (e) => [uriTransformer.transformOutgoingURI(e[0]), e[1]]);
      case "onDidChangeLogLevel":
        return Event.map(this.loggerService.onDidChangeLogLevel, (e) => isLogLevel(e) ? e : [uriTransformer.transformOutgoingURI(e[0]), e[1]]);
    }
    throw new Error(`Event not found: ${event}`);
  }
  async call(context, command, arg) {
    const uriTransformer = this.getUriTransformer(context);
    switch (command) {
      case "setLogLevel":
        return isLogLevel(arg[0]) ? this.loggerService.setLogLevel(arg[0]) : this.loggerService.setLogLevel(URI.revive(uriTransformer.transformIncoming(arg[0][0])), arg[0][1]);
      case "getRegisteredLoggers":
        return Promise.resolve([...this.loggerService.getRegisteredLoggers()].map((logger) => this.transformLogger(logger, uriTransformer)));
    }
    throw new Error(`Call not found: ${command}`);
  }
  transformLogger(logger, transformer) {
    return {
      ...logger,
      resource: transformer.transformOutgoingURI(logger.resource)
    };
  }
};
export { LoggerChannel };
