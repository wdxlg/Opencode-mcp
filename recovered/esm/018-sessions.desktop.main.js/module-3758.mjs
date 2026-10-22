// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/applyCommitsToParentRepo/browser/applyChangesToParentRepo.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { IsSessionsWindowContext } from "./module-0950.mjs";
import { ICommandService } from "./module-0087.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { ILogService } from "./module-0095.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IProductService } from "./module-0875.mjs";
import { toAction } from "./module-0082.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { SessionIsArchivedContext } from "./module-1770.mjs";


// src/vs/sessions/contrib/applyCommitsToParentRepo/browser/applyChangesToParentRepo.ts
var hasWorktreeAndRepositoryContextKey = new RawContextKey("agentSessionHasWorktreeAndRepository", false, {
  type: "boolean",
  description: localize(4112, null)
});

var ApplyChangesToParentRepoContribution = class extends Disposable {
  static {
    this.ID = "sessions.contrib.applyChangesToParentRepo";
  }
  constructor(contextKeyService, sessionsService) {
    super();
    const worktreeAndRepoKey = hasWorktreeAndRepositoryContextKey.bindTo(contextKeyService);
    this._register(autorun((reader) => {
      const activeSession = sessionsService.activeSession.read(reader);
      const folder = activeSession?.workspace.read(reader)?.folders[0];
      const hasWorktreeAndRepo = !!folder?.gitRepository?.workTreeUri;
      worktreeAndRepoKey.set(hasWorktreeAndRepo);
    }));
  }
};

ApplyChangesToParentRepoContribution = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ISessionsService)
], ApplyChangesToParentRepoContribution);

var ApplyChangesToParentRepoAction = class _ApplyChangesToParentRepoAction extends Action2 {
  static {
    this.ID = "chatEditing.applyChangesToParentRepo";
  }
  constructor() {
    super({
      id: _ApplyChangesToParentRepoAction.ID,
      title: localize2(4118, "Apply Changes to Parent Repository"),
      icon: Codicon.desktopDownload,
      category: CHAT_CATEGORY,
      precondition: ContextKeyExpr.and(
        IsSessionsWindowContext,
        hasWorktreeAndRepositoryContextKey
      ),
      menu: [
        {
          id: MenuId.AgentsChangesPrimaryActionSubMenu,
          group: "navigation",
          order: 2,
          when: ContextKeyExpr.and(
            ContextKeyExpr.false(),
            IsSessionsWindowContext,
            hasWorktreeAndRepositoryContextKey
          )
        }
      ]
    });
  }
  async run(accessor) {
    const sessionsService = accessor.get(ISessionsService);
    const commandService = accessor.get(ICommandService);
    const notificationService = accessor.get(INotificationService);
    const logService = accessor.get(ILogService);
    const openerService = accessor.get(IOpenerService);
    const productService = accessor.get(IProductService);
    const activeSession = sessionsService.activeSession.get();
    const folder = activeSession?.workspace.get()?.folders[0];
    if (!activeSession || !folder?.gitRepository?.workTreeUri) {
      return;
    }
    const worktreeRoot = folder.gitRepository.workTreeUri;
    const repoRoot = folder.root;
    const openFolderAction = toAction({
      id: "applyChangesToParentRepo.openFolder",
      label: localize(4119, null),
      run: () => {
        const scheme = productService.quality === "stable" ? "vscode" : productService.quality === "exploration" ? "vscode-exploration" : "vscode-insiders";
        const params = new URLSearchParams();
        params.set("windowId", "_blank");
        params.set("session", activeSession.resource.toString());
        openerService.open(URI.from({
          scheme,
          authority: Schemas.file,
          path: repoRoot.path,
          query: params.toString()
        }), { openExternal: true });
      }
    });
    try {
      const worktreeBranch = await commandService.executeCommand(
        "_git.revParseAbbrevRef",
        worktreeRoot.fsPath
      );
      if (!worktreeBranch) {
        notificationService.notify({
          severity: Severity2.Warning,
          message: localize(4116, null)
        });
        return;
      }
      const result = await commandService.executeCommand("_git.mergeBranch", repoRoot.fsPath, worktreeBranch);
      if (!result) {
        logService.warn("[ApplyChangesToParentRepo] No result from merge command");
      } else {
        notificationService.notify({
          severity: Severity2.Info,
          message: typeof result === "string" && result.startsWith("Already up to date") ? localize(4113, null) : localize(4117, null),
          actions: { primary: [openFolderAction] }
        });
      }
    } catch (err) {
      logService.error("[ApplyChangesToParentRepo] Failed to apply changes", err);
      notificationService.notify({
        severity: Severity2.Warning,
        message: localize(4115, null),
        actions: { primary: [openFolderAction] }
      });
    }
  }
};

registerAction2(ApplyChangesToParentRepoAction);

registerWorkbenchContribution2(ApplyChangesToParentRepoContribution.ID, ApplyChangesToParentRepoContribution, WorkbenchPhase.AfterRestored);

MenuRegistry.appendMenuItem(MenuId.AgentsChangesToolbar, {
  submenu: MenuId.AgentsChangesPrimaryActionSubMenu,
  title: localize2(4114, "Apply Actions"),
  group: "navigation",
  order: 1,
  when: ContextKeyExpr.and(
    IsSessionsWindowContext,
    SessionIsArchivedContext.isEqualTo(false)
  )
});
export { hasWorktreeAndRepositoryContextKey, ApplyChangesToParentRepoContribution, ApplyChangesToParentRepoAction };
