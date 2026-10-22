// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/core/cursorColumns.ts
import { CodePointIterator, GraphemeIterator, getNextCodePoint, isEmojiImprecise, isFullWidthCharacter } from "./module-0030.mjs";


// src/vs/editor/common/core/cursorColumns.ts
var CursorColumns = class _CursorColumns {
  static _nextVisibleColumn(codePoint, visibleColumn, tabSize) {
    if (codePoint === 9 /* Tab */) {
      return _CursorColumns.nextRenderTabStop(visibleColumn, tabSize);
    }
    if (isFullWidthCharacter(codePoint) || isEmojiImprecise(codePoint)) {
      return visibleColumn + 2;
    }
    return visibleColumn + 1;
  }
  /**
   * Returns a visible column from a column.
   * @see {@link CursorColumns}
   */
  static visibleColumnFromColumn(lineContent, column, tabSize) {
    const textLen = Math.min(column - 1, lineContent.length);
    const text2 = lineContent.substring(0, textLen);
    const iterator = new GraphemeIterator(text2);
    let result = 0;
    while (!iterator.eol()) {
      const codePoint = getNextCodePoint(text2, textLen, iterator.offset);
      iterator.nextGraphemeLength();
      result = this._nextVisibleColumn(codePoint, result, tabSize);
    }
    return result;
  }
  /**
   * Returns the value to display as "Col" in the status bar.
   * @see {@link CursorColumns}
   */
  static toStatusbarColumn(lineContent, column, tabSize) {
    const text2 = lineContent.substring(0, Math.min(column - 1, lineContent.length));
    const iterator = new CodePointIterator(text2);
    let result = 0;
    while (!iterator.eol()) {
      const codePoint = iterator.nextCodePoint();
      if (codePoint === 9 /* Tab */) {
        result = _CursorColumns.nextRenderTabStop(result, tabSize);
      } else {
        result = result + 1;
      }
    }
    return result + 1;
  }
  /**
   * Returns a column from a visible column.
   * @see {@link CursorColumns}
   */
  static columnFromVisibleColumn(lineContent, visibleColumn, tabSize) {
    if (visibleColumn <= 0) {
      return 1;
    }
    const lineContentLength = lineContent.length;
    const iterator = new GraphemeIterator(lineContent);
    let beforeVisibleColumn = 0;
    let beforeColumn = 1;
    while (!iterator.eol()) {
      const codePoint = getNextCodePoint(lineContent, lineContentLength, iterator.offset);
      iterator.nextGraphemeLength();
      const afterVisibleColumn = this._nextVisibleColumn(codePoint, beforeVisibleColumn, tabSize);
      const afterColumn = iterator.offset + 1;
      if (afterVisibleColumn >= visibleColumn) {
        const beforeDelta = visibleColumn - beforeVisibleColumn;
        const afterDelta = afterVisibleColumn - visibleColumn;
        if (afterDelta < beforeDelta) {
          return afterColumn;
        } else {
          return beforeColumn;
        }
      }
      beforeVisibleColumn = afterVisibleColumn;
      beforeColumn = afterColumn;
    }
    return lineContentLength + 1;
  }
  /**
   * ATTENTION: This works with 0-based columns (as opposed to the regular 1-based columns)
   * @see {@link CursorColumns}
   */
  static nextRenderTabStop(visibleColumn, tabSize) {
    return visibleColumn + tabSize - visibleColumn % tabSize;
  }
  /**
   * ATTENTION: This works with 0-based columns (as opposed to the regular 1-based columns)
   * @see {@link CursorColumns}
   */
  static nextIndentTabStop(visibleColumn, indentSize) {
    return _CursorColumns.nextRenderTabStop(visibleColumn, indentSize);
  }
  /**
   * ATTENTION: This works with 0-based columns (as opposed to the regular 1-based columns)
   * @see {@link CursorColumns}
   */
  static prevRenderTabStop(column, tabSize) {
    return Math.max(0, column - 1 - (column - 1) % tabSize);
  }
  /**
   * ATTENTION: This works with 0-based columns (as opposed to the regular 1-based columns)
   * @see {@link CursorColumns}
   */
  static prevIndentTabStop(column, indentSize) {
    return _CursorColumns.prevRenderTabStop(column, indentSize);
  }
};
export { CursorColumns };
