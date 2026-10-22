// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/observable/common/wrapInHotClass.ts
import { autorunWithStore } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { isHotReloadEnabled } from "./module-0442.mjs";


// src/vs/platform/observable/common/wrapInHotClass.ts
function hotClassGetOriginalInstance(value2) {
  if (value2 instanceof BaseClass) {
    return value2._instance;
  }
  return value2;
}

var BaseClass = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
  }
  init(...params) {
  }
};

function createWrapper(clazz, B) {
  return class ReloadableWrapper extends B {
    constructor() {
      super(...arguments);
      this._autorun = void 0;
    }
    init(...params) {
      this._autorun = autorunWithStore((reader, store) => {
        const clazz_ = clazz.read(reader);
        this._instance = store.add(this.instantiationService.createInstance(clazz_, ...params));
      });
    }
    dispose() {
      this._autorun?.dispose();
    }
  };
}

var BaseClass0 = class extends BaseClass {
  constructor(i2) {
    super(i2);
    this.init();
  }
};

BaseClass0 = __decorateClass([
  __decorateParam(0, IInstantiationService)
], BaseClass0);

function wrapInHotClass1(clazz) {
  return !isHotReloadEnabled() ? clazz.get() : createWrapper(clazz, BaseClass1);
}

var BaseClass1 = class extends BaseClass {
  constructor(param1, i2) {
    super(i2);
    this.init(param1);
  }
};

BaseClass1 = __decorateClass([
  __decorateParam(1, IInstantiationService)
], BaseClass1);
export { hotClassGetOriginalInstance, createWrapper, wrapInHotClass1, BaseClass, BaseClass0, BaseClass1 };
