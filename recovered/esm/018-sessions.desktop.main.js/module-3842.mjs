// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/files/common/fileService.ts
import { Disposable, DisposableStore, dispose, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Promises, ResourceQueue } from "./module-0036.mjs";
import { mark } from "./module-0506.mjs";
import { ETAG_DISABLED, FileChangesEvent, FileOperationError, FileOperationEvent, NotModifiedSinceFileOperationError, TooLargeFileOperationError, ensureFileSystemProviderError, etag, hasFileAppendCapability, hasFileAtomicDeleteCapability, hasFileAtomicReadCapability, hasFileAtomicWriteCapability, hasFileCloneCapability, hasFileFolderCopyCapability, hasFileReadStreamCapability, hasFileRealpathCapability, hasOpenReadWriteCloseCapability, hasReadWriteCapability, toFileOperationResult, toFileSystemProviderErrorCode } from "./module-0269.mjs";
import { Iterable } from "./module-0011.mjs";
import { extUri, extUriIgnorePathCase, isAbsolutePath } from "./module-0034.mjs";
import { localize } from "./module-0001.mjs";
import { ErrorNoTelemetry } from "./module-0004.mjs";
import { TernarySearchTree } from "./module-0268.mjs";
import { coalesce } from "./module-0007.mjs";
import { VSBuffer, bufferToReadable, bufferedStreamToBuffer, newWriteableBufferStream, readableToBuffer, streamToBuffer } from "./module-0038.mjs";
import { consumeStream, isReadableBufferedStream, isReadableStream, listenStream, newWriteableStream, peekReadable, peekStream, transform } from "./module-0037.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { readFileIntoStream } from "./module-3841.mjs";
import { hash } from "./module-0039.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/platform/files/common/fileService.ts
var FileService = class extends Disposable {
  constructor(logService) {
    super();
    this.logService = logService;
    // Choose a buffer size that is a balance between memory needs and
    // manageable IPC overhead. The larger the buffer size, the less
    // roundtrips we have to do for reading/writing data.
    this.BUFFER_SIZE = 256 * 1024;
    //#region File System Provider
    this._onDidChangeFileSystemProviderRegistrations = this._register(new Emitter());
    this.onDidChangeFileSystemProviderRegistrations = this._onDidChangeFileSystemProviderRegistrations.event;
    this._onWillActivateFileSystemProvider = this._register(new Emitter());
    this.onWillActivateFileSystemProvider = this._onWillActivateFileSystemProvider.event;
    this._onDidChangeFileSystemProviderCapabilities = this._register(new Emitter());
    this.onDidChangeFileSystemProviderCapabilities = this._onDidChangeFileSystemProviderCapabilities.event;
    this.provider = /* @__PURE__ */ new Map();
    //#endregion
    //#region Operation events
    this._onDidRunOperation = this._register(new Emitter());
    this.onDidRunOperation = this._onDidRunOperation.event;
    //#endregion
    //#region File Watching
    this.internalOnDidFilesChange = this._register(new Emitter());
    this._onDidUncorrelatedFilesChange = this._register(new Emitter());
    this.onDidFilesChange = this._onDidUncorrelatedFilesChange.event;
    // global `onDidFilesChange` skips correlated events
    this._onDidWatchError = this._register(new Emitter());
    this.onDidWatchError = this._onDidWatchError.event;
    this.activeWatchers = /* @__PURE__ */ new Map();
    //#endregion
    //#region Helpers
    this.writeQueue = this._register(new ResourceQueue());
  }
  registerProvider(scheme, provider) {
    if (this.provider.has(scheme)) {
      throw new Error(`A filesystem provider for the scheme '${scheme}' is already registered.`);
    }
    mark(`code/registerFilesystem/${scheme}`);
    const providerDisposables2 = new DisposableStore();
    this.provider.set(scheme, provider);
    this._onDidChangeFileSystemProviderRegistrations.fire({ added: true, scheme, provider });
    providerDisposables2.add(provider.onDidChangeFile((changes) => {
      const event = new FileChangesEvent(changes, !this.isPathCaseSensitive(provider));
      this.internalOnDidFilesChange.fire(event);
      if (!event.hasCorrelation()) {
        this._onDidUncorrelatedFilesChange.fire(event);
      }
    }));
    if (typeof provider.onDidWatchError === "function") {
      providerDisposables2.add(provider.onDidWatchError((error) => this._onDidWatchError.fire(new Error(error))));
    }
    providerDisposables2.add(provider.onDidChangeCapabilities(() => this._onDidChangeFileSystemProviderCapabilities.fire({ provider, scheme })));
    return toDisposable(() => {
      this._onDidChangeFileSystemProviderRegistrations.fire({ added: false, scheme, provider });
      this.provider.delete(scheme);
      dispose(providerDisposables2);
    });
  }
  getProvider(scheme) {
    return this.provider.get(scheme);
  }
  async activateProvider(scheme) {
    const joiners = [];
    this._onWillActivateFileSystemProvider.fire({
      scheme,
      join(promise) {
        joiners.push(promise);
      }
    });
    if (this.provider.has(scheme)) {
      return;
    }
    await Promises.settled(joiners);
  }
  async canHandleResource(resource) {
    await this.activateProvider(resource.scheme);
    return this.hasProvider(resource);
  }
  hasProvider(resource) {
    return this.provider.has(resource.scheme);
  }
  hasCapability(resource, capability) {
    const provider = this.provider.get(resource.scheme);
    return !!(provider && provider.capabilities & capability);
  }
  listCapabilities() {
    return Iterable.map(this.provider, ([scheme, provider]) => ({ scheme, capabilities: provider.capabilities }));
  }
  async withProvider(resource) {
    if (!isAbsolutePath(resource)) {
      throw new FileOperationError(localize(3034, null, this.resourceForError(resource)), 8 /* FILE_INVALID_PATH */);
    }
    await this.activateProvider(resource.scheme);
    const provider = this.provider.get(resource.scheme);
    if (!provider) {
      const error = new ErrorNoTelemetry();
      error.message = localize(3036, null, resource.toString());
      throw error;
    }
    return provider;
  }
  async withReadProvider(resource) {
    const provider = await this.withProvider(resource);
    if (hasOpenReadWriteCloseCapability(provider) || hasReadWriteCapability(provider) || hasFileReadStreamCapability(provider)) {
      return provider;
    }
    throw new Error(`Filesystem provider for scheme '${resource.scheme}' neither has FileReadWrite, FileReadStream nor FileOpenReadWriteClose capability which is needed for the read operation.`);
  }
  async withWriteProvider(resource) {
    const provider = await this.withProvider(resource);
    if (hasOpenReadWriteCloseCapability(provider) || hasReadWriteCapability(provider)) {
      return provider;
    }
    throw new Error(`Filesystem provider for scheme '${resource.scheme}' neither has FileReadWrite nor FileOpenReadWriteClose capability which is needed for the write operation.`);
  }
  async resolve(resource, options3) {
    try {
      return await this.doResolveFile(resource, options3);
    } catch (error) {
      if (toFileSystemProviderErrorCode(error) === "EntryNotFound" /* FileNotFound */) {
        throw new FileOperationError(localize(3031, null, this.resourceForError(resource)), 1 /* FILE_NOT_FOUND */);
      }
      throw ensureFileSystemProviderError(error);
    }
  }
  async doResolveFile(resource, options3) {
    const provider = await this.withProvider(resource);
    const isPathCaseSensitive = this.isPathCaseSensitive(provider);
    const resolveTo = options3?.resolveTo;
    const resolveSingleChildDescendants = options3?.resolveSingleChildDescendants;
    const resolveMetadata = options3?.resolveMetadata;
    const stat = await provider.stat(resource);
    let trie;
    return this.toFileStat(provider, resource, stat, void 0, !!resolveMetadata, (stat2, siblings) => {
      if (!trie) {
        trie = TernarySearchTree.forUris(() => !isPathCaseSensitive);
        trie.set(resource, true);
        if (resolveTo) {
          trie.fill(true, resolveTo);
        }
      }
      if (trie.get(stat2.resource) || trie.findSuperstr(stat2.resource.with(
        { query: null, fragment: null }
        /* required for https://github.com/microsoft/vscode/issues/128151 */
      ))) {
        return true;
      }
      if (stat2.isDirectory && resolveSingleChildDescendants) {
        return siblings === 1;
      }
      return false;
    });
  }
  async toFileStat(provider, resource, stat, siblings, resolveMetadata, recurse) {
    const { providerExtUri } = this.getExtUri(provider);
    const fileStat = {
      resource,
      name: providerExtUri.basename(resource),
      isFile: (stat.type & 1 /* File */) !== 0,
      isDirectory: (stat.type & 2 /* Directory */) !== 0,
      isSymbolicLink: (stat.type & 64 /* SymbolicLink */) !== 0,
      mtime: stat.mtime,
      ctime: stat.ctime,
      size: stat.size,
      readonly: Boolean((stat.permissions ?? 0) & 1 /* Readonly */) || Boolean(provider.capabilities & 2048 /* Readonly */),
      locked: Boolean((stat.permissions ?? 0) & 2 /* Locked */),
      executable: Boolean((stat.permissions ?? 0) & 4 /* Executable */),
      etag: etag({ mtime: stat.mtime, size: stat.size }),
      children: void 0
    };
    if (fileStat.isDirectory && recurse(fileStat, siblings)) {
      try {
        const entries2 = await provider.readdir(resource);
        const resolvedEntries = await Promises.settled(entries2.map(async ([name, type]) => {
          try {
            const childResource = providerExtUri.joinPath(resource, name);
            const childStat = resolveMetadata ? await provider.stat(childResource) : { type };
            return await this.toFileStat(provider, childResource, childStat, entries2.length, resolveMetadata, recurse);
          } catch (error) {
            this.logService.trace(error);
            return null;
          }
        }));
        fileStat.children = coalesce(resolvedEntries);
      } catch (error) {
        this.logService.trace(error);
        fileStat.children = [];
      }
      return fileStat;
    }
    return fileStat;
  }
  async resolveAll(toResolve) {
    return Promises.settled(toResolve.map(async (entry) => {
      try {
        return { stat: await this.doResolveFile(entry.resource, entry.options), success: true };
      } catch (error) {
        this.logService.trace(error);
        return { stat: void 0, success: false };
      }
    }));
  }
  async stat(resource) {
    const provider = await this.withProvider(resource);
    const stat = await provider.stat(resource);
    return this.toFileStat(
      provider,
      resource,
      stat,
      void 0,
      true,
      () => false
      /* Do not resolve any children */
    );
  }
  async realpath(resource) {
    const provider = await this.withProvider(resource);
    if (hasFileRealpathCapability(provider)) {
      const realpath = await provider.realpath(resource);
      return resource.with({ path: realpath });
    }
    return void 0;
  }
  async exists(resource) {
    const provider = await this.withProvider(resource);
    try {
      const stat = await provider.stat(resource);
      return !!stat;
    } catch (error) {
      return false;
    }
  }
  //#endregion
  //#region File Reading/Writing
  async canCreateFile(resource, options3) {
    try {
      await this.doValidateCreateFile(resource, options3);
    } catch (error) {
      return error;
    }
    return true;
  }
  async doValidateCreateFile(resource, options3) {
    if (!options3?.overwrite && await this.exists(resource)) {
      throw new FileOperationError(localize(3027, null, this.resourceForError(resource)), 3 /* FILE_MODIFIED_SINCE */, options3);
    }
  }
  async createFile(resource, bufferOrReadableOrStream = VSBuffer.fromString(""), options3) {
    await this.doValidateCreateFile(resource, options3);
    const fileStat = await this.writeFile(resource, bufferOrReadableOrStream);
    this._onDidRunOperation.fire(new FileOperationEvent(resource, 0 /* CREATE */, fileStat));
    return fileStat;
  }
  async writeFile(resource, bufferOrReadableOrStream, options3) {
    const provider = this.throwIfFileSystemIsReadonly(await this.withWriteProvider(resource), resource);
    const { providerExtUri } = this.getExtUri(provider);
    let writeFileOptions = options3;
    if (hasFileAtomicWriteCapability(provider) && !writeFileOptions?.atomic) {
      const enforcedAtomicWrite = provider.enforceAtomicWriteFile?.(resource);
      if (enforcedAtomicWrite) {
        writeFileOptions = { ...options3, atomic: enforcedAtomicWrite };
      }
    }
    try {
      let { stat, buffer: bufferOrReadableOrStreamOrBufferedStream } = await this.validateWriteFile(provider, resource, bufferOrReadableOrStream, writeFileOptions);
      if (!stat) {
        await this.mkdirp(provider, providerExtUri.dirname(resource));
      }
      if (!bufferOrReadableOrStreamOrBufferedStream) {
        bufferOrReadableOrStreamOrBufferedStream = await this.peekBufferForWriting(provider, bufferOrReadableOrStream);
      }
      if (!hasOpenReadWriteCloseCapability(provider) || // buffered writing is unsupported
      hasReadWriteCapability(provider) && bufferOrReadableOrStreamOrBufferedStream instanceof VSBuffer || // data is a full buffer already
      hasReadWriteCapability(provider) && hasFileAtomicWriteCapability(provider) && writeFileOptions?.atomic) {
        await this.doWriteUnbuffered(provider, resource, writeFileOptions, bufferOrReadableOrStreamOrBufferedStream);
      } else {
        await this.doWriteBuffered(provider, resource, writeFileOptions, bufferOrReadableOrStreamOrBufferedStream instanceof VSBuffer ? bufferToReadable(bufferOrReadableOrStreamOrBufferedStream) : bufferOrReadableOrStreamOrBufferedStream);
      }
      this._onDidRunOperation.fire(new FileOperationEvent(resource, 4 /* WRITE */));
    } catch (error) {
      throw new FileOperationError(localize(3026, null, this.resourceForError(resource), ensureFileSystemProviderError(error).toString()), toFileOperationResult(error), writeFileOptions);
    }
    return this.resolve(resource, { resolveMetadata: true });
  }
  async peekBufferForWriting(provider, bufferOrReadableOrStream) {
    let peekResult;
    if (hasReadWriteCapability(provider) && !(bufferOrReadableOrStream instanceof VSBuffer)) {
      if (isReadableStream(bufferOrReadableOrStream)) {
        const bufferedStream = await peekStream(bufferOrReadableOrStream, 3);
        if (bufferedStream.ended) {
          peekResult = VSBuffer.concat(bufferedStream.buffer);
        } else {
          peekResult = bufferedStream;
        }
      } else {
        peekResult = peekReadable(bufferOrReadableOrStream, (data) => VSBuffer.concat(data), 3);
      }
    } else {
      peekResult = bufferOrReadableOrStream;
    }
    return peekResult;
  }
  async validateWriteFile(provider, resource, bufferOrReadableOrStream, options3) {
    const unlock = !!options3?.unlock;
    if (unlock && !(provider.capabilities & 8192 /* FileWriteUnlock */)) {
      throw new Error(localize(3044, null, this.resourceForError(resource)));
    }
    if (options3?.append && !hasFileAppendCapability(provider)) {
      throw new FileOperationError(localize(3023, null, this.resourceForError(resource)), 6 /* FILE_PERMISSION_DENIED */);
    }
    const atomic = !!options3?.atomic;
    if (atomic) {
      if (!(provider.capabilities & 32768 /* FileAtomicWrite */)) {
        throw new Error(localize(3042, null, this.resourceForError(resource)));
      }
      if (!(provider.capabilities & 2 /* FileReadWrite */)) {
        throw new Error(localize(3043, null, this.resourceForError(resource)));
      }
      if (unlock) {
        throw new Error(localize(3041, null, this.resourceForError(resource)));
      }
    }
    let stat = void 0;
    try {
      stat = await provider.stat(resource);
    } catch (error) {
      return /* @__PURE__ */ Object.create(null);
    }
    if ((stat.type & 2 /* Directory */) !== 0) {
      throw new FileOperationError(localize(3029, null, this.resourceForError(resource)), 0 /* FILE_IS_DIRECTORY */, options3);
    }
    this.throwIfFileIsReadonly(resource, stat);
    let buffer;
    if (typeof options3?.mtime === "number" && typeof options3.etag === "string" && options3.etag !== ETAG_DISABLED && typeof stat.mtime === "number" && typeof stat.size === "number" && options3.mtime < stat.mtime && options3.etag !== etag({ mtime: options3.mtime, size: stat.size })) {
      buffer = await this.peekBufferForWriting(provider, bufferOrReadableOrStream);
      if (buffer instanceof VSBuffer && buffer.byteLength === stat.size) {
        try {
          const { value: value2 } = await this.readFile(resource, { limits: { size: stat.size } });
          if (buffer.equals(value2)) {
            return { stat, buffer };
          }
        } catch (error) {
        }
      }
      throw new FileOperationError(localize(3030, null), 3 /* FILE_MODIFIED_SINCE */, options3);
    }
    return { stat, buffer };
  }
  async readFile(resource, options3, token) {
    const provider = await this.withReadProvider(resource);
    if (options3?.atomic) {
      return this.doReadFileAtomic(provider, resource, options3, token);
    }
    return this.doReadFile(provider, resource, options3, token);
  }
  async doReadFileAtomic(provider, resource, options3, token) {
    return new Promise((resolve3, reject) => {
      this.writeQueue.queueFor(resource, async () => {
        try {
          const content = await this.doReadFile(provider, resource, options3, token);
          resolve3(content);
        } catch (error) {
          reject(error);
        }
      }, this.getExtUri(provider).providerExtUri);
    });
  }
  async doReadFile(provider, resource, options3, token) {
    const stream = await this.doReadFileStream(provider, resource, {
      ...options3,
      // optimization: since we know that the caller does not
      // care about buffering, we indicate this to the reader.
      // this reduces all the overhead the buffered reading
      // has (open, read, close) if the provider supports
      // unbuffered reading.
      preferUnbuffered: true
    }, token);
    return {
      ...stream,
      value: await streamToBuffer(stream.value)
    };
  }
  async readFileStream(resource, options3, token) {
    const provider = await this.withReadProvider(resource);
    return this.doReadFileStream(provider, resource, options3, token);
  }
  async doReadFileStream(provider, resource, options3, token) {
    const cancellableSource = new CancellationTokenSource(token);
    let readFileOptions = options3;
    if (hasFileAtomicReadCapability(provider) && provider.enforceAtomicReadFile?.(resource)) {
      readFileOptions = { ...options3, atomic: true };
    }
    const statPromise = this.validateReadFile(resource, readFileOptions).then((stat) => stat, (error) => {
      cancellableSource.dispose(true);
      throw error;
    });
    let fileStream = void 0;
    try {
      if (typeof readFileOptions?.etag === "string" && readFileOptions.etag !== ETAG_DISABLED) {
        await statPromise;
      }
      if (readFileOptions?.atomic && hasFileAtomicReadCapability(provider) || // atomic reads are always unbuffered
      !(hasOpenReadWriteCloseCapability(provider) || hasFileReadStreamCapability(provider)) || // provider has no buffered capability
      hasReadWriteCapability(provider) && readFileOptions?.preferUnbuffered) {
        fileStream = this.readFileUnbuffered(provider, resource, readFileOptions);
      } else if (hasFileReadStreamCapability(provider)) {
        fileStream = this.readFileStreamed(provider, resource, cancellableSource.token, readFileOptions);
      } else {
        fileStream = this.readFileBuffered(provider, resource, cancellableSource.token, readFileOptions);
      }
      fileStream.on("end", () => cancellableSource.dispose());
      fileStream.on("error", () => cancellableSource.dispose());
      const fileStat = await statPromise;
      return {
        ...fileStat,
        value: fileStream
      };
    } catch (error) {
      if (fileStream) {
        await consumeStream(fileStream);
      }
      throw this.restoreReadError(error, resource, readFileOptions);
    }
  }
  restoreReadError(error, resource, options3) {
    const message = localize(3024, null, this.resourceForError(resource), ensureFileSystemProviderError(error).toString());
    if (error instanceof NotModifiedSinceFileOperationError) {
      return new NotModifiedSinceFileOperationError(message, error.stat, options3);
    }
    if (error instanceof TooLargeFileOperationError) {
      return new TooLargeFileOperationError(message, error.fileOperationResult, error.size, error.options);
    }
    return new FileOperationError(message, toFileOperationResult(error), options3);
  }
  readFileStreamed(provider, resource, token, options3 = /* @__PURE__ */ Object.create(null)) {
    const fileStream = provider.readFileStream(resource, options3, token);
    return transform(fileStream, {
      data: (data) => data instanceof VSBuffer ? data : VSBuffer.wrap(data),
      error: (error) => this.restoreReadError(error, resource, options3)
    }, (data) => VSBuffer.concat(data));
  }
  readFileBuffered(provider, resource, token, options3 = /* @__PURE__ */ Object.create(null)) {
    const stream = newWriteableBufferStream();
    readFileIntoStream(provider, resource, stream, (data) => data, {
      ...options3,
      bufferSize: this.BUFFER_SIZE,
      errorTransformer: (error) => this.restoreReadError(error, resource, options3)
    }, token);
    return stream;
  }
  readFileUnbuffered(provider, resource, options3) {
    const stream = newWriteableStream((data) => VSBuffer.concat(data));
    (async () => {
      try {
        let buffer;
        if (options3?.atomic && hasFileAtomicReadCapability(provider)) {
          buffer = await provider.readFile(resource, { atomic: true });
        } else {
          buffer = await provider.readFile(resource);
        }
        if (typeof options3?.position === "number") {
          buffer = buffer.slice(options3.position);
        }
        if (typeof options3?.length === "number") {
          buffer = buffer.slice(0, options3.length);
        }
        this.validateReadFileLimits(resource, buffer.byteLength, options3);
        stream.end(VSBuffer.wrap(buffer));
      } catch (err) {
        stream.error(err);
        stream.end();
      }
    })();
    return stream;
  }
  async validateReadFile(resource, options3) {
    const stat = await this.resolve(resource, { resolveMetadata: true });
    if (stat.isDirectory) {
      throw new FileOperationError(localize(3028, null, this.resourceForError(resource)), 0 /* FILE_IS_DIRECTORY */, options3);
    }
    if (typeof options3?.etag === "string" && options3.etag !== ETAG_DISABLED && options3.etag === stat.etag) {
      throw new NotModifiedSinceFileOperationError(localize(3032, null), stat, options3);
    }
    this.validateReadFileLimits(resource, stat.size, options3);
    return stat;
  }
  validateReadFileLimits(resource, size3, options3) {
    if (typeof options3?.limits?.size === "number" && size3 > options3.limits.size) {
      throw new TooLargeFileOperationError(localize(3033, null, this.resourceForError(resource)), 7 /* FILE_TOO_LARGE */, size3, options3);
    }
  }
  //#endregion
  //#region Move/Copy/Delete/Create Folder
  async canMove(source, target, overwrite) {
    return this.doCanMoveCopy(source, target, "move", overwrite);
  }
  async canCopy(source, target, overwrite) {
    return this.doCanMoveCopy(source, target, "copy", overwrite);
  }
  async doCanMoveCopy(source, target, mode, overwrite) {
    if (source.toString() !== target.toString()) {
      try {
        const sourceProvider = mode === "move" ? this.throwIfFileSystemIsReadonly(await this.withWriteProvider(source), source) : await this.withReadProvider(source);
        const targetProvider = this.throwIfFileSystemIsReadonly(await this.withWriteProvider(target), target);
        await this.doValidateMoveCopy(sourceProvider, source, targetProvider, target, mode, overwrite);
      } catch (error) {
        return error;
      }
    }
    return true;
  }
  async move(source, target, overwrite) {
    const sourceProvider = this.throwIfFileSystemIsReadonly(await this.withWriteProvider(source), source);
    const targetProvider = this.throwIfFileSystemIsReadonly(await this.withWriteProvider(target), target);
    const mode = await this.doMoveCopy(sourceProvider, source, targetProvider, target, "move", !!overwrite);
    const fileStat = await this.resolve(target, { resolveMetadata: true });
    this._onDidRunOperation.fire(new FileOperationEvent(source, mode === "move" ? 2 /* MOVE */ : 3 /* COPY */, fileStat));
    return fileStat;
  }
  async copy(source, target, overwrite) {
    const sourceProvider = await this.withReadProvider(source);
    const targetProvider = this.throwIfFileSystemIsReadonly(await this.withWriteProvider(target), target);
    const mode = await this.doMoveCopy(sourceProvider, source, targetProvider, target, "copy", !!overwrite);
    const fileStat = await this.resolve(target, { resolveMetadata: true });
    this._onDidRunOperation.fire(new FileOperationEvent(source, mode === "copy" ? 3 /* COPY */ : 2 /* MOVE */, fileStat));
    return fileStat;
  }
  async doMoveCopy(sourceProvider, source, targetProvider, target, mode, overwrite) {
    if (source.toString() === target.toString()) {
      return mode;
    }
    const { exists, isSameResourceWithDifferentPathCase } = await this.doValidateMoveCopy(sourceProvider, source, targetProvider, target, mode, overwrite);
    if (exists && !isSameResourceWithDifferentPathCase && overwrite) {
      await this.del(target, { recursive: true });
    }
    await this.mkdirp(targetProvider, this.getExtUri(targetProvider).providerExtUri.dirname(target));
    if (mode === "copy") {
      if (sourceProvider === targetProvider && hasFileFolderCopyCapability(sourceProvider)) {
        await sourceProvider.copy(source, target, { overwrite });
      } else {
        const sourceFile = await this.resolve(source);
        if (sourceFile.isDirectory) {
          await this.doCopyFolder(sourceProvider, sourceFile, targetProvider, target);
        } else {
          await this.doCopyFile(sourceProvider, source, targetProvider, target);
        }
      }
      return mode;
    } else {
      if (sourceProvider === targetProvider) {
        await sourceProvider.rename(source, target, { overwrite });
        return mode;
      } else {
        await this.doMoveCopy(sourceProvider, source, targetProvider, target, "copy", overwrite);
        await this.del(source, { recursive: true });
        return "copy";
      }
    }
  }
  async doCopyFile(sourceProvider, source, targetProvider, target) {
    if (hasOpenReadWriteCloseCapability(sourceProvider) && hasOpenReadWriteCloseCapability(targetProvider)) {
      return this.doPipeBuffered(sourceProvider, source, targetProvider, target);
    }
    if (hasOpenReadWriteCloseCapability(sourceProvider) && hasReadWriteCapability(targetProvider)) {
      return this.doPipeBufferedToUnbuffered(sourceProvider, source, targetProvider, target);
    }
    if (hasReadWriteCapability(sourceProvider) && hasOpenReadWriteCloseCapability(targetProvider)) {
      return this.doPipeUnbufferedToBuffered(sourceProvider, source, targetProvider, target);
    }
    if (hasReadWriteCapability(sourceProvider) && hasReadWriteCapability(targetProvider)) {
      return this.doPipeUnbuffered(sourceProvider, source, targetProvider, target);
    }
  }
  async doCopyFolder(sourceProvider, sourceFolder, targetProvider, targetFolder) {
    await targetProvider.mkdir(targetFolder);
    if (Array.isArray(sourceFolder.children)) {
      await Promises.settled(sourceFolder.children.map(async (sourceChild) => {
        const targetChild = this.getExtUri(targetProvider).providerExtUri.joinPath(targetFolder, sourceChild.name);
        if (sourceChild.isDirectory) {
          return this.doCopyFolder(sourceProvider, await this.resolve(sourceChild.resource), targetProvider, targetChild);
        } else {
          return this.doCopyFile(sourceProvider, sourceChild.resource, targetProvider, targetChild);
        }
      }));
    }
  }
  async doValidateMoveCopy(sourceProvider, source, targetProvider, target, mode, overwrite) {
    let isSameResourceWithDifferentPathCase = false;
    if (sourceProvider === targetProvider) {
      const { providerExtUri, isPathCaseSensitive } = this.getExtUri(sourceProvider);
      if (!isPathCaseSensitive) {
        isSameResourceWithDifferentPathCase = providerExtUri.isEqual(source, target);
      }
      if (isSameResourceWithDifferentPathCase && mode === "copy") {
        throw new Error(localize(3037, null, this.resourceForError(source), this.resourceForError(target)));
      }
      if (!isSameResourceWithDifferentPathCase && providerExtUri.isEqualOrParent(target, source)) {
        throw new Error(localize(3038, null, this.resourceForError(source), this.resourceForError(target)));
      }
    }
    const exists = await this.exists(target);
    if (exists && !isSameResourceWithDifferentPathCase) {
      if (!overwrite) {
        throw new FileOperationError(localize(3039, null, this.resourceForError(source), this.resourceForError(target)), 4 /* FILE_MOVE_CONFLICT */);
      }
      if (sourceProvider === targetProvider) {
        const { providerExtUri } = this.getExtUri(sourceProvider);
        if (providerExtUri.isEqualOrParent(source, target)) {
          throw new Error(localize(3040, null, this.resourceForError(source), this.resourceForError(target)));
        }
      }
    }
    return { exists, isSameResourceWithDifferentPathCase };
  }
  getExtUri(provider) {
    const isPathCaseSensitive = this.isPathCaseSensitive(provider);
    return {
      providerExtUri: isPathCaseSensitive ? extUri : extUriIgnorePathCase,
      isPathCaseSensitive
    };
  }
  isPathCaseSensitive(provider) {
    return !!(provider.capabilities & 1024 /* PathCaseSensitive */);
  }
  async createFolder(resource) {
    const provider = this.throwIfFileSystemIsReadonly(await this.withProvider(resource), resource);
    await this.mkdirp(provider, resource);
    const fileStat = await this.resolve(resource, { resolveMetadata: true });
    this._onDidRunOperation.fire(new FileOperationEvent(resource, 0 /* CREATE */, fileStat));
    return fileStat;
  }
  async mkdirp(provider, directory) {
    const directoriesToCreate = [];
    const { providerExtUri } = this.getExtUri(provider);
    while (!providerExtUri.isEqual(directory, providerExtUri.dirname(directory))) {
      try {
        const stat = await provider.stat(directory);
        if ((stat.type & 2 /* Directory */) === 0) {
          throw new Error(localize(3035, null, this.resourceForError(directory)));
        }
        break;
      } catch (error) {
        if (toFileSystemProviderErrorCode(error) !== "EntryNotFound" /* FileNotFound */) {
          throw error;
        }
        directoriesToCreate.push(providerExtUri.basename(directory));
        directory = providerExtUri.dirname(directory);
      }
    }
    for (let i2 = directoriesToCreate.length - 1; i2 >= 0; i2--) {
      directory = providerExtUri.joinPath(directory, directoriesToCreate[i2]);
      try {
        await provider.mkdir(directory);
      } catch (error) {
        if (toFileSystemProviderErrorCode(error) !== "EntryExists" /* FileExists */) {
          throw error;
        }
      }
    }
  }
  async canDelete(resource, options3) {
    try {
      await this.doValidateDelete(resource, options3);
    } catch (error) {
      return error;
    }
    return true;
  }
  async doValidateDelete(resource, options3) {
    const provider = this.throwIfFileSystemIsReadonly(await this.withProvider(resource), resource);
    const useTrash = !!options3?.useTrash;
    if (useTrash && !(provider.capabilities & 4096 /* Trash */)) {
      throw new Error(localize(3022, null, this.resourceForError(resource)));
    }
    const atomic = options3?.atomic;
    if (atomic && !(provider.capabilities & 65536 /* FileAtomicDelete */)) {
      throw new Error(localize(3018, null, this.resourceForError(resource)));
    }
    if (useTrash && atomic) {
      throw new Error(localize(3021, null, this.resourceForError(resource)));
    }
    let stat = void 0;
    try {
      stat = await provider.stat(resource);
    } catch (error) {
    }
    if (stat) {
      this.throwIfFileIsReadonly(resource, stat);
    } else {
      throw new FileOperationError(localize(3020, null, this.resourceForError(resource)), 1 /* FILE_NOT_FOUND */);
    }
    const recursive = !!options3?.recursive;
    if (!recursive) {
      const stat2 = await this.resolve(resource);
      if (stat2.isDirectory && Array.isArray(stat2.children) && stat2.children.length > 0) {
        throw new Error(localize(3019, null, this.resourceForError(resource)));
      }
    }
    return provider;
  }
  async del(resource, options3) {
    const provider = await this.doValidateDelete(resource, options3);
    let deleteFileOptions = options3;
    if (hasFileAtomicDeleteCapability(provider) && !deleteFileOptions?.atomic) {
      const enforcedAtomicDelete = provider.enforceAtomicDelete?.(resource);
      if (enforcedAtomicDelete) {
        deleteFileOptions = { ...options3, atomic: enforcedAtomicDelete };
      }
    }
    const useTrash = !!deleteFileOptions?.useTrash;
    const recursive = !!deleteFileOptions?.recursive;
    const atomic = deleteFileOptions?.atomic ?? false;
    await provider.delete(resource, { recursive, useTrash, atomic });
    this._onDidRunOperation.fire(new FileOperationEvent(resource, 1 /* DELETE */));
  }
  //#endregion
  //#region Clone File
  async cloneFile(source, target) {
    const sourceProvider = await this.withProvider(source);
    const targetProvider = this.throwIfFileSystemIsReadonly(await this.withWriteProvider(target), target);
    if (sourceProvider === targetProvider && this.getExtUri(sourceProvider).providerExtUri.isEqual(source, target)) {
      return;
    }
    if (sourceProvider === targetProvider && hasFileCloneCapability(sourceProvider)) {
      return sourceProvider.cloneFile(source, target);
    }
    await this.mkdirp(targetProvider, this.getExtUri(targetProvider).providerExtUri.dirname(target));
    if (sourceProvider === targetProvider && hasFileFolderCopyCapability(sourceProvider)) {
      return this.writeQueue.queueFor(source, () => sourceProvider.copy(source, target, { overwrite: true }), this.getExtUri(sourceProvider).providerExtUri);
    }
    return this.writeQueue.queueFor(source, () => this.doCopyFile(sourceProvider, source, targetProvider, target), this.getExtUri(sourceProvider).providerExtUri);
  }
  static {
    this.WATCHER_CORRELATION_IDS = 0;
  }
  createWatcher(resource, options3) {
    return this.watch(resource, {
      ...options3,
      // Explicitly set a correlation id so that file events that originate
      // from requests from extensions are exclusively routed back to the
      // extension host and not into the workbench.
      correlationId: FileService.WATCHER_CORRELATION_IDS++
    });
  }
  watch(resource, options3 = { recursive: false, excludes: [] }) {
    const disposables = new DisposableStore();
    let watchDisposed = false;
    let disposeWatch = () => {
      watchDisposed = true;
    };
    disposables.add(toDisposable(() => disposeWatch()));
    (async () => {
      try {
        const disposable = await this.doWatch(resource, options3);
        if (watchDisposed) {
          dispose(disposable);
        } else {
          disposeWatch = () => dispose(disposable);
        }
      } catch (error) {
        this.logService.error(error);
      }
    })();
    const correlationId = options3.correlationId;
    if (typeof correlationId === "number") {
      const fileChangeEmitter = disposables.add(new Emitter());
      disposables.add(this.internalOnDidFilesChange.event((e4) => {
        if (e4.correlates(correlationId)) {
          fileChangeEmitter.fire(e4);
        }
      }));
      const watcher = {
        onDidChange: fileChangeEmitter.event,
        dispose: () => disposables.dispose()
      };
      return watcher;
    }
    return disposables;
  }
  async doWatch(resource, options3) {
    const provider = await this.withProvider(resource);
    const watchHash = hash([this.getExtUri(provider).providerExtUri.getComparisonKey(resource), options3]);
    let watcher = this.activeWatchers.get(watchHash);
    if (!watcher) {
      watcher = {
        count: 0,
        disposable: provider.watch(resource, options3)
      };
      this.activeWatchers.set(watchHash, watcher);
    }
    watcher.count += 1;
    return toDisposable(() => {
      if (watcher) {
        watcher.count--;
        if (watcher.count === 0) {
          dispose(watcher.disposable);
          this.activeWatchers.delete(watchHash);
        }
      }
    });
  }
  dispose() {
    super.dispose();
    for (const [, watcher] of this.activeWatchers) {
      dispose(watcher.disposable);
    }
    this.activeWatchers.clear();
  }
  async doWriteBuffered(provider, resource, options3, readableOrStreamOrBufferedStream) {
    return this.writeQueue.queueFor(resource, async () => {
      const handle2 = await provider.open(resource, { create: true, unlock: options3?.unlock ?? false, append: options3?.append ?? false });
      try {
        if (isReadableStream(readableOrStreamOrBufferedStream) || isReadableBufferedStream(readableOrStreamOrBufferedStream)) {
          await this.doWriteStreamBufferedQueued(provider, handle2, readableOrStreamOrBufferedStream);
        } else {
          await this.doWriteReadableBufferedQueued(provider, handle2, readableOrStreamOrBufferedStream);
        }
      } catch (error) {
        throw ensureFileSystemProviderError(error);
      } finally {
        await provider.close(handle2);
      }
    }, this.getExtUri(provider).providerExtUri);
  }
  async doWriteStreamBufferedQueued(provider, handle2, streamOrBufferedStream) {
    let posInFile = 0;
    let stream;
    if (isReadableBufferedStream(streamOrBufferedStream)) {
      if (streamOrBufferedStream.buffer.length > 0) {
        const chunk2 = VSBuffer.concat(streamOrBufferedStream.buffer);
        await this.doWriteBuffer(provider, handle2, chunk2, chunk2.byteLength, posInFile, 0);
        posInFile += chunk2.byteLength;
      }
      if (streamOrBufferedStream.ended) {
        return;
      }
      stream = streamOrBufferedStream.stream;
    } else {
      stream = streamOrBufferedStream;
    }
    return new Promise((resolve3, reject) => {
      listenStream(stream, {
        onData: async (chunk2) => {
          stream.pause();
          try {
            await this.doWriteBuffer(provider, handle2, chunk2, chunk2.byteLength, posInFile, 0);
          } catch (error) {
            return reject(error);
          }
          posInFile += chunk2.byteLength;
          setTimeout(() => stream.resume());
        },
        onError: (error) => reject(error),
        onEnd: () => resolve3()
      });
    });
  }
  async doWriteReadableBufferedQueued(provider, handle2, readable) {
    let posInFile = 0;
    let chunk2;
    while ((chunk2 = readable.read()) !== null) {
      await this.doWriteBuffer(provider, handle2, chunk2, chunk2.byteLength, posInFile, 0);
      posInFile += chunk2.byteLength;
    }
  }
  async doWriteBuffer(provider, handle2, buffer, length, posInFile, posInBuffer) {
    let totalBytesWritten = 0;
    while (totalBytesWritten < length) {
      const bytesWritten = await provider.write(handle2, posInFile + totalBytesWritten, buffer.buffer, posInBuffer + totalBytesWritten, length - totalBytesWritten);
      totalBytesWritten += bytesWritten;
    }
  }
  async doWriteUnbuffered(provider, resource, options3, bufferOrReadableOrStreamOrBufferedStream) {
    return this.writeQueue.queueFor(resource, () => this.doWriteUnbufferedQueued(provider, resource, options3, bufferOrReadableOrStreamOrBufferedStream), this.getExtUri(provider).providerExtUri);
  }
  async doWriteUnbufferedQueued(provider, resource, options3, bufferOrReadableOrStreamOrBufferedStream) {
    let buffer;
    if (bufferOrReadableOrStreamOrBufferedStream instanceof VSBuffer) {
      buffer = bufferOrReadableOrStreamOrBufferedStream;
    } else if (isReadableStream(bufferOrReadableOrStreamOrBufferedStream)) {
      buffer = await streamToBuffer(bufferOrReadableOrStreamOrBufferedStream);
    } else if (isReadableBufferedStream(bufferOrReadableOrStreamOrBufferedStream)) {
      buffer = await bufferedStreamToBuffer(bufferOrReadableOrStreamOrBufferedStream);
    } else {
      buffer = readableToBuffer(bufferOrReadableOrStreamOrBufferedStream);
    }
    await provider.writeFile(resource, buffer.buffer, { create: true, overwrite: true, unlock: options3?.unlock ?? false, atomic: options3?.atomic ?? false, append: options3?.append ?? false });
  }
  async doPipeBuffered(sourceProvider, source, targetProvider, target) {
    return this.writeQueue.queueFor(target, () => this.doPipeBufferedQueued(sourceProvider, source, targetProvider, target), this.getExtUri(targetProvider).providerExtUri);
  }
  async doPipeBufferedQueued(sourceProvider, source, targetProvider, target) {
    let sourceHandle = void 0;
    let targetHandle = void 0;
    try {
      sourceHandle = await sourceProvider.open(source, { create: false });
      targetHandle = await targetProvider.open(target, { create: true, unlock: false });
      const buffer = VSBuffer.alloc(this.BUFFER_SIZE);
      let posInFile = 0;
      let posInBuffer = 0;
      let bytesRead = 0;
      do {
        bytesRead = await sourceProvider.read(sourceHandle, posInFile, buffer.buffer, posInBuffer, buffer.byteLength - posInBuffer);
        await this.doWriteBuffer(targetProvider, targetHandle, buffer, bytesRead, posInFile, posInBuffer);
        posInFile += bytesRead;
        posInBuffer += bytesRead;
        if (posInBuffer === buffer.byteLength) {
          posInBuffer = 0;
        }
      } while (bytesRead > 0);
    } catch (error) {
      throw ensureFileSystemProviderError(error);
    } finally {
      await Promises.settled([
        typeof sourceHandle === "number" ? sourceProvider.close(sourceHandle) : Promise.resolve(),
        typeof targetHandle === "number" ? targetProvider.close(targetHandle) : Promise.resolve()
      ]);
    }
  }
  async doPipeUnbuffered(sourceProvider, source, targetProvider, target) {
    return this.writeQueue.queueFor(target, () => this.doPipeUnbufferedQueued(sourceProvider, source, targetProvider, target), this.getExtUri(targetProvider).providerExtUri);
  }
  async doPipeUnbufferedQueued(sourceProvider, source, targetProvider, target) {
    return targetProvider.writeFile(target, await sourceProvider.readFile(source), { create: true, overwrite: true, unlock: false, atomic: false });
  }
  async doPipeUnbufferedToBuffered(sourceProvider, source, targetProvider, target) {
    return this.writeQueue.queueFor(target, () => this.doPipeUnbufferedToBufferedQueued(sourceProvider, source, targetProvider, target), this.getExtUri(targetProvider).providerExtUri);
  }
  async doPipeUnbufferedToBufferedQueued(sourceProvider, source, targetProvider, target) {
    const targetHandle = await targetProvider.open(target, { create: true, unlock: false });
    try {
      const buffer = await sourceProvider.readFile(source);
      await this.doWriteBuffer(targetProvider, targetHandle, VSBuffer.wrap(buffer), buffer.byteLength, 0, 0);
    } catch (error) {
      throw ensureFileSystemProviderError(error);
    } finally {
      await targetProvider.close(targetHandle);
    }
  }
  async doPipeBufferedToUnbuffered(sourceProvider, source, targetProvider, target) {
    const buffer = await streamToBuffer(this.readFileBuffered(sourceProvider, source, CancellationToken.None));
    await this.doWriteUnbuffered(targetProvider, target, void 0, buffer);
  }
  throwIfFileSystemIsReadonly(provider, resource) {
    if (provider.capabilities & 2048 /* Readonly */) {
      throw new FileOperationError(localize(3025, null, this.resourceForError(resource)), 6 /* FILE_PERMISSION_DENIED */);
    }
    return provider;
  }
  throwIfFileIsReadonly(resource, stat) {
    if ((stat.permissions ?? 0) & 1 /* Readonly */) {
      throw new FileOperationError(localize(3025, null, this.resourceForError(resource)), 6 /* FILE_PERMISSION_DENIED */);
    }
  }
  resourceForError(resource) {
    if (resource.scheme === Schemas.file) {
      return resource.fsPath;
    }
    return resource.toString(true);
  }
  //#endregion
};

FileService = __decorateClass([
  __decorateParam(0, ILogService)
], FileService);
export { FileService };
