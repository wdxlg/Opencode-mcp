// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/files/node/diskFileSystemProvider.ts
import { AbstractDiskFileSystemProvider } from "./module-0116.mjs";
import { Event } from "./module-0017.mjs";
import { ResourceMap } from "./module-0007.mjs";
import { basename2, dirname2, extUriBiasedIgnorePathCase, joinPath } from "./module-0026.mjs";
import { isLinux, isWindows } from "./module-0014.mjs";
import { Promises2, SymlinkSupport } from "./module-0093.mjs";
import { Barrier, retry } from "./module-0028.mjs";
import { DisposableStore, toDisposable } from "./module-0011.mjs";
import { newWriteableStream } from "./module-0032.mjs";
import { VSBuffer } from "./module-0033.mjs";
import { readFileIntoStream } from "./module-0111.mjs";
import { FileSystemProviderError, createFileSystemProviderError, isFileOpenForWriteOptions } from "./module-0044.mjs";
import { localize } from "./module-0013.mjs";
import { basename, dirname, join } from "./module-0019.mjs";
import { isEqual } from "./module-0023.mjs";
import { UniversalWatcherClient } from "./module-0122.mjs";
import { NodeJSWatcherClient } from "./module-0126.mjs";


// src/vs/platform/files/node/diskFileSystemProvider.ts
import { constants as constants2, promises as promises6 } from "fs";


// src/vs/platform/files/node/diskFileSystemProvider.ts
var DiskFileSystemProvider = class _DiskFileSystemProvider extends AbstractDiskFileSystemProvider {
  constructor() {
    super(...arguments);
    // not enabled by default because very spammy
    //#region File Capabilities
    this.onDidChangeCapabilities = Event.None;
    //#endregion
    //#region File Reading/Writing
    this.resourceLocks = new ResourceMap((resource) => extUriBiasedIgnorePathCase.getComparisonKey(resource));
    this.mapHandleToPos = /* @__PURE__ */ new Map();
    this.mapHandleToLock = /* @__PURE__ */ new Map();
    this.writeHandles = /* @__PURE__ */ new Map();
  }
  static {
    this.TRACE_LOG_RESOURCE_LOCKS = false;
  }
  get capabilities() {
    if (!this._capabilities) {
      this._capabilities = 2 /* FileReadWrite */ | 4 /* FileOpenReadWriteClose */ | 16 /* FileReadStream */ | 8 /* FileFolderCopy */ | 8192 /* FileWriteUnlock */ | 524288 /* FileAppend */ | 16384 /* FileAtomicRead */ | 32768 /* FileAtomicWrite */ | 65536 /* FileAtomicDelete */ | 131072 /* FileClone */ | 262144 /* FileRealpath */;
      if (isLinux) {
        this._capabilities |= 1024 /* PathCaseSensitive */;
      }
    }
    return this._capabilities;
  }
  //#endregion
  //#region File Metadata Resolving
  async stat(resource) {
    try {
      const { stat, symbolicLink } = await SymlinkSupport.stat(this.toFilePath(resource));
      let permissions = void 0;
      if ((stat.mode & 128) === 0) {
        permissions = 2 /* Locked */;
      }
      if (stat.mode & constants2.S_IXUSR || stat.mode & constants2.S_IXGRP || stat.mode & constants2.S_IXOTH) {
        permissions = (permissions ?? 0) | 4 /* Executable */;
      }
      return {
        type: this.toType(stat, symbolicLink),
        ctime: stat.birthtime.getTime(),
        // intentionally not using ctime here, we want the creation time
        mtime: stat.mtime.getTime(),
        size: stat.size,
        permissions
      };
    } catch (error) {
      throw this.toFileSystemProviderError(error);
    }
  }
  async statIgnoreError(resource) {
    try {
      return await this.stat(resource);
    } catch (error) {
      return void 0;
    }
  }
  async realpath(resource) {
    const filePath = this.toFilePath(resource);
    return Promises2.realpath(filePath);
  }
  async readdir(resource) {
    try {
      const children = await Promises2.readdir(this.toFilePath(resource), { withFileTypes: true });
      const result = [];
      await Promise.all(children.map(async (child) => {
        try {
          let type;
          if (child.isSymbolicLink()) {
            type = (await this.stat(joinPath(resource, child.name))).type;
          } else {
            type = this.toType(child);
          }
          result.push([child.name, type]);
        } catch (error) {
          this.logService.trace(error);
        }
      }));
      return result;
    } catch (error) {
      throw this.toFileSystemProviderError(error);
    }
  }
  toType(entry, symbolicLink) {
    let type;
    if (symbolicLink?.dangling) {
      type = 0 /* Unknown */;
    } else if (entry.isFile()) {
      type = 1 /* File */;
    } else if (entry.isDirectory()) {
      type = 2 /* Directory */;
    } else {
      type = 0 /* Unknown */;
    }
    if (symbolicLink) {
      type |= 64 /* SymbolicLink */;
    }
    return type;
  }
  async createResourceLock(resource) {
    const filePath = this.toFilePath(resource);
    this.traceLock(`[Disk FileSystemProvider]: createResourceLock() - request to acquire resource lock (${filePath})`);
    let existingLock = void 0;
    while (existingLock = this.resourceLocks.get(resource)) {
      this.traceLock(`[Disk FileSystemProvider]: createResourceLock() - waiting for resource lock to be released (${filePath})`);
      await existingLock.wait();
    }
    const newLock = new Barrier();
    this.resourceLocks.set(resource, newLock);
    this.traceLock(`[Disk FileSystemProvider]: createResourceLock() - new resource lock created (${filePath})`);
    return toDisposable(() => {
      this.traceLock(`[Disk FileSystemProvider]: createResourceLock() - resource lock dispose() (${filePath})`);
      if (this.resourceLocks.get(resource) === newLock) {
        this.traceLock(`[Disk FileSystemProvider]: createResourceLock() - resource lock removed from resource-lock map (${filePath})`);
        this.resourceLocks.delete(resource);
      }
      this.traceLock(`[Disk FileSystemProvider]: createResourceLock() - resource lock barrier open() (${filePath})`);
      newLock.open();
    });
  }
  async readFile(resource, options) {
    let lock = void 0;
    try {
      if (options?.atomic) {
        this.traceLock(`[Disk FileSystemProvider]: atomic read operation started (${this.toFilePath(resource)})`);
        lock = await this.createResourceLock(resource);
      }
      const filePath = this.toFilePath(resource);
      return await promises6.readFile(filePath);
    } catch (error) {
      throw this.toFileSystemProviderError(error);
    } finally {
      lock?.dispose();
    }
  }
  traceLock(msg) {
    if (_DiskFileSystemProvider.TRACE_LOG_RESOURCE_LOCKS) {
      this.logService.trace(msg);
    }
  }
  readFileStream(resource, opts, token) {
    const stream = newWriteableStream((data) => VSBuffer.concat(data.map((data2) => VSBuffer.wrap(data2))).buffer);
    readFileIntoStream(this, resource, stream, (data) => data.buffer, {
      ...opts,
      bufferSize: 256 * 1024
      // read into chunks of 256kb each to reduce IPC overhead
    }, token);
    return stream;
  }
  async writeFile(resource, content, opts) {
    if (opts?.atomic !== false && opts?.atomic?.postfix && await this.canWriteFileAtomic(resource)) {
      return this.doWriteFileAtomic(resource, joinPath(dirname2(resource), `${basename2(resource)}${opts.atomic.postfix}`), content, opts);
    } else {
      return this.doWriteFile(resource, content, opts);
    }
  }
  async canWriteFileAtomic(resource) {
    try {
      const filePath = this.toFilePath(resource);
      const { symbolicLink } = await SymlinkSupport.stat(filePath);
      if (symbolicLink) {
        return false;
      }
    } catch (error) {
    }
    return true;
  }
  async doWriteFileAtomic(resource, tempResource, content, opts) {
    const locks = new DisposableStore();
    try {
      locks.add(await this.createResourceLock(resource));
      locks.add(await this.createResourceLock(tempResource));
      await this.doWriteFile(
        tempResource,
        content,
        { ...opts, create: true, overwrite: true },
        true
        /* disable write lock */
      );
      try {
        await this.rename(tempResource, resource, { overwrite: true });
      } catch (error) {
        try {
          await this.delete(tempResource, { recursive: false, useTrash: false, atomic: false });
        } catch (error2) {
        }
        throw error;
      }
    } finally {
      locks.dispose();
    }
  }
  async doWriteFile(resource, content, opts, disableWriteLock) {
    let handle = void 0;
    try {
      const filePath = this.toFilePath(resource);
      if (!opts.create || !opts.overwrite) {
        const fileExists = await Promises2.exists(filePath);
        if (fileExists) {
          if (!opts.overwrite) {
            throw createFileSystemProviderError(localize(3050, null), "EntryExists" /* FileExists */);
          }
        } else {
          if (!opts.create) {
            throw createFileSystemProviderError(localize(3053, null), "EntryNotFound" /* FileNotFound */);
          }
        }
      }
      handle = await this.open(resource, { create: true, append: opts.append, unlock: opts.unlock }, disableWriteLock);
      await this.write(handle, 0, content, 0, content.byteLength);
    } catch (error) {
      throw await this.toFileSystemProviderWriteError(resource, error);
    } finally {
      if (typeof handle === "number") {
        await this.close(handle);
      }
    }
  }
  static {
    this.canFlush = true;
  }
  static configureFlushOnWrite(enabled) {
    _DiskFileSystemProvider.canFlush = enabled;
  }
  async open(resource, opts, disableWriteLock) {
    const filePath = this.toFilePath(resource);
    let lock = void 0;
    if (isFileOpenForWriteOptions(opts) && !disableWriteLock) {
      lock = await this.createResourceLock(resource);
    }
    let fd = void 0;
    try {
      if (isFileOpenForWriteOptions(opts) && opts.unlock) {
        try {
          const { stat } = await SymlinkSupport.stat(filePath);
          if (!(stat.mode & 128)) {
            await promises6.chmod(filePath, stat.mode | 128);
          }
        } catch (error) {
          if (error.code !== "ENOENT") {
            this.logService.trace(error);
          }
        }
      }
      if (isWindows && isFileOpenForWriteOptions(opts) && !opts.append) {
        try {
          fd = await Promises2.open(filePath, "r+");
          await Promises2.ftruncate(fd, 0);
        } catch (error) {
          if (error.code !== "ENOENT") {
            this.logService.trace(error);
          }
          if (typeof fd === "number") {
            try {
              await Promises2.close(fd);
            } catch (error2) {
              this.logService.trace(error2);
            }
            fd = void 0;
          }
        }
      }
      if (typeof fd !== "number") {
        fd = await Promises2.open(
          filePath,
          isFileOpenForWriteOptions(opts) ? (
            // We take `opts.create` as a hint that the file is opened for writing
            // as such we use 'w' to truncate an existing or create the
            // file otherwise. we do not allow reading.
            // If `opts.append` is true, use 'a' to append to the file.
            opts.append ? "a" : "w"
          ) : (
            // Otherwise we assume the file is opened for reading
            // as such we use 'r' to neither truncate, nor create
            // the file.
            "r"
          )
        );
      }
    } catch (error) {
      lock?.dispose();
      if (isFileOpenForWriteOptions(opts)) {
        throw await this.toFileSystemProviderWriteError(resource, error);
      } else {
        throw this.toFileSystemProviderError(error);
      }
    }
    this.mapHandleToPos.set(fd, 0);
    if (isFileOpenForWriteOptions(opts)) {
      this.writeHandles.set(fd, resource);
    }
    if (lock) {
      const previousLock = this.mapHandleToLock.get(fd);
      this.traceLock(`[Disk FileSystemProvider]: open() - storing lock for handle ${fd} (${filePath})`);
      this.mapHandleToLock.set(fd, lock);
      if (previousLock) {
        this.traceLock(`[Disk FileSystemProvider]: open() - disposing a previous lock that was still stored on same handle ${fd} (${filePath})`);
        previousLock.dispose();
      }
    }
    return fd;
  }
  async close(fd) {
    const lockForHandle = this.mapHandleToLock.get(fd);
    try {
      this.mapHandleToPos.delete(fd);
      if (this.writeHandles.delete(fd) && _DiskFileSystemProvider.canFlush) {
        try {
          await Promises2.fdatasync(fd);
        } catch (error) {
          _DiskFileSystemProvider.configureFlushOnWrite(false);
          this.logService.error(error);
        }
      }
      return await Promises2.close(fd);
    } catch (error) {
      throw this.toFileSystemProviderError(error);
    } finally {
      if (lockForHandle) {
        if (this.mapHandleToLock.get(fd) === lockForHandle) {
          this.traceLock(`[Disk FileSystemProvider]: close() - resource lock removed from handle-lock map ${fd}`);
          this.mapHandleToLock.delete(fd);
        }
        this.traceLock(`[Disk FileSystemProvider]: close() - disposing lock for handle ${fd}`);
        lockForHandle.dispose();
      }
    }
  }
  async read(fd, pos, data, offset, length) {
    const normalizedPos = this.normalizePos(fd, pos);
    let bytesRead = null;
    try {
      bytesRead = (await Promises2.read(fd, data, offset, length, normalizedPos)).bytesRead;
    } catch (error) {
      throw this.toFileSystemProviderError(error);
    } finally {
      this.updatePos(fd, normalizedPos, bytesRead);
    }
    return bytesRead;
  }
  normalizePos(fd, pos) {
    if (pos === this.mapHandleToPos.get(fd)) {
      return null;
    }
    return pos;
  }
  updatePos(fd, pos, bytesLength) {
    const lastKnownPos = this.mapHandleToPos.get(fd);
    if (typeof lastKnownPos === "number") {
      if (typeof pos === "number") {
      } else if (typeof bytesLength === "number") {
        this.mapHandleToPos.set(fd, lastKnownPos + bytesLength);
      } else {
        this.mapHandleToPos.delete(fd);
      }
    }
  }
  async write(fd, pos, data, offset, length) {
    return retry(
      () => this.doWrite(fd, pos, data, offset, length),
      100,
      3
      /* retries */
    );
  }
  async doWrite(fd, pos, data, offset, length) {
    const normalizedPos = this.normalizePos(fd, pos);
    let bytesWritten = null;
    try {
      bytesWritten = (await Promises2.write(fd, data, offset, length, normalizedPos)).bytesWritten;
    } catch (error) {
      throw await this.toFileSystemProviderWriteError(this.writeHandles.get(fd), error);
    } finally {
      this.updatePos(fd, normalizedPos, bytesWritten);
    }
    return bytesWritten;
  }
  //#endregion
  //#region Move/Copy/Delete/Create Folder
  async mkdir(resource) {
    try {
      await promises6.mkdir(this.toFilePath(resource));
    } catch (error) {
      throw this.toFileSystemProviderError(error);
    }
  }
  async delete(resource, opts) {
    try {
      const filePath = this.toFilePath(resource);
      if (opts.recursive) {
        let rmMoveToPath = void 0;
        if (opts?.atomic !== false && opts.atomic.postfix) {
          rmMoveToPath = join(dirname(filePath), `${basename(filePath)}${opts.atomic.postfix}`);
        }
        await Promises2.rm(filePath, 1 /* MOVE */, rmMoveToPath);
      } else {
        try {
          await promises6.unlink(filePath);
        } catch (unlinkError) {
          if (unlinkError.code === "EPERM" || unlinkError.code === "EISDIR") {
            let isDirectory = false;
            try {
              const { stat, symbolicLink } = await SymlinkSupport.stat(filePath);
              isDirectory = stat.isDirectory() && !symbolicLink;
            } catch (statError) {
            }
            if (isDirectory) {
              await promises6.rmdir(filePath);
            } else {
              throw unlinkError;
            }
          } else {
            throw unlinkError;
          }
        }
      }
    } catch (error) {
      throw this.toFileSystemProviderError(error);
    }
  }
  async rename(from, to, opts) {
    const fromFilePath = this.toFilePath(from);
    const toFilePath = this.toFilePath(to);
    if (fromFilePath === toFilePath) {
      return;
    }
    try {
      await this.validateMoveCopy(from, to, "move", opts.overwrite);
      await Promises2.rename(fromFilePath, toFilePath);
    } catch (error) {
      if (error.code === "EINVAL" || error.code === "EBUSY" || error.code === "ENAMETOOLONG") {
        error = new Error(localize(3054, null, basename(fromFilePath), basename(dirname(toFilePath)), error.toString()));
      }
      throw this.toFileSystemProviderError(error);
    }
  }
  async copy(from, to, opts) {
    const fromFilePath = this.toFilePath(from);
    const toFilePath = this.toFilePath(to);
    if (fromFilePath === toFilePath) {
      return;
    }
    try {
      await this.validateMoveCopy(from, to, "copy", opts.overwrite);
      await Promises2.copy(fromFilePath, toFilePath, { preserveSymlinks: true });
    } catch (error) {
      if (error.code === "EINVAL" || error.code === "EBUSY" || error.code === "ENAMETOOLONG") {
        error = new Error(localize(3048, null, basename(fromFilePath), basename(dirname(toFilePath)), error.toString()));
      }
      throw this.toFileSystemProviderError(error);
    }
  }
  async validateMoveCopy(from, to, mode, overwrite) {
    const fromFilePath = this.toFilePath(from);
    const toFilePath = this.toFilePath(to);
    let isSameResourceWithDifferentPathCase = false;
    const isPathCaseSensitive = !!(this.capabilities & 1024 /* PathCaseSensitive */);
    if (!isPathCaseSensitive) {
      isSameResourceWithDifferentPathCase = isEqual(
        fromFilePath,
        toFilePath,
        true
        /* ignore case */
      );
    }
    if (isSameResourceWithDifferentPathCase) {
      if (mode === "copy") {
        throw createFileSystemProviderError(localize(3049, null), "EntryExists" /* FileExists */);
      } else if (mode === "move") {
        return;
      }
    }
    const fromStat = await this.statIgnoreError(from);
    if (!fromStat) {
      throw createFileSystemProviderError(localize(3052, null), "EntryNotFound" /* FileNotFound */);
    }
    const toStat = await this.statIgnoreError(to);
    if (!toStat) {
      return;
    }
    if (!overwrite) {
      throw createFileSystemProviderError(localize(3051, null), "EntryExists" /* FileExists */);
    }
    if ((fromStat.type & 1 /* File */) !== 0 && (toStat.type & 1 /* File */) !== 0) {
      return;
    } else {
      await this.delete(to, { recursive: true, useTrash: false, atomic: false });
    }
  }
  //#endregion
  //#region Clone File
  async cloneFile(from, to) {
    return this.doCloneFile(
      from,
      to,
      false
      /* optimistically assume parent folders exist */
    );
  }
  async doCloneFile(from, to, mkdir) {
    const fromFilePath = this.toFilePath(from);
    const toFilePath = this.toFilePath(to);
    const isPathCaseSensitive = !!(this.capabilities & 1024 /* PathCaseSensitive */);
    if (isEqual(fromFilePath, toFilePath, !isPathCaseSensitive)) {
      return;
    }
    const locks = new DisposableStore();
    try {
      locks.add(await this.createResourceLock(from));
      locks.add(await this.createResourceLock(to));
      if (mkdir) {
        await promises6.mkdir(dirname(toFilePath), { recursive: true });
      }
      await promises6.copyFile(fromFilePath, toFilePath);
    } catch (error) {
      if (error.code === "ENOENT" && !mkdir) {
        return this.doCloneFile(from, to, true);
      }
      throw this.toFileSystemProviderError(error);
    } finally {
      locks.dispose();
    }
  }
  //#endregion
  //#region File Watching
  createUniversalWatcher(onChange, onLogMessage, verboseLogging) {
    return new UniversalWatcherClient((changes) => onChange(changes), (msg) => onLogMessage(msg), verboseLogging);
  }
  createNonRecursiveWatcher(onChange, onLogMessage, verboseLogging) {
    return new NodeJSWatcherClient((changes) => onChange(changes), (msg) => onLogMessage(msg), verboseLogging);
  }
  //#endregion
  //#region Helpers
  toFileSystemProviderError(error) {
    if (error instanceof FileSystemProviderError) {
      return error;
    }
    let resultError = error;
    let code;
    switch (error.code) {
      case "ENOENT":
        code = "EntryNotFound" /* FileNotFound */;
        break;
      case "EISDIR":
        code = "EntryIsADirectory" /* FileIsADirectory */;
        break;
      case "ENOTDIR":
        code = "EntryNotADirectory" /* FileNotADirectory */;
        break;
      case "EEXIST":
        code = "EntryExists" /* FileExists */;
        break;
      case "EPERM":
      case "EACCES":
        code = "NoPermissions" /* NoPermissions */;
        break;
      case "ERR_UNC_HOST_NOT_ALLOWED":
        resultError = `${error.message}. Please update the 'security.allowedUNCHosts' setting if you want to allow this host.`;
        code = "Unknown" /* Unknown */;
        break;
      default:
        code = "Unknown" /* Unknown */;
    }
    return createFileSystemProviderError(resultError, code);
  }
  async toFileSystemProviderWriteError(resource, error) {
    let fileSystemProviderWriteError = this.toFileSystemProviderError(error);
    if (resource && fileSystemProviderWriteError.code === "NoPermissions" /* NoPermissions */) {
      try {
        const { stat } = await SymlinkSupport.stat(this.toFilePath(resource));
        if (!(stat.mode & 128)) {
          fileSystemProviderWriteError = createFileSystemProviderError(error, "EntryWriteLocked" /* FileWriteLocked */);
        }
      } catch (error2) {
        this.logService.trace(error2);
      }
    }
    return fileSystemProviderWriteError;
  }
  //#endregion
};
export { constants2, promises6, DiskFileSystemProvider };
