// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/view/scrollSynchronizer.ts
import { Disposable } from "./module-0012.mjs";
import { ReentrancyBarrier } from "./module-1136.mjs";
import { derived } from "./module-0054.mjs";
import { isDefined } from "./module-0010.mjs";
import { DocumentLineRangeMap } from "./module-1134.mjs";
import { BugIndicatingError } from "./module-0004.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/view/scrollSynchronizer.ts
var ScrollSynchronizer = class extends Disposable {
  constructor(viewModel, input1View, input2View, baseView, inputResultView, layout2) {
    super();
    this.viewModel = viewModel;
    this.input1View = input1View;
    this.input2View = input2View;
    this.baseView = baseView;
    this.inputResultView = inputResultView;
    this.layout = layout2;
    this.reentrancyBarrier = new ReentrancyBarrier();
    this._isSyncing = true;
    const s = derived((reader) => {
      const baseView2 = this.baseView.read(reader);
      const editors = [this.input1View, this.input2View, this.inputResultView, baseView2].filter(isDefined);
      const alignScrolling = (source, updateScrollLeft, updateScrollTop) => {
        this.reentrancyBarrier.runExclusivelyOrSkip(() => {
          if (updateScrollLeft) {
            const scrollLeft = source.editor.getScrollLeft();
            for (const editorView of editors) {
              if (editorView !== source) {
                editorView.editor.setScrollLeft(scrollLeft, 1 /* Immediate */);
              }
            }
          }
          if (updateScrollTop) {
            const scrollTop = source.editor.getScrollTop();
            for (const editorView of editors) {
              if (editorView !== source) {
                if (this._shouldLock(source, editorView)) {
                  editorView.editor.setScrollTop(scrollTop, 1 /* Immediate */);
                } else {
                  const m = this._getMapping(source, editorView);
                  if (m) {
                    this._synchronizeScrolling(source.editor, editorView.editor, m);
                  }
                }
              }
            }
          }
        });
      };
      for (const editorView of editors) {
        reader.store.add(editorView.editor.onDidScrollChange((e) => {
          if (!this._isSyncing) {
            return;
          }
          alignScrolling(editorView, e.scrollLeftChanged, e.scrollTopChanged);
        }));
      }
      return {
        update: () => {
          alignScrolling(this.inputResultView, true, true);
        }
      };
    }).recomputeInitiallyAndOnChange(this._store);
    this.updateScrolling = () => {
      s.get().update();
    };
  }
  get model() {
    return this.viewModel.get()?.model;
  }
  get lockResultWithInputs() {
    return this.layout.get().kind === "columns";
  }
  get lockBaseWithInputs() {
    return this.layout.get().kind === "mixed" && !this.layout.get().showBaseAtTop;
  }
  stopSync() {
    this._isSyncing = false;
  }
  startSync() {
    this._isSyncing = true;
  }
  _shouldLock(editor1, editor2) {
    const isInput = (editor) => editor === this.input1View || editor === this.input2View;
    if (isInput(editor1) && editor2 === this.inputResultView || isInput(editor2) && editor1 === this.inputResultView) {
      return this.lockResultWithInputs;
    }
    if (isInput(editor1) && editor2 === this.baseView.get() || isInput(editor2) && editor1 === this.baseView.get()) {
      return this.lockBaseWithInputs;
    }
    if (isInput(editor1) && isInput(editor2)) {
      return true;
    }
    return false;
  }
  _getMapping(editor1, editor2) {
    if (editor1 === this.input1View) {
      if (editor2 === this.input2View) {
        return void 0;
      } else if (editor2 === this.inputResultView) {
        return this.model?.input1ResultMapping.get();
      } else if (editor2 === this.baseView.get()) {
        const b = this.model?.baseInput1Diffs.get();
        if (!b) {
          return void 0;
        }
        return new DocumentLineRangeMap(b, -1).reverse();
      }
    } else if (editor1 === this.input2View) {
      if (editor2 === this.input1View) {
        return void 0;
      } else if (editor2 === this.inputResultView) {
        return this.model?.input2ResultMapping.get();
      } else if (editor2 === this.baseView.get()) {
        const b = this.model?.baseInput2Diffs.get();
        if (!b) {
          return void 0;
        }
        return new DocumentLineRangeMap(b, -1).reverse();
      }
    } else if (editor1 === this.inputResultView) {
      if (editor2 === this.input1View) {
        return this.model?.resultInput1Mapping.get();
      } else if (editor2 === this.input2View) {
        return this.model?.resultInput2Mapping.get();
      } else if (editor2 === this.baseView.get()) {
        const b = this.model?.resultBaseMapping.get();
        if (!b) {
          return void 0;
        }
        return b;
      }
    } else if (editor1 === this.baseView.get()) {
      if (editor2 === this.input1View) {
        const b = this.model?.baseInput1Diffs.get();
        if (!b) {
          return void 0;
        }
        return new DocumentLineRangeMap(b, -1);
      } else if (editor2 === this.input2View) {
        const b = this.model?.baseInput2Diffs.get();
        if (!b) {
          return void 0;
        }
        return new DocumentLineRangeMap(b, -1);
      } else if (editor2 === this.inputResultView) {
        const b = this.model?.baseResultMapping.get();
        if (!b) {
          return void 0;
        }
        return b;
      }
    }
    throw new BugIndicatingError();
  }
  _synchronizeScrolling(scrollingEditor, targetEditor, mapping2) {
    if (!mapping2) {
      return;
    }
    const visibleRanges = scrollingEditor.getVisibleRanges();
    if (visibleRanges.length === 0) {
      return;
    }
    const topLineNumber = visibleRanges[0].startLineNumber - 1;
    const result = mapping2.project(topLineNumber);
    const sourceRange = result.inputRange;
    const targetRange = result.outputRange;
    const resultStartTopPx = targetEditor.getTopForLineNumber(targetRange.startLineNumber);
    const resultEndPx = targetEditor.getTopForLineNumber(targetRange.endLineNumberExclusive);
    const sourceStartTopPx = scrollingEditor.getTopForLineNumber(sourceRange.startLineNumber);
    const sourceEndPx = scrollingEditor.getTopForLineNumber(sourceRange.endLineNumberExclusive);
    const factor2 = Math.min((scrollingEditor.getScrollTop() - sourceStartTopPx) / (sourceEndPx - sourceStartTopPx), 1);
    const resultScrollPosition = resultStartTopPx + (resultEndPx - resultStartTopPx) * factor2;
    targetEditor.setScrollTop(resultScrollPosition, 1 /* Immediate */);
  }
};
export { ScrollSynchronizer };
