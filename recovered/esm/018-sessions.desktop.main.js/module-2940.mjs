// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/search/common/replace.ts
import { createRegExp } from "./module-0030.mjs";
import { buildReplaceStringWithCasePreserved } from "./module-0593.mjs";


// src/vs/workbench/services/search/common/replace.ts
var ReplacePattern2 = class {
  constructor(replaceString, arg2, arg3) {
    this._hasParameters = false;
    this._replacePattern = replaceString;
    let searchPatternInfo;
    let parseParameters;
    if (typeof arg2 === "boolean") {
      parseParameters = arg2;
      this._regExp = arg3;
    } else {
      searchPatternInfo = arg2;
      parseParameters = !!searchPatternInfo.isRegExp;
      this._regExp = createRegExp(searchPatternInfo.pattern, !!searchPatternInfo.isRegExp, { matchCase: searchPatternInfo.isCaseSensitive, wholeWord: searchPatternInfo.isWordMatch, multiline: searchPatternInfo.isMultiline, global: false, unicode: true });
    }
    if (parseParameters) {
      this.parseReplaceString(replaceString);
    }
    if (this._regExp.global) {
      this._regExp = createRegExp(this._regExp.source, true, { matchCase: !this._regExp.ignoreCase, wholeWord: false, multiline: this._regExp.multiline, global: false });
    }
    this._caseOpsRegExp = new RegExp(/([\s\S]*?)((?:\\[uUlL])+?|)(\$[0-9]+)([\s\S]*?)/g);
  }
  get hasParameters() {
    return this._hasParameters;
  }
  get pattern() {
    return this._replacePattern;
  }
  get regExp() {
    return this._regExp;
  }
  /**
  * Returns the replace string for the first match in the given text.
  * If text has no matches then returns null.
  */
  getReplaceString(text2, preserveCase) {
    this._regExp.lastIndex = 0;
    const match2 = this._regExp.exec(text2);
    if (match2) {
      if (this.hasParameters) {
        const replaceString = this.replaceWithCaseOperations(text2, this._regExp, this.buildReplaceString(match2, preserveCase));
        if (match2[0] === text2) {
          return replaceString;
        }
        return replaceString.substr(match2.index, match2[0].length - (text2.length - replaceString.length));
      }
      return this.buildReplaceString(match2, preserveCase);
    }
    return null;
  }
  /**
   * replaceWithCaseOperations applies case operations to relevant replacement strings and applies
   * the affected $N arguments. It then passes unaffected $N arguments through to string.replace().
   *
   * \u			=> upper-cases one character in a match.
   * \U			=> upper-cases ALL remaining characters in a match.
   * \l			=> lower-cases one character in a match.
   * \L			=> lower-cases ALL remaining characters in a match.
   */
  replaceWithCaseOperations(text2, regex, replaceString) {
    if (!/\\[uUlL]/.test(replaceString)) {
      return text2.replace(regex, replaceString);
    }
    const firstMatch = regex.exec(text2);
    if (firstMatch === null) {
      return text2.replace(regex, replaceString);
    }
    let patMatch;
    let newReplaceString = "";
    let lastIndex = 0;
    let lastMatch = "";
    while ((patMatch = this._caseOpsRegExp.exec(replaceString)) !== null) {
      lastIndex = patMatch.index;
      const fullMatch = patMatch[0];
      lastMatch = fullMatch;
      let caseOps = patMatch[2];
      const money = patMatch[3];
      if (!caseOps) {
        newReplaceString += fullMatch;
        continue;
      }
      const replacement = firstMatch[parseInt(money.slice(1))];
      if (!replacement) {
        newReplaceString += fullMatch;
        continue;
      }
      const replacementLen = replacement.length;
      newReplaceString += patMatch[1];
      caseOps = caseOps.replace(/\\/g, "");
      let i2 = 0;
      for (; i2 < caseOps.length; i2++) {
        switch (caseOps[i2]) {
          case "U":
            newReplaceString += replacement.slice(i2).toUpperCase();
            i2 = replacementLen;
            break;
          case "u":
            newReplaceString += replacement[i2].toUpperCase();
            break;
          case "L":
            newReplaceString += replacement.slice(i2).toLowerCase();
            i2 = replacementLen;
            break;
          case "l":
            newReplaceString += replacement[i2].toLowerCase();
            break;
        }
      }
      if (i2 < replacementLen) {
        newReplaceString += replacement.slice(i2);
      }
      newReplaceString += patMatch[4];
    }
    newReplaceString += replaceString.slice(lastIndex + lastMatch.length);
    return text2.replace(regex, newReplaceString);
  }
  buildReplaceString(matches2, preserveCase) {
    if (preserveCase) {
      return buildReplaceStringWithCasePreserved(matches2, this._replacePattern);
    } else {
      return this._replacePattern;
    }
  }
  /**
   * \n => LF
   * \t => TAB
   * \\ => \
   * $0 => $& (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_string_as_a_parameter)
   * everything else stays untouched
   */
  parseReplaceString(replaceString) {
    if (!replaceString || replaceString.length === 0) {
      return;
    }
    let substrFrom = 0, result = "";
    for (let i2 = 0, len = replaceString.length; i2 < len; i2++) {
      const chCode = replaceString.charCodeAt(i2);
      if (chCode === 92 /* Backslash */) {
        i2++;
        if (i2 >= len) {
          break;
        }
        const nextChCode = replaceString.charCodeAt(i2);
        let replaceWithCharacter = null;
        switch (nextChCode) {
          case 92 /* Backslash */:
            replaceWithCharacter = "\\";
            break;
          case 110 /* n */:
            replaceWithCharacter = "\n";
            break;
          case 116 /* t */:
            replaceWithCharacter = "	";
            break;
        }
        if (replaceWithCharacter) {
          result += replaceString.substring(substrFrom, i2 - 1) + replaceWithCharacter;
          substrFrom = i2 + 1;
        }
      }
      if (chCode === 36 /* DollarSign */) {
        i2++;
        if (i2 >= len) {
          break;
        }
        const nextChCode = replaceString.charCodeAt(i2);
        let replaceWithCharacter = null;
        switch (nextChCode) {
          case 48 /* Digit0 */:
            replaceWithCharacter = "$&";
            this._hasParameters = true;
            break;
          case 96 /* BackTick */:
          case 39 /* SingleQuote */:
            this._hasParameters = true;
            break;
          default: {
            if (!this.between(nextChCode, 49 /* Digit1 */, 57 /* Digit9 */)) {
              break;
            }
            if (i2 === replaceString.length - 1) {
              this._hasParameters = true;
              break;
            }
            let charCode = replaceString.charCodeAt(++i2);
            if (!this.between(charCode, 48 /* Digit0 */, 57 /* Digit9 */)) {
              this._hasParameters = true;
              --i2;
              break;
            }
            if (i2 === replaceString.length - 1) {
              this._hasParameters = true;
              break;
            }
            charCode = replaceString.charCodeAt(++i2);
            if (!this.between(charCode, 48 /* Digit0 */, 57 /* Digit9 */)) {
              this._hasParameters = true;
              --i2;
              break;
            }
            break;
          }
        }
        if (replaceWithCharacter) {
          result += replaceString.substring(substrFrom, i2 - 1) + replaceWithCharacter;
          substrFrom = i2 + 1;
        }
      }
    }
    if (substrFrom === 0) {
      return;
    }
    this._replacePattern = result + replaceString.substring(substrFrom);
  }
  between(value2, from, to) {
    return from <= value2 && value2 <= to;
  }
};
export { ReplacePattern2 };
