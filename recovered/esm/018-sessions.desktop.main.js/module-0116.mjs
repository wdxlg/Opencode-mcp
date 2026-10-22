// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/cursor/cursorAtomicMoveOperations.ts
import { CursorColumns } from "./module-0110.mjs";


// src/vs/editor/common/cursor/cursorAtomicMoveOperations.ts
var AtomicTabMoveOperations = class _AtomicTabMoveOperations {
  /**
   * Get the visible column at the position. If we get to a non-whitespace character first
   * or past the end of string then return -1.
   *
   * **Note** `position` and the return value are 0-based.
   */
  static whitespaceVisibleColumn(lineContent, position2, tabSize) {
    const lineLength = lineContent.length;
    let visibleColumn = 0;
    let prevTabStopPosition = -1;
    let prevTabStopVisibleColumn = -1;
    for (let i2 = 0; i2 < lineLength; i2++) {
      if (i2 === position2) {
        return [prevTabStopPosition, prevTabStopVisibleColumn, visibleColumn];
      }
      if (visibleColumn % tabSize === 0) {
        prevTabStopPosition = i2;
        prevTabStopVisibleColumn = visibleColumn;
      }
      const chCode = lineContent.charCodeAt(i2);
      switch (chCode) {
        case 32 /* Space */:
          visibleColumn += 1;
          break;
        case 9 /* Tab */:
          visibleColumn = CursorColumns.nextRenderTabStop(visibleColumn, tabSize);
          break;
        default:
          return [-1, -1, -1];
      }
    }
    if (position2 === lineLength) {
      return [prevTabStopPosition, prevTabStopVisibleColumn, visibleColumn];
    }
    return [-1, -1, -1];
  }
  /**
   * Return the position that should result from a move left, right or to the
   * nearest tab, if atomic tabs are enabled. Left and right are used for the
   * arrow key movements, nearest is used for mouse selection. It returns
   * -1 if atomic tabs are not relevant and you should fall back to normal
   * behaviour.
   *
   * **Note**: `position` and the return value are 0-based.
   */
  static atomicPosition(lineContent, position2, tabSize, direction) {
    const lineLength = lineContent.length;
    const [prevTabStopPosition, prevTabStopVisibleColumn, visibleColumn] = _AtomicTabMoveOperations.whitespaceVisibleColumn(lineContent, position2, tabSize);
    if (visibleColumn === -1) {
      return -1;
    }
    let left;
    switch (direction) {
      case 0 /* Left */:
        left = true;
        break;
      case 1 /* Right */:
        left = false;
        break;
      case 2 /* Nearest */:
        if (visibleColumn % tabSize === 0) {
          return position2;
        }
        left = visibleColumn % tabSize <= tabSize / 2;
        break;
    }
    if (left) {
      if (prevTabStopPosition === -1) {
        return -1;
      }
      let currentVisibleColumn2 = prevTabStopVisibleColumn;
      for (let i2 = prevTabStopPosition; i2 < lineLength; ++i2) {
        if (currentVisibleColumn2 === prevTabStopVisibleColumn + tabSize) {
          return prevTabStopPosition;
        }
        const chCode = lineContent.charCodeAt(i2);
        switch (chCode) {
          case 32 /* Space */:
            currentVisibleColumn2 += 1;
            break;
          case 9 /* Tab */:
            currentVisibleColumn2 = CursorColumns.nextRenderTabStop(currentVisibleColumn2, tabSize);
            break;
          default:
            return -1;
        }
      }
      if (currentVisibleColumn2 === prevTabStopVisibleColumn + tabSize) {
        return prevTabStopPosition;
      }
      return -1;
    }
    const targetVisibleColumn = CursorColumns.nextRenderTabStop(visibleColumn, tabSize);
    let currentVisibleColumn = visibleColumn;
    for (let i2 = position2; i2 < lineLength; i2++) {
      if (currentVisibleColumn === targetVisibleColumn) {
        return i2;
      }
      const chCode = lineContent.charCodeAt(i2);
      switch (chCode) {
        case 32 /* Space */:
          currentVisibleColumn += 1;
          break;
        case 9 /* Tab */:
          currentVisibleColumn = CursorColumns.nextRenderTabStop(currentVisibleColumn, tabSize);
          break;
        default:
          return -1;
      }
    }
    if (currentVisibleColumn === targetVisibleColumn) {
      return lineLength;
    }
    return -1;
  }
};
export { AtomicTabMoveOperations };
