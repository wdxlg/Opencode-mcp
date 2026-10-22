// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/localHistory/browser/localHistoryFileSystemProvider.ts
import { Event2 } from "./module-0017.mjs";
import { URI } from "./module-0032.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { hasReadWriteCapability } from "./module-0269.mjs";
import { Disposable } from "./module-0012.mjs";


// src/vs/workbench/contrib/localHistory/browser/localHistoryFileSystemProvider.ts
var LocalHistoryFileSystemProvider = class _LocalHistoryFileSystemProvider {
  constructor(fileService) {
    this.fileService = fileService;
    this.mapSchemeToProvider = /* @__PURE__ */ new Map();
    //#endregion
    //#region Unsupported File Operations
    this.onDidChangeCapabilities = Event2.None;
    this.onDidChangeFile = Event2.None;
  }
  static {
    this.SCHEMA = "vscode-local-history";
  }
  static toLocalHistoryFileSystem(resource) {
    const serializedLocalHistoryResource = {
      location: resource.location.toString(true),
      associatedResource: resource.associatedResource.toString(true)
    };
    return resource.associatedResource.with({
      scheme: _LocalHistoryFileSystemProvider.SCHEMA,
      query: JSON.stringify(serializedLocalHistoryResource)
    });
  }
  static fromLocalHistoryFileSystem(resource) {
    const serializedLocalHistoryResource = JSON.parse(resource.query);
    return {
      location: URI.parse(serializedLocalHistoryResource.location),
      associatedResource: URI.parse(serializedLocalHistoryResource.associatedResource)
    };
  }
  static {
    this.EMPTY_RESOURCE = URI.from({ scheme: _LocalHistoryFileSystemProvider.SCHEMA, path: "/empty" });
  }
  static {
    this.EMPTY = {
      location: _LocalHistoryFileSystemProvider.EMPTY_RESOURCE,
      associatedResource: _LocalHistoryFileSystemProvider.EMPTY_RESOURCE
    };
  }
  get capabilities() {
    return 2 /* FileReadWrite */ | 2048 /* Readonly */;
  }
  async withProvider(resource) {
    const scheme = resource.scheme;
    let providerPromise = this.mapSchemeToProvider.get(scheme);
    if (!providerPromise) {
      const provider = this.fileService.getProvider(scheme);
      if (provider) {
        providerPromise = Promise.resolve(provider);
      } else {
        providerPromise = new Promise((resolve3) => {
          const disposable = this.fileService.onDidChangeFileSystemProviderRegistrations((e) => {
            if (e.added && e.provider && e.scheme === scheme) {
              disposable.dispose();
              resolve3(e.provider);
            }
          });
        });
      }
      this.mapSchemeToProvider.set(scheme, providerPromise);
    }
    return providerPromise;
  }
  //#region Supported File Operations
  async stat(resource) {
    const location2 = _LocalHistoryFileSystemProvider.fromLocalHistoryFileSystem(resource).location;
    if (isEqual2(_LocalHistoryFileSystemProvider.EMPTY_RESOURCE, location2)) {
      return { type: 1 /* File */, ctime: 0, mtime: 0, size: 0 };
    }
    return (await this.withProvider(location2)).stat(location2);
  }
  async readFile(resource) {
    const location2 = _LocalHistoryFileSystemProvider.fromLocalHistoryFileSystem(resource).location;
    if (isEqual2(_LocalHistoryFileSystemProvider.EMPTY_RESOURCE, location2)) {
      return VSBuffer.fromString("").buffer;
    }
    const provider = await this.withProvider(location2);
    if (hasReadWriteCapability(provider)) {
      return provider.readFile(location2);
    }
    throw new Error("Unsupported");
  }
  async writeFile(resource, content2, opts) {
  }
  async mkdir(resource) {
  }
  async readdir(resource) {
    return [];
  }
  async rename(from, to, opts) {
  }
  async delete(resource, opts) {
  }
  watch(resource, opts) {
    return Disposable.None;
  }
  //#endregion
};
export { LocalHistoryFileSystemProvider };
