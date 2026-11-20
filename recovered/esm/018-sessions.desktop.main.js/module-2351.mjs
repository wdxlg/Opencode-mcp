// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatListWidget.ts
import { Disposable, DisposableMap, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { $, DisposableResizeObserver, EventType, addDisposableListener, getWindow, isAncestor, isHTMLElement, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { Emitter } from "./module-0017.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ChatEditorOptions } from "./module-2349.mjs";
import { ChatListDelegate, ChatListItemRenderer } from "./module-2347.mjs";
import { ChatPendingDragController } from "./module-2350.mjs";
import { WorkbenchObjectTree } from "./module-0636.mjs";
import { ChatAccessibilityProvider } from "./module-2184.mjs";
import { isRequestVM, isResponseVM } from "./module-0979.mjs";
import { localize } from "./module-0001.mjs";
import { asCssVariable, asCssVariableWithDefault } from "./module-0226.mjs";
import { buttonSecondaryBackground, buttonSecondaryForeground } from "./module-0233.mjs";
import { Button } from "./module-0546.mjs";
import { Codicon } from "./module-0085.mjs";
import { ChatCollapsibleContentPart } from "./module-2116.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { PROMPT_TIMELINE_STICKY_SCROLL_SETTING } from "./module-2180.mjs";
import { sanitizeChatClipboardFragment } from "./module-2348.mjs";
import { Mimes } from "./module-0136.mjs";
import { katexContainerClassName } from "./module-0977.mjs";
import { MenuId } from "./module-0092.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatService } from "./module-0973.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IChatAccessibilityService } from "./module-0982.mjs";
import { IChatBranchService } from "./module-1992.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatListWidget.ts
var CHAT_STICKY_SCROLL_TOP_PADDING = 8;

var AutoScrollHolds = class {
  constructor() {
    this._count = 0;
  }
  get isHeld() {
    return this._count > 0;
  }
  acquire() {
    this._count++;
    let released = false;
    return toDisposable(() => {
      if (!released) {
        released = true;
        this._count--;
      }
    });
  }
};

var UserToggleResizeState = class {
  constructor(requiredStableFrames) {
    this.requiredStableFrames = requiredStableFrames;
    this.framesUntilSettled = 0;
    this.transitionInProgress = false;
  }
  get isActive() {
    return this.transitionInProgress || this.framesUntilSettled > 0;
  }
  start() {
    this.framesUntilSettled = this.requiredStableFrames;
  }
  markResized() {
    if (this.isActive) {
      this.framesUntilSettled = this.requiredStableFrames;
    }
  }
  startTransition() {
    this.transitionInProgress = true;
  }
  endTransition() {
    this.transitionInProgress = false;
    this.framesUntilSettled = this.requiredStableFrames;
  }
  advanceFrame() {
    if (this.isActive) {
      this.framesUntilSettled--;
    }
  }
};

function getAnchoredScrollTop(scrollTop, currentTargetTop, anchorTargetTop) {
  return scrollTop + currentTargetTop - anchorTargetTop;
}

function computeScrollDownState(isScrolledToBottom, scrollLock) {
  return {
    showButton: !isScrolledToBottom,
    atBottom: isScrolledToBottom || scrollLock
  };
}

var UserToggleResizeTracker = class extends Disposable {
  constructor(target, restoreScrollPosition, onDidSettle) {
    super();
    this.restoreScrollPosition = restoreScrollPosition;
    this.onDidSettle = onDidSettle;
    this.state = new UserToggleResizeState(2);
    this.pendingFrame = this._register(new MutableDisposable());
    const targetWindow = getWindow(target);
    const resizeObserver = this._register(new DisposableResizeObserver("ChatListWidget.userToggleResize", () => {
      this.state.markResized();
      this.scheduleFrame(targetWindow);
    }, targetWindow));
    this._register(resizeObserver.observe(target));
    this._register(addDisposableListener(target, "transitionrun", (e4) => {
      if (e4.propertyName === "grid-template-rows") {
        this.state.startTransition();
        this.scheduleFrame(targetWindow);
      }
    }));
    const finishTransition = (e4) => {
      if (e4.propertyName === "grid-template-rows") {
        this.state.endTransition();
        this.scheduleFrame(targetWindow);
      }
    };
    this._register(addDisposableListener(target, "transitionend", finishTransition));
    this._register(addDisposableListener(target, "transitioncancel", finishTransition));
    this.state.start();
    this.scheduleFrame(targetWindow);
  }
  restoreScrollAnchor() {
    this.restoreScrollPosition?.();
  }
  cancelScrollRestoration() {
    this.restoreScrollPosition = void 0;
  }
  scheduleFrame(targetWindow) {
    if (this.pendingFrame.value) {
      return;
    }
    this.pendingFrame.value = scheduleAtNextAnimationFrame(targetWindow, () => {
      this.pendingFrame.clear();
      this.restoreScrollPosition?.();
      this.state.advanceFrame();
      if (this.state.isActive) {
        this.scheduleFrame(targetWindow);
      } else {
        this.onDidSettle();
      }
    });
  }
};

var ChatListWidget = class extends Disposable {
  //#endregion
  constructor(container2, options3, instantiationService, contextKeyService, chatService, contextMenuService, logService, configurationService, chatAccessibilityService, chatBranchService) {
    super();
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.chatService = chatService;
    this.contextMenuService = contextMenuService;
    this.logService = logService;
    this.configurationService = configurationService;
    this.chatAccessibilityService = chatAccessibilityService;
    this.chatBranchService = chatBranchService;
    //#region Events
    this._onDidScroll = this._register(new Emitter());
    this.onDidScroll = this._onDidScroll.event;
    this._onDidChangeContentHeight = this._register(new Emitter());
    this.onDidChangeContentHeight = this._onDidChangeContentHeight.event;
    this._onDidClickFollowup = this._register(new Emitter());
    this.onDidClickFollowup = this._onDidClickFollowup.event;
    this._onDidFocus = this._register(new Emitter());
    this.onDidFocus = this._onDidFocus.event;
    this._onDidChangeItemHeight = this._register(new Emitter());
    /** Event fired when an item's height changes. Used for dynamic layout mode. */
    this.onDidChangeItemHeight = this._onDidChangeItemHeight.event;
    this._visible = true;
    this._mostRecentlyFocusedItemIndex = -1;
    this._scrollLock = true;
    this._autoScrollHolds = new AutoScrollHolds();
    this._settingChangeCounter = 0;
    this._visibleChangeCount = 0;
    this._userToggleResizeTrackers = this._register(new DisposableMap());
    this._viewModel = options3.viewModel;
    this._location = options3.location;
    this._getSelectedModelRequestOptions = options3.getSelectedModelRequestOptions;
    this._getCurrentModeInfo = options3.getCurrentModeInfo;
    this._useTreeHierarchy = !options3.filter;
    this._paddingBottom = options3.paddingBottom ?? 0;
    this._lastItemIdContextKey = ChatContextKeys.lastItemId.bindTo(this.contextKeyService);
    this._container = container2;
    const updateInlineReferencesStyle = () => {
      const style = this.configurationService.getValue("chat.inlineReferences.style" /* InlineReferencesStyle */);
      this._container.classList.toggle("chat-inline-references-link-style", style === "link");
    };
    updateInlineReferencesStyle();
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("chat.inlineReferences.style" /* InlineReferencesStyle */)) {
        updateInlineReferencesStyle();
      }
    }));
    this._register(this.chatBranchService.onDidChange((uri4) => {
      if (this._viewModel && uri4.toString() === this._viewModel.sessionResource.toString()) {
        this.refresh();
      }
    }));
    const scopedInstantiationService = this._register(this.instantiationService.createChild(
      new ServiceCollection([IContextKeyService, this.contextKeyService])
    ));
    const overflowWidgetsContainer = options3.overflowWidgetsDomNode ?? document.createElement("div");
    if (!options3.overflowWidgetsDomNode) {
      overflowWidgetsContainer.classList.add("chat-overflow-widget-container", "monaco-editor");
      this._container.append(overflowWidgetsContainer);
      this._register(toDisposable(() => overflowWidgetsContainer.remove()));
    }
    const editorOptions = options3.editorOptions ?? this._register(scopedInstantiationService.createInstance(
      ChatEditorOptions,
      options3.viewId,
      "foreground",
      options3.inputEditorBackground ?? "chat.requestEditor.background",
      options3.resultEditorBackground ?? "chat.responseEditor.background"
    ));
    this._delegate = scopedInstantiationService.createInstance(
      ChatListDelegate,
      options3.defaultElementHeight ?? 200
    );
    const rendererDelegate = {
      getListLength: () => this._tree.getListRenderCount(null),
      onDidScroll: this.onDidScroll,
      container: this._container,
      currentChatMode: options3.currentChatMode ?? (() => "ask" /* Ask */),
      isStickyScrollEnabled: () => this.isTreeStickyScrollEnabled(),
      refreshStickyScroll: () => this._tree.refreshStickyScroll(),
      stickyScrollTopPadding: CHAT_STICKY_SCROLL_TOP_PADDING,
      getEditingValue: options3.getEditingValue
    };
    this._renderer = this._register(scopedInstantiationService.createInstance(
      ChatListItemRenderer,
      editorOptions,
      options3.rendererOptions ?? {},
      rendererDelegate,
      overflowWidgetsContainer,
      this._viewModel
    ));
    this._register(this._renderer.onDidClickFollowup((item) => {
      this._onDidClickFollowup.fire(item);
    }));
    this._register(this._renderer.onDidChangeItemHeight((e4) => {
      this._updateElementHeight(e4.element, e4.height);
      this._onDidChangeItemHeight.fire(e4);
    }));
    this._register(this._renderer.onDidClickRerunWithAgentOrCommandDetection((e4) => {
      const request2 = this.chatService.getSession(e4.sessionResource)?.getRequests().find((candidate) => candidate.id === e4.requestId);
      if (request2) {
        const sendOptions = {
          noCommandDetection: true,
          attempt: request2.attempt + 1,
          location: this._location,
          ...this._getSelectedModelRequestOptions?.(),
          modeInfo: this._getCurrentModeInfo?.()
        };
        this.chatAccessibilityService.acceptRequest(e4.sessionResource);
        this.chatService.resendRequest(request2, sendOptions).catch((e5) => this.logService.error("FAILED to rerun request", e5));
      }
    }));
    this._renderer.pendingDragController = this._register(
      scopedInstantiationService.createInstance(ChatPendingDragController, this._container, () => this._viewModel)
    );
    const styles = options3.styles ?? {};
    this._tree = this._register(scopedInstantiationService.createInstance(
      WorkbenchObjectTree,
      "ChatList",
      this._container,
      this._delegate,
      [this._renderer],
      {
        identityProvider: { getId: (e4) => e4.id },
        horizontalScrolling: false,
        alwaysConsumeMouseWheel: false,
        supportDynamicHeights: true,
        paddingBottom: this._paddingBottom,
        hideTwistiesOfChildlessElements: true,
        enableStickyScroll: this.isTreeStickyScrollEnabled(),
        stickyScrollMaxItemCount: 1,
        stickyScrollMaxNodeHeight: 150,
        stickyScrollNodeSourceRangeProvider: (element, defaultRange) => this._renderer.getStickyScrollSourceRange(element, defaultRange),
        indent: 0,
        expandOnDoubleClick: false,
        expandOnlyOnTwistieClick: true,
        allowNonCollapsibleParents: true,
        renderIndentGuides: "none" /* None */,
        findWidgetEnabled: false,
        accessibilityProvider: this.instantiationService.createInstance(ChatAccessibilityProvider),
        keyboardNavigationLabelProvider: {
          getKeyboardNavigationLabel: (e4) => isRequestVM(e4) ? e4.message : isResponseVM(e4) ? e4.response.value : ""
        },
        setRowLineHeight: false,
        scrollToActiveElement: true,
        filter: options3.filter,
        overrideStyles: {
          listFocusBackground: styles.listBackground,
          listInactiveFocusBackground: styles.listBackground,
          listActiveSelectionBackground: styles.listBackground,
          listFocusAndSelectionBackground: styles.listBackground,
          listInactiveSelectionBackground: styles.listBackground,
          listHoverBackground: styles.listBackground,
          listBackground: styles.listBackground,
          listFocusForeground: styles.listForeground,
          listHoverForeground: styles.listForeground,
          listInactiveFocusForeground: styles.listForeground,
          listInactiveSelectionForeground: styles.listForeground,
          listActiveSelectionForeground: styles.listForeground,
          listFocusAndSelectionForeground: styles.listForeground,
          listActiveSelectionIconForeground: void 0,
          listInactiveSelectionIconForeground: void 0,
          treeStickyScrollBackground: styles.listBackground,
          treeStickyScrollBorder: void 0,
          treeStickyScrollShadow: styles.listShadow
        }
      }
    ));
    const scrollToBottomLabel = localize(12415, null);
    const scrollToBottomBackground = asCssVariableWithDefault("chat.list.background", asCssVariable(buttonSecondaryBackground));
    this._scrollDownButton = this._register(new Button(this._container, {
      title: scrollToBottomLabel,
      ariaLabel: scrollToBottomLabel,
      buttonBackground: scrollToBottomBackground,
      buttonForeground: asCssVariable(buttonSecondaryForeground),
      buttonHoverBackground: scrollToBottomBackground,
      buttonSecondaryBackground: void 0,
      buttonSecondaryForeground: void 0,
      buttonSecondaryHoverBackground: void 0,
      buttonSeparator: void 0,
      supportIcons: true
    }));
    this._scrollDownButton.element.classList.add("chat-scroll-down");
    this._scrollDownButton.label = `$(${Codicon.chevronDown.id})`;
    this._scrollDownButton.element.style.display = "none";
    this._register(this._scrollDownButton.onDidClick(() => {
      this.cancelUserToggleScrollRestoration();
      this.setScrollLock(true);
      this.scrollToEnd();
    }));
    this._register(this._tree.onDidChangeContentHeight(() => {
      this._onDidChangeContentHeight.fire();
    }));
    this._register(this._tree.onDidFocus(() => {
      this._onDidFocus.fire();
    }));
    this._register(this._tree.onDidChangeFocus(() => {
      const focused = this.getFocus();
      if (focused && focused.length > 0) {
        const focusedItem = focused[0];
        const items = this.getItems();
        const idx = items.findIndex((i2) => i2 === focusedItem);
        if (idx !== -1) {
          this._mostRecentlyFocusedItemIndex = idx;
        }
      }
    }));
    this._register(this._tree.onDidScroll((e4) => {
      this._onDidScroll.fire(e4);
      this.updateScrollDownButtonVisibility();
    }));
    this.updateScrollDownButtonVisibility();
    this._register(addDisposableListener(this._container, ChatCollapsibleContentPart.userToggleEvent, (e4) => {
      if (!isHTMLElement(e4.target)) {
        return;
      }
      const element = this._renderer.getElementFromNode(e4.target);
      if (element) {
        this.trackUserToggleResize(element, e4.target);
      }
    }));
    this._register(addDisposableListener(this._container, EventType.WHEEL, () => this.cancelUserToggleScrollRestoration()));
    this._register(addDisposableListener(this._container, EventType.POINTER_DOWN, () => this.cancelUserToggleScrollRestoration()));
    this._register(addDisposableListener(this._container, EventType.KEY_DOWN, (e4) => {
      const keyCode = new StandardKeyboardEvent(e4).keyCode;
      if (keyCode === 16 /* UpArrow */ || keyCode === 18 /* DownArrow */ || keyCode === 11 /* PageUp */ || keyCode === 12 /* PageDown */ || keyCode === 14 /* Home */ || keyCode === 13 /* End */) {
        this.cancelUserToggleScrollRestoration();
      }
    }, true));
    this._register(this._tree.onContextMenu((e4) => {
      this.handleContextMenu(e4);
    }));
    this._register(addDisposableListener(this._container, "copy", (e4) => this.handleCopy(e4)));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("chat.experimental.stickyScroll.enabled" /* ExperimentalStickyScrollEnabled */) || e4.affectsConfiguration(PROMPT_TIMELINE_STICKY_SCROLL_SETTING)) {
        this._renderer.refreshStickyScrollSourceRanges(true);
        this._tree.updateOptions({ enableStickyScroll: this.isTreeStickyScrollEnabled() });
      }
      if (e4.affectsConfiguration("chat.editRequests" /* EditRequests */) || e4.affectsConfiguration("chat.checkpoints.enabled" /* CheckpointsEnabled */) || e4.affectsConfiguration("chat.experimental.richLinks.enabled" /* RichLinks */)) {
        this._settingChangeCounter++;
        this.refresh();
      }
    }));
  }
  /**
   * Event fired when a request item is clicked.
   */
  get onDidClickRequest() {
    return this._renderer.onDidClickRequest;
  }
  /**
   * Event fired when an item is re-rendered.
   */
  get onDidRerender() {
    return this._renderer.onDidRerender;
  }
  /**
   * Event fired when a template is disposed.
   */
  get onDidDispose() {
    return this._renderer.onDidDispose;
  }
  /**
   * Event fired when focus moves outside the editing area.
   */
  get onDidFocusOutside() {
    return this._renderer.onDidFocusOutside;
  }
  //#endregion
  //#region Properties
  get domNode() {
    return this._container;
  }
  get scrollTop() {
    return this._tree.scrollTop;
  }
  set scrollTop(value2) {
    this._tree.scrollTop = value2;
  }
  get scrollHeight() {
    return this._tree.scrollHeight;
  }
  get renderHeight() {
    return this._tree.renderHeight;
  }
  get contentHeight() {
    return this._tree.contentHeight;
  }
  /**
   * Whether the list is scrolled to the bottom.
   */
  get isScrolledToBottom() {
    return this._tree.scrollTop + this._tree.renderHeight >= this._tree.scrollHeight - 2;
  }
  /**
   * The last item in the list.
   */
  get lastItem() {
    return this._lastItem;
  }
  /**
   * The bottom-most item intersecting the viewport, or `undefined` when the list is empty.
   * Reads the layout height model, so it resolves independently of which rows are mounted.
   */
  get lastVisibleItem() {
    const items = this._viewModel?.getItems();
    if (!items?.length) {
      return void 0;
    }
    const viewportBottom = this._tree.scrollTop + this._tree.renderHeight;
    for (let index2 = items.length - 1; index2 >= 0; index2--) {
      const top2 = this.getElementTop(items[index2]);
      if (top2 !== void 0 && top2 <= viewportBottom) {
        return items[index2];
      }
    }
    return items[0];
  }
  //#region Internal event handlers
  /**
   * Rewrites the rich-text flavor of a copied selection so links that only resolve here
   * don't paste as `vscode-file:` targets or local paths. Selections whose links all resolve
   * elsewhere are left to the browser, which keeps the styling other apps rely on.
   */
  handleCopy(e4) {
    const selection = getWindow(this._container).getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0 || !e4.clipboardData) {
      return;
    }
    const touched = Array.from(this._container.querySelectorAll("a, img")).filter((element) => selection.containsNode(element, true));
    if (!touched.length) {
      return;
    }
    const ranges = [];
    for (let i2 = 0; i2 < selection.rangeCount; i2++) {
      const range2 = selection.getRangeAt(i2);
      if (!isAncestor(range2.commonAncestorContainer, this._container)) {
        return;
      }
      ranges.push(range2);
    }
    const fragments = ranges.map((range2) => this.cloneSelectedContents(range2));
    if (!fragments.map((fragment) => sanitizeChatClipboardFragment(fragment)).some(Boolean)) {
      return;
    }
    const holder = $("div");
    for (const fragment of fragments) {
      holder.appendChild(fragment);
    }
    e4.clipboardData.setData(Mimes.text, selection.toString());
    e4.clipboardData.setData(Mimes.html, holder.innerHTML);
    e4.preventDefault();
  }
  /**
   * Clones a range along with the elements it sits inside. `cloneContents` returns only what
   * lies between the range boundaries, which drops both the heading or list item giving the
   * text its shape and, for a partly selected link, the rest of its label.
   */
  cloneSelectedContents(range2) {
    let content = range2.cloneContents();
    for (let ancestor = range2.commonAncestorContainer; ancestor && ancestor !== this._container; ancestor = ancestor.parentNode) {
      if (!isHTMLElement(ancestor)) {
        continue;
      }
      if (ancestor.tagName === "A") {
        content = ancestor.cloneNode(true);
        continue;
      }
      const wrapper = ancestor.cloneNode(false);
      wrapper.appendChild(content);
      content = wrapper;
    }
    if (content.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      return content;
    }
    const fragment = this._container.ownerDocument.createDocumentFragment();
    fragment.appendChild(content);
    return fragment;
  }
  /**
   * Update scroll-down button visibility based on scroll position and scroll lock.
   */
  updateScrollDownButtonVisibility() {
    const { showButton, atBottom } = computeScrollDownState(this.isScrolledToBottom, this._scrollLock);
    this._scrollDownButton.element.style.display = showButton ? "flex" : "none";
    this._container.classList.toggle("chat-list-at-bottom", atBottom);
  }
  /**
   * Handle context menu events.
   */
  handleContextMenu(e4) {
    e4.browserEvent.preventDefault();
    e4.browserEvent.stopPropagation();
    const selected = e4.element;
    const target = e4.browserEvent.target;
    const isKatexElement = target.closest(`.${katexContainerClassName}`) !== null;
    const scopedContextKeyService = this.contextKeyService.createOverlay([
      [ChatContextKeys.isResponse.key, isResponseVM(selected)],
      [ChatContextKeys.responseIsFiltered.key, isResponseVM(selected) && !!selected.errorDetails?.responseIsFiltered],
      [ChatContextKeys.isKatexMathElement.key, isKatexElement]
    ]);
    this.contextMenuService.showContextMenu({
      menuId: MenuId.ChatContext,
      menuActionOptions: { shouldForwardArgs: true },
      contextKeyService: scopedContextKeyService,
      getAnchor: () => e4.anchor,
      getActionsContext: () => selected
    });
  }
  //#endregion
  //#region ViewModel methods
  /**
   * Set the view model for the list to render.
   */
  setViewModel(viewModel) {
    this._viewModel = viewModel;
    this._renderer.updateViewModel(viewModel);
  }
  /**
   * OpenCode multi-model: mirror the extension's branch group metadata into
   * the branch service so variant switching works even for rows the container
   * filter hides (registration no longer depends on row rendering).
   */
  _syncOpenCodeBranchVariants() {
    const viewModel = this._viewModel;
    if (!viewModel) {
      return;
    }
    const variants = [];
    for (const request2 of viewModel.model.getRequests()) {
      const response = request2.response;
      const metadata = response?.result?.metadata;
      const group2 = metadata?.["opencodeBranchGroup"];
      if (!group2 || typeof group2.groupId !== "string" || !group2.groupId || !response) {
        continue;
      }
      const branchModel = metadata?.["opencodeBranchModel"];
      variants.push({
        groupId: group2.groupId,
        requestId: request2.id,
        responseId: response.id,
        kind: group2.kind === "merge" ? "merge" : "branch",
        modelId: typeof branchModel?.modelId === "string" ? branchModel.modelId : void 0,
        modelIdentifier: typeof branchModel?.vendor === "string" && typeof branchModel?.catalogModelId === "string" && branchModel.catalogModelId ? `${branchModel.vendor}/${branchModel.catalogModelId}` : void 0,
        role: typeof metadata?.["opencodeBranchRole"] === "string" ? metadata["opencodeBranchRole"] : void 0,
        canceled: metadata?.["canceled"] === true
      });
    }
    this.chatBranchService.synchronize(viewModel.sessionResource, variants);
  }
  /**
   * OpenCode multi-model: each branch group renders as a single question row
   * plus a variant container that shows exactly one answer at a time. Variant
   * re-ask request rows and non-active responses are hidden here.
   */
  _applyOpenCodeBranchFilter(items) {
    const viewModel = this._viewModel;
    if (!viewModel) {
      return items;
    }
    const sessionResource = viewModel.sessionResource;
    const groups = this.chatBranchService.getGroups(sessionResource);
    if (groups.length === 0) {
      return items;
    }
    const requests = viewModel.model.getRequests();
    let inFlightRequestId;
    let inFlightGroupId;
    for (const request2 of requests) {
      if (request2.openCodeBranchIntent && request2.response?.isComplete !== true) {
        inFlightRequestId = request2.id;
        inFlightGroupId = request2.openCodeBranchIntent.groupId;
      }
    }
    const hiddenRequestIds = /* @__PURE__ */ new Set();
    const hiddenResponseRequestIds = /* @__PURE__ */ new Set();
    const activeGroupId = this.chatBranchService.getActiveGroupId(sessionResource);
    for (const group2 of groups) {
      let activeRequestId = group2.activeRequestId;
      if (inFlightRequestId) {
        const registered = group2.variants.some((v2) => v2.requestId === inFlightRequestId);
        const belongs = inFlightGroupId && inFlightGroupId === group2.id || !inFlightGroupId && !registered && group2.id === activeGroupId;
        if (belongs && !registered) {
          activeRequestId = inFlightRequestId;
        }
      }
      for (const variant of group2.variants) {
        if (variant.requestId !== group2.baseRequestId) {
          hiddenRequestIds.add(variant.requestId);
        }
        if (variant.requestId !== activeRequestId) {
          hiddenResponseRequestIds.add(variant.requestId);
        }
      }
    }
    const groupBaseIds = new Set(groups.map((g) => g.baseRequestId));
    for (const request2 of requests) {
      if (request2.openCodeBranchIntent && !groupBaseIds.has(request2.id)) {
        hiddenRequestIds.add(request2.id);
      }
    }
    return items.filter((item) => {
      if (isRequestVM(item)) {
        return !hiddenRequestIds.has(item.id);
      }
      if (isResponseVM(item)) {
        return !hiddenResponseRequestIds.has(item.requestId);
      }
      return true;
    });
  }
  /**
   * Refresh the list from the current view model.
   * Uses internal state for diff identity calculation.
   */
  refresh() {
    if (!this._viewModel) {
      this._tree.setChildren(null, []);
      this._lastItem = void 0;
      this._lastItemIdContextKey.set([]);
      return;
    }
    this._syncOpenCodeBranchVariants();
    const items = this._applyOpenCodeBranchFilter(this._viewModel.getItems());
    this._lastItem = items.at(-1);
    this._lastItemIdContextKey.set(this._lastItem ? [this._lastItem.id] : []);
    const treeItems = this._useTreeHierarchy ? this.createRequestTreeItems(items) : items.map((item) => ({ element: item, collapsed: false, collapsible: false }));
    const editing = this._viewModel.editing;
    this._withPersistedAutoScroll(() => {
      this._tree.setChildren(null, treeItems, {
        diffDepth: 1,
        diffIdentityProvider: {
          getId: (element) => {
            const baseId = isRequestVM(element) || isResponseVM(element) ? element.dataId : element.id;
            const disablement = isRequestVM(element) || isResponseVM(element) ? element.shouldBeRemovedOnSend : void 0;
            const isLastItem = element.id === this._lastItem?.id;
            const isEditTarget = isRequestVM(element) && editing?.id === element.id;
            const isBlocked = isRequestVM(element) || isResponseVM(element) ? element.shouldBeBlocked.get() : false;
            return baseId + // If a response is in the process of progressive rendering, we need to ensure that it will
            // be re-rendered so progressive rendering is restarted, even if the model wasn't updated.
            `${isResponseVM(element) && element.renderData ? `_${this._visibleChangeCount}` : ""}` + // Re-render once content references are loaded
            (isResponseVM(element) ? `_${element.contentReferences.length}` : "") + // Re-render if element becomes hidden due to undo/redo
            `_${disablement ? `${disablement.afterUndoStop || "1"}` : "0"}_${isEditTarget ? "edit" : ""}_${isBlocked ? "blocked" : ""}` + // Re-render requests when editing starts/stops (for hover button visibility, click handlers)
            (isRequestVM(element) ? `_${editing ? "1" : "0"}` : "") + // Re-render the old and new tail rows when the list grows or shrinks.
            `_${isLastItem ? "last" : ""}_setting${this._settingChangeCounter}` + // Rerender request if we got new content references in the response
            // since this may change how we render the corresponding attachments in the request
            (isRequestVM(element) && element.contentReferences ? `_${element.contentReferences?.length}` : "");
          }
        }
      });
    });
  }
  /**
   * Set scroll lock state.
   */
  setScrollLock(value2) {
    this._scrollLock = value2;
    this.updateScrollDownButtonVisibility();
  }
  /**
   * Get scroll lock state.
   */
  get scrollLock() {
    return this._scrollLock;
  }
  /**
   * Set the visible change count (for diff identity).
   */
  setVisibleChangeCount(value2) {
    this._visibleChangeCount = value2;
  }
  /**
   * Scroll to reveal an element if editing.
   */
  scrollToCurrentItem(currentElement) {
    if (!this._viewModel?.editing || !currentElement) {
      return;
    }
    if (!this._tree.hasElement(currentElement)) {
      return;
    }
    const relativeTop = this._tree.getRelativeTop(currentElement);
    if (relativeTop === null || relativeTop < 0 || relativeTop > 1) {
      this._tree.reveal(currentElement, 0);
    }
  }
  //#endregion
  //#region Tree methods
  /**
   * Rerender the tree.
   */
  rerender() {
    this._tree.rerender();
    this._renderer.refreshStickyScrollSourceRanges(true);
    this._tree.rerenderStickyScroll();
  }
  getItems() {
    const items = [];
    const root = this._tree.getNode(null);
    const collect2 = (children) => {
      for (const child of children) {
        if (child.visible && child.element) {
          items.push(child.element);
        }
        if (!child.collapsed) {
          collect2(child.children);
        }
      }
    };
    collect2(root.children);
    return items;
  }
  createRequestTreeItems(items) {
    const treeItems = [];
    for (let i2 = 0; i2 < items.length; i2++) {
      const item = items[i2];
      if (isRequestVM(item)) {
        const children = [];
        while (i2 + 1 < items.length && isResponseVM(items[i2 + 1])) {
          i2++;
          children.push({ element: items[i2], collapsed: false, collapsible: false });
        }
        treeItems.push({
          element: item,
          collapsed: false,
          collapsible: false,
          children
        });
      } else {
        treeItems.push({ element: item, collapsed: false, collapsible: false });
      }
    }
    return treeItems;
  }
  isTreeStickyScrollEnabled() {
    return this._useTreeHierarchy && this.configurationService.getValue(PROMPT_TIMELINE_STICKY_SCROLL_SETTING) === true && this.configurationService.getValue("chat.experimental.stickyScroll.enabled" /* ExperimentalStickyScrollEnabled */) === true;
  }
  /**
   * Delegate scroll events from a mouse wheel event to the tree.
   */
  delegateScrollFromMouseWheelEvent(event) {
    this.cancelUserToggleScrollRestoration();
    this._tree.delegateScrollFromMouseWheelEvent(event);
  }
  /**
   * Whether the tree has a specific element.
   */
  hasElement(element) {
    return this._tree.hasElement(element);
  }
  /**
   * Update the height of an element.
   */
  _updateElementHeight(element, height) {
    if (this._tree.hasElement(element) && this._visible) {
      const userToggleResizeTracker = this._userToggleResizeTrackers.get(element);
      if (userToggleResizeTracker) {
        this._tree.updateElementHeight(element, height);
        userToggleResizeTracker.restoreScrollAnchor();
        return;
      }
      this._withPersistedAutoScroll(() => {
        this._tree.updateElementHeight(element, height);
      });
    }
  }
  trackUserToggleResize(element, target) {
    const anchorTargetTop = this.isScrolledToBottom ? target.getBoundingClientRect().top : void 0;
    const restoreScrollPosition = anchorTargetTop === void 0 ? void 0 : () => {
      if (target.isConnected) {
        this._tree.scrollTop = getAnchoredScrollTop(this._tree.scrollTop, target.getBoundingClientRect().top, anchorTargetTop);
      }
    };
    const tracker2 = new UserToggleResizeTracker(target, restoreScrollPosition, () => {
      if (this._userToggleResizeTrackers.get(element) === tracker2) {
        this._userToggleResizeTrackers.deleteAndDispose(element);
      }
    });
    this._userToggleResizeTrackers.set(element, tracker2);
  }
  cancelUserToggleScrollRestoration() {
    for (const tracker2 of this._userToggleResizeTrackers.values()) {
      tracker2.cancelScrollRestoration();
    }
  }
  /**
   * Scroll to reveal an element.
   */
  reveal(element, relativeTop) {
    this._tree.reveal(element, relativeTop);
  }
  /**
   * The top offset of an element in transcript content space (same space as
   * `scrollTop`/`scrollHeight`), or `undefined` if it is not in the list. Reads
   * the layout height model, so it also resolves off-screen elements.
   */
  getElementTop(element) {
    if (!this._tree.hasElement(element)) {
      return void 0;
    }
    return this._tree.getElementTop(element);
  }
  /**
   * Get the focused elements.
   */
  getFocus() {
    return this._tree.getFocus().filter((e4) => e4 !== null);
  }
  /**
   * Set the focused elements.
   */
  setFocus(elements) {
    this._tree.setFocus(elements);
  }
  focusItem(item) {
    if (!this.hasElement(item)) {
      return;
    }
    this._tree.setFocus([item]);
    this._tree.domFocus();
  }
  /**
   * Focus the last item in the list. Returns the index of the focused item.
   * @param useMostRecentlyFocusedIndex If true, use the mostRecentlyFocusedIndex if valid
   */
  focusLastItem(useMostRecentlyFocusedIndex) {
    const items = this.getItems();
    if (items.length === 0) {
      return -1;
    }
    let focusIndex;
    if (useMostRecentlyFocusedIndex && this._mostRecentlyFocusedItemIndex >= 0 && this._mostRecentlyFocusedItemIndex < items.length) {
      focusIndex = this._mostRecentlyFocusedItemIndex;
    } else {
      focusIndex = items.length - 1;
    }
    this._tree.setFocus([items[focusIndex]]);
    this._tree.domFocus();
    return focusIndex;
  }
  /**
   * Scroll the list to reveal the last item.
   */
  scrollToEnd() {
    const lastElement = this.getItems().at(-1);
    if (lastElement) {
      const offset = Math.max(lastElement.currentRenderedHeight ?? 0, 1e6);
      this._tree.reveal(lastElement, offset);
      if (this._paddingBottom) {
        this._tree.scrollTop += this._paddingBottom;
      }
    }
  }
  /**
   * Suppresses auto-scrolling to the bottom until the returned disposable is
   * disposed. Holds compose, so unrelated features (request editing, an open
   * text selection) can suppress concurrently without clobbering each other;
   * auto-scroll resumes only once the last hold is released.
   */
  acquireAutoScrollHold() {
    return this._autoScrollHolds.acquire();
  }
  /** Whether any {@link acquireAutoScrollHold} hold is currently active. */
  get isAutoScrollHeld() {
    return this._autoScrollHolds.isHeld;
  }
  _withPersistedAutoScroll(fn) {
    if (this.isAutoScrollHeld) {
      fn();
      return;
    }
    const wasScrolledToBottom = this.isScrolledToBottom;
    fn();
    if (wasScrolledToBottom) {
      this.scrollToEnd();
    }
  }
  /**
   * Focus the list.
   */
  focus() {
    this._tree.domFocus();
  }
  /**
   * Get the DOM focus state.
   */
  isDOMFocused() {
    return this._tree.isDOMFocused();
  }
  //#endregion
  //#region Renderer methods
  /**
   * Get code block info for a response.
   */
  getCodeBlockInfosForResponse(response) {
    return this._renderer.getCodeBlockInfosForResponse(response);
  }
  /**
   * Get code block info by URI.
   */
  getCodeBlockInfoForEditor(uri4) {
    return this._renderer.getCodeBlockInfoForEditor(uri4);
  }
  /**
   * Get file tree info for a response.
   */
  getFileTreeInfosForResponse(response) {
    return this._renderer.getFileTreeInfosForResponse(response);
  }
  /**
   * Get the last focused file tree for a response.
   */
  getLastFocusedFileTreeForResponse(response) {
    return this._renderer.getLastFocusedFileTreeForResponse(response);
  }
  /**
   * Get editors currently in use.
   */
  editorsInUse() {
    return this._renderer.editorsInUse();
  }
  /**
   * Get template data for a request ID.
   */
  getTemplateDataForRequestId(requestId) {
    if (!requestId) {
      return void 0;
    }
    return this._renderer.getTemplateDataForRequestId(requestId);
  }
  /**
   * Returns the currently rendered chat item containing the node.
   */
  getElementFromNode(node) {
    return this._renderer.getElementFromNode(node);
  }
  /**
   * Update renderer options.
   */
  updateRendererOptions(options3) {
    this._renderer.updateOptions(options3);
  }
  /**
   * Update the list/tree color overrides, including the sticky-scroll surface.
   */
  setStyles(styles) {
    this._tree.updateOptions({
      overrideStyles: {
        listFocusBackground: styles.listBackground,
        listInactiveFocusBackground: styles.listBackground,
        listActiveSelectionBackground: styles.listBackground,
        listFocusAndSelectionBackground: styles.listBackground,
        listInactiveSelectionBackground: styles.listBackground,
        listHoverBackground: styles.listBackground,
        listBackground: styles.listBackground,
        listFocusForeground: styles.listForeground,
        listHoverForeground: styles.listForeground,
        listInactiveFocusForeground: styles.listForeground,
        listInactiveSelectionForeground: styles.listForeground,
        listActiveSelectionForeground: styles.listForeground,
        listFocusAndSelectionForeground: styles.listForeground,
        listActiveSelectionIconForeground: void 0,
        listInactiveSelectionIconForeground: void 0,
        treeStickyScrollBackground: styles.listBackground,
        treeStickyScrollBorder: void 0,
        treeStickyScrollShadow: styles.listShadow
      }
    });
  }
  /**
   * Set the visibility of the list.
   */
  setVisible(visible) {
    this._visible = visible;
    this._renderer.setVisible(visible);
  }
  /**
   * Layout the list.
   */
  layout(height, width2) {
    this._tree.layout(height, width2);
    this._renderer.layout(width2 ?? this._container.clientWidth);
    this._tree.refreshStickyScroll();
  }
  //#endregion
};

ChatListWidget = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IChatService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IChatAccessibilityService),
  __decorateParam(9, IChatBranchService)
], ChatListWidget);
export { getAnchoredScrollTop, computeScrollDownState, CHAT_STICKY_SCROLL_TOP_PADDING, AutoScrollHolds, UserToggleResizeState, UserToggleResizeTracker, ChatListWidget };
