// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/editor/browser/editor.contribution.ts
import { CustomViewVisibleContext, EditorMaximizedContext, SinglePaneLayoutEnabledContext } from "./module-1770.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ActiveEditorContext, EditorPartModalContext, IsAuxiliaryWindowContext, IsSessionsWindowContext, IsTopRightEditorGroupContext, MainEditorAreaVisibleContext } from "./module-0950.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Action2, MenuId, MenuRegistry, isIMenuItem, registerAction2 } from "./module-0092.mjs";
import { NewBrowserTabAction, NewChangesTabAction, NewFileTabAction, NewSearchTabAction } from "./module-3770.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentWorkbenchLayoutService } from "./module-3474.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { IViewsService } from "./module-1246.mjs";
import { TERMINAL_VIEW_ID } from "./module-1174.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { MultiDiffEditorInput } from "./module-1149.mjs";
import { CHANGES_VIEW_ID } from "./module-3620.mjs";
import { prepareMoveCopyEditors } from "./module-1089.mjs";
import { IChangesViewService } from "./module-3645.mjs";
import { MOVE_MODAL_EDITOR_TO_MAIN_COMMAND_ID } from "./module-1530.mjs";
import { TEXT_FILE_EDITOR_ID } from "./module-1534.mjs";
import { SessionsCategories } from "./module-3532.mjs";
import { Menus } from "./module-3437.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsPartService } from "./module-1771.mjs";
import { resolveCommandsContext } from "./module-1529.mjs";
import { IListService } from "./module-0636.mjs";
import { EditorResourceAccessor } from "./module-0926.mjs";
import { Schemas } from "./module-0033.mjs";


// src/vs/sessions/contrib/editor/browser/editor.contribution.ts
var terminalPanelHiddenForMaximizedEditor = /* @__PURE__ */ new WeakSet();

var singlePaneDetailPanel2 = SinglePaneLayoutEnabledContext;

var notSinglePaneDetailPanel = singlePaneDetailPanel2.negate();

var editorTitleActionsWhen = ContextKeyExpr.and(
  IsSessionsWindowContext,
  IsAuxiliaryWindowContext.toNegated(),
  IsTopRightEditorGroupContext
);

var singlePaneLayoutMaximizeOrder = 10;

var singlePaneLayoutHideEditorOrder = 20;

var singlePaneMaximizeKeybindingWhen = ContextKeyExpr.and(
  IsSessionsWindowContext,
  IsAuxiliaryWindowContext.toNegated(),
  singlePaneDetailPanel2,
  MainEditorAreaVisibleContext
);

var SinglePaneAddTabContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.sessions.singlePaneAddTab";
  }
  constructor(layoutService) {
    super();
    if (!layoutService.isSinglePaneLayoutEnabled) {
      return;
    }
    this._register(registerAction2(NewFileTabAction));
    this._register(registerAction2(NewBrowserTabAction));
    this._register(registerAction2(NewSearchTabAction));
    this._register(registerAction2(NewChangesTabAction));
  }
};

SinglePaneAddTabContribution = __decorateClass([
  __decorateParam(0, IAgentWorkbenchLayoutService)
], SinglePaneAddTabContribution);

registerWorkbenchContribution2(SinglePaneAddTabContribution.ID, SinglePaneAddTabContribution, WorkbenchPhase.BlockStartup);

var MaximizeMainEditorPartAction = class _MaximizeMainEditorPartAction extends Action2 {
  static {
    this.ID = "workbench.action.agentSessions.maximizeMainEditorPart";
  }
  constructor() {
    super({
      id: _MaximizeMainEditorPartAction.ID,
      title: localize2(4764, "Maximize Editor Area"),
      icon: Codicon.screenFull,
      f1: false,
      keybinding: {
        weight: 250 /* SessionsContrib */,
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 35 /* KeyE */,
        when: ContextKeyExpr.and(singlePaneMaximizeKeybindingWhen, EditorMaximizedContext.negate())
      },
      menu: [
        {
          id: MenuId.EditorTitleLayout,
          group: "navigation",
          order: singlePaneLayoutMaximizeOrder,
          when: ContextKeyExpr.and(editorTitleActionsWhen, EditorMaximizedContext.negate(), singlePaneDetailPanel2, MainEditorAreaVisibleContext)
        },
        {
          id: MenuId.EditorTitleLayout,
          group: "navigation",
          order: 99,
          when: ContextKeyExpr.and(editorTitleActionsWhen, EditorMaximizedContext.negate(), notSinglePaneDetailPanel)
        }
      ]
    });
  }
  async run(accessor) {
    const layoutService = accessor.get(IAgentWorkbenchLayoutService);
    const viewsService = accessor.get(IViewsService);
    let hidTerminalPanel = false;
    if (layoutService.isVisible("workbench.parts.panel" /* PANEL_PART */) && viewsService.isViewVisible(TERMINAL_VIEW_ID)) {
      layoutService.setPartHidden(true, "workbench.parts.panel" /* PANEL_PART */);
      hidTerminalPanel = true;
    }
    if (hidTerminalPanel) {
      terminalPanelHiddenForMaximizedEditor.add(layoutService);
    } else {
      terminalPanelHiddenForMaximizedEditor.delete(layoutService);
    }
    layoutService.setEditorMaximized(true);
  }
};

registerAction2(MaximizeMainEditorPartAction);

var RestoreMainEditorPartAction = class _RestoreMainEditorPartAction extends Action2 {
  static {
    this.ID = "workbench.action.agentSessions.restoreMainEditorPart";
  }
  constructor() {
    super({
      id: _RestoreMainEditorPartAction.ID,
      title: localize2(4767, "Restore Editor Area"),
      icon: Codicon.screenNormal,
      f1: false,
      toggled: EditorMaximizedContext,
      keybinding: {
        weight: 250 /* SessionsContrib */,
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 35 /* KeyE */,
        when: ContextKeyExpr.and(singlePaneMaximizeKeybindingWhen, EditorMaximizedContext)
      },
      menu: [
        {
          id: MenuId.EditorTitleLayout,
          group: "navigation",
          order: singlePaneLayoutMaximizeOrder,
          when: ContextKeyExpr.and(editorTitleActionsWhen, EditorMaximizedContext, singlePaneDetailPanel2, MainEditorAreaVisibleContext)
        },
        {
          id: MenuId.EditorTitleLayout,
          group: "navigation",
          order: 99,
          when: ContextKeyExpr.and(editorTitleActionsWhen, EditorMaximizedContext, notSinglePaneDetailPanel)
        }
      ]
    });
  }
  async run(accessor) {
    const layoutService = accessor.get(IAgentWorkbenchLayoutService);
    const shouldRestoreTerminalPanel = terminalPanelHiddenForMaximizedEditor.has(layoutService);
    layoutService.setEditorMaximized(false);
    if (shouldRestoreTerminalPanel && !layoutService.isVisible("workbench.parts.panel" /* PANEL_PART */)) {
      layoutService.setPartHidden(false, "workbench.parts.panel" /* PANEL_PART */);
    }
    terminalPanelHiddenForMaximizedEditor.delete(layoutService);
  }
};

registerAction2(RestoreMainEditorPartAction);

var HideMainEditorPartAction = class _HideMainEditorPartAction extends Action2 {
  static {
    this.ID = "workbench.action.agentSessions.hideMainEditorPart";
  }
  constructor() {
    super({
      id: _HideMainEditorPartAction.ID,
      title: localize2(4763, "Hide Editor"),
      icon: Codicon.rightPanelHide,
      f1: false,
      menu: {
        id: MenuId.EditorTitleLayout,
        group: "navigation",
        order: singlePaneLayoutHideEditorOrder,
        when: ContextKeyExpr.false()
      }
    });
  }
  run(accessor) {
    const layoutService = accessor.get(IAgentWorkbenchLayoutService);
    layoutService.setPartHidden(false, "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */);
    layoutService.setPartHidden(true, "workbench.parts.editor" /* EDITOR_PART */);
    layoutService.setPartHidden(false, "workbench.parts.sidebar" /* SIDEBAR_PART */);
  }
};

registerAction2(HideMainEditorPartAction);

var ShowMainEditorPartAction = class _ShowMainEditorPartAction extends Action2 {
  static {
    this.ID = "workbench.action.agentSessions.showMainEditorPart";
  }
  constructor() {
    super({
      id: _ShowMainEditorPartAction.ID,
      title: localize2(4768, "Show Editor"),
      icon: Codicon.rightPanelShow,
      f1: false,
      menu: {
        id: MenuId.EditorTitleLayout,
        group: "navigation",
        order: singlePaneLayoutHideEditorOrder,
        when: ContextKeyExpr.false()
      }
    });
  }
  run(accessor) {
    const layoutService = accessor.get(IAgentWorkbenchLayoutService);
    const editorGroupsService = accessor.get(IEditorGroupsService);
    layoutService.revealEditorPartExplicitly();
    editorGroupsService.activeGroup.focus();
  }
};

registerAction2(ShowMainEditorPartAction);

var CloseMainEditorPartAction = class _CloseMainEditorPartAction extends Action2 {
  static {
    this.ID = "workbench.action.agentSessions.closeMainEditorPart";
  }
  constructor() {
    super({
      id: _CloseMainEditorPartAction.ID,
      title: localize2(4762, "Close Editor Area"),
      icon: Codicon.close,
      f1: false,
      menu: {
        id: MenuId.EditorTitleLayout,
        group: "navigation",
        order: 100,
        when: ContextKeyExpr.and(
          IsSessionsWindowContext,
          IsAuxiliaryWindowContext.toNegated(),
          IsTopRightEditorGroupContext,
          notSinglePaneDetailPanel
        )
      }
    });
  }
  async run(accessor) {
    const commandService = accessor.get(ICommandService);
    await commandService.executeCommand("workbench.action.closeAllGroups");
  }
};

registerAction2(CloseMainEditorPartAction);

var OpenEditorInModalEditorAction = class _OpenEditorInModalEditorAction extends Action2 {
  static {
    this.ID = "workbench.action.agentSessions.openEditorInModal";
  }
  constructor() {
    super({
      id: _OpenEditorInModalEditorAction.ID,
      title: localize2(4765, "Open in Modal Editor"),
      icon: Codicon.openInWindow,
      f1: false,
      menu: {
        id: MenuId.EditorTitleLayout,
        group: "navigation",
        order: 1,
        when: ContextKeyExpr.and(
          IsSessionsWindowContext,
          IsAuxiliaryWindowContext.toNegated(),
          notSinglePaneDetailPanel
        )
      }
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const layoutService = accessor.get(IAgentWorkbenchLayoutService);
    const configurationService = accessor.get(IConfigurationService);
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const isMaximized = layoutService.isEditorMaximized();
    await configurationService.updateValue("workbench.editor.useModal", "all");
    const activeGroup = editorGroupsService.mainPart.activeGroup;
    const multiFileDiffEditor = activeGroup.editors.find((editor) => editor instanceof MultiDiffEditorInput);
    if (multiFileDiffEditor) {
      const view = viewsService.getViewWithId(CHANGES_VIEW_ID);
      await view?.openChanges();
      await activeGroup.closeEditor(multiFileDiffEditor);
    }
    const modalPart = await editorGroupsService.createModalEditorPart();
    const editorsToMove = prepareMoveCopyEditors(activeGroup, activeGroup.editors.slice(), true);
    activeGroup.moveEditors(editorsToMove, modalPart.activeGroup);
    if (isMaximized && !modalPart.maximized) {
      modalPart.toggleMaximized();
    }
    modalPart.activeGroup.focus();
  }
};

registerAction2(OpenEditorInModalEditorAction);

var OpenModalEditorInEditorAction = class _OpenModalEditorInEditorAction extends Action2 {
  static {
    this.ID = "workbench.action.agentSessions.openModalEditorInEditor";
  }
  constructor() {
    super({
      id: _OpenModalEditorInEditorAction.ID,
      title: localize2(4766, "Open in Editor Area"),
      icon: Codicon.openInWindow,
      f1: false,
      // The editor area is not rendered while a custom view replaces the sessions grid.
      precondition: CustomViewVisibleContext.negate(),
      menu: {
        id: MenuId.ModalEditorTitle,
        group: "navigation",
        order: 98,
        when: ContextKeyExpr.and(
          IsSessionsWindowContext,
          EditorPartModalContext
        )
      }
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const commandService = accessor.get(ICommandService);
    const configurationService = accessor.get(IConfigurationService);
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const layoutService = accessor.get(IAgentWorkbenchLayoutService);
    const changesViewService = accessor.get(IChangesViewService);
    const activeEditorPart = editorGroupsService.activeModalEditorPart;
    const activeGroup = activeEditorPart?.activeGroup;
    if (!activeEditorPart || !activeGroup) {
      return;
    }
    const isMaximized = activeEditorPart.maximized;
    await configurationService.updateValue("workbench.editor.useModal", "some");
    layoutService.setPartHidden(false, "workbench.parts.editor" /* EDITOR_PART */);
    const navigation = activeGroup.activeEditorPane?.options?.modal?.navigation;
    if (navigation) {
      const view = viewsService.getViewWithId(CHANGES_VIEW_ID);
      const changes = changesViewService.activeSessionChangesObs.get();
      if (changes && navigation.current < changes.length) {
        await view?.openChanges(changes[navigation.current].modifiedUri ?? changes[navigation.current].originalUri);
        await activeGroup.closeEditor(activeGroup.editors[0]);
      }
    }
    await commandService.executeCommand(MOVE_MODAL_EDITOR_TO_MAIN_COMMAND_ID);
    if (isMaximized) {
      layoutService.setEditorMaximized(true);
    }
    editorGroupsService.activeGroup.focus();
  }
};

registerAction2(OpenModalEditorInEditorAction);

var AddFileAsContextAction = class _AddFileAsContextAction extends Action2 {
  static {
    this.ID = "workbench.action.agentSessions.addFileAsContext";
  }
  constructor() {
    const precondition2 = ContextKeyExpr.and(
      IsSessionsWindowContext,
      IsAuxiliaryWindowContext.toNegated(),
      ActiveEditorContext.isEqualTo(TEXT_FILE_EDITOR_ID)
    );
    super({
      id: _AddFileAsContextAction.ID,
      title: localize2(4761, "Add File as Context"),
      category: SessionsCategories.Sessions,
      icon: Codicon.attach,
      f1: true,
      precondition: precondition2,
      menu: [{
        id: Menus.SessionsEditorTitle,
        group: "navigation",
        order: 1e5,
        when: ContextKeyExpr.and(precondition2, singlePaneDetailPanel2)
      }, {
        id: MenuId.EditorTitle,
        group: "navigation",
        order: 1e5,
        // towards the far right, mirroring Split Editor Right in the regular window
        when: ContextKeyExpr.and(precondition2, notSinglePaneDetailPanel)
      }]
    });
  }
  run(accessor, ...args2) {
    const editorService = accessor.get(IEditorService);
    const sessionsService = accessor.get(ISessionsService);
    const sessionsPartService = accessor.get(ISessionsPartService);
    const resolvedContext = resolveCommandsContext(args2, editorService, accessor.get(IEditorGroupsService), accessor.get(IListService));
    const resources = resolvedContext.groupedEditors.flatMap((groupedEditor) => groupedEditor.editors).map((editor) => EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: 1 /* PRIMARY */ })).filter((uri4) => uri4 !== void 0 && [Schemas.file, Schemas.vscodeRemote, Schemas.untitled].includes(uri4.scheme));
    if (resources.length === 0) {
      return;
    }
    const sessionId = sessionsService.activeSession.get()?.sessionId;
    sessionsPartService.getSessionView(sessionId)?.attach(resources);
  }
};

registerAction2(AddFileAsContextAction);

var EditorTitleMenuBridgeContribution = class extends Disposable {
  constructor(layoutService) {
    super();
    this._mirrored = this._register(new DisposableStore());
    if (!layoutService.isSinglePaneLayoutEnabled) {
      return;
    }
    this._sync();
    this._register(MenuRegistry.onDidChangeMenu((e4) => {
      if (e4.has(MenuId.EditorTitle)) {
        this._sync();
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.sessions.editorTitleMenuBridge";
  }
  static {
    // Extension submenus are registered with a `MenuId.for('api:<id>')` id (see the
    // `submenus` extension point), which distinguishes them from core submenus.
    this._extensionSubmenuPrefix = "api:";
  }
  _sync() {
    this._mirrored.clear();
    for (const item of MenuRegistry.getMenuItems(MenuId.EditorTitle)) {
      const isExtensionItem = isIMenuItem(item) ? !!item.command.source : item.submenu.id.startsWith(EditorTitleMenuBridgeContribution._extensionSubmenuPrefix);
      if (isExtensionItem) {
        this._mirrored.add(MenuRegistry.appendMenuItem(Menus.SessionsEditorTitle, item));
      }
    }
  }
};

EditorTitleMenuBridgeContribution = __decorateClass([
  __decorateParam(0, IAgentWorkbenchLayoutService)
], EditorTitleMenuBridgeContribution);

registerWorkbenchContribution2(EditorTitleMenuBridgeContribution.ID, EditorTitleMenuBridgeContribution, WorkbenchPhase.BlockStartup);
export { terminalPanelHiddenForMaximizedEditor, singlePaneDetailPanel2, notSinglePaneDetailPanel, editorTitleActionsWhen, singlePaneLayoutMaximizeOrder, singlePaneLayoutHideEditorOrder, singlePaneMaximizeKeybindingWhen, SinglePaneAddTabContribution, MaximizeMainEditorPartAction, RestoreMainEditorPartAction, HideMainEditorPartAction, ShowMainEditorPartAction, CloseMainEditorPartAction, OpenEditorInModalEditorAction, OpenModalEditorInEditorAction, AddFileAsContextAction, EditorTitleMenuBridgeContribution };
