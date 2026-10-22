// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/common/notebookEditorModel.ts
import { EditorModel } from "./module-1096.mjs";
import { Emitter } from "./module-0017.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { assertType, hasKey } from "./module-0010.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFilesConfigurationService } from "./module-0930.mjs";
import { NotebookSetting } from "./module-0909.mjs";
import { CancellationError } from "./module-0004.mjs";
import { streamToBuffer } from "./module-0038.mjs";
import { INotebookService, SimpleNotebookProviderInfo } from "./module-0926.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { INotebookLoggingService } from "./module-1395.mjs";
import { FileOperationError } from "./module-0269.mjs";


// src/vs/workbench/contrib/notebook/common/notebookEditorModel.ts
var SimpleNotebookEditorModel = class extends EditorModel {
  constructor(resource, _hasAssociatedFilePath, viewType, _workingCopyManager, scratchpad, _filesConfigurationService) {
    super();
    this.resource = resource;
    this._hasAssociatedFilePath = _hasAssociatedFilePath;
    this.viewType = viewType;
    this._workingCopyManager = _workingCopyManager;
    this._filesConfigurationService = _filesConfigurationService;
    this._onDidChangeDirty = this._register(new Emitter());
    this._onDidSave = this._register(new Emitter());
    this._onDidChangeOrphaned = this._register(new Emitter());
    this._onDidChangeReadonly = this._register(new Emitter());
    this._onDidRevertUntitled = this._register(new Emitter());
    this.onDidChangeDirty = this._onDidChangeDirty.event;
    this.onDidSave = this._onDidSave.event;
    this.onDidChangeOrphaned = this._onDidChangeOrphaned.event;
    this.onDidChangeReadonly = this._onDidChangeReadonly.event;
    this.onDidRevertUntitled = this._onDidRevertUntitled.event;
    this._workingCopyListeners = this._register(new DisposableStore());
    this.scratchPad = scratchpad;
  }
  dispose() {
    this._workingCopy?.dispose();
    super.dispose();
  }
  get notebook() {
    return this._workingCopy?.model?.notebookModel;
  }
  isResolved() {
    return Boolean(this._workingCopy?.model?.notebookModel);
  }
  async canDispose() {
    if (!this._workingCopy) {
      return true;
    }
    if (SimpleNotebookEditorModel._isStoredFileWorkingCopy(this._workingCopy)) {
      return this._workingCopyManager.stored.canDispose(this._workingCopy);
    } else {
      return true;
    }
  }
  isDirty() {
    return this._workingCopy?.isDirty() ?? false;
  }
  isModified() {
    return this._workingCopy?.isModified() ?? false;
  }
  isOrphaned() {
    return SimpleNotebookEditorModel._isStoredFileWorkingCopy(this._workingCopy) && this._workingCopy.hasState(4 /* ORPHAN */);
  }
  hasAssociatedFilePath() {
    return !SimpleNotebookEditorModel._isStoredFileWorkingCopy(this._workingCopy) && !!this._workingCopy?.hasAssociatedFilePath;
  }
  isReadonly() {
    if (SimpleNotebookEditorModel._isStoredFileWorkingCopy(this._workingCopy)) {
      return this._workingCopy?.isReadonly();
    } else {
      return this._filesConfigurationService.isReadonly(this.resource);
    }
  }
  get hasErrorState() {
    if (this._workingCopy && hasKey(this._workingCopy, { hasState: true })) {
      return this._workingCopy.hasState(5 /* ERROR */);
    }
    return false;
  }
  async revert(options3) {
    assertType(this.isResolved());
    return this._workingCopy.revert(options3);
  }
  async save(options3) {
    assertType(this.isResolved());
    return this._workingCopy.save(options3);
  }
  async load(options3) {
    if (!this._workingCopy || !this._workingCopy.model) {
      if (this.resource.scheme === Schemas.untitled) {
        if (this._hasAssociatedFilePath) {
          this._workingCopy = await this._workingCopyManager.resolve({ associatedResource: this.resource });
        } else {
          this._workingCopy = await this._workingCopyManager.resolve({ untitledResource: this.resource, isScratchpad: this.scratchPad });
        }
        this._register(this._workingCopy.onDidRevert(() => this._onDidRevertUntitled.fire()));
      } else {
        this._workingCopy = await this._workingCopyManager.resolve(this.resource, {
          limits: options3?.limits,
          reload: options3?.forceReadFromFile ? { async: false, force: true } : void 0
        });
        this._workingCopyListeners.add(this._workingCopy.onDidSave((e) => this._onDidSave.fire(e)));
        this._workingCopyListeners.add(this._workingCopy.onDidChangeOrphaned(() => this._onDidChangeOrphaned.fire()));
        this._workingCopyListeners.add(this._workingCopy.onDidChangeReadonly(() => this._onDidChangeReadonly.fire()));
      }
      this._workingCopyListeners.add(this._workingCopy.onDidChangeDirty(() => this._onDidChangeDirty.fire(), void 0));
      this._workingCopyListeners.add(this._workingCopy.onWillDispose(() => {
        this._workingCopyListeners.clear();
        this._workingCopy?.model?.dispose();
      }));
    } else {
      await this._workingCopyManager.resolve(this.resource, {
        reload: {
          async: !options3?.forceReadFromFile,
          force: options3?.forceReadFromFile
        },
        limits: options3?.limits
      });
    }
    assertType(this.isResolved());
    return this;
  }
  async saveAs(target) {
    const newWorkingCopy = await this._workingCopyManager.saveAs(this.resource, target);
    if (!newWorkingCopy) {
      return void 0;
    }
    return { resource: newWorkingCopy.resource };
  }
  static _isStoredFileWorkingCopy(candidate) {
    const isUntitled = candidate && candidate.capabilities & 2 /* Untitled */;
    return !isUntitled;
  }
};

SimpleNotebookEditorModel = __decorateClass([
  __decorateParam(5, IFilesConfigurationService)
], SimpleNotebookEditorModel);

var NotebookFileWorkingCopyModel = class extends Disposable {
  constructor(_notebookModel, _notebookService, _configurationService, _telemetryService, _notebookLogService) {
    super();
    this._notebookModel = _notebookModel;
    this._notebookService = _notebookService;
    this._configurationService = _configurationService;
    this._telemetryService = _telemetryService;
    this._notebookLogService = _notebookLogService;
    this._onDidChangeContent = this._register(new Emitter());
    this.onDidChangeContent = this._onDidChangeContent.event;
    this.configuration = void 0;
    this.onWillDispose = _notebookModel.onWillDispose.bind(_notebookModel);
    this._register(_notebookModel.onDidChangeContent((e) => {
      for (const rawEvent of e.rawEvents) {
        if (rawEvent.kind === 6 /* Initialize */) {
          continue;
        }
        if (rawEvent.transient) {
          continue;
        }
        this._onDidChangeContent.fire({
          isRedoing: false,
          //todo@rebornix forward this information from notebook model
          isUndoing: false,
          isInitial: false
          //_notebookModel.cells.length === 0 // todo@jrieken non transient metadata?
        });
        break;
      }
    }));
    const saveWithReducedCommunication = this._configurationService.getValue(NotebookSetting.remoteSaving);
    if (saveWithReducedCommunication || _notebookModel.uri.scheme === Schemas.vscodeRemote) {
      this.configuration = {
        // Intentionally pick a larger delay for triggering backups to allow auto-save
        // to complete first on the optimized save path
        backupDelay: 1e4
      };
    }
    if (saveWithReducedCommunication) {
      this.setSaveDelegate().catch((error) => this._notebookLogService.error("WorkingCopyModel", `Failed to set save delegate: ${error}`));
    }
  }
  async setSaveDelegate() {
    await this.getNotebookSerializer();
    this.save = async (options3, token) => {
      try {
        let serializer = this._notebookService.tryGetDataProviderSync(this.notebookModel.viewType)?.serializer;
        if (!serializer) {
          this._notebookLogService.info("WorkingCopyModel", "No serializer found for notebook model, checking if provider still needs to be resolved");
          serializer = await this.getNotebookSerializer().catch((error) => {
            this._notebookLogService.error("WorkingCopyModel", `Failed to get notebook serializer: ${error}`);
            this.save = void 0;
            throw new NotebookSaveError("Failed to get notebook serializer");
          });
        }
        if (token.isCancellationRequested) {
          throw new CancellationError();
        }
        const stat = await serializer.save(this._notebookModel.uri, this._notebookModel.versionId, options3, token);
        return stat;
      } catch (error) {
        if (!token.isCancellationRequested && error.name !== "Canceled") {
          const isIPynb = this._notebookModel.viewType === "jupyter-notebook" || this._notebookModel.viewType === "interactive";
          const errorMessage = getSaveErrorMessage(error);
          this._telemetryService.publicLogError2("notebook/SaveError", {
            isRemote: this._notebookModel.uri.scheme === Schemas.vscodeRemote,
            isIPyNbWorkerSerializer: isIPynb && this._configurationService.getValue("ipynb.experimental.serialization"),
            error: errorMessage
          });
        }
        throw error;
      }
    };
  }
  dispose() {
    this._notebookModel.dispose();
    super.dispose();
  }
  get notebookModel() {
    return this._notebookModel;
  }
  async snapshot(context2, token) {
    return this._notebookService.createNotebookTextDocumentSnapshot(this._notebookModel.uri, context2, token);
  }
  async update(stream, token) {
    const serializer = await this.getNotebookSerializer();
    const bytes = await streamToBuffer(stream);
    const data = await serializer.dataToNotebook(bytes);
    if (token.isCancellationRequested) {
      throw new CancellationError();
    }
    this._notebookLogService.info("WorkingCopyModel", "Notebook content updated from file system - " + this._notebookModel.uri.toString());
    this._notebookModel.reset(data.cells, data.metadata, serializer.options);
  }
  async getNotebookSerializer() {
    const info = await this._notebookService.withNotebookDataProvider(this.notebookModel.viewType);
    if (!(info instanceof SimpleNotebookProviderInfo)) {
      const message = "CANNOT open notebook with this provider";
      throw new NotebookSaveError(message);
    }
    return info.serializer;
  }
  get versionId() {
    return this._notebookModel.alternativeVersionId;
  }
  pushStackElement() {
    this._notebookModel.pushStackElement();
  }
};

var NotebookFileWorkingCopyModelFactory = class {
  constructor(_viewType, _notebookService, _configurationService, _telemetryService, _notebookLogService) {
    this._viewType = _viewType;
    this._notebookService = _notebookService;
    this._configurationService = _configurationService;
    this._telemetryService = _telemetryService;
    this._notebookLogService = _notebookLogService;
  }
  async createModel(resource, stream, token) {
    const notebookModel = this._notebookService.getNotebookTextModel(resource) ?? await this._notebookService.createNotebookTextModel(this._viewType, resource, stream);
    return new NotebookFileWorkingCopyModel(notebookModel, this._notebookService, this._configurationService, this._telemetryService, this._notebookLogService);
  }
};

NotebookFileWorkingCopyModelFactory = __decorateClass([
  __decorateParam(1, INotebookService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, ITelemetryService),
  __decorateParam(4, INotebookLoggingService)
], NotebookFileWorkingCopyModelFactory);

var NotebookSaveError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "NotebookSaveError";
  }
};

function getSaveErrorMessage(error) {
  if (error.name === "NotebookSaveError") {
    return error.message;
  } else if (error instanceof FileOperationError) {
    switch (error.fileOperationResult) {
      case 0 /* FILE_IS_DIRECTORY */:
        return "File is a directory";
      case 1 /* FILE_NOT_FOUND */:
        return "File not found";
      case 2 /* FILE_NOT_MODIFIED_SINCE */:
        return "File not modified since";
      case 3 /* FILE_MODIFIED_SINCE */:
        return "File modified since";
      case 4 /* FILE_MOVE_CONFLICT */:
        return "File move conflict";
      case 5 /* FILE_WRITE_LOCKED */:
        return "File write locked";
      case 6 /* FILE_PERMISSION_DENIED */:
        return "File permission denied";
      case 7 /* FILE_TOO_LARGE */:
        return "File too large";
      case 8 /* FILE_INVALID_PATH */:
        return "File invalid path";
      case 9 /* FILE_NOT_DIRECTORY */:
        return "File not directory";
      case 10 /* FILE_OTHER_ERROR */:
        return "File other error";
    }
  }
  return "Unknown error";
}
export { getSaveErrorMessage, SimpleNotebookEditorModel, NotebookFileWorkingCopyModel, NotebookFileWorkingCopyModelFactory, NotebookSaveError };
