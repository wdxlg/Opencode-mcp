// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/notebookLogger.ts



// src/vs/workbench/contrib/notebook/browser/notebookLogger.ts
var NotebookLogger = class {
  constructor() {
    this._frameId = 0;
    this._domFrameLog();
  }
  _domFrameLog() {
  }
  debug(...args2) {
    const date = /* @__PURE__ */ new Date();
    console.log(`${date.getSeconds()}:${date.getMilliseconds().toString().padStart(3, "0")}`, `frame #${this._frameId}: `, ...args2);
  }
};

var instance = new NotebookLogger();

function notebookDebug(...args2) {
  instance.debug(...args2);
}
export { notebookDebug, NotebookLogger, instance };
