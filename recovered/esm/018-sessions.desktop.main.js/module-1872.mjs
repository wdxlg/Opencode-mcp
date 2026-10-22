// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/notebookViewEvents.ts



// src/vs/workbench/contrib/notebook/browser/notebookViewEvents.ts
var NotebookLayoutChangedEvent = class {
  constructor(source, value2) {
    this.source = source;
    this.value = value2;
    this.type = 1 /* LayoutChanged */;
  }
};

var NotebookMetadataChangedEvent = class {
  constructor(source) {
    this.source = source;
    this.type = 2 /* MetadataChanged */;
  }
};

var NotebookCellStateChangedEvent = class {
  constructor(source, cell) {
    this.source = source;
    this.cell = cell;
    this.type = 3 /* CellStateChanged */;
  }
};
export { NotebookLayoutChangedEvent, NotebookMetadataChangedEvent, NotebookCellStateChangedEvent };
