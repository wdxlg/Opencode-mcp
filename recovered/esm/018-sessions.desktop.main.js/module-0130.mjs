// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/languages/supports/indentRules.ts



// src/vs/editor/common/languages/supports/indentRules.ts
function resetGlobalRegex(reg2) {
  if (reg2.global) {
    reg2.lastIndex = 0;
  }
  return true;
}

var IndentRulesSupport = class {
  constructor(indentationRules) {
    this._indentationRules = indentationRules;
  }
  shouldIncrease(text2) {
    if (this._indentationRules) {
      if (this._indentationRules.increaseIndentPattern && resetGlobalRegex(this._indentationRules.increaseIndentPattern) && this._indentationRules.increaseIndentPattern.test(text2)) {
        return true;
      }
    }
    return false;
  }
  shouldDecrease(text2) {
    if (this._indentationRules && this._indentationRules.decreaseIndentPattern && resetGlobalRegex(this._indentationRules.decreaseIndentPattern) && this._indentationRules.decreaseIndentPattern.test(text2)) {
      return true;
    }
    return false;
  }
  shouldIndentNextLine(text2) {
    if (this._indentationRules && this._indentationRules.indentNextLinePattern && resetGlobalRegex(this._indentationRules.indentNextLinePattern) && this._indentationRules.indentNextLinePattern.test(text2)) {
      return true;
    }
    return false;
  }
  shouldIgnore(text2) {
    if (this._indentationRules && this._indentationRules.unIndentedLinePattern && resetGlobalRegex(this._indentationRules.unIndentedLinePattern) && this._indentationRules.unIndentedLinePattern.test(text2)) {
      return true;
    }
    return false;
  }
  getIndentMetadata(text2) {
    let ret = 0;
    if (this.shouldIncrease(text2)) {
      ret += 1 /* INCREASE_MASK */;
    }
    if (this.shouldDecrease(text2)) {
      ret += 2 /* DECREASE_MASK */;
    }
    if (this.shouldIndentNextLine(text2)) {
      ret += 4 /* INDENT_NEXTLINE_MASK */;
    }
    if (this.shouldIgnore(text2)) {
      ret += 8 /* UNINDENT_MASK */;
    }
    return ret;
  }
};
export { resetGlobalRegex, IndentRulesSupport };
