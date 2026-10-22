// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/paneCompositePart.ts
import { CompositePart } from "./module-1599.mjs";
import { Registry } from "./module-0090.mjs";
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { $, Dimension, EventHelper, EventType, addDisposableListener, getWindow, prepend, scheduleAtNextAnimationFrame, trackFocus } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { EDITOR_DRAG_AND_DROP_BACKGROUND } from "./module-0912.mjs";
import { CompositeDragAndDropObserver, toggleDropEffect } from "./module-1381.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { PaneCompositeBar } from "./module-1601.mjs";
import { DeferredPromise } from "./module-0036.mjs";
import { IWorkbenchLayoutService, getFloatingOuterGutterEdges, getFloatingPaneCompositeHorizontalMargins, getFloatingPaneCompositeVerticalMargins, getFloatingPaneCompositeVerticalOuterEdges } from "./module-1118.mjs";
import { ViewsSubMenu } from "./module-1382.mjs";
import { getActionBarActions } from "./module-0516.mjs";
import { SubmenuAction } from "./module-0082.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IMenuService } from "./module-0092.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/browser/parts/paneCompositePart.ts
var AbstractPaneCompositePart = class extends CompositePart {
  constructor(partId, partOptions, activePaneCompositeSettingsKey, activePaneContextKey, paneFocusContextKey, nameForTelemetry, compositeCSSClass, titleForegroundColor, titleBorderColor, location2, registryId, globalActionsMenuId, notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, menuService, configurationService) {
    super(
      notificationService,
      storageService,
      contextMenuService,
      layoutService,
      keybindingService,
      hoverService,
      instantiationService,
      themeService,
      Registry.as(registryId),
      activePaneCompositeSettingsKey,
      viewDescriptorService.getDefaultViewContainer(location2)?.id || "",
      nameForTelemetry,
      compositeCSSClass,
      titleForegroundColor,
      titleBorderColor,
      partId,
      partOptions
    );
    this.partId = partId;
    this.activePaneContextKey = activePaneContextKey;
    this.paneFocusContextKey = paneFocusContextKey;
    this.location = location2;
    this.registryId = registryId;
    this.globalActionsMenuId = globalActionsMenuId;
    this.viewDescriptorService = viewDescriptorService;
    this.contextKeyService = contextKeyService;
    this.extensionService = extensionService;
    this.menuService = menuService;
    this.configurationService = configurationService;
    this.onDidPaneCompositeClose = this.onDidCompositeClose.event;
    this.headerFooterCompositeBarDispoables = this._register(new DisposableStore());
    this.paneCompositeBar = this._register(new MutableDisposable());
    this.pendingCompositeBarLayout = this._register(new MutableDisposable());
    this.compositeBarPosition = void 0;
    this.blockOpening = void 0;
    this.registerListeners();
  }
  static {
    this.MIN_COMPOSITE_BAR_WIDTH = 50;
  }
  get snap() {
    return this.layoutService.isVisible(this.partId) || !!this.paneCompositeBar.value?.getVisiblePaneCompositeIds().length;
  }
  get onDidPaneCompositeOpen() {
    return Event2.map(this.onDidCompositeOpen.event, (compositeEvent) => compositeEvent.composite);
  }
  registerListeners() {
    this._register(this.onDidPaneCompositeOpen((composite) => this.onDidOpen(composite)));
    this._register(this.onDidPaneCompositeClose(this.onDidClose, this));
    this._register(this.registry.onDidDeregister((viewletDescriptor) => {
      const activeContainers = this.viewDescriptorService.getViewContainersByLocation(this.location).filter((container3) => this.viewDescriptorService.getViewContainerModel(container3).activeViewDescriptors.length > 0);
      if (activeContainers.length) {
        if (this.getActiveComposite()?.getId() === viewletDescriptor.id) {
          const defaultViewletId = this.viewDescriptorService.getDefaultViewContainer(this.location)?.id;
          const containerToOpen = activeContainers.filter((c) => c.id === defaultViewletId)[0] || activeContainers[0];
          this.doOpenPaneComposite(containerToOpen.id);
        }
      } else {
        this.layoutService.setPartHidden(true, this.partId);
      }
      this.removeComposite(viewletDescriptor.id);
    }));
    this._register(this.extensionService.onDidRegisterExtensions(() => {
      this.layoutCompositeBar();
    }));
  }
  onDidOpen(composite) {
    const compositeId = composite.getId();
    this.activePaneContextKey.set(compositeId);
    this.element.dataset.activeComposite = compositeId;
  }
  onDidClose(composite) {
    const id2 = composite.getId();
    if (this.activePaneContextKey.get() === id2) {
      this.activePaneContextKey.reset();
      delete this.element.dataset.activeComposite;
    }
  }
  showComposite(composite) {
    super.showComposite(composite);
    this.layoutCompositeBar();
    this.layoutEmptyMessage();
  }
  hideActiveComposite() {
    const composite = super.hideActiveComposite();
    this.layoutCompositeBar();
    this.layoutEmptyMessage();
    return composite;
  }
  create(parent) {
    this.element = parent;
    this.element.classList.add("pane-composite-part");
    super.create(parent);
    if (this.contentArea) {
      this.createEmptyPaneMessage(this.contentArea);
    }
    this.updateCompositeBar();
    const focusTracker = this._register(trackFocus(parent));
    this._register(focusTracker.onDidFocus(() => this.paneFocusContextKey.set(true)));
    this._register(focusTracker.onDidBlur(() => this.paneFocusContextKey.set(false)));
  }
  createEmptyPaneMessage(parent) {
    this.emptyPaneMessageElement = $(".empty-pane-message-area");
    const messageElement = $(".empty-pane-message");
    messageElement.textContent = localize(6864, null);
    this.emptyPaneMessageElement.appendChild(messageElement);
    parent.appendChild(this.emptyPaneMessageElement);
    const setDropBackgroundFeedback = (visible) => {
      const updateActivityBarBackground = !this.getActiveComposite() || !visible;
      const backgroundColor = visible ? this.theme.getColor(EDITOR_DRAG_AND_DROP_BACKGROUND)?.toString() || "" : "";
      if (this.titleContainer && updateActivityBarBackground) {
        this.titleContainer.style.backgroundColor = backgroundColor;
      }
      if (this.headerFooterCompositeBarContainer && updateActivityBarBackground) {
        this.headerFooterCompositeBarContainer.style.backgroundColor = backgroundColor;
      }
      this.emptyPaneMessageElement.style.backgroundColor = backgroundColor;
    };
    if (this.viewDescriptorService.canMoveViews()) {
      this._register(CompositeDragAndDropObserver.INSTANCE.registerTarget(this.element, {
        onDragOver: (e) => {
          EventHelper.stop(e.eventData, true);
          if (this.paneCompositeBar.value) {
            const validDropTarget = this.paneCompositeBar.value.dndHandler.onDragEnter(e.dragAndDropData, void 0, e.eventData);
            toggleDropEffect(e.eventData.dataTransfer, "move", validDropTarget);
          }
        },
        onDragEnter: (e) => {
          EventHelper.stop(e.eventData, true);
          if (this.paneCompositeBar.value) {
            const validDropTarget = this.paneCompositeBar.value.dndHandler.onDragEnter(e.dragAndDropData, void 0, e.eventData);
            setDropBackgroundFeedback(validDropTarget);
          }
        },
        onDragLeave: (e) => {
          EventHelper.stop(e.eventData, true);
          setDropBackgroundFeedback(false);
        },
        onDragEnd: (e) => {
          EventHelper.stop(e.eventData, true);
          setDropBackgroundFeedback(false);
        },
        onDrop: (e) => {
          EventHelper.stop(e.eventData, true);
          setDropBackgroundFeedback(false);
          if (this.paneCompositeBar.value) {
            this.paneCompositeBar.value.dndHandler.drop(e.dragAndDropData, void 0, e.eventData);
          } else {
            const dragData = e.dragAndDropData.getData();
            if (dragData.type === "composite") {
              const currentContainer = this.viewDescriptorService.getViewContainerById(dragData.id);
              this.viewDescriptorService.moveViewContainerToLocation(currentContainer, this.location, void 0, "dnd");
              this.openPaneComposite(currentContainer.id, true);
            } else if (dragData.type === "view") {
              const viewToMove = this.viewDescriptorService.getViewDescriptorById(dragData.id);
              if (viewToMove.canMoveView) {
                this.viewDescriptorService.moveViewToLocation(viewToMove, this.location, "dnd");
                const newContainer = this.viewDescriptorService.getViewContainerByViewId(viewToMove.id);
                this.openPaneComposite(newContainer.id, true).then((composite) => {
                  composite?.openView(viewToMove.id, true);
                });
              }
            }
          }
        }
      }));
    }
  }
  createTitleArea(parent) {
    const titleArea = super.createTitleArea(parent);
    if (!titleArea) {
      return void 0;
    }
    this._register(addDisposableListener(titleArea, EventType.CONTEXT_MENU, (e) => {
      this.onTitleAreaContextMenu(new StandardMouseEvent(getWindow(titleArea), e));
    }));
    this._register(Gesture.addTarget(titleArea));
    this._register(addDisposableListener(titleArea, EventType2.Contextmenu, (e) => {
      this.onTitleAreaContextMenu(new StandardMouseEvent(getWindow(titleArea), e));
    }));
    const globalTitleActionsContainer = titleArea.appendChild($(".global-actions"));
    this.globalToolBar = this._register(this.instantiationService.createInstance(
      MenuWorkbenchToolBar,
      globalTitleActionsContainer,
      this.globalActionsMenuId,
      {
        actionViewItemProvider: (action, options3) => this.actionViewItemProvider(action, options3),
        orientation: 0 /* HORIZONTAL */,
        getKeyBinding: (action) => this.keybindingService.lookupKeybinding(action.id),
        anchorAlignmentProvider: () => this.getTitleAreaDropDownAnchorAlignment(),
        toggleMenuTitle: localize(6863, null),
        hoverDelegate: this.toolbarHoverDelegate,
        hiddenItemStrategy: -1 /* NoHide */,
        highlightToggledItems: true,
        telemetrySource: this.nameForTelemetry
      }
    ));
    return titleArea;
  }
  createTitleLabel(parent) {
    this.titleContainer = parent;
    const titleLabel = super.createTitleLabel(parent);
    this.titleLabelElement.draggable = this.viewDescriptorService.canMoveViews();
    const draggedItemProvider = () => {
      const activeViewlet = this.getActivePaneComposite();
      return { type: "composite", id: activeViewlet.getId() };
    };
    this._register(CompositeDragAndDropObserver.INSTANCE.registerDraggable(this.titleLabelElement, draggedItemProvider, {}));
    return titleLabel;
  }
  updateCompositeBar(updateCompositeBarOption = false) {
    const wasCompositeBarVisible = this.compositeBarPosition !== void 0;
    const isCompositeBarVisible = this.shouldShowCompositeBar();
    const previousPosition = this.compositeBarPosition;
    const newPosition = isCompositeBarVisible ? this.getCompositeBarPosition() : void 0;
    if (!updateCompositeBarOption && previousPosition === newPosition) {
      return;
    }
    if (wasCompositeBarVisible) {
      const previousCompositeBarContainer = previousPosition === 1 /* TITLE */ ? this.titleContainer : this.headerFooterCompositeBarContainer;
      if (!this.paneCompositeBarContainer || !this.paneCompositeBar.value || !previousCompositeBarContainer) {
        throw new Error("Composite bar containers should exist when removing the previous composite bar");
      }
      this.paneCompositeBarContainer.remove();
      this.paneCompositeBarContainer = void 0;
      this.paneCompositeBar.value = void 0;
      previousCompositeBarContainer.classList.remove("has-composite-bar");
      if (previousPosition === 0 /* TOP */) {
        this.removeFooterHeaderArea(true);
      } else if (previousPosition === 2 /* BOTTOM */) {
        this.removeFooterHeaderArea(false);
      }
    }
    let newCompositeBarContainer;
    switch (newPosition) {
      case 0 /* TOP */:
        newCompositeBarContainer = this.createHeaderArea();
        break;
      case 1 /* TITLE */:
        newCompositeBarContainer = this.titleContainer;
        break;
      case 2 /* BOTTOM */:
        newCompositeBarContainer = this.createFooterArea();
        break;
    }
    if (isCompositeBarVisible) {
      if (this.paneCompositeBarContainer || this.paneCompositeBar.value || !newCompositeBarContainer) {
        throw new Error("Invalid composite bar state when creating the new composite bar");
      }
      newCompositeBarContainer.classList.add("has-composite-bar");
      this.paneCompositeBarContainer = prepend(newCompositeBarContainer, $(".composite-bar-container"));
      this.paneCompositeBar.value = this.createCompositeBar();
      this.paneCompositeBar.value.create(this.paneCompositeBarContainer);
      if (newPosition === 0 /* TOP */) {
        this.setHeaderArea(newCompositeBarContainer);
      } else if (newPosition === 2 /* BOTTOM */) {
        this.setFooterArea(newCompositeBarContainer);
      }
    }
    this.compositeBarPosition = newPosition;
    if (updateCompositeBarOption) {
      this.layoutCompositeBar();
    }
  }
  createHeaderArea() {
    const headerArea = super.createHeaderArea();
    return this.createHeaderFooterCompositeBarArea(headerArea);
  }
  createFooterArea() {
    const footerArea = super.createFooterArea();
    return this.createHeaderFooterCompositeBarArea(footerArea);
  }
  createHeaderFooterCompositeBarArea(area) {
    if (this.headerFooterCompositeBarContainer) {
      throw new Error("Header or Footer composite bar already exists");
    }
    this.headerFooterCompositeBarContainer = area;
    this.headerFooterCompositeBarDispoables.add(addDisposableListener(area, EventType.CONTEXT_MENU, (e) => {
      this.onCompositeBarAreaContextMenu(new StandardMouseEvent(getWindow(area), e));
    }));
    this.headerFooterCompositeBarDispoables.add(Gesture.addTarget(area));
    this.headerFooterCompositeBarDispoables.add(addDisposableListener(area, EventType2.Contextmenu, (e) => {
      this.onCompositeBarAreaContextMenu(new StandardMouseEvent(getWindow(area), e));
    }));
    return area;
  }
  removeFooterHeaderArea(header2) {
    this.headerFooterCompositeBarContainer = void 0;
    this.headerFooterCompositeBarDispoables.clear();
    if (header2) {
      this.removeHeaderArea();
    } else {
      this.removeFooterArea();
    }
  }
  createCompositeBar() {
    return this.instantiationService.createInstance(PaneCompositeBar, this.location, this.getCompositeBarOptions(), this.partId, this);
  }
  onTitleAreaUpdate(compositeId) {
    super.onTitleAreaUpdate(compositeId);
    if (!this.pendingCompositeBarLayout.value) {
      this.pendingCompositeBarLayout.value = scheduleAtNextAnimationFrame(getWindow(this.element), () => {
        this.pendingCompositeBarLayout.clear();
        this.layoutCompositeBar();
      });
    }
  }
  async openPaneComposite(id2, focus) {
    if (typeof id2 === "string" && this.getPaneComposite(id2)) {
      return this.doOpenPaneComposite(id2, focus);
    }
    await this.extensionService.whenInstalledExtensionsRegistered();
    if (typeof id2 === "string" && this.getPaneComposite(id2)) {
      return this.doOpenPaneComposite(id2, focus);
    }
    return void 0;
  }
  async doOpenPaneComposite(id2, focus) {
    if (this.blockOpening) {
      return this.blockOpening.p;
    }
    let blockOpening;
    if (!this.layoutService.isVisible(this.partId)) {
      try {
        blockOpening = this.blockOpening = new DeferredPromise();
        this.layoutService.setPartHidden(false, this.partId);
      } finally {
        this.blockOpening = void 0;
      }
    }
    try {
      const result = this.openComposite(id2, focus);
      blockOpening?.complete(result);
      return result;
    } catch (error) {
      blockOpening?.error(error);
      throw error;
    }
  }
  getPaneComposite(id2) {
    return this.registry.getPaneComposite(id2);
  }
  getPaneComposites() {
    return this.registry.getPaneComposites().sort((v1, v2) => {
      if (typeof v1.order !== "number") {
        return 1;
      }
      if (typeof v2.order !== "number") {
        return -1;
      }
      return v1.order - v2.order;
    });
  }
  getPinnedPaneCompositeIds() {
    return this.paneCompositeBar.value?.getPinnedPaneCompositeIds() ?? [];
  }
  getVisiblePaneCompositeIds() {
    return this.paneCompositeBar.value?.getVisiblePaneCompositeIds() ?? [];
  }
  getPaneCompositeIds() {
    return this.paneCompositeBar.value?.getPaneCompositeIds() ?? [];
  }
  getActivePaneComposite() {
    return this.getActiveComposite();
  }
  getLastActivePaneCompositeId() {
    return this.getLastActiveCompositeId();
  }
  hideActivePaneComposite() {
    if (this.layoutService.isVisible(this.partId)) {
      this.layoutService.setPartHidden(true, this.partId);
    }
    this.hideActiveComposite();
  }
  focusCompositeBar() {
    this.paneCompositeBar.value?.focus();
  }
  layout(width2, height, top2, left) {
    if (!this.layoutService.isVisible(this.partId)) {
      return;
    }
    this.floatingLayoutDimension = new Dimension(width2, height);
    const floatingInset = this.getFloatingInset();
    if (floatingInset.width > 0 || floatingInset.height > 0) {
      width2 = Math.max(0, width2 - floatingInset.width);
      height = Math.max(0, height - floatingInset.height);
    }
    this.contentDimension = new Dimension(width2, height);
    const outerGutter = this.getFloatingOuterGutterEdges();
    const verticalOuterEdges = getFloatingPaneCompositeVerticalOuterEdges(this.layoutService, this.partId, getWindow(this.element));
    this.element.classList.toggle("floating-part-outer-left", outerGutter.left);
    this.element.classList.toggle("floating-part-outer-right", outerGutter.right);
    this.element.classList.toggle("floating-part-outer-top", verticalOuterEdges.top);
    this.element.classList.toggle("floating-part-outer-bottom", verticalOuterEdges.bottom);
    if (this.partId === "workbench.parts.panel" /* PANEL_PART */) {
      const workbenchContainer = this.layoutService.getContainer(getWindow(this.element));
      workbenchContainer.classList.toggle("floating-panel-outer-left", outerGutter.left);
      workbenchContainer.classList.toggle("floating-panel-outer-right", outerGutter.right);
    }
    super.layout(this.contentDimension.width, this.contentDimension.height, top2, left);
    this.layoutCompositeBar();
    this.layoutEmptyMessage();
  }
  /**
   * The horizontal cluster edges on which this part is the outermost floating card and
   * therefore adopts the density-specific outer gutter. Applies
   * to the primary side bar, the secondary side bar and the panel; a horizontal panel
   * can own both edges at once.
   */
  getFloatingOuterGutterEdges() {
    return getFloatingOuterGutterEdges(this.layoutService, this.partId);
  }
  getRelayoutDimension() {
    return this.floatingLayoutDimension ?? super.getRelayoutDimension();
  }
  /**
   * Amount (in pixels) to subtract from each axis when the floating panels
   * experiment is enabled: a margin on each side plus a 1px border on each side
   * (the border is drawn inside the box, as `.monaco-workbench .part` is
   * `box-sizing: border-box` in `part.css`). On each cluster edge this part is the outermost
   * floating card on (see {@link getFloatingOuterGutterEdges}) it gets the outer
   * margin, so its width inset is larger on that side.
   */
  getFloatingInset() {
    if (!this.layoutService.isFloatingPanelsEnabled()) {
      return { width: 0, height: 0 };
    }
    const borderTotal = 2;
    const { top: top2, bottom } = getFloatingPaneCompositeVerticalMargins(this.layoutService, this.partId, getWindow(this.element));
    const { left, right } = getFloatingPaneCompositeHorizontalMargins(this.layoutService, this.partId);
    return {
      width: left + right + borderTotal,
      height: top2 + bottom + borderTotal
    };
  }
  layoutCompositeBar() {
    this.pendingCompositeBarLayout.clear();
    if (this.contentDimension && this.dimension && this.paneCompositeBar.value) {
      const padding = this.compositeBarPosition === 1 /* TITLE */ ? 16 : 8;
      const borderWidth = this.partId === "workbench.parts.panel" /* PANEL_PART */ ? 0 : 1;
      let availableWidth = this.contentDimension.width - padding - borderWidth;
      availableWidth = Math.max(AbstractPaneCompositePart.MIN_COMPOSITE_BAR_WIDTH, availableWidth - this.getToolbarWidth());
      this.paneCompositeBar.value.layout(availableWidth, this.dimension.height);
    }
  }
  layoutEmptyMessage() {
    const visible = !this.getActiveComposite();
    this.element.classList.toggle("empty", visible);
    if (visible) {
      this.titleLabel?.updateTitle("", "");
    }
  }
  getToolbarWidth() {
    if (!this.toolBar || this.compositeBarPosition !== 1 /* TITLE */) {
      return 0;
    }
    const activePane = this.getActivePaneComposite();
    if (!activePane) {
      return 0;
    }
    const toolBarWidth = this.toolBar.getItemsWidth() + this.toolBar.getItemsLength() * 4;
    const globalToolBarWidth = this.globalToolBar ? this.globalToolBar.getItemsWidth() + this.globalToolBar.getItemsLength() * 4 : 0;
    return toolBarWidth + globalToolBarWidth + 8;
  }
  onTitleAreaContextMenu(event) {
    if (this.shouldShowCompositeBar() && this.getCompositeBarPosition() === 1 /* TITLE */) {
      return this.onCompositeBarContextMenu(event);
    } else {
      const activePaneComposite = this.getActivePaneComposite();
      const activePaneCompositeActions = activePaneComposite ? activePaneComposite.getContextMenuActions() : [];
      if (activePaneCompositeActions.length) {
        this.contextMenuService.showContextMenu({
          getAnchor: () => event,
          getActions: () => activePaneCompositeActions,
          getActionViewItem: (action, options3) => this.actionViewItemProvider(action, options3),
          actionRunner: activePaneComposite.getActionRunner(),
          skipTelemetry: true
        });
      }
    }
  }
  onCompositeBarAreaContextMenu(event) {
    return this.onCompositeBarContextMenu(event);
  }
  onCompositeBarContextMenu(event) {
    if (this.paneCompositeBar.value) {
      const actions = [...this.paneCompositeBar.value.getContextMenuActions()];
      if (actions.length) {
        this.contextMenuService.showContextMenu({
          getAnchor: () => event,
          getActions: () => actions,
          skipTelemetry: true
        });
      }
    }
  }
  getViewsSubmenuAction() {
    const viewPaneContainer = this.getActivePaneComposite()?.getViewPaneContainer();
    if (viewPaneContainer) {
      const disposables = new DisposableStore();
      const scopedContextKeyService = disposables.add(this.contextKeyService.createScoped(this.element));
      scopedContextKeyService.createKey("viewContainer", viewPaneContainer.viewContainer.id);
      const menu = this.menuService.getMenuActions(ViewsSubMenu, scopedContextKeyService, { shouldForwardArgs: true, renderShortTitle: true });
      const viewsActions = getActionBarActions(menu, () => true).primary;
      disposables.dispose();
      return viewsActions.length > 1 && viewsActions.some((a) => a.enabled) ? new SubmenuAction("views", localize(6865, null), viewsActions) : void 0;
    }
    return void 0;
  }
};

AbstractPaneCompositePart = __decorateClass([
  __decorateParam(12, INotificationService),
  __decorateParam(13, IStorageService),
  __decorateParam(14, IContextMenuService),
  __decorateParam(15, IWorkbenchLayoutService),
  __decorateParam(16, IKeybindingService),
  __decorateParam(17, IHoverService),
  __decorateParam(18, IInstantiationService),
  __decorateParam(19, IThemeService),
  __decorateParam(20, IViewDescriptorService),
  __decorateParam(21, IContextKeyService),
  __decorateParam(22, IExtensionService),
  __decorateParam(23, IMenuService),
  __decorateParam(24, IConfigurationService)
], AbstractPaneCompositePart);
export { AbstractPaneCompositePart };
