// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/extensionManagement/common/implicitActivationEvents.ts
import { ExtensionIdentifier } from "./module-0688.mjs";
import { onUnexpectedError } from "./module-0004.mjs";


// src/vs/platform/extensionManagement/common/implicitActivationEvents.ts
var ImplicitActivationEventsImpl = class {
  constructor() {
    this._generators = /* @__PURE__ */ new Map();
    this._cache = /* @__PURE__ */ new WeakMap();
  }
  register(extensionPointName, generator) {
    this._generators.set(extensionPointName, generator);
  }
  /**
   * This can run correctly only on the renderer process because that is the only place
   * where all extension points and all implicit activation events generators are known.
   */
  readActivationEvents(extensionDescription) {
    if (!this._cache.has(extensionDescription)) {
      this._cache.set(extensionDescription, this._readActivationEvents(extensionDescription));
    }
    return this._cache.get(extensionDescription);
  }
  /**
   * This can run correctly only on the renderer process because that is the only place
   * where all extension points and all implicit activation events generators are known.
   */
  createActivationEventsMap(extensionDescriptions) {
    const result = /* @__PURE__ */ Object.create(null);
    for (const extensionDescription of extensionDescriptions) {
      const activationEvents = this.readActivationEvents(extensionDescription);
      if (activationEvents.length > 0) {
        result[ExtensionIdentifier.toKey(extensionDescription.identifier)] = activationEvents;
      }
    }
    return result;
  }
  _readActivationEvents(desc) {
    if (typeof desc.main === "undefined" && typeof desc.browser === "undefined") {
      return [];
    }
    const activationEvents = Array.isArray(desc.activationEvents) ? desc.activationEvents.slice(0) : [];
    for (let i2 = 0; i2 < activationEvents.length; i2++) {
      if (activationEvents[i2] === "onUri") {
        activationEvents[i2] = `onUri:${ExtensionIdentifier.toKey(desc.identifier)}`;
      }
    }
    if (!desc.contributes) {
      return activationEvents;
    }
    for (const extPointName in desc.contributes) {
      const generator = this._generators.get(extPointName);
      if (!generator) {
        continue;
      }
      const contrib = desc.contributes[extPointName];
      const contribArr = Array.isArray(contrib) ? contrib : [contrib];
      try {
        activationEvents.push(...generator(contribArr));
      } catch (err) {
        onUnexpectedError(err);
      }
    }
    return activationEvents;
  }
};

var ImplicitActivationEvents = new ImplicitActivationEventsImpl();
export { ImplicitActivationEventsImpl, ImplicitActivationEvents };
