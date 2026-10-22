// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/storage/common/storageIpc.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";


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
  updateItems(request2) {
    const serializableRequest = { profile: this.profile, workspace: this.workspace, applicationShared: this.applicationShared };
    if (request2.insert) {
      serializableRequest.insert = Array.from(request2.insert.entries());
    }
    if (request2.delete) {
      serializableRequest.delete = Array.from(request2.delete.values());
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
    this._register(this.channel.listen("onDidChangeStorage", { profile: this.profile, applicationShared: this.applicationShared })((e4) => this.onDidChangeStorage(e4)));
  }
  onDidChangeStorage(e4) {
    if (Array.isArray(e4.changed) || Array.isArray(e4.deleted)) {
      this._onDidChangeItemsExternal.fire({
        changed: e4.changed ? new Map(e4.changed) : void 0,
        deleted: e4.deleted ? new Set(e4.deleted) : void 0
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
    this.onDidChangeItemsExternal = Event2.None;
  }
  async close() {
    this.dispose();
  }
};

var FallbackApplicationStorageDatabaseClient = class extends Disposable {
  constructor(channel) {
    super();
    this.channel = channel;
    this.onDidChangeItemsExternal = Event2.None;
  }
  async getItems() {
    const serializableRequest = { profile: void 0, workspace: void 0, applicationShared: true };
    const items = await this.channel.call("getFallbackApplicationStorageItems", serializableRequest);
    return new Map(items);
  }
  updateItems() {
    throw new Error("Not supported");
  }
  optimize() {
    throw new Error("Not supported");
  }
  close() {
    throw new Error("Not supported");
  }
};
export { BaseStorageDatabaseClient, BaseProfileAwareStorageDatabaseClient, ApplicationStorageDatabaseClient, ApplicationSharedStorageDatabaseClient, ProfileStorageDatabaseClient, WorkspaceStorageDatabaseClient, FallbackApplicationStorageDatabaseClient };
