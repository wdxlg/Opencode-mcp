// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/jsonFormatter.ts
import { createScanner } from "./module-0885.mjs";


// src/vs/base/common/jsonFormatter.ts
function format4(documentText, range2, options3) {
  let initialIndentLevel;
  let formatText;
  let formatTextStart;
  let rangeStart;
  let rangeEnd;
  if (range2) {
    rangeStart = range2.offset;
    rangeEnd = rangeStart + range2.length;
    formatTextStart = rangeStart;
    while (formatTextStart > 0 && !isEOL(documentText, formatTextStart - 1)) {
      formatTextStart--;
    }
    let endOffset = rangeEnd;
    while (endOffset < documentText.length && !isEOL(documentText, endOffset)) {
      endOffset++;
    }
    formatText = documentText.substring(formatTextStart, endOffset);
    initialIndentLevel = computeIndentLevel2(formatText, options3);
  } else {
    formatText = documentText;
    initialIndentLevel = 0;
    formatTextStart = 0;
    rangeStart = 0;
    rangeEnd = documentText.length;
  }
  const eol = getEOL(options3, documentText);
  let lineBreak = false;
  let indentLevel = 0;
  let indentValue;
  if (options3.insertSpaces) {
    indentValue = repeat2(" ", options3.tabSize || 4);
  } else {
    indentValue = "	";
  }
  const scanner = createScanner(formatText, false);
  let hasError = false;
  function newLineAndIndent() {
    return eol + repeat2(indentValue, initialIndentLevel + indentLevel);
  }
  function scanNext() {
    let token = scanner.scan();
    lineBreak = false;
    while (token === 15 /* Trivia */ || token === 14 /* LineBreakTrivia */) {
      lineBreak = lineBreak || token === 14 /* LineBreakTrivia */;
      token = scanner.scan();
    }
    hasError = token === 16 /* Unknown */ || scanner.getTokenError() !== 0 /* None */;
    return token;
  }
  const editOperations = [];
  function addEdit(text2, startOffset, endOffset) {
    if (!hasError && startOffset < rangeEnd && endOffset > rangeStart && documentText.substring(startOffset, endOffset) !== text2) {
      editOperations.push({ offset: startOffset, length: endOffset - startOffset, content: text2 });
    }
  }
  let firstToken = scanNext();
  if (firstToken !== 17 /* EOF */) {
    const firstTokenStart = scanner.getTokenOffset() + formatTextStart;
    const initialIndent = repeat2(indentValue, initialIndentLevel);
    addEdit(initialIndent, formatTextStart, firstTokenStart);
  }
  while (firstToken !== 17 /* EOF */) {
    let firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
    let secondToken = scanNext();
    let replaceContent = "";
    while (!lineBreak && (secondToken === 12 /* LineCommentTrivia */ || secondToken === 13 /* BlockCommentTrivia */)) {
      const commentTokenStart = scanner.getTokenOffset() + formatTextStart;
      addEdit(" ", firstTokenEnd, commentTokenStart);
      firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
      replaceContent = secondToken === 12 /* LineCommentTrivia */ ? newLineAndIndent() : "";
      secondToken = scanNext();
    }
    if (secondToken === 2 /* CloseBraceToken */) {
      if (firstToken !== 1 /* OpenBraceToken */) {
        indentLevel--;
        replaceContent = newLineAndIndent();
      }
    } else if (secondToken === 4 /* CloseBracketToken */) {
      if (firstToken !== 3 /* OpenBracketToken */) {
        indentLevel--;
        replaceContent = newLineAndIndent();
      }
    } else {
      switch (firstToken) {
        case 3 /* OpenBracketToken */:
        case 1 /* OpenBraceToken */:
          indentLevel++;
          replaceContent = newLineAndIndent();
          break;
        case 5 /* CommaToken */:
        case 12 /* LineCommentTrivia */:
          replaceContent = newLineAndIndent();
          break;
        case 13 /* BlockCommentTrivia */:
          if (lineBreak) {
            replaceContent = newLineAndIndent();
          } else {
            replaceContent = " ";
          }
          break;
        case 6 /* ColonToken */:
          replaceContent = " ";
          break;
        case 10 /* StringLiteral */:
          if (secondToken === 6 /* ColonToken */) {
            replaceContent = "";
            break;
          }
        // fall through
        case 7 /* NullKeyword */:
        case 8 /* TrueKeyword */:
        case 9 /* FalseKeyword */:
        case 11 /* NumericLiteral */:
        case 2 /* CloseBraceToken */:
        case 4 /* CloseBracketToken */:
          if (secondToken === 12 /* LineCommentTrivia */ || secondToken === 13 /* BlockCommentTrivia */) {
            replaceContent = " ";
          } else if (secondToken !== 5 /* CommaToken */ && secondToken !== 17 /* EOF */) {
            hasError = true;
          }
          break;
        case 16 /* Unknown */:
          hasError = true;
          break;
      }
      if (lineBreak && (secondToken === 12 /* LineCommentTrivia */ || secondToken === 13 /* BlockCommentTrivia */)) {
        replaceContent = newLineAndIndent();
      }
    }
    const secondTokenStart = scanner.getTokenOffset() + formatTextStart;
    addEdit(replaceContent, firstTokenEnd, secondTokenStart);
    firstToken = secondToken;
  }
  return editOperations;
}

function toFormattedString(obj, options3) {
  const content = JSON.stringify(obj, void 0, options3.insertSpaces ? options3.tabSize || 4 : "	");
  if (options3.eol !== void 0) {
    return content.replace(/\r\n|\r|\n/g, options3.eol);
  }
  return content;
}

function repeat2(s, count2) {
  let result = "";
  for (let i2 = 0; i2 < count2; i2++) {
    result += s;
  }
  return result;
}

function computeIndentLevel2(content, options3) {
  let i2 = 0;
  let nChars = 0;
  const tabSize = options3.tabSize || 4;
  while (i2 < content.length) {
    const ch = content.charAt(i2);
    if (ch === " ") {
      nChars++;
    } else if (ch === "	") {
      nChars += tabSize;
    } else {
      break;
    }
    i2++;
  }
  return Math.floor(nChars / tabSize);
}

function getEOL(options3, text2) {
  for (let i2 = 0; i2 < text2.length; i2++) {
    const ch = text2.charAt(i2);
    if (ch === "\r") {
      if (i2 + 1 < text2.length && text2.charAt(i2 + 1) === "\n") {
        return "\r\n";
      }
      return "\r";
    } else if (ch === "\n") {
      return "\n";
    }
  }
  return options3 && options3.eol || "\n";
}

function isEOL(text2, offset) {
  return "\r\n".indexOf(text2.charAt(offset)) !== -1;
}
export { format4, toFormattedString, repeat2, computeIndentLevel2, getEOL, isEOL };
