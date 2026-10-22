// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/files/browser/files.contribution.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13 } from "./module-1094.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ViewPaneContainer } from "./module-1381.mjs";
import { SESSIONS_FILES_EMPTY_VIEW_ID, SESSIONS_FILES_VIEW_ID, SessionsExplorerEmptyView, SessionsExplorerView } from "./module-2951.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IsSessionsWindowContext, WorkspaceFolderCountContext } from "./module-0950.mjs";
import { IsNewChatSessionContext, IsPhoneLayoutContext, SessionHasGitRepositoryContext, SessionHasGitSyncActionRunningContext, SessionHasWorkspaceContext } from "./module-1770.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IViewsService } from "./module-1246.mjs";


// src/vs/sessions/contrib/files/browser/files.contribution.ts
var SESSIONS_FILES_CONTAINER_ID = "workbench.sessions.auxiliaryBar.filesContainer";

var filesViewIcon = registerIcon("sessions-files-view-icon", Codicon.files, localize2(4782, "View icon of the files view in the sessions window.").value);

var viewContainerRegistry2 = Registry.as(Extensions13.ViewContainersRegistry);

var filesViewContainer = viewContainerRegistry2.registerViewContainer({
  id: SESSIONS_FILES_CONTAINER_ID,
  title: localize2(4780, "Files"),
  icon: filesViewIcon,
  order: 11,
  ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [SESSIONS_FILES_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
  storageId: SESSIONS_FILES_CONTAINER_ID,
  hideIfEmpty: true,
  openCommandActionDescriptor: {
    id: SESSIONS_FILES_CONTAINER_ID,
    title: localize2(4779, "Explorer"),
    mnemonicTitle: localize(4781, null),
    keybindings: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 35 /* KeyE */ },
    order: 0
  },
  windowEnablement: 2 /* Sessions */
}, 2 /* AuxiliaryBar */, { isDefault: true });

var RegisterFilesViewContribution = class {
  static {
    this.ID = "sessions.registerFilesView";
  }
  constructor() {
    const viewsRegistry6 = Registry.as(Extensions13.ViewsRegistry);
    viewsRegistry6.registerViews([{
      id: SESSIONS_FILES_VIEW_ID,
      name: localize2(4780, "Files"),
      containerIcon: filesViewIcon,
      ctorDescriptor: new SyncDescriptor(SessionsExplorerView),
      canToggleVisibility: false,
      canMoveView: false,
      when: ContextKeyExpr.and(WorkspaceFolderCountContext.notEqualsTo("0"), IsPhoneLayoutContext.negate(), SessionHasWorkspaceContext),
      windowEnablement: 2 /* Sessions */
    }], filesViewContainer);
    viewsRegistry6.registerViews([{
      id: SESSIONS_FILES_EMPTY_VIEW_ID,
      name: localize2(4780, "Files"),
      containerIcon: filesViewIcon,
      ctorDescriptor: new SyncDescriptor(SessionsExplorerEmptyView),
      canToggleVisibility: false,
      canMoveView: false,
      when: ContextKeyExpr.and(WorkspaceFolderCountContext.isEqualTo("0"), IsPhoneLayoutContext.negate(), SessionHasWorkspaceContext),
      windowEnablement: 2 /* Sessions */
    }], filesViewContainer);
  }
};

registerWorkbenchContribution2(RegisterFilesViewContribution.ID, RegisterFilesViewContribution, WorkbenchPhase.BlockStartup);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "sessions.files.action.syncChanges",
      title: localize2(4783, "Sync Changes"),
      icon: Codicon.sync,
      precondition: SessionHasGitSyncActionRunningContext.negate(),
      menu: {
        id: MenuId.ViewTitle,
        group: "navigation",
        order: 1,
        when: ContextKeyExpr.and(
          IsSessionsWindowContext,
          IsNewChatSessionContext,
          SessionHasGitRepositoryContext,
          ContextKeyExpr.equals("view", SESSIONS_FILES_VIEW_ID)
        )
      }
    });
  }
  async run(accessor) {
    const commandService = accessor.get(ICommandService);
    const contextKeyService = accessor.get(IContextKeyService);
    const contextService = accessor.get(IWorkspaceContextService);
    const workspaceFolder = contextService.getWorkspace().folders[0];
    if (!workspaceFolder) {
      return;
    }
    const isSyncActionRunning = SessionHasGitSyncActionRunningContext.bindTo(contextKeyService);
    isSyncActionRunning.set(true);
    try {
      await commandService.executeCommand("git.sync", workspaceFolder.uri);
    } finally {
      isSyncActionRunning.set(false);
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "sessions.files.action.collapseExplorerFolders",
      title: localize2(4778, "Collapse Folders in Explorer"),
      icon: Codicon.collapseAll,
      menu: {
        id: MenuId.ViewTitle,
        group: "1_files",
        order: 10,
        when: ContextKeyExpr.equals("view", SESSIONS_FILES_VIEW_ID)
      }
    });
  }
  run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = viewsService.getViewWithId(SESSIONS_FILES_VIEW_ID);
    if (view !== null) {
      view.collapseAll();
    }
  }
});
export { SESSIONS_FILES_CONTAINER_ID, filesViewIcon, viewContainerRegistry2, filesViewContainer, RegisterFilesViewContribution };
