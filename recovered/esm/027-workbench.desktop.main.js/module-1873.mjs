// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/common/notebookPerformance.ts



// src/vs/workbench/contrib/notebook/common/notebookPerformance.ts
var NotebookPerfMarks = class {
  constructor() {
    this._marks = {};
  }
  get value() {
    return { ...this._marks };
  }
  mark(name) {
    if (this._marks[name]) {
      console.error(`Skipping overwrite of notebook perf value: ${name}`);
      return;
    }
    this._marks[name] = Date.now();
  }
};
export { NotebookPerfMarks };
