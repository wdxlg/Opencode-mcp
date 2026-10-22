// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/copilotChatSessions/browser/copilotChatSessions.contribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { COPILOT_MULTI_CHAT_SETTING, CopilotChatSessionsProvider } from "./module-3689.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/providers/copilotChatSessions/browser/copilotChatSessions.contribution.ts
Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "sessions",
  properties: {
    [COPILOT_MULTI_CHAT_SETTING]: {
      type: "boolean",
      default: true,
      tags: ["preview"],
      description: localize(5034, null)
    }
  }
});

var DefaultSessionsProviderContribution = class extends Disposable {
  static {
    this.ID = "sessions.defaultSessionsProvider";
  }
  constructor(instantiationService, sessionsProvidersService) {
    super();
    const provider = this._register(instantiationService.createInstance(CopilotChatSessionsProvider));
    this._register(sessionsProvidersService.registerProvider(provider));
  }
};

DefaultSessionsProviderContribution = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ISessionsProvidersService)
], DefaultSessionsProviderContribution);

registerWorkbenchContribution2(DefaultSessionsProviderContribution.ID, DefaultSessionsProviderContribution, WorkbenchPhase.AfterRestored);
export { DefaultSessionsProviderContribution };
