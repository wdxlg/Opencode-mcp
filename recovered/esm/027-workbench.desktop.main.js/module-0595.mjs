// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/find/browser/findModel.ts
import { RawContextKey } from "./module-0089.mjs";
import { DisposableStore, dispose } from "./module-0012.mjs";
import { RunOnceScheduler, TimeoutTimer } from "./module-0036.mjs";
import { FindDecorations } from "./module-0591.mjs";
import { Range2 } from "./module-0106.mjs";
import { findFirstIdxMonotonousOrArrLen } from "./module-0006.mjs";
import { Position } from "./module-0079.mjs";
import { ReplacePattern, parseReplaceString } from "./module-0594.mjs";
import { ReplaceCommand, ReplaceCommandThatPreservesSelection } from "./module-0115.mjs";
import { SearchParams } from "./module-0171.mjs";
import { ReplaceAllCommand } from "./module-0592.mjs";
import { Selection } from "./module-0107.mjs";


// src/vs/editor/contrib/find/browser/findModel.ts
var CONTEXT_FIND_WIDGET_VISIBLE = new RawContextKey("findWidgetVisible", false);

var CONTEXT_FIND_WIDGET_NOT_VISIBLE = CONTEXT_FIND_WIDGET_VISIBLE.toNegated();

var CONTEXT_FIND_INPUT_FOCUSED = new RawContextKey("findInputFocussed", false);

var CONTEXT_REPLACE_INPUT_FOCUSED = new RawContextKey("replaceInputFocussed", false);

var CONTEXT_FIND_WIDGET_FOCUSED = new RawContextKey("findWidgetFocused", false);

var ToggleCaseSensitiveKeybinding = {
  primary: 512 /* Alt */ | 33 /* KeyC */,
  mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 33 /* KeyC */ }
};

var ToggleWholeWordKeybinding = {
  primary: 512 /* Alt */ | 53 /* KeyW */,
  mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 53 /* KeyW */ }
};

var ToggleRegexKeybinding = {
  primary: 512 /* Alt */ | 48 /* KeyR */,
  mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 48 /* KeyR */ }
};

var ToggleSearchScopeKeybinding = {
  primary: 512 /* Alt */ | 42 /* KeyL */,
  mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 42 /* KeyL */ }
};

var TogglePreserveCaseKeybinding = {
  primary: 512 /* Alt */ | 46 /* KeyP */,
  mac: { primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 46 /* KeyP */ }
};

var FIND_IDS = {
  StartFindAction: "actions.find",
  StartFindWithSelection: "actions.findWithSelection",
  StartFindWithArgs: "editor.actions.findWithArgs",
  NextMatchFindAction: "editor.action.nextMatchFindAction",
  PreviousMatchFindAction: "editor.action.previousMatchFindAction",
  GoToMatchFindAction: "editor.action.goToMatchFindAction",
  NextSelectionMatchFindAction: "editor.action.nextSelectionMatchFindAction",
  PreviousSelectionMatchFindAction: "editor.action.previousSelectionMatchFindAction",
  StartFindReplaceAction: "editor.action.startFindReplaceAction",
  CloseFindWidgetCommand: "closeFindWidget",
  ToggleCaseSensitiveCommand: "toggleFindCaseSensitive",
  ToggleWholeWordCommand: "toggleFindWholeWord",
  ToggleRegexCommand: "toggleFindRegex",
  ToggleSearchScopeCommand: "toggleFindInSelection",
  TogglePreserveCaseCommand: "togglePreserveCase",
  ReplaceOneAction: "editor.action.replaceOne",
  ReplaceAllAction: "editor.action.replaceAll",
  SelectAllMatchesAction: "editor.action.selectAllMatches"
};

var MATCHES_LIMIT = 19999;

var RESEARCH_DELAY = 240;

var FindModelBoundToEditorModel = class _FindModelBoundToEditorModel {
  constructor(editor, state) {
    this._toDispose = new DisposableStore();
    this._editor = editor;
    this._state = state;
    this._isDisposed = false;
    this._startSearchingTimer = new TimeoutTimer();
    this._decorations = new FindDecorations(editor);
    this._toDispose.add(this._decorations);
    this._updateDecorationsScheduler = new RunOnceScheduler(() => {
      if (!this._editor.hasModel()) {
        return;
      }
      return this.research(false);
    }, 100);
    this._toDispose.add(this._updateDecorationsScheduler);
    this._toDispose.add(this._editor.onDidChangeCursorPosition((e) => {
      if (e.reason === 3 /* Explicit */ || e.reason === 5 /* Undo */ || e.reason === 6 /* Redo */) {
        this._decorations.setStartPosition(this._editor.getPosition());
      }
    }));
    this._ignoreModelContentChanged = false;
    this._toDispose.add(this._editor.onDidChangeModelContent((e) => {
      if (this._ignoreModelContentChanged) {
        return;
      }
      if (e.isFlush) {
        this._decorations.reset();
      }
      this._decorations.setStartPosition(this._editor.getPosition());
      this._updateDecorationsScheduler.schedule();
    }));
    this._toDispose.add(this._state.onFindReplaceStateChange((e) => this._onStateChanged(e)));
    this.research(false, this._state.searchScope);
  }
  dispose() {
    this._isDisposed = true;
    dispose(this._startSearchingTimer);
    this._toDispose.dispose();
  }
  _onStateChanged(e) {
    if (this._isDisposed) {
      return;
    }
    if (!this._editor.hasModel()) {
      return;
    }
    if (e.searchString || e.isReplaceRevealed || e.isRegex || e.wholeWord || e.matchCase || e.searchScope) {
      const model = this._editor.getModel();
      if (model.isTooLargeForSyncing()) {
        this._startSearchingTimer.cancel();
        this._startSearchingTimer.setIfNotSet(() => {
          if (e.searchScope) {
            this.research(e.moveCursor, this._state.searchScope);
          } else {
            this.research(e.moveCursor);
          }
        }, RESEARCH_DELAY);
      } else {
        if (e.searchScope) {
          this.research(e.moveCursor, this._state.searchScope);
        } else {
          this.research(e.moveCursor);
        }
      }
    }
  }
  static _getSearchRange(model, findScope) {
    if (findScope) {
      return findScope;
    }
    return model.getFullModelRange();
  }
  research(moveCursor, newFindScope) {
    let findScopes = null;
    if (typeof newFindScope !== "undefined") {
      if (newFindScope !== null) {
        if (!Array.isArray(newFindScope)) {
          findScopes = [newFindScope];
        } else {
          findScopes = newFindScope;
        }
      }
    } else {
      findScopes = this._decorations.getFindScopes();
    }
    if (findScopes !== null) {
      findScopes = findScopes.map((findScope) => {
        if (findScope.startLineNumber !== findScope.endLineNumber) {
          let endLineNumber = findScope.endLineNumber;
          if (findScope.endColumn === 1) {
            endLineNumber = endLineNumber - 1;
          }
          return new Range2(findScope.startLineNumber, 1, endLineNumber, this._editor.getModel().getLineMaxColumn(endLineNumber));
        }
        return findScope;
      });
    }
    const findMatches = this._findMatches(findScopes, false, MATCHES_LIMIT);
    this._decorations.set(findMatches, findScopes);
    const editorSelection = this._editor.getSelection();
    let currentMatchesPosition = this._decorations.getCurrentMatchesPosition(editorSelection);
    if (currentMatchesPosition === 0 && findMatches.length > 0) {
      const matchAfterSelection = findFirstIdxMonotonousOrArrLen(findMatches.map((match2) => match2.range), (range2) => Range2.compareRangesUsingStarts(range2, editorSelection) >= 0);
      currentMatchesPosition = matchAfterSelection > 0 ? matchAfterSelection - 1 + 1 : currentMatchesPosition;
    }
    this._state.changeMatchInfo(
      currentMatchesPosition,
      this._decorations.getCount(),
      void 0
    );
    if (moveCursor && this._editor.getOption(50 /* find */).cursorMoveOnType) {
      this._moveToNextMatch(this._decorations.getStartPosition());
    }
  }
  _hasMatches() {
    return this._state.matchesCount > 0;
  }
  _cannotFind() {
    if (!this._hasMatches()) {
      const findScope = this._decorations.getFindScope();
      if (findScope) {
        this._editor.revealRangeInCenterIfOutsideViewport(findScope, 0 /* Smooth */);
      }
      return true;
    }
    return false;
  }
  _setCurrentFindMatch(match2) {
    const matchesPosition = this._decorations.setCurrentFindMatch(match2);
    this._state.changeMatchInfo(
      matchesPosition,
      this._decorations.getCount(),
      match2
    );
    this._editor.setSelection(match2);
    this._editor.revealRangeInCenterIfOutsideViewport(match2, 0 /* Smooth */);
  }
  _prevSearchPosition(before) {
    const isUsingLineStops = this._state.isRegex && (this._state.searchString.indexOf("^") >= 0 || this._state.searchString.indexOf("$") >= 0);
    let { lineNumber, column } = before;
    const model = this._editor.getModel();
    if (isUsingLineStops || column === 1) {
      if (lineNumber === 1) {
        lineNumber = model.getLineCount();
      } else {
        lineNumber--;
      }
      column = model.getLineMaxColumn(lineNumber);
    } else {
      column--;
    }
    return new Position(lineNumber, column);
  }
  _moveToPrevMatch(before, isRecursed = false) {
    if (!this._state.canNavigateBack()) {
      const nextMatchRange = this._decorations.matchAfterPosition(before);
      if (nextMatchRange) {
        this._setCurrentFindMatch(nextMatchRange);
      }
      return;
    }
    if (this._decorations.getCount() < MATCHES_LIMIT) {
      let prevMatchRange = this._decorations.matchBeforePosition(before);
      if (prevMatchRange && prevMatchRange.isEmpty() && prevMatchRange.getStartPosition().equals(before)) {
        before = this._prevSearchPosition(before);
        prevMatchRange = this._decorations.matchBeforePosition(before);
      }
      if (prevMatchRange) {
        this._setCurrentFindMatch(prevMatchRange);
      }
      return;
    }
    if (this._cannotFind()) {
      return;
    }
    const findScope = this._decorations.getFindScope();
    const searchRange = _FindModelBoundToEditorModel._getSearchRange(this._editor.getModel(), findScope);
    if (searchRange.getEndPosition().isBefore(before)) {
      before = searchRange.getEndPosition();
    }
    if (before.isBefore(searchRange.getStartPosition())) {
      before = searchRange.getEndPosition();
    }
    const { lineNumber, column } = before;
    const model = this._editor.getModel();
    let position2 = new Position(lineNumber, column);
    let prevMatch = model.findPreviousMatch(this._state.searchString, position2, this._state.isRegex, this._state.matchCase, this._state.wholeWord ? this._editor.getOption(148 /* wordSeparators */) : null, false);
    if (prevMatch && prevMatch.range.isEmpty() && prevMatch.range.getStartPosition().equals(position2)) {
      position2 = this._prevSearchPosition(position2);
      prevMatch = model.findPreviousMatch(this._state.searchString, position2, this._state.isRegex, this._state.matchCase, this._state.wholeWord ? this._editor.getOption(148 /* wordSeparators */) : null, false);
    }
    if (!prevMatch) {
      return;
    }
    if (!isRecursed && !searchRange.containsRange(prevMatch.range)) {
      return this._moveToPrevMatch(prevMatch.range.getStartPosition(), true);
    }
    this._setCurrentFindMatch(prevMatch.range);
  }
  moveToPrevMatch() {
    this._moveToPrevMatch(this._editor.getSelection().getStartPosition());
  }
  _nextSearchPosition(after2) {
    const isUsingLineStops = this._state.isRegex && (this._state.searchString.indexOf("^") >= 0 || this._state.searchString.indexOf("$") >= 0);
    let { lineNumber, column } = after2;
    const model = this._editor.getModel();
    if (isUsingLineStops || column === model.getLineMaxColumn(lineNumber)) {
      if (lineNumber === model.getLineCount()) {
        lineNumber = 1;
      } else {
        lineNumber++;
      }
      column = 1;
    } else {
      column++;
    }
    return new Position(lineNumber, column);
  }
  _moveToNextMatch(after2) {
    if (!this._state.canNavigateForward()) {
      const prevMatchRange = this._decorations.matchBeforePosition(after2);
      if (prevMatchRange) {
        this._setCurrentFindMatch(prevMatchRange);
      }
      return;
    }
    if (this._decorations.getCount() < MATCHES_LIMIT) {
      let nextMatchRange = this._decorations.matchAfterPosition(after2);
      if (nextMatchRange && nextMatchRange.isEmpty() && nextMatchRange.getStartPosition().equals(after2)) {
        after2 = this._nextSearchPosition(after2);
        nextMatchRange = this._decorations.matchAfterPosition(after2);
      }
      if (nextMatchRange) {
        this._setCurrentFindMatch(nextMatchRange);
      }
      return;
    }
    const nextMatch = this._getNextMatch(after2, false, true);
    if (nextMatch) {
      this._setCurrentFindMatch(nextMatch.range);
    }
  }
  _getNextMatch(after2, captureMatches, forceMove, isRecursed = false) {
    if (this._cannotFind()) {
      return null;
    }
    const findScope = this._decorations.getFindScope();
    const searchRange = _FindModelBoundToEditorModel._getSearchRange(this._editor.getModel(), findScope);
    if (searchRange.getEndPosition().isBefore(after2)) {
      after2 = searchRange.getStartPosition();
    }
    if (after2.isBefore(searchRange.getStartPosition())) {
      after2 = searchRange.getStartPosition();
    }
    const { lineNumber, column } = after2;
    const model = this._editor.getModel();
    let position2 = new Position(lineNumber, column);
    let nextMatch = model.findNextMatch(this._state.searchString, position2, this._state.isRegex, this._state.matchCase, this._state.wholeWord ? this._editor.getOption(148 /* wordSeparators */) : null, captureMatches);
    if (forceMove && nextMatch && nextMatch.range.isEmpty() && nextMatch.range.getStartPosition().equals(position2)) {
      position2 = this._nextSearchPosition(position2);
      nextMatch = model.findNextMatch(this._state.searchString, position2, this._state.isRegex, this._state.matchCase, this._state.wholeWord ? this._editor.getOption(148 /* wordSeparators */) : null, captureMatches);
    }
    if (!nextMatch) {
      return null;
    }
    if (!isRecursed && !searchRange.containsRange(nextMatch.range)) {
      return this._getNextMatch(nextMatch.range.getEndPosition(), captureMatches, forceMove, true);
    }
    return nextMatch;
  }
  moveToNextMatch() {
    this._moveToNextMatch(this._editor.getSelection().getEndPosition());
  }
  _moveToMatch(index2) {
    const decorationRange = this._decorations.getDecorationRangeAt(index2);
    if (decorationRange) {
      this._setCurrentFindMatch(decorationRange);
    }
  }
  moveToMatch(index2) {
    this._moveToMatch(index2);
  }
  _getReplacePattern() {
    if (this._state.isRegex) {
      return parseReplaceString(this._state.replaceString);
    }
    return ReplacePattern.fromStaticValue(this._state.replaceString);
  }
  replace() {
    if (!this._hasMatches()) {
      return;
    }
    const replacePattern = this._getReplacePattern();
    const selection = this._editor.getSelection();
    const nextMatch = this._getNextMatch(selection.getStartPosition(), true, false);
    if (nextMatch) {
      if (selection.equalsRange(nextMatch.range)) {
        const replaceString = replacePattern.buildReplaceString(nextMatch.matches, this._state.preserveCase);
        const command4 = new ReplaceCommand(selection, replaceString);
        this._executeEditorCommand("replace", command4);
        this._decorations.setStartPosition(new Position(selection.startLineNumber, selection.startColumn + replaceString.length));
        this.research(true);
      } else {
        this._decorations.setStartPosition(this._editor.getPosition());
        this._setCurrentFindMatch(nextMatch.range);
      }
    }
  }
  _findMatches(findScopes, captureMatches, limitResultCount) {
    const searchRanges = (findScopes || [null]).map(
      (scope) => _FindModelBoundToEditorModel._getSearchRange(this._editor.getModel(), scope)
    );
    return this._editor.getModel().findMatches(this._state.searchString, searchRanges, this._state.isRegex, this._state.matchCase, this._state.wholeWord ? this._editor.getOption(148 /* wordSeparators */) : null, captureMatches, limitResultCount);
  }
  replaceAll() {
    if (!this._hasMatches()) {
      return;
    }
    const findScopes = this._decorations.getFindScopes();
    if (findScopes === null && this._state.matchesCount >= MATCHES_LIMIT) {
      this._largeReplaceAll();
    } else {
      this._regularReplaceAll(findScopes);
    }
    this.research(false);
  }
  _largeReplaceAll() {
    const searchParams = new SearchParams(this._state.searchString, this._state.isRegex, this._state.matchCase, this._state.wholeWord ? this._editor.getOption(148 /* wordSeparators */) : null);
    const searchData = searchParams.parseSearchRequest();
    if (!searchData) {
      return;
    }
    let searchRegex = searchData.regex;
    if (!searchRegex.multiline) {
      let mod = "mu";
      if (searchRegex.ignoreCase) {
        mod += "i";
      }
      if (searchRegex.global) {
        mod += "g";
      }
      searchRegex = new RegExp(searchRegex.source, mod);
    }
    const model = this._editor.getModel();
    const modelText = model.getValue(1 /* LF */);
    const fullModelRange = model.getFullModelRange();
    const replacePattern = this._getReplacePattern();
    let resultText;
    const preserveCase = this._state.preserveCase;
    if (replacePattern.hasReplacementPatterns || preserveCase) {
      resultText = modelText.replace(searchRegex, function() {
        return replacePattern.buildReplaceString(arguments, preserveCase);
      });
    } else {
      resultText = modelText.replace(searchRegex, replacePattern.buildReplaceString(null, preserveCase));
    }
    const command4 = new ReplaceCommandThatPreservesSelection(fullModelRange, resultText, this._editor.getSelection());
    this._executeEditorCommand("replaceAll", command4);
  }
  _regularReplaceAll(findScopes) {
    const replacePattern = this._getReplacePattern();
    const matches2 = this._findMatches(findScopes, replacePattern.hasReplacementPatterns || this._state.preserveCase, 1073741824 /* MAX_SAFE_SMALL_INTEGER */);
    const replaceStrings = [];
    for (let i2 = 0, len = matches2.length; i2 < len; i2++) {
      replaceStrings[i2] = replacePattern.buildReplaceString(matches2[i2].matches, this._state.preserveCase);
    }
    const command4 = new ReplaceAllCommand(this._editor.getSelection(), matches2.map((m) => m.range), replaceStrings);
    this._executeEditorCommand("replaceAll", command4);
  }
  selectAllMatches() {
    if (!this._hasMatches()) {
      return;
    }
    const findScopes = this._decorations.getFindScopes();
    const matches2 = this._findMatches(findScopes, false, 1073741824 /* MAX_SAFE_SMALL_INTEGER */);
    let selections = matches2.map((m) => new Selection(m.range.startLineNumber, m.range.startColumn, m.range.endLineNumber, m.range.endColumn));
    const editorSelection = this._editor.getSelection();
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      const sel = selections[i2];
      if (sel.equalsRange(editorSelection)) {
        selections = [editorSelection].concat(selections.slice(0, i2)).concat(selections.slice(i2 + 1));
        break;
      }
    }
    this._editor.setSelections(selections);
  }
  _executeEditorCommand(source, command4) {
    try {
      this._ignoreModelContentChanged = true;
      this._editor.pushUndoStop();
      this._editor.executeCommand(source, command4);
      this._editor.pushUndoStop();
    } finally {
      this._ignoreModelContentChanged = false;
    }
  }
};
export { CONTEXT_FIND_WIDGET_VISIBLE, CONTEXT_FIND_WIDGET_NOT_VISIBLE, CONTEXT_FIND_INPUT_FOCUSED, CONTEXT_REPLACE_INPUT_FOCUSED, CONTEXT_FIND_WIDGET_FOCUSED, ToggleCaseSensitiveKeybinding, ToggleWholeWordKeybinding, ToggleRegexKeybinding, ToggleSearchScopeKeybinding, TogglePreserveCaseKeybinding, FIND_IDS, MATCHES_LIMIT, RESEARCH_DELAY, FindModelBoundToEditorModel };
