// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/suggest/browser/wordContextKey.ts
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";


// src/vs/editor/contrib/suggest/browser/wordContextKey.ts
var WordContextKey = class {
  constructor(_editor, contextKeyService) {
    this._editor = _editor;
    this._enabled = false;
    this._ckAtEnd = WordContextKey.AtEnd.bindTo(contextKeyService);
    this._configListener = this._editor.onDidChangeConfiguration((e4) => e4.hasChanged(139 /* tabCompletion */) && this._update());
    this._update();
  }
  static {
    this.AtEnd = new RawContextKey("atEndOfWord", false, { type: "boolean", description: localize(1680, null) });
  }
  dispose() {
    this._configListener.dispose();
    this._selectionListener?.dispose();
    this._ckAtEnd.reset();
  }
  _update() {
    const enabled = this._editor.getOption(139 /* tabCompletion */) === "on";
    if (this._enabled === enabled) {
      return;
    }
    this._enabled = enabled;
    if (this._enabled) {
      const checkForWordEnd = () => {
        if (!this._editor.hasModel()) {
          this._ckAtEnd.set(false);
          return;
        }
        const model = this._editor.getModel();
        const selection = this._editor.getSelection();
        const word = model.getWordAtPosition(selection.getStartPosition());
        if (!word) {
          this._ckAtEnd.set(false);
          return;
        }
        this._ckAtEnd.set(word.endColumn === selection.getStartPosition().column && selection.getStartPosition().lineNumber === selection.getEndPosition().lineNumber);
      };
      this._selectionListener = this._editor.onDidChangeCursorSelection(checkForWordEnd);
      checkForWordEnd();
    } else if (this._selectionListener) {
      this._ckAtEnd.reset();
      this._selectionListener.dispose();
      this._selectionListener = void 0;
    }
  }
};

WordContextKey = __decorateClass([
  __decorateParam(1, IContextKeyService)
], WordContextKey);
export { WordContextKey };
