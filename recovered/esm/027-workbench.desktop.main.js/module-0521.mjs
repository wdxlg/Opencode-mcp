// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/model/textModelText.ts
import { AbstractText } from "./module-0177.mjs";
import { TextLength } from "./module-0175.mjs";


// src/vs/editor/common/model/textModelText.ts
var TextModelText = class extends AbstractText {
  constructor(_textModel) {
    super();
    this._textModel = _textModel;
  }
  getValueOfRange(range2) {
    return this._textModel.getValueInRange(range2);
  }
  getLineLength(lineNumber) {
    return this._textModel.getLineLength(lineNumber);
  }
  get length() {
    const lastLineNumber = this._textModel.getLineCount();
    const lastLineLen = this._textModel.getLineLength(lastLineNumber);
    return new TextLength(lastLineNumber - 1, lastLineLen);
  }
};
export { TextModelText };
