// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/find/browser/replacePattern.ts
import { buildReplaceStringWithCasePreserved } from "./module-0593.mjs";


// src/vs/editor/contrib/find/browser/replacePattern.ts
var StaticValueReplacePattern = class {
  constructor(staticValue) {
    this.staticValue = staticValue;
    this.kind = 0 /* StaticValue */;
  }
};

var DynamicPiecesReplacePattern = class {
  constructor(pieces) {
    this.pieces = pieces;
    this.kind = 1 /* DynamicPieces */;
  }
};

var ReplacePattern = class _ReplacePattern {
  static fromStaticValue(value2) {
    return new _ReplacePattern([ReplacePiece.staticValue(value2)]);
  }
  get hasReplacementPatterns() {
    return this._state.kind === 1 /* DynamicPieces */;
  }
  constructor(pieces) {
    if (!pieces || pieces.length === 0) {
      this._state = new StaticValueReplacePattern("");
    } else if (pieces.length === 1 && pieces[0].staticValue !== null) {
      this._state = new StaticValueReplacePattern(pieces[0].staticValue);
    } else {
      this._state = new DynamicPiecesReplacePattern(pieces);
    }
  }
  buildReplaceString(matches2, preserveCase) {
    if (this._state.kind === 0 /* StaticValue */) {
      if (preserveCase) {
        return buildReplaceStringWithCasePreserved(matches2, this._state.staticValue);
      } else {
        return this._state.staticValue;
      }
    }
    let result = "";
    for (let i2 = 0, len = this._state.pieces.length; i2 < len; i2++) {
      const piece = this._state.pieces[i2];
      if (piece.staticValue !== null) {
        result += piece.staticValue;
        continue;
      }
      let match2 = _ReplacePattern._substitute(piece.matchIndex, matches2);
      if (piece.caseOps !== null && piece.caseOps.length > 0) {
        const repl = [];
        const lenOps = piece.caseOps.length;
        let opIdx = 0;
        for (let idx = 0, len2 = match2.length; idx < len2; idx++) {
          if (opIdx >= lenOps) {
            repl.push(match2.slice(idx));
            break;
          }
          switch (piece.caseOps[opIdx]) {
            case "U":
              repl.push(match2[idx].toUpperCase());
              break;
            case "u":
              repl.push(match2[idx].toUpperCase());
              opIdx++;
              break;
            case "L":
              repl.push(match2[idx].toLowerCase());
              break;
            case "l":
              repl.push(match2[idx].toLowerCase());
              opIdx++;
              break;
            default:
              repl.push(match2[idx]);
          }
        }
        match2 = repl.join("");
      }
      result += match2;
    }
    return result;
  }
  static _substitute(matchIndex, matches2) {
    if (matches2 === null) {
      return "";
    }
    if (matchIndex === 0) {
      return matches2[0];
    }
    let remainder = "";
    while (matchIndex > 0) {
      if (matchIndex < matches2.length) {
        const match2 = matches2[matchIndex] || "";
        return match2 + remainder;
      }
      remainder = String(matchIndex % 10) + remainder;
      matchIndex = Math.floor(matchIndex / 10);
    }
    return "$" + remainder;
  }
};

var ReplacePiece = class _ReplacePiece {
  static staticValue(value2) {
    return new _ReplacePiece(value2, -1, null);
  }
  static matchIndex(index2) {
    return new _ReplacePiece(null, index2, null);
  }
  static caseOps(index2, caseOps) {
    return new _ReplacePiece(null, index2, caseOps);
  }
  constructor(staticValue, matchIndex, caseOps) {
    this.staticValue = staticValue;
    this.matchIndex = matchIndex;
    if (!caseOps || caseOps.length === 0) {
      this.caseOps = null;
    } else {
      this.caseOps = caseOps.slice(0);
    }
  }
};

var ReplacePieceBuilder = class {
  constructor(source) {
    this._source = source;
    this._lastCharIndex = 0;
    this._result = [];
    this._resultLen = 0;
    this._currentStaticPiece = "";
  }
  emitUnchanged(toCharIndex) {
    this._emitStatic(this._source.substring(this._lastCharIndex, toCharIndex));
    this._lastCharIndex = toCharIndex;
  }
  emitStatic(value2, toCharIndex) {
    this._emitStatic(value2);
    this._lastCharIndex = toCharIndex;
  }
  _emitStatic(value2) {
    if (value2.length === 0) {
      return;
    }
    this._currentStaticPiece += value2;
  }
  emitMatchIndex(index2, toCharIndex, caseOps) {
    if (this._currentStaticPiece.length !== 0) {
      this._result[this._resultLen++] = ReplacePiece.staticValue(this._currentStaticPiece);
      this._currentStaticPiece = "";
    }
    this._result[this._resultLen++] = ReplacePiece.caseOps(index2, caseOps);
    this._lastCharIndex = toCharIndex;
  }
  finalize() {
    this.emitUnchanged(this._source.length);
    if (this._currentStaticPiece.length !== 0) {
      this._result[this._resultLen++] = ReplacePiece.staticValue(this._currentStaticPiece);
      this._currentStaticPiece = "";
    }
    return new ReplacePattern(this._result);
  }
};

function parseReplaceString(replaceString) {
  if (!replaceString || replaceString.length === 0) {
    return new ReplacePattern(null);
  }
  const caseOps = [];
  const result = new ReplacePieceBuilder(replaceString);
  for (let i2 = 0, len = replaceString.length; i2 < len; i2++) {
    const chCode = replaceString.charCodeAt(i2);
    if (chCode === 92 /* Backslash */) {
      i2++;
      if (i2 >= len) {
        break;
      }
      const nextChCode = replaceString.charCodeAt(i2);
      switch (nextChCode) {
        case 92 /* Backslash */:
          result.emitUnchanged(i2 - 1);
          result.emitStatic("\\", i2 + 1);
          break;
        case 110 /* n */:
          result.emitUnchanged(i2 - 1);
          result.emitStatic("\n", i2 + 1);
          break;
        case 116 /* t */:
          result.emitUnchanged(i2 - 1);
          result.emitStatic("	", i2 + 1);
          break;
        // Case modification of string replacements, patterned after Boost, but only applied
        // to the replacement text, not subsequent content.
        case 117 /* u */:
        // \u => upper-cases one character.
        case 85 /* U */:
        // \U => upper-cases ALL following characters.
        case 108 /* l */:
        // \l => lower-cases one character.
        case 76 /* L */:
          result.emitUnchanged(i2 - 1);
          result.emitStatic("", i2 + 1);
          caseOps.push(String.fromCharCode(nextChCode));
          break;
      }
      continue;
    }
    if (chCode === 36 /* DollarSign */) {
      i2++;
      if (i2 >= len) {
        break;
      }
      const nextChCode = replaceString.charCodeAt(i2);
      if (nextChCode === 36 /* DollarSign */) {
        result.emitUnchanged(i2 - 1);
        result.emitStatic("$", i2 + 1);
        continue;
      }
      if (nextChCode === 48 /* Digit0 */ || nextChCode === 38 /* Ampersand */) {
        result.emitUnchanged(i2 - 1);
        result.emitMatchIndex(0, i2 + 1, caseOps);
        caseOps.length = 0;
        continue;
      }
      if (49 /* Digit1 */ <= nextChCode && nextChCode <= 57 /* Digit9 */) {
        let matchIndex = nextChCode - 48 /* Digit0 */;
        if (i2 + 1 < len) {
          const nextNextChCode = replaceString.charCodeAt(i2 + 1);
          if (48 /* Digit0 */ <= nextNextChCode && nextNextChCode <= 57 /* Digit9 */) {
            i2++;
            matchIndex = matchIndex * 10 + (nextNextChCode - 48 /* Digit0 */);
            result.emitUnchanged(i2 - 2);
            result.emitMatchIndex(matchIndex, i2 + 1, caseOps);
            caseOps.length = 0;
            continue;
          }
        }
        result.emitUnchanged(i2 - 1);
        result.emitMatchIndex(matchIndex, i2 + 1, caseOps);
        caseOps.length = 0;
        continue;
      }
    }
  }
  return result.finalize();
}
export { parseReplaceString, StaticValueReplacePattern, DynamicPiecesReplacePattern, ReplacePattern, ReplacePiece, ReplacePieceBuilder };
