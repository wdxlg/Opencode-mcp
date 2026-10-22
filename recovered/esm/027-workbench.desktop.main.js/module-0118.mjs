// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/cursor/cursorMoveOperations.ts
import { nextCharLength, prevCharLength } from "./module-0030.mjs";
import { Position } from "./module-0079.mjs";
import { AtomicTabMoveOperations } from "./module-0116.mjs";
import { CursorColumns } from "./module-0110.mjs";
import { SingleCursorState } from "./module-0113.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/common/cursor/cursorMoveOperations.ts
var CursorPosition = class {
  constructor(lineNumber, column, leftoverVisibleColumns) {
    this._cursorPositionBrand = void 0;
    this.lineNumber = lineNumber;
    this.column = column;
    this.leftoverVisibleColumns = leftoverVisibleColumns;
  }
};

var MoveOperations = class _MoveOperations {
  static leftPosition(model, position2) {
    if (position2.column > model.getLineMinColumn(position2.lineNumber)) {
      return position2.delta(void 0, -prevCharLength(model.getLineContent(position2.lineNumber), position2.column - 1));
    } else if (position2.lineNumber > 1) {
      const newLineNumber = position2.lineNumber - 1;
      return new Position(newLineNumber, model.getLineMaxColumn(newLineNumber));
    } else {
      return position2;
    }
  }
  static leftPositionAtomicSoftTabs(model, position2, tabSize) {
    if (position2.column <= model.getLineIndentColumn(position2.lineNumber)) {
      const minColumn = model.getLineMinColumn(position2.lineNumber);
      const lineContent = model.getLineContent(position2.lineNumber);
      const newPosition = AtomicTabMoveOperations.atomicPosition(lineContent, position2.column - 1, tabSize, 0 /* Left */);
      if (newPosition !== -1 && newPosition + 1 >= minColumn) {
        return new Position(position2.lineNumber, newPosition + 1);
      }
    }
    return this.leftPosition(model, position2);
  }
  static left(config, model, position2) {
    const pos = config.stickyTabStops ? _MoveOperations.leftPositionAtomicSoftTabs(model, position2, config.tabSize) : _MoveOperations.leftPosition(model, position2);
    return new CursorPosition(pos.lineNumber, pos.column, 0);
  }
  /**
   * @param noOfColumns Must be either `1`
   * or `Math.round(viewModel.getLineContent(viewLineNumber).length / 2)` (for half lines).
  */
  static moveLeft(config, model, cursor, inSelectionMode, noOfColumns) {
    let lineNumber, column;
    if (cursor.hasSelection() && !inSelectionMode) {
      lineNumber = cursor.selection.startLineNumber;
      column = cursor.selection.startColumn;
    } else {
      const pos = cursor.position.delta(void 0, -(noOfColumns - 1));
      const normalizedPos = model.normalizePosition(_MoveOperations.clipPositionColumn(pos, model), 0 /* Left */);
      const p = _MoveOperations.left(config, model, normalizedPos);
      lineNumber = p.lineNumber;
      column = p.column;
    }
    return cursor.move(inSelectionMode, lineNumber, column, 0);
  }
  /**
   * Adjusts the column so that it is within min/max of the line.
  */
  static clipPositionColumn(position2, model) {
    return new Position(
      position2.lineNumber,
      _MoveOperations.clipRange(
        position2.column,
        model.getLineMinColumn(position2.lineNumber),
        model.getLineMaxColumn(position2.lineNumber)
      )
    );
  }
  static clipRange(value2, min, max) {
    if (value2 < min) {
      return min;
    }
    if (value2 > max) {
      return max;
    }
    return value2;
  }
  static rightPosition(model, lineNumber, column) {
    if (column < model.getLineMaxColumn(lineNumber)) {
      column = column + nextCharLength(model.getLineContent(lineNumber), column - 1);
    } else if (lineNumber < model.getLineCount()) {
      lineNumber = lineNumber + 1;
      column = model.getLineMinColumn(lineNumber);
    }
    return model.normalizePosition(new Position(lineNumber, column), 1 /* Right */);
  }
  static rightPositionAtomicSoftTabs(model, lineNumber, column, tabSize, indentSize) {
    if (column < model.getLineIndentColumn(lineNumber)) {
      const lineContent = model.getLineContent(lineNumber);
      const newPosition = AtomicTabMoveOperations.atomicPosition(lineContent, column - 1, tabSize, 1 /* Right */);
      if (newPosition !== -1) {
        return new Position(lineNumber, newPosition + 1);
      }
    }
    return this.rightPosition(model, lineNumber, column);
  }
  static right(config, model, position2) {
    const pos = config.stickyTabStops ? _MoveOperations.rightPositionAtomicSoftTabs(model, position2.lineNumber, position2.column, config.tabSize, config.indentSize) : _MoveOperations.rightPosition(model, position2.lineNumber, position2.column);
    return new CursorPosition(pos.lineNumber, pos.column, 0);
  }
  static moveRight(config, model, cursor, inSelectionMode, noOfColumns) {
    let lineNumber, column;
    if (cursor.hasSelection() && !inSelectionMode) {
      lineNumber = cursor.selection.endLineNumber;
      column = cursor.selection.endColumn;
    } else {
      const pos = cursor.position.delta(void 0, noOfColumns - 1);
      const normalizedPos = model.normalizePosition(_MoveOperations.clipPositionColumn(pos, model), 1 /* Right */);
      const r2 = _MoveOperations.right(config, model, normalizedPos);
      lineNumber = r2.lineNumber;
      column = r2.column;
    }
    return cursor.move(inSelectionMode, lineNumber, column, 0);
  }
  static vertical(config, model, lineNumber, column, leftoverVisibleColumns, newLineNumber, allowMoveOnEdgeLine, normalizationAffinity) {
    const currentVisibleColumn = CursorColumns.visibleColumnFromColumn(model.getLineContent(lineNumber), column, config.tabSize) + leftoverVisibleColumns;
    const lineCount = model.getLineCount();
    const wasOnFirstPosition = lineNumber === 1 && column === 1;
    const wasOnLastPosition = lineNumber === lineCount && column === model.getLineMaxColumn(lineNumber);
    const wasAtEdgePosition = newLineNumber < lineNumber ? wasOnFirstPosition : wasOnLastPosition;
    lineNumber = newLineNumber;
    if (lineNumber < 1) {
      lineNumber = 1;
      if (allowMoveOnEdgeLine) {
        column = model.getLineMinColumn(lineNumber);
      } else {
        column = Math.min(model.getLineMaxColumn(lineNumber), column);
      }
    } else if (lineNumber > lineCount) {
      lineNumber = lineCount;
      if (allowMoveOnEdgeLine) {
        column = model.getLineMaxColumn(lineNumber);
      } else {
        column = Math.min(model.getLineMaxColumn(lineNumber), column);
      }
    } else {
      column = config.columnFromVisibleColumn(model, lineNumber, currentVisibleColumn);
    }
    if (wasAtEdgePosition) {
      leftoverVisibleColumns = 0;
    } else {
      leftoverVisibleColumns = currentVisibleColumn - CursorColumns.visibleColumnFromColumn(model.getLineContent(lineNumber), column, config.tabSize);
    }
    if (normalizationAffinity !== void 0) {
      const position2 = new Position(lineNumber, column);
      const newPosition = model.normalizePosition(position2, normalizationAffinity);
      leftoverVisibleColumns = leftoverVisibleColumns + (column - newPosition.column);
      lineNumber = newPosition.lineNumber;
      column = newPosition.column;
    }
    return new CursorPosition(lineNumber, column, leftoverVisibleColumns);
  }
  static down(config, model, lineNumber, column, leftoverVisibleColumns, count2, allowMoveOnLastLine) {
    return this.vertical(config, model, lineNumber, column, leftoverVisibleColumns, lineNumber + count2, allowMoveOnLastLine, 4 /* RightOfInjectedText */);
  }
  static moveDown(config, model, cursor, inSelectionMode, linesCount) {
    let lineNumber, column;
    if (cursor.hasSelection() && !inSelectionMode) {
      lineNumber = cursor.selection.endLineNumber;
      column = cursor.selection.endColumn;
    } else {
      lineNumber = cursor.position.lineNumber;
      column = cursor.position.column;
    }
    let i2 = 0;
    let r2;
    do {
      r2 = _MoveOperations.down(config, model, lineNumber + i2, column, cursor.leftoverVisibleColumns, linesCount, true);
      const np = model.normalizePosition(new Position(r2.lineNumber, r2.column), 2 /* None */);
      if (np.lineNumber > lineNumber) {
        break;
      }
    } while (i2++ < 10 && lineNumber + i2 < model.getLineCount());
    return cursor.move(inSelectionMode, r2.lineNumber, r2.column, r2.leftoverVisibleColumns);
  }
  static translateDown(config, model, cursor) {
    const selection = cursor.selection;
    const selectionStart = _MoveOperations.down(config, model, selection.selectionStartLineNumber, selection.selectionStartColumn, cursor.selectionStartLeftoverVisibleColumns, 1, false);
    const position2 = _MoveOperations.down(config, model, selection.positionLineNumber, selection.positionColumn, cursor.leftoverVisibleColumns, 1, false);
    return new SingleCursorState(
      new Range2(selectionStart.lineNumber, selectionStart.column, selectionStart.lineNumber, selectionStart.column),
      0 /* Simple */,
      selectionStart.leftoverVisibleColumns,
      new Position(position2.lineNumber, position2.column),
      position2.leftoverVisibleColumns
    );
  }
  static up(config, model, lineNumber, column, leftoverVisibleColumns, count2, allowMoveOnFirstLine) {
    return this.vertical(config, model, lineNumber, column, leftoverVisibleColumns, lineNumber - count2, allowMoveOnFirstLine, 3 /* LeftOfInjectedText */);
  }
  static moveUp(config, model, cursor, inSelectionMode, linesCount) {
    let lineNumber, column;
    if (cursor.hasSelection() && !inSelectionMode) {
      lineNumber = cursor.selection.startLineNumber;
      column = cursor.selection.startColumn;
    } else {
      lineNumber = cursor.position.lineNumber;
      column = cursor.position.column;
    }
    const r2 = _MoveOperations.up(config, model, lineNumber, column, cursor.leftoverVisibleColumns, linesCount, true);
    return cursor.move(inSelectionMode, r2.lineNumber, r2.column, r2.leftoverVisibleColumns);
  }
  static translateUp(config, model, cursor) {
    const selection = cursor.selection;
    const selectionStart = _MoveOperations.up(config, model, selection.selectionStartLineNumber, selection.selectionStartColumn, cursor.selectionStartLeftoverVisibleColumns, 1, false);
    const position2 = _MoveOperations.up(config, model, selection.positionLineNumber, selection.positionColumn, cursor.leftoverVisibleColumns, 1, false);
    return new SingleCursorState(
      new Range2(selectionStart.lineNumber, selectionStart.column, selectionStart.lineNumber, selectionStart.column),
      0 /* Simple */,
      selectionStart.leftoverVisibleColumns,
      new Position(position2.lineNumber, position2.column),
      position2.leftoverVisibleColumns
    );
  }
  static _isBlankLine(model, lineNumber) {
    if (model.getLineFirstNonWhitespaceColumn(lineNumber) === 0) {
      return true;
    }
    return false;
  }
  static moveToPrevBlankLine(config, model, cursor, inSelectionMode) {
    let lineNumber = cursor.position.lineNumber;
    while (lineNumber > 1 && this._isBlankLine(model, lineNumber)) {
      lineNumber--;
    }
    while (lineNumber > 1 && !this._isBlankLine(model, lineNumber)) {
      lineNumber--;
    }
    return cursor.move(inSelectionMode, lineNumber, model.getLineMinColumn(lineNumber), 0);
  }
  static moveToNextBlankLine(config, model, cursor, inSelectionMode) {
    const lineCount = model.getLineCount();
    let lineNumber = cursor.position.lineNumber;
    while (lineNumber < lineCount && this._isBlankLine(model, lineNumber)) {
      lineNumber++;
    }
    while (lineNumber < lineCount && !this._isBlankLine(model, lineNumber)) {
      lineNumber++;
    }
    return cursor.move(inSelectionMode, lineNumber, model.getLineMinColumn(lineNumber), 0);
  }
  static moveToBeginningOfLine(config, model, cursor, inSelectionMode) {
    const lineNumber = cursor.position.lineNumber;
    const minColumn = model.getLineMinColumn(lineNumber);
    const firstNonBlankColumn = model.getLineFirstNonWhitespaceColumn(lineNumber) || minColumn;
    let column;
    const relevantColumnNumber = cursor.position.column;
    if (relevantColumnNumber === firstNonBlankColumn) {
      column = minColumn;
    } else {
      column = firstNonBlankColumn;
    }
    return cursor.move(inSelectionMode, lineNumber, column, 0);
  }
  static moveToEndOfLine(config, model, cursor, inSelectionMode, sticky) {
    const lineNumber = cursor.position.lineNumber;
    const maxColumn = model.getLineMaxColumn(lineNumber);
    return cursor.move(inSelectionMode, lineNumber, maxColumn, sticky ? 1073741824 /* MAX_SAFE_SMALL_INTEGER */ - maxColumn : 0);
  }
  static moveToBeginningOfBuffer(config, model, cursor, inSelectionMode) {
    return cursor.move(inSelectionMode, 1, 1, 0);
  }
  static moveToEndOfBuffer(config, model, cursor, inSelectionMode) {
    const lastLineNumber = model.getLineCount();
    const lastColumn = model.getLineMaxColumn(lastLineNumber);
    return cursor.move(inSelectionMode, lastLineNumber, lastColumn, 0);
  }
};
export { CursorPosition, MoveOperations };
