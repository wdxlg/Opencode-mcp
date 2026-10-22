// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/browser/remoteAgentHostLocationPreferenceService.ts
import { isRemoteAgentHostLocationPreference } from "./module-3558.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/platform/agentHost/browser/remoteAgentHostLocationPreferenceService.ts
var REMOTE_AGENT_HOST_LOCATION_PREFERENCE_STORAGE_KEY = "remoteAgentHost.locationPreferences";

function parseRemoteAgentHostLocationPreferences(raw) {
  const preferences = /* @__PURE__ */ new Map();
  if (!raw) {
    return preferences;
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return preferences;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return preferences;
  }
  for (const [hostKey, value2] of Object.entries(parsed)) {
    if (hostKey && isRemoteAgentHostLocationPreference(value2)) {
      preferences.set(hostKey, value2);
    }
  }
  return preferences;
}

var RemoteAgentHostLocationPreferenceService = class extends Disposable {
  constructor(_storageService) {
    super();
    this._storageService = _storageService;
    this._onDidChangePreference = this._register(new Emitter());
    this.onDidChangePreference = this._onDidChangePreference.event;
  }
  getPreference(hostKey) {
    return this._readPreferences().get(hostKey);
  }
  setPreference(hostKey, preference) {
    const preferences = this._readPreferences();
    preferences.set(hostKey, preference);
    this._writePreferences(preferences);
    this._onDidChangePreference.fire(hostKey);
  }
  _readPreferences() {
    return parseRemoteAgentHostLocationPreferences(this._storageService.get(REMOTE_AGENT_HOST_LOCATION_PREFERENCE_STORAGE_KEY, -1 /* APPLICATION */));
  }
  _writePreferences(preferences) {
    if (preferences.size === 0) {
      this._storageService.remove(REMOTE_AGENT_HOST_LOCATION_PREFERENCE_STORAGE_KEY, -1 /* APPLICATION */);
      return;
    }
    this._storageService.store(
      REMOTE_AGENT_HOST_LOCATION_PREFERENCE_STORAGE_KEY,
      JSON.stringify(Object.fromEntries(preferences)),
      -1 /* APPLICATION */,
      0 /* USER */
    );
  }
};

RemoteAgentHostLocationPreferenceService = __decorateClass([
  __decorateParam(0, IStorageService)
], RemoteAgentHostLocationPreferenceService);
export { parseRemoteAgentHostLocationPreferences, REMOTE_AGENT_HOST_LOCATION_PREFERENCE_STORAGE_KEY, RemoteAgentHostLocationPreferenceService };
