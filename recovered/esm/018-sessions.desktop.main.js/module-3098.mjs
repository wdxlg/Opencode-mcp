// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminalContrib/accessibility/browser/textAreaSyncAddon.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { debounce } from "./module-0250.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITerminalLogService } from "./module-1155.mjs";


// src/vs/workbench/contrib/terminalContrib/accessibility/browser/textAreaSyncAddon.ts
var TextAreaSyncAddon = class extends Disposable {
  constructor(_capabilities, _accessibilityService, _configurationService, _logService) {
    super();
    this._capabilities = _capabilities;
    this._accessibilityService = _accessibilityService;
    this._configurationService = _configurationService;
    this._logService = _logService;
    this._listeners = this._register(new MutableDisposable());
    this._register(Event2.runAndSubscribe(Event2.any(
      this._capabilities.onDidChangeCapabilities,
      this._accessibilityService.onDidChangeScreenReaderOptimized
    ), () => {
      this._refreshListeners();
    }));
  }
  activate(terminal2) {
    this._terminal = terminal2;
    this._refreshListeners();
  }
  _refreshListeners() {
    const commandDetection = this._capabilities.get(2 /* CommandDetection */);
    if (this._shouldBeActive() && commandDetection) {
      if (!this._listeners.value) {
        const textarea = this._terminal?.textarea;
        if (textarea) {
          this._listeners.value = Event2.runAndSubscribe(commandDetection.promptInputModel.onDidChangeInput, () => this._sync(textarea));
        }
      }
    } else {
      this._listeners.clear();
    }
  }
  _shouldBeActive() {
    return this._accessibilityService.isScreenReaderOptimized() || this._configurationService.getValue("terminal.integrated.developer.devMode" /* DevMode */);
  }
  _sync(textArea) {
    const commandCapability = this._capabilities.get(2 /* CommandDetection */);
    if (!commandCapability) {
      return;
    }
    textArea.value = commandCapability.promptInputModel.value;
    textArea.selectionStart = commandCapability.promptInputModel.cursorIndex;
    textArea.selectionEnd = commandCapability.promptInputModel.cursorIndex;
    this._logService.debug(`TextAreaSyncAddon#sync: text changed to "${textArea.value}"`);
  }
};

__decorateClass([
  debounce(50)
], TextAreaSyncAddon.prototype, "_sync", 1);

TextAreaSyncAddon = __decorateClass([
  __decorateParam(1, IAccessibilityService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, ITerminalLogService)
], TextAreaSyncAddon);
export { TextAreaSyncAddon };
