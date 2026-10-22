// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/policy/common/nativeManagedSettingsIpc.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { getErrorMessage } from "./module-0004.mjs";
import { equals4 } from "./module-0098.mjs";


// src/vs/platform/policy/common/nativeManagedSettingsIpc.ts
var NativeManagedSettingsChannelClient = class extends Disposable {
  constructor(channel, logService) {
    super();
    this.channel = channel;
    this.logService = logService;
    this._managedSettings = {};
    this.hasReceivedManagedSettings = false;
    this._onDidChangeManagedSettings = this._register(new Emitter());
    this.onDidChangeManagedSettings = this._onDidChangeManagedSettings.event;
    this._register(this.channel.listen("onDidChangeManagedSettings")((managedSettings) => this.updateManagedSettings(managedSettings, true)));
    void this.initializeInBackground();
  }
  get managedSettings() {
    return this._managedSettings;
  }
  async initializeInBackground() {
    try {
      await this.initialize();
    } catch (error) {
      this.logService.warn("NativeManagedSettingsChannelClient#initialize - Failed to initialize native managed settings", getErrorMessage(error));
    }
  }
  async initialize() {
    const initializationPromise = this.initializationPromise ?? this.initializeFromChannel();
    this.initializationPromise = initializationPromise;
    try {
      await initializationPromise;
    } catch (error) {
      if (this.initializationPromise === initializationPromise) {
        this.initializationPromise = void 0;
      }
      throw error;
    }
    return this._managedSettings;
  }
  async initializeFromChannel() {
    const managedSettings = await this.channel.call("getManagedSettings");
    if (!this.hasReceivedManagedSettings) {
      this.updateManagedSettings(managedSettings, true);
    }
  }
  async updatePolicyDefinitions(policyDefinitions) {
    this.updateManagedSettings(await this.channel.call("updatePolicyDefinitions", policyDefinitions), false);
    return this._managedSettings;
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
export { NativeManagedSettingsChannelClient };
