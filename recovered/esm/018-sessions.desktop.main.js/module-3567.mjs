// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/webWorkspacePicker.ts
import { WorkspacePicker } from "./module-3564.mjs";
import { shouldUseMobileWorkspacePickerSheet, showMobileWorkspacePickerSheet } from "./module-3566.mjs";
import { SESSION_WORKSPACE_GROUP_GITHUB } from "./module-1767.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { ISessionsRecentWorkspacesService } from "./module-3545.mjs";
import { IRemoteAgentHostService } from "./module-1736.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IMenuService } from "./module-0092.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IAgentHostFilterService } from "./module-3520.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";


// src/vs/sessions/contrib/chat/browser/webWorkspacePicker.ts
var WebWorkspacePicker = class extends WorkspacePicker {
  constructor(options3, actionWidgetService, uriIdentityService, sessionsProvidersService, recentWorkspacesService, remoteAgentHostService, configurationService, commandService, menuService, contextKeyService, instantiationService, fileDialogService, telemetryService, notificationService, hoverService, _agentHostFilterService, _layoutService) {
    super(
      {
        ...options3,
        sessionWorkspaceProviderFilter: (providerId) => _agentHostFilterService.selectedHost?.providerIds.includes(providerId) === true
      },
      actionWidgetService,
      uriIdentityService,
      sessionsProvidersService,
      recentWorkspacesService,
      remoteAgentHostService,
      configurationService,
      commandService,
      menuService,
      contextKeyService,
      instantiationService,
      fileDialogService,
      telemetryService,
      notificationService,
      hoverService
    );
    this._agentHostFilterService = _agentHostFilterService;
    this._layoutService = _layoutService;
    this._register(this._agentHostFilterService.onDidChange(() => this._onScopedHostChanged()));
  }
  _showTabs() {
    return false;
  }
  showPicker(force = false, anchor, preferredGroup, attachesContext) {
    const trigger = anchor ?? this._triggerElement;
    if (!trigger) {
      return;
    }
    if (!shouldUseMobileWorkspacePickerSheet(this._layoutService)) {
      super.showPicker(force, trigger, preferredGroup, attachesContext);
      return;
    }
    this._setDirectPickerFilter(preferredGroup, attachesContext);
    const items = this._buildItems();
    showMobileWorkspacePickerSheet(
      this._layoutService,
      trigger,
      items,
      (item) => this._dispatchPickerItem(item),
      this._getAllBrowseActions()
    );
  }
  _onScopedHostChanged() {
    const scoped = this._agentHostFilterService.selectedHost;
    const currentResolved = this.selectedResolved;
    if (currentResolved && scoped?.providerIds.includes(currentResolved.providerId)) {
      this._onDidChangeSelection.fire();
      return;
    }
    this._resetAutomaticSelection();
  }
  _buildItems() {
    const items = [];
    const scoped = this._agentHostFilterService.selectedHost;
    if (!scoped) {
      return [];
    }
    const scopedProviderIds = new Set(scoped.providerIds);
    if (!scoped.providerIds.some((id2) => this.sessionsProvidersService.getProvider(id2))) {
      return items;
    }
    const isGitHubCategory = this._directPickerGroup === SESSION_WORKSPACE_GROUP_GITHUB;
    const recents = this._getRecentWorkspaces().filter(
      (w) => (scopedProviderIds.has(w.providerId) || isGitHubCategory) && this._directPickerAttachesContext !== true && (this._directPickerGroup === void 0 || w.workspace.group === this._directPickerGroup)
    );
    for (const { workspace, providerId } of recents) {
      const folderUri = workspace.folders[0]?.root;
      if (!folderUri) {
        continue;
      }
      const checked = this._isSelectedFolder(folderUri);
      items.push({
        kind: "action" /* Action */,
        label: workspace.label,
        description: workspace.description,
        group: { title: "", icon: workspace.icon },
        disabled: this._isProviderUnavailable(providerId),
        item: { folderUri, providerId, checked: checked || void 0 },
        onRemove: () => this._removeRecentWorkspace(folderUri)
      });
    }
    const allBrowseActions = this._getAllBrowseActions();
    const browseActions = allBrowseActions.map((action, index2) => ({ action, index: index2 })).filter(({ action }) => !scoped.grouped && scopedProviderIds.has(action.providerId) || this._directPickerGroup === SESSION_WORKSPACE_GROUP_GITHUB);
    if (browseActions.length > 0) {
      if (items.length > 0) {
        items.push({ kind: "separator" /* Separator */, label: "" });
      }
      for (const { action, index: index2 } of browseActions) {
        items.push({
          kind: "action" /* Action */,
          label: action.label,
          description: action.description,
          group: { title: "", icon: action.icon },
          disabled: this._isProviderUnavailable(action.providerId),
          item: { browseActionIndex: index2 }
        });
      }
    }
    if (items.length === 0 && this._directPickerGroup === SESSION_WORKSPACE_GROUP_GITHUB) {
      items.push({
        kind: "action" /* Action */,
        label: localize(4736, null),
        group: { title: "", icon: Codicon.loading },
        disabled: true,
        item: {}
      });
    }
    return items;
  }
};

WebWorkspacePicker = __decorateClass([
  __decorateParam(1, IActionWidgetService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, ISessionsProvidersService),
  __decorateParam(4, ISessionsRecentWorkspacesService),
  __decorateParam(5, IRemoteAgentHostService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IMenuService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IInstantiationService),
  __decorateParam(11, IFileDialogService),
  __decorateParam(12, ITelemetryService),
  __decorateParam(13, INotificationService),
  __decorateParam(14, IHoverService),
  __decorateParam(15, IAgentHostFilterService),
  __decorateParam(16, IWorkbenchLayoutService)
], WebWorkspacePicker);
export { WebWorkspacePicker };
