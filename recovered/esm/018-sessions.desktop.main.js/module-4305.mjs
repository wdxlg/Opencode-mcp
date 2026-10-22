// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/copilotConfigSlashSubmitHandler.ts
import { Disposable } from "./module-0012.mjs";
import { getChatSessionType } from "./module-0962.mjs";
import { SessionType } from "./module-0961.mjs";
import { parseLeadingSlashCommand } from "./module-4303.mjs";
import { resolveCopilotConfigSlashCommandOnSend } from "./module-4304.mjs";
import { isAgentHostProvider } from "./module-1764.mjs";
import { applyAgentHostCompletionAction } from "./module-2796.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatSubmitRequestHandlerService } from "./module-2367.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/sessions/contrib/chat/browser/copilotConfigSlashSubmitHandler.ts
var SessionsCopilotConfigSlashSubmitHandlerContribution = class extends Disposable {
  constructor(submitRequestHandlerService, _sessionsManagementService, _sessionsProvidersService, _dialogService, _storageService) {
    super();
    this._sessionsManagementService = _sessionsManagementService;
    this._sessionsProvidersService = _sessionsProvidersService;
    this._dialogService = _dialogService;
    this._storageService = _storageService;
    this._register(submitRequestHandlerService.register({
      id: "sessions.copilot.configSlash",
      tryHandle: (request2) => this._tryHandle(request2)
    }));
  }
  static {
    this.ID = "sessions.contrib.chat.copilotConfigSlashSubmitHandler";
  }
  async _tryHandle(request2) {
    if (getChatSessionType(request2.sessionResource) !== SessionType.AgentHostCopilot) {
      return false;
    }
    const slashCommand = parseLeadingSlashCommand(request2.input);
    const configAction = slashCommand ? resolveCopilotConfigSlashCommandOnSend(slashCommand.command, slashCommand.rawRest) : void 0;
    if (!configAction) {
      return false;
    }
    const session = this._sessionsManagementService.getSession(request2.sessionResource);
    const providerId = session?.providerId ?? request2.providerId;
    const sessionId = session?.sessionId ?? request2.sessionId;
    if (!providerId || !sessionId) {
      return false;
    }
    const provider = this._sessionsProvidersService.getProvider(providerId);
    if (!provider || !isAgentHostProvider(provider)) {
      return false;
    }
    await applyAgentHostCompletionAction({ applyConfig: configAction.applyConfig }, this._dialogService, this._storageService, async (config) => {
      await Promise.all(Object.entries(config).map(([key3, value2]) => provider.setSessionConfigValue(sessionId, key3, value2)));
    });
    return !configAction.strippedPrompt;
  }
};

SessionsCopilotConfigSlashSubmitHandlerContribution = __decorateClass([
  __decorateParam(0, IChatSubmitRequestHandlerService),
  __decorateParam(1, ISessionsManagementService),
  __decorateParam(2, ISessionsProvidersService),
  __decorateParam(3, IDialogService),
  __decorateParam(4, IStorageService)
], SessionsCopilotConfigSlashSubmitHandlerContribution);
export { SessionsCopilotConfigSlashSubmitHandlerContribution };
