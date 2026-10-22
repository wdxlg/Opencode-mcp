// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/sessionSummaryHoverService.ts
import { createDecorator } from "./module-0077.mjs";
import { toDisposable } from "./module-0012.mjs";
import { SessionSummaryHoverWidget } from "./module-2272.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/sessionSummaryHoverService.ts
var ISessionSummaryHoverService = createDecorator("sessionSummaryHoverService");

var SessionSummaryHoverService = class {
  constructor() {
    this._providers = [];
  }
  registerProvider(provider) {
    this._providers.unshift(provider);
    return toDisposable(() => {
      const index2 = this._providers.indexOf(provider);
      if (index2 !== -1) {
        this._providers.splice(index2, 1);
      }
    });
  }
  async createHoverElement(resource, token) {
    for (const provider of this._providers) {
      const data = await provider.provideSessionSummaryHoverData(resource, token);
      if (token.isCancellationRequested) {
        return void 0;
      }
      if (data) {
        return new SessionSummaryHoverWidget(data).domNode;
      }
    }
    return void 0;
  }
};
export { ISessionSummaryHoverService, SessionSummaryHoverService };
