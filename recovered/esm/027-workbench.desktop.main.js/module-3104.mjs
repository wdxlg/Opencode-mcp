// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/bulkEdit/browser/conflicts.ts
import { ResourceMap } from "./module-0008.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ResourceFileEdit, ResourceTextEdit } from "./module-0537.mjs";
import { ResourceNotebookCellEdit } from "./module-0942.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/bulkEdit/browser/conflicts.ts
var ConflictDetector = class {
  constructor(edits, fileService, modelService, logService) {
    this._conflicts = new ResourceMap();
    this._disposables = new DisposableStore();
    this._onDidConflict = new Emitter();
    this.onDidConflict = this._onDidConflict.event;
    const _workspaceEditResources = new ResourceMap();
    for (const edit3 of edits) {
      if (edit3 instanceof ResourceTextEdit) {
        _workspaceEditResources.set(edit3.resource, true);
        if (typeof edit3.versionId === "number") {
          const model = modelService.getModel(edit3.resource);
          if (model && model.getVersionId() !== edit3.versionId) {
            this._conflicts.set(edit3.resource, true);
            this._onDidConflict.fire(this);
          }
        }
      } else if (edit3 instanceof ResourceFileEdit) {
        if (edit3.newResource) {
          _workspaceEditResources.set(edit3.newResource, true);
        } else if (edit3.oldResource) {
          _workspaceEditResources.set(edit3.oldResource, true);
        }
      } else if (edit3 instanceof ResourceNotebookCellEdit) {
        _workspaceEditResources.set(edit3.resource, true);
      } else {
        logService.warn("UNKNOWN edit type", edit3);
      }
    }
    this._disposables.add(fileService.onDidFilesChange((e) => {
      for (const uri5 of _workspaceEditResources.keys()) {
        if (!modelService.getModel(uri5) && e.contains(uri5)) {
          this._conflicts.set(uri5, true);
          this._onDidConflict.fire(this);
          break;
        }
      }
    }));
    const onDidChangeModel = (model) => {
      if (_workspaceEditResources.has(model.uri)) {
        this._conflicts.set(model.uri, true);
        this._onDidConflict.fire(this);
      }
    };
    for (const model of modelService.getModels()) {
      this._disposables.add(model.onDidChangeContent(() => onDidChangeModel(model)));
    }
  }
  dispose() {
    this._disposables.dispose();
    this._onDidConflict.dispose();
  }
  list() {
    return [...this._conflicts.keys()];
  }
  hasConflicts() {
    return this._conflicts.size > 0;
  }
};

ConflictDetector = __decorateClass([
  __decorateParam(1, IFileService),
  __decorateParam(2, IModelService),
  __decorateParam(3, ILogService)
], ConflictDetector);
export { ConflictDetector };
