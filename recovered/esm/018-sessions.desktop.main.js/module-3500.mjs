// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/sessionView.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { $, size } from "./module-0075.mjs";
import { Emitter } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { SessionIsMaximizedContext } from "./module-1770.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ISessionContext, SessionContext } from "./module-3499.mjs";
import { SessionHeader, SessionViewFloatingToolbar } from "./module-3498.mjs";
import { ChatGroupsView } from "./module-3495.mjs";
import { autorun } from "./module-0052.mjs";
import { AGENTS_CENTERED_CONTENT_MAX_WIDTH } from "./module-1498.mjs";
import { setActiveSessionContextKeys } from "./module-1778.mjs";
import { applySessionViewThemeColors } from "./module-3489.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatViewFactory } from "./module-3487.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ISessionChangesStatsCache } from "./module-1777.mjs";


// src/vs/sessions/browser/parts/sessionView.ts
var SessionView = class extends Disposable {
  constructor(_chatViewFactory, instantiationService, contextKeyService, themeService, _changesStatsCache) {
    super();
    this._chatViewFactory = _chatViewFactory;
    this.themeService = themeService;
    this._changesStatsCache = _changesStatsCache;
    this.element = $(".session-view.modern-ui-editor-tab-group");
    this.minimumWidth = 200;
    this.maximumWidth = Number.POSITIVE_INFINITY;
    this.minimumHeight = 200;
    this.maximumHeight = Number.POSITIVE_INFINITY;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._standaloneView = this._register(new MutableDisposable());
    this._openSessionDisposables = this._register(new DisposableStore());
    this._hasOpenedSession = false;
    /** Whether the hosted groups view currently shows a grid (more than one group). */
    this._isGridLayout = false;
    /** Whether this view currently hosts the active session in the grid. */
    this._isActive = true;
    /** Whether the owning {@link SessionsPart} is visible in the workbench grid. */
    this._isPartVisible = true;
    /** Whether this leaf is visible within the part's internal grid. */
    this._isLeafVisible = true;
    this._sessionObs = observableValue(this, void 0);
    const scopedContextKeyService = this._scopedContextKeyService = this._register(contextKeyService.createScoped(this.element));
    this._sessionIsMaximizedKey = SessionIsMaximizedContext.bindTo(scopedContextKeyService);
    const scopedInstantiationService = this._register(instantiationService.createChild(new ServiceCollection(
      [IContextKeyService, scopedContextKeyService],
      [ISessionContext, new SessionContext(this._sessionObs)]
    )));
    this.element.style.setProperty("--session-view-centered-content-max-width", `${SessionView.CENTERED_CONTENT_MAX_WIDTH}px`);
    this._centeredContentContainer = $(".session-view-centered-content");
    this.element.appendChild(this._centeredContentContainer);
    this._header = this._register(scopedInstantiationService.createInstance(SessionHeader));
    this._centeredContentContainer.appendChild(this._header.element);
    this._contentContainer = $(".session-view-content");
    this.element.appendChild(this._contentContainer);
    this._groupsView = this._register(scopedInstantiationService.createInstance(ChatGroupsView));
    this._contentContainer.appendChild(this._groupsView.element);
    this._floatingToolbar = this._register(scopedInstantiationService.createInstance(SessionViewFloatingToolbar));
    this.element.appendChild(this._floatingToolbar.element);
    this._applyActiveSessionStyles();
    this._register(this.themeService.onDidColorThemeChange(() => this._applyActiveSessionStyles()));
    this._register(this._header.onDidChangeVisibility(() => this._layoutChildren()));
    this._register(this._header.onDidChangeHeight(() => this._layoutChildren()));
    this._register(autorun((reader) => {
      const isGridLayout = this._groupsView.groupCount.read(reader) > 1;
      if (this._isGridLayout === isGridLayout) {
        return;
      }
      this._isGridLayout = isGridLayout;
      this.element.classList.toggle("grid-layout", isGridLayout);
      this._layoutChildren();
    }));
    this._register(autorun((reader) => {
      const session = this._sessionObs.read(reader);
      const tabsReplaceHeader = this._groupsView.groupCount.read(reader) === 1 && (session?.isCreated.read(reader) ?? false) && (session?.shouldShowChatTabs.read(reader) ?? false);
      this._header.setVisible(!tabsReplaceHeader);
      this._groupsView.setSingleGroupTabsReplaceHeader(tabsReplaceHeader);
      this.element.classList.toggle("tabs-replace-header", tabsReplaceHeader);
    }));
  }
  static {
    this.TYPE = "sessions.sessionView";
  }
  static {
    this.CENTERED_CONTENT_MAX_WIDTH = AGENTS_CENTERED_CONTENT_MAX_WIDTH;
  }
  openSession(session, options3) {
    if (this._hasOpenedSession && this._currentSession === session) {
      return;
    }
    this._hasOpenedSession = true;
    this._currentSession = session;
    this._sessionObs.set(session, void 0);
    this._openSessionDisposables.clear();
    this._openSessionDisposables.add(this._handleContextKeys(session));
    this._header.setSession(session);
    if (session && !session.isCreated.get()) {
      this._groupsView.setSession(void 0, options3);
      let view = this._standaloneView.value;
      if (!view || view.kind !== "newSession") {
        view = this._chatViewFactory.createNewChatView(false, options3);
        this._standaloneView.value = view;
      }
      if (view.element.parentElement !== this._contentContainer) {
        this._contentContainer.replaceChildren(view.element);
      }
      view.setActive(this._isActive);
      view.setVisible(this._isVisible);
      this._openSessionDisposables.add(autorun((reader) => {
        if (session.isCreated.read(reader) && this._currentSession === session) {
          this._showSessionGroups(session, options3);
        }
      }));
    } else if (session) {
      this._showSessionGroups(session, options3);
    } else {
      this._groupsView.setSession(void 0, options3);
      const view = this._chatViewFactory.createNewChatView(false, options3);
      this._standaloneView.value = view;
      this._contentContainer.replaceChildren(view.element);
      view.setActive(this._isActive);
      view.setVisible(this._isVisible);
    }
    this._floatingToolbar.setSession(session);
    this._layoutChildren();
  }
  _showSessionGroups(session, options3) {
    this._standaloneView.clear();
    this._contentContainer.replaceChildren(this._groupsView.element);
    this._groupsView.setSession(session, options3);
    this._layoutChildren();
  }
  _handleContextKeys(session) {
    return autorun((reader) => {
      setActiveSessionContextKeys(session, this._scopedContextKeyService, reader, this._changesStatsCache);
    });
  }
  layout(width2, height, top2, left) {
    size(this.element, width2, height);
    this._lastLayout = { width: width2, height, top: top2, left };
    this._layoutChildren();
  }
  _layoutChildren() {
    if (!this._lastLayout) {
      return;
    }
    const { width: width2, height, top: top2, left } = this._lastLayout;
    if (!this._isVisible || width2 === 0 || height === 0) {
      return;
    }
    const centeredWidth = this._isGridLayout ? width2 : Math.min(width2, SessionView.CENTERED_CONTENT_MAX_WIDTH);
    this._centeredContentContainer.style.width = `${centeredWidth}px`;
    const barHeight = this._header.visible ? this._header.height : 0;
    size(this._centeredContentContainer, centeredWidth, barHeight);
    const contentHeight = height - barHeight;
    const contentTop = top2 + barHeight;
    const standaloneView = this._standaloneView.value;
    if (standaloneView) {
      standaloneView.layout(width2, contentHeight, contentTop, left);
    } else {
      this._groupsView.layout(width2, contentHeight, contentTop, left);
    }
  }
  toJSON() {
    return { type: SessionView.TYPE };
  }
  focus() {
    const standaloneView = this._standaloneView.value;
    standaloneView ? standaloneView.focus() : this._groupsView.focus();
  }
  /**
   * Starts an inline rename of the session title in the header. Returns
   * `false` when the header cannot host it (e.g. this view is hidden or the
   * chat tabs row replaces the header) so callers can fall back to another
   * rename affordance.
   */
  startTitleEditing() {
    return this._isVisible && this._header.startTitleEditing();
  }
  selectWorkspace(folderUri, providerId) {
    const standaloneView = this._standaloneView.value;
    standaloneView ? standaloneView.selectWorkspace(folderUri, providerId) : this._groupsView.selectWorkspace(folderUri, providerId);
  }
  /** Opens the given chat in a group beside the active one ("open to the side"). */
  openChatToSide(resource) {
    return this._groupsView.openChatInNewGroup(resource);
  }
  /** Places a freshly created chat (e.g. a side chat) into its own group beside the current one. */
  splitChatToSide(resource) {
    this._groupsView.splitChatToSide(resource);
  }
  focusAdjacentChatGroup(direction) {
    this._groupsView.focusAdjacentGroup(direction);
  }
  splitActiveChat(direction) {
    this._groupsView.splitActiveChat(direction);
  }
  moveActiveChatToAdjacentGroup(direction) {
    this._groupsView.moveActiveChatToAdjacentGroup(direction);
  }
  prefillInput(text2) {
    const standaloneView = this._standaloneView.value;
    standaloneView ? standaloneView.prefillInput(text2) : this._groupsView.prefillInput(text2);
  }
  sendQuery(text2) {
    const standaloneView = this._standaloneView.value;
    standaloneView ? standaloneView.sendQuery(text2) : this._groupsView.sendQuery(text2);
  }
  submitInput() {
    return this._standaloneView.value?.submitInput() ?? this._groupsView.submitInput();
  }
  /**
   * Attaches the given resources as context to the active chat group's input.
   */
  attach(uris) {
    const standaloneView = this._standaloneView.value;
    standaloneView ? standaloneView.attach(uris) : this._groupsView.attach(uris);
  }
  /**
   * Updates the view's maximized context key so toolbars hosted within can react.
   * Called by the owning {@link SessionsPart} when the grid's maximized view changes.
   */
  setMaximized(maximized) {
    this._sessionIsMaximizedKey.set(maximized);
  }
  /**
   * Updates whether this view currently hosts the active session in the grid.
   * Forwarded to the inner chat view so it can adjust its visual styling
   * (e.g. dim the list background for inactive sessions).
   */
  setActive(active) {
    if (this._isActive === active) {
      return;
    }
    this._isActive = active;
    this._applyActiveSessionStyles();
    this._groupsView.setSessionActive(active);
    this._standaloneView.value?.setActive(active);
  }
  /**
   * Grid hook invoked by the part's internal split view when this leaf is
   * hidden or shown (e.g. when a sibling session is maximized).
   */
  setVisible(visible) {
    if (this._isLeafVisible === visible) {
      return;
    }
    const wasVisible = this._isVisible;
    this._isLeafVisible = visible;
    this._updateVisibility(wasVisible);
  }
  /**
   * Called by the owning {@link SessionsPart} when the part itself is hidden or
   * shown in the workbench grid. Combined with this leaf's own visibility to
   * form the view's effective visibility.
   */
  setPartVisible(visible) {
    if (this._isPartVisible === visible) {
      return;
    }
    const wasVisible = this._isVisible;
    this._isPartVisible = visible;
    this._updateVisibility(wasVisible);
  }
  /**
   * Whether this view is actually shown. Unrelated to {@link setActive}:
   * inactive sessions shown side by side are still visible.
   */
  get _isVisible() {
    return this._isPartVisible && this._isLeafVisible;
  }
  _updateVisibility(wasVisible) {
    const visible = this._isVisible;
    if (visible === wasVisible) {
      return;
    }
    this._groupsView.setSessionVisible(visible);
    this._standaloneView.value?.setVisible(visible);
    if (visible) {
      this._layoutChildren();
    }
  }
  _applyActiveSessionStyles() {
    this.element.classList.toggle("modern-ui-editor-tab-group-active", this._isActive);
    applySessionViewThemeColors(this.element, this.themeService.getColorTheme(), this._isActive);
  }
};

SessionView = __decorateClass([
  __decorateParam(0, IChatViewFactory),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, ISessionChangesStatsCache)
], SessionView);
export { SessionView };
