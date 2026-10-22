// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/newChatModelPicker.ts
import { createDecorator } from "./module-0077.mjs";
import { toDisposable } from "./module-0012.mjs";


// src/vs/sessions/contrib/chat/browser/newChatModelPicker.ts
var INewChatModelPickerService = createDecorator("newChatModelPickerService");

var NewChatModelPickerService = class {
  constructor() {
    this._modelPickers = /* @__PURE__ */ new Set();
  }
  registerModelPicker(modelPicker) {
    this._modelPickers.add(modelPicker);
    return toDisposable(() => this._modelPickers.delete(modelPicker));
  }
  openModelPicker() {
    this._getActiveModelPicker()?.open();
  }
  switchToModel(modelIdentifier) {
    return this._getActiveModelPicker()?.switchToModel(modelIdentifier) ?? false;
  }
  _getActiveModelPicker() {
    let activeModelPicker;
    for (const modelPicker of this._modelPickers) {
      activeModelPicker = modelPicker;
    }
    return activeModelPicker;
  }
};
export { INewChatModelPickerService, NewChatModelPickerService };
