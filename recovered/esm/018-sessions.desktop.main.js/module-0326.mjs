// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/viewLayout/viewLinesViewportData.ts
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/common/viewLayout/viewLinesViewportData.ts
var ViewportData = class {
  constructor(selections, partialData, whitespaceViewportData, model) {
    this.selections = selections;
    this.startLineNumber = partialData.startLineNumber | 0;
    this.endLineNumber = partialData.endLineNumber | 0;
    this.relativeVerticalOffset = partialData.relativeVerticalOffset;
    this.bigNumbersDelta = partialData.bigNumbersDelta | 0;
    this.lineHeight = partialData.lineHeight | 0;
    this.whitespaceViewportData = whitespaceViewportData;
    this._model = model;
    this.visibleRange = new Range2(
      partialData.startLineNumber,
      this._model.getLineMinColumn(partialData.startLineNumber),
      partialData.endLineNumber,
      this._model.getLineMaxColumn(partialData.endLineNumber)
    );
  }
  getViewLineRenderingData(lineNumber) {
    return this._model.getViewportViewLineRenderingData(this.visibleRange, lineNumber);
  }
  getDecorationsInViewport() {
    return this._model.getDecorationsInViewport(this.visibleRange);
  }
};
export { ViewportData };
