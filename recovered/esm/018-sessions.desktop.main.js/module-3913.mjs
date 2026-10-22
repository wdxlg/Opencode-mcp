// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/update/common/updateIpc.ts
import { DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { State3 } from "./module-1181.mjs";


// src/vs/platform/update/common/updateIpc.ts
var UpdateChannelClient = class {
  constructor(channel) {
    this.channel = channel;
    this.disposables = new DisposableStore();
    this._onStateChange = this.disposables.add(new Emitter());
    this.onStateChange = this._onStateChange.event;
    this._state = State3.Uninitialized;
    this.disposables.add(this.channel.listen("onStateChange")((state) => this.state = state));
    this.channel.call("_getInitialState").then((state) => this.state = state);
  }
  get state() {
    return this._state;
  }
  set state(state) {
    this._state = state;
    this._onStateChange.fire(state);
  }
  checkForUpdates(explicit) {
    return this.channel.call("checkForUpdates", explicit);
  }
  downloadUpdate(explicit) {
    return this.channel.call("downloadUpdate", explicit);
  }
  applyUpdate() {
    return this.channel.call("applyUpdate");
  }
  quitAndInstall() {
    return this.channel.call("quitAndInstall");
  }
  isLatestVersion() {
    return this.channel.call("isLatestVersion");
  }
  _applySpecificUpdate(packagePath) {
    return this.channel.call("_applySpecificUpdate", packagePath);
  }
  setInternalOrg(internalOrg) {
    return this.channel.call("setInternalOrg", internalOrg);
  }
  dispose() {
    this.disposables.dispose();
  }
};
export { UpdateChannelClient };
