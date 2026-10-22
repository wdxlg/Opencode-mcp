// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/themes/electron-browser/nativeHostColorSchemeService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { isBoolean, isObject } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3824.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IHostColorSchemeService } from "./module-1626.mjs";


// src/vs/workbench/services/themes/electron-browser/nativeHostColorSchemeService.ts
var NativeHostColorSchemeService = class extends Disposable {
  constructor(nativeHostService, environmentService, storageService, lifecycleService) {
    super();
    this.nativeHostService = nativeHostService;
    this.storageService = storageService;
    this._onDidChangeColorScheme = this._register(new Emitter());
    this.onDidChangeColorScheme = this._onDidChangeColorScheme.event;
    this._register(this.nativeHostService.onDidChangeColorScheme((scheme) => this.update(scheme)));
    let initial = environmentService.window.colorScheme;
    if (lifecycleService.startupKind === 3 /* ReloadedWindow */) {
      initial = this.getStoredValue(initial);
    }
    this.dark = initial.dark;
    this.highContrast = initial.highContrast;
    this.nativeHostService.getOSColorScheme().then((scheme) => this.update(scheme));
  }
  static {
    // we remember the last color scheme value to restore for reloaded window
    this.STORAGE_KEY = "HostColorSchemeData";
  }
  getStoredValue(dftl) {
    const stored = this.storageService.get(NativeHostColorSchemeService.STORAGE_KEY, -1 /* APPLICATION */);
    if (stored) {
      try {
        const scheme = JSON.parse(stored);
        if (isObject(scheme) && isBoolean(scheme.highContrast) && isBoolean(scheme.dark)) {
          return scheme;
        }
      } catch (e4) {
      }
    }
    return dftl;
  }
  update({ highContrast, dark }) {
    if (dark !== this.dark || highContrast !== this.highContrast) {
      this.dark = dark;
      this.highContrast = highContrast;
      this.storageService.store(NativeHostColorSchemeService.STORAGE_KEY, JSON.stringify({ highContrast, dark }), -1 /* APPLICATION */, 1 /* MACHINE */);
      this._onDidChangeColorScheme.fire();
    }
  }
};

NativeHostColorSchemeService = __decorateClass([
  __decorateParam(0, INativeHostService),
  __decorateParam(1, INativeWorkbenchEnvironmentService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, ILifecycleService)
], NativeHostColorSchemeService);

registerSingleton(IHostColorSchemeService, NativeHostColorSchemeService, 1 /* Delayed */);
export { NativeHostColorSchemeService };
