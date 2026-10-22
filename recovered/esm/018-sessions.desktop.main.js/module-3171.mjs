// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/find/browser/terminalFindWidget.ts
import { SimpleFindWidget } from "./module-2352.mjs";
import { MutableDisposable } from "./module-0012.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { addDisposableListener, getWindow } from "./module-0075.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { createTextInputActions } from "./module-1500.mjs";
import { TerminalClipboardContribution } from "./module-3170.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IContextMenuService, IContextViewService } from "./module-0488.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ILogService } from "./module-0095.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/workbench/contrib/terminalContrib/find/browser/terminalFindWidget.ts
var TERMINAL_FIND_WIDGET_INITIAL_WIDTH = 419;

var TerminalFindWidget = class extends SimpleFindWidget {
  constructor(_instance, clipboardService, configurationService, contextKeyService, contextMenuService, contextViewService, hoverService, keybindingService, themeService, logService, accessibilityService) {
    super({
      showCommonFindToggles: true,
      checkImeCompletionState: true,
      showResultCount: true,
      initialWidth: TERMINAL_FIND_WIDGET_INITIAL_WIDTH,
      enableSash: true,
      appendCaseSensitiveActionId: "workbench.action.terminal.toggleFindCaseSensitive" /* ToggleFindCaseSensitive */,
      appendRegexActionId: "workbench.action.terminal.toggleFindRegex" /* ToggleFindRegex */,
      appendWholeWordsActionId: "workbench.action.terminal.toggleFindWholeWord" /* ToggleFindWholeWord */,
      previousMatchActionId: "workbench.action.terminal.findPrevious" /* FindPrevious */,
      nextMatchActionId: "workbench.action.terminal.findNext" /* FindNext */,
      closeWidgetActionId: "workbench.action.terminal.hideFind" /* FindHide */,
      type: "Terminal",
      matchesLimit: 2e4 /* SearchHighlightLimit */
    }, contextViewService, contextKeyService, hoverService, keybindingService, configurationService, accessibilityService);
    this._instance = _instance;
    this._overrideCopyOnSelectionDisposable = this._register(new MutableDisposable());
    this._selectionDisposable = this._register(new MutableDisposable());
    this._register(this.state.onFindReplaceStateChange(() => {
      this.show();
    }));
    this._findInputFocused = TerminalContextKeys.findInputFocus.bindTo(contextKeyService);
    this._findWidgetFocused = TerminalContextKeys.findFocus.bindTo(contextKeyService);
    this._findWidgetVisible = TerminalContextKeys.findVisible.bindTo(contextKeyService);
    const innerDom = this.getDomNode().firstChild;
    if (innerDom) {
      this._register(addDisposableListener(innerDom, "mousedown", (event) => {
        event.stopPropagation();
      }));
      this._register(addDisposableListener(innerDom, "contextmenu", (event) => {
        event.stopPropagation();
      }));
    }
    const findInputDomNode = this.getFindInputDomNode();
    this._register(addDisposableListener(findInputDomNode, "contextmenu", (event) => {
      const targetWindow = getWindow(findInputDomNode);
      const standardEvent = new StandardMouseEvent(targetWindow, event);
      const actions = createTextInputActions(clipboardService, logService);
      contextMenuService.showContextMenu({
        getAnchor: () => standardEvent,
        getActions: () => actions,
        getActionsContext: () => event.target
      });
      event.stopPropagation();
    }));
    this._register(themeService.onDidColorThemeChange(() => {
      if (this.isVisible()) {
        this.find(true, true);
      }
    }));
    this._register(configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("workbench.colorCustomizations") && this.isVisible()) {
        this.find(true, true);
      }
    }));
    this._setupSearchEventListeners();
    this.updateResultCount();
  }
  _setupSearchEventListeners() {
    const xterm = this._instance.xterm;
    if (!xterm) {
      return;
    }
    this._register(xterm.onBeforeSearch(() => {
      this._overrideCopyOnSelectionDisposable.clear();
      this._overrideCopyOnSelectionDisposable.value = TerminalClipboardContribution.get(this._instance)?.overrideCopyOnSelection(false);
    }));
    this._register(xterm.onAfterSearch(() => {
      this._overrideCopyOnSelectionDisposable.clear();
    }));
  }
  find(previous, update) {
    const xterm = this._instance.xterm;
    if (!xterm) {
      return;
    }
    if (previous) {
      this._findPreviousWithEvent(xterm, this.inputValue, { regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue(), incremental: update });
    } else {
      this._findNextWithEvent(xterm, this.inputValue, { regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue() });
    }
  }
  reveal() {
    const initialInput = this._instance.hasSelection() && !this._instance.selection.includes("\n") ? this._instance.selection : void 0;
    const inputValue = initialInput ?? this.inputValue;
    const xterm = this._instance.xterm;
    if (xterm && inputValue && inputValue !== "") {
      this._findPreviousWithEvent(xterm, inputValue, { incremental: true, regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue() }).then((foundMatch) => {
        this.updateButtons(foundMatch);
        this._register(Event2.once(xterm.onDidChangeSelection)(() => xterm.clearActiveSearchDecoration()));
      });
    }
    this.updateButtons(false);
    super.reveal(inputValue);
    this._findWidgetVisible.set(true);
  }
  show() {
    const initialInput = this._instance.hasSelection() && !this._instance.selection.includes("\n") ? this._instance.selection : void 0;
    super.show(initialInput);
    this._findWidgetVisible.set(true);
  }
  hide() {
    super.hide();
    this._overrideCopyOnSelectionDisposable.clear();
    this._findWidgetVisible.reset();
    this._instance.focus(true);
    this._instance.xterm?.clearSearchDecorations();
  }
  async _getResultCount() {
    return this._instance.xterm?.findResult;
  }
  _onInputChanged() {
    const xterm = this._instance.xterm;
    if (xterm) {
      this._findPreviousWithEvent(xterm, this.inputValue, { regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue(), incremental: true }).then((foundMatch) => {
        this.updateButtons(foundMatch);
      });
    }
    return false;
  }
  _onFocusTrackerFocus() {
    this._overrideCopyOnSelectionDisposable.clear();
    this._overrideCopyOnSelectionDisposable.value = TerminalClipboardContribution.get(this._instance)?.overrideCopyOnSelection(false);
    this._findWidgetFocused.set(true);
  }
  _onFocusTrackerBlur() {
    this._overrideCopyOnSelectionDisposable.clear();
    this._instance.xterm?.clearActiveSearchDecoration();
    this._findWidgetFocused.reset();
  }
  _onFindInputFocusTrackerFocus() {
    this._findInputFocused.set(true);
  }
  _onFindInputFocusTrackerBlur() {
    this._findInputFocused.reset();
  }
  findFirst() {
    const instance2 = this._instance;
    if (instance2.hasSelection()) {
      instance2.clearSelection();
    }
    const xterm = instance2.xterm;
    if (xterm) {
      this._findPreviousWithEvent(xterm, this.inputValue, { regex: this._getRegexValue(), wholeWord: this._getWholeWordValue(), caseSensitive: this._getCaseSensitiveValue() });
    }
  }
  _registerSelectionChangeListener(xterm) {
    this._selectionDisposable.value = Event2.once(xterm.onDidChangeSelection)(() => xterm.clearActiveSearchDecoration());
  }
  async _findNextWithEvent(xterm, term, options3) {
    const foundMatch = await xterm.findNext(term, options3);
    this._registerSelectionChangeListener(xterm);
    return foundMatch;
  }
  async _findPreviousWithEvent(xterm, term, options3) {
    const foundMatch = await xterm.findPrevious(term, options3);
    this._registerSelectionChangeListener(xterm);
    return foundMatch;
  }
};

TerminalFindWidget = __decorateClass([
  __decorateParam(1, IClipboardService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IContextViewService),
  __decorateParam(6, IHoverService),
  __decorateParam(7, IKeybindingService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, ILogService),
  __decorateParam(10, IAccessibilityService)
], TerminalFindWidget);
export { TERMINAL_FIND_WIDGET_INITIAL_WIDTH, TerminalFindWidget };
