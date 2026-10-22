// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/contrib/notebook/common/services/notebookWebWorkerMain.js
// Original module marker: src/vs/editor/common/model.ts



// src/vs/editor/common/model.ts
var FindMatch = class {
  /**
   * @internal
   */
  constructor(range, matches) {
    this._findMatchBrand = void 0;
    this.range = range;
    this.matches = matches;
  }
};

var SearchData = class {
  constructor(regex, wordSeparators, simpleSearch) {
    this.regex = regex;
    this.wordSeparators = wordSeparators;
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
export { FindMatch, SearchData, ApplyEditsResult };
