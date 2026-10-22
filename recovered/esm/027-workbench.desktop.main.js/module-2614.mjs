// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugFlowChartView.ts
import { $, EventType, addDisposableListener, append, clearNode, getWindow, hide, isAncestorOfActiveElement, show } from "./module-0075.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { BreadcrumbsWidget } from "./module-1573.mjs";
import { Codicon } from "./module-0085.mjs";
import { defaultBreadcrumbsWidgetStyles, defaultButtonStyles } from "./module-0513.mjs";
import { TextBreadcrumbItem, setupBreadcrumbKeyboardNavigation } from "./module-2595.mjs";
import { bindFilterContextKeys } from "./module-2597.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { FilterWidget } from "./module-1333.mjs";
import { localize } from "./module-0001.mjs";
import { ChatDebugDetailPanel } from "./module-2610.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { LocalChatSessionUri } from "./module-0961.mjs";
import { buildFlowGraph, filterFlowNodes, mergeDiscoveryNodes, mergeToolCallNodes, sliceFlowNodes } from "./module-2612.mjs";
import { layoutFlowGraph, renderFlowChartSVG } from "./module-2613.mjs";
import { Button } from "./module-0546.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0972.mjs";
import { IChatDebugService } from "./module-1456.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugFlowChartView.ts
var $79 = $;

var MIN_SCALE = 0.1;

var MAX_SCALE = 5;

var ZOOM_STEP = 0.15;

var WHEEL_ZOOM_FACTOR = 2e-3;

var CLICK_THRESHOLD_SQ = 25;

var PAGE_SIZE3 = 100;

var ChatDebugFlowChartView = class extends Disposable {
  constructor(parent, filterState, chatService, chatDebugService, contextKeyService, instantiationService) {
    super();
    this.filterState = filterState;
    this.chatService = chatService;
    this.chatDebugService = chatDebugService;
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    this._onNavigate = this._register(new Emitter());
    this.onNavigate = this._onNavigate.event;
    this.loadDisposables = this._register(new DisposableStore());
    // Pan/zoom state
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.isPanning = false;
    this.startX = 0;
    this.startY = 0;
    // Click detection (distinguish click from drag)
    this.mouseDownX = 0;
    this.mouseDownY = 0;
    this.lastEventCount = 0;
    this.hasUserPanned = false;
    // Collapse state — persists across refreshes, resets on session change
    this.collapsedNodeIds = /* @__PURE__ */ new Set();
    // Expanded merged-discovery nodes — persists across refreshes, resets on session change
    this.expandedMergedIds = /* @__PURE__ */ new Set();
    // Pagination state
    this.visibleLimit = PAGE_SIZE3;
    this.eventById = /* @__PURE__ */ new Map();
    this.container = append(parent, $79(".chat-debug-flowchart"));
    hide(this.container);
    const breadcrumbContainer = append(this.container, $79(".chat-debug-breadcrumb"));
    this.breadcrumbWidget = this._register(new BreadcrumbsWidget(breadcrumbContainer, 3, void 0, Codicon.chevronRight, defaultBreadcrumbsWidgetStyles));
    this._register(setupBreadcrumbKeyboardNavigation(breadcrumbContainer, this.breadcrumbWidget));
    this._register(this.breadcrumbWidget.onDidSelectItem((e) => {
      if (e.type === "select" && e.item instanceof TextBreadcrumbItem) {
        this.breadcrumbWidget.setSelection(void 0);
        const items = this.breadcrumbWidget.getItems();
        const idx = items.indexOf(e.item);
        if (idx === 0) {
          this._onNavigate.fire("home" /* Home */);
        } else if (idx === 1) {
          this._onNavigate.fire("overview" /* Overview */);
        }
      }
    }));
    this.headerContainer = append(this.container, $79(".chat-debug-editor-header"));
    const headerContainer = this.headerContainer;
    const scopedContextKeyService = this._register(this.contextKeyService.createScoped(headerContainer));
    const syncContextKeys = bindFilterContextKeys(this.filterState, scopedContextKeyService);
    syncContextKeys();
    const childInstantiationService = this._register(this.instantiationService.createChild(
      new ServiceCollection([IContextKeyService, scopedContextKeyService])
    ));
    this.filterWidget = this._register(childInstantiationService.createInstance(FilterWidget, {
      placeholder: localize(10599, null),
      ariaLabel: localize(10596, null)
    }));
    const filterContainer = append(headerContainer, $79(".viewpane-filter-container"));
    filterContainer.appendChild(this.filterWidget.element);
    this._register(this.filterWidget.onDidChangeFilterText((text2) => {
      this.filterState.setTextFilter(text2);
    }));
    this._register(this.filterState.onDidChange(() => {
      syncContextKeys();
      this.filterWidget.checkMoreFilters(!this.filterState.isAllFiltersDefault());
      this.visibleLimit = PAGE_SIZE3;
      this.hasUserPanned = false;
      this.lastEventCount = 0;
      this.load();
    }));
    const contentWrapper = append(this.container, $79(".chat-debug-flowchart-content-wrapper"));
    this.content = append(contentWrapper, $79(".chat-debug-flowchart-content"));
    this.detailPanel = this._register(this.instantiationService.createInstance(ChatDebugDetailPanel, contentWrapper));
    this.setupPanZoom();
    this.setupKeyboard();
    this.refreshScheduler = this._register(new RunOnceScheduler(() => this.load(), 100));
  }
  setSession(sessionResource) {
    if (!this.currentSessionResource || this.currentSessionResource.toString() !== sessionResource.toString()) {
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
      this.lastEventCount = 0;
      this.hasUserPanned = false;
      this.focusedElementId = void 0;
      this.collapsedNodeIds.clear();
      this.expandedMergedIds.clear();
      this.visibleLimit = PAGE_SIZE3;
      this.detailPanel.hide();
    }
    this.currentSessionResource = sessionResource;
  }
  show() {
    show(this.container);
    this.load();
  }
  hide() {
    hide(this.container);
    this.refreshScheduler.cancel();
  }
  refresh() {
    if (this.container.style.display !== "none") {
      if (!this.refreshScheduler.isScheduled()) {
        this.refreshScheduler.schedule();
      }
    }
  }
  updateBreadcrumb() {
    if (!this.currentSessionResource) {
      return;
    }
    const sessionTitle = this.chatService.getSessionTitle(this.currentSessionResource) || LocalChatSessionUri.parseLocalSessionId(this.currentSessionResource) || this.currentSessionResource.toString();
    this.breadcrumbWidget.setItems([
      new TextBreadcrumbItem(localize(10602, null), true),
      new TextBreadcrumbItem(sessionTitle, true),
      new TextBreadcrumbItem(localize(10595, null))
    ]);
  }
  load() {
    const hadFocus = isAncestorOfActiveElement(this.content);
    clearNode(this.content);
    this.loadDisposables.clear();
    this.updateBreadcrumb();
    const events = this.chatDebugService.getEvents(this.currentSessionResource);
    const isFirstLoad = this.lastEventCount === 0;
    this.lastEventCount = events.length;
    this.eventById.clear();
    for (const e of events) {
      if (e.id) {
        this.eventById.set(e.id, e);
      }
    }
    if (events.length === 0) {
      const emptyMsg = append(this.content, $79(".chat-debug-flowchart-empty"));
      emptyMsg.textContent = localize(10597, null);
      return;
    }
    const flowNodes = buildFlowGraph(events);
    const filtered = filterFlowNodes(flowNodes, {
      isKindVisible: (kind, category11) => this.filterState.isKindVisible(kind, category11),
      textFilter: this.filterState.textFilter
    });
    if (filtered.length === 0) {
      const emptyMsg = append(this.content, $79(".chat-debug-flowchart-empty"));
      emptyMsg.textContent = localize(10598, null);
      return;
    }
    const slice = sliceFlowNodes(filtered, this.visibleLimit);
    const merged = mergeToolCallNodes(mergeDiscoveryNodes(slice.nodes));
    const layout2 = layoutFlowGraph(merged, { collapsedIds: this.collapsedNodeIds, expandedMergedIds: this.expandedMergedIds });
    this.renderResult = renderFlowChartSVG(layout2);
    this.svgWrapper = append(this.content, $79(".chat-debug-flowchart-svg-wrapper"));
    this.svgWrapper.appendChild(this.renderResult.svg);
    this.svgElement = this.renderResult.svg;
    if (slice.shownCount < slice.totalCount) {
      const remaining = slice.totalCount - slice.shownCount;
      const showMoreContainer = append(this.svgWrapper, $79(".chat-debug-flowchart-show-more"));
      const showMoreBtn = this.loadDisposables.add(new Button(showMoreContainer, { ...defaultButtonStyles, secondary: true, title: localize(10601, null) }));
      showMoreBtn.label = localize(10600, null, remaining);
      this.loadDisposables.add(showMoreBtn.onDidClick(() => {
        this.visibleLimit += PAGE_SIZE3;
        this.load();
      }));
    }
    if (isFirstLoad && !this.hasUserPanned) {
      getWindow(this.content).requestAnimationFrame(() => {
        this.centerContent();
      });
    } else {
      this.applyTransform();
    }
    if (this.focusedElementId && hadFocus && !isAncestorOfActiveElement(this.headerContainer)) {
      this.restoreFocus(this.focusedElementId);
    }
  }
  setupPanZoom() {
    this._register(addDisposableListener(this.content, EventType.MOUSE_DOWN, (e) => this.handleMouseDown(e)));
    const targetDocument = getWindow(this.content).document;
    this._register(addDisposableListener(targetDocument, EventType.MOUSE_MOVE, (e) => this.handleMouseMove(e)));
    this._register(addDisposableListener(targetDocument, EventType.MOUSE_UP, (e) => this.handleMouseUp(e)));
    this._register(addDisposableListener(this.content, "wheel", (e) => this.handleWheel(e), { passive: false }));
  }
  setupKeyboard() {
    this._register(addDisposableListener(this.content, EventType.FOCUS_IN, (e) => {
      const el = e.target;
      if (!el) {
        return;
      }
      const subgraphId = el.getAttribute?.("data-subgraph-id");
      if (subgraphId) {
        this.focusedElementId = `sg:${subgraphId}`;
        return;
      }
      const nodeId = el.getAttribute?.("data-node-id");
      if (nodeId) {
        this.focusedElementId = nodeId;
      }
    }));
    this._register(addDisposableListener(this.content, EventType.KEY_DOWN, (e) => {
      const target = e.target;
      if (!target) {
        return;
      }
      const subgraphId = target.getAttribute?.("data-subgraph-id");
      switch (e.key) {
        case "Tab": {
          if (this.focusedElementId) {
            const moved = this.focusAdjacentElement(this.focusedElementId, e.shiftKey ? -1 : 1);
            if (moved) {
              e.preventDefault();
            } else if (!e.shiftKey && this.detailPanel.isVisible) {
              e.preventDefault();
              this.detailPanel.focus();
            }
          } else if (!e.shiftKey) {
            e.preventDefault();
            this.focusFirstElement();
          }
          break;
        }
        case "Enter":
        case " ":
          if (subgraphId) {
            e.preventDefault();
            e.stopPropagation();
            this.detailPanel.hide();
            this.toggleSubgraph(subgraphId);
          } else {
            const nodeId = target.getAttribute?.("data-node-id");
            if (nodeId) {
              e.preventDefault();
              if (target.getAttribute?.("data-is-toggle")) {
                this.detailPanel.hide();
                this.toggleMergedDiscovery(nodeId);
              } else {
                const event = this.eventById.get(nodeId);
                if (event) {
                  this.detailPanel.show(event);
                }
              }
            }
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (this.focusedElementId) {
            this.focusEdgeNeighbor(this.focusedElementId, "next");
          } else {
            this.focusFirstElement();
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (this.focusedElementId) {
            if (subgraphId && this.collapsedNodeIds.has(subgraphId)) {
              this.detailPanel.hide();
              this.collapsedNodeIds.delete(subgraphId);
              this.focusedElementId = `sg:${subgraphId}`;
              this.load();
              this.focusFirstChildOf(`sg:${subgraphId}`);
            } else if (target.getAttribute?.("data-is-toggle")) {
              if (!this.expandedMergedIds.has(this.focusedElementId)) {
                this.detailPanel.hide();
                const mergedId = this.focusedElementId;
                this.expandedMergedIds.add(mergedId);
                this.focusedElementId = mergedId;
                this.load();
                this.focusFirstChildOf(mergedId);
              } else {
                this.focusFirstChildOf(this.focusedElementId);
              }
            }
          } else {
            this.focusFirstElement();
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (this.focusedElementId) {
            this.focusEdgeNeighbor(this.focusedElementId, "prev");
          } else {
            this.focusFirstElement();
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (this.focusedElementId) {
            if (subgraphId && !this.collapsedNodeIds.has(subgraphId)) {
              this.detailPanel.hide();
              this.toggleSubgraph(subgraphId);
            } else if (target.getAttribute?.("data-is-toggle") && this.expandedMergedIds.has(this.focusedElementId)) {
              this.detailPanel.hide();
              this.toggleMergedDiscovery(this.focusedElementId);
            } else {
              this.focusEdgeNeighbor(this.focusedElementId, "prev");
            }
          }
          break;
        case "Home":
          e.preventDefault();
          this.focusFirstElement();
          break;
        case "End":
          e.preventDefault();
          this.focusLastElement();
          break;
        case "=":
        case "+":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            this.zoomBy(ZOOM_STEP);
          }
          break;
        case "-":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            this.zoomBy(-ZOOM_STEP);
          }
          break;
      }
    }));
  }
  toggleSubgraph(subgraphId) {
    if (this.collapsedNodeIds.has(subgraphId)) {
      this.collapsedNodeIds.delete(subgraphId);
    } else {
      this.collapsedNodeIds.add(subgraphId);
    }
    this.focusedElementId = `sg:${subgraphId}`;
    this.load();
  }
  toggleMergedDiscovery(mergedId) {
    if (this.expandedMergedIds.has(mergedId)) {
      this.expandedMergedIds.delete(mergedId);
    } else {
      this.expandedMergedIds.add(mergedId);
    }
    this.focusedElementId = mergedId;
    this.load();
  }
  focusFirstElement() {
    if (!this.renderResult) {
      return;
    }
    const first2 = this.renderResult.focusableElements.values().next();
    if (!first2.done) {
      first2.value.focus();
    }
  }
  focusLastElement() {
    if (!this.renderResult) {
      return;
    }
    const entries2 = [...this.renderResult.focusableElements.values()];
    if (entries2.length > 0) {
      entries2[entries2.length - 1].focus();
    }
  }
  focusAdjacentElement(currentMapKey, direction) {
    if (!this.renderResult) {
      return false;
    }
    const keys = [...this.renderResult.focusableElements.keys()];
    const idx = keys.indexOf(currentMapKey);
    if (idx === -1) {
      return false;
    }
    const nextIdx = idx + direction;
    if (nextIdx < 0 || nextIdx >= keys.length) {
      return false;
    }
    const el = this.renderResult.focusableElements.get(keys[nextIdx]);
    if (el) {
      el.focus();
      return true;
    }
    return false;
  }
  focusEdgeNeighbor(currentId, direction) {
    if (!this.renderResult) {
      return false;
    }
    const entry = this.renderResult.adjacency.get(currentId);
    const neighbors = entry?.[direction];
    if (!neighbors || neighbors.length === 0) {
      return false;
    }
    for (const id2 of neighbors) {
      const el = this.renderResult.focusableElements.get(id2);
      if (el) {
        el.focus();
        return true;
      }
    }
    return false;
  }
  focusFirstChildOf(parentId) {
    if (!this.renderResult) {
      return;
    }
    const entry = this.renderResult.adjacency.get(parentId);
    if (!entry?.next || entry.next.length === 0) {
      return;
    }
    const parentPos = this.renderResult.positions.get(parentId);
    let bestId;
    for (const id2 of entry.next) {
      if (!this.renderResult.focusableElements.has(id2)) {
        continue;
      }
      if (!bestId) {
        bestId = id2;
      }
      if (parentPos) {
        const pos = this.renderResult.positions.get(id2);
        if (pos && pos.x > parentPos.x) {
          bestId = id2;
          break;
        }
      }
    }
    if (bestId) {
      const el = this.renderResult.focusableElements.get(bestId);
      if (el) {
        this.focusedElementId = bestId;
        el.focus();
      }
    }
  }
  restoreFocus(elementId) {
    const el = this.renderResult?.focusableElements.get(elementId);
    if (el) {
      el.focus();
    }
  }
  zoomBy(delta2) {
    const rect = this.content.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, this.scale * (1 + delta2)));
    const scaleFactor = newScale / this.scale;
    this.translateX = centerX - (centerX - this.translateX) * scaleFactor;
    this.translateY = centerY - (centerY - this.translateY) * scaleFactor;
    this.scale = newScale;
    this.hasUserPanned = true;
    this.applyTransform();
  }
  handleMouseDown(e) {
    if (e.button !== 0) {
      return;
    }
    e.preventDefault();
    this.isPanning = true;
    this.hasUserPanned = true;
    this.startX = e.clientX - this.translateX;
    this.startY = e.clientY - this.translateY;
    this.mouseDownX = e.clientX;
    this.mouseDownY = e.clientY;
    this.content.style.cursor = "grabbing";
  }
  handleMouseMove(e) {
    if (!this.isPanning) {
      return;
    }
    if (e.buttons === 0) {
      this.handleMouseUp(e);
      return;
    }
    this.translateX = e.clientX - this.startX;
    this.translateY = e.clientY - this.startY;
    this.applyTransform();
  }
  handleMouseUp(e) {
    if (this.isPanning) {
      this.isPanning = false;
      this.content.style.cursor = "grab";
      const dx = e.clientX - this.mouseDownX;
      const dy = e.clientY - this.mouseDownY;
      if (dx * dx + dy * dy < CLICK_THRESHOLD_SQ) {
        this.handleClick(e);
      }
    }
  }
  handleClick(e) {
    let target = e.target;
    while (target && target !== this.content) {
      const mergedId = target.getAttribute?.("data-merged-id");
      if (mergedId) {
        this.detailPanel.hide();
        this.toggleMergedDiscovery(mergedId);
        return;
      }
      const subgraphId = target.getAttribute?.("data-subgraph-id");
      if (subgraphId) {
        this.detailPanel.hide();
        this.toggleSubgraph(subgraphId);
        return;
      }
      const nodeId = target.getAttribute?.("data-node-id");
      if (nodeId) {
        target.focus();
        if (target.getAttribute?.("data-is-toggle")) {
          this.detailPanel.hide();
          this.toggleMergedDiscovery(nodeId);
        } else {
          const event = this.eventById.get(nodeId);
          if (event) {
            this.detailPanel.show(event);
          }
        }
        return;
      }
      target = target.parentElement;
    }
  }
  handleWheel(e) {
    e.preventDefault();
    e.stopPropagation();
    this.hasUserPanned = true;
    const rect = this.content.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const delta2 = -e.deltaY * WHEEL_ZOOM_FACTOR;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, this.scale * (1 + delta2)));
    const scaleFactor = newScale / this.scale;
    this.translateX = mouseX - (mouseX - this.translateX) * scaleFactor;
    this.translateY = mouseY - (mouseY - this.translateY) * scaleFactor;
    this.scale = newScale;
    this.applyTransform();
  }
  applyTransform() {
    if (this.svgWrapper) {
      this.svgWrapper.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
    }
  }
  centerContent() {
    const containerRect = this.content.getBoundingClientRect();
    if (!this.svgElement) {
      return;
    }
    const svgWidth = parseFloat(this.svgElement.getAttribute("width") || "0");
    const svgHeight = parseFloat(this.svgElement.getAttribute("height") || "0");
    if (svgWidth <= 0 || svgHeight <= 0) {
      return;
    }
    const PADDING2 = 20;
    this.translateX = Math.max(PADDING2, (containerRect.width - svgWidth) / 2);
    this.translateY = PADDING2;
    this.applyTransform();
  }
};

ChatDebugFlowChartView = __decorateClass([
  __decorateParam(2, IChatService),
  __decorateParam(3, IChatDebugService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IInstantiationService)
], ChatDebugFlowChartView);
export { $79, MIN_SCALE, MAX_SCALE, ZOOM_STEP, WHEEL_ZOOM_FACTOR, CLICK_THRESHOLD_SQ, PAGE_SIZE3, ChatDebugFlowChartView };
