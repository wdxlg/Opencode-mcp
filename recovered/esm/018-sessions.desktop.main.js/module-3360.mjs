// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editSessions/browser/editSessionsViews.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Disposable } from "./module-0012.mjs";
import { EDIT_SESSIONS_DATA_VIEW_ID, EDIT_SESSIONS_SCHEME, EDIT_SESSIONS_SHOW_VIEW, EDIT_SESSIONS_TITLE, IEditSessionsStorageService } from "./module-3357.mjs";
import { TreeView, TreeViewPane } from "./module-1533.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13 } from "./module-1094.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { localize } from "./module-0001.mjs";
import { createCommandUri } from "./module-0462.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { URI } from "./module-0032.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IDialogService } from "./module-0267.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { fromNow } from "./module-0120.mjs";
import { joinPath } from "./module-0034.mjs";
import { basename } from "./module-0026.mjs";
import { API_OPEN_EDITOR_COMMAND_ID } from "./module-1530.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IFileService } from "./module-0269.mjs";


// src/vs/workbench/contrib/editSessions/browser/editSessionsViews.ts
var EDIT_SESSIONS_COUNT_KEY = "editSessionsCount";

var EDIT_SESSIONS_COUNT_CONTEXT_KEY = new RawContextKey(EDIT_SESSIONS_COUNT_KEY, 0);

var EditSessionsDataViews = class extends Disposable {
  constructor(container2, instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this.registerViews(container2);
  }
  registerViews(container2) {
    const viewId = EDIT_SESSIONS_DATA_VIEW_ID;
    const treeView = this.instantiationService.createInstance(TreeView, viewId, EDIT_SESSIONS_TITLE.value);
    treeView.showCollapseAllAction = true;
    treeView.showRefreshAction = true;
    treeView.dataProvider = this.instantiationService.createInstance(EditSessionDataViewDataProvider);
    const viewsRegistry6 = Registry.as(Extensions13.ViewsRegistry);
    viewsRegistry6.registerViews([{
      id: viewId,
      name: EDIT_SESSIONS_TITLE,
      ctorDescriptor: new SyncDescriptor(TreeViewPane),
      canToggleVisibility: true,
      canMoveView: false,
      treeView,
      collapsed: false,
      when: ContextKeyExpr.and(EDIT_SESSIONS_SHOW_VIEW),
      order: 100,
      hideByDefault: true
    }], container2);
    viewsRegistry6.registerViewWelcomeContent(viewId, {
      content: localize(
        14947,
        null,
        `[${localize(14949, null)}](${createCommandUri("workbench.editSessions.actions.store")})`
      ),
      when: ContextKeyExpr.equals(EDIT_SESSIONS_COUNT_KEY, 0),
      order: 1
    });
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.editSessions.actions.resume",
          title: localize(14952, null),
          icon: Codicon.desktopDownload,
          menu: {
            id: MenuId.ViewItemContext,
            when: ContextKeyExpr.and(ContextKeyExpr.equals("view", viewId), ContextKeyExpr.regex("viewItem", /edit-session/i)),
            group: "inline"
          }
        });
      }
      async run(accessor, handle2) {
        const editSessionId = URI.parse(handle2.$treeItemHandle).path.substring(1);
        const commandService = accessor.get(ICommandService);
        await commandService.executeCommand("workbench.editSessions.actions.resumeLatest", editSessionId, true);
        await treeView.refresh();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.editSessions.actions.store",
          title: localize(14953, null),
          icon: Codicon.cloudUpload
        });
      }
      async run(accessor, handle2) {
        const commandService = accessor.get(ICommandService);
        await commandService.executeCommand("workbench.editSessions.actions.storeCurrent");
        await treeView.refresh();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.editSessions.actions.delete",
          title: localize(14950, null),
          icon: Codicon.trash,
          menu: {
            id: MenuId.ViewItemContext,
            when: ContextKeyExpr.and(ContextKeyExpr.equals("view", viewId), ContextKeyExpr.regex("viewItem", /edit-session/i)),
            group: "inline"
          }
        });
      }
      async run(accessor, handle2) {
        const editSessionId = URI.parse(handle2.$treeItemHandle).path.substring(1);
        const dialogService = accessor.get(IDialogService);
        const editSessionStorageService = accessor.get(IEditSessionsStorageService);
        const result = await dialogService.confirm({
          message: localize(14945, null, editSessionId),
          detail: localize(14944, null),
          type: "warning",
          title: EDIT_SESSIONS_TITLE.value
        });
        if (result.confirmed) {
          await editSessionStorageService.delete("editSessions", editSessionId);
          await treeView.refresh();
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.editSessions.actions.deleteAll",
          title: localize(14951, null),
          icon: Codicon.trash,
          menu: {
            id: MenuId.ViewTitle,
            when: ContextKeyExpr.and(ContextKeyExpr.equals("view", viewId), ContextKeyExpr.greater(EDIT_SESSIONS_COUNT_KEY, 0))
          }
        });
      }
      async run(accessor) {
        const dialogService = accessor.get(IDialogService);
        const editSessionStorageService = accessor.get(IEditSessionsStorageService);
        const result = await dialogService.confirm({
          message: localize(14942, null),
          detail: localize(14943, null),
          type: "warning",
          title: EDIT_SESSIONS_TITLE.value
        });
        if (result.confirmed) {
          await editSessionStorageService.delete("editSessions", null);
          await treeView.refresh();
        }
      }
    }));
  }
};

EditSessionsDataViews = __decorateClass([
  __decorateParam(1, IInstantiationService)
], EditSessionsDataViews);

var EditSessionDataViewDataProvider = class {
  constructor(editSessionsStorageService, contextKeyService, workspaceContextService, fileService) {
    this.editSessionsStorageService = editSessionsStorageService;
    this.contextKeyService = contextKeyService;
    this.workspaceContextService = workspaceContextService;
    this.fileService = fileService;
    this.editSessionsCount = EDIT_SESSIONS_COUNT_CONTEXT_KEY.bindTo(this.contextKeyService);
  }
  async getChildren(element) {
    if (!element) {
      return this.getAllEditSessions();
    }
    const [ref, folderName, filePath] = URI.parse(element.handle).path.substring(1).split("/");
    if (ref && !folderName) {
      return this.getEditSession(ref);
    } else if (ref && folderName && !filePath) {
      return this.getEditSessionFolderContents(ref, folderName);
    }
    return [];
  }
  async getAllEditSessions() {
    const allEditSessions = await this.editSessionsStorageService.list("editSessions");
    this.editSessionsCount.set(allEditSessions.length);
    const editSessions = [];
    for (const session of allEditSessions) {
      const resource = URI.from({ scheme: EDIT_SESSIONS_SCHEME, authority: "remote-session-content", path: `/${session.ref}` });
      const sessionData = await this.editSessionsStorageService.read("editSessions", session.ref);
      if (!sessionData) {
        continue;
      }
      const content = JSON.parse(sessionData.content);
      const label3 = content.folders.map((folder) => folder.name).join(", ") ?? session.ref;
      const machineId = content.machine;
      const machineName = machineId ? await this.editSessionsStorageService.getMachineById(machineId) : void 0;
      const description = machineName === void 0 ? fromNow(session.created, true) : `${fromNow(session.created, true)}\xA0\xA0\u2022\xA0\xA0${machineName}`;
      editSessions.push({
        handle: resource.toString(),
        collapsibleState: 1 /* Collapsed */,
        label: { label: label3 },
        description,
        themeIcon: Codicon.repo,
        contextValue: `edit-session`
      });
    }
    return editSessions;
  }
  async getEditSession(ref) {
    const data = await this.editSessionsStorageService.read("editSessions", ref);
    if (!data) {
      return [];
    }
    const content = JSON.parse(data.content);
    if (content.folders.length === 1) {
      const folder = content.folders[0];
      return this.getEditSessionFolderContents(ref, folder.name);
    }
    return content.folders.map((folder) => {
      const resource = URI.from({ scheme: EDIT_SESSIONS_SCHEME, authority: "remote-session-content", path: `/${data.ref}/${folder.name}` });
      return {
        handle: resource.toString(),
        collapsibleState: 1 /* Collapsed */,
        label: { label: folder.name },
        themeIcon: Codicon.folder
      };
    });
  }
  async getEditSessionFolderContents(ref, folderName) {
    const data = await this.editSessionsStorageService.read("editSessions", ref);
    if (!data) {
      return [];
    }
    const content = JSON.parse(data.content);
    const currentWorkspaceFolder = this.workspaceContextService.getWorkspace().folders.find((folder) => folder.name === folderName);
    const editSessionFolder = content.folders.find((folder) => folder.name === folderName);
    if (!editSessionFolder) {
      return [];
    }
    return Promise.all(editSessionFolder.workingChanges.map(async (change) => {
      const cloudChangeUri = URI.from({ scheme: EDIT_SESSIONS_SCHEME, authority: "remote-session-content", path: `/${data.ref}/${folderName}/${change.relativeFilePath}` });
      if (currentWorkspaceFolder?.uri) {
        const localCopy = joinPath(currentWorkspaceFolder.uri, change.relativeFilePath);
        if (change.type === 1 /* Addition */ && await this.fileService.exists(localCopy)) {
          return {
            handle: cloudChangeUri.toString(),
            resourceUri: cloudChangeUri,
            collapsibleState: 0 /* None */,
            label: { label: change.relativeFilePath },
            themeIcon: Codicon.file,
            command: {
              id: "vscode.diff",
              title: localize(14941, null),
              arguments: [
                localCopy,
                cloudChangeUri,
                `${basename(change.relativeFilePath)} (${localize(14946, null)} \u2194 ${localize(14940, null)})`,
                void 0
              ]
            }
          };
        }
      }
      return {
        handle: cloudChangeUri.toString(),
        resourceUri: cloudChangeUri,
        collapsibleState: 0 /* None */,
        label: { label: change.relativeFilePath },
        themeIcon: Codicon.file,
        command: {
          id: API_OPEN_EDITOR_COMMAND_ID,
          title: localize(14948, null),
          arguments: [cloudChangeUri, void 0, void 0]
        }
      };
    }));
  }
};

EditSessionDataViewDataProvider = __decorateClass([
  __decorateParam(0, IEditSessionsStorageService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IFileService)
], EditSessionDataViewDataProvider);
export { EDIT_SESSIONS_COUNT_KEY, EDIT_SESSIONS_COUNT_CONTEXT_KEY, EditSessionsDataViews, EditSessionDataViewDataProvider };
