// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/find/notebookFindWidget.ts
import { Disposable } from "./module-0012.mjs";
import { Lazy } from "./module-0028.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { SimpleFindReplaceWidget } from "./module-2401.mjs";
import { FindWidgetSearchHistory } from "./module-0675.mjs";
import { ReplaceWidgetHistory } from "./module-0676.mjs";
import { FindReplaceState } from "./module-0674.mjs";
import { FindModel } from "./module-1920.mjs";
import { EventType, addDisposableListener, append, getWindow, isHTMLElement } from "./module-0075.mjs";
import { KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED } from "./module-1844.mjs";
import { CONTEXT_FIND_WIDGET_VISIBLE, MATCHES_LIMIT } from "./module-0595.mjs";
import { format2 } from "./module-0030.mjs";
import { NLS_MATCHES_LOCATION, NLS_NO_RESULTS } from "./module-0605.mjs";
import { alert } from "./module-0076.mjs";
import { localize } from "./module-0001.mjs";
import { IContextMenuService, IContextViewService } from "./module-0488.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/find/notebookFindWidget.ts
var FIND_HIDE_TRANSITION = "find-hide-transition";

var FIND_SHOW_TRANSITION = "find-show-transition";

var MAX_MATCHES_COUNT_WIDTH2 = 69;

var PROGRESS_BAR_DELAY = 200;

var NotebookFindContrib = class extends Disposable {
  constructor(notebookEditor, instantiationService) {
    super();
    this.notebookEditor = notebookEditor;
    this.instantiationService = instantiationService;
    this._widget = new Lazy(() => this._register(this.instantiationService.createInstance(NotebookFindWidget, this.notebookEditor)));
  }
  static {
    this.id = "workbench.notebook.find";
  }
  get widget() {
    return this._widget.value;
  }
  show(initialInput, options3) {
    return this._widget.value.show(initialInput, options3);
  }
  hide() {
    this._widget.rawValue?.hide();
  }
  replace(searchString) {
    return this._widget.value.replace(searchString);
  }
  isVisible() {
    return this._widget.rawValue?.isVisible ?? false;
  }
  findNext() {
    if (this._widget.rawValue) {
      this._widget.value.findNext();
    }
  }
  findPrevious() {
    if (this._widget.rawValue) {
      this._widget.value.findPrevious();
    }
  }
};

NotebookFindContrib = __decorateClass([
  __decorateParam(1, IInstantiationService)
], NotebookFindContrib);

var NotebookFindWidget = class extends SimpleFindReplaceWidget {
  constructor(_notebookEditor, contextViewService, contextKeyService, configurationService, contextMenuService, hoverService, instantiationService, storageService) {
    const findSearchHistory = FindWidgetSearchHistory.getOrCreate(storageService);
    const replaceHistory = ReplaceWidgetHistory.getOrCreate(storageService);
    super(contextViewService, contextKeyService, configurationService, contextMenuService, instantiationService, hoverService, new FindReplaceState(), _notebookEditor, findSearchHistory, replaceHistory);
    this._isFocused = false;
    this._showTimeout = null;
    this._hideTimeout = null;
    this._findModel = new FindModel(this._notebookEditor, this._state, this._configurationService);
    append(this._notebookEditor.getDomNode(), this.getDomNode());
    this._findWidgetFocused = KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED.bindTo(contextKeyService);
    this._findWidgetVisible = CONTEXT_FIND_WIDGET_VISIBLE.bindTo(contextKeyService);
    this._register(this._findInput.onKeyDown((e4) => this._onFindInputKeyDown(e4)));
    this._register(this._replaceInput.onKeyDown((e4) => this._onReplaceInputKeyDown(e4)));
    this._register(this._state.onFindReplaceStateChange((e4) => {
      this.onInputChanged();
      if (e4.isSearching) {
        if (this._state.isSearching) {
          this._progressBar.infinite().show(PROGRESS_BAR_DELAY);
        } else {
          this._progressBar.stop().hide();
        }
      }
      if (this._findModel.currentMatch >= 0) {
        const currentMatch = this._findModel.getCurrentMatch();
        this._replaceBtn.setEnabled(currentMatch.isModelMatch);
      }
      const matches2 = this._findModel.findMatches;
      this._replaceAllBtn.setEnabled(matches2.length > 0 && matches2.find((match2) => match2.webviewMatches.length > 0) === void 0);
      if (e4.filters) {
        this._findInput.updateFilterState(this._state.filters?.isModified() ?? false);
      }
    }));
    this._register(addDisposableListener(this.getDomNode(), EventType.FOCUS, (e4) => {
      this._previousFocusElement = isHTMLElement(e4.relatedTarget) ? e4.relatedTarget : void 0;
    }, true));
  }
  get findModel() {
    return this._findModel;
  }
  get isFocused() {
    return this._isFocused;
  }
  _onFindInputKeyDown(e4) {
    if (e4.equals(3 /* Enter */)) {
      this.find(false);
      e4.preventDefault();
      return;
    } else if (e4.equals(1024 /* Shift */ | 3 /* Enter */)) {
      this.find(true);
      e4.preventDefault();
      return;
    }
  }
  _onReplaceInputKeyDown(e4) {
    if (e4.equals(3 /* Enter */)) {
      this.replaceOne();
      e4.preventDefault();
      return;
    }
  }
  onInputChanged() {
    this._state.change({ searchString: this.inputValue }, false);
    const findMatches = this._findModel.findMatches;
    if (findMatches && findMatches.length) {
      return true;
    }
    return false;
  }
  findIndex(index2) {
    this._findModel.find({ index: index2 });
  }
  find(previous) {
    this._findModel.find({ previous });
  }
  findNext() {
    this.find(false);
  }
  findPrevious() {
    this.find(true);
  }
  replaceOne() {
    if (!this._notebookEditor.hasModel()) {
      return;
    }
    if (!this._findModel.findMatches.length) {
      return;
    }
    this._findModel.ensureFindMatches();
    if (this._findModel.currentMatch < 0) {
      this._findModel.find({ previous: false });
    }
    const currentMatch = this._findModel.getCurrentMatch();
    const cell = currentMatch.cell;
    if (currentMatch.isModelMatch) {
      const match2 = currentMatch.match;
      this._progressBar.infinite().show(PROGRESS_BAR_DELAY);
      const replacePattern = this.replacePattern;
      const replaceString = replacePattern.buildReplaceString(match2.matches, this._state.preserveCase);
      const viewModel = this._notebookEditor.getViewModel();
      viewModel.replaceOne(cell, match2.range, replaceString).then(() => {
        this._progressBar.stop();
      });
    } else {
      console.error("Replace does not work for output match");
    }
  }
  replaceAll() {
    if (!this._notebookEditor.hasModel()) {
      return;
    }
    this._progressBar.infinite().show(PROGRESS_BAR_DELAY);
    const replacePattern = this.replacePattern;
    const cellFindMatches = this._findModel.findMatches;
    const replaceStrings = [];
    cellFindMatches.forEach((cellFindMatch) => {
      cellFindMatch.contentMatches.forEach((match2) => {
        const matches2 = match2.matches;
        replaceStrings.push(replacePattern.buildReplaceString(matches2, this._state.preserveCase));
      });
    });
    const viewModel = this._notebookEditor.getViewModel();
    viewModel.replaceAll(this._findModel.findMatches, replaceStrings).then(() => {
      this._progressBar.stop();
    });
  }
  findFirst() {
  }
  onFocusTrackerFocus() {
    this._findWidgetFocused.set(true);
    this._isFocused = true;
  }
  onFocusTrackerBlur() {
    this._previousFocusElement = void 0;
    this._findWidgetFocused.reset();
    this._isFocused = false;
  }
  onReplaceInputFocusTrackerFocus() {
  }
  onReplaceInputFocusTrackerBlur() {
  }
  onFindInputFocusTrackerFocus() {
  }
  onFindInputFocusTrackerBlur() {
  }
  async show(initialInput, options3) {
    const searchStringUpdate = this._state.searchString !== initialInput;
    super.show(initialInput, options3);
    this._state.change({ searchString: initialInput ?? this._state.searchString, isRevealed: true }, false);
    this._findWidgetVisible.set(true);
    if (typeof options3?.matchIndex === "number") {
      if (!this._findModel.findMatches.length) {
        await this._findModel.research();
      }
      this.findIndex(options3.matchIndex);
    } else if (options3?.focus !== false) {
      this._findInput.select();
    }
    if (!searchStringUpdate && options3?.searchStringSeededFrom) {
      this._findModel.refreshCurrentMatch(options3.searchStringSeededFrom);
    }
    if (this._showTimeout === null) {
      if (this._hideTimeout !== null) {
        getWindow(this.getDomNode()).clearTimeout(this._hideTimeout);
        this._hideTimeout = null;
        this._notebookEditor.removeClassName(FIND_HIDE_TRANSITION);
      }
      this._notebookEditor.addClassName(FIND_SHOW_TRANSITION);
      this._showTimeout = getWindow(this.getDomNode()).setTimeout(() => {
        this._notebookEditor.removeClassName(FIND_SHOW_TRANSITION);
        this._showTimeout = null;
      }, 200);
    } else {
    }
  }
  replace(initialFindInput, initialReplaceInput) {
    super.showWithReplace(initialFindInput, initialReplaceInput);
    this._state.change({ searchString: initialFindInput ?? "", replaceString: initialReplaceInput ?? "", isRevealed: true }, false);
    this._replaceInput.select();
    if (this._showTimeout === null) {
      if (this._hideTimeout !== null) {
        getWindow(this.getDomNode()).clearTimeout(this._hideTimeout);
        this._hideTimeout = null;
        this._notebookEditor.removeClassName(FIND_HIDE_TRANSITION);
      }
      this._notebookEditor.addClassName(FIND_SHOW_TRANSITION);
      this._showTimeout = getWindow(this.getDomNode()).setTimeout(() => {
        this._notebookEditor.removeClassName(FIND_SHOW_TRANSITION);
        this._showTimeout = null;
      }, 200);
    } else {
    }
  }
  hide() {
    super.hide();
    this._state.change({ isRevealed: false }, false);
    this._findWidgetVisible.set(false);
    this._findModel.clear();
    this._notebookEditor.findStop();
    this._progressBar.stop();
    if (this._hideTimeout === null) {
      if (this._showTimeout !== null) {
        getWindow(this.getDomNode()).clearTimeout(this._showTimeout);
        this._showTimeout = null;
        this._notebookEditor.removeClassName(FIND_SHOW_TRANSITION);
      }
      this._notebookEditor.addClassName(FIND_HIDE_TRANSITION);
      this._hideTimeout = getWindow(this.getDomNode()).setTimeout(() => {
        this._notebookEditor.removeClassName(FIND_HIDE_TRANSITION);
      }, 200);
    } else {
    }
    if (this._previousFocusElement && this._previousFocusElement.offsetParent) {
      this._previousFocusElement.focus();
      this._previousFocusElement = void 0;
    }
    if (this._notebookEditor.hasModel()) {
      for (let i2 = 0; i2 < this._notebookEditor.getLength(); i2++) {
        const cell = this._notebookEditor.cellAt(i2);
        if (cell.getEditState() === 1 /* Editing */ && cell.editStateSource === "find") {
          cell.updateEditState(0 /* Preview */, "closeFind");
        }
      }
    }
  }
  _updateMatchesCount() {
    if (!this._findModel || !this._findModel.findMatches) {
      return;
    }
    this._matchesCount.style.minWidth = MAX_MATCHES_COUNT_WIDTH2 + "px";
    this._matchesCount.title = "";
    this._matchesCount.firstChild?.remove();
    let label3;
    if (this._state.matchesCount > 0) {
      let matchesCount = String(this._state.matchesCount);
      if (this._state.matchesCount >= MATCHES_LIMIT) {
        matchesCount += "+";
      }
      const matchesPosition = this._findModel.currentMatch < 0 ? "?" : String(this._findModel.currentMatch + 1);
      label3 = format2(NLS_MATCHES_LOCATION, matchesPosition, matchesCount);
    } else {
      label3 = NLS_NO_RESULTS;
    }
    this._matchesCount.appendChild(document.createTextNode(label3));
    alert(this._getAriaLabel(label3, this._state.currentMatch, this._state.searchString));
    MAX_MATCHES_COUNT_WIDTH2 = Math.max(MAX_MATCHES_COUNT_WIDTH2, this._matchesCount.clientWidth);
  }
  _getAriaLabel(label3, currentMatch, searchString) {
    if (label3 === NLS_NO_RESULTS) {
      return searchString === "" ? localize(17456, null, label3) : localize(17455, null, label3, searchString);
    }
    return localize(17457, null, label3, searchString);
  }
  dispose() {
    this._notebookEditor?.removeClassName(FIND_SHOW_TRANSITION);
    this._notebookEditor?.removeClassName(FIND_HIDE_TRANSITION);
    this._findModel.dispose();
    super.dispose();
  }
};

NotebookFindWidget = __decorateClass([
  __decorateParam(1, IContextViewService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IHoverService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IStorageService)
], NotebookFindWidget);
export { FIND_HIDE_TRANSITION, FIND_SHOW_TRANSITION, MAX_MATCHES_COUNT_WIDTH2, PROGRESS_BAR_DELAY, NotebookFindContrib, NotebookFindWidget };
