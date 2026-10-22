// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/sessionHeader.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { LocalSelectionTransfer } from "./module-0273.mjs";
import { $, DisposableResizeObserver, EventType, addDisposableGenericMouseDownListener, addDisposableListener, addStandardDisposableListener, getWindow, isMouseEvent } from "./module-0075.mjs";
import { SessionStatusIcon } from "./module-3497.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { Menus } from "./module-3437.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { DraggedSessionIdentifier, SessionsDataTransfers } from "./module-3488.mjs";
import { applyDragImage } from "./module-0458.mjs";
import { autorun } from "./module-0052.mjs";
import { getUntitledSessionTitle } from "./module-1767.mjs";
import { applySessionBarThemeColors } from "./module-3489.mjs";
import { localize } from "./module-0001.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";


// src/vs/sessions/browser/parts/sessionHeader.ts
var SessionHeader = class extends Disposable {
  constructor(_themeService, instantiationService, _contextMenuService, _contextKeyService, _sessionsManagementService) {
    super();
    this._themeService = _themeService;
    this._contextMenuService = _contextMenuService;
    this._contextKeyService = _contextKeyService;
    this._sessionsManagementService = _sessionsManagementService;
    this._sessionDisposables = this._register(new MutableDisposable());
    this._editingDisposables = this._register(new MutableDisposable());
    this._sessionIsCreated = false;
    this._requestedVisible = true;
    this._onDidChangeVisibility = this._register(new Emitter());
    this.onDidChangeVisibility = this._onDidChangeVisibility.event;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._visible = false;
    this._sessionTransfer = LocalSelectionTransfer.getInstance();
    this._container = $(".chat-composite-bar.session-header-bar");
    const header2 = $(".chat-composite-bar-header");
    this._container.appendChild(header2);
    this._iconEl = $(".chat-composite-bar-session-icon");
    header2.appendChild(this._iconEl);
    this._statusIcon = this._register(instantiationService.createInstance(SessionStatusIcon, this._iconEl));
    const main2 = $(".chat-composite-bar-header-main");
    header2.appendChild(main2);
    const titleRow = $(".chat-composite-bar-title-row");
    main2.appendChild(titleRow);
    this._titleEl = $(".chat-composite-bar-session-title");
    titleRow.appendChild(this._titleEl);
    this._titleTextEl = $("span.chat-composite-bar-session-title-text");
    this._titleEl.appendChild(this._titleTextEl);
    this._register(addDisposableListener(this._titleEl, EventType.CLICK, () => {
      this.startTitleEditing();
    }));
    const titleActions = $(".chat-composite-bar-title-actions");
    titleRow.appendChild(titleActions);
    this._titleActionsEl = titleActions;
    const toolbarContainer = $(".chat-composite-bar-toolbar");
    titleActions.appendChild(toolbarContainer);
    this._toolbar = this._register(instantiationService.createInstance(MenuWorkbenchToolBar, toolbarContainer, Menus.SessionBarToolbar, {
      hiddenItemStrategy: 0 /* Ignore */,
      menuOptions: { shouldForwardArgs: true },
      highlightToggledItems: true
    }));
    const heightObserver = this._register(new DisposableResizeObserver("SessionHeader.height", () => {
      this._onDidChangeHeight.fire();
    }));
    this._register(heightObserver.observe(this._container));
    this._applyVisibility(false);
    this._updateStyles();
    this._register(this._themeService.onDidColorThemeChange(() => this._updateStyles()));
    this._registerDragSource();
    this._registerContextMenu();
  }
  get element() {
    return this._container;
  }
  get visible() {
    return this._visible;
  }
  get height() {
    return this._visible ? this._container.offsetHeight : 0;
  }
  _registerContextMenu() {
    this._register(addDisposableListener(this._container, EventType.CONTEXT_MENU, (e4) => {
      const session = this._session;
      if (!session) {
        return;
      }
      let anchor = this._container;
      if (isMouseEvent(e4)) {
        anchor = new StandardMouseEvent(getWindow(this._container), e4);
      }
      e4.preventDefault();
      e4.stopPropagation();
      this._contextMenuService.showContextMenu({
        menuId: Menus.SessionHeaderContext,
        menuActionOptions: { shouldForwardArgs: true, arg: session },
        getAnchor: () => anchor,
        contextKeyService: this._contextKeyService
      });
    }));
  }
  _registerDragSource() {
    this._container.draggable = true;
    this._register(addDisposableGenericMouseDownListener(this._container, (e4) => {
      this._lastPointerDownTarget = e4.target ?? void 0;
    }));
    this._register(addDisposableListener(this._container, EventType.DRAG_START, (e4) => {
      const session = this._session;
      if (!session || !e4.dataTransfer) {
        e4.preventDefault();
        return;
      }
      const target = this._lastPointerDownTarget;
      if (target && this._titleActionsEl.contains(target)) {
        e4.preventDefault();
        return;
      }
      if (this._renameInput) {
        e4.preventDefault();
        return;
      }
      this._sessionTransfer.setData(
        [new DraggedSessionIdentifier(session.sessionId, session.resource)],
        DraggedSessionIdentifier.prototype
      );
      const payload = JSON.stringify({ sessionId: session.sessionId, resource: session.resource.toString() });
      e4.dataTransfer.setData(SessionsDataTransfers.SESSION, payload);
      e4.dataTransfer.effectAllowed = "move";
      applyDragImage(e4, this._container, session.title.get());
    }));
    this._register(addDisposableListener(this._container, EventType.DRAG_END, () => {
      this._sessionTransfer.clearData(DraggedSessionIdentifier.prototype);
    }));
  }
  /**
   * Tells the header which session is currently relevant. Pass `undefined` to clear.
   */
  setSession(session) {
    if (this._session === session) {
      return;
    }
    this._cancelTitleEditing();
    this._session = session;
    this._toolbar.context = session;
    this._statusIcon.reset();
    const store = new DisposableStore();
    this._sessionDisposables.value = store;
    if (!session) {
      this._sessionIsCreated = false;
      this._updateVisibility();
      return;
    }
    store.add(autorun((reader) => {
      this._updateHeader(session, reader);
    }));
    store.add(autorun((reader) => {
      this._sessionIsCreated = session.isCreated.read(reader);
      this._updateVisibility();
    }));
  }
  setVisible(visible) {
    if (this._requestedVisible === visible) {
      return;
    }
    this._requestedVisible = visible;
    this._updateVisibility();
  }
  _updateVisibility() {
    this._applyVisibility(this._sessionIsCreated && this._requestedVisible);
  }
  _updateHeader(session, reader) {
    const status2 = session.status.read(reader);
    const isRead = session.isRead.read(reader);
    const isArchived = session.isArchived.read(reader);
    this._statusIcon.setStatus(status2, isRead, isArchived);
    const isQuickChat2 = session.isQuickChat?.read(reader) ?? false;
    this._titleTextEl.textContent = session.title.read(reader) || getUntitledSessionTitle(isQuickChat2);
    this._titleEl.classList.toggle("editable", this._isTitleEditable());
    this._onDidChangeHeight.fire();
  }
  _applyVisibility(visible) {
    const wasVisible = this._visible;
    this._visible = visible;
    this._container.style.display = this._visible ? "" : "none";
    if (wasVisible !== this._visible) {
      this._onDidChangeVisibility.fire(this._visible);
    }
  }
  _updateStyles() {
    applySessionBarThemeColors(this._container, this._themeService.getColorTheme());
  }
  /**
   * The title is editable when the backing provider declares it supports
   * renaming the session (`capabilities.supportsRename`). This is the same
   * signal that gates the `Rename...` context menu action in the sessions list.
   */
  _isTitleEditable() {
    return !!this._session && (this._session.capabilities.get().supportsRename ?? false);
  }
  /**
   * Starts an inline rename of the session title. Returns `false` when the
   * header cannot host it — the header is hidden (e.g. while the single-group
   * chat tabs row replaces it) or the session cannot be renamed — so callers
   * can fall back to another rename affordance.
   */
  startTitleEditing() {
    if (!this._visible || !this._isTitleEditable()) {
      return false;
    }
    if (this._renameInput) {
      this._renameInput.focus();
      this._renameInput.select();
      return true;
    }
    this._startTitleEditing();
    return true;
  }
  /**
   * Replace the rendered title text with an `<input>` containing the current
   * title (pre-selected). Enter commits via {@link ISessionsManagementService.renameChat},
   * Escape or blur cancels.
   */
  _startTitleEditing() {
    const session = this._session;
    if (!session || this._renameInput) {
      return;
    }
    const initialTitle = session.title.get();
    const fallbackTitle = getUntitledSessionTitle(session.isQuickChat?.get() ?? false);
    const input = document.createElement("input");
    input.type = "text";
    input.className = "chat-composite-bar-session-title-input";
    input.value = initialTitle;
    input.placeholder = fallbackTitle;
    input.setAttribute("aria-label", localize(3844, null));
    input.spellcheck = false;
    this._titleTextEl.style.display = "none";
    this._titleEl.appendChild(input);
    this._titleEl.classList.add("editing");
    this._renameInput = input;
    input.focus();
    input.select();
    const store = new DisposableStore();
    this._editingDisposables.value = store;
    let finished = false;
    const finish = (commit) => {
      if (finished) {
        return;
      }
      finished = true;
      const newTitle = input.value.trim();
      this._endTitleEditing();
      if (commit && newTitle && newTitle !== initialTitle) {
        this._sessionsManagementService.renameSession(session, newTitle).catch(onUnexpectedError);
      }
    };
    store.add(addStandardDisposableListener(input, EventType.KEY_DOWN, (e4) => {
      if (e4.equals(3 /* Enter */)) {
        e4.preventDefault();
        e4.stopPropagation();
        finish(true);
      } else if (e4.equals(9 /* Escape */)) {
        e4.preventDefault();
        e4.stopPropagation();
        finish(false);
      } else {
        e4.stopPropagation();
      }
    }));
    store.add(addDisposableListener(input, EventType.BLUR, () => {
      finish(false);
    }));
    store.add(addDisposableGenericMouseDownListener(input, (e4) => e4.stopPropagation()));
    store.add(addDisposableListener(input, EventType.CLICK, (e4) => e4.stopPropagation()));
  }
  _cancelTitleEditing() {
    if (!this._renameInput) {
      return;
    }
    this._endTitleEditing();
  }
  _endTitleEditing() {
    if (this._renameInput) {
      this._renameInput.remove();
      this._renameInput = void 0;
    }
    this._titleTextEl.style.display = "";
    this._titleEl.classList.remove("editing");
    this._editingDisposables.clear();
  }
};

SessionHeader = __decorateClass([
  __decorateParam(0, IThemeService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, ISessionsManagementService)
], SessionHeader);

var SessionViewFloatingToolbar = class extends Disposable {
  constructor(instantiationService) {
    super();
    this._sessionDisposables = this._register(new MutableDisposable());
    this._container = $(".chat-composite-bar.chat-composite-bar-toolbar-floating");
    const toolbar = $(".chat-composite-bar-toolbar");
    this._container.appendChild(toolbar);
    this._toolbar = this._register(instantiationService.createInstance(MenuWorkbenchToolBar, toolbar, Menus.SessionBarToolbar, {
      hiddenItemStrategy: 0 /* Ignore */,
      menuOptions: { shouldForwardArgs: true },
      highlightToggledItems: true
    }));
    this._setVisible(false);
  }
  get element() {
    return this._container;
  }
  setSession(session) {
    if (this._session === session) {
      return;
    }
    this._session = session;
    this._toolbar.context = session;
    const store = new DisposableStore();
    this._sessionDisposables.value = store;
    if (!session) {
      this._setVisible(false);
      return;
    }
    store.add(autorun((reader) => {
      this._setVisible(!session.isCreated.read(reader));
    }));
  }
  _setVisible(visible) {
    this._container.style.display = visible ? "" : "none";
  }
};

SessionViewFloatingToolbar = __decorateClass([
  __decorateParam(0, IInstantiationService)
], SessionViewFloatingToolbar);
export { SessionHeader, SessionViewFloatingToolbar };
