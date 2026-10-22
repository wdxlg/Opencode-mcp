// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/viewModel/viewModelDecorations.ts
import { filterFontDecorations, filterValidationDecorations } from "./module-0105.mjs";
import { InlineModelDecorationsComputer } from "./module-0243.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/common/viewModel/viewModelDecorations.ts
var ViewModelDecorations = class {
  constructor(editorId, model, configuration2, linesCollection, coordinatesConverter) {
    this.editorId = editorId;
    this.configuration = configuration2;
    this._linesCollection = linesCollection;
    const context2 = {
      getModelDecorations: (viewRange, onlyMinimapDecorations, onlyMarginDecorations) => this._linesCollection.getDecorationsInRange(viewRange, this.editorId, filterValidationDecorations(this.configuration.options), filterFontDecorations(this.configuration.options), onlyMinimapDecorations, onlyMarginDecorations)
    };
    this._inlineDecorationsComputer = new InlineModelDecorationsComputer(context2, model, coordinatesConverter);
    this._cachedModelDecorationsResolver = null;
    this._cachedModelDecorationsResolverViewRange = null;
  }
  _clearCachedModelDecorationsResolver() {
    this._cachedModelDecorationsResolver = null;
    this._cachedModelDecorationsResolverViewRange = null;
  }
  dispose() {
    this._inlineDecorationsComputer.reset();
    this._clearCachedModelDecorationsResolver();
  }
  reset() {
    this._inlineDecorationsComputer.reset();
    this._clearCachedModelDecorationsResolver();
  }
  onModelDecorationsChanged() {
    this._inlineDecorationsComputer.onModelDecorationsChanged();
    this._clearCachedModelDecorationsResolver();
  }
  onLineMappingChanged() {
    this._inlineDecorationsComputer.onLineMappingChanged();
    this._clearCachedModelDecorationsResolver();
  }
  getMinimapDecorationsInRange(range2) {
    return this._inlineDecorationsComputer.getDecorations(range2, true, false).decorations;
  }
  getDecorationsViewportData(viewRange) {
    let cacheIsValid = this._cachedModelDecorationsResolver !== null;
    cacheIsValid = cacheIsValid && viewRange.equalsRange(this._cachedModelDecorationsResolverViewRange);
    if (!cacheIsValid) {
      this._cachedModelDecorationsResolver = this._inlineDecorationsComputer.getDecorations(viewRange, false, false);
      this._cachedModelDecorationsResolverViewRange = viewRange;
    }
    return this._cachedModelDecorationsResolver;
  }
  getDecorationsOnLine(lineNumber, onlyMinimapDecorations = false, onlyMarginDecorations = false) {
    const range2 = new Range2(lineNumber, this._linesCollection.getViewLineMinColumn(lineNumber), lineNumber, this._linesCollection.getViewLineMaxColumn(lineNumber));
    return this._inlineDecorationsComputer.getDecorations(range2, onlyMinimapDecorations, onlyMarginDecorations);
  }
};
export { ViewModelDecorations };
