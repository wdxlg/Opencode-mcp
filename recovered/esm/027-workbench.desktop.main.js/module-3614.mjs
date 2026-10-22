// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/userDataSync/browser/userDataSyncViews.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13 } from "./module-1093.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CONTEXT_ACCOUNT_STATE, CONTEXT_ENABLE_ACTIVITY_VIEWS, CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW, CONTEXT_HAS_CONFLICTS, CONTEXT_SYNC_STATE, IUserDataSyncWorkbenchService, SYNC_CONFLICTS_VIEW_ID, SYNC_TITLE, getSyncAreaLabel } from "./module-1744.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { UserDataSyncConflictsViewPane } from "./module-3613.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { TreeView, TreeViewPane } from "./module-1541.mjs";
import { Event2 } from "./module-0017.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { IDialogService, IFileDialogService } from "./module-0267.mjs";
import { IEditorService } from "./module-0934.mjs";
import { URI } from "./module-0032.mjs";
import { ICommandService } from "./module-0087.mjs";
import { API_OPEN_DIFF_EDITOR_COMMAND_ID, API_OPEN_EDITOR_COMMAND_ID } from "./module-1538.mjs";
import { basename2 } from "./module-0034.mjs";
import { ALL_SYNC_RESOURCES, IUserDataAutoSyncService, IUserDataSyncEnablementService, IUserDataSyncResourceProviderService, IUserDataSyncService, UserDataSyncError, getLastSyncResourceUri } from "./module-1696.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IUserDataSyncMachinesService, isWebPlatform } from "./module-1749.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { toAction } from "./module-0082.mjs";
import { fromNow } from "./module-0120.mjs";
import { FolderThemeIcon } from "./module-0287.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IFileService } from "./module-0269.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IEnvironmentService } from "./module-0508.mjs";


// src/vs/workbench/contrib/userDataSync/browser/userDataSyncViews.ts
var UserDataSyncDataViews = class extends Disposable {
  constructor(container3, instantiationService, userDataSyncEnablementService, userDataSyncMachinesService, userDataSyncService) {
    super();
    this.instantiationService = instantiationService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.userDataSyncMachinesService = userDataSyncMachinesService;
    this.userDataSyncService = userDataSyncService;
    this.registerViews(container3);
  }
  registerViews(container3) {
    this.registerConflictsView(container3);
    this.registerActivityView(container3, true);
    this.registerMachinesView(container3);
    this.registerActivityView(container3, false);
    this.registerTroubleShootView(container3);
    this.registerExternalActivityView(container3);
  }
  registerConflictsView(container3) {
    const viewsRegistry9 = Registry.as(Extensions13.ViewsRegistry);
    const viewName = localize2(21791, "Conflicts");
    const viewDescriptor4 = {
      id: SYNC_CONFLICTS_VIEW_ID,
      name: viewName,
      ctorDescriptor: new SyncDescriptor(UserDataSyncConflictsViewPane),
      when: ContextKeyExpr.and(CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW, CONTEXT_HAS_CONFLICTS),
      canToggleVisibility: false,
      canMoveView: false,
      treeView: this.instantiationService.createInstance(TreeView, SYNC_CONFLICTS_VIEW_ID, viewName.value),
      collapsed: false,
      order: 100
    };
    viewsRegistry9.registerViews([viewDescriptor4], container3);
  }
  registerMachinesView(container3) {
    const id2 = `workbench.views.sync.machines`;
    const name = localize2(21807, "Synced Machines");
    const treeView = this.instantiationService.createInstance(TreeView, id2, name.value);
    const dataProvider = this.instantiationService.createInstance(UserDataSyncMachinesViewDataProvider, treeView);
    treeView.showRefreshAction = true;
    treeView.canSelectMany = true;
    treeView.dataProvider = dataProvider;
    this._register(Event2.any(this.userDataSyncMachinesService.onDidChange, this.userDataSyncService.onDidResetRemote)(() => treeView.refresh()));
    const viewsRegistry9 = Registry.as(Extensions13.ViewsRegistry);
    const viewDescriptor4 = {
      id: id2,
      name,
      ctorDescriptor: new SyncDescriptor(TreeViewPane),
      when: ContextKeyExpr.and(CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */), CONTEXT_ACCOUNT_STATE.isEqualTo("available" /* Available */), CONTEXT_ENABLE_ACTIVITY_VIEWS),
      canToggleVisibility: true,
      canMoveView: false,
      treeView,
      collapsed: false,
      order: 300
    };
    viewsRegistry9.registerViews([viewDescriptor4], container3);
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.actions.sync.editMachineName`,
          title: localize(21814, null),
          icon: Codicon.edit,
          menu: {
            id: MenuId.ViewItemContext,
            when: ContextKeyExpr.and(ContextKeyExpr.equals("view", id2)),
            group: "inline"
          }
        });
      }
      async run(accessor, handle2) {
        const changed = await dataProvider.rename(handle2.$treeItemHandle);
        if (changed) {
          await treeView.refresh();
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.actions.sync.turnOffSyncOnMachine`,
          title: localize(21818, null),
          menu: {
            id: MenuId.ViewItemContext,
            when: ContextKeyExpr.and(ContextKeyExpr.equals("view", id2), ContextKeyExpr.equals("viewItem", "sync-machine"))
          }
        });
      }
      async run(accessor, handle2, selected) {
        if (await dataProvider.disable((selected || [handle2]).map((handle3) => handle3.$treeItemHandle))) {
          await treeView.refresh();
        }
      }
    }));
  }
  registerActivityView(container3, remote) {
    const id2 = `workbench.views.sync.${remote ? "remote" : "local"}Activity`;
    const name = remote ? localize2(21800, "Sync Activity (Remote)") : localize2(21796, "Sync Activity (Local)");
    const treeView = this.instantiationService.createInstance(TreeView, id2, name.value);
    treeView.showCollapseAllAction = true;
    treeView.showRefreshAction = true;
    treeView.dataProvider = remote ? this.instantiationService.createInstance(RemoteUserDataSyncActivityViewDataProvider) : this.instantiationService.createInstance(LocalUserDataSyncActivityViewDataProvider);
    this._register(Event2.any(
      this.userDataSyncEnablementService.onDidChangeResourceEnablement,
      this.userDataSyncEnablementService.onDidChangeEnablement,
      this.userDataSyncService.onDidResetLocal,
      this.userDataSyncService.onDidResetRemote
    )(() => treeView.refresh()));
    const viewsRegistry9 = Registry.as(Extensions13.ViewsRegistry);
    const viewDescriptor4 = {
      id: id2,
      name,
      ctorDescriptor: new SyncDescriptor(TreeViewPane),
      when: ContextKeyExpr.and(CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */), CONTEXT_ACCOUNT_STATE.isEqualTo("available" /* Available */), CONTEXT_ENABLE_ACTIVITY_VIEWS),
      canToggleVisibility: true,
      canMoveView: false,
      treeView,
      collapsed: false,
      order: remote ? 200 : 400,
      hideByDefault: !remote
    };
    viewsRegistry9.registerViews([viewDescriptor4], container3);
    this.registerDataViewActions(id2);
  }
  registerExternalActivityView(container3) {
    const id2 = `workbench.views.sync.externalActivity`;
    const name = localize2(21793, "Sync Activity (Developer)");
    const dataProvider = this.instantiationService.createInstance(ExtractedUserDataSyncActivityViewDataProvider, void 0);
    const treeView = this.instantiationService.createInstance(TreeView, id2, name.value);
    treeView.showCollapseAllAction = false;
    treeView.showRefreshAction = false;
    treeView.dataProvider = dataProvider;
    const viewsRegistry9 = Registry.as(Extensions13.ViewsRegistry);
    const viewDescriptor4 = {
      id: id2,
      name,
      ctorDescriptor: new SyncDescriptor(TreeViewPane),
      when: CONTEXT_ENABLE_ACTIVITY_VIEWS,
      canToggleVisibility: true,
      canMoveView: false,
      treeView,
      collapsed: false,
      hideByDefault: false
    };
    viewsRegistry9.registerViews([viewDescriptor4], container3);
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.actions.sync.loadActivity`,
          title: localize(21815, null),
          icon: Codicon.cloudUpload,
          menu: {
            id: MenuId.ViewTitle,
            when: ContextKeyExpr.equals("view", id2),
            group: "navigation"
          }
        });
      }
      async run(accessor) {
        const fileDialogService = accessor.get(IFileDialogService);
        const result = await fileDialogService.showOpenDialog({
          title: localize(21804, null),
          canSelectFiles: true,
          canSelectFolders: true,
          canSelectMany: false
        });
        if (!result?.[0]) {
          return;
        }
        dataProvider.activityDataResource = result[0];
        await treeView.refresh();
      }
    }));
  }
  registerDataViewActions(viewId) {
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.actions.sync.${viewId}.resolveResource`,
          title: localize(21817, null),
          menu: {
            id: MenuId.ViewItemContext,
            when: ContextKeyExpr.and(ContextKeyExpr.equals("view", viewId), ContextKeyExpr.regex("viewItem", /sync-resource-.*/i))
          }
        });
      }
      async run(accessor, handle2) {
        const { resource } = JSON.parse(handle2.$treeItemHandle);
        const editorService = accessor.get(IEditorService);
        await editorService.openEditor({ resource: URI.parse(resource), options: { pinned: true } });
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.actions.sync.${viewId}.compareWithLocal`,
          title: localize(21813, null),
          menu: {
            id: MenuId.ViewItemContext,
            when: ContextKeyExpr.and(ContextKeyExpr.equals("view", viewId), ContextKeyExpr.regex("viewItem", /sync-associatedResource-.*/i))
          }
        });
      }
      async run(accessor, handle2) {
        const commandService = accessor.get(ICommandService);
        const { resource, comparableResource } = JSON.parse(handle2.$treeItemHandle);
        const remoteResource = URI.parse(resource);
        const localResource = URI.parse(comparableResource);
        return commandService.executeCommand(
          API_OPEN_DIFF_EDITOR_COMMAND_ID,
          remoteResource,
          localResource,
          localize(21801, null, localize(21795, null, basename2(remoteResource)), localize(21803, null, basename2(localResource))),
          void 0
        );
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `workbench.actions.sync.${viewId}.replaceCurrent`,
          title: localize(21816, null),
          icon: Codicon.discard,
          menu: {
            id: MenuId.ViewItemContext,
            when: ContextKeyExpr.and(ContextKeyExpr.equals("view", viewId), ContextKeyExpr.regex("viewItem", /sync-resource-.*/i), ContextKeyExpr.notEquals("viewItem", `sync-resource-${"profiles" /* Profiles */}`)),
            group: "inline"
          }
        });
      }
      async run(accessor, handle2) {
        const dialogService = accessor.get(IDialogService);
        const userDataSyncService = accessor.get(IUserDataSyncService);
        const { syncResourceHandle, syncResource } = JSON.parse(handle2.$treeItemHandle);
        const result = await dialogService.confirm({
          message: localize(21790, null, getSyncAreaLabel(syncResource)),
          type: "info",
          title: SYNC_TITLE.value
        });
        if (result.confirmed) {
          return userDataSyncService.replace({ created: syncResourceHandle.created, uri: URI.revive(syncResourceHandle.uri) });
        }
      }
    }));
  }
  registerTroubleShootView(container3) {
    const id2 = `workbench.views.sync.troubleshoot`;
    const name = localize2(21808, "Troubleshoot");
    const treeView = this.instantiationService.createInstance(TreeView, id2, name.value);
    const dataProvider = this.instantiationService.createInstance(UserDataSyncTroubleshootViewDataProvider);
    treeView.showRefreshAction = true;
    treeView.dataProvider = dataProvider;
    const viewsRegistry9 = Registry.as(Extensions13.ViewsRegistry);
    const viewDescriptor4 = {
      id: id2,
      name,
      ctorDescriptor: new SyncDescriptor(TreeViewPane),
      when: CONTEXT_ENABLE_ACTIVITY_VIEWS,
      canToggleVisibility: true,
      canMoveView: false,
      treeView,
      collapsed: false,
      order: 500,
      hideByDefault: true
    };
    viewsRegistry9.registerViews([viewDescriptor4], container3);
  }
};

UserDataSyncDataViews = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IUserDataSyncEnablementService),
  __decorateParam(3, IUserDataSyncMachinesService),
  __decorateParam(4, IUserDataSyncService)
], UserDataSyncDataViews);

var UserDataSyncActivityViewDataProvider = class {
  constructor(userDataSyncService, userDataSyncResourceProviderService, userDataAutoSyncService, userDataSyncWorkbenchService, notificationService, userDataProfilesService) {
    this.userDataSyncService = userDataSyncService;
    this.userDataSyncResourceProviderService = userDataSyncResourceProviderService;
    this.userDataAutoSyncService = userDataAutoSyncService;
    this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
    this.notificationService = notificationService;
    this.userDataProfilesService = userDataProfilesService;
    this.syncResourceHandlesByProfile = /* @__PURE__ */ new Map();
  }
  async getChildren(element) {
    try {
      if (!element) {
        return await this.getRoots();
      }
      if (element.profile || element.handle === this.userDataProfilesService.defaultProfile.id) {
        let promise = this.syncResourceHandlesByProfile.get(element.handle);
        if (!promise) {
          this.syncResourceHandlesByProfile.set(element.handle, promise = this.getSyncResourceHandles(element.profile));
        }
        return await promise;
      }
      if (element.syncResourceHandle) {
        return await this.getChildrenForSyncResourceTreeItem(element);
      }
      return [];
    } catch (error) {
      if (!(error instanceof UserDataSyncError)) {
        error = UserDataSyncError.toUserDataSyncError(error);
      }
      if (error instanceof UserDataSyncError && error.code === "IncompatibleRemoteContent" /* IncompatibleRemoteContent */) {
        this.notificationService.notify({
          severity: Severity2.Error,
          message: error.message,
          actions: {
            primary: [
              toAction({
                id: "reset",
                label: localize(21802, null),
                run: () => this.userDataSyncWorkbenchService.resetSyncedData()
              })
            ]
          }
        });
      } else {
        this.notificationService.error(error);
      }
      throw error;
    }
  }
  async getRoots() {
    this.syncResourceHandlesByProfile.clear();
    const roots = [];
    const profiles2 = await this.getProfiles();
    if (profiles2.length) {
      const profileTreeItem = {
        handle: this.userDataProfilesService.defaultProfile.id,
        label: { label: this.userDataProfilesService.defaultProfile.name },
        collapsibleState: 2 /* Expanded */
      };
      roots.push(profileTreeItem);
    } else {
      const defaultSyncResourceHandles = await this.getSyncResourceHandles();
      roots.push(...defaultSyncResourceHandles);
    }
    for (const profile of profiles2) {
      const profileTreeItem = {
        handle: profile.id,
        label: { label: profile.name },
        collapsibleState: 1 /* Collapsed */,
        profile
      };
      roots.push(profileTreeItem);
    }
    return roots;
  }
  async getChildrenForSyncResourceTreeItem(element) {
    const syncResourceHandle = element.syncResourceHandle;
    const associatedResources = await this.userDataSyncResourceProviderService.getAssociatedResources(syncResourceHandle);
    const previousAssociatedResources = syncResourceHandle.previous ? await this.userDataSyncResourceProviderService.getAssociatedResources(syncResourceHandle.previous) : [];
    return associatedResources.map(({ resource, comparableResource }) => {
      const handle2 = JSON.stringify({ resource: resource.toString(), comparableResource: comparableResource.toString() });
      const previousResource = previousAssociatedResources.find((previous) => basename2(previous.resource) === basename2(resource))?.resource;
      return {
        handle: handle2,
        collapsibleState: 0 /* None */,
        resourceUri: resource,
        command: previousResource ? {
          id: API_OPEN_DIFF_EDITOR_COMMAND_ID,
          title: "",
          arguments: [
            previousResource,
            resource,
            localize(21805, null, `${basename2(resource)} (${fromNow(syncResourceHandle.previous.created, true)})`, `${basename2(resource)} (${fromNow(syncResourceHandle.created, true)})`),
            void 0
          ]
        } : {
          id: API_OPEN_EDITOR_COMMAND_ID,
          title: "",
          arguments: [resource, void 0, void 0]
        },
        contextValue: `sync-associatedResource-${syncResourceHandle.syncResource}`
      };
    });
  }
  async getSyncResourceHandles(profile) {
    const treeItems = [];
    const result = await Promise.all(ALL_SYNC_RESOURCES.map(async (syncResource) => {
      const resourceHandles = await this.getResourceHandles(syncResource, profile);
      return resourceHandles.map((resourceHandle, index2) => ({ ...resourceHandle, syncResource, previous: resourceHandles[index2 + 1] }));
    }));
    const syncResourceHandles = result.flat().sort((a, b) => b.created - a.created);
    for (const syncResourceHandle of syncResourceHandles) {
      const handle2 = JSON.stringify({ syncResourceHandle, syncResource: syncResourceHandle.syncResource });
      treeItems.push({
        handle: handle2,
        collapsibleState: 1 /* Collapsed */,
        label: { label: getSyncAreaLabel(syncResourceHandle.syncResource) },
        description: fromNow(syncResourceHandle.created, true),
        tooltip: new Date(syncResourceHandle.created).toLocaleString(),
        themeIcon: FolderThemeIcon,
        syncResourceHandle,
        contextValue: `sync-resource-${syncResourceHandle.syncResource}`
      });
    }
    return treeItems;
  }
};

UserDataSyncActivityViewDataProvider = __decorateClass([
  __decorateParam(0, IUserDataSyncService),
  __decorateParam(1, IUserDataSyncResourceProviderService),
  __decorateParam(2, IUserDataAutoSyncService),
  __decorateParam(3, IUserDataSyncWorkbenchService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IUserDataProfilesService)
], UserDataSyncActivityViewDataProvider);

var LocalUserDataSyncActivityViewDataProvider = class extends UserDataSyncActivityViewDataProvider {
  getResourceHandles(syncResource, profile) {
    return this.userDataSyncResourceProviderService.getLocalSyncResourceHandles(syncResource, profile);
  }
  async getProfiles() {
    return this.userDataProfilesService.profiles.filter((p) => !p.isDefault).map((p) => ({
      id: p.id,
      collection: p.id,
      name: p.name
    }));
  }
};

var RemoteUserDataSyncActivityViewDataProvider = class extends UserDataSyncActivityViewDataProvider {
  constructor(userDataSyncService, userDataSyncResourceProviderService, userDataAutoSyncService, userDataSyncMachinesService, userDataSyncWorkbenchService, notificationService, userDataProfilesService) {
    super(userDataSyncService, userDataSyncResourceProviderService, userDataAutoSyncService, userDataSyncWorkbenchService, notificationService, userDataProfilesService);
    this.userDataSyncMachinesService = userDataSyncMachinesService;
  }
  async getChildren(element) {
    if (!element) {
      this.machinesPromise = void 0;
    }
    return super.getChildren(element);
  }
  getMachines() {
    if (this.machinesPromise === void 0) {
      this.machinesPromise = this.userDataSyncMachinesService.getMachines();
    }
    return this.machinesPromise;
  }
  getResourceHandles(syncResource, profile) {
    return this.userDataSyncResourceProviderService.getRemoteSyncResourceHandles(syncResource, profile);
  }
  getProfiles() {
    return this.userDataSyncResourceProviderService.getRemoteSyncedProfiles();
  }
  async getChildrenForSyncResourceTreeItem(element) {
    const children = await super.getChildrenForSyncResourceTreeItem(element);
    if (children.length) {
      const machineId = await this.userDataSyncResourceProviderService.getMachineId(element.syncResourceHandle);
      if (machineId) {
        const machines = await this.getMachines();
        const machine = machines.find(({ id: id2 }) => id2 === machineId);
        children[0].description = machine?.isCurrent ? localize(21792, null) : machine?.name;
      }
    }
    return children;
  }
};

RemoteUserDataSyncActivityViewDataProvider = __decorateClass([
  __decorateParam(0, IUserDataSyncService),
  __decorateParam(1, IUserDataSyncResourceProviderService),
  __decorateParam(2, IUserDataAutoSyncService),
  __decorateParam(3, IUserDataSyncMachinesService),
  __decorateParam(4, IUserDataSyncWorkbenchService),
  __decorateParam(5, INotificationService),
  __decorateParam(6, IUserDataProfilesService)
], RemoteUserDataSyncActivityViewDataProvider);

var ExtractedUserDataSyncActivityViewDataProvider = class extends UserDataSyncActivityViewDataProvider {
  constructor(activityDataResource, userDataSyncService, userDataSyncResourceProviderService, userDataAutoSyncService, userDataSyncWorkbenchService, notificationService, userDataProfilesService, fileService, uriIdentityService) {
    super(userDataSyncService, userDataSyncResourceProviderService, userDataAutoSyncService, userDataSyncWorkbenchService, notificationService, userDataProfilesService);
    this.activityDataResource = activityDataResource;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
  }
  async getChildren(element) {
    if (!element) {
      this.machinesPromise = void 0;
      if (!this.activityDataResource) {
        return [];
      }
      const stat = await this.fileService.resolve(this.activityDataResource);
      if (stat.isDirectory) {
        this.activityDataLocation = this.activityDataResource;
      } else {
        this.activityDataLocation = this.uriIdentityService.extUri.joinPath(this.uriIdentityService.extUri.dirname(this.activityDataResource), "remoteActivity");
        try {
          await this.fileService.del(this.activityDataLocation, { recursive: true });
        } catch (e) {
        }
        await this.userDataSyncService.extractActivityData(this.activityDataResource, this.activityDataLocation);
      }
    }
    return super.getChildren(element);
  }
  getResourceHandles(syncResource, profile) {
    return this.userDataSyncResourceProviderService.getLocalSyncResourceHandles(syncResource, profile, this.activityDataLocation);
  }
  async getProfiles() {
    return this.userDataSyncResourceProviderService.getLocalSyncedProfiles(this.activityDataLocation);
  }
  async getChildrenForSyncResourceTreeItem(element) {
    const children = await super.getChildrenForSyncResourceTreeItem(element);
    if (children.length) {
      const machineId = await this.userDataSyncResourceProviderService.getMachineId(element.syncResourceHandle);
      if (machineId) {
        const machines = await this.getMachines();
        const machine = machines.find(({ id: id2 }) => id2 === machineId);
        children[0].description = machine?.isCurrent ? localize(21792, null) : machine?.name;
      }
    }
    return children;
  }
  getMachines() {
    if (this.machinesPromise === void 0) {
      this.machinesPromise = this.userDataSyncResourceProviderService.getLocalSyncedMachines(this.activityDataLocation);
    }
    return this.machinesPromise;
  }
};

ExtractedUserDataSyncActivityViewDataProvider = __decorateClass([
  __decorateParam(1, IUserDataSyncService),
  __decorateParam(2, IUserDataSyncResourceProviderService),
  __decorateParam(3, IUserDataAutoSyncService),
  __decorateParam(4, IUserDataSyncWorkbenchService),
  __decorateParam(5, INotificationService),
  __decorateParam(6, IUserDataProfilesService),
  __decorateParam(7, IFileService),
  __decorateParam(8, IUriIdentityService)
], ExtractedUserDataSyncActivityViewDataProvider);

var UserDataSyncMachinesViewDataProvider = class {
  constructor(treeView, userDataSyncMachinesService, quickInputService, notificationService, dialogService, userDataSyncWorkbenchService) {
    this.treeView = treeView;
    this.userDataSyncMachinesService = userDataSyncMachinesService;
    this.quickInputService = quickInputService;
    this.notificationService = notificationService;
    this.dialogService = dialogService;
    this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
  }
  async getChildren(element) {
    if (!element) {
      this.machinesPromise = void 0;
    }
    try {
      let machines = await this.getMachines();
      machines = machines.filter((m) => !m.disabled).sort((m1, m2) => m1.isCurrent ? -1 : 1);
      this.treeView.message = machines.length ? void 0 : localize(21797, null);
      return machines.map(({ id: id2, name, isCurrent, platform: platform3 }) => ({
        handle: id2,
        collapsibleState: 0 /* None */,
        label: { label: name },
        description: isCurrent ? localize(21792, null) : void 0,
        themeIcon: platform3 && isWebPlatform(platform3) ? Codicon.globe : Codicon.vm,
        contextValue: "sync-machine"
      }));
    } catch (error) {
      this.notificationService.error(error);
      return [];
    }
  }
  getMachines() {
    if (this.machinesPromise === void 0) {
      this.machinesPromise = this.userDataSyncMachinesService.getMachines();
    }
    return this.machinesPromise;
  }
  async disable(machineIds) {
    const machines = await this.getMachines();
    const machinesToDisable = machines.filter(({ id: id2 }) => machineIds.includes(id2));
    if (!machinesToDisable.length) {
      throw new Error(localize(21798, null, machineIds.join(",")));
    }
    const result = await this.dialogService.confirm({
      type: "info",
      message: machinesToDisable.length > 1 ? localize(21811, null) : localize(21810, null, machinesToDisable[0].name),
      primaryButton: localize(21809, null)
    });
    if (!result.confirmed) {
      return false;
    }
    if (machinesToDisable.some((machine) => machine.isCurrent)) {
      await this.userDataSyncWorkbenchService.turnoff(false);
    }
    const otherMachinesToDisable = machinesToDisable.filter((machine) => !machine.isCurrent).map((machine) => [machine.id, false]);
    if (otherMachinesToDisable.length) {
      await this.userDataSyncMachinesService.setEnablements(otherMachinesToDisable);
    }
    return true;
  }
  async rename(machineId) {
    const disposableStore = new DisposableStore();
    const inputBox = disposableStore.add(this.quickInputService.createInputBox());
    inputBox.placeholder = localize(21799, null);
    inputBox.busy = true;
    inputBox.show();
    const machines = await this.getMachines();
    const machine = machines.find(({ id: id2 }) => id2 === machineId);
    const enabledMachines = machines.filter(({ disabled }) => !disabled);
    if (!machine) {
      inputBox.hide();
      disposableStore.dispose();
      throw new Error(localize(21798, null, machineId));
    }
    inputBox.busy = false;
    inputBox.value = machine.name;
    const validateMachineName = (machineName) => {
      machineName = machineName.trim();
      return machineName && !enabledMachines.some((m) => m.id !== machineId && m.name === machineName) ? machineName : null;
    };
    disposableStore.add(inputBox.onDidChangeValue(() => inputBox.validationMessage = validateMachineName(inputBox.value) ? "" : localize(21812, null)));
    return new Promise((c, e) => {
      disposableStore.add(inputBox.onDidAccept(async () => {
        const machineName = validateMachineName(inputBox.value);
        disposableStore.dispose();
        if (machineName && machineName !== machine.name) {
          try {
            await this.userDataSyncMachinesService.renameMachine(machineId, machineName);
            c(true);
          } catch (error) {
            e(error);
          }
        } else {
          c(false);
        }
      }));
    });
  }
};

UserDataSyncMachinesViewDataProvider = __decorateClass([
  __decorateParam(1, IUserDataSyncMachinesService),
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IDialogService),
  __decorateParam(5, IUserDataSyncWorkbenchService)
], UserDataSyncMachinesViewDataProvider);

var UserDataSyncTroubleshootViewDataProvider = class {
  constructor(fileService, userDataSyncWorkbenchService, environmentService, uriIdentityService) {
    this.fileService = fileService;
    this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
    this.environmentService = environmentService;
    this.uriIdentityService = uriIdentityService;
  }
  async getChildren(element) {
    if (!element) {
      return [{
        handle: "SYNC_LOGS",
        collapsibleState: 1 /* Collapsed */,
        label: { label: localize(21806, null) },
        themeIcon: Codicon.folder
      }, {
        handle: "LAST_SYNC_STATES",
        collapsibleState: 1 /* Collapsed */,
        label: { label: localize(21794, null) },
        themeIcon: Codicon.folder
      }];
    }
    if (element.handle === "LAST_SYNC_STATES") {
      return this.getLastSyncStates();
    }
    if (element.handle === "SYNC_LOGS") {
      return this.getSyncLogs();
    }
    return [];
  }
  async getLastSyncStates() {
    const result = [];
    for (const syncResource of ALL_SYNC_RESOURCES) {
      const resource = getLastSyncResourceUri(void 0, syncResource, this.environmentService, this.uriIdentityService.extUri);
      if (await this.fileService.exists(resource)) {
        result.push({
          handle: resource.toString(),
          label: { label: getSyncAreaLabel(syncResource) },
          collapsibleState: 0 /* None */,
          resourceUri: resource,
          command: { id: API_OPEN_EDITOR_COMMAND_ID, title: "", arguments: [resource, void 0, void 0] }
        });
      }
    }
    return result;
  }
  async getSyncLogs() {
    const logResources = await this.userDataSyncWorkbenchService.getAllLogResources();
    const result = [];
    for (const syncLogResource of logResources) {
      const logFolder = this.uriIdentityService.extUri.dirname(syncLogResource);
      result.push({
        handle: syncLogResource.toString(),
        collapsibleState: 0 /* None */,
        resourceUri: syncLogResource,
        label: { label: this.uriIdentityService.extUri.basename(logFolder) },
        description: this.uriIdentityService.extUri.isEqual(logFolder, this.environmentService.logsHome) ? localize(21792, null) : void 0,
        command: { id: API_OPEN_EDITOR_COMMAND_ID, title: "", arguments: [syncLogResource, void 0, void 0] }
      });
    }
    return result;
  }
};

UserDataSyncTroubleshootViewDataProvider = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IUserDataSyncWorkbenchService),
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, IUriIdentityService)
], UserDataSyncTroubleshootViewDataProvider);
export { UserDataSyncDataViews, UserDataSyncActivityViewDataProvider, LocalUserDataSyncActivityViewDataProvider, RemoteUserDataSyncActivityViewDataProvider, ExtractedUserDataSyncActivityViewDataProvider, UserDataSyncMachinesViewDataProvider, UserDataSyncTroubleshootViewDataProvider };
