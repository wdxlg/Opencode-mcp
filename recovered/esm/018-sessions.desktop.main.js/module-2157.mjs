// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSdkSetupNotification.ts
import { MarkdownString, createCommandUri, escapeMarkdownSyntaxTokens } from "./module-0462.mjs";
import { localize } from "./module-0001.mjs";
import { LOCAL_AGENT_HOST_SCHEME_PREFIX } from "./module-0960.mjs";
import { IChatInputNotificationService, isChatInputNotificationApplicableToSessionType } from "./module-1460.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { IAgentSdkSetupService } from "./module-2156.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { AgentHostAllowSignedOutWhenUsableSettingId, IAgentHostService } from "./module-1108.mjs";
import { hasAnyModelTargetingSessionType } from "./module-2152.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { ILanguageModelsService } from "./module-0968.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IChatEntitlementService } from "./module-0954.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostSdkSetupNotification.ts
function getAgentSdkSetupState(inputs) {
  if (!inputs.allowSignedOutWhenUsable || !inputs.entitlementResolved || inputs.signedIn) {
    return void 0;
  }
  if (inputs.hasModels) {
    return "resolved";
  }
  switch (inputs.download) {
    // A fetch in flight has nothing to ask for — the host drives its own
    // progress notification while it runs.
    case "downloading":
      return void 0;
    // A request we sent covers the gap before the host answers it, so standing
    // consent (or a click) never flashes the offer it has already satisfied.
    case "notDownloaded":
      return inputs.downloadRequested ? void 0 : "downloadOffered";
    case "ready":
      return "noAccount";
  }
}

function getAgentSdkSetupStateToReport(previous, state) {
  if (state === void 0 || state === previous || state === "resolved" && previous === void 0) {
    return void 0;
  }
  return state;
}

function setupMarkdown(value2) {
  return new MarkdownString(value2, { isTrusted: { enabledCommands: [AGENT_SDK_SETUP_OPEN_DOCS_COMMAND_ID, AGENT_SDK_SETUP_RELOAD_COMMAND_ID] } });
}

function noAccountDescription(setup2, displayName) {
  const name = escapeMarkdownSyntaxTokens(displayName);
  const provider = setup2.signInProviderName && escapeMarkdownSyntaxTokens(setup2.signInProviderName);
  const reload = createCommandUri(AGENT_SDK_SETUP_RELOAD_COMMAND_ID, setup2.agent).toString();
  const docs = setup2.setupDocsUrl ? createCommandUri(AGENT_SDK_SETUP_OPEN_DOCS_COMMAND_ID, setup2.agent).toString() : void 0;
  if (provider && docs) {
    return setupMarkdown(localize(8989, null, name, reload, provider, docs));
  }
  if (provider) {
    return setupMarkdown(localize(8991, null, name, reload, provider));
  }
  if (docs) {
    return setupMarkdown(localize(8990, null, name, reload, docs));
  }
  return setupMarkdown(localize(8988, null, name, reload));
}

function agentSdkSetupSessionType(agent) {
  return `${LOCAL_AGENT_HOST_SCHEME_PREFIX}${agent}`;
}

function getAgentDisplayNames(state) {
  const names = /* @__PURE__ */ new Map();
  if (!state || state instanceof Error) {
    return names;
  }
  for (const agent of state.agents ?? []) {
    if (agent.displayName) {
      names.set(agent.provider, agent.displayName);
    }
  }
  return names;
}

var AGENT_SDK_SETUP_NOTIFICATION_ID_PREFIX = "agentHost.sdkSetup.";

function agentSdkSetupNotificationId(agent) {
  return `${AGENT_SDK_SETUP_NOTIFICATION_ID_PREFIX}${agent}`;
}

function hasAgentSdkSetupNotification(chatInputNotificationService, sessionType) {
  return chatInputNotificationService.getActiveNotification(
    (notification) => notification.id.startsWith(AGENT_SDK_SETUP_NOTIFICATION_ID_PREFIX) && isChatInputNotificationApplicableToSessionType(notification, sessionType)
  ) !== void 0;
}

function createAgentSdkSetupNotification(setup2, displayName, state) {
  if (!displayName || state === void 0 || state === "resolved") {
    return void 0;
  }
  const base = {
    id: agentSdkSetupNotificationId(setup2.agent),
    severity: 0 /* Info */,
    dismissible: false,
    autoDismissOnMessage: false,
    sessionTypes: [agentSdkSetupSessionType(setup2.agent)]
  };
  const action = (label3, commandId) => ({
    kind: "command" /* Command */,
    label: label3,
    commandId,
    commandArgs: [setup2.agent],
    keepOpen: true
  });
  if (state === "downloadOffered") {
    return {
      ...base,
      message: localize(8983, null, displayName),
      description: localize(8985, null, displayName),
      actions: [action(localize(8984, null), AGENT_SDK_SETUP_DOWNLOAD_COMMAND_ID)]
    };
  }
  const actions = [];
  if (setup2.signInProviderName) {
    actions.push(action(localize(8992, null, setup2.signInProviderName), AGENT_SDK_SETUP_SIGN_IN_COMMAND_ID));
  }
  actions.push(action(localize(8986, null), AGENT_SDK_SETUP_GITHUB_SIGN_IN_COMMAND_ID));
  return {
    ...base,
    message: localize(8987, null, displayName),
    description: noAccountDescription(setup2, displayName),
    actions
  };
}

var AGENT_SDK_SETUP_DOWNLOAD_COMMAND_ID = "workbench.action.chat.agentHost.downloadAgentSdk";

var AGENT_SDK_SETUP_OPEN_DOCS_COMMAND_ID = "workbench.action.chat.agentHost.openAgentSetupDocs";

var AGENT_SDK_SETUP_RELOAD_COMMAND_ID = "workbench.action.chat.agentHost.reloadAgentConfiguration";

var AGENT_SDK_SETUP_GITHUB_SIGN_IN_COMMAND_ID = "workbench.action.chat.agentHost.signInToGitHubForAgent";

var AGENT_SDK_SETUP_SIGN_IN_COMMAND_ID = "workbench.action.chat.agentHost.signInToAgent";

function registerAgentSdkSetupCommand(id2, run) {
  CommandsRegistry.registerCommand(id2, (accessor, agent) => {
    if (typeof agent === "string") {
      run(accessor.get(IAgentSdkSetupService), agent);
    }
  });
}

registerAgentSdkSetupCommand(AGENT_SDK_SETUP_DOWNLOAD_COMMAND_ID, (setupService, agent) => setupService.requestDownload(agent));

registerAgentSdkSetupCommand(AGENT_SDK_SETUP_OPEN_DOCS_COMMAND_ID, (setupService, agent) => setupService.openSetupDocs(agent));

registerAgentSdkSetupCommand(AGENT_SDK_SETUP_RELOAD_COMMAND_ID, (setupService, agent) => setupService.requestReload(agent));

registerAgentSdkSetupCommand(AGENT_SDK_SETUP_GITHUB_SIGN_IN_COMMAND_ID, (setupService, agent) => setupService.signInToGitHub(agent));

registerAgentSdkSetupCommand(AGENT_SDK_SETUP_SIGN_IN_COMMAND_ID, (setupService, agent) => setupService.signIn(agent));

var AgentHostSdkSetupNotificationContribution = class extends Disposable {
  constructor(_chatInputNotificationService, _agentSdkSetupService, _defaultAccountService, _languageModelsService, _configurationService, _chatEntitlementService, _agentHostService) {
    super();
    this._chatInputNotificationService = _chatInputNotificationService;
    this._agentSdkSetupService = _agentSdkSetupService;
    this._defaultAccountService = _defaultAccountService;
    this._languageModelsService = _languageModelsService;
    this._configurationService = _configurationService;
    this._chatEntitlementService = _chatEntitlementService;
    this._agentHostService = _agentHostService;
    /** Pushed notification content by id, so an unchanged answer is not re-pushed (which would clear a dismissal and re-announce). */
    this._shown = /* @__PURE__ */ new Map();
    /** Last state reported per agent, so a re-render is not a second event. */
    this._lastReported = /* @__PURE__ */ new Map();
    this._register(Event2.any(
      this._agentSdkSetupService.onDidChangeSetups,
      this._chatEntitlementService.onDidChangeEntitlement,
      this._defaultAccountService.onDidChangeDefaultAccount,
      this._languageModelsService.onDidChangeLanguageModels,
      Event2.filter(this._configurationService.onDidChangeConfiguration, (event) => event.affectsConfiguration(AgentHostAllowSignedOutWhenUsableSettingId))
    )(() => this._update()));
    const rootStateListeners = this._register(new DisposableStore());
    const bindRootState = () => {
      rootStateListeners.clear();
      rootStateListeners.add(this._agentHostService.rootState.onDidChange(() => this._update()));
      this._update();
    };
    bindRootState();
    this._register(this._agentHostService.onAgentHostStart(bindRootState));
  }
  static {
    this.ID = "workbench.contrib.agentHostSdkSetupNotification";
  }
  _update() {
    const allowSignedOutWhenUsable = this._configurationService.getValue(AgentHostAllowSignedOutWhenUsableSettingId) === true;
    const entitlement = this._chatEntitlementService.entitlement;
    const entitlementResolved = entitlement !== 2 /* Unresolved */;
    const signedIn = this._defaultAccountService.currentDefaultAccount !== null || entitlementResolved && entitlement !== 1 /* Unknown */;
    const displayNames = getAgentDisplayNames(this._agentHostService.rootState.value);
    const stale = new Set(this._shown.keys());
    for (const setup2 of this._agentSdkSetupService.setups) {
      const displayName = displayNames.get(setup2.agent);
      if (!displayName) {
        continue;
      }
      const state = getAgentSdkSetupState({
        allowSignedOutWhenUsable,
        signedIn,
        entitlementResolved,
        download: setup2.download,
        downloadRequested: this._agentSdkSetupService.isDownloadPending(setup2.agent),
        hasModels: hasAnyModelTargetingSessionType(this._languageModelsService, agentSdkSetupSessionType(setup2.agent))
      });
      const toReport = getAgentSdkSetupStateToReport(this._lastReported.get(setup2.agent), state);
      if (toReport) {
        this._lastReported.set(setup2.agent, toReport);
        this._agentSdkSetupService.reportSetupState(setup2.agent, toReport);
      }
      const notification = createAgentSdkSetupNotification(setup2, displayName, state);
      if (!notification) {
        continue;
      }
      stale.delete(notification.id);
      const signature = JSON.stringify(notification);
      if (this._shown.get(notification.id) === signature) {
        continue;
      }
      this._shown.set(notification.id, signature);
      this._chatInputNotificationService.setNotification(notification);
    }
    for (const id2 of stale) {
      this._shown.delete(id2);
      this._chatInputNotificationService.deleteNotification(id2);
    }
  }
};

AgentHostSdkSetupNotificationContribution = __decorateClass([
  __decorateParam(0, IChatInputNotificationService),
  __decorateParam(1, IAgentSdkSetupService),
  __decorateParam(2, IDefaultAccountService),
  __decorateParam(3, ILanguageModelsService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IChatEntitlementService),
  __decorateParam(6, IAgentHostService)
], AgentHostSdkSetupNotificationContribution);
export { getAgentSdkSetupState, getAgentSdkSetupStateToReport, setupMarkdown, noAccountDescription, agentSdkSetupSessionType, getAgentDisplayNames, agentSdkSetupNotificationId, hasAgentSdkSetupNotification, createAgentSdkSetupNotification, registerAgentSdkSetupCommand, AGENT_SDK_SETUP_NOTIFICATION_ID_PREFIX, AGENT_SDK_SETUP_DOWNLOAD_COMMAND_ID, AGENT_SDK_SETUP_OPEN_DOCS_COMMAND_ID, AGENT_SDK_SETUP_RELOAD_COMMAND_ID, AGENT_SDK_SETUP_GITHUB_SIGN_IN_COMMAND_ID, AGENT_SDK_SETUP_SIGN_IN_COMMAND_ID, AgentHostSdkSetupNotificationContribution };
