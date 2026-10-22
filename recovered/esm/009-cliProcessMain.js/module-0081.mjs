// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/storage/common/storage.ts
import { createDecorator } from "./module-0030.mjs";
import { Disposable, MutableDisposable, dispose } from "./module-0011.mjs";
import { Emitter, Event, PauseableEmitter } from "./module-0017.mjs";
import { Promises, RunOnceScheduler, runWhenGlobalIdle } from "./module-0028.mjs";
import { mark } from "./module-0075.mjs";
import { isUndefinedOrNull } from "./module-0009.mjs";
import { isUserDataProfile } from "./module-0080.mjs";


// src/vs/platform/storage/common/storage.ts
var IS_NEW_KEY = "__$__isNewStorageMarker";

var TARGET_KEY = "__$__targetStorageMarker";

var IStorageService = createDecorator("storageService");

function loadKeyTargets(storage) {
  const keysRaw = storage.get(TARGET_KEY);
  if (keysRaw) {
    try {
      return JSON.parse(keysRaw);
    } catch (error) {
    }
  }
  return /* @__PURE__ */ Object.create(null);
}

var AbstractStorageService = class _AbstractStorageService extends Disposable {
  constructor(options = { flushInterval: _AbstractStorageService.DEFAULT_FLUSH_INTERVAL }) {
    super();
    // every minute
    this._onDidChangeValue = this._register(new PauseableEmitter());
    this._onDidChangeTarget = this._register(new PauseableEmitter());
    this.onDidChangeTarget = this._onDidChangeTarget.event;
    this._onWillSaveState = this._register(new Emitter());
    this.onWillSaveState = this._onWillSaveState.event;
    this.runFlushWhenIdle = this._register(new MutableDisposable());
    this._workspaceKeyTargets = void 0;
    this._profileKeyTargets = void 0;
    this._applicationKeyTargets = void 0;
    this._applicationSharedKeyTargets = void 0;
    this.flushWhenIdleScheduler = this._register(new RunOnceScheduler(() => this.doFlushWhenIdle(), options.flushInterval));
  }
  static {
    this.DEFAULT_FLUSH_INTERVAL = 60 * 1e3;
  }
  onDidChangeValue(scope, key, disposable) {
    return Event.filter(this._onDidChangeValue.event, (e) => e.scope === scope && (key === void 0 || e.key === key), disposable);
  }
  doFlushWhenIdle() {
    this.runFlushWhenIdle.value = runWhenGlobalIdle(() => {
      if (this.shouldFlushWhenIdle()) {
        this.flush();
      }
      this.flushWhenIdleScheduler.schedule();
    });
  }
  shouldFlushWhenIdle() {
    return true;
  }
  stopFlushWhenIdle() {
    dispose([this.runFlushWhenIdle, this.flushWhenIdleScheduler]);
  }
  initialize() {
    if (!this.initializationPromise) {
      this.initializationPromise = (async () => {
        mark("code/willInitStorage");
        try {
          await this.doInitialize();
        } finally {
          mark("code/didInitStorage");
        }
        this.flushWhenIdleScheduler.schedule();
      })();
    }
    return this.initializationPromise;
  }
  emitDidChangeValue(scope, event) {
    const { key, external } = event;
    if (key === TARGET_KEY) {
      switch (scope) {
        case -2 /* APPLICATION_SHARED */:
          this._applicationSharedKeyTargets = void 0;
          break;
        case -1 /* APPLICATION */:
          this._applicationKeyTargets = void 0;
          break;
        case 0 /* PROFILE */:
          this._profileKeyTargets = void 0;
          break;
        case 1 /* WORKSPACE */:
          this._workspaceKeyTargets = void 0;
          break;
      }
      this._onDidChangeTarget.fire({ scope });
    } else {
      this._onDidChangeValue.fire({ scope, key, target: this.getKeyTargets(scope)[key], external });
    }
  }
  emitWillSaveState(reason) {
    this._onWillSaveState.fire({ reason });
  }
  get(key, scope, fallbackValue) {
    return this.getStorage(scope)?.get(key, fallbackValue);
  }
  getBoolean(key, scope, fallbackValue) {
    return this.getStorage(scope)?.getBoolean(key, fallbackValue);
  }
  getNumber(key, scope, fallbackValue) {
    return this.getStorage(scope)?.getNumber(key, fallbackValue);
  }
  getObject(key, scope, fallbackValue) {
    return this.getStorage(scope)?.getObject(key, fallbackValue);
  }
  storeAll(entries, external) {
    this.withPausedEmitters(() => {
      for (const entry of entries) {
        this.store(entry.key, entry.value, entry.scope, entry.target, external);
      }
    });
  }
  store(key, value, scope, target, external = false) {
    if (isUndefinedOrNull(value)) {
      this.remove(key, scope, external);
      return;
    }
    this.withPausedEmitters(() => {
      this.updateKeyTarget(key, scope, target);
      this.getStorage(scope)?.set(key, value, external);
    });
  }
  remove(key, scope, external = false) {
    this.withPausedEmitters(() => {
      this.updateKeyTarget(key, scope, void 0);
      this.getStorage(scope)?.delete(key, external);
    });
  }
  withPausedEmitters(fn) {
    this._onDidChangeValue.pause();
    this._onDidChangeTarget.pause();
    try {
      fn();
    } finally {
      this._onDidChangeValue.resume();
      this._onDidChangeTarget.resume();
    }
  }
  keys(scope, target) {
    const keys = [];
    const keyTargets = this.getKeyTargets(scope);
    for (const key of Object.keys(keyTargets)) {
      const keyTarget = keyTargets[key];
      if (keyTarget === target) {
        keys.push(key);
      }
    }
    return keys;
  }
  updateKeyTarget(key, scope, target, external = false) {
    const keyTargets = this.getKeyTargets(scope);
    if (typeof target === "number") {
      if (keyTargets[key] !== target) {
        keyTargets[key] = target;
        this.getStorage(scope)?.set(TARGET_KEY, JSON.stringify(keyTargets), external);
      }
    } else {
      if (typeof keyTargets[key] === "number") {
        delete keyTargets[key];
        this.getStorage(scope)?.set(TARGET_KEY, JSON.stringify(keyTargets), external);
      }
    }
  }
  get workspaceKeyTargets() {
    if (!this._workspaceKeyTargets) {
      this._workspaceKeyTargets = this.loadKeyTargets(1 /* WORKSPACE */);
    }
    return this._workspaceKeyTargets;
  }
  get profileKeyTargets() {
    if (!this._profileKeyTargets) {
      this._profileKeyTargets = this.loadKeyTargets(0 /* PROFILE */);
    }
    return this._profileKeyTargets;
  }
  get applicationKeyTargets() {
    if (!this._applicationKeyTargets) {
      this._applicationKeyTargets = this.loadKeyTargets(-1 /* APPLICATION */);
    }
    return this._applicationKeyTargets;
  }
  get applicationSharedKeyTargets() {
    if (!this._applicationSharedKeyTargets) {
      this._applicationSharedKeyTargets = this.loadKeyTargets(-2 /* APPLICATION_SHARED */);
    }
    return this._applicationSharedKeyTargets;
  }
  getKeyTargets(scope) {
    switch (scope) {
      case -2 /* APPLICATION_SHARED */:
        return this.applicationSharedKeyTargets;
      case -1 /* APPLICATION */:
        return this.applicationKeyTargets;
      case 0 /* PROFILE */:
        return this.profileKeyTargets;
      default:
        return this.workspaceKeyTargets;
    }
  }
  loadKeyTargets(scope) {
    const storage = this.getStorage(scope);
    return storage ? loadKeyTargets(storage) : /* @__PURE__ */ Object.create(null);
  }
  isNew(scope) {
    return this.getBoolean(IS_NEW_KEY, scope) === true;
  }
  async flush(reason = 0 /* NONE */) {
    this._onWillSaveState.fire({ reason });
    const applicationStorage = this.getStorage(-1 /* APPLICATION */);
    const applicationSharedStorage = this.getStorage(-2 /* APPLICATION_SHARED */);
    const profileStorage = this.getStorage(0 /* PROFILE */);
    const workspaceStorage = this.getStorage(1 /* WORKSPACE */);
    switch (reason) {
      // Unspecific reason: just wait when data is flushed
      case 0 /* NONE */:
        await Promises.settled([
          applicationStorage?.whenFlushed() ?? Promise.resolve(),
          applicationSharedStorage?.whenFlushed() ?? Promise.resolve(),
          profileStorage?.whenFlushed() ?? Promise.resolve(),
          workspaceStorage?.whenFlushed() ?? Promise.resolve()
        ]);
        break;
      // Shutdown: we want to flush as soon as possible
      // and not hit any delays that might be there
      case 1 /* SHUTDOWN */:
        await Promises.settled([
          applicationStorage?.flush(0) ?? Promise.resolve(),
          applicationSharedStorage?.flush(0) ?? Promise.resolve(),
          profileStorage?.flush(0) ?? Promise.resolve(),
          workspaceStorage?.flush(0) ?? Promise.resolve()
        ]);
        break;
    }
  }
  async log() {
    const applicationItems = this.getStorage(-1 /* APPLICATION */)?.items ?? /* @__PURE__ */ new Map();
    const applicationSharedItems = this.getStorage(-2 /* APPLICATION_SHARED */)?.items ?? /* @__PURE__ */ new Map();
    const profileItems = this.getStorage(0 /* PROFILE */)?.items ?? /* @__PURE__ */ new Map();
    const workspaceItems = this.getStorage(1 /* WORKSPACE */)?.items ?? /* @__PURE__ */ new Map();
    return logStorage(
      applicationItems,
      applicationSharedItems,
      profileItems,
      workspaceItems,
      this.getLogDetails(-1 /* APPLICATION */) ?? "",
      this.getLogDetails(-2 /* APPLICATION_SHARED */) ?? "",
      this.getLogDetails(0 /* PROFILE */) ?? "",
      this.getLogDetails(1 /* WORKSPACE */) ?? ""
    );
  }
  async optimize(scope) {
    await this.flush();
    return this.getStorage(scope)?.optimize();
  }
  async switch(to, preserveData) {
    this.emitWillSaveState(0 /* NONE */);
    if (isUserDataProfile(to)) {
      return this.switchToProfile(to, preserveData);
    }
    return this.switchToWorkspace(to, preserveData);
  }
  canSwitchProfile(from, to) {
    if (from.id === to.id) {
      return false;
    }
    if (isProfileUsingDefaultStorage(to) && isProfileUsingDefaultStorage(from)) {
      return false;
    }
    return true;
  }
  switchData(oldStorage, newStorage, scope) {
    this.withPausedEmitters(() => {
      const handledkeys = /* @__PURE__ */ new Set();
      for (const [key, oldValue] of oldStorage) {
        handledkeys.add(key);
        const newValue = newStorage.get(key);
        if (newValue !== oldValue) {
          this.emitDidChangeValue(scope, { key, external: true });
        }
      }
      for (const [key] of newStorage.items) {
        if (!handledkeys.has(key)) {
          this.emitDidChangeValue(scope, { key, external: true });
        }
      }
    });
  }
};

function isProfileUsingDefaultStorage(profile) {
  return profile.isDefault || !!profile.useDefaultFlags?.globalState;
}

async function logStorage(application, applicationShared, profile, workspace, applicationPath, applicationSharedPath, profilePath, workspacePath) {
  const safeParse = (value) => {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  };
  const applicationItems = /* @__PURE__ */ new Map();
  const applicationItemsParsed = /* @__PURE__ */ new Map();
  application.forEach((value, key) => {
    applicationItems.set(key, value);
    applicationItemsParsed.set(key, safeParse(value));
  });
  const applicationSharedItems = /* @__PURE__ */ new Map();
  const applicationSharedItemsParsed = /* @__PURE__ */ new Map();
  applicationShared.forEach((value, key) => {
    applicationSharedItems.set(key, value);
    applicationSharedItemsParsed.set(key, safeParse(value));
  });
  const profileItems = /* @__PURE__ */ new Map();
  const profileItemsParsed = /* @__PURE__ */ new Map();
  profile.forEach((value, key) => {
    profileItems.set(key, value);
    profileItemsParsed.set(key, safeParse(value));
  });
  const workspaceItems = /* @__PURE__ */ new Map();
  const workspaceItemsParsed = /* @__PURE__ */ new Map();
  workspace.forEach((value, key) => {
    workspaceItems.set(key, value);
    workspaceItemsParsed.set(key, safeParse(value));
  });
  if (applicationPath !== profilePath) {
    console.group(`Storage: Application (path: ${applicationPath})`);
  } else {
    console.group(`Storage: Application & Profile (path: ${applicationPath}, default profile)`);
  }
  const applicationValues = [];
  applicationItems.forEach((value, key) => {
    applicationValues.push({ key, value });
  });
  console.table(applicationValues);
  console.groupEnd();
  console.log(applicationItemsParsed);
  console.group(`Storage: Application Shared (path: ${applicationSharedPath})`);
  const applicationSharedValues = [];
  applicationSharedItems.forEach((value, key) => {
    applicationSharedValues.push({ key, value });
  });
  console.table(applicationSharedValues);
  console.groupEnd();
  console.log(applicationSharedItemsParsed);
  if (applicationPath !== profilePath) {
    console.group(`Storage: Profile (path: ${profilePath}, profile specific)`);
    const profileValues = [];
    profileItems.forEach((value, key) => {
      profileValues.push({ key, value });
    });
    console.table(profileValues);
    console.groupEnd();
    console.log(profileItemsParsed);
  }
  console.group(`Storage: Workspace (path: ${workspacePath})`);
  const workspaceValues = [];
  workspaceItems.forEach((value, key) => {
    workspaceValues.push({ key, value });
  });
  console.table(workspaceValues);
  console.groupEnd();
  console.log(workspaceItemsParsed);
}
export { loadKeyTargets, isProfileUsingDefaultStorage, logStorage, IS_NEW_KEY, TARGET_KEY, IStorageService, AbstractStorageService };
