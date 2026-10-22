// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/callHierarchy/browser/callHierarchy.contribution.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { CallHierarchyModel, CallHierarchyProviderRegistry } from "./module-1215.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { Range2 } from "./module-0106.mjs";
import { CallHierarchyTreePeekWidget } from "./module-3331.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { EditorAction2, registerEditorContribution } from "./module-0097.mjs";
import { MenuId, registerAction2 } from "./module-0092.mjs";
import { PeekContext } from "./module-0623.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/callHierarchy/browser/callHierarchy.contribution.ts
var _ctxHasCallHierarchyProvider = new RawContextKey("editorHasCallHierarchyProvider", false, localize(8367, null));

var _ctxCallHierarchyVisible = new RawContextKey("callHierarchyVisible", false, localize(8365, null));

var _ctxCallHierarchyDirection = new RawContextKey("callHierarchyDirection", void 0, { type: "string", description: localize(8364, null) });

function sanitizedDirection(candidate) {
  return candidate === "outgoingCalls" /* CallsFrom */ || candidate === "incomingCalls" /* CallsTo */ ? candidate : "incomingCalls" /* CallsTo */;
}

var CallHierarchyController = class {
  constructor(_editor, _contextKeyService, _storageService, _editorService, _instantiationService) {
    this._editor = _editor;
    this._contextKeyService = _contextKeyService;
    this._storageService = _storageService;
    this._editorService = _editorService;
    this._instantiationService = _instantiationService;
    this._dispoables = new DisposableStore();
    this._sessionDisposables = new DisposableStore();
    this._ctxIsVisible = _ctxCallHierarchyVisible.bindTo(this._contextKeyService);
    this._ctxHasProvider = _ctxHasCallHierarchyProvider.bindTo(this._contextKeyService);
    this._ctxDirection = _ctxCallHierarchyDirection.bindTo(this._contextKeyService);
    this._dispoables.add(Event2.any(_editor.onDidChangeModel, _editor.onDidChangeModelLanguage, CallHierarchyProviderRegistry.onDidChange)(() => {
      this._ctxHasProvider.set(_editor.hasModel() && CallHierarchyProviderRegistry.has(_editor.getModel()));
    }));
    this._dispoables.add(this._sessionDisposables);
  }
  static {
    this.Id = "callHierarchy";
  }
  static get(editor) {
    return editor.getContribution(CallHierarchyController.Id);
  }
  static {
    this._StorageDirection = "callHierarchy/defaultDirection";
  }
  dispose() {
    this._ctxHasProvider.reset();
    this._ctxIsVisible.reset();
    this._dispoables.dispose();
  }
  async startCallHierarchyFromEditor() {
    this._sessionDisposables.clear();
    if (!this._editor.hasModel()) {
      return;
    }
    const document2 = this._editor.getModel();
    const position2 = this._editor.getPosition();
    if (!CallHierarchyProviderRegistry.has(document2)) {
      return;
    }
    const cts = new CancellationTokenSource();
    const model = CallHierarchyModel.create(document2, position2, cts.token);
    const direction = sanitizedDirection(this._storageService.get(CallHierarchyController._StorageDirection, 0 /* PROFILE */, "incomingCalls" /* CallsTo */));
    this._showCallHierarchyWidget(position2, direction, model, cts);
  }
  async startCallHierarchyFromCallHierarchy() {
    if (!this._widget) {
      return;
    }
    const model = this._widget.getModel();
    const call = this._widget.getFocused();
    if (!call || !model) {
      return;
    }
    const newEditor = await this._editorService.openCodeEditor({ resource: call.item.uri }, this._editor);
    if (!newEditor) {
      return;
    }
    const newModel = model.fork(call.item);
    this._sessionDisposables.clear();
    CallHierarchyController.get(newEditor)?._showCallHierarchyWidget(
      Range2.lift(newModel.root.selectionRange).getStartPosition(),
      this._widget.direction,
      Promise.resolve(newModel),
      new CancellationTokenSource()
    );
  }
  _showCallHierarchyWidget(position2, direction, model, cts) {
    this._ctxIsVisible.set(true);
    this._ctxDirection.set(direction);
    Event2.any(this._editor.onDidChangeModel, this._editor.onDidChangeModelLanguage)(this.endCallHierarchy, this, this._sessionDisposables);
    this._widget = this._instantiationService.createInstance(CallHierarchyTreePeekWidget, this._editor, position2, direction);
    this._widget.showLoading();
    this._sessionDisposables.add(this._widget.onDidClose(() => {
      this.endCallHierarchy();
      this._storageService.store(CallHierarchyController._StorageDirection, this._widget.direction, 0 /* PROFILE */, 0 /* USER */);
    }));
    this._sessionDisposables.add({ dispose() {
      cts.dispose(true);
    } });
    this._sessionDisposables.add(this._widget);
    model.then((model2) => {
      if (cts.token.isCancellationRequested) {
        return;
      }
      if (model2) {
        this._sessionDisposables.add(model2);
        this._widget.showModel(model2);
      } else {
        this._widget.showMessage(localize(8369, null));
      }
    }).catch((err) => {
      if (isCancellationError(err)) {
        this.endCallHierarchy();
        return;
      }
      this._widget.showMessage(localize(8368, null));
    });
  }
  showOutgoingCalls() {
    this._widget?.updateDirection("outgoingCalls" /* CallsFrom */);
    this._ctxDirection.set("outgoingCalls" /* CallsFrom */);
  }
  showIncomingCalls() {
    this._widget?.updateDirection("incomingCalls" /* CallsTo */);
    this._ctxDirection.set("incomingCalls" /* CallsTo */);
  }
  endCallHierarchy() {
    this._sessionDisposables.clear();
    this._ctxIsVisible.set(false);
    this._editor.focus();
  }
};

CallHierarchyController = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, ICodeEditorService),
  __decorateParam(4, IInstantiationService)
], CallHierarchyController);

registerEditorContribution(CallHierarchyController.Id, CallHierarchyController, 0 /* Eager */);

registerAction2(class PeekCallHierarchyAction extends EditorAction2 {
  constructor() {
    super({
      id: "editor.showCallHierarchy",
      title: localize2(8372, "Peek Call Hierarchy"),
      menu: {
        id: MenuId.EditorContextPeek,
        group: "navigation",
        order: 1e3,
        when: ContextKeyExpr.and(
          _ctxHasCallHierarchyProvider,
          PeekContext.notInPeekEditor,
          EditorContextKeys.isInEmbeddedEditor.toNegated()
        )
      },
      keybinding: {
        when: EditorContextKeys.editorTextFocus,
        weight: 200 /* WorkbenchContrib */,
        primary: 1024 /* Shift */ + 512 /* Alt */ + 38 /* KeyH */
      },
      precondition: ContextKeyExpr.and(
        _ctxHasCallHierarchyProvider,
        PeekContext.notInPeekEditor
      ),
      f1: true
    });
  }
  async runEditorCommand(_accessor, editor) {
    return CallHierarchyController.get(editor)?.startCallHierarchyFromEditor();
  }
});

registerAction2(class extends EditorAction2 {
  constructor() {
    super({
      id: "editor.showIncomingCalls",
      title: localize2(8373, "Show Incoming Calls"),
      icon: registerIcon("callhierarchy-incoming", Codicon.callIncoming, localize(8370, null)),
      precondition: ContextKeyExpr.and(_ctxCallHierarchyVisible, _ctxCallHierarchyDirection.isEqualTo("outgoingCalls" /* CallsFrom */)),
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 1024 /* Shift */ + 512 /* Alt */ + 38 /* KeyH */
      },
      menu: {
        id: CallHierarchyTreePeekWidget.TitleMenu,
        when: _ctxCallHierarchyDirection.isEqualTo("outgoingCalls" /* CallsFrom */),
        order: 1
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    return CallHierarchyController.get(editor)?.showIncomingCalls();
  }
});

registerAction2(class extends EditorAction2 {
  constructor() {
    super({
      id: "editor.showOutgoingCalls",
      title: localize2(8374, "Show Outgoing Calls"),
      icon: registerIcon("callhierarchy-outgoing", Codicon.callOutgoing, localize(8371, null)),
      precondition: ContextKeyExpr.and(_ctxCallHierarchyVisible, _ctxCallHierarchyDirection.isEqualTo("incomingCalls" /* CallsTo */)),
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 1024 /* Shift */ + 512 /* Alt */ + 38 /* KeyH */
      },
      menu: {
        id: CallHierarchyTreePeekWidget.TitleMenu,
        when: _ctxCallHierarchyDirection.isEqualTo("incomingCalls" /* CallsTo */),
        order: 1
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    return CallHierarchyController.get(editor)?.showOutgoingCalls();
  }
});

registerAction2(class extends EditorAction2 {
  constructor() {
    super({
      id: "editor.refocusCallHierarchy",
      title: localize2(8375, "Refocus Call Hierarchy"),
      precondition: _ctxCallHierarchyVisible,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 1024 /* Shift */ + 3 /* Enter */
      }
    });
  }
  async runEditorCommand(_accessor, editor) {
    return CallHierarchyController.get(editor)?.startCallHierarchyFromCallHierarchy();
  }
});

registerAction2(class extends EditorAction2 {
  constructor() {
    super({
      id: "editor.closeCallHierarchy",
      title: localize(8366, null),
      icon: Codicon.close,
      precondition: _ctxCallHierarchyVisible,
      keybinding: {
        weight: 200 /* WorkbenchContrib */ + 10,
        primary: 9 /* Escape */,
        when: ContextKeyExpr.not("config.editor.stablePeek")
      },
      menu: {
        id: CallHierarchyTreePeekWidget.TitleMenu,
        order: 1e3
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    return CallHierarchyController.get(editor)?.endCallHierarchy();
  }
});
export { sanitizedDirection, _ctxHasCallHierarchyProvider, _ctxCallHierarchyVisible, _ctxCallHierarchyDirection, CallHierarchyController };
