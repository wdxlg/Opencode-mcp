// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/common/memento.ts
import { onUnexpectedError } from "./module-0003.mjs";
import { isEmptyObject } from "./module-0009.mjs";


// src/vs/workbench/common/memento.ts
var Memento = class _Memento {
  constructor(id2, storageService) {
    this.storageService = storageService;
    this.id = _Memento.COMMON_PREFIX + id2;
  }
  static {
    this.applicationMementos = /* @__PURE__ */ new Map();
  }
  static {
    this.applicationSharedMementos = /* @__PURE__ */ new Map();
  }
  static {
    this.profileMementos = /* @__PURE__ */ new Map();
  }
  static {
    this.workspaceMementos = /* @__PURE__ */ new Map();
  }
  static {
    this.COMMON_PREFIX = "memento/";
  }
  getMemento(scope, target) {
    switch (scope) {
      case 1 /* WORKSPACE */: {
        let workspaceMemento = _Memento.workspaceMementos.get(this.id);
        if (!workspaceMemento) {
          workspaceMemento = new ScopedMemento(this.id, scope, target, this.storageService);
          _Memento.workspaceMementos.set(this.id, workspaceMemento);
        }
        return workspaceMemento.getMemento();
      }
      case 0 /* PROFILE */: {
        let profileMemento = _Memento.profileMementos.get(this.id);
        if (!profileMemento) {
          profileMemento = new ScopedMemento(this.id, scope, target, this.storageService);
          _Memento.profileMementos.set(this.id, profileMemento);
        }
        return profileMemento.getMemento();
      }
      case -1 /* APPLICATION */: {
        let applicationMemento = _Memento.applicationMementos.get(this.id);
        if (!applicationMemento) {
          applicationMemento = new ScopedMemento(this.id, scope, target, this.storageService);
          _Memento.applicationMementos.set(this.id, applicationMemento);
        }
        return applicationMemento.getMemento();
      }
      case -2 /* APPLICATION_SHARED */: {
        let applicationSharedMemento = _Memento.applicationSharedMementos.get(this.id);
        if (!applicationSharedMemento) {
          applicationSharedMemento = new ScopedMemento(this.id, scope, target, this.storageService);
          _Memento.applicationSharedMementos.set(this.id, applicationSharedMemento);
        }
        return applicationSharedMemento.getMemento();
      }
    }
  }
  onDidChangeValue(scope, disposables) {
    return this.storageService.onDidChangeValue(scope, this.id, disposables);
  }
  saveMemento() {
    _Memento.workspaceMementos.get(this.id)?.save();
    _Memento.profileMementos.get(this.id)?.save();
    _Memento.applicationMementos.get(this.id)?.save();
    _Memento.applicationSharedMementos.get(this.id)?.save();
  }
  reloadMemento(scope) {
    let memento;
    switch (scope) {
      case -2 /* APPLICATION_SHARED */:
        memento = _Memento.applicationSharedMementos.get(this.id);
        break;
      case -1 /* APPLICATION */:
        memento = _Memento.applicationMementos.get(this.id);
        break;
      case 0 /* PROFILE */:
        memento = _Memento.profileMementos.get(this.id);
        break;
      case 1 /* WORKSPACE */:
        memento = _Memento.workspaceMementos.get(this.id);
        break;
    }
    memento?.reload();
  }
  static clear(scope) {
    switch (scope) {
      case 1 /* WORKSPACE */:
        _Memento.workspaceMementos.clear();
        break;
      case 0 /* PROFILE */:
        _Memento.profileMementos.clear();
        break;
      case -1 /* APPLICATION */:
        _Memento.applicationMementos.clear();
        break;
      case -2 /* APPLICATION_SHARED */:
        _Memento.applicationSharedMementos.clear();
        break;
    }
  }
};

var ScopedMemento = class {
  constructor(id2, scope, target, storageService) {
    this.id = id2;
    this.scope = scope;
    this.target = target;
    this.storageService = storageService;
    this.mementoObj = this.doLoad();
  }
  doLoad() {
    try {
      return this.storageService.getObject(this.id, this.scope, {});
    } catch (error) {
      onUnexpectedError(`[memento]: failed to parse contents: ${error} (id: ${this.id}, scope: ${this.scope}, contents: ${this.storageService.get(this.id, this.scope)})`);
    }
    return {};
  }
  getMemento() {
    return this.mementoObj;
  }
  reload() {
    for (const name of Object.getOwnPropertyNames(this.mementoObj)) {
      delete this.mementoObj[name];
    }
    Object.assign(this.mementoObj, this.doLoad());
  }
  save() {
    if (!isEmptyObject(this.mementoObj)) {
      this.storageService.store(this.id, this.mementoObj, this.scope, this.target);
    } else {
      this.storageService.remove(this.id, this.scope);
    }
  }
};
export { Memento, ScopedMemento };
