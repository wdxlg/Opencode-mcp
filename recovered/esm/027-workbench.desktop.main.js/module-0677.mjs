// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/find/browser/findController.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { CONTEXT_FIND_INPUT_FOCUSED, CONTEXT_FIND_WIDGET_VISIBLE, CONTEXT_REPLACE_INPUT_FOCUSED, FIND_IDS, FindModelBoundToEditorModel, ToggleCaseSensitiveKeybinding, TogglePreserveCaseKeybinding, ToggleRegexKeybinding, ToggleSearchScopeKeybinding, ToggleWholeWordKeybinding } from "./module-0595.mjs";
import { Delayer } from "./module-0036.mjs";
import { FindReplaceState } from "./module-0674.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { IHoverService } from "./module-0520.mjs";
import { FindWidgetSearchHistory } from "./module-0675.mjs";
import { ReplaceWidgetHistory } from "./module-0676.mjs";
import { FindWidget, NLS_NO_RESULTS } from "./module-0605.mjs";
import { FindOptionsWidget } from "./module-0673.mjs";
import { IContextViewService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { EditorAction, EditorCommand, MultiEditorAction, registerEditorAction, registerEditorCommand, registerEditorContribution, registerMultiEditorAction } from "./module-0097.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { MenuId } from "./module-0092.mjs";
import { alert } from "./module-0076.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { themeColorFromId2 } from "./module-0287.mjs";
import { overviewRulerRangeHighlight } from "./module-0288.mjs";


// src/vs/editor/contrib/find/browser/findController.ts
var SEARCH_STRING_MAX_LENGTH = 524288;

function getSelectionSearchString(editor, seedSearchStringFromSelection = "single", seedSearchStringFromNonEmptySelection = false) {
  if (!editor.hasModel()) {
    return null;
  }
  const selection = editor.getSelection();
  if (seedSearchStringFromSelection === "single" && selection.startLineNumber === selection.endLineNumber || seedSearchStringFromSelection === "multiple") {
    if (selection.isEmpty()) {
      const wordAtPosition = editor.getConfiguredWordAtPosition(selection.getStartPosition());
      if (wordAtPosition && false === seedSearchStringFromNonEmptySelection) {
        return wordAtPosition.word;
      }
    } else {
      if (editor.getModel().getValueLengthInRange(selection) < SEARCH_STRING_MAX_LENGTH) {
        return editor.getModel().getValueInRange(selection);
      }
    }
  }
  return null;
}

var CommonFindController = class extends Disposable {
  static {
    this.ID = "editor.contrib.findController";
  }
  get editor() {
    return this._editor;
  }
  static get(editor) {
    return editor.getContribution(CommonFindController.ID);
  }
  constructor(editor, contextKeyService, storageService, clipboardService, notificationService, hoverService) {
    super();
    this._editor = editor;
    this._findWidgetVisible = CONTEXT_FIND_WIDGET_VISIBLE.bindTo(contextKeyService);
    this._contextKeyService = contextKeyService;
    this._storageService = storageService;
    this._clipboardService = clipboardService;
    this._notificationService = notificationService;
    this._hoverService = hoverService;
    this._updateHistoryDelayer = this._register(new Delayer(500));
    this._state = this._register(new FindReplaceState());
    this.loadQueryState();
    this._register(this._state.onFindReplaceStateChange((e) => this._onStateChanged(e)));
    this._model = null;
    this._register(this._editor.onDidChangeModel(() => {
      const shouldRestartFind = this._editor.getModel() && this._state.isRevealed;
      this.disposeModel();
      this._state.change({
        searchScope: null,
        matchCase: this._storageService.getBoolean("editor.matchCase", 1 /* WORKSPACE */, false),
        wholeWord: this._storageService.getBoolean("editor.wholeWord", 1 /* WORKSPACE */, false),
        isRegex: this._storageService.getBoolean("editor.isRegex", 1 /* WORKSPACE */, false),
        preserveCase: this._storageService.getBoolean("editor.preserveCase", 1 /* WORKSPACE */, false)
      }, false);
      if (shouldRestartFind) {
        this._start({
          forceRevealReplace: false,
          seedSearchStringFromSelection: "none",
          seedSearchStringFromNonEmptySelection: false,
          seedSearchStringFromGlobalClipboard: false,
          shouldFocus: 0 /* NoFocusChange */,
          shouldAnimate: false,
          updateSearchScope: false,
          loop: this._editor.getOption(50 /* find */).loop
        });
      }
    }));
  }
  dispose() {
    this.disposeModel();
    super.dispose();
  }
  disposeModel() {
    if (this._model) {
      this._model.dispose();
      this._model = null;
    }
  }
  _onStateChanged(e) {
    this.saveQueryState(e);
    if (e.isRevealed) {
      if (this._state.isRevealed) {
        this._findWidgetVisible.set(true);
      } else {
        this._findWidgetVisible.reset();
        this.disposeModel();
      }
    }
    if (e.searchString) {
      this.setGlobalBufferTerm(this._state.searchString);
    }
  }
  saveQueryState(e) {
    if (e.isRegex) {
      this._storageService.store("editor.isRegex", this._state.actualIsRegex, 1 /* WORKSPACE */, 1 /* MACHINE */);
    }
    if (e.wholeWord) {
      this._storageService.store("editor.wholeWord", this._state.actualWholeWord, 1 /* WORKSPACE */, 1 /* MACHINE */);
    }
    if (e.matchCase) {
      this._storageService.store("editor.matchCase", this._state.actualMatchCase, 1 /* WORKSPACE */, 1 /* MACHINE */);
    }
    if (e.preserveCase) {
      this._storageService.store("editor.preserveCase", this._state.actualPreserveCase, 1 /* WORKSPACE */, 1 /* MACHINE */);
    }
  }
  loadQueryState() {
    this._state.change({
      matchCase: this._storageService.getBoolean("editor.matchCase", 1 /* WORKSPACE */, this._state.matchCase),
      wholeWord: this._storageService.getBoolean("editor.wholeWord", 1 /* WORKSPACE */, this._state.wholeWord),
      isRegex: this._storageService.getBoolean("editor.isRegex", 1 /* WORKSPACE */, this._state.isRegex),
      preserveCase: this._storageService.getBoolean("editor.preserveCase", 1 /* WORKSPACE */, this._state.preserveCase)
    }, false);
  }
  isFindInputFocused() {
    return !!CONTEXT_FIND_INPUT_FOCUSED.getValue(this._contextKeyService);
  }
  /**
   * Returns whether the Replace input was the last focused input in the find widget.
   * Returns false by default; overridden in FindController.
   */
  wasReplaceInputLastFocused() {
    return false;
  }
  /**
   * Focuses the last focused element in the find widget.
   * Implemented by FindController; base implementation does nothing.
   */
  focusLastElement() {
  }
  getState() {
    return this._state;
  }
  closeFindWidget() {
    this._state.change({
      isRevealed: false,
      searchScope: null
    }, false);
    this._editor.focus();
  }
  toggleCaseSensitive() {
    this._state.change({ matchCase: !this._state.matchCase }, false);
    if (!this._state.isRevealed) {
      this.highlightFindOptions();
    }
  }
  toggleWholeWords() {
    this._state.change({ wholeWord: !this._state.wholeWord }, false);
    if (!this._state.isRevealed) {
      this.highlightFindOptions();
    }
  }
  toggleRegex() {
    this._state.change({ isRegex: !this._state.isRegex }, false);
    if (!this._state.isRevealed) {
      this.highlightFindOptions();
    }
  }
  togglePreserveCase() {
    this._state.change({ preserveCase: !this._state.preserveCase }, false);
    if (!this._state.isRevealed) {
      this.highlightFindOptions();
    }
  }
  toggleSearchScope() {
    if (this._state.searchScope) {
      this._state.change({ searchScope: null }, true);
    } else {
      if (this._editor.hasModel()) {
        let selections = this._editor.getSelections();
        selections = selections.map((selection) => {
          if (selection.endColumn === 1 && selection.endLineNumber > selection.startLineNumber) {
            selection = selection.setEndPosition(
              selection.endLineNumber - 1,
              this._editor.getModel().getLineMaxColumn(selection.endLineNumber - 1)
            );
          }
          if (!selection.isEmpty()) {
            return selection;
          }
          return null;
        }).filter((element) => !!element);
        if (selections.length) {
          this._state.change({ searchScope: selections }, true);
        }
      }
    }
  }
  setSearchString(searchString) {
    if (this._state.isRegex) {
      searchString = escapeRegExpCharacters(searchString);
    }
    this._state.change({ searchString }, false);
  }
  highlightFindOptions(ignoreWhenVisible = false) {
  }
  async _start(opts, newState) {
    this.disposeModel();
    if (!this._editor.hasModel()) {
      return;
    }
    const stateChanges = {
      ...newState,
      isRevealed: true
    };
    if (opts.seedSearchStringFromSelection === "single") {
      const selectionSearchString = getSelectionSearchString(this._editor, opts.seedSearchStringFromSelection, opts.seedSearchStringFromNonEmptySelection);
      if (selectionSearchString) {
        if (this._state.isRegex) {
          stateChanges.searchString = escapeRegExpCharacters(selectionSearchString);
        } else {
          stateChanges.searchString = selectionSearchString;
        }
      }
    } else if (opts.seedSearchStringFromSelection === "multiple" && !opts.updateSearchScope) {
      const selectionSearchString = getSelectionSearchString(this._editor, opts.seedSearchStringFromSelection);
      if (selectionSearchString) {
        stateChanges.searchString = selectionSearchString;
      }
    }
    if (!stateChanges.searchString && opts.seedSearchStringFromGlobalClipboard) {
      const selectionSearchString = await this.getGlobalBufferTerm();
      if (!this._editor.hasModel()) {
        return;
      }
      if (selectionSearchString) {
        stateChanges.searchString = selectionSearchString;
      }
    }
    if (opts.forceRevealReplace || stateChanges.isReplaceRevealed) {
      stateChanges.isReplaceRevealed = true;
    } else if (!this._findWidgetVisible.get()) {
      stateChanges.isReplaceRevealed = false;
    }
    if (opts.updateSearchScope) {
      const currentSelections = this._editor.getSelections();
      if (currentSelections.some((selection) => !selection.isEmpty())) {
        stateChanges.searchScope = currentSelections;
      }
    }
    stateChanges.loop = opts.loop;
    this._state.change(stateChanges, false);
    if (!this._model) {
      this._model = new FindModelBoundToEditorModel(this._editor, this._state);
    }
  }
  start(opts, newState) {
    return this._start(opts, newState);
  }
  moveToNextMatch() {
    if (this._model) {
      this._model.moveToNextMatch();
      return true;
    }
    return false;
  }
  moveToPrevMatch() {
    if (this._model) {
      this._model.moveToPrevMatch();
      return true;
    }
    return false;
  }
  goToMatch(index2) {
    if (this._model) {
      this._model.moveToMatch(index2);
      return true;
    }
    return false;
  }
  replace() {
    if (this._model) {
      this._model.replace();
      return true;
    }
    return false;
  }
  replaceAll() {
    if (this._model) {
      if (this._editor.getModel()?.isTooLargeForHeapOperation()) {
        this._notificationService.warn(localize(1131, null));
        return false;
      }
      this._model.replaceAll();
      return true;
    }
    return false;
  }
  selectAllMatches() {
    if (this._model) {
      this._model.selectAllMatches();
      this._editor.focus();
      return true;
    }
    return false;
  }
  async getGlobalBufferTerm() {
    if (this._editor.getOption(50 /* find */).globalFindClipboard && this._editor.hasModel() && !this._editor.getModel().isTooLargeForSyncing()) {
      return this._clipboardService.readFindText();
    }
    return "";
  }
  setGlobalBufferTerm(text2) {
    if (this._editor.getOption(50 /* find */).globalFindClipboard && this._editor.hasModel() && !this._editor.getModel().isTooLargeForSyncing()) {
      this._clipboardService.writeFindText(text2);
    }
  }
};

CommonFindController = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IClipboardService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IHoverService)
], CommonFindController);

var FindController2 = class extends CommonFindController {
  constructor(editor, _contextViewService, _contextKeyService, _keybindingService, notificationService, _storageService, clipboardService, hoverService, _configurationService, _accessibilityService) {
    super(editor, _contextKeyService, _storageService, clipboardService, notificationService, hoverService);
    this._contextViewService = _contextViewService;
    this._keybindingService = _keybindingService;
    this._configurationService = _configurationService;
    this._accessibilityService = _accessibilityService;
    this._widget = null;
    this._findOptionsWidget = null;
    this._findWidgetSearchHistory = FindWidgetSearchHistory.getOrCreate(_storageService);
    this._replaceWidgetHistory = ReplaceWidgetHistory.getOrCreate(_storageService);
  }
  async _start(opts, newState) {
    if (!this._widget) {
      this._createFindWidget();
    }
    const selection = this._editor.getSelection();
    let updateSearchScope = false;
    switch (this._editor.getOption(50 /* find */).autoFindInSelection) {
      case "always":
        updateSearchScope = true;
        break;
      case "never":
        updateSearchScope = false;
        break;
      case "multiline": {
        const isSelectionMultipleLine = !!selection && selection.startLineNumber !== selection.endLineNumber;
        updateSearchScope = isSelectionMultipleLine;
        break;
      }
      default:
        break;
    }
    opts.updateSearchScope = opts.updateSearchScope || updateSearchScope;
    await super._start(opts, newState);
    if (this._widget) {
      if (opts.shouldFocus === 2 /* FocusReplaceInput */) {
        this._widget.focusReplaceInput();
      } else if (opts.shouldFocus === 1 /* FocusFindInput */) {
        this._widget.focusFindInput();
      }
    }
  }
  highlightFindOptions(ignoreWhenVisible = false) {
    if (!this._widget) {
      this._createFindWidget();
    }
    if (this._state.isRevealed && !ignoreWhenVisible) {
      this._widget.highlightFindOptions();
    } else {
      this._findOptionsWidget.highlightFindOptions();
    }
  }
  _createFindWidget() {
    this._widget = this._register(new FindWidget(this._editor, this, this._state, this._contextViewService, this._keybindingService, this._contextKeyService, this._hoverService, this._findWidgetSearchHistory, this._replaceWidgetHistory, this._configurationService, this._accessibilityService));
    this._findOptionsWidget = this._register(new FindOptionsWidget(this._editor, this._state, this._keybindingService));
  }
  /**
   * Returns whether the Replace input was the last focused input in the find widget.
   */
  wasReplaceInputLastFocused() {
    return this._widget?.lastFocusedInputWasReplace ?? false;
  }
  /**
   * Focuses the last focused element in the find widget.
   * This is more precise than just focusing the Find or Replace input,
   * as it can restore focus to checkboxes, buttons, etc.
   */
  focusLastElement() {
    this._widget?.focusLastElement();
  }
  saveViewState() {
    return this._widget?.getViewState();
  }
  restoreViewState(state) {
    this._widget?.setViewState(state);
  }
};

FindController2 = __decorateClass([
  __decorateParam(1, IContextViewService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IClipboardService),
  __decorateParam(7, IHoverService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IAccessibilityService)
], FindController2);

var StartFindAction = registerMultiEditorAction(new MultiEditorAction({
  id: FIND_IDS.StartFindAction,
  label: localize2(1127, "Find"),
  precondition: ContextKeyExpr.or(EditorContextKeys.focus, ContextKeyExpr.has("editorIsOpen")),
  kbOpts: {
    kbExpr: null,
    primary: 2048 /* CtrlCmd */ | 36 /* KeyF */,
    weight: 100 /* EditorContrib */
  },
  menuOpts: {
    menuId: MenuId.MenubarEditMenu,
    group: "3_find",
    title: localize(1123, null),
    order: 1
  }
}));

StartFindAction.addImplementation(0, (accessor, editor, args2) => {
  const controller = CommonFindController.get(editor);
  if (!controller) {
    return false;
  }
  return controller.start({
    forceRevealReplace: false,
    seedSearchStringFromSelection: editor.getOption(50 /* find */).seedSearchStringFromSelection !== "never" ? "single" : "none",
    seedSearchStringFromNonEmptySelection: editor.getOption(50 /* find */).seedSearchStringFromSelection === "selection",
    seedSearchStringFromGlobalClipboard: editor.getOption(50 /* find */).globalFindClipboard,
    shouldFocus: 1 /* FocusFindInput */,
    shouldAnimate: true,
    updateSearchScope: false,
    loop: editor.getOption(50 /* find */).loop
  });
});

var findArgDescription = {
  description: "Open a new In-Editor Find Widget.",
  args: [{
    name: "Open a new In-Editor Find Widget args",
    schema: {
      properties: {
        searchString: { type: "string" },
        replaceString: { type: "string" },
        isRegex: { type: "boolean" },
        matchWholeWord: { type: "boolean" },
        isCaseSensitive: { type: "boolean" },
        preserveCase: { type: "boolean" },
        findInSelection: { type: "boolean" }
      }
    }
  }]
};

var StartFindWithArgsAction = class extends EditorAction {
  constructor() {
    super({
      id: FIND_IDS.StartFindWithArgs,
      label: localize2(1128, "Find with Arguments"),
      precondition: void 0,
      kbOpts: {
        kbExpr: null,
        primary: 0,
        weight: 100 /* EditorContrib */
      },
      metadata: findArgDescription
    });
  }
  async run(accessor, editor, args2) {
    const controller = CommonFindController.get(editor);
    if (controller) {
      const newState = args2 ? {
        searchString: args2.searchString,
        replaceString: args2.replaceString,
        isReplaceRevealed: args2.replaceString !== void 0,
        isRegex: args2.isRegex,
        // isRegexOverride: args.regexOverride,
        wholeWord: args2.matchWholeWord,
        // wholeWordOverride: args.wholeWordOverride,
        matchCase: args2.isCaseSensitive,
        // matchCaseOverride: args.matchCaseOverride,
        preserveCase: args2.preserveCase
        // preserveCaseOverride: args.preserveCaseOverride,
      } : {};
      await controller.start({
        forceRevealReplace: false,
        seedSearchStringFromSelection: controller.getState().searchString.length === 0 && editor.getOption(50 /* find */).seedSearchStringFromSelection !== "never" ? "single" : "none",
        seedSearchStringFromNonEmptySelection: editor.getOption(50 /* find */).seedSearchStringFromSelection === "selection",
        seedSearchStringFromGlobalClipboard: true,
        shouldFocus: 1 /* FocusFindInput */,
        shouldAnimate: true,
        updateSearchScope: args2?.findInSelection || false,
        loop: editor.getOption(50 /* find */).loop
      }, newState);
      controller.setGlobalBufferTerm(controller.getState().searchString);
    }
  }
};

var StartFindWithSelectionAction = class extends EditorAction {
  constructor() {
    super({
      id: FIND_IDS.StartFindWithSelection,
      label: localize2(1129, "Find with Selection"),
      precondition: void 0,
      kbOpts: {
        kbExpr: null,
        primary: 0,
        mac: {
          primary: 2048 /* CtrlCmd */ | 35 /* KeyE */
        },
        weight: 100 /* EditorContrib */
      }
    });
  }
  async run(accessor, editor) {
    const controller = CommonFindController.get(editor);
    if (controller) {
      await controller.start({
        forceRevealReplace: false,
        seedSearchStringFromSelection: "multiple",
        seedSearchStringFromNonEmptySelection: false,
        seedSearchStringFromGlobalClipboard: false,
        shouldFocus: 0 /* NoFocusChange */,
        shouldAnimate: true,
        updateSearchScope: false,
        loop: editor.getOption(50 /* find */).loop
      });
      controller.setGlobalBufferTerm(controller.getState().searchString);
    }
  }
};

async function matchFindAction(editor, next) {
  const controller = CommonFindController.get(editor);
  if (!controller) {
    return;
  }
  const shouldCloseOnResult = editor.getOption(50 /* find */).closeOnResult;
  const wasFindWidgetVisible = controller.getState().isRevealed;
  const runMatch = () => {
    const previousSelection = controller.editor.getSelection();
    const result = next ? controller.moveToNextMatch() : controller.moveToPrevMatch();
    let landedOnMatch = false;
    if (result) {
      const currentSelection = controller.editor.getSelection();
      if (!previousSelection && currentSelection) {
        landedOnMatch = true;
      } else if (previousSelection && currentSelection && !previousSelection.equalsSelection(currentSelection)) {
        landedOnMatch = true;
      }
    }
    if (landedOnMatch) {
      controller.editor.pushUndoStop();
      if (shouldCloseOnResult && wasFindWidgetVisible && controller.isFindInputFocused()) {
        controller.closeFindWidget();
      }
      return true;
    }
    return false;
  };
  if (!runMatch()) {
    await controller.start({
      forceRevealReplace: false,
      seedSearchStringFromSelection: controller.getState().searchString.length === 0 && editor.getOption(50 /* find */).seedSearchStringFromSelection !== "never" ? "single" : "none",
      seedSearchStringFromNonEmptySelection: editor.getOption(50 /* find */).seedSearchStringFromSelection === "selection",
      seedSearchStringFromGlobalClipboard: true,
      shouldFocus: 0 /* NoFocusChange */,
      shouldAnimate: true,
      updateSearchScope: false,
      loop: editor.getOption(50 /* find */).loop
    });
    if (!runMatch()) {
      const state = controller.getState();
      if (wasFindWidgetVisible && state.matchesCount === 0 && state.searchString) {
        alert(localize(1116, null, NLS_NO_RESULTS, state.searchString));
      }
    }
  }
}

var NextMatchFindAction = registerMultiEditorAction(new MultiEditorAction({
  id: FIND_IDS.NextMatchFindAction,
  label: localize2(1121, "Find Next"),
  precondition: void 0,
  kbOpts: [{
    kbExpr: EditorContextKeys.focus,
    primary: 61 /* F3 */,
    mac: { primary: 2048 /* CtrlCmd */ | 37 /* KeyG */, secondary: [61 /* F3 */] },
    weight: 100 /* EditorContrib */
  }, {
    kbExpr: ContextKeyExpr.and(EditorContextKeys.focus, CONTEXT_FIND_INPUT_FOCUSED),
    primary: 3 /* Enter */,
    weight: 100 /* EditorContrib */
  }]
}));

NextMatchFindAction.addImplementation(0, async (accessor, editor, args2) => {
  return matchFindAction(editor, true);
});

var PreviousMatchFindAction = registerMultiEditorAction(new MultiEditorAction({
  id: FIND_IDS.PreviousMatchFindAction,
  label: localize2(1122, "Find Previous"),
  precondition: void 0,
  kbOpts: [{
    kbExpr: EditorContextKeys.focus,
    primary: 1024 /* Shift */ | 61 /* F3 */,
    mac: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 37 /* KeyG */, secondary: [1024 /* Shift */ | 61 /* F3 */] },
    weight: 100 /* EditorContrib */
  }, {
    kbExpr: ContextKeyExpr.and(EditorContextKeys.focus, CONTEXT_FIND_INPUT_FOCUSED),
    primary: 1024 /* Shift */ | 3 /* Enter */,
    weight: 100 /* EditorContrib */
  }]
}));

PreviousMatchFindAction.addImplementation(0, async (accessor, editor, args2) => {
  return matchFindAction(editor, false);
});

var MoveToMatchFindAction = class extends EditorAction {
  constructor() {
    super({
      id: FIND_IDS.GoToMatchFindAction,
      label: localize2(1117, "Go to Match..."),
      precondition: CONTEXT_FIND_WIDGET_VISIBLE
    });
    this._highlightDecorations = [];
  }
  run(accessor, editor) {
    const controller = CommonFindController.get(editor);
    if (!controller) {
      return;
    }
    const matchesCount = controller.getState().matchesCount;
    if (matchesCount < 1) {
      const notificationService = accessor.get(INotificationService);
      notificationService.notify({
        severity: Severity2.Warning,
        message: localize(1120, null)
      });
      return;
    }
    const quickInputService = accessor.get(IQuickInputService);
    const disposables = new DisposableStore();
    const inputBox = disposables.add(quickInputService.createInputBox());
    inputBox.placeholder = localize(1118, null, matchesCount);
    const toFindMatchIndex = (value2) => {
      const index2 = parseInt(value2);
      if (isNaN(index2)) {
        return void 0;
      }
      const matchCount = controller.getState().matchesCount;
      if (index2 > 0 && index2 <= matchCount) {
        return index2 - 1;
      } else if (index2 < 0 && index2 >= -matchCount) {
        return matchCount + index2;
      }
      return void 0;
    };
    const updatePickerAndEditor = (value2) => {
      const index2 = toFindMatchIndex(value2);
      if (typeof index2 === "number") {
        inputBox.validationMessage = void 0;
        controller.goToMatch(index2);
        const currentMatch = controller.getState().currentMatch;
        if (currentMatch) {
          this.addDecorations(editor, currentMatch);
        }
      } else {
        inputBox.validationMessage = localize(1119, null, controller.getState().matchesCount);
        this.clearDecorations(editor);
      }
    };
    disposables.add(inputBox.onDidChangeValue((value2) => {
      updatePickerAndEditor(value2);
    }));
    disposables.add(inputBox.onDidAccept(() => {
      const index2 = toFindMatchIndex(inputBox.value);
      if (typeof index2 === "number") {
        controller.goToMatch(index2);
        inputBox.hide();
      } else {
        inputBox.validationMessage = localize(1119, null, controller.getState().matchesCount);
      }
    }));
    disposables.add(inputBox.onDidHide(() => {
      this.clearDecorations(editor);
      disposables.dispose();
    }));
    inputBox.show();
  }
  clearDecorations(editor) {
    editor.changeDecorations((changeAccessor) => {
      this._highlightDecorations = changeAccessor.deltaDecorations(this._highlightDecorations, []);
    });
  }
  addDecorations(editor, range2) {
    editor.changeDecorations((changeAccessor) => {
      this._highlightDecorations = changeAccessor.deltaDecorations(this._highlightDecorations, [
        {
          range: range2,
          options: {
            description: "find-match-quick-access-range-highlight",
            className: "rangeHighlight",
            isWholeLine: true
          }
        },
        {
          range: range2,
          options: {
            description: "find-match-quick-access-range-highlight-overview",
            overviewRuler: {
              color: themeColorFromId2(overviewRulerRangeHighlight),
              position: 7 /* Full */
            }
          }
        }
      ]);
    });
  }
};

var SelectionMatchFindAction = class extends EditorAction {
  async run(accessor, editor) {
    const controller = CommonFindController.get(editor);
    if (!controller) {
      return;
    }
    const selectionSearchString = getSelectionSearchString(editor, "single", false);
    if (selectionSearchString) {
      controller.setSearchString(selectionSearchString);
    }
    if (!this._run(controller)) {
      await controller.start({
        forceRevealReplace: false,
        seedSearchStringFromSelection: "none",
        seedSearchStringFromNonEmptySelection: false,
        seedSearchStringFromGlobalClipboard: false,
        shouldFocus: 0 /* NoFocusChange */,
        shouldAnimate: true,
        updateSearchScope: false,
        loop: editor.getOption(50 /* find */).loop
      });
      this._run(controller);
    }
  }
};

var NextSelectionMatchFindAction = class extends SelectionMatchFindAction {
  constructor() {
    super({
      id: FIND_IDS.NextSelectionMatchFindAction,
      label: localize2(1125, "Find Next Selection"),
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.focus,
        primary: 2048 /* CtrlCmd */ | 61 /* F3 */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  _run(controller) {
    return controller.moveToNextMatch();
  }
};

var PreviousSelectionMatchFindAction = class extends SelectionMatchFindAction {
  constructor() {
    super({
      id: FIND_IDS.PreviousSelectionMatchFindAction,
      label: localize2(1126, "Find Previous Selection"),
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.focus,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 61 /* F3 */,
        weight: 100 /* EditorContrib */
      }
    });
  }
  _run(controller) {
    return controller.moveToPrevMatch();
  }
};

var StartFindReplaceAction = registerMultiEditorAction(new MultiEditorAction({
  id: FIND_IDS.StartFindReplaceAction,
  label: localize2(1130, "Replace"),
  precondition: ContextKeyExpr.or(EditorContextKeys.focus, ContextKeyExpr.has("editorIsOpen")),
  kbOpts: {
    kbExpr: null,
    primary: 2048 /* CtrlCmd */ | 38 /* KeyH */,
    mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 36 /* KeyF */ },
    weight: 100 /* EditorContrib */
  },
  menuOpts: {
    menuId: MenuId.MenubarEditMenu,
    group: "3_find",
    title: localize(1124, null),
    order: 2
  }
}));

StartFindReplaceAction.addImplementation(0, (accessor, editor, args2) => {
  if (!editor.hasModel() || editor.getOption(104 /* readOnly */)) {
    return false;
  }
  const controller = CommonFindController.get(editor);
  if (!controller) {
    return false;
  }
  const currentSelection = editor.getSelection();
  const findInputFocused = controller.isFindInputFocused();
  const seedSearchStringFromSelection = !currentSelection.isEmpty() && currentSelection.startLineNumber === currentSelection.endLineNumber && editor.getOption(50 /* find */).seedSearchStringFromSelection !== "never" && !findInputFocused;
  const shouldFocus = findInputFocused || seedSearchStringFromSelection ? 2 /* FocusReplaceInput */ : 1 /* FocusFindInput */;
  return controller.start({
    forceRevealReplace: true,
    seedSearchStringFromSelection: seedSearchStringFromSelection ? "single" : "none",
    seedSearchStringFromNonEmptySelection: editor.getOption(50 /* find */).seedSearchStringFromSelection === "selection",
    seedSearchStringFromGlobalClipboard: editor.getOption(50 /* find */).seedSearchStringFromSelection !== "never",
    shouldFocus,
    shouldAnimate: true,
    updateSearchScope: false,
    loop: editor.getOption(50 /* find */).loop
  });
});

registerEditorContribution(CommonFindController.ID, FindController2, 0 /* Eager */);

registerEditorAction(StartFindWithArgsAction);

registerEditorAction(StartFindWithSelectionAction);

registerEditorAction(MoveToMatchFindAction);

registerEditorAction(NextSelectionMatchFindAction);

registerEditorAction(PreviousSelectionMatchFindAction);

var FindCommand = EditorCommand.bindToContribution(CommonFindController.get);

registerEditorCommand(new FindCommand({
  id: FIND_IDS.CloseFindWidgetCommand,
  precondition: CONTEXT_FIND_WIDGET_VISIBLE,
  handler: (x) => x.closeFindWidget(),
  kbOpts: {
    weight: 100 /* EditorContrib */ + 5,
    kbExpr: EditorContextKeys.focus,
    primary: 9 /* Escape */,
    secondary: [1024 /* Shift */ | 9 /* Escape */]
  }
}));

registerEditorCommand(new FindCommand({
  id: FIND_IDS.ToggleCaseSensitiveCommand,
  precondition: void 0,
  handler: (x) => x.toggleCaseSensitive(),
  kbOpts: {
    weight: 100 /* EditorContrib */ + 5,
    kbExpr: EditorContextKeys.focus,
    primary: ToggleCaseSensitiveKeybinding.primary,
    mac: ToggleCaseSensitiveKeybinding.mac,
    win: ToggleCaseSensitiveKeybinding.win,
    linux: ToggleCaseSensitiveKeybinding.linux
  }
}));

registerEditorCommand(new FindCommand({
  id: FIND_IDS.ToggleWholeWordCommand,
  precondition: void 0,
  handler: (x) => x.toggleWholeWords(),
  kbOpts: {
    weight: 100 /* EditorContrib */ + 5,
    kbExpr: EditorContextKeys.focus,
    primary: ToggleWholeWordKeybinding.primary,
    mac: ToggleWholeWordKeybinding.mac,
    win: ToggleWholeWordKeybinding.win,
    linux: ToggleWholeWordKeybinding.linux
  }
}));

registerEditorCommand(new FindCommand({
  id: FIND_IDS.ToggleRegexCommand,
  precondition: void 0,
  handler: (x) => x.toggleRegex(),
  kbOpts: {
    weight: 100 /* EditorContrib */ + 5,
    kbExpr: EditorContextKeys.focus,
    primary: ToggleRegexKeybinding.primary,
    mac: ToggleRegexKeybinding.mac,
    win: ToggleRegexKeybinding.win,
    linux: ToggleRegexKeybinding.linux
  }
}));

registerEditorCommand(new FindCommand({
  id: FIND_IDS.ToggleSearchScopeCommand,
  precondition: void 0,
  handler: (x) => x.toggleSearchScope(),
  kbOpts: {
    weight: 100 /* EditorContrib */ + 5,
    kbExpr: EditorContextKeys.focus,
    primary: ToggleSearchScopeKeybinding.primary,
    mac: ToggleSearchScopeKeybinding.mac,
    win: ToggleSearchScopeKeybinding.win,
    linux: ToggleSearchScopeKeybinding.linux
  }
}));

registerEditorCommand(new FindCommand({
  id: FIND_IDS.TogglePreserveCaseCommand,
  precondition: void 0,
  handler: (x) => x.togglePreserveCase(),
  kbOpts: {
    weight: 100 /* EditorContrib */ + 5,
    kbExpr: EditorContextKeys.focus,
    primary: TogglePreserveCaseKeybinding.primary,
    mac: TogglePreserveCaseKeybinding.mac,
    win: TogglePreserveCaseKeybinding.win,
    linux: TogglePreserveCaseKeybinding.linux
  }
}));

registerEditorCommand(new FindCommand({
  id: FIND_IDS.ReplaceOneAction,
  precondition: CONTEXT_FIND_WIDGET_VISIBLE,
  handler: (x) => x.replace(),
  kbOpts: {
    weight: 100 /* EditorContrib */ + 5,
    kbExpr: EditorContextKeys.focus,
    primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 22 /* Digit1 */
  }
}));

registerEditorCommand(new FindCommand({
  id: FIND_IDS.ReplaceOneAction,
  precondition: CONTEXT_FIND_WIDGET_VISIBLE,
  handler: (x) => x.replace(),
  kbOpts: {
    weight: 100 /* EditorContrib */ + 5,
    kbExpr: ContextKeyExpr.and(EditorContextKeys.focus, CONTEXT_REPLACE_INPUT_FOCUSED),
    primary: 3 /* Enter */
  }
}));

registerEditorCommand(new FindCommand({
  id: FIND_IDS.ReplaceAllAction,
  precondition: CONTEXT_FIND_WIDGET_VISIBLE,
  handler: (x) => x.replaceAll(),
  kbOpts: {
    weight: 100 /* EditorContrib */ + 5,
    kbExpr: EditorContextKeys.focus,
    primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 3 /* Enter */
  }
}));

registerEditorCommand(new FindCommand({
  id: FIND_IDS.ReplaceAllAction,
  precondition: CONTEXT_FIND_WIDGET_VISIBLE,
  handler: (x) => x.replaceAll(),
  kbOpts: {
    weight: 100 /* EditorContrib */ + 5,
    kbExpr: ContextKeyExpr.and(EditorContextKeys.focus, CONTEXT_REPLACE_INPUT_FOCUSED),
    primary: void 0,
    mac: {
      primary: 2048 /* CtrlCmd */ | 3 /* Enter */
    }
  }
}));

registerEditorCommand(new FindCommand({
  id: FIND_IDS.SelectAllMatchesAction,
  precondition: CONTEXT_FIND_WIDGET_VISIBLE,
  handler: (x) => x.selectAllMatches(),
  kbOpts: {
    weight: 100 /* EditorContrib */ + 5,
    kbExpr: EditorContextKeys.focus,
    primary: 512 /* Alt */ | 3 /* Enter */
  }
}));
export { getSelectionSearchString, matchFindAction, SEARCH_STRING_MAX_LENGTH, CommonFindController, FindController2, StartFindAction, findArgDescription, StartFindWithArgsAction, StartFindWithSelectionAction, NextMatchFindAction, PreviousMatchFindAction, MoveToMatchFindAction, SelectionMatchFindAction, NextSelectionMatchFindAction, PreviousSelectionMatchFindAction, StartFindReplaceAction, FindCommand };
