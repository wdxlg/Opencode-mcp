// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/services/search/common/searchExtTypes.ts



// src/vs/workbench/services/search/common/searchExtTypes.ts
var Position4 = class _Position {
  constructor(line, character) {
    this.line = line;
    this.character = character;
  }
  isBefore(other) {
    return false;
  }
  isBeforeOrEqual(other) {
    return false;
  }
  isAfter(other) {
    return false;
  }
  isAfterOrEqual(other) {
    return false;
  }
  isEqual(other) {
    return false;
  }
  compareTo(other) {
    return 0;
  }
  translate(_, _2) {
    return new _Position(0, 0);
  }
  with(_) {
    return new _Position(0, 0);
  }
};

var Range4 = class _Range {
  constructor(startLine, startCol, endLine, endCol) {
    this.isEmpty = false;
    this.isSingleLine = false;
    this.start = new Position4(startLine, startCol);
    this.end = new Position4(endLine, endCol);
  }
  contains(positionOrRange) {
    return false;
  }
  isEqual(other) {
    return false;
  }
  intersection(range) {
    return void 0;
  }
  union(other) {
    return new _Range(0, 0, 0, 0);
  }
  with(_) {
    return new _Range(0, 0, 0, 0);
  }
};

var TextSearchMatch2 = class {
  /**
   * @param uri The uri for the matching document.
   * @param ranges The ranges associated with this match.
   * @param previewText The text that is used to preview the match. The highlighted range in `previewText` is specified in `ranges`.
   */
  constructor(uri2, ranges, previewText) {
    this.uri = uri2;
    this.ranges = ranges;
    this.previewText = previewText;
  }
};

var TextSearchContext2 = class {
  /**
   * @param uri The uri for the matching document.
   * @param text The line of context text.
   * @param lineNumber The line number of this line of context.
   */
  constructor(uri2, text, lineNumber) {
    this.uri = uri2;
    this.text = text;
    this.lineNumber = lineNumber;
  }
};

var AISearchKeyword = class {
  /**
   * @param keyword The keyword associated with the search.
   */
  constructor(keyword) {
    this.keyword = keyword;
  }
};

var ExcludeSettingOptions = /* @__PURE__ */ ((ExcludeSettingOptions2) => {
  ExcludeSettingOptions2[ExcludeSettingOptions2["None"] = 1] = "None";
  ExcludeSettingOptions2[ExcludeSettingOptions2["FilesExclude"] = 2] = "FilesExclude";
  ExcludeSettingOptions2[ExcludeSettingOptions2["SearchAndFilesExclude"] = 3] = "SearchAndFilesExclude";
  return ExcludeSettingOptions2;
})(ExcludeSettingOptions || {});

var TextSearchCompleteMessageType = /* @__PURE__ */ ((TextSearchCompleteMessageType2) => {
  TextSearchCompleteMessageType2[TextSearchCompleteMessageType2["Information"] = 1] = "Information";
  TextSearchCompleteMessageType2[TextSearchCompleteMessageType2["Warning"] = 2] = "Warning";
  return TextSearchCompleteMessageType2;
})(TextSearchCompleteMessageType || {});
export { Position4, Range4, TextSearchMatch2, TextSearchContext2, AISearchKeyword, ExcludeSettingOptions, TextSearchCompleteMessageType };
