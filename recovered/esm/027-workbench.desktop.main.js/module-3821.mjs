// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/workingCopy/common/workingCopyBackupService.ts
import { ResourceMap } from "./module-0008.mjs";
import { Promises, ResourceQueue } from "./module-0036.mjs";
import { deepClone, equals4 } from "./module-0098.mjs";
import { Disposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILogService } from "./module-0095.mjs";
import { VSBuffer, bufferToStream, prefixedBufferReadable, prefixedBufferStream, readableToBuffer, streamToBuffer } from "./module-0038.mjs";
import { isReadableStream, peekStream } from "./module-0037.mjs";
import { coalesce } from "./module-0007.mjs";
import { NO_TYPE_ID } from "./module-1122.mjs";
import { URI } from "./module-0032.mjs";
import { isEmptyObject } from "./module-0010.mjs";
import { joinPath } from "./module-0034.mjs";
import { Schemas } from "./module-0033.mjs";
import { hash } from "./module-0039.mjs";


// src/vs/workbench/services/workingCopy/common/workingCopyBackupService.ts
var WorkingCopyBackupsModel = class _WorkingCopyBackupsModel {
  constructor(backupRoot, fileService) {
    this.backupRoot = backupRoot;
    this.fileService = fileService;
    this.cache = new ResourceMap();
  }
  static async create(backupRoot, fileService) {
    const model = new _WorkingCopyBackupsModel(backupRoot, fileService);
    await model.resolve();
    return model;
  }
  async resolve() {
    try {
      const backupRootStat = await this.fileService.resolve(this.backupRoot);
      if (backupRootStat.children) {
        await Promises.settled(backupRootStat.children.filter((child) => child.isDirectory).map(async (backupSchemaFolder) => {
          const backupSchemaFolderStat = await this.fileService.resolve(backupSchemaFolder.resource);
          if (backupSchemaFolderStat.children) {
            for (const backupForSchema of backupSchemaFolderStat.children) {
              if (!backupForSchema.isDirectory) {
                this.add(backupForSchema.resource);
              }
            }
          }
        }));
      }
    } catch (error) {
    }
  }
  add(resource, versionId = 0, meta) {
    this.cache.set(resource, {
      versionId,
      meta: deepClone(meta)
    });
  }
  update(resource, meta) {
    const entry = this.cache.get(resource);
    if (entry) {
      entry.meta = deepClone(meta);
    }
  }
  count() {
    return this.cache.size;
  }
  has(resource, versionId, meta) {
    const entry = this.cache.get(resource);
    if (!entry) {
      return false;
    }
    if (typeof versionId === "number" && versionId !== entry.versionId) {
      return false;
    }
    if (meta && !equals4(meta, entry.meta)) {
      return false;
    }
    return true;
  }
  get() {
    return Array.from(this.cache.keys());
  }
  remove(resource) {
    this.cache.delete(resource);
  }
  clear() {
    this.cache.clear();
  }
};

var WorkingCopyBackupService = class extends Disposable {
  constructor(backupWorkspaceHome, fileService, logService) {
    super();
    this.fileService = fileService;
    this.logService = logService;
    this.impl = this._register(this.initialize(backupWorkspaceHome));
  }
  initialize(backupWorkspaceHome) {
    if (backupWorkspaceHome) {
      return new WorkingCopyBackupServiceImpl(backupWorkspaceHome, this.fileService, this.logService);
    }
    return new InMemoryWorkingCopyBackupService();
  }
  reinitialize(backupWorkspaceHome) {
    if (this.impl instanceof WorkingCopyBackupServiceImpl) {
      if (backupWorkspaceHome) {
        this.impl.initialize(backupWorkspaceHome);
      } else {
        this.impl = new InMemoryWorkingCopyBackupService();
      }
    }
  }
  hasBackupSync(identifier2, versionId, meta) {
    return this.impl.hasBackupSync(identifier2, versionId, meta);
  }
  backup(identifier2, content2, versionId, meta, token) {
    return this.impl.backup(identifier2, content2, versionId, meta, token);
  }
  discardBackup(identifier2, token) {
    return this.impl.discardBackup(identifier2, token);
  }
  discardBackups(filter2) {
    return this.impl.discardBackups(filter2);
  }
  getBackups() {
    return this.impl.getBackups();
  }
  resolve(identifier2) {
    return this.impl.resolve(identifier2);
  }
  toBackupResource(identifier2) {
    return this.impl.toBackupResource(identifier2);
  }
  joinBackups() {
    return this.impl.joinBackups();
  }
};

WorkingCopyBackupService = __decorateClass([
  __decorateParam(1, IFileService),
  __decorateParam(2, ILogService)
], WorkingCopyBackupService);

var WorkingCopyBackupServiceImpl = class extends Disposable {
  constructor(backupWorkspaceHome, fileService, logService) {
    super();
    this.backupWorkspaceHome = backupWorkspaceHome;
    this.fileService = fileService;
    this.logService = logService;
    this.ioOperationQueues = this._register(new ResourceQueue());
    this.model = void 0;
    this.initialize(backupWorkspaceHome);
  }
  static {
    this.PREAMBLE_END_MARKER = "\n";
  }
  static {
    this.PREAMBLE_END_MARKER_CHARCODE = "\n".charCodeAt(0);
  }
  static {
    this.PREAMBLE_META_SEPARATOR = " ";
  }
  static {
    // using a character that is know to be escaped in a URI as separator
    this.PREAMBLE_MAX_LENGTH = 1e4;
  }
  initialize(backupWorkspaceResource) {
    this.backupWorkspaceHome = backupWorkspaceResource;
    this.ready = this.doInitialize();
  }
  async doInitialize() {
    this.model = await WorkingCopyBackupsModel.create(this.backupWorkspaceHome, this.fileService);
    return this.model;
  }
  hasBackupSync(identifier2, versionId, meta) {
    if (!this.model) {
      return false;
    }
    const backupResource = this.toBackupResource(identifier2);
    return this.model.has(backupResource, versionId, meta);
  }
  async backup(identifier2, content2, versionId, meta, token) {
    const model = await this.ready;
    if (token?.isCancellationRequested) {
      return;
    }
    const backupResource = this.toBackupResource(identifier2);
    if (model.has(backupResource, versionId, meta)) {
      return;
    }
    return this.ioOperationQueues.queueFor(backupResource, async () => {
      if (token?.isCancellationRequested) {
        return;
      }
      if (model.has(backupResource, versionId, meta)) {
        return;
      }
      let preamble = this.createPreamble(identifier2, meta);
      if (preamble.length >= WorkingCopyBackupServiceImpl.PREAMBLE_MAX_LENGTH) {
        preamble = this.createPreamble(identifier2);
      }
      const preambleBuffer = VSBuffer.fromString(preamble);
      let backupBuffer;
      if (isReadableStream(content2)) {
        backupBuffer = prefixedBufferStream(preambleBuffer, content2);
      } else if (content2) {
        backupBuffer = prefixedBufferReadable(preambleBuffer, content2);
      } else {
        backupBuffer = VSBuffer.concat([preambleBuffer, VSBuffer.fromString("")]);
      }
      await this.fileService.writeFile(backupResource, backupBuffer);
      model.add(backupResource, versionId, meta);
    });
  }
  createPreamble(identifier2, meta) {
    return `${identifier2.resource.toString()}${WorkingCopyBackupServiceImpl.PREAMBLE_META_SEPARATOR}${JSON.stringify({ ...meta, typeId: identifier2.typeId })}${WorkingCopyBackupServiceImpl.PREAMBLE_END_MARKER}`;
  }
  async discardBackups(filter2) {
    const model = await this.ready;
    const except = filter2?.except;
    if (Array.isArray(except) && except.length > 0) {
      const exceptMap = new ResourceMap();
      for (const exceptWorkingCopy of except) {
        exceptMap.set(this.toBackupResource(exceptWorkingCopy), true);
      }
      await Promises.settled(model.get().map(async (backupResource) => {
        if (!exceptMap.has(backupResource)) {
          await this.doDiscardBackup(backupResource);
        }
      }));
    } else {
      await this.deleteIgnoreFileNotFound(this.backupWorkspaceHome);
      model.clear();
    }
  }
  discardBackup(identifier2, token) {
    const backupResource = this.toBackupResource(identifier2);
    return this.doDiscardBackup(backupResource, token);
  }
  async doDiscardBackup(backupResource, token) {
    const model = await this.ready;
    if (token?.isCancellationRequested) {
      return;
    }
    return this.ioOperationQueues.queueFor(backupResource, async () => {
      if (token?.isCancellationRequested) {
        return;
      }
      await this.deleteIgnoreFileNotFound(backupResource);
      model.remove(backupResource);
    });
  }
  async deleteIgnoreFileNotFound(backupResource) {
    try {
      await this.fileService.del(backupResource, { recursive: true });
    } catch (error) {
      if (error.fileOperationResult !== 1 /* FILE_NOT_FOUND */) {
        throw error;
      }
    }
  }
  async getBackups() {
    const model = await this.ready;
    await this.joinBackups();
    const backups = await Promise.all(model.get().map((backupResource) => this.resolveIdentifier(backupResource, model)));
    return coalesce(backups);
  }
  async resolveIdentifier(backupResource, model) {
    let res = void 0;
    await this.ioOperationQueues.queueFor(backupResource, async () => {
      if (!model.has(backupResource)) {
        return;
      }
      const backupPreamble = await this.readToMatchingString(backupResource, WorkingCopyBackupServiceImpl.PREAMBLE_END_MARKER, WorkingCopyBackupServiceImpl.PREAMBLE_MAX_LENGTH);
      if (!backupPreamble) {
        return;
      }
      const metaStartIndex = backupPreamble.indexOf(WorkingCopyBackupServiceImpl.PREAMBLE_META_SEPARATOR);
      let resourcePreamble;
      let metaPreamble;
      if (metaStartIndex > 0) {
        resourcePreamble = backupPreamble.substring(0, metaStartIndex);
        metaPreamble = backupPreamble.substr(metaStartIndex + 1);
      } else {
        resourcePreamble = backupPreamble;
        metaPreamble = void 0;
      }
      const { typeId: typeId2, meta } = this.parsePreambleMeta(metaPreamble);
      model.update(backupResource, meta);
      res = {
        typeId: typeId2 ?? NO_TYPE_ID,
        resource: URI.parse(resourcePreamble)
      };
    });
    return res;
  }
  async readToMatchingString(backupResource, matchingString, maximumBytesToRead) {
    const contents = (await this.fileService.readFile(backupResource, { length: maximumBytesToRead })).value.toString();
    const matchingStringIndex = contents.indexOf(matchingString);
    if (matchingStringIndex >= 0) {
      return contents.substr(0, matchingStringIndex);
    }
    return void 0;
  }
  async resolve(identifier2) {
    const backupResource = this.toBackupResource(identifier2);
    const model = await this.ready;
    let res = void 0;
    await this.ioOperationQueues.queueFor(backupResource, async () => {
      if (!model.has(backupResource)) {
        return;
      }
      const backupStream = await this.fileService.readFileStream(backupResource);
      const peekedBackupStream = await peekStream(backupStream.value, 1);
      const firstBackupChunk = VSBuffer.concat(peekedBackupStream.buffer);
      const preambleEndIndex = firstBackupChunk.buffer.indexOf(WorkingCopyBackupServiceImpl.PREAMBLE_END_MARKER_CHARCODE);
      if (preambleEndIndex === -1) {
        this.logService.trace(`Backup: Could not find meta end marker in ${backupResource}. The file is probably corrupt (filesize: ${backupStream.size}).`);
        return void 0;
      }
      const preambelRaw = firstBackupChunk.slice(0, preambleEndIndex).toString();
      let meta;
      const metaStartIndex = preambelRaw.indexOf(WorkingCopyBackupServiceImpl.PREAMBLE_META_SEPARATOR);
      if (metaStartIndex !== -1) {
        meta = this.parsePreambleMeta(preambelRaw.substr(metaStartIndex + 1)).meta;
      }
      model.update(backupResource, meta);
      const firstBackupChunkWithoutPreamble = firstBackupChunk.slice(preambleEndIndex + 1);
      let value2;
      if (peekedBackupStream.ended) {
        value2 = bufferToStream(firstBackupChunkWithoutPreamble);
      } else {
        value2 = prefixedBufferStream(firstBackupChunkWithoutPreamble, peekedBackupStream.stream);
      }
      res = { value: value2, meta };
    });
    return res;
  }
  parsePreambleMeta(preambleMetaRaw) {
    let typeId2 = void 0;
    let meta = void 0;
    if (preambleMetaRaw) {
      try {
        meta = JSON.parse(preambleMetaRaw);
        typeId2 = meta?.typeId;
        if (typeof meta?.typeId === "string") {
          delete meta.typeId;
          if (isEmptyObject(meta)) {
            meta = void 0;
          }
        }
      } catch (error) {
      }
    }
    return { typeId: typeId2, meta };
  }
  toBackupResource(identifier2) {
    return joinPath(this.backupWorkspaceHome, identifier2.resource.scheme, hashIdentifier(identifier2));
  }
  joinBackups() {
    return this.ioOperationQueues.whenDrained();
  }
};

WorkingCopyBackupServiceImpl = __decorateClass([
  __decorateParam(1, IFileService),
  __decorateParam(2, ILogService)
], WorkingCopyBackupServiceImpl);

var InMemoryWorkingCopyBackupService = class extends Disposable {
  constructor() {
    super(...arguments);
    this.backups = new ResourceMap();
  }
  hasBackupSync(identifier2, versionId) {
    const backupResource = this.toBackupResource(identifier2);
    return this.backups.has(backupResource);
  }
  async backup(identifier2, content2, versionId, meta, token) {
    const backupResource = this.toBackupResource(identifier2);
    this.backups.set(backupResource, {
      typeId: identifier2.typeId,
      content: content2 instanceof VSBuffer ? content2 : content2 ? isReadableStream(content2) ? await streamToBuffer(content2) : readableToBuffer(content2) : VSBuffer.fromString(""),
      meta
    });
  }
  async resolve(identifier2) {
    const backupResource = this.toBackupResource(identifier2);
    const backup = this.backups.get(backupResource);
    if (backup) {
      return { value: bufferToStream(backup.content), meta: backup.meta };
    }
    return void 0;
  }
  async getBackups() {
    return Array.from(this.backups.entries()).map(([resource, backup]) => ({ typeId: backup.typeId, resource }));
  }
  async discardBackup(identifier2) {
    this.backups.delete(this.toBackupResource(identifier2));
  }
  async discardBackups(filter2) {
    const except = filter2?.except;
    if (Array.isArray(except) && except.length > 0) {
      const exceptMap = new ResourceMap();
      for (const exceptWorkingCopy of except) {
        exceptMap.set(this.toBackupResource(exceptWorkingCopy), true);
      }
      for (const backup of await this.getBackups()) {
        if (!exceptMap.has(this.toBackupResource(backup))) {
          await this.discardBackup(backup);
        }
      }
    } else {
      this.backups.clear();
    }
  }
  toBackupResource(identifier2) {
    return URI.from({ scheme: Schemas.inMemory, path: hashIdentifier(identifier2) });
  }
  async joinBackups() {
    return;
  }
};

function hashIdentifier(identifier2) {
  let resource;
  if (identifier2.typeId.length > 0) {
    const typeIdHash = hashString(identifier2.typeId);
    if (identifier2.resource.path) {
      resource = joinPath(identifier2.resource, typeIdHash);
    } else {
      resource = identifier2.resource.with({ path: typeIdHash });
    }
  } else {
    resource = identifier2.resource;
  }
  return hashPath(resource);
}

function hashPath(resource) {
  const str = resource.scheme === Schemas.file || resource.scheme === Schemas.untitled ? resource.fsPath : resource.toString();
  return hashString(str);
}

function hashString(str) {
  return hash(str).toString(16);
}
export { hashIdentifier, hashPath, hashString, WorkingCopyBackupsModel, WorkingCopyBackupService, WorkingCopyBackupServiceImpl, InMemoryWorkingCopyBackupService };
