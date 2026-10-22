// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/suggest/browser/suggestCommitCharacters.ts
import { DisposableStore } from "./module-0012.mjs";
import { isNonEmptyArray } from "./module-0007.mjs";
import { CharacterSet } from "./module-0121.mjs";


// src/vs/editor/contrib/suggest/browser/suggestCommitCharacters.ts
var CommitCharacterController = class {
  constructor(editor, widget, model, accept) {
    this._disposables = new DisposableStore();
    this._disposables.add(model.onDidSuggest((e) => {
      if (e.completionModel.items.length === 0) {
        this.reset();
      }
    }));
    this._disposables.add(model.onDidCancel((e) => {
      this.reset();
    }));
    this._disposables.add(widget.onDidShow(() => this._onItem(widget.getFocusedItem())));
    this._disposables.add(widget.onDidFocus(this._onItem, this));
    this._disposables.add(widget.onDidHide(this.reset, this));
    this._disposables.add(editor.onWillType((text2) => {
      if (this._active && !widget.isFrozen() && model.state !== 0 /* Idle */) {
        const ch = text2.charCodeAt(text2.length - 1);
        if (this._active.acceptCharacters.has(ch) && editor.getOption(0 /* acceptSuggestionOnCommitCharacter */)) {
          accept(this._active.item);
        }
      }
    }));
  }
  _onItem(selected) {
    if (!selected || !isNonEmptyArray(selected.item.completion.commitCharacters)) {
      this.reset();
      return;
    }
    if (this._active && this._active.item.item === selected.item) {
      return;
    }
    const acceptCharacters = new CharacterSet();
    for (const ch of selected.item.completion.commitCharacters) {
      if (ch.length > 0) {
        acceptCharacters.add(ch.charCodeAt(0));
      }
    }
    this._active = { acceptCharacters, item: selected };
  }
  reset() {
    this._active = void 0;
  }
  dispose() {
    this._disposables.dispose();
  }
};
export { CommitCharacterController };
