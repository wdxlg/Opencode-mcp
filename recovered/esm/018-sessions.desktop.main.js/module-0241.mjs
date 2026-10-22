// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/viewParts/viewLines/rangeUtil.ts
import { FloatHorizontalRange } from "./module-0240.mjs";


// src/vs/editor/browser/viewParts/viewLines/rangeUtil.ts
var RangeUtil = class {
  static _createRange() {
    if (!this._handyReadyRange) {
      this._handyReadyRange = document.createRange();
    }
    return this._handyReadyRange;
  }
  static _detachRange(range2, endNode) {
    range2.selectNodeContents(endNode);
  }
  static _readClientRects(startElement, startOffset, endElement, endOffset, endNode) {
    const range2 = this._createRange();
    try {
      range2.setStart(startElement, startOffset);
      range2.setEnd(endElement, endOffset);
      return range2.getClientRects();
    } catch (e4) {
      return null;
    } finally {
      this._detachRange(range2, endNode);
    }
  }
  static _mergeAdjacentRanges(ranges) {
    if (ranges.length === 1) {
      return ranges;
    }
    ranges.sort(FloatHorizontalRange.compare);
    const result = [];
    let resultLen = 0;
    let prev = ranges[0];
    for (let i2 = 1, len = ranges.length; i2 < len; i2++) {
      const range2 = ranges[i2];
      if (prev.left + prev.width + 0.9 >= range2.left) {
        prev.width = Math.max(prev.width, range2.left + range2.width - prev.left);
      } else {
        result[resultLen++] = prev;
        prev = range2;
      }
    }
    result[resultLen++] = prev;
    return result;
  }
  static _createHorizontalRangesFromClientRects(clientRects, clientRectDeltaLeft, clientRectScale) {
    if (!clientRects || clientRects.length === 0) {
      return null;
    }
    const result = [];
    for (let i2 = 0, len = clientRects.length; i2 < len; i2++) {
      const clientRect = clientRects[i2];
      result[i2] = new FloatHorizontalRange(Math.max(0, (clientRect.left - clientRectDeltaLeft) / clientRectScale), clientRect.width / clientRectScale);
    }
    return this._mergeAdjacentRanges(result);
  }
  static readHorizontalRanges(domNode, startChildIndex, startOffset, endChildIndex, endOffset, context2) {
    const min = 0;
    const max = domNode.children.length - 1;
    if (min > max) {
      return null;
    }
    startChildIndex = Math.min(max, Math.max(min, startChildIndex));
    endChildIndex = Math.min(max, Math.max(min, endChildIndex));
    if (startChildIndex === endChildIndex && startOffset === endOffset && startOffset === 0 && !domNode.children[startChildIndex].firstChild) {
      const clientRects2 = domNode.children[startChildIndex].getClientRects();
      context2.markDidDomLayout();
      return this._createHorizontalRangesFromClientRects(clientRects2, context2.clientRectDeltaLeft, context2.clientRectScale);
    }
    if (startChildIndex !== endChildIndex) {
      if (endChildIndex > 0 && endOffset === 0) {
        endChildIndex--;
        endOffset = 1073741824 /* MAX_SAFE_SMALL_INTEGER */;
      }
    }
    let startElement = domNode.children[startChildIndex].firstChild;
    let endElement = domNode.children[endChildIndex].firstChild;
    if (!startElement || !endElement) {
      if (!startElement && startOffset === 0 && startChildIndex > 0) {
        startElement = domNode.children[startChildIndex - 1].firstChild;
        startOffset = 1073741824 /* MAX_SAFE_SMALL_INTEGER */;
      }
      if (!endElement && endOffset === 0 && endChildIndex > 0) {
        endElement = domNode.children[endChildIndex - 1].firstChild;
        endOffset = 1073741824 /* MAX_SAFE_SMALL_INTEGER */;
      }
    }
    if (!startElement || !endElement) {
      return null;
    }
    startOffset = Math.min(startElement.textContent.length, Math.max(0, startOffset));
    endOffset = Math.min(endElement.textContent.length, Math.max(0, endOffset));
    const clientRects = this._readClientRects(startElement, startOffset, endElement, endOffset, context2.endNode);
    context2.markDidDomLayout();
    return this._createHorizontalRangesFromClientRects(clientRects, context2.clientRectDeltaLeft, context2.clientRectScale);
  }
};
export { RangeUtil };
