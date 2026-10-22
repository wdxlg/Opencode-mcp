// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugLogsView.ts
import { $, append, clearNode, getWindow, hide, isMouseEvent, show } from "./module-0075.mjs";
import { Disposable, DisposableStore, MutableDisposable, combinedDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { BreadcrumbsWidget } from "./module-1573.mjs";
import { Codicon } from "./module-0085.mjs";
import { defaultBreadcrumbsWidgetStyles, defaultButtonStyles, defaultProgressBarStyles } from "./module-0513.mjs";
import { TextBreadcrumbItem, setupBreadcrumbKeyboardNavigation } from "./module-2595.mjs";
import { bindFilterContextKeys } from "./module-2597.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { FilterWidget } from "./module-1333.mjs";
import { localize } from "./module-0001.mjs";
import { Button } from "./module-0546.mjs";
import { ProgressBar } from "./module-1331.mjs";
import { WorkbenchList, WorkbenchObjectTree } from "./module-0636.mjs";
import { ChatDebugEventDelegate, ChatDebugEventRenderer, ChatDebugEventTreeRenderer, getEventCreatedText, getEventDetailsText, getEventNameText } from "./module-2602.mjs";
import { ChatDebugDetailPanel } from "./module-2610.mjs";
import { LocalChatSessionUri } from "./module-0961.mjs";
import { debugEventMatchesText } from "./module-2596.mjs";
import { autorun } from "./module-0052.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { Action, Separator } from "./module-0082.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0972.mjs";
import { IChatDebugService } from "./module-1456.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IContextMenuService } from "./module-0488.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugLogsView.ts
var $78 = $;

var PAGE_SIZE2 = 1e3;

var ChatDebugLogsView = class extends Disposable {
  constructor(parent, filterState, chatService, chatDebugService, instantiationService, contextKeyService, clipboardService, contextMenuService) {
    super();
    this.filterState = filterState;
    this.chatService = chatService;
    this.chatDebugService = chatDebugService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.clipboardService = clipboardService;
    this.contextMenuService = contextMenuService;
    this._onNavigate = this._register(new Emitter());
    this.onNavigate = this._onNavigate.event;
    this.logsViewMode = "tree" /* Tree */;
    this.events = [];
    this.filteredEvents = [];
    this.filterDirty = true;
    this.cachedIncludeTerms = [];
    this.cachedExcludeTerms = [];
    this.eventListener = this._register(new MutableDisposable());
    this.sessionStateDisposable = this._register(new MutableDisposable());
    this.showMoreDisposables = this._register(new DisposableStore());
    this.showMoreVisible = false;
    this.visibleLimit = PAGE_SIZE2;
    this.refreshScheduler = this._register(new RunOnceScheduler(() => this.refreshList(), 50));
    this.container = append(parent, $78(".chat-debug-logs"));
    hide(this.container);
    const breadcrumbContainer = append(this.container, $78(".chat-debug-breadcrumb"));
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
    this.headerContainer = append(this.container, $78(".chat-debug-editor-header"));
    const scopedContextKeyService = this._register(this.contextKeyService.createScoped(this.headerContainer));
    const syncContextKeys = bindFilterContextKeys(this.filterState, scopedContextKeyService);
    syncContextKeys();
    const childInstantiationService = this._register(this.instantiationService.createChild(
      new ServiceCollection([IContextKeyService, scopedContextKeyService])
    ));
    this.filterWidget = this._register(childInstantiationService.createInstance(FilterWidget, {
      placeholder: localize(10672, null),
      ariaLabel: localize(10666, null)
    }));
    this.viewModeToggle = this._register(new Button(this.headerContainer, { ...defaultButtonStyles, secondary: true, title: localize(10679, null) }));
    this.viewModeToggle.element.classList.add("chat-debug-view-mode-toggle", "monaco-text-button");
    this.updateViewModeToggle();
    this._register(this.viewModeToggle.onDidClick(() => {
      this.toggleViewMode();
    }));
    const filterContainer = append(this.headerContainer, $78(".viewpane-filter-container"));
    filterContainer.appendChild(this.filterWidget.element);
    this._register(this.filterWidget.onDidChangeFilterText((text2) => {
      this.filterState.setTextFilter(text2);
    }));
    this._register(this.filterState.onDidChange(() => {
      syncContextKeys();
      this.updateMoreFiltersChecked();
      this.visibleLimit = PAGE_SIZE2;
      this.filterDirty = true;
      this.refreshList();
    }));
    const contentContainer = append(this.container, $78(".chat-debug-logs-content"));
    const mainColumn = append(contentContainer, $78(".chat-debug-logs-main"));
    this.tableHeader = append(mainColumn, $78(".chat-debug-table-header"));
    append(this.tableHeader, $78("span.chat-debug-col-created", void 0, localize(10660, null)));
    append(this.tableHeader, $78("span.chat-debug-col-name", void 0, localize(10662, null)));
    append(this.tableHeader, $78("span.chat-debug-col-details", void 0, localize(10661, null)));
    this.progressBar = this._register(new ProgressBar(mainColumn, {
      ...defaultProgressBarStyles,
      ariaLabel: localize(10671, null)
    }));
    this.bodyContainer = append(mainColumn, $78(".chat-debug-logs-body"));
    this.showMoreContainer = append(mainColumn, $78(".chat-debug-logs-show-more"));
    hide(this.showMoreContainer);
    this.listContainer = append(this.bodyContainer, $78(".chat-debug-list-container"));
    hide(this.listContainer);
    const accessibilityProvider = {
      getAriaLabel: (e) => {
        switch (e.kind) {
          case "toolCall":
            return localize(10657, null, e.toolName, e.result ? ` (${e.result})` : "");
          case "modelTurn":
            return localize(
              10654,
              null,
              e.model ?? localize(10653, null),
              e.totalTokens !== void 0 ? localize(10656, null, e.totalTokens) : "",
              e.cachedTokens !== void 0 ? localize(10652, null, e.cachedTokens) : ""
            );
          case "generic":
            return `${e.category ? e.category + ": " : ""}${e.name}: ${e.details ?? ""}`;
          case "subagentInvocation":
            return localize(10655, null, e.agentName, e.description ? ` - ${e.description}` : "");
          case "userMessage":
            return localize(10658, null, e.message);
          case "agentResponse":
            return localize(10651, null, e.message);
        }
      },
      getWidgetAriaLabel: () => localize(10659, null)
    };
    let nextFallbackId = 0;
    const fallbackIds = /* @__PURE__ */ new WeakMap();
    const identityProvider3 = {
      getId: (e) => {
        if (e.id) {
          return e.id;
        }
        let fallback2 = fallbackIds.get(e);
        if (!fallback2) {
          fallback2 = `_fallback_${nextFallbackId++}`;
          fallbackIds.set(e, fallback2);
        }
        return fallback2;
      }
    };
    this.list = this._register(this.instantiationService.createInstance(
      WorkbenchList,
      "ChatDebugEvents",
      this.listContainer,
      new ChatDebugEventDelegate(),
      [new ChatDebugEventRenderer()],
      { identityProvider: identityProvider3, accessibilityProvider }
    ));
    this.treeContainer = append(this.bodyContainer, $78(".chat-debug-list-container"));
    this.tree = this._register(this.instantiationService.createInstance(
      WorkbenchObjectTree,
      "ChatDebugEventsTree",
      this.treeContainer,
      new ChatDebugEventDelegate(),
      [new ChatDebugEventTreeRenderer()],
      { identityProvider: identityProvider3, accessibilityProvider }
    ));
    this.detailPanel = this._register(this.instantiationService.createInstance(ChatDebugDetailPanel, contentContainer));
    this._register(this.detailPanel.onDidChangeWidth(() => {
      if (this.currentDimension) {
        this.layout(this.currentDimension);
      }
    }));
    this._register(this.detailPanel.onDidHide(() => {
      if (this.list.getSelection().length > 0) {
        this.list.setSelection([]);
      }
      if (this.tree.getSelection().length > 0) {
        this.tree.setSelection([]);
      }
      if (this.currentDimension) {
        this.layout(this.currentDimension);
      }
    }));
    this._register(this.list.onContextMenu((e) => {
      if (e.element) {
        this.showEventContextMenu(e.element, e.browserEvent);
      }
    }));
    this._register(this.tree.onContextMenu((e) => {
      if (e.element) {
        this.showEventContextMenu(e.element, e.browserEvent);
      }
    }));
    this._register(this.list.onDidChangeSelection((e) => {
      const selected = e.elements[0];
      if (selected) {
        this.detailPanel.show(selected);
      } else {
        this.detailPanel.hide();
      }
    }));
    this._register(this.tree.onDidChangeSelection((e) => {
      const selected = e.elements[0];
      if (selected) {
        this.detailPanel.show(selected);
      } else {
        this.detailPanel.hide();
      }
    }));
  }
  setSession(sessionResource) {
    if (!this.currentSessionResource || this.currentSessionResource.toString() !== sessionResource.toString()) {
      this.visibleLimit = PAGE_SIZE2;
    }
    this.currentSessionResource = sessionResource;
  }
  setFilterText(text2) {
    this.filterWidget.setFilterText(text2);
  }
  show() {
    show(this.container);
    this.loadEvents();
    this.refreshList();
  }
  hide() {
    hide(this.container);
  }
  focus() {
    if (this.logsViewMode === "tree" /* Tree */) {
      this.tree.domFocus();
    } else {
      this.list.domFocus();
    }
  }
  updateBreadcrumb() {
    if (!this.currentSessionResource) {
      return;
    }
    const sessionTitle = this.chatService.getSessionTitle(this.currentSessionResource) || LocalChatSessionUri.parseLocalSessionId(this.currentSessionResource) || this.currentSessionResource.toString();
    this.breadcrumbWidget.setItems([
      new TextBreadcrumbItem(localize(10678, null), true),
      new TextBreadcrumbItem(sessionTitle, true),
      new TextBreadcrumbItem(localize(10670, null))
    ]);
  }
  layout(dimension) {
    this.currentDimension = dimension;
    const breadcrumbHeight = 22;
    const headerHeight = this.headerContainer.offsetHeight;
    const tableHeaderHeight = this.tableHeader.offsetHeight;
    const showMoreHeight = this.showMoreContainer.offsetHeight;
    const detailVisible = this.detailPanel.isVisible;
    const detailWidth = detailVisible ? this.detailPanel.width : 0;
    const listHeight = dimension.height - breadcrumbHeight - headerHeight - tableHeaderHeight - showMoreHeight;
    const listWidth = dimension.width - detailWidth;
    if (this.logsViewMode === "tree" /* Tree */) {
      this.tree.layout(listHeight, listWidth);
    } else {
      this.list.layout(listHeight, listWidth);
    }
    if (this.detailPanel.isVisible) {
      this.detailPanel.layout(listHeight);
    }
    this.detailPanel.layoutSash();
  }
  refreshList() {
    if (this.filterDirty) {
      this.filteredEvents = this.events.filter((e) => this.passesCurrentFilter(e));
      this.filterDirty = false;
    }
    const totalFiltered = this.filteredEvents.length;
    const display = totalFiltered > this.visibleLimit ? this.filteredEvents.slice(0, this.visibleLimit) : this.filteredEvents;
    if (this.logsViewMode === "list" /* List */) {
      this.list.splice(0, this.list.length, display);
    } else {
      this.refreshTree(display);
    }
    this.updateShowMore(totalFiltered);
    if (this.currentDimension) {
      this.layout(this.currentDimension);
    }
  }
  addEvent(event) {
    this.binaryInsert(this.events, event);
    if (!this.filterDirty && this.passesCurrentFilter(event)) {
      this.binaryInsert(this.filteredEvents, event);
    }
    this.scheduleRefresh();
  }
  binaryInsert(arr, event) {
    const time = event.created.getTime();
    let lo = 0;
    let hi = arr.length;
    while (lo < hi) {
      const mid = lo + hi >>> 1;
      if (arr[mid].created.getTime() <= time) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    if (lo === arr.length) {
      arr.push(event);
    } else {
      arr.splice(lo, 0, event);
    }
  }
  /**
   * Tests whether a single event passes the current kind + text + timestamp
   * filters. Used for incremental filtering on each addEvent() call.
   */
  passesCurrentFilter(event) {
    const category11 = event.kind === "generic" ? event.category : void 0;
    if (!this.filterState.isKindVisible(event.kind, category11)) {
      return false;
    }
    if (!this.filterState.isTimestampVisible(event.created)) {
      return false;
    }
    this.ensureCachedTerms();
    if (this.cachedExcludeTerms.length > 0 && this.cachedExcludeTerms.some((term) => debugEventMatchesText(event, term))) {
      return false;
    }
    if (this.cachedIncludeTerms.length > 0 && !this.cachedIncludeTerms.some((term) => debugEventMatchesText(event, term))) {
      return false;
    }
    return true;
  }
  ensureCachedTerms() {
    const textOnly = this.filterState.textFilterWithoutTimestamps;
    if (textOnly === this.cachedTextFilter) {
      return;
    }
    this.cachedTextFilter = textOnly;
    if (!textOnly) {
      this.cachedIncludeTerms = [];
      this.cachedExcludeTerms = [];
      return;
    }
    const terms = textOnly.split(",").map((t2) => t2.trim()).filter((t2) => t2.length > 0);
    this.cachedIncludeTerms = terms.filter((t2) => !t2.startsWith("!"));
    this.cachedExcludeTerms = terms.filter((t2) => t2.startsWith("!")).map((t2) => t2.slice(1).trim()).filter((t2) => t2.length > 0);
  }
  scheduleRefresh() {
    if (!this.refreshScheduler.isScheduled()) {
      this.refreshScheduler.schedule();
    }
  }
  loadEvents() {
    this.events = [...this.chatDebugService.getEvents(this.currentSessionResource || void 0)];
    this.filterDirty = true;
    const addEventDisposable = this.chatDebugService.onDidAddEvent((e) => {
      if (!this.currentSessionResource || e.sessionResource.toString() === this.currentSessionResource.toString()) {
        this.addEvent(e);
      }
    });
    const clearEventsDisposable = this.chatDebugService.onDidClearProviderEvents((sessionResource) => {
      if (!this.currentSessionResource || sessionResource.toString() === this.currentSessionResource.toString()) {
        this.events = [...this.chatDebugService.getEvents(this.currentSessionResource || void 0)];
        this.filterDirty = true;
        this.scheduleRefresh();
      }
    });
    this.eventListener.value = combinedDisposable(addEventDisposable, clearEventsDisposable);
    this.updateBreadcrumb();
    this.trackSessionState();
  }
  trackSessionState() {
    if (!this.currentSessionResource) {
      this.progressBar.stop();
      this.sessionStateDisposable.clear();
      return;
    }
    const model = this.chatService.getSession(this.currentSessionResource);
    if (!model) {
      this.progressBar.stop();
      this.sessionStateDisposable.clear();
      return;
    }
    this.sessionStateDisposable.value = autorun((reader) => {
      const inProgress = model.requestInProgress.read(reader);
      if (inProgress) {
        this.progressBar.infinite();
      } else {
        this.progressBar.stop();
      }
    });
  }
  refreshTree(filtered) {
    const treeElements = this.buildTreeHierarchy(filtered);
    this.tree.setChildren(null, treeElements);
  }
  buildTreeHierarchy(events) {
    const idToEvent = /* @__PURE__ */ new Map();
    const idToChildren = /* @__PURE__ */ new Map();
    const roots = [];
    for (const event of events) {
      if (event.id) {
        idToEvent.set(event.id, event);
      }
    }
    for (const event of events) {
      if (event.parentEventId && idToEvent.has(event.parentEventId)) {
        let children = idToChildren.get(event.parentEventId);
        if (!children) {
          children = [];
          idToChildren.set(event.parentEventId, children);
        }
        children.push(event);
      } else {
        roots.push(event);
      }
    }
    const toTreeElement = (event) => {
      const children = event.id ? idToChildren.get(event.id) : void 0;
      return {
        element: event,
        children: children?.map(toTreeElement),
        collapsible: (children?.length ?? 0) > 0,
        collapsed: false
      };
    };
    return roots.map(toTreeElement);
  }
  updateShowMore(totalFiltered) {
    if (totalFiltered <= this.visibleLimit) {
      if (this.showMoreVisible) {
        hide(this.showMoreContainer);
        this.showMoreVisible = false;
      }
      return;
    }
    if (!this.showMoreStatusLabel) {
      this.showMoreStatusLabel = append(this.showMoreContainer, $78("span.chat-debug-logs-show-more-status"));
    }
    if (!this.showMoreBtn) {
      this.showMoreBtn = this.showMoreDisposables.add(new Button(this.showMoreContainer, { ...defaultButtonStyles, secondary: true, title: localize(10675, null) }));
      this.showMoreDisposables.add(this.showMoreBtn.onDidClick(() => {
        this.visibleLimit += PAGE_SIZE2;
        this.refreshList();
      }));
    }
    const shown = Math.min(this.visibleLimit, totalFiltered);
    const remaining = totalFiltered - shown;
    this.showMoreStatusLabel.textContent = localize(10673, null, shown, totalFiltered);
    this.showMoreBtn.label = localize(10674, null, remaining);
    if (!this.showMoreVisible) {
      show(this.showMoreContainer);
      this.showMoreVisible = true;
    }
  }
  toggleViewMode() {
    if (this.logsViewMode === "list" /* List */) {
      this.logsViewMode = "tree" /* Tree */;
      hide(this.listContainer);
      show(this.treeContainer);
    } else {
      this.logsViewMode = "list" /* List */;
      show(this.listContainer);
      hide(this.treeContainer);
    }
    this.updateViewModeToggle();
    this.refreshList();
    if (this.currentDimension) {
      this.layout(this.currentDimension);
    }
  }
  updateViewModeToggle() {
    const el = this.viewModeToggle.element;
    clearNode(el);
    const isTree = this.logsViewMode === "tree" /* Tree */;
    append(el, $78(`span${ThemeIcon.asCSSSelector(isTree ? Codicon.listTree : Codicon.listFlat)}`));
    const labelContainer = append(el, $78("span.chat-debug-view-mode-labels"));
    const treeLabel = append(labelContainer, $78("span.chat-debug-view-mode-label"));
    treeLabel.textContent = localize(10680, null);
    const listLabel = append(labelContainer, $78("span.chat-debug-view-mode-label"));
    listLabel.textContent = localize(10669, null);
    if (isTree) {
      listLabel.classList.add("hidden");
    } else {
      treeLabel.classList.add("hidden");
    }
    const activeLabel = isTree ? localize(10676, null) : localize(10677, null);
    el.setAttribute("aria-label", activeLabel);
    this.viewModeToggle.setTitle(activeLabel);
  }
  updateMoreFiltersChecked() {
    this.filterWidget.checkMoreFilters(!this.filterState.isAllFiltersDefault());
  }
  showEventContextMenu(event, browserEvent) {
    const d = event.created;
    const pad = (n2) => String(n2).padStart(2, "0");
    const timestamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    const row = [getEventCreatedText(event), getEventNameText(event), getEventDetailsText(event)].filter(Boolean).join("	");
    const name = getEventNameText(event);
    this.contextMenuService.showContextMenu({
      getAnchor: () => isMouseEvent(browserEvent) ? new StandardMouseEvent(getWindow(this.container), browserEvent) : this.container,
      getActions: () => [
        new Action("chatDebug.copyTimestamp", localize(10664, null), void 0, true, () => this.clipboardService.writeText(timestamp)),
        new Action("chatDebug.copyRow", localize(10663, null), void 0, true, () => this.clipboardService.writeText(row)),
        new Separator(),
        new Action("chatDebug.filterBefore", localize(10667, null), void 0, true, () => this.applyFilterToken(`before:${timestamp}`)),
        new Action("chatDebug.filterAfter", localize(10665, null), void 0, true, () => this.applyFilterToken(`after:${timestamp}`)),
        new Action("chatDebug.filterName", localize(10668, null), void 0, !!name, () => this.applyFilterToken(name))
      ]
    });
  }
  applyFilterToken(token) {
    this.filterWidget.setFilterText(token);
  }
};

ChatDebugLogsView = __decorateClass([
  __decorateParam(2, IChatService),
  __decorateParam(3, IChatDebugService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IClipboardService),
  __decorateParam(7, IContextMenuService)
], ChatDebugLogsView);
export { $78, PAGE_SIZE2, ChatDebugLogsView };
