// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/cursor/cursorTypeEditOperations.ts
import { getIndentActionForType, getIndentForEnter, getInheritIndentForLine } from "./module-0150.mjs";
import { getIndentationAtPosition } from "./module-0143.mjs";
import { EditOperationResult, isQuote } from "./module-0113.mjs";
import { Range2 } from "./module-0106.mjs";
import { ReplaceCommand, ReplaceCommandThatPreservesSelection, ReplaceCommandWithOffsetCursorState, ReplaceCommandWithoutChangingPosition, ReplaceOvertypeCommand, ReplaceOvertypeCommandOnCompositionEnd } from "./module-0115.mjs";
import { Position } from "./module-0079.mjs";
import { getMapForWordSeparators } from "./module-0122.mjs";
import { createScopedLineTokens } from "./module-0109.mjs";
import { SurroundSelectionCommand } from "./module-0149.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { firstNonWhitespaceIndex, getLeadingWhitespace, lastNonWhitespaceIndex, splitLines } from "./module-0030.mjs";
import { getEnterAction } from "./module-0147.mjs";
import { ShiftCommand } from "./module-0148.mjs";


// src/vs/editor/common/cursor/cursorTypeEditOperations.ts
var AutoIndentOperation = class {
  static getEdits(config, model, selections, ch, isDoingComposition) {
    if (!isDoingComposition && this._isAutoIndentType(config, model, selections)) {
      const indentationForSelections = [];
      for (const selection of selections) {
        const indentation = this._findActualIndentationForSelection(config, model, selection, ch);
        if (indentation === null) {
          return;
        }
        indentationForSelections.push({ selection, indentation });
      }
      const autoClosingPairClose = AutoClosingOpenCharTypeOperation.getAutoClosingPairClose(config, model, selections, ch, false);
      return this._getIndentationAndAutoClosingPairEdits(config, model, indentationForSelections, ch, autoClosingPairClose);
    }
    return;
  }
  static _isAutoIndentType(config, model, selections) {
    if (config.autoIndent < 4 /* Full */) {
      return false;
    }
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      if (!model.tokenization.isCheapToTokenize(selections[i2].getEndPosition().lineNumber)) {
        return false;
      }
    }
    return true;
  }
  static _findActualIndentationForSelection(config, model, selection, ch) {
    const actualIndentation = getIndentActionForType(config, model, selection, ch, {
      shiftIndent: (indentation) => {
        return shiftIndent(config, indentation);
      },
      unshiftIndent: (indentation) => {
        return unshiftIndent(config, indentation);
      }
    }, config.languageConfigurationService);
    if (actualIndentation === null) {
      return null;
    }
    const currentIndentation = getIndentationAtPosition(model, selection.startLineNumber, selection.startColumn);
    if (actualIndentation === config.normalizeIndentation(currentIndentation)) {
      return null;
    }
    return actualIndentation;
  }
  static _getIndentationAndAutoClosingPairEdits(config, model, indentationForSelections, ch, autoClosingPairClose) {
    const commands = indentationForSelections.map(({ selection, indentation }) => {
      if (autoClosingPairClose !== null) {
        const indentationEdit = this._getEditFromIndentationAndSelection(config, model, indentation, selection, ch, false);
        return new TypeWithIndentationAndAutoClosingCommand(indentationEdit, selection, ch, autoClosingPairClose);
      } else {
        const indentationEdit = this._getEditFromIndentationAndSelection(config, model, indentation, selection, ch, true);
        return typeCommand(indentationEdit.range, indentationEdit.text, false);
      }
    });
    const editOptions = { shouldPushStackElementBefore: true, shouldPushStackElementAfter: false };
    return new EditOperationResult(4 /* TypingOther */, commands, editOptions);
  }
  static _getEditFromIndentationAndSelection(config, model, indentation, selection, ch, includeChInEdit = true) {
    const startLineNumber = selection.startLineNumber;
    const firstNonWhitespaceColumn = model.getLineFirstNonWhitespaceColumn(startLineNumber);
    let text2 = config.normalizeIndentation(indentation);
    if (firstNonWhitespaceColumn !== 0) {
      const startLine = model.getLineContent(startLineNumber);
      text2 += startLine.substring(firstNonWhitespaceColumn - 1, selection.startColumn - 1);
    }
    text2 += includeChInEdit ? ch : "";
    const range2 = new Range2(startLineNumber, 1, selection.endLineNumber, selection.endColumn);
    return { range: range2, text: text2 };
  }
};

var AutoClosingOvertypeOperation = class {
  static getEdits(prevEditOperationType, config, model, selections, autoClosedCharacters, ch) {
    if (isAutoClosingOvertype(config, model, selections, autoClosedCharacters, ch)) {
      return this._runAutoClosingOvertype(prevEditOperationType, selections, ch);
    }
    return;
  }
  static _runAutoClosingOvertype(prevEditOperationType, selections, ch) {
    const commands = [];
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      const selection = selections[i2];
      const position2 = selection.getPosition();
      const typeSelection = new Range2(position2.lineNumber, position2.column, position2.lineNumber, position2.column + 1);
      commands[i2] = new ReplaceCommand(typeSelection, ch);
    }
    return new EditOperationResult(4 /* TypingOther */, commands, {
      shouldPushStackElementBefore: shouldPushStackElementBetween(prevEditOperationType, 4 /* TypingOther */),
      shouldPushStackElementAfter: false
    });
  }
};

var AutoClosingOvertypeWithInterceptorsOperation = class {
  static getEdits(config, model, selections, autoClosedCharacters, ch) {
    if (isAutoClosingOvertype(config, model, selections, autoClosedCharacters, ch)) {
      const commands = selections.map((s) => new ReplaceCommand(new Range2(s.positionLineNumber, s.positionColumn, s.positionLineNumber, s.positionColumn + 1), "", false));
      return new EditOperationResult(4 /* TypingOther */, commands, {
        shouldPushStackElementBefore: true,
        shouldPushStackElementAfter: false
      });
    }
    return;
  }
};

var AutoClosingOpenCharTypeOperation = class {
  static getEdits(config, model, selections, ch, chIsAlreadyTyped, isDoingComposition) {
    if (!isDoingComposition) {
      const autoClosingPairClose = this.getAutoClosingPairClose(config, model, selections, ch, chIsAlreadyTyped);
      if (autoClosingPairClose !== null) {
        return this._runAutoClosingOpenCharType(selections, ch, chIsAlreadyTyped, autoClosingPairClose);
      }
    }
    return;
  }
  static _runAutoClosingOpenCharType(selections, ch, chIsAlreadyTyped, autoClosingPairClose) {
    const commands = [];
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      const selection = selections[i2];
      commands[i2] = new TypeWithAutoClosingCommand(selection, ch, !chIsAlreadyTyped, autoClosingPairClose);
    }
    return new EditOperationResult(4 /* TypingOther */, commands, {
      shouldPushStackElementBefore: true,
      shouldPushStackElementAfter: false
    });
  }
  static getAutoClosingPairClose(config, model, selections, ch, chIsAlreadyTyped) {
    for (const selection of selections) {
      if (!selection.isEmpty()) {
        return null;
      }
    }
    const positions = selections.map((s) => {
      const position2 = s.getPosition();
      if (chIsAlreadyTyped) {
        return { lineNumber: position2.lineNumber, beforeColumn: position2.column - ch.length, afterColumn: position2.column };
      } else {
        return { lineNumber: position2.lineNumber, beforeColumn: position2.column, afterColumn: position2.column };
      }
    });
    const pair = this._findAutoClosingPairOpen(config, model, positions.map((p) => new Position(p.lineNumber, p.beforeColumn)), ch);
    if (!pair) {
      return null;
    }
    let autoCloseConfig;
    let shouldAutoCloseBefore;
    const chIsQuote = isQuote(ch);
    if (chIsQuote) {
      autoCloseConfig = config.autoClosingQuotes;
      shouldAutoCloseBefore = config.shouldAutoCloseBefore.quote;
    } else {
      const pairIsForComments = config.blockCommentStartToken ? pair.open.includes(config.blockCommentStartToken) : false;
      if (pairIsForComments) {
        autoCloseConfig = config.autoClosingComments;
        shouldAutoCloseBefore = config.shouldAutoCloseBefore.comment;
      } else {
        autoCloseConfig = config.autoClosingBrackets;
        shouldAutoCloseBefore = config.shouldAutoCloseBefore.bracket;
      }
    }
    if (autoCloseConfig === "never") {
      return null;
    }
    const containedPair = this._findContainedAutoClosingPair(config, pair);
    const containedPairClose = containedPair ? containedPair.close : "";
    let isContainedPairPresent = true;
    for (const position2 of positions) {
      const { lineNumber, beforeColumn, afterColumn } = position2;
      const lineText = model.getLineContent(lineNumber);
      const lineBefore = lineText.substring(0, beforeColumn - 1);
      const lineAfter = lineText.substring(afterColumn - 1);
      if (!lineAfter.startsWith(containedPairClose)) {
        isContainedPairPresent = false;
      }
      if (lineAfter.length > 0) {
        const characterAfter = lineAfter.charAt(0);
        const isBeforeCloseBrace = this._isBeforeClosingBrace(config, lineAfter);
        if (!isBeforeCloseBrace && !shouldAutoCloseBefore(characterAfter)) {
          return null;
        }
      }
      if (pair.open.length === 1 && (ch === "'" || ch === '"') && autoCloseConfig !== "always") {
        const wordSeparators2 = getMapForWordSeparators(config.wordSeparators, []);
        if (lineBefore.length > 0) {
          const characterBefore = lineBefore.charCodeAt(lineBefore.length - 1);
          if (wordSeparators2.get(characterBefore) === 0 /* Regular */) {
            return null;
          }
        }
      }
      if (!model.tokenization.isCheapToTokenize(lineNumber)) {
        return null;
      }
      model.tokenization.forceTokenization(lineNumber);
      const lineTokens = model.tokenization.getLineTokens(lineNumber);
      const scopedLineTokens = createScopedLineTokens(lineTokens, beforeColumn - 1);
      if (!pair.shouldAutoClose(scopedLineTokens, beforeColumn - scopedLineTokens.firstCharOffset)) {
        return null;
      }
      const neutralCharacter = pair.findNeutralCharacter();
      if (neutralCharacter) {
        const tokenType = model.tokenization.getTokenTypeIfInsertingCharacter(lineNumber, beforeColumn, neutralCharacter);
        if (!pair.isOK(tokenType)) {
          return null;
        }
      }
    }
    if (isContainedPairPresent) {
      return pair.close.substring(0, pair.close.length - containedPairClose.length);
    } else {
      return pair.close;
    }
  }
  /**
   * Find another auto-closing pair that is contained by the one passed in.
   *
   * e.g. when having [(,)] and [(*,*)] as auto-closing pairs
   * this method will find [(,)] as a containment pair for [(*,*)]
   */
  static _findContainedAutoClosingPair(config, pair) {
    if (pair.open.length <= 1) {
      return null;
    }
    const lastChar = pair.close.charAt(pair.close.length - 1);
    const candidates = config.autoClosingPairs.autoClosingPairsCloseByEnd.get(lastChar) || [];
    let result = null;
    for (const candidate of candidates) {
      if (candidate.open !== pair.open && pair.open.includes(candidate.open) && pair.close.endsWith(candidate.close)) {
        if (!result || candidate.open.length > result.open.length) {
          result = candidate;
        }
      }
    }
    return result;
  }
  /**
   * Determine if typing `ch` at all `positions` in the `model` results in an
   * auto closing open sequence being typed.
   *
   * Auto closing open sequences can consist of multiple characters, which
   * can lead to ambiguities. In such a case, the longest auto-closing open
   * sequence is returned.
   */
  static _findAutoClosingPairOpen(config, model, positions, ch) {
    const candidates = config.autoClosingPairs.autoClosingPairsOpenByEnd.get(ch);
    if (!candidates) {
      return null;
    }
    let result = null;
    for (const candidate of candidates) {
      if (result === null || candidate.open.length > result.open.length) {
        let candidateIsMatch = true;
        for (const position2 of positions) {
          const relevantText = model.getValueInRange(new Range2(position2.lineNumber, position2.column - candidate.open.length + 1, position2.lineNumber, position2.column));
          if (relevantText + ch !== candidate.open) {
            candidateIsMatch = false;
            break;
          }
        }
        if (candidateIsMatch) {
          result = candidate;
        }
      }
    }
    return result;
  }
  static _isBeforeClosingBrace(config, lineAfter) {
    const nextChar = lineAfter.charAt(0);
    const potentialStartingBraces = config.autoClosingPairs.autoClosingPairsOpenByStart.get(nextChar) || [];
    const potentialClosingBraces = config.autoClosingPairs.autoClosingPairsCloseByStart.get(nextChar) || [];
    const isBeforeStartingBrace = potentialStartingBraces.some((x) => lineAfter.startsWith(x.open));
    const isBeforeClosingBrace = potentialClosingBraces.some((x) => lineAfter.startsWith(x.close));
    return !isBeforeStartingBrace && isBeforeClosingBrace;
  }
};

var CompositionEndOvertypeOperation = class {
  static getEdits(config, compositions) {
    const isOvertypeMode = config.inputMode === "overtype";
    if (!isOvertypeMode) {
      return null;
    }
    const commands = compositions.map((composition) => new ReplaceOvertypeCommandOnCompositionEnd(composition.insertedTextRange));
    return new EditOperationResult(4 /* TypingOther */, commands, {
      shouldPushStackElementBefore: true,
      shouldPushStackElementAfter: false
    });
  }
};

var SurroundSelectionOperation = class {
  static getEdits(config, model, selections, ch, isDoingComposition) {
    if (!isDoingComposition && this._isSurroundSelectionType(config, model, selections, ch)) {
      return this._runSurroundSelectionType(config, selections, ch);
    }
    return;
  }
  static _runSurroundSelectionType(config, selections, ch) {
    const commands = [];
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      const selection = selections[i2];
      const closeCharacter = config.surroundingPairs[ch];
      commands[i2] = new SurroundSelectionCommand(selection, ch, closeCharacter);
    }
    return new EditOperationResult(0 /* Other */, commands, {
      shouldPushStackElementBefore: true,
      shouldPushStackElementAfter: true
    });
  }
  static _isSurroundSelectionType(config, model, selections, ch) {
    if (!shouldSurroundChar(config, ch) || !config.surroundingPairs.hasOwnProperty(ch)) {
      return false;
    }
    const isTypingAQuoteCharacter = isQuote(ch);
    for (const selection of selections) {
      if (selection.isEmpty()) {
        return false;
      }
      let selectionContainsOnlyWhitespace = true;
      for (let lineNumber = selection.startLineNumber; lineNumber <= selection.endLineNumber; lineNumber++) {
        const lineText = model.getLineContent(lineNumber);
        const startIndex = lineNumber === selection.startLineNumber ? selection.startColumn - 1 : 0;
        const endIndex = lineNumber === selection.endLineNumber ? selection.endColumn - 1 : lineText.length;
        const selectedText = lineText.substring(startIndex, endIndex);
        if (/[^ \t]/.test(selectedText)) {
          selectionContainsOnlyWhitespace = false;
          break;
        }
      }
      if (selectionContainsOnlyWhitespace) {
        return false;
      }
      if (isTypingAQuoteCharacter && selection.startLineNumber === selection.endLineNumber && selection.startColumn + 1 === selection.endColumn) {
        const selectionText = model.getValueInRange(selection);
        if (isQuote(selectionText)) {
          return false;
        }
      }
    }
    return true;
  }
};

var InterceptorElectricCharOperation = class {
  static getEdits(prevEditOperationType, config, model, selections, ch, isDoingComposition) {
    if (!isDoingComposition && this._isTypeInterceptorElectricChar(config, model, selections)) {
      const r2 = this._typeInterceptorElectricChar(prevEditOperationType, config, model, selections[0], ch);
      if (r2) {
        return r2;
      }
    }
    return;
  }
  static _isTypeInterceptorElectricChar(config, model, selections) {
    if (selections.length === 1 && model.tokenization.isCheapToTokenize(selections[0].getEndPosition().lineNumber)) {
      return true;
    }
    return false;
  }
  static _typeInterceptorElectricChar(prevEditOperationType, config, model, selection, ch) {
    if (!config.electricChars.hasOwnProperty(ch) || !selection.isEmpty()) {
      return null;
    }
    const position2 = selection.getPosition();
    model.tokenization.forceTokenization(position2.lineNumber);
    const lineTokens = model.tokenization.getLineTokens(position2.lineNumber);
    let electricAction;
    try {
      electricAction = config.onElectricCharacter(ch, lineTokens, position2.column);
    } catch (e) {
      onUnexpectedError(e);
      return null;
    }
    if (!electricAction) {
      return null;
    }
    if (electricAction.matchOpenBracket) {
      const endColumn = (lineTokens.getLineContent() + ch).lastIndexOf(electricAction.matchOpenBracket) + 1;
      const match2 = model.bracketPairs.findMatchingBracketUp(
        electricAction.matchOpenBracket,
        {
          lineNumber: position2.lineNumber,
          column: endColumn
        },
        500
        /* give at most 500ms to compute */
      );
      if (match2) {
        if (match2.startLineNumber === position2.lineNumber) {
          return null;
        }
        const matchLine = model.getLineContent(match2.startLineNumber);
        const matchLineIndentation = getLeadingWhitespace(matchLine);
        const newIndentation = config.normalizeIndentation(matchLineIndentation);
        const lineText = model.getLineContent(position2.lineNumber);
        const lineFirstNonBlankColumn = model.getLineFirstNonWhitespaceColumn(position2.lineNumber) || position2.column;
        const prefix = lineText.substring(lineFirstNonBlankColumn - 1, position2.column - 1);
        const typeText = newIndentation + prefix + ch;
        const typeSelection = new Range2(position2.lineNumber, 1, position2.lineNumber, position2.column);
        const command4 = new ReplaceCommand(typeSelection, typeText);
        return new EditOperationResult(getTypingOperation(typeText, prevEditOperationType), [command4], {
          shouldPushStackElementBefore: false,
          shouldPushStackElementAfter: true
        });
      }
    }
    return null;
  }
};

var SimpleCharacterTypeOperation = class {
  static getEdits(config, prevEditOperationType, selections, ch, isDoingComposition) {
    const commands = [];
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      const ChosenReplaceCommand = config.inputMode === "overtype" && !isDoingComposition ? ReplaceOvertypeCommand : ReplaceCommand;
      commands[i2] = new ChosenReplaceCommand(selections[i2], ch);
    }
    const opType = getTypingOperation(ch, prevEditOperationType);
    return new EditOperationResult(opType, commands, {
      shouldPushStackElementBefore: shouldPushStackElementBetween(prevEditOperationType, opType),
      shouldPushStackElementAfter: false
    });
  }
};

var EnterOperation = class {
  static getEdits(config, model, selections, ch, isDoingComposition) {
    if (!isDoingComposition && ch === "\n") {
      const commands = [];
      for (let i2 = 0, len = selections.length; i2 < len; i2++) {
        commands[i2] = this._enter(config, model, false, selections[i2]);
      }
      return new EditOperationResult(4 /* TypingOther */, commands, {
        shouldPushStackElementBefore: true,
        shouldPushStackElementAfter: false
      });
    }
    return;
  }
  static _enter(config, model, keepPosition, range2) {
    if (config.autoIndent === 0 /* None */) {
      return typeCommand(range2, "\n", keepPosition);
    }
    if (!model.tokenization.isCheapToTokenize(range2.getStartPosition().lineNumber) || config.autoIndent === 1 /* Keep */) {
      const lineText2 = model.getLineContent(range2.startLineNumber);
      const indentation2 = getLeadingWhitespace(lineText2).substring(0, range2.startColumn - 1);
      return typeCommand(range2, "\n" + config.normalizeIndentation(indentation2), keepPosition);
    }
    const r2 = getEnterAction(config.autoIndent, model, range2, config.languageConfigurationService);
    if (r2) {
      if (r2.indentAction === 0 /* None */) {
        return typeCommand(range2, "\n" + config.normalizeIndentation(r2.indentation + r2.appendText), keepPosition);
      } else if (r2.indentAction === 1 /* Indent */) {
        return typeCommand(range2, "\n" + config.normalizeIndentation(r2.indentation + r2.appendText), keepPosition);
      } else if (r2.indentAction === 2 /* IndentOutdent */) {
        const normalIndent = config.normalizeIndentation(r2.indentation);
        const increasedIndent = config.normalizeIndentation(r2.indentation + r2.appendText);
        const typeText = "\n" + increasedIndent + "\n" + normalIndent;
        if (keepPosition) {
          return new ReplaceCommandWithoutChangingPosition(range2, typeText, true);
        } else {
          return new ReplaceCommandWithOffsetCursorState(range2, typeText, -1, increasedIndent.length - normalIndent.length, true);
        }
      } else if (r2.indentAction === 3 /* Outdent */) {
        const actualIndentation = unshiftIndent(config, r2.indentation);
        return typeCommand(range2, "\n" + config.normalizeIndentation(actualIndentation + r2.appendText), keepPosition);
      }
    }
    const lineText = model.getLineContent(range2.startLineNumber);
    const indentation = getLeadingWhitespace(lineText).substring(0, range2.startColumn - 1);
    if (config.autoIndent >= 4 /* Full */) {
      const ir = getIndentForEnter(config.autoIndent, model, range2, {
        unshiftIndent: (indent) => {
          return unshiftIndent(config, indent);
        },
        shiftIndent: (indent) => {
          return shiftIndent(config, indent);
        },
        normalizeIndentation: (indent) => {
          return config.normalizeIndentation(indent);
        }
      }, config.languageConfigurationService);
      if (ir) {
        let oldEndViewColumn = config.visibleColumnFromColumn(model, range2.getEndPosition());
        const oldEndColumn = range2.endColumn;
        const newLineContent = model.getLineContent(range2.endLineNumber);
        const firstNonWhitespace = firstNonWhitespaceIndex(newLineContent);
        if (firstNonWhitespace >= 0) {
          range2 = range2.setEndPosition(range2.endLineNumber, Math.max(range2.endColumn, firstNonWhitespace + 1));
        } else {
          range2 = range2.setEndPosition(range2.endLineNumber, model.getLineMaxColumn(range2.endLineNumber));
        }
        if (keepPosition) {
          return new ReplaceCommandWithoutChangingPosition(range2, "\n" + config.normalizeIndentation(ir.afterEnter), true);
        } else {
          let offset = 0;
          if (oldEndColumn <= firstNonWhitespace + 1) {
            if (!config.insertSpaces) {
              oldEndViewColumn = Math.ceil(oldEndViewColumn / config.indentSize);
            }
            offset = Math.min(oldEndViewColumn + 1 - config.normalizeIndentation(ir.afterEnter).length - 1, 0);
          }
          return new ReplaceCommandWithOffsetCursorState(range2, "\n" + config.normalizeIndentation(ir.afterEnter), 0, offset, true);
        }
      }
    }
    return typeCommand(range2, "\n" + config.normalizeIndentation(indentation), keepPosition);
  }
  static lineInsertBefore(config, model, selections) {
    if (model === null || selections === null) {
      return [];
    }
    const commands = [];
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      let lineNumber = selections[i2].positionLineNumber;
      if (lineNumber === 1) {
        commands[i2] = new ReplaceCommandWithoutChangingPosition(new Range2(1, 1, 1, 1), "\n");
      } else {
        lineNumber--;
        const column = model.getLineMaxColumn(lineNumber);
        commands[i2] = this._enter(config, model, false, new Range2(lineNumber, column, lineNumber, column));
      }
    }
    return commands;
  }
  static lineInsertAfter(config, model, selections) {
    if (model === null || selections === null) {
      return [];
    }
    const commands = [];
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      const lineNumber = selections[i2].positionLineNumber;
      const column = model.getLineMaxColumn(lineNumber);
      commands[i2] = this._enter(config, model, false, new Range2(lineNumber, column, lineNumber, column));
    }
    return commands;
  }
  static lineBreakInsert(config, model, selections) {
    const commands = [];
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      commands[i2] = this._enter(config, model, true, selections[i2]);
    }
    return commands;
  }
};

var PasteOperation = class {
  static getEdits(config, model, selections, text2, pasteOnNewLine, multicursorText) {
    const distributedPaste = this._distributePasteToCursors(config, selections, text2, pasteOnNewLine, multicursorText);
    if (distributedPaste) {
      selections = selections.sort(Range2.compareRangesUsingStarts);
      return this._distributedPaste(config, model, selections, distributedPaste);
    } else {
      return this._simplePaste(config, model, selections, text2, pasteOnNewLine);
    }
  }
  static _distributePasteToCursors(config, selections, text2, pasteOnNewLine, multicursorText) {
    if (selections.length === 1) {
      return null;
    }
    if (multicursorText && multicursorText.length === selections.length) {
      return multicursorText;
    }
    if (pasteOnNewLine) {
      return null;
    }
    if (config.multiCursorPaste === "spread") {
      if (text2.charCodeAt(text2.length - 1) === 10 /* LineFeed */) {
        text2 = text2.substring(0, text2.length - 1);
      }
      if (text2.charCodeAt(text2.length - 1) === 13 /* CarriageReturn */) {
        text2 = text2.substring(0, text2.length - 1);
      }
      const lines = splitLines(text2);
      if (lines.length === selections.length) {
        return lines;
      }
    }
    return null;
  }
  static _distributedPaste(config, model, selections, text2) {
    const commands = [];
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      const shouldOvertypeOnPaste = config.overtypeOnPaste && config.inputMode === "overtype";
      const ChosenReplaceCommand = shouldOvertypeOnPaste ? ReplaceOvertypeCommand : ReplaceCommand;
      commands[i2] = new ChosenReplaceCommand(selections[i2], text2[i2]);
    }
    return new EditOperationResult(0 /* Other */, commands, {
      shouldPushStackElementBefore: true,
      shouldPushStackElementAfter: true
    });
  }
  static _simplePaste(config, model, selections, text2, pasteOnNewLine) {
    const commands = [];
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      const selection = selections[i2];
      const position2 = selection.getPosition();
      if (pasteOnNewLine && !selection.isEmpty()) {
        pasteOnNewLine = false;
      }
      if (pasteOnNewLine && text2.indexOf("\n") !== text2.length - 1) {
        pasteOnNewLine = false;
      }
      if (pasteOnNewLine) {
        const typeSelection = new Range2(position2.lineNumber, 1, position2.lineNumber, 1);
        commands[i2] = new ReplaceCommandThatPreservesSelection(typeSelection, text2, selection, true);
      } else {
        const shouldOvertypeOnPaste = config.overtypeOnPaste && config.inputMode === "overtype";
        const ChosenReplaceCommand = shouldOvertypeOnPaste ? ReplaceOvertypeCommand : ReplaceCommand;
        commands[i2] = new ChosenReplaceCommand(selection, text2);
      }
    }
    return new EditOperationResult(0 /* Other */, commands, {
      shouldPushStackElementBefore: true,
      shouldPushStackElementAfter: true
    });
  }
};

var CompositionOperation = class {
  static getEdits(prevEditOperationType, config, model, selections, text2, replacePrevCharCnt, replaceNextCharCnt, positionDelta) {
    const commands = selections.map((selection) => this._compositionType(model, selection, text2, replacePrevCharCnt, replaceNextCharCnt, positionDelta));
    return new EditOperationResult(4 /* TypingOther */, commands, {
      shouldPushStackElementBefore: shouldPushStackElementBetween(prevEditOperationType, 4 /* TypingOther */),
      shouldPushStackElementAfter: false
    });
  }
  static _compositionType(model, selection, text2, replacePrevCharCnt, replaceNextCharCnt, positionDelta) {
    if (!selection.isEmpty()) {
      return null;
    }
    const pos = selection.getPosition();
    const startColumn = Math.max(1, pos.column - replacePrevCharCnt);
    const endColumn = Math.min(model.getLineMaxColumn(pos.lineNumber), pos.column + replaceNextCharCnt);
    const range2 = new Range2(pos.lineNumber, startColumn, pos.lineNumber, endColumn);
    return new ReplaceCommandWithOffsetCursorState(range2, text2, 0, positionDelta);
  }
};

var TypeWithoutInterceptorsOperation = class {
  static getEdits(prevEditOperationType, selections, str) {
    const commands = [];
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      commands[i2] = new ReplaceCommand(selections[i2], str);
    }
    const opType = getTypingOperation(str, prevEditOperationType);
    return new EditOperationResult(opType, commands, {
      shouldPushStackElementBefore: shouldPushStackElementBetween(prevEditOperationType, opType),
      shouldPushStackElementAfter: false
    });
  }
};

var TabOperation = class {
  static getCommands(config, model, selections) {
    const commands = [];
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      const selection = selections[i2];
      if (selection.isEmpty()) {
        const lineText = model.getLineContent(selection.startLineNumber);
        if (/^\s*$/.test(lineText) && model.tokenization.isCheapToTokenize(selection.startLineNumber)) {
          let goodIndent = this._goodIndentForLine(config, model, selection.startLineNumber);
          goodIndent = goodIndent || "	";
          const possibleTypeText = config.normalizeIndentation(goodIndent);
          if (!lineText.startsWith(possibleTypeText)) {
            commands[i2] = new ReplaceCommand(new Range2(selection.startLineNumber, 1, selection.startLineNumber, lineText.length + 1), possibleTypeText, true);
            continue;
          }
        }
        commands[i2] = this._replaceJumpToNextIndent(config, model, selection, true);
      } else {
        if (selection.startLineNumber === selection.endLineNumber) {
          const lineMaxColumn = model.getLineMaxColumn(selection.startLineNumber);
          if (selection.startColumn !== 1 || selection.endColumn !== lineMaxColumn) {
            commands[i2] = this._replaceJumpToNextIndent(config, model, selection, false);
            continue;
          }
        }
        commands[i2] = new ShiftCommand(selection, {
          isUnshift: false,
          tabSize: config.tabSize,
          indentSize: config.indentSize,
          insertSpaces: config.insertSpaces,
          useTabStops: config.useTabStops,
          autoIndent: config.autoIndent
        }, config.languageConfigurationService);
      }
    }
    return commands;
  }
  static _goodIndentForLine(config, model, lineNumber) {
    let action = null;
    let indentation = "";
    const expectedIndentAction = getInheritIndentForLine(config.autoIndent, model, lineNumber, false, config.languageConfigurationService);
    if (expectedIndentAction) {
      action = expectedIndentAction.action;
      indentation = expectedIndentAction.indentation;
    } else if (lineNumber > 1) {
      let lastLineNumber;
      for (lastLineNumber = lineNumber - 1; lastLineNumber >= 1; lastLineNumber--) {
        const lineText = model.getLineContent(lastLineNumber);
        const nonWhitespaceIdx = lastNonWhitespaceIndex(lineText);
        if (nonWhitespaceIdx >= 0) {
          break;
        }
      }
      if (lastLineNumber < 1) {
        return null;
      }
      const maxColumn = model.getLineMaxColumn(lastLineNumber);
      const expectedEnterAction = getEnterAction(config.autoIndent, model, new Range2(lastLineNumber, maxColumn, lastLineNumber, maxColumn), config.languageConfigurationService);
      if (expectedEnterAction) {
        indentation = expectedEnterAction.indentation + expectedEnterAction.appendText;
      }
    }
    if (action) {
      if (action === 1 /* Indent */) {
        indentation = shiftIndent(config, indentation);
      }
      if (action === 3 /* Outdent */) {
        indentation = unshiftIndent(config, indentation);
      }
      indentation = config.normalizeIndentation(indentation);
    }
    if (!indentation) {
      return null;
    }
    return indentation;
  }
  static _replaceJumpToNextIndent(config, model, selection, insertsAutoWhitespace) {
    let typeText = "";
    const position2 = selection.getStartPosition();
    if (config.insertSpaces) {
      const visibleColumnFromColumn = config.visibleColumnFromColumn(model, position2);
      const indentSize = config.indentSize;
      const spacesCnt = indentSize - visibleColumnFromColumn % indentSize;
      for (let i2 = 0; i2 < spacesCnt; i2++) {
        typeText += " ";
      }
    } else {
      typeText = "	";
    }
    return new ReplaceCommand(selection, typeText, insertsAutoWhitespace);
  }
};

var BaseTypeWithAutoClosingCommand = class extends ReplaceCommandWithOffsetCursorState {
  constructor(selection, text2, lineNumberDeltaOffset, columnDeltaOffset, openCharacter, closeCharacter) {
    super(selection, text2, lineNumberDeltaOffset, columnDeltaOffset);
    this._openCharacter = openCharacter;
    this._closeCharacter = closeCharacter;
    this.closeCharacterRange = null;
    this.enclosingRange = null;
  }
  _computeCursorStateWithRange(model, range2, helper) {
    this.closeCharacterRange = new Range2(range2.startLineNumber, range2.endColumn - this._closeCharacter.length, range2.endLineNumber, range2.endColumn);
    this.enclosingRange = new Range2(range2.startLineNumber, range2.endColumn - this._openCharacter.length - this._closeCharacter.length, range2.endLineNumber, range2.endColumn);
    return super.computeCursorState(model, helper);
  }
};

var TypeWithAutoClosingCommand = class extends BaseTypeWithAutoClosingCommand {
  constructor(selection, openCharacter, insertOpenCharacter, closeCharacter) {
    const text2 = (insertOpenCharacter ? openCharacter : "") + closeCharacter;
    const lineNumberDeltaOffset = 0;
    const columnDeltaOffset = -closeCharacter.length;
    super(selection, text2, lineNumberDeltaOffset, columnDeltaOffset, openCharacter, closeCharacter);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    const range2 = inverseEditOperations[0].range;
    return this._computeCursorStateWithRange(model, range2, helper);
  }
};

var TypeWithIndentationAndAutoClosingCommand = class extends BaseTypeWithAutoClosingCommand {
  constructor(autoIndentationEdit, selection, openCharacter, closeCharacter) {
    const text2 = openCharacter + closeCharacter;
    const lineNumberDeltaOffset = 0;
    const columnDeltaOffset = openCharacter.length;
    super(selection, text2, lineNumberDeltaOffset, columnDeltaOffset, openCharacter, closeCharacter);
    this._autoIndentationEdit = autoIndentationEdit;
    this._autoClosingEdit = { range: selection, text: text2 };
  }
  getEditOperations(model, builder) {
    builder.addTrackedEditOperation(this._autoIndentationEdit.range, this._autoIndentationEdit.text);
    builder.addTrackedEditOperation(this._autoClosingEdit.range, this._autoClosingEdit.text);
  }
  computeCursorState(model, helper) {
    const inverseEditOperations = helper.getInverseEditOperations();
    if (inverseEditOperations.length !== 2) {
      throw new Error("There should be two inverse edit operations!");
    }
    const range1 = inverseEditOperations[0].range;
    const range2 = inverseEditOperations[1].range;
    const range3 = range1.plusRange(range2);
    return this._computeCursorStateWithRange(model, range3, helper);
  }
};

function getTypingOperation(typedText, previousTypingOperation) {
  if (typedText === " ") {
    return previousTypingOperation === 5 /* TypingFirstSpace */ || previousTypingOperation === 6 /* TypingConsecutiveSpace */ ? 6 /* TypingConsecutiveSpace */ : 5 /* TypingFirstSpace */;
  }
  return 4 /* TypingOther */;
}

function shouldPushStackElementBetween(previousTypingOperation, typingOperation) {
  if (isTypingOperation(previousTypingOperation) && !isTypingOperation(typingOperation)) {
    return true;
  }
  if (previousTypingOperation === 5 /* TypingFirstSpace */) {
    return false;
  }
  return normalizeOperationType(previousTypingOperation) !== normalizeOperationType(typingOperation);
}

function normalizeOperationType(type) {
  return type === 6 /* TypingConsecutiveSpace */ || type === 5 /* TypingFirstSpace */ ? "space" : type;
}

function isTypingOperation(type) {
  return type === 4 /* TypingOther */ || type === 5 /* TypingFirstSpace */ || type === 6 /* TypingConsecutiveSpace */;
}

function isAutoClosingOvertype(config, model, selections, autoClosedCharacters, ch) {
  if (config.autoClosingOvertype === "never") {
    return false;
  }
  if (!config.autoClosingPairs.autoClosingPairsCloseSingleChar.has(ch)) {
    return false;
  }
  for (let i2 = 0, len = selections.length; i2 < len; i2++) {
    const selection = selections[i2];
    if (!selection.isEmpty()) {
      return false;
    }
    const position2 = selection.getPosition();
    const lineText = model.getLineContent(position2.lineNumber);
    const afterCharacter = lineText.charAt(position2.column - 1);
    if (afterCharacter !== ch) {
      return false;
    }
    const chIsQuote = isQuote(ch);
    const beforeCharacter = position2.column > 2 ? lineText.charCodeAt(position2.column - 2) : 0 /* Null */;
    if (beforeCharacter === 92 /* Backslash */ && chIsQuote) {
      return false;
    }
    if (config.autoClosingOvertype === "auto") {
      let found = false;
      for (let j = 0, lenJ = autoClosedCharacters.length; j < lenJ; j++) {
        const autoClosedCharacter = autoClosedCharacters[j];
        if (position2.lineNumber === autoClosedCharacter.startLineNumber && position2.column === autoClosedCharacter.startColumn) {
          found = true;
          break;
        }
      }
      if (!found) {
        return false;
      }
    }
  }
  return true;
}

function typeCommand(range2, text2, keepPosition) {
  if (keepPosition) {
    return new ReplaceCommandWithoutChangingPosition(range2, text2, true);
  } else {
    return new ReplaceCommand(range2, text2, true);
  }
}

function shiftIndent(config, indentation, count2) {
  count2 = count2 || 1;
  return ShiftCommand.shiftIndent(indentation, indentation.length + count2, config.tabSize, config.indentSize, config.insertSpaces);
}

function unshiftIndent(config, indentation, count2) {
  count2 = count2 || 1;
  return ShiftCommand.unshiftIndent(indentation, indentation.length + count2, config.tabSize, config.indentSize, config.insertSpaces);
}

function shouldSurroundChar(config, ch) {
  if (isQuote(ch)) {
    return config.autoSurround === "quotes" || config.autoSurround === "languageDefined";
  } else {
    return config.autoSurround === "brackets" || config.autoSurround === "languageDefined";
  }
}
export { getTypingOperation, shouldPushStackElementBetween, normalizeOperationType, isTypingOperation, isAutoClosingOvertype, typeCommand, shiftIndent, unshiftIndent, shouldSurroundChar, AutoIndentOperation, AutoClosingOvertypeOperation, AutoClosingOvertypeWithInterceptorsOperation, AutoClosingOpenCharTypeOperation, CompositionEndOvertypeOperation, SurroundSelectionOperation, InterceptorElectricCharOperation, SimpleCharacterTypeOperation, EnterOperation, PasteOperation, CompositionOperation, TypeWithoutInterceptorsOperation, TabOperation, BaseTypeWithAutoClosingCommand, TypeWithAutoClosingCommand, TypeWithIndentationAndAutoClosingCommand };
