// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/languages/textToHtmlTokenizer.ts
import { NullState, nullTokenizeEncoded } from "./module-0408.mjs";
import { TokenizationRegistry2 } from "./module-0164.mjs";
import { escape, isFullWidthCharacter, splitLines } from "./module-0030.mjs";
import { LineTokens } from "./module-0145.mjs";


// src/vs/editor/common/languages/textToHtmlTokenizer.ts
var fallback = {
  getInitialState: () => NullState,
  tokenizeEncoded: (buffer, hasEOL, state) => nullTokenizeEncoded(0 /* Null */, state)
};

function tokenizeToStringSync(languageService, text2, languageId) {
  return _tokenizeToString(text2, languageService.languageIdCodec, TokenizationRegistry2.get(languageId) || fallback);
}

async function tokenizeToString(languageService, text2, languageId) {
  if (!languageId) {
    return _tokenizeToString(text2, languageService.languageIdCodec, fallback);
  }
  const tokenizationSupport = await TokenizationRegistry2.getOrCreate(languageId);
  return _tokenizeToString(text2, languageService.languageIdCodec, tokenizationSupport || fallback);
}

function tokenizeLineToHTML(text2, viewLineTokens, colorMap, startOffset, endOffset, tabSize, useNbsp) {
  let result = `<div>`;
  let charIndex = 0;
  let width2 = 0;
  let prevIsSpace = true;
  for (let tokenIndex = 0, tokenCount = viewLineTokens.getCount(); tokenIndex < tokenCount; tokenIndex++) {
    const tokenEndIndex = viewLineTokens.getEndOffset(tokenIndex);
    let partContent = "";
    for (; charIndex < tokenEndIndex && charIndex < endOffset; charIndex++) {
      const charCode = text2.charCodeAt(charIndex);
      const isTab = charCode === 9 /* Tab */;
      width2 += isFullWidthCharacter(charCode) ? 2 : isTab ? 0 : 1;
      if (charIndex < startOffset) {
        if (isTab) {
          const remainder = width2 % tabSize;
          width2 += remainder === 0 ? tabSize : tabSize - remainder;
        }
        continue;
      }
      switch (charCode) {
        case 9 /* Tab */: {
          const remainder = width2 % tabSize;
          const insertSpacesCount = remainder === 0 ? tabSize : tabSize - remainder;
          width2 += insertSpacesCount;
          let spacesRemaining = insertSpacesCount;
          while (spacesRemaining > 0) {
            if (useNbsp && prevIsSpace) {
              partContent += "&#160;";
              prevIsSpace = false;
            } else {
              partContent += " ";
              prevIsSpace = true;
            }
            spacesRemaining--;
          }
          break;
        }
        case 60 /* LessThan */:
          partContent += "&lt;";
          prevIsSpace = false;
          break;
        case 62 /* GreaterThan */:
          partContent += "&gt;";
          prevIsSpace = false;
          break;
        case 38 /* Ampersand */:
          partContent += "&amp;";
          prevIsSpace = false;
          break;
        case 0 /* Null */:
          partContent += "&#00;";
          prevIsSpace = false;
          break;
        case 65279 /* UTF8_BOM */:
        case 8232 /* LINE_SEPARATOR */:
        case 8233 /* PARAGRAPH_SEPARATOR */:
        case 133 /* NEXT_LINE */:
          partContent += "\uFFFD";
          prevIsSpace = false;
          break;
        case 13 /* CarriageReturn */:
          partContent += "&#8203";
          prevIsSpace = false;
          break;
        case 32 /* Space */:
          if (useNbsp && prevIsSpace) {
            partContent += "&#160;";
            prevIsSpace = false;
          } else {
            partContent += " ";
            prevIsSpace = true;
          }
          break;
        default:
          partContent += String.fromCharCode(charCode);
          prevIsSpace = false;
      }
    }
    if (tokenEndIndex <= startOffset) {
      continue;
    }
    result += `<span style="${viewLineTokens.getInlineStyle(tokenIndex, colorMap)}">${partContent}</span>`;
    if (tokenEndIndex > endOffset || charIndex >= endOffset || startOffset >= endOffset) {
      break;
    }
  }
  result += `</div>`;
  return result;
}

function _tokenizeToString(text2, languageIdCodec, tokenizationSupport) {
  let result = `<div class="monaco-tokenized-source">`;
  const lines = splitLines(text2);
  let currentState = tokenizationSupport.getInitialState();
  for (let i2 = 0, len = lines.length; i2 < len; i2++) {
    const line = lines[i2];
    if (i2 > 0) {
      result += `<br/>`;
    }
    const tokenizationResult = tokenizationSupport.tokenizeEncoded(line, true, currentState);
    LineTokens.convertToEndOffset(tokenizationResult.tokens, line.length);
    const lineTokens = new LineTokens(tokenizationResult.tokens, line, languageIdCodec);
    const viewLineTokens = lineTokens.inflate();
    let startOffset = 0;
    for (let j = 0, lenJ = viewLineTokens.getCount(); j < lenJ; j++) {
      const type = viewLineTokens.getClassName(j);
      const endIndex = viewLineTokens.getEndOffset(j);
      result += `<span class="${type}">${escape(line.substring(startOffset, endIndex))}</span>`;
      startOffset = endIndex;
    }
    currentState = tokenizationResult.endState;
  }
  result += `</div>`;
  return result;
}
export { tokenizeToStringSync, tokenizeToString, tokenizeLineToHTML, _tokenizeToString, fallback };
