// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/noEditorTabsControl.ts
import { EditorTabsControl } from "./module-2005.mjs";
import { Dimension } from "./module-0075.mjs";


// src/vs/workbench/browser/parts/editor/noEditorTabsControl.ts
var NoEditorTabsControl = class extends EditorTabsControl {
  constructor() {
    super(...arguments);
    this.activeEditor = null;
  }
  prepareEditorActions(editorActions) {
    return {
      primary: [],
      secondary: []
    };
  }
  prepareEditorLayoutActions() {
    return {
      primary: [],
      secondary: []
    };
  }
  openEditor(editor) {
    return this.handleOpenedEditors();
  }
  openEditors(editors) {
    return this.handleOpenedEditors();
  }
  handleOpenedEditors() {
    const didChange = this.activeEditorChanged();
    this.activeEditor = this.tabsModel.activeEditor;
    return didChange;
  }
  activeEditorChanged() {
    if (!this.activeEditor && this.tabsModel.activeEditor || // active editor changed from null => editor
    this.activeEditor && !this.tabsModel.activeEditor || // active editor changed from editor => null
    (!this.activeEditor || !this.tabsModel.isActive(this.activeEditor))) {
      return true;
    }
    return false;
  }
  beforeCloseEditor(editor) {
  }
  closeEditor(editor) {
    this.handleClosedEditors();
  }
  closeEditors(editors) {
    this.handleClosedEditors();
  }
  handleClosedEditors() {
    this.activeEditor = this.tabsModel.activeEditor;
  }
  moveEditor(editor, fromIndex, targetIndex) {
  }
  pinEditor(editor) {
  }
  stickEditor(editor) {
  }
  unstickEditor(editor) {
  }
  setActive(isActive2) {
  }
  updateEditorSelections() {
  }
  updateEditorLabel(editor) {
  }
  updateEditorCapabilities(editor) {
  }
  updateEditorDirty(editor) {
  }
  getHeight() {
    return 0;
  }
  layout(dimensions) {
    return new Dimension(dimensions.container.width, this.getHeight());
  }
};
export { NoEditorTabsControl };
