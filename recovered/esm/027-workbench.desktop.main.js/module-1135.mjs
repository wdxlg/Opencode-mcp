// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/model/diffComputer.ts
import { observableConfigValue } from "./module-0444.mjs";
import { DetailedLineRangeMapping5, RangeMapping3 } from "./module-1134.mjs";
import { assertFn, checkAdjacentItems } from "./module-0009.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { MergeEditorLineRange } from "./module-1130.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/model/diffComputer.ts
var MergeDiffComputer = class {
  constructor(editorWorkerService, configurationService) {
    this.editorWorkerService = editorWorkerService;
    this.configurationService = configurationService;
    this.mergeAlgorithm = observableConfigValue(
      "mergeEditor.diffAlgorithm",
      "advanced",
      this.configurationService
    ).map((v2) => v2 === "smart" ? "legacy" : v2 === "experimental" ? "advanced" : v2);
  }
  async computeDiff(textModel1, textModel2, reader) {
    const diffAlgorithm = this.mergeAlgorithm.read(reader);
    const inputVersion = textModel1.getVersionId();
    const outputVersion = textModel2.getVersionId();
    const result = await this.editorWorkerService.computeDiff(
      textModel1.uri,
      textModel2.uri,
      {
        ignoreTrimWhitespace: false,
        maxComputationTimeMs: 0,
        computeMoves: false
      },
      diffAlgorithm
    );
    if (!result) {
      throw new Error("Diff computation failed");
    }
    if (textModel1.isDisposed() || textModel2.isDisposed()) {
      return { diffs: null };
    }
    const changes = result.changes.map(
      (c) => new DetailedLineRangeMapping5(
        toLineRange(c.original),
        textModel1,
        toLineRange(c.modified),
        textModel2,
        c.innerChanges?.map((ic) => toRangeMapping(ic))
      )
    );
    const newInputVersion = textModel1.getVersionId();
    const newOutputVersion = textModel2.getVersionId();
    if (inputVersion !== newInputVersion || outputVersion !== newOutputVersion) {
      return { diffs: null };
    }
    assertFn(() => {
      return changes.length === 0 || changes[0].inputRange.startLineNumber === changes[0].outputRange.startLineNumber && checkAdjacentItems(
        changes,
        (m1, m2) => m2.inputRange.startLineNumber - m1.inputRange.endLineNumberExclusive === m2.outputRange.startLineNumber - m1.outputRange.endLineNumberExclusive && // There has to be an unchanged line in between (otherwise both diffs should have been joined)
        m1.inputRange.endLineNumberExclusive < m2.inputRange.startLineNumber && m1.outputRange.endLineNumberExclusive < m2.outputRange.startLineNumber
      );
    });
    return {
      diffs: changes
    };
  }
};

MergeDiffComputer = __decorateClass([
  __decorateParam(0, IEditorWorkerService),
  __decorateParam(1, IConfigurationService)
], MergeDiffComputer);

function toLineRange(range2) {
  return MergeEditorLineRange.fromLength(range2.startLineNumber, range2.length);
}

function toRangeMapping(mapping2) {
  return new RangeMapping3(mapping2.originalRange, mapping2.modifiedRange);
}
export { toLineRange, toRangeMapping, MergeDiffComputer };
