// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/contextkey/common/scanner.ts
import { localize } from "./module-0013.mjs";
import { illegalState } from "./module-0003.mjs";


// src/vs/platform/contextkey/common/scanner.ts
function hintDidYouMean(...meant) {
  switch (meant.length) {
    case 1:
      return localize(2818, null, meant[0]);
    case 2:
      return localize(2819, null, meant[0], meant[1]);
    case 3:
      return localize(2820, null, meant[0], meant[1], meant[2]);
    default:
      return void 0;
  }
}

var hintDidYouForgetToOpenOrCloseQuote = localize(2817, null);

var hintDidYouForgetToEscapeSlash = localize(2816, null);

var Scanner = class _Scanner {
  constructor() {
    this._input = "";
    this._start = 0;
    this._current = 0;
    this._tokens = [];
    this._errors = [];
    // u - unicode, y - sticky // TODO@ulugbekna: we accept double quotes as part of the string rather than as a delimiter (to preserve old parser's behavior)
    this.stringRe = /[a-zA-Z0-9_<>\-\./\\:\*\?\+\[\]\^,#@;"%\$\p{L}-]+/uy;
  }
  static getLexeme(token) {
    switch (token.type) {
      case 0 /* LParen */:
        return "(";
      case 1 /* RParen */:
        return ")";
      case 2 /* Neg */:
        return "!";
      case 3 /* Eq */:
        return token.isTripleEq ? "===" : "==";
      case 4 /* NotEq */:
        return token.isTripleEq ? "!==" : "!=";
      case 5 /* Lt */:
        return "<";
      case 6 /* LtEq */:
        return "<=";
      case 7 /* Gt */:
        return ">";
      case 8 /* GtEq */:
        return ">=";
      case 9 /* RegexOp */:
        return "=~";
      case 10 /* RegexStr */:
        return token.lexeme;
      case 11 /* True */:
        return "true";
      case 12 /* False */:
        return "false";
      case 13 /* In */:
        return "in";
      case 14 /* Not */:
        return "not";
      case 15 /* And */:
        return "&&";
      case 16 /* Or */:
        return "||";
      case 17 /* Str */:
        return token.lexeme;
      case 18 /* QuotedStr */:
        return token.lexeme;
      case 19 /* Error */:
        return token.lexeme;
      case 20 /* EOF */:
        return "EOF";
      default:
        throw illegalState(`unhandled token type: ${JSON.stringify(token)}; have you forgotten to add a case?`);
    }
  }
  static {
    this._regexFlags = new Set(["i", "g", "s", "m", "y", "u"].map((ch) => ch.charCodeAt(0)));
  }
  static {
    this._keywords = /* @__PURE__ */ new Map([
      ["not", 14 /* Not */],
      ["in", 13 /* In */],
      ["false", 12 /* False */],
      ["true", 11 /* True */]
    ]);
  }
  get errors() {
    return this._errors;
  }
  reset(value) {
    this._input = value;
    this._start = 0;
    this._current = 0;
    this._tokens = [];
    this._errors = [];
    return this;
  }
  scan() {
    while (!this._isAtEnd()) {
      this._start = this._current;
      const ch = this._advance();
      switch (ch) {
        case 40 /* OpenParen */:
          this._addToken(0 /* LParen */);
          break;
        case 41 /* CloseParen */:
          this._addToken(1 /* RParen */);
          break;
        case 33 /* ExclamationMark */:
          if (this._match(61 /* Equals */)) {
            const isTripleEq = this._match(61 /* Equals */);
            this._tokens.push({ type: 4 /* NotEq */, offset: this._start, isTripleEq });
          } else {
            this._addToken(2 /* Neg */);
          }
          break;
        case 39 /* SingleQuote */:
          this._quotedString();
          break;
        case 47 /* Slash */:
          this._regex();
          break;
        case 61 /* Equals */:
          if (this._match(61 /* Equals */)) {
            const isTripleEq = this._match(61 /* Equals */);
            this._tokens.push({ type: 3 /* Eq */, offset: this._start, isTripleEq });
          } else if (this._match(126 /* Tilde */)) {
            this._addToken(9 /* RegexOp */);
          } else {
            this._error(hintDidYouMean("==", "=~"));
          }
          break;
        case 60 /* LessThan */:
          this._addToken(this._match(61 /* Equals */) ? 6 /* LtEq */ : 5 /* Lt */);
          break;
        case 62 /* GreaterThan */:
          this._addToken(this._match(61 /* Equals */) ? 8 /* GtEq */ : 7 /* Gt */);
          break;
        case 38 /* Ampersand */:
          if (this._match(38 /* Ampersand */)) {
            this._addToken(15 /* And */);
          } else {
            this._error(hintDidYouMean("&&"));
          }
          break;
        case 124 /* Pipe */:
          if (this._match(124 /* Pipe */)) {
            this._addToken(16 /* Or */);
          } else {
            this._error(hintDidYouMean("||"));
          }
          break;
        // TODO@ulugbekna: 1) rewrite using a regex 2) reconsider what characters are considered whitespace, including unicode, nbsp, etc.
        case 32 /* Space */:
        case 13 /* CarriageReturn */:
        case 9 /* Tab */:
        case 10 /* LineFeed */:
        case 160 /* NoBreakSpace */:
          break;
        default:
          this._string();
      }
    }
    this._start = this._current;
    this._addToken(20 /* EOF */);
    return Array.from(this._tokens);
  }
  _match(expected) {
    if (this._isAtEnd()) {
      return false;
    }
    if (this._input.charCodeAt(this._current) !== expected) {
      return false;
    }
    this._current++;
    return true;
  }
  _advance() {
    return this._input.charCodeAt(this._current++);
  }
  _peek() {
    return this._isAtEnd() ? 0 /* Null */ : this._input.charCodeAt(this._current);
  }
  _addToken(type) {
    this._tokens.push({ type, offset: this._start });
  }
  _error(additional) {
    const offset = this._start;
    const lexeme = this._input.substring(this._start, this._current);
    const errToken = { type: 19 /* Error */, offset: this._start, lexeme };
    this._errors.push({ offset, lexeme, additionalInfo: additional });
    this._tokens.push(errToken);
  }
  _string() {
    this.stringRe.lastIndex = this._start;
    const match2 = this.stringRe.exec(this._input);
    if (match2) {
      this._current = this._start + match2[0].length;
      const lexeme = this._input.substring(this._start, this._current);
      const keyword = _Scanner._keywords.get(lexeme);
      if (keyword) {
        this._addToken(keyword);
      } else {
        this._tokens.push({ type: 17 /* Str */, lexeme, offset: this._start });
      }
    }
  }
  // captures the lexeme without the leading and trailing '
  _quotedString() {
    while (this._peek() !== 39 /* SingleQuote */ && !this._isAtEnd()) {
      this._advance();
    }
    if (this._isAtEnd()) {
      this._error(hintDidYouForgetToOpenOrCloseQuote);
      return;
    }
    this._advance();
    this._tokens.push({ type: 18 /* QuotedStr */, lexeme: this._input.substring(this._start + 1, this._current - 1), offset: this._start + 1 });
  }
  /*
   * Lexing a regex expression: /.../[igsmyu]*
   * Based on https://github.com/microsoft/TypeScript/blob/9247ef115e617805983740ba795d7a8164babf89/src/compiler/scanner.ts#L2129-L2181
   *
   * Note that we want slashes within a regex to be escaped, e.g., /file:\\/\\/\\// should match `file:///`
   */
  _regex() {
    let p = this._current;
    let inEscape = false;
    let inCharacterClass = false;
    while (true) {
      if (p >= this._input.length) {
        this._current = p;
        this._error(hintDidYouForgetToEscapeSlash);
        return;
      }
      const ch = this._input.charCodeAt(p);
      if (inEscape) {
        inEscape = false;
      } else if (ch === 47 /* Slash */ && !inCharacterClass) {
        p++;
        break;
      } else if (ch === 91 /* OpenSquareBracket */) {
        inCharacterClass = true;
      } else if (ch === 92 /* Backslash */) {
        inEscape = true;
      } else if (ch === 93 /* CloseSquareBracket */) {
        inCharacterClass = false;
      }
      p++;
    }
    while (p < this._input.length && _Scanner._regexFlags.has(this._input.charCodeAt(p))) {
      p++;
    }
    this._current = p;
    const lexeme = this._input.substring(this._start, this._current);
    this._tokens.push({ type: 10 /* RegexStr */, lexeme, offset: this._start });
  }
  _isAtEnd() {
    return this._current >= this._input.length;
  }
};
export { hintDidYouMean, hintDidYouForgetToOpenOrCloseQuote, hintDidYouForgetToEscapeSlash, Scanner };
