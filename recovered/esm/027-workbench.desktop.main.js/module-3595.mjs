// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/typeHierarchy/browser/typeHierarchy.contribution.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { TypeHierarchyModel, TypeHierarchyProviderRegistry } from "./module-1217.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { TypeHierarchyTreePeekWidget } from "./module-3594.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { Range2 } from "./module-0106.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { EditorAction2, registerEditorContribution } from "./module-0097.mjs";
import { MenuId, registerAction2 } from "./module-0092.mjs";
import { PeekContext } from "./module-0623.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/typeHierarchy/browser/typeHierarchy.contribution.ts
var _ctxHasTypeHierarchyProvider = new RawContextKey("editorHasTypeHierarchyProvider", false, localize(21444, null));

var _ctxTypeHierarchyVisible = new RawContextKey("typeHierarchyVisible", false, localize(21452, null));

var _ctxTypeHierarchyDirection = new RawContextKey("typeHierarchyDirection", void 0, { type: "string", description: localize(21451, null) });

function sanitizedDirection2(candidate) {
  return candidate === "subtypes" /* Subtypes */ || candidate === "supertypes" /* Supertypes */ ? candidate : "subtypes" /* Subtypes */;
}

var TypeHierarchyController = class {
  constructor(_editor, _contextKeyService, _storageService, _editorService, _instantiationService) {
    this._editor = _editor;
    this._contextKeyService = _contextKeyService;
    this._storageService = _storageService;
    this._editorService = _editorService;
    this._instantiationService = _instantiationService;
    this._disposables = new DisposableStore();
    this._sessionDisposables = new DisposableStore();
    this._ctxHasProvider = _ctxHasTypeHierarchyProvider.bindTo(this._contextKeyService);
    this._ctxIsVisible = _ctxTypeHierarchyVisible.bindTo(this._contextKeyService);
    this._ctxDirection = _ctxTypeHierarchyDirection.bindTo(this._contextKeyService);
    this._disposables.add(Event2.any(_editor.onDidChangeModel, _editor.onDidChangeModelLanguage, TypeHierarchyProviderRegistry.onDidChange)(() => {
      this._ctxHasProvider.set(_editor.hasModel() && TypeHierarchyProviderRegistry.has(_editor.getModel()));
    }));
    this._disposables.add(this._sessionDisposables);
  }
  static {
    this.Id = "typeHierarchy";
  }
  static get(editor) {
    return editor.getContribution(TypeHierarchyController.Id);
  }
  static {
    this._storageDirectionKey = "typeHierarchy/defaultDirection";
  }
  dispose() {
    this._disposables.dispose();
  }
  // Peek
  async startTypeHierarchyFromEditor() {
    this._sessionDisposables.clear();
    if (!this._editor.hasModel()) {
      return;
    }
    const document2 = this._editor.getModel();
    const position2 = this._editor.getPosition();
    if (!TypeHierarchyProviderRegistry.has(document2)) {
      return;
    }
    const cts = new CancellationTokenSource();
    const model = TypeHierarchyModel.create(document2, position2, cts.token);
    const direction = sanitizedDirection2(this._storageService.get(TypeHierarchyController._storageDirectionKey, 0 /* PROFILE */, "subtypes" /* Subtypes */));
    this._showTypeHierarchyWidget(position2, direction, model, cts);
  }
  _showTypeHierarchyWidget(position2, direction, model, cts) {
    this._ctxIsVisible.set(true);
    this._ctxDirection.set(direction);
    Event2.any(this._editor.onDidChangeModel, this._editor.onDidChangeModelLanguage)(this.endTypeHierarchy, this, this._sessionDisposables);
    this._widget = this._instantiationService.createInstance(TypeHierarchyTreePeekWidget, this._editor, position2, direction);
    this._widget.showLoading();
    this._sessionDisposables.add(this._widget.onDidClose(() => {
      this.endTypeHierarchy();
      this._storageService.store(TypeHierarchyController._storageDirectionKey, this._widget.direction, 0 /* PROFILE */, 0 /* USER */);
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
        this._widget.showMessage(localize(21446, null));
      }
    }).catch((err) => {
      if (isCancellationError(err)) {
        this.endTypeHierarchy();
        return;
      }
      this._widget.showMessage(localize(21445, null));
    });
  }
  async startTypeHierarchyFromTypeHierarchy() {
    if (!this._widget) {
      return;
    }
    const model = this._widget.getModel();
    const typeItem = this._widget.getFocused();
    if (!typeItem || !model) {
      return;
    }
    const newEditor = await this._editorService.openCodeEditor({ resource: typeItem.item.uri }, this._editor);
    if (!newEditor) {
      return;
    }
    const newModel = model.fork(typeItem.item);
    this._sessionDisposables.clear();
    TypeHierarchyController.get(newEditor)?._showTypeHierarchyWidget(
      Range2.lift(newModel.root.selectionRange).getStartPosition(),
      this._widget.direction,
      Promise.resolve(newModel),
      new CancellationTokenSource()
    );
  }
  showSupertypes() {
    this._widget?.updateDirection("supertypes" /* Supertypes */);
    this._ctxDirection.set("supertypes" /* Supertypes */);
  }
  showSubtypes() {
    this._widget?.updateDirection("subtypes" /* Subtypes */);
    this._ctxDirection.set("subtypes" /* Subtypes */);
  }
  endTypeHierarchy() {
    this._sessionDisposables.clear();
    this._ctxIsVisible.set(false);
    this._editor.focus();
  }
};

TypeHierarchyController = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, ICodeEditorService),
  __decorateParam(4, IInstantiationService)
], TypeHierarchyController);

registerEditorContribution(TypeHierarchyController.Id, TypeHierarchyController, 0 /* Eager */);

registerAction2(class PeekTypeHierarchyAction extends EditorAction2 {
  constructor() {
    super({
      id: "editor.showTypeHierarchy",
      title: localize2(21447, "Peek Type Hierarchy"),
      menu: {
        id: MenuId.EditorContextPeek,
        group: "navigation",
        order: 1e3,
        when: ContextKeyExpr.and(
          _ctxHasTypeHierarchyProvider,
          PeekContext.notInPeekEditor
        )
      },
      precondition: ContextKeyExpr.and(
        _ctxHasTypeHierarchyProvider,
        PeekContext.notInPeekEditor
      ),
      f1: true
    });
  }
  async runEditorCommand(_accessor, editor) {
    return TypeHierarchyController.get(editor)?.startTypeHierarchyFromEditor();
  }
});

registerAction2(class extends EditorAction2 {
  constructor() {
    super({
      id: "editor.showSupertypes",
      title: localize2(21450, "Show Supertypes"),
      icon: Codicon.typeHierarchySuper,
      precondition: ContextKeyExpr.and(_ctxTypeHierarchyVisible, _ctxTypeHierarchyDirection.isEqualTo("subtypes" /* Subtypes */)),
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 1024 /* Shift */ + 512 /* Alt */ + 38 /* KeyH */
      },
      menu: {
        id: TypeHierarchyTreePeekWidget.TitleMenu,
        when: _ctxTypeHierarchyDirection.isEqualTo("subtypes" /* Subtypes */),
        order: 1
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    return TypeHierarchyController.get(editor)?.showSupertypes();
  }
});

registerAction2(class extends EditorAction2 {
  constructor() {
    super({
      id: "editor.showSubtypes",
      title: localize2(21449, "Show Subtypes"),
      icon: Codicon.typeHierarchySub,
      precondition: ContextKeyExpr.and(_ctxTypeHierarchyVisible, _ctxTypeHierarchyDirection.isEqualTo("supertypes" /* Supertypes */)),
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 1024 /* Shift */ + 512 /* Alt */ + 38 /* KeyH */
      },
      menu: {
        id: TypeHierarchyTreePeekWidget.TitleMenu,
        when: _ctxTypeHierarchyDirection.isEqualTo("supertypes" /* Supertypes */),
        order: 1
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    return TypeHierarchyController.get(editor)?.showSubtypes();
  }
});

registerAction2(class extends EditorAction2 {
  constructor() {
    super({
      id: "editor.refocusTypeHierarchy",
      title: localize2(21448, "Refocus Type Hierarchy"),
      precondition: _ctxTypeHierarchyVisible,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 1024 /* Shift */ + 3 /* Enter */
      }
    });
  }
  async runEditorCommand(_accessor, editor) {
    return TypeHierarchyController.get(editor)?.startTypeHierarchyFromTypeHierarchy();
  }
});

registerAction2(class extends EditorAction2 {
  constructor() {
    super({
      id: "editor.closeTypeHierarchy",
      title: localize(21443, null),
      icon: Codicon.close,
      precondition: _ctxTypeHierarchyVisible,
      keybinding: {
        weight: 200 /* WorkbenchContrib */ + 10,
        primary: 9 /* Escape */,
        when: ContextKeyExpr.not("config.editor.stablePeek")
      },
      menu: {
        id: TypeHierarchyTreePeekWidget.TitleMenu,
        order: 1e3
      }
    });
  }
  runEditorCommand(_accessor, editor) {
    return TypeHierarchyController.get(editor)?.endTypeHierarchy();
  }
});
export { sanitizedDirection2, _ctxHasTypeHierarchyProvider, _ctxTypeHierarchyVisible, _ctxTypeHierarchyDirection, TypeHierarchyController };
