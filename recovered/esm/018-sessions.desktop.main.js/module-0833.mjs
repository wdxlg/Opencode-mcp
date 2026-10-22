// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/observable/common/wrapInReloadableClass.ts
import { isHotReloadEnabled } from "./module-0442.mjs";
import { autorunWithStore } from "./module-0052.mjs";
import { readHotReloadableExport } from "./module-0443.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/platform/observable/common/wrapInReloadableClass.ts
function wrapInReloadableClass0(getClass) {
  return !isHotReloadEnabled() ? getClass() : createWrapper2(getClass, BaseClass02);
}

var BaseClass2 = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
  }
  init(...params) {
  }
};

function createWrapper2(getClass, B) {
  return class ReloadableWrapper extends B {
    constructor() {
      super(...arguments);
      this._autorun = void 0;
    }
    init(...params) {
      this._autorun = autorunWithStore((reader, store) => {
        const clazz = readHotReloadableExport(getClass(), reader);
        store.add(this.instantiationService.createInstance(clazz, ...params));
      });
    }
    dispose() {
      this._autorun?.dispose();
    }
  };
}

var BaseClass02 = class extends BaseClass2 {
  constructor(i2) {
    super(i2);
    this.init();
  }
};

BaseClass02 = __decorateClass([
  __decorateParam(0, IInstantiationService)
], BaseClass02);

function wrapInReloadableClass1(getClass) {
  return !isHotReloadEnabled() ? getClass() : createWrapper2(getClass, BaseClass12);
}

var BaseClass12 = class extends BaseClass2 {
  constructor(param1, i2) {
    super(i2);
    this.init(param1);
  }
};

BaseClass12 = __decorateClass([
  __decorateParam(1, IInstantiationService)
], BaseClass12);
export { wrapInReloadableClass0, createWrapper2, wrapInReloadableClass1, BaseClass2, BaseClass02, BaseClass12 };
