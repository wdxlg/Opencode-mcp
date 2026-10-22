// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/diff/editorHeightCalculator.ts
import { UnchangedRegion } from "./module-0483.mjs";
import { HeightOfHiddenLinesRegionInDiffEditor } from "./module-1947.mjs";
import { getEditorPadding } from "./module-1942.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/notebook/browser/diff/editorHeightCalculator.ts
var DiffEditorHeightCalculatorService = class {
  constructor(lineHeight, textModelResolverService, editorWorkerService, configurationService) {
    this.lineHeight = lineHeight;
    this.textModelResolverService = textModelResolverService;
    this.editorWorkerService = editorWorkerService;
    this.configurationService = configurationService;
  }
  async diffAndComputeHeight(original, modified) {
    const [originalModel, modifiedModel] = await Promise.all([this.textModelResolverService.createModelReference(original), this.textModelResolverService.createModelReference(modified)]);
    try {
      const diffChanges = await this.editorWorkerService.computeDiff(original, modified, {
        ignoreTrimWhitespace: true,
        maxComputationTimeMs: 0,
        computeMoves: false
      }, "advanced").then((diff4) => diff4?.changes || []);
      const unchangedRegionFeatureEnabled = this.configurationService.getValue("diffEditor.hideUnchangedRegions.enabled");
      const minimumLineCount = this.configurationService.getValue("diffEditor.hideUnchangedRegions.minimumLineCount");
      const contextLineCount = this.configurationService.getValue("diffEditor.hideUnchangedRegions.contextLineCount");
      const originalLineCount = originalModel.object.textEditorModel.getLineCount();
      const modifiedLineCount = modifiedModel.object.textEditorModel.getLineCount();
      const unchanged2 = unchangedRegionFeatureEnabled ? UnchangedRegion.fromDiffs(
        diffChanges,
        originalLineCount,
        modifiedLineCount,
        minimumLineCount ?? 3,
        contextLineCount ?? 3
      ) : [];
      const numberOfNewLines = diffChanges.reduce((prev, curr) => {
        if (curr.original.isEmpty && !curr.modified.isEmpty) {
          return prev + curr.modified.length;
        }
        if (!curr.original.isEmpty && !curr.modified.isEmpty && curr.modified.length > curr.original.length) {
          return prev + curr.modified.length - curr.original.length;
        }
        return prev;
      }, 0);
      const orginalNumberOfLines = originalModel.object.textEditorModel.getLineCount();
      const numberOfHiddenLines = unchanged2.reduce((prev, curr) => prev + curr.lineCount, 0);
      const numberOfHiddenSections = unchanged2.length;
      const unchangeRegionsHeight = numberOfHiddenSections * HeightOfHiddenLinesRegionInDiffEditor;
      const visibleLineCount = orginalNumberOfLines + numberOfNewLines - numberOfHiddenLines;
      return visibleLineCount * this.lineHeight + getEditorPadding(visibleLineCount).top + getEditorPadding(visibleLineCount).bottom + unchangeRegionsHeight;
    } finally {
      originalModel.dispose();
      modifiedModel.dispose();
    }
  }
  computeHeightFromLines(lineCount) {
    return lineCount * this.lineHeight + getEditorPadding(lineCount).top + getEditorPadding(lineCount).bottom;
  }
};

DiffEditorHeightCalculatorService = __decorateClass([
  __decorateParam(1, ITextModelService),
  __decorateParam(2, IEditorWorkerService),
  __decorateParam(3, IConfigurationService)
], DiffEditorHeightCalculatorService);
export { DiffEditorHeightCalculatorService };
