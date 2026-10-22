// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/folding/browser/hiddenRangeModel.ts
import { Emitter } from "./module-0017.mjs";
import { countEOL } from "./module-0375.mjs";
import { Range2 } from "./module-0106.mjs";
import { findFirstIdxMonotonousOrArrLen } from "./module-0006.mjs";


// src/vs/editor/contrib/folding/browser/hiddenRangeModel.ts
var HiddenRangeModel = class {
  constructor(model) {
    this._updateEventEmitter = new Emitter();
    this._hasLineChanges = false;
    this._foldingModel = model;
    this._foldingModelListener = model.onDidChange((_) => this.updateHiddenRanges());
    this._hiddenRanges = [];
    if (model.regions.length) {
      this.updateHiddenRanges();
    }
  }
  get onDidChange() {
    return this._updateEventEmitter.event;
  }
  get hiddenRanges() {
    return this._hiddenRanges;
  }
  notifyChangeModelContent(e) {
    if (this._hiddenRanges.length && !this._hasLineChanges) {
      this._hasLineChanges = e.changes.some((change) => {
        return change.range.endLineNumber !== change.range.startLineNumber || countEOL(change.text)[0] !== 0;
      });
    }
  }
  updateHiddenRanges() {
    let updateHiddenAreas = false;
    const newHiddenAreas = [];
    let i2 = 0;
    let k = 0;
    let lastCollapsedStart = Number.MAX_VALUE;
    let lastCollapsedEnd = -1;
    const ranges = this._foldingModel.regions;
    for (; i2 < ranges.length; i2++) {
      if (!ranges.isCollapsed(i2)) {
        continue;
      }
      const startLineNumber = ranges.getStartLineNumber(i2) + 1;
      const endLineNumber = ranges.getEndLineNumber(i2);
      if (lastCollapsedStart <= startLineNumber && endLineNumber <= lastCollapsedEnd) {
        continue;
      }
      if (!updateHiddenAreas && k < this._hiddenRanges.length && this._hiddenRanges[k].startLineNumber === startLineNumber && this._hiddenRanges[k].endLineNumber === endLineNumber) {
        newHiddenAreas.push(this._hiddenRanges[k]);
        k++;
      } else {
        updateHiddenAreas = true;
        newHiddenAreas.push(new Range2(startLineNumber, 1, endLineNumber, 1));
      }
      lastCollapsedStart = startLineNumber;
      lastCollapsedEnd = endLineNumber;
    }
    if (this._hasLineChanges || updateHiddenAreas || k < this._hiddenRanges.length) {
      this.applyHiddenRanges(newHiddenAreas);
    }
  }
  applyHiddenRanges(newHiddenAreas) {
    this._hiddenRanges = newHiddenAreas;
    this._hasLineChanges = false;
    this._updateEventEmitter.fire(newHiddenAreas);
  }
  hasRanges() {
    return this._hiddenRanges.length > 0;
  }
  isHidden(line) {
    return findRange(this._hiddenRanges, line) !== null;
  }
  adjustSelections(selections) {
    let hasChanges = false;
    const editorModel = this._foldingModel.textModel;
    let lastRange = null;
    const adjustLine = (line) => {
      if (!lastRange || !isInside(line, lastRange)) {
        lastRange = findRange(this._hiddenRanges, line);
      }
      if (lastRange) {
        return lastRange.startLineNumber - 1;
      }
      return null;
    };
    for (let i2 = 0, len = selections.length; i2 < len; i2++) {
      let selection = selections[i2];
      const adjustedStartLine = adjustLine(selection.startLineNumber);
      if (adjustedStartLine) {
        selection = selection.setStartPosition(adjustedStartLine, editorModel.getLineMaxColumn(adjustedStartLine));
        hasChanges = true;
      }
      const adjustedEndLine = adjustLine(selection.endLineNumber);
      if (adjustedEndLine) {
        selection = selection.setEndPosition(adjustedEndLine, editorModel.getLineMaxColumn(adjustedEndLine));
        hasChanges = true;
      }
      selections[i2] = selection;
    }
    return hasChanges;
  }
  dispose() {
    if (this.hiddenRanges.length > 0) {
      this._hiddenRanges = [];
      this._updateEventEmitter.fire(this._hiddenRanges);
    }
    if (this._foldingModelListener) {
      this._foldingModelListener.dispose();
      this._foldingModelListener = null;
    }
    this._updateEventEmitter.dispose();
  }
};

function isInside(line, range2) {
  return line >= range2.startLineNumber && line <= range2.endLineNumber;
}

function findRange(ranges, line) {
  const i2 = findFirstIdxMonotonousOrArrLen(ranges, (r2) => line < r2.startLineNumber) - 1;
  if (i2 >= 0 && ranges[i2].endLineNumber >= line) {
    return ranges[i2];
  }
  return null;
}
export { isInside, findRange, HiddenRangeModel };
