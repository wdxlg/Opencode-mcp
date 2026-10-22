// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/quickAccess/browser/editorNavigationQuickAccess.ts
import { DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { getCodeEditor, isDiffEditor } from "./module-0223.mjs";
import { createSingleCallFunction } from "./module-0005.mjs";
import { status } from "./module-0076.mjs";
import { localize } from "./module-0001.mjs";
import { themeColorFromId2 } from "./module-0287.mjs";
import { overviewRulerRangeHighlight } from "./module-0288.mjs";


// src/vs/editor/contrib/quickAccess/browser/editorNavigationQuickAccess.ts
var AbstractEditorNavigationQuickAccessProvider = class {
  constructor(options3) {
    this.options = options3;
    //#endregion
    //#region Decorations Utils
    this.rangeHighlightDecorationId = void 0;
  }
  //#region Provider methods
  provide(picker, token, runOptions2) {
    const disposables = new DisposableStore();
    picker.canAcceptInBackground = !!this.options?.canAcceptInBackground;
    picker.matchOnLabel = picker.matchOnDescription = picker.matchOnDetail = picker.sortByLabel = false;
    const pickerDisposable = disposables.add(new MutableDisposable());
    pickerDisposable.value = this.doProvide(picker, token, runOptions2);
    disposables.add(this.onDidActiveTextEditorControlChange(() => {
      pickerDisposable.value = void 0;
      pickerDisposable.value = this.doProvide(picker, token);
    }));
    return disposables;
  }
  doProvide(picker, token, runOptions2) {
    const disposables = new DisposableStore();
    const editor = this.activeTextEditorControl;
    if (editor && this.canProvideWithTextEditor(editor)) {
      const context2 = { editor };
      const codeEditor = getCodeEditor(editor);
      if (codeEditor) {
        let lastKnownEditorViewState = editor.saveViewState() ?? void 0;
        disposables.add(codeEditor.onDidChangeCursorPosition(() => {
          lastKnownEditorViewState = editor.saveViewState() ?? void 0;
        }));
        context2.restoreViewState = () => {
          if (lastKnownEditorViewState && editor === this.activeTextEditorControl) {
            editor.restoreViewState(lastKnownEditorViewState);
          }
        };
        disposables.add(createSingleCallFunction(token.onCancellationRequested)(() => context2.restoreViewState?.()));
      }
      disposables.add(toDisposable(() => this.clearDecorations(editor)));
      disposables.add(this.provideWithTextEditor(context2, picker, token, runOptions2));
    } else {
      disposables.add(this.provideWithoutTextEditor(picker, token));
    }
    return disposables;
  }
  /**
   * Subclasses to implement if they can operate on the text editor.
   */
  canProvideWithTextEditor(editor) {
    return true;
  }
  gotoLocation({ editor }, options3) {
    editor.setSelection(options3.range, "code.jump" /* JUMP */);
    editor.revealRangeInCenter(options3.range, 0 /* Smooth */);
    if (!options3.preserveFocus) {
      editor.focus();
    }
    const model = this.getModel(editor);
    if (model) {
      const lineContent = model.getLineContent(options3.range.startLineNumber);
      status(localize(1520, null, options3.range.startLineNumber, options3.range.startColumn, lineContent));
    }
  }
  getModel(editor) {
    return isDiffEditor(editor) ? editor.getModel()?.modified : editor.getModel();
  }
  addDecorations(editor, range2) {
    editor.changeDecorations((changeAccessor) => {
      const deleteDecorations = [];
      if (this.rangeHighlightDecorationId) {
        deleteDecorations.push(this.rangeHighlightDecorationId.overviewRulerDecorationId);
        deleteDecorations.push(this.rangeHighlightDecorationId.rangeHighlightId);
        this.rangeHighlightDecorationId = void 0;
      }
      const newDecorations = [
        // highlight the entire line on the range
        {
          range: range2,
          options: {
            description: "quick-access-range-highlight",
            className: "rangeHighlight",
            isWholeLine: true
          }
        },
        // also add overview ruler highlight
        {
          range: range2,
          options: {
            description: "quick-access-range-highlight-overview",
            overviewRuler: {
              color: themeColorFromId2(overviewRulerRangeHighlight),
              position: 7 /* Full */
            }
          }
        }
      ];
      const [rangeHighlightId, overviewRulerDecorationId] = changeAccessor.deltaDecorations(deleteDecorations, newDecorations);
      this.rangeHighlightDecorationId = { rangeHighlightId, overviewRulerDecorationId };
    });
  }
  clearDecorations(editor) {
    const rangeHighlightDecorationId = this.rangeHighlightDecorationId;
    if (rangeHighlightDecorationId) {
      editor.changeDecorations((changeAccessor) => {
        changeAccessor.deltaDecorations([
          rangeHighlightDecorationId.overviewRulerDecorationId,
          rangeHighlightDecorationId.rangeHighlightId
        ], []);
      });
      this.rangeHighlightDecorationId = void 0;
    }
  }
  //#endregion
};
export { AbstractEditorNavigationQuickAccessProvider };
