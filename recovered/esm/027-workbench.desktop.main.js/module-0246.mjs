// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/viewLayout/viewLineRenderer.ts
import { LineDecoration, LineDecorationsNormalizer } from "./module-0245.mjs";
import { StringBuilder } from "./module-0127.mjs";
import { LinePart } from "./module-0244.mjs";
import { containsRTL, firstNonWhitespaceIndex, isFullWidthCharacter, lastNonWhitespaceIndex } from "./module-0030.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/editor/common/viewLayout/viewLineRenderer.ts
var RenderLineInput = class {
  get isLTR() {
    return !this.containsRTL && this.textDirection !== 1 /* RTL */;
  }
  constructor(useMonospaceOptimizations, canUseHalfwidthRightwardsArrow, lineContent, continuesWithWrappedLine, isBasicASCII2, containsRTL2, fauxIndentLength, lineTokens, lineDecorations, tabSize, startVisibleColumn, spaceWidth, middotWidth, wsmiddotWidth, stopRenderingLineAfter, renderWhitespace, renderControlCharacters, fontLigatures, selectionsOnLine, textDirection, verticalScrollbarSize, renderNewLineWhenEmpty = false) {
    this.useMonospaceOptimizations = useMonospaceOptimizations;
    this.canUseHalfwidthRightwardsArrow = canUseHalfwidthRightwardsArrow;
    this.lineContent = lineContent;
    this.continuesWithWrappedLine = continuesWithWrappedLine;
    this.isBasicASCII = isBasicASCII2;
    this.containsRTL = containsRTL2;
    this.fauxIndentLength = fauxIndentLength;
    this.lineTokens = lineTokens;
    this.lineDecorations = lineDecorations.sort(LineDecoration.compare);
    this.tabSize = tabSize;
    this.startVisibleColumn = startVisibleColumn;
    this.spaceWidth = spaceWidth;
    this.stopRenderingLineAfter = stopRenderingLineAfter;
    this.renderWhitespace = renderWhitespace === "all" ? 4 /* All */ : renderWhitespace === "boundary" ? 1 /* Boundary */ : renderWhitespace === "selection" ? 2 /* Selection */ : renderWhitespace === "trailing" ? 3 /* Trailing */ : 0 /* None */;
    this.renderControlCharacters = renderControlCharacters;
    this.fontLigatures = fontLigatures;
    this.selectionsOnLine = selectionsOnLine && selectionsOnLine.sort((a, b) => a.start < b.start ? -1 : 1);
    this.renderNewLineWhenEmpty = renderNewLineWhenEmpty;
    this.textDirection = textDirection;
    this.verticalScrollbarSize = verticalScrollbarSize;
    const wsmiddotDiff = Math.abs(wsmiddotWidth - spaceWidth);
    const middotDiff = Math.abs(middotWidth - spaceWidth);
    if (wsmiddotDiff < middotDiff) {
      this.renderSpaceWidth = wsmiddotWidth;
      this.renderSpaceCharCode = 11825;
    } else {
      this.renderSpaceWidth = middotWidth;
      this.renderSpaceCharCode = 183;
    }
  }
  sameSelection(otherSelections) {
    if (this.selectionsOnLine === null) {
      return otherSelections === null;
    }
    if (otherSelections === null) {
      return false;
    }
    if (otherSelections.length !== this.selectionsOnLine.length) {
      return false;
    }
    for (let i2 = 0; i2 < this.selectionsOnLine.length; i2++) {
      if (!this.selectionsOnLine[i2].equals(otherSelections[i2])) {
        return false;
      }
    }
    return true;
  }
  equals(other) {
    return this.useMonospaceOptimizations === other.useMonospaceOptimizations && this.canUseHalfwidthRightwardsArrow === other.canUseHalfwidthRightwardsArrow && this.lineContent === other.lineContent && this.continuesWithWrappedLine === other.continuesWithWrappedLine && this.isBasicASCII === other.isBasicASCII && this.containsRTL === other.containsRTL && this.fauxIndentLength === other.fauxIndentLength && this.tabSize === other.tabSize && this.startVisibleColumn === other.startVisibleColumn && this.spaceWidth === other.spaceWidth && this.renderSpaceWidth === other.renderSpaceWidth && this.renderSpaceCharCode === other.renderSpaceCharCode && this.stopRenderingLineAfter === other.stopRenderingLineAfter && this.renderWhitespace === other.renderWhitespace && this.renderControlCharacters === other.renderControlCharacters && this.fontLigatures === other.fontLigatures && LineDecoration.equalsArr(this.lineDecorations, other.lineDecorations) && this.lineTokens.equals(other.lineTokens) && this.sameSelection(other.selectionsOnLine) && this.textDirection === other.textDirection && this.verticalScrollbarSize === other.verticalScrollbarSize && this.renderNewLineWhenEmpty === other.renderNewLineWhenEmpty;
  }
};

var DomPosition = class {
  constructor(partIndex, charIndex) {
    this.partIndex = partIndex;
    this.charIndex = charIndex;
  }
};

var CharacterMapping = class _CharacterMapping {
  static getPartIndex(partData) {
    return (partData & 4294901760 /* PART_INDEX_MASK */) >>> 16 /* PART_INDEX_OFFSET */;
  }
  static getCharIndex(partData) {
    return (partData & 65535 /* CHAR_INDEX_MASK */) >>> 0 /* CHAR_INDEX_OFFSET */;
  }
  constructor(length, partCount) {
    this.length = length;
    this._data = new Uint32Array(this.length);
    this._horizontalOffset = new Uint32Array(this.length);
  }
  setColumnInfo(column, partIndex, charIndex, horizontalOffset) {
    const partData = (partIndex << 16 /* PART_INDEX_OFFSET */ | charIndex << 0 /* CHAR_INDEX_OFFSET */) >>> 0;
    this._data[column - 1] = partData;
    this._horizontalOffset[column - 1] = horizontalOffset;
  }
  getHorizontalOffset(column) {
    if (this._horizontalOffset.length === 0) {
      return 0;
    }
    return this._horizontalOffset[column - 1];
  }
  charOffsetToPartData(charOffset) {
    if (this.length === 0) {
      return 0;
    }
    if (charOffset < 0) {
      return this._data[0];
    }
    if (charOffset >= this.length) {
      return this._data[this.length - 1];
    }
    return this._data[charOffset];
  }
  getDomPosition(column) {
    const partData = this.charOffsetToPartData(column - 1);
    const partIndex = _CharacterMapping.getPartIndex(partData);
    const charIndex = _CharacterMapping.getCharIndex(partData);
    return new DomPosition(partIndex, charIndex);
  }
  getColumn(domPosition, partLength) {
    const charOffset = this.partDataToCharOffset(domPosition.partIndex, partLength, domPosition.charIndex);
    return charOffset + 1;
  }
  partDataToCharOffset(partIndex, partLength, charIndex) {
    if (this.length === 0) {
      return 0;
    }
    const searchEntry = (partIndex << 16 /* PART_INDEX_OFFSET */ | charIndex << 0 /* CHAR_INDEX_OFFSET */) >>> 0;
    let min = 0;
    let max = this.length - 1;
    while (min + 1 < max) {
      const mid = min + max >>> 1;
      const midEntry = this._data[mid];
      if (midEntry === searchEntry) {
        return mid;
      } else if (midEntry > searchEntry) {
        max = mid;
      } else {
        min = mid;
      }
    }
    if (min === max) {
      return min;
    }
    const minEntry = this._data[min];
    const maxEntry = this._data[max];
    if (minEntry === searchEntry) {
      return min;
    }
    if (maxEntry === searchEntry) {
      return max;
    }
    const minPartIndex = _CharacterMapping.getPartIndex(minEntry);
    const minCharIndex = _CharacterMapping.getCharIndex(minEntry);
    const maxPartIndex = _CharacterMapping.getPartIndex(maxEntry);
    let maxCharIndex;
    if (minPartIndex !== maxPartIndex) {
      maxCharIndex = partLength;
    } else {
      maxCharIndex = _CharacterMapping.getCharIndex(maxEntry);
    }
    const minEntryDistance = charIndex - minCharIndex;
    const maxEntryDistance = maxCharIndex - charIndex;
    if (minEntryDistance <= maxEntryDistance) {
      return min;
    }
    return max;
  }
  inflate() {
    const result = [];
    for (let i2 = 0; i2 < this.length; i2++) {
      const partData = this._data[i2];
      const partIndex = _CharacterMapping.getPartIndex(partData);
      const charIndex = _CharacterMapping.getCharIndex(partData);
      const visibleColumn = this._horizontalOffset[i2];
      result.push([partIndex, charIndex, visibleColumn]);
    }
    return result;
  }
};

var RenderLineOutput = class {
  constructor(characterMapping, containsForeignElements) {
    this._renderLineOutputBrand = void 0;
    this.characterMapping = characterMapping;
    this.containsForeignElements = containsForeignElements;
  }
};

function renderViewLine(input, sb) {
  if (input.lineContent.length === 0) {
    if (input.lineDecorations.length > 0) {
      sb.appendString(`<span>`);
      let beforeCount = 0;
      let afterCount = 0;
      let containsForeignElements = 0 /* None */;
      for (const lineDecoration of input.lineDecorations) {
        if (lineDecoration.type === 1 /* Before */ || lineDecoration.type === 2 /* After */ || lineDecoration.type === 4 /* WidthOnly */) {
          sb.appendString(`<span class="`);
          sb.appendString(lineDecoration.className);
          sb.appendString(`"></span>`);
          if (lineDecoration.type === 2 /* After */) {
            containsForeignElements |= 2 /* After */;
            afterCount++;
          } else {
            containsForeignElements |= 1 /* Before */;
            beforeCount++;
          }
        }
      }
      sb.appendString(`</span>`);
      const characterMapping = new CharacterMapping(1, beforeCount + afterCount);
      characterMapping.setColumnInfo(1, beforeCount, 0, 0);
      return new RenderLineOutput(
        characterMapping,
        containsForeignElements
      );
    }
    if (input.renderNewLineWhenEmpty) {
      sb.appendString("<span><span>\n</span></span>");
    } else {
      sb.appendString("<span><span></span></span>");
    }
    return new RenderLineOutput(
      new CharacterMapping(0, 0),
      0 /* None */
    );
  }
  return _renderLine(resolveRenderLineInput(input), sb);
}

var RenderLineOutput2 = class {
  constructor(characterMapping, html3, containsForeignElements) {
    this.characterMapping = characterMapping;
    this.html = html3;
    this.containsForeignElements = containsForeignElements;
  }
};

function renderViewLine2(input) {
  const sb = new StringBuilder(1e4);
  const out = renderViewLine(input, sb);
  return new RenderLineOutput2(out.characterMapping, sb.build(), out.containsForeignElements);
}

var ResolvedRenderLineInput = class {
  constructor(fontIsMonospace, canUseHalfwidthRightwardsArrow, lineContent, len, isOverflowing, overflowingCharCount, parts, containsForeignElements, fauxIndentLength, tabSize, startVisibleColumn, spaceWidth, renderSpaceCharCode, renderWhitespace, renderControlCharacters) {
    this.fontIsMonospace = fontIsMonospace;
    this.canUseHalfwidthRightwardsArrow = canUseHalfwidthRightwardsArrow;
    this.lineContent = lineContent;
    this.len = len;
    this.isOverflowing = isOverflowing;
    this.overflowingCharCount = overflowingCharCount;
    this.parts = parts;
    this.containsForeignElements = containsForeignElements;
    this.fauxIndentLength = fauxIndentLength;
    this.tabSize = tabSize;
    this.startVisibleColumn = startVisibleColumn;
    this.spaceWidth = spaceWidth;
    this.renderSpaceCharCode = renderSpaceCharCode;
    this.renderWhitespace = renderWhitespace;
    this.renderControlCharacters = renderControlCharacters;
  }
};

function resolveRenderLineInput(input) {
  const lineContent = input.lineContent;
  let isOverflowing;
  let overflowingCharCount;
  let len;
  if (input.stopRenderingLineAfter !== -1 && input.stopRenderingLineAfter < lineContent.length) {
    isOverflowing = true;
    overflowingCharCount = lineContent.length - input.stopRenderingLineAfter;
    len = input.stopRenderingLineAfter;
  } else {
    isOverflowing = false;
    overflowingCharCount = 0;
    len = lineContent.length;
  }
  let tokens = transformAndRemoveOverflowing(lineContent, input.containsRTL, input.lineTokens, input.fauxIndentLength, len);
  if (input.renderControlCharacters && !input.isBasicASCII) {
    tokens = extractControlCharacters(lineContent, tokens);
  }
  if (input.renderWhitespace === 4 /* All */ || input.renderWhitespace === 1 /* Boundary */ || input.renderWhitespace === 2 /* Selection */ && !!input.selectionsOnLine || input.renderWhitespace === 3 /* Trailing */ && !input.continuesWithWrappedLine) {
    tokens = _applyRenderWhitespace(input, lineContent, len, tokens);
  }
  let containsForeignElements = 0 /* None */;
  if (input.lineDecorations.length > 0) {
    for (let i2 = 0, len2 = input.lineDecorations.length; i2 < len2; i2++) {
      const lineDecoration = input.lineDecorations[i2];
      if (lineDecoration.type === 3 /* RegularAffectingLetterSpacing */) {
        containsForeignElements |= 1 /* Before */;
      } else if (lineDecoration.type === 1 /* Before */) {
        containsForeignElements |= 1 /* Before */;
      } else if (lineDecoration.type === 2 /* After */) {
        containsForeignElements |= 2 /* After */;
      } else if (lineDecoration.type === 4 /* WidthOnly */) {
        containsForeignElements |= 1 /* Before */;
      }
    }
    tokens = _applyInlineDecorations(lineContent, len, tokens, input.lineDecorations);
  }
  if (!input.containsRTL) {
    tokens = splitLargeTokens(lineContent, tokens, !input.isBasicASCII || input.fontLigatures);
  } else {
    tokens = splitLeadingWhitespaceFromRTL(lineContent, tokens);
  }
  return new ResolvedRenderLineInput(
    input.useMonospaceOptimizations,
    input.canUseHalfwidthRightwardsArrow,
    lineContent,
    len,
    isOverflowing,
    overflowingCharCount,
    tokens,
    containsForeignElements,
    input.fauxIndentLength,
    input.tabSize,
    input.startVisibleColumn,
    input.spaceWidth,
    input.renderSpaceCharCode,
    input.renderWhitespace,
    input.renderControlCharacters
  );
}

function transformAndRemoveOverflowing(lineContent, lineContainsRTL, tokens, fauxIndentLength, len) {
  const result = [];
  let resultLen = 0;
  if (fauxIndentLength > 0) {
    result[resultLen++] = new LinePart(fauxIndentLength, "", 0, false);
  }
  let startOffset = fauxIndentLength;
  for (let tokenIndex = 0, tokensLen = tokens.getCount(); tokenIndex < tokensLen; tokenIndex++) {
    const endIndex = tokens.getEndOffset(tokenIndex);
    if (endIndex <= fauxIndentLength) {
      continue;
    }
    const type = tokens.getClassName(tokenIndex);
    if (endIndex >= len) {
      const tokenContainsRTL2 = lineContainsRTL ? containsRTL(lineContent.substring(startOffset, len)) : false;
      result[resultLen++] = new LinePart(len, type, 0, tokenContainsRTL2);
      break;
    }
    const tokenContainsRTL = lineContainsRTL ? containsRTL(lineContent.substring(startOffset, endIndex)) : false;
    result[resultLen++] = new LinePart(endIndex, type, 0, tokenContainsRTL);
    startOffset = endIndex;
  }
  return result;
}

function splitLargeTokens(lineContent, tokens, onlyAtSpaces) {
  let lastTokenEndIndex = 0;
  const result = [];
  let resultLen = 0;
  if (onlyAtSpaces) {
    for (let i2 = 0, len = tokens.length; i2 < len; i2++) {
      const token = tokens[i2];
      const tokenEndIndex = token.endIndex;
      if (lastTokenEndIndex + 50 /* LongToken */ < tokenEndIndex) {
        const tokenType = token.type;
        const tokenMetadata = token.metadata;
        const tokenContainsRTL = token.containsRTL;
        let lastSpaceOffset = -1;
        let currTokenStart = lastTokenEndIndex;
        for (let j = lastTokenEndIndex; j < tokenEndIndex; j++) {
          if (lineContent.charCodeAt(j) === 32 /* Space */) {
            lastSpaceOffset = j;
          }
          if (lastSpaceOffset !== -1 && j - currTokenStart >= 50 /* LongToken */) {
            result[resultLen++] = new LinePart(lastSpaceOffset + 1, tokenType, tokenMetadata, tokenContainsRTL);
            currTokenStart = lastSpaceOffset + 1;
            lastSpaceOffset = -1;
          }
        }
        if (currTokenStart !== tokenEndIndex) {
          result[resultLen++] = new LinePart(tokenEndIndex, tokenType, tokenMetadata, tokenContainsRTL);
        }
      } else {
        result[resultLen++] = token;
      }
      lastTokenEndIndex = tokenEndIndex;
    }
  } else {
    for (let i2 = 0, len = tokens.length; i2 < len; i2++) {
      const token = tokens[i2];
      const tokenEndIndex = token.endIndex;
      const diff4 = tokenEndIndex - lastTokenEndIndex;
      if (diff4 > 50 /* LongToken */) {
        const tokenType = token.type;
        const tokenMetadata = token.metadata;
        const tokenContainsRTL = token.containsRTL;
        const piecesCount = Math.ceil(diff4 / 50 /* LongToken */);
        for (let j = 1; j < piecesCount; j++) {
          const pieceEndIndex = lastTokenEndIndex + j * 50 /* LongToken */;
          result[resultLen++] = new LinePart(pieceEndIndex, tokenType, tokenMetadata, tokenContainsRTL);
        }
        result[resultLen++] = new LinePart(tokenEndIndex, tokenType, tokenMetadata, tokenContainsRTL);
      } else {
        result[resultLen++] = token;
      }
      lastTokenEndIndex = tokenEndIndex;
    }
  }
  return result;
}

function splitLeadingWhitespaceFromRTL(lineContent, tokens) {
  if (tokens.length === 0) {
    return tokens;
  }
  const firstToken = tokens[0];
  if (!firstToken.containsRTL) {
    return tokens;
  }
  const firstTokenEndIndex = firstToken.endIndex;
  let firstNonWhitespaceIndex2 = 0;
  for (let i2 = 0; i2 < firstTokenEndIndex; i2++) {
    const charCode = lineContent.charCodeAt(i2);
    if (charCode !== 32 /* Space */ && charCode !== 9 /* Tab */) {
      firstNonWhitespaceIndex2 = i2;
      break;
    }
  }
  if (firstNonWhitespaceIndex2 === 0) {
    return tokens;
  }
  const result = [];
  result.push(new LinePart(firstNonWhitespaceIndex2, firstToken.type, firstToken.metadata, false));
  result.push(new LinePart(firstTokenEndIndex, firstToken.type, firstToken.metadata, firstToken.containsRTL));
  for (let i2 = 1; i2 < tokens.length; i2++) {
    result.push(tokens[i2]);
  }
  return result;
}

function isControlCharacter(charCode) {
  if (charCode < 32) {
    return charCode !== 9 /* Tab */;
  }
  if (charCode === 127) {
    return true;
  }
  if (charCode >= 8234 && charCode <= 8238 || charCode >= 8294 && charCode <= 8297 || charCode >= 8206 && charCode <= 8207 || charCode === 1564) {
    return true;
  }
  return false;
}

function extractControlCharacters(lineContent, tokens) {
  const result = [];
  let lastLinePart = new LinePart(0, "", 0, false);
  let charOffset = 0;
  for (const token of tokens) {
    const tokenEndIndex = token.endIndex;
    for (; charOffset < tokenEndIndex; charOffset++) {
      const charCode = lineContent.charCodeAt(charOffset);
      if (isControlCharacter(charCode)) {
        if (charOffset > lastLinePart.endIndex) {
          lastLinePart = new LinePart(charOffset, token.type, token.metadata, token.containsRTL);
          result.push(lastLinePart);
        }
        lastLinePart = new LinePart(charOffset + 1, "mtkcontrol", token.metadata, false);
        result.push(lastLinePart);
      }
    }
    if (charOffset > lastLinePart.endIndex) {
      lastLinePart = new LinePart(tokenEndIndex, token.type, token.metadata, token.containsRTL);
      result.push(lastLinePart);
    }
  }
  return result;
}

function _applyRenderWhitespace(input, lineContent, len, tokens) {
  const continuesWithWrappedLine = input.continuesWithWrappedLine;
  const fauxIndentLength = input.fauxIndentLength;
  const tabSize = input.tabSize;
  const startVisibleColumn = input.startVisibleColumn;
  const useMonospaceOptimizations = input.useMonospaceOptimizations;
  const selections = input.selectionsOnLine;
  const onlyBoundary = input.renderWhitespace === 1 /* Boundary */;
  const onlyTrailing = input.renderWhitespace === 3 /* Trailing */;
  const generateLinePartForEachWhitespace = input.renderSpaceWidth !== input.spaceWidth;
  const result = [];
  let resultLen = 0;
  let tokenIndex = 0;
  let tokenType = tokens[tokenIndex].type;
  let tokenContainsRTL = tokens[tokenIndex].containsRTL;
  let tokenEndIndex = tokens[tokenIndex].endIndex;
  const tokensLength = tokens.length;
  let lineIsEmptyOrWhitespace = false;
  let firstNonWhitespaceIndex2 = firstNonWhitespaceIndex(lineContent);
  let lastNonWhitespaceIndex2;
  if (firstNonWhitespaceIndex2 === -1) {
    lineIsEmptyOrWhitespace = true;
    firstNonWhitespaceIndex2 = len;
    lastNonWhitespaceIndex2 = len;
  } else {
    lastNonWhitespaceIndex2 = lastNonWhitespaceIndex(lineContent);
  }
  let wasInWhitespace = false;
  let currentSelectionIndex = 0;
  let currentSelection = selections && selections[currentSelectionIndex];
  let tmpIndent = startVisibleColumn % tabSize;
  for (let charIndex = fauxIndentLength; charIndex < len; charIndex++) {
    const chCode = lineContent.charCodeAt(charIndex);
    if (currentSelection && currentSelection.endExclusive <= charIndex) {
      currentSelectionIndex++;
      currentSelection = selections && selections[currentSelectionIndex];
    }
    let isInWhitespace;
    if (charIndex < firstNonWhitespaceIndex2 || charIndex > lastNonWhitespaceIndex2) {
      isInWhitespace = true;
    } else if (chCode === 9 /* Tab */) {
      isInWhitespace = true;
    } else if (chCode === 32 /* Space */) {
      if (onlyBoundary) {
        if (wasInWhitespace) {
          isInWhitespace = true;
        } else {
          const nextChCode = charIndex + 1 < len ? lineContent.charCodeAt(charIndex + 1) : 0 /* Null */;
          isInWhitespace = nextChCode === 32 /* Space */ || nextChCode === 9 /* Tab */;
        }
      } else {
        isInWhitespace = true;
      }
    } else {
      isInWhitespace = false;
    }
    if (isInWhitespace && selections) {
      isInWhitespace = !!currentSelection && currentSelection.start <= charIndex && charIndex < currentSelection.endExclusive;
    }
    if (isInWhitespace && onlyTrailing) {
      isInWhitespace = lineIsEmptyOrWhitespace || charIndex > lastNonWhitespaceIndex2;
    }
    if (isInWhitespace && tokenContainsRTL) {
      if (charIndex >= firstNonWhitespaceIndex2 && charIndex <= lastNonWhitespaceIndex2) {
        isInWhitespace = false;
      }
    }
    if (wasInWhitespace) {
      if (!isInWhitespace || !useMonospaceOptimizations && tmpIndent >= tabSize) {
        if (generateLinePartForEachWhitespace) {
          const lastEndIndex = resultLen > 0 ? result[resultLen - 1].endIndex : fauxIndentLength;
          for (let i2 = lastEndIndex + 1; i2 <= charIndex; i2++) {
            result[resultLen++] = new LinePart(i2, "mtkw", 1 /* IS_WHITESPACE */, false);
          }
        } else {
          result[resultLen++] = new LinePart(charIndex, "mtkw", 1 /* IS_WHITESPACE */, false);
        }
        tmpIndent = tmpIndent % tabSize;
      }
    } else {
      if (charIndex === tokenEndIndex || isInWhitespace && charIndex > fauxIndentLength) {
        result[resultLen++] = new LinePart(charIndex, tokenType, 0, tokenContainsRTL);
        tmpIndent = tmpIndent % tabSize;
      }
    }
    if (chCode === 9 /* Tab */) {
      tmpIndent = tabSize;
    } else if (isFullWidthCharacter(chCode)) {
      tmpIndent += 2;
    } else {
      tmpIndent++;
    }
    wasInWhitespace = isInWhitespace;
    while (charIndex === tokenEndIndex) {
      tokenIndex++;
      if (tokenIndex < tokensLength) {
        tokenType = tokens[tokenIndex].type;
        tokenContainsRTL = tokens[tokenIndex].containsRTL;
        tokenEndIndex = tokens[tokenIndex].endIndex;
      } else {
        break;
      }
    }
  }
  let generateWhitespace = false;
  if (wasInWhitespace) {
    if (continuesWithWrappedLine && onlyBoundary) {
      const lastCharCode = len > 0 ? lineContent.charCodeAt(len - 1) : 0 /* Null */;
      const prevCharCode = len > 1 ? lineContent.charCodeAt(len - 2) : 0 /* Null */;
      const isSingleTrailingSpace = lastCharCode === 32 /* Space */ && (prevCharCode !== 32 /* Space */ && prevCharCode !== 9 /* Tab */);
      if (!isSingleTrailingSpace) {
        generateWhitespace = true;
      }
    } else {
      generateWhitespace = true;
    }
  }
  if (generateWhitespace) {
    if (generateLinePartForEachWhitespace) {
      const lastEndIndex = resultLen > 0 ? result[resultLen - 1].endIndex : fauxIndentLength;
      for (let i2 = lastEndIndex + 1; i2 <= len; i2++) {
        result[resultLen++] = new LinePart(i2, "mtkw", 1 /* IS_WHITESPACE */, false);
      }
    } else {
      result[resultLen++] = new LinePart(len, "mtkw", 1 /* IS_WHITESPACE */, false);
    }
  } else {
    result[resultLen++] = new LinePart(len, tokenType, 0, tokenContainsRTL);
  }
  return result;
}

function _applyInlineDecorations(lineContent, len, tokens, _lineDecorations) {
  _lineDecorations.sort(LineDecoration.compare);
  const lineDecorations = LineDecorationsNormalizer.normalize(lineContent, _lineDecorations);
  const lineDecorationsLen = lineDecorations.length;
  let lineDecorationIndex = 0;
  const result = [];
  let resultLen = 0;
  let lastResultEndIndex = 0;
  for (let tokenIndex = 0, len2 = tokens.length; tokenIndex < len2; tokenIndex++) {
    const token = tokens[tokenIndex];
    const tokenEndIndex = token.endIndex;
    const tokenType = token.type;
    const tokenMetadata = token.metadata;
    const tokenContainsRTL = token.containsRTL;
    while (lineDecorationIndex < lineDecorationsLen && lineDecorations[lineDecorationIndex].startOffset < tokenEndIndex) {
      const lineDecoration = lineDecorations[lineDecorationIndex];
      if (lineDecoration.startOffset > lastResultEndIndex) {
        lastResultEndIndex = lineDecoration.startOffset;
        result[resultLen++] = new LinePart(lastResultEndIndex, tokenType, tokenMetadata, tokenContainsRTL);
      }
      if (lineDecoration.endOffset + 1 <= tokenEndIndex) {
        lastResultEndIndex = lineDecoration.endOffset + 1;
        result[resultLen++] = new LinePart(lastResultEndIndex, tokenType + " " + lineDecoration.className, tokenMetadata | lineDecoration.metadata, tokenContainsRTL);
        lineDecorationIndex++;
      } else {
        lastResultEndIndex = tokenEndIndex;
        result[resultLen++] = new LinePart(lastResultEndIndex, tokenType + " " + lineDecoration.className, tokenMetadata | lineDecoration.metadata, tokenContainsRTL);
        break;
      }
    }
    if (tokenEndIndex > lastResultEndIndex) {
      lastResultEndIndex = tokenEndIndex;
      result[resultLen++] = new LinePart(lastResultEndIndex, tokenType, tokenMetadata, tokenContainsRTL);
    }
  }
  const lastTokenEndIndex = tokens[tokens.length - 1].endIndex;
  if (lineDecorationIndex < lineDecorationsLen && lineDecorations[lineDecorationIndex].startOffset === lastTokenEndIndex) {
    while (lineDecorationIndex < lineDecorationsLen && lineDecorations[lineDecorationIndex].startOffset === lastTokenEndIndex) {
      const lineDecoration = lineDecorations[lineDecorationIndex];
      result[resultLen++] = new LinePart(lastResultEndIndex, lineDecoration.className, lineDecoration.metadata, false);
      lineDecorationIndex++;
    }
  }
  return result;
}

function _renderLine(input, sb) {
  const fontIsMonospace = input.fontIsMonospace;
  const canUseHalfwidthRightwardsArrow = input.canUseHalfwidthRightwardsArrow;
  const containsForeignElements = input.containsForeignElements;
  const lineContent = input.lineContent;
  const len = input.len;
  const isOverflowing = input.isOverflowing;
  const overflowingCharCount = input.overflowingCharCount;
  const parts = input.parts;
  const fauxIndentLength = input.fauxIndentLength;
  const tabSize = input.tabSize;
  const startVisibleColumn = input.startVisibleColumn;
  const spaceWidth = input.spaceWidth;
  const renderSpaceCharCode = input.renderSpaceCharCode;
  const renderWhitespace = input.renderWhitespace;
  const renderControlCharacters = input.renderControlCharacters;
  const characterMapping = new CharacterMapping(len + 1, parts.length);
  let lastCharacterMappingDefined = false;
  let charIndex = 0;
  let visibleColumn = startVisibleColumn;
  let charOffsetInPart = 0;
  let charHorizontalOffset = 0;
  let partDisplacement = 0;
  sb.appendString("<span>");
  for (let partIndex = 0, tokensLen = parts.length; partIndex < tokensLen; partIndex++) {
    const part = parts[partIndex];
    const partEndIndex = part.endIndex;
    const partType = part.type;
    const partContainsRTL = part.containsRTL;
    const partRendersWhitespace = renderWhitespace !== 0 /* None */ && part.isWhitespace();
    const partRendersWhitespaceWithWidth = partRendersWhitespace && !fontIsMonospace && (partType === "mtkw" || !containsForeignElements);
    const partIsEmptyAndHasPseudoAfter = charIndex === partEndIndex && part.isPseudoAfter();
    charOffsetInPart = 0;
    sb.appendString("<span ");
    if (partContainsRTL) {
      sb.appendString('style="unicode-bidi:isolate" ');
    }
    sb.appendString('class="');
    sb.appendString(partRendersWhitespaceWithWidth ? "mtkz" : partType);
    sb.appendASCIICharCode(34 /* DoubleQuote */);
    if (partRendersWhitespace) {
      let partWidth = 0;
      {
        let _charIndex = charIndex;
        let _visibleColumn = visibleColumn;
        for (; _charIndex < partEndIndex; _charIndex++) {
          const charCode = lineContent.charCodeAt(_charIndex);
          const charWidth = (charCode === 9 /* Tab */ ? tabSize - _visibleColumn % tabSize : 1) | 0;
          partWidth += charWidth;
          if (_charIndex >= fauxIndentLength) {
            _visibleColumn += charWidth;
          }
        }
      }
      if (partRendersWhitespaceWithWidth) {
        sb.appendString(' style="width:');
        sb.appendString(String(spaceWidth * partWidth));
        sb.appendString('px"');
      }
      sb.appendASCIICharCode(62 /* GreaterThan */);
      for (; charIndex < partEndIndex; charIndex++) {
        characterMapping.setColumnInfo(charIndex + 1, partIndex - partDisplacement, charOffsetInPart, charHorizontalOffset);
        partDisplacement = 0;
        const charCode = lineContent.charCodeAt(charIndex);
        let producedCharacters;
        let charWidth;
        if (charCode === 9 /* Tab */) {
          producedCharacters = tabSize - visibleColumn % tabSize | 0;
          charWidth = producedCharacters;
          if (!canUseHalfwidthRightwardsArrow || charWidth > 1) {
            sb.appendCharCode(8594);
          } else {
            sb.appendCharCode(65515);
          }
          for (let space = 2; space <= charWidth; space++) {
            sb.appendCharCode(160);
          }
        } else {
          producedCharacters = 2;
          charWidth = 1;
          sb.appendCharCode(renderSpaceCharCode);
          sb.appendCharCode(8204);
        }
        charOffsetInPart += producedCharacters;
        charHorizontalOffset += charWidth;
        if (charIndex >= fauxIndentLength) {
          visibleColumn += charWidth;
        }
      }
    } else {
      sb.appendASCIICharCode(62 /* GreaterThan */);
      for (; charIndex < partEndIndex; charIndex++) {
        characterMapping.setColumnInfo(charIndex + 1, partIndex - partDisplacement, charOffsetInPart, charHorizontalOffset);
        partDisplacement = 0;
        const charCode = lineContent.charCodeAt(charIndex);
        let producedCharacters = 1;
        let charWidth = 1;
        switch (charCode) {
          case 9 /* Tab */:
            producedCharacters = tabSize - visibleColumn % tabSize;
            charWidth = producedCharacters;
            for (let space = 1; space <= producedCharacters; space++) {
              sb.appendCharCode(160);
            }
            break;
          case 32 /* Space */:
            sb.appendCharCode(160);
            break;
          case 60 /* LessThan */:
            sb.appendString("&lt;");
            break;
          case 62 /* GreaterThan */:
            sb.appendString("&gt;");
            break;
          case 38 /* Ampersand */:
            sb.appendString("&amp;");
            break;
          case 0 /* Null */:
            if (renderControlCharacters) {
              sb.appendCharCode(9216);
            } else {
              sb.appendString("&#00;");
            }
            break;
          case 65279 /* UTF8_BOM */:
          case 8232 /* LINE_SEPARATOR */:
          case 8233 /* PARAGRAPH_SEPARATOR */:
          case 133 /* NEXT_LINE */:
            sb.appendCharCode(65533);
            break;
          default:
            if (isFullWidthCharacter(charCode)) {
              charWidth++;
            }
            if (renderControlCharacters && charCode < 32) {
              sb.appendCharCode(9216 + charCode);
            } else if (renderControlCharacters && charCode === 127) {
              sb.appendCharCode(9249);
            } else if (renderControlCharacters && isControlCharacter(charCode)) {
              sb.appendString("[U+");
              sb.appendString(to4CharHex(charCode));
              sb.appendString("]");
              producedCharacters = 8;
              charWidth = producedCharacters;
            } else {
              sb.appendCharCode(charCode);
            }
        }
        charOffsetInPart += producedCharacters;
        charHorizontalOffset += charWidth;
        if (charIndex >= fauxIndentLength) {
          visibleColumn += charWidth;
        }
      }
    }
    if (partIsEmptyAndHasPseudoAfter) {
      partDisplacement++;
    } else {
      partDisplacement = 0;
    }
    if (charIndex >= len && !lastCharacterMappingDefined && part.isPseudoAfter()) {
      lastCharacterMappingDefined = true;
      characterMapping.setColumnInfo(charIndex + 1, partIndex, charOffsetInPart, charHorizontalOffset);
    }
    sb.appendString("</span>");
  }
  if (!lastCharacterMappingDefined) {
    characterMapping.setColumnInfo(len + 1, parts.length - 1, charOffsetInPart, charHorizontalOffset);
  }
  if (isOverflowing) {
    sb.appendString('<span class="mtkoverflow">');
    sb.appendString(localize(978, null, renderOverflowingCharCount(overflowingCharCount)));
    sb.appendString("</span>");
  }
  sb.appendString("</span>");
  return new RenderLineOutput(characterMapping, containsForeignElements);
}

function to4CharHex(n2) {
  return n2.toString(16).toUpperCase().padStart(4, "0");
}

function renderOverflowingCharCount(n2) {
  if (n2 < 1024) {
    return localize(977, null, n2);
  }
  if (n2 < 1024 * 1024) {
    return `${(n2 / 1024).toFixed(1)} KB`;
  }
  return `${(n2 / 1024 / 1024).toFixed(1)} MB`;
}
export { renderViewLine, renderViewLine2, resolveRenderLineInput, transformAndRemoveOverflowing, splitLargeTokens, splitLeadingWhitespaceFromRTL, isControlCharacter, extractControlCharacters, _applyRenderWhitespace, _applyInlineDecorations, _renderLine, to4CharHex, renderOverflowingCharCount, RenderLineInput, DomPosition, CharacterMapping, RenderLineOutput, RenderLineOutput2, ResolvedRenderLineInput };
