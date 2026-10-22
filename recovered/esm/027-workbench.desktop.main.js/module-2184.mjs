// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/delegationSessionPickerActionItem.ts
import { SessionTypePickerActionItem } from "./module-2183.mjs";
import { AgentSessionProviders, getAgentCanContinueIn, getAgentSessionProvider, isFirstPartyAgentSessionProvider } from "./module-0982.mjs";
import { IChatSessionsService, isAgentHostTarget } from "./module-0960.mjs";
import { Iterable } from "./module-0011.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { Codicon } from "./module-0085.mjs";
import { ACTION_ID_NEW_CHAT } from "./module-1476.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";
import { ILanguageModelsService } from "./module-0967.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IAgentHostEnablementService } from "./module-0963.mjs";
import { IChatInputNotificationService } from "./module-1461.mjs";
import { IGitService } from "./module-1486.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/delegationSessionPickerActionItem.ts
var DelegationSessionPickerActionItem = class extends SessionTypePickerActionItem {
  constructor(action, chatSessionPosition, delegate, pickerOptions, actionWidgetService, keybindingService, contextKeyService, chatSessionsService, commandService, openerService, telemetryService, chatEntitlementService, languageModelsService, configurationService, storageService, workspaceContextService, agentHostEnablementService, chatInputNotificationService, gitService) {
    super(action, chatSessionPosition, delegate, pickerOptions, actionWidgetService, keybindingService, contextKeyService, chatSessionsService, commandService, openerService, telemetryService, chatEntitlementService, languageModelsService, configurationService, storageService, workspaceContextService, agentHostEnablementService, chatInputNotificationService);
    this.gitService = gitService;
  }
  _run(sessionTypeItem) {
    if (this.delegate.setPendingDelegationTarget) {
      this.delegate.setPendingDelegationTarget(sessionTypeItem.type);
    }
    if (this.element) {
      this.renderLabel(this.element);
    }
  }
  _getSelectedSessionType() {
    const delegationTarget = this.delegate.getPendingDelegationTarget ? this.delegate.getPendingDelegationTarget() : void 0;
    if (delegationTarget) {
      return delegationTarget;
    }
    return this.delegate.getActiveSessionProvider();
  }
  _isSessionTypeEnabled(type) {
    const allContributions = this.chatSessionsService.getAllChatSessionContributions();
    const contribution = allContributions.find((contribution2) => getAgentSessionProvider(contribution2.type) === type || contribution2.type === type);
    const activeProvider = this.delegate.getActiveSessionProvider();
    const isAgentHostSource = activeProvider !== void 0 && isAgentHostTarget(activeProvider);
    if (!this._isSessionsWindow && activeProvider !== AgentSessionProviders.Local && !isAgentHostSource) {
      return false;
    }
    if (this._isSessionsWindow && activeProvider !== AgentSessionProviders.Background && !isAgentHostSource) {
      return false;
    }
    if (this._isSessionsWindow && type === AgentSessionProviders.Cloud && !this._hasGitRepository()) {
      return false;
    }
    if (contribution && !contribution.canDelegate && activeProvider !== type) {
      return false;
    }
    return this._getSelectedSessionType() !== type;
  }
  _hasGitRepository() {
    if (this.delegate.hasGitRepository) {
      return this.delegate.hasGitRepository();
    }
    return !Iterable.isEmpty(this.gitService.repositories);
  }
  _isVisible(type) {
    if (this._isSessionsWindow && type === AgentSessionProviders.Local) {
      return false;
    }
    if (this.delegate.getActiveSessionProvider() === type) {
      return true;
    }
    if (this._isSessionsWindow && type === AgentSessionProviders.Background && this.chatSessionsService.getChatSessionContribution(AgentSessionProviders.AgentHostCopilot)) {
      return false;
    }
    if (!super._isVisible(type)) {
      return false;
    }
    return getAgentCanContinueIn(type);
  }
  _getSessionCategory(sessionTypeItem) {
    if (isFirstPartyAgentSessionProvider(sessionTypeItem.type)) {
      return { label: localize(12518, null), order: 1, showHeader: true };
    }
    return { label: localize(12519, null), order: 2, showHeader: false };
  }
  _getSessionDescription(sessionTypeItem) {
    return void 0;
  }
  _getLearnMore() {
    const learnMoreUrl = "https://aka.ms/vscode-agent-handoff";
    return {
      id: "workbench.action.chat.agentOverview.learnMoreHandOff",
      label: localize(12515, null),
      tooltip: learnMoreUrl,
      class: void 0,
      enabled: true,
      run: async () => {
        await this.openerService.open(URI.parse(learnMoreUrl));
      }
    };
  }
  _getAdditionalActions() {
    if (this._isSessionsWindow) {
      return [];
    }
    return [{
      id: "newChatSession",
      class: void 0,
      label: localize(12516, null),
      tooltip: "",
      hover: { content: "" },
      checked: false,
      icon: Codicon.plus,
      enabled: true,
      category: { label: localize(12517, null), order: 0, showHeader: false },
      description: this.keybindingService.lookupKeybinding(ACTION_ID_NEW_CHAT)?.getLabel() || void 0,
      run: async () => {
        this.commandService.executeCommand(ACTION_ID_NEW_CHAT, this.chatSessionPosition);
      }
    }];
  }
};

DelegationSessionPickerActionItem = __decorateClass([
  __decorateParam(4, IActionWidgetService),
  __decorateParam(5, IKeybindingService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IChatSessionsService),
  __decorateParam(8, ICommandService),
  __decorateParam(9, IOpenerService),
  __decorateParam(10, ITelemetryService),
  __decorateParam(11, IChatEntitlementService),
  __decorateParam(12, ILanguageModelsService),
  __decorateParam(13, IConfigurationService),
  __decorateParam(14, IStorageService),
  __decorateParam(15, IWorkspaceContextService),
  __decorateParam(16, IAgentHostEnablementService),
  __decorateParam(17, IChatInputNotificationService),
  __decorateParam(18, IGitService)
], DelegationSessionPickerActionItem);
export { DelegationSessionPickerActionItem };
