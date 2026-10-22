// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostFileSystemConsumer.ts
import { ResourceQueue } from "./module-0029.mjs";
import { MainContext } from "./module-0054.mjs";
import { VSBuffer } from "./module-0031.mjs";
import { FileSystemError } from "./module-0244.mjs";
import { Schemas } from "./module-0026.mjs";
import { FileSystemProviderError, toFileSystemProviderErrorCode } from "./module-0073.mjs";
import { extUri, extUriIgnorePathCase } from "./module-0027.mjs";
import { toDisposable } from "./module-0011.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0069.mjs";
import { IExtHostFileSystemInfo } from "./module-0077.mjs";
import { createDecorator2 } from "./module-0048.mjs";


// src/vs/workbench/api/common/extHostFileSystemConsumer.ts
var ExtHostConsumerFileSystem = class {
  constructor(extHostRpc, fileSystemInfo) {
    this._fileSystemProvider = /* @__PURE__ */ new Map();
    this._writeQueue = new ResourceQueue();
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadFileSystem);
    const that = this;
    this.value = Object.freeze({
      async stat(uri2) {
        try {
          let stat2;
          const provider = that._fileSystemProvider.get(uri2.scheme);
          if (provider) {
            await that._proxy.$ensureActivation(uri2.scheme);
            stat2 = await provider.impl.stat(uri2);
          } else {
            stat2 = await that._proxy.$stat(uri2);
          }
          return {
            type: stat2.type,
            ctime: stat2.ctime,
            mtime: stat2.mtime,
            size: stat2.size,
            permissions: stat2.permissions === 1 /* Readonly */ ? 1 : void 0
          };
        } catch (err) {
          ExtHostConsumerFileSystem._handleError(err);
        }
      },
      async readDirectory(uri2) {
        try {
          const provider = that._fileSystemProvider.get(uri2.scheme);
          if (provider) {
            await that._proxy.$ensureActivation(uri2.scheme);
            return (await provider.impl.readDirectory(uri2)).slice();
          } else {
            return await that._proxy.$readdir(uri2);
          }
        } catch (err) {
          return ExtHostConsumerFileSystem._handleError(err);
        }
      },
      async createDirectory(uri2) {
        try {
          const provider = that._fileSystemProvider.get(uri2.scheme);
          if (provider && !provider.isReadonly) {
            await that._proxy.$ensureActivation(uri2.scheme);
            return await that.mkdirp(provider.impl, provider.extUri, uri2);
          } else {
            return await that._proxy.$mkdir(uri2);
          }
        } catch (err) {
          return ExtHostConsumerFileSystem._handleError(err);
        }
      },
      async readFile(uri2) {
        try {
          const provider = that._fileSystemProvider.get(uri2.scheme);
          if (provider) {
            await that._proxy.$ensureActivation(uri2.scheme);
            return (await provider.impl.readFile(uri2)).slice();
          } else {
            const buff = await that._proxy.$readFile(uri2);
            return buff.buffer;
          }
        } catch (err) {
          return ExtHostConsumerFileSystem._handleError(err);
        }
      },
      async writeFile(uri2, content) {
        try {
          const provider = that._fileSystemProvider.get(uri2.scheme);
          if (provider && !provider.isReadonly) {
            await that._proxy.$ensureActivation(uri2.scheme);
            await that.mkdirp(provider.impl, provider.extUri, provider.extUri.dirname(uri2));
            return await that._writeQueue.queueFor(uri2, () => Promise.resolve(provider.impl.writeFile(uri2, content, { create: true, overwrite: true })));
          } else {
            return await that._proxy.$writeFile(uri2, VSBuffer.wrap(content));
          }
        } catch (err) {
          return ExtHostConsumerFileSystem._handleError(err);
        }
      },
      async delete(uri2, options2) {
        try {
          const provider = that._fileSystemProvider.get(uri2.scheme);
          if (provider && !provider.isReadonly && !options2?.useTrash) {
            await that._proxy.$ensureActivation(uri2.scheme);
            return await provider.impl.delete(uri2, { recursive: false, ...options2 });
          } else {
            return await that._proxy.$delete(uri2, { recursive: false, useTrash: false, atomic: false, ...options2 });
          }
        } catch (err) {
          return ExtHostConsumerFileSystem._handleError(err);
        }
      },
      async rename(oldUri, newUri, options2) {
        try {
          return await that._proxy.$rename(oldUri, newUri, { ...{ overwrite: false }, ...options2 });
        } catch (err) {
          return ExtHostConsumerFileSystem._handleError(err);
        }
      },
      async copy(source, destination, options2) {
        try {
          return await that._proxy.$copy(source, destination, { ...{ overwrite: false }, ...options2 });
        } catch (err) {
          return ExtHostConsumerFileSystem._handleError(err);
        }
      },
      isWritableFileSystem(scheme) {
        const capabilities = fileSystemInfo.getCapabilities(scheme);
        if (typeof capabilities === "number") {
          return !(capabilities & 2048 /* Readonly */);
        }
        return void 0;
      }
    });
  }
  async mkdirp(provider, providerExtUri, directory) {
    const directoriesToCreate = [];
    while (!providerExtUri.isEqual(directory, providerExtUri.dirname(directory))) {
      try {
        const stat2 = await provider.stat(directory);
        if ((stat2.type & 2 /* Directory */) === 0) {
          throw FileSystemError.FileExists(`Unable to create folder '${directory.scheme === Schemas.file ? directory.fsPath : directory.toString(true)}' that already exists but is not a directory`);
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
    for (let i = directoriesToCreate.length - 1; i >= 0; i--) {
      directory = providerExtUri.joinPath(directory, directoriesToCreate[i]);
      try {
        await provider.createDirectory(directory);
      } catch (error) {
        if (toFileSystemProviderErrorCode(error) !== "EntryExists" /* FileExists */) {
          throw error;
        }
      }
    }
  }
  static _handleError(err) {
    if (err instanceof FileSystemError) {
      throw err;
    }
    if (err instanceof FileSystemProviderError) {
      switch (err.code) {
        case "EntryExists" /* FileExists */:
          throw FileSystemError.FileExists(err.message);
        case "EntryNotFound" /* FileNotFound */:
          throw FileSystemError.FileNotFound(err.message);
        case "EntryNotADirectory" /* FileNotADirectory */:
          throw FileSystemError.FileNotADirectory(err.message);
        case "EntryIsADirectory" /* FileIsADirectory */:
          throw FileSystemError.FileIsADirectory(err.message);
        case "NoPermissions" /* NoPermissions */:
          throw FileSystemError.NoPermissions(err.message);
        case "Unavailable" /* Unavailable */:
          throw FileSystemError.Unavailable(err.message);
        default:
          throw new FileSystemError(err.message, err.name);
      }
    }
    if (!(err instanceof Error)) {
      throw new FileSystemError(String(err));
    }
    if (err.name === "ENOPRO" || err.message.includes("ENOPRO")) {
      throw FileSystemError.Unavailable(err.message);
    }
    switch (err.name) {
      case "EntryExists" /* FileExists */:
        throw FileSystemError.FileExists(err.message);
      case "EntryNotFound" /* FileNotFound */:
        throw FileSystemError.FileNotFound(err.message);
      case "EntryNotADirectory" /* FileNotADirectory */:
        throw FileSystemError.FileNotADirectory(err.message);
      case "EntryIsADirectory" /* FileIsADirectory */:
        throw FileSystemError.FileIsADirectory(err.message);
      case "NoPermissions" /* NoPermissions */:
        throw FileSystemError.NoPermissions(err.message);
      case "Unavailable" /* Unavailable */:
        throw FileSystemError.Unavailable(err.message);
      default:
        throw new FileSystemError(err.message, err.name);
    }
  }
  // ---
  addFileSystemProvider(scheme, provider, options2) {
    this._fileSystemProvider.set(scheme, { impl: provider, extUri: options2?.isCaseSensitive ? extUri : extUriIgnorePathCase, isReadonly: !!options2?.isReadonly });
    return toDisposable(() => this._fileSystemProvider.delete(scheme));
  }
  getFileSystemProviderExtUri(scheme) {
    return this._fileSystemProvider.get(scheme)?.extUri ?? extUri;
  }
};

ExtHostConsumerFileSystem = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostFileSystemInfo)
], ExtHostConsumerFileSystem);

var IExtHostConsumerFileSystem = createDecorator2("IExtHostConsumerFileSystem");
export { ExtHostConsumerFileSystem, IExtHostConsumerFileSystem };
