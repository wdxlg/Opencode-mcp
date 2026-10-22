// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/files/common/files.ts
import { createDecorator } from "./module-0042.mjs";
import { localize } from "./module-0007.mjs";
import { Lazy } from "./module-0021.mjs";
import { TernarySearchTree } from "./module-0056.mjs";
import { sep } from "./module-0023.mjs";
import { startsWithIgnoreCase } from "./module-0022.mjs";
import { isNumber } from "./module-0006.mjs";


// src/vs/platform/files/common/files.ts
var IFileService = createDecorator("fileService");

function isFileOpenForWriteOptions(options) {
  return options.create === true;
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
  const match = /^(.+) \(FileSystemError\)$/.exec(error.name);
  if (!match) {
    return "Unknown" /* Unknown */;
  }
  switch (match[1]) {
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
  doContains(resource, options, ...types) {
    if (!resource) {
      return false;
    }
    const hasTypesFilter = types.length > 0;
    if (!hasTypesFilter || types.includes(1 /* ADDED */)) {
      if (this.added.value.get(resource)) {
        return true;
      }
      if (options.includeChildren && this.added.value.findSuperstr(resource)) {
        return true;
      }
    }
    if (!hasTypesFilter || types.includes(0 /* UPDATED */)) {
      if (this.updated.value.get(resource)) {
        return true;
      }
      if (options.includeChildren && this.updated.value.findSuperstr(resource)) {
        return true;
      }
    }
    if (!hasTypesFilter || types.includes(2 /* DELETED */)) {
      if (this.deleted.value.findSubstr(resource)) {
        return true;
      }
      if (options.includeChildren && this.deleted.value.findSuperstr(resource)) {
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

function isParent(path, candidate, ignoreCase) {
  if (!path || !candidate || path === candidate) {
    return false;
  }
  if (candidate.length > path.length) {
    return false;
  }
  if (candidate.charAt(candidate.length - 1) !== sep) {
    candidate += sep;
  }
  if (ignoreCase) {
    return startsWithIgnoreCase(path, candidate);
  }
  return path.indexOf(candidate) === 0;
}

var FileOperationError = class extends Error {
  constructor(message, fileOperationResult, options) {
    super(message);
    this.fileOperationResult = fileOperationResult;
    this.options = options;
  }
};

var TooLargeFileOperationError = class extends FileOperationError {
  constructor(message, fileOperationResult, size, options) {
    super(message, fileOperationResult, options);
    this.fileOperationResult = fileOperationResult;
    this.size = size;
  }
};

var NotModifiedSinceFileOperationError = class extends FileOperationError {
  constructor(message, stat, options) {
    super(message, 2 /* FILE_NOT_MODIFIED_SINCE */, options);
    this.stat = stat;
  }
};

var ETAG_DISABLED = "";

function etag(stat) {
  if (typeof stat.size !== "number" || typeof stat.mtime !== "number") {
    return void 0;
  }
  return stat.mtime.toString(29) + stat.size.toString(31);
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
  static formatSize(size) {
    if (!isNumber(size)) {
      size = 0;
    }
    if (size < _ByteSize.KB) {
      return localize(3012, null, size.toFixed(0));
    }
    if (size < _ByteSize.MB) {
      return localize(3014, null, (size / _ByteSize.KB).toFixed(2));
    }
    if (size < _ByteSize.GB) {
      return localize(3015, null, (size / _ByteSize.MB).toFixed(2));
    }
    if (size < _ByteSize.TB) {
      return localize(3013, null, (size / _ByteSize.GB).toFixed(2));
    }
    return localize(3016, null, (size / _ByteSize.TB).toFixed(2));
  }
};
export { isFileOpenForWriteOptions, hasReadWriteCapability, hasFileAppendCapability, hasFileFolderCopyCapability, hasFileCloneCapability, hasFileRealpathCapability, hasOpenReadWriteCloseCapability, hasFileReadStreamCapability, hasFileAtomicReadCapability, hasFileAtomicWriteCapability, hasFileAtomicDeleteCapability, createFileSystemProviderError, ensureFileSystemProviderError, markAsFileSystemProviderError, toFileSystemProviderErrorCode, toFileOperationResult, isParent, etag, IFileService, FileSystemProviderError, FileOperationEvent, FileChangesEvent, FileOperationError, TooLargeFileOperationError, NotModifiedSinceFileOperationError, ETAG_DISABLED, ByteSize };
