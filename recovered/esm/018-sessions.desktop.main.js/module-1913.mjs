// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewModel/foldingModel.ts
import { DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { FoldingRegions } from "./module-0678.mjs";
import { cellRangesToIndexes } from "./module-0941.mjs";
import { sanitizeRanges } from "./module-0683.mjs";
import { marked } from "./module-0464.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";


// src/vs/workbench/contrib/notebook/browser/viewModel/foldingModel.ts
var foldingRangeLimit = {
  limit: 5e3,
  update: () => {
  }
};

var FoldingModel3 = class {
  constructor() {
    this._viewModel = null;
    this._viewModelStore = new DisposableStore();
    this._onDidFoldingRegionChanges = new Emitter();
    this.onDidFoldingRegionChanged = this._onDidFoldingRegionChanges.event;
    this._foldingRangeDecorationIds = [];
    this._regions = new FoldingRegions(new Uint32Array(0), new Uint32Array(0));
  }
  get regions() {
    return this._regions;
  }
  dispose() {
    this._onDidFoldingRegionChanges.dispose();
    this._viewModelStore.dispose();
  }
  detachViewModel() {
    this._viewModelStore.clear();
    this._viewModel = null;
  }
  attachViewModel(model) {
    this._viewModel = model;
    this._viewModelStore.add(this._viewModel.onDidChangeViewCells(() => {
      this.recompute();
    }));
    this._viewModelStore.add(this._viewModel.onDidChangeSelection(() => {
      if (!this._viewModel) {
        return;
      }
      const indexes = cellRangesToIndexes(this._viewModel.getSelections());
      let changed = false;
      indexes.forEach((index2) => {
        let regionIndex = this.regions.findRange(index2 + 1);
        while (regionIndex !== -1) {
          if (this._regions.isCollapsed(regionIndex) && index2 > this._regions.getStartLineNumber(regionIndex) - 1) {
            this._regions.setCollapsed(regionIndex, false);
            changed = true;
          }
          regionIndex = this._regions.getParentIndex(regionIndex);
        }
      });
      if (changed) {
        this._onDidFoldingRegionChanges.fire();
      }
    }));
    this.recompute();
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
  setCollapsed(index2, newState) {
    this._regions.setCollapsed(index2, newState);
  }
  recompute() {
    if (!this._viewModel) {
      return;
    }
    const viewModel = this._viewModel;
    const cells = viewModel.viewCells;
    const stack = [];
    for (let i3 = 0; i3 < cells.length; i3++) {
      const cell = cells[i3];
      if (cell.cellKind !== 1 /* Markup */ || cell.language !== "markdown") {
        continue;
      }
      const minDepth = Math.min(7, ...Array.from(getMarkdownHeadersInCell(cell.getText()), (header2) => header2.depth));
      if (minDepth < 7) {
        stack.push({ index: i3, level: minDepth, endIndex: 0 });
      }
    }
    const rawFoldingRanges = stack.map((entry, startIndex) => {
      let end = void 0;
      for (let i3 = startIndex + 1; i3 < stack.length; ++i3) {
        if (stack[i3].level <= entry.level) {
          end = stack[i3].index - 1;
          break;
        }
      }
      const endIndex = end !== void 0 ? end : cells.length - 1;
      return {
        start: entry.index + 1,
        end: endIndex + 1,
        rank: 1
      };
    }).filter((range2) => range2.start !== range2.end);
    const newRegions = sanitizeRanges(rawFoldingRanges, foldingRangeLimit);
    let i2 = 0;
    const nextCollapsed = () => {
      while (i2 < this._regions.length) {
        const isCollapsed = this._regions.isCollapsed(i2);
        i2++;
        if (isCollapsed) {
          return i2 - 1;
        }
      }
      return -1;
    };
    let k = 0;
    let collapsedIndex = nextCollapsed();
    while (collapsedIndex !== -1 && k < newRegions.length) {
      const decRange = viewModel.getTrackedRange(this._foldingRangeDecorationIds[collapsedIndex]);
      if (decRange) {
        const collasedStartIndex = decRange.start;
        while (k < newRegions.length) {
          const startIndex = newRegions.getStartLineNumber(k) - 1;
          if (collasedStartIndex >= startIndex) {
            newRegions.setCollapsed(k, collasedStartIndex === startIndex);
            k++;
          } else {
            break;
          }
        }
      }
      collapsedIndex = nextCollapsed();
    }
    while (k < newRegions.length) {
      newRegions.setCollapsed(k, false);
      k++;
    }
    const cellRanges = [];
    for (let i3 = 0; i3 < newRegions.length; i3++) {
      const region = newRegions.toRegion(i3);
      cellRanges.push({ start: region.startLineNumber - 1, end: region.endLineNumber - 1 });
    }
    this._foldingRangeDecorationIds.forEach((id2) => viewModel.setTrackedRange(id2, null, 3 /* GrowsOnlyWhenTypingAfter */));
    this._foldingRangeDecorationIds = cellRanges.map((region) => viewModel.setTrackedRange(null, region, 3 /* GrowsOnlyWhenTypingAfter */)).filter((str) => str !== null);
    this._regions = newRegions;
    this._onDidFoldingRegionChanges.fire();
  }
  getMemento() {
    const collapsedRanges = [];
    let i2 = 0;
    while (i2 < this._regions.length) {
      const isCollapsed = this._regions.isCollapsed(i2);
      if (isCollapsed) {
        const region = this._regions.toRegion(i2);
        collapsedRanges.push({ start: region.startLineNumber - 1, end: region.endLineNumber - 1 });
      }
      i2++;
    }
    return collapsedRanges;
  }
  applyMemento(state) {
    if (!this._viewModel) {
      return false;
    }
    let i2 = 0;
    let k = 0;
    while (k < state.length && i2 < this._regions.length) {
      const decRange = this._viewModel.getTrackedRange(this._foldingRangeDecorationIds[i2]);
      if (decRange) {
        const collasedStartIndex = state[k].start;
        while (i2 < this._regions.length) {
          const startIndex = this._regions.getStartLineNumber(i2) - 1;
          if (collasedStartIndex >= startIndex) {
            this._regions.setCollapsed(i2, collasedStartIndex === startIndex);
            i2++;
          } else {
            break;
          }
        }
      }
      k++;
    }
    while (i2 < this._regions.length) {
      this._regions.setCollapsed(i2, false);
      i2++;
    }
    return true;
  }
};

function* getMarkdownHeadersInCell(cellContent) {
  for (const token of marked.lexer(cellContent, { gfm: true })) {
    if (token.type === "heading") {
      yield {
        depth: token.depth,
        text: renderAsPlaintext({ value: token.raw }).trim()
      };
    }
  }
}
export { getMarkdownHeadersInCell, foldingRangeLimit, FoldingModel3 };
