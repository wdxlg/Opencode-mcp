// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/languageModelSourcePresentation.ts
import { toDisposable } from "./module-0012.mjs";
import { CHATGPT_SUBSCRIPTION_MODEL_SOURCE_ID } from "./module-2161.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/common/languageModelSourcePresentation.ts
var LanguageModelSourcePresentationRegistry = class {
  constructor() {
    this._presentations = /* @__PURE__ */ new Map();
  }
  register(presentation2) {
    const key3 = this._key(presentation2.ownerVendor, presentation2.sourceId);
    if (this._presentations.has(key3)) {
      throw new Error(`A language model source presentation is already registered for ${presentation2.ownerVendor}/${presentation2.sourceId}`);
    }
    this._presentations.set(key3, presentation2);
    return toDisposable(() => {
      if (this._presentations.get(key3) === presentation2) {
        this._presentations.delete(key3);
      }
    });
  }
  get(ownerVendor, sourceId) {
    return this._presentations.get(this._key(ownerVendor, sourceId));
  }
  _key(ownerVendor, sourceId) {
    return `${ownerVendor}\0${sourceId}`;
  }
};

var languageModelSourcePresentationRegistry = new LanguageModelSourcePresentationRegistry();

function getLanguageModelDisplayNameWithSubscriptionSource(model, displayName = model.metadata.name) {
  const modelGroup = model.metadata.modelGroup;
  if (modelGroup?.sourceId !== CHATGPT_SUBSCRIPTION_MODEL_SOURCE_ID) {
    return displayName;
  }
  const sourceLabel = languageModelSourcePresentationRegistry.get(model.metadata.vendor, modelGroup.sourceId)?.label;
  return sourceLabel ? localize(12981, null, displayName, sourceLabel) : displayName;
}
export { getLanguageModelDisplayNameWithSubscriptionSource, LanguageModelSourcePresentationRegistry, languageModelSourcePresentationRegistry };
