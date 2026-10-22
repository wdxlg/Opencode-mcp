// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/workingCopy/common/fileWorkingCopyManager.ts
import { Disposable } from "./module-0012.mjs";
import { StoredFileWorkingCopyManager } from "./module-1992.mjs";
import { UntitledFileWorkingCopyManager } from "./module-1994.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { SaveSourceRegistry } from "./module-0925.mjs";
import { localize } from "./module-0001.mjs";
import { listErrorForeground } from "./module-0232.mjs";
import { Codicon } from "./module-0085.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { UntitledFileWorkingCopy } from "./module-1993.mjs";
import { basename2, dirname2, isEqual2, joinPath, toLocalResource } from "./module-0034.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { Promises } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ILogService } from "./module-0095.mjs";
import { IWorkingCopyFileService } from "./module-1075.mjs";
import { IWorkingCopyBackupService } from "./module-1121.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IDialogService, IFileDialogService } from "./module-0267.mjs";
import { IFilesConfigurationService } from "./module-0930.mjs";
import { IWorkingCopyService } from "./module-1072.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IWorkingCopyEditorService } from "./module-1396.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IElevatedFileService } from "./module-1397.mjs";
import { IPathService } from "./module-0938.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IDecorationsService } from "./module-1067.mjs";
import { IProgressService } from "./module-0446.mjs";


// src/vs/workbench/services/workingCopy/common/fileWorkingCopyManager.ts
var FileWorkingCopyManager = class extends Disposable {
  constructor(workingCopyTypeId, storedWorkingCopyModelFactory, untitledWorkingCopyModelFactory, fileService, lifecycleService, labelService, logService, workingCopyFileService, workingCopyBackupService, uriIdentityService, fileDialogService, filesConfigurationService, workingCopyService, notificationService, workingCopyEditorService, editorService, elevatedFileService, pathService, environmentService, dialogService, decorationsService, progressService) {
    super();
    this.workingCopyTypeId = workingCopyTypeId;
    this.storedWorkingCopyModelFactory = storedWorkingCopyModelFactory;
    this.untitledWorkingCopyModelFactory = untitledWorkingCopyModelFactory;
    this.fileService = fileService;
    this.logService = logService;
    this.workingCopyFileService = workingCopyFileService;
    this.uriIdentityService = uriIdentityService;
    this.fileDialogService = fileDialogService;
    this.filesConfigurationService = filesConfigurationService;
    this.pathService = pathService;
    this.environmentService = environmentService;
    this.dialogService = dialogService;
    this.decorationsService = decorationsService;
    this.stored = this._register(new StoredFileWorkingCopyManager(
      this.workingCopyTypeId,
      this.storedWorkingCopyModelFactory,
      fileService,
      lifecycleService,
      labelService,
      logService,
      workingCopyFileService,
      workingCopyBackupService,
      uriIdentityService,
      filesConfigurationService,
      workingCopyService,
      notificationService,
      workingCopyEditorService,
      editorService,
      elevatedFileService,
      progressService
    ));
    this.untitled = this._register(new UntitledFileWorkingCopyManager(
      this.workingCopyTypeId,
      this.untitledWorkingCopyModelFactory,
      async (workingCopy, options3) => {
        const result = await this.saveAs(workingCopy.resource, void 0, options3);
        return !!result;
      },
      fileService,
      labelService,
      logService,
      workingCopyBackupService,
      workingCopyService
    ));
    this.onDidCreate = Event2.any(this.stored.onDidCreate, this.untitled.onDidCreate);
    this.provideDecorations();
  }
  static {
    this.FILE_WORKING_COPY_SAVE_CREATE_SOURCE = SaveSourceRegistry.registerSource("fileWorkingCopyCreate.source", localize(23732, null));
  }
  static {
    this.FILE_WORKING_COPY_SAVE_REPLACE_SOURCE = SaveSourceRegistry.registerSource("fileWorkingCopyReplace.source", localize(23734, null));
  }
  //#region decorations
  provideDecorations() {
    const provider = this._register(new class extends Disposable {
      constructor(stored) {
        super();
        this.stored = stored;
        this.label = localize(23733, null);
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this.registerListeners();
      }
      registerListeners() {
        this._register(this.stored.onDidResolve((workingCopy) => {
          if (workingCopy.isReadonly() || workingCopy.hasState(4 /* ORPHAN */)) {
            this._onDidChange.fire([workingCopy.resource]);
          }
        }));
        this._register(this.stored.onDidRemove((workingCopyUri) => this._onDidChange.fire([workingCopyUri])));
        this._register(this.stored.onDidChangeReadonly((workingCopy) => this._onDidChange.fire([workingCopy.resource])));
        this._register(this.stored.onDidChangeOrphaned((workingCopy) => this._onDidChange.fire([workingCopy.resource])));
      }
      provideDecorations(uri5) {
        const workingCopy = this.stored.get(uri5);
        if (!workingCopy || workingCopy.isDisposed()) {
          return void 0;
        }
        const isReadonly = workingCopy.isReadonly();
        const isOrphaned = workingCopy.hasState(4 /* ORPHAN */);
        if (isReadonly && isOrphaned) {
          return {
            color: listErrorForeground,
            letter: Codicon.lockSmall,
            strikethrough: true,
            tooltip: localize(23738, null)
          };
        } else if (isReadonly) {
          return {
            letter: Codicon.lockSmall,
            tooltip: localize(23737, null)
          };
        } else if (isOrphaned) {
          return {
            color: listErrorForeground,
            strikethrough: true,
            tooltip: localize(23731, null)
          };
        }
        return void 0;
      }
    }(this.stored));
    this._register(this.decorationsService.registerDecorationsProvider(provider));
  }
  //#endregion
  //#region get / get all
  get workingCopies() {
    return [...this.stored.workingCopies, ...this.untitled.workingCopies];
  }
  get(resource) {
    return this.stored.get(resource) ?? this.untitled.get(resource);
  }
  resolve(arg1, arg2) {
    if (URI.isUri(arg1)) {
      if (arg1.scheme === Schemas.untitled) {
        return this.untitled.resolve({ untitledResource: arg1 });
      } else {
        return this.stored.resolve(arg1, arg2);
      }
    }
    return this.untitled.resolve(arg1);
  }
  //#endregion
  //#region Save
  async saveAs(source, target, options3) {
    if (!target) {
      const workingCopy = this.get(source);
      if (workingCopy instanceof UntitledFileWorkingCopy && workingCopy.hasAssociatedFilePath) {
        target = await this.suggestSavePath(source);
      } else {
        target = await this.fileDialogService.pickFileToSave(await this.suggestSavePath(options3?.suggestedTarget ?? source), options3?.availableFileSystems);
      }
    }
    if (!target) {
      return;
    }
    if (this.filesConfigurationService.isReadonly(target)) {
      const confirmed = await this.confirmMakeWriteable(target);
      if (!confirmed) {
        return;
      } else {
        this.filesConfigurationService.updateReadonly(target, false);
      }
    }
    if (this.fileService.hasProvider(source) && isEqual2(source, target)) {
      return this.doSave(source, {
        ...options3,
        force: true
        /* force to save, even if not dirty (https://github.com/microsoft/vscode/issues/99619) */
      });
    }
    if (this.fileService.hasProvider(source) && this.uriIdentityService.extUri.isEqual(source, target) && await this.fileService.exists(source)) {
      await this.workingCopyFileService.move([{ file: { source, target } }], CancellationToken.None);
      return await this.doSave(source, options3) ?? await this.doSave(target, options3);
    }
    return this.doSaveAs(source, target, options3);
  }
  async doSave(resource, options3) {
    const storedFileWorkingCopy = this.stored.get(resource);
    if (storedFileWorkingCopy) {
      const success = await storedFileWorkingCopy.save(options3);
      if (success) {
        return storedFileWorkingCopy;
      }
    }
    return void 0;
  }
  async doSaveAs(source, target, options3) {
    let sourceContents;
    const sourceWorkingCopy = this.get(source);
    if (sourceWorkingCopy?.isResolved()) {
      sourceContents = await sourceWorkingCopy.model.snapshot(1 /* Save */, CancellationToken.None);
    } else {
      sourceContents = (await this.fileService.readFileStream(source)).value;
    }
    const { targetFileExists, targetStoredFileWorkingCopy } = await this.doResolveSaveTarget(source, target);
    if (sourceWorkingCopy instanceof UntitledFileWorkingCopy && sourceWorkingCopy.hasAssociatedFilePath && targetFileExists && this.uriIdentityService.extUri.isEqual(target, toLocalResource(sourceWorkingCopy.resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme))) {
      const overwrite = await this.confirmOverwrite(target);
      if (!overwrite) {
        return void 0;
      }
    }
    await targetStoredFileWorkingCopy.model?.update(sourceContents, CancellationToken.None);
    if (!options3?.source) {
      options3 = {
        ...options3,
        source: targetFileExists ? FileWorkingCopyManager.FILE_WORKING_COPY_SAVE_REPLACE_SOURCE : FileWorkingCopyManager.FILE_WORKING_COPY_SAVE_CREATE_SOURCE
      };
    }
    const success = await targetStoredFileWorkingCopy.save({
      ...options3,
      from: source,
      force: true
      /* force to save, even if not dirty (https://github.com/microsoft/vscode/issues/99619) */
    });
    if (!success) {
      return void 0;
    }
    try {
      await sourceWorkingCopy?.revert();
    } catch (error) {
      this.logService.error(error);
    }
    if (source.scheme === Schemas.untitled) {
      this.untitled.notifyDidSave(source, target);
    }
    return targetStoredFileWorkingCopy;
  }
  async doResolveSaveTarget(source, target) {
    let targetFileExists = false;
    let targetStoredFileWorkingCopy = this.stored.get(target);
    if (targetStoredFileWorkingCopy?.isResolved()) {
      targetFileExists = true;
    } else {
      targetFileExists = await this.fileService.exists(target);
      if (!targetFileExists) {
        await this.workingCopyFileService.create([{ resource: target }], CancellationToken.None);
      }
      if (this.uriIdentityService.extUri.isEqual(source, target) && this.get(source)) {
        targetStoredFileWorkingCopy = await this.stored.resolve(source);
      } else {
        targetStoredFileWorkingCopy = await this.stored.resolve(target);
      }
    }
    return { targetFileExists, targetStoredFileWorkingCopy };
  }
  async confirmOverwrite(resource) {
    const { confirmed } = await this.dialogService.confirm({
      type: "warning",
      message: localize(23730, null, basename2(resource)),
      detail: localize(23736, null, basename2(resource), basename2(dirname2(resource))),
      primaryButton: localize(23739, null)
    });
    return confirmed;
  }
  async confirmMakeWriteable(resource) {
    const { confirmed } = await this.dialogService.confirm({
      type: "warning",
      message: localize(23728, null, basename2(resource)),
      detail: localize(23729, null),
      primaryButton: localize(23735, null)
    });
    return confirmed;
  }
  async suggestSavePath(resource) {
    if (this.fileService.hasProvider(resource)) {
      return resource;
    }
    const workingCopy = this.get(resource);
    if (workingCopy instanceof UntitledFileWorkingCopy && workingCopy.hasAssociatedFilePath) {
      return toLocalResource(resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme);
    }
    const defaultFilePath = await this.fileDialogService.defaultFilePath();
    if (workingCopy) {
      const candidatePath = joinPath(defaultFilePath, workingCopy.name);
      if (await this.pathService.hasValidBasename(candidatePath, workingCopy.name)) {
        return candidatePath;
      }
    }
    return joinPath(defaultFilePath, basename2(resource));
  }
  //#endregion
  //#region Lifecycle
  async destroy() {
    await Promises.settled([
      this.stored.destroy(),
      this.untitled.destroy()
    ]);
  }
  //#endregion
};

FileWorkingCopyManager = __decorateClass([
  __decorateParam(3, IFileService),
  __decorateParam(4, ILifecycleService),
  __decorateParam(5, ILabelService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IWorkingCopyFileService),
  __decorateParam(8, IWorkingCopyBackupService),
  __decorateParam(9, IUriIdentityService),
  __decorateParam(10, IFileDialogService),
  __decorateParam(11, IFilesConfigurationService),
  __decorateParam(12, IWorkingCopyService),
  __decorateParam(13, INotificationService),
  __decorateParam(14, IWorkingCopyEditorService),
  __decorateParam(15, IEditorService),
  __decorateParam(16, IElevatedFileService),
  __decorateParam(17, IPathService),
  __decorateParam(18, IWorkbenchEnvironmentService),
  __decorateParam(19, IDialogService),
  __decorateParam(20, IDecorationsService),
  __decorateParam(21, IProgressService)
], FileWorkingCopyManager);
export { FileWorkingCopyManager };
