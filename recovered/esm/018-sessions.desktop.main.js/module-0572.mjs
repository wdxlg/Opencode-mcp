// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/services/languageFeatureDebounce.ts
import { createDecorator } from "./module-0077.mjs";
import { LRUCache } from "./module-0008.mjs";
import { doHash } from "./module-0039.mjs";
import { MovingAverage, SlidingWindowAverage, clamp } from "./module-0040.mjs";
import { matchesScheme } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/editor/common/services/languageFeatureDebounce.ts
var ILanguageFeatureDebounceService = createDecorator("ILanguageFeatureDebounceService");

var IdentityHash;

((IdentityHash2) => {
  const _hashes = /* @__PURE__ */ new WeakMap();
  let pool = 0;
  function of(obj) {
    let value2 = _hashes.get(obj);
    if (value2 === void 0) {
      value2 = ++pool;
      _hashes.set(obj, value2);
    }
    return value2;
  }
  IdentityHash2.of = of;
})(IdentityHash || (IdentityHash = {}));

var NullDebounceInformation = class {
  constructor(_default) {
    this._default = _default;
  }
  get(_model) {
    return this._default;
  }
  update(_model, _value) {
    return this._default;
  }
  default() {
    return this._default;
  }
};

var FeatureDebounceInformation = class {
  constructor(_logService, _name, _registry2, _default, _min, _max) {
    this._logService = _logService;
    this._name = _name;
    this._registry = _registry2;
    this._default = _default;
    this._min = _min;
    this._max = _max;
    this._cache = new LRUCache(50, 0.7);
  }
  _key(model) {
    return model.id + this._registry.all(model).reduce((hashVal, obj) => doHash(IdentityHash.of(obj), hashVal), 0);
  }
  get(model) {
    const key3 = this._key(model);
    const avg = this._cache.get(key3);
    return avg ? clamp(avg.value, this._min, this._max) : this.default();
  }
  update(model, value2) {
    const key3 = this._key(model);
    let avg = this._cache.get(key3);
    if (!avg) {
      avg = new SlidingWindowAverage(6);
      this._cache.set(key3, avg);
    }
    const newValue = clamp(avg.update(value2), this._min, this._max);
    if (!matchesScheme(model.uri, "output")) {
      this._logService.trace(`[DEBOUNCE: ${this._name}] for ${model.uri.toString()} is ${newValue}ms`);
    }
    return newValue;
  }
  _overall() {
    const result = new MovingAverage();
    for (const [, avg] of this._cache) {
      result.update(avg.value);
    }
    return result.value;
  }
  default() {
    const value2 = this._overall() | 0 || this._default;
    return clamp(value2, this._min, this._max);
  }
};

var LanguageFeatureDebounceService = class {
  constructor(_logService, envService) {
    this._logService = _logService;
    this._data = /* @__PURE__ */ new Map();
    this._isDev = envService.isExtensionDevelopment || !envService.isBuilt;
  }
  for(feature, name, config) {
    const min = config?.min ?? 50;
    const max = config?.max ?? min ** 2;
    const extra = config?.key ?? void 0;
    const key3 = `${IdentityHash.of(feature)},${min}${extra ? "," + extra : ""}`;
    let info = this._data.get(key3);
    if (!info) {
      if (this._isDev) {
        this._logService.debug(`[DEBOUNCE: ${name}] is disabled in developed mode`);
        info = new NullDebounceInformation(min * 1.5);
      } else {
        info = new FeatureDebounceInformation(
          this._logService,
          name,
          feature,
          this._overallAverage() | 0 || min * 1.5,
          // default is overall default or derived from min-value
          min,
          max
        );
      }
      this._data.set(key3, info);
    }
    return info;
  }
  _overallAverage() {
    const result = new MovingAverage();
    for (const info of this._data.values()) {
      result.update(info.default());
    }
    return result.value;
  }
};

LanguageFeatureDebounceService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IEnvironmentService)
], LanguageFeatureDebounceService);

registerSingleton(ILanguageFeatureDebounceService, LanguageFeatureDebounceService, 1 /* Delayed */);
export { ILanguageFeatureDebounceService, IdentityHash, NullDebounceInformation, FeatureDebounceInformation, LanguageFeatureDebounceService };
