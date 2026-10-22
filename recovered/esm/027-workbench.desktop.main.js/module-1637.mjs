// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/dialogs/common/dialogService.ts
import { Disposable } from "./module-0012.mjs";
import { DialogsModel } from "./module-1636.mjs";
import { severity_default } from "./module-0266.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IDialogService } from "./module-0267.mjs";


// src/vs/workbench/services/dialogs/common/dialogService.ts
var DialogService = class extends Disposable {
  constructor(environmentService, logService) {
    super();
    this.environmentService = environmentService;
    this.logService = logService;
    this.model = this._register(new DialogsModel());
    this.onWillShowDialog = this.model.onWillShowDialog;
    this.onDidShowDialog = this.model.onDidShowDialog;
  }
  skipDialogs() {
    if (this.environmentService.enableSmokeTestDriver) {
      this.logService.warn("DialogService: Dialog requested during smoke test.");
    }
    return this.environmentService.isExtensionDevelopment && !!this.environmentService.extensionTestsLocationURI;
  }
  async confirm(confirmation) {
    if (this.skipDialogs()) {
      this.logService.trace("DialogService: refused to show confirmation dialog in tests.");
      return { confirmed: true };
    }
    const handle2 = this.model.show({ confirmArgs: { confirmation } });
    return await handle2.result;
  }
  async prompt(prompt) {
    if (this.skipDialogs()) {
      throw new Error(`DialogService: refused to show dialog in tests. Contents: ${prompt.message}`);
    }
    const handle2 = this.model.show({ promptArgs: { prompt } });
    const dialogResult = await handle2.result;
    return {
      result: await dialogResult.result,
      checkboxChecked: dialogResult.checkboxChecked
    };
  }
  async input(input) {
    if (this.skipDialogs()) {
      throw new Error("DialogService: refused to show input dialog in tests.");
    }
    const handle2 = this.model.show({ inputArgs: { input } });
    return await handle2.result;
  }
  async info(message, detail2) {
    await this.prompt({ type: severity_default.Info, message, detail: detail2 });
  }
  async warn(message, detail2) {
    await this.prompt({ type: severity_default.Warning, message, detail: detail2 });
  }
  async error(message, detail2) {
    await this.prompt({ type: severity_default.Error, message, detail: detail2 });
  }
  async about() {
    if (this.skipDialogs()) {
      throw new Error("DialogService: refused to show about dialog in tests.");
    }
    const handle2 = this.model.show({});
    await handle2.result;
  }
};

DialogService = __decorateClass([
  __decorateParam(0, IWorkbenchEnvironmentService),
  __decorateParam(1, ILogService)
], DialogService);

registerSingleton(IDialogService, DialogService, 1 /* Delayed */);
export { DialogService };
