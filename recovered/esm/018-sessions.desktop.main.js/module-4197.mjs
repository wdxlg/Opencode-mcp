// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/browserView/electron-browser/features/browserEditorFindFeature.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { SimpleFindWidget } from "./module-2352.mjs";
import { BrowserViewCommandId } from "./module-1237.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { $, DisposableResizeObserver, getWindow } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { BROWSER_EDITOR_ACTIVE, BrowserActionCategory, BrowserEditor, BrowserEditorContribution, CONTEXT_BROWSER_HAS_ERROR, CONTEXT_BROWSER_HAS_URL } from "./module-4159.mjs";
import { Lazy } from "./module-0028.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { IEditorService } from "./module-0935.mjs";


// src/vs/workbench/contrib/browserView/electron-browser/features/browserEditorFindFeature.ts
var CONTEXT_BROWSER_FIND_WIDGET_VISIBLE = new RawContextKey("browserFindWidgetVisible", false, localize(8100, null));

var CONTEXT_BROWSER_FIND_WIDGET_FOCUSED = new RawContextKey("browserFindWidgetFocused", false, localize(8099, null));

var BrowserFindWidget = class extends SimpleFindWidget {
  constructor(container2, contextViewService, contextKeyService, hoverService, keybindingService, configurationService, accessibilityService) {
    super({
      showCommonFindToggles: true,
      checkImeCompletionState: true,
      showResultCount: true,
      enableSash: true,
      initialWidth: 350,
      previousMatchActionId: BrowserViewCommandId.FindPrevious,
      nextMatchActionId: BrowserViewCommandId.FindNext,
      closeWidgetActionId: BrowserViewCommandId.HideFind
    }, contextViewService, contextKeyService, hoverService, keybindingService, configurationService, accessibilityService);
    this._modelDisposables = this._register(new DisposableStore());
    this._hasFoundMatch = false;
    this._onDidChangeHeight = this._register(new Emitter());
    this.onDidChangeHeight = this._onDidChangeHeight.event;
    this._findWidgetVisible = CONTEXT_BROWSER_FIND_WIDGET_VISIBLE.bindTo(contextKeyService);
    this._findWidgetFocused = CONTEXT_BROWSER_FIND_WIDGET_FOCUSED.bindTo(contextKeyService);
    const domNode = this.getDomNode();
    container2.appendChild(domNode);
    let lastHeight = domNode.offsetHeight;
    const resizeObserver = this._register(new DisposableResizeObserver("BrowserEditorFindFeature.heightChange", () => {
      const newHeight = domNode.offsetHeight;
      if (newHeight !== lastHeight) {
        lastHeight = newHeight;
        this._onDidChangeHeight.fire();
      }
    }, getWindow(container2)));
    this._register(resizeObserver.observe(domNode));
  }
  /**
   * Set the browser view model to use for find operations.
   * This should be called whenever the editor input changes.
   */
  setModel(model) {
    this._modelDisposables.clear();
    this._model = model;
    this._lastFindResult = void 0;
    this._hasFoundMatch = false;
    if (model) {
      this._modelDisposables.add(model.onDidFindInPage((result) => {
        this._lastFindResult = {
          resultIndex: result.activeMatchOrdinal - 1,
          // Convert to 0-based index
          resultCount: result.matches
        };
        this._hasFoundMatch = result.matches > 0;
        this.updateButtons(this._hasFoundMatch);
        this.updateResultCount();
      }));
      this._modelDisposables.add(model.onWillDispose(() => {
        this.setModel(void 0);
      }));
    }
  }
  reveal(initialInput) {
    const wasVisible = this.isVisible();
    super.reveal(initialInput);
    this._findWidgetVisible.set(true);
    this.focusFindBox();
    if (this.inputValue && !wasVisible) {
      this._onInputChanged();
    }
  }
  hide() {
    super.hide(false);
    this._findWidgetVisible.reset();
    this._model?.stopFindInPage(true);
    this._model?.focus();
    this._lastFindResult = void 0;
    this._hasFoundMatch = false;
  }
  find(previous) {
    const value2 = this.inputValue;
    if (value2 && this._model) {
      this._model.findInPage(value2, {
        forward: !previous,
        recompute: false,
        matchCase: this._getCaseSensitiveValue()
      });
    }
  }
  findFirst() {
    const value2 = this.inputValue;
    if (value2 && this._model) {
      this._model.findInPage(value2, {
        forward: true,
        recompute: true,
        matchCase: this._getCaseSensitiveValue()
      });
    }
  }
  clear() {
    if (this._model) {
      this._model.stopFindInPage(false);
      this._lastFindResult = void 0;
      this._hasFoundMatch = false;
    }
  }
  _onInputChanged() {
    if (this.inputValue) {
      this.findFirst();
    } else if (this._model) {
      this.clear();
    }
    return false;
  }
  async _getResultCount() {
    return this._lastFindResult;
  }
  _onFocusTrackerFocus() {
    this._findWidgetFocused.set(true);
  }
  _onFocusTrackerBlur() {
    this._findWidgetFocused.reset();
  }
  _onFindInputFocusTrackerFocus() {
  }
  _onFindInputFocusTrackerBlur() {
  }
};

BrowserFindWidget = __decorateClass([
  __decorateParam(1, IContextViewService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IAccessibilityService)
], BrowserFindWidget);

var BrowserEditorFindContribution = class extends BrowserEditorContribution {
  constructor(editor, instantiationService) {
    super(editor);
    this.instantiationService = instantiationService;
    this._findWidgetContainer = $(".browser-find-widget-wrapper");
    this._findWidget = new Lazy(() => {
      const findWidget = this.instantiationService.createInstance(
        BrowserFindWidget,
        this._findWidgetContainer
      );
      if (editor.model) {
        findWidget.setModel(editor.model);
      }
      findWidget.onDidChangeHeight(() => {
        editor.layoutBrowserContainer();
      });
      return findWidget;
    });
    this._register(toDisposable(() => this._findWidget.rawValue?.dispose()));
  }
  /**
   * The container element to insert below the toolbar.
   */
  get widgets() {
    return [{ location: "toolbar" /* Toolbar */, element: this._findWidgetContainer, order: 0 }];
  }
  onModelAttached(model, _store) {
    this._findWidget.rawValue?.setModel(model);
  }
  onModelDetached() {
    this._findWidget.rawValue?.setModel(void 0);
    this._findWidget.rawValue?.hide();
  }
  onPaneResized(width2) {
    this._findWidget.rawValue?.layout(width2);
  }
  /**
   * Show the find widget, optionally pre-populated with selected text from the browser view
   */
  async showFind() {
    const selectedText = (await this.editor.model?.getSelectedText())?.trim();
    const textToReveal = selectedText && !/[\r\n]/.test(selectedText) ? selectedText : void 0;
    this._findWidget.value.reveal(textToReveal);
    this._findWidget.value.layout(this._findWidgetContainer.clientWidth);
  }
  /**
   * Hide the find widget
   */
  hideFind() {
    this._findWidget.rawValue?.hide();
  }
  /**
   * Find the next match
   */
  findNext() {
    this._findWidget.rawValue?.find(false);
  }
  /**
   * Find the previous match
   */
  findPrevious() {
    this._findWidget.rawValue?.find(true);
  }
};

BrowserEditorFindContribution = __decorateClass([
  __decorateParam(1, IInstantiationService)
], BrowserEditorFindContribution);

BrowserEditor.registerContribution(BrowserEditorFindContribution);

var ShowBrowserFindAction = class _ShowBrowserFindAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.ShowFind;
  }
  constructor() {
    super({
      id: _ShowBrowserFindAction.ID,
      title: localize2(8102, "Find in Page"),
      category: BrowserActionCategory,
      icon: Codicon.search,
      f1: true,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_HAS_URL, CONTEXT_BROWSER_HAS_ERROR.negate()),
      menu: {
        id: MenuId.BrowserActionsToolbar,
        group: "3_tools" /* Tools */,
        order: 0,
        isHiddenByDefault: true
      },
      keybinding: {
        weight: 100 /* EditorContrib */,
        primary: 2048 /* CtrlCmd */ | 36 /* KeyF */
      }
    });
  }
  run(accessor, browserEditor = accessor.get(IEditorService).activeEditorPane) {
    if (browserEditor instanceof BrowserEditor) {
      void browserEditor.getContribution(BrowserEditorFindContribution)?.showFind();
    }
  }
};

var HideBrowserFindAction = class _HideBrowserFindAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.HideFind;
  }
  constructor() {
    super({
      id: _HideBrowserFindAction.ID,
      title: localize2(8101, "Close Find Widget"),
      category: BrowserActionCategory,
      f1: false,
      precondition: ContextKeyExpr.and(BROWSER_EDITOR_ACTIVE, CONTEXT_BROWSER_FIND_WIDGET_VISIBLE),
      keybinding: {
        weight: 100 /* EditorContrib */ + 5,
        primary: 9 /* Escape */
      }
    });
  }
  run(accessor) {
    const browserEditor = accessor.get(IEditorService).activeEditorPane;
    if (browserEditor instanceof BrowserEditor) {
      browserEditor.getContribution(BrowserEditorFindContribution)?.hideFind();
    }
  }
};

var BrowserFindNextAction = class _BrowserFindNextAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.FindNext;
  }
  constructor() {
    super({
      id: _BrowserFindNextAction.ID,
      title: localize2(8097, "Find Next"),
      category: BrowserActionCategory,
      f1: false,
      precondition: BROWSER_EDITOR_ACTIVE,
      keybinding: [{
        when: CONTEXT_BROWSER_FIND_WIDGET_FOCUSED,
        weight: 100 /* EditorContrib */,
        primary: 3 /* Enter */
      }, {
        when: CONTEXT_BROWSER_FIND_WIDGET_VISIBLE,
        weight: 100 /* EditorContrib */,
        primary: 61 /* F3 */,
        mac: { primary: 2048 /* CtrlCmd */ | 37 /* KeyG */ }
      }]
    });
  }
  run(accessor) {
    const browserEditor = accessor.get(IEditorService).activeEditorPane;
    if (browserEditor instanceof BrowserEditor) {
      browserEditor.getContribution(BrowserEditorFindContribution)?.findNext();
    }
  }
};

var BrowserFindPreviousAction = class _BrowserFindPreviousAction extends Action2 {
  static {
    this.ID = BrowserViewCommandId.FindPrevious;
  }
  constructor() {
    super({
      id: _BrowserFindPreviousAction.ID,
      title: localize2(8098, "Find Previous"),
      category: BrowserActionCategory,
      f1: false,
      precondition: BROWSER_EDITOR_ACTIVE,
      keybinding: [{
        when: CONTEXT_BROWSER_FIND_WIDGET_FOCUSED,
        weight: 100 /* EditorContrib */,
        primary: 1024 /* Shift */ | 3 /* Enter */
      }, {
        when: CONTEXT_BROWSER_FIND_WIDGET_VISIBLE,
        weight: 100 /* EditorContrib */,
        primary: 1024 /* Shift */ | 61 /* F3 */,
        mac: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 37 /* KeyG */ }
      }]
    });
  }
  run(accessor) {
    const browserEditor = accessor.get(IEditorService).activeEditorPane;
    if (browserEditor instanceof BrowserEditor) {
      browserEditor.getContribution(BrowserEditorFindContribution)?.findPrevious();
    }
  }
};

registerAction2(ShowBrowserFindAction);

registerAction2(HideBrowserFindAction);

registerAction2(BrowserFindNextAction);

registerAction2(BrowserFindPreviousAction);
export { CONTEXT_BROWSER_FIND_WIDGET_VISIBLE, CONTEXT_BROWSER_FIND_WIDGET_FOCUSED, BrowserFindWidget, BrowserEditorFindContribution, ShowBrowserFindAction, HideBrowserFindAction, BrowserFindNextAction, BrowserFindPreviousAction };
