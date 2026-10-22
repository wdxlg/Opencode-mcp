// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editorWithViewState.ts
import { EditorPane } from "./module-1090.mjs";
import { DisposableMap, MutableDisposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { EditorResourceAccessor } from "./module-0926.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";


// src/vs/workbench/browser/parts/editor/editorWithViewState.ts
var AbstractEditorWithViewState = class extends EditorPane {
  constructor(id2, group2, viewStateStorageKey, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService) {
    super(id2, group2, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.textResourceConfigurationService = textResourceConfigurationService;
    this.editorService = editorService;
    this.editorGroupService = editorGroupService;
    this.groupListener = this._register(new MutableDisposable());
    this.viewState = this.getEditorMemento(editorGroupService, textResourceConfigurationService, viewStateStorageKey, 100);
  }
  setEditorVisible(visible) {
    this.groupListener.value = this.group.onWillCloseEditor((e4) => this.onWillCloseEditor(e4));
    super.setEditorVisible(visible);
  }
  onWillCloseEditor(e4) {
    const editor = e4.editor;
    if (editor === this.input) {
      this.updateEditorViewState(editor);
    }
  }
  clearInput() {
    this.updateEditorViewState(this.input);
    super.clearInput();
  }
  saveState() {
    this.updateEditorViewState(this.input);
    super.saveState();
  }
  /**
   * Persist the current input's view state now. Useful for editors that can be
   * hidden/backgrounded without being cleared or closed (e.g. when another
   * editor becomes active), where the state would otherwise only be captured
   * on close or shutdown.
   */
  saveCurrentEditorViewState() {
    this.updateEditorViewState(this.input);
  }
  updateEditorViewState(input) {
    if (!input || !this.tracksEditorViewState(input)) {
      return;
    }
    const resource = this.toEditorViewStateResource(input);
    if (!resource) {
      return;
    }
    if (!this.tracksDisposedEditorViewState()) {
      if (!this.editorViewStateDisposables) {
        this.editorViewStateDisposables = this._register(new DisposableMap());
      }
      if (!this.editorViewStateDisposables.has(input)) {
        this.editorViewStateDisposables.set(input, Event2.once(input.onWillDispose)(() => {
          this.clearEditorViewState(resource, this.group);
          this.editorViewStateDisposables?.deleteAndDispose(input);
        }));
      }
    }
    if (input.isDisposed() && !this.tracksDisposedEditorViewState() || !this.shouldRestoreEditorViewState(input) && !this.group.contains(input)) {
      this.clearEditorViewState(resource, this.group);
      this.editorViewStateDisposables?.deleteAndDispose(input);
    } else if (!input.isDisposed()) {
      this.saveEditorViewState(resource);
    }
  }
  shouldRestoreEditorViewState(input, context2) {
    if (context2?.newInGroup) {
      return this.textResourceConfigurationService.getValue(EditorResourceAccessor.getOriginalUri(input, { supportSideBySide: 1 /* PRIMARY */ }), "workbench.editor.restoreViewState") !== false;
    }
    return true;
  }
  getViewState() {
    const input = this.input;
    if (!input || !this.tracksEditorViewState(input)) {
      return;
    }
    const resource = this.toEditorViewStateResource(input);
    if (!resource) {
      return;
    }
    return this.computeEditorViewState(resource);
  }
  saveEditorViewState(resource) {
    const editorViewState = this.computeEditorViewState(resource);
    if (!editorViewState) {
      return;
    }
    this.viewState.saveEditorState(this.group, resource, editorViewState);
  }
  loadEditorViewState(input, context2) {
    if (!input) {
      return void 0;
    }
    if (!this.tracksEditorViewState(input)) {
      return void 0;
    }
    if (!this.shouldRestoreEditorViewState(input, context2)) {
      return void 0;
    }
    const resource = this.toEditorViewStateResource(input);
    if (!resource) {
      return;
    }
    return this.viewState.loadEditorState(this.group, resource);
  }
  moveEditorViewState(source, target, comparer) {
    return this.viewState.moveEditorState(source, target, comparer);
  }
  clearEditorViewState(resource, group2) {
    this.viewState.clearEditorState(resource, group2);
  }
  /**
   * Whether view state should be tracked even when the editor is
   * disposed.
   *
   * Subclasses should override this if the input can be restored
   * from the resource at a later point, e.g. if backed by files.
   */
  tracksDisposedEditorViewState() {
    return false;
  }
  //#endregion
};

AbstractEditorWithViewState = __decorateClass([
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, ITextResourceConfigurationService),
  __decorateParam(7, IThemeService),
  __decorateParam(8, IEditorService),
  __decorateParam(9, IEditorGroupsService)
], AbstractEditorWithViewState);
export { AbstractEditorWithViewState };
