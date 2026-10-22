// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/services/notebookEditorServiceImpl.ts
import { DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { NotebookEditorInput, isCompositeNotebookEditorInput, isNotebookEditorInput } from "./module-0939.mjs";
import { NotebookDiffEditorInput } from "./module-1880.mjs";
import { InteractiveWindowOpen, MOST_RECENT_REPL_EDITOR } from "./module-1868.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IEditorProgressService } from "./module-0446.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { NotebookEditorWidget, getDefaultNotebookCreationOptions } from "./module-1964.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/notebook/browser/services/notebookEditorServiceImpl.ts
var NotebookEditorWidgetService = class {
  constructor(editorGroupService, editorService, contextKeyService, instantiationService) {
    this.editorGroupService = editorGroupService;
    this.instantiationService = instantiationService;
    this._tokenPool = 1;
    this._disposables = new DisposableStore();
    this._notebookEditors = /* @__PURE__ */ new Map();
    this.groupListener = /* @__PURE__ */ new Map();
    this._onNotebookEditorAdd = new Emitter();
    this._onNotebookEditorsRemove = new Emitter();
    this.onDidAddNotebookEditor = this._onNotebookEditorAdd.event;
    this.onDidRemoveNotebookEditor = this._onNotebookEditorsRemove.event;
    this._borrowableEditors = /* @__PURE__ */ new Map();
    const onNewGroup = (group2) => {
      const { id: id2 } = group2;
      const listeners = [];
      listeners.push(group2.onDidCloseEditor((e) => {
        const widgetMap = this._borrowableEditors.get(group2.id);
        if (!widgetMap) {
          return;
        }
        const inputs = e.editor instanceof NotebookEditorInput || e.editor instanceof NotebookDiffEditorInput ? [e.editor] : isCompositeNotebookEditorInput(e.editor) ? e.editor.editorInputs : [];
        inputs.forEach((input) => {
          const widgets2 = widgetMap.get(input.resource);
          const index2 = widgets2?.findIndex((widget) => widget.editorType === input.typeId);
          if (!widgets2 || index2 === void 0 || index2 === -1) {
            return;
          }
          const value2 = widgets2.splice(index2, 1)[0];
          value2.token = void 0;
          this._disposeWidget(value2.widget);
          value2.disposableStore.dispose();
          value2.widget = void 0;
        });
      }));
      listeners.push(group2.onWillMoveEditor((e) => {
        if (isNotebookEditorInput(e.editor)) {
          this._allowWidgetMove(e.editor, e.groupId, e.target);
        }
        if (isCompositeNotebookEditorInput(e.editor)) {
          e.editor.editorInputs.forEach((input) => {
            this._allowWidgetMove(input, e.groupId, e.target);
          });
        }
      }));
      this.groupListener.set(id2, listeners);
    };
    this._disposables.add(editorGroupService.onDidAddGroup(onNewGroup));
    editorGroupService.whenReady.then(() => editorGroupService.groups.forEach(onNewGroup));
    this._disposables.add(editorGroupService.onDidRemoveGroup((group2) => {
      const listeners = this.groupListener.get(group2.id);
      if (listeners) {
        listeners.forEach((listener) => listener.dispose());
        this.groupListener.delete(group2.id);
      }
      const widgets2 = this._borrowableEditors.get(group2.id);
      this._borrowableEditors.delete(group2.id);
      if (widgets2) {
        for (const values of widgets2.values()) {
          for (const value2 of values) {
            value2.token = void 0;
            this._disposeWidget(value2.widget);
            value2.disposableStore.dispose();
          }
        }
      }
    }));
    this._mostRecentRepl = MOST_RECENT_REPL_EDITOR.bindTo(contextKeyService);
    const interactiveWindowOpen = InteractiveWindowOpen.bindTo(contextKeyService);
    this._disposables.add(editorService.onDidEditorsChange((e) => {
      if (e.event.kind === 5 /* EDITOR_OPEN */ && !interactiveWindowOpen.get()) {
        if (editorService.editors.find((editor) => isCompositeNotebookEditorInput(editor))) {
          interactiveWindowOpen.set(true);
        }
      } else if (e.event.kind === 6 /* EDITOR_CLOSE */ && interactiveWindowOpen.get()) {
        if (!editorService.editors.find((editor) => isCompositeNotebookEditorInput(editor))) {
          interactiveWindowOpen.set(false);
        }
      }
    }));
  }
  dispose() {
    this._disposables.dispose();
    this._onNotebookEditorAdd.dispose();
    this._onNotebookEditorsRemove.dispose();
    this.groupListener.forEach((listeners) => {
      listeners.forEach((listener) => listener.dispose());
    });
    this.groupListener.clear();
    this._borrowableEditors.forEach((widgetMap) => {
      widgetMap.forEach((widgets2) => {
        widgets2.forEach((widget) => widget.disposableStore.dispose());
      });
    });
  }
  // --- group-based editor borrowing...
  _disposeWidget(widget) {
    widget.onWillHide();
    const domNode = widget.getDomNode();
    widget.dispose();
    domNode.remove();
  }
  _allowWidgetMove(input, sourceID, targetID) {
    const sourcePart = this.editorGroupService.getPart(sourceID);
    const targetPart = this.editorGroupService.getPart(targetID);
    if (sourcePart.windowId !== targetPart.windowId) {
      return;
    }
    const target = this._borrowableEditors.get(targetID)?.get(input.resource)?.findIndex((widget2) => widget2.editorType === input.typeId);
    if (target !== void 0 && target !== -1) {
      return;
    }
    const widget = this._borrowableEditors.get(sourceID)?.get(input.resource)?.find((widget2) => widget2.editorType === input.typeId);
    if (!widget) {
      throw new Error("no widget at source group");
    }
    const sourceWidgets = this._borrowableEditors.get(sourceID)?.get(input.resource);
    if (sourceWidgets) {
      const indexToRemove = sourceWidgets.findIndex((widget2) => widget2.editorType === input.typeId);
      if (indexToRemove !== -1) {
        sourceWidgets.splice(indexToRemove, 1);
      }
    }
    let targetMap = this._borrowableEditors.get(targetID);
    if (!targetMap) {
      targetMap = new ResourceMap();
      this._borrowableEditors.set(targetID, targetMap);
    }
    const widgetsAtTarget = targetMap.get(input.resource) ?? [];
    widgetsAtTarget?.push(widget);
    targetMap.set(input.resource, widgetsAtTarget);
  }
  retrieveExistingWidgetFromURI(resource) {
    for (const widgetInfo of this._borrowableEditors.values()) {
      const widgets2 = widgetInfo.get(resource);
      if (widgets2 && widgets2.length > 0) {
        return this._createBorrowValue(widgets2[0].token, widgets2[0]);
      }
    }
    return void 0;
  }
  retrieveAllExistingWidgets() {
    const ret = [];
    for (const widgetInfo of this._borrowableEditors.values()) {
      for (const widgets2 of widgetInfo.values()) {
        for (const widget of widgets2) {
          ret.push(this._createBorrowValue(widget.token, widget));
        }
      }
    }
    return ret;
  }
  retrieveWidget(accessor, groupId, input, creationOptions, initialDimension, codeWindow) {
    let value2 = this._borrowableEditors.get(groupId)?.get(input.resource)?.find((widget) => widget.editorType === input.typeId);
    if (!value2) {
      const editorGroupContextKeyService = accessor.get(IContextKeyService);
      const editorGroupEditorProgressService = accessor.get(IEditorProgressService);
      const widgetDisposeStore = new DisposableStore();
      const widget = this.createWidget(editorGroupContextKeyService, widgetDisposeStore, editorGroupEditorProgressService, creationOptions, codeWindow, initialDimension);
      const token = this._tokenPool++;
      value2 = { widget, editorType: input.typeId, token, disposableStore: widgetDisposeStore };
      let map = this._borrowableEditors.get(groupId);
      if (!map) {
        map = new ResourceMap();
        this._borrowableEditors.set(groupId, map);
      }
      const values = map.get(input.resource) ?? [];
      values.push(value2);
      map.set(input.resource, values);
    } else {
      value2.token = this._tokenPool++;
    }
    return this._createBorrowValue(value2.token, value2);
  }
  // protected for unit testing overrides
  createWidget(editorGroupContextKeyService, widgetDisposeStore, editorGroupEditorProgressService, creationOptions, codeWindow, initialDimension) {
    const notebookInstantiationService = widgetDisposeStore.add(this.instantiationService.createChild(new ServiceCollection(
      [IContextKeyService, editorGroupContextKeyService],
      [IEditorProgressService, editorGroupEditorProgressService]
    )));
    const ctorOptions = creationOptions ?? getDefaultNotebookCreationOptions();
    const widget = notebookInstantiationService.createInstance(NotebookEditorWidget, {
      ...ctorOptions,
      codeWindow: codeWindow ?? ctorOptions.codeWindow
    }, initialDimension);
    return widget;
  }
  _createBorrowValue(myToken, widget) {
    return {
      get value() {
        return widget.token === myToken ? widget.widget : void 0;
      }
    };
  }
  // --- editor management
  addNotebookEditor(editor) {
    this._notebookEditors.set(editor.getId(), editor);
    this._onNotebookEditorAdd.fire(editor);
  }
  removeNotebookEditor(editor) {
    const notebookUri = editor.getViewModel()?.notebookDocument.uri;
    if (this._notebookEditors.delete(editor.getId())) {
      this._onNotebookEditorsRemove.fire(editor);
    }
    if (this._mostRecentRepl.get() === notebookUri?.toString()) {
      this._mostRecentRepl.reset();
    }
  }
  getNotebookEditor(editorId) {
    return this._notebookEditors.get(editorId);
  }
  listNotebookEditors() {
    return [...this._notebookEditors].map((e) => e[1]);
  }
  getNotebookForPossibleCell(candidate) {
    for (const editor of this._notebookEditors.values()) {
      for (const [, codeEditor] of editor.codeEditors) {
        if (codeEditor === candidate) {
          return editor;
        }
      }
    }
    return void 0;
  }
  updateReplContextKey(uri5) {
    this._mostRecentRepl.set(uri5);
  }
};

NotebookEditorWidgetService = __decorateClass([
  __decorateParam(0, IEditorGroupsService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IInstantiationService)
], NotebookEditorWidgetService);
export { NotebookEditorWidgetService };
