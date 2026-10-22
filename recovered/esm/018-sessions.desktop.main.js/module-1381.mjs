// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/views/viewPaneContainer.ts
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { localize } from "./module-0001.mjs";
import { IThemeService, Themable } from "./module-0287.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { $, DragAndDropObserver, EventType, addDisposableListener, getWindow, isAncestor } from "./module-0075.mjs";
import { DisposableStore, combinedDisposable, toDisposable } from "./module-0012.mjs";
import { PANEL_SECTION_BORDER, PANEL_SECTION_DRAG_AND_DROP_BACKGROUND, PANEL_SECTION_HEADER_BACKGROUND, PANEL_SECTION_HEADER_BORDER, PANEL_SECTION_HEADER_FOREGROUND, SIDE_BAR_DRAG_AND_DROP_BACKGROUND, SIDE_BAR_SECTION_HEADER_BACKGROUND, SIDE_BAR_SECTION_HEADER_BORDER, SIDE_BAR_SECTION_HEADER_FOREGROUND } from "./module-0868.mjs";
import { activeContrastBorder } from "./module-0227.mjs";
import { Component } from "./module-1086.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { PaneView } from "./module-1327.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { ViewContainerMenuActions } from "./module-1333.mjs";
import { CompositeDragAndDropObserver, toggleDropEffect } from "./module-1380.mjs";
import { createActionViewItem } from "./module-0516.mjs";
import { IWorkbenchLayoutService, getFloatingPanelMargin, isHorizontal } from "./module-1119.mjs";
import { asCssVariable } from "./module-0226.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { ILogService } from "./module-0095.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { FocusedViewContext } from "./module-0950.mjs";
import { KeyChord } from "./module-0019.mjs";


// src/vs/workbench/browser/parts/views/viewPaneContainer.ts
var ViewsSubMenu = new MenuId("Views");

MenuRegistry.appendMenuItem(MenuId.ViewContainerTitle, {
  submenu: ViewsSubMenu,
  title: localize(6989, null),
  order: 1
});

var ViewPaneDropOverlay = class _ViewPaneDropOverlay extends Themable {
  constructor(paneElement, orientation, bounds, location2, themeService) {
    super(themeService);
    this.paneElement = paneElement;
    this.orientation = orientation;
    this.bounds = bounds;
    this.location = location2;
    this.cleanupOverlayScheduler = this._register(new RunOnceScheduler(() => this.dispose(), 300));
    this.create();
  }
  static {
    this.OVERLAY_ID = "monaco-pane-drop-overlay";
  }
  get currentDropOperation() {
    return this._currentDropOperation;
  }
  get disposed() {
    return !!this._disposed;
  }
  create() {
    this.container = $("div", { id: _ViewPaneDropOverlay.OVERLAY_ID });
    this.container.style.top = "0px";
    this.paneElement.appendChild(this.container);
    this.paneElement.classList.add("dragged-over");
    this._register(toDisposable(() => {
      this.container.remove();
      this.paneElement.classList.remove("dragged-over");
    }));
    this.overlay = $(".pane-overlay-indicator");
    this.container.appendChild(this.overlay);
    this.registerListeners();
    this.updateStyles();
  }
  updateStyles() {
    this.overlay.style.backgroundColor = this.getColor(this.location === 1 /* Panel */ ? PANEL_SECTION_DRAG_AND_DROP_BACKGROUND : SIDE_BAR_DRAG_AND_DROP_BACKGROUND) || "";
    const activeContrastBorderColor = this.getColor(activeContrastBorder);
    this.overlay.style.outlineColor = activeContrastBorderColor || "";
    this.overlay.style.outlineOffset = activeContrastBorderColor ? "-2px" : "";
    this.overlay.style.outlineStyle = activeContrastBorderColor ? "dashed" : "";
    this.overlay.style.outlineWidth = activeContrastBorderColor ? "2px" : "";
    this.overlay.style.borderColor = activeContrastBorderColor || "";
    this.overlay.style.borderStyle = "solid";
    this.overlay.style.borderWidth = "0px";
  }
  registerListeners() {
    this._register(new DragAndDropObserver(this.container, {
      onDragOver: (e4) => {
        this.positionOverlay(e4.offsetX, e4.offsetY);
        if (this.cleanupOverlayScheduler.isScheduled()) {
          this.cleanupOverlayScheduler.cancel();
        }
      },
      onDragLeave: (e4) => this.dispose(),
      onDragEnd: (e4) => this.dispose(),
      onDrop: (e4) => {
        this.dispose();
      }
    }));
    this._register(addDisposableListener(this.container, EventType.MOUSE_OVER, () => {
      if (!this.cleanupOverlayScheduler.isScheduled()) {
        this.cleanupOverlayScheduler.schedule();
      }
    }));
  }
  positionOverlay(mousePosX, mousePosY) {
    const paneWidth = this.paneElement.clientWidth;
    const paneHeight = this.paneElement.clientHeight;
    const splitWidthThreshold = paneWidth / 2;
    const splitHeightThreshold = paneHeight / 2;
    let dropDirection;
    if (this.orientation === 0 /* VERTICAL */) {
      if (mousePosY < splitHeightThreshold) {
        dropDirection = 0 /* UP */;
      } else if (mousePosY >= splitHeightThreshold) {
        dropDirection = 1 /* DOWN */;
      }
    } else if (this.orientation === 1 /* HORIZONTAL */) {
      if (mousePosX < splitWidthThreshold) {
        dropDirection = 2 /* LEFT */;
      } else if (mousePosX >= splitWidthThreshold) {
        dropDirection = 3 /* RIGHT */;
      }
    }
    switch (dropDirection) {
      case 0 /* UP */:
        this.doPositionOverlay({ top: "0", left: "0", width: "100%", height: "50%" });
        break;
      case 1 /* DOWN */:
        this.doPositionOverlay({ bottom: "0", left: "0", width: "100%", height: "50%" });
        break;
      case 2 /* LEFT */:
        this.doPositionOverlay({ top: "0", left: "0", width: "50%", height: "100%" });
        break;
      case 3 /* RIGHT */:
        this.doPositionOverlay({ top: "0", right: "0", width: "50%", height: "100%" });
        break;
      default: {
        let top2 = "0";
        let left = "0";
        let width2 = "100%";
        let height = "100%";
        if (this.bounds) {
          const boundingRect = this.container.getBoundingClientRect();
          top2 = `${this.bounds.top - boundingRect.top}px`;
          left = `${this.bounds.left - boundingRect.left}px`;
          height = `${this.bounds.bottom - this.bounds.top}px`;
          width2 = `${this.bounds.right - this.bounds.left}px`;
        }
        this.doPositionOverlay({ top: top2, left, width: width2, height });
      }
    }
    if (this.orientation === 0 /* VERTICAL */ && paneHeight <= 25 || this.orientation === 1 /* HORIZONTAL */ && paneWidth <= 25) {
      this.doUpdateOverlayBorder(dropDirection);
    } else {
      this.doUpdateOverlayBorder(void 0);
    }
    this.overlay.style.opacity = "1";
    setTimeout(() => this.overlay.classList.add("overlay-move-transition"), 0);
    this._currentDropOperation = dropDirection;
  }
  doUpdateOverlayBorder(direction) {
    this.overlay.style.borderTopWidth = direction === 0 /* UP */ ? "2px" : "0px";
    this.overlay.style.borderLeftWidth = direction === 2 /* LEFT */ ? "2px" : "0px";
    this.overlay.style.borderBottomWidth = direction === 1 /* DOWN */ ? "2px" : "0px";
    this.overlay.style.borderRightWidth = direction === 3 /* RIGHT */ ? "2px" : "0px";
  }
  doPositionOverlay(options3) {
    this.container.style.height = "100%";
    this.overlay.style.top = options3.top || "";
    this.overlay.style.left = options3.left || "";
    this.overlay.style.bottom = options3.bottom || "";
    this.overlay.style.right = options3.right || "";
    this.overlay.style.width = options3.width;
    this.overlay.style.height = options3.height;
  }
  contains(element) {
    return element === this.container || element === this.overlay;
  }
  dispose() {
    super.dispose();
    this._disposed = true;
  }
};

var ViewPaneContainer = class extends Component {
  constructor(id2, options3, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService, logService) {
    super(id2, themeService, storageService);
    this.options = options3;
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    this.layoutService = layoutService;
    this.contextMenuService = contextMenuService;
    this.telemetryService = telemetryService;
    this.extensionService = extensionService;
    this.storageService = storageService;
    this.contextService = contextService;
    this.viewDescriptorService = viewDescriptorService;
    this.logService = logService;
    this.paneItems = [];
    this.visible = false;
    this.areExtensionsReady = false;
    this.didLayout = false;
    this._onTitleAreaUpdate = this._register(new Emitter());
    this.onTitleAreaUpdate = this._onTitleAreaUpdate.event;
    this._onDidChangeVisibility = this._register(new Emitter());
    this.onDidChangeVisibility = this._onDidChangeVisibility.event;
    this._onDidAddViews = this._register(new Emitter());
    this.onDidAddViews = this._onDidAddViews.event;
    this._onDidRemoveViews = this._register(new Emitter());
    this.onDidRemoveViews = this._onDidRemoveViews.event;
    this._onDidChangeViewVisibility = this._register(new Emitter());
    this.onDidChangeViewVisibility = this._onDidChangeViewVisibility.event;
    this._onDidFocusView = this._register(new Emitter());
    this.onDidFocusView = this._onDidFocusView.event;
    this._onDidBlurView = this._register(new Emitter());
    this.onDidBlurView = this._onDidBlurView.event;
    const container2 = this.viewDescriptorService.getViewContainerById(id2);
    if (!container2) {
      throw new Error("Could not find container");
    }
    this.viewContainer = container2;
    this.visibleViewsStorageId = `${id2}.numberOfVisibleViews`;
    this.visibleViewsCountFromCache = this.storageService.getNumber(this.visibleViewsStorageId, 1 /* WORKSPACE */, void 0);
    this.viewContainerModel = this.viewDescriptorService.getViewContainerModel(container2);
  }
  get onDidSashChange() {
    return assertReturnsDefined(this.paneview).onDidSashChange;
  }
  get panes() {
    return this.paneItems.map((i2) => i2.pane);
  }
  get views() {
    return this.panes;
  }
  get length() {
    return this.paneItems.length;
  }
  get menuActions() {
    return this._menuActions;
  }
  create(parent) {
    const options3 = this.options;
    options3.orientation = this.orientation;
    this.paneview = this._register(new PaneView(parent, this.options));
    if (this._boundarySashes) {
      this.paneview.setBoundarySashes(this._boundarySashes);
    }
    this._register(this.paneview.onDidDrop(({ from, to }) => this.movePane(from, to)));
    this._register(this.paneview.onDidScroll((_) => this.onDidScrollPane()));
    this._register(this.paneview.onDidSashReset((index2) => this.onDidSashReset(index2)));
    this._register(addDisposableListener(parent, EventType.CONTEXT_MENU, (e4) => this.showContextMenu(new StandardMouseEvent(getWindow(parent), e4))));
    this._register(Gesture.addTarget(parent));
    this._register(addDisposableListener(parent, EventType2.Contextmenu, (e4) => this.showContextMenu(new StandardMouseEvent(getWindow(parent), e4))));
    this._menuActions = this._register(this.instantiationService.createInstance(ViewContainerMenuActions, this.paneview.element, this.viewContainer, void 0));
    this._register(this._menuActions.onDidChange(() => this.updateTitleArea()));
    let overlay;
    const getOverlayBounds = () => {
      const fullSize = parent.getBoundingClientRect();
      const lastPane = this.panes[this.panes.length - 1].element.getBoundingClientRect();
      const top2 = this.orientation === 0 /* VERTICAL */ ? lastPane.bottom : fullSize.top;
      const left = this.orientation === 1 /* HORIZONTAL */ ? lastPane.right : fullSize.left;
      return {
        top: top2,
        bottom: fullSize.bottom,
        left,
        right: fullSize.right
      };
    };
    const inBounds = (bounds2, pos) => {
      return pos.x >= bounds2.left && pos.x <= bounds2.right && pos.y >= bounds2.top && pos.y <= bounds2.bottom;
    };
    let bounds;
    if (this.viewDescriptorService.canMoveViews()) {
      this._register(CompositeDragAndDropObserver.INSTANCE.registerTarget(parent, {
        onDragEnter: (e4) => {
          bounds = getOverlayBounds();
          if (overlay?.disposed) {
            overlay = void 0;
          }
          if (!overlay && inBounds(bounds, e4.eventData)) {
            const dropData = e4.dragAndDropData.getData();
            if (dropData.type === "view") {
              const oldViewContainer = this.viewDescriptorService.getViewContainerByViewId(dropData.id);
              const viewDescriptor3 = this.viewDescriptorService.getViewDescriptorById(dropData.id);
              if (oldViewContainer !== this.viewContainer && (!viewDescriptor3 || !viewDescriptor3.canMoveView || this.viewContainer.rejectAddedViews)) {
                return;
              }
              overlay = new ViewPaneDropOverlay(parent, void 0, bounds, this.viewDescriptorService.getViewContainerLocation(this.viewContainer), this.themeService);
            }
            if (dropData.type === "composite" && dropData.id !== this.viewContainer.id) {
              const container2 = this.viewDescriptorService.getViewContainerById(dropData.id);
              const viewsToMove = this.viewDescriptorService.getViewContainerModel(container2).allViewDescriptors;
              if (!viewsToMove.some((v2) => !v2.canMoveView) && viewsToMove.length > 0) {
                overlay = new ViewPaneDropOverlay(parent, void 0, bounds, this.viewDescriptorService.getViewContainerLocation(this.viewContainer), this.themeService);
              }
            }
          }
        },
        onDragOver: (e4) => {
          if (overlay?.disposed) {
            overlay = void 0;
          }
          if (overlay && !inBounds(bounds, e4.eventData)) {
            overlay.dispose();
            overlay = void 0;
          }
          if (inBounds(bounds, e4.eventData)) {
            toggleDropEffect(e4.eventData.dataTransfer, "move", overlay !== void 0);
          }
        },
        onDragLeave: (e4) => {
          overlay?.dispose();
          overlay = void 0;
        },
        onDrop: (e4) => {
          if (overlay) {
            const dropData = e4.dragAndDropData.getData();
            const viewsToMove = [];
            if (dropData.type === "composite" && dropData.id !== this.viewContainer.id) {
              const container2 = this.viewDescriptorService.getViewContainerById(dropData.id);
              const allViews = this.viewDescriptorService.getViewContainerModel(container2).allViewDescriptors;
              if (!allViews.some((v2) => !v2.canMoveView)) {
                viewsToMove.push(...allViews);
              }
            } else if (dropData.type === "view") {
              const oldViewContainer = this.viewDescriptorService.getViewContainerByViewId(dropData.id);
              const viewDescriptor3 = this.viewDescriptorService.getViewDescriptorById(dropData.id);
              if (oldViewContainer !== this.viewContainer && viewDescriptor3?.canMoveView) {
                this.viewDescriptorService.moveViewsToContainer([viewDescriptor3], this.viewContainer, void 0, "dnd");
              }
            }
            const paneCount = this.panes.length;
            if (viewsToMove.length > 0) {
              this.viewDescriptorService.moveViewsToContainer(viewsToMove, this.viewContainer, void 0, "dnd");
            }
            if (paneCount > 0) {
              for (const view of viewsToMove) {
                const paneToMove = this.panes.find((p) => p.id === view.id);
                if (paneToMove) {
                  this.movePane(paneToMove, this.panes[this.panes.length - 1]);
                }
              }
            }
          }
          overlay?.dispose();
          overlay = void 0;
        }
      }));
    }
    this._register(this.onDidSashChange(() => this.saveViewSizes()));
    this._register(this.viewContainerModel.onDidAddVisibleViewDescriptors((added) => this.onDidAddViewDescriptors(added)));
    this._register(this.viewContainerModel.onDidRemoveVisibleViewDescriptors((removed) => this.onDidRemoveViewDescriptors(removed)));
    const addedViews = this.viewContainerModel.visibleViewDescriptors.map((viewDescriptor3, index2) => {
      const size3 = this.viewContainerModel.getSize(viewDescriptor3.id);
      const collapsed2 = this.viewContainerModel.isCollapsed(viewDescriptor3.id);
      return { viewDescriptor: viewDescriptor3, index: index2, size: size3, collapsed: collapsed2 };
    });
    if (addedViews.length) {
      this.onDidAddViewDescriptors(addedViews);
    }
    this.extensionService.whenInstalledExtensionsRegistered().then(() => {
      this.areExtensionsReady = true;
      if (this.panes.length) {
        this.updateTitleArea();
        this.updateViewHeaders();
      }
      this._register(this.configurationService.onDidChangeConfiguration((e4) => {
        if (e4.affectsConfiguration("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */)) {
          this.updateViewHeaders();
        }
      }));
    });
    this._register(this.viewContainerModel.onDidChangeActiveViewDescriptors(() => this._onTitleAreaUpdate.fire()));
  }
  getTitle() {
    const containerTitle = this.viewContainerModel.title;
    if (this.isViewMergedWithContainer()) {
      const singleViewPaneContainerTitle = this.paneItems[0].pane.singleViewPaneContainerTitle;
      if (singleViewPaneContainerTitle) {
        return singleViewPaneContainerTitle;
      }
      const paneItemTitle = this.paneItems[0].pane.title;
      if (containerTitle === paneItemTitle) {
        return paneItemTitle;
      }
      return paneItemTitle ? `${containerTitle}: ${paneItemTitle}` : containerTitle;
    }
    return containerTitle;
  }
  showContextMenu(event) {
    for (const paneItem of this.paneItems) {
      if (isAncestor(event.target, paneItem.pane.element)) {
        return;
      }
    }
    event.stopPropagation();
    event.preventDefault();
    this.contextMenuService.showContextMenu({
      getAnchor: () => event,
      getActions: () => this.menuActions?.getContextMenuActions() ?? []
    });
  }
  getActionsContext() {
    if (this.isViewMergedWithContainer()) {
      return this.panes[0].getActionsContext();
    }
    return void 0;
  }
  getActionViewItem(action, options3) {
    if (this.isViewMergedWithContainer()) {
      return this.paneItems[0].pane.createActionViewItem(action, options3);
    }
    return createActionViewItem(this.instantiationService, action, options3);
  }
  focus() {
    let paneToFocus = void 0;
    if (this.lastFocusedPane) {
      paneToFocus = this.lastFocusedPane;
    } else if (this.paneItems.length > 0) {
      for (const { pane } of this.paneItems) {
        if (pane.isExpanded()) {
          paneToFocus = pane;
          break;
        }
      }
    }
    if (paneToFocus) {
      paneToFocus.focus();
    }
  }
  get orientation() {
    switch (this.viewDescriptorService.getViewContainerLocation(this.viewContainer)) {
      case 0 /* Sidebar */:
      case 2 /* AuxiliaryBar */:
        return 0 /* VERTICAL */;
      case 1 /* Panel */: {
        return isHorizontal(this.layoutService.getPanelPosition()) ? 1 /* HORIZONTAL */ : 0 /* VERTICAL */;
      }
    }
    return 0 /* VERTICAL */;
  }
  layout(dimension) {
    if (this.paneview) {
      if (this.paneview.orientation !== this.orientation) {
        this.paneview.flipOrientation(dimension.height, dimension.width);
      }
      const bottomGap = !this.layoutService.isFloatingPanelsEnabled() ? 0 : this.viewDescriptorService.getViewContainerLocation(this.viewContainer) === 1 /* Panel */ && this.layoutService.getPanelPosition() === 3 /* TOP */ ? 1 : getFloatingPanelMargin(this.layoutService) + 1;
      this.paneview.layout(Math.max(0, dimension.height - bottomGap), dimension.width);
    }
    this.dimension = dimension;
    if (this.didLayout) {
      this.saveViewSizes();
    } else {
      this.didLayout = true;
      this.restoreViewSizes();
    }
  }
  setBoundarySashes(sashes) {
    this._boundarySashes = sashes;
    this.paneview?.setBoundarySashes(sashes);
  }
  getOptimalWidth() {
    const additionalMargin = 16;
    const optimalWidth = Math.max(...this.panes.map((view) => view.getOptimalWidth() || 0));
    return optimalWidth + additionalMargin;
  }
  addPanes(panes) {
    const wasMerged = this.isViewMergedWithContainer();
    for (const { pane, size: size3, index: index2, disposable } of panes) {
      this.addPane(pane, size3, disposable, index2);
    }
    this.updateViewHeaders();
    if (this.isViewMergedWithContainer() !== wasMerged) {
      this.updateTitleArea();
    }
    this._onDidAddViews.fire(panes.map(({ pane }) => pane));
  }
  setVisible(visible) {
    if (this.visible !== !!visible) {
      this.visible = visible;
      this._onDidChangeVisibility.fire(visible);
    }
    this.panes.filter((view) => view.isVisible() !== visible).map((view) => view.setVisible(visible));
  }
  isVisible() {
    return this.visible;
  }
  updateTitleArea() {
    this._onTitleAreaUpdate.fire();
  }
  createView(viewDescriptor3, options3) {
    return this.instantiationService.createInstance(viewDescriptor3.ctorDescriptor.ctor, ...viewDescriptor3.ctorDescriptor.staticArguments || [], options3);
  }
  getView(id2) {
    return this.panes.filter((view) => view.id === id2)[0];
  }
  saveViewSizes() {
    if (this.didLayout) {
      this.viewContainerModel.setSizes(this.panes.map((view) => ({ id: view.id, size: this.getPaneSize(view) })));
    }
  }
  restoreViewSizes() {
    if (this.didLayout) {
      let initialSizes;
      for (const viewDescriptor3 of this.viewContainerModel.visibleViewDescriptors) {
        const pane = this.getView(viewDescriptor3.id);
        if (!pane) {
          continue;
        }
        const size3 = this.viewContainerModel.getSize(viewDescriptor3.id);
        if (typeof size3 === "number") {
          this.resizePane(pane, size3);
        } else {
          initialSizes = initialSizes ? initialSizes : this.computeInitialSizes();
          this.resizePane(pane, initialSizes.get(pane.id) || 200);
        }
      }
    }
  }
  computeInitialSizes() {
    const sizes = /* @__PURE__ */ new Map();
    if (this.dimension) {
      const totalWeight = this.viewContainerModel.visibleViewDescriptors.reduce((totalWeight2, { weight: weight5 }) => totalWeight2 + (weight5 || 20), 0);
      for (const viewDescriptor3 of this.viewContainerModel.visibleViewDescriptors) {
        if (this.orientation === 0 /* VERTICAL */) {
          sizes.set(viewDescriptor3.id, this.dimension.height * (viewDescriptor3.weight || 20) / totalWeight);
        } else {
          sizes.set(viewDescriptor3.id, this.dimension.width * (viewDescriptor3.weight || 20) / totalWeight);
        }
      }
    }
    return sizes;
  }
  saveState() {
    this.panes.forEach((view) => view.saveState());
    this.storageService.store(this.visibleViewsStorageId, this.length, 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  onContextMenu(event, viewPane) {
    event.stopPropagation();
    event.preventDefault();
    const actions = viewPane.menuActions.getContextMenuActions();
    this.contextMenuService.showContextMenu({
      getAnchor: () => event,
      getActions: () => actions
    });
  }
  openView(id2, focus) {
    let view = this.getView(id2);
    if (!view) {
      this.toggleViewVisibility(id2);
    }
    view = this.getView(id2);
    if (view) {
      view.setExpanded(true);
      if (focus) {
        view.focus();
      }
    }
    return view;
  }
  onDidAddViewDescriptors(added) {
    const panesToAdd = [];
    for (const { viewDescriptor: viewDescriptor3, collapsed: collapsed2, index: index2, size: size3 } of added) {
      const pane = this.createView(
        viewDescriptor3,
        {
          id: viewDescriptor3.id,
          title: viewDescriptor3.name.value,
          fromExtensionId: viewDescriptor3.extensionId,
          expanded: !collapsed2,
          singleViewPaneContainerTitle: viewDescriptor3.singleViewPaneContainerTitle
        }
      );
      try {
        pane.render();
      } catch (error) {
        this.logService.error(`Fail to render view ${viewDescriptor3.id}`, error);
        continue;
      }
      if (pane.draggableElement) {
        const contextMenuDisposable = addDisposableListener(pane.draggableElement, "contextmenu", (e4) => {
          e4.stopPropagation();
          e4.preventDefault();
          this.onContextMenu(new StandardMouseEvent(getWindow(pane.draggableElement), e4), pane);
        });
        const collapseDisposable = Event2.latch(Event2.map(pane.onDidChange, () => !pane.isExpanded()))((collapsed3) => {
          this.viewContainerModel.setCollapsed(viewDescriptor3.id, collapsed3);
        });
        panesToAdd.push({ pane, size: size3 || pane.minimumSize, index: index2, disposable: combinedDisposable(contextMenuDisposable, collapseDisposable) });
      }
    }
    this.addPanes(panesToAdd);
    this.restoreViewSizes();
    const panes = [];
    for (const { pane } of panesToAdd) {
      pane.setVisible(this.isVisible());
      panes.push(pane);
    }
    return panes;
  }
  onDidRemoveViewDescriptors(removed) {
    removed = removed.sort((a, b) => b.index - a.index);
    const panesToRemove = [];
    for (const { index: index2 } of removed) {
      const paneItem = this.paneItems[index2];
      if (paneItem) {
        panesToRemove.push(this.paneItems[index2].pane);
      }
    }
    if (panesToRemove.length) {
      this.removePanes(panesToRemove);
      for (const pane of panesToRemove) {
        pane.setVisible(false);
      }
    }
  }
  toggleViewVisibility(viewId) {
    if (this.viewContainerModel.activeViewDescriptors.some((viewDescriptor3) => viewDescriptor3.id === viewId)) {
      const visible = !this.viewContainerModel.isVisible(viewId);
      this.viewContainerModel.setVisible(viewId, visible);
    }
  }
  addPane(pane, size3, disposable, index2 = this.paneItems.length - 1) {
    const onDidFocus = pane.onDidFocus(() => {
      this._onDidFocusView.fire(pane);
      this.lastFocusedPane = pane;
    });
    const onDidBlur = pane.onDidBlur(() => this._onDidBlurView.fire(pane));
    const onDidChangeTitleArea = pane.onDidChangeTitleArea(() => {
      if (this.isViewMergedWithContainer()) {
        this.updateTitleArea();
      }
    });
    const onDidChangeVisibility = pane.onDidChangeBodyVisibility(() => this._onDidChangeViewVisibility.fire(pane));
    const onDidChange = pane.onDidChange(() => {
      if (pane === this.lastFocusedPane && !pane.isExpanded()) {
        this.lastFocusedPane = void 0;
      }
    });
    const isPanel = this.viewDescriptorService.getViewContainerLocation(this.viewContainer) === 1 /* Panel */;
    pane.style({
      headerForeground: asCssVariable(isPanel ? PANEL_SECTION_HEADER_FOREGROUND : SIDE_BAR_SECTION_HEADER_FOREGROUND),
      headerBackground: asCssVariable(isPanel ? PANEL_SECTION_HEADER_BACKGROUND : SIDE_BAR_SECTION_HEADER_BACKGROUND),
      headerBorder: asCssVariable(isPanel ? PANEL_SECTION_HEADER_BORDER : SIDE_BAR_SECTION_HEADER_BORDER),
      dropBackground: asCssVariable(isPanel ? PANEL_SECTION_DRAG_AND_DROP_BACKGROUND : SIDE_BAR_DRAG_AND_DROP_BACKGROUND),
      leftBorder: isPanel ? asCssVariable(PANEL_SECTION_BORDER) : void 0
    });
    const store = new DisposableStore();
    store.add(disposable);
    store.add(combinedDisposable(pane, onDidFocus, onDidBlur, onDidChangeTitleArea, onDidChange, onDidChangeVisibility));
    const paneItem = { pane, disposable: store };
    this.paneItems.splice(index2, 0, paneItem);
    assertReturnsDefined(this.paneview).addPane(pane, size3, index2);
    let overlay;
    if (this.viewDescriptorService.canMoveViews()) {
      if (pane.draggableElement) {
        store.add(CompositeDragAndDropObserver.INSTANCE.registerDraggable(pane.draggableElement, () => {
          return { type: "view", id: pane.id };
        }, {}));
      }
      store.add(CompositeDragAndDropObserver.INSTANCE.registerTarget(pane.dropTargetElement, {
        onDragEnter: (e4) => {
          if (!overlay) {
            const dropData = e4.dragAndDropData.getData();
            if (dropData.type === "view" && dropData.id !== pane.id) {
              const oldViewContainer = this.viewDescriptorService.getViewContainerByViewId(dropData.id);
              const viewDescriptor3 = this.viewDescriptorService.getViewDescriptorById(dropData.id);
              if (oldViewContainer !== this.viewContainer && (!viewDescriptor3 || !viewDescriptor3.canMoveView || this.viewContainer.rejectAddedViews)) {
                return;
              }
              overlay = new ViewPaneDropOverlay(pane.dropTargetElement, this.orientation ?? 0 /* VERTICAL */, void 0, this.viewDescriptorService.getViewContainerLocation(this.viewContainer), this.themeService);
            }
            if (dropData.type === "composite" && dropData.id !== this.viewContainer.id && !this.viewContainer.rejectAddedViews) {
              const container2 = this.viewDescriptorService.getViewContainerById(dropData.id);
              const viewsToMove = this.viewDescriptorService.getViewContainerModel(container2).allViewDescriptors;
              if (!viewsToMove.some((v2) => !v2.canMoveView) && viewsToMove.length > 0) {
                overlay = new ViewPaneDropOverlay(pane.dropTargetElement, this.orientation ?? 0 /* VERTICAL */, void 0, this.viewDescriptorService.getViewContainerLocation(this.viewContainer), this.themeService);
              }
            }
          }
        },
        onDragOver: (e4) => {
          toggleDropEffect(e4.eventData.dataTransfer, "move", overlay !== void 0);
        },
        onDragLeave: (e4) => {
          overlay?.dispose();
          overlay = void 0;
        },
        onDrop: (e4) => {
          if (overlay) {
            const dropData = e4.dragAndDropData.getData();
            const viewsToMove = [];
            let anchorView;
            if (dropData.type === "composite" && dropData.id !== this.viewContainer.id && !this.viewContainer.rejectAddedViews) {
              const container2 = this.viewDescriptorService.getViewContainerById(dropData.id);
              const allViews = this.viewDescriptorService.getViewContainerModel(container2).allViewDescriptors;
              if (allViews.length > 0 && !allViews.some((v2) => !v2.canMoveView)) {
                viewsToMove.push(...allViews);
                anchorView = allViews[0];
              }
            } else if (dropData.type === "view") {
              const oldViewContainer = this.viewDescriptorService.getViewContainerByViewId(dropData.id);
              const viewDescriptor3 = this.viewDescriptorService.getViewDescriptorById(dropData.id);
              if (oldViewContainer !== this.viewContainer && viewDescriptor3 && viewDescriptor3.canMoveView && !this.viewContainer.rejectAddedViews) {
                viewsToMove.push(viewDescriptor3);
              }
              if (viewDescriptor3) {
                anchorView = viewDescriptor3;
              }
            }
            if (viewsToMove) {
              this.viewDescriptorService.moveViewsToContainer(viewsToMove, this.viewContainer, void 0, "dnd");
            }
            if (anchorView) {
              if (overlay.currentDropOperation === 1 /* DOWN */ || overlay.currentDropOperation === 3 /* RIGHT */) {
                const fromIndex = this.panes.findIndex((p) => p.id === anchorView.id);
                let toIndex = this.panes.findIndex((p) => p.id === pane.id);
                if (fromIndex >= 0 && toIndex >= 0) {
                  if (fromIndex > toIndex) {
                    toIndex++;
                  }
                  if (toIndex < this.panes.length && toIndex !== fromIndex) {
                    this.movePane(this.panes[fromIndex], this.panes[toIndex]);
                  }
                }
              }
              if (overlay.currentDropOperation === 0 /* UP */ || overlay.currentDropOperation === 2 /* LEFT */) {
                const fromIndex = this.panes.findIndex((p) => p.id === anchorView.id);
                let toIndex = this.panes.findIndex((p) => p.id === pane.id);
                if (fromIndex >= 0 && toIndex >= 0) {
                  if (fromIndex < toIndex) {
                    toIndex--;
                  }
                  if (toIndex >= 0 && toIndex !== fromIndex) {
                    this.movePane(this.panes[fromIndex], this.panes[toIndex]);
                  }
                }
              }
              if (viewsToMove.length > 1) {
                viewsToMove.slice(1).forEach((view) => {
                  let toIndex = this.panes.findIndex((p) => p.id === anchorView.id);
                  const fromIndex = this.panes.findIndex((p) => p.id === view.id);
                  if (fromIndex >= 0 && toIndex >= 0) {
                    if (fromIndex > toIndex) {
                      toIndex++;
                    }
                    if (toIndex < this.panes.length && toIndex !== fromIndex) {
                      this.movePane(this.panes[fromIndex], this.panes[toIndex]);
                      anchorView = view;
                    }
                  }
                });
              }
            }
          }
          overlay?.dispose();
          overlay = void 0;
        }
      }));
    }
  }
  removePanes(panes) {
    const wasMerged = this.isViewMergedWithContainer();
    panes.forEach((pane) => this.removePane(pane));
    this.updateViewHeaders();
    if (wasMerged !== this.isViewMergedWithContainer()) {
      this.updateTitleArea();
    }
    this._onDidRemoveViews.fire(panes);
  }
  removePane(pane) {
    const index2 = this.paneItems.findIndex((i2) => i2.pane === pane);
    if (index2 === -1) {
      return;
    }
    if (this.lastFocusedPane === pane) {
      this.lastFocusedPane = void 0;
    }
    assertReturnsDefined(this.paneview).removePane(pane);
    const [paneItem] = this.paneItems.splice(index2, 1);
    paneItem.disposable.dispose();
  }
  movePane(from, to) {
    const fromIndex = this.paneItems.findIndex((item) => item.pane === from);
    const toIndex = this.paneItems.findIndex((item) => item.pane === to);
    const fromViewDescriptor = this.viewContainerModel.visibleViewDescriptors[fromIndex];
    const toViewDescriptor = this.viewContainerModel.visibleViewDescriptors[toIndex];
    if (fromIndex < 0 || fromIndex >= this.paneItems.length) {
      return;
    }
    if (toIndex < 0 || toIndex >= this.paneItems.length) {
      return;
    }
    const [paneItem] = this.paneItems.splice(fromIndex, 1);
    this.paneItems.splice(toIndex, 0, paneItem);
    assertReturnsDefined(this.paneview).movePane(from, to);
    this.viewContainerModel.move(fromViewDescriptor.id, toViewDescriptor.id);
    this.updateTitleArea();
  }
  resizePane(pane, size3) {
    assertReturnsDefined(this.paneview).resizePane(pane, size3);
  }
  getPaneSize(pane) {
    return assertReturnsDefined(this.paneview).getPaneSize(pane);
  }
  updateViewHeaders() {
    if (this.isViewMergedWithContainer()) {
      if (this.paneItems[0].pane.isExpanded()) {
        this.lastMergedCollapsedPane = void 0;
      } else {
        this.lastMergedCollapsedPane = this.paneItems[0].pane;
        this.paneItems[0].pane.setExpanded(true);
      }
      this.paneItems[0].pane.headerVisible = false;
      this.paneItems[0].pane.collapsible = true;
    } else {
      if (this.paneItems.length === 1) {
        this.paneItems[0].pane.headerVisible = true;
        if (this.paneItems[0].pane === this.lastMergedCollapsedPane) {
          this.paneItems[0].pane.setExpanded(false);
        }
        this.paneItems[0].pane.collapsible = false;
      } else {
        this.paneItems.forEach((i2) => {
          i2.pane.headerVisible = true;
          i2.pane.collapsible = true;
          if (i2.pane === this.lastMergedCollapsedPane) {
            i2.pane.setExpanded(false);
          }
        });
      }
      this.lastMergedCollapsedPane = void 0;
    }
  }
  isViewMergedWithContainer() {
    if (!(this.options.mergeViewWithContainerWhenSingleView && this.paneItems.length === 1)) {
      return false;
    }
    if (!this.areExtensionsReady) {
      if (this.visibleViewsCountFromCache === void 0) {
        return this.paneItems[0].pane.isExpanded();
      }
      return this.visibleViewsCountFromCache === 1;
    }
    return true;
  }
  onDidScrollPane() {
    for (const pane of this.panes) {
      pane.onDidScrollRoot();
    }
  }
  onDidSashReset(index2) {
    let firstPane = void 0;
    let secondPane = void 0;
    for (let i2 = index2; i2 >= 0; i2--) {
      if (this.paneItems[i2].pane?.isVisible() && this.paneItems[i2]?.pane.isExpanded()) {
        firstPane = this.paneItems[i2].pane;
        break;
      }
    }
    for (let i2 = index2 + 1; i2 < this.paneItems.length; i2++) {
      if (this.paneItems[i2].pane?.isVisible() && this.paneItems[i2]?.pane.isExpanded()) {
        secondPane = this.paneItems[i2].pane;
        break;
      }
    }
    if (firstPane && secondPane) {
      const firstPaneSize = this.getPaneSize(firstPane);
      const secondPaneSize = this.getPaneSize(secondPane);
      const newFirstPaneSize = Math.ceil((firstPaneSize + secondPaneSize) / 2);
      const newSecondPaneSize = Math.floor((firstPaneSize + secondPaneSize) / 2);
      if (firstPaneSize > secondPaneSize) {
        this.resizePane(firstPane, newFirstPaneSize);
        this.resizePane(secondPane, newSecondPaneSize);
      } else {
        this.resizePane(secondPane, newSecondPaneSize);
        this.resizePane(firstPane, newFirstPaneSize);
      }
    }
  }
  dispose() {
    super.dispose();
    this.paneItems.forEach((i2) => i2.disposable.dispose());
    if (this.paneview) {
      this.paneview.dispose();
    }
  }
};

ViewPaneContainer = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IWorkbenchLayoutService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, IExtensionService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IStorageService),
  __decorateParam(10, IWorkspaceContextService),
  __decorateParam(11, IViewDescriptorService),
  __decorateParam(12, ILogService)
], ViewPaneContainer);

var ViewPaneContainerAction = class extends Action2 {
  constructor(desc) {
    super(desc);
    this.desc = desc;
  }
  run(accessor, ...args2) {
    const viewPaneContainer = accessor.get(IViewsService).getActiveViewPaneContainerWithId(this.desc.viewPaneContainerId);
    if (viewPaneContainer) {
      return this.runInViewPaneContainer(accessor, viewPaneContainer, ...args2);
    }
    return void 0;
  }
};

var MoveViewPosition = class extends Action2 {
  constructor(desc, offset) {
    super(desc);
    this.offset = offset;
  }
  async run(accessor) {
    const viewDescriptorService = accessor.get(IViewDescriptorService);
    const contextKeyService = accessor.get(IContextKeyService);
    const viewId = FocusedViewContext.getValue(contextKeyService);
    if (viewId === void 0) {
      return;
    }
    const viewContainer = viewDescriptorService.getViewContainerByViewId(viewId);
    const model = viewDescriptorService.getViewContainerModel(viewContainer);
    const viewDescriptor3 = model.visibleViewDescriptors.find((vd) => vd.id === viewId);
    const currentIndex = model.visibleViewDescriptors.indexOf(viewDescriptor3);
    if (currentIndex + this.offset < 0 || currentIndex + this.offset >= model.visibleViewDescriptors.length) {
      return;
    }
    const newPosition = model.visibleViewDescriptors[currentIndex + this.offset];
    model.move(viewDescriptor3.id, newPosition.id);
  }
};

registerAction2(
  class MoveViewUp extends MoveViewPosition {
    constructor() {
      super({
        id: "views.moveViewUp",
        title: localize(6988, null),
        keybinding: {
          primary: KeyChord(2048 /* CtrlCmd */ + 41 /* KeyK */, 16 /* UpArrow */),
          weight: 200 /* WorkbenchContrib */ + 1,
          when: FocusedViewContext.notEqualsTo("")
        }
      }, -1);
    }
  }
);

registerAction2(
  class MoveViewLeft extends MoveViewPosition {
    constructor() {
      super({
        id: "views.moveViewLeft",
        title: localize(6986, null),
        keybinding: {
          primary: KeyChord(2048 /* CtrlCmd */ + 41 /* KeyK */, 15 /* LeftArrow */),
          weight: 200 /* WorkbenchContrib */ + 1,
          when: FocusedViewContext.notEqualsTo("")
        }
      }, -1);
    }
  }
);

registerAction2(
  class MoveViewDown extends MoveViewPosition {
    constructor() {
      super({
        id: "views.moveViewDown",
        title: localize(6985, null),
        keybinding: {
          primary: KeyChord(2048 /* CtrlCmd */ + 41 /* KeyK */, 18 /* DownArrow */),
          weight: 200 /* WorkbenchContrib */ + 1,
          when: FocusedViewContext.notEqualsTo("")
        }
      }, 1);
    }
  }
);

registerAction2(
  class MoveViewRight extends MoveViewPosition {
    constructor() {
      super({
        id: "views.moveViewRight",
        title: localize(6987, null),
        keybinding: {
          primary: KeyChord(2048 /* CtrlCmd */ + 41 /* KeyK */, 17 /* RightArrow */),
          weight: 200 /* WorkbenchContrib */ + 1,
          when: FocusedViewContext.notEqualsTo("")
        }
      }, 1);
    }
  }
);

registerAction2(class MoveViews extends Action2 {
  constructor() {
    super({
      id: "vscode.moveViews",
      title: localize(6990, null)
    });
  }
  async run(accessor, options3) {
    if (!Array.isArray(options3?.viewIds) || typeof options3?.destinationId !== "string") {
      return Promise.reject("Invalid arguments");
    }
    const viewDescriptorService = accessor.get(IViewDescriptorService);
    const destination = viewDescriptorService.getViewContainerById(options3.destinationId);
    if (!destination) {
      return;
    }
    for (const viewId of options3.viewIds) {
      const viewDescriptor3 = viewDescriptorService.getViewDescriptorById(viewId);
      if (viewDescriptor3?.canMoveView) {
        viewDescriptorService.moveViewsToContainer([viewDescriptor3], destination, 0 /* Default */, this.desc.id);
      }
    }
    await accessor.get(IViewsService).openViewContainer(destination.id, true);
  }
});
export { ViewsSubMenu, ViewPaneDropOverlay, ViewPaneContainer, ViewPaneContainerAction, MoveViewPosition };
