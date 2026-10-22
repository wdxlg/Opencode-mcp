// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadFileSystem.ts
import { DisposableMap, DisposableStore, toDisposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { URI } from "./module-0032.mjs";
import { FileOperationError, IFileService, toFileSystemProviderErrorCode } from "./module-0269.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { VSBuffer } from "./module-0038.mjs";


// src/vs/workbench/api/browser/mainThreadFileSystem.ts
var MainThreadFileSystem = class {
  constructor(extHostContext, _fileService) {
    this._fileService = _fileService;
    this._fileProvider = new DisposableMap();
    this._disposables = new DisposableStore();
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostFileSystem);
    const infoProxy = extHostContext.getProxy(ExtHostContext.ExtHostFileSystemInfo);
    for (const entry of _fileService.listCapabilities()) {
      infoProxy.$acceptProviderInfos(URI.from({ scheme: entry.scheme, path: "/dummy" }), entry.capabilities);
    }
    this._disposables.add(_fileService.onDidChangeFileSystemProviderRegistrations((e4) => infoProxy.$acceptProviderInfos(URI.from({ scheme: e4.scheme, path: "/dummy" }), e4.provider?.capabilities ?? null)));
    this._disposables.add(_fileService.onDidChangeFileSystemProviderCapabilities((e4) => infoProxy.$acceptProviderInfos(URI.from({ scheme: e4.scheme, path: "/dummy" }), e4.provider.capabilities)));
  }
  dispose() {
    this._disposables.dispose();
    this._fileProvider.dispose();
  }
  async $registerFileSystemProvider(handle2, scheme, capabilities, readonlyMessage) {
    this._fileProvider.set(handle2, new RemoteFileSystemProvider(this._fileService, scheme, capabilities, readonlyMessage, handle2, this._proxy));
  }
  $unregisterProvider(handle2) {
    this._fileProvider.deleteAndDispose(handle2);
  }
  $onFileSystemChange(handle2, changes) {
    const fileProvider = this._fileProvider.get(handle2);
    if (!fileProvider) {
      throw new Error("Unknown file provider");
    }
    fileProvider.$onFileSystemChange(changes);
  }
  // --- consumer fs, vscode.workspace.fs
  async $stat(uri4) {
    try {
      const stat = await this._fileService.stat(URI.revive(uri4));
      return {
        ctime: stat.ctime,
        mtime: stat.mtime,
        size: stat.size,
        permissions: stat.readonly ? 1 /* Readonly */ : void 0,
        type: MainThreadFileSystem._asFileType(stat)
      };
    } catch (err) {
      return MainThreadFileSystem._handleError(err);
    }
  }
  async $readdir(uri4) {
    try {
      const stat = await this._fileService.resolve(URI.revive(uri4), { resolveMetadata: false });
      if (!stat.isDirectory) {
        const err = new Error(stat.name);
        err.name = "EntryNotADirectory" /* FileNotADirectory */;
        throw err;
      }
      return !stat.children ? [] : stat.children.map((child) => [child.name, MainThreadFileSystem._asFileType(child)]);
    } catch (err) {
      return MainThreadFileSystem._handleError(err);
    }
  }
  static _asFileType(stat) {
    let res = 0;
    if (stat.isFile) {
      res += 1 /* File */;
    } else if (stat.isDirectory) {
      res += 2 /* Directory */;
    }
    if (stat.isSymbolicLink) {
      res += 64 /* SymbolicLink */;
    }
    return res;
  }
  async $readFile(uri4) {
    try {
      const file = await this._fileService.readFile(URI.revive(uri4));
      return file.value;
    } catch (err) {
      return MainThreadFileSystem._handleError(err);
    }
  }
  async $writeFile(uri4, content) {
    try {
      await this._fileService.writeFile(URI.revive(uri4), content);
    } catch (err) {
      return MainThreadFileSystem._handleError(err);
    }
  }
  async $rename(source, target, opts) {
    try {
      await this._fileService.move(URI.revive(source), URI.revive(target), opts.overwrite);
    } catch (err) {
      return MainThreadFileSystem._handleError(err);
    }
  }
  async $copy(source, target, opts) {
    try {
      await this._fileService.copy(URI.revive(source), URI.revive(target), opts.overwrite);
    } catch (err) {
      return MainThreadFileSystem._handleError(err);
    }
  }
  async $mkdir(uri4) {
    try {
      await this._fileService.createFolder(URI.revive(uri4));
    } catch (err) {
      return MainThreadFileSystem._handleError(err);
    }
  }
  async $delete(uri4, opts) {
    try {
      return await this._fileService.del(URI.revive(uri4), opts);
    } catch (err) {
      return MainThreadFileSystem._handleError(err);
    }
  }
  static _handleError(err) {
    if (err instanceof FileOperationError) {
      switch (err.fileOperationResult) {
        case 1 /* FILE_NOT_FOUND */:
          err.name = "EntryNotFound" /* FileNotFound */;
          break;
        case 0 /* FILE_IS_DIRECTORY */:
          err.name = "EntryIsADirectory" /* FileIsADirectory */;
          break;
        case 6 /* FILE_PERMISSION_DENIED */:
          err.name = "NoPermissions" /* NoPermissions */;
          break;
        case 4 /* FILE_MOVE_CONFLICT */:
          err.name = "EntryExists" /* FileExists */;
          break;
      }
    } else if (err instanceof Error) {
      const code = toFileSystemProviderErrorCode(err);
      if (code !== "Unknown" /* Unknown */) {
        err.name = code;
      }
    }
    throw err;
  }
  $ensureActivation(scheme) {
    return this._fileService.activateProvider(scheme);
  }
};

MainThreadFileSystem = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadFileSystem),
  __decorateParam(1, IFileService)
], MainThreadFileSystem);

var RemoteFileSystemProvider = class _RemoteFileSystemProvider {
  constructor(fileService, scheme, capabilities, readOnlyMessage, _handle, _proxy) {
    this.readOnlyMessage = readOnlyMessage;
    this._handle = _handle;
    this._proxy = _proxy;
    this._onDidChange = new Emitter();
    this.onDidChangeFile = this._onDidChange.event;
    this.onDidChangeCapabilities = Event2.None;
    this.capabilities = capabilities;
    this._registration = fileService.registerProvider(scheme, this);
  }
  dispose() {
    this._registration.dispose();
    this._onDidChange.dispose();
  }
  watch(resource, opts) {
    const session = Math.random();
    this._proxy.$watch(this._handle, session, resource, opts);
    return toDisposable(() => {
      this._proxy.$unwatch(this._handle, session);
    });
  }
  $onFileSystemChange(changes) {
    this._onDidChange.fire(changes.map(_RemoteFileSystemProvider._createFileChange));
  }
  static _createFileChange(dto) {
    return { resource: URI.revive(dto.resource), type: dto.type };
  }
  // --- forwarding calls
  async stat(resource) {
    try {
      return await this._proxy.$stat(this._handle, resource);
    } catch (err) {
      throw err;
    }
  }
  async readFile(resource) {
    const buffer = await this._proxy.$readFile(this._handle, resource);
    return buffer.buffer;
  }
  writeFile(resource, content, opts) {
    return this._proxy.$writeFile(this._handle, resource, VSBuffer.wrap(content), opts);
  }
  delete(resource, opts) {
    return this._proxy.$delete(this._handle, resource, opts);
  }
  mkdir(resource) {
    return this._proxy.$mkdir(this._handle, resource);
  }
  readdir(resource) {
    return this._proxy.$readdir(this._handle, resource);
  }
  rename(resource, target, opts) {
    return this._proxy.$rename(this._handle, resource, target, opts);
  }
  copy(resource, target, opts) {
    return this._proxy.$copy(this._handle, resource, target, opts);
  }
  open(resource, opts) {
    return this._proxy.$open(this._handle, resource, opts);
  }
  close(fd) {
    return this._proxy.$close(this._handle, fd);
  }
  async read(fd, pos, data, offset, length) {
    const readData = await this._proxy.$read(this._handle, fd, pos, length);
    data.set(readData.buffer, offset);
    return readData.byteLength;
  }
  write(fd, pos, data, offset, length) {
    return this._proxy.$write(this._handle, fd, pos, VSBuffer.wrap(data).slice(offset, offset + length));
  }
};
export { MainThreadFileSystem, RemoteFileSystemProvider };
