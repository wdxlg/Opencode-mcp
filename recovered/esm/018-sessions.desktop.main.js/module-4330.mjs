// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentMergeActions.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { IsSessionsWindowContext } from "./module-0950.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { SessionAgentMergeEnabledContext, SessionHasOpenPullRequestContext, SessionIsArchivedContext, SessionPrimaryPullRequestOperationContext, SessionProviderIdContext } from "./module-1770.mjs";
import { ANY_AGENT_HOST_PROVIDER_RE, isAgentHostProvider } from "./module-1764.mjs";
import { AGENT_MERGE_SETTING_TAG, AgentMergeSettingId, agentMergeMergePullRequestValues, defaultAgentMergeConfiguration, isAgentMergeMergePullRequest, resolveAgentMergeConfiguration } from "./module-2466.mjs";
import { AgentHostPullRequestOperationId } from "./module-3734.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { ILogService } from "./module-0095.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { Action2, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { Menus } from "./module-3437.mjs";
import { Codicon } from "./module-0085.mjs";
import { CHANGES_OPERATIONS_DROPDOWN_PRIMARY_GROUP } from "./module-3737.mjs";
import { IPreferencesService } from "./module-1293.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ThemeIcon } from "./module-0086.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentMergeActions.ts
var agentMergeCommandPrecondition = ContextKeyExpr.and(
  IsSessionsWindowContext,
  ChatContextKeys.enabled,
  ContextKeyExpr.regex(SessionProviderIdContext.key, ANY_AGENT_HOST_PROVIDER_RE),
  SessionIsArchivedContext.negate(),
  ContextKeyExpr.equals(`config.${AgentMergeSettingId.Enabled}`, true)
);

var agentMergeHasPullRequest = ContextKeyExpr.or(
  SessionHasOpenPullRequestContext,
  ...Object.values(AgentHostPullRequestOperationId).map((id2) => ContextKeyExpr.equals(SessionPrimaryPullRequestOperationContext.key, id2))
);

var agentMergeMenuPrecondition = ContextKeyExpr.and(agentMergeCommandPrecondition, agentMergeHasPullRequest);

var agentMergeOwnsPrimaryButton = ContextKeyExpr.or(
  ContextKeyExpr.equals(SessionPrimaryPullRequestOperationContext.key, AgentHostPullRequestOperationId.EnableAutoMerge),
  ContextKeyExpr.equals(SessionPrimaryPullRequestOperationContext.key, AgentHostPullRequestOperationId.DisableAutoMerge),
  ContextKeyExpr.and(SessionHasOpenPullRequestContext, ContextKeyExpr.equals(SessionPrimaryPullRequestOperationContext.key, ""))
);

var AgentMergeSessionActionContexts = {
  addressReviews: new RawContextKey("sessionAgentMergeAddressReviews", false, { type: "boolean", description: localize(4999, null) }),
  fixCI: new RawContextKey("sessionAgentMergeFixCI", false, { type: "boolean", description: localize(5000, null) }),
  resolveConflicts: new RawContextKey("sessionAgentMergeResolveConflicts", false, { type: "boolean", description: localize(5002, null) })
};

var AgentMergeSessionMergePullRequestContext = new RawContextKey("sessionAgentMergeMergePullRequest", "never", {
  type: "string",
  description: localize(5001, null)
});

var agentMergeActionLabels = {
  addressReviews: localize(4975, null),
  fixCI: localize(4976, null),
  resolveConflicts: localize(4979, null)
};

var agentMergeRepairActions = Object.keys(agentMergeActionLabels);

var agentMergeMergePullRequestLabels = {
  always: localize(4990, null),
  ifUnchanged: localize(4992, null),
  never: localize(4994, null)
};

var agentMergeMergePullRequestDescriptions = {
  always: localize(4991, null),
  ifUnchanged: localize(4993, null),
  never: localize(4995, null)
};

var AgentMergeContextContribution = class extends Disposable {
  static {
    this.ID = "sessions.contrib.agentMergeContext";
  }
  constructor(contextKeyService, configurationService, sessionsService, sessionsProvidersService, logService) {
    super();
    const enabledKey = SessionAgentMergeEnabledContext.bindTo(contextKeyService);
    const actionKeys = new Map(agentMergeRepairActions.map((action) => [action, AgentMergeSessionActionContexts[action].bindTo(contextKeyService)]));
    const mergePullRequestKey = AgentMergeSessionMergePullRequestContext.bindTo(contextKeyService);
    const providerListener = this._register(new MutableDisposable());
    const configurationListener = this._register(new MutableDisposable());
    let lastLogged;
    this._register(autorun((reader) => {
      const session = sessionsService.activeSession.read(reader);
      const provider = session && sessionsProvidersService.getProvider(session.providerId);
      const agentHostProvider = provider && isAgentHostProvider(provider) ? provider : void 0;
      const update = () => {
        const state = session && agentHostProvider ? agentHostProvider.getAgentMergeSessionState(session.sessionId) : void 0;
        enabledKey.set(state?.enabled === true);
        const effective = resolveAgentMergeConfiguration(getGlobalConfiguration(configurationService), state?.overrides);
        for (const [action, key3] of actionKeys) {
          key3.set(effective[action]);
        }
        mergePullRequestKey.set(effective.mergePullRequest);
        const authorized = agentMergeRepairActions.filter((action) => effective[action]);
        const signature = `${session?.sessionId ?? "none"}|${state?.enabled === true}|${authorized.join(",")}|${effective.mergePullRequest}`;
        if (lastLogged !== signature) {
          lastLogged = signature;
          logService.info(`[AgentMergeActions] Session state: session=${session?.sessionId ?? "none"}, enabled=${state?.enabled === true}, authorizedActions=[${authorized.join(", ") || "none"}], mergePullRequest=${effective.mergePullRequest}`);
        }
      };
      providerListener.value = agentHostProvider?.onDidChangeSessionConfig((changed) => {
        if (changed === session?.sessionId) {
          update();
        }
      });
      configurationListener.value = configurationService.onDidChangeConfiguration((event) => {
        if (Object.values(AgentMergeSettingId).some((settingId) => event.affectsConfiguration(settingId))) {
          update();
        }
      });
      update();
    }));
  }
};

AgentMergeContextContribution = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ISessionsService),
  __decorateParam(3, ISessionsProvidersService),
  __decorateParam(4, ILogService)
], AgentMergeContextContribution);

registerWorkbenchContribution2(AgentMergeContextContribution.ID, AgentMergeContextContribution, WorkbenchPhase.AfterRestored);

var AgentMergeActionBase = class extends Action2 {
  getActiveSession(accessor) {
    const session = accessor.get(ISessionsService).activeSession.get();
    const provider = session && accessor.get(ISessionsProvidersService).getProvider(session.providerId);
    return session && provider && isAgentHostProvider(provider) ? { session, provider } : void 0;
  }
  /**
   * Writes the session's overrides with every value the user could see,
   * not just the changed one, so the session keeps what was on screen rather
   * than silently picking up a later change to the global defaults.
   */
  async updateOverrides(accessor, patch2) {
    const active = this.getActiveSession(accessor);
    if (!active) {
      return;
    }
    const configurationService = accessor.get(IConfigurationService);
    const logService = accessor.get(ILogService);
    const state = active.provider.getAgentMergeSessionState(active.session.sessionId);
    const effective = resolveAgentMergeConfiguration(getGlobalConfiguration(configurationService), state?.overrides);
    const overrides = {
      addressReviews: effective.addressReviews,
      fixCI: effective.fixCI,
      resolveConflicts: effective.resolveConflicts,
      mergePullRequest: effective.mergePullRequest,
      ...patch2
    };
    await active.provider.setAgentMergeOverrides(active.session.sessionId, overrides);
    logService.info(`[AgentMergeActions] Overrides updated: session=${active.session.sessionId}, change=${JSON.stringify(patch2)}`);
  }
};

MenuRegistry.appendMenuItem(Menus.ChangesOperationsDropdown, {
  submenu: Menus.ChangesAgentMerge,
  title: localize2(4998, "Agent Merge"),
  // The same icon Agent Merge wears elsewhere, and the one the auto-merge
  // operations it stands in for carried on this button.
  icon: Codicon.gitMerge,
  group: CHANGES_OPERATIONS_DROPDOWN_PRIMARY_GROUP,
  order: 1,
  when: ContextKeyExpr.and(agentMergeMenuPrecondition, agentMergeOwnsPrimaryButton)
});

var agentMergeMenus = [Menus.ChangesOperationsDropdown, Menus.ChangesAgentMerge];

registerAction2(class EnableAgentMergeInSessionAction extends AgentMergeActionBase {
  constructor() {
    super({
      id: "sessions.agentHost.agentMerge.enableInSession",
      // Deliberately not a toggle: the label already says which way it
      // goes, so a check mark next to "Enable" would only be ambiguous.
      title: localize2(4989, "Enable Agent Merge"),
      f1: false,
      menu: agentMergeMenus.map((id2) => ({
        id: id2,
        group: "1_agentMerge",
        order: 1,
        when: ContextKeyExpr.and(agentMergeMenuPrecondition, SessionAgentMergeEnabledContext.negate())
      }))
    });
  }
  async run(accessor) {
    const active = this.getActiveSession(accessor);
    const logService = accessor.get(ILogService);
    if (!active) {
      return;
    }
    await active.provider.setAgentMergeEnabled(active.session.sessionId, true);
    logService.info(`[AgentMergeActions] Enabled from the title bar: session=${active.session.sessionId}`);
  }
});

registerAction2(class DisableAgentMergeInSessionAction extends AgentMergeActionBase {
  constructor() {
    super({
      id: "sessions.agentHost.agentMerge.disableInSession",
      title: localize2(4986, "Disable Agent Merge"),
      f1: false,
      menu: agentMergeMenus.map((id2) => ({
        id: id2,
        group: "1_agentMerge",
        order: 1,
        when: ContextKeyExpr.and(agentMergeMenuPrecondition, SessionAgentMergeEnabledContext)
      }))
    });
  }
  async run(accessor) {
    const active = this.getActiveSession(accessor);
    const logService = accessor.get(ILogService);
    if (!active) {
      return;
    }
    await active.provider.setAgentMergeEnabled(active.session.sessionId, false);
    logService.info(`[AgentMergeActions] Disabled from the title bar: session=${active.session.sessionId}`);
  }
});

for (const [index2, action] of agentMergeRepairActions.entries()) {
  registerAction2(class ToggleAgentMergeRepairAction extends AgentMergeActionBase {
    constructor() {
      super({
        id: `sessions.agentHost.agentMerge.toggle.${action}`,
        title: { value: agentMergeActionLabels[action], original: agentMergeActionLabels[action] },
        toggled: AgentMergeSessionActionContexts[action],
        f1: false,
        menu: agentMergeMenus.map((id2) => ({
          id: id2,
          group: "2_agentMergeActions",
          order: index2,
          when: agentMergeMenuPrecondition
        }))
      });
    }
    async run(accessor) {
      const active = this.getActiveSession(accessor);
      if (!active) {
        return;
      }
      const state = active.provider.getAgentMergeSessionState(active.session.sessionId);
      const effective = resolveAgentMergeConfiguration(getGlobalConfiguration(accessor.get(IConfigurationService)), state?.overrides);
      await this.updateOverrides(accessor, { [action]: !effective[action] });
    }
  });
}

for (const value2 of agentMergeMergePullRequestValues) {
  MenuRegistry.appendMenuItem(Menus.ChangesOperationsDropdown, mergePullRequestSubmenuItem(value2));
  MenuRegistry.appendMenuItem(Menus.ChangesAgentMerge, mergePullRequestSubmenuItem(value2));
}

function mergePullRequestSubmenuItem(value2) {
  const title = localize(4996, null, agentMergeMergePullRequestLabels[value2]);
  return {
    submenu: Menus.ChangesAgentMergeMergePullRequest,
    title: { value: title, original: title },
    group: "2_agentMergeActions",
    order: agentMergeRepairActions.length,
    when: ContextKeyExpr.and(agentMergeMenuPrecondition, AgentMergeSessionMergePullRequestContext.isEqualTo(value2))
  };
}

for (const [index2, value2] of agentMergeMergePullRequestValues.entries()) {
  registerAction2(class SetAgentMergeMergePullRequestAction extends AgentMergeActionBase {
    constructor() {
      super({
        id: `sessions.agentHost.agentMerge.mergePullRequest.${value2}`,
        title: { value: agentMergeMergePullRequestLabels[value2], original: agentMergeMergePullRequestLabels[value2] },
        tooltip: agentMergeMergePullRequestDescriptions[value2],
        toggled: AgentMergeSessionMergePullRequestContext.isEqualTo(value2),
        f1: false,
        menu: [{
          id: Menus.ChangesAgentMergeMergePullRequest,
          group: "navigation",
          order: index2
        }]
      });
    }
    async run(accessor) {
      await this.updateOverrides(accessor, { mergePullRequest: value2 });
    }
  });
}

registerAction2(class OpenAgentMergeDefaultsAction extends Action2 {
  constructor() {
    super({
      id: "sessions.agentHost.agentMerge.openDefaults",
      title: localize2(4997, "Agent Merge Defaults"),
      f1: false,
      menu: agentMergeMenus.map((id2) => ({
        id: id2,
        group: "3_agentMergeDefaults",
        order: 1,
        when: agentMergeMenuPrecondition
      }))
    });
  }
  async run(accessor) {
    const preferencesService = accessor.get(IPreferencesService);
    const logService = accessor.get(ILogService);
    await preferencesService.openSettings({ jsonEditor: false, query: `@tag:${AGENT_MERGE_SETTING_TAG}` });
    logService.trace(`[AgentMergeActions] Opened Agent Merge defaults in the settings editor`);
  }
});

registerAction2(class EnableAgentMergeAction extends AgentMergeActionBase {
  constructor() {
    super({
      id: "sessions.agentHost.agentMerge.enable",
      title: localize2(4987, "Enable Agent Merge for Active Session"),
      f1: true,
      precondition: ContextKeyExpr.and(agentMergeCommandPrecondition, SessionAgentMergeEnabledContext.negate())
    });
  }
  async run(accessor) {
    const active = this.getActiveSession(accessor);
    if (!active) {
      return;
    }
    const logService = accessor.get(ILogService);
    const notificationService = accessor.get(INotificationService);
    await active.provider.setAgentMergeEnabled(active.session.sessionId, true);
    logService.info(`[AgentMergeActions] Enable requested: session=${active.session.sessionId}, provider=${active.session.providerId}`);
    notificationService.info(localize(4988, null));
  }
});

registerAction2(class DisableAgentMergeAction extends AgentMergeActionBase {
  constructor() {
    super({
      id: "sessions.agentHost.agentMerge.disable",
      title: localize2(4984, "Disable Agent Merge for Active Session"),
      f1: true,
      precondition: ContextKeyExpr.and(agentMergeCommandPrecondition, SessionAgentMergeEnabledContext)
    });
  }
  async run(accessor) {
    const active = this.getActiveSession(accessor);
    if (!active) {
      return;
    }
    const logService = accessor.get(ILogService);
    const notificationService = accessor.get(INotificationService);
    await active.provider.setAgentMergeEnabled(active.session.sessionId, false);
    logService.info(`[AgentMergeActions] Disable requested: session=${active.session.sessionId}, provider=${active.session.providerId}`);
    notificationService.info(localize(4985, null));
  }
});

registerAction2(class ConfigureAgentMergeAction extends AgentMergeActionBase {
  constructor() {
    super({
      id: "sessions.agentHost.agentMerge.configure",
      title: localize2(4983, "Configure Agent Merge for Active Session"),
      f1: true,
      precondition: agentMergeCommandPrecondition
    });
  }
  async run(accessor) {
    const active = this.getActiveSession(accessor);
    if (!active) {
      return;
    }
    const configurationService = accessor.get(IConfigurationService);
    const quickInputService = accessor.get(IQuickInputService);
    const logService = accessor.get(ILogService);
    const notificationService = accessor.get(INotificationService);
    const defaults = getGlobalConfiguration(configurationService);
    const current = active.provider.getAgentMergeSessionState(active.session.sessionId);
    const effective = resolveAgentMergeConfiguration(defaults, current?.overrides);
    const picks = agentMergeRepairActions.map((action) => ({
      action,
      label: agentMergeActionLabels[action],
      picked: effective[action]
    }));
    const result = await pickAgentMergeActions(quickInputService, picks);
    if (!result) {
      return;
    }
    const overrides = result.reset ? void 0 : toOverrides(result.actions, effective.mergePullRequest);
    await active.provider.setAgentMergeOverrides(active.session.sessionId, overrides);
    logService.info(`[AgentMergeActions] Action overrides updated: session=${active.session.sessionId}, provider=${active.session.providerId}, reset=${result.reset}, enabledActions=${[...result.actions].sort().join(",") || "none"}`);
    notificationService.info(result.reset ? localize(4978, null) : localize(4982, null));
  }
});

function pickAgentMergeActions(quickInputService, picks) {
  const store = new DisposableStore();
  return new Promise((resolve3) => {
    const quickPick = store.add(quickInputService.createQuickPick());
    quickPick.title = localize(4981, null);
    quickPick.placeholder = localize(4980, null);
    quickPick.canSelectMany = true;
    quickPick.items = picks;
    quickPick.selectedItems = picks.filter((pick) => pick.picked);
    quickPick.buttons = [{
      iconClass: ThemeIcon.asClassName(Codicon.discard),
      tooltip: localize(4977, null)
    }];
    store.add(quickPick.onDidTriggerButton(() => {
      resolve3({ reset: true, actions: /* @__PURE__ */ new Set() });
      quickPick.hide();
    }));
    store.add(quickPick.onDidAccept(() => {
      resolve3({ reset: false, actions: new Set(quickPick.selectedItems.map((item) => item.action)) });
      quickPick.hide();
    }));
    store.add(quickPick.onDidHide(() => {
      resolve3(void 0);
      store.dispose();
    }));
    quickPick.show();
  });
}

function getGlobalConfiguration(configurationService) {
  const mergePullRequest = configurationService.getValue(AgentMergeSettingId.MergePullRequest);
  return {
    addressReviews: configurationService.getValue(AgentMergeSettingId.AddressReviews) ?? defaultAgentMergeConfiguration.addressReviews,
    fixCI: configurationService.getValue(AgentMergeSettingId.FixCI) ?? defaultAgentMergeConfiguration.fixCI,
    resolveConflicts: configurationService.getValue(AgentMergeSettingId.ResolveConflicts) ?? defaultAgentMergeConfiguration.resolveConflicts,
    // Tolerates the retired boolean form so a profile that has not run the
    // settings migration yet still shows the right entry as selected.
    mergePullRequest: isAgentMergeMergePullRequest(mergePullRequest) ? mergePullRequest : typeof mergePullRequest === "boolean" ? mergePullRequest ? "always" : "never" : defaultAgentMergeConfiguration.mergePullRequest,
    mergeMethod: configurationService.getValue(AgentMergeSettingId.MergeMethod) ?? defaultAgentMergeConfiguration.mergeMethod,
    replyAttribution: configurationService.getValue(AgentMergeSettingId.ReplyAttribution) ?? defaultAgentMergeConfiguration.replyAttribution
  };
}

function toOverrides(selected, mergePullRequest) {
  const overrides = { mergePullRequest };
  for (const action of agentMergeRepairActions) {
    overrides[action] = selected.has(action);
  }
  return overrides;
}
export { mergePullRequestSubmenuItem, pickAgentMergeActions, getGlobalConfiguration, toOverrides, agentMergeCommandPrecondition, agentMergeHasPullRequest, agentMergeMenuPrecondition, agentMergeOwnsPrimaryButton, AgentMergeSessionActionContexts, AgentMergeSessionMergePullRequestContext, agentMergeActionLabels, agentMergeRepairActions, agentMergeMergePullRequestLabels, agentMergeMergePullRequestDescriptions, AgentMergeContextContribution, AgentMergeActionBase, agentMergeMenus };
