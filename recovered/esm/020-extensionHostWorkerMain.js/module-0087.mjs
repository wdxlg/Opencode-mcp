// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/editor/common/model.ts



// src/vs/editor/common/model.ts
var OverviewRulerLane = /* @__PURE__ */ ((OverviewRulerLane2) => {
  OverviewRulerLane2[OverviewRulerLane2["Left"] = 1] = "Left";
  OverviewRulerLane2[OverviewRulerLane2["Center"] = 2] = "Center";
  OverviewRulerLane2[OverviewRulerLane2["Right"] = 4] = "Right";
  OverviewRulerLane2[OverviewRulerLane2["Full"] = 7] = "Full";
  return OverviewRulerLane2;
})(OverviewRulerLane || {});

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
export { OverviewRulerLane, FindMatch, SearchData, ApplyEditsResult };
