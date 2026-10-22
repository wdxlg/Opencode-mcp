// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/languages/supports/onEnter.ts
import { escapeRegExpCharacters } from "./module-0030.mjs";
import { onUnexpectedError } from "./module-0004.mjs";


// src/vs/editor/common/languages/supports/onEnter.ts
var OnEnterSupport = class _OnEnterSupport {
  constructor(opts) {
    opts = opts || {};
    opts.brackets = opts.brackets || [
      ["(", ")"],
      ["{", "}"],
      ["[", "]"]
    ];
    this._brackets = [];
    opts.brackets.forEach((bracket) => {
      const openRegExp = _OnEnterSupport._createOpenBracketRegExp(bracket[0]);
      const closeRegExp = _OnEnterSupport._createCloseBracketRegExp(bracket[1]);
      if (openRegExp && closeRegExp) {
        this._brackets.push({
          open: bracket[0],
          openRegExp,
          close: bracket[1],
          closeRegExp
        });
      }
    });
    this._regExpRules = opts.onEnterRules || [];
  }
  onEnter(autoIndent, previousLineText, beforeEnterText, afterEnterText) {
    if (autoIndent >= 3 /* Advanced */) {
      for (let i2 = 0, len = this._regExpRules.length; i2 < len; i2++) {
        const rule = this._regExpRules[i2];
        const regResult = [{
          reg: rule.beforeText,
          text: beforeEnterText
        }, {
          reg: rule.afterText,
          text: afterEnterText
        }, {
          reg: rule.previousLineText,
          text: previousLineText
        }].every((obj) => {
          if (!obj.reg) {
            return true;
          }
          obj.reg.lastIndex = 0;
          return obj.reg.test(obj.text);
        });
        if (regResult) {
          return rule.action;
        }
      }
    }
    if (autoIndent >= 2 /* Brackets */) {
      if (beforeEnterText.length > 0 && afterEnterText.length > 0) {
        for (let i2 = 0, len = this._brackets.length; i2 < len; i2++) {
          const bracket = this._brackets[i2];
          if (bracket.openRegExp.test(beforeEnterText) && bracket.closeRegExp.test(afterEnterText)) {
            return { indentAction: 2 /* IndentOutdent */ };
          }
        }
      }
    }
    if (autoIndent >= 2 /* Brackets */) {
      if (beforeEnterText.length > 0) {
        for (let i2 = 0, len = this._brackets.length; i2 < len; i2++) {
          const bracket = this._brackets[i2];
          if (bracket.openRegExp.test(beforeEnterText)) {
            return { indentAction: 1 /* Indent */ };
          }
        }
      }
    }
    return null;
  }
  static _createOpenBracketRegExp(bracket) {
    let str = escapeRegExpCharacters(bracket);
    if (!/\B/.test(str.charAt(0))) {
      str = "\\b" + str;
    }
    str += "\\s*$";
    return _OnEnterSupport._safeRegExp(str);
  }
  static _createCloseBracketRegExp(bracket) {
    let str = escapeRegExpCharacters(bracket);
    if (!/\B/.test(str.charAt(str.length - 1))) {
      str = str + "\\b";
    }
    str = "^\\s*" + str;
    return _OnEnterSupport._safeRegExp(str);
  }
  static _safeRegExp(def2) {
    try {
      return new RegExp(def2);
    } catch (err) {
      onUnexpectedError(err);
      return null;
    }
  }
};
export { OnEnterSupport };
