// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewModel/cellSelectionCollection.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { cellRangesEqual } from "./module-0941.mjs";


// src/vs/workbench/contrib/notebook/browser/viewModel/cellSelectionCollection.ts
var NotebookCellSelectionCollection = class extends Disposable {
  constructor() {
    super(...arguments);
    this._onDidChangeSelection = this._register(new Emitter());
    this._primary = { start: 0, end: 0 };
    this._selections = [{ start: 0, end: 0 }];
  }
  get onDidChangeSelection() {
    return this._onDidChangeSelection.event;
  }
  get selections() {
    return this._selections;
  }
  get focus() {
    return this._primary;
  }
  setState(primary, selections, forceEventEmit, source) {
    const validPrimary = primary ?? { start: 0, end: 0 };
    const validSelections = selections.length > 0 ? selections : [{ start: 0, end: 0 }];
    const changed = !cellRangesEqual([validPrimary], [this._primary]) || !cellRangesEqual(this._selections, validSelections);
    this._primary = validPrimary;
    this._selections = validSelections;
    if (changed || forceEventEmit) {
      this._onDidChangeSelection.fire(source);
    }
  }
  setSelections(selections, forceEventEmit, source) {
    this.setState(this._primary, selections, forceEventEmit, source);
  }
};
export { NotebookCellSelectionCollection };
