// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/keybinding/electron-browser/nativeKeyboardLayoutService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ProxyChannel } from "./module-1230.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMainProcessService } from "./module-3825.mjs";
import { OS } from "./module-0014.mjs";
import { macLinuxKeyboardMappingEquals, windowsKeyboardMappingEquals } from "./module-1608.mjs";


// src/vs/workbench/services/keybinding/electron-browser/nativeKeyboardLayoutService.ts
var INativeKeyboardLayoutService = createDecorator("nativeKeyboardLayoutService");

var NativeKeyboardLayoutService = class extends Disposable {
  constructor(mainProcessService) {
    super();
    this._onDidChangeKeyboardLayout = this._register(new Emitter());
    this.onDidChangeKeyboardLayout = this._onDidChangeKeyboardLayout.event;
    this._keyboardLayoutService = ProxyChannel.toService(mainProcessService.getChannel("keyboardLayout"));
    this._initPromise = null;
    this._keyboardMapping = null;
    this._keyboardLayoutInfo = null;
    this._register(this._keyboardLayoutService.onDidChangeKeyboardLayout(async ({ keyboardLayoutInfo, keyboardMapping }) => {
      await this.initialize();
      if (keyboardMappingEquals(this._keyboardMapping, keyboardMapping)) {
        return;
      }
      this._keyboardMapping = keyboardMapping;
      this._keyboardLayoutInfo = keyboardLayoutInfo;
      this._onDidChangeKeyboardLayout.fire();
    }));
  }
  initialize() {
    if (!this._initPromise) {
      this._initPromise = this._doInitialize();
    }
    return this._initPromise;
  }
  async _doInitialize() {
    const keyboardLayoutData = await this._keyboardLayoutService.getKeyboardLayoutData();
    const { keyboardLayoutInfo, keyboardMapping } = keyboardLayoutData;
    this._keyboardMapping = keyboardMapping;
    this._keyboardLayoutInfo = keyboardLayoutInfo;
  }
  getRawKeyboardMapping() {
    return this._keyboardMapping;
  }
  getCurrentKeyboardLayout() {
    return this._keyboardLayoutInfo;
  }
};

NativeKeyboardLayoutService = __decorateClass([
  __decorateParam(0, IMainProcessService)
], NativeKeyboardLayoutService);

function keyboardMappingEquals(a, b) {
  if (OS === 1 /* Windows */) {
    return windowsKeyboardMappingEquals(a, b);
  }
  return macLinuxKeyboardMappingEquals(a, b);
}
export { keyboardMappingEquals, INativeKeyboardLayoutService, NativeKeyboardLayoutService };
