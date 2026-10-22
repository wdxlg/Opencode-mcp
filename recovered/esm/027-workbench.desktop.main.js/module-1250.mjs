// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadDocumentDiff.ts
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { MainContext } from "./module-0921.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";


// src/vs/workbench/api/browser/mainThreadDocumentDiff.ts
var MainThreadDocumentDiff = class {
  constructor(_extHostContext, _editorWorkerService) {
    this._editorWorkerService = _editorWorkerService;
  }
  async $computeDocumentDiff(originalUri, modifiedUri, ignoreTrimWhitespace, maxComputationTimeMs, computeMoves) {
    const original = URI.revive(originalUri);
    const modified = URI.revive(modifiedUri);
    const result = await this._editorWorkerService.computeDiff(original, modified, {
      ignoreTrimWhitespace,
      maxComputationTimeMs,
      computeMoves
    }, "advanced");
    if (!result) {
      return null;
    }
    const toLineRange2 = (r2) => ({
      startLineNumber: r2.startLineNumber,
      startColumn: 1,
      endLineNumber: r2.endLineNumberExclusive,
      endColumn: 1
    });
    const mapChange = (c) => ({
      originalRange: toLineRange2(c.original),
      modifiedRange: toLineRange2(c.modified),
      innerChanges: c.innerChanges?.map((ic) => ({
        originalRange: ic.originalRange,
        modifiedRange: ic.modifiedRange
      }))
    });
    return {
      identical: result.identical,
      quitEarly: result.quitEarly,
      changes: result.changes.map(mapChange),
      moves: result.moves.map((m) => ({
        originalRange: toLineRange2(m.lineRangeMapping.original),
        modifiedRange: toLineRange2(m.lineRangeMapping.modified),
        changes: m.changes.map(mapChange)
      }))
    };
  }
  dispose() {
  }
};

MainThreadDocumentDiff = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadDocumentDiff),
  __decorateParam(1, IEditorWorkerService)
], MainThreadDocumentDiff);
export { MainThreadDocumentDiff };
