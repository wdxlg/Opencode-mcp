// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/widget/chatResponseResourceFileSystemProvider.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { ResourceMap, ResourceSet } from "./module-0008.mjs";
import { URI } from "./module-0032.mjs";
import { ChatResponseResource } from "./module-1193.mjs";
import { generateUuid } from "./module-0190.mjs";
import { createSingleCallFunction } from "./module-0005.mjs";
import { newWriteableStream } from "./module-0037.mjs";
import { VSBuffer, decodeBase64 } from "./module-0038.mjs";
import { IFileService, createFileSystemProviderError } from "./module-0269.mjs";
import { IChatService, IChatToolInvocation } from "./module-0972.mjs";
import { isToolResultInputOutputDetails } from "./module-0990.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";


// src/vs/workbench/contrib/chat/common/widget/chatResponseResourceFileSystemProvider.ts
var IChatResponseResourceFileSystemProvider = createDecorator("chatResponseResourceFileSystemProvider");

var ChatResponseResourceFileSystemProvider = class extends Disposable {
  constructor(chatService, _fileService) {
    super();
    this.chatService = chatService;
    this._fileService = _fileService;
    this.onDidChangeCapabilities = Event2.None;
    this.onDidChangeFile = Event2.None;
    this.capabilities = 0 /* None */ | 2048 /* Readonly */ | 1024 /* PathCaseSensitive */ | 16 /* FileReadStream */ | 16384 /* FileAtomicRead */ | 2 /* FileReadWrite */;
    /** In-memory store for data associated via {@link associate}, keyed by URI. */
    this._associated = new ResourceMap();
    /** Tracks which associated URIs belong to which session, for cleanup on dispose. */
    this._sessionAssociations = new ResourceMap();
    this._register(this.chatService.onDidDisposeSession((e) => {
      for (const sessionResource of e.sessionResources) {
        const uris = this._sessionAssociations.get(sessionResource);
        if (!uris) {
          continue;
        }
        for (const uri5 of [...uris]) {
          const entry = this._associated.get(uri5);
          if (entry) {
            this._forget(uri5, entry);
          }
        }
        this._sessionAssociations.delete(sessionResource);
      }
    }));
  }
  associate(data, options3) {
    const uri5 = URI.from({
      scheme: ChatResponseResource.scheme,
      path: `/assoc/${options3?.id ?? generateUuid()}` + (options3?.name ? `/${options3.name}` : "")
    });
    let entry = this._associated.get(uri5);
    if (entry) {
      entry.data = data;
      entry.refCount++;
    } else {
      entry = { data, refCount: 1, sessionResources: new ResourceSet() };
      this._associated.set(uri5, entry);
    }
    if (options3?.sessionResource) {
      entry.sessionResources.add(options3.sessionResource);
      let set = this._sessionAssociations.get(options3.sessionResource);
      if (!set) {
        set = new ResourceSet();
        this._sessionAssociations.set(options3.sessionResource, set);
      }
      set.add(uri5);
    }
    return {
      resource: uri5,
      // Guarded so a repeated dispose cannot release a reference it does not own.
      dispose: createSingleCallFunction(() => this._release(uri5))
    };
  }
  /** Drops one reference to the data at `uri`, releasing it once none are left. */
  _release(uri5) {
    const entry = this._associated.get(uri5);
    if (!entry || --entry.refCount > 0) {
      return;
    }
    this._forget(uri5, entry);
  }
  /** Releases the data at `uri` along with every session's claim on it. */
  _forget(uri5, entry) {
    this._associated.delete(uri5);
    for (const sessionResource of entry.sessionResources) {
      const uris = this._sessionAssociations.get(sessionResource);
      if (uris?.delete(uri5) && uris.size === 0) {
        this._sessionAssociations.delete(sessionResource);
      }
    }
  }
  readFile(resource) {
    return Promise.resolve(this.lookupURI(resource));
  }
  readFileStream(resource) {
    const stream = newWriteableStream((data) => VSBuffer.concat(data.map((data2) => VSBuffer.wrap(data2))).buffer);
    Promise.resolve(this.lookupURI(resource)).then((v2) => stream.end(v2));
    return stream;
  }
  async stat(resource) {
    const r2 = await this.lookupURI(resource);
    return {
      type: 1 /* File */,
      ctime: 0,
      mtime: 0,
      size: r2.length
    };
  }
  delete() {
    throw createFileSystemProviderError("fs is readonly", "NoPermissions" /* NoPermissions */);
  }
  watch() {
    return Disposable.None;
  }
  mkdir() {
    throw createFileSystemProviderError("fs is readonly", "NoPermissions" /* NoPermissions */);
  }
  readdir() {
    return Promise.resolve([]);
  }
  rename() {
    throw createFileSystemProviderError("fs is readonly", "NoPermissions" /* NoPermissions */);
  }
  writeFile() {
    throw createFileSystemProviderError("fs is readonly", "NoPermissions" /* NoPermissions */);
  }
  findMatchingInvocation(uri5) {
    const parsed = ChatResponseResource.parseUri(uri5);
    if (!parsed) {
      throw createFileSystemProviderError(`File not found`, "EntryNotFound" /* FileNotFound */);
    }
    const { sessionResource, toolCallId, index: index2 } = parsed;
    const session = this.chatService.getSession(sessionResource);
    if (!session) {
      throw createFileSystemProviderError(`File not found`, "EntryNotFound" /* FileNotFound */);
    }
    const requests = session.getRequests();
    for (let k = requests.length - 1; k >= 0; k--) {
      const req = requests[k];
      const tc = req.response?.entireResponse.value.find((r2) => (r2.kind === "toolInvocation" || r2.kind === "toolInvocationSerialized") && r2.toolCallId === toolCallId);
      if (tc) {
        return { result: tc, index: index2 };
      }
    }
    throw createFileSystemProviderError(`File not found`, "EntryNotFound" /* FileNotFound */);
  }
  lookupURI(uri5) {
    const associated = this._associated.get(uri5);
    if (associated) {
      if (associated.data instanceof Uint8Array) {
        return associated.data;
      }
      const decoded = decodeBase64(associated.data.base64).buffer;
      associated.data = decoded;
      return decoded;
    }
    const { result, index: index2 } = this.findMatchingInvocation(uri5);
    const details = IChatToolInvocation.resultDetails(result);
    if (!isToolResultInputOutputDetails(details)) {
      throw createFileSystemProviderError(`Tool does not have I/O`, "EntryNotFound" /* FileNotFound */);
    }
    const part = details.output.at(index2);
    if (!part) {
      throw createFileSystemProviderError(`Tool does not have part`, "EntryNotFound" /* FileNotFound */);
    }
    if (part.type === "ref") {
      return this._fileService.readFile(part.uri).then((r2) => r2.value.buffer);
    }
    return part.isText ? new TextEncoder().encode(part.value) : decodeBase64(part.value).buffer;
  }
};

ChatResponseResourceFileSystemProvider = __decorateClass([
  __decorateParam(0, IChatService),
  __decorateParam(1, IFileService)
], ChatResponseResourceFileSystemProvider);

var ChatResponseResourceWorkbenchContribution = class extends Disposable {
  static {
    this.ID = "chatResponseResourceWorkbenchContribution";
  }
  constructor(chatResponseResourceFsProvider, fileService) {
    super();
    this._register(fileService.registerProvider(ChatResponseResource.scheme, chatResponseResourceFsProvider));
  }
};

ChatResponseResourceWorkbenchContribution = __decorateClass([
  __decorateParam(0, IChatResponseResourceFileSystemProvider),
  __decorateParam(1, IFileService)
], ChatResponseResourceWorkbenchContribution);
export { IChatResponseResourceFileSystemProvider, ChatResponseResourceFileSystemProvider, ChatResponseResourceWorkbenchContribution };
