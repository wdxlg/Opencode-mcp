// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/editSessions/browser/editSessionsFileSystemProvider.ts
import { Event2 } from "./module-0017.mjs";
import { EDIT_SESSIONS_SCHEME, IEditSessionsStorageService, decodeEditSessionFileContent } from "./module-3626.mjs";
import { Disposable } from "./module-0012.mjs";
import { NotSupportedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";


// src/vs/workbench/contrib/editSessions/browser/editSessionsFileSystemProvider.ts
var EditSessionsFileSystemProvider = class {
  constructor(editSessionsStorageService) {
    this.editSessionsStorageService = editSessionsStorageService;
    this.capabilities = 2048 /* Readonly */ + 2 /* FileReadWrite */;
    //#region Unsupported file operations
    this.onDidChangeCapabilities = Event2.None;
    this.onDidChangeFile = Event2.None;
  }
  static {
    this.SCHEMA = EDIT_SESSIONS_SCHEME;
  }
  async readFile(resource) {
    const match2 = /(?<ref>[^/]+)\/(?<folderName>[^/]+)\/(?<filePath>.*)/.exec(resource.path.substring(1));
    if (!match2?.groups) {
      throw "EntryNotFound" /* FileNotFound */;
    }
    const { ref, folderName, filePath } = match2.groups;
    const data = await this.editSessionsStorageService.read("editSessions", ref);
    if (!data) {
      throw "EntryNotFound" /* FileNotFound */;
    }
    const content2 = JSON.parse(data.content);
    const change = content2.folders.find((f) => f.name === folderName)?.workingChanges.find((change2) => change2.relativeFilePath === filePath);
    if (!change || change.type === 2 /* Deletion */) {
      throw "EntryNotFound" /* FileNotFound */;
    }
    return decodeEditSessionFileContent(content2.version, change.contents).buffer;
  }
  async stat(resource) {
    const content2 = await this.readFile(resource);
    const currentTime = Date.now();
    return {
      type: 1 /* File */,
      permissions: 1 /* Readonly */,
      mtime: currentTime,
      ctime: currentTime,
      size: content2.byteLength
    };
  }
  watch(resource, opts) {
    return Disposable.None;
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
  async writeFile() {
    throw new NotSupportedError();
  }
  //#endregion
};

EditSessionsFileSystemProvider = __decorateClass([
  __decorateParam(0, IEditSessionsStorageService)
], EditSessionsFileSystemProvider);
export { EditSessionsFileSystemProvider };
