// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/terminal/node/ptyHostMain.js
// Original module marker: src/vs/platform/terminal/common/capabilities/promptTypeDetectionCapability.ts
import { Disposable } from "./module-0011.mjs";
import { Emitter } from "./module-0021.mjs";


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
  setPromptType(value) {
    this._promptType = value;
    this._onPromptTypeChanged.fire(value);
  }
};
export { PromptTypeDetectionCapability };
