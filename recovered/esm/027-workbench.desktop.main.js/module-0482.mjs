// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/diffEditor/diffProviderFactoryService.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { Emitter } from "./module-0017.mjs";
import { DetailedLineRangeMapping, RangeMapping } from "./module-0179.mjs";
import { LineRange } from "./module-0174.mjs";
import { StopWatch } from "./module-0016.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/editor/browser/widget/diffEditor/diffProviderFactoryService.ts
var IDiffProviderFactoryService = createDecorator("diffProviderFactoryService");

var WorkerBasedDiffProviderFactoryService = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
  }
  createDiffProvider(options3) {
    return this.instantiationService.createInstance(WorkerBasedDocumentDiffProvider, options3);
  }
};

WorkerBasedDiffProviderFactoryService = __decorateClass([
  __decorateParam(0, IInstantiationService)
], WorkerBasedDiffProviderFactoryService);

registerSingleton(IDiffProviderFactoryService, WorkerBasedDiffProviderFactoryService, 1 /* Delayed */);

var WorkerBasedDocumentDiffProvider = class {
  constructor(options3, editorWorkerService, telemetryService) {
    this.editorWorkerService = editorWorkerService;
    this.telemetryService = telemetryService;
    this.onDidChangeEventEmitter = new Emitter();
    this.onDidChange = this.onDidChangeEventEmitter.event;
    this.diffAlgorithm = "advanced";
    this.diffAlgorithmOnDidChangeSubscription = void 0;
    this.setOptions(options3);
  }
  static {
    this.diffCache = /* @__PURE__ */ new Map();
  }
  dispose() {
    this.diffAlgorithmOnDidChangeSubscription?.dispose();
    this.onDidChangeEventEmitter.dispose();
  }
  async computeDiff(original, modified, options3, cancellationToken) {
    if (typeof this.diffAlgorithm !== "string") {
      return this.diffAlgorithm.computeDiff(original, modified, options3, cancellationToken);
    }
    if (original.isDisposed() || modified.isDisposed()) {
      return {
        changes: [],
        identical: true,
        quitEarly: false,
        moves: []
      };
    }
    if (original.getLineCount() === 1 && original.getLineMaxColumn(1) === 1) {
      if (modified.getLineCount() === 1 && modified.getLineMaxColumn(1) === 1) {
        return {
          changes: [],
          identical: true,
          quitEarly: false,
          moves: []
        };
      }
      return {
        changes: [
          new DetailedLineRangeMapping(
            new LineRange(1, 2),
            new LineRange(1, modified.getLineCount() + 1),
            [
              new RangeMapping(
                original.getFullModelRange(),
                modified.getFullModelRange()
              )
            ]
          )
        ],
        identical: false,
        quitEarly: false,
        moves: []
      };
    }
    const uriKey = JSON.stringify([original.uri.toString(), modified.uri.toString()]);
    const context2 = JSON.stringify([original.id, modified.id, original.getAlternativeVersionId(), modified.getAlternativeVersionId(), JSON.stringify(options3)]);
    const c = WorkerBasedDocumentDiffProvider.diffCache.get(uriKey);
    if (c && c.context === context2) {
      return c.result;
    }
    const sw = StopWatch.create();
    const result = await this.editorWorkerService.computeDiff(original.uri, modified.uri, options3, this.diffAlgorithm);
    const timeMs = sw.elapsed();
    this.telemetryService.publicLog2("diffEditor.computeDiff", {
      timeMs,
      timedOut: result?.quitEarly ?? true,
      detectedMoves: options3.computeMoves ? result?.moves.length ?? 0 : -1
    });
    if (cancellationToken.isCancellationRequested) {
      return {
        changes: [],
        identical: false,
        quitEarly: true,
        moves: []
      };
    }
    if (!result) {
      throw new Error("no diff result available");
    }
    if (WorkerBasedDocumentDiffProvider.diffCache.size > 10) {
      WorkerBasedDocumentDiffProvider.diffCache.delete(WorkerBasedDocumentDiffProvider.diffCache.keys().next().value);
    }
    WorkerBasedDocumentDiffProvider.diffCache.set(uriKey, { result, context: context2 });
    return result;
  }
  setOptions(newOptions) {
    let didChange = false;
    if (newOptions.diffAlgorithm) {
      if (this.diffAlgorithm !== newOptions.diffAlgorithm) {
        this.diffAlgorithmOnDidChangeSubscription?.dispose();
        this.diffAlgorithmOnDidChangeSubscription = void 0;
        this.diffAlgorithm = newOptions.diffAlgorithm;
        if (typeof newOptions.diffAlgorithm !== "string") {
          this.diffAlgorithmOnDidChangeSubscription = newOptions.diffAlgorithm.onDidChange(() => this.onDidChangeEventEmitter.fire());
        }
        didChange = true;
      }
    }
    if (didChange) {
      this.onDidChangeEventEmitter.fire();
    }
  }
};

WorkerBasedDocumentDiffProvider = __decorateClass([
  __decorateParam(1, IEditorWorkerService),
  __decorateParam(2, ITelemetryService)
], WorkerBasedDocumentDiffProvider);
export { IDiffProviderFactoryService, WorkerBasedDiffProviderFactoryService, WorkerBasedDocumentDiffProvider };
