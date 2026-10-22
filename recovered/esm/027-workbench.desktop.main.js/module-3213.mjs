// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/view/editors/baseCodeEditorView.ts
import { CodeEditorView, TitleMenu, createSelectionsAutorun } from "./module-3212.mjs";
import { derived } from "./module-0054.mjs";
import { handledConflictMinimapOverViewRulerColor, unhandledConflictMinimapOverViewRulerColor } from "./module-3210.mjs";
import { MenuId } from "./module-0092.mjs";
import { autorun, autorunWithStore } from "./module-0052.mjs";
import { EditorGutter2 } from "./module-3211.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { h, reset } from "./module-0075.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { localize } from "./module-0001.mjs";
import { applyObservableDecorations2 } from "./module-1138.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/view/editors/baseCodeEditorView.ts
var BaseCodeEditorView = class extends CodeEditorView {
  constructor(viewModel, instantiationService, configurationService) {
    super(instantiationService, viewModel, configurationService);
    this.decorations = derived(this, (reader) => {
      const viewModel = this.viewModel.read(reader);
      if (!viewModel) {
        return [];
      }
      const model = viewModel.model;
      const textModel = model.base;
      const activeModifiedBaseRange = viewModel.activeModifiedBaseRange.read(reader);
      const showNonConflictingChanges = viewModel.showNonConflictingChanges.read(reader);
      const showDeletionMarkers = this.showDeletionMarkers.read(reader);
      const result = [];
      for (const modifiedBaseRange of model.modifiedBaseRanges.read(reader)) {
        const range2 = modifiedBaseRange.baseRange;
        if (!range2) {
          continue;
        }
        const isHandled = model.isHandled(modifiedBaseRange).read(reader);
        if (!modifiedBaseRange.isConflicting && isHandled && !showNonConflictingChanges) {
          continue;
        }
        const blockClassNames = ["merge-editor-block"];
        let blockPadding = [0, 0, 0, 0];
        if (isHandled) {
          blockClassNames.push("handled");
        }
        if (modifiedBaseRange === activeModifiedBaseRange) {
          blockClassNames.push("focused");
          blockPadding = [0, 2, 0, 2];
        }
        blockClassNames.push("base");
        const inputToDiffAgainst = viewModel.baseShowDiffAgainst.read(reader);
        if (inputToDiffAgainst) {
          for (const diff4 of modifiedBaseRange.getInputDiffs(inputToDiffAgainst)) {
            const range3 = diff4.inputRange.toInclusiveRange();
            if (range3) {
              result.push({
                range: range3,
                options: {
                  className: `merge-editor-diff base`,
                  description: "Merge Editor",
                  isWholeLine: true
                }
              });
            }
            for (const diff22 of diff4.rangeMappings) {
              if (showDeletionMarkers || !diff22.inputRange.isEmpty()) {
                result.push({
                  range: diff22.inputRange,
                  options: {
                    className: diff22.inputRange.isEmpty() ? `merge-editor-diff-empty-word base` : `merge-editor-diff-word base`,
                    description: "Merge Editor",
                    showIfCollapsed: true
                  }
                });
              }
            }
          }
        }
        result.push({
          range: range2.toInclusiveRangeOrEmpty(),
          options: {
            showIfCollapsed: true,
            blockClassName: blockClassNames.join(" "),
            blockPadding,
            blockIsAfterEnd: range2.startLineNumber > textModel.getLineCount(),
            description: "Merge Editor",
            minimap: {
              position: 2 /* Gutter */,
              color: { id: isHandled ? handledConflictMinimapOverViewRulerColor : unhandledConflictMinimapOverViewRulerColor }
            },
            overviewRuler: modifiedBaseRange.isConflicting ? {
              position: 2 /* Center */,
              color: { id: isHandled ? handledConflictMinimapOverViewRulerColor : unhandledConflictMinimapOverViewRulerColor }
            } : void 0
          }
        });
      }
      return result;
    });
    this._register(
      createSelectionsAutorun(this, (baseRange, viewModel2) => baseRange)
    );
    this._register(
      instantiationService.createInstance(TitleMenu, MenuId.MergeBaseToolbar, this.htmlElements.title)
    );
    this._register(
      autorunWithStore((reader, store) => {
        if (this.checkboxesVisible.read(reader)) {
          store.add(new EditorGutter2(this.editor, this.htmlElements.gutterDiv, {
            getIntersectingGutterItems: (range2, reader2) => [],
            createView: (item, target) => {
              throw new BugIndicatingError();
            }
          }));
        }
      })
    );
    this._register(
      autorun((reader) => {
        const vm = this.viewModel.read(reader);
        if (!vm) {
          return;
        }
        this.editor.setModel(vm.model.base);
        reset(this.htmlElements.title, ...renderLabelWithIcons(localize(17323, null)));
        const baseShowDiffAgainst = vm.baseShowDiffAgainst.read(reader);
        let node = void 0;
        if (baseShowDiffAgainst) {
          const label3 = localize(17324, null, baseShowDiffAgainst === 1 ? vm.model.input1.title : vm.model.input2.title);
          const tooltip = localize(17325, null);
          node = h("span", { title: tooltip }, [label3]).root;
        }
        reset(this.htmlElements.description, ...node ? [node] : []);
      })
    );
    this._register(applyObservableDecorations2(this.editor, this.decorations));
  }
};

BaseCodeEditorView = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IConfigurationService)
], BaseCodeEditorView);
export { BaseCodeEditorView };
