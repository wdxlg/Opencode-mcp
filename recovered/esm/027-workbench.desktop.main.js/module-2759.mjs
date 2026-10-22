// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionsControl.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Throttler } from "./module-0036.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { ChatEditorInput } from "./module-1111.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, getWindow, hide, setVisibility } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { getAgentSessionPullRequestContextValue, isAgentSession, isAgentSessionSection, isAgentSessionShowLess, isAgentSessionShowMore } from "./module-1463.mjs";
import { AgentSessionRenderer, AgentSessionSectionLabels, AgentSessionSectionRenderer, AgentSessionShowLessRenderer, AgentSessionShowMoreRenderer, AgentSessionsAccessibilityProvider, AgentSessionsCompressionDelegate, AgentSessionsDataSource, AgentSessionsDragAndDrop, AgentSessionsIdentityProvider, AgentSessionsKeyboardNavigationLabelProvider, AgentSessionsListDelegate, AgentSessionsSorter, getRepositoryName } from "./module-2755.mjs";
import { AgentSessionApprovalModel } from "./module-2758.mjs";
import { observableValue } from "./module-0048.mjs";
import { WorkbenchCompressibleAsyncDataTree } from "./module-0636.mjs";
import { openSession } from "./module-2665.mjs";
import { IMenuService, MenuId } from "./module-0092.mjs";
import { Separator } from "./module-0082.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatSessionsService } from "./module-0960.mjs";
import { IAgentSessionsService } from "./module-1464.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentSessionsControl.ts
var AgentSessionsControl = class extends Disposable {
  constructor(container3, options3, contextMenuService, contextKeyService, instantiationService, chatSessionsService, menuService, agentSessionsService, telemetryService, editorService, storageService, accessibilityService, configurationService) {
    super();
    this.container = container3;
    this.options = options3;
    this.contextMenuService = contextMenuService;
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    this.chatSessionsService = chatSessionsService;
    this.menuService = menuService;
    this.agentSessionsService = agentSessionsService;
    this.telemetryService = telemetryService;
    this.editorService = editorService;
    this.storageService = storageService;
    this.accessibilityService = accessibilityService;
    this.configurationService = configurationService;
    this.sessionsListFindIsOpen = false;
    this._isProgrammaticCollapseChange = false;
    this._recentRepositoryLabels = /* @__PURE__ */ new Set();
    this.updateSessionsListThrottler = this._register(new Throttler());
    this._onDidUpdate = this._register(new Emitter());
    this.onDidUpdate = this._onDidUpdate.event;
    this.visible = true;
    this.hasPendingUpdate = false;
    this.focusedAgentSessionArchivedContextKey = ChatContextKeys.isArchivedAgentSession.bindTo(this.contextKeyService);
    this.focusedAgentSessionPinnedContextKey = ChatContextKeys.isPinnedAgentSession.bindTo(this.contextKeyService);
    this.focusedAgentSessionReadContextKey = ChatContextKeys.isReadAgentSession.bindTo(this.contextKeyService);
    this.focusedAgentSessionTypeContextKey = ChatContextKeys.agentSessionType.bindTo(this.contextKeyService);
    this.hasMultipleAgentSessionsSelectedContextKey = ChatContextKeys.hasMultipleAgentSessionsSelected.bindTo(this.contextKeyService);
    this.create(this.container);
    this.registerListeners();
  }
  get element() {
    return this.sessionsContainer;
  }
  static {
    this.RECENT_SESSIONS_FOR_EXPAND = 5;
  }
  registerListeners() {
    this._register(this.editorService.onDidActiveEditorChange(() => this.revealAndFocusActiveEditorSession()));
  }
  revealAndFocusActiveEditorSession() {
    if (!this.options.trackActiveEditorSession() || !this.visible) {
      return;
    }
    const input = this.editorService.activeEditor;
    const resource = input instanceof ChatEditorInput ? input.sessionResource : input?.resource;
    if (!resource) {
      return;
    }
    const matchingSession = this.agentSessionsService.model.getSession(resource);
    if (matchingSession && this.sessionsList?.hasNode(matchingSession)) {
      if (this.sessionsList.getRelativeTop(matchingSession) === null) {
        this.sessionsList.reveal(matchingSession, 0.5);
      }
      this.sessionsList.setFocus([matchingSession]);
      this.sessionsList.setSelection([matchingSession]);
    }
  }
  create(container3) {
    this.sessionsContainer = append(container3, $(".agent-sessions-viewer"));
    this.createEmptyFilterMessage(this.sessionsContainer);
    this.createList(this.sessionsContainer);
  }
  createEmptyFilterMessage(container3) {
    this.emptyFilterMessage = append(container3, $(".agent-sessions-empty-filter-message"));
    hide(this.emptyFilterMessage);
    const span = append(this.emptyFilterMessage, $("span"));
    span.textContent = `${localize(9136, null)} - `;
    const link2 = append(this.emptyFilterMessage, $("span.reset-filter-link"));
    link2.textContent = localize(9137, null);
    link2.tabIndex = 0;
    link2.setAttribute("role", "button");
    this._register(addDisposableListener(link2, EventType.CLICK, () => this.options.filter.reset()));
    this._register(addDisposableListener(link2, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.keyCode === 3 /* Enter */ || event.keyCode === 10 /* Space */) {
        EventHelper.stop(e, true);
        this.options.filter.reset();
      }
    }));
  }
  static {
    this.SECTION_COLLAPSE_STATE_KEY = "agentSessions.sectionCollapseState";
  }
  getSavedCollapseState(section) {
    const raw = this.storageService.get(AgentSessionsControl.SECTION_COLLAPSE_STATE_KEY, 0 /* PROFILE */);
    if (raw) {
      try {
        const state = JSON.parse(raw);
        if (typeof state[section] === "boolean") {
          return state[section];
        }
      } catch {
      }
    }
    return void 0;
  }
  saveSectionCollapseState(section, collapsed2) {
    let state = {};
    const raw = this.storageService.get(AgentSessionsControl.SECTION_COLLAPSE_STATE_KEY, 0 /* PROFILE */);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
          state = parsed;
        }
      } catch {
      }
    }
    state[section] = collapsed2;
    this.storageService.store(AgentSessionsControl.SECTION_COLLAPSE_STATE_KEY, JSON.stringify(state), 0 /* PROFILE */, 0 /* USER */);
  }
  resetSectionCollapseState() {
    this.storageService.remove(AgentSessionsControl.SECTION_COLLAPSE_STATE_KEY, 0 /* PROFILE */);
  }
  createList(container3) {
    const collapseByDefault = (element) => {
      if (isAgentSessionSection(element)) {
        const saved = this.getSavedCollapseState(element.section);
        if (saved !== void 0) {
          return saved;
        }
        if (element.section === "more" /* More */ && !this.options.filter.getExcludes().read) {
          return true;
        }
        if (element.section === "archived" /* Archived */ && this.options.filter.getExcludes().archived) {
          return true;
        }
        if (this.options.collapseOlderSections?.()) {
          const olderSections = ["week" /* Week */, "older" /* Older */, "archived" /* Archived */];
          if (olderSections.includes(element.section)) {
            return true;
          }
          if (element.section === "yesterday" /* Yesterday */ && this.hasTodaySessions()) {
            return true;
          }
          if (element.section === "repository" /* Repository */ && !this._recentRepositoryLabels.has(element.label)) {
            return true;
          }
        }
      }
      return false;
    };
    const sorter3 = new AgentSessionsSorter(() => this.options.filter.sortResults?.() ?? "created" /* Created */);
    const approvalModel = this.options.enableApprovalRow ? this._register(this.instantiationService.createInstance(AgentSessionApprovalModel)) : void 0;
    const activeSessionResource = observableValue(this, void 0);
    const sessionRenderer = this._register(this.instantiationService.createInstance(AgentSessionRenderer, {
      ...this.options,
      isGroupedByRepository: () => this.options.filter.groupResults?.() === "repository" /* Repository */,
      isSortedByUpdated: () => this.options.filter.sortResults?.() === "updated" /* Updated */,
      pauseSessionUpdates: () => this.pauseUpdates()
    }, approvalModel, activeSessionResource));
    const compact2 = this.options.compactShowMore;
    const sessionDataSource = this.sessionsDataSource = this._register(new AgentSessionsDataSource(this.options.filter, sorter3, this.options.repositoryGroupLimit));
    const listDelegate = new AgentSessionsListDelegate(
      approvalModel,
      this.options.compactShowMore,
      () => this.options.itemHeight ?? (this.configurationService.getValue("workbench.experimental.modernUI" /* MODERN_UI */) === true ? AgentSessionsListDelegate.COMPACT_ITEM_HEIGHT : AgentSessionsListDelegate.ITEM_HEIGHT),
      () => this.options.sectionHeight ?? (this.configurationService.getValue("workbench.experimental.modernUI" /* MODERN_UI */) === true ? AgentSessionsListDelegate.SPACED_SECTION_HEIGHT : AgentSessionsListDelegate.SECTION_HEIGHT)
    );
    const list2 = this.sessionsList = this._register(this.instantiationService.createInstance(
      WorkbenchCompressibleAsyncDataTree,
      "AgentSessionsView",
      container3,
      listDelegate,
      new AgentSessionsCompressionDelegate(),
      [
        sessionRenderer,
        this.instantiationService.createInstance(AgentSessionSectionRenderer, { hideSectionCount: this.options.hideSectionCount }),
        new AgentSessionShowMoreRenderer({ compactLabel: this.options.compactShowMore }),
        new AgentSessionShowLessRenderer()
      ],
      sessionDataSource,
      {
        accessibilityProvider: new AgentSessionsAccessibilityProvider(),
        dnd: this.instantiationService.createInstance(AgentSessionsDragAndDrop),
        identityProvider: new AgentSessionsIdentityProvider(),
        horizontalScrolling: false,
        multipleSelectionSupport: true,
        findWidgetEnabled: true,
        defaultFindMode: 1 /* Filter */,
        keyboardNavigationLabelProvider: new AgentSessionsKeyboardNavigationLabelProvider(),
        overrideStyles: this.options.overrideStyles,
        twistieAdditionalCssClass: () => "force-no-twistie",
        collapseByDefault: (element) => collapseByDefault(element),
        renderIndentGuides: "none" /* None */
      }
    ));
    ChatContextKeys.agentSessionsViewerFocused.bindTo(list2.contextKeyService);
    this._register(this.configurationService.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration("workbench.experimental.modernUI" /* MODERN_UI */)) {
        return;
      }
      const nodes = [...list2.getNode().children];
      while (nodes.length > 0) {
        const node = nodes.pop();
        if (isAgentSession(node.element) || isAgentSessionSection(node.element)) {
          list2.updateElementHeight(node.element, listDelegate.getHeight(node.element));
        }
        nodes.push(...node.children);
      }
    }));
    this._register(sessionRenderer.onDidChangeItemHeight((session) => {
      if (list2.hasNode(session)) {
        list2.updateElementHeight(session, void 0);
      }
    }));
    if (compact2) {
      let expandedShowMoreElement;
      let expandedSectionLabel;
      let currentAnimatedHeight = AgentSessionShowMoreRenderer.COLLAPSED_HEIGHT;
      const sectionToShowMore = /* @__PURE__ */ new Map();
      const rebuildSectionMap = () => {
        sectionToShowMore.clear();
        try {
          const rootNode = list2.getNode();
          for (const sectionNode of rootNode.children) {
            if (isAgentSessionSection(sectionNode.element)) {
              const label3 = sectionNode.element.label;
              for (const child of sectionNode.children) {
                if (isAgentSessionShowMore(child.element) || isAgentSessionShowLess(child.element)) {
                  sectionToShowMore.set(label3, child.element);
                }
              }
            }
          }
        } catch {
        }
      };
      let expandAnimationId;
      let collapseAnimationId;
      const targetWindow = getWindow(container3);
      this._register({
        dispose: () => {
          if (expandAnimationId) {
            targetWindow.cancelAnimationFrame(expandAnimationId);
          }
          if (collapseAnimationId) {
            targetWindow.cancelAnimationFrame(collapseAnimationId);
          }
        }
      });
      const animateHeight = (element, from, to, onComplete) => {
        if (this.accessibilityService.isMotionReduced()) {
          if (list2.hasNode(element)) {
            isUpdatingHeight = true;
            try {
              list2.updateElementHeight(element, to);
            } finally {
              isUpdatingHeight = false;
            }
            currentAnimatedHeight = to;
          }
          onComplete?.();
          return void 0;
        }
        const duration = 150;
        const start = Date.now();
        const step = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 2);
          const height = Math.round(from + (to - from) * eased);
          if (list2.hasNode(element)) {
            isUpdatingHeight = true;
            try {
              list2.updateElementHeight(element, height);
            } finally {
              isUpdatingHeight = false;
            }
            currentAnimatedHeight = height;
          }
          if (progress < 1) {
            return targetWindow.requestAnimationFrame(step);
          }
          onComplete?.();
          return void 0;
        };
        return targetWindow.requestAnimationFrame(step);
      };
      const collapseCurrentShowMore = () => {
        if (collapseAnimationId) {
          targetWindow.cancelAnimationFrame(collapseAnimationId);
          collapseAnimationId = void 0;
        }
        if (expandAnimationId) {
          targetWindow.cancelAnimationFrame(expandAnimationId);
          expandAnimationId = void 0;
        }
        if (expandedShowMoreElement && expandedSectionLabel) {
          if (list2.hasNode(expandedShowMoreElement)) {
            collapseAnimationId = animateHeight(
              expandedShowMoreElement,
              currentAnimatedHeight,
              AgentSessionShowMoreRenderer.COLLAPSED_HEIGHT,
              () => {
                collapseAnimationId = void 0;
              }
            );
          }
        }
        expandedShowMoreElement = void 0;
        expandedSectionLabel = void 0;
      };
      const expandShowMore = (sectionLabel) => {
        if (expandedSectionLabel === sectionLabel) {
          return;
        }
        collapseCurrentShowMore();
        const showMoreItem = sectionToShowMore.get(sectionLabel);
        if (!showMoreItem || !list2.hasNode(showMoreItem)) {
          return;
        }
        expandedShowMoreElement = showMoreItem;
        expandedSectionLabel = sectionLabel;
        currentAnimatedHeight = AgentSessionShowMoreRenderer.COLLAPSED_HEIGHT;
        expandAnimationId = animateHeight(
          showMoreItem,
          AgentSessionShowMoreRenderer.COLLAPSED_HEIGHT,
          AgentSessionShowMoreRenderer.HEIGHT,
          () => {
            expandAnimationId = void 0;
          }
        );
      };
      let isUpdatingHeight = false;
      this._register(list2.onDidChangeModel(() => {
        if (isUpdatingHeight) {
          return;
        }
        expandedShowMoreElement = void 0;
        expandedSectionLabel = void 0;
        currentAnimatedHeight = AgentSessionShowMoreRenderer.COLLAPSED_HEIGHT;
        rebuildSectionMap();
      }));
      this._register(addDisposableListener(container3, "mouseover", (e) => {
        const target = e.target;
        const row = target.closest(".monaco-list-row");
        if (!row) {
          return;
        }
        let sectionLabel;
        const sectionHeaderEl = row.querySelector(".agent-session-section-label");
        if (sectionHeaderEl) {
          sectionLabel = sectionHeaderEl.textContent ?? void 0;
        }
        if (!sectionLabel) {
          const showMoreEl = row.querySelector(".agent-session-show-more");
          if (showMoreEl) {
            sectionLabel = showMoreEl.getAttribute("data-section-label") ?? void 0;
          }
        }
        if (!sectionLabel) {
          const sessionItem = row.querySelector(".agent-session-item[data-section-label]");
          if (sessionItem) {
            sectionLabel = sessionItem.getAttribute("data-section-label") ?? void 0;
          }
        }
        if (!sectionLabel) {
          if (row.querySelector(".agent-session-item")) {
            return;
          }
          collapseCurrentShowMore();
          return;
        }
        if (!sectionToShowMore.has(sectionLabel)) {
          collapseCurrentShowMore();
          return;
        }
        expandShowMore(sectionLabel);
      }));
      this._register(addDisposableListener(container3, "mouseleave", () => {
        collapseCurrentShowMore();
      }));
      rebuildSectionMap();
    }
    this._register(sessionDataSource.onDidGetChildren((count2) => {
      this.updateEmpty(count2 === 0);
    }));
    this._register(sessionDataSource.onDidExpandRepositoryGroup(() => {
      this.update();
    }));
    const model = this.agentSessionsService.model;
    this._register(this.options.filter.onDidChange(async () => {
      if (this.visible) {
        this.updateSectionCollapseStates();
        this.update();
      }
    }));
    this._register(model.onDidChangeSessions(() => {
      if (this.visible) {
        this.update();
      }
    }));
    this.computeRecentRepositoryLabels();
    list2.setInput(model);
    this._register(list2.onDidOpen((e) => this.openAgentSession(e)));
    this._register(list2.onContextMenu((e) => this.showContextMenu(e)));
    this._register(list2.onMouseDblClick(({ element }) => {
      if (element === null) {
        this.options.createNewChat();
      }
    }));
    this._register(Event2.any(list2.onDidChangeFocus, list2.onDidChangeSelection, model.onDidChangeSessions)(() => {
      const focused = list2.getFocus().at(0);
      if (focused && isAgentSession(focused)) {
        this.focusedAgentSessionArchivedContextKey.set(focused.isArchived());
        this.focusedAgentSessionPinnedContextKey.set(focused.isPinned());
        this.focusedAgentSessionReadContextKey.set(focused.isRead());
        this.focusedAgentSessionTypeContextKey.set(focused.providerType);
        activeSessionResource.set(focused.resource, void 0);
      } else {
        this.focusedAgentSessionArchivedContextKey.reset();
        this.focusedAgentSessionPinnedContextKey.reset();
        this.focusedAgentSessionReadContextKey.reset();
        this.focusedAgentSessionTypeContextKey.reset();
        activeSessionResource.set(void 0, void 0);
      }
      const selection = list2.getSelection().filter(isAgentSession);
      this.hasMultipleAgentSessionsSelectedContextKey.set(selection.length > 1);
    }));
    this._register(list2.onDidChangeFindOpenState((open2) => {
      this.sessionsListFindIsOpen = open2;
      this.updateSectionCollapseStates();
    }));
    this._register(list2.onDidChangeCollapseState((e) => {
      if (this._isProgrammaticCollapseChange) {
        return;
      }
      const element = e.node.element?.element;
      if (element && isAgentSessionSection(element)) {
        this.saveSectionCollapseState(element.section, e.node.collapsed);
      }
    }));
  }
  updateEmpty(isEmpty) {
    if (!this.emptyFilterMessage || !this.sessionsList) {
      return;
    }
    const model = this.agentSessionsService.model;
    const hasSessionsInModel = model.sessions.length > 0;
    const isFilterActive = !this.options.filter.isDefault();
    const showEmpty = hasSessionsInModel && isEmpty && isFilterActive;
    setVisibility(showEmpty, this.emptyFilterMessage);
    setVisibility(!showEmpty, this.sessionsList.getHTMLElement());
  }
  hasTodaySessions() {
    const startOfToday = (/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0);
    return this.agentSessionsService.model.sessions.some(
      (session) => !session.isArchived() && session.timing.created >= startOfToday
    );
  }
  computeRecentRepositoryLabels() {
    this._recentRepositoryLabels.clear();
    const sessions = this.agentSessionsService.model.sessions.filter((s) => !s.isArchived() && !s.isPinned()).sort((a, b) => b.timing.created - a.timing.created).slice(0, AgentSessionsControl.RECENT_SESSIONS_FOR_EXPAND);
    for (const session of sessions) {
      const name = getRepositoryName(session);
      this._recentRepositoryLabels.add(name ?? AgentSessionSectionLabels["repository" /* Repository */]);
    }
  }
  async openAgentSession(e) {
    const element = e.element;
    if (!element || isAgentSessionSection(element)) {
      return;
    }
    if (isAgentSessionShowMore(element)) {
      this.sessionsDataSource?.expandRepositoryGroup(element.sectionLabel);
      return;
    }
    if (isAgentSessionShowLess(element)) {
      this.sessionsDataSource?.collapseRepositoryGroup(element.sectionLabel);
      return;
    }
    this.telemetryService.publicLog2("agentSessionOpened", {
      providerType: element.providerType,
      source: this.options.source
    });
    const options3 = this.options.overrideSessionOpenOptions?.(e) ?? e;
    if (this.options.overrideSessionOpen) {
      await this.options.overrideSessionOpen(element.resource, options3);
    } else {
      const widget = await this.instantiationService.invokeFunction(openSession, element, options3);
      if (widget) {
        this.options.notifySessionOpened?.(element.resource, widget);
      }
    }
  }
  async showContextMenu({ element, anchor, browserEvent }) {
    if (!element || isAgentSessionShowMore(element) || isAgentSessionShowLess(element)) {
      return;
    }
    EventHelper.stop(browserEvent, true);
    if (isAgentSessionSection(element)) {
      this.showAgentSessionSectionContextMenu(element, anchor);
    } else {
      this.showAgentSessionContextMenu(element, anchor);
    }
  }
  async showAgentSessionSectionContextMenu(section, anchor) {
    const contextOverlay = [];
    contextOverlay.push([ChatContextKeys.agentSessionSection.key, section.section]);
    const menu = this.menuService.createMenu(MenuId.AgentSessionSectionContext, this.contextKeyService.createOverlay(contextOverlay));
    this.contextMenuService.showContextMenu({
      getActions: () => Separator.join(...menu.getActions({ arg: section, shouldForwardArgs: true }).map(([, actions]) => actions)),
      getAnchor: () => anchor,
      getActionsContext: () => this
    });
    menu.dispose();
  }
  async showAgentSessionContextMenu(session, anchor) {
    this.chatSessionsService.activateChatSessionItemProvider(session.providerType);
    const contextOverlay = [];
    contextOverlay.push([ChatContextKeys.isArchivedAgentSession.key, session.isArchived()]);
    contextOverlay.push([ChatContextKeys.isPinnedAgentSession.key, session.isPinned()]);
    contextOverlay.push([ChatContextKeys.isReadAgentSession.key, session.isRead()]);
    contextOverlay.push([ChatContextKeys.agentSessionType.key, session.providerType]);
    contextOverlay.push([ChatContextKeys.agentSessionPullRequest.key, getAgentSessionPullRequestContextValue(session)]);
    const menu = this.menuService.createMenu(MenuId.AgentSessionsContext, this.contextKeyService.createOverlay(contextOverlay));
    const selection = this.sessionsList?.getSelection().filter(isAgentSession) ?? [];
    const marshalledContext = {
      session,
      sessions: selection.length > 1 && selection.includes(session) ? selection : [session],
      $mid: 25 /* AgentSessionContext */
    };
    this.contextMenuService.showContextMenu({
      getActions: () => Separator.join(...menu.getActions({ arg: marshalledContext, shouldForwardArgs: true }).map(([, actions]) => actions)),
      getAnchor: () => anchor,
      getActionsContext: () => marshalledContext
    });
    menu.dispose();
  }
  openFind() {
    this.sessionsList?.openFind();
  }
  updateSectionCollapseStates() {
    if (!this.sessionsList) {
      return;
    }
    this._isProgrammaticCollapseChange = true;
    try {
      this._updateSectionCollapseStatesCore();
    } finally {
      this._isProgrammaticCollapseChange = false;
    }
  }
  _updateSectionCollapseStatesCore() {
    if (!this.sessionsList) {
      return;
    }
    const model = this.agentSessionsService.model;
    for (const child of this.sessionsList.getNode(model).children) {
      if (!isAgentSessionSection(child.element)) {
        continue;
      }
      switch (child.element.section) {
        case "archived" /* Archived */: {
          const shouldCollapseArchived = !this.sessionsListFindIsOpen && // always expand when find is open
          this.options.filter.getExcludes().archived;
          if (shouldCollapseArchived && !child.collapsed) {
            this.sessionsList.collapse(child.element);
          } else if (!shouldCollapseArchived && child.collapsed) {
            this.sessionsList.expand(child.element);
          }
          break;
        }
        case "more" /* More */: {
          if (child.collapsed && this.sessionsListFindIsOpen) {
            this.sessionsList.expand(child.element);
          }
          break;
        }
      }
    }
  }
  refresh() {
    return this.agentSessionsService.model.resolve(void 0);
  }
  collapseAllSections() {
    if (!this.sessionsList) {
      return;
    }
    const model = this.agentSessionsService.model;
    for (const child of this.sessionsList.getNode(model).children) {
      if (isAgentSessionSection(child.element) && !child.collapsed) {
        this.sessionsList.collapse(child.element);
      }
    }
  }
  async update() {
    if (this.updatePauseOwner) {
      this.hasPendingUpdate = true;
      return false;
    }
    return this.updateSessionsListThrottler.queue(async () => {
      if (this.updatePauseOwner) {
        this.hasPendingUpdate = true;
        return false;
      }
      this.hasPendingUpdate = false;
      this.computeRecentRepositoryLabels();
      await this.sessionsList?.updateChildren();
      this._onDidUpdate.fire();
      return true;
    });
  }
  pauseUpdates() {
    const owner = {};
    this.updatePauseOwner = owner;
    return toDisposable(() => {
      if (this.updatePauseOwner !== owner) {
        return;
      }
      this.updatePauseOwner = void 0;
      if (this.hasPendingUpdate && this.visible) {
        this.update();
      }
    });
  }
  setVisible(visible) {
    if (this.visible === visible) {
      return;
    }
    this.visible = visible;
    if (this.visible) {
      this.update();
    }
  }
  layout(height, width2) {
    this.sessionsList?.layout(height, width2);
  }
  focus() {
    this.sessionsList?.domFocus();
    try {
      if ((this.sessionsList?.getFocus().length ?? 0) === 0) {
        this.sessionsList?.focusFirst();
      }
    } catch {
    }
  }
  clearFocus() {
    this.sessionsList?.setFocus([]);
    this.sessionsList?.setSelection([]);
  }
  hasFocusOrSelection() {
    return (this.sessionsList?.getFocus().length ?? 0) > 0 || (this.sessionsList?.getSelection().length ?? 0) > 0;
  }
  scrollToTop() {
    if (this.sessionsList) {
      this.sessionsList.scrollTop = 0;
    }
  }
  getFocus() {
    const focused = this.sessionsList?.getFocus() ?? [];
    return focused.filter((e) => isAgentSession(e));
  }
  reveal(sessionResource) {
    if (!this.sessionsList) {
      return false;
    }
    const session = this.agentSessionsService.model.getSession(sessionResource);
    if (!session || !this.sessionsList.hasNode(session)) {
      return false;
    }
    try {
      if (this.sessionsList.getRelativeTop(session) === null) {
        this.sessionsList.reveal(session, 0.5);
      }
    } catch {
      return false;
    }
    this.sessionsList.setFocus([session]);
    this.sessionsList.setSelection([session]);
    return true;
  }
};

AgentSessionsControl = __decorateClass([
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IChatSessionsService),
  __decorateParam(6, IMenuService),
  __decorateParam(7, IAgentSessionsService),
  __decorateParam(8, ITelemetryService),
  __decorateParam(9, IEditorService),
  __decorateParam(10, IStorageService),
  __decorateParam(11, IAccessibilityService),
  __decorateParam(12, IConfigurationService)
], AgentSessionsControl);
export { AgentSessionsControl };
