// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/common/dialogs.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { DeferredPromise } from "./module-0036.mjs";


// src/vs/workbench/common/dialogs.ts
var DialogsModel = class extends Disposable {
  constructor() {
    super(...arguments);
    this.dialogs = [];
    this._onWillShowDialog = this._register(new Emitter());
    this.onWillShowDialog = this._onWillShowDialog.event;
    this._onDidShowDialog = this._register(new Emitter());
    this.onDidShowDialog = this._onDidShowDialog.event;
  }
  show(dialog) {
    const promise = new DeferredPromise();
    const item = {
      args: dialog,
      close: (result) => {
        this.dialogs.splice(0, 1);
        if (result instanceof Error) {
          promise.error(result);
        } else {
          promise.complete(result);
        }
        this._onDidShowDialog.fire();
      }
    };
    this.dialogs.push(item);
    this._onWillShowDialog.fire();
    return {
      item,
      result: promise.p
    };
  }
};
export { DialogsModel };
