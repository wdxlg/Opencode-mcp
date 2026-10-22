// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/browser/remoteAgentHostCustomizationHarness.ts
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { getAgentHostConfiguredCustomizations } from "./module-4255.mjs";
import { ROOT_STATE_URI, customizationId } from "./module-1008.mjs";
import { AGENT_HOST_SCHEME, fromAgentHostUri } from "./module-1001.mjs";
import { agentHostUri } from "./module-1755.mjs";
import { basename2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { INotificationService } from "./module-0336.mjs";
import { AICustomizationManagementSection, IAICustomizationWorkspaceService } from "./module-0996.mjs";
import { ThemeIcon } from "./module-0086.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/browser/remoteAgentHostCustomizationHarness.ts
function customizationKey(customization) {
  return customization.uri;
}

var RemoteAgentPluginController = class extends Disposable {
  constructor(_hostLabel, _connectionAuthority, _connection, _fileDialogService, _notificationService, _workspaceService) {
    super();
    this._hostLabel = _hostLabel;
    this._connectionAuthority = _connectionAuthority;
    this._connection = _connection;
    this._fileDialogService = _fileDialogService;
    this._notificationService = _notificationService;
    this.pluginActions = [
      {
        id: "remoteAgentHost.addPlugin",
        label: localize(5201, null),
        tooltip: localize(5202, null),
        icon: Codicon.remote,
        run: () => this.addConfiguredPlugin()
      }
    ];
  }
  async removeConfiguredPlugin(customizationToRemove) {
    const updated = this.getConfiguredCustomizations().filter((customization) => customizationKey(customization) !== customizationKey(customizationToRemove));
    this.dispatchCustomizations(updated);
  }
  getConfiguredCustomizations() {
    const rootState = this._connection.rootState.value;
    if (!rootState || rootState instanceof Error) {
      return [];
    }
    return getAgentHostConfiguredCustomizations(rootState.config?.values);
  }
  dispatchCustomizations(customizations) {
    this._connection.dispatch(ROOT_STATE_URI, {
      type: "root/configChanged" /* RootConfigChanged */,
      config: {
        ["customizations" /* Customizations */]: customizations.map((c) => ({
          uri: c.uri,
          displayName: c.name
        }))
      }
    });
  }
  async pickRemotePluginFolder(title) {
    try {
      const selected = await this._fileDialogService.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        title,
        availableFileSystems: [AGENT_HOST_SCHEME],
        defaultUri: agentHostUri(this._connectionAuthority, "/")
      });
      return selected?.[0];
    } catch {
      return void 0;
    }
  }
  async addConfiguredPlugin() {
    const selected = await this.pickRemotePluginFolder(localize(5204, null, this._hostLabel));
    if (!selected) {
      return;
    }
    const original = fromAgentHostUri(selected);
    const uriString = original.toString();
    const newCustomization = {
      type: "plugin" /* Plugin */,
      id: customizationId(uriString),
      uri: uriString,
      name: basename2(original) || original.path
    };
    const current = this.getConfiguredCustomizations();
    const nextKey = customizationKey(newCustomization);
    if (current.some((customization) => customizationKey(customization) === nextKey)) {
      this._notificationService.info(localize(
        5203,
        null,
        newCustomization.name,
        this._hostLabel
      ));
      return;
    }
    this.dispatchCustomizations([...current, newCustomization]);
  }
};

RemoteAgentPluginController = __decorateClass([
  __decorateParam(3, IFileDialogService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IAICustomizationWorkspaceService)
], RemoteAgentPluginController);

function createRemoteAgentHarnessDescriptor(harnessId, displayName, controller, itemProvider, syncProvider) {
  return {
    id: harnessId,
    label: displayName,
    icon: ThemeIcon.fromId(Codicon.remote.id),
    hiddenSections: [
      AICustomizationManagementSection.Models,
      AICustomizationManagementSection.McpServers
    ],
    hideGenerateButton: true,
    itemProvider,
    syncProvider,
    pluginActions: controller.pluginActions
  };
}
export { customizationKey, createRemoteAgentHarnessDescriptor, RemoteAgentPluginController };
