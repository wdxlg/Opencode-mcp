// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/node/extHostDiskFileSystemProvider.ts
import { Schemas } from "./module-0026.mjs";
import { isLinux } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostConsumerFileSystem } from "./module-0258.mjs";
import { ILogService } from "./module-0062.mjs";
import { DiskFileSystemProvider } from "./module-0489.mjs";


// src/vs/workbench/api/node/extHostDiskFileSystemProvider.ts
var ExtHostDiskFileSystemProvider = class {
  constructor(extHostConsumerFileSystem, logService) {
    extHostConsumerFileSystem.addFileSystemProvider(Schemas.file, new DiskFileSystemProviderAdapter(logService), { isCaseSensitive: isLinux });
  }
};

ExtHostDiskFileSystemProvider = __decorateClass([
  __decorateParam(0, IExtHostConsumerFileSystem),
  __decorateParam(1, ILogService)
], ExtHostDiskFileSystemProvider);

var DiskFileSystemProviderAdapter = class {
  constructor(logService) {
    this.impl = new DiskFileSystemProvider(logService);
  }
  async stat(uri2) {
    const stat2 = await this.impl.stat(uri2);
    return {
      type: stat2.type,
      ctime: stat2.ctime,
      mtime: stat2.mtime,
      size: stat2.size,
      permissions: stat2.permissions === 1 /* Readonly */ ? 1 : void 0
    };
  }
  readDirectory(uri2) {
    return this.impl.readdir(uri2);
  }
  createDirectory(uri2) {
    return this.impl.mkdir(uri2);
  }
  readFile(uri2) {
    return this.impl.readFile(uri2);
  }
  writeFile(uri2, content, options2) {
    return this.impl.writeFile(uri2, content, { ...options2, unlock: false, atomic: false });
  }
  delete(uri2, options2) {
    return this.impl.delete(uri2, { ...options2, useTrash: false, atomic: false });
  }
  rename(oldUri, newUri, options2) {
    return this.impl.rename(oldUri, newUri, options2);
  }
  copy(source, destination, options2) {
    return this.impl.copy(source, destination, options2);
  }
  // --- Not Implemented ---
  get onDidChangeFile() {
    throw new Error("Method not implemented.");
  }
  watch(uri2, options2) {
    throw new Error("Method not implemented.");
  }
};
export { ExtHostDiskFileSystemProvider, DiskFileSystemProviderAdapter };
