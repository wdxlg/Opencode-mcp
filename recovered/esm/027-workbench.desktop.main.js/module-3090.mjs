// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/browser/explorerViewlet.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { mark } from "./module-0506.mjs";
import { OpenEditorsView } from "./module-2025.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { KeyChord } from "./module-0019.mjs";
import { EmptyView } from "./module-3089.mjs";
import { ExplorerViewletVisibleContext, VIEWLET_ID5, VIEW_ID2 } from "./module-1542.mjs";
import { ExplorerView } from "./module-2152.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IProgressService } from "./module-0446.mjs";
import { ViewPaneContainer } from "./module-1382.mjs";
import { isMouseEvent } from "./module-0075.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { Extensions13, IViewDescriptorService } from "./module-1093.mjs";
import { ILogService } from "./module-0095.mjs";
import { Registry } from "./module-0090.mjs";
import { AddRootFolderAction, OpenFolderAction, OpenFolderViaWorkspaceAction } from "./module-1522.mjs";
import { OpenRecentAction } from "./module-1520.mjs";
import { OpenFolderWorkspaceSupportContext, RemoteNameContext, WorkbenchStateContext } from "./module-0949.mjs";
import { IsWebContext } from "./module-0635.mjs";


// src/vs/workbench/contrib/files/browser/explorerViewlet.ts
var explorerViewIcon = registerIcon("explorer-view-icon", Codicon.files, localize(15702, null));

var openEditorsViewIcon = registerIcon("open-editors-view-icon", Codicon.book, localize(15709, null));

var ExplorerViewletViewsContribution = class extends Disposable {
  constructor(workspaceContextService, progressService) {
    super();
    this.workspaceContextService = workspaceContextService;
    progressService.withProgress({ location: 1 /* Explorer */ }, () => workspaceContextService.getCompleteWorkspace()).finally(() => {
      this.registerViews();
      this._register(workspaceContextService.onDidChangeWorkbenchState(() => this.registerViews()));
      this._register(workspaceContextService.onDidChangeWorkspaceFolders(() => this.registerViews()));
    });
  }
  static {
    this.ID = "workbench.contrib.explorerViewletViews";
  }
  registerViews() {
    mark("code/willRegisterExplorerViews");
    const viewDescriptors = viewsRegistry4.getViews(VIEW_CONTAINER2);
    const viewDescriptorsToRegister = [];
    const viewDescriptorsToDeregister = [];
    const openEditorsViewDescriptor = this.createOpenEditorsViewDescriptor();
    if (!viewDescriptors.some((v2) => v2.id === openEditorsViewDescriptor.id)) {
      viewDescriptorsToRegister.push(openEditorsViewDescriptor);
    }
    const explorerViewDescriptor = this.createExplorerViewDescriptor();
    const registeredExplorerViewDescriptor = viewDescriptors.find((v2) => v2.id === explorerViewDescriptor.id);
    const emptyViewDescriptor = this.createEmptyViewDescriptor();
    const registeredEmptyViewDescriptor = viewDescriptors.find((v2) => v2.id === emptyViewDescriptor.id);
    if (this.workspaceContextService.getWorkbenchState() === 1 /* EMPTY */ || this.workspaceContextService.getWorkspace().folders.length === 0) {
      if (registeredExplorerViewDescriptor) {
        viewDescriptorsToDeregister.push(registeredExplorerViewDescriptor);
      }
      if (!registeredEmptyViewDescriptor) {
        viewDescriptorsToRegister.push(emptyViewDescriptor);
      }
    } else {
      if (registeredEmptyViewDescriptor) {
        viewDescriptorsToDeregister.push(registeredEmptyViewDescriptor);
      }
      if (!registeredExplorerViewDescriptor) {
        viewDescriptorsToRegister.push(explorerViewDescriptor);
      }
    }
    if (viewDescriptorsToDeregister.length) {
      viewsRegistry4.deregisterViews(viewDescriptorsToDeregister, VIEW_CONTAINER2);
    }
    if (viewDescriptorsToRegister.length) {
      viewsRegistry4.registerViews(viewDescriptorsToRegister, VIEW_CONTAINER2);
    }
    mark("code/didRegisterExplorerViews");
  }
  createOpenEditorsViewDescriptor() {
    return {
      id: OpenEditorsView.ID,
      name: OpenEditorsView.NAME,
      ctorDescriptor: new SyncDescriptor(OpenEditorsView),
      containerIcon: openEditorsViewIcon,
      order: 0,
      canToggleVisibility: true,
      canMoveView: true,
      collapsed: false,
      hideByDefault: true,
      focusCommand: {
        id: "workbench.files.action.focusOpenEditorsView",
        keybindings: { primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 35 /* KeyE */) }
      }
    };
  }
  createEmptyViewDescriptor() {
    return {
      id: EmptyView.ID,
      name: EmptyView.NAME,
      containerIcon: explorerViewIcon,
      ctorDescriptor: new SyncDescriptor(EmptyView),
      order: 1,
      canToggleVisibility: true,
      focusCommand: {
        id: "workbench.explorer.fileView.focus"
      }
    };
  }
  createExplorerViewDescriptor() {
    return {
      id: VIEW_ID2,
      name: localize2(15703, "Folders"),
      containerIcon: explorerViewIcon,
      ctorDescriptor: new SyncDescriptor(ExplorerView),
      order: 1,
      canMoveView: true,
      canToggleVisibility: false,
      focusCommand: {
        id: "workbench.explorer.fileView.focus"
      }
    };
  }
};

ExplorerViewletViewsContribution = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IProgressService)
], ExplorerViewletViewsContribution);

var ExplorerViewPaneContainer = class extends ViewPaneContainer {
  constructor(layoutService, telemetryService, contextService, storageService, configurationService, instantiationService, contextKeyService, themeService, contextMenuService, extensionService, viewDescriptorService, logService) {
    super(VIEWLET_ID5, { mergeViewWithContainerWhenSingleView: true }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService, logService);
    this.viewletVisibleContextKey = ExplorerViewletVisibleContext.bindTo(contextKeyService);
    this._register(this.contextService.onDidChangeWorkspaceName((e) => this.updateTitleArea()));
  }
  create(parent) {
    super.create(parent);
    parent.classList.add("explorer-viewlet");
  }
  createView(viewDescriptor4, options3) {
    if (viewDescriptor4.id === VIEW_ID2) {
      return this.instantiationService.createInstance(ExplorerView, {
        ...options3,
        delegate: {
          willOpenElement: (e) => {
            if (!isMouseEvent(e)) {
              return;
            }
            const openEditorsView = this.getOpenEditorsView();
            if (openEditorsView) {
              let delay = 0;
              const config = this.configurationService.getValue();
              if (config.workbench?.editor?.enablePreview) {
                delay = 250;
              }
              openEditorsView.setStructuralRefreshDelay(delay);
            }
          },
          didOpenElement: (e) => {
            if (!isMouseEvent(e)) {
              return;
            }
            const openEditorsView = this.getOpenEditorsView();
            openEditorsView?.setStructuralRefreshDelay(0);
          }
        }
      });
    }
    return super.createView(viewDescriptor4, options3);
  }
  getExplorerView() {
    return this.getView(VIEW_ID2);
  }
  getOpenEditorsView() {
    return this.getView(OpenEditorsView.ID);
  }
  setVisible(visible) {
    this.viewletVisibleContextKey.set(visible);
    super.setVisible(visible);
  }
  focus() {
    const explorerView = this.getView(VIEW_ID2);
    if (explorerView && this.panes.every((p) => !p.isExpanded())) {
      explorerView.setExpanded(true);
    }
    if (explorerView?.isExpanded()) {
      explorerView.focus();
    } else {
      super.focus();
    }
  }
};

ExplorerViewPaneContainer = __decorateClass([
  __decorateParam(0, IWorkbenchLayoutService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IContextMenuService),
  __decorateParam(9, IExtensionService),
  __decorateParam(10, IViewDescriptorService),
  __decorateParam(11, ILogService)
], ExplorerViewPaneContainer);

var viewContainerRegistry = Registry.as(Extensions13.ViewContainersRegistry);

var VIEW_CONTAINER2 = viewContainerRegistry.registerViewContainer({
  id: VIEWLET_ID5,
  title: localize2(15701, "Explorer"),
  ctorDescriptor: new SyncDescriptor(ExplorerViewPaneContainer),
  storageId: "workbench.explorer.views.state",
  icon: explorerViewIcon,
  alwaysUseContainerInfo: true,
  hideIfEmpty: true,
  order: 0,
  openCommandActionDescriptor: {
    id: VIEWLET_ID5,
    title: localize2(15701, "Explorer"),
    mnemonicTitle: localize(15704, null),
    keybindings: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 35 /* KeyE */ },
    order: 0
  }
}, 0 /* Sidebar */, { isDefault: true });

var openFolder2 = localize(15710, null);

var addAFolder = localize(15700, null);

var openRecent2 = localize(15711, null);

var addRootFolderButton = `[${openFolder2}](command:${AddRootFolderAction.ID})`;

var addAFolderButton = `[${addAFolder}](command:${AddRootFolderAction.ID})`;

var openFolderButton = `[${openFolder2}](command:${OpenFolderAction.ID})`;

var openFolderViaWorkspaceButton = `[${openFolder2}](command:${OpenFolderViaWorkspaceAction.ID})`;

var openRecentButton = `[${openRecent2}](command:${OpenRecentAction.ID})`;

var viewsRegistry4 = Registry.as(Extensions13.ViewsRegistry);

viewsRegistry4.registerViewWelcomeContent(EmptyView.ID, {
  content: localize(
    15708,
    null,
    addRootFolderButton
  ),
  when: ContextKeyExpr.and(
    // inside a .code-workspace
    WorkbenchStateContext.isEqualTo("workspace"),
    // unless we cannot enter or open workspaces (e.g. web serverless)
    OpenFolderWorkspaceSupportContext
  ),
  group: "2_open" /* Open */,
  order: 1
});

viewsRegistry4.registerViewWelcomeContent(EmptyView.ID, {
  content: localize(
    15707,
    null,
    openFolderViaWorkspaceButton,
    openRecentButton
  ),
  when: ContextKeyExpr.and(
    // inside a .code-workspace
    WorkbenchStateContext.isEqualTo("workspace"),
    // we cannot enter workspaces (e.g. web serverless)
    OpenFolderWorkspaceSupportContext.toNegated()
  ),
  group: "2_open" /* Open */,
  order: 1
});

viewsRegistry4.registerViewWelcomeContent(EmptyView.ID, {
  content: localize(
    15712,
    null,
    openFolderButton
  ),
  when: ContextKeyExpr.and(
    // not inside a .code-workspace
    WorkbenchStateContext.notEqualsTo("workspace"),
    // connected to a remote
    RemoteNameContext.notEqualsTo(""),
    // but not in web
    IsWebContext.toNegated()
  ),
  group: "2_open" /* Open */,
  order: 1
});

viewsRegistry4.registerViewWelcomeContent(EmptyView.ID, {
  content: localize(
    15705,
    null,
    openFolderButton,
    addAFolderButton
  ),
  when: ContextKeyExpr.and(
    // editors are opened
    ContextKeyExpr.has("editorIsOpen"),
    ContextKeyExpr.or(
      // not inside a .code-workspace and local
      ContextKeyExpr.and(WorkbenchStateContext.notEqualsTo("workspace"), RemoteNameContext.isEqualTo("")),
      // not inside a .code-workspace and web
      ContextKeyExpr.and(WorkbenchStateContext.notEqualsTo("workspace"), IsWebContext)
    )
  ),
  group: "2_open" /* Open */,
  order: 1
});

viewsRegistry4.registerViewWelcomeContent(EmptyView.ID, {
  content: localize(
    15706,
    null,
    openFolderButton
  ),
  when: ContextKeyExpr.and(
    // no editor is open
    ContextKeyExpr.has("editorIsOpen")?.negate(),
    ContextKeyExpr.or(
      // not inside a .code-workspace and local
      ContextKeyExpr.and(WorkbenchStateContext.notEqualsTo("workspace"), RemoteNameContext.isEqualTo("")),
      // not inside a .code-workspace and web
      ContextKeyExpr.and(WorkbenchStateContext.notEqualsTo("workspace"), IsWebContext)
    )
  ),
  group: "2_open" /* Open */,
  order: 1
});
export { explorerViewIcon, openEditorsViewIcon, ExplorerViewletViewsContribution, ExplorerViewPaneContainer, viewContainerRegistry, VIEW_CONTAINER2, openFolder2, addAFolder, openRecent2, addRootFolderButton, addAFolderButton, openFolderButton, openFolderViaWorkspaceButton, openRecentButton, viewsRegistry4 };
