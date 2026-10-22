// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/browser/mcpServerActions.ts
import { Action, Separator } from "./module-0082.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ActionWithDropdownActionViewItem } from "./module-0502.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ActionViewItem } from "./module-0476.mjs";
import { getWorkbenchMenuMotionContextMenuOptions } from "./module-1853.mjs";
import { disposeIfDisposable } from "./module-0012.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { localize } from "./module-0001.mjs";
import { alert } from "./module-0076.mjs";
import { startServerByFilter } from "./module-2174.mjs";
import { IMcpSamplingService, IMcpService, IMcpWorkbenchService, McpConnectionState } from "./module-1206.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { Schemas } from "./module-0033.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { ILabelService } from "./module-0641.mjs";
import { isContributionDisabled, isContributionEnabled } from "./module-1019.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { errorIcon, infoIcon, manageExtensionIcon, trustIcon, warningIcon2 } from "./module-1851.mjs";
import { IAuthenticationQueryService } from "./module-1696.mjs";
import { IAuthenticationService } from "./module-0952.mjs";
import { URI } from "./module-0032.mjs";
import { IMcpRegistry } from "./module-1446.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ICommandService } from "./module-0087.mjs";
import { severity_default } from "./module-0266.mjs";


// src/vs/workbench/contrib/mcp/browser/mcpServerActions.ts
var McpServerAction = class _McpServerAction extends Action {
  constructor() {
    super(...arguments);
    this._onDidChange = this._register(new Emitter());
    this._hidden = false;
    this.hideOnDisabled = true;
    this._mcpServer = null;
  }
  get onDidChange() {
    return this._onDidChange.event;
  }
  static {
    this.EXTENSION_ACTION_CLASS = "extension-action";
  }
  static {
    this.TEXT_ACTION_CLASS = `${_McpServerAction.EXTENSION_ACTION_CLASS} text`;
  }
  static {
    this.LABEL_ACTION_CLASS = `${_McpServerAction.EXTENSION_ACTION_CLASS} label`;
  }
  static {
    this.PROMINENT_LABEL_ACTION_CLASS = `${_McpServerAction.LABEL_ACTION_CLASS} prominent`;
  }
  static {
    this.ICON_ACTION_CLASS = `${_McpServerAction.EXTENSION_ACTION_CLASS} icon`;
  }
  get hidden() {
    return this._hidden;
  }
  set hidden(hidden) {
    if (this._hidden !== hidden) {
      this._hidden = hidden;
      this._onDidChange.fire({ hidden });
    }
  }
  _setEnabled(value2) {
    super._setEnabled(value2);
    if (this.hideOnDisabled) {
      this.hidden = !value2;
    }
  }
  get mcpServer() {
    return this._mcpServer;
  }
  set mcpServer(mcpServer) {
    this._mcpServer = mcpServer;
    this.update();
  }
};

var ButtonWithDropDownExtensionAction2 = class extends McpServerAction {
  constructor(id2, clazz, actionsGroups) {
    clazz = `${clazz} action-dropdown`;
    super(id2, void 0, clazz);
    this.actionsGroups = actionsGroups;
    this.menuActionClassNames = [];
    this._menuActions = [];
    this.menuActionClassNames = clazz.split(" ");
    this.hideOnDisabled = false;
    this.actions = actionsGroups.flat();
    this.update();
    this._register(Event2.any(...this.actions.map((a) => a.onDidChange))(() => this.update(true)));
    this.actions.forEach((a) => this._register(a));
  }
  get menuActions() {
    return [...this._menuActions];
  }
  get mcpServer() {
    return super.mcpServer;
  }
  set mcpServer(mcpServer) {
    this.actions.forEach((a) => a.mcpServer = mcpServer);
    super.mcpServer = mcpServer;
  }
  update(donotUpdateActions) {
    if (!donotUpdateActions) {
      this.actions.forEach((a) => a.update());
    }
    const actionsGroups = this.actionsGroups.map((actionsGroup) => actionsGroup.filter((a) => !a.hidden));
    let actions = [];
    for (const visibleActions of actionsGroups) {
      if (visibleActions.length) {
        actions = [...actions, ...visibleActions, new Separator()];
      }
    }
    actions = actions.length ? actions.slice(0, actions.length - 1) : actions;
    this.primaryAction = actions[0];
    this._menuActions = actions.length > 1 ? actions : [];
    this._onDidChange.fire({ menuActions: this._menuActions });
    if (this.primaryAction) {
      this.hidden = false;
      this.enabled = this.primaryAction.enabled;
      this.label = this.getLabel(this.primaryAction);
      this.tooltip = this.primaryAction.tooltip;
    } else {
      this.hidden = true;
      this.enabled = false;
    }
  }
  async run() {
    if (this.enabled) {
      await this.primaryAction?.run();
    }
  }
  getLabel(action) {
    return action.label;
  }
};

var ButtonWithDropdownExtensionActionViewItem2 = class extends ActionWithDropdownActionViewItem {
  constructor(action, options3, contextMenuProvider) {
    super(null, action, options3, contextMenuProvider);
    this._register(action.onDidChange((e4) => {
      if (e4.hidden !== void 0 || e4.menuActions !== void 0) {
        this.updateClass();
      }
    }));
  }
  render(container2) {
    super.render(container2);
    this.updateClass();
  }
  updateClass() {
    super.updateClass();
    if (this.element && this.dropdownMenuActionViewItem?.element) {
      this.element.classList.toggle("hide", this._action.hidden);
      const isMenuEmpty = this._action.menuActions.length === 0;
      this.element.classList.toggle("empty", isMenuEmpty);
      this.dropdownMenuActionViewItem.element.classList.toggle("hide", isMenuEmpty);
    }
  }
};

var DropDownAction = class extends McpServerAction {
  constructor(id2, label3, cssClass, enabled, instantiationService) {
    super(id2, label3, cssClass, enabled);
    this.instantiationService = instantiationService;
    this._actionViewItem = null;
  }
  createActionViewItem(options3) {
    this._actionViewItem = this.instantiationService.createInstance(DropDownExtensionActionViewItem2, this, options3);
    return this._actionViewItem;
  }
  run(actionGroups) {
    this._actionViewItem?.showMenu(actionGroups);
    return Promise.resolve();
  }
};

DropDownAction = __decorateClass([
  __decorateParam(4, IInstantiationService)
], DropDownAction);

var DropDownExtensionActionViewItem2 = class extends ActionViewItem {
  constructor(action, options3, contextMenuService) {
    super(null, action, { ...options3, icon: true, label: true });
    this.contextMenuService = contextMenuService;
  }
  showMenu(menuActionGroups) {
    if (this.element) {
      const actions = this.getActions(menuActionGroups);
      this.contextMenuService.showContextMenu({
        ...getWorkbenchMenuMotionContextMenuOptions(this.element),
        getActions: () => actions,
        actionRunner: this.actionRunner,
        onHide: () => disposeIfDisposable(actions)
      });
    }
  }
  getActions(menuActionGroups) {
    let actions = [];
    for (const menuActions of menuActionGroups) {
      actions = [...actions, ...menuActions, new Separator()];
    }
    return actions.length ? actions.slice(0, actions.length - 1) : actions;
  }
};

DropDownExtensionActionViewItem2 = __decorateClass([
  __decorateParam(2, IContextMenuService)
], DropDownExtensionActionViewItem2);

var InstallAction2 = class extends McpServerAction {
  constructor(open2, mcpWorkbenchService, telemetryService, mcpService) {
    super("extensions.install", localize(17011, null), InstallAction2.CLASS, false);
    this.open = open2;
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.telemetryService = telemetryService;
    this.mcpService = mcpService;
    this.update();
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent install`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  update() {
    this.enabled = false;
    this.class = InstallAction2.HIDE;
    if (!this.mcpServer?.gallery && !this.mcpServer?.installable) {
      return;
    }
    if (this.mcpServer.installState !== 3 /* Uninstalled */) {
      return;
    }
    this.class = InstallAction2.CLASS;
    this.enabled = this.mcpWorkbenchService.canInstall(this.mcpServer) === true;
  }
  async run() {
    if (!this.mcpServer) {
      return;
    }
    if (this.open) {
      this.mcpWorkbenchService.open(this.mcpServer);
      alert(localize(17026, null, this.mcpServer.label));
    }
    this.telemetryService.publicLog2("mcp:action:install", { name: this.mcpServer.gallery?.name });
    const installed = await this.mcpWorkbenchService.install(this.mcpServer);
    await startServerByFilter(this.mcpService, (s) => {
      return s.definition.label === installed.name;
    });
  }
};

InstallAction2 = __decorateClass([
  __decorateParam(1, IMcpWorkbenchService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IMcpService)
], InstallAction2);

var InstallInWorkspaceAction = class extends McpServerAction {
  constructor(open2, mcpWorkbenchService, workspaceService, quickInputService, telemetryService, mcpService) {
    super("extensions.installWorkspace", localize(17016, null), InstallAction2.CLASS, false);
    this.open = open2;
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.workspaceService = workspaceService;
    this.quickInputService = quickInputService;
    this.telemetryService = telemetryService;
    this.mcpService = mcpService;
    this.update();
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent install`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  update() {
    this.enabled = false;
    this.class = InstallInWorkspaceAction.HIDE;
    if (this.workspaceService.getWorkbenchState() === 1 /* EMPTY */) {
      return;
    }
    if (!this.mcpServer?.gallery && !this.mcpServer?.installable) {
      return;
    }
    if (this.mcpServer.installState !== 3 /* Uninstalled */ && this.mcpServer.local?.scope === "workspace" /* Workspace */) {
      return;
    }
    this.class = InstallAction2.CLASS;
    this.enabled = this.mcpWorkbenchService.canInstall(this.mcpServer) === true;
  }
  async run() {
    if (!this.mcpServer) {
      return;
    }
    if (this.open) {
      this.mcpWorkbenchService.open(this.mcpServer, { preserveFocus: true });
      alert(localize(17026, null, this.mcpServer.label));
    }
    const target = await this.getConfigurationTarget();
    if (!target) {
      return;
    }
    this.telemetryService.publicLog2("mcp:action:install:workspace", { name: this.mcpServer.gallery?.name });
    const installed = await this.mcpWorkbenchService.install(this.mcpServer, { target });
    await startServerByFilter(this.mcpService, (s) => {
      return s.definition.label === installed.name;
    });
  }
  async getConfigurationTarget() {
    const options3 = [];
    for (const folder of this.workspaceService.getWorkspace().folders) {
      options3.push({ target: folder, label: folder.name, description: localize(17012, null) });
    }
    if (this.workspaceService.getWorkbenchState() === 3 /* WORKSPACE */) {
      if (options3.length > 0) {
        options3.push({ type: "separator" });
      }
      options3.push({ target: 5 /* WORKSPACE */, label: localize(17025, null) });
    }
    if (options3.length === 1) {
      return options3[0].target;
    }
    const targetPick = await this.quickInputService.pick(options3, {
      title: localize(17024, null)
    });
    return targetPick?.target;
  }
};

InstallInWorkspaceAction = __decorateClass([
  __decorateParam(1, IMcpWorkbenchService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IQuickInputService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, IMcpService)
], InstallInWorkspaceAction);

var InstallInRemoteAction = class extends McpServerAction {
  constructor(open2, mcpWorkbenchService, environmentService, telemetryService, labelService, mcpService) {
    super("extensions.installRemote", localize(17014, null), InstallAction2.CLASS, false);
    this.open = open2;
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.environmentService = environmentService;
    this.telemetryService = telemetryService;
    this.labelService = labelService;
    this.mcpService = mcpService;
    const remoteLabel = this.labelService.getHostLabel(Schemas.vscodeRemote, this.environmentService.remoteAuthority);
    this.label = localize(17015, null, remoteLabel);
    this.update();
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent install`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  update() {
    this.enabled = false;
    this.class = InstallInRemoteAction.HIDE;
    if (!this.environmentService.remoteAuthority) {
      return;
    }
    if (!this.mcpServer?.gallery && !this.mcpServer?.installable) {
      return;
    }
    if (this.mcpServer.installState !== 3 /* Uninstalled */) {
      if (this.mcpServer.local?.scope === "remoteUser" /* RemoteUser */) {
        return;
      }
      if (this.mcpWorkbenchService.local.find((mcpServer) => mcpServer.name === this.mcpServer?.name && mcpServer.local?.scope === "remoteUser" /* RemoteUser */)) {
        return;
      }
    }
    this.class = InstallAction2.CLASS;
    this.enabled = this.mcpWorkbenchService.canInstall(this.mcpServer) === true;
  }
  async run() {
    if (!this.mcpServer) {
      return;
    }
    if (this.open) {
      this.mcpWorkbenchService.open(this.mcpServer);
      alert(localize(17026, null, this.mcpServer.label));
    }
    this.telemetryService.publicLog2("mcp:action:install:remote", { name: this.mcpServer.gallery?.name });
    const installed = await this.mcpWorkbenchService.install(this.mcpServer, { target: 4 /* USER_REMOTE */ });
    await startServerByFilter(this.mcpService, (s) => {
      return s.definition.label === installed.name;
    });
  }
};

InstallInRemoteAction = __decorateClass([
  __decorateParam(1, IMcpWorkbenchService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, ILabelService),
  __decorateParam(5, IMcpService)
], InstallInRemoteAction);

var InstallingLabelAction2 = class _InstallingLabelAction extends McpServerAction {
  static {
    this.LABEL = localize(17013, null);
  }
  static {
    this.CLASS = `${McpServerAction.LABEL_ACTION_CLASS} install installing`;
  }
  constructor() {
    super("extension.installing", _InstallingLabelAction.LABEL, _InstallingLabelAction.CLASS, false);
  }
  update() {
    this.class = `${_InstallingLabelAction.CLASS}${this.mcpServer && this.mcpServer.installState === 0 /* Installing */ ? "" : " hide"}`;
  }
};

var UninstallAction2 = class extends McpServerAction {
  constructor(mcpWorkbenchService) {
    super("extensions.uninstall", localize(17031, null), UninstallAction2.CLASS, false);
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.update();
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent uninstall`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  update() {
    this.enabled = false;
    this.class = UninstallAction2.HIDE;
    if (!this.mcpServer) {
      return;
    }
    if (!this.mcpServer.local) {
      return;
    }
    if (this.mcpServer.installState !== 1 /* Installed */) {
      this.enabled = false;
      return;
    }
    this.class = UninstallAction2.CLASS;
    this.enabled = true;
    this.label = localize(17031, null);
  }
  async run() {
    if (!this.mcpServer) {
      return;
    }
    await this.mcpWorkbenchService.uninstall(this.mcpServer);
  }
};

UninstallAction2 = __decorateClass([
  __decorateParam(0, IMcpWorkbenchService)
], UninstallAction2);

var EnableMcpServerGloballyAction = class extends McpServerAction {
  constructor(mcpService) {
    super(EnableMcpServerGloballyAction.ID, localize(17009, null), McpServerAction.LABEL_ACTION_CLASS);
    this.mcpService = mcpService;
    this.tooltip = localize(17010, null);
    this.update();
  }
  static {
    this.ID = "mcpServer.enableGlobally";
  }
  update() {
    this.enabled = false;
    if (!this.mcpServer?.local) {
      return;
    }
    const server = this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
    if (!server) {
      return;
    }
    const enablement = server.enablement.get();
    this.enabled = isContributionDisabled(enablement);
  }
  async run() {
    if (!this.mcpServer) {
      return;
    }
    this.mcpService.enablementModel.setEnabled(this.mcpServer.id, 2 /* EnabledProfile */);
  }
};

EnableMcpServerGloballyAction = __decorateClass([
  __decorateParam(0, IMcpService)
], EnableMcpServerGloballyAction);

var EnableMcpServerForWorkspaceAction = class extends McpServerAction {
  constructor(mcpService, workspaceService) {
    super(EnableMcpServerForWorkspaceAction.ID, localize(17007, null), McpServerAction.LABEL_ACTION_CLASS);
    this.mcpService = mcpService;
    this.workspaceService = workspaceService;
    this.tooltip = localize(17008, null);
    this.update();
  }
  static {
    this.ID = "mcpServer.enableForWorkspace";
  }
  update() {
    this.enabled = false;
    if (!this.mcpServer?.local) {
      return;
    }
    if (this.workspaceService.getWorkbenchState() === 1 /* EMPTY */) {
      return;
    }
    const server = this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
    if (!server) {
      return;
    }
    const enablement = server.enablement.get();
    this.enabled = isContributionDisabled(enablement);
  }
  async run() {
    if (!this.mcpServer) {
      return;
    }
    this.mcpService.enablementModel.setEnabled(this.mcpServer.id, 3 /* EnabledWorkspace */);
  }
};

EnableMcpServerForWorkspaceAction = __decorateClass([
  __decorateParam(0, IMcpService),
  __decorateParam(1, IWorkspaceContextService)
], EnableMcpServerForWorkspaceAction);

var DisableMcpServerGloballyAction = class extends McpServerAction {
  constructor(mcpService) {
    super(DisableMcpServerGloballyAction.ID, localize(17005, null), McpServerAction.LABEL_ACTION_CLASS);
    this.mcpService = mcpService;
    this.tooltip = localize(17006, null);
    this.update();
  }
  static {
    this.ID = "mcpServer.disableGlobally";
  }
  update() {
    this.enabled = false;
    if (!this.mcpServer?.local) {
      return;
    }
    const server = this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
    if (!server) {
      return;
    }
    const enablement = server.enablement.get();
    this.enabled = isContributionEnabled(enablement);
  }
  async run() {
    if (!this.mcpServer) {
      return;
    }
    this.mcpService.enablementModel.setEnabled(this.mcpServer.id, 0 /* DisabledProfile */);
  }
};

DisableMcpServerGloballyAction = __decorateClass([
  __decorateParam(0, IMcpService)
], DisableMcpServerGloballyAction);

var DisableMcpServerForWorkspaceAction = class extends McpServerAction {
  constructor(mcpService, workspaceService) {
    super(DisableMcpServerForWorkspaceAction.ID, localize(17003, null), McpServerAction.LABEL_ACTION_CLASS);
    this.mcpService = mcpService;
    this.workspaceService = workspaceService;
    this.tooltip = localize(17004, null);
    this.update();
  }
  static {
    this.ID = "mcpServer.disableForWorkspace";
  }
  update() {
    this.enabled = false;
    if (!this.mcpServer?.local) {
      return;
    }
    if (this.workspaceService.getWorkbenchState() === 1 /* EMPTY */) {
      return;
    }
    const server = this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
    if (!server) {
      return;
    }
    const enablement = server.enablement.get();
    this.enabled = isContributionEnabled(enablement);
  }
  async run() {
    if (!this.mcpServer) {
      return;
    }
    this.mcpService.enablementModel.setEnabled(this.mcpServer.id, 1 /* DisabledWorkspace */);
  }
};

DisableMcpServerForWorkspaceAction = __decorateClass([
  __decorateParam(0, IMcpService),
  __decorateParam(1, IWorkspaceContextService)
], DisableMcpServerForWorkspaceAction);

var EnableMcpDropDownAction = class extends ButtonWithDropDownExtensionAction2 {
  constructor(instantiationService) {
    super("mcpServer.enable", McpServerAction.LABEL_ACTION_CLASS, [
      [
        instantiationService.createInstance(EnableMcpServerGloballyAction),
        instantiationService.createInstance(EnableMcpServerForWorkspaceAction)
      ]
    ]);
  }
};

EnableMcpDropDownAction = __decorateClass([
  __decorateParam(0, IInstantiationService)
], EnableMcpDropDownAction);

var DisableMcpDropDownAction = class extends ButtonWithDropDownExtensionAction2 {
  constructor(instantiationService) {
    super("mcpServer.disable", McpServerAction.LABEL_ACTION_CLASS, [
      [
        instantiationService.createInstance(DisableMcpServerGloballyAction),
        instantiationService.createInstance(DisableMcpServerForWorkspaceAction)
      ]
    ]);
  }
};

DisableMcpDropDownAction = __decorateClass([
  __decorateParam(0, IInstantiationService)
], DisableMcpDropDownAction);

function getContextMenuActions3(mcpServer, isEditorAction, instantiationService) {
  return instantiationService.invokeFunction((accessor) => {
    const workspaceService = accessor.get(IWorkspaceContextService);
    const environmentService = accessor.get(IWorkbenchEnvironmentService);
    const groups = [];
    const isInstalled = mcpServer.installState === 1 /* Installed */;
    if (isInstalled) {
      groups.push([
        instantiationService.createInstance(StartServerAction)
      ]);
      groups.push([
        instantiationService.createInstance(StopServerAction),
        instantiationService.createInstance(RestartServerAction)
      ]);
      groups.push([
        instantiationService.createInstance(EnableMcpServerGloballyAction),
        instantiationService.createInstance(EnableMcpServerForWorkspaceAction),
        instantiationService.createInstance(DisableMcpServerGloballyAction),
        instantiationService.createInstance(DisableMcpServerForWorkspaceAction)
      ]);
      groups.push([
        instantiationService.createInstance(AuthServerAction)
      ]);
      groups.push([
        instantiationService.createInstance(ShowServerOutputAction),
        instantiationService.createInstance(ShowServerConfigurationAction),
        instantiationService.createInstance(ShowServerJsonConfigurationAction)
      ]);
      groups.push([
        instantiationService.createInstance(ConfigureModelAccessAction),
        instantiationService.createInstance(ShowSamplingRequestsAction)
      ]);
      groups.push([
        instantiationService.createInstance(BrowseResourcesAction)
      ]);
      if (!isEditorAction) {
        const installGroup = [instantiationService.createInstance(UninstallAction2)];
        if (workspaceService.getWorkbenchState() !== 1 /* EMPTY */) {
          installGroup.push(instantiationService.createInstance(InstallInWorkspaceAction, false));
        }
        if (environmentService.remoteAuthority && mcpServer.local?.scope !== "remoteUser" /* RemoteUser */) {
          installGroup.push(instantiationService.createInstance(InstallInRemoteAction, false));
        }
        groups.push(installGroup);
      }
    } else {
      const installGroup = [];
      if (workspaceService.getWorkbenchState() !== 1 /* EMPTY */) {
        installGroup.push(instantiationService.createInstance(InstallInWorkspaceAction, !isEditorAction));
      }
      if (environmentService.remoteAuthority) {
        installGroup.push(instantiationService.createInstance(InstallInRemoteAction, !isEditorAction));
      }
      groups.push(installGroup);
    }
    groups.forEach((group2) => group2.forEach((extensionAction) => extensionAction.mcpServer = mcpServer));
    return groups;
  });
}

var ManageMcpServerAction = class extends DropDownAction {
  constructor(isEditorAction, instantiationService) {
    super(ManageMcpServerAction.ID, "", "", true, instantiationService);
    this.isEditorAction = isEditorAction;
    this.tooltip = localize(17017, null);
    this.update();
  }
  static {
    this.ID = "mcpServer.manage";
  }
  static {
    this.Class = `${McpServerAction.ICON_ACTION_CLASS} manage ` + ThemeIcon.asClassName(manageExtensionIcon);
  }
  static {
    this.HideManageExtensionClass = `${this.Class} hide`;
  }
  async run() {
    return super.run(this.mcpServer ? getContextMenuActions3(this.mcpServer, this.isEditorAction, this.instantiationService) : []);
  }
  update() {
    this.class = ManageMcpServerAction.HideManageExtensionClass;
    this.enabled = false;
    if (!this.mcpServer) {
      return;
    }
    if (this.isEditorAction) {
      this.enabled = true;
      this.class = ManageMcpServerAction.Class;
    } else {
      this.enabled = !!this.mcpServer.local;
      this.class = this.enabled ? ManageMcpServerAction.Class : ManageMcpServerAction.HideManageExtensionClass;
    }
  }
};

ManageMcpServerAction = __decorateClass([
  __decorateParam(1, IInstantiationService)
], ManageMcpServerAction);

var StartServerAction = class extends McpServerAction {
  constructor(mcpService) {
    super("extensions.start", localize(17029, null), StartServerAction.CLASS, false);
    this.mcpService = mcpService;
    this.update();
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent start`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  update() {
    this.enabled = false;
    this.class = StartServerAction.HIDE;
    const server = this.getServer();
    if (!server) {
      return;
    }
    const serverState = server.connectionState.get();
    if (!McpConnectionState.canBeStarted(serverState.state)) {
      return;
    }
    this.class = StartServerAction.CLASS;
    this.enabled = true;
    this.label = localize(17029, null);
  }
  async run() {
    const server = this.getServer();
    if (!server) {
      return;
    }
    await server.start({ promptType: "all-untrusted" });
    server.showOutput();
  }
  getServer() {
    if (!this.mcpServer) {
      return;
    }
    if (!this.mcpServer.local) {
      return;
    }
    return this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
  }
};

StartServerAction = __decorateClass([
  __decorateParam(0, IMcpService)
], StartServerAction);

var StopServerAction = class extends McpServerAction {
  constructor(mcpService) {
    super("extensions.stop", localize(17030, null), StopServerAction.CLASS, false);
    this.mcpService = mcpService;
    this.update();
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent stop`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  update() {
    this.enabled = false;
    this.class = StopServerAction.HIDE;
    const server = this.getServer();
    if (!server) {
      return;
    }
    const serverState = server.connectionState.get();
    if (McpConnectionState.canBeStarted(serverState.state)) {
      return;
    }
    this.class = StopServerAction.CLASS;
    this.enabled = true;
    this.label = localize(17030, null);
  }
  async run() {
    const server = this.getServer();
    if (!server) {
      return;
    }
    await server.stop();
  }
  getServer() {
    if (!this.mcpServer) {
      return;
    }
    if (!this.mcpServer.local) {
      return;
    }
    return this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
  }
};

StopServerAction = __decorateClass([
  __decorateParam(0, IMcpService)
], StopServerAction);

var RestartServerAction = class extends McpServerAction {
  constructor(mcpService) {
    super("extensions.restart", localize(17028, null), RestartServerAction.CLASS, false);
    this.mcpService = mcpService;
    this.update();
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent restart`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  update() {
    this.enabled = false;
    this.class = RestartServerAction.HIDE;
    const server = this.getServer();
    if (!server) {
      return;
    }
    const serverState = server.connectionState.get();
    if (McpConnectionState.canBeStarted(serverState.state)) {
      return;
    }
    this.class = RestartServerAction.CLASS;
    this.enabled = true;
    this.label = localize(17028, null);
  }
  async run() {
    const server = this.getServer();
    if (!server) {
      return;
    }
    await server.stop();
    await server.start({ promptType: "all-untrusted" });
    server.showOutput();
  }
  getServer() {
    if (!this.mcpServer) {
      return;
    }
    if (!this.mcpServer.local) {
      return;
    }
    return this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
  }
};

RestartServerAction = __decorateClass([
  __decorateParam(0, IMcpService)
], RestartServerAction);

var AuthServerAction = class extends McpServerAction {
  constructor(mcpService, _authenticationQueryService, _authenticationService) {
    super("extensions.restart", localize(17028, null), RestartServerAction.CLASS, false);
    this.mcpService = mcpService;
    this._authenticationQueryService = _authenticationQueryService;
    this._authenticationService = _authenticationService;
    this.update();
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent account`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  static {
    this.SIGN_OUT = localize(17023, null);
  }
  static {
    this.DISCONNECT = localize(17019, null);
  }
  update() {
    this.enabled = false;
    this.class = AuthServerAction.HIDE;
    const server = this.getServer();
    if (!server) {
      return;
    }
    const accountQuery = this.getAccountQuery();
    if (!accountQuery) {
      return;
    }
    this._accountQuery = accountQuery;
    this.class = AuthServerAction.CLASS;
    this.enabled = true;
    let label3 = accountQuery.entities().getEntityCount().total > 1 ? AuthServerAction.DISCONNECT : AuthServerAction.SIGN_OUT;
    label3 += ` (${accountQuery.accountName})`;
    this.label = label3;
  }
  async run() {
    const server = this.getServer();
    if (!server) {
      return;
    }
    const accountQuery = this.getAccountQuery();
    if (!accountQuery) {
      return;
    }
    await server.stop();
    const { providerId, accountName } = accountQuery;
    accountQuery.mcpServer(server.definition.id).setAccessAllowed(false, server.definition.label);
    if (this.label === AuthServerAction.SIGN_OUT) {
      const accounts = await this._authenticationService.getAccounts(providerId);
      const account = accounts.find((a) => a.label === accountName);
      if (account) {
        const sessions = await this._authenticationService.getSessions(providerId, void 0, { account });
        for (const session of sessions) {
          await this._authenticationService.removeSession(providerId, session.id);
        }
      }
    }
  }
  getServer() {
    if (!this.mcpServer) {
      return;
    }
    if (!this.mcpServer.local) {
      return;
    }
    return this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
  }
  getAccountQuery() {
    const server = this.getServer();
    if (!server) {
      return void 0;
    }
    if (this._accountQuery) {
      return this._accountQuery;
    }
    const serverId = server.definition.id;
    const preferences = this._authenticationQueryService.mcpServer(serverId).getAllAccountPreferences();
    if (!preferences.size) {
      return void 0;
    }
    for (const [providerId, accountName] of preferences) {
      const accountQuery = this._authenticationQueryService.provider(providerId).account(accountName);
      if (!accountQuery.mcpServer(serverId).isAccessAllowed()) {
        continue;
      }
      return accountQuery;
    }
    return void 0;
  }
};

AuthServerAction = __decorateClass([
  __decorateParam(0, IMcpService),
  __decorateParam(1, IAuthenticationQueryService),
  __decorateParam(2, IAuthenticationService)
], AuthServerAction);

var ShowServerOutputAction = class extends McpServerAction {
  constructor(mcpService) {
    super("extensions.output", localize(17027, null), ShowServerOutputAction.CLASS, false);
    this.mcpService = mcpService;
    this.update();
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent output`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  update() {
    this.enabled = false;
    this.class = ShowServerOutputAction.HIDE;
    const server = this.getServer();
    if (!server) {
      return;
    }
    this.class = ShowServerOutputAction.CLASS;
    this.enabled = true;
    this.label = localize(17027, null);
  }
  async run() {
    const server = this.getServer();
    if (!server) {
      return;
    }
    server.showOutput();
  }
  getServer() {
    if (!this.mcpServer) {
      return;
    }
    if (!this.mcpServer.local) {
      return;
    }
    return this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
  }
};

ShowServerOutputAction = __decorateClass([
  __decorateParam(0, IMcpService)
], ShowServerOutputAction);

var ShowServerConfigurationAction = class extends McpServerAction {
  constructor(mcpWorkbenchService) {
    super("extensions.config", localize(17001, null), ShowServerConfigurationAction.CLASS, false);
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.update();
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent config`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  update() {
    this.enabled = false;
    this.class = ShowServerConfigurationAction.HIDE;
    if (!this.mcpServer?.local) {
      return;
    }
    this.class = ShowServerConfigurationAction.CLASS;
    this.enabled = true;
  }
  async run() {
    if (!this.mcpServer?.local) {
      return;
    }
    this.mcpWorkbenchService.open(this.mcpServer, { tab: "configuration" /* Configuration */ });
  }
};

ShowServerConfigurationAction = __decorateClass([
  __decorateParam(0, IMcpWorkbenchService)
], ShowServerConfigurationAction);

var ShowServerJsonConfigurationAction = class extends McpServerAction {
  constructor(mcpService, mcpRegistry, editorService) {
    super("extensions.jsonConfig", localize(17002, null), ShowServerJsonConfigurationAction.CLASS, false);
    this.mcpService = mcpService;
    this.mcpRegistry = mcpRegistry;
    this.editorService = editorService;
    this.update();
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent config`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  update() {
    this.enabled = false;
    this.class = ShowServerJsonConfigurationAction.HIDE;
    const configurationTarget = this.getConfigurationTarget();
    if (!configurationTarget) {
      return;
    }
    this.class = ShowServerConfigurationAction.CLASS;
    this.enabled = true;
  }
  async run() {
    const configurationTarget = this.getConfigurationTarget();
    if (!configurationTarget) {
      return;
    }
    this.editorService.openEditor({
      resource: URI.isUri(configurationTarget) ? configurationTarget : configurationTarget.uri,
      options: { selection: URI.isUri(configurationTarget) ? void 0 : configurationTarget.range }
    });
  }
  getConfigurationTarget() {
    if (!this.mcpServer) {
      return;
    }
    if (!this.mcpServer.local) {
      return;
    }
    const server = this.mcpService.servers.get().find((s) => s.definition.label === this.mcpServer?.name);
    if (!server) {
      return;
    }
    const collection = this.mcpRegistry.collections.get().find((c) => c.id === server.collection.id);
    const serverDefinition = collection?.serverDefinitions.get().find((s) => s.id === server.definition.id);
    return serverDefinition?.presentation?.origin || collection?.presentation?.origin;
  }
};

ShowServerJsonConfigurationAction = __decorateClass([
  __decorateParam(0, IMcpService),
  __decorateParam(1, IMcpRegistry),
  __decorateParam(2, IEditorService)
], ShowServerJsonConfigurationAction);

var ConfigureModelAccessAction = class extends McpServerAction {
  constructor(mcpService, commandService) {
    super("extensions.config", localize(17018, null), ConfigureModelAccessAction.CLASS, false);
    this.mcpService = mcpService;
    this.commandService = commandService;
    this.update();
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent config`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  update() {
    this.enabled = false;
    this.class = ConfigureModelAccessAction.HIDE;
    const server = this.getServer();
    if (!server) {
      return;
    }
    this.class = ConfigureModelAccessAction.CLASS;
    this.enabled = true;
    this.label = localize(17018, null);
  }
  async run() {
    const server = this.getServer();
    if (!server) {
      return;
    }
    this.commandService.executeCommand("workbench.mcp.configureSamplingModels" /* ConfigureSamplingModels */, server);
  }
  getServer() {
    if (!this.mcpServer) {
      return;
    }
    if (!this.mcpServer.local) {
      return;
    }
    return this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
  }
};

ConfigureModelAccessAction = __decorateClass([
  __decorateParam(0, IMcpService),
  __decorateParam(1, ICommandService)
], ConfigureModelAccessAction);

var ShowSamplingRequestsAction = class extends McpServerAction {
  constructor(mcpService, samplingService, editorService) {
    super("extensions.config", localize(17021, null), ShowSamplingRequestsAction.CLASS, false);
    this.mcpService = mcpService;
    this.samplingService = samplingService;
    this.editorService = editorService;
    this.update();
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent config`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  update() {
    this.enabled = false;
    this.class = ShowSamplingRequestsAction.HIDE;
    const server = this.getServer();
    if (!server) {
      return;
    }
    if (!this.samplingService.hasLogs(server)) {
      return;
    }
    this.class = ShowSamplingRequestsAction.CLASS;
    this.enabled = true;
  }
  async run() {
    const server = this.getServer();
    if (!server) {
      return;
    }
    if (!this.samplingService.hasLogs(server)) {
      return;
    }
    this.editorService.openEditor({
      resource: void 0,
      contents: this.samplingService.getLogText(server),
      label: localize(17022, null, server.definition.label)
    });
  }
  getServer() {
    if (!this.mcpServer) {
      return;
    }
    if (!this.mcpServer.local) {
      return;
    }
    return this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
  }
};

ShowSamplingRequestsAction = __decorateClass([
  __decorateParam(0, IMcpService),
  __decorateParam(1, IMcpSamplingService),
  __decorateParam(2, IEditorService)
], ShowSamplingRequestsAction);

var BrowseResourcesAction = class extends McpServerAction {
  constructor(mcpService, commandService) {
    super("extensions.config", localize(17020, null), BrowseResourcesAction.CLASS, false);
    this.mcpService = mcpService;
    this.commandService = commandService;
    this.update();
  }
  static {
    this.CLASS = `${this.LABEL_ACTION_CLASS} prominent config`;
  }
  static {
    this.HIDE = `${this.CLASS} hide`;
  }
  update() {
    this.enabled = false;
    this.class = BrowseResourcesAction.HIDE;
    const server = this.getServer();
    if (!server) {
      return;
    }
    const capabilities = server.capabilities.get();
    if (capabilities !== void 0 && !(capabilities & 16 /* Resources */)) {
      return;
    }
    this.class = BrowseResourcesAction.CLASS;
    this.enabled = true;
  }
  async run() {
    const server = this.getServer();
    if (!server) {
      return;
    }
    const capabilities = server.capabilities.get();
    if (capabilities !== void 0 && !(capabilities & 16 /* Resources */)) {
      return;
    }
    return this.commandService.executeCommand("workbench.mcp.browseResources" /* BrowseResources */, server);
  }
  getServer() {
    if (!this.mcpServer) {
      return;
    }
    if (!this.mcpServer.local) {
      return;
    }
    return this.mcpService.servers.get().find((s) => s.definition.id === this.mcpServer?.id);
  }
};

BrowseResourcesAction = __decorateClass([
  __decorateParam(0, IMcpService),
  __decorateParam(1, ICommandService)
], BrowseResourcesAction);

var McpServerStatusAction = class extends McpServerAction {
  constructor(mcpWorkbenchService, commandService) {
    super("extensions.status", "", `${McpServerStatusAction.CLASS} hide`, false);
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.commandService = commandService;
    this._status = [];
    this._onDidChangeStatus = this._register(new Emitter());
    this.onDidChangeStatus = this._onDidChangeStatus.event;
    this.update();
  }
  static {
    this.CLASS = `${McpServerAction.ICON_ACTION_CLASS} extension-status`;
  }
  get status() {
    return this._status;
  }
  update() {
    this.computeAndUpdateStatus();
  }
  computeAndUpdateStatus() {
    this.updateStatus(void 0, true);
    this.enabled = false;
    if (!this.mcpServer) {
      return;
    }
    if ((this.mcpServer.gallery || this.mcpServer.installable) && this.mcpServer.installState === 3 /* Uninstalled */) {
      const result = this.mcpWorkbenchService.canInstall(this.mcpServer);
      if (result !== true) {
        this.updateStatus({ icon: warningIcon2, message: result }, true);
        return;
      }
    }
    const runtimeState = this.mcpServer.runtimeStatus;
    if (runtimeState?.message) {
      this.updateStatus({ icon: runtimeState.message.severity === severity_default.Warning ? warningIcon2 : runtimeState.message.severity === severity_default.Error ? errorIcon : infoIcon, message: runtimeState.message.text }, true);
    }
  }
  updateStatus(status2, updateClass) {
    if (status2) {
      if (this._status.some((s) => s.message.value === status2.message.value && s.icon?.id === status2.icon?.id)) {
        return;
      }
    } else {
      if (this._status.length === 0) {
        return;
      }
      this._status = [];
    }
    if (status2) {
      this._status.push(status2);
      this._status.sort(
        (a, b) => b.icon === trustIcon ? -1 : a.icon === trustIcon ? 1 : b.icon === errorIcon ? -1 : a.icon === errorIcon ? 1 : b.icon === warningIcon2 ? -1 : a.icon === warningIcon2 ? 1 : b.icon === infoIcon ? -1 : a.icon === infoIcon ? 1 : 0
      );
    }
    if (updateClass) {
      if (status2?.icon === errorIcon) {
        this.class = `${McpServerStatusAction.CLASS} extension-status-error ${ThemeIcon.asClassName(errorIcon)}`;
      } else if (status2?.icon === warningIcon2) {
        this.class = `${McpServerStatusAction.CLASS} extension-status-warning ${ThemeIcon.asClassName(warningIcon2)}`;
      } else if (status2?.icon === infoIcon) {
        this.class = `${McpServerStatusAction.CLASS} extension-status-info ${ThemeIcon.asClassName(infoIcon)}`;
      } else if (status2?.icon === trustIcon) {
        this.class = `${McpServerStatusAction.CLASS} ${ThemeIcon.asClassName(trustIcon)}`;
      } else {
        this.class = `${McpServerStatusAction.CLASS} hide`;
      }
    }
    this._onDidChangeStatus.fire();
  }
  async run() {
    if (this._status[0]?.icon === trustIcon) {
      return this.commandService.executeCommand("workbench.trust.manage");
    }
  }
};

McpServerStatusAction = __decorateClass([
  __decorateParam(0, IMcpWorkbenchService),
  __decorateParam(1, ICommandService)
], McpServerStatusAction);
export { getContextMenuActions3, McpServerAction, ButtonWithDropDownExtensionAction2, ButtonWithDropdownExtensionActionViewItem2, DropDownAction, DropDownExtensionActionViewItem2, InstallAction2, InstallInWorkspaceAction, InstallInRemoteAction, InstallingLabelAction2, UninstallAction2, EnableMcpServerGloballyAction, EnableMcpServerForWorkspaceAction, DisableMcpServerGloballyAction, DisableMcpServerForWorkspaceAction, EnableMcpDropDownAction, DisableMcpDropDownAction, ManageMcpServerAction, StartServerAction, StopServerAction, RestartServerAction, AuthServerAction, ShowServerOutputAction, ShowServerConfigurationAction, ShowServerJsonConfigurationAction, ConfigureModelAccessAction, ShowSamplingRequestsAction, BrowseResourcesAction, McpServerStatusAction };
