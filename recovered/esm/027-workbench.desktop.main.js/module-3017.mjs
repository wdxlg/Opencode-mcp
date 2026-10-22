// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/replFilter.ts
import { matchesFuzzy } from "./module-0453.mjs";
import { splitGlobAware } from "./module-0857.mjs";
import { ReplEvaluationInput, ReplEvaluationResult } from "./module-2400.mjs";
import { Variable3 } from "./module-1064.mjs";


// src/vs/workbench/contrib/debug/browser/replFilter.ts
var ReplFilter = class _ReplFilter {
  constructor() {
    this._parsedQueries = [];
  }
  static {
    this.matchQuery = matchesFuzzy;
  }
  set filterQuery(query) {
    this._parsedQueries = [];
    query = query.trim();
    if (query && query !== "") {
      const filters2 = splitGlobAware(query, ",").map((s) => s.trim()).filter((s) => !!s.length);
      for (const f of filters2) {
        if (f.startsWith("\\")) {
          this._parsedQueries.push({ type: "include", query: f.slice(1) });
        } else if (f.startsWith("!")) {
          this._parsedQueries.push({ type: "exclude", query: f.slice(1) });
        } else {
          this._parsedQueries.push({ type: "include", query: f });
        }
      }
    }
  }
  filter(element, parentVisibility) {
    if (element instanceof ReplEvaluationInput || element instanceof ReplEvaluationResult || element instanceof Variable3) {
      return 1 /* Visible */;
    }
    let includeQueryPresent = false;
    let includeQueryMatched = false;
    const text2 = element.toString(true);
    for (const { type, query } of this._parsedQueries) {
      if (type === "exclude" && _ReplFilter.matchQuery(query, text2)) {
        return false;
      } else if (type === "include") {
        includeQueryPresent = true;
        if (_ReplFilter.matchQuery(query, text2)) {
          includeQueryMatched = true;
        }
      }
    }
    return includeQueryPresent ? includeQueryMatched : typeof parentVisibility !== "undefined" ? parentVisibility : 1 /* Visible */;
  }
};
export { ReplFilter };
