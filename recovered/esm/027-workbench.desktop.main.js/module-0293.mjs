// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/model/textModelPart.ts
import { Disposable } from "./module-0012.mjs";


// src/vs/editor/common/model/textModelPart.ts
var TextModelPart = class extends Disposable {
  constructor() {
    super(...arguments);
    this._isDisposed = false;
  }
  dispose() {
    super.dispose();
    this._isDisposed = true;
  }
  assertNotDisposed() {
    if (this._isDisposed) {
      throw new Error("TextModelPart is disposed!");
    }
  }
};
export { TextModelPart };
