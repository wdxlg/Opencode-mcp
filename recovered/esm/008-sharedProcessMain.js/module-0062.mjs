// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/storage/common/storageIpc.ts
import { Disposable } from "./module-0013.mjs";
import { Emitter, Event } from "./module-0018.mjs";


// src/vs/platform/storage/common/storageIpc.ts
var BaseStorageDatabaseClient = class extends Disposable {
  constructor(channel, profile, workspace) {
    super();
    this.channel = channel;
    this.profile = profile;
    this.workspace = workspace;
  }
  get applicationShared() {
    return false;
  }
  async getItems() {
    const serializableRequest = { profile: this.profile, workspace: this.workspace, applicationShared: this.applicationShared };
    const items = await this.channel.call("getItems", serializableRequest);
    return new Map(items);
  }
  updateItems(request) {
    const serializableRequest = { profile: this.profile, workspace: this.workspace, applicationShared: this.applicationShared };
    if (request.insert) {
      serializableRequest.insert = Array.from(request.insert.entries());
    }
    if (request.delete) {
      serializableRequest.delete = Array.from(request.delete.values());
    }
    return this.channel.call("updateItems", serializableRequest);
  }
  optimize() {
    const serializableRequest = { profile: this.profile, workspace: this.workspace, applicationShared: this.applicationShared };
    return this.channel.call("optimize", serializableRequest);
  }
};

var BaseProfileAwareStorageDatabaseClient = class extends BaseStorageDatabaseClient {
  constructor(channel, profile) {
    super(channel, profile, void 0);
    this._onDidChangeItemsExternal = this._register(new Emitter());
    this.onDidChangeItemsExternal = this._onDidChangeItemsExternal.event;
    this.registerListeners();
  }
  registerListeners() {
    this._register(this.channel.listen("onDidChangeStorage", { profile: this.profile, applicationShared: this.applicationShared })((e) => this.onDidChangeStorage(e)));
  }
  onDidChangeStorage(e) {
    if (Array.isArray(e.changed) || Array.isArray(e.deleted)) {
      this._onDidChangeItemsExternal.fire({
        changed: e.changed ? new Map(e.changed) : void 0,
        deleted: e.deleted ? new Set(e.deleted) : void 0
      });
    }
  }
};

var ApplicationStorageDatabaseClient = class extends BaseProfileAwareStorageDatabaseClient {
  constructor(channel) {
    super(channel, void 0);
  }
  async close() {
    this.dispose();
  }
};

var ApplicationSharedStorageDatabaseClient = class extends BaseProfileAwareStorageDatabaseClient {
  constructor(channel) {
    super(channel, void 0);
  }
  get applicationShared() {
    return true;
  }
  async close() {
    this.dispose();
  }
};

var ProfileStorageDatabaseClient = class extends BaseProfileAwareStorageDatabaseClient {
  async close() {
    this.dispose();
  }
};

var WorkspaceStorageDatabaseClient = class extends BaseStorageDatabaseClient {
  // unsupported for workspace storage because we only ever write from one window
  constructor(channel, workspace) {
    super(channel, void 0, workspace);
    this.onDidChangeItemsExternal = Event.None;
  }
  async close() {
    this.dispose();
  }
};

var StorageClient = class {
  constructor(channel) {
    this.channel = channel;
  }
  isUsed(path) {
    const serializableRequest = { payload: path, profile: void 0, workspace: void 0 };
    return this.channel.call("isUsed", serializableRequest);
  }
};
export { BaseStorageDatabaseClient, BaseProfileAwareStorageDatabaseClient, ApplicationStorageDatabaseClient, ApplicationSharedStorageDatabaseClient, ProfileStorageDatabaseClient, WorkspaceStorageDatabaseClient, StorageClient };
