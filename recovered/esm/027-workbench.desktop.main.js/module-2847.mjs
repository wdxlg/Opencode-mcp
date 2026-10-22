// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchTreeModel/match.ts
import { OneLineRange } from "./module-0999.mjs";
import { Range2 } from "./module-0106.mjs";
import { MATCH_PREFIX } from "./module-2545.mjs";
import { lcut } from "./module-0030.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { memoize } from "./module-0250.mjs";


// src/vs/workbench/contrib/search/browser/searchTreeModel/match.ts
function textSearchResultToMatches(rawMatch, fileMatch, isAiContributed) {
  const previewLines = rawMatch.previewText.split("\n");
  return rawMatch.rangeLocations.map((rangeLocation) => {
    const previewRange = rangeLocation.preview;
    return new MatchImpl(fileMatch, previewLines, previewRange, rangeLocation.source, isAiContributed);
  });
}

var _MatchImpl = class _MatchImpl {
  constructor(_parent, _fullPreviewLines, _fullPreviewRange, _documentRange, _isReadonly = false) {
    this._parent = _parent;
    this._fullPreviewLines = _fullPreviewLines;
    this._isReadonly = _isReadonly;
    this._oneLinePreviewText = _fullPreviewLines[_fullPreviewRange.startLineNumber];
    const adjustedEndCol = _fullPreviewRange.startLineNumber === _fullPreviewRange.endLineNumber ? _fullPreviewRange.endColumn : this._oneLinePreviewText.length;
    this._rangeInPreviewText = new OneLineRange(1, _fullPreviewRange.startColumn + 1, adjustedEndCol + 1);
    this._range = new Range2(
      _documentRange.startLineNumber + 1,
      _documentRange.startColumn + 1,
      _documentRange.endLineNumber + 1,
      _documentRange.endColumn + 1
    );
    this._fullPreviewRange = _fullPreviewRange;
    this._id = MATCH_PREFIX + this._parent.resource.toString() + ">" + this._range + this.getMatchString();
  }
  static {
    this.MAX_PREVIEW_CHARS = 250;
  }
  id() {
    return this._id;
  }
  parent() {
    return this._parent;
  }
  text() {
    return this._oneLinePreviewText;
  }
  range() {
    return this._range;
  }
  preview() {
    const fullBefore = this._oneLinePreviewText.substring(0, this._rangeInPreviewText.startColumn - 1), before = lcut(fullBefore, 26, "\u2026");
    let inside = this.getMatchString(), after2 = this._oneLinePreviewText.substring(this._rangeInPreviewText.endColumn - 1);
    let charsRemaining = _MatchImpl.MAX_PREVIEW_CHARS - before.length;
    inside = inside.substr(0, charsRemaining);
    charsRemaining -= inside.length;
    after2 = after2.substr(0, charsRemaining);
    return {
      before,
      fullBefore,
      inside,
      after: after2
    };
  }
  get replaceString() {
    const searchModel = this.parent().parent().searchModel;
    if (!searchModel.replacePattern) {
      throw new Error("searchModel.replacePattern must be set before accessing replaceString");
    }
    const fullMatchText = this.fullMatchText();
    let replaceString = searchModel.replacePattern.getReplaceString(fullMatchText, searchModel.preserveCase);
    if (replaceString !== null) {
      return replaceString;
    }
    const fullMatchTextWithoutCR = fullMatchText.replace(/\r\n/g, "\n");
    if (fullMatchTextWithoutCR !== fullMatchText) {
      replaceString = searchModel.replacePattern.getReplaceString(fullMatchTextWithoutCR, searchModel.preserveCase);
      if (replaceString !== null) {
        return replaceString;
      }
    }
    const contextMatchTextWithSurroundingContent = this.fullMatchText(true);
    replaceString = searchModel.replacePattern.getReplaceString(contextMatchTextWithSurroundingContent, searchModel.preserveCase);
    if (replaceString !== null) {
      return replaceString;
    }
    const contextMatchTextWithoutCR = contextMatchTextWithSurroundingContent.replace(/\r\n/g, "\n");
    if (contextMatchTextWithoutCR !== contextMatchTextWithSurroundingContent) {
      replaceString = searchModel.replacePattern.getReplaceString(contextMatchTextWithoutCR, searchModel.preserveCase);
      if (replaceString !== null) {
        return replaceString;
      }
    }
    return searchModel.replacePattern.pattern;
  }
  fullMatchText(includeSurrounding = false) {
    let thisMatchPreviewLines;
    if (includeSurrounding) {
      thisMatchPreviewLines = this._fullPreviewLines;
    } else {
      thisMatchPreviewLines = this._fullPreviewLines.slice(this._fullPreviewRange.startLineNumber, this._fullPreviewRange.endLineNumber + 1);
      thisMatchPreviewLines[thisMatchPreviewLines.length - 1] = thisMatchPreviewLines[thisMatchPreviewLines.length - 1].slice(0, this._fullPreviewRange.endColumn);
      thisMatchPreviewLines[0] = thisMatchPreviewLines[0].slice(this._fullPreviewRange.startColumn);
    }
    return thisMatchPreviewLines.join("\n");
  }
  rangeInPreview() {
    return {
      ...this._fullPreviewRange,
      startColumn: this._fullPreviewRange.startColumn + 1,
      endColumn: this._fullPreviewRange.endColumn + 1
    };
  }
  fullPreviewLines() {
    return this._fullPreviewLines.slice(this._fullPreviewRange.startLineNumber, this._fullPreviewRange.endLineNumber + 1);
  }
  getMatchString() {
    return this._oneLinePreviewText.substring(this._rangeInPreviewText.startColumn - 1, this._rangeInPreviewText.endColumn - 1);
  }
  get isReadonly() {
    return this._isReadonly;
  }
};

__decorateClass([
  memoize
], _MatchImpl.prototype, "preview", 1);

var MatchImpl = _MatchImpl;
export { textSearchResultToMatches, _MatchImpl, MatchImpl };
