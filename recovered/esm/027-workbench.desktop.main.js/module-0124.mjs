// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/cursor/cursorMoveCommands.ts
import { CursorState, SingleCursorState } from "./module-0113.mjs";
import { MoveOperations } from "./module-0118.mjs";
import { Range2 } from "./module-0106.mjs";
import { Position } from "./module-0079.mjs";
import { WordOperations } from "./module-0123.mjs";
import { isBoolean, isNumber, isObject, isString, isUndefined } from "./module-0010.mjs";


// src/vs/editor/common/cursor/cursorMoveCommands.ts
var CursorMoveCommands = class _CursorMoveCommands {
  static addCursorDown(viewModel, cursors, useLogicalLine) {
    const result = [];
    let resultLen = 0;
    for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
      const cursor = cursors[i2];
      result[resultLen++] = new CursorState(cursor.modelState, cursor.viewState);
      if (useLogicalLine) {
        result[resultLen++] = CursorState.fromModelState(MoveOperations.translateDown(viewModel.cursorConfig, viewModel.model, cursor.modelState));
      } else {
        result[resultLen++] = CursorState.fromViewState(MoveOperations.translateDown(viewModel.cursorConfig, viewModel, cursor.viewState));
      }
    }
    return result;
  }
  static addCursorUp(viewModel, cursors, useLogicalLine) {
    const result = [];
    let resultLen = 0;
    for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
      const cursor = cursors[i2];
      result[resultLen++] = new CursorState(cursor.modelState, cursor.viewState);
      if (useLogicalLine) {
        result[resultLen++] = CursorState.fromModelState(MoveOperations.translateUp(viewModel.cursorConfig, viewModel.model, cursor.modelState));
      } else {
        result[resultLen++] = CursorState.fromViewState(MoveOperations.translateUp(viewModel.cursorConfig, viewModel, cursor.viewState));
      }
    }
    return result;
  }
  static moveToBeginningOfLine(viewModel, cursors, inSelectionMode) {
    const result = [];
    for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
      const cursor = cursors[i2];
      result[i2] = this._moveToLineStart(viewModel, cursor, inSelectionMode);
    }
    return result;
  }
  static _moveToLineStart(viewModel, cursor, inSelectionMode) {
    const currentViewStateColumn = cursor.viewState.position.column;
    const currentModelStateColumn = cursor.modelState.position.column;
    const isFirstLineOfWrappedLine = currentViewStateColumn === currentModelStateColumn;
    const currentViewStatelineNumber = cursor.viewState.position.lineNumber;
    const firstNonBlankColumn = viewModel.getLineFirstNonWhitespaceColumn(currentViewStatelineNumber);
    const isBeginningOfViewLine = currentViewStateColumn === firstNonBlankColumn;
    if (!isFirstLineOfWrappedLine && !isBeginningOfViewLine) {
      return this._moveToLineStartByView(viewModel, cursor, inSelectionMode);
    } else {
      return this._moveToLineStartByModel(viewModel, cursor, inSelectionMode);
    }
  }
  static _moveToLineStartByView(viewModel, cursor, inSelectionMode) {
    return CursorState.fromViewState(
      MoveOperations.moveToBeginningOfLine(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode)
    );
  }
  static _moveToLineStartByModel(viewModel, cursor, inSelectionMode) {
    return CursorState.fromModelState(
      MoveOperations.moveToBeginningOfLine(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode)
    );
  }
  static moveToEndOfLine(viewModel, cursors, inSelectionMode, sticky) {
    const result = [];
    for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
      const cursor = cursors[i2];
      result[i2] = this._moveToLineEnd(viewModel, cursor, inSelectionMode, sticky);
    }
    return result;
  }
  static _moveToLineEnd(viewModel, cursor, inSelectionMode, sticky) {
    const viewStatePosition = cursor.viewState.position;
    const viewModelMaxColumn = viewModel.getLineMaxColumn(viewStatePosition.lineNumber);
    const isEndOfViewLine = viewStatePosition.column === viewModelMaxColumn;
    const modelStatePosition = cursor.modelState.position;
    const modelMaxColumn = viewModel.model.getLineMaxColumn(modelStatePosition.lineNumber);
    const isEndLineOfWrappedLine = viewModelMaxColumn - viewStatePosition.column === modelMaxColumn - modelStatePosition.column;
    if (isEndOfViewLine || isEndLineOfWrappedLine) {
      return this._moveToLineEndByModel(viewModel, cursor, inSelectionMode, sticky);
    } else {
      return this._moveToLineEndByView(viewModel, cursor, inSelectionMode, sticky);
    }
  }
  static _moveToLineEndByView(viewModel, cursor, inSelectionMode, sticky) {
    return CursorState.fromViewState(
      MoveOperations.moveToEndOfLine(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, sticky)
    );
  }
  static _moveToLineEndByModel(viewModel, cursor, inSelectionMode, sticky) {
    return CursorState.fromModelState(
      MoveOperations.moveToEndOfLine(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode, sticky)
    );
  }
  static expandLineSelection(viewModel, cursors) {
    const result = [];
    for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
      const cursor = cursors[i2];
      const startLineNumber = cursor.modelState.selection.startLineNumber;
      const lineCount = viewModel.model.getLineCount();
      let endLineNumber = cursor.modelState.selection.endLineNumber;
      let endColumn;
      if (endLineNumber === lineCount) {
        endColumn = viewModel.model.getLineMaxColumn(lineCount);
      } else {
        endLineNumber++;
        endColumn = 1;
      }
      result[i2] = CursorState.fromModelState(new SingleCursorState(
        new Range2(startLineNumber, 1, startLineNumber, 1),
        0 /* Simple */,
        0,
        new Position(endLineNumber, endColumn),
        0
      ));
    }
    return result;
  }
  static moveToBeginningOfBuffer(viewModel, cursors, inSelectionMode) {
    const result = [];
    for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
      const cursor = cursors[i2];
      result[i2] = CursorState.fromModelState(MoveOperations.moveToBeginningOfBuffer(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode));
    }
    return result;
  }
  static moveToEndOfBuffer(viewModel, cursors, inSelectionMode) {
    const result = [];
    for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
      const cursor = cursors[i2];
      result[i2] = CursorState.fromModelState(MoveOperations.moveToEndOfBuffer(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode));
    }
    return result;
  }
  static selectAll(viewModel, cursor) {
    const lineCount = viewModel.model.getLineCount();
    const maxColumn = viewModel.model.getLineMaxColumn(lineCount);
    return CursorState.fromModelState(new SingleCursorState(
      new Range2(1, 1, 1, 1),
      0 /* Simple */,
      0,
      new Position(lineCount, maxColumn),
      0
    ));
  }
  static line(viewModel, cursor, inSelectionMode, _position, _viewPosition) {
    const position2 = viewModel.model.validatePosition(_position);
    const viewPosition = _viewPosition ? viewModel.coordinatesConverter.validateViewPosition(new Position(_viewPosition.lineNumber, _viewPosition.column), position2) : viewModel.coordinatesConverter.convertModelPositionToViewPosition(position2);
    if (!inSelectionMode) {
      const lineCount = viewModel.model.getLineCount();
      let selectToLineNumber = position2.lineNumber + 1;
      let selectToColumn = 1;
      if (selectToLineNumber > lineCount) {
        selectToLineNumber = lineCount;
        selectToColumn = viewModel.model.getLineMaxColumn(selectToLineNumber);
      }
      return CursorState.fromModelState(new SingleCursorState(
        new Range2(position2.lineNumber, 1, selectToLineNumber, selectToColumn),
        2 /* Line */,
        0,
        new Position(selectToLineNumber, selectToColumn),
        0
      ));
    }
    const enteringLineNumber = cursor.modelState.selectionStart.getStartPosition().lineNumber;
    if (position2.lineNumber < enteringLineNumber) {
      return CursorState.fromViewState(cursor.viewState.move(
        true,
        viewPosition.lineNumber,
        1,
        0
      ));
    } else if (position2.lineNumber > enteringLineNumber) {
      const lineCount = viewModel.getLineCount();
      let selectToViewLineNumber = viewPosition.lineNumber + 1;
      let selectToViewColumn = 1;
      if (selectToViewLineNumber > lineCount) {
        selectToViewLineNumber = lineCount;
        selectToViewColumn = viewModel.getLineMaxColumn(selectToViewLineNumber);
      }
      return CursorState.fromViewState(cursor.viewState.move(
        true,
        selectToViewLineNumber,
        selectToViewColumn,
        0
      ));
    } else {
      const endPositionOfSelectionStart = cursor.modelState.selectionStart.getEndPosition();
      return CursorState.fromModelState(cursor.modelState.move(
        true,
        endPositionOfSelectionStart.lineNumber,
        endPositionOfSelectionStart.column,
        0
      ));
    }
  }
  static word(viewModel, cursor, inSelectionMode, _position) {
    const position2 = viewModel.model.validatePosition(_position);
    return CursorState.fromModelState(WordOperations.word(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode, position2));
  }
  static cancelSelection(viewModel, cursor) {
    if (!cursor.modelState.hasSelection()) {
      return new CursorState(cursor.modelState, cursor.viewState);
    }
    const lineNumber = cursor.viewState.position.lineNumber;
    const column = cursor.viewState.position.column;
    return CursorState.fromViewState(new SingleCursorState(
      new Range2(lineNumber, column, lineNumber, column),
      0 /* Simple */,
      0,
      new Position(lineNumber, column),
      0
    ));
  }
  static moveTo(viewModel, cursor, inSelectionMode, _position, _viewPosition) {
    if (inSelectionMode) {
      if (cursor.modelState.selectionStartKind === 1 /* Word */) {
        return this.word(viewModel, cursor, inSelectionMode, _position);
      }
      if (cursor.modelState.selectionStartKind === 2 /* Line */) {
        return this.line(viewModel, cursor, inSelectionMode, _position, _viewPosition);
      }
    }
    const position2 = viewModel.model.validatePosition(_position);
    const viewPosition = _viewPosition ? viewModel.coordinatesConverter.validateViewPosition(new Position(_viewPosition.lineNumber, _viewPosition.column), position2) : viewModel.coordinatesConverter.convertModelPositionToViewPosition(position2);
    return CursorState.fromViewState(cursor.viewState.move(inSelectionMode, viewPosition.lineNumber, viewPosition.column, 0));
  }
  static simpleMove(viewModel, cursors, direction, inSelectionMode, value2, unit) {
    switch (direction) {
      case CursorMove.Direction.Left: {
        if (unit === CursorMove.Unit.HalfLine) {
          return this._moveHalfLineLeft(viewModel, cursors, inSelectionMode);
        } else {
          return this._moveLeft(viewModel, cursors, inSelectionMode, value2);
        }
      }
      case CursorMove.Direction.Right: {
        if (unit === CursorMove.Unit.HalfLine) {
          return this._moveHalfLineRight(viewModel, cursors, inSelectionMode);
        } else {
          return this._moveRight(viewModel, cursors, inSelectionMode, value2);
        }
      }
      case CursorMove.Direction.Up: {
        if (unit === CursorMove.Unit.WrappedLine) {
          return this._moveUpByViewLines(viewModel, cursors, inSelectionMode, value2);
        } else if (unit === CursorMove.Unit.FoldedLine) {
          return this._moveUpByFoldedLines(viewModel, cursors, inSelectionMode, value2);
        } else {
          return this._moveUpByModelLines(viewModel, cursors, inSelectionMode, value2);
        }
      }
      case CursorMove.Direction.Down: {
        if (unit === CursorMove.Unit.WrappedLine) {
          return this._moveDownByViewLines(viewModel, cursors, inSelectionMode, value2);
        } else if (unit === CursorMove.Unit.FoldedLine) {
          return this._moveDownByFoldedLines(viewModel, cursors, inSelectionMode, value2);
        } else {
          return this._moveDownByModelLines(viewModel, cursors, inSelectionMode, value2);
        }
      }
      case CursorMove.Direction.PrevBlankLine: {
        if (unit === CursorMove.Unit.WrappedLine) {
          return cursors.map((cursor) => CursorState.fromViewState(MoveOperations.moveToPrevBlankLine(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode)));
        } else {
          return cursors.map((cursor) => CursorState.fromModelState(MoveOperations.moveToPrevBlankLine(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode)));
        }
      }
      case CursorMove.Direction.NextBlankLine: {
        if (unit === CursorMove.Unit.WrappedLine) {
          return cursors.map((cursor) => CursorState.fromViewState(MoveOperations.moveToNextBlankLine(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode)));
        } else {
          return cursors.map((cursor) => CursorState.fromModelState(MoveOperations.moveToNextBlankLine(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode)));
        }
      }
      case CursorMove.Direction.WrappedLineStart: {
        return this._moveToViewMinColumn(viewModel, cursors, inSelectionMode);
      }
      case CursorMove.Direction.WrappedLineFirstNonWhitespaceCharacter: {
        return this._moveToViewFirstNonWhitespaceColumn(viewModel, cursors, inSelectionMode);
      }
      case CursorMove.Direction.WrappedLineColumnCenter: {
        return this._moveToViewCenterColumn(viewModel, cursors, inSelectionMode);
      }
      case CursorMove.Direction.WrappedLineEnd: {
        return this._moveToViewMaxColumn(viewModel, cursors, inSelectionMode);
      }
      case CursorMove.Direction.WrappedLineLastNonWhitespaceCharacter: {
        return this._moveToViewLastNonWhitespaceColumn(viewModel, cursors, inSelectionMode);
      }
      default:
        return null;
    }
  }
  static viewportMove(viewModel, cursors, direction, inSelectionMode, value2) {
    const visibleViewRange = viewModel.getCompletelyVisibleViewRange();
    const visibleModelRange = viewModel.coordinatesConverter.convertViewRangeToModelRange(visibleViewRange);
    switch (direction) {
      case CursorMove.Direction.ViewPortTop: {
        const modelLineNumber = this._firstLineNumberInRange(viewModel.model, visibleModelRange, value2);
        const modelColumn = viewModel.model.getLineFirstNonWhitespaceColumn(modelLineNumber);
        return [this._moveToModelPosition(viewModel, cursors[0], inSelectionMode, modelLineNumber, modelColumn)];
      }
      case CursorMove.Direction.ViewPortBottom: {
        const modelLineNumber = this._lastLineNumberInRange(viewModel.model, visibleModelRange, value2);
        const modelColumn = viewModel.model.getLineFirstNonWhitespaceColumn(modelLineNumber);
        return [this._moveToModelPosition(viewModel, cursors[0], inSelectionMode, modelLineNumber, modelColumn)];
      }
      case CursorMove.Direction.ViewPortCenter: {
        const modelLineNumber = Math.round((visibleModelRange.startLineNumber + visibleModelRange.endLineNumber) / 2);
        const modelColumn = viewModel.model.getLineFirstNonWhitespaceColumn(modelLineNumber);
        return [this._moveToModelPosition(viewModel, cursors[0], inSelectionMode, modelLineNumber, modelColumn)];
      }
      case CursorMove.Direction.ViewPortIfOutside: {
        const result = [];
        for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
          const cursor = cursors[i2];
          result[i2] = this.findPositionInViewportIfOutside(viewModel, cursor, visibleViewRange, inSelectionMode);
        }
        return result;
      }
      default:
        return null;
    }
  }
  static findPositionInViewportIfOutside(viewModel, cursor, visibleViewRange, inSelectionMode) {
    const viewLineNumber = cursor.viewState.position.lineNumber;
    if (visibleViewRange.startLineNumber <= viewLineNumber && viewLineNumber <= visibleViewRange.endLineNumber - 1) {
      return new CursorState(cursor.modelState, cursor.viewState);
    } else {
      let newViewLineNumber;
      if (viewLineNumber > visibleViewRange.endLineNumber - 1) {
        newViewLineNumber = visibleViewRange.endLineNumber - 1;
      } else if (viewLineNumber < visibleViewRange.startLineNumber) {
        newViewLineNumber = visibleViewRange.startLineNumber;
      } else {
        newViewLineNumber = viewLineNumber;
      }
      const position2 = MoveOperations.vertical(viewModel.cursorConfig, viewModel, viewLineNumber, cursor.viewState.position.column, cursor.viewState.leftoverVisibleColumns, newViewLineNumber, false);
      return CursorState.fromViewState(cursor.viewState.move(inSelectionMode, position2.lineNumber, position2.column, position2.leftoverVisibleColumns));
    }
  }
  /**
   * Find the nth line start included in the range (from the start).
   */
  static _firstLineNumberInRange(model, range2, count2) {
    let startLineNumber = range2.startLineNumber;
    if (range2.startColumn !== model.getLineMinColumn(startLineNumber)) {
      startLineNumber++;
    }
    return Math.min(range2.endLineNumber, startLineNumber + count2 - 1);
  }
  /**
   * Find the nth line start included in the range (from the end).
   */
  static _lastLineNumberInRange(model, range2, count2) {
    let startLineNumber = range2.startLineNumber;
    if (range2.startColumn !== model.getLineMinColumn(startLineNumber)) {
      startLineNumber++;
    }
    return Math.max(startLineNumber, range2.endLineNumber - count2 + 1);
  }
  static _moveLeft(viewModel, cursors, inSelectionMode, noOfColumns) {
    return cursors.map((cursor) => {
      const direction = viewModel.getTextDirection(cursor.viewState.position.lineNumber);
      const isRtl = direction === 1 /* RTL */;
      return CursorState.fromViewState(
        isRtl ? MoveOperations.moveRight(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, noOfColumns) : MoveOperations.moveLeft(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, noOfColumns)
      );
    });
  }
  static _moveHalfLineLeft(viewModel, cursors, inSelectionMode) {
    const result = [];
    for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
      const cursor = cursors[i2];
      const viewLineNumber = cursor.viewState.position.lineNumber;
      const halfLine = Math.round(viewModel.getLineLength(viewLineNumber) / 2);
      result[i2] = CursorState.fromViewState(MoveOperations.moveLeft(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, halfLine));
    }
    return result;
  }
  static _moveRight(viewModel, cursors, inSelectionMode, noOfColumns) {
    return cursors.map((cursor) => {
      const direction = viewModel.getTextDirection(cursor.viewState.position.lineNumber);
      const isRtl = direction === 1 /* RTL */;
      return CursorState.fromViewState(
        isRtl ? MoveOperations.moveLeft(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, noOfColumns) : MoveOperations.moveRight(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, noOfColumns)
      );
    });
  }
  static _moveHalfLineRight(viewModel, cursors, inSelectionMode) {
    const result = [];
    for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
      const cursor = cursors[i2];
      const viewLineNumber = cursor.viewState.position.lineNumber;
      const halfLine = Math.round(viewModel.getLineLength(viewLineNumber) / 2);
      result[i2] = CursorState.fromViewState(MoveOperations.moveRight(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, halfLine));
    }
    return result;
  }
  static _moveDownByViewLines(viewModel, cursors, inSelectionMode, linesCount) {
    const result = [];
    for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
      const cursor = cursors[i2];
      result[i2] = CursorState.fromViewState(MoveOperations.moveDown(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, linesCount));
    }
    return result;
  }
  static _moveDownByModelLines(viewModel, cursors, inSelectionMode, linesCount) {
    const result = [];
    for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
      const cursor = cursors[i2];
      result[i2] = CursorState.fromModelState(MoveOperations.moveDown(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode, linesCount));
    }
    return result;
  }
  static _moveUpByViewLines(viewModel, cursors, inSelectionMode, linesCount) {
    const result = [];
    for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
      const cursor = cursors[i2];
      result[i2] = CursorState.fromViewState(MoveOperations.moveUp(viewModel.cursorConfig, viewModel, cursor.viewState, inSelectionMode, linesCount));
    }
    return result;
  }
  static _moveUpByModelLines(viewModel, cursors, inSelectionMode, linesCount) {
    const result = [];
    for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
      const cursor = cursors[i2];
      result[i2] = CursorState.fromModelState(MoveOperations.moveUp(viewModel.cursorConfig, viewModel.model, cursor.modelState, inSelectionMode, linesCount));
    }
    return result;
  }
  static _moveDownByFoldedLines(viewModel, cursors, inSelectionMode, count2) {
    const model = viewModel.model;
    const lineCount = model.getLineCount();
    const hiddenAreas = viewModel.getHiddenAreas();
    return cursors.map((cursor) => {
      const startLine = cursor.modelState.hasSelection() && !inSelectionMode ? cursor.modelState.selection.endLineNumber : cursor.modelState.position.lineNumber;
      const targetLine = _CursorMoveCommands._targetFoldedDown(startLine, count2, hiddenAreas, lineCount);
      const delta2 = targetLine - startLine;
      if (delta2 === 0) {
        return CursorState.fromModelState(cursor.modelState);
      }
      return CursorState.fromModelState(MoveOperations.moveDown(viewModel.cursorConfig, model, cursor.modelState, inSelectionMode, delta2));
    });
  }
  static _moveUpByFoldedLines(viewModel, cursors, inSelectionMode, count2) {
    const model = viewModel.model;
    const hiddenAreas = viewModel.getHiddenAreas();
    return cursors.map((cursor) => {
      const startLine = cursor.modelState.hasSelection() && !inSelectionMode ? cursor.modelState.selection.startLineNumber : cursor.modelState.position.lineNumber;
      const targetLine = _CursorMoveCommands._targetFoldedUp(startLine, count2, hiddenAreas);
      const delta2 = startLine - targetLine;
      if (delta2 === 0) {
        return CursorState.fromModelState(cursor.modelState);
      }
      return CursorState.fromModelState(MoveOperations.moveUp(viewModel.cursorConfig, model, cursor.modelState, inSelectionMode, delta2));
    });
  }
  // Compute the target line after moving `count` steps downward from `startLine`,
  // treating each folded region as a single step.
  static _targetFoldedDown(startLine, count2, hiddenAreas, lineCount) {
    let line = startLine;
    let i2 = 0;
    while (i2 < hiddenAreas.length && hiddenAreas[i2].endLineNumber < line + 1) {
      i2++;
    }
    for (let step = 0; step < count2; step++) {
      if (line >= lineCount) {
        return lineCount;
      }
      let candidate = line + 1;
      while (i2 < hiddenAreas.length && hiddenAreas[i2].endLineNumber < candidate) {
        i2++;
      }
      if (i2 < hiddenAreas.length && hiddenAreas[i2].startLineNumber <= candidate) {
        candidate = hiddenAreas[i2].endLineNumber + 1;
      }
      if (candidate > lineCount) {
        return line;
      }
      line = candidate;
    }
    return line;
  }
  // Compute the target line after moving `count` steps upward from `startLine`,
  // treating each folded region as a single step.
  static _targetFoldedUp(startLine, count2, hiddenAreas) {
    let line = startLine;
    let i2 = hiddenAreas.length - 1;
    while (i2 >= 0 && hiddenAreas[i2].startLineNumber > line - 1) {
      i2--;
    }
    for (let step = 0; step < count2; step++) {
      if (line <= 1) {
        return 1;
      }
      let candidate = line - 1;
      while (i2 >= 0 && hiddenAreas[i2].startLineNumber > candidate) {
        i2--;
      }
      if (i2 >= 0 && hiddenAreas[i2].endLineNumber >= candidate) {
        candidate = hiddenAreas[i2].startLineNumber - 1;
      }
      if (candidate < 1) {
        return line;
      }
      line = candidate;
    }
    return line;
  }
  static _moveToViewPosition(viewModel, cursor, inSelectionMode, toViewLineNumber, toViewColumn) {
    return CursorState.fromViewState(cursor.viewState.move(inSelectionMode, toViewLineNumber, toViewColumn, 0));
  }
  static _moveToModelPosition(viewModel, cursor, inSelectionMode, toModelLineNumber, toModelColumn) {
    return CursorState.fromModelState(cursor.modelState.move(inSelectionMode, toModelLineNumber, toModelColumn, 0));
  }
  static _moveToViewMinColumn(viewModel, cursors, inSelectionMode) {
    const result = [];
    for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
      const cursor = cursors[i2];
      const viewLineNumber = cursor.viewState.position.lineNumber;
      const viewColumn = viewModel.getLineMinColumn(viewLineNumber);
      result[i2] = this._moveToViewPosition(viewModel, cursor, inSelectionMode, viewLineNumber, viewColumn);
    }
    return result;
  }
  static _moveToViewFirstNonWhitespaceColumn(viewModel, cursors, inSelectionMode) {
    const result = [];
    for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
      const cursor = cursors[i2];
      const viewLineNumber = cursor.viewState.position.lineNumber;
      const viewColumn = viewModel.getLineFirstNonWhitespaceColumn(viewLineNumber);
      result[i2] = this._moveToViewPosition(viewModel, cursor, inSelectionMode, viewLineNumber, viewColumn);
    }
    return result;
  }
  static _moveToViewCenterColumn(viewModel, cursors, inSelectionMode) {
    const result = [];
    for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
      const cursor = cursors[i2];
      const viewLineNumber = cursor.viewState.position.lineNumber;
      const viewColumn = Math.round((viewModel.getLineMaxColumn(viewLineNumber) + viewModel.getLineMinColumn(viewLineNumber)) / 2);
      result[i2] = this._moveToViewPosition(viewModel, cursor, inSelectionMode, viewLineNumber, viewColumn);
    }
    return result;
  }
  static _moveToViewMaxColumn(viewModel, cursors, inSelectionMode) {
    const result = [];
    for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
      const cursor = cursors[i2];
      const viewLineNumber = cursor.viewState.position.lineNumber;
      const viewColumn = viewModel.getLineMaxColumn(viewLineNumber);
      result[i2] = this._moveToViewPosition(viewModel, cursor, inSelectionMode, viewLineNumber, viewColumn);
    }
    return result;
  }
  static _moveToViewLastNonWhitespaceColumn(viewModel, cursors, inSelectionMode) {
    const result = [];
    for (let i2 = 0, len = cursors.length; i2 < len; i2++) {
      const cursor = cursors[i2];
      const viewLineNumber = cursor.viewState.position.lineNumber;
      const viewColumn = viewModel.getLineLastNonWhitespaceColumn(viewLineNumber);
      result[i2] = this._moveToViewPosition(viewModel, cursor, inSelectionMode, viewLineNumber, viewColumn);
    }
    return result;
  }
};

var CursorMove;

((CursorMove2) => {
  const isCursorMoveArgs = function(arg) {
    if (!isObject(arg)) {
      return false;
    }
    const cursorMoveArg = arg;
    if (!isString(cursorMoveArg.to)) {
      return false;
    }
    if (!isUndefined(cursorMoveArg.select) && !isBoolean(cursorMoveArg.select)) {
      return false;
    }
    if (!isUndefined(cursorMoveArg.by) && !isString(cursorMoveArg.by)) {
      return false;
    }
    if (!isUndefined(cursorMoveArg.value) && !isNumber(cursorMoveArg.value)) {
      return false;
    }
    if (!isUndefined(cursorMoveArg.noHistory) && !isBoolean(cursorMoveArg.noHistory)) {
      return false;
    }
    return true;
  };
  CursorMove2.metadata = {
    description: "Move cursor to a logical position in the view",
    args: [
      {
        name: "Cursor move argument object",
        description: `Property-value pairs that can be passed through this argument:
					* 'to': A mandatory logical position value providing where to move the cursor.
						\`\`\`
						'left', 'right', 'up', 'down', 'prevBlankLine', 'nextBlankLine',
						'wrappedLineStart', 'wrappedLineEnd', 'wrappedLineColumnCenter'
						'wrappedLineFirstNonWhitespaceCharacter', 'wrappedLineLastNonWhitespaceCharacter'
						'viewPortTop', 'viewPortCenter', 'viewPortBottom', 'viewPortIfOutside'
						\`\`\`
					* 'by': Unit to move. Default is computed based on 'to' value.
						\`\`\`
						'line', 'wrappedLine', 'character', 'halfLine', 'foldedLine'
						\`\`\`
						Use 'foldedLine' with 'up'/'down' to move by logical lines while treating each
						folded region as a single step.
					* 'value': Number of units to move. Default is '1'.
					* 'select': If 'true' makes the selection. Default is 'false'.
					* 'noHistory': If 'true' does not add the movement to navigation history. Default is 'false'.
				`,
        constraint: isCursorMoveArgs,
        schema: {
          "type": "object",
          "required": ["to"],
          "properties": {
            "to": {
              "type": "string",
              "enum": ["left", "right", "up", "down", "prevBlankLine", "nextBlankLine", "wrappedLineStart", "wrappedLineEnd", "wrappedLineColumnCenter", "wrappedLineFirstNonWhitespaceCharacter", "wrappedLineLastNonWhitespaceCharacter", "viewPortTop", "viewPortCenter", "viewPortBottom", "viewPortIfOutside"]
            },
            "by": {
              "type": "string",
              "enum": ["line", "wrappedLine", "character", "halfLine", "foldedLine"]
            },
            "value": {
              "type": "number",
              "default": 1
            },
            "select": {
              "type": "boolean",
              "default": false
            },
            "noHistory": {
              "type": "boolean",
              "default": false
            }
          }
        }
      }
    ]
  };
  CursorMove2.RawDirection = {
    Left: "left",
    Right: "right",
    Up: "up",
    Down: "down",
    PrevBlankLine: "prevBlankLine",
    NextBlankLine: "nextBlankLine",
    WrappedLineStart: "wrappedLineStart",
    WrappedLineFirstNonWhitespaceCharacter: "wrappedLineFirstNonWhitespaceCharacter",
    WrappedLineColumnCenter: "wrappedLineColumnCenter",
    WrappedLineEnd: "wrappedLineEnd",
    WrappedLineLastNonWhitespaceCharacter: "wrappedLineLastNonWhitespaceCharacter",
    ViewPortTop: "viewPortTop",
    ViewPortCenter: "viewPortCenter",
    ViewPortBottom: "viewPortBottom",
    ViewPortIfOutside: "viewPortIfOutside"
  };
  CursorMove2.RawUnit = {
    Line: "line",
    WrappedLine: "wrappedLine",
    Character: "character",
    HalfLine: "halfLine",
    FoldedLine: "foldedLine"
  };
  function parse14(args2) {
    if (!args2.to) {
      return null;
    }
    let direction;
    switch (args2.to) {
      case CursorMove2.RawDirection.Left:
        direction = 0 /* Left */;
        break;
      case CursorMove2.RawDirection.Right:
        direction = 1 /* Right */;
        break;
      case CursorMove2.RawDirection.Up:
        direction = 2 /* Up */;
        break;
      case CursorMove2.RawDirection.Down:
        direction = 3 /* Down */;
        break;
      case CursorMove2.RawDirection.PrevBlankLine:
        direction = 4 /* PrevBlankLine */;
        break;
      case CursorMove2.RawDirection.NextBlankLine:
        direction = 5 /* NextBlankLine */;
        break;
      case CursorMove2.RawDirection.WrappedLineStart:
        direction = 6 /* WrappedLineStart */;
        break;
      case CursorMove2.RawDirection.WrappedLineFirstNonWhitespaceCharacter:
        direction = 7 /* WrappedLineFirstNonWhitespaceCharacter */;
        break;
      case CursorMove2.RawDirection.WrappedLineColumnCenter:
        direction = 8 /* WrappedLineColumnCenter */;
        break;
      case CursorMove2.RawDirection.WrappedLineEnd:
        direction = 9 /* WrappedLineEnd */;
        break;
      case CursorMove2.RawDirection.WrappedLineLastNonWhitespaceCharacter:
        direction = 10 /* WrappedLineLastNonWhitespaceCharacter */;
        break;
      case CursorMove2.RawDirection.ViewPortTop:
        direction = 11 /* ViewPortTop */;
        break;
      case CursorMove2.RawDirection.ViewPortBottom:
        direction = 13 /* ViewPortBottom */;
        break;
      case CursorMove2.RawDirection.ViewPortCenter:
        direction = 12 /* ViewPortCenter */;
        break;
      case CursorMove2.RawDirection.ViewPortIfOutside:
        direction = 14 /* ViewPortIfOutside */;
        break;
      default:
        return null;
    }
    let unit = 0 /* None */;
    switch (args2.by) {
      case CursorMove2.RawUnit.Line:
        unit = 1 /* Line */;
        break;
      case CursorMove2.RawUnit.WrappedLine:
        unit = 2 /* WrappedLine */;
        break;
      case CursorMove2.RawUnit.Character:
        unit = 3 /* Character */;
        break;
      case CursorMove2.RawUnit.HalfLine:
        unit = 4 /* HalfLine */;
        break;
      case CursorMove2.RawUnit.FoldedLine:
        unit = 5 /* FoldedLine */;
        break;
    }
    return {
      direction,
      unit,
      select: !!args2.select,
      value: args2.value || 1,
      noHistory: !!args2.noHistory
    };
  }
  CursorMove2.parse = parse14;
  let Direction4;
  ((Direction5) => {
    Direction5[Direction5["Left"] = 0] = "Left";
    Direction5[Direction5["Right"] = 1] = "Right";
    Direction5[Direction5["Up"] = 2] = "Up";
    Direction5[Direction5["Down"] = 3] = "Down";
    Direction5[Direction5["PrevBlankLine"] = 4] = "PrevBlankLine";
    Direction5[Direction5["NextBlankLine"] = 5] = "NextBlankLine";
    Direction5[Direction5["WrappedLineStart"] = 6] = "WrappedLineStart";
    Direction5[Direction5["WrappedLineFirstNonWhitespaceCharacter"] = 7] = "WrappedLineFirstNonWhitespaceCharacter";
    Direction5[Direction5["WrappedLineColumnCenter"] = 8] = "WrappedLineColumnCenter";
    Direction5[Direction5["WrappedLineEnd"] = 9] = "WrappedLineEnd";
    Direction5[Direction5["WrappedLineLastNonWhitespaceCharacter"] = 10] = "WrappedLineLastNonWhitespaceCharacter";
    Direction5[Direction5["ViewPortTop"] = 11] = "ViewPortTop";
    Direction5[Direction5["ViewPortCenter"] = 12] = "ViewPortCenter";
    Direction5[Direction5["ViewPortBottom"] = 13] = "ViewPortBottom";
    Direction5[Direction5["ViewPortIfOutside"] = 14] = "ViewPortIfOutside";
  })(Direction4 = CursorMove2.Direction || (CursorMove2.Direction = {}));
  let Unit;
  ((Unit2) => {
    Unit2[Unit2["None"] = 0] = "None";
    Unit2[Unit2["Line"] = 1] = "Line";
    Unit2[Unit2["WrappedLine"] = 2] = "WrappedLine";
    Unit2[Unit2["Character"] = 3] = "Character";
    Unit2[Unit2["HalfLine"] = 4] = "HalfLine";
    Unit2[Unit2["FoldedLine"] = 5] = "FoldedLine";
  })(Unit = CursorMove2.Unit || (CursorMove2.Unit = {}));
})(CursorMove || (CursorMove = {}));
export { CursorMoveCommands, CursorMove };
