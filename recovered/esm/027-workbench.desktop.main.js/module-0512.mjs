// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/storage/common/storage.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, MutableDisposable, dispose } from "./module-0012.mjs";
import { Emitter, Event2, PauseableEmitter } from "./module-0017.mjs";
import { Promises, RunOnceScheduler, runWhenGlobalIdle } from "./module-0036.mjs";
import { mark } from "./module-0506.mjs";
import { isUndefinedOrNull } from "./module-0010.mjs";
import { isUserDataProfile } from "./module-0511.mjs";
import { InMemoryStorageDatabase, Storage } from "./module-0507.mjs";


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
  constructor(options3 = { flushInterval: _AbstractStorageService.DEFAULT_FLUSH_INTERVAL }) {
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
    this.flushWhenIdleScheduler = this._register(new RunOnceScheduler(() => this.doFlushWhenIdle(), options3.flushInterval));
  }
  static {
    this.DEFAULT_FLUSH_INTERVAL = 60 * 1e3;
  }
  onDidChangeValue(scope, key3, disposable) {
    return Event2.filter(this._onDidChangeValue.event, (e) => e.scope === scope && (key3 === void 0 || e.key === key3), disposable);
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
    const { key: key3, external } = event;
    if (key3 === TARGET_KEY) {
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
      this._onDidChangeValue.fire({ scope, key: key3, target: this.getKeyTargets(scope)[key3], external });
    }
  }
  emitWillSaveState(reason) {
    this._onWillSaveState.fire({ reason });
  }
  get(key3, scope, fallbackValue) {
    return this.getStorage(scope)?.get(key3, fallbackValue);
  }
  getBoolean(key3, scope, fallbackValue) {
    return this.getStorage(scope)?.getBoolean(key3, fallbackValue);
  }
  getNumber(key3, scope, fallbackValue) {
    return this.getStorage(scope)?.getNumber(key3, fallbackValue);
  }
  getObject(key3, scope, fallbackValue) {
    return this.getStorage(scope)?.getObject(key3, fallbackValue);
  }
  storeAll(entries2, external) {
    this.withPausedEmitters(() => {
      for (const entry of entries2) {
        this.store(entry.key, entry.value, entry.scope, entry.target, external);
      }
    });
  }
  store(key3, value2, scope, target, external = false) {
    if (isUndefinedOrNull(value2)) {
      this.remove(key3, scope, external);
      return;
    }
    this.withPausedEmitters(() => {
      this.updateKeyTarget(key3, scope, target);
      this.getStorage(scope)?.set(key3, value2, external);
    });
  }
  remove(key3, scope, external = false) {
    this.withPausedEmitters(() => {
      this.updateKeyTarget(key3, scope, void 0);
      this.getStorage(scope)?.delete(key3, external);
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
    for (const key3 of Object.keys(keyTargets)) {
      const keyTarget = keyTargets[key3];
      if (keyTarget === target) {
        keys.push(key3);
      }
    }
    return keys;
  }
  updateKeyTarget(key3, scope, target, external = false) {
    const keyTargets = this.getKeyTargets(scope);
    if (typeof target === "number") {
      if (keyTargets[key3] !== target) {
        keyTargets[key3] = target;
        this.getStorage(scope)?.set(TARGET_KEY, JSON.stringify(keyTargets), external);
      }
    } else {
      if (typeof keyTargets[key3] === "number") {
        delete keyTargets[key3];
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
      for (const [key3, oldValue] of oldStorage) {
        handledkeys.add(key3);
        const newValue = newStorage.get(key3);
        if (newValue !== oldValue) {
          this.emitDidChangeValue(scope, { key: key3, external: true });
        }
      }
      for (const [key3] of newStorage.items) {
        if (!handledkeys.has(key3)) {
          this.emitDidChangeValue(scope, { key: key3, external: true });
        }
      }
    });
  }
};

function isProfileUsingDefaultStorage(profile) {
  return profile.isDefault || !!profile.useDefaultFlags?.globalState;
}

var InMemoryStorageService = class extends AbstractStorageService {
  constructor() {
    super();
    this.applicationStorage = this._register(new Storage(new InMemoryStorageDatabase(), { hint: 1 /* STORAGE_IN_MEMORY */ }));
    this.applicationSharedStorage = this._register(new Storage(new InMemoryStorageDatabase(), { hint: 1 /* STORAGE_IN_MEMORY */ }));
    this.profileStorage = this._register(new Storage(new InMemoryStorageDatabase(), { hint: 1 /* STORAGE_IN_MEMORY */ }));
    this.workspaceStorage = this._register(new Storage(new InMemoryStorageDatabase(), { hint: 1 /* STORAGE_IN_MEMORY */ }));
    this._register(this.workspaceStorage.onDidChangeStorage((e) => this.emitDidChangeValue(1 /* WORKSPACE */, e)));
    this._register(this.profileStorage.onDidChangeStorage((e) => this.emitDidChangeValue(0 /* PROFILE */, e)));
    this._register(this.applicationStorage.onDidChangeStorage((e) => this.emitDidChangeValue(-1 /* APPLICATION */, e)));
    this._register(this.applicationSharedStorage.onDidChangeStorage((e) => this.emitDidChangeValue(-2 /* APPLICATION_SHARED */, e)));
  }
  getStorage(scope) {
    switch (scope) {
      case -2 /* APPLICATION_SHARED */:
        return this.applicationSharedStorage;
      case -1 /* APPLICATION */:
        return this.applicationStorage;
      case 0 /* PROFILE */:
        return this.profileStorage;
      default:
        return this.workspaceStorage;
    }
  }
  getLogDetails(scope) {
    switch (scope) {
      case -2 /* APPLICATION_SHARED */:
        return "inMemory (application-shared)";
      case -1 /* APPLICATION */:
        return "inMemory (application)";
      case 0 /* PROFILE */:
        return "inMemory (profile)";
      default:
        return "inMemory (workspace)";
    }
  }
  async doInitialize() {
  }
  async switchToProfile() {
  }
  async switchToWorkspace() {
  }
  shouldFlushWhenIdle() {
    return false;
  }
  hasScope(scope) {
    return false;
  }
};

async function logStorage(application, applicationShared, profile, workspace, applicationPath, applicationSharedPath, profilePath, workspacePath) {
  const safeParse = (value2) => {
    try {
      return JSON.parse(value2);
    } catch (error) {
      return value2;
    }
  };
  const applicationItems = /* @__PURE__ */ new Map();
  const applicationItemsParsed = /* @__PURE__ */ new Map();
  application.forEach((value2, key3) => {
    applicationItems.set(key3, value2);
    applicationItemsParsed.set(key3, safeParse(value2));
  });
  const applicationSharedItems = /* @__PURE__ */ new Map();
  const applicationSharedItemsParsed = /* @__PURE__ */ new Map();
  applicationShared.forEach((value2, key3) => {
    applicationSharedItems.set(key3, value2);
    applicationSharedItemsParsed.set(key3, safeParse(value2));
  });
  const profileItems = /* @__PURE__ */ new Map();
  const profileItemsParsed = /* @__PURE__ */ new Map();
  profile.forEach((value2, key3) => {
    profileItems.set(key3, value2);
    profileItemsParsed.set(key3, safeParse(value2));
  });
  const workspaceItems = /* @__PURE__ */ new Map();
  const workspaceItemsParsed = /* @__PURE__ */ new Map();
  workspace.forEach((value2, key3) => {
    workspaceItems.set(key3, value2);
    workspaceItemsParsed.set(key3, safeParse(value2));
  });
  if (applicationPath !== profilePath) {
    console.group(`Storage: Application (path: ${applicationPath})`);
  } else {
    console.group(`Storage: Application & Profile (path: ${applicationPath}, default profile)`);
  }
  const applicationValues = [];
  applicationItems.forEach((value2, key3) => {
    applicationValues.push({ key: key3, value: value2 });
  });
  console.table(applicationValues);
  console.groupEnd();
  console.log(applicationItemsParsed);
  console.group(`Storage: Application Shared (path: ${applicationSharedPath})`);
  const applicationSharedValues = [];
  applicationSharedItems.forEach((value2, key3) => {
    applicationSharedValues.push({ key: key3, value: value2 });
  });
  console.table(applicationSharedValues);
  console.groupEnd();
  console.log(applicationSharedItemsParsed);
  if (applicationPath !== profilePath) {
    console.group(`Storage: Profile (path: ${profilePath}, profile specific)`);
    const profileValues = [];
    profileItems.forEach((value2, key3) => {
      profileValues.push({ key: key3, value: value2 });
    });
    console.table(profileValues);
    console.groupEnd();
    console.log(profileItemsParsed);
  }
  console.group(`Storage: Workspace (path: ${workspacePath})`);
  const workspaceValues = [];
  workspaceItems.forEach((value2, key3) => {
    workspaceValues.push({ key: key3, value: value2 });
  });
  console.table(workspaceValues);
  console.groupEnd();
  console.log(workspaceItemsParsed);
}
export { loadKeyTargets, isProfileUsingDefaultStorage, logStorage, IS_NEW_KEY, TARGET_KEY, IStorageService, AbstractStorageService, InMemoryStorageService };
