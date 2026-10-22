// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/remote/browser/explorerViewItems.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { VIEWLET_ID5 } from "./module-1538.mjs";
import { getVirtualWorkspaceLocation } from "./module-0937.mjs";
import { IRemoteExplorerService, REMOTE_EXPLORER_TYPE_KEY } from "./module-1413.mjs";
import { isStringArray } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";


// src/vs/workbench/contrib/remote/browser/explorerViewItems.ts
var SELECTED_REMOTE_IN_EXPLORER = new RawContextKey("selectedRemoteInExplorer", "");

var SwitchRemoteViewItem = class extends Disposable {
  constructor(contextKeyService, remoteExplorerService, environmentService, storageService, workspaceContextService) {
    super();
    this.contextKeyService = contextKeyService;
    this.remoteExplorerService = remoteExplorerService;
    this.environmentService = environmentService;
    this.storageService = storageService;
    this.workspaceContextService = workspaceContextService;
    this.completedRemotes = this._register(new DisposableMap());
    this.selectedRemoteContext = SELECTED_REMOTE_IN_EXPLORER.bindTo(contextKeyService);
    this.switchRemoteMenu = MenuId.for("workbench.remote.menu.switchRemoteMenu");
    this._register(MenuRegistry.appendMenuItem(MenuId.ViewContainerTitle, {
      submenu: this.switchRemoteMenu,
      title: localize(18460, null),
      group: "navigation",
      when: ContextKeyExpr.equals("viewContainer", VIEWLET_ID5),
      order: 1,
      isSelection: true
    }));
    this._register(remoteExplorerService.onDidChangeTargetType((e4) => {
      this.select(e4);
    }));
  }
  setSelectionForConnection() {
    let isSetForConnection = false;
    if (this.completedRemotes.size > 0) {
      let authority;
      const remoteAuthority = this.environmentService.remoteAuthority;
      let virtualWorkspace;
      if (!remoteAuthority) {
        virtualWorkspace = getVirtualWorkspaceLocation(this.workspaceContextService.getWorkspace())?.scheme;
      }
      isSetForConnection = true;
      const explorerType = remoteAuthority ? [remoteAuthority.split("+")[0]] : virtualWorkspace ? [virtualWorkspace] : this.storageService.get(REMOTE_EXPLORER_TYPE_KEY, 1 /* WORKSPACE */)?.split(",") ?? this.storageService.get(REMOTE_EXPLORER_TYPE_KEY, 0 /* PROFILE */)?.split(",");
      if (explorerType !== void 0) {
        authority = this.getAuthorityForExplorerType(explorerType);
      }
      if (authority) {
        this.select(authority);
      }
    }
    return isSetForConnection;
  }
  select(authority) {
    this.selectedRemoteContext.set(authority[0]);
    this.remoteExplorerService.targetType = authority;
  }
  getAuthorityForExplorerType(explorerType) {
    let authority;
    for (const option2 of this.completedRemotes) {
      for (const authorityOption of option2[1].authority) {
        for (const explorerOption of explorerType) {
          if (authorityOption === explorerOption) {
            authority = option2[1].authority;
            break;
          } else if (option2[1].virtualWorkspace === explorerOption) {
            authority = option2[1].authority;
            break;
          }
        }
      }
    }
    return authority;
  }
  removeOptionItems(views) {
    for (const view of views) {
      if (view.group && view.group.startsWith("targets") && view.remoteAuthority && (!view.when || this.contextKeyService.contextMatchesRules(view.when))) {
        const authority = isStringArray(view.remoteAuthority) ? view.remoteAuthority : [view.remoteAuthority];
        this.completedRemotes.deleteAndDispose(authority[0]);
      }
    }
  }
  createOptionItems(views) {
    const startingCount = this.completedRemotes.size;
    for (const view of views) {
      if (view.group && view.group.startsWith("targets") && view.remoteAuthority && (!view.when || this.contextKeyService.contextMatchesRules(view.when))) {
        const text2 = view.name;
        const authority = isStringArray(view.remoteAuthority) ? view.remoteAuthority : [view.remoteAuthority];
        if (this.completedRemotes.has(authority[0])) {
          continue;
        }
        const thisCapture = this;
        const action = registerAction2(class extends Action2 {
          constructor() {
            super({
              id: `workbench.action.remoteExplorer.show.${authority[0]}`,
              title: text2,
              toggled: SELECTED_REMOTE_IN_EXPLORER.isEqualTo(authority[0]),
              menu: {
                id: thisCapture.switchRemoteMenu
              }
            });
          }
          async run() {
            thisCapture.select(authority);
          }
        });
        this.completedRemotes.set(authority[0], { text: text2.value, authority, virtualWorkspace: view.virtualWorkspace, dispose: () => action.dispose() });
      }
    }
    if (this.completedRemotes.size > startingCount) {
      this.setSelectionForConnection();
    }
  }
};

SwitchRemoteViewItem = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IRemoteExplorerService),
  __decorateParam(2, IWorkbenchEnvironmentService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IWorkspaceContextService)
], SwitchRemoteViewItem);
export { SELECTED_REMOTE_IN_EXPLORER, SwitchRemoteViewItem };
