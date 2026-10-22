// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/workingCopy/common/workingCopyFileService.ts
import { IInstantiationService, createDecorator } from "./module-0077.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { AsyncEmitter } from "./module-0017.mjs";
import { WorkingCopyFileOperationParticipant } from "./module-1073.mjs";
import { StoredFileWorkingCopySaveParticipant } from "./module-1074.mjs";
import { Promises } from "./module-0036.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { insert } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkingCopyService } from "./module-1072.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/workingCopy/common/workingCopyFileService.ts
var IWorkingCopyFileService = createDecorator("workingCopyFileService");

var WorkingCopyFileService = class extends Disposable {
  constructor(fileService, workingCopyService, instantiationService, uriIdentityService) {
    super();
    this.fileService = fileService;
    this.workingCopyService = workingCopyService;
    this.uriIdentityService = uriIdentityService;
    //#region Events
    this._onWillRunWorkingCopyFileOperation = this._register(new AsyncEmitter());
    this.onWillRunWorkingCopyFileOperation = this._onWillRunWorkingCopyFileOperation.event;
    this._onDidFailWorkingCopyFileOperation = this._register(new AsyncEmitter());
    this.onDidFailWorkingCopyFileOperation = this._onDidFailWorkingCopyFileOperation.event;
    this._onDidRunWorkingCopyFileOperation = this._register(new AsyncEmitter());
    this.onDidRunWorkingCopyFileOperation = this._onDidRunWorkingCopyFileOperation.event;
    //#endregion
    this.correlationIds = 0;
    //#endregion
    //#region Path related
    this.workingCopyProviders = [];
    this.fileOperationParticipants = this._register(instantiationService.createInstance(WorkingCopyFileOperationParticipant));
    this.saveParticipants = this._register(instantiationService.createInstance(StoredFileWorkingCopySaveParticipant));
    this._register(this.registerWorkingCopyProvider((resource) => {
      return this.workingCopyService.workingCopies.filter((workingCopy) => {
        if (this.fileService.hasProvider(resource)) {
          return this.uriIdentityService.extUri.isEqualOrParent(workingCopy.resource, resource);
        }
        return this.uriIdentityService.extUri.isEqual(workingCopy.resource, resource);
      });
    }));
  }
  //#region File operations
  create(operations, token, undoInfo) {
    return this.doCreateFileOrFolder(operations, true, token, undoInfo);
  }
  createFolder(operations, token, undoInfo) {
    return this.doCreateFileOrFolder(operations, false, token, undoInfo);
  }
  async doCreateFileOrFolder(operations, isFile2, token, undoInfo) {
    if (operations.length === 0) {
      return [];
    }
    if (isFile2) {
      const validateCreates = await Promises.settled(operations.map((operation) => this.fileService.canCreateFile(operation.resource, { overwrite: operation.overwrite })));
      const error = validateCreates.find((validateCreate) => validateCreate instanceof Error);
      if (error instanceof Error) {
        throw error;
      }
    }
    const files = operations.map((operation) => ({ target: operation.resource }));
    await this.runFileOperationParticipants(files, 0 /* CREATE */, undoInfo, token);
    const event = { correlationId: this.correlationIds++, operation: 0 /* CREATE */, files };
    await this._onWillRunWorkingCopyFileOperation.fireAsync(
      event,
      CancellationToken.None
      /* intentional: we currently only forward cancellation to participants */
    );
    let stats;
    try {
      if (isFile2) {
        stats = await Promises.settled(operations.map((operation) => this.fileService.createFile(operation.resource, operation.contents, { overwrite: operation.overwrite })));
      } else {
        stats = await Promises.settled(operations.map((operation) => this.fileService.createFolder(operation.resource)));
      }
    } catch (error) {
      await this._onDidFailWorkingCopyFileOperation.fireAsync(
        event,
        CancellationToken.None
        /* intentional: we currently only forward cancellation to participants */
      );
      throw error;
    }
    await this._onDidRunWorkingCopyFileOperation.fireAsync(
      event,
      CancellationToken.None
      /* intentional: we currently only forward cancellation to participants */
    );
    return stats;
  }
  async move(operations, token, undoInfo) {
    return this.doMoveOrCopy(operations, true, token, undoInfo);
  }
  async copy(operations, token, undoInfo) {
    return this.doMoveOrCopy(operations, false, token, undoInfo);
  }
  async doMoveOrCopy(operations, move2, token, undoInfo) {
    const stats = [];
    for (const { file: { source, target }, overwrite } of operations) {
      const validateMoveOrCopy = await (move2 ? this.fileService.canMove(source, target, overwrite) : this.fileService.canCopy(source, target, overwrite));
      if (validateMoveOrCopy instanceof Error) {
        throw validateMoveOrCopy;
      }
    }
    const files = operations.map((o) => o.file);
    await this.runFileOperationParticipants(files, move2 ? 2 /* MOVE */ : 3 /* COPY */, undoInfo, token);
    const event = { correlationId: this.correlationIds++, operation: move2 ? 2 /* MOVE */ : 3 /* COPY */, files };
    await this._onWillRunWorkingCopyFileOperation.fireAsync(
      event,
      CancellationToken.None
      /* intentional: we currently only forward cancellation to participants */
    );
    try {
      for (const { file: { source, target }, overwrite } of operations) {
        if (!this.uriIdentityService.extUri.isEqual(source, target)) {
          const dirtyWorkingCopies = move2 ? [...this.getDirty(source), ...this.getDirty(target)] : this.getDirty(target);
          await Promises.settled(dirtyWorkingCopies.map((dirtyWorkingCopy) => dirtyWorkingCopy.revert({ soft: true })));
        }
        if (move2) {
          stats.push(await this.fileService.move(source, target, overwrite));
        } else {
          stats.push(await this.fileService.copy(source, target, overwrite));
        }
      }
    } catch (error) {
      await this._onDidFailWorkingCopyFileOperation.fireAsync(
        event,
        CancellationToken.None
        /* intentional: we currently only forward cancellation to participants */
      );
      throw error;
    }
    await this._onDidRunWorkingCopyFileOperation.fireAsync(
      event,
      CancellationToken.None
      /* intentional: we currently only forward cancellation to participants */
    );
    return stats;
  }
  async delete(operations, token, undoInfo) {
    for (const operation of operations) {
      const validateDelete = await this.fileService.canDelete(operation.resource, { recursive: operation.recursive, useTrash: operation.useTrash });
      if (validateDelete instanceof Error) {
        throw validateDelete;
      }
    }
    const files = operations.map((operation) => ({ target: operation.resource }));
    await this.runFileOperationParticipants(files, 1 /* DELETE */, undoInfo, token);
    const event = { correlationId: this.correlationIds++, operation: 1 /* DELETE */, files };
    await this._onWillRunWorkingCopyFileOperation.fireAsync(
      event,
      CancellationToken.None
      /* intentional: we currently only forward cancellation to participants */
    );
    for (const operation of operations) {
      const dirtyWorkingCopies = this.getDirty(operation.resource);
      await Promises.settled(dirtyWorkingCopies.map((dirtyWorkingCopy) => dirtyWorkingCopy.revert({ soft: true })));
    }
    try {
      for (const operation of operations) {
        await this.fileService.del(operation.resource, { recursive: operation.recursive, useTrash: operation.useTrash });
      }
    } catch (error) {
      await this._onDidFailWorkingCopyFileOperation.fireAsync(
        event,
        CancellationToken.None
        /* intentional: we currently only forward cancellation to participants */
      );
      throw error;
    }
    await this._onDidRunWorkingCopyFileOperation.fireAsync(
      event,
      CancellationToken.None
      /* intentional: we currently only forward cancellation to participants */
    );
  }
  addFileOperationParticipant(participant) {
    return this.fileOperationParticipants.addFileOperationParticipant(participant);
  }
  runFileOperationParticipants(files, operation, undoInfo, token) {
    return this.fileOperationParticipants.participate(files, operation, undoInfo, token);
  }
  get hasSaveParticipants() {
    return this.saveParticipants.length > 0;
  }
  addSaveParticipant(participant) {
    return this.saveParticipants.addSaveParticipant(participant);
  }
  runSaveParticipants(workingCopy, context2, progress, token) {
    return this.saveParticipants.participate(workingCopy, context2, progress, token);
  }
  registerWorkingCopyProvider(provider) {
    const remove2 = insert(this.workingCopyProviders, provider);
    return toDisposable(remove2);
  }
  getDirty(resource) {
    const dirtyWorkingCopies = /* @__PURE__ */ new Set();
    for (const provider of this.workingCopyProviders) {
      for (const workingCopy of provider(resource)) {
        if (workingCopy.isDirty()) {
          dirtyWorkingCopies.add(workingCopy);
        }
      }
    }
    return Array.from(dirtyWorkingCopies);
  }
  //#endregion
};

WorkingCopyFileService = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IWorkingCopyService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IUriIdentityService)
], WorkingCopyFileService);

registerSingleton(IWorkingCopyFileService, WorkingCopyFileService, 1 /* Delayed */);
export { IWorkingCopyFileService, WorkingCopyFileService };
