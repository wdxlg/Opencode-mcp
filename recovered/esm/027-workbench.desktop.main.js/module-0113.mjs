// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/cursorCommon.ts
import { InputMode } from "./module-0112.mjs";
import { createScopedLineTokens } from "./module-0109.mjs";
import { normalizeIndentation } from "./module-0111.mjs";
import { CursorColumns } from "./module-0110.mjs";
import { Selection } from "./module-0107.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";


// src/vs/editor/common/cursorCommon.ts
var autoCloseAlways = () => true;

var autoCloseNever = () => false;

var autoCloseBeforeWhitespace = (chr) => chr === " " || chr === "	";

var CursorConfiguration = class {
  constructor(languageId, modelOptions, configuration2, languageConfigurationService) {
    this.languageConfigurationService = languageConfigurationService;
    this._cursorMoveConfigurationBrand = void 0;
    this._languageId = languageId;
    const options3 = configuration2.options;
    const layoutInfo = options3.get(165 /* layoutInfo */);
    const fontInfo = options3.get(59 /* fontInfo */);
    this.readOnly = options3.get(104 /* readOnly */);
    this.tabSize = modelOptions.tabSize;
    this.indentSize = modelOptions.indentSize;
    this.insertSpaces = modelOptions.insertSpaces;
    this.stickyTabStops = options3.get(132 /* stickyTabStops */);
    this.lineHeight = fontInfo.lineHeight;
    this.typicalHalfwidthCharacterWidth = fontInfo.typicalHalfwidthCharacterWidth;
    this.pageSize = Math.max(1, Math.floor(layoutInfo.height / this.lineHeight) - 2);
    this.useTabStops = options3.get(145 /* useTabStops */);
    this.trimWhitespaceOnDelete = options3.get(141 /* trimWhitespaceOnDelete */);
    this.wordSeparators = options3.get(148 /* wordSeparators */);
    this.emptySelectionClipboard = options3.get(45 /* emptySelectionClipboard */);
    this.copyWithSyntaxHighlighting = options3.get(31 /* copyWithSyntaxHighlighting */);
    this.multiCursorMergeOverlapping = options3.get(85 /* multiCursorMergeOverlapping */);
    this.multiCursorPaste = options3.get(88 /* multiCursorPaste */);
    this.multiCursorLimit = options3.get(89 /* multiCursorLimit */);
    this.autoClosingBrackets = options3.get(10 /* autoClosingBrackets */);
    this.autoClosingComments = options3.get(11 /* autoClosingComments */);
    this.autoClosingQuotes = options3.get(15 /* autoClosingQuotes */);
    this.autoClosingDelete = options3.get(13 /* autoClosingDelete */);
    this.autoClosingOvertype = options3.get(14 /* autoClosingOvertype */);
    this.autoSurround = options3.get(20 /* autoSurround */);
    this.autoIndent = options3.get(16 /* autoIndent */);
    this.wordSegmenterLocales = options3.get(147 /* wordSegmenterLocales */);
    this.overtypeOnPaste = options3.get(93 /* overtypeOnPaste */);
    this.surroundingPairs = {};
    this._electricChars = null;
    this.shouldAutoCloseBefore = {
      quote: this._getShouldAutoClose(languageId, this.autoClosingQuotes, true),
      comment: this._getShouldAutoClose(languageId, this.autoClosingComments, false),
      bracket: this._getShouldAutoClose(languageId, this.autoClosingBrackets, false)
    };
    this.autoClosingPairs = this.languageConfigurationService.getLanguageConfiguration(languageId).getAutoClosingPairs();
    const surroundingPairs = this.languageConfigurationService.getLanguageConfiguration(languageId).getSurroundingPairs();
    if (surroundingPairs) {
      for (const pair of surroundingPairs) {
        this.surroundingPairs[pair.open] = pair.close;
      }
    }
    const commentsConfiguration = this.languageConfigurationService.getLanguageConfiguration(languageId).comments;
    this.blockCommentStartToken = commentsConfiguration?.blockCommentStartToken ?? null;
  }
  static shouldRecreate(e) {
    return e.hasChanged(165 /* layoutInfo */) || e.hasChanged(148 /* wordSeparators */) || e.hasChanged(45 /* emptySelectionClipboard */) || e.hasChanged(85 /* multiCursorMergeOverlapping */) || e.hasChanged(88 /* multiCursorPaste */) || e.hasChanged(89 /* multiCursorLimit */) || e.hasChanged(10 /* autoClosingBrackets */) || e.hasChanged(11 /* autoClosingComments */) || e.hasChanged(15 /* autoClosingQuotes */) || e.hasChanged(13 /* autoClosingDelete */) || e.hasChanged(14 /* autoClosingOvertype */) || e.hasChanged(20 /* autoSurround */) || e.hasChanged(145 /* useTabStops */) || e.hasChanged(141 /* trimWhitespaceOnDelete */) || e.hasChanged(59 /* fontInfo */) || e.hasChanged(104 /* readOnly */) || e.hasChanged(147 /* wordSegmenterLocales */) || e.hasChanged(93 /* overtypeOnPaste */);
  }
  get electricChars() {
    if (!this._electricChars) {
      this._electricChars = {};
      const electricChars = this.languageConfigurationService.getLanguageConfiguration(this._languageId).electricCharacter?.getElectricCharacters();
      if (electricChars) {
        for (const char of electricChars) {
          this._electricChars[char] = true;
        }
      }
    }
    return this._electricChars;
  }
  get inputMode() {
    return InputMode.getInputMode();
  }
  /**
   * Should return opening bracket type to match indentation with
   */
  onElectricCharacter(character, context2, column) {
    const scopedLineTokens = createScopedLineTokens(context2, column - 1);
    const electricCharacterSupport = this.languageConfigurationService.getLanguageConfiguration(scopedLineTokens.languageId).electricCharacter;
    if (!electricCharacterSupport) {
      return null;
    }
    return electricCharacterSupport.onElectricCharacter(character, scopedLineTokens, column - scopedLineTokens.firstCharOffset);
  }
  normalizeIndentation(str) {
    return normalizeIndentation(str, this.indentSize, this.insertSpaces);
  }
  _getShouldAutoClose(languageId, autoCloseConfig, forQuotes) {
    switch (autoCloseConfig) {
      case "beforeWhitespace":
        return autoCloseBeforeWhitespace;
      case "languageDefined":
        return this._getLanguageDefinedShouldAutoClose(languageId, forQuotes);
      case "always":
        return autoCloseAlways;
      case "never":
        return autoCloseNever;
    }
  }
  _getLanguageDefinedShouldAutoClose(languageId, forQuotes) {
    const autoCloseBeforeSet = this.languageConfigurationService.getLanguageConfiguration(languageId).getAutoCloseBeforeSet(forQuotes);
    return (c) => autoCloseBeforeSet.indexOf(c) !== -1;
  }
  /**
   * Returns a visible column from a column.
   * @see {@link CursorColumns}
   */
  visibleColumnFromColumn(model, position2) {
    return CursorColumns.visibleColumnFromColumn(model.getLineContent(position2.lineNumber), position2.column, this.tabSize);
  }
  /**
   * Returns a visible column from a column.
   * @see {@link CursorColumns}
   */
  columnFromVisibleColumn(model, lineNumber, visibleColumn) {
    const result = CursorColumns.columnFromVisibleColumn(model.getLineContent(lineNumber), visibleColumn, this.tabSize);
    const minColumn = model.getLineMinColumn(lineNumber);
    if (result < minColumn) {
      return minColumn;
    }
    const maxColumn = model.getLineMaxColumn(lineNumber);
    if (result > maxColumn) {
      return maxColumn;
    }
    return result;
  }
};

var CursorState = class _CursorState {
  constructor(modelState, viewState) {
    this._cursorStateBrand = void 0;
    this.modelState = modelState;
    this.viewState = viewState;
  }
  static fromModelState(modelState) {
    return new PartialModelCursorState(modelState);
  }
  static fromViewState(viewState) {
    return new PartialViewCursorState(viewState);
  }
  static fromModelSelection(modelSelection) {
    const selection = Selection.liftSelection(modelSelection);
    const modelState = new SingleCursorState(
      Range2.fromPositions(selection.getSelectionStart()),
      0 /* Simple */,
      0,
      selection.getPosition(),
      0
    );
    return _CursorState.fromModelState(modelState);
  }
  static fromModelSelections(modelSelections) {
    const states = [];
    for (let i2 = 0, len = modelSelections.length; i2 < len; i2++) {
      states[i2] = this.fromModelSelection(modelSelections[i2]);
    }
    return states;
  }
  equals(other) {
    return this.viewState.equals(other.viewState) && this.modelState.equals(other.modelState);
  }
};

var PartialModelCursorState = class {
  constructor(modelState) {
    this.modelState = modelState;
    this.viewState = null;
  }
};

var PartialViewCursorState = class {
  constructor(viewState) {
    this.modelState = null;
    this.viewState = viewState;
  }
};

var SingleCursorState = class _SingleCursorState {
  constructor(selectionStart, selectionStartKind, selectionStartLeftoverVisibleColumns, position2, leftoverVisibleColumns) {
    this.selectionStart = selectionStart;
    this.selectionStartKind = selectionStartKind;
    this.selectionStartLeftoverVisibleColumns = selectionStartLeftoverVisibleColumns;
    this.position = position2;
    this.leftoverVisibleColumns = leftoverVisibleColumns;
    this._singleCursorStateBrand = void 0;
    this.selection = _SingleCursorState._computeSelection(this.selectionStart, this.position);
  }
  equals(other) {
    return this.selectionStartLeftoverVisibleColumns === other.selectionStartLeftoverVisibleColumns && this.leftoverVisibleColumns === other.leftoverVisibleColumns && this.selectionStartKind === other.selectionStartKind && this.position.equals(other.position) && this.selectionStart.equalsRange(other.selectionStart);
  }
  hasSelection() {
    return !this.selection.isEmpty() || !this.selectionStart.isEmpty();
  }
  move(inSelectionMode, lineNumber, column, leftoverVisibleColumns) {
    if (inSelectionMode) {
      return new _SingleCursorState(
        this.selectionStart,
        this.selectionStartKind,
        this.selectionStartLeftoverVisibleColumns,
        new Position(lineNumber, column),
        leftoverVisibleColumns
      );
    } else {
      return new _SingleCursorState(
        new Range2(lineNumber, column, lineNumber, column),
        0 /* Simple */,
        leftoverVisibleColumns,
        new Position(lineNumber, column),
        leftoverVisibleColumns
      );
    }
  }
  static _computeSelection(selectionStart, position2) {
    if (selectionStart.isEmpty() || !position2.isBeforeOrEqual(selectionStart.getStartPosition())) {
      return Selection.fromPositions(selectionStart.getStartPosition(), position2);
    } else {
      return Selection.fromPositions(selectionStart.getEndPosition(), position2);
    }
  }
};

var EditOperationResult = class {
  constructor(type, commands, opts) {
    this._editOperationResultBrand = void 0;
    this.type = type;
    this.commands = commands;
    this.shouldPushStackElementBefore = opts.shouldPushStackElementBefore;
    this.shouldPushStackElementAfter = opts.shouldPushStackElementAfter;
  }
};

function isQuote(ch) {
  return ch === "'" || ch === '"' || ch === "`";
}
export { isQuote, autoCloseAlways, autoCloseNever, autoCloseBeforeWhitespace, CursorConfiguration, CursorState, PartialModelCursorState, PartialViewCursorState, SingleCursorState, EditOperationResult };
