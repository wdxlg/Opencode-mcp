// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/chatCompositeBar.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, DisposableResizeObserver, EventHelper, EventType, addDisposableGenericMouseDownListener, addDisposableGenericMouseUpListener, addDisposableListener, addStandardDisposableListener, getWindow, isHTMLElement, reset } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { ScrollableElement } from "./module-0259.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { Menus } from "./module-3437.mjs";
import { isLinux } from "./module-0014.mjs";
import { autorun } from "./module-0052.mjs";
import { getSessionConversationStatusAriaLabel } from "./module-3490.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { CLOSE_CHAT_COMMAND_ID } from "./module-1800.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { clearChatReferenceDragData, fillChatReferenceDragData, fillSessionChatDragData } from "./module-3488.mjs";
import { applyDragImage } from "./module-0458.mjs";
import { Action } from "./module-0082.mjs";
import { getChatCapabilities } from "./module-1767.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { isAgentHostProvider } from "./module-1764.mjs";
import { InputBox } from "./module-0600.mjs";
import { defaultInputBoxStyles } from "./module-0513.mjs";
import { applySessionBarThemeColors } from "./module-3489.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { IContextMenuService, IContextViewService } from "./module-0488.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/sessions/browser/parts/chatCompositeBar.ts
var ChatCompositeBar = class extends Disposable {
  constructor(resizeObserverCtor, _themeService, _sessionsManagementService, _contextMenuService, _contextViewService, _hoverService, _instantiationService, _sessionsProvidersService, _commandService) {
    super();
    this._themeService = _themeService;
    this._sessionsManagementService = _sessionsManagementService;
    this._contextMenuService = _contextMenuService;
    this._contextViewService = _contextViewService;
    this._hoverService = _hoverService;
    this._instantiationService = _instantiationService;
    this._sessionsProvidersService = _sessionsProvidersService;
    this._commandService = _commandService;
    this._tabs = [];
    this._tabDisposables = this._register(new DisposableStore());
    this._groupDisposables = this._register(new MutableDisposable());
    this._editingDisposables = this._register(new MutableDisposable());
    this._showSessionActions = false;
    this._onDidChangeVisibility = this._register(new Emitter());
    this.onDidChangeVisibility = this._onDidChangeVisibility.event;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._visible = false;
    this._height = 0;
    this._container = $(".chat-composite-bar.session-chat-tabs-bar");
    this._tabsRow = $(".chat-composite-bar-tabs-row");
    this._container.appendChild(this._tabsRow);
    this._tabsContainer = $(".chat-composite-bar-tabs");
    this._tabsContainer.setAttribute("role", "tablist");
    this._tabsContainer.setAttribute("aria-label", localize(3772, null));
    this._tabsScrollbar = this._register(new ScrollableElement(this._tabsContainer, {
      horizontal: 2 /* Hidden */,
      vertical: 2 /* Hidden */,
      scrollYToX: true,
      useShadows: false
    }));
    this._tabsRow.appendChild(this._tabsScrollbar.getDomNode());
    this._sessionActionsContainer = $(".session-chat-tabs-actions");
    this._tabsRow.appendChild(this._sessionActionsContainer);
    const sessionToolbarContainer = $(".chat-composite-bar-toolbar");
    this._sessionActionsContainer.appendChild(sessionToolbarContainer);
    this._sessionToolbar = this._register(this._instantiationService.createInstance(MenuWorkbenchToolBar, sessionToolbarContainer, Menus.SessionBarToolbar, {
      hiddenItemStrategy: 0 /* Ignore */,
      menuOptions: { shouldForwardArgs: true },
      highlightToggledItems: true
    }));
    const preventMiddleButtonDefault = (e4) => {
      if (e4.button === 1 && !this._isInTabInput(e4)) {
        e4.preventDefault();
      }
    };
    this._register(addDisposableGenericMouseDownListener(this._tabsContainer, preventMiddleButtonDefault));
    if (isLinux) {
      this._register(addDisposableGenericMouseUpListener(this._tabsContainer, preventMiddleButtonDefault));
    }
    this._register(addDisposableListener(this._tabsContainer, EventType.SCROLL, () => {
      this._tabsScrollbar.setScrollPosition({ scrollLeft: this._tabsContainer.scrollLeft });
    }));
    this._register(this._tabsScrollbar.onScroll((e4) => {
      if (e4.scrollLeftChanged) {
        this._tabsContainer.scrollLeft = e4.scrollLeft;
      }
    }));
    const resizeObserver = this._register(new DisposableResizeObserver("ChatCompositeBar.activeTabReveal", () => {
      this._updateScrollDimensions();
      this._revealActiveTab();
    }));
    this._register(resizeObserver.observe(this._tabsContainer));
    const heightObserver = this._register(new DisposableResizeObserver("ChatCompositeBar.height", (entries2) => {
      const entry = entries2.find((entry2) => entry2.target === this._container);
      if (!entry) {
        return;
      }
      const height = entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height;
      if (this._height !== height) {
        this._height = height;
        this._onDidChangeHeight.fire();
      }
    }, getWindow(this._container), { resizeObserverCtor }));
    this._register(heightObserver.observe(this._container, { box: "border-box" }));
    this._setVisible(false);
    this._updateStyles();
    this._register(this._themeService.onDidColorThemeChange(() => this._updateStyles()));
  }
  get element() {
    return this._container;
  }
  get visible() {
    return this._visible;
  }
  get height() {
    return this._visible ? this._height : 0;
  }
  /**
   * Tells the bar which chat group to render. The bar will display the chats
   * of the given group and track its active chat. Pass `undefined` to clear.
   */
  setGroup(delegate) {
    if (this._delegate === delegate) {
      return;
    }
    this._delegate = delegate;
    this._sessionToolbar.context = delegate?.session;
    const store = new DisposableStore();
    this._groupDisposables.value = store;
    if (!delegate) {
      this._rebuildTabs([], "");
      this._setVisible(false);
      return;
    }
    this._setVisible(false);
    store.add(autorun((reader) => {
      const chats = delegate.chats.read(reader);
      const mainChatUri = delegate.mainChatResource.read(reader);
      this._rebuildTabs(chats, mainChatUri);
    }));
    store.add(autorun((reader) => {
      this._updateActiveTab(delegate.activeChatResource.read(reader));
    }));
    store.add(autorun((reader) => {
      this._showSessionActions = delegate.showSessionActions.read(reader);
      this._sessionActionsContainer.classList.toggle("hidden", !this._showSessionActions);
    }));
    store.add(autorun((reader) => {
      this._setVisible(delegate.visible.read(reader));
    }));
  }
  setAriaLabel(label3) {
    this._tabsContainer.setAttribute("aria-label", label3);
  }
  _rebuildTabs(chats, mainChatId) {
    this._cancelTabEditing();
    this._tabDisposables.clear();
    this._tabs.length = 0;
    reset(this._tabsContainer);
    for (const chat of chats) {
      this._createTab(chat, chat.resource.toString() === mainChatId);
    }
    this._updateActiveTab(this._delegate?.activeChatResource.get() ?? "");
    this._updateScrollDimensions();
  }
  _updateScrollDimensions() {
    this._tabsScrollbar.setScrollDimensions({
      width: this._tabsContainer.clientWidth,
      scrollWidth: this._tabsContainer.scrollWidth
    });
  }
  _createTab(chat, isMainChat) {
    const delegate = this._delegate;
    const session = delegate?.session;
    const tab = $(".chat-composite-bar-tab.modern-ui-editor-tab");
    tab.tabIndex = 0;
    tab.setAttribute("role", "tab");
    tab.draggable = true;
    tab.dataset.chatResource = chat.resource.toString();
    tab.dataset.isMainChat = String(isMainChat);
    const tabFill = $(".chat-composite-bar-tab-fill.modern-ui-editor-tab-fill", { "aria-hidden": true });
    tab.appendChild(tabFill);
    const labelEl = $(".chat-composite-bar-tab-label.modern-ui-editor-tab-label");
    this._tabDisposables.add(autorun((reader) => {
      const title = chat.title.read(reader);
      const status2 = chat.status.read(reader);
      labelEl.textContent = title;
      tab.setAttribute("aria-label", localize(3771, null, title, getSessionConversationStatusAriaLabel(status2)));
    }));
    const lockIcon = $(".chat-composite-bar-tab-lock");
    lockIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.lock));
    tab.appendChild(lockIcon);
    this._tabDisposables.add(autorun((reader) => {
      const isReadOnly2 = chat.interactivity.read(reader) === "read-only" /* ReadOnly */;
      tab.classList.toggle("read-only", isReadOnly2);
      tab.dataset.interactivity = chat.interactivity.read(reader);
    }));
    tab.appendChild(labelEl);
    const inputContainer = $(".chat-composite-bar-tab-input-container");
    tab.appendChild(inputContainer);
    this._tabDisposables.add(this._hoverService.setupManagedHover(
      getDefaultHoverDelegate("element"),
      tab,
      () => chat.title.get()
    ));
    this._tabDisposables.add(autorun((reader) => {
      const status2 = chat.status.read(reader);
      tab.classList.toggle("untitled", status2 === 0 /* Untitled */);
    }));
    const indicator = $(".chat-composite-bar-tab-indicator");
    const indicatorIcon = $(".chat-composite-bar-tab-indicator-icon");
    indicator.appendChild(indicatorIcon);
    this._tabDisposables.add(autorun((reader) => {
      const isActive2 = delegate?.activeChatResource.read(reader) === chat.resource.toString();
      const status2 = chat.status.read(reader);
      const isRead = chat.isRead.read(reader);
      let mode = "none";
      if (status2 === 2 /* NeedsInput */) {
        mode = "needs-input";
      } else if (status2 === 1 /* InProgress */) {
        mode = "in-progress";
      } else if (!isRead && !isActive2) {
        mode = "unread";
      }
      tab.classList.toggle("needs-input", mode === "needs-input");
      tab.classList.toggle("unread", mode === "unread");
      tab.classList.toggle("in-progress", mode === "in-progress");
      indicatorIcon.className = "chat-composite-bar-tab-indicator-icon";
      if (mode === "in-progress") {
        indicatorIcon.classList.add(...ThemeIcon.asClassNameArray(ThemeIcon.modify(Codicon.loading, "spin")));
      }
    }));
    tab.appendChild(indicator);
    if (!isMainChat && session) {
      const actionsContainer = $(".chat-composite-bar-tab-actions");
      tab.appendChild(actionsContainer);
      const tabToolbar = this._tabDisposables.add(this._instantiationService.createInstance(MenuWorkbenchToolBar, actionsContainer, Menus.SessionChatTab, {
        hiddenItemStrategy: 0 /* Ignore */,
        menuOptions: { shouldForwardArgs: true },
        toolbarOptions: { primaryGroup: () => true }
      }));
      tabToolbar.context = { session, chat };
    }
    this._tabsContainer.appendChild(tab);
    const chatTab = { chat, element: tab, inputContainer };
    this._tabDisposables.add(addDisposableListener(tab, EventType.CLICK, () => {
      this._cancelTabEditing();
      this._delegate?.openChat(chat.resource);
    }));
    this._tabDisposables.add(addDisposableListener(tab, EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        e4.preventDefault();
        this._delegate?.openChat(chat.resource);
      }
    }));
    this._tabDisposables.add(addDisposableListener(tab, EventType.AUXCLICK, (e4) => {
      if (e4.button !== 1) {
        return;
      }
      if (this._isInTabInput(e4)) {
        return;
      }
      EventHelper.stop(e4, true);
      if (isMainChat || !session) {
        return;
      }
      this._cancelTabEditing();
      void this._commandService.executeCommand(CLOSE_CHAT_COMMAND_ID, { session, chat }).catch(onUnexpectedError);
    }));
    this._tabDisposables.add(addDisposableListener(tab, EventType.DRAG_START, (e4) => {
      if (!delegate || !e4.dataTransfer) {
        e4.preventDefault();
        return;
      }
      const target = e4.target;
      if (target?.closest(".chat-composite-bar-tab-actions")) {
        e4.preventDefault();
        return;
      }
      if (this._editingTab) {
        e4.preventDefault();
        return;
      }
      this._cancelTabEditing();
      fillSessionChatDragData(e4, delegate.session.sessionId, chat.resource);
      const backendChatResource = this._backendChatResource(chat);
      if (backendChatResource) {
        fillChatReferenceDragData(e4, backendChatResource, chat.resource, chat.title.get());
      }
      e4.dataTransfer.effectAllowed = "copyMove";
      applyDragImage(e4, tab, chat.title.get());
      delegate.onTabDragStart?.(chat.resource);
    }));
    this._tabDisposables.add(addDisposableListener(tab, EventType.DRAG_END, () => {
      clearChatReferenceDragData();
      this._delegate?.onTabDragEnd?.();
    }));
    const renameAction = this._tabDisposables.add(new Action("sessionCompositeBar.renameChat", localize(3774, null), void 0, true, async () => {
      this._startTabEditing(chatTab);
    }));
    const deleteAction = this._tabDisposables.add(new Action("sessionCompositeBar.deleteChat", localize(3773, null), void 0, true, async () => {
      if (delegate) {
        await this._sessionsManagementService.deleteChat(delegate.session, chat.resource);
      }
    }));
    this._tabDisposables.add(addDisposableListener(tab, EventType.DBLCLICK, (e4) => {
      if (chat.status.get() === 0 /* Untitled */ || !getChatCapabilities(chat, session, void 0).canRename) {
        return;
      }
      e4.preventDefault();
      e4.stopPropagation();
      this._startTabEditing(chatTab);
    }));
    this._tabDisposables.add(addDisposableListener(tab, EventType.CONTEXT_MENU, (e4) => {
      if (chat.status.get() === 0 /* Untitled */) {
        e4.preventDefault();
        return;
      }
      e4.preventDefault();
      e4.stopPropagation();
      const event = new StandardMouseEvent(getWindow(tab), e4);
      this._contextMenuService.showContextMenu({
        getAnchor: () => event,
        getActions: () => {
          const capabilities = getChatCapabilities(chat, session, void 0);
          const actions = [];
          if (capabilities.canRename) {
            actions.push(renameAction);
          }
          if (capabilities.canDelete) {
            actions.push(deleteAction);
          }
          return actions;
        }
      });
    }));
    this._tabs.push(chatTab);
  }
  _isInTabInput(event) {
    return isHTMLElement(event.target) && !!event.target.closest(".chat-composite-bar-tab-input-container");
  }
  /**
   * Resolves the opaque backend chat URI for a chat tab so a dragged `#chat:`
   * reference can carry it. Reaches the owning agent-host provider by id and
   * asks it to look up the host-supplied backend resource. Returns `undefined`
   * when the session is not agent-host backed or the provider has no hydrated
   * state for the chat — the caller then offers no chat-reference payload.
   */
  _backendChatResource(chat) {
    const providerId = this._delegate?.session.providerId;
    if (!providerId) {
      return void 0;
    }
    const provider = this._sessionsProvidersService.getProvider(providerId);
    return provider && isAgentHostProvider(provider) ? provider.getBackendChatResource(chat.resource) : void 0;
  }
  /**
   * Start an inline rename for the given tab. Enter commits via
   * {@link ISessionsManagementService.renameChat}; Escape or blur cancels.
   */
  _startTabEditing(chatTab) {
    const delegate = this._delegate;
    if (!delegate || this._editingTab) {
      return;
    }
    const { chat, element: tab, inputContainer } = chatTab;
    const initialTitle = chat.title.get();
    this._editingTab = chatTab;
    tab.classList.add("editing");
    const store = new DisposableStore();
    this._editingDisposables.value = store;
    const inputBox = store.add(new InputBox(inputContainer, this._contextViewService, {
      ariaLabel: localize(3775, null),
      inputBoxStyles: defaultInputBoxStyles
    }));
    inputBox.element.classList.add("chat-composite-bar-tab-input");
    inputBox.value = initialTitle;
    inputBox.focus();
    inputBox.select();
    let finished = false;
    const finish = (commit) => {
      if (finished) {
        return;
      }
      finished = true;
      const newTitle = inputBox.value.trim();
      this._endTabEditing();
      if (commit && newTitle && newTitle !== initialTitle) {
        this._sessionsManagementService.renameChat(delegate.session, chat.resource, newTitle).catch(onUnexpectedError);
      }
    };
    store.add(addStandardDisposableListener(inputBox.inputElement, EventType.KEY_DOWN, (e4) => {
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
    store.add(addDisposableListener(inputBox.inputElement, EventType.BLUR, () => finish(false)));
    store.add(addDisposableListener(inputBox.element, EventType.CLICK, (e4) => e4.stopPropagation()));
    store.add(addDisposableListener(inputBox.element, EventType.DBLCLICK, (e4) => e4.stopPropagation()));
  }
  _cancelTabEditing() {
    if (!this._editingTab) {
      return;
    }
    this._endTabEditing();
  }
  _endTabEditing() {
    const editingTab = this._editingTab;
    this._editingTab = void 0;
    this._editingDisposables.clear();
    if (editingTab) {
      editingTab.element.classList.remove("editing");
      reset(editingTab.inputContainer);
    }
  }
  _updateActiveTab(activeChatId) {
    for (const tab of this._tabs) {
      const isActive2 = tab.chat.resource.toString() === activeChatId;
      tab.element.classList.toggle("active", isActive2);
      tab.element.setAttribute("aria-selected", String(isActive2));
      if (isActive2) {
        tab.element.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    }
  }
  _revealActiveTab() {
    const activeTab = this._tabs.find((t2) => t2.element.classList.contains("active"));
    activeTab?.element.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  _setVisible(visible) {
    const wasVisible = this._visible;
    this._visible = visible;
    this._container.style.display = this._visible ? "" : "none";
    this._height = this._visible ? this._container.offsetHeight : 0;
    if (wasVisible !== this._visible) {
      this._onDidChangeVisibility.fire(this._visible);
    }
  }
  _updateStyles() {
    applySessionBarThemeColors(this._container, this._themeService.getColorTheme());
  }
};

ChatCompositeBar = __decorateClass([
  __decorateParam(1, IThemeService),
  __decorateParam(2, ISessionsManagementService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IContextViewService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, ISessionsProvidersService),
  __decorateParam(8, ICommandService)
], ChatCompositeBar);
export { ChatCompositeBar };
