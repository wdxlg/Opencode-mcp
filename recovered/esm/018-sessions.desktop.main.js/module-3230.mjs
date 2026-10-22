// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/suggest/browser/simpleSuggestWidget.ts
import { $, Dimension, addDisposableListener, append, getActiveWindow, getClientArea, getDomNodePagePosition, getWindow, hide, runAtThisOrScheduleAtNextAnimationFrame, show } from "./module-0075.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { TimeoutTimer, createCancelablePromise, disposableTimeout } from "./module-0036.mjs";
import { Emitter, PauseableEmitter } from "./module-0017.mjs";
import { ResizableHTMLElement } from "./module-0585.mjs";
import { SimpleSuggestWidgetItemRenderer, getAriaId } from "./module-3228.mjs";
import { List } from "./module-0460.mjs";
import { isWindows } from "./module-0014.mjs";
import { format2 } from "./module-0030.mjs";
import { SimpleSuggestDetailsOverlay, SimpleSuggestDetailsWidget, canExpandCompletionItem2 } from "./module-3229.mjs";
import { SuggestWidgetStatus } from "./module-0753.mjs";
import { status } from "./module-0076.mjs";
import { clamp } from "./module-0040.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IStorageService } from "./module-0512.mjs";
import { getListStyles } from "./module-0513.mjs";
import { activeContrastBorder, focusBorder } from "./module-0227.mjs";
import { editorSuggestWidgetForeground, editorSuggestWidgetSelectedBackground } from "./module-0757.mjs";


// src/vs/workbench/services/suggest/browser/simpleSuggestWidget.ts
var $107 = $;

var SimpleSuggestContext = {
  HasFocusedSuggestion: new RawContextKey("simpleSuggestWidgetHasFocusedSuggestion", false, localize(23360, null)),
  HasNavigated: new RawContextKey("simpleSuggestWidgetHasNavigated", false, localize(23361, null)),
  FirstSuggestionFocused: new RawContextKey("simpleSuggestWidgetFirstSuggestionFocused", false, localize(23359, null)),
  ExplicitlyInvoked: new RawContextKey("simpleSuggestWidgetExplicitlyInvoked", false, localize(23358, null))
};

var SimpleSuggestWidget = class extends Disposable {
  constructor(_container, _persistedSize, _options, _getFontInfo, _onDidFontConfigurationChange, _getAdvancedExplainModeDetails, _instantiationService, _configurationService, _storageService, _contextKeyService) {
    super();
    this._container = _container;
    this._persistedSize = _persistedSize;
    this._options = _options;
    this._getFontInfo = _getFontInfo;
    this._onDidFontConfigurationChange = _onDidFontConfigurationChange;
    this._getAdvancedExplainModeDetails = _getAdvancedExplainModeDetails;
    this._instantiationService = _instantiationService;
    this._configurationService = _configurationService;
    this._storageService = _storageService;
    this._state = 0 /* Hidden */;
    this._forceRenderingAbove = false;
    this._explainMode = false;
    this._pendingShowDetails = this._register(new MutableDisposable());
    this._pendingLayout = this._register(new MutableDisposable());
    this._ignoreFocusEvents = false;
    this._showTimeout = this._register(new TimeoutTimer());
    this._onDidSelect = this._register(new Emitter());
    this.onDidSelect = this._onDidSelect.event;
    this._onDidHide = this._register(new Emitter());
    this.onDidHide = this._onDidHide.event;
    this._onDidShow = this._register(new Emitter());
    this.onDidShow = this._onDidShow.event;
    this._onDidFocus = new PauseableEmitter();
    this.onDidFocus = this._onDidFocus.event;
    this._onDidBlurDetails = this._register(new Emitter());
    this.onDidBlurDetails = this._onDidBlurDetails.event;
    this.element = this._register(new ResizableHTMLElement());
    this.element.domNode.classList.add("workbench-suggest-widget");
    this._container.appendChild(this.element.domNode);
    this._ctxSuggestWidgetHasFocusedSuggestion = SimpleSuggestContext.HasFocusedSuggestion.bindTo(_contextKeyService);
    this._ctxSuggestWidgetHasBeenNavigated = SimpleSuggestContext.HasNavigated.bindTo(_contextKeyService);
    this._ctxFirstSuggestionFocused = SimpleSuggestContext.FirstSuggestionFocused.bindTo(_contextKeyService);
    this._ctxSuggestWidgetExplicitlyInvoked = SimpleSuggestContext.ExplicitlyInvoked.bindTo(_contextKeyService);
    class ResizeState {
      constructor(persistedSize, currentSize, persistHeight = false, persistWidth = false) {
        this.persistedSize = persistedSize;
        this.currentSize = currentSize;
        this.persistHeight = persistHeight;
        this.persistWidth = persistWidth;
      }
    }
    let state;
    this._register(this.element.onDidWillResize(() => {
      state = new ResizeState(this._persistedSize.restore(), this.element.size);
    }));
    this._register(this.element.onDidResize((e4) => {
      this._resize(e4.dimension.width, e4.dimension.height);
      if (state) {
        state.persistHeight = state.persistHeight || !!e4.north || !!e4.south;
        state.persistWidth = state.persistWidth || !!e4.east || !!e4.west;
      }
      if (!e4.done) {
        return;
      }
      if (state) {
        const { itemHeight, defaultSize } = this._getLayoutInfo();
        const threshold = Math.round(itemHeight / 2);
        let { width: width2, height } = this.element.size;
        if (!state.persistHeight || Math.abs(state.currentSize.height - height) <= threshold) {
          height = state.persistedSize?.height ?? defaultSize.height;
        }
        if (!state.persistWidth || Math.abs(state.currentSize.width - width2) <= threshold) {
          width2 = state.persistedSize?.width ?? defaultSize.width;
        }
        this._persistedSize.store(new Dimension(width2, height));
      }
      state = void 0;
    }));
    const applyIconStyle = () => this.element.domNode.classList.toggle("no-icons", !_configurationService.getValue("editor.suggest.showIcons"));
    applyIconStyle();
    const renderer = this._instantiationService.createInstance(SimpleSuggestWidgetItemRenderer, this._getFontInfo.bind(this), this._onDidFontConfigurationChange.bind(this));
    this._register(renderer);
    this._listElement = append(this.element.domNode, $107(".tree"));
    this._list = this._register(new List("SuggestWidget", this._listElement, {
      getHeight: () => this._getLayoutInfo().itemHeight,
      getTemplateId: () => "suggestion"
    }, [renderer], {
      alwaysConsumeMouseWheel: true,
      useShadows: false,
      mouseSupport: false,
      multipleSelectionSupport: false,
      accessibilityProvider: {
        getRole: () => isWindows ? "listitem" : "option",
        getWidgetAriaLabel: () => localize(23362, null),
        getWidgetRole: () => "listbox",
        getAriaLabel: (item) => {
          let label3 = item.textLabel;
          const kindLabel2 = item.completion.kindLabel ?? "";
          if (typeof item.completion.label !== "string") {
            const { detail: detail3, description } = item.completion.label;
            if (detail3 && description) {
              label3 = localize(23357, null, label3, detail3, description, kindLabel2);
            } else if (detail3) {
              label3 = localize(23356, null, label3, detail3, kindLabel2);
            } else if (description) {
              label3 = localize(23355, null, label3, description, kindLabel2);
            }
          } else {
            label3 = localize(23354, null, label3, kindLabel2);
          }
          const { documentation, detail: detail2 } = item.completion;
          const docs = format2(
            "{0}{1}",
            detail2 || "",
            documentation ? typeof documentation === "string" ? documentation : documentation.value : ""
          );
          return localize(23353, null, label3, docs);
        }
      }
    }));
    this._register(this._list.onDidChangeFocus((e4) => {
      if (e4.indexes.length && e4.indexes[0] !== 0) {
        this._ctxSuggestWidgetHasBeenNavigated.set(true);
      }
    }));
    this._messageElement = append(this.element.domNode, $(".message"));
    const details = this._register(_instantiationService.createInstance(SimpleSuggestDetailsWidget, this._getFontInfo.bind(this), this._onDidFontConfigurationChange.bind(this), this._getAdvancedExplainModeDetails.bind(this)));
    this._register(details.onDidClose(() => this.toggleDetails()));
    this._details = this._register(new SimpleSuggestDetailsOverlay(details, this._listElement, this._options.preventDetailsPlacements));
    this._register(addDisposableListener(this._details.widget.domNode, "blur", (e4) => this._onDidBlurDetails.fire(e4)));
    if (_options.statusBarMenuId && _options.showStatusBarSettingId && _configurationService.getValue(_options.showStatusBarSettingId)) {
      this._status = this._register(_instantiationService.createInstance(SuggestWidgetStatus, this.element.domNode, _options.statusBarMenuId, { showIconsNoKeybindings: true }));
      this.element.domNode.classList.toggle("with-status-bar", true);
    }
    this._register(this._list.onMouseDown((e4) => this._onListMouseDownOrTap(e4)));
    this._register(this._list.onTap((e4) => this._onListMouseDownOrTap(e4)));
    this._register(this._list.onDidChangeFocus((e4) => this._onListFocus(e4)));
    this._register(this._list.onDidChangeSelection((e4) => this._onListSelection(e4)));
    this._register(this._onDidFontConfigurationChange(() => {
      if (this._completionModel) {
        this._list.splice(0, this._completionModel.items.length, this._completionModel.items);
      }
    }));
    this._register(_configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("editor.suggest.showIcons")) {
        applyIconStyle();
      }
      if (_options.statusBarMenuId && _options.showStatusBarSettingId && e4.affectsConfiguration(_options.showStatusBarSettingId)) {
        const showStatusBar = _configurationService.getValue(_options.showStatusBarSettingId);
        if (showStatusBar && !this._status) {
          this._status = this._register(_instantiationService.createInstance(SuggestWidgetStatus, this.element.domNode, _options.statusBarMenuId, { showIconsNoKeybindings: true }));
          this._status.show();
        } else if (showStatusBar && this._status) {
          this._status.show();
        } else if (this._status) {
          this._status.element.remove();
          this._status.dispose();
          this._status = void 0;
          this._layout(void 0);
        }
        this.element.domNode.classList.toggle("with-status-bar", showStatusBar);
      }
    }));
  }
  static {
    this.LOADING_MESSAGE = localize(23363, null);
  }
  static {
    this.NO_SUGGESTIONS_MESSAGE = localize(23364, null);
  }
  get list() {
    return this._list;
  }
  _onListFocus(e4) {
    if (this._ignoreFocusEvents) {
      return;
    }
    if (this._state === 5 /* Details */) {
      this._setState(3 /* Open */);
    }
    if (!e4.elements.length) {
      if (this._currentSuggestionDetails) {
        this._currentSuggestionDetails.cancel();
        this._currentSuggestionDetails = void 0;
        this._focusedItem = void 0;
        this._ctxSuggestWidgetHasFocusedSuggestion.set(false);
      }
      this._clearAriaActiveDescendant();
      return;
    }
    if (!this._completionModel) {
      return;
    }
    this._ctxSuggestWidgetHasFocusedSuggestion.set(true);
    const item = e4.elements[0];
    const index2 = e4.indexes[0];
    if (item !== this._focusedItem) {
      this._currentSuggestionDetails?.cancel();
      this._currentSuggestionDetails = void 0;
      this._focusedItem = item;
      this._list.reveal(index2);
      const id2 = getAriaId(index2);
      const node = getActiveWindow().document.activeElement;
      if (node && id2) {
        node.setAttribute("aria-haspopup", "true");
        node.setAttribute("aria-autocomplete", "list");
        node.setAttribute("aria-activedescendant", id2);
      } else {
        this._clearAriaActiveDescendant();
      }
      this._currentSuggestionDetails = createCancelablePromise(async (token) => {
        const loading = disposableTimeout(() => {
          if (this._isDetailsVisible()) {
            this._showDetails(true, false);
          }
        }, 250);
        const sub = token.onCancellationRequested(() => loading.dispose());
        try {
          return await Promise.resolve();
        } finally {
          loading.dispose();
          sub.dispose();
        }
      });
      this._currentSuggestionDetails.then(() => {
        if (index2 >= this._list.length || item !== this._list.element(index2)) {
          return;
        }
        this._ignoreFocusEvents = true;
        this._list.splice(index2, 1, [item]);
        this._list.setFocus([index2]);
        this._ignoreFocusEvents = false;
        if (this._isDetailsVisible()) {
          this._showDetails(false, false);
        } else {
          this.element.domNode.classList.remove("docs-side");
        }
      }).catch();
    }
    this._ctxFirstSuggestionFocused.set(index2 === 0);
    this._onDidFocus.fire({ item, index: index2, model: this._completionModel });
  }
  _clearAriaActiveDescendant() {
    const node = getActiveWindow().document.activeElement;
    if (!node) {
      return;
    }
    node.setAttribute("aria-haspopup", "false");
    node.setAttribute("aria-autocomplete", "both");
    node.removeAttribute("aria-activedescendant");
  }
  setCompletionModel(completionModel) {
    this._completionModel = completionModel;
  }
  hasCompletions() {
    return this._completionModel?.items.length !== 0;
  }
  resetWidgetSize() {
    this._persistedSize.reset();
  }
  relayout(cursorPosition) {
    if (this._state === 0 /* Hidden */) {
      return;
    }
    this._cursorPosition = cursorPosition;
    this._layout(this.element.size);
    this._afterRender();
  }
  showTriggered(explicitlyInvoked, cursorPosition) {
    if (this._state !== 0 /* Hidden */) {
      return;
    }
    this._cursorPosition = cursorPosition;
    this._ctxSuggestWidgetExplicitlyInvoked.set(!!explicitlyInvoked);
    if (this._ctxSuggestWidgetExplicitlyInvoked.get()) {
      this._loadingTimeout = disposableTimeout(() => this._setState(1 /* Loading */), 250);
    }
  }
  showSuggestions(selectionIndex, isFrozen2, isAuto, cursorPosition) {
    this._cursorPosition = cursorPosition;
    this._loadingTimeout?.dispose();
    const selectionMode = this._options?.selectionModeSettingId ? this._configurationService.getValue(this._options.selectionModeSettingId) : void 0;
    const noFocus = !this._ctxSuggestWidgetExplicitlyInvoked.get() && selectionMode === "never" /* Never */;
    if (isFrozen2 && this._state !== 2 /* Empty */ && this._state !== 0 /* Hidden */) {
      this._setState(4 /* Frozen */);
      return;
    }
    const visibleCount = this._completionModel?.items.length ?? 0;
    const isEmpty = visibleCount === 0;
    if (isEmpty) {
      this._setState(isAuto ? 0 /* Hidden */ : 2 /* Empty */);
      this._completionModel = void 0;
      return;
    }
    try {
      this._list.splice(0, this._list.length, this._completionModel?.items ?? []);
      this._setState(isFrozen2 ? 4 /* Frozen */ : 3 /* Open */);
      this._list.reveal(selectionIndex, 0);
      this._list.setFocus(noFocus ? [] : [selectionIndex]);
    } finally {
    }
    this._pendingLayout.value = runAtThisOrScheduleAtNextAnimationFrame(getWindow(this.element.domNode), () => {
      this._pendingLayout.clear();
      this._layout(this.element.size);
    });
    this._updateListStyles();
    this._afterRender();
  }
  _updateListStyles() {
    if (this._options.selectionModeSettingId) {
      const selectionMode = this._configurationService.getValue(this._options.selectionModeSettingId);
      const usePartialStyle = !this._ctxSuggestWidgetExplicitlyInvoked.get() && selectionMode === "partial" /* Partial */;
      this._list.style(getListStylesWithMode(usePartialStyle));
      this.element.domNode.classList.toggle("partial-selection" /* PartialSelection */, usePartialStyle);
    }
  }
  setLineContext(lineContext) {
    if (this._completionModel) {
      this._completionModel.lineContext = lineContext;
    }
  }
  _setState(state) {
    if (this._state === state) {
      return;
    }
    this._state = state;
    this.element.domNode.classList.toggle("frozen", state === 4 /* Frozen */);
    this.element.domNode.classList.remove("message");
    switch (state) {
      case 0 /* Hidden */:
        if (this._status) {
          hide(this._status.element);
        }
        hide(this._listElement);
        hide(this._messageElement);
        hide(this.element.domNode);
        this._details.hide(true);
        this._status?.hide();
        this._ctxSuggestWidgetHasFocusedSuggestion.reset();
        this._showTimeout.cancel();
        this.element.domNode.classList.remove("visible");
        this._list.splice(0, this._list.length);
        this._focusedItem = void 0;
        this._cappedHeight = void 0;
        this._explainMode = false;
        break;
      case 1 /* Loading */:
        this.element.domNode.classList.add("message");
        this._messageElement.textContent = SimpleSuggestWidget.LOADING_MESSAGE;
        hide(this._listElement);
        if (this._status) {
          hide(this._status.element);
        }
        show(this._messageElement);
        this._details.hide();
        this._show();
        this._focusedItem = void 0;
        status(SimpleSuggestWidget.LOADING_MESSAGE);
        break;
      case 2 /* Empty */:
        this.element.domNode.classList.add("message");
        this._messageElement.textContent = SimpleSuggestWidget.NO_SUGGESTIONS_MESSAGE;
        hide(this._listElement);
        if (this._status) {
          hide(this._status.element);
        }
        show(this._messageElement);
        this._details.hide();
        this._show();
        this._focusedItem = void 0;
        status(SimpleSuggestWidget.NO_SUGGESTIONS_MESSAGE);
        break;
      case 3 /* Open */:
        hide(this._messageElement);
        this._showListAndStatus();
        this._show();
        break;
      case 4 /* Frozen */:
        hide(this._messageElement);
        this._showListAndStatus();
        this._show();
        break;
      case 5 /* Details */:
        hide(this._messageElement);
        this._showListAndStatus();
        this._details.show();
        this._show();
        break;
    }
  }
  _showListAndStatus() {
    if (this._status) {
      show(this._listElement, this._status.element);
    } else {
      show(this._listElement);
    }
  }
  _show() {
    this._status?.show();
    show(this.element.domNode);
    this._layout(this._persistedSize.restore());
    this._onDidShow.fire(this);
    this._showTimeout.cancelAndSet(() => {
      this.element.domNode.classList.add("visible");
    }, 100);
  }
  toggleDetailsFocus() {
    if (this._state === 5 /* Details */) {
      this._list.setFocus(this._list.getFocus());
      this._setState(3 /* Open */);
    } else if (this._state === 3 /* Open */) {
      this._setState(5 /* Details */);
      if (!this._isDetailsVisible()) {
        this.toggleDetails(true);
      } else {
        this._details.widget.focus();
      }
    }
  }
  toggleDetails(focused = false) {
    if (this._isDetailsVisible()) {
      this._pendingShowDetails.clear();
      this._setDetailsVisible(false);
      this._details.hide();
      this.element.domNode.classList.remove("shows-details");
    } else if ((canExpandCompletionItem2(this._list.getFocusedElements()[0]) || this._explainMode) && (this._state === 3 /* Open */ || this._state === 5 /* Details */ || this._state === 4 /* Frozen */)) {
      this._setDetailsVisible(true);
      this._showDetails(false, focused);
    }
  }
  _showDetails(loading, focused) {
    this._pendingShowDetails.value = runAtThisOrScheduleAtNextAnimationFrame(getWindow(this.element.domNode), () => {
      this._pendingShowDetails.clear();
      this._details.show();
      let didFocusDetails = false;
      if (loading) {
        this._details.widget.renderLoading();
      } else {
        this._details.widget.renderItem(this._list.getFocusedElements()[0], this._explainMode);
      }
      if (!this._details.widget.isEmpty) {
        this._positionDetails();
        this.element.domNode.classList.add("shows-details");
        if (focused) {
          this._details.widget.focus();
          didFocusDetails = true;
        }
      } else {
        this._details.hide();
      }
      if (!didFocusDetails) {
      }
    });
  }
  toggleExplainMode() {
    if (this._list.getFocusedElements()[0]) {
      this._explainMode = !this._explainMode;
      if (!this._isDetailsVisible()) {
        this.toggleDetails();
      } else {
        this._showDetails(false, false);
      }
    }
  }
  hide() {
    this._pendingLayout.clear();
    this._pendingShowDetails.clear();
    this._loadingTimeout?.dispose();
    this._ctxSuggestWidgetHasBeenNavigated.reset();
    this._ctxFirstSuggestionFocused.reset();
    this._ctxSuggestWidgetExplicitlyInvoked.reset();
    this._setState(0 /* Hidden */);
    this._onDidHide.fire(this);
    hide(this.element.domNode);
    this.element.clearSashHoverState();
    const dim = this._persistedSize.restore();
    const minPersistedHeight = Math.ceil(this._getLayoutInfo().itemHeight * 4.3);
    if (dim && dim.height < minPersistedHeight) {
      this._persistedSize.store(dim.with(void 0, minPersistedHeight));
    }
  }
  _layout(size3) {
    if (!this._cursorPosition) {
      return;
    }
    const bodyBox = getClientArea(this._container.ownerDocument.body);
    const info = this._getLayoutInfo();
    if (!size3) {
      size3 = info.defaultSize;
    }
    let height = size3.height;
    let width2 = size3.width;
    if (this._status) {
      this._status.element.style.height = `${info.itemHeight}px`;
    }
    const maxWidth = bodyBox.width - info.borderHeight - 2 * info.horizontalPadding;
    if (width2 > maxWidth) {
      width2 = maxWidth;
    }
    const preferredWidth = this._completionModel ? this._completionModel.stats.pLabelLen * info.typicalHalfwidthCharacterWidth : width2;
    const cappedListContentHeight = Math.min(this._list.contentHeight, info.itemHeight * 12);
    const fullHeight = info.statusBarHeight + cappedListContentHeight + this._messageElement.clientHeight + info.borderHeight;
    const minHeight = info.itemHeight + info.statusBarHeight;
    const editorBox = getDomNodePagePosition(this._container);
    const cursorBox = {
      top: this._cursorPosition.top - editorBox.top,
      left: this._cursorPosition.left,
      height: this._cursorPosition.height
    };
    const cursorBottom = editorBox.top + cursorBox.top + cursorBox.height;
    const maxHeightBelow = Math.min(bodyBox.height - cursorBottom - info.verticalPadding, fullHeight);
    const availableSpaceAbove = editorBox.top + cursorBox.top - info.verticalPadding;
    const maxHeightAbove = Math.min(availableSpaceAbove, fullHeight);
    let maxHeight = Math.min(Math.max(maxHeightAbove, maxHeightBelow) + info.borderHeight, fullHeight);
    if (height === this._cappedHeight?.capped) {
      height = this._cappedHeight.wanted;
    }
    if (height < minHeight) {
      height = minHeight;
    }
    if (height > maxHeight) {
      height = maxHeight;
    }
    const forceRenderingAboveRequiredSpace = 150;
    if (height > maxHeightBelow && maxHeightAbove > maxHeightBelow || this._forceRenderingAbove && availableSpaceAbove > forceRenderingAboveRequiredSpace) {
      this._preference = 0 /* Above */;
      this.element.enableSashes(true, true, false, false);
      maxHeight = maxHeightAbove;
    } else {
      this._preference = 1 /* Below */;
      this.element.enableSashes(false, true, true, false);
      maxHeight = maxHeightBelow;
    }
    this.element.preferredSize = new Dimension(preferredWidth, info.defaultSize.height);
    this.element.maxSize = new Dimension(maxWidth, maxHeight);
    this.element.minSize = new Dimension(220, minHeight);
    this._cappedHeight = height === fullHeight ? { wanted: this._cappedHeight?.wanted ?? size3.height, capped: height } : void 0;
    let anchorLeft = this._cursorPosition.left;
    const wouldOverflowRight = anchorLeft + width2 > bodyBox.width;
    if (wouldOverflowRight) {
      anchorLeft = this._cursorPosition.left - width2;
    }
    this.element.domNode.style.left = `${anchorLeft}px`;
    if (this._preference === 0 /* Above */) {
      this.element.domNode.style.top = `${this._cursorPosition.top - height - info.borderHeight}px`;
    } else {
      this.element.domNode.style.top = `${this._cursorPosition.top + this._cursorPosition.height}px`;
    }
    this._resize(width2, height);
  }
  _afterRender() {
    if (this._state === 2 /* Empty */ || this._state === 1 /* Loading */) {
      return;
    }
    if (this._isDetailsVisible() && !this._details.widget.isEmpty) {
      this._details.show();
    }
    this._positionDetails();
  }
  _resize(width2, height) {
    const { width: maxWidth, height: maxHeight } = this.element.maxSize;
    width2 = Math.min(maxWidth, width2);
    if (maxHeight) {
      height = Math.min(maxHeight, height);
    }
    const { statusBarHeight } = this._getLayoutInfo();
    this._list.layout(height - statusBarHeight, width2);
    this._listElement.style.height = `${height - statusBarHeight}px`;
    this._listElement.style.width = `${width2}px`;
    this.element.layout(height, width2);
    if (this._cursorPosition && this._preference === 0 /* Above */) {
      this.element.domNode.style.top = `${this._cursorPosition.top - height}px`;
    }
    this._positionDetails();
  }
  _positionDetails() {
    if (this._isDetailsVisible()) {
      this._details.placeAtAnchor(this.element.domNode);
    }
  }
  _getLayoutInfo() {
    const fontInfo = this._getFontInfo();
    const itemHeight = clamp(fontInfo.lineHeight, 8, 1e3);
    const statusBarHeight = !this._options.statusBarMenuId || !this._options.showStatusBarSettingId || !this._configurationService.getValue(this._options.showStatusBarSettingId) || this._state === 2 /* Empty */ || this._state === 1 /* Loading */ ? 0 : itemHeight;
    const borderWidth = this._details.widget.borderWidth;
    const borderHeight = 2 * borderWidth;
    return {
      itemHeight,
      statusBarHeight,
      borderWidth,
      borderHeight,
      typicalHalfwidthCharacterWidth: 10,
      verticalPadding: 22,
      horizontalPadding: 14,
      defaultSize: new Dimension(430, statusBarHeight + 12 * itemHeight + borderHeight)
    };
  }
  _onListMouseDownOrTap(e4) {
    if (typeof e4.element === "undefined" || typeof e4.index === "undefined") {
      return;
    }
    e4.browserEvent.preventDefault();
    e4.browserEvent.stopPropagation();
    this._select(e4.element, e4.index);
  }
  _onListSelection(e4) {
    if (e4.elements.length) {
      this._select(e4.elements[0], e4.indexes[0]);
    }
  }
  _select(item, index2) {
    const completionModel = this._completionModel;
    if (completionModel) {
      this._onDidSelect.fire({ item, index: index2, model: completionModel });
    }
  }
  selectNext() {
    this._clearPartialSelectionState();
    this._list.focusNext(1, true);
    const focus = this._list.getFocus();
    if (focus.length > 0) {
      this._list.reveal(focus[0]);
    }
    return true;
  }
  selectNextPage() {
    this._clearPartialSelectionState();
    this._list.focusNextPage();
    const focus = this._list.getFocus();
    if (focus.length > 0) {
      this._list.reveal(focus[0]);
    }
    return true;
  }
  selectPrevious() {
    this._clearPartialSelectionState();
    this._list.focusPrevious(1, true);
    const focus = this._list.getFocus();
    if (focus.length > 0) {
      this._list.reveal(focus[0]);
    }
    return true;
  }
  selectPreviousPage() {
    this._clearPartialSelectionState();
    this._list.focusPreviousPage();
    const focus = this._list.getFocus();
    if (focus.length > 0) {
      this._list.reveal(focus[0]);
    }
    return true;
  }
  _clearPartialSelectionState() {
    this._list.style(getListStylesWithMode(false));
    this.element.domNode.classList.remove("partial-selection" /* PartialSelection */);
  }
  getFocusedItem() {
    if (this._completionModel) {
      return {
        item: this._list.getFocusedElements()[0],
        index: this._list.getFocus()[0],
        model: this._completionModel
      };
    }
    return void 0;
  }
  _isDetailsVisible() {
    return this._storageService.getBoolean("expandSuggestionDocs", 0 /* PROFILE */, false);
  }
  _setDetailsVisible(value2) {
    this._storageService.store("expandSuggestionDocs", value2, 0 /* PROFILE */, 0 /* USER */);
  }
  forceRenderingAbove() {
    if (!this._forceRenderingAbove) {
      this._forceRenderingAbove = true;
      this._layout(this._persistedSize.restore());
    }
  }
  stopForceRenderingAbove() {
    this._forceRenderingAbove = false;
  }
};

SimpleSuggestWidget = __decorateClass([
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IStorageService),
  __decorateParam(9, IContextKeyService)
], SimpleSuggestWidget);

function getListStylesWithMode(partial) {
  if (partial) {
    return getListStyles({
      listInactiveFocusOutline: focusBorder,
      listInactiveFocusForeground: editorSuggestWidgetForeground
    });
  } else {
    return getListStyles({
      listInactiveFocusBackground: editorSuggestWidgetSelectedBackground,
      listInactiveFocusOutline: activeContrastBorder
    });
  }
}
export { getListStylesWithMode, $107, SimpleSuggestContext, SimpleSuggestWidget };
