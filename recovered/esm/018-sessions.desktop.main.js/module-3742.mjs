// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/changes/browser/changesViewActions.ts
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { IViewsService } from "./module-1246.mjs";
import { ActiveSessionContextKeys, CHANGES_VIEW_ID, ChangesContextKeys, SESSIONS_CHANGES_OPEN_SINGLE_FILE_DIFF_SETTING } from "./module-3620.mjs";
import { Disposable } from "./module-0012.mjs";
import { bindContextKey } from "./module-0444.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { CustomViewVisibleContext, SessionHasChangesContext, SessionIsCreatedContext, SinglePaneDiffEditorInputActiveContext, SinglePaneLayoutEnabledContext } from "./module-1770.mjs";
import { DiffEditorInput } from "./module-1102.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IChangesViewService } from "./module-3645.mjs";
import { IEditorService } from "./module-0935.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { ActiveEditorContext, AuxiliaryBarVisibleContext, IsAuxiliaryWindowContext, IsSessionsWindowContext, IsTopRightEditorGroupContext, MainEditorAreaVisibleContext, TextCompareEditorActiveContext } from "./module-0950.mjs";
import { ICommandService } from "./module-0087.mjs";
import { OPEN_PULL_REQUEST_ACTION_ID } from "./module-3594.mjs";
import { SessionChangesEditor } from "./module-3739.mjs";
import { CHANGES_HEADER_ACTIONS_ID } from "./module-3737.mjs";
import { Menus } from "./module-3437.mjs";
import { logChangesViewViewModeChange } from "./module-1781.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { TOGGLE_DIFF_SIDE_BY_SIDE } from "./module-1528.mjs";
import { SessionsDiffRenderSideBySideContext } from "./module-3738.mjs";
import { isEqual2 } from "./module-0034.mjs";


// src/vs/sessions/contrib/changes/browser/changesViewActions.ts
var openChangesViewActionOptions = {
  id: "workbench.action.agentSessions.openChangesView",
  title: localize2(4283, "Changes"),
  icon: Codicon.diffMultiple,
  f1: false
};

var OpenChangesViewAction = class extends Action2 {
  static {
    this.ID = openChangesViewActionOptions.id;
  }
  constructor() {
    super(openChangesViewActionOptions);
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    await viewsService.openView(CHANGES_VIEW_ID, true);
  }
};

registerAction2(OpenChangesViewAction);

var ChangesViewActionsContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.changesViewActions";
  }
  constructor(contextKeyService, sessionsService, changesViewService, editorService) {
    super();
    this._register(bindContextKey(ActiveSessionContextKeys.HasChanges, contextKeyService, (reader) => {
      const activeSession = sessionsService.activeSession.read(reader);
      if (!activeSession) {
        return false;
      }
      const changes = activeSession.changes.read(reader);
      return changes.length > 0;
    }));
    this._register(bindContextKey(ChangesContextKeys.ViewMode, contextKeyService, (reader) => {
      return changesViewService.viewModeObs.read(reader);
    }));
    const activeEditor = observableFromEvent(this, editorService.onDidActiveEditorChange, () => editorService.activeEditor);
    this._register(bindContextKey(SinglePaneDiffEditorInputActiveContext, contextKeyService, (reader) => activeEditor.read(reader) instanceof DiffEditorInput));
  }
};

ChangesViewActionsContribution = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ISessionsService),
  __decorateParam(2, IChangesViewService),
  __decorateParam(3, IEditorService)
], ChangesViewActionsContribution);

registerWorkbenchContribution2(ChangesViewActionsContribution.ID, ChangesViewActionsContribution, WorkbenchPhase.AfterRestored);

var OpenPullRequestAction = class _OpenPullRequestAction extends Action2 {
  static {
    this.ID = "workbench.action.agentSessions.openPullRequest";
  }
  constructor() {
    super({
      id: _OpenPullRequestAction.ID,
      title: localize2(4285, "Open Pull Request"),
      icon: Codicon.gitPullRequest,
      f1: false,
      menu: {
        id: MenuId.AgentsChangesToolbar,
        group: "navigation",
        order: 9,
        when: ContextKeyExpr.and(
          IsSessionsWindowContext,
          ActiveSessionContextKeys.HasPullRequest
        )
      }
    });
  }
  async run(accessor) {
    const commandService = accessor.get(ICommandService);
    const sessionsService = accessor.get(ISessionsService);
    const activeSession = sessionsService.activeSession.get();
    if (!activeSession) {
      return;
    }
    await commandService.executeCommand(OPEN_PULL_REQUEST_ACTION_ID, activeSession);
  }
};

registerAction2(OpenPullRequestAction);

var singlePaneChangesEditorActive = ContextKeyExpr.and(
  IsSessionsWindowContext,
  ActiveEditorContext.isEqualTo(SessionChangesEditor.ID),
  SinglePaneLayoutEnabledContext
);

var singlePaneFileDiffEditorActive = ContextKeyExpr.and(
  IsSessionsWindowContext,
  SinglePaneDiffEditorInputActiveContext,
  SinglePaneLayoutEnabledContext
);

var singlePaneTextDiffEditorActive = ContextKeyExpr.and(
  IsSessionsWindowContext,
  TextCompareEditorActiveContext,
  SinglePaneLayoutEnabledContext
);

var singlePaneChangesEditorTitle = ContextKeyExpr.and(
  singlePaneChangesEditorActive,
  IsAuxiliaryWindowContext.toNegated(),
  IsTopRightEditorGroupContext
);

var singlePaneChangesEditorTitleVisible = ContextKeyExpr.and(
  singlePaneChangesEditorTitle,
  MainEditorAreaVisibleContext
);

var singlePaneDiffEditorTitle = ContextKeyExpr.and(
  ContextKeyExpr.or(singlePaneChangesEditorActive, singlePaneFileDiffEditorActive),
  IsAuxiliaryWindowContext.toNegated(),
  IsTopRightEditorGroupContext
);

var singlePaneTextDiffEditorTitle = ContextKeyExpr.and(
  singlePaneTextDiffEditorActive,
  IsAuxiliaryWindowContext.toNegated(),
  IsTopRightEditorGroupContext
);

var singlePaneDiffEditorTitleVisible = ContextKeyExpr.and(
  ContextKeyExpr.or(singlePaneChangesEditorTitle, singlePaneTextDiffEditorTitle),
  MainEditorAreaVisibleContext
);

var ChangesHeaderActionsAction = class extends Action2 {
  constructor() {
    super({
      id: CHANGES_HEADER_ACTIONS_ID,
      title: localize2(4281, "Changes Actions"),
      f1: false,
      menu: {
        id: Menus.TitleBarSessionMenu,
        group: "navigation",
        order: 5,
        when: ContextKeyExpr.and(
          IsSessionsWindowContext,
          IsAuxiliaryWindowContext.toNegated(),
          CustomViewVisibleContext.negate(),
          SinglePaneLayoutEnabledContext,
          SessionIsCreatedContext,
          SessionHasChangesContext
        )
      }
    });
  }
  async run() {
  }
};

registerAction2(ChangesHeaderActionsAction);

var SetChangesListViewModeAction2 = class _SetChangesListViewModeAction extends Action2 {
  static {
    this.ID = "workbench.action.agentSessions.setChangesListViewMode";
  }
  constructor() {
    super({
      id: _SetChangesListViewModeAction.ID,
      title: localize2(4276, "View as List"),
      icon: Codicon.listFlat,
      f1: false,
      menu: {
        id: Menus.SessionsEditorTitle,
        group: "2_viewMode",
        order: 20,
        when: ContextKeyExpr.and(
          singlePaneDiffEditorTitle,
          AuxiliaryBarVisibleContext,
          ChangesContextKeys.ViewMode.isEqualTo("tree" /* Tree */)
        )
      }
    });
  }
  run(accessor) {
    logChangesViewViewModeChange(accessor.get(ITelemetryService), "list" /* List */);
    accessor.get(IChangesViewService).setViewMode("list" /* List */);
  }
};

registerAction2(SetChangesListViewModeAction2);

var SetChangesTreeViewModeAction2 = class _SetChangesTreeViewModeAction extends Action2 {
  static {
    this.ID = "workbench.action.agentSessions.setChangesTreeViewMode";
  }
  constructor() {
    super({
      id: _SetChangesTreeViewModeAction.ID,
      title: localize2(4277, "View as Tree"),
      icon: Codicon.listTree,
      f1: false,
      menu: {
        id: Menus.SessionsEditorTitle,
        group: "2_viewMode",
        order: 20,
        when: ContextKeyExpr.and(
          singlePaneDiffEditorTitle,
          AuxiliaryBarVisibleContext,
          ChangesContextKeys.ViewMode.isEqualTo("list" /* List */)
        )
      }
    });
  }
  run(accessor) {
    logChangesViewViewModeChange(accessor.get(ITelemetryService), "tree" /* Tree */);
    accessor.get(IChangesViewService).setViewMode("tree" /* Tree */);
  }
};

registerAction2(SetChangesTreeViewModeAction2);

var CollapseAllSessionChangesDiffsAction = class _CollapseAllSessionChangesDiffsAction extends Action2 {
  static {
    this.ID = "workbench.action.agentSessions.collapseAllDiffs";
  }
  constructor() {
    super({
      id: _CollapseAllSessionChangesDiffsAction.ID,
      title: localize2(4274, "Collapse All Diffs"),
      icon: Codicon.collapseAll,
      f1: false,
      menu: {
        id: Menus.SessionsEditorTitle,
        group: "1_diff",
        order: 10,
        when: ContextKeyExpr.and(
          singlePaneChangesEditorTitleVisible,
          ContextKeyExpr.not("multiDiffEditorAllCollapsed")
        )
      }
    });
  }
  run(accessor) {
    const activeEditorPane = accessor.get(IEditorService).activeEditorPane;
    if (activeEditorPane instanceof SessionChangesEditor) {
      activeEditorPane.collapseAllDiffs();
    }
  }
};

registerAction2(CollapseAllSessionChangesDiffsAction);

var ExpandAllSessionChangesDiffsAction = class _ExpandAllSessionChangesDiffsAction extends Action2 {
  static {
    this.ID = "workbench.action.agentSessions.expandAllDiffs";
  }
  constructor() {
    super({
      id: _ExpandAllSessionChangesDiffsAction.ID,
      title: localize2(4275, "Expand All Diffs"),
      icon: Codicon.expandAll,
      f1: false,
      menu: {
        id: Menus.SessionsEditorTitle,
        group: "1_diff",
        order: 10,
        when: ContextKeyExpr.and(
          singlePaneChangesEditorActive,
          IsAuxiliaryWindowContext.toNegated(),
          IsTopRightEditorGroupContext,
          MainEditorAreaVisibleContext,
          ContextKeyExpr.has("multiDiffEditorAllCollapsed")
        )
      }
    });
  }
  run(accessor) {
    const activeEditorPane = accessor.get(IEditorService).activeEditorPane;
    if (activeEditorPane instanceof SessionChangesEditor) {
      activeEditorPane.expandAllDiffs();
    }
  }
};

registerAction2(ExpandAllSessionChangesDiffsAction);

MenuRegistry.appendMenuItem(Menus.SessionsEditorTitle, {
  command: {
    id: TOGGLE_DIFF_SIDE_BY_SIDE,
    title: localize(4278, null),
    tooltip: localize(4279, null),
    icon: Codicon.diffSidebyside,
    toggled: SessionsDiffRenderSideBySideContext.negate()
  },
  group: "1_diff",
  order: 20,
  when: singlePaneDiffEditorTitleVisible
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: TOGGLE_DIFF_SIDE_BY_SIDE,
    title: localize2(4286, "Toggle Preferred Diff View"),
    category: localize2(4280, "Changes")
  },
  when: singlePaneDiffEditorTitleVisible
});

var OpenChangesAction = class _OpenChangesAction extends Action2 {
  static {
    this.ID = "workbench.action.agentSessions.openChanges";
  }
  constructor() {
    super({
      id: _OpenChangesAction.ID,
      title: localize2(4282, "Open Changes"),
      icon: Codicon.gitCompare,
      f1: false
    });
  }
  async run(accessor, _sessionResource, _ref2, ...resources) {
    const editorService = accessor.get(IEditorService);
    const changesViewService = accessor.get(IChangesViewService);
    const sessionChanges = changesViewService.activeSessionChangesObs.get();
    const changes = sessionChanges?.filter(
      (change) => resources.some((resource) => isEqual2(change.modifiedUri ?? change.originalUri, resource))
    ) ?? [];
    await Promise.all(changes.map((change) => editorService.openEditor({
      original: { resource: change.originalUri },
      modified: { resource: change.modifiedUri }
    })));
  }
};

registerAction2(OpenChangesAction);

var openSingleFileDiffEnabled = ContextKeyExpr.equals(`config.${SESSIONS_CHANGES_OPEN_SINGLE_FILE_DIFF_SETTING}`, true);

var OpenFileAction2 = class _OpenFileAction extends Action2 {
  static {
    this.ID = "workbench.action.agentSessions.openFile";
  }
  constructor() {
    super({
      id: _OpenFileAction.ID,
      title: localize2(4284, "Open File"),
      icon: Codicon.goToFile,
      f1: false,
      menu: [
        // When opening a file already shows a single file diff, the "Open
        // Changes" alt action is redundant and is therefore omitted.
        {
          id: MenuId.AgentsChangeInlineToolbar,
          group: "navigation",
          order: 1,
          when: ContextKeyExpr.and(
            IsSessionsWindowContext,
            ChangesContextKeys.ChangeKind.isEqualTo("file"),
            openSingleFileDiffEnabled
          )
        },
        // Default behavior: the alt action ("Open Changes") opens a diff
        // editor for the selected change(s).
        {
          id: MenuId.AgentsChangeInlineToolbar,
          group: "navigation",
          order: 1,
          alt: {
            id: OpenChangesAction.ID,
            title: localize2(4282, "Open Changes"),
            icon: Codicon.gitCompare
          },
          when: ContextKeyExpr.and(
            IsSessionsWindowContext,
            ChangesContextKeys.ChangeKind.isEqualTo("file"),
            openSingleFileDiffEnabled.negate()
          )
        }
      ]
    });
  }
  async run(accessor, _sessionResource, _ref2, ...resources) {
    const editorService = accessor.get(IEditorService);
    await Promise.all(resources.map((resource) => editorService.openEditor({ resource })));
  }
};

registerAction2(OpenFileAction2);
export { openChangesViewActionOptions, OpenChangesViewAction, ChangesViewActionsContribution, OpenPullRequestAction, singlePaneChangesEditorActive, singlePaneFileDiffEditorActive, singlePaneTextDiffEditorActive, singlePaneChangesEditorTitle, singlePaneChangesEditorTitleVisible, singlePaneDiffEditorTitle, singlePaneTextDiffEditorTitle, singlePaneDiffEditorTitleVisible, ChangesHeaderActionsAction, SetChangesListViewModeAction2, SetChangesTreeViewModeAction2, CollapseAllSessionChangesDiffsAction, ExpandAllSessionChangesDiffsAction, OpenChangesAction, openSingleFileDiffEnabled, OpenFileAction2 };
