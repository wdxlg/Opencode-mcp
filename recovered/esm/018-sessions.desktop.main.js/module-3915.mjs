// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/url/common/urlIpc.ts
import { URI } from "./module-0032.mjs";


// src/vs/platform/url/common/urlIpc.ts
var URLHandlerChannel = class {
  constructor(handler) {
    this.handler = handler;
  }
  listen(_, event) {
    throw new Error(`Event not found: ${event}`);
  }
  call(_, command4, arg) {
    switch (command4) {
      case "handleURL":
        return this.handler.handleURL(URI.revive(arg[0]), arg[1]);
    }
    throw new Error(`Call not found: ${command4}`);
  }
};
export { URLHandlerChannel };
