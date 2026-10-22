// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/actions/workspaceActions.ts
import { localize, localize2 } from "./module-0001.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { IsMacNativeContext } from "./module-0635.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { EmptyWorkspaceSupportContext, EnterMultiRootWorkspaceSupportContext, IsSessionsWindowContext, OpenFolderWorkspaceSupportContext, WorkbenchStateContext, WorkspaceFolderCountContext } from "./module-0949.mjs";
import { KeyChord } from "./module-0019.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ADD_ROOT_FOLDER_COMMAND_ID, ADD_ROOT_FOLDER_LABEL, PICK_WORKSPACE_FOLDER_COMMAND_ID, SET_ROOT_FOLDER_COMMAND_ID } from "./module-1521.mjs";
import { IHostService } from "./module-1117.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IWorkspaceContextService, hasWorkspaceFileExtension } from "./module-0509.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IWorkspaceEditingService } from "./module-1314.mjs";
import { IWorkspacesService } from "./module-1379.mjs";


// src/vs/workbench/browser/actions/workspaceActions.ts
var workspacesCategory = localize2(6184, "Workspaces");

var OpenFileAction = class _OpenFileAction extends Action2 {
  static {
    this.ID = "workbench.action.files.openFile";
  }
  constructor() {
    super({
      id: _OpenFileAction.ID,
      title: localize2(6178, "Open File..."),
      category: Categories.File,
      f1: true,
      keybinding: {
        when: IsMacNativeContext.toNegated(),
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 45 /* KeyO */
      }
    });
  }
  async run(accessor, data) {
    const fileDialogService = accessor.get(IFileDialogService);
    return fileDialogService.pickFileAndOpen({ forceNewWindow: false, telemetryExtraData: data });
  }
};

var OpenFolderAction = class _OpenFolderAction extends Action2 {
  static {
    this.ID = "workbench.action.files.openFolder";
  }
  constructor() {
    super({
      id: _OpenFolderAction.ID,
      title: localize2(6180, "Open Folder..."),
      category: Categories.File,
      f1: true,
      precondition: OpenFolderWorkspaceSupportContext,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: void 0,
        linux: {
          primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 45 /* KeyO */)
        },
        win: {
          primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 45 /* KeyO */)
        }
      }
    });
  }
  async run(accessor, data) {
    const fileDialogService = accessor.get(IFileDialogService);
    return fileDialogService.pickFolderAndOpen({ forceNewWindow: false, telemetryExtraData: data });
  }
};

var OpenFolderViaWorkspaceAction = class _OpenFolderViaWorkspaceAction extends Action2 {
  static {
    // This action swaps the folders of a workspace with
    // the selected folder and is a workaround for providing
    // "Open Folder..." in environments that do not support
    // this without having a workspace open (e.g. web serverless)
    this.ID = "workbench.action.files.openFolderViaWorkspace";
  }
  constructor() {
    super({
      id: _OpenFolderViaWorkspaceAction.ID,
      title: localize2(6180, "Open Folder..."),
      category: Categories.File,
      f1: true,
      precondition: ContextKeyExpr.and(OpenFolderWorkspaceSupportContext.toNegated(), WorkbenchStateContext.isEqualTo("workspace")),
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 45 /* KeyO */
      }
    });
  }
  run(accessor) {
    const commandService = accessor.get(ICommandService);
    return commandService.executeCommand(SET_ROOT_FOLDER_COMMAND_ID);
  }
};

var OpenFileFolderAction = class _OpenFileFolderAction extends Action2 {
  static {
    this.ID = "workbench.action.files.openFileFolder";
  }
  static {
    this.LABEL = localize2(6179, "Open...");
  }
  constructor() {
    super({
      id: _OpenFileFolderAction.ID,
      title: _OpenFileFolderAction.LABEL,
      category: Categories.File,
      f1: true,
      precondition: ContextKeyExpr.and(IsMacNativeContext, OpenFolderWorkspaceSupportContext),
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 45 /* KeyO */
      }
    });
  }
  async run(accessor, data) {
    const fileDialogService = accessor.get(IFileDialogService);
    return fileDialogService.pickFileFolderAndOpen({ forceNewWindow: false, telemetryExtraData: data });
  }
};

var OpenWorkspaceAction = class _OpenWorkspaceAction extends Action2 {
  static {
    this.ID = "workbench.action.openWorkspace";
  }
  constructor() {
    super({
      id: _OpenWorkspaceAction.ID,
      title: localize2(6181, "Open Workspace from File..."),
      category: Categories.File,
      f1: true,
      precondition: EnterMultiRootWorkspaceSupportContext
    });
  }
  async run(accessor, data) {
    const fileDialogService = accessor.get(IFileDialogService);
    return fileDialogService.pickWorkspaceAndOpen({ telemetryExtraData: data });
  }
};

var CloseWorkspaceAction = class _CloseWorkspaceAction extends Action2 {
  static {
    this.ID = "workbench.action.closeFolder";
  }
  constructor() {
    super({
      id: _CloseWorkspaceAction.ID,
      title: localize2(6166, "Close Workspace"),
      category: workspacesCategory,
      f1: true,
      precondition: ContextKeyExpr.and(WorkbenchStateContext.notEqualsTo("empty"), EmptyWorkspaceSupportContext, IsSessionsWindowContext.negate()),
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 36 /* KeyF */)
      }
    });
  }
  async run(accessor) {
    const hostService = accessor.get(IHostService);
    const environmentService = accessor.get(IWorkbenchEnvironmentService);
    return hostService.openWindow({ forceReuseWindow: true, remoteAuthority: environmentService.remoteAuthority });
  }
};

var OpenWorkspaceConfigFileAction = class _OpenWorkspaceConfigFileAction extends Action2 {
  static {
    this.ID = "workbench.action.openWorkspaceConfigFile";
  }
  constructor() {
    super({
      id: _OpenWorkspaceConfigFileAction.ID,
      title: localize2(6182, "Open Workspace Configuration File"),
      category: workspacesCategory,
      f1: true,
      precondition: ContextKeyExpr.and(WorkbenchStateContext.isEqualTo("workspace"), IsSessionsWindowContext.negate())
    });
  }
  async run(accessor) {
    const contextService = accessor.get(IWorkspaceContextService);
    const editorService = accessor.get(IEditorService);
    const configuration2 = contextService.getWorkspace().configuration;
    if (configuration2) {
      await editorService.openEditor({ resource: configuration2, options: { pinned: true } });
    }
  }
};

var AddRootFolderAction = class _AddRootFolderAction extends Action2 {
  static {
    this.ID = "workbench.action.addRootFolder";
  }
  constructor() {
    super({
      id: _AddRootFolderAction.ID,
      title: ADD_ROOT_FOLDER_LABEL,
      category: workspacesCategory,
      f1: true,
      precondition: ContextKeyExpr.and(ContextKeyExpr.or(EnterMultiRootWorkspaceSupportContext, WorkbenchStateContext.isEqualTo("workspace")), IsSessionsWindowContext.negate())
    });
  }
  run(accessor) {
    const commandService = accessor.get(ICommandService);
    return commandService.executeCommand(ADD_ROOT_FOLDER_COMMAND_ID);
  }
};

var RemoveRootFolderAction = class _RemoveRootFolderAction extends Action2 {
  static {
    this.ID = "workbench.action.removeRootFolder";
  }
  constructor() {
    super({
      id: _RemoveRootFolderAction.ID,
      title: localize2(6169, "Remove Folder from Workspace..."),
      category: workspacesCategory,
      f1: true,
      precondition: ContextKeyExpr.and(WorkspaceFolderCountContext.notEqualsTo("0"), ContextKeyExpr.or(EnterMultiRootWorkspaceSupportContext, WorkbenchStateContext.isEqualTo("workspace")), IsSessionsWindowContext.negate())
    });
  }
  async run(accessor) {
    const commandService = accessor.get(ICommandService);
    const workspaceEditingService = accessor.get(IWorkspaceEditingService);
    const folder = await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID);
    if (folder) {
      await workspaceEditingService.removeFolders([folder.uri]);
    }
  }
};

var SaveWorkspaceAsAction = class _SaveWorkspaceAsAction extends Action2 {
  static {
    this.ID = "workbench.action.saveWorkspaceAs";
  }
  constructor() {
    super({
      id: _SaveWorkspaceAsAction.ID,
      title: localize2(6183, "Save Workspace As..."),
      category: workspacesCategory,
      f1: true,
      precondition: ContextKeyExpr.and(EnterMultiRootWorkspaceSupportContext, IsSessionsWindowContext.negate())
    });
  }
  async run(accessor) {
    const workspaceEditingService = accessor.get(IWorkspaceEditingService);
    const contextService = accessor.get(IWorkspaceContextService);
    const configPathUri = await workspaceEditingService.pickNewWorkspacePath();
    if (configPathUri && hasWorkspaceFileExtension(configPathUri)) {
      switch (contextService.getWorkbenchState()) {
        case 1 /* EMPTY */:
        case 2 /* FOLDER */: {
          const folders = contextService.getWorkspace().folders.map((folder) => ({ uri: folder.uri }));
          return workspaceEditingService.createAndEnterWorkspace(folders, configPathUri);
        }
        case 3 /* WORKSPACE */:
          return workspaceEditingService.saveAndEnterWorkspace(configPathUri);
      }
    }
  }
};

var DuplicateWorkspaceInNewWindowAction = class _DuplicateWorkspaceInNewWindowAction extends Action2 {
  static {
    this.ID = "workbench.action.duplicateWorkspaceInNewWindow";
  }
  constructor() {
    super({
      id: _DuplicateWorkspaceInNewWindowAction.ID,
      title: localize2(6168, "Duplicate As Workspace in New Window"),
      category: workspacesCategory,
      f1: true,
      precondition: ContextKeyExpr.and(EnterMultiRootWorkspaceSupportContext, IsSessionsWindowContext.negate())
    });
  }
  async run(accessor) {
    const workspaceContextService = accessor.get(IWorkspaceContextService);
    const workspaceEditingService = accessor.get(IWorkspaceEditingService);
    const hostService = accessor.get(IHostService);
    const workspacesService = accessor.get(IWorkspacesService);
    const environmentService = accessor.get(IWorkbenchEnvironmentService);
    const folders = workspaceContextService.getWorkspace().folders;
    const remoteAuthority = environmentService.remoteAuthority;
    const newWorkspace = await workspacesService.createUntitledWorkspace(folders, remoteAuthority);
    await workspaceEditingService.copyWorkspaceSettings(newWorkspace);
    return hostService.openWindow([{ workspaceUri: newWorkspace.configPath }], { forceNewWindow: true, remoteAuthority });
  }
};

registerAction2(AddRootFolderAction);

registerAction2(RemoveRootFolderAction);

registerAction2(OpenFileAction);

registerAction2(OpenFolderAction);

registerAction2(OpenFolderViaWorkspaceAction);

registerAction2(OpenFileFolderAction);

registerAction2(OpenWorkspaceAction);

registerAction2(OpenWorkspaceConfigFileAction);

registerAction2(CloseWorkspaceAction);

registerAction2(SaveWorkspaceAsAction);

registerAction2(DuplicateWorkspaceInNewWindowAction);

MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  group: "2_open",
  command: {
    id: OpenFileAction.ID,
    title: localize(6174, null)
  },
  order: 1,
  when: IsMacNativeContext.toNegated()
});

MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  group: "2_open",
  command: {
    id: OpenFolderAction.ID,
    title: localize(6175, null)
  },
  order: 2,
  when: OpenFolderWorkspaceSupportContext
});

MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  group: "2_open",
  command: {
    id: OpenFolderViaWorkspaceAction.ID,
    title: localize(6175, null)
  },
  order: 2,
  when: ContextKeyExpr.and(OpenFolderWorkspaceSupportContext.toNegated(), WorkbenchStateContext.isEqualTo("workspace"))
});

MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  group: "2_open",
  command: {
    id: OpenFileFolderAction.ID,
    title: localize(6173, null)
  },
  order: 1,
  when: ContextKeyExpr.and(IsMacNativeContext, OpenFolderWorkspaceSupportContext)
});

MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  group: "2_open",
  command: {
    id: OpenWorkspaceAction.ID,
    title: localize(6176, null)
  },
  order: 3,
  when: EnterMultiRootWorkspaceSupportContext
});

MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  group: "3_workspace",
  command: {
    id: ADD_ROOT_FOLDER_COMMAND_ID,
    title: localize(6170, null)
  },
  when: ContextKeyExpr.and(ContextKeyExpr.or(EnterMultiRootWorkspaceSupportContext, WorkbenchStateContext.isEqualTo("workspace")), IsSessionsWindowContext.negate()),
  order: 1
});

MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  group: "3_workspace",
  command: {
    id: SaveWorkspaceAsAction.ID,
    title: localize(6177, null)
  },
  order: 2,
  when: ContextKeyExpr.and(EnterMultiRootWorkspaceSupportContext, IsSessionsWindowContext.negate())
});

MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  group: "3_workspace",
  command: {
    id: DuplicateWorkspaceInNewWindowAction.ID,
    title: localize(6167, null)
  },
  order: 3,
  when: ContextKeyExpr.and(EnterMultiRootWorkspaceSupportContext, IsSessionsWindowContext.negate())
});

MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  group: "6_close",
  command: {
    id: CloseWorkspaceAction.ID,
    title: localize(6171, null)
  },
  order: 3,
  when: ContextKeyExpr.and(WorkbenchStateContext.isEqualTo("folder"), EmptyWorkspaceSupportContext, IsSessionsWindowContext.negate())
});

MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  group: "6_close",
  command: {
    id: CloseWorkspaceAction.ID,
    title: localize(6172, null)
  },
  order: 3,
  when: ContextKeyExpr.and(WorkbenchStateContext.isEqualTo("workspace"), EmptyWorkspaceSupportContext, IsSessionsWindowContext.negate())
});
export { workspacesCategory, OpenFileAction, OpenFolderAction, OpenFolderViaWorkspaceAction, OpenFileFolderAction, OpenWorkspaceAction, CloseWorkspaceAction, OpenWorkspaceConfigFileAction, AddRootFolderAction, RemoveRootFolderAction, SaveWorkspaceAsAction, DuplicateWorkspaceInNewWindowAction };
