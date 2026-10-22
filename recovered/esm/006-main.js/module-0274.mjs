// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/log/common/logIpc.ts
import { __esm } from "./module-0000.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { init_event } from "./module-0021.mjs";
import { init_log } from "./module-0075.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";


// src/vs/platform/log/common/logIpc.ts
var RemoteLoggerChannelClient;

var init_logIpc2 = __esm({
  "src/vs/platform/log/common/logIpc.ts"() {
    init_uri();
    init_event();
    init_log();
    init_lifecycle();
    RemoteLoggerChannelClient = class extends Disposable {
      constructor(loggerService, channel) {
        super();
        channel.call("setLogLevel", [loggerService.getLogLevel()]);
        this._register(loggerService.onDidChangeLogLevel((arg) => channel.call("setLogLevel", [arg])));
        channel.call("getRegisteredLoggers").then((loggers) => {
          for (const loggerResource of loggers) {
            loggerService.registerLogger({ ...loggerResource, resource: URI.revive(loggerResource.resource) });
          }
        });
        this._register(channel.listen("onDidChangeVisibility")(([resource, visibility]) => loggerService.setVisibility(URI.revive(resource), visibility)));
        this._register(channel.listen("onDidChangeLoggers")(({ added, removed }) => {
          for (const loggerResource of added) {
            loggerService.registerLogger({ ...loggerResource, resource: URI.revive(loggerResource.resource) });
          }
          for (const loggerResource of removed) {
            loggerService.deregisterLogger(loggerResource.resource);
          }
        }));
      }
    };
  }
});
export { RemoteLoggerChannelClient, init_logIpc2 };
