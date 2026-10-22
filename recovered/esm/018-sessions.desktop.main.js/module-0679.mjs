// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/folding/browser/foldingModel.ts
import { Emitter } from "./module-0017.mjs";
import { FoldingRegions } from "./module-0678.mjs";
import { Range2 } from "./module-0106.mjs";
import { hash } from "./module-0039.mjs";


// src/vs/editor/contrib/folding/browser/foldingModel.ts
var FoldingModel = class {
  constructor(textModel, decorationProvider) {
    this._updateEventEmitter = new Emitter();
    this.onDidChange = this._updateEventEmitter.event;
    this._textModel = textModel;
    this._decorationProvider = decorationProvider;
    this._regions = new FoldingRegions(new Uint32Array(0), new Uint32Array(0));
    this._editorDecorationIds = [];
  }
  get regions() {
    return this._regions;
  }
  get textModel() {
    return this._textModel;
  }
  get decorationProvider() {
    return this._decorationProvider;
  }
  toggleCollapseState(toggledRegions) {
    if (!toggledRegions.length) {
      return;
    }
    toggledRegions = toggledRegions.sort((r1, r2) => r1.regionIndex - r2.regionIndex);
    const processed = {};
    this._decorationProvider.changeDecorations((accessor) => {
      let k = 0;
      let dirtyRegionEndLine = -1;
      let lastHiddenLine = -1;
      const updateDecorationsUntil = (index2) => {
        while (k < index2) {
          const endLineNumber = this._regions.getEndLineNumber(k);
          const isCollapsed = this._regions.isCollapsed(k);
          if (endLineNumber <= dirtyRegionEndLine) {
            const isManual = this.regions.getSource(k) !== 0 /* provider */;
            accessor.changeDecorationOptions(this._editorDecorationIds[k], this._decorationProvider.getDecorationOption(isCollapsed, endLineNumber <= lastHiddenLine, isManual));
          }
          if (isCollapsed && endLineNumber > lastHiddenLine) {
            lastHiddenLine = endLineNumber;
          }
          k++;
        }
      };
      for (const region of toggledRegions) {
        const index2 = region.regionIndex;
        const editorDecorationId = this._editorDecorationIds[index2];
        if (editorDecorationId && !processed[editorDecorationId]) {
          processed[editorDecorationId] = true;
          updateDecorationsUntil(index2);
          const newCollapseState = !this._regions.isCollapsed(index2);
          this._regions.setCollapsed(index2, newCollapseState);
          dirtyRegionEndLine = Math.max(dirtyRegionEndLine, this._regions.getEndLineNumber(index2));
        }
      }
      updateDecorationsUntil(this._regions.length);
    });
    this._updateEventEmitter.fire({ model: this, collapseStateChanged: toggledRegions });
  }
  removeManualRanges(ranges) {
    const rangeIndexesToRemove = /* @__PURE__ */ new Set();
    let removeAll = false;
    for (const range2 of ranges) {
      if (Range2.isEmpty(range2)) {
        let index2 = this._regions.findRange(range2.startLineNumber);
        while (index2 !== -1 && this._regions.getSource(index2) === 0 /* provider */) {
          index2 = this._regions.getParentIndex(index2);
        }
        if (index2 === -1) {
          removeAll = true;
        } else {
          rangeIndexesToRemove.add(index2);
        }
      }
    }
    const newFoldingRanges = new Array();
    const intersectsSelection = (foldRange) => {
      for (const range2 of ranges) {
        if (!Range2.isEmpty(range2) && !(range2.startLineNumber > foldRange.endLineNumber || foldRange.startLineNumber > range2.endLineNumber)) {
          return true;
        }
      }
      return false;
    };
    for (let i2 = 0; i2 < this._regions.length; i2++) {
      const foldRange = this._regions.toFoldRange(i2);
      if (foldRange.source === 0 /* provider */ || !removeAll && !rangeIndexesToRemove.has(i2) && !intersectsSelection(foldRange)) {
        newFoldingRanges.push(foldRange);
      }
    }
    this.updatePost(FoldingRegions.fromFoldRanges(newFoldingRanges));
  }
  update(newRegions, selection) {
    const foldedOrManualRanges = this._currentFoldedOrManualRanges(selection);
    const newRanges = FoldingRegions.sanitizeAndMerge(newRegions, foldedOrManualRanges, this._textModel.getLineCount(), selection);
    this.updatePost(FoldingRegions.fromFoldRanges(newRanges));
  }
  updatePost(newRegions) {
    const newEditorDecorations = [];
    let lastHiddenLine = -1;
    for (let index2 = 0, limit = newRegions.length; index2 < limit; index2++) {
      const startLineNumber = newRegions.getStartLineNumber(index2);
      const endLineNumber = newRegions.getEndLineNumber(index2);
      const isCollapsed = newRegions.isCollapsed(index2);
      const isManual = newRegions.getSource(index2) !== 0 /* provider */;
      const decorationRange = {
        startLineNumber,
        startColumn: this._textModel.getLineMaxColumn(startLineNumber),
        endLineNumber,
        endColumn: this._textModel.getLineMaxColumn(endLineNumber) + 1
      };
      newEditorDecorations.push({ range: decorationRange, options: this._decorationProvider.getDecorationOption(isCollapsed, endLineNumber <= lastHiddenLine, isManual) });
      if (isCollapsed && endLineNumber > lastHiddenLine) {
        lastHiddenLine = endLineNumber;
      }
    }
    this._decorationProvider.changeDecorations((accessor) => this._editorDecorationIds = accessor.deltaDecorations(this._editorDecorationIds, newEditorDecorations));
    this._regions = newRegions;
    this._updateEventEmitter.fire({ model: this });
  }
  _currentFoldedOrManualRanges(selection) {
    const foldedRanges = [];
    for (let i2 = 0, limit = this._regions.length; i2 < limit; i2++) {
      let isCollapsed = this.regions.isCollapsed(i2);
      const source = this.regions.getSource(i2);
      if (isCollapsed || source !== 0 /* provider */) {
        const foldRange = this._regions.toFoldRange(i2);
        const decRange = this._textModel.getDecorationRange(this._editorDecorationIds[i2]);
        if (decRange) {
          if (isCollapsed && selection?.startsInside(decRange.startLineNumber + 1, decRange.endLineNumber)) {
            isCollapsed = false;
          }
          foldedRanges.push({
            startLineNumber: decRange.startLineNumber,
            endLineNumber: decRange.endLineNumber,
            type: foldRange.type,
            isCollapsed,
            source
          });
        }
      }
    }
    return foldedRanges;
  }
  /**
   * Collapse state memento, for persistence only
   */
  getMemento() {
    const foldedOrManualRanges = this._currentFoldedOrManualRanges();
    const result = [];
    const maxLineNumber = this._textModel.getLineCount();
    for (let i2 = 0, limit = foldedOrManualRanges.length; i2 < limit; i2++) {
      const range2 = foldedOrManualRanges[i2];
      if (range2.startLineNumber >= range2.endLineNumber || range2.startLineNumber < 1 || range2.endLineNumber > maxLineNumber) {
        continue;
      }
      const checksum = this._getLinesChecksum(range2.startLineNumber + 1, range2.endLineNumber);
      result.push({
        startLineNumber: range2.startLineNumber,
        endLineNumber: range2.endLineNumber,
        isCollapsed: range2.isCollapsed,
        source: range2.source,
        checksum
      });
    }
    return result.length > 0 ? result : void 0;
  }
  /**
   * Apply persisted state, for persistence only
   */
  applyMemento(state) {
    if (!Array.isArray(state)) {
      return;
    }
    const rangesToRestore = [];
    const maxLineNumber = this._textModel.getLineCount();
    for (const range2 of state) {
      if (range2.startLineNumber >= range2.endLineNumber || range2.startLineNumber < 1 || range2.endLineNumber > maxLineNumber) {
        continue;
      }
      const checksum = this._getLinesChecksum(range2.startLineNumber + 1, range2.endLineNumber);
      if (!range2.checksum || checksum === range2.checksum) {
        rangesToRestore.push({
          startLineNumber: range2.startLineNumber,
          endLineNumber: range2.endLineNumber,
          type: void 0,
          isCollapsed: range2.isCollapsed ?? true,
          source: range2.source ?? 0 /* provider */
        });
      }
    }
    const newRanges = FoldingRegions.sanitizeAndMerge(this._regions, rangesToRestore, maxLineNumber);
    this.updatePost(FoldingRegions.fromFoldRanges(newRanges));
  }
  _getLinesChecksum(lineNumber1, lineNumber2) {
    const h3 = hash(this._textModel.getLineContent(lineNumber1) + this._textModel.getLineContent(lineNumber2));
    return h3 % 1e6;
  }
  dispose() {
    this._decorationProvider.removeDecorations(this._editorDecorationIds);
    this._updateEventEmitter.dispose();
  }
  getAllRegionsAtLine(lineNumber, filter2) {
    const result = [];
    if (this._regions) {
      let index2 = this._regions.findRange(lineNumber);
      let level = 1;
      while (index2 >= 0) {
        const current = this._regions.toRegion(index2);
        if (!filter2 || filter2(current, level)) {
          result.push(current);
        }
        level++;
        index2 = current.parentIndex;
      }
    }
    return result;
  }
  getRegionAtLine(lineNumber) {
    if (this._regions) {
      const index2 = this._regions.findRange(lineNumber);
      if (index2 >= 0) {
        return this._regions.toRegion(index2);
      }
    }
    return null;
  }
  getRegionsInside(region, filter2) {
    const result = [];
    const index2 = region ? region.regionIndex + 1 : 0;
    const endLineNumber = region ? region.endLineNumber : Number.MAX_VALUE;
    if (filter2 && filter2.length === 2) {
      const levelStack = [];
      for (let i2 = index2, len = this._regions.length; i2 < len; i2++) {
        const current = this._regions.toRegion(i2);
        if (this._regions.getStartLineNumber(i2) < endLineNumber) {
          while (levelStack.length > 0 && !current.containedBy(levelStack[levelStack.length - 1])) {
            levelStack.pop();
          }
          levelStack.push(current);
          if (filter2(current, levelStack.length)) {
            result.push(current);
          }
        } else {
          break;
        }
      }
    } else {
      for (let i2 = index2, len = this._regions.length; i2 < len; i2++) {
        const current = this._regions.toRegion(i2);
        if (this._regions.getStartLineNumber(i2) < endLineNumber) {
          if (!filter2 || filter2(current)) {
            result.push(current);
          }
        } else {
          break;
        }
      }
    }
    return result;
  }
};

function toggleCollapseState(foldingModel, levels, lineNumbers) {
  const toToggle = [];
  for (const lineNumber of lineNumbers) {
    const region = foldingModel.getRegionAtLine(lineNumber);
    if (region) {
      const doCollapse = !region.isCollapsed;
      toToggle.push(region);
      if (levels > 1) {
        const regionsInside = foldingModel.getRegionsInside(region, (r2, level) => r2.isCollapsed !== doCollapse && level < levels);
        toToggle.push(...regionsInside);
      }
    }
  }
  foldingModel.toggleCollapseState(toToggle);
}

function setCollapseStateLevelsDown(foldingModel, doCollapse, levels = Number.MAX_VALUE, lineNumbers) {
  const toToggle = [];
  if (lineNumbers && lineNumbers.length > 0) {
    for (const lineNumber of lineNumbers) {
      const region = foldingModel.getRegionAtLine(lineNumber);
      if (region) {
        if (region.isCollapsed !== doCollapse) {
          toToggle.push(region);
        }
        if (levels > 1) {
          const regionsInside = foldingModel.getRegionsInside(region, (r2, level) => r2.isCollapsed !== doCollapse && level < levels);
          toToggle.push(...regionsInside);
        }
      }
    }
  } else {
    const regionsInside = foldingModel.getRegionsInside(null, (r2, level) => r2.isCollapsed !== doCollapse && level < levels);
    toToggle.push(...regionsInside);
  }
  foldingModel.toggleCollapseState(toToggle);
}

function setCollapseStateLevelsUp(foldingModel, doCollapse, levels, lineNumbers) {
  const toToggle = [];
  for (const lineNumber of lineNumbers) {
    const regions = foldingModel.getAllRegionsAtLine(lineNumber, (region, level) => region.isCollapsed !== doCollapse && level <= levels);
    toToggle.push(...regions);
  }
  foldingModel.toggleCollapseState(toToggle);
}

function setCollapseStateUp(foldingModel, doCollapse, lineNumbers) {
  const toToggle = [];
  for (const lineNumber of lineNumbers) {
    const regions = foldingModel.getAllRegionsAtLine(lineNumber, (region) => region.isCollapsed !== doCollapse);
    if (regions.length > 0) {
      toToggle.push(regions[0]);
    }
  }
  foldingModel.toggleCollapseState(toToggle);
}

function setCollapseStateAtLevel(foldingModel, foldLevel, doCollapse, blockedLineNumbers) {
  const filter2 = (region, level) => level === foldLevel && region.isCollapsed !== doCollapse && !blockedLineNumbers.some((line) => region.containsLine(line));
  const toToggle = foldingModel.getRegionsInside(null, filter2);
  foldingModel.toggleCollapseState(toToggle);
}

function setCollapseStateForRest(foldingModel, doCollapse, blockedLineNumbers) {
  const filteredRegions = [];
  for (const lineNumber of blockedLineNumbers) {
    const regions = foldingModel.getAllRegionsAtLine(lineNumber, void 0);
    if (regions.length > 0) {
      filteredRegions.push(regions[0]);
    }
  }
  const filter2 = (region) => filteredRegions.every((filteredRegion) => !filteredRegion.containedBy(region) && !region.containedBy(filteredRegion)) && region.isCollapsed !== doCollapse;
  const toToggle = foldingModel.getRegionsInside(null, filter2);
  foldingModel.toggleCollapseState(toToggle);
}

function setCollapseStateForMatchingLines(foldingModel, regExp, doCollapse) {
  const editorModel = foldingModel.textModel;
  const regions = foldingModel.regions;
  const toToggle = [];
  for (let i2 = regions.length - 1; i2 >= 0; i2--) {
    if (doCollapse !== regions.isCollapsed(i2)) {
      const startLineNumber = regions.getStartLineNumber(i2);
      if (regExp.test(editorModel.getLineContent(startLineNumber))) {
        toToggle.push(regions.toRegion(i2));
      }
    }
  }
  foldingModel.toggleCollapseState(toToggle);
}

function setCollapseStateForType(foldingModel, type, doCollapse) {
  const regions = foldingModel.regions;
  const toToggle = [];
  for (let i2 = regions.length - 1; i2 >= 0; i2--) {
    if (doCollapse !== regions.isCollapsed(i2) && type === regions.getType(i2)) {
      toToggle.push(regions.toRegion(i2));
    }
  }
  foldingModel.toggleCollapseState(toToggle);
}

function getParentFoldLine(lineNumber, foldingModel) {
  let startLineNumber = null;
  const foldingRegion = foldingModel.getRegionAtLine(lineNumber);
  if (foldingRegion !== null) {
    startLineNumber = foldingRegion.startLineNumber;
    if (lineNumber === startLineNumber) {
      const parentFoldingIdx = foldingRegion.parentIndex;
      if (parentFoldingIdx !== -1) {
        startLineNumber = foldingModel.regions.getStartLineNumber(parentFoldingIdx);
      } else {
        startLineNumber = null;
      }
    }
  }
  return startLineNumber;
}

function getPreviousFoldLine(lineNumber, foldingModel) {
  let foldingRegion = foldingModel.getRegionAtLine(lineNumber);
  if (foldingRegion !== null && foldingRegion.startLineNumber === lineNumber) {
    if (lineNumber !== foldingRegion.startLineNumber) {
      return foldingRegion.startLineNumber;
    } else {
      const expectedParentIndex = foldingRegion.parentIndex;
      let minLineNumber = 0;
      if (expectedParentIndex !== -1) {
        minLineNumber = foldingModel.regions.getStartLineNumber(foldingRegion.parentIndex);
      }
      while (foldingRegion !== null) {
        if (foldingRegion.regionIndex > 0) {
          foldingRegion = foldingModel.regions.toRegion(foldingRegion.regionIndex - 1);
          if (foldingRegion.startLineNumber <= minLineNumber) {
            return null;
          } else if (foldingRegion.parentIndex === expectedParentIndex) {
            return foldingRegion.startLineNumber;
          }
        } else {
          return null;
        }
      }
    }
  } else {
    if (foldingModel.regions.length > 0) {
      foldingRegion = foldingModel.regions.toRegion(foldingModel.regions.length - 1);
      while (foldingRegion !== null) {
        if (foldingRegion.startLineNumber < lineNumber) {
          return foldingRegion.startLineNumber;
        }
        if (foldingRegion.regionIndex > 0) {
          foldingRegion = foldingModel.regions.toRegion(foldingRegion.regionIndex - 1);
        } else {
          foldingRegion = null;
        }
      }
    }
  }
  return null;
}

function getNextFoldLine(lineNumber, foldingModel) {
  let foldingRegion = foldingModel.getRegionAtLine(lineNumber);
  if (foldingRegion !== null && foldingRegion.startLineNumber === lineNumber) {
    const expectedParentIndex = foldingRegion.parentIndex;
    let maxLineNumber = 0;
    if (expectedParentIndex !== -1) {
      maxLineNumber = foldingModel.regions.getEndLineNumber(foldingRegion.parentIndex);
    } else if (foldingModel.regions.length === 0) {
      return null;
    } else {
      maxLineNumber = foldingModel.regions.getEndLineNumber(foldingModel.regions.length - 1);
    }
    while (foldingRegion !== null) {
      if (foldingRegion.regionIndex < foldingModel.regions.length) {
        foldingRegion = foldingModel.regions.toRegion(foldingRegion.regionIndex + 1);
        if (foldingRegion.startLineNumber >= maxLineNumber) {
          return null;
        } else if (foldingRegion.parentIndex === expectedParentIndex) {
          return foldingRegion.startLineNumber;
        }
      } else {
        return null;
      }
    }
  } else {
    if (foldingModel.regions.length > 0) {
      foldingRegion = foldingModel.regions.toRegion(0);
      while (foldingRegion !== null) {
        if (foldingRegion.startLineNumber > lineNumber) {
          return foldingRegion.startLineNumber;
        }
        if (foldingRegion.regionIndex < foldingModel.regions.length) {
          foldingRegion = foldingModel.regions.toRegion(foldingRegion.regionIndex + 1);
        } else {
          foldingRegion = null;
        }
      }
    }
  }
  return null;
}
export { toggleCollapseState, setCollapseStateLevelsDown, setCollapseStateLevelsUp, setCollapseStateUp, setCollapseStateAtLevel, setCollapseStateForRest, setCollapseStateForMatchingLines, setCollapseStateForType, getParentFoldLine, getPreviousFoldLine, getNextFoldLine, FoldingModel };
