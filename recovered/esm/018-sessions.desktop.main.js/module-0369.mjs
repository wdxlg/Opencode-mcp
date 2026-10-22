// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/textModelEvents.ts
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/common/textModelEvents.ts
function deserializeFontTokenOptions() {
  return (annotation) => {
    return {
      fontFamily: annotation.fontFamily ? String(annotation.fontFamily) : void 0,
      fontSizeMultiplier: annotation.fontSizeMultiplier ? Number(annotation.fontSizeMultiplier) : void 0,
      lineHeightMultiplier: annotation.lineHeightMultiplier ? Number(annotation.lineHeightMultiplier) : void 0
    };
  };
}

var ModelRawFlush = class {
  constructor() {
    this.changeType = 1 /* Flush */;
  }
};

function occupiesHorizontalSpace(options3) {
  return options3.content.length > 0 || options3.widthInEm !== void 0 && options3.widthInEm > 0;
}

var LineInjectedText = class _LineInjectedText {
  constructor(ownerId2, lineNumber, column, options3, order) {
    this.ownerId = ownerId2;
    this.lineNumber = lineNumber;
    this.column = column;
    this.options = options3;
    this.order = order;
  }
  static applyInjectedText(lineText, injectedTexts) {
    if (!injectedTexts || injectedTexts.length === 0) {
      return lineText;
    }
    let result = "";
    let lastOriginalOffset = 0;
    for (const injectedText of injectedTexts) {
      result += lineText.substring(lastOriginalOffset, injectedText.column - 1);
      lastOriginalOffset = injectedText.column - 1;
      result += injectedText.options.content;
    }
    result += lineText.substring(lastOriginalOffset);
    return result;
  }
  static fromDecorations(decorations) {
    const result = [];
    for (const decoration3 of decorations) {
      if (decoration3.options.before && occupiesHorizontalSpace(decoration3.options.before)) {
        result.push(new _LineInjectedText(
          decoration3.ownerId,
          decoration3.range.startLineNumber,
          decoration3.range.startColumn,
          decoration3.options.before,
          0
        ));
      }
      if (decoration3.options.after && occupiesHorizontalSpace(decoration3.options.after)) {
        result.push(new _LineInjectedText(
          decoration3.ownerId,
          decoration3.range.endLineNumber,
          decoration3.range.endColumn,
          decoration3.options.after,
          1
        ));
      }
    }
    result.sort((a, b) => {
      if (a.lineNumber === b.lineNumber) {
        if (a.column === b.column) {
          return a.order - b.order;
        }
        return a.column - b.column;
      }
      return a.lineNumber - b.lineNumber;
    });
    return result;
  }
  /**
   * The ranges of `applyInjectedText(...)` that are rendered at a fixed width. Width-only injected
   * text produces an empty range (`startOffset === endOffset`) which reserves horizontal space
   * without covering any character.
   *
   * `injectedTexts` must be sorted by column, which is what `fromDecorations` produces and what
   * `applyInjectedText` already requires. The result is then sorted by `startOffset` and never
   * overlaps: injections at the same column are laid out one after the other, so only an injection
   * with empty content leaves the next one starting at the same offset.
   */
  static getFixedWidthInjectedTextRanges(injectedTexts) {
    const result = [];
    let injectedTextLength = 0;
    for (const injectedText of injectedTexts ?? []) {
      const length = injectedText.options.content.length;
      const startOffset = injectedText.column - 1 + injectedTextLength;
      const endOffset = startOffset + length;
      const widthInEm = injectedText.options.widthInEm;
      if (widthInEm !== void 0) {
        result.push({ startOffset, endOffset, widthInEm });
      }
      injectedTextLength += length;
    }
    return result;
  }
  withText(text2) {
    return new _LineInjectedText(this.ownerId, this.lineNumber, this.column, { ...this.options, content: text2 }, this.order);
  }
};

var ModelRawLineChanged = class {
  constructor(lineNumber, lineNumberPostEdit) {
    this.changeType = 2 /* LineChanged */;
    this.lineNumber = lineNumber;
    this.lineNumberPostEdit = lineNumberPostEdit;
  }
};

var ModelLineHeightChanged = class {
  constructor(ownerId2, decorationId, lineNumber, lineHeightMultiplier) {
    this.ownerId = ownerId2;
    this.decorationId = decorationId;
    this.lineNumber = lineNumber;
    this.lineHeightMultiplier = lineHeightMultiplier;
  }
};

var ModelFontChanged = class {
  constructor(ownerId2, lineNumber) {
    this.ownerId = ownerId2;
    this.lineNumber = lineNumber;
  }
};

var ModelRawLinesDeleted = class {
  constructor(fromLineNumber, toLineNumber, lastUntouchedLinePostEdit) {
    this.changeType = 3 /* LinesDeleted */;
    this.fromLineNumber = fromLineNumber;
    this.toLineNumber = toLineNumber;
    this.lastUntouchedLinePostEdit = lastUntouchedLinePostEdit;
  }
};

var ModelRawLinesInserted = class {
  constructor(fromLineNumber, fromLineNumberPostEdit, count2) {
    this.changeType = 4 /* LinesInserted */;
    this.fromLineNumber = fromLineNumber;
    this.fromLineNumberPostEdit = fromLineNumberPostEdit;
    this.count = count2;
  }
  /**
   * `toLineNumber` - `fromLineNumber` + 1 denotes the number of lines that were inserted
   */
  get toLineNumber() {
    return this.fromLineNumber + this.count - 1;
  }
  /**
   * The actual end line number of the insertion in the updated buffer.
   */
  get toLineNumberPostEdit() {
    return this.fromLineNumberPostEdit + this.count - 1;
  }
};

var ModelRawEOLChanged = class {
  constructor() {
    this.changeType = 5 /* EOLChanged */;
  }
};

var ModelRawContentChangedEvent = class _ModelRawContentChangedEvent {
  constructor(changes, versionId, isUndoing, isRedoing) {
    this.changes = changes;
    this.versionId = versionId;
    this.isUndoing = isUndoing;
    this.isRedoing = isRedoing;
    this.resultingSelection = null;
  }
  containsEvent(type) {
    for (let i2 = 0, len = this.changes.length; i2 < len; i2++) {
      const change = this.changes[i2];
      if (change.changeType === type) {
        return true;
      }
    }
    return false;
  }
  static merge(a, b) {
    const changes = [].concat(a.changes).concat(b.changes);
    const versionId = b.versionId;
    const isUndoing = a.isUndoing || b.isUndoing;
    const isRedoing = a.isRedoing || b.isRedoing;
    return new _ModelRawContentChangedEvent(changes, versionId, isUndoing, isRedoing);
  }
};

var ModelInjectedTextChangedEvent = class {
  constructor(changes) {
    this.changes = changes;
  }
};

var ModelLineHeightChangedEvent = class {
  constructor(changes) {
    this.changes = changes;
  }
  affects(rangeOrPosition) {
    if (Range2.isIRange(rangeOrPosition)) {
      for (const change of this.changes) {
        if (change.lineNumber >= rangeOrPosition.startLineNumber && change.lineNumber <= rangeOrPosition.endLineNumber) {
          return true;
        }
      }
      return false;
    } else {
      for (const change of this.changes) {
        if (change.lineNumber === rangeOrPosition.lineNumber) {
          return true;
        }
      }
      return false;
    }
  }
};

var ModelFontChangedEvent = class {
  constructor(changes) {
    this.changes = changes;
  }
};

var InternalModelContentChangeEvent = class _InternalModelContentChangeEvent {
  constructor(rawContentChangedEvent, contentChangedEvent) {
    this.rawContentChangedEvent = rawContentChangedEvent;
    this.contentChangedEvent = contentChangedEvent;
  }
  merge(other) {
    const rawContentChangedEvent = ModelRawContentChangedEvent.merge(this.rawContentChangedEvent, other.rawContentChangedEvent);
    const contentChangedEvent = _InternalModelContentChangeEvent._mergeChangeEvents(this.contentChangedEvent, other.contentChangedEvent);
    return new _InternalModelContentChangeEvent(rawContentChangedEvent, contentChangedEvent);
  }
  static _mergeChangeEvents(a, b) {
    const changes = [].concat(a.changes).concat(b.changes);
    const eol = b.eol;
    const versionId = b.versionId;
    const isUndoing = a.isUndoing || b.isUndoing;
    const isRedoing = a.isRedoing || b.isRedoing;
    const isFlush = a.isFlush || b.isFlush;
    const isEolChange = a.isEolChange && b.isEolChange;
    return {
      changes,
      eol,
      isEolChange,
      versionId,
      isUndoing,
      isRedoing,
      isFlush,
      detailedReasons: a.detailedReasons.concat(b.detailedReasons),
      detailedReasonsChangeLengths: a.detailedReasonsChangeLengths.concat(b.detailedReasonsChangeLengths)
    };
  }
};
export { deserializeFontTokenOptions, occupiesHorizontalSpace, ModelRawFlush, LineInjectedText, ModelRawLineChanged, ModelLineHeightChanged, ModelFontChanged, ModelRawLinesDeleted, ModelRawLinesInserted, ModelRawEOLChanged, ModelRawContentChangedEvent, ModelInjectedTextChangedEvent, ModelLineHeightChangedEvent, ModelFontChangedEvent, InternalModelContentChangeEvent };
