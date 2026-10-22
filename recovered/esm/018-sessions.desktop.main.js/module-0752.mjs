// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/suggest/browser/suggestOvertypingCapturer.ts
import { DisposableStore } from "./module-0012.mjs";


// src/vs/editor/contrib/suggest/browser/suggestOvertypingCapturer.ts
var OvertypingCapturer = class _OvertypingCapturer {
  constructor(editor, suggestModel) {
    this._disposables = new DisposableStore();
    this._lastOvertyped = [];
    this._locked = false;
    this._disposables.add(editor.onWillType(() => {
      if (this._locked || !editor.hasModel()) {
        return;
      }
      const selections = editor.getSelections();
      const selectionsLength = selections.length;
      let willOvertype = false;
      for (let i2 = 0; i2 < selectionsLength; i2++) {
        if (!selections[i2].isEmpty()) {
          willOvertype = true;
          break;
        }
      }
      if (!willOvertype) {
        if (this._lastOvertyped.length !== 0) {
          this._lastOvertyped.length = 0;
        }
        return;
      }
      this._lastOvertyped = [];
      const model = editor.getModel();
      for (let i2 = 0; i2 < selectionsLength; i2++) {
        const selection = selections[i2];
        if (model.getValueLengthInRange(selection) > _OvertypingCapturer._maxSelectionLength) {
          return;
        }
        this._lastOvertyped[i2] = { value: model.getValueInRange(selection), multiline: selection.startLineNumber !== selection.endLineNumber };
      }
    }));
    this._disposables.add(suggestModel.onDidTrigger((e4) => {
      this._locked = true;
    }));
    this._disposables.add(suggestModel.onDidCancel((e4) => {
      this._locked = false;
    }));
  }
  static {
    this._maxSelectionLength = 51200;
  }
  getLastOvertypedInfo(idx) {
    if (idx >= 0 && idx < this._lastOvertyped.length) {
      return this._lastOvertyped[idx];
    }
    return void 0;
  }
  dispose() {
    this._disposables.dispose();
  }
};
export { OvertypingCapturer };
