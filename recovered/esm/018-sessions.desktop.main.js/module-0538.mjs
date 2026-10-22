// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/editorState/browser/keybindingCancellation.ts
import { createDecorator } from "./module-0077.mjs";
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { LinkedList } from "./module-0013.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { EditorCommand, registerEditorCommand } from "./module-0097.mjs";


// src/vs/editor/contrib/editorState/browser/keybindingCancellation.ts
var IEditorCancellationTokens = createDecorator("IEditorCancelService");

var ctxCancellableOperation = new RawContextKey("cancellableOperation", false, localize(1115, null));

registerSingleton(IEditorCancellationTokens, class {
  constructor() {
    this._tokens = /* @__PURE__ */ new WeakMap();
  }
  add(editor, cts) {
    let data = this._tokens.get(editor);
    if (!data) {
      data = editor.invokeWithinContext((accessor) => {
        const key3 = ctxCancellableOperation.bindTo(accessor.get(IContextKeyService));
        const tokens = new LinkedList();
        return { key: key3, tokens };
      });
      this._tokens.set(editor, data);
    }
    let removeFn;
    data.key.set(true);
    removeFn = data.tokens.push(cts);
    return () => {
      if (removeFn) {
        removeFn();
        data.key.set(!data.tokens.isEmpty());
        removeFn = void 0;
      }
    };
  }
  cancel(editor) {
    const data = this._tokens.get(editor);
    if (!data) {
      return;
    }
    const cts = data.tokens.pop();
    if (cts) {
      cts.cancel();
      data.key.set(!data.tokens.isEmpty());
    }
  }
}, 1 /* Delayed */);

var EditorKeybindingCancellationTokenSource = class extends CancellationTokenSource {
  constructor(editor, parent) {
    super(parent);
    this.editor = editor;
    this._unregister = editor.invokeWithinContext((accessor) => accessor.get(IEditorCancellationTokens).add(editor, this));
  }
  dispose() {
    this._unregister();
    super.dispose();
  }
};

registerEditorCommand(new class extends EditorCommand {
  constructor() {
    super({
      id: "editor.cancelOperation",
      kbOpts: {
        weight: 100 /* EditorContrib */,
        primary: 9 /* Escape */
      },
      precondition: ctxCancellableOperation
    });
  }
  runEditorCommand(accessor, editor) {
    accessor.get(IEditorCancellationTokens).cancel(editor);
  }
}());
export { IEditorCancellationTokens, ctxCancellableOperation, EditorKeybindingCancellationTokenSource };
