// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/suggest/browser/suggestWidget.ts
import { registerColor, transparent } from "./module-0226.mjs";
import { editorForeground, editorWidgetBackground, editorWidgetBorder } from "./module-0229.mjs";
import { localize } from "./module-0001.mjs";
import { quickInputListFocusBackground, quickInputListFocusForeground, quickInputListFocusIconForeground } from "./module-0235.mjs";
import { activeContrastBorder } from "./module-0227.mjs";
import { listFocusHighlightForeground, listHighlightForeground } from "./module-0232.mjs";
import { EmbeddedCodeEditorWidget } from "./module-0621.mjs";
import { $, Dimension, addStandardDisposableListener, append, getClientArea, getDomNodePagePosition, getWindow, hide, runAtThisOrScheduleAtNextAnimationFrame, show, trackFocus } from "./module-0075.mjs";
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { TimeoutTimer, createCancelablePromise, disposableTimeout } from "./module-0036.mjs";
import { Emitter, PauseableEmitter } from "./module-0017.mjs";
import { ResizableHTMLElement } from "./module-0585.mjs";
import { SuggestDetailsOverlay, SuggestDetailsWidget, canExpandCompletionItem } from "./module-0754.mjs";
import { ItemRenderer } from "./module-0756.mjs";
import { List } from "./module-0460.mjs";
import { isWindows } from "./module-0014.mjs";
import { CompletionItemKinds } from "./module-0164.mjs";
import { format2 } from "./module-0030.mjs";
import { getListStyles } from "./module-0513.mjs";
import { SuggestWidgetStatus } from "./module-0753.mjs";
import { Context, suggestWidgetStatusbarMenu } from "./module-0696.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { status } from "./module-0076.mjs";
import { clamp } from "./module-0040.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/editor/contrib/suggest/browser/suggestWidget.ts
var editorSuggestWidgetBackground = registerColor("editorSuggestWidget.background", editorWidgetBackground, localize(1659, null));

registerColor("editorSuggestWidget.border", editorWidgetBorder, localize(1660, null));

var editorSuggestWidgetForeground = registerColor("editorSuggestWidget.foreground", editorForeground, localize(1663, null));

var editorSuggestWidgetSelectedForeground = registerColor("editorSuggestWidget.selectedForeground", { dark: quickInputListFocusForeground, light: quickInputListFocusForeground, hcDark: editorSuggestWidgetBackground, hcLight: editorSuggestWidgetBackground }, localize(1666, null));

registerColor("editorSuggestWidget.selectedIconForeground", { dark: quickInputListFocusIconForeground, light: quickInputListFocusIconForeground, hcDark: editorSuggestWidgetBackground, hcLight: editorSuggestWidgetBackground }, localize(1667, null));

var editorSuggestWidgetSelectedBackground = registerColor("editorSuggestWidget.selectedBackground", { dark: quickInputListFocusBackground, light: quickInputListFocusBackground, hcDark: editorSuggestWidgetForeground, hcLight: editorSuggestWidgetForeground }, localize(1665, null));

var editorSuggestWidgetFocusOutline = registerColor("editorSuggestWidget.focusOutline", activeContrastBorder, localize(1662, null));

registerColor("editorSuggestWidget.highlightForeground", listHighlightForeground, localize(1664, null));

registerColor("editorSuggestWidget.focusHighlightForeground", { dark: listFocusHighlightForeground, light: listFocusHighlightForeground, hcDark: editorSuggestWidgetSelectedForeground, hcLight: editorSuggestWidgetSelectedForeground }, localize(1661, null));

registerColor("editorSuggestWidgetStatus.foreground", transparent(editorSuggestWidgetForeground, 0.5), localize(1668, null));

var PersistedWidgetSize = class {
  constructor(_service, editor) {
    this._service = _service;
    this._key = `suggestWidget.size/${editor.getEditorType()}/${editor instanceof EmbeddedCodeEditorWidget}`;
  }
  restore() {
    const raw = this._service.get(this._key, 0 /* PROFILE */) ?? "";
    try {
      const obj = JSON.parse(raw);
      if (Dimension.is(obj)) {
        return Dimension.lift(obj);
      }
    } catch {
    }
    return void 0;
  }
  store(size3) {
    this._service.store(this._key, JSON.stringify(size3), 0 /* PROFILE */, 1 /* MACHINE */);
  }
  reset() {
    this._service.remove(this._key, 0 /* PROFILE */);
  }
};

var SuggestWidget = class {
  constructor(editor, _storageService, _contextKeyService, _themeService, instantiationService) {
    this.editor = editor;
    this._storageService = _storageService;
    this._state = 0 /* Hidden */;
    this._isAuto = false;
    this._loadingTimeout = new MutableDisposable();
    this._pendingLayout = new MutableDisposable();
    this._pendingShowDetails = new MutableDisposable();
    this._ignoreFocusEvents = false;
    this._forceRenderingAbove = false;
    this._explainMode = false;
    this._showTimeout = new TimeoutTimer();
    this._disposables = new DisposableStore();
    this._onDidSelect = new PauseableEmitter();
    this._onDidFocus = new PauseableEmitter();
    this._onDidHide = new Emitter();
    this._onDidShow = new Emitter();
    this.onDidSelect = this._onDidSelect.event;
    this.onDidFocus = this._onDidFocus.event;
    this.onDidHide = this._onDidHide.event;
    this.onDidShow = this._onDidShow.event;
    this._onDetailsKeydown = new Emitter();
    this.onDetailsKeyDown = this._onDetailsKeydown.event;
    this.element = new ResizableHTMLElement();
    this.element.domNode.classList.add("editor-widget", "suggest-widget");
    this._contentWidget = new SuggestContentWidget(this, editor);
    this._persistedSize = new PersistedWidgetSize(_storageService, editor);
    class ResizeState {
      constructor(persistedSize, currentSize, persistHeight = false, persistWidth = false) {
        this.persistedSize = persistedSize;
        this.currentSize = currentSize;
        this.persistHeight = persistHeight;
        this.persistWidth = persistWidth;
      }
    }
    let state;
    this._disposables.add(this.element.onDidWillResize(() => {
      this._contentWidget.lockPreference();
      state = new ResizeState(this._persistedSize.restore(), this.element.size);
    }));
    this._disposables.add(this.element.onDidResize((e) => {
      this._resize(e.dimension.width, e.dimension.height);
      if (state) {
        state.persistHeight = state.persistHeight || !!e.north || !!e.south;
        state.persistWidth = state.persistWidth || !!e.east || !!e.west;
      }
      if (!e.done) {
        return;
      }
      if (state) {
        const { itemHeight, defaultSize } = this.getLayoutInfo();
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
      this._contentWidget.unlockPreference();
      state = void 0;
    }));
    this._messageElement = append(this.element.domNode, $(".message"));
    this._listElement = append(this.element.domNode, $(".tree"));
    const details = this._disposables.add(instantiationService.createInstance(SuggestDetailsWidget, this.editor));
    details.onDidClose(() => this.toggleDetails(), this, this._disposables);
    this._details = new SuggestDetailsOverlay(details, this.editor);
    const applyIconStyle = () => this.element.domNode.classList.toggle("no-icons", !this.editor.getOption(134 /* suggest */).showIcons);
    applyIconStyle();
    const applyFitWidthStyle = () => this.element.domNode.classList.toggle("fit-width-to-details", this.editor.getOption(134 /* suggest */).fitWidthToDetails);
    applyFitWidthStyle();
    const renderer = instantiationService.createInstance(ItemRenderer, this.editor);
    this._disposables.add(renderer);
    this._disposables.add(renderer.onDidToggleDetails(() => this.toggleDetails()));
    this._list = new List("SuggestWidget", this._listElement, {
      getHeight: (_element) => this.getLayoutInfo().itemHeight,
      getTemplateId: (_element) => "suggestion"
    }, [renderer], {
      alwaysConsumeMouseWheel: true,
      useShadows: false,
      mouseSupport: false,
      multipleSelectionSupport: false,
      accessibilityProvider: {
        getRole: () => isWindows ? "listitem" : "option",
        getWidgetAriaLabel: () => localize(1673, null),
        getWidgetRole: () => "listbox",
        getAriaLabel: (item) => {
          let label3 = item.textLabel;
          const kindLabel = CompletionItemKinds.toLabel(item.completion.kind);
          if (typeof item.completion.label !== "string") {
            const { detail: detail3, description } = item.completion.label;
            if (detail3 && description) {
              label3 = localize(1672, null, label3, detail3, description, kindLabel);
            } else if (detail3) {
              label3 = localize(1671, null, label3, detail3, kindLabel);
            } else if (description) {
              label3 = localize(1670, null, label3, description, kindLabel);
            }
          } else {
            label3 = localize(1669, null, label3, kindLabel);
          }
          if (!item.isResolved || !this._isDetailsVisible()) {
            return label3;
          }
          const { documentation, detail: detail2 } = item.completion;
          const docs = format2(
            "{0}{1}",
            detail2 || "",
            documentation ? typeof documentation === "string" ? documentation : documentation.value : ""
          );
          return localize(1658, null, label3, docs);
        }
      }
    });
    this._list.style(getListStyles({
      listInactiveFocusBackground: editorSuggestWidgetSelectedBackground,
      listInactiveFocusOutline: editorSuggestWidgetFocusOutline
    }));
    this._status = instantiationService.createInstance(SuggestWidgetStatus, this.element.domNode, suggestWidgetStatusbarMenu, void 0);
    const applyStatusBarStyle = () => this.element.domNode.classList.toggle("with-status-bar", this.editor.getOption(134 /* suggest */).showStatusBar);
    applyStatusBarStyle();
    this._disposables.add(this._list.onMouseDown((e) => this._onListMouseDownOrTap(e)));
    this._disposables.add(this._list.onTap((e) => this._onListMouseDownOrTap(e)));
    this._disposables.add(this._list.onDidChangeSelection((e) => this._onListSelection(e)));
    this._disposables.add(this._list.onDidChangeFocus((e) => this._onListFocus(e)));
    this._disposables.add(this.editor.onDidChangeCursorSelection(() => this._onCursorSelectionChanged()));
    this._disposables.add(this.editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(134 /* suggest */)) {
        applyStatusBarStyle();
        applyIconStyle();
        applyFitWidthStyle();
      }
      if (this._completionModel && (e.hasChanged(59 /* fontInfo */) || e.hasChanged(135 /* suggestFontSize */) || e.hasChanged(136 /* suggestLineHeight */))) {
        this._list.splice(0, this._list.length, this._completionModel.items);
      }
    }));
    this._ctxSuggestWidgetVisible = Context.Visible.bindTo(_contextKeyService);
    this._ctxSuggestWidgetDetailsVisible = Context.DetailsVisible.bindTo(_contextKeyService);
    this._ctxSuggestWidgetMultipleSuggestions = Context.MultipleSuggestions.bindTo(_contextKeyService);
    this._ctxSuggestWidgetHasFocusedSuggestion = Context.HasFocusedSuggestion.bindTo(_contextKeyService);
    this._ctxSuggestWidgetDetailsFocused = Context.DetailsFocused.bindTo(_contextKeyService);
    const detailsFocusTracker = trackFocus(this._details.widget.domNode);
    this._disposables.add(detailsFocusTracker);
    this._disposables.add(detailsFocusTracker.onDidFocus(() => this._ctxSuggestWidgetDetailsFocused.set(true)));
    this._disposables.add(detailsFocusTracker.onDidBlur(() => this._ctxSuggestWidgetDetailsFocused.set(false)));
    this._disposables.add(addStandardDisposableListener(this._details.widget.domNode, "keydown", (e) => {
      this._onDetailsKeydown.fire(e);
    }));
    this._disposables.add(this.editor.onMouseDown((e) => this._onEditorMouseDown(e)));
  }
  static {
    this.LOADING_MESSAGE = localize(1674, null);
  }
  static {
    this.NO_SUGGESTIONS_MESSAGE = localize(1675, null);
  }
  dispose() {
    this._details.widget.dispose();
    this._details.dispose();
    this._list.dispose();
    this._status.dispose();
    this._disposables.dispose();
    this._loadingTimeout.dispose();
    this._pendingLayout.dispose();
    this._pendingShowDetails.dispose();
    this._showTimeout.dispose();
    this._contentWidget.dispose();
    this.element.dispose();
    this._onDidSelect.dispose();
    this._onDidFocus.dispose();
    this._onDidHide.dispose();
    this._onDidShow.dispose();
    this._onDetailsKeydown.dispose();
  }
  _onEditorMouseDown(mouseEvent) {
    if (this._details.widget.domNode.contains(mouseEvent.target.element)) {
      this._details.widget.domNode.focus();
    } else {
      if (this.element.domNode.contains(mouseEvent.target.element)) {
        this.editor.focus();
      }
    }
  }
  _onCursorSelectionChanged() {
    if (this._state !== 0 /* Hidden */) {
      this._contentWidget.layout();
    }
  }
  _onListMouseDownOrTap(e) {
    if (typeof e.element === "undefined" || typeof e.index === "undefined") {
      return;
    }
    e.browserEvent.preventDefault();
    e.browserEvent.stopPropagation();
    this._select(e.element, e.index);
  }
  _onListSelection(e) {
    if (e.elements.length) {
      this._select(e.elements[0], e.indexes[0]);
    }
  }
  _select(item, index2) {
    const completionModel = this._completionModel;
    if (completionModel) {
      this._onDidSelect.fire({ item, index: index2, model: completionModel });
      this.editor.focus();
    }
  }
  _onListFocus(e) {
    if (this._ignoreFocusEvents) {
      return;
    }
    if (this._state === 5 /* Details */) {
      this._setState(3 /* Open */);
    }
    if (!e.elements.length) {
      if (this._currentSuggestionDetails) {
        this._currentSuggestionDetails.cancel();
        this._currentSuggestionDetails = void 0;
        this._focusedItem = void 0;
      }
      this.editor.setAriaOptions({ activeDescendant: void 0 });
      this._ctxSuggestWidgetHasFocusedSuggestion.set(false);
      return;
    }
    if (!this._completionModel) {
      return;
    }
    this._ctxSuggestWidgetHasFocusedSuggestion.set(true);
    const item = e.elements[0];
    const index2 = e.indexes[0];
    if (item !== this._focusedItem) {
      this._currentSuggestionDetails?.cancel();
      this._currentSuggestionDetails = void 0;
      this._focusedItem = item;
      this._list.reveal(index2);
      this._currentSuggestionDetails = createCancelablePromise(async (token) => {
        const loading = disposableTimeout(() => {
          if (this._isDetailsVisible()) {
            this._showDetails(true, false);
          }
        }, 250);
        const sub = token.onCancellationRequested(() => loading.dispose());
        try {
          return await item.resolve(token);
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
        this.editor.setAriaOptions({ activeDescendant: this._list.getElementID(index2) });
      }).catch(onUnexpectedError);
    }
    this._onDidFocus.fire({ item, index: index2, model: this._completionModel });
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
        hide(this._messageElement, this._listElement, this._status.element);
        this._details.hide(true);
        this._status.hide();
        this._contentWidget.hide();
        this._ctxSuggestWidgetVisible.reset();
        this._ctxSuggestWidgetMultipleSuggestions.reset();
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
        this._messageElement.textContent = SuggestWidget.LOADING_MESSAGE;
        hide(this._listElement, this._status.element);
        show(this._messageElement);
        this._details.hide();
        this._show();
        this._focusedItem = void 0;
        status(SuggestWidget.LOADING_MESSAGE);
        break;
      case 2 /* Empty */:
        this.element.domNode.classList.add("message");
        this._messageElement.textContent = SuggestWidget.NO_SUGGESTIONS_MESSAGE;
        hide(this._listElement, this._status.element);
        show(this._messageElement);
        this._details.hide();
        this._show();
        this._focusedItem = void 0;
        status(SuggestWidget.NO_SUGGESTIONS_MESSAGE);
        break;
      case 3 /* Open */:
        hide(this._messageElement);
        show(this._listElement, this._status.element);
        this._show();
        break;
      case 4 /* Frozen */:
        hide(this._messageElement);
        show(this._listElement, this._status.element);
        this._show();
        break;
      case 5 /* Details */:
        hide(this._messageElement);
        show(this._listElement, this._status.element);
        this._details.show();
        this._show();
        this._details.widget.focus();
        break;
    }
  }
  _show() {
    this._status.show();
    this._contentWidget.show();
    this._layout(this._persistedSize.restore());
    this._ctxSuggestWidgetVisible.set(true);
    this._showTimeout.cancelAndSet(() => {
      this.element.domNode.classList.add("visible");
      this._onDidShow.fire(this);
    }, 100);
  }
  showTriggered(auto, delay) {
    if (this._state !== 0 /* Hidden */) {
      return;
    }
    this._contentWidget.setPosition(this.editor.getPosition());
    this._isAuto = !!auto;
    if (!this._isAuto) {
      this._loadingTimeout.value = disposableTimeout(() => this._setState(1 /* Loading */), delay);
    }
  }
  showSuggestions(completionModel, selectionIndex, isFrozen2, isAuto, noFocus) {
    this._contentWidget.setPosition(this.editor.getPosition());
    this._loadingTimeout.clear();
    this._currentSuggestionDetails?.cancel();
    this._currentSuggestionDetails = void 0;
    if (this._completionModel !== completionModel) {
      this._completionModel = completionModel;
    }
    if (isFrozen2 && this._state !== 2 /* Empty */ && this._state !== 0 /* Hidden */) {
      this._setState(4 /* Frozen */);
      return;
    }
    const visibleCount = this._completionModel.items.length;
    const isEmpty = visibleCount === 0;
    this._ctxSuggestWidgetMultipleSuggestions.set(visibleCount > 1);
    if (isEmpty) {
      this._setState(isAuto ? 0 /* Hidden */ : 2 /* Empty */);
      this._completionModel = void 0;
      return;
    }
    this._focusedItem = void 0;
    this._onDidFocus.pause();
    this._onDidSelect.pause();
    try {
      this._list.splice(0, this._list.length, this._completionModel.items);
      this._setState(isFrozen2 ? 4 /* Frozen */ : 3 /* Open */);
      this._list.reveal(selectionIndex, 0, selectionIndex === 0 ? 0 : this.getLayoutInfo().itemHeight * 0.33);
      this._list.setFocus(noFocus ? [] : [selectionIndex]);
    } finally {
      this._onDidFocus.resume();
      this._onDidSelect.resume();
    }
    this._pendingLayout.value = runAtThisOrScheduleAtNextAnimationFrame(getWindow(this.element.domNode), () => {
      this._pendingLayout.clear();
      this._layout(this.element.size);
      this._details.widget.domNode.classList.remove("focused");
    });
  }
  focusSelected() {
    if (this._list.length > 0) {
      this._list.setFocus([0]);
    }
  }
  selectNextPage() {
    switch (this._state) {
      case 0 /* Hidden */:
        return false;
      case 5 /* Details */:
        this._details.widget.pageDown();
        return true;
      case 1 /* Loading */:
        return !this._isAuto;
      default:
        this._list.focusNextPage();
        return true;
    }
  }
  selectNext() {
    switch (this._state) {
      case 0 /* Hidden */:
        return false;
      case 1 /* Loading */:
        return !this._isAuto;
      default:
        this._list.focusNext(1, true);
        return true;
    }
  }
  selectLast() {
    switch (this._state) {
      case 0 /* Hidden */:
        return false;
      case 5 /* Details */:
        this._details.widget.scrollBottom();
        return true;
      case 1 /* Loading */:
        return !this._isAuto;
      default:
        this._list.focusLast();
        return true;
    }
  }
  selectPreviousPage() {
    switch (this._state) {
      case 0 /* Hidden */:
        return false;
      case 5 /* Details */:
        this._details.widget.pageUp();
        return true;
      case 1 /* Loading */:
        return !this._isAuto;
      default:
        this._list.focusPreviousPage();
        return true;
    }
  }
  selectPrevious() {
    switch (this._state) {
      case 0 /* Hidden */:
        return false;
      case 1 /* Loading */:
        return !this._isAuto;
      default:
        this._list.focusPrevious(1, true);
        return false;
    }
  }
  selectFirst() {
    switch (this._state) {
      case 0 /* Hidden */:
        return false;
      case 5 /* Details */:
        this._details.widget.scrollTop();
        return true;
      case 1 /* Loading */:
        return !this._isAuto;
      default:
        this._list.focusFirst();
        return true;
    }
  }
  getFocusedItem() {
    if (this._state !== 0 /* Hidden */ && this._state !== 2 /* Empty */ && this._state !== 1 /* Loading */ && this._completionModel && this._list.getFocus().length > 0) {
      return {
        item: this._list.getFocusedElements()[0],
        index: this._list.getFocus()[0],
        model: this._completionModel
      };
    }
    return void 0;
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
      this._ctxSuggestWidgetDetailsVisible.set(false);
      this._setDetailsVisible(false);
      this._details.hide();
      this.element.domNode.classList.remove("shows-details");
    } else if ((canExpandCompletionItem(this._list.getFocusedElements()[0]) || this._explainMode) && (this._state === 3 /* Open */ || this._state === 5 /* Details */ || this._state === 4 /* Frozen */)) {
      this._ctxSuggestWidgetDetailsVisible.set(true);
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
        this.editor.focus();
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
  resetPersistedSize() {
    this._persistedSize.reset();
  }
  hideWidget() {
    this._pendingLayout.clear();
    this._pendingShowDetails.clear();
    this._loadingTimeout.clear();
    this._setState(0 /* Hidden */);
    this._onDidHide.fire(this);
    this.element.clearSashHoverState();
    const dim = this._persistedSize.restore();
    const minPersistedHeight = Math.ceil(this.getLayoutInfo().itemHeight * 4.3);
    if (dim && dim.height < minPersistedHeight) {
      this._persistedSize.store(dim.with(void 0, minPersistedHeight));
    }
  }
  isFrozen() {
    return this._state === 4 /* Frozen */;
  }
  _afterRender(position2) {
    if (position2 === null) {
      if (this._isDetailsVisible()) {
        this._details.hide();
      }
      return;
    }
    if (this._state === 2 /* Empty */ || this._state === 1 /* Loading */) {
      return;
    }
    if (this._isDetailsVisible() && !this._details.widget.isEmpty) {
      this._details.show();
    }
    this._positionDetails();
  }
  _layout(size3) {
    if (!this.editor.hasModel()) {
      return;
    }
    if (!this.editor.getDomNode()) {
      return;
    }
    const bodyBox = getClientArea(this.element.domNode.ownerDocument.body);
    const info = this.getLayoutInfo();
    if (!size3) {
      size3 = info.defaultSize;
    }
    let height = size3.height;
    let width2 = size3.width;
    this._status.element.style.height = `${info.itemHeight}px`;
    if (this._state === 2 /* Empty */ || this._state === 1 /* Loading */) {
      height = info.itemHeight + info.borderHeight;
      width2 = info.defaultSize.width / 2;
      this.element.enableSashes(false, false, false, false);
      this.element.minSize = this.element.maxSize = new Dimension(width2, height);
      this._contentWidget.setPreference(2 /* BELOW */);
    } else {
      const maxWidth = bodyBox.width - info.borderHeight - 2 * info.horizontalPadding;
      if (width2 > maxWidth) {
        width2 = maxWidth;
      }
      let preferredWidth = this._completionModel ? this._completionModel.stats.pLabelLen * info.typicalHalfwidthCharacterWidth : width2;
      if (this.editor.getOption(134 /* suggest */).fitWidthToDetails && this._completionModel && !this._persistedSize.restore()) {
        const cap = Math.min(maxWidth, this.editor.getLayoutInfo().width);
        const fitWidth = Math.min(cap, this._measureContentWidth(info));
        width2 = Math.max(width2, fitWidth);
        preferredWidth = Math.max(preferredWidth, fitWidth);
      }
      const fullHeight = info.statusBarHeight + this._list.contentHeight + info.borderHeight;
      const minHeight = info.itemHeight + info.statusBarHeight;
      const editorBox = getDomNodePagePosition(this.editor.getDomNode());
      const cursorBox = this.editor.getScrolledVisiblePosition(this.editor.getPosition());
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
        this._contentWidget.setPreference(1 /* ABOVE */);
        this.element.enableSashes(true, true, false, false);
        maxHeight = maxHeightAbove;
      } else {
        this._contentWidget.setPreference(2 /* BELOW */);
        this.element.enableSashes(false, true, true, false);
        maxHeight = maxHeightBelow;
      }
      this.element.preferredSize = new Dimension(preferredWidth, info.defaultSize.height);
      this.element.maxSize = new Dimension(maxWidth, maxHeight);
      this.element.minSize = new Dimension(220, minHeight);
      this._cappedHeight = height === fullHeight ? { wanted: this._cappedHeight?.wanted ?? size3.height, capped: height } : void 0;
    }
    this._resize(width2, height);
  }
  _resize(width2, height) {
    const { width: maxWidth, height: maxHeight } = this.element.maxSize;
    width2 = Math.min(maxWidth, width2);
    height = Math.min(maxHeight, height);
    const { statusBarHeight } = this.getLayoutInfo();
    this._list.layout(height - statusBarHeight, width2);
    this._listElement.style.height = `${height - statusBarHeight}px`;
    this.element.layout(height, width2);
    this._contentWidget.layout();
    this._positionDetails();
  }
  _positionDetails() {
    if (this._isDetailsVisible()) {
      this._details.placeAtAnchor(this.element.domNode, this._contentWidget.getPosition()?.preference[0] === 2 /* BELOW */);
    }
  }
  /**
   * Measures the pixel width needed to show the widest item's label together with
   * its inline detail text (signature + description), plus the surrounding chrome
   * (icon, inter-column gap, read-more affordance, padding and scrollbar). Cached
   * per completion model.
   */
  _measureContentWidth(info) {
    const model = this._completionModel;
    if (!model) {
      return 0;
    }
    if (this._fitContentWidth?.model === model) {
      return this._fitContentWidth.width;
    }
    if (this._measureContext === void 0) {
      this._measureContext = $("canvas").getContext("2d");
    }
    let maxTextWidth;
    if (this._measureContext) {
      const options3 = this.editor.getOptions();
      const fontInfo = options3.get(59 /* fontInfo */);
      const fontSize = options3.get(135 /* suggestFontSize */) || fontInfo.fontSize;
      this._measureContext.font = `${fontInfo.fontWeight} ${fontSize}px ${fontInfo.getMassagedFontFamily()}`;
      maxTextWidth = 0;
      for (const item of model.items) {
        const { completion } = item;
        let text2 = item.textLabel;
        if (typeof completion.label === "string") {
          text2 += completion.detail ?? "";
        } else {
          text2 += (completion.label.detail ?? "") + (completion.label.description ?? "");
        }
        maxTextWidth = Math.max(maxTextWidth, this._measureContext.measureText(text2).width);
      }
    } else {
      maxTextWidth = model.stats.pLabelLen * info.typicalHalfwidthCharacterWidth;
    }
    const chrome = 2 * info.itemHeight + 2 * info.horizontalPadding + 20;
    const width2 = maxTextWidth + chrome;
    this._fitContentWidth = { model, width: width2 };
    return width2;
  }
  getLayoutInfo() {
    const fontInfo = this.editor.getOption(59 /* fontInfo */);
    const itemHeight = clamp(this.editor.getOption(136 /* suggestLineHeight */) || fontInfo.lineHeight, 8, 1e3);
    const statusBarHeight = !this.editor.getOption(134 /* suggest */).showStatusBar || this._state === 2 /* Empty */ || this._state === 1 /* Loading */ ? 0 : itemHeight;
    const borderWidth = this._details.widget.getLayoutInfo().borderWidth;
    const borderHeight = 2 * borderWidth;
    return {
      itemHeight,
      statusBarHeight,
      borderWidth,
      borderHeight,
      typicalHalfwidthCharacterWidth: fontInfo.typicalHalfwidthCharacterWidth,
      verticalPadding: 22,
      horizontalPadding: 14,
      defaultSize: new Dimension(430, statusBarHeight + 12 * itemHeight)
    };
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

SuggestWidget = __decorateClass([
  __decorateParam(1, IStorageService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, IInstantiationService)
], SuggestWidget);

var SuggestContentWidget = class {
  constructor(_widget, _editor) {
    this._widget = _widget;
    this._editor = _editor;
    this.allowEditorOverflow = true;
    this.suppressMouseDown = false;
    this._preferenceLocked = false;
    this._added = false;
    this._hidden = false;
  }
  dispose() {
    if (this._added) {
      this._added = false;
      this._editor.removeContentWidget(this);
    }
  }
  getId() {
    return "editor.widget.suggestWidget";
  }
  getDomNode() {
    return this._widget.element.domNode;
  }
  show() {
    this._hidden = false;
    if (!this._added) {
      this._added = true;
      this._editor.addContentWidget(this);
    }
  }
  hide() {
    if (!this._hidden) {
      this._hidden = true;
      this.layout();
    }
  }
  layout() {
    this._editor.layoutContentWidget(this);
  }
  getPosition() {
    if (this._hidden || !this._position || !this._preference) {
      return null;
    }
    return {
      position: this._position,
      preference: [this._preference]
    };
  }
  beforeRender() {
    const { height, width: width2 } = this._widget.element.size;
    const { borderWidth, horizontalPadding } = this._widget.getLayoutInfo();
    return new Dimension(width2 + 2 * borderWidth + horizontalPadding, height + 2 * borderWidth);
  }
  afterRender(position2) {
    this._widget._afterRender(position2);
  }
  setPreference(preference) {
    if (!this._preferenceLocked) {
      this._preference = preference;
    }
  }
  lockPreference() {
    this._preferenceLocked = true;
  }
  unlockPreference() {
    this._preferenceLocked = false;
  }
  setPosition(position2) {
    this._position = position2;
  }
};
export { editorSuggestWidgetBackground, editorSuggestWidgetForeground, editorSuggestWidgetSelectedForeground, editorSuggestWidgetSelectedBackground, editorSuggestWidgetFocusOutline, PersistedWidgetSize, SuggestWidget, SuggestContentWidget };
