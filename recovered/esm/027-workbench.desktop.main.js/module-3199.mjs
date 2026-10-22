// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/markers/browser/markersFilterOptions.ts
import { getEmptyExpression, parse4, splitGlobAware } from "./module-0857.mjs";
import { TernarySearchTree } from "./module-0268.mjs";
import { relativePath } from "./module-0034.mjs";
import { ltrim, rtrim } from "./module-0030.mjs";
import { matchesFuzzy, matchesFuzzy2 } from "./module-0453.mjs";


// src/vs/workbench/contrib/markers/browser/markersFilterOptions.ts
var SOURCE_FILTER_REGEX = /(!)?@source:("[^"]*"|[^\s,]+)(\s*)/i;

var ResourceGlobMatcher2 = class {
  constructor(globalExpression, rootExpressions, uriIdentityService) {
    this.globalExpression = parse4(globalExpression);
    this.expressionsByRoot = TernarySearchTree.forUris((uri5) => uriIdentityService.extUri.ignorePathCasing(uri5));
    for (const expression of rootExpressions) {
      this.expressionsByRoot.set(expression.root, { root: expression.root, expression: parse4(expression.expression) });
    }
  }
  matches(resource) {
    const rootExpression = this.expressionsByRoot.findSubstr(resource);
    if (rootExpression) {
      const path = relativePath(rootExpression.root, resource);
      if (path && !!rootExpression.expression(path)) {
        return true;
      }
    }
    return !!this.globalExpression(resource.path);
  }
};

var FilterOptions2 = class _FilterOptions {
  constructor(filter2, filesExclude, showWarnings, showErrors, showInfos, uriIdentityService) {
    this.filter = filter2;
    this.showWarnings = false;
    this.showErrors = false;
    this.showInfos = false;
    filter2 = filter2.trim();
    this.showWarnings = showWarnings;
    this.showErrors = showErrors;
    this.showInfos = showInfos;
    const filesExcludeByRoot = Array.isArray(filesExclude) ? filesExclude : [];
    const excludesExpression = Array.isArray(filesExclude) ? getEmptyExpression() : filesExclude;
    for (const { expression } of filesExcludeByRoot) {
      for (const pattern of Object.keys(expression)) {
        if (!pattern.endsWith("/**")) {
          expression[`${rtrim(pattern, "/")}/**`] = expression[pattern];
        }
      }
    }
    const includeSourceFilters = [];
    const excludeSourceFilters = [];
    let sourceMatch;
    while ((sourceMatch = SOURCE_FILTER_REGEX.exec(filter2)) !== null) {
      const negate2 = !!sourceMatch[1];
      let source = sourceMatch[2];
      if (source.startsWith('"') && source.endsWith('"')) {
        source = source.slice(1, -1);
      }
      if (negate2) {
        excludeSourceFilters.push(source.toLowerCase());
      } else {
        includeSourceFilters.push(source.toLowerCase());
      }
      filter2 = (filter2.substring(0, sourceMatch.index) + filter2.substring(sourceMatch.index + sourceMatch[0].length)).trim();
    }
    this.includeSourceFilters = includeSourceFilters;
    this.excludeSourceFilters = excludeSourceFilters;
    const negate = filter2.startsWith("!");
    this.textFilter = { text: (negate ? ltrim(filter2, "!") : filter2).trim(), negate };
    const includeExpression = getEmptyExpression();
    if (filter2) {
      const filters2 = splitGlobAware(filter2, ",").map((s) => s.trim()).filter((s) => !!s.length);
      for (const f of filters2) {
        if (f.startsWith("!")) {
          const filterText = ltrim(f, "!");
          if (filterText) {
            this.setPattern(excludesExpression, filterText);
          }
        } else {
          this.setPattern(includeExpression, f);
        }
      }
    }
    this.excludesMatcher = new ResourceGlobMatcher2(excludesExpression, filesExcludeByRoot, uriIdentityService);
    this.includesMatcher = new ResourceGlobMatcher2(includeExpression, [], uriIdentityService);
  }
  static {
    this._filter = matchesFuzzy2;
  }
  static {
    this._messageFilter = matchesFuzzy;
  }
  static EMPTY(uriIdentityService) {
    return new _FilterOptions("", [], false, false, false, uriIdentityService);
  }
  matchesSourceFilters(markerSource) {
    if (this.includeSourceFilters.length === 0 && this.excludeSourceFilters.length === 0) {
      return true;
    }
    const source = markerSource?.toLowerCase();
    if (source && this.excludeSourceFilters.includes(source)) {
      return false;
    }
    if (this.includeSourceFilters.length > 0) {
      return source ? this.includeSourceFilters.includes(source) : false;
    }
    return true;
  }
  setPattern(expression, pattern) {
    if (pattern[0] === ".") {
      pattern = "*" + pattern;
    }
    expression[`**/${pattern}/**`] = true;
    expression[`**/${pattern}`] = true;
  }
};
export { SOURCE_FILTER_REGEX, ResourceGlobMatcher2, FilterOptions2 };
