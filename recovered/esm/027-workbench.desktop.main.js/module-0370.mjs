// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/view/domLineBreaksComputer.ts
import { createTrustedTypesPolicy } from "./module-0280.mjs";
import { assertReturnsDefined } from "./module-0010.mjs";
import { LineInjectedText } from "./module-0369.mjs";
import { ModelLineProjectionData } from "./module-0368.mjs";
import { applyFontInfo } from "./module-0213.mjs";
import { StringBuilder } from "./module-0127.mjs";
import { firstNonWhitespaceIndex, isFullWidthCharacter } from "./module-0030.mjs";


// src/vs/editor/browser/view/domLineBreaksComputer.ts
var ttPolicy2 = createTrustedTypesPolicy("domLineBreaksComputer", { createHTML: (value2) => value2 });

var DOMLineBreaksComputerFactory = class _DOMLineBreaksComputerFactory {
  constructor(targetWindow) {
    this.targetWindow = targetWindow;
  }
  static create(targetWindow) {
    return new _DOMLineBreaksComputerFactory(new WeakRef(targetWindow));
  }
  createLineBreaksComputer(context2, fontInfo, tabSize, wrappingColumn, wrappingIndent, wordBreak, wrapOnEscapedLineFeeds) {
    const lineNumbers = [];
    return {
      addRequest: (lineNumber, previousLineBreakData) => {
        lineNumbers.push(lineNumber);
      },
      finalize: () => {
        return createLineBreaks(assertReturnsDefined(this.targetWindow.deref()), context2, lineNumbers, fontInfo, tabSize, wrappingColumn, wrappingIndent, wordBreak);
      }
    };
  }
};

function createLineBreaks(targetWindow, context2, lineNumbers, fontInfo, tabSize, firstLineBreakColumn, wrappingIndent, wordBreak) {
  function createEmptyLineBreakWithPossiblyInjectedText(lineNumber) {
    const injectedTexts = context2.getLineInjectedText(lineNumber);
    if (injectedTexts) {
      const lineContent = context2.getLineContent(lineNumber);
      const lineText = LineInjectedText.applyInjectedText(lineContent, injectedTexts);
      const injectionOptions = injectedTexts.map((t2) => t2.options);
      const injectionOffsets = injectedTexts.map((text2) => text2.column - 1);
      return new ModelLineProjectionData(injectionOffsets, injectionOptions, [lineText.length], [], 0);
    } else {
      return null;
    }
  }
  if (firstLineBreakColumn === -1) {
    const result2 = [];
    for (let i2 = 0, len = lineNumbers.length; i2 < len; i2++) {
      result2[i2] = createEmptyLineBreakWithPossiblyInjectedText(lineNumbers[i2]);
    }
    return result2;
  }
  const overallWidth = Math.round(firstLineBreakColumn * fontInfo.typicalHalfwidthCharacterWidth);
  const additionalIndent = wrappingIndent === 3 /* DeepIndent */ ? 2 : wrappingIndent === 2 /* Indent */ ? 1 : 0;
  const additionalIndentSize = Math.round(tabSize * additionalIndent);
  const additionalIndentLength = Math.ceil(fontInfo.spaceWidth * additionalIndentSize);
  const containerDomNode = document.createElement("div");
  applyFontInfo(containerDomNode, fontInfo);
  const sb = new StringBuilder(1e4);
  const firstNonWhitespaceIndices = [];
  const wrappedTextIndentLengths = [];
  const renderLineContents = [];
  const allCharOffsets = [];
  const allSpanStartOffsets = [];
  const allVisibleColumns = [];
  for (let i2 = 0; i2 < lineNumbers.length; i2++) {
    const lineNumber = lineNumbers[i2];
    const injectedTexts = context2.getLineInjectedText(lineNumber);
    const lineContent = LineInjectedText.applyInjectedText(context2.getLineContent(lineNumber), injectedTexts);
    const fixedWidthRanges = LineInjectedText.getFixedWidthInjectedTextRanges(injectedTexts);
    let firstNonWhitespaceIndex2 = 0;
    let wrappedTextIndentLength = 0;
    let width2 = overallWidth;
    if (wrappingIndent !== 0 /* None */) {
      firstNonWhitespaceIndex2 = firstNonWhitespaceIndex(lineContent);
      if (firstNonWhitespaceIndex2 === -1) {
        firstNonWhitespaceIndex2 = 0;
      } else {
        for (let i3 = 0; i3 < firstNonWhitespaceIndex2; i3++) {
          const fixedWidthRange = fixedWidthRanges[0];
          const isFixedWidthStart = fixedWidthRange && fixedWidthRange.startOffset === i3;
          if (isFixedWidthStart) {
            firstNonWhitespaceIndex2 = i3;
            break;
          } else {
            const charWidth = lineContent.charCodeAt(i3) === 9 /* Tab */ ? tabSize - wrappedTextIndentLength % tabSize : 1;
            wrappedTextIndentLength += charWidth;
          }
        }
        const indentWidth = Math.ceil(fontInfo.spaceWidth * wrappedTextIndentLength);
        if (indentWidth + fontInfo.typicalFullwidthCharacterWidth > overallWidth) {
          firstNonWhitespaceIndex2 = 0;
          wrappedTextIndentLength = 0;
        } else {
          width2 = overallWidth - indentWidth;
        }
      }
    }
    const renderLineContent = lineContent.substr(firstNonWhitespaceIndex2);
    const shiftedFixedWidthRanges = firstNonWhitespaceIndex2 === 0 ? fixedWidthRanges : fixedWidthRanges.map((range3) => ({
      startOffset: Math.max(0, range3.startOffset - firstNonWhitespaceIndex2),
      endOffset: range3.endOffset - firstNonWhitespaceIndex2,
      widthInEm: range3.widthInEm
    }));
    const tmp = renderLine(renderLineContent, wrappedTextIndentLength, tabSize, width2, sb, additionalIndentLength, shiftedFixedWidthRanges);
    firstNonWhitespaceIndices[i2] = firstNonWhitespaceIndex2;
    wrappedTextIndentLengths[i2] = wrappedTextIndentLength;
    renderLineContents[i2] = renderLineContent;
    allCharOffsets[i2] = tmp[0];
    allSpanStartOffsets[i2] = tmp[2];
    allVisibleColumns[i2] = tmp[1];
  }
  const html3 = sb.build();
  const trustedhtml = ttPolicy2?.createHTML(html3) ?? html3;
  containerDomNode.innerHTML = trustedhtml;
  containerDomNode.style.position = "absolute";
  containerDomNode.style.top = "10000px";
  if (wordBreak === "keepAll") {
    containerDomNode.style.wordBreak = "keep-all";
    containerDomNode.style.overflowWrap = "anywhere";
  } else {
    containerDomNode.style.wordBreak = "inherit";
    containerDomNode.style.overflowWrap = "break-word";
  }
  targetWindow.document.body.appendChild(containerDomNode);
  const range2 = document.createRange();
  const lineDomNodes = Array.prototype.slice.call(containerDomNode.children, 0);
  const result = [];
  for (let i2 = 0; i2 < lineNumbers.length; i2++) {
    const lineNumber = lineNumbers[i2];
    const lineDomNode = lineDomNodes[i2];
    const breakOffsets = readLineBreaks(range2, lineDomNode, renderLineContents[i2], allCharOffsets[i2], allSpanStartOffsets[i2]);
    if (breakOffsets === null) {
      result[i2] = createEmptyLineBreakWithPossiblyInjectedText(lineNumber);
      continue;
    }
    const firstNonWhitespaceIndex2 = firstNonWhitespaceIndices[i2];
    const wrappedTextIndentLength = wrappedTextIndentLengths[i2] + additionalIndentSize;
    const visibleColumns = allVisibleColumns[i2];
    const breakOffsetsVisibleColumn = [];
    for (let j = 0, len = breakOffsets.length; j < len; j++) {
      breakOffsetsVisibleColumn[j] = visibleColumns[breakOffsets[j]];
    }
    if (firstNonWhitespaceIndex2 !== 0) {
      for (let j = 0, len = breakOffsets.length; j < len; j++) {
        breakOffsets[j] += firstNonWhitespaceIndex2;
      }
    }
    let injectionOptions;
    let injectionOffsets;
    const curInjectedTexts = context2.getLineInjectedText(lineNumber);
    if (curInjectedTexts) {
      injectionOptions = curInjectedTexts.map((t2) => t2.options);
      injectionOffsets = curInjectedTexts.map((text2) => text2.column - 1);
    } else {
      injectionOptions = null;
      injectionOffsets = null;
    }
    result[i2] = new ModelLineProjectionData(injectionOffsets, injectionOptions, breakOffsets, breakOffsetsVisibleColumn, wrappedTextIndentLength);
  }
  containerDomNode.remove();
  return result;
}

function renderLine(lineContent, initialVisibleColumn, tabSize, width2, sb, wrappingIndentLength, fixedWidthRanges) {
  if (wrappingIndentLength !== 0) {
    const hangingOffset = String(wrappingIndentLength);
    sb.appendString('<div style="text-indent: -');
    sb.appendString(hangingOffset);
    sb.appendString("px; padding-left: ");
    sb.appendString(hangingOffset);
    sb.appendString("px; box-sizing: border-box; width:");
  } else {
    sb.appendString('<div style="width:');
  }
  sb.appendString(String(width2));
  sb.appendString('px;">');
  const len = lineContent.length;
  let visibleColumn = initialVisibleColumn;
  let charOffset = 0;
  let fixedWidthRangeIndex = 0;
  const charOffsets = [];
  const spanStartOffsets = [0];
  const visibleColumns = [];
  let nextCharCode = 0 < len ? lineContent.charCodeAt(0) : 0 /* Null */;
  let spanOpen = true;
  sb.appendString("<span>");
  for (let charIndex = 0; charIndex < len; charIndex++) {
    let fixedWidthRange = fixedWidthRanges[fixedWidthRangeIndex];
    const startsFixedWidth = fixedWidthRange && fixedWidthRange.startOffset === charIndex;
    if (startsFixedWidth) {
      if (spanOpen) {
        sb.appendString("</span>");
      }
      while (fixedWidthRange && fixedWidthRange.startOffset === charIndex && fixedWidthRange.endOffset === charIndex) {
        sb.appendString('<span style="display:inline-block;box-sizing:border-box;white-space:nowrap;width:');
        sb.appendString(String(fixedWidthRange.widthInEm));
        sb.appendString('em;">');
        sb.appendString("</span>");
        spanStartOffsets.push(charOffset);
        fixedWidthRange = fixedWidthRanges[++fixedWidthRangeIndex];
      }
      if (fixedWidthRange && fixedWidthRange.startOffset === charIndex) {
        sb.appendString('<span style="display:inline-block;box-sizing:border-box;white-space:nowrap;width:');
        sb.appendString(String(fixedWidthRange.widthInEm));
        sb.appendString('em;">');
      } else {
        sb.appendString("<span>");
      }
      spanStartOffsets.push(charOffset);
      spanOpen = true;
    } else if (!spanOpen) {
      sb.appendString("<span>");
      spanStartOffsets.push(charOffset);
      spanOpen = true;
    } else if ((!fixedWidthRange || charIndex < fixedWidthRange.startOffset) && charIndex !== 0 && charIndex % 16384 /* SPAN_MODULO_LIMIT */ === 0) {
      sb.appendString("</span><span>");
      spanStartOffsets.push(charOffset);
    }
    charOffsets[charIndex] = charOffset;
    visibleColumns[charIndex] = visibleColumn;
    const charCode = nextCharCode;
    nextCharCode = charIndex + 1 < len ? lineContent.charCodeAt(charIndex + 1) : 0 /* Null */;
    let producedCharacters = 1;
    let charWidth = 1;
    switch (charCode) {
      case 9 /* Tab */:
        producedCharacters = tabSize - visibleColumn % tabSize;
        charWidth = producedCharacters;
        for (let space = 1; space <= producedCharacters; space++) {
          if (space < producedCharacters) {
            sb.appendCharCode(160);
          } else {
            sb.appendASCIICharCode(32 /* Space */);
          }
        }
        break;
      case 32 /* Space */:
        if (nextCharCode === 32 /* Space */) {
          sb.appendCharCode(160);
        } else {
          sb.appendASCIICharCode(32 /* Space */);
        }
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
        sb.appendString("&#00;");
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
        if (charCode < 32) {
          sb.appendCharCode(9216 + charCode);
        } else {
          sb.appendCharCode(charCode);
        }
    }
    charOffset += producedCharacters;
    visibleColumn += charWidth;
    if (fixedWidthRange && fixedWidthRange.startOffset < fixedWidthRange.endOffset && charIndex + 1 === fixedWidthRange.endOffset) {
      sb.appendString("</span>");
      spanOpen = false;
      fixedWidthRangeIndex++;
    }
  }
  if (spanOpen) {
    sb.appendString("</span>");
  }
  charOffsets[lineContent.length] = charOffset;
  visibleColumns[lineContent.length] = visibleColumn;
  sb.appendString("</div>");
  return [charOffsets, visibleColumns, spanStartOffsets];
}

function readLineBreaks(range2, lineDomNode, lineContent, charOffsets, spanStartOffsets) {
  if (lineContent.length <= 1) {
    return null;
  }
  const spans = Array.prototype.slice.call(lineDomNode.children, 0);
  const breakOffsets = [];
  try {
    discoverBreaks(range2, spans, charOffsets, spanStartOffsets, 0, null, lineContent.length - 1, null, breakOffsets);
  } catch (err) {
    console.error(err);
    return null;
  }
  if (breakOffsets.length === 0) {
    return null;
  }
  breakOffsets.push(lineContent.length);
  return breakOffsets;
}

function discoverBreaks(range2, spans, charOffsets, spanStartOffsets, low, lowRects, high, highRects, result) {
  if (low === high) {
    return;
  }
  lowRects = lowRects || readClientRect(range2, spans, charOffsets[low], charOffsets[low + 1], spanStartOffsets);
  highRects = highRects || readClientRect(range2, spans, charOffsets[high], charOffsets[high + 1], spanStartOffsets);
  if (Math.abs(lowRects[0].top - highRects[0].top) <= 0.1) {
    return;
  }
  if (low + 1 === high) {
    result.push(high);
    return;
  }
  const mid = low + (high - low) / 2 | 0;
  const midRects = readClientRect(range2, spans, charOffsets[mid], charOffsets[mid + 1], spanStartOffsets);
  discoverBreaks(range2, spans, charOffsets, spanStartOffsets, low, lowRects, mid, midRects, result);
  discoverBreaks(range2, spans, charOffsets, spanStartOffsets, mid, midRects, high, highRects, result);
}

function readClientRect(range2, spans, startOffset, endOffset, spanStartOffsets) {
  if (!spanStartOffsets) {
    range2.setStart(spans[startOffset / 16384 /* SPAN_MODULO_LIMIT */ | 0].firstChild, startOffset % 16384 /* SPAN_MODULO_LIMIT */);
    range2.setEnd(spans[endOffset / 16384 /* SPAN_MODULO_LIMIT */ | 0].firstChild, endOffset % 16384 /* SPAN_MODULO_LIMIT */);
    return range2.getClientRects();
  }
  const startSpanIndex = findSpanIndex(spanStartOffsets, startOffset);
  const endSpanIndex = findSpanIndex(spanStartOffsets, endOffset);
  range2.setStart(spans[startSpanIndex].firstChild, startOffset - spanStartOffsets[startSpanIndex]);
  range2.setEnd(spans[endSpanIndex].firstChild, endOffset - spanStartOffsets[endSpanIndex]);
  return range2.getClientRects();
}

function findSpanIndex(spanStartOffsets, offset) {
  let low = 0;
  let high = spanStartOffsets.length;
  while (low < high) {
    const mid = low + high >>> 1;
    if (spanStartOffsets[mid] <= offset) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low - 1;
}
export { createLineBreaks, renderLine, readLineBreaks, discoverBreaks, readClientRect, findSpanIndex, ttPolicy2, DOMLineBreaksComputerFactory };
