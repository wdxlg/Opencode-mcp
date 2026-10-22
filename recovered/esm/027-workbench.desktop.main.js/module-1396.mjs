// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/workingCopy/common/workingCopyEditorService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0934.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/workingCopy/common/workingCopyEditorService.ts
var IWorkingCopyEditorService = createDecorator("workingCopyEditorService");

var WorkingCopyEditorService = class extends Disposable {
  constructor(editorService) {
    super();
    this.editorService = editorService;
    this._onDidRegisterHandler = this._register(new Emitter());
    this.onDidRegisterHandler = this._onDidRegisterHandler.event;
    this.handlers = /* @__PURE__ */ new Set();
  }
  registerHandler(handler) {
    this.handlers.add(handler);
    this._onDidRegisterHandler.fire(handler);
    return toDisposable(() => this.handlers.delete(handler));
  }
  findEditor(workingCopy) {
    for (const editorIdentifier of this.editorService.getEditors(0 /* MOST_RECENTLY_ACTIVE */)) {
      if (this.isOpen(workingCopy, editorIdentifier.editor)) {
        return editorIdentifier;
      }
    }
    return void 0;
  }
  isOpen(workingCopy, editor) {
    for (const handler of this.handlers) {
      if (handler.isOpen(workingCopy, editor)) {
        return true;
      }
    }
    return false;
  }
};

WorkingCopyEditorService = __decorateClass([
  __decorateParam(0, IEditorService)
], WorkingCopyEditorService);

registerSingleton(IWorkingCopyEditorService, WorkingCopyEditorService, 1 /* Delayed */);
export { IWorkingCopyEditorService, WorkingCopyEditorService };
