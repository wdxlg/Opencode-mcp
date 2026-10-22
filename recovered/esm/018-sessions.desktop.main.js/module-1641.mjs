// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensionManagement/browser/extensionBisect.ts
import { createDecorator } from "./module-0077.mjs";
import { isResolverExtension } from "./module-0688.mjs";
import { areSameExtensions } from "./module-0888.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { ICommandService } from "./module-0087.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0872.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { Categories } from "./module-0847.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IHostService } from "./module-1118.mjs";
import { IExtensionManagementService, IGlobalExtensionEnablementService } from "./module-0874.mjs";
import { IWorkbenchExtensionEnablementService } from "./module-1047.mjs";
import { IProductService } from "./module-0875.mjs";


// src/vs/workbench/services/extensionManagement/browser/extensionBisect.ts
var IExtensionBisectService = createDecorator("IExtensionBisectService");

var BisectState = class _BisectState {
  constructor(extensions, low, high, mid = (low + high) / 2 | 0) {
    this.extensions = extensions;
    this.low = low;
    this.high = high;
    this.mid = mid;
  }
  static fromJSON(raw) {
    if (!raw) {
      return void 0;
    }
    try {
      const data = JSON.parse(raw);
      return new _BisectState(data.extensions, data.low, data.high, data.mid);
    } catch {
      return void 0;
    }
  }
};

var ExtensionBisectService = class {
  constructor(logService, _storageService, _envService) {
    this._storageService = _storageService;
    this._envService = _envService;
    this._disabled = /* @__PURE__ */ new Map();
    const raw = _storageService.get(ExtensionBisectService._storageKey, -1 /* APPLICATION */);
    this._state = BisectState.fromJSON(raw);
    if (this._state) {
      const { mid, high } = this._state;
      for (let i2 = 0; i2 < this._state.extensions.length; i2++) {
        const isDisabled = i2 >= mid && i2 < high;
        this._disabled.set(this._state.extensions[i2], isDisabled);
      }
      logService.warn("extension BISECT active", [...this._disabled]);
    }
  }
  static {
    this._storageKey = "extensionBisectState";
  }
  get isActive() {
    return !!this._state;
  }
  get disabledCount() {
    return this._state ? this._state.high - this._state.mid : -1;
  }
  isDisabledByBisect(extension) {
    if (!this._state) {
      return false;
    }
    if (isResolverExtension(extension.manifest, this._envService.remoteAuthority)) {
      return false;
    }
    if (this._isEnabledInEnv(extension)) {
      return false;
    }
    const disabled = this._disabled.get(extension.identifier.id);
    return disabled ?? false;
  }
  _isEnabledInEnv(extension) {
    return Array.isArray(this._envService.enableExtensions) && this._envService.enableExtensions.some((id2) => areSameExtensions({ id: id2 }, extension.identifier));
  }
  async start(extensions) {
    if (this._state) {
      throw new Error("invalid state");
    }
    const extensionIds = extensions.map((ext) => ext.identifier.id);
    const newState = new BisectState(extensionIds, 0, extensionIds.length, 0);
    this._storageService.store(ExtensionBisectService._storageKey, JSON.stringify(newState), -1 /* APPLICATION */, 1 /* MACHINE */);
    await this._storageService.flush();
  }
  async next(seeingBad) {
    if (!this._state) {
      throw new Error("invalid state");
    }
    if (seeingBad && this._state.mid === 0 && this._state.high === this._state.extensions.length) {
      return { bad: true, id: "" };
    }
    if (this._state.low === this._state.high - 1) {
      await this.reset();
      return { id: this._state.extensions[this._state.low], bad: seeingBad };
    }
    const nextState = new BisectState(
      this._state.extensions,
      seeingBad ? this._state.low : this._state.mid,
      seeingBad ? this._state.mid : this._state.high
    );
    this._storageService.store(ExtensionBisectService._storageKey, JSON.stringify(nextState), -1 /* APPLICATION */, 1 /* MACHINE */);
    await this._storageService.flush();
    return void 0;
  }
  async reset() {
    this._storageService.remove(ExtensionBisectService._storageKey, -1 /* APPLICATION */);
    await this._storageService.flush();
  }
};

ExtensionBisectService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IWorkbenchEnvironmentService)
], ExtensionBisectService);

registerSingleton(IExtensionBisectService, ExtensionBisectService, 1 /* Delayed */);

var ExtensionBisectUi = class {
  constructor(contextKeyService, _extensionBisectService, _notificationService, _commandService) {
    this._extensionBisectService = _extensionBisectService;
    this._notificationService = _notificationService;
    this._commandService = _commandService;
    if (_extensionBisectService.isActive) {
      ExtensionBisectUi.ctxIsBisectActive.bindTo(contextKeyService).set(true);
      this._showBisectPrompt();
    }
  }
  static {
    this.ctxIsBisectActive = new RawContextKey("isExtensionBisectActive", false);
  }
  _showBisectPrompt() {
    const goodPrompt = {
      label: localize(22927, null),
      run: () => this._commandService.executeCommand("extension.bisect.next", false)
    };
    const badPrompt = {
      label: localize(22936, null),
      run: () => this._commandService.executeCommand("extension.bisect.next", true)
    };
    const stop = {
      label: "Stop Bisect",
      run: () => this._commandService.executeCommand("extension.bisect.stop")
    };
    const message = this._extensionBisectService.disabledCount === 1 ? localize(22920, null) : localize(22919, null, this._extensionBisectService.disabledCount);
    this._notificationService.prompt(
      Severity2.Info,
      message,
      [goodPrompt, badPrompt, stop],
      { sticky: true, priority: 3 /* URGENT */ }
    );
  }
};

ExtensionBisectUi = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IExtensionBisectService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, ICommandService)
], ExtensionBisectUi);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(
  ExtensionBisectUi,
  3 /* Restored */
);

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "extension.bisect.start",
      title: localize2(22938, "Start Extension Bisect"),
      category: Categories.Help,
      f1: true,
      precondition: ExtensionBisectUi.ctxIsBisectActive.negate(),
      menu: {
        id: MenuId.ViewContainerTitle,
        when: ContextKeyExpr.equals("viewContainer", "workbench.view.extensions"),
        group: "2_enablement",
        order: 4
      }
    });
  }
  async run(accessor) {
    const dialogService = accessor.get(IDialogService);
    const hostService = accessor.get(IHostService);
    const extensionManagement = accessor.get(IExtensionManagementService);
    const extensionEnablementService = accessor.get(IWorkbenchExtensionEnablementService);
    const extensionsBisect = accessor.get(IExtensionBisectService);
    const extensions = (await extensionManagement.getInstalled(1 /* User */)).filter((ext) => extensionEnablementService.isEnabled(ext));
    const res = await dialogService.confirm({
      message: localize(22929, null),
      detail: localize(22922, null, 2 + Math.log2(extensions.length) | 0),
      primaryButton: localize(22930, null)
    });
    if (res.confirmed) {
      await extensionsBisect.start(extensions);
      hostService.reload();
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "extension.bisect.next",
      title: localize2(22937, "Continue Extension Bisect"),
      category: Categories.Help,
      f1: true,
      precondition: ExtensionBisectUi.ctxIsBisectActive
    });
  }
  async run(accessor, seeingBad) {
    const dialogService = accessor.get(IDialogService);
    const hostService = accessor.get(IHostService);
    const bisectService = accessor.get(IExtensionBisectService);
    const productService = accessor.get(IProductService);
    const extensionEnablementService = accessor.get(IGlobalExtensionEnablementService);
    const commandService = accessor.get(ICommandService);
    if (!bisectService.isActive) {
      return;
    }
    if (seeingBad === void 0) {
      const goodBadStopCancel = await this._checkForBad(dialogService, bisectService);
      if (goodBadStopCancel === null) {
        return;
      }
      seeingBad = goodBadStopCancel;
    }
    if (seeingBad === void 0) {
      await bisectService.reset();
      hostService.reload();
      return;
    }
    const done = await bisectService.next(seeingBad);
    if (!done) {
      hostService.reload();
      return;
    }
    if (done.bad) {
      await dialogService.info(
        localize(22926, null),
        localize(22924, null, productService.nameShort)
      );
    } else {
      const res = await dialogService.confirm({
        type: Severity2.Info,
        message: localize(22926, null),
        primaryButton: localize(22935, null),
        cancelButton: localize(22921, null),
        detail: localize(22923, null, done.id),
        checkbox: { label: localize(22925, null), checked: true }
      });
      if (res.checkboxChecked) {
        await extensionEnablementService.disableExtension({ id: done.id }, void 0);
      }
      if (res.confirmed) {
        await commandService.executeCommand("workbench.action.openIssueReporter", done.id);
      }
    }
    await bisectService.reset();
    hostService.reload();
  }
  async _checkForBad(dialogService, bisectService) {
    const { result } = await dialogService.prompt({
      type: Severity2.Info,
      message: localize(22928, null),
      detail: localize(22918, null, bisectService.disabledCount),
      buttons: [
        {
          label: localize(22933, null),
          run: () => false
          // good now
        },
        {
          label: localize(22931, null),
          run: () => true
          // bad
        },
        {
          label: localize(22934, null),
          run: () => void 0
          // stop
        }
      ],
      cancelButton: {
        label: localize(22932, null),
        run: () => null
        // cancel
      }
    });
    return result;
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "extension.bisect.stop",
      title: localize2(22939, "Stop Extension Bisect"),
      category: Categories.Help,
      f1: true,
      precondition: ExtensionBisectUi.ctxIsBisectActive
    });
  }
  async run(accessor) {
    const extensionsBisect = accessor.get(IExtensionBisectService);
    const hostService = accessor.get(IHostService);
    await extensionsBisect.reset();
    hostService.reload();
  }
});
export { IExtensionBisectService, BisectState, ExtensionBisectService, ExtensionBisectUi };
