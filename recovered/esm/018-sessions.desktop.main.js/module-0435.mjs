// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/viewModel/modelLineProjection.ts
import { LineInjectedText } from "./module-0369.mjs";
import { InjectedTextInlineDecorationsComputer } from "./module-0243.mjs";
import { getLineTokensWithInjections } from "./module-0423.mjs";
import { ViewLineData } from "./module-0315.mjs";
import { Position } from "./module-0079.mjs";


// src/vs/editor/common/viewModel/modelLineProjection.ts
function createModelLineProjection(lineBreakData, isVisible) {
  if (lineBreakData === null) {
    if (isVisible) {
      return IdentityModelLineProjection.INSTANCE;
    }
    return HiddenModelLineProjection.INSTANCE;
  } else {
    return new ModelLineProjection(lineBreakData, isVisible);
  }
}

var ModelLineProjection = class {
  constructor(lineBreakData, isVisible) {
    this._projectionData = lineBreakData;
    this._isVisible = isVisible;
  }
  isVisible() {
    return this._isVisible;
  }
  setVisible(isVisible) {
    this._isVisible = isVisible;
    return this;
  }
  getProjectionData() {
    return this._projectionData;
  }
  getViewLineCount() {
    if (!this._isVisible) {
      return 0;
    }
    return this._projectionData.getOutputLineCount();
  }
  getViewLineContent(model, modelLineNumber, outputLineIndex) {
    this._assertVisible();
    const startOffsetInInputWithInjections = outputLineIndex > 0 ? this._projectionData.breakOffsets[outputLineIndex - 1] : 0;
    const endOffsetInInputWithInjections = this._projectionData.breakOffsets[outputLineIndex];
    let r2;
    if (this._projectionData.injectionOffsets !== null) {
      const injectedTexts = this._projectionData.injectionOffsets.map(
        (offset, idx) => new LineInjectedText(
          0,
          0,
          offset + 1,
          this._projectionData.injectionOptions[idx],
          0
        )
      );
      const lineWithInjections = LineInjectedText.applyInjectedText(
        model.getLineContent(modelLineNumber),
        injectedTexts
      );
      r2 = lineWithInjections.substring(startOffsetInInputWithInjections, endOffsetInInputWithInjections);
    } else {
      r2 = model.getValueInRange({
        startLineNumber: modelLineNumber,
        startColumn: startOffsetInInputWithInjections + 1,
        endLineNumber: modelLineNumber,
        endColumn: endOffsetInInputWithInjections + 1
      });
    }
    if (outputLineIndex > 0) {
      r2 = spaces(this._projectionData.wrappedTextIndentLength) + r2;
    }
    return r2;
  }
  getViewLineLength(model, modelLineNumber, outputLineIndex) {
    this._assertVisible();
    return this._projectionData.getLineLength(outputLineIndex);
  }
  getViewLineMinColumn(_model, _modelLineNumber, outputLineIndex) {
    this._assertVisible();
    return this._projectionData.getMinOutputOffset(outputLineIndex) + 1;
  }
  getViewLineMaxColumn(model, modelLineNumber, outputLineIndex) {
    this._assertVisible();
    return this._projectionData.getMaxOutputOffset(outputLineIndex) + 1;
  }
  /**
   * Try using {@link getViewLinesData} instead.
  */
  getViewLineData(model, modelLineNumber, outputLineIndex, baseViewLineNumber) {
    const arr = new Array();
    this.getViewLinesData(model, modelLineNumber, outputLineIndex, 1, baseViewLineNumber, 0, [true], arr);
    return arr[0];
  }
  getViewLinesData(model, modelLineNumber, outputLineIdx, lineCount, baseViewLineNumber, globalStartIndex, needed, result) {
    this._assertVisible();
    const lineBreakData = this._projectionData;
    const injectionOffsets = lineBreakData.injectionOffsets;
    const injectionOptions = lineBreakData.injectionOptions;
    const context2 = {
      getInjectionOptions: () => injectionOptions,
      getInjectionOffsets: () => injectionOffsets,
      getBreakOffsets: () => lineBreakData.breakOffsets,
      getWrappedTextIndentLength: () => lineBreakData.wrappedTextIndentLength,
      getBaseViewLineNumber: () => baseViewLineNumber
    };
    const computer = new InjectedTextInlineDecorationsComputer(context2);
    const lineInlineDecorations = computer.getInlineDecorations(modelLineNumber);
    const lineTokens = model.tokenization.getLineTokens(modelLineNumber);
    const lineWithInjections = getLineTokensWithInjections(lineTokens, injectionOptions, injectionOffsets);
    for (let outputLineIndex = outputLineIdx; outputLineIndex < outputLineIdx + lineCount; outputLineIndex++) {
      const globalIndex = globalStartIndex + outputLineIndex - outputLineIdx;
      if (!needed[globalIndex]) {
        result[globalIndex] = null;
        continue;
      }
      result[globalIndex] = this._getViewLineData(lineWithInjections, lineInlineDecorations ? lineInlineDecorations[outputLineIndex] : null, outputLineIndex);
    }
  }
  _getViewLineData(lineWithInjections, inlineDecorations, outputLineIndex) {
    this._assertVisible();
    const lineBreakData = this._projectionData;
    const deltaStartIndex = outputLineIndex > 0 ? lineBreakData.wrappedTextIndentLength : 0;
    const lineStartOffsetInInputWithInjections = outputLineIndex > 0 ? lineBreakData.breakOffsets[outputLineIndex - 1] : 0;
    const lineEndOffsetInInputWithInjections = lineBreakData.breakOffsets[outputLineIndex];
    const tokens = lineWithInjections.sliceAndInflate(lineStartOffsetInInputWithInjections, lineEndOffsetInInputWithInjections, deltaStartIndex);
    let lineContent = tokens.getLineContent();
    if (outputLineIndex > 0) {
      lineContent = spaces(lineBreakData.wrappedTextIndentLength) + lineContent;
    }
    const minColumn = this._projectionData.getMinOutputOffset(outputLineIndex) + 1;
    const maxColumn = lineContent.length + 1;
    const continuesWithWrappedLine = outputLineIndex + 1 < this.getViewLineCount();
    const startVisibleColumn = outputLineIndex === 0 ? 0 : lineBreakData.breakOffsetsVisibleColumn[outputLineIndex - 1];
    return new ViewLineData(
      lineContent,
      continuesWithWrappedLine,
      minColumn,
      maxColumn,
      startVisibleColumn,
      tokens,
      inlineDecorations
    );
  }
  getModelColumnOfViewPosition(outputLineIndex, outputColumn) {
    this._assertVisible();
    return this._projectionData.translateToInputOffset(outputLineIndex, outputColumn - 1) + 1;
  }
  getViewPositionOfModelPosition(deltaLineNumber, inputColumn, affinity = 2 /* None */) {
    this._assertVisible();
    const r2 = this._projectionData.translateToOutputPosition(inputColumn - 1, affinity);
    return r2.toPosition(deltaLineNumber);
  }
  getViewLineNumberOfModelPosition(deltaLineNumber, inputColumn) {
    this._assertVisible();
    const r2 = this._projectionData.translateToOutputPosition(inputColumn - 1);
    return deltaLineNumber + r2.outputLineIndex;
  }
  normalizePosition(outputLineIndex, outputPosition, affinity) {
    const baseViewLineNumber = outputPosition.lineNumber - outputLineIndex;
    const normalizedOutputPosition = this._projectionData.normalizeOutputPosition(outputLineIndex, outputPosition.column - 1, affinity);
    const result = normalizedOutputPosition.toPosition(baseViewLineNumber);
    return result;
  }
  getInjectedTextAt(outputLineIndex, outputColumn) {
    return this._projectionData.getInjectedText(outputLineIndex, outputColumn - 1);
  }
  _assertVisible() {
    if (!this._isVisible) {
      throw new Error("Not supported");
    }
  }
};

var IdentityModelLineProjection = class _IdentityModelLineProjection {
  static {
    this.INSTANCE = new _IdentityModelLineProjection();
  }
  constructor() {
  }
  isVisible() {
    return true;
  }
  setVisible(isVisible) {
    if (isVisible) {
      return this;
    }
    return HiddenModelLineProjection.INSTANCE;
  }
  getProjectionData() {
    return null;
  }
  getViewLineCount() {
    return 1;
  }
  getViewLineContent(model, modelLineNumber, _outputLineIndex) {
    return model.getLineContent(modelLineNumber);
  }
  getViewLineLength(model, modelLineNumber, _outputLineIndex) {
    return model.getLineLength(modelLineNumber);
  }
  getViewLineMinColumn(model, modelLineNumber, _outputLineIndex) {
    return model.getLineMinColumn(modelLineNumber);
  }
  getViewLineMaxColumn(model, modelLineNumber, _outputLineIndex) {
    return model.getLineMaxColumn(modelLineNumber);
  }
  getViewLineData(model, modelLineNumber, _outputLineIndex, _baseViewLineNumber) {
    const lineTokens = model.tokenization.getLineTokens(modelLineNumber);
    const lineContent = lineTokens.getLineContent();
    return new ViewLineData(
      lineContent,
      false,
      1,
      lineContent.length + 1,
      0,
      lineTokens.inflate(),
      null
    );
  }
  getViewLinesData(model, modelLineNumber, _fromOuputLineIndex, _toOutputLineIndex, _baseViewLineNumber, globalStartIndex, needed, result) {
    if (!needed[globalStartIndex]) {
      result[globalStartIndex] = null;
      return;
    }
    result[globalStartIndex] = this.getViewLineData(model, modelLineNumber, 0, _baseViewLineNumber);
  }
  getModelColumnOfViewPosition(_outputLineIndex, outputColumn) {
    return outputColumn;
  }
  getViewPositionOfModelPosition(deltaLineNumber, inputColumn) {
    return new Position(deltaLineNumber, inputColumn);
  }
  getViewLineNumberOfModelPosition(deltaLineNumber, _inputColumn) {
    return deltaLineNumber;
  }
  normalizePosition(outputLineIndex, outputPosition, affinity) {
    return outputPosition;
  }
  getInjectedTextAt(_outputLineIndex, _outputColumn) {
    return null;
  }
};

var HiddenModelLineProjection = class _HiddenModelLineProjection {
  static {
    this.INSTANCE = new _HiddenModelLineProjection();
  }
  constructor() {
  }
  isVisible() {
    return false;
  }
  setVisible(isVisible) {
    if (!isVisible) {
      return this;
    }
    return IdentityModelLineProjection.INSTANCE;
  }
  getProjectionData() {
    return null;
  }
  getViewLineCount() {
    return 0;
  }
  getViewLineContent(_model, _modelLineNumber, _outputLineIndex) {
    throw new Error("Not supported");
  }
  getViewLineLength(_model, _modelLineNumber, _outputLineIndex) {
    throw new Error("Not supported");
  }
  getViewLineMinColumn(_model, _modelLineNumber, _outputLineIndex) {
    throw new Error("Not supported");
  }
  getViewLineMaxColumn(_model, _modelLineNumber, _outputLineIndex) {
    throw new Error("Not supported");
  }
  getViewLineData(_model, _modelLineNumber, _outputLineIndex, _baseViewLineNumber) {
    throw new Error("Not supported");
  }
  getViewLinesData(_model, _modelLineNumber, _fromOuputLineIndex, _toOutputLineIndex, _baseViewLineNumber, _globalStartIndex, _needed, _result) {
    throw new Error("Not supported");
  }
  getModelColumnOfViewPosition(_outputLineIndex, _outputColumn) {
    throw new Error("Not supported");
  }
  getViewPositionOfModelPosition(_deltaLineNumber, _inputColumn) {
    throw new Error("Not supported");
  }
  getViewLineNumberOfModelPosition(_deltaLineNumber, _inputColumn) {
    throw new Error("Not supported");
  }
  normalizePosition(outputLineIndex, outputPosition, affinity) {
    throw new Error("Not supported");
  }
  getInjectedTextAt(_outputLineIndex, _outputColumn) {
    throw new Error("Not supported");
  }
};

var _spaces = [""];

function spaces(count2) {
  if (count2 >= _spaces.length) {
    for (let i2 = 1; i2 <= count2; i2++) {
      _spaces[i2] = _makeSpaces(i2);
    }
  }
  return _spaces[count2];
}

function _makeSpaces(count2) {
  return new Array(count2 + 1).join(" ");
}
export { createModelLineProjection, spaces, _makeSpaces, ModelLineProjection, IdentityModelLineProjection, HiddenModelLineProjection, _spaces };
