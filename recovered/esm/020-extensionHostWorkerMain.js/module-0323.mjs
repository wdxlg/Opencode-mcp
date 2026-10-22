// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostMeteredConnection.ts
import { createDecorator } from "./module-0038.mjs";
import { Disposable } from "./module-0011.mjs";
import { Emitter } from "./module-0019.mjs";


// src/vs/workbench/api/common/extHostMeteredConnection.ts
var IExtHostMeteredConnection = createDecorator("IExtHostMeteredConnection");

var ExtHostMeteredConnection = class extends Disposable {
  constructor() {
    super();
    this._isConnectionMetered = false;
    this._onDidChangeIsConnectionMetered = this._register(new Emitter());
    this.onDidChangeIsConnectionMetered = this._onDidChangeIsConnectionMetered.event;
  }
  get isConnectionMetered() {
    return this._isConnectionMetered;
  }
  $initializeIsConnectionMetered(isMetered) {
    this._isConnectionMetered = isMetered;
  }
  $onDidChangeIsConnectionMetered(isMetered) {
    if (this._isConnectionMetered !== isMetered) {
      this._isConnectionMetered = isMetered;
      this._onDidChangeIsConnectionMetered.fire(isMetered);
    }
  }
};
export { IExtHostMeteredConnection, ExtHostMeteredConnection };
