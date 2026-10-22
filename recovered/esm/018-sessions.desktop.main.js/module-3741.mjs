// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/changes/browser/changesActions.ts
import { Action2, MenuId, MenuItemAction, registerAction2 } from "./module-0092.mjs";
import { VIEW_SESSION_CHANGES_COMMAND_ID } from "./module-3620.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { Menus } from "./module-3437.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { SessionHasCachedChangesContext, SessionHasChangesContext, SessionHasOpenPullRequestContext, SessionHasWorkspaceContext, SessionPrimaryPullRequestOperationContext } from "./module-1770.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionChangesService } from "./module-3646.mjs";
import { IAgentWorkbenchLayoutService } from "./module-3474.mjs";
import { ActiveEditorContext } from "./module-0950.mjs";
import { SessionChangesEditor } from "./module-3739.mjs";
import { URI } from "./module-0032.mjs";
import { IEditorService } from "./module-0935.mjs";
import { MultiDiffEditor } from "./module-2681.mjs";
import { DiffEditorWidget } from "./module-0527.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { ChatPillActionViewItem } from "./module-2235.mjs";
import { derivedOpts } from "./module-0054.mjs";
import { structuralEquals } from "./module-0042.mjs";
import { ISessionChangesStatsCache, readSessionChangesStats } from "./module-1777.mjs";
import { autorun } from "./module-0052.mjs";
import { $ } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionContext } from "./module-3499.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { ChangesMultiDiffSourceResolver, SessionChangesReviewedFilesContext } from "./module-3740.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { observableValue } from "./module-0048.mjs";
import { transaction } from "./module-0045.mjs";
import { bindContextKey } from "./module-0444.mjs";
import { AGENT_HOST_PULL_REQUEST_OPERATION_IDS } from "./module-3734.mjs";
import { IChangesViewService } from "./module-3645.mjs";
import { ILogService } from "./module-0095.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/changes/browser/changesActions.ts
var ViewAllChangesAction = class _ViewAllChangesAction extends Action2 {
  static {
    this.ID = VIEW_SESSION_CHANGES_COMMAND_ID;
  }
  constructor() {
    super({
      id: _ViewAllChangesAction.ID,
      title: localize2(4253, "Changes"),
      icon: Codicon.diffMultiple,
      f1: false,
      // Metadata pill rendered with live +/- counts, or the counts last shown
      // for the session while it has not reported its changes yet. A session
      // without a workspace folder (a quick chat) has no Changes editor to
      // open, so the pill would be inert — it never joins the pill row.
      menu: {
        id: Menus.SessionHeaderMeta,
        group: "navigation",
        order: 0,
        when: ContextKeyExpr.and(
          ContextKeyExpr.or(SessionHasChangesContext, SessionHasCachedChangesContext),
          SessionHasWorkspaceContext
        )
      }
    });
  }
  async run(accessor, session) {
    const sessionsService = accessor.get(ISessionsService);
    const sessionChangesService = accessor.get(ISessionChangesService);
    const layoutService = accessor.get(IAgentWorkbenchLayoutService);
    const sessionResource = (session ?? sessionsService.activeSession.get())?.resource;
    if (!sessionResource) {
      return;
    }
    layoutService.revealEditorPartExplicitly();
    await sessionChangesService.openChangesEditor(sessionResource, { changesetSelection: { kind: "id", id: void 0 } });
  }
};

registerAction2(ViewAllChangesAction);

var OpenChangedFileAction = class _OpenChangedFileAction extends Action2 {
  static {
    this.ID = "workbench.agentSessions.changes.openFile";
  }
  constructor() {
    super({
      id: _OpenChangedFileAction.ID,
      title: localize2(4258, "Open File"),
      icon: Codicon.goToFile,
      f1: false,
      menu: {
        id: MenuId.MultiDiffEditorFileToolbar,
        when: ActiveEditorContext.isEqualTo(SessionChangesEditor.ID),
        group: "navigation",
        order: 22
      }
    });
  }
  async run(accessor, ...args2) {
    const resource = args2[0];
    if (!(resource instanceof URI)) {
      return;
    }
    await accessor.get(IEditorService).openEditor({ resource });
  }
};

registerAction2(OpenChangedFileAction);

function getChangesDiffEditor(pane, resource) {
  const codeEditor = pane instanceof SessionChangesEditor || pane instanceof MultiDiffEditor ? pane.tryGetCodeEditor(resource) : void 0;
  return codeEditor?.diffEditor instanceof DiffEditorWidget ? codeEditor.diffEditor : void 0;
}

var ExpandFullFileAction = class _ExpandFullFileAction extends Action2 {
  static {
    this.ID = "workbench.agentSessions.changes.expandFullFile";
  }
  constructor() {
    super({
      id: _ExpandFullFileAction.ID,
      title: localize2(4255, "Expand Full File"),
      icon: Codicon.unfold,
      f1: false,
      menu: {
        id: MenuId.MultiDiffEditorFileToolbar,
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("resourceScheme", "changes-multi-diff-source"),
          EditorContextKeys.multiDiffEditorItemAllUnchangedRegionsShown.toNegated()
        ),
        group: "navigation",
        order: 21
      }
    });
  }
  async run(accessor, ...args2) {
    const resource = args2[0];
    if (!(resource instanceof URI)) {
      return;
    }
    getChangesDiffEditor(accessor.get(IEditorService).activeEditorPane, resource)?.showAllUnchangedRegions();
  }
};

registerAction2(ExpandFullFileAction);

var CollapseUnchangedRegionsAction = class _CollapseUnchangedRegionsAction extends Action2 {
  static {
    this.ID = "workbench.agentSessions.changes.collapseUnchangedRegions";
  }
  constructor() {
    super({
      id: _CollapseUnchangedRegionsAction.ID,
      title: localize2(4254, "Collapse Unchanged Regions"),
      icon: Codicon.fold,
      f1: false,
      menu: {
        id: MenuId.MultiDiffEditorFileToolbar,
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("resourceScheme", "changes-multi-diff-source"),
          EditorContextKeys.multiDiffEditorItemAllUnchangedRegionsShown
        ),
        group: "navigation",
        order: 21
      }
    });
  }
  async run(accessor, ...args2) {
    const resource = args2[0];
    if (!(resource instanceof URI)) {
      return;
    }
    getChangesDiffEditor(accessor.get(IEditorService).activeEditorPane, resource)?.collapseAllUnchangedRegions();
  }
};

registerAction2(CollapseUnchangedRegionsAction);

var ViewAllChangesActionViewItem = class extends ChatPillActionViewItem {
  constructor(action, options3, sessionContext, changesStatsCache) {
    super(void 0, action, options3);
    this._diffStatsObs = derivedOpts({ owner: this, equalsFn: structuralEquals }, (reader) => {
      const session = sessionContext.session.read(reader);
      const workspace = session?.workspace.read(reader);
      const branch = workspace?.folders[0]?.gitRepository?.branchName?.trim();
      const stats = session ? readSessionChangesStats(session, reader) ?? changesStatsCache.get(session.sessionId, reader) : void 0;
      return {
        branch,
        files: stats?.files ?? 0,
        insertions: stats?.insertions ?? 0,
        deletions: stats?.deletions ?? 0
      };
    });
    this._register(autorun((reader) => {
      this._diffStatsObs.read(reader);
      this.updateLabel();
      this.updateTooltip();
      this.updateAriaLabel();
    }));
  }
  getLabelText() {
    const { files } = this._diffStatsObs.get();
    return files === 1 ? localize(4256, null, files) : localize(4257, null, files);
  }
  getAdditionalLabelContent() {
    const { insertions, deletions } = this._diffStatsObs.get();
    return [
      $("span.chat-pill-added", void 0, `+${insertions}`),
      $("span.chat-pill-removed", void 0, `-${deletions}`)
    ];
  }
  getTooltip() {
    const { branch } = this._diffStatsObs.get();
    return branch ? localize(4261, null, branch) : localize(4260, null);
  }
  getAriaLabel() {
    const { files, insertions, deletions } = this._diffStatsObs.get();
    const filesLabel = files === 1 ? localize(4256, null, files) : localize(4257, null, files);
    return localize(4259, null, this.getTooltip(), filesLabel, insertions, deletions);
  }
};

ViewAllChangesActionViewItem = __decorateClass([
  __decorateParam(2, ISessionContext),
  __decorateParam(3, ISessionChangesStatsCache)
], ViewAllChangesActionViewItem);

var ViewAllChangesActionViewItemContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.viewAllChangesActionViewItem";
  }
  constructor(actionViewItemService) {
    super();
    const onDidRegister = this._register(new Emitter());
    this._register(actionViewItemService.register(Menus.SessionHeaderMeta, ViewAllChangesAction.ID, (action, options3, instantiationService) => {
      if (!(action instanceof MenuItemAction)) {
        return void 0;
      }
      return instantiationService.createInstance(ViewAllChangesActionViewItem, action, options3);
    }, onDidRegister.event));
    onDidRegister.fire();
  }
};

ViewAllChangesActionViewItemContribution = __decorateClass([
  __decorateParam(0, IActionViewItemService)
], ViewAllChangesActionViewItemContribution);

var SessionChangesStatsCacheContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.sessions.changesStatsCache";
  }
  constructor(sessionsService, changesStatsCache) {
    super();
    this._register(autorun((reader) => {
      for (const session of sessionsService.visibleSessions.read(reader)) {
        if (!session || session.worktreePending?.read(reader)) {
          continue;
        }
        const stats = readSessionChangesStats(session, reader);
        if (stats) {
          changesStatsCache.set(session.sessionId, stats);
        }
      }
    }));
  }
};

SessionChangesStatsCacheContribution = __decorateClass([
  __decorateParam(0, ISessionsService),
  __decorateParam(1, ISessionChangesStatsCache)
], SessionChangesStatsCacheContribution);

var ChangesMultiDiffSourceResolverContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.sessions.changesMultiDiffSourceResolver";
  }
  constructor(instantiationService) {
    super();
    this._register(instantiationService.createInstance(ChangesMultiDiffSourceResolver));
  }
};

ChangesMultiDiffSourceResolverContribution = __decorateClass([
  __decorateParam(0, IInstantiationService)
], ChangesMultiDiffSourceResolverContribution);

var ChangesetOperationsActionControllerContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.sessions.changesetOperationsActionController";
  }
  constructor(changesViewService, contextKeyService, logService) {
    super();
    const clientReviewedFilesObs = observableValue(this, void 0);
    const agentHostReviewedFilesObs = observableValue(this, []);
    this._register(autorun((reader) => {
      const changes = changesViewService.activeSessionChangesObs.read(reader);
      const reviewedFiles = changes.filter((change) => change.reviewed).map((change) => change.modifiedUri?.toString() ?? change.originalUri?.toString()).filter((uri4) => uri4 !== void 0);
      transaction((tx) => {
        clientReviewedFilesObs.set(void 0, tx);
        agentHostReviewedFilesObs.set(reviewedFiles, tx);
      });
    }));
    this._register(bindContextKey(SessionChangesReviewedFilesContext, contextKeyService, (reader) => {
      return clientReviewedFilesObs.read(reader) ?? agentHostReviewedFilesObs.read(reader);
    }));
    let lastPullRequestOperation;
    this._register(bindContextKey(SessionPrimaryPullRequestOperationContext, contextKeyService, (reader) => {
      const operations = changesViewService.activeSessionChangesetObs.read(reader)?.operations.read(reader) ?? [];
      const primary = operations.find((op) => AGENT_HOST_PULL_REQUEST_OPERATION_IDS.has(op.id))?.id ?? "";
      if (lastPullRequestOperation !== primary) {
        lastPullRequestOperation = primary;
        logService.info(`[ChangesetOperationsActionController] Primary pull request operation: ${primary || "none"}`);
      }
      return primary;
    }));
    this._register(bindContextKey(SessionHasOpenPullRequestContext, contextKeyService, (reader) => {
      return changesViewService.activeSessionStateObs.read(reader)?.hasOpenPullRequest === true;
    }));
    this._register(autorun((reader) => {
      const changeset = changesViewService.activeSessionChangesetObs.read(reader);
      const resourceOperations = (changeset?.operations.read(reader) ?? []).filter((op) => op.scopes.includes("resource" /* Resource */));
      if (resourceOperations.length === 0) {
        return;
      }
      for (const operation of resourceOperations) {
        reader.store.add(registerAction2(class extends Action2 {
          constructor() {
            super({
              id: `workbench.contrib.sessions.changesetOperation.${operation.id}`,
              title: operation.label,
              icon: operation.icon,
              f1: false,
              menu: [
                {
                  id: MenuId.AgentsChangeInlineToolbar,
                  group: "navigation",
                  order: 100
                },
                {
                  id: MenuId.MultiDiffEditorFileToolbar,
                  group: "navigation",
                  order: 100
                }
              ]
            });
          }
          async run(accessor, ...args2) {
            const resource = args2.length === 3 ? args2[2] : args2[0];
            if (!resource || !(resource instanceof URI)) {
              return;
            }
            await changeset?.invokeOperation(operation.id, {
              kind: "resource",
              resource
            });
          }
        }));
      }
    }));
  }
};

ChangesetOperationsActionControllerContribution = __decorateClass([
  __decorateParam(0, IChangesViewService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, ILogService)
], ChangesetOperationsActionControllerContribution);

registerWorkbenchContribution2(ChangesMultiDiffSourceResolverContribution.ID, ChangesMultiDiffSourceResolverContribution, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(ChangesetOperationsActionControllerContribution.ID, ChangesetOperationsActionControllerContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(ViewAllChangesActionViewItemContribution.ID, ViewAllChangesActionViewItemContribution, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(SessionChangesStatsCacheContribution.ID, SessionChangesStatsCacheContribution, WorkbenchPhase.AfterRestored);
export { getChangesDiffEditor, ViewAllChangesAction, OpenChangedFileAction, ExpandFullFileAction, CollapseUnchangedRegionsAction, ViewAllChangesActionViewItem, ViewAllChangesActionViewItemContribution, SessionChangesStatsCacheContribution, ChangesMultiDiffSourceResolverContribution, ChangesetOperationsActionControllerContribution };
