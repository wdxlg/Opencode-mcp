// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/cursor/cursorDeleteOperations.ts
import { ReplaceCommand } from "./module-0115.mjs";
import { MoveOperations } from "./module-0118.mjs";
import { Range2 } from "./module-0106.mjs";
import { EditOperationResult, isQuote } from "./module-0113.mjs";
import { firstNonWhitespaceIndex, getLeftDeleteOffset } from "./module-0030.mjs";
import { CursorColumns } from "./module-0110.mjs";
import { Position } from "./module-0079.mjs";


// src/vs/editor/common/cursor/cursorDeleteOperations.ts
var DeleteOperations = class _DeleteOperations {
  static deleteRight(prevEditOperationType, config, model, selections) {
    const commands = [];
    let shouldPushStackElementBefore = prevEditOperationType !== 3 /* DeletingRight */;
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      const selection = selections[i2];
      const deleteSelection = this.getDeleteRightRange(selection, model, config);
      if (deleteSelection.isEmpty()) {
        commands[i2] = null;
        continue;
      }
      if (deleteSelection.startLineNumber !== deleteSelection.endLineNumber) {
        shouldPushStackElementBefore = true;
      }
      commands[i2] = new ReplaceCommand(deleteSelection, "");
    }
    return [shouldPushStackElementBefore, commands];
  }
  static getDeleteRightRange(selection, model, config) {
    if (!selection.isEmpty()) {
      return selection;
    }
    const position2 = selection.getPosition();
    const rightOfPosition = MoveOperations.right(config, model, position2);
    if (config.trimWhitespaceOnDelete && rightOfPosition.lineNumber !== position2.lineNumber) {
      const currentLineHasContent = model.getLineFirstNonWhitespaceColumn(position2.lineNumber) > 0;
      const firstNonWhitespaceColumn = model.getLineFirstNonWhitespaceColumn(rightOfPosition.lineNumber);
      if (currentLineHasContent && firstNonWhitespaceColumn > 0) {
        return new Range2(
          rightOfPosition.lineNumber,
          firstNonWhitespaceColumn,
          position2.lineNumber,
          position2.column
        );
      }
    }
    return new Range2(
      rightOfPosition.lineNumber,
      rightOfPosition.column,
      position2.lineNumber,
      position2.column
    );
  }
  static isAutoClosingPairDelete(autoClosingDelete, autoClosingBrackets, autoClosingQuotes, autoClosingPairsOpen, model, selections, autoClosedCharacters) {
    if (autoClosingBrackets === "never" && autoClosingQuotes === "never") {
      return false;
    }
    if (autoClosingDelete === "never") {
      return false;
    }
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      const selection = selections[i2];
      const position2 = selection.getPosition();
      if (!selection.isEmpty()) {
        return false;
      }
      const lineText = model.getLineContent(position2.lineNumber);
      if (position2.column < 2 || position2.column >= lineText.length + 1) {
        return false;
      }
      const character = lineText.charAt(position2.column - 2);
      const autoClosingPairCandidates = autoClosingPairsOpen.get(character);
      if (!autoClosingPairCandidates) {
        return false;
      }
      if (isQuote(character)) {
        if (autoClosingQuotes === "never") {
          return false;
        }
      } else {
        if (autoClosingBrackets === "never") {
          return false;
        }
      }
      const afterCharacter = lineText.charAt(position2.column - 1);
      let foundAutoClosingPair = false;
      for (const autoClosingPairCandidate of autoClosingPairCandidates) {
        if (autoClosingPairCandidate.open === character && autoClosingPairCandidate.close === afterCharacter) {
          foundAutoClosingPair = true;
        }
      }
      if (!foundAutoClosingPair) {
        return false;
      }
      if (autoClosingDelete === "auto") {
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
  static _runAutoClosingPairDelete(config, model, selections) {
    const commands = [];
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      const position2 = selections[i2].getPosition();
      const deleteSelection = new Range2(
        position2.lineNumber,
        position2.column - 1,
        position2.lineNumber,
        position2.column + 1
      );
      commands[i2] = new ReplaceCommand(deleteSelection, "");
    }
    return [true, commands];
  }
  static deleteLeft(prevEditOperationType, config, model, selections, autoClosedCharacters) {
    if (this.isAutoClosingPairDelete(config.autoClosingDelete, config.autoClosingBrackets, config.autoClosingQuotes, config.autoClosingPairs.autoClosingPairsOpenByEnd, model, selections, autoClosedCharacters)) {
      return this._runAutoClosingPairDelete(config, model, selections);
    }
    const commands = [];
    let shouldPushStackElementBefore = prevEditOperationType !== 2 /* DeletingLeft */;
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      const deleteRange = _DeleteOperations.getDeleteLeftRange(selections[i2], model, config);
      if (deleteRange.isEmpty()) {
        commands[i2] = null;
        continue;
      }
      if (deleteRange.startLineNumber !== deleteRange.endLineNumber) {
        shouldPushStackElementBefore = true;
      }
      commands[i2] = new ReplaceCommand(deleteRange, "");
    }
    return [shouldPushStackElementBefore, commands];
  }
  static getDeleteLeftRange(selection, model, config) {
    if (!selection.isEmpty()) {
      return selection;
    }
    const position2 = selection.getPosition();
    if (config.useTabStops && position2.column > 1) {
      const lineContent = model.getLineContent(position2.lineNumber);
      const firstNonWhitespaceIndex2 = firstNonWhitespaceIndex(lineContent);
      const lastIndentationColumn = firstNonWhitespaceIndex2 === -1 ? (
        /* entire string is whitespace */
        lineContent.length + 1
      ) : firstNonWhitespaceIndex2 + 1;
      if (position2.column <= lastIndentationColumn) {
        const fromVisibleColumn = config.visibleColumnFromColumn(model, position2);
        const toVisibleColumn = CursorColumns.prevIndentTabStop(fromVisibleColumn, config.indentSize);
        const toColumn = config.columnFromVisibleColumn(model, position2.lineNumber, toVisibleColumn);
        return new Range2(position2.lineNumber, toColumn, position2.lineNumber, position2.column);
      }
    }
    return Range2.fromPositions(_DeleteOperations.getPositionAfterDeleteLeft(position2, model), position2);
  }
  static getPositionAfterDeleteLeft(position2, model) {
    if (position2.column > 1) {
      const idx = getLeftDeleteOffset(position2.column - 1, model.getLineContent(position2.lineNumber));
      return position2.with(void 0, idx + 1);
    } else if (position2.lineNumber > 1) {
      const newLine = position2.lineNumber - 1;
      return new Position(newLine, model.getLineMaxColumn(newLine));
    } else {
      return position2;
    }
  }
  static cut(config, model, selections) {
    const commands = [];
    let lastCutRange = null;
    selections.sort((a, b) => Position.compare(a.getStartPosition(), b.getEndPosition()));
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      const selection = selections[i2];
      if (selection.isEmpty()) {
        if (config.emptySelectionClipboard) {
          const position2 = selection.getPosition();
          let startLineNumber, startColumn, endLineNumber, endColumn;
          if (position2.lineNumber < model.getLineCount()) {
            startLineNumber = position2.lineNumber;
            startColumn = 1;
            endLineNumber = position2.lineNumber + 1;
            endColumn = 1;
          } else if (position2.lineNumber > 1 && lastCutRange?.endLineNumber !== position2.lineNumber) {
            startLineNumber = position2.lineNumber - 1;
            startColumn = model.getLineMaxColumn(position2.lineNumber - 1);
            endLineNumber = position2.lineNumber;
            endColumn = model.getLineMaxColumn(position2.lineNumber);
          } else {
            startLineNumber = position2.lineNumber;
            startColumn = 1;
            endLineNumber = position2.lineNumber;
            endColumn = model.getLineMaxColumn(position2.lineNumber);
          }
          const deleteSelection = new Range2(
            startLineNumber,
            startColumn,
            endLineNumber,
            endColumn
          );
          lastCutRange = deleteSelection;
          if (!deleteSelection.isEmpty()) {
            commands[i2] = new ReplaceCommand(deleteSelection, "");
          } else {
            commands[i2] = null;
          }
        } else {
          commands[i2] = null;
        }
      } else {
        commands[i2] = new ReplaceCommand(selection, "");
      }
    }
    return new EditOperationResult(0 /* Other */, commands, {
      shouldPushStackElementBefore: true,
      shouldPushStackElementAfter: true
    });
  }
};
export { DeleteOperations };
