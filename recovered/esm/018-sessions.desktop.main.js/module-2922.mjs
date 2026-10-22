// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/files/browser/editors/textFileEditorTracker.ts
import { Disposable } from "./module-0012.mjs";
import { RunOnceWorker } from "./module-0036.mjs";
import { coalesce, distinct } from "./module-0007.mjs";
import { Schemas } from "./module-0033.mjs";
import { UntitledTextEditorInput } from "./module-1541.mjs";
import { FILE_EDITOR_INPUT_ID } from "./module-1534.mjs";
import { DEFAULT_EDITOR_ASSOCIATION } from "./module-0926.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0935.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { IHostService } from "./module-1118.mjs";
import { ICodeEditorService } from "./module-0078.mjs";
import { IFilesConfigurationService } from "./module-0931.mjs";
import { IWorkingCopyEditorService } from "./module-1395.mjs";


// src/vs/workbench/contrib/files/browser/editors/textFileEditorTracker.ts
var TextFileEditorTracker = class extends Disposable {
  constructor(editorService, textFileService, lifecycleService, hostService, codeEditorService, filesConfigurationService, workingCopyEditorService) {
    super();
    this.editorService = editorService;
    this.textFileService = textFileService;
    this.lifecycleService = lifecycleService;
    this.hostService = hostService;
    this.codeEditorService = codeEditorService;
    this.filesConfigurationService = filesConfigurationService;
    this.workingCopyEditorService = workingCopyEditorService;
    //#region Text File: Ensure every dirty text and untitled file is opened in an editor
    this.ensureDirtyFilesAreOpenedWorker = this._register(new RunOnceWorker((units) => this.ensureDirtyTextFilesAreOpened(units), this.getDirtyTextFileTrackerDelay()));
    this.registerListeners();
  }
  static {
    this.ID = "workbench.contrib.textFileEditorTracker";
  }
  registerListeners() {
    this._register(this.textFileService.files.onDidChangeDirty((model) => this.ensureDirtyFilesAreOpenedWorker.work(model.resource)));
    this._register(this.textFileService.files.onDidSaveError((model) => this.ensureDirtyFilesAreOpenedWorker.work(model.resource)));
    this._register(this.textFileService.untitled.onDidChangeDirty((model) => this.ensureDirtyFilesAreOpenedWorker.work(model.resource)));
    this._register(this.hostService.onDidChangeFocus((hasFocus) => hasFocus ? this.reloadVisibleTextFileEditors() : void 0));
    this._register(this.lifecycleService.onDidShutdown(() => this.dispose()));
  }
  getDirtyTextFileTrackerDelay() {
    return 800;
  }
  ensureDirtyTextFilesAreOpened(resources) {
    this.doEnsureDirtyTextFilesAreOpened(distinct(resources.filter((resource) => {
      if (!this.textFileService.isDirty(resource)) {
        return false;
      }
      const fileModel = this.textFileService.files.get(resource);
      if (fileModel?.hasState(2 /* PENDING_SAVE */)) {
        return false;
      }
      if (resource.scheme !== Schemas.untitled && !fileModel?.hasState(5 /* ERROR */) && this.filesConfigurationService.hasShortAutoSaveDelay(resource)) {
        return false;
      }
      if (this.editorService.isOpened({ resource, typeId: resource.scheme === Schemas.untitled ? UntitledTextEditorInput.ID : FILE_EDITOR_INPUT_ID, editorId: DEFAULT_EDITOR_ASSOCIATION.id })) {
        return false;
      }
      const model = fileModel ?? this.textFileService.untitled.get(resource);
      if (model && this.workingCopyEditorService.findEditor(model)) {
        return false;
      }
      return true;
    }), (resource) => resource.toString()));
  }
  doEnsureDirtyTextFilesAreOpened(resources) {
    if (!resources.length) {
      return;
    }
    this.editorService.openEditors(resources.map((resource) => ({
      resource,
      options: { inactive: true, pinned: true, preserveFocus: true }
    })));
  }
  //#endregion
  //#region Window Focus Change: Update visible code editors when focus is gained that have a known text file model
  reloadVisibleTextFileEditors() {
    distinct(
      coalesce(this.codeEditorService.listCodeEditors().map((codeEditor) => {
        const resource = codeEditor.getModel()?.uri;
        if (!resource) {
          return void 0;
        }
        const model = this.textFileService.files.get(resource);
        if (!model || model.isDirty() || !model.isResolved()) {
          return void 0;
        }
        return model;
      })),
      (model) => model.resource.toString()
    ).forEach((model) => this.textFileService.files.resolve(model.resource, { reload: { async: true } }));
  }
  //#endregion
};

TextFileEditorTracker = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, ITextFileService),
  __decorateParam(2, ILifecycleService),
  __decorateParam(3, IHostService),
  __decorateParam(4, ICodeEditorService),
  __decorateParam(5, IFilesConfigurationService),
  __decorateParam(6, IWorkingCopyEditorService)
], TextFileEditorTracker);
export { TextFileEditorTracker };
