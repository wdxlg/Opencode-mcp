// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/view/viewModel.ts
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { derivedObservableWithWritableCache } from "./module-0059.mjs";
import { derived } from "./module-0054.mjs";
import { Range2 } from "./module-0106.mjs";
import { MergeEditorLineRange } from "./module-1130.mjs";
import { transaction } from "./module-0045.mjs";
import { findLast } from "./module-0006.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { INotificationService } from "./module-0336.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/view/viewModel.ts
var MergeEditorViewModel = class extends Disposable {
  constructor(model, inputCodeEditorView1, inputCodeEditorView2, resultCodeEditorView, baseCodeEditorView, showNonConflictingChanges, configurationService, notificationService) {
    super();
    this.model = model;
    this.inputCodeEditorView1 = inputCodeEditorView1;
    this.inputCodeEditorView2 = inputCodeEditorView2;
    this.resultCodeEditorView = resultCodeEditorView;
    this.baseCodeEditorView = baseCodeEditorView;
    this.showNonConflictingChanges = showNonConflictingChanges;
    this.configurationService = configurationService;
    this.notificationService = notificationService;
    this.manuallySetActiveModifiedBaseRange = observableValue(this, { range: void 0, counter: 0 });
    this.attachedHistory = this._register(new AttachedHistory(this.model.resultTextModel));
    this.shouldUseAppendInsteadOfAccept = observableConfigValue(
      "mergeEditor.shouldUseAppendInsteadOfAccept",
      false,
      this.configurationService
    );
    this.counter = 0;
    this.lastFocusedEditor = derivedObservableWithWritableCache(this, (reader, lastValue) => {
      const editors = [
        this.inputCodeEditorView1,
        this.inputCodeEditorView2,
        this.resultCodeEditorView,
        this.baseCodeEditorView.read(reader)
      ];
      const view = editors.find((e) => e && e.isFocused.read(reader));
      return view ? { view, counter: this.counter++ } : lastValue || { view: void 0, counter: this.counter++ };
    });
    this.baseShowDiffAgainst = derived(this, (reader) => {
      const lastFocusedEditor = this.lastFocusedEditor.read(reader);
      if (lastFocusedEditor.view === this.inputCodeEditorView1) {
        return 1;
      } else if (lastFocusedEditor.view === this.inputCodeEditorView2) {
        return 2;
      }
      return void 0;
    });
    this.focusedEditorType = derived(this, (reader) => {
      const lastFocusedEditor = this.lastFocusedEditor.read(reader);
      if (!lastFocusedEditor.view) {
        return void 0;
      }
      if (lastFocusedEditor.view === this.inputCodeEditorView1) {
        return "input1";
      } else if (lastFocusedEditor.view === this.inputCodeEditorView2) {
        return "input2";
      } else if (lastFocusedEditor.view === this.resultCodeEditorView) {
        return "result";
      } else if (lastFocusedEditor.view === this.baseCodeEditorView.read(reader)) {
        return "base";
      }
      return void 0;
    });
    this.selectionInBase = derived(this, (reader) => {
      const sourceEditor = this.lastFocusedEditor.read(reader).view;
      if (!sourceEditor) {
        return void 0;
      }
      const selections = sourceEditor.selection.read(reader) || [];
      const rangesInBase = selections.map((selection) => {
        if (sourceEditor === this.inputCodeEditorView1) {
          return this.model.translateInputRangeToBase(1, selection);
        } else if (sourceEditor === this.inputCodeEditorView2) {
          return this.model.translateInputRangeToBase(2, selection);
        } else if (sourceEditor === this.resultCodeEditorView) {
          return this.model.translateResultRangeToBase(selection);
        } else if (sourceEditor === this.baseCodeEditorView.read(reader)) {
          return selection;
        } else {
          return selection;
        }
      });
      return {
        rangesInBase,
        sourceEditor
      };
    });
    this.activeModifiedBaseRange = derived(
      this,
      (reader) => {
        const focusedEditor = this.lastFocusedEditor.read(reader);
        const manualRange = this.manuallySetActiveModifiedBaseRange.read(reader);
        if (manualRange.counter > focusedEditor.counter) {
          return manualRange.range;
        }
        if (!focusedEditor.view) {
          return;
        }
        const cursorLineNumber = focusedEditor.view.cursorLineNumber.read(reader);
        if (!cursorLineNumber) {
          return void 0;
        }
        const modifiedBaseRanges = this.model.modifiedBaseRanges.read(reader);
        return modifiedBaseRanges.find((r2) => {
          const range2 = this.getRangeOfModifiedBaseRange(focusedEditor.view, r2, reader);
          return range2.isEmpty ? range2.startLineNumber === cursorLineNumber : range2.contains(cursorLineNumber);
        });
      }
    );
    this._register(resultCodeEditorView.editor.onDidChangeModelContent((e) => {
      if (this.model.isApplyingEditInResult || e.isRedoing || e.isUndoing) {
        return;
      }
      const baseRangeStates = [];
      for (const change of e.changes) {
        const rangeInBase = this.model.translateResultRangeToBase(Range2.lift(change.range));
        const baseRanges = this.model.findModifiedBaseRangesInRange(MergeEditorLineRange.fromLength(rangeInBase.startLineNumber, rangeInBase.endLineNumber - rangeInBase.startLineNumber));
        if (baseRanges.length === 1) {
          const isHandled = this.model.isHandled(baseRanges[0]).get();
          if (!isHandled) {
            baseRangeStates.push(baseRanges[0]);
          }
        }
      }
      if (baseRangeStates.length === 0) {
        return;
      }
      const element = {
        model: this.model,
        redo() {
          transaction((tx) => {
            for (const r2 of baseRangeStates) {
              this.model.setHandled(r2, true, tx);
            }
          });
        },
        undo() {
          transaction((tx) => {
            for (const r2 of baseRangeStates) {
              this.model.setHandled(r2, false, tx);
            }
          });
        }
      };
      this.attachedHistory.pushAttachedHistoryElement(element);
      element.redo();
    }));
  }
  getRangeOfModifiedBaseRange(editor, modifiedBaseRange, reader) {
    if (editor === this.resultCodeEditorView) {
      return this.model.getLineRangeInResult(modifiedBaseRange.baseRange, reader);
    } else if (editor === this.baseCodeEditorView.get()) {
      return modifiedBaseRange.baseRange;
    } else {
      const input = editor === this.inputCodeEditorView1 ? 1 : 2;
      return modifiedBaseRange.getInputRange(input);
    }
  }
  setActiveModifiedBaseRange(range2, tx) {
    this.manuallySetActiveModifiedBaseRange.set({ range: range2, counter: this.counter++ }, tx);
  }
  setState(baseRange, state, tx, inputNumber) {
    this.manuallySetActiveModifiedBaseRange.set({ range: baseRange, counter: this.counter++ }, tx);
    this.model.setState(baseRange, state, inputNumber, tx);
    this.lastFocusedEditor.clearCache(tx);
  }
  goToConflict(getModifiedBaseRange) {
    let editor = this.lastFocusedEditor.get().view;
    if (!editor) {
      editor = this.resultCodeEditorView;
    }
    const curLineNumber = editor.editor.getPosition()?.lineNumber;
    if (curLineNumber === void 0) {
      return;
    }
    const modifiedBaseRange = getModifiedBaseRange(editor, curLineNumber);
    if (modifiedBaseRange) {
      const range2 = this.getRangeOfModifiedBaseRange(editor, modifiedBaseRange, void 0);
      editor.editor.focus();
      let startLineNumber = range2.startLineNumber;
      let endLineNumberExclusive = range2.endLineNumberExclusive;
      if (range2.startLineNumber > editor.editor.getModel().getLineCount()) {
        transaction((tx) => {
          this.setActiveModifiedBaseRange(modifiedBaseRange, tx);
        });
        startLineNumber = endLineNumberExclusive = editor.editor.getModel().getLineCount();
      }
      editor.editor.setPosition({
        lineNumber: startLineNumber,
        column: editor.editor.getModel().getLineFirstNonWhitespaceColumn(startLineNumber)
      });
      editor.editor.revealLinesNearTop(startLineNumber, endLineNumberExclusive, 0 /* Smooth */);
    }
  }
  goToNextModifiedBaseRange(predicate) {
    this.goToConflict(
      (e, l) => this.model.modifiedBaseRanges.get().find(
        (r2) => predicate(r2) && this.getRangeOfModifiedBaseRange(e, r2, void 0).startLineNumber > l
      ) || this.model.modifiedBaseRanges.get().find((r2) => predicate(r2))
    );
  }
  goToPreviousModifiedBaseRange(predicate) {
    this.goToConflict(
      (e, l) => findLast(
        this.model.modifiedBaseRanges.get(),
        (r2) => predicate(r2) && this.getRangeOfModifiedBaseRange(e, r2, void 0).endLineNumberExclusive < l
      ) || findLast(
        this.model.modifiedBaseRanges.get(),
        (r2) => predicate(r2)
      )
    );
  }
  toggleActiveConflict(inputNumber) {
    const activeModifiedBaseRange = this.activeModifiedBaseRange.get();
    if (!activeModifiedBaseRange) {
      this.notificationService.error(localize(17342, null));
      return;
    }
    transaction((tx) => {
      this.setState(
        activeModifiedBaseRange,
        this.model.getState(activeModifiedBaseRange).get().toggle(inputNumber),
        tx,
        inputNumber
      );
    });
  }
  acceptAll(inputNumber) {
    transaction((tx) => {
      for (const range2 of this.model.modifiedBaseRanges.get()) {
        this.setState(
          range2,
          this.model.getState(range2).get().withInputValue(inputNumber, true),
          tx,
          inputNumber
        );
      }
    });
  }
};

MergeEditorViewModel = __decorateClass([
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, INotificationService)
], MergeEditorViewModel);

var AttachedHistory = class extends Disposable {
  constructor(model) {
    super();
    this.model = model;
    this.attachedHistory = [];
    this.previousAltId = this.model.getAlternativeVersionId();
    this._register(model.onDidChangeContent((e) => {
      const currentAltId = model.getAlternativeVersionId();
      if (e.isRedoing) {
        for (const item of this.attachedHistory) {
          if (this.previousAltId < item.altId && item.altId <= currentAltId) {
            item.element.redo();
          }
        }
      } else if (e.isUndoing) {
        for (let i2 = this.attachedHistory.length - 1; i2 >= 0; i2--) {
          const item = this.attachedHistory[i2];
          if (currentAltId < item.altId && item.altId <= this.previousAltId) {
            item.element.undo();
          }
        }
      } else {
        while (this.attachedHistory.length > 0 && this.attachedHistory[this.attachedHistory.length - 1].altId > this.previousAltId) {
          this.attachedHistory.pop();
        }
      }
      this.previousAltId = currentAltId;
    }));
  }
  /**
   * Pushes an history item that is tied to the last text edit (or an extension of it).
   * When the last text edit is undone/redone, so is is this history item.
   */
  pushAttachedHistoryElement(element) {
    this.attachedHistory.push({ altId: this.model.getAlternativeVersionId(), element });
  }
};
export { MergeEditorViewModel, AttachedHistory };
