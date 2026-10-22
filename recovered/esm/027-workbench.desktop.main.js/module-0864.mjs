// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/diffEditorBreadcrumbs/browser/contribution.ts
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { Event2 } from "./module-0017.mjs";
import { autorunWithStore } from "./module-0052.mjs";
import { DisposableCancellationTokenSource } from "./module-0478.mjs";
import { compareBy, numberComparator, reverseOrder } from "./module-0007.mjs";
import { LineRange } from "./module-0174.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { IOutlineModelService } from "./module-0691.mjs";
import { HideUnchangedRegionsFeature } from "./module-0525.mjs";


// src/vs/editor/contrib/diffEditorBreadcrumbs/browser/contribution.ts
var DiffEditorBreadcrumbsSource = class extends Disposable {
  constructor(_textModel, _languageFeaturesService, _outlineModelService) {
    super();
    this._textModel = _textModel;
    this._languageFeaturesService = _languageFeaturesService;
    this._outlineModelService = _outlineModelService;
    this._currentModel = observableValue(this, void 0);
    const documentSymbolProviderChanged = observableSignalFromEvent(
      "documentSymbolProvider.onDidChange",
      this._languageFeaturesService.documentSymbolProvider.onDidChange
    );
    const textModelChanged = observableSignalFromEvent(
      "_textModel.onDidChangeContent",
      Event2.debounce((e) => this._textModel.onDidChangeContent(e), () => void 0, 100)
    );
    this._register(autorunWithStore(async (reader, store) => {
      documentSymbolProviderChanged.read(reader);
      textModelChanged.read(reader);
      const src = store.add(new DisposableCancellationTokenSource());
      const model = await this._outlineModelService.getOrCreate(this._textModel, src.token);
      if (store.isDisposed) {
        return;
      }
      this._currentModel.set(model, void 0);
    }));
  }
  getBreadcrumbItems(startRange, reader) {
    const m = this._currentModel.read(reader);
    if (!m) {
      return [];
    }
    const symbols = m.asListOfDocumentSymbols().filter((s) => startRange.contains(s.range.startLineNumber) && !startRange.contains(s.range.endLineNumber));
    symbols.sort(reverseOrder(compareBy((s) => s.range.endLineNumber - s.range.startLineNumber, numberComparator)));
    return symbols.map((s) => ({ name: s.name, kind: s.kind, startLineNumber: s.range.startLineNumber }));
  }
  getAt(lineNumber, reader) {
    const m = this._currentModel.read(reader);
    if (!m) {
      return [];
    }
    const symbols = m.asListOfDocumentSymbols().filter((s) => new LineRange(s.range.startLineNumber, s.range.endLineNumber).contains(lineNumber));
    if (symbols.length === 0) {
      return [];
    }
    symbols.sort(reverseOrder(compareBy((s) => s.range.endLineNumber - s.range.startLineNumber, numberComparator)));
    return symbols.map((s) => ({ name: s.name, kind: s.kind, startLineNumber: s.range.startLineNumber }));
  }
};

DiffEditorBreadcrumbsSource = __decorateClass([
  __decorateParam(1, ILanguageFeaturesService),
  __decorateParam(2, IOutlineModelService)
], DiffEditorBreadcrumbsSource);

HideUnchangedRegionsFeature.setBreadcrumbsSourceFactory((textModel, instantiationService) => {
  return instantiationService.createInstance(DiffEditorBreadcrumbsSource, textModel);
});
export { DiffEditorBreadcrumbsSource };
