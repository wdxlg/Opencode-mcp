// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editorPane.ts
import { Composite } from "./module-1086.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { DEFAULT_EDITOR_MAX_DIMENSIONS, DEFAULT_EDITOR_MIN_DIMENSIONS } from "./module-1088.mjs";
import { getWindowById } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { isEditorInput } from "./module-0925.mjs";
import { isEmptyObject } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { isEqual2, joinPath } from "./module-0034.mjs";
import { indexOfPath } from "./module-0031.mjs";
import { LRUCache } from "./module-0008.mjs";


// src/vs/workbench/browser/parts/editor/editorPane.ts
var EditorPane = class _EditorPane extends Composite {
  constructor(id2, group2, telemetryService, themeService, storageService) {
    super(id2, telemetryService, themeService, storageService);
    this.group = group2;
    //#region Events
    this.onDidChangeSizeConstraints = Event2.None;
    this._onDidChangeControl = this._register(new Emitter());
    this.onDidChangeControl = this._onDidChangeControl.event;
  }
  static {
    //#endregion
    this.EDITOR_MEMENTOS = /* @__PURE__ */ new Map();
  }
  get minimumWidth() {
    return DEFAULT_EDITOR_MIN_DIMENSIONS.width;
  }
  get maximumWidth() {
    return DEFAULT_EDITOR_MAX_DIMENSIONS.width;
  }
  get minimumHeight() {
    return DEFAULT_EDITOR_MIN_DIMENSIONS.height;
  }
  get maximumHeight() {
    return DEFAULT_EDITOR_MAX_DIMENSIONS.height;
  }
  get input() {
    return this._input;
  }
  get options() {
    return this._options;
  }
  get window() {
    return getWindowById(this.group.windowId, true).window;
  }
  /**
   * Should be overridden by editors that have their own ScopedContextKeyService
   */
  get scopedContextKeyService() {
    return void 0;
  }
  create(parent) {
    super.create(parent);
    this.createEditor(parent);
  }
  /**
   * Note: Clients should not call this method, the workbench calls this
   * method. Calling it otherwise may result in unexpected behavior.
   *
   * Sets the given input with the options to the editor. The input is guaranteed
   * to be different from the previous input that was set using the `input.matches()`
   * method.
   *
   * The provided context gives more information around how the editor was opened.
   *
   * The provided cancellation token should be used to test if the operation
   * was cancelled.
   */
  async setInput(input, options3, context2, token) {
    this._input = input;
    this._options = options3;
  }
  /**
   * Called to indicate to the editor that the input should be cleared and
   * resources associated with the input should be freed.
   *
   * This method can be called based on different contexts, e.g. when opening
   * a different input or different editor control or when closing all editors
   * in a group.
   *
   * To monitor the lifecycle of editor inputs, you should not rely on this
   * method, rather refer to the listeners on `IEditorGroup` via `IEditorGroupsService`.
   */
  clearInput() {
    this._input = void 0;
    this._options = void 0;
  }
  /**
   * Note: Clients should not call this method, the workbench calls this
   * method. Calling it otherwise may result in unexpected behavior.
   *
   * Sets the given options to the editor. Clients should apply the options
   * to the current input.
   */
  setOptions(options3) {
    this._options = options3;
  }
  setVisible(visible) {
    super.setVisible(visible);
    this.setEditorVisible(visible);
  }
  /**
   * Indicates that the editor control got visible or hidden.
   *
   * @param visible the state of visibility of this editor
   */
  setEditorVisible(visible) {
  }
  setBoundarySashes(_sashes) {
  }
  getEditorMemento(editorGroupService, configurationService, key3, limit = 10) {
    const mementoKey = `${this.getId()}${key3}`;
    let editorMemento = _EditorPane.EDITOR_MEMENTOS.get(mementoKey);
    if (!editorMemento) {
      editorMemento = this._register(new EditorMemento(this.getId(), key3, this.getMemento(1 /* WORKSPACE */, 1 /* MACHINE */), limit, editorGroupService, configurationService));
      _EditorPane.EDITOR_MEMENTOS.set(mementoKey, editorMemento);
    }
    return editorMemento;
  }
  getViewState() {
    return void 0;
  }
  saveState() {
    for (const [, editorMemento] of _EditorPane.EDITOR_MEMENTOS) {
      if (editorMemento.id === this.getId()) {
        editorMemento.saveState();
      }
    }
    super.saveState();
  }
  dispose() {
    this._input = void 0;
    this._options = void 0;
    super.dispose();
  }
};

var EditorMemento = class _EditorMemento extends Disposable {
  constructor(id2, key3, memento, limit, editorGroupService, configurationService) {
    super();
    this.id = id2;
    this.key = key3;
    this.memento = memento;
    this.limit = limit;
    this.editorGroupService = editorGroupService;
    this.configurationService = configurationService;
    this.cleanedUp = false;
    this.shareEditorState = false;
    this.updateConfiguration(void 0);
    this.registerListeners();
  }
  static {
    this.SHARED_EDITOR_STATE = -1;
  }
  registerListeners() {
    this._register(this.configurationService.onDidChangeConfiguration((e) => this.updateConfiguration(e)));
  }
  updateConfiguration(e) {
    if (!e || e.affectsConfiguration(void 0, "workbench.editor.sharedViewState")) {
      this.shareEditorState = this.configurationService.getValue(void 0, "workbench.editor.sharedViewState") === true;
    }
  }
  saveEditorState(group2, resourceOrEditor, state) {
    const resource = this.doGetResource(resourceOrEditor);
    if (!resource || !group2) {
      return;
    }
    const cache2 = this.doLoad();
    let mementosForResource = cache2.get(resource.toString());
    if (!mementosForResource) {
      mementosForResource = /* @__PURE__ */ Object.create(null);
      cache2.set(resource.toString(), mementosForResource);
    }
    mementosForResource[group2.id] = state;
    if (this.shareEditorState) {
      mementosForResource[_EditorMemento.SHARED_EDITOR_STATE] = state;
    }
    if (isEditorInput(resourceOrEditor)) {
      this.clearEditorStateOnDispose(resource, resourceOrEditor);
    }
  }
  loadEditorState(group2, resourceOrEditor) {
    const resource = this.doGetResource(resourceOrEditor);
    if (!resource || !group2) {
      return;
    }
    const cache2 = this.doLoad();
    const mementosForResource = cache2.get(resource.toString());
    if (mementosForResource) {
      const mementoForResourceAndGroup = mementosForResource[group2.id];
      if (mementoForResourceAndGroup) {
        return mementoForResourceAndGroup;
      }
      if (this.shareEditorState) {
        return mementosForResource[_EditorMemento.SHARED_EDITOR_STATE];
      }
    }
    return void 0;
  }
  clearEditorState(resourceOrEditor, group2) {
    if (isEditorInput(resourceOrEditor)) {
      this.editorDisposables?.delete(resourceOrEditor);
    }
    const resource = this.doGetResource(resourceOrEditor);
    if (resource) {
      const cache2 = this.doLoad();
      if (group2) {
        const mementosForResource = cache2.get(resource.toString());
        if (mementosForResource) {
          delete mementosForResource[group2.id];
          if (isEmptyObject(mementosForResource)) {
            cache2.delete(resource.toString());
          }
        }
      } else {
        cache2.delete(resource.toString());
      }
    }
  }
  clearEditorStateOnDispose(resource, editor) {
    if (!this.editorDisposables) {
      this.editorDisposables = /* @__PURE__ */ new Map();
    }
    if (!this.editorDisposables.has(editor)) {
      this.editorDisposables.set(editor, Event2.once(editor.onWillDispose)(() => {
        this.clearEditorState(resource);
        this.editorDisposables?.delete(editor);
      }));
    }
  }
  moveEditorState(source, target, comparer) {
    const cache2 = this.doLoad();
    const cacheKeys = [...cache2.keys()];
    for (const cacheKey2 of cacheKeys) {
      const resource = URI.parse(cacheKey2);
      if (!comparer.isEqualOrParent(resource, source)) {
        continue;
      }
      let targetResource;
      if (isEqual2(source, resource)) {
        targetResource = target;
      } else {
        const index2 = indexOfPath(resource.path, source.path);
        targetResource = joinPath(target, resource.path.substr(index2 + source.path.length + 1));
      }
      const value2 = cache2.get(cacheKey2, 0 /* None */);
      if (value2) {
        cache2.delete(cacheKey2);
        cache2.set(targetResource.toString(), value2);
      }
    }
  }
  doGetResource(resourceOrEditor) {
    if (isEditorInput(resourceOrEditor)) {
      return resourceOrEditor.resource;
    }
    return resourceOrEditor;
  }
  doLoad() {
    if (!this.cache) {
      this.cache = new LRUCache(this.limit);
      const rawEditorMemento = this.memento[this.key];
      if (Array.isArray(rawEditorMemento)) {
        this.cache.fromJSON(rawEditorMemento);
      }
    }
    return this.cache;
  }
  saveState() {
    const cache2 = this.doLoad();
    if (!this.cleanedUp) {
      this.cleanUp();
      this.cleanedUp = true;
    }
    this.memento[this.key] = cache2.toJSON();
  }
  cleanUp() {
    const cache2 = this.doLoad();
    const entries2 = [...cache2.entries()];
    for (const [resource, mapGroupToMementos] of entries2) {
      for (const group2 of Object.keys(mapGroupToMementos)) {
        const groupId = Number(group2);
        if (groupId === _EditorMemento.SHARED_EDITOR_STATE && this.shareEditorState) {
          continue;
        }
        if (!this.editorGroupService.getGroup(groupId)) {
          delete mapGroupToMementos[groupId];
          if (isEmptyObject(mapGroupToMementos)) {
            cache2.delete(resource);
          }
        }
      }
    }
  }
};
export { EditorPane, EditorMemento };
