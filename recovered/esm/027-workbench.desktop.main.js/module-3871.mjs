// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/userDataSync/common/userDataSyncServiceIpc.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { UserDataSyncError } from "./module-1696.mjs";
import { IUserDataProfilesService, reviveProfile } from "./module-0511.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";


// src/vs/platform/userDataSync/common/userDataSyncServiceIpc.ts
var UserDataSyncServiceChannelClient = class extends Disposable {
  constructor(userDataSyncChannel, userDataProfilesService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    this._status = "uninitialized" /* Uninitialized */;
    this._onDidChangeStatus = this._register(new Emitter());
    this.onDidChangeStatus = this._onDidChangeStatus.event;
    this._conflicts = [];
    this._onDidChangeConflicts = this._register(new Emitter());
    this.onDidChangeConflicts = this._onDidChangeConflicts.event;
    this._lastSyncTime = void 0;
    this._onDidChangeLastSyncTime = this._register(new Emitter());
    this.onDidChangeLastSyncTime = this._onDidChangeLastSyncTime.event;
    this._onSyncErrors = this._register(new Emitter());
    this.onSyncErrors = this._onSyncErrors.event;
    this.channel = {
      call(command4, arg, cancellationToken) {
        return userDataSyncChannel.call(command4, arg, cancellationToken).then(null, (error) => {
          throw UserDataSyncError.toUserDataSyncError(error);
        });
      },
      listen(event, arg) {
        return userDataSyncChannel.listen(event, arg);
      }
    };
    this.channel.call("_getInitialData").then(([status2, conflicts, lastSyncTime]) => {
      this.updateStatus(status2);
      this.updateConflicts(conflicts);
      if (lastSyncTime) {
        this.updateLastSyncTime(lastSyncTime);
      }
      this._register(this.channel.listen("onDidChangeStatus")((status3) => this.updateStatus(status3)));
      this._register(this.channel.listen("onDidChangeLastSyncTime")((lastSyncTime2) => this.updateLastSyncTime(lastSyncTime2)));
    });
    this._register(this.channel.listen("onDidChangeConflicts")((conflicts) => this.updateConflicts(conflicts)));
    this._register(this.channel.listen("onSyncErrors")((errors) => this._onSyncErrors.fire(errors.map((syncError) => ({ ...syncError, error: UserDataSyncError.toUserDataSyncError(syncError.error) })))));
  }
  get status() {
    return this._status;
  }
  get onDidChangeLocal() {
    return this.channel.listen("onDidChangeLocal");
  }
  get conflicts() {
    return this._conflicts;
  }
  get lastSyncTime() {
    return this._lastSyncTime;
  }
  get onDidResetLocal() {
    return this.channel.listen("onDidResetLocal");
  }
  get onDidResetRemote() {
    return this.channel.listen("onDidResetRemote");
  }
  createSyncTask() {
    throw new Error("not supported");
  }
  async createManualSyncTask() {
    const id2 = await this.channel.call("createManualSyncTask");
    const that = this;
    const manualSyncTaskChannelClient = new ManualSyncTaskChannelClient(id2, {
      async call(command4, arg, cancellationToken) {
        return that.channel.call(`manualSync/${command4}`, [id2, ...Array.isArray(arg) ? arg : [arg]], cancellationToken);
      },
      listen() {
        throw new Error("not supported");
      }
    });
    return manualSyncTaskChannelClient;
  }
  reset() {
    return this.channel.call("reset");
  }
  resetRemote() {
    return this.channel.call("resetRemote");
  }
  resetLocal() {
    return this.channel.call("resetLocal");
  }
  hasPreviouslySynced() {
    return this.channel.call("hasPreviouslySynced");
  }
  hasLocalData() {
    return this.channel.call("hasLocalData");
  }
  accept(syncResource, resource, content2, apply2) {
    return this.channel.call("accept", [syncResource, resource, content2, apply2]);
  }
  resolveContent(resource) {
    return this.channel.call("resolveContent", [resource]);
  }
  cleanUpRemoteData() {
    return this.channel.call("cleanUpRemoteData");
  }
  replace(syncResourceHandle) {
    return this.channel.call("replace", [syncResourceHandle]);
  }
  saveRemoteActivityData(location2) {
    return this.channel.call("getRemoteActivityData", [location2]);
  }
  extractActivityData(activityDataResource, location2) {
    return this.channel.call("extractActivityData", [activityDataResource, location2]);
  }
  async updateStatus(status2) {
    this._status = status2;
    this._onDidChangeStatus.fire(status2);
  }
  async updateConflicts(conflicts) {
    this._conflicts = conflicts.map((syncConflict) => ({
      syncResource: syncConflict.syncResource,
      profile: reviveProfile(syncConflict.profile, this.userDataProfilesService.profilesHome.scheme),
      conflicts: syncConflict.conflicts.map((r2) => ({
        ...r2,
        baseResource: URI.revive(r2.baseResource),
        localResource: URI.revive(r2.localResource),
        remoteResource: URI.revive(r2.remoteResource),
        previewResource: URI.revive(r2.previewResource)
      }))
    }));
    this._onDidChangeConflicts.fire(this._conflicts);
  }
  updateLastSyncTime(lastSyncTime) {
    if (this._lastSyncTime !== lastSyncTime) {
      this._lastSyncTime = lastSyncTime;
      this._onDidChangeLastSyncTime.fire(lastSyncTime);
    }
  }
};

UserDataSyncServiceChannelClient = __decorateClass([
  __decorateParam(1, IUserDataProfilesService)
], UserDataSyncServiceChannelClient);

var ManualSyncTaskChannelClient = class extends Disposable {
  constructor(id2, channel) {
    super();
    this.id = id2;
    this.channel = channel;
  }
  async merge() {
    return this.channel.call("merge");
  }
  async apply() {
    return this.channel.call("apply");
  }
  stop() {
    return this.channel.call("stop");
  }
  dispose() {
    this.channel.call("dispose");
    super.dispose();
  }
};
export { UserDataSyncServiceChannelClient, ManualSyncTaskChannelClient };
