// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/customView/browser/customViewService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IStorageService } from "./module-0512.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/sessions/services/customView/browser/customViewService.ts
var ICustomViewService = createDecorator("customViewService");

var ACTIVE_CUSTOM_VIEW_STORAGE_KEY = "sessions.activeCustomView";

var CustomViewService = class extends Disposable {
  constructor(_logService, _storageService) {
    super();
    this._logService = _logService;
    this._storageService = _storageService;
    this._descriptors = /* @__PURE__ */ new Map();
    this._activeCustomView = observableValue(this, void 0);
    this.activeCustomView = this._activeCustomView;
    this._desiredCustomViewId = this._storageService.get(ACTIVE_CUSTOM_VIEW_STORAGE_KEY, 1 /* WORKSPACE */);
  }
  registerCustomView(descriptor, options3) {
    if (this._descriptors.has(descriptor.id)) {
      throw new Error(`A custom view with id '${descriptor.id}' is already registered`);
    }
    this._descriptors.set(descriptor.id, descriptor);
    if (this._desiredCustomViewId === descriptor.id) {
      if (options3?.restore === false) {
        this._desiredCustomViewId = void 0;
        this._storageService.remove(ACTIVE_CUSTOM_VIEW_STORAGE_KEY, 1 /* WORKSPACE */);
      } else {
        this._activeCustomView.set(descriptor, void 0);
      }
    }
    return toDisposable(() => {
      this._descriptors.delete(descriptor.id);
      if (this._activeCustomView.get() === descriptor) {
        this._activeCustomView.set(void 0, void 0);
      }
    });
  }
  showCustomView(id2) {
    const descriptor = this._descriptors.get(id2);
    if (!descriptor) {
      this._logService.warn(`[CustomViewService] showCustomView: no custom view registered with id '${id2}'`);
      return;
    }
    this._desiredCustomViewId = id2;
    this._storageService.store(ACTIVE_CUSTOM_VIEW_STORAGE_KEY, id2, 1 /* WORKSPACE */, 1 /* MACHINE */);
    this._activeCustomView.set(descriptor, void 0);
  }
  hideCustomView() {
    this._desiredCustomViewId = void 0;
    this._storageService.remove(ACTIVE_CUSTOM_VIEW_STORAGE_KEY, 1 /* WORKSPACE */);
    this._activeCustomView.set(void 0, void 0);
  }
};

CustomViewService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IStorageService)
], CustomViewService);

registerSingleton(ICustomViewService, CustomViewService, 1 /* Delayed */);
export { ICustomViewService, ACTIVE_CUSTOM_VIEW_STORAGE_KEY, CustomViewService };
