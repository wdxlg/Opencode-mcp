// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/multiEditorTabsControl.ts
import { $, Dimension, DragAndDropObserver, EventHelper, EventType, ModifierKeyEmitter, addDisposableListener, clearNode, findParentWithClass, getWindow, isMouseEvent, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { EditorCommandsContextActionRunner, EditorTabsControl } from "./module-2005.mjs";
import { CloseEditorTabAction, CloseOtherEditorTabsInGroupAction, UnpinEditorAction } from "./module-1550.mjs";
import { DEFAULT_LABELS_CONTAINER, ResourceLabels } from "./module-1322.mjs";
import { DisposableStore, MutableDisposable, combinedDisposable, dispose, toDisposable } from "./module-0012.mjs";
import { isLinux, isMacintosh, isWindows } from "./module-0014.mjs";
import { posix, win32 } from "./module-0026.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { assertReturnsAllDefined, assertReturnsDefined } from "./module-0010.mjs";
import { ScrollableElement } from "./module-0259.mjs";
import { DEFAULT_EDITOR_ASSOCIATION, EditorResourceAccessor, preventEditorClose } from "./module-0926.mjs";
import { DraggedEditorGroupIdentifier, DraggedEditorIdentifier, ResourcesDropHandler, extractTreeDropData, isWindowDraggedOver } from "./module-1380.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { equals4 } from "./module-0098.mjs";
import { ActionBar } from "./module-0477.mjs";
import { localize } from "./module-0001.mjs";
import { coalesce, insert } from "./module-0007.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { applyDragImage } from "./module-0458.mjs";
import { prepareMoveCopyEditors } from "./module-1089.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { computeEditorAriaLabel } from "./module-1085.mjs";
import { getOrSet } from "./module-0008.mjs";
import { shorten } from "./module-0711.mjs";
import { EDITOR_DRAG_AND_DROP_BACKGROUND, EDITOR_GROUP_HEADER_TABS_BACKGROUND, EDITOR_GROUP_HEADER_TABS_BORDER, TAB_ACTIVE_BACKGROUND, TAB_ACTIVE_BORDER, TAB_ACTIVE_BORDER_TOP, TAB_ACTIVE_MODIFIED_BORDER, TAB_BORDER, TAB_HOVER_BACKGROUND, TAB_HOVER_BORDER, TAB_HOVER_FOREGROUND, TAB_INACTIVE_BACKGROUND, TAB_INACTIVE_MODIFIED_BORDER, TAB_LAST_PINNED_BORDER, TAB_SELECTED_BORDER_TOP, TAB_UNFOCUSED_ACTIVE_BACKGROUND, TAB_UNFOCUSED_ACTIVE_BORDER, TAB_UNFOCUSED_ACTIVE_BORDER_TOP, TAB_UNFOCUSED_ACTIVE_MODIFIED_BORDER, TAB_UNFOCUSED_HOVER_BACKGROUND, TAB_UNFOCUSED_HOVER_BORDER, TAB_UNFOCUSED_HOVER_FOREGROUND, TAB_UNFOCUSED_INACTIVE_BACKGROUND, TAB_UNFOCUSED_INACTIVE_MODIFIED_BORDER, WORKBENCH_BACKGROUND } from "./module-0868.mjs";
import { isHighContrast } from "./module-0247.mjs";
import { activeContrastBorder, contrastBorder } from "./module-0227.mjs";
import { basenameOrAuthority } from "./module-0034.mjs";
import { UNLOCK_GROUP_COMMAND_ID } from "./module-1530.mjs";
import { StickyEditorGroupModel, UnstickyEditorGroupModel } from "./module-2006.mjs";
import { DraggedTreeItemsIdentifier } from "./module-0669.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IThemeService, registerThemingParticipant } from "./module-0287.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IPathService } from "./module-0939.mjs";
import { ITreeViewsDnDService } from "./module-0670.mjs";
import { IEditorResolverService } from "./module-1114.mjs";
import { IHostService } from "./module-1118.mjs";
import { isSafari2 } from "./module-0018.mjs";
import { editorBackground } from "./module-0229.mjs";


// src/vs/workbench/browser/parts/editor/multiEditorTabsControl.ts
var modifierKeyEmitter = ModifierKeyEmitter.getInstance();

var MultiEditorTabsControl = class extends EditorTabsControl {
  constructor(parent, editorPartsView, groupsView, groupView, tabsModel, menuIds, breadcrumbsInHeader, contextMenuService, instantiationService, contextKeyService, keybindingService, notificationService, quickInputService, themeService, editorService, pathService, treeViewsDragAndDropService, editorResolverService, hostService, menuService) {
    super(parent, editorPartsView, groupsView, groupView, tabsModel, menuIds, breadcrumbsInHeader, contextMenuService, instantiationService, contextKeyService, keybindingService, notificationService, quickInputService, themeService, editorResolverService, hostService, menuService);
    this.editorService = editorService;
    this.pathService = pathService;
    this.treeViewsDragAndDropService = treeViewsDragAndDropService;
    this.closeEditorAction = this._register(this.instantiationService.createInstance(CloseEditorTabAction, CloseEditorTabAction.ID, CloseEditorTabAction.LABEL));
    this.unpinEditorAction = this._register(this.instantiationService.createInstance(UnpinEditorAction, UnpinEditorAction.ID, UnpinEditorAction.LABEL));
    this.closeOtherEditorTabsInGroupAction = this._register(this.instantiationService.createInstance(CloseOtherEditorTabsInGroupAction, CloseOtherEditorTabsInGroupAction.ID, CloseOtherEditorTabsInGroupAction.LABEL));
    this.tabResourceLabels = this._register(this.instantiationService.createInstance(ResourceLabels, DEFAULT_LABELS_CONTAINER));
    this.tabLabels = [];
    this.tabActionBars = [];
    this.tabDisposables = [];
    this.dimensions = {
      container: Dimension.None,
      available: Dimension.None
    };
    this.layoutScheduler = this._register(new MutableDisposable());
    this.path = isWindows ? win32 : posix;
    this.lastMouseWheelEventTime = 0;
    this.isMouseOverTabs = false;
    this.updateEditorLabelScheduler = this._register(new RunOnceScheduler(() => this.doUpdateEditorLabels(), 0));
    (async () => this.path = await this.pathService.path)();
    this._register(this.tabResourceLabels.onDidChangeDecorations(() => this.doHandleDecorationsChange()));
    this._register(modifierKeyEmitter.event(() => this.updateTabActionForHoveredTab()));
  }
  static {
    this.SCROLLBAR_SIZES = {
      default: 3,
      large: 10
    };
  }
  static {
    this.TAB_WIDTH = {
      compact: 38,
      shrink: 80,
      fit: 120
    };
  }
  static {
    this.MODERN_UI_COMPACT_PINNED_TAB_WIDTH = 28;
  }
  static {
    this.DRAG_OVER_OPEN_TAB_THRESHOLD = 1500;
  }
  static {
    this.MOUSE_WHEEL_EVENT_THRESHOLD = 150;
  }
  static {
    this.MOUSE_WHEEL_DISTANCE_THRESHOLD = 1.5;
  }
  updateTabActionForHoveredTab() {
    if (typeof this.hoveredTabIndex !== "number") {
      return;
    }
    this.redrawTabActionAtIndex(this.hoveredTabIndex);
  }
  redrawTabActionAtIndex(tabIndex) {
    const editor = this.tabsModel.getEditorByIndex(tabIndex);
    if (editor) {
      this.doWithTab(tabIndex, editor, (editor2, tabIndex2, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => this.redrawTabAction(editor2, tabIndex2, tabContainer, tabActionBar));
    }
  }
  // Tracks which tab (if any) the mouse is currently over so the Alt-hold "Close
  // Others" swap (see redrawTabAction()) applies only to that single tab.
  setHoveredTab(tabIndex) {
    if (this.hoveredTabIndex === tabIndex) {
      return;
    }
    const previousHoveredTabIndex = this.hoveredTabIndex;
    this.hoveredTabIndex = tabIndex;
    if (!modifierKeyEmitter.keyStatus.altKey) {
      return;
    }
    if (typeof previousHoveredTabIndex === "number") {
      this.redrawTabActionAtIndex(previousHoveredTabIndex);
    }
    if (typeof tabIndex === "number") {
      this.redrawTabActionAtIndex(tabIndex);
    }
  }
  create(parent) {
    super.create(parent);
    this.titleContainer = parent;
    this.tabsAndActionsContainer = $(".tabs-and-actions-container");
    this.titleContainer.appendChild(this.tabsAndActionsContainer);
    this.stickyTabsBackground = $(".sticky-tabs-background", { "aria-hidden": true });
    this.tabsContainer = $(".tabs-container", {
      role: "tablist",
      "aria-multiselectable": "true",
      draggable: true
    });
    this._register(Gesture.addTarget(this.tabsContainer));
    this.tabSizingFixedDisposables = this._register(new DisposableStore());
    this.updateTabSizing(false);
    this.tabsScrollbar = this.createTabsScrollbar(this.tabsContainer);
    this.tabsAndActionsContainer.appendChild(this.tabsScrollbar.getDomNode());
    this.tabsScrollbar.getDomNode().appendChild(this.stickyTabsBackground);
    this.registerTabsContainerListeners(this.tabsContainer, this.tabsScrollbar);
    if (this.menuIds?.tabsBarAddTab) {
      this.addTabContainer = this.createAddTabControl(this.tabsContainer, this.menuIds.tabsBarAddTab);
    }
    this.createEditorActionsToolBar(this.tabsAndActionsContainer, ["editor-actions"]);
    this.updateTabsControlVisibility();
    return this.tabsAndActionsContainer;
  }
  get tabCount() {
    const tabsContainer = assertReturnsDefined(this.tabsContainer);
    return this.addTabContainer ? tabsContainer.children.length - 1 : tabsContainer.children.length;
  }
  appendTab(tab, tabsContainer) {
    if (this.addTabContainer) {
      tabsContainer.insertBefore(tab, this.addTabContainer);
    } else {
      tabsContainer.appendChild(tab);
    }
  }
  removeLastTab(tabsContainer) {
    if (this.addTabContainer) {
      this.addTabContainer.previousElementSibling?.remove();
    } else {
      tabsContainer.lastChild?.remove();
    }
  }
  createTabsScrollbar(scrollable) {
    const tabsScrollbar = this._register(new ScrollableElement(scrollable, {
      horizontal: this.getTabsScrollbarVisibility(),
      horizontalScrollbarSize: this.getTabsScrollbarSizing(),
      vertical: 2 /* Hidden */,
      scrollYToX: true,
      useShadows: false
    }));
    this._register(tabsScrollbar.onScroll((e4) => {
      if (e4.scrollLeftChanged) {
        scrollable.scrollLeft = e4.scrollLeft;
      }
    }));
    return tabsScrollbar;
  }
  updateTabsScrollbarSizing() {
    this.tabsScrollbar?.updateOptions({
      horizontalScrollbarSize: this.getTabsScrollbarSizing()
    });
  }
  updateTabsScrollbarVisibility() {
    this.tabsScrollbar?.updateOptions({
      horizontal: this.getTabsScrollbarVisibility()
    });
  }
  updateTabSizing(fromEvent) {
    const [tabsContainer, tabSizingFixedDisposables] = assertReturnsAllDefined(this.tabsContainer, this.tabSizingFixedDisposables);
    tabSizingFixedDisposables.clear();
    const options3 = this.groupsView.partOptions;
    if (options3.tabSizing === "fixed") {
      tabsContainer.style.setProperty("--tab-sizing-fixed-min-width", `${options3.tabSizingFixedMinWidth}px`);
      tabsContainer.style.setProperty("--tab-sizing-fixed-max-width", `${options3.tabSizingFixedMaxWidth}px`);
      tabSizingFixedDisposables.add(addDisposableListener(tabsContainer, EventType.MOUSE_ENTER, () => {
        this.isMouseOverTabs = true;
      }));
      tabSizingFixedDisposables.add(addDisposableListener(tabsContainer, EventType.MOUSE_LEAVE, () => {
        this.isMouseOverTabs = false;
        this.updateTabsFixedWidth(false);
      }));
    } else if (fromEvent) {
      tabsContainer.style.removeProperty("--tab-sizing-fixed-min-width");
      tabsContainer.style.removeProperty("--tab-sizing-fixed-max-width");
      this.updateTabsFixedWidth(false);
    }
  }
  updateTabsFixedWidth(fixed) {
    this.forEachTab((editor, tabIndex, tabContainer) => {
      if (fixed) {
        const { width: width2 } = tabContainer.getBoundingClientRect();
        tabContainer.style.setProperty("--tab-sizing-current-width", `${width2}px`);
      } else {
        tabContainer.style.removeProperty("--tab-sizing-current-width");
      }
    });
  }
  getTabsScrollbarSizing() {
    if (this.groupsView.partOptions.titleScrollbarSizing !== "large") {
      return MultiEditorTabsControl.SCROLLBAR_SIZES.default;
    }
    return MultiEditorTabsControl.SCROLLBAR_SIZES.large;
  }
  getTabsScrollbarVisibility() {
    switch (this.groupsView.partOptions.titleScrollbarVisibility) {
      case "visible":
        return 3 /* Visible */;
      case "hidden":
        return 2 /* Hidden */;
      default:
        return 1 /* Auto */;
    }
  }
  registerTabsContainerListeners(tabsContainer, tabsScrollbar) {
    this._register(addDisposableListener(tabsContainer, EventType.SCROLL, () => {
      if (tabsContainer.classList.contains("scroll")) {
        tabsScrollbar.setScrollPosition({
          scrollLeft: tabsContainer.scrollLeft
          // during DND the container gets scrolled so we need to update the custom scrollbar
        });
      }
    }));
    for (const eventType of [EventType2.Tap, EventType.DBLCLICK]) {
      this._register(addDisposableListener(tabsContainer, eventType, (e4) => {
        if (eventType === EventType.DBLCLICK) {
          if (e4.target !== tabsContainer) {
            return;
          }
        } else {
          if (e4.tapCount !== 2) {
            return;
          }
          if (e4.initialTarget !== tabsContainer) {
            return;
          }
        }
        EventHelper.stop(e4);
        this.editorService.openEditor({
          resource: void 0,
          options: {
            pinned: true,
            index: this.groupView.count,
            // always at the end
            override: DEFAULT_EDITOR_ASSOCIATION.id
          }
        }, this.groupView.id);
      }));
    }
    this._register(addDisposableListener(tabsContainer, EventType.MOUSE_DOWN, (e4) => {
      if (e4.button === 1) {
        e4.preventDefault();
      }
    }));
    this._register(addDisposableListener(tabsContainer, EventType.MOUSE_LEAVE, () => {
      this.setHoveredTab(void 0);
    }));
    if (isLinux) {
      this._register(addDisposableListener(tabsContainer, EventType.MOUSE_UP, (e4) => {
        if (e4.button === 1) {
          e4.preventDefault();
        }
      }));
    }
    let lastDragEvent = void 0;
    let isNewWindowOperation = false;
    this._register(new DragAndDropObserver(tabsContainer, {
      onDragStart: (e4) => {
        isNewWindowOperation = this.onGroupDragStart(e4, tabsContainer);
      },
      onDrag: (e4) => {
        lastDragEvent = e4;
      },
      onDragEnter: (e4) => {
        tabsContainer.classList.add("scroll");
        if (e4.target !== tabsContainer) {
          return;
        }
        if (!this.isSupportedDropTransfer(e4)) {
          if (e4.dataTransfer) {
            e4.dataTransfer.dropEffect = "none";
          }
          return;
        }
        if (!this.editorTransfer.hasData(DraggedEditorIdentifier.prototype)) {
          if (e4.dataTransfer) {
            e4.dataTransfer.dropEffect = "copy";
          }
        }
        this.updateDropFeedback(tabsContainer, true, e4);
      },
      onDragLeave: (e4) => {
        this.updateDropFeedback(tabsContainer, false, e4);
        tabsContainer.classList.remove("scroll");
      },
      onDragEnd: (e4) => {
        this.updateDropFeedback(tabsContainer, false, e4);
        tabsContainer.classList.remove("scroll");
        this.onGroupDragEnd(e4, lastDragEvent, tabsContainer, isNewWindowOperation);
      },
      onDrop: (e4) => {
        this.updateDropFeedback(tabsContainer, false, e4);
        tabsContainer.classList.remove("scroll");
        if (e4.target === tabsContainer) {
          const isGroupTransfer = this.groupTransfer.hasData(DraggedEditorGroupIdentifier.prototype);
          this.onDrop(e4, isGroupTransfer ? this.groupView.count : this.tabsModel.count, tabsContainer);
        }
      }
    }));
    this._register(addDisposableListener(tabsContainer, EventType.MOUSE_WHEEL, (e4) => {
      const activeEditor = this.groupView.activeEditor;
      if (!activeEditor || this.groupView.count < 2) {
        return;
      }
      if (this.groupsView.partOptions.scrollToSwitchTabs === true) {
        if (e4.shiftKey) {
          return;
        }
      } else {
        if (!e4.shiftKey) {
          return;
        }
      }
      const now = Date.now();
      if (now - this.lastMouseWheelEventTime < MultiEditorTabsControl.MOUSE_WHEEL_EVENT_THRESHOLD - 2 * (Math.abs(e4.deltaX) + Math.abs(e4.deltaY))) {
        return;
      }
      this.lastMouseWheelEventTime = now;
      let tabSwitchDirection;
      if (e4.deltaX + e4.deltaY < -MultiEditorTabsControl.MOUSE_WHEEL_DISTANCE_THRESHOLD) {
        tabSwitchDirection = -1;
      } else if (e4.deltaX + e4.deltaY > MultiEditorTabsControl.MOUSE_WHEEL_DISTANCE_THRESHOLD) {
        tabSwitchDirection = 1;
      } else {
        return;
      }
      const nextEditor = this.groupView.getEditorByIndex(this.groupView.getIndexOfEditor(activeEditor) + tabSwitchDirection);
      if (!nextEditor) {
        return;
      }
      this.groupView.openEditor(nextEditor);
      EventHelper.stop(e4, true);
    }));
    const showContextMenu = (e4) => {
      EventHelper.stop(e4);
      let anchor = tabsContainer;
      if (isMouseEvent(e4)) {
        anchor = new StandardMouseEvent(getWindow(this.parent), e4);
      }
      this.contextMenuService.showContextMenu({
        getAnchor: () => anchor,
        menuId: this.menuIds?.tabsBarContext ?? MenuId.EditorTabsBarContext,
        contextKeyService: this.contextKeyService,
        menuActionOptions: { shouldForwardArgs: true },
        getActionsContext: () => ({ groupId: this.groupView.id }),
        getKeyBinding: (action) => this.getKeybinding(action),
        onHide: () => this.groupView.focus()
      });
    };
    this._register(addDisposableListener(tabsContainer, EventType2.Contextmenu, (e4) => showContextMenu(e4)));
    this._register(addDisposableListener(tabsContainer, EventType.CONTEXT_MENU, (e4) => showContextMenu(e4)));
  }
  doHandleDecorationsChange() {
    this.layout(this.dimensions);
  }
  updateEditorActionsToolbar() {
    super.updateEditorActionsToolbar();
    this.layout(this.dimensions);
  }
  openEditor(editor, options3) {
    const changed = this.handleOpenedEditors();
    if (options3?.focusTabControl) {
      this.withTab(editor, (editor2, tabIndex, tabContainer) => tabContainer.focus());
    }
    return changed;
  }
  openEditors(editors) {
    return this.handleOpenedEditors();
  }
  handleOpenedEditors() {
    this.updateTabsControlVisibility();
    const [tabsContainer, tabsScrollbar] = assertReturnsAllDefined(this.tabsContainer, this.tabsScrollbar);
    for (let i2 = this.tabCount; i2 < this.tabsModel.count; i2++) {
      this.appendTab(this.createTab(i2, tabsContainer, tabsScrollbar), tabsContainer);
    }
    const activeEditorChanged = this.didActiveEditorChange();
    const oldTabLabels = this.tabLabels;
    this.computeTabLabels();
    let didChange = false;
    if (activeEditorChanged || // active editor changed
    oldTabLabels.length !== this.tabLabels.length || // number of tabs changed
    oldTabLabels.some((label3, index2) => !this.equalsEditorInputLabel(label3, this.tabLabels.at(index2)))) {
      this.redraw({ forceRevealActiveTab: true });
      didChange = true;
    } else {
      this.layout(this.dimensions, { forceRevealActiveTab: true });
    }
    return didChange;
  }
  didActiveEditorChange() {
    if (!this.activeTabLabel?.editor && this.tabsModel.activeEditor || // active editor changed from null => editor
    this.activeTabLabel?.editor && !this.tabsModel.activeEditor || // active editor changed from editor => null
    (!this.activeTabLabel?.editor || !this.tabsModel.isActive(this.activeTabLabel.editor))) {
      return true;
    }
    return false;
  }
  equalsEditorInputLabel(labelA, labelB) {
    if (labelA === labelB) {
      return true;
    }
    if (!labelA || !labelB) {
      return false;
    }
    return labelA.name === labelB.name && labelA.description === labelB.description && labelA.forceDescription === labelB.forceDescription && labelA.title === labelB.title && labelA.ariaLabel === labelB.ariaLabel;
  }
  beforeCloseEditor(editor) {
    if (this.isMouseOverTabs && this.groupsView.partOptions.tabSizing === "fixed") {
      const closingLastTab = this.tabsModel.isLast(editor);
      this.updateTabsFixedWidth(!closingLastTab);
    }
  }
  closeEditor(editor) {
    this.handleClosedEditors();
  }
  closeEditors(editors) {
    this.handleClosedEditors();
  }
  handleClosedEditors() {
    if (typeof this.hoveredTabIndex === "number" && this.hoveredTabIndex >= this.tabsModel.count) {
      this.setHoveredTab(void 0);
    }
    if (this.tabsModel.count) {
      const tabsContainer = assertReturnsDefined(this.tabsContainer);
      while (this.tabCount > this.tabsModel.count) {
        this.removeLastTab(tabsContainer);
        dispose(this.tabDisposables.pop());
      }
      this.computeTabLabels();
      this.redraw({ forceRevealActiveTab: true });
    } else {
      if (this.tabsContainer) {
        clearNode(this.tabsContainer);
        if (this.addTabContainer) {
          this.tabsContainer.appendChild(this.addTabContainer);
        }
      }
      this.tabDisposables = dispose(this.tabDisposables);
      this.tabResourceLabels.clear();
      this.tabLabels = [];
      this.activeTabLabel = void 0;
      this.tabActionBars = [];
      this.clearEditorActionsToolbar();
      this.updateTabsControlVisibility();
    }
  }
  moveEditor(editor, fromTabIndex, targetTabIndex) {
    const editorLabel = this.tabLabels[fromTabIndex];
    this.tabLabels.splice(fromTabIndex, 1);
    this.tabLabels.splice(targetTabIndex, 0, editorLabel);
    this.forEachTab(
      (editor2, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => {
        this.redrawTab(editor2, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar);
      },
      Math.min(fromTabIndex, targetTabIndex),
      // from: smallest of fromTabIndex/targetTabIndex
      Math.max(fromTabIndex, targetTabIndex)
      //   to: largest of fromTabIndex/targetTabIndex
    );
    this.layout(this.dimensions, { forceRevealActiveTab: true });
  }
  pinEditor(editor) {
    this.withTab(editor, (editor2, tabIndex, tabContainer, tabLabelWidget, tabLabel) => this.redrawTabLabel(editor2, tabIndex, tabContainer, tabLabelWidget, tabLabel));
  }
  stickEditor(editor) {
    this.doHandleStickyEditorChange(editor);
  }
  unstickEditor(editor) {
    this.doHandleStickyEditorChange(editor);
  }
  doHandleStickyEditorChange(editor) {
    this.withTab(editor, (editor2, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => this.redrawTab(editor2, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar));
    this.forEachTab((editor2, tabIndex, tabContainer, tabLabelWidget, tabLabel) => {
      this.redrawTabBorders(tabIndex, tabContainer);
    });
    this.layout(this.dimensions, { forceRevealActiveTab: true });
  }
  setActive(isGroupActive) {
    this.forEachTab((editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => {
      this.redrawTabSelectedActiveAndDirty(isGroupActive, editor, tabContainer, tabActionBar);
    });
    this.updateEditorActionsToolbar();
    this.layout(this.dimensions, { forceRevealActiveTab: true });
  }
  updateEditorSelections() {
    this.forEachTab((editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => {
      this.redrawTabSelectedActiveAndDirty(this.groupsView.activeGroup === this.groupView, editor, tabContainer, tabActionBar);
    });
  }
  updateEditorLabel(editor) {
    this.updateEditorLabelScheduler.schedule();
  }
  doUpdateEditorLabels() {
    this.computeTabLabels();
    this.forEachTab((editor, tabIndex, tabContainer, tabLabelWidget, tabLabel) => {
      this.redrawTabLabel(editor, tabIndex, tabContainer, tabLabelWidget, tabLabel);
    });
    this.layout(this.dimensions);
  }
  updateEditorDirty(editor) {
    this.withTab(editor, (editor2, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => this.redrawTabSelectedActiveAndDirty(this.groupsView.activeGroup === this.groupView, editor2, tabContainer, tabActionBar));
  }
  updateEditorCapabilities(editor) {
    this.withTab(editor, (editor2, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => this.redrawTab(editor2, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar));
  }
  updateOptions(oldOptions, newOptions) {
    super.updateOptions(oldOptions, newOptions);
    if (oldOptions.labelFormat !== newOptions.labelFormat) {
      this.computeTabLabels();
    }
    if (oldOptions.titleScrollbarSizing !== newOptions.titleScrollbarSizing) {
      this.updateTabsScrollbarSizing();
    }
    if (oldOptions.titleScrollbarVisibility !== newOptions.titleScrollbarVisibility) {
      this.updateTabsScrollbarVisibility();
    }
    if (oldOptions.alwaysShowEditorActions !== newOptions.alwaysShowEditorActions) {
      this.updateEditorActionsToolbar();
    }
    if (oldOptions.tabSizingFixedMinWidth !== newOptions.tabSizingFixedMinWidth || oldOptions.tabSizingFixedMaxWidth !== newOptions.tabSizingFixedMaxWidth || oldOptions.tabSizing !== newOptions.tabSizing) {
      this.updateTabSizing(true);
    }
    if (oldOptions.labelFormat !== newOptions.labelFormat || oldOptions.tabActionLocation !== newOptions.tabActionLocation || oldOptions.tabActionCloseVisibility !== newOptions.tabActionCloseVisibility || oldOptions.tabActionUnpinVisibility !== newOptions.tabActionUnpinVisibility || oldOptions.tabSizing !== newOptions.tabSizing || oldOptions.pinnedTabSizing !== newOptions.pinnedTabSizing || oldOptions.showIcons !== newOptions.showIcons || oldOptions.hasIcons !== newOptions.hasIcons || oldOptions.highlightModifiedTabs !== newOptions.highlightModifiedTabs || oldOptions.wrapTabs !== newOptions.wrapTabs || oldOptions.showTabIndex !== newOptions.showTabIndex || !equals4(oldOptions.decorations, newOptions.decorations)) {
      this.redraw();
    }
  }
  updateStyles() {
    this.redraw();
  }
  forEachTab(fn, fromTabIndex, toTabIndex) {
    this.tabsModel.getEditors(1 /* SEQUENTIAL */).forEach((editor, tabIndex) => {
      if (typeof fromTabIndex === "number" && fromTabIndex > tabIndex) {
        return;
      }
      if (typeof toTabIndex === "number" && toTabIndex < tabIndex) {
        return;
      }
      this.doWithTab(tabIndex, editor, fn);
    });
  }
  withTab(editor, fn) {
    this.doWithTab(this.tabsModel.indexOf(editor), editor, fn);
  }
  doWithTab(tabIndex, editor, fn) {
    const tabsContainer = assertReturnsDefined(this.tabsContainer);
    const tabContainer = tabsContainer.children[tabIndex];
    const tabResourceLabel = this.tabResourceLabels.get(tabIndex);
    const tabLabel = this.tabLabels[tabIndex];
    const tabActionBar = this.tabActionBars[tabIndex];
    if (tabContainer && tabResourceLabel && tabLabel) {
      fn(editor, tabIndex, tabContainer, tabResourceLabel, tabLabel, tabActionBar);
    }
  }
  createTab(tabIndex, tabsContainer, tabsScrollbar) {
    const tabContainer = $(".tab", {
      draggable: true,
      role: "tab"
    });
    const gestureDisposable = Gesture.addTarget(tabContainer);
    const tabFillContainer = $(".tab-fill", { "aria-hidden": true });
    tabContainer.appendChild(tabFillContainer);
    const tabBorderTopContainer = $(".tab-border-top-container");
    tabContainer.appendChild(tabBorderTopContainer);
    const editorLabel = this.tabResourceLabels.create(tabContainer, { hoverTargetOverride: tabContainer });
    const tabActionsContainer = $(".tab-actions");
    tabContainer.appendChild(tabActionsContainer);
    const that = this;
    const tabActionRunner = new EditorCommandsContextActionRunner({
      groupId: this.groupView.id,
      get editorIndex() {
        return that.toEditorIndex(tabIndex);
      }
    });
    const tabActionBar = new ActionBar(tabActionsContainer, { ariaLabel: localize(6767, null), actionRunner: tabActionRunner });
    const tabActionListener = tabActionBar.onWillRun((e4) => {
      if (e4.action.id === this.closeEditorAction.id || e4.action.id === this.closeOtherEditorTabsInGroupAction.id) {
        this.blockRevealActiveTabOnce();
      }
    });
    const tabActionBarDisposable = combinedDisposable(tabActionRunner, tabActionBar, tabActionListener, toDisposable(insert(this.tabActionBars, tabActionBar)));
    const tabShadowHider = $(".tab-fade-hider");
    tabContainer.appendChild(tabShadowHider);
    const tabBorderBottomContainer = $(".tab-border-bottom-container");
    tabContainer.appendChild(tabBorderBottomContainer);
    const eventsDisposable = this.registerTabListeners(tabContainer, tabIndex, tabsContainer, tabsScrollbar);
    this.tabDisposables.push(combinedDisposable(gestureDisposable, eventsDisposable, tabActionBarDisposable, editorLabel));
    return tabContainer;
  }
  toEditorIndex(tabIndex) {
    const editor = assertReturnsDefined(this.tabsModel.getEditorByIndex(tabIndex));
    return this.groupView.getIndexOfEditor(editor);
  }
  registerTabListeners(tab, tabIndex, tabsContainer, tabsScrollbar) {
    const disposables = new DisposableStore();
    const handleClickOrTouch = async (e4, preserveFocus) => {
      tab.blur();
      if (isMouseEvent(e4) && (e4.button !== 0 || isMacintosh && e4.ctrlKey)) {
        if (e4.button === 1) {
          e4.preventDefault();
        }
        return;
      }
      if (this.originatesFromTabActionBar(e4)) {
        return;
      }
      const editor = this.tabsModel.getEditorByIndex(tabIndex);
      if (editor) {
        if (e4.shiftKey) {
          let anchor;
          if (this.lastSingleSelectSelectedEditor && this.tabsModel.isSelected(this.lastSingleSelectSelectedEditor)) {
            anchor = this.lastSingleSelectSelectedEditor;
          } else {
            const activeEditor = assertReturnsDefined(this.groupView.activeEditor);
            this.lastSingleSelectSelectedEditor = activeEditor;
            anchor = activeEditor;
          }
          await this.selectEditorsBetween(editor, anchor);
        } else if (e4.ctrlKey && !isMacintosh || e4.metaKey && isMacintosh) {
          if (this.tabsModel.isSelected(editor)) {
            await this.unselectEditor(editor);
          } else {
            await this.selectEditor(editor);
            this.lastSingleSelectSelectedEditor = editor;
          }
        } else {
          const inactiveSelection = this.tabsModel.isSelected(editor) ? this.groupView.selectedEditors.filter((e5) => !e5.matches(editor)) : [];
          await this.groupView.openEditor(editor, { preserveFocus, activation: 1 /* ACTIVATE */ }, { inactiveSelection, focusTabControl: true });
        }
      }
    };
    const showContextMenu = (e4) => {
      EventHelper.stop(e4);
      const editor = this.tabsModel.getEditorByIndex(tabIndex);
      if (editor) {
        this.onTabContextMenu(editor, e4, tab);
      }
    };
    disposables.add(addDisposableListener(tab, EventType.MOUSE_DOWN, (e4) => handleClickOrTouch(e4, false)));
    disposables.add(addDisposableListener(tab, EventType2.Tap, (e4) => handleClickOrTouch(e4, true)));
    disposables.add(addDisposableListener(tab, EventType.MOUSE_ENTER, () => {
      this.setHoveredTab(tabIndex);
    }));
    disposables.add(addDisposableListener(tab, EventType.MOUSE_LEAVE, () => {
      if (this.hoveredTabIndex === tabIndex) {
        this.setHoveredTab(void 0);
      }
    }));
    disposables.add(addDisposableListener(tab, EventType2.Change, (e4) => {
      tabsScrollbar.setScrollPosition({ scrollLeft: tabsScrollbar.getScrollPosition().scrollLeft - e4.translationX });
    }));
    disposables.add(addDisposableListener(tab, EventType.MOUSE_UP, async (e4) => {
      EventHelper.stop(e4);
      tab.blur();
      if (isMouseEvent(e4) && (e4.button !== 0 || isMacintosh && e4.ctrlKey)) {
        return;
      }
      if (this.originatesFromTabActionBar(e4)) {
        return;
      }
      const isCtrlCmd = e4.ctrlKey && !isMacintosh || e4.metaKey && isMacintosh;
      if (!isCtrlCmd && !e4.shiftKey && this.groupView.selectedEditors.length > 1) {
        await this.unselectAllEditors();
      }
    }));
    disposables.add(addDisposableListener(tab, EventType.AUXCLICK, (e4) => {
      if (e4.button === 1) {
        EventHelper.stop(
          e4,
          true
          /* for https://github.com/microsoft/vscode/issues/56715 */
        );
        const editor = this.tabsModel.getEditorByIndex(tabIndex);
        if (editor) {
          if (editor.hasCapability(8192 /* CannotClose */) || preventEditorClose(this.tabsModel, editor, 2 /* MOUSE */, this.groupsView.partOptions)) {
            return;
          }
          this.blockRevealActiveTabOnce();
          this.closeEditorAction.run({ groupId: this.groupView.id, editorIndex: this.groupView.getIndexOfEditor(editor) });
        }
      }
    }));
    disposables.add(addDisposableListener(tab, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (event.shiftKey && event.keyCode === 68 /* F10 */) {
        showContextMenu(e4);
      }
    }));
    disposables.add(addDisposableListener(tab, EventType2.Contextmenu, (e4) => {
      showContextMenu(e4);
    }));
    disposables.add(addDisposableListener(tab, EventType.KEY_UP, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      let handled = false;
      if (event.equals(3 /* Enter */) || event.equals(10 /* Space */)) {
        handled = true;
        const editor = this.tabsModel.getEditorByIndex(tabIndex);
        if (editor) {
          this.groupView.openEditor(editor);
        }
      } else if ([15 /* LeftArrow */, 17 /* RightArrow */, 16 /* UpArrow */, 18 /* DownArrow */, 14 /* Home */, 13 /* End */].some((kb) => event.equals(kb))) {
        let editorIndex = this.toEditorIndex(tabIndex);
        if (event.equals(15 /* LeftArrow */) || event.equals(16 /* UpArrow */)) {
          editorIndex = editorIndex - 1;
        } else if (event.equals(17 /* RightArrow */) || event.equals(18 /* DownArrow */)) {
          editorIndex = editorIndex + 1;
        } else if (event.equals(14 /* Home */)) {
          editorIndex = 0;
        } else {
          editorIndex = this.groupView.count - 1;
        }
        const target = this.groupView.getEditorByIndex(editorIndex);
        if (target) {
          handled = true;
          this.groupView.openEditor(target, { preserveFocus: true }, { focusTabControl: true });
        }
      }
      if (handled) {
        EventHelper.stop(e4, true);
      }
      tabsScrollbar.setScrollPosition({
        scrollLeft: tabsContainer.scrollLeft
      });
    }));
    for (const eventType of [EventType2.Tap, EventType.DBLCLICK]) {
      disposables.add(addDisposableListener(tab, eventType, (e4) => {
        if (eventType === EventType.DBLCLICK) {
          EventHelper.stop(e4);
        } else if (e4.tapCount !== 2) {
          return;
        }
        const editor = this.tabsModel.getEditorByIndex(tabIndex);
        if (editor && this.tabsModel.isPinned(editor)) {
          switch (this.groupsView.partOptions.doubleClickTabToToggleEditorGroupSizes) {
            case "maximize":
              this.groupsView.toggleMaximizeGroup(this.groupView);
              break;
            case "expand":
              this.groupsView.toggleExpandGroup(this.groupView);
              break;
            case "off":
              break;
          }
        } else {
          this.groupView.pinEditor(editor);
        }
      }));
    }
    disposables.add(addDisposableListener(
      tab,
      EventType.CONTEXT_MENU,
      (e4) => {
        EventHelper.stop(e4, true);
        const editor = this.tabsModel.getEditorByIndex(tabIndex);
        if (editor) {
          this.onTabContextMenu(editor, e4, tab);
        }
      },
      true
      /* use capture to fix https://github.com/microsoft/vscode/issues/19145 */
    ));
    let lastDragEvent = void 0;
    let isNewWindowOperation = false;
    disposables.add(new DragAndDropObserver(tab, {
      onDragStart: (e4) => {
        const editor = this.tabsModel.getEditorByIndex(tabIndex);
        if (!editor) {
          return;
        }
        isNewWindowOperation = this.isNewWindowOperation(e4);
        const selectedEditors = this.groupView.selectedEditors;
        this.editorTransfer.setData(selectedEditors.map((e5) => new DraggedEditorIdentifier({ editor: e5, groupId: this.groupView.id })), DraggedEditorIdentifier.prototype);
        if (e4.dataTransfer) {
          e4.dataTransfer.effectAllowed = "copyMove";
          if (selectedEditors.length > 1) {
            const label3 = `${editor.getName()} + ${selectedEditors.length - 1}`;
            applyDragImage(e4, tab, label3);
          } else {
            const options3 = this.groupsView.partOptions;
            const isTabSticky = this.tabsModel.isSticky(tabIndex);
            const isShrinkSizing = options3.tabSizing === "shrink" || isTabSticky && options3.pinnedTabSizing === "shrink";
            if (isShrinkSizing) {
              applyDragImage(e4, tab, editor.getName());
            } else {
              e4.dataTransfer.setDragImage(tab, 0, 0);
            }
          }
        }
        this.doFillResourceDataTransfers(selectedEditors, e4, isNewWindowOperation);
        scheduleAtNextAnimationFrame(getWindow(this.parent), () => this.updateDropFeedback(tab, false, e4, tabIndex));
      },
      onDrag: (e4) => {
        lastDragEvent = e4;
      },
      onDragEnter: (e4) => {
        if (!this.isSupportedDropTransfer(e4)) {
          if (e4.dataTransfer) {
            e4.dataTransfer.dropEffect = "none";
          }
          return;
        }
        if (!this.editorTransfer.hasData(DraggedEditorIdentifier.prototype)) {
          if (e4.dataTransfer) {
            e4.dataTransfer.dropEffect = "copy";
          }
        }
        this.updateDropFeedback(tab, true, e4, tabIndex);
      },
      onDragOver: (e4, dragDuration) => {
        if (dragDuration >= MultiEditorTabsControl.DRAG_OVER_OPEN_TAB_THRESHOLD) {
          const draggedOverTab = this.tabsModel.getEditorByIndex(tabIndex);
          if (draggedOverTab && this.tabsModel.activeEditor !== draggedOverTab) {
            this.groupView.openEditor(draggedOverTab, { preserveFocus: true });
          }
        }
        this.updateDropFeedback(tab, true, e4, tabIndex);
      },
      onDragEnd: async (e4) => {
        this.updateDropFeedback(tab, false, e4, tabIndex);
        const draggedEditors = this.editorTransfer.getData(DraggedEditorIdentifier.prototype);
        this.editorTransfer.clearData(DraggedEditorIdentifier.prototype);
        if (!isNewWindowOperation || isWindowDraggedOver() || !draggedEditors || draggedEditors.length === 0) {
          return;
        }
        const auxiliaryEditorPart = await this.maybeCreateAuxiliaryEditorPartAt(e4, tab);
        if (!auxiliaryEditorPart) {
          return;
        }
        const targetGroup = auxiliaryEditorPart.activeGroup;
        const editorsWithOptions = prepareMoveCopyEditors(this.groupView, draggedEditors.map((editor) => editor.identifier.editor));
        if (this.isMoveOperation(lastDragEvent ?? e4, targetGroup.id, draggedEditors[0].identifier.editor)) {
          this.groupView.moveEditors(editorsWithOptions, targetGroup);
        } else {
          this.groupView.copyEditors(editorsWithOptions, targetGroup);
        }
        targetGroup.focus();
      },
      onDrop: (e4) => {
        this.updateDropFeedback(tab, false, e4, tabIndex);
        let targetIndex = tabIndex;
        if (this.getTabDragOverLocation(e4, tab) === "right") {
          targetIndex++;
        }
        this.onDrop(e4, targetIndex, tabsContainer);
      }
    }));
    return disposables;
  }
  isSupportedDropTransfer(e4) {
    if (this.groupTransfer.hasData(DraggedEditorGroupIdentifier.prototype)) {
      const data = this.groupTransfer.getData(DraggedEditorGroupIdentifier.prototype);
      if (Array.isArray(data) && data.length > 0) {
        const group2 = data[0];
        if (group2.identifier === this.groupView.id) {
          return false;
        }
      }
      return true;
    }
    if (this.editorTransfer.hasData(DraggedEditorIdentifier.prototype)) {
      return true;
    }
    if (e4.dataTransfer && e4.dataTransfer.types.length > 0) {
      return true;
    }
    return false;
  }
  updateDropFeedback(element, isDND, e4, tabIndex) {
    const isTab = typeof tabIndex === "number";
    let dropTarget;
    if (isDND) {
      if (isTab) {
        dropTarget = this.computeDropTarget(e4, tabIndex, element);
      } else {
        dropTarget = { leftElement: element.lastElementChild, rightElement: void 0 };
      }
    } else {
      dropTarget = void 0;
    }
    this.updateDropTarget(dropTarget);
  }
  updateDropTarget(newTarget) {
    const oldTargets = this.dropTarget;
    if (oldTargets === newTarget || oldTargets && newTarget && oldTargets.leftElement === newTarget.leftElement && oldTargets.rightElement === newTarget.rightElement) {
      return;
    }
    const dropClassLeft = "drop-target-left";
    const dropClassRight = "drop-target-right";
    if (oldTargets) {
      oldTargets.leftElement?.classList.remove(dropClassLeft);
      oldTargets.rightElement?.classList.remove(dropClassRight);
    }
    if (newTarget) {
      newTarget.leftElement?.classList.add(dropClassLeft);
      newTarget.rightElement?.classList.add(dropClassRight);
    }
    this.dropTarget = newTarget;
  }
  getTabDragOverLocation(e4, tab) {
    const rect = tab.getBoundingClientRect();
    const offsetXRelativeToParent = e4.clientX - rect.left;
    return offsetXRelativeToParent <= rect.width / 2 ? "left" : "right";
  }
  computeDropTarget(e4, tabIndex, targetTab) {
    const isLeftSideOfTab = this.getTabDragOverLocation(e4, targetTab) === "left";
    const isLastTab = tabIndex === this.tabsModel.count - 1;
    const isFirstTab = tabIndex === 0;
    if (isLeftSideOfTab && isFirstTab) {
      return { leftElement: void 0, rightElement: targetTab };
    }
    if (!isLeftSideOfTab && isLastTab) {
      return { leftElement: targetTab, rightElement: void 0 };
    }
    const tabBefore = isLeftSideOfTab ? targetTab.previousElementSibling : targetTab;
    const tabAfter = isLeftSideOfTab ? targetTab : targetTab.nextElementSibling;
    return { leftElement: tabBefore, rightElement: tabAfter };
  }
  async selectEditor(editor) {
    if (this.groupView.isActive(editor)) {
      return;
    }
    await this.groupView.setSelection(editor, this.groupView.selectedEditors);
  }
  async selectEditorsBetween(target, anchor) {
    const editorIndex = this.groupView.getIndexOfEditor(target);
    if (editorIndex === -1) {
      throw new BugIndicatingError();
    }
    const anchorEditorIndex = this.groupView.getIndexOfEditor(anchor);
    if (anchorEditorIndex === -1) {
      throw new BugIndicatingError();
    }
    let selection = this.groupView.selectedEditors;
    let currentEditorIndex = anchorEditorIndex;
    while (currentEditorIndex >= 0 && currentEditorIndex <= this.groupView.count - 1) {
      currentEditorIndex = anchorEditorIndex < editorIndex ? currentEditorIndex - 1 : currentEditorIndex + 1;
      const currentEditor = this.groupView.getEditorByIndex(currentEditorIndex);
      if (!currentEditor) {
        break;
      }
      if (!this.groupView.isSelected(currentEditor)) {
        break;
      }
      selection = selection.filter((editor) => !editor.matches(currentEditor));
    }
    const fromEditorIndex = anchorEditorIndex < editorIndex ? anchorEditorIndex : editorIndex;
    const toEditorIndex = anchorEditorIndex < editorIndex ? editorIndex : anchorEditorIndex;
    const editorsToSelect = this.groupView.getEditors(1 /* SEQUENTIAL */).slice(fromEditorIndex, toEditorIndex + 1);
    for (const editor of editorsToSelect) {
      if (!this.groupView.isSelected(editor)) {
        selection.push(editor);
      }
    }
    const inactiveSelectedEditors = selection.filter((editor) => !editor.matches(target));
    await this.groupView.setSelection(target, inactiveSelectedEditors);
  }
  async unselectEditor(editor) {
    const isUnselectingActiveEditor = this.groupView.isActive(editor);
    if (isUnselectingActiveEditor && this.groupView.selectedEditors.length === 1) {
      return;
    }
    let newActiveEditor = assertReturnsDefined(this.groupView.activeEditor);
    if (isUnselectingActiveEditor) {
      const recentEditors = this.groupView.getEditors(0 /* MOST_RECENTLY_ACTIVE */);
      for (let i2 = 1; i2 < recentEditors.length; i2++) {
        const recentEditor = recentEditors[i2];
        if (this.groupView.isSelected(recentEditor)) {
          newActiveEditor = recentEditor;
          break;
        }
      }
    }
    const inactiveSelectedEditors = this.groupView.selectedEditors.filter((e4) => !e4.matches(editor) && !e4.matches(newActiveEditor));
    await this.groupView.setSelection(newActiveEditor, inactiveSelectedEditors);
  }
  async unselectAllEditors() {
    if (this.groupView.selectedEditors.length > 1) {
      const activeEditor = assertReturnsDefined(this.groupView.activeEditor);
      await this.groupView.setSelection(activeEditor, []);
    }
  }
  computeTabLabels() {
    const { labelFormat } = this.groupsView.partOptions;
    const { verbosity, shortenDuplicates } = this.getLabelConfigFlags(labelFormat);
    const labels = [];
    let activeEditorTabIndex = -1;
    this.tabsModel.getEditors(1 /* SEQUENTIAL */).forEach((editor, tabIndex) => {
      labels.push({
        editor,
        name: editor.getName(),
        description: editor.getDescription(verbosity),
        forceDescription: editor.hasCapability(64 /* ForceDescription */),
        title: editor.getTitle(2 /* LONG */),
        ariaLabel: computeEditorAriaLabel(editor, tabIndex, this.groupView, this.editorPartsView.count)
      });
      if (editor === this.tabsModel.activeEditor) {
        activeEditorTabIndex = tabIndex;
      }
    });
    if (shortenDuplicates) {
      this.shortenTabLabels(labels);
    }
    this.tabLabels = labels;
    this.activeTabLabel = labels[activeEditorTabIndex];
  }
  shortenTabLabels(labels) {
    const mapNameToDuplicates = /* @__PURE__ */ new Map();
    for (const label3 of labels) {
      if (typeof label3.description === "string") {
        getOrSet(mapNameToDuplicates, label3.name, []).push(label3);
      } else {
        label3.description = "";
      }
    }
    for (const [, duplicateLabels] of mapNameToDuplicates) {
      if (duplicateLabels.length === 1 && !duplicateLabels[0].forceDescription) {
        duplicateLabels[0].description = "";
        continue;
      }
      const mapDescriptionToDuplicates = /* @__PURE__ */ new Map();
      for (const duplicateLabel of duplicateLabels) {
        getOrSet(mapDescriptionToDuplicates, duplicateLabel.description, []).push(duplicateLabel);
      }
      let useLongDescriptions = false;
      for (const [, duplicateLabels2] of mapDescriptionToDuplicates) {
        if (!useLongDescriptions && duplicateLabels2.length > 1) {
          const [first2, ...rest] = duplicateLabels2.map(({ editor }) => editor.getDescription(2 /* LONG */));
          useLongDescriptions = rest.some((description) => description !== first2);
        }
      }
      if (useLongDescriptions) {
        mapDescriptionToDuplicates.clear();
        for (const duplicateLabel of duplicateLabels) {
          duplicateLabel.description = duplicateLabel.editor.getDescription(2 /* LONG */);
          getOrSet(mapDescriptionToDuplicates, duplicateLabel.description, []).push(duplicateLabel);
        }
      }
      const descriptions = [];
      for (const [description] of mapDescriptionToDuplicates) {
        descriptions.push(description);
      }
      if (descriptions.length === 1) {
        for (const label3 of mapDescriptionToDuplicates.get(descriptions[0]) || []) {
          if (!label3.forceDescription) {
            label3.description = "";
          }
        }
        continue;
      }
      const shortenedDescriptions = shorten(descriptions, this.path.sep);
      descriptions.forEach((description, tabIndex) => {
        for (const label3 of mapDescriptionToDuplicates.get(description) || []) {
          label3.description = shortenedDescriptions[tabIndex];
        }
      });
    }
  }
  getLabelConfigFlags(value2) {
    switch (value2) {
      case "short":
        return { verbosity: 0 /* SHORT */, shortenDuplicates: false };
      case "medium":
        return { verbosity: 1 /* MEDIUM */, shortenDuplicates: false };
      case "long":
        return { verbosity: 2 /* LONG */, shortenDuplicates: false };
      default:
        return { verbosity: 1 /* MEDIUM */, shortenDuplicates: true };
    }
  }
  redraw(options3) {
    if (this.tabsAndActionsContainer) {
      let tabsContainerBorderColor = this.getColor(EDITOR_GROUP_HEADER_TABS_BORDER);
      if (!tabsContainerBorderColor && isHighContrast(this.theme.type)) {
        tabsContainerBorderColor = this.getColor(TAB_BORDER) || this.getColor(contrastBorder);
      }
      if (tabsContainerBorderColor) {
        this.tabsAndActionsContainer.classList.add("tabs-border-bottom");
        this.tabsAndActionsContainer.style.setProperty("--tabs-border-bottom-color", tabsContainerBorderColor.toString());
      } else {
        this.tabsAndActionsContainer.classList.remove("tabs-border-bottom");
        this.tabsAndActionsContainer.style.removeProperty("--tabs-border-bottom-color");
      }
    }
    this.forEachTab((editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar) => {
      this.redrawTab(editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar);
    });
    this.updateEditorActionsToolbar();
    this.layout(this.dimensions, options3);
  }
  // Split out from redrawTab() so updateTabActionsForAltState() can refresh just the action items, not a full tab bar redraw.
  redrawTabAction(editor, tabIndex, tabContainer, tabActionBar) {
    const isTabSticky = this.tabsModel.isSticky(tabIndex);
    const isCloseable = !editor.hasCapability(8192 /* CannotClose */);
    const options3 = this.groupsView.partOptions;
    const hasUnpinAction = isTabSticky && options3.tabActionUnpinVisibility;
    const hasCloseAction = isCloseable && !hasUnpinAction && options3.tabActionCloseVisibility;
    const hasAction = hasUnpinAction || hasCloseAction;
    const wantsCloseOthersAction = hasCloseAction && modifierKeyEmitter.keyStatus.altKey && tabIndex === this.hoveredTabIndex;
    this.closeOtherEditorTabsInGroupAction.enabled = this.groupView.count > 1;
    let tabAction;
    if (hasAction) {
      tabAction = hasUnpinAction ? this.unpinEditorAction : wantsCloseOthersAction ? this.closeOtherEditorTabsInGroupAction : this.closeEditorAction;
    } else {
      tabAction = isTabSticky ? this.unpinEditorAction : this.closeEditorAction;
    }
    if (!tabActionBar.hasAction(tabAction)) {
      if (!tabActionBar.isEmpty()) {
        tabActionBar.clear();
      }
      const keybinding = tabAction === this.closeOtherEditorTabsInGroupAction ? isMacintosh ? localize(6766, null) : localize(6765, null) : this.getKeybindingLabel(tabAction);
      tabActionBar.push(tabAction, { icon: true, label: false, keybinding });
    }
    tabContainer.classList.toggle(`pinned-action-off`, isTabSticky && !hasUnpinAction);
    tabContainer.classList.toggle(`close-action-off`, !hasUnpinAction && !hasCloseAction);
    tabContainer.classList.toggle("cannot-close", !isCloseable);
    for (const option2 of ["left", "right"]) {
      tabContainer.classList.toggle(`tab-actions-${option2}`, hasAction && options3.tabActionLocation === option2);
    }
  }
  redrawTab(editor, tabIndex, tabContainer, tabLabelWidget, tabLabel, tabActionBar) {
    const isTabSticky = this.tabsModel.isSticky(tabIndex);
    const options3 = this.groupsView.partOptions;
    this.redrawTabLabel(editor, tabIndex, tabContainer, tabLabelWidget, tabLabel);
    this.redrawTabAction(editor, tabIndex, tabContainer, tabActionBar);
    const tabSizing = isTabSticky && options3.pinnedTabSizing === "shrink" ? "shrink" : options3.tabSizing;
    for (const option2 of ["fit", "shrink", "fixed"]) {
      tabContainer.classList.toggle(`sizing-${option2}`, tabSizing === option2);
    }
    tabContainer.classList.toggle("has-icon", options3.showIcons && options3.hasIcons);
    tabContainer.classList.toggle("sticky", isTabSticky);
    for (const option2 of ["normal", "compact", "shrink"]) {
      tabContainer.classList.toggle(`sticky-${option2}`, isTabSticky && options3.pinnedTabSizing === option2);
    }
    if (!options3.wrapTabs && isTabSticky && options3.pinnedTabSizing !== "normal") {
      tabContainer.style.left = `${tabIndex * this.getStickyTabWidth(options3.pinnedTabSizing)}px`;
    } else {
      tabContainer.style.left = "auto";
    }
    this.redrawTabBorders(tabIndex, tabContainer);
    this.redrawTabSelectedActiveAndDirty(this.groupsView.activeGroup === this.groupView, editor, tabContainer, tabActionBar);
  }
  redrawTabLabel(editor, tabIndex, tabContainer, tabLabelWidget, tabLabel) {
    const options3 = this.groupsView.partOptions;
    let name;
    let namePrefix;
    let forceLabel = false;
    let fileDecorationBadges = Boolean(options3.decorations?.badges);
    const fileDecorationColors = Boolean(options3.decorations?.colors);
    let description;
    if (options3.pinnedTabSizing === "compact" && this.tabsModel.isSticky(tabIndex)) {
      const isShowingIcons = options3.showIcons && options3.hasIcons;
      name = isShowingIcons ? "" : tabLabel.name?.charAt(0).toUpperCase();
      description = "";
      forceLabel = true;
      fileDecorationBadges = false;
    } else {
      name = tabLabel.name;
      namePrefix = options3.showTabIndex ? `${this.toEditorIndex(tabIndex) + 1}: ` : void 0;
      description = tabLabel.description || "";
    }
    if (tabLabel.ariaLabel) {
      tabContainer.setAttribute("aria-label", tabLabel.ariaLabel);
      tabContainer.setAttribute("aria-description", "");
    }
    tabLabelWidget.setResource(
      { name, description, resource: EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: 3 /* BOTH */ }) },
      {
        title: this.getHoverTitle(editor),
        extraClasses: coalesce(["tab-label", fileDecorationBadges ? "tab-label-has-badge" : void 0].concat(editor.getLabelExtraClasses())),
        italic: !this.tabsModel.isPinned(editor),
        forceLabel,
        fileDecorations: {
          colors: fileDecorationColors,
          badges: fileDecorationBadges
        },
        icon: editor.getIcon(),
        hideIcon: options3.showIcons === false,
        namePrefix
      }
    );
    const resource = EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: 1 /* PRIMARY */ });
    if (resource) {
      tabContainer.setAttribute("data-resource-name", basenameOrAuthority(resource));
    } else {
      tabContainer.removeAttribute("data-resource-name");
    }
  }
  redrawTabSelectedActiveAndDirty(isGroupActive, editor, tabContainer, tabActionBar) {
    const isTabActive = this.tabsModel.isActive(editor);
    const hasModifiedBorderTop = this.doRedrawTabDirty(isGroupActive, isTabActive, editor, tabContainer);
    this.doRedrawTabActive(isGroupActive, !hasModifiedBorderTop, editor, tabContainer, tabActionBar);
  }
  doRedrawTabActive(isGroupActive, allowBorderTop, editor, tabContainer, tabActionBar) {
    const isActive2 = this.tabsModel.isActive(editor);
    const isSelected = this.tabsModel.isSelected(editor);
    tabContainer.classList.toggle("active", isActive2);
    tabContainer.classList.toggle("selected", isSelected);
    tabContainer.classList.toggle("multi-selected", isSelected && this.groupView.selectedEditors.length > 1);
    tabContainer.setAttribute("aria-selected", isSelected ? "true" : "false");
    tabContainer.tabIndex = isActive2 ? 0 : -1;
    tabActionBar.setFocusable(isActive2);
    if (isActive2) {
      const activeTabBorderColorBottom = this.getColor(isGroupActive ? TAB_ACTIVE_BORDER : TAB_UNFOCUSED_ACTIVE_BORDER);
      tabContainer.classList.toggle("tab-border-bottom", !!activeTabBorderColorBottom);
      tabContainer.style.setProperty("--tab-border-bottom-color", activeTabBorderColorBottom ?? "");
    }
    let tabBorderColorTop = null;
    if (allowBorderTop) {
      if (isActive2) {
        tabBorderColorTop = this.getColor(isGroupActive ? TAB_ACTIVE_BORDER_TOP : TAB_UNFOCUSED_ACTIVE_BORDER_TOP);
      }
      if (tabBorderColorTop === null && isSelected) {
        tabBorderColorTop = this.getColor(TAB_SELECTED_BORDER_TOP);
      }
    }
    tabContainer.classList.toggle("tab-border-top", !!tabBorderColorTop);
    tabContainer.style.setProperty("--tab-border-top-color", tabBorderColorTop ?? "");
  }
  doRedrawTabDirty(isGroupActive, isTabActive, editor, tabContainer) {
    let hasModifiedBorderColor = false;
    if (editor.isDirty() && !editor.isSaving()) {
      tabContainer.classList.add("dirty");
      if (this.groupsView.partOptions.highlightModifiedTabs) {
        let modifiedBorderColor;
        if (isGroupActive && isTabActive) {
          modifiedBorderColor = this.getColor(TAB_ACTIVE_MODIFIED_BORDER);
        } else if (isGroupActive && !isTabActive) {
          modifiedBorderColor = this.getColor(TAB_INACTIVE_MODIFIED_BORDER);
        } else if (!isGroupActive && isTabActive) {
          modifiedBorderColor = this.getColor(TAB_UNFOCUSED_ACTIVE_MODIFIED_BORDER);
        } else {
          modifiedBorderColor = this.getColor(TAB_UNFOCUSED_INACTIVE_MODIFIED_BORDER);
        }
        if (modifiedBorderColor) {
          hasModifiedBorderColor = true;
          tabContainer.classList.add("dirty-border-top");
          tabContainer.style.setProperty("--tab-dirty-border-top-color", modifiedBorderColor);
        }
      } else {
        tabContainer.classList.remove("dirty-border-top");
        tabContainer.style.removeProperty("--tab-dirty-border-top-color");
      }
    } else {
      tabContainer.classList.remove("dirty", "dirty-border-top");
      tabContainer.style.removeProperty("--tab-dirty-border-top-color");
    }
    return hasModifiedBorderColor;
  }
  redrawTabBorders(tabIndex, tabContainer) {
    const isTabSticky = this.tabsModel.isSticky(tabIndex);
    const isTabLastSticky = isTabSticky && this.tabsModel.stickyCount === tabIndex + 1;
    const showLastStickyTabBorderColor = this.tabsModel.stickyCount !== this.tabsModel.count;
    const borderRightColor = (isTabLastSticky && showLastStickyTabBorderColor ? this.getColor(TAB_LAST_PINNED_BORDER) : void 0) || this.getColor(TAB_BORDER) || this.getColor(contrastBorder);
    tabContainer.style.borderRight = borderRightColor ? `1px solid ${borderRightColor}` : "";
    tabContainer.style.outlineColor = this.getColor(activeContrastBorder) || "";
  }
  prepareEditorActions(editorActions) {
    const isGroupActive = this.groupsView.activeGroup === this.groupView;
    if (isGroupActive) {
      return editorActions;
    } else {
      return {
        primary: this.groupsView.partOptions.alwaysShowEditorActions ? editorActions.primary : editorActions.primary.filter((action) => action.id === UNLOCK_GROUP_COMMAND_ID),
        secondary: editorActions.secondary
      };
    }
  }
  prepareEditorLayoutActions(editorActions) {
    return editorActions;
  }
  getHeight() {
    if (this.dimensions.used) {
      return this.dimensions.used.height;
    } else {
      return this.computeHeight();
    }
  }
  computeHeight() {
    let height;
    if (!this.visible) {
      height = 0;
    } else if (this.groupsView.partOptions.wrapTabs && this.tabsAndActionsContainer?.classList.contains("wrapping")) {
      height = this.tabsAndActionsContainer.offsetHeight;
    } else {
      height = this.tabHeight;
    }
    return height;
  }
  layout(dimensions, options3) {
    Object.assign(this.dimensions, dimensions);
    if (this.visible) {
      if (!this.layoutScheduler.value) {
        const disposable = scheduleAtNextAnimationFrame(getWindow(this.parent), () => {
          this.doLayout(
            this.dimensions,
            this.layoutScheduler.value?.options
            /* ensure to pick up latest options */
          );
          this.layoutScheduler.clear();
        });
        this.layoutScheduler.value = { options: options3, dispose: () => disposable.dispose() };
      }
      if (options3?.forceRevealActiveTab) {
        this.layoutScheduler.value.options = {
          ...this.layoutScheduler.value.options,
          forceRevealActiveTab: true
        };
      }
    }
    if (!this.dimensions.used) {
      this.dimensions.used = new Dimension(dimensions.container.width, this.computeHeight());
    }
    return this.dimensions.used;
  }
  doLayout(dimensions, options3) {
    if (dimensions.container !== Dimension.None && dimensions.available !== Dimension.None) {
      this.doLayoutTabs(dimensions, options3);
    }
    const oldDimension = this.dimensions.used;
    const newDimension = this.dimensions.used = new Dimension(dimensions.container.width, this.computeHeight());
    if (oldDimension && oldDimension.height !== newDimension.height) {
      this.groupView.relayout();
    }
  }
  doLayoutTabs(dimensions, options3) {
    const tabsWrapMultiLine = this.doLayoutTabsWrapping(dimensions);
    if (!tabsWrapMultiLine) {
      this.doLayoutTabsNonWrapping(options3);
    } else {
      assertReturnsDefined(this.stickyTabsBackground).style.width = "0px";
    }
  }
  doLayoutTabsWrapping(dimensions) {
    const [tabsAndActionsContainer, tabsContainer, editorToolbarContainer, tabsScrollbar] = assertReturnsAllDefined(this.tabsAndActionsContainer, this.tabsContainer, this.editorActionsToolbarContainer, this.tabsScrollbar);
    const layoutActionsContainer = this.editorLayoutActionsToolbarContainer;
    const editorToolbarWidth = () => editorToolbarContainer.offsetWidth + (layoutActionsContainer?.offsetWidth ?? 0);
    const didTabsWrapMultiLine = tabsAndActionsContainer.classList.contains("wrapping");
    let tabsWrapMultiLine = didTabsWrapMultiLine;
    function updateTabsWrapping(enabled) {
      tabsWrapMultiLine = enabled;
      tabsAndActionsContainer.classList.toggle("wrapping", tabsWrapMultiLine);
      tabsContainer.style.setProperty("--last-tab-margin-right", tabsWrapMultiLine ? `${editorToolbarWidth()}px` : "0");
      tabsAndActionsContainer.style.setProperty("--last-tab-layout-actions-width", `${layoutActionsContainer?.offsetWidth ?? 0}px`);
      for (const tab of tabsContainer.children) {
        tab.classList.remove("last-in-row");
      }
    }
    if (this.groupsView.partOptions.wrapTabs) {
      const visibleTabsWidth = tabsContainer.offsetWidth;
      const allTabsWidth = tabsContainer.scrollWidth;
      const lastTabFitsWrapped = () => {
        const lastTab = this.getLastTab();
        if (!lastTab) {
          return true;
        }
        const lastTabOverlapWithToolbarWidth = lastTab.offsetWidth + editorToolbarWidth() - dimensions.available.width;
        if (lastTabOverlapWithToolbarWidth > 1) {
          return false;
        }
        return true;
      };
      if (tabsWrapMultiLine || allTabsWidth > visibleTabsWidth && lastTabFitsWrapped()) {
        updateTabsWrapping(true);
      }
      if (tabsWrapMultiLine) {
        if (tabsContainer.offsetHeight > dimensions.available.height || // if height exceeds available height
        allTabsWidth === visibleTabsWidth && tabsContainer.offsetHeight === this.tabHeight || // if wrapping is not needed anymore
        !lastTabFitsWrapped()) {
          updateTabsWrapping(false);
        }
      }
    } else if (didTabsWrapMultiLine) {
      updateTabsWrapping(false);
    }
    if (tabsWrapMultiLine && !didTabsWrapMultiLine) {
      const visibleTabsWidth = tabsContainer.offsetWidth;
      tabsScrollbar.setScrollDimensions({
        width: visibleTabsWidth,
        scrollWidth: visibleTabsWidth
      });
    }
    if (tabsWrapMultiLine) {
      const tabs = /* @__PURE__ */ new Map();
      let currentTabsPosY = void 0;
      let lastTab = void 0;
      for (const child of tabsContainer.children) {
        if (child === this.addTabContainer) {
          continue;
        }
        const tab = child;
        const tabPosY = tab.offsetTop;
        if (tabPosY !== currentTabsPosY) {
          currentTabsPosY = tabPosY;
          if (lastTab) {
            tabs.set(lastTab, true);
          }
        }
        lastTab = tab;
        tabs.set(tab, false);
      }
      if (lastTab) {
        tabs.set(lastTab, true);
      }
      for (const [tab, lastInRow] of tabs) {
        tab.classList.toggle("last-in-row", lastInRow);
      }
    }
    return tabsWrapMultiLine;
  }
  doLayoutTabsNonWrapping(options3) {
    const [tabsContainer, tabsScrollbar] = assertReturnsAllDefined(this.tabsContainer, this.tabsScrollbar);
    const visibleTabsWidth = tabsContainer.offsetWidth;
    const allTabsWidth = tabsContainer.scrollWidth;
    let stickyTabsWidth = 0;
    if (this.tabsModel.stickyCount > 0) {
      const stickyTabWidth = this.getStickyTabWidth(this.groupsView.partOptions.pinnedTabSizing);
      stickyTabsWidth = this.tabsModel.stickyCount * stickyTabWidth;
      for (let tabIndex = 0; tabIndex < this.tabsModel.stickyCount; tabIndex++) {
        const tab = this.getTabAtIndex(tabIndex);
        if (tab) {
          tab.style.left = `${tabIndex * stickyTabWidth}px`;
        }
      }
    }
    const activeTabAndIndex = this.tabsModel.activeEditor ? this.getTabAndIndex(this.tabsModel.activeEditor) : void 0;
    const [activeTab, activeTabIndex] = activeTabAndIndex ?? [void 0, void 0];
    let activeTabPositionStatic = this.groupsView.partOptions.pinnedTabSizing !== "normal" && typeof activeTabIndex === "number" && this.tabsModel.isSticky(activeTabIndex);
    let availableTabsContainerWidth = visibleTabsWidth - stickyTabsWidth;
    if (this.tabsModel.stickyCount > 0 && availableTabsContainerWidth < MultiEditorTabsControl.TAB_WIDTH.fit) {
      tabsContainer.classList.add("disable-sticky-tabs");
      availableTabsContainerWidth = visibleTabsWidth;
      stickyTabsWidth = 0;
      activeTabPositionStatic = false;
    } else {
      tabsContainer.classList.remove("disable-sticky-tabs");
    }
    assertReturnsDefined(this.stickyTabsBackground).style.width = `${stickyTabsWidth}px`;
    let activeTabPosX;
    let activeTabWidth;
    if (!this.blockRevealActiveTab && activeTab) {
      activeTabPosX = activeTab.offsetLeft;
      activeTabWidth = activeTab.offsetWidth;
    }
    const { width: oldVisibleTabsWidth, scrollWidth: oldAllTabsWidth } = tabsScrollbar.getScrollDimensions();
    tabsScrollbar.setScrollDimensions({
      width: visibleTabsWidth,
      scrollWidth: allTabsWidth
    });
    const dimensionsChanged = oldVisibleTabsWidth !== visibleTabsWidth || oldAllTabsWidth !== allTabsWidth;
    if (this.blockRevealActiveTab || // explicitly disabled
    typeof activeTabPosX !== "number" || // invalid dimension
    typeof activeTabWidth !== "number" || // invalid dimension
    activeTabPositionStatic || // static tab (sticky)
    !dimensionsChanged && !options3?.forceRevealActiveTab) {
      this.blockRevealActiveTab = false;
      return;
    }
    const tabsContainerScrollPosX = tabsScrollbar.getScrollPosition().scrollLeft;
    const activeTabFits = activeTabWidth <= availableTabsContainerWidth;
    const adjustedActiveTabPosX = activeTabPosX - stickyTabsWidth;
    if (activeTabFits && tabsContainerScrollPosX + availableTabsContainerWidth < adjustedActiveTabPosX + activeTabWidth) {
      tabsScrollbar.setScrollPosition({
        scrollLeft: tabsContainerScrollPosX + (adjustedActiveTabPosX + activeTabWidth - (tabsContainerScrollPosX + availableTabsContainerWidth))
      });
    } else if (tabsContainerScrollPosX > adjustedActiveTabPosX || !activeTabFits) {
      tabsScrollbar.setScrollPosition({
        scrollLeft: adjustedActiveTabPosX
      });
    }
  }
  getStickyTabWidth(pinnedTabSizing) {
    const hasModernUITabs = Boolean(this.parent.closest(".modern-ui-tabs"));
    switch (pinnedTabSizing) {
      case "compact":
        return hasModernUITabs ? MultiEditorTabsControl.MODERN_UI_COMPACT_PINNED_TAB_WIDTH : MultiEditorTabsControl.TAB_WIDTH.compact;
      case "shrink":
        return MultiEditorTabsControl.TAB_WIDTH.shrink;
      default:
        return 0;
    }
  }
  updateTabsControlVisibility() {
    const tabsAndActionsContainer = assertReturnsDefined(this.tabsAndActionsContainer);
    tabsAndActionsContainer.classList.toggle("empty", !this.visible);
    if (!this.visible && this.dimensions) {
      this.dimensions.used = void 0;
    }
  }
  get visible() {
    return this.tabsModel.count > 0;
  }
  getTabAndIndex(editor) {
    const tabIndex = this.tabsModel.indexOf(editor);
    const tab = this.getTabAtIndex(tabIndex);
    if (tab) {
      return [tab, tabIndex];
    }
    return void 0;
  }
  getTabAtIndex(tabIndex) {
    if (tabIndex >= 0) {
      const tabsContainer = assertReturnsDefined(this.tabsContainer);
      return tabsContainer.children[tabIndex];
    }
    return void 0;
  }
  getLastTab() {
    return this.getTabAtIndex(this.tabsModel.count - 1);
  }
  blockRevealActiveTabOnce() {
    this.blockRevealActiveTab = true;
  }
  originatesFromTabActionBar(e4) {
    let element;
    if (isMouseEvent(e4)) {
      element = e4.target || e4.srcElement;
    } else {
      element = e4.initialTarget;
    }
    return !!findParentWithClass(element, "action-item", "tab");
  }
  async onDrop(e4, targetTabIndex, tabsContainer) {
    EventHelper.stop(e4, true);
    this.updateDropFeedback(tabsContainer, false, e4, targetTabIndex);
    tabsContainer.classList.remove("scroll");
    let targetEditorIndex = this.tabsModel instanceof UnstickyEditorGroupModel ? targetTabIndex + this.groupView.stickyCount : targetTabIndex;
    const options3 = {
      sticky: this.tabsModel instanceof StickyEditorGroupModel && this.tabsModel.stickyCount === targetEditorIndex,
      index: targetEditorIndex
    };
    if (this.groupTransfer.hasData(DraggedEditorGroupIdentifier.prototype)) {
      const data = this.groupTransfer.getData(DraggedEditorGroupIdentifier.prototype);
      if (Array.isArray(data) && data.length > 0) {
        const sourceGroup = this.editorPartsView.getGroup(data[0].identifier);
        if (sourceGroup) {
          const mergeGroupOptions = { index: targetEditorIndex };
          if (!this.isMoveOperation(e4, sourceGroup.id)) {
            mergeGroupOptions.mode = 0 /* COPY_EDITORS */;
          }
          this.groupsView.mergeGroup(sourceGroup, this.groupView, mergeGroupOptions);
        }
        this.groupView.focus();
        this.groupTransfer.clearData(DraggedEditorGroupIdentifier.prototype);
      }
    } else if (this.editorTransfer.hasData(DraggedEditorIdentifier.prototype)) {
      const data = this.editorTransfer.getData(DraggedEditorIdentifier.prototype);
      if (Array.isArray(data) && data.length > 0) {
        const sourceGroup = this.editorPartsView.getGroup(data[0].identifier.groupId);
        if (sourceGroup) {
          for (const de of data) {
            const editor = de.identifier.editor;
            if (sourceGroup.id !== de.identifier.groupId) {
              continue;
            }
            const sourceEditorIndex = sourceGroup.getIndexOfEditor(editor);
            if (sourceGroup === this.groupView && sourceEditorIndex < targetEditorIndex) {
              targetEditorIndex--;
            }
            if (this.isMoveOperation(e4, de.identifier.groupId, editor)) {
              sourceGroup.moveEditor(editor, this.groupView, { ...options3, index: targetEditorIndex });
              if (this.tabsModel instanceof UnstickyEditorGroupModel && this.groupView.isSticky(editor)) {
                this.groupView.unstickEditor(editor);
              }
            } else {
              sourceGroup.copyEditor(editor, this.groupView, { ...options3, index: targetEditorIndex });
            }
            targetEditorIndex++;
          }
        }
      }
      this.groupView.focus();
      this.editorTransfer.clearData(DraggedEditorIdentifier.prototype);
    } else if (this.treeItemsTransfer.hasData(DraggedTreeItemsIdentifier.prototype)) {
      const data = this.treeItemsTransfer.getData(DraggedTreeItemsIdentifier.prototype);
      if (Array.isArray(data) && data.length > 0) {
        const editors = [];
        for (const id2 of data) {
          const dataTransferItem = await this.treeViewsDragAndDropService.removeDragOperationTransfer(id2.identifier);
          if (dataTransferItem) {
            const treeDropData = await extractTreeDropData(dataTransferItem);
            editors.push(...treeDropData.map((editor) => ({ ...editor, options: { ...editor.options, pinned: true, index: targetEditorIndex } })));
          }
        }
        this.editorService.openEditors(editors, this.groupView, { validateTrust: true });
      }
      this.treeItemsTransfer.clearData(DraggedTreeItemsIdentifier.prototype);
    } else {
      const dropHandler = this.instantiationService.createInstance(ResourcesDropHandler, { allowWorkspaceOpen: false });
      dropHandler.handleDrop(e4, getWindow(this.parent), () => this.groupView, () => this.groupView.focus(), options3);
    }
  }
  dispose() {
    super.dispose();
    this.tabDisposables = dispose(this.tabDisposables);
  }
};

MultiEditorTabsControl = __decorateClass([
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IInstantiationService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IKeybindingService),
  __decorateParam(11, INotificationService),
  __decorateParam(12, IQuickInputService),
  __decorateParam(13, IThemeService),
  __decorateParam(14, IEditorService),
  __decorateParam(15, IPathService),
  __decorateParam(16, ITreeViewsDnDService),
  __decorateParam(17, IEditorResolverService),
  __decorateParam(18, IHostService),
  __decorateParam(19, IMenuService)
], MultiEditorTabsControl);

registerThemingParticipant((theme, collector) => {
  const borderColor = theme.getColor(TAB_BORDER);
  if (borderColor) {
    collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title > .tabs-and-actions-container.wrapping .tabs-container > .tab {
				border-bottom: 1px solid ${borderColor};
			}
		`);
  }
  const activeContrastBorderColor = theme.getColor(activeContrastBorder);
  if (activeContrastBorderColor) {
    collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab.active,
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab.active:hover  {
				outline: 1px solid;
				outline-offset: -5px;
			}

			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.selected:not(.active):not(:hover)  {
				outline: 1px dotted;
				outline-offset: -5px;
			}

			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab.active:focus {
				outline-style: dashed;
			}

			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.active {
				outline: 1px dashed;
				outline-offset: -5px;
			}

			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:hover  {
				outline: 1px dashed;
				outline-offset: -5px;
			}

			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.active > .tab-actions .action-label,
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.active:hover > .tab-actions .action-label,
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.dirty > .tab-actions .action-label,
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.sticky > .tab-actions .action-label,
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:hover > .tab-actions .action-label {
				opacity: 1 !important;
			}
		`);
  }
  const contrastBorderColor = theme.getColor(contrastBorder);
  if (contrastBorderColor) {
    collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title .editor-actions {
				outline: 1px solid ${contrastBorderColor}
			}
		`);
  }
  const tabHoverBackground = theme.getColor(TAB_HOVER_BACKGROUND);
  if (tabHoverBackground) {
    collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab:not(.selected):hover {
				background-color: ${tabHoverBackground} !important;
			}
		`);
  }
  const tabUnfocusedHoverBackground = theme.getColor(TAB_UNFOCUSED_HOVER_BACKGROUND);
  if (tabUnfocusedHoverBackground) {
    collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:not(.selected):hover  {
				background-color: ${tabUnfocusedHoverBackground} !important;
			}
		`);
  }
  const tabHoverForeground = theme.getColor(TAB_HOVER_FOREGROUND);
  if (tabHoverForeground) {
    collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab:not(.selected):hover  {
				color: ${tabHoverForeground} !important;
			}
		`);
  }
  const tabUnfocusedHoverForeground = theme.getColor(TAB_UNFOCUSED_HOVER_FOREGROUND);
  if (tabUnfocusedHoverForeground) {
    collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:not(.selected):hover  {
				color: ${tabUnfocusedHoverForeground} !important;
			}
		`);
  }
  const tabHoverBorder = theme.getColor(TAB_HOVER_BORDER);
  if (tabHoverBorder) {
    collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container.active > .title .tabs-container > .tab:hover > .tab-border-bottom-container {
				display: block;
				position: absolute;
				left: 0;
				pointer-events: none;
				width: 100%;
				z-index: 10;
				bottom: 0;
				height: 1px;
				background-color: ${tabHoverBorder};
			}
		`);
  }
  const tabUnfocusedHoverBorder = theme.getColor(TAB_UNFOCUSED_HOVER_BORDER);
  if (tabUnfocusedHoverBorder) {
    collector.addRule(`
			.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab:hover > .tab-border-bottom-container  {
				display: block;
				position: absolute;
				left: 0;
				pointer-events: none;
				width: 100%;
				z-index: 10;
				bottom: 0;
				height: 1px;
				background-color: ${tabUnfocusedHoverBorder};
			}
		`);
  }
  if (!isHighContrast(theme.type) && !isSafari2 && !activeContrastBorderColor) {
    const workbenchBackground = WORKBENCH_BACKGROUND(theme);
    const editorBackgroundColor = theme.getColor(editorBackground);
    const editorGroupHeaderTabsBackground = theme.getColor(EDITOR_GROUP_HEADER_TABS_BACKGROUND);
    const editorDragAndDropBackground = theme.getColor(EDITOR_DRAG_AND_DROP_BACKGROUND);
    let adjustedTabBackground;
    if (editorGroupHeaderTabsBackground && editorBackgroundColor) {
      adjustedTabBackground = editorGroupHeaderTabsBackground.flatten(editorBackgroundColor, editorBackgroundColor, workbenchBackground);
    }
    let adjustedTabDragBackground;
    if (editorGroupHeaderTabsBackground && editorBackgroundColor && editorDragAndDropBackground && editorBackgroundColor) {
      adjustedTabDragBackground = editorGroupHeaderTabsBackground.flatten(editorBackgroundColor, editorDragAndDropBackground, editorBackgroundColor, workbenchBackground);
    }
    const makeTabHoverBackgroundRule = (color2, colorDrag, hasFocus = false) => `
			.monaco-workbench .part.editor > .content:not(.dragged-over) .editor-group-container${hasFocus ? ".active" : ""} > .title .tabs-container > .tab.sizing-shrink:not(.dragged):not(.sticky-compact):hover > .tab-label > .monaco-icon-label-container::after,
			.monaco-workbench .part.editor > .content:not(.dragged-over) .editor-group-container${hasFocus ? ".active" : ""} > .title .tabs-container > .tab.sizing-fixed:not(.dragged):not(.sticky-compact):hover > .tab-label > .monaco-icon-label-container::after {
				background: linear-gradient(to left, ${color2}, transparent) !important;
			}

			.monaco-workbench .part.editor > .content.dragged-over .editor-group-container${hasFocus ? ".active" : ""} > .title .tabs-container > .tab.sizing-shrink:not(.dragged):not(.sticky-compact):hover > .tab-label > .monaco-icon-label-container::after,
			.monaco-workbench .part.editor > .content.dragged-over .editor-group-container${hasFocus ? ".active" : ""} > .title .tabs-container > .tab.sizing-fixed:not(.dragged):not(.sticky-compact):hover > .tab-label > .monaco-icon-label-container::after {
				background: linear-gradient(to left, ${colorDrag}, transparent) !important;
			}
		`;
    if (tabHoverBackground && adjustedTabBackground && adjustedTabDragBackground) {
      const adjustedColor = tabHoverBackground.flatten(adjustedTabBackground);
      const adjustedColorDrag = tabHoverBackground.flatten(adjustedTabDragBackground);
      collector.addRule(makeTabHoverBackgroundRule(adjustedColor, adjustedColorDrag, true));
    }
    if (tabUnfocusedHoverBackground && adjustedTabBackground && adjustedTabDragBackground) {
      const adjustedColor = tabUnfocusedHoverBackground.flatten(adjustedTabBackground);
      const adjustedColorDrag = tabUnfocusedHoverBackground.flatten(adjustedTabDragBackground);
      collector.addRule(makeTabHoverBackgroundRule(adjustedColor, adjustedColorDrag));
    }
    if (editorDragAndDropBackground && adjustedTabDragBackground) {
      const adjustedColorDrag = editorDragAndDropBackground.flatten(adjustedTabDragBackground);
      collector.addRule(`
				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container.active > .title .tabs-container > .tab.sizing-shrink.dragged-over:not(.active):not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after,
				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container:not(.active) > .title .tabs-container > .tab.sizing-shrink.dragged-over:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after,
				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container.active > .title .tabs-container > .tab.sizing-fixed.dragged-over:not(.active):not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after,
				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container:not(.active) > .title .tabs-container > .tab.sizing-fixed.dragged-over:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after {
					background: linear-gradient(to left, ${adjustedColorDrag}, transparent) !important;
				}
		`);
    }
    const makeTabBackgroundRule = (color2, colorDrag, focused, active) => `
				.monaco-workbench .part.editor > .content:not(.dragged-over) .editor-group-container${focused ? ".active" : ":not(.active)"} > .title .tabs-container > .tab.sizing-shrink${active ? ".active" : ""}:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after,
				.monaco-workbench .part.editor > .content:not(.dragged-over) .editor-group-container${focused ? ".active" : ":not(.active)"} > .title .tabs-container > .tab.sizing-fixed${active ? ".active" : ""}:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after {
					background: linear-gradient(to left, ${color2}, transparent);
				}

				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container${focused ? ".active" : ":not(.active)"} > .title .tabs-container > .tab.sizing-shrink${active ? ".active" : ""}:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after,
				.monaco-workbench .part.editor > .content.dragged-over .editor-group-container${focused ? ".active" : ":not(.active)"} > .title .tabs-container > .tab.sizing-fixed${active ? ".active" : ""}:not(.dragged):not(.sticky-compact) > .tab-label > .monaco-icon-label-container::after {
					background: linear-gradient(to left, ${colorDrag}, transparent);
				}
		`;
    const tabActiveBackground = theme.getColor(TAB_ACTIVE_BACKGROUND);
    if (tabActiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
      const adjustedColor = tabActiveBackground.flatten(adjustedTabBackground);
      const adjustedColorDrag = tabActiveBackground.flatten(adjustedTabDragBackground);
      collector.addRule(makeTabBackgroundRule(adjustedColor, adjustedColorDrag, true, true));
    }
    const tabUnfocusedActiveBackground = theme.getColor(TAB_UNFOCUSED_ACTIVE_BACKGROUND);
    if (tabUnfocusedActiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
      const adjustedColor = tabUnfocusedActiveBackground.flatten(adjustedTabBackground);
      const adjustedColorDrag = tabUnfocusedActiveBackground.flatten(adjustedTabDragBackground);
      collector.addRule(makeTabBackgroundRule(adjustedColor, adjustedColorDrag, false, true));
    }
    const tabInactiveBackground = theme.getColor(TAB_INACTIVE_BACKGROUND);
    if (tabInactiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
      const adjustedColor = tabInactiveBackground.flatten(adjustedTabBackground);
      const adjustedColorDrag = tabInactiveBackground.flatten(adjustedTabDragBackground);
      collector.addRule(makeTabBackgroundRule(adjustedColor, adjustedColorDrag, true, false));
    }
    const tabUnfocusedInactiveBackground = theme.getColor(TAB_UNFOCUSED_INACTIVE_BACKGROUND);
    if (tabUnfocusedInactiveBackground && adjustedTabBackground && adjustedTabDragBackground) {
      const adjustedColor = tabUnfocusedInactiveBackground.flatten(adjustedTabBackground);
      const adjustedColorDrag = tabUnfocusedInactiveBackground.flatten(adjustedTabDragBackground);
      collector.addRule(makeTabBackgroundRule(adjustedColor, adjustedColorDrag, false, false));
    }
  }
});
export { modifierKeyEmitter, MultiEditorTabsControl };
