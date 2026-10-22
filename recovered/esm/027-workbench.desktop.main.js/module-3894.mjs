// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/workingCopy/common/workingCopyHistoryTracker.ts
import { Disposable } from "./module-0012.mjs";
import { GlobalIdleValue, Limiter } from "./module-0036.mjs";
import { IWorkingCopyHistoryService, MAX_PARALLEL_HISTORY_IO_OPS } from "./module-3642.mjs";
import { ResourceGlobMatcher } from "./module-0929.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { SaveSourceRegistry } from "./module-0925.mjs";
import { localize } from "./module-0001.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { isStoredFileWorkingCopySaveEvent } from "./module-1398.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkingCopyService } from "./module-1072.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IPathService } from "./module-0938.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IUndoRedoService } from "./module-0374.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IFileService } from "./module-0269.mjs";


// src/vs/workbench/services/workingCopy/common/workingCopyHistoryTracker.ts
var WorkingCopyHistoryTracker = class extends Disposable {
  constructor(workingCopyService, workingCopyHistoryService, uriIdentityService, pathService, configurationService, undoRedoService, contextService, fileService) {
    super();
    this.workingCopyService = workingCopyService;
    this.workingCopyHistoryService = workingCopyHistoryService;
    this.uriIdentityService = uriIdentityService;
    this.pathService = pathService;
    this.configurationService = configurationService;
    this.undoRedoService = undoRedoService;
    this.contextService = contextService;
    this.fileService = fileService;
    this.limiter = this._register(new Limiter(MAX_PARALLEL_HISTORY_IO_OPS));
    this.resourceExcludeMatcher = this._register(new GlobalIdleValue(() => {
      const matcher = this._register(new ResourceGlobMatcher(
        (root) => this.configurationService.getValue(WorkingCopyHistoryTracker.SETTINGS.EXCLUDES, { resource: root }),
        (event) => event.affectsConfiguration(WorkingCopyHistoryTracker.SETTINGS.EXCLUDES),
        this.contextService,
        this.configurationService
      ));
      return matcher;
    }));
    this.pendingAddHistoryEntryOperations = new ResourceMap((resource) => this.uriIdentityService.extUri.getComparisonKey(resource));
    this.workingCopyContentVersion = new ResourceMap((resource) => this.uriIdentityService.extUri.getComparisonKey(resource));
    this.historyEntryContentVersion = new ResourceMap((resource) => this.uriIdentityService.extUri.getComparisonKey(resource));
    this.registerListeners();
  }
  static {
    this.SETTINGS = {
      ENABLED: "workbench.localHistory.enabled",
      SIZE_LIMIT: "workbench.localHistory.maxFileSize",
      EXCLUDES: "workbench.localHistory.exclude"
    };
  }
  static {
    this.UNDO_REDO_SAVE_SOURCE = SaveSourceRegistry.registerSource("undoRedo.source", localize(23764, null));
  }
  registerListeners() {
    this._register(this.fileService.onDidRunOperation((e) => this.onDidRunFileOperation(e)));
    this._register(this.workingCopyService.onDidChangeContent((workingCopy) => this.onDidChangeContent(workingCopy)));
    this._register(this.workingCopyService.onDidSave((e) => this.onDidSave(e)));
  }
  async onDidRunFileOperation(e) {
    if (!this.shouldTrackHistoryFromFileOperationEvent(e)) {
      return;
    }
    const source = e.resource;
    const target = e.target.resource;
    const resources = await this.workingCopyHistoryService.moveEntries(source, target);
    for (const resource of resources) {
      const contentVersion = this.getContentVersion(resource);
      this.historyEntryContentVersion.set(resource, contentVersion);
    }
  }
  onDidChangeContent(workingCopy) {
    const contentVersionId = this.getContentVersion(workingCopy.resource);
    this.workingCopyContentVersion.set(workingCopy.resource, contentVersionId + 1);
  }
  getContentVersion(resource) {
    return this.workingCopyContentVersion.get(resource) || 0;
  }
  onDidSave(e) {
    if (!this.shouldTrackHistoryFromSaveEvent(e)) {
      return;
    }
    const contentVersion = this.getContentVersion(e.workingCopy.resource);
    if (this.historyEntryContentVersion.get(e.workingCopy.resource) === contentVersion) {
      return;
    }
    this.pendingAddHistoryEntryOperations.get(e.workingCopy.resource)?.dispose(true);
    const cts = new CancellationTokenSource();
    this.pendingAddHistoryEntryOperations.set(e.workingCopy.resource, cts);
    this.limiter.queue(async () => {
      if (cts.token.isCancellationRequested) {
        return;
      }
      const contentVersion2 = this.getContentVersion(e.workingCopy.resource);
      let source = e.source;
      if (!e.source) {
        source = this.resolveSourceFromUndoRedo(e);
      }
      await this.workingCopyHistoryService.addEntry({ resource: e.workingCopy.resource, source, timestamp: e.stat.mtime }, cts.token);
      this.historyEntryContentVersion.set(e.workingCopy.resource, contentVersion2);
      if (cts.token.isCancellationRequested) {
        return;
      }
      this.pendingAddHistoryEntryOperations.delete(e.workingCopy.resource);
    });
  }
  resolveSourceFromUndoRedo(e) {
    const lastStackElement = this.undoRedoService.getLastElement(e.workingCopy.resource);
    if (lastStackElement) {
      if (lastStackElement.code === "undoredo.textBufferEdit") {
        return void 0;
      }
      return lastStackElement.label;
    }
    const allStackElements = this.undoRedoService.getElements(e.workingCopy.resource);
    if (allStackElements.future.length > 0 || allStackElements.past.length > 0) {
      return WorkingCopyHistoryTracker.UNDO_REDO_SAVE_SOURCE;
    }
    return void 0;
  }
  shouldTrackHistoryFromSaveEvent(e) {
    if (!isStoredFileWorkingCopySaveEvent(e)) {
      return false;
    }
    return this.shouldTrackHistory(e.workingCopy.resource, e.stat);
  }
  shouldTrackHistoryFromFileOperationEvent(e) {
    if (!e.isOperation(2 /* MOVE */)) {
      return false;
    }
    return this.shouldTrackHistory(e.target.resource, e.target);
  }
  shouldTrackHistory(resource, stat) {
    if (resource.scheme !== this.pathService.defaultUriScheme && // track history for all workspace resources
    resource.scheme !== Schemas.vscodeUserData && // track history for all settings
    resource.scheme !== Schemas.inMemory) {
      return false;
    }
    const configuredMaxFileSizeInBytes = 1024 * this.configurationService.getValue(WorkingCopyHistoryTracker.SETTINGS.SIZE_LIMIT, { resource });
    if (stat.size > configuredMaxFileSizeInBytes) {
      return false;
    }
    if (this.configurationService.getValue(WorkingCopyHistoryTracker.SETTINGS.ENABLED, { resource }) === false) {
      return false;
    }
    return !this.resourceExcludeMatcher.value.matches(resource);
  }
};

WorkingCopyHistoryTracker = __decorateClass([
  __decorateParam(0, IWorkingCopyService),
  __decorateParam(1, IWorkingCopyHistoryService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, IPathService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IUndoRedoService),
  __decorateParam(6, IWorkspaceContextService),
  __decorateParam(7, IFileService)
], WorkingCopyHistoryTracker);
export { WorkingCopyHistoryTracker };
