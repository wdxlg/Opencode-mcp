// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/gotoSymbol/browser/symbolNavigation.ts
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { createDecorator } from "./module-0077.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { Range2 } from "./module-0106.mjs";
import { DisposableStore, combinedDisposable, dispose } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { EditorCommand, registerEditorCommand } from "./module-0097.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/editor/contrib/gotoSymbol/browser/symbolNavigation.ts
var ctxHasSymbols = new RawContextKey("hasSymbols", false, localize(1270, null));

var ISymbolNavigationService = createDecorator("ISymbolNavigationService");

var SymbolNavigationService = class {
  constructor(contextKeyService, _editorService, _notificationService, _keybindingService) {
    this._editorService = _editorService;
    this._notificationService = _notificationService;
    this._keybindingService = _keybindingService;
    this._currentModel = void 0;
    this._currentIdx = -1;
    this._ignoreEditorChange = false;
    this._ctxHasSymbols = ctxHasSymbols.bindTo(contextKeyService);
  }
  reset() {
    this._ctxHasSymbols.reset();
    this._currentState?.dispose();
    this._currentMessage?.close();
    this._currentModel = void 0;
    this._currentIdx = -1;
  }
  put(anchor) {
    const refModel = anchor.parent.parent;
    if (refModel.references.length <= 1) {
      this.reset();
      return;
    }
    this._currentModel = refModel;
    this._currentIdx = refModel.references.indexOf(anchor);
    this._ctxHasSymbols.set(true);
    this._showMessage();
    const editorState = new EditorState2(this._editorService);
    const listener = editorState.onDidChange((_) => {
      if (this._ignoreEditorChange) {
        return;
      }
      const editor = this._editorService.getActiveCodeEditor();
      if (!editor) {
        return;
      }
      const model = editor.getModel();
      const position2 = editor.getPosition();
      if (!model || !position2) {
        return;
      }
      let seenUri = false;
      let seenPosition = false;
      for (const reference of refModel.references) {
        if (isEqual2(reference.uri, model.uri)) {
          seenUri = true;
          seenPosition = seenPosition || Range2.containsPosition(reference.range, position2);
        } else if (seenUri) {
          break;
        }
      }
      if (!seenUri || !seenPosition) {
        this.reset();
      }
    });
    this._currentState = combinedDisposable(editorState, listener);
  }
  revealNext(source) {
    if (!this._currentModel) {
      return Promise.resolve();
    }
    this._currentIdx += 1;
    this._currentIdx %= this._currentModel.references.length;
    const reference = this._currentModel.references[this._currentIdx];
    this._showMessage();
    this._ignoreEditorChange = true;
    return this._editorService.openCodeEditor({
      resource: reference.uri,
      options: {
        selection: Range2.collapseToStart(reference.range),
        selectionRevealType: 3 /* NearTopIfOutsideViewport */
      }
    }, source).finally(() => {
      this._ignoreEditorChange = false;
    });
  }
  _showMessage() {
    this._currentMessage?.close();
    const kb = this._keybindingService.lookupKeybinding("editor.gotoNextSymbolFromResult");
    const message = kb ? localize(1272, null, this._currentIdx + 1, this._currentModel.references.length, kb.getLabel()) : localize(1271, null, this._currentIdx + 1, this._currentModel.references.length);
    this._currentMessage = this._notificationService.status(message);
  }
};

SymbolNavigationService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ICodeEditorService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IKeybindingService)
], SymbolNavigationService);

registerSingleton(ISymbolNavigationService, SymbolNavigationService, 1 /* Delayed */);

registerEditorCommand(new class extends EditorCommand {
  constructor() {
    super({
      id: "editor.gotoNextSymbolFromResult",
      precondition: ctxHasSymbols,
      kbOpts: {
        weight: 100 /* EditorContrib */,
        primary: 70 /* F12 */
      }
    });
  }
  runEditorCommand(accessor, editor) {
    return accessor.get(ISymbolNavigationService).revealNext(editor);
  }
}());

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "editor.gotoNextSymbolFromResult.cancel",
  weight: 100 /* EditorContrib */,
  when: ctxHasSymbols,
  primary: 9 /* Escape */,
  handler(accessor) {
    accessor.get(ISymbolNavigationService).reset();
  }
});

var EditorState2 = class {
  constructor(editorService) {
    this._listener = /* @__PURE__ */ new Map();
    this._disposables = new DisposableStore();
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
    this._disposables.add(editorService.onCodeEditorRemove(this._onDidRemoveEditor, this));
    this._disposables.add(editorService.onCodeEditorAdd(this._onDidAddEditor, this));
    editorService.listCodeEditors().forEach(this._onDidAddEditor, this);
  }
  dispose() {
    this._disposables.dispose();
    this._onDidChange.dispose();
    dispose(this._listener.values());
  }
  _onDidAddEditor(editor) {
    this._listener.set(editor, combinedDisposable(
      editor.onDidChangeCursorPosition((_) => this._onDidChange.fire({ editor })),
      editor.onDidChangeModelContent((_) => this._onDidChange.fire({ editor }))
    ));
  }
  _onDidRemoveEditor(editor) {
    this._listener.get(editor)?.dispose();
    this._listener.delete(editor);
  }
};

EditorState2 = __decorateClass([
  __decorateParam(0, ICodeEditorService)
], EditorState2);
export { ctxHasSymbols, ISymbolNavigationService, SymbolNavigationService, EditorState2 };
