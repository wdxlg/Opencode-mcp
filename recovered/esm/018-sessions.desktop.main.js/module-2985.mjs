// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/view/editors/resultCodeEditorView.ts
import { CodeEditorView, TitleMenu, createSelectionsAutorun } from "./module-2976.mjs";
import { derived } from "./module-0054.mjs";
import { applyObservableDecorations2, join3 } from "./module-1139.mjs";
import { CompareResult } from "./module-0007.mjs";
import { MergeEditorLineRange } from "./module-1131.mjs";
import { handledConflictMinimapOverViewRulerColor, unhandledConflictMinimapOverViewRulerColor } from "./module-2974.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ctxIsMergeResultEditor } from "./module-1142.mjs";
import { toDisposable } from "./module-0012.mjs";
import { autorun, autorunWithStore } from "./module-0052.mjs";
import { EditorGutter2 } from "./module-2975.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { reset } from "./module-0075.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { localize } from "./module-0001.mjs";
import { ActionBar } from "./module-0477.mjs";
import { MenuId } from "./module-0092.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/view/editors/resultCodeEditorView.ts
var ResultCodeEditorView = class extends CodeEditorView {
  constructor(viewModel, instantiationService, _labelService, configurationService) {
    super(instantiationService, viewModel, configurationService);
    this._labelService = _labelService;
    this.decorations = derived(this, (reader) => {
      const viewModel = this.viewModel.read(reader);
      if (!viewModel) {
        return [];
      }
      const model = viewModel.model;
      const textModel = model.resultTextModel;
      const result = new Array();
      const baseRangeWithStoreAndTouchingDiffs = join3(
        model.modifiedBaseRanges.read(reader),
        model.baseResultDiffs.read(reader),
        (baseRange, diff4) => baseRange.baseRange.intersectsOrTouches(diff4.inputRange) ? CompareResult.neitherLessOrGreaterThan : MergeEditorLineRange.compareByStart(
          baseRange.baseRange,
          diff4.inputRange
        )
      );
      const activeModifiedBaseRange = viewModel.activeModifiedBaseRange.read(reader);
      const showNonConflictingChanges = viewModel.showNonConflictingChanges.read(reader);
      for (const m of baseRangeWithStoreAndTouchingDiffs) {
        const modifiedBaseRange = m.left;
        if (modifiedBaseRange) {
          const blockClassNames = ["merge-editor-block"];
          let blockPadding = [0, 0, 0, 0];
          const isHandled = model.isHandled(modifiedBaseRange).read(reader);
          if (isHandled) {
            blockClassNames.push("handled");
          }
          if (modifiedBaseRange === activeModifiedBaseRange) {
            blockClassNames.push("focused");
            blockPadding = [0, 2, 0, 2];
          }
          if (modifiedBaseRange.isConflicting) {
            blockClassNames.push("conflicting");
          }
          blockClassNames.push("result");
          if (!modifiedBaseRange.isConflicting && !showNonConflictingChanges && isHandled) {
            continue;
          }
          const range2 = model.getLineRangeInResult(modifiedBaseRange.baseRange, reader);
          result.push({
            range: range2.toInclusiveRangeOrEmpty(),
            options: {
              showIfCollapsed: true,
              blockClassName: blockClassNames.join(" "),
              blockPadding,
              blockIsAfterEnd: range2.startLineNumber > textModel.getLineCount(),
              description: "Result Diff",
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
        if (!modifiedBaseRange || modifiedBaseRange.isConflicting) {
          for (const diff4 of m.rights) {
            const range2 = diff4.outputRange.toInclusiveRange();
            if (range2) {
              result.push({
                range: range2,
                options: {
                  className: `merge-editor-diff result`,
                  description: "Merge Editor",
                  isWholeLine: true
                }
              });
            }
            if (diff4.rangeMappings) {
              for (const d of diff4.rangeMappings) {
                result.push({
                  range: d.outputRange,
                  options: {
                    className: `merge-editor-diff-word result`,
                    description: "Merge Editor"
                  }
                });
              }
            }
          }
        }
      }
      return result;
    });
    this.editor.invokeWithinContext((accessor) => {
      const contextKeyService = accessor.get(IContextKeyService);
      const isMergeResultEditor = ctxIsMergeResultEditor.bindTo(contextKeyService);
      isMergeResultEditor.set(true);
      this._register(toDisposable(() => isMergeResultEditor.reset()));
    });
    this.htmlElements.gutterDiv.style.width = "5px";
    this.htmlElements.root.classList.add(`result`);
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
    this._register(autorun((reader) => {
      const vm = this.viewModel.read(reader);
      if (!vm) {
        return;
      }
      this.editor.setModel(vm.model.resultTextModel);
      reset(this.htmlElements.title, ...renderLabelWithIcons(localize(17340, null)));
      reset(this.htmlElements.description, ...renderLabelWithIcons(this._labelService.getUriLabel(vm.model.resultTextModel.uri, { relative: true })));
    }));
    const remainingConflictsActionBar = this._register(new ActionBar(this.htmlElements.detail));
    this._register(autorun((reader) => {
      const vm = this.viewModel.read(reader);
      if (!vm) {
        return;
      }
      const model = vm.model;
      if (!model) {
        return;
      }
      const count2 = model.unhandledConflictsCount.read(reader);
      const text2 = count2 === 1 ? localize(
        17339,
        null,
        count2
      ) : localize(
        17338,
        null,
        count2
      );
      remainingConflictsActionBar.clear();
      remainingConflictsActionBar.push({
        class: void 0,
        enabled: count2 > 0,
        id: "nextConflict",
        label: text2,
        run() {
          vm.model.telemetry.reportConflictCounterClicked();
          vm.goToNextModifiedBaseRange((m) => !model.isHandled(m).read(void 0));
        },
        tooltip: count2 > 0 ? localize(17337, null) : localize(17336, null)
      });
    }));
    this._register(applyObservableDecorations2(this.editor, this.decorations));
    this._register(
      createSelectionsAutorun(
        this,
        (baseRange, viewModel2) => viewModel2.model.translateBaseRangeToResult(baseRange)
      )
    );
    this._register(
      instantiationService.createInstance(
        TitleMenu,
        MenuId.MergeInputResultToolbar,
        this.htmlElements.toolbar
      )
    );
  }
};

ResultCodeEditorView = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILabelService),
  __decorateParam(3, IConfigurationService)
], ResultCodeEditorView);
export { ResultCodeEditorView };
