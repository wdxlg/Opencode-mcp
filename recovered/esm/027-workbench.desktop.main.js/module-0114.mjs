// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/cursor/cursorColumnSelection.ts
import { Position } from "./module-0079.mjs";
import { SingleCursorState } from "./module-0113.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/common/cursor/cursorColumnSelection.ts
var ColumnSelection = class _ColumnSelection {
  static columnSelect(config, model, fromLineNumber, fromVisibleColumn, toLineNumber, toVisibleColumn) {
    const lineCount = Math.abs(toLineNumber - fromLineNumber) + 1;
    const reversed = fromLineNumber > toLineNumber;
    const isRTL = fromVisibleColumn > toVisibleColumn;
    const isLTR = fromVisibleColumn < toVisibleColumn;
    const result = [];
    for (let i2 = 0; i2 < lineCount; i2++) {
      const lineNumber = fromLineNumber + (reversed ? -i2 : i2);
      const startColumn = config.columnFromVisibleColumn(model, lineNumber, fromVisibleColumn);
      const endColumn = config.columnFromVisibleColumn(model, lineNumber, toVisibleColumn);
      const visibleStartColumn = config.visibleColumnFromColumn(model, new Position(lineNumber, startColumn));
      const visibleEndColumn = config.visibleColumnFromColumn(model, new Position(lineNumber, endColumn));
      if (isLTR) {
        if (visibleStartColumn > toVisibleColumn) {
          continue;
        }
        if (visibleEndColumn < fromVisibleColumn) {
          continue;
        }
      }
      if (isRTL) {
        if (visibleEndColumn > fromVisibleColumn) {
          continue;
        }
        if (visibleStartColumn < toVisibleColumn) {
          continue;
        }
      }
      result.push(new SingleCursorState(
        new Range2(lineNumber, startColumn, lineNumber, startColumn),
        0 /* Simple */,
        0,
        new Position(lineNumber, endColumn),
        0
      ));
    }
    if (result.length === 0) {
      for (let i2 = 0; i2 < lineCount; i2++) {
        const lineNumber = fromLineNumber + (reversed ? -i2 : i2);
        const maxColumn = model.getLineMaxColumn(lineNumber);
        result.push(new SingleCursorState(
          new Range2(lineNumber, maxColumn, lineNumber, maxColumn),
          0 /* Simple */,
          0,
          new Position(lineNumber, maxColumn),
          0
        ));
      }
    }
    return {
      viewStates: result,
      reversed,
      fromLineNumber,
      fromVisualColumn: fromVisibleColumn,
      toLineNumber,
      toVisualColumn: toVisibleColumn
    };
  }
  static columnSelectLeft(config, model, prevColumnSelectData) {
    let toViewVisualColumn = prevColumnSelectData.toViewVisualColumn;
    if (toViewVisualColumn > 0) {
      toViewVisualColumn--;
    }
    return _ColumnSelection.columnSelect(config, model, prevColumnSelectData.fromViewLineNumber, prevColumnSelectData.fromViewVisualColumn, prevColumnSelectData.toViewLineNumber, toViewVisualColumn);
  }
  static columnSelectRight(config, model, prevColumnSelectData) {
    let maxVisualViewColumn = 0;
    const minViewLineNumber = Math.min(prevColumnSelectData.fromViewLineNumber, prevColumnSelectData.toViewLineNumber);
    const maxViewLineNumber = Math.max(prevColumnSelectData.fromViewLineNumber, prevColumnSelectData.toViewLineNumber);
    for (let lineNumber = minViewLineNumber; lineNumber <= maxViewLineNumber; lineNumber++) {
      const lineMaxViewColumn = model.getLineMaxColumn(lineNumber);
      const lineMaxVisualViewColumn = config.visibleColumnFromColumn(model, new Position(lineNumber, lineMaxViewColumn));
      maxVisualViewColumn = Math.max(maxVisualViewColumn, lineMaxVisualViewColumn);
    }
    let toViewVisualColumn = prevColumnSelectData.toViewVisualColumn;
    if (toViewVisualColumn < maxVisualViewColumn) {
      toViewVisualColumn++;
    }
    return this.columnSelect(config, model, prevColumnSelectData.fromViewLineNumber, prevColumnSelectData.fromViewVisualColumn, prevColumnSelectData.toViewLineNumber, toViewVisualColumn);
  }
  static columnSelectUp(config, model, prevColumnSelectData, isPaged) {
    const linesCount = isPaged ? config.pageSize : 1;
    const toViewLineNumber = Math.max(1, prevColumnSelectData.toViewLineNumber - linesCount);
    return this.columnSelect(config, model, prevColumnSelectData.fromViewLineNumber, prevColumnSelectData.fromViewVisualColumn, toViewLineNumber, prevColumnSelectData.toViewVisualColumn);
  }
  static columnSelectDown(config, model, prevColumnSelectData, isPaged) {
    const linesCount = isPaged ? config.pageSize : 1;
    const toViewLineNumber = Math.min(model.getLineCount(), prevColumnSelectData.toViewLineNumber + linesCount);
    return this.columnSelect(config, model, prevColumnSelectData.fromViewLineNumber, prevColumnSelectData.fromViewVisualColumn, toViewLineNumber, prevColumnSelectData.toViewVisualColumn);
  }
};
export { ColumnSelection };
