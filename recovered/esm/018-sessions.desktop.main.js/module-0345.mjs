// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/browser/gpu/contentSegmenter.ts
import { safeIntl } from "./module-0120.mjs";


// src/vs/editor/browser/gpu/contentSegmenter.ts
function createContentSegmenter(lineData, options3) {
  if (lineData.isBasicASCII && options3.useMonospaceOptimizations) {
    return new AsciiContentSegmenter(lineData);
  }
  return new GraphemeContentSegmenter(lineData);
}

var AsciiContentSegmenter = class {
  constructor(lineData) {
    this._content = lineData.content;
  }
  getSegmentAtIndex(index2) {
    return this._content[index2];
  }
  getSegmentData(index2) {
    return void 0;
  }
};

var GraphemeContentSegmenter = class {
  constructor(lineData) {
    this._segments = [];
    const content = lineData.content;
    const segmenter = safeIntl.Segmenter(void 0, { granularity: "grapheme" }).value;
    const segmentedContent = Array.from(segmenter.segment(content));
    let segmenterIndex = 0;
    for (let x = 0; x < content.length; x++) {
      const segment = segmentedContent[segmenterIndex];
      if (!segment) {
        break;
      }
      if (segment.index !== x) {
        this._segments.push(void 0);
        continue;
      }
      segmenterIndex++;
      this._segments.push(segment);
    }
  }
  getSegmentAtIndex(index2) {
    return this._segments[index2]?.segment;
  }
  getSegmentData(index2) {
    return this._segments[index2];
  }
};
export { createContentSegmenter, AsciiContentSegmenter, GraphemeContentSegmenter };
