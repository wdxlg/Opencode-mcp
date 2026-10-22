// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/files/common/files.ts
import { createDecorator } from "./module-0077.mjs";
import { localize } from "./module-0001.mjs";
import { Lazy } from "./module-0028.mjs";
import { TernarySearchTree } from "./module-0268.mjs";
import { URI } from "./module-0032.mjs";
import { isNumber } from "./module-0010.mjs";
import { Schemas } from "./module-0033.mjs";
import { isWeb } from "./module-0014.mjs";


// src/vs/platform/files/common/files.ts
var IFileService = createDecorator("fileService");

function isFileOpenForWriteOptions(options3) {
  return options3.create === true;
}

function hasReadWriteCapability(provider) {
  return !!(provider.capabilities & 2 /* FileReadWrite */);
}

function hasFileAppendCapability(provider) {
  return !!(provider.capabilities & 524288 /* FileAppend */);
}

function hasFileFolderCopyCapability(provider) {
  return !!(provider.capabilities & 8 /* FileFolderCopy */);
}

function hasFileCloneCapability(provider) {
  return !!(provider.capabilities & 131072 /* FileClone */);
}

function hasFileRealpathCapability(provider) {
  return !!(provider.capabilities & 262144 /* FileRealpath */);
}

function hasOpenReadWriteCloseCapability(provider) {
  return !!(provider.capabilities & 4 /* FileOpenReadWriteClose */);
}

function hasFileReadStreamCapability(provider) {
  return !!(provider.capabilities & 16 /* FileReadStream */);
}

function hasFileAtomicReadCapability(provider) {
  if (!hasReadWriteCapability(provider)) {
    return false;
  }
  return !!(provider.capabilities & 16384 /* FileAtomicRead */);
}

function hasFileAtomicWriteCapability(provider) {
  if (!hasReadWriteCapability(provider)) {
    return false;
  }
  return !!(provider.capabilities & 32768 /* FileAtomicWrite */);
}

function hasFileAtomicDeleteCapability(provider) {
  return !!(provider.capabilities & 65536 /* FileAtomicDelete */);
}

function hasReadonlyCapability(provider) {
  return !!(provider.capabilities & 2048 /* Readonly */);
}

var FileSystemProviderError = class _FileSystemProviderError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
  static create(error, code) {
    const providerError = new _FileSystemProviderError(error.toString(), code);
    markAsFileSystemProviderError(providerError, code);
    return providerError;
  }
};

function createFileSystemProviderError(error, code) {
  return FileSystemProviderError.create(error, code);
}

function ensureFileSystemProviderError(error) {
  if (!error) {
    return createFileSystemProviderError(localize(3017, null), "Unknown" /* Unknown */);
  }
  return error;
}

function markAsFileSystemProviderError(error, code) {
  error.name = code ? `${code} (FileSystemError)` : `FileSystemError`;
  return error;
}

function toFileSystemProviderErrorCode(error) {
  if (!error) {
    return "Unknown" /* Unknown */;
  }
  if (error instanceof FileSystemProviderError) {
    return error.code;
  }
  const match2 = /^(.+) \(FileSystemError\)$/.exec(error.name);
  if (!match2) {
    return "Unknown" /* Unknown */;
  }
  switch (match2[1]) {
    case "EntryExists" /* FileExists */:
      return "EntryExists" /* FileExists */;
    case "EntryIsADirectory" /* FileIsADirectory */:
      return "EntryIsADirectory" /* FileIsADirectory */;
    case "EntryNotADirectory" /* FileNotADirectory */:
      return "EntryNotADirectory" /* FileNotADirectory */;
    case "EntryNotFound" /* FileNotFound */:
      return "EntryNotFound" /* FileNotFound */;
    case "EntryTooLarge" /* FileTooLarge */:
      return "EntryTooLarge" /* FileTooLarge */;
    case "EntryWriteLocked" /* FileWriteLocked */:
      return "EntryWriteLocked" /* FileWriteLocked */;
    case "NoPermissions" /* NoPermissions */:
      return "NoPermissions" /* NoPermissions */;
    case "Unavailable" /* Unavailable */:
      return "Unavailable" /* Unavailable */;
  }
  return "Unknown" /* Unknown */;
}

function toFileOperationResult(error) {
  if (error instanceof FileOperationError) {
    return error.fileOperationResult;
  }
  switch (toFileSystemProviderErrorCode(error)) {
    case "EntryNotFound" /* FileNotFound */:
      return 1 /* FILE_NOT_FOUND */;
    case "EntryIsADirectory" /* FileIsADirectory */:
      return 0 /* FILE_IS_DIRECTORY */;
    case "EntryNotADirectory" /* FileNotADirectory */:
      return 9 /* FILE_NOT_DIRECTORY */;
    case "EntryWriteLocked" /* FileWriteLocked */:
      return 5 /* FILE_WRITE_LOCKED */;
    case "NoPermissions" /* NoPermissions */:
      return 6 /* FILE_PERMISSION_DENIED */;
    case "EntryExists" /* FileExists */:
      return 4 /* FILE_MOVE_CONFLICT */;
    case "EntryTooLarge" /* FileTooLarge */:
      return 7 /* FILE_TOO_LARGE */;
    default:
      return 10 /* FILE_OTHER_ERROR */;
  }
}

var FileOperationEvent = class {
  constructor(resource, operation, target) {
    this.resource = resource;
    this.operation = operation;
    this.target = target;
  }
  isOperation(operation) {
    return this.operation === operation;
  }
};

var FileChangesEvent = class _FileChangesEvent {
  constructor(changes, ignorePathCasing) {
    this.ignorePathCasing = ignorePathCasing;
    this.correlationId = void 0;
    this.added = new Lazy(() => {
      const added = TernarySearchTree.forUris(() => this.ignorePathCasing);
      added.fill(this.rawAdded.map((resource) => [resource, true]));
      return added;
    });
    this.updated = new Lazy(() => {
      const updated = TernarySearchTree.forUris(() => this.ignorePathCasing);
      updated.fill(this.rawUpdated.map((resource) => [resource, true]));
      return updated;
    });
    this.deleted = new Lazy(() => {
      const deleted = TernarySearchTree.forUris(() => this.ignorePathCasing);
      deleted.fill(this.rawDeleted.map((resource) => [resource, true]));
      return deleted;
    });
    /**
     * @deprecated use the `contains` or `affects` method to efficiently find
     * out if the event relates to a given resource. these methods ensure:
     * - that there is no expensive lookup needed (by using a `TernarySearchTree`)
     * - correctly handles `FileChangeType.DELETED` events
     */
    this.rawAdded = [];
    /**
    * @deprecated use the `contains` or `affects` method to efficiently find
    * out if the event relates to a given resource. these methods ensure:
    * - that there is no expensive lookup needed (by using a `TernarySearchTree`)
    * - correctly handles `FileChangeType.DELETED` events
    */
    this.rawUpdated = [];
    /**
    * @deprecated use the `contains` or `affects` method to efficiently find
    * out if the event relates to a given resource. these methods ensure:
    * - that there is no expensive lookup needed (by using a `TernarySearchTree`)
    * - correctly handles `FileChangeType.DELETED` events
    */
    this.rawDeleted = [];
    for (const change of changes) {
      switch (change.type) {
        case 1 /* ADDED */:
          this.rawAdded.push(change.resource);
          break;
        case 0 /* UPDATED */:
          this.rawUpdated.push(change.resource);
          break;
        case 2 /* DELETED */:
          this.rawDeleted.push(change.resource);
          break;
      }
      if (this.correlationId !== _FileChangesEvent.MIXED_CORRELATION) {
        if (typeof change.cId === "number") {
          if (this.correlationId === void 0) {
            this.correlationId = change.cId;
          } else if (this.correlationId !== change.cId) {
            this.correlationId = _FileChangesEvent.MIXED_CORRELATION;
          }
        } else {
          if (this.correlationId !== void 0) {
            this.correlationId = _FileChangesEvent.MIXED_CORRELATION;
          }
        }
      }
    }
  }
  static {
    this.MIXED_CORRELATION = null;
  }
  /**
   * Find out if the file change events match the provided resource.
   *
   * Note: when passing `FileChangeType.DELETED`, we consider a match
   * also when the parent of the resource got deleted.
   */
  contains(resource, ...types) {
    return this.doContains(resource, { includeChildren: false }, ...types);
  }
  /**
   * Find out if the file change events either match the provided
   * resource, or contain a child of this resource.
   */
  affects(resource, ...types) {
    return this.doContains(resource, { includeChildren: true }, ...types);
  }
  doContains(resource, options3, ...types) {
    if (!resource) {
      return false;
    }
    const hasTypesFilter = types.length > 0;
    if (!hasTypesFilter || types.includes(1 /* ADDED */)) {
      if (this.added.value.get(resource)) {
        return true;
      }
      if (options3.includeChildren && this.added.value.findSuperstr(resource)) {
        return true;
      }
    }
    if (!hasTypesFilter || types.includes(0 /* UPDATED */)) {
      if (this.updated.value.get(resource)) {
        return true;
      }
      if (options3.includeChildren && this.updated.value.findSuperstr(resource)) {
        return true;
      }
    }
    if (!hasTypesFilter || types.includes(2 /* DELETED */)) {
      if (this.deleted.value.findSubstr(resource)) {
        return true;
      }
      if (options3.includeChildren && this.deleted.value.findSuperstr(resource)) {
        return true;
      }
    }
    return false;
  }
  /**
   * Returns if this event contains added files.
   */
  gotAdded() {
    return this.rawAdded.length > 0;
  }
  /**
   * Returns if this event contains deleted files.
   */
  gotDeleted() {
    return this.rawDeleted.length > 0;
  }
  /**
   * Returns if this event contains updated files.
   */
  gotUpdated() {
    return this.rawUpdated.length > 0;
  }
  /**
   * Returns if this event contains changes that correlate to the
   * provided `correlationId`.
   *
   * File change event correlation is an advanced watch feature that
   * allows to  identify from which watch request the events originate
   * from. This correlation allows to route events specifically
   * only to the requestor and not emit them to all listeners.
   */
  correlates(correlationId) {
    return this.correlationId === correlationId;
  }
  /**
   * Figure out if the event contains changes that correlate to one
   * correlation identifier.
   *
   * File change event correlation is an advanced watch feature that
   * allows to  identify from which watch request the events originate
   * from. This correlation allows to route events specifically
   * only to the requestor and not emit them to all listeners.
   */
  hasCorrelation() {
    return typeof this.correlationId === "number";
  }
};

var FileOperationError = class extends Error {
  constructor(message, fileOperationResult, options3) {
    super(message);
    this.fileOperationResult = fileOperationResult;
    this.options = options3;
  }
};

var TooLargeFileOperationError = class extends FileOperationError {
  constructor(message, fileOperationResult, size3, options3) {
    super(message, fileOperationResult, options3);
    this.fileOperationResult = fileOperationResult;
    this.size = size3;
  }
};

var NotModifiedSinceFileOperationError = class extends FileOperationError {
  constructor(message, stat, options3) {
    super(message, 2 /* FILE_NOT_MODIFIED_SINCE */, options3);
    this.stat = stat;
  }
};

var AutoSaveConfiguration = {
  OFF: "off",
  AFTER_DELAY: "afterDelay",
  ON_FOCUS_CHANGE: "onFocusChange",
  ON_WINDOW_CHANGE: "onWindowChange"
};

var HotExitConfiguration = {
  OFF: "off",
  ON_EXIT: "onExit",
  ON_EXIT_AND_WINDOW_CLOSE: "onExitAndWindowClose"
};

var FILES_ASSOCIATIONS_CONFIG = "files.associations";

var FILES_EXCLUDE_CONFIG = "files.exclude";

var FILES_READONLY_INCLUDE_CONFIG = "files.readonlyInclude";

var FILES_READONLY_EXCLUDE_CONFIG = "files.readonlyExclude";

var FILES_READONLY_FROM_PERMISSIONS_CONFIG = "files.readonlyFromPermissions";

var FileKind = /* @__PURE__ */ ((FileKind2) => {
  FileKind2[FileKind2["FILE"] = 0] = "FILE";
  FileKind2[FileKind2["FOLDER"] = 1] = "FOLDER";
  FileKind2[FileKind2["ROOT_FOLDER"] = 2] = "ROOT_FOLDER";
  return FileKind2;
})(FileKind || {});

var ETAG_DISABLED = "";

function etag(stat) {
  if (typeof stat.size !== "number" || typeof stat.mtime !== "number") {
    return void 0;
  }
  return stat.mtime.toString(29) + stat.size.toString(31);
}

async function whenProviderRegistered(file, fileService) {
  if (fileService.hasProvider(URI.from({ scheme: file.scheme }))) {
    return;
  }
  return new Promise((resolve3) => {
    const disposable = fileService.onDidChangeFileSystemProviderRegistrations((e) => {
      if (e.scheme === file.scheme && e.added) {
        disposable.dispose();
        resolve3();
      }
    });
  });
}

var ByteSize = class _ByteSize {
  static {
    this.KB = 1024;
  }
  static {
    this.MB = _ByteSize.KB * _ByteSize.KB;
  }
  static {
    this.GB = _ByteSize.MB * _ByteSize.KB;
  }
  static {
    this.TB = _ByteSize.GB * _ByteSize.KB;
  }
  static formatSize(size3) {
    if (!isNumber(size3)) {
      size3 = 0;
    }
    if (size3 < _ByteSize.KB) {
      return localize(3012, null, size3.toFixed(0));
    }
    if (size3 < _ByteSize.MB) {
      return localize(3014, null, (size3 / _ByteSize.KB).toFixed(2));
    }
    if (size3 < _ByteSize.GB) {
      return localize(3015, null, (size3 / _ByteSize.MB).toFixed(2));
    }
    if (size3 < _ByteSize.TB) {
      return localize(3013, null, (size3 / _ByteSize.GB).toFixed(2));
    }
    return localize(3016, null, (size3 / _ByteSize.TB).toFixed(2));
  }
};

function getLargeFileConfirmationLimit(arg) {
  const isRemote = typeof arg === "string" || arg?.scheme === Schemas.vscodeRemote;
  const isLocal = typeof arg !== "string" && arg?.scheme === Schemas.file;
  if (isLocal) {
    return 1024 * ByteSize.MB;
  }
  if (isRemote) {
    return 10 * ByteSize.MB;
  }
  if (isWeb) {
    return 50 * ByteSize.MB;
  }
  return 1024 * ByteSize.MB;
}
export { isFileOpenForWriteOptions, hasReadWriteCapability, hasFileAppendCapability, hasFileFolderCopyCapability, hasFileCloneCapability, hasFileRealpathCapability, hasOpenReadWriteCloseCapability, hasFileReadStreamCapability, hasFileAtomicReadCapability, hasFileAtomicWriteCapability, hasFileAtomicDeleteCapability, hasReadonlyCapability, createFileSystemProviderError, ensureFileSystemProviderError, markAsFileSystemProviderError, toFileSystemProviderErrorCode, toFileOperationResult, etag, whenProviderRegistered, getLargeFileConfirmationLimit, IFileService, FileSystemProviderError, FileOperationEvent, FileChangesEvent, FileOperationError, TooLargeFileOperationError, NotModifiedSinceFileOperationError, AutoSaveConfiguration, HotExitConfiguration, FILES_ASSOCIATIONS_CONFIG, FILES_EXCLUDE_CONFIG, FILES_READONLY_INCLUDE_CONFIG, FILES_READONLY_EXCLUDE_CONFIG, FILES_READONLY_FROM_PERMISSIONS_CONFIG, FileKind, ETAG_DISABLED, ByteSize };
