// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/electron-browser/parts/dialogs/dialog.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { Lazy } from "./module-0028.mjs";
import { BrowserDialogHandler } from "./module-3900.mjs";
import { NativeDialogHandler } from "./module-3901.mjs";
import { createNativeAboutDialogDetails } from "./module-3902.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ILogService } from "./module-0095.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IProductService } from "./module-0875.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/electron-browser/parts/dialogs/dialog.contribution.ts
var DialogHandlerContribution = class extends Disposable {
  constructor(configurationService, dialogService, logService, instantiationService, productService, clipboardService, nativeHostService, environmentService) {
    super();
    this.configurationService = configurationService;
    this.dialogService = dialogService;
    this.productService = productService;
    this.nativeHostService = nativeHostService;
    this.environmentService = environmentService;
    this.browserImpl = new Lazy(() => instantiationService.createInstance(BrowserDialogHandler));
    this.nativeImpl = new Lazy(() => new NativeDialogHandler(logService, nativeHostService, clipboardService));
    this.model = this.dialogService.model;
    this._register(this.model.onWillShowDialog(() => {
      if (!this.currentDialog) {
        this.processDialogs();
      }
    }));
    this.processDialogs();
  }
  static {
    this.ID = "workbench.contrib.dialogHandler";
  }
  async processDialogs() {
    while (this.model.dialogs.length) {
      this.currentDialog = this.model.dialogs[0];
      let result = void 0;
      try {
        if (this.currentDialog.args.confirmArgs) {
          const args2 = this.currentDialog.args.confirmArgs;
          result = this.useCustomDialog || args2?.confirmation.custom ? await this.browserImpl.value.confirm(args2.confirmation) : await this.nativeImpl.value.confirm(args2.confirmation);
        } else if (this.currentDialog.args.inputArgs) {
          const args2 = this.currentDialog.args.inputArgs;
          result = await this.browserImpl.value.input(args2.input);
        } else if (this.currentDialog.args.promptArgs) {
          const args2 = this.currentDialog.args.promptArgs;
          result = this.useCustomDialog || args2?.prompt.custom ? await this.browserImpl.value.prompt(args2.prompt) : await this.nativeImpl.value.prompt(args2.prompt);
        } else {
          const aboutDialogDetails = createNativeAboutDialogDetails(this.productService, await this.nativeHostService.getOSProperties());
          if (this.useCustomDialog) {
            await this.browserImpl.value.about(aboutDialogDetails.title, aboutDialogDetails.details, aboutDialogDetails.detailsToCopy);
          } else {
            await this.nativeImpl.value.about(aboutDialogDetails.title, aboutDialogDetails.details, aboutDialogDetails.detailsToCopy);
          }
        }
      } catch (error) {
        result = error;
      }
      this.currentDialog.close(result);
      this.currentDialog = void 0;
    }
  }
  get useCustomDialog() {
    return this.configurationService.getValue("window.dialogStyle") === "custom" || // Use the custom dialog while driven so that the driver can interact with it
    !!this.environmentService.enableSmokeTestDriver;
  }
};

DialogHandlerContribution = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IDialogService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IProductService),
  __decorateParam(5, IClipboardService),
  __decorateParam(6, INativeHostService),
  __decorateParam(7, IWorkbenchEnvironmentService)
], DialogHandlerContribution);

registerWorkbenchContribution2(
  DialogHandlerContribution.ID,
  DialogHandlerContribution,
  WorkbenchPhase.BlockStartup
  // Block to allow for dialogs to show before restore finished
);
export { DialogHandlerContribution };
