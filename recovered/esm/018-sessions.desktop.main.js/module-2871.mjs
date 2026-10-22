// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/browser/mcpCommands.ts
import { Action2, MenuId, MenuItemAction, MenuRegistry } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { mcpAutoStartConfig } from "./module-1196.mjs";
import { McpContextKeys } from "./module-2851.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IAgentHostCustomizationService } from "./module-1763.mjs";
import { HasInstalledMcpServersContext, IMcpSamplingService, IMcpService, InstalledMcpServersViewId, McpConnectionState, McpStartServerInteraction, mcpOAuthClientSecretStorageKey, mcpPromptPrefix } from "./module-1206.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { INotificationService } from "./module-0336.mjs";
import { ILogService } from "./module-0095.mjs";
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { groupBy } from "./module-0003.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { isContributionDisabled } from "./module-1019.mjs";
import { getCustomizationScopeEnablement } from "./module-1742.mjs";
import { IAICustomizationWorkspaceService } from "./module-0996.mjs";
import { IAgentPluginService } from "./module-1017.mjs";
import { hasKey, isDefined } from "./module-0010.mjs";
import { setAgentHostPluginEnablement } from "./module-2633.mjs";
import { ILanguageModelToolsService } from "./module-0991.mjs";
import { assertNever } from "./module-0009.mjs";
import { IMcpRegistry } from "./module-1446.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IAuthenticationQueryService } from "./module-1696.mjs";
import { IAuthenticationService } from "./module-0952.mjs";
import { URI } from "./module-0032.mjs";
import { observableValue } from "./module-0048.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { derived } from "./module-0054.mjs";
import { derivedObservableWithCache } from "./module-0059.mjs";
import { MenuEntryActionViewItem } from "./module-0516.mjs";
import { $, EventType, addDisposableListener, disposableWindowInterval } from "./module-0075.mjs";
import { findLast } from "./module-0006.mjs";
import { MarkdownString, createMarkdownCommandLink } from "./module-0462.mjs";
import { mainWindow } from "./module-0002.mjs";
import { renderMarkdown } from "./module-0468.mjs";
import { Checkbox } from "./module-0549.mjs";
import { defaultCheckboxStyles } from "./module-0513.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ActiveEditorContext, RemoteNameContext, ResourceContextKey, WorkbenchStateContext, WorkspaceFolderCountContext } from "./module-0950.mjs";
import { TEXT_FILE_EDITOR_ID } from "./module-1534.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { McpAddConfigurationCommand, McpInstallFromManifestCommand } from "./module-2469.mjs";
import { ISecretStorageService } from "./module-0949.mjs";
import { startServerAndWaitForLiveTools } from "./module-2174.mjs";
import { IExtensionsWorkbenchService, VIEWLET_ID, extensionsFilterSubMenu } from "./module-1023.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IFileService } from "./module-0269.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { IRemoteUserDataProfilesService } from "./module-1203.mjs";
import { PICK_WORKSPACE_FOLDER_COMMAND_ID } from "./module-1513.mjs";
import { MCP_CONFIGURATION_KEY, WORKSPACE_STANDALONE_CONFIGURATIONS } from "./module-1198.mjs";
import { McpResourceQuickAccess, McpResourceQuickPick } from "./module-2869.mjs";
import { ILanguageModelsService } from "./module-0968.mjs";
import { openPanelChatAndGetWidget } from "./module-2868.mjs";
import { Range2 } from "./module-0106.mjs";
import { SuggestController } from "./module-0758.mjs";


// src/vs/workbench/contrib/mcp/browser/mcpCommands.ts
var category3 = {
  original: "MCP",
  value: "MCP"
};

var ListMcpServerCommand = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.listServer" /* ListServer */,
      title: localize2(16824, "List Servers"),
      icon: Codicon.server,
      category: category3,
      f1: true,
      precondition: ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate()),
      menu: [{
        when: ContextKeyExpr.and(
          ContextKeyExpr.or(
            ContextKeyExpr.and(ContextKeyExpr.equals(`config.${mcpAutoStartConfig}`, "never" /* Never */), McpContextKeys.hasUnknownTools),
            McpContextKeys.hasServersWithErrors
          ),
          ChatContextKeys.chatModeKind.isEqualTo("agent" /* Agent */),
          ChatContextKeys.lockedToCodingAgent.negate(),
          ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate())
        ),
        id: MenuId.ChatInput,
        group: "navigation",
        order: 101
      }]
    });
  }
  async run(accessor) {
    const services = {
      chatWidgetService: accessor.get(IChatWidgetService),
      agentHostCustomizations: accessor.get(IAgentHostCustomizationService),
      mcpService: accessor.get(IMcpService),
      commandService: accessor.get(ICommandService),
      quickInput: accessor.get(IQuickInputService),
      notificationService: accessor.get(INotificationService),
      logService: accessor.get(ILogService)
    };
    return this._runWithMode(services, void 0);
  }
  async _runWithMode(services, initialMode) {
    let mode = initialMode;
    if (mode === void 0) {
      const sessionResource = services.chatWidgetService.lastFocusedWidget?.viewModel?.sessionResource;
      const hasAgentHostMcp = sessionResource && services.agentHostCustomizations.getMcpServers(sessionResource).length > 0;
      mode = hasAgentHostMcp ? { agentHostSession: sessionResource } : "local";
    }
    if (mode === "local") {
      await this._runLocal(services);
      return;
    }
    const nextMode = await this._runAgentHost(services, mode.agentHostSession);
    if (nextMode === "local") {
      await this._runWithMode(services, "local");
    }
  }
  async _runLocal(services) {
    const { mcpService, commandService, quickInput } = services;
    const store = new DisposableStore();
    const pick = quickInput.createQuickPick({ useSeparators: true });
    pick.placeholder = localize(16838, null);
    mcpService.activateCollections();
    store.add(pick);
    store.add(autorun((reader) => {
      const servers = groupBy(mcpService.servers.read(reader).slice().sort((a, b) => a.collection.order - b.collection.order), (s) => s.collection.id);
      const firstRun = pick.items.length === 0;
      const previousActiveId = pick.activeItems[0]?.id;
      pick.items = [
        { id: "$add", label: localize(16775, null), description: localize(16776, null), alwaysShow: true, iconClass: ThemeIcon.asClassName(Codicon.add) },
        ...Object.values(servers).filter((s) => s.length).flatMap((servers2) => [
          { type: "separator", label: servers2[0].collection.label, id: servers2[0].collection.id },
          ...servers2.map((server) => {
            const disabled = isContributionDisabled(server.enablement.read(reader));
            return {
              id: server.definition.id,
              label: server.definition.label,
              description: disabled ? localize(16816, null) : McpConnectionState.toString(server.connectionState.read(reader))
            };
          })
        ])
      ];
      if (previousActiveId) {
        const previousItem = pick.items.find((item) => !("type" in item) && item.id === previousActiveId);
        if (previousItem) {
          pick.activeItems = [previousItem];
          return;
        }
      }
      if (firstRun && pick.items.length > 3) {
        pick.activeItems = pick.items.slice(2, 3);
      }
    }));
    const picked = await new Promise((resolve3) => {
      store.add(pick.onDidAccept(() => {
        resolve3(pick.activeItems[0]);
      }));
      store.add(pick.onDidHide(() => {
        resolve3(void 0);
      }));
      pick.show();
    });
    store.dispose();
    if (!picked) {
    } else if (picked.id === "$add") {
      commandService.executeCommand("workbench.mcp.addConfiguration" /* AddConfiguration */);
    } else {
      commandService.executeCommand("workbench.mcp.serverOptions" /* ServerOptions */, picked.id);
    }
  }
  async _runAgentHost(services, agentHostSession) {
    const { agentHostCustomizations, commandService, quickInput } = services;
    const BACK_ID = "$back";
    const store = new DisposableStore();
    const pick = quickInput.createQuickPick({ useSeparators: true });
    pick.placeholder = localize(16837, null);
    store.add(pick);
    const refresh = () => {
      const firstRun = pick.items.length === 0;
      const previousActiveId = pick.activeItems[0]?.id;
      const servers = agentHostCustomizations.getMcpServers(agentHostSession);
      pick.items = [
        ...servers.length === 0 ? [{
          id: "$empty",
          label: localize(16785, null),
          description: localize(16786, null),
          alwaysShow: true
        }] : servers.map((server) => ({
          id: server.id,
          server,
          label: server.name,
          description: server.enabled ? mcpServerStatusToLabel(server.status) : localize(16816, null),
          buttons: getAgentHostMcpServerButtons(server)
        })),
        { type: "separator" },
        {
          id: BACK_ID,
          label: localize(16788, null),
          iconClass: ThemeIcon.asClassName(Codicon.arrowLeft),
          alwaysShow: true
        }
      ];
      if (previousActiveId) {
        const previousItem = pick.items.find((item) => !("type" in item) && item.id === previousActiveId);
        if (previousItem) {
          pick.activeItems = [previousItem];
          return;
        }
      }
      if (firstRun && servers.length > 0) {
        pick.activeItems = [pick.items[0]];
      }
    };
    refresh();
    store.add(agentHostCustomizations.onDidChangeCustomizations(() => refresh()));
    store.add(pick.onDidTriggerItemButton(async (event) => {
      if (!isAgentHostMcpServerButton(event.button) || !event.item.server) {
        return;
      }
      pick.busy = true;
      try {
        await runAgentHostMcpServerLifecycleAction(event.item.server, event.button.action, services);
        refresh();
      } finally {
        pick.busy = false;
      }
    }));
    const picked = await new Promise((resolve3) => {
      store.add(pick.onDidAccept(() => {
        resolve3(pick.activeItems[0]);
      }));
      store.add(pick.onDidHide(() => {
        resolve3(void 0);
      }));
      pick.show();
    });
    store.dispose();
    if (!picked || picked.id === "$empty") {
      return void 0;
    }
    if (picked.id === BACK_ID) {
      return "local";
    }
    await commandService.executeCommand("workbench.mcp.agentHostServerOptions" /* AgentHostServerOptions */, agentHostSession, picked.id);
    return void 0;
  }
};

function isAgentHostMcpServerButton(button) {
  return "action" in button && (button.action === "start" || button.action === "stop");
}

var startAgentHostMcpServerButton = {
  iconClass: ThemeIcon.asClassName(Codicon.play),
  tooltip: localize(16853, null),
  action: "start"
};

var stopAgentHostMcpServerButton = {
  iconClass: ThemeIcon.asClassName(Codicon.debugStop),
  tooltip: localize(16855, null),
  action: "stop"
};

function getAgentHostMcpServerButtons(server) {
  if (canStartAgentHostMcpServer(server)) {
    return [startAgentHostMcpServerButton];
  }
  if (canStopAgentHostMcpServer(server)) {
    return [stopAgentHostMcpServerButton];
  }
  return [];
}

function canStartAgentHostMcpServer(server) {
  return server.enabled && (server.status === "stopped" /* Stopped */ || server.status === "error" /* Error */);
}

function canStopAgentHostMcpServer(server) {
  return server.enabled && (server.status === "starting" /* Starting */ || server.status === "ready" /* Ready */ || server.status === "authRequired" /* AuthRequired */);
}

async function runAgentHostMcpServerLifecycleAction(server, action, services) {
  try {
    if (action === "start" && canStartAgentHostMcpServer(server)) {
      await server.start();
    } else if (action === "stop" && canStopAgentHostMcpServer(server)) {
      await server.stop();
    }
  } catch (error) {
    services.logService.error(`Failed to ${action} MCP server '${server.name}'`, error);
    const message = error instanceof Error ? error.message : String(error);
    services.notificationService.error(action === "start" ? localize(16789, null, server.name, message) : localize(16795, null, server.name, message));
  }
}

function mcpServerStatusToLabel(status2) {
  switch (status2) {
    case "starting" /* Starting */:
      return localize(16793, null);
    case "ready" /* Ready */:
      return localize(16792, null);
    case "authRequired" /* AuthRequired */:
      return localize(16790, null);
    case "error" /* Error */:
      return localize(16791, null);
    case "stopped" /* Stopped */:
      return localize(16794, null);
    default:
      return "";
  }
}

function getAgentHostMcpServerEnablementItems(server, hasWorkspace, scopes = ["global", "workspace", "session"]) {
  const enablement = getCustomizationScopeEnablement(server);
  const items = [];
  if (scopes.includes("global")) {
    items.push({
      label: enablement.global ? localize(16778, null) : localize(16781, null),
      action: enablement.global ? "disableProfile" : "enableProfile"
    });
  }
  if (scopes.includes("workspace") && hasWorkspace) {
    items.push({
      label: enablement.workspace ? localize(16780, null) : localize(16784, null),
      action: enablement.workspace ? "disableWorkspace" : "enableWorkspace"
    });
  }
  if (scopes.includes("session")) {
    items.push({
      label: enablement.session ? localize(16779, null) : localize(16783, null),
      action: enablement.session ? "disableSession" : "enableSession"
    });
  }
  return items;
}

function getLocalMcpServerEnablementItems(disabled, isEmptyWorkbench, includeWorkspace = true) {
  const items = [];
  if (disabled) {
    items.push({ label: localize(16781, null), action: "enableProfile" });
    if (includeWorkspace && !isEmptyWorkbench) {
      items.push({ label: localize(16784, null), action: "enableWorkspace" });
    }
  } else {
    items.push({ label: localize(16778, null), action: "disableProfile" });
    if (includeWorkspace && !isEmptyWorkbench) {
      items.push({ label: localize(16780, null), action: "disableWorkspace" });
    }
  }
  return items;
}

function enablementStateForAction(action) {
  switch (action) {
    case "enableProfile":
      return 2 /* EnabledProfile */;
    case "disableProfile":
      return 0 /* DisabledProfile */;
    case "enableWorkspace":
      return 3 /* EnabledWorkspace */;
    case "disableWorkspace":
      return 1 /* DisabledWorkspace */;
  }
}

function findLocalMcpServer(mcpService, server) {
  const servers = mcpService.servers.get();
  const separator2 = server.id.indexOf("/");
  const rawId = separator2 >= 0 ? server.id.slice(separator2 + 1) : server.id;
  const idMatches = servers.filter((candidate) => candidate.definition.id === rawId);
  if (idMatches.length === 1) {
    return idMatches[0];
  }
  const nameMatches = servers.filter((candidate) => candidate.definition.label === server.name);
  return nameMatches.length === 1 ? nameMatches[0] : void 0;
}

var McpAgentHostServerOptionsCommand = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.agentHostServerOptions" /* AgentHostServerOptions */,
      title: localize2(16796, "Agent Host Server Options"),
      category: category3,
      f1: false
    });
  }
  async run(accessor, agentHostSession, customizationId2) {
    const agentHostCustomizations = accessor.get(IAgentHostCustomizationService);
    const quickInputService = accessor.get(IQuickInputService);
    const notificationService = accessor.get(INotificationService);
    const logService = accessor.get(ILogService);
    const aiCustomizationWorkspaceService = accessor.get(IAICustomizationWorkspaceService);
    const agentPluginService = accessor.get(IAgentPluginService);
    const mcpService = accessor.get(IMcpService);
    const server = agentHostCustomizations.getMcpServers(agentHostSession).find((s) => s.id === customizationId2);
    if (!server) {
      return;
    }
    const items = [
      { type: "separator", label: localize(16772, null) }
    ];
    if (canStartAgentHostMcpServer(server)) {
      items.push({
        label: localize(16853, null),
        description: mcpServerStatusToLabel(server.status),
        action: "start"
      });
    } else if (canStopAgentHostMcpServer(server)) {
      items.push({
        label: localize(16855, null),
        description: mcpServerStatusToLabel(server.status),
        action: "stop"
      });
    }
    const pluginDisabled = server.disabledReason?.source === "plugin";
    const localServer = findLocalMcpServer(mcpService, server);
    const durableProfileDisabled = localServer !== void 0 && !mcpService.enablementModel.readProfileEnabled(localServer.definition.id);
    const isEmptyWorkbench = aiCustomizationWorkspaceService.getActiveProjectRoot() === void 0;
    items.push({ type: "separator", label: localize(16769, null) });
    if (pluginDisabled) {
      items.push({
        label: localize(16782, null),
        action: "enablePlugin"
      });
    } else {
      items.push(
        ...localServer ? [
          ...getLocalMcpServerEnablementItems(durableProfileDisabled, isEmptyWorkbench, false),
          ...getAgentHostMcpServerEnablementItems(server, agentHostCustomizations.getWorkingDirectories(agentHostSession).length > 0, ["workspace", "session"])
        ] : getAgentHostMcpServerEnablementItems(server, agentHostCustomizations.getWorkingDirectories(agentHostSession).length > 0)
      );
    }
    if (server.enabled && server.state.kind === "authRequired" /* AuthRequired */) {
      items.push({
        label: localize(16777, null),
        description: server.state.resource.resource,
        action: "authenticate"
      });
    }
    items.push({
      label: localize(16849, null),
      action: "showOutput"
    });
    const picked = await quickInputService.pick(items, {
      placeHolder: server.name
    });
    if (!picked || !hasKey(picked, { action: true })) {
      return;
    }
    if (picked.action === "showOutput") {
      agentHostCustomizations.showMcpServerLog(agentHostSession, server.id);
      return;
    }
    if (picked.action === "authenticate") {
      await agentHostCustomizations.authenticateMcpServer(agentHostSession, server.id);
      return;
    }
    if (picked.action === "start" || picked.action === "stop") {
      await runAgentHostMcpServerLifecycleAction(server, picked.action, { notificationService, logService });
      return;
    }
    if (picked.action === "enablePlugin") {
      const reason = server.disabledReason;
      if (reason?.source === "plugin") {
        const decision = reason.plugin.enablement?.[0];
        if (decision) {
          setAgentHostPluginEnablement(agentHostCustomizations, agentPluginService, agentHostSession, reason.plugin, decision.kind, true);
        }
      }
      return;
    }
    if (localServer && (picked.action === "enableProfile" || picked.action === "disableProfile")) {
      const state = enablementStateForAction(picked.action);
      mcpService.enablementModel.setEnabled(localServer.definition.id, state);
      return;
    }
    const scope = picked.action === "enableProfile" || picked.action === "disableProfile" ? "global" /* Global */ : picked.action === "enableWorkspace" || picked.action === "disableWorkspace" ? "workspace" /* Workspace */ : "session" /* Session */;
    const enabled = picked.action === "enableProfile" || picked.action === "enableWorkspace" || picked.action === "enableSession";
    agentHostCustomizations.setCustomizationEnablement(agentHostSession, server.id, server.enablement, scope, enabled);
  }
};

var McpConfirmationServerOptionsCommand = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.serverOptionsInConfirmation" /* ServerOptionsInConfirmation */,
      title: localize2(16828, "Server Options"),
      category: category3,
      icon: Codicon.settingsGear,
      f1: false,
      menu: [{
        id: MenuId.ChatConfirmationMenu,
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("chatConfirmationPartSource", "mcp"),
          ContextKeyExpr.or(
            ContextKeyExpr.equals("chatConfirmationPartType", "chatToolConfirmation"),
            ContextKeyExpr.equals("chatConfirmationPartType", "elicitation")
          )
        ),
        group: "navigation"
      }]
    });
  }
  async run(accessor, arg) {
    const toolsService = accessor.get(ILanguageModelToolsService);
    if (arg.kind === "toolInvocation") {
      const tool = toolsService.getTool(arg.toolId);
      if (tool?.source.type === "mcp") {
        accessor.get(ICommandService).executeCommand("workbench.mcp.serverOptions" /* ServerOptions */, tool.source.definitionId);
      }
    } else if (arg.kind === "elicitation2") {
      if (arg.source?.type === "mcp") {
        accessor.get(ICommandService).executeCommand("workbench.mcp.serverOptions" /* ServerOptions */, arg.source.definitionId);
      }
    } else {
      assertNever(arg);
    }
  }
};

var McpServerOptionsCommand = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.serverOptions" /* ServerOptions */,
      title: localize2(16828, "Server Options"),
      category: category3,
      f1: false
    });
  }
  async run(accessor, id2) {
    const mcpService = accessor.get(IMcpService);
    const quickInputService = accessor.get(IQuickInputService);
    const mcpRegistry = accessor.get(IMcpRegistry);
    const editorService = accessor.get(IEditorService);
    const commandService = accessor.get(ICommandService);
    const samplingService = accessor.get(IMcpSamplingService);
    const authenticationQueryService = accessor.get(IAuthenticationQueryService);
    const authenticationService = accessor.get(IAuthenticationService);
    const server = mcpService.servers.get().find((s) => s.definition.id === id2);
    if (!server) {
      return;
    }
    const collection = mcpRegistry.collections.get().find((c) => c.id === server.collection.id);
    const serverDefinition = collection?.serverDefinitions.get().find((s) => s.id === server.definition.id);
    const items = [];
    const serverState = server.connectionState.get();
    const disabled = isContributionDisabled(server.enablement.get());
    items.push({ type: "separator", label: localize(16772, null) });
    if (disabled) {
      items.push({
        label: localize(16819, null),
        action: "enable"
      });
    } else if (McpConnectionState.canBeStarted(serverState.state)) {
      items.push({
        label: localize(16853, null),
        action: "start"
      });
    } else {
      items.push({
        label: localize(16855, null),
        action: "stop"
      });
      items.push({
        label: localize(16832, null),
        action: "restart"
      });
    }
    items.push(...this._getAuthActions(authenticationQueryService, server.definition.id));
    const configTarget = serverDefinition?.presentation?.origin || collection?.presentation?.origin;
    if (configTarget) {
      items.push({
        label: localize(16812, null),
        action: "config"
      });
    }
    items.push({
      label: localize(16849, null),
      action: "showOutput"
    });
    items.push(
      { type: "separator", label: localize(16771, null) },
      {
        label: localize(16813, null),
        description: localize(16850, null),
        action: "configSampling"
      }
    );
    if (samplingService.hasLogs(server)) {
      items.push({
        label: localize(16833, null),
        description: localize(16834, null),
        action: "samplingLog"
      });
    }
    const capabilities = server.capabilities.get();
    if (capabilities === void 0 || capabilities & 16 /* Resources */) {
      items.push({ type: "separator", label: localize(16770, null) });
      items.push({
        label: localize(16831, null),
        action: "resources"
      });
    }
    const pick = await quickInputService.pick(items, {
      placeHolder: localize(16836, null, server.definition.label)
    });
    if (!pick) {
      return;
    }
    switch (pick.action) {
      case "enable":
        mcpService.enablementModel.setEnabled(server.definition.id, 3 /* EnabledWorkspace */);
        break;
      case "start":
        await server.start({ promptType: "all-untrusted" });
        server.showOutput();
        break;
      case "stop":
        await server.stop();
        break;
      case "restart":
        await server.stop();
        await server.start({ promptType: "all-untrusted" });
        break;
      case "disconnect":
        await server.stop();
        await this._handleAuth(authenticationService, pick.accountQuery, server.definition, false);
        break;
      case "signout":
        await server.stop();
        await this._handleAuth(authenticationService, pick.accountQuery, server.definition, true);
        break;
      case "showOutput":
        server.showOutput();
        break;
      case "config":
        editorService.openEditor({
          resource: URI.isUri(configTarget) ? configTarget : configTarget.uri,
          options: { selection: URI.isUri(configTarget) ? void 0 : configTarget.range }
        });
        break;
      case "configSampling":
        return commandService.executeCommand("workbench.mcp.configureSamplingModels" /* ConfigureSamplingModels */, server);
      case "resources":
        return commandService.executeCommand("workbench.mcp.browseResources" /* BrowseResources */, server);
      case "samplingLog":
        editorService.openEditor({
          resource: void 0,
          contents: samplingService.getLogText(server),
          label: localize(16835, null, server.definition.label)
        });
        break;
      default:
        assertNever(pick);
    }
  }
  _getAuthActions(authenticationQueryService, serverId) {
    const result = [];
    for (const [providerId, accountName] of authenticationQueryService.mcpServer(serverId).getAllAccountPreferences()) {
      const accountQuery = authenticationQueryService.provider(providerId).account(accountName);
      if (!accountQuery.mcpServer(serverId).isAccessAllowed()) {
        continue;
      }
      if (accountQuery.entities().getEntityCount().total > 1) {
        result.push({
          action: "disconnect",
          label: localize(16817, null),
          description: `(${accountName})`,
          accountQuery
        });
      } else {
        result.push({
          action: "signout",
          label: localize(16851, null),
          description: `(${accountName})`,
          accountQuery
        });
      }
    }
    return result;
  }
  async _handleAuth(authenticationService, accountQuery, definition, signOut) {
    const { providerId, accountName } = accountQuery;
    accountQuery.mcpServer(definition.id).setAccessAllowed(false, definition.label);
    if (signOut) {
      const accounts = await authenticationService.getAccounts(providerId);
      const account = accounts.find((a) => a.label === accountName);
      if (account) {
        const sessions = await authenticationService.getSessions(providerId, void 0, { account });
        for (const session of sessions) {
          await authenticationService.removeSession(providerId, session.id);
        }
      }
    }
  }
};

var MCPServerActionRendering = class extends Disposable {
  constructor(actionViewItemService, mcpService, instaService, commandService, configurationService) {
    super();
    const hoverIsOpen = observableValue(this, false);
    const config = observableConfigValue(mcpAutoStartConfig, "newAndOutdated" /* NewAndOutdated */, configurationService);
    let DisplayedState;
    ((DisplayedState2) => {
      DisplayedState2[DisplayedState2["None"] = 0] = "None";
      DisplayedState2[DisplayedState2["NewTools"] = 1] = "NewTools";
      DisplayedState2[DisplayedState2["Error"] = 2] = "Error";
      DisplayedState2[DisplayedState2["Refreshing"] = 3] = "Refreshing";
    })(DisplayedState || (DisplayedState = {}));
    function isServer(s) {
      return typeof s.start === "function";
    }
    const displayedStateCurrent = derived((reader) => {
      const servers = mcpService.servers.read(reader);
      const serversPerState = [];
      for (const server of servers) {
        let thisState = 0 /* None */;
        switch (server.cacheState.read(reader)) {
          case 0 /* Unknown */:
          case 2 /* Outdated */:
            thisState = server.connectionState.read(reader).state === McpConnectionState.Kind.Error ? 2 /* Error */ : 1 /* NewTools */;
            break;
          case 3 /* RefreshingFromUnknown */:
            thisState = 3 /* Refreshing */;
            break;
          default:
            thisState = server.connectionState.read(reader).state === McpConnectionState.Kind.Error ? 2 /* Error */ : 0 /* None */;
            break;
        }
        serversPerState[thisState] ??= [];
        serversPerState[thisState].push(server);
      }
      const unknownServerStates = mcpService.lazyCollectionState.read(reader);
      if (unknownServerStates.state === 1 /* LoadingUnknown */) {
        serversPerState[3 /* Refreshing */] ??= [];
        serversPerState[3 /* Refreshing */].push(...unknownServerStates.collections);
      } else if (unknownServerStates.state === 0 /* HasUnknown */) {
        serversPerState[1 /* NewTools */] ??= [];
        serversPerState[1 /* NewTools */].push(...unknownServerStates.collections);
      }
      let maxState = serversPerState.length - 1;
      if (maxState === 1 /* NewTools */ && config.read(reader) !== "never" /* Never */) {
        maxState = 0 /* None */;
      }
      return { state: maxState, servers: serversPerState[maxState] || [] };
    });
    const displayedState = derivedObservableWithCache(this, (reader, last) => {
      if (last && hoverIsOpen.read(reader)) {
        return last;
      } else {
        return displayedStateCurrent.read(reader);
      }
    });
    const actionItemState = displayedState.map((s) => s.state);
    this._store.add(actionViewItemService.register(MenuId.ChatInput, "workbench.mcp.listServer" /* ListServer */, (action, options3) => {
      if (!(action instanceof MenuItemAction)) {
        return void 0;
      }
      return instaService.createInstance(class extends MenuEntryActionViewItem {
        render(container2) {
          super.render(container2);
          container2.classList.add("chat-mcp");
          container2.style.position = "relative";
          const stateIndicator = container2.appendChild($(".chat-mcp-state-indicator"));
          stateIndicator.style.display = "none";
          this._register(autorun((r2) => {
            const displayed = displayedState.read(r2);
            const { state } = displayed;
            this.updateTooltip();
            stateIndicator.ariaLabel = this.getLabelForState(displayed);
            stateIndicator.className = "chat-mcp-state-indicator";
            if (state === 1 /* NewTools */) {
              stateIndicator.style.display = "block";
              stateIndicator.classList.add("chat-mcp-state-new", ...ThemeIcon.asClassNameArray(Codicon.refreshCompact));
            } else if (state === 2 /* Error */) {
              stateIndicator.style.display = "block";
              stateIndicator.classList.add("chat-mcp-state-error", ...ThemeIcon.asClassNameArray(Codicon.warningCompact));
            } else if (state === 3 /* Refreshing */) {
              stateIndicator.style.display = "block";
              stateIndicator.classList.add("chat-mcp-state-refreshing", ...ThemeIcon.asClassNameArray(ThemeIcon.modify(Codicon.loadingCompact, "spin")));
            } else {
              stateIndicator.style.display = "none";
            }
          }));
        }
        async onClick(e4) {
          e4.preventDefault();
          e4.stopPropagation();
          const { state, servers } = displayedStateCurrent.get();
          if (state === 1 /* NewTools */) {
            const interaction = new McpStartServerInteraction();
            servers.filter(isServer).forEach((server) => server.stop().then(() => server.start({ interaction })));
            mcpService.activateCollections();
          } else if (state === 3 /* Refreshing */) {
            findLast(servers, isServer)?.showOutput();
          } else if (state === 2 /* Error */) {
            const server = findLast(servers, isServer);
            if (server) {
              await server.showOutput(true);
              commandService.executeCommand("workbench.mcp.serverOptions" /* ServerOptions */, server.definition.id);
            }
          } else {
            commandService.executeCommand("workbench.mcp.listServer" /* ListServer */);
          }
        }
        getTooltip() {
          return this.getLabelForState() || super.getTooltip();
        }
        getHoverContents({ state, servers } = displayedStateCurrent.get()) {
          const link2 = (s) => createMarkdownCommandLink({
            text: s.definition.label,
            id: "workbench.mcp.serverOptions" /* ServerOptions */,
            arguments: [s.definition.id],
            tooltip: localize(16839, null, s.definition.label)
          });
          const single = servers.length === 1;
          const names = servers.map((s) => isServer(s) ? link2(s) : "`" + s.label + "`").map((l) => single ? l : `- ${l}`).join("\n");
          let markdown;
          if (state === 1 /* NewTools */) {
            markdown = new MarkdownString(
              single ? localize(16827, null, names) : localize(16826, null, names)
            );
          } else if (state === 2 /* Error */) {
            markdown = new MarkdownString(
              single ? localize(16821, null, names) : localize(16820, null, names)
            );
          } else {
            return this.getLabelForState() || void 0;
          }
          return {
            element: (token) => {
              hoverIsOpen.set(true, void 0);
              const store = new DisposableStore();
              store.add(toDisposable(() => hoverIsOpen.set(false, void 0)));
              store.add(token.onCancellationRequested(() => {
                store.dispose();
              }));
              store.add(disposableWindowInterval(mainWindow, () => {
                if (!container2.isConnected) {
                  store.dispose();
                }
              }, 2e3));
              const container2 = $("div.mcp-hover-contents");
              markdown.isTrusted = true;
              const markdownResult = store.add(renderMarkdown(markdown));
              container2.appendChild(markdownResult.element);
              const divider = $("hr.mcp-hover-divider");
              container2.appendChild(divider);
              const checkboxContainer = $("div.mcp-hover-setting");
              const settingLabelStr = localize(16797, null);
              const checkbox = store.add(new Checkbox(
                settingLabelStr,
                config.get() !== "never" /* Never */,
                { ...defaultCheckboxStyles }
              ));
              checkboxContainer.appendChild(checkbox.domNode);
              const settingLabel = $("span.mcp-hover-setting-label", void 0, settingLabelStr);
              checkboxContainer.appendChild(settingLabel);
              const onChange = () => {
                const newValue = checkbox.checked ? "newAndOutdated" /* NewAndOutdated */ : "never" /* Never */;
                configurationService.updateValue(mcpAutoStartConfig, newValue);
              };
              store.add(checkbox.onChange(onChange));
              store.add(addDisposableListener(settingLabel, EventType.CLICK, () => {
                checkbox.checked = !checkbox.checked;
                onChange();
              }));
              container2.appendChild(checkboxContainer);
              return container2;
            }
          };
        }
        getLabelForState({ state, servers } = displayedStateCurrent.get()) {
          if (state === 1 /* NewTools */) {
            return localize(16825, null, servers.length || 1);
          } else if (state === 2 /* Error */) {
            return localize(16856, null, servers.length || 1);
          } else if (state === 3 /* Refreshing */) {
            return localize(16857, null);
          } else {
            return null;
          }
        }
      }, action, { ...options3, keybindingNotRenderedWithLabel: true });
    }, Event2.fromObservableLight(actionItemState)));
  }
};

MCPServerActionRendering = __decorateClass([
  __decorateParam(0, IActionViewItemService),
  __decorateParam(1, IMcpService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IConfigurationService)
], MCPServerActionRendering);

var ResetMcpTrustCommand = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.resetTrust" /* ResetTrust */,
      title: localize2(16830, "Reset Trust"),
      category: category3,
      f1: true,
      precondition: ContextKeyExpr.and(McpContextKeys.toolsCount.greater(0), ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate())
    });
  }
  run(accessor) {
    const mcpService = accessor.get(IMcpService);
    mcpService.resetTrust();
  }
};

var ResetMcpCachedTools = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.resetCachedTools" /* ResetCachedTools */,
      title: localize2(16829, "Reset Cached Tools"),
      category: category3,
      f1: true,
      precondition: ContextKeyExpr.and(McpContextKeys.toolsCount.greater(0), ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate())
    });
  }
  run(accessor) {
    const mcpService = accessor.get(IMcpService);
    mcpService.resetCaches();
  }
};

var AddConfigurationAction2 = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.addConfiguration" /* AddConfiguration */,
      title: localize2(16773, "Add Server..."),
      metadata: {
        description: localize2(16774, "Installs a new Model Context protocol to the mcp.json settings")
      },
      category: category3,
      f1: true,
      precondition: ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate()),
      menu: {
        id: MenuId.EditorContent,
        when: ContextKeyExpr.and(
          ContextKeyExpr.regex(ResourceContextKey.Path.key, /\.vscode[/\\]mcp\.json$/),
          ActiveEditorContext.isEqualTo(TEXT_FILE_EDITOR_ID),
          ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate())
        )
      }
    });
  }
  async run(accessor, configUri) {
    const instantiationService = accessor.get(IInstantiationService);
    const workspaceService = accessor.get(IWorkspaceContextService);
    const target = configUri ? workspaceService.getWorkspaceFolder(URI.parse(configUri)) : void 0;
    return instantiationService.createInstance(McpAddConfigurationCommand, target ?? void 0).run();
  }
};

var InstallFromManifestAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.installFromManifest" /* InstallFromManifest */,
      title: localize2(16822, "Install Server from Manifest..."),
      metadata: {
        description: localize2(16823, "Install an MCP server from a JSON manifest file")
      },
      category: category3,
      f1: true,
      precondition: ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate())
    });
  }
  async run(accessor) {
    const instantiationService = accessor.get(IInstantiationService);
    return instantiationService.createInstance(McpInstallFromManifestCommand).run();
  }
};

var RemoveStoredInput = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.removeStoredInput" /* RemoveStoredInput */,
      title: localize2(16829, "Reset Cached Tools"),
      category: category3,
      f1: false
    });
  }
  run(accessor, scope, id2) {
    accessor.get(IMcpRegistry).clearSavedInputs(scope, id2);
  }
};

var EditStoredInput = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.editStoredInput" /* EditStoredInput */,
      title: localize2(16818, "Edit Stored Input"),
      category: category3,
      f1: false
    });
  }
  run(accessor, inputId, uri4, configSection, target) {
    const workspaceFolder = uri4 && accessor.get(IWorkspaceContextService).getWorkspaceFolder(uri4);
    accessor.get(IMcpRegistry).editSavedInput(inputId, workspaceFolder || void 0, configSection, target);
  }
};

var SetOAuthClientSecret = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.setOAuthClientSecret" /* SetOAuthClientSecret */,
      title: localize2(16840, "Set OAuth Client Secret"),
      category: category3,
      f1: false
    });
  }
  async run(accessor, clientId, mcpServerUrl, serverName) {
    const quickInputService = accessor.get(IQuickInputService);
    const secretStorageService = accessor.get(ISecretStorageService);
    const key3 = mcpOAuthClientSecretStorageKey(mcpServerUrl, clientId);
    const existing = await secretStorageService.get(key3);
    const deleteButton2 = {
      iconClass: ThemeIcon.asClassName(Codicon.trash),
      tooltip: localize(16841, null)
    };
    const revealButton = {
      iconClass: ThemeIcon.asClassName(Codicon.eye),
      tooltip: localize(16846, null)
    };
    const hideButton = {
      iconClass: ThemeIcon.asClassName(Codicon.eyeClosed),
      tooltip: localize(16842, null)
    };
    const result = await new Promise((resolve3) => {
      const input = quickInputService.createInputBox();
      input.title = existing ? localize(16847, null, serverName) : localize(16848, null, serverName);
      input.prompt = localize(16845, null, clientId);
      input.placeholder = existing ? localize(16843, null) : localize(16844, null);
      input.password = true;
      input.ignoreFocusOut = true;
      if (existing) {
        input.value = existing;
        input.valueSelection = [0, existing.length];
      }
      const updateButtons2 = () => {
        const toggleButton = input.password ? revealButton : hideButton;
        input.buttons = existing ? [toggleButton, deleteButton2] : [toggleButton];
      };
      updateButtons2();
      const disposables = new DisposableStore();
      disposables.add(input.onDidAccept(() => {
        const value2 = input.value;
        if (value2.length === 0) {
          resolve3({ kind: "delete" });
          input.hide();
          return;
        }
        resolve3({ kind: "accept", value: value2 });
        input.hide();
      }));
      disposables.add(input.onDidTriggerButton((btn) => {
        if (btn === deleteButton2) {
          resolve3({ kind: "delete" });
          input.hide();
        } else if (btn === revealButton || btn === hideButton) {
          input.password = !input.password;
          updateButtons2();
        }
      }));
      disposables.add(input.onDidHide(() => {
        resolve3(void 0);
        disposables.dispose();
        input.dispose();
      }));
      input.show();
    });
    if (!result) {
      return;
    }
    if (result.kind === "delete") {
      await secretStorageService.delete(key3);
    } else {
      await secretStorageService.set(key3, result.value);
    }
  }
};

var ShowConfiguration = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.showConfiguration" /* ShowConfiguration */,
      title: localize2(16808, "Show Configuration"),
      category: category3,
      f1: false
    });
  }
  run(accessor, collectionId, serverId) {
    const collection = accessor.get(IMcpRegistry).collections.get().find((c) => c.id === collectionId);
    if (!collection) {
      return;
    }
    const server = collection?.serverDefinitions.get().find((s) => s.id === serverId);
    const editorService = accessor.get(IEditorService);
    if (server?.presentation?.origin) {
      editorService.openEditor({
        resource: server.presentation.origin.uri,
        options: { selection: server.presentation.origin.range }
      });
    } else if (collection.presentation?.origin) {
      editorService.openEditor({
        resource: collection.presentation.origin
      });
    }
  }
};

var ShowOutput = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.showOutput" /* ShowOutput */,
      title: localize2(16809, "Show Output"),
      category: category3,
      f1: false
    });
  }
  run(accessor, serverId) {
    accessor.get(IMcpService).servers.get().find((s) => s.definition.id === serverId)?.showOutput();
  }
};

function isAgentHostMcpServerCommandArg(arg) {
  return typeof arg !== "string" && URI.isUri(arg.agentHostSession) && typeof arg.serverId === "string";
}

function getAgentHostMcpServer(accessor, arg) {
  return accessor.get(IAgentHostCustomizationService).getMcpServers(arg.agentHostSession).find((server) => server.id === arg.serverId);
}

var RestartServer = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.restartServer" /* RestartServer */,
      title: localize2(16806, "Restart Server"),
      category: category3,
      f1: false
    });
  }
  async run(accessor, serverId, opts) {
    if (isAgentHostMcpServerCommandArg(serverId)) {
      const server = getAgentHostMcpServer(accessor, serverId);
      accessor.get(ILogService).warn(`Restarting MCP server '${server?.name ?? serverId.serverId}' is not supported for agent-host servers`);
      accessor.get(INotificationService).warn(localize(16787, null, server?.name ?? serverId.serverId));
      return;
    }
    const s = accessor.get(IMcpService).servers.get().find((s2) => s2.definition.id === serverId);
    s?.showOutput();
    await s?.stop();
    await s?.start({ promptType: "all-untrusted", ...opts });
  }
};

var StartServer = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.startServer" /* StartServer */,
      title: localize2(16810, "Start Server"),
      category: category3,
      f1: false
    });
  }
  async run(accessor, serverId, opts) {
    if (isAgentHostMcpServerCommandArg(serverId)) {
      await getAgentHostMcpServer(accessor, serverId)?.start();
      return;
    }
    let servers = accessor.get(IMcpService).servers.get();
    if (serverId !== "*") {
      servers = servers.filter((s) => s.definition.id === serverId);
    }
    const startOpts = { promptType: "all-untrusted", ...opts };
    if (opts?.waitForLiveTools) {
      await Promise.all(servers.map((s) => startServerAndWaitForLiveTools(s, startOpts)));
    } else {
      await Promise.all(servers.map((s) => s.start(startOpts)));
    }
  }
};

var StopServer = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.stopServer" /* StopServer */,
      title: localize2(16811, "Stop Server"),
      category: category3,
      f1: false
    });
  }
  async run(accessor, serverId) {
    if (isAgentHostMcpServerCommandArg(serverId)) {
      await getAgentHostMcpServer(accessor, serverId)?.stop();
      return;
    }
    const s = accessor.get(IMcpService).servers.get().find((s2) => s2.definition.id === serverId);
    await s?.stop();
  }
};

var McpBrowseCommand = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.browseServers" /* Browse */,
      title: localize2(16799, "MCP Servers"),
      tooltip: localize2(16801, "Browse MCP Servers"),
      category: category3,
      icon: Codicon.search,
      precondition: ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate()),
      menu: [{
        id: extensionsFilterSubMenu,
        group: "1_predefined",
        order: 1,
        when: ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate())
      }, {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("view", InstalledMcpServersViewId), ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate()),
        group: "navigation"
      }]
    });
  }
  async run(accessor) {
    accessor.get(IExtensionsWorkbenchService).openSearch("@mcp ");
  }
};

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: "workbench.mcp.browseServers" /* Browse */,
    title: localize2(16800, "Browse MCP Servers"),
    category: category3,
    precondition: ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate())
  }
});

var ShowInstalledMcpServersCommand = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.showInstalledServers" /* ShowInstalled */,
      title: localize2(16807, "Show Installed Servers"),
      category: category3,
      precondition: ContextKeyExpr.and(HasInstalledMcpServersContext, ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate()),
      f1: true
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = await viewsService.openView(InstalledMcpServersViewId, true);
    if (!view) {
      await viewsService.openViewContainer(VIEWLET_ID);
      await viewsService.openView(InstalledMcpServersViewId, true);
    }
  }
};

var OpenMcpResourceCommand = class extends Action2 {
  async run(accessor) {
    const fileService = accessor.get(IFileService);
    const editorService = accessor.get(IEditorService);
    const resource = await this.getURI(accessor);
    if (!await fileService.exists(resource)) {
      await fileService.createFile(resource, VSBuffer.fromString(JSON.stringify({ servers: {} }, null, "	")));
    }
    await editorService.openEditor({ resource });
  }
};

var OpenUserMcpResourceCommand = class extends OpenMcpResourceCommand {
  constructor() {
    super({
      id: "workbench.mcp.openUserMcpJson" /* OpenUserMcp */,
      title: localize2(16803, "Open User Configuration"),
      category: category3,
      f1: true,
      precondition: ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate())
    });
  }
  getURI(accessor) {
    const userDataProfileService = accessor.get(IUserDataProfileService);
    return Promise.resolve(userDataProfileService.currentProfile.mcpResource);
  }
};

var OpenRemoteUserMcpResourceCommand = class extends OpenMcpResourceCommand {
  constructor() {
    super({
      id: "workbench.mcp.openRemoteUserMcpJson" /* OpenRemoteUserMcp */,
      title: localize2(16802, "Open Remote User Configuration"),
      category: category3,
      f1: true,
      precondition: ContextKeyExpr.and(
        ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate()),
        RemoteNameContext.notEqualsTo("")
      )
    });
  }
  async getURI(accessor) {
    const userDataProfileService = accessor.get(IUserDataProfileService);
    const remoteUserDataProfileService = accessor.get(IRemoteUserDataProfilesService);
    const remoteProfile = await remoteUserDataProfileService.getRemoteProfile(userDataProfileService.currentProfile);
    return remoteProfile.mcpResource;
  }
};

var OpenWorkspaceFolderMcpResourceCommand = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.openWorkspaceFolderMcpJson" /* OpenWorkspaceFolderMcp */,
      title: localize2(16804, "Open Workspace Folder MCP Configuration"),
      category: category3,
      f1: true,
      precondition: ContextKeyExpr.and(
        ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate()),
        WorkspaceFolderCountContext.notEqualsTo(0)
      )
    });
  }
  async run(accessor) {
    const workspaceContextService = accessor.get(IWorkspaceContextService);
    const commandService = accessor.get(ICommandService);
    const editorService = accessor.get(IEditorService);
    const workspaceFolders = workspaceContextService.getWorkspace().folders;
    const workspaceFolder = workspaceFolders.length === 1 ? workspaceFolders[0] : await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID);
    if (workspaceFolder) {
      await editorService.openEditor({ resource: workspaceFolder.toResource(WORKSPACE_STANDALONE_CONFIGURATIONS[MCP_CONFIGURATION_KEY]) });
    }
  }
};

var OpenWorkspaceMcpResourceCommand = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.openWorkspaceMcpJson" /* OpenWorkspaceMcp */,
      title: localize2(16805, "Open Workspace MCP Configuration"),
      category: category3,
      f1: true,
      precondition: ContextKeyExpr.and(
        ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate()),
        WorkbenchStateContext.isEqualTo("workspace")
      )
    });
  }
  async run(accessor) {
    const workspaceContextService = accessor.get(IWorkspaceContextService);
    const editorService = accessor.get(IEditorService);
    const workspaceConfiguration = workspaceContextService.getWorkspace().configuration;
    if (workspaceConfiguration) {
      await editorService.openEditor({ resource: workspaceConfiguration });
    }
  }
};

var McpBrowseResourcesCommand = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.browseResources" /* BrowseResources */,
      title: localize2(16798, "Browse Resources..."),
      category: category3,
      precondition: ContextKeyExpr.and(McpContextKeys.serverCount.greater(0), ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate()),
      f1: true
    });
  }
  run(accessor, server) {
    if (server) {
      accessor.get(IInstantiationService).createInstance(McpResourceQuickPick, server).pick();
    } else {
      accessor.get(IQuickInputService).quickAccess.show(McpResourceQuickAccess.PREFIX);
    }
  }
};

var McpConfigureSamplingModels = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.configureSamplingModels" /* ConfigureSamplingModels */,
      title: localize2(16814, "Configure SamplingModel"),
      category: category3
    });
  }
  async run(accessor, server) {
    const quickInputService = accessor.get(IQuickInputService);
    const lmService = accessor.get(ILanguageModelsService);
    const mcpSampling = accessor.get(IMcpSamplingService);
    const existingIds = new Set(mcpSampling.getConfig(server).allowedModels);
    const allItems = lmService.getLanguageModelIds().map((id2) => {
      const model = lmService.lookupLanguageModel(id2);
      if (!model.isUserSelectable) {
        return void 0;
      }
      return {
        label: model.name,
        description: model.tooltip,
        id: id2,
        picked: existingIds.size ? existingIds.has(id2) : model.isDefaultForLocation["panel" /* Chat */]
      };
    }).filter(isDefined);
    allItems.sort((a, b) => (b.picked ? 1 : 0) - (a.picked ? 1 : 0) || a.label.localeCompare(b.label));
    const picked = await quickInputService.pick(allItems, {
      placeHolder: localize(16815, null, server.definition.label),
      canPickMany: true
    });
    if (picked) {
      await mcpSampling.updateConfig(server, (c) => c.allowedModels = picked.map((p) => p.id));
    }
    return picked?.length || 0;
  }
};

var McpStartPromptingServerCommand = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.startPromptForServer" /* StartPromptForServer */,
      title: localize2(16854, "Start Prompting Server"),
      category: category3,
      f1: false
    });
  }
  async run(accessor, server) {
    const widget = await openPanelChatAndGetWidget(accessor.get(IViewsService), accessor.get(IChatWidgetService));
    if (!widget) {
      return;
    }
    const editor = widget.inputEditor;
    const model = editor.getModel();
    if (!model) {
      return;
    }
    const range2 = (editor.getSelection() || model.getFullModelRange()).collapseToEnd();
    const text2 = mcpPromptPrefix(server.definition) + ".";
    model.applyEdits([{ range: range2, text: text2 }]);
    editor.setSelection(Range2.fromPositions(range2.getEndPosition().delta(0, text2.length)));
    widget.focusInput();
    SuggestController.get(editor)?.triggerSuggest();
  }
};

var McpSkipCurrentAutostartCommand = class extends Action2 {
  constructor() {
    super({
      id: "workbench.mcp.skipAutostart" /* SkipCurrentAutostart */,
      title: localize2(16852, "Skip Current Autostart"),
      category: category3,
      f1: false
    });
  }
  async run(accessor) {
    accessor.get(IMcpService).cancelAutostart();
  }
};
export { isAgentHostMcpServerButton, getAgentHostMcpServerButtons, canStartAgentHostMcpServer, canStopAgentHostMcpServer, runAgentHostMcpServerLifecycleAction, mcpServerStatusToLabel, getAgentHostMcpServerEnablementItems, getLocalMcpServerEnablementItems, enablementStateForAction, findLocalMcpServer, isAgentHostMcpServerCommandArg, getAgentHostMcpServer, category3, ListMcpServerCommand, startAgentHostMcpServerButton, stopAgentHostMcpServerButton, McpAgentHostServerOptionsCommand, McpConfirmationServerOptionsCommand, McpServerOptionsCommand, MCPServerActionRendering, ResetMcpTrustCommand, ResetMcpCachedTools, AddConfigurationAction2, InstallFromManifestAction, RemoveStoredInput, EditStoredInput, SetOAuthClientSecret, ShowConfiguration, ShowOutput, RestartServer, StartServer, StopServer, McpBrowseCommand, ShowInstalledMcpServersCommand, OpenMcpResourceCommand, OpenUserMcpResourceCommand, OpenRemoteUserMcpResourceCommand, OpenWorkspaceFolderMcpResourceCommand, OpenWorkspaceMcpResourceCommand, McpBrowseResourcesCommand, McpConfigureSamplingModels, McpStartPromptingServerCommand, McpSkipCurrentAutostartCommand };
