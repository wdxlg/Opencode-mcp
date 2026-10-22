// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewModel/OutlineEntry.ts
import { SymbolKinds } from "./module-0164.mjs";
import { executingStateIcon } from "./module-1846.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/notebook/browser/viewModel/OutlineEntry.ts
var OutlineEntry = class {
  constructor(index2, level, cell, label3, isExecuting, isPaused, range2, symbolKind) {
    this.index = index2;
    this.level = level;
    this.cell = cell;
    this.label = label3;
    this.isExecuting = isExecuting;
    this.isPaused = isPaused;
    this.range = range2;
    this.symbolKind = symbolKind;
    this._children = [];
  }
  get icon() {
    if (this.symbolKind) {
      return SymbolKinds.toIcon(this.symbolKind);
    }
    return this.isExecuting && this.isPaused ? executingStateIcon : this.isExecuting ? ThemeIcon.modify(executingStateIcon, "spin") : this.cell.cellKind === 1 /* Markup */ ? Codicon.markdown : Codicon.code;
  }
  addChild(entry) {
    this._children.push(entry);
    entry._parent = this;
  }
  get parent() {
    return this._parent;
  }
  get children() {
    return this._children;
  }
  get markerInfo() {
    return this._markerInfo;
  }
  get position() {
    if (this.range) {
      return { startLineNumber: this.range.startLineNumber, startColumn: this.range.startColumn };
    }
    return void 0;
  }
  updateMarkers(markerService) {
    if (this.cell.cellKind === 2 /* Code */) {
      const marker = markerService.read({ resource: this.cell.uri, severities: 8 /* Error */ | 4 /* Warning */ });
      if (marker.length === 0) {
        this._markerInfo = void 0;
      } else {
        const topSev = marker.find((a) => a.severity === 8 /* Error */)?.severity ?? 4 /* Warning */;
        this._markerInfo = { topSev, count: marker.length };
      }
    } else {
      let topChild;
      for (const child of this.children) {
        child.updateMarkers(markerService);
        if (child.markerInfo) {
          topChild = !topChild ? child.markerInfo.topSev : Math.max(child.markerInfo.topSev, topChild);
        }
      }
      this._markerInfo = topChild && { topSev: topChild, count: 0 };
    }
  }
  clearMarkers() {
    this._markerInfo = void 0;
    for (const child of this.children) {
      child.clearMarkers();
    }
  }
  find(cell, parents) {
    if (cell.id === this.cell.id) {
      return this;
    }
    parents.push(this);
    for (const child of this.children) {
      const result = child.find(cell, parents);
      if (result) {
        return result;
      }
    }
    parents.pop();
    return void 0;
  }
  asFlatList(bucket) {
    bucket.push(this);
    for (const child of this.children) {
      child.asFlatList(bucket);
    }
  }
};
export { OutlineEntry };
