// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/multicursor/browser/multicursor.ts
import { localize, localize2 } from "./module-0001.mjs";
import { status } from "./module-0076.mjs";
import { EditorAction, registerEditorAction, registerEditorContribution } from "./module-0097.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { MenuId } from "./module-0092.mjs";
import { CursorMoveCommands } from "./module-0124.mjs";
import { Selection } from "./module-0107.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { CommonFindController } from "./module-0677.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { KeyChord } from "./module-0019.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { Range2 } from "./module-0106.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { getSelectionHighlightDecorationOptions } from "./module-0826.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";


// src/vs/editor/contrib/multicursor/browser/multicursor.ts
function announceCursorChange(previousCursorState, cursorState) {
  const cursorDiff = cursorState.filter((cs) => !previousCursorState.find((pcs) => pcs.equals(cs)));
  if (cursorDiff.length >= 1) {
    const cursorPositions = cursorDiff.map((cs) => `line ${cs.viewState.position.lineNumber} column ${cs.viewState.position.column}`).join(", ");
    const msg = cursorDiff.length === 1 ? localize(1476, null, cursorPositions) : localize(1477, null, cursorPositions);
    status(msg);
  }
}

var InsertCursorAbove = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.insertCursorAbove",
      label: localize2(1492, "Add Cursor Above"),
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 16 /* UpArrow */,
        linux: {
          primary: 1024 /* Shift */ | 512 /* Alt */ | 16 /* UpArrow */,
          secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 16 /* UpArrow */]
        },
        weight: 100 /* EditorContrib */
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "3_multi",
        title: localize(1480, null),
        order: 2
      }
    });
  }
  run(accessor, editor, args2) {
    if (!editor.hasModel()) {
      return;
    }
    let useLogicalLine = true;
    if (args2 && args2.logicalLine === false) {
      useLogicalLine = false;
    }
    const viewModel = editor._getViewModel();
    if (viewModel.cursorConfig.readOnly) {
      return;
    }
    viewModel.model.pushStackElement();
    const previousCursorState = viewModel.getCursorStates();
    viewModel.setCursorStates(
      args2.source,
      3 /* Explicit */,
      CursorMoveCommands.addCursorUp(viewModel, previousCursorState, useLogicalLine)
    );
    viewModel.revealTopMostCursor(args2.source);
    announceCursorChange(previousCursorState, viewModel.getCursorStates());
  }
};

var InsertCursorBelow = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.insertCursorBelow",
      label: localize2(1494, "Add Cursor Below"),
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 18 /* DownArrow */,
        linux: {
          primary: 1024 /* Shift */ | 512 /* Alt */ | 18 /* DownArrow */,
          secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 18 /* DownArrow */]
        },
        weight: 100 /* EditorContrib */
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "3_multi",
        title: localize(1482, null),
        order: 3
      }
    });
  }
  run(accessor, editor, args2) {
    if (!editor.hasModel()) {
      return;
    }
    let useLogicalLine = true;
    if (args2 && args2.logicalLine === false) {
      useLogicalLine = false;
    }
    const viewModel = editor._getViewModel();
    if (viewModel.cursorConfig.readOnly) {
      return;
    }
    viewModel.model.pushStackElement();
    const previousCursorState = viewModel.getCursorStates();
    viewModel.setCursorStates(
      args2.source,
      3 /* Explicit */,
      CursorMoveCommands.addCursorDown(viewModel, previousCursorState, useLogicalLine)
    );
    viewModel.revealBottomMostCursor(args2.source);
    announceCursorChange(previousCursorState, viewModel.getCursorStates());
  }
};

var InsertCursorAtEndOfEachLineSelected = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.insertCursorAtEndOfEachLineSelected",
      label: localize2(1493, "Add Cursors to Line Ends"),
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 1024 /* Shift */ | 512 /* Alt */ | 39 /* KeyI */,
        weight: 100 /* EditorContrib */
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "3_multi",
        title: localize(1481, null),
        order: 4
      }
    });
  }
  getCursorsForSelection(selection, model, result) {
    if (selection.isEmpty()) {
      return;
    }
    for (let i2 = selection.startLineNumber; i2 < selection.endLineNumber; i2++) {
      const currentLineMaxColumn = model.getLineMaxColumn(i2);
      result.push(new Selection(i2, currentLineMaxColumn, i2, currentLineMaxColumn));
    }
    if (selection.endColumn > 1) {
      result.push(new Selection(selection.endLineNumber, selection.endColumn, selection.endLineNumber, selection.endColumn));
    }
  }
  run(accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const model = editor.getModel();
    const selections = editor.getSelections();
    const viewModel = editor._getViewModel();
    const previousCursorState = viewModel.getCursorStates();
    const newSelections = [];
    selections.forEach((sel) => this.getCursorsForSelection(sel, model, newSelections));
    if (newSelections.length > 0) {
      editor.setSelections(newSelections);
    }
    announceCursorChange(previousCursorState, viewModel.getCursorStates());
  }
};

var InsertCursorAtEndOfLineSelected = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.addCursorsToBottom",
      label: localize2(1486, "Add Cursors to Bottom"),
      precondition: void 0
    });
  }
  run(accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const selections = editor.getSelections();
    const lineCount = editor.getModel().getLineCount();
    const newSelections = [];
    for (let i2 = selections[0].startLineNumber; i2 <= lineCount; i2++) {
      newSelections.push(new Selection(i2, selections[0].startColumn, i2, selections[0].endColumn));
    }
    const viewModel = editor._getViewModel();
    const previousCursorState = viewModel.getCursorStates();
    if (newSelections.length > 0) {
      editor.setSelections(newSelections);
    }
    announceCursorChange(previousCursorState, viewModel.getCursorStates());
  }
};

var InsertCursorAtTopOfLineSelected = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.addCursorsToTop",
      label: localize2(1487, "Add Cursors to Top"),
      precondition: void 0
    });
  }
  run(accessor, editor) {
    if (!editor.hasModel()) {
      return;
    }
    const selections = editor.getSelections();
    const newSelections = [];
    for (let i2 = selections[0].startLineNumber; i2 >= 1; i2--) {
      newSelections.push(new Selection(i2, selections[0].startColumn, i2, selections[0].endColumn));
    }
    const viewModel = editor._getViewModel();
    const previousCursorState = viewModel.getCursorStates();
    if (newSelections.length > 0) {
      editor.setSelections(newSelections);
    }
    announceCursorChange(previousCursorState, viewModel.getCursorStates());
  }
};

var MultiCursorSessionResult = class {
  constructor(selections, revealRange, revealScrollType) {
    this.selections = selections;
    this.revealRange = revealRange;
    this.revealScrollType = revealScrollType;
  }
};

var MultiCursorSession = class _MultiCursorSession {
  constructor(_editor, findController, isDisconnectedFromFindController, searchText, wholeWord, matchCase, currentMatch) {
    this._editor = _editor;
    this.findController = findController;
    this.isDisconnectedFromFindController = isDisconnectedFromFindController;
    this.searchText = searchText;
    this.wholeWord = wholeWord;
    this.matchCase = matchCase;
    this.currentMatch = currentMatch;
  }
  static create(editor, findController) {
    if (!editor.hasModel()) {
      return null;
    }
    const findState = findController.getState();
    if (!editor.hasTextFocus() && findState.isRevealed && findState.searchString.length > 0) {
      return new _MultiCursorSession(editor, findController, false, findState.searchString, findState.wholeWord, findState.matchCase, null);
    }
    let isDisconnectedFromFindController = false;
    let wholeWord;
    let matchCase;
    const selections = editor.getSelections();
    if (selections.length === 1 && selections[0].isEmpty()) {
      isDisconnectedFromFindController = true;
      wholeWord = true;
      matchCase = true;
    } else {
      wholeWord = findState.wholeWord;
      matchCase = findState.matchCase;
    }
    const s = editor.getSelection();
    let searchText;
    let currentMatch = null;
    if (s.isEmpty()) {
      const word = editor.getConfiguredWordAtPosition(s.getStartPosition());
      if (!word) {
        return null;
      }
      searchText = word.word;
      currentMatch = new Selection(s.startLineNumber, word.startColumn, s.startLineNumber, word.endColumn);
    } else {
      searchText = editor.getModel().getValueInRange(s).replace(/\r\n/g, "\n");
    }
    return new _MultiCursorSession(editor, findController, isDisconnectedFromFindController, searchText, wholeWord, matchCase, currentMatch);
  }
  addSelectionToNextFindMatch() {
    if (!this._editor.hasModel()) {
      return null;
    }
    const nextMatch = this._getNextMatch();
    if (!nextMatch) {
      return null;
    }
    const allSelections = this._editor.getSelections();
    return new MultiCursorSessionResult(allSelections.concat(nextMatch), nextMatch, 0 /* Smooth */);
  }
  moveSelectionToNextFindMatch() {
    if (!this._editor.hasModel()) {
      return null;
    }
    const nextMatch = this._getNextMatch();
    if (!nextMatch) {
      return null;
    }
    const allSelections = this._editor.getSelections();
    return new MultiCursorSessionResult(allSelections.slice(0, allSelections.length - 1).concat(nextMatch), nextMatch, 0 /* Smooth */);
  }
  _getNextMatch() {
    if (!this._editor.hasModel()) {
      return null;
    }
    if (this.currentMatch) {
      const result = this.currentMatch;
      this.currentMatch = null;
      return result;
    }
    this.findController.highlightFindOptions();
    const allSelections = this._editor.getSelections();
    const lastAddedSelection = allSelections[allSelections.length - 1];
    const nextMatch = this._editor.getModel().findNextMatch(this.searchText, lastAddedSelection.getEndPosition(), false, this.matchCase, this.wholeWord ? this._editor.getOption(148 /* wordSeparators */) : null, false);
    if (!nextMatch) {
      return null;
    }
    return new Selection(nextMatch.range.startLineNumber, nextMatch.range.startColumn, nextMatch.range.endLineNumber, nextMatch.range.endColumn);
  }
  addSelectionToPreviousFindMatch() {
    if (!this._editor.hasModel()) {
      return null;
    }
    const previousMatch = this._getPreviousMatch();
    if (!previousMatch) {
      return null;
    }
    const allSelections = this._editor.getSelections();
    return new MultiCursorSessionResult(allSelections.concat(previousMatch), previousMatch, 0 /* Smooth */);
  }
  moveSelectionToPreviousFindMatch() {
    if (!this._editor.hasModel()) {
      return null;
    }
    const previousMatch = this._getPreviousMatch();
    if (!previousMatch) {
      return null;
    }
    const allSelections = this._editor.getSelections();
    return new MultiCursorSessionResult(allSelections.slice(0, allSelections.length - 1).concat(previousMatch), previousMatch, 0 /* Smooth */);
  }
  _getPreviousMatch() {
    if (!this._editor.hasModel()) {
      return null;
    }
    if (this.currentMatch) {
      const result = this.currentMatch;
      this.currentMatch = null;
      return result;
    }
    this.findController.highlightFindOptions();
    const allSelections = this._editor.getSelections();
    const lastAddedSelection = allSelections[allSelections.length - 1];
    const previousMatch = this._editor.getModel().findPreviousMatch(this.searchText, lastAddedSelection.getStartPosition(), false, this.matchCase, this.wholeWord ? this._editor.getOption(148 /* wordSeparators */) : null, false);
    if (!previousMatch) {
      return null;
    }
    return new Selection(previousMatch.range.startLineNumber, previousMatch.range.startColumn, previousMatch.range.endLineNumber, previousMatch.range.endColumn);
  }
  selectAll(searchScope) {
    if (!this._editor.hasModel()) {
      return [];
    }
    this.findController.highlightFindOptions();
    const editorModel = this._editor.getModel();
    if (searchScope) {
      return editorModel.findMatches(this.searchText, searchScope, false, this.matchCase, this.wholeWord ? this._editor.getOption(148 /* wordSeparators */) : null, false, 1073741824 /* MAX_SAFE_SMALL_INTEGER */);
    }
    return editorModel.findMatches(this.searchText, true, false, this.matchCase, this.wholeWord ? this._editor.getOption(148 /* wordSeparators */) : null, false, 1073741824 /* MAX_SAFE_SMALL_INTEGER */);
  }
};

var MultiCursorSelectionController = class _MultiCursorSelectionController extends Disposable {
  constructor(editor) {
    super();
    this._sessionDispose = this._register(new DisposableStore());
    this._editor = editor;
    this._ignoreSelectionChange = false;
    this._session = null;
  }
  static {
    this.ID = "editor.contrib.multiCursorController";
  }
  static get(editor) {
    return editor.getContribution(_MultiCursorSelectionController.ID);
  }
  dispose() {
    this._endSession();
    super.dispose();
  }
  _beginSessionIfNeeded(findController) {
    if (!this._session) {
      const session = MultiCursorSession.create(this._editor, findController);
      if (!session) {
        return;
      }
      this._session = session;
      const newState = { searchString: this._session.searchText };
      if (this._session.isDisconnectedFromFindController) {
        newState.wholeWordOverride = 1 /* True */;
        newState.matchCaseOverride = 1 /* True */;
        newState.isRegexOverride = 2 /* False */;
      }
      findController.getState().change(newState, false);
      this._sessionDispose.add(this._editor.onDidChangeCursorSelection((e4) => {
        if (this._ignoreSelectionChange) {
          return;
        }
        this._endSession();
      }));
      this._sessionDispose.add(this._editor.onDidBlurEditorText(() => {
        this._endSession();
      }));
      this._sessionDispose.add(findController.getState().onFindReplaceStateChange((e4) => {
        if (e4.matchCase || e4.wholeWord) {
          this._endSession();
        }
      }));
    }
  }
  _endSession() {
    this._sessionDispose.clear();
    if (this._session && this._session.isDisconnectedFromFindController) {
      const newState = {
        wholeWordOverride: 0 /* NotSet */,
        matchCaseOverride: 0 /* NotSet */,
        isRegexOverride: 0 /* NotSet */
      };
      this._session.findController.getState().change(newState, false);
    }
    this._session = null;
  }
  _setSelections(selections) {
    this._ignoreSelectionChange = true;
    this._editor.setSelections(selections);
    this._ignoreSelectionChange = false;
  }
  _expandEmptyToWord(model, selection) {
    if (!selection.isEmpty()) {
      return selection;
    }
    const word = this._editor.getConfiguredWordAtPosition(selection.getStartPosition());
    if (!word) {
      return selection;
    }
    return new Selection(selection.startLineNumber, word.startColumn, selection.startLineNumber, word.endColumn);
  }
  _applySessionResult(result) {
    if (!result) {
      return;
    }
    this._setSelections(result.selections);
    if (result.revealRange) {
      this._editor.revealRangeInCenterIfOutsideViewport(result.revealRange, result.revealScrollType);
    }
  }
  getSession(findController) {
    return this._session;
  }
  addSelectionToNextFindMatch(findController) {
    if (!this._editor.hasModel()) {
      return;
    }
    if (!this._session) {
      const allSelections = this._editor.getSelections();
      if (allSelections.length > 1) {
        const findState = findController.getState();
        const matchCase = findState.matchCase;
        const selectionsContainSameText = modelRangesContainSameText(this._editor.getModel(), allSelections, matchCase);
        if (!selectionsContainSameText) {
          const model = this._editor.getModel();
          const resultingSelections = [];
          for (let i2 = 0, len = allSelections.length; i2 < len; i2++) {
            resultingSelections[i2] = this._expandEmptyToWord(model, allSelections[i2]);
          }
          this._editor.setSelections(resultingSelections);
          return;
        }
      }
    }
    this._beginSessionIfNeeded(findController);
    if (this._session) {
      this._applySessionResult(this._session.addSelectionToNextFindMatch());
    }
  }
  addSelectionToPreviousFindMatch(findController) {
    this._beginSessionIfNeeded(findController);
    if (this._session) {
      this._applySessionResult(this._session.addSelectionToPreviousFindMatch());
    }
  }
  moveSelectionToNextFindMatch(findController) {
    this._beginSessionIfNeeded(findController);
    if (this._session) {
      this._applySessionResult(this._session.moveSelectionToNextFindMatch());
    }
  }
  moveSelectionToPreviousFindMatch(findController) {
    this._beginSessionIfNeeded(findController);
    if (this._session) {
      this._applySessionResult(this._session.moveSelectionToPreviousFindMatch());
    }
  }
  selectAll(findController) {
    if (!this._editor.hasModel()) {
      return;
    }
    let matches2 = null;
    const findState = findController.getState();
    if (findState.isRevealed && findState.searchString.length > 0 && findState.isRegex) {
      const editorModel = this._editor.getModel();
      if (findState.searchScope) {
        matches2 = editorModel.findMatches(findState.searchString, findState.searchScope, findState.isRegex, findState.matchCase, findState.wholeWord ? this._editor.getOption(148 /* wordSeparators */) : null, false, 1073741824 /* MAX_SAFE_SMALL_INTEGER */);
      } else {
        matches2 = editorModel.findMatches(findState.searchString, true, findState.isRegex, findState.matchCase, findState.wholeWord ? this._editor.getOption(148 /* wordSeparators */) : null, false, 1073741824 /* MAX_SAFE_SMALL_INTEGER */);
      }
    } else {
      this._beginSessionIfNeeded(findController);
      if (!this._session) {
        return;
      }
      matches2 = this._session.selectAll(findState.searchScope);
    }
    if (matches2.length > 0) {
      const editorSelection = this._editor.getSelection();
      for (let i2 = 0, len = matches2.length; i2 < len; i2++) {
        const match2 = matches2[i2];
        const intersection2 = match2.range.intersectRanges(editorSelection);
        if (intersection2) {
          matches2[i2] = matches2[0];
          matches2[0] = match2;
          break;
        }
      }
      this._setSelections(matches2.map((m) => new Selection(m.range.startLineNumber, m.range.startColumn, m.range.endLineNumber, m.range.endColumn)));
    }
  }
  selectAllUsingSelections(selections) {
    if (selections.length > 0) {
      this._setSelections(selections);
    }
  }
};

var MultiCursorSelectionControllerAction = class extends EditorAction {
  run(accessor, editor) {
    const multiCursorController = MultiCursorSelectionController.get(editor);
    if (!multiCursorController) {
      return;
    }
    const viewModel = editor._getViewModel();
    if (viewModel) {
      const previousCursorState = viewModel.getCursorStates();
      const findController = CommonFindController.get(editor);
      if (findController) {
        this._run(multiCursorController, findController);
      } else {
        const newFindController = accessor.get(IInstantiationService).createInstance(CommonFindController, editor);
        this._run(multiCursorController, newFindController);
        newFindController.dispose();
      }
      announceCursorChange(previousCursorState, viewModel.getCursorStates());
    }
  }
};

var AddSelectionToNextFindMatchAction = class extends MultiCursorSelectionControllerAction {
  constructor() {
    super({
      id: "editor.action.addSelectionToNextFindMatch",
      label: localize2(1473, "Add Selection to Next Find Match"),
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.focus,
        primary: 2048 /* CtrlCmd */ | 34 /* KeyD */,
        weight: 100 /* EditorContrib */
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "3_multi",
        title: localize(1478, null),
        order: 5
      }
    });
  }
  _run(multiCursorController, findController) {
    multiCursorController.addSelectionToNextFindMatch(findController);
  }
};

var AddSelectionToPreviousFindMatchAction = class extends MultiCursorSelectionControllerAction {
  constructor() {
    super({
      id: "editor.action.addSelectionToPreviousFindMatch",
      label: localize2(1474, "Add Selection to Previous Find Match"),
      precondition: void 0,
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "3_multi",
        title: localize(1479, null),
        order: 6
      }
    });
  }
  _run(multiCursorController, findController) {
    multiCursorController.addSelectionToPreviousFindMatch(findController);
  }
};

var MoveSelectionToNextFindMatchAction = class extends MultiCursorSelectionControllerAction {
  constructor() {
    super({
      id: "editor.action.moveSelectionToNextFindMatch",
      label: localize2(1484, "Move Last Selection to Next Find Match"),
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.focus,
        primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 34 /* KeyD */),
        weight: 100 /* EditorContrib */
      }
    });
  }
  _run(multiCursorController, findController) {
    multiCursorController.moveSelectionToNextFindMatch(findController);
  }
};

var MoveSelectionToPreviousFindMatchAction = class extends MultiCursorSelectionControllerAction {
  constructor() {
    super({
      id: "editor.action.moveSelectionToPreviousFindMatch",
      label: localize2(1485, "Move Last Selection to Previous Find Match"),
      precondition: void 0
    });
  }
  _run(multiCursorController, findController) {
    multiCursorController.moveSelectionToPreviousFindMatch(findController);
  }
};

var SelectHighlightsAction = class extends MultiCursorSelectionControllerAction {
  constructor() {
    super({
      id: "editor.action.selectHighlights",
      label: localize2(1495, "Select All Occurrences of Find Match"),
      precondition: void 0,
      kbOpts: {
        kbExpr: EditorContextKeys.focus,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 42 /* KeyL */,
        weight: 100 /* EditorContrib */
      },
      menuOpts: {
        menuId: MenuId.MenubarSelectionMenu,
        group: "3_multi",
        title: localize(1483, null),
        order: 7
      }
    });
  }
  _run(multiCursorController, findController) {
    multiCursorController.selectAll(findController);
  }
};

var CompatChangeAll = class extends MultiCursorSelectionControllerAction {
  constructor() {
    super({
      id: "editor.action.changeAll",
      label: localize2(1475, "Change All Occurrences"),
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.editorTextFocus),
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: 2048 /* CtrlCmd */ | 60 /* F2 */,
        weight: 100 /* EditorContrib */
      },
      contextMenuOpts: {
        group: "1_modification",
        order: 1.2
      }
    });
  }
  _run(multiCursorController, findController) {
    multiCursorController.selectAll(findController);
  }
};

var SelectionHighlighterState = class {
  constructor(_model, _searchText, _matchCase, _wordSeparators, prevState) {
    this._model = _model;
    this._searchText = _searchText;
    this._matchCase = _matchCase;
    this._wordSeparators = _wordSeparators;
    this._cachedFindMatches = null;
    this._modelVersionId = this._model.getVersionId();
    if (prevState && this._model === prevState._model && this._searchText === prevState._searchText && this._matchCase === prevState._matchCase && this._wordSeparators === prevState._wordSeparators && this._modelVersionId === prevState._modelVersionId) {
      this._cachedFindMatches = prevState._cachedFindMatches;
    }
  }
  findMatches() {
    if (this._cachedFindMatches === null) {
      this._cachedFindMatches = this._model.findMatches(this._searchText, true, false, this._matchCase, this._wordSeparators, false).map((m) => m.range);
      this._cachedFindMatches.sort(Range2.compareRangesUsingStarts);
    }
    return this._cachedFindMatches;
  }
};

var SelectionHighlighter = class extends Disposable {
  constructor(editor, _languageFeaturesService) {
    super();
    this._languageFeaturesService = _languageFeaturesService;
    this.editor = editor;
    this._isEnabled = editor.getOption(122 /* selectionHighlight */);
    this._isEnabledMultiline = editor.getOption(124 /* selectionHighlightMultiline */);
    this._maxLength = editor.getOption(123 /* selectionHighlightMaxLength */);
    this._decorations = editor.createDecorationsCollection();
    this.updateSoon = this._register(new RunOnceScheduler(() => this._update(), 300));
    this.state = null;
    this._register(editor.onDidChangeConfiguration((e4) => {
      this._isEnabled = editor.getOption(122 /* selectionHighlight */);
      this._isEnabledMultiline = editor.getOption(124 /* selectionHighlightMultiline */);
      this._maxLength = editor.getOption(123 /* selectionHighlightMaxLength */);
    }));
    this._register(editor.onDidChangeCursorSelection((e4) => {
      if (!this._isEnabled) {
        return;
      }
      if (e4.selection.isEmpty()) {
        if (e4.reason === 3 /* Explicit */) {
          if (this.state) {
            this._setState(null);
          }
          this.updateSoon.schedule();
        } else {
          this._setState(null);
        }
      } else {
        this._update();
      }
    }));
    this._register(editor.onDidChangeModel((e4) => {
      this._setState(null);
    }));
    this._register(editor.onDidChangeModelContent((e4) => {
      if (this._isEnabled) {
        this.updateSoon.schedule();
      }
    }));
    const findController = CommonFindController.get(editor);
    if (findController) {
      this._register(findController.getState().onFindReplaceStateChange((e4) => {
        this._update();
      }));
    }
    this.updateSoon.schedule();
  }
  static {
    this.ID = "editor.contrib.selectionHighlighter";
  }
  _update() {
    this._setState(SelectionHighlighter._createState(this.state, this._isEnabled, this._isEnabledMultiline, this._maxLength, this.editor));
  }
  static _createState(oldState, isEnabled, isEnabledMultiline, maxLength, editor) {
    if (!isEnabled) {
      return null;
    }
    if (!editor.hasModel()) {
      return null;
    }
    if (!isEnabledMultiline) {
      const s = editor.getSelection();
      if (s.startLineNumber !== s.endLineNumber) {
        return null;
      }
    }
    const multiCursorController = MultiCursorSelectionController.get(editor);
    if (!multiCursorController) {
      return null;
    }
    const findController = CommonFindController.get(editor);
    if (!findController) {
      return null;
    }
    let r2 = multiCursorController.getSession(findController);
    if (!r2) {
      const allSelections = editor.getSelections();
      if (allSelections.length > 1) {
        const findState2 = findController.getState();
        const matchCase = findState2.matchCase;
        const selectionsContainSameText = modelRangesContainSameText(editor.getModel(), allSelections, matchCase);
        if (!selectionsContainSameText) {
          return null;
        }
      }
      r2 = MultiCursorSession.create(editor, findController);
    }
    if (!r2) {
      return null;
    }
    if (r2.currentMatch) {
      return null;
    }
    if (/^[ \t]+$/.test(r2.searchText)) {
      return null;
    }
    if (maxLength > 0 && r2.searchText.length > maxLength) {
      return null;
    }
    const findState = findController.getState();
    const caseSensitive = findState.matchCase;
    if (findState.isRevealed) {
      let findStateSearchString = findState.searchString;
      if (!caseSensitive) {
        findStateSearchString = findStateSearchString.toLowerCase();
      }
      let mySearchString = r2.searchText;
      if (!caseSensitive) {
        mySearchString = mySearchString.toLowerCase();
      }
      if (findStateSearchString === mySearchString && r2.matchCase === findState.matchCase && r2.wholeWord === findState.wholeWord && !findState.isRegex) {
        return null;
      }
    }
    return new SelectionHighlighterState(editor.getModel(), r2.searchText, r2.matchCase, r2.wholeWord ? editor.getOption(148 /* wordSeparators */) : null, oldState);
  }
  _setState(newState) {
    this.state = newState;
    if (!this.state) {
      this._decorations.clear();
      return;
    }
    if (!this.editor.hasModel()) {
      return;
    }
    const model = this.editor.getModel();
    if (model.isTooLargeForTokenization()) {
      return;
    }
    const allMatches = this.state.findMatches();
    const selections = this.editor.getSelections();
    selections.sort(Range2.compareRangesUsingStarts);
    const matches2 = [];
    for (let i2 = 0, j = 0, len = allMatches.length, lenJ = selections.length; i2 < len; ) {
      const match2 = allMatches[i2];
      if (j >= lenJ) {
        matches2.push(match2);
        i2++;
      } else {
        const cmp4 = Range2.compareRangesUsingStarts(match2, selections[j]);
        if (cmp4 < 0) {
          if (selections[j].isEmpty() || !Range2.areIntersecting(match2, selections[j])) {
            matches2.push(match2);
          }
          i2++;
        } else if (cmp4 > 0) {
          j++;
        } else {
          i2++;
          j++;
        }
      }
    }
    const occurrenceHighlighting = this.editor.getOption(90 /* occurrencesHighlight */) !== "off";
    const hasSemanticHighlights = this._languageFeaturesService.documentHighlightProvider.has(model) && occurrenceHighlighting;
    const decorations = matches2.map((r2) => {
      return {
        range: r2,
        options: getSelectionHighlightDecorationOptions(hasSemanticHighlights)
      };
    });
    this._decorations.set(decorations);
  }
  dispose() {
    this._setState(null);
    super.dispose();
  }
};

SelectionHighlighter = __decorateClass([
  __decorateParam(1, ILanguageFeaturesService)
], SelectionHighlighter);

function modelRangesContainSameText(model, ranges, matchCase) {
  const selectedText = getValueInRange(model, ranges[0], !matchCase);
  for (let i2 = 1, len = ranges.length; i2 < len; i2++) {
    const range2 = ranges[i2];
    if (range2.isEmpty()) {
      return false;
    }
    const thisSelectedText = getValueInRange(model, range2, !matchCase);
    if (selectedText !== thisSelectedText) {
      return false;
    }
  }
  return true;
}

function getValueInRange(model, range2, toLowerCase) {
  const text2 = model.getValueInRange(range2);
  return toLowerCase ? text2.toLowerCase() : text2;
}

var FocusNextCursor = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.focusNextCursor",
      label: localize2(1488, "Focus Next Cursor"),
      metadata: {
        description: localize(1489, null),
        args: []
      },
      precondition: void 0
    });
  }
  run(accessor, editor, args2) {
    if (!editor.hasModel()) {
      return;
    }
    const viewModel = editor._getViewModel();
    if (viewModel.cursorConfig.readOnly) {
      return;
    }
    viewModel.model.pushStackElement();
    const previousCursorState = Array.from(viewModel.getCursorStates());
    const firstCursor = previousCursorState.shift();
    if (!firstCursor) {
      return;
    }
    previousCursorState.push(firstCursor);
    viewModel.setCursorStates(args2.source, 3 /* Explicit */, previousCursorState);
    viewModel.revealPrimaryCursor(args2.source, true);
    announceCursorChange(previousCursorState, viewModel.getCursorStates());
  }
};

var FocusPreviousCursor = class extends EditorAction {
  constructor() {
    super({
      id: "editor.action.focusPreviousCursor",
      label: localize2(1490, "Focus Previous Cursor"),
      metadata: {
        description: localize(1491, null),
        args: []
      },
      precondition: void 0
    });
  }
  run(accessor, editor, args2) {
    if (!editor.hasModel()) {
      return;
    }
    const viewModel = editor._getViewModel();
    if (viewModel.cursorConfig.readOnly) {
      return;
    }
    viewModel.model.pushStackElement();
    const previousCursorState = Array.from(viewModel.getCursorStates());
    const firstCursor = previousCursorState.pop();
    if (!firstCursor) {
      return;
    }
    previousCursorState.unshift(firstCursor);
    viewModel.setCursorStates(args2.source, 3 /* Explicit */, previousCursorState);
    viewModel.revealPrimaryCursor(args2.source, true);
    announceCursorChange(previousCursorState, viewModel.getCursorStates());
  }
};

registerEditorContribution(MultiCursorSelectionController.ID, MultiCursorSelectionController, 4 /* Lazy */);

registerEditorContribution(SelectionHighlighter.ID, SelectionHighlighter, 1 /* AfterFirstRender */);

registerEditorAction(InsertCursorAbove);

registerEditorAction(InsertCursorBelow);

registerEditorAction(InsertCursorAtEndOfEachLineSelected);

registerEditorAction(AddSelectionToNextFindMatchAction);

registerEditorAction(AddSelectionToPreviousFindMatchAction);

registerEditorAction(MoveSelectionToNextFindMatchAction);

registerEditorAction(MoveSelectionToPreviousFindMatchAction);

registerEditorAction(SelectHighlightsAction);

registerEditorAction(CompatChangeAll);

registerEditorAction(InsertCursorAtEndOfLineSelected);

registerEditorAction(InsertCursorAtTopOfLineSelected);

registerEditorAction(FocusNextCursor);

registerEditorAction(FocusPreviousCursor);
export { announceCursorChange, modelRangesContainSameText, getValueInRange, InsertCursorAbove, InsertCursorBelow, InsertCursorAtEndOfEachLineSelected, InsertCursorAtEndOfLineSelected, InsertCursorAtTopOfLineSelected, MultiCursorSessionResult, MultiCursorSession, MultiCursorSelectionController, MultiCursorSelectionControllerAction, AddSelectionToNextFindMatchAction, AddSelectionToPreviousFindMatchAction, MoveSelectionToNextFindMatchAction, MoveSelectionToPreviousFindMatchAction, SelectHighlightsAction, CompatChangeAll, SelectionHighlighterState, SelectionHighlighter, FocusNextCursor, FocusPreviousCursor };
