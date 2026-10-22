// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/multiRowEditorTabsControl.ts
import { Disposable } from "./module-0012.mjs";
import { StickyEditorGroupModel, UnstickyEditorGroupModel } from "./module-1571.mjs";
import { MultiEditorTabsControl } from "./module-1572.mjs";
import { Dimension } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/browser/parts/editor/multiRowEditorTabsControl.ts
var MultiRowEditorControl = class extends Disposable {
  constructor(parent, editorPartsView, groupsView, groupView, model, menuIds, breadcrumbsInHeader, instantiationService) {
    super();
    this.parent = parent;
    this.groupsView = groupsView;
    this.groupView = groupView;
    this.model = model;
    this.menuIds = menuIds;
    this.breadcrumbsInHeader = breadcrumbsInHeader;
    this.instantiationService = instantiationService;
    const stickyModel = this._register(new StickyEditorGroupModel(this.model));
    const unstickyModel = this._register(new UnstickyEditorGroupModel(this.model));
    this.stickyEditorTabsControl = this._register(this.instantiationService.createInstance(MultiEditorTabsControl, this.parent, editorPartsView, this.groupsView, this.groupView, stickyModel, this.menuIds, this.breadcrumbsInHeader));
    this.unstickyEditorTabsControl = this._register(this.instantiationService.createInstance(MultiEditorTabsControl, this.parent, editorPartsView, this.groupsView, this.groupView, unstickyModel, this.menuIds, this.breadcrumbsInHeader));
    this.handleTabBarsStateChange();
  }
  handleTabBarsStateChange() {
    this.activeControl = this.model.activeEditor ? this.getEditorTabsController(this.model.activeEditor) : void 0;
    this.handleTabBarsLayoutChange();
  }
  handleTabBarsLayoutChange() {
    if (this.groupView.count === 0) {
      return;
    }
    const hadTwoTabBars = this.parent.classList.contains("two-tab-bars");
    const hasTwoTabBars = this.groupView.count !== this.groupView.stickyCount && this.groupView.stickyCount > 0;
    this.parent.classList.toggle("two-tab-bars", hasTwoTabBars);
    if (hadTwoTabBars !== hasTwoTabBars) {
      this.groupView.relayout();
    }
  }
  didActiveControlChange() {
    return this.activeControl !== (this.model.activeEditor ? this.getEditorTabsController(this.model.activeEditor) : void 0);
  }
  getEditorTabsController(editor) {
    return this.model.isSticky(editor) ? this.stickyEditorTabsControl : this.unstickyEditorTabsControl;
  }
  openEditor(editor, options3) {
    const didActiveControlChange = this.didActiveControlChange();
    const didOpenEditorChange = this.getEditorTabsController(editor).openEditor(editor, options3);
    const didChange = didOpenEditorChange || didActiveControlChange;
    if (didChange) {
      this.handleOpenedEditors();
    }
    return didChange;
  }
  openEditors(editors) {
    const stickyEditors = editors.filter((e) => this.model.isSticky(e));
    const unstickyEditors = editors.filter((e) => !this.model.isSticky(e));
    const didActiveControlChange = this.didActiveControlChange();
    const didChangeOpenEditorsSticky = this.stickyEditorTabsControl.openEditors(stickyEditors);
    const didChangeOpenEditorsUnSticky = this.unstickyEditorTabsControl.openEditors(unstickyEditors);
    const didChange = didChangeOpenEditorsSticky || didChangeOpenEditorsUnSticky || didActiveControlChange;
    if (didChange) {
      this.handleOpenedEditors();
    }
    return didChange;
  }
  handleOpenedEditors() {
    this.handleTabBarsStateChange();
  }
  beforeCloseEditor(editor) {
    this.getEditorTabsController(editor).beforeCloseEditor(editor);
  }
  closeEditor(editor) {
    this.stickyEditorTabsControl.closeEditor(editor);
    this.unstickyEditorTabsControl.closeEditor(editor);
    this.handleClosedEditors();
  }
  closeEditors(editors) {
    const stickyEditors = editors.filter((e) => this.model.isSticky(e));
    const unstickyEditors = editors.filter((e) => !this.model.isSticky(e));
    this.stickyEditorTabsControl.closeEditors(stickyEditors);
    this.unstickyEditorTabsControl.closeEditors(unstickyEditors);
    this.handleClosedEditors();
  }
  handleClosedEditors() {
    this.handleTabBarsStateChange();
  }
  moveEditor(editor, fromIndex, targetIndex, stickyStateChange) {
    if (stickyStateChange) {
      if (this.model.isSticky(editor)) {
        this.stickyEditorTabsControl.openEditor(editor);
        this.unstickyEditorTabsControl.closeEditor(editor);
      } else {
        this.stickyEditorTabsControl.closeEditor(editor);
        this.unstickyEditorTabsControl.openEditor(editor);
      }
      this.handleTabBarsStateChange();
    } else {
      if (this.model.isSticky(editor)) {
        this.stickyEditorTabsControl.moveEditor(editor, fromIndex, targetIndex, stickyStateChange);
      } else {
        this.unstickyEditorTabsControl.moveEditor(editor, fromIndex - this.model.stickyCount, targetIndex - this.model.stickyCount, stickyStateChange);
      }
    }
  }
  pinEditor(editor) {
    this.getEditorTabsController(editor).pinEditor(editor);
  }
  stickEditor(editor) {
    this.unstickyEditorTabsControl.closeEditor(editor);
    this.stickyEditorTabsControl.openEditor(editor);
    this.handleTabBarsStateChange();
  }
  unstickEditor(editor) {
    this.stickyEditorTabsControl.closeEditor(editor);
    this.unstickyEditorTabsControl.openEditor(editor);
    this.handleTabBarsStateChange();
  }
  setActive(isActive2) {
    this.stickyEditorTabsControl.setActive(isActive2);
    this.unstickyEditorTabsControl.setActive(isActive2);
  }
  updateEditorSelections() {
    this.stickyEditorTabsControl.updateEditorSelections();
    this.unstickyEditorTabsControl.updateEditorSelections();
  }
  updateEditorLabel(editor) {
    this.getEditorTabsController(editor).updateEditorLabel(editor);
  }
  updateEditorCapabilities(editor) {
    this.getEditorTabsController(editor).updateEditorCapabilities(editor);
  }
  updateEditorDirty(editor) {
    this.getEditorTabsController(editor).updateEditorDirty(editor);
  }
  updateOptions(oldOptions, newOptions) {
    this.stickyEditorTabsControl.updateOptions(oldOptions, newOptions);
    this.unstickyEditorTabsControl.updateOptions(oldOptions, newOptions);
  }
  layout(dimensions) {
    const stickyDimensions = this.stickyEditorTabsControl.layout(dimensions);
    const unstickyAvailableDimensions = {
      container: dimensions.container,
      available: new Dimension(dimensions.available.width, dimensions.available.height - stickyDimensions.height)
    };
    const unstickyDimensions = this.unstickyEditorTabsControl.layout(unstickyAvailableDimensions);
    return new Dimension(
      dimensions.container.width,
      stickyDimensions.height + unstickyDimensions.height
    );
  }
  getHeight() {
    return this.stickyEditorTabsControl.getHeight() + this.unstickyEditorTabsControl.getHeight();
  }
  dispose() {
    this.parent.classList.toggle("two-tab-bars", false);
    super.dispose();
  }
};

MultiRowEditorControl = __decorateClass([
  __decorateParam(7, IInstantiationService)
], MultiRowEditorControl);
export { MultiRowEditorControl };
