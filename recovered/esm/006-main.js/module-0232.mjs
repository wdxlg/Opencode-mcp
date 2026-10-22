// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/url/common/urlIpc.ts
import { __esm } from "./module-0000.mjs";
import { URI, init_uri } from "./module-0030.mjs";


// src/vs/platform/url/common/urlIpc.ts
var URLHandlerChannelClient, URLHandlerRouter;

var init_urlIpc = __esm({
  "src/vs/platform/url/common/urlIpc.ts"() {
    init_uri();
    URLHandlerChannelClient = class {
      constructor(channel) {
        this.channel = channel;
      }
      handleURL(uri, options) {
        return this.channel.call("handleURL", [uri.toJSON(), options]);
      }
    };
    URLHandlerRouter = class {
      constructor(next, logService) {
        this.next = next;
        this.logService = logService;
      }
      async routeCall(hub, command, arg, cancellationToken) {
        if (command !== "handleURL") {
          throw new Error(`Call not found: ${command}`);
        }
        if (Array.isArray(arg) && arg.length > 0) {
          const uri = URI.revive(arg[0]);
          this.logService.trace("URLHandlerRouter#routeCall() with URI argument", uri.toString(true));
          if (uri.query) {
            const match = /\bwindowId=(\d+)/.exec(uri.query);
            if (match) {
              const windowId = match[1];
              this.logService.trace(`URLHandlerRouter#routeCall(): found windowId query parameter with value "${windowId}"`, uri.toString(true));
              const regex = new RegExp(`window:${windowId}`);
              const connection = hub.connections.find((c) => {
                this.logService.trace("URLHandlerRouter#routeCall(): testing connection", c.ctx);
                return regex.test(c.ctx);
              });
              if (connection) {
                this.logService.trace("URLHandlerRouter#routeCall(): found a connection to route", uri.toString(true));
                return connection;
              } else {
                this.logService.trace("URLHandlerRouter#routeCall(): did not find a connection to route", uri.toString(true));
              }
            } else {
              this.logService.trace("URLHandlerRouter#routeCall(): did not find windowId query parameter", uri.toString(true));
            }
          }
        } else {
          this.logService.trace("URLHandlerRouter#routeCall() without URI argument");
        }
        return this.next.routeCall(hub, command, arg, cancellationToken);
      }
      routeEvent(_, event) {
        throw new Error(`Event not found: ${event}`);
      }
    };
  }
});
export { URLHandlerChannelClient, URLHandlerRouter, init_urlIpc };
