// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editorTabsControl.ts
import { ActionRunner, toAction } from "./module-0082.mjs";
import { IThemeService, Themable } from "./module-0287.mjs";
import { LocalSelectionTransfer } from "./module-0273.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ActiveEditorAvailableEditorIdsContext, ActiveEditorCanSplitInGroupContext, ActiveEditorCannotCloseContext, ActiveEditorDirtyContext, ActiveEditorFirstInGroupContext, ActiveEditorGroupLockedContext, ActiveEditorLastInGroupContext, ActiveEditorPinnedContext, ActiveEditorStickyContext, ResourceContextKey, SideBySideEditorActiveContext, applyAvailableEditorIds } from "./module-0949.mjs";
import { $, getActiveWindow, getWindow, isMouseEvent, setVisibility } from "./module-0075.mjs";
import { createActionViewItem, getFlatActionBarActions } from "./module-0516.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { DropdownMenuActionViewItem } from "./module-0502.mjs";
import { WorkbenchToolBar } from "./module-0519.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { EDITOR_CORE_NAVIGATION_COMMANDS } from "./module-1538.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { EditorPane } from "./module-1089.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { prepareActions } from "./module-0477.mjs";
import { DraggedEditorGroupIdentifier, fillEditorsDragData, isWindowDraggedOver } from "./module-1381.mjs";
import { isFirefox2 } from "./module-0018.mjs";
import { DataTransfers } from "./module-0263.mjs";
import { applyDragImage } from "./module-0458.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { SideBySideEditorInput } from "./module-1095.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IEditorResolverService } from "./module-1113.mjs";
import { IHostService } from "./module-1117.mjs";


// src/vs/workbench/browser/parts/editor/editorTabsControl.ts
var EditorCommandsContextActionRunner = class extends ActionRunner {
  constructor(context2) {
    super();
    this.context = context2;
  }
  run(action, context2) {
    let mergedContext = this.context;
    if (context2?.preserveFocus) {
      mergedContext = {
        ...this.context,
        preserveFocus: true
      };
    }
    return super.run(action, mergedContext);
  }
};

var EditorTabsControl = class extends Themable {
  constructor(parent, editorPartsView, groupsView, groupView, tabsModel, menuIds, breadcrumbsInHeader, contextMenuService, instantiationService, contextKeyService, keybindingService, notificationService, quickInputService, themeService, editorResolverService, hostService, menuService) {
    super(themeService);
    this.parent = parent;
    this.editorPartsView = editorPartsView;
    this.groupsView = groupsView;
    this.groupView = groupView;
    this.tabsModel = tabsModel;
    this.menuIds = menuIds;
    this.breadcrumbsInHeader = breadcrumbsInHeader;
    this.contextMenuService = contextMenuService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.keybindingService = keybindingService;
    this.notificationService = notificationService;
    this.quickInputService = quickInputService;
    this.editorResolverService = editorResolverService;
    this.hostService = hostService;
    this.menuService = menuService;
    this.editorTransfer = LocalSelectionTransfer.getInstance();
    this.groupTransfer = LocalSelectionTransfer.getInstance();
    this.treeItemsTransfer = LocalSelectionTransfer.getInstance();
    this.editorActionsToolbarDisposables = this._register(new DisposableStore());
    this.editorActionsDisposables = this._register(new DisposableStore());
    /** Whether the editor-actions toolbar currently has any actions (drives the layout-actions separator). */
    this.editorActionsToolbarHasActions = false;
    this.editorLayoutActionsToolbarDisposables = this._register(new DisposableStore());
    this.editorLayoutActionsDisposables = this._register(new DisposableStore());
    this.renderDropdownAsChildElement = false;
    const container3 = this.create(parent);
    this.contextMenuContextKeyService = this._register(this.contextKeyService.createScoped(container3));
    const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection(
      [IContextKeyService, this.contextMenuContextKeyService]
    )));
    this.resourceContext = this._register(scopedInstantiationService.createInstance(ResourceContextKey));
    this.editorPinnedContext = ActiveEditorPinnedContext.bindTo(this.contextMenuContextKeyService);
    this.editorIsFirstContext = ActiveEditorFirstInGroupContext.bindTo(this.contextMenuContextKeyService);
    this.editorIsLastContext = ActiveEditorLastInGroupContext.bindTo(this.contextMenuContextKeyService);
    this.editorStickyContext = ActiveEditorStickyContext.bindTo(this.contextMenuContextKeyService);
    this.editorDirtyContext = ActiveEditorDirtyContext.bindTo(this.contextMenuContextKeyService);
    this.editorAvailableEditorIds = ActiveEditorAvailableEditorIdsContext.bindTo(this.contextMenuContextKeyService);
    this.editorCannotCloseContext = ActiveEditorCannotCloseContext.bindTo(this.contextMenuContextKeyService);
    this.editorCanSplitInGroupContext = ActiveEditorCanSplitInGroupContext.bindTo(this.contextMenuContextKeyService);
    this.sideBySideEditorContext = SideBySideEditorActiveContext.bindTo(this.contextMenuContextKeyService);
    this.groupLockedContext = ActiveEditorGroupLockedContext.bindTo(this.contextMenuContextKeyService);
  }
  static {
    this.EDITOR_TAB_HEIGHT = {
      normal: 35,
      compact: 22,
      // Modern UI multi-tab mode adds 4px top + 4px bottom padding to
      // the tabs-and-actions-container (tabs.css), so the total title-bar height is the
      // --editor-group-tab-height CSS value (24px / 20px) plus that 8px padding.
      modernUI: 32,
      // 24px tab  + 4px top + 4px bottom padding
      modernUICompact: 28
      // 20px tab  + 4px top + 4px bottom padding (20px = minimum to fit 16px icon + 2px padding)
    };
  }
  create(parent) {
    this.updateTabHeight();
    this.updateTabActionSpaceReservation();
    return parent;
  }
  get editorActionsEnabled() {
    return this.groupsView.partOptions.editorActionsLocation === "default" && this.groupsView.partOptions.showTabs !== "none";
  }
  createEditorActionsToolBar(parent, classes2) {
    this.editorActionsToolbarContainer = $("div");
    this.editorActionsToolbarContainer.classList.add(...classes2);
    parent.appendChild(this.editorActionsToolbarContainer);
    this.handleEditorActionToolBarVisibility(this.editorActionsToolbarContainer);
    this.editorLayoutActionsSeparator = $("div.editor-actions-separator");
    parent.appendChild(this.editorLayoutActionsSeparator);
    this.editorLayoutActionsToolbarContainer = $("div.editor-layout-actions");
    parent.appendChild(this.editorLayoutActionsToolbarContainer);
    this.handleEditorLayoutActionsToolBarVisibility(this.editorLayoutActionsToolbarContainer);
  }
  createAddTabControl(parent, menuId, before) {
    const container3 = $(".tabs-bar-add-tab");
    parent.insertBefore(container3, before ?? null);
    const menu = this._register(this.menuService.createMenu(menuId, this.contextKeyService));
    const getActions = () => getFlatActionBarActions(menu.getActions({ shouldForwardArgs: true }));
    const addTabAction = toAction({
      id: "editor.tabs.addTab",
      label: localize(6748, null),
      class: ThemeIcon.asClassName(Codicon.add),
      run: () => {
      }
    });
    const dropdown = this._register(new DropdownMenuActionViewItem(addTabAction, { getActions }, this.contextMenuService, {
      classNames: ThemeIcon.asClassNameArray(Codicon.add),
      keybindingProvider: (action) => this.getKeybinding(action)
    }));
    const toolbar = this._register(this.instantiationService.createInstance(WorkbenchToolBar, container3, {
      ariaLabel: localize(6749, null),
      actionViewItemProvider: (action) => action === addTabAction ? dropdown : void 0
    }));
    toolbar.setActions([addTabAction]);
    const updateVisibility = () => {
      container3.classList.toggle("hidden", getActions().length === 0);
    };
    updateVisibility();
    this._register(menu.onDidChange(updateVisibility));
    return container3;
  }
  updateEditorLayoutActionsSeparator() {
    const hasLayoutActions = (this.editorLayoutActionsToolbar?.getItemsLength() ?? 0) > 0;
    if (this.editorLayoutActionsSeparator) {
      setVisibility(hasLayoutActions && this.editorActionsToolbarHasActions, this.editorLayoutActionsSeparator);
    }
  }
  handleEditorActionToolBarVisibility(container3) {
    const editorActionsEnabled = this.editorActionsEnabled;
    const editorActionsVisible = !!this.editorActionsToolbar;
    if (editorActionsEnabled && !editorActionsVisible) {
      this.doCreateEditorActionsToolBar(container3);
    } else if (!editorActionsEnabled && editorActionsVisible) {
      this.editorActionsToolbar?.getElement().remove();
      this.editorActionsToolbar = void 0;
      this.editorActionsToolbarDisposables.clear();
      this.editorActionsDisposables.clear();
    }
    container3.classList.toggle("hidden", !editorActionsEnabled);
  }
  handleEditorLayoutActionsToolBarVisibility(container3) {
    const editorActionsEnabled = this.editorActionsEnabled;
    const editorActionsVisible = !!this.editorLayoutActionsToolbar;
    if (editorActionsEnabled && !editorActionsVisible) {
      this.doCreateEditorLayoutActionsToolBar(container3);
    } else if (!editorActionsEnabled && editorActionsVisible) {
      this.editorLayoutActionsToolbar?.getElement().remove();
      this.editorLayoutActionsToolbar = void 0;
      this.editorLayoutActionsToolbarDisposables.clear();
      this.editorLayoutActionsDisposables.clear();
    }
    container3.classList.toggle("hidden", !editorActionsEnabled);
    if (this.editorLayoutActionsSeparator && !editorActionsEnabled) {
      setVisibility(false, this.editorLayoutActionsSeparator);
    }
  }
  doCreateEditorActionsToolBar(container3) {
    const context2 = { groupId: this.groupView.id };
    const editorActionsMenuId = this.menuIds?.editorActions ?? MenuId.EditorTitle;
    this.editorActionsToolbar = this.editorActionsToolbarDisposables.add(this.instantiationService.createInstance(WorkbenchToolBar, container3, {
      actionViewItemProvider: (action, options3) => this.actionViewItemProvider(action, options3),
      orientation: 0 /* HORIZONTAL */,
      ariaLabel: localize(6750, null),
      getKeyBinding: (action) => this.getKeybinding(action),
      actionRunner: this.editorActionsToolbarDisposables.add(new EditorCommandsContextActionRunner(context2)),
      anchorAlignmentProvider: () => 1 /* RIGHT */,
      renderDropdownAsChildElement: this.renderDropdownAsChildElement,
      telemetrySource: "editorPart",
      resetMenu: editorActionsMenuId,
      overflowBehavior: { maxItems: 9, exempted: EDITOR_CORE_NAVIGATION_COMMANDS },
      highlightToggledItems: true
    }));
    this.editorActionsToolbar.context = context2;
    this.editorActionsToolbarDisposables.add(this.editorActionsToolbar.actionRunner.onDidRun((e) => {
      if (e.error && !isCancellationError(e.error)) {
        this.notificationService.error(e.error);
      }
    }));
  }
  doCreateEditorLayoutActionsToolBar(container3) {
    const context2 = { groupId: this.groupView.id };
    this.editorLayoutActionsToolbar = this.editorLayoutActionsToolbarDisposables.add(this.instantiationService.createInstance(WorkbenchToolBar, container3, {
      actionViewItemProvider: (action, options3) => this.actionViewItemProvider(action, options3),
      orientation: 0 /* HORIZONTAL */,
      ariaLabel: localize(6751, null),
      getKeyBinding: (action) => this.getKeybinding(action),
      actionRunner: this.editorLayoutActionsToolbarDisposables.add(new EditorCommandsContextActionRunner(context2)),
      anchorAlignmentProvider: () => 1 /* RIGHT */,
      renderDropdownAsChildElement: this.renderDropdownAsChildElement,
      telemetrySource: "editorPartTrailing",
      resetMenu: MenuId.EditorTitleLayout,
      hiddenItemStrategy: -1 /* NoHide */,
      highlightToggledItems: true
    }));
    this.editorLayoutActionsToolbar.context = context2;
    this.editorLayoutActionsToolbarDisposables.add(this.editorLayoutActionsToolbar.actionRunner.onDidRun((e) => {
      if (e.error && !isCancellationError(e.error)) {
        this.notificationService.error(e.error);
      }
    }));
  }
  actionViewItemProvider(action, options3) {
    const activeEditorPane = this.groupView.activeEditorPane;
    if (activeEditorPane instanceof EditorPane) {
      const result = activeEditorPane.getActionViewItem(action, options3);
      if (result) {
        return result;
      }
    }
    return createActionViewItem(this.instantiationService, action, { ...options3, menuAsChild: this.renderDropdownAsChildElement });
  }
  updateEditorActionsToolbar() {
    if (!this.editorActionsEnabled) {
      return;
    }
    this.editorActionsDisposables.clear();
    const editorActions = this.groupView.createEditorActions(this.editorActionsDisposables, this.menuIds?.editorActions ?? MenuId.EditorTitle);
    this.editorActionsDisposables.add(editorActions.onDidChange(() => this.updateEditorActionsToolbar()));
    const editorActionsToolbar = assertReturnsDefined(this.editorActionsToolbar);
    const { primary, secondary } = this.prepareEditorActions(editorActions.actions);
    editorActionsToolbar.setActions(prepareActions(primary), prepareActions(secondary));
    this.editorActionsToolbarHasActions = primary.length > 0 || secondary.length > 0;
    this.updateEditorLayoutActionsToolbar();
  }
  updateEditorLayoutActionsToolbar() {
    if (!this.editorActionsEnabled || !this.editorLayoutActionsToolbarContainer || !this.editorLayoutActionsToolbar) {
      return;
    }
    this.editorLayoutActionsDisposables.clear();
    const editorActions = this.groupView.createEditorActions(this.editorLayoutActionsDisposables, MenuId.EditorTitleLayout);
    this.editorLayoutActionsDisposables.add(editorActions.onDidChange(() => this.updateEditorLayoutActionsToolbar()));
    const { primary, secondary } = this.prepareEditorLayoutActions(editorActions.actions);
    this.editorLayoutActionsToolbar.setActions(prepareActions(primary), prepareActions(secondary));
    const hasLayoutActions = primary.length > 0 || secondary.length > 0;
    this.updateEditorLayoutActionsSeparator();
    setVisibility(hasLayoutActions, this.editorLayoutActionsToolbarContainer);
  }
  getEditorPaneAwareContextKeyService() {
    return this.groupView.activeEditorPane?.scopedContextKeyService ?? this.contextKeyService;
  }
  clearEditorActionsToolbar() {
    if (!this.editorActionsEnabled) {
      return;
    }
    const editorActionsToolbar = assertReturnsDefined(this.editorActionsToolbar);
    editorActionsToolbar.setActions([], []);
    this.editorActionsToolbarHasActions = false;
    this.editorLayoutActionsToolbar?.setActions([], []);
    if (this.editorLayoutActionsSeparator) {
      setVisibility(false, this.editorLayoutActionsSeparator);
    }
    if (this.editorLayoutActionsToolbarContainer) {
      setVisibility(false, this.editorLayoutActionsToolbarContainer);
    }
  }
  onGroupDragStart(e, element) {
    if (e.target !== element) {
      return false;
    }
    const isNewWindowOperation = this.isNewWindowOperation(e);
    this.groupTransfer.setData([new DraggedEditorGroupIdentifier(this.groupView.id)], DraggedEditorGroupIdentifier.prototype);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "copyMove";
    }
    let hasDataTransfer = false;
    if (this.groupsView.partOptions.showTabs === "multiple") {
      hasDataTransfer = this.doFillResourceDataTransfers(this.groupView.getEditors(1 /* SEQUENTIAL */), e, isNewWindowOperation);
    } else {
      if (this.groupView.activeEditor) {
        hasDataTransfer = this.doFillResourceDataTransfers([this.groupView.activeEditor], e, isNewWindowOperation);
      }
    }
    if (!hasDataTransfer && isFirefox2) {
      e.dataTransfer?.setData(DataTransfers.TEXT, String(this.groupView.label));
    }
    if (this.groupView.activeEditor) {
      let label3 = this.groupView.activeEditor.getName();
      if (this.groupsView.partOptions.showTabs === "multiple" && this.groupView.count > 1) {
        label3 = localize(6752, null, label3, this.groupView.count - 1);
      }
      applyDragImage(e, element, label3);
    }
    return isNewWindowOperation;
  }
  async onGroupDragEnd(e, previousDragEvent, element, isNewWindowOperation) {
    this.groupTransfer.clearData(DraggedEditorGroupIdentifier.prototype);
    if (e.target !== element || !isNewWindowOperation || isWindowDraggedOver()) {
      return;
    }
    const auxiliaryEditorPart = await this.maybeCreateAuxiliaryEditorPartAt(e, element);
    if (!auxiliaryEditorPart) {
      return;
    }
    const targetGroup = auxiliaryEditorPart.activeGroup;
    this.groupsView.mergeGroup(this.groupView, targetGroup.id, {
      mode: this.isMoveOperation(previousDragEvent ?? e, targetGroup.id) ? 1 /* MOVE_EDITORS */ : 0 /* COPY_EDITORS */
    });
    targetGroup.focus();
  }
  async maybeCreateAuxiliaryEditorPartAt(e, offsetElement) {
    const { point, display } = await this.hostService.getCursorScreenPoint() ?? { point: { x: e.screenX, y: e.screenY } };
    const window2 = getActiveWindow();
    if (window2.document.visibilityState === "visible" && window2.document.hasFocus()) {
      if (point.x >= window2.screenX && point.x <= window2.screenX + window2.outerWidth && point.y >= window2.screenY && point.y <= window2.screenY + window2.outerHeight) {
        return;
      }
    }
    const offsetX = offsetElement.offsetWidth / 2;
    const offsetY = 30 + offsetElement.offsetHeight / 2;
    const bounds = {
      x: point.x - offsetX,
      y: point.y - offsetY
    };
    if (display) {
      if (bounds.x < display.x) {
        bounds.x = display.x;
      }
      if (bounds.y < display.y) {
        bounds.y = display.y;
      }
    }
    return this.editorPartsView.createAuxiliaryEditorPart({ bounds });
  }
  isNewWindowOperation(e) {
    if (this.groupsView.partOptions.dragToOpenWindow) {
      return !e.altKey;
    }
    return e.altKey;
  }
  isMoveOperation(e, sourceGroup, sourceEditor) {
    if (sourceEditor?.hasCapability(8 /* Singleton */)) {
      return true;
    }
    const isCopy = e.ctrlKey && !isMacintosh || e.altKey && isMacintosh;
    return !isCopy || sourceGroup === this.groupView.id;
  }
  doFillResourceDataTransfers(editors, e, disableStandardTransfer) {
    if (editors.length) {
      this.instantiationService.invokeFunction(fillEditorsDragData, editors.map((editor) => ({ editor, groupId: this.groupView.id })), e, { disableStandardTransfer });
      return true;
    }
    return false;
  }
  onTabContextMenu(editor, e, node) {
    this.resourceContext.set(EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: 1 /* PRIMARY */ }));
    this.editorPinnedContext.set(this.tabsModel.isPinned(editor));
    this.editorIsFirstContext.set(this.tabsModel.isFirst(editor));
    this.editorIsLastContext.set(this.tabsModel.isLast(editor));
    this.editorStickyContext.set(this.tabsModel.isSticky(editor));
    this.editorDirtyContext.set(editor.isDirty() && !editor.isSaving());
    this.editorCannotCloseContext.set(editor.hasCapability(8192 /* CannotClose */));
    this.groupLockedContext.set(this.tabsModel.isLocked);
    this.editorCanSplitInGroupContext.set(editor.hasCapability(32 /* CanSplitInGroup */));
    this.sideBySideEditorContext.set(editor.typeId === SideBySideEditorInput.ID);
    applyAvailableEditorIds(this.editorAvailableEditorIds, editor, this.editorResolverService);
    let anchor = node;
    if (isMouseEvent(e)) {
      anchor = new StandardMouseEvent(getWindow(node), e);
    }
    this.contextMenuService.showContextMenu({
      getAnchor: () => anchor,
      menuId: MenuId.EditorTitleContext,
      menuActionOptions: { shouldForwardArgs: true, arg: this.resourceContext.get() },
      contextKeyService: this.contextMenuContextKeyService,
      getActionsContext: () => ({ groupId: this.groupView.id, editorIndex: this.groupView.getIndexOfEditor(editor) }),
      getKeyBinding: (action) => this.keybindingService.lookupKeybinding(action.id, this.contextMenuContextKeyService),
      onHide: () => this.groupsView.activeGroup.focus()
      // restore focus to active group
    });
  }
  getKeybinding(action) {
    return this.keybindingService.lookupKeybinding(action.id, this.getEditorPaneAwareContextKeyService());
  }
  getKeybindingLabel(action) {
    const keybinding = this.getKeybinding(action);
    return keybinding ? keybinding.getLabel() ?? void 0 : void 0;
  }
  get tabHeight() {
    const isCompact = this.groupsView.partOptions.tabHeight === "compact";
    if (this.parent.classList.contains("tabs") && this.parent.closest(".modern-ui-tabs")) {
      return isCompact ? EditorTabsControl.EDITOR_TAB_HEIGHT.modernUICompact : EditorTabsControl.EDITOR_TAB_HEIGHT.modernUI;
    }
    return isCompact ? EditorTabsControl.EDITOR_TAB_HEIGHT.compact : EditorTabsControl.EDITOR_TAB_HEIGHT.normal;
  }
  getHoverTitle(editor) {
    const title = editor.getTitle(2 /* LONG */);
    if (!this.tabsModel.isPinned(editor)) {
      return {
        markdown: new MarkdownString("", { supportThemeIcons: true, isTrusted: true }).appendText(title).appendMarkdown(' (_preview_ [$(gear)](command:workbench.action.openSettings?%5B%22workbench.editor.enablePreview%22%5D "Configure Preview Mode"))'),
        markdownNotSupportedFallback: title + " (preview)"
      };
    }
    return title;
  }
  updateTabHeight() {
    this.parent.style.setProperty("--editor-group-tab-height", `${this.tabHeight}px`);
    this.parent.classList.toggle("compact-height", this.groupsView.partOptions.tabHeight === "compact");
  }
  updateTabActionSpaceReservation() {
    this.parent.classList.toggle("tab-actions-reserve-space", this.groupsView.partOptions.tabActionReserveSpace);
  }
  updateOptions(oldOptions, newOptions) {
    if (oldOptions.tabHeight !== newOptions.tabHeight) {
      this.updateTabHeight();
    }
    if (oldOptions.tabActionReserveSpace !== newOptions.tabActionReserveSpace) {
      this.updateTabActionSpaceReservation();
    }
    if (oldOptions.editorActionsLocation !== newOptions.editorActionsLocation || oldOptions.showTabs !== newOptions.showTabs) {
      if (this.editorActionsToolbarContainer) {
        this.handleEditorActionToolBarVisibility(this.editorActionsToolbarContainer);
        this.updateEditorActionsToolbar();
      }
      if (this.editorLayoutActionsToolbarContainer) {
        this.handleEditorLayoutActionsToolBarVisibility(this.editorLayoutActionsToolbarContainer);
        this.updateEditorLayoutActionsToolbar();
      }
    }
  }
};

EditorTabsControl = __decorateClass([
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IKeybindingService),
  __decorateParam(11, INotificationService),
  __decorateParam(12, IQuickInputService),
  __decorateParam(13, IThemeService),
  __decorateParam(14, IEditorResolverService),
  __decorateParam(15, IHostService),
  __decorateParam(16, IMenuService)
], EditorTabsControl);
export { EditorCommandsContextActionRunner, EditorTabsControl };
