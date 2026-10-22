// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/gotoError/browser/markerSelectionStatus.ts
import { Disposable } from "./module-0012.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { Range2 } from "./module-0106.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { registerEditorContribution } from "./module-0097.mjs";


// src/vs/editor/contrib/gotoError/browser/markerSelectionStatus.ts
var MarkerSelectionStatus = class extends Disposable {
  constructor(_editor, contextKeyService, _markerService) {
    super();
    this._editor = _editor;
    this._markerService = _markerService;
    this._ctxHasDiagnostics = EditorContextKeys.selectionHasDiagnostics.bindTo(contextKeyService);
    this._store.add(this._editor.onDidChangeCursorSelection(() => this._update()));
    this._store.add(this._editor.onDidChangeModel(() => this._update()));
    this._store.add(this._markerService.onMarkerChanged((e) => {
      const model = this._editor.getModel();
      if (model && e.some((uri5) => isEqual2(uri5, model.uri))) {
        this._update();
      }
    }));
    this._update();
  }
  static {
    this.ID = "editor.contrib.markerSelectionStatus";
  }
  dispose() {
    this._ctxHasDiagnostics.reset();
    super.dispose();
  }
  _update() {
    const model = this._editor.getModel();
    const selection = this._editor.getSelection();
    if (!model || !selection) {
      this._ctxHasDiagnostics.reset();
      return;
    }
    const markers = this._markerService.read({
      resource: model.uri,
      severities: 8 /* Error */ | 4 /* Warning */ | 2 /* Info */
    });
    const hasIntersecting = markers.some((marker) => Range2.areIntersecting(
      { startLineNumber: marker.startLineNumber, startColumn: marker.startColumn, endLineNumber: marker.endLineNumber, endColumn: marker.endColumn },
      selection
    ));
    this._ctxHasDiagnostics.set(hasIntersecting);
  }
};

MarkerSelectionStatus = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IMarkerService)
], MarkerSelectionStatus);

registerEditorContribution(MarkerSelectionStatus.ID, MarkerSelectionStatus, 1 /* AfterFirstRender */);
export { MarkerSelectionStatus };
