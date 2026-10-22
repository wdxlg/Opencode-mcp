// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentPluginActions.ts
import { Action } from "./module-0082.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPluginInstallService } from "./module-2570.mjs";
import { dirname2, joinPath } from "./module-0034.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IAgentPluginService } from "./module-1016.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { INotificationService } from "./module-0336.mjs";
import { buildEnablementContextMenuGroup } from "./module-2657.mjs";
import { getCustomizationScopeEnablement } from "./module-2112.mjs";
import { Emitter } from "./module-0017.mjs";
import { ActionWithDropdownActionViewItem } from "./module-0502.mjs";
import { hasKey } from "./module-0010.mjs";
import { isContributionDisabled, isContributionEnabled } from "./module-1018.mjs";


// src/vs/workbench/contrib/chat/browser/agentPluginActions.ts
var InstallPluginAction = class extends Action {
  constructor(item, pluginInstallService) {
    super(
      "agentPlugin.install",
      localize(8887, null),
      "extension-action label prominent install",
      true,
      () => pluginInstallService.installPlugin({
        name: item.name,
        description: item.description,
        version: item.version ?? "",
        source: item.source,
        sourceDescriptor: item.sourceDescriptor,
        marketplace: item.marketplace,
        marketplaceReference: item.marketplaceReference,
        marketplaceType: item.marketplaceType,
        readmeUri: item.readmeUri
      })
    );
  }
};

InstallPluginAction = __decorateClass([
  __decorateParam(1, IPluginInstallService)
], InstallPluginAction);

var UninstallPluginAction = class extends Action {
  constructor(plugin) {
    super("agentPlugin.uninstall", localize(8891, null), "extension-action label uninstall", true);
    this.plugin = plugin;
  }
  async run() {
    await this.runAndGetResult();
  }
  runAndGetResult() {
    return this.plugin.remove();
  }
};

function isRemovableAgentPlugin(plugin) {
  return plugin.remove !== void 0;
}

function createUninstallPluginAction(plugin) {
  return isRemovableAgentPlugin(plugin) ? new UninstallPluginAction(plugin) : void 0;
}

var OpenPluginFolderAction = class extends Action {
  constructor(plugin, commandService, openerService) {
    super(
      "agentPlugin.openFolder",
      localize(8888, null),
      void 0,
      true,
      async () => {
        try {
          await commandService.executeCommand("revealFileInOS", plugin.uri);
        } catch {
          await openerService.open(dirname2(plugin.uri));
        }
      }
    );
  }
};

OpenPluginFolderAction = __decorateClass([
  __decorateParam(1, ICommandService),
  __decorateParam(2, IOpenerService)
], OpenPluginFolderAction);

var OpenPluginReadmeAction = class extends Action {
  constructor(readmeUri, openerService) {
    super(
      "agentPlugin.openReadme",
      localize(8889, null),
      void 0,
      true,
      () => openerService.open(readmeUri)
    );
  }
};

OpenPluginReadmeAction = __decorateClass([
  __decorateParam(1, IOpenerService)
], OpenPluginReadmeAction);

function isPluginPolicyBlocked(plugin) {
  return plugin.policyBlocked?.get() === true;
}

function notifyPluginPolicyBlocked(notificationService, pluginName) {
  notificationService.warn(localize(8890, null, pluginName));
}

function createPolicyBlockedEnableAction(plugin, notificationService) {
  return new Action(
    "agentPlugin.enableBlocked",
    localize(8885, null),
    void 0,
    true,
    () => {
      notifyPluginPolicyBlocked(notificationService, plugin.label);
      return Promise.resolve();
    }
  );
}

function getInstalledPluginContextMenuActions(plugin, instantiationService) {
  return instantiationService.invokeFunction((accessor) => {
    const agentPluginService = accessor.get(IAgentPluginService);
    const workspaceService = accessor.get(IWorkspaceContextService);
    const groups = [];
    if (isPluginPolicyBlocked(plugin)) {
      groups.push([createPolicyBlockedEnableAction(plugin, accessor.get(INotificationService))]);
    } else {
      groups.push(buildEnablementContextMenuGroup(
        plugin.enablement.get(),
        plugin.uri.toString(),
        agentPluginService.enablementModel,
        workspaceService,
        "agentPlugin"
      ));
    }
    groups.push([
      instantiationService.createInstance(OpenPluginFolderAction, plugin),
      instantiationService.createInstance(OpenPluginReadmeAction, joinPath(plugin.uri, "README.md"))
    ]);
    const uninstallAction = createUninstallPluginAction(plugin);
    if (uninstallAction) {
      groups.push([uninstallAction]);
    }
    return groups;
  });
}

function getAgentHostPluginEnablementActions(agentHostCustomizations, agentPluginService, sessionResource, customization, hasWorkspace) {
  const enablement = getCustomizationScopeEnablement(customization);
  const actions = [
    createAgentHostPluginEnablementAction(agentHostCustomizations, agentPluginService, sessionResource, customization, "global" /* Global */, !enablement.global, "global")
  ];
  if (hasWorkspace) {
    actions.push(createAgentHostPluginEnablementAction(agentHostCustomizations, agentPluginService, sessionResource, customization, "workspace" /* Workspace */, !enablement.workspace, "workspace"));
  }
  actions.push(createAgentHostPluginEnablementAction(agentHostCustomizations, agentPluginService, sessionResource, customization, "session" /* Session */, !enablement.session, "session"));
  return actions;
}

function setAgentHostPluginEnablement(agentHostCustomizations, agentPluginService, sessionResource, plugin, kind, enabled) {
  if (kind === "global" /* Global */ && plugin.clientId !== void 0) {
    if (agentPluginService === void 0) {
      throw new Error("A client-published plugin requires its client enablement service");
    }
    agentPluginService.enablementModel.setEnabled(plugin.uri.toString(), enabled ? 2 /* EnabledProfile */ : 0 /* DisabledProfile */);
    return;
  }
  agentHostCustomizations.setCustomizationEnablement(sessionResource, plugin.id, plugin.enablement, kind, enabled);
}

function createAgentHostPluginEnablementAction(agentHostCustomizations, agentPluginService, sessionResource, customization, kind, enabled, scope) {
  const label3 = enabled ? scope === "global" ? localize(8879, null) : scope === "workspace" ? localize(8882, null) : localize(8881, null) : scope === "global" ? localize(8876, null) : scope === "workspace" ? localize(8878, null) : localize(8877, null);
  return {
    id: `agentPlugin.agentHost.${enabled ? "enable" : "disable"}.${scope}`,
    label: label3,
    run: () => {
      setAgentHostPluginEnablement(agentHostCustomizations, agentPluginService, sessionResource, customization, kind, enabled);
    }
  };
}

var EnablementSubAction = class extends Action {
  get hidden() {
    return this._hidden;
  }
  set hidden(v2) {
    this._hidden = v2;
  }
  constructor(id2, label3, cssClass, enabled, actionCallback) {
    super(id2, label3, cssClass, enabled, actionCallback);
    this._hidden = !enabled;
  }
  _setEnabled(value2) {
    super._setEnabled(value2);
    this.hidden = !value2;
  }
};

var EnablementDropDownAction = class extends Action {
  constructor(id2, subActions) {
    super(id2, void 0, "extension-action label action-dropdown");
    this.menuActionClassNames = ["extension-action", "label", "action-dropdown"];
    this._menuActions = [];
    this._isHidden = false;
    this._onDidChange = new Emitter();
    this.subActions = subActions;
    for (const a of subActions) {
      a.onDidChange(() => this._updateDropdown());
    }
    this._updateDropdown();
  }
  get menuActions() {
    return [...this._menuActions];
  }
  get isHidden() {
    return this._isHidden;
  }
  get onDidChange() {
    return this._onDidChange.event;
  }
  _updateDropdown() {
    const visible = this.subActions.filter((a) => !a.hidden);
    const primary = visible[0];
    this._menuActions = visible.length > 1 ? [...visible] : [];
    if (primary) {
      this._isHidden = false;
      this.enabled = true;
      this.label = primary.label;
      this.tooltip = primary.tooltip;
    } else {
      this._isHidden = true;
      this.enabled = false;
    }
    this._onDidChange.fire({ menuActions: this._menuActions });
  }
  async run() {
    const primary = this.subActions.find((a) => !a.hidden);
    await primary?.run();
  }
  dispose() {
    for (const a of this.subActions) {
      a.dispose();
    }
    super.dispose();
  }
};

var EnablementDropdownActionViewItem = class extends ActionWithDropdownActionViewItem {
  constructor(action, options3, contextMenuProvider) {
    super(null, action, options3, contextMenuProvider);
    this._register(action.onDidChange((e) => {
      if (hasKey(e, { menuActions: true })) {
        this.updateClass();
      }
    }));
  }
  render(container3) {
    super.render(container3);
    this.updateClass();
  }
  updateClass() {
    super.updateClass();
    if (this.element && this.dropdownMenuActionViewItem?.element) {
      const action = this._action;
      this.element.classList.toggle("hide", action.isHidden);
      const isMenuEmpty = action.menuActions.length === 0;
      this.element.classList.toggle("empty", isMenuEmpty);
      this.dropdownMenuActionViewItem.element.classList.toggle("hide", isMenuEmpty);
    }
  }
};

function createEnablePluginDropDown(plugin, enablementModel, workspaceContextService) {
  const key3 = plugin.uri.toString();
  const hasWorkspace = workspaceContextService.getWorkbenchState() !== 1 /* EMPTY */;
  const enable = new EnablementSubAction(
    "agentPlugin.enable",
    localize(8885, null),
    "extension-action label prominent",
    isContributionDisabled(plugin.enablement.get()),
    () => {
      enablementModel.setEnabled(key3, 2 /* EnabledProfile */);
      return Promise.resolve();
    }
  );
  const enableWorkspace = new EnablementSubAction(
    "agentPlugin.enableForWorkspace",
    localize(8886, null),
    "extension-action label",
    isContributionDisabled(plugin.enablement.get()) && hasWorkspace,
    () => {
      enablementModel.setEnabled(key3, 3 /* EnabledWorkspace */);
      return Promise.resolve();
    }
  );
  return new EnablementDropDownAction("agentPlugin.enableDropdown", [enable, enableWorkspace]);
}

function createDisablePluginDropDown(plugin, enablementModel, workspaceContextService) {
  const key3 = plugin.uri.toString();
  const hasWorkspace = workspaceContextService.getWorkbenchState() !== 1 /* EMPTY */;
  const disable = new EnablementSubAction(
    "agentPlugin.disable",
    localize(8883, null),
    "extension-action label disable",
    isContributionEnabled(plugin.enablement.get()),
    () => {
      enablementModel.setEnabled(key3, 0 /* DisabledProfile */);
      return Promise.resolve();
    }
  );
  const disableWorkspace = new EnablementSubAction(
    "agentPlugin.disableForWorkspace",
    localize(8884, null),
    "extension-action label disable",
    isContributionEnabled(plugin.enablement.get()) && hasWorkspace,
    () => {
      enablementModel.setEnabled(key3, 1 /* DisabledWorkspace */);
      return Promise.resolve();
    }
  );
  return new EnablementDropDownAction("agentPlugin.disableDropdown", [disable, disableWorkspace]);
}
export { isRemovableAgentPlugin, createUninstallPluginAction, isPluginPolicyBlocked, notifyPluginPolicyBlocked, createPolicyBlockedEnableAction, getInstalledPluginContextMenuActions, getAgentHostPluginEnablementActions, setAgentHostPluginEnablement, createAgentHostPluginEnablementAction, createEnablePluginDropDown, createDisablePluginDropDown, InstallPluginAction, UninstallPluginAction, OpenPluginFolderAction, OpenPluginReadmeAction, EnablementSubAction, EnablementDropDownAction, EnablementDropdownActionViewItem };
