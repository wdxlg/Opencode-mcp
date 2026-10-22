// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/sessionTargetPickerActionItem.ts
import { localize } from "./module-0001.mjs";
import { getSessionTypeAvailability, getSessionTypePickerAvailability, getSessionTypeUnavailableDescription, getSessionTypeUnavailableHover } from "./module-2179.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { AgentHostAllowSignedOutWhenUsableSettingId } from "./module-1107.mjs";
import { hasAgentSdkSetupNotification } from "./module-2182.mjs";
import { ChatInputPickerActionViewItem } from "./module-2096.mjs";
import { IsSessionsWindowContext } from "./module-0949.mjs";
import { autorun } from "./module-0052.mjs";
import { getDefaultNewChatSessionType, isVisibleEditorChatSessionType, recordUserSelectedSessionType } from "./module-0964.mjs";
import { URI } from "./module-0032.mjs";
import { AgentSessionProviders, getAgentSessionProvider, getAgentSessionProviderDescription, getAgentSessionProviderIcon, getAgentSessionProviderName, isFirstPartyAgentSessionProvider } from "./module-0982.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { getCompactCodicon } from "./module-2040.mjs";
import { $, reset } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IChatSessionsService } from "./module-0960.mjs";
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


// src/vs/workbench/contrib/chat/browser/widget/input/sessionTargetPickerActionItem.ts
var firstPartyCategory = { label: localize(12672, null), order: 1 };

var otherCategory = { label: localize(12673, null), order: 2 };

function createSessionTypePickerAction(action, sessionTypeItem, currentType, availability, enabled, category11, sourceDescription, icon2, run) {
  const unavailable = availability !== 0 /* Available */;
  const description = getSessionTypeUnavailableDescription(availability) ?? sourceDescription;
  const hoverDescription = getSessionTypeUnavailableHover(availability) ?? sessionTypeItem.hoverDescription;
  const ariaDescription = description ? renderAsPlaintext(description) : void 0;
  const ariaHoverDescription = hoverDescription ? renderAsPlaintext(hoverDescription) : void 0;
  return {
    ...action,
    id: sessionTypeItem.commandId,
    label: sessionTypeItem.label,
    checked: currentType === sessionTypeItem.type,
    icon: icon2,
    enabled: unavailable ? false : enabled,
    category: category11,
    description,
    ariaDescription: ariaDescription && ariaHoverDescription ? localize(12671, null, ariaDescription, ariaHoverDescription) : ariaDescription ?? ariaHoverDescription,
    tooltip: "",
    hover: { content: hoverDescription },
    run: async () => run()
  };
}

function getConfiguredSessionTypePickerAvailability(type, configurationService, chatSessionsService, chatEntitlementService, languageModelsService, chatInputNotificationService) {
  const allowSignedOutWhenUsable = configurationService.getValue(AgentHostAllowSignedOutWhenUsableSettingId) === true;
  return getSessionTypePickerAvailability(
    type,
    getSessionTypeAvailability(chatSessionsService, chatEntitlementService, languageModelsService, type, allowSignedOutWhenUsable),
    allowSignedOutWhenUsable,
    hasAgentSdkSetupNotification(chatInputNotificationService, type)
  );
}

var SessionTypePickerActionItem = class extends ChatInputPickerActionViewItem {
  constructor(action, chatSessionPosition, delegate, pickerOptions, actionWidgetService, keybindingService, contextKeyService, chatSessionsService, commandService, openerService, telemetryService, chatEntitlementService, languageModelsService, configurationService, storageService, workspaceContextService, agentHostEnablementService, chatInputNotificationService) {
    const actionProvider = {
      getActions: () => {
        const currentType = this._getSelectedSessionType() ?? this._getDefaultSessionType();
        const actions = [...this._getAdditionalActions().map((a) => ({ ...action, ...a }))];
        for (const sessionTypeItem of this._sessionTypeItems) {
          const availability = getConfiguredSessionTypePickerAvailability(
            sessionTypeItem.type,
            this.configurationService,
            this.chatSessionsService,
            this.chatEntitlementService,
            this.languageModelsService,
            this.chatInputNotificationService
          );
          actions.push(createSessionTypePickerAction(
            action,
            sessionTypeItem,
            currentType,
            availability,
            this._isSessionTypeEnabled(sessionTypeItem.type),
            this._getSessionCategory(sessionTypeItem),
            this._getSessionDescription(sessionTypeItem),
            this._getSessionIcon(sessionTypeItem),
            () => this._run(sessionTypeItem)
          ));
        }
        return actions;
      }
    };
    const actionBarActionProvider = {
      getActions: () => {
        return [this._getLearnMore()];
      }
    };
    const sessionTargetPickerOptions = {
      actionProvider,
      actionBarActionProvider,
      showItemKeybindings: true,
      reporter: { id: "ChatSessionTypePicker", name: `ChatSessionTypePicker`, includeOptions: true }
    };
    super(action, sessionTargetPickerOptions, pickerOptions, actionWidgetService, keybindingService, contextKeyService, telemetryService);
    this.chatSessionPosition = chatSessionPosition;
    this.delegate = delegate;
    this.keybindingService = keybindingService;
    this.chatSessionsService = chatSessionsService;
    this.commandService = commandService;
    this.openerService = openerService;
    this.chatEntitlementService = chatEntitlementService;
    this.languageModelsService = languageModelsService;
    this.configurationService = configurationService;
    this.storageService = storageService;
    this.workspaceContextService = workspaceContextService;
    this.agentHostEnablementService = agentHostEnablementService;
    this.chatInputNotificationService = chatInputNotificationService;
    this._sessionTypeItems = [];
    this._isSessionsWindow = IsSessionsWindowContext.getValue(contextKeyService) === true;
    if (this.delegate.onDidChangeActiveSessionProvider) {
      this._register(this.delegate.onDidChangeActiveSessionProvider(() => {
        if (this.element) {
          this.renderLabel(this.element);
        }
      }));
    }
    this._register(this.chatSessionsService.onDidChangeAvailability(() => {
      this._updateAgentSessionItems();
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("chat.editor.preferCopilotHarness" /* EditorPreferCopilotHarness */) || e.affectsConfiguration("chat.defaultToCopilotHarness" /* DefaultToCopilotHarness */) || e.affectsConfiguration("chat.editor.localAgent.enabled" /* EditorLocalAgentEnabled */)) {
        this._updateAgentSessionItems();
        if (this.element) {
          this.renderLabel(this.element);
        }
      }
    }));
    this._register(autorun((reader) => {
      this.agentHostEnablementService.managedSandboxEnforced.read(reader);
      this._updateAgentSessionItems();
      if (this.element) {
        this.renderLabel(this.element);
      }
    }));
    this._register(this.workspaceContextService.onDidChangeWorkspaceFolders(() => this._updateAgentSessionItems()));
    this._updateAgentSessionItems();
  }
  _run(sessionTypeItem) {
    if (!this._isSessionsWindow) {
      recordUserSelectedSessionType(this.storageService, this.configurationService, this.chatSessionsService, this.workspaceContextService.getWorkspace(), sessionTypeItem.type, this.agentHostEnablementService.enabled.get());
    }
    if (this.delegate.setActiveSessionProvider) {
      this.delegate.setActiveSessionProvider(sessionTypeItem.type);
    } else {
      this.commandService.executeCommand(sessionTypeItem.commandId, this.chatSessionPosition);
    }
    if (this.element) {
      this.renderLabel(this.element);
    }
  }
  _getSelectedSessionType() {
    return this.delegate.getActiveSessionProvider();
  }
  _getAdditionalActions() {
    return [];
  }
  _getLearnMore() {
    const learnMoreUrl = "https://aka.ms/vscode-concept-harnesses";
    return {
      id: "workbench.action.chat.agentOverview.learnMore",
      label: localize(12670, null),
      tooltip: learnMoreUrl,
      class: void 0,
      enabled: true,
      run: async () => {
        await this.openerService.open(URI.parse(learnMoreUrl));
      }
    };
  }
  _updateAgentSessionItems() {
    const localSessionItem = {
      type: AgentSessionProviders.Local,
      label: getAgentSessionProviderName(AgentSessionProviders.Local),
      hoverDescription: getAgentSessionProviderDescription(AgentSessionProviders.Local),
      commandId: `workbench.action.chat.openNewChatSessionInPlace.${AgentSessionProviders.Local}`
    };
    const allAgentSessionItems = [localSessionItem];
    const contributions = this.chatSessionsService.getAllChatSessionContributions();
    for (const contribution of contributions) {
      const agentSessionType = getAgentSessionProvider(contribution.type);
      if (agentSessionType) {
        allAgentSessionItems.push({
          type: agentSessionType,
          label: getAgentSessionProviderName(agentSessionType),
          hoverDescription: getAgentSessionProviderDescription(agentSessionType),
          commandId: contribution.canDelegate ? `workbench.action.chat.openNewChatSessionInPlace.${contribution.type}` : `workbench.action.chat.openNewChatSessionExternal.${contribution.type}`
        });
      } else {
        allAgentSessionItems.push({
          type: contribution.type,
          label: contribution.displayName ?? contribution.name ?? contribution.type,
          hoverDescription: contribution.description ?? "",
          commandId: `workbench.action.chat.openNewChatSessionInPlace.${contribution.type}`
        });
      }
    }
    const agentSessionItems = allAgentSessionItems.filter((item) => this._isVisible(item.type));
    const defaultType = this._getDefaultSessionType();
    if (defaultType !== AgentSessionProviders.Local) {
      const index2 = agentSessionItems.findIndex((item) => item.type === defaultType);
      if (index2 > 0) {
        const [defaultItem] = agentSessionItems.splice(index2, 1);
        agentSessionItems.unshift(defaultItem);
      }
    }
    this._sessionTypeItems = agentSessionItems;
  }
  /**
   * The default session type for the picker when no session is yet active.
   * Defaults to Agent Host Copilot when the agent host is enabled, otherwise
   * {@link AgentSessionProviders.Local}.
   */
  _getDefaultSessionType() {
    return getDefaultNewChatSessionType(this.configurationService, this.chatSessionsService, this.storageService, this.workspaceContextService.getWorkspace(), this.agentHostEnablementService.enabled.get(), void 0, this.agentHostEnablementService.managedSandboxEnforced.get());
  }
  _isVisible(type) {
    return isVisibleEditorChatSessionType(type, this.configurationService, this.chatSessionsService, this.workspaceContextService.getWorkspace(), this.agentHostEnablementService.managedSandboxEnforced.get(), this.agentHostEnablementService.enabled.get());
  }
  _isSessionTypeEnabled(type) {
    if (type === AgentSessionProviders.Local) {
      return true;
    }
    return !!this.chatSessionsService.getChatSessionContribution(type);
  }
  _getSessionCategory(sessionTypeItem) {
    const knownType = getAgentSessionProvider(sessionTypeItem.type);
    return knownType && isFirstPartyAgentSessionProvider(knownType) ? firstPartyCategory : otherCategory;
  }
  _getSessionDescription(_sessionTypeItem) {
    return void 0;
  }
  _getSessionIcon(sessionTypeItem) {
    const knownType = getAgentSessionProvider(sessionTypeItem.type);
    if (knownType) {
      return getAgentSessionProviderIcon(knownType);
    }
    const contribution = this.chatSessionsService.getChatSessionContribution(sessionTypeItem.type);
    if (contribution && ThemeIcon.isThemeIcon(contribution.icon)) {
      return contribution.icon;
    }
    return Codicon.extensions;
  }
  render(container3) {
    super.render(container3);
    container3.classList.add("chat-session-target-picker-item");
  }
  renderLabel(element) {
    const currentType = this._getSelectedSessionType() ?? this._getDefaultSessionType();
    const knownType = getAgentSessionProvider(currentType);
    const label3 = knownType ? getAgentSessionProviderName(knownType) : this.chatSessionsService.getChatSessionContribution(currentType)?.displayName ?? currentType;
    const icon2 = this._getSessionIcon({ type: currentType, label: label3, hoverDescription: "", commandId: "" });
    const labelElements = [];
    labelElements.push(...renderLabelWithIcons(`$(${getCompactCodicon(icon2).id})`));
    const compact2 = this.pickerOptions.compact.get();
    element.classList.toggle("icon-only", compact2);
    if (!compact2) {
      labelElements.push($("span.chat-input-picker-label", void 0, label3));
    }
    reset(element, ...labelElements);
    this.setAriaLabelAttributes(element);
    element.ariaLabel = label3;
    return null;
  }
};

SessionTypePickerActionItem = __decorateClass([
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
  __decorateParam(17, IChatInputNotificationService)
], SessionTypePickerActionItem);
export { createSessionTypePickerAction, getConfiguredSessionTypePickerAvailability, firstPartyCategory, otherCategory, SessionTypePickerActionItem };
