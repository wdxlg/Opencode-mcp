// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/diff/inlineDiff/notebookCellDiffDecorator.ts
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { ThrottledDelayer } from "./module-0036.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { derived } from "./module-0054.mjs";
import { autorunWithStore } from "./module-0052.mjs";
import { ModelDecorationOptions } from "./module-0423.mjs";
import { diffAddDecoration, diffDeleteDecoration, diffWholeLineAddDecoration } from "./module-0481.mjs";
import { themeColorFromId } from "./module-0086.mjs";
import { minimapGutterAddedBackground, minimapGutterDeletedBackground, minimapGutterModifiedBackground, overviewRulerAddedForeground, overviewRulerDeletedForeground, overviewRulerModifiedForeground } from "./module-1080.mjs";
import { LineSource, RenderOptions, renderLines } from "./module-0486.mjs";
import { InlineDecoration } from "./module-0243.mjs";
import { Range2 } from "./module-0106.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorWorkerService } from "./module-0158.mjs";
import { INotebookOriginalCellModelFactory } from "./module-1957.mjs";


// src/vs/workbench/contrib/notebook/browser/diff/inlineDiff/notebookCellDiffDecorator.ts
var NotebookCellDiffDecorator = class extends DisposableStore {
  constructor(notebookEditor, modifiedCell, originalCell, editor, _editorWorkerService, originalCellModelFactory) {
    super();
    this.modifiedCell = modifiedCell;
    this.originalCell = originalCell;
    this.editor = editor;
    this._editorWorkerService = _editorWorkerService;
    this.originalCellModelFactory = originalCellModelFactory;
    this._viewZones = [];
    this.throttledDecorator = this.add(new ThrottledDelayer(50));
    this.perEditorDisposables = this.add(new DisposableStore());
    const onDidChangeVisibleRanges = observableFromEvent(notebookEditor.onDidChangeVisibleRanges, () => notebookEditor.visibleRanges);
    const editorObs = derived((r2) => {
      const visibleRanges = onDidChangeVisibleRanges.read(r2);
      const visibleCellHandles = visibleRanges.map((range2) => notebookEditor.getCellsInRange(range2)).flat().map((c) => c.handle);
      if (!visibleCellHandles.includes(modifiedCell.handle)) {
        return;
      }
      const editor2 = notebookEditor.codeEditors.find((item) => item[0].handle === modifiedCell.handle)?.[1];
      if (editor2?.getModel() !== this.modifiedCell.textModel) {
        return;
      }
      return editor2;
    });
    this.add(autorunWithStore((r2, store) => {
      const editor2 = editorObs.read(r2);
      this.perEditorDisposables.clear();
      if (editor2) {
        store.add(editor2.onDidChangeModel(() => {
          this.perEditorDisposables.clear();
        }));
        store.add(editor2.onDidChangeModelContent(() => {
          this.update(editor2);
        }));
        store.add(editor2.onDidChangeConfiguration((e4) => {
          if (e4.hasChanged(59 /* fontInfo */) || e4.hasChanged(75 /* lineHeight */)) {
            this.update(editor2);
          }
        }));
        this.update(editor2);
      }
    }));
  }
  update(editor) {
    this.throttledDecorator.trigger(() => this._updateImpl(editor));
  }
  async _updateImpl(editor) {
    if (this.isDisposed) {
      return;
    }
    if (editor.getOption(70 /* inDiffEditor */)) {
      this.perEditorDisposables.clear();
      return;
    }
    const model = editor.getModel();
    if (!model || model !== this.modifiedCell.textModel) {
      this.perEditorDisposables.clear();
      return;
    }
    const originalModel = this.getOrCreateOriginalModel(editor);
    if (!originalModel) {
      this.perEditorDisposables.clear();
      return;
    }
    const version2 = model.getVersionId();
    const diff4 = await this._editorWorkerService.computeDiff(
      originalModel.uri,
      model.uri,
      { computeMoves: true, ignoreTrimWhitespace: false, maxComputationTimeMs: Number.MAX_SAFE_INTEGER },
      "advanced"
    );
    if (this.isDisposed) {
      return;
    }
    if (diff4 && !diff4.identical && this.modifiedCell.textModel && originalModel && model === editor.getModel() && editor.getModel()?.getVersionId() === version2) {
      this._updateWithDiff(editor, originalModel, diff4, this.modifiedCell.textModel);
    } else {
      this.perEditorDisposables.clear();
    }
  }
  getOrCreateOriginalModel(editor) {
    if (!this._originalModel) {
      const model = editor.getModel();
      if (!model) {
        return;
      }
      this._originalModel = this.add(this.originalCellModelFactory.getOrCreate(model.uri, this.originalCell.getValue(), model.getLanguageId(), this.modifiedCell.cellKind)).object;
    }
    return this._originalModel;
  }
  _updateWithDiff(editor, originalModel, diff4, currentModel) {
    if (areDiffsEqual(diff4, this.diffForPreviouslyAppliedDecorators)) {
      return;
    }
    this.perEditorDisposables.clear();
    const decorations = editor.createDecorationsCollection();
    this.perEditorDisposables.add(toDisposable(() => {
      editor.changeViewZones((viewZoneChangeAccessor) => {
        for (const id2 of this._viewZones) {
          viewZoneChangeAccessor.removeZone(id2);
        }
      });
      this._viewZones = [];
      decorations.clear();
      this.diffForPreviouslyAppliedDecorators = void 0;
    }));
    this.diffForPreviouslyAppliedDecorators = diff4;
    const chatDiffAddDecoration = ModelDecorationOptions.createDynamic({
      ...diffAddDecoration,
      stickiness: 1 /* NeverGrowsWhenTypingAtEdges */
    });
    const chatDiffWholeLineAddDecoration = ModelDecorationOptions.createDynamic({
      ...diffWholeLineAddDecoration,
      stickiness: 1 /* NeverGrowsWhenTypingAtEdges */
    });
    const createOverviewDecoration = (overviewRulerColor, minimapColor) => {
      return ModelDecorationOptions.createDynamic({
        description: "chat-editing-decoration",
        overviewRuler: { color: themeColorFromId(overviewRulerColor), position: 1 /* Left */ },
        minimap: { color: themeColorFromId(minimapColor), position: 2 /* Gutter */ }
      });
    };
    const modifiedDecoration = createOverviewDecoration(overviewRulerModifiedForeground, minimapGutterModifiedBackground);
    const addedDecoration = createOverviewDecoration(overviewRulerAddedForeground, minimapGutterAddedBackground);
    const deletedDecoration = createOverviewDecoration(overviewRulerDeletedForeground, minimapGutterDeletedBackground);
    editor.changeViewZones((viewZoneChangeAccessor) => {
      for (const id2 of this._viewZones) {
        viewZoneChangeAccessor.removeZone(id2);
      }
      this._viewZones = [];
      const modifiedVisualDecorations = [];
      const mightContainNonBasicASCII = originalModel.mightContainNonBasicASCII();
      const mightContainRTL = originalModel.mightContainRTL();
      const renderOptions = RenderOptions.fromEditor(this.editor);
      const editorLineCount = currentModel.getLineCount();
      for (const diffEntry of diff4.changes) {
        const originalRange = diffEntry.original;
        originalModel.tokenization.forceTokenization(Math.max(1, originalRange.endLineNumberExclusive - 1));
        const source = new LineSource(
          originalRange.mapToLineArray((l) => originalModel.tokenization.getLineTokens(l)),
          [],
          mightContainNonBasicASCII,
          mightContainRTL
        );
        const decorations2 = [];
        for (const i2 of diffEntry.innerChanges || []) {
          decorations2.push(new InlineDecoration(
            i2.originalRange.delta(-(diffEntry.original.startLineNumber - 1)),
            diffDeleteDecoration.className,
            0 /* Regular */
          ));
          if (!(i2.originalRange.isEmpty() && i2.originalRange.startLineNumber === 1 && i2.modifiedRange.endLineNumber === editorLineCount) && !i2.modifiedRange.isEmpty()) {
            modifiedVisualDecorations.push({
              range: i2.modifiedRange,
              options: chatDiffAddDecoration
            });
          }
        }
        const isCreatedContent = decorations2.length === 1 && decorations2[0].range.isEmpty() && diffEntry.original.startLineNumber === 1;
        if (!diffEntry.modified.isEmpty && !(isCreatedContent && diffEntry.modified.endLineNumberExclusive - 1 === editorLineCount)) {
          modifiedVisualDecorations.push({
            range: diffEntry.modified.toInclusiveRange(),
            options: chatDiffWholeLineAddDecoration
          });
        }
        if (diffEntry.original.isEmpty) {
          modifiedVisualDecorations.push({
            range: diffEntry.modified.toInclusiveRange(),
            options: addedDecoration
          });
        } else if (diffEntry.modified.isEmpty) {
          modifiedVisualDecorations.push({
            range: new Range2(diffEntry.modified.startLineNumber - 1, 1, diffEntry.modified.startLineNumber, 1),
            options: deletedDecoration
          });
        } else {
          modifiedVisualDecorations.push({
            range: diffEntry.modified.toInclusiveRange(),
            options: modifiedDecoration
          });
        }
        const domNode = document.createElement("div");
        domNode.className = "chat-editing-original-zone view-lines line-delete monaco-mouse-cursor-text";
        const result = renderLines(source, renderOptions, decorations2, domNode);
        if (!isCreatedContent) {
          const viewZoneData = {
            afterLineNumber: diffEntry.modified.startLineNumber - 1,
            heightInLines: result.heightInLines,
            domNode,
            ordinal: 5e4 + 2
            // more than https://github.com/microsoft/vscode/blob/bf52a5cfb2c75a7327c9adeaefbddc06d529dcad/src/vs/workbench/contrib/inlineChat/browser/inlineChatZoneWidget.ts#L42
          };
          this._viewZones.push(viewZoneChangeAccessor.addZone(viewZoneData));
        }
      }
      decorations.set(modifiedVisualDecorations);
    });
  }
};

NotebookCellDiffDecorator = __decorateClass([
  __decorateParam(4, IEditorWorkerService),
  __decorateParam(5, INotebookOriginalCellModelFactory)
], NotebookCellDiffDecorator);

function areDiffsEqual(a, b) {
  if (a && b) {
    if (a.changes.length !== b.changes.length) {
      return false;
    }
    if (a.moves.length !== b.moves.length) {
      return false;
    }
    if (!areLineRangeMappinsEqual(a.changes, b.changes)) {
      return false;
    }
    if (!a.moves.some((move2, i2) => {
      const bMove = b.moves[i2];
      if (!areLineRangeMappinsEqual(move2.changes, bMove.changes)) {
        return true;
      }
      if (move2.lineRangeMapping.changedLineCount !== bMove.lineRangeMapping.changedLineCount) {
        return true;
      }
      if (!move2.lineRangeMapping.modified.equals(bMove.lineRangeMapping.modified)) {
        return true;
      }
      if (!move2.lineRangeMapping.original.equals(bMove.lineRangeMapping.original)) {
        return true;
      }
      return false;
    })) {
      return false;
    }
    return true;
  } else if (!a && !b) {
    return true;
  } else {
    return false;
  }
}

function areLineRangeMappinsEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  if (a.some((c, i2) => {
    const bChange = b[i2];
    if (c.changedLineCount !== bChange.changedLineCount) {
      return true;
    }
    if ((c.innerChanges || []).length !== (bChange.innerChanges || []).length) {
      return true;
    }
    if ((c.innerChanges || []).some((innerC, innerIdx) => {
      const bInnerC = bChange.innerChanges[innerIdx];
      if (!innerC.modifiedRange.equalsRange(bInnerC.modifiedRange)) {
        return true;
      }
      if (!innerC.originalRange.equalsRange(bInnerC.originalRange)) {
        return true;
      }
      return false;
    })) {
      return true;
    }
    return false;
  })) {
    return false;
  }
  return true;
}
export { areDiffsEqual, areLineRangeMappinsEqual, NotebookCellDiffDecorator };
