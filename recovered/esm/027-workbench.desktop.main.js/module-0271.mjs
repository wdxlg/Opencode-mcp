// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/files/browser/htmlFileSystemProvider.ts
import { Disposable, DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { isLinux } from "./module-0014.mjs";
import { extUri, extUriIgnorePathCase, joinPath } from "./module-0034.mjs";
import { WebFileSystemAccess, WebFileSystemObserver } from "./module-0270.mjs";
import { newWriteableStream } from "./module-0037.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { localize } from "./module-0001.mjs";
import { basename, extname, normalize } from "./module-0026.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { FileSystemProviderError, createFileSystemProviderError } from "./module-0269.mjs";


// src/vs/platform/files/browser/htmlFileSystemProvider.ts
var HTMLFileSystemProvider = class extends Disposable {
  //#endregion
  constructor(indexedDB, store, logService) {
    super();
    this.indexedDB = indexedDB;
    this.store = store;
    this.logService = logService;
    //#region Events (unsupported)
    this.onDidChangeCapabilities = Event2.None;
    //#endregion
    //#region File Capabilities
    this.extUri = isLinux ? extUri : extUriIgnorePathCase;
    //#endregion
    //#region File Watching (unsupported)
    this._onDidChangeFileEmitter = this._register(new Emitter());
    this.onDidChangeFile = this._onDidChangeFileEmitter.event;
    //#endregion
    //#region File/Directoy Handle Registry
    this._files = /* @__PURE__ */ new Map();
    this._directories = /* @__PURE__ */ new Map();
  }
  get capabilities() {
    if (!this._capabilities) {
      this._capabilities = 2 /* FileReadWrite */ | 16 /* FileReadStream */;
      if (isLinux) {
        this._capabilities |= 1024 /* PathCaseSensitive */;
      }
    }
    return this._capabilities;
  }
  //#region File Metadata Resolving
  async stat(resource) {
    try {
      const handle2 = await this.getHandle(resource);
      if (!handle2) {
        throw this.createFileSystemProviderError(resource, "No such file or directory, stat", "EntryNotFound" /* FileNotFound */);
      }
      if (WebFileSystemAccess.isFileSystemFileHandle(handle2)) {
        const file = await handle2.getFile();
        return {
          type: 1 /* File */,
          mtime: file.lastModified,
          ctime: 0,
          size: file.size
        };
      }
      return {
        type: 2 /* Directory */,
        mtime: 0,
        ctime: 0,
        size: 0
      };
    } catch (error) {
      throw this.toFileSystemProviderError(error);
    }
  }
  async readdir(resource) {
    try {
      const handle2 = await this.getDirectoryHandle(resource);
      if (!handle2) {
        throw this.createFileSystemProviderError(resource, "No such file or directory, readdir", "EntryNotFound" /* FileNotFound */);
      }
      const result = [];
      for await (const [name, child] of handle2) {
        result.push([name, WebFileSystemAccess.isFileSystemFileHandle(child) ? 1 /* File */ : 2 /* Directory */]);
      }
      return result;
    } catch (error) {
      throw this.toFileSystemProviderError(error);
    }
  }
  //#endregion
  //#region File Reading/Writing
  readFileStream(resource, opts, token) {
    const stream = newWriteableStream((data) => VSBuffer.concat(data.map((data2) => VSBuffer.wrap(data2))).buffer, {
      // Set a highWaterMark to prevent the stream
      // for file upload to produce large buffers
      // in-memory
      highWaterMark: 10
    });
    (async () => {
      try {
        const handle2 = await this.getFileHandle(resource);
        if (!handle2) {
          throw this.createFileSystemProviderError(resource, "No such file or directory, readFile", "EntryNotFound" /* FileNotFound */);
        }
        const file = await handle2.getFile();
        if (typeof opts.length === "number" || typeof opts.position === "number") {
          let buffer = new Uint8Array(await file.arrayBuffer());
          if (typeof opts?.position === "number") {
            buffer = buffer.slice(opts.position);
          }
          if (typeof opts?.length === "number") {
            buffer = buffer.slice(0, opts.length);
          }
          stream.end(buffer);
        } else {
          const reader = file.stream().getReader();
          let res = await reader.read();
          while (!res.done) {
            if (token.isCancellationRequested) {
              break;
            }
            await stream.write(res.value);
            if (token.isCancellationRequested) {
              break;
            }
            res = await reader.read();
          }
          stream.end(void 0);
        }
      } catch (error) {
        stream.error(this.toFileSystemProviderError(error));
        stream.end();
      }
    })();
    return stream;
  }
  async readFile(resource) {
    try {
      const handle2 = await this.getFileHandle(resource);
      if (!handle2) {
        throw this.createFileSystemProviderError(resource, "No such file or directory, readFile", "EntryNotFound" /* FileNotFound */);
      }
      const file = await handle2.getFile();
      return new Uint8Array(await file.arrayBuffer());
    } catch (error) {
      throw this.toFileSystemProviderError(error);
    }
  }
  async writeFile(resource, content2, opts) {
    try {
      let handle2 = await this.getFileHandle(resource);
      if (!opts.create || !opts.overwrite) {
        if (handle2) {
          if (!opts.overwrite) {
            throw this.createFileSystemProviderError(resource, "File already exists, writeFile", "EntryExists" /* FileExists */);
          }
        } else {
          if (!opts.create) {
            throw this.createFileSystemProviderError(resource, "No such file, writeFile", "EntryNotFound" /* FileNotFound */);
          }
        }
      }
      if (!handle2) {
        const parent = await this.getDirectoryHandle(this.extUri.dirname(resource));
        if (!parent) {
          throw this.createFileSystemProviderError(resource, "No such parent directory, writeFile", "EntryNotFound" /* FileNotFound */);
        }
        handle2 = await parent.getFileHandle(this.extUri.basename(resource), { create: true });
        if (!handle2) {
          throw this.createFileSystemProviderError(resource, "Unable to create file , writeFile", "Unknown" /* Unknown */);
        }
      }
      const writable = await handle2.createWritable();
      await writable.write(content2);
      await writable.close();
    } catch (error) {
      throw this.toFileSystemProviderError(error);
    }
  }
  //#endregion
  //#region Move/Copy/Delete/Create Folder
  async mkdir(resource) {
    try {
      const parent = await this.getDirectoryHandle(this.extUri.dirname(resource));
      if (!parent) {
        throw this.createFileSystemProviderError(resource, "No such parent directory, mkdir", "EntryNotFound" /* FileNotFound */);
      }
      await parent.getDirectoryHandle(this.extUri.basename(resource), { create: true });
    } catch (error) {
      throw this.toFileSystemProviderError(error);
    }
  }
  async delete(resource, opts) {
    try {
      const parent = await this.getDirectoryHandle(this.extUri.dirname(resource));
      if (!parent) {
        throw this.createFileSystemProviderError(resource, "No such parent directory, delete", "EntryNotFound" /* FileNotFound */);
      }
      return parent.removeEntry(this.extUri.basename(resource), { recursive: opts.recursive });
    } catch (error) {
      throw this.toFileSystemProviderError(error);
    }
  }
  async rename(from, to, opts) {
    try {
      if (this.extUri.isEqual(from, to)) {
        return;
      }
      const fileHandle = await this.getFileHandle(from);
      if (fileHandle) {
        const file = await fileHandle.getFile();
        const contents = new Uint8Array(await file.arrayBuffer());
        await this.writeFile(to, contents, { create: true, overwrite: opts.overwrite, unlock: false, atomic: false });
        await this.delete(from, { recursive: false, useTrash: false, atomic: false });
      } else {
        throw this.createFileSystemProviderError(from, localize(3011, null), "Unavailable" /* Unavailable */);
      }
    } catch (error) {
      throw this.toFileSystemProviderError(error);
    }
  }
  watch(resource, opts) {
    const disposables = new DisposableStore();
    this.doWatch(resource, opts, disposables).catch((error) => this.logService.error(`[File Watcher ('FileSystemObserver')] Error: ${error} (${resource})`));
    return disposables;
  }
  async doWatch(resource, opts, disposables) {
    if (!WebFileSystemObserver.supported(globalThis)) {
      return;
    }
    const handle2 = await this.getHandle(resource);
    if (!handle2 || disposables.isDisposed) {
      return;
    }
    const observer = new globalThis.FileSystemObserver((records) => {
      if (disposables.isDisposed) {
        return;
      }
      const events = [];
      for (const record of records) {
        if (this.logService.getLevel() === 1 /* Trace */) {
          this.logService.trace(`[File Watcher ('FileSystemObserver')] [${record.type}] ${joinPath(resource, ...record.relativePathComponents)}`);
        }
        switch (record.type) {
          case "appeared":
            events.push({ resource: joinPath(resource, ...record.relativePathComponents), type: 1 /* ADDED */ });
            break;
          case "disappeared":
            events.push({ resource: joinPath(resource, ...record.relativePathComponents), type: 2 /* DELETED */ });
            break;
          case "modified":
            events.push({ resource: joinPath(resource, ...record.relativePathComponents), type: 0 /* UPDATED */ });
            break;
          case "errored":
            this.logService.trace(`[File Watcher ('FileSystemObserver')] errored, disposing observer (${resource})`);
            disposables.dispose();
        }
      }
      if (events.length) {
        this._onDidChangeFileEmitter.fire(events);
      }
    });
    try {
      await observer.observe(handle2, opts.recursive ? { recursive: true } : void 0);
    } finally {
      if (disposables.isDisposed) {
        observer.disconnect();
      } else {
        disposables.add(toDisposable(() => observer.disconnect()));
      }
    }
  }
  registerFileHandle(handle2) {
    return this.registerHandle(handle2, this._files);
  }
  registerDirectoryHandle(handle2) {
    return this.registerHandle(handle2, this._directories);
  }
  get directories() {
    return this._directories.values();
  }
  async registerHandle(handle2, map) {
    let handleId = `/${handle2.name}`;
    if (map.has(handleId) && !await map.get(handleId)?.isSameEntry(handle2)) {
      const fileExt = extname(handle2.name);
      const fileName = basename(handle2.name, fileExt);
      let handleIdCounter = 1;
      do {
        handleId = `/${fileName}-${handleIdCounter++}${fileExt}`;
      } while (map.has(handleId) && !await map.get(handleId)?.isSameEntry(handle2));
    }
    map.set(handleId, handle2);
    try {
      await this.indexedDB?.runInTransaction(this.store, "readwrite", (objectStore) => objectStore.put(handle2, handleId));
    } catch (error) {
      this.logService.error(error);
    }
    return URI.from({ scheme: Schemas.file, path: handleId });
  }
  async getHandle(resource) {
    let handle2 = await this.doGetHandle(resource);
    if (!handle2) {
      const parent = await this.getDirectoryHandle(this.extUri.dirname(resource));
      if (parent) {
        const name = extUri.basename(resource);
        try {
          handle2 = await parent.getFileHandle(name);
        } catch (error) {
          try {
            handle2 = await parent.getDirectoryHandle(name);
          } catch (error2) {
          }
        }
      }
    }
    return handle2;
  }
  async getFileHandle(resource) {
    const handle2 = await this.doGetHandle(resource);
    if (handle2 instanceof FileSystemFileHandle) {
      return handle2;
    }
    const parent = await this.getDirectoryHandle(this.extUri.dirname(resource));
    try {
      return await parent?.getFileHandle(extUri.basename(resource));
    } catch (error) {
      return void 0;
    }
  }
  async getDirectoryHandle(resource) {
    const handle2 = await this.doGetHandle(resource);
    if (handle2 instanceof FileSystemDirectoryHandle) {
      return handle2;
    }
    const parentUri = this.extUri.dirname(resource);
    if (this.extUri.isEqual(parentUri, resource)) {
      return void 0;
    }
    const parent = await this.getDirectoryHandle(parentUri);
    try {
      return await parent?.getDirectoryHandle(extUri.basename(resource));
    } catch (error) {
      return void 0;
    }
  }
  async doGetHandle(resource) {
    if (this.extUri.dirname(resource).path !== "/") {
      return void 0;
    }
    const handleId = resource.path.replace(/\/$/, "");
    const inMemoryHandle = this._files.get(handleId) ?? this._directories.get(handleId);
    if (inMemoryHandle) {
      return inMemoryHandle;
    }
    const persistedHandle = await this.indexedDB?.runInTransaction(this.store, "readonly", (store) => store.get(handleId));
    if (WebFileSystemAccess.isFileSystemHandle(persistedHandle)) {
      let hasPermissions = await persistedHandle.queryPermission() === "granted";
      try {
        if (!hasPermissions) {
          hasPermissions = await persistedHandle.requestPermission() === "granted";
        }
      } catch (error) {
        this.logService.error(error);
      }
      if (hasPermissions) {
        if (WebFileSystemAccess.isFileSystemFileHandle(persistedHandle)) {
          this._files.set(handleId, persistedHandle);
        } else if (WebFileSystemAccess.isFileSystemDirectoryHandle(persistedHandle)) {
          this._directories.set(handleId, persistedHandle);
        }
        return persistedHandle;
      }
    }
    throw this.createFileSystemProviderError(resource, "No file system handle registered", "Unavailable" /* Unavailable */);
  }
  //#endregion
  toFileSystemProviderError(error) {
    if (error instanceof FileSystemProviderError) {
      return error;
    }
    let code = "Unknown" /* Unknown */;
    if (error.name === "NotAllowedError") {
      error = new Error(localize(3010, null));
      code = "Unavailable" /* Unavailable */;
    }
    return createFileSystemProviderError(error, code);
  }
  createFileSystemProviderError(resource, msg, code) {
    return createFileSystemProviderError(new Error(`${msg} (${normalize(resource.path)})`), code);
  }
};
export { HTMLFileSystemProvider };
