// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/keybinding/electron-browser/nativeKeyboardLayout.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { readKeyboardConfig } from "./module-3833.mjs";
import { FallbackKeyboardMapper } from "./module-3831.mjs";
import { OS } from "./module-0014.mjs";
import { CachedKeyboardMapper } from "./module-3829.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeKeyboardLayoutService } from "./module-3757.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { WindowsKeyboardMapper } from "./module-1858.mjs";
import { MacLinuxKeyboardMapper } from "./module-3832.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IKeyboardLayoutService } from "./module-1665.mjs";


// src/vs/workbench/services/keybinding/electron-browser/nativeKeyboardLayout.ts
var KeyboardLayoutService = class extends Disposable {
  constructor(_nativeKeyboardLayoutService, _configurationService) {
    super();
    this._nativeKeyboardLayoutService = _nativeKeyboardLayoutService;
    this._configurationService = _configurationService;
    this._onDidChangeKeyboardLayout = this._register(new Emitter());
    this.onDidChangeKeyboardLayout = this._onDidChangeKeyboardLayout.event;
    this._keyboardMapper = null;
    this._register(this._nativeKeyboardLayoutService.onDidChangeKeyboardLayout(async () => {
      this._keyboardMapper = null;
      this._onDidChangeKeyboardLayout.fire();
    }));
    this._register(_configurationService.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration("keyboard")) {
        this._keyboardMapper = null;
        this._onDidChangeKeyboardLayout.fire();
      }
    }));
  }
  getRawKeyboardMapping() {
    return this._nativeKeyboardLayoutService.getRawKeyboardMapping();
  }
  getCurrentKeyboardLayout() {
    return this._nativeKeyboardLayoutService.getCurrentKeyboardLayout();
  }
  getAllKeyboardLayouts() {
    return [];
  }
  getKeyboardMapper() {
    const config = readKeyboardConfig(this._configurationService);
    if (config.dispatch === 1 /* KeyCode */) {
      return new FallbackKeyboardMapper(config.mapAltGrToCtrlAlt, OS);
    }
    if (!this._keyboardMapper) {
      this._keyboardMapper = new CachedKeyboardMapper(createKeyboardMapper(this.getCurrentKeyboardLayout(), this.getRawKeyboardMapping(), config.mapAltGrToCtrlAlt));
    }
    return this._keyboardMapper;
  }
  validateCurrentKeyboardMapping(keyboardEvent) {
    return;
  }
};

KeyboardLayoutService = __decorateClass([
  __decorateParam(0, INativeKeyboardLayoutService),
  __decorateParam(1, IConfigurationService)
], KeyboardLayoutService);

function createKeyboardMapper(layoutInfo, rawMapping, mapAltGrToCtrlAlt) {
  const _isUSStandard = isUSStandard(layoutInfo);
  if (OS === 1 /* Windows */) {
    return new WindowsKeyboardMapper(_isUSStandard, rawMapping, mapAltGrToCtrlAlt);
  }
  if (!rawMapping || Object.keys(rawMapping).length === 0) {
    return new FallbackKeyboardMapper(mapAltGrToCtrlAlt, OS);
  }
  if (OS === 2 /* Macintosh */) {
    const kbInfo = layoutInfo;
    if (kbInfo.id === "com.apple.keylayout.DVORAK-QWERTYCMD") {
      return new FallbackKeyboardMapper(mapAltGrToCtrlAlt, OS);
    }
  }
  return new MacLinuxKeyboardMapper(_isUSStandard, rawMapping, mapAltGrToCtrlAlt, OS);
}

function isUSStandard(_kbInfo) {
  if (!_kbInfo) {
    return false;
  }
  if (OS === 3 /* Linux */) {
    const kbInfo = _kbInfo;
    const layouts = kbInfo.layout.split(/,/g);
    return layouts[kbInfo.group] === "us";
  }
  if (OS === 2 /* Macintosh */) {
    const kbInfo = _kbInfo;
    return kbInfo.id === "com.apple.keylayout.US";
  }
  if (OS === 1 /* Windows */) {
    const kbInfo = _kbInfo;
    return kbInfo.name === "00000409";
  }
  return false;
}

registerSingleton(IKeyboardLayoutService, KeyboardLayoutService, 1 /* Delayed */);
export { createKeyboardMapper, isUSStandard, KeyboardLayoutService };
