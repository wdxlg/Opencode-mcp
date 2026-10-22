// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/common/extensionRunningLocation.ts



// src/vs/workbench/services/extensions/common/extensionRunningLocation.ts
var LocalProcessRunningLocation = class {
  constructor(affinity) {
    this.affinity = affinity;
    this.kind = 1 /* LocalProcess */;
  }
  equals(other) {
    return this.kind === other.kind && this.affinity === other.affinity;
  }
  asString() {
    if (this.affinity === 0) {
      return "LocalProcess";
    }
    return `LocalProcess${this.affinity}`;
  }
};

var LocalWebWorkerRunningLocation = class {
  constructor(affinity) {
    this.affinity = affinity;
    this.kind = 2 /* LocalWebWorker */;
  }
  equals(other) {
    return this.kind === other.kind && this.affinity === other.affinity;
  }
  asString() {
    if (this.affinity === 0) {
      return "LocalWebWorker";
    }
    return `LocalWebWorker${this.affinity}`;
  }
};

var RemoteRunningLocation = class {
  constructor() {
    this.kind = 3 /* Remote */;
    this.affinity = 0;
  }
  equals(other) {
    return this.kind === other.kind;
  }
  asString() {
    return "Remote";
  }
};
export { LocalProcessRunningLocation, LocalWebWorkerRunningLocation, RemoteRunningLocation };
