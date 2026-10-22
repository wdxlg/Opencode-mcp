// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/userDataSync/browser/userDataSyncConflictsView.ts
import { TreeViewPane } from "./module-1541.mjs";
import { $, append } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { basename2, isEqual2 } from "./module-0034.mjs";
import { IUserDataSyncWorkbenchService, SYNC_CONFLICTS_VIEW_ID, getSyncAreaLabel } from "./module-1744.mjs";
import { IUserDataProfilesService, reviveProfile } from "./module-0511.mjs";
import { URI } from "./module-0032.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { DEFAULT_EDITOR_ASSOCIATION } from "./module-0925.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IThemeService } from "./module-0287.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IUserDataSyncEnablementService, IUserDataSyncService } from "./module-1696.mjs";
import { IAccessibleViewInformationService } from "./module-1540.mjs";


// src/vs/workbench/contrib/userDataSync/browser/userDataSyncConflictsView.ts
var UserDataSyncConflictsViewPane = class extends TreeViewPane {
  constructor(options3, editorService, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, notificationService, hoverService, userDataSyncService, userDataSyncWorkbenchService, userDataSyncEnablementService, userDataProfilesService, accessibleViewVisibilityService) {
    super(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, notificationService, hoverService, accessibleViewVisibilityService);
    this.editorService = editorService;
    this.userDataSyncService = userDataSyncService;
    this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.userDataProfilesService = userDataProfilesService;
    this._register(this.userDataSyncService.onDidChangeConflicts(() => this.treeView.refresh()));
    this.registerActions();
  }
  renderTreeView(container3) {
    super.renderTreeView(append(container3, $("")));
    const that = this;
    this.treeView.message = localize(21782, null);
    this.treeView.dataProvider = { getChildren() {
      return that.getTreeItems();
    } };
  }
  async getTreeItems() {
    const roots = [];
    const conflictResources = this.userDataSyncService.conflicts.map((conflict) => conflict.conflicts.map((resourcePreview) => ({ ...resourcePreview, syncResource: conflict.syncResource, profile: conflict.profile }))).flat().sort((a, b) => a.profile.id === b.profile.id ? 0 : a.profile.isDefault ? -1 : b.profile.isDefault ? 1 : a.profile.name.localeCompare(b.profile.name));
    const conflictResourcesByProfile = [];
    for (const previewResource of conflictResources) {
      let result = conflictResourcesByProfile[conflictResourcesByProfile.length - 1]?.[0].id === previewResource.profile.id ? conflictResourcesByProfile[conflictResourcesByProfile.length - 1][1] : void 0;
      if (!result) {
        conflictResourcesByProfile.push([previewResource.profile, result = []]);
      }
      result.push(previewResource);
    }
    for (const [profile, resources] of conflictResourcesByProfile) {
      const children = [];
      for (const resource of resources) {
        const handle2 = JSON.stringify(resource);
        const treeItem = {
          handle: handle2,
          resourceUri: resource.remoteResource,
          label: { label: basename2(resource.remoteResource), strikethrough: resource.mergeState === "accepted" /* Accepted */ && (resource.localChange === 3 /* Deleted */ || resource.remoteChange === 3 /* Deleted */) },
          description: getSyncAreaLabel(resource.syncResource),
          collapsibleState: 0 /* None */,
          command: { id: `workbench.actions.sync.openConflicts`, title: "", arguments: [{ $treeViewId: "", $treeItemHandle: handle2 }] },
          contextValue: `sync-conflict-resource`
        };
        children.push(treeItem);
      }
      roots.push({
        handle: profile.id,
        label: { label: profile.name },
        collapsibleState: 2 /* Expanded */,
        children
      });
    }
    return conflictResourcesByProfile.length === 1 && conflictResourcesByProfile[0][0].isDefault ? roots[0].children ?? [] : roots;
  }
  parseHandle(handle2) {
    const parsed = JSON.parse(handle2);
    return {
      syncResource: parsed.syncResource,
      profile: reviveProfile(parsed.profile, this.userDataProfilesService.profilesHome.scheme),
      localResource: URI.revive(parsed.localResource),
      remoteResource: URI.revive(parsed.remoteResource),
      baseResource: URI.revive(parsed.baseResource),
      previewResource: URI.revive(parsed.previewResource),
      acceptedResource: URI.revive(parsed.acceptedResource),
      localChange: parsed.localChange,
      remoteChange: parsed.remoteChange,
      mergeState: parsed.mergeState
    };
  }
  registerActions() {
    const that = this;
    this._register(registerAction2(class OpenConflictsAction extends Action2 {
      constructor() {
        super({
          id: `workbench.actions.sync.openConflicts`,
          title: localize(21788, null)
        });
      }
      async run(accessor, handle2) {
        const conflict = that.parseHandle(handle2.$treeItemHandle);
        return that.open(conflict);
      }
    }));
    this._register(registerAction2(class AcceptRemoteAction extends Action2 {
      constructor() {
        super({
          id: `workbench.actions.sync.acceptRemote`,
          title: localize(21787, null),
          icon: Codicon.cloudDownload,
          menu: {
            id: MenuId.ViewItemContext,
            when: ContextKeyExpr.and(ContextKeyExpr.equals("view", SYNC_CONFLICTS_VIEW_ID), ContextKeyExpr.equals("viewItem", "sync-conflict-resource")),
            group: "inline",
            order: 1
          }
        });
      }
      async run(accessor, handle2) {
        const conflict = that.parseHandle(handle2.$treeItemHandle);
        await that.userDataSyncWorkbenchService.accept({ syncResource: conflict.syncResource, profile: conflict.profile }, conflict.remoteResource, void 0, that.userDataSyncEnablementService.isEnabled());
      }
    }));
    this._register(registerAction2(class AcceptLocalAction extends Action2 {
      constructor() {
        super({
          id: `workbench.actions.sync.acceptLocal`,
          title: localize(21786, null),
          icon: Codicon.cloudUpload,
          menu: {
            id: MenuId.ViewItemContext,
            when: ContextKeyExpr.and(ContextKeyExpr.equals("view", SYNC_CONFLICTS_VIEW_ID), ContextKeyExpr.equals("viewItem", "sync-conflict-resource")),
            group: "inline",
            order: 2
          }
        });
      }
      async run(accessor, handle2) {
        const conflict = that.parseHandle(handle2.$treeItemHandle);
        await that.userDataSyncWorkbenchService.accept({ syncResource: conflict.syncResource, profile: conflict.profile }, conflict.localResource, void 0, that.userDataSyncEnablementService.isEnabled());
      }
    }));
  }
  async open(conflictToOpen) {
    if (!this.userDataSyncService.conflicts.some(({ conflicts }) => conflicts.some(({ localResource }) => isEqual2(localResource, conflictToOpen.localResource)))) {
      return;
    }
    const remoteResourceName = localize(21784, null, basename2(conflictToOpen.remoteResource));
    const localResourceName = localize(21783, null, basename2(conflictToOpen.remoteResource));
    await this.editorService.openEditor({
      input1: { resource: conflictToOpen.remoteResource, label: localize(21785, null), description: remoteResourceName },
      input2: { resource: conflictToOpen.localResource, label: localize(21789, null), description: localResourceName },
      base: { resource: conflictToOpen.baseResource },
      result: { resource: conflictToOpen.previewResource },
      options: {
        preserveFocus: true,
        revealIfVisible: true,
        pinned: true,
        override: DEFAULT_EDITOR_ASSOCIATION.id
      }
    });
    return;
  }
};

UserDataSyncConflictsViewPane = __decorateClass([
  __decorateParam(1, IEditorService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IViewDescriptorService),
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IOpenerService),
  __decorateParam(9, IThemeService),
  __decorateParam(10, INotificationService),
  __decorateParam(11, IHoverService),
  __decorateParam(12, IUserDataSyncService),
  __decorateParam(13, IUserDataSyncWorkbenchService),
  __decorateParam(14, IUserDataSyncEnablementService),
  __decorateParam(15, IUserDataProfilesService),
  __decorateParam(16, IAccessibleViewInformationService)
], UserDataSyncConflictsViewPane);
export { UserDataSyncConflictsViewPane };
