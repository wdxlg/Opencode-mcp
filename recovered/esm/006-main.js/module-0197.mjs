// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/keyboardLayout/electron-main/keyboardLayoutMainService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { init_platform, isCI } from "./module-0006.mjs";
import { Emitter, init_event } from "./module-0021.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";


// src/vs/platform/keyboardLayout/electron-main/keyboardLayoutMainService.ts
function readKeyboardLayoutData(nativeKeymapMod) {
  const keyboardMapping = nativeKeymapMod.getKeyMap();
  const keyboardLayoutInfo = nativeKeymapMod.getCurrentKeyboardLayout();
  return { keyboardMapping, keyboardLayoutInfo };
}

var IKeyboardLayoutMainService, KeyboardLayoutMainService;

var init_keyboardLayoutMainService = __esm({
  "src/vs/platform/keyboardLayout/electron-main/keyboardLayoutMainService.ts"() {
    init_platform();
    init_event();
    init_lifecycle();
    init_instantiation();
    init_lifecycleMainService();
    IKeyboardLayoutMainService = createDecorator("keyboardLayoutMainService");
    KeyboardLayoutMainService = class extends Disposable {
      constructor(lifecycleMainService) {
        super();
        this._onDidChangeKeyboardLayout = this._register(new Emitter());
        this.onDidChangeKeyboardLayout = this._onDidChangeKeyboardLayout.event;
        this._initPromise = null;
        this._keyboardLayoutData = null;
        lifecycleMainService.when(3 /* AfterWindowOpen */).then(() => this._initialize());
      }
      _initialize() {
        if (!this._initPromise) {
          this._initPromise = this._doInitialize();
        }
        return this._initPromise;
      }
      async _doInitialize() {
        const nativeKeymapMod = await import("native-keymap");
        this._keyboardLayoutData = readKeyboardLayoutData(nativeKeymapMod);
        if (!isCI) {
          nativeKeymapMod.onDidChangeKeyboardLayout(() => {
            this._keyboardLayoutData = readKeyboardLayoutData(nativeKeymapMod);
            this._onDidChangeKeyboardLayout.fire(this._keyboardLayoutData);
          });
        }
      }
      async getKeyboardLayoutData() {
        await this._initialize();
        return this._keyboardLayoutData;
      }
    };
    KeyboardLayoutMainService = __decorateClass([
      __decorateParam(0, ILifecycleMainService)
    ], KeyboardLayoutMainService);
  }
});
export { readKeyboardLayoutData, IKeyboardLayoutMainService, KeyboardLayoutMainService, init_keyboardLayoutMainService };
