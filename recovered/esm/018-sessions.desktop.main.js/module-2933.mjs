// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/bulkEdit/browser/opaqueEdits.ts
import { ResourceEdit } from "./module-0537.mjs";
import { isObject } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUndoRedoService } from "./module-0374.mjs";


// src/vs/workbench/contrib/bulkEdit/browser/opaqueEdits.ts
var ResourceAttachmentEdit = class _ResourceAttachmentEdit extends ResourceEdit {
  constructor(resource, undo, redo, metadata) {
    super(metadata);
    this.resource = resource;
    this.undo = undo;
    this.redo = redo;
  }
  static is(candidate) {
    if (candidate instanceof _ResourceAttachmentEdit) {
      return true;
    } else {
      return isObject(candidate) && Boolean(candidate.undo && candidate.redo);
    }
  }
  static lift(edit3) {
    if (edit3 instanceof _ResourceAttachmentEdit) {
      return edit3;
    } else {
      return new _ResourceAttachmentEdit(edit3.resource, edit3.undo, edit3.redo, edit3.metadata);
    }
  }
};

var OpaqueEdits = class {
  constructor(_undoRedoGroup, _undoRedoSource, _progress, _token, _edits, _undoRedoService) {
    this._undoRedoGroup = _undoRedoGroup;
    this._undoRedoSource = _undoRedoSource;
    this._progress = _progress;
    this._token = _token;
    this._edits = _edits;
    this._undoRedoService = _undoRedoService;
  }
  async apply() {
    const resources = [];
    for (const edit3 of this._edits) {
      if (this._token.isCancellationRequested) {
        break;
      }
      await edit3.redo();
      this._undoRedoService.pushElement({
        type: 0 /* Resource */,
        resource: edit3.resource,
        label: edit3.metadata?.label || "Custom Edit",
        code: "paste",
        undo: edit3.undo,
        redo: edit3.redo
      }, this._undoRedoGroup, this._undoRedoSource);
      this._progress.report(void 0);
      resources.push(edit3.resource);
    }
    return resources;
  }
};

OpaqueEdits = __decorateClass([
  __decorateParam(5, IUndoRedoService)
], OpaqueEdits);
export { ResourceAttachmentEdit, OpaqueEdits };
