// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/tokenizationRegistry.ts
import { Emitter } from "./module-0017.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";


// src/vs/editor/common/tokenizationRegistry.ts
var TokenizationRegistry = class {
  constructor() {
    this._tokenizationSupports = /* @__PURE__ */ new Map();
    this._factories = /* @__PURE__ */ new Map();
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
    this._colorMap = null;
  }
  handleChange(languageIds) {
    this._onDidChange.fire({
      changedLanguages: languageIds,
      changedColorMap: false
    });
  }
  register(languageId, support) {
    this._tokenizationSupports.set(languageId, support);
    this.handleChange([languageId]);
    return toDisposable(() => {
      if (this._tokenizationSupports.get(languageId) !== support) {
        return;
      }
      this._tokenizationSupports.delete(languageId);
      this.handleChange([languageId]);
    });
  }
  get(languageId) {
    return this._tokenizationSupports.get(languageId) || null;
  }
  registerFactory(languageId, factory) {
    this._factories.get(languageId)?.dispose();
    const myData = new TokenizationSupportFactoryData(this, languageId, factory);
    this._factories.set(languageId, myData);
    return toDisposable(() => {
      const v2 = this._factories.get(languageId);
      if (!v2 || v2 !== myData) {
        return;
      }
      this._factories.delete(languageId);
      v2.dispose();
    });
  }
  async getOrCreate(languageId) {
    const tokenizationSupport = this.get(languageId);
    if (tokenizationSupport) {
      return tokenizationSupport;
    }
    const factory = this._factories.get(languageId);
    if (!factory || factory.isResolved) {
      return null;
    }
    await factory.resolve();
    return this.get(languageId);
  }
  isResolved(languageId) {
    const tokenizationSupport = this.get(languageId);
    if (tokenizationSupport) {
      return true;
    }
    const factory = this._factories.get(languageId);
    if (!factory || factory.isResolved) {
      return true;
    }
    return false;
  }
  setColorMap(colorMap) {
    this._colorMap = colorMap;
    this._onDidChange.fire({
      changedLanguages: Array.from(this._tokenizationSupports.keys()),
      changedColorMap: true
    });
  }
  getColorMap() {
    return this._colorMap;
  }
  getDefaultBackground() {
    if (this._colorMap && this._colorMap.length > 2 /* DefaultBackground */) {
      return this._colorMap[2 /* DefaultBackground */];
    }
    return null;
  }
};

var TokenizationSupportFactoryData = class extends Disposable {
  constructor(_registry2, _languageId, _factory2) {
    super();
    this._registry = _registry2;
    this._languageId = _languageId;
    this._factory = _factory2;
    this._isDisposed = false;
    this._resolvePromise = null;
    this._isResolved = false;
  }
  get isResolved() {
    return this._isResolved;
  }
  dispose() {
    this._isDisposed = true;
    super.dispose();
  }
  async resolve() {
    if (!this._resolvePromise) {
      this._resolvePromise = this._create();
    }
    return this._resolvePromise;
  }
  async _create() {
    const value2 = await this._factory.tokenizationSupport;
    this._isResolved = true;
    if (value2 && !this._isDisposed) {
      this._register(this._registry.register(this._languageId, value2));
    }
  }
};
export { TokenizationRegistry, TokenizationSupportFactoryData };
