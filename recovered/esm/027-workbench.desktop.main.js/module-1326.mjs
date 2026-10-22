// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/comments/browser/commentsFilterOptions.ts
import { ltrim } from "./module-0030.mjs";
import { matchesFuzzy, matchesFuzzy2 } from "./module-0453.mjs";


// src/vs/workbench/contrib/comments/browser/commentsFilterOptions.ts
var FilterOptions = class {
  constructor(filter2, showResolved, showUnresolved) {
    this.filter = filter2;
    this.showResolved = true;
    this.showUnresolved = true;
    filter2 = filter2.trim();
    this.showResolved = showResolved;
    this.showUnresolved = showUnresolved;
    const negate = filter2.startsWith("!");
    this.textFilter = { text: (negate ? ltrim(filter2, "!") : filter2).trim(), negate };
  }
  static {
    this._filter = matchesFuzzy2;
  }
  static {
    this._messageFilter = matchesFuzzy;
  }
};
export { FilterOptions };
