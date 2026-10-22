// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/viewModel/monospaceLineBreaksComputer.ts
import { CharacterClassifier } from "./module-0121.mjs";
import { firstNonWhitespaceIndex, isFullWidthCharacter, isHighSurrogate, isLowSurrogate } from "./module-0030.mjs";
import { LineInjectedText } from "./module-0369.mjs";
import { ModelLineProjectionData } from "./module-0368.mjs";


// src/vs/editor/common/viewModel/monospaceLineBreaksComputer.ts
var MonospaceLineBreaksComputerFactory = class _MonospaceLineBreaksComputerFactory {
  static create(options3) {
    return new _MonospaceLineBreaksComputerFactory(
      options3.get(151 /* wordWrapBreakBeforeCharacters */),
      options3.get(150 /* wordWrapBreakAfterCharacters */)
    );
  }
  constructor(breakBeforeChars, breakAfterChars) {
    this.classifier = new WrappingCharacterClassifier(breakBeforeChars, breakAfterChars);
  }
  createLineBreaksComputer(context2, fontInfo, tabSize, wrappingColumn, wrappingIndent, wordBreak, wrapOnEscapedLineFeeds) {
    const lineNumbers = [];
    const previousBreakingData = [];
    return {
      addRequest: (lineNumber, previousLineBreakData) => {
        lineNumbers.push(lineNumber);
        previousBreakingData.push(previousLineBreakData);
      },
      finalize: () => {
        const columnsForFullWidthChar = fontInfo.typicalFullwidthCharacterWidth / fontInfo.typicalHalfwidthCharacterWidth;
        const result = [];
        for (let i2 = 0, len = lineNumbers.length; i2 < len; i2++) {
          const lineNumber = lineNumbers[i2];
          const injectedText = context2.getLineInjectedText(lineNumber);
          const lineText = context2.getLineContent(lineNumber);
          const previousLineBreakData = previousBreakingData[i2];
          const isLineFeedWrappingEnabled = wrapOnEscapedLineFeeds && lineText.includes('"') && lineText.includes("\\n");
          if (previousLineBreakData && !previousLineBreakData.injectionOptions && !injectedText && !isLineFeedWrappingEnabled) {
            result[i2] = createLineBreaksFromPreviousLineBreaks(this.classifier, previousLineBreakData, lineText, tabSize, wrappingColumn, columnsForFullWidthChar, wrappingIndent, wordBreak);
          } else {
            result[i2] = createLineBreaks2(this.classifier, lineText, injectedText, tabSize, wrappingColumn, columnsForFullWidthChar, fontInfo, wrappingIndent, wordBreak, isLineFeedWrappingEnabled);
          }
        }
        arrPool1.length = 0;
        arrPool2.length = 0;
        return result;
      }
    };
  }
};

var WrappingCharacterClassifier = class extends CharacterClassifier {
  constructor(BREAK_BEFORE, BREAK_AFTER) {
    super(0 /* NONE */);
    for (let i2 = 0; i2 < BREAK_BEFORE.length; i2++) {
      this.set(BREAK_BEFORE.charCodeAt(i2), 1 /* BREAK_BEFORE */);
    }
    for (let i2 = 0; i2 < BREAK_AFTER.length; i2++) {
      this.set(BREAK_AFTER.charCodeAt(i2), 2 /* BREAK_AFTER */);
    }
  }
  get(charCode) {
    if (charCode >= 0 && charCode < 256) {
      return this._asciiMap[charCode];
    } else {
      if (charCode >= 12352 && charCode <= 12543 || charCode >= 13312 && charCode <= 19903 || charCode >= 19968 && charCode <= 40959) {
        return 3 /* BREAK_IDEOGRAPHIC */;
      }
      return this._map.get(charCode) || this._defaultValue;
    }
  }
};

var arrPool1 = [];

var arrPool2 = [];

function createLineBreaksFromPreviousLineBreaks(classifier, previousBreakingData, lineText, tabSize, firstLineBreakColumn, columnsForFullWidthChar, wrappingIndent, wordBreak) {
  if (firstLineBreakColumn === -1) {
    return null;
  }
  const len = lineText.length;
  if (len <= 1) {
    return null;
  }
  const isKeepAll = wordBreak === "keepAll";
  const prevBreakingOffsets = previousBreakingData.breakOffsets;
  const prevBreakingOffsetsVisibleColumn = previousBreakingData.breakOffsetsVisibleColumn;
  const wrappedTextIndentLength = computeWrappedTextIndentLength(lineText, tabSize, firstLineBreakColumn, columnsForFullWidthChar, wrappingIndent);
  const wrappedLineBreakColumn = firstLineBreakColumn - wrappedTextIndentLength;
  const breakingOffsets = arrPool1;
  const breakingOffsetsVisibleColumn = arrPool2;
  let breakingOffsetsCount = 0;
  let lastBreakingOffset = 0;
  let lastBreakingOffsetVisibleColumn = 0;
  let breakingColumn = firstLineBreakColumn;
  const prevLen = prevBreakingOffsets.length;
  let prevIndex = 0;
  if (prevIndex >= 0) {
    let bestDistance = Math.abs(prevBreakingOffsetsVisibleColumn[prevIndex] - breakingColumn);
    while (prevIndex + 1 < prevLen) {
      const distance = Math.abs(prevBreakingOffsetsVisibleColumn[prevIndex + 1] - breakingColumn);
      if (distance >= bestDistance) {
        break;
      }
      bestDistance = distance;
      prevIndex++;
    }
  }
  while (prevIndex < prevLen) {
    let prevBreakOffset = prevIndex < 0 ? 0 : prevBreakingOffsets[prevIndex];
    let prevBreakOffsetVisibleColumn = prevIndex < 0 ? 0 : prevBreakingOffsetsVisibleColumn[prevIndex];
    if (lastBreakingOffset > prevBreakOffset) {
      prevBreakOffset = lastBreakingOffset;
      prevBreakOffsetVisibleColumn = lastBreakingOffsetVisibleColumn;
    }
    let breakOffset = 0;
    let breakOffsetVisibleColumn = 0;
    let forcedBreakOffset = 0;
    let forcedBreakOffsetVisibleColumn = 0;
    if (prevBreakOffsetVisibleColumn <= breakingColumn) {
      let visibleColumn = prevBreakOffsetVisibleColumn;
      let prevCharCode = prevBreakOffset === 0 ? 0 /* Null */ : lineText.charCodeAt(prevBreakOffset - 1);
      let prevCharCodeClass = prevBreakOffset === 0 ? 0 /* NONE */ : classifier.get(prevCharCode);
      let entireLineFits = true;
      for (let i2 = prevBreakOffset; i2 < len; i2++) {
        const charStartOffset = i2;
        const charCode = lineText.charCodeAt(i2);
        let charCodeClass;
        let charWidth;
        if (isHighSurrogate(charCode)) {
          i2++;
          charCodeClass = 0 /* NONE */;
          charWidth = 2;
        } else {
          charCodeClass = classifier.get(charCode);
          charWidth = computeCharWidth(charCode, visibleColumn, tabSize, columnsForFullWidthChar);
        }
        if (charStartOffset > lastBreakingOffset && canBreak(prevCharCode, prevCharCodeClass, charCode, charCodeClass, isKeepAll)) {
          breakOffset = charStartOffset;
          breakOffsetVisibleColumn = visibleColumn;
        }
        visibleColumn += charWidth;
        if (visibleColumn > breakingColumn) {
          if (charStartOffset > lastBreakingOffset) {
            forcedBreakOffset = charStartOffset;
            forcedBreakOffsetVisibleColumn = visibleColumn - charWidth;
          } else {
            forcedBreakOffset = i2 + 1;
            forcedBreakOffsetVisibleColumn = visibleColumn;
          }
          if (visibleColumn - breakOffsetVisibleColumn > wrappedLineBreakColumn) {
            breakOffset = 0;
          }
          entireLineFits = false;
          break;
        }
        prevCharCode = charCode;
        prevCharCodeClass = charCodeClass;
      }
      if (entireLineFits) {
        if (breakingOffsetsCount > 0) {
          breakingOffsets[breakingOffsetsCount] = prevBreakingOffsets[prevBreakingOffsets.length - 1];
          breakingOffsetsVisibleColumn[breakingOffsetsCount] = prevBreakingOffsetsVisibleColumn[prevBreakingOffsets.length - 1];
          breakingOffsetsCount++;
        }
        break;
      }
    }
    if (breakOffset === 0) {
      let visibleColumn = prevBreakOffsetVisibleColumn;
      let charCode = lineText.charCodeAt(prevBreakOffset);
      let charCodeClass = classifier.get(charCode);
      let hitATabCharacter = false;
      for (let i2 = prevBreakOffset - 1; i2 >= lastBreakingOffset; i2--) {
        const charStartOffset = i2 + 1;
        const prevCharCode = lineText.charCodeAt(i2);
        if (prevCharCode === 9 /* Tab */) {
          hitATabCharacter = true;
          break;
        }
        let prevCharCodeClass;
        let prevCharWidth;
        if (isLowSurrogate(prevCharCode)) {
          i2--;
          prevCharCodeClass = 0 /* NONE */;
          prevCharWidth = 2;
        } else {
          prevCharCodeClass = classifier.get(prevCharCode);
          prevCharWidth = isFullWidthCharacter(prevCharCode) ? columnsForFullWidthChar : 1;
        }
        if (visibleColumn <= breakingColumn) {
          if (forcedBreakOffset === 0) {
            forcedBreakOffset = charStartOffset;
            forcedBreakOffsetVisibleColumn = visibleColumn;
          }
          if (visibleColumn <= breakingColumn - wrappedLineBreakColumn) {
            break;
          }
          if (canBreak(prevCharCode, prevCharCodeClass, charCode, charCodeClass, isKeepAll)) {
            breakOffset = charStartOffset;
            breakOffsetVisibleColumn = visibleColumn;
            break;
          }
        }
        visibleColumn -= prevCharWidth;
        charCode = prevCharCode;
        charCodeClass = prevCharCodeClass;
      }
      if (breakOffset !== 0) {
        const remainingWidthOfNextLine = wrappedLineBreakColumn - (forcedBreakOffsetVisibleColumn - breakOffsetVisibleColumn);
        if (remainingWidthOfNextLine <= tabSize) {
          const charCodeAtForcedBreakOffset = lineText.charCodeAt(forcedBreakOffset);
          let charWidth;
          if (isHighSurrogate(charCodeAtForcedBreakOffset)) {
            charWidth = 2;
          } else {
            charWidth = computeCharWidth(charCodeAtForcedBreakOffset, forcedBreakOffsetVisibleColumn, tabSize, columnsForFullWidthChar);
          }
          if (remainingWidthOfNextLine - charWidth < 0) {
            breakOffset = 0;
          }
        }
      }
      if (hitATabCharacter) {
        prevIndex--;
        continue;
      }
    }
    if (breakOffset === 0) {
      breakOffset = forcedBreakOffset;
      breakOffsetVisibleColumn = forcedBreakOffsetVisibleColumn;
    }
    if (breakOffset <= lastBreakingOffset) {
      const charCode = lineText.charCodeAt(lastBreakingOffset);
      if (isHighSurrogate(charCode)) {
        breakOffset = lastBreakingOffset + 2;
        breakOffsetVisibleColumn = lastBreakingOffsetVisibleColumn + 2;
      } else {
        breakOffset = lastBreakingOffset + 1;
        breakOffsetVisibleColumn = lastBreakingOffsetVisibleColumn + computeCharWidth(charCode, lastBreakingOffsetVisibleColumn, tabSize, columnsForFullWidthChar);
      }
    }
    lastBreakingOffset = breakOffset;
    breakingOffsets[breakingOffsetsCount] = breakOffset;
    lastBreakingOffsetVisibleColumn = breakOffsetVisibleColumn;
    breakingOffsetsVisibleColumn[breakingOffsetsCount] = breakOffsetVisibleColumn;
    breakingOffsetsCount++;
    breakingColumn = breakOffsetVisibleColumn + wrappedLineBreakColumn;
    while (prevIndex < 0 || prevIndex < prevLen && prevBreakingOffsetsVisibleColumn[prevIndex] < breakOffsetVisibleColumn) {
      prevIndex++;
    }
    let bestDistance = Math.abs(prevBreakingOffsetsVisibleColumn[prevIndex] - breakingColumn);
    while (prevIndex + 1 < prevLen) {
      const distance = Math.abs(prevBreakingOffsetsVisibleColumn[prevIndex + 1] - breakingColumn);
      if (distance >= bestDistance) {
        break;
      }
      bestDistance = distance;
      prevIndex++;
    }
  }
  if (breakingOffsetsCount === 0) {
    return null;
  }
  breakingOffsets.length = breakingOffsetsCount;
  breakingOffsetsVisibleColumn.length = breakingOffsetsCount;
  arrPool1 = previousBreakingData.breakOffsets;
  arrPool2 = previousBreakingData.breakOffsetsVisibleColumn;
  previousBreakingData.breakOffsets = breakingOffsets;
  previousBreakingData.breakOffsetsVisibleColumn = breakingOffsetsVisibleColumn;
  previousBreakingData.wrappedTextIndentLength = wrappedTextIndentLength;
  return previousBreakingData;
}

function createLineBreaks2(classifier, _lineText, injectedTexts, tabSize, firstLineBreakColumn, columnsForFullWidthChar, fontInfo, wrappingIndent, wordBreak, wrapOnEscapedLineFeeds) {
  const lineText = LineInjectedText.applyInjectedText(_lineText, injectedTexts);
  const fixedWidthRanges = LineInjectedText.getFixedWidthInjectedTextRanges(injectedTexts);
  let injectionOptions;
  let injectionOffsets;
  if (injectedTexts && injectedTexts.length > 0) {
    injectionOptions = injectedTexts.map((t2) => t2.options);
    injectionOffsets = injectedTexts.map((text2) => text2.column - 1);
  } else {
    injectionOptions = null;
    injectionOffsets = null;
  }
  if (firstLineBreakColumn === -1) {
    if (!injectionOptions) {
      return null;
    }
    return new ModelLineProjectionData(injectionOffsets, injectionOptions, [lineText.length], [], 0);
  }
  const len = lineText.length;
  if (len <= 1) {
    if (!injectionOptions) {
      return null;
    }
    return new ModelLineProjectionData(injectionOffsets, injectionOptions, [lineText.length], [], 0);
  }
  const isKeepAll = wordBreak === "keepAll";
  const wrappedTextIndentLength = computeWrappedTextIndentLength(lineText, tabSize, firstLineBreakColumn, columnsForFullWidthChar, wrappingIndent, fixedWidthRanges);
  const typicalHalfwidthCharacterWidth = fontInfo.typicalHalfwidthCharacterWidth;
  const wrappedLineBreakPixelWidth = (firstLineBreakColumn - wrappedTextIndentLength) * typicalHalfwidthCharacterWidth;
  const breakingOffsets = [];
  const breakingOffsetsVisibleColumn = [];
  let breakingOffsetsCount = 0;
  let breakOffset = 0;
  let breakOffsetVisibleColumn = 0;
  let breakOffsetPixelWidth = 0;
  let breakingPixelWidth = firstLineBreakColumn * typicalHalfwidthCharacterWidth;
  let fixedWidthRangeIndex = 0;
  const firstFixedWidthRange = fixedWidthRanges.length > 0 ? fixedWidthRanges[0] : null;
  const startsWithFixedWidth = firstFixedWidthRange && firstFixedWidthRange.startOffset === 0;
  let prevCharCode;
  let prevCharCodeClass;
  let visibleColumn;
  let currentLinePixelWidth;
  let startOffset;
  if (startsWithFixedWidth) {
    prevCharCode = 0 /* Null */;
    prevCharCodeClass = 0 /* NONE */;
    visibleColumn = computeFixedWidthRangeColumnWidth(lineText, firstFixedWidthRange, 0, tabSize, columnsForFullWidthChar);
    currentLinePixelWidth = firstFixedWidthRange.widthInEm * fontInfo.fontSize;
    startOffset = firstFixedWidthRange.endOffset;
    fixedWidthRangeIndex++;
  } else {
    prevCharCode = lineText.charCodeAt(0);
    visibleColumn = computeCharWidth(prevCharCode, 0, tabSize, columnsForFullWidthChar);
    currentLinePixelWidth = computeCharPixelWidth(prevCharCode, 0, tabSize, fontInfo);
    startOffset = 1;
    if (isHighSurrogate(prevCharCode)) {
      visibleColumn += 1;
      currentLinePixelWidth += typicalHalfwidthCharacterWidth;
      prevCharCode = lineText.charCodeAt(1);
      startOffset++;
    }
    prevCharCodeClass = classifier.get(prevCharCode);
  }
  for (let i2 = startOffset; i2 < len; i2++) {
    const fixedWidthRange = fixedWidthRanges.length > 0 && fixedWidthRangeIndex < fixedWidthRanges.length ? fixedWidthRanges[fixedWidthRangeIndex] : null;
    const charStartOffset = i2;
    let charCode = lineText.charCodeAt(i2);
    let charCodeClass;
    let charWidth;
    let charPixelWidth;
    let wrapEscapedLineFeed = false;
    if (fixedWidthRange && fixedWidthRange.startOffset === i2) {
      charCode = 0 /* Null */;
      charCodeClass = 0 /* NONE */;
      charWidth = computeFixedWidthRangeColumnWidth(lineText, fixedWidthRange, visibleColumn, tabSize, columnsForFullWidthChar);
      charPixelWidth = fixedWidthRange.widthInEm * fontInfo.fontSize;
      i2 = fixedWidthRange.endOffset - 1;
      fixedWidthRangeIndex++;
    } else if (isHighSurrogate(charCode)) {
      i2++;
      charCodeClass = 0 /* NONE */;
      charWidth = 2;
      charPixelWidth = 2 * typicalHalfwidthCharacterWidth;
    } else {
      charCodeClass = classifier.get(charCode);
      charWidth = computeCharWidth(charCode, visibleColumn, tabSize, columnsForFullWidthChar);
      charPixelWidth = computeCharPixelWidth(charCode, visibleColumn, tabSize, fontInfo);
    }
    if (wrapOnEscapedLineFeeds && isEscapedLineBreakAtPosition(lineText, charStartOffset)) {
      breakOffset = charStartOffset;
      breakOffsetVisibleColumn = visibleColumn;
      breakOffsetPixelWidth = currentLinePixelWidth;
      wrapEscapedLineFeed = true;
    } else if (canBreak(prevCharCode, prevCharCodeClass, charCode, charCodeClass, isKeepAll)) {
      breakOffset = charStartOffset;
      breakOffsetVisibleColumn = visibleColumn;
      breakOffsetPixelWidth = currentLinePixelWidth;
    }
    visibleColumn += charWidth;
    currentLinePixelWidth += charPixelWidth;
    if (currentLinePixelWidth > breakingPixelWidth || wrapEscapedLineFeed) {
      if (breakOffset === 0 || currentLinePixelWidth - breakOffsetPixelWidth > wrappedLineBreakPixelWidth) {
        breakOffset = charStartOffset;
        breakOffsetVisibleColumn = visibleColumn - charWidth;
        breakOffsetPixelWidth = currentLinePixelWidth - charPixelWidth;
      }
      const currentLineStartOffset = breakingOffsetsCount > 0 ? breakingOffsets[breakingOffsetsCount - 1] : 0;
      if (breakOffset > currentLineStartOffset) {
        breakingOffsets[breakingOffsetsCount] = breakOffset;
        breakingOffsetsVisibleColumn[breakingOffsetsCount] = breakOffsetVisibleColumn;
        breakingOffsetsCount++;
        breakingPixelWidth = breakOffsetPixelWidth + wrappedLineBreakPixelWidth;
        breakOffset = 0;
      }
    }
    prevCharCode = charCode;
    prevCharCodeClass = charCodeClass;
  }
  if (breakingOffsetsCount === 0 && (!injectedTexts || injectedTexts.length === 0)) {
    return null;
  }
  breakingOffsets[breakingOffsetsCount] = len;
  breakingOffsetsVisibleColumn[breakingOffsetsCount] = visibleColumn;
  return new ModelLineProjectionData(injectionOffsets, injectionOptions, breakingOffsets, breakingOffsetsVisibleColumn, wrappedTextIndentLength);
}

function computeCharWidth(charCode, visibleColumn, tabSize, columnsForFullWidthChar) {
  if (charCode === 9 /* Tab */) {
    return tabSize - visibleColumn % tabSize;
  }
  if (isFullWidthCharacter(charCode)) {
    return columnsForFullWidthChar;
  }
  if (charCode < 32) {
    return columnsForFullWidthChar;
  }
  return 1;
}

function tabCharacterWidth(visibleColumn, tabSize) {
  return tabSize - visibleColumn % tabSize;
}

function computeCharPixelWidth(charCode, visibleColumn, tabSize, fontInfo) {
  if (charCode === 9 /* Tab */) {
    return tabCharacterWidth(visibleColumn, tabSize) * fontInfo.typicalHalfwidthCharacterWidth;
  }
  if (isFullWidthCharacter(charCode)) {
    return fontInfo.typicalFullwidthCharacterWidth;
  }
  if (charCode < 32) {
    return fontInfo.typicalFullwidthCharacterWidth;
  }
  return fontInfo.typicalHalfwidthCharacterWidth;
}

function computeFixedWidthRangeColumnWidth(lineText, range2, visibleColumn, tabSize, columnsForFullWidthChar) {
  let width2 = 0;
  for (let i2 = range2.startOffset; i2 < range2.endOffset; i2++) {
    width2 += computeCharWidth(lineText.charCodeAt(i2), visibleColumn + width2, tabSize, columnsForFullWidthChar);
  }
  return width2;
}

function isEscapedLineBreakAtPosition(lineText, i2) {
  if (i2 >= 2 && lineText.charAt(i2 - 1) === "n") {
    let escapeCount = 0;
    for (let j = i2 - 2; j >= 0; j--) {
      if (lineText.charAt(j) === "\\") {
        escapeCount++;
      } else {
        return escapeCount % 2 === 1;
      }
    }
  }
  return false;
}

function canBreak(prevCharCode, prevCharCodeClass, charCode, charCodeClass, isKeepAll) {
  return charCode !== 32 /* Space */ && (prevCharCodeClass === 2 /* BREAK_AFTER */ && charCodeClass !== 2 /* BREAK_AFTER */ || prevCharCodeClass !== 1 /* BREAK_BEFORE */ && charCodeClass === 1 /* BREAK_BEFORE */ || !isKeepAll && prevCharCodeClass === 3 /* BREAK_IDEOGRAPHIC */ && charCodeClass !== 2 /* BREAK_AFTER */ || !isKeepAll && charCodeClass === 3 /* BREAK_IDEOGRAPHIC */ && prevCharCodeClass !== 1 /* BREAK_BEFORE */);
}

function computeWrappedTextIndentLength(lineText, tabSize, firstLineBreakColumn, columnsForFullWidthChar, wrappingIndent, fixedWidthRanges) {
  let wrappedTextIndentLength = 0;
  if (wrappingIndent !== 0 /* None */) {
    const firstNonWhitespaceIndex2 = firstNonWhitespaceIndex(lineText);
    if (firstNonWhitespaceIndex2 !== -1) {
      for (let i2 = 0; i2 < firstNonWhitespaceIndex2; i2++) {
        if (fixedWidthRanges?.[0]?.startOffset === i2) {
          break;
        }
        const charWidth = lineText.charCodeAt(i2) === 9 /* Tab */ ? tabCharacterWidth(wrappedTextIndentLength, tabSize) : 1;
        wrappedTextIndentLength += charWidth;
      }
      const numberOfAdditionalTabs = wrappingIndent === 3 /* DeepIndent */ ? 2 : wrappingIndent === 2 /* Indent */ ? 1 : 0;
      for (let i2 = 0; i2 < numberOfAdditionalTabs; i2++) {
        const charWidth = tabCharacterWidth(wrappedTextIndentLength, tabSize);
        wrappedTextIndentLength += charWidth;
      }
      if (wrappedTextIndentLength + columnsForFullWidthChar > firstLineBreakColumn) {
        wrappedTextIndentLength = 0;
      }
    }
  }
  return wrappedTextIndentLength;
}
export { createLineBreaksFromPreviousLineBreaks, createLineBreaks2, computeCharWidth, tabCharacterWidth, computeCharPixelWidth, computeFixedWidthRangeColumnWidth, isEscapedLineBreakAtPosition, canBreak, computeWrappedTextIndentLength, MonospaceLineBreaksComputerFactory, WrappingCharacterClassifier, arrPool1, arrPool2 };
