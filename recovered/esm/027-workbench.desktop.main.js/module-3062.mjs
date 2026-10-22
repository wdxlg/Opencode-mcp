// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/terminal/common/capabilities/promptTypeDetectionCapability.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/platform/terminal/common/capabilities/promptTypeDetectionCapability.ts
var PromptTypeDetectionCapability = class extends Disposable {
  constructor() {
    super(...arguments);
    this.type = 6 /* PromptTypeDetection */;
    this._onPromptTypeChanged = this._register(new Emitter());
    this.onPromptTypeChanged = this._onPromptTypeChanged.event;
  }
  get promptType() {
    return this._promptType;
  }
  setPromptType(value2) {
    this._promptType = value2;
    this._onPromptTypeChanged.fire(value2);
  }
};
export { PromptTypeDetectionCapability };
