// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/snippet/browser/snippetParser.ts



// src/vs/editor/contrib/snippet/browser/snippetParser.ts
var Scanner2 = class _Scanner {
  constructor() {
    this.value = "";
    this.pos = 0;
  }
  static {
    this._table = {
      [36 /* DollarSign */]: 0 /* Dollar */,
      [58 /* Colon */]: 1 /* Colon */,
      [44 /* Comma */]: 2 /* Comma */,
      [123 /* OpenCurlyBrace */]: 3 /* CurlyOpen */,
      [125 /* CloseCurlyBrace */]: 4 /* CurlyClose */,
      [92 /* Backslash */]: 5 /* Backslash */,
      [47 /* Slash */]: 6 /* Forwardslash */,
      [124 /* Pipe */]: 7 /* Pipe */,
      [43 /* Plus */]: 11 /* Plus */,
      [45 /* Dash */]: 12 /* Dash */,
      [63 /* QuestionMark */]: 13 /* QuestionMark */
    };
  }
  static isDigitCharacter(ch) {
    return ch >= 48 /* Digit0 */ && ch <= 57 /* Digit9 */;
  }
  static isVariableCharacter(ch) {
    return ch === 95 /* Underline */ || ch >= 97 /* a */ && ch <= 122 /* z */ || ch >= 65 /* A */ && ch <= 90 /* Z */;
  }
  text(value2) {
    this.value = value2;
    this.pos = 0;
  }
  tokenText(token) {
    return this.value.substr(token.pos, token.len);
  }
  next() {
    if (this.pos >= this.value.length) {
      return { type: 14 /* EOF */, pos: this.pos, len: 0 };
    }
    const pos = this.pos;
    let len = 0;
    let ch = this.value.charCodeAt(pos);
    let type;
    type = _Scanner._table[ch];
    if (typeof type === "number") {
      this.pos += 1;
      return { type, pos, len: 1 };
    }
    if (_Scanner.isDigitCharacter(ch)) {
      type = 8 /* Int */;
      do {
        len += 1;
        ch = this.value.charCodeAt(pos + len);
      } while (_Scanner.isDigitCharacter(ch));
      this.pos += len;
      return { type, pos, len };
    }
    if (_Scanner.isVariableCharacter(ch)) {
      type = 9 /* VariableName */;
      do {
        ch = this.value.charCodeAt(pos + ++len);
      } while (_Scanner.isVariableCharacter(ch) || _Scanner.isDigitCharacter(ch));
      this.pos += len;
      return { type, pos, len };
    }
    type = 10 /* Format */;
    do {
      len += 1;
      ch = this.value.charCodeAt(pos + len);
    } while (!isNaN(ch) && typeof _Scanner._table[ch] === "undefined" && !_Scanner.isDigitCharacter(ch) && !_Scanner.isVariableCharacter(ch));
    this.pos += len;
    return { type, pos, len };
  }
};

var Marker = class {
  constructor() {
    this._children = [];
  }
  appendChild(child) {
    if (child instanceof Text && this._children[this._children.length - 1] instanceof Text) {
      this._children[this._children.length - 1].value += child.value;
    } else {
      child.parent = this;
      this._children.push(child);
    }
    return this;
  }
  replace(child, others) {
    const { parent } = child;
    const idx = parent.children.indexOf(child);
    const newChildren = parent.children.slice(0);
    newChildren.splice(idx, 1, ...others);
    parent._children = newChildren;
    (function _fixParent(children, parent2) {
      for (const child2 of children) {
        child2.parent = parent2;
        _fixParent(child2.children, child2);
      }
    })(others, parent);
  }
  get children() {
    return this._children;
  }
  get rightMostDescendant() {
    if (this._children.length > 0) {
      return this._children[this._children.length - 1].rightMostDescendant;
    }
    return this;
  }
  get snippet() {
    let candidate = this;
    while (true) {
      if (!candidate) {
        return void 0;
      }
      if (candidate instanceof TextmateSnippet) {
        return candidate;
      }
      candidate = candidate.parent;
    }
  }
  toString() {
    return this.children.reduce((prev, cur) => prev + cur.toString(), "");
  }
  len() {
    return 0;
  }
};

var Text = class _Text extends Marker {
  constructor(value2) {
    super();
    this.value = value2;
  }
  static escape(value2) {
    return value2.replace(/\$|}|\\/g, "\\$&");
  }
  toString() {
    return this.value;
  }
  toTextmateString() {
    return _Text.escape(this.value);
  }
  len() {
    return this.value.length;
  }
  clone() {
    return new _Text(this.value);
  }
};

var TransformableMarker = class extends Marker {
};

var Placeholder = class _Placeholder extends TransformableMarker {
  constructor(index2) {
    super();
    this.index = index2;
  }
  static compareByIndex(a, b) {
    if (a.index === b.index) {
      return 0;
    } else if (a.isFinalTabstop) {
      return 1;
    } else if (b.isFinalTabstop) {
      return -1;
    } else if (a.index < b.index) {
      return -1;
    } else if (a.index > b.index) {
      return 1;
    } else {
      return 0;
    }
  }
  get isFinalTabstop() {
    return this.index === 0;
  }
  get choice() {
    return this._children.length === 1 && this._children[0] instanceof Choice ? this._children[0] : void 0;
  }
  toTextmateString() {
    let transformString = "";
    if (this.transform) {
      transformString = this.transform.toTextmateString();
    }
    if (this.children.length === 0 && !this.transform) {
      return `$${this.index}`;
    } else if (this.children.length === 0) {
      return `\${${this.index}${transformString}}`;
    } else if (this.choice) {
      return `\${${this.index}|${this.choice.toTextmateString()}|${transformString}}`;
    } else {
      return `\${${this.index}:${this.children.map((child) => child.toTextmateString()).join("")}${transformString}}`;
    }
  }
  clone() {
    const ret = new _Placeholder(this.index);
    if (this.transform) {
      ret.transform = this.transform.clone();
    }
    ret._children = this.children.map((child) => child.clone());
    return ret;
  }
};

var Choice = class _Choice extends Marker {
  constructor() {
    super(...arguments);
    this.options = [];
  }
  appendChild(marker) {
    if (marker instanceof Text) {
      marker.parent = this;
      this.options.push(marker);
    }
    return this;
  }
  toString() {
    return this.options[0].value;
  }
  toTextmateString() {
    return this.options.map((option2) => option2.value.replace(/\||,|\\/g, "\\$&")).join(",");
  }
  len() {
    return this.options[0].len();
  }
  clone() {
    const ret = new _Choice();
    this.options.forEach(ret.appendChild, ret);
    return ret;
  }
};

var Transform = class _Transform extends Marker {
  constructor() {
    super(...arguments);
    this.regexp = new RegExp("");
  }
  resolve(value2) {
    const _this = this;
    let didMatch = false;
    let ret = value2.replace(this.regexp, function() {
      didMatch = true;
      return _this._replace(Array.prototype.slice.call(arguments, 0, -2));
    });
    if (!didMatch && this._children.some((child) => child instanceof FormatString && Boolean(child.elseValue))) {
      ret = this._replace([]);
    }
    return ret;
  }
  _replace(groups) {
    let ret = "";
    for (const marker of this._children) {
      if (marker instanceof FormatString) {
        let value2 = groups[marker.index] || "";
        value2 = marker.resolve(value2);
        ret += value2;
      } else {
        ret += marker.toString();
      }
    }
    return ret;
  }
  toString() {
    return "";
  }
  toTextmateString() {
    return `/${this.regexp.source}/${this.children.map((c) => c.toTextmateString()).join("")}/${(this.regexp.ignoreCase ? "i" : "") + (this.regexp.global ? "g" : "")}`;
  }
  clone() {
    const ret = new _Transform();
    ret.regexp = new RegExp(this.regexp.source, (this.regexp.ignoreCase ? "i" : "") + (this.regexp.global ? "g" : ""));
    ret._children = this.children.map((child) => child.clone());
    return ret;
  }
};

var FormatString = class _FormatString extends Marker {
  constructor(index2, shorthandName, ifValue, elseValue) {
    super();
    this.index = index2;
    this.shorthandName = shorthandName;
    this.ifValue = ifValue;
    this.elseValue = elseValue;
  }
  resolve(value2) {
    if (this.shorthandName === "upcase") {
      return !value2 ? "" : value2.toLocaleUpperCase();
    } else if (this.shorthandName === "downcase") {
      return !value2 ? "" : value2.toLocaleLowerCase();
    } else if (this.shorthandName === "capitalize") {
      return !value2 ? "" : value2[0].toLocaleUpperCase() + value2.substr(1);
    } else if (this.shorthandName === "pascalcase") {
      return !value2 ? "" : this._toPascalCase(value2);
    } else if (this.shorthandName === "camelcase") {
      return !value2 ? "" : this._toCamelCase(value2);
    } else if (this.shorthandName === "kebabcase") {
      return !value2 ? "" : this._toKebabCase(value2);
    } else if (this.shorthandName === "snakecase") {
      return !value2 ? "" : this._toSnakeCase(value2);
    } else if (Boolean(value2) && typeof this.ifValue === "string") {
      return this.ifValue;
    } else if (!Boolean(value2) && typeof this.elseValue === "string") {
      return this.elseValue;
    } else {
      return value2 || "";
    }
  }
  // Note: word-based case transforms rely on uppercase/lowercase distinctions.
  // For scripts without case, transforms are effectively no-ops.
  _toKebabCase(value2) {
    const match2 = value2.match(/[\p{L}0-9]+/gu);
    if (!match2) {
      return value2;
    }
    if (!value2.match(/[\p{L}0-9]/u)) {
      return value2.trim().toLowerCase().replace(/^_+|_+$/g, "").replace(/[\s_]+/g, "-");
    }
    const cleaned = value2.trim().replace(/^_+|_+$/g, "");
    const match22 = cleaned.match(/\p{Lu}{2,}(?=\p{Lu}\p{Ll}+[0-9]*|[\s_-]|$)|\p{Lu}?\p{Ll}+[0-9]*|\p{Lu}(?=\p{Lu}\p{Ll})|\p{Lu}(?=[\s_-]|$)|[0-9]+/gu);
    if (!match22) {
      return cleaned.split(/[\s_-]+/).filter((word) => word.length > 0).map((word) => word.toLowerCase()).join("-");
    }
    return match22.map((x) => x.toLowerCase()).join("-");
  }
  _toPascalCase(value2) {
    const match2 = value2.match(/[\p{L}0-9]+/gu);
    if (!match2) {
      return value2;
    }
    return match2.map((word) => {
      return word.charAt(0).toUpperCase() + word.substr(1);
    }).join("");
  }
  _toCamelCase(value2) {
    const match2 = value2.match(/[\p{L}0-9]+/gu);
    if (!match2) {
      return value2;
    }
    return match2.map((word, index2) => {
      if (index2 === 0) {
        return word.charAt(0).toLowerCase() + word.substr(1);
      }
      return word.charAt(0).toUpperCase() + word.substr(1);
    }).join("");
  }
  _toSnakeCase(value2) {
    return value2.replace(/(\p{Ll})(\p{Lu})/gu, "$1_$2").replace(/[\s\-]+/g, "_").toLowerCase();
  }
  toTextmateString() {
    let value2 = "${";
    value2 += this.index;
    if (this.shorthandName) {
      value2 += `:/${this.shorthandName}`;
    } else if (this.ifValue && this.elseValue) {
      value2 += `:?${this.ifValue}:${this.elseValue}`;
    } else if (this.ifValue) {
      value2 += `:+${this.ifValue}`;
    } else if (this.elseValue) {
      value2 += `:-${this.elseValue}`;
    }
    value2 += "}";
    return value2;
  }
  clone() {
    const ret = new _FormatString(this.index, this.shorthandName, this.ifValue, this.elseValue);
    return ret;
  }
};

var Variable = class _Variable extends TransformableMarker {
  constructor(name) {
    super();
    this.name = name;
  }
  resolve(resolver) {
    let value2 = resolver.resolve(this);
    if (this.transform) {
      value2 = this.transform.resolve(value2 || "");
    }
    if (value2 !== void 0) {
      this._children = [new Text(value2)];
      return true;
    }
    return false;
  }
  toTextmateString() {
    let transformString = "";
    if (this.transform) {
      transformString = this.transform.toTextmateString();
    }
    if (this.children.length === 0) {
      return `\${${this.name}${transformString}}`;
    } else {
      return `\${${this.name}:${this.children.map((child) => child.toTextmateString()).join("")}${transformString}}`;
    }
  }
  clone() {
    const ret = new _Variable(this.name);
    if (this.transform) {
      ret.transform = this.transform.clone();
    }
    ret._children = this.children.map((child) => child.clone());
    return ret;
  }
};

function walk(marker, visitor) {
  const stack = [...marker];
  while (stack.length > 0) {
    const marker2 = stack.shift();
    const recurse = visitor(marker2);
    if (!recurse) {
      break;
    }
    stack.unshift(...marker2.children);
  }
}

var TextmateSnippet = class _TextmateSnippet extends Marker {
  get placeholderInfo() {
    if (!this._placeholders) {
      const all = [];
      let last;
      this.walk(function(candidate) {
        if (candidate instanceof Placeholder) {
          all.push(candidate);
          last = !last || last.index < candidate.index ? candidate : last;
        }
        return true;
      });
      this._placeholders = { all, last };
    }
    return this._placeholders;
  }
  get placeholders() {
    const { all } = this.placeholderInfo;
    return all;
  }
  offset(marker) {
    let pos = 0;
    let found = false;
    this.walk((candidate) => {
      if (candidate === marker) {
        found = true;
        return false;
      }
      pos += candidate.len();
      return true;
    });
    if (!found) {
      return -1;
    }
    return pos;
  }
  fullLen(marker) {
    let ret = 0;
    walk([marker], (marker2) => {
      ret += marker2.len();
      return true;
    });
    return ret;
  }
  enclosingPlaceholders(placeholder) {
    const ret = [];
    let { parent } = placeholder;
    while (parent) {
      if (parent instanceof Placeholder) {
        ret.push(parent);
      }
      parent = parent.parent;
    }
    return ret;
  }
  resolveVariables(resolver) {
    this.walk((candidate) => {
      if (candidate instanceof Variable) {
        if (candidate.resolve(resolver)) {
          this._placeholders = void 0;
        }
      }
      return true;
    });
    return this;
  }
  appendChild(child) {
    this._placeholders = void 0;
    return super.appendChild(child);
  }
  replace(child, others) {
    this._placeholders = void 0;
    return super.replace(child, others);
  }
  toTextmateString() {
    return this.children.reduce((prev, cur) => prev + cur.toTextmateString(), "");
  }
  clone() {
    const ret = new _TextmateSnippet();
    ret._children = this.children.map((child) => child.clone());
    return ret;
  }
  walk(visitor) {
    walk(this.children, visitor);
  }
};

var SnippetParser = class _SnippetParser {
  constructor() {
    this._scanner = new Scanner2();
    this._token = { type: 14 /* EOF */, pos: 0, len: 0 };
  }
  static escape(value2) {
    return value2.replace(/\$|}|\\/g, "\\$&");
  }
  /**
   * Takes a snippet and returns the insertable string, e.g return the snippet-string
   * without any placeholder, tabstop, variables etc...
   */
  static asInsertText(value2) {
    return new _SnippetParser().parse(value2).toString();
  }
  static guessNeedsClipboard(template2) {
    return /\${?CLIPBOARD/.test(template2);
  }
  parse(value2, insertFinalTabstop, enforceFinalTabstop) {
    const snippet = new TextmateSnippet();
    this.parseFragment(value2, snippet);
    this.ensureFinalTabstop(snippet, enforceFinalTabstop ?? false, insertFinalTabstop ?? false);
    return snippet;
  }
  parseFragment(value2, snippet) {
    const offset = snippet.children.length;
    this._scanner.text(value2);
    this._token = this._scanner.next();
    while (this._parse(snippet)) {
    }
    const placeholderDefaultValues = /* @__PURE__ */ new Map();
    const incompletePlaceholders = [];
    snippet.walk((marker) => {
      if (marker instanceof Placeholder) {
        if (marker.isFinalTabstop) {
          placeholderDefaultValues.set(0, void 0);
        } else if (!placeholderDefaultValues.has(marker.index) && marker.children.length > 0) {
          placeholderDefaultValues.set(marker.index, marker.children);
        } else {
          incompletePlaceholders.push(marker);
        }
      }
      return true;
    });
    const fillInIncompletePlaceholder = (placeholder, stack2) => {
      const defaultValues = placeholderDefaultValues.get(placeholder.index);
      if (!defaultValues) {
        return;
      }
      const clone2 = new Placeholder(placeholder.index);
      clone2.transform = placeholder.transform;
      for (const child of defaultValues) {
        const newChild = child.clone();
        clone2.appendChild(newChild);
        if (newChild instanceof Placeholder && placeholderDefaultValues.has(newChild.index) && !stack2.has(newChild.index)) {
          stack2.add(newChild.index);
          fillInIncompletePlaceholder(newChild, stack2);
          stack2.delete(newChild.index);
        }
      }
      snippet.replace(placeholder, [clone2]);
    };
    const stack = /* @__PURE__ */ new Set();
    for (const placeholder of incompletePlaceholders) {
      fillInIncompletePlaceholder(placeholder, stack);
    }
    return snippet.children.slice(offset);
  }
  ensureFinalTabstop(snippet, enforceFinalTabstop, insertFinalTabstop) {
    if (enforceFinalTabstop || insertFinalTabstop && snippet.placeholders.length > 0) {
      const finalTabstop = snippet.placeholders.find((p) => p.index === 0);
      if (!finalTabstop) {
        snippet.appendChild(new Placeholder(0));
      }
    }
  }
  _accept(type, value2) {
    if (type === void 0 || this._token.type === type) {
      const ret = !value2 ? true : this._scanner.tokenText(this._token);
      this._token = this._scanner.next();
      return ret;
    }
    return false;
  }
  _backTo(token) {
    this._scanner.pos = token.pos + token.len;
    this._token = token;
    return false;
  }
  _until(type) {
    const start = this._token;
    while (this._token.type !== type) {
      if (this._token.type === 14 /* EOF */) {
        return false;
      } else if (this._token.type === 5 /* Backslash */) {
        const nextToken = this._scanner.next();
        if (nextToken.type !== 0 /* Dollar */ && nextToken.type !== 4 /* CurlyClose */ && nextToken.type !== 5 /* Backslash */) {
          return false;
        }
      }
      this._token = this._scanner.next();
    }
    const value2 = this._scanner.value.substring(start.pos, this._token.pos).replace(/\\(\$|}|\\)/g, "$1");
    this._token = this._scanner.next();
    return value2;
  }
  _parse(marker) {
    return this._parseEscaped(marker) || this._parseTabstopOrVariableName(marker) || this._parseComplexPlaceholder(marker) || this._parseComplexVariable(marker) || this._parseAnything(marker);
  }
  // \$, \\, \} -> just text
  _parseEscaped(marker) {
    let value2;
    if (value2 = this._accept(5 /* Backslash */, true)) {
      value2 = this._accept(0 /* Dollar */, true) || this._accept(4 /* CurlyClose */, true) || this._accept(5 /* Backslash */, true) || value2;
      marker.appendChild(new Text(value2));
      return true;
    }
    return false;
  }
  // $foo -> variable, $1 -> tabstop
  _parseTabstopOrVariableName(parent) {
    let value2;
    const token = this._token;
    const match2 = this._accept(0 /* Dollar */) && (value2 = this._accept(9 /* VariableName */, true) || this._accept(8 /* Int */, true));
    if (!match2) {
      return this._backTo(token);
    }
    parent.appendChild(
      /^\d+$/.test(value2) ? new Placeholder(Number(value2)) : new Variable(value2)
    );
    return true;
  }
  // ${1:<children>}, ${1} -> placeholder
  _parseComplexPlaceholder(parent) {
    let index2;
    const token = this._token;
    const match2 = this._accept(0 /* Dollar */) && this._accept(3 /* CurlyOpen */) && (index2 = this._accept(8 /* Int */, true));
    if (!match2) {
      return this._backTo(token);
    }
    const placeholder = new Placeholder(Number(index2));
    if (this._accept(1 /* Colon */)) {
      while (true) {
        if (this._accept(4 /* CurlyClose */)) {
          parent.appendChild(placeholder);
          return true;
        }
        if (this._parse(placeholder)) {
          continue;
        }
        parent.appendChild(new Text("${" + index2 + ":"));
        placeholder.children.forEach(parent.appendChild, parent);
        return true;
      }
    } else if (placeholder.index > 0 && this._accept(7 /* Pipe */)) {
      const choice = new Choice();
      while (true) {
        if (this._parseChoiceElement(choice)) {
          if (this._accept(2 /* Comma */)) {
            continue;
          }
          if (this._accept(7 /* Pipe */)) {
            placeholder.appendChild(choice);
            if (this._accept(4 /* CurlyClose */)) {
              parent.appendChild(placeholder);
              return true;
            }
          }
        }
        this._backTo(token);
        return false;
      }
    } else if (this._accept(6 /* Forwardslash */)) {
      if (this._parseTransform(placeholder)) {
        parent.appendChild(placeholder);
        return true;
      }
      this._backTo(token);
      return false;
    } else if (this._accept(4 /* CurlyClose */)) {
      parent.appendChild(placeholder);
      return true;
    } else {
      return this._backTo(token);
    }
  }
  _parseChoiceElement(parent) {
    const token = this._token;
    const values = [];
    while (true) {
      if (this._token.type === 2 /* Comma */ || this._token.type === 7 /* Pipe */) {
        break;
      }
      let value2;
      if (value2 = this._accept(5 /* Backslash */, true)) {
        value2 = this._accept(2 /* Comma */, true) || this._accept(7 /* Pipe */, true) || this._accept(5 /* Backslash */, true) || value2;
      } else {
        value2 = this._accept(void 0, true);
      }
      if (!value2) {
        this._backTo(token);
        return false;
      }
      values.push(value2);
    }
    if (values.length === 0) {
      this._backTo(token);
      return false;
    }
    parent.appendChild(new Text(values.join("")));
    return true;
  }
  // ${foo:<children>}, ${foo} -> variable
  _parseComplexVariable(parent) {
    let name;
    const token = this._token;
    const match2 = this._accept(0 /* Dollar */) && this._accept(3 /* CurlyOpen */) && (name = this._accept(9 /* VariableName */, true));
    if (!match2) {
      return this._backTo(token);
    }
    const variable = new Variable(name);
    if (this._accept(1 /* Colon */)) {
      while (true) {
        if (this._accept(4 /* CurlyClose */)) {
          parent.appendChild(variable);
          return true;
        }
        if (this._parse(variable)) {
          continue;
        }
        parent.appendChild(new Text("${" + name + ":"));
        variable.children.forEach(parent.appendChild, parent);
        return true;
      }
    } else if (this._accept(6 /* Forwardslash */)) {
      if (this._parseTransform(variable)) {
        parent.appendChild(variable);
        return true;
      }
      this._backTo(token);
      return false;
    } else if (this._accept(4 /* CurlyClose */)) {
      parent.appendChild(variable);
      return true;
    } else {
      return this._backTo(token);
    }
  }
  _parseTransform(parent) {
    const transform2 = new Transform();
    let regexValue = "";
    let regexOptions = "";
    while (true) {
      if (this._accept(6 /* Forwardslash */)) {
        break;
      }
      let escaped;
      if (escaped = this._accept(5 /* Backslash */, true)) {
        escaped = this._accept(6 /* Forwardslash */, true) || escaped;
        regexValue += escaped;
        continue;
      }
      if (this._token.type !== 14 /* EOF */) {
        regexValue += this._accept(void 0, true);
        continue;
      }
      return false;
    }
    while (true) {
      if (this._accept(6 /* Forwardslash */)) {
        break;
      }
      let escaped;
      if (escaped = this._accept(5 /* Backslash */, true)) {
        escaped = this._accept(5 /* Backslash */, true) || this._accept(6 /* Forwardslash */, true) || escaped;
        transform2.appendChild(new Text(escaped));
        continue;
      }
      if (this._parseFormatString(transform2) || this._parseAnything(transform2)) {
        continue;
      }
      return false;
    }
    while (true) {
      if (this._accept(4 /* CurlyClose */)) {
        break;
      }
      if (this._token.type !== 14 /* EOF */) {
        regexOptions += this._accept(void 0, true);
        continue;
      }
      return false;
    }
    try {
      transform2.regexp = new RegExp(regexValue, regexOptions);
    } catch (e4) {
      return false;
    }
    parent.transform = transform2;
    return true;
  }
  _parseFormatString(parent) {
    const token = this._token;
    if (!this._accept(0 /* Dollar */)) {
      return false;
    }
    let complex = false;
    if (this._accept(3 /* CurlyOpen */)) {
      complex = true;
    }
    const index2 = this._accept(8 /* Int */, true);
    if (!index2) {
      this._backTo(token);
      return false;
    } else if (!complex) {
      parent.appendChild(new FormatString(Number(index2)));
      return true;
    } else if (this._accept(4 /* CurlyClose */)) {
      parent.appendChild(new FormatString(Number(index2)));
      return true;
    } else if (!this._accept(1 /* Colon */)) {
      this._backTo(token);
      return false;
    }
    if (this._accept(6 /* Forwardslash */)) {
      const shorthand = this._accept(9 /* VariableName */, true);
      if (!shorthand || !this._accept(4 /* CurlyClose */)) {
        this._backTo(token);
        return false;
      } else {
        parent.appendChild(new FormatString(Number(index2), shorthand));
        return true;
      }
    } else if (this._accept(11 /* Plus */)) {
      const ifValue = this._until(4 /* CurlyClose */);
      if (ifValue) {
        parent.appendChild(new FormatString(Number(index2), void 0, ifValue, void 0));
        return true;
      }
    } else if (this._accept(12 /* Dash */)) {
      const elseValue = this._until(4 /* CurlyClose */);
      if (elseValue) {
        parent.appendChild(new FormatString(Number(index2), void 0, void 0, elseValue));
        return true;
      }
    } else if (this._accept(13 /* QuestionMark */)) {
      const ifValue = this._until(1 /* Colon */);
      if (ifValue) {
        const elseValue = this._until(4 /* CurlyClose */);
        if (elseValue) {
          parent.appendChild(new FormatString(Number(index2), void 0, ifValue, elseValue));
          return true;
        }
      }
    } else {
      const elseValue = this._until(4 /* CurlyClose */);
      if (elseValue) {
        parent.appendChild(new FormatString(Number(index2), void 0, void 0, elseValue));
        return true;
      }
    }
    this._backTo(token);
    return false;
  }
  _parseAnything(marker) {
    if (this._token.type !== 14 /* EOF */) {
      marker.appendChild(new Text(this._scanner.tokenText(this._token)));
      this._accept(void 0);
      return true;
    }
    return false;
  }
};
export { walk, Scanner2, Marker, Text, TransformableMarker, Placeholder, Choice, Transform, FormatString, Variable, TextmateSnippet, SnippetParser };
