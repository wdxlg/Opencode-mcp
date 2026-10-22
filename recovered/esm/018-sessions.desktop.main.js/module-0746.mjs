// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/suggest/browser/suggestAlternatives.ts
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";


// src/vs/editor/contrib/suggest/browser/suggestAlternatives.ts
var SuggestAlternatives = class {
  constructor(_editor, contextKeyService) {
    this._editor = _editor;
    this._index = 0;
    this._ckOtherSuggestions = SuggestAlternatives.OtherSuggestions.bindTo(contextKeyService);
  }
  static {
    this.OtherSuggestions = new RawContextKey("hasOtherSuggestions", false);
  }
  dispose() {
    this.reset();
  }
  reset() {
    this._ckOtherSuggestions.reset();
    this._listener?.dispose();
    this._model = void 0;
    this._acceptNext = void 0;
    this._ignore = false;
  }
  set({ model, index: index2 }, acceptNext) {
    if (model.items.length === 0) {
      this.reset();
      return;
    }
    const nextIndex = SuggestAlternatives._moveIndex(true, model, index2);
    if (nextIndex === index2) {
      this.reset();
      return;
    }
    this._acceptNext = acceptNext;
    this._model = model;
    this._index = index2;
    this._listener = this._editor.onDidChangeCursorPosition(() => {
      if (!this._ignore) {
        this.reset();
      }
    });
    this._ckOtherSuggestions.set(true);
  }
  static _moveIndex(fwd, model, index2) {
    let newIndex = index2;
    for (let rounds = model.items.length; rounds > 0; rounds--) {
      newIndex = (newIndex + model.items.length + (fwd ? 1 : -1)) % model.items.length;
      if (newIndex === index2) {
        break;
      }
      if (!model.items[newIndex].completion.additionalTextEdits) {
        break;
      }
    }
    return newIndex;
  }
  next() {
    this._move(true);
  }
  prev() {
    this._move(false);
  }
  _move(fwd) {
    if (!this._model) {
      return;
    }
    try {
      this._ignore = true;
      this._index = SuggestAlternatives._moveIndex(fwd, this._model, this._index);
      this._acceptNext({ index: this._index, item: this._model.items[this._index], model: this._model });
    } finally {
      this._ignore = false;
    }
  }
};

SuggestAlternatives = __decorateClass([
  __decorateParam(1, IContextKeyService)
], SuggestAlternatives);
export { SuggestAlternatives };
