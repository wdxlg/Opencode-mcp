// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/json.ts



// src/vs/base/common/json.ts
var ParseOptions;

((ParseOptions2) => {
  ParseOptions2.DEFAULT = {
    allowTrailingComma: true
  };
})(ParseOptions || (ParseOptions = {}));

function createScanner(text2, ignoreTrivia = false) {
  let pos = 0;
  const len = text2.length;
  let value2 = "";
  let tokenOffset = 0;
  let token = 16 /* Unknown */;
  let scanError = 0 /* None */;
  function scanHexDigits(count2) {
    let digits = 0;
    let hexValue = 0;
    while (digits < count2) {
      const ch = text2.charCodeAt(pos);
      if (ch >= 48 /* _0 */ && ch <= 57 /* _9 */) {
        hexValue = hexValue * 16 + ch - 48 /* _0 */;
      } else if (ch >= 65 /* A */ && ch <= 70 /* F */) {
        hexValue = hexValue * 16 + ch - 65 /* A */ + 10;
      } else if (ch >= 97 /* a */ && ch <= 102 /* f */) {
        hexValue = hexValue * 16 + ch - 97 /* a */ + 10;
      } else {
        break;
      }
      pos++;
      digits++;
    }
    if (digits < count2) {
      hexValue = -1;
    }
    return hexValue;
  }
  function setPosition(newPosition) {
    pos = newPosition;
    value2 = "";
    tokenOffset = 0;
    token = 16 /* Unknown */;
    scanError = 0 /* None */;
  }
  function scanNumber() {
    const start = pos;
    if (text2.charCodeAt(pos) === 48 /* _0 */) {
      pos++;
    } else {
      pos++;
      while (pos < text2.length && isDigit(text2.charCodeAt(pos))) {
        pos++;
      }
    }
    if (pos < text2.length && text2.charCodeAt(pos) === 46 /* dot */) {
      pos++;
      if (pos < text2.length && isDigit(text2.charCodeAt(pos))) {
        pos++;
        while (pos < text2.length && isDigit(text2.charCodeAt(pos))) {
          pos++;
        }
      } else {
        scanError = 3 /* UnexpectedEndOfNumber */;
        return text2.substring(start, pos);
      }
    }
    let end = pos;
    if (pos < text2.length && (text2.charCodeAt(pos) === 69 /* E */ || text2.charCodeAt(pos) === 101 /* e */)) {
      pos++;
      if (pos < text2.length && text2.charCodeAt(pos) === 43 /* plus */ || text2.charCodeAt(pos) === 45 /* minus */) {
        pos++;
      }
      if (pos < text2.length && isDigit(text2.charCodeAt(pos))) {
        pos++;
        while (pos < text2.length && isDigit(text2.charCodeAt(pos))) {
          pos++;
        }
        end = pos;
      } else {
        scanError = 3 /* UnexpectedEndOfNumber */;
      }
    }
    return text2.substring(start, end);
  }
  function scanString() {
    let result = "", start = pos;
    while (true) {
      if (pos >= len) {
        result += text2.substring(start, pos);
        scanError = 2 /* UnexpectedEndOfString */;
        break;
      }
      const ch = text2.charCodeAt(pos);
      if (ch === 34 /* doubleQuote */) {
        result += text2.substring(start, pos);
        pos++;
        break;
      }
      if (ch === 92 /* backslash */) {
        result += text2.substring(start, pos);
        pos++;
        if (pos >= len) {
          scanError = 2 /* UnexpectedEndOfString */;
          break;
        }
        const ch2 = text2.charCodeAt(pos++);
        switch (ch2) {
          case 34 /* doubleQuote */:
            result += '"';
            break;
          case 92 /* backslash */:
            result += "\\";
            break;
          case 47 /* slash */:
            result += "/";
            break;
          case 98 /* b */:
            result += "\b";
            break;
          case 102 /* f */:
            result += "\f";
            break;
          case 110 /* n */:
            result += "\n";
            break;
          case 114 /* r */:
            result += "\r";
            break;
          case 116 /* t */:
            result += "	";
            break;
          case 117 /* u */: {
            const ch3 = scanHexDigits(4);
            if (ch3 >= 0) {
              result += String.fromCharCode(ch3);
            } else {
              scanError = 4 /* InvalidUnicode */;
            }
            break;
          }
          default:
            scanError = 5 /* InvalidEscapeCharacter */;
        }
        start = pos;
        continue;
      }
      if (ch >= 0 && ch <= 31) {
        if (isLineBreak(ch)) {
          result += text2.substring(start, pos);
          scanError = 2 /* UnexpectedEndOfString */;
          break;
        } else {
          scanError = 6 /* InvalidCharacter */;
        }
      }
      pos++;
    }
    return result;
  }
  function scanNext() {
    value2 = "";
    scanError = 0 /* None */;
    tokenOffset = pos;
    if (pos >= len) {
      tokenOffset = len;
      return token = 17 /* EOF */;
    }
    let code = text2.charCodeAt(pos);
    if (isWhitespace2(code)) {
      do {
        pos++;
        value2 += String.fromCharCode(code);
        code = text2.charCodeAt(pos);
      } while (isWhitespace2(code));
      return token = 15 /* Trivia */;
    }
    if (isLineBreak(code)) {
      pos++;
      value2 += String.fromCharCode(code);
      if (code === 13 /* carriageReturn */ && text2.charCodeAt(pos) === 10 /* lineFeed */) {
        pos++;
        value2 += "\n";
      }
      return token = 14 /* LineBreakTrivia */;
    }
    switch (code) {
      // tokens: []{}:,
      case 123 /* openBrace */:
        pos++;
        return token = 1 /* OpenBraceToken */;
      case 125 /* closeBrace */:
        pos++;
        return token = 2 /* CloseBraceToken */;
      case 91 /* openBracket */:
        pos++;
        return token = 3 /* OpenBracketToken */;
      case 93 /* closeBracket */:
        pos++;
        return token = 4 /* CloseBracketToken */;
      case 58 /* colon */:
        pos++;
        return token = 6 /* ColonToken */;
      case 44 /* comma */:
        pos++;
        return token = 5 /* CommaToken */;
      // strings
      case 34 /* doubleQuote */:
        pos++;
        value2 = scanString();
        return token = 10 /* StringLiteral */;
      // comments
      case 47 /* slash */: {
        const start = pos - 1;
        if (text2.charCodeAt(pos + 1) === 47 /* slash */) {
          pos += 2;
          while (pos < len) {
            if (isLineBreak(text2.charCodeAt(pos))) {
              break;
            }
            pos++;
          }
          value2 = text2.substring(start, pos);
          return token = 12 /* LineCommentTrivia */;
        }
        if (text2.charCodeAt(pos + 1) === 42 /* asterisk */) {
          pos += 2;
          const safeLength = len - 1;
          let commentClosed = false;
          while (pos < safeLength) {
            const ch = text2.charCodeAt(pos);
            if (ch === 42 /* asterisk */ && text2.charCodeAt(pos + 1) === 47 /* slash */) {
              pos += 2;
              commentClosed = true;
              break;
            }
            pos++;
          }
          if (!commentClosed) {
            pos++;
            scanError = 1 /* UnexpectedEndOfComment */;
          }
          value2 = text2.substring(start, pos);
          return token = 13 /* BlockCommentTrivia */;
        }
        value2 += String.fromCharCode(code);
        pos++;
        return token = 16 /* Unknown */;
      }
      // numbers
      case 45 /* minus */:
        value2 += String.fromCharCode(code);
        pos++;
        if (pos === len || !isDigit(text2.charCodeAt(pos))) {
          return token = 16 /* Unknown */;
        }
      // found a minus, followed by a number so
      // we fall through to proceed with scanning
      // numbers
      case 48 /* _0 */:
      case 49 /* _1 */:
      case 50 /* _2 */:
      case 51 /* _3 */:
      case 52 /* _4 */:
      case 53 /* _5 */:
      case 54 /* _6 */:
      case 55 /* _7 */:
      case 56 /* _8 */:
      case 57 /* _9 */:
        value2 += scanNumber();
        return token = 11 /* NumericLiteral */;
      // literals and unknown symbols
      default:
        while (pos < len && isUnknownContentCharacter(code)) {
          pos++;
          code = text2.charCodeAt(pos);
        }
        if (tokenOffset !== pos) {
          value2 = text2.substring(tokenOffset, pos);
          switch (value2) {
            case "true":
              return token = 8 /* TrueKeyword */;
            case "false":
              return token = 9 /* FalseKeyword */;
            case "null":
              return token = 7 /* NullKeyword */;
          }
          return token = 16 /* Unknown */;
        }
        value2 += String.fromCharCode(code);
        pos++;
        return token = 16 /* Unknown */;
    }
  }
  function isUnknownContentCharacter(code) {
    if (isWhitespace2(code) || isLineBreak(code)) {
      return false;
    }
    switch (code) {
      case 125 /* closeBrace */:
      case 93 /* closeBracket */:
      case 123 /* openBrace */:
      case 91 /* openBracket */:
      case 34 /* doubleQuote */:
      case 58 /* colon */:
      case 44 /* comma */:
      case 47 /* slash */:
        return false;
    }
    return true;
  }
  function scanNextNonTrivia() {
    let result;
    do {
      result = scanNext();
    } while (result >= 12 /* LineCommentTrivia */ && result <= 15 /* Trivia */);
    return result;
  }
  return {
    setPosition,
    getPosition: () => pos,
    scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
    getToken: () => token,
    getTokenValue: () => value2,
    getTokenOffset: () => tokenOffset,
    getTokenLength: () => pos - tokenOffset,
    getTokenError: () => scanError
  };
}

function isWhitespace2(ch) {
  return ch === 32 /* space */ || ch === 9 /* tab */ || ch === 11 /* verticalTab */ || ch === 12 /* formFeed */ || ch === 160 /* nonBreakingSpace */ || ch === 5760 /* ogham */ || ch >= 8192 /* enQuad */ && ch <= 8203 /* zeroWidthSpace */ || ch === 8239 /* narrowNoBreakSpace */ || ch === 8287 /* mathematicalSpace */ || ch === 12288 /* ideographicSpace */ || ch === 65279 /* byteOrderMark */;
}

function isLineBreak(ch) {
  return ch === 10 /* lineFeed */ || ch === 13 /* carriageReturn */ || ch === 8232 /* lineSeparator */ || ch === 8233 /* paragraphSeparator */;
}

function isDigit(ch) {
  return ch >= 48 /* _0 */ && ch <= 57 /* _9 */;
}

function parse5(text2, errors = [], options3 = ParseOptions.DEFAULT) {
  let currentProperty = null;
  let currentParent = [];
  const previousParents = [];
  function onValue(value2) {
    if (Array.isArray(currentParent)) {
      currentParent.push(value2);
    } else if (currentProperty !== null) {
      currentParent[currentProperty] = value2;
    }
  }
  const visitor = {
    onObjectBegin: () => {
      const object2 = {};
      onValue(object2);
      previousParents.push(currentParent);
      currentParent = object2;
      currentProperty = null;
    },
    onObjectProperty: (name) => {
      currentProperty = name;
    },
    onObjectEnd: () => {
      currentParent = previousParents.pop();
    },
    onArrayBegin: () => {
      const array3 = [];
      onValue(array3);
      previousParents.push(currentParent);
      currentParent = array3;
      currentProperty = null;
    },
    onArrayEnd: () => {
      currentParent = previousParents.pop();
    },
    onLiteralValue: onValue,
    onError: (error, offset, length) => {
      errors.push({ error, offset, length });
    }
  };
  visit(text2, visitor, options3);
  return currentParent[0];
}

function parseTree(text2, errors = [], options3 = ParseOptions.DEFAULT) {
  let currentParent = { type: "array", offset: -1, length: -1, children: [], parent: void 0 };
  function ensurePropertyComplete(endOffset) {
    if (currentParent.type === "property") {
      currentParent.length = endOffset - currentParent.offset;
      currentParent = currentParent.parent;
    }
  }
  function onValue(valueNode) {
    currentParent.children.push(valueNode);
    return valueNode;
  }
  const visitor = {
    onObjectBegin: (offset) => {
      currentParent = onValue({ type: "object", offset, length: -1, parent: currentParent, children: [] });
    },
    onObjectProperty: (name, offset, length) => {
      currentParent = onValue({ type: "property", offset, length: -1, parent: currentParent, children: [] });
      currentParent.children.push({ type: "string", value: name, offset, length, parent: currentParent });
    },
    onObjectEnd: (offset, length) => {
      currentParent.length = offset + length - currentParent.offset;
      currentParent = currentParent.parent;
      ensurePropertyComplete(offset + length);
    },
    onArrayBegin: (offset, length) => {
      currentParent = onValue({ type: "array", offset, length: -1, parent: currentParent, children: [] });
    },
    onArrayEnd: (offset, length) => {
      currentParent.length = offset + length - currentParent.offset;
      currentParent = currentParent.parent;
      ensurePropertyComplete(offset + length);
    },
    onLiteralValue: (value2, offset, length) => {
      onValue({ type: getNodeType(value2), offset, length, parent: currentParent, value: value2 });
      ensurePropertyComplete(offset + length);
    },
    onSeparator: (sep2, offset, length) => {
      if (currentParent.type === "property") {
        if (sep2 === ":") {
          currentParent.colonOffset = offset;
        } else if (sep2 === ",") {
          ensurePropertyComplete(offset);
        }
      }
    },
    onError: (error, offset, length) => {
      errors.push({ error, offset, length });
    }
  };
  visit(text2, visitor, options3);
  const result = currentParent.children[0];
  if (result) {
    delete result.parent;
  }
  return result;
}

function findNodeAtLocation(root, path) {
  if (!root) {
    return void 0;
  }
  let node = root;
  for (const segment of path) {
    if (typeof segment === "string") {
      if (node.type !== "object" || !Array.isArray(node.children)) {
        return void 0;
      }
      let found = false;
      for (const propertyNode of node.children) {
        if (Array.isArray(propertyNode.children) && propertyNode.children[0].value === segment) {
          node = propertyNode.children[1];
          found = true;
          break;
        }
      }
      if (!found) {
        return void 0;
      }
    } else {
      const index2 = segment;
      if (node.type !== "array" || index2 < 0 || !Array.isArray(node.children) || index2 >= node.children.length) {
        return void 0;
      }
      node = node.children[index2];
    }
  }
  return node;
}

function getNodePath(node) {
  if (!node.parent || !node.parent.children) {
    return [];
  }
  const path = getNodePath(node.parent);
  if (node.parent.type === "property") {
    const key3 = node.parent.children[0].value;
    path.push(key3);
  } else if (node.parent.type === "array") {
    const index2 = node.parent.children.indexOf(node);
    if (index2 !== -1) {
      path.push(index2);
    }
  }
  return path;
}

function contains(node, offset, includeRightBound = false) {
  return offset >= node.offset && offset < node.offset + node.length || includeRightBound && offset === node.offset + node.length;
}

function findNodeAtOffset(node, offset, includeRightBound = false) {
  if (contains(node, offset, includeRightBound)) {
    const children = node.children;
    if (Array.isArray(children)) {
      for (let i2 = 0; i2 < children.length && children[i2].offset <= offset; i2++) {
        const item = findNodeAtOffset(children[i2], offset, includeRightBound);
        if (item) {
          return item;
        }
      }
    }
    return node;
  }
  return void 0;
}

function visit(text2, visitor, options3 = ParseOptions.DEFAULT) {
  const _scanner = createScanner(text2, false);
  function toNoArgVisit(visitFunction) {
    return visitFunction ? () => visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength()) : () => true;
  }
  function toOneArgVisit(visitFunction) {
    return visitFunction ? (arg) => visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength()) : () => true;
  }
  const onObjectBegin = toNoArgVisit(visitor.onObjectBegin), onObjectProperty = toOneArgVisit(visitor.onObjectProperty), onObjectEnd = toNoArgVisit(visitor.onObjectEnd), onArrayBegin = toNoArgVisit(visitor.onArrayBegin), onArrayEnd = toNoArgVisit(visitor.onArrayEnd), onLiteralValue = toOneArgVisit(visitor.onLiteralValue), onSeparator = toOneArgVisit(visitor.onSeparator), onComment = toNoArgVisit(visitor.onComment), onError = toOneArgVisit(visitor.onError);
  const disallowComments = options3 && options3.disallowComments;
  const allowTrailingComma = options3 && options3.allowTrailingComma;
  function scanNext() {
    while (true) {
      const token = _scanner.scan();
      switch (_scanner.getTokenError()) {
        case 4 /* InvalidUnicode */:
          handleError(14 /* InvalidUnicode */);
          break;
        case 5 /* InvalidEscapeCharacter */:
          handleError(15 /* InvalidEscapeCharacter */);
          break;
        case 3 /* UnexpectedEndOfNumber */:
          handleError(13 /* UnexpectedEndOfNumber */);
          break;
        case 1 /* UnexpectedEndOfComment */:
          if (!disallowComments) {
            handleError(11 /* UnexpectedEndOfComment */);
          }
          break;
        case 2 /* UnexpectedEndOfString */:
          handleError(12 /* UnexpectedEndOfString */);
          break;
        case 6 /* InvalidCharacter */:
          handleError(16 /* InvalidCharacter */);
          break;
      }
      switch (token) {
        case 12 /* LineCommentTrivia */:
        case 13 /* BlockCommentTrivia */:
          if (disallowComments) {
            handleError(10 /* InvalidCommentToken */);
          } else {
            onComment();
          }
          break;
        case 16 /* Unknown */:
          handleError(1 /* InvalidSymbol */);
          break;
        case 15 /* Trivia */:
        case 14 /* LineBreakTrivia */:
          break;
        default:
          return token;
      }
    }
  }
  function handleError(error, skipUntilAfter = [], skipUntil = []) {
    onError(error);
    if (skipUntilAfter.length + skipUntil.length > 0) {
      let token = _scanner.getToken();
      while (token !== 17 /* EOF */) {
        if (skipUntilAfter.indexOf(token) !== -1) {
          scanNext();
          break;
        } else if (skipUntil.indexOf(token) !== -1) {
          break;
        }
        token = scanNext();
      }
    }
  }
  function parseString(isValue) {
    const value2 = _scanner.getTokenValue();
    if (isValue) {
      onLiteralValue(value2);
    } else {
      onObjectProperty(value2);
    }
    scanNext();
    return true;
  }
  function parseLiteral() {
    switch (_scanner.getToken()) {
      case 11 /* NumericLiteral */: {
        let value2 = 0;
        try {
          value2 = JSON.parse(_scanner.getTokenValue());
          if (typeof value2 !== "number") {
            handleError(2 /* InvalidNumberFormat */);
            value2 = 0;
          }
        } catch (e4) {
          handleError(2 /* InvalidNumberFormat */);
        }
        onLiteralValue(value2);
        break;
      }
      case 7 /* NullKeyword */:
        onLiteralValue(null);
        break;
      case 8 /* TrueKeyword */:
        onLiteralValue(true);
        break;
      case 9 /* FalseKeyword */:
        onLiteralValue(false);
        break;
      default:
        return false;
    }
    scanNext();
    return true;
  }
  function parseProperty() {
    if (_scanner.getToken() !== 10 /* StringLiteral */) {
      handleError(3 /* PropertyNameExpected */, [], [2 /* CloseBraceToken */, 5 /* CommaToken */]);
      return false;
    }
    parseString(false);
    if (_scanner.getToken() === 6 /* ColonToken */) {
      onSeparator(":");
      scanNext();
      if (!parseValue()) {
        handleError(4 /* ValueExpected */, [], [2 /* CloseBraceToken */, 5 /* CommaToken */]);
      }
    } else {
      handleError(5 /* ColonExpected */, [], [2 /* CloseBraceToken */, 5 /* CommaToken */]);
    }
    return true;
  }
  function parseObject() {
    onObjectBegin();
    scanNext();
    let needsComma = false;
    while (_scanner.getToken() !== 2 /* CloseBraceToken */ && _scanner.getToken() !== 17 /* EOF */) {
      if (_scanner.getToken() === 5 /* CommaToken */) {
        if (!needsComma) {
          handleError(4 /* ValueExpected */, [], []);
        }
        onSeparator(",");
        scanNext();
        if (_scanner.getToken() === 2 /* CloseBraceToken */ && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6 /* CommaExpected */, [], []);
      }
      if (!parseProperty()) {
        handleError(4 /* ValueExpected */, [], [2 /* CloseBraceToken */, 5 /* CommaToken */]);
      }
      needsComma = true;
    }
    onObjectEnd();
    if (_scanner.getToken() !== 2 /* CloseBraceToken */) {
      handleError(7 /* CloseBraceExpected */, [2 /* CloseBraceToken */], []);
    } else {
      scanNext();
    }
    return true;
  }
  function parseArray() {
    onArrayBegin();
    scanNext();
    let needsComma = false;
    while (_scanner.getToken() !== 4 /* CloseBracketToken */ && _scanner.getToken() !== 17 /* EOF */) {
      if (_scanner.getToken() === 5 /* CommaToken */) {
        if (!needsComma) {
          handleError(4 /* ValueExpected */, [], []);
        }
        onSeparator(",");
        scanNext();
        if (_scanner.getToken() === 4 /* CloseBracketToken */ && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6 /* CommaExpected */, [], []);
      }
      if (!parseValue()) {
        handleError(4 /* ValueExpected */, [], [4 /* CloseBracketToken */, 5 /* CommaToken */]);
      }
      needsComma = true;
    }
    onArrayEnd();
    if (_scanner.getToken() !== 4 /* CloseBracketToken */) {
      handleError(8 /* CloseBracketExpected */, [4 /* CloseBracketToken */], []);
    } else {
      scanNext();
    }
    return true;
  }
  function parseValue() {
    switch (_scanner.getToken()) {
      case 3 /* OpenBracketToken */:
        return parseArray();
      case 1 /* OpenBraceToken */:
        return parseObject();
      case 10 /* StringLiteral */:
        return parseString(true);
      default:
        return parseLiteral();
    }
  }
  scanNext();
  if (_scanner.getToken() === 17 /* EOF */) {
    if (options3.allowEmptyContent) {
      return true;
    }
    handleError(4 /* ValueExpected */, [], []);
    return false;
  }
  if (!parseValue()) {
    handleError(4 /* ValueExpected */, [], []);
    return false;
  }
  if (_scanner.getToken() !== 17 /* EOF */) {
    handleError(9 /* EndOfFileExpected */, [], []);
  }
  return true;
}

function getNodeType(value2) {
  switch (typeof value2) {
    case "boolean":
      return "boolean";
    case "number":
      return "number";
    case "string":
      return "string";
    case "object": {
      if (!value2) {
        return "null";
      } else if (Array.isArray(value2)) {
        return "array";
      }
      return "object";
    }
    default:
      return "null";
  }
}
export { createScanner, isWhitespace2, isLineBreak, isDigit, parse5, parseTree, findNodeAtLocation, getNodePath, contains, findNodeAtOffset, visit, getNodeType, ParseOptions };
