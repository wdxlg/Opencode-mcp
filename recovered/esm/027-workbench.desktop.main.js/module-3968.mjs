// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/extensions/electron-browser/extensionProfileService.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ExtensionIdentifierMap } from "./module-0688.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { RuntimeExtensionsInput } from "./module-3960.mjs";
import { localize } from "./module-0001.mjs";
import { disposableWindowInterval } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { randomPort } from "./module-3961.mjs";
import { ExtensionHostProfiler } from "./module-3967.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IStatusbarService } from "./module-0893.mjs";
import { IProductService } from "./module-0873.mjs";


// src/vs/workbench/contrib/extensions/electron-browser/extensionProfileService.ts
var ExtensionHostProfileService = class extends Disposable {
  constructor(_extensionService, _editorService, _instantiationService, _nativeHostService, _dialogService, _statusbarService, _productService) {
    super();
    this._extensionService = _extensionService;
    this._editorService = _editorService;
    this._instantiationService = _instantiationService;
    this._nativeHostService = _nativeHostService;
    this._dialogService = _dialogService;
    this._statusbarService = _statusbarService;
    this._productService = _productService;
    this._onDidChangeState = this._register(new Emitter());
    this.onDidChangeState = this._onDidChangeState.event;
    this._onDidChangeLastProfile = this._register(new Emitter());
    this.onDidChangeLastProfile = this._onDidChangeLastProfile.event;
    this._unresponsiveProfiles = new ExtensionIdentifierMap();
    this._state = 0 /* None */;
    this.profilingStatusBarIndicatorLabelUpdater = this._register(new MutableDisposable());
    this._profile = null;
    this._profileSession = null;
    this._setState(0 /* None */);
    CommandsRegistry.registerCommand("workbench.action.extensionHostProfiler.stop", () => {
      this.stopProfiling();
      this._editorService.openEditor(RuntimeExtensionsInput.instance, { pinned: true });
    });
  }
  get state() {
    return this._state;
  }
  get lastProfile() {
    return this._profile;
  }
  _setState(state) {
    if (this._state === state) {
      return;
    }
    this._state = state;
    if (this._state === 2 /* Running */) {
      this.updateProfilingStatusBarIndicator(true);
    } else if (this._state === 3 /* Stopping */) {
      this.updateProfilingStatusBarIndicator(false);
    }
    this._onDidChangeState.fire(void 0);
  }
  updateProfilingStatusBarIndicator(visible) {
    this.profilingStatusBarIndicatorLabelUpdater.clear();
    if (visible) {
      const indicator = {
        name: localize(15633, null),
        text: localize(15627, null),
        showProgress: true,
        ariaLabel: localize(15627, null),
        tooltip: localize(15632, null),
        command: "workbench.action.extensionHostProfiler.stop"
      };
      const timeStarted = Date.now();
      const handle2 = disposableWindowInterval(mainWindow, () => {
        this.profilingStatusBarIndicator?.update({ ...indicator, text: localize(15628, null, Math.round(((/* @__PURE__ */ new Date()).getTime() - timeStarted) / 1e3)) });
      }, 1e3);
      this.profilingStatusBarIndicatorLabelUpdater.value = handle2;
      if (!this.profilingStatusBarIndicator) {
        this.profilingStatusBarIndicator = this._statusbarService.addEntry(indicator, "status.profiler", 1 /* RIGHT */);
      } else {
        this.profilingStatusBarIndicator.update(indicator);
      }
    } else {
      if (this.profilingStatusBarIndicator) {
        this.profilingStatusBarIndicator.dispose();
        this.profilingStatusBarIndicator = void 0;
      }
    }
  }
  async startProfiling() {
    if (this._state !== 0 /* None */) {
      return null;
    }
    const inspectPorts = await this._extensionService.getInspectPorts(1 /* LocalProcess */, true);
    if (inspectPorts.length === 0) {
      return this._dialogService.confirm({
        type: "info",
        message: localize(15629, null),
        detail: localize(15630, null, this._productService.nameLong),
        primaryButton: localize(15631, null)
      }).then((res) => {
        if (res.confirmed) {
          this._nativeHostService.relaunch({ addArgs: [`--inspect-extensions=${randomPort()}`] });
        }
      });
    }
    if (inspectPorts.length > 1) {
      console.warn(`There are multiple extension hosts available for profiling. Picking the first one...`);
    }
    this._setState(1 /* Starting */);
    return this._instantiationService.createInstance(ExtensionHostProfiler, inspectPorts[0].host, inspectPorts[0].port).start().then((value2) => {
      this._profileSession = value2;
      this._setState(2 /* Running */);
    }, (err) => {
      onUnexpectedError(err);
      this._setState(0 /* None */);
    });
  }
  stopProfiling() {
    if (this._state !== 2 /* Running */ || !this._profileSession) {
      return;
    }
    this._setState(3 /* Stopping */);
    this._profileSession.stop().then((result) => {
      this._setLastProfile(result);
      this._setState(0 /* None */);
    }, (err) => {
      onUnexpectedError(err);
      this._setState(0 /* None */);
    });
    this._profileSession = null;
  }
  _setLastProfile(profile) {
    this._profile = profile;
    this.lastProfileSavedTo = void 0;
    this._onDidChangeLastProfile.fire(void 0);
  }
  getUnresponsiveProfile(extensionId) {
    return this._unresponsiveProfiles.get(extensionId);
  }
  setUnresponsiveProfile(extensionId, profile) {
    this._unresponsiveProfiles.set(extensionId, profile);
    this._setLastProfile(profile);
  }
};

ExtensionHostProfileService = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, INativeHostService),
  __decorateParam(4, IDialogService),
  __decorateParam(5, IStatusbarService),
  __decorateParam(6, IProductService)
], ExtensionHostProfileService);
export { ExtensionHostProfileService };
