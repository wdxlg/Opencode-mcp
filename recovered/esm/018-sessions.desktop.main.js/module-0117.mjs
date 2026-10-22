// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/model.ts
import { equals4 } from "./module-0098.mjs";


// src/vs/editor/common/model.ts
var TextModelResolvedOptions = class {
  /**
   * @internal
   */
  constructor(src) {
    this._textModelResolvedOptionsBrand = void 0;
    this.tabSize = Math.max(1, src.tabSize | 0);
    if (src.indentSize === "tabSize") {
      this.indentSize = this.tabSize;
      this._indentSizeIsTabSize = true;
    } else {
      this.indentSize = Math.max(1, src.indentSize | 0);
      this._indentSizeIsTabSize = false;
    }
    this.insertSpaces = Boolean(src.insertSpaces);
    this.defaultEOL = src.defaultEOL | 0;
    this.trimAutoWhitespace = Boolean(src.trimAutoWhitespace);
    this.bracketPairColorizationOptions = src.bracketPairColorizationOptions;
  }
  get originalIndentSize() {
    return this._indentSizeIsTabSize ? "tabSize" : this.indentSize;
  }
  /**
   * @internal
   */
  equals(other) {
    return this.tabSize === other.tabSize && this._indentSizeIsTabSize === other._indentSizeIsTabSize && this.indentSize === other.indentSize && this.insertSpaces === other.insertSpaces && this.defaultEOL === other.defaultEOL && this.trimAutoWhitespace === other.trimAutoWhitespace && equals4(this.bracketPairColorizationOptions, other.bracketPairColorizationOptions);
  }
  /**
   * @internal
   */
  createChangeEvent(newOpts) {
    return {
      tabSize: this.tabSize !== newOpts.tabSize,
      indentSize: this.indentSize !== newOpts.indentSize,
      insertSpaces: this.insertSpaces !== newOpts.insertSpaces,
      trimAutoWhitespace: this.trimAutoWhitespace !== newOpts.trimAutoWhitespace
    };
  }
};

var FindMatch = class {
  /**
   * @internal
   */
  constructor(range2, matches2) {
    this._findMatchBrand = void 0;
    this.range = range2;
    this.matches = matches2;
  }
};

function isITextSnapshot(obj) {
  return !!obj && typeof obj.read === "function";
}

function isITextModel(obj) {
  return Boolean(obj && obj.uri);
}

var ValidAnnotatedEditOperation = class {
  constructor(identifier2, range2, text2, forceMoveMarkers, isAutoWhitespaceEdit, _isTracked) {
    this.identifier = identifier2;
    this.range = range2;
    this.text = text2;
    this.forceMoveMarkers = forceMoveMarkers;
    this.isAutoWhitespaceEdit = isAutoWhitespaceEdit;
    this._isTracked = _isTracked;
  }
};

var SearchData = class {
  constructor(regex, wordSeparators2, simpleSearch) {
    this.regex = regex;
    this.wordSeparators = wordSeparators2;
    this.simpleSearch = simpleSearch;
  }
};

var ApplyEditsResult = class {
  constructor(reverseEdits, changes, trimAutoWhitespaceLineNumbers) {
    this.reverseEdits = reverseEdits;
    this.changes = changes;
    this.trimAutoWhitespaceLineNumbers = trimAutoWhitespaceLineNumbers;
  }
};

function shouldSynchronizeModel(model) {
  return !model.isTooLargeForSyncing() && !model.isForSimpleWidget;
}
export { isITextSnapshot, isITextModel, shouldSynchronizeModel, TextModelResolvedOptions, FindMatch, ValidAnnotatedEditOperation, SearchData, ApplyEditsResult };
