// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/notebook/chatEditingNotebookFileSystemProvider.ts
import { Disposable } from "./module-0012.mjs";
import { ChatEditingNotebookSnapshotScheme } from "./module-2713.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Event2 } from "./module-0017.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { LocalChatSessionUri } from "./module-0961.mjs";
import { IChatEditingService } from "./module-1081.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/notebook/chatEditingNotebookFileSystemProvider.ts
var ChatEditingNotebookFileSystemProviderContrib = class extends Disposable {
  constructor(fileService, instantiationService) {
    super();
    this.fileService = fileService;
    const fileSystemProvider = instantiationService.createInstance(ChatEditingNotebookFileSystemProvider);
    this._register(this.fileService.registerProvider(ChatEditingNotebookSnapshotScheme, fileSystemProvider));
  }
  static {
    this.ID = "chatEditingNotebookFileSystemProviderContribution";
  }
};

ChatEditingNotebookFileSystemProviderContrib = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IInstantiationService)
], ChatEditingNotebookFileSystemProviderContrib);

var ChatEditingNotebookFileSystemProvider = class {
  constructor(_chatEditingService) {
    this._chatEditingService = _chatEditingService;
    this.capabilities = 2048 /* Readonly */ | 16384 /* FileAtomicRead */ | 2 /* FileReadWrite */;
    this.onDidChangeCapabilities = Event2.None;
    this.onDidChangeFile = Event2.None;
  }
  static {
    this.registeredFiles = new ResourceMap();
  }
  static registerFile(resource, buffer) {
    ChatEditingNotebookFileSystemProvider.registeredFiles.set(resource, buffer);
    return {
      dispose() {
        if (ChatEditingNotebookFileSystemProvider.registeredFiles.get(resource) === buffer) {
          ChatEditingNotebookFileSystemProvider.registeredFiles.delete(resource);
        }
      }
    };
  }
  watch(_resource, _opts) {
    return Disposable.None;
  }
  async stat(_resource) {
    return {
      type: 1 /* File */,
      ctime: 0,
      mtime: 0,
      size: 0
    };
  }
  mkdir(_resource) {
    throw new Error("Method not implemented1.");
  }
  readdir(_resource) {
    throw new Error("Method not implemented2.");
  }
  delete(_resource, _opts) {
    throw new Error("Method not implemented3.");
  }
  rename(_from, _to, _opts) {
    throw new Error("Method not implemented4.");
  }
  copy(_from, _to, _opts) {
    throw new Error("Method not implemented5.");
  }
  async readFile(resource) {
    const buffer = ChatEditingNotebookFileSystemProvider.registeredFiles.get(resource);
    if (buffer) {
      return buffer.buffer;
    }
    const queryData = JSON.parse(resource.query);
    if (!queryData.viewType) {
      throw new Error("File not found, viewType not found");
    }
    const session = this._chatEditingService.getEditingSession(LocalChatSessionUri.forSession(queryData.sessionId));
    if (!session || !queryData.requestId) {
      throw new Error("File not found, session not found");
    }
    const snapshotEntry = await session.getSnapshotContents(queryData.requestId, resource, queryData.undoStop || void 0);
    if (!snapshotEntry) {
      throw new Error("File not found, snapshot not found");
    }
    return snapshotEntry.buffer;
  }
  writeFile(__resource, _content, _opts) {
    throw new Error("Method not implemented7.");
  }
  readFileStream(__resource, _opts, _token) {
    throw new Error("Method not implemented8.");
  }
  open(__resource, _opts) {
    throw new Error("Method not implemented9.");
  }
  close(_fd) {
    throw new Error("Method not implemented10.");
  }
  read(_fd, _pos, _data, _offset, _length) {
    throw new Error("Method not implemented11.");
  }
  write(_fd, _pos, _data, _offset, _length) {
    throw new Error("Method not implemented12.");
  }
  cloneFile(_from, __to) {
    throw new Error("Method not implemented13.");
  }
};

ChatEditingNotebookFileSystemProvider = __decorateClass([
  __decorateParam(0, IChatEditingService)
], ChatEditingNotebookFileSystemProvider);
export { ChatEditingNotebookFileSystemProviderContrib, ChatEditingNotebookFileSystemProvider };
