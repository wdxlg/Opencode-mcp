// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/sessionsPart.ts
import { Part } from "./module-1563.mjs";
import { Emitter } from "./module-0017.mjs";
import { ActiveSessionsContext, MultipleSessionsVisibleContext, SessionsFocusContext } from "./module-1770.mjs";
import { SessionsChatBackgroundRenderer } from "./module-3502.mjs";
import { $, EventType, addDisposableGenericMouseDownListener, addDisposableListener, isAncestor, trackFocus } from "./module-0075.mjs";
import { ProgressBar } from "./module-1330.mjs";
import { defaultProgressBarStyles } from "./module-0513.mjs";
import { SerializableGrid, Sizing2 } from "./module-1508.mjs";
import { SessionDropTarget } from "./module-3501.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { AbstractProgressScope, ScopedProgressIndicator } from "./module-1331.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { SessionView } from "./module-3500.mjs";
import { agentsPanelBorder } from "./module-1496.mjs";
import { contrastBorder } from "./module-0227.mjs";
import { Color } from "./module-0197.mjs";
import { applyAgentsPartCardStyles, getAgentsPartCardContentSize } from "./module-3465.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IAgentWorkbenchLayoutService } from "./module-3474.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ISessionsChatBackgroundService } from "./module-3503.mjs";


// src/vs/sessions/browser/parts/sessionsPart.ts
var SessionsPart = class extends Part {
  constructor(themeService, storageService, agentWorkbenchLayoutService, contextKeyService, instantiationService, chatBackgroundService) {
    super(
      "workbench.parts.sessions" /* SESSIONS_PART */,
      { hasTitle: false, borderWidth: () => 0 },
      themeService,
      storageService,
      agentWorkbenchLayoutService
    );
    this.agentWorkbenchLayoutService = agentWorkbenchLayoutService;
    this.instantiationService = instantiationService;
    this.chatBackgroundService = chatBackgroundService;
    this.minimumWidth = 300;
    this.maximumWidth = Number.POSITIVE_INFINITY;
    this.minimumHeight = 0;
    this.maximumHeight = Number.POSITIVE_INFINITY;
    /**
     * Session views mounted in the grid, in display order (left-to-right). Slots
     * are reused across reconciliations: only the slot count changes with the
     * number of visible sessions; each slot is rebound to its session by position
     * via {@link SessionView.openSession}. There is always at least one slot — a
     * new-session placeholder (`boundSessionId === undefined`) when no sessions
     * are visible.
     */
    this._slots = [];
    this._onDidFocusSession = this._register(new Emitter());
    /** Fired when a session view in the grid receives keyboard focus. */
    this.onDidFocusSession = this._onDidFocusSession.event;
    /**
     * Whether the part itself is visible in the workbench grid. Starts `true`
     * because the workbench grid only calls {@link setVisible} on change.
     */
    this._isPartVisible = true;
    this.priority = 2 /* High */;
    ActiveSessionsContext.bindTo(contextKeyService);
    this._sessionsFocusKey = SessionsFocusContext.bindTo(contextKeyService);
    this._multipleSessionsVisibleKey = MultipleSessionsVisibleContext.bindTo(contextKeyService);
  }
  get snap() {
    return false;
  }
  static {
    /** Border width on the card (1px each side) */
    this.BORDER_WIDTH = 1;
  }
  get preferredHeight() {
    return this.layoutService.mainContainerDimension.height * 0.4;
  }
  create(parent) {
    this.element = parent;
    parent.classList.add("sessionspart");
    super.create(parent);
  }
  createContentArea(parent) {
    const backgroundRenderer = this._register(new SessionsChatBackgroundRenderer(parent));
    const updateBackground = () => backgroundRenderer.setBackground(this.chatBackgroundService.getBackground());
    this._register(this.chatBackgroundService.onDidChangeBackground(updateBackground));
    updateBackground();
    const contentArea = $(".content");
    parent.appendChild(contentArea);
    const focusTracker = this._register(trackFocus(contentArea));
    this._register(focusTracker.onDidFocus(() => this._sessionsFocusKey.set(true)));
    this._register(focusTracker.onDidBlur(() => this._sessionsFocusKey.set(false)));
    this._progressBar = this._register(new ProgressBar(contentArea, defaultProgressBarStyles));
    this._progressBar.hide();
    const placeholder = this._createSlot();
    this._gridWidget = this._register(new SerializableGrid(placeholder.view, { styles: { separatorBorder: this._gridSeparatorBorder } }));
    this._slots.push(placeholder);
    contentArea.appendChild(this._gridWidget.element);
    this._register(this._gridWidget.onDidChangeViewMaximized(() => this._updateMaximizedState()));
    const dropDelegate = {
      findTargetView: (child) => this._findTargetView(child)
    };
    this._register(this.instantiationService.createInstance(SessionDropTarget, contentArea, dropDelegate));
    return contentArea;
  }
  _findTargetView(child) {
    for (const slot of this._slots) {
      if (slot.boundSessionId === void 0) {
        continue;
      }
      if (isAncestor(child, slot.view.element)) {
        return { sessionId: slot.boundSessionId, element: slot.view.element };
      }
    }
    return void 0;
  }
  /**
   * Reconcile the grid with the desired set of visible sessions. Reuses the
   * existing {@link SessionView} slots, growing or shrinking the pool only when
   * the number of visible sessions changes, and rebinds each slot to its
   * session by position via {@link SessionView.openSession}.
   */
  updateVisibleSessions(visible, active) {
    if (!this._gridWidget) {
      return;
    }
    const desiredCount = Math.max(visible.length, 1);
    while (this._slots.length < desiredCount) {
      const slot = this._createSlot();
      const reference = this._slots[this._slots.length - 1].view;
      this._gridWidget.addView(slot.view, Sizing2.Distribute, reference, 3 /* Right */);
      this._slots.push(slot);
    }
    while (this._slots.length > desiredCount) {
      const slot = this._slots.pop();
      this._gridWidget.removeView(slot.view, Sizing2.Distribute);
      slot.disposables.dispose();
    }
    for (let i2 = 0; i2 < this._slots.length; i2++) {
      const slot = this._slots[i2];
      const session = visible[i2];
      slot.boundSessionId = session?.sessionId;
      slot.view.openSession(session, {});
    }
    const activeId = active?.sessionId;
    for (const slot of this._slots) {
      const isActive2 = slot.boundSessionId !== void 0 && slot.boundSessionId === activeId || this._slots.length === 1;
      slot.view.element.classList.toggle("is-active", isActive2);
      slot.view.setActive(isActive2);
    }
    if (this._gridWidget.hasMaximizedView()) {
      const maximizedSlot = this._slots.find((s) => this._gridWidget.isViewMaximized(s.view));
      if (maximizedSlot && maximizedSlot.boundSessionId !== activeId) {
        this._gridWidget.exitMaximizedView();
      }
    }
    this._updateContextKeys(visible);
  }
  _updateContextKeys(visible) {
    this._multipleSessionsVisibleKey.set(visible.length > 1);
  }
  /**
   * Pushes the grid's current maximized state into each {@link SessionView} so
   * its scoped `sessionIsMaximized` context key (used by toolbar actions) is
   * accurate. Called whenever the grid emits a maximize change.
   */
  _updateMaximizedState() {
    if (!this._gridWidget) {
      return;
    }
    for (const slot of this._slots) {
      slot.view.setMaximized(this._gridWidget.isViewMaximized(slot.view));
    }
  }
  /**
   * Toggles the maximized state of the session view hosting the given session.
   * If the view is already maximized, exits maximized state. Otherwise maximizes
   * it (no-op if fewer than two non-placeholder views are present).
   *
   * Returns the view's maximized state after the toggle, or `undefined` when
   * the call was a no-op.
   */
  toggleMaximizeSession(sessionId) {
    if (!this._gridWidget) {
      return void 0;
    }
    const slot = this._slots.find((s) => s.boundSessionId === sessionId);
    if (!slot) {
      return void 0;
    }
    if (this._gridWidget.isViewMaximized(slot.view)) {
      this._gridWidget.exitMaximizedView();
      return false;
    } else if (this._slots.filter((s) => s.boundSessionId !== void 0).length >= 2) {
      this._gridWidget.maximizeView(slot.view);
      slot.view.focus();
      return true;
    }
    return void 0;
  }
  /**
   * Returns the {@link SessionView} currently hosting the given session id, or
   * the placeholder (new-session) view when `sessionId` is `undefined`. Returns
   * `undefined` if no matching slot exists in the grid.
   */
  getSessionView(sessionId) {
    return this._slots.find((s) => s.boundSessionId === sessionId)?.view;
  }
  /**
   * Moves keyboard focus into the session view hosting the given session id (or
   * the placeholder view when `sessionId` is `undefined`), first revealing it in
   * the grid when it is only partially visible. No-op if no matching slot exists.
   */
  focusSession(sessionId) {
    const slot = this._slots.find((s) => s.boundSessionId === sessionId);
    if (!slot) {
      return;
    }
    this._revealView(slot.view);
    slot.view.focus();
  }
  /**
   * Ensures the given view is fully visible within the grid. The grid clips its
   * leaves (`overflow: hidden`) and lays them out side by side; when there are
   * more sessions than fit, the grid's split view overflows horizontally and
   * becomes scrollable, leaving views near the edges partially hidden. When the
   * target view is not fully visible, scroll it into view.
   */
  _revealView(view) {
    if (!this._gridWidget) {
      return;
    }
    const containerRect = this._gridWidget.element.getBoundingClientRect();
    const viewRect = view.element.getBoundingClientRect();
    const isFullyVisible = viewRect.left >= containerRect.left - 1 && viewRect.right <= containerRect.right + 1;
    if (!isFullyVisible) {
      view.element.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }
  /**
   * Returns the progress indicator for the part. Drives the progress bar shown
   * at the top of the content area. Indicator state is scoped to the part's
   * visibility, mirroring how view panes manage their own progress indicators.
   */
  getProgressIndicator() {
    if (!this._progressIndicator) {
      const progressBar = assertReturnsDefined(this._progressBar);
      const scopeId = "workbench.parts.sessions" /* SESSIONS_PART */;
      const isVisible = this.layoutService.isVisible(scopeId);
      const onDidVisibilityChange = this.onDidVisibilityChange;
      const scope = this._register(new class extends AbstractProgressScope {
        constructor() {
          super(scopeId, isVisible);
          this._register(onDidVisibilityChange((visible) => visible ? this.onScopeOpened(scopeId) : this.onScopeClosed(scopeId)));
        }
      }());
      this._progressIndicator = this._register(new ScopedProgressIndicator(progressBar, scope));
    }
    return this._progressIndicator;
  }
  _createSlot() {
    const disposables = new DisposableStore();
    const view = disposables.add(this.instantiationService.createInstance(SessionView));
    view.setPartVisible(this._isPartVisible);
    const slot = { view, disposables, boundSessionId: void 0 };
    const fireFocus = () => {
      if (slot.boundSessionId !== void 0) {
        this._restoreSessionOnActivation(view);
        this._onDidFocusSession.fire(slot.boundSessionId);
      }
    };
    disposables.add(addDisposableListener(view.element, EventType.FOCUS_IN, fireFocus, true));
    disposables.add(addDisposableGenericMouseDownListener(view.element, fireFocus, true));
    return slot;
  }
  _restoreSessionOnActivation(view) {
    if (!this._gridWidget) {
      return;
    }
    const viewSize = this._gridWidget.getViewSize(view);
    if (viewSize.width === view.minimumWidth) {
      this._gridWidget.expandView(view);
    }
  }
  get _gridSeparatorBorder() {
    return this.theme.getColor(agentsPanelBorder) || this.theme.getColor(contrastBorder) || Color.transparent;
  }
  updateStyles() {
    super.updateStyles();
    const container2 = assertReturnsDefined(this.getContainer());
    applyAgentsPartCardStyles(container2, this.theme);
    this._gridWidget?.style({ separatorBorder: this._gridSeparatorBorder });
  }
  setVisible(visible) {
    if (this._isPartVisible !== visible) {
      this._isPartVisible = visible;
      for (const slot of this._slots) {
        slot.view.setPartVisible(visible);
      }
    }
    super.setVisible(visible);
  }
  layout(width2, height, top2, left) {
    if (!this.layoutService.isVisible("workbench.parts.sessions" /* SESSIONS_PART */)) {
      return;
    }
    this._lastLayout = { width: width2, height, top: top2, left };
    const cardSize = getAgentsPartCardContentSize(width2, height, this.agentWorkbenchLayoutService.isEditorPaneVisible());
    const { contentSize } = this.layoutContents(cardSize.width, cardSize.height);
    this._gridWidget?.layout(contentSize.width, contentSize.height, top2, left);
    super.layout(width2, height, top2, left);
  }
  dispose() {
    for (const slot of this._slots) {
      slot.disposables.dispose();
    }
    this._slots.length = 0;
    super.dispose();
  }
  toJSON() {
    return {
      type: "workbench.parts.sessions" /* SESSIONS_PART */
    };
  }
};

SessionsPart = __decorateClass([
  __decorateParam(0, IThemeService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IAgentWorkbenchLayoutService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, ISessionsChatBackgroundService)
], SessionsPart);
export { SessionsPart };
