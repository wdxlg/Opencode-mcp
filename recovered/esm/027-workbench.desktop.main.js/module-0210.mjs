// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/services/markerDecorations.ts
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMarkerDecorationsService } from "./module-0209.mjs";


// src/vs/editor/browser/services/markerDecorations.ts
var MarkerDecorationsContribution = class {
  static {
    this.ID = "editor.contrib.markerDecorations";
  }
  constructor(_editor, _markerDecorationsService) {
  }
  dispose() {
  }
};

MarkerDecorationsContribution = __decorateClass([
  __decorateParam(1, IMarkerDecorationsService)
], MarkerDecorationsContribution);
export { MarkerDecorationsContribution };
