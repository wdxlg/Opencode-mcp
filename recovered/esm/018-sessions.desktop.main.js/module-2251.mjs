// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/textMate/common/TMHelper.ts



// src/vs/workbench/services/textMate/common/TMHelper.ts
function findMatchingThemeRule(theme, scopes, onlyColorRules = true) {
  for (let i2 = scopes.length - 1; i2 >= 0; i2--) {
    const parentScopes = scopes.slice(0, i2);
    const scope = scopes[i2];
    const r2 = findMatchingThemeRule2(theme, scope, parentScopes, onlyColorRules);
    if (r2) {
      return r2;
    }
  }
  return null;
}

function findMatchingThemeRule2(theme, scope, parentScopes, onlyColorRules) {
  let result = null;
  for (let i2 = theme.tokenColors.length - 1; i2 >= 0; i2--) {
    const rule = theme.tokenColors[i2];
    if (onlyColorRules && !rule.settings.foreground) {
      continue;
    }
    let selectors;
    if (typeof rule.scope === "string") {
      selectors = rule.scope.split(/,/).map((scope2) => scope2.trim());
    } else if (Array.isArray(rule.scope)) {
      selectors = rule.scope;
    } else {
      continue;
    }
    for (let j = 0, lenJ = selectors.length; j < lenJ; j++) {
      const rawSelector = selectors[j];
      const themeRule = new ThemeRule(rawSelector, rule.settings);
      if (themeRule.matches(scope, parentScopes)) {
        if (themeRule.isMoreSpecific(result)) {
          result = themeRule;
        }
      }
    }
  }
  return result;
}

var ThemeRule = class _ThemeRule {
  constructor(rawSelector, settings) {
    this.rawSelector = rawSelector;
    this.settings = settings;
    const rawSelectorPieces = this.rawSelector.split(/ /);
    this.scope = rawSelectorPieces[rawSelectorPieces.length - 1];
    this.parentScopes = rawSelectorPieces.slice(0, rawSelectorPieces.length - 1);
  }
  matches(scope, parentScopes) {
    return _ThemeRule._matches(this.scope, this.parentScopes, scope, parentScopes);
  }
  static _cmp(a, b) {
    if (a === null && b === null) {
      return 0;
    }
    if (a === null) {
      return -1;
    }
    if (b === null) {
      return 1;
    }
    if (a.scope.length !== b.scope.length) {
      return a.scope.length - b.scope.length;
    }
    const aParentScopesLen = a.parentScopes.length;
    const bParentScopesLen = b.parentScopes.length;
    if (aParentScopesLen !== bParentScopesLen) {
      return aParentScopesLen - bParentScopesLen;
    }
    for (let i2 = 0; i2 < aParentScopesLen; i2++) {
      const aLen = a.parentScopes[i2].length;
      const bLen = b.parentScopes[i2].length;
      if (aLen !== bLen) {
        return aLen - bLen;
      }
    }
    return 0;
  }
  isMoreSpecific(other) {
    return _ThemeRule._cmp(this, other) > 0;
  }
  static _matchesOne(selectorScope, scope) {
    const selectorPrefix = selectorScope + ".";
    if (selectorScope === scope || scope.substring(0, selectorPrefix.length) === selectorPrefix) {
      return true;
    }
    return false;
  }
  static _matches(selectorScope, selectorParentScopes, scope, parentScopes) {
    if (!this._matchesOne(selectorScope, scope)) {
      return false;
    }
    let selectorParentIndex = selectorParentScopes.length - 1;
    let parentIndex = parentScopes.length - 1;
    while (selectorParentIndex >= 0 && parentIndex >= 0) {
      if (this._matchesOne(selectorParentScopes[selectorParentIndex], parentScopes[parentIndex])) {
        selectorParentIndex--;
      }
      parentIndex--;
    }
    if (selectorParentIndex === -1) {
      return true;
    }
    return false;
  }
};
export { findMatchingThemeRule, findMatchingThemeRule2, ThemeRule };
