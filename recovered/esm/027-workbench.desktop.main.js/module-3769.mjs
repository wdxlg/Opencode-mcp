// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/policy/common/fileManagedSettingsIpc.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { equals4 } from "./module-0098.mjs";


// src/vs/platform/policy/common/fileManagedSettingsIpc.ts
var FileManagedSettingsChannelClient = class extends Disposable {
  constructor(channel) {
    super();
    this._rawManagedSettings = {};
    this.hasReceivedRawManagedSettings = false;
    this._managedSettings = {};
    this.hasReceivedManagedSettings = false;
    this._onDidChangeRawManagedSettings = this._register(new Emitter());
    this.onDidChangeRawManagedSettings = this._onDidChangeRawManagedSettings.event;
    this._onDidChangeManagedSettings = this._register(new Emitter());
    this.onDidChangeManagedSettings = this._onDidChangeManagedSettings.event;
    this._register(channel.listen("onDidChangeRawManagedSettings")((managedSettings) => this.updateRawManagedSettings(managedSettings, true)));
    this._register(channel.listen("onDidChangeManagedSettings")((managedSettings) => this.updateManagedSettings(managedSettings, true)));
    const rawSnapshot = channel.call("getRawManagedSettings").then((managedSettings) => {
      if (!this.hasReceivedRawManagedSettings) {
        this.updateRawManagedSettings(managedSettings, true);
      }
    });
    const managedSnapshot = channel.call("getManagedSettings").then((managedSettings) => {
      if (!this.hasReceivedManagedSettings) {
        this.updateManagedSettings(managedSettings, true);
      }
    });
    this.initialSnapshot = Promise.all([rawSnapshot, managedSnapshot]).then(() => void 0);
  }
  get rawManagedSettings() {
    return this._rawManagedSettings;
  }
  get managedSettings() {
    return this._managedSettings;
  }
  async initialize() {
    await this.initialSnapshot;
    return this._managedSettings;
  }
  updateRawManagedSettings(managedSettings, fireEvent) {
    this.hasReceivedRawManagedSettings = true;
    if (equals4(this._rawManagedSettings, managedSettings)) {
      return;
    }
    this._rawManagedSettings = managedSettings;
    if (fireEvent) {
      this._onDidChangeRawManagedSettings.fire(this._rawManagedSettings);
    }
  }
  updateManagedSettings(managedSettings, fireEvent) {
    this.hasReceivedManagedSettings = true;
    if (equals4(this._managedSettings, managedSettings)) {
      return;
    }
    this._managedSettings = managedSettings;
    if (fireEvent) {
      this._onDidChangeManagedSettings.fire(this._managedSettings);
    }
  }
};
export { FileManagedSettingsChannelClient };
