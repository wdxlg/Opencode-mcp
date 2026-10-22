// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/common/editor/filteredEditorGroupModel.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/workbench/common/editor/filteredEditorGroupModel.ts
var FilteredEditorGroupModel = class extends Disposable {
  constructor(model) {
    super();
    this.model = model;
    this._onDidModelChange = this._register(new Emitter());
    this.onDidModelChange = this._onDidModelChange.event;
    this._register(this.model.onDidModelChange((e4) => {
      const candidateOrIndex = e4.editorIndex ?? e4.editor;
      if (candidateOrIndex !== void 0) {
        if (!this.filter(candidateOrIndex)) {
          return;
        }
      }
      this._onDidModelChange.fire(e4);
    }));
  }
  get id() {
    return this.model.id;
  }
  get isLocked() {
    return this.model.isLocked;
  }
  get stickyCount() {
    return this.model.stickyCount;
  }
  get activeEditor() {
    return this.model.activeEditor && this.filter(this.model.activeEditor) ? this.model.activeEditor : null;
  }
  get previewEditor() {
    return this.model.previewEditor && this.filter(this.model.previewEditor) ? this.model.previewEditor : null;
  }
  get selectedEditors() {
    return this.model.selectedEditors.filter((e4) => this.filter(e4));
  }
  isPinned(editorOrIndex) {
    return this.model.isPinned(editorOrIndex);
  }
  isTransient(editorOrIndex) {
    return this.model.isTransient(editorOrIndex);
  }
  isSticky(editorOrIndex) {
    return this.model.isSticky(editorOrIndex);
  }
  isActive(editor) {
    return this.model.isActive(editor);
  }
  isSelected(editorOrIndex) {
    return this.model.isSelected(editorOrIndex);
  }
  isFirst(editor) {
    return this.model.isFirst(editor, this.getEditors(1 /* SEQUENTIAL */));
  }
  isLast(editor) {
    return this.model.isLast(editor, this.getEditors(1 /* SEQUENTIAL */));
  }
  getEditors(order, options3) {
    const editors = this.model.getEditors(order, options3);
    return editors.filter((e4) => this.filter(e4));
  }
  findEditor(candidate, options3) {
    const result = this.model.findEditor(candidate, options3);
    if (!result) {
      return void 0;
    }
    return this.filter(result[1]) ? result : void 0;
  }
};

var StickyEditorGroupModel = class extends FilteredEditorGroupModel {
  get count() {
    return this.model.stickyCount;
  }
  getEditors(order, options3) {
    if (options3?.excludeSticky) {
      return [];
    }
    if (order === 1 /* SEQUENTIAL */) {
      return this.model.getEditors(1 /* SEQUENTIAL */).slice(0, this.model.stickyCount);
    }
    return super.getEditors(order, options3);
  }
  isSticky(editorOrIndex) {
    return true;
  }
  getEditorByIndex(index2) {
    return index2 < this.count ? this.model.getEditorByIndex(index2) : void 0;
  }
  indexOf(editor, editors, options3) {
    const editorIndex = this.model.indexOf(editor, editors, options3);
    if (editorIndex < 0 || editorIndex >= this.model.stickyCount) {
      return -1;
    }
    return editorIndex;
  }
  contains(candidate, options3) {
    const editorIndex = this.model.indexOf(candidate, void 0, options3);
    return editorIndex >= 0 && editorIndex < this.model.stickyCount;
  }
  filter(candidateOrIndex) {
    return this.model.isSticky(candidateOrIndex);
  }
};

var UnstickyEditorGroupModel = class extends FilteredEditorGroupModel {
  get count() {
    return this.model.count - this.model.stickyCount;
  }
  get stickyCount() {
    return 0;
  }
  isSticky(editorOrIndex) {
    return false;
  }
  getEditors(order, options3) {
    if (order === 1 /* SEQUENTIAL */) {
      return this.model.getEditors(1 /* SEQUENTIAL */).slice(this.model.stickyCount);
    }
    return super.getEditors(order, options3);
  }
  getEditorByIndex(index2) {
    return index2 >= 0 ? this.model.getEditorByIndex(index2 + this.model.stickyCount) : void 0;
  }
  indexOf(editor, editors, options3) {
    const editorIndex = this.model.indexOf(editor, editors, options3);
    if (editorIndex < this.model.stickyCount || editorIndex >= this.model.count) {
      return -1;
    }
    return editorIndex - this.model.stickyCount;
  }
  contains(candidate, options3) {
    const editorIndex = this.model.indexOf(candidate, void 0, options3);
    return editorIndex >= this.model.stickyCount && editorIndex < this.model.count;
  }
  filter(candidateOrIndex) {
    return !this.model.isSticky(candidateOrIndex);
  }
};
export { FilteredEditorGroupModel, StickyEditorGroupModel, UnstickyEditorGroupModel };
