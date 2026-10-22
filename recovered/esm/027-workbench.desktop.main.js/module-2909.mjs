// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/copilotConfigSlashSubmitHandler.ts
import { parseLeadingSlashCommand } from "./module-2906.mjs";
import { resolveCopilotConfigSlashCommandOnSend } from "./module-2907.mjs";
import { Disposable } from "./module-0012.mjs";
import { getChatSessionType } from "./module-0961.mjs";
import { SessionType } from "./module-0960.mjs";
import { applyAgentHostSubmitConfig } from "./module-2908.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatSubmitRequestHandlerService } from "./module-2392.mjs";
import { IAgentHostService } from "./module-1107.mjs";
import { IAgentHostUntitledProvisionalSessionService } from "./module-2124.mjs";
import { IAgentHostSessionWorkingDirectoryResolver } from "./module-2107.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/copilotConfigSlashSubmitHandler.ts
function resolveCopilotConfigSlashSubmit(input) {
  const slashCommand = parseLeadingSlashCommand(input);
  return slashCommand ? resolveCopilotConfigSlashCommandOnSend(slashCommand.command, slashCommand.rawRest) : void 0;
}

var CopilotConfigSlashSubmitHandlerContribution = class extends Disposable {
  constructor(submitRequestHandlerService, _agentHostService, _provisionalService, _workingDirectoryResolver, _workspaceContextService, _configurationService, _dialogService, _storageService) {
    super();
    this._agentHostService = _agentHostService;
    this._provisionalService = _provisionalService;
    this._workingDirectoryResolver = _workingDirectoryResolver;
    this._workspaceContextService = _workspaceContextService;
    this._configurationService = _configurationService;
    this._dialogService = _dialogService;
    this._storageService = _storageService;
    this._register(submitRequestHandlerService.register({
      id: "copilot.configSlash",
      tryHandle: (request2) => this._tryHandle(request2)
    }));
  }
  static {
    this.ID = "workbench.contrib.chat.copilotConfigSlashSubmitHandler";
  }
  async _tryHandle(request2) {
    if (getChatSessionType(request2.sessionResource) !== SessionType.AgentHostCopilot) {
      return false;
    }
    const configAction = resolveCopilotConfigSlashSubmit(request2.input);
    if (!configAction) {
      return false;
    }
    await applyAgentHostSubmitConfig(request2.sessionResource, configAction.applyConfig, {
      agentHostService: this._agentHostService,
      provisionalService: this._provisionalService,
      workingDirectoryResolver: this._workingDirectoryResolver,
      workspaceContextService: this._workspaceContextService,
      configurationService: this._configurationService,
      dialogService: this._dialogService,
      storageService: this._storageService
    });
    return !configAction.strippedPrompt;
  }
};

CopilotConfigSlashSubmitHandlerContribution = __decorateClass([
  __decorateParam(0, IChatSubmitRequestHandlerService),
  __decorateParam(1, IAgentHostService),
  __decorateParam(2, IAgentHostUntitledProvisionalSessionService),
  __decorateParam(3, IAgentHostSessionWorkingDirectoryResolver),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IDialogService),
  __decorateParam(7, IStorageService)
], CopilotConfigSlashSubmitHandlerContribution);
export { resolveCopilotConfigSlashSubmit, CopilotConfigSlashSubmitHandlerContribution };
