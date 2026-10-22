// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/layout/browser/singlePane/singlePaneVisibilityProfileStore.ts
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/sessions/contrib/layout/browser/singlePane/singlePaneVisibilityProfileStore.ts
var SINGLE_PANE_VISIBILITY_STATE_KEY = "sessions.singlePane.sidePaneVisibility";

var DEFAULT_NEW_SESSION_VISIBILITY_STATE = {
  editorVisible: false,
  auxiliaryBarVisible: true
};

var DEFAULT_EXISTING_SESSION_VISIBILITY_STATE = {
  editorVisible: true,
  auxiliaryBarVisible: false
};

var SinglePaneVisibilityProfileStore = class {
  constructor(_storageService) {
    this._storageService = _storageService;
    this._profiles = {
      newSession: DEFAULT_NEW_SESSION_VISIBILITY_STATE,
      existingSession: DEFAULT_EXISTING_SESSION_VISIBILITY_STATE
    };
    this._load();
  }
  get(profile) {
    return profile === 0 /* New */ ? this._profiles.newSession : this._profiles.existingSession;
  }
  set(profile, state) {
    this._profiles = profile === 0 /* New */ ? { ...this._profiles, newSession: state } : { ...this._profiles, existingSession: state };
    this._storageService.store(SINGLE_PANE_VISIBILITY_STATE_KEY, JSON.stringify(this._profiles), 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  _load() {
    const raw = this._storageService.get(SINGLE_PANE_VISIBILITY_STATE_KEY, 1 /* WORKSPACE */);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (this._isVisibilityState(parsed?.newSession) && this._isVisibilityState(parsed?.existingSession)) {
        this._profiles = {
          newSession: parsed.newSession,
          existingSession: parsed.existingSession
        };
      } else if (this._isVisibilityState(parsed)) {
        this._profiles = { ...this._profiles, existingSession: parsed };
      } else {
        this._storageService.remove(SINGLE_PANE_VISIBILITY_STATE_KEY, 1 /* WORKSPACE */);
      }
    } catch {
      this._storageService.remove(SINGLE_PANE_VISIBILITY_STATE_KEY, 1 /* WORKSPACE */);
    }
  }
  _isVisibilityState(value2) {
    return typeof value2?.editorVisible === "boolean" && typeof value2.auxiliaryBarVisible === "boolean";
  }
};

SinglePaneVisibilityProfileStore = __decorateClass([
  __decorateParam(0, IStorageService)
], SinglePaneVisibilityProfileStore);
export { SINGLE_PANE_VISIBILITY_STATE_KEY, DEFAULT_NEW_SESSION_VISIBILITY_STATE, DEFAULT_EXISTING_SESSION_VISIBILITY_STATE, SinglePaneVisibilityProfileStore };
