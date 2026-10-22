// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/browser/remoteAgentHostConnectionCustomization.ts
import { createDecorator } from "./module-0077.mjs";
import { toDisposable } from "./module-0012.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/browser/remoteAgentHostConnectionCustomization.ts
var IRemoteAgentHostConnectionCustomizationService = createDecorator("remoteAgentHostConnectionCustomizationService");

var RemoteAgentHostConnectionCustomizationService = class {
  constructor() {
    this._entries = /* @__PURE__ */ new Set();
  }
  register(match2, factory) {
    const entry = { match: match2, factory };
    this._entries.add(entry);
    return toDisposable(() => this._entries.delete(entry));
  }
  get(address) {
    for (const entry of this._entries) {
      if (entry.match(address)) {
        return entry.factory(address);
      }
    }
    return void 0;
  }
};
export { IRemoteAgentHostConnectionCustomizationService, RemoteAgentHostConnectionCustomizationService };
