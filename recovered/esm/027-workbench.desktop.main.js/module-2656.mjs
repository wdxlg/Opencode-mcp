// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/mcpListWidget.ts
import { $, DisposableResizeObserver, EventHelper, addDisposableGenericMouseDownListener, addDisposableListener, append, clearNode, getWindow } from "./module-0075.mjs";
import { IMcpService, IMcpWorkbenchService, MCP_PLUGIN_COLLECTION_ID_PREFIX, McpConnectionState } from "./module-1206.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { CUSTOMIZATION_GROUP_HEADER_HEIGHT, CUSTOMIZATION_GROUP_HEADER_HEIGHT_WITH_SEPARATOR, CustomizationGroupHeaderRenderer } from "./module-2654.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { builtinIcon, extensionIcon, mcpServerIcon, pluginIcon, userIcon, workspaceIcon } from "./module-2640.mjs";
import { Disposable, DisposableStore, MutableDisposable, isDisposable } from "./module-0012.mjs";
import { formatDisplayName } from "./module-2651.mjs";
import { truncateToFirstLine } from "./module-2650.mjs";
import { localize } from "./module-0001.mjs";
import { autorun } from "./module-0052.mjs";
import { isContributionDisabled } from "./module-1018.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles, defaultInputBoxStyles } from "./module-0513.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAICustomizationWorkspaceService } from "./module-0995.mjs";
import { IAgentPluginService } from "./module-1016.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IAgentHostCustomizationService } from "./module-2131.mjs";
import { ICustomizationHarnessService } from "./module-1031.mjs";
import { IOutputService } from "./module-1245.mjs";
import { Codicon } from "./module-0085.mjs";
import { Action, Separator } from "./module-0082.mjs";
import { ConfigureModelAccessAction, DisableMcpServerForWorkspaceAction, DisableMcpServerGloballyAction, EnableMcpServerForWorkspaceAction, EnableMcpServerGloballyAction, RestartServerAction, ShowSamplingRequestsAction, StartServerAction, StopServerAction, getContextMenuActions3 } from "./module-2653.mjs";
import { Emitter } from "./module-0017.mjs";
import { Delayer } from "./module-0036.mjs";
import { mcpAccessConfig } from "./module-1196.mjs";
import { URI } from "./module-0032.mjs";
import { InputBox } from "./module-0600.mjs";
import { GalleryItemRenderer } from "./module-2655.mjs";
import { WorkbenchList } from "./module-0636.mjs";
import { NotSelectableGroupId } from "./module-0454.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IMcpRegistry } from "./module-1447.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IContextMenuService, IContextViewService } from "./module-0488.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/mcpListWidget.ts
var $86 = $;

var MCP_ITEM_HEIGHT = 36;

var MCP_ITEM_WITH_DESCRIPTION_HEIGHT = 44;

var PLUGIN_COLLECTION_PREFIX = MCP_PLUGIN_COLLECTION_ID_PREFIX;

var COPILOT_EXTENSION_IDS = ["github.copilot", "github.copilot-chat"];

function isCopilotExtension(id2) {
  return COPILOT_EXTENSION_IDS.some((copilotId) => ExtensionIdentifier.equals(id2, copilotId));
}

function getPluginUriFromCollectionId(collectionId) {
  return collectionId?.startsWith(PLUGIN_COLLECTION_PREFIX) ? collectionId.slice(PLUGIN_COLLECTION_PREFIX.length) : void 0;
}

var McpServerItemDelegate = class {
  getHeight(element) {
    if (element.type === "group-header") {
      return element.isFirst ? CUSTOMIZATION_GROUP_HEADER_HEIGHT : CUSTOMIZATION_GROUP_HEADER_HEIGHT_WITH_SEPARATOR;
    }
    if (element.type === "server-item" && element.server.gallery && (element.marketplace || !element.server.local)) {
      return 62;
    }
    if (element.type === "server-item" && element.server.description?.trim()) {
      return MCP_ITEM_WITH_DESCRIPTION_HEIGHT;
    }
    if (element.type === "builtin-item" && element.description) {
      return MCP_ITEM_WITH_DESCRIPTION_HEIGHT;
    }
    return MCP_ITEM_HEIGHT;
  }
  getTemplateId(element) {
    if (element.type === "group-header") {
      return "mcpGroupHeader";
    }
    if (element.type === "builtin-item") {
      return "mcpServerItem";
    }
    if (element.type === "session-server-item") {
      return "mcpServerItem";
    }
    const server = element.server;
    return server.gallery && (element.marketplace || !server.local) ? MCP_GALLERY_ITEM_TEMPLATE_ID : "mcpServerItem";
  }
};

var McpServerItemRenderer = class {
  constructor(_afterShowOutput, workspaceService, agentPluginService, hoverService, agentHostCustomizationService, customizationHarnessService, outputService) {
    this._afterShowOutput = _afterShowOutput;
    this.workspaceService = workspaceService;
    this.agentPluginService = agentPluginService;
    this.hoverService = hoverService;
    this.agentHostCustomizationService = agentHostCustomizationService;
    this.customizationHarnessService = customizationHarnessService;
    this.outputService = outputService;
    this.templateId = "mcpServerItem";
  }
  renderTemplate(container3) {
    container3.classList.add("mcp-server-item");
    const typeIcon = append(container3, $86(".mcp-server-icon"));
    typeIcon.classList.add(...ThemeIcon.asClassNameArray(mcpServerIcon));
    const details = append(container3, $86(".mcp-server-details"));
    const nameRow = append(details, $86(".mcp-server-name-row"));
    const name = append(nameRow, $86(".mcp-server-name"));
    const description = append(details, $86(".mcp-server-description"));
    const actions = append(container3, $86(".mcp-server-actions"));
    return {
      container: container3,
      typeIcon,
      name,
      description,
      actions,
      elementDisposables: new DisposableStore(),
      actionDisposables: new DisposableStore()
    };
  }
  renderElement(element, index2, templateData) {
    templateData.elementDisposables.clear();
    templateData.actionDisposables.clear();
    if (element.type === "builtin-item") {
      templateData.container.classList.add("builtin");
      templateData.container.classList.toggle("has-detail", false);
      templateData.name.textContent = formatDisplayName(element.label);
      if (element.description) {
        templateData.description.textContent = truncateToFirstLine(element.description);
        templateData.description.style.display = "";
      } else {
        templateData.description.textContent = "";
        templateData.description.style.display = "none";
      }
      this.updateKnownServerStatus(templateData, element);
      const pluginUriStr = getPluginUriFromCollectionId(element.collectionId);
      if (pluginUriStr) {
        templateData.elementDisposables.add(this.hoverService.setupDelayedHover(templateData.container, () => {
          const plugin = this.agentPluginService.plugins.get().find((p) => p.uri.toString() === pluginUriStr);
          if (plugin) {
            return {
              content: `${element.label}
${localize(9715, null, plugin.label)}`,
              appearance: { compact: true, skipFadeInAnimation: true }
            };
          }
          return { content: element.label, appearance: { compact: true, skipFadeInAnimation: true } };
        }));
      }
      return;
    }
    if (element.type === "session-server-item") {
      templateData.container.classList.remove("builtin");
      templateData.container.classList.toggle("has-detail", false);
      templateData.name.textContent = formatDisplayName(element.server.name);
      templateData.description.textContent = "";
      templateData.description.style.display = "none";
      this.updateActiveSessionStatus(templateData, element);
      return;
    }
    templateData.container.classList.remove("builtin");
    templateData.name.textContent = formatDisplayName(element.server.label);
    const description = element.server.description?.trim();
    templateData.container.classList.toggle("has-detail", true);
    if (description) {
      templateData.description.textContent = truncateToFirstLine(description);
      templateData.description.style.display = "";
    } else {
      templateData.description.textContent = "";
      templateData.description.style.display = "none";
    }
    if (element.activeSessionServer) {
      this.updateKnownServerStatus(templateData, element);
    } else if (this.workspaceService.isSessionsWindow) {
      this.updateKnownServerStatus(templateData, element);
    } else {
      templateData.elementDisposables.add(autorun((reader) => {
        const disabled = element.localServer ? isContributionDisabled(element.localServer.enablement.read(reader)) : false;
        const connectionState = element.localServer?.connectionState.read(reader);
        const toolCount = element.localServer?.tools.read(reader).filter((tool) => (tool.visibility & 1 /* Model */) !== 0).length;
        templateData.container.classList.toggle("disabled", disabled);
        this.updateStatus(templateData, element, disabled ? "disabled" : connectionState?.state, toolCount);
      }));
    }
  }
  updateKnownServerStatus(templateData, element) {
    templateData.elementDisposables.add(autorun((reader) => {
      const localDisabled = element.localServer ? isContributionDisabled(element.localServer.enablement.read(reader)) : false;
      const toolCount = element.localServer?.tools.read(reader).filter((tool) => (tool.visibility & 1 /* Model */) !== 0).length;
      const activeSessionServer = element.activeSessionServer;
      templateData.container.classList.toggle("disabled", localDisabled || activeSessionServer?.enabled === false);
      this.updateStatus(templateData, element, localDisabled ? "disabled" : activeSessionServer ? activeSessionServer.enabled ? activeSessionServer.status : "disabled" : void 0, toolCount);
    }));
  }
  updateActiveSessionStatus(templateData, element) {
    const disabled = element.server.enabled === false;
    templateData.container.classList.toggle("disabled", disabled);
    this.updateStatus(templateData, element, disabled ? "disabled" : element.server.status);
  }
  updateStatus(templateData, element, state, toolCount) {
    templateData.actionDisposables.clear();
    clearNode(templateData.actions);
    const presentation2 = getMcpStatusPresentation(state);
    if (!presentation2) {
      return;
    }
    const statusText = toolCount === void 0 ? presentation2.label : localize(9729, null, presentation2.label, toolCount);
    const activeSessionServer = getActiveSessionServer(element);
    const label3 = getMcpEntryLabel(element);
    const activeSessionResource = this.customizationHarnessService.activeSessionResource.get();
    const showActiveSessionOutput = activeSessionServer ? (beforeShow) => this.agentHostCustomizationService.showMcpServerLog(activeSessionResource, activeSessionServer.id, beforeShow) : void 0;
    if (state === "authRequired" /* AuthRequired */ && activeSessionServer) {
      const signInLabel = localize(9743, null, label3);
      const signInButton = templateData.actionDisposables.add(new Button(templateData.actions, {
        ...defaultButtonStyles,
        secondary: true,
        small: true,
        title: signInLabel,
        ariaLabel: signInLabel
      }));
      signInButton.label = localize(9742, null);
      signInButton.element.classList.add("mcp-server-sign-in");
      registerMcpInlineButtonAction(templateData.actionDisposables, signInButton, async () => {
        signInButton.enabled = false;
        try {
          await authenticateMcpServer(this.agentHostCustomizationService, this.customizationHarnessService.activeSessionResource.get(), activeSessionServer.id);
        } finally {
          signInButton.enabled = true;
        }
      });
    }
    const showOutput = state === "error" /* Error */ || state === McpConnectionState.Kind.Error ? getMcpServerOutputHandler(this.outputService, element.type === "session-server-item" ? void 0 : element.localServer, activeSessionServer, this._afterShowOutput, showActiveSessionOutput) : void 0;
    if (showOutput && presentation2.icon) {
      const showOutputLabel = localize(9740, null, label3);
      const statusButton = templateData.actionDisposables.add(new Button(templateData.actions, {
        supportIcons: true,
        title: showOutputLabel,
        ariaLabel: showOutputLabel
      }));
      statusButton.icon = presentation2.icon;
      statusButton.label = statusText;
      statusButton.element.classList.add("mcp-server-status", "mcp-server-status-action", presentation2.className);
      registerMcpInlineButtonAction(templateData.actionDisposables, statusButton, showOutput);
      return;
    }
    const statusElement = append(templateData.actions, $86(".mcp-server-status"));
    statusElement.classList.add(presentation2.className);
    if (presentation2.icon) {
      statusElement.classList.add(...ThemeIcon.asClassNameArray(presentation2.icon));
    }
    statusElement.textContent = statusText;
    statusElement.setAttribute("aria-label", statusText);
    templateData.actionDisposables.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), statusElement, presentation2.label));
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
    templateData.actionDisposables.dispose();
  }
};

McpServerItemRenderer = __decorateClass([
  __decorateParam(1, IAICustomizationWorkspaceService),
  __decorateParam(2, IAgentPluginService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IAgentHostCustomizationService),
  __decorateParam(5, ICustomizationHarnessService),
  __decorateParam(6, IOutputService)
], McpServerItemRenderer);

function registerMcpInlineButtonAction(store, button, action) {
  store.add(addDisposableGenericMouseDownListener(button.element, (event) => EventHelper.stop(event, true)));
  store.add(button.onDidClick((event) => {
    EventHelper.stop(event, true);
    void action();
  }));
}

function authenticateMcpServer(agentHostCustomizationService, sessionResource, serverId) {
  return agentHostCustomizationService.authenticateMcpServer(sessionResource, serverId);
}

function getMcpServerOutputHandler(outputService, localServer, activeSessionServer, closeCustomizationEditor, showActiveSessionOutput) {
  const outputChannelId = activeSessionServer?.logOutputChannelId;
  if (showActiveSessionOutput) {
    return () => showActiveSessionOutput(closeCustomizationEditor);
  }
  if (outputChannelId) {
    return async () => {
      await closeCustomizationEditor?.();
      await outputService.showChannel(outputChannelId);
    };
  }
  if (localServer) {
    return async () => {
      await closeCustomizationEditor?.();
      await localServer.showOutput();
    };
  }
  return void 0;
}

function getMcpStatusPresentation(state) {
  if (state === void 0) {
    return void 0;
  }
  if (state === "disabled") {
    return { label: localize(9709, null), className: "disabled", icon: Codicon.circleSlash };
  }
  switch (state) {
    case McpConnectionState.Kind.Running:
    case "ready" /* Ready */:
      return { label: localize(9735, null), className: "running", icon: Codicon.check };
    case McpConnectionState.Kind.Starting:
    case "starting" /* Starting */:
      return { label: localize(9744, null), className: "starting", icon: ThemeIcon.modify(Codicon.loading, "spin") };
    case "authRequired" /* AuthRequired */:
      return { label: localize(9697, null), className: "auth-required", icon: Codicon.account };
    case McpConnectionState.Kind.Error:
    case "error" /* Error */:
      return { label: localize(9711, null), className: "error", icon: Codicon.error };
    case McpConnectionState.Kind.Stopped:
    case "stopped" /* Stopped */:
    default:
      return { label: localize(9745, null), className: "stopped" };
  }
}

function getActiveSessionServer(entry) {
  return entry.type === "session-server-item" ? entry.server : entry.activeSessionServer;
}

function getMcpEntryLabel(element) {
  return element.type === "session-server-item" ? element.server.name : element.type === "builtin-item" ? element.label : element.server.label;
}

function getMcpStatusKind(entry, isSessionsWindow) {
  if (entry.type === "session-server-item") {
    return entry.server.enabled ? entry.server.status : "disabled";
  }
  if (entry.localServer && isContributionDisabled(entry.localServer.enablement.get())) {
    return "disabled";
  }
  if (entry.activeSessionServer) {
    return entry.activeSessionServer.enabled ? entry.activeSessionServer.status : "disabled";
  }
  if (entry.type === "server-item" && !isSessionsWindow) {
    return entry.localServer?.connectionState.get().state;
  }
  return void 0;
}

function getMcpEntryAriaLabel(element, isSessionsWindow) {
  if (element.type === "group-header") {
    return localize(9724, null, element.label, element.count, element.collapsed ? localize(9706, null) : localize(9712, null));
  }
  const label3 = getMcpEntryLabel(element);
  const status2 = getMcpStatusPresentation(getMcpStatusKind(element, isSessionsWindow));
  return status2 ? localize(9725, null, label3, status2.label) : label3;
}

function normalizeMcpMatchKey(value2) {
  return value2 || void 0;
}

function getUniqueMcpMatchKeys(values) {
  const keys = /* @__PURE__ */ new Set();
  for (const value2 of values) {
    const key3 = normalizeMcpMatchKey(value2);
    if (key3) {
      keys.add(key3);
    }
  }
  return [...keys];
}

var ActiveSessionMcpServerMatcher = class {
  constructor(servers) {
    this.servers = servers;
    this.byKey = /* @__PURE__ */ new Map();
    this.matchedIds = /* @__PURE__ */ new Set();
    for (const server of servers) {
      const separator2 = server.id.indexOf("/");
      const rawId = separator2 >= 0 ? server.id.slice(separator2 + 1) : server.id;
      for (const key3 of getUniqueMcpMatchKeys([rawId, server.name])) {
        let bucket = this.byKey.get(key3);
        if (!bucket) {
          bucket = [];
          this.byKey.set(key3, bucket);
        }
        bucket.push(server);
      }
    }
  }
  take(keys) {
    for (const key3 of getUniqueMcpMatchKeys(keys)) {
      const matches2 = this.byKey.get(key3)?.filter((server) => !this.matchedIds.has(server.id));
      if (matches2?.length === 1) {
        this.matchedIds.add(matches2[0].id);
        return matches2[0];
      }
    }
    return void 0;
  }
  unmatched(query) {
    return this.servers.filter((server) => !this.matchedIds.has(server.id) && matchesActiveSessionServerQuery(server, query));
  }
};

var LocalMcpServerMatcher = class {
  constructor(servers) {
    this.byKey = /* @__PURE__ */ new Map();
    for (const server of servers) {
      for (const key3 of getRuntimeServerMatchKeys(server)) {
        let matches2 = this.byKey.get(key3);
        if (!matches2) {
          matches2 = [];
          this.byKey.set(key3, matches2);
        }
        matches2.push(server);
      }
    }
  }
  find(keys) {
    for (const key3 of getUniqueMcpMatchKeys(keys)) {
      const matches2 = this.byKey.get(key3);
      if (matches2?.length === 1) {
        return matches2[0];
      }
    }
    return void 0;
  }
};

function matchesActiveSessionServerQuery(server, query) {
  if (!query) {
    return true;
  }
  return server.name.toLowerCase().includes(query);
}

function getWorkbenchServerMatchKeys(server) {
  return getUniqueMcpMatchKeys([server.id, server.name, server.label]);
}

function getRuntimeServerMatchKeys(server) {
  return getUniqueMcpMatchKeys([server.definition.id, server.definition.label]);
}

function getActiveSessionServerLifecycleAction(server) {
  if (!server.enabled) {
    return void 0;
  }
  return server.status === "stopped" /* Stopped */ || server.status === "error" /* Error */ ? new Action(
    "mcpServer.activeSession.start",
    localize(9688, null),
    void 0,
    true,
    () => server.start()
  ) : new Action(
    "mcpServer.activeSession.stop",
    localize(9689, null),
    void 0,
    true,
    () => server.stop()
  );
}

function getSessionEnablementAction(server) {
  return new Action(
    server.enabled ? "mcpServer.session.disable" : "mcpServer.session.enable",
    server.enabled ? localize(9738, null) : localize(9739, null),
    void 0,
    true,
    () => {
      server.setEnabled(!server.enabled);
      return Promise.resolve();
    }
  );
}

function getAgentHostMcpServerEnablementActions(agentHostCustomizations, sessionResource, server, isEmptyWorkbench) {
  const set = (kind, enabled) => agentHostCustomizations.setCustomizationEnablement(sessionResource, server.id, server.enablement, kind, enabled);
  const actions = [];
  if (!server.enabled) {
    actions.push(new Action("mcpServer.agentHost.enable", localize(9695, null), void 0, true, () => {
      set("global" /* Global */, true);
    }));
    if (!isEmptyWorkbench) {
      actions.push(new Action("mcpServer.agentHost.enableWorkspace", localize(9696, null), void 0, true, () => {
        set("workspace" /* Workspace */, true);
      }));
    }
  } else {
    actions.push(new Action("mcpServer.agentHost.disable", localize(9693, null), void 0, true, () => {
      set("global" /* Global */, false);
    }));
    if (!isEmptyWorkbench) {
      actions.push(new Action("mcpServer.agentHost.disableWorkspace", localize(9694, null), void 0, true, () => {
        set("workspace" /* Workspace */, false);
      }));
    }
  }
  return actions;
}

function getLocalMcpServerEnablementActions(mcpService, serverId, isEmptyWorkbench) {
  const disabled = isContributionDisabled(mcpService.enablementModel.readEnabled(serverId));
  const actions = [];
  if (disabled) {
    actions.push(new Action("mcpServer.builtin.enable", localize(9704, null), void 0, true, () => {
      mcpService.enablementModel.setEnabled(serverId, 2 /* EnabledProfile */);
    }));
    if (!isEmptyWorkbench) {
      actions.push(new Action("mcpServer.builtin.enableWorkspace", localize(9705, null), void 0, true, () => {
        mcpService.enablementModel.setEnabled(serverId, 3 /* EnabledWorkspace */);
      }));
    }
  } else {
    actions.push(new Action("mcpServer.builtin.disable", localize(9702, null), void 0, true, () => {
      mcpService.enablementModel.setEnabled(serverId, 0 /* DisabledProfile */);
    }));
    if (!isEmptyWorkbench) {
      actions.push(new Action("mcpServer.builtin.disableWorkspace", localize(9703, null), void 0, true, () => {
        mcpService.enablementModel.setEnabled(serverId, 1 /* DisabledWorkspace */);
      }));
    }
  }
  return actions;
}

function getActiveSessionServerOptionsActions(commandService, agentHostCustomizations, isEmptyWorkbench, sessionResource, server) {
  const actions = [];
  const lifecycleAction = getActiveSessionServerLifecycleAction(server);
  if (lifecycleAction) {
    actions.push(lifecycleAction);
  }
  const durableActions = getAgentHostMcpServerEnablementActions(agentHostCustomizations, sessionResource, server, isEmptyWorkbench);
  if (durableActions.length > 0) {
    if (actions.length > 0) {
      actions.push(new Separator());
    }
    actions.push(...durableActions);
  }
  actions.push(getSessionEnablementAction(server));
  actions.push(new Separator());
  actions.push(new Action(
    "mcpServer.activeSession.options",
    localize(9687, null),
    void 0,
    true,
    async () => {
      await commandService.executeCommand("workbench.mcp.agentHostServerOptions" /* AgentHostServerOptions */, sessionResource, server.id);
    }
  ));
  return actions;
}

function shouldHideLocalActionForActiveSessionServer(action) {
  return action instanceof StartServerAction || action instanceof StopServerAction || action instanceof RestartServerAction || action instanceof ConfigureModelAccessAction || action instanceof ShowSamplingRequestsAction;
}

function isLocalMcpServerEnablementAction(action) {
  return action instanceof EnableMcpServerGloballyAction || action instanceof EnableMcpServerForWorkspaceAction || action instanceof DisableMcpServerGloballyAction || action instanceof DisableMcpServerForWorkspaceAction;
}

function createBuiltinEntry(server, activeSessionServer) {
  return {
    type: "builtin-item",
    id: `builtin-${server.definition.id}`,
    label: server.definition.label,
    description: "",
    collectionId: server.collection.id,
    activeSessionServer,
    localServer: server
  };
}

var MCP_GALLERY_ITEM_TEMPLATE_ID = "mcpGalleryItem";

var McpGalleryItemProvider = class {
  constructor(mcpWorkbenchService) {
    this.mcpWorkbenchService = mcpWorkbenchService;
  }
  getLabel(element) {
    return element.server.label;
  }
  getPublisherDisplayName(element) {
    return element.server.publisherDisplayName;
  }
  getDescription(element) {
    return element.server.description;
  }
  getInstallState(element) {
    switch (element.server.installState) {
      case 1 /* Installed */:
        return 2 /* Installed */;
      case 0 /* Installing */:
        return 1 /* Installing */;
      default:
        return 0 /* Uninstalled */;
    }
  }
  canInstall(element) {
    return this.mcpWorkbenchService.canInstall(element.server) === true;
  }
  async install(element) {
    await this.mcpWorkbenchService.install(element.server);
  }
  onDidChangeInstallState(element, listener) {
    return this.mcpWorkbenchService.onChange((changed) => {
      if (!changed || changed.id === element.server.id) {
        listener();
      }
    });
  }
};

var McpListWidget = class extends Disposable {
  constructor(omitOpenCodeShared, instantiationService, mcpWorkbenchService, mcpService, mcpRegistry, commandService, openerService, contextViewService, contextMenuService, hoverService, agentPluginService, dialogService, configurationService, customizationHarnessService, agentHostCustomizationService, workspaceService) {
    super();
    this.omitOpenCodeShared = omitOpenCodeShared;
    this.instantiationService = instantiationService;
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.mcpService = mcpService;
    this.mcpRegistry = mcpRegistry;
    this.commandService = commandService;
    this.openerService = openerService;
    this.contextViewService = contextViewService;
    this.contextMenuService = contextMenuService;
    this.hoverService = hoverService;
    this.agentPluginService = agentPluginService;
    this.dialogService = dialogService;
    this.configurationService = configurationService;
    this.customizationHarnessService = customizationHarnessService;
    this.agentHostCustomizationService = agentHostCustomizationService;
    this.workspaceService = workspaceService;
    this._onDidSelectServer = this._register(new Emitter());
    this.onDidSelectServer = this._onDidSelectServer.event;
    this._onDidChangeItemCount = this._register(new Emitter());
    this.onDidChangeItemCount = this._onDidChangeItemCount.event;
    this._onDidRequestShowPlugin = this._register(new Emitter());
    this.onDidRequestShowPlugin = this._onDidRequestShowPlugin.event;
    this.disabledLinkListener = this._register(new MutableDisposable());
    this.filteredServers = [];
    this.filteredBuiltinCount = 0;
    this.filteredActiveSessionCount = 0;
    this.displayEntries = [];
    this.galleryServers = [];
    this.searchQuery = "";
    this.browseMode = false;
    this.lastHeight = 0;
    this.lastWidth = 0;
    this.lastHeaderHeight = 0;
    this._layoutDeferred = false;
    this.collapsedGroups = /* @__PURE__ */ new Set();
    this.delayedFilter = new Delayer(200);
    this.delayedGallerySearch = new Delayer(400);
    this._closeCustomizationEditor = () => Promise.resolve();
    this.element = $86(".mcp-list-widget");
    this.create();
    this.updateAccessState();
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(mcpAccessConfig)) {
        this.updateAccessState();
      }
    }));
    this._register({
      dispose: () => {
        this.galleryCts?.dispose();
      }
    });
  }
  setCloseCustomizationEditor(closeCustomizationEditor) {
    this._closeCustomizationEditor = closeCustomizationEditor;
  }
  create() {
    this.sectionTitleHeader = append(this.element, $86(".section-title-header"));
    const titleRow = append(this.sectionTitleHeader, $86(".section-title-row"));
    const sectionTitle = append(titleRow, $86("h2.section-title"));
    sectionTitle.textContent = localize(9726, null);
    const sectionTitleDescription = append(this.sectionTitleHeader, $86("p.section-title-description"));
    const sectionTitleDescriptionText = append(sectionTitleDescription, $86("span.section-title-description-text"));
    sectionTitleDescriptionText.textContent = localize(9727, null);
    sectionTitleDescription.appendChild(document.createTextNode(" "));
    this.sectionLink = append(sectionTitleDescription, $86("a.section-title-link"));
    this.sectionLink.textContent = localize(9717, null);
    this.sectionLink.href = "https://code.visualstudio.com/docs/agent-customization/mcp-servers?referrer=in-product";
    this._register(addDisposableListener(this.sectionLink, "click", (e) => {
      e.preventDefault();
      const href = this.sectionLink.href;
      if (href) {
        this.openerService.open(URI.parse(href));
      }
    }));
    const targetWindow = getWindow(this.element);
    const headerObserver = this._register(new DisposableResizeObserver(
      "McpListWidget.sectionTitleHeader",
      () => {
        if (this.lastWidth <= 0 || this.lastHeight <= 0) {
          return;
        }
        const headerHeight = this.sectionTitleHeader.offsetHeight;
        if (headerHeight === this.lastHeaderHeight) {
          return;
        }
        this.layout(this.lastHeight, this.lastWidth);
      },
      targetWindow
    ));
    this._register(headerObserver.observe(this.sectionTitleHeader));
    this.searchAndButtonContainer = append(this.element, $86(".list-search-and-button-container"));
    const searchContainer = append(this.searchAndButtonContainer, $86(".list-search-container"));
    this.searchInput = this._register(new InputBox(searchContainer, this.contextViewService, {
      placeholder: localize(9737, null),
      inputBoxStyles: defaultInputBoxStyles
    }));
    this._register(this.searchInput.onDidChange(() => {
      this.searchQuery = this.searchInput.value;
      if (this.browseMode) {
        this.delayedGallerySearch.trigger(() => this.queryGallery());
      } else {
        this.delayedFilter.trigger(() => this.filterServers());
      }
    }));
    const buttonContainer = append(this.searchAndButtonContainer, $86(".list-button-group"));
    const backButtonContainer = append(buttonContainer, $86(".list-add-button-container"));
    this.backButton = this._register(new Button(backButtonContainer, {
      ...defaultButtonStyles,
      secondary: true,
      supportIcons: true,
      title: localize(9698, null),
      ariaLabel: localize(9698, null)
    }));
    this.backButton.label = `$(${Codicon.arrowLeft.id}) ${localize(9723, null)}`;
    this.backButton.element.classList.add("list-add-button");
    backButtonContainer.style.display = "none";
    this._register(this.backButton.onDidClick(() => {
      this.toggleBrowseMode(false);
    }));
    const browseButtonContainer = append(buttonContainer, $86(".list-add-button-container"));
    this.browseButton = this._register(new Button(browseButtonContainer, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    this.browseButton.label = `$(${Codicon.library.id}) ${localize(9699, null)}`;
    this.browseButton.element.classList.add("list-add-button");
    this._register(this.browseButton.onDidClick(() => {
      this.toggleBrowseMode(!this.browseMode);
    }));
    this.addButton = this._register(new Button(buttonContainer, {
      ...defaultButtonStyles,
      secondary: true,
      supportIcons: true,
      title: localize(9691, null),
      ariaLabel: localize(9691, null)
    }));
    this.addButton.label = `$(${Codicon.add.id})`;
    this.addButton.element.classList.add("list-icon-button");
    this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), this.addButton.element, localize(9692, null)));
    this._register(this.addButton.onDidClick(() => {
      this.commandService.executeCommand("workbench.mcp.addConfiguration" /* AddConfiguration */);
    }));
    this.emptyContainer = append(this.element, $86(".mcp-empty-state"));
    const emptyHeader = append(this.emptyContainer, $86(".empty-state-header"));
    this.emptyText = append(emptyHeader, $86(".empty-text"));
    this.emptySubtext = append(this.emptyContainer, $86(".empty-subtext"));
    this.disabledContainer = append(this.element, $86(".mcp-disabled-state"));
    const disabledHeader = append(this.disabledContainer, $86(".empty-state-header"));
    this.disabledIcon = append(disabledHeader, $86(".empty-icon"));
    const disabledText = append(disabledHeader, $86(".empty-text"));
    disabledText.textContent = localize(9722, null);
    this.disabledMessage = append(this.disabledContainer, $86(".empty-subtext"));
    this.listContainer = append(this.element, $86(".mcp-list-container"));
    const delegate = new McpServerItemDelegate();
    const groupHeaderRenderer = new CustomizationGroupHeaderRenderer("mcpGroupHeader", this.hoverService);
    const localRenderer = this.instantiationService.createInstance(McpServerItemRenderer, () => this._closeCustomizationEditor());
    const galleryRenderer = new GalleryItemRenderer(MCP_GALLERY_ITEM_TEMPLATE_ID, new McpGalleryItemProvider(this.mcpWorkbenchService));
    this.list = this._register(this.instantiationService.createInstance(
      WorkbenchList,
      "McpManagementList",
      this.listContainer,
      delegate,
      [groupHeaderRenderer, localRenderer, galleryRenderer],
      {
        multipleSelectionSupport: false,
        setRowLineHeight: false,
        horizontalScrolling: false,
        accessibilityProvider: {
          getAriaLabel: (element) => {
            return getMcpEntryAriaLabel(element, this.workspaceService.isSessionsWindow);
          },
          getWidgetAriaLabel() {
            return localize(9728, null);
          }
        },
        openOnSingleClick: true,
        identityProvider: {
          getId(element) {
            if (element.type === "group-header") {
              return element.id;
            }
            if (element.type === "builtin-item") {
              return element.id;
            }
            return element.server.id;
          },
          getGroupId(element) {
            return element.type === "group-header" ? NotSelectableGroupId : 0;
          }
        }
      }
    ));
    this._register(this.list.onDidOpen((e) => {
      if (e.element) {
        if (e.element.type === "group-header") {
          this.toggleGroup(e.element);
        } else if (e.element.type === "server-item") {
          this._onDidSelectServer.fire(e.element.server);
        } else if (e.element.type === "session-server-item") {
          this.openActiveSessionServerOptions(e.element.server);
        }
      }
    }));
    this._register(this.list.onContextMenu((e) => this.onContextMenu(e)));
    this._register(this.mcpWorkbenchService.onChange(() => {
      if (!this.browseMode) {
        this.refresh();
      }
    }));
    this._register(autorun((reader) => {
      this.mcpService.servers.read(reader);
      if (!this.browseMode) {
        this.refresh();
      }
    }));
    this._register(autorun((reader) => {
      this.customizationHarnessService.activeSessionResource.read(reader);
      if (!this.browseMode) {
        this.refresh();
      }
    }));
    this._register(this.agentHostCustomizationService.onDidChangeCustomizations(() => {
      if (!this.browseMode) {
        this.refresh();
      }
    }));
    void this.refresh();
  }
  async refresh() {
    if (this.browseMode) {
      await this.queryGallery();
    } else {
      this.filterServers();
    }
  }
  updateAccessState() {
    const inspect = this.configurationService.inspect(mcpAccessConfig);
    const value2 = inspect.value ?? inspect.defaultValue;
    const disabled = value2 === "none" /* None */;
    const policyLocked = inspect.policyValue === "none" /* None */;
    this.element.classList.toggle("access-disabled", disabled);
    if (disabled) {
      this.disabledIcon.className = "empty-icon";
      this.disabledIcon.classList.add(...ThemeIcon.asClassNameArray(policyLocked ? Codicon.shield : mcpServerIcon));
      clearNode(this.disabledMessage);
      this.disabledLinkListener.clear();
      if (policyLocked) {
        this.disabledMessage.textContent = localize(9719, null);
      } else {
        this.disabledMessage.appendChild(document.createTextNode(localize(9720, null)));
        const link2 = append(this.disabledMessage, $86("a.mcp-disabled-settings-link"));
        link2.textContent = localize(9721, null);
        link2.href = "#";
        link2.setAttribute("role", "button");
        this.disabledLinkListener.value = addDisposableListener(link2, "click", (e) => {
          e.preventDefault();
          this.commandService.executeCommand("workbench.action.openSettings", `@id:${mcpAccessConfig}`);
        });
      }
    }
  }
  showBrowseMarketplace() {
    if (!this.browseMode) {
      this.toggleBrowseMode(true);
    }
  }
  toggleBrowseMode(browse) {
    this.browseMode = browse;
    this.searchInput.value = "";
    this.searchQuery = "";
    this.addButton.element.style.display = browse ? "none" : "";
    this.browseButton.element.parentElement.style.display = browse ? "none" : "";
    this.backButton.element.parentElement.style.display = browse ? "" : "none";
    this.searchInput.setPlaceHolder(
      browse ? localize(9736, null) : localize(9737, null)
    );
    if (browse) {
      void this.queryGallery();
    } else {
      this.galleryCts?.dispose(true);
      this.galleryServers = [];
      this.filterServers();
    }
    if (this.lastHeight > 0) {
      this.layout(this.lastHeight, this.lastWidth);
    }
  }
  async queryGallery() {
    this.galleryCts?.dispose(true);
    const cts = this.galleryCts = new CancellationTokenSource();
    this.emptyContainer.style.display = "flex";
    this.listContainer.style.display = "none";
    this.emptyText.textContent = localize(9718, null);
    this.emptySubtext.textContent = "";
    try {
      const pager = await this.mcpWorkbenchService.queryGallery(
        { text: this.searchQuery.trim() || void 0 },
        cts.token
      );
      if (cts.token.isCancellationRequested) {
        return;
      }
      this.galleryServers = pager.firstPage.items;
      this.updateGalleryList();
    } catch {
      if (!cts.token.isCancellationRequested) {
        this.galleryServers = [];
        this.emptyContainer.style.display = "flex";
        this.listContainer.style.display = "none";
        this.emptyText.textContent = localize(9716, null);
        this.emptySubtext.textContent = localize(9746, null);
      }
    }
  }
  updateGalleryList() {
    if (this.galleryServers.length === 0) {
      this.emptyContainer.style.display = "flex";
      this.listContainer.style.display = "none";
      if (this.searchQuery.trim()) {
        this.emptyText.textContent = localize(9730, null, this.searchQuery);
        this.emptySubtext.textContent = localize(9747, null);
      } else {
        this.emptyText.textContent = localize(9710, null);
        this.emptySubtext.textContent = "";
      }
    } else {
      this.emptyContainer.style.display = "none";
      this.listContainer.style.display = "";
    }
    const entries2 = this.galleryServers.map((server) => ({ type: "server-item", server, marketplace: true }));
    this.list.splice(0, this.list.length, entries2);
  }
  filterServers() {
    const query = this.searchQuery.toLowerCase().trim();
    const activeSessionResource = this.customizationHarnessService.activeSessionResource.get();
    const activeSessionMatcher = new ActiveSessionMcpServerMatcher(this.agentHostCustomizationService.getMcpServers(activeSessionResource));
    const localServerMatcher = new LocalMcpServerMatcher(this.mcpService.servers.get());
    if (query) {
      this.filteredServers = this.mcpWorkbenchService.local.filter(
        (server) => server.label.toLowerCase().includes(query) || server.description?.toLowerCase().includes(query)
      );
    } else {
      this.filteredServers = [...this.mcpWorkbenchService.local];
    }
    const localIds = new Set(this.filteredServers.map((s) => s.id));
    const collectionSources = new Map(this.mcpRegistry.collections.get().map((c) => [c.id, c.source]));
    const builtinServers = this.mcpService.servers.get().filter((s) => !localIds.has(s.definition.id)).filter((s) => !query || s.definition.label.toLowerCase().includes(query)).filter((s) => !this.omitOpenCodeShared || !(s.definition.label.startsWith("OpenCode \xB7 ") && /\[[a-z][a-z0-9_]{1,16}\]$/.test(s.definition.label) && collectionSources.get(s.collection.id) instanceof ExtensionIdentifier && ExtensionIdentifier.equals(collectionSources.get(s.collection.id), new ExtensionIdentifier("opencode.opencode"))));
    const groups = [
      { scope: "workspace" /* Workspace */, label: localize(9752, null), icon: workspaceIcon, description: localize(9753, null), entries: [] },
      { scope: "user" /* User */, label: localize(9750, null), icon: userIcon, description: localize(9751, null), entries: [] }
    ];
    for (const server of this.filteredServers) {
      const entry = {
        type: "server-item",
        server,
        activeSessionServer: activeSessionMatcher.take(getWorkbenchServerMatchKeys(server)),
        localServer: localServerMatcher.find(getWorkbenchServerMatchKeys(server))
      };
      const scope = server.local?.scope;
      if (scope === "workspace" /* Workspace */) {
        groups[0].entries.push(entry);
      } else {
        groups[1].entries.push(entry);
      }
    }
    const pluginServers = [];
    const extensionServers = [];
    const otherBuiltinServers = [];
    for (const server of builtinServers) {
      const entry = { server, activeSessionServer: activeSessionMatcher.take(getRuntimeServerMatchKeys(server)) };
      const source = collectionSources.get(server.collection.id);
      if (server.collection.id.startsWith(PLUGIN_COLLECTION_PREFIX)) {
        pluginServers.push(entry);
      } else if (source instanceof ExtensionIdentifier && !isCopilotExtension(source)) {
        extensionServers.push(entry);
      } else {
        otherBuiltinServers.push(entry);
      }
    }
    const activeSessionOnlyServers = activeSessionMatcher.unmatched(query);
    for (const server of activeSessionOnlyServers) {
      groups[0].entries.push({ type: "session-server-item", server });
    }
    if (this.filteredServers.length === 0 && builtinServers.length === 0 && activeSessionOnlyServers.length === 0) {
      this.emptyContainer.style.display = "flex";
      this.listContainer.style.display = "none";
      if (this.searchQuery.trim()) {
        this.emptyText.textContent = localize(9731, null, this.searchQuery);
        this.emptySubtext.textContent = localize(9747, null);
      } else {
        this.emptyText.textContent = localize(9732, null);
        this.emptySubtext.textContent = localize(9690, null);
      }
    } else {
      this.emptyContainer.style.display = "none";
      this.listContainer.style.display = "";
    }
    const entries2 = [];
    let isFirst = true;
    for (const group2 of groups) {
      if (group2.entries.length === 0) {
        continue;
      }
      const collapsed2 = this.collapsedGroups.has(group2.scope);
      entries2.push({
        type: "group-header",
        id: `mcp-group-${group2.scope}`,
        scope: group2.scope,
        label: group2.label,
        icon: group2.icon,
        count: group2.entries.length,
        isFirst,
        description: group2.description,
        collapsed: collapsed2
      });
      if (!collapsed2) {
        entries2.push(...group2.entries);
      }
      isFirst = false;
    }
    if (pluginServers.length > 0) {
      const collapsed2 = this.collapsedGroups.has("plugin");
      entries2.push({
        type: "group-header",
        id: "mcp-group-plugin",
        scope: "plugin",
        label: localize(9733, null),
        icon: pluginIcon,
        count: pluginServers.length,
        isFirst,
        description: localize(9734, null),
        collapsed: collapsed2
      });
      if (!collapsed2) {
        for (const { server, activeSessionServer } of pluginServers) {
          entries2.push(createBuiltinEntry(server, activeSessionServer));
        }
      }
      isFirst = false;
    }
    if (extensionServers.length > 0) {
      const collapsed2 = this.collapsedGroups.has("extension");
      entries2.push({
        type: "group-header",
        id: "mcp-group-extension",
        scope: "extension",
        label: localize(9713, null),
        icon: extensionIcon,
        count: extensionServers.length,
        isFirst,
        description: localize(9714, null),
        collapsed: collapsed2
      });
      if (!collapsed2) {
        for (const { server, activeSessionServer } of extensionServers) {
          entries2.push(createBuiltinEntry(server, activeSessionServer));
        }
      }
      isFirst = false;
    }
    if (otherBuiltinServers.length > 0) {
      const collapsed2 = this.collapsedGroups.has("builtin");
      entries2.push({
        type: "group-header",
        id: "mcp-group-builtin",
        scope: "builtin",
        label: localize(9700, null),
        icon: builtinIcon,
        count: otherBuiltinServers.length,
        isFirst,
        description: localize(9701, null),
        collapsed: collapsed2
      });
      if (!collapsed2) {
        for (const { server, activeSessionServer } of otherBuiltinServers) {
          entries2.push(createBuiltinEntry(server, activeSessionServer));
        }
      }
      isFirst = false;
    }
    this.displayEntries = entries2;
    this.list.splice(0, this.list.length, this.displayEntries);
    this.filteredBuiltinCount = builtinServers.length;
    this.filteredActiveSessionCount = activeSessionOnlyServers.length;
    this._onDidChangeItemCount.fire(this.itemCount);
  }
  /**
   * Gets the total item count from the underlying data arrays
   * (the same source used to build group headers).
   */
  get itemCount() {
    return this.filteredServers.length + this.filteredBuiltinCount + this.filteredActiveSessionCount;
  }
  /**
   * Re-fires the current item count. Call after subscribing to onDidChangeItemCount
   * to ensure the subscriber receives the latest count.
   */
  fireItemCount() {
    this._onDidChangeItemCount.fire(this.itemCount);
  }
  /**
   * Toggles the collapsed state of a group.
   */
  toggleGroup(entry) {
    if (this.collapsedGroups.has(entry.scope)) {
      this.collapsedGroups.delete(entry.scope);
    } else {
      this.collapsedGroups.add(entry.scope);
    }
    this.filterServers();
  }
  /**
   * Whether the widget is currently in marketplace browse mode.
   */
  isInBrowseMode() {
    return this.browseMode;
  }
  /**
   * Exits marketplace browse mode and returns to the installed servers list.
   */
  exitBrowseMode() {
    if (this.browseMode) {
      this.toggleBrowseMode(false);
    }
  }
  /**
   * Layouts the widget.
   */
  layout(height, width2) {
    this.lastHeight = height;
    this.lastWidth = width2;
    this.element.style.height = "";
    const availableHeight = this.element.clientHeight || height;
    const availableWidth = this.element.clientWidth || width2;
    const searchBarHeight = this.searchAndButtonContainer.offsetHeight;
    if (searchBarHeight === 0 && !this._layoutDeferred) {
      this._layoutDeferred = true;
      getWindow(this.element).requestAnimationFrame(() => {
        try {
          this.layout(this.lastHeight, this.lastWidth);
        } finally {
          this._layoutDeferred = false;
        }
      });
      return;
    }
    const headerHeight = this.sectionTitleHeader.offsetHeight;
    this.lastHeaderHeight = headerHeight;
    const listHeight = Math.max(0, availableHeight - searchBarHeight - headerHeight);
    this.listContainer.style.height = `${listHeight}px`;
    this.list.layout(listHeight, availableWidth);
  }
  /**
   * Focuses the search input.
   */
  focusSearch() {
    this.searchInput.focus();
  }
  /**
   * Scrolls the list so the last item is visible.
   */
  revealLastItem() {
    if (this.list.length > 0) {
      this.list.reveal(this.list.length - 1);
    }
  }
  /**
   * Focuses the list.
   */
  focus() {
    this.list.domFocus();
    const servers = this.list.length;
    if (servers > 0) {
      this.list.setFocus([0]);
    }
  }
  openActiveSessionServerOptions(server) {
    void this.commandService.executeCommand("workbench.mcp.agentHostServerOptions" /* AgentHostServerOptions */, this.customizationHarnessService.activeSessionResource.get(), server.id);
  }
  /**
   * Handles context menu for MCP server items.
   */
  onContextMenu(e) {
    if (!e.element) {
      return;
    }
    if (e.element.type === "session-server-item") {
      const disposables2 = new DisposableStore();
      const isEmptyWorkbench = this.workspaceService.getActiveProjectRoot() === void 0;
      const activeSessionActions = getActiveSessionServerOptionsActions(this.commandService, this.agentHostCustomizationService, isEmptyWorkbench, this.customizationHarnessService.activeSessionResource.get(), e.element.server);
      activeSessionActions.forEach((action) => isDisposable(action) && disposables2.add(action));
      this.contextMenuService.showContextMenu({
        getAnchor: () => e.anchor,
        getActions: () => activeSessionActions,
        onHide: () => disposables2.dispose()
      });
      return;
    }
    if (e.element.type === "builtin-item") {
      const collectionId = e.element.collectionId;
      const pluginUriStr = getPluginUriFromCollectionId(collectionId);
      const plugin = pluginUriStr ? this.agentPluginService.plugins.get().find((p) => p.uri.toString() === pluginUriStr) : void 0;
      const disposables2 = new DisposableStore();
      const actions2 = [];
      const lifecycleAction = e.element.activeSessionServer ? getActiveSessionServerLifecycleAction(e.element.activeSessionServer) : void 0;
      if (lifecycleAction) {
        actions2.push(disposables2.add(lifecycleAction));
      }
      if (e.element.localServer) {
        const isEmptyWorkbench = this.workspaceService.getActiveProjectRoot() === void 0;
        const enablementActions = getLocalMcpServerEnablementActions(this.mcpService, e.element.localServer.definition.id, isEmptyWorkbench);
        if (enablementActions.length > 0) {
          if (actions2.length > 0) {
            actions2.push(new Separator());
          }
          for (const enablementAction of enablementActions) {
            if (isDisposable(enablementAction)) {
              disposables2.add(enablementAction);
            }
            actions2.push(enablementAction);
          }
        }
      }
      if (e.element.activeSessionServer) {
        const sessionAction = getSessionEnablementAction(e.element.activeSessionServer);
        if (isDisposable(sessionAction)) {
          disposables2.add(sessionAction);
        }
        actions2.push(sessionAction);
      }
      if (plugin) {
        if (actions2.length > 0) {
          actions2.push(new Separator());
        }
        actions2.push(disposables2.add(new Action(
          "mcpServer.showPlugin",
          localize(9741, null),
          void 0,
          true,
          async () => {
            const item = {
              kind: "installed" /* Installed */,
              name: plugin.label,
              description: plugin.fromMarketplace?.description ?? "",
              marketplace: plugin.fromMarketplace?.marketplace,
              plugin
            };
            this._onDidRequestShowPlugin.fire(item);
          }
        )));
        actions2.push(disposables2.add(new Action(
          "mcpServer.uninstallPlugin",
          localize(9748, null),
          void 0,
          true,
          async () => {
            const result = await this.dialogService.confirm({
              message: localize(9707, null, plugin.label),
              detail: localize(9708, null),
              primaryButton: localize(9749, null),
              type: "question"
            });
            if (result.confirmed) {
              plugin.remove?.();
            }
          }
        )));
      }
      if (actions2.length === 0) {
        disposables2.dispose();
        return;
      }
      this.contextMenuService.showContextMenu({
        getAnchor: () => e.anchor,
        getActions: () => actions2,
        onHide: () => disposables2.dispose()
      });
      return;
    }
    if (e.element.type !== "server-item") {
      return;
    }
    const serverEntry = e.element;
    const disposables = new DisposableStore();
    const mcpServer = this.mcpWorkbenchService.local.find((local) => local.id === serverEntry.server.id) || serverEntry.server;
    const groups = getContextMenuActions3(mcpServer, false, this.instantiationService);
    const actions = [];
    const activeSessionLifecycleAction = serverEntry.activeSessionServer ? getActiveSessionServerLifecycleAction(serverEntry.activeSessionServer) : void 0;
    const activeSessionEnablementAction = serverEntry.activeSessionServer ? getSessionEnablementAction(serverEntry.activeSessionServer) : void 0;
    let sessionEnablementAdded = false;
    if (activeSessionLifecycleAction) {
      actions.push(disposables.add(activeSessionLifecycleAction));
      actions.push(new Separator());
    }
    if (activeSessionEnablementAction && isDisposable(activeSessionEnablementAction)) {
      disposables.add(activeSessionEnablementAction);
    }
    for (const menuActions of groups) {
      for (const menuAction of menuActions) {
        if (isDisposable(menuAction)) {
          disposables.add(menuAction);
        }
      }
      const visibleMenuActions = serverEntry.activeSessionServer ? menuActions.filter((action) => !shouldHideLocalActionForActiveSessionServer(action)) : menuActions;
      for (const menuAction of visibleMenuActions) {
        actions.push(menuAction);
      }
      if (activeSessionEnablementAction && menuActions.some(isLocalMcpServerEnablementAction)) {
        actions.push(activeSessionEnablementAction);
        sessionEnablementAdded = true;
      }
      if (visibleMenuActions.length > 0) {
        actions.push(new Separator());
      }
    }
    if (activeSessionEnablementAction && !sessionEnablementAdded) {
      actions.push(activeSessionEnablementAction);
    }
    if (actions.length > 0 && actions[actions.length - 1] instanceof Separator) {
      actions.pop();
    }
    this.contextMenuService.showContextMenu({
      getAnchor: () => e.anchor,
      getActions: () => actions,
      onHide: () => disposables.dispose()
    });
  }
};

McpListWidget = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IMcpWorkbenchService),
  __decorateParam(3, IMcpService),
  __decorateParam(4, IMcpRegistry),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, IContextViewService),
  __decorateParam(8, IContextMenuService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, IAgentPluginService),
  __decorateParam(11, IDialogService),
  __decorateParam(12, IConfigurationService),
  __decorateParam(13, ICustomizationHarnessService),
  __decorateParam(14, IAgentHostCustomizationService),
  __decorateParam(15, IAICustomizationWorkspaceService)
], McpListWidget);
export { isCopilotExtension, getPluginUriFromCollectionId, registerMcpInlineButtonAction, authenticateMcpServer, getMcpServerOutputHandler, getMcpStatusPresentation, getActiveSessionServer, getMcpEntryLabel, getMcpStatusKind, getMcpEntryAriaLabel, normalizeMcpMatchKey, getUniqueMcpMatchKeys, matchesActiveSessionServerQuery, getWorkbenchServerMatchKeys, getRuntimeServerMatchKeys, getActiveSessionServerLifecycleAction, getSessionEnablementAction, getAgentHostMcpServerEnablementActions, getLocalMcpServerEnablementActions, getActiveSessionServerOptionsActions, shouldHideLocalActionForActiveSessionServer, isLocalMcpServerEnablementAction, createBuiltinEntry, $86, MCP_ITEM_HEIGHT, MCP_ITEM_WITH_DESCRIPTION_HEIGHT, PLUGIN_COLLECTION_PREFIX, COPILOT_EXTENSION_IDS, McpServerItemDelegate, McpServerItemRenderer, ActiveSessionMcpServerMatcher, LocalMcpServerMatcher, MCP_GALLERY_ITEM_TEMPLATE_ID, McpGalleryItemProvider, McpListWidget };
