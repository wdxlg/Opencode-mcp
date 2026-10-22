// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/bulkEdit/browser/bulkEditService.ts
import { IBulkEditService, ResourceFileEdit, ResourceTextEdit } from "./module-0537.mjs";
import { BulkCellEdits, ResourceNotebookCellEdit } from "./module-0942.mjs";
import { OpaqueEdits, ResourceAttachmentEdit } from "./module-3102.mjs";
import { ResourceMap, ResourceSet } from "./module-0008.mjs";
import { localize } from "./module-0001.mjs";
import { BulkFileEdits } from "./module-3100.mjs";
import { BulkTextEdits } from "./module-3101.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { LinkedList } from "./module-0013.mjs";
import { toDisposable } from "./module-0012.mjs";
import { isCodeEditor, isDiffEditor } from "./module-0223.mjs";
import { UndoRedoGroup } from "./module-0374.mjs";
import { Progress } from "./module-0446.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { IEditorService } from "./module-0934.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IWorkingCopyService } from "./module-1072.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";


// src/vs/workbench/contrib/bulkEdit/browser/bulkEditService.ts
function liftEdits(edits) {
  return edits.map((edit3) => {
    if (ResourceTextEdit.is(edit3)) {
      return ResourceTextEdit.lift(edit3);
    }
    if (ResourceFileEdit.is(edit3)) {
      return ResourceFileEdit.lift(edit3);
    }
    if (ResourceNotebookCellEdit.is(edit3)) {
      return ResourceNotebookCellEdit.lift(edit3);
    }
    if (ResourceAttachmentEdit.is(edit3)) {
      return ResourceAttachmentEdit.lift(edit3);
    }
    throw new Error("Unsupported edit");
  });
}

var BulkEdit = class {
  constructor(_label, _code, _editor, _progress, _token, _edits, _undoRedoGroup, _undoRedoSource, _confirmBeforeUndo, _instaService, _logService) {
    this._label = _label;
    this._code = _code;
    this._editor = _editor;
    this._progress = _progress;
    this._token = _token;
    this._edits = _edits;
    this._undoRedoGroup = _undoRedoGroup;
    this._undoRedoSource = _undoRedoSource;
    this._confirmBeforeUndo = _confirmBeforeUndo;
    this._instaService = _instaService;
    this._logService = _logService;
  }
  ariaMessage() {
    const otherResources = new ResourceMap();
    const textEditResources = new ResourceMap();
    let textEditCount = 0;
    for (const edit3 of this._edits) {
      if (edit3 instanceof ResourceTextEdit) {
        textEditCount += 1;
        textEditResources.set(edit3.resource, true);
      } else if (edit3 instanceof ResourceFileEdit) {
        otherResources.set(edit3.oldResource ?? edit3.newResource, true);
      }
    }
    if (this._edits.length === 0) {
      return localize(8326, null);
    } else if (otherResources.size === 0) {
      if (textEditCount > 1 && textEditResources.size > 1) {
        return localize(8328, null, textEditCount, textEditResources.size);
      } else {
        return localize(8327, null, textEditCount);
      }
    } else {
      return localize(8329, null, textEditCount, textEditResources.size, otherResources.size);
    }
  }
  async perform(reason) {
    if (this._edits.length === 0) {
      return [];
    }
    const ranges = [1];
    for (let i2 = 1; i2 < this._edits.length; i2++) {
      if (Object.getPrototypeOf(this._edits[i2 - 1]) === Object.getPrototypeOf(this._edits[i2])) {
        ranges[ranges.length - 1]++;
      } else {
        ranges.push(1);
      }
    }
    const increment = this._edits.length > 1 ? 0 : void 0;
    this._progress.report({ increment, total: 100 });
    const progress = { report: (_) => this._progress.report({ increment: 100 / this._edits.length }) };
    const resources = [];
    let index2 = 0;
    for (const range2 of ranges) {
      if (this._token.isCancellationRequested) {
        break;
      }
      const group2 = this._edits.slice(index2, index2 + range2);
      if (group2[0] instanceof ResourceFileEdit) {
        resources.push(await this._performFileEdits(group2, this._undoRedoGroup, this._undoRedoSource, this._confirmBeforeUndo, progress));
      } else if (group2[0] instanceof ResourceTextEdit) {
        resources.push(await this._performTextEdits(group2, this._undoRedoGroup, this._undoRedoSource, progress, reason));
      } else if (group2[0] instanceof ResourceNotebookCellEdit) {
        resources.push(await this._performCellEdits(group2, this._undoRedoGroup, this._undoRedoSource, progress));
      } else if (group2[0] instanceof ResourceAttachmentEdit) {
        resources.push(await this._performOpaqueEdits(group2, this._undoRedoGroup, this._undoRedoSource, progress));
      } else {
        console.log("UNKNOWN EDIT");
      }
      index2 = index2 + range2;
    }
    return resources.flat();
  }
  async _performFileEdits(edits, undoRedoGroup, undoRedoSource, confirmBeforeUndo, progress) {
    this._logService.debug("_performFileEdits", JSON.stringify(edits));
    const model = this._instaService.createInstance(BulkFileEdits, this._label || localize(8330, null), this._code || "undoredo.workspaceEdit", undoRedoGroup, undoRedoSource, confirmBeforeUndo, progress, this._token, edits);
    return await model.apply();
  }
  async _performTextEdits(edits, undoRedoGroup, undoRedoSource, progress, reason) {
    this._logService.debug("_performTextEdits", JSON.stringify(edits));
    const model = this._instaService.createInstance(BulkTextEdits, this._label || localize(8330, null), this._code || "undoredo.workspaceEdit", this._editor, undoRedoGroup, undoRedoSource, progress, this._token, edits);
    return await model.apply(reason);
  }
  async _performCellEdits(edits, undoRedoGroup, undoRedoSource, progress) {
    this._logService.debug("_performCellEdits", JSON.stringify(edits));
    const model = this._instaService.createInstance(BulkCellEdits, undoRedoGroup, undoRedoSource, progress, this._token, edits);
    return await model.apply();
  }
  async _performOpaqueEdits(edits, undoRedoGroup, undoRedoSource, progress) {
    this._logService.debug("_performOpaqueEdits", JSON.stringify(edits));
    const model = this._instaService.createInstance(OpaqueEdits, undoRedoGroup, undoRedoSource, progress, this._token, edits);
    return await model.apply();
  }
};

BulkEdit = __decorateClass([
  __decorateParam(9, IInstantiationService),
  __decorateParam(10, ILogService)
], BulkEdit);

var BulkEditService = class {
  constructor(_instaService, _logService, _editorService, _lifecycleService, _dialogService, _workingCopyService, _configService) {
    this._instaService = _instaService;
    this._logService = _logService;
    this._editorService = _editorService;
    this._lifecycleService = _lifecycleService;
    this._dialogService = _dialogService;
    this._workingCopyService = _workingCopyService;
    this._configService = _configService;
    this._activeUndoRedoGroups = new LinkedList();
  }
  setPreviewHandler(handler) {
    this._previewHandler = handler;
    return toDisposable(() => {
      if (this._previewHandler === handler) {
        this._previewHandler = void 0;
      }
    });
  }
  hasPreviewHandler() {
    return Boolean(this._previewHandler);
  }
  async apply(editsIn, options3) {
    let edits = liftEdits(Array.isArray(editsIn) ? editsIn : editsIn.edits);
    if (edits.length === 0) {
      return { ariaSummary: localize(8321, null), isApplied: false };
    }
    if (this._previewHandler && (options3?.showPreview || edits.some((value2) => value2.metadata?.needsConfirmation))) {
      edits = await this._previewHandler(edits, options3);
    }
    let codeEditor = options3?.editor;
    if (!codeEditor) {
      const candidate = this._editorService.activeTextEditorControl;
      if (isCodeEditor(candidate)) {
        codeEditor = candidate;
      } else if (isDiffEditor(candidate)) {
        codeEditor = candidate.getModifiedEditor();
      }
    }
    if (codeEditor && codeEditor.getOption(104 /* readOnly */)) {
      codeEditor = void 0;
    }
    let undoRedoGroup;
    let undoRedoGroupRemove = () => {
    };
    if (typeof options3?.undoRedoGroupId === "number") {
      for (const candidate of this._activeUndoRedoGroups) {
        if (candidate.id === options3.undoRedoGroupId) {
          undoRedoGroup = candidate;
          break;
        }
      }
    }
    if (!undoRedoGroup) {
      undoRedoGroup = new UndoRedoGroup();
      undoRedoGroupRemove = this._activeUndoRedoGroups.push(undoRedoGroup);
    }
    const label3 = options3?.quotableLabel || options3?.label;
    const bulkEdit = this._instaService.createInstance(
      BulkEdit,
      label3,
      options3?.code,
      codeEditor,
      options3?.progress ?? Progress.None,
      options3?.token ?? CancellationToken.None,
      edits,
      undoRedoGroup,
      options3?.undoRedoSource,
      !!options3?.confirmBeforeUndo
    );
    let listener;
    try {
      listener = this._lifecycleService.onBeforeShutdown((e) => e.veto(this._shouldVeto(label3, e.reason), "veto.blukEditService"));
      const resources = await bulkEdit.perform(options3?.reason);
      if (options3?.respectAutoSaveConfig && this._configService.getValue(autoSaveSetting) === true && resources.length > 1) {
        await this._saveAll(resources);
      }
      return { ariaSummary: bulkEdit.ariaMessage(), isApplied: edits.length > 0 };
    } catch (err) {
      this._logService.error(err);
      throw err;
    } finally {
      listener?.dispose();
      undoRedoGroupRemove();
    }
  }
  async _saveAll(resources) {
    const set = new ResourceSet(resources);
    const saves = this._workingCopyService.dirtyWorkingCopies.map(async (copy) => {
      if (set.has(copy.resource)) {
        await copy.save();
      }
    });
    const result = await Promise.allSettled(saves);
    for (const item of result) {
      if (item.status === "rejected") {
        this._logService.warn(item.reason);
      }
    }
  }
  async _shouldVeto(label3, reason) {
    let message;
    switch (reason) {
      case 1 /* CLOSE */:
        message = localize(8319, null);
        break;
      case 4 /* LOAD */:
        message = localize(8318, null);
        break;
      case 3 /* RELOAD */:
        message = localize(8325, null);
        break;
      default:
        message = isMacintosh ? localize(8323, null) : localize(8322, null);
        break;
    }
    const result = await this._dialogService.confirm({
      message,
      detail: localize(8317, null, label3 || localize(8320, null))
    });
    return !result.confirmed;
  }
};

BulkEditService = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, ILifecycleService),
  __decorateParam(4, IDialogService),
  __decorateParam(5, IWorkingCopyService),
  __decorateParam(6, IConfigurationService)
], BulkEditService);

registerSingleton(IBulkEditService, BulkEditService, 1 /* Delayed */);

var autoSaveSetting = "files.refactoring.autoSave";

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "files",
  properties: {
    [autoSaveSetting]: {
      description: localize(8324, null),
      default: true,
      type: "boolean"
    }
  }
});
export { liftEdits, BulkEdit, BulkEditService, autoSaveSetting };
