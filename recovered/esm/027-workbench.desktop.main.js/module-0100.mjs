// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/config/editorZoom.ts
import { Emitter } from "./module-0017.mjs";


// src/vs/editor/common/config/editorZoom.ts
var EditorZoom = new class {
  constructor() {
    this._zoomLevel = 0;
    this._onDidChangeZoomLevel = new Emitter();
    this.onDidChangeZoomLevel = this._onDidChangeZoomLevel.event;
  }
  getZoomLevel() {
    return this._zoomLevel;
  }
  setZoomLevel(zoomLevel) {
    zoomLevel = Math.min(Math.max(-5, zoomLevel), 20);
    if (this._zoomLevel === zoomLevel) {
      return;
    }
    this._zoomLevel = zoomLevel;
    this._onDidChangeZoomLevel.fire(this._zoomLevel);
  }
}();
export { EditorZoom };
