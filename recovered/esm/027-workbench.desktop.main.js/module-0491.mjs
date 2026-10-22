// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/widget/diffEditor/components/diffEditorDecorations.ts
import { Disposable } from "./module-0012.mjs";
import { derived } from "./module-0054.mjs";
import { diffAddDecoration, diffAddDecorationEmpty, diffDeleteDecoration, diffDeleteDecorationEmpty, diffLineAddDecorationBackground, diffLineAddDecorationBackgroundWithIndicator, diffLineDeleteDecorationBackground, diffLineDeleteDecorationBackgroundWithIndicator, diffWholeLineAddDecoration, diffWholeLineDeleteDecoration } from "./module-0481.mjs";
import { allowsTrueInlineDiffRendering } from "./module-0489.mjs";
import { MovedBlocksLinesFeature } from "./module-0490.mjs";
import { applyObservableDecorations } from "./module-0478.mjs";


// src/vs/editor/browser/widget/diffEditor/components/diffEditorDecorations.ts
var DiffEditorDecorations = class extends Disposable {
  constructor(_editors, _diffModel, _options, widget) {
    super();
    this._editors = _editors;
    this._diffModel = _diffModel;
    this._options = _options;
    this._decorations = derived(this, (reader) => {
      const diffModel = this._diffModel.read(reader);
      const diff4 = diffModel?.diff.read(reader);
      if (!diff4) {
        return null;
      }
      const movedTextToCompare = this._diffModel.read(reader).movedTextToCompare.read(reader);
      const renderIndicators = this._options.renderIndicators.read(reader);
      const showEmptyDecorations = this._options.showEmptyDecorations.read(reader);
      const originalDecorations = [];
      const modifiedDecorations = [];
      if (!movedTextToCompare) {
        for (const m of diff4.mappings) {
          if (!m.lineRangeMapping.original.isEmpty) {
            originalDecorations.push({ range: m.lineRangeMapping.original.toInclusiveRange(), options: renderIndicators ? diffLineDeleteDecorationBackgroundWithIndicator : diffLineDeleteDecorationBackground });
          }
          if (!m.lineRangeMapping.modified.isEmpty) {
            modifiedDecorations.push({ range: m.lineRangeMapping.modified.toInclusiveRange(), options: renderIndicators ? diffLineAddDecorationBackgroundWithIndicator : diffLineAddDecorationBackground });
          }
          if (m.lineRangeMapping.modified.isEmpty || m.lineRangeMapping.original.isEmpty) {
            if (!m.lineRangeMapping.original.isEmpty) {
              originalDecorations.push({ range: m.lineRangeMapping.original.toInclusiveRange(), options: diffWholeLineDeleteDecoration });
            }
            if (!m.lineRangeMapping.modified.isEmpty) {
              modifiedDecorations.push({ range: m.lineRangeMapping.modified.toInclusiveRange(), options: diffWholeLineAddDecoration });
            }
          } else {
            const useInlineDiff = this._options.useTrueInlineDiffRendering.read(reader) && allowsTrueInlineDiffRendering(m.lineRangeMapping);
            for (const i2 of m.lineRangeMapping.innerChanges || []) {
              if (m.lineRangeMapping.original.contains(i2.originalRange.startLineNumber)) {
                originalDecorations.push({ range: i2.originalRange, options: i2.originalRange.isEmpty() && showEmptyDecorations ? diffDeleteDecorationEmpty : diffDeleteDecoration });
              }
              if (m.lineRangeMapping.modified.contains(i2.modifiedRange.startLineNumber)) {
                modifiedDecorations.push({ range: i2.modifiedRange, options: i2.modifiedRange.isEmpty() && showEmptyDecorations && !useInlineDiff ? diffAddDecorationEmpty : diffAddDecoration });
              }
              if (useInlineDiff) {
                const deletedText = diffModel.model.original.getValueInRange(i2.originalRange);
                modifiedDecorations.push({
                  range: i2.modifiedRange,
                  options: {
                    description: "deleted-text",
                    before: {
                      content: deletedText,
                      inlineClassName: "inline-deleted-text"
                    },
                    zIndex: 1e5,
                    showIfCollapsed: true
                  }
                });
              }
            }
          }
        }
      }
      if (movedTextToCompare) {
        for (const m of movedTextToCompare.changes) {
          const fullRangeOriginal = m.original.toInclusiveRange();
          if (fullRangeOriginal) {
            originalDecorations.push({ range: fullRangeOriginal, options: renderIndicators ? diffLineDeleteDecorationBackgroundWithIndicator : diffLineDeleteDecorationBackground });
          }
          const fullRangeModified = m.modified.toInclusiveRange();
          if (fullRangeModified) {
            modifiedDecorations.push({ range: fullRangeModified, options: renderIndicators ? diffLineAddDecorationBackgroundWithIndicator : diffLineAddDecorationBackground });
          }
          for (const i2 of m.innerChanges || []) {
            originalDecorations.push({ range: i2.originalRange, options: diffDeleteDecoration });
            modifiedDecorations.push({ range: i2.modifiedRange, options: diffAddDecoration });
          }
        }
      }
      const activeMovedText = this._diffModel.read(reader).activeMovedText.read(reader);
      for (const m of diff4.movedTexts) {
        originalDecorations.push({
          range: m.lineRangeMapping.original.toInclusiveRange(),
          options: {
            description: "moved",
            blockClassName: "movedOriginal" + (m === activeMovedText ? " currentMove" : ""),
            blockPadding: [MovedBlocksLinesFeature.movedCodeBlockPadding, 0, MovedBlocksLinesFeature.movedCodeBlockPadding, MovedBlocksLinesFeature.movedCodeBlockPadding]
          }
        });
        modifiedDecorations.push({
          range: m.lineRangeMapping.modified.toInclusiveRange(),
          options: {
            description: "moved",
            blockClassName: "movedModified" + (m === activeMovedText ? " currentMove" : ""),
            blockPadding: [4, 0, 4, 4]
          }
        });
      }
      return { originalDecorations, modifiedDecorations };
    });
    this._register(applyObservableDecorations(this._editors.original, this._decorations.map((d) => d?.originalDecorations || [])));
    this._register(applyObservableDecorations(this._editors.modified, this._decorations.map((d) => d?.modifiedDecorations || [])));
  }
};
export { DiffEditorDecorations };
