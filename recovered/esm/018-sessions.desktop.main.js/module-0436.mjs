// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/coordinatesConverter.ts



// src/vs/editor/common/coordinatesConverter.ts
var IdentityCoordinatesConverter = class {
  constructor(model) {
    this._model = model;
  }
  _validPosition(pos) {
    return this._model.validatePosition(pos);
  }
  _validRange(range2) {
    return this._model.validateRange(range2);
  }
  // View -> Model conversion and related methods
  convertViewPositionToModelPosition(viewPosition) {
    return this._validPosition(viewPosition);
  }
  convertViewRangeToModelRange(viewRange) {
    return this._validRange(viewRange);
  }
  validateViewPosition(_viewPosition, expectedModelPosition) {
    return this._validPosition(expectedModelPosition);
  }
  validateViewRange(_viewRange, expectedModelRange) {
    return this._validRange(expectedModelRange);
  }
  // Model -> View conversion and related methods
  convertModelPositionToViewPosition(modelPosition) {
    return this._validPosition(modelPosition);
  }
  convertModelRangeToViewRange(modelRange) {
    return this._validRange(modelRange);
  }
  modelPositionIsVisible(modelPosition) {
    const lineCount = this._model.getLineCount();
    if (modelPosition.lineNumber < 1 || modelPosition.lineNumber > lineCount) {
      return false;
    }
    return true;
  }
  modelRangeIsVisible(modelRange) {
    const lineCount = this._model.getLineCount();
    if (modelRange.startLineNumber < 1 || modelRange.startLineNumber > lineCount) {
      return false;
    }
    if (modelRange.endLineNumber < 1 || modelRange.endLineNumber > lineCount) {
      return false;
    }
    return true;
  }
  getModelLineViewLineCount(modelLineNumber) {
    return 1;
  }
  getViewLineNumberOfModelPosition(modelLineNumber, modelColumn) {
    return modelLineNumber;
  }
};
export { IdentityCoordinatesConverter };
