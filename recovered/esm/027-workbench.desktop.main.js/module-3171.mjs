// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugViewlet.ts
import { ViewPaneContainer, ViewsSubMenu } from "./module-1382.mjs";
import { BREAKPOINTS_VIEW_ID, CONTEXT_DEBUGGERS_AVAILABLE, CONTEXT_DEBUG_STATE, CONTEXT_DEBUG_UX, CONTEXT_DEBUG_UX_KEY, EDITOR_CONTRIBUTION_ID, IDebugService, REPL_VIEW_ID, VIEWLET_ID3, getStateLabel } from "./module-1057.mjs";
import { DisposableStore, dispose } from "./module-0012.mjs";
import { WelcomeView } from "./module-3170.mjs";
import { DEBUG_CONFIGURE_COMMAND_ID, DEBUG_CONFIGURE_LABEL, DEBUG_START_COMMAND_ID, DEBUG_START_LABEL, DISCONNECT_ID, FOCUS_SESSION_ID, SELECT_AND_START_ID, STOP_ID } from "./module-2406.mjs";
import { FocusSessionActionViewItem, StartDebugActionViewItem } from "./module-3016.mjs";
import { createDisconnectMenuItemAction } from "./module-3160.mjs";
import { createActionViewItem } from "./module-0516.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IContextMenuService, IContextViewService } from "./module-0488.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { ILogService } from "./module-0095.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { WorkbenchStateContext } from "./module-0949.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { debugConfigure } from "./module-1891.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IViewsService } from "./module-1246.mjs";


// src/vs/workbench/contrib/debug/browser/debugViewlet.ts
var DebugViewPaneContainer = class extends ViewPaneContainer {
  constructor(layoutService, telemetryService, progressService, debugService, instantiationService, contextService, storageService, themeService, contextMenuService, extensionService, configurationService, contextViewService, contextKeyService, viewDescriptorService, logService) {
    super(VIEWLET_ID3, { mergeViewWithContainerWhenSingleView: true }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService, logService);
    this.progressService = progressService;
    this.debugService = debugService;
    this.contextViewService = contextViewService;
    this.contextKeyService = contextKeyService;
    this.paneListeners = /* @__PURE__ */ new Map();
    this.stopActionViewItemDisposables = this._register(new DisposableStore());
    this._register(this.debugService.onDidChangeState((state) => this.onDebugServiceStateChange(state)));
    this._register(this.contextKeyService.onDidChangeContext((e) => {
      if (e.affectsSome(/* @__PURE__ */ new Set([CONTEXT_DEBUG_UX_KEY, "inDebugMode"]))) {
        this.updateTitleArea();
      }
    }));
    this._register(this.contextService.onDidChangeWorkbenchState(() => this.updateTitleArea()));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("debug.toolBarLocation") || e.affectsConfiguration("debug.hideLauncherWhileDebugging")) {
        this.updateTitleArea();
      }
    }));
  }
  create(parent) {
    super.create(parent);
    parent.classList.add("debug-viewlet");
  }
  focus() {
    super.focus();
    if (this.startDebugActionViewItem) {
      this.startDebugActionViewItem.focus();
    } else {
      this.focusView(WelcomeView.ID);
    }
  }
  getActionViewItem(action, options3) {
    if (action.id === DEBUG_START_COMMAND_ID) {
      this.startDebugActionViewItem = this.instantiationService.createInstance(StartDebugActionViewItem, null, action, options3);
      return this.startDebugActionViewItem;
    }
    if (action.id === FOCUS_SESSION_ID) {
      return new FocusSessionActionViewItem(action, void 0, this.debugService, this.contextViewService, this.configurationService);
    }
    if (action.id === STOP_ID || action.id === DISCONNECT_ID) {
      this.stopActionViewItemDisposables.clear();
      const item = this.instantiationService.invokeFunction((accessor) => createDisconnectMenuItemAction(action, this.stopActionViewItemDisposables, accessor, { hoverDelegate: options3.hoverDelegate }));
      if (item) {
        return item;
      }
    }
    return createActionViewItem(this.instantiationService, action, options3);
  }
  focusView(id2) {
    const view = this.getView(id2);
    if (view) {
      view.focus();
    }
  }
  onDebugServiceStateChange(state) {
    if (this.progressResolve) {
      this.progressResolve();
      this.progressResolve = void 0;
    }
    if (state === 1 /* Initializing */) {
      this.progressService.withProgress({ location: VIEWLET_ID3 }, (_progress) => {
        return new Promise((resolve3) => this.progressResolve = resolve3);
      });
    }
  }
  addPanes(panes) {
    super.addPanes(panes);
    for (const { pane } of panes) {
      if (pane.id === BREAKPOINTS_VIEW_ID) {
        this.breakpointView = pane;
        this.updateBreakpointsMaxSize();
      } else {
        this.paneListeners.set(pane.id, pane.onDidChange(() => this.updateBreakpointsMaxSize()));
      }
    }
  }
  removePanes(panes) {
    super.removePanes(panes);
    for (const pane of panes) {
      dispose(this.paneListeners.get(pane.id));
      this.paneListeners.delete(pane.id);
    }
  }
  updateBreakpointsMaxSize() {
    if (this.breakpointView) {
      const allOtherCollapsed = this.panes.every((view) => !view.isExpanded() || view === this.breakpointView);
      this.breakpointView.maximumBodySize = allOtherCollapsed ? Number.POSITIVE_INFINITY : this.breakpointView.minimumBodySize;
    }
  }
};

DebugViewPaneContainer = __decorateClass([
  __decorateParam(0, IWorkbenchLayoutService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IProgressService),
  __decorateParam(3, IDebugService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IWorkspaceContextService),
  __decorateParam(6, IStorageService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IContextMenuService),
  __decorateParam(9, IExtensionService),
  __decorateParam(10, IConfigurationService),
  __decorateParam(11, IContextViewService),
  __decorateParam(12, IContextKeyService),
  __decorateParam(13, IViewDescriptorService),
  __decorateParam(14, ILogService)
], DebugViewPaneContainer);

MenuRegistry.appendMenuItem(MenuId.ViewContainerTitle, {
  when: ContextKeyExpr.and(
    ContextKeyExpr.equals("viewContainer", VIEWLET_ID3),
    CONTEXT_DEBUG_UX.notEqualsTo("simple"),
    WorkbenchStateContext.notEqualsTo("empty"),
    ContextKeyExpr.or(
      CONTEXT_DEBUG_STATE.isEqualTo("inactive"),
      ContextKeyExpr.notEquals("config.debug.toolBarLocation", "docked")
    ),
    ContextKeyExpr.or(
      ContextKeyExpr.not("config.debug.hideLauncherWhileDebugging"),
      ContextKeyExpr.not("inDebugMode")
    )
  ),
  order: 10,
  group: "navigation",
  command: {
    precondition: CONTEXT_DEBUG_STATE.notEqualsTo(getStateLabel(1 /* Initializing */)),
    id: DEBUG_START_COMMAND_ID,
    title: DEBUG_START_LABEL
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: DEBUG_CONFIGURE_COMMAND_ID,
      title: {
        value: DEBUG_CONFIGURE_LABEL,
        original: "Open 'launch.json'",
        mnemonicTitle: localize(14590, null)
      },
      metadata: {
        description: localize2(14591, "Opens the file used to configure how your program is debugged")
      },
      f1: true,
      icon: debugConfigure,
      precondition: CONTEXT_DEBUG_UX.notEqualsTo("simple"),
      menu: [{
        id: MenuId.ViewContainerTitle,
        group: "navigation",
        order: 20,
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("viewContainer", VIEWLET_ID3),
          CONTEXT_DEBUG_UX.notEqualsTo("simple"),
          WorkbenchStateContext.notEqualsTo("empty"),
          ContextKeyExpr.or(CONTEXT_DEBUG_STATE.isEqualTo("inactive"), ContextKeyExpr.notEquals("config.debug.toolBarLocation", "docked"))
        )
      }, {
        id: MenuId.ViewContainerTitle,
        order: 20,
        // Show in debug viewlet secondary actions when debugging and debug toolbar is docked
        when: ContextKeyExpr.and(ContextKeyExpr.equals("viewContainer", VIEWLET_ID3), CONTEXT_DEBUG_STATE.notEqualsTo("inactive"), ContextKeyExpr.equals("config.debug.toolBarLocation", "docked"))
      }, {
        id: MenuId.MenubarDebugMenu,
        group: "2_configuration",
        order: 1,
        when: CONTEXT_DEBUGGERS_AVAILABLE
      }]
    });
  }
  async run(accessor, opts) {
    const debugService = accessor.get(IDebugService);
    const quickInputService = accessor.get(IQuickInputService);
    const configurationManager = debugService.getConfigurationManager();
    let launch;
    if (configurationManager.selectedConfiguration.name) {
      launch = configurationManager.selectedConfiguration.launch;
    } else {
      const launches = configurationManager.getLaunches().filter((l) => !l.hidden);
      if (launches.length === 1) {
        launch = launches[0];
      } else {
        const picks = launches.map((l) => ({ label: l.name, launch: l }));
        const picked = await quickInputService.pick(picks, {
          activeItem: picks[0],
          placeHolder: localize(14592, null)
        });
        if (picked) {
          launch = picked.launch;
        }
      }
    }
    if (launch) {
      const { editor } = await launch.openConfigFile({ preserveFocus: false });
      if (editor && opts?.addNew) {
        const codeEditor = editor.getControl();
        if (codeEditor) {
          await codeEditor.getContribution(EDITOR_CONTRIBUTION_ID)?.addLaunchConfiguration();
        }
      }
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "debug.toggleReplIgnoreFocus",
      title: localize(14589, null),
      toggled: ContextKeyExpr.has(`view.${REPL_VIEW_ID}.visible`),
      menu: [{
        id: ViewsSubMenu,
        group: "3_toggleRepl",
        order: 30,
        when: ContextKeyExpr.and(ContextKeyExpr.equals("viewContainer", VIEWLET_ID3))
      }]
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    if (viewsService.isViewVisible(REPL_VIEW_ID)) {
      viewsService.closeView(REPL_VIEW_ID);
    } else {
      await viewsService.openView(REPL_VIEW_ID);
    }
  }
});

MenuRegistry.appendMenuItem(MenuId.ViewContainerTitle, {
  when: ContextKeyExpr.and(
    ContextKeyExpr.equals("viewContainer", VIEWLET_ID3),
    CONTEXT_DEBUG_STATE.notEqualsTo("inactive"),
    ContextKeyExpr.or(
      ContextKeyExpr.equals("config.debug.toolBarLocation", "docked"),
      ContextKeyExpr.has("config.debug.hideLauncherWhileDebugging")
    )
  ),
  order: 10,
  command: {
    id: SELECT_AND_START_ID,
    title: localize(14593, null)
  }
});
export { DebugViewPaneContainer };
