// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/contextkey/common/contextkey.ts
import { __esm } from "./module-0000.mjs";
import { init_charCode } from "./module-0023.mjs";
import { init_platform, isChrome, isEdge, isFirefox, isLinux, isMacintosh, isSafari, isWeb, isWindows2 } from "./module-0006.mjs";
import { init_strings, isFalsyOrWhitespace } from "./module-0027.mjs";
import { Scanner, init_scanner } from "./module-0073.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";
import { init_nls, localize } from "./module-0005.mjs";
import { init_errors } from "./module-0010.mjs";


// src/vs/platform/contextkey/common/contextkey.ts
function cmp(a, b) {
  return a.cmp(b);
}

function withFloatOrStr(value, callback) {
  if (typeof value === "string") {
    const n = parseFloat(value);
    if (!isNaN(n)) {
      value = n;
    }
  }
  if (typeof value === "string" || typeof value === "number") {
    return callback(value);
  }
  return ContextKeyFalseExpr.INSTANCE;
}

function eliminateConstantsInArray(arr) {
  let newArr = null;
  for (let i = 0, len = arr.length; i < len; i++) {
    const newExpr = arr[i].substituteConstants();
    if (arr[i] !== newExpr) {
      if (newArr === null) {
        newArr = [];
        for (let j = 0; j < i; j++) {
          newArr[j] = arr[j];
        }
      }
    }
    if (newArr !== null) {
      newArr[i] = newExpr;
    }
  }
  if (newArr === null) {
    return arr;
  }
  return newArr;
}

function cmp1(key1, key2) {
  if (key1 < key2) {
    return -1;
  }
  if (key1 > key2) {
    return 1;
  }
  return 0;
}

function cmp2(key1, value1, key2, value2) {
  if (key1 < key2) {
    return -1;
  }
  if (key1 > key2) {
    return 1;
  }
  if (value1 < value2) {
    return -1;
  }
  if (value1 > value2) {
    return 1;
  }
  return 0;
}

function getTerminals(node) {
  if (node.type === 9 /* Or */) {
    return node.expr;
  }
  return [node];
}

var CONSTANT_VALUES, hasOwnProperty2, defaultConfig, errorEmptyString, hintEmptyString, errorNoInAfterNot, errorClosingParenthesis, errorUnexpectedToken, hintUnexpectedToken, errorUnexpectedEOF, hintUnexpectedEOF, Parser, ContextKeyExpr, ContextKeyFalseExpr, ContextKeyTrueExpr, ContextKeyDefinedExpr, ContextKeyEqualsExpr, ContextKeyInExpr, ContextKeyNotInExpr, ContextKeyNotEqualsExpr, ContextKeyNotExpr, ContextKeyGreaterExpr, ContextKeyGreaterEqualsExpr, ContextKeySmallerExpr, ContextKeySmallerEqualsExpr, ContextKeyRegexExpr, ContextKeyNotRegexExpr, ContextKeyAndExpr, ContextKeyOrExpr, RawContextKey, IContextKeyService;

var init_contextkey = __esm({
  "src/vs/platform/contextkey/common/contextkey.ts"() {
    init_charCode();
    init_platform();
    init_strings();
    init_scanner();
    init_instantiation();
    init_nls();
    init_errors();
    CONSTANT_VALUES = /* @__PURE__ */ new Map();
    CONSTANT_VALUES.set("false", false);
    CONSTANT_VALUES.set("true", true);
    CONSTANT_VALUES.set("isMac", isMacintosh);
    CONSTANT_VALUES.set("isLinux", isLinux);
    CONSTANT_VALUES.set("isWindows", isWindows2);
    CONSTANT_VALUES.set("isWeb", isWeb);
    CONSTANT_VALUES.set("isMacNative", isMacintosh && !isWeb);
    CONSTANT_VALUES.set("isEdge", isEdge);
    CONSTANT_VALUES.set("isFirefox", isFirefox);
    CONSTANT_VALUES.set("isChrome", isChrome);
    CONSTANT_VALUES.set("isSafari", isSafari);
    hasOwnProperty2 = Object.prototype.hasOwnProperty;
    defaultConfig = {
      regexParsingWithErrorRecovery: true
    };
    errorEmptyString = localize(2797, null);
    hintEmptyString = localize(2798, null);
    errorNoInAfterNot = localize(2800, null);
    errorClosingParenthesis = localize(2796, null);
    errorUnexpectedToken = localize(2803, null);
    hintUnexpectedToken = localize(2804, null);
    errorUnexpectedEOF = localize(2801, null);
    hintUnexpectedEOF = localize(2802, null);
    Parser = class _Parser {
      constructor(_config = defaultConfig) {
        this._config = _config;
        // lifetime note: `_scanner` lives as long as the parser does, i.e., is not reset between calls to `parse`
        this._scanner = new Scanner();
        // lifetime note: `_tokens`, `_current`, and `_parsingErrors` must be reset between calls to `parse`
        this._tokens = [];
        this._current = 0;
        // invariant: 0 <= this._current < this._tokens.length ; any incrementation of this value must first call `_isAtEnd`
        this._parsingErrors = [];
        this._flagsGYRe = /g|y/g;
      }
      static {
        // Note: this doesn't produce an exact syntax tree but a normalized one
        // ContextKeyExpression's that we use as AST nodes do not expose constructors that do not normalize
        this._parseError = new Error();
      }
      get lexingErrors() {
        return this._scanner.errors;
      }
      get parsingErrors() {
        return this._parsingErrors;
      }
      /**
       * Parse a context key expression.
       *
       * @param input the expression to parse
       * @returns the parsed expression or `undefined` if there's an error - call `lexingErrors` and `parsingErrors` to see the errors
       */
      parse(input) {
        if (input === "") {
          this._parsingErrors.push({ message: errorEmptyString, offset: 0, lexeme: "", additionalInfo: hintEmptyString });
          return void 0;
        }
        this._tokens = this._scanner.reset(input).scan();
        this._current = 0;
        this._parsingErrors = [];
        try {
          const expr = this._expr();
          if (!this._isAtEnd()) {
            const peek = this._peek();
            const additionalInfo = peek.type === 17 /* Str */ ? hintUnexpectedToken : void 0;
            this._parsingErrors.push({ message: errorUnexpectedToken, offset: peek.offset, lexeme: Scanner.getLexeme(peek), additionalInfo });
            throw _Parser._parseError;
          }
          return expr;
        } catch (e) {
          if (!(e === _Parser._parseError)) {
            throw e;
          }
          return void 0;
        }
      }
      _expr() {
        return this._or();
      }
      _or() {
        const expr = [this._and()];
        while (this._matchOne(16 /* Or */)) {
          const right = this._and();
          expr.push(right);
        }
        return expr.length === 1 ? expr[0] : ContextKeyExpr.or(...expr);
      }
      _and() {
        const expr = [this._term()];
        while (this._matchOne(15 /* And */)) {
          const right = this._term();
          expr.push(right);
        }
        return expr.length === 1 ? expr[0] : ContextKeyExpr.and(...expr);
      }
      _term() {
        if (this._matchOne(2 /* Neg */)) {
          const peek = this._peek();
          switch (peek.type) {
            case 11 /* True */:
              this._advance();
              return ContextKeyFalseExpr.INSTANCE;
            case 12 /* False */:
              this._advance();
              return ContextKeyTrueExpr.INSTANCE;
            case 0 /* LParen */: {
              this._advance();
              const expr = this._expr();
              this._consume(1 /* RParen */, errorClosingParenthesis);
              return expr?.negate();
            }
            case 17 /* Str */:
              this._advance();
              return ContextKeyNotExpr.create(peek.lexeme);
            default:
              throw this._errExpectedButGot(`KEY | true | false | '(' expression ')'`, peek);
          }
        }
        return this._primary();
      }
      _primary() {
        const peek = this._peek();
        switch (peek.type) {
          case 11 /* True */:
            this._advance();
            return ContextKeyExpr.true();
          case 12 /* False */:
            this._advance();
            return ContextKeyExpr.false();
          case 0 /* LParen */: {
            this._advance();
            const expr = this._expr();
            this._consume(1 /* RParen */, errorClosingParenthesis);
            return expr;
          }
          case 17 /* Str */: {
            const key = peek.lexeme;
            this._advance();
            if (this._matchOne(9 /* RegexOp */)) {
              const expr = this._peek();
              if (!this._config.regexParsingWithErrorRecovery) {
                this._advance();
                if (expr.type !== 10 /* RegexStr */) {
                  throw this._errExpectedButGot(`REGEX`, expr);
                }
                const regexLexeme = expr.lexeme;
                const closingSlashIndex = regexLexeme.lastIndexOf("/");
                const flags = closingSlashIndex === regexLexeme.length - 1 ? void 0 : this._removeFlagsGY(regexLexeme.substring(closingSlashIndex + 1));
                let regexp2;
                try {
                  regexp2 = new RegExp(regexLexeme.substring(1, closingSlashIndex), flags);
                } catch (e) {
                  throw this._errExpectedButGot(`REGEX`, expr);
                }
                return ContextKeyRegexExpr.create(key, regexp2);
              }
              switch (expr.type) {
                case 10 /* RegexStr */:
                case 19 /* Error */: {
                  const lexemeReconstruction = [expr.lexeme];
                  this._advance();
                  let followingToken = this._peek();
                  let parenBalance = 0;
                  for (let i = 0; i < expr.lexeme.length; i++) {
                    if (expr.lexeme.charCodeAt(i) === 40 /* OpenParen */) {
                      parenBalance++;
                    } else if (expr.lexeme.charCodeAt(i) === 41 /* CloseParen */) {
                      parenBalance--;
                    }
                  }
                  while (!this._isAtEnd() && followingToken.type !== 15 /* And */ && followingToken.type !== 16 /* Or */) {
                    switch (followingToken.type) {
                      case 0 /* LParen */:
                        parenBalance++;
                        break;
                      case 1 /* RParen */:
                        parenBalance--;
                        break;
                      case 10 /* RegexStr */:
                      case 18 /* QuotedStr */:
                        for (let i = 0; i < followingToken.lexeme.length; i++) {
                          if (followingToken.lexeme.charCodeAt(i) === 40 /* OpenParen */) {
                            parenBalance++;
                          } else if (expr.lexeme.charCodeAt(i) === 41 /* CloseParen */) {
                            parenBalance--;
                          }
                        }
                    }
                    if (parenBalance < 0) {
                      break;
                    }
                    lexemeReconstruction.push(Scanner.getLexeme(followingToken));
                    this._advance();
                    followingToken = this._peek();
                  }
                  const regexLexeme = lexemeReconstruction.join("");
                  const closingSlashIndex = regexLexeme.lastIndexOf("/");
                  const flags = closingSlashIndex === regexLexeme.length - 1 ? void 0 : this._removeFlagsGY(regexLexeme.substring(closingSlashIndex + 1));
                  let regexp2;
                  try {
                    regexp2 = new RegExp(regexLexeme.substring(1, closingSlashIndex), flags);
                  } catch (e) {
                    throw this._errExpectedButGot(`REGEX`, expr);
                  }
                  return ContextKeyExpr.regex(key, regexp2);
                }
                case 18 /* QuotedStr */: {
                  const serializedValue = expr.lexeme;
                  this._advance();
                  let regex = null;
                  if (!isFalsyOrWhitespace(serializedValue)) {
                    const start = serializedValue.indexOf("/");
                    const end = serializedValue.lastIndexOf("/");
                    if (start !== end && start >= 0) {
                      const value = serializedValue.slice(start + 1, end);
                      const caseIgnoreFlag = serializedValue[end + 1] === "i" ? "i" : "";
                      try {
                        regex = new RegExp(value, caseIgnoreFlag);
                      } catch (_e) {
                        throw this._errExpectedButGot(`REGEX`, expr);
                      }
                    }
                  }
                  if (regex === null) {
                    throw this._errExpectedButGot("REGEX", expr);
                  }
                  return ContextKeyRegexExpr.create(key, regex);
                }
                default:
                  throw this._errExpectedButGot("REGEX", this._peek());
              }
            }
            if (this._matchOne(14 /* Not */)) {
              this._consume(13 /* In */, errorNoInAfterNot);
              const right = this._value();
              return ContextKeyExpr.notIn(key, right);
            }
            const maybeOp = this._peek().type;
            switch (maybeOp) {
              case 3 /* Eq */: {
                this._advance();
                const right = this._value();
                if (this._previous().type === 18 /* QuotedStr */) {
                  return ContextKeyExpr.equals(key, right);
                }
                switch (right) {
                  case "true":
                    return ContextKeyExpr.has(key);
                  case "false":
                    return ContextKeyExpr.not(key);
                  default:
                    return ContextKeyExpr.equals(key, right);
                }
              }
              case 4 /* NotEq */: {
                this._advance();
                const right = this._value();
                if (this._previous().type === 18 /* QuotedStr */) {
                  return ContextKeyExpr.notEquals(key, right);
                }
                switch (right) {
                  case "true":
                    return ContextKeyExpr.not(key);
                  case "false":
                    return ContextKeyExpr.has(key);
                  default:
                    return ContextKeyExpr.notEquals(key, right);
                }
              }
              // TODO: ContextKeyExpr.smaller(key, right) accepts only `number` as `right` AND during eval of this node, we just eval to `false` if `right` is not a number
              // consequently, package.json linter should _warn_ the user if they're passing undesired things to ops
              case 5 /* Lt */:
                this._advance();
                return ContextKeySmallerExpr.create(key, this._value());
              case 6 /* LtEq */:
                this._advance();
                return ContextKeySmallerEqualsExpr.create(key, this._value());
              case 7 /* Gt */:
                this._advance();
                return ContextKeyGreaterExpr.create(key, this._value());
              case 8 /* GtEq */:
                this._advance();
                return ContextKeyGreaterEqualsExpr.create(key, this._value());
              case 13 /* In */:
                this._advance();
                return ContextKeyExpr.in(key, this._value());
              default:
                return ContextKeyExpr.has(key);
            }
          }
          case 20 /* EOF */:
            this._parsingErrors.push({ message: errorUnexpectedEOF, offset: peek.offset, lexeme: "", additionalInfo: hintUnexpectedEOF });
            throw _Parser._parseError;
          default:
            throw this._errExpectedButGot(`true | false | KEY 
	| KEY '=~' REGEX 
	| KEY ('==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not' 'in') value`, this._peek());
        }
      }
      _value() {
        const token = this._peek();
        switch (token.type) {
          case 17 /* Str */:
          case 18 /* QuotedStr */:
            this._advance();
            return token.lexeme;
          case 11 /* True */:
            this._advance();
            return "true";
          case 12 /* False */:
            this._advance();
            return "false";
          case 13 /* In */:
            this._advance();
            return "in";
          default:
            return "";
        }
      }
      _removeFlagsGY(flags) {
        return flags.replaceAll(this._flagsGYRe, "");
      }
      // careful: this can throw if current token is the initial one (ie index = 0)
      _previous() {
        return this._tokens[this._current - 1];
      }
      _matchOne(token) {
        if (this._check(token)) {
          this._advance();
          return true;
        }
        return false;
      }
      _advance() {
        if (!this._isAtEnd()) {
          this._current++;
        }
        return this._previous();
      }
      _consume(type3, message) {
        if (this._check(type3)) {
          return this._advance();
        }
        throw this._errExpectedButGot(message, this._peek());
      }
      _errExpectedButGot(expected, got, additionalInfo) {
        const message = localize(2799, null, expected, Scanner.getLexeme(got));
        const offset = got.offset;
        const lexeme = Scanner.getLexeme(got);
        this._parsingErrors.push({ message, offset, lexeme, additionalInfo });
        return _Parser._parseError;
      }
      _check(type3) {
        return this._peek().type === type3;
      }
      _peek() {
        return this._tokens[this._current];
      }
      _isAtEnd() {
        return this._peek().type === 20 /* EOF */;
      }
    };
    ContextKeyExpr = class {
      static false() {
        return ContextKeyFalseExpr.INSTANCE;
      }
      static true() {
        return ContextKeyTrueExpr.INSTANCE;
      }
      static has(key) {
        return ContextKeyDefinedExpr.create(key);
      }
      static equals(key, value) {
        return ContextKeyEqualsExpr.create(key, value);
      }
      static notEquals(key, value) {
        return ContextKeyNotEqualsExpr.create(key, value);
      }
      static regex(key, value) {
        return ContextKeyRegexExpr.create(key, value);
      }
      static in(key, value) {
        return ContextKeyInExpr.create(key, value);
      }
      static notIn(key, value) {
        return ContextKeyNotInExpr.create(key, value);
      }
      static not(key) {
        return ContextKeyNotExpr.create(key);
      }
      static and(...expr) {
        return ContextKeyAndExpr.create(expr, null, true);
      }
      static or(...expr) {
        return ContextKeyOrExpr.create(expr, null, true);
      }
      static greater(key, value) {
        return ContextKeyGreaterExpr.create(key, value);
      }
      static greaterEquals(key, value) {
        return ContextKeyGreaterEqualsExpr.create(key, value);
      }
      static smaller(key, value) {
        return ContextKeySmallerExpr.create(key, value);
      }
      static smallerEquals(key, value) {
        return ContextKeySmallerEqualsExpr.create(key, value);
      }
      static {
        this._parser = new Parser({ regexParsingWithErrorRecovery: false });
      }
      static deserialize(serialized) {
        if (serialized === void 0 || serialized === null) {
          return void 0;
        }
        const expr = this._parser.parse(serialized);
        return expr;
      }
    };
    ContextKeyFalseExpr = class _ContextKeyFalseExpr {
      constructor() {
        this.type = 0 /* False */;
      }
      static {
        this.INSTANCE = new _ContextKeyFalseExpr();
      }
      cmp(other) {
        return this.type - other.type;
      }
      equals(other) {
        return other.type === this.type;
      }
      substituteConstants() {
        return this;
      }
      evaluate(context) {
        return false;
      }
      serialize() {
        return "false";
      }
      keys() {
        return [];
      }
      map(mapFnc) {
        return this;
      }
      negate() {
        return ContextKeyTrueExpr.INSTANCE;
      }
    };
    ContextKeyTrueExpr = class _ContextKeyTrueExpr {
      constructor() {
        this.type = 1 /* True */;
      }
      static {
        this.INSTANCE = new _ContextKeyTrueExpr();
      }
      cmp(other) {
        return this.type - other.type;
      }
      equals(other) {
        return other.type === this.type;
      }
      substituteConstants() {
        return this;
      }
      evaluate(context) {
        return true;
      }
      serialize() {
        return "true";
      }
      keys() {
        return [];
      }
      map(mapFnc) {
        return this;
      }
      negate() {
        return ContextKeyFalseExpr.INSTANCE;
      }
    };
    ContextKeyDefinedExpr = class _ContextKeyDefinedExpr {
      constructor(key, negated) {
        this.key = key;
        this.negated = negated;
        this.type = 2 /* Defined */;
      }
      static create(key, negated = null) {
        const constantValue = CONSTANT_VALUES.get(key);
        if (typeof constantValue === "boolean") {
          return constantValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE;
        }
        return new _ContextKeyDefinedExpr(key, negated);
      }
      cmp(other) {
        if (other.type !== this.type) {
          return this.type - other.type;
        }
        return cmp1(this.key, other.key);
      }
      equals(other) {
        if (other.type === this.type) {
          return this.key === other.key;
        }
        return false;
      }
      substituteConstants() {
        const constantValue = CONSTANT_VALUES.get(this.key);
        if (typeof constantValue === "boolean") {
          return constantValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE;
        }
        return this;
      }
      evaluate(context) {
        return !!context.getValue(this.key);
      }
      serialize() {
        return this.key;
      }
      keys() {
        return [this.key];
      }
      map(mapFnc) {
        return mapFnc.mapDefined(this.key);
      }
      negate() {
        if (!this.negated) {
          this.negated = ContextKeyNotExpr.create(this.key, this);
        }
        return this.negated;
      }
    };
    ContextKeyEqualsExpr = class _ContextKeyEqualsExpr {
      constructor(key, value, negated) {
        this.key = key;
        this.value = value;
        this.negated = negated;
        this.type = 4 /* Equals */;
      }
      static create(key, value, negated = null) {
        if (typeof value === "boolean") {
          return value ? ContextKeyDefinedExpr.create(key, negated) : ContextKeyNotExpr.create(key, negated);
        }
        const constantValue = CONSTANT_VALUES.get(key);
        if (typeof constantValue === "boolean") {
          const trueValue = constantValue ? "true" : "false";
          return value === trueValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE;
        }
        return new _ContextKeyEqualsExpr(key, value, negated);
      }
      cmp(other) {
        if (other.type !== this.type) {
          return this.type - other.type;
        }
        return cmp2(this.key, this.value, other.key, other.value);
      }
      equals(other) {
        if (other.type === this.type) {
          return this.key === other.key && this.value === other.value;
        }
        return false;
      }
      substituteConstants() {
        const constantValue = CONSTANT_VALUES.get(this.key);
        if (typeof constantValue === "boolean") {
          const trueValue = constantValue ? "true" : "false";
          return this.value === trueValue ? ContextKeyTrueExpr.INSTANCE : ContextKeyFalseExpr.INSTANCE;
        }
        return this;
      }
      evaluate(context) {
        return context.getValue(this.key) == this.value;
      }
      serialize() {
        return `${this.key} == '${this.value}'`;
      }
      keys() {
        return [this.key];
      }
      map(mapFnc) {
        return mapFnc.mapEquals(this.key, this.value);
      }
      negate() {
        if (!this.negated) {
          this.negated = ContextKeyNotEqualsExpr.create(this.key, this.value, this);
        }
        return this.negated;
      }
    };
    ContextKeyInExpr = class _ContextKeyInExpr {
      constructor(key, valueKey) {
        this.key = key;
        this.valueKey = valueKey;
        this.type = 10 /* In */;
        this.negated = null;
      }
      static create(key, valueKey) {
        return new _ContextKeyInExpr(key, valueKey);
      }
      cmp(other) {
        if (other.type !== this.type) {
          return this.type - other.type;
        }
        return cmp2(this.key, this.valueKey, other.key, other.valueKey);
      }
      equals(other) {
        if (other.type === this.type) {
          return this.key === other.key && this.valueKey === other.valueKey;
        }
        return false;
      }
      substituteConstants() {
        return this;
      }
      evaluate(context) {
        const source = context.getValue(this.valueKey);
        const item = context.getValue(this.key);
        if (Array.isArray(source)) {
          if (source.includes(item)) {
            return true;
          }
          if (isWindows2 && typeof item === "string" && item.startsWith("file:///")) {
            const itemLower = item.toLowerCase();
            return source.some((s) => typeof s === "string" && s.toLowerCase() === itemLower);
          }
          return false;
        }
        if (typeof item === "string" && typeof source === "object" && source !== null) {
          if (hasOwnProperty2.call(source, item)) {
            return true;
          }
          if (isWindows2 && item.startsWith("file:///")) {
            const itemLower = item.toLowerCase();
            return Object.keys(source).some((key) => key.toLowerCase() === itemLower);
          }
          return false;
        }
        return false;
      }
      serialize() {
        return `${this.key} in '${this.valueKey}'`;
      }
      keys() {
        return [this.key, this.valueKey];
      }
      map(mapFnc) {
        return mapFnc.mapIn(this.key, this.valueKey);
      }
      negate() {
        if (!this.negated) {
          this.negated = ContextKeyNotInExpr.create(this.key, this.valueKey);
        }
        return this.negated;
      }
    };
    ContextKeyNotInExpr = class _ContextKeyNotInExpr {
      constructor(key, valueKey) {
        this.key = key;
        this.valueKey = valueKey;
        this.type = 11 /* NotIn */;
        this._negated = ContextKeyInExpr.create(key, valueKey);
      }
      static create(key, valueKey) {
        return new _ContextKeyNotInExpr(key, valueKey);
      }
      cmp(other) {
        if (other.type !== this.type) {
          return this.type - other.type;
        }
        return this._negated.cmp(other._negated);
      }
      equals(other) {
        if (other.type === this.type) {
          return this._negated.equals(other._negated);
        }
        return false;
      }
      substituteConstants() {
        return this;
      }
      evaluate(context) {
        return !this._negated.evaluate(context);
      }
      serialize() {
        return `${this.key} not in '${this.valueKey}'`;
      }
      keys() {
        return this._negated.keys();
      }
      map(mapFnc) {
        return mapFnc.mapNotIn(this.key, this.valueKey);
      }
      negate() {
        return this._negated;
      }
    };
    ContextKeyNotEqualsExpr = class _ContextKeyNotEqualsExpr {
      constructor(key, value, negated) {
        this.key = key;
        this.value = value;
        this.negated = negated;
        this.type = 5 /* NotEquals */;
      }
      static create(key, value, negated = null) {
        if (typeof value === "boolean") {
          if (value) {
            return ContextKeyNotExpr.create(key, negated);
          }
          return ContextKeyDefinedExpr.create(key, negated);
        }
        const constantValue = CONSTANT_VALUES.get(key);
        if (typeof constantValue === "boolean") {
          const falseValue = constantValue ? "true" : "false";
          return value === falseValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE;
        }
        return new _ContextKeyNotEqualsExpr(key, value, negated);
      }
      cmp(other) {
        if (other.type !== this.type) {
          return this.type - other.type;
        }
        return cmp2(this.key, this.value, other.key, other.value);
      }
      equals(other) {
        if (other.type === this.type) {
          return this.key === other.key && this.value === other.value;
        }
        return false;
      }
      substituteConstants() {
        const constantValue = CONSTANT_VALUES.get(this.key);
        if (typeof constantValue === "boolean") {
          const falseValue = constantValue ? "true" : "false";
          return this.value === falseValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE;
        }
        return this;
      }
      evaluate(context) {
        return context.getValue(this.key) != this.value;
      }
      serialize() {
        return `${this.key} != '${this.value}'`;
      }
      keys() {
        return [this.key];
      }
      map(mapFnc) {
        return mapFnc.mapNotEquals(this.key, this.value);
      }
      negate() {
        if (!this.negated) {
          this.negated = ContextKeyEqualsExpr.create(this.key, this.value, this);
        }
        return this.negated;
      }
    };
    ContextKeyNotExpr = class _ContextKeyNotExpr {
      constructor(key, negated) {
        this.key = key;
        this.negated = negated;
        this.type = 3 /* Not */;
      }
      static create(key, negated = null) {
        const constantValue = CONSTANT_VALUES.get(key);
        if (typeof constantValue === "boolean") {
          return constantValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE;
        }
        return new _ContextKeyNotExpr(key, negated);
      }
      cmp(other) {
        if (other.type !== this.type) {
          return this.type - other.type;
        }
        return cmp1(this.key, other.key);
      }
      equals(other) {
        if (other.type === this.type) {
          return this.key === other.key;
        }
        return false;
      }
      substituteConstants() {
        const constantValue = CONSTANT_VALUES.get(this.key);
        if (typeof constantValue === "boolean") {
          return constantValue ? ContextKeyFalseExpr.INSTANCE : ContextKeyTrueExpr.INSTANCE;
        }
        return this;
      }
      evaluate(context) {
        return !context.getValue(this.key);
      }
      serialize() {
        return `!${this.key}`;
      }
      keys() {
        return [this.key];
      }
      map(mapFnc) {
        return mapFnc.mapNot(this.key);
      }
      negate() {
        if (!this.negated) {
          this.negated = ContextKeyDefinedExpr.create(this.key, this);
        }
        return this.negated;
      }
    };
    ContextKeyGreaterExpr = class _ContextKeyGreaterExpr {
      constructor(key, value, negated) {
        this.key = key;
        this.value = value;
        this.negated = negated;
        this.type = 12 /* Greater */;
      }
      static create(key, _value, negated = null) {
        return withFloatOrStr(_value, (value) => new _ContextKeyGreaterExpr(key, value, negated));
      }
      cmp(other) {
        if (other.type !== this.type) {
          return this.type - other.type;
        }
        return cmp2(this.key, this.value, other.key, other.value);
      }
      equals(other) {
        if (other.type === this.type) {
          return this.key === other.key && this.value === other.value;
        }
        return false;
      }
      substituteConstants() {
        return this;
      }
      evaluate(context) {
        if (typeof this.value === "string") {
          return false;
        }
        return parseFloat(context.getValue(this.key)) > this.value;
      }
      serialize() {
        return `${this.key} > ${this.value}`;
      }
      keys() {
        return [this.key];
      }
      map(mapFnc) {
        return mapFnc.mapGreater(this.key, this.value);
      }
      negate() {
        if (!this.negated) {
          this.negated = ContextKeySmallerEqualsExpr.create(this.key, this.value, this);
        }
        return this.negated;
      }
    };
    ContextKeyGreaterEqualsExpr = class _ContextKeyGreaterEqualsExpr {
      constructor(key, value, negated) {
        this.key = key;
        this.value = value;
        this.negated = negated;
        this.type = 13 /* GreaterEquals */;
      }
      static create(key, _value, negated = null) {
        return withFloatOrStr(_value, (value) => new _ContextKeyGreaterEqualsExpr(key, value, negated));
      }
      cmp(other) {
        if (other.type !== this.type) {
          return this.type - other.type;
        }
        return cmp2(this.key, this.value, other.key, other.value);
      }
      equals(other) {
        if (other.type === this.type) {
          return this.key === other.key && this.value === other.value;
        }
        return false;
      }
      substituteConstants() {
        return this;
      }
      evaluate(context) {
        if (typeof this.value === "string") {
          return false;
        }
        return parseFloat(context.getValue(this.key)) >= this.value;
      }
      serialize() {
        return `${this.key} >= ${this.value}`;
      }
      keys() {
        return [this.key];
      }
      map(mapFnc) {
        return mapFnc.mapGreaterEquals(this.key, this.value);
      }
      negate() {
        if (!this.negated) {
          this.negated = ContextKeySmallerExpr.create(this.key, this.value, this);
        }
        return this.negated;
      }
    };
    ContextKeySmallerExpr = class _ContextKeySmallerExpr {
      constructor(key, value, negated) {
        this.key = key;
        this.value = value;
        this.negated = negated;
        this.type = 14 /* Smaller */;
      }
      static create(key, _value, negated = null) {
        return withFloatOrStr(_value, (value) => new _ContextKeySmallerExpr(key, value, negated));
      }
      cmp(other) {
        if (other.type !== this.type) {
          return this.type - other.type;
        }
        return cmp2(this.key, this.value, other.key, other.value);
      }
      equals(other) {
        if (other.type === this.type) {
          return this.key === other.key && this.value === other.value;
        }
        return false;
      }
      substituteConstants() {
        return this;
      }
      evaluate(context) {
        if (typeof this.value === "string") {
          return false;
        }
        return parseFloat(context.getValue(this.key)) < this.value;
      }
      serialize() {
        return `${this.key} < ${this.value}`;
      }
      keys() {
        return [this.key];
      }
      map(mapFnc) {
        return mapFnc.mapSmaller(this.key, this.value);
      }
      negate() {
        if (!this.negated) {
          this.negated = ContextKeyGreaterEqualsExpr.create(this.key, this.value, this);
        }
        return this.negated;
      }
    };
    ContextKeySmallerEqualsExpr = class _ContextKeySmallerEqualsExpr {
      constructor(key, value, negated) {
        this.key = key;
        this.value = value;
        this.negated = negated;
        this.type = 15 /* SmallerEquals */;
      }
      static create(key, _value, negated = null) {
        return withFloatOrStr(_value, (value) => new _ContextKeySmallerEqualsExpr(key, value, negated));
      }
      cmp(other) {
        if (other.type !== this.type) {
          return this.type - other.type;
        }
        return cmp2(this.key, this.value, other.key, other.value);
      }
      equals(other) {
        if (other.type === this.type) {
          return this.key === other.key && this.value === other.value;
        }
        return false;
      }
      substituteConstants() {
        return this;
      }
      evaluate(context) {
        if (typeof this.value === "string") {
          return false;
        }
        return parseFloat(context.getValue(this.key)) <= this.value;
      }
      serialize() {
        return `${this.key} <= ${this.value}`;
      }
      keys() {
        return [this.key];
      }
      map(mapFnc) {
        return mapFnc.mapSmallerEquals(this.key, this.value);
      }
      negate() {
        if (!this.negated) {
          this.negated = ContextKeyGreaterExpr.create(this.key, this.value, this);
        }
        return this.negated;
      }
    };
    ContextKeyRegexExpr = class _ContextKeyRegexExpr {
      constructor(key, regexp2) {
        this.key = key;
        this.regexp = regexp2;
        this.type = 7 /* Regex */;
        this.negated = null;
      }
      static create(key, regexp2) {
        return new _ContextKeyRegexExpr(key, regexp2);
      }
      cmp(other) {
        if (other.type !== this.type) {
          return this.type - other.type;
        }
        if (this.key < other.key) {
          return -1;
        }
        if (this.key > other.key) {
          return 1;
        }
        const thisSource = this.regexp ? this.regexp.source : "";
        const otherSource = other.regexp ? other.regexp.source : "";
        if (thisSource < otherSource) {
          return -1;
        }
        if (thisSource > otherSource) {
          return 1;
        }
        return 0;
      }
      equals(other) {
        if (other.type === this.type) {
          const thisSource = this.regexp ? this.regexp.source : "";
          const otherSource = other.regexp ? other.regexp.source : "";
          return this.key === other.key && thisSource === otherSource;
        }
        return false;
      }
      substituteConstants() {
        return this;
      }
      evaluate(context) {
        const value = context.getValue(this.key);
        return this.regexp ? this.regexp.test(value) : false;
      }
      serialize() {
        const value = this.regexp ? `/${this.regexp.source}/${this.regexp.flags}` : "/invalid/";
        return `${this.key} =~ ${value}`;
      }
      keys() {
        return [this.key];
      }
      map(mapFnc) {
        return mapFnc.mapRegex(this.key, this.regexp);
      }
      negate() {
        if (!this.negated) {
          this.negated = ContextKeyNotRegexExpr.create(this);
        }
        return this.negated;
      }
    };
    ContextKeyNotRegexExpr = class _ContextKeyNotRegexExpr {
      constructor(_actual) {
        this._actual = _actual;
        this.type = 8 /* NotRegex */;
      }
      static create(actual) {
        return new _ContextKeyNotRegexExpr(actual);
      }
      cmp(other) {
        if (other.type !== this.type) {
          return this.type - other.type;
        }
        return this._actual.cmp(other._actual);
      }
      equals(other) {
        if (other.type === this.type) {
          return this._actual.equals(other._actual);
        }
        return false;
      }
      substituteConstants() {
        return this;
      }
      evaluate(context) {
        return !this._actual.evaluate(context);
      }
      serialize() {
        return `!(${this._actual.serialize()})`;
      }
      keys() {
        return this._actual.keys();
      }
      map(mapFnc) {
        return new _ContextKeyNotRegexExpr(this._actual.map(mapFnc));
      }
      negate() {
        return this._actual;
      }
    };
    ContextKeyAndExpr = class _ContextKeyAndExpr {
      constructor(expr, negated) {
        this.expr = expr;
        this.negated = negated;
        this.type = 6 /* And */;
      }
      static create(_expr, negated, extraRedundantCheck) {
        return _ContextKeyAndExpr._normalizeArr(_expr, negated, extraRedundantCheck);
      }
      cmp(other) {
        if (other.type !== this.type) {
          return this.type - other.type;
        }
        if (this.expr.length < other.expr.length) {
          return -1;
        }
        if (this.expr.length > other.expr.length) {
          return 1;
        }
        for (let i = 0, len = this.expr.length; i < len; i++) {
          const r = cmp(this.expr[i], other.expr[i]);
          if (r !== 0) {
            return r;
          }
        }
        return 0;
      }
      equals(other) {
        if (other.type === this.type) {
          if (this.expr.length !== other.expr.length) {
            return false;
          }
          for (let i = 0, len = this.expr.length; i < len; i++) {
            if (!this.expr[i].equals(other.expr[i])) {
              return false;
            }
          }
          return true;
        }
        return false;
      }
      substituteConstants() {
        const exprArr = eliminateConstantsInArray(this.expr);
        if (exprArr === this.expr) {
          return this;
        }
        return _ContextKeyAndExpr.create(exprArr, this.negated, false);
      }
      evaluate(context) {
        for (let i = 0, len = this.expr.length; i < len; i++) {
          if (!this.expr[i].evaluate(context)) {
            return false;
          }
        }
        return true;
      }
      static _normalizeArr(arr, negated, extraRedundantCheck) {
        const expr = [];
        let hasTrue = false;
        for (const e of arr) {
          if (!e) {
            continue;
          }
          if (e.type === 1 /* True */) {
            hasTrue = true;
            continue;
          }
          if (e.type === 0 /* False */) {
            return ContextKeyFalseExpr.INSTANCE;
          }
          if (e.type === 6 /* And */) {
            expr.push(...e.expr);
            continue;
          }
          expr.push(e);
        }
        if (expr.length === 0 && hasTrue) {
          return ContextKeyTrueExpr.INSTANCE;
        }
        if (expr.length === 0) {
          return void 0;
        }
        if (expr.length === 1) {
          return expr[0];
        }
        expr.sort(cmp);
        for (let i = 1; i < expr.length; i++) {
          if (expr[i - 1].equals(expr[i])) {
            expr.splice(i, 1);
            i--;
          }
        }
        if (expr.length === 1) {
          return expr[0];
        }
        while (expr.length > 1) {
          const lastElement = expr[expr.length - 1];
          if (lastElement.type !== 9 /* Or */) {
            break;
          }
          expr.pop();
          const secondToLastElement = expr.pop();
          const isFinished = expr.length === 0;
          const resultElement = ContextKeyOrExpr.create(
            lastElement.expr.map((el) => _ContextKeyAndExpr.create([el, secondToLastElement], null, extraRedundantCheck)),
            null,
            isFinished
          );
          if (resultElement) {
            expr.push(resultElement);
            expr.sort(cmp);
          }
        }
        if (expr.length === 1) {
          return expr[0];
        }
        if (extraRedundantCheck) {
          for (let i = 0; i < expr.length; i++) {
            for (let j = i + 1; j < expr.length; j++) {
              if (expr[i].negate().equals(expr[j])) {
                return ContextKeyFalseExpr.INSTANCE;
              }
            }
          }
          if (expr.length === 1) {
            return expr[0];
          }
        }
        return new _ContextKeyAndExpr(expr, negated);
      }
      serialize() {
        return this.expr.map((e) => e.serialize()).join(" && ");
      }
      keys() {
        const result = [];
        for (const expr of this.expr) {
          result.push(...expr.keys());
        }
        return result;
      }
      map(mapFnc) {
        return new _ContextKeyAndExpr(this.expr.map((expr) => expr.map(mapFnc)), null);
      }
      negate() {
        if (!this.negated) {
          const result = [];
          for (const expr of this.expr) {
            result.push(expr.negate());
          }
          this.negated = ContextKeyOrExpr.create(result, this, true);
        }
        return this.negated;
      }
    };
    ContextKeyOrExpr = class _ContextKeyOrExpr {
      constructor(expr, negated) {
        this.expr = expr;
        this.negated = negated;
        this.type = 9 /* Or */;
      }
      static create(_expr, negated, extraRedundantCheck) {
        return _ContextKeyOrExpr._normalizeArr(_expr, negated, extraRedundantCheck);
      }
      cmp(other) {
        if (other.type !== this.type) {
          return this.type - other.type;
        }
        if (this.expr.length < other.expr.length) {
          return -1;
        }
        if (this.expr.length > other.expr.length) {
          return 1;
        }
        for (let i = 0, len = this.expr.length; i < len; i++) {
          const r = cmp(this.expr[i], other.expr[i]);
          if (r !== 0) {
            return r;
          }
        }
        return 0;
      }
      equals(other) {
        if (other.type === this.type) {
          if (this.expr.length !== other.expr.length) {
            return false;
          }
          for (let i = 0, len = this.expr.length; i < len; i++) {
            if (!this.expr[i].equals(other.expr[i])) {
              return false;
            }
          }
          return true;
        }
        return false;
      }
      substituteConstants() {
        const exprArr = eliminateConstantsInArray(this.expr);
        if (exprArr === this.expr) {
          return this;
        }
        return _ContextKeyOrExpr.create(exprArr, this.negated, false);
      }
      evaluate(context) {
        for (let i = 0, len = this.expr.length; i < len; i++) {
          if (this.expr[i].evaluate(context)) {
            return true;
          }
        }
        return false;
      }
      static _normalizeArr(arr, negated, extraRedundantCheck) {
        let expr = [];
        let hasFalse = false;
        if (arr) {
          for (let i = 0, len = arr.length; i < len; i++) {
            const e = arr[i];
            if (!e) {
              continue;
            }
            if (e.type === 0 /* False */) {
              hasFalse = true;
              continue;
            }
            if (e.type === 1 /* True */) {
              return ContextKeyTrueExpr.INSTANCE;
            }
            if (e.type === 9 /* Or */) {
              expr = expr.concat(e.expr);
              continue;
            }
            expr.push(e);
          }
          if (expr.length === 0 && hasFalse) {
            return ContextKeyFalseExpr.INSTANCE;
          }
          expr.sort(cmp);
        }
        if (expr.length === 0) {
          return void 0;
        }
        if (expr.length === 1) {
          return expr[0];
        }
        for (let i = 1; i < expr.length; i++) {
          if (expr[i - 1].equals(expr[i])) {
            expr.splice(i, 1);
            i--;
          }
        }
        if (expr.length === 1) {
          return expr[0];
        }
        if (extraRedundantCheck) {
          for (let i = 0; i < expr.length; i++) {
            for (let j = i + 1; j < expr.length; j++) {
              if (expr[i].negate().equals(expr[j])) {
                return ContextKeyTrueExpr.INSTANCE;
              }
            }
          }
          if (expr.length === 1) {
            return expr[0];
          }
        }
        return new _ContextKeyOrExpr(expr, negated);
      }
      serialize() {
        return this.expr.map((e) => e.serialize()).join(" || ");
      }
      keys() {
        const result = [];
        for (const expr of this.expr) {
          result.push(...expr.keys());
        }
        return result;
      }
      map(mapFnc) {
        return new _ContextKeyOrExpr(this.expr.map((expr) => expr.map(mapFnc)), null);
      }
      negate() {
        if (!this.negated) {
          const result = [];
          for (const expr of this.expr) {
            result.push(expr.negate());
          }
          while (result.length > 1) {
            const LEFT = result.shift();
            const RIGHT = result.shift();
            const all = [];
            for (const left of getTerminals(LEFT)) {
              for (const right of getTerminals(RIGHT)) {
                all.push(ContextKeyAndExpr.create([left, right], null, false));
              }
            }
            result.unshift(_ContextKeyOrExpr.create(all, null, false));
          }
          this.negated = _ContextKeyOrExpr.create(result, this, true);
        }
        return this.negated;
      }
    };
    RawContextKey = class _RawContextKey extends ContextKeyDefinedExpr {
      static {
        this._info = [];
      }
      static all() {
        return _RawContextKey._info.values();
      }
      constructor(key, defaultValue, metaOrHide) {
        super(key, null);
        this._defaultValue = defaultValue;
        if (typeof metaOrHide === "object") {
          _RawContextKey._info.push({ ...metaOrHide, key });
        } else if (metaOrHide !== true) {
          _RawContextKey._info.push({ key, description: metaOrHide, type: defaultValue !== null && defaultValue !== void 0 ? typeof defaultValue : void 0 });
        }
      }
      bindTo(target) {
        return target.createKey(this.key, this._defaultValue);
      }
      getValue(target) {
        return target.getContextKeyValue(this.key);
      }
      toNegated() {
        return this.negate();
      }
      isEqualTo(value) {
        return ContextKeyEqualsExpr.create(this.key, value);
      }
      notEqualsTo(value) {
        return ContextKeyNotEqualsExpr.create(this.key, value);
      }
      greater(value) {
        return ContextKeyGreaterExpr.create(this.key, value);
      }
    };
    IContextKeyService = createDecorator("contextKeyService");
  }
});
export { cmp, withFloatOrStr, eliminateConstantsInArray, cmp1, cmp2, getTerminals, CONSTANT_VALUES, hasOwnProperty2, defaultConfig, errorEmptyString, hintEmptyString, errorNoInAfterNot, errorClosingParenthesis, errorUnexpectedToken, hintUnexpectedToken, errorUnexpectedEOF, hintUnexpectedEOF, Parser, ContextKeyExpr, ContextKeyFalseExpr, ContextKeyTrueExpr, ContextKeyDefinedExpr, ContextKeyEqualsExpr, ContextKeyInExpr, ContextKeyNotInExpr, ContextKeyNotEqualsExpr, ContextKeyNotExpr, ContextKeyGreaterExpr, ContextKeyGreaterEqualsExpr, ContextKeySmallerExpr, ContextKeySmallerEqualsExpr, ContextKeyRegexExpr, ContextKeyNotRegexExpr, ContextKeyAndExpr, ContextKeyOrExpr, RawContextKey, IContextKeyService, init_contextkey };
