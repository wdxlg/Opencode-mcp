// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/services/search/common/searchExtTypes.ts



// src/vs/workbench/services/search/common/searchExtTypes.ts
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
export { TextSearchMatch2, TextSearchContext2, AISearchKeyword, ExcludeSettingOptions, TextSearchCompleteMessageType };
