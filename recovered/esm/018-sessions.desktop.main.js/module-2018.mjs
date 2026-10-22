// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/editorTitleControl.ts
import { IThemeService, Themable } from "./module-0287.mjs";
import { DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { NoEditorTabsControl } from "./module-2016.mjs";
import { SingleEditorTabsControl } from "./module-2014.mjs";
import { MultiRowEditorControl } from "./module-2015.mjs";
import { MultiEditorTabsControl } from "./module-2007.mjs";
import { EditorHeaderControl } from "./module-2017.mjs";
import { Dimension, clearNode } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/browser/parts/editor/editorTitleControl.ts
var EditorTitleControl = class extends Themable {
  constructor(parent, editorPartsView, groupsView, groupView, model, menuIds, showHeader, instantiationService, themeService) {
    super(themeService);
    this.parent = parent;
    this.editorPartsView = editorPartsView;
    this.groupsView = groupsView;
    this.groupView = groupView;
    this.model = model;
    this.menuIds = menuIds;
    this.showHeader = showHeader;
    this.instantiationService = instantiationService;
    this.editorTabsControlDisposable = this._register(new DisposableStore());
    this.headerControlDisposable = this._register(new MutableDisposable());
    this.editorTabsControl = this.createEditorTabsControl();
    this.headerControl = this.createHeaderControl();
  }
  createEditorTabsControl() {
    let tabsControlType;
    switch (this.groupsView.partOptions.showTabs) {
      case "none":
        tabsControlType = NoEditorTabsControl;
        break;
      case "single":
        tabsControlType = SingleEditorTabsControl;
        break;
      case "multiple":
      default:
        tabsControlType = this.groupsView.partOptions.pinnedTabsOnSeparateRow ? MultiRowEditorControl : MultiEditorTabsControl;
        break;
    }
    const control = this.instantiationService.createInstance(tabsControlType, this.parent, this.editorPartsView, this.groupsView, this.groupView, this.model, this.menuIds, this.showHeader);
    return this.editorTabsControlDisposable.add(control);
  }
  createHeaderControl() {
    const control = this.instantiationService.createInstance(EditorHeaderControl, this.parent, this.groupView, this.groupsView, this.menuIds, this.showHeader);
    this.headerControlDisposable.value = control;
    return control;
  }
  openEditor(editor, options3) {
    const didChange = this.editorTabsControl.openEditor(editor, options3);
    this.handleOpenedEditors(didChange);
  }
  openEditors(editors) {
    const didChange = this.editorTabsControl.openEditors(editors);
    this.handleOpenedEditors(didChange);
  }
  handleOpenedEditors(didChange) {
    this.headerControl.handleEditorsChange(didChange);
  }
  beforeCloseEditor(editor) {
    return this.editorTabsControl.beforeCloseEditor(editor);
  }
  closeEditor(editor) {
    this.editorTabsControl.closeEditor(editor);
    this.handleClosedEditors();
  }
  closeEditors(editors) {
    this.editorTabsControl.closeEditors(editors);
    this.handleClosedEditors();
  }
  handleClosedEditors() {
    if (!this.groupView.activeEditor) {
      this.headerControl.handleEditorsChange(true);
    }
  }
  moveEditor(editor, fromIndex, targetIndex, stickyStateChange) {
    return this.editorTabsControl.moveEditor(editor, fromIndex, targetIndex, stickyStateChange);
  }
  pinEditor(editor) {
    return this.editorTabsControl.pinEditor(editor);
  }
  stickEditor(editor) {
    return this.editorTabsControl.stickEditor(editor);
  }
  unstickEditor(editor) {
    return this.editorTabsControl.unstickEditor(editor);
  }
  setActive(isActive2) {
    return this.editorTabsControl.setActive(isActive2);
  }
  updateEditorSelections() {
    this.editorTabsControl.updateEditorSelections();
  }
  updateEditorLabel(editor) {
    this.editorTabsControl.updateEditorLabel(editor);
    if (this.groupView.activeEditor === editor) {
      this.headerControl.handleEditorsChange(true);
    }
  }
  updateEditorCapabilities(editor) {
    this.editorTabsControl.updateEditorCapabilities(editor);
  }
  updateEditorDirty(editor) {
    return this.editorTabsControl.updateEditorDirty(editor);
  }
  updateOptions(oldOptions, newOptions) {
    if (oldOptions.showTabs !== newOptions.showTabs || newOptions.showTabs !== "single" && oldOptions.pinnedTabsOnSeparateRow !== newOptions.pinnedTabsOnSeparateRow) {
      this.editorTabsControlDisposable.clear();
      this.headerControlDisposable.clear();
      clearNode(this.parent);
      this.editorTabsControl = this.createEditorTabsControl();
      this.headerControl = this.createHeaderControl();
    } else {
      this.editorTabsControl.updateOptions(oldOptions, newOptions);
    }
  }
  layout(dimensions) {
    this.editorTabsControl.layout(dimensions);
    this.headerControl.layout(dimensions.container.width);
    return new Dimension(dimensions.container.width, this.getHeight().total);
  }
  getHeight() {
    const tabsControlHeight = this.editorTabsControl.getHeight();
    return {
      total: tabsControlHeight + this.headerControl.height,
      offset: tabsControlHeight
    };
  }
};

EditorTitleControl = __decorateClass([
  __decorateParam(7, IInstantiationService),
  __decorateParam(8, IThemeService)
], EditorTitleControl);
export { EditorTitleControl };
