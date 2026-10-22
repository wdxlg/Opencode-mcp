// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalEditingService.ts
import { TERMINAL_VIEW_ID } from "./module-1174.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IViewsService } from "./module-1246.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalEditingService.ts
var TerminalEditingService = class {
  constructor(_viewsService) {
    this._viewsService = _viewsService;
  }
  getEditableData(instance2) {
    return this._editable && this._editable.instance === instance2 ? this._editable.data : void 0;
  }
  setEditable(instance2, data) {
    if (!data) {
      this._editable = void 0;
    } else {
      this._editable = { instance: instance2, data };
    }
    const pane = this._viewsService.getActiveViewWithId(TERMINAL_VIEW_ID);
    const isEditing = this.isEditable(instance2);
    pane?.terminalTabbedView?.setEditable(isEditing);
  }
  isEditable(instance2) {
    return !!this._editable && (this._editable.instance === instance2 || !instance2);
  }
  getEditingTerminal() {
    return this._editingTerminal;
  }
  setEditingTerminal(instance2) {
    this._editingTerminal = instance2;
  }
};

TerminalEditingService = __decorateClass([
  __decorateParam(0, IViewsService)
], TerminalEditingService);
export { TerminalEditingService };
