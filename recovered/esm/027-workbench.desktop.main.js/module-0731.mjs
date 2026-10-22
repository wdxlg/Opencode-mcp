// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/inlineCompletions/browser/model/textModelValueReference.ts
import { AbstractText } from "./module-0177.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { TextLength } from "./module-0175.mjs";


// src/vs/editor/contrib/inlineCompletions/browser/model/textModelValueReference.ts
var TextModelValueReference = class _TextModelValueReference extends AbstractText {
  constructor(_textModel) {
    super();
    this._textModel = _textModel;
    this._version = _textModel.getVersionId();
  }
  static snapshot(textModel) {
    return new _TextModelValueReference(textModel);
  }
  get uri() {
    return this._textModel.uri;
  }
  get version() {
    return this._version;
  }
  _assertValid() {
    if (this._textModel.getVersionId() !== this._version) {
      onUnexpectedError(new Error(`TextModel has changed: expected version ${this._version}, got ${this._textModel.getVersionId()}`));
    }
  }
  targets(textModel) {
    return this._textModel.uri.toString() === textModel.uri.toString();
  }
  getValueOfRange(range2) {
    this._assertValid();
    return this._textModel.getValueInRange(range2);
  }
  getLineLength(lineNumber) {
    this._assertValid();
    return this._textModel.getLineLength(lineNumber);
  }
  get length() {
    this._assertValid();
    const lastLineNumber = this._textModel.getLineCount();
    const lastLineLen = this._textModel.getLineLength(lastLineNumber);
    return new TextLength(lastLineNumber - 1, lastLineLen);
  }
  getEOL() {
    this._assertValid();
    return this._textModel.getEOL();
  }
  getPositionAt(offset) {
    this._assertValid();
    return this._textModel.getPositionAt(offset);
  }
  getValueInRange(range2) {
    this._assertValid();
    return this._textModel.getValueInRange(range2);
  }
  getVersionId() {
    return this._version;
  }
  dangerouslyGetUnderlyingModel() {
    return this._textModel;
  }
};
export { TextModelValueReference };
