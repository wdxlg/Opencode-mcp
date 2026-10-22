// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/search/browser/searchTreeModel/rangeDecorations.ts
import { DisposableStore } from "./module-0012.mjs";
import { URI } from "./module-0032.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IModelService } from "./module-0080.mjs";


// src/vs/workbench/contrib/search/browser/searchTreeModel/rangeDecorations.ts
var RangeHighlightDecorations2 = class {
  constructor(_modelService) {
    this._modelService = _modelService;
    this._decorationId = null;
    this._model = null;
    this._modelDisposables = new DisposableStore();
  }
  removeHighlightRange() {
    if (this._model && this._decorationId) {
      const decorationId = this._decorationId;
      this._model.changeDecorations((accessor) => {
        accessor.removeDecoration(decorationId);
      });
    }
    this._decorationId = null;
  }
  highlightRange(resource, range2, ownerId2 = 0) {
    let model;
    if (URI.isUri(resource)) {
      model = this._modelService.getModel(resource);
    } else {
      model = resource;
    }
    if (model) {
      this.doHighlightRange(model, range2);
    }
  }
  doHighlightRange(model, range2) {
    this.removeHighlightRange();
    model.changeDecorations((accessor) => {
      this._decorationId = accessor.addDecoration(range2, RangeHighlightDecorations2._RANGE_HIGHLIGHT_DECORATION);
    });
    this.setModel(model);
  }
  setModel(model) {
    if (this._model !== model) {
      this.clearModelListeners();
      this._model = model;
      this._modelDisposables.add(this._model.onDidChangeDecorations((e4) => {
        this.clearModelListeners();
        this.removeHighlightRange();
        this._model = null;
      }));
      this._modelDisposables.add(this._model.onWillDispose(() => {
        this.clearModelListeners();
        this.removeHighlightRange();
        this._model = null;
      }));
    }
  }
  clearModelListeners() {
    this._modelDisposables.clear();
  }
  dispose() {
    if (this._model) {
      this.removeHighlightRange();
      this._model = null;
    }
    this._modelDisposables.dispose();
  }
  static {
    this._RANGE_HIGHLIGHT_DECORATION = ModelDecorationOptions.register({
      description: "search-range-highlight",
      stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
      className: "rangeHighlight",
      isWholeLine: true
    });
  }
};

RangeHighlightDecorations2 = __decorateClass([
  __decorateParam(0, IModelService)
], RangeHighlightDecorations2);
export { RangeHighlightDecorations2 };
