// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/viewModel/eventDispatcher.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/workbench/contrib/notebook/browser/viewModel/eventDispatcher.ts
var NotebookEventDispatcher = class extends Disposable {
  constructor() {
    super(...arguments);
    this._onDidChangeLayout = this._register(new Emitter());
    this.onDidChangeLayout = this._onDidChangeLayout.event;
    this._onDidChangeMetadata = this._register(new Emitter());
    this.onDidChangeMetadata = this._onDidChangeMetadata.event;
    this._onDidChangeCellState = this._register(new Emitter());
    this.onDidChangeCellState = this._onDidChangeCellState.event;
  }
  emit(events) {
    for (let i2 = 0, len = events.length; i2 < len; i2++) {
      const e4 = events[i2];
      switch (e4.type) {
        case 1 /* LayoutChanged */:
          this._onDidChangeLayout.fire(e4);
          break;
        case 2 /* MetadataChanged */:
          this._onDidChangeMetadata.fire(e4);
          break;
        case 3 /* CellStateChanged */:
          this._onDidChangeCellState.fire(e4);
          break;
      }
    }
  }
};
export { NotebookEventDispatcher };
