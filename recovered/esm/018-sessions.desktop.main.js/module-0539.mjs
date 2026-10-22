// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/editorState/browser/editorState.ts
import { format2 } from "./module-0030.mjs";
import { EditorKeybindingCancellationTokenSource } from "./module-0538.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Range2 } from "./module-0106.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";


// src/vs/editor/contrib/editorState/browser/editorState.ts
var EditorState = class _EditorState {
  constructor(editor, flags) {
    this.flags = flags;
    if ((this.flags & 1 /* Value */) !== 0) {
      const model = editor.getModel();
      this.modelVersionId = model ? format2("{0}#{1}", model.uri.toString(), model.getVersionId()) : null;
    } else {
      this.modelVersionId = null;
    }
    if ((this.flags & 4 /* Position */) !== 0) {
      this.position = editor.getPosition();
    } else {
      this.position = null;
    }
    if ((this.flags & 2 /* Selection */) !== 0) {
      this.selection = editor.getSelection();
    } else {
      this.selection = null;
    }
    if ((this.flags & 8 /* Scroll */) !== 0) {
      this.scrollLeft = editor.getScrollLeft();
      this.scrollTop = editor.getScrollTop();
    } else {
      this.scrollLeft = -1;
      this.scrollTop = -1;
    }
  }
  _equals(other) {
    if (!(other instanceof _EditorState)) {
      return false;
    }
    const state = other;
    if (this.modelVersionId !== state.modelVersionId) {
      return false;
    }
    if (this.scrollLeft !== state.scrollLeft || this.scrollTop !== state.scrollTop) {
      return false;
    }
    if (!this.position && state.position || this.position && !state.position || this.position && state.position && !this.position.equals(state.position)) {
      return false;
    }
    if (!this.selection && state.selection || this.selection && !state.selection || this.selection && state.selection && !this.selection.equalsRange(state.selection)) {
      return false;
    }
    return true;
  }
  validate(editor) {
    return this._equals(new _EditorState(editor, this.flags));
  }
};

var EditorStateCancellationTokenSource = class extends EditorKeybindingCancellationTokenSource {
  constructor(editor, flags, range2, parent) {
    super(editor, parent);
    this._listener = new DisposableStore();
    if (flags & 4 /* Position */) {
      this._listener.add(editor.onDidChangeCursorPosition((e4) => {
        if (!range2 || !Range2.containsPosition(range2, e4.position)) {
          this.cancel();
        }
      }));
    }
    if (flags & 2 /* Selection */) {
      this._listener.add(editor.onDidChangeCursorSelection((e4) => {
        if (!range2 || !Range2.containsRange(range2, e4.selection)) {
          this.cancel();
        }
      }));
    }
    if (flags & 8 /* Scroll */) {
      this._listener.add(editor.onDidScrollChange((_) => this.cancel()));
    }
    if (flags & 1 /* Value */) {
      this._listener.add(editor.onDidChangeModel((_) => this.cancel()));
      this._listener.add(editor.onDidChangeModelContent((_) => this.cancel()));
    }
  }
  dispose() {
    this._listener.dispose();
    super.dispose();
  }
};

var TextModelCancellationTokenSource = class extends CancellationTokenSource {
  constructor(model, parent) {
    super(parent);
    this._listener = model.onDidChangeContent(() => this.cancel());
  }
  dispose() {
    this._listener.dispose();
    super.dispose();
  }
};
export { EditorState, EditorStateCancellationTokenSource, TextModelCancellationTokenSource };
